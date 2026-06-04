import type { ThemeClasses, LocaleDict } from '../types/index';
import { emojiData, toCodePoint, emojiAssets } from './emojis';

export class EmojiPicker {
    private container: HTMLElement;
    private pickerEl: HTMLElement;
    private buttonEl: HTMLElement;
    private cleanupFnList: Array<() => void>;
    private locale: LocaleDict;

    constructor(
        wrapper: HTMLElement,
        buttonEl: HTMLElement,
        _theme: ThemeClasses,
        locale: LocaleDict,
        cleanupFnList: Array<() => void>,
        onSelect: (emoji: string, src: string) => void
    ) {
        this.container = wrapper;
        this.buttonEl = buttonEl;
        this.locale = locale;
        this.cleanupFnList = cleanupFnList;
        this.pickerEl = this.createPicker(onSelect);
        
        this.container.appendChild(this.pickerEl);
        this.bindEvents();
    }

    private createPicker(onSelect: (emoji: string, src: string) => void): HTMLElement {
        const picker = document.createElement('div');
        picker.className = 'inkflow-emoji-picker';

        const tabsEl = document.createElement('div');
        tabsEl.className = 'inkflow-emoji-tabs';
        picker.appendChild(tabsEl);

        const contentEl = document.createElement('div');
        contentEl.className = 'inkflow-emoji-content';
        picker.appendChild(contentEl);

        const categoryPanels: HTMLElement[] = [];
        const tabButtons: HTMLElement[] = [];

        emojiData.forEach((category, index) => {
            const catName = this.locale.emojiCategories?.[category.name] || category.name;

            const tabBtn = document.createElement('button');
            tabBtn.className = 'inkflow-emoji-tab';
            tabBtn.type = 'button';
            tabBtn.textContent = catName;
            
            const panel = document.createElement('div');
            panel.className = 'inkflow-emoji-category-panel';
            panel.style.display = index === 0 ? 'grid' : 'none';

            category.emojis.forEach(emoji => {
                const codePoint = toCodePoint(emoji);
                const assetPath = `../assets/emojis/${codePoint}.svg`;
                const src = emojiAssets[assetPath] || '';

                const btn = document.createElement('button');
                btn.className = 'inkflow-emoji-btn';
                btn.title = emoji;
                btn.type = 'button';
                
                if (src) {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = emoji;
                    img.loading = 'lazy';
                    btn.appendChild(img);
                } else {
                    btn.textContent = emoji;
                }

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.pickerEl.classList.remove('is-visible');
                    this.buttonEl.setAttribute('aria-expanded', 'false');
                    onSelect(emoji, src);
                });

                panel.appendChild(btn);
            });

            tabBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Switch tabs
                tabButtons.forEach(btn => btn.classList.remove('is-active'));
                categoryPanels.forEach(p => p.style.display = 'none');
                tabBtn.classList.add('is-active');
                panel.style.display = 'grid';
            });

            if (index === 0) tabBtn.classList.add('is-active');

            tabButtons.push(tabBtn);
            tabsEl.appendChild(tabBtn);

            categoryPanels.push(panel);
            contentEl.appendChild(panel);
        });

        return picker;
    }

    private bindEvents(): void {
        this.buttonEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isVisible = this.pickerEl.classList.contains('is-visible');
            this.pickerEl.classList.toggle('is-visible');
            this.buttonEl.setAttribute('aria-expanded', (!isVisible).toString());
            
            // Scroll to top when opening
            if (!isVisible) {
                this.pickerEl.scrollTop = 0;
            }
        });

        const docClickListener = (e: MouseEvent) => {
            if (!this.container.contains(e.target as Node)) {
                this.pickerEl.classList.remove('is-visible');
                this.buttonEl.setAttribute('aria-expanded', 'false');
            }
        };

        document.addEventListener('click', docClickListener);
        this.cleanupFnList.push(() => {
            document.removeEventListener('click', docClickListener);
        });
    }
}
