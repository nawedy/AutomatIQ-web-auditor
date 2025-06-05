// src/lib/services/content/readability-analyzer.ts
// Analyzer for content readability metrics

import { ReadabilityAnalysis } from '@/lib/types/advanced-audit';

export class ReadabilityAnalyzer {
  analyze(text: string): ReadabilityAnalysis {
    const issues: string[] = [];
    
    // Clean the text
    const cleanText = this.cleanText(text);
    
    // Calculate basic metrics
    const sentences = this.countSentences(cleanText);
    const words = this.countWords(cleanText);
    const syllables = this.countSyllables(cleanText);
    const characters = this.countCharacters(cleanText);
    
    // Calculate average metrics
    const averageSentenceLength = words / sentences;
    const averageWordLength = characters / words;
    
    // Calculate readability scores
    const fleschKincaidScore = this.calculateFleschKincaidScore(words, sentences, syllables);
    const fleschKincaidGrade = this.getFleschKincaidGrade(fleschKincaidScore);
    const smogIndex = this.calculateSMOGIndex(sentences, this.countComplexWords(cleanText));
    const colemanLiauIndex = this.calculateColemanLiauIndex(words, sentences, characters);
    const automatedReadabilityIndex = this.calculateAutomatedReadabilityIndex(characters, words, sentences);
    
    // Calculate average grade level
    const averageGradeLevel = (
      this.fleschKincaidScoreToGrade(fleschKincaidScore) +
      smogIndex +
      colemanLiauIndex +
      automatedReadabilityIndex
    ) / 4;
    
    // Check for issues
    if (averageSentenceLength > 25) {
      issues.push('Average sentence length is too high (over 25 words)');
    }
    
    if (averageWordLength > 5.5) {
      issues.push('Average word length is high, consider using simpler words');
    }
    
    if (averageGradeLevel > 12) {
      issues.push('Content may be too difficult for general audience (above 12th grade level)');
    } else if (averageGradeLevel < 6) {
      issues.push('Content may be too simplistic for professional context (below 6th grade level)');
    }
    
    // Calculate score based on readability
    // Optimal Flesch-Kincaid score is between 60-70 (8th-9th grade level)
    let score = 100;
    
    if (fleschKincaidScore < 30) {
      score = 50; // Very difficult
    } else if (fleschKincaidScore < 50) {
      score = 70; // Difficult
    } else if (fleschKincaidScore > 90) {
      score = 80; // Very easy, might be too simple
    }
    
    // Reduce score for issues
    score -= issues.length * 10;
    score = Math.max(0, Math.min(100, score));
    
    return {
      fleschKincaidScore,
      fleschKincaidGrade,
      smogIndex,
      colemanLiauIndex,
      automatedReadabilityIndex,
      averageGradeLevel,
      averageSentenceLength,
      averageWordLength,
      issues,
      score,
    };
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.!?]/g, '')
      .trim();
  }
  
  private countSentences(text: string): number {
    const matches = text.match(/[.!?]+/g);
    return matches ? matches.length : 1;
  }
  
  private countWords(text: string): number {
    const words = text.split(/\s+/).filter(Boolean);
    return words.length || 1;
  }
  
  private countCharacters(text: string): number {
    return text.replace(/\s/g, '').length || 1;
  }
  
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    
    for (const word of words) {
      count += this.countWordSyllables(word);
    }
    
    return count || 1;
  }
  
  private countWordSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    
    if (word.length <= 3) {
      return 1;
    }
    
    // Remove endings
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
  
  private countComplexWords(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    
    for (const word of words) {
      if (this.countWordSyllables(word) >= 3) {
        count++;
      }
    }
    
    return count;
  }
  
  private calculateFleschKincaidScore(words: number, sentences: number, syllables: number): number {
    // Flesch Reading Ease score
    return 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
  }
  
  private getFleschKincaidGrade(score: number): string {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College Graduate)';
  }
  
  private fleschKincaidScoreToGrade(score: number): number {
    if (score >= 90) return 5;
    if (score >= 80) return 6;
    if (score >= 70) return 7;
    if (score >= 60) return 8.5;
    if (score >= 50) return 11;
    if (score >= 30) return 14;
    return 18;
  }
  
  private calculateSMOGIndex(sentences: number, complexWords: number): number {
    // SMOG Index formula
    return 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291;
  }
  
  private calculateColemanLiauIndex(words: number, sentences: number, characters: number): number {
    // Coleman-Liau Index formula
    const L = (characters / words) * 100;
    const S = (sentences / words) * 100;
    return 0.0588 * L - 0.296 * S - 15.8;
  }
  
  private calculateAutomatedReadabilityIndex(characters: number, words: number, sentences: number): number {
    // Automated Readability Index formula
    return 4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43;
  }
}
