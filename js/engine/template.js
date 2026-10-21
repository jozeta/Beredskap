/*
 * template.js — Placeholder resolver bound to the structured entity graph.
 *
 * Syntax: {{path}} or {{path|formatter}}, e.g. {{person.ciso.name}},
 * {{num.ransom|currency}}, {{time.T+45|clock}}, {{env.edrAlert|cap}}.
 *
 * Every text is resolved into BOTH languages at generation time, so switching
 * language live never changes a fact: names, numbers and times are identical,
 * only wording and formatting differ. Unknown placeholders are left in place
 * as "⟦path⟧" and reported, so the validator can fail with an actionable message.
 *
 * Paths:
 *   org.name|shortName|domain|city|sector|model|headcount|sites|crownJewels
 *   org.service.<slot>[.rto|.rpo]          slot: primary|secondary|support|customer
 *   person.<role>[.name|firstName|lastName|title|initials|email]
 *   actor.name|type|motivation|leakSite|contact|slug
 *   supplier.<kind>[.domain]               kind: msp|cloud|vendor|isp|irRetainer|insurer|bank|registrar|payments|facilities
 *   asset.<key>                             hostnames, IPs, domains, accounts
 *   num.<variable>                          rolled template variables
 *   time.T+<minutes> / time.T-<minutes>     in-scenario clock relative to T+0
 *   env.<term>                              technology-environment vocabulary
 *   reg.<key>                               jurisdiction-specific authorities and laws
 */
