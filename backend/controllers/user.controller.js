import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"
import {faker} from "@faker-js/faker"

export const getUserProfile = async (req, res) => {
  const {username} = req.params
  try {
    const user = await User.findOne({username}).select("-password")
    if(!user){
      return res.status(404).json({error: "User not found"})
    }
    res.status(200).json(user)
  } catch (error) {
    console.log("Error in getUserProfile ", error.message)
    res.status(500).json({error: "Internal server error"})
  }
}

export const getUsers = async (req, res) => {
  const { ids } = req.body;
  try {
    const users = await User.find({ _id: { $in: ids } }).select("-password");
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "Users not found" });
    }
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsers ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const followUnfollowUser = async (req, res) => {
  try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
}

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {$sample: {size: 10}},
    ])

    const filteredUsers = users.filter((user) => {
      return !userFollowedByMe.following.includes(user._id);
    })

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => {
      user.password = null;
    })

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
  }
}

export const updateUser = async (req, res) => {
  const {fullName , email, username, currentPassword , newPassword ,bio ,link} = req.body
  let {profileImg , coverImg} = req.body

  const userId = req.user._id
  try {
    let user = await User.findById(userId)
    if(!user){
      return res.status(404).json({error: "User not found"})
    }

    if((currentPassword && !newPassword) || (!currentPassword && newPassword)){
      return res.status(400).json({error: "Please provide both current and new password"})
    }
    if(currentPassword && newPassword){
      const isMatch = await bcrypt.compare(currentPassword , user.password)
      if(!isMatch) return res.status(400).json({error: "Incorrect current password"})
      if(newPassword.length < 6) return res.status(400).json({error: "Password must be at least 6 characters long"})

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword , salt)
    }

    if(profileImg){
      if(user.profileImg){
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg)
      profileImg = uploadedResponse.secure_url
    }

    if(coverImg){
      if(user.coverImg){
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg)
      coverImg = uploadedResponse.secure_url
    }

    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.username = username || user.username
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg

    await user.save()
    user.password = null
    return res.status(200).json(user)
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
}

export const searchUser = async (req, res) => {
  try {
    const {username , fullName} = req.query
    const searchCriteria = {};
    if (username) {
      searchCriteria.username = { $regex: username, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    }
    if (fullName) {
      searchCriteria.fullName = { $regex: fullName, $options: 'i' };
    }
    const users = await User.find(searchCriteria).select('-password');
    res.status(200).json(users)
  } catch (error) {
    console.log("Error in searchUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
}

export const InsertUser = async (req, res) => {
  const num = 10
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      username: faker.internet.userName(),
      fullName: faker.person.fullName(),
      password: "123456",
      email: faker.internet.email(),
      profileImg: faker.image.url(),
      coverImg: faker.image.urlLoremFlickr({ width: 200, height: 200 }),
      bio: faker.person.bio(),
      link: faker.internet.url(),
      followers: [],
      following: [],
      likedPosts: []
    });
  }
  try {
    await User.insertMany(users);
    res.status(201).json({ message: 'Fake users created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating fake users', details: err });
  }
}