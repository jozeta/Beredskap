/*
 * hardening.test.js — Source self-check and offline guarantees (spec section 16,
 * definition of done 1).
 *
 * The grep-style check reads every script and stylesheet that index.html loads
 * and asserts: no eval, no new Function, no string timers, no HTML-string sinks
 * (innerHTML = and friends) outside icons.js, no network APIs and no external
 * URLs. It also checks the Content-Security-Policy of index.html.
 *
 * Reading source files needs a static server: browsers do not let a file://
 * page read other files. Opened from file:// these tests are reported as
 * skipped, never as passed. Run `python3 -m http.server` in the project folder
 * and open http://localhost:8000/tests.html to include them.
 *
 * This suite runs last, so the resource check sees everything the run loaded.
 */
(function () {
  "use strict";

  const { suite, test, assert, skip } = window.BKTest;

  // Each rule: what it forbids, the pattern, and files exempt from it.
  const RULES = [
    { name: "eval(", re: /\beval\s*\(/ },
    { name: "new Function", re: /\bnew\s+Function\b/ },
    { name: "string-based timer", re: /\bset(?:Timeout|Interval)\s*\(\s*["'`]/ },
    { name: "innerHTML/outerHTML assignment", re: /\.(?:inner|outer)HTML\s*\+?=(?!=)/, allow: ["js/graphics/icons.js"] },
    { name: "insertAdjacentHTML / document.write / createContextualFragment", re: /\binsertAdjacentHTML\b|\bdocument\.write(?:ln)?\s*\(|\bcreateContextualFragment\b/ },
    { name: "network API", re: /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bsendBeacon\b|\bEventSource\b|\bimportScripts\b|\bRTCPeerConnection\b/ },
    { name: "external URL", re: /\b(?:https?:|wss?:)?\/\/(?!www\.w3\.org\/(?:2000\/svg|1999\/xlink)\b)[a-z0-9-]+\.[a-z]{2,}/i, only: /\.js$/ },
    { name: "external stylesheet resource", re: /@import|url\(\s*["']?(?:https?:)?\/\//i, only: /\.css$/ }
  ];

  let sourcesPromise = null;

  async function readText(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(path + ": HTTP " + res.status);
    return res.text();
  }

  /** index.html plus every local script and stylesheet it references: [{ path, text }]. */
  function loadSources() {
    if (location.protocol === "file:") {
      skip("needs a static server: a file:// page cannot read source files (python3 -m http.server, then open /tests.html)");
    }
    if (!sourcesPromise) {
      sourcesPromise = (async () => {
        const html = await readText("index.html");
        const doc = new DOMParser().parseFromString(html, "text/html");
        const refs = Array.from(doc.querySelectorAll("script[src]"), (n) => n.getAttribute("src")).concat(Array.from(doc.querySelectorAll('link[rel="stylesheet"]'), (n) => n.getAttribute("href")));
        const files = await Promise.all(refs.map(async (path) => ({ path, text: await readText(path) })));
        return { html, doc, files };
      })();
    }
    return sourcesPromise;
  }

  /** "file:line: text" for each line matching rule `re`. */
  function matches(file, re) {
    const out = [];
    file.text.split("\n").forEach((line, i) => re.test(line) && out.push(file.path + ":" + (i + 1) + ": " + line.trim().slice(0, 100)));
    return out;
  }

  suite("hardening", () => {
    test("self-check: no eval, new Function, string timers, HTML sinks outside icons.js, network APIs or external URLs", async () => {
      const { files } = await loadSources();
      assert.ok(files.length > 60, "read " + files.length + " source files");
      const found = [];
      RULES.forEach((rule) =>
        files.forEach((f) => {
          if ((rule.allow || []).includes(f.path) || (rule.only && !rule.only.test(f.path))) return;
          matches(f, rule.re).forEach((m) => found.push(rule.name + " — " + m));
        })
      );
      assert.ok(!found.length, found.length + " violation(s):\n" + found.join("\n"));
    });

    test("self-check: the rules detect what they forbid", () => {
      const sample = (rule) => RULES.find((r) => r.name === rule).re;
      assert.ok(sample("eval(").test("x = eval (code)"));
      assert.ok(!sample("eval(").test("evaluation(x)"));
      assert.ok(sample("new Function").test("const f = new Function('a', 'b')"));
      assert.ok(sample("string-based timer").test('setTimeout("go()", 10)'));
      assert.ok(!sample("string-based timer").test("setTimeout(go, 10)"));
      assert.ok(sample("innerHTML/outerHTML assignment").test("node.innerHTML = x"));
      assert.ok(sample("innerHTML/outerHTML assignment").test("node.innerHTML+=x"));
      assert.ok(!sample("innerHTML/outerHTML assignment").test("if (a.innerHTML === b)"));
      assert.ok(sample("network API").test("fetch(url)"));
      assert.ok(sample("external URL").test('const u = "https://cdn.example.org/x.js"'));
      assert.ok(!sample("external URL").test('const NS = "http://www.w3.org/2000/svg";'));
    });

    test("index.html: strict CSP, no inline scripts or handlers, only local resources", async () => {
      const { doc } = await loadSources();
      const meta = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
      assert.ok(meta, "CSP meta present");
      const csp = meta.getAttribute("content");
      ["default-src 'none'", "script-src 'self'", "connect-src 'none'", "base-uri 'none'", "form-action 'none'"].forEach((d) => assert.ok(csp.includes(d), "CSP has " + d));
      assert.ok(!/unsafe-(inline|eval)/.test(csp), "no unsafe-inline / unsafe-eval");
      doc.querySelectorAll("script").forEach((s) => assert.ok(s.hasAttribute("src") && !s.textContent.trim(), "inline script found"));
      doc.querySelectorAll("*").forEach((n) => Array.from(n.attributes).forEach((a) => assert.ok(!/^on/i.test(a.name), "inline handler " + a.name + " on <" + n.tagName.toLowerCase() + ">")));
      doc.querySelectorAll("[src], [href]").forEach((n) => {
        const ref = n.getAttribute("src") || n.getAttribute("href");
        assert.ok(!/^(?:[a-z]+:)?\/\//i.test(ref) || ref.startsWith("data:"), "external reference " + ref);
      });
    });

    test("tests.html loads the same app scripts, in the same order, as index.html (except the shell)", async () => {
      const { doc } = await loadSources();
      const app = Array.from(doc.querySelectorAll("script[src]"), (n) => n.getAttribute("src")).filter((p) => p !== "js/app.js");
      const here = Array.from(document.querySelectorAll("script[src]"), (n) => n.getAttribute("src")).filter((p) => p.startsWith("js/"));
      assert.deepEqual(here, app, "script order differs");
    });

    test("nothing the test run loaded came from the network", () => {
      const own = location.protocol === "file:" ? "file:" : location.origin;
      const foreign = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => !u.startsWith(own) && !u.startsWith("data:") && !u.startsWith("blob:"));
      assert.deepEqual(foreign, [], "external requests: " + foreign.join(", "));
    });
  });
})();
