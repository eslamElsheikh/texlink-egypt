# Cysle Egypt — Complete Feature & Route Inventory
## جرد شامل لجميع صفحات المنصة ومسارات الـ API والنماذج وقواعد الصلاحيات

---

## 1. ملخص البنية المعمارية (Application Architectural Summary)
- **إجمالي مسارات Next.js (App Router)**: 132 مساراً (69 صفحة واجهة مستخدم `page.tsx` + 63 مسار برمجيات خلفية `route.ts`).
- **إجمالي نماذج قاعدة البيانات (Prisma Models)**: 43 نموذجاً موزعاً بين مساحات العمل.
- **مساحات العمل المعزولة**:
  1. مساحة السوق العام وبورصة المشترين (`/buyer/*`, `/rfqs/*`, `/products/*`, `/factories/*`).
  2. مساحة تشغيل المصانع (Cysle Factory OS - `/factory/*`).
  3. مساحة إدارة علاقات العملاء والمبيعات (Cysle CRM - `/crm/*`).
  4. مساحة الإدارة العامة والرقابة (Cysle Admin - `/admin/*`).
  5. مسارات المصادقة وتوثيق الجلسات (`/(auth)/*`, `/api/auth/*`).

---

## 2. جدول جرد الميزات ومسارات الصفحات والـ API

### 2.1 مساحة السوق العام وبورصة المشترين (Marketplace & Buyer Workspace)

| الميزة / الوحدة | مسار الصفحة (Page) | مسارات الـ API التابعة | النماذج المرتبطة | الأدوار المصرح لها | حالة التغطية الاختبارية |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **الصفحة الرئيسية** | `/` | `/api/factories`, `/api/rfqs` | `FactoryProfile`, `Rfq`, `Product` | الكل (Guest, Buyer, Factory) | مغطى بوحدات `cysle-rebrand` و `rfq-integrity` |
| **دليل المصانع المعتمدة** | `/factories` | `/api/factories` | `FactoryProfile`, `FactorySettings` | الكل (مع زر تفاعلي حسب الدور) | مغطى بوحدات `cysle-rebrand` و `role-based-qa` |
| **الملف العام للمصنع** | `/factories/[slug]` | `/api/factories/[slug]` | `FactoryProfile`, `Product`, `Review` | الكل (مع حجب بيانات الاتصال للعامة) | مغطى بوحدات `anti-bypass` و `rfq-integrity` |
| **تسجيل مصنع جديد** | `/factories/register` | `/api/factories/register` | `User`, `FactoryProfile`, `FactorySettings` | Guest / غير المسجلين | مغطى بوحدة `new-factory-isolation` |
| **بورصة طلبات الشراء** | `/rfqs` | `/api/rfqs` | `Rfq`, `Category`, `RfqSizeBreakdown` | الكل (استعراض) / المشترين (نشر) | مغطى بوحدة `rfq-integrity` |
| **تفاصيل ومواصفات الطلب** | `/rfqs/[id]` | `/api/rfqs/[id]`, `/api/rfqs/[id]/quotes` | `Rfq`, `Quote`, `FactoryProfile` | المشترين والمصانع | مغطى بوحدات `rfq-integrity` و `complete-workflows` |
| **نشر طلب شراء جديد** | `/rfqs/new` | `/api/rfqs` | `Rfq`, `RfqSizeBreakdown`, `Category` | المشترين المعتمدين (`BUYER`) | مغطى بوحدة `complete-workflows-e2e` |
| **كتالوج المنتجات الجاهزة** | `/products` | `/api/products` | `Product`, `Category`, `FactoryProfile` | الكل | مغطى بوحدات الكتالوج |
| **تفاصيل المنتج الجاهز** | `/products/[id]` | `/api/products/[id]`, `/api/products/[id]/order` | `Product`, `ProductPriceTier`, `Order` | المشترين المعتمدين | مغطى بوحدة `complete-workflows-e2e` |
| **لوحة تحكم المشتري** | `/buyer/dashboard` | `/api/buyer/dashboard` | `BuyerProfile`, `Rfq`, `Order` | المشترين حصراً (`BUYER`) | مغطى بوحدة `role-based-qa-audit` |
| **طلبات المشتري** | `/buyer/rfqs` | `/api/rfqs?buyerId=...` | `Rfq`, `Quote` | المشترين حصراً (`BUYER`) | مغطى بوحدة `complete-workflows-e2e` |
| **عروض الأسعار المستلمة** | `/buyer/quotes` | `/api/rfqs/[id]/quotes` | `Quote`, `FactoryProfile` | المشترين حصراً (`BUYER`) | مغطى بوحدة `complete-workflows-e2e` |
| **أوامر التوريد الجارية** | `/buyer/orders` | `/api/orders/[id]` | `Order`, `OrderMilestone`, `Review` | المشترين حصراً (`BUYER`) | مغطى بوحدة `complete-workflows-e2e` |

