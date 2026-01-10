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
        <div className="game-header">
            <h1 className="game-title">{title}</h1>

            <div className="game-stats">
                <div className="stat-box">
                    <span className="stat-label">SCORE</span>
                    <span className="stat-value">{formatScore(score)}</span>
                </div>

                <div className="stat-box">
                    <span className="stat-label">TIMER</span>
                    <span className="stat-value">{formatTime(time)}</span>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;
