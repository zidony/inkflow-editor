import type { EmojiExtension } from '../types/index';
import { emojiToHTML, type ParseEmojiOptions } from './renderer';
import { createEmojiPicker, type EmojiPickerOptions } from './picker';

export interface EmojiExtensionOptions extends Partial<ParseEmojiOptions> {
    pickerOptions?: Partial<EmojiPickerOptions>;
}

/**
 * Creates the EmojiExtension for InkflowEditor.
 * Maintains compatibility with InkflowEditor's extension interface.
 */
export function emojiExtension(options: EmojiExtensionOptions = {}): EmojiExtension {
    return {
        parseHTML: (html: string) => emojiToHTML(html, options),
        mountPicker: ({ wrapper, button, cleanup, onSelect }) => {
            const picker = createEmojiPicker({
                container: wrapper,
                assetBase: options.assetBase,
                ...options.pickerOptions,
                onSelect: ({ char, src }) => {
                    onSelect(char, src);
                }
            });

            const onBtnClick = (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                picker.toggle(button);
            };

            button.addEventListener('click', onBtnClick);

            cleanup.push(() => {
                button.removeEventListener('click', onBtnClick);
                picker.destroy();
            });
        }
    };
}

