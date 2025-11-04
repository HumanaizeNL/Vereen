#!/usr/bin/env node

/**
 * Test script for UC2 backend functionality
 * Tests the analysis of client data for herindicatie decisions
 *
 * Usage: node scripts/test-uc2-analysis.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testUC2Analysis() {
  console.log('🚀 Testing UC2 Backend Analysis Functionality\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Load mock data
    console.log('\n📦 Step 1: Loading mock data...');
    const loadResponse = await fetch(`${BASE_URL}/api/dev/load-mock-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear_existing: true }),
    });

    if (!loadResponse.ok) {
      throw new Error(`Failed to load mock data: ${loadResponse.statusText}`);
    }

    const loadResult = await loadResponse.json();
    console.log('✅ Mock data loaded:');
    console.log(`   - Clients: ${loadResult.loaded.clients}`);
    console.log(`   - Notes: ${loadResult.loaded.notes}`);
    console.log(`   - Measures: ${loadResult.loaded.measures}`);
    console.log(`   - Incidents: ${loadResult.loaded.incidents}`);
    console.log(`   - Client IDs: ${loadResult.client_ids.join(', ')}`);

    // Step 2: Analyze Client 1 (Casus 3 - Psychiatric problems)
    console.log('\n📊 Step 2: Analyzing Client 1 (Casus 3 - Psychiatric problems)...');
    const analyzeClient1Response = await fetch(`${BASE_URL}/api/uc2/analyze-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'CL-2023-001',
        include_trends: true,
        include_patterns: true,
      }),
    });

    if (!analyzeClient1Response.ok) {
      throw new Error(`Failed to analyze client 1: ${analyzeClient1Response.statusText}`);
    }

    const analysis1 = await analyzeClient1Response.json();
    console.log('\n✅ Analysis for Client 1:');
    console.log(`   Client: ${analysis1.client_name}`);
    console.log(`   Current Profile: ${analysis1.current_profile}`);
    console.log(`   Provider: ${analysis1.provider}`);
    console.log(`\n   📈 Data Summary:`);
    console.log(`      - Notes: ${analysis1.data_summary.notes_count}`);
    console.log(`      - Measures: ${analysis1.data_summary.measures_count}`);
    console.log(`      - Incidents: ${analysis1.data_summary.incidents_count}`);

    if (analysis1.trends) {
      console.log(`\n   📉 Trends:`);
      if (analysis1.trends.katz_adl) {
        console.log(`      - Katz-ADL: ${analysis1.trends.katz_adl.direction} (${analysis1.trends.katz_adl.first_value} → ${analysis1.trends.katz_adl.last_value})`);
      }
      if (analysis1.trends.behavioral) {
        console.log(`      - Behavioral (NPI): ${analysis1.trends.behavioral.direction} (${analysis1.trends.behavioral.first_value} → ${analysis1.trends.behavioral.last_value})`);
      }
    }

    if (analysis1.patterns) {
      console.log(`\n   🔍 Patterns:`);
      console.log(`      - Key themes:`);
      analysis1.patterns.key_themes.slice(0, 3).forEach((theme) => {
        console.log(`         • ${theme.theme}: ${theme.count} entries`);
      });
      if (analysis1.patterns.incident_frequency) {
        console.log(`      - Incidents: ${analysis1.patterns.incident_frequency.total_count} total`);
      }
      if (analysis1.patterns.critical_issues?.length > 0) {
        console.log(`      - Critical issues: ${analysis1.patterns.critical_issues.length}`);
      }
    }

    if (analysis1.complexity_assessment) {
      console.log(`\n   🎯 Complexity Assessment:`);
      console.log(`      - Level: ${analysis1.complexity_assessment.complexity_level}`);
      console.log(`      - Factors: ${analysis1.complexity_assessment.factors.length}`);
      analysis1.complexity_assessment.factors.forEach((factor) => {
        console.log(`         • ${factor}`);
      });
    }

    if (analysis1.herindicatie_recommendation) {
      console.log(`\n   💡 Herindicatie Recommendation:`);
      console.log(`      - Action: ${analysis1.herindicatie_recommendation.advised_action}`);
      console.log(`      - Confidence: ${(analysis1.herindicatie_recommendation.confidence * 100).toFixed(0)}%`);
      console.log(`      - Suggested Profile: ${analysis1.herindicatie_recommendation.suggested_profile}`);
      console.log(`      - Rationale:`);
      analysis1.herindicatie_recommendation.rationale.forEach((reason) => {
        console.log(`         • ${reason}`);
      });
    }

    // Step 3: Analyze Client 2 (Casus 4 - Cognitive decline after CVA)
    console.log('\n\n📊 Step 3: Analyzing Client 2 (Casus 4 - Cognitive decline after CVA)...');
    const analyzeClient2Response = await fetch(`${BASE_URL}/api/uc2/analyze-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'CL-2023-002',
        include_trends: true,
        include_patterns: true,
      }),
    });

    if (!analyzeClient2Response.ok) {
      throw new Error(`Failed to analyze client 2: ${analyzeClient2Response.statusText}`);
    }

    const analysis2 = await analyzeClient2Response.json();
    console.log('\n✅ Analysis for Client 2:');
    console.log(`   Client: ${analysis2.client_name}`);
    console.log(`   Current Profile: ${analysis2.current_profile}`);
    console.log(`   Provider: ${analysis2.provider}`);
    console.log(`\n   📈 Data Summary:`);
    console.log(`      - Notes: ${analysis2.data_summary.notes_count}`);
    console.log(`      - Measures: ${analysis2.data_summary.measures_count}`);
    console.log(`      - Incidents: ${analysis2.data_summary.incidents_count}`);

    if (analysis2.trends) {
      console.log(`\n   📉 Trends:`);
      if (analysis2.trends.katz_adl) {
        console.log(`      - Katz-ADL: ${analysis2.trends.katz_adl.direction} (${analysis2.trends.katz_adl.first_value} → ${analysis2.trends.katz_adl.last_value})`);
      }
      if (analysis2.trends.cognitive) {
        console.log(`      - Cognitive (MMSE): ${analysis2.trends.cognitive.direction} (${analysis2.trends.cognitive.first_value} → ${analysis2.trends.cognitive.last_value})`);
      }
      if (analysis2.trends.behavioral) {
        console.log(`      - Behavioral (NPI): ${analysis2.trends.behavioral.direction} (${analysis2.trends.behavioral.first_value} → ${analysis2.trends.behavioral.last_value})`);
      }
    }

    if (analysis2.patterns) {
      console.log(`\n   🔍 Patterns:`);
      console.log(`      - Key themes:`);
      analysis2.patterns.key_themes.slice(0, 3).forEach((theme) => {
        console.log(`         • ${theme.theme}: ${theme.count} entries`);
      });
      if (analysis2.patterns.incident_frequency) {
        console.log(`      - Incidents: ${analysis2.patterns.incident_frequency.total_count} total`);
      }
      if (analysis2.patterns.critical_issues?.length > 0) {
        console.log(`      - Critical issues: ${analysis2.patterns.critical_issues.length}`);
      }
    }

    if (analysis2.complexity_assessment) {
      console.log(`\n   🎯 Complexity Assessment:`);
      console.log(`      - Level: ${analysis2.complexity_assessment.complexity_level}`);
      console.log(`      - Factors: ${analysis2.complexity_assessment.factors.length}`);
      analysis2.complexity_assessment.factors.forEach((factor) => {
        console.log(`         • ${factor}`);
      });
    }

    if (analysis2.herindicatie_recommendation) {
      console.log(`\n   💡 Herindicatie Recommendation:`);
      console.log(`      - Action: ${analysis2.herindicatie_recommendation.advised_action}`);
      console.log(`      - Confidence: ${(analysis2.herindicatie_recommendation.confidence * 100).toFixed(0)}%`);
      console.log(`      - Suggested Profile: ${analysis2.herindicatie_recommendation.suggested_profile}`);
      console.log(`      - Rationale:`);
      analysis2.herindicatie_recommendation.rationale.forEach((reason) => {
        console.log(`         • ${reason}`);
      });
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('=' .repeat(60));
    console.log('\n📋 Summary:');
    console.log('   - Loaded realistic mock data based on casus 3 and 4');
    console.log('   - Analyzed 2 complex care cases');
    console.log('   - Generated herindicatie recommendations');
    console.log('\n🎯 Backend is ready for UC2 functionality!\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    process.exit(1);
  }
}

// Run the test
testUC2Analysis();
