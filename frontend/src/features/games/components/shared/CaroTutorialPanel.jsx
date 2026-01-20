import React from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';

/**
 * Tutorial Panel Component - Panel hiển thị hướng dẫn chơi (Desktop)
 * @param {Object} props
 * @param {Array} tutorialSteps - Danh sách các bước tutorial
 * @param {number} tutorialStep - Bước hiện tại (0-indexed)
 * @param {Object} currentTutorialStep - Dữ liệu bước hiện tại
 * @param {boolean} isTyping - Đang typing effect?
 * @param {string} displayedTitle - Title đã hiển thị
 * @param {string} displayedText - Text đã hiển thị
 * @param {boolean} showNextButton - Hiển thị nút tiếp tục?
 * @param {function} nextTutorialStep - Hàm chuyển bước tiếp
 * @param {function} exitTutorial - Hàm thoát tutorial
 */
export const CaroTutorialPanel = ({
    tutorialSteps,
    tutorialStep,
    currentTutorialStep,
    isTyping,
    displayedTitle,
    displayedText,
    showNextButton,
    nextTutorialStep,
    exitTutorial,
}) => {
    if (!currentTutorialStep || !tutorialSteps) return null;

    return (
        <div className="hidden md:flex flex-col w-80 h-fit p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Hướng dẫn chơi</span>
                </div>
                <button
                    className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-all"
                    onClick={exitTutorial}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1 mb-4">
                {tutorialSteps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`flex-1 h-1.5 rounded-full transition-colors
                            ${idx < tutorialStep ? 'bg-emerald-500' :
                                idx === tutorialStep ? 'bg-emerald-400 animate-pulse' :
                                    'bg-secondary'}`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div className="mb-4">
                <div className="text-xs text-muted-foreground mb-2">
                    Bước {tutorialStep + 1}/{tutorialSteps.length}
                </div>
                <div className="text-xl font-bold text-foreground mb-3 min-h-[2rem]">
                    {displayedTitle}
                    {isTyping && displayedText.length === 0 && <span className="animate-pulse">|</span>}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                    {displayedText}
                    {isTyping && displayedText.length > 0 && <span className="animate-pulse text-emerald-400">|</span>}
                </div>
            </div>

            {/* Action Buttons */}
            {showNextButton && (
                <button
                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-md"
                    onClick={nextTutorialStep}
                >
                    {currentTutorialStep.action === 'finish' ? (
                        <>🎮 Bắt đầu chơi</>
                    ) : (
                        <>
                            Tiếp tục
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
            )}

            {/* Hint for click_cell action */}
            {!isTyping && currentTutorialStep?.action === 'click_cell' && (
                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/50">
                    <div className="text-sm text-muted-foreground">Nhấn vào ô được đánh dấu!</div>
                    <div className="text-3xl animate-bounce">👆</div>
                </div>
            )}

            {/* Tips */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground leading-relaxed">
                    💡 {currentTutorialStep?.action === 'click_cell' && !isTyping && 'Nhấn vào ô sáng lên để tiếp tục'}
                    {currentTutorialStep?.action === 'click_next' && !isTyping && 'Nhấn nút Tiếp tục bên dưới'}
                    {currentTutorialStep?.action === 'finish' && !isTyping && 'Bạn đã sẵn sàng chiến đấu!'}
                    {isTyping && 'Đang hiển thị hướng dẫn...'}
                </div>
            </div>
        </div>
    );
};

export default CaroTutorialPanel;
