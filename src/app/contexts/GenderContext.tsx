"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface GenderContextValue {
  genderIndex: number;
  setGenderIndex: (index: number) => void;
}

const GenderContext = createContext<GenderContextValue | undefined>(undefined);

interface GenderProviderProps {
  children: ReactNode;
}

export const GenderProvider: React.FC<GenderProviderProps> = ({ children }) => {
  const [genderIndex, setGenderIndex] = useState<number>(0);

  return (
    <GenderContext.Provider value={{ genderIndex, setGenderIndex }}>
      {children}
    </GenderContext.Provider>
  );
};

export const useGender = (): GenderContextValue => {
  const context = useContext(GenderContext);
  if (!context) {
    throw new Error("useGender must be used within a GenderProvider");
  }

  return context;
};
