# CYSLE Egypt — Phase 15 Pre-Commit Inventory & Release Packaging

*Prepared: `2026-11-25` | Mode: Strict Read-Only Repository Inspection | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Restrictions Honored:** Zero application code edits, zero `git add` / staging, zero commits, zero pushes, zero merges, zero deployments, zero migration runs, zero file deletions/moves, and zero database or backup changes occurred during Phase 15.

---

## Executive Inventory Summary

- **Tracked Changes (`git diff --name-status`):** **`44`** total (`42` modified `M`, `2` deleted `D` from redundant `prisma/migrations_postgresql/`). All `44` belong directly to either the **Factory-Only Alignment** (pre-Phase 13) or **Phase 13/14 Remediation & Migration Architecture** — zero stray/accidental user edits.
- **Untracked Files (`git ls-files --others --exclude-standard`):** **`174`** total (listed individually in Section 1 — zero omissions):
  - `1` `Application source`, `2` `Tests`, `6` `Database migrations`, `1` `Configuration`, `15` `Documentation` (`1` migration doc + `14` skill `.md` guides), `35` `Founder reports` (`9` phase/audit reports + `26` strategy/research/historical v1 docs), `108` `Generated artifacts` (`founder/panel/` & `founder/panel-retest/` simulation briefs/answers/results), `6` `Other` (`.agents/` Python scripts & example fixtures).
- **Critical Pre-Existing Git Safety Finding (`HEAD`):** Tracked script `scripts/deploy-netlify-prod.js` (unmodified by us, committed prior to `HEAD`) contains a hardcoded `JWT_SECRET` string (`line 31`), local Windows path `<REDACTED_LOCAL_ENV_PATH>` (`line 10`), and Netlify user ID (`line 8`) — flagged in Section 4 for founder rotation/remediation before any public/external exposure.

---

## 1. Complete Untracked File Inventory (All 174 Files Individually Listed)

