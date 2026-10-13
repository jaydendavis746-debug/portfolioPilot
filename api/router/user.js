
import { Router } from "express";
import userController from "../controllers/user.js";

const userRouter = Router();

userRouter.get("/me", userController.me);

export default userRouter;