/*
 * s29-cloud-cryptomining.js — "The Electricity Bill" (archetype A, cryptomining / cloud abuse).
 *
 * The cloud bill jumps forty-fold overnight: GPU machines in a region you never
 * use → an access key committed to a public repository by a contractor → the
 * provider threatens to suspend the account that also runs production → the
 * miner was noise: the same key read the cluster's secrets and a customer-data
 * bucket → the provider wants a forensic report before any credit → the same
 * mistake sits in three more repositories.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s29-cloud-cryptomining",
    version: 1,
    category: "cryptomining",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "cryptominer",
    title: L(["The Electricity Bill", "Elräkningen"]),
    summary: L([
      "The cloud bill has jumped forty-fold overnight. Someone is mining cryptocurrency on your account. It looks like a billing problem. It is the loudest part of a quieter one.",
      "Molnräkningen har fyrtiofaldigats över en natt. Någon bryter kryptovaluta på ert konto. Det ser ut som ett faktureringsproblem. Det är den mest högljudda delen av ett tystare."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain cloud abuse fast without destroying evidence", "Stoppa missbruk i molnet snabbt utan att förstöra bevis"]), teaser: L(["Stopping the meter", "Att stoppa mätaren"]) },
      { id: "lo2", text: L(["Look past the obvious impact to what the access allowed", "Se förbi den uppenbara skadan till vad åtkomsten tillät"]), teaser: L(["What the noise covers", "Vad bruset döljer"]) },
      { id: "lo3", text: L(["Work with a cloud provider that can suspend you", "Samarbeta med en molnleverantör som kan stänga av er"]), teaser: L(["When your landlord holds the keys", "När hyresvärden har nycklarna"]) },
      { id: "lo4", text: L(["Keep secrets out of code and detect it when they are not", "Hålla hemligheter borta från kod och upptäcka när de inte är det"]), teaser: L(["Things left in plain sight", "Saker som lämnats i öppen dager"]) }
    ],
    mitre: ["T1552", "T1078.004", "T1496", "T1610", "T1530", "T1098"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.DS", "PR.PS", "DE.CM", "DE.AE", "RS.MI", "RS.AN"],
      iso27001: ["A.5.17", "A.5.19", "A.5.23", "A.8.2", "A.8.4", "A.8.9", "A.8.16", "A.8.28"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "weekend" },
    actor: { types: ["criminal"], motivation: L(["Financial: free computing power, then whatever else the key opens", "Ekonomisk: gratis datorkraft, sedan allt annat nyckeln öppnar"]), capability: "medium" },
    variables: {
      spend: { min: 8000, max: 180000, scaleBy: "size", step: 1000, currency: true },
      gpus: { min: 40, max: 400, scaleBy: "size", step: 10 },
      records: { min: 3000, max: 250000, scaleBy: "size", step: 100 }
    },
    roles: ["incidentCommander", "cloudLead", "devLead", "ciso", "socLead", "cfo", "cio", "ceo", "dpo", "legal", "supplierManager", "comms"],

    groundTruth: {
      rootCause: L([
        "A contractor building a reporting tool committed a cloud access key to a public code repository. Within hours an automated scanner found it. The attacker used it to start {{num.gpus}} GPU machines for cryptocurrency mining in a region {{org.name}} never used, and to deploy mining containers in a test cluster. The same key could read the cluster's secrets. The attacker copied database credentials and read a bucket holding about {{num.records|number}} customer records. Three other repositories held similar keys.",
        "En konsult som byggde ett rapportverktyg checkade in en åtkomstnyckel till molnet i ett öppet kodförråd. Inom några timmar hittades den av en automatisk skanner. Angriparen använde den för att starta {{num.gpus}} GPU-maskiner för kryptobrytning i en region som {{org.name}} aldrig använde, och för att driftsätta brytningscontainrar i ett testkluster. Samma nyckel kunde läsa klustrets hemligheter. Angriparen kopierade databasinloggningar och läste en bucket med omkring {{num.records|number}} kundposter. Tre andra kodförråd innehöll liknande nycklar."
      ]),
      attackerTimeline: [
        { at: -1440, text: L(["Access key committed to a public repository.", "Åtkomstnyckeln checkas in i ett öppet kodförråd."]) },
        { at: -1200, text: L(["Automated scanner finds the key; first API calls.", "En automatisk skanner hittar nyckeln; första API-anropen."]) },
        { at: -900, text: L(["Cluster secrets listed and copied.", "Klustrets hemligheter listas och kopieras."]) },
        { at: -600, text: L(["Customer-data bucket read with the copied credentials.", "Bucketen med kunddata läses med de kopierade inloggningarna."]) },
        { at: -480, text: L(["GPU machines and mining containers started.", "GPU-maskiner och brytningscontainrar startas."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-key", revealStage: "p2", text: L(["The key came from a contractor's reporting project, published in a public repository yesterday.", "Nyckeln kom från en konsults rapportprojekt, publicerat i ett öppet kodförråd i går."]) },
      { id: "hf-secrets", revealStage: "p4", text: L(["Hours before the miners started, the key listed cluster secrets and a customer bucket was read.", "Timmar innan brytningen startade listade nyckeln klustrets hemligheter och en kundbucket lästes."]) },
      { id: "hf-repos", revealStage: "p6", text: L(["Similar live keys sit in three further repositories, one of them public.", "Liknande aktiva nycklar finns i ytterligare tre kodförråd, varav ett är öppet."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The budget alert", "Budgetlarmet"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A budget alert reaches {{person.cfo.name}}'s phone during breakfast. The cloud account has spent {{num.spend|currency}} since midnight, more than a normal month.\n\n{{person.cloudLead.name}} logs in from home and finds {{num.gpus}} large GPU machines running at full load in a region on the other side of the world. Nobody at {{org.name}} has ever used that region.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ett budgetlarm når {{person.cfo.name}}s telefon vid frukosten. Molnkontot har förbrukat {{num.spend|currency}} sedan midnatt, mer än en vanlig månad.\n\n{{person.cloudLead.name}} loggar in hemifrån och hittar {{num.gpus}} stora GPU-maskiner som går för fullt i en region på andra sidan jorden. Ingen på {{org.name}} har någonsin använt den regionen."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "siem", "critical", "confirmed", [
            "Budget alert: spend since 00:00 is {{num.spend|currency}} (forecast for month: 41× normal). Top cost: GPU instances, region not in use by policy.",
            "Budgetlarm: förbrukning sedan 00.00 är {{num.spend|currency}} (prognos för månaden: 41 gånger det normala). Största kostnad: GPU-instanser, region som enligt riktlinjerna inte används."
          ], { tests: ["lo1"] }),
          inj("i1-2", 20, "chat", "person.devLead", "medium", "misleading", [
            "“Could be the data science team testing something big over the weekend? I'd ask before killing anything.”",
            "”Kan vara analysteamet som testar något stort över helgen? Jag skulle fråga innan vi dödar något.”"
          ], { facilitatorNote: ["Worth one phone call, not an hour. Nobody uses that region.", "Värt ett telefonsamtal, inte en timme. Ingen använder den regionen."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-spend", type: "line",
          title: L(["Cloud spend per hour", "Molnkostnad per timme"]), unit: L(["cost per hour", "kostnad per timme"]),
          caption: L(["Hours around midnight.", "Timmar kring midnatt."]),
          data: line(["Spend", "Kostnad"], -12, 8, 1, (x, ctx) => (x < -8 ? ctx.vars.spend / 900 : ctx.vars.spend / 9), "hours")
        }],
        questions: {
          technical: [
            q("How do you stop the machines without losing what they can tell you?", "Hur stoppar ni maskinerna utan att förlora det de kan berätta?", ["cloudLead", "socLead"]),
            q("Which identity started them, and from where?", "Vilken identitet startade dem, och varifrån?", ["cloudLead", "socLead"]),
            q("Can you block that region entirely for the account?", "Kan ni blockera hela regionen för kontot?", ["cloudLead"])
          ],
          executive: [
            q("Who can authorise shutting things down on a Saturday morning?", "Vem kan godkänna att saker stängs ner en lördagsmorgon?", ["incidentCommander", "cio"]),
            q("Is this a billing problem or a security incident?", "Är det här ett faktureringsproblem eller en säkerhetsincident?", ["ciso", "cfo"]),
            q("Who calls the cloud provider, and what do you ask for?", "Vem ringer molnleverantören, och vad ber ni om?", ["supplierManager", "cloudLead"])
          ]
        },
        challenges: [ch("The cost is rising by roughly a month's budget every hour.", "Kostnaden ökar med ungefär en månadsbudget i timmen.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Disable the identity that started them, snapshot one machine, then stop the rest.", "Spärra identiteten som startade dem, ta en ögonblicksbild av en maskin och stoppa sedan resten."],
          ["Delete every machine in that region immediately.", "Radera alla maskiner i regionen omedelbart."],
          ["Ask around internally before touching anything.", "Fråga runt internt innan ni rör något."]
        ], {
          knowns: [["Unfamiliar GPU machines run in an unused region.", "Okända GPU-maskiner körs i en region som inte används."]],
          uncertainties: [["How the attacker got in and what else they did.", "Hur angriparen kom in och vad mer hen gjorde."]],
          tradeoffs: {
            operational: ["Every hour costs real money.", "Varje timme kostar riktiga pengar."],
            security: ["Deleting first destroys the evidence of how they got in.", "Att radera först förstör bevisen för hur de kom in."],
            legal: ["The provider will want evidence before discussing credit.", "Leverantören vill ha belägg innan den diskuterar kreditering."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Cuts off the access first and keeps one sample of evidence", "Kapar åtkomsten först och behåller ett exempel som bevis"]]
        }),
        facilitator: fac(
          ["The meter is loud and urgent; the access behind it matters more.", "Mätaren är högljudd och brådskande; åtkomsten bakom den betyder mer."],
          ["Kill the credential, preserve a sample, then stop the machines.", "Döda inloggningen, säkra ett exempel och stoppa sedan maskinerna."],
          [["Ask: if you delete them now, how will you know how they got in?", "Fråga: om ni raderar dem nu, hur ska ni då veta hur de kom in?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Yesterday's commit", "Gårdagens incheckning"]),
        twist: L(["The machines were started with an access key belonging to a contractor's reporting project. The key was committed to a public code repository yesterday afternoon and found within hours.", "Maskinerna startades med en åtkomstnyckel som hör till en konsults rapportprojekt. Nyckeln checkades in i ett öppet kodförråd i går eftermiddag och hittades inom några timmar."]),
        twistKind: "cause",
        assumptionChallenged: L(["Someone hacked into our cloud account.", "Någon har hackat sig in i vårt molnkonto."]),
        reveals: ["hf-key"],
        narrative: L([
          "{{time.T+120|clock}}. The cloud audit log names the culprit, and it is not a person. Every machine was started with one access key, created four months ago for a small reporting project.\n\n{{person.devLead.name}} searches the public code-hosting site for the key's first characters. The result appears in seconds, in a repository with the contractor's name on it.",
          "Klockan {{time.T+120|clock}}. Molnplattformens granskningslogg pekar ut den skyldige, och det är ingen person. Varje maskin startades med en och samma åtkomstnyckel, skapad för fyra månader sedan för ett litet rapportprojekt.\n\n{{person.devLead.name}} söker på den öppna kodtjänsten efter nyckelns första tecken. Träffen dyker upp på några sekunder, i ett kodförråd med konsultens namn på."
        ]),
        injects: [
          inj("i2-1", 120, "authLog", "person.cloudLead", "high", "confirmed", [
            "Cloud audit: RunInstances × {{num.gpus}}, CreateCluster, ListSecrets — all by access key AKIA…7Q2 (“reporting-tool”). First use 23:40 yesterday from {{asset.attackerIp}}. Key created four months ago; never rotated.",
            "Molnets granskningslogg: RunInstances × {{num.gpus}}, CreateCluster, ListSecrets – alla med åtkomstnyckel AKIA…7Q2 (”reporting-tool”). Första användning 23.40 i går från {{asset.attackerIp}}. Nyckeln skapad för fyra månader sedan; aldrig bytt."
          ], { reveals: ["hf-key"], tests: ["lo1", "lo4"] }),
          inj("i2-2", 150, "threatIntel", "threatIntel", "medium", "confirmed", [
            "Keys published in public repositories are typically found by automated scanners within minutes to hours. Mining is the most common first use; credential theft is the most common second.",
            "Nycklar som publiceras i öppna kodförråd hittas vanligen av automatiska skannrar inom minuter till timmar. Kryptobrytning är den vanligaste första användningen; stöld av inloggningsuppgifter den vanligaste andra."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What could that key do besides start machines?", "Vad kunde den nyckeln göra förutom att starta maskiner?", ["cloudLead", "ciso"]),
            q("How do you get the key out of the repository's history, not only the latest version?", "Hur får ni bort nyckeln ur kodförrådets historik, inte bara ur den senaste versionen?", ["devLead"]),
            q("Did snapshotting a machine before stopping the rest pay off?", "Lönade det sig att ta en ögonblicksbild av en maskin innan resten stoppades?", ["socLead"], "d1")
          ],
          executive: [
            q("Is this the contractor's fault, yours, or both?", "Är det här konsultens fel, ert, eller båda?", ["supplierManager", "legal"]),
            q("What does your contract with the contractor say about credentials?", "Vad säger ert avtal med konsulten om inloggningsuppgifter?", ["legal", "supplierManager"]),
            q("If you had deleted everything this morning, would you know this now?", "Om ni hade raderat allt i morse, hade ni vetat det här nu?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The key also has permissions nobody remembers granting.", "Nyckeln har också behörigheter som ingen minns att de gav.")],
        decision: dec("d2", "cloudLead", ["How do you deal with the key?", "Hur hanterar ni nyckeln?"], [
          ["Delete the key, review everything it did since creation, and scan for other keys.", "Radera nyckeln, gå igenom allt den gjort sedan den skapades och sök efter andra nycklar."],
          ["Rotate the key and give the contractor the new one.", "Byt nyckeln och ge konsulten den nya."],
          ["Delete the key and close the incident once the machines are gone.", "Radera nyckeln och avsluta incidenten när maskinerna är borta."]
        ], {
          knowns: [["A long-lived, broad key was public for hours.", "En långlivad nyckel med breda behörigheter var offentlig i timmar."]],
          uncertainties: [["Everything the key was used for besides mining.", "Allt nyckeln användes till förutom kryptobrytning."]],
          tradeoffs: {
            operational: ["A full review of four months of activity takes days.", "En fullständig genomgång av fyra månaders aktivitet tar dagar."],
            security: ["Closing at “machines gone” assumes the attacker only wanted mining.", "Att avsluta vid ”maskinerna borta” förutsätter att angriparen bara ville bryta krypto."],
            legal: ["Contract terms decide who pays for the bill.", "Avtalsvillkoren avgör vem som betalar räkningen."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Asks what else the key could do before closing", "Frågar vad mer nyckeln kunde göra innan ärendet avslutas"]]
        }),
        facilitator: fac(
          ["Cause found; now the trap is to stop at the obvious use of the key.", "Orsaken hittad; nu är fällan att stanna vid den uppenbara användningen av nyckeln."],
          ["Delete the key, review its full history, and hunt for siblings.", "Radera nyckeln, gå igenom hela dess historik och leta efter liknande nycklar."],
          [["Ask: if you had this key, what would you do before mining?", "Fråga: om ni hade den här nyckeln, vad skulle ni göra före kryptobrytningen?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        priority: 1,
        title: L(["Notice of abuse", "Meddelande om missbruk"]),
        twist: L(["The cloud provider has flagged the account for abuse. Unless you confirm containment within 24 hours, it will suspend the whole account, including production.", "Molnleverantören har flaggat kontot för missbruk. Om ni inte bekräftar att det är stoppat inom ett dygn kommer hela kontot att stängas av, inklusive produktionen."]),
        twistKind: "authority",
        assumptionChallenged: L(["Our cloud provider is on our side.", "Vår molnleverantör står på vår sida."]),
        narrative: L([
          "{{time.T+300|clock}}. The machines are stopped and the key deleted. The team is starting to relax when an automated email arrives from the cloud provider's trust and safety team.\n\nIt is polite and firm. The provider's systems noticed the mining before you did, and its rules allow it to protect its platform from accounts that misbehave, whether or not the owner meant it.",
          "Klockan {{time.T+300|clock}}. Maskinerna är stoppade och nyckeln raderad. Teamet börjar slappna av när ett automatiskt mejl kommer från molnleverantörens avdelning för förtroende och säkerhet.\n\nDet är artigt och bestämt. Leverantörens system märkte kryptobrytningen innan ni gjorde det, och dess regler tillåter den att skydda plattformen mot konton som missköter sig, oavsett om ägaren menade det eller inte."
        ]),
        injects: [
          inj("i3-1", 300, "supplierNotice", "vendor", "high", "confirmed", [
            "{{supplier.cloud}} Trust & Safety: “Activity consistent with unauthorised cryptocurrency mining was detected. Confirm containment and root cause within 24 hours, or the account will be suspended.”",
            "{{supplier.cloud}} Trust & Safety: ”Aktivitet som stämmer med obehörig kryptobrytning har upptäckts. Bekräfta att den stoppats och ange grundorsak inom 24 timmar, annars stängs kontot av.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What evidence of containment will the provider accept?", "Vilka belägg för att det är stoppat accepterar leverantören?", ["cloudLead"]),
            q("Is production in the same account as the test cluster, and why?", "Ligger produktionen i samma konto som testklustret, och varför?", ["cloudLead", "cio"]),
            q("Did the full review of the key's history find anything yet?", "Har den fullständiga genomgången av nyckelns historik hittat något ännu?", ["socLead"], "d2")
          ],
          executive: [
            q("What happens to the business if the account is suspended tomorrow?", "Vad händer med verksamheten om kontot stängs av i morgon?", ["cio", "cfo"]),
            q("Who has a relationship with the provider that can help?", "Vem har en relation till leverantören som kan hjälpa?", ["supplierManager"]),
            q("Would closing the incident at “machines gone” have satisfied the provider?", "Hade det räckt för leverantören om ni avslutat incidenten vid ”maskinerna borta”?", ["cloudLead"], "d2")
          ]
        },
        challenges: [ch("The provider's support line routes weekend abuse cases to email only.", "Leverantörens support skickar missbruksärenden på helger enbart till e-post.")],
        decision: dec("d3", "cio", ["How do you answer the provider?", "Hur svarar ni leverantören?"], [
          ["A clear written report: what happened, what you stopped, what you are still checking, with a named contact.", "En tydlig skriftlig rapport: vad som hände, vad ni stoppat, vad ni fortfarande kontrollerar, med en namngiven kontakt."],
          ["A short confirmation that the machines are gone.", "En kort bekräftelse på att maskinerna är borta."],
          ["Escalate through your account manager to stop the deadline.", "Eskalera via er kundansvarige för att stoppa tidsfristen."]
        ], {
          knowns: [["The provider can suspend the whole account.", "Leverantören kan stänga av hela kontot."]],
          uncertainties: [["What the provider will consider sufficient.", "Vad leverantören kommer att anse vara tillräckligt."]],
          tradeoffs: {
            operational: ["A thorough report takes hours you also need for the investigation.", "En grundlig rapport tar timmar som ni också behöver för utredningen."],
            security: ["Overstating containment is risky if more is found later.", "Att överdriva hur väl det stoppats är riskabelt om mer hittas senare."],
            legal: ["The provider's terms bind you either way.", "Leverantörens villkor binder er oavsett."],
            reputational: ["A suspension would be visible to every customer.", "En avstängning skulle synas för varje kund."]
          },
          evaluation: [["Gives the provider honest evidence and keeps the investigation open", "Ger leverantören ärliga belägg och håller utredningen öppen"]]
        }),
        facilitator: fac(
          ["Cloud providers have their own authority. Shared accounts make one mistake everyone's problem.", "Molnleverantörer har sin egen befogenhet. Delade konton gör ett misstag till allas problem."],
          ["An honest, evidence-based report with open questions stated.", "En ärlig rapport byggd på belägg, med öppna frågor angivna."],
          [["Ask: what would you need to see, if you were the provider?", "Fråga: vad skulle ni behöva se, om ni var leverantören?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 600,
        title: L(["Before the miners", "Före brytningen"]),
        twist: L(["The mining started at 01:20. Hours earlier, the same key listed the test cluster's secrets, copied a database credential, and read a storage bucket holding about {{num.records|number}} customer records.", "Brytningen startade 01.20. Flera timmar tidigare listade samma nyckel testklustrets hemligheter, kopierade en databasinloggning och läste en lagringsbucket med omkring {{num.records|number}} kundposter."]),
        twistKind: "scope",
        assumptionChallenged: L(["The attacker wanted free computing power.", "Angriparen ville ha gratis datorkraft."]),
        reveals: ["hf-secrets"],
        narrative: L([
          "{{time.T+600|clock}}. The full review of the key's history is back. {{person.socLead.name}} lays the timeline out on the table, starting at the moment the key was first used.\n\nThe mining is at the end of the story, not the beginning. Before it, there are several quiet hours of activity that never showed up on any bill, because reading data costs almost nothing.",
          "Klockan {{time.T+600|clock}}. Den fullständiga genomgången av nyckelns historik är klar. {{person.socLead.name}} lägger ut tidslinjen på bordet, med början i det ögonblick nyckeln först användes.\n\nKryptobrytningen ligger i slutet av berättelsen, inte i början. Före den finns flera tysta timmar av aktivitet som aldrig syntes på någon räkning, eftersom det nästan inte kostar något att läsa data."
        ]),
        injects: [
          inj("i4-1", 600, "forensicFinding", "forensics", "critical", "confirmed", [
            "23:40 first use. 23:52 ListSecrets in the test cluster (14 secrets, incl. a read replica credential). 00:30–01:05 GetObject × 9,200 on the customer-exports bucket. 01:20 mining starts.",
            "23.40 första användning. 23.52 ListSecrets i testklustret (14 hemligheter, bland annat inloggning till en läsreplik). 00.30–01.05 GetObject × 9 200 mot bucketen för kundexporter. 01.20 brytningen startar."
          ], { reveals: ["hf-secrets"], tests: ["lo2"] }),
          inj("i4-2", 640, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“A bucket of customer exports was read by an attacker. That is a personal data breach. Awareness was this morning; the 72 hours started then.”",
            "”En bucket med kundexporter har lästs av en angripare. Det är en personuppgiftsincident. Kännedomen kom i morse; 72-timmarsfristen började då.”"
          ], { tests: ["lo2"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What the key did", "Vad nyckeln gjorde"]),
          data: kpi([
            { id: "gpu", label: ["GPU machines started", "Startade GPU-maskiner"], value: (v) => v.gpus, tone: "warn" },
            { id: "sec", label: ["Cluster secrets read", "Lästa klusterhemligheter"], value: 14, tone: "danger" },
            { id: "rec", label: ["Customer records exposed", "Exponerade kundposter"], value: (v) => v.records, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Which of the 14 secrets do you rotate first?", "Vilken av de 14 hemligheterna byter ni först?", ["cloudLead", "devLead"]),
            q("Was the copied database credential used anywhere?", "Har den kopierade databasinloggningen använts någonstans?", ["socLead"]),
            q("Is your report to the provider still accurate?", "Stämmer er rapport till leverantören fortfarande?", ["cloudLead"], "d3")
          ],
          executive: [
            q("Who do you notify, and what do you tell customers?", "Vem anmäler ni till, och vad säger ni till kunderna?", ["dpo", "legal"]),
            q("Does the contractor's role change your notification?", "Ändrar konsultens roll er anmälan?", ["legal"]),
            q("Did you promise the provider anything you now have to correct?", "Lovade ni leverantören något som ni nu måste rätta?", ["cio"], "d3")
          ]
        },
        challenges: [ch("The bucket was meant to be emptied every week; the clean-up job broke in the spring.", "Bucketen skulle tömmas varje vecka; städjobbet slutade fungera i våras.")],
        decision: dec("d4", "ciso", ["What now?", "Vad gör ni nu?"], [
          ["Rotate all 14 secrets, check where the database credential was used, notify the regulator, and update the provider.", "Byt alla 14 hemligheter, kontrollera var databasinloggningen använts, anmäl till tillsynsmyndigheten och uppdatera leverantören."],
          ["Rotate the database credential only; the others were for testing.", "Byt bara databasinloggningen; de andra var för test."],
          ["Wait to notify until you know whether the records were copied out.", "Vänta med anmälan tills ni vet om posterna kopierades ut."]
        ], {
          knowns: [["Secrets and customer data were read before the mining started.", "Hemligheter och kunddata lästes innan brytningen startade."]],
          uncertainties: [["Whether the credentials have been used against production.", "Om inloggningsuppgifterna har använts mot produktionen."]],
          tradeoffs: {
            operational: ["Rotating all secrets breaks several test services today.", "Att byta alla hemligheter slår ut flera testtjänster i dag."],
            security: ["“Test” secrets often open production doors.", "”Test”-hemligheter öppnar ofta dörrar till produktionen."],
            legal: ["Reading is enough for a breach; the clock is running.", "Läsning räcker för en incident; klockan går."],
            reputational: ["Customers will hear of it; better from you.", "Kunderna kommer att få höra om det; bättre från er."]
          },
          evaluation: [["Treats the data access as the real incident and the mining as a symptom", "Behandlar dataåtkomsten som den verkliga incidenten och brytningen som ett symtom"]]
        }),
        facilitator: fac(
          ["The classic twist: loud abuse hides quiet theft. See who wanted to close on day one.", "Den klassiska vändningen: högljutt missbruk döljer tyst stöld. Se vem som ville avsluta första dagen."],
          ["Rotate everything, trace the credential, notify, correct the provider report.", "Byt allt, spåra inloggningen, anmäl, rätta rapporten till leverantören."],
          [["Ask: what costs nothing on the bill but everything to the customer?", "Fråga: vad kostar ingenting på räkningen men allt för kunden?"]]
        )
      },
      {
        id: "p5",
        clock: 2880,
        priority: 2,
        title: L(["Who pays", "Vem betalar"]),
        twist: L(["The provider will consider crediting the bill only with an independent forensic report. The contractor's insurer says the key was your account, so the loss is yours.", "Leverantören överväger att kreditera räkningen endast mot en oberoende forensisk rapport. Konsultens försäkringsbolag säger att nyckeln tillhörde ert konto, så förlusten är er."]),
        twistKind: "impact",
        assumptionChallenged: L(["The provider will waive a bill caused by fraud.", "Leverantören avskriver en räkning som orsakats av bedrägeri."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The technical work is mostly done. What remains is a bill of {{num.spend|currency}} and a growing pile of emails between finance, procurement, the provider and the contractor.\n\nEverybody agrees that something went wrong. Nobody agrees that it was their fault, and each party has a document that supports its own view.",
          "{{time.T+2880|weekday|cap}}. Det tekniska arbetet är i stort sett klart. Det som återstår är en räkning på {{num.spend|currency}} och en växande hög mejl mellan ekonomi, inköp, leverantören och konsulten.\n\nAlla är överens om att något gick fel. Ingen är överens om att det var deras fel, och varje part har ett dokument som stöder den egna uppfattningen."
        ]),
        injects: [
          inj("i5-1", 2880, "email", "insurer", "medium", "confirmed", [
            "The contractor's insurer: “The access key was created in, and owned by, your cloud account, with permissions you granted. We do not accept liability for its misuse.”",
            "Konsultens försäkringsbolag: ”Åtkomstnyckeln skapades i, och ägdes av, ert molnkonto, med behörigheter som ni gav. Vi tar inget ansvar för att den missbrukades.”"
          ], { headline: ["Claim: unauthorised cloud usage", "Skadeanmälan: obehörig molnanvändning"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Who granted the key its broad permissions, and why?", "Vem gav nyckeln dess breda behörigheter, och varför?", ["cloudLead"]),
            q("What would an independent forensic report need from you?", "Vad skulle en oberoende forensisk rapport behöva från er?", ["socLead"]),
            q("Did rotating everything break anything you have not fixed yet?", "Slog bytet av allt ut något som ni ännu inte har lagat?", ["devLead"], "d4")
          ],
          executive: [
            q("Is the bill worth fighting over, compared to the breach?", "Är räkningen värd att strida om, jämfört med intrånget?", ["cfo", "ceo"]),
            q("What will you change in contractor contracts?", "Vad kommer ni att ändra i konsultavtalen?", ["supplierManager", "legal"]),
            q("How did notifying early affect the provider's attitude?", "Hur påverkade den tidiga anmälan leverantörens inställning?", ["cio"], "d4")
          ]
        },
        challenges: [ch("The contractor's developer has posted publicly that “the client gave me an admin key”.", "Konsultens utvecklare har skrivit offentligt att ”kunden gav mig en administratörsnyckel”.")],
        noDecision: L(["No vote: the money follows contracts. Let the room plan the forensic report and the contract changes.", "Ingen omröstning: pengarna följer avtalen. Låt rummet planera den forensiska rapporten och avtalsändringarna."]),
        facilitator: fac(
          ["The financial fight is a distraction from the lesson: broad, long-lived keys are your responsibility.", "Striden om pengarna är en distraktion från lärdomen: breda, långlivade nycklar är ert ansvar."],
          ["Commission the report, accept the shared responsibility, and fix the contracts.", "Beställ rapporten, acceptera det delade ansvaret och rätta avtalen."],
          [["Ask: who in your company can create a key like this today?", "Fråga: vem på ert företag kan skapa en sådan nyckel i dag?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Three more keys", "Tre nycklar till"]),
        twist: L(["A secrets scan of every repository finds three more live cloud keys, one of them in a public repository published by your own team last year.", "En genomsökning efter hemligheter i alla kodförråd hittar ytterligare tre aktiva molnnycklar, varav en i ett öppet kodförråd som ert eget team publicerade förra året."]),
        twistKind: "scope",
        assumptionChallenged: L(["The contractor made a one-off mistake.", "Konsulten gjorde ett enstaka misstag."]),
        reveals: ["hf-repos"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. {{person.devLead.name}} has run a secrets scanner across every code repository the company owns, internal and public, including old ones nobody thinks about.\n\nThe contractor's mistake was not unique. The scan also shows how long some of these keys have been sitting in plain sight, waiting for the same automated scanners to find them.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. {{person.devLead.name}} har kört en sökning efter hemligheter i alla kodförråd som företaget äger, interna och öppna, även gamla som ingen tänker på.\n\nKonsultens misstag var inte unikt. Sökningen visar också hur länge några av nycklarna har legat i öppen dager och väntat på att samma automatiska skannrar ska hitta dem."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.devLead", "high", "confirmed", [
            "Secrets scan: 3 live cloud keys (1 in a public repository, 14 months old), 11 database passwords, 6 API tokens. Secret scanning on commit: not enabled. Keys older than 90 days: 62 percent.",
            "Sökning efter hemligheter: 3 aktiva molnnycklar (1 i ett öppet kodförråd, 14 månader gammal), 11 databaslösenord, 6 API-token. Kontroll av hemligheter vid incheckning: inte påslagen. Nycklar äldre än 90 dagar: 62 procent."
          ], { reveals: ["hf-repos"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you stop secrets reaching repositories in the first place?", "Hur stoppar ni att hemligheter hamnar i kodförråd från början?", ["devLead"]),
            q("Can you replace long-lived keys with short-lived credentials?", "Kan ni ersätta långlivade nycklar med kortlivade inloggningar?", ["cloudLead"]),
            q("Looking back, did deleting the first key without hunting for others leave a gap?", "När ni ser tillbaka, lämnade det en lucka att radera den första nyckeln utan att leta efter andra?", ["cloudLead"], "d2")
          ],
          executive: [
            q("Who owns cloud credentials across teams and contractors?", "Vem äger molninloggningar över team och konsulter?", ["cio", "ciso"]),
            q("Should production live in its own account?", "Bör produktionen ligga i ett eget konto?", ["cio", "cloudLead"]),
            q("Which decision on the first morning mattered most?", "Vilket beslut den första morgonen spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The public key from last year belongs to a demo nobody remembers building.", "Den öppna nyckeln från förra året hör till en demo som ingen minns att de byggde.")],
        decision: dec("d5", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["Secret scanning on every commit, short-lived credentials, separate production accounts and region restrictions.", "Kontroll av hemligheter vid varje incheckning, kortlivade inloggningar, separata produktionskonton och regionbegränsningar."],
          ["A rule that keys must be rotated yearly.", "En regel om att nycklar ska bytas varje år."],
          ["Ban contractors from having cloud access.", "Förbjud konsulter att ha molnåtkomst."]
        ], {
          knowns: [["Several live secrets sit in repositories, some public.", "Flera aktiva hemligheter ligger i kodförråd, en del öppna."]],
          uncertainties: [["Whether any of the other keys has already been found.", "Om någon av de andra nycklarna redan har hittats."]],
          tradeoffs: {
            operational: ["Short-lived credentials need pipeline changes.", "Kortlivade inloggningar kräver ändringar i pipelines."],
            security: ["Yearly rotation still leaves a key public for months.", "Årligt byte lämnar fortfarande en nyckel offentlig i månader."],
            legal: ["Contractors will still need access somehow.", "Konsulter kommer fortfarande att behöva åtkomst på något sätt."],
            reputational: ["A second incident from the same cause would be hard to explain.", "En andra incident med samma orsak vore svår att förklara."]
          },
          evaluation: [["Makes secrets in code detectable and keys short-lived by default", "Gör hemligheter i kod upptäckbara och nycklar kortlivade som standard"]]
        }),
        facilitator: fac(
          ["End on prevention: scanning, short-lived credentials, account separation.", "Avsluta med förebyggande: genomsökning, kortlivade inloggningar, separerade konton."],
          ["Commit scanning, short-lived credentials, separated accounts, region limits.", "Kontroll vid incheckning, kortlivade inloggningar, separerade konton, regionbegränsningar."],
          [["Ask: how long would a public key of yours live before you noticed?", "Fråga: hur länge skulle en av era nycklar ligga öppen innan ni märkte det?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The mining is stopped and the keys rotated, but customer records were read, the bill is disputed for months, and three more keys were waiting to be found.",
        "Kryptobrytningen är stoppad och nycklarna bytta, men kundposter lästes, räkningen är omstridd i månader och ytterligare tre nycklar väntade på att hittas."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Cryptomining is often the loudest symptom, not the whole incident.", "Kryptobrytning är ofta det mest högljudda symtomet, inte hela incidenten."]),
        L(["Cut the credential first and keep evidence; deleting machines first loses the story.", "Kapa inloggningen först och behåll bevis; att radera maskinerna först förlorar berättelsen."]),
        L(["Ask what else the access allowed, especially reads that cost nothing.", "Fråga vad mer åtkomsten tillät, särskilt läsningar som inte kostar något."]),
        L(["Secrets in code are found in hours; scan for them and keep keys short-lived.", "Hemligheter i kod hittas inom timmar; sök efter dem och håll nycklar kortlivade."])
      ],
      assumptionsVsReality: [
        avr(["Someone hacked the cloud account.", "Någon hackade molnkontot."], ["A key was published in a public repository.", "En nyckel publicerades i ett öppet kodförråd."], "p2"),
        avr(["The attacker wanted computing power.", "Angriparen ville ha datorkraft."], ["Secrets and customer data were read first.", "Hemligheter och kunddata lästes först."], "p4"),
        avr(["A one-off contractor mistake.", "Ett enstaka misstag av en konsult."], ["Three more live keys sat in repositories.", "Ytterligare tre aktiva nycklar låg i kodförråd."], "p6")
      ],
      strengthsToLookFor: [
        L(["Disabling the key before deleting machines", "Att spärra nyckeln innan maskinerna raderas"]),
        L(["Reviewing everything the key did", "Att gå igenom allt nyckeln gjorde"]),
        L(["Being honest with the provider about open questions", "Att vara ärlig mot leverantören om öppna frågor"])
      ],
      commonGaps: [
        L(["Closing once the bill stops rising", "Att avsluta när räkningen slutar stiga"]),
        L(["Forgetting the provider can suspend the account", "Att glömma att leverantören kan stänga av kontot"]),
        L(["Not scanning for other secrets", "Att inte söka efter andra hemligheter"])
      ],
      suggestedActions: [
        act(["Enable secret scanning on every commit and on public repositories.", "Slå på kontroll av hemligheter vid varje incheckning och för öppna kodförråd."], "devLead", "high"),
        act(["Replace long-lived access keys with short-lived credentials.", "Ersätt långlivade åtkomstnycklar med kortlivade inloggningar."], "cloudLead", "high"),
        act(["Separate production into its own account and block unused regions.", "Lägg produktionen i ett eget konto och blockera regioner som inte används."], "cio", "medium"),
        act(["Add credential handling terms to contractor agreements.", "Lägg till villkor för hantering av inloggningsuppgifter i konsultavtalen."], "supplierManager", "medium")
      ]
    }
  });
})();
