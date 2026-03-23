import express from "express";
import {home, search} from "../controllers/videoController.js";
import {join, login} from "../controllers/userController.js";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/join", join);
globalRouter.get("/login", login);
globalRouter.get("/search", search);

export default globalRouter;