| # | Relative Path | Type | Size (Bytes) | Purpose | Proposed Classification | Belongs in Git? | Reason for Exclusion (if excluded) |
| :--- | :--- | :--- | ---: | :--- | :--- | :--- | :--- |
| 1 | `.agents/skills/FOUNDER_SKILL_INTEGRATION.md` | `.md` | 11,595 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 2 | `.agents/skills/founder-board/SKILL.md` | `.md` | 4,649 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 3 | `.agents/skills/founder-board/lenses.md` | `.md` | 4,018 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 4 | `.agents/skills/founder-brand/SKILL.md` | `.md` | 3,219 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 5 | `.agents/skills/founder-cfo/SKILL.md` | `.md` | 4,669 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 6 | `.agents/skills/founder-cfo/example.json` | `.json` | 892 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 7 | `.agents/skills/founder-cfo/unit_economics.py` | `.py` | 12,335 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 8 | `.agents/skills/founder-competitors/SKILL.md` | `.md` | 3,450 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 9 | `.agents/skills/founder-consumer/SKILL.md` | `.md` | 5,893 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 10 | `.agents/skills/founder-consumer/customer.example.json` | `.json` | 1,736 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 11 | `.agents/skills/founder-consumer/panel.py` | `.py` | 19,618 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 12 | `.agents/skills/founder-consumer/pitch.example.md` | `.md` | 241 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 13 | `.agents/skills/founder-launch/SKILL.md` | `.md` | 2,909 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 14 | `.agents/skills/founder-marketing/SKILL.md` | `.md` | 3,436 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 15 | `.agents/skills/founder-offer/SKILL.md` | `.md` | 3,651 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 16 | `.agents/skills/founder-ops/SKILL.md` | `.md` | 3,105 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 17 | `.agents/skills/founder-plan/SKILL.md` | `.md` | 3,518 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 18 | `.agents/skills/founder-plan/compile.py` | `.py` | 7,963 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 19 | `.agents/skills/founder-pricing/SKILL.md` | `.md` | 3,613 | Project-local Founder Skill Markdown guide/definition | Documentation | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 20 | `.agents/skills/founder-pricing/van_westendorp.py` | `.py` | 7,124 | Project-local Founder Skill helper script or sample fixture | Other | Optional (Separate Tooling Commit) | Not runtime app code; commit only if team shares .agents/skills |
| 21 | `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md` | `.md` | 7,215 | Dual-provider migration safety, backup & rollback documentation | Documentation | Yes (Commit C / D) | - |
| 22 | `founder/DECISION_REVIEW.md` | `.md` | 39,928 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 23 | `founder/EXECUTIVE_SUMMARY.md` | `.md` | 5,784 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 24 | `founder/FACTORY_ONLY_CLASSIFICATION_DECISION.md` | `.md` | 16,436 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 25 | `founder/FINAL_APPROVAL_PACKAGE.md` | `.md` | 15,272 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 26 | `founder/MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md` | `.md` | 14,075 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 27 | `founder/PHASE_13_FINAL_REVIEW.md` | `.md` | 19,589 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 28 | `founder/PHASE_13_TARGETED_REMEDIATION_REPORT.md` | `.md` | 13,951 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 29 | `founder/PHASE_14_MIGRATION_AND_GIT_HYGIENE_REPORT.md` | `.md` | 14,674 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 30 | `founder/POST_IMPLEMENTATION_VERIFICATION.md` | `.md` | 24,595 | Audit, governance, verification, or phase summary report | Founder reports | Yes (Commit D) or Founder-Only Branch | - |
| 31 | `founder/board.md` | `.md` | 10,764 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 32 | `founder/board/brief.md` | `.md` | 11,903 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 33 | `founder/board/monopoly.md` | `.md` | 8,494 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 34 | `founder/board/offers.md` | `.md` | 10,375 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 35 | `founder/board/product.md` | `.md` | 8,822 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 36 | `founder/brand.md` | `.md` | 22,953 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 37 | `founder/business-plan.md` | `.md` | 121,635 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 38 | `founder/cfo-sources.md` | `.md` | 5,907 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 39 | `founder/cfo.md` | `.md` | 7,535 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 40 | `founder/competitors.csv` | `.csv` | 8,101 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 41 | `founder/competitors.md` | `.md` | 25,465 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 42 | `founder/customer.json` | `.json` | 3,906 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 43 | `founder/dakahlia-field-validation-plan.md` | `.md` | 9,978 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 44 | `founder/dakahlia-market-research.md` | `.md` | 19,913 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 45 | `founder/idea.md` | `.md` | 2,078 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 46 | `founder/launch.md` | `.md` | 6,469 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 47 | `founder/marketing.md` | `.md` | 8,919 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 48 | `founder/numbers.json` | `.json` | 1,687 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 49 | `founder/offer.md` | `.md` | 6,631 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 50 | `founder/one-pager.md` | `.md` | 4,011 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 51 | `founder/ops.md` | `.md` | 8,231 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 52 | `founder/panel-retest/answers/P001.json` | `.json` | 843 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 53 | `founder/panel-retest/answers/P002.json` | `.json` | 791 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 54 | `founder/panel-retest/answers/P003.json` | `.json` | 794 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 55 | `founder/panel-retest/answers/P004.json` | `.json` | 841 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 56 | `founder/panel-retest/answers/P005.json` | `.json` | 879 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 57 | `founder/panel-retest/answers/P006.json` | `.json` | 840 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 58 | `founder/panel-retest/answers/P007.json` | `.json` | 767 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 59 | `founder/panel-retest/answers/P008.json` | `.json` | 790 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 60 | `founder/panel-retest/answers/P009.json` | `.json` | 818 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 61 | `founder/panel-retest/answers/P010.json` | `.json` | 776 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 62 | `founder/panel-retest/answers/P011.json` | `.json` | 851 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 63 | `founder/panel-retest/answers/P012.json` | `.json` | 903 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 64 | `founder/panel-retest/answers/P013.json` | `.json` | 933 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 65 | `founder/panel-retest/answers/P014.json` | `.json` | 885 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 66 | `founder/panel-retest/answers/P015.json` | `.json` | 922 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 67 | `founder/panel-retest/answers/P016.json` | `.json` | 766 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 68 | `founder/panel-retest/answers/P017.json` | `.json` | 837 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 69 | `founder/panel-retest/answers/P018.json` | `.json` | 633 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 70 | `founder/panel-retest/answers/P019.json` | `.json` | 811 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 71 | `founder/panel-retest/answers/P020.json` | `.json` | 775 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 72 | `founder/panel-retest/briefs/P001.md` | `.md` | 4,319 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 73 | `founder/panel-retest/briefs/P002.md` | `.md` | 4,387 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 74 | `founder/panel-retest/briefs/P003.md` | `.md` | 4,397 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 75 | `founder/panel-retest/briefs/P004.md` | `.md` | 4,353 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 76 | `founder/panel-retest/briefs/P005.md` | `.md` | 4,381 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 77 | `founder/panel-retest/briefs/P006.md` | `.md` | 4,339 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 78 | `founder/panel-retest/briefs/P007.md` | `.md` | 4,387 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 79 | `founder/panel-retest/briefs/P008.md` | `.md` | 4,398 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 80 | `founder/panel-retest/briefs/P009.md` | `.md` | 4,394 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 81 | `founder/panel-retest/briefs/P010.md` | `.md` | 4,352 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 82 | `founder/panel-retest/briefs/P011.md` | `.md` | 4,379 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 83 | `founder/panel-retest/briefs/P012.md` | `.md` | 4,368 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 84 | `founder/panel-retest/briefs/P013.md` | `.md` | 4,387 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 85 | `founder/panel-retest/briefs/P014.md` | `.md` | 4,327 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 86 | `founder/panel-retest/briefs/P015.md` | `.md` | 4,320 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 87 | `founder/panel-retest/briefs/P016.md` | `.md` | 4,404 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 88 | `founder/panel-retest/briefs/P017.md` | `.md` | 4,349 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 89 | `founder/panel-retest/briefs/P018.md` | `.md` | 4,367 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 90 | `founder/panel-retest/briefs/P019.md` | `.md` | 4,385 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 91 | `founder/panel-retest/briefs/P020.md` | `.md` | 4,359 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 92 | `founder/panel-retest/panel.json` | `.json` | 6,498 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 93 | `founder/panel-retest/personas.json` | `.json` | 13,141 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 94 | `founder/panel-retest/results.json` | `.json` | 7,115 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 95 | `founder/panel-retest/results.md` | `.md` | 6,455 | Simulated consumer panel markdown summary | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 96 | `founder/panel/answers/P001.json` | `.json` | 894 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 97 | `founder/panel/answers/P002.json` | `.json` | 889 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 98 | `founder/panel/answers/P003.json` | `.json` | 856 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 99 | `founder/panel/answers/P004.json` | `.json` | 855 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 100 | `founder/panel/answers/P005.json` | `.json` | 882 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 101 | `founder/panel/answers/P006.json` | `.json` | 884 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 102 | `founder/panel/answers/P007.json` | `.json` | 995 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 103 | `founder/panel/answers/P008.json` | `.json` | 916 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 104 | `founder/panel/answers/P009.json` | `.json` | 957 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 105 | `founder/panel/answers/P010.json` | `.json` | 930 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 106 | `founder/panel/answers/P011.json` | `.json` | 951 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 107 | `founder/panel/answers/P012.json` | `.json` | 924 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 108 | `founder/panel/answers/P013.json` | `.json` | 776 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 109 | `founder/panel/answers/P014.json` | `.json` | 791 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 110 | `founder/panel/answers/P015.json` | `.json` | 656 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 111 | `founder/panel/answers/P016.json` | `.json` | 761 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 112 | `founder/panel/answers/P017.json` | `.json` | 757 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 113 | `founder/panel/answers/P018.json` | `.json` | 831 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 114 | `founder/panel/answers/P019.json` | `.json` | 890 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 115 | `founder/panel/answers/P020.json` | `.json` | 807 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 116 | `founder/panel/answers/P021.json` | `.json` | 793 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 117 | `founder/panel/answers/P022.json` | `.json` | 809 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 118 | `founder/panel/answers/P023.json` | `.json` | 797 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 119 | `founder/panel/answers/P024.json` | `.json` | 790 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 120 | `founder/panel/answers/P025.json` | `.json` | 940 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 121 | `founder/panel/answers/P026.json` | `.json` | 811 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 122 | `founder/panel/answers/P027.json` | `.json` | 842 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 123 | `founder/panel/answers/P028.json` | `.json` | 857 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 124 | `founder/panel/answers/P029.json` | `.json` | 838 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 125 | `founder/panel/answers/P030.json` | `.json` | 887 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 126 | `founder/panel/briefs/P001.md` | `.md` | 3,653 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 127 | `founder/panel/briefs/P002.md` | `.md` | 3,597 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 128 | `founder/panel/briefs/P003.md` | `.md` | 3,628 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 129 | `founder/panel/briefs/P004.md` | `.md` | 3,607 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 130 | `founder/panel/briefs/P005.md` | `.md` | 3,633 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 131 | `founder/panel/briefs/P006.md` | `.md` | 3,640 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 132 | `founder/panel/briefs/P007.md` | `.md` | 3,638 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 133 | `founder/panel/briefs/P008.md` | `.md` | 3,624 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 134 | `founder/panel/briefs/P009.md` | `.md` | 3,621 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 135 | `founder/panel/briefs/P010.md` | `.md` | 3,617 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 136 | `founder/panel/briefs/P011.md` | `.md` | 3,649 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 137 | `founder/panel/briefs/P012.md` | `.md` | 3,590 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 138 | `founder/panel/briefs/P013.md` | `.md` | 3,603 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 139 | `founder/panel/briefs/P014.md` | `.md` | 3,704 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 140 | `founder/panel/briefs/P015.md` | `.md` | 3,625 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 141 | `founder/panel/briefs/P016.md` | `.md` | 3,672 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 142 | `founder/panel/briefs/P017.md` | `.md` | 3,649 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 143 | `founder/panel/briefs/P018.md` | `.md` | 3,595 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 144 | `founder/panel/briefs/P019.md` | `.md` | 3,671 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 145 | `founder/panel/briefs/P020.md` | `.md` | 3,653 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 146 | `founder/panel/briefs/P021.md` | `.md` | 3,630 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 147 | `founder/panel/briefs/P022.md` | `.md` | 3,626 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 148 | `founder/panel/briefs/P023.md` | `.md` | 3,617 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 149 | `founder/panel/briefs/P024.md` | `.md` | 3,589 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 150 | `founder/panel/briefs/P025.md` | `.md` | 3,657 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 151 | `founder/panel/briefs/P026.md` | `.md` | 3,617 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 152 | `founder/panel/briefs/P027.md` | `.md` | 3,704 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 153 | `founder/panel/briefs/P028.md` | `.md` | 3,640 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 154 | `founder/panel/briefs/P029.md` | `.md` | 3,658 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 155 | `founder/panel/briefs/P030.md` | `.md` | 3,613 | Simulated consumer panel prompt brief | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 156 | `founder/panel/panel.json` | `.json` | 5,771 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 157 | `founder/panel/personas.json` | `.json` | 19,740 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 158 | `founder/panel/results.json` | `.json` | 9,782 | Simulated consumer panel JSON config, persona, or answer payload | Generated artifacts | No | AI-simulated buyer persona JSON output; omit from production app release |
| 159 | `founder/panel/results.md` | `.md` | 9,550 | Simulated consumer panel markdown summary | Generated artifacts | No | AI-simulated buyer persona artifact; noisy history for production app release |
| 160 | `founder/pitch-v1.md` | `.md` | 1,329 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 161 | `founder/pitch.md` | `.md` | 1,643 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 162 | `founder/pricing-curve.md` | `.md` | 1,037 | Historical superseded v1 board/competitor/pitch/pricing snapshot | Founder reports | No (Optional Archive) | Superseded simulation/v1 snapshot kept for audit trail only; omit from app release commits |
| 163 | `founder/pricing.md` | `.md` | 7,942 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 164 | `founder/summary.md` | `.md` | 3,000 | Active Factory-Only founder business, market, pricing, financial, or ops doc | Founder reports | Optional (Commit D / Founder Docs) | Non-runtime business/strategy documentation; commit separately from app/DB release if desired |
| 165 | `prisma/migrations/20261125000000_factory_only_attributes/migration.sql` | `.sql` | 1,030 | PostgreSQL migration SQL (Factory-Only attrs) | Database migrations | Yes (Commit C) | - |
| 166 | `prisma/migrations/20261125010000_optional_factory_attributes/migration.sql` | `.sql` | 1,265 | PostgreSQL migration SQL (nullable establishedYear/monthlyCapacity + deterministic backfill) | Database migrations | Yes (Commit C) | - |
| 167 | `prisma/migrations_sqlite/20260301000000_init_sqlite/migration.sql` | `.sql` | 38,360 | SQLite baseline schema migration SQL from HEAD:prisma/schema.prisma | Database migrations | Yes (Commit C) | - |
| 168 | `prisma/migrations_sqlite/20261125000000_factory_only_attributes/migration.sql` | `.sql` | 1,351 | SQLite additive Factory-Only columns & correlated backfill SQL | Database migrations | Yes (Commit C) | - |
| 169 | `prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql` | `.sql` | 3,216 | SQLite 12-step non-destructive table rebuild for nullable capacity/year | Database migrations | Yes (Commit C) | - |
| 170 | `prisma/migrations_sqlite/migration_lock.toml` | `.toml` | 60 | SQLite migration provider lock (provider = sqlite) | Database migrations | Yes (Commit C) | - |
| 171 | `prisma/sqlite.config.mjs` | `.mjs` | 840 | Explicit Prisma config selecting schema.prisma & migrations_sqlite/ | Configuration | Yes (Commit C) | - |
| 172 | `src/lib/factory/classification.ts` | `.ts` | 2,793 | Analytical Factory 5-segment size & legal/physical status helper | Application source | Yes (Commit A) | - |
| 173 | `tests/unit/factory-only-alignment.test.ts` | `.ts` | 15,002 | Factory-Only classification, location, auth & security unit tests | Tests | Yes (Commit B) | - |
| 174 | `tests/unit/phase13-remediation-security.test.ts` | `.ts` | 27,434 | Phase 13 HTTP registration, MOQ, marketplace, visibility & BOLA tests | Tests | Yes (Commit B) | - |

