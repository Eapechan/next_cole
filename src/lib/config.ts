// Configuration file for API keys and environment variables
export const config = {
  // Gemini AI Configuration
  gemini: {
    apiKey: 'AIzaSyBdohNujUi9hSHMMmvpFcKDUai_cvsLH9A',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    maxTokens: 2048,
    temperature: 0.7,
  },
  
  // App Configuration
  app: {
    name: 'NextCoal Initiative',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  // Feature Flags
  features: {
    aiEnabled: true,
    notificationsEnabled: true,
    exportEnabled: true,
    aiInsights: true,
    realTimeTracking: true,
    complianceReporting: true,
    carbonOffsetting: true,
  },
  
  // Support Information
  support: {
    email: 'support@nextcoal-initiative.gov.in',
    phone: '+91-11-23456789',
    hours: 'Mon-Fri 9:00 AM - 6:00 PM IST',
  },
};

// Helper function to check if features are enabled
export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature];
};

// Helper function to get app configuration
export const getAppConfig = () => {
  return {
    aiEnabled: config.features.aiEnabled && !!config.gemini.apiKey,
    notificationsEnabled: config.features.notificationsEnabled,
    exportEnabled: config.features.exportEnabled,
  };
};

// Validate required configuration
export const validateConfig = () => {
  if (!config.gemini.apiKey && import.meta.env.DEV) {
    console.warn('Gemini API key not found. AI features may not work properly.');
  }
  
  return {
    aiEnabled: config.features.aiInsights && !!config.gemini.apiKey,
    notificationsEnabled: config.features.notificationsEnabled,
    exportEnabled: config.features.exportEnabled,
  };
};

export default config; 