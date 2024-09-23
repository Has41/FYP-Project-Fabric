import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())

//import rotuers

import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)


export { app };
