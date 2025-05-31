// In GuidanceContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GuidanceContextType {
  hasSeenGuidance: boolean;
  setHasSeenGuidance: (value: boolean) => void;
  showGuidance: boolean;
  setShowGuidance: (value: boolean) => void;
}

const GuidanceContext = createContext<GuidanceContextType | undefined>(undefined);

interface GuidanceProviderProps {
  children: ReactNode;
}

export const GuidanceProvider: React.FC<GuidanceProviderProps> = ({ children }) => {
  const [hasSeenGuidance, setHasSeenGuidance] = useState<boolean | null>(null);
  const [showGuidance, setShowGuidance] = useState<boolean>(false);
  
  // Check localStorage on component mount
  useEffect(() => {
    const storedValue = localStorage.getItem('hasSeenTattooGuidance');
    // Set explicit boolean value after checking localStorage
    setHasSeenGuidance(storedValue === 'true');
    
    // If they haven't seen the guidance, show it right away
    if (storedValue !== 'true') {
      setShowGuidance(true);
    }
  }, []);
  
  // Update localStorage when hasSeenGuidance changes, but only if it's not null
  useEffect(() => {
    if (hasSeenGuidance !== null) {
      localStorage.setItem('hasSeenTattooGuidance', hasSeenGuidance.toString());
    }
  }, [hasSeenGuidance]);
  
  if (hasSeenGuidance === null) {
    return <>{children}</>;
  }
  
  return (
    <GuidanceContext.Provider 
      value={{ 
        hasSeenGuidance: Boolean(hasSeenGuidance), 
        setHasSeenGuidance,
        showGuidance,
        setShowGuidance
      }}
    >
      {children}
    </GuidanceContext.Provider>
  );
};

export const useGuidance = (): GuidanceContextType => {
  const context = useContext(GuidanceContext);
  if (!context) {
    throw new Error('useGuidance must be used within a GuidanceProvider');
  }
  return context;
};