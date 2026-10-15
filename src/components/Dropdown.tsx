import type { ReactNode } from 'react';

interface DropdownProps {
    isOpen: boolean;
    children: ReactNode;
}

const Dropdown = ({ isOpen, children }: DropdownProps) => {
    if (!isOpen) return null;
    
    return (
        <div className="absolute top-full left-0 mt-3 bg-[#252526] border border-[#bbbbbb] rounded-lg shadow-lg z-10">
            {children}
        </div>
    );
};

export default Dropdown;