---

## 2. Modified and Deleted Files (All 42 `M` + 2 `D` Individually Documented)

*(Note: "Origin" distinguishes pre-Phase 13 Factory-Only Alignment work from Phase 13/14 targeted remediation. None of the 44 changes are accidental or unrelated user work outside this release.)*

| # | Git Status | Relative Path | Diff Stat | What Changed | Why It Changed | Belongs in Phase 13/14 Release? | Origin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `M` | `.gitignore` | `+16/-3` | Added ignores for `__pycache__/`, `*.pyc`, `*.pyo`, `*.log`, `.env.*` (`!.env.example`), `prisma/*.db-*`, `*.sqlite*`, `*.bak`, `backups/`, `.wrangler/` | Prevent Python cache, local DBs, backups & env variants from polluting git | Yes (Commit C — Config/Hygiene) | Phase 14 remediation |
| 2 | `M` | `README.md` | `+6/-6` | Replaced `TexLink Egypt` / `للورشة` with Cysle Egypt / `للمصنع`, Factory-Only & Dakahlia context | Align top-level README with Factory-Only decision | Yes (Commit D) | Factory-Only Alignment (Pre-Phase 13) |
| 3 | `M` | `package.json` | `+2/-0` | Added `db:migrate:deploy:sqlite` and `db:migrate:status:sqlite` using `--config prisma/sqlite.config.mjs` | Expose reproducible SQLite Prisma Migrate workflow alongside PostgreSQL | Yes (Commit C) | Phase 14 remediation |
| 4 | `D` | `prisma/migrations_postgresql/20260301000000_init_postgresql/migration.sql` | `+0/-1266` | Deleted tracked duplicate copy of initial PostgreSQL migration | Eliminate redundant PostgreSQL directory unused by Prisma CLI | Yes (Commit C) | Phase 14 remediation (backup saved in scratch) |
| 5 | `D` | `prisma/migrations_postgresql/migration_lock.toml` | `+0/-2` | Deleted tracked duplicate migration lock file | Eliminate redundant PostgreSQL directory lock unused by Prisma CLI | Yes (Commit C) | Phase 14 remediation (backup saved in scratch) |
| 6 | `M` | `prisma/schema.postgresql.prisma` | `+11/-7` | Added `commercialRegStatus`, `taxRegStatus`, `workerCount`, `machineCount`; set `minOrderQuantity @default(1)`, nullable `monthlyCapacity`/`establishedYear` | Support 1-person+ Factory-Only attributes & zero forced defaults in PostgreSQL | Yes (Commit C) | Factory-Only + Phase 13 |
| 7 | `M` | `prisma/schema.prisma` | `+11/-7` | Synced identical FactoryProfile fields & optional nullability with SQLite schema | Keep SQLite & PostgreSQL schemas identical | Yes (Commit C) | Factory-Only + Phase 13 |
| 8 | `M` | `src/app/(auth)/register/page.tsx` | `+20/-1` | Changed initial `governorate` state from `'القاهرة'` to `''` and added optional governorate selector | Never assume or fabricate user governorate | Yes (Commit A) | Phase 13 remediation |
| 9 | `M` | `src/app/about/page.tsx` | `+8/-8` | Updated regional showcase grid to include Salamoun El-Qomash & Tanamel independently | Align about page with Dakahlia launch geography | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 10 | `M` | `src/app/api/admin/factories/[id]/verify/route.ts` | `+66/-29` | Decoupled `status` (physical verification) from optional `commercialRegStatus` & `taxRegStatus` updates | Prevent unverified legal paperwork from blocking physical factory verification | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 11 | `M` | `src/app/api/admin/factories/route.ts` | `+4/-1` | Accepted `PLATFORM_ADMIN` and included `sizeSegment` in admin factory queue | Consistent admin role check & analytical segment visibility | Yes (Commit A) | Phase 13 remediation |
| 12 | `M` | `src/app/api/auth/me/route.ts` | `+10/-0` | Exposed `workerCount`, `machineCount`, `commercialRegStatus`, `taxRegStatus`, and `settings` | Surface Factory-Only & usage mode fields to authenticated UI | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 13 | `M` | `src/app/api/auth/register/route.ts` | `+101/-63` | Atomic `$transaction` setting `FactorySettings`, default `Warehouse`, `User.factoryId`, neutral/empty optional fields without placeholder bio/capabilities | Safe Factory provisioning without invented user facts | Yes (Commit A) | Factory-Only + Phase 13 |
| 14 | `M` | `src/app/api/buyer/dashboard/route.ts` | `+28/-9` | Removed `ADMIN` `prisma.user.findFirst({ isBuyer: true })` fallback; required buyer role or explicit `inspectBuyerId` | Close arbitrary cross-tenant buyer data exposure | Yes (Commit A) | Phase 13 remediation |
| 15 | `M` | `src/app/api/factories/[slug]/route.ts` | `+25/-3` | Added `workerCount`, `sizeSegment`, legal statuses, null-safe year/capacity & strict non-public gate for `PENDING`/`MANAGEMENT_ONLY`/`isDemo` | Align public direct-slug access with directory policy & remove doc leak | Yes (Commit A) | Factory-Only + Phase 13 |
| 16 | `M` | `src/app/api/factories/register/route.ts` | `+198/-163` | Allowed `workerCount>=1`, `machineCount>=1`, `minOrderQuantity>=1`, optional capacity/year/capabilities/CR/Tax, `409` duplicate check, `ADMIN` `403`, immediate JWT cookie refresh | Enable 1-person/1-machine registration & fix buyer-upgrade stale session | Yes (Commit A) | Factory-Only + Phase 13 |
| 17 | `M` | `src/app/api/factories/route.ts` | `+43/-22` | Enforced `isDemo: false`, `ACTIVE`, `VERIFIED`, `marketplaceEnabled: true` inside `AND` across search, filters & pagination; exposed `sizeSegment` | Prevent `PENDING`/`MANAGEMENT_ONLY` leakage & `OR` filter clobbering | Yes (Commit A) | Factory-Only + Phase 13 |
| 18 | `M` | `src/app/api/factory/products/route.ts` | `+22/-30` | Switched to `resolveFactoryContext`, enforced `marketplaceEnabled` + `VERIFIED` on `POST`, defaulted `moq` to `1` | Enforce tenant isolation, marketplace eligibility & MOQ>=1 | Yes (Commit A) | Factory-Only + Phase 13 |
| 19 | `M` | `src/app/api/factory/profile/route.ts` | `+18/-2` | Allowed updating `workerCount>=1`, `machineCount>=1`, `minOrderQuantity>=1`, `monthlyCapacity>=1` | Support 1-person Factory profile edits | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 20 | `M` | `src/app/api/marketplace/dashboard/route.ts` | `+15/-1` | Added `settings?.marketplaceEnabled` & `verificationStatus === 'VERIFIED'` `403` guards | Keep marketplace dashboard locked for `MANAGEMENT_ONLY`/`PENDING` factories | Yes (Commit A) | Phase 13 remediation |
| 21 | `M` | `src/app/api/products/[id]/order/route.ts` | `+26/-4` | Relaxed Zod `min(10)` to `min(1)`, enforced `product.moq`, buyer role (`403`), `isActive`/`VERIFIED`/`marketplaceEnabled` (`403`) | Unblock `MOQ=1` orders & close unverified/inactive order bypass | Yes (Commit A) | Phase 13 remediation |
| 22 | `M` | `src/app/api/products/[id]/route.ts` | `+22/-2` | Enforced `isActive`, `isDemo: false`, `ACTIVE`, `VERIFIED`, `marketplaceEnabled: true` (`404` otherwise) | Align direct product-ID endpoint with public catalog visibility | Yes (Commit A) | Phase 13 remediation |
| 23 | `M` | `src/app/api/products/route.ts` | `+6/-1` | Filtered public product catalog by `isDemo: false`, `ACTIVE`, `VERIFIED`, `marketplaceEnabled: true` | Exclude demo/unverified/management-only factories from public catalog | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 24 | `M` | `src/app/api/rfqs/[id]/quotes/route.ts` | `+17/-22` | Enforced `resolveFactoryContext`, `marketplaceEnabled`, `VERIFIED`; removed duplicate `factory` query | Fix compilation shadowing bug & enforce marketplace eligibility | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 25 | `M` | `src/app/api/rfqs/route.ts` | `+14/-17` | Removed unauthenticated guest `BUYER` `findFirst()` fallback (`401`/`403`) | Close unauthenticated RFQ creation vulnerability | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 26 | `M` | `src/app/buyer/dashboard/page.tsx` | `+1/-1` | Updated copy from `مصانع المحلة وشبرا` to nationwide textile factories | Remove Mahalla-only hub bias | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 27 | `M` | `src/app/factories/[slug]/page.tsx` | `+36/-9` | Removed `والورشة`, added physical vs CR & size badges, handled nullable `establishedYear`/`monthlyCapacity` | Enforce Factory-Only UI & null-safe metrics display | Yes (Commit A) | Factory-Only + Phase 13 |
| 28 | `M` | `src/app/factories/page.tsx` | `+7/-3` | Handled nullable `establishedYear` & `monthlyCapacity` cleanly in directory cards | Prevent runtime error when optional capacity is null | Yes (Commit A) | Phase 13 remediation |
| 29 | `M` | `src/app/factories/register/page.tsx` | `+184/-31` | Added worker/machine inputs, knitwear/machine options, cleared placeholder defaults, optional CR/Tax copy, removed `والورش` | Support authentic 1-person/1-machine onboarding without fabricated defaults | Yes (Commit A) | Factory-Only + Phase 13 |
| 30 | `M` | `src/app/factory/products/page.tsx` | `+1/-1` | Changed initial product `moq` state from `50` to `1` | Consistent `MOQ >= 1` product creation default | Yes (Commit A) | Phase 13 remediation |
| 31 | `M` | `src/app/factory/profile/page.tsx` | `+3/-3` | Null-safe `minOrderQuantity`/`monthlyCapacity` display & lowered input `min` from `100` to `1` | Avoid faking `50`/`5000` & allow 1-piece capacity values | Yes (Commit A) | Phase 13 remediation |
| 32 | `M` | `src/app/faq/page.tsx` | `+1/-1` | Replaced `ورشته` with physical factory existence & optional legal document explanation | Remove Workshop copy & align trust FAQ | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 33 | `M` | `src/app/marketplace/dashboard/page.tsx` | `+18/-3` | Added error banner rendering for `403` `MANAGEMENT_ONLY`/`PENDING` responses | Display clear authorization feedback instead of empty state | Yes (Commit A) | Phase 13 remediation |
| 34 | `M` | `src/app/orders/[id]/page.tsx` | `+1/-1` | Changed `للورشة / المصنع` label to `للمصنع` | Remove residual Workshop copy | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 35 | `M` | `src/app/products/[id]/page.tsx` | `+10/-5` | Updated quantity state/step to `1`, `min={product.moq}`, client MOQ check | Support `MOQ = 1` ordering in product UI | Yes (Commit A) | Phase 13 remediation |
| 36 | `M` | `src/app/products/page.tsx` | `+1/-1` | Updated subtitle copy to include Dakahlia alongside other governorates | Align catalog copy with Dakahlia launch geography | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 37 | `M` | `src/app/rfqs/new/page.tsx` | `+7/-6` | Set neutral default governorate `'الدقهلية'` and added Salamoun/Tanamel options | Remove hardcoded Mahalla default in RFQ form | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 38 | `M` | `src/components/home/HowItWorksDualSection.tsx` | `+2/-2` | Removed `والورش`, highlighted Dakahlia + Egyptian factories from 1 machine onward | Align homepage walkthrough with Factory-Only model | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 39 | `M` | `src/components/layout/Footer.tsx` | `+2/-2` | Updated footer links to `سلامون القماش – مركز المنصورة – الدقهلية` & `طنامل – مركز أجا – الدقهلية` | Distinguish Mansoura vs Aga districts independently | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 40 | `M` | `src/config/locations.ts` | `+8/-6` | Updated canonical Dakahlia area labels & added `أجا`/`مركز أجا` normalization | Enforce independent Salamoun & Tanamel location hygiene | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 41 | `M` | `src/lib/auth/factory-context.ts` | `+5/-21` | Removed dev/preview `ADMIN` `findFirst()` factory fallback across all environments (`400`/`404`) | Eliminate implicit cross-tenant admin inspection bypass | Yes (Commit A) | Factory-Only Alignment (Pre-Phase 13) |
| 42 | `M` | `src/lib/matching/engine.ts` | `+1/-1` | Guarded `factory.monthlyCapacity != null` before comparing `>= rfq.totalQuantity` | Prevent null comparison bug for factories with unspecified capacity | Yes (Commit A) | Phase 13 remediation |
| 43 | `M` | `tests/unit/cysle-rebrand-and-locations.test.ts` | `+2/-2` | Updated Dakahlia canonical area label assertions | Match corrected Salamoun & Tanamel location labels | Yes (Commit B) | Factory-Only Alignment (Pre-Phase 13) |
| 44 | `M` | `tests/unit/document-authorization.test.ts` | `+12/-4` | Added `$transaction`, `factoryProfile.findUnique` mock & explicit `workerCount`/`machineCount` payload | Keep existing upload/registration security suite aligned with atomic transaction & Zod schema | Yes (Commit B) | Factory-Only + Phase 13 |

