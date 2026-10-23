/*
 * s30-npm-package.js — "The Trusted Package" (archetype D, compromised dependency).
 *
 * The package registry warns that a popular formatting library shipped
 * malicious versions after its maintainer was phished → your dependency bot
 * merged it overnight: the install script stole CI and laptop tokens and the
 * customer portal shipped code that swaps bank details → two customers paid
 * the wrong account → your stolen publish token was used to release a
 * poisoned version of your own SDK: you are now someone else's supplier
 * incident → product security reporting → a dependency tree nobody governs.
 * Fictional package names throughout.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s30-npm-package",
    version: 1,
    category: "dependency-compromise",
    archetype: "third-party-origin",
    emblem: "npm-package",
    title: L(["The Trusted Package", "Det betrodda paketet"]),
    summary: L([
      "A tiny formatting library used by half the internet has been poisoned. You do not remember ever choosing it. By the end of the day, other companies are asking whether you poisoned them.",
      "Ett litet formateringsbibliotek som halva internet använder har förgiftats. Ni minns inte att ni någonsin valde det. Innan dagen är slut frågar andra företag om ni har förgiftat dem."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Find out fast whether a compromised dependency reached your builds", "Snabbt ta reda på om ett komprometterat beroende nått era byggen"]), teaser: L(["What you are made of", "Vad ni är gjorda av"]) },
      { id: "lo2", text: L(["Treat build machines and developer laptops as compromised hosts", "Behandla byggmaskiner och utvecklardatorer som komprometterade"]), teaser: L(["The workshop, not only the product", "Verkstaden, inte bara produkten"]) },
      { id: "lo3", text: L(["Act as a responsible supplier when your own product is affected", "Agera som en ansvarsfull leverantör när er egen produkt är drabbad"]), teaser: L(["When you are the third party", "När ni är tredje part"]) },
      { id: "lo4", text: L(["Govern which code enters your software automatically", "Styra vilken kod som automatiskt kommer in i er programvara"]), teaser: L(["Who decides what comes in", "Vem som bestämmer vad som kommer in"]) }
    ],
    mitre: ["T1195.001", "T1059.007", "T1552", "T1528", "T1659", "T1565"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.PS", "DE.CM", "RS.MA", "RS.CO", "RS.MI"],
      iso27001: ["A.5.19", "A.5.21", "A.5.22", "A.5.24", "A.5.26", "A.8.8", "A.8.25", "A.8.28", "A.8.30", "A.8.32"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours", startTime: "08:30" },
    actor: { types: ["criminal"], motivation: L(["Financial: payment diversion and stolen tokens for further attacks", "Ekonomisk: omdirigerade betalningar och stulna token för fler angrepp"]), capability: "high" },
    variables: {
      laptops: { min: 4, max: 60, scaleBy: "size" },
      sdkDownloads: { min: 300, max: 40000, scaleBy: "size", step: 10 },
      diverted: { min: 4000, max: 90000, scaleBy: "size", step: 500, currency: true },
      deps: { min: 600, max: 3200, step: 10 }
    },
    roles: ["incidentCommander", "devLead", "ciso", "socLead", "itOps", "cloudLead", "serviceOwner", "comms", "legal", "dpo", "ceo"],

    groundTruth: {
      rootCause: L([
        "The maintainer of “tinyfmt”, a small formatting library with millions of weekly downloads, was phished through a fake registry security notice. The attacker published three versions with an install script that stole environment variables and tokens, and browser code that replaced bank details on payment pages. {{org.name}}'s dependency bot updated the lockfile overnight and auto-merged it. The portal build deployed at 07:00 carried the browser code; CI runners and {{num.laptops}} developer laptops ran the install script. The stolen registry token from CI was then used to publish a poisoned version of the company's own customer SDK.",
        "Den som underhåller ”tinyfmt”, ett litet formateringsbibliotek med miljontals nedladdningar i veckan, lurades via ett falskt säkerhetsmeddelande från paketregistret. Angriparen publicerade tre versioner med ett installationsskript som stal miljövariabler och token, och webbläsarkod som bytte ut bankuppgifter på betalsidor. {{org.name}}s beroenderobot uppdaterade låsfilen under natten och slog ihop ändringen automatiskt. Portalbygget som driftsattes 07.00 innehöll webbläsarkoden; CI-maskiner och {{num.laptops}} utvecklardatorer körde installationsskriptet. Den stulna registertoken från CI användes sedan för att publicera en förgiftad version av företagets egen kund-SDK."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Look-alike registry domain registered.", "En efterliknande domän för registret registreras."]) },
        { at: -660, text: L(["Maintainer phished; malicious versions published.", "Underhållaren lurad; skadliga versioner publiceras."]) },
        { at: -300, text: L(["Dependency bot merges the update; CI runs the install script.", "Beroenderoboten slår ihop uppdateringen; CI kör installationsskriptet."]) },
        { at: -90, text: L(["Customer portal deployed with the payment-swapping code.", "Kundportalen driftsätts med koden som byter betalningsuppgifter."]) },
        { at: 300, text: L(["Stolen registry token publishes a poisoned SDK version.", "Den stulna registertoken publicerar en förgiftad SDK-version."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-bot", revealStage: "p2", text: L(["The bot's overnight lockfile update was merged automatically and ran on every CI runner.", "Robotens nattliga uppdatering av låsfilen slogs ihop automatiskt och kördes på varje CI-maskin."]) },
      { id: "hf-sdk", revealStage: "p4", text: L(["The CI registry token was taken and used to push version 3.8.1 of your SDK.", "Registertoken från CI togs och användes för att publicera version 3.8.1 av er SDK."]) },
      { id: "hf-tree", revealStage: "p6", text: L(["Hundreds of indirect packages run install scripts, and nobody reviews what the bot merges.", "Hundratals indirekta paket kör installationsskript, och ingen granskar vad roboten slår ihop."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["An advisory before coffee", "En varning före kaffet"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Developer chat channels around the world are lighting up. The package registry has pulled three versions of “tinyfmt”, a tiny library for formatting text, after its maintainer's account was taken over during the night.\n\nNobody at {{org.name}} has heard of tinyfmt. {{person.devLead.name}} is fairly sure you do not use it. Then someone points out that libraries are rarely chosen; they arrive with other libraries.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Utvecklarkanaler över hela världen lyser upp. Paketregistret har dragit tillbaka tre versioner av ”tinyfmt”, ett litet bibliotek för att formatera text, efter att underhållarens konto kapats under natten.\n\nIngen på {{org.name}} har hört talas om tinyfmt. {{person.devLead.name}} är ganska säker på att ni inte använder det. Sedan påpekar någon att bibliotek sällan väljs; de följer med andra bibliotek."
        ]),
        injects: [
          inj("i1-1", 0, "advisory", "csirt", "critical", "confirmed", [
            "Malicious versions of “tinyfmt” (4.2.1–4.2.3) published 23:10–02:40. Install script exfiltrates environment variables and tokens; browser bundle alters payment details on web pages. Treat any system that installed them as compromised.",
            "Skadliga versioner av ”tinyfmt” (4.2.1–4.2.3) publicerade 23.10–02.40. Installationsskriptet för ut miljövariabler och token; webbläsarkoden ändrar betalningsuppgifter på webbsidor. Behandla varje system som installerat dem som komprometterat."
          ], { headline: ["Compromised package: tinyfmt", "Komprometterat paket: tinyfmt"], tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "person.devLead", "medium", "misleading", [
            "“We pin our versions, so even if something pulls tinyfmt in, we'd be on an old one. I think we're fine.”",
            "”Vi låser våra versioner, så även om något drar in tinyfmt skulle vi ligga på en gammal. Jag tror att vi klarar oss.”"
          ], { facilitatorNote: ["Pinning only helps if nothing updates the pins. Something did.", "Låsta versioner hjälper bara om inget uppdaterar låsningen. Något gjorde det."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find every place tinyfmt is used, including indirect dependencies?", "Hur hittar ni varje ställe där tinyfmt används, även indirekta beroenden?", ["devLead"]),
            q("Did anything install or build new packages overnight?", "Installerade eller byggde något nya paket under natten?", ["devLead", "cloudLead"]),
            q("Which machines would have run an install script?", "Vilka maskiner skulle ha kört ett installationsskript?", ["itOps", "devLead"])
          ],
          executive: [
            q("Is this your incident before you know you are affected?", "Är det här er incident innan ni vet att ni är drabbade?", ["incidentCommander", "ciso"]),
            q("What would it mean for customers if the portal shows wrong bank details?", "Vad skulle det innebära för kunderna om portalen visar fel bankuppgifter?", ["serviceOwner"]),
            q("Who decides to stop deployments?", "Vem bestämmer att driftsättningar ska stoppas?", ["incidentCommander", "devLead"])
          ]
        },
        challenges: [ch("A major release to the customer portal is scheduled for 10:00.", "En stor release av kundportalen är planerad till 10.00.")],
        decision: dec("d1", "incidentCommander", ["What do you do now?", "Vad gör ni nu?"], [
          ["Freeze deployments and builds, and search every lockfile and build log for tinyfmt now.", "Frys driftsättningar och byggen, och sök i varje låsfil och bygglogg efter tinyfmt nu."],
          ["Ask teams to check whether they use tinyfmt directly and report back by lunch.", "Be teamen kontrollera om de använder tinyfmt direkt och rapportera till lunch."],
          ["Go ahead with the 10:00 release; you pin versions.", "Genomför releasen 10.00; ni låser versioner."]
        ], {
          knowns: [["A widely used package was poisoned overnight.", "Ett allmänt använt paket förgiftades under natten."]],
          uncertainties: [["Whether it is anywhere in your software.", "Om det finns någonstans i er programvara."]],
          tradeoffs: {
            operational: ["A freeze delays the release the business is waiting for.", "En frysning försenar releasen som verksamheten väntar på."],
            security: ["Checking only direct dependencies misses most of the risk.", "Att bara kontrollera direkta beroenden missar det mesta av risken."],
            legal: ["Shipping known-bad code to customers is hard to defend.", "Att leverera känd skadlig kod till kunder är svårt att försvara."],
            reputational: ["Developers worldwide are watching who reacts well.", "Utvecklare över hela världen ser vem som reagerar bra."]
          },
          evaluation: [["Checks the full dependency tree and build history before trusting assumptions", "Kontrollerar hela beroendeträdet och byggnadshistoriken innan antaganden tas för givna"]]
        }),
        facilitator: fac(
          ["The comfortable assumption (“we pin”) is the trap. Push for evidence from lockfiles and build logs.", "Det bekväma antagandet (”vi låser”) är fällan. Driv på för belägg från låsfiler och byggloggar."],
          ["Freeze, search lockfiles and build logs for the bad versions across all repositories.", "Frys, sök i låsfiler och byggloggar efter de skadliga versionerna i alla kodförråd."],
          [["Ask: who or what changed your lockfiles this week?", "Fråga: vem eller vad har ändrat era låsfiler den här veckan?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["The bot merged it", "Roboten slog ihop det"]),
        twist: L(["Your dependency bot updated a lockfile at 02:15 and auto-merged it. tinyfmt 4.2.2 arrived through a logging library. The install script ran on every CI runner and on {{num.laptops}} developer laptops, and the 07:00 portal build carried the browser code.", "Er beroenderobot uppdaterade en låsfil 02.15 och slog ihop den automatiskt. tinyfmt 4.2.2 följde med ett loggbibliotek. Installationsskriptet kördes på varje CI-maskin och på {{num.laptops}} utvecklardatorer, och portalbygget 07.00 innehöll webbläsarkoden."]),
        twistKind: "cause",
        assumptionChallenged: L(["We pin versions, so we are not affected.", "Vi låser versioner, så vi är inte drabbade."]),
        reveals: ["hf-bot"],
        narrative: L([
          "{{time.T+60|clock}}. {{person.devLead.name}} searches every lockfile in the company for tinyfmt. It appears in fourteen places, never as something anyone chose, always as a dependency of a dependency.\n\nThe version numbers are the problem. Most are old and safe, but one lockfile changed overnight. The change was not made by a person, and nobody reviewed it.",
          "Klockan {{time.T+60|clock}}. {{person.devLead.name}} söker igenom varje låsfil i företaget efter tinyfmt. Det förekommer på fjorton ställen, aldrig som något någon har valt, alltid som ett beroende till ett beroende.\n\nVersionsnumren är problemet. De flesta är gamla och säkra, men en låsfil ändrades under natten. Ändringen gjordes inte av en människa, och ingen granskade den."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "person.devLead", "critical", "confirmed", [
            "portal-web: lockfile updated by dependency bot 02:15 (“chore: bump log-pretty 2.9 → 2.10”), auto-merged 02:16. Pulls tinyfmt 4.2.2. CI install step: postinstall ran on runners 1–6. Build 07:00 deployed to production.",
            "portal-web: låsfilen uppdaterad av beroenderoboten 02.15 (”chore: bump log-pretty 2.9 → 2.10”), automatiskt sammanslagen 02.16. Drar in tinyfmt 4.2.2. CI-installationssteget: postinstall kördes på maskin 1–6. Bygget 07.00 driftsatt i produktion."
          ], { reveals: ["hf-bot"], tests: ["lo1", "lo2"] }),
          inj("i2-2", 90, "edrAlert", "edr", "high", "confirmed", [
            "Node process spawned outbound connections to {{asset.c2Domain}} during package install on {{num.laptops}} developer laptops between 08:05 and 08:40.",
            "Node-processer öppnade utgående anslutningar till {{asset.c2Domain}} under paketinstallation på {{num.laptops}} utvecklardatorer mellan 08.05 och 08.40."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What secrets were in the environment on the CI runners and laptops?", "Vilka hemligheter fanns i miljön på CI-maskinerna och datorerna?", ["devLead", "cloudLead"]),
            q("Do you roll back the portal, or patch forward?", "Rullar ni tillbaka portalen, eller rättar ni framåt?", ["devLead", "serviceOwner"]),
            q("Did freezing deployments stop anything that would have made it worse?", "Stoppade frysningen av driftsättningar något som skulle ha gjort det värre?", ["devLead"], "d1")
          ],
          executive: [
            q("Is the customer portal safe to keep running right now?", "Är kundportalen säker att låta vara igång just nu?", ["serviceOwner", "ciso"]),
            q("What do you tell the developers whose laptops are affected?", "Vad säger ni till utvecklarna vars datorer är drabbade?", ["ciso"]),
            q("If the 10:00 release had gone ahead, what would it have carried?", "Om releasen 10.00 hade genomförts, vad hade den innehållit?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The CI runners hold the token that publishes your customer SDK to the registry.", "CI-maskinerna har den token som publicerar er kund-SDK till registret.")],
        decision: dec("d2", "ciso", ["How do you respond?", "Hur svarar ni?"], [
          ["Roll the portal back, take the portal offline if needed, revoke every secret CI and the laptops held, and rebuild the runners.", "Rulla tillbaka portalen, ta ner den vid behov, återkalla varje hemlighet som CI och datorerna hade och bygg om CI-maskinerna."],
          ["Patch the portal to remove tinyfmt and keep everything else running.", "Rätta portalen så att tinyfmt försvinner och låt allt annat vara igång."],
          ["Reimage the laptops and leave the CI tokens until you know what was taken.", "Installera om datorerna och låt CI-token vara tills ni vet vad som togs."]
        ], {
          knowns: [["The malicious code ran in CI, on laptops, and is live in the portal.", "Den skadliga koden kördes i CI, på datorer och är live i portalen."]],
          uncertainties: [["Which tokens were taken and whether they have been used.", "Vilka token som togs och om de har använts."]],
          tradeoffs: {
            operational: ["Revoking every CI secret stops all builds for a day.", "Att återkalla varje CI-hemlighet stoppar alla byggen i ett dygn."],
            security: ["A token left active is a door for the attacker's next step.", "En token som lämnas aktiv är en dörr för angriparens nästa steg."],
            legal: ["Customers using the portal now may be paying the wrong account.", "Kunder som använder portalen nu kan betala till fel konto."],
            reputational: ["Taking the portal down is visible; leaving it up is worse.", "Att ta ner portalen syns; att låta den vara uppe är värre."]
          },
          evaluation: [["Treats the build system as compromised, not only the product", "Behandlar byggsystemet som komprometterat, inte bara produkten"]]
        }),
        facilitator: fac(
          ["The build pipeline is the crown jewel here. Watch whether the room revokes CI tokens.", "Byggkedjan är kronjuvelen här. Se om rummet återkallar CI-token."],
          ["Rollback, full secret revocation for CI and laptops, rebuilt runners.", "Tillbakarullning, fullständig återkallelse av hemligheter för CI och datorer, ombyggda CI-maskiner."],
          [["Ask: what can someone do with your CI's environment variables?", "Fråga: vad kan någon göra med miljövariablerna i er CI?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        priority: 1,
        title: L(["The wrong account", "Fel konto"]),
        twist: L(["For three hours this morning, the portal's payment page showed customers a different bank account. Two customers have already paid {{num.diverted|currency}} to it.", "I tre timmar i morse visade portalens betalsida kunderna ett annat bankkonto. Två kunder har redan betalat {{num.diverted|currency}} till det."]),
        twistKind: "impact",
        assumptionChallenged: L(["The browser code was there, but nobody was harmed.", "Webbläsarkoden fanns där, men ingen skadades."]),
        narrative: L([
          "{{time.T+300|clock}}. The portal has been rolled back and the old bank details are showing again. {{person.serviceOwner.name}} asks finance to check this morning's incoming payments, just to be sure.\n\nFinance finds a gap where payments should be. Two customers who paid their invoices this morning confirm that they followed the instructions on the portal, exactly as they always do.",
          "Klockan {{time.T+300|clock}}. Portalen är tillbakarullad och de gamla bankuppgifterna syns igen. {{person.serviceOwner.name}} ber ekonomiavdelningen kontrollera morgonens inbetalningar, för säkerhets skull.\n\nEkonomi hittar ett hål där betalningar borde finnas. Två kunder som betalade sina fakturor i morse bekräftar att de följde instruktionerna i portalen, precis som de alltid gör."
        ]),
        injects: [
          inj("i3-1", 300, "customerComplaint", "customer", "high", "confirmed", [
            "“We paid this morning using the bank details in your portal, like always. Your reminder says you haven't received it. The screenshot is attached.”",
            "”Vi betalade i morse med bankuppgifterna i er portal, som vanligt. Er påminnelse säger att ni inte har fått något. Skärmbilden är bifogad.”"
          ], { tests: ["lo2"] }),
          inj("i3-2", 330, "phoneTranscript", "bank", "high", "confirmed", [
            "Your bank's fraud desk: “If the customers report it to their banks today, a recall is possible. Tomorrow is much harder.”",
            "Bankens bedrägeriavdelning: ”Om kunderna anmäler det till sina banker i dag är en återkallelse möjlig. I morgon är det mycket svårare.”"
          ], { optional: true, tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you find every customer who saw the page in those three hours?", "Hur hittar ni varje kund som såg sidan under de tre timmarna?", ["devLead", "serviceOwner"]),
            q("Can you prove what the page showed, and to whom?", "Kan ni bevisa vad sidan visade, och för vem?", ["devLead", "socLead"]),
            q("Did rolling back first, rather than patching, shorten the window?", "Kortade det fönstret att rulla tillbaka först, i stället för att rätta?", ["devLead"], "d2")
          ],
          executive: [
            q("Do you contact every customer who visited, or only those who paid?", "Kontaktar ni varje kund som besökte sidan, eller bara dem som betalade?", ["serviceOwner", "comms"]),
            q("Who bears the loss of the diverted payments?", "Vem bär förlusten av de omdirigerade betalningarna?", ["legal", "ceo"]),
            q("What would leaving the portal up with a patch have cost?", "Vad hade det kostat att låta portalen vara uppe med en rättning?", ["serviceOwner"], "d2")
          ]
        },
        challenges: [ch("The portal's logs record sessions but not what the browser displayed.", "Portalens loggar registrerar sessioner men inte vad webbläsaren visade.")],
        decision: dec("d3", "serviceOwner", ["How do you handle the customers?", "Hur hanterar ni kunderna?"], [
          ["Contact every customer who visited the portal this morning, help the two with bank recalls, and do not ask them to bear the loss.", "Kontakta varje kund som besökte portalen i morse, hjälp de två med återkallelser och be dem inte bära förlusten."],
          ["Contact the two who paid and wait for others to notice.", "Kontakta de två som betalade och vänta på att andra märker något."],
          ["Post a general notice on the portal.", "Lägg upp ett allmänt meddelande i portalen."]
        ], {
          knowns: [["Customers were shown false bank details for three hours.", "Kunder visades falska bankuppgifter i tre timmar."]],
          uncertainties: [["How many more customers paid elsewhere and have not noticed.", "Hur många fler kunder som betalat någon annanstans och inte märkt det."]],
          tradeoffs: {
            operational: ["Contacting every visitor is a lot of calls today.", "Att kontakta varje besökare är många samtal i dag."],
            security: ["Waiting lets the window for recalls close.", "Att vänta låter fönstret för återkallelser stängas."],
            legal: ["Your portal gave the instruction; liability is likely yours.", "Er portal gav instruktionen; ansvaret är troligen ert."],
            reputational: ["Customers judge you by how fast you warn them.", "Kunderna bedömer er efter hur snabbt ni varnar dem."]
          },
          evaluation: [["Warns everyone exposed while recalls are still possible", "Varnar alla som exponerats medan återkallelser fortfarande är möjliga"]]
        }),
        facilitator: fac(
          ["Supply-chain incidents feel abstract until someone pays the wrong account. Speed matters for recalls.", "Leverantörskedjeincidenter känns abstrakta tills någon betalar till fel konto. Snabbhet avgör återkallelser."],
          ["Contact all visitors today, support recalls, absorb the loss.", "Kontakta alla besökare i dag, stöd återkallelser, ta förlusten."],
          [["Ask: if you were the customer, when would you want to know?", "Fråga: om ni var kunden, när skulle ni vilja veta?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 420,
        title: L(["Version 3.8.1", "Version 3.8.1"]),
        twist: L(["A security researcher emails: version 3.8.1 of your own customer SDK, published to the registry an hour ago, contains the same malicious code. Your SDK has {{num.sdkDownloads|number}} weekly downloads.", "En säkerhetsforskare mejlar: version 3.8.1 av er egen kund-SDK, publicerad i registret för en timme sedan, innehåller samma skadliga kod. Er SDK har {{num.sdkDownloads|number}} nedladdningar i veckan."]),
        twistKind: "scope",
        assumptionChallenged: L(["We are a victim of a supply-chain attack.", "Vi är offer för en leverantörskedjeattack."]),
        reveals: ["hf-sdk"],
        narrative: L([
          "{{time.T+420|clock}}. The customer calls are under way and the portal is stable. Then an email arrives at the security address from a researcher who tracks poisoned packages.\n\nIt is not about tinyfmt any more. It names a package with your company's name on it, one that your customers install in their own systems to connect to yours.",
          "Klockan {{time.T+420|clock}}. Samtalen med kunderna pågår och portalen är stabil. Sedan kommer ett mejl till säkerhetsadressen från en forskare som bevakar förgiftade paket.\n\nDet handlar inte längre om tinyfmt. Det namnger ett paket med ert företagsnamn på, ett som era kunder installerar i sina egna system för att koppla upp sig mot era."
        ]),
        injects: [
          inj("i4-1", 420, "email", "threatIntel", "critical", "confirmed", [
            "“Your SDK 3.8.1, published 13:42, ships the tinyfmt payload in its install script. It was published with your organisation's registry token, not by your usual release process. Please confirm.”",
            "”Er SDK 3.8.1, publicerad 13.42, innehåller tinyfmt-koden i sitt installationsskript. Den publicerades med er organisations registertoken, inte via er vanliga releaseprocess. Var vänlig bekräfta.”"
          ], { headline: ["Your SDK 3.8.1 appears compromised", "Er SDK 3.8.1 verkar komprometterad"], reveals: ["hf-sdk"], tests: ["lo3"] }),
          inj("i4-2", 450, "authLog", "person.devLead", "critical", "confirmed", [
            "Registry audit: package publish “{{org.shortName|lower}}-sdk@3.8.1” at 13:42 with token ci-publish-01 from {{asset.attackerIp}}. Token last rotated: never.",
            "Registrets granskningslogg: paketpublicering ”{{org.shortName|lower}}-sdk@3.8.1” 13.42 med token ci-publish-01 från {{asset.attackerIp}}. Token senast bytt: aldrig."
          ], { tests: ["lo2", "lo3"] })
        ],
        charts: [{
          id: "c4-dl", type: "line",
          title: L(["Downloads of SDK 3.8.1", "Nedladdningar av SDK 3.8.1"]), unit: L(["downloads per 10 min", "nedladdningar per 10 min"]),
          caption: L(["Minutes since it was published.", "Minuter sedan den publicerades."]),
          data: line(["Downloads", "Nedladdningar"], 0, 60, 10, (x, ctx) => Math.round((ctx.vars.sdkDownloads / 600) * (1 + x / 10)))
        }],
        questions: {
          technical: [
            q("How do you get 3.8.1 removed from the registry, and what replaces it?", "Hur får ni 3.8.1 borttagen ur registret, och vad ersätter den?", ["devLead"]),
            q("Why was the publish token still valid after this morning?", "Varför var publiceringstoken fortfarande giltig efter i morse?", ["devLead", "ciso"]),
            q("Did the decision on CI secrets this morning include this token?", "Omfattade morgonens beslut om CI-hemligheter den här token?", ["ciso"], "d2")
          ],
          executive: [
            q("What do you owe the customers who installed 3.8.1?", "Vad är ni skyldiga de kunder som installerade 3.8.1?", ["ceo", "legal"]),
            q("Who speaks publicly, and how fast?", "Vem talar offentligt, och hur snabbt?", ["comms", "ceo"]),
            q("If every CI token had been revoked at 09:30, would this have happened?", "Om varje CI-token hade återkallats 09.30, hade det här hänt?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Several customers run automated updates and will have installed it already.", "Flera kunder kör automatiska uppdateringar och har redan installerat den.")],
        decision: dec("d4", "ceo", ["What do you do as a supplier?", "Vad gör ni som leverantör?"], [
          ["Unpublish 3.8.1, release a clean 3.8.2, publish an advisory with indicators, and contact known customers directly.", "Avpublicera 3.8.1, släpp en ren 3.8.2, publicera en säkerhetsvarning med indikatorer och kontakta kända kunder direkt."],
          ["Unpublish it quietly and release 3.8.2 without comment.", "Avpublicera den i tysthet och släpp 3.8.2 utan kommentar."],
          ["Wait until you have confirmed the full impact before saying anything.", "Vänta tills ni har bekräftat hela påverkan innan ni säger något."]
        ], {
          knowns: [["Your own package was used to spread the attack.", "Ert eget paket användes för att sprida angreppet."]],
          uncertainties: [["How many customers installed it and what it took from them.", "Hur många kunder som installerade det och vad det tog från dem."]],
          tradeoffs: {
            operational: ["An advisory brings a flood of questions.", "En säkerhetsvarning ger en flod av frågor."],
            security: ["A silent fix leaves customers' stolen tokens active.", "En tyst rättning lämnar kundernas stulna token aktiva."],
            legal: ["Product security rules may require prompt reporting of a severe incident.", "Regler om produktsäkerhet kan kräva snabb rapportering av en allvarlig incident."],
            reputational: ["The developer community rewards openness and punishes silence.", "Utvecklarvärlden belönar öppenhet och straffar tystnad."]
          },
          evaluation: [["Acts as the supplier you would want: fast, open, with indicators", "Agerar som den leverantör ni själva skulle vilja ha: snabbt, öppet, med indikatorer"]]
        }),
        facilitator: fac(
          ["The victim becomes the vector. The tone of the room usually changes here.", "Offret blir smittbäraren. Stämningen i rummet brukar ändras här."],
          ["Unpublish, clean release, public advisory with indicators, direct customer contact.", "Avpublicera, ren release, offentlig säkerhetsvarning med indikatorer, direktkontakt med kunder."],
          [["Ask: what would you want from tinyfmt's maintainer this morning?", "Fråga: vad hade ni velat ha från tinyfmts underhållare i morse?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["Twenty-four hours", "Tjugofyra timmar"]),
        twist: L(["{{reg.csirt}} reminds you that as a manufacturer of a software product, a severe incident affecting its security must be reported within 24 hours of becoming aware, with an update within 72.", "{{reg.csirt}} påminner om att ni som tillverkare av en programvaruprodukt måste rapportera en allvarlig incident som påverkar dess säkerhet inom 24 timmar från kännedom, med en uppdatering inom 72."]),
        twistKind: "authority",
        assumptionChallenged: L(["Reporting is only about personal data.", "Rapportering handlar bara om personuppgifter."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. A long night is over. The SDK has been cleaned and re-released, and the advisory is out. {{person.legal.name}} has been reading rules that most of the room has only heard mentioned at conferences.\n\nThe data protection question is familiar. The new question is about the product itself, and the clock for it may have started the moment the researcher's email arrived.",
          "{{time.T+1440|weekday|cap}}. En lång natt är över. SDK:n är rensad och släppt på nytt, och säkerhetsvarningen är publicerad. {{person.legal.name}} har läst regler som de flesta i rummet bara hört nämnas på konferenser.\n\nDataskyddsfrågan är bekant. Den nya frågan gäller själva produkten, och klockan för den kan ha börjat gå i samma stund som forskarens mejl kom."
        ]),
        injects: [
          inj("i5-1", 1440, "regulatorLetter", "csirt", "high", "confirmed", [
            "{{reg.csirt}}: “We have seen your advisory. Manufacturers must give early warning of severe incidents affecting product security within 24 hours, a notification within 72 hours and a final report later. Please confirm your submission.”",
            "{{reg.csirt}}: ”Vi har sett er säkerhetsvarning. Tillverkare ska ge en tidig varning om allvarliga incidenter som påverkar produktsäkerheten inom 24 timmar, en anmälan inom 72 timmar och en slutrapport senare. Bekräfta er inlämning.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What indicators and timeline can you give in the report today?", "Vilka indikatorer och vilken tidslinje kan ni ge i rapporten i dag?", ["socLead", "devLead"]),
            q("Can you tell which customers installed 3.8.1?", "Kan ni se vilka kunder som installerade 3.8.1?", ["devLead"]),
            q("Did the public advisory make this report easier to write?", "Gjorde den offentliga säkerhetsvarningen den här rapporten lättare att skriva?", ["comms"], "d4")
          ],
          executive: [
            q("Who signs product security reports for the company?", "Vem undertecknar rapporter om produktsäkerhet för företaget?", ["legal", "ceo"]),
            q("Do you also notify {{reg.dpaShort}} about the portal?", "Anmäler ni också portalen till {{reg.dpaShort}}?", ["dpo"]),
            q("Would a quiet fix have left you explaining a missed deadline?", "Hade en tyst rättning lämnat er att förklara en missad tidsfrist?", ["legal"], "d4")
          ]
        },
        challenges: [ch("Nobody in the company has submitted a product security report before.", "Ingen på företaget har lämnat in en rapport om produktsäkerhet tidigare.")],
        noDecision: L(["No vote: the duty is set. Let the room agree who files, what goes in, and how the 72-hour update is prepared.", "Ingen omröstning: skyldigheten är given. Låt rummet komma överens om vem som lämnar in, vad som ska med och hur 72-timmarsuppdateringen förbereds."]),
        facilitator: fac(
          ["Product security reporting is new to most organisations. Treat it like the data protection clock.", "Rapportering om produktsäkerhet är nytt för de flesta organisationer. Behandla det som dataskyddsklockan."],
          ["A named owner files today, with an update plan for 72 hours.", "En namngiven ansvarig lämnar in i dag, med en plan för uppdateringen inom 72 timmar."],
          [["Ask: when exactly did you become aware?", "Fråga: när exakt fick ni kännedom?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["{{num.deps|number}} packages", "{{num.deps|number}} paket"]),
        twist: L(["An audit of the dependency tree finds {{num.deps|number}} third-party packages in the portal alone, hundreds running install scripts, and a bot that has auto-merged over 2,000 updates this year without review.", "En granskning av beroendeträdet hittar {{num.deps|number}} tredjepartspaket bara i portalen, hundratals som kör installationsskript och en robot som har slagit ihop över 2 000 uppdateringar i år utan granskning."]),
        twistKind: "scope",
        assumptionChallenged: L(["This was one bad package.", "Det här var ett dåligt paket."]),
        reveals: ["hf-tree"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. The diverted payments are being recovered and the advisory has been widely praised. {{person.devLead.name}} presents an inventory of what your software is actually made of.\n\nNobody chose most of it. It arrived through dependencies of dependencies, kept up to date by a helpful bot that never sleeps and never asks.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. De omdirigerade betalningarna håller på att återvinnas och säkerhetsvarningen har fått mycket beröm. {{person.devLead.name}} presenterar en förteckning över vad er programvara faktiskt består av.\n\nIngen har valt det mesta av det. Det kom via beroenden till beroenden, hållet uppdaterat av en hjälpsam robot som aldrig sover och aldrig frågar."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.devLead", "medium", "confirmed", [
            "Portal dependencies: {{num.deps|number}} (direct 64). Packages with install scripts: 211. Bot updates auto-merged this year: 2,140; human review: none. Software bill of materials: not produced.",
            "Portalens beroenden: {{num.deps|number}} (direkta 64). Paket med installationsskript: 211. Robotuppdateringar automatiskt sammanslagna i år: 2 140; mänsklig granskning: ingen. Förteckning över programvarukomponenter: tas inte fram."
          ], { reveals: ["hf-tree"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Should install scripts run at all in CI and on laptops?", "Bör installationsskript köras över huvud taget i CI och på datorer?", ["devLead"]),
            q("Would a waiting period before new versions are accepted have saved you?", "Hade en väntetid innan nya versioner accepteras räddat er?", ["devLead"]),
            q("Looking back, which morning decision limited the damage most?", "När ni ser tillbaka, vilket beslut under morgonen begränsade skadan mest?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Who owns the decision of what code enters your products?", "Vem äger beslutet om vilken kod som kommer in i era produkter?", ["ciso", "devLead"]),
            q("What will customers ask you to prove about your software from now on?", "Vad kommer kunderna att be er bevisa om er programvara från och med nu?", ["serviceOwner", "legal"]),
            q("Did revoking tokens early enough become the deciding factor?", "Blev det avgörande om token återkallades tillräckligt tidigt?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("Developers say turning off auto-merge will leave them hopelessly behind on security patches.", "Utvecklarna säger att avstängd automatisk sammanslagning gör att de hamnar hopplöst efter med säkerhetsrättningar.")],
        decision: dec("d5", "devLead", ["What do you change?", "Vad ändrar ni?"], [
          ["A cooling-off period for new versions, install scripts off by default, short-lived publish tokens and a software bill of materials.", "En karenstid för nya versioner, installationsskript avstängda som standard, kortlivade publiceringstoken och en förteckning över programvarukomponenter."],
          ["Turn off the bot and update manually.", "Stäng av roboten och uppdatera manuellt."],
          ["Keep things as they are; this was rare.", "Låt det vara som det är; det här var ovanligt."]
        ], {
          knowns: [["Unreviewed third-party code enters builds every day.", "Ogranskad tredjepartskod kommer in i byggen varje dag."]],
          uncertainties: [["Which of today's packages is next.", "Vilket av dagens paket som blir nästa."]],
          tradeoffs: {
            operational: ["Cooling-off periods delay real security fixes by days.", "Karenstider försenar verkliga säkerhetsrättningar med dagar."],
            security: ["Manual updates fall behind and leave known holes open.", "Manuella uppdateringar halkar efter och lämnar kända hål öppna."],
            legal: ["Customers and regulators increasingly expect a bill of materials.", "Kunder och tillsynsmyndigheter förväntar sig allt oftare en komponentförteckning."],
            reputational: ["Being the vector once is forgiven; twice is not.", "Att vara smittbärare en gång förlåts; två gånger gör det inte."]
          },
          evaluation: [["Governs incoming code without stopping updates", "Styr inkommande kod utan att stoppa uppdateringar"]]
        }),
        facilitator: fac(
          ["End on governance: automated trust is a design decision nobody made consciously.", "Avsluta med styrning: automatiskt förtroende är ett designbeslut som ingen fattade medvetet."],
          ["Cooling-off, no install scripts by default, short-lived tokens, SBOM.", "Karenstid, inga installationsskript som standard, kortlivade token, komponentförteckning."],
          [["Ask: who approved the bot's right to change your product at 02:15?", "Fråga: vem godkände robotens rätt att ändra er produkt 02.15?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The portal is clean, most diverted payments are recovered and your advisory helps others, but your SDK spread the attack to customers for an hour.",
        "Portalen är ren, de flesta omdirigerade betalningar återvinns och er säkerhetsvarning hjälper andra, men er SDK spred angreppet till kunder under en timme."
      ])
    },

    debrief: {
      keyLessons: [
        L(["You rarely choose your riskiest code; it arrives as dependencies of dependencies.", "Ni väljer sällan er mest riskfyllda kod; den kommer som beroenden till beroenden."]),
        L(["A poisoned build means every secret the build machines held is gone.", "Ett förgiftat bygge innebär att varje hemlighet som byggmaskinerna hade är borta."]),
        L(["When your product spreads an attack, act like the supplier you would want: fast and open.", "När er produkt sprider ett angrepp, agera som den leverantör ni själva skulle vilja ha: snabbt och öppet."]),
        L(["Product security incidents can carry their own reporting duties.", "Incidenter som rör produktsäkerhet kan ha egna rapporteringsskyldigheter."])
      ],
      assumptionsVsReality: [
        avr(["We pin versions, so we are safe.", "Vi låser versioner, så vi är säkra."], ["A bot updated the pin overnight.", "En robot uppdaterade låsningen under natten."], "p2"),
        avr(["We are a victim.", "Vi är ett offer."], ["Our SDK became a vector for others.", "Vår SDK blev en smittbärare för andra."], "p4"),
        avr(["One bad package.", "Ett dåligt paket."], ["Thousands of unreviewed packages and updates.", "Tusentals ogranskade paket och uppdateringar."], "p6")
      ],
      strengthsToLookFor: [
        L(["Freezing deployments while checking lockfiles", "Att frysa driftsättningar medan låsfilerna kontrolleras"]),
        L(["Revoking every CI secret, including publish tokens", "Att återkalla varje CI-hemlighet, även publiceringstoken"]),
        L(["A public advisory with indicators", "En offentlig säkerhetsvarning med indikatorer"])
      ],
      commonGaps: [
        L(["Checking only direct dependencies", "Att bara kontrollera direkta beroenden"]),
        L(["Rotating laptop credentials but not CI tokens", "Att byta inloggningar på datorer men inte CI-token"]),
        L(["Missing product security reporting duties", "Att missa skyldigheter att rapportera om produktsäkerhet"])
      ],
      suggestedActions: [
        act(["Disable install scripts by default in CI and on developer machines.", "Stäng av installationsskript som standard i CI och på utvecklardatorer."], "devLead", "high"),
        act(["Use short-lived, scoped tokens for publishing packages.", "Använd kortlivade, avgränsade token för att publicera paket."], "devLead", "high"),
        act(["Introduce a cooling-off period and review for dependency bot updates.", "Inför en karenstid och granskning för beroenderobotens uppdateringar."], "ciso", "medium"),
        act(["Prepare a product security incident reporting procedure.", "Ta fram en rutin för rapportering av produktsäkerhetsincidenter."], "legal", "medium")
      ]
    }
  });
})();
