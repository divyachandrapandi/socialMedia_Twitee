import PostModel from "../Models/post.model.js";
import UserModel from "../Models/user.model.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
    const newPost = new PostModel(req.body);
    try {
        await newPost.save()
        res.status(200).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await PostModel.findById(id)
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(postId)
        if (post.userId == userId) {
            let updatedPost = await PostModel.updateOne({ _id: postId }, { $set: { ...req.body } })
            res.status(200).json(updatedPost);
        } else {
            res.status(403).json("Action forbidden");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(id);
        if (post.userId === userId) {
            await PostModel.deleteOne();
            res.status(204).json("P{ost Deleted succesfully");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const likePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    try {
        const post = await PostModel.findById(id).then((post) => {
            return post
        });
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("post liked");
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("post unliked");
        }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getTimeline = async (req, res) => {
    const userId = req.params.id;
    try {
        const currentUserPosts = await PostModel.find({ userId }).then((post) => {
            return post
        })
        //aggregate - array of steps
        const followingPosts = await UserModel.aggregate([
            //step 1 to match the user id 
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            //step2 to perform left outer join checking any userid form following array and get the posts for that user id
            {
                $lookup: {
                    from: "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingPosts"

                }
            },
            //step 3 to show "1" to skip:"0" for response
            {
                $project: {
                    followingPosts: 1,
                    _id: 0
                }
            }

        ])
        res.status(200).json(currentUserPosts.concat(followingPosts[0].followingPosts)
            .sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}