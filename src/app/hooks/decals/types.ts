import * as THREE from "three";

export interface DecalData {
  object: THREE.Mesh;
  point: THREE.Vector3;
  euler: THREE.Euler;
  normal: THREE.Vector3;
  bodyPartName: string;
  region: string;
  meshes: THREE.Mesh[];
  isFrontSide: boolean;
}

export interface UploadedImage {
  fileUrl: string;
  fileName: string;
}

export type BodyRegionsMap = {
  [key: string]: string[];
};

export type RegionAdjacentMap = {
  [key: string]: string[];
};

export type MeshToRegionMap = {
  [key: string]: string;
};

export type FacingDirection = 'front' | 'back' | 'side';