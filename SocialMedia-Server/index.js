import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import AuthRoute from "./Routes/Auth.route.js";
import UserRoute from "./Routes/User.route.js";
import PostRoute from "./Routes/Post.route.js";
import UploadRoute from "./Routes/UploadRoute.js"
import cors from "cors"

// Routes
const app = express();

// to serve images for public
app.use(express.static('public'))
app.use('/images',express.static('images') )

dotenv.config()

// Middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors())

mongoose.connect(process.env.MONGO_DB,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => app.listen(process.env.PORT, () => {
        console.log("Listening at Port " + process.env.PORT);
    })).catch((error) => {
        console.log("Error ---- " + error);
    })

    // usage of routes
app.use('/Auth', AuthRoute)
app.use('/User', UserRoute)
app.use('/Post', PostRoute)
app.use('/Upload', UploadRoute)