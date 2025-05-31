import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { adjacentRegions } from "./bodyRegions";
import { 
  getMeshRegion, 
  determineFacingDirection, 
  isFrontSideRegion, 
  isBackSideRegion 
} from "./decalUtils";

export const getMeshesForDecal = (
  primaryMesh: THREE.Mesh, 
  point: THREE.Vector3, 
  normal: THREE.Vector3, 
  primaryRegion: string, 
  size: number,
  bodyParts: THREE.Mesh[]
): THREE.Mesh[] => {
  const facingDirection = determineFacingDirection(primaryMesh, point, normal);
  const result = [primaryMesh];
  
  if (size <= 0.05) {
    return result;
  }
  const searchRadius = size * 1.5;
  const primaryPosition = point.clone();
  
  const candidateMeshes = bodyParts.filter(mesh => {
    if (mesh === primaryMesh) return false;

    if (size < 0.15) {
      const meshRegion = getMeshRegion(mesh.name);
      if (meshRegion !== primaryRegion) return false;
    }

    if (primaryRegion.includes('arm') || primaryRegion.includes('hand')) {
      const meshRegion = getMeshRegion(mesh.name);
      if (primaryRegion.includes('_left') && !meshRegion.includes('_left')) {
        return false;
      }
      if (primaryRegion.includes('_right') && !meshRegion.includes('_right')) {
        return false;
      }
      return meshRegion.includes('arm') || meshRegion.includes('hand');
    }

    // Special handling for certain body parts
    if (mesh.name.includes('Neck_ML') || 
        mesh.name.includes('Shoulder_L_ML') || 
        mesh.name.includes('Shoulder_R_ML') || 
        mesh.name.includes('Hip_ML')) {
      const meshFacingDirection = determineFacingDirection(
        mesh, 
        mesh.position.clone(), 
        new THREE.Vector3(0, 0, mesh.name.includes('Back') ? 1 : -1)
      );
      return meshFacingDirection === facingDirection;
    }

    if (mesh.name.includes('Chest_ML') || mesh.name.includes('Abdomen_ML')) {
      return facingDirection === 'front';
    }

    if (mesh.name.includes('Upper_Back_ML') || mesh.name.includes('Lower_Back_ML')) {
      return facingDirection === 'back';
    }

    if (size >= 0.15) {
      const meshRegion = getMeshRegion(mesh.name);
      const adjacentToMainRegion = adjacentRegions[primaryRegion] || [];
      
      if (adjacentToMainRegion.includes(meshRegion)) {
        // Make sure we don't span front to back or vice versa
        if (isFrontSideRegion(primaryRegion) && isBackSideRegion(meshRegion)) {
          return false;
        }
        if (isBackSideRegion(primaryRegion) && isFrontSideRegion(meshRegion)) {
          return false;
        }
        if (primaryRegion.includes('_left') && meshRegion.includes('_right')) {
          return false;
        }
        if (primaryRegion.includes('_right') && meshRegion.includes('_left')) {
          return false;
        }
        
        let meshDistance = Number.MAX_VALUE;
        if (mesh.geometry) {
          mesh.geometry.computeBoundingSphere();
          if (mesh.geometry.boundingSphere) {
            const center = mesh.geometry.boundingSphere.center.clone()
              .applyMatrix4(mesh.matrixWorld);
            meshDistance = primaryPosition.distanceTo(center);
          }
        }
        
        return meshDistance < searchRadius * 5;
      }
    }

    const meshRegion = getMeshRegion(mesh.name);
    return meshRegion === primaryRegion;
  });
  
  result.push(...candidateMeshes);
  
  return result;
};

// Apply decal to mesh
export const applyDecalToMesh = (
  mesh: THREE.Mesh,
  position: THREE.Vector3,
  euler: THREE.Euler,
  size: number,
  material: THREE.Material,
  decalIndex: number,
  subIndex: number = -1
): THREE.Mesh => {
  const adaptiveDepth = size * 0.4;
  
  const decalGeometry = new DecalGeometry(
    mesh,
    position,
    euler,
    new THREE.Vector3(size, size, adaptiveDepth)
  );
  
  const decalMaterial = material.clone();
  
  if (size > 0.15) {
    if (decalMaterial instanceof THREE.MeshStandardMaterial) {
      decalMaterial.polygonOffsetFactor = -4;
      decalMaterial.polygonOffsetUnits = -4;
      
      if (decalMaterial.map) {
        decalMaterial.map.wrapS = THREE.ClampToEdgeWrapping;
        decalMaterial.map.wrapT = THREE.ClampToEdgeWrapping;
      }
    }
  }
  
  const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
  const suffix = subIndex >= 0 ? `-${mesh.name}` : '';
  decalMesh.name = `decal-${decalIndex}${suffix}`;
  decalMesh.userData.bodyPart = mesh.name;
  decalMesh.userData.decalIndex = decalIndex;
  
  return decalMesh;
};

// Create a decal group spanning multiple meshes
export const createDecalGroup = (
  mainMesh: THREE.Mesh,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  euler: THREE.Euler,
  size: number,
  material: THREE.Material,
  decalIndex: number,
  relevantMeshes: THREE.Mesh[],
  scene: THREE.Scene
): THREE.Mesh[] => {
  const mainDecal = applyDecalToMesh(
    mainMesh,
    position,
    euler,
    size,
    material,
    decalIndex,
  );
  
  scene.add(mainDecal);
  
  const decalGroup: THREE.Mesh[] = [mainDecal];
  
  for (let i = 1; i < relevantMeshes.length; i++) {
    try {
      const mesh = relevantMeshes[i];
      const subDecal = applyDecalToMesh(
        mesh,
        position,
        euler,
        size,
        material,
        decalIndex,
        i
      );
      
      scene.add(subDecal);
      decalGroup.push(subDecal);
    } catch {
      console.warn(`Failed to apply decal to mesh at index ${i}`);
    }
  }
  
  mainDecal.userData.decalGroup = decalGroup;
  
  return decalGroup;
};

// Remove a decal and its group members
export const removeDecalGroup = (decalMesh: THREE.Mesh | undefined): number | undefined => {
  if (!decalMesh) return undefined;
  
  const decalIndex = decalMesh.userData.decalIndex;
  const decalGroup = decalMesh.userData.decalGroup || [decalMesh];
  
  decalGroup.forEach((mesh: THREE.Mesh) => {
    if (mesh && mesh.parent) {
      mesh.parent.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
    }
  });
  
  if (decalMesh.parent && decalMesh.userData.decalIndex !== undefined) {
    const scene = decalMesh.parent;
    
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh && 
          child.name.startsWith(`decal-${decalIndex}`) && 
          !decalGroup.includes(child as THREE.Mesh)) {
        
        scene.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
        console.log(`Removed orphaned decal: ${child.name}`);
      }
    });
  }
  
  return decalIndex;
};