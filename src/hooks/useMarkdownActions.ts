import { useCallback } from 'react';

interface MarkdownActionsProps {
    onInsert: (markdown: string, cursorOffset?: number) => void;
}

export const useMarkdownActions = ({ onInsert }: MarkdownActionsProps) => {
    // Función para generar tablas
    const generateTable = useCallback((rows: number, cols: number) => {
        let table = '|';
        for (let i = 0; i < cols; i++) {
            table += ` Column ${i + 1} |`;
        }
        table += '\n|';
        for (let i = 0; i < cols; i++) {
            table += ' --------- |';
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
        onInsert(`${'#'.repeat(level)} ${label}`);
    }, [onInsert]);

    const insertBold = useCallback(() => {
        const text = 'bold text';
        onInsert(`**${text}**`, -2);
    }, [onInsert]);

    const insertItalic = useCallback(() => {
        const text = 'italic text';
        onInsert(`*${text}*`, -1);
    }, [onInsert]);

    const insertStrikethrough = useCallback(() => {
        const text = 'strikethrough text';
        onInsert(`~${text}~`, -1);
    }, [onInsert]);

    const insertQuote = useCallback(() => {
        const text = 'quoted text';
        onInsert(`> ${text}`);
    }, [onInsert]);

    const insertCode = useCallback(() => {
        const text = 'enter code here';
        onInsert(`\`${text}\``, -1);
    }, [onInsert]);

    const insertLink = useCallback((text?: string, url?: string) => {
        const linkText = text || 'link text';
        const linkUrl = url || 'https://example.com';
        onInsert(`[${linkText}](${linkUrl})`);
    }, [onInsert]);

    const insertImage = useCallback((alt?: string, url?: string) => {
        const altText = alt || 'description';
        const imageUrl = url || 'https://example.com/image.jpg';
        onInsert(`![${altText}](${imageUrl})`);
    }, [onInsert]);

    // Listas
    const insertUnorderedList = useCallback(() => {
        const content = '- Element 1\n- Element 2\n- Element 3';
        onInsert(content);
    }, [onInsert]);

    const insertOrderedList = useCallback(() => {
        const content = '1. Element 1\n2. Element 2\n3. Element 3';
        onInsert(content);
    }, [onInsert]);

    const insertTaskList = useCallback(() => {
        const content = '- [x] Task 1\n- [x] Task 2\n- [ ] Task 3';
        onInsert(content);
    }, [onInsert]);

    // Bloques de código
    const insertCodeBlock = useCallback((language: string = 'javascript') => {
        onInsert(`\`\`\`${language}\n\n\`\`\``, -4);
    }, [onInsert]);

    // Tabla
    const insertTable = useCallback((rows: number = 3, cols: number = 3) => {
        const table = generateTable(rows, cols);
        onInsert(table);
    }, [onInsert, generateTable]);

    // Emoji
    const insertEmoji = useCallback((emoji: string) => {
        onInsert(emoji);
    }, [onInsert]);

    // Divisor
    /*const insertDivider = useCallback(() => {
        onInsert('\n---\n');
    }, [onInsert]);*/

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