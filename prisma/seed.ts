// ============================================
// 「100种不可思议旅行」数据库种子脚本
// 来源：docs/PRD.md · docs/ERD.md · prisma/schema.prisma
// ============================================

import { PrismaClient, UserRole, TripStatus, TagType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始播种数据...");

  // ============================================
  // 0. 幂等性：按反向依赖顺序清空旧数据
  // ============================================
  await prisma.favorite.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.tripTag.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ 已清空旧数据");

  // ============================================
  // 1. 创建用户
  // ============================================
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      bio: "平台管理员",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "lvxingzhe_xiaomi",
      passwordHash: hashedPassword,
      role: UserRole.USER,
      bio: "徒步爱好者 | 星空摄影师 | 正在收集100种不可思议旅行",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "shanhai_lurker",
      passwordHash: hashedPassword,
      role: UserRole.USER,
      bio: "废墟探险者 · 只拍不拿不破坏 · urbex only",
    },
  });

  console.log("  ✓ 已创建 3 个用户 (1 admin + 2 user)");

  // ============================================
  // 2. 创建全部 Tag
  // ============================================
  const themeTags = await Promise.all([
    prisma.tag.create({ data: { name: "限时仪式感", type: TagType.THEME } }),
    prisma.tag.create({ data: { name: "废墟美学",     type: TagType.THEME } }),
    prisma.tag.create({ data: { name: "反向小城",     type: TagType.THEME } }),
    prisma.tag.create({ data: { name: "暗夜星旅",     type: TagType.THEME } }),
    prisma.tag.create({ data: { name: "野性轻探",     type: TagType.THEME } }),
  ]);

  const moodTags = await Promise.all([
    prisma.tag.create({ data: { name: "孤独",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "末日感", type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "荒凉",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "狂野",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "原始",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "浪漫",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "松弛",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "震撼",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "猎奇",   type: TagType.MOOD } }),
    prisma.tag.create({ data: { name: "怀旧",   type: TagType.MOOD } }),
  ]);

  const levelTags = await Promise.all([
    prisma.tag.create({ data: { name: "只有当地人才知道", type: TagType.LEVEL } }),
    prisma.tag.create({ data: { name: "圈内人才懂",       type: TagType.LEVEL } }),
    prisma.tag.create({ data: { name: "需要当地向导",     type: TagType.LEVEL } }),
    prisma.tag.create({ data: { name: "需要特殊技能",     type: TagType.LEVEL } }),
  ]);

  // Tag 索引映射（方便后续引用）
  const T = (name: string) => [...themeTags, ...moodTags, ...levelTags].find((t) => t.name === name)!;

  console.log(`  ✓ 已创建 ${themeTags.length + moodTags.length + levelTags.length} 个标签`);

  // ============================================
  // 3. 创建官方 Trip（10 条，覆盖 5 个方向）
  // ============================================

  // --- 限时仪式感 (2 条) ---

  const trip1 = await prisma.trip.create({
    data: {
      title: "裸身彩绘跳火堆——彝族阿细祭火节",
      summary: "一年仅此一天，五色土画满赤裸胸膛，钻木取火后全村跳进火堆。这不是表演，这是千年前就在做的事。",
      story: "天还没亮，红万村的男人就开始在身上画图腾。五色土混着水，一笔一笔描过胸膛和后背——虎纹、火焰、太阳轮，每一种图案都对应一个古老的彝族氏族。中午毕摩蹲在神树下钻了二十分钟，第一缕青烟冒出来的时候全村沸腾了。他们一个接一个跳过燃烧的火堆，火星溅在彩绘皮肤上嗞嗞作响，空气里弥漫着松脂和汗水的味道。你站在人群里，突然理解了什么叫「活着」——不是存在，是燃烧。",
      theme: "限时仪式感",
      location: "云南弥勒 · 西一镇红万村一带",
      bestTime: "每年农历二月初三，仅此一天。需提前一天到达弥勒市区。",
      difficulty: "需提前联系当地向导安排通行。村内无住宿，需返回弥勒市区（约40分钟车程）。仪式现场人群密集，注意人身安全。",
      budget: "无门票。弥勒市区住宿约120-200元/晚。向导费约100-200元/人（可拼团）。",
      safety: "火堆区域保持安全距离，听从毕摩（祭司）引导。彩绘颜料为天然五色土，过敏体质请提前测试。现场烟尘较大建议佩戴口罩。",
      highlights: JSON.stringify([
        "裸身五色土图腾彩绘——全世界仅存的活态人体彩绘仪式",
        "毕摩钻木取火——彝族古老的火文化活化石",
        "千人跳火堆篝火狂欢——东方最狂野的狂欢节",
        "适合：追求极致视觉冲击、原始文化体验的人"
      ]),
      emoji: "🔥",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "赫哲族鱼皮部落乌日贡大会",
      summary: "中国人口最少的民族之一——赫哲族——四年一届的盛大聚会。穿鱼皮衣、敲桦皮鼓、听伊玛堪说唱，多数中国人不知道这个节日存在。",
      story: "你第一次见到真正的鱼皮衣。阳光下它泛着珍珠白的光泽，鳞片的纹理隐约可见——赫哲族老人说这件衣服用了五十多条大马哈鱼的皮，每一片都是手工鞣制、拼接、缝缀。旁边的年轻人穿着印有同样古老图案的T恤，一边弹吉他一边唱伊玛堪——古老的史诗和现代旋律搅在一起，竟然毫不违和。桦皮鼓声从江边传来的时候，你突然理解了：文化活着，不是因为它古老，而是因为有人还在乎。四年才一次的下一次乌日贡，你会在哪里？",
      theme: "限时仪式感",
      location: "黑龙江佳木斯 · 敖其镇赫哲村一带",
      bestTime: "农历五月十五前后，四年一届（下一届需查询赫哲族节庆日历）。夏季黑龙江气候宜人。",
      difficulty: "需提前确认具体节庆日期（可致电佳木斯市文旅局）。佳木斯市区可包车前往敖其镇（约30分钟）。",
      budget: "无门票。佳木斯市区住宿约150-250元/晚。包车往返约100元。全鱼宴人均约80元。",
      safety: "活动期间人流量较大，注意保管随身物品。尊重少数民族习俗，拍摄文面老人前务必征得同意。",
      highlights: JSON.stringify([
        "国家级非遗鱼皮衣制作技艺展示——五十条鱼皮缝一件衣服",
        "伊玛堪说唱史诗表演——赫哲族的口传《荷马史诗》",
        "桦皮鼓阵与江鱼全鱼宴——鄂温克-通古斯饮食文化的巅峰",
        "适合：民族文化爱好者、想见证极致稀有文化的旅行者"
      ]),
      emoji: "🐟",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  // --- 废墟美学 (2 条) ---

  const trip3 = await prisma.trip.create({
    data: {
      title: "在搁浅巨轮下拍末日大片",
      summary: "一艘巴拿马籍货轮被台风留在荣成海岸两年，锈迹爬满船身。清晨起雾时它从白雾中浮现——整条海岸线只有你和这艘巨轮。",
      story: "这艘巴拿马籍货轮搁浅在荣成海岸已经两年了。锈迹爬满船身，海浪日复一日拍打龙骨，涨潮时船头指向北方，像在等待永远不会来的救援。清晨起雾时走到沙滩尽头，巨轮从白雾中缓缓浮现——整个海岸线只有你和它。有人在船身上用粉笔写了一行字——「你也迷路了吗」——然后被下一次涨潮抹平。当地人叫它「布鲁维斯号」，游客叫它「山东泰坦尼克」，我们叫它：一座不需要门票的孤独剧场。",
      theme: "废墟美学",
      location: "山东荣成沿海区域，导航可搜「布鲁维斯号」附近海滩",
      bestTime: "清晨或黄昏光线最佳。阴天和晨雾氛围更强，冬季海风大但雾天出片率最高。夏季可下水但避开正午强光。",
      difficulty: "免费开放，自驾可至附近停车场，步行约5分钟到沙滩。注意潮汐时间——涨潮时船体周围会被淹没，勿冒险靠近。沙滩部分区域湿滑。",
      budget: "无门票。周边渔村民宿约120-180元/晚。建议自备简餐。",
      safety: "出发前务必查询潮汐表，仅在退潮时段前往。严禁攀爬船体——锈蚀钢结构极不稳定。冬季海风可达6-7级，注意防风保暖。建议结伴前往。",
      highlights: JSON.stringify([
        "日出时船体呈金色，逆光拍摄秒出末日感大片",
        "退潮时可走到船底近距离触摸锈蚀船身",
        "非节假日几乎无人，独享整片海岸线的寂静",
        "适合：摄影爱好者、废墟美学沉迷者、想独自待着的人"
      ]),
      emoji: "🚢",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  const trip4 = await prisma.trip.create({
    data: {
      title: "废弃矿坑变北欧小冰岛——达那也",
      summary: "深邃崖壁围住一片墨蓝色水面，石灰岩断面锋利如刀削。一艘小木舟停在岸边没人划——这不是冰岛，这是金华，门票只要68块钱。",
      story: "第一眼你以为是冰岛旅游广告里的图——深邃的崖壁围住一片墨蓝色的水面，石灰岩断面锋利如刀削，一艘小木舟停在岸边，没有人划。你坐在「孤独礼堂」里发呆，玻璃幕墙外是北欧清冷色调的风景——不需要修图，每一帧都自带高级滤镜。废弃的石灰岩矿坑被水灌满后，矿物质让水面变成一种说不清的蓝色，晴天是蒂芙尼蓝，阴天是冰岛灰。朋友问你是不是出国了，你说：金华，68块钱。",
      theme: "废墟美学",
      location: "浙江金华 · 金华山区域，导航「达那也·金华山小冰岛」",
      bestTime: "全年开放。阴天和冬日更有北欧清冷氛围，周末人多建议工作日前往。",
      difficulty: "需提前在官方小程序预约购票。景区内步行约1-2小时，有台阶路段。矿坑水域水深危险禁止下水。",
      budget: "门票约68元。金华市区住宿约150-300元/晚。景区内有咖啡馆，人均约40元。",
      safety: "严禁靠近水域边缘，水深且岸壁陡峭。部分区域碎石较多注意脚下。遵守景区标识，不翻越护栏。",
      highlights: JSON.stringify([
        "北欧清冷风矿坑湖——晴天色如蒂芙尼蓝，阴天色如冰岛灰",
        "孤独礼堂——270°玻璃幕墙直面矿坑湖",
        "随手一拍即大片，不需要任何修图技巧",
        "适合：喜欢北欧美学、想拍出高级感照片的人"
      ]),
      emoji: "🏔️",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  // --- 反向小城 (2 条) ---

  const trip5 = await prisma.trip.create({
    data: {
      title: "中国西极最后一缕落日——乌恰县",
      summary: "在祖国最西端看中国最后一缕阳光消失于帕米尔高原。戈壁、雪山、寂静——这里没有网红滤镜，只有风声和远处的犬吠。",
      story: "北京时间晚上八点半，太阳还挂在帕米尔高原上头——因为和东部有两个多小时的时差。九点出头它开始往下坠，整个戈壁被染成橙红色，雪山的轮廓变成一道剪影。没有人排队，没有观景台，没有售票处，只有风声和远处吉尔吉斯方向偶尔传来的犬吠。你在小学语文课本里学过的「大漠孤烟直」大概就是这个样子，但更安静，更缓慢，更孤独——也更自由。拍完最后一张照片，你发了一条朋友圈，定位是「中国最西端」。",
      theme: "反向小城",
      location: "新疆克州 · 乌恰县中国西极点位，距县城约40分钟车程",
      bestTime: "每年6-9月气候最稳定。日落前一小时到达最佳（夏季约北京时间20:30-21:30）。避开冬季，高海拔风寒效应极强。",
      difficulty: "需提前办理边防证（在户籍地或喀什办理）。建议自驾SUV，县城至观景点约40分钟，部分路段为土路。",
      budget: "无门票。乌恰县城招待所约100-150元/晚。喀什往返乌恰约250公里。",
      safety: "帕米尔高原海拔较高（约2500m），注意防晒和补水。边境区域严禁飞无人机。加油站在县城，出发前加满油。",
      highlights: JSON.stringify([
        "中国最西端落日——同一片国土上最晚的日落",
        "帕米尔高原戈壁全景——大漠孤烟直的现代版本",
        "柯尔克孜族民宿体验——游牧民族的奶茶和手抓饭",
        "适合：落日收集者、边境爱好者、想彻底逃离的人"
      ]),
      emoji: "⛰️",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  const trip6 = await prisma.trip.create({
    data: {
      title: "太行深山不足百人的鸭口村",
      summary: "藏在太行山腹地的小村，常住人口不足百人。红岩断崖、废弃石屋群、仅有的老人守着村子——整条山谷都是你的。",
      story: "鸭口村藏在大山深处，山路只有一条。村里的路是用太行山石一块一块拼起来的，磨得发亮。站在村头红岩断崖往下看，整条山谷铺展在面前——层层叠叠的太行红岩，像大地的皱纹。沿路的石屋门还开着，磨盘上长满青苔，墙角的野花从石缝里钻出来。村里的老人坐在门口晒太阳，看见你笑了笑，继续做手里的活儿。这里没有WiFi，没有信号，但有山里最安静的一个下午。你在一栋废弃石屋前坐了很久，思考一个问题：到底什么是「离开」，什么是「回来」。",
      theme: "反向小城",
      location: "河南辉县 · 鸭口村，太行山腹地",
      bestTime: "春秋季最佳（4-5月山花烂漫，9-10月秋色如画）。夏季多雨注意安全，冬季气温极低且部分山路封闭。清晨山谷有雾氛围最佳。",
      difficulty: "从辉县市区至村口约1小时车程，最后5公里为土路，建议SUV。需从村口徒步约5公里到达红岩断崖观景点。村中无住宿需自备帐篷或当日返回辉县。",
      budget: "无门票。辉县市区住宿约80-150元/晚。建议自带干粮和水（村中无商店）。",
      safety: "石屋年久失修禁止入内。雨天道路泥泞湿滑。山区昼夜温差大注意保暖。建议两人以上同行。全程无信号，出发前告知亲友行程。",
      highlights: JSON.stringify([
        "红岩断崖一览无余——太行山最壮观的免费观景台",
        "废弃石屋群——石头缝里长出野花的时光遗迹",
        "常住不足百人——整条山谷的绝对寂静",
        "适合：想彻底逃离都市、享受绝对安静的人"
      ]),
      emoji: "🏘️",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  // --- 暗夜星旅 (2 条) ---

  const trip7 = await prisma.trip.create({
    data: {
      title: "秦岭深处2级暗夜——留坝天文台",
      summary: "波特尔2级暗夜保护区，肉眼清晰可见银河旋臂。秦岭山脊上的乡村天文台，适合发呆、许愿、拍不带滤镜的星空。",
      story: "关掉手电筒的那一瞬间，你愣住了。银河从头顶直直劈过，像一桶被打翻的发光牛奶——天猫座和猎犬座之间那六个漩涡星系肉眼可见。152毫米的APO望远镜对准了仙女座大星云，目镜里那团光斑是来自250万年前的问候。你在秦岭山脊之巅，森林覆盖率92%的留坝暗夜腹地，在心里把「渺小」两个字默念了三遍。旁边的北京大哥放下双筒望远镜说：「我每年都来——不为拍照，就为了每年确认一次银河还在。」适合发呆，适合许愿，适合想起那些平时被手机和灯光淹没的事情。",
      theme: "暗夜星旅",
      location: "陕西汉中 · 留坝火烧店镇乡村天文台",
      bestTime: "农历月初月末最佳（无月光干扰）。避开雨季（7-8月）。晚10点后银河最清晰。冬季大气透明度更好但气温低。",
      difficulty: "自驾前往，部分山路需底盘较高的车（SUV或越野车）。乡村天文台免费但需提前在官方渠道预约。",
      budget: "天文台观测免费（需预约）。星空民宿约200-350元/晚。留坝县城住宿约100-200元/晚。",
      safety: "山区夜间气温低（夏季也需带外套），注意保暖。无光污染区域脚下注意安全，使用红光手电保护暗视觉。不打扰科研观测活动。",
      highlights: JSON.stringify([
        "波特尔2级暗夜——肉眼可见银河旋臂和仙女座大星云",
        "152MM APO专业天文望远镜——可以看到土星环",
        "森林覆盖率92%的秦岭腹地——中国中部最暗的夜空之一",
        "适合：星空摄影爱好者、想要被宇宙震撼的都市人"
      ]),
      emoji: "🌌",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  const trip8 = await prisma.trip.create({
    data: {
      title: "在雅丹火星地貌看银河——冷湖",
      summary: "国家天文台在此设观测站是有原因的：地球上没有几个地方比这里更接近宇宙。躺在火星营地帐篷里，透过天窗数流星。",
      story: "银河就在头顶正上方，像一条发光的河流横亘天际。四周是雅丹地貌——风蚀出的土柱在星光下像一群沉默的外星人，高低错落，鬼斧神工。你躺在火星营地的帐篷里，透过天窗看到流星划过，一颗、两颗、三颗。国家天文台选择在这建观测站是有原因的：极端干燥、零光污染、年均晴夜超过300天。地球上没有几个地方比这里更接近宇宙——也没有几个地方能让你如此真切地感受到自己是一个漂浮在太空中的微尘。天快亮的时候，银河渐渐隐去，东方地平线上泛起一抹橙色——那是火星的颜色。",
      theme: "暗夜星旅",
      location: "青海海西 · 冷湖镇火星营地",
      bestTime: "每年6-9月夜间气候最稳定。避开满月期（农历十五前后三天）。银河季（4-10月）可见银心。",
      difficulty: "海拔约2800m需适应高原（建议提前一天在冷湖镇适应）。需自驾越野车前往（从冷湖镇出发约1.5小时）。火星营地需提前在官网预订（旺季提前一个月）。补给（水、食物、汽油）需自备。",
      budget: "火星营地帐篷约400-800元/晚（含简餐）。冷湖镇住宿约150-250元/晚。",
      safety: "高原反应注意提前适应（建议在敦煌或冷湖镇停留1天）。无人区无信号，需备卫星电话或提前向营地报备行程。昼夜温差超20°C注意保暖。",
      highlights: JSON.stringify([
        "雅丹地貌+银河同框——地球上最像火星表面的星空",
        "国家天文台观测站选址地——年均晴夜300+天",
        "火星营地帐篷天花板观星——躺着数流星",
        "适合：星空极致爱好者、科幻迷、深空摄影玩家"
      ]),
      emoji: "🪐",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  // --- 野性轻探 (2 条) ---

  const trip9 = await prisma.trip.create({
    data: {
      title: "黄桑古道原始森林迷雾徒步",
      summary: "被时光遗忘的青石板古道，苔藓覆盖石板，百年红豆杉遮天蔽日。雾气弥漫时如千与千寻场景，全程几乎无人。",
      story: "石板路长满青苔，踩上去软软的，像走在一块巨大的绿色地毯上。走了四十分钟，一棵红豆杉突然从雾里站出来——树干两个人抱不住，树冠遮住了半边天，阳光从叶缝间漏下来变成一束束光柱。鸟叫声带着回音，溪水从脚边淌过，除此之外什么声音都没有。GPS信号在两个小时前就断了，但你不是迷路——你只是走进了八百年前商队走的那条路。当年挑着茶叶和盐的挑夫也是踩着这些石板走过的，青苔覆盖了他们的脚印，但覆盖不了这条路。走到古道尽头的时候你回头看了一眼，雾已经吞没了来路，像什么都没发生过。",
      theme: "野性轻探",
      location: "湖南邵阳 · 绥宁黄桑国家级自然保护区",
      bestTime: "春秋两季最佳（4-5月和9-11月）。清晨出发可见晨雾古道的经典画面。夏季多雨湿滑且蚊虫多，冬季需防寒防滑。",
      difficulty: "需徒步约12公里原始古道（约5-6小时）。全程无补给无厕所，信号极弱（仅入口处有微弱信号）。需自备户外装备（徒步鞋、登山杖）和离线地图。适合有一定户外经验的人。",
      budget: "保护区免费进入。绥宁县城住宿约100-160元/晚。建议自带路餐和水（2L以上）。",
      safety: "全程无信号，出发前务必告知亲友行程并下载好离线地图。穿防滑徒步鞋（石板路青苔湿滑）。携带足够水和食物。不采摘植物不惊扰野生动物。建议2人以上同行。",
      highlights: JSON.stringify([
        "原始森林迷雾——雾气弥漫时如千与千寻的异世界",
        "百年红豆杉古树群——两人合抱的活化石",
        "800年青石古道——踩在商队走过的石板上",
        "适合：户外经验者、追求极致秘境和绝对孤独的人"
      ]),
      emoji: "🌲",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  const trip10 = await prisma.trip.create({
    data: {
      title: "被99%游客忽略的赣南野生天路——宁都川藏线",
      summary: "一条碎石土路横穿赣南群山，之字形急弯像真正的川藏线。非铺装路面过滤掉所有大巴和轿车——只有拉毛竹的卡车和吃草的黄牛。",
      story: "导航在第三个弯道后就彻底失灵了。屏幕上的箭头停在半空中，像放弃了思考。路面变成了碎石和红土，每一个之字形急弯后面都藏着一段不期而遇的风景——一片突现的高山草甸，一群站在路中间不肯让路的黄牛，一棵独自立在悬崖边的松树。你摇下车窗，空气里混合着松脂和竹叶的味道。一辆拉毛竹的卡车从对面晃晃悠悠地开过来，司机看见你愣了一下，大概在想：怎么会有外地车开到这种地方来。GPS重新搜到信号的时候，你已经翻过了三座山。手机弹出通知说「您可能对这条路线感兴趣」，不，我不需要算法推荐——我需要的就是不期而遇。",
      theme: "野性轻探",
      location: "江西赣州 · 宁都县X549乡道（宁都川藏线）",
      bestTime: "春秋两季（3-5月和10-12月）。春天高山杜鹃盛开，秋季层林尽染。避开雨季（6-7月）部分路段可能被冲毁。",
      difficulty: "非铺装碎石土路适合SUV或越野车（轿车不推荐）。部分路段狭窄仅容一车通过，会车需选择宽位。全程约80公里，驾驶时间约3-4小时。部分路段路基被冲毁需低速通过。",
      budget: "无任何费用。宁都县城住宿约80-150元/晚。沿途无加油站需在县城加满油。建议自备水和食物。",
      safety: "山区信号不稳定，提前下载离线地图。雨天部分路段泥泞且可能滑坡，出行前查询天气。非铺装路面注意轮胎状况（建议携带备胎）。部分路段无护栏，注意车速。",
      highlights: JSON.stringify([
        "之字形急弯和碎石土路——江西版川藏线",
        "高山草甸与竹林松林交替——每个弯道都是新画面",
        "几乎无游客——只有拉毛竹的卡车和吃草的黄牛",
        "适合：自驾爱好者、追求野性驾驶体验的人"
      ]),
      emoji: "🛣️",
      isOfficial: true,
      status: TripStatus.APPROVED,
      authorId: admin.id,
    },
  });

  console.log("  ✓ 已创建 10 条官方 Trip");

  // ============================================
  // 4. 创建 TripTag 关联
  // ============================================

  const tripTagData: { tripId: string; tagId: string }[] = [
    // trip1: 阿细祭火节 — 限时仪式感 + 狂野/原始 + 需要当地向导
    { tripId: trip1.id, tagId: T("限时仪式感").id },
    { tripId: trip1.id, tagId: T("狂野").id },
    { tripId: trip1.id, tagId: T("原始").id },
    { tripId: trip1.id, tagId: T("需要当地向导").id },
    // trip2: 赫哲族乌日贡 — 限时仪式感 + 猎奇/怀旧 + 只有当地人才知道
    { tripId: trip2.id, tagId: T("限时仪式感").id },
    { tripId: trip2.id, tagId: T("猎奇").id },
    { tripId: trip2.id, tagId: T("怀旧").id },
    { tripId: trip2.id, tagId: T("只有当地人才知道").id },
    // trip3: 搁浅巨轮 — 废墟美学 + 孤独/末日感 + 圈内人才懂
    { tripId: trip3.id, tagId: T("废墟美学").id },
    { tripId: trip3.id, tagId: T("孤独").id },
    { tripId: trip3.id, tagId: T("末日感").id },
    { tripId: trip3.id, tagId: T("圈内人才懂").id },
    // trip4: 矿坑小冰岛 — 废墟美学 + 松弛/孤独 + 圈内人才懂
    { tripId: trip4.id, tagId: T("废墟美学").id },
    { tripId: trip4.id, tagId: T("松弛").id },
    { tripId: trip4.id, tagId: T("孤独").id },
    { tripId: trip4.id, tagId: T("圈内人才懂").id },
    // trip5: 乌恰县西极 — 反向小城 + 浪漫/孤独/松弛 + 只有当地人才知道
    { tripId: trip5.id, tagId: T("反向小城").id },
    { tripId: trip5.id, tagId: T("浪漫").id },
    { tripId: trip5.id, tagId: T("孤独").id },
    { tripId: trip5.id, tagId: T("松弛").id },
    { tripId: trip5.id, tagId: T("只有当地人才知道").id },
    // trip6: 太行鸭口村 — 反向小城 + 怀旧/孤独/松弛 + 只有当地人才知道
    { tripId: trip6.id, tagId: T("反向小城").id },
    { tripId: trip6.id, tagId: T("怀旧").id },
    { tripId: trip6.id, tagId: T("孤独").id },
    { tripId: trip6.id, tagId: T("松弛").id },
    { tripId: trip6.id, tagId: T("只有当地人才知道").id },
    // trip7: 留坝暗夜 — 暗夜星旅 + 震撼/浪漫/孤独 + 圈内人才懂
    { tripId: trip7.id, tagId: T("暗夜星旅").id },
    { tripId: trip7.id, tagId: T("震撼").id },
    { tripId: trip7.id, tagId: T("浪漫").id },
    { tripId: trip7.id, tagId: T("孤独").id },
    { tripId: trip7.id, tagId: T("圈内人才懂").id },
    // trip8: 冷湖火星营地 — 暗夜星旅 + 震撼/荒凉 + 需要特殊技能
    { tripId: trip8.id, tagId: T("暗夜星旅").id },
    { tripId: trip8.id, tagId: T("震撼").id },
    { tripId: trip8.id, tagId: T("荒凉").id },
    { tripId: trip8.id, tagId: T("需要特殊技能").id },
    // trip9: 黄桑古道 — 野性轻探 + 禁忌/孤独/狂野 + 需要特殊技能
    { tripId: trip9.id, tagId: T("野性轻探").id },
    { tripId: trip9.id, tagId: T("孤独").id },
    { tripId: trip9.id, tagId: T("狂野").id },
    { tripId: trip9.id, tagId: T("原始").id },
    { tripId: trip9.id, tagId: T("需要特殊技能").id },
    // trip10: 宁都川藏线 — 野性轻探 + 狂野/孤独 + 需要特殊技能
    { tripId: trip10.id, tagId: T("野性轻探").id },
    { tripId: trip10.id, tagId: T("狂野").id },
    { tripId: trip10.id, tagId: T("孤独").id },
    { tripId: trip10.id, tagId: T("需要特殊技能").id },
  ];

  // 去重检查
  const seen = new Set<string>();
  const uniqueTripTags = tripTagData.filter((tt) => {
    const key = `${tt.tripId}-${tt.tagId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  await prisma.tripTag.createMany({ data: uniqueTripTags });
  console.log(`  ✓ 已创建 ${uniqueTripTags.length} 条 TripTag 关联`);

  // ============================================
  // 5. 创建 2 条用户投稿 (PENDING)
  // ============================================

  const pendingTrip1 = await prisma.trip.create({
    data: {
      title: "在火山脚下等银河升起——乌兰哈达",
      summary: "一座沉睡万年的火山，一片没有人打扰的草原星空。车开到土路尽头，剩下三公里只能徒步，但每一步都值得。",
      story: "车开到土路尽头，剩下的三公里只能徒步。火山口就在前方，像一个巨人的呼吸孔——乌兰哈达火山群最近一次喷发是一万年前，现在它安静地躺在草原上，被野花和牧草覆盖。天黑之后银河从火山锥后面升起，像一条发光的河围绕着这座沉睡了一万年的巨兽。你在火山口边缘搭好帐篷，抬头看到第一颗流星划过。没有人，没有光，没有声音——只有风、草原和一万年的沉默。",
      theme: "暗夜星旅",
      location: "内蒙古乌兰察布 · 乌兰哈达火山群",
      bestTime: "每年6-9月，避开满月期。草原夏季气候宜人，夜间凉爽。",
      difficulty: "需自驾至火山脚下（北京出发约5小时），最后3公里需徒步。海拔约1500m，无高反风险。",
      budget: "无门票。自带帐篷露营免费。乌兰察布市区住宿约150元/晚。",
      safety: "火山口边缘注意脚下，岩石松动区域勿靠近。夜间气温低注意保暖（夏季也需薄羽绒服）。草原天气变化快，备好防雨装备。",
      highlights: JSON.stringify(["在休眠一万年的火山口旁露营","银河从火山锥后升起","整片草原只有你和星空","适合：星空爱好者+火山迷"]),
      emoji: "🌋",
      isOfficial: false,
      status: TripStatus.PENDING,
      authorId: user1.id,
    },
  });

  const pendingTrip2 = await prisma.trip.create({
    data: {
      title: "废弃军工厂里的赛博朋克世界",
      summary: "一座七十年代的废弃军工厂，车床和炮弹壳散落一地。生锈的钢铁在夕阳下变成赛博朋克的橙金色——这是中国最被低估的 urbex 圣地。",
      story: "翻过那道被推倒一半的围墙，你进入了一个被时间冻结的世界。七十年代的车床还保持着最后一次运转的姿势，炮弹壳散落在流水线上，墙壁上「安全生产」的标语褪色到几乎看不清。夕阳从破损的天窗斜射进来，把所有生锈的钢铁染成赛博朋克的橙金色——不需要任何滤镜，这就是天然的《银翼杀手》片场。你在一个倾倒的工具柜上坐了很久，想象四十年前那些在这里工作的年轻人——他们大概想不到，自己每天上班的地方，有一天会被一群叫「城市探险者」的人当作圣地。",
      theme: "废墟美学",
      location: "四川成都 · 青白江区某废弃厂房（具体点位不公开，遵循 urbex 圈不公开原则）",
      bestTime: "秋冬季节植被枯萎后可见度更高。下午3-5点阳光斜射时内部光线最佳。",
      difficulty: "需通过 urbex 社群获取具体点位。厂房结构老化严重，部分地板已塌陷，需掌握基本 urbex 安全常识。",
      budget: "无任何费用。成都市区出发公共交通可达青白江区。",
      safety: "厂房结构极不稳定，严禁攀爬和在二楼以上楼层停留。地上可能有钉子、碎玻璃，穿厚底鞋。戴防尘口罩（建筑粉尘和可能的石棉）。遵守 urbex 圈守则：不公开点位、不拿东西、不破坏、两人以上同行。",
      highlights: JSON.stringify(["七十年代军工流水线完好保留","天然赛博朋克光影效果","中国 urbex 圈公认的TOP级点位","适合：城市探险者、废墟摄影爱好者"]),
      emoji: "🏭",
      isOfficial: false,
      status: TripStatus.PENDING,
      authorId: user2.id,
    },
  });

  // 给 pending trip 添加标签
  await prisma.tripTag.createMany({
    data: [
      // pendingTrip1: 火山银河
      { tripId: pendingTrip1.id, tagId: T("暗夜星旅").id },
      { tripId: pendingTrip1.id, tagId: T("震撼").id },
      { tripId: pendingTrip1.id, tagId: T("浪漫").id },
      { tripId: pendingTrip1.id, tagId: T("孤独").id },
      { tripId: pendingTrip1.id, tagId: T("需要特殊技能").id },
      // pendingTrip2: 废弃军工厂
      { tripId: pendingTrip2.id, tagId: T("废墟美学").id },
      { tripId: pendingTrip2.id, tagId: T("末日感").id },
      { tripId: pendingTrip2.id, tagId: T("怀旧").id },
      { tripId: pendingTrip2.id, tagId: T("荒凉").id },
      { tripId: pendingTrip2.id, tagId: T("圈内人才懂").id },
    ],
  });

  console.log("  ✓ 已创建 2 条用户投稿 (PENDING)");

  // ============================================
  // 6. 创建 Comment
  // ============================================

  await prisma.comment.createMany({
    data: [
      { content: "上周刚去了搁浅巨轮！阴天早晨去的，整片海滩就我一个人。拍出来的照片朋友圈都问是不是冰岛。提醒大家一定要查潮汐表！", userId: user1.id, tripId: trip3.id },
      { content: "我是弥勒本地人，祭火节从小看到大。但作者写出了我从来没意识到的东西——那种燃烧的感觉。写得真好。", userId: user2.id, tripId: trip1.id },
      { content: "冷湖真的太震撼了。我在火星营地住了一晚，凌晨三点爬起来看银河，那种感觉说不出来——像被宇宙拥抱了。", userId: user1.id, tripId: trip8.id },
      { content: "去过达那也，确实出片。但周末人真的多，排了半小时队才排到孤独礼堂。建议工作日去，完全不一样的体验。", userId: user2.id, tripId: trip4.id },
      { content: "乌恰县的边防证可以在喀什办，我去年去的，但提醒一下沿途加油站很少，一定要在喀什加满油再出发。", userId: user1.id, tripId: trip5.id },
      { content: "黄桑古道走了两次了，一次春天一次秋天。春天的雾更浓更像千与千寻，但秋天路况好很多。建议第一次走的选秋天。", userId: user2.id, tripId: trip9.id },
      { content: "请问宁都川藏线轿车能走吗？家里只有一辆卡罗拉……", userId: user1.id, tripId: trip10.id },
    ],
  });

  console.log("  ✓ 已创建 7 条 Comment");

  // ============================================
  // 7. 创建 Like
  // ============================================

  const allOfficialTrips = [trip1, trip2, trip3, trip4, trip5, trip6, trip7, trip8, trip9, trip10];

  // 为官方 Trip 手动创建 Like + 更新 likeCount
  for (const [index, trip] of allOfficialTrips.entries()) {
    const likers: string[] = [];
    // trip3（搁浅巨轮）最受欢迎
    if (trip.id === trip3.id) likers.push(user1.id, user2.id, admin.id);
    // trip8（冷湖）其次
    else if (trip.id === trip8.id) likers.push(user1.id, user2.id);
    // trip7（留坝暗夜）
    else if (trip.id === trip7.id) likers.push(user1.id, admin.id);
    // trip4（矿坑小冰岛）
    else if (trip.id === trip4.id) likers.push(user2.id, admin.id);
    // trip1（祭火节）
    else if (trip.id === trip1.id) likers.push(user1.id);
    // trip9（黄桑古道）
    else if (trip.id === trip9.id) likers.push(user2.id);
    // trip5（乌恰）
    else if (trip.id === trip5.id) likers.push(user1.id);
    // trip10（宁都川藏线）
    else if (trip.id === trip10.id) likers.push(user2.id);
    // trip2, trip6 无 like（为测试空状态保留）

    for (const userId of likers) {
      await prisma.like.create({ data: { userId, tripId: trip.id } });
    }

    if (likers.length > 0) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: { likeCount: likers.length },
      });
    }
  }

  const totalLikes = await prisma.like.count();
  console.log(`  ✓ 已创建 ${totalLikes} 条 Like`);

  // ============================================
  // 8. 创建 Favorite
  // ============================================

  // 为部分 Trip 创建收藏
  for (const [index, trip] of allOfficialTrips.entries()) {
    const favoriters: string[] = [];
    if (trip.id === trip3.id) favoriters.push(user1.id, admin.id); // 搁浅巨轮
    else if (trip.id === trip8.id) favoriters.push(user1.id, user2.id); // 冷湖
    else if (trip.id === trip7.id) favoriters.push(user1.id); // 留坝
    else if (trip.id === trip1.id) favoriters.push(user2.id); // 祭火节
    else if (trip.id === trip5.id) favoriters.push(user2.id); // 乌恰
    else if (trip.id === trip9.id) favoriters.push(user1.id); // 黄桑古道

    for (const userId of favoriters) {
      await prisma.favorite.create({ data: { userId, tripId: trip.id } });
    }

    if (favoriters.length > 0) {
      await prisma.trip.update({
        where: { id: trip.id },
        data: { favoriteCount: favoriters.length },
      });
    }
  }

  const totalFavorites = await prisma.favorite.count();
  console.log(`  ✓ 已创建 ${totalFavorites} 条 Favorite`);

  // ============================================
  // 完成
  // ============================================
  console.log("");
  console.log("✅ 种子数据播种完成！");
  console.log("");
  console.log("📊 数据概览：");
  console.log(`   用户：${await prisma.user.count()}  (1 admin + 2 user)`);
  console.log(`   标签：${await prisma.tag.count()}  (${themeTags.length} 主题 + ${moodTags.length} 情绪 + ${levelTags.length} 等级)`);
  console.log(`   Trip：${await prisma.trip.count()}  (10 approved + ${await prisma.trip.count({ where: { status: TripStatus.PENDING } })} pending)`);
  console.log(`   TripTag：${await prisma.tripTag.count()}`);
  console.log(`   Comment：${await prisma.comment.count()}`);
  console.log(`   Like：${await prisma.like.count()}`);
  console.log(`   Favorite：${await prisma.favorite.count()}`);
  console.log("");
  console.log("🔑 测试账户：");
  console.log("   admin / password123  (管理员)");
  console.log("   lvxingzhe_xiaomi / password123  (普通用户)");
  console.log("   shanhai_lurker / password123  (普通用户)");
}

main()
  .catch((e) => {
    console.error("❌ Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
