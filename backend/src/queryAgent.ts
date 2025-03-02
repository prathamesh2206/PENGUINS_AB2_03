// Query Agent - Updated to use DeepSeek R1 instead of OpenAI

import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import mongoose from 'mongoose';
import { ChatDeepSeek } from '@langchain/deepseek';

// MongoDB Schema (should match the one in dataIngestionAgent.ts)
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

// Create text indexes for better search
MedicalSchema.index({ disease: 'text', 'symptoms': 'text' });

const MedicalData = mongoose.model('MedicalData', MedicalSchema);

// Initialize DeepSeek LLM
const llm = new ChatDeepSeek({
  modelName: "deepseek-ai/deepseek-llm-67b-chat", // Using the 67B model - adjust as needed
  temperature: 0.4, // Slightly higher temperature for more diverse responses
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_BASE_URL,
});

// Search database for relevant medical information
async function searchMedicalDatabase(patientData: any): Promise<any[]> {
  try {
    const { symptoms = [], diseases = [], medications = [] } = patientData;
    
    // Build search queries
    let query: any = {};
    
    if (symptoms.length > 0 || diseases.length > 0 || medications.length > 0) {
      const conditions = [];
      
      if (symptoms.length > 0) {
        conditions.push({ symptoms: { $in: symptoms } });
      }
      
      if (diseases.length > 0) {
        conditions.push({ disease: { $in: diseases } });
      }
      
      if (medications.length > 0) {
        conditions.push({ 'medications.name': { $in: medications } });
      }
      
      query = { $or: conditions };
    }
    
    // Execute search
    let results = await MedicalData.find(query).limit(5);
    
    // If no direct matches, try text search
    if (results.length === 0) {
      const searchTerms = [...symptoms, ...diseases, ...medications].join(' ');
      if (searchTerms.trim()) {
        results = await MedicalData.find(
          { $text: { $search: searchTerms } },
          { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(3);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Database search error:", error);
    return [];
  }
}

// Format medical data for the LLM prompt
function formatMedicalData(results: any[]): string {
  if (!results || results.length === 0) {
    return "No specific medical information found in our database.";
  }
  
  let formatted = "RELEVANT MEDICAL INFORMATION:\n\n";
  
  results.forEach((result, index) => {
    formatted += `CONDITION ${index + 1}: ${result.disease}\n`;
    
    if (result.symptoms && result.symptoms.length > 0) {
      formatted += `- Symptoms: ${result.symptoms.join(', ')}\n`;
    }
    
    if (result.treatments && result.treatments.length > 0) {
      formatted += `- Treatments: ${result.treatments.join(', ')}\n`;
    }
    
    if (result.medications && result.medications.length > 0) {
      formatted += "- Medications:\n";
      result.medications.forEach((med: any) => {
        formatted += `  * ${med.name}`;
        if (med.dosage) formatted += ` - Dosage: ${med.dosage}`;
        formatted += '\n';
        
        if (med.sideEffects && med.sideEffects.length > 0) {
          formatted += `    Side effects: ${med.sideEffects.join(', ')}\n`;
        }
      });
    }
    
    formatted += '\n';
  });
  
  return formatted;
}

// Generate response using DeepSeek LLM
async function generateResponse(patientData: any, medicalInfo: string): Promise<string> {
  try {
    const { 
      medicalHistory = [],
      currentMedications = [],
      knownAllergies = [],
      currentSymptoms = []
    } = patientData;
    
    const result = await llm.call([
      {
        role: "system",
        content: "You are a medical information assistant. Your role is to provide relevant information based on patient data and medical knowledge. DO NOT give direct medical advice or prescriptions. Always recommend consulting with a healthcare professional."
      },
      {
        role: "user",
        content: `
Patient Information:
- Medical History: ${Array.isArray(medicalHistory) ? medicalHistory.join(', ') : medicalHistory || 'None provided'}
- Current Medications: ${Array.isArray(currentMedications) ? currentMedications.join(', ') : currentMedications || 'None provided'}
- Known Allergies: ${Array.isArray(knownAllergies) ? knownAllergies.join(', ') : knownAllergies || 'None provided'}
- Current Symptoms: ${Array.isArray(currentSymptoms) ? currentSymptoms.join(', ') : currentSymptoms || 'None provided'}

Relevant Medical Information from our database:
${medicalInfo}

Based on this information, provide a clear, informative response that:
1. Acknowledges the symptoms and concerns
2. Provides educational information about possible related conditions
3. Explains general treatment approaches that are commonly used for these symptoms/conditions
4. Emphasizes the importance of professional medical consultation
5. Provides general wellness recommendations if appropriate
`
      }
    ]);
    
    return result.content;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I encountered an error processing your medical query. Please try again later.";
  }
}

// Setup Express endpoint for queries
export async function setupQueryEndpoint(): Promise<void> {
  const app = express();
  app.use(express.json());
  
  // Query endpoint
  //@ts-ignore
  app.post('/api/medical-query', async (req: Request, res: Response) => {
    try {
      const patientData = req.body;
      
      if (!patientData) {
        return res.status(400).json({ error: 'Patient data is required' });
      }
      
      // Search database
      const searchResults = await searchMedicalDatabase({
        symptoms: patientData.currentSymptoms || [],
        diseases: patientData.diseases || patientData.medicalHistory || [],
        medications: patientData.currentMedications || []
      });
      
      // Format data for LLM
      const formattedData = formatMedicalData(searchResults);
      
      // Generate response
      const response = await generateResponse(patientData, formattedData);
      
      res.json({
        response: response,
        relatedConditions: searchResults.map(r => r.disease)
      });
    } catch (error) {
      console.error("Error processing query:", error);
      res.status(500).json({ error: 'An error occurred while processing your query' });
    }
  });
  
  // If not already using the main Express app, start it
  if (!process.env.USING_MAIN_EXPRESS_APP) {
    const PORT = process.env.QUERY_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Query Agent running on port ${PORT}`);
    });
  }
}