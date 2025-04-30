import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import { uploadToS3, type S3Config } from './utils/s3Utils.ts'
import { type TextractConfig } from './utils/textractUtils.ts'
import { IncidentPopulatorFactory } from './templates/IncidentPopulatorFactory.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID') || ''
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY') || ''
    const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1'

    // Get AI service configuration
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
    const AI_SERVICE = Deno.env.get('AI_SERVICE') || 'anthropic' // Default to anthropic if not specified
    
    // Select the appropriate API key based on the service
    const aiApiKey = AI_SERVICE === 'openai' ? OPENAI_API_KEY : ANTHROPIC_API_KEY
    
    if (!aiApiKey) {
      return new Response(
        JSON.stringify({ error: `API key for ${AI_SERVICE} is not configured` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('VITE_SUPABASE_URL') ?? '',
      Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const body = await req.json()
    const { record } = body

    if (!record || !record.id) {
      return new Response(
        JSON.stringify({ error: 'No valid incident record found in request' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { uploadStatusUpdateError } = await updateIncidentStatus(supabaseAdmin, record.id, "Processing (Upload)")
    if (uploadStatusUpdateError) {
      console.error('Error updating incident status:', uploadStatusUpdateError)
      return new Response(
        JSON.stringify({ error: uploadStatusUpdateError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
    // Fetch the user's profile to get their organization
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization')
      .eq('id', record.uploaded_by)
      .single()
    
    if (profileError) {
      console.warn(`Error fetching user profile: ${profileError.message}. Using default populator.`)
    }
    
    const organization = profileData?.organization || null
    const incidentPopulator = IncidentPopulatorFactory.createIncidentPopulator(organization, aiApiKey, AI_SERVICE)
    
    // Analyze PDF using AWS Textract
    const textractConfig: TextractConfig = {
      region: AWS_REGION,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }

    const { bucketName, key } = parseS3Url(record.pdfUrl)
    const s3Object = {
      bucket: bucketName,
      key: key
    }
    
    const result = await incidentPopulator.runOCR(textractConfig, s3Object)

    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('created_by', record.uploaded_by)
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return new Response(
        JSON.stringify({ error: `Error fetching categories: ${categoriesError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const { classificationStatusUploadError } = await updateIncidentStatus(supabaseAdmin, record.id, "Processing (Classification)")
    if (classificationStatusUploadError) {
      console.error('Error updating incident status:', classificationStatusUploadError)
      return new Response(
        JSON.stringify({ error: classificationStatusUploadError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }
    
    const updatedIncident = await incidentPopulator.populateIncidentDetails(result.data, record, categoriesData)

    const { error } = await supabaseAdmin
      .from('incidents')
      .update(updatedIncident)
      .eq('id', record.id)
      .select()

    if (error) {
      console.error('Error updating incident status:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'Status was updated successfully',
        jobId: result.jobId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function updateIncidentStatus(supabaseAdmin: any, incidentId: string, status: string) {
  return await supabaseAdmin
    .from('incidents')
    .update({ status: status })
    .eq('id', incidentId)
    .select()
}

function parseS3Url(url: string): { bucketName: string, key: string } {
  // Regular expression to match S3 URLs
  // Capturing groups: 
  // 1. Protocol (http or https)
  // 2. Bucket name
  // 3. Key (everything after the bucket in the path)
  const regex = /^(https?):\/\/([^.]+)\.s3\.(?:[^/]+)\.amazonaws\.com\/(.+)$/;
  
  // Alternative format: https://s3.region.amazonaws.com/bucket/key
  const altRegex = /^(https?):\/\/s3\.(?:[^/]+)\.amazonaws\.com\/([^/]+)\/(.+)$/;
  
  let match = url.match(regex);
  
  if (match) {
    return {
      bucketName: match[2],
      key: match[3]
    };
  }
  
  // Try the alternative format
  match = url.match(altRegex);
  
  if (match) {
    return {
      bucketName: match[2],
      key: match[3]
    };
  }
  
  throw Error(`unable to parse S3 URL: ${url}`)
}