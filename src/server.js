import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import { localsMiddleware } from "./middlewares.js";
import apiRouter from "./routers/apiRouter.js";

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
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    // },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    })
  }),
);

app.use(localsMiddleware);

// Static file middleware
app.use("/assets", express.static("assets"));
app.use("/uploads", express.static("uploads"));

// Router middleware
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
