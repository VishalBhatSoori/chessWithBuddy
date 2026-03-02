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
                const moveData = JSON.parse(message.value.toString());
                const { gameId, move, fen, timestamp } = moveData;

                // Make sure the Game exists
                await GameModel.updateOne(
                    { gameId },
                    { $setOnInsert: { gameId, createdAt: timestamp } },
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
