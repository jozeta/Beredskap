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
  const { svg, el, svgIcon } = BK.dom;
  const t = BK.t;

  const GRADE_TONE = { 1: "ok", 2: "info", 3: "warn", 4: "danger", 5: "danger" };

  /**
   * map: { nodes: [{ num, layer, order, visited, current, ending }], edges: [{ from, to, visited }], layers }
   * opts: { lang, title, choices, titles: { num: title }, points: { num: { question, reached, chosen, options } }, spread, height }
   */
  function routeMap(map, opts) {
    const o = opts || {};
    const lang = o.lang;
    const W = 1680;
    const orders = map.nodes.map((n) => n.order);
    const span = Math.max(1, Math.max(0, ...orders) - Math.min(0, ...orders));
    const H = o.height || (o.spread ? Math.max(420, Math.min(1000, 160 + span * 150)) : Math.max(260, Math.min(520, 90 + span * 64)));
    const padX = 48;
    const padRight = 200; // ending labels sit to the right of their marks
    const padY = o.spread ? 70 : 54;
    const colW = (W - padX - padRight) / Math.max(1, map.layers - 1);
    const rowH = Math.min(o.spread ? 170 : 84, (H - 2 * padY) / Math.max(1, span));
    const pos = {};
    // Spread: layers with few pages fan out over up to two rows each, so the route swings visibly.
    const perLayer = {};
    map.nodes.forEach((n) => (perLayer[n.layer] = (perLayer[n.layer] || 0) + 1));
    const gap = (layer) => (o.spread && perLayer[layer] > 1 ? Math.min((H - 2 * padY) / (perLayer[layer] - 1), rowH * 2) : rowH);
    map.nodes.forEach((n) => (pos[n.num] = [padX + n.layer * colW, H / 2 + n.order * gap(n.layer)]));

    const visited = map.nodes.filter((n) => n.visited);
    const end = visited.find((n) => n.ending);
    const desc = t("branch.mapDesc", { pages: visited.length, total: map.nodes.length, choices: o.choices || 0, route: visited.map((n) => "§ " + n.num).join(" → "), ending: end ? end.ending.gradeLabel : "—" }, lang);
    const tid = BK.dom.uid("rm-t");
    const did = BK.dom.uid("rm-d");
    const root = svg(
      "svg",
      { class: ["routemap", o.spread && "routemap--spread"], viewBox: "0 0 " + W + " " + H, role: o.points ? "group" : "img", "aria-labelledby": tid + " " + did, preserveAspectRatio: "xMidYMid meet" },
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

    const tip = o.points ? tooltip(root, lang) : null;
    map.nodes.forEach((n) => {
      const [x, y] = pos[n.num];
      const title = o.titles && o.titles[n.num];
      const point = o.points && o.points[n.num];
      const label = "§ " + n.num + (title ? " — " + title : "") + (n.ending ? " · " + n.ending.gradeLabel : "");
      const g = svg("g", { class: ["rm-node", n.visited && "is-visited", n.current && "is-current", n.ending && "rm-node--ending", point && "rm-node--point", n.ending && "rm-tone-" + GRADE_TONE[n.ending.grade]] });
      if (tip) {
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "button");
        g.setAttribute("aria-label", label + (point ? ". " + pointSummary(point, lang) : ""));
        const show = () => tip.show(g, n, title, point);
        g.addEventListener("mouseenter", show);
        g.addEventListener("focus", show);
        g.addEventListener("mouseleave", tip.hide);
        g.addEventListener("blur", tip.hide);
        g.addEventListener("keydown", (e) => e.key === "Escape" && tip.hide());
      } else {
        g.appendChild(svg("title", { text: label }));
      }
      if (n.ending) {
        g.appendChild(svg("rect", { class: "rm-mark", x: x - 20, y: y - 20, width: 40, height: 40, rx: 10 }));
        g.appendChild(svg("text", { class: "rm-label", x: x + 32, y: y + 8, text: n.ending.gradeLabel }));
      } else if (point) {
        const r = n.visited ? 27 : 22;
        if (tip) g.appendChild(svg("circle", { class: "rm-hit", cx: x, cy: y, r: r + 14 }));
        g.appendChild(svg("path", { class: "rm-mark", d: "M" + x + "," + (y - r) + " L" + (x + r) + "," + y + " L" + x + "," + (y + r) + " L" + (x - r) + "," + y + " Z", "stroke-linejoin": "round" }));
      } else {
        g.appendChild(svg("circle", { class: "rm-mark", cx: x, cy: y, r: n.visited || o.titles ? 20 : 12 }));
      }
      // Operator views (with titles) number every page; the stage numbers only the route and endings.
      if (n.visited || n.ending || o.titles) g.appendChild(svg("text", { class: "rm-num", x, y: y + 6, "text-anchor": "middle", text: String(n.num) }));
      root.appendChild(g);
    });
    return root;
  }

  /** One line for screen readers: the chosen option, or that the room never got here. */
  function pointSummary(p, lang) {
    if (!p.reached) return t("branch.tip.notReached", null, lang);
    const c = p.options.find((x) => x.key === p.chosen);
    return p.question + " " + t("branch.tip.chosen", null, lang) + ": " + (c ? c.key + " — " + c.text : "—");
  }

  /** A single tooltip per map, placed in the SVG's wrapper next to the hovered or focused node. */
  function tooltip(root, lang) {
    let box = null;
    const hide = () => box && (box.hidden = true);
    function show(g, n, title, point) {
      const wrap = root.parentElement;
      if (!wrap) return;
      if (!box || box.parentElement !== wrap) {
        box = el("div", { class: "rm-tip", role: "tooltip", hidden: true });
        wrap.appendChild(box);
      }
      box.textContent = "";
      box.appendChild(el("p", { class: "rm-tip__head" }, el("span", { class: "rm-tip__num", text: "§ " + n.num }), point ? el("span", { class: "rm-tip__kind", text: t("branch.tip.decision", null, lang) }) : null, n.ending ? el("span", { class: "rm-tip__kind", text: n.ending.gradeLabel }) : null));
      if (title) box.appendChild(el("p", { class: "rm-tip__title", text: title }));
      if (point) {
        const sameTarget = point.options.every((x) => x.leadsTo === point.options[0].leadsTo);
        box.appendChild(el("p", { class: "rm-tip__q", text: point.question }));
        box.appendChild(
          el(
            "ul",
            { class: "rm-tip__opts" },
            point.options.map((x) =>
              el(
                "li",
                { class: ["rm-tip__opt", x.key === point.chosen && "is-chosen"] },
                el("span", { class: "rm-tip__key", text: x.key }),
                el("span", { class: "rm-tip__text" }, el("span", { text: x.text }), x.leadsTo && !sameTarget ? el("span", { class: "rm-tip__to", text: "→ " + x.leadsTo }) : null),
                x.key === point.chosen ? el("span", { class: "rm-tip__badge" }, svgIcon("check", { size: 14 }), t("branch.tip.chosen", null, lang)) : null
              )
            )
          )
        );
        if (!point.reached) box.appendChild(el("p", { class: "rm-tip__note", text: t("branch.tip.notReached", null, lang) }));
      } else if (!n.visited && !n.ending) {
        box.appendChild(el("p", { class: "rm-tip__note", text: t("branch.tip.notVisited", null, lang) }));
      }
      box.hidden = false;
      // Place beside the node: right of it when there is room, else left; clamp to the wrapper.
      const wr = wrap.getBoundingClientRect();
      const nr = g.getBoundingClientRect();
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      let left = nr.right - wr.left + 14;
      if (left + bw > wrap.clientWidth) left = nr.left - wr.left - bw - 14;
      left = Math.max(0, Math.min(left, wrap.clientWidth - bw));
      let top = nr.top - wr.top + nr.height / 2 - bh / 2;
      top = Math.max(-40, Math.min(top, wrap.clientHeight - bh + 40));
      box.style.setProperty("left", Math.round(left + wrap.scrollLeft) + "px");
      box.style.setProperty("top", Math.round(top) + "px");
    }
    return { show, hide };
  }

  BK.graphics = BK.graphics || {};
  BK.graphics.routeMap = routeMap;
})();
