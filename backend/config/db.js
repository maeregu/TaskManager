const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI_STANDARD || process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MongoDB connection string is missing. Set MONGO_URI or MONGO_URI_STANDARD in backend/.env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
    if (error.code === "EREFUSED" && error.syscall === "querySrv") {
      console.error(
        "DNS refused the MongoDB SRV lookup. If you are using Atlas, switch to the standard mongodb:// connection string in MONGO_URI_STANDARD or fix local DNS/network access."
      );
    }
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
