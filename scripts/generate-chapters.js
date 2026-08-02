import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const config = JSON.parse(fs.readFileSync('./src/data/chapters-config.json', 'utf8'));
const assetsDir = './public/audio';

// Load existing chapters.json if it exists to preserve pre-computed durations as a fallback
let existingChapters = [];
try {
  existingChapters = JSON.parse(fs.readFileSync('./src/data/chapters.json', 'utf8'));
} catch (e) {
  // Doesn't exist yet or is invalid
}

const finalizedChapters = config.map(chapter => {
  const filePath = path.join(assetsDir, chapter.filename);
  
  // Set fallback duration to existing value if present, otherwise default to '0:00'
  let duration = '0:00';
  const matched = existingChapters.find(c => c.filename === chapter.filename);
  if (matched && matched.duration) {
    duration = matched.duration;
  }

  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    const seconds = parseFloat(output.toString().trim());
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    duration = `${mins}:${secs.toString().padStart(2, '0')}`;
  } catch (e) {
    console.warn(`Could not read duration via ffprobe for ${chapter.filename}. Using fallback: ${duration}`);
  }

  return {
    ...chapter,
    audioSrc: `/audio/${chapter.filename}`,
    duration
  };
});

fs.writeFileSync('./src/data/chapters.json', JSON.stringify(finalizedChapters, null, 2));
console.log('✅ Successfully extracted durations and generated chapters.json!');
