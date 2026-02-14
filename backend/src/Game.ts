import { Chess } from 'chess.js';
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "./Messages.js";

export class Game {
    private player1: WebSocket;
    private player2: WebSocket;
    private board: Chess
    private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }

    makeMove(socket: WebSocket, playermove: {
        from: string;
        to: string;
    }) {
        // Validate turn
        if (this.board.history().length % 2 === 0 && socket !== this.player1) {
            return
        }
        if (this.board.history().length % 2 === 1 && socket !== this.player2) {
            return;
        }

        try {
            // Make the move
            this.board.move(playermove);
        } catch (e) {
            console.log(e);
            return; // Invalid move
        }

        // Check for game over
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }

        this.player1.send(JSON.stringify({
            type: MOVE,
            payload: playermove
        }));

        this.player2.send(JSON.stringify({
            type: MOVE,
            payload: playermove
        }));
    }

    getPlayer1() {
        return this.player1;
    }

    getPlayer2() {
        return this.player2;
    }
}