---

## 3. Migration Configuration Review (Directly Inspected)

Reviewed directly: `package.json`, `prisma/sqlite.config.mjs`, `prisma/schema.prisma`, `prisma/schema.postgresql.prisma`, `prisma/migrations/migration_lock.toml` (`provider = "postgresql"`), `prisma/migrations_sqlite/migration_lock.toml` (`provider = "sqlite"`), `Dockerfile`, `scripts/build.js`, `scripts/build-netlify.js`, and `scripts/deploy-netlify-prod.js`.

- **Build Script Behavior (`scripts/build.js` & `scripts/build-netlify.js` & `Dockerfile`):**
  - `scripts/build.js`: Uses `prisma/schema.postgresql.prisma` when `DATABASE_URL` starts with `postgres`/`postgresql` or `USE_POSTGRES_SCHEMA === "true"`, else `prisma/schema.prisma`, then runs `next build`.
  - `scripts/build-netlify.js`: Uses `prisma/schema.postgresql.prisma` when `DATABASE_URL` starts with `postgres` or `NODE_ENV === "production"`, else `prisma/schema.prisma`, then `next build`.
  - `Dockerfile`: Explicitly runs `npx prisma generate --schema=prisma/schema.postgresql.prisma` and `npm run build` (`NODE_ENV=production`).
