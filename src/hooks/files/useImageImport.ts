import { useState } from 'react';
import { saveImages } from '@helpers/images';

// Saves images into the Images folder and keeps the rejected ones' messages to show them to the user
export function useImageImport() {
    const [importError, setImportError] = useState<string | null>(null);

    const importImages = async (files: File[], options?: { pasted?: boolean }) => {
        const { saved, errors } = await saveImages(files, options);
        if (errors.length) setImportError(errors.join('\n'));
        return saved;
    };

    return { importImages, importError, clearImportError: () => setImportError(null) };
}
