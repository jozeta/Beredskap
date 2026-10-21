/*
 * core.test.js — Phase 1 foundation tests: RNG, i18n, store, safe DOM, router, theme.
 */
(function () {
  "use strict";

  const { suite, test, assert } = window.BKTest;
  const BK = window.BK;

  suite("rng", () => {
    test("same seed gives the same sequence", () => {
      const a = BK.rng.create("FJORD-4821");
      const b = BK.rng.create("FJORD-4821");
      for (let i = 0; i < 50; i++) assert.equal(a.next(), b.next());
    });

    test("seed is normalised (case, whitespace)", () => {
      assert.equal(BK.rng.create("  fjord-4821 ").next(), BK.rng.create("FJORD-4821").next());
    });

    test("different seeds diverge", () => {
      assert.notEqual(BK.rng.create("FJORD-4821").next(), BK.rng.create("FJORD-4822").next());
    });

    test("forks are independent of parent consumption", () => {
      const a = BK.rng.create("BIRCH-1000");
      const b = BK.rng.create("BIRCH-1000");
      for (let i = 0; i < 17; i++) b.next(); // consume extra numbers on one parent only
      assert.equal(a.fork("people").next(), b.fork("people").next());
    });

    test("differently named forks differ", () => {
      const r = BK.rng.create("BIRCH-1000");
      assert.notEqual(r.fork("people").next(), r.fork("numbers").next());
    });

    test("int stays within inclusive bounds and hits both ends", () => {
      const r = BK.rng.create("LYNX-1");
      const seen = new Set();
      for (let i = 0; i < 2000; i++) {
        const v = r.int(3, 7);
        assert.ok(v >= 3 && v <= 7, "out of range " + v);
        seen.add(v);
      }
      assert.equal(seen.size, 5);
    });

    test("pickN returns distinct elements and never more than available", () => {
      const r = BK.rng.create("LYNX-2");
      const arr = ["a", "b", "c", "d", "e", "f"];
      const picked = r.pickN(arr, 4);
      assert.equal(picked.length, 4);
      assert.equal(new Set(picked).size, 4);
      assert.equal(r.pickN(arr, 99).length, arr.length);
    });

    test("shuffle does not mutate input and keeps all elements", () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const copy = arr.slice();
      const out = BK.rng.create("TIDE-9").shuffle(arr);
      assert.deepEqual(arr, copy);
      assert.deepEqual(out.slice().sort(), copy.slice().sort());
    });

    test("weighted never picks zero-weight items", () => {
      const r = BK.rng.create("PINE-5");
      const items = [{ value: "never", weight: 0 }, { value: "always", weight: 3 }];
      for (let i = 0; i < 200; i++) assert.equal(r.weighted(items), "always");
    });

    test("stepped values snap to step", () => {
      const r = BK.rng.create("FROST-3");
      for (let i = 0; i < 200; i++) {
        const v = r.stepped(2000000, 25000000, 250000);
        assert.equal((v - 2000000) % 250000, 0);
        assert.ok(v >= 2000000 && v <= 25000000);
      }
    });

    test("newSeed is WORD-dddd", () => {
      for (let i = 0; i < 20; i++) assert.ok(/^[A-Z]+-\d{4}$/.test(BK.rng.newSeed()));
    });
  });

  suite("i18n", () => {
    test("English and Swedish have identical key sets", () => {
      const r = BK.i18n.missingReport();
      assert.deepEqual(r.missingInSv, [], "missing in sv: " + r.missingInSv.join(", "));
      assert.deepEqual(r.missingInEn, [], "missing in en: " + r.missingInEn.join(", "));
    });

    test("no empty strings in either language", () => {
      ["en", "sv"].forEach((l) => {
        Object.entries(BK.i18n.strings[l]).forEach(([k, v]) => assert.ok(v && v.trim(), l + ":" + k + " is empty"));
      });
    });

    test("product name is never translated", () => {
      assert.equal(BK.t("app.name", null, "en"), "Beredskap");
      assert.equal(BK.t("app.name", null, "sv"), "Beredskap");
    });

    test("interpolation and fallback", () => {
      assert.equal(BK.t("common.minutes", { n: 45 }, "sv"), "45 min");
      assert.equal(BK.t("no.such.key", null, "sv"), "no.such.key");
    });

    test("placeholders match between languages", () => {
      const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
      Object.keys(BK.i18n.strings.en).forEach((k) => {
        assert.equal(vars(BK.i18n.strings.sv[k]), vars(BK.i18n.strings.en[k]), "placeholders differ for " + k);
      });
    });

    test("loc picks language with English fallback", () => {
      assert.equal(BK.loc({ en: "Hello", sv: "Hej" }, "sv"), "Hej");
      assert.equal(BK.loc({ en: "Hello" }, "sv"), "Hello");
      assert.equal(BK.loc(null), "");
    });

    test("24-hour clock in both locales", () => {
      const d = new Date(2026, 9, 23, 16, 45);
      assert.equal(BK.i18n.fmt.time(d, "en"), "16:45");
      assert.equal(BK.i18n.fmt.time(d, "sv"), "16:45");
    });

    test("currency defaults: SEK for sv, EUR for en", () => {
      assert.ok(/kr/.test(BK.i18n.fmt.currency(2500000, null, "sv")));
      assert.ok(/€/.test(BK.i18n.fmt.currency(2500000, null, "en")));
    });
  });

  suite("store", () => {
    test("test runner uses an isolated prefix", () => {
      assert.equal(BK.config.storagePrefix, "beredskap-test:");
    });

    test("set/get round-trips through a versioned envelope", () => {
      BK.store.set("t:roundtrip", { a: 1, s: "åäö" });
      assert.deepEqual(BK.store.get("t:roundtrip"), { a: 1, s: "åäö" });
      const raw = JSON.parse(window.localStorage.getItem("beredskap-test:t:roundtrip"));
      assert.equal(raw.v, BK.config.schemaVersion);
      BK.store.remove("t:roundtrip");
    });

    test("corrupted JSON is reported, not thrown", () => {
      window.localStorage.setItem("beredskap-test:t:broken", "{not json");
      assert.equal(BK.store.get("t:broken", "fallback"), "fallback");
      assert.ok(BK.store.corrupt.some((c) => c.key === "beredskap-test:t:broken"));
      BK.store.resetCorrupt();
      assert.equal(window.localStorage.getItem("beredskap-test:t:broken"), null);
    });

    test("data from a newer schema is not interpreted", () => {
      window.localStorage.setItem("beredskap-test:t:future", JSON.stringify({ v: 999, data: { x: 1 } }));
      assert.equal(BK.store.get("t:future", null), null);
      assert.ok(BK.store.corrupt.some((c) => c.reason === "newer-schema"));
      BK.store.resetCorrupt();
    });

    test("collections list newest first", () => {
      BK.store.putItem("tcol", { id: "a", updatedAt: "2026-01-01T00:00:00Z" });
      BK.store.putItem("tcol", { id: "b", updatedAt: "2026-02-01T00:00:00Z" });
      assert.deepEqual(BK.store.list("tcol").map((x) => x.id), ["b", "a"]);
      BK.store.removeItem("tcol", "a");
      BK.store.removeItem("tcol", "b");
      assert.equal(BK.store.list("tcol").length, 0);
    });

    test("status events are emitted on save", () => {
      const states = [];
      const off = BK.events.on("store:status", (p) => states.push(p.state));
      BK.store.set("t:status", 1);
      off();
      BK.store.remove("t:status");
      assert.deepEqual(states, ["saving", "saved"]);
    });

    test("prefs merge with defaults", () => {
      const before = BK.store.get("prefs", null);
      BK.store.prefs.set({ defaultDuration: 90 });
      const p = BK.store.prefs.get();
      assert.equal(p.defaultDuration, 90);
      assert.ok(p.uiTheme);
      if (before) BK.store.set("prefs", before);
      else BK.store.remove("prefs");
    });
  });

  suite("dom (safe rendering)", () => {
    test("hostile strings stay inert text", () => {
      const hostile = '<img src=x onerror="window.__pwned=1">';
      const node = BK.dom.el("div", { text: hostile });
      const node2 = BK.dom.el("p", null, hostile);
      assert.equal(node.children.length, 0);
      assert.equal(node2.children.length, 0);
      assert.equal(node.textContent, hostile);
      assert.ok(!window.__pwned);
    });

    test("inline event-handler attributes are refused", () => {
      assert.throws(() => BK.dom.el("div", { onclick: "alert(1)" }));
      assert.throws(() => BK.dom.svg("svg", { onload: "alert(1)" }));
    });

    test("event handlers attach via on: {}", () => {
      let clicked = 0;
      const b = BK.dom.el("button", { on: { click: () => clicked++ } });
      b.click();
      assert.equal(clicked, 1);
    });

    test("svgIcon references the sprite and is decorative unless labelled", () => {
      const icon = BK.dom.svgIcon("shield");
      assert.equal(icon.getAttribute("aria-hidden"), "true");
      assert.equal(icon.querySelector("use").getAttribute("href"), "#i-shield");
      const labelled = BK.dom.svgIcon("shield", { label: "Shield" });
      assert.equal(labelled.getAttribute("role"), "img");
    });

    test("every icon used by the shell exists in the sprite", () => {
      ["mark", "gauge", "book", "plus", "timeline", "settings", "sun", "moon", "theme-system", "check", "warning", "cross"].forEach((n) =>
        assert.ok(BK.icons.has(n), "missing icon " + n)
      );
    });
  });

  suite("router", () => {
    test("parses path and query", () => {
      const p = BK.router.parseHash("#/new?scenario=s01-ransomware-vpn&x=1");
      assert.equal(p.path, "/new");
      assert.equal(p.query.scenario, "s01-ransomware-vpn");
    });

    test("empty hash means dashboard", () => {
      assert.equal(BK.router.parseHash("").path, "/");
    });
  });

  suite("theme", () => {
    test("apply sets data-theme on a scope element", () => {
      const scope = document.createElement("div");
      BK.theme.apply("dark", scope);
      assert.equal(scope.getAttribute("data-theme"), "dark");
      BK.theme.apply("bogus", scope);
      assert.equal(scope.getAttribute("data-theme"), "system");
    });

    test("tokens resolve differently for light and dark scopes", () => {
      const light = document.createElement("div");
      const dark = document.createElement("div");
      BK.theme.apply("light", light);
      BK.theme.apply("dark", dark);
      document.body.append(light, dark);
      const bgL = getComputedStyle(light).getPropertyValue("--bg").trim();
      const bgD = getComputedStyle(dark).getPropertyValue("--bg").trim();
      light.remove();
      dark.remove();
      assert.equal(bgL.toUpperCase(), "#F5F6F3");
      assert.equal(bgD.toUpperCase(), "#11161B");
    });

    test("cycle order light → dark → system", () => {
      assert.equal(BK.theme.nextMode("light"), "dark");
      assert.equal(BK.theme.nextMode("dark"), "system");
      assert.equal(BK.theme.nextMode("system"), "light");
    });
  });
})();
