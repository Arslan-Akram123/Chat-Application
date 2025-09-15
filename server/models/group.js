const { Schema, model } = require("mongoose");
const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    createrId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        nickName: { type: String, default: "" },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],
  },
  { timestamps: true }
);
const  Group = model("Group", groupSchema);
module.exports = Group;

