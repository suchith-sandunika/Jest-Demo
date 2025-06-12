import express from "express";
import userRoute from "./src/routes/userRoute";

const app = express();

app.use(express.json());

app.use("/api/v1/users", userRoute);

export default app;