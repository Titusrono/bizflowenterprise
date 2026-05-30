/**
 * BizFlow Dark Theme Constants
 * Unified dark theme color palette for consistent styling across post-login pages
 * Uses BizFlow brand colors with professional dark mode backgrounds
 */

export const DARK_THEME_CONFIG = {
  // Background Colors
  backgrounds: {
    // Main page background
    pageBackground: '#09111f',        // Deep navy
    
    // Component backgrounds
    card: '#0f1829',                  // Slightly lighter navy for cards
    sidebar: '#0a1220',               // Dark navy for sidebar
    header: '#0f1829',                // Match card background
    input: '#1a2540',                 // Input background
    
    // Hover states
    hover: '#1a2540',
    hoverLight: '#243254',
  },

  // Text Colors
  text: {
    primary: '#ffffff',               // Main text (white)
    secondary: '#cbd5e1',             // Secondary text (light gray)
    muted: '#94a3b8',                 // Muted text (medium gray)
    disabled: '#64748b',              // Disabled text (gray)
  },

  // Border Colors
  borders: {
    light: '#1e293b',                 // Light border for dark mode
    medium: '#334155',                // Medium border
    accent: '#0066ff',                // Accent blue for important borders
  },

  // Brand Accent Colors (from logo)
  accents: {
    primary: '#0066ff',               // BizFlow blue
    secondary: '#00bfff',             // Cyan accent
    success: '#22c55e',               // Green
    warning: '#f59e0b',               // Amber
    danger: '#ef4444',                // Red
    info: '#0ea5e9',                  // Sky blue
  },

  // Gradients for visual hierarchy
  gradients: {
    primary: 'linear-gradient(135deg, #0066ff 0%, #00bfff 100%)',
    dark: 'linear-gradient(135deg, #0a1220 0%, #0f1829 100%)',
    subtle: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
  },

  // Tailwind CSS Classes for Easy Application
  tailwind: {
    // Page wrapper classes
    pageWrapper: 'bg-[#09111f] dark:bg-[#09111f] min-h-screen',
    
    // Card classes
    card: 'bg-[#0f1829] dark:bg-[#0f1829] border border-[#1e293b]',
    
    // Sidebar classes
    sidebar: 'bg-[#0a1220] dark:bg-[#0a1220] border-r border-[#1e293b]',
    
    // Header classes
    header: 'bg-[#0f1829] dark:bg-[#0f1829] border-b border-[#1e293b]',
    
    // Text classes
    textPrimary: 'text-white dark:text-white',
    textSecondary: 'text-[#cbd5e1] dark:text-[#cbd5e1]',
    textMuted: 'text-[#94a3b8] dark:text-[#94a3b8]',
    
    // Input classes
    input: 'bg-[#1a2540] dark:bg-[#1a2540] border-[#334155] text-white dark:text-white placeholder-[#94a3b8]',
    
    // Button classes
    buttonPrimary: 'bg-primary-500 hover:bg-primary-600 text-white dark:text-white',
    buttonSecondary: 'bg-secondary-500 hover:bg-secondary-600 text-white dark:text-white',
    buttonGhost: 'hover:bg-[#1a2540] text-[#cbd5e1] dark:text-[#cbd5e1] dark:hover:bg-[#243254]',
  },

  // Shadow definitions for dark mode
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  },
} as const;

/**
 * Helper function to get dark theme classes for a component
 * Usage: getDarkThemeClasses('card') => 'bg-[#0f1829] border border-[#1e293b]'
 */
export function getDarkThemeClasses(
  component: keyof typeof DARK_THEME_CONFIG.tailwind
): string {
  return DARK_THEME_CONFIG.tailwind[component] || '';
}

/**
 * Type for dark theme configuration
 */
export type DarkThemeConfig = typeof DARK_THEME_CONFIG;
