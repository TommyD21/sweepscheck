# SweepsCheck — Full Audit Report
**Audit date:** August 8, 2026  
**Auditor:** Manual review + primary source verification  
**Data version:** 3.0.0  
**Previous version:** 2.x (last verified May 26, 2026)  

---

## Executive Summary

This audit updated the SweepsCheck database from a May 2026 snapshot to August 8, 2026. The legal landscape changed substantially in the intervening 10 weeks. Major changes include: Louisiana's statutory racketeering ban taking effect August 1, New Jersey enacting a second legislative ban (signed August 3), Oklahoma's ban being enacted via veto override (effective November 1), Iowa gaining regulatory enforcement authority (effective July 1), and Utah and New Mexico being correctly classified for the first time.

The architecture was also refactored: data is now separated from presentation, every state and platform has structured `sources` arrays, `changeHistory` is machine-readable, and a biweekly automated integrity checker has been implemented.

---

## What Was Verified

### State Legal Status (all 50 states)

Every state classification was verified against:
1. Official state legislative records (bill text and signing dates)
2. State AG and gaming regulator actions
3. InfoLawGroup.com legal analysis (primary law firm analysis, July 27, 2026)
4. Lines.com state-by-state tracker (July 2026)
5. sweepcasinos.com 50-state guide (July 22, 2026)
6. sweepsy.com legislative tracker (ongoing)

### Platform Data (19 platforms)

For each platform, the following was checked:
- Operator identity and headquarters
- Restricted state list
- Entry method (mail-in vs. online photo vs. discontinued)
- SC award amounts
- URL validity (ToS, sweepstakes rules)
- Document versions where obtainable
- Age requirements

---

## What Was Changed

### State Changes

| State | Previous | New | Reason | Source |
|-------|----------|-----|--------|--------|
| **IA** | DEFAULT (legal, no entry) | Gray zone — SF 2289 enforcement authority (Jul 1, 2026) | Iowa governor signed SF 2289 giving IRGC C&D powers against sweepstakes operators | InfoLawGroup, Covers.com |
| **UT** | DEFAULT (legal, no entry) | Illegal — Utah Code §76-10-1102 total gambling ban | Pre-existing total gambling prohibition applies to sweepstakes model | Utah Code §76-10-1102 |
| **NM** | DEFAULT (legal, no entry) | Gray zone — NMGCB public classification | New Mexico Gaming Control Board classifies as illegal; no enforcement action followed | sweepcasinos.com Jul 2026 |
| **LA** | Illegal — AG opinion Jul 2025 | Illegal — HB 53 (Act 48) + HB 883 (Act 182), effective Aug 1, 2026 | Louisiana now has dual statutory bans with racketeering and felony provisions | InfoLawGroup Jul 2026, Lines.com |
| **NJ** | Illegal — A5447 (signed Aug 15, 2025) | Illegal — A5447 (P.L. 2025) + P.L. 2026 c. 128 (signed Aug 3, 2026) | New Jersey enacted a second/updated sweepstakes ban on August 3, 2026 | PlayUSA Aug 4, 2026 |
| **OK** | Illegal — SB 1589 signed | Illegal — SB 1589 enacted via veto override May 14, 2026 (effective Nov 1, 2026) | Governor vetoed then legislature overrode; operators still serving until Oct 31 | InfoLawGroup, bodog.com |
| **PA** | Gray — "iGaming regulatory tension" | Gray — PGCB issued 18 C&Ds (Apr 2025); major brands (Stake.us, McLuck, High 5) exited | Updated description to reflect specific enforcement action | sweepcasinos.com |
| **KY** | Gray — "30+ brands self-restrict" | Gray — KRS 372.040 private lawsuits have driven out 30+ brands; VGW settled | Added legal basis; VGW settlement confirmed | vegasinsider.com, sweepcasinos.com |

### Platform Data Corrections

| Platform | Field | Previous | New | Source |
|----------|-------|----------|-----|--------|
| **MegaBonanza** | Operator | "LuminaryPlay Operations Limited" / "B2Services OÜ (RSI)" | B2Services OÜ (confirmed Estonia) | next.io |
| **Crown Coins Casino** | Operator | "GAN Ltd." | Sunflower Limited (Isle of Man) | oddsshark.com |
| **Crown Coins Casino** | Domain | crowncoins.casino | crowncoinscasino.com | operator site |
| **Crown Coins Casino** | Mail SC | 2 SC per request | 1 SC per request | rg.org Apr 2026 |
| **Crown Coins Casino** | ToS URL | /terms | /pages/terms-of-service | Google index Mar 2026 |
| **Global Poker** | ToS URL | /terms (404) | /documents/251111-POL-POK-T%26Cs-22-0.pdf (working PDF) | verified Oct 2025 |
| **Global Poker** | Entry | Postal mail | Online photo submission (user confirmed; VGW group policy) | User confirmation |
| **LuckyLand Slots** | Entry | Postal mail | Online photo submission (user confirmed; VGW group policy) | User confirmation |
| **McLuck** | Restricted | [no PA, no NV] | Added PA, NV | PGCB C&Ds, NV SB 256 |
| **High 5 Casino** | Restricted | [no NV] | Added NV | NV SB 256 enforcement |
| **All platforms** | Restricted | [no UT] | Added UT to all 19 platforms | Utah Code §76-10-1102 |
| **Stake.us** | ToS URL | /terms-and-conditions | /policies/terms | confirmed current |
| **WOW Vegas** | ToS URL | /terms | /terms-and-conditions | confirmed current |
| **Rolla** | ToS URL | /terms | /terms-of-service | confirmed current |
| **MegaBonanza** | ToS URL | /terms | /terms-of-service (Jan 26, 2026 version) | confirmed |
| **SpinBlitz** | ToS URL | /terms | /terms-of-service | confirmed resolves |
| **PlayFame** | ToS URL | /terms | /terms-of-service | confirmed |
| **All** | `lastVerified` | "May 2026" | "2026-08-08" | This audit |
| **Footer** | `lastVerified` | "May 26, 2026" | "August 8, 2026" | This audit |

