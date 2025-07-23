import mongoose  from "mongoose";

const dbConfig = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(
          `Database connected successfully at ${conn.connection.host}`
        );
    } catch (error) {
        console.log("Database connection failed: ", error.message);
    }
}

export default dbConfig;