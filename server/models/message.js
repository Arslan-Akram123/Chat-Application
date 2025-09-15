const {Schema, model} = require('mongoose');

const messageSchema = new Schema({
senderId: {
type: Schema.Types.ObjectId,
ref: 'User', 
required: true
},
receiversId: [{
type: Schema.Types.ObjectId,
ref: 'User',
required: true
}],
isGroupChat: {
type: Boolean,
default: false
},
isReaded: {
type: Boolean, 
default: false
},
text: {
type: String, 
required: true
}
}, {timestamps: true});

module.exports = model('Message', messageSchema);