import { Router } from "express";
import transactionController from "../controllers/transaction.js";
import authenticator from "../middleware/authenticator.js";

const transactionRouter = Router();

transactionRouter.get("/", authenticator,transactionController.index);
transactionRouter.get("/:id", authenticator, transactionController.show);

export default transactionRouter;