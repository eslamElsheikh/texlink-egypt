# Cysle Egypt — Scenario Coverage Matrix
## مصفوفة تغطية السيناريوهات واستراتيجيات الفحص العشر (Test Strategies Coverage)

---

| استراتيجية الفحص (Strategy) | السيناريوهات المنفذة | طريقة التنفيذ والتحقق | النتيجة |
| :--- | :--- | :--- | :--- |
| **A. تبديل الأدوار (Role Switching)** | اختبار دخول نفس المسار بدور `BUYER` ثم `FACTORY` ثم `ADMIN`. التحقق من إعادة توجيه المشتري خارج مسار المصنع، وتوجيه المشرفين لصفحة إنتاجهم الحصرية. | `tests/integration/role-based-qa-audit.test.ts` و `src/middleware.ts` | 🟢 **PASS** |
| **B. تبديل المستأجرين (Tenant Switching)** | اختبار استدعاء مستودع أو عميل تابع لمصنع بيتا بحساب مصنع ألفا. فحص حظر الربط عبر الـ API ورفض الاستجابة برمز 404 أو null. | `tests/integration/cross-role-security.test.ts` | 🟢 **PASS** |
| **C. استكشاف انتقال الحالات (State Transitions)** | اختبار انتقال أمر الإنتاج من `PLANNED` إلى `IN_PROGRESS` إلى `COMPLETED`، وتذاكر الصيانة من `OPEN` إلى `IN_PROGRESS` إلى `COMPLETED`. | `tests/integration/complete-workflows-e2e.test.ts` | 🟢 **PASS** |
| **D. اختبار القيم الحدودية (Boundary Testing)** | اختبار إدخال كميات سالبة (`qty < 0`)، كميات إنتاج معيبة تفوق الإجمالي (`defect > total`)، قيم صفقات سالبة، وتواريخ منتهية الصلاحية للـ RFQ. | `tests/unit/continuous-qa-fixes.test.ts` و `src/app/api/factory/production/route.ts` | 🟢 **PASS** |
| **E. اختبار التزامن والتنافسية (Concurrency Testing)** | اختبار سحب متزامن من صنف محدود الرصيد عبر عدة استدعاءات متوازية؛ التحقق من استجابة interactive `$transaction` وإلغاء المعاملة عند تجاوز الرصيد المتاح. | `tests/integration/real-tenant-isolation.test.ts` (Test 11) | 🟢 **PASS** |
| **F. مسارات العمل المتقطعة (Interrupted Workflows)** | اختبار انتهاء صلاحية الجلسة أو تزييف توقيع الـ JWT والتأكد من إرجاع خطأ 401 وإلغاء الاستجابة المحمية. | `tests/integration/role-based-qa-audit.test.ts` (Test 2) | 🟢 **PASS** |
| **G. الفحص المشترك بين مساحات العمل (Cross-Feature)** | اختبار قبول عرض السعر في مساحة السوق (Marketplace) والتحقق من قيد الطلبية في مساحة المصنع وإنشاء العميل في مساحة الـ CRM دون أي تكرار. | `tests/integration/complete-workflows-e2e.test.ts` (Workflow A) | 🟢 **PASS** |
| **H. فحص استكشاف واجهة المستخدم (Exploratory UI)** | فحص الصفحة الرئيسية، دليل المصانع، الفلاتر الجغرافية بالمحافظات الـ 27، والمناطق الصناعية بالدقهلية، والتأكد من تناسق الاتجاه العربي RTL. | فحص المتصفح والكود والميتا | 🟢 **PASS** |
| **I. اتساق البيانات ودفتر الأستاذ (Data Consistency)** | التحقق الصارم من معادلة التوازن الصناعي: `producedQuantity = goodQuantity + defectiveQuantity`، وتطابق أرصدة الأصناف مع حركات `StockMovement`. | `tests/unit/factory-os.test.ts` و `complete-workflows-e2e.test.ts` | 🟢 **PASS** |
| **J. اكتشاف التراجعات المجاورة (Regression Discovery)** | إعادة تشغيل دورات تراجع كاملة بعد كل تعديل برمجي للتأكد من عدم تضرر أي ميزة سابقة. | دورتي تراجع كاملتين (21 جناح اختبار / 145 اختباراً) | 🟢 **PASS** |
