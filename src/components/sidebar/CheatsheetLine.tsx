import type { ReactNode } from 'react';

// Markdown markers as the editor shows them: plain grey, even inside bold or struck text
export const Marker = ({ children }: { children: ReactNode }) => (
    <span className="cheatsheet-marker">{children}</span>
);

// One source line of a multi-line cheatsheet entry
export const Line = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <span className={`cheatsheet-line ${className}`}>{children}</span>
);
