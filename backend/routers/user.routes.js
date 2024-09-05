import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { followUnfollowUser, getSuggestedUsers, getUserProfile, getUsers, InsertUser, searchUser, updateUser } from '../controllers/user.controller.js'

const router = express.Router()


router.get("/profile/:username", protectRoute, getUserProfile)
router.get("/suggested" ,protectRoute , getSuggestedUsers )
router.get("/insert" , InsertUser)
router.get("/search" ,protectRoute , searchUser )
router.post("/users", protectRoute, getUsers)
router.post("/follow/:id", protectRoute , followUnfollowUser )
router.post("/update" , protectRoute ,updateUser )

export default router