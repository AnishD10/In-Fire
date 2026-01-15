import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ==========================================
// File Path Setup
// ==========================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const subscribersFile = path.join(__dirname, '../data/subscribers.json');

// ==========================================
// Initialize Subscribers File
// ==========================================
function initializeSubscribersFile() {
  if (!fs.existsSync(subscribersFile)) {
    fs.writeFileSync(subscribersFile, JSON.stringify([], null, 2));
  }
}

// ==========================================
// Load Subscribers
// ==========================================
export function getSubscribers() {
  try {
    initializeSubscribersFile();
    const data = fs.readFileSync(subscribersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading subscribers:', error);
    return [];
  }
}

// ==========================================
// Add Subscriber
// ==========================================
export function addSubscriber(email) {
  try {
    const subscribers = getSubscribers();
    
    // Check if already subscribed
    if (subscribers.some(sub => sub.email === email)) {
      return {
        success: false,
        error: 'Email already subscribed'
      };
    }

    // Add new subscriber
    subscribers.push({
      email,
      subscribedAt: new Date().toISOString()
    });

    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
    console.log(`✓ Added subscriber: ${email}`);

    return {
      success: true,
      message: 'Subscriber added successfully'
    };
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// Remove Subscriber
// ==========================================
export function removeSubscriber(email) {
  try {
    let subscribers = getSubscribers();
    const initialLength = subscribers.length;

    subscribers = subscribers.filter(sub => sub.email !== email);

    if (subscribers.length === initialLength) {
      return {
        success: false,
        error: 'Email not found in subscribers'
      };
    }

    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
    console.log(`✓ Removed subscriber: ${email}`);

    return {
      success: true,
      message: 'Subscriber removed successfully'
    };
  } catch (error) {
    console.error('Error removing subscriber:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default { getSubscribers, addSubscriber, removeSubscriber };