---

### 2.2 مساحة تشغيل المصانع (Cysle Factory OS)

| الميزة / الوحدة | مسار الصفحة (Page) | مسارات الـ API التابعة | النماذج المرتبطة | الأدوار المصرح لها | حالة التغطية الاختبارية |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **لوحة تحكم المصنع** | `/factory/dashboard` | `/api/factory/dashboard` | كافة نماذج تشغيل المصنع | `FACTORY_OWNER`, `FACTORY_MANAGER` | مغطى بوحدة `new-factory-isolation` |
| **أوامر التشغيل والإنتاج** | `/factory/production-orders` | `/api/factory/production-orders` | `ProductionOrder`, `ProductionEntry` | طاقم المصنع المصرح | مغطى بوحدة `factory-os` و `complete-workflows` |
| **صالة الإنتاج والباركود** | `/factory/production` | `/api/factory/production` | `ProductionEntry`, `WasteRecord` | `PRODUCTION_EMPLOYEE`, `FACTORY_OWNER` | مغطى بوحدة `factory-os` |
| **التطبيق الميداني السريع** | `/factory/floor` (PWA) | `/api/factory/production` | `ProductionOrder`, `Machine` | مشرفي صالة الإنتاج | مغطى بوحدات الهيكل |
| **الماكينات والمعدات** | `/factory/machines` | `/api/factory/machines` | `Machine`, `MaintenanceTicket` | `FACTORY_OWNER`, `FACTORY_MANAGER` | مغطى بوحدة `factory-os` |
| **تذاكر وبلاغات الصيانة** | `/factory/maintenance` | `/api/factory/maintenance` | `MaintenanceTicket`, `Machine` | فني الصيانة والإدارة | مغطى بوحدة `complete-workflows-e2e` |
| **سجل الهالك والعيوب** | `/factory/waste` | `/api/factory/waste` | `WasteRecord`, `ProductionEntry` | مشرفي الجودة والإنتاج | مغطى بوحدة `factory-os` |
| **فحص ومراقبة الجودة** | `/factory/quality` | `/api/factory/quality` | `QualityInspection`, `ProductionOrder` | أخصائي الجودة | مغطى بوحدة `factory-os` |
| **دفتر الأستاذ والمخازن** | `/factory/inventory` | `/api/factory/inventory` | `Warehouse`, `InventoryItem`, `StockMovement` | `WAREHOUSE_EMPLOYEE`, `FACTORY_OWNER` | مغطى بوحدات `real-tenant` و `cross-role` |
| **استهلاك الخامات** | `/factory/material-consumption` | `/api/factory/material-consumption` | `MaterialConsumption`, `InventoryItem` | أمين المخزن ومشرف الإنتاج | مغطى بوحدة `complete-workflows-e2e` |
| **الموردين والشراء** | `/factory/suppliers`, `/factory/purchases` | `/api/factory/suppliers`, `/api/factory/purchases` | `Supplier`, `FactoryPurchaseOrder` | المشتريات وإدارة المصنع | مغطى بوحدة `factory-os` |
| **إدارة العمال والورديات** | `/factory/employees`, `/factory/shifts` | `/api/factory/employees`, `/api/factory/shifts` | `Employee`, `Shift` | إدارة المصنع | مغطى بوحدة `factory-os` |
| **سجل الحضور والانصراف** | `/factory/attendance` | `/api/factory/attendance` | `AttendanceRecord`, `Employee` | إدارة الموارد البشرية بالمصنع | مغطى بوحدة `factory-os` |
| **المصروفات والتكاليف** | `/factory/expenses`, `/factory/costs` | `/api/factory/expenses`, `/api/factory/costs` | `Expense`, `ProductionCost` | المالك والمحاسب | مغطى بوحدات `financial-precision` و `workflows` |
| **تقارير التتبع والكفاءة** | `/factory/reports` | `/api/factory/reports` | مصفوفة التقارير الإجمالية | المالك والإدارة | مغطى بوحدات التقارير |
| **إعدادات وسياسات المصنع** | `/factory/settings`, `/factory/profile` | `/api/factory/settings`, `/api/factory/profile` | `FactoryProfile`, `FactorySettings` | `FACTORY_OWNER` حصراً | مغطى بوحدات `security-audit` |

