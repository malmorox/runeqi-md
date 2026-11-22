import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import { ThemeContext } from '@contexts/ThemeContext';
import { SettingsContext } from '@contexts/SettingsContext';
import { markdownComponents } from '@constants/markdownComponents';
import { EXPORT_STYLES } from '@constants/exportStyles';
import { getRehypePlugins, getRemarkPlugins } from '@utils/markdownPlugins';
import { getLoadedKatex } from '@utils/math';
import { slugify } from '@utils/headingAnchors';
import { saveFile, type FileFormat } from './saveFile';
import type { AppSettings } from '@/types/settings';

/**
 * Exports of the rendered document: HTML file, PDF (through the browser's print dialog) and HTML in the clipboard.
 *
 * The document is rendered off screen with the preview's own components, so it doesn't depend on the preview being
 * shown (e.g. "Editor only") and looks the same. It's always in the light theme, the usual one for a shared or
 * printed document. Once formulas, diagrams and images are ready, the HTML is cleaned up:
 * - Tailwind classes go away (they mean nothing without the app's stylesheet): EXPORT_STYLES styles the tags and the
 *   rq-* classes the components add for it. Inside formulas and diagrams nothing is touched, they need their classes
 * - Images of the Images folder are embedded, so the file works on its own
 * - Headings get GitHub-style ids, so #links to them keep working
 */

export const HTML_FORMAT: FileFormat = {
    extension: '.html',
    extensions: ['.html', '.htm'],
    mimeType: 'text/html',
    description: 'Web page',
};

// Past this, the document is exported as it is (e.g. formulas as their source if KaTeX couldn't be downloaded)
const RENDER_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 50;

const LIGHT_THEME = { theme: 'light' as const, setTheme: () => {} };
const noop = () => {};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Renders the document and waits until nothing in it is loading. Elements still loading carry data-pending
// (formulas before KaTeX, diagrams before their drawing, images of the Images folder before their data)
async function renderDocument(markdown: string, settings: AppSettings): Promise<HTMLElement> {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.inert = true;
    // Off screen but laid out, like a page
    Object.assign(host.style, { position: 'fixed', top: '0', left: '-10000px', width: '56rem', pointerEvents: 'none' });
    document.body.appendChild(host);

    const root = createRoot(host);
    try {
        root.render(
            <ThemeContext.Provider value={LIGHT_THEME}>
                <SettingsContext.Provider value={{ settings, updateSettings: noop, resetSettings: noop }}>
                    <div data-export-root>
                        <ReactMarkdown
                            remarkPlugins={getRemarkPlugins(settings.previewer)}
                            rehypePlugins={getRehypePlugins(settings.previewer)}
                            components={markdownComponents}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </SettingsContext.Provider>
            </ThemeContext.Provider>
        );

        const deadline = performance.now() + RENDER_TIMEOUT_MS;
        let content = host.querySelector<HTMLElement>('[data-export-root]');
        while (!content || content.querySelector('[data-pending]')) {
            if (performance.now() > deadline) break;
            await wait(POLL_INTERVAL_MS);
            content = host.querySelector<HTMLElement>('[data-export-root]');
        }
        if (!content) throw new Error("The document couldn't be rendered.");

        // A copy: the original goes away with the root
        return content.cloneNode(true) as HTMLElement;
    } finally {
        root.unmount();
        host.remove();
    }
}

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
});

