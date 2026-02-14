import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager.js';

dotenv.config({})

const portStr = process.env.PORT;
if (!portStr) {
    throw new Error("Missing required environment variable: PORT");
}
const portNo = parseInt(portStr);

const wss = new WebSocketServer({ port: portNo });

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    gameManager.addUser(ws)
    ws.on("disconnect", () => {
        gameManager.removeUser(ws)
    });
});