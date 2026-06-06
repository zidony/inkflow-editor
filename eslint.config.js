import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier';

const browserGlobals = {
    ClipboardEvent: 'readonly',
    CustomEvent: 'readonly',
    DOMParser: 'readonly',
    DocumentFragment: 'readonly',
    DragEvent: 'readonly',
    Element: 'readonly',
    Event: 'readonly',
    File: 'readonly',
    FileReader: 'readonly',
    HTMLButtonElement: 'readonly',
    HTMLImageElement: 'readonly',
    HTMLElement: 'readonly',
    HTMLInputElement: 'readonly',
    HTMLParagraphElement: 'readonly',
    HTMLSelectElement: 'readonly',
    HTMLTableCellElement: 'readonly',
    HTMLTextAreaElement: 'readonly',
    KeyboardEvent: 'readonly',
    MouseEvent: 'readonly',
    Node: 'readonly',
    Range: 'readonly',
    Text: 'readonly',
    URL: 'readonly',
    console: 'readonly',
    document: 'readonly',
    setTimeout: 'readonly',
    window: 'readonly'
};

export default [
    {
        ignores: ['dist/**', 'demo-dist/**', 'node_modules/**', '*.css', '*.html']
    },
    {
        files: ['src/**/*.ts', 'tests/**/*.ts', 'vitest.config.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: browserGlobals
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'no-undef': 'error',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': 'error'
        }
    },
    {
        files: ['scripts/**/*.js', '*.config.js'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                Buffer: 'readonly',
                console: 'readonly',
                process: 'readonly',
                Uint32Array: 'readonly'
            }
        }
    },
    prettier
];