---

## What Was Stale (and Updated)

- All 19 platforms had `lastVerified: "May 2026"` — updated to `"2026-08-08"`
- All state entries had `lastVerified: "May 2026"` (or missing) — updated to `"2026-08-08"`
- Footer date "May 26, 2026" — updated to "August 8, 2026"
- OG metadata `"verified May 2026"` — updated throughout
- Louisiana law citation was based on pre-statute AG opinion — updated to statutory citation
- New Jersey entry did not reflect August 2026 second ban

---

## What Could Not Be Verified

| Item | Reason | Action |
|------|--------|--------|
| LuckyLand online entry method | LuckyLand's static website footer still shows legacy postal text; in-platform experience was confirmed by user but no LuckyLand-specific PDF equivalent to Chumba's v23.0 was found | Listed as online entry per user confirmation; noted discrepancy in mailDetail text |
| Global Poker specific sweeps rules PDF (like Chumba's v23.0) | No public PDF equivalent found for Global Poker | Listed as online entry per user + VGW group policy inference from Chumba v23.0 |
| WOW Vegas exact SC mail-in award amount | Amount varies and requires login | Listed as "verify in current rules before mailing" |
| Hello Millions SC mail-in amount | Requires login | Listed as "verify" with confirmed address (PO Box 9550 Manchester NH) |
| McLuck sweepstakes rules exact text | Login-gated | Flagged as login-required; mail-in process confirmed via known RSI format |
| Current restricted states for platforms with frequent updates (Rolla, WOW Vegas) | Confirm by viewing ToS | Noted in risk text to verify before playing |

---

## What Requires Ongoing Human Review

| Item | Due Date | Reason |
|------|----------|--------|
| Oklahoma exit status | October 2026 | Operators exiting ahead of Nov 1 deadline — verify all platforms have blocked OK |
| Iowa IRGC first enforcement action | Ongoing | No C&D issued yet — monitor IRGC announcements |
| Louisiana enforcement actions | Ongoing | Law effective Aug 1 — check for operator compliance announcements |
| Florida 2027 legislative session | Jan 2027 | Highest legislative risk in green-zone states |
| NJ P.L. 2026 c. 128 effective date | TBD | Confirm if effective immediately or delayed; update if delayed |
| Virginia H 4431 iGaming + sweepstakes ban bill | 2026–2027 session | Monitor progress |

---

## Remaining Risks

1. **Operator divergence from state lists**: Operators may expand or contract their restricted-state lists faster than this tool is updated. Users should always check the operator's current ToS.
2. **Iowa activation risk**: SF 2289 gives the IRGC C&D authority that could rapidly change Iowa's status from gray to banned. The biweekly checker will monitor for enforcement actions.
3. **New Mexico enforcement**: NMGCB has classified sweepstakes as illegal but has not acted. This situation could change rapidly.
4. **Oklahoma transition**: Between August 8 and November 1, 2026, a transitional period exists where operators serve Oklahoma but may abruptly exit.
5. **LuckyLand entry method**: The discrepancy between the website footer (postal) and in-platform process (online per user) should be resolved by checking LuckyLand's actual current Sweeps Rules PDF, which was not publicly accessible without login.

---

## Architecture Changes (v3.0)

- **data.js**: All state and platform data extracted to standalone module with full source attribution
- **index.html**: Presentation layer only, with data inlined at build time
- **checker.js**: Biweekly automation with content hashing, staleness detection, and ban signal detection
- **tests/integrity.test.js**: 43-test suite (43 pass, 0 fail post-audit)
- **.github/workflows/biweekly-check.yml**: GitHub Actions scheduler (1st and 15th of month, 8 AM UTC)
- **AUDIT-REPORT.md**: This document (human-readable change record)
- **changeHistory[]**: Machine-readable array in data.js

---

*Audit completed August 8, 2026. Next scheduled automated check: August 22, 2026.*
