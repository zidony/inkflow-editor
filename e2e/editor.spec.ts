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
});
