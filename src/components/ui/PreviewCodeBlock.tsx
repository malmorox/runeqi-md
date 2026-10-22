import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@hooks/useTheme';

interface PreviewCodeBlockProps {
    language?: string;
    content: string;
}

// Code block of the preview. It's the only part of the preview that needs the theme in JS (the highlighter's colors
// are inline styles), so only code blocks re-render when the theme changes; the rest switches with `dark:` classes
const PreviewCodeBlock = ({ language, content }: PreviewCodeBlockProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <SyntaxHighlighter
            style={isDark ? vscDarkPlus : prism}
            language={language || 'plaintext'}
            PreTag="div"
            className="my-4 rounded-lg overflow-hidden"
            customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                backgroundColor: isDark ? '#3C3C40' : 'white'
            }}
        >
            {content}
        </SyntaxHighlighter>
    );
};

export default PreviewCodeBlock;
