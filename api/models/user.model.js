import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
   username:{
    type: String,
    required: true,
    unique: true,
   },
   email:{
    type: String,
    required: true,
    unique: true,
   },
   password:{
    type: String,
    required: true,
   }, 
   dateOfBirth: {
    type: Date,
    required: true
   },
   verified:{
       type: Boolean,
       default: false
      },
   
   profilePicture:{
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
   },
   isAdmin:{
      type: Boolean,
      default: false,
     },
     isPublisher: {
      type: Boolean,
      default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banExpiresAt: {
    type: Date,
    default: null
  },
  banReason: {
    type: String,
    default: null
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Push notification fields
  pushSubscription: {
    type: String,
    default: null
  },
  pushNotificationsEnabled: {
    type: Boolean,
    default: false
  },
    
}, {timestamps: true}
);


const User = mongoose.model('User', userSchema);

export default User;