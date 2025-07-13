import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your front-end URL
    credentials: true,              // Allow cookies if needed
  }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json());


//import rotuers

import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import patternRouter from "./routes/pattern.routes.js";
import defaultPatternRouter from "./routes/defaultPattern.routes.js";
import colorRouter from "./routes/color.routes.js";
import modelRouter from "./routes/model.routes.js";
import orderRouter from "./routes/order.routes.js";
import designRouter from "./routes/design.routes.js";
import adminDashboardRouter from "./routes/adminDashboard.routes.js";
import designerDashboardRouter from "./routes/designerDasboard.routes.js";
import reviewRouter from "./routes/review.routes.js";
import textRouter from "./routes/text.routes.js";
import graphicRouter from "./routes/graphic.routes.js";



app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/patterns", patternRouter);
app.use("/api/v1/defaultpatterns", defaultPatternRouter);
app.use("/api/v1/colors", colorRouter);
app.use("/api/v1/models", modelRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/dashboard", adminDashboardRouter);
app.use("/api/v1/designs", designRouter);
app.use("/api/v1/designers", designerDashboardRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/texts", textRouter);
app.use("/api/v1/graphics", graphicRouter);



app.use(errorHandler);
export { app };
