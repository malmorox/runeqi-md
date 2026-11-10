import { createContext } from 'react';

// Line (1-based) of the document where the preview chunk being rendered starts. The Markdown components only get
// lines relative to their chunk: with this they can tell their line in the whole document
export const ChunkLineContext = createContext<number | null>(null);
