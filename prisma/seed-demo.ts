/**
 * Cysle Egypt — Comprehensive & Isolated Demo Data Seeder
 * Creates an isolated demo tenant (`isDemo: true`) with realistic synthetic
 * manufacturing, inventory, workforce, finance, CRM, and marketplace data.
 *
 * Safety & Idempotency:
 * - Scoped strictly to `cysle-demo-factory` and `@cysle-demo.com` demo users.
 * - NEVER touches, modifies, or deletes real customer or factory records.
 * - Generates cryptographically secure random credentials saved to `.demo-credentials.local.json`.
 * - Requires `ALLOW_DEMO_SEED_PRODUCTION=true` if targeting production database.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function generateSecurePassword(): string {
  return "Demo!" + crypto.randomBytes(9).toString("base64url") + "#9";
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🏭 Starting Cysle Egypt Isolated Demo Tenant Seed...");
  console.log("═══════════════════════════════════════════════════════════════");

  const dbUrl = process.env.DATABASE_URL || "";
  const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");
  const isProd = process.env.NODE_ENV === "production" || dbUrl.includes("supabase.co");

  if (isProd && process.env.ALLOW_DEMO_SEED_PRODUCTION !== "true") {
    console.error("❌ Refusing to seed demo data into production without ALLOW_DEMO_SEED_PRODUCTION=true");
    process.exit(1);
  }

  console.log(`📡 Database Target: ${isPostgres ? "PostgreSQL" : "SQLite"} | Production: ${isProd}`);

  // Generate distinct passwords for demo accounts
  const demoCredentials: Record<string, { email: string; role: string; passwordPlain: string }> = {
    owner: {
      email: "owner@cysle-demo.com",
      role: "FACTORY_OWNER",
      passwordPlain: generateSecurePassword(),
    },
    manager: {
      email: "manager@cysle-demo.com",
      role: "FACTORY_MANAGER",
      passwordPlain: generateSecurePassword(),
    },
    crm: {
      email: "crm@cysle-demo.com",
      role: "CRM_MANAGER",
      passwordPlain: generateSecurePassword(),
    },
    sales: {
      email: "sales@cysle-demo.com",
      role: "SALES_REPRESENTATIVE",
      passwordPlain: generateSecurePassword(),
    },
    production: {
      email: "production@cysle-demo.com",
      role: "PRODUCTION_SUPERVISOR",
      passwordPlain: generateSecurePassword(),
    },
    warehouse: {
      email: "warehouse@cysle-demo.com",
      role: "WAREHOUSE_KEEPER",
      passwordPlain: generateSecurePassword(),
    },
    buyer: {
      email: "buyer@cysle-demo.com",
      role: "BUYER",
      passwordPlain: generateSecurePassword(),
    },
  };

  // 1. Clean up only existing demo tenant data to ensure 100% idempotency
  const existingDemoFactory = await prisma.factoryProfile.findUnique({
    where: { slug: "cysle-demo-factory" },
  });

  if (existingDemoFactory) {
    console.log(`♻️  Found existing demo factory (${existingDemoFactory.id}). Cleaning prior demo records...`);
    const fid = existingDemoFactory.id;
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

  // Clean demo users
  for (const cred of Object.values(demoCredentials)) {
    await prisma.user.deleteMany({ where: { email: cred.email } });
  }

  console.log("👤 Creating demo users with secure passwords...");
  const passwordHashes: Record<string, string> = {};
  for (const [key, cred] of Object.entries(demoCredentials)) {
    passwordHashes[key] = await bcrypt.hash(cred.passwordPlain, 10);
  }

  // Create Owner User
  const ownerUser = await prisma.user.create({
    data: {
      email: demoCredentials.owner.email,
      name: "م. حسام الدسوقي (مالك تجريبي)",
      passwordHash: passwordHashes.owner,
      phone: "01099887766",
      role: "FACTORY",
      isFactory: true,
      isBuyer: false,
    },
  });

  // Create Buyer User
  await prisma.user.create({
    data: {
      email: demoCredentials.buyer.email,
      name: "شركة النيل للملابس الجاهزة (مشتري تجريبي)",
      passwordHash: passwordHashes.buyer,
      phone: "01011223344",
      role: "BUYER",
      isFactory: false,
      isBuyer: true,
      buyerProfile: {
        create: {
          companyName: "شركة النيل للأزياء والملابس",
          businessType: "WHOLESALER",
          governorate: "القاهرة",
        },
      },
    },
  });

  // 2. Create Demo Factory Profile
  console.log("🏭 Creating Cysle Demo Factory Profile...");
  const factory = await prisma.factoryProfile.create({
    data: {
      userId: ownerUser.id,
      nameAr: "مصنع سايسل التجريبي — بيانات غير حقيقية",
      slug: "cysle-demo-factory",
      governorate: "الدقهلية",
      industrialArea: "mansoura-salamon",
      city: "المنصورة",
      address: "منطقة سلامون القماش الصناعية، المنصورة، الدقهلية",
      phone: "0502345678",
      whatsapp: "01099887766",
      bioAr: "مصنع تجريبي معتمد على منصة سايسل مصر لأغراض اختبار أنظمة تشغيل المصانع (Factory OS)، إدارة علاقات العملاء (CRM)، وسوق الجملة (B2B). متخصص في التريكو الدائري والملابس القطنية.",
      logoUrl: "/images/factory-promo.jpg",
      coverUrl: "/images/factory-promo.jpg",
      accountStatus: "ACTIVE",
      verificationStatus: "VERIFIED",
      minOrderQuantity: 100,
      monthlyCapacity: 50000,
      establishedYear: 2020,
      rating: 4.9,
      reviewCount: 42,
      specialties: JSON.stringify(["تيشيرتات وبولو", "هوديز وسويت شيرت", "أقمشة تريكو دائري"]),
      machines: JSON.stringify(["ماكينات تريكو دائري سنجل ودبل", "ماكينات خياطة أوفرلوك"]),
      fabrics: JSON.stringify(["قطن مصري 100%", "ميلتون مبطن", "بيكيه قطن"]),
      isDemo: true, // STRICT ISOLATION FLAG
      featured: false,
      settings: {
        create: {
          usageMode: "FULL_ACCESS",
          marketplaceEnabled: true,
          autoMatchEnabled: true,
          wasteThresholdPct: 4.5,
          lowStockAlertThreshold: 100,
          workingHoursPerShift: 8.0,
          currency: "EGP",
          traceabilityEnabled: true,
        },
      },
    },
  });

  // 3. Machines (12 Machines across all types and statuses)
  console.log("⚙️  Creating 12 Factory Machines...");
  const machineData = [
    { code: "M-CIRC-01", name: "ماكينة تريكو دائري سنجل جيرسي 30 بوصة", type: "CIRCULAR_KNITTING", brand: "Mayer & Cie", model: "Relanit 3.2", status: "RUNNING", costPerHour: 120 },
    { code: "M-CIRC-02", name: "ماكينة تريكو دائري دبل جيرسي إنترلوك", type: "CIRCULAR_KNITTING", brand: "Terrot", model: "UCC 548", status: "RUNNING", costPerHour: 135 },
    { code: "M-CIRC-03", name: "ماكينة تريكو دائري جاكار كمبيوتر", type: "CIRCULAR_KNITTING", brand: "Santoni", model: "SM8-TOP2", status: "UNDER_MAINTENANCE", costPerHour: 150 },
    { code: "M-CIRC-04", name: "ماكينة تريكو دائري ريب مضلع 1x1", type: "CIRCULAR_KNITTING", brand: "Orizio", model: "CMO", status: "RUNNING", costPerHour: 110 },
    { code: "M-SEW-01", name: "ماكينة خياطة أوفرلوك 4 فتلة أوتوماتيك", type: "OVERLOCK", brand: "Juki", model: "MO-6814S", status: "RUNNING", costPerHour: 45 },
    { code: "M-SEW-02", name: "ماكينة خياطة أوفرلوك 5 فتلة للأقمشة الثقيلة", type: "OVERLOCK", brand: "Juki", model: "MO-6816S", status: "RUNNING", costPerHour: 45 },
    { code: "M-SEW-03", name: "ماكينة خياطة درز مستقيم سنجر إلكتروني", type: "SEWING_SINGER", brand: "Brother", model: "S-7250A", status: "RUNNING", costPerHour: 40 },
    { code: "M-SEW-04", name: "ماكينة أورليه كمبيوتر خياطة أطراف", type: "SEWING_SINGER", brand: "Pegasus", model: "W500PV", status: "STOPPED", costPerHour: 50 },
    { code: "M-DYE-01", name: "مصبغة نسيج ضغط عالي High-Temp Soft Flow", type: "OTHER", brand: "Thies", model: "eco-soft", status: "RUNNING", costPerHour: 280 },
    { code: "M-DYE-02", name: "مجفف ومثبت أقمشة ستنتر 6 غرف", type: "OTHER", brand: "Bruckner", model: "Power-Frame", status: "RUNNING", costPerHour: 320 },
    { code: "M-PACK-01", name: "طاولة كي بالبخار مع شفط وتثبيت", type: "IRONING", brand: "Veit", model: "Varioset", status: "RUNNING", costPerHour: 60 },
    { code: "M-PACK-02", name: "ماكينة تغليف وتكييس أوتوماتيكية", type: "OTHER", brand: "Beck Pack", model: "Multiplex", status: "STOPPED", costPerHour: 75 },
  ];

  const machines = await Promise.all(
    machineData.map((m) =>
      prisma.machine.create({
        data: {
          factoryId: factory.id,
          code: m.code,
          name: m.name,
          type: m.type,
          brand: m.brand,
          model: m.model,
          status: m.status,
          hourlyOperatingCost: m.costPerHour,
          purchaseDate: new Date("2021-03-15"),
        },
      })
    )
  );

  // 4. Warehouses (3 Warehouses)
  console.log("🏬 Creating 3 Warehouses...");
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        factoryId: factory.id,
        name: "مستودع الغزول والخامات الأولية",
        type: "RAW_MATERIALS",
        location: "مبنى أ - صالة التخزين الرئيسية",
      },
    }),
    prisma.warehouse.create({
      data: {
        factoryId: factory.id,
        name: "مستودع الإنتاج تحت التشغيل (WIP)",
        type: "WIP",
        location: "مبنى ب - صالة ما قبل التجميع",
      },
    }),
    prisma.warehouse.create({
      data: {
        factoryId: factory.id,
        name: "مستودع البضاعة الجاهزة والتوزيع",
        type: "FINISHED_GOODS",
        location: "مبنى ج - رصيف الشحن",
      },
    }),
  ]);

  // 5. Inventory Items & Initial Balances
  console.log("📦 Creating Inventory Items with Atomic Stock Movements...");
  const itemData = [
    { warehouseId: warehouses[0].id, sku: "YARN-EGY-30-1", name: "غزل قطن مصري 100% كومبد نمرة 30/1", category: "YARN", unit: "KG", stock: 8500, minStock: 1000, unitCost: 145.0 },
    { warehouseId: warehouses[0].id, sku: "YARN-LYC-40", name: "غزل سباندكس ليكرا 40 دنير عالي المرونة", category: "YARN", unit: "KG", stock: 1200, minStock: 200, unitCost: 210.0 },
    { warehouseId: warehouses[1].id, sku: "FAB-SJ-180", name: "قماش سينجل جيرسي قطن 180 جم/م2 مصبوغ أبيض", category: "FABRIC", unit: "KG", stock: 4500, minStock: 500, unitCost: 220.0 },
    { warehouseId: warehouses[1].id, sku: "FAB-PQ-220", name: "قماش بيكيه قطن بولو 220 جم/م2 كحلي داكن", category: "FABRIC", unit: "KG", stock: 3200, minStock: 400, unitCost: 245.0 },
    { warehouseId: warehouses[0].id, sku: "ACC-THRD-WHT", name: "بكر خيوط حياكة بوليستر عالي الشد 5000 ياردة", category: "ACCESSORY", unit: "SPOOL", stock: 850, minStock: 100, unitCost: 35.0 },
    { warehouseId: warehouses[0].id, sku: "ACC-BTN-PL", name: "أزرار بولو 3 فتحات بوليستر لؤلؤي ممتاز", category: "ACCESSORY", unit: "GROSS", stock: 400, minStock: 50, unitCost: 55.0 },
    { warehouseId: warehouses[2].id, sku: "GAR-TSH-WHT-L", name: "تيشيرت رجالي قطن كلاسيك أبيض مقاس L تام الصنع", category: "FINISHED_GARMENT", unit: "PIECE", stock: 2400, minStock: 300, unitCost: 95.0 },
    { warehouseId: warehouses[2].id, sku: "GAR-POL-NVY-XL", name: "بولو شيرت قطن بيكيه كحلي مقاس XL تام الصنع", category: "FINISHED_GARMENT", unit: "PIECE", stock: 1600, minStock: 200, unitCost: 165.0 },
  ];

  const inventoryItems = [];
  for (const it of itemData) {
    const item = await prisma.inventoryItem.create({
      data: {
        factoryId: factory.id,
        warehouseId: it.warehouseId,
        sku: it.sku,
        name: it.name,
        category: it.category,
        unit: it.unit,
        currentStock: it.stock,
        minimumStock: it.minStock,
        unitCost: it.unitCost,
        totalValuation: it.stock * it.unitCost,
      },
    });
    inventoryItems.push(item);

    // Initial Stock Ledger entry
    await prisma.stockMovement.create({
      data: {
        factoryId: factory.id,
        inventoryItemId: item.id,
        movementType: "PURCHASE_IN",
        quantity: it.stock,
        previousStock: 0.0,
        newStock: it.stock,
        unitCost: it.unitCost,
        toWarehouseId: it.warehouseId,
        notes: "رصيد افتتاحي معتمد للمخزن التجريبي",
      },
    });
  }

  // 6. Workforce: Employees & Shifts
  console.log("👥 Creating 10 Employees & 3 Shifts...");
  const shifts = await Promise.all([
    prisma.shift.create({
      data: {
        factoryId: factory.id,
        name: "وردية الصباح (الأساسية)",
        startTime: "08:00",
        endTime: "16:00",
        hours: 8.0,
      },
    }),
    prisma.shift.create({
      data: {
        factoryId: factory.id,
        name: "وردية المساء",
        startTime: "16:00",
        endTime: "00:00",
        hours: 8.0,
      },
    }),
    prisma.shift.create({
      data: {
        factoryId: factory.id,
        name: "وردية الليل (طوارئ تشغيل)",
        startTime: "00:00",
        endTime: "08:00",
        hours: 8.0,
      },
    }),
  ]);

  const employeeData = [
    { code: "EMP-01", name: "محمود العربي", jobTitle: "مشرف صالة إنتاج", phone: "01011112222", salary: 12000 },
    { code: "EMP-02", name: "إبراهيم الدمرداش", jobTitle: "أخصائي مراقبة جودة", phone: "01022223333", salary: 9500 },
    { code: "EMP-03", name: "طارق الشناوي", jobTitle: "فني ماكينات تريكو دائري", phone: "01033334444", salary: 8000 },
    { code: "EMP-04", name: "عادل القماش", jobTitle: "فني ماكينات تريكو", phone: "01044445555", salary: 8000 },
    { code: "EMP-05", name: "أحمد عبد الدايم", jobTitle: "خياط أوفرلوك وتجميع", phone: "01055556666", salary: 7500 },
    { code: "EMP-06", name: "سعيد النجار", jobTitle: "خياط درز وسنجر", phone: "01066667777", salary: 7500 },
    { code: "EMP-07", name: "خالد بيومي", jobTitle: "فني صيانة ميكانيكية وكهربائية", phone: "01077778888", salary: 10500 },
    { code: "EMP-08", name: "ياسر المغازي", jobTitle: "أمين مستودع خامات وغزول", phone: "01088889999", salary: 8500 },
    { code: "EMP-09", name: "محمد أبو النصر", jobTitle: "عامل كي وتعبئة وتغليف", phone: "01099990000", salary: 6500 },
    { code: "EMP-10", name: "مصطفى الرفاعي", jobTitle: "عامل تعبئة وشحن", phone: "01000001111", salary: 6500 },
  ];

  const employees = await Promise.all(
    employeeData.map((e) =>
      prisma.employee.create({
        data: {
          factoryId: factory.id,
          code: e.code,
          name: e.name,
          jobTitle: e.jobTitle,
          phone: e.phone,
          monthlySalary: e.salary,
          paymentType: "MONTHLY",
          isActive: true,
          hiringDate: new Date("2021-06-01"),
        },
      })
    )
  );

  // Attendance Records
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(8, 0, 0, 0);

    for (const emp of employees.slice(0, 5)) {
      await prisma.attendanceRecord.create({
        data: {
          factoryId: factory.id,
          employeeId: emp.id,
          shiftId: shifts[0].id,
          date: d,
          checkIn: "08:15",
          checkOut: "16:00",
          status: i === 4 ? "LATE" : "PRESENT",
          overtimeHours: i === 2 ? 1.5 : 0,
        },
      });
    }
  }

  // 7. Production Orders & Job Tracking
  console.log("📋 Creating 5 Production Orders & Job Traveler Records...");
  const orderData = [
    { orderNumber: "ORD-DEMO-01", batch: "BATCH-DEMO-01", name: "تشغيل 3000 تيشيرت قطني أبيض كلاسيك", target: 3000, produced: 3000, status: "COMPLETED", machineId: machines[0].id },
    { orderNumber: "ORD-DEMO-02", batch: "BATCH-DEMO-02", name: "تشغيل 1500 بولو شيرت كحلي مطرز", target: 1500, produced: 950, status: "IN_PROGRESS", machineId: machines[1].id },
    { orderNumber: "ORD-DEMO-03", batch: "BATCH-DEMO-03", name: "تشغيل 2000 هودي شتوي ميلتون 3 فتلة", target: 2000, produced: 400, status: "IN_PROGRESS", machineId: machines[3].id },
    { orderNumber: "ORD-DEMO-04", batch: "BATCH-DEMO-04", name: "تشغيل 1000 سويت بانتس قطن فرنش تيري", target: 1000, produced: 0, status: "PLANNED", machineId: machines[4].id },
    { orderNumber: "ORD-DEMO-05", batch: "BATCH-DEMO-05", name: "تشغيل 5000 زوج شرابات قطن سوبر", target: 5000, produced: 1200, status: "PAUSED", machineId: machines[2].id },
  ];

  for (const ord of orderData) {
    const po = await prisma.productionOrder.create({
      data: {
        factoryId: factory.id,
        orderNumber: ord.orderNumber,
        batchNumber: ord.batch,
        productNameSnapshot: ord.name,
        targetQuantity: ord.target,
        status: ord.status,
        plannedStartDate: new Date("2026-10-15"),
        plannedEndDate: new Date("2026-11-20"),
        priority: "HIGH",
      },
    });

    if (ord.produced > 0) {
      // Production Entry (produced = good + defective)
      const defective = Math.round(ord.produced * 0.03); // 3% defect
      const good = ord.produced - defective;
      const pe = await prisma.productionEntry.create({
        data: {
          factoryId: factory.id,
          productionOrderId: po.id,
          machineId: ord.machineId,
          employeeId: employees[2].id,
          shiftId: shifts[0].id,
          stage: "KNITTING",
          productionDate: new Date(),
          producedQuantity: ord.produced,
          goodQuantity: good,
          defectiveQuantity: defective,
          notes: "تسجيل دفعة تشغيل دورية مع فحص الجودة",
        },
      });

      // Defect Record
      if (defective > 0) {
        await prisma.wasteRecord.create({
          data: {
            factoryId: factory.id,
            productionOrderId: po.id,
            productionEntryId: pe.id,
            machineId: ord.machineId,
            stage: "KNITTING",
            defectType: "NEEDLE_DROP",
            quantity: defective,
            reworkQuantity: Math.round(defective * 0.7),
            reworkAccepted: Math.round(defective * 0.6),
            scrappedQuantity: defective - Math.round(defective * 0.7),
            estimatedCost: defective * 15.0,
            notes: "إسقاط إبرة تريكو أثناء التشغيل — تحويل إلى صالة إعادة التشغيل",
          },
        });
      }

      // Quality Inspection
      await prisma.qualityInspection.create({
        data: {
          factoryId: factory.id,
          productionOrderId: po.id,
          stage: "FINISHING",
          inspectedQuantity: 100,
          acceptedQuantity: 97,
          rejectedQuantity: 3,
          reworkQuantity: 2,
          defectReasons: "عيوب إبرة طفيفة تم إصلاحها",
          status: "PASSED",
          inspectorName: "إبراهيم الدمرداش",
        },
      });
    }
  }

  // 8. Maintenance Tickets
  console.log("🛠️  Creating Machine Maintenance Tickets...");
  await prisma.maintenanceTicket.create({
    data: {
      factoryId: factory.id,
      machineId: machines[2].id, // Santoni
      issueType: "ELECTRICAL_SENSOR",
      priority: "HIGH",
      description: "عطل في حساس تغذية الغزل الإلكتروني بالماكينة Jacquard",
      status: "IN_PROGRESS",
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      downtimeMinutes: 180,
      sparePartsUsed: "حساس ألماني بديل + كابل توصيل",
      laborCost: 400.0,
      sparePartsCost: 2400.0,
      totalCost: 2800.0,
    },
  });

  await prisma.maintenanceTicket.create({
    data: {
      factoryId: factory.id,
      machineId: machines[0].id, // Mayer & Cie
      issueType: "SCHEDULED_PREVENTIVE",
      priority: "MEDIUM",
      description: "صيانة دورية لتزييت وتغيير إبر التريكو الدائرية",
      status: "COMPLETED",
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      downtimeMinutes: 90,
      sparePartsUsed: "24 إبرة تريكو + زيت تشحيم ألماني",
      laborCost: 200.0,
      sparePartsCost: 1100.0,
      totalCost: 1300.0,
    },
  });

  // 9. Finance & Expenses
  console.log("💰 Creating Financial & Expense Records...");
  const expenses = [
    { cat: "RENT", desc: "إيجار صالة التصنيع والمستودعات - المنصورة سلامون", amount: 45000 },
    { cat: "ELECTRICITY", desc: "فاتورة كهرباء الجهد الصناعي - محطة المحولات", amount: 28500 },
    { cat: "SPARE_PARTS", desc: "شراء حزمة إبر تريكو ألماني Groz-Beckert", amount: 14200 },
    { cat: "FUEL", desc: "ديزل وسولار تشغيل غلايات صالة الصباغة", amount: 18000 },
    { cat: "PACKAGING", desc: "كرتون وأكياس شحن تامة الصنع مطبوعة", amount: 12500 },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        factoryId: factory.id,
        category: exp.cat,
        description: exp.desc,
        amount: exp.amount,
        date: new Date(),
        paymentMethod: "BANK_TRANSFER",
      },
    });
  }

  // 10. CRM Suite: Customers, Leads, Deals
  console.log("🤝 Creating CRM Suite (8 Customers, 5 Leads, 4 Deals)...");
  const customerData = [
    { name: "أ. رفعت عبد الباقي", company: "محلات التوحيد للأزياء الرجالي", phone: "01012345001", email: "tawheed@cairo-garments.com", city: "القاهرة", spend: 380000 },
    { name: "أ. أحمد سراج", company: "سلسلة براند إيجيبت كوتون", phone: "01012345002", email: "serag@egyptcotton.eg", city: "الإسكندرية", spend: 620000 },
    { name: "أ. يوسف المنشاوي", company: "شركة النيل للتصدير والتوريدات", phone: "01012345003", email: "nile@nile-export.com", city: "بورسعيد", spend: 450000 },
    { name: "أ. كيرلس فوزي", company: "معارض المحبة لتجارة الجملة", phone: "01012345004", email: "mahaba@alex-trade.com", city: "المنصورة", spend: 210000 },
    { name: "أ. سارة الجوهري", company: "براند تريكو فاشون ديزاين", phone: "01012345005", email: "sara@tricotfashion.com", city: "الجيزة", spend: 310000 },
    { name: "أ. محمد غنيم", company: "مؤسسة الدلتا لتجارة الملابس", phone: "01012345006", email: "delta@delta-textile.eg", city: "طنطا", spend: 180000 },
    { name: "أ. هشام فهمي", company: "وكالة الشروق لتوزيع المنسوجات", phone: "01012345007", email: "shorouk@cairo-dist.com", city: "شبرا الخيمة", spend: 145000 },
    { name: "أ. عمر زهران", company: "براند أكتيف سبورتس وير", phone: "01012345008", email: "omar@activesports.eg", city: "القاهرة الجديدة", spend: 540000 },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.crmCustomer.create({
        data: {
          factoryId: factory.id,
          name: c.name,
          companyName: c.company,
          phone: c.phone,
          email: c.email,
          city: c.city,
          source: "MARKETPLACE",
          status: "ACTIVE",
          ordersCount: 4,
          totalSpend: c.spend,
        },
      })
    )
  );

  // CRM Leads
  const leads = [
    { name: "شركة الفرسان للملابس الرياضية", person: "طارق الفرسان", phone: "01099112233", stage: "QUALIFIED", val: 180000 },
    { name: "سلسلة محلات كاجوال ستورز", person: "عمرو النمكي", phone: "01099223344", stage: "CONTACTED", val: 95000 },
    { name: "براند جولد كوتون مصر", person: "وليد رضوان", phone: "01099334455", stage: "NEW", val: 240000 },
    { name: "مكتب الإيمان لتوريد الزي الموحد", person: "سامح الديب", phone: "01099445566", stage: "QUALIFIED", val: 120000 },
    { name: "مؤسسة القناة للملابس الجاهزة", person: "ماهر قاسم", phone: "01099556677", stage: "CONTACTED", val: 85000 },
  ];

  for (const ld of leads) {
    await prisma.crmLead.create({
      data: {
        factoryId: factory.id,
        title: ld.name,
        contactName: ld.person,
        phone: ld.phone,
        status: ld.stage,
        estimatedValue: ld.val,
        source: "MARKETPLACE_RFQ",
        productInterest: "ملابس وتريكو قطني",
        notes: "طلب استفسار عن تشغيل كميات تريكو قطنية للموسم القادم",
      },
    });
  }

  // CRM Deals
  const deals = [
    { customerId: customers[0].id, title: "توريد 5,000 تيشيرت صيفي قطن 100%", stage: "WON", amount: 475000 },
    { customerId: customers[1].id, title: "تصنيع 3,000 بولو شيرت بشعار مطرز", stage: "NEGOTIATION", amount: 495000 },
    { customerId: customers[4].id, title: "طلبية 2,000 هودي شتوي ميلتون 3 فتلة", stage: "PROPOSAL", amount: 380000 },
    { customerId: customers[7].id, title: "عقد توريد ملابس رياضية سنوي", stage: "WON", amount: 720000 },
  ];

  for (const dl of deals) {
    await prisma.crmDeal.create({
      data: {
        factoryId: factory.id,
        customerId: dl.customerId,
        title: dl.title,
        stage: dl.stage,
        amount: dl.amount,
        expectedCloseDate: new Date("2026-12-15"),
      },
    });
  }

  // 11. Marketplace Demo Products
  console.log("🛍️  Creating 4 Marketplace Products...");
  const categories = await prisma.category.findMany();
  const catId = categories[0]?.id || "cat-default";

  const products = [
    { nameAr: "تيشيرت كلاسيك قطن مصري 100% سنغل جيرسي", desc: "تيشيرت مصنوع من أجود أقطان الدلتا المصرية، ناعم ومتين، مناسب للطباعة والتطريز، متاح بجميع الألوان.", price: 95.0, moq: 100, fabric: "قطن 100%" },
    { nameAr: "بولو شيرت بيكيه قطني فاخر 220 جم", desc: "بولو شيرت مميز بياقة وأساور مضلعة متينة، أزرار بوليستر لؤلؤي، ألوان ثابتة مقاومة للغسيل.", price: 165.0, moq: 50, fabric: "بيكيه قطن" },
    { nameAr: "سويت شيرت هودي ميلتون مبطن شتوي", desc: "هودي ثقيل قطن 3 فتلة مع بطانة ناعمة، جيب كنغر وكابيشو برباط قطني مزدوج، عزل حراري ممتاز.", price: 210.0, moq: 50, fabric: "ميلتون 3 فتلة" },
    { nameAr: "شرابات قطنية كاجوال عالية التهوية (ديكستر)", desc: "شراب قطني مريح مع نسيج شبكي لتقليل التعرق، استك متين مريح للكاحل، متاح برباط 3 أزواج.", price: 28.0, moq: 300, fabric: "قطن مع ليكرا" },
  ];

  for (const pr of products) {
    const p = await prisma.product.create({
      data: {
        factoryId: factory.id,
        categoryId: catId,
        nameAr: pr.nameAr,
        descriptionAr: pr.desc,
        fabric: pr.fabric,
        basePrice: pr.price,
        moq: pr.moq,
        colors: JSON.stringify(["أبيض", "أسود", "كحلي", "رمادي"]),
        sizes: JSON.stringify(["S", "M", "L", "XL", "2XL"]),
        images: JSON.stringify(["/images/factory-promo.jpg", "/images/buyer-promo.jpg"]),
        isActive: true,
      },
    });

    // Price Tiers
    await prisma.productPriceTier.createMany({
      data: [
        { productId: p.id, minQuantity: pr.moq, maxQuantity: pr.moq * 5, pricePerPiece: pr.price },
        { productId: p.id, minQuantity: pr.moq * 5 + 1, maxQuantity: null, pricePerPiece: pr.price * 0.9 },
      ],
    });
  }

  // 12. Save Credentials to local ignored file
  const credsPath = path.join(process.cwd(), ".demo-credentials.local.json");
  const credsToSave = {
    updatedAt: new Date().toISOString(),
    factory: {
      name: factory.nameAr,
      slug: factory.slug,
      id: factory.id,
      governorate: factory.governorate,
      industrialArea: factory.industrialArea,
    },
    accounts: demoCredentials,
  };
  fs.writeFileSync(credsPath, JSON.stringify(credsToSave, null, 2), "utf8");

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("✅ CYSLE ISOLATED DEMO TENANT SEED COMPLETED SUCCESSFULLY!");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`🏭 Factory Name:       ${factory.nameAr}`);
  console.log(`🔗 Factory Slug:       ${factory.slug}`);
  console.log(`📍 Location:           ${factory.governorate} — المنصورة – سلامون`);
  console.log(`🔒 Isolation Flag:     isDemo = true`);
  console.log(`⚙️  Machines:           ${machines.length} records`);
  console.log(`🏬 Warehouses:         ${warehouses.length} records`);
  console.log(`📦 Inventory Items:    ${inventoryItems.length} records`);
  console.log(`👥 Workforce:          ${employees.length} employees, ${shifts.length} shifts`);
  console.log(`📋 Production Orders:  ${orderData.length} orders`);
  console.log(`🤝 CRM Suite:          ${customers.length} customers, ${leads.length} leads, ${deals.length} deals`);
  console.log(`🛍️  Products:           ${products.length} products`);
  console.log(`🔐 Credentials Saved:  .demo-credentials.local.json (Ignored from git)`);
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
