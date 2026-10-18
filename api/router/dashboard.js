import { Router } from "express";
import dashboardController from "../controllers/dashboard.js";
import authenticator from "../middleware/authenticator.js";

const dashboardRouter = Router();

dashboardRouter.get("/", authenticator, dashboardController.index);

export default dashboardRouter;