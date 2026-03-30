import express from "express";
import morgan from "morgan";
import session from "express-session";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";

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

// Session middleware
app.use(
  session({
    secret: "Hello",
    resave: true,
    saveUninitialized: true,
  }),
);


app.use(localsMiddleware);

// Router middleware
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;
