
import { 
  GetDocumentAnalysisCommand, 
  StartDocumentAnalysisCommand, 
  TextractClient
} from 'npm:@aws-sdk/client-textract';

export interface TextractConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface TextractJobResult {
  jobId: string;
  data: any;
}

export interface S3Object {
  bucket: string;
  key: string;
}

/**
 * Starts a Textract job to detect text in a document stored in S3
 * @param config - Textract configuration parameters
 * @param s3Object - The S3 object to process
 * @returns Promise resolving to the Textract job ID
 */
export async function startTextractJob(
  config: TextractConfig, 
  s3Object: S3Object
): Promise<string> {
  const textractClient = new TextractClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const startCommand = new StartDocumentAnalysisCommand({
    DocumentLocation: {
      S3Object: {
        Bucket: s3Object.bucket,
        Name: s3Object.key,
      }
    },
    FeatureTypes: ["FORMS"],
  });

  const startResponse = await textractClient.send(startCommand);
  const jobId = startResponse.JobId;
  
  if (!jobId) {
    throw new Error("Failed to start Textract job - no JobId returned");
  }
  
  return jobId;
}

/**
 * Polls a Textract job until completion and returns the results
 * @param config - Textract configuration parameters
 * @param jobId - The Textract job ID to poll
 * @param maxAttempts - Maximum number of polling attempts
 * @param pollingIntervalMs - Interval between polling attempts in milliseconds
 * @returns Promise resolving to the Textract job results
 */
export async function pollTextractJob(
  config: TextractConfig,
  jobId: string,
  maxAttempts: number = 600,
  pollingIntervalMs: number = 1000
): Promise<TextractJobResult> {
  const textractClient = new TextractClient({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  
  let jobComplete = false;
  let attempt = 0;
  
  while (!jobComplete && attempt < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollingIntervalMs));
    attempt++;
    
    // Check job status
    const getCommand = new GetDocumentAnalysisCommand({
      JobId: jobId
    });
    
    const getResponse = await textractClient.send(getCommand);
    
    if (getResponse.JobStatus === "SUCCEEDED") {
      jobComplete = true;
      
      let blocks = getResponse.Blocks || [];
      let nextToken = getResponse.NextToken;

      // Get additional results if paginated
      while (nextToken) {
        const nextPageCommand = new GetDocumentAnalysisCommand({
          JobId: jobId,
          NextToken: nextToken
        });
        
        const nextPageResponse = await textractClient.send(nextPageCommand);
        blocks = blocks.concat(nextPageResponse.Blocks || []);
        nextToken = nextPageResponse.NextToken;
      }
      
      const textractResult = processTextractFormData(blocks);
      return {
        jobId,
        data: textractResult.formData
      };
    } else if (getResponse.JobStatus === "FAILED") {
      throw new Error(`Textract job failed: ${getResponse.StatusMessage || "No error message provided"}`);
    }
  }
  
  if (!jobComplete) {
    throw new Error(`Textract job timed out after ${maxAttempts} attempts`);
  }
  
  throw new Error("Unexpected error in Textract job polling");
}

interface FormField {
   key: string;
   value: string;
   confidence: number;
   pageNumber: number;
 }

/**
 * Processes Textract Form data
 * @param blocks - The Textract blocks to process
 * @returns Processed form data results
 */
function processTextractFormData(blocks) {
  const formFields: FormField[] = [];
  const keyValueSets = blocks.filter(block => block.BlockType === "KEY_VALUE_SET");
  
  const keyBlocks = keyValueSets.filter(block => 
    block.EntityTypes && block.EntityTypes.includes("KEY")
  );
  
  keyBlocks.forEach(keyBlock => {
    // Find the key text by following relationships to WORD blocks
    let keyText = "";
    const keyWordIds = findRelatedBlockIds(blocks, keyBlock, "CHILD");
    keyWordIds.forEach(wordId => {
      const wordBlock = blocks.find(block => block.Id === wordId);
      if (wordBlock && wordBlock.Text) {
        keyText += wordBlock.Text + " ";
      }
    });
    keyText = keyText.trim();
    
    // Find the related value block
    const valueBlockIds = findRelatedBlockIds(blocks, keyBlock, "VALUE");
    if (valueBlockIds.length > 0) {
      const valueBlockId = valueBlockIds[0];
      const valueBlock = blocks.find(block => block.Id === valueBlockId);
      
      if (valueBlock) {
        // Find the value text by following relationships to WORD blocks
        let valueText = "";
        const valueWordIds = findRelatedBlockIds(blocks, valueBlock, "CHILD");
        valueWordIds.forEach(wordId => {
          const wordBlock = blocks.find(block => block.Id === wordId);
          if (wordBlock && wordBlock.Text) {
            valueText += wordBlock.Text + " ";
          }
        });
        valueText = valueText.trim();
        
        const pageNumber = keyBlock.Page || 0;
        const confidence = Math.min(
          keyBlock.Confidence || 0, 
          valueBlock.Confidence || 0
        );
        
        formFields.push({
          key: keyText,
          value: valueText,
          confidence,
          pageNumber
        });
      }
    }
  });
  
  // Create a form data object for easier lookup
  const formData = formFields.reduce((acc, field) => {
    acc[field.key] = field.value;
    return acc;
  }, {});
  
  return {
    formFields,
    formData
  };
}

// Helper function to find related block IDs by relationship type
function findRelatedBlockIds(blocks, block, relationType) {
  if (!block.Relationships) return [];
  
  const relationship = block.Relationships.find(rel => rel.Type === relationType);
  if (!relationship || !relationship.Ids) return [];
  
  return relationship.Ids;
}
