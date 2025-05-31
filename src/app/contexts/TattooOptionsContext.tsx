"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

let nextDecalId = 2;

interface UploadedImageData {
  fileUrl: string;
  fileName: string;
}

interface TattooRequest {
  description: string;
  image: File;
}

interface TattooOptionsContextValues {
  sizes: { [id: number]: number };
  setSize: (id: number, val: number) => void;
  rotations: { [id: number]: number };
  setRotation: (id: number, val: number) => void;
  decalIndex: number;
  setDecalIndex: (val: number) => void;
  uploadedImages: { [id: number]: UploadedImageData };
  addNewFile: (fileUrl: string, fileName: string) => number;
  removeFile: (id: number) => void;
  tattooRequests: TattooRequest[];
  addTattooRequest: (description: string, image: File) => void;
  hiddenTattoos: number[];
  hideFile: (id: number) => void;
}

const TattooOptionsContext = createContext<
  TattooOptionsContextValues | undefined
>(undefined);

interface TattooOptionsProviderProps {
  children: ReactNode;
}

export const TattooOptionsProvider: React.FC<TattooOptionsProviderProps> = ({
  children
}) => {
  const [uploadedImages, setUploadedImages] = useState<{ [id: number]: UploadedImageData }>({
    0: { fileUrl: "/butterfly.png", fileName: "Butterfly" },
    1: { fileUrl: "/lion.png", fileName: "Lion" }
  });

  const [sizesMap, setSizesMap] = useState<{ [id: number]: number }>({
    0: 0.1,
    1: 0.1
  });

  const [rotationsMap, setRotationsMap] = useState<{ [id: number]: number }>({
    0: 0,
    1: 0
  });

  const [decalIndex, setDecalIndex] = useState<number>(0);

  const [hiddenTattoos, setHiddenTattoos] = useState<number[]>([]);

  const [tattooRequests, setTattooRequests] = useState<TattooRequest[]>([]);

  function setSize(id: number, val: number) {
    setSizesMap(prev => ({ ...prev, [id]: val }));
  }

  function setRotation(id: number, val: number) {
    setRotationsMap(prev => ({ ...prev, [id]: val }));
  }

  function addNewFile(fileUrl: string, fileName: string): number {
    const id = nextDecalId++;
    setUploadedImages(prev => ({ ...prev, [id]: { fileUrl, fileName } }));
    setRotationsMap(prev => ({ ...prev, [id]: 0 }));
    setSizesMap(prev => ({ ...prev, [id]: 0.1 }));
    return id;
  }

  function removeFile(id: number) {
    setUploadedImages(prev => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });

    setSizesMap(prev => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });

    setRotationsMap(prev => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });

    if (decalIndex === id) {
      setDecalIndex(0);
    }
  }

  function hideFile(id: number) {
    setHiddenTattoos(prev => {
      if (prev.includes(id)) {
        return prev.filter(hiddenId => hiddenId !== id);
      }
      return [...prev, id];
    });

    if (decalIndex === id) {
      const availableIds = Object.keys(uploadedImages)
        .map(Number)
        .filter(imgId => !hiddenTattoos.includes(imgId) && imgId !== id);

      if (availableIds.length > 0) {
        setDecalIndex(availableIds[0]);
      }
    }
  }

  function addTattooRequest(description: string, image: File) {
    setTattooRequests(prev => [...prev, { description, image }]);
  }

  return (
    <TattooOptionsContext.Provider
      value={{
        sizes: sizesMap,
        setSize,
        rotations: rotationsMap,
        setRotation,
        decalIndex,
        setDecalIndex,
        uploadedImages,
        addNewFile,
        removeFile,
        tattooRequests,
        addTattooRequest,
        hiddenTattoos,
        hideFile
      }}
    >
      {children}
    </TattooOptionsContext.Provider>
  );
};

export const useTattooOptions = (): TattooOptionsContextValues => {
  const context = useContext(TattooOptionsContext);
  if (!context) {
    throw new Error(
      "useTattooOptions must be used within a TattooOptionsProvider"
    );
  }
  return context;
};
