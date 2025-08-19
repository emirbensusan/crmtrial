// Enhanced Input Security and Validation
import { sanitizeInput, sanitizeForDisplay } from './security';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue: string;
}

export interface SecurityConfig {
  enableXSSProtection: boolean;
  enableSQLInjectionProtection: boolean;
  maxLength: number;
  required?: boolean;
  allowedCharacters?: RegExp;
  blockedPatterns?: RegExp[];
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableXSSProtection: true,
  enableSQLInjectionProtection: true,
  maxLength: 1000,
  required: true,
  allowedCharacters: /^[a-zA-Z0-9\s\-_.@çğıöşüÇĞIİÖŞÜ]+$/,
  blockedPatterns: [
    /script/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /eval\(/gi,
    /expression\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+set/gi
  ]
};

export class InputSecurityValidator {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  validateAndSanitize(input: string, fieldName: string = 'field'): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = input;

    // Basic null/undefined check - only for required fields
    if ((!input || typeof input !== 'string') && this.config.required !== false) {
      return {
        isValid: false,
        errors: [`${fieldName} is required`],
        sanitizedValue: ''
      };
    }

    // If field is empty and not required, return valid
    if (!input && this.config.required === false) {
      return {
        isValid: true,
        errors: [],
        sanitizedValue: ''
      };
    }
    // Length validation
    if (input.length > this.config.maxLength) {
      errors.push(`${fieldName} must be less than ${this.config.maxLength} characters`);
    }

    // XSS Protection
    if (this.config.enableXSSProtection) {
      sanitizedValue = sanitizeInput(sanitizedValue);
      
      // Check for blocked patterns
      if (this.config.blockedPatterns) {
        for (const pattern of this.config.blockedPatterns) {
          if (pattern.test(input)) {
            errors.push(`${fieldName} contains potentially dangerous content`);
            break;
          }
        }
      }
    }

    // SQL Injection Protection
    if (this.config.enableSQLInjectionProtection) {
      sanitizedValue = sanitizeForDisplay(sanitizedValue);
    }

    // Character validation
    if (this.config.allowedCharacters && !this.config.allowedCharacters.test(sanitizedValue)) {
      errors.push(`${fieldName} contains invalid characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  // Specific validators for different field types
  validateEmail(email: string): ValidationResult {
    const emailConfig = {
      ...this.config,
      allowedCharacters: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      maxLength: 254
    };
    
    const validator = new InputSecurityValidator(emailConfig);
    const result = validator.validateAndSanitize(email, 'Email');
    
    if (result.isValid && !emailConfig.allowedCharacters.test(email)) {
      result.isValid = false;
      result.errors.push('Invalid email format');
    }
    
    return result;
  }

  validatePhone(phone: string): ValidationResult {
    const phoneConfig = {
      ...this.config,
      allowedCharacters: /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/,
      maxLength: 20
    };
    
    const validator = new InputSecurityValidator(phoneConfig);
    return validator.validateAndSanitize(phone, 'Phone');
  }

  validateCurrency(amount: string): ValidationResult {
    const currencyConfig = {
      ...this.config,
      allowedCharacters: /^\d+(\.\d{1,2})?$/,
      maxLength: 15
    };
    
    const validator = new InputSecurityValidator(currencyConfig);
    const result = validator.validateAndSanitize(amount, 'Amount');
    
    if (result.isValid) {
      const numValue = parseFloat(result.sanitizedValue);
      if (isNaN(numValue) || numValue < 0) {
        result.isValid = false;
        result.errors.push('Amount must be a positive number');
      }
    }
    
    return result;
  }

  validateCompanyName(name: string): ValidationResult {
    const companyConfig = {
      ...this.config,
      allowedCharacters: /^[a-zA-Z0-9\s\-_.&çğıöşüÇĞIİÖŞÜ]+$/,
      maxLength: 100
    };
    
    const validator = new InputSecurityValidator(companyConfig);
    return validator.validateAndSanitize(name, 'Company Name');
  }
}

// Form validation hook
export const useSecureFormValidation = () => {
  const validator = new InputSecurityValidator();

  const validateForm = (formData: Record<string, any>, rules: Record<string, SecurityConfig>) => {
    const errors: Record<string, string[]> = {};
    const sanitizedData: Record<string, any> = {};

    Object.keys(formData).forEach(field => {
      const value = formData[field];
      const config = rules[field] || DEFAULT_SECURITY_CONFIG;
      const fieldValidator = new InputSecurityValidator(config);
      
      const result = fieldValidator.validateAndSanitize(value, field);
      
      if (!result.isValid) {
        errors[field] = result.errors;
      }
      
      sanitizedData[field] = result.sanitizedValue;
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  };

  return { validateForm, validator };
};

// Rate limiting for forms
export class FormRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60000) { // 5 attempts per minute
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canSubmit(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (record.count >= this.maxAttempts) {
      const remainingTime = this.windowMs - (now - record.lastAttempt);
      return { allowed: false, remainingTime };
    }

    // Increment attempts
    record.count++;
    record.lastAttempt = now;
    return { allowed: true };
  }
}