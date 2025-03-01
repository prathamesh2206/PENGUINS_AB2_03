import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { ingestMedicalData } from './dataIngestionAgent';
import { setupQueryEndpoint } from './queryAgent';

const app = express();
app.use(bodyParser.json());

// Route to start the medical data ingestion process
app.post('/api/ingest-medical-data', async (req: Request, res: Response) => {
  try {
    const { urls }: { urls?: string[] } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of URLs to scrape' });
    }

    res.json({ message: `Started ingestion process for ${urls.length} URLs` });
    
    // Run the ingestion process asynchronously
    ingestMedicalData(urls).catch(error => {
      console.error('Error in ingestion process:', error);
    });
  } catch (error) {
    console.error('Error handling ingestion request:', error);
    res.status(500).json({ error: 'Failed to start ingestion process' });
  }
});

// Health check endpoint to verify if the server is running
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

async function initializeApp() {
  try {
    // Connect to the MongoDB database
    await mongoose.connect('mongodb://localhost:27017/medicalAssistant', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as mongoose.ConnectOptions);
    console.log('Connected to MongoDB');

    // Setup query endpoint for medical data queries
    await setupQueryEndpoint();

    // Start the Express server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Medical Assistant backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp();