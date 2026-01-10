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
        <div className="game-controls">
            {/* Direction controls - only show if callbacks provided */}
            <div className="controls-row controls-main">
                {onLeft && (
                    <button className="control-btn" onClick={onLeft} aria-label="Left">
                        <ArrowLeft size={20} />
                        <span>LEFT</span>
                    </button>
                )}

                {onRight && (
                    <button className="control-btn" onClick={onRight} aria-label="Right">
                        <ArrowRight size={20} />
                        <span>RIGHT</span>
                    </button>
                )}

                {onEnter && (
                    <button className="control-btn control-btn-primary" onClick={onEnter} aria-label="Enter">
                        <Circle size={20} />
                        <span>ENTER</span>
                    </button>
                )}

                <button
                    className="control-btn"
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                >
                    <RotateCcw size={20} />
                    <span>BACK</span>
                </button>

                {onHint && (
                    <button className="control-btn" onClick={onHint} aria-label="Hint">
                        <HelpCircle size={20} />
                        <span>HINT</span>
                    </button>
                )}
            </div>

            {/* Action buttons */}
            <div className="controls-row controls-actions">
                {onSave && (
                    <button className="control-btn control-btn-secondary" onClick={onSave} aria-label="Save">
                        <Save size={18} />
                        <span>SAVE</span>
                    </button>
                )}

                {onLoad && (
                    <button className="control-btn control-btn-secondary" onClick={onLoad} aria-label="Load">
                        <Upload size={18} />
                        <span>LOAD</span>
                    </button>
                )}

                {isGameOver && (
                    <button
                        className="control-btn control-btn-primary"
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
