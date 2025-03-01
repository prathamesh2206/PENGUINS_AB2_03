import axios from 'axios';
import cheerio from 'cheerio';
import mongoose, { Schema, Document } from 'mongoose';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

interface Treatment {
  drugName: string;
  dosage: string;
  frequency: string;
  sideEffects: string[];
  contraindications: string[];
}

interface MedicalDataDocument extends Document {
  diseaseName: string;
  symptoms: string[];
  causes: string[];
  riskFactors: string[];
  treatments: Treatment[];
  preventionMethods: string[];
  relatedConditions: string[];
  metadata: {
    source: string;
    lastUpdated: Date;
    confidence: number;
  };
}

const MedicalDataSchema = new Schema<MedicalDataDocument>({
  diseaseName: { type: String, required: true, index: true },
  symptoms: [{ type: String, index: true }],
  causes: [String],
  riskFactors: [String],
  treatments: [{
    drugName: { type: String, index: true },
    dosage: String,
    frequency: String,
    sideEffects: [String],
    contraindications: [String]
  }],
  preventionMethods: [String],
  relatedConditions: [{ type: String, index: true }],
  metadata: {
    source: { type: String, default: 'web-scrape' },
    lastUpdated: { type: Date, default: Date.now },
    confidence: { type: Number, default: 0.85 }
  }
}, { timestamps: true });

MedicalDataSchema.index({ diseaseName: 'text', symptoms: 'text', 'treatments.drugName': 'text' });
const MedicalData = mongoose.model<MedicalDataDocument>('MedicalData', MedicalDataSchema);

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.2
});

const medicalDataExtractionPrompt = PromptTemplate.fromTemplate(`
You are a medical data extraction specialist. Extract structured information from the following scraped medical content.
Format the response as a valid JSON object with the following structure:
{
  "diseaseName": "Full name of the condition",
  "symptoms": ["symptom1", "symptom2"],
  "causes": ["cause1", "cause2"],
  "riskFactors": ["factor1", "factor2"],
  "treatments": [{
    "drugName": "Drug name",
    "dosage": "Typical dosage",
    "frequency": "How often to take",
    "sideEffects": ["side effect1", "side effect2"],
    "contraindications": ["contraindication1", "contraindication2"]
  }],
  "preventionMethods": ["method1", "method2"],
  "relatedConditions": ["condition1", "condition2"]
}

Content:
{rawContent}
`);

async function scrapeWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const content = $('#main-content').text() || $('article').text() || $('body').text();
    return content.trim();
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function processRawContent(content: string): Promise<MedicalDataDocument | null> {
  try {
    const promptTemplate = await medicalDataExtractionPrompt.format({ rawContent: content });
    const result = await llm.invoke(promptTemplate);
    // @ts-ignore
    const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || result.content.match(/{[\s\S]*?}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error("Failed to extract JSON from LLM response");
    }
  } catch (error) {
    console.error("Error processing content:", error);
    return null;
  }
}

async function storeProcessedData(data: MedicalDataDocument): Promise<MedicalDataDocument | null> {
  try {
    const existingEntry = await MedicalData.findOne({ diseaseName: data.diseaseName });
    if (existingEntry) {
      Object.assign(existingEntry, data);
      existingEntry.metadata.lastUpdated = new Date();
      await existingEntry.save();
      console.log(`Updated entry for ${data.diseaseName}`);
      return existingEntry;
    } else {
      const newEntry = new MedicalData(data);
      await newEntry.save();
      console.log(`Created new entry for ${data.diseaseName}`);
      return newEntry;
    }
  } catch (error) {
    console.error("Error storing data:", error);
    return null;
  }
}

async function ingestMedicalData(urlsToScrape: string[]): Promise<void> {
  await mongoose.connect('mongodb://localhost:27017/medicalAssistant', {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log("Connected to MongoDB");
  for (const url of urlsToScrape) {
    console.log(`Processing ${url}...`);
    const rawContent = await scrapeWebsite(url);
    if (!rawContent) continue;
    const processedData = await processRawContent(rawContent);
    if (!processedData) continue;
    await storeProcessedData(processedData);
  }
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

export { ingestMedicalData };
