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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

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
          ["Ask the cloud team and contractors first: deleting a project's machines without asking could wipe legitimate work.", "Fråga molnteamet och konsulterna först: att radera ett projekts maskiner utan att fråga kan sudda ut legitimt arbete."]
        ], {
          knowns: [["Unfamiliar GPU machines run in an unused region.", "Okända GPU-maskiner körs i en region som inte används."]],
          uncertainties: [["How the attacker got in and what else they did.", "Hur angriparen kom in och vad mer hen gjorde."]],
          tradeoffs: {
            operational: ["Every hour costs real money.", "Varje timme kostar riktiga pengar."],
            security: ["Deleting first destroys the evidence of how they got in.", "Att radera först förstör bevisen för hur de kom in."],
            legal: ["The provider will want evidence before discussing credit.", "Leverantören vill ha belägg innan den diskuterar kreditering."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Cuts off the access first and keeps one sample of evidence", "Kapar åtkomsten först och behåller ett exempel som bevis"]],
          pushback: {
            A: [
              pb(["The snapshot is slow", "Ögonblicksbilden tar tid"], ["The GPU machine has large disks, and the snapshot will take most of an hour. Until you stop the rest, the meter keeps running at a month's budget per hour. Do you skip the evidence and stop everything now?", "GPU-maskinen har stora diskar, och ögonblicksbilden kommer att ta nästan en timme. Tills ni stoppar resten fortsätter mätaren att ticka med en månadsbudget i timmen. Hoppar ni över bevisen och stoppar allt nu?"]),
              pb(["Disabling tips them off", "Spärren varnar dem"], ["{{person.socLead.name}} points out that the moment the identity is disabled, whoever is behind it knows you have noticed. An hour of watching might show what else it touches. Do you trade a running bill for that visibility, or cut it off blind?", "{{person.socLead.name}} påpekar att i samma stund som identiteten spärras vet den som ligger bakom att ni har märkt det. En timmes bevakning kan visa vad mer den rör. Byter ni en tickande räkning mot den insynen, eller kapar ni i blindo?"]),
              pb(["Whose identity is it?", "Vems identitet är det?"], ["The identity is not a person's login; it looks like something a system uses. Nobody on the call can say what else depends on it, and it is Saturday morning. Do you disable something you cannot name the owner of?", "Identiteten är ingen persons inloggning; den ser ut att användas av ett system. Ingen i samtalet kan säga vad mer som är beroende av den, och det är lördagsmorgon. Spärrar ni något vars ägare ni inte kan namnge?"])
            ],
            B: [
              pb(["They come back", "De kommer tillbaka"], ["Twenty minutes after the deletion, new GPU machines start in the same region. Whatever started them was never touched. Do you delete again and keep chasing, or stop and find out who is starting them?", "Tjugo minuter efter raderingen startar nya GPU-maskiner i samma region. Det som startade dem har ingen rört. Raderar ni igen och fortsätter jaga, eller stannar ni och tar reda på vem som startar dem?"]),
              pb(["Nothing to show", "Inget att visa"], ["{{person.cloudLead.name}} notes that the machines took their disks with them. When the provider asks how they were used, you will have a bill and no evidence. Are you ready to argue about the money with nothing to show?", "{{person.cloudLead.name}} konstaterar att maskinerna tog sina diskar med sig. När leverantören frågar hur de användes har ni en räkning och inga bevis. Är ni beredda att diskutera pengarna utan något att visa upp?"]),
              pb(["No reply yet", "Inget svar ännu"], ["{{person.devLead.name}} is still waiting for the data science team to call back. If any of those machines was theirs, it is gone now. Who answers for it if you were wrong, and do you tell them before they find out?", "{{person.devLead.name}} väntar fortfarande på att analysteamet ska ringa tillbaka. Om någon av maskinerna var deras är den borta nu. Vem står för det om ni hade fel, och säger ni det till dem innan de upptäcker det själva?"])
            ],
            C: [
              pb(["Nobody answers", "Ingen svarar"], ["It is Saturday: the contractors do not pick up, and the data science lead is travelling. Meanwhile the bill grows by roughly a month's budget every hour. How long do you wait for an answer before you act without one?", "Det är lördag: konsulterna svarar inte, och analysteamets chef är på resande fot. Under tiden växer räkningen med ungefär en månadsbudget i timmen. Hur länge väntar ni på ett svar innan ni agerar utan?"]),
              pb(["The CFO wants it off", "Ekonomichefen vill stänga"], ["{{person.cfo.name}} says every minute of asking is money the company will never see again, and asks who authorised spending it. Do you defend the wait, or switch everything off without answers?", "{{person.cfo.name}} säger att varje minut av frågande är pengar som företaget aldrig får tillbaka, och frågar vem som godkände att de spenderas. Försvarar ni väntan, eller stänger ni av allt utan svar?"]),
              pb(["Nobody claims them", "Ingen vill kännas vid dem"], ["Everyone you have reached says the machines are not theirs, and policy says nobody uses that region. You are waiting for a yes that may never come. Is “nobody has said no yet” still a reason to wait?", "Alla ni har nått säger att maskinerna inte är deras, och enligt riktlinjerna använder ingen den regionen. Ni väntar på ett ja som kanske aldrig kommer. Är ”ingen har sagt nej ännu” fortfarande ett skäl att vänta?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because every machine in the region was deleted, a data team's legitimate weekend job was wiped along with the miners.", sv: "Eftersom varje maskin i regionen raderades suddades ett datateams legitima helgjobb ut tillsammans med utvinningen." } }
        ],
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
          evaluation: [["Asks what else the key could do before closing", "Frågar vad mer nyckeln kunde göra innan ärendet avslutas"]],
          pushback: {
            A: [
              pb(["Four months of logs", "Fyra månaders loggar"], ["{{person.socLead.name}} estimates days to review four months of activity, and the oldest weeks of logs may already be gone. Management wants an answer today. Do you narrow the review to the last few days to get one?", "{{person.socLead.name}} räknar med flera dagar för att gå igenom fyra månaders aktivitet, och de äldsta veckornas loggar kan redan vara borta. Ledningen vill ha ett svar i dag. Smalnar ni av genomgången till de senaste dagarna för att få ett?"]),
              pb(["The report tool stops", "Rapportverktyget stannar"], ["Deleting the key stops the contractor's reporting tool, which feeds Monday's management report. The contractor asks for a replacement key today. Do you give them one before the review is finished?", "När nyckeln raderas stannar konsultens rapportverktyg, som matar måndagens ledningsrapport. Konsulten ber om en ny nyckel i dag. Ger ni dem en innan genomgången är klar?"]),
              pb(["Not your repositories", "Inte era kodförråd"], ["The contractor says their other repositories are their own property and declines to let you scan them. Your contract is silent on it. Do you push them on a Saturday, or scan only what you own and accept the gap?", "Konsulten säger att deras andra kodförråd är deras egendom och vill inte låta er söka igenom dem. Avtalet säger ingenting om saken. Pressar ni dem en lördag, eller söker ni bara i det ni äger och accepterar luckan?"])
            ],
            B: [
              pb(["Same key, new name", "Samma nyckel, nytt namn"], ["The new key has exactly the same broad permissions as the old one, including the right to list cluster secrets. Nobody has asked why a reporting tool needs them. Are you handing out the same risk under a new name?", "Den nya nyckeln har exakt samma breda behörigheter som den gamla, inklusive rätten att lista klustrets hemligheter. Ingen har frågat varför ett rapportverktyg behöver dem. Delar ni ut samma risk under ett nytt namn?"]),
              pb(["Where will it live?", "Var ska den ligga?"], ["The contractor asks where to put the new key, because their tool reads it from a configuration file in the repository. That is how the first one leaked. Do you trust the same process with the second?", "Konsulten frågar var den nya nyckeln ska ligga, eftersom deras verktyg läser den från en konfigurationsfil i kodförrådet. Det var så den första läckte. Litar ni på samma process med den andra?"]),
              pb(["Legal says wait", "Juristen säger vänta"], ["{{person.legal.name}} asks you to hold: handing the contractor fresh credentials before anyone has settled what went wrong could weaken your position on who pays the bill. Do you keep the contractor working, or cut them off until it is settled?", "{{person.legal.name}} ber er avvakta: att ge konsulten nya inloggningsuppgifter innan någon har rett ut vad som gick fel kan försvaga er position om vem som betalar räkningen. Låter ni konsulten fortsätta arbeta, eller stänger ni ute dem tills det är utrett?"])
            ],
            C: [
              pb(["One line in the log", "En rad i loggen"], ["{{person.cloudLead.name}} points at one line in the audit log: the key called ListSecrets in the test cluster. Mining does not need secrets. Can you close an incident with a line in the log that nobody has explained?", "{{person.cloudLead.name}} pekar på en rad i granskningsloggen: nyckeln anropade ListSecrets i testklustret. Kryptobrytning behöver inga hemligheter. Kan ni avsluta en incident med en rad i loggen som ingen har förklarat?"]),
              pb(["The CISO won't sign", "CISO skriver inte under"], ["{{person.ciso.name}} refuses to sign the closure: a broad key that was public for hours and never rotated could have done far more than start machines. Who overrules the CISO, and on what evidence?", "{{person.ciso.name}} vägrar skriva under avslutet: en bred nyckel som var offentlig i timmar och aldrig byttes kan ha gjort mycket mer än att starta maskiner. Vem kör över CISO, och med vilka belägg?"]),
              pb(["Still in the history", "Finns kvar i historiken"], ["The key is deleted, but the commit is still public in the repository's history and has already been copied by others. Whatever else sits in that repository is exposed too. Who checks that, if the incident is closed?", "Nyckeln är raderad, men incheckningen finns kvar öppet i kodförrådets historik och har redan kopierats av andra. Allt annat som ligger i det kodförrådet är också exponerat. Vem kontrollerar det, om incidenten är avslutad?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "The provider will suspend the whole account unless you confirm containment. If you took a snapshot first, you have the evidence and the bill ran on. If you deleted everything, you stopped it and have little to show them.", sv: "Leverantören stänger av hela kontot om ni inte bekräftar att det är under kontroll. Om ni tog en ögonblicksbild först har ni bevisen och fakturan fortsatte ticka. Om ni raderade allt stoppade ni det och har lite att visa dem." } },
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
          evaluation: [["Gives the provider honest evidence and keeps the investigation open", "Ger leverantören ärliga belägg och håller utredningen öppen"]],
          pushback: {
            A: [
              pb(["Open questions invite scrutiny", "Öppna frågor lockar granskning"], ["{{person.legal.name}} warns that every open question you list is something the provider can hold you to, and a reason to look wider at your account. Do you still write down what you are still checking, or keep to what you know?", "{{person.legal.name}} varnar för att varje öppen fråga ni listar är något leverantören kan hålla er till, och ett skäl att granska kontot bredare. Skriver ni ändå ner det ni fortfarande kontrollerar, eller håller ni er till det ni vet?"]),
              pb(["The one who knows the logs", "Den som kan loggarna"], ["Only {{person.cloudLead.name}} understands the audit logs well enough to write the report, and it will take most of the afternoon. That is the afternoon the investigation needs. Who writes it instead, and how good will it be?", "Bara {{person.cloudLead.name}} förstår granskningsloggarna tillräckligt väl för att skriva rapporten, och det tar större delen av eftermiddagen. Det är samma eftermiddag som utredningen behöver. Vem skriver den i stället, och hur bra blir den?"]),
              pb(["A named contact, all weekend", "En namngiven kontakt, hela helgen"], ["The named contact must answer the provider through the night and the weekend. Nobody volunteers. Do you name a manager who cannot answer technical questions, or an engineer the investigation cannot spare?", "Den namngivna kontakten måste svara leverantören under natten och helgen. Ingen anmäler sig frivilligt. Anger ni en chef som inte kan svara på tekniska frågor, eller en tekniker som utredningen inte klarar sig utan?"])
            ],
            B: [
              pb(["They asked for root cause", "De bad om grundorsak"], ["The provider's notice asks for containment and root cause. A one-line reply covers neither, and the automated system answers with a reminder of the deadline. Do you send it anyway, and what happens when the clock runs out?", "Leverantörens meddelande ber om bekräftelse på stopp och grundorsak. Ett svar på en rad täcker ingetdera, och det automatiska systemet svarar med en påminnelse om tidsfristen. Skickar ni det ändå, och vad händer när tiden tar slut?"]),
              pb(["Gone is not contained", "Borta är inte stoppat"], ["{{person.socLead.name}} points out that “the machines are gone” is not the same as “the attacker is gone”: nobody has finished checking what else the key did. If more turns up, your confirmation is on record. Do you put your name to it?", "{{person.socLead.name}} påpekar att ”maskinerna är borta” inte är samma sak som ”angriparen är borta”: ingen har gått igenom klart vad mer nyckeln gjorde. Om mer dyker upp finns er bekräftelse på papper. Sätter ni ert namn under den?"]),
              pb(["Betting production", "Satsar produktionen"], ["{{person.cfo.name}} asks what happens to revenue if the provider finds a short email insufficient and suspends the whole account, production included. Is saving a few hours worth that bet?", "{{person.cfo.name}} frågar vad som händer med intäkterna om leverantören tycker att ett kort mejl är otillräckligt och stänger av hela kontot, produktionen inräknad. Är några sparade timmar värda den insatsen?"])
            ],
            C: [
              pb(["Back on Monday", "Tillbaka på måndag"], ["Your account manager's automatic reply says they are back on Monday. The 24 hours run out before then. Do you keep waiting for a person, or write to trust and safety now with what you have?", "Er kundansvariges autosvar säger att hen är tillbaka på måndag. Dygnet går ut före dess. Fortsätter ni vänta på en människa, eller skriver ni till förtroende och säkerhet nu med det ni har?"]),
              pb(["Sales can't stop it", "Säljarna kan inte stoppa det"], ["The account manager calls back but says trust and safety is independent: sales cannot stop an abuse process, only ask them to read your reply. You have spent an hour and still owe them evidence. What do you send?", "Kundansvarige ringer tillbaka men säger att förtroende och säkerhet är fristående: säljsidan kan inte stoppa ett missbruksärende, bara be dem läsa ert svar. Ni har lagt en timme och är fortfarande skyldiga dem belägg. Vad skickar ni?"]),
              pb(["Looks like dodging", "Ser ut som undanflykt"], ["{{person.supplierManager.name}} warns that going around trust and safety to stop their deadline can look like avoiding scrutiny, and such things get noted. Do you want your first contact with them to be a request for an exception?", "{{person.supplierManager.name}} varnar för att gå runt förtroende och säkerhet för att stoppa deras tidsfrist kan se ut som att undvika granskning, och sådant noteras. Vill ni att er första kontakt med dem ska vara en begäran om undantag?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "Hours before the miners, the same key listed secrets and copied a database credential. Was your handling of the key wide enough?", sv: "Timmar före utvinningen listade samma nyckel hemligheter och kopierade en databasinloggning. Var er hantering av nyckeln tillräckligt bred?" } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because your report listed what you were still checking, the provider has extended its review to the whole account.", sv: "Eftersom er rapport listade det ni fortfarande kontrollerade har leverantören utvidgat sin granskning till hela kontot." } }
        ],
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
          evaluation: [["Treats the data access as the real incident and the mining as a symptom", "Behandlar dataåtkomsten som den verkliga incidenten och brytningen som ett symtom"]],
          pushback: {
            A: [
              pb(["Everything breaks at once", "Allt går sönder samtidigt"], ["Rotating all 14 secrets at once will take down the test environment and integrations other teams rely on. {{person.devLead.name}} asks to stagger it over the week instead. Do you accept a slower rotation while the attacker still holds the old ones?", "Att byta alla 14 hemligheter på en gång slår ut testmiljön och integrationer som andra team är beroende av. {{person.devLead.name}} ber att få sprida ut det över veckan i stället. Accepterar ni ett långsammare byte medan angriparen fortfarande har de gamla?"]),
              pb(["Correcting the provider", "Rätta leverantören"], ["Updating the provider means admitting that what you told them earlier was incomplete, while their suspension deadline is still running. Do you tell them now, knowing it may restart their review of the whole account?", "Att uppdatera leverantören innebär att erkänna att det ni sa tidigare var ofullständigt, medan deras tidsfrist för avstängning fortfarande löper. Berättar ni nu, trots att det kan starta om deras granskning av hela kontot?"]),
              pb(["A form with gaps", "Ett formulär med luckor"], ["The regulator's form asks how many people are affected and what data. You know the bucket was read, but not which records or whether anything left the account. Do you file with gaps, and how do you word them?", "Tillsynsmyndighetens formulär frågar hur många som berörs och vilka uppgifter. Ni vet att bucketen lästes, men inte vilka poster eller om något lämnade kontot. Anmäler ni med luckor, och hur formulerar ni dem?"])
            ],
            B: [
              pb(["Test according to whom?", "Test enligt vem?"], ["{{person.devLead.name}} cannot say for certain which of the other 13 secrets are used only in test; several have no owner listed. The attacker holds all of them. Do you leave them active on a guess?", "{{person.devLead.name}} kan inte säga säkert vilka av de andra 13 hemligheterna som bara används i test; flera saknar angiven ägare. Angriparen har dem alla. Låter ni dem vara aktiva på en gissning?"]),
              pb(["“All rotated”?", "”Allt bytt”?"], ["The provider asks you to confirm that all compromised credentials have been rotated before it lifts the abuse flag. Thirteen of them have not. What do you write back?", "Leverantören ber er bekräfta att alla komprometterade inloggningsuppgifter har bytts innan den tar bort missbruksflaggan. Tretton av dem har inte det. Vad svarar ni?"]),
              pb(["Even one is costly", "Redan en kostar"], ["The database credential is shared by four internal services, and rotating it alone takes them all down until each is reconfigured. If one secret costs that much, was “too costly” ever the real reason to skip the other 13?", "Databasinloggningen delas av fyra interna tjänster, och bara att byta den slår ut alla tills var och en har konfigurerats om. Om en hemlighet kostar så mycket, var ”för dyrt” någonsin det verkliga skälet att hoppa över de andra 13?"])
            ],
            C: [
              pb(["The clock already started", "Klockan har redan börjat"], ["{{person.dpo.name}} says reading the data is already a breach and the 72 hours started this morning; proof of copying is not the test. Who signs off on missing the deadline if the answer takes days?", "{{person.dpo.name}} säger att läsningen redan är en personuppgiftsincident och att 72 timmar började gå i morse; bevis på kopiering är inte kriteriet. Vem tar ansvar för en missad tidsfrist om svaret tar flera dagar?"]),
              pb(["The logs cannot tell", "Loggarna kan inte svara"], ["{{person.socLead.name}} explains that the storage logs show the reads, but not where the data went afterwards. You may never know whether it was copied out. If certainty never comes, when do you notify?", "{{person.socLead.name}} förklarar att lagringsloggarna visar läsningarna, men inte vart datan tog vägen sedan. Ni kanske aldrig får veta om den kopierades ut. Om visshet aldrig kommer, när anmäler ni då?"]),
              pb(["A customer asks", "En kund frågar"], ["A customer emails to ask why they received a phishing message quoting their order details. It may have nothing to do with this. Can you keep waiting while customers start asking, and what do you tell this one?", "En kund mejlar och frågar varför de fått ett nätfiskemejl som citerar deras orderuppgifter. Det kanske inte har med det här att göra. Kan ni fortsätta vänta medan kunder börjar fråga, och vad svarar ni den här?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "The provider will credit the bill only with an independent report. Was the answer you gave them the right foundation?", sv: "Leverantören krediterar fakturan bara mot en oberoende rapport. Var svaret ni gav dem rätt grund att stå på?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because all 14 secrets were rotated at once, the test environment and two integrations were down for a day.", sv: "Eftersom alla 14 hemligheter byttes på en gång var testmiljön och två integrationer nere en dag." } }
        ],
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
          evaluation: [["Makes secrets in code detectable and keys short-lived by default", "Gör hemligheter i kod upptäckbara och nycklar kortlivade som standard"]],
          pushback: {
            A: [
              pb(["No room on the roadmap", "Inget utrymme i planen"], ["{{person.devLead.name}} estimates that short-lived credentials and separate accounts will take a large share of every team's time for months. The approved roadmap has no room for it. What do you drop to pay for it?", "{{person.devLead.name}} uppskattar att kortlivade inloggningar och separata konton tar en stor del av varje teams tid i månader. Den godkända planen har inget utrymme för det. Vad stryker ni för att betala för det?"]),
              pb(["Worth it for a test cluster?", "Värt det för ett testkluster?"], ["Moving production to its own account means migrating services that have run together for years, with downtime. {{person.cfo.name}} asks whether that is proportionate after an incident in a test cluster. How do you justify it?", "Att flytta produktionen till ett eget konto innebär att migrera tjänster som körts tillsammans i åratal, med driftstopp. {{person.cfo.name}} frågar om det är rimligt efter en incident i ett testkluster. Hur motiverar ni det?"]),
              pb(["The bypass request", "Begäran om undantag"], ["A pilot of commit scanning in two teams flagged dozens of test strings as secrets, and developers have already asked for a way to skip it. Does a control people learn to bypass make you safer, or only feel safer?", "Ett försök med kontroll vid incheckning i två team flaggade dussintals teststrängar som hemligheter, och utvecklarna har redan bett om ett sätt att hoppa över den. Gör en kontroll som folk lär sig att kringgå er säkrare, eller känns det bara så?"])
            ],
            B: [
              pb(["Fourteen months public", "Fjorton månader offentlig"], ["The key in the public repository is 14 months old. Under a yearly rule it would have been rotated once and still sat public for months. What exactly does the rule fix?", "Nyckeln i det öppna kodförrådet är 14 månader gammal. Med en årlig regel hade den bytts en gång och ändå legat offentligt i månader. Vad är det egentligen regeln löser?"]),
              pb(["A rule without an owner", "En regel utan ägare"], ["62 percent of keys are already older than 90 days, and nobody owns rotating them. A rule without an owner or a check is a document. Who enforces it, and how will you know it is followed?", "62 procent av nycklarna är redan äldre än 90 dagar, och ingen äger bytet av dem. En regel utan ägare eller kontroll är ett dokument. Vem ser till att den följs, och hur får ni veta att den gör det?"]),
              pb(["Rotation day", "Bytesdagen"], ["{{person.cloudLead.name}} warns that rotating every key by hand once a year means one day a year when integrations break across the company. Teams are already asking for exceptions. Do you grant them?", "{{person.cloudLead.name}} varnar för att byta varje nyckel för hand en gång om året innebär en dag om året då integrationer går sönder i hela företaget. Teamen ber redan om undantag. Beviljar ni dem?"])
            ],
            C: [
              pb(["Your own team did it too", "Ert eget team gjorde det också"], ["The public key from last year was committed by your own team, not a contractor. A ban on contractors would not have stopped it. Who is this rule really protecting you from?", "Den öppna nyckeln från förra året checkades in av ert eget team, inte av en konsult. Ett förbud mot konsulter hade inte stoppat den. Vem skyddar regeln er egentligen mot?"]),
              pb(["The work stops", "Arbetet stannar"], ["{{person.supplierManager.name}} says much of this year's cloud work is delivered by contractors; the reporting tool and two migrations stop the day the ban takes effect. Who does that work instead, and by when?", "{{person.supplierManager.name}} säger att mycket av årets molnarbete levereras av konsulter; rapportverktyget och två migreringar stannar samma dag som förbudet börjar gälla. Vem gör det arbetet i stället, och när?"]),
              pb(["Borrowed logins", "Lånade inloggningar"], ["Contractors who still have to deliver will be lent colleagues' credentials “just for today”. That access is invisible and owned by nobody. Would you detect it, and is it better than what you had?", "Konsulter som fortfarande måste leverera kommer att få låna kollegors inloggningar ”bara för i dag”. Den åtkomsten är osynlig och ägs av ingen. Skulle ni upptäcka det, och är det bättre än det ni hade?"])
            ]
          }
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
