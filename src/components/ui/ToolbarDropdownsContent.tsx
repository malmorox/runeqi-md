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

    // A form, so Enter in any field submits it too
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalValues: Record<string, string> = {};
        fields.forEach(field => {
            finalValues[field.name] = values[field.name] || field.defaultValue || '';
        });
        onSubmit(finalValues);
        setValues({});
    };

    return (
        <div className="dropdown-form-panel">
            <form className="dropdown-form" onSubmit={handleSubmit}>
                {fields.map(field => (
                    <div key={field.name}>
                        <label className="dropdown-field-label">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="dropdown-input"
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="dropdown-submit dropdown-submit-spaced"
                >
                    {buttonText}
                </button>
            </form>
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
    return (
        <div className="heading-options">
            {options.map((h) => (
                <button
                    key={h.level}
                    data-level={h.level}
                    className="heading-option"
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

    // A form, so Enter in either field inserts the image
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(alt, url);
        setAlt('');
        setUrl('');
    };

    return (
        <div className="dropdown-form-panel image-dropdown">
            <form className="dropdown-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="image-alt" className="dropdown-field-label">
                        Alt text
                    </label>
                    <input
                        id="image-alt"
                        type="text"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        placeholder="Description"
                        className="dropdown-input"
                    />
                </div>
                <div>
                    <label htmlFor="image-url" className="dropdown-field-label">
                        Image URL
                    </label>
                    <input
                        id="image-url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="dropdown-input"
                    />
                </div>
                <button
                    type="submit"
                    className="dropdown-submit"
                >
                    Insert
                </button>
            </form>

            <div className="dropdown-divider">
                <span className="dropdown-divider-line" />
                or
                <span className="dropdown-divider-line" />
            </div>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="dropdown-upload-button"
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
                <p role="alert" className="dropdown-error">
                    {error}
                </p>
            )}
        </div>
    );
};
