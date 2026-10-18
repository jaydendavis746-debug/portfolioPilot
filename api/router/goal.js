import { Router } from "express";
import goalController from "../controllers/goal.js";
import authenticator from "../middleware/authenticator.js";

const goalRouter = Router();

goalRouter.get("/", authenticator, goalController.index);
goalRouter.get("/:id", authenticator, goalController.show);

export default goalRouter;