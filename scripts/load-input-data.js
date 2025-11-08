#!/usr/bin/env node

/**
 * Script to load input CSV data for INPUT-CASUS-A
 * Usage: node scripts/load-input-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contextDir = path.join(__dirname, '..', 'context');
const clientId = 'INPUT-CASUS-A';
const baseUrl = 'http://localhost:3000';

async function uploadFile(filePath, fileType) {
  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const formData = new FormData();
  const blob = new Blob([fileContent], { type: 'text/csv' });
  formData.append('file', blob, fileName);
  formData.append('client_id', clientId);

  try {
    console.log(`📤 Uploading ${fileName}...`);
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    console.log(`   ✓ Uploaded ${fileName}: ${JSON.stringify(result.summary)}`);
    return result;
  } catch (error) {
    console.error(`   ✗ Failed to upload ${fileName}:`, error.message);
    return null;
  }
}

async function loadInputData() {
  console.log('🚀 Loading INPUT test data into the application...\n');

  const files = [
    { path: path.join(contextDir, 'input-client.csv'), type: 'clients' },
    { path: path.join(contextDir, 'input-notes.csv'), type: 'notes' },
    { path: path.join(contextDir, 'input-measures.csv'), type: 'measures' },
    { path: path.join(contextDir, 'input-incidents.csv'), type: 'incidents' },
  ];

  let successCount = 0;
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      const result = await uploadFile(file.path, file.type);
      if (result) successCount++;
    } else {
      console.warn(`⚠️  File not found: ${file.path}`);
    }
  }

  console.log(`\n✅ Loaded ${successCount}/${files.length} files successfully!`);
  console.log(`\nYou can now test herindicatie evaluatie with client ID: ${clientId}`);
  console.log(`Visit ${baseUrl}/uc2 to test the application.`);
}

loadInputData().catch((error) => {
  console.error('❌ Failed to load input data:', error);
  process.exit(1);
});
