/**
 * GameInfoSidebar Component
 * Displays game rankings, session history, and reviews in a sidebar grid
 */
import React from 'react';
import GameRankings from "@/features/games/components/GameRankings";
import GameSessionHistory from "@/features/games/components/GameSessionHistory";
import GameReviews from "@/features/games/components/GameReviews";

const GameInfoSidebar = ({ gameId, onResume }) => {
  if (!gameId) return null;

  return (
    <div className="mt-6 w-full max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rankings - Left */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <GameRankings gameId={gameId} limit={6} showCountdown={false} />
        </div>

        {/* History - Center */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <GameSessionHistory
            gameId={gameId}
            limit={5}
            onResume={onResume}
          />
        </div>

        {/* Reviews - Right */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <GameReviews gameId={gameId} />
        </div>
      </div>
    </div>
  );
};

export default GameInfoSidebar;
