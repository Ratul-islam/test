"use client";

import React, { useContext, useState, createContext, ReactNode } from "react";

interface StepsContextValue {
  step: number;
  setStep: (index: number) => void;
}

const StepsContext = createContext<StepsContextValue | undefined>(undefined);

interface StepsProviderProps {
  children: ReactNode;
}

export const StepsProvider: React.FC<StepsProviderProps> = ({ children }) => {
  const [step, setStep] = useState<number>(1);

  return (
    <StepsContext.Provider value={{ step, setStep }}>
      {children}
    </StepsContext.Provider>
  );
};

export const useSteps = (): StepsContextValue => {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("useSteps must be used within a StepsProvider");
  }

  return context;
};
