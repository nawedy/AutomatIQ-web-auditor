// src/lib/services/content/grammar-analyzer.ts
// Analyzer for grammar and spelling in content

import { GrammarAnalysis } from '@/lib/types/advanced-audit';

export class GrammarAnalyzer {
  // Common spelling errors
  private commonMisspellings: Record<string, string> = {
    'accomodate': 'accommodate',
    'acheive': 'achieve',
    'accross': 'across',
    'agressive': 'aggressive',
    'apparant': 'apparent',
    'begining': 'beginning',
    'beleive': 'believe',
    'buisness': 'business',
    'calender': 'calendar',
    'catagory': 'category',
    'cemetary': 'cemetery',
    'collegue': 'colleague',
    'comming': 'coming',
    'commited': 'committed',
    'concious': 'conscious',
    'definately': 'definitely',
    'dissapoint': 'disappoint',
    'embarass': 'embarrass',
    'enviroment': 'environment',
    'existance': 'existence',
    'familar': 'familiar',
    'finaly': 'finally',
    'foriegn': 'foreign',
    'goverment': 'government',
    'grammer': 'grammar',
    'happend': 'happened',
    'harrassment': 'harassment',
    'immediatly': 'immediately',
    'independant': 'independent',
    'interupt': 'interrupt',
    'knowlege': 'knowledge',
    'liason': 'liaison',
    'libary': 'library',
    'lisence': 'license',
    'maintainance': 'maintenance',
    'millenium': 'millennium',
    'neccessary': 'necessary',
    'noticable': 'noticeable',
    'occassion': 'occasion',
    'occured': 'occurred',
    'persistant': 'persistent',
    'pharoah': 'pharaoh',
    'posession': 'possession',
    'prefered': 'preferred',
    'publically': 'publicly',
    'recieve': 'receive',
    'recomend': 'recommend',
    'refered': 'referred',
    'relevent': 'relevant',
    'religous': 'religious',
    'rember': 'remember',
    'seperate': 'separate',
    'seige': 'siege',
    'succesful': 'successful',
    'supercede': 'supersede',
    'supress': 'suppress',
    'tommorow': 'tomorrow',
    'truely': 'truly',
    'unforseen': 'unforeseen',
    'unfortunatly': 'unfortunately',
    'untill': 'until',
    'wierd': 'weird',
  };
  
