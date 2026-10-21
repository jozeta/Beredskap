/*
 * run.js — Starts the test run once everything is loaded (kept separate so the
 * page needs no inline script under its Content-Security-Policy).
 */
window.addEventListener("load", () => window.BKTest.run());
