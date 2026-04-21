const { expect } = require('@playwright/test');

class GamePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForSelector('#game-canvas', { state: 'visible' });
    await this.page.waitForTimeout(500);
  }

  get titleScreen() { return this.page.locator('#title-screen'); }
  get gameOverScreen() { return this.page.locator('#gameover-screen'); }
  get hud() { return this.page.locator('#hud'); }
  get startButton() { return this.page.locator('#start-btn'); }
  get restartButton() { return this.page.locator('#restart-btn'); }
  get wrapToggleTitle() { return this.page.locator('#toggle-wrap-btn'); }
  get wrapToggleGameOver() { return this.page.locator('#toggle-wrap-gameover'); }
  get scoreEl() { return this.page.locator('#score'); }
  get bestEl() { return this.page.locator('#best'); }
  get levelEl() { return this.page.locator('#level'); }
  get finalScoreEl() { return this.page.locator('#final-score'); }
  get comboDisplay() { return this.page.locator('#combo-display'); }

  async startGame() {
    await this.startButton.click();
    await this.page.waitForTimeout(200);
  }

  async restartGame() {
    await this.restartButton.click();
    await this.page.waitForTimeout(200);
  }

  async toggleWrap() {
    await this.wrapToggleTitle.click();
  }

  async toggleWrapGameOver() {
    await this.wrapToggleGameOver.click();
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(200);
  }

  async waitForGameOver(timeout = 15000) {
    await this.gameOverScreen.waitFor({ state: 'visible', timeout });
  }

  async expectTitleVisible() {
    await expect(this.titleScreen).not.toHaveClass(/hidden/);
  }

  async expectGameOverVisible() {
    await expect(this.gameOverScreen).not.toHaveClass(/hidden/);
  }

  async expectGameOverHidden() {
    await expect(this.gameOverScreen).toHaveClass(/hidden/);
  }

  async expectScore(expected) {
    await expect(this.scoreEl).toHaveText(String(expected));
  }

  async expectLevel(expected) {
    await expect(this.levelEl).toHaveText(String(expected));
  }

  async getScore() {
    return this.scoreEl.textContent();
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: false });
  }

  async getGameState() {
    return this.page.evaluate(() => ({
      score: document.getElementById('score').textContent,
      best: document.getElementById('best').textContent,
      level: document.getElementById('level').textContent,
      titleHidden: document.getElementById('title-screen').classList.contains('hidden'),
      gameOverHidden: document.getElementById('gameover-screen').classList.contains('hidden'),
      comboActive: document.getElementById('combo-display').classList.contains('active'),
    }));
  }
}

module.exports = { GamePage };
