const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['CUSTOMER', 'DELIVERY_AGENT', 'ADMIN'], // Allowed roles
      default: 'CUSTOMER',
    },
    delivery_address: {
      type: String,
      default:"OM",
      required: function () {
        return this.role === 'CUSTOMER'; // Delivery address is required only if the role is CUSTOMER
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false, // Default value set to false
    },
    isDeleted: {
      type: Boolean,
      default: false, // Default value set to false
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;