import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id/views", registerView);
apiRouter.post("/videos/:id/comment", createComment);
apiRouter.delete("/comments/:id", deleteComment);
apiRouter.post("/comments/:id/like", likeComment);
apiRouter.delete("/comments/:id/like", unlikeComment);

export default apiRouter;
