// Data Ingestion Agent - Updated to use DeepSeek R1 instead of OpenAI

import axios from 'axios';
import cheerio from 'cheerio';
import mongoose from 'mongoose';
import { ChatDeepSeek } from '@langchain/deepseek';

// MongoDB Schema
const MedicalSchema = new mongoose.Schema({
  disease: { type: String, required: true, index: true },
  symptoms: [String],
  treatments: [String],
  medications: [{
    name: String,
    dosage: String,
    sideEffects: [String]
  }],
  updatedAt: { type: Date, default: Date.now }
});

const MedicalData = mongoose.model('MedicalData', MedicalSchema);

// Initialize DeepSeek LLM instead of OpenAI
const llm = new ChatDeepSeek({
  modelName: "deepseek-ai/deepseek-llm-67b-chat", // Using the 67B model - adjust as needed
  temperature: 0,
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE_URL,
});

// Scrape website
async function scrapeWebsite(url: string): Promise<string> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  return $('main').text() || $('article').text() || $('body').text();
}

// Process content with DeepSeek LLM
async function processContent(content: string): Promise<any> {
  const result = await llm.call([
    {
      role: "system",
      content: "You are a medical data extraction specialist. Extract structured information from medical content."
    },
    {
      role: "user",
      content: `Extract medical information from this text and format as JSON:
      {
        "disease": "disease name",
        "symptoms": ["symptom1", "symptom2"],
        "treatments": ["treatment1", "treatment2"],
        "medications": [
          {
            "name": "medication name",
            "dosage": "typical dosage",
            "sideEffects": ["side effect1", "side effect2"]
          }
        ]
      }
      
      TEXT:
      ${content}`
    }
  ]);
  
  // Extract JSON from response
  try {
    const jsonMatch  = result.content.match(/{[\s\S]*?}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error("Error parsing JSON from LLM response:", error);
    return null;
  }
}

// Save to database
async function saveToDatabase(data: any): Promise<string> {
  // Check if exists
  const existing = await MedicalData.findOne({ disease: data.disease });
  
  if (existing) {
    // Update
    Object.assign(existing, data);
    existing.updatedAt = new Date();
    await existing.save();
    return `Updated ${data.disease}`;
  } else {
    // Create new
    const newEntry = new MedicalData(data);
    await newEntry.save();
    return `Added ${data.disease}`;
  }
}

// Main function
export async function ingestMedicalData(urls: string[]): Promise<void> {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicalAssistant', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      } as mongoose.ConnectOptions);
    }
    
    console.log(`Starting ingestion of ${urls.length} URLs`);
    
    for (const url of urls) {
      try {
        console.log(`Processing ${url}...`);
        const content = await scrapeWebsite(url);
        
        if (!content || content.trim().length === 0) {
          console.log(`No content found at ${url}`);
          continue;
        }
        
        const processedData = await processContent(content);
        
        if (!processedData) {
          console.log(`Failed to process content from ${url}`);
          continue;
        }
        
        const result = await saveToDatabase(processedData);
        console.log(result);
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
      }
    }
    
    console.log("Ingestion process completed");
  } catch (error) {
    console.error("Error in ingestion process:", error);
    throw error;
  }
}