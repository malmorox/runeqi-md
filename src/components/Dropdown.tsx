import { useEffect, useRef, type ReactNode } from 'react';

interface DropdownProps {
    isOpen: boolean;
    children: ReactNode;
}

const Dropdown = ({ isOpen, children }: DropdownProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Focuses the first field (or button) so the dropdown can be used from the keyboard right after its shortcut
    useEffect(() => {
        if (!isOpen || !ref.current) return;
        const first = ref.current.querySelector<HTMLElement>('input:not([hidden])') ?? ref.current.querySelector<HTMLElement>('button');
        first?.focus();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div ref={ref} className="absolute top-full left-0 mt-3 bg-[#252526] border border-[#bbbbbb] rounded-lg shadow-lg z-10">
            {children}
        </div>
    );
};

export default Dropdown;
