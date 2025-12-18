import { useState } from 'react';

export const InputContent = ({ 
    fields, 
    onSubmit, 
    buttonText = "Insertar" 
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