(function () {
  "use strict";

  const BK = window.BK;
  const LANGS = ["en", "sv"];
  const PATTERN = /\{\{\s*([^}|]+?)\s*(?:\|\s*(\w+)\s*)?\}\}/g;

  // ---- Jurisdiction references --------------------------------------------------------

  const REG = {
    se: {
      dpa: { en: "IMY, the Swedish Authority for Privacy Protection", sv: "Integritetsskyddsmyndigheten (IMY)" },
      dpaShort: { en: "IMY", sv: "IMY" },
      csirt: { en: "CERT-SE", sv: "CERT-SE" },
      police: { en: "the Swedish Police Authority", sv: "Polisen" },
      nis2: { en: "the Swedish Cybersecurity Act (NIS2)", sv: "cybersäkerhetslagen (NIS2)" },
      supervisor: { en: "the sector supervisory authority", sv: "tillsynsmyndigheten för sektorn" },
      country: { en: "Sweden", sv: "Sverige" }
    },
    eu: {
      dpa: { en: "the national data protection authority", sv: "den nationella dataskyddsmyndigheten" },
      dpaShort: { en: "the DPA", sv: "dataskyddsmyndigheten" },
      csirt: { en: "the national CSIRT", sv: "den nationella CSIRT-enheten" },
      police: { en: "the national police", sv: "den nationella polisen" },
      nis2: { en: "the national NIS2 legislation", sv: "den nationella NIS2-lagstiftningen" },
      supervisor: { en: "the NIS2 competent authority", sv: "den behöriga NIS2-myndigheten" },
      country: { en: "the EU", sv: "EU" }
    },
    generic: {
      dpa: { en: "the data protection regulator", sv: "dataskyddsmyndigheten" },
      dpaShort: { en: "the regulator", sv: "tillsynsmyndigheten" },
      csirt: { en: "the national CSIRT", sv: "den nationella CSIRT-enheten" },
      police: { en: "law enforcement", sv: "polisen" },
      nis2: { en: "applicable cybersecurity regulation", sv: "tillämplig cybersäkerhetsreglering" },
      supervisor: { en: "the sector regulator", sv: "tillsynsmyndigheten för sektorn" },
      country: { en: "the country", sv: "landet" }
    }
  };

  // ---- Clock helpers (local wall-clock arithmetic, DST-safe via setMinutes) -------------

  function clockDate(start, offsetMinutes) {
    const d = new Date(start.y, start.m - 1, start.d, start.h, start.mi, 0, 0);
    d.setMinutes(d.getMinutes() + (offsetMinutes || 0));
    return d;
  }

  function parseOffset(spec) {
    if (spec === "start") return 0;
    const m = /^T([+-])(\d+)$/.exec(spec);
    if (!m) return null;
    return (m[1] === "-" ? -1 : 1) * Number(m[2]);
  }

  // ---- Lookup ----------------------------------------------------------------------------

  const MISSING = {}; // sentinel

  /** Resolve a dotted path to a raw value: string | number | {en,sv} | Date | MISSING. */
  function lookup(path, ctx) {
    const parts = path.split(".");
    const head = parts[0];
    const e = ctx.entities;

    switch (head) {
      case "org": {
        const org = e.org;
        if (parts[1] === "service") {
          const s = org.services[parts[2]];
          if (!s) return MISSING;
          if (parts[3] === "rto") return s.rto;
          if (parts[3] === "rpo") return s.rpo;
          return parts[3] ? MISSING : s.name;
        }
        if (parts[1] === "sector") return { en: BK.t("sector." + org.sector, null, "en"), sv: BK.t("sector." + org.sector, null, "sv") };
        const v = org[parts[1]];
        return v === undefined || parts.length > 2 ? MISSING : v;
      }
      case "person": {
        const p = e.people[parts[1]];
        if (!p) return MISSING;
        const field = parts[2] || "name";
        return p[field] === undefined ? MISSING : p[field];
      }
      case "actor": {
        const v = e.actor[parts[1]];
        return v === undefined ? MISSING : v;
      }
      case "supplier": {
        const s = e.suppliers[parts[1]];
        if (!s) return MISSING;
        return parts[2] ? (s[parts[2]] === undefined ? MISSING : s[parts[2]]) : s.name;
      }
      case "asset": {
        const v = e.assets[parts[1]];
        return v === undefined ? MISSING : v;
      }
      case "num": {
        const v = ctx.vars[parts[1]];
        return v === undefined ? MISSING : v;
      }
      case "time": {
        const off = parseOffset(parts.slice(1).join("."));
        return off === null ? MISSING : clockDate(ctx.clock, off);
      }
      case "env": {
        const v = BK.data.environments.term(ctx.environment, parts[1]);
        return v || MISSING;
      }
      case "reg": {
        const v = (REG[ctx.jurisdiction] || REG.generic)[parts[1]];
        return v || MISSING;
      }
      default:
        return MISSING;
    }
  }

  // ---- Formatting --------------------------------------------------------------------------

  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function format(value, formatter, lang, ctx) {
    const fmt = BK.i18n.fmt;
    if (value instanceof Date) {
      switch (formatter || "clock") {
        case "clock": return fmt.time(value, lang);
        // No year: the internal year is fixed for reproducibility and must never show.
        case "date": return new Intl.DateTimeFormat(BK.i18n.locale(lang), { day: "numeric", month: "long" }).format(value);
        case "weekday": return new Intl.DateTimeFormat(BK.i18n.locale(lang), { weekday: "long" }).format(value);
        case "day": return fmt.weekdayDate(value, lang);
        case "datetime": return fmt.weekdayDate(value, lang) + " " + fmt.time(value, lang);
        default: return null;
      }
    }
    if (typeof value === "number") {
      switch (formatter || "number") {
        case "number": return fmt.number(value, lang);
        case "currency": return fmt.currency(value, ctx.currency, lang);
        case "percent": return new Intl.NumberFormat(BK.i18n.locale(lang), { style: "percent", maximumFractionDigits: 0 }).format(value / 100);
        case "hours": return fmt.number(value, lang) + " h";
        case "raw": return String(value);
        default: return null;
      }
    }
    const text = typeof value === "string" ? value : BK.loc(value, lang);
    switch (formatter) {
      case undefined:
      case null:
      case "": return text;
      case "cap": return cap(text);
      // Lower-case the first letter for mid-sentence use, unless it starts an acronym ("MES", "ERP").
      case "lcfirst": return text && !/^[A-ZÅÄÖ]{2}/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
      case "upper": return text.toUpperCase();
      case "lower": return text.toLowerCase();
      default: return null;
    }
  }

  /** Resolve one string for one language. Missing paths are collected into `missing`. */
  function resolveString(str, lang, ctx, missing) {
    if (typeof str !== "string" || str.indexOf("{{") === -1) return str;
    return str.replace(PATTERN, (whole, path, formatter) => {
      const value = lookup(path.trim(), ctx);
      if (value === MISSING) {
        missing.add(path.trim());
        return "⟦" + path.trim() + "⟧";
      }
      const out = format(value, formatter, lang, ctx);
      if (out === null) {
        missing.add(path.trim() + "|" + formatter);
        return "⟦" + path.trim() + "|" + formatter + "⟧";
      }
      return out;
    });
  }

  /** True for bilingual text objects: { en, sv } with string values (and nothing else). */
  function isText(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const keys = Object.keys(v);
    return keys.length > 0 && keys.every((k) => LANGS.includes(k) && typeof v[k] === "string");
  }

  /** Resolve a bilingual object or plain string into { en, sv }. */
  function resolveText(value, ctx, missing) {
    const m = missing || new Set();
    if (value == null) return value;
    if (typeof value === "string") {
      return { en: resolveString(value, "en", ctx, m), sv: resolveString(value, "sv", ctx, m) };
    }
    return { en: resolveString(value.en, "en", ctx, m), sv: resolveString(value.sv, "sv", ctx, m) };
  }

  /**
   * Deep-resolve any structure: bilingual objects are resolved; strings containing
   * placeholders become { en, sv }; ids, numbers and other strings pass through.
   */
  function resolveDeep(value, ctx, missing) {
    if (value == null || typeof value === "number" || typeof value === "boolean") return value;
    if (typeof value === "string") return value.indexOf("{{") === -1 ? value : resolveText(value, ctx, missing);
    if (Array.isArray(value)) return value.map((v) => resolveDeep(v, ctx, missing));
    if (typeof value === "function") return undefined; // functions never reach an instance
    if (isText(value)) return resolveText(value, ctx, missing);
    const out = {};
    Object.keys(value).forEach((k) => {
      const r = resolveDeep(value[k], ctx, missing);
      if (r !== undefined) out[k] = r;
    });
    return out;
  }

  /** All placeholder paths used in a structure (for template-level reference checks). */
  function collectPlaceholders(value, acc) {
    const out = acc || new Set();
    if (typeof value === "string") {
      let m;
      PATTERN.lastIndex = 0;
      while ((m = PATTERN.exec(value))) out.add(m[1].trim());
    } else if (Array.isArray(value)) {
      value.forEach((v) => collectPlaceholders(v, out));
    } else if (value && typeof value === "object") {
      Object.keys(value).forEach((k) => collectPlaceholders(value[k], out));
    }
    return out;
  }

  BK.engine.template = { REG, clockDate, lookup, resolveString, resolveText, resolveDeep, isText, collectPlaceholders, MISSING };
})();
