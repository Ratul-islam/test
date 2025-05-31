"use client";

import React, { useContext, useState, createContext, ReactNode } from "react";

interface SkinContextValue {
  skinIndex: number;
  setSkinIndex: (index: number) => void;
}

const SkinContext = createContext<SkinContextValue | undefined>(undefined);

interface SkinProviderProps {
  children: ReactNode;
}

export const SkinProvider: React.FC<SkinProviderProps> = ({ children }) => {
  const [skinIndex, setSkinIndex] = useState<number>(0);

  return (
    <SkinContext.Provider value={{ skinIndex, setSkinIndex }}>
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = (): SkinContextValue => {
  const context = useContext(SkinContext);
  if (!context) {
    throw new Error("useSkin must be used within a SkinProvider");
  }

  return context;
};
