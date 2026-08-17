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
    securityQuestion: v.optional(v.string()),
    securityAnswer: v.optional(v.string()),
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

    const answerHash = args.securityAnswer
      ? btoa(args.securityAnswer.toLowerCase().trim())
      : undefined;

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: btoa(args.password), // Base64 encoding for simple hashing simulation
      role: args.role || "Developer / Designer",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(args.email)}`,
      securityQuestion: args.securityQuestion,
      securityAnswerHash: answerHash,
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
 * Get user security question for password recovery
 */
export const getSecurityQuestion = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    if (!user.securityQuestion) {
      throw new Error("No security question set for this account.");
    }

    return { securityQuestion: user.securityQuestion };
  },
});

/**
 * Reset password via security answer verification
 */
export const resetPassword = mutation({
  args: {
    email: v.string(),
    securityAnswer: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    if (!user.securityAnswerHash) {
      throw new Error("No security question answer set on this account.");
    }

    const inputAnswerHash = btoa(args.securityAnswer.toLowerCase().trim());
    if (inputAnswerHash !== user.securityAnswerHash) {
      throw new Error("Incorrect security answer provided.");
    }

    await ctx.db.patch(user._id, {
      passwordHash: btoa(args.newPassword),
    });

    return { success: true };
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
