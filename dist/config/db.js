import mongoose from "mongoose";
const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    }
    catch (err) {
        console.error(`❌ Error in MongoDB connection:`, err);
        process.exit(1);
    }
};
export default connectDb;
