// This script runs before React hydration to set initial theme
export function setInitialTheme() {
  return `
    (function() {
      function getInitialTheme() {
        const persistedTheme = window.localStorage.getItem('theme');
        if (persistedTheme) return persistedTheme;
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
      }

      const theme = getInitialTheme();
      
      const root = document.documentElement;
      const body = document.body;

      // Remove any existing theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the current theme class
      root.classList.add(theme);
      
      // Set theme attributes
      root.setAttribute('data-theme', theme);
      
      // Store the theme
      localStorage.setItem('theme', theme);
    })()
  `;
}
