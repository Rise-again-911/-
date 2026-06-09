// ============================================
// 「100种不可思议旅行」种子数据验证脚本
// 用途：验证 prisma/seed.ts 执行后数据库完整性
// 运行：npx tsx scripts/check-seed.ts
// ============================================

import { PrismaClient, UserRole, TripStatus, TagType } from "@prisma/client";

const prisma = new PrismaClient();

let errors: string[] = [];

function fail(msg: string) {
  errors.push(`❌ ${msg}`);
}

async function main() {
  console.log("🔍 检查种子数据完整性...\n");

  // ============================================
  // 用户数据
  // ============================================
  const userCount = await prisma.user.count();
  if (userCount < 3) fail(`User 总数应 >= 3，当前: ${userCount}`);

  const adminUser = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!adminUser) fail("缺少 username='admin' 的管理员用户");
  else if (adminUser.role !== "ADMIN") fail("admin 用户 role 应为 ADMIN");

  const normalUsers = await prisma.user.count({ where: { role: "USER" } });
  if (normalUsers < 2) fail(`普通 USER 用户应 >= 2，当前: ${normalUsers}`);

  // ============================================
  // 标签数据
  // ============================================
  const tagCount = await prisma.tag.count();
  if (tagCount < 19) fail(`Tag 总数应 >= 19，当前: ${tagCount}`);

  const themeCount = await prisma.tag.count({ where: { type: "THEME" } });
  if (themeCount < 5) fail(`THEME 标签应 >= 5，当前: ${themeCount}`);

  const moodCount = await prisma.tag.count({ where: { type: "MOOD" } });
  if (moodCount < 10) fail(`MOOD 标签应 >= 10，当前: ${moodCount}`);

  const levelCount = await prisma.tag.count({ where: { type: "LEVEL" } });
  if (levelCount < 4) fail(`LEVEL 标签应 >= 4，当前: ${levelCount}`);

  // ============================================
  // Trip 数据
  // ============================================
  const tripCount = await prisma.trip.count();
  if (tripCount < 11) fail(`Trip 总数应 >= 11，当前: ${tripCount}`);

  const officialTrips = await prisma.trip.findMany({ where: { isOfficial: true } });
  if (officialTrips.length < 9) fail(`官方 Trip 应 >= 9，当前: ${officialTrips.length}`);

  for (const trip of officialTrips) {
    if (trip.status !== "APPROVED") fail(`官方 Trip "${trip.title}" status 应为 APPROVED，当前: ${trip.status}`);
    if (!trip.title) fail(`官方 Trip ${trip.id} title 为空`);
    if (!trip.summary) fail(`官方 Trip "${trip.title}" summary 为空`);
    if (!trip.story) fail(`官方 Trip "${trip.title}" story 为空`);
    if (!trip.theme) fail(`官方 Trip "${trip.title}" theme 为空`);
    if (!trip.location) fail(`官方 Trip "${trip.title}" location 为空`);
    if (!trip.bestTime) fail(`官方 Trip "${trip.title}" bestTime 为空`);
    if (!trip.difficulty) fail(`官方 Trip "${trip.title}" difficulty 为空`);
    if (!trip.budget) fail(`官方 Trip "${trip.title}" budget 为空`);
    if (!trip.safety) fail(`官方 Trip "${trip.title}" safety 为空`);
    if (!trip.highlights) fail(`官方 Trip "${trip.title}" highlights 为空`);
    if (!trip.emoji) fail(`官方 Trip "${trip.title}" emoji 为空`);

    // 检查 highlights 是否为合法 JSON 数组且至少有 3 条
    try {
      const highlights = JSON.parse(trip.highlights);
      if (!Array.isArray(highlights) || highlights.length < 3) {
        fail(`官方 Trip "${trip.title}" highlights 应为至少 3 项的 JSON 数组`);
      }
    } catch {
      fail(`官方 Trip "${trip.title}" highlights 不是合法 JSON`);
    }

    // 检查标签
    const tagCount = await prisma.tripTag.count({ where: { tripId: trip.id } });
    if (tagCount < 2) fail(`官方 Trip "${trip.title}" 至少应有 2 个标签，当前: ${tagCount}`);
  }

  const pendingTrips = await prisma.trip.count({ where: { status: "PENDING", isOfficial: false } });
  if (pendingTrips < 2) fail(`Pending 用户投稿应 >= 2，当前: ${pendingTrips}`);

  // ============================================
  // 互动数据
  // ============================================
  const commentCount = await prisma.comment.count();
  if (commentCount === 0) fail("Comment 数量应 > 0");

  const likeCount = await prisma.like.count();
  if (likeCount === 0) fail("Like 数量应 > 0");

  const favoriteCount = await prisma.favorite.count();
  if (favoriteCount === 0) fail("Favorite 数量应 > 0");

  // ============================================
  // 输出结果
  // ============================================
  if (errors.length > 0) {
    console.log("❌ 种子数据检查未通过：\n");
    for (const err of errors) console.log(`  ${err}`);
    console.log("");
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log("✅ Seed data check passed\n");
  console.log(`Users:          ${userCount}`);
  console.log(`Tags:           ${tagCount}`);
  console.log(`Trips:          ${tripCount}`);
  console.log(`Official Trips: ${officialTrips.length}`);
  console.log(`Pending Trips:  ${pendingTrips}`);
  console.log(`Comments:       ${commentCount}`);
  console.log(`Likes:          ${likeCount}`);
  console.log(`Favorites:      ${favoriteCount}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ 脚本执行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
