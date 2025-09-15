const chatListSchema = require('../models/chatlist');
const userSchema = require('../models/user');
async function getChatList(req, res) {
  try {
    const userId = req.user.id;
    const chatList = await chatListSchema.findOne({ createrId: userId })
    //   .populate("groups.groupId", "name members");

    return res.status(200).json({
      type: "success",
      message: "Chat list fetched",
      chatList: chatList || { companions: [], groups: [] },
    });
  } catch (err) {
    return res.status(500).json({
      type: "error",
      message: err.message || "Internal server error",
    });
  }
}


async function addCompanion(req, res) {
  try {
    const { companionMail, nickName } = req.body;
    const createrId = req.user.id;

    // Check if user exists
    const findUser = await userSchema.findOne({ email: companionMail });
    if (!findUser) {
      return res
        .status(404)
        .json({ type: "error", message: "No user found with this email" });
    }
    const checkSelf = companionMail === req.user.email;
    if (checkSelf) {
      return res
        .status(400)
        .json({ type: "error", message: "You can't add yourself as a companion" });
    }

    // Find chatList of this user
    let chatList = await chatListSchema.findOne({ createrId });

    if (!chatList) {
      // Create a new document for this creator
      chatList = await chatListSchema.create({
        createrId,
        companions: [{ companionMail, nickName }],
      });
    } else {
      // Check if companion already exists
      const alreadyExists = chatList.companions.some(
        (comp) => comp.companionMail === companionMail
      );

      if (alreadyExists) {
        return res.status(400).json({
          type: "error",
          message: "Companion already exists in chat list",
        });
      }

      // Add new companion
      chatList.companions.push({ companionMail, nickName });
      await chatList.save();
    }

    return res.status(200).json({
      type: "success",
      message: "Companion added to chat list",
      chatList,
    });
  } catch (err) {
    return res.status(500).json({
      type: "error",
      message: err.message || "Internal server error",
    });
  }
}


module.exports={
    getChatList,
    addCompanion
}