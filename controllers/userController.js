import User from "../schemas/userModel.js";
import taskModel from "../schemas/taskModel.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import { io } from "../server.js";

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(401);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password
    })

    if (user) {
        generateToken(res, user._id, 'userJwt');
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        })
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
}

const login = async (req, res) => {

    const { email, password } = req.body;
    console.log(req.body);
    

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id, 'userJwt');
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: token,
        })
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
}



const createTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskName } = req.body;

        if (!taskName || taskName.trim() === '') {
            return res.status(400).json({ success: false, message: "Task name is required and cannot be empty" });
        }

        const existingTask = await taskModel.findOne({ userId, taskName: taskName.trim() });
        if (existingTask) {
            return res.status(400).json({ success: false, message: "A task with this name already exists" });
        }

        const newTask = new taskModel({
            userId,
            taskName: taskName.trim(),
            status: 'Pending'
        });

        const savedTask = await newTask.save();

        req.io.to(userId.toString()).emit('task_added', savedTask);

        res.status(201).json({ success: true, message: "Task created successfully", task: savedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create task" });
    }
};

const getTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const tasks = await taskModel.find({ userId, status: { $ne: "Completed" } });
        res.status(200).json({ success: true, message: "Tasks retrieved successfully", tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to retrieve tasks" });
    }
};

const updateTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskId } = req.params;
        const { taskName } = req.body;

        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: "Invalid task ID" });
        }

        const updatedTask = await taskModel.findOneAndUpdate(
            { _id: taskId, userId },
            { $set: { taskName } },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found or not authorized to update" });
        }

        req.io.to(userId.toString()).emit('task_updated', updatedTask);

        res.status(200).json({ success: true, message: "Task updated successfully", task: updatedTask });
    } catch (error) {
        console.error('Error in updateTask:', error);
        res.status(500).json({ success: false, message: "Failed to update task", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskId } = req.params;

        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: "Invalid task ID" });
        }

        const deletedTask = await taskModel.findOneAndDelete({ _id: taskId, userId });

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: "Task not found or not authorized to delete" });
        }

        req.io.to(userId.toString()).emit('task_deleted', taskId);

        res.status(200).json({ success: true, message: "Task deleted successfully", taskId });
    } catch (error) {
        console.error('Error in deleteTask:', error);
        res.status(500).json({ success: false, message: "Failed to delete task", error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { taskId } = req.params;
        const { status } = req.body;

        const updatedTask = await taskModel.findOneAndUpdate(
            { _id: taskId, userId },
            { $set: { status } },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found or not authorized to update" });
        }

        if (status === 'Completed') {
            req.io.to(userId.toString()).emit('task_completed', updatedTask);
        } else {
            req.io.to(userId.toString()).emit('task_updated', updatedTask);
        }

        res.status(200).json({ success: true, message: "Task status updated successfully", task: updatedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to update task status" });
    }
};

const getCompletedTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const completedTasks = await taskModel.find({ userId, status: "Completed" });
        res.status(200).json({ success: true, message: "Completed tasks retrieved successfully", tasks: completedTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to retrieve completed tasks" });
    }
};

export {
    registerUser,
    login,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getCompletedTasks,
};