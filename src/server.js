import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

const app = express();

const logger = morgan("dev");

// View engine "pug" setup
app.set("view engine", "pug");
// set the views directory
app.set("views", process.cwd() + "/src/views");

// Logger middleware
app.use(logger);

// Body parser middleware
// This is a middleware that parses the body of the request and makes it available in req.body
app.use(express.urlencoded({ extended: true }));

// Router middleware
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);


export default app;