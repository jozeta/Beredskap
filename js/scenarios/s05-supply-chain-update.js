/*
 * s05-supply-chain-update.js — "Trusted Update, Untrusted Code" (archetype D).
 *
 * A vendor's signed update is followed by EDR alerts → it is on every host that
 * took the update → the vendor denies (misleading) → a national CSIRT advisory
 * confirms the vendor's build system was compromised → your network was used to
 * pivot into a customer → removing the agent breaks operations → the customer
 * and the regulator take the lead → a second-stage payload is found → even
 * older versions were tainted → you cannot easily replace the vendor.
 *
 * Ground truth: the vendor's build pipeline was compromised months ago; a
 * dormant loader was inserted into signed releases and activated with 7.4.2.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s05-supply-chain-update",
    version: 1,
    category: "supply-chain",
    archetype: "third-party-origin",
    emblem: "supply-chain",
    title: L(["Trusted Update, Untrusted Code", "Betrodd uppdatering, opålitlig kod"]),
    summary: L([
      "A routine weekend update from a trusted vendor sets off alerts on Monday morning. The vendor says it is a false positive. The truth arrives from outside — and it is worse than anyone wanted.",
      "En rutinmässig helguppdatering från en betrodd leverantör utlöser larm på måndagsmorgonen. Leverantören säger att det är ett falsklarm. Sanningen kommer utifrån – och den är värre än någon önskade."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Weigh a vendor's assurances against your own evidence", "Väga en leverantörs försäkringar mot era egna spår"]) },
      { id: "lo2", text: L(["Contain compromised trusted software across the estate", "Begränsa komprometterad betrodd programvara i hela miljön"]) },
      { id: "lo3", text: L(["Manage obligations to customers you may have exposed", "Hantera skyldigheter mot kunder som ni kan ha exponerat"]) },
      { id: "lo4", text: L(["Decide under dependency on a single critical supplier", "Fatta beslut när ni är beroende av en enda kritisk leverantör"]) }
    ],
    mitre: ["T1195.002", "T1554", "T1072", "T1071", "T1199", "T1003", "T1021"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.RA", "ID.AM", "DE.CM", "DE.AE", "RS.MA", "RS.AN", "RS.MI", "RS.CO", "RC.RP"],
      iso27001: ["A.5.5", "A.5.6", "A.5.7", "A.5.19", "A.5.20", "A.5.21", "A.5.22", "A.5.24", "A.5.26", "A.8.7", "A.8.32"]
    },
    minStages: 4,
    maxStages: 9,
    constraints: { startWindow: "monday-morning", sectors: ["technology", "logistics", "manufacturing", "finance", "public"] },
    actor: { types: ["state", "unknown"], motivation: L(["Long-term access to downstream customers of a software vendor", "Långsiktig åtkomst till programvaruleverantörens kunder i ledet"]), capability: "high" },
    variables: {
      hostsWithAgent: { min: 120, max: 6000, step: 10, scaleBy: "size" },
      beaconing: { min: 12, max: 300, scaleBy: "size" },
      secondStage: { min: 3, max: 40, scaleBy: "size" },
      replaceMonths: { min: 9, max: 18 }
    },
    roles: ["incidentCommander", "ciso", "cio", "socLead", "itOps", "networkLead", "supplierManager", "serviceOwner", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "Months ago an advanced actor compromised the build pipeline of {{supplier.vendor}} and inserted a dormant loader into signed releases. Version 7.4.2 activated it. On selected victims the loader fetched a second stage that harvested credentials; in your network it used a trusted connection to reach a customer.",
        "För flera månader sedan komprometterade en avancerad aktör byggmiljön hos {{supplier.vendor}} och lade in en vilande laddare i signerade versioner. Version 7.4.2 aktiverade den. Hos utvalda offer hämtade laddaren ett andra steg som samlade in inloggningsuppgifter; i ert nätverk använde den en betrodd förbindelse för att nå en kund."
      ]),
      attackerTimeline: [
        { at: -172800, text: L(["Vendor build pipeline compromised.", "Leverantörens byggmiljö komprometteras."]) },
        { at: -129600, text: L(["Dormant loader first shipped in a signed release (7.3.8).", "Den vilande laddaren levereras första gången i en signerad version (7.3.8)."]) },
        { at: -720, text: L(["Version 7.4.2 pushed by auto-update; loader activates.", "Version 7.4.2 skickas ut via automatisk uppdatering; laddaren aktiveras."]) },
        { at: -300, text: L(["Beaconing to command-and-control begins.", "Anrop till styrservern börjar."]) },
        { at: 900, text: L(["Second stage deployed on selected hosts; credentials harvested.", "Andra steget installeras på utvalda datorer; inloggningsuppgifter samlas in."]) },
        { at: 1200, text: L(["Trusted connection used to reach a customer's network.", "En betrodd förbindelse används för att nå en kunds nätverk."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-build", revealStage: "p3", text: L(["The vendor's build system was compromised; the signed update itself carries the malware.", "Leverantörens byggmiljö var komprometterad; den signerade uppdateringen bär själv på skadekoden."]) },
      { id: "hf-pivot", revealStage: "p4", text: L(["The attacker used your trusted connection to reach a customer's network.", "Angriparen använde er betrodda förbindelse för att nå en kunds nätverk."]) },
      { id: "hf-second", revealStage: "p7", text: L(["A second-stage credential stealer runs on {{num.secondStage}} hosts.", "Ett andra steg som stjäl inloggningsuppgifter körs på {{num.secondStage}} datorer."]) },
      { id: "hf-earlier", revealStage: "p8", text: L(["Earlier versions back to 7.3.8 also contained the dormant loader.", "Även tidigare versioner tillbaka till 7.3.8 innehöll den vilande laddaren."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Monday morning alerts", "Larm på måndagsmorgonen"]),
        narrative: L([
          "{{time.T+0|day}}, {{time.T+0|clock}}. Over the weekend {{supplier.vendor}} pushed version 7.4.2 of its IT-management agent, as it does every month. This morning the {{env.edr}} console is filling with alerts that all point at the agent's process.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Under helgen skickade {{supplier.vendor}} ut version 7.4.2 av sin agent för IT-förvaltning, som varje månad. I morse fylls {{env.edr}}-konsolen av larm som alla pekar på agentens process."
        ]),
        injects: [
          inj("i1-1", 0, "edrAlert", "edr", "high", "confirmed", [
            "The management agent (version 7.4.2, validly signed) launched a script interpreter and connected to {{asset.c2Domain}}. Seen on {{num.beaconing}} hosts so far.",
            "Förvaltningsagenten (version 7.4.2, giltigt signerad) startade en skripttolk och anslöt till {{asset.c2Domain}}. Hittills sett på {{num.beaconing}} datorer."
          ], { headline: ["{{env.edrAlert|cap}}: signed agent behaving unusually", "{{env.edrAlert|cap}}: signerad agent beter sig ovanligt"], tests: ["lo2"] }),
          inj("i1-2", 30, "chat", "person.itOps", "medium", "unverified", [
            "“This agent does inventory and patching on every machine. If we block it, we lose patching and remote support for {{num.hostsWithAgent}} computers.”",
            "”Den här agenten sköter inventering och patchning på varje dator. Om vi blockerar den förlorar vi patchning och fjärrsupport för {{num.hostsWithAgent}} datorer.”"
          ], { tests: ["lo4"] }),
          inj("i1-3", 45, "networkEvidence", "itOps", "medium", "confirmed", [
            "{{asset.c2Domain}} was registered three weeks ago and resolves to a cloud host. No other customer of yours has traffic to it.",
            "{{asset.c2Domain}} registrerades för tre veckor sedan och pekar på en molnserver. Ingen annan del av er verksamhet har trafik dit."
          ], { optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-alerts", type: "line", markers: "injects",
          title: L(["Agent alerts per 15 minutes", "Agentlarm per kvart"]), unit: L(["alerts", "larm"]),
          data: line(["Alerts", "Larm"], -240, 60, 15, (x, ctx) => (x < -300 ? 0 : Math.max(0, (ctx.vars.beaconing / 6) * (1 - Math.exp(-(x + 300) / 120)) + ctx.rng.int(-3, 3))))
        }],
        questions: {
          technical: [
            q("Can you block the destination without disabling the agent?", "Kan ni blockera mottagaren utan att stänga av agenten?", ["networkLead", "socLead"]),
            q("What can the agent do on a machine — and therefore what can an attacker?", "Vad kan agenten göra på en dator – och därmed en angripare?", ["itOps", "ciso"]),
            q("How do you check whether the update itself is what changed?", "Hur kontrollerar ni om det är själva uppdateringen som har förändrats?", ["socLead", "itOps"])
          ],
          executive: [
            q("Who contacts the vendor, and what do you ask for?", "Vem kontaktar leverantören, och vad ber ni om?", ["supplierManager", "ciso"]),
            q("What does losing the agent mean for the business today?", "Vad innebär det för verksamheten i dag att förlora agenten?", ["cio", "serviceOwner"]),
            q("Do you trust a signed update by default?", "Litar ni på en signerad uppdatering som utgångspunkt?", ["ciso", "cio"])
          ]
        },
        challenges: [ch("The agent is the tool you would normally use to fix this kind of problem.", "Agenten är det verktyg ni normalt skulle använda för att lösa den här typen av problem.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Block the destination domain at the firewall and isolate the hosts that alerted.", "Blockera domänen i brandväggen och isolera de datorer som larmat."],
          ["Stop the agent service on every machine now.", "Stoppa agenttjänsten på alla datorer nu."],
          ["Ask the vendor and wait for their analysis.", "Fråga leverantören och invänta deras analys."]
        ], {
          knowns: [["The signed agent contacts a three-week-old domain.", "Den signerade agenten kontaktar en tre veckor gammal domän."]],
          uncertainties: [["Whether the update or something else is responsible.", "Om det är uppdateringen eller något annat som ligger bakom."]],
          tradeoffs: {
            operational: ["Stopping the agent removes patching and remote support.", "Att stoppa agenten tar bort patchning och fjärrsupport."],
            security: ["Waiting lets the agent keep talking to the attacker.", "Att vänta låter agenten fortsätta prata med angriparen."],
            legal: ["Your contract may limit what you can do to the vendor's software.", "Ert avtal kan begränsa vad ni får göra med leverantörens programvara."],
            reputational: ["Overreacting to a vendor false positive damages the relationship.", "Att överreagera på ett falsklarm skadar leverantörsrelationen."]
          },
          evaluation: [["Contains based on own evidence without waiting for the vendor", "Begränsar utifrån egna spår utan att vänta på leverantören"]]
        }),
        facilitator: fac(
          ["Trust is the theme. The group should feel the pull to wait for the vendor.", "Förtroende är temat. Gruppen ska känna dragningen att vänta på leverantören."],
          ["Domain blocked, alerting hosts isolated, vendor contacted — without waiting for the vendor's answer.", "Domänen blockerad, larmande datorer isolerade och leverantören kontaktad – utan att vänta på leverantörens svar."],
          [["Ask: what evidence would the vendor need to convince you it is safe?", "Fråga: vilka bevis skulle leverantören behöva för att övertyga er om att det är säkert?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["“A false positive”", "”Ett falsklarm”"]),
        twist: L(["It is on every machine that took the update — and the vendor says you are wrong.", "Det finns på varje dator som tog emot uppdateringen – och leverantören säger att ni har fel."]),
        twistKind: "scope",
        assumptionChallenged: L(["A handful of hosts are affected.", "Ett fåtal datorer är drabbade."]),
        narrative: L([
          "{{time.T+120|clock}}. The SOC has checked every machine. The vendor's support team has also replied.",
          "Klockan {{time.T+120|clock}}. SOC har kontrollerat alla datorer. Leverantörens support har också svarat."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "soc", "high", "confirmed", [
            "Every host with version 7.4.2 contains the same extra component. Only some have started beaconing, but all have it. Hosts still on 7.4.1 are clean of this component.",
            "Varje dator med version 7.4.2 innehåller samma extra komponent. Bara en del har börjat anropa ut, men alla har den. Datorer som fortfarande har 7.4.1 saknar komponenten."
          ], { tests: ["lo1", "lo2"] }),
          inj("i2-2", 140, "email", "vendor", "medium", "misleading", [
            "{{supplier.vendor}} support: “Our builds are signed and scanned. This is a known false positive with some EDR products after our new telemetry feature. No action is required. Please do not remove the agent.”",
            "{{supplier.vendor}} support: ”Våra versioner är signerade och genomsökta. Det här är ett känt falsklarm hos vissa EDR-produkter efter vår nya telemetrifunktion. Ingen åtgärd krävs. Ta inte bort agenten.”"
          ], { headline: ["Re: Case 88213", "Sv: Ärende 88213"], facilitatorNote: ["Misleading in good faith: the vendor does not yet know it has been compromised. Note whether the group lets the reassurance override its own evidence.", "Vilseledande i god tro: leverantören vet ännu inte att den har blivit komprometterad. Notera om gruppen låter beskedet väga tyngre än de egna spåren."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c2-versions", type: "donut",
          title: L(["Agent versions in your estate", "Agentversioner i er miljö"]),
          data: (ctx) => {
            const total = ctx.vars.hostsWithAgent;
            const v742 = Math.round(total * 0.82);
            return { segments: [
              { id: "742", label: L(["7.4.2 (extra component)", "7.4.2 (extra komponent)"]), value: v742 },
              { id: "741", label: L(["7.4.1", "7.4.1"]), value: Math.round(total * 0.15) },
              { id: "old", label: L(["Older", "Äldre"]), value: total - v742 - Math.round(total * 0.15) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("What does an extra component on every 7.4.2 host prove, and what doesn't it?", "Vad bevisar en extra komponent på varje dator med 7.4.2, och vad bevisar den inte?", ["socLead", "ciso"]),
            q("Can you stop further updates from the vendor reaching your machines?", "Kan ni stoppa att fler uppdateringar från leverantören når era datorer?", ["itOps", "networkLead"]),
            q("Does your first containment cover hosts that have not beaconed yet?", "Täcker er första begränsning de datorer som ännu inte har anropat ut?", ["socLead"], "d1")
          ],
          executive: [
            q("Whose word counts more: your SOC's or the vendor's?", "Vems ord väger tyngst: er SOC:s eller leverantörens?", ["ciso", "cio"]),
            q("Who else should hear about this — other customers, the national CSIRT?", "Vem mer bör få veta – andra kunder, den nationella CSIRT-enheten?", ["ciso", "legal"]),
            q("Knowing it is everywhere, would you still act as you did this morning?", "När ni vet att det finns överallt – skulle ni fortfarande agera som i morse?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The vendor's account manager is a long-standing, trusted contact.", "Leverantörens kundansvarige är en långvarig och betrodd kontakt.")],
        decision: dec("d2", "ciso", ["How do you respond to the vendor's denial?", "Hur bemöter ni leverantörens förnekande?"], [
          ["Act on your own evidence: block the agent's network access everywhere and report to {{reg.csirt}}.", "Agera på era egna spår: blockera agentens nätverksåtkomst överallt och rapportera till {{reg.csirt}}."],
          ["Escalate to the vendor's security team and wait for their answer before wider action.", "Eskalera till leverantörens säkerhetsteam och invänta deras svar före bredare åtgärder."],
          ["Accept the vendor's explanation and tune the EDR rule.", "Godta leverantörens förklaring och justera EDR-regeln."]
        ], {
          knowns: [["Every 7.4.2 host has the same extra component.", "Varje dator med 7.4.2 har samma extra komponent."]],
          uncertainties: [["Whether the vendor knows more than it says.", "Om leverantören vet mer än den säger."]],
          tradeoffs: {
            operational: ["Blocking the agent everywhere stops management of the estate.", "Att blockera agenten överallt stoppar förvaltningen av miljön."],
            security: ["Tuning the rule would blind you to the attack.", "Att justera regeln skulle göra er blinda för angreppet."],
            legal: ["Reporting may be required under {{reg.nis2}}.", "Rapportering kan krävas enligt {{reg.nis2}}."],
            reputational: ["Being wrong about a vendor is recoverable; being wrong about an attack is not.", "Att ha fel om en leverantör går att reparera; att ha fel om ett angrepp gör det inte."]
          },
          evaluation: [["Trusts own evidence over reassurance", "Litar mer på egna spår än på lugnande besked"], ["Shares with the national CSIRT early", "Delar information med den nationella CSIRT-enheten tidigt"]]
        }),
        facilitator: fac(
          ["The central test of the scenario: reassurance versus evidence.", "Scenariots centrala prov: lugnande besked mot spår."],
          ["Network access for the agent blocked estate-wide and the national CSIRT informed.", "Agentens nätverksåtkomst blockerad i hela miljön och den nationella CSIRT-enheten informerad."],
          [["Ask: if you tune the rule and you are wrong, who explains it?", "Fråga: om ni justerar regeln och har fel, vem förklarar det då?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 360,
        title: L(["The advisory", "Varningen"]),
        twist: L(["The vendor's own build system was compromised. The signed update is the malware.", "Leverantörens egen byggmiljö var komprometterad. Den signerade uppdateringen är skadekoden."]),
        twistKind: "cause",
        assumptionChallenged: L(["Signed software from a trusted vendor is safe.", "Signerad programvara från en betrodd leverantör är säker."]),
        reveals: ["hf-build"],
        narrative: L([
          "{{time.T+360|clock}}. {{reg.csirt|cap}} publishes an advisory to its members and calls you directly because of your report.",
          "Klockan {{time.T+360|clock}}. {{reg.csirt|cap}} publicerar en varning till sina medlemmar och ringer er direkt med anledning av er rapport."
        ]),
        injects: [
          inj("i3-1", 360, "advisory", "csirt", "critical", "confirmed", [
            "Advisory: version 7.4.2 of {{supplier.vendor}}'s management agent contains a malicious loader inserted in the vendor's build process. The release is validly signed. Disconnect affected agents from the network and await guidance. Several organisations are affected.",
            "Varning: version 7.4.2 av förvaltningsagenten från {{supplier.vendor}} innehåller en skadlig laddare som har lagts in i leverantörens byggprocess. Versionen är giltigt signerad. Koppla bort berörda agenter från nätverket och invänta vägledning. Flera organisationer är drabbade."
          ], { headline: ["Supply-chain compromise in signed release", "Intrång i leveranskedjan i signerad version"], reveals: ["hf-build"], tests: ["lo1", "lo2"] }),
          inj("i3-2", 400, "phoneTranscript", "vendor", "medium", "confirmed", [
            "{{supplier.vendor}}'s CEO: “We are investigating with external experts. We were not aware. We ask customers to stay calm and await our clean release.”",
            "Vd för {{supplier.vendor}}: ”Vi utreder med externa experter. Vi kände inte till det här. Vi ber kunderna att vara lugna och invänta vår rena version.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("If the signature can't be trusted, what can you trust about any of this vendor's software?", "Om signaturen inte går att lita på, vad kan ni då lita på i leverantörens programvara?", ["ciso", "itOps"]),
            q("What did the loader do while it was active?", "Vad gjorde laddaren medan den var aktiv?", ["socLead"]),
            q("Did your response to the vendor's denial go far enough?", "Gick ert svar på leverantörens förnekande tillräckligt långt?", ["ciso"], "d2")
          ],
          executive: [
            q("What do you tell your own customers today?", "Vad säger ni till era egna kunder i dag?", ["comms", "ceo"]),
            q("Does this trigger a reporting duty for you?", "Utlöser det här en rapporteringsskyldighet för er?", ["legal", "ciso"]),
            q("Would you handle the vendor relationship differently, looking back?", "Skulle ni hantera leverantörsrelationen annorlunda, så här i efterhand?", ["supplierManager", "ciso"], "d2")
          ]
        },
        challenges: [ch("Removing the agent means rebuilding how you manage every computer.", "Att ta bort agenten innebär att bygga om hur ni förvaltar varje dator.")],
        decision: dec("d3", "cio", ["How do you deal with the agent across the estate?", "Hur hanterar ni agenten i hela miljön?"], [
          ["Uninstall it everywhere and manage machines another way for now.", "Avinstallera den överallt och förvalta datorerna på annat sätt tills vidare."],
          ["Keep it installed but cut all its network access until a verified clean version exists.", "Låt den vara installerad men stäng all dess nätverksåtkomst tills en verifierat ren version finns."],
          ["Roll back to 7.4.1 everywhere.", "Gå tillbaka till 7.4.1 överallt."]
        ], {
          knowns: [["The signed release 7.4.2 is malicious.", "Den signerade versionen 7.4.2 är skadlig."]],
          uncertainties: [["Whether earlier versions are clean.", "Om tidigare versioner är rena."]],
          tradeoffs: {
            operational: ["Uninstalling takes weeks of manual work.", "Avinstallation tar veckor av manuellt arbete."],
            security: ["Rolling back trusts an older build from the same compromised pipeline.", "En återgång litar på en äldre version från samma komprometterade byggmiljö."],
            legal: ["Licence terms may restrict modifications.", "Licensvillkor kan begränsa ändringar."],
            reputational: ["Customers will ask what you did once you knew.", "Kunderna kommer att fråga vad ni gjorde när ni väl visste."]
          },
          evaluation: [["Does not assume older versions are clean", "Utgår inte från att äldre versioner är rena"]]
        }),
        facilitator: fac(
          ["Many groups jump to “roll back”. Ask what that assumes.", "Många grupper hoppar direkt till ”gå tillbaka”. Fråga vad det förutsätter."],
          ["All network access for the agent cut, no blind rollback, and evidence preserved for the investigation.", "All nätverksåtkomst för agenten stängd, ingen blind återgång och spår säkrade för utredningen."],
          [["Ask: when did the pipeline become untrustworthy?", "Fråga: när slutade byggmiljön gå att lita på?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 1440,
        title: L(["A stepping stone", "En språngbräda"]),
        twist: L(["Your network was used as a stepping stone into one of your customers.", "Ert nätverk användes som språngbräda in till en av era kunder."]),
        twistKind: "scope",
        assumptionChallenged: L(["We are a victim, not a launch pad.", "Vi är ett offer, inte en startpunkt för angrepp."]),
        reveals: ["hf-pivot"],
        narrative: L([
          "Tuesday, {{time.T+1440|clock}}. The security manager of one of your largest customers calls. Their SOC has found intruder activity that came through the dedicated connection to your network.",
          "Tisdag, klockan {{time.T+1440|clock}}. Säkerhetschefen hos en av era största kunder ringer. Deras SOC har hittat intrångsaktivitet som kom via den dedikerade förbindelsen till ert nätverk."
        ]),
        injects: [
          inj("i4-1", 1440, "forensicFinding", "forensics", "critical", "confirmed", [
            "On Monday night a compromised management server of yours used the trusted site-to-site connection to sign in to the customer's jump host with a service account you share with them.",
            "Under måndagsnatten använde en av era komprometterade förvaltningsservrar den betrodda förbindelsen för att logga in på kundens hoppserver med ett tjänstekonto som ni delar med dem."
          ], { headline: ["Pivot into a customer network", "Förflyttning in i en kunds nätverk"], reveals: ["hf-pivot"], tests: ["lo3"] }),
          inj("i4-2", 1470, "email", "customer", "high", "confirmed", [
            "“We have disconnected the link to you. We need your full logs, a timeline and the name of your incident lead within four hours.”",
            "”Vi har kopplat bort förbindelsen till er. Vi behöver era fullständiga loggar, en tidslinje och namnet på er incidentledare inom fyra timmar.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-blast", type: "blast",
          title: L(["How far the compromise reached", "Hur långt intrånget nådde"]),
          data: () => ({
            center: { label: L(["Agent 7.4.2", "Agent 7.4.2"]), status: "compromised" },
            rings: [
              { label: L(["Your estate", "Er miljö"]), nodes: [{ label: L(["Workstations", "Arbetsstationer"]), status: "compromised" }, { label: L(["Servers", "Servrar"]), status: "compromised" }] },
              { label: L(["Management", "Förvaltning"]), nodes: [{ label: L(["Management server", "Förvaltningsserver"]), status: "compromised" }, { label: L(["Shared service account", "Delat tjänstekonto"]), status: "compromised" }] },
              { label: L(["Customer", "Kund"]), nodes: [{ label: L(["Customer jump host", "Kundens hoppserver"]), status: "compromised" }, { label: L(["Customer network", "Kundens nätverk"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("Which other connections and shared accounts could be used the same way?", "Vilka andra förbindelser och delade konton kan användas på samma sätt?", ["networkLead", "itOps"]),
            q("What exactly can you give the customer within four hours?", "Vad exakt kan ni ge kunden inom fyra timmar?", ["socLead", "itOps"]),
            q("Did keeping the agent installed leave this path open?", "Lämnade beslutet att behålla agenten installerad den här vägen öppen?", ["cio"], "d3")
          ],
          executive: [
            q("Who leads the relationship with the customer now — security or the account manager?", "Vem leder relationen med kunden nu – säkerhet eller kundansvarig?", ["ceo", "ciso"]),
            q("What are your contractual and legal obligations to this customer?", "Vilka avtalsmässiga och rättsliga skyldigheter har ni mot kunden?", ["legal"]),
            q("Would you have told this customer earlier, if you could do it again?", "Skulle ni ha informerat kunden tidigare, om ni kunde göra om det?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The customer is angry, scared and demanding everything at once.", "Kunden är arg, rädd och kräver allt på en gång.")],
        decision: dec("d4", "ceo", ["How do you work with the affected customer?", "Hur samarbetar ni med den drabbade kunden?"], [
          ["Full transparency: share logs, appoint a joint incident lead and disable every shared account.", "Full öppenhet: dela loggar, utse en gemensam incidentledare och spärra alla delade konton."],
          ["Share a summary through legal while protecting your position.", "Dela en sammanfattning via juristen och skydda er egen position."],
          ["Wait for your own investigation before sharing anything.", "Vänta på er egen utredning innan ni delar något."]
        ], {
          knowns: [["Your connection was used to reach the customer.", "Er förbindelse användes för att nå kunden."]],
          uncertainties: [["How far the attacker got inside the customer.", "Hur långt in hos kunden angriparen kom."]],
          tradeoffs: {
            operational: ["Supporting the customer takes your best people.", "Att stötta kunden tar era bästa medarbetare."],
            security: ["The customer can only defend itself with your data.", "Kunden kan bara försvara sig med era uppgifter."],
            legal: ["Admissions may affect liability.", "Medgivanden kan påverka ansvaret."],
            reputational: ["Customers judge partners by how they behave in a crisis.", "Kunder bedömer partner efter hur de beter sig i en kris."]
          },
          evaluation: [["Shares what the customer needs to defend itself", "Delar det kunden behöver för att försvara sig"], ["Disables shared trust paths", "Spärrar delade förtroendevägar"]]
        }),
        facilitator: fac(
          ["From victim to vector. Watch for defensiveness.", "Från offer till smittbärare. Se upp med försvarsinställning."],
          ["Logs shared fast, joint incident leadership and all shared accounts and connections reviewed.", "Loggar delade snabbt, gemensam incidentledning och alla delade konton och förbindelser granskade."],
          [["Ask: if you were the customer, what would you need in four hours?", "Fråga: om ni var kunden, vad skulle ni behöva inom fyra timmar?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1560,
        title: L(["Running without the agent", "Att klara sig utan agenten"]),
        twist: L(["Cutting the agent off has stopped patching, inventory and remote support for {{num.hostsWithAgent}} machines.", "Att stänga av agenten har stoppat patchning, inventering och fjärrsupport för {{num.hostsWithAgent}} datorer."]),
        twistKind: "impact",
        assumptionChallenged: L(["We can do without the agent for a while.", "Vi klarar oss utan agenten ett tag."]),
        narrative: L([
          "{{time.T+1560|clock}}. The service desk is overwhelmed, and a critical browser update is due this week.",
          "Klockan {{time.T+1560|clock}}. Servicedesken är överbelastad, och en kritisk webbläsaruppdatering ska ut den här veckan."
        ]),
        injects: [
          inj("i5-1", 1560, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Remote support is down, software installation is manual, and nobody knows exactly which machines exist. Field staff cannot get laptops fixed.",
            "Fjärrsupporten fungerar inte, programinstallation sker manuellt och ingen vet exakt vilka datorer som finns. Fältpersonal kan inte få sina bärbara datorer lagade."
          ], { fallbackRole: "itOps", tests: ["lo4"] }),
          inj("i5-2", 1590, "advisory", "csirt", "high", "confirmed", [
            "A critical browser vulnerability is being exploited. Patch within 72 hours.",
            "En kritisk sårbarhet i webbläsare utnyttjas aktivt. Patcha inom 72 timmar."
          ], { optional: true, tests: ["lo4"] })
        ],
        charts: [{
          id: "c5-kpi", type: "kpi",
          title: L(["Operational impact", "Verksamhetspåverkan"]),
          data: kpi([
            { id: "hosts", label: ["Machines without management", "Datorer utan förvaltning"], value: (v) => v.hostsWithAgent, tone: "warn" },
            { id: "beacon", label: ["Machines that beaconed", "Datorer som anropat ut"], value: (v) => v.beaconing, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("How do you patch urgently without the compromised tool?", "Hur patchar ni akut utan det komprometterade verktyget?", ["itOps"]),
            q("What would a safe, temporary management channel look like?", "Hur skulle en säker, tillfällig förvaltningskanal se ut?", ["itOps", "ciso"]),
            q("Was cutting the agent off the right way to contain it?", "Var det rätt sätt att begränsa agenten att stänga av den?", ["cio"], "d3")
          ],
          executive: [
            q("Which business processes come first for manual support?", "Vilka verksamhetsprocesser får manuell support först?", ["serviceOwner", "cio"]),
            q("Do you bring in extra staff or a third party to cope?", "Tar ni in extra personal eller en tredje part för att klara det?", ["cio", "ceo"]),
            q("Does the customer situation change your priorities here?", "Ändrar situationen hos kunden era prioriteringar här?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("An unpatched critical vulnerability is now a risk created by your own containment.", "En opatchad kritisk sårbarhet är nu en risk som er egen begränsning har skapat.")],
        decision: dec("d5", "cio", ["How do you keep operating?", "Hur håller ni verksamheten igång?"], [
          ["Stand up a temporary, separately built management channel for urgent patches only.", "Bygg upp en tillfällig, separat förvaltningskanal endast för akuta patchar."],
          ["Patch the critical vulnerability manually on prioritised machines.", "Patcha den kritiska sårbarheten manuellt på prioriterade datorer."],
          ["Re-enable the agent briefly to push the patch, then cut it again.", "Aktivera agenten kortvarigt för att skicka ut patchen och stäng sedan av den igen."]
        ], {
          knowns: [["The agent cannot be trusted.", "Agenten går inte att lita på."]],
          uncertainties: [["How long until a verified clean version exists.", "Hur lång tid det tar innan en verifierat ren version finns."]],
          tradeoffs: {
            operational: ["Manual patching reaches only part of the estate.", "Manuell patchning når bara en del av miljön."],
            security: ["Re-enabling the agent reopens the attacker's channel.", "Att aktivera agenten öppnar angriparens kanal igen."],
            legal: ["Unpatched systems may breach your own policies.", "Opatchade system kan bryta mot era egna policyer."],
            reputational: ["A second incident during this one would be hard to explain.", "En andra incident mitt i den här vore svår att förklara."]
          },
          evaluation: [["Does not reopen the compromised channel", "Öppnar inte den komprometterade kanalen igen"]]
        }),
        facilitator: fac(
          ["Containment has a cost. Help the room weigh security against operations honestly.", "Begränsning har ett pris. Hjälp gruppen att ärligt väga säkerhet mot drift."],
          ["A separate temporary channel for urgent patches; the compromised agent stays off.", "En separat tillfällig kanal för akuta patchar; den komprometterade agenten förblir avstängd."],
          [["Ask: is there any way to use the agent that the attacker could not?", "Fråga: finns det något sätt att använda agenten som angriparen inte kan?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 2880,
        title: L(["Other people's decisions", "Andras beslut"]),
        twist: L(["The customer and the regulator now set the terms — not you.", "Kunden och tillsynsmyndigheten sätter nu villkoren – inte ni."]),
        twistKind: "authority",
        assumptionChallenged: L(["We decide how fast we recover and reconnect.", "Vi bestämmer hur snabbt vi återställer och kopplar upp igen."]),
        narrative: L([
          "Wednesday. Letters arrive from the customer's lawyers and from {{reg.supervisor}}.",
          "Onsdag. Brev kommer från kundens advokater och från {{reg.supervisor}}."
        ]),
        injects: [
          inj("i6-1", 2880, "regulatorLetter", "regulator", "high", "confirmed", [
            "{{reg.supervisor|cap}} requests an incident report under {{reg.nis2}}, including how you manage risks from ICT suppliers.",
            "{{reg.supervisor|cap}} begär en incidentrapport enligt {{reg.nis2}}, inklusive hur ni hanterar risker med IT-leverantörer."
          ], { pressure: "regulator", substitute: { source: "management", content: ["The board asks for a written account of how supplier risks were managed before the incident.", "Styrelsen ber om en skriftlig redogörelse för hur leverantörsriskerna hanterades före incidenten."] }, tests: ["lo4"] }),
          inj("i6-2", 2910, "email", "customer", "high", "confirmed", [
            "The customer's lawyers: “Our client will not restore the connection until an independent party confirms your environment is clean. Our client reserves the right to terminate the agreement.”",
            "Kundens advokater: ”Vår klient återställer inte förbindelsen förrän en oberoende part har bekräftat att er miljö är ren. Vår klient förbehåller sig rätten att säga upp avtalet.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What would an independent “clean” confirmation require?", "Vad skulle en oberoende bekräftelse på att miljön är ren kräva?", ["ciso", "socLead"]),
            q("How do you document supplier risk management you may not have had?", "Hur dokumenterar ni en hantering av leverantörsrisker som ni kanske inte hade?", ["ciso"]),
            q("Did the way you shared with the customer help you now?", "Hjälper sättet ni delade information med kunden er nu?", ["ciso"], "d4")
          ],
          executive: [
            q("Do you appoint an independent assessor, and who pays?", "Anlitar ni en oberoende granskare, och vem betalar?", ["ceo", "legal"]),
            q("How honest is your report to the regulator about supplier controls?", "Hur ärlig är er rapport till tillsynsmyndigheten om leverantörskontrollerna?", ["ciso", "legal"]),
            q("Would you still choose the same posture with the customer?", "Skulle ni fortfarande välja samma hållning gentemot kunden?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("An independent assessment takes weeks; the customer relationship may not last that long.", "En oberoende granskning tar veckor; kundrelationen kanske inte håller så länge.")],
        decision: dec("d6", "ceo", ["How do you meet the external demands?", "Hur möter ni de externa kraven?"], [
          ["Commission an independent assessment now and report candidly to the regulator.", "Beställ en oberoende granskning nu och rapportera öppet till tillsynsmyndigheten."],
          ["Offer the customer your own internal assessment first.", "Erbjud kunden er egen interna bedömning först."],
          ["Let legal handle both and limit what you share.", "Låt juristen hantera båda och begränsa vad ni delar."]
        ], {
          knowns: [["The customer requires independent confirmation.", "Kunden kräver en oberoende bekräftelse."]],
          uncertainties: [["Whether the regulator will see your supplier controls as adequate.", "Om tillsynsmyndigheten kommer att se era leverantörskontroller som tillräckliga."]],
          tradeoffs: {
            operational: ["Assessors need access and time from your team.", "Granskare behöver åtkomst och tid från ert team."],
            security: ["Independent eyes find what you missed.", "Oberoende ögon hittar det ni har missat."],
            legal: ["Candour now limits harm later.", "Öppenhet nu begränsar skadan senare."],
            reputational: ["Defensiveness costs the customer anyway.", "En försvarsinställning kostar kunden i vilket fall."]
          },
          evaluation: [["Accepts external scrutiny constructively", "Tar emot extern granskning konstruktivt"]]
        }),
        facilitator: fac(
          ["Authority moves outside. Watch whether the group fights it or works with it.", "Mandatet flyttar utanför. Se om gruppen kämpar emot eller samarbetar."],
          ["Independent assessment commissioned and candid regulatory reporting.", "Oberoende granskning beställd och öppen rapportering till tillsynsmyndigheten."],
          [["Ask: what would rebuild the customer's trust fastest?", "Fråga: vad skulle bygga upp kundens förtroende snabbast?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 4320,
        title: L(["A second stage", "Ett andra steg"]),
        twist: L(["On {{num.secondStage}} machines the loader fetched a credential stealer that keeps running without the agent.", "På {{num.secondStage}} datorer hämtade laddaren ett program som stjäl inloggningsuppgifter och som fortsätter köras utan agenten."]),
        twistKind: "scope",
        assumptionChallenged: L(["Cutting off the agent removed the attacker.", "Att stänga av agenten tog bort angriparen."]),
        reveals: ["hf-second"],
        narrative: L([
          "Thursday. The external forensic team has finished its first sweep.",
          "Torsdag. Det externa forensiska teamet har gjort sin första genomgång."
        ]),
        injects: [
          inj("i7-1", 4320, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "A second-stage program on {{num.secondStage}} machines — mostly administrators' workstations and management servers — captured credentials and runs on its own schedule, independent of the agent.",
            "Ett program i andra steget på {{num.secondStage}} datorer – främst administratörernas arbetsstationer och förvaltningsservrar – har fångat inloggningsuppgifter och körs enligt eget schema, oberoende av agenten."
          ], { reveals: ["hf-second"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c7-kpi", type: "kpi",
          title: L(["Second-stage findings", "Fynd i andra steget"]),
          data: kpi([
            { id: "second", label: ["Machines with the credential stealer", "Datorer med programmet som stjäl uppgifter"], value: (v) => v.secondStage, tone: "danger" },
            { id: "beacon", label: ["Machines that beaconed", "Datorer som anropat ut"], value: (v) => v.beaconing, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("Which credentials must you assume are stolen, and in what order do you reset them?", "Vilka inloggningsuppgifter måste ni anta är stulna, och i vilken ordning byter ni dem?", ["itOps", "ciso"]),
            q("Can these machines be cleaned, or must they be rebuilt?", "Kan de här datorerna rensas, eller måste de byggas om?", ["itOps", "socLead"]),
            q("What did cutting the agent off miss?", "Vad missade ni genom att bara stänga av agenten?", ["socLead"], "d3")
          ],
          executive: [
            q("Does this change what you tell the customer and the regulator?", "Ändrar det här vad ni säger till kunden och tillsynsmyndigheten?", ["ceo", "legal"]),
            q("Do you extend the independent assessment's scope?", "Utökar ni den oberoende granskningens omfattning?", ["ciso", "ceo"]),
            q("Would you have commissioned the assessment differently?", "Skulle ni ha beställt granskningen på ett annat sätt?", ["ceo"], "d6")
          ]
        },
        challenges: [ch("Administrator credentials were stolen — including those used for the clean-up.", "Administratörernas inloggningsuppgifter har stulits – även de som används i saneringen.")],
        decision: dec("d7", "ciso", ["How do you treat the affected machines and credentials?", "Hur hanterar ni de drabbade datorerna och inloggningsuppgifterna?"], [
          ["Rebuild affected machines from clean images and reset all privileged credentials from a clean workstation.", "Bygg om drabbade datorer från rena avbilder och byt alla privilegierade inloggningsuppgifter från en ren arbetsstation."],
          ["Clean the machines with EDR tools and reset the credentials seen in use.", "Rensa datorerna med EDR-verktyg och byt de inloggningsuppgifter som setts användas."],
          ["Monitor the machines for a week to learn more.", "Bevaka datorerna en vecka för att lära er mer."]
        ], {
          knowns: [["Credentials were captured on administrative machines.", "Inloggningsuppgifter fångades på administrativa datorer."]],
          uncertainties: [["Which captured credentials have already been used.", "Vilka fångade uppgifter som redan har använts."]],
          tradeoffs: {
            operational: ["Rebuilding admin machines slows the whole response.", "Att bygga om administratörsdatorer saktar ner hela hanteringen."],
            security: ["Cleaning in place leaves doubt.", "Rensning på plats lämnar tvivel kvar."],
            legal: ["Evidence must be preserved before rebuilds.", "Spår måste säkras före ombyggnad."],
            reputational: ["A second wave would be devastating.", "En andra våg vore förödande."]
          },
          evaluation: [["Resets credentials from a known-clean workstation", "Byter inloggningsuppgifter från en arbetsstation som är känd som ren"]]
        }),
        facilitator: fac(
          ["The persistence lesson in a supply-chain setting.", "Lärdomen om persistens i en leveranskedjemiljö."],
          ["Rebuilds from clean images and credential resets performed from clean machines.", "Ombyggnad från rena avbilder och byten av inloggningsuppgifter från rena datorer."],
          [["Ask: which machine will you trust to reset the passwords from?", "Fråga: vilken dator litar ni på att byta lösenorden från?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 7200,
        title: L(["The clean release", "Den rena versionen"]),
        twist: L(["Earlier versions back to 7.3.8 were also tainted — and the new “clean” release cannot be verified independently.", "Även tidigare versioner tillbaka till 7.3.8 var smittade – och den nya ”rena” versionen kan inte verifieras oberoende."]),
        twistKind: "impact",
        assumptionChallenged: L(["The vendor's clean release ends the problem.", "Leverantörens rena version löser problemet."]),
        reveals: ["hf-earlier"],
        narrative: L([
          "A week later. {{supplier.vendor}} publishes a rebuilt version 7.4.3 and a report.",
          "En vecka senare. {{supplier.vendor}} publicerar en ombyggd version 7.4.3 och en rapport."
        ]),
        injects: [
          inj("i8-1", 7200, "supplierNotice", "vendor", "high", "confirmed", [
            "The vendor's report admits that versions from 7.3.8 onwards contained the dormant loader, which only 7.4.2 activated. Version 7.4.3 is built on a new pipeline. No independent verification is offered yet.",
            "Leverantörens rapport medger att versioner från och med 7.3.8 innehöll den vilande laddaren, som bara 7.4.2 aktiverade. Version 7.4.3 är byggd i en ny byggmiljö. Någon oberoende verifiering erbjuds ännu inte."
          ], { reveals: ["hf-earlier"], tests: ["lo1", "lo4"] })
        ],
        questions: {
          technical: [
            q("What evidence would you need before reinstalling any version?", "Vilka bevis skulle ni behöva innan ni installerar någon version igen?", ["ciso", "itOps"]),
            q("How would you detect misbehaviour by a reinstalled agent quickly?", "Hur skulle ni snabbt upptäcka om en återinstallerad agent beter sig fel?", ["socLead"]),
            q("Looking back, would rolling back to 7.4.1 have helped?", "Så här i efterhand – hade en återgång till 7.4.1 hjälpt?", ["cio"], "d3")
          ],
          executive: [
            q("What conditions do you put on the vendor before trusting it again?", "Vilka villkor ställer ni på leverantören innan ni litar på den igen?", ["supplierManager", "ceo"]),
            q("Does the customer accept a reinstalled agent in your environment?", "Godtar kunden en återinstallerad agent i er miljö?", ["ceo"]),
            q("Would you handle the vendor differently from day one?", "Skulle ni hantera leverantören annorlunda från första dagen?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("Without the agent, IT management stays manual and expensive.", "Utan agenten förblir IT-förvaltningen manuell och dyr.")],
        decision: dec("d8", "cio", ["Do you reinstall the vendor's agent?", "Installerar ni leverantörens agent igen?"], [
          ["Only after independent verification, contractual security commitments and strict network limits.", "Först efter oberoende verifiering, avtalade säkerhetsåtaganden och strikta nätverksbegränsningar."],
          ["Reinstall 7.4.3 now with close monitoring.", "Installera 7.4.3 nu med noggrann bevakning."],
          ["Do not reinstall; start replacing the vendor.", "Installera inte igen; börja ersätta leverantören."]
        ], {
          knowns: [["Every version since 7.3.8 was tainted.", "Varje version sedan 7.3.8 var smittad."]],
          uncertainties: [["Whether the new pipeline is truly clean.", "Om den nya byggmiljön verkligen är ren."]],
          tradeoffs: {
            operational: ["Delay keeps operations manual.", "En fördröjning håller förvaltningen manuell."],
            security: ["Trusting without verification repeats the original mistake.", "Att lita utan verifiering upprepar det ursprungliga misstaget."],
            legal: ["Your contract may give you few rights to demand evidence.", "Ert avtal kanske ger er få rättigheter att kräva bevis."],
            reputational: ["Customers will ask why you trust the vendor again.", "Kunderna kommer att fråga varför ni litar på leverantören igen."]
          },
          evaluation: [["Makes renewed trust conditional on evidence", "Gör förnyat förtroende villkorat av bevis"]]
        }),
        facilitator: fac(
          ["Trust after betrayal. The best groups define what evidence would suffice.", "Förtroende efter ett svek. De bästa grupperna definierar vilka bevis som räcker."],
          ["Reinstallation only under independent verification and contractual commitments.", "Återinstallation endast med oberoende verifiering och avtalade åtaganden."],
          [["Ask: what would the vendor have to show you?", "Fråga: vad skulle leverantören behöva visa er?"]]
        )
      },
      {
        id: "p9",
        priority: 5,
        clock: 10080,
        title: L(["You cannot simply leave", "Ni kan inte bara gå"]),
        twist: L(["Procurement says no alternative vendor can replace this one in under {{num.replaceMonths}} months.", "Inköp säger att ingen annan leverantör kan ersätta den här på mindre än {{num.replaceMonths}} månader."]),
        twistKind: "impact",
        assumptionChallenged: L(["If a supplier fails us, we can switch.", "Om en leverantör sviker oss kan vi byta."]),
        narrative: L([
          "Two weeks later. The board wants to know why one supplier could put the whole organisation and a key customer at risk.",
          "Två veckor senare. Styrelsen vill veta varför en enda leverantör kunde utsätta hela organisationen och en viktig kund för risk."
        ]),
        injects: [
          inj("i9-1", 10080, "email", "person.supplierManager", "medium", "confirmed", [
            "“Replacing the agent means a new tender, migration and retraining. Realistic estimate: {{num.replaceMonths}} months. Our contract has no security clauses, no audit right and no exit support.”",
            "”Att ersätta agenten innebär ny upphandling, migrering och utbildning. Realistisk bedömning: {{num.replaceMonths}} månader. Vårt avtal saknar säkerhetsklausuler, granskningsrätt och stöd vid avveckling.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you limit what any management tool can do, whoever supplies it?", "Hur begränsar ni vad ett förvaltningsverktyg kan göra, oavsett vem som levererar det?", ["ciso", "networkLead"]),
            q("Which other suppliers have this level of access?", "Vilka andra leverantörer har den här nivån av åtkomst?", ["ciso", "itOps"]),
            q("What would you have needed on day one to decide faster?", "Vad hade ni behövt första dagen för att kunna besluta snabbare?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("How do you govern critical suppliers from now on?", "Hur styr ni kritiska leverantörer framöver?", ["supplierManager", "ceo"]),
            q("Which clauses must every critical contract contain?", "Vilka klausuler måste varje kritiskt avtal innehålla?", ["legal", "supplierManager"]),
            q("Do your decisions about reinstalling the vendor still hold?", "Står sig era beslut om att återinstallera leverantören?", ["ceo"], "d8")
          ]
        },
        challenges: [ch("Switching takes more than a year; staying means trusting the same vendor.", "Att byta tar mer än ett år; att stanna innebär att lita på samma leverantör.")],
        decision: dec("d9", "ceo", ["What is your supplier strategy?", "Vilken är er leverantörsstrategi?"], [
          ["Stay for now under new security clauses, while preparing a planned exit.", "Stanna tills vidare med nya säkerhetsklausuler och förbered samtidigt en planerad avveckling."],
          ["Start replacing the vendor immediately.", "Börja ersätta leverantören omedelbart."],
          ["Stay and rely on the vendor's improvements.", "Stanna och lita på leverantörens förbättringar."]
        ], {
          knowns: [["The contract lacks security clauses and exit support.", "Avtalet saknar säkerhetsklausuler och stöd vid avveckling."]],
          uncertainties: [["Whether any alternative is safer.", "Om något alternativ är säkrare."]],
          tradeoffs: {
            operational: ["Replacing is long and disruptive.", "Att byta är långt och störande."],
            security: ["Staying without leverage changes nothing.", "Att stanna utan påtryckningsmedel förändrar ingenting."],
            legal: ["New clauses need negotiation power you may now have.", "Nya klausuler kräver en förhandlingsposition som ni kanske nu har."],
            reputational: ["Customers and regulators expect visible supplier governance.", "Kunder och tillsynsmyndigheter förväntar sig synlig leverantörsstyrning."]
          },
          evaluation: [["Builds security and exit terms into critical contracts", "Bygger in säkerhets- och avvecklingsvillkor i kritiska avtal"]]
        }),
        facilitator: fac(
          ["Close on governance: supply-chain risk is a business decision.", "Avsluta med styrning: risker i leveranskedjan är ett affärsbeslut."],
          ["Security clauses, audit rights and an exit plan for critical suppliers, with limits on what management tools can reach.", "Säkerhetsklausuler, granskningsrätt och avvecklingsplan för kritiska leverantörer, med begränsningar för vad förvaltningsverktyg kan nå."],
          [["Ask: which of your suppliers could do this to you tomorrow?", "Fråga: vilken av era leverantörer skulle kunna orsaka det här i morgon?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The estate is cleaned and the customer reconnects after independent review. The vendor stays for now under new terms, and a planned exit begins.",
        "Miljön saneras och kunden kopplar upp sig igen efter oberoende granskning. Leverantören blir kvar tills vidare på nya villkor, och en planerad avveckling påbörjas."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A valid signature proves who built something, not that the build was safe.", "En giltig signatur visar vem som byggde något, inte att bygget var säkert."]),
        L(["Your own evidence outranks a vendor's reassurance.", "Era egna spår väger tyngre än en leverantörs lugnande besked."]),
        L(["Trusted connections and shared accounts make you a path into others.", "Betrodda förbindelser och delade konton gör er till en väg in till andra."]),
        L(["Critical supplier contracts need security clauses, audit rights and an exit plan.", "Avtal med kritiska leverantörer behöver säkerhetsklausuler, granskningsrätt och en avvecklingsplan."])
      ],
      assumptionsVsReality: [
        avr(["A few hosts are affected.", "Några få datorer är drabbade."], ["Every 7.4.2 host carried the loader.", "Varje dator med 7.4.2 bar på laddaren."], "p2"),
        avr(["Signed updates are safe.", "Signerade uppdateringar är säkra."], ["The vendor's build system was compromised.", "Leverantörens byggmiljö var komprometterad."], "p3"),
        avr(["We are only a victim.", "Vi är bara ett offer."], ["We were a stepping stone into a customer.", "Vi var en språngbräda in till en kund."], "p4"),
        avr(["Cutting off the agent removes the attacker.", "Att stänga av agenten tar bort angriparen."], ["A second stage kept running.", "Ett andra steg fortsatte att köras."], "p7")
      ],
      strengthsToLookFor: [
        L(["Acting on own evidence despite vendor denial", "Att agera på egna spår trots leverantörens förnekande"]),
        L(["Early reporting to the national CSIRT", "Tidig rapportering till den nationella CSIRT-enheten"]),
        L(["Open cooperation with the affected customer", "Öppet samarbete med den drabbade kunden"])
      ],
      commonGaps: [
        L(["Waiting for the vendor's analysis", "Att vänta på leverantörens analys"]),
        L(["Rolling back to a version from the same compromised pipeline", "Att gå tillbaka till en version från samma komprometterade byggmiljö"]),
        L(["Forgetting shared accounts with customers", "Att glömma delade konton med kunder"])
      ],
      suggestedActions: [
        act(["Restrict the network access of management agents to what they need.", "Begränsa förvaltningsagenters nätverksåtkomst till det de behöver."], "networkLead", "high"),
        act(["Remove shared accounts with customers and limit site-to-site trust.", "Ta bort delade konton med kunder och begränsa förtroendet i förbindelser mellan platser."], "itOps", "high"),
        act(["Add security, audit and exit clauses to critical supplier contracts.", "Lägg till säkerhets-, gransknings- och avvecklingsklausuler i avtal med kritiska leverantörer."], "supplierManager", "high"),
        act(["Stage vendor updates to a small group before estate-wide rollout.", "Rulla ut leverantörsuppdateringar till en liten grupp innan hela miljön uppdateras."], "itOps", "medium"),
        act(["Keep an inventory of suppliers with privileged access.", "För en förteckning över leverantörer med privilegierad åtkomst."], "ciso", "medium")
      ]
    }
  });
})();
