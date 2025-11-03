/**
 * Script to automatically load sample CSV data into the application
 * Usage: node scripts/load-sample-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleDataDir = path.join(__dirname, '..', 'sample-data');
const clientId = 'C123';
const baseUrl = 'http://localhost:3000';

async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);

  const formData = new FormData();
  const blob = new Blob([fileContent], { type: 'text/csv' });
  formData.append('file', blob, fileName);
  formData.append('client_id', clientId);

  try {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    console.log(`✓ Uploaded ${fileName}:`, result.summary);
    return result;
  } catch (error) {
    console.error(`✗ Failed to upload ${fileName}:`, error.message);
    throw error;
  }
}

async function loadSampleData() {
  console.log('Loading sample data into the application...\n');

  const files = [
    path.join(sampleDataDir, 'clients.csv'),
    path.join(sampleDataDir, 'notes.csv'),
    path.join(sampleDataDir, 'measures.csv'),
    path.join(sampleDataDir, 'incidents.csv'),
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      await uploadFile(file);
    } else {
      console.warn(`⚠ File not found: ${file}`);
    }
  }

  console.log('\n✓ Sample data loaded successfully!');
  console.log(`\nYou can now visit ${baseUrl}/uc2 to test the application.`);
}

loadSampleData().catch((error) => {
  console.error('Failed to load sample data:', error);
  process.exit(1);
});