- **Exact Verified/Documented Commands by Provider:**
  - **Fresh SQLite Initialization (Prisma Migrate — Tested on Disposable DB):**
    ```bash
    npm run db:migrate:deploy:sqlite   # prisma migrate deploy --config prisma/sqlite.config.mjs
    npm run db:migrate:status:sqlite   # prisma migrate status --config prisma/sqlite.config.mjs
    npm run db:generate                # prisma generate --schema=prisma/schema.prisma
    ```
  - **Existing SQLite Upgrade (e.g., `prisma/dev.db` — Tested on Disposable Backup Copies):**
    ```bash
    # For pre-Phase-12 DB without _prisma_migrations:
    npx prisma migrate resolve --applied 20260301000000_init_sqlite --config prisma/sqlite.config.mjs
    # Additionally if 20261125000000 columns already exist (current prisma/dev.db):
    npx prisma migrate resolve --applied 20261125000000_factory_only_attributes --config prisma/sqlite.config.mjs
    # Then apply remaining SQLite migrations:
    npm run db:migrate:deploy:sqlite
    ```
  - **PostgreSQL Status & Deployment (`prisma/migrations/`, Untested Against Live PG Locally):**
    ```bash
    npm run db:migrate:status          # prisma migrate status --schema=prisma/schema.postgresql.prisma
    npm run db:migrate:deploy          # prisma migrate deploy --schema=prisma/schema.postgresql.prisma
    npm run db:generate:postgres       # prisma generate --schema=prisma/schema.postgresql.prisma
    ```
  *(Explicit disclosure: Live PostgreSQL migration execution was NOT tested locally because `psql` is absent and Docker Desktop is offline; only Prisma validation and SQL review ran.)*

