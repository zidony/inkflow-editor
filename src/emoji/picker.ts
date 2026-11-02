import { emojiCategories, type EmojiCategory } from './data';
import { zhCN, type EmojiLocale } from './locales/zh-CN';
import { enUS } from './locales/en-US';
import { getEmojiSvgUrl } from './codepoint';
import { resolveAssetBase } from './renderer';

export interface EmojiSelectPayload {
    char: string;
    name: string;
    src: string;
}

export interface EmojiPickerOptions {
    /** Target container element where picker DOM is appended. Defaults to document.body */
    container?: HTMLElement;
    /** Language or custom locale dict. Defaults to 'zh-CN' */
    locale?: 'zh-CN' | 'en-US' | EmojiLocale;
    /** Base URL of the directory where emoji SVGs are hosted */
    assetBase?: string;
    /** Custom category list */
    categories?: EmojiCategory[];
    /** Whether to enable Recent emojis list. Defaults to { max: 24, storageKey: 'inkflow-emoji-recent' } */
    recent?: false | { max?: number; storageKey?: string };
    /** Close picker automatically after selecting an emoji. Defaults to true */
    closeOnSelect?: boolean;
    /** Callback invoked when an emoji is selected */
    onSelect: (payload: EmojiSelectPayload) => void;
}

export class EmojiPickerInstance {
    private options: EmojiPickerOptions;
    private pickerEl: HTMLElement;
    private tabsEl: HTMLElement;
    private scrollAreaEl: HTMLElement;
    private localeDict: EmojiLocale;
    private assetBase: string;
    private categories: EmojiCategory[];
    private cleanupFns: Array<() => void> = [];
    private currentAnchor: HTMLElement | null = null;
    private recentList: string[] = [];
    private sectionEls: Map<string, HTMLElement> = new Map();
    private tabButtons: Map<string, HTMLButtonElement> = new Map();
    private isUserScrolling = true;

    constructor(options: EmojiPickerOptions) {
        this.options = {
            closeOnSelect: true,
            ...options
        };

        this.localeDict = this.resolveLocale(this.options.locale);
        this.assetBase = resolveAssetBase(this.options.assetBase);
        this.categories = this.options.categories || emojiCategories;

        this.initRecentList();

        this.pickerEl = document.createElement('div');
        this.pickerEl.className = 'inkflow-emoji-picker';
        this.pickerEl.setAttribute('role', 'dialog');
        this.pickerEl.setAttribute('aria-label', this.localeDict.ui.title);

        // 顶部 Tab 导航（仅 Emoji 图标）
        this.tabsEl = document.createElement('div');
        this.tabsEl.className = 'inkflow-emoji-tabs';
        this.tabsEl.setAttribute('role', 'tablist');
        this.pickerEl.appendChild(this.tabsEl);

        // 统一连续滚动区域
        this.scrollAreaEl = document.createElement('div');
        this.scrollAreaEl.className = 'inkflow-emoji-scroll-area';
        this.pickerEl.appendChild(this.scrollAreaEl);

        const targetContainer = this.options.container || document.body;
        targetContainer.appendChild(this.pickerEl);

        this.renderAll();
        this.bindScrollSpy();
        this.bindGlobalEvents();
    }

    private resolveLocale(loc?: 'zh-CN' | 'en-US' | EmojiLocale): EmojiLocale {
        if (!loc || loc === 'zh-CN') return zhCN;
        if (loc === 'en-US') return enUS;
        return loc;
    }

