import path from "path"
import express from 'express'
import dotenv from 'dotenv'
import {v2 as cloudinary} from 'cloudinary'
import authRoutes from './routers/auth.routes.js'
import userRoutes from './routers/user.routes.js'
import postRoutes from './routers/post.routes.js'
import notificationRoutes from './routers/notification.routes.js'
import connectMongoDb from './db/connetMongoDb.js'
import cookieParser from 'cookie-parser'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()

app.use(express.json({limit: '5mb'}))
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "/frontend/dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectMongoDb()
})