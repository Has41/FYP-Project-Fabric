import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());

//import rotuers
<<<<<<< HEAD

import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.route.js";
import productRouter from "./routes/product.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
=======
app.use("/api/v1/users", userRoutes);
>>>>>>> 8e462123f8762328add7d0f2a2121997ea299685

export { app };
