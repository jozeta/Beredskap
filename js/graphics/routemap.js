/*
 * routemap.js — Route map for branching exercises: every page as a node in
 * layers (distance from the start), the room's route drawn strong, untaken
 * pages faint, endings as marks with their grade word.
 *
 * Input is the numbers-only map from BK.engine.branching.mapGraph (the stage
 * debrief projection), optionally with `titles` for the operator debrief, where
 * hovering or focusing a page shows its title. Endings are never shown by
 * colour alone: each carries its grade label.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { svg } = BK.dom;
  const t = BK.t;

  const GRADE_TONE = { 1: "ok", 2: "info", 3: "warn", 4: "danger", 5: "danger" };

  /**
   * map: { nodes: [{ num, layer, order, visited, current, ending }], edges: [{ from, to, visited }], layers }
   * opts: { lang, title, choices, titles: { num: title }, height }
   */
  function routeMap(map, opts) {
    const o = opts || {};
    const lang = o.lang;
    const W = 1680;
    const orders = map.nodes.map((n) => n.order);
    const span = Math.max(1, Math.max(0, ...orders) - Math.min(0, ...orders));
    const H = o.height || Math.max(260, Math.min(520, 90 + span * 64));
    const padX = 48;
    const padRight = 200; // ending labels sit to the right of their marks
    const padY = 54;
    const colW = (W - padX - padRight) / Math.max(1, map.layers - 1);
    const rowH = Math.min(84, (H - 2 * padY) / Math.max(1, span));
    const pos = {};
    map.nodes.forEach((n) => (pos[n.num] = [padX + n.layer * colW, H / 2 + n.order * rowH]));

    const visited = map.nodes.filter((n) => n.visited);
    const end = visited.find((n) => n.ending);
    const desc = t("branch.mapDesc", { pages: visited.length, total: map.nodes.length, choices: o.choices || 0, route: visited.map((n) => "§ " + n.num).join(" → "), ending: end ? end.ending.gradeLabel : "—" }, lang);
    const tid = BK.dom.uid("rm-t");
    const did = BK.dom.uid("rm-d");
    const root = svg(
      "svg",
      { class: "routemap", viewBox: "0 0 " + W + " " + H, role: "img", "aria-labelledby": tid + " " + did, preserveAspectRatio: "xMidYMid meet" },
      svg("title", { id: tid, text: o.title || "" }),
      svg("desc", { id: did, text: desc })
    );

    // Edges first (under the nodes): faint ones, then the route on top.
    const edgePath = (e) => {
      const [x1, y1] = pos[e.from];
      const [x2, y2] = pos[e.to];
      const mx = (x1 + x2) / 2;
      return "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2;
    };
    map.edges.filter((e) => !e.visited).forEach((e) => root.appendChild(svg("path", { class: "rm-edge", d: edgePath(e) })));
    map.edges.filter((e) => e.visited).forEach((e, i) => root.appendChild(svg("path", { class: "rm-edge rm-edge--route c-draw", d: edgePath(e), pathLength: 1, style: { "--i": String(i) } })));

    map.nodes.forEach((n) => {
      const [x, y] = pos[n.num];
      const title = o.titles && o.titles[n.num];
      const g = svg("g", { class: ["rm-node", n.visited && "is-visited", n.current && "is-current", n.ending && "rm-node--ending", n.ending && "rm-tone-" + GRADE_TONE[n.ending.grade]] });
      g.appendChild(svg("title", { text: "§ " + n.num + (title ? " — " + title : "") + (n.ending ? " · " + n.ending.gradeLabel : "") }));
      if (n.ending) {
        g.appendChild(svg("rect", { class: "rm-mark", x: x - 20, y: y - 20, width: 40, height: 40, rx: 10 }));
        g.appendChild(svg("text", { class: "rm-label", x: x + 32, y: y + 8, text: n.ending.gradeLabel }));
      } else {
        g.appendChild(svg("circle", { class: "rm-mark", cx: x, cy: y, r: n.visited || o.titles ? 20 : 12 }));
      }
      // Operator views (with titles) number every page; the stage numbers only the route and endings.
      if (n.visited || n.ending || o.titles) g.appendChild(svg("text", { class: "rm-num", x, y: y + 6, "text-anchor": "middle", text: String(n.num) }));
      root.appendChild(g);
    });
    return root;
  }

  BK.graphics = BK.graphics || {};
  BK.graphics.routeMap = routeMap;
})();
