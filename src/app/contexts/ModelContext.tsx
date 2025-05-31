"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";
import * as THREE from "three";

interface ModelContextType {
  bodyRef: React.MutableRefObject<THREE.Mesh[]>;
  modelRef: React.MutableRefObject<THREE.Group | undefined>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const bodyRef = useRef<THREE.Mesh[]>([]);
  const modelRef = useRef<THREE.Group>();

  return (
    <ModelContext.Provider value={{ bodyRef, modelRef }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModelContext = (): ModelContextType => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};