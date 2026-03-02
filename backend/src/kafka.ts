import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'chess-backend',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

export const producer = kafka.producer();

export async function initKafka() {
    try {
        await producer.connect();
        console.log("Connected to Kafka producer");
    } catch (e) {
        console.error("Failed to connect to Kafka producer", e);
    }
}
