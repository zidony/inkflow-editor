import type { EmojiExtension, ThemeClasses, InkflowOptions, LocaleDict } from '../types/index';
import { icons } from './icons';
import { sanitizeHTML, sanitizeHref, sanitizeMediaUrl } from '../utils/security';
import type { CommandAdapter } from '../core/commands';

/**
 * Toolbar Component
 * Manages the creation, state, and event dispatching for the editor toolbar.
 */
export class Toolbar {
    // ============================================================================
    // Fields
    // ============================================================================
    private container: HTMLElement;
    private editorArea: HTMLElement;
    private theme: ThemeClasses;
    private config: Array<string | string[]>;
    private locale: LocaleDict;
    private commands: CommandAdapter;
    private emojiExtension?: EmojiExtension;
    private hooks?: InkflowOptions['hooks'];

    private buttonElements: Map<string, HTMLButtonElement | HTMLElement> = new Map();
    private headingSelectEl: HTMLSelectElement | null = null;
    private cleanupFnList: Array<() => void> = [];

    // ============================================================================
    // Constructor
    // ============================================================================
    /**
     * Initializes the Toolbar and renders it into the container.
     */
    constructor(
        container: HTMLElement,
        editorArea: HTMLElement,
        theme: ThemeClasses,
        config: Array<string | string[]>,
        locale: LocaleDict,
        commands: CommandAdapter,
        emojiExtension?: EmojiExtension,
        hooks?: InkflowOptions['hooks']
    ) {
        this.container = container;
        this.editorArea = editorArea;
        this.theme = theme;
        this.config = config;
        this.locale = locale;
        this.commands = commands;
        this.emojiExtension = emojiExtension;
        this.hooks = hooks;

        this.render();
    }

    // ============================================================================
    // DOM Rendering (Init)
    // ============================================================================
    /**
     * Parses the 2D configuration array and renders DOM elements accordingly.
     */
    private render(): void {
        this.container.innerHTML = '';
        this.container.setAttribute('role', 'toolbar');
        this.container.setAttribute('aria-label', 'Editor Toolbar');
        this.buttonElements.clear();

        this.config.forEach(groupItem => {
            const groupArr = Array.isArray(groupItem) ? groupItem : [groupItem];
            const groupEl = document.createElement('div');
            groupEl.className = this.theme.toolbarGroup;

            groupArr.forEach(itemName => {
                if (itemName === 'heading') {
                    groupEl.appendChild(this.createHeadingSelect());
                } else if (itemName === 'emoji' && !this.emojiExtension) {
                    return;
                } else if (icons[itemName]) {
                    groupEl.appendChild(this.createButton(itemName));
                }
            });

            if (groupEl.childNodes.length > 0) {
                this.container.appendChild(groupEl);
            }
        });
    }

