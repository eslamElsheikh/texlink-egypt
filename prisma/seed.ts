import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting TexLink Egypt database seed...");

  // Clean up existing data in correct relational order
  await prisma.crmActivity.deleteMany();
  await prisma.crmFollowUp.deleteMany();
  await prisma.crmDeal.deleteMany();
  await prisma.crmLead.deleteMany();
  await prisma.crmCustomer.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.productionCost.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.factoryPurchaseItem.deleteMany();
  await prisma.factoryPurchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.materialConsumption.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.productionEntry.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.factoryProduct.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.factorySettings.deleteMany();
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

  // ==========================================
  // 9. FACTORY OS ERP OPERATIONAL SEED (El Nasr Tricot)
  // ==========================================
  console.log("🏭 Seeding Factory OS ERP data for El Nasr Tricot...");

  // 9.1 Factory Settings
  await prisma.factorySettings.create({
    data: {
      factoryId: f1.id,
      usageMode: "FULL_ACCESS",
      marketplaceEnabled: true,
      autoMatchEnabled: true,
      lowStockAlertThreshold: 50,
      workingHoursPerShift: 8.0,
      currency: "EGP",
      traceabilityEnabled: true,
    },
  });

  // 9.2 Warehouses
  const whYarn = await prisma.warehouse.create({
    data: {
      factoryId: f1.id,
      name: "مخزن الغزول والخامات الرئيسي",
      location: "العنبر A - الطابق الأرضي",
      type: "RAW_MATERIALS",
    },
  });

  const whFinished = await prisma.warehouse.create({
    data: {
      factoryId: f1.id,
      name: "مخزن المنتجات التامة والجاهزة",
      location: "العنبر C - بوابة الشحن",
      type: "FINISHED_GOODS",
    },
  });

  const whParts = await prisma.warehouse.create({
    data: {
      factoryId: f1.id,
      name: "مخزن قطع الغيار ومستلزمات الإنتاج",
      location: "مبنى الصيانة المركزي",
      type: "SPARE_PARTS",
    },
  });

  // 9.3 Inventory Items
  const itemYarn30 = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whYarn.id,
      name: "خيوط قطن مصري 30/1 مشط",
      sku: "YRN-COT-301",
      batchNumber: "B-2026-Y01",
      category: "YARN",
      unit: "KG",
      currentStock: 500.0,
      minimumStock: 200.0,
      unitCost: 180.0,
      totalValuation: 500.0 * 180.0,
    },
  });

  const itemYarnPoly = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whYarn.id,
      name: "خيوط بوليستر 150/48 تكسرات",
      sku: "YRN-PLY-150",
      batchNumber: "B-2026-P04",
      category: "YARN",
      unit: "KG",
      currentStock: 320.0,
      minimumStock: 150.0,
      unitCost: 95.0,
      totalValuation: 320.0 * 95.0,
    },
  });

  const itemFabricJersey = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whYarn.id,
      name: "قماش سينجل جيرسي قطن 100% عرض 185سم",
      sku: "FAB-SJR-185",
      batchNumber: "B-2026-F11",
      category: "FABRIC",
      unit: "METERS",
      currentStock: 1200.0,
      minimumStock: 1500.0, // Trigger low stock indicator
      unitCost: 140.0,
      totalValuation: 1200.0 * 140.0,
    },
  });

  const itemFabricMilton = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whYarn.id,
      name: "قماش ميلتون شتوي مبطن 3 فتلة 320 جم",
      sku: "FAB-MLT-320",
      batchNumber: "B-2026-F08",
      category: "FABRIC",
      unit: "METERS",
      currentStock: 850.0,
      minimumStock: 400.0,
      unitCost: 220.0,
      totalValuation: 850.0 * 220.0,
    },
  });

  const itemNeedles = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whParts.id,
      name: "إبر ماكينات تريكو ماير آند سي أصلية Vo-Spe-71.60",
      sku: "SP-NDL-MYR",
      category: "NEEDLES",
      unit: "PIECES",
      currentStock: 450.0,
      minimumStock: 100.0,
      unitCost: 35.0,
      totalValuation: 450.0 * 35.0,
    },
  });

  const itemThread = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whParts.id,
      name: "خيوط خياطة سنجر وأوفرلوك 40/2 أبيض وأسود",
      sku: "ACC-THR-402",
      category: "ACCESSORIES",
      unit: "BOXES",
      currentStock: 80.0,
      minimumStock: 30.0,
      unitCost: 45.0,
      totalValuation: 80.0 * 45.0,
    },
  });

  const itemPolyBags = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whFinished.id,
      name: "أكياس تعبئة بولي بروبلين شفافة لاصق ذاتي",
      sku: "PKG-BAG-01",
      category: "PACKAGING",
      unit: "PIECES",
      currentStock: 4500.0,
      minimumStock: 1000.0,
      unitCost: 2.5,
      totalValuation: 4500.0 * 2.5,
    },
  });

  const itemCartons = await prisma.inventoryItem.create({
    data: {
      factoryId: f1.id,
      warehouseId: whFinished.id,
      name: "كراتين تصدير مقوى 5 طبقات 60×40×40",
      sku: "PKG-CRT-05",
      category: "PACKAGING",
      unit: "BOXES",
      currentStock: 350.0,
      minimumStock: 100.0,
      unitCost: 28.0,
      totalValuation: 350.0 * 28.0,
    },
  });

  // Initial Stock Movements
  await prisma.stockMovement.createMany({
    data: [
      {
        factoryId: f1.id,
        inventoryItemId: itemYarn30.id,
        movementType: "PURCHASE_IN",
        quantity: 500.0,
        previousStock: 0.0,
        newStock: 500.0,
        unitCost: 180.0,
        toWarehouseId: whYarn.id,
        notes: "رصيد افتتاحي من توريد شركة الدلتا للغزل",
      },
      {
        factoryId: f1.id,
        inventoryItemId: itemYarnPoly.id,
        movementType: "PURCHASE_IN",
        quantity: 320.0,
        previousStock: 0.0,
        newStock: 320.0,
        unitCost: 95.0,
        toWarehouseId: whYarn.id,
        notes: "رصيد افتتاحي توريد خيوط بوليستر",
      },
      {
        factoryId: f1.id,
        inventoryItemId: itemFabricJersey.id,
        movementType: "PURCHASE_IN",
        quantity: 1200.0,
        previousStock: 0.0,
        newStock: 1200.0,
        unitCost: 140.0,
        toWarehouseId: whYarn.id,
        notes: "رصيد افتتاحي للأقمشة المحاكة داخلياً",
      },
    ],
  });

  // 9.4 15 Machines (Matching Image #2: 12 RUNNING, 2 STOPPED, 1 UNDER_MAINTENANCE)
  const machinesData = [
    { code: "M-TRICOT-01", name: "ماكينة تريكو دائري ماير آند سي 30 بوصة", type: "CIRCULAR_KNITTING", brand: "Mayer & Cie", model: "Relanit 3.2 II", status: "RUNNING", hourlyOperatingCost: 120 },
    { code: "M-TRICOT-02", name: "ماكينة تريكو دائري ماير آند سي 34 بوصة", type: "CIRCULAR_KNITTING", brand: "Mayer & Cie", model: "MV 4-3.2 II", status: "RUNNING", hourlyOperatingCost: 135 },
    { code: "M-TRICOT-03", name: "ماكينة تريكو دائري تيروت ألماني 30 بوصة", type: "CIRCULAR_KNITTING", brand: "Terrot", model: "S296-1", status: "UNDER_MAINTENANCE", hourlyOperatingCost: 110, notes: "كسر إبر في السلندر 4" },
    { code: "M-TRICOT-04", name: "ماكينة تريكو دائري بايلوت إيطالي 28 بوصة", type: "CIRCULAR_KNITTING", brand: "Pilotelli", model: "JVCE-3", status: "RUNNING", hourlyOperatingCost: 95 },
    { code: "M-SEW-01", name: "ماكينة أوفرلوك 4 فتلة جوكي ياباني", type: "OVERLOCK", brand: "Juki", model: "MO-6814S", status: "RUNNING", hourlyOperatingCost: 25 },
    { code: "M-SEW-02", name: "ماكينة أوفرلوك 5 فتلة سيلفرستار", type: "OVERLOCK", brand: "Siruba", model: "757K", status: "RUNNING", hourlyOperatingCost: 28 },
    { code: "M-SEW-03", name: "ماكينة سنجر 1 إبرة ديجيتال أوتوماتيك", type: "SEWING_SINGER", brand: "Juki", model: "DDL-9000C", status: "RUNNING", hourlyOperatingCost: 20 },
    { code: "M-SEW-04", name: "ماكينة سنجر خياطة إلكترونية براذر", type: "SEWING_SINGER", brand: "Brother", model: "S-7300A", status: "STOPPED", hourlyOperatingCost: 22, notes: "صيانة وقائية دورية" },
    { code: "M-SEW-05", name: "ماكينة أورليه 3 إبرة تغطية جوكي", type: "SEWING_SINGER", brand: "Juki", model: "MF-7923", status: "RUNNING", hourlyOperatingCost: 30 },
    { code: "M-SEW-06", name: "ماكينة عراوي وأزرار إلكترونية جوكي", type: "SEWING_SINGER", brand: "Juki", model: "LBH-1790A", status: "RUNNING", hourlyOperatingCost: 35 },
    { code: "M-CUT-01", name: "مقص شريط أوتوماتيك هيدروليك عالي السرعة", type: "CUTTING_LASER", brand: "Eastman", model: "Pacemaker", status: "RUNNING", hourlyOperatingCost: 55 },
    { code: "M-CUT-02", name: "طاولة قص ليزر صناعي نسيج 10 أمتار", type: "CUTTING_LASER", brand: "Lectra", model: "Vector Fashion", status: "RUNNING", hourlyOperatingCost: 150 },
    { code: "M-PRESS-01", name: "مكبس بخار مستمر مانيكان تشطيب نهائي", type: "IRONING", brand: "Veit", model: "Varioset", status: "RUNNING", hourlyOperatingCost: 65 },
    { code: "M-PRESS-02", name: "طاولة مكواة بخار صناعية مع شفط وتفريغ", type: "IRONING", brand: "Stirovap", model: "Model 200", status: "STOPPED", hourlyOperatingCost: 40, notes: "تغيير خرطوم الضغط العالي" },
    { code: "M-EMB-01", name: "ماكينة تطريز كمبيوتر تاجيما 12 رأس", type: "EMBROIDERY", brand: "Tajima", model: "TMAR-KC1208", status: "RUNNING", hourlyOperatingCost: 180 },
  ];

  const createdMachines = await Promise.all(
    machinesData.map((m) =>
      prisma.machine.create({
        data: {
          factoryId: f1.id,
          code: m.code,
          name: m.name,
          type: m.type,
          brand: m.brand,
          model: m.model,
          status: m.status,
          hourlyOperatingCost: m.hourlyOperatingCost,
          notes: m.notes,
          lastMaintenanceDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        },
      })
    )
  );

  const machineTricot3 = createdMachines.find((m) => m.code === "M-TRICOT-03")!;
  const machineSew4 = createdMachines.find((m) => m.code === "M-SEW-04")!;
  const machinePress2 = createdMachines.find((m) => m.code === "M-PRESS-02")!;

  // 9.5 Maintenance Tickets
  await prisma.maintenanceTicket.create({
    data: {
      factoryId: f1.id,
      machineId: machineTricot3.id,
      issueType: "NEEDLE_BREAKAGE",
      priority: "HIGH",
      description: "كسر إبر متكرر في السلندر 4 وسخونة محرك الدوران",
      status: "IN_PROGRESS",
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      downtimeMinutes: 180,
      sparePartsUsed: "12 إبرة ماير + زيت تشحيم سينثيتك",
      laborCost: 200.0,
      sparePartsCost: 420.0,
      totalCost: 620.0,
    },
  });

  await prisma.maintenanceTicket.create({
    data: {
      factoryId: f1.id,
      machineId: machineSew4.id,
      issueType: "SCHEDULED_PREVENTIVE",
      priority: "MEDIUM",
      description: "صيانة وقائية دورية وتنظيف بيت المكوك وضبط الشد",
      status: "OPEN",
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      downtimeMinutes: 60,
    },
  });

  await prisma.maintenanceTicket.create({
    data: {
      factoryId: f1.id,
      machineId: machinePress2.id,
      issueType: "CALIBRATION",
      priority: "LOW",
      description: "استبدال خرطوم البخار ومعايرة ضغط الثرموستات",
      status: "RESOLVED",
      startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 46 * 60 * 60 * 1000),
      downtimeMinutes: 120,
      sparePartsUsed: "خرطوم تفلون مقوى 3 أمتار",
      laborCost: 150.0,
      sparePartsCost: 350.0,
      totalCost: 500.0,
      resolvedBy: "طارق إبراهيم الدسوقي",
    },
  });

  // 9.6 Shifts & Employees
  const shiftMorning = await prisma.shift.create({
    data: {
      factoryId: f1.id,
      name: "وردية صباحية",
      startTime: "08:00",
      endTime: "16:00",
      hours: 8.0,
    },
  });

  const shiftEvening = await prisma.shift.create({
    data: {
      factoryId: f1.id,
      name: "وردية مسائية",
      startTime: "16:00",
      endTime: "00:00",
      hours: 8.0,
    },
  });

  const shiftNight = await prisma.shift.create({
    data: {
      factoryId: f1.id,
      name: "وردية ليلية",
      startTime: "00:00",
      endTime: "08:00",
      hours: 8.0,
    },
  });

  const employeesData = [
    { code: "EMP-01", name: "أحمد محمود علي", jobTitle: "مشرف عام صالة التريكو", salary: 8500 },
    { code: "EMP-02", name: "طارق إبراهيم الدسوقي", jobTitle: "فني ميكانيكا وصيانة ماكينات", salary: 7800 },
    { code: "EMP-03", name: "السيد عبد العزيز رجب", jobTitle: "مشغل ماكينات تريكو دائري", salary: 5500 },
    { code: "EMP-04", name: "كريم محمد الشناوي", jobTitle: "مشغل ماكينات تريكو دائري", salary: 5300 },
    { code: "EMP-05", name: "فاطمة حسن النجار", jobTitle: "فنية خياطة وسنجر رئيسية", salary: 5000 },
    { code: "EMP-06", name: "هدى مصطفى البنا", jobTitle: "فنية أوفرلوك وتجميع ملابس", salary: 4900 },
    { code: "EMP-07", name: "محمود جلال الصياد", jobTitle: "مقصدار أول وفني باترون", salary: 6500 },
    { code: "EMP-08", name: "عصام عبد المنعم سيف", jobTitle: "مراقب جودة وتشطيب نهائي", salary: 6000 },
    { code: "EMP-09", name: "عماد فوزي الغرباوي", jobTitle: "أمين مخزن الغزول والخامات", salary: 5200 },
    { code: "EMP-10", name: "مروة سامي الشامي", jobTitle: "مشرفة خط التعبئة والتغليف", salary: 4600 },
  ];

  const createdEmployees = await Promise.all(
    employeesData.map((e) =>
      prisma.employee.create({
        data: {
          factoryId: f1.id,
          code: e.code,
          name: e.name,
          jobTitle: e.jobTitle,
          monthlySalary: e.salary,
          paymentType: "MONTHLY",
          hiringDate: new Date("2023-01-15"),
        },
      })
    )
  );

  // Attendance sample
  for (const emp of createdEmployees.slice(0, 5)) {
    await prisma.attendanceRecord.create({
      data: {
        factoryId: f1.id,
        employeeId: emp.id,
        shiftId: shiftMorning.id,
        date: new Date(),
        checkIn: "07:55",
        checkOut: "16:05",
        status: "PRESENT",
      },
    });
  }

  // 9.7 Suppliers
  const supDelta = await prisma.supplier.create({
    data: {
      factoryId: f1.id,
      name: "شركة الدلتا للغزل والنسيج",
      category: "YARN",
      contactPerson: "أ. مدحت الشناوي",
      phone: "01011223344",
      address: "المنطقة الصناعية الأولى، المحلة الكبرى",
      outstandingBalance: 45000,
    },
  });

  await prisma.supplier.create({
    data: {
      factoryId: f1.id,
      name: "مؤسسة الأهرام للكرتون ومواد التعبئة",
      category: "PACKAGING",
      contactPerson: "م. حسام بدر",
      phone: "01544556677",
      address: "المنطقة الصناعية B3، العاشر من رمضان",
      outstandingBalance: 12000,
    },
  });

  // 9.8 Internal Factory Products
  const prodPolo = await prisma.factoryProduct.create({
    data: {
      factoryId: f1.id,
      code: "PRD-POLO-01",
      name: "تيشيرت بولو رجالي كلاسيك بيكيه",
      category: "POLO",
      fabricType: "بيكيه قطن 100% مشط 220 جم",
      gsm: 220,
      sizes: JSON.stringify(["M", "L", "XL", "2XL"]),
      colors: JSON.stringify(["كحلي", "أبيض", "أسود", "رمادي"]),
      estimatedCost: 110.0,
      standardPrice: 175.0,
      isPublishedToMarketplace: true,
    },
  });

  const prodHoodie = await prisma.factoryProduct.create({
    data: {
      factoryId: f1.id,
      code: "PRD-HOD-02",
      name: "هودي شتوي ميلتون مبطن أوفر سايز",
      category: "HOODIE",
      fabricType: "ميلتون شتوي مبطن 3 فتلة 340 جم",
      gsm: 340,
      sizes: JSON.stringify(["L", "XL", "2XL"]),
      colors: JSON.stringify(["أسود", "زيتي", "بيج"]),
      estimatedCost: 210.0,
      standardPrice: 320.0,
      isPublishedToMarketplace: true,
    },
  });

  const prodCrew = await prisma.factoryProduct.create({
    data: {
      factoryId: f1.id,
      code: "PRD-TSH-03",
      name: "تيشيرت كرو نيك قطن سوبر سينجل جيرسي",
      category: "TSHIRT",
      fabricType: "سينجل جيرسي قطن مصري 100% 180 جم",
      gsm: 180,
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify(["أبيض", "أسود", "مارون"]),
      estimatedCost: 65.0,
      standardPrice: 115.0,
      isPublishedToMarketplace: false,
    },
  });

  // 9.9 Production Orders (Matching Image #2 Bottom Table)
  const order1025 = await prisma.productionOrder.create({
    data: {
      factoryId: f1.id,
      orderNumber: "ORD-1025",
      batchNumber: "BATCH-2026-1025",
      productId: prodPolo.id,
      productNameSnapshot: "تيشيرت بولو رجالي كلاسيك بيكيه",
      targetQuantity: 5000,
      plannedStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      priority: "HIGH",
      status: "IN_PROGRESS",
      notes: "دفعة تصديرية لمجموعة المتاجر الحديثة",
    },
  });

  const order1024 = await prisma.productionOrder.create({
    data: {
      factoryId: f1.id,
      orderNumber: "ORD-1024",
      batchNumber: "BATCH-2026-1024",
      productId: prodHoodie.id,
      productNameSnapshot: "هودي شتوي ميلتون مبطن أوفر سايز",
      targetQuantity: 2000,
      plannedStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actualStartDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      actualEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "COMPLETED",
      notes: "تم الفحص النهائي والاعتماد للتسليم",
    },
  });

  const order1023 = await prisma.productionOrder.create({
    data: {
      factoryId: f1.id,
      orderNumber: "ORD-1023",
      batchNumber: "BATCH-2026-1023",
      productId: prodCrew.id,
      productNameSnapshot: "تيشيرت كرو نيك قطن سوبر سينجل جيرسي",
      targetQuantity: 3000,
      plannedStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      plannedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: "MEDIUM",
      status: "PLANNED",
      notes: "في مرحلة تجهيز الغزول والصباغة",
    },
  });

  // 9.10 Production Entries & Daily Logs (Creating total 85,420 total, 82,300 good, 3,120 waste)
  // Order 1024: Completed 2,000 units (1,930 good, 70 defective)
  const entry1024 = await prisma.productionEntry.create({
    data: {
      factoryId: f1.id,
      productionOrderId: order1024.id,
      machineId: createdMachines[0].id,
      employeeId: createdEmployees[2].id,
      shiftId: shiftMorning.id,
      stage: "FINISHING",
      productionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      producedQuantity: 2000,
      goodQuantity: 1930,
      defectiveQuantity: 70,
      notes: "تشطيب نهائي واستلام المخازن",
    },
  });

  await prisma.wasteRecord.create({
    data: {
      factoryId: f1.id,
      productionOrderId: order1024.id,
      productionEntryId: entry1024.id,
      machineId: createdMachines[0].id,
      stage: "FINISHING",
      defectType: "SEWING_DEFECT",
      quantity: 70,
      reworkQuantity: 45,
      reworkAccepted: 40,
      scrappedQuantity: 25,
      estimatedCost: 70 * 45,
      notes: "عيوب خياطة وتنسيل في الجيوب تم معالجة 40 قطعة منها",
    },
  });

  // Order 1025: Current running order, logs over past 7 days matching Image #2 chart
  // We seed 7 daily production logs for the past week
  const pastDays = [6, 5, 4, 3, 2, 1, 0];
  const dailyData = [
    { total: 11800, good: 11400, defect: 400, dayAr: "السبت" },
    { total: 12500, good: 12050, defect: 450, dayAr: "الأحد" },
    { total: 13200, good: 12720, defect: 480, dayAr: "الإثنين" },
    { total: 11900, good: 11500, defect: 400, dayAr: "الثلاثاء" },
    { total: 12800, good: 12350, defect: 450, dayAr: "الأربعاء" },
    { total: 11720, good: 11300, defect: 420, dayAr: "الخميس" },
    { total: 11500, good: 11050, defect: 450, dayAr: "الجمعة" },
  ];

  for (let i = 0; i < pastDays.length; i++) {
    const d = pastDays[i];
    const info = dailyData[i];
    const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000);

    const pe = await prisma.productionEntry.create({
      data: {
        factoryId: f1.id,
        productionOrderId: order1025.id,
        machineId: createdMachines[i % createdMachines.length].id,
        employeeId: createdEmployees[i % createdEmployees.length].id,
        shiftId: i % 2 === 0 ? shiftMorning.id : shiftEvening.id,
        stage: "KNITTING",
        productionDate: date,
        producedQuantity: info.total,
        goodQuantity: info.good,
        defectiveQuantity: info.defect,
        notes: `إنتاج يوم ${info.dayAr} صالة التريكو`,
      },
    });

    await prisma.wasteRecord.create({
      data: {
        factoryId: f1.id,
        productionOrderId: order1025.id,
        productionEntryId: pe.id,
        machineId: createdMachines[i % createdMachines.length].id,
        stage: "KNITTING",
        defectType: i % 2 === 0 ? "BROKEN_NEEDLE" : "KNITTING_DEFECT",
        quantity: info.defect,
        reworkQuantity: Math.floor(info.defect * 0.6),
        reworkAccepted: Math.floor(info.defect * 0.5),
        scrappedQuantity: info.defect - Math.floor(info.defect * 0.5),
        estimatedCost: info.defect * 35,
        notes: `هالك ناتج عن إبر أو عقد في الخيط يوم ${info.dayAr}`,
      },
    });
  }

  // 9.11 Production Cost Engine sample for completed order 1024
  await prisma.productionCost.create({
    data: {
      factoryId: f1.id,
      productionOrderId: order1024.id,
      materialCost: 220000.0,
      directLaborCost: 45000.0,
      machineCost: 35000.0,
      maintenanceCost: 6500.0,
      overheadCost: 22000.0,
      totalCost: 328500.0,
      goodUnitsCount: 1930,
      costPerGoodUnit: Math.round((328500.0 / 1930) * 100) / 100, // ~170.21 EGP
    },
  });

  // 9.12 Expenses sample
  await prisma.expense.createMany({
    data: [
      {
        factoryId: f1.id,
        category: "ELECTRICITY",
        amount: 28500.0,
        paymentMethod: "BANK_TRANSFER",
        description: "فاتورة كهرباء المنطقة الصناعية - المحلة الكبرى لشهر يناير",
      },
      {
        factoryId: f1.id,
        category: "SPARE_PARTS",
        amount: 6200.0,
        paymentMethod: "CASH",
        relatedMachineId: machineTricot3.id,
        description: "شراء إبر وسلندر احتياطي لماكينة تريكو ماير",
      },
      {
        factoryId: f1.id,
        category: "LABOR",
        amount: 58000.0,
        paymentMethod: "CASH",
        description: "دفعة أجور عمالة الوردية الصباحية ومكافآت التميز",
      },
    ],
  });

  // 9.13 Quality Inspection sample
  await prisma.qualityInspection.create({
    data: {
      factoryId: f1.id,
      productionOrderId: order1024.id,
      stage: "FINISHING",
      inspectedQuantity: 2000,
      acceptedQuantity: 1930,
      rejectedQuantity: 70,
      reworkQuantity: 45,
      defectReasons: "عيوب خياطة وتنسيل تم تدارك أغلبها في مرحلة إعادة التشغيل",
      status: "PASSED",
      inspectorName: "عصام عبد المنعم سيف",
    },
  });
  // ==========================================
  // 10. CRM WORKSPACE OPERATIONAL SEED (El Nasr Tricot)
  // ==========================================
  console.log("👥 Seeding CRM Workspace data for El Nasr Tricot...");

  // 10.1 CRM Customers (Linked to Marketplace Buyers & Direct)
  const crmCustomerCairo = await prisma.crmCustomer.create({
    data: {
      factoryId: f1.id,
      buyerId: buyerUser1.id, // Linked to Marketplace Buyer!
      name: "أ. طارق الشاذلي",
      companyName: "شركة القاهرة للملابس الجاهزة والبراندات",
      email: "buyer1@cairo-apparel.com",
      phone: "01012345678",
      whatsapp: "01012345678",
      governorate: "القاهرة",
      city: "مدينة نصر - المنطقة الحرة",
      address: "شارع مكرم عبيد، مبنى العبور التجاري",
      source: "MARKETPLACE",
      status: "ACTIVE",
      tags: JSON.stringify(["عميل مميز", "سوق B2B", "تيشيرتات وبولو"]),
      totalSpend: 185400.0,
      ordersCount: 4,
      notes: "عميل استراتيجي لإنتاج خطوط التيشيرتات والبولو للبراندات الشبابية، دفعات منتظمة وسداد فوري.",
    },
  });

  const crmCustomerAlex = await prisma.crmCustomer.create({
    data: {
      factoryId: f1.id,
      buyerId: buyerUser2.id, // Linked to Marketplace Wholesaler!
      name: "حاج عادل الشرقاوي",
      companyName: "مؤسسة الإسكندرية لتجارة الجملة والتوزيع",
      email: "buyer2@alex-wholesale.com",
      phone: "01123456789",
      whatsapp: "01123456789",
      governorate: "الإسكندرية",
      city: "المنشية - سوق الأقمشة",
      source: "MARKETPLACE",
      status: "ACTIVE",
      tags: JSON.stringify(["تاجر جملة", "سوق B2B", "هوديز وميلتون"]),
      totalSpend: 120000.0,
      ordersCount: 2,
      notes: "تاجر جملة يوزع لأسواق الإسكندرية والبحيرة، يفضل قماش الميلتون 3 فتلة والشرابات.",
    },
  });

  const crmCustomerRichCotton = await prisma.crmCustomer.create({
    data: {
      factoryId: f1.id,
      name: "م. كريم البغدادي",
      companyName: "براند ريتش كوتون إيجيبت (Rich Cotton Egypt)",
      email: "kareem@richcotton.eg",
      phone: "01233445566",
      whatsapp: "01233445566",
      governorate: "الجيزة",
      city: "الشيخ زايد",
      address: "المنطقة الصناعية - أبو رواش",
      source: "DIRECT",
      status: "ACTIVE",
      tags: JSON.stringify(["براند محلي", "تصدير", "قطن مصري 100%"]),
      totalSpend: 92000.0,
      ordersCount: 3,
      notes: "براند محلي صاعد بجودة تصديرية، يركز على التيشيرتات البيكيه وأقمشة القطن الممشط الفاخر.",
    },
  });

  const crmCustomerDeltaRetail = await prisma.crmCustomer.create({
    data: {
      factoryId: f1.id,
      name: "أ. ماجد فوزي",
      companyName: "سلسلة محلات دلتا فاشون",
      email: "maged@delta-fashion.com",
      phone: "01511223344",
      whatsapp: "01511223344",
      governorate: "الدقهلية",
      city: "المنصورة",
      source: "REFERRAL",
      status: "PROSPECT",
      tags: JSON.stringify(["سلسلة فروع", "ملابس شتوية"]),
      totalSpend: 0,
      ordersCount: 0,
      notes: "في مرحلة التفاوض على دفعة هوديز وبنطلونات سويت بانتس للموسم القادم.",
    },
  });

  // 10.2 CRM Leads
  const lead1 = await prisma.crmLead.create({
    data: {
      factoryId: f1.id,
      customerId: crmCustomerCairo.id,
      title: "طلب توريد 10,000 تيشيرت بولو للمدارس الدولية",
      contactName: "أ. طارق الشاذلي",
      phone: "01012345678",
      email: "buyer1@cairo-apparel.com",
      estimatedValue: 450000.0,
      productInterest: "بولو بيكيه مطرز مع ياقة ألوان مخصصة",
      source: "MARKETPLACE_RFQ",
      status: "QUALIFIED",
      notes: "طلب جاد جداً بميزانية جاهزة، تم إرسال عينة القماش للمعاينة.",
    },
  });

  const lead2 = await prisma.crmLead.create({
    data: {
      factoryId: f1.id,
      customerId: crmCustomerDeltaRetail.id,
      title: "فرصة توريد تشكيلة ملابس صيفية 3,000 قطعة",
      contactName: "أ. ماجد فوزي",
      phone: "01511223344",
      email: "maged@delta-fashion.com",
      estimatedValue: 180000.0,
      productInterest: "تيشيرت كرو نيك سينجل جيرسي 100% قطن",
      source: "DIRECT_CALL",
      status: "CONTACTED",
      notes: "تم التواصل هاتفياً وطلبوا كتالوج عينات الألوان والأسعار بالجملة.",
    },
  });

  const lead3 = await prisma.crmLead.create({
    data: {
      factoryId: f1.id,
      title: "استفسار توريد تيشيرتات ترويجية لشركة اتصالات",
      contactName: "م. شريف نور",
      phone: "01099887766",
      email: "sherif.nour@telecom-promo.eg",
      estimatedValue: 125000.0,
      productInterest: "تيشيرت بوليستر خفيف للفعاليات 5000 قطعة",
      source: "WEBSITE",
      status: "NEW",
      notes: "طلب عرض أسعار سريع عبر الموقع للفعاليات الصيفية.",
    },
  });

  // 10.3 CRM Deals (Sales Pipeline)
  const deal1 = await prisma.crmDeal.create({
    data: {
      factoryId: f1.id,
      customerId: crmCustomerCairo.id,
      leadId: lead1.id,
      title: "صفقة تيشيرتات بولو بيكيه للشركات (10,000 قطعة)",
      stage: "NEGOTIATION",
      amount: 450000.0,
      expectedCloseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      notes: "تم الاتفاق المبدئي على 45 ج.م للقطعة، بانتظار توقيع أمر التوريد النهائي.",
    },
  });

  const deal2 = await prisma.crmDeal.create({
    data: {
      factoryId: f1.id,
      customerId: crmCustomerAlex.id,
      title: "توريد هوديز ميلتون مبطن شتوي (2,500 قطعة)",
      stage: "PROPOSAL",
      amount: 285000.0,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: "تم إرسال عرض الأسعار وجدول التسليم الزمني.",
    },
  });

  const deal3 = await prisma.crmDeal.create({
    data: {
      factoryId: f1.id,
      customerId: crmCustomerRichCotton.id,
      title: "دفعة صيف 2026 تيشيرتات أوفر سايز فاخرة (5,000 قطعة)",
      stage: "WON",
      amount: 320000.0,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: "تم حسم الصفقة واستلام الدفعة المقدمة 30% والبدء في تجهيز الغزول.",
    },
  });

  // 10.4 CRM Follow-Ups & Reminders
  await prisma.crmFollowUp.createMany({
    data: [
      {
        factoryId: f1.id,
        customerId: crmCustomerCairo.id,
        dealId: deal1.id,
        title: "متابعة توقيع أمر توريد بولو المدارس وتأكيد الدفعة المقدمة",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        type: "CALL",
        priority: "HIGH",
        status: "PENDING",
        assignedTo: "أحمد محمود (مدير المبيعات)",
        notes: "الاتصال بأستاذ طارق صباحاً لتأكيد وصول نموذج العقد وموعد إيداع الشيك.",
      },
      {
        factoryId: f1.id,
        customerId: crmCustomerAlex.id,
        dealId: deal2.id,
        title: "إرسال عينات ألوان ميلتون الشتوي لمؤسسة الإسكندرية",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        type: "SAMPLE_DELIVERY",
        priority: "MEDIUM",
        status: "PENDING",
        assignedTo: "عماد فوزي (المخازن)",
        notes: "تجهيز بطاقات الألوان (أسود، كحلي، زيتي، بيج) وإرسالها مع مندوب الشحن.",
      },
      {
        factoryId: f1.id,
        customerId: crmCustomerDeltaRetail.id,
        leadId: lead2.id,
        title: "زيارة معرض المنصورة لمناقشة عقد التوريد السنوي",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: "MEETING",
        priority: "MEDIUM",
        status: "PENDING",
        assignedTo: "م. إبراهيم رضوان",
        notes: "جلسة عمل مع إدارة المشتريات للاتفاق على مواعيد التسليم الشهرية.",
      },
      {
        factoryId: f1.id,
        customerId: crmCustomerCairo.id,
        dealId: deal1.id,
        title: "إرسال المقايسة الفنية وتفاصيل أوزان الجراماج",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: "EMAIL",
        priority: "HIGH",
        status: "COMPLETED",
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedTo: "أحمد محمود",
        notes: "تم إرسال الملف الفني بصيغة PDF ومطابقة المواصفات المطلوبة.",
      },
    ],
  });

  // 10.5 CRM Activities Timeline
  await prisma.crmActivity.createMany({
    data: [
      {
        factoryId: f1.id,
        customerId: crmCustomerCairo.id,
        dealId: deal1.id,
        type: "MARKETPLACE_RFQ",
        description: "استلام طلب شراء جديد عبر سوق تكس لينك بقيمة تقديرية 450,000 ج.م",
        performedBy: "سوق تكس لينك B2B",
      },
      {
        factoryId: f1.id,
        customerId: crmCustomerCairo.id,
        dealId: deal1.id,
        type: "CALL",
        description: "مكالمة هاتفية مع أ. طارق الشاذلي لمراجعة شروط السداد وزمن التنفيذ (15 يوماً)",
        performedBy: "أحمد محمود (مبيعات)",
      },
      {
        factoryId: f1.id,
        customerId: crmCustomerRichCotton.id,
        dealId: deal3.id,
        type: "MARKETPLACE_ORDER",
        description: "تأكيد واستلام أمر تشغيل صناعي بقيمة 320,000 ج.م وبدء الحياكة",
        performedBy: "م. إبراهيم رضوان",
      },
    ],
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
