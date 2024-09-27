import express from "express";
import { registerUser, login, updateTask, deleteTask, updateTaskStatus, getCompletedTasks, getTasks, createTask } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router()

router.post('/register', registerUser);
router.post('/login', login);

router.use(protect);

router.post('/create', createTask);
router.get('/list', getTasks);
router.put('/update/:taskId', updateTask);
router.delete('/delete/:taskId', deleteTask);
router.put('/status/:taskId', updateTaskStatus);
router.get('/completed', getCompletedTasks);

export default router;