---

## 4. Git Safety, Secrets & Ignore Audit

- **Tracked File Scan (`277` tracked files via `git ls-files`):**
  - `.env.example` (`41` lines): Safe placeholder template only (`CHANGE_ME_*`, `CHANGE_ME_PASSWORD`).
  - Zero tracked `.db`, `.sqlite`, `.bak`, `.pem`, `.key`, `storage/`, or `backups/` files.
  - **CRITICAL PRE-EXISTING FINDING (`HEAD`, Unmodified by Us):** `scripts/deploy-netlify-prod.js` (already committed before `HEAD`) contains hardcoded `JWT_SECRET: "<REDACTED_64_HEX_SECRET>"` (`line 31`), local filesystem path `<REDACTED_LOCAL_ENV_PATH>` (`line 10`), and Netlify user ID (`line 8`). Recommend founder review/secret rotation and script cleanup in a separate security-remediation pass.
- **Modified & Untracked File Secret Scan:** Regex scan across all `174` untracked files found **zero** JWTs, API keys, private keys, database binaries, or credentials (only doc filename substrings matching `pre_factory_only`).
- **`.gitignore` Coverage Verified:** Covers `.env`, `.env.*` (`!.env.example`), `dev.db`, `prisma/*.db`, `prisma/*.db-*`, `*.sqlite*`, `*.bak`, `backups/`, `*.dump`, `*.tar.gz`, `*.sql.bak`, `.next/`, `.netlify/`, `tsconfig.tsbuildinfo`, `__pycache__/`, `*.pyc`, `*.log`, `storage/private/*`, `.demo-credentials*.json`, `artifacts/qa-accounts.local.md`, `cloudflare-worker/dist/`, and `cloudflare-worker/.wrangler/`.
- **Note on Existing Git-Ignored Local Artifacts (Safe from `git add`):** `dev.db`, `prisma/dev.db`, `backups/pre-merge-20261114-030200/dev.db`, `.env`, `.demo-credentials.local.json`, `artifacts/qa-accounts.local.md`, `storage/private/documents/*.dat`, `.agents/**/__pycache__/*.pyc`.

