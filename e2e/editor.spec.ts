import { expect, test } from '@playwright/test';

test.describe('InkflowEditor browser workflows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.inkflow-container')).toBeVisible();
    });

    test('initializes and exposes sanitized public HTML', async ({ page }) => {
        await expect(page.locator('.inkflow-editor-body')).toContainText('Hello Inkflow!');

        await page.evaluate(() => {
            window.editor.setHTML('<p onclick="alert(1)"><b>Browser</b><script>alert(1)</script></p>');
        });

        await expect
            .poll(() => page.evaluate(() => window.editor.getHTML()))
            .toBe('<p><strong>Browser</strong></p>');
    });

    test('edits content and routes toolbar undo redo through editor history', async ({ page }) => {
        const editorBody = page.locator('.inkflow-editor-body');

        await page.evaluate(() => window.editor.setHTML('<p>Initial</p>'));
        await editorBody.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.type('Changed');

        await expect.poll(() => page.evaluate(() => window.editor.getText())).toBe('Changed');

        await page.getByRole('button', { name: 'Undo' }).click();
        await expect.poll(() => page.evaluate(() => window.editor.getHTML())).toBe('<p>Initial</p>');

        await page.getByRole('button', { name: 'Redo' }).click();
        await expect.poll(() => page.evaluate(() => window.editor.getText())).toBe('Changed');
    });

    test('sanitizes source mode edits when switching back to visual mode', async ({ page }) => {
        await page.evaluate(() => window.editor.setHTML('<p>Initial</p>'));
        await page.getByRole('button', { name: 'Source Code' }).click();

        const sourceArea = page.locator('.inkflow-source-area');
        await expect(sourceArea).toBeVisible();
        await sourceArea.fill('<p onclick="alert(1)"><b>Source</b><script>alert(1)</script></p>');

        await page.getByRole('button', { name: 'Source Code' }).click();

        await expect(sourceArea).toBeHidden();
        await expect.poll(() => page.evaluate(() => window.editor.getHTML())).toBe(
            '<p><strong>Source</strong></p>'
        );
    });

    test('opens emoji picker with multi-column layout and navigates tabs smoothly', async ({ page }) => {
        const emojiBtn = page.getByRole('button', { name: 'Emoji' });
        await emojiBtn.click();

        const picker = page.locator('.inkflow-emoji-picker');
        await expect(picker).toBeVisible();

        // 1. 验证网格布局（确保 CSS 正确加载生效，不是一行靠左单图标）
        const grid = page.locator('.inkflow-emoji-grid').first();
        await expect(grid).toBeVisible();
        const gridBox = await grid.boundingBox();
        expect(gridBox).not.toBeNull();
        expect(gridBox!.width).toBeGreaterThan(240);
        expect(gridBox!.height).toBeGreaterThan(100);

        // 2. 验证多列表情按钮（同行并列展示，非垂直单列）
        const emojiBtns = grid.locator('.inkflow-emoji-btn');
        const count = await emojiBtns.count();
        expect(count).toBeGreaterThan(10);
        const btn0 = await emojiBtns.nth(0).boundingBox();
        const btn1 = await emojiBtns.nth(1).boundingBox();
        expect(btn0).not.toBeNull();
        expect(btn1).not.toBeNull();
        expect(btn1!.x).toBeGreaterThan(btn0!.x);

        // 3. 验证点击 Tab 切换分类与平滑滚动
        const tabs = page.locator('.inkflow-emoji-tab');
        const tabCount = await tabs.count();
        expect(tabCount).toBeGreaterThanOrEqual(6);

        // 点击最后一个 Tab (如音乐分类)
        const lastTab = tabs.last();
        await lastTab.click();

        // 验证最后一个 Tab 获得 is-active
        await expect(lastTab).toHaveClass(/is-active/);

        // 验证滚动容器滚动位置大于 100px
        const scrollArea = page.locator('.inkflow-emoji-scroll-area');
        await expect
            .poll(async () => {
                return await scrollArea.evaluate(el => el.scrollTop);
            })
            .toBeGreaterThan(100);
    });

    test('validates standalone UMD demo page emoji grid and navigation', async ({ page }) => {
        await page.goto('/demo/index.html');
        await expect(page.locator('#editor-container .inkflow-container')).toBeVisible();

        const emojiBtn = page.getByRole('button', { name: 'Emoji' });
        await emojiBtn.click();

        const picker = page.locator('.inkflow-emoji-picker');
        await expect(picker).toBeVisible();

        // 验证网格多列横向排列
        const grid = page.locator('.inkflow-emoji-grid').first();
        const emojiBtns = grid.locator('.inkflow-emoji-btn');
        const btn0 = await emojiBtns.nth(0).boundingBox();
        const btn1 = await emojiBtns.nth(1).boundingBox();
        expect(btn0).not.toBeNull();
        expect(btn1).not.toBeNull();
        expect(btn1!.x).toBeGreaterThan(btn0!.x);

        // 验证点击 Tab 切换分类
        const tabs = page.locator('.inkflow-emoji-tab');
        const lastTab = tabs.last();
        await lastTab.click();
        await expect(lastTab).toHaveClass(/is-active/);

        const scrollArea = page.locator('.inkflow-emoji-scroll-area');
        await expect
            .poll(async () => {
                return await scrollArea.evaluate(el => el.scrollTop);
            })
            .toBeGreaterThan(100);
    });
});
