import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    gameId: { type: String, required: true, unique: true },
    player1: { type: String },
    player2: { type: String },
    status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'IN_PROGRESS' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const GameModel = mongoose.model('Game', gameSchema);
