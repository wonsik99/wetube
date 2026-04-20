import express from "express";
import {
  watch,
  getEdit,
  postEdit,
  deleteVideo,
  getUpload,
  postUpload,
} from "../controllers/videoController.js";
import { protectorMiddleware, videoUpload } from "../middlewares.js";

const videoRouter = express.Router();

videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    postUpload,
  );
videoRouter.get("/:id", watch);
videoRouter
  .route("/:id/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter.route("/:id/delete").all(protectorMiddleware).get(deleteVideo);

export default videoRouter;
