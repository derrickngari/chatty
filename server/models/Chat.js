import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  }
},
{
    timestamps: true,
});

const ChatSchema = mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [MessageSchema],
  lastMessage: {
    text: String,
    timestamp: Date,
},
groupName: {
    type: String,
},
isGroup: {
    type: Boolean,
    default: false,
},
},
{
    timestamps: true,
});

export default mongoose.model("Chat", ChatSchema);