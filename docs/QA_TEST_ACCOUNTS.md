# Cysle Egypt — QA Test Accounts Directory
## دليل حسابات الفحص وضمان الجودة (بدون كلمات مرور)

تم إنشاء هذه الحسابات ضمن بيئة فحص آمنة ومعزولة لاختبار كافة الأدوار الوظيفية والعزل التام بين المصانع.

| الدور الوظيفي | البريد الإلكتروني المعتمد | المنشأة / المصنع التابع | مسار الهبوط الافتراضي |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin-qa@cysle-qa.com` | حساب مستقل | `/admin/dashboard` |
| **FACTORY** | `owner-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/factory/dashboard` |
| **FACTORY_MANAGER** | `manager-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/factory/dashboard` |
| **CRM_MANAGER** | `crm-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/crm/dashboard` |
| **SALES_EMPLOYEE** | `sales-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/crm/dashboard` |
| **PRODUCTION_EMPLOYEE** | `production-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/factory/production` |
| **WAREHOUSE_EMPLOYEE** | `warehouse-alpha@cysle-qa.com` | مصنع ألفا (الدقهلية - سلامون) | `/factory/inventory` |
| **FACTORY** | `owner-beta@cysle-qa.com` | مصنع بيتا (الغربية - المحلة) | `/factory/dashboard` |
| **FACTORY_MANAGER** | `manager-beta@cysle-qa.com` | مصنع بيتا (الغربية - المحلة) | `/factory/dashboard` |
| **WAREHOUSE_EMPLOYEE** | `warehouse-beta@cysle-qa.com` | مصنع بيتا (الغربية - المحلة) | `/factory/inventory` |
| **BUYER** | `buyer-qa-1@cysle-qa.com` | حساب مستقل | `/buyer/dashboard` |
| **BUYER** | `buyer-qa-2@cysle-qa.com` | حساب مستقل | `/buyer/dashboard` |

> **ملاحظة أمنية**: كلمات المرور العشوائية القوية محفوظة محلياً فقط في ملف التشغيل المستبعد من المستودع (`artifacts/qa-accounts.local.md`).
