import { useState, type DragEvent } from 'react';

const isFileDrag = (e: DragEvent) => e.dataTransfer.types.includes('Files');

// Files from the OS dragged over an element: tracks the hover and hands over the dropped files
export function useFileDrop(onDropFiles: (files: FileList) => void) {
    const [isDraggingFiles, setDraggingFiles] = useState(false);

    const onDragOver = (e: DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDraggingFiles(true);
    };

    const onDragLeave = (e: DragEvent) => {
        // dragleave also fires when moving between the element's own children
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDraggingFiles(false);
    };

    const onDrop = (e: DragEvent) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        setDraggingFiles(false);
        onDropFiles(e.dataTransfer.files);
    };

    return { isDraggingFiles, dropHandlers: { onDragOver, onDragLeave, onDrop } };
}
