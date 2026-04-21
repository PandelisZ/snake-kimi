const { test, expect } = require('@playwright/test');
const { GamePage } = require('./page-objects/game.page');

test.describe('Snake Game', () => {
  /** @type {GamePage} */
  let game;

  test.beforeEach(async ({ page }) => {
    game = new GamePage(page);
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
    });
    await game.goto();
  });

  test('title screen is visible on load', async () => {
    await game.expectTitleVisible();
    await expect(game.startButton).toBeVisible();
  });

  test('clicking start hides title and shows hud', async () => {
    await game.startGame();
    const state = await game.getGameState();
    expect(state.titleHidden).toBe(true);
    await expect(game.hud).toBeVisible();
  });

  test('snake dies by hitting wall', async () => {
    await game.startGame();
    // Hold right to hit the right wall
    for (let i = 0; i < 12; i++) {
      await game.pressKey('ArrowRight');
      await game.page.waitForTimeout(160);
    }
    await game.expectGameOverVisible();
  });

  test('restart after game over resets score', async () => {
    await game.startGame();
    for (let i = 0; i < 12; i++) {
      await game.pressKey('ArrowRight');
      await game.page.waitForTimeout(160);
    }
    await game.expectGameOverVisible();
    await game.restartGame();
    await game.expectGameOverHidden();
    await game.expectScore(0);
  });

  test('wall wrap toggle works', async () => {
    await game.toggleWrap();
    await expect(game.wrapToggleTitle).toHaveText('Wall Wrap: ON');
    await game.startGame();
    // Hold right - with wrap on, should not die
    for (let i = 0; i < 15; i++) {
      await game.pressKey('ArrowRight');
      await game.page.waitForTimeout(160);
    }
    // Should still be alive (no game over)
    const state = await game.getGameState();
    expect(state.gameOverHidden).toBe(true);
  });

  test('level display starts at 1', async () => {
    await game.startGame();
    await game.expectLevel(1);
  });

  test('power-up badge UI exists', async () => {
    const speedBadge = game.page.locator('#powerup-speed');
    const shieldBadge = game.page.locator('#powerup-shield');
    await expect(speedBadge).toHaveClass(/powerup-badge/);
    await expect(shieldBadge).toHaveClass(/powerup-badge/);
  });
});
