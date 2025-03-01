import express, { Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Define TypeScript interfaces for the medical data model
interface ITreatment {
  drugName: string;
  dosage?: string;
  frequency?: string;
  sideEffects?: string[];
  contraindications?: string[];
}

interface IMedicalData extends Document {
  diseaseName: string;
  symptoms: string[];
  causes?: string[];
  riskFactors?: string[];
  treatments?: ITreatment[];
  preventionMethods?: string[];
  relatedConditions?: string[];
  metadata: {
    source?: string;
    lastUpdated?: Date;
    confidence?: number;
  };
}

// Define Mongoose schema
const MedicalDataSchema = new Schema<IMedicalData>({
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
    source: String,
    lastUpdated: { type: Date, default: Date.now },
    confidence: Number
  }
}, { timestamps: true });

const MedicalData = mongoose.model<IMedicalData>('MedicalData', MedicalDataSchema);

// Initialize LLM for response generation
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.4
});

// Prompt template for generating medical responses
const treatmentRecommendationPrompt = PromptTemplate.fromTemplate(`
You are a medical information assistant. Your role is to provide relevant information based on patient data and medical knowledge.
DO NOT give direct medical advice or prescriptions. Always recommend consulting with a healthcare professional.

Patient Information:
- Medical History: {medicalHistory}
- Current Medications: {currentMedications}
- Known Allergies: {knownAllergies}
- Current Symptoms: {currentSymptoms}

Relevant Medical Information from our database:
{relevantMedicalData}

Based on this information, provide a clear, informative response that:
1. Acknowledges the symptoms and concerns.
2. Provides educational information about possible related conditions.
3. Explains general treatment approaches commonly used for these symptoms/conditions.
4. Emphasizes the importance of professional medical consultation.
5. Provides general wellness recommendations if appropriate.

Your response should be informative, compassionate, and educational while avoiding direct diagnosis or treatment recommendations.
`);

// Function to search for relevant medical data
async function searchMedicalDatabase(patientData: {
  symptoms?: string[];
  diseases?: string[];
  drugs?: string[];
}): Promise<IMedicalData[]> {
  try {
    const { symptoms = [], diseases = [], drugs = [] } = patientData;
    const query: any = { $or: [] };
    
    if (symptoms.length) query.$or.push({ symptoms: { $in: symptoms } });
    if (diseases.length) query.$or.push({ diseaseName: { $in: diseases } });
    if (drugs.length) query.$or.push({ 'treatments.drugName': { $in: drugs } });
    
    if (!query.$or.length) return [];
    
    return await MedicalData.find(query).limit(5);
  } catch (error) {
    console.error('Error searching medical database:', error);
    return [];
  }
}

// Format medical data for LLM input
function formatMedicalDataForLLM(results: IMedicalData[]): string {
  if (!results.length) {
    return 'No specific medical information found matching the patients profile.';
  }
  
  return results.map((result, index) => `
CONDITION ${index + 1}: ${result.diseaseName}
- Symptoms: ${result.symptoms.join(', ')}
${result.causes?.length ? `- Causes: ${result.causes.join(', ')}` : ''}
- Treatments: ${result.treatments?.map(t => `  * ${t.drugName} (${t.dosage || 'N/A'}, ${t.frequency || 'N/A'})`).join('\n') || 'Not available'}
${result.preventionMethods?.length ? `- Prevention: ${result.preventionMethods.join(', ')}` : ''}
  `).join('\n');
}

// Express route for handling patient queries
async function setupQueryEndpoint(): Promise<void> {
  const app = express();
  
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicalAssistant', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as mongoose.ConnectOptions);
  
  console.log('Connected to MongoDB');
  
  app.use(express.json());
  
  // Query endpoint
  app.post('/api/medical-query', async (req: Request, res: Response) => {
    try {
      const patientData = req.body;
      if (!patientData) return res.status(400).json({ error: 'Patient data is required' });
      
      const { medicalHistory = [], currentMedications = [], knownAllergies = [], currentSymptoms = [], diseases = [] } = patientData;
      
      const searchResults = await searchMedicalDatabase({
        symptoms: currentSymptoms,
        diseases: [...diseases, ...medicalHistory.map((item: any) => item.name)],
        drugs: currentMedications.map((med: any) => med.name || med)
      });
      
      const formattedMedicalData = formatMedicalDataForLLM(searchResults);
      
      const promptTemplate = await treatmentRecommendationPrompt.format({
        medicalHistory: medicalHistory.map((item: any) => `${item.name} (${item.type})`).join(', ') || 'None',
        currentMedications: currentMedications.map((med: any) => med.name).join(', ') || 'None',
        knownAllergies: knownAllergies.join(', ') || 'None',
        currentSymptoms: currentSymptoms.join(', ') || 'None',
        relevantMedicalData: formattedMedicalData
      });
      
      const result = await llm.invoke(promptTemplate);
      res.json({ response: result.content, relatedConditions: searchResults.map(r => r.diseaseName) });
    } catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ error: 'An error occurred while processing your query' });
    }
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export { setupQueryEndpoint };
