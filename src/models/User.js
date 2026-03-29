import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    location: {type: String}
});

// Hash the password before saving the user
userSchema.pre("save", async function () {
    // console.log("password:", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    // console.log("hashed password:", this.password);
});

const userModel = mongoose.model("User", userSchema);

export default userModel;