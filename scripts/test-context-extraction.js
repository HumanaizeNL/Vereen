#!/usr/bin/env node

// Test script for herindicatie context extraction
// Tests PDF/DOCX extraction and context search functionality

import { extractAllContextDocuments, searchContextChunks, getRelevantContext } from '../lib/ai/context-extractor.js';

console.log('🧪 Testing Herindicatie Context Extraction\n');

async function testExtraction() {
  console.log('📚 Step 1: Extracting all context documents...\n');

  const chunks = await extractAllContextDocuments();

  if (chunks.length === 0) {
    console.error('❌ No chunks extracted! Check if files exist in herindicatie_context/');
    process.exit(1);
  }

  console.log(`✅ Successfully extracted ${chunks.length} chunks\n`);

  // Statistics
  const fileStats = chunks.reduce((acc, chunk) => {
    if (!acc[chunk.filename]) {
      acc[chunk.filename] = { count: 0, chars: 0 };
    }
    acc[chunk.filename].count++;
    acc[chunk.filename].chars += chunk.content.length;
    return acc;
  }, {});

  console.log('📊 Statistics per document:');
  for (const [filename, stats] of Object.entries(fileStats)) {
    console.log(`   ${filename}: ${stats.count} chunks, ${stats.chars} characters`);
  }

  console.log('\n---\n');

  // Test keyword search
  console.log('🔍 Step 2: Testing keyword search...\n');

  const keywords = ['indicatiestelling', 'VV8', 'zorgbehoefte'];
  console.log(`   Keywords: ${keywords.join(', ')}`);

  const results = searchContextChunks(chunks, keywords, 3);

  console.log(`   Found ${results.length} relevant chunks\n`);

  for (let i = 0; i < results.length; i++) {
    const chunk = results[i];
    console.log(`   Result ${i + 1}: ${chunk.filename} (chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks})`);
    console.log(`   Preview: ${chunk.content.substring(0, 150)}...\n`);
  }

  console.log('---\n');

  // Test criterion-based context retrieval
  console.log('🎯 Step 3: Testing criterion-based context retrieval...\n');

  const testCriterion = {
    label: 'ADL functies',
    description: 'Cliënt heeft beperkingen in ADL functies zoals wassen, kleden, eten',
  };

  console.log(`   Criterion: ${testCriterion.label}`);
  console.log(`   Description: ${testCriterion.description}\n`);

  const relevantContext = getRelevantContext(chunks, testCriterion, 2);

  if (relevantContext) {
    console.log('   ✅ Found relevant context:');
    console.log(`   Length: ${relevantContext.length} characters`);
    console.log(`   Preview:\n${relevantContext.substring(0, 300)}...\n`);
  } else {
    console.log('   ⚠️  No relevant context found for this criterion\n');
  }

  console.log('---\n');

  // Test another criterion
  console.log('🎯 Step 4: Testing another criterion (toegenomen zorgbehoefte)...\n');

  const testCriterion2 = {
    label: 'Toegenomen zorgbehoefte',
    description: 'Er zijn signalen van toegenomen zorgbehoefte bij de cliënt',
  };

  console.log(`   Criterion: ${testCriterion2.label}`);
  console.log(`   Description: ${testCriterion2.description}\n`);

  const relevantContext2 = getRelevantContext(chunks, testCriterion2, 2);

  if (relevantContext2) {
    console.log('   ✅ Found relevant context:');
    console.log(`   Length: ${relevantContext2.length} characters`);
    console.log(`   Preview:\n${relevantContext2.substring(0, 300)}...\n`);
  } else {
    console.log('   ⚠️  No relevant context found for this criterion\n');
  }

  console.log('---\n');
  console.log('✅ All tests completed successfully!\n');
}

// Run tests
testExtraction().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
