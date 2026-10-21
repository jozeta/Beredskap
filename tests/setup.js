/*
 * setup.js — Runs before the app scripts in tests.html. Isolates test storage
 * under its own prefix so the runner never touches real Beredskap data.
 */
window.BK = { config: { storagePrefix: "beredskap-test:", debug: true } };
