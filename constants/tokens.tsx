export const TOKENS = {
    colors: {
      obsidian: '#0F172A',
      emerald: '#10B981',
      slate: '#64748B',
      cloud: '#F8FAFC',
      
      background: '#F8FAFC',
      surface: '#F8FAFC',
      surfaceContainerLow: '#F2F4F6',
      onSurface: '#0F172A',
      primary: '#0F172A',
      secondary: '#10B981',
      danger:'#7F1D1D',


      // Primary button gradient (design system)
      primaryGradientStart: '#4EDEA3',
      primaryGradientEnd: '#091426',

      // Premium button gradient (distinct)
      premiumGradientStart: '#F59E0B',
      premiumGradientEnd: '#7C3AED',
    },
    
    spacing: {
      xs: 4,
      sm: 8,
      md: 16, // Niveau 2 : Standard (Respiration éditoriale)
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    typography: {
      family: 'PlusJakartaSans',
      letterSpacing: {
        tight: -0.8,
        relaxed: 1.2,
      }
    },
  
    // Règle "No-Line" : On utilise des ombres ultra-légères au lieu de bordures
    shadows: {
      ghost: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
      }
    }
  };