---

### 2.3 مساحة إدارة علاقات العملاء (Cysle CRM Workspace)

| الميزة / الوحدة | مسار الصفحة (Page) | مسارات الـ API التابعة | النماذج المرتبطة | الأدوار المصرح لها | حالة التغطية الاختبارية |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **لوحة تحكم المبيعات** | `/crm/dashboard` | `/api/crm/dashboard` | `CrmCustomer`, `CrmDeal`, `CrmLead` | `CRM_MANAGER`, `SALES_EMPLOYEE`, `FACTORY_OWNER` | مغطى بوحدة `role-based-qa-audit` |
| **قاعدة بيانات العملاء** | `/crm/customers` | `/api/crm/customers` | `CrmCustomer`, `CrmActivity` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **ملف العميل التفاعلي** | `/crm/customers/[id]` | `/api/crm/customers/[id]` | `CrmCustomer`, `CrmDeal`, `CrmActivity` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **الفرص البيعية (Leads)** | `/crm/leads` | `/api/crm/leads` | `CrmLead`, `CrmFollowUp` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **خط أنابيب الصفقات (Kanban)** | `/crm/pipeline` | `/api/crm/pipeline` | `CrmDeal`, `CrmCustomer` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **عروض الأسعار المبدئية** | `/crm/quotations` | `/api/crm/quotations` | `Quote`, `CrmCustomer` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **المهام والمتابعات** | `/crm/follow-ups` | `/api/crm/follow-ups` | `CrmFollowUp`, `CrmCustomer` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **سجل الأنشطة والمكالمات** | `/crm/activities` | `/api/crm/activities` | `CrmActivity` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **طلبات السوق المربوطة** | `/crm/marketplace-requests` | `/api/crm/marketplace-requests` | `Rfq`, `Order`, `CrmCustomer` | مسؤولي المبيعات | مغطى بوحدة `complete-workflows-e2e` |
| **تقارير المبيعات والتحويل** | `/crm/reports` | `/api/crm/reports` | تجميعات الـ CRM | `CRM_MANAGER`, `FACTORY_OWNER` | مغطى بوحدات التحليلات |
| **إعدادات خط الأنابيب** | `/crm/settings` | `/api/crm/settings` | مراحل ومصادر الـ CRM | `CRM_MANAGER`, `FACTORY_OWNER` | مغطى بوحدات الإعدادات |

---

### 2.4 مساحة الإدارة المركزية والرقابة (Platform Admin Workspace)

| الميزة / الوحدة | مسار الصفحة (Page) | مسارات الـ API التابعة | النماذج المرتبطة | الأدوار المصرح لها | حالة التغطية الاختبارية |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **لوحة تحكم الإدارة** | `/admin/dashboard` | `/api/admin/dashboard` | كافة إحصائيات المنصة | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `role-based-qa-audit` |
| **إدارة وتوثيق المصانع** | `/admin/factories` | `/api/admin/factories`, `/api/admin/factories/[id]/verify` | `FactoryProfile`, `FactoryDocument` | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `security-audit` |
| **مراقبة بورصة الطلبات** | `/admin/rfqs` | `/api/admin/rfqs` | `Rfq`, `Category` | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `rfq-integrity` |
| **مراقبة أوامر الشراء** | `/admin/orders` | `/api/admin/orders` | `Order`, `Quote` | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `complete-workflows-e2e` |
| **إدارة تصنيفات المنتجات** | `/admin/categories` | `/api/admin/categories` | `Category` | `PLATFORM_ADMIN` حصراً | مغطى بوحدات الأصناف |
| **التحليلات والمؤشرات** | `/admin/analytics` | `/api/admin/analytics` | تجميعات المنصة | `PLATFORM_ADMIN` حصراً | مغطى بوحدات الإحصاء |
| **سجل التدقيق والرقابة** | `/admin/messages` (Audit) | `/api/admin/audit-logs` | `AuditLog` | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `security-audit` |
| **مراقبة الحصص المجانية** | — | `/api/admin/free-tier-health` | مراقبة استهلاك Supabase & Netlify | `PLATFORM_ADMIN` حصراً | مغطى بوحدة `free-tier-monitor` |
