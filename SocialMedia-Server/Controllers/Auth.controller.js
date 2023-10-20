import UserModel from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res) => {
    // const {username, password, firstname, lastname} = req.body;
    const salt = await bcrypt.genSalt(10) //hashing (altering)
    const hashedPassword = await bcrypt.hash(req.body.password, salt) // hashed result
    req.body.password = hashedPassword
    const newUser = new UserModel(req.body)
    const { username } = req.body
    try {
        const oldUser = await UserModel.findOne({ username })
        if (oldUser) {
            res.status(400).json("Already registered")
        } else {
            const user = await newUser.save();
            const token = jwt.sign({
                username: user.username,
                id: user._id
            }, "MERN_KEY", { expiresIn: '1h' })
            res.status(201).json({user, token})
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username })
        if (user) {
            const isValid = await bcrypt.compare(password, user.password)
            // isValid ? res.status(200).json(user) : 
            if (!isValid) {
                res.status(400).json("Not Authenticated")
            } else {
                const token = jwt.sign({
                    username: user.username,
                    id: user._id
                }, "MERN_KEY", { expiresIn: '1h' })

                res.status(200).json({user, token}) 
            }
        } else {
            res.status(400).json("User does not Exists")
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
