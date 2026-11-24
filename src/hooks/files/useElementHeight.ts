import { useLayoutEffect, useState, type RefObject } from 'react';

// Height in pixels of the element, kept up to date when it's resized.
// `deps` re-runs the measurement when the element may have been mounted again (e.g. a panel reopened)
export function useElementHeight(ref: RefObject<HTMLElement | null>, deps: unknown): number {
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        // Measured right away so the first paint already has the right height; the observer handles later resizes
        setHeight(element.clientHeight);
        const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, deps]);

    return height;
}
