import * as THREE from 'three';

// ==================== CONFIGURATION ====================
export const GRID_SIZE = 20;
export const CELL_SIZE = 1;
export const MOVE_INTERVAL_BASE = 150;

export const COLORS = {
  head: 0x4CAF50,
  bodyA: 0x388E3C,
  bodyB: 0x2E7D32,
  food: 0xFF9800,
  foodEmissive: 0xFF5722,
  bg: 0x0a0a0a,
  wall: 0x333333
};

export const SHARED = {
  SEG_GEO: new THREE.BoxGeometry(0.9, 0.9, 0.9),
  MAT_HEAD: new THREE.MeshStandardMaterial({
    color: COLORS.head,
    emissive: 0x2E7D32,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.2
  }),
  MAT_BODY_A: new THREE.MeshStandardMaterial({
    color: COLORS.bodyA,
    emissive: 0x1B5E20,
    emissiveIntensity: 0.15,
    roughness: 0.4,
    metalness: 0.1
  }),
  MAT_BODY_B: new THREE.MeshStandardMaterial({
    color: COLORS.bodyB,
    emissive: 0x1B5E20,
    emissiveIntensity: 0.1,
    roughness: 0.4,
    metalness: 0.1
  }),
  MAT_WALL: new THREE.MeshStandardMaterial({
    color: COLORS.wall,
    emissive: 0x222222,
    emissiveIntensity: 0.1,
    roughness: 0.8
  })
};
