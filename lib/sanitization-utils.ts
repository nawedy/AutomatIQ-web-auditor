// lib/sanitization-utils.ts
// Utility functions for input sanitization to enhance security

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes a string to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (input: string | null | undefined): string => {
  if (!input) return '';
  return DOMPurify.sanitize(input.trim());
};

/**
 * Sanitizes an object by applying sanitizeString to all string properties
 * @param obj Object to sanitize
 * @returns Sanitized object with the same structure
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj } as Record<string, any>;
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    }
  });
  
  return result as T;
};

/**
 * Sanitizes an array by applying sanitizeString to all string elements
 * and sanitizeObject to all object elements
 * @param arr Array to sanitize
 * @returns Sanitized array
 */
export const sanitizeArray = <T>(arr: T[]): T[] => {
  if (!arr || !Array.isArray(arr)) return arr;
  
  return arr.map(item => {
    if (typeof item === 'string') {
      return sanitizeString(item) as unknown as T;
    } else if (item && typeof item === 'object') {
      return sanitizeObject(item as Record<string, any>) as unknown as T;
    }
    return item;
  });
};

/**
 * Validates and sanitizes input data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Input data to validate and sanitize
 * @returns Object with success flag, sanitized data or error message
 */
export const validateAndSanitize = <T>(schema: z.ZodType<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  error?: string;
} => {
  try {
    // First sanitize the input data
    const sanitizedInput = typeof data === 'object' 
      ? sanitizeObject(data as Record<string, any>)
      : data;
    
    // Then validate against schema
    const result = schema.safeParse(sanitizedInput);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
};

/**
 * Sanitizes a URL to ensure it's safe
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  try {
    const sanitized = sanitizeString(url);
    // Ensure URL is valid and uses http or https protocol
    const urlObj = new URL(sanitized);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return sanitized;
  } catch (e) {
    return '';
  }
};

/**
 * Sanitizes HTML content more aggressively for use in descriptions or content fields
 * @param html HTML content to sanitize
 * @returns Sanitized HTML with only basic formatting allowed
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitizes email addresses
 * @param email Email address to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  
  const sanitized = sanitizeString(email).toLowerCase();
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
};
