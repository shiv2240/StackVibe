import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * StackVibe - Convex Scan History Functions
 * Stores and manages user scan progress history in Convex Cloud DB.
 * 
 * @module convex/scans
 */
export const saveScan = mutation({
  args: {
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
    designSpec: v.any(),
  },
  handler: async (ctx, args) => {
    const scanId = await ctx.db.insert("scans", {
      userId: args.userId,
      url: args.url,
      title: args.title,
      techStack: args.techStack,
      designSpec: args.designSpec,
      timestamp: new Date().toISOString(),
    });

    return await ctx.db.get(scanId);
  },
});

/**
 * Get scan progress history for a user
 */
export const getScansByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scans")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

/**
 * Delete a specific scan record
 */
export const deleteScan = mutation({
  args: { scanId: v.id("scans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.scanId);
    return true;
  },
});

/**
 * Clear all scans for a user
 */
export const clearAllScans = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("scans")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const scan of scans) {
      await ctx.db.delete(scan._id);
    }
    return true;
  },
});
