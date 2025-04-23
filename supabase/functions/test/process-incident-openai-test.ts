
// This imported is needed to load the .env file:
import "https://deno.land/x/dotenv/load.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.23.0";

// Setup the Supabase client configuration
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
};

// Configure OpenAI service environment
Deno.env.set("AI_SERVICE", "openai");

// Test the creation and functionality of the Supabase client
const testClientCreation = async () => {
  var client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options);

  // Check if the Supabase URL and key are provided
  if (!supabaseUrl) throw new Error('supabaseUrl is required.')
  if (!supabaseKey) throw new Error('supabaseKey is required.')

  // Test a simple query to the database
  const { data: table_data, error: table_error } = await client.from('incidents').select('*').limit(1);
  if (table_error) {
    throw new Error('Invalid Supabase client: ' + table_error.message);
  }
  assert(table_data, "Data should be returned from the query.");
};

const testProcessIncident = async () => {
  var client: SupabaseClient = createClient(supabaseUrl, supabaseKey, options);

  // Invoke the 'process-incident' function with a parameter
  const { data: func_data, error: func_error } = await client.functions.invoke('process-incident', {
    body: { 
      id: 'test-id',
      file_path: "test/file/path/test.pdf",
      uploaded_by: "test-user-id",
    }
  });

  // Check for errors from the function invocation
  if (func_error) {
    throw new Error('Invalid response: ' + func_error.message);
  }

  // Log the response from the function
  console.log(JSON.stringify(func_data, null, 2));

  // Assert that the function returned the expected result
  assertEquals(func_data.message, 'Status was updated successfully');
};

// Register and run the tests
Deno.test("OpenAI Client Creation Test", testClientCreation);
Deno.test("Process-incident with OpenAI Function Test", testProcessIncident);
