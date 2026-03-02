import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
    gameId: { type: String, required: true, index: true },
    move: {
        from: { type: String, required: true },
        to: { type: String, required: true },
        promotion: { type: String }
    },
    fen: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const MoveModel = mongoose.model('Move', moveSchema);
