/**
 * BizFlow Enterprise Branding Constants
 * Centralized branding configuration for consistent styling across the application
 */

export const BIZFLOW_BRANDING = {
  // Brand Name
  appName: 'BizFlow Enterprise',
  
  // Logo Paths
  logo: {
    path: 'https://res.cloudinary.com/dkero7wyo/image/upload/v1780164515/bizflow_q45j2t.png',
    alt: 'BizFlow Enterprise',
    height: '40px',
    width: 'auto',
  },

  // Brand Colors - Based on BizFlow Logo
  colors: {
    // Primary Blue Colors
    primary: {
      dark: '#0a1f5c',      // Dark navy (logo gradient start)
      main: '#0066ff',      // Main BizFlow blue
      light: '#e6f1ff',     // Very light blue
    },
    
    // Accent/Secondary Colors
    secondary: {
      main: '#00bfff',      // Cyan accent
      light: '#e0f7ff',     // Very light cyan
    },
    
    // Gradient
    gradients: {
      primary: 'linear-gradient(135deg, #0a1f5c 0%, #1e40af 50%, #0066ff 100%)',
      dark: 'linear-gradient(135deg, #001a4d 0%, #0a1f5c 100%)',
    },
  },

  // Tailwind Classes for Easy Use
  tailwind: {
    primaryButton: 'bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200',
    primaryGradient: 'bg-gradient-to-r from-[#0a1f5c] via-[#1e40af] to-[#0066ff]',
    darkGradient: 'bg-gradient-to-r from-[#001a4d] to-[#0a1f5c]',
  },
} as const;

/**
 * Export type-safe branding object for use in Angular components
 */
export type BrandingConfig = typeof BIZFLOW_BRANDING;
