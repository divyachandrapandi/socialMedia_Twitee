import UserModel from "../Models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);

    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(400).json("No such user");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const getAllUser = async(req,res) => {
  try {
    let users = await UserModel.find();
    users = users.map((user) => {
      const {password, ...other} = user._doc;
      return other
    })
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus, password } = req.body;

  if (id === _id || currentUserAdminStatus == true) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      }); // response is updated

      const token = jwt.sign({
        username: user.username,
        id: user._id
      }, "MERN_KEY", { expiresIn: "1h" })
      res.status(200).json({user,token});
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else[res.status(400).json("forbidden")];
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus } = req.body;
  if (id === _id || currentUserAdminStatus == true) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User deleted  Successfully");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(403).json("forbidden for deleting not a admin/current user");
  }
};

export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("forbidden for self-following");
  } else {
    try {
      const followUser = await UserModel.findById(id).then((user) => {
        return user;
      });
      const followingUser = await UserModel.findById(_id).then(
        (user) => {
          return user;
        }
      );
      // console.log(followUser);
      if (!followUser.followers?.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("User followed  Successfully");
      } else {
        res.status(200).json("Already following");
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};


export const unFollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (_id === id) {
    res.status(403).json("forbidden for self-following");
  } else {
    try {
      const followUser = await UserModel.findById(id).then((user) => {
        return user;
      });
      const followingUser = await UserModel.findById(_id).then(
        (user) => {
          return user;
        }
      );
      // console.log(followUser);
      if (followUser.followers?.includes(_id)) {
        await followUser.updateOne({ $pull: { followers: _id } });
        await followingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("User unfollowed  Successfully");
      } else {
        res.status(200).json("User is not followed by you");
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
