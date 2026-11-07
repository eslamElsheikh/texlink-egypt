# Cysle Egypt — QA Findings Ledger
## سجل العيوب والملاحظات الأمنية والتشغيلية المكتشفة ومصفوفة المعالجة

---

| المعرف (Bug ID) | مستوى الخطورة (Severity) | الدور المتأثر | مساحة العمل | المسار أو نقطة النهاية (Endpoint) | الوصف والتشخيص الجذري | حالة المعالجة | الاختبار التراجعي المضاف |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-QA-01** | **P1 (High)** | `SALES_EMPLOYEE`, `CRM_MANAGER` | Cysle CRM | `POST /api/crm/leads` | ثغرة IDOR: قبول `customerId` عند إنشاء فرصة بيعية دون التحقق من تبعيته لنفس المصنع، مما كان يتيح ربط فرصة بمشتري مصنع آخر. | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 1) |
| **BUG-QA-02** | **P2 (Medium)** | `SALES_EMPLOYEE`, `CRM_MANAGER` | Cysle CRM | `PATCH /api/crm/leads` | غياب حماية منع التحويل المزدوج للفرص البيعية المحولة مسبقاً (`status === "CONVERTED"`). | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 2) |
| **BUG-QA-03** | **P2 (Medium)** | `SALES_EMPLOYEE`, `CRM_MANAGER` | Cysle CRM | `POST /api/crm/pipeline` | عدم التحقق من إيجابية قيمة الصفقة (`amount <= 0`)، مما كان يسمح بإدخال أرقام سالبة تشوه خط أنابيب المبيعات. | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 3) |
| **BUG-QA-04** | **P2 (Medium)** | `FACTORY_OWNER`, `BUYER` | Marketplace | `POST /api/rfqs/[id]/quotes` | غياب فحص تاريخ انتهاء صلاحية الطلب (`expiresAt`) قبل قبول عروض الأسعار. | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 4) |
| **BUG-QA-05** | **P0 (Critical)** | `FACTORY_OWNER`, New Factories | Factory OS | `GET /api/factory/dashboard` | قيم احتياطية وهمية ثابتة (`|| 85420`, `|| 82300`, `|| 3120`, `|| 5`, `|| 12.5h`) تظهر للمصانع الجديدة المسجلة كأرقام إنتاج. | ✅ **FIXED** | `tests/integration/new-factory-isolation.test.ts` (5 Tests) |
| **BUG-QA-06** | **P1 (High)** | New Factories | Factory OS / Header | `DashboardSidebar`, `DashboardHeader` | شارة "مصنع معتمد" كانت تظهر بصورة نصية ثابتة لأي مصنع جديد قيد المراجعة (`PENDING`). | ✅ **FIXED** | `tests/integration/new-factory-isolation.test.ts` (Test 3) |
| **BUG-QA-07** | **P1 (High)** | All Factory Staff | All Workspaces | `login/route.ts`, `factory-context.ts` | حصر سياق المصنع بالمالك الأساسي (`userId`) ومنع الموظفين الفرعيين من حل سياق مصنعهم. | ✅ **FIXED** | `tests/integration/role-based-qa-audit.test.ts` (Test 3) |
| **BUG-QA-08** | **P1 (High)** | `BUYER`, `FACTORY_OWNER` | Homepage & Marketplace | `LatestRfqsSection.tsx`, `/rfqs` | روابط طلبات شراء وهمية (`rfq-1`, `rfq-2`, `rfq-3`) تؤدي لأخطاء 404 "طلب التصنيع غير موجود". | ✅ **FIXED** | `tests/unit/rfq-integrity.test.ts` (3 Tests) |
| **BUG-QA-09** | **P1 (High)** | `FACTORY_OWNER`, `FACTORY_MANAGER` | Factory OS | `POST /api/factory/production-orders` | ثغرة IDOR: إسناد `productId` يتبع لمصنع آخر إلى أمر تشغيل المصنع دون التحقق من ملكية المنتج. | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 5) |
| **BUG-QA-10** | **P2 (Medium)** | `FACTORY_OWNER`, `PURCHASING` | Factory OS | `POST /api/factory/purchases` | غياب التحقق من إيجابية كميات أصناف أمر الشراء (`quantity <= 0`) وعدم سلبية سعر الوحدة (`unitPrice < 0`). | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 6) |
| **BUG-QA-11** | **P2 (Medium)** | `QUALITY_INSPECTOR` | Factory OS | `POST /api/factory/quality` | غياب فحص توازن كميات فحص الجودة (`accepted + rejected > inspected`) والسماح بقيم فحص سالبة. | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 7) |
| **BUG-QA-12** | **P2 (Medium)** | `PRODUCTION_EMPLOYEE` | Factory OS | `POST /api/factory/waste` | عدم التحقق من أن كمية إعادة التشغيل والمقبول منها لا تتجاوز إجمالي الكمية المعيبة (`rework > qty` أو `accepted > rework`). | ✅ **FIXED** | `tests/unit/continuous-qa-fixes.test.ts` (Test 8) |
