const BLOCKED_TAGS = new Set(['script', 'style', 'meta', 'object', 'embed', 'link']);

const ALLOWED_TAGS = new Set([
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'del',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'iframe',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'source',
    'span',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
    'video'
]);

const GLOBAL_ATTRIBUTES = new Set(['title', 'aria-label']);

const TAG_ATTRIBUTES: Record<string, Set<string>> = {
    a: new Set(['href', 'target', 'rel']),
    iframe: new Set(['src', 'allow', 'allowfullscreen', 'frameborder', 'height', 'loading', 'title', 'width']),
    img: new Set(['alt', 'class', 'draggable', 'height', 'loading', 'src', 'width']),
    source: new Set(['src', 'type']),
    table: new Set(['cellpadding', 'cellspacing']),
    td: new Set(['colspan', 'rowspan']),
    th: new Set(['colspan', 'rowspan', 'scope']),
    video: new Set(['controls', 'height', 'loop', 'muted', 'poster', 'preload', 'src', 'width'])
};

const HREF_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const MEDIA_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);
const IMAGE_DATA_URL_PATTERN = /^data:image\/(?:png|gif|jpe?g|webp);base64,[a-z0-9+/]+=*$/i;

type UrlKind = 'href' | 'media' | 'image';

function normalizeUrl(rawUrl: string, kind: UrlKind): string | null {
    const value = rawUrl.trim();
    if (!value) return null;

    if (kind === 'image' && IMAGE_DATA_URL_PATTERN.test(value)) {
        return value;
    }

    try {
        const url = new URL(value, window.location.href);
        const protocols = kind === 'href' ? HREF_PROTOCOLS : MEDIA_PROTOCOLS;
        if (!protocols.has(url.protocol)) return null;
        return value;
    } catch {
        return null;
    }
}

function shouldKeepAttribute(tagName: string, attrName: string): boolean {
    return GLOBAL_ATTRIBUTES.has(attrName) || Boolean(TAG_ATTRIBUTES[tagName]?.has(attrName));
}

function sanitizeElement(element: Element): void {
    const tagName = element.tagName.toLowerCase();

    Array.from(element.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value;

        if (attrName.startsWith('on') || attrName === 'style' || attrName === 'id') {
            element.removeAttribute(attr.name);
            return;
        }

        if (!shouldKeepAttribute(tagName, attrName)) {
            element.removeAttribute(attr.name);
            return;
        }

        if (attrName === 'href') {
            const safeUrl = normalizeUrl(attrValue, 'href');
            if (!safeUrl) {
                element.removeAttribute(attr.name);
                return;
            }
            element.setAttribute('href', safeUrl);
            element.setAttribute('rel', 'noopener noreferrer');
            return;
        }

        if (attrName === 'src' || attrName === 'poster') {
            const safeUrl = normalizeUrl(attrValue, tagName === 'img' ? 'image' : 'media');
            if (!safeUrl) {
                element.removeAttribute(attr.name);
                return;
            }
            element.setAttribute(attr.name, safeUrl);
            return;
        }

        if (attrName === 'class' && tagName === 'img') {
            const allowedClasses = attrValue
                .split(/\s+/)
                .filter(className => className === 'inkflow-emoji')
                .join(' ');
            if (allowedClasses) {
                element.setAttribute('class', allowedClasses);
            } else {
                element.removeAttribute(attr.name);
            }
        }
    });

    if (tagName === 'iframe') {
        // Intentionally omit `allow-same-origin`: combining it with
        // `allow-scripts` lets framed content remove its own sandbox and
        // escape the restrictions (per OWASP/MDN guidance).
        element.setAttribute('sandbox', 'allow-scripts allow-presentation');
        element.setAttribute('loading', element.getAttribute('loading') || 'lazy');
    }
}

/**
 * Sanitizes untrusted HTML before it enters the editable surface.
 */
export function sanitizeHTML(dirtyHtml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirtyHtml, 'text/html');
    const body = doc.body;

    // Strip comment nodes after parsing (more robust than a pre-parse regex,
    // which can mis-handle comment-like sequences across HTML contexts).
    removeCommentNodes(body);

    Array.from(body.querySelectorAll('*')).forEach(element => {
        const tagName = element.tagName.toLowerCase();

        if (BLOCKED_TAGS.has(tagName)) {
            element.remove();
            return;
        }

        if (!ALLOWED_TAGS.has(tagName)) {
            element.replaceWith(...Array.from(element.childNodes));
            return;
        }

        sanitizeElement(element);
    });

    return body.innerHTML;
}

function removeCommentNodes(root: Node): void {
    const ownerDoc = root.ownerDocument || document;
    const walker = ownerDoc.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
    const comments: Comment[] = [];
    let current = walker.nextNode();
    while (current) {
        comments.push(current as Comment);
        current = walker.nextNode();
    }
    comments.forEach(comment => comment.remove());
}

/**
 * Sanitizes a user-provided link URL.
 */
export function sanitizeHref(url: string): string | null {
    return normalizeUrl(url, 'href');
}

/**
 * Sanitizes a user-provided media URL.
 */
export function sanitizeMediaUrl(url: string, kind: 'image' | 'media' = 'media'): string | null {
    return normalizeUrl(url, kind);
}
