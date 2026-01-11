import React from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Circle,
    RotateCcw,
    HelpCircle,
    Save,
    Upload
} from 'lucide-react';

const GameControls = ({
    onLeft,
    onRight,
    onEnter,
    onUndo,
    onReset,
    onHint,
    onSave,
    onLoad,
    canUndo = true,
    gameStatus = 'playing'
}) => {
    const isGameOver = gameStatus === 'win' || gameStatus === 'draw';

    return (
        <div className="flex flex-col gap-3">
            {/* Direction controls - only show if callbacks provided */}
            <div className="flex items-center justify-center gap-2">
                {onLeft && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground"
                        onClick={onLeft}
                        aria-label="Left"
                    >
                        <ArrowLeft size={20} />
                        <span>LEFT</span>
                    </button>
                )}

                {onRight && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground"
                        onClick={onRight}
                        aria-label="Right"
                    >
                        <ArrowRight size={20} />
                        <span>RIGHT</span>
                    </button>
                )}

                {onEnter && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:bg-emerald-600"
                        onClick={onEnter}
                        aria-label="Enter"
                    >
                        <Circle size={20} />
                        <span>ENTER</span>
                    </button>
                )}

                <button
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                >
                    <RotateCcw size={20} />
                    <span>BACK</span>
                </button>

                {onHint && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground"
                        onClick={onHint}
                        aria-label="Hint"
                    >
                        <HelpCircle size={20} />
                        <span>HINT</span>
                    </button>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2">
                {onSave && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground"
                        onClick={onSave}
                        aria-label="Save"
                    >
                        <Save size={18} />
                        <span>SAVE</span>
                    </button>
                )}

                {onLoad && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary border-none rounded-lg text-sm font-medium text-muted-foreground cursor-pointer transition-all hover:bg-accent hover:text-foreground"
                        onClick={onLoad}
                        aria-label="Load"
                    >
                        <Upload size={18} />
                        <span>LOAD</span>
                    </button>
                )}

                {isGameOver && (
                    <button
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 border-none rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:bg-emerald-600"
                        onClick={onReset}
                        aria-label="Play Again"
                    >
                        <RotateCcw size={18} />
                        <span>PLAY AGAIN</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameControls;
