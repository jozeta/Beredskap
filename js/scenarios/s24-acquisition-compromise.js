/*
 * s24-acquisition-compromise.js — "The Company We Just Bought" (archetype D, acquisition).
 *
 * The day after the networks of a newly acquired software company are joined,
 * alerts fire on your file servers from the new side → the acquired company's
 * directory has been controlled by an attacker for months, and the new trust
 * opened the way → due diligence said "no known incidents" → the attacker
 * reached your finance mailboxes and copied the acquired product's
 * code-signing key → who decides inside a company that is yours on paper but
 * not yet in practice → a delayed integration and a dispute with the sellers.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s24-acquisition-compromise",
    version: 1,
    category: "acquisition",
    archetype: "third-party-origin",
    emblem: "merger",
    title: L(["The Company We Just Bought", "Företaget vi just köpte"]),
    summary: L([
      "The day after you connect the networks of the software company you just acquired, the alarms start. They came with the purchase.",
      "Dagen efter att ni kopplat ihop nätverken med mjukvaruföretaget ni just förvärvat börjar larmen. De följde med köpet."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain an incident that crosses a new trust boundary", "Begränsa en incident som korsar en ny förtroendegräns"]) },
      { id: "lo2", text: L(["Assess security in acquisitions before connecting", "Bedöma säkerheten vid förvärv innan ni kopplar ihop"]) },
      { id: "lo3", text: L(["Handle a code-signing compromise in a product you now own", "Hantera en komprometterad kodsigneringsnyckel i en produkt ni nu äger"]) },
      { id: "lo4", text: L(["Lead across two organisations in the middle of integration", "Leda över två organisationer mitt i en integration"]) }
    ],
    mitre: ["T1199", "T1484.002", "T1078", "T1003", "T1114", "T1552", "T1554"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RM", "GV.SC", "ID.AM", "PR.AA", "DE.CM", "RS.MA", "RS.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.21", "A.5.24", "A.5.26", "A.8.20", "A.8.24", "A.5.35"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal", "state"], motivation: L(["Long-term access for espionage and later resale", "Långsiktig åtkomst för spionage och senare vidareförsäljning"]), capability: "high" },
    variables: {
      monthsInside: { min: 4, max: 11 },
      dealValue: { min: 20, max: 600, scaleBy: "size", step: 5 },
      softwareCustomers: { min: 150, max: 6000, scaleBy: "size", step: 10 },
      mailboxes: { min: 3, max: 25 }
    },
    roles: ["incidentCommander", "ciso", "cio", "itOps", "socLead", "networkLead", "legal", "cfo", "ceo", "comms", "dpo", "devLead", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "An attacker had controlled the acquired company's directory for {{num.monthsInside}} months through a vulnerable remote-access gateway. When the two networks were joined and a directory trust created, the attacker used it to reach file servers and finance mailboxes at {{org.name}}. Months earlier they had also copied the acquired product's code-signing key from its build server.",
        "En angripare hade kontrollerat det förvärvade företagets katalogtjänst i {{num.monthsInside}} månader via en sårbar gateway för fjärråtkomst. När nätverken kopplades ihop och ett förtroende mellan katalogerna skapades använde angriparen det för att nå filservrar och ekonomibrevlådor hos {{org.name}}. Flera månader tidigare hade de också kopierat den förvärvade produktens kodsigneringsnyckel från dess byggserver."
      ]),
      attackerTimeline: [
        { at: -302400, text: L(["Remote-access gateway at the acquired company exploited.", "Gatewayen för fjärråtkomst hos det förvärvade företaget utnyttjas."]) },
        { at: -259200, text: L(["Domain administrator rights obtained in the acquired company.", "Domänadministratörsrättigheter erhålls i det förvärvade företaget."]) },
        { at: -216000, text: L(["Code-signing key copied from the build server.", "Kodsigneringsnyckeln kopieras från byggservern."]) },
        { at: -1440, text: L(["Network link and directory trust created during integration.", "Nätverkslänk och katalogförtroende skapas under integrationen."]) },
        { at: -600, text: L(["First logons into {{org.name}} across the new trust.", "De första inloggningarna hos {{org.name}} via det nya förtroendet."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-months", revealStage: "p2", text: L(["The acquired company's directory has been under an attacker's control for months, through its remote-access gateway.", "Det förvärvade företagets katalogtjänst har varit under en angripares kontroll i månader, via dess gateway för fjärråtkomst."]) },
      { id: "hf-diligence", revealStage: "p3", text: L(["The sellers' own IT team had flagged the gateway as compromised before the sale closed.", "Säljarnas eget IT-team hade flaggat gatewayen som komprometterad innan affären slutfördes."]) },
      { id: "hf-signing", revealStage: "p4", text: L(["The acquired product's code-signing key was copied from its build server long before the deal.", "Den förvärvade produktens kodsigneringsnyckel kopierades från byggservern långt före affären."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Connected", "Ihopkopplade"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Yesterday {{org.name}} connected its network to {{supplier.vendor}}, the software company it bought last month. This morning the security centre has alerts on your file servers, all from addresses on the new side.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. I går kopplade {{org.name}} ihop sitt nätverk med {{supplier.vendor}}, mjukvaruföretaget som köptes förra månaden. I morse har säkerhetscentralen larm på era filservrar, alla från adresser på den nya sidan."
        ]),
        injects: [
          inj("i1-1", 0, "edrAlert", "edr", "high", "confirmed", [
            "Credential-dumping tool blocked on {{asset.fileServer}}. Source: a server account belonging to the acquired company's domain, logged on across the new trust.",
            "Verktyg för att dumpa inloggningsuppgifter blockerat på {{asset.fileServer}}. Källa: ett serverkonto i det förvärvade företagets domän, inloggat via det nya förtroendet."
          ], { tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "itOps", "medium", "misleading", [
            "Integration team: “Their admins are migrating files today. Probably one of their scripts.”",
            "Integrationsgruppen: ”Deras administratörer flyttar filer i dag. Förmodligen ett av deras skript.”"
          ], { facilitatorNote: ["Plausible on integration day; migration scripts don't dump credentials.", "Rimligt en integrationsdag; migreringsskript dumpar inte inloggningsuppgifter."], tests: ["lo1"] }),
          inj("i1-3", 30, "ticket", "serviceDesk", "low", "confirmed", [
            "Two finance staff report odd sign-in prompts after the integration window.",
            "Två personer på ekonomi rapporterar konstiga inloggningsrutor efter integrationsfönstret."
          ], { optional: true, tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What exactly did yesterday's integration open between the networks?", "Vad exakt öppnade gårdagens integration mellan nätverken?", ["networkLead", "itOps"]),
            q("Can you cut the link without stopping the acquired company's business?", "Kan ni kapa länken utan att stoppa det förvärvade företagets verksamhet?", ["networkLead"]),
            q("Whose security team watches the other side?", "Vems säkerhetsgrupp bevakar den andra sidan?", ["socLead"])
          ],
          executive: [
            q("Who decides to cut the link: you, or the integration programme?", "Vem beslutar att kapa länken: ni, eller integrationsprogrammet?", ["cio", "incidentCommander"]),
            q("Who do you call at the acquired company, and do they know yet?", "Vem ringer ni på det förvärvade företaget, och vet de redan?", ["incidentCommander"]),
            q("What did the deal assume about their security?", "Vad förutsatte affären om deras säkerhet?", ["cfo", "legal"])
          ]
        },
        challenges: [ch("The integration has a public go-live date next week, announced to customers.", "Integrationen har ett offentligt startdatum nästa vecka, som meddelats kunderna.")],
        decision: dec("d1", "cio", ["What do you do with the connection?", "Vad gör ni med anslutningen?"], [
          ["Cut the link and the directory trust now, and investigate both sides.", "Kapa länken och katalogförtroendet nu, och utred båda sidorna."],
          ["Keep it, but block the accounts that triggered alerts.", "Behåll den, men spärra de konton som utlöste larm."],
          ["Ask the acquired company's IT to look at their scripts.", "Be det förvärvade företagets IT titta på sina skript."]
        ], {
          knowns: [["Credential theft was attempted from the new side.", "Försök till stöld av inloggningsuppgifter gjordes från den nya sidan."]],
          uncertainties: [["Whether the acquired company is compromised.", "Om det förvärvade företaget är komprometterat."]],
          tradeoffs: {
            operational: ["Cutting the link halts the integration.", "Att kapa länken stoppar integrationen."],
            security: ["The trust lets anything on their side reach yours.", "Förtroendet låter allt på deras sida nå er."],
            legal: ["Their systems may not be yours to investigate yet.", "Deras system kanske ännu inte är era att utreda."],
            reputational: ["A delayed go-live will be noticed.", "Ett försenat startdatum kommer att märkas."]
          },
          evaluation: [["Closes the trust before investigating", "Stänger förtroendet innan utredningen"]]
        }),
        facilitator: fac(
          ["The trust is the risk. Every hour it stays, their problem is yours.", "Förtroendet är risken. Varje timme det står kvar är deras problem ert."],
          ["Cut the link and trust, and start a joint investigation.", "Kapa länken och förtroendet, och starta en gemensam utredning."],
          [["Ask: what did you check before you connected?", "Fråga: vad kontrollerade ni innan ni kopplade ihop?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Theirs for months", "Deras i månader"]),
        twist: L(["The acquired company's network has been under someone else's control for about {{num.monthsInside}} months. The attacker held administrator rights over their whole directory and simply walked across the new trust.", "Det förvärvade företagets nätverk har varit under någon annans kontroll i ungefär {{num.monthsInside}} månader. Angriparen hade administratörsrättigheter över hela deras katalog och gick helt enkelt över det nya förtroendet."]),
        twistKind: "cause",
        assumptionChallenged: L(["A migration script misbehaved.", "Ett migreringsskript betedde sig fel."]),
        reveals: ["hf-months"],
        narrative: L([
          "{{time.T+120|clock}}. Your incident responders get access to the acquired company's logs.",
          "Klockan {{time.T+120|clock}}. Era incidenthanterare får tillgång till det förvärvade företagets loggar."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "Acquired company: a known vulnerability in its remote-access gateway was exploited about {{num.monthsInside}} months ago; persistent administrator accounts and scheduled tasks on every domain controller.",
            "Det förvärvade företaget: en känd sårbarhet i gatewayen för fjärråtkomst utnyttjades för ungefär {{num.monthsInside}} månader sedan; beständiga administratörskonton och schemalagda aktiviteter på alla domänkontrollanter."
          ], { reveals: ["hf-months"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can the acquired company's directory be trusted at all?", "Går det att lita på det förvärvade företagets katalog överhuvudtaget?", ["ciso", "itOps"]),
            q("Which of your systems did the trust expose overnight?", "Vilka av era system exponerades av förtroendet under natten?", ["socLead"]),
            q("Did cutting the link early make a difference?", "Gjorde det skillnad att kapa länken tidigt?", ["networkLead"], "d1")
          ],
          executive: [
            q("Who leads the response inside a company you own but don't yet run?", "Vem leder insatsen i ett företag ni äger men ännu inte driver?", ["ceo", "incidentCommander"]),
            q("Who must be told: the sellers, your board, the acquired company's customers?", "Vilka måste informeras: säljarna, er styrelse, det förvärvade företagets kunder?", ["legal", "cfo"]),
            q("Looking back at this morning, was the connection decision made by the right person?", "Om ni ser tillbaka på i morse, fattades beslutet om anslutningen av rätt person?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The acquired company's IT manager says the gateway was “on the list to replace”.", "Det förvärvade företagets IT-chef säger att gatewayen var ”på listan för att bytas ut”.")],
        decision: dec("d2", "ciso", ["How do you handle their directory?", "Hur hanterar ni deras katalog?"], [
          ["Treat it as lost: rebuild their identity platform, and reconnect only through a new, clean design.", "Behandla den som förlorad: bygg om deras identitetsplattform, och koppla ihop igen bara via en ny, ren lösning."],
          ["Clean it in place: remove the attacker's accounts and tasks.", "Sanera på plats: ta bort angriparens konton och aktiviteter."],
          ["Leave it to the acquired company's IT.", "Överlåt det till det förvärvade företagets IT."]
        ], {
          knowns: [["The attacker had full control for months.", "Angriparen har haft full kontroll i månader."]],
          uncertainties: [["Every way back in the attacker created.", "Varje väg tillbaka in som angriparen skapat."]],
          tradeoffs: {
            operational: ["A rebuild disrupts the acquired company for weeks.", "En ombyggnad stör det förvärvade företaget i veckor."],
            security: ["Cleaning in place after months of control rarely finds everything.", "Sanering på plats efter månader av kontroll hittar sällan allt."],
            legal: ["Costs may be recoverable from the sellers.", "Kostnaderna kan eventuellt krävas av säljarna."],
            reputational: ["Their staff are new and nervous.", "Deras personal är ny och orolig."]
          },
          evaluation: [["Rebuilds rather than trusting a directory controlled for months", "Bygger om i stället för att lita på en katalog som kontrollerats i månader"]]
        }),
        facilitator: fac(
          ["Months of domain control means the directory is the attacker's as much as theirs.", "Månader av kontroll över domänen betyder att katalogen är lika mycket angriparens som deras."],
          ["Rebuild the identity platform; reconnect through a new design.", "Bygg om identitetsplattformen; koppla ihop igen via en ny lösning."],
          [["Ask: how long would cleaning take, and how sure would you be?", "Fråga: hur lång tid skulle saneringen ta, och hur säkra skulle ni vara?"]]
        )
      },
      {
        id: "p3",
        clock: 480,
        priority: 1,
        title: L(["The due diligence", "Företagsgranskningen"]),
        twist: L(["An email in the acquired company's archive, sent before the deal closed, warns management that the remote-access gateway “looks compromised”. The due diligence questionnaire said “no known incidents”.", "Ett mejl i det förvärvade företagets arkiv, skickat innan affären slutfördes, varnar ledningen för att gatewayen för fjärråtkomst ”ser komprometterad ut”. Frågeformuläret i företagsgranskningen angav ”inga kända incidenter”."]),
        twistKind: "impact",
        assumptionChallenged: L(["The sellers told us everything they knew.", "Säljarna berättade allt de visste."]),
        reveals: ["hf-diligence"],
        narrative: L([
          "{{time.T+480|clock}}. {{person.legal.name}} reads the due diligence file next to the acquired company's email archive.",
          "Klockan {{time.T+480|clock}}. {{person.legal.name}} läser handlingarna från företagsgranskningen bredvid det förvärvade företagets e-postarkiv."
        ]),
        injects: [
          inj("i3-1", 480, "email", "employee", "high", "confirmed", [
            "Archived email, eight weeks before closing, from the acquired company's IT manager to its CEO: “The VPN gateway shows logins I can't explain. I think we have a problem.”",
            "Arkiverat mejl, åtta veckor före tillträdet, från det förvärvade företagets IT-chef till dess vd: ”VPN-gatewayen visar inloggningar jag inte kan förklara. Jag tror att vi har ett problem.”"
          ], { reveals: ["hf-diligence"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What security questions did your due diligence ask, and what evidence did it require?", "Vilka säkerhetsfrågor ställdes i er företagsgranskning, och vilka belägg krävdes?", ["ciso"]),
            q("Is the archive now evidence you need to preserve?", "Är arkivet nu bevis som ni måste bevara?", ["legal", "socLead"]),
            q("Does this change how far you rebuild?", "Ändrar det här hur långt ni bygger om?", ["itOps"], "d2")
          ],
          executive: [
            q("Do you raise a warranty claim against the sellers now?", "Ställer ni ett garantikrav mot säljarna nu?", ["cfo", "legal"]),
            q("How do you treat the acquired company's former leadership, who now work for you?", "Hur behandlar ni det förvärvade företagets tidigare ledning, som nu arbetar för er?", ["ceo"]),
            q("Would you rebuild or clean differently, knowing they knew?", "Skulle ni bygga om eller sanera annorlunda, när ni vet att de visste?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("The former CEO of the acquired company now sits in your management team.", "Det förvärvade företagets tidigare vd sitter nu i er ledningsgrupp.")],
        decision: dec("d3", "ceo", ["What do you do about the sellers?", "Vad gör ni med säljarna?"], [
          ["Preserve the evidence, notify the sellers of a warranty claim, and keep the incident response separate from the dispute.", "Säkra bevisen, underrätta säljarna om ett garantikrav, och håll incidenthanteringen åtskild från tvisten."],
          ["Confront the former CEO in the management meeting.", "Konfrontera den tidigare vd:n på ledningsmötet."],
          ["Let it go to protect the integration.", "Låt det vara för att skydda integrationen."]
        ], {
          knowns: [["The risk was known before closing and not disclosed.", "Risken var känd före tillträdet och redovisades inte."]],
          uncertainties: [["What the contract's warranties actually cover.", "Vad avtalets garantier faktiskt täcker."]],
          tradeoffs: {
            operational: ["A dispute can poison cooperation in the response.", "En tvist kan förgifta samarbetet i insatsen."],
            security: ["The people who knew may know more.", "De som visste kan veta mer."],
            legal: ["Claims have notice deadlines.", "Krav har tidsfrister för underrättelse."],
            reputational: ["The board will ask why diligence missed it.", "Styrelsen kommer att fråga varför granskningen missade det."]
          },
          evaluation: [["Protects the legal position without derailing the response", "Skyddar den rättsliga positionen utan att spåra ur insatsen"]]
        }),
        facilitator: fac(
          ["Keep the dispute and the response apart: you need the former team's knowledge.", "Håll isär tvisten och insatsen: ni behöver det tidigare teamets kunskap."],
          ["Evidence preserved, claim notified, response cooperation kept.", "Bevis säkrade, krav anmält, samarbetet i insatsen bevarat."],
          [["Ask: what would a security question with required evidence have looked like?", "Fråga: hur hade en säkerhetsfråga med krav på belägg sett ut?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 1440,
        title: L(["What came across", "Vad som kom över"]),
        twist: L(["Overnight the attacker read {{num.mailboxes}} of your finance and M&A mailboxes. And the acquired product's code-signing key was copied months ago: anything signed with it can no longer be trusted.", "Under natten läste angriparen {{num.mailboxes}} av era brevlådor inom ekonomi och förvärv. Och den förvärvade produktens kodsigneringsnyckel kopierades för flera månader sedan: inget som signerats med den går längre att lita på."]),
        twistKind: "scope",
        assumptionChallenged: L(["The damage is limited to the acquired company.", "Skadan är begränsad till det förvärvade företaget."]),
        reveals: ["hf-signing"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The investigation on both sides reports in.",
          "{{time.T+1440|weekday|cap}}. Utredningen på båda sidor rapporterar."
        ]),
        injects: [
          inj("i4-1", 1440, "logExcerpt", "siem", "critical", "confirmed", [
            "Mail access across the trust: {{num.mailboxes}} mailboxes in finance and corporate development read between 02:10 and 05:40.",
            "E-poståtkomst via förtroendet: {{num.mailboxes}} brevlådor inom ekonomi och affärsutveckling lästa mellan 02.10 och 05.40."
          ], { tests: ["lo1"] }),
          inj("i4-2", 1500, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "Build server, acquired company: the code-signing certificate's private key was exported to an external address months ago. {{num.softwareCustomers|number}} customers run software signed with it.",
            "Byggservern, det förvärvade företaget: kodsigneringscertifikatets privata nyckel exporterades till en extern adress för flera månader sedan. {{num.softwareCustomers|number}} kunder kör programvara som signerats med den."
          ], { reveals: ["hf-signing"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Reach of the compromise", "Intrångets räckvidd"]),
          data: kpi([
            { id: "months", label: ["Months inside the acquired company", "Månader inne i det förvärvade företaget"], value: (v) => v.monthsInside, tone: "warn" },
            { id: "mail", label: ["Your mailboxes read", "Era brevlådor lästa"], value: (v) => v.mailboxes, tone: "danger" },
            { id: "cust", label: ["Customers running signed software", "Kunder som kör signerad programvara"], value: (v) => v.softwareCustomers, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("How do you revoke the certificate without breaking every customer installation?", "Hur återkallar ni certifikatet utan att slå ut varje kundinstallation?", ["devLead"]),
            q("Was anything malicious ever signed with the stolen key?", "Har något skadligt någonsin signerats med den stulna nyckeln?", ["devLead", "socLead"]),
            q("Does the rebuild plan now need to include the build pipeline?", "Behöver ombyggnadsplanen nu omfatta byggkedjan?", ["ciso"], "d2")
          ],
          executive: [
            q("The M&A mailboxes held deal plans. Who else is affected by that?", "Brevlådorna för förvärv innehöll affärsplaner. Vilka andra berörs av det?", ["cfo", "legal"]),
            q("What do you tell the acquired company's customers, and when?", "Vad säger ni till det förvärvade företagets kunder, och när?", ["comms", "ceo"]),
            q("Would you have kept the link open longer if you had known this?", "Hade ni hållit länken öppen längre om ni hade vetat det här?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Revoking the certificate stops customers' software updates until a new one is issued.", "Att återkalla certifikatet stoppar kundernas programuppdateringar tills ett nytt har utfärdats.")],
        decision: dec("d4", "ciso", ["How do you deal with the signing key?", "Hur hanterar ni signeringsnyckeln?"], [
          ["Revoke it, issue a new key from a clean build environment, and tell customers how to verify their installations.", "Återkalla den, utfärda en ny nyckel från en ren byggmiljö och berätta för kunderna hur de kontrollerar sina installationer."],
          ["Issue a new key quietly and stop using the old one.", "Utfärda en ny nyckel i tysthet och sluta använda den gamla."],
          ["Wait until something signed with it turns up.", "Vänta tills något som signerats med den dyker upp."]
        ], {
          knowns: [["The private key left the build server months ago.", "Den privata nyckeln lämnade byggservern för flera månader sedan."]],
          uncertainties: [["Whether anything malicious has been signed.", "Om något skadligt har signerats."]],
          tradeoffs: {
            operational: ["Revocation breaks updates until customers move to the new key.", "Återkallelsen bryter uppdateringar tills kunderna gått över till den nya nyckeln."],
            security: ["Without revocation, malware can be signed as your product.", "Utan återkallelse kan skadlig kod signeras som er produkt."],
            legal: ["Customers may have contractual rights to be told.", "Kunderna kan ha avtalsenlig rätt att bli informerade."],
            reputational: ["A quiet change is found by the first researcher who looks.", "En tyst ändring upptäcks av den första forskare som tittar."]
          },
          evaluation: [["Revokes and informs customers instead of rotating quietly", "Återkallar och informerar kunderna i stället för att byta i tysthet"]]
        }),
        facilitator: fac(
          ["The signing key turns an internal incident into your customers' supply-chain risk.", "Signeringsnyckeln gör en intern incident till en risk i era kunders leveranskedja."],
          ["Revocation, a clean new key and clear customer guidance.", "Återkallelse, en ny ren nyckel och tydlig vägledning till kunderna."],
          [["Ask: who could sign malware as your product today?", "Fråga: vem skulle kunna signera skadlig kod som er produkt i dag?"]]
        )
      },
      {
        id: "p5",
        clock: 2880,
        priority: 2,
        title: L(["Whose decision?", "Vems beslut?"]),
        twist: L(["The acquired company is still a separate legal entity with its own board. Its managing director refuses to rebuild during their busiest quarter and says the decision is theirs.", "Det förvärvade företaget är fortfarande en egen juridisk person med egen styrelse. Dess vd vägrar att bygga om under deras mest hektiska kvartal och säger att beslutet är deras."]),
        twistKind: "authority",
        assumptionChallenged: L(["We own the company, so we decide.", "Vi äger företaget, så vi bestämmer."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The integration steering committee meets with the acquired company's managing director.",
          "{{time.T+2880|weekday|cap}}. Integrationens styrgrupp möter det förvärvade företagets vd."
        ]),
        injects: [
          inj("i5-1", 2880, "executiveMessage", "management", "high", "disputed", [
            "Acquired company's managing director: “Our board decides how our systems are run until integration is complete. A rebuild now will cost us our three largest customers.”",
            "Det förvärvade företagets vd: ”Vår styrelse beslutar om hur våra system drivs tills integrationen är klar. En ombyggnad nu kostar oss våra tre största kunder.”"
          ], { facilitatorNote: ["Formally partly right; practically, the parent carries the risk.", "Formellt delvis rätt; i praktiken bär moderbolaget risken."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What is the minimum that must be rebuilt now to keep your side safe?", "Vad är det minsta som måste byggas om nu för att hålla er sida säker?", ["ciso", "itOps"]),
            q("Can the acquired company keep working while isolated from you?", "Kan det förvärvade företaget fortsätta arbeta medan det är isolerat från er?", ["networkLead"]),
            q("Is the new signing key in place and trusted by customers?", "Är den nya signeringsnyckeln på plats och betrodd av kunderna?", ["devLead"], "d4")
          ],
          executive: [
            q("How do you use ownership without breaking the people you bought?", "Hur använder ni ägarskapet utan att bryta ned de människor ni köpte?", ["ceo"]),
            q("Who in the group has the final word on security?", "Vem i koncernen har sista ordet om säkerhet?", ["ceo", "ciso"]),
            q("Would the customer message on the signing key look different if they decided?", "Skulle meddelandet till kunderna om signeringsnyckeln se annorlunda ut om de beslutade?", ["comms"], "d4")
          ]
        },
        challenges: [ch("The acquired company's staff worry the incident will be used to replace them.", "Det förvärvade företagets personal oroar sig för att incidenten ska användas för att ersätta dem.")],
        noDecision: L(["Resolve the authority question as a group: record who decides on security in subsidiaries, and how.", "Lös befogenhetsfrågan gemensamt: dokumentera vem som beslutar om säkerhet i dotterbolag, och hur."]),
        facilitator: fac(
          ["Ownership and authority are not the same thing during integration.", "Ägarskap och befogenhet är inte samma sak under en integration."],
          ["A group decision that isolates the acquired company until rebuilt, with support for its business.", "Ett koncernbeslut som isolerar det förvärvade företaget tills det är ombyggt, med stöd till dess verksamhet."],
          [["Ask: who would answer for this if the attacker came back across?", "Fråga: vem skulle stå till svars om angriparen kom tillbaka över?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Six months later", "Sex månader senare"]),
        twist: L(["The integration is six months late. The sellers dispute the warranty claim, and the board wants to know why security was not part of the deal.", "Integrationen är sex månader försenad. Säljarna bestrider garantikravet, och styrelsen vill veta varför säkerheten inte var en del av affären."]),
        twistKind: "impact",
        assumptionChallenged: L(["Security is an IT question after the deal.", "Säkerhet är en IT-fråga efter affären."]),
        narrative: L([
          "{{time.T+10080|weekday|cap}}. The board reviews a deal worth {{num.dealValue}} million.",
          "{{time.T+10080|weekday|cap}}. Styrelsen granskar en affär värd {{num.dealValue}} miljoner."
        ]),
        injects: [
          inj("i6-1", 10080, "executiveMessage", "management", "medium", "confirmed", [
            "Board chair: “Next time I want security findings in the investment memo, not in an incident report.”",
            "Styrelseordföranden: ”Nästa gång vill jag ha säkerhetsfynden i investeringsunderlaget, inte i en incidentrapport.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What would a security assessment before closing have needed to see?", "Vad skulle en säkerhetsbedömning före tillträdet ha behövt se?", ["ciso"]),
            q("What is the rule for connecting an acquired network from now on?", "Vad är regeln för att koppla in ett förvärvat nätverk framöver?", ["cio", "networkLead"]),
            q("Did the decision on the signing key hold up with customers?", "Höll beslutet om signeringsnyckeln inför kunderna?", ["devLead"], "d4")
          ],
          executive: [
            q("Who owns cyber risk in deals?", "Vem äger cyberrisken i affärer?", ["cfo", "ceo"]),
            q("What do you change in the acquisition process?", "Vad ändrar ni i förvärvsprocessen?", ["cfo", "legal"]),
            q("Looking back, was the decision on the sellers right?", "I efterhand, var beslutet om säljarna rätt?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("The next acquisition is already in negotiation.", "Nästa förvärv förhandlas redan.")],
        decision: dec("d5", "cfo", ["What changes in your acquisition process?", "Vad ändras i er förvärvsprocess?"], [
          ["Security assessment with evidence before signing, specific warranties, and no network connection until a compromise assessment is clean.", "En säkerhetsbedömning med belägg före undertecknandet, särskilda garantier och ingen nätverksanslutning förrän en intrångsbedömning är ren."],
          ["Add more security questions to the questionnaire.", "Lägg till fler säkerhetsfrågor i frågeformuläret."],
          ["Keep the process; this was bad luck.", "Behåll processen; det här var otur."]
        ], {
          knowns: [["A questionnaire answer hid a known compromise.", "Ett svar i frågeformuläret dolde ett känt intrång."]],
          uncertainties: [["How common this is in deals.", "Hur vanligt det här är i affärer."]],
          tradeoffs: {
            operational: ["Assessments add weeks to deals.", "Bedömningar lägger veckor till affärerna."],
            security: ["Connecting first and checking later imports the attacker.", "Att koppla ihop först och kontrollera sedan importerar angriparen."],
            legal: ["Specific warranties shift risk back to sellers.", "Särskilda garantier flyttar tillbaka risken till säljarna."],
            reputational: ["The board has asked twice.", "Styrelsen har frågat två gånger."]
          },
          evaluation: [["Requires evidence and a clean assessment before connecting", "Kräver belägg och en ren bedömning innan ihopkoppling"]]
        }),
        facilitator: fac(
          ["End on the process: questionnaires record claims, not facts.", "Avsluta med processen: frågeformulär dokumenterar påståenden, inte fakta."],
          ["Evidence-based assessment, warranties and a connect-only-when-clean rule.", "Bedömning baserad på belägg, garantier och en regel om att bara koppla ihop när det är rent."],
          [["Ask: what will you check before the next connection?", "Fråga: vad kommer ni att kontrollera före nästa ihopkoppling?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The trust is cut, the acquired company rebuilt and the signing key replaced, but deal plans were read and the integration slips by months.",
        "Förtroendet kapas, det förvärvade företaget byggs om och signeringsnyckeln byts ut, men affärsplaner lästes och integrationen försenas i flera månader."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Connecting an acquired network imports its attackers: assess before you connect.", "Att koppla in ett förvärvat nätverk importerar dess angripare: bedöm innan ni kopplar ihop."]),
        L(["A directory controlled for months is rebuilt, not cleaned.", "En katalog som kontrollerats i månader byggs om, den saneras inte."]),
        L(["A stolen code-signing key is your customers' problem too: revoke and tell them.", "En stulen kodsigneringsnyckel är också era kunders problem: återkalla och berätta för dem."]),
        L(["Settle who decides on security in subsidiaries before you need to.", "Bestäm vem som beslutar om säkerhet i dotterbolag innan ni behöver det."])
      ],
      assumptionsVsReality: [
        avr(["A migration script.", "Ett migreringsskript."], ["An attacker inside for months.", "En angripare som funnits inne i månader."], "p2"),
        avr(["The sellers told us everything.", "Säljarna berättade allt."], ["They knew and didn't say.", "De visste och sa inget."], "p3"),
        avr(["Only the acquired company is affected.", "Bara det förvärvade företaget är drabbat."], ["Your mail and your customers are too.", "Även er e-post och era kunder är drabbade."], "p4")
      ],
      strengthsToLookFor: [
        L(["Cutting the trust early", "Att kapa förtroendet tidigt"]),
        L(["Keeping the dispute separate from the response", "Att hålla tvisten åtskild från insatsen"]),
        L(["Revoking the signing key openly", "Att återkalla signeringsnyckeln öppet"])
      ],
      commonGaps: [
        L(["Connecting networks on integration day without an assessment", "Att koppla ihop nätverk på integrationsdagen utan bedömning"]),
        L(["Trusting questionnaire answers", "Att lita på svar i frågeformulär"]),
        L(["Unclear authority over the subsidiary", "Oklar befogenhet över dotterbolaget"])
      ],
      suggestedActions: [
        act(["Require a compromise assessment before connecting any acquired network.", "Kräv en intrångsbedömning innan ett förvärvat nätverk kopplas in."], "ciso", "high"),
        act(["Add security evidence and warranties to the acquisition process.", "För in säkerhetsbelägg och garantier i förvärvsprocessen."], "cfo", "high"),
        act(["Keep code-signing keys in hardware modules, separate from build servers.", "Förvara kodsigneringsnycklar i hårdvarumoduler, åtskilda från byggservrar."], "devLead", "high"),
        act(["Define group authority over subsidiaries' security.", "Fastställ koncernens befogenhet över dotterbolagens säkerhet."], "ceo", "medium")
      ]
    }
  });
})();
