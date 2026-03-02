import { WebSocket } from 'ws';
import { Game } from './Game.js';
import { INIT_GAME, MOVE } from './Messages.js';

export class GameManager {
    private games: Game[];
    private waitingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = [];
        this.waitingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket) {
        this.users.push(socket);
        this.handleMessage(socket)
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(user => user !== socket);

        if (this.waitingUser === socket) {
            this.waitingUser = null;
        }

        const game = this.games.find(g => g.getPlayer1() === socket || g.getPlayer2() === socket);
        if (game) {
            // Notify the other player that the game is over due to abandonment
            const opponent = game.getPlayer1() === socket ? game.getPlayer2() : game.getPlayer1();
            opponent.send(JSON.stringify({
                type: "GAME_OVER",
                payload: {
                    winner: game.getPlayer1() === socket ? "black" : "white",
                    reason: "opponent_disconnected"
                }
            }));

            // Remove game from active games
            this.games = this.games.filter(g => g !== game);
        }
    }

    private handleMessage(socket: WebSocket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME) {
                if (this.waitingUser) {
                    const game = new Game(this.waitingUser, socket);
                    this.games.push(game);
                    this.waitingUser = null;
                } else {
                    this.waitingUser = socket;
                }
            }

            if (message.type === MOVE) {
                const game = this.games.find(game => game.getPlayer1() === socket || game.getPlayer2() === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
        })
    }
}