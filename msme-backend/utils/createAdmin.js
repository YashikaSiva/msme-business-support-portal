// Usage: node utils/createAdmin.js "Admin Name" admin@example.com 9876543210 "StrongPassword"
// Creates an admin user, or promotes the user if the email already exists.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  const [name, email, phone, password] = process.argv.slice(2);
  if (!name || !email || !phone || !password) {
    console.error('Usage: node utils/createAdmin.js "<name>" <email> <10-digit phone> "<password>"');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = 'admin';
      existing.isActive = true;
      await existing.save();
      console.log(`Promoted existing user ${email} to admin.`);
    } else {
      await User.create({ name, email, phone, password, role: 'admin' });
      console.log(`Admin user ${email} created.`);
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