    private createHeadingSelect(): HTMLSelectElement {
        const select = document.createElement('select');
        select.className = this.theme.select;

        const options = [
            { val: 'p', text: this.locale.toolbar.normal || 'Normal' },
            { val: 'h1', text: this.locale.toolbar.h1 || 'H1' },
            { val: 'h2', text: this.locale.toolbar.h2 || 'H2' },
            { val: 'h3', text: this.locale.toolbar.h3 || 'H3' },
            { val: 'h4', text: this.locale.toolbar.h4 || 'H4' },
            { val: 'h5', text: this.locale.toolbar.h5 || 'H5' },
            { val: 'h6', text: this.locale.toolbar.h6 || 'H6' }
        ];

        options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.val;
            optionEl.textContent = opt.text;
            select.appendChild(optionEl);
        });

        select.addEventListener('change', e => {
            const target = e.target as HTMLSelectElement;
            this.executeCommand('heading', target.value);
        });

        this.headingSelectEl = select;
        return select;
    }

    private createButton(btnName: string): HTMLElement {
        if (btnName === 'table') {
            return this.createTablePickerButton(btnName);
        }
        if (btnName === 'emoji' && this.emojiExtension) {
            return this.createEmojiPickerButton(btnName);
        }

        const btnEl = document.createElement('button');
        btnEl.className = this.theme.button;
        btnEl.innerHTML = icons[btnName];
        btnEl.title = this.locale.toolbar[btnName] || btnName;
        btnEl.type = 'button';
        btnEl.setAttribute('aria-label', btnEl.title); // A11y
        btnEl.setAttribute('aria-pressed', 'false'); // A11y

        btnEl.addEventListener('click', e => {
            e.preventDefault();

            if (btnName === 'sourceCode' || btnName === 'fullscreen') {
                btnEl.classList.toggle(this.theme.buttonActive);
            }

            this.executeCommand(btnName);
        });

        this.buttonElements.set(btnName, btnEl);
        return btnEl;
    }

    // ============================================================================
    // Public API
    // ============================================================================
    /**
     * Synchronizes the UI state (active classes, select values) with the current cursor position.
     */
    public updateState(): void {
        this.syncHeadingSelect();
        this.syncButtonsState();
    }

    private syncHeadingSelect(): void {
        if (!this.headingSelectEl) return;
        const currentBlock = this.commands.queryValue('formatBlock').toLowerCase();
        this.headingSelectEl.value = currentBlock || 'p';
    }

    private syncButtonsState(): void {
        const stateQueries: Record<string, string> = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline',
            strike: 'strikeThrough',
            alignLeft: 'justifyLeft',
            alignCenter: 'justifyCenter',
            alignRight: 'justifyRight',
            listUl: 'insertUnorderedList',
            listOl: 'insertOrderedList'
        };

        this.buttonElements.forEach((btnEl, btnName) => {
            let isActive = false;
            if (btnName === 'blockquote') {
                isActive = this.commands.queryValue('formatBlock').toLowerCase() === 'blockquote';
            } else if (stateQueries[btnName]) {
                isActive = this.commands.queryState(stateQueries[btnName]);
            }

            if (isActive) {
                btnEl.classList.add(this.theme.buttonActive);
                btnEl.setAttribute('aria-pressed', 'true');
            } else {
                btnEl.classList.remove(this.theme.buttonActive);
                btnEl.setAttribute('aria-pressed', 'false');
            }
        });
    }

    // ============================================================================
    // Command Dispatching
    // ============================================================================
    /**
     * Central command dispatcher for toolbar actions.
     */
    private executeCommand(command: string, value?: string): void {
        this.commands.focus();

        if (command === 'link') return void this.handleInsertLink();
        if (command === 'image') return void this.handleInsertImage();
        if (command === 'video') return void this.handleInsertVideo();

        const commandMap: Record<string, string> = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline',
            strike: 'strikeThrough',
            alignLeft: 'justifyLeft',
            alignCenter: 'justifyCenter',
            alignRight: 'justifyRight',
            listUl: 'insertUnorderedList',
            listOl: 'insertOrderedList',
            eraser: 'removeFormat',
            undo: 'undo',
            redo: 'redo'
        };

        if (command === 'heading' && value) {
            this.commands.formatBlock(value);
        } else if (command === 'blockquote') {
            const currentBlock = this.commands.queryValue('formatBlock').toLowerCase();
            const targetBlock = currentBlock === 'blockquote' ? 'p' : 'blockquote';
            this.commands.formatBlock(targetBlock);
        } else if (command === 'inlineCode') {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
                const codeNode = document.createElement('code');
                codeNode.textContent = selection.toString();
                const wrapper = document.createElement('span');
                wrapper.appendChild(codeNode);
                this.commands.insertHTML(wrapper.innerHTML);
            } else if (selection && selection.rangeCount > 0) {
                // If no text is selected, create an empty code block and place the cursor inside it
                const codeNode = document.createElement('code');
                codeNode.textContent = '\u200B';
                const range = selection.getRangeAt(0);
                range.insertNode(codeNode);
                range.setStart(codeNode, 1);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else if (command === 'divider') {
            this.commands.insertHorizontalRule();
        } else if (commandMap[command]) {
            this.commands.exec(commandMap[command]);
        } else {
            // Dispatch to Editor for custom handling
            const event = new CustomEvent('inkflow-custom-command', { detail: { command, value } });
            this.container.dispatchEvent(event);
            return;
        }

        this.updateState();

        const historyEvent = new CustomEvent('inkflow-format-changed');
        this.editorArea.dispatchEvent(historyEvent);
    }

    // ============================================================================
    // Async Insert Handlers (Link, Image, Video)
    // ============================================================================
    private async handleInsertLink(): Promise<void> {
        const savedRange = this.saveSelection();
        if (!savedRange) return;

        const url = this.hooks?.onInsertLink
            ? await this.hooks.onInsertLink()
            : window.prompt(this.locale.prompts.linkUrl, this.locale.prompts.linkDefault);

        const safeUrl = url ? sanitizeHref(url) : null;
        if (!safeUrl) return;

        this.restoreSelection(savedRange);
        this.commands.createLink(safeUrl);
        this.postAsyncCommand();
    }

    private async handleInsertImage(): Promise<void> {
        const savedRange = this.saveSelection();
        if (!savedRange) return;

        const url = this.hooks?.onInsertImage
            ? await this.hooks.onInsertImage()
            : window.prompt(this.locale.prompts.imageUrl, this.locale.prompts.linkDefault);

        const safeUrl = url ? sanitizeMediaUrl(url, 'image') : null;
        if (!safeUrl) return;

        this.restoreSelection(savedRange);
        this.commands.insertImage(safeUrl);
        this.postAsyncCommand();
    }

    private async handleInsertVideo(): Promise<void> {
        const savedRange = this.saveSelection();
        if (!savedRange) return;

        const url = this.hooks?.onInsertVideo
            ? await this.hooks.onInsertVideo()
            : window.prompt(this.locale.prompts.videoUrl, this.locale.prompts.linkDefault);

        if (!url) return;

        this.restoreSelection(savedRange);
        const safeUrl = sanitizeMediaUrl(url);
        const videoHtml = url.includes('<iframe')
            ? sanitizeHTML(url)
            : safeUrl
              ? `<video src="${safeUrl}" controls></video>`
              : '';
        if (!videoHtml) return;
        this.commands.insertHTML(videoHtml);
        this.postAsyncCommand();
    }

    private saveSelection(): Range | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
        return selection.getRangeAt(0).cloneRange();
    }

    private restoreSelection(range: Range): void {
        this.editorArea.focus();
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    private postAsyncCommand(): void {
        this.updateState();
        this.editorArea.dispatchEvent(new CustomEvent('inkflow-format-changed'));
    }

    // ============================================================================
    // Complex UI Components (Table Picker)
    // ============================================================================
    private createTablePickerButton(btnName: string): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'inkflow-table-btn-wrapper';

        const btnEl = document.createElement('button');
        btnEl.className = this.theme.button;
        btnEl.innerHTML = icons[btnName];
        btnEl.title = this.locale.toolbar[btnName] || btnName;
        btnEl.type = 'button';
        btnEl.setAttribute('aria-label', btnEl.title);
        btnEl.setAttribute('aria-haspopup', 'true');
        btnEl.setAttribute('aria-expanded', 'false');
        this.buttonElements.set(btnName, btnEl);

        const pickerEl = document.createElement('div');
        pickerEl.className = 'inkflow-table-picker';

        const gridEl = document.createElement('div');
        gridEl.className = 'inkflow-table-picker-grid';

        const labelEl = document.createElement('div');
        labelEl.className = 'inkflow-table-picker-label';
        labelEl.innerText = '0 x 0';

        const cells = this.buildTableGrid(pickerEl, labelEl);
        cells.forEach(cell => gridEl.appendChild(cell));

        pickerEl.appendChild(gridEl);
        pickerEl.appendChild(labelEl);

        wrapper.appendChild(btnEl);
        wrapper.appendChild(pickerEl);

        this.bindTablePickerEvents(wrapper, btnEl, pickerEl, cells, labelEl);

        return wrapper;
    }

    private buildTableGrid(pickerEl: HTMLElement, labelEl: HTMLElement): HTMLElement[] {
        const cells: HTMLElement[] = [];
        for (let r = 1; r <= 10; r++) {
            for (let c = 1; c <= 10; c++) {
                const cell = document.createElement('div');
                cell.className = 'inkflow-table-picker-cell';
                cell.dataset.row = r.toString();
                cell.dataset.col = c.toString();

                cell.addEventListener('mouseover', () => {
                    labelEl.innerText = `${r} x ${c}`;
                    cells.forEach(el => {
                        const elRow = parseInt(el.dataset.row!);
                        const elCol = parseInt(el.dataset.col!);
                        if (elRow <= r && elCol <= c) {
                            el.classList.add('is-hovered');
                        } else {
                            el.classList.remove('is-hovered');
                        }
                    });
                });

                cell.addEventListener('click', () => {
                    pickerEl.classList.remove('is-visible');
                    const event = new CustomEvent('inkflow-custom-command', {
                        detail: { command: 'table', rows: r, cols: c }
                    });
                    this.container.dispatchEvent(event);
                });

                cells.push(cell);
            }
        }
        return cells;
    }

    private bindTablePickerEvents(
        wrapper: HTMLElement,
        btnEl: HTMLElement,
        pickerEl: HTMLElement,
        cells: HTMLElement[],
        labelEl: HTMLElement
    ): void {
        btnEl.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            const isVisible = pickerEl.classList.contains('is-visible');
            if (!isVisible) {
                cells.forEach(el => el.classList.remove('is-hovered'));
                labelEl.innerText = '0 x 0';
            }
            pickerEl.classList.toggle('is-visible');
            btnEl.setAttribute('aria-expanded', (!isVisible).toString());
        });

        const docClickListener = (e: MouseEvent) => {
            if (!wrapper.contains(e.target as Node)) {
                pickerEl.classList.remove('is-visible');
                btnEl.setAttribute('aria-expanded', 'false');
            }
        };

        document.addEventListener('click', docClickListener);
        this.cleanupFnList.push(() => {
            document.removeEventListener('click', docClickListener);
        });
    }

    private createEmojiPickerButton(btnName: string): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'inkflow-emoji-btn-wrapper';

        const btnEl = document.createElement('button');
        btnEl.className = this.theme.button;
        btnEl.innerHTML = icons[btnName] || '😀';
        btnEl.title = this.locale.toolbar[btnName] || 'Emoji';
        btnEl.type = 'button';
        btnEl.setAttribute('aria-label', btnEl.title);
        btnEl.setAttribute('aria-haspopup', 'true');
        btnEl.setAttribute('aria-expanded', 'false');
        this.buttonElements.set(btnName, btnEl);
        wrapper.appendChild(btnEl);

        this.emojiExtension?.mountPicker({
            wrapper,
            button: btnEl,
            theme: this.theme,
            locale: this.locale,
            cleanup: this.cleanupFnList,
            onSelect: (emoji, src) => {
                const event = new CustomEvent('inkflow-custom-command', {
                    detail: { command: 'emoji', value: emoji, src }
                });
                this.container.dispatchEvent(event);
            }
        });

        return wrapper;
    }

    /**
     * Toggles the disabled state of rich-text buttons and select elements.
     * Keeps sourceCode and fullscreen buttons enabled.
     */
    public setDisabled(disabled: boolean): void {
        this.buttonElements.forEach((btnEl, btnName) => {
            if (btnName !== 'sourceCode' && btnName !== 'fullscreen') {
                if (btnEl instanceof HTMLButtonElement) {
                    btnEl.disabled = disabled;
                } else {
                    // For wrapper elements
                    btnEl.style.pointerEvents = disabled ? 'none' : 'auto';
                }

                if (disabled) {
                    btnEl.classList.add('is-disabled');
                    btnEl.setAttribute('aria-disabled', 'true');
                } else {
                    btnEl.classList.remove('is-disabled');
                    btnEl.setAttribute('aria-disabled', 'false');
                }
            }
        });

        if (this.headingSelectEl) {
            this.headingSelectEl.disabled = disabled;
            if (disabled) {
                this.headingSelectEl.classList.add('is-disabled');
            } else {
                this.headingSelectEl.classList.remove('is-disabled');
            }
        }
    }

    /**
     * Cleans up all document-level event listeners.
     */
    public destroy(): void {
        this.cleanupFnList.forEach(fn => fn());
        this.cleanupFnList = [];
        this.buttonElements.clear();
        this.container.innerHTML = '';
    }
}
