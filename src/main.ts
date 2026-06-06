import './inkflow-editor.css';
import { InkflowEditor } from './core/editor';
import { emojiExtension } from './emoji';

declare global {
    interface Window {
        editor: InkflowEditor;
    }
}

/**
 * Development Entry Point
 * Used for local testing and debugging of the editor instance.
 */
const editor = new InkflowEditor({
    container: '.inkflow-editor',
    theme: 'inkflow',
    lang: 'en-US',
    size: 'sm', // Small size variants for toolbar and icons
    placeholder: 'Start writing in inkflow-editor...',
    emoji: emojiExtension(),

    hooks: {
        /**
         * Custom hook to handle link insertion.
         */
        onInsertLink: () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const userUrl = window.prompt('[Hook] Enter link URL:', 'https://');
                    resolve(userUrl);
                }, 100);
            });
        },

        /**
         * Custom hook simulating a local file picker for image insertion.
         */
        onInsertImage: () => {
            return new Promise(resolve => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';

                fileInput.addEventListener('change', event => {
                    const target = event.target as HTMLInputElement;
                    const file = target.files?.[0];
                    if (!file) {
                        resolve(null);
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });

                fileInput.click();
            });
        }
    }
});

// Test the setHTML API with initial content
editor.setHTML('<h3>Hello Inkflow!</h3><p>This is a pure Vanilla JS editor.</p>');

// Expose editor instance to global window for browser console testing
window.editor = editor;
