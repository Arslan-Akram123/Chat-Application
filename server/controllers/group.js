const Group = require("../models/group");
const ChatList = require("../models/chatlist");
const User = require("../models/user");

async function createGroup(req, res) {
  try {
    const { groupName, members } = req.body; 
    const createrId = req.user.id;

    if (!groupName || !Array.isArray(members) || members.length < 2) {
      return res
        .status(400)
        .json({ type: "error", message: "Group name and at least 2 members are required" });
    }

    const validMembers = [];
    for (let m of members) {
      const user = await User.findOne({ email: m.email });
      const checkcreater=m.email===req.user.email;
      if(checkcreater){
        return res
        .status(400)
        .json({ type: "error", message: "You can't add yourself as a member" });
      }
      if (!user) {
        return res
          .status(404)
          .json({ type: "error", message: `User not found: ${m.email}` });
      }
      validMembers.push({
        userId: user._id,
        nickName:user.username,
        role: "member",
      });
    }
   const creater = await User.findById(createrId);
    validMembers.push({
      userId: createrId,
      nickName:creater.username||'Admin',
      role: "admin",
    });

    const group = await Group.create({
      name: groupName,
      createrId,
      members: validMembers,
    });
    await group.save();
    for (let member of validMembers) {
      let chatList = await ChatList.findOne({ createrId: member.userId });

      if (!chatList) {
        chatList = await ChatList.create({
          createrId: member.userId,
          companions: [],
          groups: [],
        });
      }

      chatList.groups.push({
        groupId: group._id,
        groupName: group.name,
        role: member.role,
      });

      await chatList.save();
    }

    return res.status(201).json({
      type: "success",
      message: "Group created successfully",
      group,
    });
  } catch (err) {
    return res.status(500).json({
      type: "error",
      message: err.message || "Internal server error",
    });
  }
}
module.exports = { createGroup };