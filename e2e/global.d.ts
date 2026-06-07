import type { InkflowEditor } from '../src/core/editor';

declare global {
    interface Window {
        editor: InkflowEditor;
    }
}

export {};
