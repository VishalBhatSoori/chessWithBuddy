import { Chess } from 'chess.js';
import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Button } from "./Button";
import { ChessBoard } from "./ChessBoard";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [myColor, setMyColor] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setStarted(true);
                    setGameStarted(true);
                    setMyColor(message.payload.color);
                    break;

                case MOVE:
                    const move = message.payload;

                    try {
                        chess.move(move);
                        setBoard([...chess.board()]);
                    } catch (e) {
                    }
                    break;

                case GAME_OVER:
                case "GAME_OVER":
                    if (message.payload.reason === "opponent_disconnected") {
                        alert(`Game Over! Your opponent abandoned the game. You win!`);
                    } else {
                        alert(`Game Over! Winner: ${message.payload.winner}`);
                    }
                    setGameStarted(false);
                    break;
            }
        }

        socket.onerror = () => {
        };

        socket.onclose = () => {
        };

    }, [socket, chess]);

    if (!socket) return <div className="flex justify-center items-center h-screen text-white text-2xl">
        Connecting to server...
    </div>

    return (
        <div
            className="min-h-screen overflow-y-auto bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-4"
            style={{ backgroundImage: "url('/chess-bg.avif')" }}
        >
            <div className="max-w-2xl w-full px-4 flex flex-col gap-4 items-center sm:mt-[-4vh]">

                {/* Status Container (Top) */}
                <div className="w-full flex justify-center">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-2 shadow-2xl w-full max-w-[552px] border border-white/10">
                        {!started ? (
                            <div className="flex flex-col gap-4 items-center p-4 justify-center text-center">
                                <Button onClick={() => {
                                    socket.send(JSON.stringify({
                                        type: INIT_GAME
                                    }));
                                    setStarted(true);
                                }}>
                                    Play
                                </Button>
                                <p className="text-white text-xs italic font-bold">Winner takes it all !!!</p>
                            </div>
                        ) : !gameStarted ? (
                            <div className="text-white text-center p-4 flex flex-col justify-center items-center">
                                <p className="text-3xl mb-2">⏳</p>
                                <p className="text-lg font-bold mb-2">Waiting for opponent...</p>
                                <p className="text-xs text-gray-300">
                                    Open the same link in another browser tab and click "Play" or Share the link with a Friend
                                </p>
                            </div>
                        ) : (
                            <div className="text-white text-center p-4 flex flex-col gap-3">
                                <div className="bg-slate-800/80 rounded-xl p-3 text-sm flex flex-col gap-2 border border-white/5">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-1">
                                        <span className="text-gray-300">Your Color</span>
                                        <span className="font-bold">{myColor?.toUpperCase()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-300">Current Turn</span>
                                        <span className="font-bold">{chess.turn() === 'w' ? 'WHITE' : 'BLACK'}</span>
                                    </div>
                                </div>
                                <div className="bg-green-600/90 rounded-xl p-2 shadow border border-green-500/30">
                                    <p className="font-bold text-sm">🎮 Game On!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Board Container (Bottom) */}
                <div className="w-full flex justify-center">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/10 flex flex-col items-center w-fit">
                        <ChessBoard
                            socket={socket}
                            board={board}
                            gameStarted={gameStarted}
                            myColor={myColor}
                            currentTurn={chess.turn()}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}