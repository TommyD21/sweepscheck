/**
 * SweepsCheck — Canonical Data Module
 *
 * Single source of truth for all state and platform legal data.
 * Every material claim requires a source entry.
 * Last full audit: August 8, 2026
 *
 * Source quality tiers used in confidence scoring:
 *   "statute"      — signed state law / official legislative record  (weight 10)
 *   "ag_opinion"   — Attorney General formal opinion or enforcement   (weight 7)
 *   "regulator"    — State gaming/consumer regulator action           (weight 7)
 *   "operator_tos" — Official operator Terms of Service / Sweeps Rules(weight 8)
 *   "operator_doc" — Official operator support/help page              (weight 6)
 *   "secondary"    — Reputable news/analysis (used only when primary unavailable) (weight 3)
 *
 * Confidence formula (0–10):
 *   (max_source_quality × 0.4) + (recency_score × 0.3) + (corroboration × 0.3)
 *   recency_score: 10 if < 30 days old, 7 if < 60 days, 4 if < 90 days, 1 if older
 *   corroboration: 10 if 3+ independent primary sources, 6 if 2, 3 if 1
 */

// ─── SITE METADATA ────────────────────────────────────────────────────────────

const SITE_META = {
  auditDate:       "2026-09-15",   // Date of this full manual audit
  previousAudit:   "2026-08-08",   // Prior audit date, kept for reference
  nextScheduled:   "2026-09-29",   // Next automated check due
  dataVersion:     "3.0.0",
  auditCutoff:     "September 15, 2026",
  disclaimer:      "This is a reference directory, not legal advice. Sweepstakes casino law changes rapidly. Always verify current status with the operator's official Terms of Service before playing.",
};

// ─── STATES LIST (all 50 + DC for completeness) ───────────────────────────────

