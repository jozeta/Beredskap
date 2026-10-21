/*
 * rng.js — Seeded, reproducible randomness.
 *
 * Seeds are human-readable strings such as "FJORD-4821". A seed string is
 * hashed to 32 bits and fed into mulberry32. Named sub-streams (`rng.fork("people")`)
 * are derived from the seed *and the name only*, never from how many numbers
 * the parent has already drawn. That is what keeps names stable when an author
 * adds an optional inject that consumes extra numbers somewhere else.
 *
 * crypto.getRandomValues is used only by newSeed(); generation itself is deterministic.
 */
(function () {
  "use strict";

  const BK = window.BK;

  /** FNV-1a 32-bit hash with a final avalanche, so similar strings diverge. */
  function hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  }

  /** Classic mulberry32: returns a function producing floats in [0, 1). */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Normalise user input into a canonical seed string (trimmed, upper-case, single spaces). */
  function normalizeSeed(seed) {
    return String(seed == null ? "" : seed)
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  /**
   * Create a random stream for a seed key.
   * The key is the normalised seed, extended with "/name" for every fork.
   */
  function create(seed) {
    const key = normalizeSeed(seed);
    const next = mulberry32(hashString(key));

    const rng = {
      key,
      next,

      /** Integer in [min, max], inclusive. */
      int(min, max) {
        return min + Math.floor(next() * (max - min + 1));
      },

      /** Float in [min, max). */
      float(min, max) {
        return min + next() * (max - min);
      },

      /** Value in [min, max] snapped to `step` (used for template variables). */
      stepped(min, max, step) {
        const s = step || 1;
        const slots = Math.floor((max - min) / s);
        return min + rng.int(0, slots) * s;
      },

      chance(p) {
        return next() < p;
      },

      pick(arr) {
        if (!arr || arr.length === 0) return undefined;
        return arr[Math.floor(next() * arr.length)];
      },

      /** Fisher–Yates on a copy; the input array is never mutated. */
      shuffle(arr) {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          const tmp = out[i];
          out[i] = out[j];
          out[j] = tmp;
        }
        return out;
      },

      /** `n` distinct elements (by position). Returns fewer if the array is shorter. */
      pickN(arr, n) {
        return rng.shuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length)));
      },

      /**
       * Weighted choice. Accepts [{ value, weight }] or (items, weightFn).
       * Items with weight <= 0 are never chosen.
       */
      weighted(items, weightFn) {
        const getW = weightFn || ((it) => it.weight);
        const getV = weightFn ? (it) => it : (it) => it.value;
        const total = items.reduce((sum, it) => sum + Math.max(0, getW(it)), 0);
        if (total <= 0) return undefined;
        let roll = next() * total;
        for (const it of items) {
          roll -= Math.max(0, getW(it));
          if (roll < 0) return getV(it);
        }
        return getV(items[items.length - 1]);
      },

      /** Independent named sub-stream. Same seed + same name => same sequence. */
      fork(name) {
        return create(key + "/" + name);
      }
    };
    return rng;
  }

  // Seed words: short, Nordic, unambiguous when read aloud in English or Swedish.
  const SEED_WORDS = [
    "FJORD", "BIRCH", "LYNX", "TUNDRA", "AURORA", "SKERRY", "GLACIER", "HEATH",
    "RAVEN", "MOOSE", "HARBOR", "PINE", "ALDER", "BOREAL", "DRIFT", "ESKER",
    "FROST", "GRANITE", "ISLET", "JUNIPER", "KESTREL", "LICHEN", "MARSH", "NORTH",
    "OTTER", "POLAR", "QUARTZ", "RIDGE", "SPRUCE", "TIDE", "UPLAND", "VALE",
    "WILLOW", "SALMON", "CLOUDBERRY", "LANTERN", "SAGA", "STORM", "SUMMIT", "WOLF"
  ];

  /** Fresh random seed like "FJORD-4821". The only use of crypto randomness in the app. */
  function newSeed() {
    const buf = new Uint32Array(2);
    window.crypto.getRandomValues(buf);
    const word = SEED_WORDS[buf[0] % SEED_WORDS.length];
    const num = String(1000 + (buf[1] % 9000));
    return word + "-" + num;
  }

  BK.rng = { create, mulberry32, hashString, normalizeSeed, newSeed, SEED_WORDS };
})();
