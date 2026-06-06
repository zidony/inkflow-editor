import { describe, expect, it } from 'vitest';
import { sanitizeHTML, sanitizeHref, sanitizeMediaUrl } from '../src/utils/security';

function parseBody(html: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild as HTMLElement;
}

describe('security utilities', () => {
    it('removes blocked tags and unwraps unsupported tags', () => {
        const html = sanitizeHTML(
            '<p>Hello<script>alert(1)</script><custom><strong>world</strong></custom><style>p{color:red}</style></p>'
        );

        expect(html).toBe('<p>Hello<strong>world</strong></p>');
    });

    it('preserves legacy bold and italic tags for output normalization', () => {
        const html = sanitizeHTML('<p><b>Bold</b> and <i>italic</i></p>');

        expect(html).toBe('<p><b>Bold</b> and <i>italic</i></p>');
    });

    it('strips unsafe attributes from supported elements', () => {
        const html = sanitizeHTML('<p id="x" style="color:red" onclick="alert(1)" title="ok">Text</p>');
        const element = parseBody(html);

        expect(element.getAttribute('title')).toBe('ok');
        expect(element.hasAttribute('id')).toBe(false);
        expect(element.hasAttribute('style')).toBe(false);
        expect(element.hasAttribute('onclick')).toBe(false);
    });

    it('normalizes safe links and rejects script links', () => {
        const html = sanitizeHTML(
            '<a href="https://example.com" target="_blank">safe</a><a href="javascript:alert(1)">bad</a>'
        );
        const links = Array.from(document.createElement('template').content.querySelectorAll('a'));
        const template = document.createElement('template');
        template.innerHTML = html;
        const sanitizedLinks = Array.from(template.content.querySelectorAll('a'));

        expect(links).toHaveLength(0);
        expect(sanitizedLinks[0].getAttribute('href')).toBe('https://example.com');
        expect(sanitizedLinks[0].getAttribute('rel')).toBe('noopener noreferrer');
        expect(sanitizedLinks[1].hasAttribute('href')).toBe(false);
    });

    it('keeps only supported emoji image classes', () => {
        const html = sanitizeHTML(
            '<img class="inkflow-emoji external" src="data:image/png;base64,aGVsbG8=" alt="emoji" />'
        );
        const image = parseBody(html);

        expect(image.getAttribute('class')).toBe('inkflow-emoji');
        expect(image.getAttribute('src')).toBe('data:image/png;base64,aGVsbG8=');
        expect(image.getAttribute('alt')).toBe('emoji');
    });

    it('validates href and media URLs by protocol', () => {
        expect(sanitizeHref('mailto:user@example.com')).toBe('mailto:user@example.com');
        expect(sanitizeHref('tel:+123456789')).toBe('tel:+123456789');
        expect(sanitizeHref('javascript:alert(1)')).toBeNull();
        expect(sanitizeMediaUrl('blob:https://example.com/id')).toBe('blob:https://example.com/id');
        expect(sanitizeMediaUrl('data:text/html;base64,PGgxPkJhZDwvaDE=')).toBeNull();
        expect(sanitizeMediaUrl('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', 'image')).toBeNull();
        expect(sanitizeMediaUrl('data:image/webp;base64,aGVsbG8=', 'image')).toBe(
            'data:image/webp;base64,aGVsbG8='
        );
    });

    it('hardens iframe embeds with sandboxing and lazy loading', () => {
        const html = sanitizeHTML(
            '<iframe src="https://example.com/embed" onload="alert(1)" style="border:0"></iframe>'
        );
        const iframe = parseBody(html);

        expect(iframe.getAttribute('src')).toBe('https://example.com/embed');
        expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-presentation');
        expect(iframe.getAttribute('loading')).toBe('lazy');
        expect(iframe.hasAttribute('onload')).toBe(false);
        expect(iframe.hasAttribute('style')).toBe(false);
    });
});
