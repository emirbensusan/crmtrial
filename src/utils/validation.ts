// Input Validation Schemas
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  currency: /^\d+(\.\d{1,2})?$/,
  percentage: /^(100|[1-9]?\d)$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_.]+$/
};

// Validation function
export const validateField = (value: any, rule: ValidationRule): string | null => {
  if (rule.required && (!value || value.toString().trim() === '')) {
    return 'Bu alan zorunludur';
  }

  if (!value) return null; // Skip other validations if not required and empty

  const stringValue = value.toString();

  if (rule.minLength && stringValue.length < rule.minLength) {
    return `En az ${rule.minLength} karakter olmalıdır`;
  }

  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return `En fazla ${rule.maxLength} karakter olmalıdır`;
  }

  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return 'Geçersiz format';
  }

  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

// Validate entire form
export const validateForm = (data: Record<string, any>, schema: ValidationSchema): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach(field => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Lead validation schema
export const leadValidationSchema: ValidationSchema = {
  company_name: { required: true, minLength: 2, maxLength: 100, pattern: VALIDATION_PATTERNS.noSpecialChars },
  company_country: { required: true, minLength: 2, maxLength: 50 },
  poc_name: { required: true, minLength: 2, maxLength: 100, pattern: VALIDATION_PATTERNS.noSpecialChars },
  poc_email: { pattern: VALIDATION_PATTERNS.email },
  poc_phone: { pattern: VALIDATION_PATTERNS.phone },
  estimated_value: { pattern: VALIDATION_PATTERNS.currency }
};

// Deal validation schema
export const dealValidationSchema: ValidationSchema = {
  name: { required: true, minLength: 3, maxLength: 100 },
  value: { required: true, pattern: VALIDATION_PATTERNS.currency },
  close_probability: { required: true }
};

// Customer validation schema
export const customerValidationSchema: ValidationSchema = {
  company_name: { required: true, minLength: 2, maxLength: 100, pattern: VALIDATION_PATTERNS.noSpecialChars },
  company_country: { required: true, minLength: 2, maxLength: 50 },
  poc_name: { required: true, minLength: 2, maxLength: 100, pattern: VALIDATION_PATTERNS.noSpecialChars },
  poc_email: { pattern: VALIDATION_PATTERNS.email },
  poc_phone: { pattern: VALIDATION_PATTERNS.phone }
};