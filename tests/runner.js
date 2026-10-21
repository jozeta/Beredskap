/*
 * runner.js — Dependency-free in-browser test runner.
 *
 * suite(name, fn) groups tests; test(name, fn) registers one; fn may be async.
 * assert helpers throw on failure. Results render into #results and a summary is
 * also exposed as window.BK_TEST_RESULTS for automated checks.
 */
(function () {
  "use strict";

  const tests = [];
  let currentSuite = "";

  function suite(name, fn) {
    currentSuite = name;
    fn();
    currentSuite = "";
  }

  function test(name, fn) {
    tests.push({ suite: currentSuite, name, fn });
  }

  function fail(msg) {
    throw new Error(msg);
  }

  /** Structural deep equality for JSON-like data. */
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => deepEqual(a[k], b[k]));
  }

  const assert = {
    ok(v, msg) {
      if (!v) fail(msg || "expected truthy, got " + JSON.stringify(v));
    },
    equal(a, b, msg) {
      if (a !== b) fail((msg ? msg + ": " : "") + "expected " + JSON.stringify(b) + ", got " + JSON.stringify(a));
    },
    notEqual(a, b, msg) {
      if (a === b) fail((msg ? msg + ": " : "") + "did not expect " + JSON.stringify(a));
    },
    deepEqual(a, b, msg) {
      if (!deepEqual(a, b)) fail((msg ? msg + ": " : "") + "structures differ");
    },
    throws(fn, msg) {
      try {
        fn();
      } catch (e) {
        return;
      }
      fail(msg || "expected function to throw");
    }
  };

  async function run() {
    const out = document.getElementById("results");
    const results = [];
    for (const tc of tests) {
      const started = performance.now();
      try {
        await tc.fn();
        results.push({ suite: tc.suite, name: tc.name, pass: true, ms: performance.now() - started });
      } catch (err) {
        results.push({ suite: tc.suite, name: tc.name, pass: false, error: err && err.message ? err.message : String(err) });
      }
    }

    const passed = results.filter((r) => r.pass).length;
    const failed = results.length - passed;
    window.BK_TEST_RESULTS = { total: results.length, passed, failed, results };

    const summary = document.createElement("p");
    summary.className = "summary " + (failed ? "is-fail" : "is-pass");
    summary.textContent = passed + " passed, " + failed + " failed, " + results.length + " total";
    out.appendChild(summary);

    let lastSuite = null;
    let list = null;
    results.forEach((r) => {
      if (r.suite !== lastSuite) {
        const h = document.createElement("h2");
        h.textContent = r.suite;
        out.appendChild(h);
        list = document.createElement("ul");
        out.appendChild(list);
        lastSuite = r.suite;
      }
      const li = document.createElement("li");
      li.className = r.pass ? "pass" : "fail";
      li.textContent = (r.pass ? "✓ " : "✗ ") + r.name + (r.pass ? "" : " — " + r.error);
      list.appendChild(li);
    });
    document.title = (failed ? "✗ " : "✓ ") + "Beredskap tests";
  }

  window.BKTest = { suite, test, assert, deepEqual, run };
})();
