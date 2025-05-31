// app/utils/screenCapture.ts
import * as THREE from "three";

export function captureDecalView(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  decalPosition: THREE.Vector3,
  decalNormal: THREE.Vector3,
  decalSize: number = 0.1
): string {
  // Store original camera position and target
  const originalPosition = camera.position.clone();
  const originalQuaternion = camera.quaternion.clone();
  
  const distance = 0.5 + 2.0 * (1 - Math.min(decalSize * 10, 1)); 
  
  const cameraOffset = decalNormal.clone().multiplyScalar(distance);
  const newCameraPos = decalPosition.clone().add(cameraOffset);
  
  camera.position.copy(newCameraPos);
  camera.lookAt(decalPosition);
  
  const originalFOV = camera.fov;
  camera.fov = 45 + 10 * (1 - Math.min(decalSize * 10, 1)); 
  
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  
  renderer.render(scene, camera);
  
  const dataURL = renderer.domElement.toDataURL("image/png");
  
  camera.position.copy(originalPosition);
  camera.quaternion.copy(originalQuaternion);
  camera.fov = originalFOV;
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  
  return dataURL;
}