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
  const { L, q, ch, inj, dec, fac, act, avr, line, pb, ir, io } = BK.scenarios.h;

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
          evaluation: [["Revokes the credential, not just the symptom", "Återkallar inloggningsuppgiften, inte bara symtomet"]],
          pushback: {
            A: [
              pb(["Revoking breaks more", "Återkallelsen slår ut mer"], ["Nobody had a list of what used the key. Within minutes, two nightly jobs and a customer-facing deployment fail, and the service owner asks for the key back “for one hour”. Do you restore a key someone is abusing, or let those systems stay broken?", "Ingen hade en lista över vad som använde nyckeln. Inom några minuter fallerar två nattliga jobb och en kundnära driftsättning, och tjänsteägaren ber att få tillbaka nyckeln ”i en timme”. Återställer ni en nyckel som någon missbrukar, eller låter ni systemen förbli trasiga?"]),
              pb(["“It's a billing problem”", "”Det är ett faktureringsproblem”"], ["The development lead is furious: a week of release work stopped because of a mining bill, and the customer waiting for it is already calling. “Kill the instances and ship.” Do you hold the pause on the strength of a bill, and how do you explain it to the customer?", "Utvecklingschefen är rasande: en veckas releasearbete stoppat på grund av en faktura för utvinning, och kunden som väntar ringer redan. ”Döda instanserna och leverera.” Håller ni fast vid pausen med en faktura som enda grund, och hur förklarar ni det för kunden?"]),
              pb(["Nothing else in the logs", "Inget annat i loggarna"], ["The first look at the logs shows the key launching instances and nothing more yet: no data access, no logins. The release pause has no end date. Is it proportionate to what you actually know, and what would make you lift it?", "En första genomgång av loggarna visar att nyckeln startade instanser och ingenting mer än så länge: ingen dataåtkomst, inga inloggningar. Releasepausen har inget slutdatum. Är den proportionerlig mot vad ni faktiskt vet, och vad skulle få er att häva den?"])
            ],
            B: [
              pb(["The instances come back", "Instanserna kommer tillbaka"], ["Twenty minutes after you stopped them, new mining instances start in another region, launched with the same key. Do you revoke now and break the release, or keep stopping instances by hand until it ships?", "Tjugo minuter efter att ni stoppade dem startar nya instanser för utvinning i en annan region, med samma nyckel. Återkallar ni nu och slår ut releasen, eller fortsätter ni stoppa instanser för hand tills den är levererad?"]),
              pb(["Someone else holds it", "Någon annan har den"], ["Until you rotate, whoever has the key has the same access your pipeline has, all day, while you release through it. Can you say who that is, or what they can reach, before you ship?", "Tills ni byter nyckel har den som har nyckeln samma åtkomst som er pipeline, hela dagen, medan ni gör releasen genom den. Kan ni säga vem det är, eller vad de kan nå, innan ni levererar?"]),
              pb(["Put the delay in writing", "Skriv ned förseningen"], ["The CISO says a live key with an unknown holder is a security incident, not a cost issue, and asks the cloud lead to record in writing that rotation was deferred for the release. Do you sign it?", "CISO säger att en aktiv nyckel med okänd innehavare är en säkerhetsincident, inte en kostnadsfråga, och ber molnansvarig att skriftligen dokumentera att bytet sköts upp för releasens skull. Skriver ni under?"])
            ],
            C: [
              pb(["The provider asks back", "Leverantören frågar tillbaka"], ["{{supplier.cloud}} support says a waiver needs a short security report: how the key was compromised and confirmation that it has been revoked. You can answer neither. Do you revoke now to get the money back, and what does that say about why you didn't?", "Supporten hos {{supplier.cloud}} säger att en efterskänkning kräver en kort säkerhetsrapport: hur nyckeln komprometterades och en bekräftelse på att den är återkallad. Ni kan inte svara på någotdera. Återkallar ni nu för att få pengarna tillbaka, och vad säger det om varför ni inte gjorde det?"]),
              pb(["The bill climbs tonight", "Fakturan stiger i natt"], ["By evening, spend is rising again: new instances, same key, a different region. The waiver request covers the weekend, not tonight. Who is watching the account overnight, and who pays for what happens before morning?", "Till kvällen stiger kostnaderna igen: nya instanser, samma nyckel, en annan region. Begäran om efterskänkning gäller helgen, inte i natt. Vem bevakar kontot under natten, och vem betalar för det som händer före morgonen?"]),
              pb(["Finance owns a security incident", "Ekonomi äger en säkerhetsincident"], ["The CIO notices that the case now sits with finance as a refund, and asks who is checking what else the deployment key touched over the weekend. Nobody is. Who owns the security question, and why wasn't it assigned?", "CIO märker att ärendet nu ligger hos ekonomi som en återbetalning, och frågar vem som kontrollerar vad mer driftsättningsnyckeln rörde under helgen. Ingen gör det. Vem äger säkerhetsfrågan, och varför tilldelades den inte?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The key is revoked", "Nyckeln är återkallad"], [
              io(["The spend flattens", "Kostnaden planar ut"], ["No new instances start after the revocation, and the hourly spend falls back towards normal. The cloud team calls it contained.", "Inga nya instanser startar efter återkallelsen, och kostnaden per timme sjunker tillbaka mot det normala. Molnteamet kallar det begränsat."], ["No new instances have started since the key was revoked.", "Inga nya instanser har startat sedan nyckeln återkallades."]),
              io(["A deployment fails", "En driftsättning fallerar"], ["Minutes after the revocation, a customer-facing deployment that used the same key fails halfway. The customer whose go-live is today is already on the phone to the service owner.", "Några minuter efter återkallelsen fallerar en kundnära driftsättning som använde samma nyckel halvvägs. Kunden som ska gå live i dag ringer redan tjänsteägaren."], ["A customer-facing deployment failed when the key was revoked.", "En kundnära driftsättning fallerade när nyckeln återkallades."], { reopen: true, meters: { trust: -1 } }),
              io(["Logs with gaps", "Loggar med luckor"], ["The audit logs are preserved, but instance-level logging was never switched on in the regions you do not use. What ran inside the mining instances is only partly visible.", "Granskningsloggarna är säkrade, men loggning på instansnivå slogs aldrig på i de regioner ni inte använder. Vad som kördes i utvinningsinstanserna syns bara delvis."], ["Instance-level logs in the unused regions were never switched on.", "Loggar på instansnivå i de oanvända regionerna var aldrig påslagna."])
            ]),
            ir("i2", { notChosen: "A" }, ["The key stays live", "Nyckeln förblir aktiv"], [
              io(["The instances return", "Instanserna kommer tillbaka"], ["Half an hour after the instances were stopped, new ones start in another region, launched with the same deployment key. The bill is climbing again.", "En halvtimme efter att instanserna stoppades startar nya i en annan region, med samma driftsättningsnyckel. Fakturan stiger igen."], ["New mining instances started with the same key after the first were stopped.", "Nya utvinningsinstanser startade med samma nyckel efter att de första stoppats."], { reopen: true }),
              io(["The release ships", "Releasen levereras"], ["Today's release goes out on schedule through the pipeline, and the waiting customer sends thanks. The development lead says the morning proved it was a cost problem.", "Dagens release går ut enligt plan genom pipelinen, och kunden som väntade tackar. Utvecklingschefen säger att förmiddagen visade att det var ett kostnadsproblem."], ["Today's release has shipped on schedule.", "Dagens release har levererats enligt plan."]),
              io(["The provider flags it", "Leverantören flaggar"], ["{{supplier.cloud}} emails: the deployment key shows signs of being compromised, and they ask you to confirm that you are aware and acting. They do not say what they saw.", "{{supplier.cloud}} mejlar: driftsättningsnyckeln visar tecken på att vara komprometterad, och de ber er bekräfta att ni känner till det och agerar. De säger inte vad de har sett."], ["{{supplier.cloud}} has flagged the deployment key as possibly compromised.", "{{supplier.cloud}} har flaggat driftsättningsnyckeln som möjligen komprometterad."])
            ])
          ]
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
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because today's release was paused, a customer's planned go-live slipped, and their project manager has escalated to your CEO.", sv: "Eftersom dagens release pausades sköts en kunds planerade driftstart upp, och deras projektledare har gått direkt till er vd." } }
        ],
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
          ["Close the repository and review only the last week of the key's activity, where the bill shows use.", "Stäng kodförrådet och granska bara nyckelns senaste vecka, där fakturan visar användning."]
        ], {
          knowns: [["The key leaked {{num.leakDays}} days ago with admin rights.", "Nyckeln läckte för {{num.leakDays}} dagar sedan med administratörsrättigheter."]],
          uncertainties: [["What it was used for besides mining.", "Vad den användes till förutom utvinning."]],
          tradeoffs: {
            operational: ["A full review needs cloud and build experts.", "En fullständig granskning kräver experter på moln och byggen."],
            security: ["Admin on the build account means the product could be touched.", "Administratörsrättigheter i byggkontot betyder att produkten kan ha påverkats."],
            legal: ["Customers' contracts may require notice.", "Kundernas avtal kan kräva underrättelse."],
            reputational: ["A narrow review risks a later surprise.", "En snäv granskning riskerar en senare överraskning."]
          },
          evaluation: [["Scopes by what the key could reach, not what was noticed", "Avgränsar efter vad nyckeln kunde nå, inte efter vad som märktes"]],
          pushback: {
            A: [
              pb(["Weeks of admin activity", "Veckor av administratörsaktivitet"], ["{{num.leakDays}} days of admin activity on the build account is thousands of events. The team estimates days of work for two people who are also needed to get releases moving again. What do you cut, and who decides which events matter?", "{{num.leakDays}} dagar av administratörsaktivitet i byggkontot är tusentals händelser. Teamet bedömer att det är flera dagars arbete för två personer som också behövs för att få igång releaserna igen. Vad stryker ni, och vem avgör vilka händelser som spelar roll?"]),
              pb(["“Give me a date”", "”Ge mig ett datum”"], ["The service owner needs a date for customers, and the full review has none. Sales says two customers are waiting on this release. Do you promise a date before you know what the review will find?", "Tjänsteägaren behöver ett datum till kunderna, och den fullständiga granskningen har inget. Försäljning säger att två kunder väntar på den här releasen. Lovar ni ett datum innan ni vet vad granskningen kommer att hitta?"]),
              pb(["The developer wants to help", "Utvecklaren vill hjälpa till"], ["The developer whose repository leaked the key offers to help with the review: they know the deployment tooling better than anyone. Others are uneasy. Do you let the person behind the leak into the investigation, and on what terms?", "Utvecklaren vars kodförråd läckte nyckeln erbjuder sig att hjälpa till med granskningen: hen kan driftsättningsverktygen bättre än någon annan. Andra är obekväma. Släpper ni in personen bakom läckan i utredningen, och på vilka villkor?"])
            ],
            B: [
              pb(["Closed is not unpublished", "Stängt är inte opublicerat"], ["The repository is closed, but a code search site still shows the file, and the repository had been forked before you closed it. Closing it does nothing about copies already taken. What did closing actually achieve?", "Kodförrådet är stängt, men en kodsökningstjänst visar fortfarande filen, och förrådet hade kopierats innan ni stängde det. Att stänga det påverkar inte kopior som redan tagits. Vad uppnådde stängningen egentligen?"]),
              pb(["Admin, not just mining", "Administratör, inte bara utvinning"], ["The development lead repeats it in the channel: the key had admin on the build account. Your review covers mining in a few regions, and nobody is looking at the build side. Who decided mining was the whole scope?", "Utvecklingschefen upprepar det i kanalen: nyckeln hade administratörsrättigheter i byggkontot. Er granskning omfattar utvinningen i några regioner, och ingen tittar på byggsidan. Vem bestämde att utvinningen var hela omfattningen?"]),
              pb(["The quiet weeks", "De tysta veckorna"], ["The audit log shows the key was first used from outside a day after it leaked, but mining only began this weekend. Your review starts with the mining. What was the key doing in between, and why isn't that in scope?", "Granskningsloggen visar att nyckeln användes utifrån första gången en dag efter läckan, men utvinningen började först i helgen. Er granskning börjar med utvinningen. Vad gjorde nyckeln däremellan, och varför ingår det inte?"])
            ],
            C: [
              pb(["One week of many", "En vecka av många"], ["The key was first used from outside a day after the push, {{num.leakDays}} days ago. Your review covers the last seven. Nobody is looking at the rest, when the key was in use and quiet. Why is the bill the right guide to where an attacker was?", "Nyckeln användes utifrån första gången en dag efter publiceringen, för {{num.leakDays}} dagar sedan. Er granskning täcker de senaste sju. Ingen tittar på resten, när nyckeln användes i det tysta. Varför skulle fakturan vara rätt vägvisare till var en angripare har varit?"]),
              pb(["Legal needs an answer", "Juristerna behöver ett svar"], ["Legal says some customer contracts require notice of incidents that could affect the product. They ask you to confirm the build account was untouched. Are you ready to say “no impact” based on one week of a much longer exposure?", "Juristerna säger att vissa kundavtal kräver underrättelse om incidenter som kan påverka produkten. De ber er bekräfta att byggkontot är opåverkat. Är ni beredda att säga ”ingen påverkan” utifrån en vecka av en mycket längre exponering?"]),
              pb(["What goes in the report", "Vad som står i rapporten"], ["The analyst will finish by lunch and asks what to write: “no further findings” is true for the week they reviewed, and says nothing about the time before. What do you want written, and who will read it as an all-clear?", "Analytikern blir klar till lunch och frågar vad som ska stå: ”inga ytterligare fynd” stämmer för veckan som granskades, men säger ingenting om tiden innan. Vad vill ni att det ska stå, och vem kommer att läsa det som en friskförklaring?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The full review", "Den fullständiga granskningen"], [
              io(["Something to look at", "Något att titta på"], ["The first pass through the key's history flags early activity in the build account, long before the mining. It is not yet clear what it was, but the reviewers want a closer look.", "Den första genomgången av nyckelns historik flaggar tidig aktivitet i byggkontot, långt före utvinningen. Det är ännu oklart vad det var, men granskarna vill titta närmare."], ["The first pass flagged early build-account activity for a closer look.", "Den första genomgången flaggade tidig aktivitet i byggkontot för närmare granskning."]),
              io(["No hands free", "Inga lediga händer"], ["The only two people who can read the build-account logs are also the only two who can get releases moving again. The service owner takes it to the CIO: one of the two has to give.", "De enda två som kan läsa byggkontots loggar är också de enda två som kan få igång releaserna igen. Tjänsteägaren går till CIO: en av de två sakerna måste ge vika."], ["The review and the release restart compete for the same two people.", "Granskningen och omstarten av releaserna konkurrerar om samma två personer."], { reopen: true }),
              io(["History in the archive", "Historik i arkivet"], ["Part of the key's early history sits in an archive tier that takes a day to restore. Until then, the oldest days are a blank.", "En del av nyckelns tidiga historik ligger i ett arkiv som tar ett dygn att återställa. Fram till dess är de äldsta dagarna ett tomrum."], ["Part of the key's early history needs a day to restore from archive.", "En del av nyckelns tidiga historik behöver ett dygn för att återställas från arkivet."])
            ]),
            ir("i2", { notChosen: "A" }, ["A narrow review", "En snäv granskning"], [
              io(["Legal cannot confirm", "Juristerna kan inte bekräfta"], ["Legal needs to tell two customers whether the product could be affected. With the build account outside your review, they cannot say “no impact”, and they will not sign off on saying it.", "Juristerna behöver tala om för två kunder om produkten kan vara påverkad. Med byggkontot utanför er granskning kan de inte säga ”ingen påverkan”, och de vägrar godkänna att det sägs."], ["Legal cannot confirm to customers that the product was untouched.", "Juristerna kan inte bekräfta för kunderna att produkten är opåverkad."], { reopen: true }),
              io(["The mining review is clean", "Utvinningsgranskningen är ren"], ["The analyst reports by lunch: the mining instances did nothing except mine. No data access, no other services. The room relaxes.", "Analytikern rapporterar till lunch: utvinningsinstanserna gjorde ingenting annat än att utvinna. Ingen dataåtkomst, inga andra tjänster. Stämningen i rummet lättar."], ["The mining review found nothing beyond the mining itself.", "Granskningen av utvinningen hittade inget utöver själva utvinningen."]),
              io(["Forked before closing", "Kopierat före stängningen"], ["The repository is closed, but it had been forked twice before that, by accounts nobody recognises. Where those copies are now is unknown.", "Kodförrådet är stängt, men det hade kopierats två gånger innan dess, av konton som ingen känner igen. Var de kopiorna finns nu är okänt."], ["The repository was forked by unknown accounts before it was closed.", "Kodförrådet kopierades av okända konton innan det stängdes."])
            ])
          ]
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
          ["Ship a clean release today and notify customers tomorrow with full indicators, so the warning and the fix arrive together.", "Leverera en ren version i dag och underrätta kunderna i morgon med fullständiga indikatorer, så att varningen och rättningen kommer samtidigt."]
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
          minutes: 10,
          pushback: {
            A: [
              pb(["Thin indicators", "Tunna indikatorer"], ["You have one domain and little else. The first customer replies within minutes: what does the loader do, and what should they look for beyond one domain? Do you send what you have now, knowing a second, corrected notice will follow?", "Ni har en domän och inte mycket mer. Den första kunden svarar inom några minuter: vad gör laddaren, och vad ska de leta efter utöver en domän? Skickar ni det ni har nu, i vetskap om att en andra, rättad underrättelse kommer att följa?"]),
              pb(["An urgent fix is frozen", "En brådskande rättning fryses"], ["Another team has a fix ready for an unrelated outage at a customer. The build freeze blocks it, and they ask for an exception through the same pipeline. Do you let one build through, and how do you know that one is clean?", "Ett annat team har en rättning klar för ett orelaterat avbrott hos en kund. Byggstoppet blockerar den, och de ber om ett undantag genom samma pipeline. Släpper ni igenom ett bygge, och hur vet ni att just det är rent?"]),
              pb(["“Should we pull you out?”", "”Ska vi koppla bort er?”"], ["Within an hour, account managers are flooded. The largest customer wants a call with the CEO tonight and asks one thing: should they remove your product entirely? What do you advise, knowing either answer can be held against you?", "Inom en timme är kundansvariga överösta. Den största kunden vill ha ett samtal med vd i kväll och frågar en sak: ska de ta bort er produkt helt? Vad råder ni dem till, i vetskap om att båda svaren kan användas mot er?"])
            ],
            B: [
              pb(["The vanished releases", "Versionerna som försvann"], ["Customers notice that releases have disappeared from the download portal and ask support why. Support has no script and is improvising “maintenance”. Do you let that stand until the analysis is complete?", "Kunderna märker att versioner har försvunnit från nedladdningsportalen och frågar supporten varför. Supporten har inget manus och improviserar ”underhåll”. Låter ni det stå kvar tills analysen är klar?"]),
              pb(["It is calling out now", "Den ringer hem nu"], ["Your own test installs of the affected releases are contacting {{asset.c2Domain}} this morning. Customer installs are presumably doing the same, and customers cannot block what they do not know about. How many hours of analysis are worth that?", "Era egna testinstallationer av de drabbade versionerna kontaktar {{asset.c2Domain}} i förmiddag. Kundernas installationer gör förmodligen samma sak, och kunderna kan inte blockera något de inte känner till. Hur många timmars analys är det värt?"]),
              pb(["The contract clock", "Avtalets klocka"], ["Legal points out that several customer contracts count the notice period from when you discovered the problem, not from when your analysis is finished. That window is closing. Who signs off on missing it?", "Juristerna påpekar att flera kundavtal räknar tiden för underrättelse från när ni upptäckte problemet, inte från när er analys är klar. Det fönstret håller på att stängas. Vem tar ansvar för att missa det?"])
            ],
            C: [
              pb(["Clean from where?", "Ren varifrån?"], ["Today's clean release would come out of the same pipeline that inserted the loader. The extra step is removed, but nobody has finished checking what else changed. How do you know it is clean, and what do you tell customers tomorrow if it isn't?", "Dagens rena version skulle komma ur samma pipeline som infogade laddaren. Det extra steget är borttaget, men ingen har hunnit kontrollera vad mer som ändrats. Hur vet ni att den är ren, och vad säger ni till kunderna i morgon om den inte är det?"]),
              pb(["A customer finds it first", "En kund hittar det först"], ["A customer's security team emails this afternoon: their monitoring flagged your software contacting an unknown domain. They ask whether you know anything. Do you answer honestly today, against your plan, or hold until tomorrow?", "En kunds säkerhetsteam mejlar i eftermiddag: deras övervakning har flaggat att er programvara kontaktar en okänd domän. De frågar om ni vet något. Svarar ni ärligt i dag, mot er plan, eller väntar ni till i morgon?"]),
              pb(["A night without warning", "En natt utan varning"], ["Legal says that knowingly leaving customers to run a loader overnight, while you prepare a nicer notice, will be very hard to defend later. Who in this room will explain that choice if a customer is hit tonight?", "Juristerna säger att det blir mycket svårt att försvara i efterhand att ni medvetet lät kunderna köra en laddare över natten medan ni förberedde en snyggare underrättelse. Vem i det här rummet förklarar det valet om en kund drabbas i natt?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Customers told today", "Kunderna informerade i dag"], [
              io(["Customers act", "Kunderna agerar"], ["Within hours several customers have blocked {{asset.c2Domain}} and removed the affected releases. Two thank you for telling them before they had to find it themselves.", "Inom några timmar har flera kunder blockerat {{asset.c2Domain}} och tagit bort de drabbade versionerna. Två tackar för att ni berättade innan de själva hann hitta det."], ["Several customers blocked {{asset.c2Domain}} within hours of the notice.", "Flera kunder blockerade {{asset.c2Domain}} inom några timmar efter underrättelsen."], { meters: { trust: 1 } }),
              io(["The notice goes public", "Underrättelsen blir offentlig"], ["A customer posts your notice on social media. Within the hour a tech reporter asks comms for comment, and you have no public statement ready.", "En kund lägger ut er underrättelse i sociala medier. Inom en timme ber en teknikreporter kommunikation om en kommentar, och ni har inget offentligt uttalande klart."], ["Your customer notice is public and the press is asking.", "Er underrättelse till kunderna är offentlig och pressen ställer frågor."], { reopen: true, meters: { media: 1 } }),
              io(["Mixed signals", "Blandade signaler"], ["One customer sees their install contacting {{asset.c2Domain}}. Another, on the same release, sees nothing at all, and asks whether you are sure.", "En kund ser att deras installation kontaktar {{asset.c2Domain}}. En annan, på samma version, ser ingenting alls och frågar om ni är säkra."], ["Customers on the same release report different behaviour.", "Kunder på samma version rapporterar olika beteende."])
            ]),
            ir("i2", { notChosen: "A" }, ["Customers not yet told", "Kunderna ännu inte informerade"], [
              io(["A customer finds it", "En kund hittar det"], ["A customer's security team emails: their monitoring flagged your software contacting an unknown domain, and they want to know what you know. They found it before you told them.", "En kunds säkerhetsteam mejlar: deras övervakning har flaggat att er programvara kontaktar en okänd domän, och de vill veta vad ni vet. De hittade det innan ni berättade."], ["A customer found the loader's traffic before you told them.", "En kund hittade laddarens trafik innan ni berättade."], { reopen: true, meters: { trust: -1 } }),
              io(["A quiet day", "En lugn dag"], ["Support takes no unusual calls all afternoon. The plan to tell customers once you know more looks sensible.", "Supporten får inga ovanliga samtal under hela eftermiddagen. Planen att berätta för kunderna när ni vet mer ser förnuftig ut."], ["No customer has raised anything unusual so far today.", "Ingen kund har hittills i dag tagit upp något ovanligt."]),
              io(["Legal splits", "Juristerna är oense"], ["Legal reads the contracts: some count the notice period from discovery, others from confirmation. The two lawyers in the room disagree on which applies to most customers.", "Juristerna läser avtalen: vissa räknar tiden för underrättelse från upptäckten, andra från bekräftelsen. De två juristerna i rummet är oense om vilket som gäller för de flesta kunder."], ["Legal disagrees on when the contractual notice clock started.", "Juristerna är oense om när avtalens frist för underrättelse började löpa."])
            ])
          ]
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
        reconsider: { decision: "d1", pressure: { en: "The signing key was exposed as well. If you paused the release, customers waited for nothing that would have protected them. If you shipped it, it carries a signature you can no longer vouch for.", sv: "Signeringsnyckeln var också exponerad. Om ni pausade releasen väntade kunderna förgäves på något som ändå inte hade skyddat dem. Om ni släppte den bär den en signatur ni inte längre kan gå i god för." } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because customers were warned today, three of them have blocked your update servers, so they will not receive the fix either.", sv: "Eftersom kunderna varnades i dag har tre av dem spärrat era uppdateringsservrar, så de kommer inte att få rättningen heller." } }
        ],
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
          evaluation: [["Revokes the compromised key promptly", "Återkallar den komprometterade nyckeln snabbt"]],
          pushback: {
            A: [
              pb(["Clean customers break too", "Rena kunder slutar också fungera"], ["Customers on the older releases, which never had the loader, now see signature errors on every update check as well. They were safe this morning, and now they are disrupted and calling. How do you explain that their safety required breaking them?", "Kunder på de äldre versionerna, som aldrig hade laddaren, får nu också signaturfel vid varje uppdateringskontroll. De var säkra i morse, och nu är de störda och ringer. Hur förklarar ni att deras säkerhet krävde att ni slog ut dem?"]),
              pb(["No hardware in stock", "Ingen hårdvara i lager"], ["The team has no offline signing hardware, and ordering and setting it up takes days. Until then, any new key would be a software key. Do you sign with a software key meanwhile, and how is that better than the one you just revoked?", "Teamet har ingen frånkopplad signeringshårdvara, och att beställa och sätta upp den tar flera dagar. Fram till dess blir varje ny nyckel en mjukvarunyckel. Signerar ni med en mjukvarunyckel under tiden, och hur är det bättre än den ni just återkallade?"]),
              pb(["One customer asks to wait", "En kund ber er vänta"], ["Your largest customer's security lead asks you to delay revocation until their change window next week: their own controls trust your key, and changing them needs board approval. Do you make an exception for one customer while others are already broken?", "Säkerhetsansvarig hos er största kund ber er skjuta upp återkallelsen till deras ändringsfönster nästa vecka: deras egna kontroller litar på er nyckel, och att ändra dem kräver styrelsebeslut. Gör ni ett undantag för en kund när andra redan är utslagna?"])
            ],
            B: [
              pb(["Hashes from whom?", "Kontrollsummor från vem?"], ["A customer replies: “Why would we trust a list of hashes from an organisation whose secret store was read by an attacker?” The list sits on the same website the build account publishes to. What makes your list more trustworthy than your signature?", "En kund svarar: ”Varför skulle vi lita på en lista med kontrollsummor från en organisation vars hemlighetsvalv har lästs av en angripare?” Listan ligger på samma webbplats som byggkontot publicerar till. Vad gör er lista mer pålitlig än er signatur?"]),
              pb(["Nobody checks hashes", "Ingen kontrollerar kontrollsummor"], ["Support confirms that customers' update tools check the signature automatically, and almost none compare hashes by hand. Anything the attacker signs today will be accepted without a glance at your list. Who is your list actually protecting?", "Supporten bekräftar att kundernas uppdateringsverktyg kontrollerar signaturen automatiskt, och nästan ingen jämför kontrollsummor för hand. Allt som angriparen signerar i dag kommer att godtas utan en blick på er lista. Vem skyddar er lista egentligen?"]),
              pb(["“Are you still using it?”", "”Använder ni den fortfarande?”"], ["A customer's auditor asks one direct question: are you still signing with a key you know an attacker has read? A yes ends many conversations, and a hedge sounds worse. Who answers, and what do they say?", "En kunds revisor ställer en direkt fråga: signerar ni fortfarande med en nyckel som ni vet att en angripare har läst? Ett ja avslutar många samtal, och ett undanglidande svar låter värre. Vem svarar, och vad säger hen?"])
            ],
            C: [
              pb(["Weeks, not days", "Veckor, inte dagar"], ["The development lead estimates the new pipeline is weeks away, not days. Until then, the attacker holds a key your customers' tools accept. What could they sign in that time, and would you know?", "Utvecklingschefen bedömer att den nya pipelinen ligger veckor bort, inte dagar. Fram till dess har angriparen en nyckel som era kunders verktyg godtar. Vad skulle de kunna signera under den tiden, och skulle ni märka det?"]),
              pb(["“Have you revoked it?”", "”Har ni återkallat den?”"], ["Customers ask directly whether the signing key is compromised, and whether it has been revoked. The honest answer is “yes, and not yet”. How do you say that, and what do you promise about the gap?", "Kunderna frågar rakt ut om signeringsnyckeln är komprometterad och om den har återkallats. Det ärliga svaret är ”ja, och inte ännu”. Hur säger ni det, och vad lovar ni om tiden däremellan?"]),
              pb(["Releases in the meantime", "Releaser under tiden"], ["Product needs to ship in the meantime. Anything released now carries the doubtful key, and will break again when you finally revoke it. Do you freeze all releases until the new pipeline is ready, and can the business live with that?", "Produkt behöver leverera under tiden. Allt som släpps nu bär den tvivelaktiga nyckeln, och kommer att sluta fungera igen när ni till slut återkallar den. Fryser ni alla releaser tills den nya pipelinen är klar, och klarar verksamheten det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A new signing key", "En ny signeringsnyckel"], [
              io(["The guide works", "Vägledningen fungerar"], ["The first customers follow your published steps and confirm the new key within hours. One posts that it was the clearest vendor guidance they have seen this year.", "De första kunderna följer era publicerade steg och bekräftar den nya nyckeln inom några timmar. En skriver att det var den tydligaste vägledningen från en leverantör de sett i år."], ["The first customers have verified the new key using your guide.", "De första kunderna har kontrollerat den nya nyckeln med hjälp av er vägledning."]),
              io(["Updates stop", "Uppdateringarna stannar"], ["Automatic updates now fail at customers still on the old key, and support's queue triples. A large customer says their operations team is stuck and wants the old key trusted again for a week.", "Automatiska uppdateringar misslyckas nu hos kunder som fortfarande har den gamla nyckeln, och supportens kö tredubblas. En stor kund säger att deras driftteam sitter fast och vill att den gamla nyckeln ska godtas en vecka till."], ["Automatic updates fail for customers still on the old key.", "Automatiska uppdateringar misslyckas för kunder som fortfarande har den gamla nyckeln."], { reopen: true, meters: { trust: -1 } }),
              io(["Revocation lags", "Återkallelsen dröjer"], ["Some customers' tools cache revocation information and will keep trusting the old key for days. Nobody can say exactly which customers or for how long.", "Vissa kunders verktyg sparar information om återkallelser och kommer att fortsätta lita på den gamla nyckeln i flera dagar. Ingen kan säga exakt vilka kunder eller hur länge."], ["Some customer tools will trust the old key for days after revocation.", "Vissa kunders verktyg litar på den gamla nyckeln i flera dagar efter återkallelsen."])
            ]),
            ir("i2", { notChosen: "A" }, ["The old key stays", "Den gamla nyckeln ligger kvar"], [
              io(["The auditor asks", "Revisorn frågar"], ["A customer's auditor asks in writing whether you are still signing with a key you know an attacker has read. They want a yes or no by tomorrow.", "En kunds revisor frågar skriftligen om ni fortfarande signerar med en nyckel som ni vet att en angripare har läst. De vill ha ett ja eller nej till i morgon."], ["A customer auditor has asked in writing whether the key is still in use.", "En kunds revisor har skriftligen frågat om nyckeln fortfarande används."], { reopen: true, meters: { trust: -1 } }),
              io(["Customers can live with it", "Kunderna kan leva med det"], ["Several large customers say the interim arrangement is acceptable for now, as long as updates keep working. The service owner calls it the right trade.", "Flera stora kunder säger att den tillfälliga ordningen är acceptabel för tillfället, så länge uppdateringarna fortsätter fungera. Tjänsteägaren kallar det rätt avvägning."], ["Several large customers accept the interim arrangement for now.", "Flera stora kunder godtar den tillfälliga ordningen tills vidare."]),
              io(["No date to plan on", "Inget datum att planera efter"], ["A reseller partner asks when the old key will stop being trusted, so they can schedule their own changes. You cannot give them a date.", "En återförsäljare frågar när den gamla nyckeln slutar godtas, så att de kan planera sina egna ändringar. Ni kan inte ge dem något datum."], ["Partners have no date for when the old key stops being trusted.", "Partnerna har inget datum för när den gamla nyckeln slutar godtas."])
            ])
          ]
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
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because the signing key was revoked, every customer's automatic updates now fail with a signature error.", sv: "Eftersom signeringsnyckeln återkallades misslyckas nu varje kunds automatiska uppdateringar med ett signaturfel." } }
        ],
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
          ["Invite the customer's own auditor on site next week instead of waiting a month for an independent assessment.", "Bjud in kundens egen revisor på plats nästa vecka i stället för att vänta en månad på en oberoende bedömning."]
        ], {
          knowns: [["A key customer has paused.", "En nyckelkund har pausat."]],
          uncertainties: [["How many will follow.", "Hur många som kommer att följa efter."]],
          tradeoffs: {
            operational: ["Producing evidence takes developers off the rebuild.", "Att ta fram bevis tar utvecklare från återuppbyggnaden."],
            security: ["Independent review may find more.", "En oberoende granskning kan hitta mer."],
            legal: ["Contract terms may favour the customer.", "Avtalsvillkoren kan gynna kunden."],
            reputational: ["Evidence restores trust; discounts don't.", "Bevis återställer förtroendet; rabatter gör det inte."]
          },
          evaluation: [["Offers evidence and independent review", "Erbjuder bevis och oberoende granskning"]],
          pushback: {
            A: [
              pb(["Lists you cannot prove", "Listor ni inte kan bevisa"], ["You have no build records for releases older than three months, so those component lists would be reconstructions. Sharing them as fact risks being caught out by the assessor. Do you label them as best guesses, or leave the old releases out?", "Ni har inga byggprotokoll för versioner som är äldre än tre månader, så de komponentlistorna skulle vara rekonstruktioner. Att dela dem som fakta riskerar att avslöjas av granskaren. Märker ni dem som bästa uppskattning, eller utelämnar ni de gamla versionerna?"]),
              pb(["The assessor is a month away", "Granskaren är en månad bort"], ["The firms you contact can start in a month at the earliest. The customer's regulator wants their plan sooner. Is a dated plan with a month-long gap at the start good enough, and what do you offer in the meantime?", "Byråerna ni kontaktar kan börja om en månad tidigast. Kundens tillsynsmyndighet vill ha deras plan tidigare. Räcker en daterad plan som börjar med en månads glapp, och vad erbjuder ni under tiden?"]),
              pb(["Evidence or rebuild", "Bevis eller återuppbyggnad"], ["Producing component lists takes the same developers who are rebuilding the build system. The development lead says the rebuild slips a week if you do both. Which matters more to this customer, and to the others?", "Att ta fram komponentlistor kräver samma utvecklare som bygger om byggsystemet. Utvecklingschefen säger att återuppbyggnaden försenas en vecka om ni gör båda. Vad är viktigast för den här kunden, och för de andra?"])
            ],
            B: [
              pb(["They find the gaps", "De hittar luckorna"], ["The customer's security team reads your package overnight and lists the gaps: no build records before three months, no independent view. They ask whether you knew. Do you admit the gaps you chose not to mention?", "Kundens säkerhetsteam läser ert material under natten och listar luckorna: inga byggprotokoll äldre än tre månader, ingen oberoende bedömning. De frågar om ni visste. Erkänner ni luckorna ni valde att inte nämna?"]),
              pb(["Their supervisor says no", "Deras tillsyn säger nej"], ["The customer replies: their supervisor will not accept the supplier's own word, and resuming now would put them in conflict with their regulator. Asking them to resume has put them in a corner. What do you offer instead?", "Kunden svarar: deras tillsynsmyndighet godtar inte leverantörens eget ord, och att återuppta nu skulle ställa dem mot myndigheten. Att be dem återuppta har trängt in dem i ett hörn. Vad erbjuder ni i stället?"]),
              pb(["Sales wants a discount", "Försäljning vill ge rabatt"], ["The account manager suggests sweetening the request with a discount to get them to resume, and says two other customers are watching what this one gets. Do you put a price on their trust, and what does that tell the others?", "Kundansvarig föreslår att ni sötar förfrågan med en rabatt för att få dem att återuppta, och säger att två andra kunder bevakar vad den här får. Sätter ni ett pris på deras förtroende, och vad säger det till de andra?"])
            ],
            C: [
              pb(["Everyone wants a visit", "Alla vill komma på besök"], ["Word gets out. Ten more customers ask for their own auditors on site next week. You cannot host them all while rebuilding, and refusing one after accepting another looks like favouritism. Who gets in, and who decides?", "Det sprider sig. Tio kunder till vill skicka sina egna revisorer på plats nästa vecka. Ni kan inte ta emot alla mitt i återuppbyggnaden, och att neka en efter att ha sagt ja till en annan ser ut som särbehandling. Vem får komma, och vem bestämmer?"]),
              pb(["They will see the mess", "De kommer att se röran"], ["The auditor will arrive mid-rebuild: half-finished environments, missing records, and engineers who have barely slept. Whatever they find goes in their report to the customer's regulator. Are you ready for that version of yourselves to be on record?", "Revisorn kommer mitt i återuppbyggnaden: halvfärdiga miljöer, saknade protokoll och ingenjörer som knappt har sovit. Allt de hittar hamnar i deras rapport till kundens tillsynsmyndighet. Är ni redo att den bilden av er hamnar i protokollet?"]),
              pb(["Not independent", "Inte oberoende"], ["The customer's own compliance team points out that their auditor is not independent of their decision to resume. Their regulator may not accept it either. Have you just traded a month's wait for an answer that won't count?", "Kundens egen regelefterlevnadsfunktion påpekar att deras revisor inte är oberoende av beslutet att återuppta. Deras tillsynsmyndighet godtar det kanske inte heller. Har ni just bytt en månads väntan mot ett svar som inte räknas?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["An independent assessment", "En oberoende bedömning"], [
              io(["Suspended, not cancelled", "Pausat, inte uppsagt"], ["The customer accepts your plan. The contract stays suspended, but they tell their supervisor they are working with you rather than replacing you.", "Kunden godtar er plan. Avtalet förblir pausat, men de meddelar sin tillsynsmyndighet att de arbetar med er i stället för att byta ut er."], ["The customer accepted the plan and kept the contract suspended, not cancelled.", "Kunden godtog planen och lät avtalet vara pausat, inte uppsagt."]),
              io(["A list does not match", "En lista stämmer inte"], ["The customer compares your reconstructed component list for an older release with their own scan of what is installed. They do not match, and they ask which one is wrong.", "Kunden jämför er rekonstruerade komponentlista för en äldre version med sin egen genomsökning av det som är installerat. De stämmer inte överens, och kunden frågar vilken som är fel."], ["One component list did not match the customer's own scan.", "En komponentlista stämde inte med kundens egen genomsökning."], { reopen: true, meters: { trust: -1 } }),
              io(["Everyone wants one", "Alla vill ha samma"], ["Three more customers hear about the evidence package and ask for the same, each with slightly different requirements.", "Tre kunder till hör talas om bevismaterialet och ber om detsamma, var och en med lite olika krav."], ["Three more customers have asked for the same evidence.", "Tre kunder till har bett om samma bevis."])
            ]),
            ir("i2", { notChosen: "A" }, ["No independent view", "Ingen oberoende bedömning"], [
              io(["The supervisor writes", "Tillsynen skriver"], ["The customer forwards a letter from their supervisor: it expects an independent assessment of the supplier before the customer resumes. Your answer does not give them one.", "Kunden vidarebefordrar ett brev från sin tillsynsmyndighet: den förväntar sig en oberoende bedömning av leverantören innan kunden återupptar. Ert svar ger dem ingen sådan."], ["The customer's supervisor expects an independent assessment of you.", "Kundens tillsynsmyndighet förväntar sig en oberoende bedömning av er."], { reopen: true, meters: { regulator: 1 } }),
              io(["The CIO softens", "CIO mjuknar"], ["The customer's CIO calls your CEO directly: the relationship matters, and they would like to find a way to resume. The room reads it as the worst being over.", "Kundens CIO ringer er vd direkt: relationen är viktig, och de vill gärna hitta ett sätt att återuppta. Rummet tolkar det som att det värsta är över."], ["The customer's CIO has signalled willingness to resume on terms.", "Kundens CIO har signalerat vilja att återuppta på vissa villkor."]),
              io(["A rival's offer", "En konkurrents erbjudande"], ["The customer mentions, almost in passing, that a competitor has offered them a free migration. They have not said whether they will take it.", "Kunden nämner, nästan i förbigående, att en konkurrent har erbjudit dem en kostnadsfri migrering. De har inte sagt om de tänker anta den."], ["A competitor has offered the customer a free migration.", "En konkurrent har erbjudit kunden en kostnadsfri migrering."])
            ])
          ]
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
        reconsider: { decision: "d3", pressure: { en: "{{num.downloads}} public downloads. Customers you warned early ask why open-source users were not warned at the same time. Customers you have not told yet will read it in the advisory.", sv: "{{num.downloads}} offentliga nedladdningar. Kunder som ni varnade tidigt frågar varför användarna av den öppna koden inte varnades samtidigt. Kunder som ni ännu inte berättat för kommer att läsa det i bulletinen." } },
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
          evaluation: [["Warns unknown users through a public advisory", "Varnar okända användare genom en öppen säkerhetsbulletin"]],
          pushback: {
            A: [
              pb(["Yanking breaks builds", "Tillbakadragandet bryter byggen"], ["Removing the version breaks every project that pinned it. Within an hour, developers you have never heard of are filing angry issues on your repository. Do you hold the yank, and who answers them?", "Att dra tillbaka versionen bryter alla projekt som har låst sig vid den. Inom en timme skapar utvecklare ni aldrig har hört talas om arga ärenden i ert kodförråd. Står ni fast vid tillbakadragandet, och vem svarar dem?"]),
              pb(["The researcher's write-up", "Forskarens rapport"], ["The researcher, pleased to be credited, plans to publish their own write-up tomorrow, with more detail than you would like about how your build account was reached. Do you ask them to wait, to soften it, or let it run alongside your advisory?", "Forskaren, glad över erkännandet, planerar att publicera en egen rapport i morgon, med fler detaljer än ni önskar om hur ert byggkonto nåddes. Ber ni hen vänta, tona ned den eller låter ni den gå ut parallellt med er bulletin?"]),
              pb(["Is the token dead?", "Är token död?"], ["The team cannot yet confirm that the token used to publish the package has been revoked. An advisory now tells the attacker you know, and they may push another version first. Do you publish now, or wait until you are sure?", "Teamet kan ännu inte bekräfta att den token som användes för att publicera paketet har återkallats. En bulletin nu talar om för angriparen att ni vet, och de kan hinna publicera en ny version först. Publicerar ni nu, eller väntar ni tills ni är säkra?"])
            ],
            B: [
              pb(["The researcher won't wait", "Forskaren väntar inte"], ["The researcher says they will publish their findings within days, with or without you. If you stay quiet, the first public word about your package comes from them. Is “quietly” still an option, or only a delay?", "Forskaren säger att hen publicerar sina fynd inom några dagar, med eller utan er. Om ni förblir tysta kommer det första offentliga beskedet om ert paket från hen. Är ”i tysthet” fortfarande ett alternativ, eller bara en fördröjning?"]),
              pb(["Silent installs", "Tysta installationer"], ["Yanking stops new downloads, but {{num.downloads}} copies are already out there. Those users get no signal at all: their builds keep working, with the loader inside. How do they ever learn, and whose responsibility is it?", "Tillbakadragandet stoppar nya nedladdningar, men {{num.downloads}} kopior finns redan ute. De användarna får ingen signal alls: deras byggen fortsätter fungera, med laddaren inuti. Hur ska de någonsin få veta, och vems ansvar är det?"]),
              pb(["A customer connects it", "En kund kopplar ihop det"], ["A customer's developer notices the yanked version and asks whether it is related to the security notice you sent them. Answering honestly makes the quiet yank public. Do you tell them the truth, and ask them to keep it to themselves?", "En utvecklare hos en kund märker den tillbakadragna versionen och frågar om den hänger ihop med säkerhetsmeddelandet ni skickade. Att svara ärligt gör det tysta tillbakadragandet offentligt. Berättar ni sanningen, och ber ni dem hålla det för sig själva?"])
            ],
            C: [
              pb(["The old version stays", "Den gamla versionen ligger kvar"], ["The tainted version is still downloadable, and every build pinned to it keeps pulling it. A new version only helps those who update. Is a fix on top enough when the bad one is still one install command away?", "Den manipulerade versionen går fortfarande att ladda ned, och varje bygge som är låst till den fortsätter hämta den. En ny version hjälper bara dem som uppdaterar. Räcker en rättning ovanpå när den dåliga fortfarande bara är ett installationskommando bort?"]),
              pb(["Looks like routine", "Ser ut som rutin"], ["With no advisory, the fixed version looks like a routine update, and most users have no reason to hurry. The download counter on the new version barely moves. How will the {{num.downloads}} who have the loader know to act?", "Utan bulletin ser den rättade versionen ut som en vanlig uppdatering, och de flesta användare har ingen anledning att skynda sig. Nedladdningsräknaren för den nya versionen rör sig knappt. Hur ska de {{num.downloads}} som har laddaren veta att de måste agera?"]),
              pb(["Same token, same account", "Samma token, samma konto"], ["The fixed version would be published from the build account and token you are still investigating. A sceptical maintainer asks why anyone should trust a new release from the same place the bad one came from. What is your answer?", "Den rättade versionen skulle publiceras från samma byggkonto och token som ni fortfarande utreder. En skeptisk förvaltare frågar varför någon skulle lita på en ny version från samma ställe som den dåliga kom ifrån. Vad svarar ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The public advisory", "Den öppna bulletinen"], [
              io(["Projects pin away", "Projekten låser bort"], ["Within hours the largest projects that depend on your library pin the previous version and link to your advisory. The researcher shares it with thanks.", "Inom några timmar låser de största projekten som är beroende av ert bibliotek den föregående versionen och länkar till er bulletin. Forskaren delar den med ett tack."], ["Major dependent projects have pinned away from the tainted version.", "Stora beroende projekt har låst sig bort från den manipulerade versionen."]),
              io(["Another version appears", "En ny version dyker upp"], ["An hour after the advisory, a new version of the library appears on the registry, published with the same token. Someone is still holding it, and now knows you know.", "En timme efter bulletinen dyker en ny version av biblioteket upp i registret, publicerad med samma token. Någon har den fortfarande, och vet nu att ni vet."], ["A new tainted version was published after the advisory; the token was still valid.", "En ny manipulerad version publicerades efter bulletinen; token var fortfarande giltig."], { reopen: true }),
              io(["The researcher's write-up", "Forskarens rapport"], ["The researcher publishes their own write-up the same evening. It praises your speed, and also describes in detail how your organisation's token was misused.", "Forskaren publicerar sin egen rapport samma kväll. Den berömmer er snabbhet, och beskriver samtidigt i detalj hur er organisations token missbrukades."], ["The researcher's write-up is public and details the token misuse.", "Forskarens rapport är offentlig och beskriver missbruket av token i detalj."])
            ]),
            ir("i2", { notChosen: "A" }, ["No public advisory", "Ingen öppen bulletin"], [
              io(["The researcher goes first", "Forskaren går först"], ["The researcher publishes before you say anything. The headline that spreads is that the vendor stayed silent while its package called home.", "Forskaren publicerar innan ni har sagt något. Rubriken som sprids är att leverantören teg medan dess paket ringde hem."], ["The first public account of the package came from the researcher, not you.", "Det första offentliga beskedet om paketet kom från forskaren, inte från er."], { reopen: true, meters: { media: 1 } }),
              io(["The tracker stays quiet", "Ärendelistan är tyst"], ["Nobody has opened an issue about the package on your repository. The team takes it as a sign that few people noticed the bad version.", "Ingen har skapat något ärende om paketet i ert kodförråd. Teamet ser det som ett tecken på att få märkte den dåliga versionen."], ["No public issue about the package has been raised yet.", "Inget offentligt ärende om paketet har skapats ännu."]),
              io(["A private question", "En fråga i förtroende"], ["The maintainer of a popular project that depends on your library emails privately: should they pin away from the latest version, and why? Your answer will shape what thousands of developers do.", "Förvaltaren av ett populärt projekt som är beroende av ert bibliotek mejlar i förtroende: bör de låsa sig bort från den senaste versionen, och varför? Ert svar avgör vad tusentals utvecklare gör."], ["A popular downstream project has asked you privately whether to pin away.", "Ett populärt beroende projekt har i förtroende frågat om de bör låsa sig bort."])
            ])
          ]
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
        reconsider: { decision: "d4", pressure: { en: "A critical fix must ship this week. If you revoked the key, nobody can verify a new release yet. If you kept it, the fix will carry the doubtful signature.", sv: "En kritisk rättning måste ut den här veckan. Om ni återkallade nyckeln kan ingen ännu kontrollera en ny version. Om ni behöll den kommer rättningen att bära den tvivelaktiga signaturen." } },
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
          evaluation: [["Balances exposure with build trust", "Väger exponering mot förtroende för bygget"]],
          pushback: {
            A: [
              pb(["Which two people?", "Vilka två personer?"], ["Only three developers know the component well enough to review the fix, and one of them is the developer whose repository leaked the key. Do you include them in the two-person review, and what do the other two say about that?", "Bara tre utvecklare kan komponenten tillräckligt bra för att granska rättningen, och en av dem är utvecklaren vars kodförråd läckte nyckeln. Tar ni med hen i granskningen med två personer, och vad säger de andra två om det?"]),
              pb(["Signed with what?", "Signerad med vad?"], ["The emergency build needs a signature that customers' tools will accept today. The key situation is not settled yet. Which key signs this release, can customers verify it, and what do you tell them if they cannot?", "Nödbygget behöver en signatur som kundernas verktyg godtar i dag. Nyckelfrågan är inte löst ännu. Vilken nyckel signerar den här versionen, kan kunderna kontrollera den, och vad säger ni till dem om de inte kan?"]),
              pb(["The record shows too much", "Protokollet visar för mycket"], ["Publishing the full build record shows your dependencies, tool versions and internal hostnames to anyone, including whoever just spent weeks in your build account. Do you publish it in full, redact it, and does a redacted record still prove anything?", "Att publicera hela byggprotokollet visar era beroenden, verktygsversioner och interna värdnamn för alla, även för den som just tillbringat veckor i ert byggkonto. Publicerar ni det i sin helhet, maskerar ni det, och bevisar ett maskerat protokoll fortfarande något?"])
            ],
            B: [
              pb(["“When, exactly?”", "”När, exakt?”"], ["A customer reports that the vulnerability is being exploited on their systems and asks when the fix ships. Your answer is “when our rebuild is done”, with no date. What do you tell them, and how do you justify it if they are breached tomorrow?", "En kund rapporterar att sårbarheten utnyttjas i deras system och frågar när rättningen kommer. Ert svar är ”när återuppbyggnaden är klar”, utan datum. Vad säger ni till dem, och hur försvarar ni det om de drabbas i morgon?"]),
              pb(["A customer patches it", "En kund rättar själv"], ["A large customer's team has patched the component themselves and asks you to approve their build so their support contract stays valid. Do you support a version you did not build, or refuse and leave them exposed?", "Ett team hos en stor kund har rättat komponenten själva och ber er godkänna deras bygge så att supportavtalet fortsätter gälla. Stödjer ni en version som ni inte har byggt, eller vägrar ni och lämnar dem exponerade?"]),
              pb(["The rebuild slips", "Återuppbyggnaden drar ut"], ["The rebuild lead reports that the clean environment is another two weeks away, not days. The vulnerability is being exploited now. Is your answer still to wait, and at what point would you change it?", "Den som leder återuppbyggnaden rapporterar att den rena miljön ligger ytterligare två veckor bort, inte dagar. Sårbarheten utnyttjas nu. Är ert svar fortfarande att vänta, och vid vilken punkt skulle ni ändra det?"])
            ],
            C: [
              pb(["It turns off a feature", "Den stänger av en funktion"], ["The workaround disables a feature several customers depend on daily. Three say they cannot apply it without stopping their own operations. What do you offer them, other than the release you decided not to build?", "Den tillfälliga lösningen stänger av en funktion som flera kunder använder dagligen. Tre säger att de inte kan införa den utan att stoppa sin egen verksamhet. Vad erbjuder ni dem, utöver den version ni bestämde er för att inte bygga?"]),
              pb(["Half-applied", "Halvt införd"], ["Customers apply the workaround on some servers and not others, and nobody reports back. You no longer know who is protected. How do you track it, and how long can a workaround stand in for a fix?", "Kunderna inför den tillfälliga lösningen på vissa servrar men inte andra, och ingen återrapporterar. Ni vet inte längre vem som är skyddad. Hur följer ni upp det, och hur länge kan en tillfällig lösning ersätta en rättning?"]),
              pb(["The advisory is updated", "Varningen uppdateras"], ["The vendor updates its advisory: attackers have found a way around the main workaround. Your guidance went out this morning. Do you now build the release after all, and on what?", "Leverantören uppdaterar sin varning: angripare har hittat en väg runt den viktigaste tillfälliga lösningen. Er vägledning gick ut i morse. Bygger ni nu versionen ändå, och i så fall på vad?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The emergency build", "Nödbygget"], [
              io(["Identical output", "Identiskt resultat"], ["Two reviewers build the fix independently on separate clean machines, and the output is byte for byte identical. The build record is ready to publish.", "Två granskare bygger rättningen var för sig på separata rena maskiner, och resultatet är identiskt byte för byte. Byggprotokollet är klart att publicera."], ["Two independent builds of the fix produced identical output.", "Två oberoende byggen av rättningen gav identiskt resultat."]),
              io(["An old dependency", "Ett gammalt beroende"], ["Reviewing the build record, the second reviewer sees that one dependency was fetched from the internal mirror used by the old build environment. Nobody has checked that mirror yet.", "När den andra granskaren går igenom byggprotokollet ser hen att ett beroende hämtades från den interna spegel som den gamla byggmiljön använde. Ingen har kontrollerat den spegeln ännu."], ["The emergency build pulled a dependency from the old environment's mirror.", "Nödbygget hämtade ett beroende från den gamla miljöns spegel."], { reopen: true }),
              io(["Records questioned", "Protokollet ifrågasätts"], ["A customer compares your published build record with an older one and asks why so many tool versions changed. The honest answer is that everything did.", "En kund jämför ert publicerade byggprotokoll med ett äldre och frågar varför så många verktygsversioner har ändrats. Det ärliga svaret är att allt har det."], ["A customer questioned differences between the new and older build records.", "En kund ifrågasatte skillnaderna mellan det nya och äldre byggprotokoll."])
            ]),
            ir("i2", { notChosen: "A" }, ["No release this week", "Ingen version den här veckan"], [
              io(["A customer is hit", "En kund drabbas"], ["A customer reports that attackers have used the vulnerability in your component to get into their systems. They ask, in writing, why the fix was not shipped.", "En kund rapporterar att angripare har använt sårbarheten i er komponent för att ta sig in i deras system. De frågar skriftligen varför rättningen inte levererades."], ["A customer has been breached through the unpatched component.", "En kund har drabbats av intrång via den orättade komponenten."], { reopen: true, meters: { trust: -1 } }),
              io(["Most accept it", "De flesta godtar det"], ["Most customers accept your interim guidance and say they understand why you will not rush a release. Support has fewer calls than feared.", "De flesta kunder godtar er tillfälliga vägledning och säger att de förstår varför ni inte forcerar en version. Supporten får färre samtal än befarat."], ["Most customers have accepted your interim guidance for now.", "De flesta kunder har tills vidare godtagit er tillfälliga vägledning."]),
              io(["A self-built patch", "En egenbyggd rättning"], ["A large customer has patched the component themselves and asks you to accept their build under the support contract. You did not build it and cannot vouch for it.", "En stor kund har rättat komponenten själv och ber er godta deras bygge inom supportavtalet. Ni har inte byggt det och kan inte gå i god för det."], ["A large customer runs its own patched build and wants your support.", "En stor kund kör ett eget rättat bygge och vill ha ert stöd."])
            ])
          ]
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
          ["Training for every developer, and one named owner for secrets in each team.", "Utbildning för varje utvecklare, och en utsedd ansvarig för hemligheter i varje team."]
        ], {
          knowns: [["Long-lived keys are everywhere.", "Långlivade nycklar finns överallt."]],
          uncertainties: [["How much this will slow development.", "Hur mycket det här kommer att bromsa utvecklingen."]],
          tradeoffs: {
            operational: ["Blocking scans will stop some pushes.", "Blockerande genomsökningar kommer att stoppa vissa publiceringar."],
            security: ["Rotation alone just resets the clock.", "Att bara byta nycklar nollställer bara klockan."],
            legal: ["Customers may now require evidence of build security.", "Kunderna kan nu kräva bevis på säkra byggen."],
            reputational: ["Visible change helps win customers back.", "Synlig förändring hjälper till att vinna tillbaka kunder."]
          },
          evaluation: [["Removes the class of problem, not one instance", "Tar bort hela problemtypen, inte en enskild förekomst"]],
          pushback: {
            A: [
              pb(["An owner nobody wants", "En ägare som ingen vill vara"], ["Nobody volunteers to own the build chain. The obvious candidates say it means accountability without budget or authority over the teams that push code. Who do you name, and what power do they actually get?", "Ingen anmäler sig frivilligt att äga byggkedjan. De självklara kandidaterna säger att det innebär ansvar utan budget eller befogenheter över teamen som publicerar kod. Vem utser ni, och vilka befogenheter får hen egentligen?"]),
              pb(["The scan blocks a hotfix", "Genomsökningen blockerar en snabbrättning"], ["In the first week, the blocking scan stops an urgent fix because of a test value that looks like a secret. The team asks for a bypass switch “for emergencies”. Do you give them one, and who will decide what counts as an emergency?", "Den första veckan stoppar den blockerande genomsökningen en brådskande rättning på grund av ett testvärde som ser ut som en hemlighet. Teamet vill ha en förbikoppling ”för nödfall”. Ger ni dem en, och vem avgör vad som räknas som nödfall?"]),
              pb(["Forty-six at once", "Fyrtiosex på en gång"], ["Replacing 46 long-lived keys with short-lived credentials breaks automation nobody remembers creating. The first batch takes down a customer-facing job overnight. Do you slow the programme down, knowing every key left in place is still a door?", "Att ersätta 46 långlivade nycklar med kortlivade inloggningsuppgifter slår ut automatiseringar som ingen minns att de har skapat. Den första omgången fäller ett kundnära jobb under natten. Saktar ni ned arbetet, i vetskap om att varje nyckel som ligger kvar fortfarande är en dörr?"])
            ],
            B: [
              pb(["Reports nobody reads", "Rapporter som ingen läser"], ["A month in, the scanning report lists new secrets every week. Nobody acts, because it is only a report and nobody owns it. Who reads it, and what happens when they find the next public key?", "Efter en månad listar rapporten från genomsökningen nya hemligheter varje vecka. Ingen agerar, eftersom det bara är en rapport och ingen äger den. Vem läser den, och vad händer när de hittar nästa öppna nyckel?"]),
              pb(["New keys, old habit", "Nya nycklar, gammal vana"], ["The rotated keys are long-lived again and stored in the same kinds of places as the old ones. The cloud lead asks what will be different in a year. What is your answer, other than another rotation?", "De bytta nycklarna är långlivade igen och förvaras på samma sorts ställen som de gamla. Molnansvarig frågar vad som kommer att vara annorlunda om ett år. Vad svarar ni, utöver ännu ett byte?"]),
              pb(["“What changed?”", "”Vad har ändrats?”"], ["The customer who suspended your contract asks what has structurally changed in your build security. “We rotated our keys” does not satisfy their assessment. What can you show them that a rotation does not?", "Kunden som pausade ert avtal frågar vad som har ändrats i grunden i er byggsäkerhet. ”Vi har bytt våra nycklar” räcker inte för deras bedömning. Vad kan ni visa dem som ett nyckelbyte inte visar?"])
            ],
            C: [
              pb(["The example in the room", "Exemplet i rummet"], ["The training uses the leaked key as its case study. Everyone knows whose repository it was, and the developer sits through it in silence. How do you teach from this incident without turning one person into the lesson?", "Utbildningen använder den läckta nyckeln som fallstudie. Alla vet vems kodförråd det var, och utvecklaren sitter tyst igenom den. Hur undervisar ni utifrån incidenten utan att göra en person till lärdomen?"]),
              pb(["Trained people pushed them", "Utbildade personer publicerade dem"], ["The three keys already public were pushed by developers who had been through security training. Nothing technical stops the next push. Is a course the control, or a way to feel you did something?", "De tre nycklar som redan är öppna publicerades av utvecklare som hade gått säkerhetsutbildning. Inget tekniskt stoppar nästa publicering. Är en kurs kontrollen, eller ett sätt att känna att ni har gjort något?"]),
              pb(["Owners without tools", "Ansvariga utan verktyg"], ["The new secret owners in each team ask what they are supposed to do: there is no scanner, no vault and no authority to stop a push. What do you actually give them, and by when?", "De nya ansvariga för hemligheter i varje team frågar vad de ska göra: det finns ingen genomsökning, inget valv och inga befogenheter att stoppa en publicering. Vad ger ni dem faktiskt, och när?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The new controls", "De nya kontrollerna"], [
              io(["The first catch", "Den första träffen"], ["Two days in, the blocking scan stops a developer from pushing a real cloud key. The developer says they would never have noticed.", "Efter två dagar stoppar den blockerande genomsökningen en utvecklare från att publicera en riktig molnnyckel. Utvecklaren säger att hen aldrig skulle ha märkt det."], ["The blocking scan stopped a real key from being pushed.", "Den blockerande genomsökningen stoppade en riktig nyckel från att publiceras."]),
              io(["A job goes down", "Ett jobb går ned"], ["The first batch of keys is replaced with short-lived credentials. Overnight a customer-facing job that nobody knew depended on one of them stops working.", "Den första omgången nycklar ersätts med kortlivade inloggningsuppgifter. Under natten slutar ett kundnära jobb fungera, som ingen visste var beroende av en av dem."], ["A customer-facing job failed when its long-lived key was replaced.", "Ett kundnära jobb fallerade när dess långlivade nyckel ersattes."], { reopen: true, meters: { trust: -1 } }),
              io(["Routed around", "Vägen runt"], ["One team, tired of blocked pushes, has started keeping secrets in a shared document the scanner never looks at. They say it is temporary.", "Ett team som har tröttnat på blockerade publiceringar har börjat förvara hemligheter i ett delat dokument som genomsökningen aldrig tittar i. De säger att det är tillfälligt."], ["One team keeps secrets where the scanner does not look.", "Ett team förvarar hemligheter där genomsökningen inte tittar."])
            ]),
            ir("i2", { notChosen: "A" }, ["The old habits", "De gamla vanorna"], [
              io(["Public again", "Öppen igen"], ["Within a week, one of the freshly rotated long-lived keys turns up in a public repository. Nothing stopped the push, and the report only noticed it days later.", "Inom en vecka dyker en av de nyss bytta långlivade nycklarna upp i ett öppet kodförråd. Ingenting stoppade publiceringen, och rapporten upptäckte det först flera dagar senare."], ["A newly rotated key was found in a public repository again.", "En nyss bytt nyckel hittades i ett öppet kodförråd igen."], { reopen: true }),
              io(["A clean first report", "En ren första rapport"], ["The first weekly report lists no new public keys. Management reads it as the problem being fixed.", "Den första veckorapporten listar inga nya öppna nycklar. Ledningen tolkar det som att problemet är löst."], ["The first weekly report found no new public keys.", "Den första veckorapporten hittade inga nya öppna nycklar."]),
              io(["“What changed?”", "”Vad har ändrats?”"], ["The customer who suspended your contract asks what has changed in the structure of your build security. They make clear that rotated keys and a course will not satisfy their assessment.", "Kunden som pausade ert avtal frågar vad som har ändrats i grunden i er byggsäkerhet. De gör klart att bytta nycklar och en kurs inte räcker för deras bedömning."], ["The suspended customer wants evidence of structural change, not rotation.", "Kunden som pausade vill se bevis på förändring i grunden, inte nyckelbyten."])
            ])
          ]
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
