const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SALT_ROUNDS } = require("../constants/constants");

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res
      .status(201)
      .json({ message: `User ${username} registration successful` });
  } catch (error) {
    res.status(500).json({
      message: `User Registration Controller Error : ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(404).json({ message: `${username} User not found` });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({
      message: `User Login Controller Error : ${error.message}`,
    });
  }
};

module.exports = {
  register,
  login,
};
