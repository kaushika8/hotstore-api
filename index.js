import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import admin from "firebase-admin";
import { readFileSync } from "fs";
const serviceAccount = JSON.parse(
  readFileSync("./hotstore-d100c-firebase-adminsdk-rc5ff-c900ad4ba1.json")
);
dotenv.config();
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

mongoose
  .connect(process.env.MONGO, { dbName: "hotStore" })
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;
const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use(express.json());

app.use(cookieParser());

initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "hotstore-d100c",
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.post("/api/send", function (req, res) {
  const { fcmToken, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: fcmToken,
  };

  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: fcmToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
