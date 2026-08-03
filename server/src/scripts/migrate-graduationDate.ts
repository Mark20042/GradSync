/**
 * Migration Script: Rename graduationYear → graduationDate
 * 
 * This script migrates existing user documents in MongoDB from the old
 * `graduationYear` field (Number) to the new `graduationDate` field (String).
 * 
 * Run with: node migrate-graduationDate.js
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import dns from "node:dns";

dotenv.config();

// Use public DNS to resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

async function migrate() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    const db = conn.connection.db;
    const usersCollection = db.collection("users");

    // Step 1: Find all users that have the old graduationYear field
    const usersWithOldField = await usersCollection.countDocuments({
      graduationYear: { $exists: true },
    });

    console.log(`📋 Found ${usersWithOldField} users with 'graduationYear' field.`);

    if (usersWithOldField === 0) {
      console.log("✅ No migration needed. All users are up to date.");
      await mongoose.disconnect();
      return;
    }

    // Step 2: Migrate - copy graduationYear value to graduationDate as a string,
    // then remove the old field
    const result = await usersCollection.updateMany(
      { graduationYear: { $exists: true } },
      [
        {
          $set: {
            graduationDate: {
              $cond: {
                if: { $ne: ["$graduationYear", null] },
                then: { $toString: "$graduationYear" },
                else: "",
              },
            },
          },
        },
        {
          $unset: "graduationYear",
        },
      ]
    );

    console.log(`✅ Migration complete!`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);

    // Step 3: Also rename graduationMonth if it exists (clean up)
    const monthResult = await usersCollection.updateMany(
      { graduationMonth: { $exists: true } },
      { $unset: { graduationMonth: "" } }
    );

    if (monthResult.modifiedCount > 0) {
      console.log(`🧹 Cleaned up 'graduationMonth' from ${monthResult.modifiedCount} users.`);
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
