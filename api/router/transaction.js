import { Router } from "express";
import transactionController from "../controllers/transaction.js";

const transactionRouter = Router();

transactionRouter.get("/", transactionController.index);
transactionRouter.get("/:id", transactionController.show);

export default transactionRouter;