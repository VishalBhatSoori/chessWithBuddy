import { Kafka } from 'kafkajs';

const kafkaConfig: any = {
    clientId: 'chess-backend',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    ssl: process.env.KAFKA_USERNAME ? {
        rejectUnauthorized: false,
    } : false,
};

if (process.env.KAFKA_USERNAME) {
    kafkaConfig.sasl = {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD || ''
    };
}

const kafka = new Kafka(kafkaConfig);

export const producer = kafka.producer();

export async function initKafka() {
    try {
        await producer.connect();
        console.log("Connected to Kafka producer (Aiven/SSL)");
    } catch (e) {
        console.error("Failed to connect to Kafka producer", e);
    }
}
