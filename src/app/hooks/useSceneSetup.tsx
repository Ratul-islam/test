"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface SceneSetupReturn {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  orbit: OrbitControls | null;
}

export function useSceneSetup(
  containerRef: React.RefObject<HTMLDivElement>
): SceneSetupReturn {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x636363);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 3);
    camera.lookAt(scene.position);
    cameraRef.current = camera;

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.1;
    orbit.enablePan = false; 
    orbit.minDistance = 1;
    orbit.maxDistance = 5;
    orbit.minPolarAngle = Math.PI / 8;
    orbit.maxPolarAngle = (Math.PI * 5) / 6;
    orbitRef.current = orbit;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 5, 1);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, 5, -1);
    scene.add(directionalLight2);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 0, -5);
    scene.add(backLight);

    function animate() {
      if (orbitRef.current) {
        orbitRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(animate);
    }
    
    animate();
    renderer.setAnimationLoop(null);

    function onWindowResize() {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;
      const cont = containerRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      
      camera.aspect = cont.clientWidth / cont.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(cont.clientWidth, cont.clientHeight);
    }
    
    window.addEventListener("resize", onWindowResize);

    return () => {
      cancelAnimationFrame(0);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener("resize", onWindowResize);
    };
  }, [containerRef]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    orbit: orbitRef.current
  };
}