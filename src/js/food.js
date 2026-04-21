import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, COLORS } from './config.js';

export function createFood(scene) {
  const geo = new THREE.SphereGeometry(0.4, 24, 24);
  const mat = new THREE.MeshLambertMaterial({
    color: COLORS.food,
    emissive: COLORS.foodEmissive,
    emissiveIntensity: 0.6
  });
  const foodMesh = new THREE.Mesh(geo, mat);
  foodMesh.castShadow = true;
  scene.add(foodMesh);

  const foodLight = new THREE.PointLight(COLORS.foodEmissive, 1.5, 6);
  scene.add(foodLight);

  placeFood(foodMesh, foodLight, []);

  return { foodMesh, foodLight };
}

export function placeFood(foodMesh, foodLight, snakeSegments, goldenFoodMesh = null) {
  const half = Math.floor(GRID_SIZE / 2);
  let x, z, ok;

  do {
    x = Math.floor(Math.random() * GRID_SIZE) - half;
    z = Math.floor(Math.random() * GRID_SIZE) - half;
    ok = true;
    for (const seg of snakeSegments) {
      if (seg.x === x && seg.z === z) {
        ok = false;
        break;
      }
    }
    if (goldenFoodMesh && goldenFoodMesh.userData.x === x && goldenFoodMesh.userData.z === z) ok = false;
  } while (!ok);

  foodMesh.userData.x = x;
  foodMesh.userData.z = z;
  foodMesh.position.set(x * CELL_SIZE, 0, z * CELL_SIZE);
  foodLight.position.set(x * CELL_SIZE, 1, z * CELL_SIZE);
}

// Golden food
export function spawnGoldenFood(scene, snakeSegments, foodMesh) {
  const geo = new THREE.SphereGeometry(0.5, 32, 32);
  const mat = new THREE.MeshLambertMaterial({
    color: 0xFFD700,
    emissive: 0xFFAA00,
    emissiveIntensity: 0.8
  });
  const goldenFoodMesh = new THREE.Mesh(geo, mat);
  goldenFoodMesh.castShadow = true;
  scene.add(goldenFoodMesh);

  const goldenFoodLight = new THREE.PointLight(0xFFAA00, 2.5, 10);
  scene.add(goldenFoodLight);

  const half = Math.floor(GRID_SIZE / 2);
  let x, z, ok;
  do {
    x = Math.floor(Math.random() * GRID_SIZE) - half;
    z = Math.floor(Math.random() * GRID_SIZE) - half;
    ok = true;
    for (const seg of snakeSegments) {
      if (seg.x === x && seg.z === z) { ok = false; break; }
    }
    if (foodMesh && foodMesh.userData.x === x && foodMesh.userData.z === z) ok = false;
  } while (!ok);

  goldenFoodMesh.userData.x = x;
  goldenFoodMesh.userData.z = z;
  goldenFoodMesh.position.set(x * CELL_SIZE, 0, z * CELL_SIZE);
  goldenFoodLight.position.set(x * CELL_SIZE, 1.5, z * CELL_SIZE);

  return { goldenFoodMesh, goldenFoodLight };
}

export function removeGoldenFood(scene, goldenFoodMesh, goldenFoodLight) {
  if (goldenFoodMesh) scene.remove(goldenFoodMesh);
  if (goldenFoodLight) scene.remove(goldenFoodLight);
  return { goldenFoodMesh: null, goldenFoodLight: null };
}
