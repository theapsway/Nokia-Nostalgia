import React from 'react';

const BlockyTitle: React.FC = () => {
    // Pixel grid for "SNAKE" (red to yellow gradient)
    const snakeGrid = [
        // S     N     A     K     E
        [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    ];

    // Pixel grid for "GAME" (yellow)
    const gameGrid = [
        // G     A     M     E
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    ];

    const blockSize = 10; // Size of each pixel block - compact for sidebar

    const getSnakeBlockColor = (row: number, col: number): string => {
        // Create gradient from red to yellow across the word
        const ratio = col / 23; // 24 columns total (0-23)

        if (ratio < 0.3) {
            return '#bd2222'; // Red at start
        } else if (ratio < 0.7) {
            return '#d66e16'; // Orange-red in middle  
        } else {
            return '#d6b211'; // Yellow at end
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* SNAKE */}
            <div
                className="flex flex-wrap"
                style={{ width: `${snakeGrid[0].length * blockSize}px` }}
            >
                {snakeGrid.map((row, rowIndex) =>
                    row.map((pixel, colIndex) => (
                        <div
                            key={`snake-${rowIndex}-${colIndex}`}
                            style={{
                                width: `${blockSize}px`,
                                height: `${blockSize}px`,
                                backgroundColor: pixel ? getSnakeBlockColor(rowIndex, colIndex) : 'transparent',
                                boxShadow: pixel
                                    ? `0 0 10px ${getSnakeBlockColor(rowIndex, colIndex)}95, inset 0 0 3px rgba(0,0,0,0.3)`
                                    : 'none',
                                border: pixel ? '0.5px solid rgba(0,0,0,0.2)' : 'none',
                            }}
                        />
                    ))
                )}
            </div>

            {/* GAME */}
            <div
                className="flex flex-wrap"
                style={{ width: `${gameGrid[0].length * blockSize}px` }}
            >
                {gameGrid.map((row, rowIndex) =>
                    row.map((pixel, colIndex) => (
                        <div
                            key={`game-${rowIndex}-${colIndex}`}
                            style={{
                                width: `${blockSize}px`,
                                height: `${blockSize}px`,
                                backgroundColor: pixel ? '#d6b211' : 'transparent',
                                boxShadow: pixel
                                    ? '0 0 10px #d6b21195, inset 0 0 3px rgba(0,0,0,0.3)'
                                    : 'none',
                                border: pixel ? '0.5px solid rgba(0,0,0,0.2)' : 'none',
                            }}
                        />
                    ))
                )}
            </div>

            {/* Snake head decoration */}
            <div className="relative -mt-1 ml-auto mr-2">
                <svg width="60" height="24" viewBox="0 0 60 24">
                    {/* Snake body */}
                    <rect x="0" y="6" width="14" height="12" fill="#d6b211" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                    <rect x="14" y="6" width="14" height="12" fill="#d6b211" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                    <rect x="28" y="8" width="10" height="8" fill="#d6b211" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                    <polygon points="38,12 48,9 48,15" fill="#d6b211" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />

                    {/* Eyes */}
                    <circle cx="20" cy="10" r="2" fill="#000" />
                    <circle cx="20" cy="14" r="2" fill="#000" />
                    <circle cx="20.5" cy="9.5" r="0.7" fill="#fff" opacity="0.6" />
                    <circle cx="20.5" cy="13.5" r="0.7" fill="#fff" opacity="0.6" />

                    {/* Forked tongue */}
                    <line x1="48" y1="12" x2="54" y2="12" stroke="#bd2222" strokeWidth="1.5" />
                    <line x1="54" y1="12" x2="58" y2="9" stroke="#bd2222" strokeWidth="1.2" />
                    <line x1="54" y1="12" x2="58" y2="15" stroke="#bd2222" strokeWidth="1.2" />

                    {/* Glow effect */}
                    <rect x="0" y="6" width="48" height="12" fill="none" stroke="#d6b211" strokeWidth="0.5" opacity="0.3"
                        filter="blur(2px)" />
                </svg>
            </div>
        </div>
    );
};

export default BlockyTitle;
