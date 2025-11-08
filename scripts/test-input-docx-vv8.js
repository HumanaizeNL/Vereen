/**
 * Test script to ingest INPUT.docx and evaluate against VV8 criteria
 *
 * This script:
 * 1. Ingests the INPUT.docx file via the /api/ingest endpoint
 * 2. Evaluates the ingested data against VV8 criteria
 * 3. Generates a comprehensive report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const CLIENT_ID = process.env.TEST_CLIENT_ID || 'TEST-INPUT-DOCX-001';
const INPUT_DOCX_PATH = path.join(__dirname, '../context/INPUT.docx');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSubSection(title) {
  log(`\n${title}`, 'cyan');
  log('-'.repeat(40), 'cyan');
}

async function checkServerRunning() {
  logSection('Step 1: Check Server Status');

  try {
    // Try a simple request to the ingest endpoint (will fail but tells us server is up)
    const response = await fetch(`${API_BASE}/api/ingest`, {
      method: 'GET',
    });
    // Any response means server is running (even 405 Method Not Allowed)
    log('✓ Server is running', 'green');
    return true;
  } catch (error) {
    log('✗ Server is not running or not reachable', 'red');
    log(`  Error: ${error.message}`, 'red');
    log('\n  Please start the server with: pnpm run dev', 'yellow');
    return false;
  }
}

async function ingestDocument() {
  logSection('Step 2: Ingest INPUT.docx');

  // Check if file exists
  if (!fs.existsSync(INPUT_DOCX_PATH)) {
    log(`✗ File not found: ${INPUT_DOCX_PATH}`, 'red');
    return null;
  }

  log(`Reading file: ${INPUT_DOCX_PATH}`, 'blue');
  log(`Client ID: ${CLIENT_ID}`, 'blue');

  try {
    // Create form data
    const form = new FormData();
    form.append('client_id', CLIENT_ID);
    form.append('file', fs.createReadStream(INPUT_DOCX_PATH), 'INPUT.docx');
    form.append('dataset_label', 'VV8 Test Case');

    // Send request
    const response = await fetch(`${API_BASE}/api/ingest`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`✗ Ingestion failed: ${response.status} ${response.statusText}`, 'red');
      log(`  Response: ${errorText}`, 'red');
      return null;
    }

    const result = await response.json();

    log('✓ Document ingested successfully', 'green');

    // Display ingestion results
    logSubSection('Ingestion Results');
    console.log(JSON.stringify(result, null, 2));

    if (result.warnings && result.warnings.length > 0) {
      logSubSection('Warnings');
      result.warnings.forEach(w => {
        log(`  ⚠ ${w.filename}: ${w.message}`, 'yellow');
      });
    }

    return result;
  } catch (error) {
    log(`✗ Error during ingestion: ${error.message}`, 'red');
    console.error(error);
    return null;
  }
}

async function evaluateVV8Criteria() {
  logSection('Step 3: Evaluate VV8 Criteria');

  log(`Evaluating client: ${CLIENT_ID}`, 'blue');

  try {
    const response = await fetch(`${API_BASE}/api/vv8/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log(`✗ VV8 assessment failed: ${response.status} ${response.statusText}`, 'red');
      log(`  Response: ${errorText}`, 'red');
      return null;
    }

    const assessment = await response.json();

    log('✓ VV8 assessment completed', 'green');

    return assessment;
  } catch (error) {
    log(`✗ Error during VV8 assessment: ${error.message}`, 'red');
    console.error(error);
    return null;
  }
}

function analyzeVV8Results(assessment) {
  logSection('Step 4: Analyze VV8 Assessment Results');

  if (!assessment || !assessment.criteria) {
    log('✗ No assessment data available', 'red');
    return;
  }

  // Overall summary
  logSubSection('Overall Summary');
  const summary = assessment.summary || {};
  log(`  Total Criteria: 8`, 'blue');
  log(`  ✓ Voldoet (Meets): ${summary.voldoet || 0}`, 'green');
  log(`  ⚠ Toegenomen Behoefte (Increased Need): ${summary.toegenomen_behoefte || 0}`, 'yellow');
  log(`  ✗ Niet Voldoet (Doesn't Meet): ${summary.niet_voldoet || 0}`, 'red');
  log(`  ⚠ Verslechterd (Deteriorated): ${summary.verslechterd || 0}`, 'red');
  log(`  ? Onvoldoende Bewijs (Insufficient Evidence): ${summary.onvoldoende_bewijs || 0}`, 'yellow');

  // Recommendation
  logSubSection('Recommendation');
  if (assessment.action) {
    const actionColors = {
      continue: 'green',
      monitor: 'yellow',
      reassess: 'yellow',
      urgent_reassess: 'red',
    };
    const color = actionColors[assessment.action] || 'blue';
    log(`  Action: ${assessment.action.toUpperCase()}`, color);
  }
  if (assessment.message) {
    log(`  Message: ${assessment.message}`, 'blue');
  }

  // Individual criteria
  logSubSection('Criteria Details');

  const statusSymbols = {
    voldoet: '✓',
    toegenomen_behoefte: '⚠',
    niet_voldoet: '✗',
    verslechterd: '✗✗',
    onvoldoende_bewijs: '?',
  };

  const statusColors = {
    voldoet: 'green',
    toegenomen_behoefte: 'yellow',
    niet_voldoet: 'red',
    verslechterd: 'red',
    onvoldoende_bewijs: 'yellow',
  };

  assessment.criteria.forEach((criterion, index) => {
    const symbol = statusSymbols[criterion.status] || '?';
    const color = statusColors[criterion.status] || 'reset';

    log(`\n${index + 1}. ${criterion.name}`, 'bright');
    log(`   Status: ${symbol} ${criterion.status}`, color);
    log(`   Confidence: ${(criterion.confidence * 100).toFixed(0)}%`, 'blue');

    if (criterion.argumentation) {
      log(`   Reasoning: ${criterion.argumentation.substring(0, 150)}...`, 'blue');
    }

    if (criterion.evidence && criterion.evidence.length > 0) {
      log(`   Evidence: ${criterion.evidence.length} items found`, 'cyan');
    } else {
      log(`   Evidence: No evidence found`, 'yellow');
    }
  });
}

function generateReport(ingestResult, assessment) {
  logSection('Step 5: Generate Comprehensive Report');

  const report = {
    timestamp: new Date().toISOString(),
    client_id: CLIENT_ID,
    input_file: 'INPUT.docx',
    ingestion: ingestResult,
    vv8_assessment: assessment,
  };

  const reportPath = path.join(__dirname, `../reports/vv8-assessment-${CLIENT_ID}-${Date.now()}.json`);

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`✓ Report saved to: ${reportPath}`, 'green');

  return reportPath;
}

async function main() {
  log('Starting INPUT.docx VV8 Evaluation Test', 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'blue');

  // Step 1: Check server
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    process.exit(1);
  }

  // Step 2: Ingest document
  const ingestResult = await ingestDocument();
  if (!ingestResult) {
    log('\n✗ Test failed at ingestion step', 'red');
    process.exit(1);
  }

  // Step 3: Evaluate VV8
  const assessment = await evaluateVV8Criteria();
  if (!assessment) {
    log('\n✗ Test failed at VV8 assessment step', 'red');
    process.exit(1);
  }

  // Step 4: Analyze results
  analyzeVV8Results(assessment);

  // Step 5: Generate report
  const reportPath = generateReport(ingestResult, assessment);

  // Summary
  logSection('Test Summary');
  log('✓ All steps completed successfully', 'green');
  log(`\nReport location: ${reportPath}`, 'cyan');

  // Exit recommendations
  logSubSection('Next Steps');
  if (assessment.action === 'urgent_reassess') {
    log('  ⚠ URGENT: Immediate reassessment required', 'red');
  } else if (assessment.action === 'reassess') {
    log('  ⚠ Reassessment recommended within 3 months', 'yellow');
  } else if (assessment.action === 'monitor') {
    log('  ⚠ Increased monitoring recommended', 'yellow');
  } else {
    log('  ✓ Situation stable, continue current care', 'green');
  }
}

// Run the test
main().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
