import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import status from "express-status-monitor";
import bodyParser from "body-parser";



const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.json({ limit: "50kb" }));




export { app };