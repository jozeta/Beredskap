/*
 * s14-cicd-pipeline.js — "Secrets in the Pipeline" (archetype A, DevSecOps).
 *
 * Obvious incident, hidden secondary: a cloud bill spike from crypto-mining →
 * the keys came from a public repository → the same keys let the attacker
 * modify the build pipeline, and signed artefacts reached customers → the
 * signing key itself was exposed → customers demand proof → a package also went
 * to a public registry → restoring a build system you can trust → the
 * aftermath.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s14-cicd-pipeline",
    version: 1,
    category: "devsecops",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "pipeline",
    title: L(["Secrets in the Pipeline", "Hemligheter i pipelinen"]),
    summary: L([
      "The cloud bill has tripled overnight because someone is mining cryptocurrency in your account. That is the cheap part of the story.",
      "Molnfakturan har tredubblats under natten eftersom någon utvinner kryptovaluta i ert konto. Det är den billiga delen av historien."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain leaked cloud credentials quickly and completely", "Begränsa läckta molnuppgifter snabbt och fullständigt"]), teaser: L(["Closing every door, quickly", "Att stänga varje dörr, snabbt"]) },
      { id: "lo2", text: L(["Look beyond the obvious impact to what else the access allowed", "Se bortom den uppenbara påverkan till vad mer åtkomsten möjliggjorde"]), teaser: L(["Looking past the obvious", "Att se bortom det uppenbara"]) },
      { id: "lo3", text: L(["Decide which software releases can be trusted", "Avgöra vilka programversioner som går att lita på"]), teaser: L(["What you can still stand behind", "Vad ni fortfarande kan stå för"]) },
      { id: "lo4", text: L(["Restore a trusted build capability and tell customers", "Återställa en pålitlig byggkapacitet och informera kunderna"]), teaser: L(["Rebuilding trust in your own work", "Att återbygga förtroendet för ert eget arbete"]) }
    ],
    mitre: ["T1496", "T1552", "T1078", "T1195.002", "T1554", "T1098", "T1528"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "PR.AA", "PR.DS", "PR.PS", "DE.CM", "RS.MA", "RS.CO", "RC.RP"],
      iso27001: ["A.5.17", "A.5.23", "A.8.4", "A.8.9", "A.8.24", "A.8.25", "A.8.28", "A.8.31", "A.8.32"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "monday-morning", sectors: ["technology", "finance", "telecom", "retail"] },
    actor: { types: ["criminal", "unknown"], motivation: L(["Financial at first; then access to customers through your software", "Först ekonomisk; sedan åtkomst till kunder via er programvara"]), capability: "medium" },
    variables: {
      billPerDay: { min: 30000, max: 900000, step: 5000, scaleBy: "size", currency: true },
      instances: { min: 40, max: 600, scaleBy: "size" },
      releases: { min: 3, max: 9 },
      customersOnRelease: { min: 20, max: 1800, scaleBy: "size" },
      leakDays: { min: 6, max: 40 },
      downloads: { min: 300, max: 40000 }
    },
    roles: ["devLead", "cloudLead", "ciso", "socLead", "incidentCommander", "cio", "ceo", "legal", "comms", "serviceOwner"],

    groundTruth: {
      rootCause: L([
        "A developer pushed a configuration file with long-lived cloud access keys to a public repository {{num.leakDays}} days ago. An attacker found it, added a step to the build pipeline that inserted a small loader into the product and used the pipeline's own signing to ship it. The crypto-mining started much later and was the noisy part.",
        "En utvecklare publicerade en konfigurationsfil med långlivade åtkomstnycklar till molnet i ett öppet kodförråd för {{num.leakDays}} dagar sedan. En angripare hittade den, lade till ett steg i byggpipelinen som infogade en liten laddare i produkten och använde pipelinens egen signering för att leverera den. Kryptoutvinningen började mycket senare och var den bullriga delen."
      ]),
      attackerTimeline: [
        { at: -86400, text: L(["Configuration with access keys pushed to a public repository.", "Konfiguration med åtkomstnycklar publiceras i ett öppet kodförråd."]) },
        { at: -80000, text: L(["Keys used to list the build environment.", "Nycklarna används för att lista byggmiljön."]) },
        { at: -60000, text: L(["Build pipeline modified; first tainted release signed.", "Byggpipelinen ändras; den första manipulerade versionen signeras."]) },
        { at: -1440, text: L(["Crypto-mining instances launched across regions.", "Instanser för kryptoutvinning startas i flera regioner."]) },
        { at: 0, text: L(["Billing alert fires.", "Larmet om fakturering utlöses."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-keys", revealStage: "p2", text: L(["The access keys were published in a public code repository.", "Åtkomstnycklarna hade publicerats i ett öppet kodförråd."]) },
      { id: "hf-pipeline", revealStage: "p3", text: L(["The build pipeline was modified and signed releases containing a loader were shipped.", "Byggpipelinen ändrades och signerade versioner med en laddare levererades."]) },
      { id: "hf-signing", revealStage: "p4", text: L(["The leaked deployment key could read the product signing key from the secret store.", "Den läckta driftsättningsnyckeln kunde läsa produktens signeringsnyckel i hemlighetsvalvet."]) },
      { id: "hf-registry", revealStage: "p6", text: L(["A tainted package was also published to a public package registry.", "Ett manipulerat paket publicerades också i ett öppet paketregister."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The bill that tripled", "Fakturan som tredubblades"]),
        narrative: L([
          "{{time.T+0|weekday|cap}} {{time.T+0|daypart}}, {{time.T+0|clock}}. The cloud team at {{org.name}} opens a billing alert from {{supplier.cloud}}: spending in your account has tripled over the weekend.\n\nDozens of large compute instances have been running in regions you never use. A big release is planned for this week, and the developers would like the problem to be a runaway test script that can simply be switched off.",
          "{{time.T+0|weekday|cap}} {{time.T+0|daypart}}, klockan {{time.T+0|clock}}. Molnteamet hos {{org.name}} öppnar ett larm om fakturering från {{supplier.cloud}}: kostnaderna i ert konto har tredubblats under helgen.\n\nDussintals stora beräkningsinstanser har körts i regioner ni aldrig använder. En stor release är planerad den här veckan, och utvecklarna hoppas att problemet är ett testskript som skenat och som bara kan stängas av."
        ]),
        injects: [
          inj("i1-1", 0, "ticket", "itOps", "high", "confirmed", [
            "Billing alert: spend running at {{num.billPerDay|currency}} per day. {{num.instances}} large compute instances started over the weekend in regions you don't use.",
            "Larm om fakturering: kostnaden ligger på {{num.billPerDay|currency}} per dag. {{num.instances}} stora beräkningsinstanser startades under helgen i regioner som ni inte använder."
          ], { headline: ["Cloud spend spike", "Kraftigt ökade molnkostnader"], tests: ["lo1"] }),
          inj("i1-2", 15, "logExcerpt", "itOps", "medium", "confirmed", [
            "The instances run mining software and were launched with a deployment user's access key, not by a person.",
            "Instanserna kör programvara för utvinning och startades med en åtkomstnyckel för en driftsättningsanvändare, inte av en person."
          ], { tests: ["lo1"] }),
          inj("i1-3", 30, "chat", "person.devLead", "low", "misleading", [
            "“Probably someone's test script gone wild. Kill the instances and let's get on with the release.”",
            "”Troligen någons testskript som har spårat ur. Döda instanserna så kan vi gå vidare med releasen.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Reasonable-sounding and wrong. Killing instances without revoking the key leaves the door open.", "Låter rimligt och är fel. Att döda instanserna utan att återkalla nyckeln lämnar dörren öppen."], tests: ["lo2"] })
        ],
        charts: [{
          id: "c1-spend", type: "line", markers: "injects",
          title: L(["Cloud spend per hour", "Molnkostnad per timme"]), unit: L(["per cent of normal", "procent av normalt"]),
          data: line(["Spend", "Kostnad"], -2880, 60, 240, (x, ctx) => (x < -1440 ? 95 + ctx.rng.int(0, 10) : 280 + ctx.rng.int(0, 60)))
        }],
        questions: {
          technical: [
            q("Which key launched the instances, and what else can it do?", "Vilken nyckel startade instanserna, och vad mer kan den göra?", ["cloudLead"]),
            q("Is killing the instances enough?", "Räcker det att döda instanserna?", ["cloudLead", "socLead"]),
            q("Which logs show the key's activity before the weekend?", "Vilka loggar visar nyckelns aktivitet före helgen?", ["socLead"])
          ],
          executive: [
            q("Is this a cost problem or a security incident?", "Är det här ett kostnadsproblem eller en säkerhetsincident?", ["cio", "ciso"]),
            q("Does today's release go ahead?", "Går dagens release vidare?", ["serviceOwner", "devLead"]),
            q("Who leads the response?", "Vem leder hanteringen?", ["incidentCommander"])
          ]
        },
        challenges: [ch("The deployment key is used by the release pipeline today.", "Driftsättningsnyckeln används av releasepipelinen i dag.")],
        decision: dec("d1", "cloudLead", ["What do you do first?", "Vad gör ni först?"], [
          ["Revoke the key, stop the instances, preserve logs and pause today's release.", "Återkalla nyckeln, stoppa instanserna, säkra loggarna och pausa dagens release."],
          ["Stop the instances and rotate the key after the release.", "Stoppa instanserna och byt nyckeln efter releasen."],
          ["Ask the provider to waive the bill and stop the instances.", "Be leverantören efterskänka fakturan och stoppa instanserna."]
        ], {
          knowns: [["A deployment key launched mining instances.", "En driftsättningsnyckel startade instanser för utvinning."]],
          uncertainties: [["How the key was obtained.", "Hur nyckeln kom på avvägar."]],
          tradeoffs: {
            operational: ["Revoking breaks the release pipeline today.", "En återkallelse slår ut releasepipelinen i dag."],
            security: ["A live key means a live attacker.", "En levande nyckel innebär en levande angripare."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["A delayed release is invisible next to a breach.", "En försenad release märks inte bredvid ett intrång."]
          },
          evaluation: [["Revokes the credential, not just the symptom", "Återkallar inloggningsuppgiften, inte bara symtomet"]]
        }),
        facilitator: fac(
          ["Mining is noisy and cheap. Push the group to ask what else the key allowed.", "Utvinning är bullrigt och billigt. Driv gruppen att fråga vad mer nyckeln gav tillgång till."],
          ["Key revoked, evidence kept and the release paused.", "Nyckeln återkallad, spåren kvar och releasen pausad."],
          [["Ask: what permissions does a deployment key have here?", "Fråga: vilka behörigheter har en driftsättningsnyckel här?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Published by mistake", "Publicerad av misstag"]),
        twist: L(["The keys were committed to a public code repository {{num.leakDays}} days ago.", "Nycklarna lades upp i ett öppet kodförråd för {{num.leakDays}} dagar sedan."]),
        twistKind: "cause",
        assumptionChallenged: L(["The key was stolen recently.", "Nyckeln stals nyligen."]),
        reveals: ["hf-keys"],
        narrative: L([
          "{{time.T+120|clock}}. The instances are stopped, and the team searches for the access key that launched them.\n\nThey expected to find it on a build server or in a colleague's laptop. A secret-scanning search turns it up somewhere else entirely, somewhere anyone in the world could have read it.",
          "Klockan {{time.T+120|clock}}. Instanserna är stoppade, och teamet letar efter åtkomstnyckeln som startade dem.\n\nDe räknade med att hitta den på en byggserver eller i en kollegas dator. En sökning efter hemligheter hittar den på ett helt annat ställe, ett ställe där vem som helst i världen kunde ha läst den."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "soc", "high", "confirmed", [
            "The key is in a configuration file in a public repository under a developer's personal account, pushed {{num.leakDays}} days ago. Cloud audit logs show it was first used from outside a day later.",
            "Nyckeln finns i en konfigurationsfil i ett öppet kodförråd under en utvecklares privata konto, publicerad för {{num.leakDays}} dagar sedan. Molnets granskningsloggar visar att den användes utifrån första gången en dag senare."
          ], { headline: ["Key found in a public repository", "Nyckel hittad i ett öppet kodförråd"], reveals: ["hf-keys"], tests: ["lo2"] }),
          inj("i2-2", 140, "chat", "person.devLead", "medium", "confirmed", [
            "“That's a fork of our deployment tooling. The developer meant to make it private. The key had admin on the build account.”",
            "”Det där är en kopia av våra driftsättningsverktyg. Utvecklaren tänkte göra den privat. Nyckeln hade administratörsrättigheter i byggkontot.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What did the key do in the {{num.leakDays}} days before the mining started?", "Vad gjorde nyckeln under de {{num.leakDays}} dagarna innan utvinningen började?", ["socLead", "cloudLead"]),
            q("Which other secrets are in that repository?", "Vilka andra hemligheter finns i det kodförrådet?", ["devLead"]),
            q("Did revoking the key early cut off anything still running?", "Bröt det tidiga återkallandet av nyckeln något som fortfarande pågick?", ["cloudLead"], "d1")
          ],
          executive: [
            q("How do you treat the developer?", "Hur bemöter ni utvecklaren?", ["devLead", "cio"]),
            q("Is the build account in scope of anything customers rely on?", "Omfattar byggkontot något som kunderna är beroende av?", ["serviceOwner", "ciso"]),
            q("Would you still have released today if you'd known this?", "Skulle ni fortfarande ha gjort releasen i dag om ni hade vetat det här?", ["serviceOwner"], "d1")
          ]
        },
        challenges: [ch("The key had admin rights on the account that builds your product.", "Nyckeln hade administratörsrättigheter i kontot som bygger er produkt.")],
        decision: dec("d2", "ciso", ["How do you scope the investigation?", "Hur avgränsar ni utredningen?"], [
          ["Review every action by the key since it leaked, starting with the build account.", "Granska varje åtgärd som nyckeln har gjort sedan läckan, med början i byggkontot."],
          ["Review the mining activity and close the repository.", "Granska utvinningen och stäng kodförrådet."],
          ["Close the repository and move on.", "Stäng kodförrådet och gå vidare."]
        ], {
          knowns: [["The key leaked {{num.leakDays}} days ago with admin rights.", "Nyckeln läckte för {{num.leakDays}} dagar sedan med administratörsrättigheter."]],
          uncertainties: [["What it was used for besides mining.", "Vad den användes till förutom utvinning."]],
          tradeoffs: {
            operational: ["A full review needs cloud and build experts.", "En fullständig granskning kräver experter på moln och byggen."],
            security: ["Admin on the build account means the product could be touched.", "Administratörsrättigheter i byggkontot betyder att produkten kan ha påverkats."],
            legal: ["Customers' contracts may require notice.", "Kundernas avtal kan kräva underrättelse."],
            reputational: ["A narrow review risks a later surprise.", "En snäv granskning riskerar en senare överraskning."]
          },
          evaluation: [["Scopes by what the key could reach, not what was noticed", "Avgränsar efter vad nyckeln kunde nå, inte efter vad som märktes"]]
        }),
        facilitator: fac(
          ["The cause is mundane. The scope is the point.", "Orsaken är vardaglig. Omfattningen är poängen."],
          ["A review driven by the key's reach, starting with builds.", "En granskning styrd av nyckelns räckvidd, med början i byggena."],
          [["Ask: what is the worst thing admin on the build account allows?", "Fråga: vad är det värsta som administratörsrättigheter i byggkontot tillåter?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 300,
        title: L(["A step nobody added", "Ett steg som ingen lade till"]),
        twist: L(["The pipeline has an extra build step that inserts a small loader. Signed releases containing it have shipped to customers.", "Pipelinen har ett extra byggsteg som infogar en liten laddare. Signerade versioner med den har levererats till kunder."]),
        twistKind: "scope",
        assumptionChallenged: L(["The attacker only used your cloud for mining.", "Angriparen använde bara ert moln för utvinning."]),
        reveals: ["hf-pipeline"],
        narrative: L([
          "{{time.T+300|clock}}. The key had administrator rights in the build account, so the development lead checks what else it could have touched.\n\nThey compare the pipeline definition running on the build server with the version stored in version control, step by step. The two should be identical.",
          "Klockan {{time.T+300|clock}}. Nyckeln hade administratörsrättigheter i byggkontot, så utvecklingschefen kontrollerar vad mer den kan ha rört.\n\nHen jämför pipelinedefinitionen som körs på byggservern med versionen i versionshanteringen, steg för steg. De två ska vara identiska."
        ]),
        injects: [
          inj("i3-1", 300, "forensicFinding", "person.devLead", "critical", "confirmed", [
            "On {{asset.buildServer}}, the pipeline runs a step that is not in version control. It adds a loader that contacts {{asset.c2Domain}}. {{num.releases}} signed releases since then contain it, installed by about {{num.customersOnRelease}} customers.",
            "På {{asset.buildServer}} kör pipelinen ett steg som inte finns i versionshanteringen. Det lägger till en laddare som kontaktar {{asset.c2Domain}}. {{num.releases}} signerade versioner sedan dess innehåller den, installerade hos ungefär {{num.customersOnRelease}} kunder."
          ], { headline: ["Tainted signed releases", "Manipulerade signerade versioner"], fallbackRole: "socLead", reveals: ["hf-pipeline"], tests: ["lo2", "lo3"] })
        ],
        charts: [{
          id: "c3-releases", type: "bar",
          title: L(["Customer installs per release", "Kundinstallationer per version"]), unit: L(["customers", "kunder"]),
          caption: L(["Oldest release first.", "Äldsta versionen först."]),
          data: (ctx) => {
            const n = ctx.vars.releases;
            const cats = Array.from({ length: n + 2 }, (_, i) => "R" + (i + 1));
            const per = Math.max(1, Math.round(ctx.vars.customersOnRelease / n));
            return { categories: cats, series: [
              { id: "clean", label: L(["Built before the change", "Byggd före ändringen"]), values: cats.map((_, i) => (i < 2 ? per + ctx.rng.int(0, per) : 0)) },
              { id: "tainted", label: L(["Contains the loader", "Innehåller laddaren"]), values: cats.map((_, i) => (i >= 2 ? per : 0)) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("What does the loader do on a customer system?", "Vad gör laddaren i ett kundsystem?", ["devLead", "socLead"]),
            q("Can you block {{asset.c2Domain}} for customers?", "Kan ni blockera {{asset.c2Domain}} för kunderna?", ["socLead"]),
            q("Did your review find this from the key's activity?", "Hittade er granskning det här genom nyckelns aktivitet?", ["socLead"], "d2")
          ],
          executive: [
            q("When and how do you tell customers?", "När och hur berättar ni för kunderna?", ["ceo", "comms"]),
            q("Do you pull the affected releases?", "Drar ni tillbaka de drabbade versionerna?", ["serviceOwner"]),
            q("Should the release pipeline have kept running this morning?", "Borde releasepipelinen ha fått fortsätta i morse?", ["cio"], "d1")
          ]
        },
        challenges: [ch("The releases are signed with your key; customers' tools trust them.", "Versionerna är signerade med er nyckel; kundernas verktyg litar på dem.")],
        decision: dec("d3", "ceo", ["How do you respond to customers?", "Hur agerar ni mot kunderna?"], [
          ["Notify customers today with indicators and guidance, withdraw the affected releases and stop all builds.", "Underrätta kunderna i dag med indikatorer och vägledning, dra tillbaka de drabbade versionerna och stoppa alla byggen."],
          ["Withdraw the releases and notify once the analysis is complete.", "Dra tillbaka versionerna och underrätta när analysen är klar."],
          ["Ship a clean release quietly and notify later.", "Leverera en ren version i tysthet och underrätta senare."]
        ], {
          knowns: [["Signed releases contain a loader.", "Signerade versioner innehåller en laddare."]],
          uncertainties: [["Whether the loader has been used at customers.", "Om laddaren har använts hos kunder."]],
          tradeoffs: {
            operational: ["Stopping builds halts all delivery.", "Att stoppa byggen stoppar all leverans."],
            security: ["Customers can only defend if they know.", "Kunderna kan bara försvara sig om de vet."],
            legal: ["Contracts and supply-chain rules may require prompt notice.", "Avtal och regler för leverantörskedjan kan kräva snabb underrättelse."],
            reputational: ["A quiet fix discovered later destroys trust.", "En tyst rättning som upptäcks senare förstör förtroendet."]
          },
          evaluation: [["Notifies customers promptly with actionable guidance", "Underrättar kunderna snabbt med användbar vägledning"]],
          minutes: 10
        }),
        facilitator: fac(
          ["You are now the supply-chain incident for your customers.", "Ni är nu leverantörskedjans incident för era kunder."],
          ["Prompt customer notice with indicators, withdrawal and a build freeze.", "Snabb underrättelse till kunderna med indikatorer, tillbakadragande och byggstopp."],
          [["Ask: what would you want to hear from your own vendor?", "Fråga: vad skulle ni vilja höra från er egen leverantör?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 600,
        title: L(["Can you trust your signature?", "Kan ni lita på er signatur?"]),
        twist: L(["The signing key was readable with the leaked keys. Every signature since the leak is in doubt.", "Signeringsnyckeln gick att läsa med de läckta nycklarna. Varje signatur sedan läckan är tveksam."]),
        twistKind: "impact",
        assumptionChallenged: L(["Releases signed outside the pipeline are safe.", "Versioner som signerats utanför pipelinen är säkra."]),
        reveals: ["hf-signing"],
        narrative: L([
          "{{time.T+600|clock}}. The question everyone has been avoiding: the releases are signed, and customers trust the signature. Who could read the signing key?\n\nThe cloud team checks the secret store and its access logs. The answer decides whether your signature still means anything.",
          "Klockan {{time.T+600|clock}}. Frågan som alla har undvikit: versionerna är signerade, och kunderna litar på signaturen. Vem kunde läsa signeringsnyckeln?\n\nMolnteamet kontrollerar hemlighetslagret och dess åtkomstloggar. Svaret avgör om er signatur fortfarande betyder något."
        ]),
        injects: [
          inj("i4-1", 600, "logExcerpt", "itOps", "critical", "confirmed", [
            "The signing key is stored in a secret store in the build account. The leaked key read it {{num.leakDays}} days ago. Anything could have been signed since.",
            "Signeringsnyckeln förvaras i ett hemlighetsvalv i byggkontot. Den läckta nyckeln läste den för {{num.leakDays}} dagar sedan. Vad som helst kan ha signerats sedan dess."
          ], { headline: ["Signing key exposed", "Signeringsnyckeln exponerad"], reveals: ["hf-signing"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you revoke the signing key without breaking every customer?", "Hur återkallar ni signeringsnyckeln utan att slå ut varje kund?", ["devLead", "cloudLead"]),
            q("How do customers tell a genuine new release from a forged one?", "Hur skiljer kunderna en äkta ny version från en förfalskad?", ["devLead"]),
            q("Did your customer notice cover forged releases as well?", "Omfattade er underrättelse till kunderna även förfalskade versioner?", ["devLead"], "d3")
          ],
          executive: [
            q("What do you tell customers about the signature they rely on?", "Vad säger ni till kunderna om signaturen de förlitar sig på?", ["ceo", "comms"]),
            q("Who decides to revoke, given the disruption?", "Vem beslutar om återkallelse, med tanke på störningarna?", ["cio", "ceo"]),
            q("Was stopping all builds the right call?", "Var det rätt att stoppa alla byggen?", ["cio"], "d3")
          ]
        },
        challenges: [ch("Revoking the key makes every installed version fail its update checks.", "En återkallelse av nyckeln gör att alla installerade versioner misslyckas med sina uppdateringskontroller.")],
        decision: dec("d4", "cio", ["What do you do with the signing key?", "Vad gör ni med signeringsnyckeln?"], [
          ["Revoke it, issue a new key from offline hardware and publish how customers verify the change.", "Återkalla den, utfärda en ny nyckel från frånkopplad hårdvara och publicera hur kunderna kontrollerar bytet."],
          ["Keep the key and publish hashes of known-good releases.", "Behåll nyckeln och publicera kontrollsummor för kända goda versioner."],
          ["Revoke it once the new pipeline is ready.", "Återkalla den när den nya pipelinen är klar."]
        ], {
          knowns: [["The signing key was read by the attacker.", "Signeringsnyckeln har lästs av angriparen."]],
          uncertainties: [["Whether forged releases exist outside your channels.", "Om förfalskade versioner finns utanför era kanaler."]],
          tradeoffs: {
            operational: ["Revocation breaks updates for everyone.", "En återkallelse bryter uppdateringarna för alla."],
            security: ["A compromised signing key is worse than none.", "En komprometterad signeringsnyckel är värre än ingen alls."],
            legal: ["Customers relied on the signature in their own controls.", "Kunderna förlitade sig på signaturen i sina egna kontroller."],
            reputational: ["Keeping a known-bad key is hard to defend.", "Att behålla en känd dålig nyckel är svårt att försvara."]
          },
          evaluation: [["Revokes the compromised key promptly", "Återkallar den komprometterade nyckeln snabbt"]]
        }),
        facilitator: fac(
          ["Trust is now the product. Make them feel the cost of revocation.", "Förtroendet är nu produkten. Låt dem känna kostnaden för en återkallelse."],
          ["Key revoked, new hardware-backed key and clear customer guidance.", "Nyckeln återkallad, ny hårdvaruskyddad nyckel och tydlig vägledning till kunderna."],
          [["Ask: where should a signing key live?", "Fråga: var bör en signeringsnyckel förvaras?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1440,
        title: L(["Show us", "Visa oss"]),
        twist: L(["A major customer suspends your contract until you prove which releases are clean — and their regulator is asking them.", "En stor kund pausar ert avtal tills ni bevisar vilka versioner som är rena – och deras tillsynsmyndighet frågar dem."]),
        twistKind: "authority",
        assumptionChallenged: L(["We decide when our product is safe again.", "Vi bestämmer när vår produkt är säker igen."]),
        narrative: L([
          "The next day. Customers have read your security notice, and the account managers' phones have not stopped ringing.\n\nMost customers want reassurance. One of the largest wants something else: proof, in writing, of exactly which releases can be trusted, and their own regulator is asking them the same question.",
          "Nästa dag. Kunderna har läst ert säkerhetsmeddelande, och kundansvarigas telefoner har inte slutat ringa.\n\nDe flesta kunder vill bli lugnade. En av de största vill ha något annat: bevis, skriftligt, för exakt vilka versioner som går att lita på, och deras egen tillsynsmyndighet ställer samma fråga till dem."
        ]),
        injects: [
          inj("i5-1", 1440, "email", "customer", "high", "confirmed", [
            "“We are suspending use of your product. Before we resume we need a list of every component in each release, build records and an independent assessment. Our supervisor has asked for our plan.”",
            "”Vi pausar användningen av er produkt. Innan vi återupptar behöver vi en lista över varje komponent i varje version, byggprotokoll och en oberoende bedömning. Vår tillsynsmyndighet har bett om vår plan.”"
          ], { pressure: "customers", substitute: { source: "management", content: ["Sales reports that several customers are pausing renewals until you can show which releases are clean.", "Försäljning rapporterar att flera kunder pausar förnyelser tills ni kan visa vilka versioner som är rena."] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Can you produce component lists and build records for each release?", "Kan ni ta fram komponentlistor och byggprotokoll för varje version?", ["devLead"]),
            q("Can you rebuild the clean releases and get identical output?", "Kan ni bygga om de rena versionerna och få identiskt resultat?", ["devLead"]),
            q("Does your new signing key help customers verify?", "Hjälper er nya signeringsnyckel kunderna att kontrollera?", ["devLead"], "d4")
          ],
          executive: [
            q("Do you accept an independent assessment?", "Godtar ni en oberoende bedömning?", ["ceo", "ciso"]),
            q("What does the suspension cost, and who negotiates?", "Vad kostar pausen, och vem förhandlar?", ["ceo", "legal"]),
            q("Did your notice help or hurt this relationship?", "Hjälpte eller stjälpte er underrättelse den här relationen?", ["comms"], "d3")
          ]
        },
        challenges: [ch("You have no build records for releases older than three months.", "Ni har inga byggprotokoll för versioner som är äldre än tre månader.")],
        decision: dec("d5", "ceo", ["How do you answer the customer?", "Hur svarar ni kunden?"], [
          ["Commission an independent assessment, share component lists and a dated plan.", "Beställ en oberoende bedömning, dela komponentlistor och en daterad plan."],
          ["Share what you have and ask them to resume.", "Dela det ni har och be dem återuppta."],
          ["Offer a discount instead of an assessment.", "Erbjud rabatt i stället för en bedömning."]
        ], {
          knowns: [["A key customer has paused.", "En nyckelkund har pausat."]],
          uncertainties: [["How many will follow.", "Hur många som kommer att följa efter."]],
          tradeoffs: {
            operational: ["Producing evidence takes developers off the rebuild.", "Att ta fram bevis tar utvecklare från återuppbyggnaden."],
            security: ["Independent review may find more.", "En oberoende granskning kan hitta mer."],
            legal: ["Contract terms may favour the customer.", "Avtalsvillkoren kan gynna kunden."],
            reputational: ["Evidence restores trust; discounts don't.", "Bevis återställer förtroendet; rabatter gör det inte."]
          },
          evaluation: [["Offers evidence and independent review", "Erbjuder bevis och oberoende granskning"]]
        }),
        facilitator: fac(
          ["Customers now set the terms. Watch for defensiveness.", "Kunderna sätter nu villkoren. Se upp med försvarsinställning."],
          ["Independent assessment and transparent evidence.", "Oberoende bedömning och öppna bevis."],
          [["Ask: what evidence could you produce today?", "Fråga: vilka bevis skulle ni kunna ta fram i dag?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 2160,
        title: L(["Also on the public registry", "Även i det öppna registret"]),
        twist: L(["A tainted version of your open-source library was published to a public package registry and downloaded {{num.downloads}} times.", "En manipulerad version av ert bibliotek med öppen källkod publicerades i ett öppet paketregister och laddades ned {{num.downloads}} gånger."]),
        twistKind: "scope",
        assumptionChallenged: L(["Only your paying customers are affected.", "Bara era betalande kunder är drabbade."]),
        reveals: ["hf-registry"],
        narrative: L([
          "The day after. The team is still working through the customer releases when a security researcher gets in touch.\n\nYour organisation also publishes an open-source library, used by thousands of developers who are not your customers and have never heard of this incident.",
          "Dagen därpå. Teamet arbetar fortfarande med kundversionerna när en säkerhetsforskare hör av sig.\n\nEr organisation publicerar också ett bibliotek med öppen källkod, som används av tusentals utvecklare som inte är era kunder och aldrig har hört talas om den här incidenten."
        ]),
        injects: [
          inj("i6-1", 2160, "threatIntel", "threatIntel", "high", "confirmed", [
            "A researcher: “Your library's latest version on the public registry contacts {{asset.c2Domain}}. It has {{num.downloads}} downloads. It was published with your organisation's token.”",
            "En forskare: ”Den senaste versionen av ert bibliotek i det öppna registret kontaktar {{asset.c2Domain}}. Den har laddats ned {{num.downloads}} gånger. Den publicerades med er organisations token.”"
          ], { reveals: ["hf-registry"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you get the package removed and warn its users?", "Hur får ni paketet borttaget och varnar dess användare?", ["devLead"]),
            q("Which other tokens did the build account hold?", "Vilka andra token fanns i byggkontot?", ["cloudLead", "devLead"]),
            q("Did your review of the key's activity miss this?", "Missade er granskning av nyckelns aktivitet det här?", ["socLead"], "d2")
          ],
          executive: [
            q("Who do you owe a warning to when you don't know the users?", "Vem är ni skyldiga en varning när ni inte känner användarna?", ["ceo", "legal"]),
            q("Do you work with the researcher publicly?", "Samarbetar ni öppet med forskaren?", ["comms", "ciso"]),
            q("Does this change your answer to the suspended customer?", "Ändrar det här ert svar till kunden som har pausat?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("You have no idea who the downloaders are.", "Ni har ingen aning om vilka som har laddat ned det.")],
        decision: dec("d6", "ciso", ["How do you handle the public package?", "Hur hanterar ni det öppna paketet?"], [
          ["Yank the version, publish an advisory with indicators and credit the researcher.", "Dra tillbaka versionen, publicera en säkerhetsbulletin med indikatorer och ge forskaren erkännande."],
          ["Yank the version quietly.", "Dra tillbaka versionen i tysthet."],
          ["Publish a fixed version on top.", "Publicera en rättad version ovanpå."]
        ], {
          knowns: [["A tainted package is public.", "Ett manipulerat paket är öppet tillgängligt."]],
          uncertainties: [["Who installed it.", "Vilka som har installerat det."]],
          tradeoffs: {
            operational: ["An advisory brings more questions.", "En säkerhetsbulletin för med sig fler frågor."],
            security: ["Only a public advisory reaches unknown users.", "Bara en öppen säkerhetsbulletin når okända användare."],
            legal: ["Silence may be seen as concealment.", "Tystnad kan ses som döljande."],
            reputational: ["Open-source communities reward openness.", "Öppen källkod-communityn belönar öppenhet."]
          },
          evaluation: [["Warns unknown users through a public advisory", "Varnar okända användare genom en öppen säkerhetsbulletin"]]
        }),
        facilitator: fac(
          ["The blast radius now includes strangers.", "Spridningsområdet omfattar nu främlingar."],
          ["Version pulled and a public advisory crediting the researcher.", "Versionen tillbakadragen och en öppen säkerhetsbulletin som ger forskaren erkännande."],
          [["Ask: who is your audience if you don't know your users?", "Fråga: vilka är er publik om ni inte känner era användare?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 4320,
        title: L(["Rebuilding the factory", "Att bygga om fabriken"]),
        twist: L(["A critical security fix must ship this week, but there is no build system you can trust yet.", "En kritisk säkerhetsrättning måste levereras den här veckan, men det finns ännu inget byggsystem ni kan lita på."]),
        twistKind: "impact",
        assumptionChallenged: L(["We can freeze releases until the rebuild is done.", "Vi kan frysa releaser tills återuppbyggnaden är klar."]),
        narrative: L([
          "Three days later. The old build environment has been shut down and a clean one is being built from scratch, slowly and carefully.\n\nThen an advisory lands that cannot wait for the rebuild: a component you ship has a critical vulnerability that attackers are already using.",
          "Tre dagar senare. Den gamla byggmiljön har stängts ned och en ren byggs upp från grunden, långsamt och noggrant.\n\nSedan kommer en varning som inte kan vänta på ombyggnaden: en komponent ni levererar har en kritisk sårbarhet som angripare redan utnyttjar."
        ]),
        injects: [
          inj("i7-1", 4320, "advisory", "vendor", "high", "confirmed", [
            "A component you ship has a critical vulnerability under active exploitation. Customers expect a patched release within days.",
            "En komponent som ni levererar har en kritisk sårbarhet som utnyttjas aktivt. Kunderna förväntar sig en rättad version inom några dagar."
          ], { tests: ["lo4"] })
        ],
        charts: [{
          id: "c7-timeline", type: "timeline",
          title: L(["The road back to a trusted build", "Vägen tillbaka till ett pålitligt bygge"]),
          data: () => ({ events: [
            { at: 0, kind: "decision", label: L(["Key revoked", "Nyckeln återkallad"]) },
            { at: 600, kind: "decision", label: L(["Signing key replaced", "Signeringsnyckeln utbytt"]) },
            { at: 2880, kind: "decision", label: L(["Clean build environment", "Ren byggmiljö"]) },
            { at: 5760, kind: "decision", label: L(["Reproducible builds verified", "Reproducerbara byggen kontrollerade"]) },
            { at: 8640, kind: "decision", label: L(["Independent assessment", "Oberoende bedömning"]) }
          ] })
        }],
        questions: {
          technical: [
            q("What is the minimum trusted path to build one release safely?", "Vilken är den minsta pålitliga vägen för att bygga en version säkert?", ["devLead"]),
            q("How do you prove that release is clean?", "Hur bevisar ni att den versionen är ren?", ["devLead", "ciso"]),
            q("Does your new key handling support an emergency release?", "Stödjer er nya nyckelhantering en nödrelease?", ["devLead"], "d4")
          ],
          executive: [
            q("Is shipping a fix from a half-rebuilt system acceptable?", "Är det acceptabelt att leverera en rättning från ett halvt återuppbyggt system?", ["cio", "ceo"]),
            q("What do you tell customers about the timing?", "Vad säger ni till kunderna om tidsplanen?", ["comms"]),
            q("Does the independent assessment need to approve this release?", "Behöver den oberoende bedömningen godkänna den här versionen?", ["ciso"], "d5")
          ]
        },
        challenges: [ch("The vulnerability is being exploited at customers now.", "Sårbarheten utnyttjas hos kunderna just nu.")],
        decision: dec("d7", "cio", ["How do you ship the fix?", "Hur levererar ni rättningen?"], [
          ["Build it on an isolated, freshly built machine with two-person review and publish the build record.", "Bygg den på en isolerad, nyinstallerad maskin med granskning av två personer och publicera byggprotokollet."],
          ["Wait until the full rebuild is done.", "Vänta tills hela återuppbyggnaden är klar."],
          ["Give customers a workaround instead of a release.", "Ge kunderna en tillfällig lösning i stället för en version."]
        ], {
          knowns: [["Customers are exposed to the vulnerability now.", "Kunderna är exponerade för sårbarheten nu."]],
          uncertainties: [["Whether the minimal path is truly clean.", "Om den minimala vägen verkligen är ren."]],
          tradeoffs: {
            operational: ["A manual build is slow and error-prone.", "Ett manuellt bygge är långsamt och felbenäget."],
            security: ["Waiting leaves customers exposed to a known flaw.", "Att vänta lämnar kunderna exponerade för en känd brist."],
            legal: ["Contracts may require timely security fixes.", "Avtalen kan kräva säkerhetsrättningar i tid."],
            reputational: ["A transparent emergency build shows maturity.", "Ett öppet redovisat nödbygge visar mognad."]
          },
          evaluation: [["Balances exposure with build trust", "Väger exponering mot förtroende för bygget"]]
        }),
        facilitator: fac(
          ["Two risks collide. There is no zero-risk option.", "Två risker krockar. Det finns inget alternativ utan risk."],
          ["A minimal, reviewed and documented emergency build.", "Ett minimalt, granskat och dokumenterat nödbygge."],
          [["Ask: what makes a build trustworthy, concretely?", "Fråga: vad gör konkret ett bygge pålitligt?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 10080,
        title: L(["Secrets as a habit", "Hemligheter som vana"]),
        twist: L(["A scan finds dozens more long-lived keys across your repositories; three are already public.", "En genomsökning hittar dussintals fler långlivade nycklar i era kodförråd; tre är redan öppna."]),
        twistKind: "impact",
        assumptionChallenged: L(["This was one developer's mistake.", "Det här var en enskild utvecklares misstag."]),
        narrative: L([
          "A week later. The organisation-wide secret scan, started on the first day, has finished.\n\nThe leaked key was supposed to be an unlucky one-off. The results show whether it was a mistake or a habit, and how many other doors are standing open.",
          "En vecka senare. Den organisationsövergripande sökningen efter hemligheter, som startades första dagen, är klar.\n\nDen läckta nyckeln skulle vara ett enstaka olyckligt misstag. Resultatet visar om det var ett misstag eller en vana, och hur många andra dörrar som står öppna."
        ]),
        injects: [
          inj("i8-1", 10080, "impactReport", "soc", "medium", "confirmed", [
            "Across all repositories: 46 long-lived cloud and registry keys, three of them in public repositories. Most belong to automation nobody remembers creating.",
            "I alla kodförråd: 46 långlivade nycklar för moln och register, tre av dem i öppna kodförråd. De flesta tillhör automatiseringar som ingen minns att de har skapat."
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you replace long-lived keys with short-lived credentials?", "Hur ersätter ni långlivade nycklar med kortlivade inloggningsuppgifter?", ["cloudLead", "devLead"]),
            q("Where in the workflow should secret scanning block a push?", "Var i arbetsflödet bör genomsökningen efter hemligheter blockera en publicering?", ["devLead"]),
            q("Did the emergency-build process hold up?", "Höll processen för nödbygget?", ["devLead"], "d7")
          ],
          executive: [
            q("Who owns build and release security from now on?", "Vem äger säkerheten för byggen och releaser framöver?", ["cio", "ciso"]),
            q("How do you change habits without blame?", "Hur ändrar ni vanor utan att skuldbelägga?", ["devLead", "cio"]),
            q("Which first-morning decision would you most like to have made differently?", "Vilket beslut från den första morgonen skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Developers say the controls slow them down.", "Utvecklarna säger att kontrollerna gör dem långsammare.")],
        decision: dec("d8", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["Short-lived credentials, blocking secret scans, hardware-backed signing and a named owner for the build chain.", "Kortlivade inloggningsuppgifter, blockerande genomsökning efter hemligheter, hårdvaruskyddad signering och en utsedd ägare för byggkedjan."],
          ["Rotate all keys and add scanning reports.", "Byt alla nycklar och lägg till rapporter från genomsökningen."],
          ["Training for developers.", "Utbildning för utvecklare."]
        ], {
          knowns: [["Long-lived keys are everywhere.", "Långlivade nycklar finns överallt."]],
          uncertainties: [["How much this will slow development.", "Hur mycket det här kommer att bromsa utvecklingen."]],
          tradeoffs: {
            operational: ["Blocking scans will stop some pushes.", "Blockerande genomsökningar kommer att stoppa vissa publiceringar."],
            security: ["Rotation alone just resets the clock.", "Att bara byta nycklar nollställer bara klockan."],
            legal: ["Customers may now require evidence of build security.", "Kunderna kan nu kräva bevis på säkra byggen."],
            reputational: ["Visible change helps win customers back.", "Synlig förändring hjälper till att vinna tillbaka kunder."]
          },
          evaluation: [["Removes the class of problem, not one instance", "Tar bort hela problemtypen, inte en enskild förekomst"]]
        }),
        facilitator: fac(
          ["Close on systemic fixes and ownership.", "Avsluta med systemåtgärder och ägarskap."],
          ["Short-lived credentials, blocking scans and a named build-chain owner.", "Kortlivade inloggningsuppgifter, blockerande genomsökningar och en utsedd ägare för byggkedjan."],
          [["Ask: how long would a leaked key be useful to an attacker after these changes?", "Fråga: hur länge skulle en läckt nyckel vara användbar för en angripare efter de här ändringarna?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The tainted releases are withdrawn, the signing key replaced and the build chain rebuilt — but some customers remain sceptical and unknown users of the public package may never hear.",
        "De manipulerade versionerna dras tillbaka, signeringsnyckeln byts ut och byggkedjan byggs om – men vissa kunder är fortfarande skeptiska och okända användare av det öppna paketet får kanske aldrig veta."
      ])
    },

    debrief: {
      keyLessons: [
        L(["The noisy impact is rarely the only impact; ask what else access allowed.", "Den bullriga påverkan är sällan den enda; fråga vad mer åtkomsten möjliggjorde."]),
        L(["Your build pipeline is part of your customers' attack surface.", "Er byggpipeline är en del av era kunders angreppsyta."]),
        L(["A signing key is only as trustworthy as where it is stored.", "En signeringsnyckel är bara så pålitlig som platsen där den förvaras."]),
        L(["Long-lived secrets are a habit to break, not a one-off mistake.", "Långlivade hemligheter är en vana att bryta, inte ett enstaka misstag."])
      ],
      assumptionsVsReality: [
        avr(["The key was stolen recently.", "Nyckeln stals nyligen."], ["It had been public for weeks.", "Den hade varit öppen i flera veckor."], "p2"),
        avr(["Only mining.", "Bara utvinning."], ["Signed releases were tainted.", "Signerade versioner var manipulerade."], "p3"),
        avr(["The signature proves integrity.", "Signaturen bevisar integriteten."], ["The signing key was exposed.", "Signeringsnyckeln var exponerad."], "p4")
      ],
      strengthsToLookFor: [
        L(["Revoking the key, not just stopping instances", "Att återkalla nyckeln, inte bara stoppa instanserna"]),
        L(["Prompt, actionable customer notice", "Snabb och användbar underrättelse till kunderna"]),
        L(["Willingness to revoke the signing key", "Villighet att återkalla signeringsnyckeln"])
      ],
      commonGaps: [
        L(["Treating it as a cost problem", "Att behandla det som ett kostnadsproblem"]),
        L(["Quiet fixes to customers", "Tysta rättningar till kunderna"]),
        L(["Forgetting public packages", "Att glömma öppna paket"])
      ],
      suggestedActions: [
        act(["Replace long-lived keys with short-lived, scoped credentials.", "Ersätt långlivade nycklar med kortlivade, avgränsade inloggningsuppgifter."], "cloudLead", "high"),
        act(["Block pushes that contain secrets.", "Blockera publiceringar som innehåller hemligheter."], "devLead", "high"),
        act(["Keep signing keys in hardware, outside the build account.", "Förvara signeringsnycklar i hårdvara, utanför byggkontot."], "devLead", "high"),
        act(["Produce component lists and build records for every release.", "Ta fram komponentlistor och byggprotokoll för varje version."], "devLead", "medium"),
        act(["Name an owner for build and release security.", "Utse en ägare för säkerheten i byggen och releaser."], "cio", "medium")
      ]
    }
  });
})();
