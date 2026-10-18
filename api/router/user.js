import { Router } from "express";
import userController from "../controllers/user.js";

const userRouter = Router();
userRouter.get("/", userController.index);
userRouter.get("/:id", userController.show);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);

export default userRouter;
