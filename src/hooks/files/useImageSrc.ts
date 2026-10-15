import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@helpers/db';
import { getImageObjectUrl } from '@helpers/images';
import { parseImagePath } from '@utils/imagePaths';
import { IMAGES_ID } from '@constants/fileSystem';

const LOADING = 'loading';

/**
 * Resolves the src of a Markdown image:
 * - "/Images/<name>" points to an image of the Images system folder -> object URL of its stored data
 * - anything else (http URLs...) is returned as is
 * `missing` is true when it points to the Images folder but there's no image with that name.
 */
export function useImageSrc(src?: string) {
    const name = parseImagePath(src);
    // Live: the preview updates as soon as the image is added, renamed or deleted
    const entry = useLiveQuery(
        async () => {
            if (name === null) return null;
            const image = await db.entries.where('parentId').equals(IMAGES_ID).filter((e) => e.name === name).first();
            return image ?? null;
        },
        [name],
        LOADING
    );

    if (name === null) return { name, src, missing: false };
    if (entry === LOADING) return { name, src: undefined, missing: false };
    if (!entry?.blob) return { name, src: undefined, missing: true };
    return { name, src: getImageObjectUrl({ ...entry, blob: entry.blob }), missing: false };
}
