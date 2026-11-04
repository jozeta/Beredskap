// ESLint flat config for Beredskap: classic browser scripts on window.BK, no build, no packages.
// Run with: npx --yes eslint@9.39.5 .
// Besides common mistakes, it blocks the unsafe DOM sinks and dynamic code the app never uses
// (README §5 "Safe rendering"); the static icon sprite in js/graphics/icons.js is the one exception.

const browserGlobals = Object.fromEntries(
  [
    "window", "document", "navigator", "location", "history", "localStorage", "sessionStorage", "performance",
    "console", "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame",
    "cancelAnimationFrame", "BroadcastChannel", "Blob", "URL", "FileReader", "Image", "Event", "KeyboardEvent",
    "FocusEvent", "MouseEvent", "CustomEvent", "DOMParser", "Node", "Element", "HTMLElement", "SVGElement",
    "getComputedStyle", "matchMedia", "Intl", "crypto", "structuredClone", "queueMicrotask", "alert", "confirm",
    "ResizeObserver", "MutationObserver", "IntersectionObserver", "DOMRect", "URLSearchParams", "CSS"
  ].map((name) => [name, "readonly"])
);

const unsafeSinks = {
  "no-restricted-properties": [
    "error",
    { property: "innerHTML", message: "Build DOM with BK.dom.el() and textContent." },
    { property: "outerHTML", message: "Build DOM with BK.dom.el() and textContent." },
    { object: "document", property: "write", message: "Not allowed." },
    { object: "document", property: "writeln", message: "Not allowed." }
  ],
  "no-restricted-syntax": [
    "error",
    { selector: "CallExpression[callee.property.name='insertAdjacentHTML']", message: "Build DOM with BK.dom.el()." },
    { selector: "CallExpression[callee.name=/^set(Timeout|Interval)$/][arguments.0.type='Literal']", message: "No string timers." }
  ]
};

export default [
  { ignores: ["_*.html", "_*.js", "node_modules/**", "docs/**"] },
  {
    files: ["**/*.js"],
    languageOptions: { ecmaVersion: 2022, sourceType: "script", globals: browserGlobals },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      ...unsafeSinks,
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-redeclare": "error",
      "no-self-assign": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-debugger": "error",
      "use-isnan": "error",
      "valid-typeof": "error"
    }
  },
  // The static icon sprite is the single sanctioned innerHTML (trusted markup, never content).
  { files: ["js/graphics/icons.js"], rules: { "no-restricted-properties": "off" } },
  // Tests inspect rendered markup (outerHTML reads), feed hostile javascript: URLs on purpose, and the
  // hardening test fetches the app's own source over HTTP. The app code stays under the full rules.
  {
    files: ["tests/**/*.js"],
    languageOptions: { globals: { fetch: "readonly" } },
    rules: {
      "no-script-url": "off",
      "no-restricted-properties": [
        "error",
        { property: "innerHTML", message: "Build DOM with BK.dom.el() and textContent." },
        { object: "document", property: "write", message: "Not allowed." }
      ]
    }
  },
  // This config file itself is an ES module run by Node.
  { files: ["eslint.config.js"], languageOptions: { sourceType: "module" } }
];
