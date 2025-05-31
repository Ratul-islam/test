import { BodyRegionsMap, RegionAdjacentMap, MeshToRegionMap } from "./types";

// Defined body regions with associated mesh names
export const bodyRegions: BodyRegionsMap = {
  head: [
    'Cheeks_ML', 'Chin_ML', 'Forehead_ML', 'Nose_ML', 'Ocipital_ML', 
    'Temporal_L_ML', 'Temporal_R_ML', 'Tophead_ML', 'Eye_L_ML', 'Eye_R_ML',
    'Eye_Hold_ML', 'Ear_L_ML', 'Ear_R_ML', 'Mouth_ML', 'Whines_ML'
  ],
  neck: ['Neck_ML'],
  torso_front: ['Chest_ML', 'Abdomen_ML'],
  torso_back: ['Upper_Back_ML', 'Lower_Back_ML'],
  shoulder_left: ['Shoulder_L_ML'],
  shoulder_right: ['Shoulder_R_ML'],
  arm_upper_left: ['Biceps_L_ML', 'Triceps_L_ML'],
  arm_upper_right: ['Biceps_R_ML', 'Triceps_R_ML'],
  arm_lower_left: ['Forearm_L_ML', 'Elbow_L_ML'],
  arm_lower_right: ['Forearm_R_ML', 'Elbow_R_ML'],
  hand_left: ['Hand_L_ML', 'Palm_L_ML', 'Thumb_L_ML', 'Index_L_ML', 'Middle_L_ML', 'Ring_L_ML', 'Pinky_L_ML'],
  hand_right: ['Hand_R_ML', 'Palm_R_ML', 'Thumb_R_ML', 'Index_R_ML', 'Middle_R_ML', 'Ring_R_ML', 'Pinky_R_ML'],
  hip: ['Hip_ML'],
  leg_upper_left: ['Upper_Leg_L_ML', 'Knee_L_ML'],
  leg_upper_right: ['Upper_Leg_R_ML', 'Knee_R_ML'],
  leg_lower_left: ['Lower_Leg_L_ML', 'Ankle_L_ML'],
  leg_lower_right: ['Lower_Leg_R_ML', 'Ankle_R_ML'],
  foot_left: ['Foot_L_ML', 'Sole_L_ML', 'Heel_L_ML', 'Big_toe_L_ML', 'Other_toes_L_ML'],
  foot_right: ['Foot_R_ML', 'Sole_R_ML', 'Heel_R_ML', 'Big_toe_R_MI', 'Other_toes_R_ML']
};

// Defined front and back regions for the torso
export const frontSide = ['chest', 'abdomen', 'shoulder_left', 'shoulder_right', 'neck'];
export const backSide = ['upper_back', 'lower_back'];

// Modified the adjacentRegions mapping to properly isolate body parts
export const adjacentRegions: RegionAdjacentMap = {
  head: ['neck'],
  neck: ['head', 'torso_front', 'torso_back', 'shoulder_left', 'shoulder_right'],
  
  torso_front: ['neck', 'hip', 'shoulder_left', 'shoulder_right'],
  torso_back: ['neck', 'hip', 'shoulder_left', 'shoulder_right'],
  
  shoulder_left: ['neck', 'arm_upper_left', 'torso_front', 'torso_back'],
  shoulder_right: ['neck', 'arm_upper_right', 'torso_front', 'torso_back'],
  
  arm_upper_left: ['shoulder_left', 'arm_lower_left'],
  arm_upper_right: ['shoulder_right', 'arm_lower_right'],
  arm_lower_left: ['arm_upper_left', 'hand_left'],
  arm_lower_right: ['arm_upper_right', 'hand_right'],
  hand_left: ['arm_lower_left'],
  hand_right: ['arm_lower_right'],
  
  hip: ['torso_front', 'torso_back', 'leg_upper_left', 'leg_upper_right'],
  
  // Kept legs separated from each other
  leg_upper_left: ['hip', 'leg_lower_left'],
  leg_upper_right: ['hip', 'leg_lower_right'],
  leg_lower_left: ['leg_upper_left', 'foot_left'],
  leg_lower_right: ['leg_upper_right', 'foot_right'],
  foot_left: ['leg_lower_left'],
  foot_right: ['leg_lower_right']
};

// Reversed mapping to determine region from mesh name
export const meshToRegion: MeshToRegionMap = {};
Object.entries(bodyRegions).forEach(([region, meshes]) => {
  meshes.forEach(mesh => {
    meshToRegion[mesh] = region;
  });
});

// Defined which parts of the body should be treated as having distinct front/back sides
export const partsWithFrontBackSides = [
  'Neck_ML',
  'Shoulder_L_ML',
  'Shoulder_R_ML',
  'Hip_ML'
];