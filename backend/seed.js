const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({ username: 'admin', password: 'password123' });
      await admin.save();
      console.log('Admin user created: admin / password123');
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};
seed();
