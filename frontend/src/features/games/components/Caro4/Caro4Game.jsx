import React from 'react';
import { CaroGame, caro4AI } from '../shared';

const Caro4Game = () => {
    return (
        <CaroGame
            gameName="CARO 4 HÀNG"
            lobbyPath="/games/caro4"
            ai={caro4AI}
            theme="amber"
        />
    );
};

export default Caro4Game;
