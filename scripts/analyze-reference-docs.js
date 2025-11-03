import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeDocx(filepath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analyzing: ${path.basename(filepath)}`);
  console.log('='.repeat(80));

  try {
    const buffer = fs.readFileSync(filepath);
    const result = await mammoth.extractRawText({ buffer });
    console.log('Result:', result);
    const text = result.value || result.text || '';

    console.log('\nFull Text Content:');
    console.log('-'.repeat(80));
    console.log(text);
    console.log('-'.repeat(80));

    // Analyze structure
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log(`\nTotal lines: ${lines.length}`);
    console.log(`\nFirst 20 lines (structure analysis):`);
    lines.slice(0, 20).forEach((line, idx) => {
      console.log(`${idx + 1}. ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });

    // Try to identify sections
    console.log('\n\nIdentified Sections:');
    const sections = [];
    lines.forEach((line, idx) => {
      // Look for section headers (lines that might be titles)
      if (line.length < 100 && !line.endsWith('.') && !line.includes(':')) {
        if (line.match(/^[A-Z]/) || line.match(/^\d+\./)) {
          sections.push({ lineNumber: idx + 1, text: line });
        }
      }
    });

    sections.forEach(section => {
      console.log(`Line ${section.lineNumber}: ${section.text}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function extractToFile(filepath, outputPath) {
  try {
    const buffer = fs.readFileSync(filepath);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || '';

    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log(`Extracted: ${path.basename(filepath)} -> ${path.basename(outputPath)}`);
    console.log(`Length: ${text.length} characters`);

    return text;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function main() {
  const contextDir = path.join(__dirname, '..', 'context');
  const outputDir = path.join(__dirname, '..', 'context');

  console.log('Extracting reference documents...\n');

  const casus3Text = await extractToFile(
    path.join(contextDir, 'casus 3 meerzorg.docx'),
    path.join(outputDir, 'casus-3-extracted.txt')
  );

  const casus4Text = await extractToFile(
    path.join(contextDir, 'casus 4 meerzorg.docx'),
    path.join(outputDir, 'casus-4-extracted.txt')
  );

  console.log('\n✓ Extraction complete!');
  console.log('\nCheck the extracted files:');
  console.log('  - context/casus-3-extracted.txt');
  console.log('  - context/casus-4-extracted.txt');
}

main().catch(console.error);
