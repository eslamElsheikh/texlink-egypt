/**
 * Cysle Egypt — Multi-Tenant QA Test Environment Seeder
 * Creates two isolated QA factories (Alpha & Beta) and test accounts for all roles.
 * Saves credentials safely into `artifacts/qa-accounts.local.md` (git-ignored).
 * Creates `docs/QA_TEST_ACCOUNTS.md` (passwords omitted).
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function generatePassword(): string {
  return "Qa@" + crypto.randomBytes(9).toString("base64url") + "!9";
}

interface AccountSpec {
  email: string;
  name: string;
  role: string;
  phone: string;
  factoryKey?: "alpha" | "beta";
  isFactory?: boolean;
  isBuyer?: boolean;
  passwordPlain: string;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧪 Seeding Cysle QA Multi-Tenant Environment (Alpha & Beta)...");
  console.log("═══════════════════════════════════════════════════════════════");

  const accounts: Record<string, AccountSpec> = {
    admin: {
      email: "admin-qa@cysle-qa.com",
      name: "إدارة منصة سايسل (QA Admin)",
      role: "ADMIN",
      phone: "01000000001",
      passwordPlain: generatePassword(),
    },
    // Factory Alpha Accounts
    ownerAlpha: {
      email: "owner-alpha@cysle-qa.com",
      name: "م. أشرف التمامي (مالك مصنع ألفا)",
      role: "FACTORY",
      phone: "01011110001",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    managerAlpha: {
      email: "manager-alpha@cysle-qa.com",
      name: "م. سمير رضوان (مدير تشغيل ألفا)",
      role: "FACTORY_MANAGER",
      phone: "01011110002",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    crmAlpha: {
      email: "crm-alpha@cysle-qa.com",
      name: "أ. حازم الصاوي (مدير مبيعات ألفا)",
      role: "CRM_MANAGER",
      phone: "01011110003",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    salesAlpha: {
      email: "sales-alpha@cysle-qa.com",
      name: "أ. تامر عاشور (مسئول مبيعات ألفا)",
      role: "SALES_EMPLOYEE",
      phone: "01011110004",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    productionAlpha: {
      email: "production-alpha@cysle-qa.com",
      name: "عماد الديب (مشرف إنتاج ألفا)",
      role: "PRODUCTION_EMPLOYEE",
      phone: "01011110005",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    warehouseAlpha: {
      email: "warehouse-alpha@cysle-qa.com",
      name: "سعد زغلول (أمين مخزن ألفا)",
      role: "WAREHOUSE_EMPLOYEE",
      phone: "01011110006",
      factoryKey: "alpha",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    // Factory Beta Accounts
    ownerBeta: {
      email: "owner-beta@cysle-qa.com",
      name: "الحاج فوزي الشهاوي (مالك مصنع بيتا)",
      role: "FACTORY",
      phone: "01022220001",
      factoryKey: "beta",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    managerBeta: {
      email: "manager-beta@cysle-qa.com",
      name: "م. نبيل غانم (مدير مصنع بيتا)",
      role: "FACTORY_MANAGER",
      phone: "01022220002",
      factoryKey: "beta",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    warehouseBeta: {
      email: "warehouse-beta@cysle-qa.com",
      name: "ممدوح شحاتة (أمين مخزن بيتا)",
      role: "WAREHOUSE_EMPLOYEE",
      phone: "01022220003",
      factoryKey: "beta",
      isFactory: true,
      passwordPlain: generatePassword(),
    },
    // Buyer Accounts
    buyer1: {
      email: "buyer-qa-1@cysle-qa.com",
      name: "شركة الأهرام للأزياء الجاهزة (مشتري QA 1)",
      role: "BUYER",
      phone: "01033330001",
      isBuyer: true,
      passwordPlain: generatePassword(),
    },
    buyer2: {
      email: "buyer-qa-2@cysle-qa.com",
      name: "توكيل ملابس سبورتيف الدولية (مشتري QA 2)",
      role: "BUYER",
      phone: "01033330002",
      isBuyer: true,
      passwordPlain: generatePassword(),
    },
  };

  // Clean prior QA data idempotently
  const slugs = ["cysle-qa-factory-alpha", "cysle-qa-factory-beta"];
  for (const slug of slugs) {
    const existing = await prisma.factoryProfile.findUnique({ where: { slug } });
    if (existing) {
      console.log(`♻️ Cleaning existing QA factory: ${slug}`);
      const fid = existing.id;
      await prisma.crmActivity.deleteMany({ where: { factoryId: fid } });
      await prisma.crmFollowUp.deleteMany({ where: { factoryId: fid } });
      await prisma.crmDeal.deleteMany({ where: { factoryId: fid } });
      await prisma.crmLead.deleteMany({ where: { factoryId: fid } });
      await prisma.crmCustomer.deleteMany({ where: { factoryId: fid } });
      await prisma.qualityInspection.deleteMany({ where: { factoryId: fid } });
      await prisma.productionCost.deleteMany({ where: { factoryId: fid } });
      await prisma.expense.deleteMany({ where: { factoryId: fid } });
      await prisma.factoryPurchaseItem.deleteMany({ where: { purchaseOrder: { factoryId: fid } } });
      await prisma.factoryPurchaseOrder.deleteMany({ where: { factoryId: fid } });
      await prisma.supplier.deleteMany({ where: { factoryId: fid } });
      await prisma.attendanceRecord.deleteMany({ where: { factoryId: fid } });
      await prisma.shift.deleteMany({ where: { factoryId: fid } });
      await prisma.employee.deleteMany({ where: { factoryId: fid } });
      await prisma.materialConsumption.deleteMany({ where: { factoryId: fid } });
      await prisma.stockMovement.deleteMany({ where: { factoryId: fid } });
      await prisma.inventoryItem.deleteMany({ where: { factoryId: fid } });
      await prisma.warehouse.deleteMany({ where: { factoryId: fid } });
      await prisma.maintenanceTicket.deleteMany({ where: { factoryId: fid } });
      await prisma.wasteRecord.deleteMany({ where: { factoryId: fid } });
      await prisma.productionEntry.deleteMany({ where: { factoryId: fid } });
      await prisma.productionOrder.deleteMany({ where: { factoryId: fid } });
      await prisma.factoryProduct.deleteMany({ where: { factoryId: fid } });
      await prisma.machine.deleteMany({ where: { factoryId: fid } });
      await prisma.factorySettings.deleteMany({ where: { factoryId: fid } });
      await prisma.factoryDocument.deleteMany({ where: { factoryId: fid } });
      await prisma.productPriceTier.deleteMany({ where: { product: { factoryId: fid } } });
      await prisma.product.deleteMany({ where: { factoryId: fid } });
      await prisma.factoryProfile.delete({ where: { id: fid } });
    }
  }

  // Delete prior QA users
  for (const acc of Object.values(accounts)) {
    await prisma.user.deleteMany({ where: { email: acc.email } });
  }

  // Hash passwords
  const passwordHashes: Record<string, string> = {};
  for (const [k, acc] of Object.entries(accounts)) {
    passwordHashes[k] = await bcrypt.hash(acc.passwordPlain, 10);
  }

  // 1. Create Admin User
  await prisma.user.create({
    data: {
      email: accounts.admin.email,
      name: accounts.admin.name,
      passwordHash: passwordHashes.admin,
      phone: accounts.admin.phone,
      role: "ADMIN",
      isFactory: false,
      isBuyer: false,
    },
  });

  // 2. Create Factory Alpha Owner & Factory Profile
  console.log("🏭 Creating Cysle QA Factory Alpha...");
  const ownerAlphaUser = await prisma.user.create({
    data: {
      email: accounts.ownerAlpha.email,
      name: accounts.ownerAlpha.name,
      passwordHash: passwordHashes.ownerAlpha,
      phone: accounts.ownerAlpha.phone,
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
    },
  });

  const factoryAlpha = await prisma.factoryProfile.create({
    data: {
      userId: ownerAlphaUser.id,
      nameAr: "مصنع سايسل ألفا للغزل والتريكو (QA Alpha)",
      slug: "cysle-qa-factory-alpha",
      governorate: "الدقهلية",
      industrialArea: "mansoura-salamon",
      city: "المنصورة",
      address: "المنطقة الصناعية بسلامون القماش، مجمع نسيج ألفا",
      phone: "0501111222",
      whatsapp: accounts.ownerAlpha.phone,
      bioAr: "مصنع تريكو دائري حديث متخصص في أقمشة القطن والملابس الجاهزة لأغراض الفحص والتحقق الأمني.",
      accountStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      specialties: JSON.stringify(["تيشيرتات وبولو", "أقمشة تريكو"]),
      machines: JSON.stringify(["ماكينات تريكو دائري سنجل ودبل"]),
      fabrics: JSON.stringify(["قطن 100%", "سينجل جيرسي"]),
      isDemo: true, // Isolated QA Tenant
      settings: {
        create: {
          usageMode: "FULL_ACCESS",
          marketplaceEnabled: true,
          currency: "EGP",
        },
      },
    },
  });

  // Link Owner Alpha factoryId
  await prisma.user.update({
    where: { id: ownerAlphaUser.id },
    data: { factoryId: factoryAlpha.id },
  });

  // 3. Create Factory Alpha Staff Users
  const alphaStaffKeys = ["managerAlpha", "crmAlpha", "salesAlpha", "productionAlpha", "warehouseAlpha"];
  for (const key of alphaStaffKeys) {
    const acc = accounts[key];
    await prisma.user.create({
      data: {
        email: acc.email,
        name: acc.name,
        passwordHash: passwordHashes[key],
        phone: acc.phone,
        role: acc.role,
        isFactory: true,
        isBuyer: false,
        factoryId: factoryAlpha.id,
      },
    });
  }

  // 4. Create Factory Alpha Operational Data
  const whAlphaRaw = await prisma.warehouse.create({
    data: { factoryId: factoryAlpha.id, name: "مستودع الخامات ألفا", type: "RAW_MATERIALS", location: "صالة أ" },
  });
  const whAlphaFg = await prisma.warehouse.create({
    data: { factoryId: factoryAlpha.id, name: "مستودع المنتج التام ألفا", type: "FINISHED_GOODS", location: "صالة ب" },
  });

  const itemAlphaYarn = await prisma.inventoryItem.create({
    data: {
      factoryId: factoryAlpha.id,
      warehouseId: whAlphaRaw.id,
      sku: "ALPHA-YARN-30",
      name: "غزل قطن ألفا ممشط 30/1",
      category: "YARN",
      unit: "KG",
      currentStock: 5000,
      unitCost: 150.0,
      totalValuation: 750000.0,
    },
  });

  await prisma.stockMovement.create({
    data: {
      factoryId: factoryAlpha.id,
      inventoryItemId: itemAlphaYarn.id,
      movementType: "INITIAL_BALANCE",
      quantity: 5000,
      previousStock: 0,
      newStock: 5000,
      unitCost: 150.0,
      toWarehouseId: whAlphaRaw.id,
      notes: "رصيد ألفا الافتتاحي",
    },
  });

  const machineAlpha = await prisma.machine.create({
    data: {
      factoryId: factoryAlpha.id,
      code: "M-ALPHA-01",
      name: "ماكينة تريكو دائري ألفا 1",
      type: "CIRCULAR_KNITTING",
      brand: "Mayer & Cie",
      status: "RUNNING",
    },
  });

  const customerAlpha = await prisma.crmCustomer.create({
    data: {
      factoryId: factoryAlpha.id,
      name: "عميل ألفا الأول",
      companyName: "شركة أزياء العاصمة",
      phone: "01099990001",
      city: "القاهرة",
      totalSpend: 150000.0,
      ordersCount: 2,
    },
  });

  // 5. Create Factory Beta Owner & Factory Profile
  console.log("🏭 Creating Cysle QA Factory Beta...");
  const ownerBetaUser = await prisma.user.create({
    data: {
      email: accounts.ownerBeta.email,
      name: accounts.ownerBeta.name,
      passwordHash: passwordHashes.ownerBeta,
      phone: accounts.ownerBeta.phone,
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
    },
  });

  const factoryBeta = await prisma.factoryProfile.create({
    data: {
      userId: ownerBetaUser.id,
      nameAr: "مصنع تريكو بيتا بالمحلة (QA Beta)",
      slug: "cysle-qa-factory-beta",
      governorate: "الغربية",
      city: "المحلة الكبرى",
      address: "المنطقة الصناعية بالمحلة الكبرى، طريق طنطا",
      phone: "0402222333",
      whatsapp: accounts.ownerBeta.phone,
      bioAr: "مصنع نسيج وتريكو بيتا لأغراض اختبارات العزل التام بين المصانع ومنع تسريب البيانات.",
      accountStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      specialties: JSON.stringify(["هوديز وسويت شيرت", "ملابس تريكو"]),
      machines: JSON.stringify(["ماكينات خياطة وأوفرلوك 5 فتلة"]),
      fabrics: JSON.stringify(["ميلتون 3 فتلة", "فرنش تيري"]),
      isDemo: true, // Isolated QA Tenant
      settings: {
        create: {
          usageMode: "FULL_ACCESS",
          marketplaceEnabled: true,
          currency: "EGP",
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: ownerBetaUser.id },
    data: { factoryId: factoryBeta.id },
  });

  // Factory Beta Staff
  for (const key of ["managerBeta", "warehouseBeta"]) {
    const acc = accounts[key];
    await prisma.user.create({
      data: {
        email: acc.email,
        name: acc.name,
        passwordHash: passwordHashes[key],
        phone: acc.phone,
        role: acc.role,
        isFactory: true,
        isBuyer: false,
        factoryId: factoryBeta.id,
      },
    });
  }

  // Factory Beta Operational Data
  const whBetaRaw = await prisma.warehouse.create({
    data: { factoryId: factoryBeta.id, name: "مستودع خامات بيتا", type: "RAW_MATERIALS", location: "صالة 1" },
  });

  const itemBetaYarn = await prisma.inventoryItem.create({
    data: {
      factoryId: factoryBeta.id,
      warehouseId: whBetaRaw.id,
      sku: "BETA-YARN-24",
      name: "غزل قطن بيتا كومبد 24/1",
      category: "YARN",
      unit: "KG",
      currentStock: 3000,
      unitCost: 135.0,
      totalValuation: 405000.0,
    },
  });

  await prisma.stockMovement.create({
    data: {
      factoryId: factoryBeta.id,
      inventoryItemId: itemBetaYarn.id,
      movementType: "INITIAL_BALANCE",
      quantity: 3000,
      previousStock: 0,
      newStock: 3000,
      unitCost: 135.0,
      toWarehouseId: whBetaRaw.id,
      notes: "رصيد بيتا الافتتاحي",
    },
  });

  const customerBeta = await prisma.crmCustomer.create({
    data: {
      factoryId: factoryBeta.id,
      name: "عميل بيتا الأول",
      companyName: "محلات الدلتا للتجارة",
      phone: "01099990002",
      city: "طنطا",
      totalSpend: 85000.0,
      ordersCount: 1,
    },
  });

  // 6. Create Buyer Accounts
  for (const key of ["buyer1", "buyer2"]) {
    const acc = accounts[key];
    await prisma.user.create({
      data: {
        email: acc.email,
        name: acc.name,
        passwordHash: passwordHashes[key],
        phone: acc.phone,
        role: "BUYER",
        isFactory: false,
        isBuyer: true,
        buyerProfile: {
          create: {
            companyName: acc.name,
            businessType: "WHOLESALER",
            governorate: "القاهرة",
          },
        },
      },
    });
  }

  // 7. Write Secure Local Credentials File (git-ignored)
  const localCredsPath = path.join(process.cwd(), "artifacts", "qa-accounts.local.md");
  let localMd = `# Cysle Egypt — QA Test Accounts Credentials (CONFIDENTIAL / LOCAL ONLY)\n`;
  localMd += `> Generated: ${new Date().toISOString()} | STRICTLY GIT-IGNORED. DO NOT COMMIT OR EXPOSE.\n\n`;
  localMd += `| الدور (Role) | البريد الإلكتروني | المصنع التابع له | كلمة المرور (Plain Password) |\n`;
  localMd += `| :--- | :--- | :--- | :--- |\n`;

  for (const [key, acc] of Object.entries(accounts)) {
    const factoryNote = acc.factoryKey === "alpha" ? "Factory Alpha (المنصورة سلامون)" : acc.factoryKey === "beta" ? "Factory Beta (المحلة)" : "—";
    localMd += `| **${acc.role}** | \`${acc.email}\` | ${factoryNote} | \`${acc.passwordPlain}\` |\n`;
  }

  fs.writeFileSync(localCredsPath, localMd, "utf8");
  console.log(`🔒 Credentials saved to local ignored file: ${localCredsPath}`);

  // 8. Write Public QA Test Accounts Documentation (NO PASSWORDS)
  const publicDocPath = path.join(process.cwd(), "docs", "QA_TEST_ACCOUNTS.md");
  let publicMd = `# Cysle Egypt — QA Test Accounts Directory\n`;
  publicMd += `## دليل حسابات الفحص وضمان الجودة (بدون كلمات مرور)\n\n`;
  publicMd += `تم إنشاء هذه الحسابات ضمن بيئة فحص آمنة ومعزولة لاختبار كافة الأدوار الوظيفية والعزل التام بين المصانع.\n\n`;
  publicMd += `| الدور الوظيفي | البريد الإلكتروني المعتمد | المنشأة / المصنع التابع | مسار الهبوط الافتراضي |\n`;
  publicMd += `| :--- | :--- | :--- | :--- |\n`;

  for (const [key, acc] of Object.entries(accounts)) {
    const factoryNote = acc.factoryKey === "alpha" ? "مصنع ألفا (الدقهلية - سلامون)" : acc.factoryKey === "beta" ? "مصنع بيتا (الغربية - المحلة)" : "حساب مستقل";
    const landing = acc.role === "ADMIN" ? "/admin/dashboard" : acc.role === "BUYER" ? "/buyer/dashboard" : acc.role === "CRM_MANAGER" || acc.role === "SALES_EMPLOYEE" ? "/crm/dashboard" : acc.role === "PRODUCTION_EMPLOYEE" ? "/factory/production" : acc.role === "WAREHOUSE_EMPLOYEE" ? "/factory/inventory" : "/factory/dashboard";
    publicMd += `| **${acc.role}** | \`${acc.email}\` | ${factoryNote} | \`${landing}\` |\n`;
  }

  publicMd += `\n> **ملاحظة أمنية**: كلمات المرور العشوائية القوية محفوظة محلياً فقط في ملف التشغيل المستبعد من المستودع (\`artifacts/qa-accounts.local.md\`).\n`;

  fs.writeFileSync(publicDocPath, publicMd, "utf8");
  console.log(`📄 Public documentation saved to: ${publicDocPath}`);

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ QA MULTI-TENANT SEED COMPLETED SUCCESSFULLY!");
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ QA Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
