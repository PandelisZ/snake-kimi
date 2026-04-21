import * as THREE from 'three';
import { CELL_SIZE, SHARED } from './config.js';

export function createSnake(scene) {
  const snakeSegments = [];
  const startPositions = [
    { x: 0, z: 0 },
    { x: -1, z: 0 },
    { x: -2, z: 0 }
  ];

  for (let i = 0; i < startPositions.length; i++) {
    const mat = i === 0 ? SHARED.MAT_HEAD : (i % 2 === 1 ? SHARED.MAT_BODY_A : SHARED.MAT_BODY_B);
    const mesh = new THREE.Mesh(SHARED.SEG_GEO, mat);
    const pos = startPositions[i];
    mesh.position.set(pos.x * CELL_SIZE, 0, pos.z * CELL_SIZE);
    mesh.castShadow = true;
    scene.add(mesh);
    snakeSegments.push({ mesh, x: pos.x, z: pos.z });
  }

  if (snakeSegments.length > 0) {
    snakeSegments[0].mesh.scale.set(1.05, 1.05, 1.05);
  }

  return snakeSegments;
}

export function resetSnake(scene, snakeSegments) {
  snakeSegments.forEach(s => scene.remove(s.mesh));
  return createSnake(scene);
}

export function recolorBody(snakeSegments) {
  for (let i = 1; i < snakeSegments.length; i++) {
    snakeSegments[i].mesh.material = (i % 2 === 1 ? SHARED.MAT_BODY_A : SHARED.MAT_BODY_B);
    snakeSegments[i].mesh.scale.set(1, 1, 1);
  }
}
