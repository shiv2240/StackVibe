import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema for StackVibe Extension
 */
export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
    avatar: v.string(),
    securityQuestion: v.optional(v.string()),
    securityAnswerHash: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_email", ["email"]),

  // Scans history table
  scans: defineTable({
    userId: v.string(),
    url: v.string(),
    title: v.string(),
    techStack: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        category: v.string(),
        icon: v.string(),
        color: v.string(),
        description: v.string(),
      })
    ),
    designSpec: v.any(), // Flexible design spec JSON
    timestamp: v.string(),
  }).index("by_userId", ["userId"]),
});