  // Common grammar errors
  private grammarRules: Array<{
    pattern: RegExp;
    message: string;
    replacement: string;
  }> = [
    {
      pattern: /\b(its|it's)\s+(?:a|the)\s+(?:company|business|organization|group|team)(?:'s)?\s+(?:that|which|who)\b/gi,
      message: "Use 'that' not 'who' for companies",
      replacement: "it's a company that",
    },
    {
      pattern: /\b(there|their|they're)\s+(is|are)\b/gi,
      message: "Check usage of 'there', 'their', or 'they're'",
      replacement: "there is",
    },
    {
      pattern: /\b(your|you're)\s+(welcome|welcomed)\b/gi,
      message: "Check usage of 'your' vs 'you're'",
      replacement: "you're welcome",
    },
    {
      pattern: /\b(affect|effect)\s+(on|upon)\b/gi,
      message: "Check usage of 'affect' vs 'effect'",
      replacement: "effect on",
    },
    {
      pattern: /\b(accept|except)\s+(for|from|that)\b/gi,
      message: "Check usage of 'accept' vs 'except'",
      replacement: "except for",
    },
    {
      pattern: /\b(advice|advise)\s+(on|about)\b/gi,
      message: "Check usage of 'advice' vs 'advise'",
      replacement: "advice on",
    },
    {
      pattern: /\b(amount|number)\s+of\s+(?:people|employees|customers|users)\b/gi,
      message: "Use 'number of' for countable items, not 'amount of'",
      replacement: "number of people",
    },
    {
      pattern: /\b(between|among)\s+the\s+(?:three|four|five|six|seven|eight|nine|ten)\b/gi,
      message: "Use 'among' for three or more items, not 'between'",
      replacement: "among the three",
    },
    {
      pattern: /\b(less|fewer)\s+(?:people|employees|customers|users|items|products)\b/gi,
      message: "Use 'fewer' for countable items, not 'less'",
      replacement: "fewer people",
    },
    {
      pattern: /\b(which|that)\s+(?:he|she|they|we|you)\b/gi,
      message: "Use 'who' for people, not 'which' or 'that'",
      replacement: "who they",
    },
  ];
  
  // Style issues
  private styleIssues: Array<{
    pattern: RegExp;
    message: string;
  }> = [
    {
      pattern: /\b(very|really|extremely|incredibly|absolutely)\s+\w+/gi,
      message: "Consider removing intensifiers like 'very', 'really', etc. for stronger writing",
    },
    {
      pattern: /\b(in order to|due to the fact that|for the purpose of|in the event that)\b/gi,
      message: "Consider simplifying wordy phrases",
    },
    {
      pattern: /\b(utilize|utilization|utilizes|utilizing)\b/gi,
      message: "Consider using 'use' instead of 'utilize' for simplicity",
    },
    {
      pattern: /\b(at this point in time|at the present time)\b/gi,
      message: "Consider using 'now' or 'currently' instead",
    },
    {
      pattern: /\bthe fact that\b/gi,
      message: "Consider removing 'the fact that' for conciseness",
    },
    {
      pattern: /\b(is able to|are able to|was able to|were able to)\b/gi,
      message: "Consider using 'can', 'could', or 'may' instead",
    },
    {
      pattern: /\b(a large number of|a majority of)\b/gi,
      message: "Consider using 'many' or 'most' instead",
    },
    {
      pattern: /\b(firstly|secondly|thirdly|lastly)\b/gi,
      message: "Consider using 'first', 'second', 'third', 'last' instead",
    },
    {
      pattern: /\b(commence|commenced|commences|commencing)\b/gi,
      message: "Consider using 'begin' or 'start' instead of 'commence'",
    },
    {
      pattern: /\b(prior to|subsequent to)\b/gi,
      message: "Consider using 'before' or 'after' instead",
    },
  ];
  
  analyze(text: string): GrammarAnalysis {
    // Initialize counters and arrays
    let grammarErrors = 0;
    let spellingErrors = 0;
    let styleIssues = 0;
    const errorDetails: Array<{
      type: string;
      message: string;
      offset: number;
      length: number;
      context: string;
    }> = [];
    
    // Split text into words for spelling check
    const words = text.split(/\s+/);
    
    // Check for spelling errors
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
      
      if (this.commonMisspellings[word]) {
        spellingErrors++;
        
        // Find the position of the word in the original text
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        const match = text.match(regex);
        
        if (match && match.index !== undefined) {
          const offset = match.index;
          const length = match[0].length;
          const contextStart = Math.max(0, offset - 20);
          const contextEnd = Math.min(text.length, offset + length + 20);
          
          errorDetails.push({
            type: 'spelling',
            message: `"${match[0]}" should be "${this.commonMisspellings[word]}"`,
            offset,
            length,
            context: text.substring(contextStart, contextEnd),
          });
        }
      }
    }
    
    // Check for grammar errors
    for (const rule of this.grammarRules) {
      const matches = text.matchAll(rule.pattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          grammarErrors++;
          
          const offset = match.index;
          const length = match[0].length;
          const contextStart = Math.max(0, offset - 20);
          const contextEnd = Math.min(text.length, offset + length + 20);
          
          errorDetails.push({
            type: 'grammar',
            message: rule.message,
            offset,
            length,
            context: text.substring(contextStart, contextEnd),
          });
        }
      }
    }
    
    // Check for style issues
    for (const issue of this.styleIssues) {
      const matches = text.matchAll(issue.pattern);
      
      for (const match of matches) {
        if (match.index !== undefined) {
          styleIssues++;
          
          const offset = match.index;
          const length = match[0].length;
          const contextStart = Math.max(0, offset - 20);
          const contextEnd = Math.min(text.length, offset + length + 20);
          
          errorDetails.push({
            type: 'style',
            message: issue.message,
            offset,
            length,
            context: text.substring(contextStart, contextEnd),
          });
        }
      }
    }
    
    // Generate issues summary
    const issues: string[] = [];
    
    if (spellingErrors > 0) {
      issues.push(`Found ${spellingErrors} spelling error${spellingErrors !== 1 ? 's' : ''}`);
    }
    
    if (grammarErrors > 0) {
      issues.push(`Found ${grammarErrors} grammar error${grammarErrors !== 1 ? 's' : ''}`);
    }
    
    if (styleIssues > 0) {
      issues.push(`Found ${styleIssues} style issue${styleIssues !== 1 ? 's' : ''}`);
    }
    
    // Calculate score
    const totalErrors = spellingErrors + grammarErrors;
    const wordCount = words.length;
    
    // Base score of 100, deduct points based on error density
    const errorRate = wordCount > 0 ? totalErrors / wordCount : 0;
    let score = 100 - Math.min(100, Math.round(errorRate * 1000));
    
    // Deduct additional points for style issues, but with less weight
    const styleRate = wordCount > 0 ? styleIssues / wordCount : 0;
    score -= Math.min(20, Math.round(styleRate * 500));
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    return {
      grammarErrors,
      spellingErrors,
      styleIssues,
      errorDetails,
      issues,
      score,
    };
  }
}
