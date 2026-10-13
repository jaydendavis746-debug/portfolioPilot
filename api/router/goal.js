import { Router } from "express";
import goalController from "../controllers/goal.js";

const goalRouter = Router();

goalRouter.get("/", goalController.index);
goalRouter.get("/:id", goalController.show);

export default goalRouter;