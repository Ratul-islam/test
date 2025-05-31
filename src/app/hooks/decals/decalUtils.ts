import * as THREE from "three";
import { FacingDirection } from "./types";
import { bodyRegions, frontSide, backSide, partsWithFrontBackSides } from "./bodyRegions";

export const getMeshRegion = (meshName: string): string => {
  for (const [region, meshes] of Object.entries(bodyRegions)) {
    if (meshes.some(mesh => meshName.includes(mesh))) {
      return region;
    }
  }
  return 'other';
};

export const isFacingFront = (normal: THREE.Vector3): boolean => {
  const normalizedNormal = normal.clone().normalize();
  return normalizedNormal.z < 0;
};

export function determineFacingDirection(mesh: THREE.Mesh, point: THREE.Vector3, normal: THREE.Vector3): FacingDirection {
  // First check mesh name for obvious indicators
  const meshName = mesh.name;
  
  if (meshName.includes('Chest_ML') || meshName.includes('Abdomen_ML')) {
    return 'front';
  }
  
  if (meshName.includes('Upper_Back_ML') || meshName.includes('Lower_Back_ML')) {
    return 'back';
  }
  
  if (partsWithFrontBackSides.some(part => meshName.includes(part))) {
    const worldNormal = normal.clone().normalize();
    const frontDot = worldNormal.dot(new THREE.Vector3(0, 0, -1));
    const backDot = worldNormal.dot(new THREE.Vector3(0, 0, 1));
    
    const threshold = 0.3;
    
    if (frontDot > threshold) {
      return 'front';
    } else if (backDot > threshold) {
      return 'back';
    } else {
      return 'side';
    }
  }
  
  return isFacingFront(normal) ? 'front' : 'back';
}

export const isFrontSideRegion = (region: string): boolean => {
  return frontSide.includes(region);
};

export const isBackSideRegion = (region: string): boolean => {
  return backSide.includes(region);
};

export function createDecalMaterial(texture: THREE.Texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      clipIntersection: false,
      clipShadows: true,
      side: THREE.FrontSide,
      roughness: 0.6,
      metalness: 0.1,
      blending: THREE.NormalBlending
    });
  }