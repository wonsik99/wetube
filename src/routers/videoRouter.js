import express from "express";
import {watch, getEdit, postEdit, deleteVideo, getUpload, postUpload} from "../controllers/videoController.js";
import {protectorMiddleware} from "../middlewares.js";

const videoRouter = express.Router();

videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(postUpload);
videoRouter.get("/:id", watch);
videoRouter.route("/:id/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/:id/delete").all(protectorMiddleware).get(deleteVideo);

export default videoRouter;