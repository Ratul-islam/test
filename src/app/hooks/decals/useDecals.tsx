"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { useModelContext } from "@/app/contexts/ModelContext";
import { useDecalMeshes } from "@/app/contexts/DecalMeshesContext";

import { DecalData, UploadedImage } from "./types";
import { getMeshRegion, createDecalMaterial, determineFacingDirection } from "./decalUtils";
import { calculatePrice } from "./decalPricing";
import { getMeshesForDecal, createDecalGroup, removeDecalGroup } from "./decalPlacement";
import { captureDecalView } from "@/app/components/utils/screenCapture";

export function useDecals(
    scene: THREE.Scene | null,
    camera: THREE.PerspectiveCamera | null,
    renderer: THREE.WebGLRenderer | null,
    orbit: OrbitControls | null,
    step: number,
    sizes: { [id: number]: number },
    rotations: { [id: number]: number },
    decalIndex: number,
    uploadedImages: { [id: number]: UploadedImage } | undefined
) {
  const decalCountsRef = useRef<{ [id: number]: number }>({ 0: 0, 1: 0 });
  const decalMaterialsRef = useRef<{
    [id: number]: THREE.MeshStandardMaterial | undefined;
  }>({
    0: undefined,
    1: undefined
  });
  const { 
    decalMeshRef, 
    setEstimatedPrice, 
    setConfirmed3DModel,
    setTattooCloseups,
    addTattooCloseup,
    addIndividualPrice,
    removeIndividualPrice 
  } = useDecalMeshes();
  
  const captureFullModelView = useCallback(() => {
    if (!scene || !camera || !renderer) return '';
    
    const originalPosition = camera.position.clone();
    const originalQuaternion = camera.quaternion.clone();
    const originalFOV = camera.fov;
    
    camera.position.set(0, 0, 2.5);
    camera.lookAt(0, 0, 0);
    camera.fov = 45;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    
    if (orbit) orbit.enabled = false;
    
    renderer.render(scene, camera);
    const dataURL = renderer.domElement.toDataURL("image/png");
    
    // Restore camera settings
    camera.position.copy(originalPosition);
    camera.quaternion.copy(originalQuaternion);
    camera.fov = originalFOV;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    
    if (orbit) orbit.enabled = true;
    
    return dataURL;
  }, [scene, camera, renderer, orbit]);
  
  const captureAllTattooViews = useCallback(() => {
    if (!scene || !camera || !renderer) return [];
    
    const captures: string[] = [];
    
    Object.entries(decalDataRef.current).forEach(([idStr, decalData]) => {
      const { point, normal } = decalData;
      const id = Number(idStr);
      const sz = sizes[id] || 0.1;
      
      if (orbit) orbit.enabled = false;
      
      const imageUrl = captureDecalView(scene, camera, renderer, point, normal, sz);
      
      // Store with decal ID mapping
      addTattooCloseup(id, imageUrl);
      
      captures.push(imageUrl);
      
      if (orbit) orbit.enabled = true;
    });
    
    return captures;
  }, [scene, camera, renderer, orbit, sizes, addTattooCloseup]);
  
  useEffect(() => {
    if (step === 4) {
      const fullModelView = captureFullModelView();
      if (fullModelView) {
        setConfirmed3DModel(fullModelView);
      }
      
      const closeupViews = captureAllTattooViews();
      if (closeupViews.length > 0) {
        setTattooCloseups(closeupViews);
      }
    }
  }, [step, captureFullModelView, captureAllTattooViews, setConfirmed3DModel, setTattooCloseups]);

  const decalDataRef = useRef<{
    [id: number]: DecalData;
  }>({});

  const { bodyRef } = useModelContext();

  useEffect(() => {
    if (!scene || !camera || !renderer) return;

    const container = renderer.domElement.parentElement;
    if (!container) return;

    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    function onMouseDown(e: MouseEvent) {
      if (!scene || !camera || !renderer || !container) return;
      const body = bodyRef.current;
    
      const rect = container.getBoundingClientRect();
      mousePosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePosition.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mousePosition, camera);
      const intersections = raycaster.intersectObjects(body, true);
    
      if (intersections.length > 0) {
        if (decalMeshRef.current[decalIndex]) {
            removeDecalGroup(decalMeshRef.current[decalIndex]);
            
            removeIndividualPrice(decalIndex);
            
            delete decalMeshRef.current[decalIndex];
            delete decalDataRef.current[decalIndex];
          }
        
    
        const intersection = intersections[0];
        if (!intersection.face || !(intersection.object instanceof THREE.Mesh))
          return;
    
        const meshObj = intersection.object;
        const bodyPartName = meshObj.name || "unknown";
        
        const region = getMeshRegion(bodyPartName);
        
        const sz = sizes[decalIndex] || 0.1;
        
        const normal = intersection.face.normal.clone();
        normal.transformDirection(meshObj.matrixWorld);
    
        const position = intersection.point.clone();
        
        const facingDirection = determineFacingDirection(meshObj, position, normal);
        const isFrontSide = facingDirection === 'front';
        
        const relevantMeshes = getMeshesForDecal(
          meshObj, 
          position, 
          normal, 
          region, 
          sz,
          bodyRef.current
        );
        
        const up = new THREE.Vector3(0, 0, 1);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, normal);
        const euler = new THREE.Euler().setFromQuaternion(quaternion, "XYZ");
    
        decalDataRef.current[decalIndex] = {
          object: meshObj,
          point: position.clone(),
          euler: euler.clone(),
          normal: normal.clone(),
          bodyPartName,
          region,
          meshes: relevantMeshes,
          isFrontSide
        };
    
        const decalMat = decalMaterialsRef.current[decalIndex];
        if (decalMat?.map) {
          decalMat.map.center.set(0.5, 0.5);
          decalMat.map.rotation = THREE.MathUtils.degToRad(
            rotations[decalIndex] || 0
          );
          decalMat.map.needsUpdate = true;
        }
    
        const offset = normal.clone().multiplyScalar(0.001);
        const decalPosition = position.clone().add(offset);
        
        const decalGroup = createDecalGroup(
            meshObj,
            decalPosition,
            normal,
            euler,
            sz,
            decalMat as THREE.Material,
            decalIndex,
            relevantMeshes,
            scene
          );
          
        
          decalMeshRef.current[decalIndex] = decalGroup[0];
          decalCountsRef.current[decalIndex] = 1;
          
          const price = calculatePrice(bodyPartName, sz, getMeshRegion, decalGroup);
          addIndividualPrice(decalIndex, price, bodyPartName, sz);
          
      }
    }

    if (step === 3) {
      container.addEventListener("mousedown", onMouseDown);
    }

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
    };
  }, [
    scene,
    camera,
    renderer,
    step,
    decalIndex,
    sizes,
    rotations,
    bodyRef,
    decalMeshRef,
    setEstimatedPrice,
    addIndividualPrice,
    removeIndividualPrice
  ]);
    
  useEffect(() => {
    if (!scene) return;
  
    const decalData = decalDataRef.current[decalIndex];
    const decalMesh = decalMeshRef.current[decalIndex];
  
    if (!decalData || !decalMesh) return;
  
    const { object, point, euler, normal, bodyPartName, region } = decalData;
    const decalMat = decalMaterialsRef.current[decalIndex];
    
    if (decalMat?.map) {
      decalMat.map.rotation = THREE.MathUtils.degToRad(
        rotations[decalIndex] || 0
      );
      decalMat.map.needsUpdate = true;
    }
  
    const sz = sizes[decalIndex] || 0.1;
    
    const relevantMeshes = getMeshesForDecal(
      object, 
      point, 
      normal, 
      region, 
      sz,
      bodyRef.current
    );
    
    removeDecalGroup(decalMesh);
    
    const offset = normal.clone().multiplyScalar(0.001);
    const decalPosition = point.clone().add(offset);
    
    const newDecalGroup = createDecalGroup(
      object,
      decalPosition,
      normal,
      euler,
      sz,
      decalMat as THREE.Material,
      decalIndex,
      relevantMeshes,
      scene
    );
    
    decalMeshRef.current[decalIndex] = newDecalGroup[0];
    
    decalDataRef.current[decalIndex].meshes = relevantMeshes;
  
    const price = calculatePrice(bodyPartName, sz, getMeshRegion, newDecalGroup);
    addIndividualPrice(decalIndex, price, bodyPartName, sz);
  
  }, [
    scene, 
    sizes, 
    rotations, 
    decalIndex, 
    decalMeshRef, 
    setEstimatedPrice, 
    bodyRef,
    addIndividualPrice
  ]);

  useEffect(() => {
    if (!uploadedImages || !scene) return;
    const textureLoader = new THREE.TextureLoader();

    for (const idStr in uploadedImages) {
      const id = Number(idStr);
      if (!decalMaterialsRef.current[id]) {
        const { fileUrl } = uploadedImages[id];
        const texture = textureLoader.load(fileUrl);
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        decalMaterialsRef.current[id] = createDecalMaterial(texture);
        decalCountsRef.current[id] = decalCountsRef.current[id] || 0;
      }
    }

    for (const idStr in decalMeshRef.current) {
      const id = Number(idStr);
      if (id >= 2 && !uploadedImages[id]) {
        const decalMesh = decalMeshRef.current[id];
        removeDecalGroup(decalMesh);

        delete decalMeshRef.current[id];
        delete decalDataRef.current[id];
        delete decalMaterialsRef.current[id];
        delete decalCountsRef.current[id];
      }
    }
  }, [uploadedImages, scene, decalMeshRef]);
}