import pg from "pg"

const userSchema = new pg.Schema({
    
    email: {
        type: String,
        required: true
    },
    passowrd: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
},{ timestamps: true});

const User = pg.model("User" , userSchema);