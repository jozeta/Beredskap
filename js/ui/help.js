/*
 * help.js — The in-app guide (#/help, #/help/<topic>). Content comes from
 * data/help.js as { en, sv } pairs and is drawn as text only. A contents list
 * jumps to a topic (the URL keeps the topic, so it can be linked), and the
 * search box filters topics by every word in them. The keyboard section shows
 * the stage's own shortcut list, so it can never drift from the real keys.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { el, svgIcon } = BK.dom;
  const c = BK.ui.c;
  const t = BK.t;
  const L = (v) => BK.loc(v);

  const sections = () => BK.data.help.SECTIONS;

  function blockNode(b) {
    if (b.p) return el("p", { text: L(b.p) });
    if (b.list) return el("ul", { class: "help__list" }, b.list.map((x) => el("li", { text: L(x) })));
    if (b.steps) return el("ol", { class: "help__steps" }, b.steps.map((x) => el("li", { text: L(x) })));
    if (b.tip) return el("p", { class: "help__tip" }, svgIcon("lightbulb", { size: 18 }), el("span", { text: L(b.tip) }));
    if (b.terms) return el("dl", { class: "help__terms" }, b.terms.map(([term, text]) => [el("dt", { text: L(term) }), el("dd", { text: L(text) })]));
    if (b.shortcuts) return BK.ui.stageRenderer.shortcutList(BK.i18n.getLang(), b.shortcuts);
    return null;
  }

  /** All searchable words of a section, in the current language. */
  function haystack(s) {
    const out = [L(s.title)];
    s.blocks.forEach((b) => {
      ["p", "tip"].forEach((k) => b[k] && out.push(L(b[k])));
      ["list", "steps"].forEach((k) => b[k] && b[k].forEach((x) => out.push(L(x))));
      if (b.terms) b.terms.forEach(([a, d]) => out.push(L(a), L(d)));
    });
    return out.join(" ").toLowerCase();
  }

  function sectionNode(s) {
    const hid = "help-" + s.id;
    return el(
      "section",
      { class: "card help__section", id: hid, "aria-labelledby": hid + "-h", tabindex: "-1", dataset: { topic: s.id } },
      el("h2", { id: hid + "-h", class: "help__h" }, el("span", { class: "help__icon" }, svgIcon(s.icon, { size: 20 })), L(s.title)),
      s.blocks.map(blockNode)
    );
  }

  function goTo(id, focus) {
    const node = document.getElementById("help-" + id);
    if (!node) return;
    node.scrollIntoView({ block: "start", behavior: "smooth" });
    if (focus) node.focus({ preventScroll: true });
    document.querySelectorAll(".help__toc-link").forEach((a) => a.setAttribute("aria-current", a.dataset.topic === id ? "true" : "false"));
  }

  BK.ui.help = {
    title: () => t("help.title"),
    render(root, ctx) {
      const list = sections();
      const nodes = list.map(sectionNode);
      const words = list.map(haystack);
      const empty = el("p", { class: "muted help__empty", hidden: true, text: t("help.noMatch") });
      const count = el("p", { class: "muted small", role: "status" });
      const toc = el(
        "ul",
        { class: "help__toc-list" },
        list.map((s) =>
          el(
            "li",
            { dataset: { topic: s.id } },
            el(
              "a",
              {
                class: "help__toc-link",
                href: "#/help/" + s.id,
                dataset: { topic: s.id },
                on: {
                  click: (e) => {
                    e.preventDefault();
                    window.history.replaceState(null, "", "#/help/" + s.id);
                    goTo(s.id, true);
                  }
                }
              },
              svgIcon(s.icon, { size: 16 }),
              el("span", { text: L(s.title) })
            )
          )
        )
      );
      const filter = (q) => {
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
        let shown = 0;
        list.forEach((s, i) => {
          const hit = terms.every((w) => words[i].includes(w));
          nodes[i].hidden = !hit;
          toc.children[i].hidden = !hit;
          if (hit) shown++;
        });
        empty.hidden = shown > 0;
        count.textContent = terms.length ? t("help.matches", { n: shown }) : "";
      };
      const search = el("input", { id: "help-search", class: "input", type: "search", placeholder: t("help.searchPlaceholder"), autocomplete: "off", on: { input: (e) => filter(e.target.value) } });

      root.append(
        c.pageHeader(t("help.title"), t("help.intro")),
        el(
          "div",
          { class: "help" },
          el(
            "nav",
            { class: "help__toc", "aria-label": t("help.contents") },
            c.field({ id: "help-search", label: t("help.search"), control: search }),
            count,
            el("h2", { class: "eyebrow help__toc-h", text: t("help.contents") }),
            toc
          ),
          el("div", { class: "help__body" }, empty, nodes)
        )
      );
      const topic = ctx && ctx.params && ctx.params.topic;
      if (topic) requestAnimationFrame(() => goTo(topic, true));
    }
  };
})();
