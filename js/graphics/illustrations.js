/*
 * illustrations.js — Decorative illustrations for the operator UI: the
 * dashboard hero (a Nordic ridge landscape crossed by a route of decision
 * points, the app's two formats in one picture), and small line drawings for
 * empty states.
 *
 * Purely decorative: every root is aria-hidden. Colours come from theme tokens
 * through CSS classes (ill-*), so both themes work without new values, and the
 * route draws itself in once (disabled by the reduced-motion rule).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { svg } = BK.dom;

  function root(w, h, cls) {
    return svg("svg", { class: ["ill", cls], viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", focusable: "false" });
  }

  /** Smooth closed ridge through points, filled down to the bottom edge. */
  function ridgePath(points, w, h) {
    let d = "M0," + h + " L" + points[0][0] + "," + points[0][1];
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const mx = (x1 + x2) / 2;
      d += " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2;
    }
    return d + " L" + w + "," + h + " Z";
  }

  /** Dashboard hero: dusk sky, three ridges, a moon and a route of decision points. */
  function hero() {
    const W = 1200;
    const H = 360;
    const s = root(W, H, "ill--hero");
    const gid = BK.dom.uid("ill-sky");
    const defs = svg("defs");
    const grad = svg("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.appendChild(svg("stop", { offset: "0", class: "ill-sky-top" }));
    grad.appendChild(svg("stop", { offset: "1", class: "ill-sky-bottom" }));
    defs.appendChild(grad);
    s.appendChild(defs);
    s.appendChild(svg("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#" + gid + ")" }));

    // Stars: a fixed scatter, so the picture is identical on every visit.
    [[90, 60], [180, 110], [260, 40], [420, 80], [530, 30], [640, 95], [760, 50], [880, 120], [1010, 70], [1120, 40], [340, 140], [700, 150]].forEach(([x, y], i) =>
      s.appendChild(svg("circle", { class: "ill-star", cx: x, cy: y, r: i % 3 === 0 ? 2.2 : 1.4 }))
    );
    s.appendChild(svg("circle", { class: "ill-moon-halo", cx: 860, cy: 92, r: 62 }));
    s.appendChild(svg("circle", { class: "ill-moon", cx: 860, cy: 92, r: 26 }));

    const far = [[0, 210], [140, 170], [300, 200], [470, 150], [640, 190], [820, 140], [1000, 180], [1200, 150]];
    const mid = [[0, 260], [180, 220], [360, 250], [540, 205], [720, 245], [900, 215], [1080, 240], [1200, 225]];
    const near = [[0, 310], [220, 285], [430, 305], [650, 270], [860, 300], [1040, 280], [1200, 295]];
    s.appendChild(svg("path", { class: "ill-ridge ill-ridge--far", d: ridgePath(far, W, H) }));
    s.appendChild(svg("path", { class: "ill-ridge ill-ridge--mid", d: ridgePath(mid, W, H) }));

    // The route: decision points across the landscape, one branch, an ending mark.
    const route = [[120, 238], [270, 196], [420, 222], [570, 178], [720, 214], [850, 172]];
    let d = "M" + route[0].join(",");
    for (let i = 1; i < route.length; i++) {
      const [x1, y1] = route[i - 1];
      const [x2, y2] = route[i];
      d += " C" + (x1 + x2) / 2 + "," + y1 + " " + (x1 + x2) / 2 + "," + y2 + " " + x2 + "," + y2;
    }
    s.appendChild(svg("path", { class: "ill-branch", d: "M420,222 C495,222 495,262 570,262 C645,262 645,214 720,214" }));
    s.appendChild(svg("path", { class: "ill-route", d, pathLength: 1 }));
    route.forEach(([x, y], i) => s.appendChild(svg("circle", { class: ["ill-node", i === route.length - 1 && "ill-node--last"], cx: x, cy: y, r: i === route.length - 1 ? 9 : 7, style: { "--i": String(i) } })));
    s.appendChild(svg("rect", { class: "ill-ending", x: 948, y: 146, width: 26, height: 26, rx: 7 }));
    s.appendChild(svg("path", { class: "ill-route ill-route--tail", d: "M850,172 C900,172 900,159 948,159", pathLength: 1 }));

    s.appendChild(svg("path", { class: "ill-ridge ill-ridge--near", d: ridgePath(near, W, H) }));
    return s;
  }

  // Empty-state drawings: 200×120 line art in currentColor with one accent detail.
  const EMPTY = {
    clock: (s) => {
      s.appendChild(svg("rect", { class: "ill-line", x: 60, y: 22, width: 80, height: 78, rx: 10 }));
      s.appendChild(svg("path", { class: "ill-line", d: "M60 42h80M80 14v16M120 14v16" }));
      s.appendChild(svg("circle", { class: "ill-accent-line ill-dash", cx: 100, cy: 70, r: 18 }));
      s.appendChild(svg("path", { class: "ill-accent-line", d: "M100 60v10l7 5" }));
    },
    notes: (s) => {
      s.appendChild(svg("rect", { class: "ill-line ill-faint", x: 74, y: 16, width: 76, height: 88, rx: 8 }));
      s.appendChild(svg("rect", { class: "ill-line ill-fill", x: 62, y: 24, width: 76, height: 88, rx: 8 }));
      s.appendChild(svg("path", { class: "ill-line", d: "M76 48h48M76 62h48M76 76h30" }));
      s.appendChild(svg("circle", { class: "ill-accent-fill", cx: 132, cy: 30, r: 7 }));
    },
    search: (s) => {
      s.appendChild(svg("path", { class: "ill-line ill-dash", d: "M24 92 C60 70 80 100 116 80 S170 70 186 84" }));
      s.appendChild(svg("circle", { class: "ill-line ill-fill", cx: 92, cy: 52, r: 26 }));
      s.appendChild(svg("path", { class: "ill-accent-line", d: "M111 71l20 20" }));
      s.appendChild(svg("path", { class: "ill-line", d: "M80 48a14 14 0 0 1 14-10" }));
    },
    book: (s) => {
      s.appendChild(svg("path", { class: "ill-line ill-fill", d: "M100 34 C82 24 58 24 40 30 V96 C58 90 82 90 100 100 Z" }));
      s.appendChild(svg("path", { class: "ill-line ill-fill", d: "M100 34 C118 24 142 24 160 30 V96 C142 90 118 90 100 100 Z" }));
      s.appendChild(svg("path", { class: "ill-accent-line", d: "M116 52h28M116 64h20" }));
      s.appendChild(svg("text", { class: "ill-mark", x: 62, y: 72, text: "§" }));
    },
    info: (s) => {
      s.appendChild(svg("path", { class: "ill-line ill-fill", d: "M100 16l34 13v24c0 22-15 38-34 46-19-8-34-24-34-46V29z" }));
      s.appendChild(svg("circle", { class: "ill-accent-fill", cx: 100, cy: 56, r: 6 }));
    }
  };

  // Icon names used by views that share a drawing.
  EMPTY.timeline = EMPTY.clock;
  EMPTY.dice = EMPTY.notes;

  function empty(kind) {
    const s = root(200, 120, "ill--empty");
    s.setAttribute("preserveAspectRatio", "xMidYMid meet");
    (EMPTY[kind] || EMPTY.info)(s);
    return s;
  }

  BK.graphics = BK.graphics || {};
  BK.graphics.illustration = { hero, empty };
})();
