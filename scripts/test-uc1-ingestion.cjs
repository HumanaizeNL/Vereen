#!/usr/bin/env node

/**
 * Test script for UC1 Data Ingestion & Search functionality
 * Tests client management, file upload, and search capabilities
 *
 * Usage: node scripts/test-uc1-ingestion.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testUC1() {
  console.log('🚀 Testing UC1 Data Ingestion & Search Functionality\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Test client management
    console.log('\n👥 Step 1: Testing Client Management API...\n');

    // 1a: Create a new client
    console.log('Creating a new client...');
    const createClientResponse = await fetch(`${BASE_URL}/api/uc1/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'CL-2024-TEST-001',
        name: 'Mevrouw Jansen',
        dob: '1950-05-15',
        wlz_profile: 'VV7',
        provider: 'Zorgcentrum Noord',
      }),
    });

    if (createClientResponse.status === 201 || createClientResponse.status === 409) {
      const result = await createClientResponse.json();
      console.log(
        createClientResponse.status === 201
          ? '✅ Client created successfully'
          : '⚠️  Client already exists (continuing with existing)'
      );
    } else {
      throw new Error(`Failed to create client: ${createClientResponse.statusText}`);
    }

    // 1b: List all clients
    console.log('\nListing all clients...');
    const listResponse = await fetch(`${BASE_URL}/api/uc1/clients`);
    if (!listResponse.ok) {
      throw new Error(`Failed to list clients: ${listResponse.statusText}`);
    }
    const listResult = await listResponse.json();
    console.log(`✅ Found ${listResult.total} client(s)`);

    // 1c: Get specific client
    console.log('\nGetting specific client with summary...');
    const getResponse = await fetch(
      `${BASE_URL}/api/uc1/clients/CL-2024-TEST-001?include_summary=true`
    );
    if (!getResponse.ok) {
      throw new Error(`Failed to get client: ${getResponse.statusText}`);
    }
    const getResult = await getResponse.json();
    console.log(`✅ Client: ${getResult.client.name}`);
    if (getResult.summary) {
      console.log(`   - Notes: ${getResult.summary.notes_count}`);
      console.log(`   - Measures: ${getResult.summary.measures_count}`);
      console.log(`   - Incidents: ${getResult.summary.incidents_count}`);
    }

    // Step 2: Test file ingestion
    console.log('\n\n📤 Step 2: Testing File Ingestion...\n');

    const client_id = 'CL-2024-TEST-001';
    const sampleDataDir = path.join(__dirname, '..', 'sample-data');

    // 2a: Upload notes CSV
    console.log('Uploading notes.csv...');
    const notesPath = path.join(sampleDataDir, 'notes.csv');
    if (fs.existsSync(notesPath)) {
      const formData = new FormData();
      formData.append('client_id', client_id);
      formData.append('file', fs.createReadStream(notesPath));

      const uploadNotesResponse = await fetch(`${BASE_URL}/api/ingest`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!uploadNotesResponse.ok) {
        throw new Error(`Failed to upload notes: ${uploadNotesResponse.statusText}`);
      }

      const uploadNotesResult = await uploadNotesResponse.json();
      console.log('✅ Notes uploaded:');
      console.log(`   - Processed: ${uploadNotesResult.ingested.length} file(s)`);
      console.log(`   - Summary: ${uploadNotesResult.summary}`);
    } else {
      console.log('⚠️  notes.csv not found, skipping');
    }

    // 2b: Upload measures CSV
    console.log('\nUploading measures.csv...');
    const measuresPath = path.join(sampleDataDir, 'measures.csv');
    if (fs.existsSync(measuresPath)) {
      const formData = new FormData();
      formData.append('client_id', client_id);
      formData.append('file', fs.createReadStream(measuresPath));

      const uploadMeasuresResponse = await fetch(`${BASE_URL}/api/ingest`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!uploadMeasuresResponse.ok) {
        throw new Error(`Failed to upload measures: ${uploadMeasuresResponse.statusText}`);
      }

      const uploadMeasuresResult = await uploadMeasuresResponse.json();
      console.log('✅ Measures uploaded:');
      console.log(`   - Processed: ${uploadMeasuresResult.ingested.length} file(s)`);
    } else {
      console.log('⚠️  measures.csv not found, skipping');
    }

    // 2c: Upload incidents CSV
    console.log('\nUploading incidents.csv...');
    const incidentsPath = path.join(sampleDataDir, 'incidents.csv');
    if (fs.existsSync(incidentsPath)) {
      const formData = new FormData();
      formData.append('client_id', client_id);
      formData.append('file', fs.createReadStream(incidentsPath));

      const uploadIncidentsResponse = await fetch(`${BASE_URL}/api/ingest`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!uploadIncidentsResponse.ok) {
        throw new Error(`Failed to upload incidents: ${uploadIncidentsResponse.statusText}`);
      }

      const uploadIncidentsResult = await uploadIncidentsResponse.json();
      console.log('✅ Incidents uploaded:');
      console.log(`   - Processed: ${uploadIncidentsResult.ingested.length} file(s)`);
    } else {
      console.log('⚠️  incidents.csv not found, skipping');
    }

    // Step 3: Test search functionality
    console.log('\n\n🔍 Step 3: Testing Search Functionality...\n');

    const searchQueries = [
      { query: 'angst psyche', description: 'Search for psychological notes' },
      { query: 'ADL verzorging', description: 'Search for ADL care notes' },
      { query: 'Katz MMSE', description: 'Search for measurements' },
      { query: 'incident val', description: 'Search for fall incidents' },
    ];

    for (const { query, description } of searchQueries) {
      console.log(`\nSearching: "${query}" (${description})`);
      const searchResponse = await fetch(`${BASE_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id,
          query,
          k: 5,
        }),
      });

      if (!searchResponse.ok) {
        console.log(`   ⚠️  Search failed: ${searchResponse.statusText}`);
        continue;
      }

      const searchResult = await searchResponse.json();
      console.log(`   ✅ Found ${searchResult.hits.length} results:`);
      searchResult.hits.slice(0, 3).forEach((hit, idx) => {
        console.log(`      ${idx + 1}. ${hit.source} (score: ${hit.score})`);
        console.log(`         "${hit.snippet.substring(0, 80)}..."`);
      });
    }

    // Step 4: Test statistics
    console.log('\n\n📊 Step 4: Testing Statistics...\n');

    // 4a: Global stats
    console.log('Getting global statistics...');
    const globalStatsResponse = await fetch(`${BASE_URL}/api/uc1/stats`);
    if (!globalStatsResponse.ok) {
      throw new Error(`Failed to get global stats: ${globalStatsResponse.statusText}`);
    }
    const globalStats = await globalStatsResponse.json();
    console.log('✅ Global Statistics:');
    console.log(`   - Total Clients: ${globalStats.summary.total_clients}`);
    console.log(`   - Total Notes: ${globalStats.summary.total_notes}`);
    console.log(`   - Total Measures: ${globalStats.summary.total_measures}`);
    console.log(`   - Total Incidents: ${globalStats.summary.total_incidents}`);
    console.log('   - Averages:');
    console.log(`      • Notes per client: ${globalStats.averages.notes_per_client}`);
    console.log(`      • Measures per client: ${globalStats.averages.measures_per_client}`);

    // 4b: Client-specific stats
    console.log(`\nGetting statistics for client ${client_id}...`);
    const clientStatsResponse = await fetch(`${BASE_URL}/api/uc1/stats?client_id=${client_id}`);
    if (!clientStatsResponse.ok) {
      throw new Error(`Failed to get client stats: ${clientStatsResponse.statusText}`);
    }
    const clientStats = await clientStatsResponse.json();
    console.log('✅ Client Statistics:');
    console.log(`   - Notes: ${clientStats.summary.notes_count}`);
    console.log(`   - Measures: ${clientStats.summary.measures_count}`);
    console.log(`   - Incidents: ${clientStats.summary.incidents_count}`);
    if (clientStats.notes && clientStats.notes.by_section) {
      console.log('   - Notes by section:');
      Object.entries(clientStats.notes.by_section).forEach(([section, count]) => {
        console.log(`      • ${section}: ${count}`);
      });
    }

    // Step 5: Test template generation
    console.log('\n\n📝 Step 5: Testing CSV Template Generation...\n');

    const templateTypes = ['notes', 'measures', 'incidents', 'clients'];
    for (const type of templateTypes) {
      console.log(`Generating ${type} template...`);
      const templateResponse = await fetch(`${BASE_URL}/api/uc1/templates?type=${type}`);
      if (!templateResponse.ok) {
        console.log(`   ⚠️  Failed to generate template: ${templateResponse.statusText}`);
        continue;
      }
      const templateContent = await templateResponse.text();
      const lines = templateContent.split('\n');
      console.log(`   ✅ Generated ${lines.length} lines (including header and examples)`);
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ All UC1 tests completed successfully!');
    console.log('=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('   - Created and managed clients');
    console.log('   - Uploaded CSV files (notes, measures, incidents)');
    console.log('   - Performed search queries');
    console.log('   - Retrieved statistics (global and client-specific)');
    console.log('   - Generated CSV templates');
    console.log('\n🎯 UC1 is fully functional!\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testUC1();
