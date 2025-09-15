const {Schema, model} = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    profileImageURL: {
        type: String,
        default: 'image.png', 
   },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
    
}, {timestamps: true});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
   try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
   } catch (err) {
    throw new Error(err);
   }
}
const User = model('User', userSchema);
module.exports = User;