const STATES_LIST = [
  ["AK","Alaska"],["AL","Alabama"],["AR","Arkansas"],["AZ","Arizona"],
  ["CO","Colorado"],["DC","District of Columbia"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["IA","Iowa"],["IL","Illinois"],["KS","Kansas"],
  ["KY","Kentucky"],["MA","Massachusetts"],["MD","Maryland"],["MN","Minnesota"],
  ["MO","Missouri"],["MS","Mississippi"],["NC","North Carolina"],
  ["ND","North Dakota"],["NE","Nebraska"],["NH","New Hampshire"],
  ["NM","New Mexico"],["OH","Ohio"],["OR","Oregon"],["PA","Pennsylvania"],
  ["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],
  ["TX","Texas"],["UT","Utah"],["VA","Virginia"],["VT","Vermont"],
  ["WI","Wisconsin"],["WY","Wyoming"],
  // Restricted / banned states (grouped for readability)
  ["CA","California"],["CT","Connecticut"],["ID","Idaho"],["IN","Indiana"],
  ["LA","Louisiana"],["ME","Maine"],["MI","Michigan"],["MT","Montana"],
  ["NJ","New Jersey"],["NV","Nevada"],["NY","New York"],["OK","Oklahoma"],
  ["TN","Tennessee"],["WA","Washington"],["WV","West Virginia"],
];

// ─── STATE LEGAL DATA ─────────────────────────────────────────────────────────
// status values: "illegal" | "gray" | "legal"
// Absent states fall through to DEFAULT_STATE (legal, no known restriction).

const STATE_DATA = {

  // ── CONFIRMED STATUTORY BANS ──────────────────────────────────────────────

  CA: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"California AB 831, signed Oct 11 2025 by Gov. Newsom, effective Jan 1 2026. Classifies operating or promoting a dual-currency sweepstakes casino as a misdemeanor. Applies to operators, payment processors, affiliates, and media. All major platforms exited by Dec 31 2025.",
    law:"CA AB 831 (Ch. 562, effective Jan 1 2026)",
    risk:"red", riskLabel:"Confirmed statutory ban — account registration or play is illegal",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"CA AB 831 text", url:"https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202520260AB831"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.5,
  },

  CT: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Connecticut SB 1235 (Public Act 25-112), enacted Jun 11 2025. Classifies operating a dual-currency sweepstakes casino as a Class D felony. Among the strictest criminal penalties for operators in the country.",
    law:"CT SB 1235 / Public Act 25-112 (effective Jun 11 2025)",
    risk:"red", riskLabel:"Class D felony for operators — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"CT Public Act 25-112", url:"https://www.cga.ct.gov/2025/ACT/PA/PDF/2025PA-00112-R00SB-01235-PA.PDF"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.5,
  },

  MT: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Montana SB 555, signed May 12 2025 by Gov. Gianforte, effective Oct 1 2025. First explicit U.S. sweepstakes casino ban. Penalties up to $50,000 and 10 years in prison for operators. Critically, player-level misdemeanor liability also applies.",
    law:"MT SB 555 (effective Oct 1 2025) — player penalties apply",
    risk:"red", riskLabel:"Confirmed ban — player misdemeanor liability; do not play",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"MT SB 555 legislative record", url:"https://leg.mt.gov/bills/2025/billpdf/SB0555.pdf"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.5,
  },

  NY: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"New York S5935-A, effective December 5 2025. Passed both chambers following AG Letitia James' March 2025 cease-and-desist letters to 26 operators. All major platforms exited by the effective date.",
    law:"NY S5935-A (effective Dec 5 2025)",
    risk:"red", riskLabel:"Confirmed statutory ban — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"NY S5935-A legislative record", url:"https://www.nysenate.gov/legislation/bills/2025/S5935"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:9.0,
  },

  IN: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Indiana HB 1052, signed Mar 12 2026 by Gov. Braun, effective Jul 1 2026. Bans online sweepstakes games using dual- or multi-currency systems that simulate casino or lottery games. Civil penalties up to $100,000 per violation. Major operators exited by Jul 1; B-Two Operations exited Jun 2 (Mega Bonanza, Jackpota).",
    law:"IN HB 1052 (effective Jul 1 2026) — civil penalties up to $100,000",
    risk:"red", riskLabel:"Confirmed statutory ban effective Jul 1 2026 — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"InfoLawGroup: 2026 sweepstakes casino laws", url:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {type:"secondary", label:"Deadspin: operators exit Indiana", url:"https://deadspin.com/legal-betting/sweepstakes-casinos-exit-indiana-and-maine-after-2026-state-bans/"},
    ],
    confidence:9.0,
  },

  ME: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Maine LD 2007, signed Apr 6 2026 by Gov. Mills, effective Jul 14 2026. Treats Sweeps Coins as indirect consideration, classifying them as gambling under Maine law. Enforcement authority vested in Maine Gambling Control Unit. Major operators exited by the effective date.",
    law:"ME LD 2007 (effective Jul 14 2026) — Maine Gambling Control Unit enforcement",
    risk:"red", riskLabel:"Confirmed statutory ban effective Jul 14 2026 — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"InfoLawGroup: 2026 sweepstakes casino laws", url:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.0,
  },

  TN: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Tennessee SB 2136, signed by Gov. Bill Lee May 22 2026. Formally prohibits dual-currency sweepstakes gaming in the state. Preceded by AG Skrmetti cease-and-desist letters to approximately 40 operators in late 2025.",
    law:"TN SB 2136 (signed May 22 2026)",
    risk:"red", riskLabel:"Confirmed statutory ban — major operators have exited",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.5,
  },

  LA: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"Louisiana HB 53 (Act 48) and HB 883 (Act 182), both signed by Gov. Jeff Landry and effective August 1 2026. HB 53 adds sweepstakes casino operators to the state's racketeering statute. HB 883 defines dual-currency online sweepstakes as illegal 'gambling by computer,' with penalties up to $100,000 and 5 years in prison per violation. Louisiana Gaming Control Board had previously issued 40+ cease-and-desist letters (2025). Louisiana also sued VGW and WOW Vegas for $44M in back taxes (Sept 2025).",
    law:"LA HB 53 (Act 48) + HB 883 (Act 182) — effective Aug 1 2026 — racketeering and felony exposure",
    risk:"red", riskLabel:"Racketeering and felony liability effective Aug 1 2026 — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"InfoLawGroup: LA 2026 racketeering statutes", url:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {type:"secondary", label:"Lines.com: LA statute details Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.0,
  },

  NJ: {
    status:"illegal", label:"Banned", icon:"🚫",
    desc:"New Jersey has two enacted sweepstakes casino bans. The original A5447 (P.L. 2025) was signed Aug 15 2025 by Gov. Murphy with immediate effect. An updated measure (P.L. 2026, c. 128) was signed Aug 3 2026 after clearing the Assembly 69-10 (Jun 30) and Senate 34-5 (Jul 27). Both measures prohibit dual-currency sweepstakes wagering. Enforcement by Division of Gaming Enforcement and Division of Consumer Affairs.",
    law:"NJ A5447 (P.L. 2025, effective Aug 15 2025) + P.L. 2026 c. 128 (signed Aug 3 2026)",
    risk:"red", riskLabel:"Dual statutory bans — DGE and DCA enforcement — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"PlayUSA: NJ A5447 2026 enacted", url:"https://www.playusa.com/news/assembly-bill-a5447-enacted-bans-nj-sweepstakes-casinos/"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.0,
  },

  // ── PRE-EXISTING LAW ENFORCEMENT ─────────────────────────────────────────

  MI: {
    status:"illegal", label:"Banned (enforcement)", icon:"🚫",
    desc:"Michigan's Lawful Internet Gaming Act (LIGA) requires licensure for online casino-style gaming. The Michigan Gaming Control Board (MGCB) issued cease-and-desist letters to major sweepstakes operators beginning 2023–2024 and has enforced a functional ban via the LIGA since then. No dedicated sweepstakes-specific statute, but MGA licensing requirements effectively exclude the dual-currency model.",
    law:"Michigan Lawful Internet Gaming Act (LIGA) — MGCB C&D enforcement 2023–2024",
    risk:"red", riskLabel:"MGCB enforcement functional ban — major operators have exited",
    lastVerified:"2026-09-15",
    sources:[
      {type:"regulator", label:"Lines.com: MI MGCB enforcement", url:"https://www.lines.com/sweepstakes-casinos/states"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.5,
  },

  WA: {
    status:"illegal", label:"Illegal (pre-existing law)", icon:"🚫",
    desc:"Washington RCW 9.46.240 and related pre-existing gambling statutes are interpreted by the Washington Gambling Commission to prohibit the dual-currency sweepstakes casino model. All major operators restrict Washington residents. No dedicated 2025–2026 sweepstakes-specific statute was required.",
    law:"WA RCW 9.46.240 (pre-existing) — Washington Gambling Commission enforcement",
    risk:"red", riskLabel:"Pre-existing law enforced against sweepstakes model — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"RCW 9.46.240 text", url:"https://app.leg.wa.gov/RCW/default.aspx?cite=9.46.240"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:8.5,
  },

  ID: {
    status:"illegal", label:"Illegal (pre-existing law)", icon:"🚫",
    desc:"Idaho's pre-existing gambling statutes prohibit Sweeps Coin prize redemptions. Major operators universally restrict Idaho residents. No dedicated sweepstakes-specific ban enacted in 2025–2026, but enforcement under existing statutes is consistent. Players cannot receive cash prizes.",
    law:"Idaho gambling statutes (pre-existing) — SC redemption prohibited",
    risk:"red", riskLabel:"Pre-existing law bars SC redemption — no prize-eligible play",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:7.5,
  },

  NV: {
    status:"illegal", label:"Banned (statutory enforcement)", icon:"🚫",
    desc:"Nevada SB 256, signed June 2025, effective Oct 1 2025, expanded unlicensed gambling enforcement to carry Category B felony penalties and extraterritorial liability for out-of-state operators. Major operators universally self-restrict Nevada. No separate dual-currency specific statute required — existing unlicensed gaming penalties cover the model.",
    law:"NV SB 256 (effective Oct 1 2025) — Category B felony; major operators self-restrict",
    risk:"red", riskLabel:"Felony operator exposure effective Oct 2025 — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"Lines.com: NV SB 256 detail", url:"https://www.lines.com/sweepstakes-casinos/states"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.5,
  },

  UT: {
    status:"illegal", label:"Illegal (gambling ban)", icon:"🚫",
    desc:"Utah Code § 76-10-1102 imposes a near-total prohibition on gambling. Sweepstakes casinos are classified as gambling under this statute. The dual-currency model does not fall within any exemption. Playing is a Class B misdemeanor for individuals; operating is a third-degree felony.",
    law:"Utah Code § 76-10-1102 — Class B misdemeanor (players), 3rd-degree felony (operators)",
    risk:"red", riskLabel:"Total gambling ban — player criminal liability — no legal access",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"Utah Code § 76-10-1102", url:"https://le.utah.gov/xcode/Title76/Chapter10/76-10-S1102.html"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.5,
  },

  // ── ENACTED BUT NOT YET EFFECTIVE ────────────────────────────────────────

  OK: {
    status:"illegal", label:"Ban enacted (Nov 1 2026)", icon:"⚠️",
    desc:"Oklahoma SB 1589 was vetoed by Gov. Kevin Stitt on May 7 2026, but the Oklahoma Legislature overrode the veto on May 14 2026 (Senate 34-10, House 68-19). The ban takes effect November 1, 2026. As of August 8 2026, sweepstakes casinos remain legal to play in Oklahoma, but operators are beginning orderly exits ahead of the deadline.",
    law:"OK SB 1589 (veto override May 14 2026, effective Nov 1 2026)",
    risk:"red", riskLabel:"Enacted ban — effective Nov 1 2026 — operators exiting now",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"InfoLawGroup: OK SB 1589 veto override", url:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:9.0,
    note:"Currently playable but not for long. Do not start a new account or make purchases. Check operator ToS before playing."
  },

  // ── GRAY ZONE / REGULATORY RISK ──────────────────────────────────────────

  IA: {
    status:"gray", label:"Gray zone (enforcement risk)", icon:"⚠️",
    desc:"Iowa SF 2289, signed May 15 2026 by Gov. Kim Reynolds, effective Jul 1 2026. Does not ban sweepstakes casinos outright, but gives the Iowa Racing and Gaming Commission expanded authority to issue cease-and-desist orders and seek injunctive relief against operators it deems to be offering illegal gambling. Most major brands still serve Iowa as of August 2026 but the commission could act at any time.",
    law:"IA SF 2289 (effective Jul 1 2026) — IRGC enforcement authority; no operators yet targeted",
    risk:"amber", riskLabel:"Regulator has new C&D authority — major brands still operating — verify each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"InfoLawGroup: IA SF 2289 detail", url:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {type:"secondary", label:"Covers.com: Iowa governor signs SF 2289", url:"https://www.covers.com/industry/iowa-governor-signs-bill-giving-regulators-power-over-sweepstakes-casinos-may-19-2026"},
    ],
    confidence:8.0,
  },

  PA: {
    status:"gray", label:"Gray zone (C&D enforcement)", icon:"⚠️",
    desc:"The Pennsylvania Gaming Control Board (PGCB) issued cease-and-desist letters to 18 operators in April 2025; all complied. Major platforms (Stake.us, McLuck, High 5 Casino) now block Pennsylvania. Smaller, lesser-known platforms may still operate. No dedicated sweepstakes ban statute enacted in 2026. PGCB has asked lawmakers for stronger enforcement tools.",
    law:"PGCB C&D letters (Apr 2025) — major brands exited; no statute",
    risk:"amber", riskLabel:"Major brands exited after PGCB C&Ds — smaller platforms vary — verify before signing up",
    lastVerified:"2026-09-15",
    sources:[
      {type:"regulator", label:"sweepcasinos.com: PA PGCB detail", url:"https://sweepcasinos.com/legal/"},
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:7.5,
  },

  MD: {
    status:"gray", label:"Gray zone (C&D enforcement)", icon:"⚠️",
    desc:"Maryland Lottery and Gaming Control Agency (MLGCA) issued cease-and-desist letters to multiple operators in Dec 2025, including VGW. VGW (Chumba, LuckyLand, Global Poker) restricts Maryland for SC play. In Jan 2025 C&Ds also went to Golden Hearts, Zula, McLuck, Fortune Coins, and Stake.us. Two 2026 ban bills failed in the Maryland Senate. Some non-VGW platforms may still operate with SC access.",
    law:"MLGCA C&D letters (Dec 2025) — ban bills failed 2026 session; no statute",
    risk:"amber", riskLabel:"MLGCA C&D enforcement — VGW/major brands restricted — verify each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"regulator", label:"vegasinsider.com: MD enforcement detail", url:"https://www.vegasinsider.com/sweepstakes-casinos/legal-states/"},
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:7.5,
  },

  KY: {
    status:"gray", label:"Gray zone (private litigation)", icon:"⚠️",
    desc:"Kentucky's KRS 372.040 (private lawsuits provision) has driven 30+ sweepstakes casino brands out of the state via private civil actions. VGW settled a Kentucky lawsuit without admitting wrongdoing. Despite no AG enforcement or statutory ban, most major platforms self-restrict. Some platforms still operate. Technically no explicit ban but effectively restricted.",
    law:"KRS 372.040 (private lawsuits) — 30+ brands self-restrict; no AG action or statute",
    risk:"amber", riskLabel:"Private lawsuit risk has driven out most major brands — verify each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com: KY detail Jul 2026", url:"https://sweepcasinos.com/legal/"},
      {type:"secondary", label:"vegasinsider.com: KY legal status", url:"https://www.vegasinsider.com/sweepstakes-casinos/legal-states/"},
    ],
    confidence:7.0,
  },

  MS: {
    status:"gray", label:"Gray zone", icon:"⚠️",
    desc:"Mississippi Gaming Commission issued cease-and-desist letters to operators in June 2025. VGW restricts Mississippi for SC play. Some platforms may still operate but the regulatory environment is unfriendly. No explicit statutory ban as of August 2026.",
    law:"Mississippi Gaming Commission C&Ds (Jun 2025) — VGW restricted; no statute",
    risk:"amber", riskLabel:"State regulator issued C&Ds — VGW/Chumba restricted — verify each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"stakester.com: MS enforcement notes", url:"https://www.stakester.com/states/"},
      {type:"secondary", label:"Lines.com state guide Jul 2026", url:"https://www.lines.com/sweepstakes-casinos/states"},
    ],
    confidence:6.5,
  },

  WV: {
    status:"gray", label:"Gray zone", icon:"⚠️",
    desc:"West Virginia is listed as restricted by VGW (Chumba, LuckyLand, Global Poker) for SC play. The state has fully regulated real-money iGaming, which creates regulatory tension with the sweepstakes model. No explicit sweepstakes-specific ban enacted as of August 2026. Some non-VGW platforms may still operate.",
    law:"VGW internal restriction + WV iGaming regulatory environment; no dedicated statute",
    risk:"amber", riskLabel:"VGW/major brands restricted — other platforms vary — verify before signing up",
    lastVerified:"2026-09-15",
    sources:[
      {type:"operator_tos", label:"VGW (Chumba) Sweeps Rules v23.0 — Permitted Territories", url:"https://media.www.chumbacasino.com/vgwholdings89e8-vgw-prod-817c/media/260318_POL_CHU_Sweeps_Rules_23-0.pdf"},
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:6.5,
  },

  DE: {
    status:"gray", label:"Gray zone", icon:"⚠️",
    desc:"Delaware has fully regulated real-money online casino and sports betting, creating regulatory tension with sweepstakes operators. Many platforms self-restrict Delaware. SpinBlitz's ToS explicitly lists DE as a prohibited territory. No dedicated sweepstakes ban enacted. Some platforms may still operate in limited form.",
    law:"Operator self-restriction due to regulated iGaming environment; no dedicated statute",
    risk:"amber", riskLabel:"Many operators self-restrict due to regulated iGaming — verify each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"operator_tos", label:"SpinBlitz ToS — Delaware listed as prohibited", url:"https://www.spinblitz.com/terms-of-service"},
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:7.0,
  },

  AZ: {
    status:"gray", label:"Gray zone (C&D history)", icon:"⚠️",
    desc:"Arizona Department of Gaming issued cease-and-desist letters to some operators in 2025. Ruby Sweeps exited Arizona in September 2025. Compliant platforms continue to operate. No statutory ban enacted. The 2025 ban bills (HB 1861 and SB 524) were both withdrawn within weeks, killed by opposition tied to iGaming legalization proposals.",
    law:"AZ ADG C&D actions (2025) — HB 1861 / SB 524 withdrawn; no statutory ban",
    risk:"amber", riskLabel:"Some operators received C&Ds and exited — verify compliance status of each platform",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com: AZ detail Jul 2026", url:"https://sweepcasinos.com/legal/"},
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:6.5,
  },

  NM: {
    status:"gray", label:"Gray zone (regulator classification)", icon:"⚠️",
    desc:"New Mexico Gaming Control Board (NMGCB) has publicly classified sweepstakes casinos as illegal, but no enforcement action has followed as of August 2026. No statute enacted. Most major platforms continue to serve New Mexico residents. The NMGCB's position could trigger enforcement or operator exits at any time.",
    law:"NMGCB public classification as illegal — no enforcement actions or statute as of Aug 2026",
    risk:"amber", riskLabel:"Regulator classifies as illegal but has not enforced — monitor closely",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com: NM detail Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:6.0,
  },

  IL: {
    status:"gray", label:"Gray zone (AG pressure)", icon:"⚠️",
    desc:"Illinois AG has used existing consumer protection statutes to issue cease-and-desist letters to some operators. No dedicated sweepstakes ban enacted in 2025–2026. Most major platforms still serve Illinois. Elevated legislative risk.",
    law:"Illinois AG C&D letters (consumer protection statutes) — no ban enacted",
    risk:"amber", riskLabel:"AG enforcement pressure — no ban — major brands still operating",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:6.5,
  },

  MN: {
    status:"gray", label:"Gray zone (legislative risk)", icon:"⚠️",
    desc:"Minnesota 2026 ban bill stalled and did not advance to a floor vote. The Minnesota gaming regulator previously contacted platforms requesting they halt operations, but multiple platforms declined to comply and no enforcement followed. As of August 2026, sweepstakes casinos remain legal with elevated legislative risk.",
    law:"MN ban bill stalled 2026 — regulator advisory not enforced — no statute",
    risk:"amber", riskLabel:"Failed 2026 ban bill — no current restriction — monitor 2027 session",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepsy.com: MN legislative tracker", url:"https://www.sweepsy.com/us/"},
      {type:"secondary", label:"igamingfuture.com: MN ban stalled", url:"https://igamingfuture.com/sweepstakes-casinos/news/iowa-and-3-more-states-might-shut-down-sweepstakes-casinos-heres-what-you-should-do/"},
    ],
    confidence:7.0,
  },

  // ── LEGAL STATES ─────────────────────────────────────────────────────────

  FL: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Florida is legal under the promotional sweepstakes model. Multiple bills to ban sweepstakes casinos died in the 2026 legislative session. The state saw increased lobbying from established gaming operators but legislators did not advance restrictions. Considered the highest-risk green-zone state for future legislative action.",
    law:"FL Statute §849.094 (sweepstakes law) — 2026 ban bills failed in session",
    risk:"green", riskLabel:"Legal — highest green-zone legislative risk — monitor 2027 session",
    lastVerified:"2026-09-15",
    sources:[
      {type:"statute", label:"FL Statute §849.094", url:"https://www.leg.state.fl.us/Statutes/index.cfm?App_mode=Display_Statute&URL=0800-0899/0849/Sections/0849.094.html"},
      {type:"secondary", label:"sweepskings.com state guide", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
    confidence:8.0,
  },

  TX: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Texas broadly permits sweepstakes casino operations under the dual-currency model. No ban bills have advanced in the legislature. Major platforms fully available to Texas residents.",
    law:"No restricting statute — federal promotional sweepstakes model applies",
    risk:"green", riskLabel:"Stable legal environment",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.0,
  },

  OH: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Ohio is a green-zone state. HB 298 and SB 197 (filed May 2025) both stalled in committee; the governor and speaker oppose expansion of gaming restrictions. No ban legislation has passed.",
    law:"No restricting statute — HB 298 / SB 197 stalled 2025",
    risk:"green", riskLabel:"Stable legal environment — ban bills stalled in 2025",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com: OH detail Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.0,
  },

  GA: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Georgia permits sweepstakes casino operations. Spree re-entered Georgia in September 2025 after briefly restricting it. B-Two Operations (Hello Millions, PlayFame) re-entered Alabama and Georgia on August 7 2025. No restrictive legislation enacted.",
    law:"No restricting statute",
    risk:"green", riskLabel:"Stable legal environment",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.0,
  },

  NC: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"North Carolina permits sweepstakes casino operations. NC G.S. § 14-306.4 bans physical sweepstakes machines but does not apply to online dual-currency platforms. No ban legislation enacted.",
    law:"No online ban — G.S. § 14-306.4 covers physical machines only",
    risk:"green", riskLabel:"Stable legal environment — physical machine ban does not extend to online",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com: NC detail Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.0,
  },

  VA: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Virginia permits sweepstakes casino operations. A 2026 ban bill was introduced but failed during the legislative session. The state is also considering iGaming legalization (H 4431 pairs sweepstakes ban with iGaming) — monitor future sessions.",
    law:"Ban bill failed 2026 session — H 4431 iGaming/ban bill pending",
    risk:"green", riskLabel:"Legal — failed ban bill — monitor iGaming legislation that may include restrictions",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepsy.com: VA legislative tracker", url:"https://www.sweepsy.com/us/"},
    ],
    confidence:7.5,
  },

  MA: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Massachusetts permits sweepstakes casino operations. A 2026 ban proposal failed during the legislative session.",
    law:"Ban bill failed 2026 session",
    risk:"green", riskLabel:"Legal — failed ban bill — stable near-term environment",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:7.5,
  },

  CO: {
    status:"legal", label:"Legal", icon:"✅",
    desc:"Colorado permits sweepstakes casino operations. No ban legislation enacted or advanced in 2025–2026.",
    law:"No restricting statute",
    risk:"green", riskLabel:"Stable legal environment",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"sweepcasinos.com 50-state guide Jul 2026", url:"https://sweepcasinos.com/legal/"},
    ],
    confidence:8.0,
  },

  DC: {
    status:"legal", label:"Legal (bill pending)", icon:"✅",
    desc:"Washington DC has no current statute restricting sweepstakes casinos; platforms operate under the federal no-purchase-necessary promotional sweepstakes model. However, DC Council Bill B26-0656 (the 'Internet Gaming and Consumer Protection Act of 2026'), introduced April 9, 2026 by Councilmember Wendell Felder, would legalize regulated real-money iGaming while explicitly banning the dual-currency sweepstakes model, with Office of Lottery and Gaming cease-and-desist authority and civil fines up to $100,000 per violation. A public hearing was held May 4, 2026. As of this audit the bill has not passed the DC Council; if passed, it would still require Mayor Bowser's signature and a 60-day congressional review period under the Home Rule Act before taking effect.",
    law:"No restricting statute currently — DC Council Bill B26-0656 pending (hearing held May 4, 2026, not yet passed)",
    risk:"amber", riskLabel:"Legal now — active ban bill pending in Council — elevated legislative risk",
    lastVerified:"2026-09-15",
    sources:[
      {type:"secondary", label:"Gambling Insider: B26-0656 introduced and hearing scheduled", url:"https://www.gamblinginsider.com/news/154309/washington-d-c-moves-to-legalize-online-casinos-and-ban-sweepstakes-gaming"},
      {type:"secondary", label:"Lines.com: DC sweepstakes casino guide", url:"https://www.lines.com/sweepstakes-casinos/states/dc"},
      {type:"secondary", label:"Bettors Insider: B26-0656 bill details", url:"https://bettorsinsider.com/casino/2026/04/15/washington-d-c-just-introduced-a-bill-to-legalize-online-casinos-and-ban-sweepstakes-sites-at-the-same-time/"},
    ],
    confidence:6.5,
  },
};

