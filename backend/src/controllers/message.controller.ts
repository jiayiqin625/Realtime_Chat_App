import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../model/message.model.js";
import User from "../model/user.model.js";
import type { RequestHandler } from "express";
import { Types } from "mongoose";

export const getUsersForSidebar: RequestHandler = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in getUsersForSidebar", errorMessage);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversationsForSidebar: RequestHandler = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInUserId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      {
        $sort: {
          lastMessageAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $replaceRoot: {
          newRoot: { $first: "$user" },
        },
      },
      {
        $project: { clerkId: 0 },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    console.error("Error in getConversationsForSidebar", errorMessage);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages: RequestHandler = async (req, res) => {
  try {
    const { id: userToChat } = req.params;
    const myId = req.user._id;

    if (!userToChat || typeof userToChat !== "string") {
      res.status(400).json({ message: "Invalid or missing userId" });
      return;
    }

    const userToChatId = new Types.ObjectId(userToChat);
    const myUserId = new Types.ObjectId(myId);

    const messages = await Message.find({
      $or: [
        { senderId: myUserId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    console.error("Error in getMessages", errorMessage);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res
          .status(500)
          .json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);

      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else {
        imageUrl = url;
      }
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
    return;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    console.error("Error in sendMessage", errorMessage);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
