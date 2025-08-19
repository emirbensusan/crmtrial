// Environment Variables Check
export const checkRequiredEnvVars = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};

// Validate environment configuration
export const validateEnvironment = () => {
  const env = import.meta.env.MODE;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl?.startsWith('https://')) {
    throw new Error('Invalid Supabase URL format');
  }
  
  console.log(`🌍 Environment: ${env}`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}`);
  
  return { env, supabaseUrl };
};