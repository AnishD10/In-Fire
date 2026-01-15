import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://np05cp4a240274:iTA9zH5OM0dHx2wX@lmsdb.bzvj8mf.mongodb.net/in-fire?retryWrites=true&w=majority';

// ==========================================
// MongoDB Connection
// ==========================================
export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

export default mongoose;
