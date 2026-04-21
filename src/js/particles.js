import * as THREE from 'three';
import { CELL_SIZE } from './config.js';

export function spawnParticles(scene, particles, x, z, count = 6) {
  const colors = [0xFF9800, 0xFF5722, 0xFFEB3B, 0x4CAF50, 0x00E5FF];
  const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);

  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x * CELL_SIZE, 0, z * CELL_SIZE);
    scene.add(mesh);

    particles.push({
      mesh,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.15 + 0.05,
      vz: (Math.random() - 0.5) * 0.2,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.02
    });
  }
}

export function updateParticles(particles, scene) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.mesh.position.x += p.vx;
    p.mesh.position.y += p.vy;
    p.mesh.position.z += p.vz;
    p.vy -= 0.006;
    p.life -= p.decay;
    p.mesh.scale.setScalar(Math.max(0.01, p.life));
    p.mesh.rotation.x += 0.05;
    p.mesh.rotation.y += 0.05;

    if (p.life <= 0 || p.mesh.position.y < -2) {
      scene.remove(p.mesh);
      particles.splice(i, 1);
    }
  }
}

// Trail effects
export function spawnTrail(scene, trailParticles, x, z) {
  const geo = new THREE.BoxGeometry(0.6, 0.05, 0.6);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x4CAF50,
    transparent: true,
    opacity: 0.4
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x * CELL_SIZE, -0.45, z * CELL_SIZE);
  scene.add(mesh);
  trailParticles.push({ mesh, life: 1.0 });
}

export function updateTrailParticles(trailParticles, scene) {
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const t = trailParticles[i];
    t.life -= 0.015;
    t.mesh.material.opacity = t.life * 0.4;
    t.mesh.scale.setScalar(0.5 + t.life * 0.5);
    if (t.life <= 0) {
      scene.remove(t.mesh);
      trailParticles.splice(i, 1);
    }
  }
}
