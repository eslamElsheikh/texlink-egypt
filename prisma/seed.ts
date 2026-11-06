import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TexLink Egypt database seed...");

  // Clean up existing data in correct relational order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.orderMilestone.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.rfqSizeBreakdown.deleteMany();
  await prisma.rfqAttachment.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.productPriceTier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.factoryDocument.deleteMany();
  await prisma.factoryProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("123456", 10);

  // 1. Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        nameAr: "تيشيرتات وبولو",
        nameEn: "T-Shirts & Polos",
        slug: "t-shirts",
        icon: "shirt",
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "هوديز وسويت شيرت",
        nameEn: "Hoodies & Sweatshirts",
        slug: "hoodies",
        icon: "package",
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "بنطلونات رياضية وسويت بانتس",
        nameEn: "Sweatpants & Joggers",
        slug: "pants",
        icon: "layers",
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "شرابات وجوارب",
        nameEn: "Socks & Hosiery",
        slug: "socks",
        icon: "feather",
      },
    }),
    prisma.category.create({
      data: {
        nameAr: "أقمشة وتريكو خام",
        nameEn: "Fabrics & Knits",
        slug: "fabrics",
        icon: "disc",
      },
    }),
  ]);

  const [catTshirts, catHoodies, catPants, catSocks, catFabrics] = categories;

  // 2. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@texlink-egypt.com",
      passwordHash: defaultPasswordHash,
      name: "إدارة منصة تكس لينك",
      phone: "01000000001",
      role: "ADMIN",
      isBuyer: true,
      isFactory: false,
    },
  });

  // 3. Buyer Users
  const buyerUser1 = await prisma.user.create({
    data: {
      email: "buyer1@cairo-apparel.com",
      passwordHash: defaultPasswordHash,
      name: "أحمد الشناوي",
      phone: "01011112222",
      role: "BUYER",
      isBuyer: true,
      isFactory: false,
      buyerProfile: {
        create: {
          companyName: "شركة القاهرة للأزياء العصرية",
          businessType: "BRAND",
          governorate: "القاهرة",
        },
      },
    },
  });

  const buyerUser2 = await prisma.user.create({
    data: {
      email: "buyer2@alex-wholesale.com",
      passwordHash: defaultPasswordHash,
      name: "محمود زهران",
      phone: "01122223333",
      role: "BUYER",
      isBuyer: true,
      isFactory: false,
      buyerProfile: {
        create: {
          companyName: "مؤسسة زهران لتجارة الجملة",
          businessType: "WHOLESALER",
          governorate: "الجيزة",
        },
      },
    },
  });

  // 4. Five Real Egyptian Factories
  // Factory 1: مصنع النصر للتريكو (المحلة الكبرى)
  const factoryUser1 = await prisma.user.create({
    data: {
      email: "elnasr@mahalla-textile.com",
      passwordHash: defaultPasswordHash,
      name: "م. إبراهيم رضوان",
      phone: "01234567891",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: {
        create: {
          nameAr: "مصنع النصر للتريكو",
          slug: "el-nasr-tricot",
          governorate: "المحلة الكبرى",
          city: "المحلة الكبرى - المنطقة الصناعية",
          address: "شارع الإنتاج الصناعي، مجمع التريكو، المحلة الكبرى، الغربية",
          phone: "01234567891",
          whatsapp: "01234567891",
          bioAr:
            "من أعرق قلاع صناعة التريكو الدائري والملابس الجاهزة في المحلة الكبرى بخبرة تتجاوز 25 عاماً. ننتج التيشيرتات القطنية عالية الجودة، البولو بيكيه، والملابس الداخلية بمواصفات تصديرية.",
          logoUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          minOrderQuantity: 100,
          monthlyCapacity: 35000,
          establishedYear: 1998,
          rating: 4.8,
          reviewCount: 38,
          specialties: JSON.stringify(["تيشيرتات قطن 100%", "بولو شيرت بيكيه", "ملابس جاهزة عالية الجودة"]),
          machines: JSON.stringify(["24 ماكينة تريكو دائري ماير آند سي", "40 ماكينة سنجر وأوفرلوك جوكي", "خط كوي وتعبئة بخاري"]),
          fabrics: JSON.stringify(["قطن مصري 100% مشط وسوبر", "سينجل جيرسي ليكرا", "بيكيه قطني"]),
          featured: true,
        },
      },
    },
    include: { factoryProfile: true },
  });

  // Factory 2: مصنع الأمل للملابس (شبرا الخيمة)
  const factoryUser2 = await prisma.user.create({
    data: {
      email: "alamal@shoubra-wear.com",
      passwordHash: defaultPasswordHash,
      name: "حاج سامي عبد الفتاح",
      phone: "01098765432",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: {
        create: {
          nameAr: "مصنع الأمل للملابس",
          slug: "al-amal-garments",
          governorate: "شبرا الخيمة",
          city: "شبرا الخيمة - بهتيم",
          address: "طريق بهتيم الزراعي، المنطقة النسيجية، شبرا الخيمة، القليوبية",
          phone: "01098765432",
          whatsapp: "01098765432",
          bioAr:
            "متخصصون في تشغيل وتفصيل التيشيرتات والبولو ومطبوعات السلك سكرين والتطريز الكمبيوتري. قدرة عالية على تسليم الكميات الكبيرة لتجار الجملة في أوقات قياسية.",
          logoUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          minOrderQuantity: 50,
          monthlyCapacity: 25000,
          establishedYear: 2006,
          rating: 4.6,
          reviewCount: 29,
          specialties: JSON.stringify(["تيشيرتات وبولو", "طباعة سلك سكرين", "تطريز كمبيوتر"]),
          machines: JSON.stringify(["30 ماكينة خياطة سيروبا", "طابعة أوتوماتيك أخطبوط 8 ألوان", "ماكينات تطريز تاجيما"]),
          fabrics: JSON.stringify(["قطن ممشط 24/1 و 30/1", "بيكيه قطن بوليستر", "إنترلوك قطني"]),
          featured: true,
        },
      },
    },
    include: { factoryProfile: true },
  });

  // Factory 3: مصنع الخليج للتريكو (المنوفية)
  const factoryUser3 = await prisma.user.create({
    data: {
      email: "khalij@menofia-knit.com",
      passwordHash: defaultPasswordHash,
      name: "م. طارق بدوي",
      phone: "01144455566",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: {
        create: {
          nameAr: "مصنع الخليج للتريكو",
          slug: "al-khalij-tricot",
          governorate: "المنوفية",
          city: "قويسنا - المنطقة الصناعية الثالثة",
          address: "المنطقة الصناعية الثالثة، بلوك 12، قويسنا، المنوفية",
          phone: "01144455566",
          whatsapp: "01144455566",
          bioAr:
            "مصنع متكامل لغزل ونسيج وتفصيل أقمشة التريكو الدائرية والمسطحة بجميع أوزان الجراماج. نوفر خامات عالية الجودة جاهزة للتصنيع وملابس تريكو شتوية وصيفية.",
          logoUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          minOrderQuantity: 100,
          monthlyCapacity: 40000,
          establishedYear: 2012,
          rating: 4.5,
          reviewCount: 22,
          specialties: JSON.stringify(["جميع أنواع التريكو", "أقمشة سينجل جيرسي وميلتون", "سويت شيرت وهودي"]),
          machines: JSON.stringify(["18 ماكينة تريكو تيروت ألماني", "35 ماكينة خياطة براذر", "قسم صباغة ومعالجة"]),
          fabrics: JSON.stringify(["ميلتون قطن مهلب وممشط", "ريشة ناعمة", "تريكو جاكار"]),
          featured: true,
        },
      },
    },
    include: { factoryProfile: true },
  });

  // Factory 4: مصنع الدلتا للملابس والميلتون (العاشر من رمضان)
  const factoryUser4 = await prisma.user.create({
    data: {
      email: "delta@10th-textile.com",
      passwordHash: defaultPasswordHash,
      name: "حسام الجندي",
      phone: "01555566677",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: {
        create: {
          nameAr: "مصنع الدلتا للملابس والميلتون",
          slug: "delta-apparel-milton",
          governorate: "العاشر من رمضان",
          city: "العاشر من رمضان - المنطقة الصناعية B4",
          address: "المنطقة الصناعية B4، العاشر من رمضان، الشرقية",
          phone: "01555566677",
          whatsapp: "01555566677",
          bioAr:
            "المتخصصون في الملابس الشتوية، هوديز أوفر سايز، بنطلونات سويت بانتس، وميلتون مبطن 3 فتلة. نلبي طلبات أكبر البراندات المصرية والشبابية بأعلى معايير التشطيب.",
          logoUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          minOrderQuantity: 50,
          monthlyCapacity: 30000,
          establishedYear: 2017,
          rating: 4.7,
          reviewCount: 31,
          specialties: JSON.stringify(["هوديز وسويت شيرت", "سويت بانتس", "ميلتون قطن 3 فتلة"]),
          machines: JSON.stringify(["مقص كهربائي ليزر", "خطوط إنتاج أوفر جوكي", "ماكينات فلات لوك"]),
          fabrics: JSON.stringify(["ميلتون بوليستر قطن 320 GSM", "فرنش تيري قطن 280 GSM", "ريب مضلع 2*2"]),
          featured: false,
        },
      },
    },
    include: { factoryProfile: true },
  });

  // Factory 5: مصنع الإسكندرية للجوارب والتريكو (برج العرب)
  const factoryUser5 = await prisma.user.create({
    data: {
      email: "alexsocks@borg-elarab.com",
      passwordHash: defaultPasswordHash,
      name: "ك. خالد العطار",
      phone: "01288899900",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
      factoryProfile: {
        create: {
          nameAr: "مصنع الإسكندرية للجوارب والتريكو",
          slug: "alex-socks-factory",
          governorate: "الإسكندرية",
          city: "برج العرب الجديدة - المنطقة الصناعية الأولى",
          address: "المنطقة الصناعية الأولى، قطعة 45، برج العرب، الإسكندرية",
          phone: "01288899900",
          whatsapp: "01288899900",
          bioAr:
            "أحدث خطوط إنتاج الجوارب القطنية والرياضية في مصر بتقنية النسيج الإيطالي لونا سانتي. منتجات تدوم طويلاً قطن مصري فاخر 100% مع سباندكس مرن.",
          logoUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=150&auto=format&fit=crop&q=80",
          coverUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
          minOrderQuantity: 300,
          monthlyCapacity: 120000,
          establishedYear: 2019,
          rating: 4.9,
          reviewCount: 45,
          specialties: JSON.stringify(["شرابات قطنية كاجوال", "جوارب رياضية ضاغطة", "شرابات غير مرئية"]),
          machines: JSON.stringify(["50 ماكينة لونا سانتي إيطالية", "ماكينات تقفيل أوتوماتيك روزو", "أفران تشكيل وتبخير"]),
          fabrics: JSON.stringify(["غزل قطن مصري 100% 30/2", "خيوط سباندكس وبولياميد"]),
          featured: false,
        },
      },
    },
    include: { factoryProfile: true },
  });

  const f1 = factoryUser1.factoryProfile!;
  const f2 = factoryUser2.factoryProfile!;
  const f3 = factoryUser3.factoryProfile!;
  const f4 = factoryUser4.factoryProfile!;
  const f5 = factoryUser5.factoryProfile!;

  // 5. Ready-Made Stock Products (15 Products across factories)
  const productsData = [
    // Factory 1: El Nasr
    {
      factoryId: f1.id,
      categoryId: catTshirts.id,
      nameAr: "تيشيرت قطن 100% سينجل جيرسي 180 GSM",
      descriptionAr: "تيشيرت صيفي قطني ممشط فائق النعومة، معالجة ضد الانكماش وثبات ألوان عالي. متوفر بألوان أساسية ومقاسات متنوعة.",
      fabric: "قطن مصري 100%",
      gsm: 180,
      colors: JSON.stringify(["أبيض", "أسود", "كحلي", "رمادي ملانج"]),
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 5,
      stockQuantity: 1200,
      basePrice: 55,
      images: JSON.stringify(["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 55 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 50 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 45 },
      ],
    },
    {
      factoryId: f1.id,
      categoryId: catTshirts.id,
      nameAr: "تي شيرت بولو كلاسيك بيكيه قطن فاخر",
      descriptionAr: "بولو شيرت بيكيه بياقة وأساور ريب مضلعة مع أزرار صدفية. خامة متينة ممتازة للزي الموحد والبراندات.",
      fabric: "قطن بيكيه 95% ليكرا 5%",
      gsm: 220,
      colors: JSON.stringify(["كحلي", "أحمر داكن", "أزرق ملكي", "أسود"]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      moq: 50,
      leadTimeDays: 7,
      stockQuantity: 800,
      basePrice: 95,
      images: JSON.stringify(["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 95 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 88 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 80 },
      ],
    },
    {
      factoryId: f1.id,
      categoryId: catTshirts.id,
      nameAr: "تيشيرت أوفر سايز دروب شولدر خامة ثقيلة",
      descriptionAr: "قصة عصرية واسعة Drop Shoulder بياقة ريب سميكة 3 سم. الموديل الأكثر طلباً لماركات ملابس الشارع.",
      fabric: "قطن سوبر 100%",
      gsm: 240,
      colors: JSON.stringify(["بيج كريمي", "أسود كربوني", "زيتي", "أوف وايت"]),
      sizes: JSON.stringify(["M", "L", "XL"]),
      moq: 60,
      leadTimeDays: 6,
      stockQuantity: 650,
      basePrice: 75,
      images: JSON.stringify(["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 60, maxQuantity: 199, pricePerPiece: 75 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 68 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 62 },
      ],
    },

    // Factory 2: Al Amal
    {
      factoryId: f2.id,
      categoryId: catTshirts.id,
      nameAr: "تيشيرت بياقة V-Neck قطن ليكرا خفيف",
      descriptionAr: "قصة سليم فت بياقة سبعة أنيقة مناسب للارتداء الكاجوال أو كقطعة داخلية مريحة.",
      fabric: "قطن 92% سباندكس 8%",
      gsm: 170,
      colors: JSON.stringify(["أبيض", "أسود", "رمادي فاتح"]),
      sizes: JSON.stringify(["M", "L", "XL"]),
      moq: 50,
      leadTimeDays: 4,
      stockQuantity: 900,
      basePrice: 48,
      images: JSON.stringify(["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 48 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 44 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 39 },
      ],
    },
    {
      factoryId: f2.id,
      categoryId: catTshirts.id,
      nameAr: "تيشيرت بولو مقلم ياقة قطنية كاجوال",
      descriptionAr: "بولو تريكو مقلم بألوان شبابية متباينة، مناسب لمواسم الربيع والصيف.",
      fabric: "قطن بيكيه 100%",
      gsm: 210,
      colors: JSON.stringify(["أزرق مع أبيض", "كحلي مع أحمر"]),
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 5,
      stockQuantity: 500,
      basePrice: 85,
      images: JSON.stringify(["https://images.unsplash.com/photo-1625910513413-6d0932a4e511?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 85 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 78 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 70 },
      ],
    },
    {
      factoryId: f2.id,
      categoryId: catPants.id,
      nameAr: "شورت رياضي قطن فرنش تيري كاجوال",
      descriptionAr: "شورت مريح برباط خصر مطاطي وجيوب جانبية متينة، مثالي للجيم والنوادي.",
      fabric: "قطن فرنش تيري 260 GSM",
      gsm: 260,
      colors: JSON.stringify(["رمادي ملانج", "أسود", "كحلي"]),
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 5,
      stockQuantity: 700,
      basePrice: 65,
      images: JSON.stringify(["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 65 },
        { minQuantity: 200, maxQuantity: null, pricePerPiece: 58 },
      ],
    },

    // Factory 3: Al Khalij
    {
      factoryId: f3.id,
      categoryId: catFabrics.id,
      nameAr: "توب تريكو شتوي هاي كول قطن صوف",
      descriptionAr: "هاي كول محبوك بغرزة مضلعة ناعمة ومطاطية عالية، يوفر الدفء والأناقة في الشتاء.",
      fabric: "مزيج قطن وأكريليك ناعم",
      gsm: 300,
      colors: JSON.stringify(["أسود", "بيج", "كافيه", "زيتي"]),
      sizes: JSON.stringify(["M", "L", "XL"]),
      moq: 50,
      leadTimeDays: 8,
      stockQuantity: 450,
      basePrice: 110,
      images: JSON.stringify(["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 110 },
        { minQuantity: 200, maxQuantity: null, pricePerPiece: 98 },
      ],
    },
    {
      factoryId: f3.id,
      categoryId: catHoodies.id,
      nameAr: "سويت شيرت كرو نيك قطن إنترلوك ناعم",
      descriptionAr: "سويت شيرت بياقة مستديرة خامة إنترلوك مزدوجة الوجه، عازلة للحرارة بدون وبرة داخلية مزعجة.",
      fabric: "إنترلوك قطن 85% بوليستر 15%",
      gsm: 290,
      colors: JSON.stringify(["رمادي غامق", "بترولي", "أوف وايت"]),
      sizes: JSON.stringify(["S", "M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 6,
      stockQuantity: 550,
      basePrice: 125,
      images: JSON.stringify(["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 125 },
        { minQuantity: 200, maxQuantity: null, pricePerPiece: 112 },
      ],
    },
    {
      factoryId: f3.id,
      categoryId: catFabrics.id,
      nameAr: "كارديجان تريكو نسائي طويل بأزرار خشبية",
      descriptionAr: "كارديجان مفتوح بجيوب أمامية وغرزة نسيج مجدولة عريضة، من أكثر الموديلات مبيعاً.",
      fabric: "غزل تريكو تركي ممزوج",
      gsm: 380,
      colors: JSON.stringify(["جملي", "رمادي", "أسود"]),
      sizes: JSON.stringify(["One Size M-XL"]),
      moq: 40,
      leadTimeDays: 10,
      stockQuantity: 320,
      basePrice: 165,
      images: JSON.stringify(["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 40, maxQuantity: 150, pricePerPiece: 165 },
        { minQuantity: 151, maxQuantity: null, pricePerPiece: 150 },
      ],
    },

    // Factory 4: Delta
    {
      factoryId: f4.id,
      categoryId: catHoodies.id,
      nameAr: "هودي أوفر سايز ميلتون 3 فتلة قطن مبطن بوبرة",
      descriptionAr: "هودي كابيشو ثقيل بجيب كانغرو، قماش ميلتون مصري ممشط ومبطن بفرو ناعم دافئ جداً. القصة القياسية للبراندات العالمية.",
      fabric: "قطن 80% بوليستر 20% مبطن",
      gsm: 350,
      colors: JSON.stringify(["أسود كربوني", "كحلي داكن", "بيج ترابي", "عنابي"]),
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 7,
      stockQuantity: 850,
      basePrice: 175,
      images: JSON.stringify(["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 175 },
        { minQuantity: 200, maxQuantity: 499, pricePerPiece: 160 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 145 },
      ],
    },
    {
      factoryId: f4.id,
      categoryId: catPants.id,
      nameAr: "بنطلون سويت بانتس قطن ميلتون بأساور ريب",
      descriptionAr: "بنطلون رياضي مبطن بجيوب بسوستة مخفية وأساور كاحل مطاطية مريحة.",
      fabric: "ميلتون قطن 320 GSM",
      gsm: 320,
      colors: JSON.stringify(["أسود", "رمادي ملانج", "كحلي"]),
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 6,
      stockQuantity: 600,
      basePrice: 135,
      images: JSON.stringify(["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 135 },
        { minQuantity: 200, maxQuantity: null, pricePerPiece: 120 },
      ],
    },
    {
      factoryId: f4.id,
      categoryId: catHoodies.id,
      nameAr: "هودي بسوستة كاملة Full-Zip قطن ثقيل",
      descriptionAr: "جاكيت هودي بسوستة معدنية قوية وقبعة مبطنة ومزدوجة، مناسب للإطلالات الكاجوال اليومية.",
      fabric: "ميلتون قطن 340 GSM",
      gsm: 340,
      colors: JSON.stringify(["أسود", "زيتي", "رمادي"]),
      sizes: JSON.stringify(["L", "XL", "2XL"]),
      moq: 50,
      leadTimeDays: 7,
      stockQuantity: 400,
      basePrice: 195,
      images: JSON.stringify(["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 50, maxQuantity: 199, pricePerPiece: 195 },
        { minQuantity: 200, maxQuantity: null, pricePerPiece: 178 },
      ],
    },

    // Factory 5: Alex Socks
    {
      factoryId: f5.id,
      categoryId: catSocks.id,
      nameAr: "دزينة جوارب قطنية كلاسيكية للرجال (12 زوج)",
      descriptionAr: "جوارب بطول ربلة الساق قطن مصري 100% مع معالجة مضادة للبكتيريا والروائح، كعب وأصابع معززة.",
      fabric: "قطن مصري 85% بولياميد 12% إيلاستين 3%",
      gsm: 80,
      colors: JSON.stringify(["أبيض", "أسود", "كحلي", "رمادي"]),
      sizes: JSON.stringify(["مقاس موحد (40-45)"]),
      moq: 120, // 10 dozens
      leadTimeDays: 4,
      stockQuantity: 5000,
      basePrice: 18, // 18 EGP per pair
      images: JSON.stringify(["https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tiers: [
        { minQuantity: 120, maxQuantity: 599, pricePerPiece: 18 },
        { minQuantity: 600, maxQuantity: 1999, pricePerPiece: 15 },
        { minQuantity: 2000, maxQuantity: null, pricePerPiece: 12.5 },
      ],
    },
    {
      factoryId: f5.id,
      categoryId: catSocks.id,
      nameAr: "شرابات رياضية مضلعة سميكة مبطنة كوشن",
      descriptionAr: "جوارب رياضية كرو بدعم لقوس القدم وبطانة تيري سفلية لامتصاص الصدمات أثناء الجري والتمارين.",
      fabric: "قطن ممشط 80% إيلاستين 20%",
      gsm: 95,
      colors: JSON.stringify(["أبيض بخطوط سوداء", "أسود بخطوط بيضاء"]),
      sizes: JSON.stringify(["مقاس موحد"]),
      moq: 100,
      leadTimeDays: 4,
      stockQuantity: 3200,
      basePrice: 22,
      images: JSON.stringify(["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 100, maxQuantity: 499, pricePerPiece: 22 },
        { minQuantity: 500, maxQuantity: null, pricePerPiece: 18.5 },
      ],
    },
    {
      factoryId: f5.id,
      categoryId: catSocks.id,
      nameAr: "شرابات غير مرئية حريمي ورجالي سيليكون كعب",
      descriptionAr: "شرابات لوفر بدون ظهور مع شريط سيليكون مانع للانزلاق في الكعب، خفيفة ومسامية للحر الشديد.",
      fabric: "قطن رقيق 90% سباندكس 10%",
      gsm: 60,
      colors: JSON.stringify(["أبيض", "أسود", "بيج"]),
      sizes: JSON.stringify(["رجالي (40-44)", "حريمي (36-40)"]),
      moq: 120,
      leadTimeDays: 3,
      stockQuantity: 4000,
      basePrice: 14,
      images: JSON.stringify(["https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=80"]),
      isFeatured: false,
      tiers: [
        { minQuantity: 120, maxQuantity: 599, pricePerPiece: 14 },
        { minQuantity: 600, maxQuantity: null, pricePerPiece: 11.5 },
      ],
    },
  ];

  for (const item of productsData) {
    const { tiers, ...prod } = item;
    const createdProduct = await prisma.product.create({
      data: prod,
    });

    for (const tier of tiers) {
      await prisma.productPriceTier.create({
        data: {
          productId: createdProduct.id,
          minQuantity: tier.minQuantity,
          maxQuantity: tier.maxQuantity,
          pricePerPiece: tier.pricePerPiece,
        },
      });
    }
  }

  // 6. Realistic 8 RFQs Matching the Design Exactly + Rich Scenarios
  // RFQ 1 (From Screenshot): 100 قطعة تيشيرت قطن 100% بمقاسات متنوعة
  const rfq1 = await prisma.rfq.create({
    data: {
      buyerId: buyerUser1.id,
      categoryId: catTshirts.id,
      titleAr: "100 قطعة تيشيرت قطن 100% بمقاسات متنوعة",
      productType: "تيشيرت كرو نيك",
      totalQuantity: 100,
      fabricDetails: "قطن 100% سينجل جيرسي ممشط",
      gsm: 180,
      colors: "أبيض، أسود، كحلي",
      printingEmbroidery: "طباعة لوجو صغير على الصدر سلك سكرين مائي",
      targetBudgetPerPiece: 35,
      deadlineDays: 15,
      deadlineDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      sampleRequired: true,
      targetGovernorate: "القاهرة",
      notesAr: "مطلوب جودة تصدير مع خياطة مزدوجة نظيفة وشريط قطني داخلي للرقبة.",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (Matches screenshot)
    },
  });

  await prisma.rfqSizeBreakdown.createMany({
    data: [
      { rfqId: rfq1.id, size: "S", color: "أسود", quantity: 20 },
      { rfqId: rfq1.id, size: "M", color: "أسود", quantity: 30 },
      { rfqId: rfq1.id, size: "L", color: "كحلي", quantity: 30 },
      { rfqId: rfq1.id, size: "XL", color: "أبيض", quantity: 20 },
    ],
  });

  // Quotes for RFQ 1
  const quote1ForRfq1 = await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      factoryId: f1.id,
      unitPrice: 32,
      totalAmount: 3200,
      leadTimeDays: 12,
      samplePrice: 150,
      sampleLeadTimeDays: 3,
      minQuantity: 100,
      paymentTermsAr: "30% عربون مقدم، 70% عند الاستلام والفحص",
      notesAr: "جاهزون للبدء فور اعتماد العينة، خامات قطن المحلة مشط فاخر.",
      status: "PENDING",
    },
  });

  const quote2ForRfq1 = await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      factoryId: f2.id,
      unitPrice: 30,
      totalAmount: 3000,
      leadTimeDays: 10,
      samplePrice: 100,
      sampleLeadTimeDays: 2,
      minQuantity: 100,
      paymentTermsAr: "50% مقدم، 50% عند الشحن",
      notesAr: "الطباعة سلك سكرين بأحبار صديقة للبيئة لا تبهت.",
      status: "PENDING",
    },
  });

  // RFQ 2 (From Screenshot): 500 قطعة هودي بقلنسوة
  const rfq2 = await prisma.rfq.create({
    data: {
      buyerId: buyerUser2.id,
      categoryId: catHoodies.id,
      titleAr: "500 قطعة هودي بقلنسوة",
      productType: "هودي كابيشو",
      totalQuantity: 500,
      fabricDetails: "قطن ممزوج ميلتون 3 فتلة مبطن",
      gsm: 320,
      colors: "أسود، بيج، زيتي",
      printingEmbroidery: "تطريز بارز 3D على الصدر",
      targetBudgetPerPiece: 140,
      deadlineDays: 30,
      deadlineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sampleRequired: true,
      targetGovernorate: "الجيزة",
      notesAr: "القلنسوة يجب أن تكون مزدوجة البطانة مع رباط قطني عريض بنهايات معدنية.",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago (Matches screenshot)
    },
  });

  await prisma.quote.create({
    data: {
      rfqId: rfq2.id,
      factoryId: f4.id,
      unitPrice: 135,
      totalAmount: 67500,
      leadTimeDays: 21,
      samplePrice: 300,
      sampleLeadTimeDays: 4,
      minQuantity: 250,
      paymentTermsAr: "40% دفعة أولى، 60% عند التسليم",
      notesAr: "متوفر قماش ميلتون تركي قطن 3 فتلة ممتاز جداً للموديل.",
      status: "PENDING",
    },
  });

  // RFQ 3 (From Screenshot): 2000 زوج شرابات قطنية
  const rfq3 = await prisma.rfq.create({
    data: {
      buyerId: buyerUser2.id,
      categoryId: catSocks.id,
      titleAr: "2000 زوج شرابات قطنية",
      productType: "جوارب كاجوال قطن",
      totalQuantity: 2000,
      fabricDetails: "قطن مصري 85% مع سباندكس",
      gsm: 85,
      colors: "أبيض، رمادي، أسود",
      printingEmbroidery: "حياكة لوجو جاكار في النسيج",
      targetBudgetPerPiece: 15,
      deadlineDays: 20,
      deadlineDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      sampleRequired: false,
      targetGovernorate: "الشرقية",
      notesAr: "تغليف كل 3 أزواج في علبة كرتون مطبوعة بشعار المتجر.",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago (Matches screenshot)
    },
  });

  await prisma.quote.create({
    data: {
      rfqId: rfq3.id,
      factoryId: f5.id,
      unitPrice: 12.5,
      totalAmount: 25000,
      leadTimeDays: 14,
      samplePrice: 0,
      sampleLeadTimeDays: 0,
      minQuantity: 1000,
      paymentTermsAr: "50% مقدم، 50% قبل الشحن",
      notesAr: "شامل التغليف والعلب الكرتونية المخصصة.",
      status: "PENDING",
    },
  });

  // RFQ 4: Accepted Quote & Active Order Simulation
  const rfq4 = await prisma.rfq.create({
    data: {
      buyerId: buyerUser1.id,
      categoryId: catTshirts.id,
      titleAr: "300 قطعة تيشيرت بولو بيكيه مطرز للشركات",
      productType: "بولو بيكيه",
      totalQuantity: 300,
      fabricDetails: "بيكيه قطن 100% 220 GSM",
      gsm: 220,
      colors: "كحلي موحد",
      printingEmbroidery: "تطريز لوجو الشركة على الصدر والكم",
      targetBudgetPerPiece: 85,
      deadlineDays: 18,
      sampleRequired: true,
      targetGovernorate: "القاهرة",
      notesAr: "طلب عاجل لزي الموظفين في معرض سنوي.",
      status: "QUOTE_ACCEPTED",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const quoteAcceptedRfq4 = await prisma.quote.create({
    data: {
      rfqId: rfq4.id,
      factoryId: f1.id,
      unitPrice: 78,
      totalAmount: 23400,
      leadTimeDays: 12,
      samplePrice: 200,
      sampleLeadTimeDays: 3,
      minQuantity: 200,
      paymentTermsAr: "50% دفعة أولى، 50% بعد الفحص والاستلام",
      notesAr: "عينة التطريز تمت الموافقة عليها وجاري القص.",
      status: "ACCEPTED",
    },
  });

  await prisma.rfq.update({
    where: { id: rfq4.id },
    data: { acceptedQuoteId: quoteAcceptedRfq4.id },
  });

  // Create Order for RFQ 4
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-00101",
      rfqId: rfq4.id,
      quoteId: quoteAcceptedRfq4.id,
      buyerId: buyerUser1.id,
      factoryId: f1.id,
      totalAmount: 23400,
      quantity: 300,
      unitPrice: 78,
      paymentTerms: "50% دفعة أولى، 50% بعد الفحص والاستلام",
      status: "IN_PRODUCTION",
      agreedDeliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Milestones for Order 1
  const milestones = [
    { step: "SAMPLE", titleAr: "إعداد عينة ما قبل الإنتاج", status: "COMPLETED", completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), notes: "تم إرسال العينة عبر مندوب المصنع" },
    { step: "SAMPLE_APPROVAL", titleAr: "موافقة العميل على العينة", status: "COMPLETED", completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), notes: "تم اعتماد درجات الألوان والتطريز بالكامل" },
    { step: "PRODUCTION", titleAr: "الإنتاج الفعلي والتشغيل", status: "IN_PROGRESS", completedAt: null, notes: "تم قص القماش وجاري الحياكة على خط الإنتاج رقم 2" },
    { step: "READY", titleAr: "جاهزية الشحنة والفرز النهائي", status: "PENDING", completedAt: null, notes: null },
    { step: "SHIPPED", titleAr: "الشحن وتسليم المندوب", status: "PENDING", completedAt: null, notes: null },
    { step: "DELIVERED", titleAr: "الاستلام النهائي والفحص", status: "PENDING", completedAt: null, notes: null },
  ];

  for (const ms of milestones) {
    await prisma.orderMilestone.create({
      data: {
        orderId: order1.id,
        step: ms.step,
        titleAr: ms.titleAr,
        status: ms.status,
        completedAt: ms.completedAt,
        notes: ms.notes,
      },
    });
  }

  // Conversation for Order 1
  const conv1 = await prisma.conversation.create({
    data: {
      rfqId: rfq4.id,
      orderId: order1.id,
      quoteId: quoteAcceptedRfq4.id,
      buyerId: buyerUser1.id,
      factoryId: f1.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: buyerUser1.id,
      content: "السلام عليكم م. إبراهيم، العينة ممتازة جداً وتم اعتمادها، في انتظار بدء التشغيل.",
      containsContactInfo: false,
      isMasked: false,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv1.id,
      senderId: factoryUser1.id,
      content: "وعليكم السلام أ. أحمد، بدأنا القص اليوم وبإذن الله الشحنة جاهزة قبل الموعد بيومين.",
      containsContactInfo: false,
      isMasked: false,
    },
  });

  // More RFQs (5 to 8)
  await prisma.rfq.create({
    data: {
      buyerId: buyerUser2.id,
      categoryId: catFabrics.id,
      titleAr: "1500 قطعة بيجامات تريكو شتوية إنترلوك أطفال",
      productType: "بيجامة أطفال قطن",
      totalQuantity: 1500,
      fabricDetails: "إنترلوك قطن 100% ناعم 240 GSM",
      gsm: 240,
      colors: "رسومات وطباعات ديزني متنوعة",
      targetBudgetPerPiece: 90,
      deadlineDays: 25,
      targetGovernorate: "الغربية",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.rfq.create({
    data: {
      buyerId: buyerUser1.id,
      categoryId: catPants.id,
      titleAr: "800 قطعة بنطلون سويت بانتس قطن ميلتون مبطن",
      productType: "سويت بانتس رجالي",
      totalQuantity: 800,
      fabricDetails: "ميلتون قطن 300 GSM",
      gsm: 300,
      colors: "أسود، كحلي، رصاصي غامق",
      targetBudgetPerPiece: 110,
      deadlineDays: 20,
      targetGovernorate: "القاهرة",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.rfq.create({
    data: {
      buyerId: buyerUser1.id,
      categoryId: catHoodies.id,
      titleAr: "250 قطعة سويت شيرت أوفر سايز بطباعة سلك سكرين",
      productType: "سويت شيرت أوفر سايز",
      totalQuantity: 250,
      fabricDetails: "فرنش تيري قطن 100% 280 GSM",
      gsm: 280,
      colors: "أوف وايت، بني شوكولاتة",
      targetBudgetPerPiece: 130,
      deadlineDays: 14,
      targetGovernorate: "بني سويف",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.rfq.create({
    data: {
      buyerId: buyerUser2.id,
      categoryId: catSocks.id,
      titleAr: "5000 زوج جوارب رياضية ضاغطة بشعار مخصص",
      productType: "شرابات رياضية",
      totalQuantity: 5000,
      fabricDetails: "قطن ممشط وسباندكس إيطالي",
      gsm: 90,
      colors: "أبيض، أسود",
      targetBudgetPerPiece: 11,
      deadlineDays: 25,
      targetGovernorate: "الدقهلية",
      status: "OPEN",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 7. Factory Documents for KYC
  await prisma.factoryDocument.createMany({
    data: [
      {
        factoryId: f1.id,
        type: "COMMERCIAL_REGISTER",
        fileName: "السجل_التجاري_مصنع_النصر.pdf",
        fileUrl: "https://example.com/docs/cr_nasr.pdf",
        status: "APPROVED",
      },
      {
        factoryId: f1.id,
        type: "TAX_CARD",
        fileName: "البطاقة_الضريبية_النصر.pdf",
        fileUrl: "https://example.com/docs/tax_nasr.pdf",
        status: "APPROVED",
      },
      {
        factoryId: f2.id,
        type: "COMMERCIAL_REGISTER",
        fileName: "السجل_التجاري_مصنع_الأمل.pdf",
        fileUrl: "https://example.com/docs/cr_amal.pdf",
        status: "APPROVED",
      },
    ],
  });

  // 8. Reviews
  await prisma.review.create({
    data: {
      orderId: order1.id,
      authorId: buyerUser1.id,
      factoryId: f1.id,
      rating: 5,
      commentAr: "مصنع النصر قمة في الالتزام والاحترافية. التيشيرتات والبولو خاماتها ممتازة جداً وأفضل من المتوقع، والتسليم في الموعد المحدد بالضبط.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.review.create({
    data: {
      orderId: order1.id,
      authorId: buyerUser2.id,
      factoryId: f2.id,
      rating: 5,
      commentAr: "تعاملنا مع مصنع الأمل في دفعة تيشيرتات ترويجية مطبوعة 1000 قطعة، جودة الطباعة السلك سكرين عالية والخياطة نظيفة جداً.",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("👤 Admin: admin@texlink-egypt.com / 123456");
  console.log("👤 Buyer 1: buyer1@cairo-apparel.com / 123456");
  console.log("👤 Factory 1: elnasr@mahalla-textile.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
