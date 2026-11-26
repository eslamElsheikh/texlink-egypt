-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BUYER',
    "isFactory" BOOLEAN NOT NULL DEFAULT false,
    "isBuyer" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "factoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FactoryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "industrialArea" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "bioAr" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "verifiedAt" DATETIME,
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 50,
    "monthlyCapacity" INTEGER NOT NULL DEFAULT 5000,
    "establishedYear" INTEGER NOT NULL DEFAULT 2015,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "specialties" TEXT NOT NULL,
    "machines" TEXT NOT NULL,
    "fabrics" TEXT NOT NULL,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactoryDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FactoryDocument_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'WHOLESALER',
    "governorate" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "basePrice" REAL NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductPriceTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "pricePerPiece" REAL NOT NULL,
    CONSTRAINT "ProductPriceTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rfq" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "categoryId" TEXT,
    "totalQuantity" INTEGER NOT NULL,
    "fabricDetails" TEXT NOT NULL,
    "gsm" INTEGER,
    "colors" TEXT,
    "printingEmbroidery" TEXT,
    "targetBudgetPerPiece" REAL,
    "deadlineDays" INTEGER NOT NULL DEFAULT 15,
    "deadlineDate" DATETIME,
    "sampleRequired" BOOLEAN NOT NULL DEFAULT true,
    "targetGovernorate" TEXT,
    "notesAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" DATETIME NOT NULL,
    "acceptedQuoteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rfq_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rfq_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RfqAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    CONSTRAINT "RfqAttachment_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RfqSizeBreakdown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "color" TEXT,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "RfqSizeBreakdown_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "samplePrice" REAL,
    "sampleLeadTimeDays" INTEGER,
    "minQuantity" INTEGER NOT NULL,
    "paymentTermsAr" TEXT NOT NULL,
    "notesAr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Quote_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "rfqId" TEXT,
    "quoteId" TEXT,
    "productId" TEXT,
    "buyerId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "agreedDeliveryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "OrderMilestone_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rfqId" TEXT,
    "orderId" TEXT,
    "quoteId" TEXT,
    "buyerId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Conversation_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Conversation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Conversation_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "containsContactInfo" BOOLEAN NOT NULL DEFAULT false,
    "isMasked" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "commentAr" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactorySettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "usageMode" TEXT NOT NULL DEFAULT 'FULL_ACCESS',
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "wasteThresholdPct" REAL NOT NULL DEFAULT 5.0,
    "lowStockAlertThreshold" INTEGER NOT NULL DEFAULT 50,
    "workingHoursPerShift" REAL NOT NULL DEFAULT 8.0,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "traceabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactorySettings_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" DATETIME,
    "purchaseCost" REAL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "maintenanceIntervalDays" INTEGER NOT NULL DEFAULT 30,
    "lastMaintenanceDate" DATETIME,
    "hourlyOperatingCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Machine_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactoryProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fabricType" TEXT NOT NULL,
    "gsm" INTEGER,
    "sizes" TEXT NOT NULL DEFAULT '[]',
    "colors" TEXT NOT NULL DEFAULT '[]',
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "standardPrice" REAL NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "isPublishedToMarketplace" BOOLEAN NOT NULL DEFAULT false,
    "marketplaceProductId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactoryProduct_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "batchNumber" TEXT,
    "productId" TEXT,
    "productNameSnapshot" TEXT NOT NULL,
    "targetQuantity" INTEGER NOT NULL,
    "plannedStartDate" DATETIME NOT NULL,
    "plannedEndDate" DATETIME NOT NULL,
    "actualStartDate" DATETIME,
    "actualEndDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionOrder_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FactoryProduct" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "machineId" TEXT,
    "employeeId" TEXT,
    "shiftId" TEXT,
    "stage" TEXT NOT NULL,
    "productionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "producedQuantity" INTEGER NOT NULL,
    "goodQuantity" INTEGER NOT NULL,
    "defectiveQuantity" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionEntry_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionEntry_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionEntry_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductionEntry_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WasteRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "estimatedCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WasteRecord_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WasteRecord_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WasteRecord_productionEntryId_fkey" FOREIGN KEY ("productionEntryId") REFERENCES "ProductionEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WasteRecord_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "downtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "sparePartsUsed" TEXT,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "sparePartsCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceTicket_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceTicket_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'RAW_MATERIALS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Warehouse_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "batchNumber" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "minimumStock" REAL NOT NULL DEFAULT 10,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "totalValuation" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InventoryItem_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "previousStock" REAL NOT NULL,
    "newStock" REAL NOT NULL,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "fromWarehouseId" TEXT,
    "toWarehouseId" TEXT,
    "referenceOrderNumber" TEXT,
    "idempotencyKey" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaterialConsumption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "plannedQuantity" REAL NOT NULL,
    "issuedQuantity" REAL NOT NULL DEFAULT 0,
    "returnedQuantity" REAL NOT NULL DEFAULT 0,
    "actualConsumed" REAL NOT NULL DEFAULT 0,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaterialConsumption_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialConsumption_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MaterialConsumption_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "phone" TEXT,
    "hiringDate" DATETIME,
    "monthlySalary" REAL NOT NULL DEFAULT 0,
    "paymentType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "hours" REAL NOT NULL DEFAULT 8.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shift_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "shiftId" TEXT,
    "date" DATETIME NOT NULL,
    "checkIn" TEXT,
    "checkOut" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "overtimeHours" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceRecord_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "outstandingBalance" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactoryPurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactoryPurchaseOrder_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FactoryPurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactoryPurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "receivedQuantity" REAL NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    CONSTRAINT "FactoryPurchaseItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "FactoryPurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FactoryPurchaseItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "description" TEXT NOT NULL,
    "relatedMachineId" TEXT,
    "relatedProductionOrderId" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Expense_relatedMachineId_fkey" FOREIGN KEY ("relatedMachineId") REFERENCES "Machine" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_relatedProductionOrderId_fkey" FOREIGN KEY ("relatedProductionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "productionOrderId" TEXT NOT NULL,
    "materialCost" REAL NOT NULL DEFAULT 0,
    "directLaborCost" REAL NOT NULL DEFAULT 0,
    "machineCost" REAL NOT NULL DEFAULT 0,
    "maintenanceCost" REAL NOT NULL DEFAULT 0,
    "overheadCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "goodUnitsCount" INTEGER NOT NULL DEFAULT 0,
    "costPerGoodUnit" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionCost_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionCost_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QualityInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "inspectionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QualityInspection_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QualityInspection_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrmCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "totalSpend" REAL NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "lastContactDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrmCustomer_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmCustomer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrmLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT,
    "title" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "estimatedValue" REAL,
    "productInterest" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MARKETPLACE',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrmLead_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmLead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrmDeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "leadId" TEXT,
    "rfqId" TEXT,
    "orderId" TEXT,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "amount" REAL NOT NULL DEFAULT 0,
    "expectedCloseDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrmDeal_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmDeal_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmDeal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CrmDeal_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "Rfq" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CrmDeal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrmFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT,
    "dealId" TEXT,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CALL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CrmFollowUp_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmFollowUp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmFollowUp_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CrmFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CrmLead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factoryId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "dealId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrmActivity_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "FactoryProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CrmCustomer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CrmDeal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_factoryId_idx" ON "User"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryProfile_userId_key" ON "FactoryProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FactoryProfile_slug_key" ON "FactoryProfile"("slug");

-- CreateIndex
CREATE INDEX "FactoryProfile_isDemo_idx" ON "FactoryProfile"("isDemo");

-- CreateIndex
CREATE INDEX "FactoryProfile_governorate_idx" ON "FactoryProfile"("governorate");

-- CreateIndex
CREATE INDEX "FactoryProfile_industrialArea_idx" ON "FactoryProfile"("industrialArea");

-- CreateIndex
CREATE INDEX "FactoryDocument_factoryId_idx" ON "FactoryDocument"("factoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_rfqId_key" ON "Order"("rfqId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_quoteId_key" ON "Order"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_orderId_key" ON "Conversation"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_quoteId_key" ON "Conversation"("quoteId");

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

