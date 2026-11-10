import type { Theme } from '@/types/theme';

type Mermaid = typeof import('mermaid').default;

// Mermaid is large: it's only downloaded the first time the preview shows a diagram
let mermaidLoad: Promise<Mermaid> | null = null;

const loadMermaid = () => {
    mermaidLoad ??= import('mermaid').then(
        (module) => module.default,
        (error) => {
            // A failed download (e.g. offline) is tried again with the next diagram
            mermaidLoad = null;
            throw error;
        },
    );
    return mermaidLoad;
};

// Diagrams already drawn, by theme and code: one that comes back (theme switched back, preview shown again, an edit
// undone) appears at once. Past the limit the oldest ones are dropped
const svgCache = new Map<string, string>();
const SVG_CACHE_LIMIT = 100;

const cacheKey = (code: string, theme: Theme) => `${theme}\n${code}`;

export const getCachedDiagram = (code: string, theme: Theme) => svgCache.get(cacheKey(code, theme));

// Mermaid's configuration is global: each render sets its own theme and waits for the previous one to finish
let renderQueue: Promise<unknown> = Promise.resolve();
let renderCount = 0;

// Draws a diagram as an SVG string. Rejects with Mermaid's error when the code isn't valid, or with an AbortError when
// the signal aborts before its turn comes (a diagram that was edited again or left the preview isn't drawn)
export const renderDiagram = (code: string, theme: Theme, signal: AbortSignal): Promise<string> => {
    const key = cacheKey(code, theme);
    const cached = svgCache.get(key);
    if (cached) return Promise.resolve(cached);

    const render = renderQueue.then(async () => {
        signal.throwIfAborted();
        const mermaid = await loadMermaid();
        mermaid.initialize({
            startOnLoad: false,
            // Labels can't carry HTML or click handlers, and the SVG comes sanitized
            securityLevel: 'strict',
            // The preview shows the errors itself: Mermaid doesn't add its error drawing to the page
            suppressErrorRendering: true,
            theme: theme === 'dark' ? 'dark' : 'default',
        });
        // Every render needs its own id: Mermaid draws in a temporary element with it and scopes the SVG's styles to it
        const { svg } = await mermaid.render(`mermaid-diagram-${++renderCount}`, code);

        svgCache.set(key, svg);
        if (svgCache.size > SVG_CACHE_LIMIT) {
            const oldest = svgCache.keys().next().value;
            if (oldest !== undefined) svgCache.delete(oldest);
        }
        return svg;
    });

    renderQueue = render.catch(() => undefined);
    return render;
};

export const diagramErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));