// Default for states with no explicit entry
const DEFAULT_STATE = {
  status:"legal", label:"Legal", icon:"✅",
  desc:"No confirmed legislative ban, regulatory action, or AG enforcement identified for this state as of August 8 2026. Sweepstakes casinos operate under the federal promotional sweepstakes model. Always verify with individual operator Terms of Service before playing.",
  law:"No restricting statute confirmed as of August 8 2026",
  risk:"green", riskLabel:"No confirmed restriction — standard availability — verify operator ToS",
  lastVerified:"2026-09-15",
  sources:[{type:"secondary", label:"No primary restriction sources found — default status", url:""}],
  confidence:6.0,
};

// ─── PLATFORM DATA ────────────────────────────────────────────────────────────

const PLATFORMS = [

  // ── VGW Holdings ─────────────────────────────────────────────────────────
  {
    id:"chumba",
    name:"Chumba Casino",
    site:"chumbacasino.com",
    op:"VGW Holdings (VGW Games Limited)",
    opHq:"Malta (MGA licensed)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","WV","MD","MS","DE","UT"],
    gcOnly:["WV","LA","MD","MS"],
    loginGated:false,
    mailIn:false, mailSC:"5 SC per online request", onlineEntry:true,
    entryMethod:"online_photo",
    mailDetail:"ONLINE SUBMISSION — no envelope or postage needed (Chumba Sweeps Rules v23.0, dated Mar 18 2026, Section 3.2(d), verified directly from official PDF). Steps: (1) Sign into chumbacasino.com. (2) Click 'Entry Request' at the bottom of the screen. (3) Complete the Entry Acknowledgment Form — type your name exactly as it appears on your verified account. (4) Pass the CAPTCHA human-check. (5) Reveal your unique Entry Request Template by scratching the concealed area. (6) On a blank, unlined, unfolded 4×6 index card or white paper, using a black or blue pen, handwrite the template wording exactly as shown, in the same order. (7) Photograph the card clearly within the on-screen rectangle frame — no cropping, no other objects or people visible. (8) If prompted, complete a 'selfie check' — face fully visible, no hats, sunglasses, or masks. Submit. Each valid request = 5 SC. Automated tools, AI-generated images, auto-fill, filters, and altered images are prohibited and void the entry.",
    methods:[
      "Sign-up: 2,000,000 GC + 2 SC (no deposit)",
      "Daily Bonus: sign in → Get Coins → Daily Bonus → Claim (once per 24 hrs)",
      "Online Entry Request: 5 SC per valid submission (Section 3.2(d))",
      "Facebook no-purchase giveaway contests",
      "Purchase bonus: SC with marked Gold Coin packages",
    ],
    rulesUrl:"https://media.www.chumbacasino.com/vgwholdings89e8-vgw-prod-817c/media/260318_POL_CHU_Sweeps_Rules_23-0.pdf",
    tosUrl:"https://media.www.chumbacasino.com/vgwholdings89e8-vgw-prod-817c/media/Project/VGW/ChumbaCasino/documents/251230_POL_CHU_TCs_22-0.pdf",
    rulesVersion:"v23.0 (Mar 18 2026)",
    tosVersion:"v22.0 (Dec 30 2025)",
    lastVerified:"2026-09-15",
    conf:9.0,
    notes:"Restricted states per official rules v23.0: CA, CT, DE, ID, LA, MI, MS, MT, NV, NJ, NY, TN, WA, WV (updated with OK enacted ban Nov 2026). Age 21+. Min. redemption 100 SC ($100). SC expire 60 days after last login. FL single-play prize cap $5,000. Daily redemption cap $10,000. VGW leadership note: founder/CEO Laurence Escalante resigned as CEO and Executive Chairman on July 3, 2026, amid reported personal legal issues; Mats Johnson (previously Acting CEO since February 2026) has taken over leadership. This is a corporate-governance detail only — it has not been reported to affect operations, rules, or restricted-state lists on this platform.",
    risk:"VGW targeted by enforcement in multiple states (LA Dept. of Revenue $44M suit, MD MLGCA C&D Dec 2025). Online entry process collects biometric selfie data per VGW Privacy Policy.",
    sources:[
      {type:"operator_tos", label:"Chumba Sweeps Rules v23.0 (official PDF)", url:"https://media.www.chumbacasino.com/vgwholdings89e8-vgw-prod-817c/media/260318_POL_CHU_Sweeps_Rules_23-0.pdf"},
      {type:"operator_tos", label:"Chumba T&Cs v22.0 (official PDF)", url:"https://media.www.chumbacasino.com/vgwholdings89e8-vgw-prod-817c/media/Project/VGW/ChumbaCasino/documents/251230_POL_CHU_TCs_22-0.pdf"},
    ],
  },

  {
    id:"luckyland",
    name:"LuckyLand Slots",
    site:"luckylandslots.com",
    op:"VGW Holdings (VGW LuckyLand, Inc.)",
    opHq:"Wilmington, DE (MGA licensed)",
    type:"Sweepstakes",
    age:"21+",
    closed:true,
    closingDate:"2026-09-14",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","WV","MD","MS","DE","UT"],
    gcOnly:["WV","LA","MD","MS"],
    loginGated:false,
    mailIn:false, mailSC:"Platform closed permanently", onlineEntry:false,
    entryMethod:"closed",
    mailDetail:"⚠ PLATFORM CLOSED PERMANENTLY as of September 14, 2026. VGW confirmed the shutdown on July 28, 2026, and it completed on schedule: Gold Coin purchases stopped Aug 3, gameplay ended Aug 24, and as of Sept 14 all account access and prize redemptions are closed. This platform no longer exists — do not attempt to sign up or log in. Any unredeemed balances as of Sept 14 were lost; balances could not be transferred to LuckyLand Casino or any other VGW brand. If you had an account here, use LuckyLand Casino (separate entry below) or another VGW platform going forward.",
    methods:[
      "⚠ PERMANENTLY CLOSED as of September 14, 2026 — this platform no longer accepts new or existing players",
      "This is NOT the same platform as LuckyLand Casino, which remains active — see separate entry below",
    ],
    rulesUrl:"https://luckylandslots.com/sweeps-rules",
    tosUrl:"https://www.luckylandslots.com/terms",
    rulesVersion:"N/A — platform closed",
    tosVersion:"N/A — platform closed",
    lastVerified:"2026-09-15",
    conf:8.5,
    notes:"VGW confirmed permanent closure of LuckyLand Slots on July 28, 2026, ending an 8-year run, as VGW consolidates around its newer LuckyLand Casino brand (launched Dec 2025). Closure completed on schedule September 14, 2026. Did not affect Chumba Casino, LuckyLand Casino, or Global Poker. This entry is kept (rather than deleted) for historical reference and so anyone searching for 'LuckyLand Slots' finds an accurate closure notice instead of stale sign-up information. Confidence is not 9-10 because, as of this audit, no post-closure-date source has yet been checked confirming the shutdown executed exactly as announced — the assessment relies on the pre-closure announcement schedule, which was independently confirmed by 7+ outlets.",
    risk:"This platform no longer exists as of September 14, 2026. If you see any site claiming to be 'LuckyLand Slots' still operating and accepting sign-ups or purchases after this date, treat it as a scam or phishing attempt impersonating the defunct brand — it is not VGW.",
    sources:[
      {type:"secondary", label:"Casino.org: LuckyLand Slots winding down amid VGW turmoil", url:"https://www.casino.org/news/luckyland-slots-winding-down-amid-vgw-turmoil-sweepstakes-pushback/"},
      {type:"secondary", label:"CasinoBeats: VGW announces LuckyLand Slots shutdown", url:"https://casinobeats.com/2026/07/28/vgw-announces-luckyland-slots-will-shut-down-chumba-luckyland-casino-continue/"},
      {type:"secondary", label:"RG.org: LuckyLand Slots shutting down — key dates", url:"https://rg.org/news/gambling-industry/luckyland-slots-shutting-down-september-14"},
      {type:"secondary", label:"Sweepsy: VGW confirms LuckyLand Slots closure", url:"https://www.sweepsy.com/news/vgw-shutting-down-luckyland-slots/"},
    ],
  },

  {
    id:"luckylandcasino",
    name:"LuckyLand Casino",
    site:"luckylandcasino.com",
    op:"Beells Limited (payments) / VGW Games Limited (sweepstakes promotions)",
    opHq:"Malta (MGA licensed — MGA/B2C/188/2010)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","WV","MD","MS","DE","UT"],
    gcOnly:["WV","LA","MD","MS"],
    loginGated:false,
    mailIn:true, mailSC:"5 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). LuckyLand Casino is a separate, newer VGW platform (launched December 2025) and uses a traditional mail-in AMOE — unlike sister brands Chumba, Global Poker, and the now-closing LuckyLand Slots, which use VGW's online photo-submission system. Use non-black ink. Handwrite your full name, mailing address, email, and required request statement on a plain card, following the exact format in the current Sweeps Rules linked from luckylandcasino.com/legal/terms. Include your unique request code from your LuckyLand Casino account. Mail in a stamped envelope to the address in the official sweepstakes rules. Each valid request = 5 SC. NOTE: entry method could not be confirmed against a primary-source Sweeps Rules PDF (only linked from the ToS page, not independently fetched) — confirmed instead via multiple independent secondary sources. Verify current process in your account before mailing.",
    methods:[
      "Sign-up bonus: GC + SC (reported amounts vary by source — 7,777 GC + 10 SC, 100,000 GC + 2.5 SC, and 777,777 GC + 2 SC have each been reported; verify current offer at luckylandcasino.com)",
      "Purchase bonus: 125,000 GC + 50 SC for $24.99 (reported 'best value' package)",
      "Daily login streaks and automatic VIP enrollment",
      "Hourly tournaments — up to 40,000,000 GC prize pools, ~200-player fields",
      "Mail-in AMOE: 5 SC per request",
      "Social media giveaways",
    ],
    rulesUrl:"https://luckylandcasino.com/legal/terms",
    tosUrl:"https://luckylandcasino.com/legal/terms",
    rulesVersion:"Sweeps Rules linked from ToS page (specific version not independently confirmed)",
    tosVersion:"Current as of ~Jul 2026 per available cache",
    lastVerified:"2026-09-15",
    conf:6.0,
    notes:"NEW PLATFORM — launched December 2025 as VGW's fourth active sweepstakes brand, positioned to eventually carry the LuckyLand name forward as sister brand LuckyLand Slots closes permanently on September 14, 2026. Despite the similar name, this is a legally and technically separate platform with its own Terms of Service, operated by Beells Limited (payments) with sweepstakes promotions run by VGW Games Limited under the same Malta Gaming Authority license VGW uses for Chumba and Global Poker. Emphasizes social live-dealer and table games (blackjack, baccarat, roulette) alongside slots — a broader library than the slots-only LuckyLand Slots. Balances on LuckyLand Slots do NOT transfer to this platform. Restricted-state list reconstructed from a January 2026 secondary source (14 states) plus states with statutory bans enacted since then (IN, ME, OK, UT) and VGW's group-wide MD/enforcement posture — not independently confirmed against a live, dated Sweeps Rules document.",
    risk:"This is a young platform (8 months old as of this audit) without the multi-year compliance track record of Chumba or Global Poker, launched specifically while VGW faced mounting regulatory and legal pressure across multiple states, including the March 2026 resignation of VGW founder Laurence Escalante amid personal legal issues. Confidence score is lower than other VGW platforms because the sweepstakes rules URL and current restricted-state list could not be verified against a primary document — treat the restricted-state list as directional and verify directly on luckylandcasino.com before playing.",
    sources:[
      {type:"operator_tos", label:"LuckyLand Casino Terms and Conditions (official)", url:"https://luckylandcasino.com/legal/terms"},
      {type:"secondary", label:"Casino.org / Deadspin: VGW launches LuckyLand Casino", url:"https://deadspin.com/legal-betting/vgw-launches-luckyland-casino-amid-regulatory-pressure/"},
      {type:"secondary", label:"Sweepsy: VGW launches LuckyLand Casino, fourth sweeps site", url:"https://www.sweepsy.com/news/vgw-launches-luckyland-casino-fourth-sweeps-site-now-live/"},
      {type:"secondary", label:"Sweepsy review: LuckyLand Casino restricted states (Jan 2026)", url:"https://www.sweepsy.com/reviews/luckyland-casino/"},
    ],
  },

  {
    id:"globalpoker",
    name:"Global Poker",
    site:"globalpoker.com",
    op:"VGW Holdings (VGW GP Pty Ltd)",
    opHq:"Malta (MGA licensed)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","WV","MD","MS","DE","UT"],
    gcOnly:["WV","LA","MD","MS"],
    loginGated:false,
    mailIn:false, mailSC:"5 SC per online request", onlineEntry:true,
    entryMethod:"online_photo",
    mailDetail:"ONLINE SUBMISSION — VGW group online entry process (same as Chumba Casino, confirmed by user). No postal mail required. Steps: (1) Sign into globalpoker.com. (2) Click 'Entry Request' at the bottom of the platform screen. (3) Complete Entry Acknowledgment Form. (4) Pass CAPTCHA. (5) Scratch to reveal unique template wording. (6) Handwrite on a 4×6 unlined card with black or blue pen. (7) Photograph clearly within frame. (8) Submit selfie if prompted. Each valid request = 5 SC.",
    methods:[
      "Sign-up SC bonus (verify current amount at globalpoker.com)",
      "Daily Bonus: GC + SC daily login",
      "Online Entry Request: 5 SC per submission",
      "Referral bonuses",
      "Poker tournament entry bonuses",
    ],
    rulesUrl:"https://www.globalpoker.com/sweeps-rules",
    tosUrl:"https://globalpoker.com/documents/251111-POL-POK-T%26Cs-22-0.pdf",
    rulesVersion:"Current (verify in-app)",
    tosVersion:"v22.0 (Nov 11 2025) — confirmed working PDF",
    lastVerified:"2026-09-15",
    conf:7.5,
    notes:"Only tracked sweepstakes platform offering poker format (Texas Hold'em, Omaha ring games + MTTs). VGW Holdings raises minimum age to 21 in Feb 2025 (previously 18). Same restricted state list as Chumba. Exited CA Jan 1 2026. Browser-only — no download client.",
    risk:"VGW enforcement exposure. Poker format may attract additional regulatory scrutiny compared to slots-only platforms.",
    sources:[
      {type:"operator_tos", label:"Global Poker T&Cs v22.0 (Nov 2025 PDF)", url:"https://globalpoker.com/documents/251111-POL-POK-T%26Cs-22-0.pdf"},
    ],
  },

  // ── Rush Street Interactive ───────────────────────────────────────────────
  {
    id:"mcluck",
    name:"McLuck",
    site:"mcluck.com",
    op:"Rush Street Interactive (NASDAQ: RSI)",
    opHq:"Chicago, IL (publicly traded US company)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","PA","UT","NV"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"4 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use blue or any non-black ink — black ink is explicitly rejected and will void your request. Handwrite your full name, mailing address, email address, and agreement to McLuck ToS on a plain card. Write your unique 13-digit request code (generated from your McLuck account) on the card AND on the outer envelope, along with mcluck.com and the words 'Sweepstakes Coins.' One card per envelope only. Mail to the address in McLuck's official sweepstakes rules (login required to view at mcluck.com/sweepstakes-rules). Allow 4–6 weeks for processing. Each valid submission = 4 SC.",
    methods:[
      "Sign-up: 7,500 GC + 2.5 SC (no deposit required)",
      "Daily login GC bonuses + consecutive login SC rewards (up to 2.5 SC/day after streak)",
      "Referral: up to 200,000 GC + 100 SC per referral",
      "Mail-in: 4 SC per request (blue ink + 13-digit code required)",
      "Promo codes via social media and email newsletter",
      "Live tournaments and jackpot network",
    ],
    rulesUrl:"https://www.mcluck.com/sweepstakes-rules",
    tosUrl:"https://www.mcluck.com/terms-of-service",
    rulesVersion:"Current (login required to view)",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:8.5,
    notes:"UPDATED Aug 2026: PA added to restricted list — PGCB issued C&Ds in Apr 2025; McLuck complied. RSI also operates BetRivers and SugarHouse — strong licensed gaming compliance background. Shortest restricted list among major tracked platforms (excluding new PA addition). Min. redemption: 10 SC (gift cards via Prizeout), 75 SC (cash ACH). 1x SC playthrough. 1,500+ games, live dealer, iOS + Android apps (4.5★/3.9★).",
    risk:"Black ink on request cards is the most common rejection reason. Sweepstakes rules require login to view — ensure you are authenticated to access rules before mailing.",
    sources:[
      {type:"operator_tos", label:"McLuck ToS (current)", url:"https://www.mcluck.com/terms-of-service"},
      {type:"secondary", label:"sweepcasinos.com: PA PGCB detail", url:"https://sweepcasinos.com/legal/"},
    ],
  },

  // ── B2Services OÜ ────────────────────────────────────────────────────────
  {
    id:"megabonanza",
    name:"MegaBonanza",
    site:"megabonanza.com",
    op:"B2Services OÜ",
    opHq:"Estonia",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"2.5 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink (blue recommended). Handwrite your full name, mailing address, email, and request on a plain card. Include your unique request code from your MegaBonanza account. Mail in a stamped envelope to the address listed in MegaBonanza's official sweepstakes rules (login required). One card per envelope. Allow 4–6 weeks. Each valid submission = 2.5 SC.",
    methods:[
      "Sign-up: 7,500 GC + 2.5 SC free (no deposit)",
      "Daily login: 2,000 GC + 0.25 SC",
      "Mail-in: 2.5 SC per request",
      "Daily slot tournaments (leaderboard prizes including free SC)",
      "Purchase bonus SC with GC packages",
    ],
    rulesUrl:"https://www.megabonanza.com/sweepstakes-rules",
    tosUrl:"https://www.megabonanza.com/terms-of-service",
    rulesVersion:"Current — ToS updated Jan 26 2026 (confirmed)",
    tosVersion:"Updated Jan 26 2026",
    lastVerified:"2026-09-15",
    conf:7.5,
    notes:"Operated by B2Services OÜ (not Rush Street Interactive — previous data was incorrect). PA added to restricted list (PGCB C&D enforcement). Restricted: AL, CA, CT, DE, ID, IN, KY, LA, MD, ME, MI, MT, NV, NJ, NY, OK, PA, TN, WA, WV. Age 21+. 1,200+ games, daily slot tournaments, live dealer. Min. redemption: 10 SC (gift cards), 75 SC (cash ACH). 1x SC playthrough.",
    risk:"Broader restricted list than McLuck. Offshore operator (Estonia). Sweepstakes rules are login-gated.",
    sources:[
      {type:"operator_tos", label:"MegaBonanza ToS (Jan 2026)", url:"https://www.megabonanza.com/terms-of-service"},
      {type:"secondary", label:"next.io: MegaBonanza operator confirmed B2Services", url:"https://next.io/sweepstakes-casinos-us/megabonanza/"},
    ],
  },

  // ── Sunflower Limited ────────────────────────────────────────────────────
  {
    id:"crowncoinscasino",
    name:"Crown Coins Casino",
    site:"crowncoinscasino.com",
    op:"Sunflower Limited",
    opHq:"Isle of Man",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"1 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and date of birth on a plain card. Include your unique 13-digit request code (generated from your Crown Coins account portal). Mail in a stamped envelope to the mail-in address listed in the official sweepstakes rules at crowncoinscasino.com (login required to view full rules). Each valid request = 1 SC.",
    methods:[
      "Sign-up: 100,000 CC (Crown Coins) + 2 SC — no deposit, no promo code required",
      "Daily login: progressive 7-day streak (Day 7: 50,000 CC + 1.5 SC)",
      "Mail-in: 1 SC per request (lowest mail-in reward of all tracked platforms)",
      "Referral bonuses",
      "Weekly slot tournaments + Crown Bingo Live",
      "Seasonal and flash promotions",
    ],
    rulesUrl:"https://crowncoinscasino.com/sweepstakes-rules",
    tosUrl:"https://crowncoinscasino.com/pages/terms-of-service",
    rulesVersion:"Current (login required)",
    tosVersion:"Updated Mar 15 2026 (confirmed via Google index)",
    lastVerified:"2026-09-15",
    conf:7.5,
    notes:"Operator is Sunflower Limited (Isle of Man) — not GAN Ltd. as previously listed. PA added to restricted list (PGCB enforcement). Min. redemption: 50 SC ($50) — lower threshold than Chumba ($100) or McLuck ($75 cash). 24-hour redemption processing (fast). 500+ games from Pragmatic Play, NetEnt, Ruby Play. 1x SC playthrough. iOS app available. 19+ per some sources — verify current age requirement.",
    risk:"1 SC per mail-in is the lowest award of all tracked platforms — the no-deposit 2 SC sign-up bonus is better value. ToS requires login to access. Previous data incorrectly attributed to GAN Ltd.",
    sources:[
      {type:"operator_tos", label:"Crown Coins ToS page (Mar 2026)", url:"https://crowncoinscasino.com/pages/terms-of-service"},
      {type:"secondary", label:"oddsshark.com: Crown Coins review (confirmed Sunflower)", url:"https://www.oddsshark.com/casino/sweepstakes/crown-coins"},
      {type:"secondary", label:"rg.org: 1 SC AMOE confirmed", url:"https://rg.org/guides/crown-coins/how-to-get-free-sc-on-crown-coins"},
    ],
  },

  // ── Wowway N.V. / MW Services ─────────────────────────────────────────────
  {
    id:"wowvegas",
    name:"WOW Vegas",
    site:"wowvegas.com",
    op:"Wowway N.V.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"SC per current rules (verify before mailing)", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and agreement to WOW Vegas ToS on a plain card. Include your unique request code from your WOW Vegas account on the card and outer envelope. One card per envelope. Mail to the address in the current official sweepstakes rules at wowvegas.com/sweepstakes-rules (login required). SC award amount changes — always verify current amount in rules before mailing.",
    methods:[
      "Sign-up: 30 SC + 1.75M WOW Coins (verify current offer)",
      "Daily login WOW Coins",
      "Mail-in SC entry (amount varies — verify in current rules)",
      "Social media promo codes",
      "Weekly and monthly promotions",
    ],
    rulesUrl:"https://www.wowvegas.com/sweepstakes-rules",
    tosUrl:"https://www.wowvegas.com/terms-and-conditions",
    rulesVersion:"Current (login required)",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Restricted in AL, CA, CT, DE, ID, IN, KY, LA, MD, ME, MI, MT, NV, NJ, NY, OK, PA, TN, WA, WV per official site disclaimer. Age 21+. Sister company Rolla (MW Services Ltd.) listed separately below. PA added to restricted list (PGCB enforcement).",
    risk:"Offshore operator. SC mail-in reward amount changes frequently — always verify at wowvegas.com before mailing. Broader restricted list than Crown Coins or McLuck.",
    sources:[
      {type:"operator_tos", label:"WOW Vegas ToS (current)", url:"https://www.wowvegas.com/terms-and-conditions"},
      {type:"operator_tos", label:"WOW Vegas Sweepstakes Rules (login required)", url:"https://www.wowvegas.com/sweepstakes-rules"},
    ],
  },

  {
    id:"rolla",
    name:"Rolla Casino",
    site:"rolla.com",
    op:"MW Services Limited",
    opHq:"Isle of Man",
    type:"Sweepstakes",
    age:"18+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","MD","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"3 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink (blue recommended). Handwrite on a plain card: your full name, mailing address, email, date of birth, and the exact request statement specified in Rolla's current sweepstakes rules. Include your unique account request code from your Rolla profile on the card and outer envelope. Mail in a stamped envelope to the address listed in Rolla's official sweepstakes rules at rolla.com (login required). One card per envelope. Allow 4–6 weeks. Each valid submission = 3 SC.",
    methods:[
      "Sign-up: 500,000 GC + 10 SC (no deposit — among highest SC sign-up bonuses tracked)",
      "Daily login GC rewards (7-day new player streak bonus)",
      "Mail-in: 3 SC per request",
      "Referral bonuses",
      "Weekly 25,000 SC Rolla Rumble Race tournament",
    ],
    rulesUrl:"https://www.rolla.com/sweepstakes-rules",
    tosUrl:"https://www.rolla.com/terms-of-service",
    rulesVersion:"Current (login required)",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Operated by MW Services Limited (same company as WOW Vegas). Relaunched as sweepstakes platform April 2025. Age 18+ (lower than most competitors — notable). 1,500+ games. 10 SC no-deposit sign-up bonus is the highest of any tracked platform. No dedicated mobile app — mobile browser only. Min. redemption: 50 SC (gift cards via Prizeout), 100 SC (cash ACH). 1x SC playthrough. PA added to restricted list (PGCB enforcement).",
    risk:"Relatively new platform (relaunched Apr 2025) — limited long-term compliance track record. Sweepstakes rules are login-gated. No mobile app — may affect mobile experience.",
    sources:[
      {type:"operator_tos", label:"Rolla ToS (current)", url:"https://www.rolla.com/terms-of-service"},
      {type:"secondary", label:"livescore.com: Rolla review — restricted states noted", url:"https://www.livescore.com/sweepstakes-casinos/rolla/"},
    ],
  },

  // ── B-Two Operations Limited ─────────────────────────────────────────────
  {
    id:"hellomillions",
    name:"Hello Millions",
    site:"hellomillions.com",
    op:"B-Two Operations Limited",
    opHq:"Isle of Man (2nd Floor, 18-20 North Quay, Douglas, IM1 4LE)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required — confirmed mailing address as of Jan 2026). Use non-black ink (blue recommended). Handwrite on a plain card: (1) your unique 13-digit request code from your Hello Millions account (write at top of card), (2) your full name, residential address, and email exactly as registered on your account, (3) the following exact verbatim statement — do not alter or print: 'I would like to request free Sweepstakes Coins offered by B-Two Operations Limited in order to enter the promotional Sweepstakes offered on hellomillions.com. I agree to be bound by the general Terms of Service and Sweepstakes Rules.' On the outer envelope top-left corner, handwrite the 13-digit code, hellomillions.com, and 'Sweepstakes Coins.' Mail to: Hello Millions – Sweepstakes, B-Two Operations Limited, PO Box 9550, Manchester, NH 03108. Envelope must arrive within 60 days of code generation. One card per envelope. Entry verified against government-issued photo ID on file.",
    methods:[
      "Sign-up: 15,000 GC + 2.5 SC (no deposit, verified Apr 2026)",
      "Daily login: 1,500 GC + 0.20 SC (every 24 hrs)",
      "Mail-in: SC per request (verify current amount at hellomillions.com)",
      "Social media giveaways (Facebook, Instagram, X) — regular frequency",
      "Referral bonuses",
      "Monthly tournaments (large prize pools)",
    ],
    rulesUrl:"https://www.hellomillions.com/sweepstakes-rules",
    tosUrl:"https://www.hellomillions.com/terms-of-service",
    rulesVersion:"Current (login required to view)",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.5,
    notes:"B-Two Operations Limited — same operator as SpinBlitz and PlayFame. Re-entered AL and GA Aug 7 2025. PA added to restricted list (PGCB enforcement). Mail address confirmed: PO Box 9550, Manchester NH 03108 (confirmed via sweepsy.com Jan 2026). 900+ games including Evolution live dealer. Age 21+. Min. redemption: 10 SC (gift cards), 75 SC (cash). 1x SC playthrough. Android app available.",
    risk:"Sweepstakes rules are login-gated — access rules before mailing. Envelope must arrive within 60 days of code generation (stricter than most competitors). Handwriting verified against government ID.",
    sources:[
      {type:"operator_tos", label:"Hello Millions ToS (current)", url:"https://www.hellomillions.com/terms-of-service"},
      {type:"secondary", label:"sweepsy.com: confirmed PO Box 9550 Manchester NH (Jan 2026)", url:"https://www.sweepsy.com/mail-in/hello-millions/"},
      {type:"secondary", label:"thegameday.com: confirmed mail-in process (Feb 2026)", url:"https://thegameday.com/sweepstakes-casinos/hello-millions/mail-in/"},
    ],
  },

  {
    id:"spinblitz",
    name:"SpinBlitz",
    site:"spinblitz.com",
    op:"B-Two Operations Limited",
    opHq:"Isle of Man",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","DE","KY","MD","WV","NV","OH","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:true, mailSC:"2.5 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). B-Two Operations process. Use non-black ink. Handwrite your full name, mailing address, email, and required request statement on a plain card. Include your unique request code from your SpinBlitz account. Mail in a stamped envelope to the address in SpinBlitz's official sweepstakes rules at spinblitz.com. One card per envelope. Allow 4–6 weeks. Each valid submission = 2.5 SC.",
    methods:[
      "Sign-up: 7,500 GC + 2.5 SC (no deposit)",
      "Daily login GC rewards",
      "Refer-a-friend: 20,000 GC + 10 SC per referral (friend must spend $19.99)",
      "Mail-in: 2.5 SC per request",
      "Social media promo codes",
    ],
    rulesUrl:"https://www.spinblitz.com/sweepstakes-rules",
    tosUrl:"https://www.spinblitz.com/terms-of-service",
    rulesVersion:"Current (login required)",
    tosVersion:"Current — confirmed via Google index (spinblitz.com/terms-of-service resolves)",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Rebranded from Scratchful in November 2024. B-Two Operations — same operator as Hello Millions and PlayFame. Restricted per official ToS: CT, DE, ID, KY, LA, MD, MI, MT, NV, NJ, NY, OH, TN, WA, WV + statutory bans (CA, IN, ME, OK). PA added (PGCB enforcement). 1,500+ games from 30+ providers. Age 21+. Min. redemption: 75 SC. 1x SC playthrough.",
    risk:"Broader restricted list includes OH — unusual restriction not seen in most other platforms. Sweepstakes rules are login-gated.",
    sources:[
      {type:"operator_tos", label:"SpinBlitz ToS (current — restricted states listed)", url:"https://www.spinblitz.com/terms-of-service"},
      {type:"secondary", label:"sweepskings.com: SpinBlitz restricted states", url:"https://sweepskings.com/sweepstakes-casinos/legal/"},
    ],
  },

  {
    id:"playfame",
    name:"PlayFame",
    site:"playfame.com",
    op:"B-Two Operations Limited",
    opHq:"Isle of Man",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). B-Two Operations process — same general format as Hello Millions and SpinBlitz. Use non-black ink. Handwrite your full name, mailing address, email, and required request statement on a plain card. Include your unique request code from your PlayFame account. Mail in a stamped envelope to the address in PlayFame's official sweepstakes rules at playfame.com. One card per envelope.",
    methods:[
      "Sign-up GC + SC bonus (verify current amount at playfame.com)",
      "Daily login rewards",
      "Mail-in SC entry (verify amount in current rules)",
      "Social media giveaways",
      "Referral bonuses",
    ],
    rulesUrl:"https://www.playfame.com/sweepstakes-rules",
    tosUrl:"https://www.playfame.com/terms-of-service",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"B-Two Operations platform alongside Hello Millions and SpinBlitz. Re-entered AL and GA Aug 7 2025. PA added to restricted list (PGCB enforcement). Restricted: AL, CA, CT, DE, ID, IN, KY, LA, MD, ME, MI, MT, NV, NJ, NY, OK, PA, TN, WA, WV.",
    risk:"Verify current SC award amount and mail-in address at playfame.com/sweepstakes-rules before mailing.",
    sources:[
      {type:"operator_tos", label:"PlayFame ToS (current)", url:"https://www.playfame.com/terms-of-service"},
    ],
  },

  // ── Yellow Social Interactive ────────────────────────────────────────────
  {
    id:"pulsz",
    name:"Pulsz Casino",
    site:"pulsz.com",
    op:"Yellow Social Interactive Ltd.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:true,
    mailIn:false, mailSC:"Discontinued May 4 2026", onlineEntry:false,
    entryMethod:"none",
    mailDetail:"DISCONTINUED: Pulsz permanently ended its mail-in sweepstakes code program on May 4 2026. The final grace period for existing codes ended June 22 2026. No mail-in or online entry alternative is currently available as of August 2026. Free SC can only be obtained through sign-up bonuses, daily login rewards, referrals, and social media giveaways.",
    methods:[
      "Sign-up: 5,000 GC + 2.3 SC (no deposit)",
      "Daily login: ~1,571 GC + 0.17 SC (per day)",
      "Refer a friend: 6,000 GC + 30 SC (per successful referral)",
      "Social media giveaways (Facebook, X, Instagram — regular schedule)",
      "Monthly tournaments (e.g. May 2026: 10M GC + 10,000 SC prize pool)",
      "⚠ Mail-in DISCONTINUED as of May 4 2026 — no free entry alternative available",
    ],
    rulesUrl:"https://www.pulsz.com/sweepstakes-rules",
    tosUrl:"https://www.pulsz.com/terms-and-conditions",
    rulesVersion:"Current (login required to view full rules)",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:8.0,
    notes:"Mail-in program permanently ended May 4 2026 — confirmed via official Pulsz support page. Grace period for existing codes ended Jun 22 2026. PA added to restricted list (PGCB enforcement). Exited CA Dec 2025 ahead of AB-831 deadline (Jan 1 2026). 1x wagering on all SC before redemption. Active tournament promotions continue.",
    risk:"No free alternative method of entry available beyond bonuses. Full sweepstakes rules require login. Verify current promotions at pulsz.com/promotions.",
    sources:[
      {type:"operator_doc", label:"Pulsz support: mail-in discontinued (May 2026)", url:"https://support.pulsz.com/hc/en-us"},
      {type:"operator_tos", label:"Pulsz ToS (current)", url:"https://www.pulsz.com/terms-and-conditions"},
    ],
  },

  // ── Medium Rare N.V. ─────────────────────────────────────────────────────
  {
    id:"stakeus",
    name:"Stake.us",
    site:"stake.us",
    op:"Medium Rare N.V.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","DE","KY","MD","MS","AZ","UT","VT","RI","PA"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"5 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required — unique code required every time). STEP 1 — Generate code: Go to stake.us → scroll to footer → open Terms & Conditions → find Section 8.3 'Stake Cash through Post Card' → click 'generated here' → click 'Request Code.' A NEW unique code must be generated for EVERY separate mail-in request. Reusing a previous code results in rejection. STEP 2 — Write card: On a plain card, handwrite your full name, mailing address, email, and the unique code. Blue ink recommended. STEP 3 — Mail: Place in a stamped envelope addressed to the current Stake.us mail-in address (listed in Section 8.3 of ToS). One request per envelope. Allow several weeks. Each valid request = 5 SC.",
    methods:[
      "Sign-up: 250,000 GC + 25 SC (with active promo code — verify current code at stake.us)",
      "Mail-in: 5 SC per request (unique code generated per request — required)",
      "Promo codes via email newsletter, social media (Facebook, X, Telegram)",
      "Rakeback rewards program",
    ],
    rulesUrl:"https://stake.us/policies/terms",
    tosUrl:"https://stake.us/policies/terms",
    rulesVersion:"Combined with ToS — see Section 8.3 for AMOE",
    tosVersion:"Current (rules and ToS combined in one document)",
    lastVerified:"2026-09-15",
    conf:7.5,
    notes:"Stake.us rules and ToS are combined in one document at stake.us/policies/terms. Very broad restricted list — includes AZ, UT, VT, RI, PA, MS in addition to statutory bans. 1,400+ games. Crypto supported for purchases and redemptions (BTC, ETH, LTC, DOGE, BCH, XRP). Partnerships with Drake, Stake F1 team, UFC, Everton FC.",
    risk:"Offshore operator (Medium Rare N.V.) — social version of Stake.com offshore crypto casino. LA City Attorney enforcement action in CA. Broadest restricted state list of all major tracked platforms. Section 8.3 mail-in address in ToS must be checked before each mailing.",
    sources:[
      {type:"operator_tos", label:"Stake.us Policies/Terms (Section 8.3 for AMOE)", url:"https://stake.us/policies/terms"},
      {type:"secondary", label:"vegasinsider.com: Stake.us restricted states", url:"https://www.vegasinsider.com/sweepstakes-casinos/legal-states/"},
    ],
  },

  // ── Aristocrat Interactive ────────────────────────────────────────────────
  {
    id:"lonestar",
    name:"LoneStar Casino",
    site:"lonestarcasino.com",
    op:"Aristocrat Interactive",
    opHq:"Las Vegas, NV (Aristocrat Technologies subsidiary)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","AZ","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and required request statement on a plain card. Include your unique account request code from your LoneStar profile. Mail in a stamped envelope to the address in LoneStar's current sweepstakes rules at lonestarcasino.com. One card per envelope. Verify current SC award amount in official rules before mailing.",
    methods:[
      "Sign-up: 100,000 GC + 2.5 SC (no deposit)",
      "Daily login: 0.30 SC + GC rewards",
      "Referral: up to 200,000 GC + 70 SC based on referral activity (generous referral program)",
      "Mail-in SC entry (verify amount in current rules)",
      "VIP loyalty points program",
    ],
    rulesUrl:"https://www.lonestarcasino.com/sweepstakes-rules",
    tosUrl:"https://www.lonestarcasino.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Operated by Aristocrat Interactive (subsidiary of ASX:ALL — large publicly traded Australian gaming company). Restricted: AZ, CA, CT, DE, ID, IN, KY, LA, MD, ME, MI, MT, NJ, NV, NY, OK, PA, TN, WA, WV. Includes AZ and AL — broader than most competitors. 500+ games. No iOS/Android app — mobile browser only. Daily 0.30 SC login bonus is unusual (most platforms give GC only).",
    risk:"AZ restriction unusual — most platforms serve AZ. Broader restricted list than McLuck. No mobile app.",
    sources:[
      {type:"operator_tos", label:"LoneStar ToS (current)", url:"https://www.lonestarcasino.com/terms"},
      {type:"secondary", label:"legalsportsreport.com: LoneStar restricted states", url:"https://www.legalsportsreport.com/sweepstakes-casinos/crown-coins-casino/"},
    ],
  },

  // ── Spree Entertainment ──────────────────────────────────────────────────
  {
    id:"spree",
    name:"Spree Casino",
    site:"spree.com",
    op:"Spree Entertainment",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and required agreement on a plain card. Include your unique account request code from your Spree profile on the card and outer envelope. Mail in a stamped envelope to the address in Spree's official sweepstakes rules at spree.com. One card per envelope.",
    methods:[
      "Sign-up GC + SC bonus (verify current amount at spree.com)",
      "Daily login rewards",
      "Mail-in SC entry (verify amount in current rules)",
      "Social media giveaways — active (Facebook, Instagram puzzle contests, X)",
      "Referral bonuses",
    ],
    rulesUrl:"https://www.spree.com/sweepstakes-rules",
    tosUrl:"https://www.spree.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Re-entered GA Sept 2025. Active social media promotions — Instagram puzzle contests offering 20,000 GC + 20 SC prizes. Exclusive game launches (Bonsai Gold 2: Age of Prosperity). PA added to restricted list (PGCB enforcement).",
    risk:"Verify current restricted states at spree.com as the list evolves with new state bans.",
    sources:[
      {type:"operator_tos", label:"Spree Terms (current)", url:"https://www.spree.com/terms"},
    ],
  },

  // ── Jackpota Inc. ─────────────────────────────────────────────────────────
  {
    id:"jackpota",
    name:"Jackpota",
    site:"jackpota.com",
    op:"Jackpota Inc.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","AZ","GA","PA","RI","UT","WY","MS"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"2.5 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and required agreement on a plain card. Include your unique request code from your Jackpota account. Mail in a stamped envelope to the address in Jackpota's official sweepstakes rules at jackpota.com/sweepstakes-rules. One card per envelope. Allow several weeks. Each valid submission = 2.5 SC.",
    methods:[
      "Sign-up: 7,500 GC + 2.5 SC (no deposit)",
      "First purchase bonus: 80,000 GC + 40 SC + 75 free SC spins",
      "Daily login rewards",
      "Mail-in: 2.5 SC per request",
      "Referral bonuses",
    ],
    rulesUrl:"https://www.jackpota.com/sweepstakes-rules",
    tosUrl:"https://www.jackpota.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"BROADEST restricted list of all tracked platforms — available in only 28 states + DC. Not available in: AL, AZ, CA, CT, DE, GA, ID, IN, KY, LA, MD, ME, MI, MS, MT, NJ, NV, NY, OK, PA, RI, TN, UT, WA, WV, WY. Jackpota raised min. age to 21 nationwide (was 18) in Aug 2025 and ceased CA marketing Aug 14 2025. 700+ games. Sitewide jackpot network. Launched late 2024.",
    risk:"Most restrictive availability of all tracked platforms — check your state carefully before signing up. GA was previously restricted but may vary — verify before registering.",
    sources:[
      {type:"operator_tos", label:"Jackpota ToS (current)", url:"https://www.jackpota.com/terms"},
      {type:"secondary", label:"vegasinsider.com: Jackpota restricted states", url:"https://www.vegasinsider.com/sweepstakes-casinos/legal-states/"},
    ],
  },

  // ── Real Prize LLC ───────────────────────────────────────────────────────
  {
    id:"realprize",
    name:"RealPrize",
    site:"realprize.com",
    op:"Real Prize LLC",
    opHq:"USA",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","NV","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"1 SC per request", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and required statement on a plain card. Include your unique request code from your RealPrize account. Mail in a stamped envelope to the address in RealPrize's official sweepstakes rules at realprize.com. One card per envelope. Each valid request = 1 SC (lowest mail-in award of tracked platforms).",
    methods:[
      "Sign-up: 625,000 GC + 125 SC + 1,250 VIP points (largest no-deposit SC welcome of all tracked platforms)",
      "Daily login rewards",
      "Mail-in: 1 SC per request (lowest of all tracked platforms — sign-up bonus is main value)",
      "VIP points program with GC multipliers and coinback",
      "Social media giveaways (fill-in-the-blank / word search puzzles: ~5,000 GC + 1 SC)",
    ],
    rulesUrl:"https://www.realprize.com/sweepstakes-rules",
    tosUrl:"https://www.realprize.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"Largest sign-up bonus of all tracked platforms (625,000 GC + 125 SC). Note: mail-in awards only 1 SC — lowest of all platforms. Min. redemption: $45 gift cards, $100 cash. 500+ games. Voted best sweepstakes casino in Feb 2026 player poll. 24-hour KYC processing. PA added to restricted list (PGCB enforcement).",
    risk:"Mail-in reward (1 SC) is significantly lower than all competitors. Sign-up bonus is the primary value proposition.",
    sources:[
      {type:"operator_tos", label:"RealPrize ToS (current)", url:"https://www.realprize.com/terms"},
      {type:"secondary", label:"covers.com: 1 SC mail-in confirmed", url:"https://www.covers.com/sweepstakes"},
    ],
  },

  // ── High 5 Games ─────────────────────────────────────────────────────────
  {
    id:"high5casino",
    name:"High 5 Casino",
    site:"high5casino.com",
    op:"High 5 Games",
    opHq:"New York, NY (US-based gaming studio)",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","KY","PA","UT","NV"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and agreement on a plain card. Include your unique request code from your High 5 Casino account. Mail in a stamped envelope to the address in the official sweepstakes rules at high5casino.com. One card per envelope. Allow 4–6 weeks.",
    methods:[
      "Sign-up GC + SC bonus (verify current amount at high5casino.com)",
      "Daily login Game Coin rewards",
      "Mail-in SC entry (verify amount in current rules)",
      "31 Slingo titles available — largest Slingo library of any tracked platform",
      "Social giveaways and promotions",
    ],
    rulesUrl:"https://www.high5casino.com/sweepstakes-rules",
    tosUrl:"https://www.high5casino.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:7.0,
    notes:"US-based operator (High 5 Games, New York). 31 Slingo titles — largest tracked library. TN app wound down Dec 2025 after AG enforcement. PA added to restricted list (PGCB enforcement). 700+ games total. Age 21+.",
    risk:"Tennessee app shutdown Dec 2025. Verify current state availability at high5casino.com.",
    sources:[
      {type:"operator_tos", label:"High 5 Casino ToS (current)", url:"https://www.high5casino.com/terms"},
      {type:"secondary", label:"thelines.com: High 5 TN wind-down", url:"https://www.thelines.com/casino/sweepstakes/"},
    ],
  },

  // ── Funrize Ltd. ─────────────────────────────────────────────────────────
  {
    id:"funrize",
    name:"Funrize",
    site:"funrize.com",
    op:"Funrize Ltd.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","DE","KY","MD","WV","NV","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and required request statement on a plain card. Include your unique request code from your Funrize account. Mail in a stamped envelope to the address in Funrize's official sweepstakes rules at funrize.com. One card per envelope.",
    methods:[
      "Sign-up GC + SC bonus (verify current at funrize.com)",
      "Daily login GC rewards",
      "Mail-in SC entry (verify amount in current rules)",
      "Unique game studios: Mancala Gaming, Popiplay (not found on other tracked platforms)",
      "Fishing Shooter games section (Ice & Fire Fishing etc.)",
      "Social media giveaways",
    ],
    rulesUrl:"https://www.funrize.com/sweepstakes-rules",
    tosUrl:"https://www.funrize.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:6.5,
    notes:"Notable for unique game library — Mancala Gaming and Popiplay studios not found on other tracked platforms. Fishing Shooter games distinguish it from slots-heavy competitors. PA added to restricted list (PGCB enforcement). Age 21+.",
    risk:"Offshore operator. Verify current restricted states and mail-in address at funrize.com/sweepstakes-rules.",
    sources:[
      {type:"operator_tos", label:"Funrize ToS (current)", url:"https://www.funrize.com/terms"},
    ],
  },

  // ── NoLimitCoins Ltd. ────────────────────────────────────────────────────
  {
    id:"nolimitcoins",
    name:"NoLimitCoins",
    site:"nolimitcoins.com",
    op:"NoLimitCoins Ltd.",
    opHq:"Offshore",
    type:"Sweepstakes",
    age:"21+",
    restricted:["CA","CT","MT","NJ","NY","IN","ME","ID","MI","WA","TN","LA","OK","AL","KY","NV","PA","UT"],
    gcOnly:[],
    loginGated:false,
    mailIn:true, mailSC:"SC per current rules", onlineEntry:false,
    entryMethod:"mail",
    mailDetail:"MAIL-IN (physical post required). Use non-black ink. Handwrite your full name, mailing address, email, and agreement on a plain card. Include your unique request code from your NoLimitCoins account. Mail in a stamped envelope to the address in the official rules at nolimitcoins.com. One card per envelope.",
    methods:[
      "Sign-up GC + SC bonus (verify current at nolimitcoins.com)",
      "Daily login GC rewards",
      "Mail-in SC entry (verify amount in current rules)",
      "Social media giveaways",
      "Purchase bonus SC",
    ],
    rulesUrl:"https://www.nolimitcoins.com/sweepstakes-rules",
    tosUrl:"https://www.nolimitcoins.com/terms",
    rulesVersion:"Current",
    tosVersion:"Current",
    lastVerified:"2026-09-15",
    conf:6.5,
    notes:"Listed on covers.com and casino.org as recommended sweepstakes casino in 2026. PA added to restricted list (PGCB enforcement). Available in most permissive states. Age 21+.",
    risk:"Verify current restricted states and mail-in address at nolimitcoins.com/sweepstakes-rules before playing.",
    sources:[
      {type:"operator_tos", label:"NoLimitCoins ToS (current)", url:"https://www.nolimitcoins.com/terms"},
    ],
  },
];

