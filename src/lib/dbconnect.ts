import mongoose from "mongoose";

type connectionObj = {
  isConnected?: boolean;
};

const connection: connectionObj = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "");
    connection.isConnected = db.connections[0].readyState === 1;
    console.log(connection.isConnected);
  } catch (error) {
    console.log("Unable to connect to database", error);
    process.exit(1);
  }
}
export default dbConnect;
