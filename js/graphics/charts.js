/*
 * charts.js — SVG chart renderers for the stage, the debrief and the printed report.
 *
 * Renderers: line/area with inject markers, bar (stacked), KPI tiles, gauge,
 * donut, service-dependency diagram, blast-radius network map, RTO/RPO vs
 * estimated recovery, incident timeline.
 *
 * Data comes from the audience projection (already localised, already filtered
 * to released injects). Rules applied (dataviz method):
 *  - one y-axis; recessive grid; thin marks (3 units ≈ 2px at stage scale)
 *  - categorical series use --series-1…4 in fixed order; status (ok/warn/danger)
 *    only when the data IS a status, and always with a text label
 *  - legend for ≥ 2 series; selective direct labels, never a number on every point
 *  - text uses ink tokens, never the series colour
 *  - every chart: <title>/<desc>, native <title> tooltips on marks, and a
 *    visually hidden data table; draw-in animation honours reduced motion
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svg } = BK.dom;
  const t = BK.t;

  const VW = 1680; // viewBox width: the stage chart area at 1:1
  const VH = 600;
  const PAD = { top: 72, right: 48, bottom: 72, left: 120 }; // top leaves room for the unit and peak labels inside the frame

  const STATUS_TONES = new Set(["ok", "warn", "danger", "info"]);

  // ---- Helpers -------------------------------------------------------------------------------

  function fmtNum(v, lang) {
    return BK.i18n.fmt.number(v, lang);
  }

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const raw = span / (count || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const err = raw / mag;
    const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return { lo, hi, ticks };
  }

  function truncate(str, n) {
    const s = String(str || "");
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  /** Series colour class by position (fixed order) or by status tone. */
  function toneClass(series, index) {
    return series && STATUS_TONES.has(series.tone) ? "c-" + series.tone : "c-s" + ((index % 4) + 1);
  }

  let uidCounter = 0;
  function uid(prefix) {
    uidCounter += 1;
    return prefix + "-" + uidCounter;
  }

  /** Root <svg> with accessible title/description. */
  function root(title, desc, w, h) {
    const tid = uid("ct");
    const did = uid("cd");
    return svg(
      "svg",
      { class: "chart-svg", viewBox: "0 0 " + (w || VW) + " " + (h || VH), role: "img", "aria-labelledby": tid + " " + did, preserveAspectRatio: "xMidYMid meet" },
      svg("title", { id: tid, text: title || "" }),
      svg("desc", { id: did, text: desc || "" })
    );
  }

  function legend(items) {
    if (items.length < 2) return null;
    return el(
      "ul",
      { class: "c-legend" },
      items.map((it) => el("li", null, el("span", { class: ["c-swatch", it.cls, it.shape && "c-swatch--" + it.shape], "aria-hidden": "true" }), el("span", { text: it.label })))
    );
  }

  /** Visually hidden table so the data is available without the picture. */
  function dataTable(caption, headers, rows) {
    return el(
      "table",
      { class: "sr-only" },
      el("caption", { text: caption }),
      el("thead", null, el("tr", null, headers.map((h) => el("th", { scope: "col", text: h })))),
      el("tbody", null, rows.map((r) => el("tr", null, r.map((c) => el("td", { text: String(c) })))))
    );
  }

  function figure(kind, parts) {
    return el("div", { class: ["chart", "chart--" + kind] }, parts);
  }

  function yAxis(g, scaleY, ticks, plotW, lang, unit) {
    ticks.forEach((v) => {
      const y = scaleY(v);
      g.appendChild(svg("line", { class: "c-grid", x1: PAD.left, x2: PAD.left + plotW, y1: y, y2: y }));
      g.appendChild(svg("text", { class: "c-tick", x: PAD.left - 16, y: y + 9, "text-anchor": "end", text: fmtNum(v, lang) }));
    });
    // Left-aligned above the axis, so a long unit never runs out of the frame.
    if (unit) g.appendChild(svg("text", { class: "c-tick c-unit", x: 0, y: scaleY(ticks[ticks.length - 1]) - 36, text: unit }));
  }

  /** x tick label: minutes → "T−60", days/nights → "−3 d". */
  function xLabel(v, unit) {
    const sign = v > 0 ? "+" : v < 0 ? "−" : "±";
    if (unit === "minutes") return "T" + (v === 0 ? "+0" : sign + Math.abs(v));
    if (unit === "days" || unit === "nights") return (v < 0 ? "−" : "") + Math.abs(v) + (unit === "days" ? " d" : "");
    return String(v);
  }

  // ---- Line / area -------------------------------------------------------------------------------

  function line(c, p) {
    const lang = p.lang;
    const d = c.data || {};
    const series = d.series || [];
    const all = [].concat(...series.map((s) => s.points));
    const xs = all.map((pt) => pt[0]);
    const ys = all.map((pt) => pt[1]);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const yT = niceTicks(0, Math.max(1, ...ys), 5);
    // Inject markers get their own label band above the plot so they never hit the data.
    const markers = (c.markers || []).filter((m) => m.at >= x0 && m.at <= x1);
    const top = PAD.top + (markers.length ? 76 : 0);
    const plotW = VW - PAD.left - PAD.right;
    const plotH = VH - top - PAD.bottom;
    const sx = (v) => PAD.left + ((v - x0) / (x1 - x0 || 1)) * plotW;
    const sy = (v) => top + plotH - ((v - yT.lo) / (yT.hi - yT.lo || 1)) * plotH;

    const peak = series[0] ? series[0].points.reduce((m, pt) => (pt[1] > m[1] ? pt : m), series[0].points[0]) : null;
    const desc = t("chart.lineDesc", { title: c.title, from: xLabel(x0, d.xUnit), to: xLabel(x1, d.xUnit), max: peak ? fmtNum(peak[1], lang) : "–", at: peak ? xLabel(peak[0], d.xUnit) : "–" }, lang);
    const s = root(c.title, desc);
    const g = svg("g");
    s.appendChild(g);
    yAxis(g, sy, yT.ticks, plotW, lang, c.unit);

    // x ticks: ~7 evenly spaced data positions
    const xt = niceTicks(x0, x1, 7).ticks.filter((v) => v >= x0 && v <= x1);
    xt.forEach((v) => g.appendChild(svg("text", { class: "c-tick", x: sx(v), y: VH - PAD.bottom + 42, "text-anchor": "middle", text: xLabel(v, d.xUnit) })));
    g.appendChild(svg("line", { class: "c-axis", x1: PAD.left, x2: PAD.left + plotW, y1: sy(yT.lo), y2: sy(yT.lo) }));

    // Inject markers (only released injects reach the projection). Labels alternate
    // between two rows and anchor away from the right edge.
    markers.forEach((m, i) => {
      const x = sx(m.at);
      const row = PAD.top - 14 + (i % 2) * 36;
      const rightHalf = x > PAD.left + plotW * 0.6;
      const mk = svg("g", { class: ["c-marker", m.severity === "critical" || m.severity === "high" ? "c-marker--hot" : null] });
      mk.appendChild(svg("title", { text: xLabel(m.at, "minutes") + " — " + m.label }));
      mk.appendChild(svg("line", { x1: x, x2: x, y1: row + 10, y2: sy(yT.lo) }));
      mk.appendChild(svg("circle", { cx: x, cy: row + 2, r: 9 }));
      mk.appendChild(svg("text", { class: "c-marker__label", x: rightHalf ? x - 18 : x + 18, y: row + 10, "text-anchor": rightHalf ? "end" : "start", text: truncate(m.label, 40) }));
      g.appendChild(mk);
    });

    series.forEach((ser, i) => {
      const cls = toneClass(ser, i);
      const pts = ser.points.map((pt) => sx(pt[0]) + "," + sy(pt[1]));
      if (series.length === 1) {
        g.appendChild(svg("path", { class: ["c-area", cls], d: "M" + sx(ser.points[0][0]) + "," + sy(yT.lo) + " L" + pts.join(" L") + " L" + sx(ser.points[ser.points.length - 1][0]) + "," + sy(yT.lo) + " Z" }));
      }
      g.appendChild(svg("path", { class: ["c-line", "c-draw", cls], d: "M" + pts.join(" L"), pathLength: 1 }));
      // Hover targets with native tooltips (larger than the mark).
      ser.points.forEach((pt) => {
        const hit = svg("circle", { class: "c-hit", cx: sx(pt[0]), cy: sy(pt[1]), r: 14 });
        hit.appendChild(svg("title", { text: ser.label + " · " + xLabel(pt[0], d.xUnit) + ": " + fmtNum(pt[1], lang) }));
        g.appendChild(hit);
      });
      // Direct label at the peak of the first series only (selective).
      if (i === 0 && peak) {
        g.appendChild(svg("circle", { class: ["c-dot", cls], cx: sx(peak[0]), cy: sy(peak[1]), r: 8 }));
        g.appendChild(svg("text", { class: "c-value", x: sx(peak[0]) - 16, y: sy(peak[1]) - 18, "text-anchor": "end", text: fmtNum(peak[1], lang) }));
      }
    });

    const rows = series.length ? series[0].points.map((pt) => [xLabel(pt[0], d.xUnit)].concat(series.map((ser) => fmtNum((ser.points.find((q) => q[0] === pt[0]) || [0, ""])[1], lang)))) : [];
    return figure("line", [
      legend(series.map((ser, i) => ({ label: ser.label, cls: toneClass(ser, i), shape: "line" }))),
      s,
      dataTable(c.title, [d.xUnit || ""].concat(series.map((ser) => ser.label)), rows)
    ]);
  }

  // ---- Bar (stacked) ---------------------------------------------------------------------------------

  function bar(c, p) {
    const lang = p.lang;
    const d = c.data || {};
    const cats = d.categories || [];
    const series = d.series || [];
    const totals = cats.map((_, i) => series.reduce((sum, s) => sum + (s.values[i] || 0), 0));
    const yT = niceTicks(0, Math.max(1, ...totals), 5);
    const plotW = VW - PAD.left - PAD.right;
    const plotH = VH - PAD.top - PAD.bottom;
    const band = plotW / Math.max(1, cats.length);
    const bw = Math.min(96, band * 0.6);
    const sy = (v) => PAD.top + plotH - ((v - yT.lo) / (yT.hi - yT.lo || 1)) * plotH;
    const maxI = totals.indexOf(Math.max(...totals));

    const desc = t("chart.barDesc", { title: c.title, n: cats.length, max: fmtNum(totals[maxI] || 0, lang), at: xLabel(cats[maxI], d.categoryUnit) }, lang);
    const s = root(c.title, desc);
    const g = svg("g");
    s.appendChild(g);
    yAxis(g, sy, yT.ticks, plotW, lang, c.unit);

    cats.forEach((cat, i) => {
      const cx = PAD.left + band * i + band / 2;
      let acc = 0;
      series.forEach((ser, si) => {
        const v = ser.values[i] || 0;
        if (!v) return;
        const yTop = sy(acc + v);
        const yBot = sy(acc);
        acc += v;
        // 2px surface gap between stacked segments; 4px rounded data end.
        const rect = svg("rect", { class: ["c-bar", "c-grow", toneClass(ser, si)], x: cx - bw / 2, y: yTop + 1, width: bw, height: Math.max(0, yBot - yTop - 2), rx: 4 });
        rect.appendChild(svg("title", { text: xLabel(cat, d.categoryUnit) + " · " + ser.label + ": " + fmtNum(v, lang) }));
        g.appendChild(rect);
      });
      g.appendChild(svg("text", { class: "c-tick", x: cx, y: VH - PAD.bottom + 42, "text-anchor": "middle", text: xLabel(cat, d.categoryUnit) }));
      if (i === maxI && totals[i] > 0) g.appendChild(svg("text", { class: "c-value", x: cx, y: sy(totals[i]) - 14, "text-anchor": "middle", text: fmtNum(totals[i], lang) }));
    });
    g.appendChild(svg("line", { class: "c-axis", x1: PAD.left, x2: PAD.left + plotW, y1: sy(0), y2: sy(0) }));

    return figure("bar", [
      legend(series.map((ser, i) => ({ label: ser.label, cls: toneClass(ser, i) }))),
      s,
      dataTable(c.title, [d.categoryUnit || ""].concat(series.map((ser) => ser.label)), cats.map((cat, i) => [xLabel(cat, d.categoryUnit)].concat(series.map((ser) => ser.values[i] || 0))))
    ]);
  }

  // ---- KPI tiles ---------------------------------------------------------------------------------------

  const TONE_ICON = { danger: "warning", warn: "warning", ok: "check", info: "info" };

  function kpi(c, p) {
    const lang = p.lang;
    const fmt = (v, kind) => (kind === "currency" ? BK.i18n.fmt.currency(v, p.slide && p.slide.currency, lang) : fmtNum(v, lang));
    const tiles = (c.data && c.data.tiles) || [];
    return figure("kpi", [
      el(
        "div",
        { class: "s-kpis", role: "list", "aria-label": c.title },
        tiles.map((tile) =>
          el(
            "div",
            { class: ["s-kpi", "s-kpi--" + (tile.tone || "info")], role: "listitem" },
            // --chars lets a long value scale down inside its own tile instead of shrinking the slide.
            el("span", { class: "s-kpi__value", style: { "--chars": String(fmt(tile.value, tile.format).length) }, text: fmt(tile.value, tile.format) }),
            el("span", { class: "s-kpi__label" }, BK.dom.svgIcon(TONE_ICON[tile.tone] || "info", { size: 32 }), el("span", { text: tile.label }))
          )
        )
      )
    ]);
  }

  // ---- Gauge ------------------------------------------------------------------------------------------------

  function polar(cx, cy, r, angle) {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function arcPath(cx, cy, r, a0, a1) {
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return "M" + x0 + "," + y0 + " A" + r + "," + r + " 0 " + large + " 1 " + x1 + "," + y1;
  }

  function gauge(c, p) {
    const lang = p.lang;
    const d = c.data || {};
    const max = d.max || 100;
    const frac = Math.max(0, Math.min(1, (d.value || 0) / max));
    const cx = VW / 2;
    const cy = VH - 80;
    const r = 380;
    const s = root(c.title, t("chart.gaugeDesc", { title: c.title, value: fmtNum(d.value || 0, lang), max: fmtNum(max, lang) }, lang));
    s.appendChild(svg("path", { class: "c-track", d: arcPath(cx, cy, r, Math.PI, 2 * Math.PI) }));
    if (frac > 0) s.appendChild(svg("path", { class: ["c-gauge", "c-draw", d.tone ? "c-" + d.tone : "c-s1"], d: arcPath(cx, cy, r, Math.PI, Math.PI + Math.PI * frac), pathLength: 1 }));
    s.appendChild(svg("text", { class: "c-hero", x: cx, y: cy - 40, "text-anchor": "middle", text: fmtNum(d.value || 0, lang) + (d.suffix || "") }));
    if (d.label) s.appendChild(svg("text", { class: "c-tick", x: cx, y: cy + 10, "text-anchor": "middle", text: d.label }));
    return figure("gauge", [s, dataTable(c.title, [d.label || "", "max"], [[d.value, max]])]);
  }

  // ---- Donut ---------------------------------------------------------------------------------------------------

  function donut(c, p) {
    const lang = p.lang;
    const segs = ((c.data && c.data.segments) || []).filter((sg) => sg.value > 0);
    const total = segs.reduce((a, sg) => a + sg.value, 0) || 1;
    const cx = 320;
    const cy = VH / 2;
    const r = 230;
    const s = root(c.title, t("chart.donutDesc", { title: c.title, total: fmtNum(total, lang), n: segs.length }, lang));
    let a = -Math.PI / 2;
    const gap = 0.012; // ≈ 2px surface gap between segments
    segs.forEach((sg, i) => {
      const sweep = (sg.value / total) * 2 * Math.PI;
      const path = svg("path", { class: ["c-donut", "c-draw", "c-s" + ((i % 4) + 1)], d: arcPath(cx, cy, r, a + gap, a + sweep - gap), pathLength: 1 });
      path.appendChild(svg("title", { text: sg.label + ": " + fmtNum(sg.value, lang) }));
      s.appendChild(path);
      a += sweep;
    });
    s.appendChild(svg("text", { class: "c-hero c-hero--sm", x: cx, y: cy + 16, "text-anchor": "middle", text: fmtNum(total, lang) }));
    s.appendChild(svg("text", { class: "c-tick", x: cx, y: cy + 60, "text-anchor": "middle", text: t("chart.total", null, lang) }));

    // Direct labels as a value list (each with swatch, value and share) — doubles as the legend.
    segs.forEach((sg, i) => {
      const y = 140 + i * 96;
      s.appendChild(svg("rect", { class: ["c-swatch-svg", "c-s" + ((i % 4) + 1)], x: 720, y: y - 26, width: 28, height: 28, rx: 6 }));
      s.appendChild(svg("text", { class: "c-label", x: 772, y: y - 2, text: sg.label }));
      s.appendChild(svg("text", { class: "c-value", x: 1580, y: y - 2, "text-anchor": "end", text: fmtNum(sg.value, lang) + "  ·  " + Math.round((100 * sg.value) / total) + " %" }));
    });
    return figure("donut", [s, dataTable(c.title, ["", ""], segs.map((sg) => [sg.label, sg.value]))]);
  }

  // ---- Service dependency diagram ----------------------------------------------------------------------------------

  const STATUS_ICON = { down: "cross", degraded: "warning", compromised: "skull-lock", ok: "check", unknown: "question" };
  const STATUS_CLASS = { down: "c-danger", degraded: "c-warn", compromised: "c-danger", ok: "c-ok", unknown: "c-muted" };

  function statusChip(g, x, y, status, lang) {
    if (!status) return;
    const label = t("chart.status." + status, null, lang);
    const chip = svg("g", { class: ["c-chip", STATUS_CLASS[status], "c-st-" + status] });
    chip.appendChild(svg("circle", { cx: x, cy: y, r: 9 }));
    chip.appendChild(svg("text", { class: "c-chip__label", x: x + 18, y: y + 8, text: label }));
    g.appendChild(chip);
  }

  function dependency(c, p) {
    const lang = p.lang;
    const d = c.data || {};
    const services = (d.nodes || []).filter((n) => n.kind === "service");
    const platform = (d.nodes || []).filter((n) => n.kind === "platform");
    const rowsL = services.length;
    const rowsR = platform.length;
    const H = Math.max(VH, Math.max(rowsL, rowsR) * 84 + 40);
    const s = root(c.title, t("chart.depDesc", { title: c.title, services: rowsL, components: rowsR }, lang), VW, H);
    const boxW = 560;
    const leftX = 40;
    const rightX = VW - boxW - 40;
    const yL = (i) => 40 + i * ((H - 80) / Math.max(1, rowsL)) + (H - 80) / Math.max(1, rowsL) / 2;
    const yR = (i) => 40 + i * ((H - 80) / Math.max(1, rowsR)) + (H - 80) / Math.max(1, rowsR) / 2;
    const posL = {};
    const posR = {};
    services.forEach((n, i) => (posL[n.id] = yL(i)));
    platform.forEach((n, i) => (posR[n.id] = yR(i)));

    (d.edges || []).forEach((e) => {
      if (!(e.from in posL) || !(e.to in posR)) return;
      const x0 = leftX + boxW;
      const x1 = rightX;
      const y0 = posL[e.from];
      const y1 = posR[e.to];
      const target = platform.find((n) => n.id === e.to);
      const hot = target && (target.status === "compromised" || target.status === "down");
      s.appendChild(svg("path", { class: ["c-edge", hot && "c-edge--hot", "c-draw"], d: "M" + x0 + "," + y0 + " C" + (x0 + 160) + "," + y0 + " " + (x1 - 160) + "," + y1 + " " + x1 + "," + y1, pathLength: 1 }));
    });

    const node = (n, x, y) => {
      const g = svg("g", { class: ["c-node", n.status && "c-node--" + n.status] });
      g.appendChild(svg("title", { text: n.label + (n.status ? " — " + t("chart.status." + n.status, null, lang) : "") }));
      g.appendChild(svg("rect", { x, y: y - 34, width: boxW, height: 68, rx: 10 }));
      g.appendChild(svg("text", { class: "c-node__label", x: x + 24, y: y + (n.status ? -2 : 9), text: truncate(n.label, 34) }));
      if (n.status) statusChip(g, x + 32, y + 20, n.status, lang);
      s.appendChild(g);
    };
    services.forEach((n) => node(n, leftX, posL[n.id]));
    platform.forEach((n) => node(n, rightX, posR[n.id]));

    return figure("dependency", [
      s,
      dataTable(c.title, ["", ""], (d.edges || []).map((e) => {
        const a = services.find((n) => n.id === e.from);
        const b = platform.find((n) => n.id === e.to);
        return [a ? a.label : e.from, b ? b.label : e.to];
      }))
    ]);
  }

  /** Context slide: services and their platform dependencies, no status. */
  function dependencyFromServices(services) {
    const used = [];
    services.forEach((sv) => sv.deps.forEach((d) => used.find((u) => u.id === d.id) || used.push(d)));
    return dependency(
      {
        title: "",
        data: {
          nodes: services.map((sv) => ({ id: "svc-" + sv.id, kind: "service", label: sv.name })).concat(used.map((d) => ({ id: d.id, kind: "platform", label: d.label }))),
          edges: [].concat(...services.map((sv) => sv.deps.map((d) => ({ from: "svc-" + sv.id, to: d.id }))))
        }
      },
      { lang: BK.i18n.getLang() }
    );
  }

  // ---- Blast-radius network map ---------------------------------------------------------------------------------------

  function blast(c, p) {
    const lang = p.lang;
    const d = c.data || {};
    const rings = d.rings || [];
    const cx = VW / 2 - 200;
    const cy = VH / 2;
    const step = (VH / 2 - 40) / Math.max(1, rings.length);
    const s = root(c.title, t("chart.blastDesc", { title: c.title, center: d.center ? d.center.label : "", n: rings.length }, lang));

    // Ring labels sit at the bottom of each ring; nodes are spread over the remaining
    // arc so labels and nodes never share space.
    rings.forEach((ring, ri) => {
      const r = step * (ri + 1);
      s.appendChild(svg("circle", { class: "c-ring", cx, cy, r }));
      s.appendChild(svg("text", { class: "c-tick", x: cx, y: cy + r + 30, "text-anchor": "middle", text: ring.label }));
    });
    // Every node gets its own angle (rings take consecutive wedges), so no two labels
    // point the same way regardless of radius.
    const arcStart = Math.PI / 2 + 0.5;
    const arcSpan = 2 * Math.PI - 1.0;
    const total = rings.reduce((sum, ring) => sum + ring.nodes.length, 0) || 1;
    let k = 0;
    rings.forEach((ring, ri) => {
      const r = step * (ri + 1);
      ring.nodes.forEach((nd) => {
        const a = arcStart + (arcSpan * (k++ + 0.5)) / total;
        const [x, y] = polar(cx, cy, r, a);
        s.appendChild(svg("line", { class: "c-edge", x1: cx, y1: cy, x2: x, y2: y }));
        const g = svg("g", { class: ["c-chip", STATUS_CLASS[nd.status] || "c-muted", "c-st-" + (nd.status || "unknown")] });
        g.appendChild(svg("title", { text: nd.label + " — " + t("chart.status." + (nd.status || "unknown"), null, lang) }));
        g.appendChild(svg("circle", { class: "c-blast-node", cx: x, cy: y, r: 20 }));
        g.appendChild(svg("text", { class: "c-label c-label--sm", x: x + (Math.cos(a) >= 0 ? 30 : -30), y: y + 9, "text-anchor": Math.cos(a) >= 0 ? "start" : "end", text: truncate(nd.label, 22) }));
        s.appendChild(g);
      });
    });
    if (d.center) {
      const g = svg("g", { class: ["c-chip", STATUS_CLASS[d.center.status] || "c-danger"] });
      g.appendChild(svg("title", { text: t("chart.origin", { name: d.center.label }, lang) }));
      g.appendChild(svg("circle", { class: "c-blast-center", cx, cy, r: 34 }));
      s.appendChild(g);
      // The starting point is named in the legend: the space under the centre belongs to ring labels.
      const lg = svg("g", { class: ["c-chip", STATUS_CLASS[d.center.status] || "c-danger"] });
      // Two lines (label, then name), so a long name stays inside the frame.
      lg.appendChild(svg("title", { text: t("chart.origin", { name: d.center.label }, lang) }));
      lg.appendChild(svg("circle", { class: "c-blast-center", cx: VW - 351, cy: 52, r: 15 }));
      lg.appendChild(svg("text", { class: "c-label c-label--sm", x: VW - 322, y: 61, text: t("chart.originLabel", null, lang) }));
      lg.appendChild(svg("text", { class: "c-tick", x: VW - 322, y: 97, text: truncate(d.center.label, 22) }));
      s.appendChild(lg);
    }

    // Status legend (text label beside every colour, never colour alone).
    const statuses = Array.from(new Set([d.center && d.center.status].concat(...rings.map((r) => r.nodes.map((n) => n.status))).filter(Boolean)));
    statuses.forEach((st, i) => statusChip(s, VW - 351, 156 + i * 56, st, lang));

    const rows = [].concat(...rings.map((r) => r.nodes.map((n) => [r.label, n.label, t("chart.status." + (n.status || "unknown"), null, lang)])));
    return figure("blast", [s, dataTable(c.title, ["", "", ""], rows)]);
  }

  // ---- RTO / RPO vs estimated recovery ----------------------------------------------------------------------------------

  function rto(c, p) {
    const lang = p.lang;
    const rows = (c.data && c.data.services) || [];
    const max = Math.max(1, ...rows.map((r) => Math.max(r.estimate, r.rto)));
    const xT = niceTicks(0, max, 6);
    const left = 560;
    const plotW = VW - left - 80;
    const sx = (v) => left + (v / (xT.hi || 1)) * plotW;
    const rowH = (VH - 100) / Math.max(1, rows.length);
    const s = root(c.title, t("chart.rtoDesc", { title: c.title, n: rows.length, breaches: rows.filter((r) => r.estimate > r.rto).length }, lang));

    xT.ticks.forEach((v) => {
      s.appendChild(svg("line", { class: "c-grid", x1: sx(v), x2: sx(v), y1: 20, y2: VH - 70 }));
      s.appendChild(svg("text", { class: "c-tick", x: sx(v), y: VH - 30, "text-anchor": "middle", text: fmtNum(v, lang) + " h" }));
    });

    rows.forEach((r, i) => {
      const y = 30 + i * rowH + rowH / 2;
      const breach = r.estimate > r.rto;
      s.appendChild(svg("text", { class: "c-label", x: left - 24, y: y - 4, "text-anchor": "end", text: truncate(r.name, 30) }));
      s.appendChild(svg("text", { class: "c-tick", x: left - 24, y: y + 30, "text-anchor": "end", text: "RTO " + fmtNum(r.rto, lang) + " h · RPO " + fmtNum(r.rpo, lang) + " h" }));
      const b = svg("rect", { class: ["c-bar", "c-grow-x", breach ? "c-danger" : "c-s1"], x: left, y: y - 22, width: Math.max(2, sx(r.estimate) - left), height: 44, rx: 4 });
      b.appendChild(svg("title", { text: r.name + ": " + t("chart.estimate", null, lang) + " " + fmtNum(r.estimate, lang) + " h, RTO " + fmtNum(r.rto, lang) + " h" }));
      s.appendChild(b);
      // RTO target: a vertical tick in ink, labelled.
      s.appendChild(svg("line", { class: "c-target", x1: sx(r.rto), x2: sx(r.rto), y1: y - 34, y2: y + 34 }));
      const label = fmtNum(r.estimate, lang) + " h" + (breach ? " · " + t("chart.breach", null, lang) : "");
      const fitsOutside = sx(r.estimate) + 16 + label.length * 16 < VW - 8;
      s.appendChild(svg("text", { class: ["c-value", !fitsOutside && "c-value--inside"], x: fitsOutside ? sx(r.estimate) + 16 : sx(r.estimate) - 16, y: y + 10, "text-anchor": fitsOutside ? "start" : "end", text: label }));
    });

    return figure("rto", [
      legend([
        { label: t("chart.estimate", null, lang), cls: "c-s1" },
        { label: t("chart.breach", null, lang), cls: "c-danger" },
        { label: t("chart.rtoTarget", null, lang), cls: "c-target-swatch", shape: "tick" }
      ]),
      s,
      dataTable(c.title, ["", "RTO (h)", "RPO (h)", t("chart.estimate", null, lang) + " (h)"], rows.map((r) => [r.name, r.rto, r.rpo, r.estimate]))
    ]);
  }

  // ---- Incident timeline (debrief) ---------------------------------------------------------------------------------------

  /**
   * events: [{ at (minutes from T+0), label, kind: "attacker"|"inject"|"decision", severity? }]
   * Attacker events below the axis, injects and decisions above (decisions as diamonds).
   */
  function timeline(spec, lang) {
    const events = (spec.events || []).slice().sort((a, b) => a.at - b.at);
    const W = VW;
    const H = 260;
    const s = root(spec.title || "", t("chart.timelineDesc", { n: events.length }, lang), W, H);
    if (!events.length) return figure("timeline", [s]);
    const left = 60;
    const right = W - 60;
    // Rank-based spacing: days of quiet dwell time would otherwise squash the busy hours.
    const sx = (i) => left + (i / Math.max(1, events.length - 1)) * (right - left);
    const axisY = H / 2;
    s.appendChild(svg("line", { class: "c-axis", x1: left, x2: right, y1: axisY, y2: axisY }));
    // Numbered marks only; the readable labels live in the list below the chart, so
    // nothing collides however many events there are.
    events.forEach((e, i) => {
      const x = sx(i);
      const above = e.kind !== "attacker";
      const g = svg("g", { class: ["c-tl", "c-tl--" + e.kind] });
      g.appendChild(svg("title", { text: (i + 1) + ". " + (e.atLabel || xLabel(e.at, "minutes")) + " — " + e.label }));
      g.appendChild(svg("line", { class: "c-tl__stem", x1: x, x2: x, y1: axisY, y2: above ? axisY - 46 : axisY + 46 }));
      if (e.kind === "decision") g.appendChild(svg("rect", { class: "c-tl__mark", x: x - 11, y: axisY - 11, width: 22, height: 22, transform: "rotate(45 " + x + " " + axisY + ")" }));
      else g.appendChild(svg("circle", { class: "c-tl__mark", cx: x, cy: axisY, r: 10 }));
      g.appendChild(svg("text", { class: "c-label c-label--sm c-tl__num", x, y: above ? axisY - 58 : axisY + 76, "text-anchor": "middle", text: String(i + 1) }));
      s.appendChild(g);
    });
    const list = el(
      "ol",
      { class: "c-tl-list" },
      events.map((e) =>
        el(
          "li",
          { class: "c-tl-list__item c-tl--" + e.kind },
          el("span", { class: ["c-swatch", e.kind === "decision" && "c-swatch--diamond"], "aria-hidden": "true" }),
          el("span", { class: "c-tl-list__time", text: e.atLabel || xLabel(e.at, "minutes") }),
          el("span", { class: "c-tl-list__kind", text: t("chart.tl." + e.kind, null, lang) }),
          el("span", { class: "c-tl-list__text", text: e.label })
        )
      )
    );
    return figure("timeline", [
      legend([
        { label: t("chart.tl.attacker", null, lang), cls: "c-tl-attacker" },
        { label: t("chart.tl.inject", null, lang), cls: "c-tl-inject" },
        { label: t("chart.tl.decision", null, lang), cls: "c-tl-decision", shape: "diamond" }
      ]),
      s,
      list
    ]);
  }

  // ---- Dispatcher ---------------------------------------------------------------------------------------------------

  // Scenario slides carry timeline events in `data`, like every other chart type.
  const timelineChart = (c, p) => timeline({ title: c.title, events: (c.data && c.data.events) || [] }, p.lang);

  const RENDERERS = { line, bar, kpi, gauge, donut, dependency, blast, rto, timeline: timelineChart };

  /** Render a projected chart. Unknown types return null (the stage falls back to bars). */
  function chart(c, p) {
    const fn = RENDERERS[c.type];
    return fn ? fn(c, p) : null;
  }

  BK.graphics.chart = chart;
  BK.graphics.charts = Object.assign({}, RENDERERS, { timeline, niceTicks, xLabel });
  BK.graphics.dependencyFromServices = dependencyFromServices;
})();
