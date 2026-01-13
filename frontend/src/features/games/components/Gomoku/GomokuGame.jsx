import React from 'react';
import { CaroGame, gomokuAI } from '../shared';

const GomokuGame = () => {
    return (
        <CaroGame
            gameName="CARO 5 HÀNG"
            lobbyPath="/games/gomoku"
            ai={gomokuAI}
            theme="emerald"
        />
    );
};

export default GomokuGame;