    private initRecentList(): void {
        if (this.options.recent === false || typeof window === 'undefined') return;
        const key = this.options.recent?.storageKey || 'inkflow-emoji-recent';
        try {
            const raw = window.localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    this.recentList = parsed;
                }
            }
        } catch {
            this.recentList = [];
        }
    }

    private saveRecent(emojiChar: string): void {
        if (this.options.recent === false || typeof window === 'undefined') return;
        const max = this.options.recent?.max || 24;
        const key = this.options.recent?.storageKey || 'inkflow-emoji-recent';

        const hadRecent = this.recentList.length > 0;
        this.recentList = [emojiChar, ...this.recentList.filter(e => e !== emojiChar)].slice(0, max);
        try {
            window.localStorage.setItem(key, JSON.stringify(this.recentList));
        } catch {
            // ignore quota errors
        }

        // 如果之前没有 recent，现在新增了，需要动态插入 recent 区块和 tab
        if (!hadRecent) {
            this.renderAll();
        } else {
            this.updateRecentSectionGrid();
        }
    }

    private renderAll(): void {
        this.tabsEl.innerHTML = '';
        this.scrollAreaEl.innerHTML = '';
        this.sectionEls.clear();
        this.tabButtons.clear();

        const sectionsToRender: Array<{ id: string; name: string; icon: string; emojis: string[] }> = [];

        // 1. 最近使用（有数据才渲染，解决首次空白问题）
        if (this.options.recent !== false && this.recentList.length > 0) {
            sectionsToRender.push({
                id: 'recent',
                name: this.localeDict.categories.recent || this.localeDict.ui.recent,
                icon: '🕒',
                emojis: this.recentList
            });
        }

        // 2. 6 大精选分类
        this.categories.forEach(cat => {
            sectionsToRender.push({
                id: cat.id,
                name: this.localeDict.categories[cat.id] || cat.name,
                icon: cat.icon,
                emojis: cat.emojis
            });
        });

        // 渲染 Tabs 与 Sections
        sectionsToRender.forEach((sec, index) => {
            // Tab 按钮
            const tabBtn = document.createElement('button');
            tabBtn.type = 'button';
            tabBtn.className = 'inkflow-emoji-tab';
            tabBtn.textContent = sec.icon;
            tabBtn.title = sec.name;
            tabBtn.setAttribute('aria-label', sec.name);
            tabBtn.setAttribute('data-tab-id', sec.id);
            if (index === 0) {
                tabBtn.classList.add('is-active');
            }

            tabBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToSection(sec.id);
            });

            this.tabsEl.appendChild(tabBtn);
            this.tabButtons.set(sec.id, tabBtn);

            // 分类 Section 节点
            const sectionEl = document.createElement('div');
            sectionEl.className = 'inkflow-emoji-section';
            sectionEl.setAttribute('data-section-id', sec.id);

            // 吸顶分类标题
            const headerEl = document.createElement('div');
            headerEl.className = 'inkflow-emoji-section-header';
            headerEl.textContent = sec.name;
            sectionEl.appendChild(headerEl);

            // 表情网格
            const gridEl = document.createElement('div');
            gridEl.className = 'inkflow-emoji-grid';
            if (sec.id === 'recent') gridEl.setAttribute('data-grid-recent', 'true');

            sec.emojis.forEach(emojiChar => {
                gridEl.appendChild(this.createEmojiButton(emojiChar));
            });

            sectionEl.appendChild(gridEl);
            this.scrollAreaEl.appendChild(sectionEl);
            this.sectionEls.set(sec.id, sectionEl);
        });
    }

    private updateRecentSectionGrid(): void {
        const recentGrid = this.scrollAreaEl.querySelector('[data-grid-recent="true"]');
        if (!recentGrid) return;
        recentGrid.innerHTML = '';
        this.recentList.forEach(emojiChar => {
            recentGrid.appendChild(this.createEmojiButton(emojiChar));
        });
    }

    private createEmojiButton(emojiChar: string): HTMLButtonElement {
        const name = this.localeDict.names[emojiChar] || emojiChar;
        const src = getEmojiSvgUrl(emojiChar, this.assetBase);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inkflow-emoji-btn';
        btn.title = name;
        btn.setAttribute('aria-label', name);

        const img = document.createElement('img');
        img.src = src;
        img.alt = emojiChar;
        img.loading = 'lazy';
        img.draggable = false;
        btn.appendChild(img);

        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            this.saveRecent(emojiChar);
            this.options.onSelect({
                char: emojiChar,
                name,
                src
            });

            if (this.options.closeOnSelect !== false) {
                this.close();
            }
        });

        return btn;
    }

    private scrollToSection(sectionId: string): void {
        const targetSection = this.sectionEls.get(sectionId);
        if (!targetSection) return;

        this.isUserScrolling = false;
        this.highlightTab(sectionId);

        // 计算目标滚动距离，留出吸顶空间
        const scrollOffset = targetSection.offsetTop - this.scrollAreaEl.offsetTop;
        this.scrollAreaEl.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
        });

        setTimeout(() => {
            this.isUserScrolling = true;
        }, 350);
    }

    private highlightTab(sectionId: string): void {
        this.tabButtons.forEach((btn, id) => {
            btn.classList.toggle('is-active', id === sectionId);
        });
    }

    private bindScrollSpy(): void {
        const onScroll = () => {
            if (!this.isUserScrolling) return;

            const scrollPos = this.scrollAreaEl.scrollTop + 36;
            let currentActiveId = '';

            for (const [id, secEl] of this.sectionEls.entries()) {
                const offsetTop = secEl.offsetTop - this.scrollAreaEl.offsetTop;
                if (offsetTop <= scrollPos) {
                    currentActiveId = id;
                }
            }

            if (currentActiveId) {
                this.highlightTab(currentActiveId);
            }
        };

        this.scrollAreaEl.addEventListener('scroll', onScroll, { passive: true });
        this.cleanupFns.push(() => {
            this.scrollAreaEl.removeEventListener('scroll', onScroll);
        });
    }

    public open(anchor?: HTMLElement): void {
        this.currentAnchor = anchor || null;
        this.position();
        this.pickerEl.classList.add('is-visible');

        // 打开时滚动到顶部，高亮第一个 Tab
        this.scrollAreaEl.scrollTop = 0;
        const firstTab = this.tabsEl.querySelector<HTMLButtonElement>('.inkflow-emoji-tab');
        if (firstTab) {
            const firstId = firstTab.getAttribute('data-tab-id') || '';
            if (firstId) this.highlightTab(firstId);
        }
    }

    public close(): void {
        if (!this.isOpen()) return;
        this.pickerEl.classList.remove('is-visible');
        if (this.currentAnchor) {
            this.currentAnchor.focus();
        }
    }

    public toggle(anchor?: HTMLElement): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open(anchor);
        }
    }

    public isOpen(): boolean {
        return this.pickerEl.classList.contains('is-visible');
    }

    private position(): void {
        if (!this.currentAnchor) return;

        const anchorRect = this.currentAnchor.getBoundingClientRect();
        const panelWidth = Math.min(304, window.innerWidth - 20);
        const panelHeight = 296; // 估算表情选择器完整高度

        // 判断宿主容器是否是编辑器容器或全屏容器
        const isInlineWrapper = this.pickerEl.parentElement === this.currentAnchor.parentElement;

        if (isInlineWrapper) {
            // 在工具栏行内 wrapper 中
            // 检查下方空间：如果超出视口底部，则向上翻转
            const spaceBelow = window.innerHeight - anchorRect.bottom;
            if (spaceBelow < panelHeight + 10 && anchorRect.top > panelHeight + 10) {
                this.pickerEl.style.top = 'auto';
                this.pickerEl.style.bottom = 'calc(100% + 4px)';
            } else {
                this.pickerEl.style.top = 'calc(100% + 4px)';
                this.pickerEl.style.bottom = 'auto';
            }

            // 水平位置：检查是否超出右边界
            if (anchorRect.left + panelWidth > window.innerWidth - 10) {
                this.pickerEl.style.left = 'auto';
                this.pickerEl.style.right = '0';
            } else {
                this.pickerEl.style.left = '0';
                this.pickerEl.style.right = 'auto';
            }
            return;
        }

        // 挂载到 body 的场景：计算全局坐标并支持上下翻转
        let left = anchorRect.left + window.scrollX;
        let top = anchorRect.bottom + window.scrollY + 6;

        if (left + panelWidth > window.innerWidth + window.scrollX) {
            left = window.innerWidth + window.scrollX - panelWidth - 10;
        }

        const spaceBelow = window.innerHeight - anchorRect.bottom;
        if (spaceBelow < panelHeight + 10 && anchorRect.top > panelHeight + 10) {
            top = anchorRect.top + window.scrollY - panelHeight - 6;
        }

        this.pickerEl.style.position = 'absolute';
        this.pickerEl.style.top = `${top}px`;
        this.pickerEl.style.left = `${Math.max(10, left)}px`;
        this.pickerEl.style.right = 'auto';
        this.pickerEl.style.bottom = 'auto';
    }

    private bindGlobalEvents(): void {
        const onDocClick = (e: MouseEvent) => {
            if (!this.isOpen()) return;
            const target = e.target as Node;
            if (this.pickerEl.contains(target)) return;
            if (this.currentAnchor && this.currentAnchor.contains(target)) return;
            this.close();
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (!this.isOpen()) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
        };

        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onKeyDown);

        this.cleanupFns.push(() => {
            document.removeEventListener('click', onDocClick, true);
            document.removeEventListener('keydown', onKeyDown);
        });
    }

    public destroy(): void {
        this.cleanupFns.forEach(fn => fn());
        this.cleanupFns = [];
        this.sectionEls.clear();
        this.tabButtons.clear();
        this.pickerEl.remove();
    }
}

export function createEmojiPicker(options: EmojiPickerOptions): EmojiPickerInstance {
    return new EmojiPickerInstance(options);
}

export function bindEmojiPicker(
    buttonEl: HTMLElement,
    options: Omit<EmojiPickerOptions, 'container'> & { container?: HTMLElement }
): EmojiPickerInstance {
    const picker = createEmojiPicker({
        container: options.container,
        ...options
    });

    buttonEl.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        picker.toggle(buttonEl);
    });

    return picker;
}
