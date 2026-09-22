require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "admin@bihealthcare.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = await User.create({
      fullName: "BI Administrator",
      email: "admin@bihealthcare.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "",
      specialization: "",
      isActive: true,
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Create Admin Error:", error.message);
    process.exit(1);
  }
};

createAdmin();