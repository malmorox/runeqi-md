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
            <div className="code-language-custom">
                <div className="code-language-field">
                    <label className="code-language-label">
                        Specify language
                    </label>
                    <input
                        type="text"
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                        placeholder="ruby, go, rust..."
                        className="dropdown-input"
                        autoFocus
                    />
                </div>
                <div className="code-language-actions">
                    <button
                        onClick={handleCustomSubmit}
                        className="code-language-insert"
                    >
                        Insert
                    </button>
                    <button
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomLanguage('');
                        }}
                        className="code-language-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="code-language-picker">
            <div className="code-language-grid">
                {popularLanguages.map((lang) => {
                    return (
                        <button
                            key={lang.value}
                            onClick={() => handleLanguageClick(lang.value)}
                            className="code-language-option"
                            title={lang.name}
                        >
                            <lang.icon size={20} />
                        </button>
                    );
                })}
            </div>
            
            <div className="code-language-more">
                <button
                    onClick={() => setShowCustomInput(true)}
                    className="code-language-other"
                >
                    Other language...
                </button>
            </div>
        </div>
    );
};

export default CodeLanguageSelector;