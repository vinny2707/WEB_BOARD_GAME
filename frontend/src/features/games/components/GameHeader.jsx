import React, { useEffect, useRef } from 'react';

const GameHeader = ({ title, score, time, onTimeUpdate, isPlaying }) => {
    const timerRef = useRef(null);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                onTimeUpdate(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isPlaying, onTimeUpdate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatScore = (score) => {
        return score.toString().padStart(5, '0');
    };

    return (
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
            <h1 className="text-xl font-bold tracking-wider text-foreground uppercase">{title}</h1>

            <div className="flex gap-4">
                <div className="flex flex-col items-center px-4 py-2 bg-secondary rounded-lg min-w-[80px]">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">SCORE</span>
                    <span className="text-lg font-bold font-mono text-foreground">{formatScore(score)}</span>
                </div>

                <div className="flex flex-col items-center px-4 py-2 bg-secondary rounded-lg min-w-[80px]">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">TIMER</span>
                    <span className="text-lg font-bold font-mono text-foreground">{formatTime(time)}</span>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;
