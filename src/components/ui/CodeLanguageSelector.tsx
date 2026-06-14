import { useState } from 'react';
import { SiPhp, SiMysql, SiGnubash } from "react-icons/si";
import { FaHtml5, FaCss3Alt, FaJava, FaPython } from "react-icons/fa";
import { TbBrandCSharp, TbBrandCpp } from "react-icons/tb";
import { BiLogoJavascript, BiLogoTypescript } from "react-icons/bi";
import { BsFiletypeJson } from "react-icons/bs";

interface CodeLanguageSelectorProps {
    onSelect: (language: string) => void;
}

const CodeLanguageSelector = ({ onSelect }: CodeLanguageSelectorProps) => {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customLanguage, setCustomLanguage] = useState('');

    // 12 lenguajes más comunes
    const popularLanguages = [
        { name: 'JavaScript', value: 'javascript', icon: BiLogoJavascript },
        { name: 'TypeScript', value: 'typescript', icon: BiLogoTypescript },
        { name: 'Python', value: 'python', icon: FaPython },
        { name: 'Java', value: 'java', icon: FaJava },
        { name: 'C++', value: 'cpp', icon: TbBrandCpp },
        { name: 'C#', value: 'csharp', icon: TbBrandCSharp },
        { name: 'HTML', value: 'html', icon: FaHtml5 },
        { name: 'CSS', value: 'css', icon: FaCss3Alt },
        { name: 'SQL', value: 'sql', icon: SiMysql },
        { name: 'Bash', value: 'bash', icon: SiGnubash },
        { name: 'JSON', value: 'json', icon: BsFiletypeJson },
        { name: 'PHP', value: 'php', icon: SiPhp }
    ];

    const handleLanguageClick = (language: string) => {
        onSelect(language);
        setShowCustomInput(false);
        setCustomLanguage('');
    };

    const handleCustomSubmit = () => {
        if (customLanguage.trim()) {
            onSelect(customLanguage.trim());
            setCustomLanguage('');
            setShowCustomInput(false);
        }
    };

    if (showCustomInput) {
        return (
            <div className="p-3 min-w-[280px]">
                <div className="mb-3">
                    <label className="block text-xs font-medium text-[#cccccc] mb-2">
                        Specify language
                    </label>
                    <input
                        type="text"
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                        placeholder="ruby, go, rust..."
                        className="w-full px-2 py-1.5 text-sm text-[#1e1e1e] bg-white border border-[#cccccc] rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCustomSubmit}
                        className="flex-1 bg-sky-500 text-white px-3 py-2 rounded text-sm hover:bg-sky-600 transition-colors cursor-pointer"
                    >
                        Insert
                    </button>
                    <button
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomLanguage('');
                        }}
                        className="flex-1 bg-[#cccccc] text-[#1e1e1e] px-3 py-2 rounded text-sm hover:bg-[#A8A8A8] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 min-w-[200px]">
            <div className="grid grid-cols-4 gap-2 mb-3">
                {popularLanguages.map((lang) => {
                    const Icon = lang.icon;
                    return (
                        <button
                            key={lang.value}
                            onClick={() => handleLanguageClick(lang.value)}
                            className="aspect-square cursor-pointer flex items-center justify-center p-1 bg-white border border-[#bbbbbb] rounded hover:bg-[#EDEDED] hover:border-[#8C8C8C] transition-all transition-colors group"
                            title={lang.name}
                        >
                            <Icon 
                                size={20} 
                                className="text-[#3e3e42] group-hover:scale-110 group-hover:text-[#252526] transition-transform"
                            />
                        </button>
                    );
                })}
            </div>
            
            <div className="pt-3 border-t border-[#bbbbbb]">
                <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full px-3 py-1 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 hover:border-sky-400 transition-colors cursor-pointer"
                >
                    Other language...
                </button>
            </div>
        </div>
    );
};

export default CodeLanguageSelector;