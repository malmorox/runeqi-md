import { HiOutlinePhoto } from 'react-icons/hi2';
import { useImageSrc } from '@hooks/files/useImageSrc';

interface PreviewImageProps {
    src?: string;
    alt?: string;
    isDark: boolean;
}

// Image of the preview: resolves the ones stored in the Images folder ("/Images/<name>")
const PreviewImage = ({ src, alt, isDark }: PreviewImageProps) => {
    const image = useImageSrc(src);

    if (image.missing) {
        return (
            <span className={`my-4 inline-flex items-center gap-1.5 rounded border border-dashed px-2 py-1 text-sm ${
                isDark ? "border-neutral-600 text-neutral-400" : "border-neutral-400 text-neutral-600"
            }`}>
                <HiOutlinePhoto size={16} aria-hidden />
                Image not found: {image.name}
            </span>
        );
    }

    // Still loading from the database
    if (!image.src) return null;

    return <img src={image.src} alt={alt} className="my-4 max-w-full inline-block" />;
};

export default PreviewImage;
