const mongoose = require('mongoose');
const { Schema } = mongoose;

const deliverySchema = new Schema({
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
    pickup_address: {
      type: String,
      required: true,
      coordinates: {
        type: [Number],  // [longitude, latitude]
        index: '2dsphere'
      }
    },
    delivery_address: {
      type: String,
      required: true,
      coordinates: {
        type: [Number],  // [longitude, latitude]
        index: '2dsphere'
      }
    },
    delivery_status: {
      type: String,
      required: true,
      enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'failed'],
      default: 'pending'
    },
    estimated_delivery_time: {
      type: Date,
      required: true
    }
  },
  current_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      index: '2dsphere'
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  route: {
    path: [[Number]],  // Array of [longitude, latitude] pairs
    distance: Number,  // Total distance in meters
    duration: Number   // Estimated duration in seconds
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Model for the Order schema
const DeliveryDetails = mongoose.model('Delivery', deliverySchema);

module.exports = DeliveryDetails;