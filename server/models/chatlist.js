const { Schema, model } = require('mongoose');

const chatListSchema = new Schema(
  {
    createrId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companions: [
      {
        companionMail: { type: String, required: true },
        nickName: { type: String, default: '' },
      },
    ],
    groups: [
      {
        groupId: { type: Schema.Types.ObjectId, ref: "Group" },
        groupName: { type: String, required: true },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],
  },
  { timestamps: true }
);

const ChatList = model('ChatList', chatListSchema); 
module.exports = ChatList;
