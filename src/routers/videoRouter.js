import express from "express";
import {upload, watch, getEdit, postEdit, deleteVideo} from "../controllers/videoController.js";

const videoRouter = express.Router();

videoRouter.get("/:id", watch);

videoRouter.route("/:id/edit").get(getEdit).post(postEdit);

videoRouter.get("/:id/delete", deleteVideo);
videoRouter.get("/upload", upload);

export default videoRouter;