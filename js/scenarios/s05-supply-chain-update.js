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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Weigh a vendor's assurances against your own evidence", "Väga en leverantörs försäkringar mot era egna spår"]), teaser: L(["Trusting others, checking yourself", "Att lita på andra och kontrollera själv"]) },
      { id: "lo2", text: L(["Contain compromised trusted software across the estate", "Begränsa komprometterad betrodd programvara i hela miljön"]), teaser: L(["When the familiar becomes uncertain", "När det välbekanta blir osäkert"]) },
      { id: "lo3", text: L(["Manage obligations to customers you may have exposed", "Hantera skyldigheter mot kunder som ni kan ha exponerat"]), teaser: L(["Duties to those who depend on you", "Ansvaret mot dem som är beroende av er"]) },
      { id: "lo4", text: L(["Decide under dependency on a single critical supplier", "Fatta beslut när ni är beroende av en enda kritisk leverantör"]), teaser: L(["Depending on one partner", "Att vara beroende av en enda partner"]) }
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
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. Over the weekend {{supplier.vendor}} pushed version 7.4.2 of its IT-management agent, as it does every month. The agent runs on almost every computer you own and is trusted completely.\n\nThis morning the {{env.edr}} console is filling with alerts that all point at the agent's process. The update is properly signed by the vendor. Blocking it would also switch off patching and remote support everywhere.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Under helgen skickade {{supplier.vendor}} ut version 7.4.2 av sin agent för IT-förvaltning, som de gör varje månad. Agenten körs på nästan varje dator ni har och är helt betrodd.\n\nI morse fylls {{env.edr}}-konsolen av larm som alla pekar på agentens process. Uppdateringen är korrekt signerad av leverantören. Att blockera den skulle också stänga av patchning och fjärrsupport överallt."
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
          evaluation: [["Contains based on own evidence without waiting for the vendor", "Begränsar utifrån egna spår utan att vänta på leverantören"]],
          pushback: {
            A: [
              pb(["More hosts alert", "Fler datorer larmar"], ["Since the isolation, new hosts keep appearing in the alert list, and each one you isolate is someone who cannot work. Your rule was “hosts that alerted”. Do you keep isolating one by one, chasing the alerts, or widen the containment before you know how far this goes?", "Sedan isoleringen dyker nya datorer hela tiden upp i larmlistan, och varje dator ni isolerar är någon som inte kan arbeta. Er regel var ”datorer som larmat”. Fortsätter ni isolera en i taget och jaga larmen, eller vidgar ni begränsningen innan ni vet hur långt det sträcker sig?"]),
              pb(["A team that cannot work", "Ett team som inte kan arbeta"], ["Several isolated laptops belong to a customer-facing team, and their manager calls: is this a drill? Nobody can serve customers this morning. Do you release some machines on business grounds, knowing they alerted?", "Flera av de isolerade datorerna tillhör ett kundnära team, och deras chef ringer: är det här en övning? Ingen kan ta hand om kunderna i förmiddag. Släpper ni några datorer av verksamhetsskäl, trots att de har larmat?"]),
              pb(["Blind to what it does", "Blinda för vad den gör"], ["The SOC lead points out that the block and the isolation also stopped you seeing what the agent was trying to do. Analysts want one alerting host reconnected under observation. Do you let a suspect machine talk to the attacker again to learn more?", "SOC-chefen påpekar att blockeringen och isoleringen också hindrar er från att se vad agenten försökte göra. Analytikerna vill koppla upp en larmande dator igen under bevakning. Låter ni en misstänkt dator prata med angriparen igen för att lära er mer?"])
            ],
            B: [
              pb(["Patching stops tonight", "Patchningen stannar i natt"], ["The help desk queue has doubled within an hour: nobody can be helped remotely, and tonight's scheduled security patches will not install anywhere. Do you accept a weaker estate to stop a threat you have not yet confirmed?", "Kön i servicedesken har fördubblats på en timme: ingen kan få hjälp på distans, och nattens planerade säkerhetspatchar installeras ingenstans. Accepterar ni en svagare miljö för att stoppa ett hot som ni ännu inte har bekräftat?"]),
              pb(["Machines you did not reach", "Datorer ni inte nådde"], ["IT operations reports that the stop command did not reach laptops that are off the network, at home or travelling. Those machines still run the agent and will until someone touches them. How do you find and deal with the ones you missed?", "IT-driften rapporterar att stoppkommandot inte nådde bärbara datorer som är utanför nätverket, hemma eller på resa. De datorerna kör fortfarande agenten och gör det tills någon tar hand om dem. Hur hittar och hanterar ni dem ni missade?"]),
              pb(["The vendor notices", "Leverantören märker det"], ["The vendor's account manager calls: their console shows your agents dropping offline across the estate, and they warn that tampering with the agent may void support under the contract. Do you explain your suspicion to them, or keep them in the dark?", "Leverantörens kundansvarige ringer: deras konsol visar att era agenter går offline i hela miljön, och de varnar för att ingrepp i agenten kan upphäva supporten enligt avtalet. Förklarar ni er misstanke för dem, eller håller ni dem ovetande?"])
            ],
            C: [
              pb(["Four business hours", "Fyra arbetstimmar"], ["The vendor's portal replies automatically: priority cases are answered within four business hours. Meanwhile the alert count keeps rising. How long are you prepared to let a suspicious agent keep talking out while you wait?", "Leverantörens portal svarar automatiskt: prioriterade ärenden besvaras inom fyra arbetstimmar. Under tiden fortsätter antalet larm att öka. Hur länge är ni beredda att låta en misstänkt agent fortsätta anropa ut medan ni väntar?"]),
              pb(["Minute the decision", "Protokollför beslutet"], ["Your SOC lead says in front of everyone that waiting means watching an attack in progress, and asks for the decision and the name behind it to be minuted. Who in this room owns the wait if it goes wrong?", "Er SOC-chef säger inför alla att väntan innebär att se på medan ett angrepp pågår, och ber att beslutet och namnet bakom det ska protokollföras. Vem i rummet äger väntan om det går fel?"]),
              pb(["They see a different picture", "De ser en annan bild"], ["The vendor's support only sees its own telemetry, not your {{env.edr}} alerts. Unless you send them your evidence, they will analyse a different picture, and sharing your logs with a third party needs approval. Do you hand over your evidence, and what do you do while they look?", "Leverantörens support ser bara sin egen telemetri, inte era larm i {{env.edr}}. Om ni inte skickar era spår analyserar de en annan bild, och att dela loggar med en tredje part kräver godkännande. Lämnar ni över era spår, och vad gör ni medan de tittar?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because the agent was stopped on every machine, overnight patching and the help desk's remote support stopped with it.", sv: "Eftersom agenten stoppades på varje dator upphörde även nattens uppdateringar och servicedeskens fjärrsupport." } }
        ],
        assumptionChallenged: L(["A handful of hosts are affected.", "Ett fåtal datorer är drabbade."]),
        narrative: L([
          "{{time.T+120|clock}}. The SOC has spent two hours checking every machine that took the weekend's update, comparing files with the previous version.\n\nThe vendor's support team has also replied to your ticket, quickly and confidently. Their answer and your own findings do not agree, and the room has to decide whom to believe.",
          "Klockan {{time.T+120|clock}}. SOC har ägnat två timmar åt att kontrollera varje dator som tog emot helgens uppdatering och jämfört filerna med föregående version.\n\nLeverantörens support har också svarat på ert ärende, snabbt och självsäkert. Deras svar och era egna fynd stämmer inte överens, och rummet måste avgöra vem det ska tro på."
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
          evaluation: [["Trusts own evidence over reassurance", "Litar mer på egna spår än på lugnande besked"], ["Shares with the national CSIRT early", "Delar information med den nationella CSIRT-enheten tidigt"]],
          pushback: {
            A: [
              pb(["A week of this?", "En vecka av det här?"], ["Within the hour, remote sites report they cannot install software and the help desk queue is growing. You are blocking a tool your own vendor calls safe, with no end date. How long can you keep this up on your own evidence alone?", "Inom en timme rapporterar fjärrkontoren att de inte kan installera programvara, och kön i servicedesken växer. Ni blockerar ett verktyg som er egen leverantör kallar säkert, utan slutdatum. Hur länge kan ni hålla fast vid det enbart på era egna spår?"]),
              pb(["“Please do not remove”", "”Ta inte bort agenten”"], ["The supplier manager reminds you that the vendor wrote “please do not remove the agent”, and fears support will lapse and a long partnership will sour. Do you risk the relationship on your SOC's reading of the evidence?", "Leverantörsansvarig påminner om att leverantören skrev ”ta inte bort agenten” och befarar att supporten upphör och att ett långt samarbete surnar. Riskerar ni relationen på er SOC:s tolkning av spåren?"]),
              pb(["Are you the only one?", "Är ni ensamma?"], ["{{reg.csirt|cap}} acknowledges your report and asks whether others are seeing the same. You do not know, and the vendor says they are not. If the vendor is right, you have flagged a trusted supplier to the whole sector. Does being alone make you wrong, or first?", "{{reg.csirt|cap}} bekräftar er rapport och frågar om andra ser samma sak. Ni vet inte, och leverantören säger att ingen gör det. Om leverantören har rätt har ni pekat ut en betrodd leverantör för hela sektorn. Gör det att ni är ensamma att ni har fel, eller bara att ni är först?"])
            ],
            B: [
              pb(["The count keeps rising", "Antalet fortsätter öka"], ["The vendor's security team has acknowledged your escalation but gives no time for an answer. Meanwhile more 7.4.2 hosts have started beaconing, and every one of them carries the component. How many more do you watch start before you act?", "Leverantörens säkerhetsteam har bekräftat er eskalering men anger ingen tid för svar. Under tiden har fler datorer med 7.4.2 börjat anropa ut, och varenda en bär på komponenten. Hur många fler ser ni börja innan ni agerar?"]),
              pb(["Your analysts feel overruled", "Analytikerna känner sig överkörda"], ["Your SOC found the component on every 7.4.2 host, and now their finding waits for the vendor's word. One analyst asks whether there is any point collecting more evidence if the vendor decides anyway. What do you tell the team whose findings you just put on hold?", "Er SOC hittade komponenten på varje dator med 7.4.2, och nu väntar deras fynd på leverantörens besked. En analytiker frågar om det är någon idé att samla fler spår om leverantören ändå avgör. Vad säger ni till teamet vars fynd ni just har parkerat?"]),
              pb(["Terms on your evidence", "Villkor för era spår"], ["The vendor's security team asks for samples of the component and your logs, under a confidentiality agreement that would stop you sharing them with anyone else, including {{reg.csirt}}. Do you accept terms that put the vendor in control of your evidence?", "Leverantörens säkerhetsteam ber om prov på komponenten och era loggar, under ett sekretessavtal som skulle hindra er från att dela dem med någon annan, även {{reg.csirt}}. Godtar ni villkor som ger leverantören kontroll över era spår?"])
            ],
            C: [
              pb(["No such feature", "Ingen sådan funktion"], ["Your SOC reads the release notes for 7.4.2 and finds no mention of a new telemetry feature. The vendor's explanation now rests on something you cannot find. Do you still tune the rule, or ask them to show you the feature first?", "Er SOC läser versionsinformationen för 7.4.2 och hittar inget om en ny telemetrifunktion. Leverantörens förklaring vilar nu på något ni inte kan hitta. Justerar ni ändå regeln, eller ber ni dem först visa funktionen?"]),
              pb(["Who signs the change?", "Vem skriver under ändringen?"], ["The SOC lead refuses to make the tuning change without a written instruction: “I will not be the one who switched off the alarm.” Who signs the change, by name, and are they ready to defend it if the vendor is wrong?", "SOC-chefen vägrar att göra justeringen utan en skriftlig instruktion: ”Jag tänker inte vara den som stängde av larmet.” Vem skriver under ändringen, med namn, och är den personen beredd att försvara den om leverantören har fel?"]),
              pb(["Silence everywhere", "Tystnad överallt"], ["Tuning the rule silences alerts on the agent's process across the whole estate, including the hosts still on 7.4.1 that will update soon. From now on nothing about this agent will alert anywhere. What would have to happen for you to notice if you were wrong?", "Att justera regeln tystar larmen för agentens process i hela miljön, även på de datorer som fortfarande har 7.4.1 och snart uppdateras. Från och med nu larmar ingenting om den här agenten någonstans. Vad skulle behöva hända för att ni ska märka om ni hade fel?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "The vendor's own build system was compromised: the signed update was the malware. If you accepted their “false positive”, you lost a day. If you acted on your own evidence, you were right, and their lawyers have written to you anyway.", sv: "Leverantörens eget byggsystem var komprometterat: den signerade uppdateringen var den skadliga koden. Om ni godtog deras ”falsklarm” förlorade ni ett dygn. Om ni agerade på egna belägg hade ni rätt, och deras jurister har skrivit till er ändå." } },
        assumptionChallenged: L(["Signed software from a trusted vendor is safe.", "Signerad programvara från en betrodd leverantör är säker."]),
        reveals: ["hf-build"],
        narrative: L([
          "{{time.T+360|clock}}. {{reg.csirt|cap}} publishes an advisory to its members, and calls you directly because yours was one of the first reports.\n\nThe advisory settles the argument with the vendor. It also turns a single company's alert into a national incident, and every customer of {{supplier.vendor}} is now asking the same questions you asked this morning.",
          "Klockan {{time.T+360|clock}}. {{reg.csirt|cap}} publicerar en varning till sina medlemmar och ringer er direkt, eftersom er rapport var en av de första.\n\nVarningen avgör tvisten med leverantören. Den gör också ett enskilt företags larm till en nationell incident, och varje kund till {{supplier.vendor}} ställer nu samma frågor som ni ställde i morse."
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
          evaluation: [["Does not assume older versions are clean", "Utgår inte från att äldre versioner är rena"]],
          pushback: {
            A: [
              pb(["Uninstalled by what?", "Avinstallerad med vad?"], ["The fastest way to remove the agent from {{num.hostsWithAgent}} machines is the agent itself. Doing it without it means visiting machines one by one for weeks. Do you use the compromised tool one last time, or accept weeks of exposure while you go by hand?", "Det snabbaste sättet att ta bort agenten från {{num.hostsWithAgent}} datorer är agenten själv. Utan den måste ni besöka datorerna en och en i veckor. Använder ni det komprometterade verktyget en sista gång, eller accepterar ni veckor av exponering medan ni gör det för hand?"]),
              pb(["The evidence goes with it", "Spåren försvinner med den"], ["The SOC warns that uninstalling removes the agent's files and local logs, the very evidence of what the loader did on each machine. The advisory said to await guidance. Do you keep some machines untouched as evidence, and which ones?", "SOC varnar för att avinstallationen tar bort agentens filer och lokala loggar, just de spår som visar vad laddaren gjorde på varje dator. Varningen sa att ni skulle invänta vägledning. Låter ni vissa datorer vara orörda som bevis, och i så fall vilka?"]),
              pb(["Service owners say no", "Systemägarna säger nej"], ["The owners of several production systems say their servers are patched and supported only through the agent. They will not accept removal until something else is in place. Do you override them and own what breaks?", "Ägarna till flera produktionssystem säger att deras servrar bara patchas och supportas via agenten. De godtar inte att den tas bort förrän något annat finns på plats. Kör ni över dem och tar ansvar för det som går sönder?"])
            ],
            B: [
              pb(["Laptops outside the firewall", "Datorer utanför brandväggen"], ["Your network blocks live in your own firewalls. Laptops on home networks and hotel Wi-Fi are outside them, and the agent on those machines can still reach the internet. How do you contain machines that are not on your network?", "Era nätverksblockeringar sitter i era egna brandväggar. Bärbara datorer på hemnätverk och hotellnät är utanför dem, och agenten på de datorerna når fortfarande internet. Hur begränsar ni datorer som inte är på ert nätverk?"]),
              pb(["No date for clean", "Inget datum för en ren version"], ["The vendor cannot say when a verified clean release will exist. Until then every machine is unmanaged yet still carries the malicious code. How long can you live in this halfway state, and who decides when it ends?", "Leverantören kan inte säga när en verifierat ren version finns. Fram till dess är varje dator oförvaltad men bär ändå på den skadliga koden. Hur länge kan ni leva i det här mellanläget, och vem avgör när det upphör?"]),
              pb(["“Is it still installed?”", "”Är den fortfarande installerad?”"], ["A large customer read the advisory and asks whether the malicious agent is still in your environment. The honest answer is yes, just disconnected. How do you explain that to a customer who expected to hear “removed”?", "En stor kund har läst varningen och frågar om den skadliga agenten fortfarande finns i er miljö. Det ärliga svaret är ja, bara bortkopplad. Hur förklarar ni det för en kund som väntade sig att höra ”borttagen”?"])
            ],
            C: [
              pb(["Same pipeline, older build", "Samma byggmiljö, äldre version"], ["The advisory says the vendor's build process was compromised but not since when. Version 7.4.1 came out of the same pipeline a month earlier. What makes a build trustworthy just because it is older?", "Varningen säger att leverantörens byggprocess var komprometterad, men inte sedan när. Version 7.4.1 kom ur samma byggmiljö en månad tidigare. Vad gör en version pålitlig bara för att den är äldre?"]),
              pb(["Reopening the channel", "Att öppna kanalen igen"], ["Rolling back uses the agent's own update mechanism, the channel the attacker used. To push 7.4.1 everywhere you must let the agent talk again. Do you reopen the compromised channel in order to roll back?", "En återgång använder agentens egen uppdateringsfunktion, den kanal som angriparen använde. För att skicka ut 7.4.1 överallt måste ni låta agenten kommunicera igen. Öppnar ni den komprometterade kanalen för att kunna gå tillbaka?"]),
              pb(["It wants to update itself", "Den vill uppdatera sig själv"], ["The vendor's support warns that rolled-back agents will try to upgrade themselves at the next check-in unless auto-update is switched off centrally, in a console you no longer trust. Who checks, machine by machine, that the rollback held?", "Leverantörens support varnar för att agenter som gått tillbaka försöker uppgradera sig själva vid nästa kontakt, om inte automatisk uppdatering stängs av centralt, i en konsol som ni inte längre litar på. Vem kontrollerar, dator för dator, att återgången höll?"])
            ]
          }
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
          "Tuesday, {{time.T+1440|clock}}. The security manager of one of your largest customers calls, and the tone is cold.\n\nTheir SOC has found intruder activity that arrived through the dedicated connection between their network and yours. They have already pulled the plug on the link. Your company is no longer only a victim of the supply-chain attack; to this customer, you are part of it.",
          "Tisdag, klockan {{time.T+1440|clock}}. Säkerhetschefen hos en av era största kunder ringer, och tonen är kall.\n\nDeras SOC har hittat aktivitet från en inkräktare som kom via den dedikerade förbindelsen mellan deras nätverk och ert. De har redan kopplat bort förbindelsen. Ert företag är inte längre bara ett offer för leverantörsattacken; för den här kunden är ni en del av den."
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
          evaluation: [["Shares what the customer needs to defend itself", "Delar det kunden behöver för att försvara sig"], ["Disables shared trust paths", "Spärrar delade förtroendevägar"]],
          pushback: {
            A: [
              pb(["Integrations go dark", "Integrationerna slocknar"], ["Disabling every shared account also stops the integrations the customer relies on, including data feeds between you that run every night. Their operations team calls asking why. Do you keep them all disabled, or let some back on before you know which are safe?", "Att spärra alla delade konton stoppar också de integrationer som kunden är beroende av, bland annat dataflöden mellan er som körs varje natt. Deras driftteam ringer och frågar varför. Håller ni alla spärrade, eller släpper ni på några innan ni vet vilka som är säkra?"]),
              pb(["What the logs also contain", "Vad loggarna också innehåller"], ["Your lawyer warns that full logs include details about other customers and your own staff, and cannot be shared unredacted. Cleaning them properly will take longer than four hours. Do you send everything now, or slow down to redact?", "Er jurist varnar för att de fullständiga loggarna innehåller uppgifter om andra kunder och er egen personal och inte kan delas utan maskering. Att rensa dem ordentligt tar längre tid än fyra timmar. Skickar ni allt nu, eller saktar ni ner för att maskera?"]),
              pb(["Whose incident lead?", "Vems incidentledare?"], ["The customer wants their own security manager as joint incident lead, with a say over your containment steps. Your incident commander would answer to someone outside the company. Do you give another organisation a vote in your response?", "Kunden vill ha sin egen säkerhetschef som gemensam incidentledare, med inflytande över era begränsningsåtgärder. Er incidentledare skulle få svara inför någon utanför företaget. Ger ni en annan organisation röst i er egen hantering?"])
            ],
            B: [
              pb(["“This is not a timeline”", "”Det här är ingen tidslinje”"], ["The customer's security manager replies to the legal summary within minutes: “We asked for logs. This is not a timeline.” They copy their CEO and yours. Do you hold the line your lawyer drew, or overrule your own lawyer?", "Kundens säkerhetschef svarar på juristens sammanfattning inom några minuter: ”Vi bad om loggar. Det här är ingen tidslinje.” De sätter sin och er vd på kopia. Håller ni fast vid juristens linje, eller kör ni över er egen jurist?"]),
              pb(["They cannot hunt without it", "De kan inte söka utan den"], ["The summary leaves out the account name and exact times. Without them the customer's SOC cannot search its own network for the intruder. If the attacker is still inside them, your caution is their exposure. What exactly are you protecting by holding it back?", "Sammanfattningen utelämnar kontonamnet och exakta tider. Utan dem kan kundens SOC inte söka efter inkräktaren i sitt eget nätverk. Om angriparen fortfarande är inne hos dem är er försiktighet deras exponering. Vad exakt skyddar ni genom att hålla inne med det?"]),
              pb(["Legal needs longer", "Juristen behöver längre tid"], ["Your lawyer says a reviewed summary cannot be ready within the four hours the customer set. Going through legal means missing their deadline. Do you send something unreviewed, or let the deadline pass?", "Er jurist säger att en granskad sammanfattning inte hinner bli klar inom de fyra timmar som kunden satte. Att gå via juristen innebär att ni missar deras tidsfrist. Skickar ni något ogranskat, eller låter ni fristen passera?"])
            ],
            C: [
              pb(["Every connection is hostile", "Varje förbindelse är fientlig"], ["The customer says that without your logs they must assume the worst, and will treat every connection from you as hostile, including the ones that deliver your service to them. Is your investigation worth losing that service?", "Kunden säger att de utan era loggar måste anta det värsta och kommer att behandla varje förbindelse från er som fientlig, även de som levererar er tjänst till dem. Är er utredning värd att förlora den tjänsten?"]),
              pb(["Days, not hours", "Dagar, inte timmar"], ["Your investigators say a full picture will take days. The customer asked for four hours. What will you say when the deadline passes and you have shared nothing at all?", "Era utredare säger att en fullständig bild tar dagar. Kunden bad om fyra timmar. Vad säger ni när fristen har gått ut och ni inte har delat någonting alls?"]),
              pb(["Your staff want to talk", "Er personal vill prata"], ["Your account manager for this customer begs to be allowed to say something; the people on the other side are contacts of many years and keep calling. Do you forbid your own staff from talking to the customer, and for how long?", "Er kundansvarige för den här kunden ber att få säga något; personerna på andra sidan är kontakter sedan många år och ringer hela tiden. Förbjuder ni er egen personal att prata med kunden, och i så fall hur länge?"])
            ]
          }
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
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the agent was uninstalled everywhere, you have no inventory of what runs where, and the auditors want one tomorrow.", sv: "Eftersom agenten avinstallerades överallt har ni ingen förteckning över vad som körs var, och revisorerna vill ha en i morgon." } }
        ],
        assumptionChallenged: L(["We can do without the agent for a while.", "Vi klarar oss utan agenten ett tag."]),
        narrative: L([
          "{{time.T+1560|clock}}. The agent has been blocked on every machine, which stopped the malware but also stopped everything the agent did.\n\nThe service desk is overwhelmed with requests nobody can solve remotely, field staff cannot get laptops fixed, and a critical browser update is due this week. Security and operations are pulling in opposite directions.",
          "Klockan {{time.T+1560|clock}}. Agenten har blockerats på varje dator, vilket stoppade skadekoden men också allt som agenten gjorde.\n\nServicedesken är överbelastad av ärenden som ingen kan lösa på distans, fältpersonalen kan inte få sina datorer lagade och en kritisk webbläsaruppdatering måste ut den här veckan. Säkerhet och drift drar åt olika håll."
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
          evaluation: [["Does not reopen the compromised channel", "Öppnar inte den komprometterade kanalen igen"]],
          pushback: {
            A: [
              pb(["Days to build", "Dagar att bygga"], ["IT operations says a separately built channel needs new servers, firewall rules and testing: several days, most of the patching window. Do you accept the delay, or cut corners on a tool that will have admin rights everywhere?", "IT-driften säger att en separat byggd kanal kräver nya servrar, brandväggsregler och tester: flera dagar, större delen av tiden för patchningen. Accepterar ni fördröjningen, eller tar ni genvägar med ett verktyg som får administratörsrättigheter överallt?"]),
              pb(["Deploy it with what?", "Installera den med vad?"], ["To put the new channel's client on thousands of machines you need a way to reach them, and the only one you had is the blocked agent. How do you deploy a management tool without a management tool?", "För att få ut den nya kanalens klient på tusentals datorer behöver ni ett sätt att nå dem, och det enda ni hade är den blockerade agenten. Hur installerar ni ett förvaltningsverktyg utan ett förvaltningsverktyg?"]),
              pb(["A new target", "Ett nytt mål"], ["The SOC warns that a new channel with admin rights on every machine, built in a hurry by tired people, is exactly what an attacker would look for next. Who reviews its security, and who signs off before it goes live?", "SOC varnar för att en ny kanal med administratörsrättigheter på varje dator, byggd i all hast av trötta människor, är precis vad en angripare letar efter härnäst. Vem granskar dess säkerhet, och vem godkänner den innan den tas i bruk?"])
            ],
            B: [
              pb(["Laptops in the field", "Datorer ute i fält"], ["Two days in, manual patching has reached only part of the estate. Field staff's laptops are rarely in the office. When the patch deadline passes, which machines are you knowingly leaving exposed?", "Efter två dagar har den manuella patchningen bara nått en del av miljön. Fältpersonalens datorer är sällan på kontoret. När tidsfristen för patchen går ut, vilka datorer lämnar ni medvetet exponerade?"]),
              pb(["No one answers the phone", "Ingen svarar i telefon"], ["The service desk lead says their team is already overwhelmed, and manual patching means stopping all other support. Who tells the business that nobody will answer their calls this week?", "Chefen för servicedesken säger att teamet redan är överbelastat, och manuell patchning innebär att all annan support stoppas. Vem säger till verksamheten att ingen kommer att svara när de ringer den här veckan?"]),
              pb(["Prioritised from what list?", "Prioriterade utifrån vilken lista?"], ["Your priority list is built from an inventory the agent produced, and it is out of date: nobody knows exactly which machines exist. How do you prioritise machines you cannot see?", "Er prioriteringslista bygger på en inventering som agenten tog fram, och den är inaktuell: ingen vet exakt vilka datorer som finns. Hur prioriterar ni datorer som ni inte kan se?"])
            ],
            C: [
              pb(["Briefly is long enough", "Kort är länge nog"], ["The agent needs only seconds to call out once its network is open. A “brief” window is plenty of time for the attacker. How many minutes of reopened channel are you willing to accept, and how would you know what happened in them?", "Agenten behöver bara några sekunder för att anropa ut när nätverket väl är öppet. Ett ”kort” fönster är gott om tid för angriparen. Hur många minuter med en öppnad kanal är ni beredda att acceptera, och hur skulle ni veta vad som hände under dem?"]),
              pb(["The customer says no", "Kunden säger nej"], ["The customer whose network was reached through yours hears that you plan to switch the agent back on. They say any reconnection of it ends the talks about restoring the link. Do you go ahead anyway?", "Kunden vars nätverk nåddes via ert hör att ni planerar att slå på agenten igen. De säger att varje återanslutning av den avslutar samtalen om att återställa förbindelsen. Genomför ni det ändå?"]),
              pb(["Is it your patch?", "Är det er patch?"], ["If the agent is compromised, so is anything it installs. How will you prove afterwards that what it pushed to every machine was the browser patch you sent, and nothing else?", "Om agenten är komprometterad är allt den installerar det också. Hur ska ni i efterhand bevisa att det den skickade ut till varje dator var webbläsarpatchen ni skickade, och ingenting annat?"])
            ]
          }
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
        reconsider: { decision: "d4", pressure: { en: "The customer and the regulator now set the terms. What you shared with the customer in the first hours is what they will judge you on.", sv: "Kunden och tillsynsmyndigheten bestämmer nu villkoren. Det ni delade med kunden under de första timmarna är vad de kommer att bedöma er efter." } },
        assumptionChallenged: L(["We decide how fast we recover and reconnect.", "Vi bestämmer hur snabbt vi återställer och kopplar upp igen."]),
        narrative: L([
          "Wednesday. Two letters arrive within an hour of each other: one from the affected customer's lawyers, and one from {{reg.supervisor}}.\n\nBoth ask for things you have not prepared: independent evidence, formal reports and explanations of how you choose and monitor your suppliers. The incident is now being judged by people outside the company.",
          "Onsdag. Två brev kommer inom en timme från varandra: ett från den drabbade kundens jurister och ett från {{reg.supervisor}}.\n\nBåda begär saker ni inte har förberett: oberoende bevis, formella rapporter och förklaringar av hur ni väljer och följer upp era leverantörer. Incidenten bedöms nu av människor utanför företaget."
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
          evaluation: [["Accepts external scrutiny constructively", "Tar emot extern granskning konstruktivt"]],
          pushback: {
            A: [
              pb(["Who does the work?", "Vem gör jobbet?"], ["Assessors need admin access and your best people for weeks, the same people running the clean-up and manual support. Which of that work stops while the assessment runs?", "Granskarna behöver administratörsåtkomst och era bästa medarbetare i veckor, samma personer som sköter saneringen och den manuella supporten. Vilket av det arbetet stannar medan granskningen pågår?"]),
              pb(["Controls on paper", "Kontroller på papper"], ["Reporting candidly on supplier risk means describing controls you never documented and may not have had. Legal reminds you the report could become public. Are you ready to write that down for {{reg.supervisor}}?", "Att rapportera öppet om leverantörsrisker innebär att beskriva kontroller som ni aldrig dokumenterade och kanske inte hade. Juristen påminner om att rapporten kan bli offentlig. Är ni beredda att skriva ner det till {{reg.supervisor}}?"]),
              pb(["Their assessor, your bill", "Deras granskare, er räkning"], ["The customer's lawyers reject your chosen assessor as not independent enough and want to pick one themselves, at your cost. Do you let the party threatening to end the agreement choose who examines you?", "Kundens advokater avvisar er valda granskare som inte tillräckligt oberoende och vill välja en själva, på er bekostnad. Låter ni den part som hotar att säga upp avtalet välja vem som granskar er?"])
            ],
            B: [
              pb(["“We said independent”", "”Vi skrev oberoende”"], ["The customer's lawyers reply within the hour: their letter said independent, and an internal review is not what they asked for. It reads as stalling. Is the time you hoped to save worth the goodwill it costs?", "Kundens advokater svarar inom en timme: deras brev sa oberoende, och en intern granskning är inte vad de bad om. Det uppfattas som förhalning. Är tiden ni hoppades vinna värd den goodwill det kostar?"]),
              pb(["Marking your own homework", "Att rätta sitt eget prov"], ["Your internal assessment would be written by the team that runs the network the attacker passed through. Would you accept their “clean” verdict if you were the customer?", "Er interna bedömning skulle skrivas av det team som driver nätverket som angriparen tog sig igenom. Skulle ni godta deras besked om att allt är rent om ni var kunden?"]),
              pb(["Two deadlines, one team", "Två frister, ett team"], ["The regulator's request is unchanged by what you offer the customer. The internal assessment needs the same people who must write the incident report. Which deadline slips?", "Tillsynsmyndighetens begäran påverkas inte av vad ni erbjuder kunden. Den interna bedömningen kräver samma personer som ska skriva incidentrapporten. Vilken frist får glida?"])
            ],
            C: [
              pb(["The CISO's name on it", "CISO:ns namn på den"], ["The CISO objects: legal will write a report about technical supplier controls they do not understand, and the CISO will be the one questioned on it. Who answers the regulator's follow-up questions in the room?", "CISO:n invänder: juristen kommer att skriva en rapport om tekniska leverantörskontroller som hen inte förstår, och det är CISO:n som får svara på frågorna. Vem svarar på tillsynsmyndighetens följdfrågor när det väl gäller?"]),
              pb(["Cooperation goes cold", "Samarbetet kallnar"], ["The customer's security team, who had been talking directly with yours, are now told to go through lawyers. They say the working relationship is over. Was limiting what you share worth losing that?", "Kundens säkerhetsteam, som har pratat direkt med ert, hänvisas nu till juristerna. De säger att samarbetet är över. Var det värt att förlora det för att begränsa vad ni delar?"]),
              pb(["An inspection instead", "En inspektion i stället"], ["{{reg.supervisor|cap}} replies that a minimal answer will be followed by an on-site inspection. Limiting what you share may mean they come to look for themselves. Do you still keep it narrow?", "{{reg.supervisor|cap}} svarar att ett minimalt svar kommer att följas av en inspektion på plats. Att begränsa vad ni delar kan innebära att de kommer och tittar själva. Håller ni ändå svaret snävt?"])
            ]
          }
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
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because you shared full logs with the customer, their lawyers have used them to put a figure on their claim against you.", sv: "Eftersom ni delade fullständiga loggar med kunden har deras jurister använt dem för att sätta en summa på sitt krav mot er." } }
        ],
        assumptionChallenged: L(["Cutting off the agent removed the attacker.", "Att stänga av agenten tog bort angriparen."]),
        reveals: ["hf-second"],
        narrative: L([
          "Thursday. The external forensic team has finished its first full sweep of the network, beyond the machines that ran the agent.\n\nMost of the estate is clean. On a smaller group of machines, they found something the agent left behind, and it does not need the agent to keep working.",
          "Torsdag. Det externa forensikteamet har gjort sin första fullständiga genomsökning av nätverket, även utanför de datorer som körde agenten.\n\nDet mesta av miljön är rent. På en mindre grupp datorer hittade de något som agenten lämnade efter sig, och det behöver inte agenten för att fortsätta fungera."
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
          evaluation: [["Resets credentials from a known-clean workstation", "Byter inloggningsuppgifter från en arbetsstation som är känd som ren"]],
          pushback: {
            A: [
              pb(["Where the images lived", "Var avbilderna fanns"], ["Your clean images are stored on a management server, one of the machines where the stealer was found. How clean is an image that sat on a compromised server, and what do you rebuild from instead?", "Era rena avbilder ligger på en förvaltningsserver, en av de datorer där programmet som stjäl uppgifter hittades. Hur ren är en avbild som har legat på en komprometterad server, och vad bygger ni om från i stället?"]),
              pb(["Everything at once?", "Allt på en gång?"], ["Resetting every privileged credential also breaks service accounts across the estate, and nightly jobs will fail. Do you reset everything at once and accept outages, or in waves and leave stolen credentials valid for longer?", "Att byta alla privilegierade inloggningsuppgifter slår också ut tjänstekonton i hela miljön, och nattliga jobb kommer att fallera. Byter ni allt på en gång och accepterar avbrott, eller i omgångar och låter stulna uppgifter gälla längre?"]),
              pb(["Image first", "Säkra först"], ["Legal and the independent assessor insist every affected machine is imaged for evidence before it is rebuilt, which adds days. The attacker's credentials stay useful while you wait. Do you rebuild now, or preserve first?", "Juristen och den oberoende granskaren kräver att varje drabbad dator kopieras som bevis innan den byggs om, vilket lägger till flera dagar. Angriparens uppgifter förblir användbara medan ni väntar. Bygger ni om nu, eller säkrar ni först?"])
            ],
            B: [
              pb(["The tool that missed it", "Verktyget som missade det"], ["Your EDR ran on these machines the whole time and did not find this program; the external forensic team did. Why trust the same tool to declare them clean?", "Er EDR körde på de här datorerna hela tiden och hittade inte programmet; det gjorde det externa forensikteamet. Varför lita på samma verktyg för att förklara dem rena?"]),
              pb(["Stolen but unused", "Stulna men oanvända"], ["“Seen in use” only covers what your logs show. Credentials that were captured but not yet used look exactly like credentials never stolen. Which ones are you knowingly leaving valid?", "”Setts användas” täcker bara det era loggar visar. Uppgifter som fångats men ännu inte använts ser exakt ut som uppgifter som aldrig stulits. Vilka låter ni medvetet fortsätta gälla?"]),
              pb(["“Cleaned” will not do", "”Rensade” räcker inte"], ["The customer's lawyers ask whether the affected machines were rebuilt. An answer of “cleaned with tools” will not get the link restored. Do you explain the difference, or redo the work?", "Kundens advokater frågar om de drabbade datorerna har byggts om. Ett svar om att de ”rensats med verktyg” får inte förbindelsen återställd. Förklarar ni skillnaden, eller gör ni om arbetet?"])
            ],
            C: [
              pb(["A week with the keys", "En vecka med nycklarna"], ["Every privileged credential captured stays valid for the week you watch, and the attacker can use them from anywhere, not only these machines. What are you hoping to learn that justifies leaving the keys in their hands?", "Varje privilegierad uppgift som fångats fortsätter gälla under veckan ni bevakar, och angriparen kan använda dem varifrån som helst, inte bara från de här datorerna. Vad hoppas ni lära er som motiverar att lämna nycklarna i deras händer?"]),
              pb(["The assessor cannot sign", "Granskaren kan inte skriva under"], ["The independent assessor says they cannot confirm your environment is clean while known compromised machines are left running on purpose. The customer link stays down at least another week. Who tells the customer?", "Den oberoende granskaren säger att de inte kan bekräfta att er miljö är ren så länge kända komprometterade datorer medvetet får fortsätta köra. Kundförbindelsen förblir nere minst en vecka till. Vem berättar det för kunden?"]),
              pb(["Admins refuse to log in", "Administratörerna vägrar logga in"], ["Administrators asked to keep working on machines they know are compromised refuse to type their privileged passwords into them. Do you order them to, or let the response stall for a week?", "Administratörer som ombeds fortsätta arbeta på datorer de vet är komprometterade vägrar att skriva in sina privilegierade lösenord där. Beordrar ni dem, eller låter ni hanteringen stå still en vecka?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "Versions back to 7.3.8 were tainted too. For an agent you cannot trust at any version, was your choice for the estate the right one?", sv: "Även versioner tillbaka till 7.3.8 var manipulerade. För en agent ni inte kan lita på i någon version, var ert val för hela miljön det rätta?" } },
        assumptionChallenged: L(["The vendor's clean release ends the problem.", "Leverantörens rena version löser problemet."]),
        reveals: ["hf-earlier"],
        narrative: L([
          "A week later. {{supplier.vendor}} publishes a rebuilt version 7.4.3 and a report on what happened in its build system.\n\nOperations wants the agent back as soon as possible: a week of manual work has exhausted the service desk. The report is long and apologetic. It also contains a paragraph that nobody in the room likes.",
          "En vecka senare. {{supplier.vendor}} publicerar en ombyggd version 7.4.3 och en rapport om vad som hände i deras byggmiljö.\n\nDriften vill ha tillbaka agenten så snart som möjligt: en vecka av manuellt arbete har utmattat servicedesken. Rapporten är lång och ursäktande. Den innehåller också ett stycke som ingen i rummet tycker om."
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
          evaluation: [["Makes renewed trust conditional on evidence", "Gör förnyat förtroende villkorat av bevis"]],
          pushback: {
            A: [
              pb(["Weeks or months?", "Veckor eller månader?"], ["The service desk has worked manually for a week, and nobody can say when independent verification will be done. Operations asks whether to plan for weeks or months. What do you tell them?", "Servicedesken har arbetat manuellt i en vecka, och ingen kan säga när en oberoende verifiering är klar. Driften frågar om de ska planera för veckor eller månader. Vad svarar ni?"]),
              pb(["The vendor pushes back", "Leverantören säger emot"], ["The vendor says it will not renegotiate the contract mid-term, and that verification will be offered to all customers on its own timetable. Your conditions may simply not be met. Do you wait, or soften them?", "Leverantören säger att den inte omförhandlar avtalet under löptiden och att verifiering erbjuds alla kunder enligt dess egen tidplan. Era villkor kanske helt enkelt inte uppfylls. Väntar ni, eller mjukar ni upp dem?"]),
              pb(["What counts as verified?", "Vad räknas som verifierat?"], ["The vendor proposes an assessment firm it has worked with before. Every release since 7.3.8 passed whatever checks existed. What would an independent verification actually have to show before you trust it?", "Leverantören föreslår ett granskningsföretag som den har anlitat tidigare. Varje version sedan 7.3.8 klarade de kontroller som fanns. Vad skulle en oberoende verifiering faktiskt behöva visa innan ni litar på den?"])
            ],
            B: [
              pb(["Months without an alert", "Månader utan larm"], ["The loader sat dormant in versions you ran for months without a single alert. What will close monitoring catch now that it did not catch then?", "Laddaren låg vilande i versioner som ni körde i månader utan ett enda larm. Vad kommer noggrann bevakning att fånga nu som den inte fångade då?"]),
              pb(["The customer is watching", "Kunden ser på"], ["The customer's security manager says that reinstalling the vendor's agent before independent verification ends the discussion about reconnecting. Is getting operations back worth losing the customer link?", "Kundens säkerhetschef säger att om ni installerar leverantörens agent igen före en oberoende verifiering är diskussionen om att koppla upp förbindelsen över. Är det värt att förlora kundförbindelsen för att få tillbaka driften?"]),
              pb(["Who does the watching?", "Vem bevakar?"], ["Close monitoring means analysts watching every agent connection around the clock, and your SOC is already stretched by the clean-up. Who does the watching, and for how long before you call it safe?", "Noggrann bevakning innebär att analytiker följer varje agentförbindelse dygnet runt, och er SOC är redan hårt belastad av saneringen. Vem bevakar, och hur länge innan ni kallar det säkert?"])
            ],
            C: [
              pb(["Replacing is not replaced", "Att byta är inte att ha bytt"], ["Starting a replacement does not give you a replacement. Until a new tool is chosen, bought and rolled out, the service desk stays manual. How long can operations really run like this?", "Att börja byta ger er inte en ersättare. Tills ett nytt verktyg är valt, köpt och utrullat förblir servicedesken manuell. Hur länge kan driften verkligen fungera så här?"]),
              pb(["The next vendor's pipeline", "Nästa leverantörs byggmiljö"], ["Every alternative on the table also pushes signed updates from its own build system, which nobody has examined. What makes the next vendor's pipeline more trustworthy than this one's rebuilt one?", "Varje alternativ på bordet skickar också ut signerade uppdateringar från sin egen byggmiljö, som ingen har granskat. Vad gör nästa leverantörs byggmiljö mer pålitlig än den här leverantörens ombyggda?"]),
              pb(["Security or optics?", "Säkerhet eller fasad?"], ["Service owners say a new tool means migrations, retraining and new risk in systems that worked for years. One asks openly whether this is about security or about being seen to act. How do you answer?", "Systemägarna säger att ett nytt verktyg innebär migreringar, ny utbildning och nya risker i system som har fungerat i åratal. En av dem frågar öppet om det här handlar om säkerhet eller om att synas agera. Vad svarar ni?"])
            ]
          }
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
          "Two weeks later. The board wants to understand how one supplier could put the whole organisation and a key customer at risk at the same time.\n\nThe obvious answer is to replace the supplier. Procurement has looked at the contract and the market, and the obvious answer is not as simple as it sounds.",
          "Två veckor senare. Styrelsen vill förstå hur en enda leverantör kunde sätta hela organisationen och en viktig kund i fara samtidigt.\n\nDet självklara svaret är att byta leverantör. Inköp har gått igenom avtalet och marknaden, och det självklara svaret är inte så enkelt som det låter."
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
          evaluation: [["Builds security and exit terms into critical contracts", "Bygger in säkerhets- och avvecklingsvillkor i kritiska avtal"]],
          pushback: {
            A: [
              pb(["A longer lock-in", "En längre inlåsning"], ["The vendor agrees to security clauses, but only in exchange for a longer contract term. Accepting makes your planned exit later and more expensive. Do you trade exit freedom for security terms?", "Leverantören går med på säkerhetsklausuler, men bara mot en längre avtalstid. Att godta det gör er planerade avveckling senare och dyrare. Byter ni bort friheten att lämna mot säkerhetsvillkor?"]),
              pb(["Who would use the audit right?", "Vem skulle använda granskningsrätten?"], ["The new clauses give you audit rights, but nobody in your organisation has ever audited a software build pipeline. Who would actually exercise them, and would they have caught this?", "De nya klausulerna ger er granskningsrätt, men ingen i er organisation har någonsin granskat en byggmiljö för programvara. Vem skulle faktiskt använda den, och skulle de ha upptäckt det här?"]),
              pb(["The customer will not accept it", "Kunden godtar det inte"], ["The affected customer says it will not accept this vendor's agent in a partner's estate, clauses or not. Staying for now may cost you the customer. Which relationship matters more?", "Den drabbade kunden säger att den inte godtar den här leverantörens agent i en partners miljö, klausuler eller inte. Att stanna tills vidare kan kosta er kunden. Vilken relation väger tyngst?"])
            ],
            B: [
              pb(["Two tools at once", "Två verktyg samtidigt"], ["Migration means running the old agent and the new tool side by side for months, two privileged channels instead of one. How do you manage that overlap without doubling your exposure?", "Migreringen innebär att den gamla agenten och det nya verktyget körs sida vid sida i månader, två privilegierade kanaler i stället för en. Hur hanterar ni den perioden utan att fördubbla er exponering?"]),
              pb(["Fleeing to the unknown", "Flykt mot det okända"], ["The alternative vendors have no breach history, but only because nobody has looked. A rushed tender leaves little time for checking. What due diligence will you do this time that you did not do last time?", "De alternativa leverantörerna har ingen historik av intrång, men bara för att ingen har tittat. En forcerad upphandling lämnar lite tid för kontroller. Vilken granskning gör ni den här gången som ni inte gjorde förra gången?"]),
              pb(["A supplier on notice", "En uppsagd leverantör"], ["The vendor learns of the tender and your support tickets suddenly move slower. You still depend on them for {{num.replaceMonths}} months. How do you manage a supplier you have told you are leaving?", "Leverantören får veta om upphandlingen, och era supportärenden går plötsligt långsammare. Ni är fortfarande beroende av dem i {{num.replaceMonths}} månader. Hur hanterar ni en leverantör som ni har sagt att ni lämnar?"])
            ],
            C: [
              pb(["“The vendor promised”", "”Leverantören lovade”"], ["The board asks what has changed to stop this happening again. The only answer is the vendor's promise. Is that an answer you would sign your name to?", "Styrelsen frågar vad som har ändrats för att det här inte ska hända igen. Det enda svaret är leverantörens löfte. Är det ett svar ni skulle skriva under med ert namn?"]),
              pb(["The same contract", "Samma avtal"], ["You told {{reg.supervisor}} how you manage supplier risk. Your answer now describes the same contract, with no security clauses and no audit right. How do you defend that at the next review?", "Ni har berättat för {{reg.supervisor}} hur ni hanterar leverantörsrisker. Ert svar beskriver nu samma avtal, utan säkerhetsklausuler och utan granskningsrätt. Hur försvarar ni det vid nästa granskning?"]),
              pb(["A plan you cannot check", "En plan ni inte kan kontrollera"], ["The vendor's improvement plan is a public statement with no dates and no way for you to verify it. What will you look at in six months to know whether they kept their word?", "Leverantörens förbättringsplan är ett offentligt uttalande utan datum och utan möjlighet för er att kontrollera den. Vad tittar ni på om sex månader för att veta om de har hållit sitt ord?"])
            ]
          }
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
