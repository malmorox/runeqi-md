import type { IconType } from 'react-icons';
import { LuColumns2, LuEye, LuSquarePen } from 'react-icons/lu';
import type { ViewMode } from '@/types/viewMode';
import type { ViewModeKey } from '@/types/shortcut';

export const VIEW_MODES: { id: ViewMode; label: string; icon: IconType; key: ViewModeKey }[] = [
    { id: 'editor', label: 'Editor only', icon: LuSquarePen, key: 'Digit1' },
    { id: 'split', label: 'Split view', icon: LuColumns2, key: 'Digit2' },
    { id: 'preview', label: 'Preview only', icon: LuEye, key: 'Digit3' },
];
