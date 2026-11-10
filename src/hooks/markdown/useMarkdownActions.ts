import { useCallback } from 'react';
import { useEditor } from '@hooks/useEditor';

// Markdown insertions shared by the toolbar buttons and their shortcuts, applied at the editor's selection
export const useMarkdownActions = () => {
    const { insertMarkdown, wrapSelection } = useEditor();

    // Función para generar tablas
    const generateTable = useCallback((rows: number, cols: number) => {
        let table = '|';
        for (let i = 0; i < cols; i++) {
            table += ` Column ${i + 1} |`;
        }
        table += '\n|';
        for (let i = 0; i < cols; i++) {
            table += ' -------- |';
        }
        for (let i = 0; i < rows; i++) {
            table += '\n|';
            for (let j = 0; j < cols; j++) {
                table += ` Cell ${i + 1}-${j + 1} |`;
            }
        }
        //table += '\n';
        return table;
    }, []);

    // Acciones de formato
    const insertHeading = useCallback((level: 1 | 2 | 3 | 4 | 5 | 6, label: string) => {
        insertMarkdown(`${'#'.repeat(level)} ${label}`);
    }, [insertMarkdown]);

    const insertBold = useCallback(() => {
        wrapSelection('**', '**', 'bold text');
    }, [wrapSelection]);

    const insertItalic = useCallback(() => {
        wrapSelection('*', '*', 'italic text');
    }, [wrapSelection]);

    const insertStrikethrough = useCallback(() => {
        wrapSelection('~', '~', 'strikethrough text');
    }, [wrapSelection]);

    const insertQuote = useCallback(() => {
        const text = 'quoted text';
        insertMarkdown(`> ${text}`);
    }, [insertMarkdown]);

    const insertCode = useCallback(() => {
        wrapSelection('`', '`', 'enter code here');
    }, [wrapSelection]);

    // Without a text, the selected text (or the placeholder) becomes the link text
    const insertLink = useCallback((text?: string, url?: string) => {
        const linkUrl = url || 'https://example.com';
        if (text) insertMarkdown(`[${text}](${linkUrl})`);
        else wrapSelection('[', `](${linkUrl})`, 'link text');
    }, [insertMarkdown, wrapSelection]);

    // Without an alt text, the selected text (or the placeholder) becomes the alt text
    const insertImage = useCallback((alt?: string, url?: string) => {
        const imageUrl = url || 'https://example.com/image.jpg';
        if (alt) insertMarkdown(`![${alt}](${imageUrl})`);
        else wrapSelection('![', `](${imageUrl})`, 'description');
    }, [insertMarkdown, wrapSelection]);

    // Listas
    const insertUnorderedList = useCallback(() => {
        const content = '- Element 1\n- Element 2\n- Element 3';
        insertMarkdown(content);
    }, [insertMarkdown]);

    const insertOrderedList = useCallback(() => {
        const content = '1. Element 1\n2. Element 2\n3. Element 3';
        insertMarkdown(content);
    }, [insertMarkdown]);

    const insertTaskList = useCallback(() => {
        const content = '- [x] Task 1\n- [x] Task 2\n- [ ] Task 3';
        insertMarkdown(content);
    }, [insertMarkdown]);

    // Bloques de código
    const insertCodeBlock = useCallback((language: string = 'javascript') => {
        insertMarkdown(`\`\`\`${language}\n\n\`\`\``, -4);
    }, [insertMarkdown]);

    // Tabla
    const insertTable = useCallback((rows: number = 3, cols: number = 3) => {
        const table = generateTable(rows, cols);
        insertMarkdown(table);
    }, [insertMarkdown, generateTable]);

    // Emoji
    const insertEmoji = useCallback((emoji: string) => {
        insertMarkdown(emoji);
    }, [insertMarkdown]);

    // Divisor
    /*const insertDivider = useCallback(() => {
        insertMarkdown('\n---\n');
    }, [insertMarkdown]);*/

    return {
        // Formato de texto
        insertHeading,
        insertBold,
        insertItalic,
        insertStrikethrough,
        insertQuote,
        insertCode,
        
        // Enlaces y medios
        insertLink,
        insertImage,
        
        // Listas
        insertUnorderedList,
        insertOrderedList,
        insertTaskList,
        
        // Bloques
        insertCodeBlock,
        insertTable,
        
        // Otros
        insertEmoji,
        //insertDivider,
    };
};