// Turns the rendered document into clean, self-contained HTML (see the top of the file)
async function cleanUpDocument(content: HTMLElement) {
    // Images that never loaded (the export timed out) leave an empty marker
    content.querySelectorAll('span[data-pending]:empty').forEach((marker) => marker.remove());

    for (const element of content.querySelectorAll<HTMLElement>('*')) {
        // Formulas and diagrams are drawn by their classes (KaTeX's stylesheet, Mermaid's <style> inside the SVG)
        if (element.closest('svg, .katex, .katex-display')) continue;

        const kept = [...element.classList].filter((name) => name.startsWith('rq-'));
        if (kept.length) element.className = kept.join(' ');
        else element.removeAttribute('class');
        element.removeAttribute('data-line');
        element.removeAttribute('data-pending');
    }

    // Task list checkboxes: React sets `checked` as a property, which the HTML wouldn't carry
    for (const checkbox of content.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
        checkbox.toggleAttribute('checked', checkbox.checked);
        checkbox.setAttribute('disabled', '');
    }

    // Ids like GitHub's: repeated headings get -1, -2... (the same ones the preview's #links look for)
    const seen = new Map<string, number>();
    for (const heading of content.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')) {
        const base = slugify(heading.textContent ?? '');
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        if (!heading.id && base) heading.id = count ? `${base}-${count}` : base;
    }

    // Images of the Images folder are object URLs of this tab: they're embedded so the file works anywhere
    await Promise.all([...content.querySelectorAll('img')].map(async (image) => {
        if (!image.src.startsWith('blob:')) return;
        try {
            image.src = await blobToDataUrl(await (await fetch(image.src)).blob());
        } catch {
            // The image was deleted meanwhile: it stays as a broken image, like a missing web image
        }
    }));

    return content.innerHTML;
}

// HTML of the document's content, without the page around it
export async function renderDocumentHtml(markdown: string, settings: AppSettings) {
    return cleanUpDocument(await renderDocument(markdown, settings));
}

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

// Full web page around the document's content
export function buildHtmlPage(title: string, body: string) {
    // KaTeX's stylesheet comes with its fonts, so it's linked instead of embedded. Only when there are formulas
    const katexVersion = getLoadedKatex()?.version;
    const katexStyles = katexVersion && body.includes('class="katex')
        ? `\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@${katexVersion}/dist/katex.min.css">`
        : '';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="RuneQi">
<title>${escapeHtml(title)}</title>${katexStyles}
<style>${EXPORT_STYLES}</style>
</head>
<body>
<main class="rq-document">
${body}
</main>
</body>
</html>
`;
}

// Saves the document as a web page (see saveFile). Returns null if the dialog was closed without saving
export async function exportHtml(name: string, markdown: string, settings: AppSettings) {
    const body = await renderDocumentHtml(markdown, settings);
    return saveFile(name, buildHtmlPage(name, body), HTML_FORMAT);
}

const PRINT_FRAME_ID = 'rq-print-frame';

// Opens the print dialog with the document, where it can be saved as PDF. The page is printed from a hidden iframe,
// so only the document goes to paper (not the app). Its title is the PDF's suggested file name.
// Whether it's printed or saved is unknown: the dialog doesn't say.
export async function printDocument(name: string, markdown: string, settings: AppSettings) {
    const page = buildHtmlPage(name, await renderDocumentHtml(markdown, settings));

    document.getElementById(PRINT_FRAME_ID)?.remove();
    const frame = document.createElement('iframe');
    frame.id = PRINT_FRAME_ID;
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });

    const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
    frame.srcdoc = page;
    document.body.appendChild(frame);
    // The load event waits for the stylesheets and images; the fonts (KaTeX's) can still be on their way
    await loaded;
    const frameWindow = frame.contentWindow;
    if (!frameWindow) throw new Error("The print preview couldn't be opened.");
    await frameWindow.document.fonts.ready;

    frameWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
    frameWindow.focus();
    frameWindow.print();
}

// Copies the document as formatted text: pasted into an email, Google Docs or Notion it keeps its headings, lists,
// tables, links... Where only plain text can be pasted, the Markdown goes.
// The clipboard is written right away with the HTML still to come: browsers only allow writing it right after a
// click, and rendering can take a moment (e.g. downloading KaTeX)
export function copyAsHtml(markdown: string, settings: AppSettings) {
    const html = renderDocumentHtml(markdown, settings).then((body) => new Blob([body], { type: 'text/html' }));
    const item = new ClipboardItem({
        'text/html': html,
        'text/plain': new Blob([markdown], { type: 'text/plain' }),
    });
    return navigator.clipboard.write([item]);
}
