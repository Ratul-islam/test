"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useSceneSetup } from "@/app/hooks/useSceneSetup";
import { useModelLoader } from "@/app/hooks/useModelLoader";
import { useDecals } from "@/app/hooks/decals/useDecals";
import { useGender } from "@/app/contexts/GenderContext";
import { useSkin } from "@/app/contexts/SkinContext";
import { useTattooOptions } from "@/app/contexts/TattooOptionsContext";
import { useSteps } from "@/app/contexts/TattooStepsContext";
import { Vector3 } from "three";

const smoothEase = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}; 

export default function ModelViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const animationRef = useRef<number | null>(null);
  const verticalOffsetRef = useRef(0); 
  const MAX_VERTICAL_OFFSET = 1; 
  const MIN_VERTICAL_OFFSET = -1; 
  const { step } = useSteps();
  const { genderIndex } = useGender();
  const { skinIndex } = useSkin();
  const { sizes, rotations, decalIndex, uploadedImages } = useTattooOptions();

  const { scene, camera, renderer, orbit } = useSceneSetup(containerRef);
  useModelLoader(scene, renderer, genderIndex, skinIndex);
  
  // Only update decals when these dependencies actually change
  const decalDependencies = useMemo(() => ({
    step,
    sizes,
    rotations,
    decalIndex,
    uploadedImagesKeys: Object.keys(uploadedImages).sort().join(',')
  }), [step, sizes, rotations, decalIndex, uploadedImages]);
  
  useDecals(
    scene,
    camera,
    renderer,
    orbit,
    decalDependencies.step,
    decalDependencies.sizes,
    decalDependencies.rotations,
    decalDependencies.decalIndex,
    uploadedImages
  );

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    
    window.addEventListener('resize', checkMobileView);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const smoothTransition = useCallback((
    newCameraPos: Vector3,
    newOrbitTarget: Vector3,
    duration: number = 1200
  ) => {
    if (!camera || !orbit) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startCameraPos = camera.position.clone();
    const startOrbitTarget = orbit.target.clone();
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      let t = Math.min(elapsed / duration, 1);
      
      t = smoothEase(t);
      
      camera.position.lerpVectors(startCameraPos, newCameraPos, t);
      orbit.target.lerpVectors(startOrbitTarget, newOrbitTarget, t);
      
      orbit.update();

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        camera.position.copy(newCameraPos);
        orbit.target.copy(newOrbitTarget);
        orbit.update();
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [camera, orbit]);

  const handlePanVertical = useCallback((direction: 'up' | 'down') => {
    if (!camera || !orbit) return;
    
    const delta = direction === 'up' ? 0.15 : -0.15;
    verticalOffsetRef.current = Math.min(
      MAX_VERTICAL_OFFSET,
      Math.max(MIN_VERTICAL_OFFSET, verticalOffsetRef.current + delta)
    );

    const newCameraPos = new Vector3(
      camera.position.x,
      1 + verticalOffsetRef.current,
      camera.position.z
    );
    
    const newOrbitTarget = new Vector3(
      orbit.target.x,
      verticalOffsetRef.current, 
      orbit.target.z
    );

    smoothTransition(newCameraPos, newOrbitTarget);
  }, [camera, orbit, smoothTransition]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!camera || !orbit) return;
    const zoomIntensity = direction === 'in' ? 0.3 : -0.3;
    const targetDirection = new Vector3()
      .subVectors(orbit.target, camera.position)
      .normalize();
    
    const newCameraPos = camera.position.clone().addScaledVector(
      targetDirection,
      zoomIntensity
    );
    
    smoothTransition(newCameraPos, orbit.target.clone());
  }, [camera, orbit, smoothTransition]);

  const handleResetView = useCallback(() => {
    if (!camera || !orbit) return;
    smoothTransition(
      new Vector3(0, 1, 3), 
      new Vector3(0, 0, 0),
      1500
    );
  }, [camera, orbit, smoothTransition]);

  useEffect(() => {
    if (!orbit) return;
    orbit.enableDamping = true;
    orbit.enablePan = false;
    orbit.dampingFactor = 0.1;
    orbit.minDistance = 1;
    orbit.maxDistance = 5;
    orbit.minPolarAngle = Math.PI / 8;
    orbit.maxPolarAngle = (Math.PI * 5) / 6;

    const isViewOnly = step === 4 || step === 5;
    orbit.enableRotate = !isViewOnly;
    orbit.autoRotate = isViewOnly;
    orbit.autoRotateSpeed = isViewOnly ? 1 : 0;

    orbit.update();
  }, [step, orbit]);

  useEffect(() => {
    const showControls = () => setIsControlsVisible(true);
    const hideControls = () => setIsControlsVisible(false);
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", showControls);
      container.addEventListener("mouseleave", hideControls);
    }
    
    return () => {
      if (container) {
        container.removeEventListener("mouseenter", showControls);
        container.removeEventListener("mouseleave", hideControls);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !camera || !orbit) return;
    
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;
      
      if (Math.abs(deltaY) > 10) {
        const newCameraPos = camera.position.clone();
        const newOrbitTarget = orbit.target.clone();
        newCameraPos.y += deltaY * 0.003;
        newOrbitTarget.y += deltaY * 0.003;
        smoothTransition(newCameraPos, newOrbitTarget, 50);
        touchStartY = touchY;
      }
    };
    
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [camera, orbit, smoothTransition]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {/* Camera Controls */}
      <div 
        className={`absolute right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300 z-30 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              handlePanVertical('up');
            }}
            className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-transform duration-150 hover:scale-105"
            title="Pan Up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handlePanVertical('down');
            }}
            className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-transform duration-150 hover:scale-105"
            title="Pan Down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleZoom('in');
            }}
            className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-transform duration-150 hover:scale-105"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleZoom('out');
            }}
            className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-transform duration-150 hover:scale-105"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleResetView();
            }}
            className="w-10 h-10 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-transform duration-150 hover:scale-105"
            title="Reset View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Compact Help Box */}
      <div className={`absolute ${isMobileView ? 'bottom-2 left-2' : 'bottom-4 left-4'} bg-white/90 backdrop-blur-sm rounded-lg shadow-lg ${isMobileView ? 'p-1.5 text-xs' : 'p-3 text-sm'} text-gray-700 ${isMobileView ? 'max-w-[170px]' : 'max-w-xs'}`}>
        <div className="flex items-start">
          <div>
            {isMobileView ? (
              <div className="flex flex-col">
                <span className="font-semibold">Navigation:</span>
                <div className="grid grid-cols-2 gap-x-2 text-[10px] leading-tight mt-0.5">
                  <span>• Rotate: Drag</span>
                  <span>• Zoom: Wheel</span>
                  <span>• Pan: Arrows</span>
                </div>
              </div>
            ) : (
              <>
                <p><strong>Navigation Help:</strong></p>
                <p>• Rotate: Click and drag</p>
                <p>• Zoom: Mouse wheel or buttons</p>
                <p>• Pan: Use arrow buttons</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button
        onClick={(e) => { 
          e.stopPropagation(); 
          alert(
            "Camera Controls:\n• Rotate: Click and drag with mouse\n• Pan Up/Down: Use the arrow buttons\n• Zoom: Use the +/- buttons or mouse wheel\n• Reset: Use the reset button to return to default view"
          ); 
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute ${isMobileView ? 'bottom-2 right-2 w-8 h-8' : 'bottom-4 right-4 w-10 h-10'} rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors`}
        title="Help"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={isMobileView ? "h-4 w-4" : "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}