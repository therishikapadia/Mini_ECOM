const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
    validate: {
      validator: async function(value) {
        const user = await mongoose.model('User').findById(value);
        return user && user.role === 'customer'; // Validate that the user role is 'customer'
      },
      message: 'Assigned user must be a customer'
    }
  },
  assigned_to: {
    delivery_agent: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
      validate: {
        validator: async function(value) {
          const user = await mongoose.model('User').findById(value);
          return user && user.role === 'delivery agent'; // Validate that the role is 'delivery agent'
        },
        message: 'Assigned user must be a delivery agent'
      }
    }
  },
  order_details: {
    items: [
      {
        item_id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        }
      }
    ],
    delivery_address: {
      type: String,
      required: true
    },
    delivery_status: {
      type: String,
      required: true,
      enum: ['assigned', 'in-transit', 'delivered'],
      default: 'assigned'
    },
    estimated_delivery_time: {
      type: Date,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Model for the Order schema
const DeliveryDetails = mongoose.model('Order', orderSchema);

module.exports = DeliveryDetails;
