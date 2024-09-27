import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'], 
        default: 'Pending'
    }
}, { timestamps: true });

const taskModel = mongoose.model('Task', taskSchema);
export default taskModel;