---

## 5. Proposed Commit Manifest (Do NOT Stage Until Founder Approves)

Recommended clean split separating production code/tests/migrations from non-runtime founder artifacts:

### Commit A — Application Fixes (`36` modified + `1` untracked = `37` files)
- `src/lib/factory/classification.ts` *(untracked)*
- `src/config/locations.ts`, `src/lib/auth/factory-context.ts`, `src/lib/matching/engine.ts`
- All `16` modified API routes under `src/app/api/**`
- All `14` modified Next.js pages under `src/app/**`
- `src/components/home/HowItWorksDualSection.tsx`, `src/components/layout/Footer.tsx`

### Commit B — Tests (`2` modified + `2` untracked = `4` files)
- `tests/unit/cysle-rebrand-and-locations.test.ts` *(M)*
- `tests/unit/document-authorization.test.ts` *(M)*
- `tests/unit/factory-only-alignment.test.ts` *(untracked)*
- `tests/unit/phase13-remediation-security.test.ts` *(untracked)*

### Commit C — Migration Configuration, Schemas, SQL & Hygiene (`6` changed + `7` untracked = `13` files)
- `.gitignore` *(M)*, `package.json` *(M)*, `prisma/schema.prisma` *(M)*, `prisma/schema.postgresql.prisma` *(M)*
- `D prisma/migrations_postgresql/20260301000000_init_postgresql/migration.sql`, `D prisma/migrations_postgresql/migration_lock.toml` *(redundant mirror removal)*
- `prisma/sqlite.config.mjs` *(untracked)*
- `prisma/migrations/20261125000000_factory_only_attributes/migration.sql`, `prisma/migrations/20261125010000_optional_factory_attributes/migration.sql` *(untracked)*
- `prisma/migrations_sqlite/migration_lock.toml`, `20260301000000_init_sqlite/migration.sql`, `20261125000000_factory_only_attributes/migration.sql`, `20261125010000_optional_factory_attributes/migration.sql` *(untracked)*

