import express from "express";
import {home, search} from "../controllers/videoController.js";
import {getJoin, postJoin, getLogin, postLogin} from "../controllers/userController.js";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;