import React, { useState } from 'react';
import { AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { useSecureFormValidation, SecurityConfig } from '../../utils/inputSecurity';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (sanitizedData: Record<string, any>) => Promise<void>;
  validationRules: Record<string, SecurityConfig>;
  formData: Record<string, any>;
  title: string;
  loading?: boolean;
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  onSubmit,
  validationRules,
  formData,
  title,
  loading = false
}) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateForm } = useSecureFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate and sanitize all form data
    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(validation.sanitizedData);
    } catch (error: any) {
      setErrors({ general: [error.message] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Indicator */}
      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">Secure Form</span>
        <span className="text-xs text-green-600">XSS & Injection Protected</span>
      </div>

      {/* General Errors */}
      {errors.general && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-sm text-red-700">
            {errors.general.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const fieldName = child.props.name;
            const fieldErrors = errors[fieldName];
            
            return (
              <div>
                {child}
                {fieldErrors && (
                  <div className="mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">{fieldErrors[0]}</span>
                  </div>
                )}
              </div>
            );
          }
          return child;
        })}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {title}
            </>
          )}
        </button>
      </div>

      {/* Security Footer */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
        🔒 All data is validated and sanitized for security
      </div>
    </form>
  );
};