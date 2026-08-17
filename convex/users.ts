import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Register a new user in Convex database
 */
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists.");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: btoa(args.password), // Base64 encoding for simple hashing simulation
      role: args.role || "Developer / Designer",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(args.email)}`,
      createdAt: new Date().toISOString(),
    });

    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Login existing user
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Account not found. Please create an account.");
    }

    if (user.passwordHash !== btoa(args.password)) {
      throw new Error("Invalid password provided.");
    }

    return user;
  },
});

/**
 * Get user by email
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});
