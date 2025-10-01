/**
 * User Interface Configuration Options
 * Centralized UI-related configurations
 */

export const uiConfig = {
  // Theme and styling
  theme: {
    primaryColor: '#8B4513', // Brown
    secondaryColor: '#D2B48C', // Tan
    accentColor: '#228B22', // Forest Green
    backgroundColor: '#FAFAFA',
    textColor: '#333333'
  },

  // Animation settings
  animations: {
    enabled: true,
    duration: {
      fast: 200,
      normal: 300,
      slow: 500
    },
    easing: 'ease-in-out',
    respectMotionPreference: true
  },

  // Layout options
  layout: {
    maxWidth: '1200px',
    containerPadding: '1rem',
    gridGap: '1.5rem',
    borderRadius: '0.5rem'
  },

  // Component defaults
  components: {
    button: {
      defaultSize: 'md',
      loadingTimeout: 3000,
      rippleEffect: true
    },
    modal: {
      backdrop: true,
      escapeClose: true,
      clickOutsideClose: true
    },
    toast: {
      duration: 5000,
      position: 'top-right',
      maxToasts: 5
    }
  }
};

export const uiOptions = {
  // Responsive breakpoints
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    large: '1440px'
  },

  // Navigation settings
  navigation: {
    stickyHeader: true,
    showBreadcrumbs: true,
    mobileMenuType: 'drawer' // 'drawer' | 'dropdown'
  },

  // Product display options
  productDisplay: {
    cardsPerRow: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      large: 4
    },
    imageAspectRatio: '1:1',
    showRatings: true,
    showStock: true
  }
};