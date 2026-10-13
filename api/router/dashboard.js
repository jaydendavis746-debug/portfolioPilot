import { Router } from "express";
import dashboardController from "../controllers/dashboard.js";

const dashboardRouter = Router();

dashboardRouter.get("/", dashboardController.index);

export default dashboardRouter;