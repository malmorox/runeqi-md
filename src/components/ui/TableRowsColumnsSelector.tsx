import { useState } from 'react';

interface TableRowsColumnsSelectorProps {
    maxRows?: number;
    maxCols?: number;
    onSelect: (selection: { rows: number; cols: number }) => void;
}

const TableRowsColumnsSelector = ({ 
    maxRows = 10, 
    maxCols = 10,
    onSelect 
}: TableRowsColumnsSelectorProps) => {
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = (row: number, col: number) => {
        setIsHovering(true);
        setHoveredCell({ row, col });
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setHoveredCell({ row: 0, col: 0 });
    };

    const handleClick = () => {
        if (hoveredCell.row > 0 && hoveredCell.col > 0) {
            onSelect({ rows: hoveredCell.row, cols: hoveredCell.col });
        }
    };

    const isActive = (row: number, col: number) => {
        return isHovering && row <= hoveredCell.row && col <= hoveredCell.col;
    };

    return (
        <div className="table-picker">
            <div
                className="table-picker-area"
                onMouseLeave={handleMouseLeave}
            >
                <div className="table-picker-grid" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                    {Array.from({ length: maxRows }, (_, rowIndex) => (
                        Array.from({ length: maxCols }, (_, colIndex) => {
                            const row = rowIndex + 1;
                            const col = colIndex + 1;
                            const active = isActive(row, col);

                            return (
                                <div
                                    key={`${row}-${col}`}
                                    data-active={active || undefined}
                                    className="table-picker-cell"
                                    onMouseEnter={() => handleMouseEnter(row, col)}
                                    onClick={handleClick}
                                />
                            );
                        })
                    ))}
                </div>
            </div>

            {isHovering && hoveredCell.row > 0 && hoveredCell.col > 0 && (
                <div className="table-picker-size">
                    {hoveredCell.row} × {hoveredCell.col}
                </div>
            )}
        </div>
    );
}

export default TableRowsColumnsSelector;