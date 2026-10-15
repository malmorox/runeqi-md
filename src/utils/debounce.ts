export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}