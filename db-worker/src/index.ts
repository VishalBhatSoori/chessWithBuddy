import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Kafka } from 'kafkajs';
import { MoveModel } from './models/Move.js';
import { GameModel } from './models/Game.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chess';
const kafkaBrokers = [process.env.KAFKA_BROKER || 'localhost:9092'];

console.log('Connecting to MongoDB...');
await mongoose.connect(mongoUri);
console.log('Connected to MongoDB');

const kafka = new Kafka({
    clientId: 'db-worker',
    brokers: kafkaBrokers
});

const consumer = kafka.consumer({ groupId: 'chess-db-worker-group' });

async function initKafkaConsumer() {
    await consumer.connect();
    console.log('Connected to Kafka consumer');

    await consumer.subscribe({ topic: 'chess-moves', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value) return;
            try {
                const data = JSON.parse(message.value.toString());

                if (data.type === 'GAME_OVER') {
                    // Update the game status
                    await GameModel.updateOne(
                        { gameId: data.gameId },
                        {
                            $set: { status: data.status },
                            $setOnInsert: { gameId: data.gameId, createdAt: data.timestamp || new Date() }
                        },
                        { upsert: true }
                    );
                    console.log(`Game ${data.gameId} marked as ${data.status}`);
                    return;
                }

                const { gameId, move, fen, timestamp } = data;

                if (!gameId || !move || !fen) {
                    console.warn("Ignoring invalid or incomplete message:", data);
                    return;
                }

                // Make sure the Game exists
                await GameModel.updateOne(
                    { gameId },
                    { $setOnInsert: { gameId, createdAt: timestamp || new Date() } },
                    { upsert: true }
                );

                // Insert the Move
                const newMove = new MoveModel({
                    gameId,
                    move,
                    fen,
                    timestamp: timestamp || new Date()
                });
                await newMove.save();
                console.log(`Saved move for game ${gameId}`);
            } catch (err) {
                console.error("Error processing message:", err);
            }
        },
    });
}

initKafkaConsumer().catch(console.error);
