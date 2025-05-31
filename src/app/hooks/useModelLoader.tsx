"use client";

import { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useModelContext } from "@/app/contexts/ModelContext";

export function useModelLoader(
  scene: THREE.Scene | null,
  renderer: THREE.WebGLRenderer | null,
  genderIndex: number,
  skinIndex: number
) {
  const { bodyRef, modelRef } = useModelContext();
  
  useEffect(() => {
    if (!scene || !renderer) {
      console.warn("Scene or renderer not initialized yet");
      return;
    }
    
    console.log("Loading model with gender:", genderIndex, "skin:", skinIndex);
    
    const genders = ["/Male(2).glb", "/Female(2).glb"];
    const colorPalette = [0xf2c8b7, 0xd99e82, 0xb87a5b, 0x7b4f36];

    const loader = new GLTFLoader();
    const body = bodyRef.current;

    if (modelRef.current) {
      // Remove old model
      scene.remove(modelRef.current);
      const decals = scene.children.filter(
        child => child instanceof THREE.Mesh && child.name.includes("decal")
      );
      decals.forEach(decal => scene.remove(decal));
      body.length = 0;
      modelRef.current = undefined;
    }

    // Add loading indicator
    console.log(`Loading model: ${genders[genderIndex]}`);
    
    loader.load(
      genders[genderIndex],
      glb => {
        console.log("Model loaded successfully!");
        const newModel = glb.scene;
        modelRef.current = newModel;
        scene.add(newModel);
        newModel.position.y -= 1;

        const material = new THREE.MeshStandardMaterial({
          color: colorPalette[skinIndex]
        });
        
        newModel.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
            body.push(child);
          }
        });
        
        // Force a re-render
        if (renderer) {
          renderer.render(scene, scene.getObjectByProperty('type', 'PerspectiveCamera') as THREE.Camera);
        }
      },
      progress => {
        console.log(`Loading progress: ${Math.round(progress.loaded / progress.total * 100)}%`);
      },
      error => {
        console.error("Error loading model:", error);
      }
    );
  }, [scene, renderer, genderIndex, skinIndex, bodyRef, modelRef]);
}