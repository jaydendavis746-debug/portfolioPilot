import { Router } from "express";
import categoryController from "../controllers/category.js";

const categoryRouter = Router();

categoryRouter.get("/", categoryController.index);

export default categoryRouter;