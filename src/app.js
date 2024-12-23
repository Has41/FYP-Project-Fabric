import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

//import rotuers


import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import pattrenRouter from  "./routes/pattren.routes.js"
import defaultPattrenRouter from  "./routes/defaultPattren.routes.js"
import colorRouter from "./routes/color.routes.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/pattrens", pattrenRouter)
app.use("/api/v1/defaupattrens", defaultPattrenRouter)
app.use("/api/v1/colors", colorRouter)



export { app };
