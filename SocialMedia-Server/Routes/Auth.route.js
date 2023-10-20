import Express from "express";
import { loginUser, registerUser } from "../Controllers/Auth.controller.js";


const router = Express.Router();

//routes
router.post('/register', registerUser)
router.post('/login', loginUser)


export default router