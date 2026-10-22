/*
 * artwork.js — Seeded abstract Nordic motif for title slides: layered fjord
 * contour ridges under a horizon. Same seed ⇒ same artwork (it draws from its
 * own RNG fork). Coloured by scenario category through theme tokens, so it
 * follows the stage theme. Purely decorative: aria-hidden.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { svg } = BK.dom;

  // Category → hue family (theme token). Decorative identity, not data.
  const CATEGORY_HUE = {
    ransomware: "danger", malware: "danger", healthcare: "danger", "executive-compound": "danger",
    fraud: "series-4", "social-engineering": "series-4", identity: "series-4", insider: "series-4",
    ddos: "series-2", availability: "series-2", "network-identity": "series-2", vulnerability: "series-2", "ot-ics": "series-2",
    "supply-chain": "series-3", "third-party": "series-3", "cloud-privacy": "series-3", devsecops: "series-3",
    "edr-soc": "accent", hacktivism: "accent", "multi-incident": "accent",
    "data-loss": "series-4", "saas-provider": "series-3", "api-abuse": "series-2", "brand-hijack": "accent", "ai-abuse": "series-4", "extortion": "danger", "payment-card": "series-3", "water-utility": "series-2", "sim-swap": "series-4", "regional-crisis": "accent",
    "cloud-destruction": "danger", "physical-intrusion": "series-4", "vulnerability-disclosure": "series-2", "acquisition": "series-3", "certificate-expiry": "accent"
  };

  const W = 1920;
  const H = 1080;

  /** Smooth ridge through seeded points (Catmull-Rom converted to cubic Béziers). */
  function ridge(rng, baseY, amplitude, roughness) {
    const n = 7 + Math.round(roughness * 5);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = (W / n) * i;
      const y = baseY - rng.float(0.2, 1) * amplitude * (0.6 + 0.4 * Math.sin((i / n) * Math.PI));
      pts.push([x, y]);
    }
    let d = "M0," + H + " L" + pts[0][0] + "," + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += " C" + c1.map(Math.round).join(",") + " " + c2.map(Math.round).join(",") + " " + p2.map(Math.round).join(",");
    }
    return d + " L" + W + "," + H + " Z";
  }

  function artwork(slide) {
    const rng = BK.rng.create(String(slide.seed || "BEREDSKAP") + "/artwork");
    const hue = CATEGORY_HUE[slide.categoryId] || "accent";
    const layers = 5 + rng.int(0, 2);
    const root = svg("svg", { class: "s-art", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMax slice", "aria-hidden": "true", style: { "--art": "var(--" + hue + ")" } });
    root.appendChild(svg("line", { class: "s-art__horizon", x1: 0, x2: W, y1: 800, y2: 800 }));
    const sunX = rng.int(1250, 1700);
    root.appendChild(svg("circle", { class: "s-art__sun", cx: sunX, cy: 800, r: rng.int(60, 100) }));
    for (let i = 0; i < layers; i++) {
      // Ridges stay below the title block (y > 760 at their peaks).
      const baseY = 880 + i * (190 / layers);
      const amp = 110 - i * (70 / layers);
      root.appendChild(svg("path", { class: "s-art__ridge", d: ridge(rng.fork("layer" + i), baseY, amp, rng.float(0, 1)), style: { "--layer": String(i / Math.max(1, layers - 1)) } }));
    }
    return root;
  }

  BK.graphics.artwork = artwork;
  BK.graphics.CATEGORY_HUE = CATEGORY_HUE;
})();
