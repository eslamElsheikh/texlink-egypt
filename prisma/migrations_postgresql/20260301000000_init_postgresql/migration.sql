-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BUYER',
    "isFactory" BOOLEAN NOT NULL DEFAULT false,
    "isBuyer" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "bioAr" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 50,
    "monthlyCapacity" INTEGER NOT NULL DEFAULT 5000,
    "establishedYear" INTEGER NOT NULL DEFAULT 2015,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "specialties" TEXT NOT NULL,
    "machines" TEXT NOT NULL,
    "fabrics" TEXT NOT NULL,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryDocument" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "storageKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactoryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'WHOLESALER',
    "governorate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "fabric" TEXT NOT NULL,
    "gsm" INTEGER,
    "colors" TEXT NOT NULL DEFAULT '[]',
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "moq" INTEGER NOT NULL DEFAULT 50,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "stockQuantity" INTEGER NOT NULL DEFAULT 100,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPriceTier" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "pricePerPiece" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ProductPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rfq" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "categoryId" TEXT,
    "totalQuantity" INTEGER NOT NULL,
    "fabricDetails" TEXT NOT NULL,
    "gsm" INTEGER,
    "colors" TEXT,
    "printingEmbroidery" TEXT,
    "targetBudgetPerPiece" DECIMAL(12,2),
    "deadlineDays" INTEGER NOT NULL DEFAULT 15,
    "deadlineDate" TIMESTAMP(3),
    "sampleRequired" BOOLEAN NOT NULL DEFAULT true,
    "targetGovernorate" TEXT,
    "notesAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedQuoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rfq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqAttachment" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "RfqAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfqSizeBreakdown" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RfqSizeBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "samplePrice" DECIMAL(12,2),
    "sampleLeadTimeDays" INTEGER,
    "minQuantity" INTEGER NOT NULL,
    "paymentTermsAr" TEXT NOT NULL,
    "notesAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "rfqId" TEXT,
    "quoteId" TEXT,
    "productId" TEXT,
    "buyerId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "agreedDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderMilestone" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "OrderMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT,
    "orderId" TEXT,
    "quoteId" TEXT,
    "buyerId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "containsContactInfo" BOOLEAN NOT NULL DEFAULT false,
    "isMasked" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "commentAr" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactorySettings" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "usageMode" TEXT NOT NULL DEFAULT 'FULL_ACCESS',
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wasteThresholdPct" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "lowStockAlertThreshold" INTEGER NOT NULL DEFAULT 50,
    "workingHoursPerShift" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "traceabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactorySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "maintenanceIntervalDays" INTEGER NOT NULL DEFAULT 30,
    "lastMaintenanceDate" TIMESTAMP(3),
    "hourlyOperatingCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryProduct" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fabricType" TEXT NOT NULL,
    "gsm" INTEGER,
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "colors" TEXT NOT NULL DEFAULT '[]',
    "estimatedCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "standardPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isPublishedToMarketplace" BOOLEAN NOT NULL DEFAULT false,
    "marketplaceProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "batchNumber" TEXT,
    "productId" TEXT,
    "productNameSnapshot" TEXT NOT NULL,
    "targetQuantity" INTEGER NOT NULL,
    "plannedStartDate" TIMESTAMP(3) NOT NULL,
    "plannedEndDate" TIMESTAMP(3) NOT NULL,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionEntry" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "machineId" TEXT,
    "employeeId" TEXT,
    "shiftId" TEXT,
    "stage" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "producedQuantity" INTEGER NOT NULL,
    "goodQuantity" INTEGER NOT NULL,
    "defectiveQuantity" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteRecord" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT,
    "productionEntryId" TEXT,
    "machineId" TEXT,
    "stage" TEXT NOT NULL,
    "defectType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reworkQuantity" INTEGER NOT NULL DEFAULT 0,
    "reworkAccepted" INTEGER NOT NULL DEFAULT 0,
    "scrappedQuantity" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WasteRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "downtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "sparePartsUsed" TEXT,
    "laborCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sparePartsCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'RAW_MATERIALS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "batchNumber" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "minimumStock" DECIMAL(12,3) NOT NULL DEFAULT 10,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalValuation" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "previousStock" DECIMAL(12,3) NOT NULL,
    "newStock" DECIMAL(12,3) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "referenceOrderNumber" TEXT,
    "idempotencyKey" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialConsumption" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "plannedQuantity" DECIMAL(12,3) NOT NULL,
    "issuedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "returnedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "actualConsumed" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "phone" TEXT,
    "hiringDate" TIMESTAMP(3),
    "monthlySalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TEXT,
    "checkOut" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "outstandingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryPurchaseOrder" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactoryPurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryPurchaseItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "receivedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "FactoryPurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "description" TEXT NOT NULL,
    "relatedMachineId" TEXT,
    "relatedProductionOrderId" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionCost" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "materialCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "directLaborCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "machineCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "maintenanceCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overheadCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "goodUnitsCount" INTEGER NOT NULL DEFAULT 0,
    "costPerGoodUnit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityInspection" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "inspectedQuantity" INTEGER NOT NULL,
    "acceptedQuantity" INTEGER NOT NULL,
    "rejectedQuantity" INTEGER NOT NULL,
    "reworkQuantity" INTEGER NOT NULL DEFAULT 0,
    "defectReasons" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PASSED',
    "inspectorName" TEXT,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmCustomer" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "buyerId" TEXT,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "governorate" TEXT,
    "city" TEXT,
    "address" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MARKETPLACE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "totalSpend" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "lastContactDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT,
    "title" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "estimatedValue" DECIMAL(14,2),
    "productInterest" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MARKETPLACE',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDeal" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "leadId" TEXT,
    "rfqId" TEXT,
    "orderId" TEXT,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "expectedCloseDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmFollowUp" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT,
    "dealId" TEXT,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CALL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "dealId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryProfile_userId_key" ON "FactoryProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryProfile_slug_key" ON "FactoryProfile"("slug");

