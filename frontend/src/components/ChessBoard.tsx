import { type Color, type PieceSymbol, type Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "./Game";

export const ChessBoard = ({ 
    board, 
    socket, 
    gameStarted, 
    myColor,
    currentTurn 
}: {
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
    gameStarted: boolean;
    myColor: string | null;
    currentTurn: string;
}) => {
    const [from, setFrom] =useState<null | Square>(null);

    const isMyTurn = () => {
        if (!gameStarted || !myColor) return false;
        return (currentTurn === 'w' && myColor === 'white') || 
               (currentTurn === 'b' && myColor === 'black');
    };

    const handleSquareClick = (square: Square, piece: any) => {
        if (!gameStarted) {
            return;
        }

        if (!isMyTurn()) {
            return;
        }

        if (!from) {
            if (piece && piece.color === currentTurn) {
                setFrom(square);
            } else {
            }
        } else {
            socket.send(JSON.stringify({
                type: MOVE,
                payload: {
                    move: {
                        from,
                        to: square
                    }
                }
            }));
            setFrom(null);
        }
    };

    return <div className="text-white-200 border-4 border-slate-700 rounded-lg overflow-hidden relative">
        {board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {
                    const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                    const isSelected = from === squareRepresentation;
                    const isDarkSquare = (i + j) % 2 === 1;

                    return <div 
                        onClick={() => handleSquareClick(squareRepresentation, square)}
                        key={j} 
                        className={`w-16 h-16 cursor-pointer transition-all
                            ${isSelected ? 'bg-yellow-400 ring-4 ring-yellow-600' : 
                              isDarkSquare ? 'bg-slate-600 hover:bg-slate-500' : 
                              'bg-green-400 hover:bg-green-300'}
                        `}
                    >
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                                {square ? (
                                    <img 
                                        className="w-12 h-12" 
                                        src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} 
                                        alt={`${square.color} ${square.type}`}
                                    />
                                ) : null} 
                            </div>
                        </div>
                    </div>
                })}
            </div>
        })}
        {!gameStarted && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                    <p className="text-white text-3xl font-bold mb-2">⏳ Waiting for opponent...</p>
                    <p className="text-gray-300 text-lg">Open another browser tab and click "Play"</p>
                </div>
            </div>
        )}
    </div>
}