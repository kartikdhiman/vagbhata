import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const config = JSON.parse(fs.readFileSync('./src/data/chapters-config.json', 'utf8'));
const assetsDir = './src/assets';

const finalizedChapters = config.map(chapter => {
  const filePath = path.join(assetsDir, chapter.filename);
  let duration = '0:00';

  try {
    const output = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`);
    const seconds = parseFloat(output.toString().trim());
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    duration = `${mins}:${secs.toString().padStart(2, '0')}`;
  } catch (e) {
    console.error(`Could not read duration for ${chapter.filename}. Make sure the file exists.`);
  }

  return {
    ...chapter,
    audioSrc: `/src/assets/${chapter.filename}`,
    duration
  };
});

fs.writeFileSync('./src/data/chapters.json', JSON.stringify(finalizedChapters, null, 2));
console.log('✅ Successfully extracted durations and generated chapters.json!');
