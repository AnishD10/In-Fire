import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Subscriber } from './models/Subscriber.js';
import { sendAlertEmail } from './services/emailService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testAlertFlow() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB Atlas');

    // Check subscribers
    console.log('\nChecking subscribers in MongoDB...');
    const subscribers = await Subscriber.find({ isActive: true });
    console.log(`📧 Found ${subscribers.length} active subscribers:`);
    
    if (subscribers.length === 0) {
      console.log('⚠️ No subscribers found! Add some via the website first.');
      console.log('   Go to https://in-fire.netlify.app and subscribe');
    } else {
      subscribers.forEach(sub => {
        console.log(`  - ${sub.email} (subscribed: ${new Date(sub.subscribedAt).toLocaleDateString()})`);
      });

      // Test sending alert email to first subscriber
      console.log(`\nTesting alert email to ${subscribers[0].email}...`);
      await sendAlertEmail(
        subscribers[0].email,
        '⚠️ GAS LEAKAGE DETECTED! Current Value: 1500 (Threshold: 1200) - TEST ALERT'
      );
      console.log('✓ Alert email sent successfully!');
    }

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testAlertFlow();
