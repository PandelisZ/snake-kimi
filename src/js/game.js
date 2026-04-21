import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, MOVE_INTERVAL_BASE, COLORS, SHARED } from './config.js';
import { initAudio, playTone, playEatSound, playCrashSound, playGoldenSound, playLevelUpSound } from './audio.js';
import { createScene, createCamera, createRenderer, setupLights } from './renderer.js';
import { createBoard } from './board.js';
import { createSnake, resetSnake, recolorBody } from './snake.js';
import { createFood, placeFood, spawnGoldenFood, removeGoldenFood } from './food.js';
import { spawnParticles, updateParticles, spawnTrail, updateTrailParticles } from './particles.js';

// ==================== GAME ENGINE ====================
export class SnakeGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = createScene();
    this.camera = createCamera();
    this.renderer = createRenderer(canvas);
    setupLights(this.scene);

    this.snakeSegments = [];
    this.particles = [];
    this.trailParticles = [];
    this.walls = [];
    this.foodMesh = null;
    this.foodLight = null;
    this.goldenFoodMesh = null;
    this.goldenFoodLight = null;
    this.goldenFoodActive = false;

    this.direction = { x: 1, z: 0 };
    this.nextDirection = { x: 1, z: 0 };
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('snakeBest') || '0', 10);
    this.gameRunning = false;
    this.moveInterval = MOVE_INTERVAL_BASE;
    this.comboCount = 0;
    this.lastEatTime = 0;
    this.foodsEaten = 0;
    this.level = 1;
    this.lastMoveTime = 0;
    this.animTime = 0;
    this.gameTime = 0;
    this.screenShake = 0;
    this.wallWrapMode = false;

    // Epic features
    this.powerUps = { speed: false, shield: false };
    this.powerUpTimers = { speed: 0, shield: 0 };
    this.baseMoveInterval = MOVE_INTERVAL_BASE;
    this.floatingTexts = [];
    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.isNewBest = false;

    // UI refs
    this.scoreEl = document.getElementById('score');
    this.bestEl = document.getElementById('best');
    this.levelEl = document.getElementById('level');
    this.comboDisplay = document.getElementById('combo-display');
    this.comboCountEl = document.getElementById('combo-count');
    this.titleScreen = document.getElementById('title-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.finalScoreEl = document.getElementById('final-score');
    this.finalBestEl = document.getElementById('final-best');
    this.powerupSpeedEl = document.getElementById('powerup-speed');
    this.powerupShieldEl = document.getElementById('powerup-shield');

    this.bestEl.textContent = String(this.bestScore);

    this.createBoard();
    this.createSnake();
    this.createFood();

    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.setupDpad();

    document.getElementById('start-btn').addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
    this.setupWrapToggles();
  }

  createBoard() {
    const result = createBoard(this.scene);
    this.walls = result.walls;
  }

  createSnake() {
    this.snakeSegments = createSnake(this.scene);
  }

  createFood() {
    const { foodMesh, foodLight } = createFood(this.scene);
    this.foodMesh = foodMesh;
    this.foodLight = foodLight;
  }

  setupWrapToggles() {
    const wrapBtn = document.getElementById('toggle-wrap-btn');
    const gameoverWrapBtn = document.getElementById('toggle-wrap-gameover');

    if (wrapBtn) {
      wrapBtn.addEventListener('click', () => {
        this.wallWrapMode = !this.wallWrapMode;
        wrapBtn.textContent = 'Wall Wrap: ' + (this.wallWrapMode ? 'ON' : 'OFF');
        if (gameoverWrapBtn) gameoverWrapBtn.textContent = 'Wall Wrap: ' + (this.wallWrapMode ? 'ON' : 'OFF');
      });
    }

    if (gameoverWrapBtn) {
      gameoverWrapBtn.addEventListener('click', () => {
        this.wallWrapMode = !this.wallWrapMode;
        gameoverWrapBtn.textContent = 'Wall Wrap: ' + (this.wallWrapMode ? 'ON' : 'OFF');
        if (wrapBtn) wrapBtn.textContent = 'Wall Wrap: ' + (this.wallWrapMode ? 'ON' : 'OFF');
      });
    }
  }

  setupDpad() {
    const up = document.querySelector('.dpad-up');
    const down = document.querySelector('.dpad-down');
    const left = document.querySelector('.dpad-left');
    const right = document.querySelector('.dpad-right');

    if (!up || !down || !left || !right) return;

    up.addEventListener('touchstart', (e) => { e.preventDefault(); this.queueDir(0, -1); });
    down.addEventListener('touchstart', (e) => { e.preventDefault(); this.queueDir(0, 1); });
    left.addEventListener('touchstart', (e) => { e.preventDefault(); this.queueDir(-1, 0); });
    right.addEventListener('touchstart', (e) => { e.preventDefault(); this.queueDir(1, 0); });

    up.addEventListener('click', () => this.queueDir(0, -1));
    down.addEventListener('click', () => this.queueDir(0, 1));
    left.addEventListener('click', () => this.queueDir(-1, 0));
    right.addEventListener('click', () => this.queueDir(1, 0));
  }

  queueDir(x, z) {
    if (this.direction.x === -x && this.direction.z === -z) return;
    this.nextDirection = { x, z };
  }

  onKeyDown(e) {
    if (!this.gameRunning) return;
    switch (e.key) {
      case 'ArrowUp':
        this.queueDir(0, -1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        this.queueDir(0, 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        this.queueDir(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.queueDir(1, 0);
        e.preventDefault();
        break;
    }
  }

  startGame() {
    this.titleScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.resetGame();
  }

  resetGame() {
    this.score = 0;
    this.scoreEl.textContent = '0';
    this.direction = { x: 1, z: 0 };
    this.nextDirection = { x: 1, z: 0 };
    this.gameRunning = true;
    this.moveInterval = MOVE_INTERVAL_BASE;
    this.comboCount = 0;
    this.lastEatTime = 0;
    this.foodsEaten = 0;
    this.level = 1;
    this.levelEl.textContent = '1';
    this.comboDisplay.classList.remove('active');
    this.screenShake = 0;
    this.isNewBest = false;

    // Reset power-ups
    this.powerUps = { speed: false, shield: false };
    this.powerUpTimers = { speed: 0, shield: 0 };
    if (this.powerupSpeedEl) this.powerupSpeedEl.classList.remove('active');
    if (this.powerupShieldEl) this.powerupShieldEl.classList.remove('active');

    // Remove old snake
    this.snakeSegments.forEach(s => this.scene.remove(s.mesh));
    this.createSnake();
    placeFood(this.foodMesh, this.foodLight, this.snakeSegments, this.goldenFoodMesh);

    // Clear particles
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];
    this.trailParticles.forEach(t => this.scene.remove(t.mesh));
    this.trailParticles = [];

    // Clear floating texts
    this.floatingTexts.forEach(ft => { if (ft.el && ft.el.parentNode) ft.el.parentNode.removeChild(ft.el); });
    this.floatingTexts = [];

    // Remove golden food
    const result = removeGoldenFood(this.scene, this.goldenFoodMesh, this.goldenFoodLight);
    this.goldenFoodMesh = result.goldenFoodMesh;
    this.goldenFoodLight = result.goldenFoodLight;
    this.goldenFoodActive = false;

    this.gameoverScreen.classList.add('hidden');
    this.lastMoveTime = performance.now();
    initAudio();
  }

  gameOver() {
    this.gameRunning = false;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.isNewBest = true;
      localStorage.setItem('snakeBest', String(this.bestScore));
      this.bestEl.textContent = String(this.bestScore);
      // Flash new best
      this.bestEl.classList.remove('new-best');
      void this.bestEl.offsetWidth;
      this.bestEl.classList.add('new-best');
    }

    this.finalScoreEl.textContent = String(this.score);
    this.finalBestEl.textContent = String(this.bestScore);
    document.getElementById('level-reached').textContent = 'Level Reached: ' + this.level;
    this.gameoverScreen.classList.remove('hidden');

    this.comboDisplay.classList.remove('active');
    this.comboCount = 0;
  }

  moveSnake() {
    this.direction = { ...this.nextDirection };

    const head = this.snakeSegments[0];
    let newX = head.x + this.direction.x;
    let newZ = head.z + this.direction.z;

    const half = Math.floor(GRID_SIZE / 2);
    if (newX < -half || newX >= half || newZ < -half || newZ >= half) {
      if (this.wallWrapMode) {
        if (newX < -half) newX = half - 1;
        else if (newX >= half) newX = -half;
        if (newZ < -half) newZ = half - 1;
        else if (newZ >= half) newZ = -half;
      } else if (this.powerUps.shield) {
        // Shield protects - bounce back in opposite direction
        this.nextDirection = { x: -this.direction.x, z: -this.direction.z };
        this.direction = { ...this.nextDirection };
        newX = head.x + this.direction.x;
        newZ = head.z + this.direction.z;
        this.spawnFloatingText('BOUNCED!', 'shield', window.innerWidth / 2, window.innerHeight / 2);
      } else {
        this.screenShake = 0.8;
        playCrashSound();
        this.gameOver();
        return;
      }
    }

    // Self collision
    for (let i = 0; i < this.snakeSegments.length; i++) {
      if (this.snakeSegments[i].x === newX && this.snakeSegments[i].z === newZ) {
        if (this.powerUps.shield) {
          // Shield: ignore self collision
          return;
        }
        this.screenShake = 0.8;
        playCrashSound();
        this.gameOver();
        return;
      }
    }

    const ateFood = (newX === this.foodMesh.userData.x && newZ === this.foodMesh.userData.z);
    const ateGolden = this.goldenFoodActive && this.goldenFoodMesh &&
      (newX === this.goldenFoodMesh.userData.x && newZ === this.goldenFoodMesh.userData.z);

    if (ateFood || ateGolden) {
      const now = performance.now();
      if (now - this.lastEatTime < 2000) {
        this.comboCount++;
      } else {
        this.comboCount = 1;
      }
      this.lastEatTime = now;

      let points = ateGolden ? 50 : 10;
      points += (this.comboCount - 1) * 5;
      this.score += points;
      this.scoreEl.textContent = String(this.score);

      if (this.comboCount >= 2) {
        this.comboCountEl.textContent = String(this.comboCount);
        this.comboDisplay.classList.add('active');
      } else {
        this.comboDisplay.classList.remove('active');
      }

      this.scoreEl.classList.remove('bump');
      void this.scoreEl.offsetWidth;
      this.scoreEl.classList.add('bump');

      this.screenShake = 0.3;
      spawnParticles(this.scene, this.particles, newX, newZ, ateGolden ? 15 : 6 + this.comboCount * 2);

      if (ateGolden) {
        playGoldenSound();
      } else {
        playEatSound(this.comboCount);
      }

      // Power-up chance on golden food or every 8th food
      if (ateGolden || this.foodsEaten % 8 === 7) {
        const powerUpType = Math.random() < 0.5 ? 'speed' : 'shield';
        this.activatePowerUp(powerUpType, 5.0);
      }

      this.foodsEaten++;
      if (this.foodsEaten % 5 === 0) {
        this.level++;
        this.levelEl.textContent = String(this.level);
        this.moveInterval = Math.max(60, MOVE_INTERVAL_BASE - (this.level - 1) * 8);
        playLevelUpSound();
      }

      spawnTrail(this.scene, this.trailParticles, head.x, head.z);

      if (ateGolden) {
        const result = removeGoldenFood(this.scene, this.goldenFoodMesh, this.goldenFoodLight);
        this.goldenFoodMesh = result.goldenFoodMesh;
        this.goldenFoodLight = result.goldenFoodLight;
        this.goldenFoodActive = false;
      } else {
        placeFood(this.foodMesh, this.foodLight, this.snakeSegments, this.goldenFoodMesh);
      }

      if (!this.goldenFoodActive && !ateGolden && Math.random() < 0.1) {
        const gf = spawnGoldenFood(this.scene, this.snakeSegments, this.foodMesh);
        this.goldenFoodMesh = gf.goldenFoodMesh;
        this.goldenFoodLight = gf.goldenFoodLight;
        this.goldenFoodActive = true;
      }
    }

    if (!ateFood && !ateGolden) {
      const tail = this.snakeSegments.pop();
      this.scene.remove(tail.mesh);
    }

    const newHead = new THREE.Mesh(SHARED.SEG_GEO, SHARED.MAT_HEAD);
    newHead.position.set(newX * CELL_SIZE, 0, newZ * CELL_SIZE);
    newHead.castShadow = true;
    newHead.receiveShadow = true;
    newHead.scale.set(1.05, 1.05, 1.05);
    this.scene.add(newHead);
    this.snakeSegments.unshift({ mesh: newHead, x: newX, z: newZ });

    recolorBody(this.snakeSegments);
  }

  updateCamera(dt) {
    const head = this.snakeSegments[0];
    if (!head) return;

    const targetX = head.mesh.position.x * 0.3;
    const targetZ = head.mesh.position.z * 0.3 + 18;
    const targetY = 18;

    let camX = this.camera.position.x + (targetX - this.camera.position.x) * 1.5 * dt;
    let camY = this.camera.position.y + (targetY - this.camera.position.y) * 1.5 * dt;
    let camZ = this.camera.position.z + (targetZ - this.camera.position.z) * 1.5 * dt;

    if (this.screenShake > 0) {
      camX += (Math.random() - 0.5) * this.screenShake;
      camY += (Math.random() - 0.5) * this.screenShake;
      camZ += (Math.random() - 0.5) * this.screenShake;
    }

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(head.mesh.position.x * 0.2, 0, head.mesh.position.z * 0.2);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  gameLoop(time) {
    const dt = Math.min((time - (this._lastTime || time)) / 1000, 0.1);
    this._lastTime = time;
    this.animTime += dt;
    this.gameTime += dt;

    if (this.gameRunning && time - this.lastMoveTime >= this.moveInterval) {
      this.moveSnake();
      this.lastMoveTime = time;
    }

    if (this.foodMesh) {
      this.foodMesh.position.y = Math.sin(this.animTime * 3) * 0.15;
      this.foodMesh.rotation.y += dt * 2;
      this.foodLight.position.y = 1 + Math.sin(this.animTime * 3) * 0.15;
    }

    if (this.goldenFoodMesh && this.goldenFoodActive) {
      this.goldenFoodMesh.position.y = Math.sin(this.animTime * 5) * 0.3 + 0.2;
      this.goldenFoodMesh.rotation.x += dt * 3;
      this.goldenFoodMesh.rotation.y += dt * 4;
      this.goldenFoodLight.intensity = 1.5 + Math.sin(this.animTime * 8) * 0.5;
    }

    updateParticles(this.particles, this.scene);
    updateTrailParticles(this.trailParticles, this.scene);
    this.updateCamera(dt);

    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.01) this.screenShake = 0;
    }

    // Update floating text positions
    this.updateFloatingTexts(dt);

    // Update power-up timers
    this.updatePowerUps(dt);

    // Update minimap
    this.updateMinimap();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.el && ft.life > 0) {
        ft.el.style.opacity = Math.max(0, ft.life);
      }
      if (ft.life <= 0 && ft.el && ft.el.parentNode) {
        ft.el.parentNode.removeChild(ft.el);
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  spawnFloatingText(text, colorClass, x, y) {
    const el = document.createElement('div');
    el.className = 'floating-text ' + colorClass;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    this.floatingTexts.push({ el, life: 1.0 });
  }

  activatePowerUp(type, duration) {
    this.powerUps[type] = true;
    this.powerUpTimers[type] = duration;
    if (type === 'speed') {
      this.moveInterval = Math.max(40, this.baseMoveInterval * 0.6);
      if (this.powerupSpeedEl) this.powerupSpeedEl.classList.add('active');
      this.spawnFloatingText('SPEED BOOST!', 'speed', window.innerWidth / 2, window.innerHeight / 2);
    } else if (type === 'shield') {
      if (this.powerupShieldEl) this.powerupShieldEl.classList.add('active');
      this.spawnFloatingText('SHIELD UP!', 'shield', window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  updatePowerUps(dt) {
    for (const type of Object.keys(this.powerUpTimers)) {
      if (this.powerUps[type]) {
        this.powerUpTimers[type] -= dt;
        if (this.powerUpTimers[type] <= 0) {
          this.powerUps[type] = false;
          if (type === 'speed') {
            this.moveInterval = Math.max(60, MOVE_INTERVAL_BASE - (this.level - 1) * 8);
            if (this.powerupSpeedEl) this.powerupSpeedEl.classList.remove('active');
          } else if (type === 'shield') {
            if (this.powerupShieldEl) this.powerupShieldEl.classList.remove('active');
          }
        }
      }
    }
  }

  updateMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const size = 160;
    const cell = size / GRID_SIZE;
    const half = Math.floor(GRID_SIZE / 2);

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size, size);

    // Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }

    // Snake
    for (const seg of this.snakeSegments) {
      const mx = (seg.x + half) * cell;
      const my = (seg.z + half) * cell;
      ctx.fillStyle = seg === this.snakeSegments[0] ? '#4CAF50' : '#2E7D32';
      ctx.fillRect(mx + 1, my + 1, cell - 2, cell - 2);
    }

    // Food
    if (this.foodMesh) {
      const fx = (this.foodMesh.userData.x + half) * cell;
      const fy = (this.foodMesh.userData.z + half) * cell;
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(fx + cell / 2, fy + cell / 2, cell / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden food
    if (this.goldenFoodActive && this.goldenFoodMesh) {
      const gx = (this.goldenFoodMesh.userData.x + half) * cell;
      const gy = (this.goldenFoodMesh.userData.z + half) * cell;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(gx + cell / 2, gy + cell / 2, cell / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  start() {
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
