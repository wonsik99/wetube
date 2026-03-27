import express from "express";
import {watch, getEdit, postEdit, deleteVideo, getUpload, postUpload} from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.route("/upload").get(getUpload).post(postUpload);

videoRouter.get("/:id", watch);

videoRouter.route("/:id/edit").get(getEdit).post(postEdit);

videoRouter.route("/:id/delete").get(deleteVideo);

export default videoRouter;