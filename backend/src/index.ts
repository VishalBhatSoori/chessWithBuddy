import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager.js';
import { initKafka } from './kafka.js';

dotenv.config({})

const portStr = process.env.PORT;
if (!portStr) {
    throw new Error("Missing required environment variable: PORT");
}
const portNo = parseInt(portStr);

const wss = new WebSocketServer({ port: portNo });

initKafka();

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    gameManager.addUser(ws)
    ws.on("close", () => {
        gameManager.removeUser(ws)
    });
});