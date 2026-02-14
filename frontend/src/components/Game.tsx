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
                    alert(`Game Over! Winner: ${message.payload.winner}`);
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

    return <div className="justify-center flex">
        <div className="pt-8 max-w-5xl w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <ChessBoard
                            socket={socket}
                            board={board}
                            gameStarted={gameStarted}
                            myColor={myColor}
                            currentTurn={chess.turn()}
                        />
                    </div>
                </div>
                <div className="col-span-2 bg-slate-900 w-full flex justify-center items-center">
                    <div className="">
                        {!started ? (
                            <div className="flex flex-col gap-4 items-center">
                                <Button onClick={() => {
                                    socket.send(JSON.stringify({
                                        type: INIT_GAME
                                    }));
                                    setStarted(true);
                                }}>
                                    Play
                                </Button>
                                <p className="text-white text-sm italic font-bold">Winner takes it all !!!</p>
                            </div>
                        ) : !gameStarted ? (
                            <div className="text-white text-center px-4">
                                <div className="bg-slate-800 rounded-lg p-6">
                                    <p className="text-2xl mb-4">⏳</p>
                                    <p className="text-xl font-bold mb-2">Waiting for opponent...</p>
                                    <p className="text-sm text-gray-400">
                                        Open this URL in another browser tab or share it with a friend!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-white text-center px-4">
                                <div className="bg-green-800 rounded-lg p-6 mb-4">
                                    <p className="text-xl font-bold">🎮 Game On!</p>
                                </div>
                                <div className="bg-slate-800 rounded-lg p-4 text-sm">
                                    <p className="mb-2">
                                        <strong>Your Color:</strong> {myColor?.toUpperCase()}
                                    </p>
                                    <p>
                                        <strong>Turn:</strong> {chess.turn() === 'w' ? 'WHITE' : 'BLACK'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
}