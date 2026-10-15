import { useRef, useState } from 'react';
import { HiArrowUpTray } from 'react-icons/hi2';
import { ACCEPTED_IMAGE_TYPES } from '@helpers/images';

export const InputContent = ({ 
    fields, 
    onSubmit, 
    buttonText = "Insert" 
}: { 
    fields: { name: string; label: string; placeholder: string; defaultValue?: string }[];
    onSubmit: (values: Record<string, string>) => void;
    buttonText?: string;
}) => {
    const [values, setValues] = useState<Record<string, string>>({});

    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitClick = () => {
        const finalValues: Record<string, string> = {};
        fields.forEach(field => {
            finalValues[field.name] = values[field.name] || field.defaultValue || '';
        });
        onSubmit(finalValues);
        setValues({});
    };

    return (
        <div className="p-3 min-w-[250px]">
            <div className="space-y-2">
                {fields.map(field => (
                    <div key={field.name}>
                        <label className="block text-xs font-medium text-[#cccccc] mb-1">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-2 py-1.5 text-sm text-[#1e1e1e] bg-white border border-[#cccccc] rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                ))}
                <button
                    onClick={handleSubmitClick}
                    className="w-full bg-sky-500 text-white px-3 py-1.5 rounded text-sm hover:bg-sky-600 transition-colors mt-2 cursor-pointer"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

export const HeadingContent = ({
    options,
    onSelect
}: {
    options: { label: string; level: 1 | 2 | 3 | 4 | 5 | 6 }[];
    onSelect: (level: 1 | 2 | 3 | 4 | 5 | 6, label: string) => void;
}) => {
    const sizes = {
        1: "text-2xl font-bold",
        2: "text-xl font-bold",
        3: "text-lg font-semibold",
        4: "text-base font-medium",
        5: "text-sm font-medium",
        6: "text-xs font-medium"
    };

    return (
        <div className="p-2 min-w-[160px] space-y-1">
            {options.map((h) => (
                <button
                    key={h.level}
                    className={`w-full text-left text-[#cccccc] px-3 py-1.5 rounded hover:bg-[#3e3e42] ${sizes[h.level]} cursor-pointer`}
                    onClick={() => onSelect(h.level, h.label)}
                >
                    {h.label}
                </button>
            ))}
        </div>
    );
};

// Insert an image from a URL, or upload one to the Images folder. The alt text applies to both.
export const ImageContent = ({
    onSubmit,
    onUpload
}: {
    onSubmit: (alt: string, url: string) => void;
    onUpload: (file: File, alt: string) => Promise<void>;
}) => {
    const [alt, setAlt] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file?: File) => {
        if (!file) return;
        setError(null);
        setUploading(true);
        try {
            await onUpload(file, alt);
            setAlt('');
        } catch (e) {
            setError(e instanceof Error ? e.message : "The image couldn't be added.");
        } finally {
            setUploading(false);
        }
    };

    const inputClassName = "w-full px-2 py-1.5 text-sm text-[#1e1e1e] bg-white border border-[#cccccc] rounded focus:outline-none focus:ring-2 focus:ring-sky-500";

    return (
        <div className="p-3 min-w-[250px] space-y-2">
            <div>
                <label htmlFor="image-alt" className="block text-xs font-medium text-[#cccccc] mb-1">
                    Alt text
                </label>
                <input
                    id="image-alt"
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Description"
                    className={inputClassName}
                />
            </div>
            <div>
                <label htmlFor="image-url" className="block text-xs font-medium text-[#cccccc] mb-1">
                    Image URL
                </label>
                <input
                    id="image-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={inputClassName}
                />
            </div>
            <button
                onClick={() => {
                    onSubmit(alt, url);
                    setAlt('');
                    setUrl('');
                }}
                className="w-full bg-sky-500 text-white px-3 py-1.5 rounded text-sm hover:bg-sky-600 transition-colors cursor-pointer"
            >
                Insert
            </button>

            <div className="flex items-center gap-2 text-xs text-[#999999]">
                <span className="h-px flex-1 bg-[#555555]" />
                or
                <span className="h-px flex-1 bg-[#555555]" />
            </div>

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 border border-[#555555] text-[#cccccc] px-3 py-1.5 rounded text-sm hover:bg-[#3e3e42] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
                <HiArrowUpTray size={16} aria-hidden />
                {isUploading ? 'Uploading…' : 'Upload image'}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                hidden
                onChange={(e) => {
                    handleFile(e.currentTarget.files?.[0]);
                    // Allows picking the same file again
                    e.currentTarget.value = '';
                }}
            />
            {error && (
                <p role="alert" className="text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};