-- CreateIndex
CREATE INDEX "FactoryDocument_factoryId_idx" ON "FactoryDocument"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Product_factoryId_idx" ON "Product"("factoryId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductPriceTier_productId_idx" ON "ProductPriceTier"("productId");

-- CreateIndex
CREATE INDEX "Rfq_buyerId_idx" ON "Rfq"("buyerId");

-- CreateIndex
CREATE INDEX "Rfq_status_idx" ON "Rfq"("status");

-- CreateIndex
CREATE INDEX "RfqAttachment_rfqId_idx" ON "RfqAttachment"("rfqId");

-- CreateIndex
CREATE INDEX "RfqSizeBreakdown_rfqId_idx" ON "RfqSizeBreakdown"("rfqId");

-- CreateIndex
CREATE INDEX "Quote_rfqId_idx" ON "Quote"("rfqId");

-- CreateIndex
CREATE INDEX "Quote_factoryId_idx" ON "Quote"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_rfqId_key" ON "Order"("rfqId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");

-- CreateIndex
CREATE INDEX "Order_factoryId_idx" ON "Order"("factoryId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "OrderMilestone_orderId_idx" ON "OrderMilestone"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_orderId_key" ON "Conversation"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_quoteId_key" ON "Conversation"("quoteId");

-- CreateIndex
CREATE INDEX "Conversation_buyerId_idx" ON "Conversation"("buyerId");

-- CreateIndex
CREATE INDEX "Conversation_factoryId_idx" ON "Conversation"("factoryId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Review_factoryId_idx" ON "Review"("factoryId");

-- CreateIndex
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "FactorySettings_factoryId_key" ON "FactorySettings"("factoryId");

-- CreateIndex
CREATE INDEX "Machine_factoryId_idx" ON "Machine"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Machine_factoryId_code_key" ON "Machine"("factoryId", "code");

-- CreateIndex
CREATE INDEX "FactoryProduct_factoryId_idx" ON "FactoryProduct"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryProduct_factoryId_code_key" ON "FactoryProduct"("factoryId", "code");

-- CreateIndex
CREATE INDEX "ProductionOrder_factoryId_idx" ON "ProductionOrder"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_factoryId_orderNumber_key" ON "ProductionOrder"("factoryId", "orderNumber");

-- CreateIndex
CREATE INDEX "ProductionEntry_factoryId_idx" ON "ProductionEntry"("factoryId");

-- CreateIndex
CREATE INDEX "ProductionEntry_productionOrderId_idx" ON "ProductionEntry"("productionOrderId");

-- CreateIndex
CREATE INDEX "WasteRecord_factoryId_idx" ON "WasteRecord"("factoryId");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_factoryId_idx" ON "MaintenanceTicket"("factoryId");

-- CreateIndex
CREATE INDEX "MaintenanceTicket_machineId_idx" ON "MaintenanceTicket"("machineId");

-- CreateIndex
CREATE INDEX "Warehouse_factoryId_idx" ON "Warehouse"("factoryId");

-- CreateIndex
CREATE INDEX "InventoryItem_factoryId_idx" ON "InventoryItem"("factoryId");

-- CreateIndex
CREATE INDEX "InventoryItem_warehouseId_idx" ON "InventoryItem"("warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_factoryId_idx" ON "StockMovement"("factoryId");

-- CreateIndex
CREATE INDEX "StockMovement_inventoryItemId_idx" ON "StockMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "MaterialConsumption_factoryId_idx" ON "MaterialConsumption"("factoryId");

-- CreateIndex
CREATE INDEX "MaterialConsumption_productionOrderId_idx" ON "MaterialConsumption"("productionOrderId");

-- CreateIndex
CREATE INDEX "Employee_factoryId_idx" ON "Employee"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_factoryId_code_key" ON "Employee"("factoryId", "code");

-- CreateIndex
CREATE INDEX "Shift_factoryId_idx" ON "Shift"("factoryId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_factoryId_idx" ON "AttendanceRecord"("factoryId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_employeeId_idx" ON "AttendanceRecord"("employeeId");

-- CreateIndex
CREATE INDEX "Supplier_factoryId_idx" ON "Supplier"("factoryId");

-- CreateIndex
CREATE INDEX "FactoryPurchaseOrder_factoryId_idx" ON "FactoryPurchaseOrder"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryPurchaseOrder_factoryId_poNumber_key" ON "FactoryPurchaseOrder"("factoryId", "poNumber");

-- CreateIndex
CREATE INDEX "FactoryPurchaseItem_purchaseOrderId_idx" ON "FactoryPurchaseItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "Expense_factoryId_idx" ON "Expense"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionCost_productionOrderId_key" ON "ProductionCost"("productionOrderId");

-- CreateIndex
CREATE INDEX "ProductionCost_factoryId_idx" ON "ProductionCost"("factoryId");

-- CreateIndex
CREATE INDEX "QualityInspection_factoryId_idx" ON "QualityInspection"("factoryId");

-- CreateIndex
CREATE INDEX "QualityInspection_productionOrderId_idx" ON "QualityInspection"("productionOrderId");

-- CreateIndex
CREATE INDEX "CrmCustomer_factoryId_idx" ON "CrmCustomer"("factoryId");

-- CreateIndex
CREATE INDEX "CrmCustomer_buyerId_idx" ON "CrmCustomer"("buyerId");

-- CreateIndex
CREATE INDEX "CrmLead_factoryId_idx" ON "CrmLead"("factoryId");

-- CreateIndex
CREATE INDEX "CrmLead_customerId_idx" ON "CrmLead"("customerId");

-- CreateIndex
CREATE INDEX "CrmDeal_factoryId_idx" ON "CrmDeal"("factoryId");

-- CreateIndex
CREATE INDEX "CrmDeal_customerId_idx" ON "CrmDeal"("customerId");

-- CreateIndex
CREATE INDEX "CrmDeal_rfqId_idx" ON "CrmDeal"("rfqId");

-- CreateIndex
CREATE INDEX "CrmDeal_orderId_idx" ON "CrmDeal"("orderId");

-- CreateIndex
CREATE INDEX "CrmFollowUp_factoryId_idx" ON "CrmFollowUp"("factoryId");

-- CreateIndex
CREATE INDEX "CrmFollowUp_dueDate_idx" ON "CrmFollowUp"("dueDate");

-- CreateIndex
CREATE INDEX "CrmFollowUp_status_idx" ON "CrmFollowUp"("status");

-- CreateIndex
CREATE INDEX "CrmActivity_factoryId_idx" ON "CrmActivity"("factoryId");

-- CreateIndex
CREATE INDEX "CrmActivity_customerId_idx" ON "CrmActivity"("customerId");

-- AddForeignKey
ALTER TABLE "FactoryProfile" ADD CONSTRAINT "FactoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryDocument" ADD CONSTRAINT "FactoryDocument_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceTier" ADD CONSTRAINT "ProductPriceTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqAttachment" ADD CONSTRAINT "RfqAttachment_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RfqSizeBreakdown" ADD CONSTRAINT "RfqSizeBreakdown_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMilestone" ADD CONSTRAINT "OrderMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactorySettings" ADD CONSTRAINT "FactorySettings_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryProduct" ADD CONSTRAINT "FactoryProduct_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FactoryProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionEntry" ADD CONSTRAINT "ProductionEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteRecord" ADD CONSTRAINT "WasteRecord_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteRecord" ADD CONSTRAINT "WasteRecord_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteRecord" ADD CONSTRAINT "WasteRecord_productionEntryId_fkey" FOREIGN KEY ("productionEntryId") REFERENCES "ProductionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteRecord" ADD CONSTRAINT "WasteRecord_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialConsumption" ADD CONSTRAINT "MaterialConsumption_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialConsumption" ADD CONSTRAINT "MaterialConsumption_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialConsumption" ADD CONSTRAINT "MaterialConsumption_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryPurchaseOrder" ADD CONSTRAINT "FactoryPurchaseOrder_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryPurchaseOrder" ADD CONSTRAINT "FactoryPurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryPurchaseItem" ADD CONSTRAINT "FactoryPurchaseItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "FactoryPurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryPurchaseItem" ADD CONSTRAINT "FactoryPurchaseItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_relatedMachineId_fkey" FOREIGN KEY ("relatedMachineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_relatedProductionOrderId_fkey" FOREIGN KEY ("relatedProductionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionCost" ADD CONSTRAINT "ProductionCost_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionCost" ADD CONSTRAINT "ProductionCost_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityInspection" ADD CONSTRAINT "QualityInspection_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityInspection" ADD CONSTRAINT "QualityInspection_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCustomer" ADD CONSTRAINT "CrmCustomer_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmCustomer" ADD CONSTRAINT "CrmCustomer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmLead" ADD CONSTRAINT "CrmLead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDeal" ADD CONSTRAINT "CrmDeal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmFollowUp" ADD CONSTRAINT "CrmFollowUp_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmFollowUp" ADD CONSTRAINT "CrmFollowUp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmFollowUp" ADD CONSTRAINT "CrmFollowUp_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmFollowUp" ADD CONSTRAINT "CrmFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