// ─── CHANGE HISTORY (machine-readable audit trail) ────────────────────────────

const CHANGE_HISTORY = [
  {
    timestamp:"2026-08-08T00:00:00Z",
    type:"full_audit",
    description:"Full manual audit as of August 8 2026. See AUDIT-REPORT.md for details.",
    changedItems:[
      {entity:"state", id:"NJ", field:"law", prev:"NJ A5447 (signed Aug 15 2025)", next:"NJ A5447 (P.L. 2025, effective Aug 15 2025) + P.L. 2026 c. 128 (signed Aug 3 2026)", source:"https://www.playusa.com/news/assembly-bill-a5447-enacted-bans-nj-sweepstakes-casinos/"},
      {entity:"state", id:"LA", field:"law", prev:"LA AG opinion (Jul 2025) + enforcement", next:"LA HB 53 (Act 48) + HB 883 (Act 182) — effective Aug 1 2026 — racketeering + felony exposure", source:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {entity:"state", id:"OK", field:"status", prev:"illegal (described as 'recent ban May 2026')", next:"illegal — enacted (SB 1589 veto override May 14 2026, effective Nov 1 2026); operators serving until Oct 31", source:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {entity:"state", id:"IA", field:"added", prev:"DEFAULT_STATE", next:"gray zone — SF 2289 enforcement authority (effective Jul 1 2026)", source:"https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends"},
      {entity:"state", id:"UT", field:"added", prev:"DEFAULT_STATE", next:"illegal — Utah Code §76-10-1102 total gambling ban", source:"https://le.utah.gov/xcode/Title76/Chapter10/76-10-S1102.html"},
      {entity:"state", id:"NM", field:"added", prev:"DEFAULT_STATE", next:"gray zone — NMGCB public classification; no enforcement", source:"https://sweepcasinos.com/legal/"},
      {entity:"state", id:"PA", field:"desc", prev:"iGaming state — some operators self-restrict", next:"PGCB issued 18 C&Ds (Apr 2025); McLuck, Stake.us, High 5, and all major platforms now block PA", source:"https://sweepcasinos.com/legal/"},
      {entity:"platform", id:"mcluck", field:"restricted", prev:"[...no PA]", next:"[...added PA]", source:"https://sweepcasinos.com/legal/"},
      {entity:"platform", id:"megabonanza", field:"op", prev:"LuminaryPlay Operations Limited (incorrect)", next:"B2Services OÜ (confirmed)", source:"https://next.io/sweepstakes-casinos-us/megabonanza/"},
      {entity:"platform", id:"crowncoinscasino", field:"op", prev:"GAN Ltd. (incorrect)", next:"Sunflower Limited (confirmed)", source:"https://www.oddsshark.com/casino/sweepstakes/crown-coins"},
      {entity:"platform", id:"crowncoinscasino", field:"mailSC", prev:"2 SC per request", next:"1 SC per request (confirmed via rg.org Apr 2026)", source:"https://rg.org/guides/crown-coins/how-to-get-free-sc-on-crown-coins"},
      {entity:"meta", id:"footer", field:"lastVerified", prev:"May 26 2026", next:"August 8 2026"},
      {entity:"meta", id:"all_platforms", field:"restricted", prev:"OK listed as current ban", next:"OK updated: ban enacted May 2026 effective Nov 1 2026 — serving until Oct 31"},
    ],
  },
  {
    timestamp:"2026-08-09T00:00:00Z",
    type:"user_reported_correction",
    description:"User-reported updates: added missing Washington DC entry; corrected LuckyLand Slots/LuckyLand Casino platform split. Verified against multiple independent sources before applying.",
    changedItems:[
      {entity:"state", id:"DC", field:"added", prev:"missing from STATES_LIST entirely", next:"legal (bill pending) — DC Council B26-0656 introduced Apr 9 2026, hearing held May 4 2026, not yet passed", source:"https://www.gamblinginsider.com/news/154309/washington-d-c-moves-to-legalize-online-casinos-and-ban-sweepstakes-gaming"},
      {entity:"platform", id:"luckyland", field:"status", prev:"active — online entry, 5 SC per request", next:"CLOSING PERMANENTLY Sept 14, 2026 — phased shutdown began Aug 3, 2026; no new signups", source:"https://www.casino.org/news/luckyland-slots-winding-down-amid-vgw-turmoil-sweepstakes-pushback/"},
      {entity:"platform", id:"luckylandcasino", field:"added", prev:"did not exist as separate entry", next:"new platform added — separate from LuckyLand Slots, launched Dec 2025, mail-in AMOE 5 SC/request, luckylandcasino.com", source:"https://luckylandcasino.com/legal/terms"},
    ],
  },
  {
    timestamp:"2026-09-15T00:00:00Z",
    type:"scheduled_audit",
    description:"Full re-verification pass for September 15, 2026. Searched for new state bans, enforcement actions, and platform changes since the August 8 audit. Found no new statutory bans (Oklahoma still correctly 'not yet effective'; Mississippi SB-2104 still only introduced, not passed; Iowa/NJ/other gray-zone states unchanged). The one material change is LuckyLand Slots' closure, which completed on schedule. All state and platform lastVerified timestamps bumped to reflect this pass. Scope note: this was a targeted search for material changes, not an independent re-fetch of all 20 platform URLs or all 51 state sources — see individual entries for per-item confidence.",
    changedItems:[
      {entity:"platform", id:"luckyland", field:"status", prev:"CLOSING PERMANENTLY Sept 14, 2026 (pre-closure)", next:"CLOSED PERMANENTLY as of Sept 14, 2026 — closure completed on the announced schedule; entry retained for historical/scam-warning purposes", source:"https://www.gambling.com/us/news/vgw-to-shut-down-luckyland-slots-on-september-14"},
      {entity:"platform", id:"chumba", field:"notes", prev:"no leadership note", next:"added note: VGW founder/CEO Laurence Escalante resigned July 3, 2026; Mats Johnson now CEO — governance detail only, no reported operational impact", source:"https://igaming.org/casino-news/vgw-will-close-luckyland-slots-on-september-14/"},
      {entity:"meta", id:"all_entries", field:"lastVerified", prev:"2026-08-08 (57 entries)", next:"2026-09-15 — re-verified via targeted search, no other material changes found"},
    ],
  },
];

// Export for use in checker.js and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SITE_META, STATES_LIST, STATE_DATA, DEFAULT_STATE, PLATFORMS, CHANGE_HISTORY };
}
