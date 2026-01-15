import { Subscriber } from '../models/Subscriber.js';

// ==========================================
// Load Subscribers from MongoDB
// ==========================================
export async function getSubscribers() {
  try {
    const subscribers = await Subscriber.find({ isActive: true }, 'email subscribedAt');
    console.log(`📧 Retrieved ${subscribers.length} active subscribers from MongoDB`);
    return subscribers;
  } catch (error) {
    console.error('Error reading subscribers from MongoDB:', error);
    return [];
  }
}

// ==========================================
// Add Subscriber to MongoDB
// ==========================================
export async function addSubscriber(email) {
  try {
    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return {
          success: false,
          error: 'Email already subscribed'
        };
      } else {
        // Reactivate if previously unsubscribed
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        console.log(`✓ Reactivated subscriber: ${email}`);
        return {
          success: true,
          message: 'Subscriber reactivated successfully'
        };
      }
    }

    // Add new subscriber
    const newSubscriber = new Subscriber({ email: email.toLowerCase() });
    await newSubscriber.save();
    console.log(`✓ Added subscriber to MongoDB: ${email}`);

    return {
      success: true,
      message: 'Subscriber added successfully'
    };
  } catch (error) {
    console.error('Error adding subscriber to MongoDB:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// Remove Subscriber from MongoDB
// ==========================================
export async function removeSubscriber(email) {
  try {
    const result = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return {
        success: false,
        error: 'Email not found in subscribers'
      };
    }

    console.log(`✓ Unsubscribed: ${email}`);

    return {
      success: true,
      message: 'Subscriber removed successfully'
    };
  } catch (error) {
    console.error('Error removing subscriber from MongoDB:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default { getSubscribers, addSubscriber, removeSubscriber };
