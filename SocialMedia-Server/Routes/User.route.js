import Express from "express";
import { deleteUser, followUser, getUser, unFollowUser, updateUser, getAllUser } from "../Controllers/Users.controller.js";
import authMiddleWare from "../Middleware/authMiddleWare.js";
const router = Express.Router();

router.get('/', getAllUser)
router.get('/:id', getUser)
router.put('/:id', authMiddleWare, updateUser)
router.delete("/:id", authMiddleWare, deleteUser)
router.put("/:id/follow", authMiddleWare, followUser)
router.put("/:id/unfollow", authMiddleWare, unFollowUser)

export default router