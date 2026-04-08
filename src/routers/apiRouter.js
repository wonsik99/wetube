import express from "express";
import { registerView } from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/views", registerView);

export default apiRouter;
