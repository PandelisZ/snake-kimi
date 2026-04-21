import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, SHARED } from './config.js';

export function createBoard(scene) {
  const walls = [];

  // Dark floor plane
  const floorGeo = new THREE.PlaneGeometry(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid lines
  const grid = new THREE.GridHelper(GRID_SIZE * CELL_SIZE, GRID_SIZE, 0x444444, 0x222222);
  grid.position.y = -0.49;
  scene.add(grid);

  // Border walls
  const wallHeight = 1;
  const wallThick = 0.2;
  const half = GRID_SIZE * CELL_SIZE / 2;
  const wallGeo = new THREE.BoxGeometry(1, 1, 1);

  function addWall(sx, sy, sz, dx, dy, dz) {
    const wall = new THREE.Mesh(wallGeo, SHARED.MAT_WALL);
    wall.scale.set(sx, sy, sz);
    wall.position.set(dx, dy, dz);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    walls.push(wall);
  }

  // Top wall
  addWall(GRID_SIZE * CELL_SIZE + wallThick * 2, wallHeight, wallThick, 0, wallHeight / 2 - 0.5, -half - wallThick / 2);
  // Bottom wall
  addWall(GRID_SIZE * CELL_SIZE + wallThick * 2, wallHeight, wallThick, 0, wallHeight / 2 - 0.5, half + wallThick / 2);
  // Left wall
  addWall(wallThick, wallHeight, GRID_SIZE * CELL_SIZE + wallThick * 2, -half - wallThick / 2, wallHeight / 2 - 0.5, 0);
  // Right wall
  addWall(wallThick, wallHeight, GRID_SIZE * CELL_SIZE + wallThick * 2, half + wallThick / 2, wallHeight / 2 - 0.5, 0);

  return { walls, floor, grid };
}
