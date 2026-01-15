import mongoose from 'mongoose';

// ==========================================
// Subscriber Schema
// ==========================================
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// ==========================================
// Subscriber Model
// ==========================================
export const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;