### Commit D — Technical Documentation & Governance Reports (`README.md` + `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md` + active `founder/` phase/strategy reports, EXCLUDING `108` simulated `panel/`/`panel-retest/` artifacts & historical `v1` snapshots)
- Include: `README.md` *(M)*, `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md` *(untracked)*, and the `9` audit/phase reports (`DECISION_REVIEW.md`, `EXECUTIVE_SUMMARY.md`, `FACTORY_ONLY_CLASSIFICATION_DECISION.md`, `FINAL_APPROVAL_PACKAGE.md`, `MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`, `POST_IMPLEMENTATION_VERIFICATION.md`, `PHASE_13_TARGETED_REMEDIATION_REPORT.md`, `PHASE_13_FINAL_REVIEW.md`, `PHASE_14_MIGRATION_AND_GIT_HYGIENE_REPORT.md`, plus this inventory `PHASE_15_PRE_COMMIT_INVENTORY.md` if desired).
- **Optional / Separate Founder Decisions:**
  - Active `founder/` business plan/market/pricing/finance docs (`19` files): commit separately if founder wants business docs in repo, or keep out of app-release commits.
  - `.agents/skills/` (`20` files): commit separately as developer/agent tooling only if team shares `.agents/skills`.
- **Keep Excluded / Untracked (Or Archive Outside Release PR):**
  - `108` `founder/panel/` & `founder/panel-retest/` generated simulation JSON/briefs (`panel/`, `panel-retest/`).
  - `7` superseded historical `v1` snapshots (`founder/board.md`, `founder/board/*`, `founder/competitors.md`, `founder/pitch-v1.md`, `founder/pricing-curve.md`).
  - Existing pre-HEAD tracked `scripts/deploy-netlify-prod.js` left untouched in Phase 15; recommend handling its hardcoded secret in a dedicated security cleanup PR.

---

**STOPPED — Waiting for Explicit Founder Approval** before staging, committing, pushing, running staging PostgreSQL migrations, or releasing.
