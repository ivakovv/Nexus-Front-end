import React, { createContext, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <NavigationContext.Provider value={{ navigate, params }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 