/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTattooOptions } from "@/app/contexts/TattooOptionsContext";
import Image from "next/image";
import * as THREE from "three";
import { useDecalMeshes } from "@/app/contexts/DecalMeshesContext";
import { removeDecalGroup } from "../hooks/decals/decalPlacement";
import { useGuidance } from "@/app/contexts/GuidanceContext";
import { useTattooDesigns } from "../contexts/TattooDesignsContext";
import axios from "axios";
import ImageEditor from "./imageEditor"; 
import { fetchArtists, fetchSpecialisations } from "../services/artistService";
import TattooGuidanceSystem from "./TattooGuidanceSystem";

interface Fields {
  description: string;
  image: File | null;
}

const TattooViewerStep3: React.FC = () => {
  const params = useParams();

  
  const {
    decalIndex,
    setDecalIndex,
    addNewFile,
    removeFile,
    uploadedImages,
    hideFile,
    hiddenTattoos,
    sizes,
    rotations,
    setSize,
    setRotation
  } = useTattooOptions();
  
  const { setTattooDesigns } = useTattooDesigns();
  
  const {
    decalMeshRef,
    removeIndividualPrice,
    removeTattooCloseup,
    setConfirmed3DModel,
    selectedArtist,
    artists,
    setSelectedArtist,
    setSelectedArtistName,
    setArtists,
    setDepositPaid,
    setEstimatedPrice,
    priceEstimate,
  } = useDecalMeshes();

  const { hasSeenGuidance, setHasSeenGuidance, showGuidance, setShowGuidance } = useGuidance();
  const [selectedStyle, setSelectedStyle] = useState("");
  const [specialisations, setSpecialisations] = useState([]);
  const [fields, setFields] = useState<Fields>({
    description: "",
    image: null
  });
  
  // Add state for deposit percentage
  const [depositPercentage, setDepositPercentage] = useState<number>(0.25); // Default to 25% as fallback
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalDecalArea, setTotalDecalArea] = useState<number | null>(null);
  const previousDecalKeysRef = useRef<string[]>([]);
  const calculatePriceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for image editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditImage, setCurrentEditImage] = useState("");
  const [tempFileName, setTempFileName] = useState("");


  console.log(params?.id)
  // Fetch admin deposit percentage
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!params?.id) return;
      
      setIsLoadingAdmin(true);
      try {
        const response = await axios.get(`/api/admin?adminId=${params.id}`);
        
        if (response.data && response.data.depositPercentage !== undefined) {
          // Convert percentage to decimal (e.g., 25 -> 0.25)
          const percentage = typeof response.data.depositPercentage === 'number' 
            ? response.data.depositPercentage / 100 
            : 0.25;
          setDepositPercentage(percentage);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // Keep default 25% on error
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    fetchAdminData();
  }, [params?.id]);

  useEffect(() => {
    if (!hasSeenGuidance) {
      setShowGuidance(true);
    }
  }, [hasSeenGuidance, setShowGuidance]);

  // Handle guidance completion
  const handleGuidanceComplete = useCallback(() => {
    setHasSeenGuidance(true);
    setShowGuidance(false);
  }, [setHasSeenGuidance, setShowGuidance]);

  // Load specialisations
  useEffect(() => {
    const loadSpecialisations = async () => {
      const [res, err] = await fetchSpecialisations({
        searchParams: { adminId: params?.id || "" }
      });

      if (!err && res && res.specializations) {
        setSpecialisations(res.specializations);
      } else {
        setSpecialisations([]);
        console.error(
          "Failed to load specializations:",
          err || "Missing data in response"
        );
      }
    };

    loadSpecialisations();
  }, [params?.id]);

  // Calculate total decal area
  const calculateTotalDecalArea = useCallback((): number => {
    let totalArea = 0;
    for (const key in decalMeshRef.current) {
      const mesh = decalMeshRef.current[key];
      if (mesh?.geometry) {
        const geo = mesh.geometry as THREE.BufferGeometry;
        if (geo.attributes.position) {
          totalArea += geo.attributes.position.count;
        }
      }
    }
    return totalArea;
  }, [decalMeshRef]);  

  // Calculate price via API
  const calculatePrice = useCallback(async () => {
    if (!selectedArtist) return;
  
    setLoading(true);
    try {
      const totalArea = calculateTotalDecalArea();
      setTotalDecalArea(totalArea);
  
      const response = await axios.post("/api/price-estimation", {
        artistId: selectedArtist,
        decalArea: totalArea,
      });
  
      const { estimatedPrice } = response.data;
      const formattedPrice = parseFloat(estimatedPrice.toFixed(2));
      setEstimatedPrice(formattedPrice);
    } catch (error) {
      console.error("Error fetching price estimate:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedArtist, calculateTotalDecalArea, setEstimatedPrice]);

  // Monitor decal mesh changes with debounce to avoid rapid state updates
  useEffect(() => {
    const checkForDecalChanges = () => {
      const currentKeys = Object.keys(decalMeshRef.current).sort();
      const prevKeys = previousDecalKeysRef.current;
      const keysChanged = JSON.stringify(currentKeys) !== JSON.stringify(prevKeys);
  
      if (currentKeys.length > 0 && keysChanged) {
        previousDecalKeysRef.current = currentKeys;
        
        // Only trigger price calculation if artist is selected and not already loading
        if (selectedArtist && !loading) {
          // Clear any existing timeout to debounce multiple calls
          if (calculatePriceTimeoutRef.current) {
            clearTimeout(calculatePriceTimeoutRef.current);
          }
          
          // Set a new timeout
          calculatePriceTimeoutRef.current = setTimeout(() => {
            calculatePrice();
          }, 1000);
        }
      }
  
      // Update total area only if different, to avoid unnecessary re-renders
      const newTotalArea = calculateTotalDecalArea();
      if (totalDecalArea !== newTotalArea) {
        setTotalDecalArea(newTotalArea);
      }
    };
  
    checkForDecalChanges();
    const interval = setInterval(checkForDecalChanges, 1000);
    
    return () => {
      clearInterval(interval);
      if (calculatePriceTimeoutRef.current) {
        clearTimeout(calculatePriceTimeoutRef.current);
      }
    };
  }, [
    decalMeshRef, 
    selectedArtist, 
    loading, 
    calculatePrice, 
    calculateTotalDecalArea, 
    totalDecalArea
  ]);

  // Update deposit when priceEstimate or depositPercentage changes
  useEffect(() => {
    if (priceEstimate !== null && !isLoadingAdmin) {
      const depositAmount = priceEstimate * depositPercentage;
      setDepositPaid(parseFloat(depositAmount.toFixed(2)));
    }
  }, [priceEstimate, depositPercentage, isLoadingAdmin, setDepositPaid]);

  // Better image processing with progress simulation
  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setIsUploading(true);
        setUploadProgress(0);
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      reader.onloadend = () => {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          resolve(reader.result as string);
        }, 500);
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle the selection from the image editor
  const handleEditedImage = useCallback((editedImageData: string) => {
    addNewFile(editedImageData, tempFileName);
    setTattooDesigns(prev => [...prev, { fileUrl: editedImageData }]);
    
    setIsEditing(false);
    setCurrentEditImage("");
    setTempFileName("");
  }, [addNewFile, setTattooDesigns, tempFileName]);

  // Cancel the image editing
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setCurrentEditImage("");
    setTempFileName("");
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        try {
          if (file.size > 10 * 1024 * 1024) {
            alert("File size should be less than 10MB");
            continue;
          }
          
          if (!file.type.startsWith('image/')) {
            alert("Only image files are allowed");
            continue;
          }
          
          const base64 = await processImage(file);
          const fileName = file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name;
          
          setCurrentEditImage(base64);
          setTempFileName(fileName);
          setIsEditing(true);
          
          if (files.indexOf(file) === 0) {
            setFields(prev => ({ ...prev, image: file }));
          }
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }
      
      e.target.value = '';
    }
  }, [processImage]);

  const handleRemoveImage = useCallback((id: number) => {
    if (id < 2) {
      hideFile(id);

      if (decalMeshRef.current[id]) {
        const scene = decalMeshRef.current[id].parent;

        removeDecalGroup(decalMeshRef.current[id]);
        removeIndividualPrice(id);
        removeTattooCloseup(id);
        delete decalMeshRef.current[id];

        if (scene) {
          scene.children = scene.children.filter(child => {
            if (
              child instanceof THREE.Mesh &&
              child.name.includes(`decal-${id}`)
            ) {
              if (child.geometry) child.geometry.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
              return false;
            }
            return true;
          });
        }
      }
    } else {
      removeFile(id);

      if (decalMeshRef.current[id]) {
        removeDecalGroup(decalMeshRef.current[id]);
        removeIndividualPrice(id);
        removeTattooCloseup(id);
        delete decalMeshRef.current[id];
      }
      
      setTattooDesigns(prev => {
        const imagesArray = Object.entries(uploadedImages).map(([idStr, data]) => {
          return {
            id: Number(idStr),
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            isHidden: hiddenTattoos.includes(Number(idStr))
          };
        });
        
        const designIndex = imagesArray.findIndex(img => img.id === id);
        if (designIndex >= 0 && designIndex < prev.length) {
          const newDesigns = [...prev];
          newDesigns.splice(designIndex, 1);
          return newDesigns;
        }
        return prev;
      });
    }

    setConfirmed3DModel("");
  }, [
    hideFile, 
    removeFile, 
    setTattooDesigns, 
    uploadedImages, 
    hiddenTattoos, 
    decalMeshRef, 
    removeIndividualPrice, 
    removeTattooCloseup, 
    setConfirmed3DModel
  ]);

  const handleSpecChange = async (e: any) => {
    const value = e.target.value;
    setSelectedStyle(value);
    setSelectedArtist("");
    setSelectedArtistName("");

    const [res, error] = await fetchArtists({
      searchParams: { specialization: value }
    });

    if (!error) {
      setArtists(res.artists);
    }
  }

  const handleArtistChange = (e: any) => {
    const value = e.target.value;
    const selectedArtistObj = artists.find((a: any) => a.id === value);

    setSelectedArtist(value);
    setSelectedArtistName(selectedArtistObj?.name || "");
  };

  const imagesArray = Object.entries(uploadedImages).map(([idStr, data]) => {
    const id = Number(idStr);
    return {
      id,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      isHidden: hiddenTattoos.includes(id)
    };
  });

  return (
    <div className='w-full flex flex-col gap-5'>
      {showGuidance && (
        <TattooGuidanceSystem 
          onComplete={handleGuidanceComplete} 
          isFirstVisit={!hasSeenGuidance} 
        />
      )}

      <div className='w-full flex flex-col gap-1 mb-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
            Upload tattoo design.
          </h2>
        </div>
        <p className='tracking-wide text-base w-full'>
          Once design is uploaded, please select the area of the design you want to place on your skin
        </p>
      </div>
      
      <div 
        id="guidance-upload-box"
        className={`relative w-full h-[150px] xl:h-[200px] border border-dashed 
                   ${isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-400'} 
                   rounded-lg flex flex-col items-center justify-center mb-[20px]
                   hover:border-blue-500 hover:bg-blue-50 transition-colors overflow-hidden`}
      >
        {isUploading ? (
          <div className="w-full flex flex-col items-center">
            <div className="mb-2 text-blue-500 font-medium">Processing image...</div>
            <div className="w-[80%] h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className='text-gray-500 text-[16px] xl:text-[18px]'>
              Drag & drop or <span className='text-black font-bold'>click to upload</span>
            </p>
            <p className='text-gray-400 text-[14px] mt-1'>
              Supported formats: JPG, PNG, SVG (Max 10MB)
            </p>
          </>
        )}
        <input
          type='file'
          multiple
          className='absolute inset-0 opacity-0 cursor-pointer'
          accept='image/*'
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      
      <div
        id='guidance-designs-gallery'
        className='flex flex-wrap items-center gap-2 mb-4'
      >
        {imagesArray
          .filter(img => !img.isHidden)
          .map(imgData => (
            <div
              key={imgData.id}
              onClick={() => setDecalIndex(imgData.id)}
              className={`relative w-20 h-20 rounded-lg  ${imgData.id === decalIndex ? "border-2 border-black" : "border border-borderColor hover:scale-105 transition-transform"}`}
            >
              <Image
                src={imgData.fileUrl}
                alt={`Uploaded ${imgData.id}`}
                fill
                className='object-cover rounded-lg'
              />

              <div className='absolute top-1 right-1 z-10'>
                <button
                  className='bg-red-500 text-white rounded w-4 h-4 flex items-center justify-center text-xs shadow-md hover:bg-red-600 font-bold'
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveImage(imgData.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
      </div>
      
      {/* Size and Rotation controls - only show when a design is selected */}
      {decalIndex !== null && decalIndex !== undefined && (
        <div id="guidance-design-controls" className="bg-gray-50 p-4 border border-gray-200 rounded-lg mb-4">
          <div className="text-lg font-medium mb-2">Tattoo Adjustments</div>
          
          <div id="guidance-size-control" className='mb-4'>
            <label className='block mb-1 text-sm font-medium'>Tattoo Size</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Small</span>
              <input
                type='range'
                min='0.01'
                max='0.5'
                step='0.01'
                value={sizes[decalIndex] || 0.1}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setSize(decalIndex, val);
                }}
                className='flex-grow h-2 rounded-lg appearance-none bg-gray-200 accent-black'
              />
              <span className="text-xs text-gray-500">Large</span>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              Size: {(sizes[decalIndex] || 0.1).toFixed(2)}
            </div>
          </div>

          <div id="guidance-rotation-control">
            <label className='block mb-1 text-sm font-medium'>Tattoo Rotation</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">0°</span>
              <input
                type='range'
                min='0'
                max='360'
                step='1'
                value={rotations[decalIndex] || 0}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setRotation(decalIndex, val);
                }}
                className='flex-grow h-2 rounded-lg appearance-none bg-gray-200 accent-black'
              />
              <span className="text-xs text-gray-500">360°</span>
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              Rotation: {rotations[decalIndex] || 0}°
            </div>
          </div>
        </div>
      )}

      <div
        id='guidance-description'
        className='relative w-full h-32 border border-borderColor rounded-xl overflow-hidden flex flex-col mb-4'
      >
        <textarea
          className='w-full h-full p-3 text-base tracking-wide resize-none focus:outline-none'
          placeholder='Write your description here...'
          maxLength={500}
          value={fields.description}
          onChange={e => setFields({ ...fields, description: e.target.value })}
        />
        <div className='absolute bottom-1 right-1 text-md'>
          {fields.description.length}/500
        </div>
      </div>
{
  params.id &&
      <div className="mt-6">
        <h3 className="text-2xl tracking-wide font-semibold mb-3">Select tattoo style and artist</h3>
        
        <div className='relative w-full mb-4'>
          <label htmlFor="tattooStyle" className="text-[16px] text-gray-600 mb-[5px] block">
            Select Tattoo Style
          </label>
          <select
            id='tattooStyle'
            value={selectedStyle}
            onChange={handleSpecChange}
            className='w-full border border-gray-400 px-3 py-3 rounded-lg focus:outline-none text-base'
          >
            <option value='' disabled>
              Select Tattoo Style
            </option>
            {specialisations.map((style, index) => (
              <option key={index} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div className='relative w-full mb-4'>
          <label htmlFor="tattooArtist" className="text-[16px] text-gray-600 mb-[5px] block">
            Select Tattoo Artist
          </label>
          <select
            id='tattooArtist'
            value={selectedArtist}
            onChange={handleArtistChange}
            className='w-full border border-gray-400 px-3 py-3 rounded-lg focus:outline-none text-base'
          >
            <option value='' disabled>
              Select Tattoo Artist
            </option>
            {artists.map((artist: any, index) => (
              <option key={index} value={artist?.id}>
                {artist?.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          id="guidance-price-estimate"
          onClick={calculatePrice}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors mt-2 mb-4"
          disabled={loading || !selectedArtist}
          >
          {loading ? "Calculating..." : "Calculate Price"}
        </button>
      </div>
        }
      
      {priceEstimate !== null && (
        <div id="guidance-price-result" className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-medium">Estimated Price:</p>
            <p className="text-2xl font-bold">{priceEstimate} €</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-md font-medium">
              Deposit Amount ({isLoadingAdmin ? "..." : `${Math.round(depositPercentage * 100)}%`}):
            </p>
            <p className="text-xl font-semibold">
              {isLoadingAdmin ? "..." : (priceEstimate * depositPercentage).toFixed(2)} €
            </p>
          </div>
          
          {/* <p className="text-sm text-gray-500 mt-2">
            (debug) totalDecalArea: {loading ? "..." : (totalDecalArea ?? "--")}, modelSurface: {modelSurfaceAreas[genderIndex].toFixed(3)}
          </p> */}
        </div>
      )}
      
      {isEditing && currentEditImage && (
        <ImageEditor 
          imageUrl={currentEditImage} 
          onSave={handleEditedImage} 
          onCancel={handleCancelEdit}
        />
      )}

      <div
          className="fixed bottom-12 left-6 z-50"
          style={{ pointerEvents: "all" }}
        >
          <button
            aria-label="Start guide"
            className="group relative bg-white rounded-full shadow-lg border border-blue-500 w-12 h-12 flex items-center justify-center hover:bg-blue-50 transition"
            onClick={() => {
              setShowGuidance(true);
              setHasSeenGuidance(false);
            }}
            type="button"
          >
            {/* Question Mark Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16h.01M12 12a2 2 0 10-2-2m2 2v2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded px-3 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-lg">
              Start guide
            </span>
          </button>
        </div>
    </div>
  );
};

export default TattooViewerStep3;