import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load configurations and generated data
const configPath = path.resolve(__dirname, '../data/chapters-config.json');
const generatedPath = path.resolve(__dirname, '../data/chapters.json');
const audioDir = path.resolve(__dirname, '../../public/audio');

const chaptersConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const chaptersGenerated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));

// Valid Sthanas list in Astanga Samgraha
const VALID_STHANAS = [
  "Introduction",
  "Sutrasthana",
  "Sarirasthana",
  "Nidanasthana",
  "Chikitsitasthana",
  "Kalpasthana",
  "Uttarasthana"
];

describe('Vagbhata Chapter Metadata Tests', () => {
  it('should verify chapters-config.json schema', () => {
    chaptersConfig.forEach((chapter: any) => {
      expect(chapter).toHaveProperty('filename');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('slug');
      expect(chapter).toHaveProperty('sthana');
      expect(chapter).toHaveProperty('chapterNumber');
      expect(chapter).toHaveProperty('description');

      expect(typeof chapter.filename).toBe('string');
      expect(typeof chapter.title).toBe('string');
      expect(typeof chapter.slug).toBe('string');
      expect(typeof chapter.sthana).toBe('string');
      expect(typeof chapter.chapterNumber).toBe('number');
      expect(typeof chapter.description).toBe('string');
    });
  });

  it('should verify chapters.json generated schema', () => {
    chaptersGenerated.forEach((chapter: any) => {
      expect(chapter).toHaveProperty('filename');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('slug');
      expect(chapter).toHaveProperty('sthana');
      expect(chapter).toHaveProperty('chapterNumber');
      expect(chapter).toHaveProperty('description');
      expect(chapter).toHaveProperty('audioSrc');
      expect(chapter).toHaveProperty('duration');

      expect(typeof chapter.audioSrc).toBe('string');
      expect(typeof chapter.duration).toBe('string');
      
      // Duration should match MM:SS format
      expect(chapter.duration).match(/^\d+:\d{2}$/);
    });
  });

  it('should verify all slug constraints', () => {
    const slugs = new Set<string>();
    
    chaptersConfig.forEach((chapter: any) => {
      const slug = chapter.slug;
      
      // Ensure slug uniqueness
      expect(slugs.has(slug)).toBe(false);
      slugs.add(slug);

      // Slug should be url-safe (lowercase, digits, and hyphens only)
      expect(slug).match(/^[a-z0-9-]+$/);
    });
  });

  it('should verify all chapters belong to valid Sthanas', () => {
    chaptersConfig.forEach((chapter: any) => {
      expect(VALID_STHANAS).toContain(chapter.sthana);
    });
  });

  it('should verify physical audio file existence', () => {
    chaptersConfig.forEach((chapter: any) => {
      const audioFilePath = path.join(audioDir, chapter.filename);
      const exists = fs.existsSync(audioFilePath);
      expect(exists).toBe(true);
    });
  });
});
