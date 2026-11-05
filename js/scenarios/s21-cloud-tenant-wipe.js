/*
 * s21-cloud-tenant-wipe.js — "Everything in the Cloud Is Gone" (archetype A, cloud destruction).
 *
 * Production resources disappear from the cloud subscription → the deletions
 * came from the deployment pipeline's own identity, using a token stolen from a
 * developer's laptop → the backups lived in the same tenant and were deleted
 * too → before deleting, the attacker copied the customer database → an
 * extortion message and a choice between rebuilding and negotiating → rebuild
 * from code, with the provider's help and the customers waiting.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s21-cloud-tenant-wipe",
    version: 1,
    category: "cloud-destruction",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "cloud-wipe",
    title: L(["Everything in the Cloud Is Gone", "Allt i molnet är borta"]),
    summary: L([
      "Production servers vanish from the cloud one by one. Then the databases. Then the backups. Nobody inside pressed delete, but someone with your pipeline's keys did.",
      "Produktionsservrar försvinner ur molnet en efter en. Sedan databaserna. Sedan säkerhetskopiorna. Ingen internt tryckte på radera, men någon med er byggkedjas nycklar gjorde det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Stop an attacker who is using legitimate cloud administration", "Stoppa en angripare som använder legitim molnadministration"]), teaser: L(["When normal tools are used against you", "När vanliga verktyg används mot er"]) },
      { id: "lo2", text: L(["Keep backups out of reach of the identities that run production", "Hålla säkerhetskopior utom räckhåll för de identiteter som driver produktionen"]), teaser: L(["Keeping your safety net safe", "Att skydda sitt skyddsnät"]) },
      { id: "lo3", text: L(["Recognise data theft hidden behind destruction", "Upptäcka datastöld som döljs bakom förstörelse"]), teaser: L(["What the loud part might hide", "Vad det högljudda kan dölja"]) },
      { id: "lo4", text: L(["Rebuild from code under customer pressure", "Återuppbygga från kod under tryck från kunderna"]), teaser: L(["Rebuilding while others wait", "Att bygga upp igen medan andra väntar"]) }
    ],
    mitre: ["T1078.004", "T1528", "T1485", "T1490", "T1537", "T1657"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.DS", "PR.PS", "DE.CM", "RS.MA", "RS.MI", "RC.RP"],
      iso27001: ["A.5.15", "A.5.23", "A.5.24", "A.5.29", "A.8.13", "A.8.15", "A.8.16", "A.8.32"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "weekend", sectors: ["technology", "retail", "finance", "logistics"] },
    actor: { types: ["criminal"], motivation: L(["Financial: destruction to force payment, with stolen data as a second lever", "Ekonomisk: förstörelse för att tvinga fram betalning, med stulna data som ytterligare påtryckning"]), capability: "high" },
    variables: {
      resourcesDeleted: { min: 40, max: 900, scaleBy: "size" },
      customers: { min: 300, max: 40000, scaleBy: "size", step: 10 },
      demand: { min: 1000000, max: 15000000, scaleBy: "size", step: 500000, currency: true },
      rebuildHours: { min: 18, max: 96 }
    },
    roles: ["incidentCommander", "cloudLead", "devLead", "ciso", "socLead", "ceo", "cfo", "cio", "legal", "dpo", "comms", "serviceOwner", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "Infostealer malware on a developer's laptop took a long-lived token for the deployment pipeline's cloud identity, which had owner rights on every subscription including backups. The attacker used it to copy the customer database snapshot to an outside account, then deleted production resources and the backup vault, whose deletion protection had been switched off months earlier.",
        "Skadlig kod som stjäl uppgifter på en utvecklares dator tog en långlivad token för byggkedjans molnidentitet, som hade ägarrättigheter på alla prenumerationer inklusive säkerhetskopiorna. Angriparen använde den för att kopiera ögonblicksbilden av kunddatabasen till ett externt konto, och raderade sedan produktionsresurserna och säkerhetskopieringsvalvet, vars raderingsskydd hade stängts av flera månader tidigare."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Infostealer runs on a developer's laptop via a fake tool installer.", "Skadlig kod körs på en utvecklares dator via ett falskt installationsprogram."]) },
        { at: -2880, text: L(["Pipeline token tested from an outside address.", "Byggkedjans token testas från en extern adress."]) },
        { at: -180, text: L(["Customer database snapshot copied to an outside storage account.", "Ögonblicksbild av kunddatabasen kopieras till ett externt lagringskonto."]) },
        { at: -20, text: L(["Backup vault and its recovery points deleted.", "Säkerhetskopieringsvalvet och dess återställningspunkter raderas."]) },
        { at: 0, text: L(["Production resources deleted in bulk.", "Produktionsresurser raderas i stor skala."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-token", revealStage: "p2", text: L(["The deletions used a pipeline token taken from a developer laptop by infostealer malware.", "Raderingarna gjordes med en token för byggkedjan som tagits från en utvecklardator av skadlig kod."]) },
      { id: "hf-vault", revealStage: "p3", text: L(["Deletion protection on the backup vault was switched off during a cost-saving change.", "Raderingsskyddet på säkerhetskopieringsvalvet stängdes av vid en kostnadsbesparing."]) },
      { id: "hf-copy", revealStage: "p4", text: L(["The customer database snapshot was copied to an attacker-controlled account before anything was deleted.", "Ögonblicksbilden av kunddatabasen kopierades till ett konto som angriparen kontrollerar innan något raderades."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Resources disappearing", "Resurser försvinner"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A quiet weekend, until monitoring at {{org.name}} goes red: {{org.service.customer|lcfirst}} is down.\n\nThe cloud console shows something nobody has seen before: production servers being deleted, one after another, while the on-call engineer watches. Customers are getting errors on every page. Every minute, there is less left to save.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En lugn helg, tills övervakningen hos {{org.name}} slår om till rött: {{org.service.customer|lcfirst}} ligger nere.\n\nMolnkonsolen visar något som ingen har sett förut: produktionsservrar som raderas, en efter en, medan jourhavande tekniker tittar på. Kunderna får fel på varje sida. För varje minut finns det mindre kvar att rädda."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "siem", "critical", "confirmed", [
            "Bulk delete operations on production subscription: virtual machines, disks, load balancers. Caller: the deployment pipeline's identity.",
            "Massraderingar i produktionsprenumerationen: virtuella maskiner, diskar, lastbalanserare. Anropare: byggkedjans identitet."
          ], { headline: ["Unusual bulk deletions", "Ovanliga massraderingar"], tests: ["lo1"] }),
          inj("i1-2", 10, "ticket", "serviceDesk", "high", "confirmed", [
            "Customers report errors on every page of {{org.service.customer|lcfirst}}. The status page still says “all systems operational”.",
            "Kunder rapporterar fel på varje sida i {{org.service.customer|lcfirst}}. Statussidan säger fortfarande ”alla system i drift”."
          ], { tests: ["lo4"] }),
          inj("i1-3", 20, "chat", "itOps", "medium", "misleading", [
            "On call: “Probably a broken deployment script. Let me roll back the last release.”",
            "Beredskapen: ”Förmodligen ett trasigt driftsättningsskript. Jag rullar tillbaka senaste releasen.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible and wrong: rolling back runs the same compromised pipeline identity again.", "Rimligt och fel: en återrullning kör samma komprometterade identitet i byggkedjan igen."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-deleted", type: "line",
          title: L(["Resources in the production subscription", "Resurser i produktionsprenumerationen"]), unit: L(["resources", "resurser"]),
          caption: L(["Minutes relative to the first alert.", "Minuter i förhållande till det första larmet."]),
          data: line(["Resources", "Resurser"], -60, 30, 5, (x, ctx) => (x < 0 ? ctx.vars.resourcesDeleted + 20 : Math.max(20, ctx.vars.resourcesDeleted + 20 - (x / 30) * ctx.vars.resourcesDeleted)))
        }],
        questions: {
          technical: [
            q("How do you stop an identity that is allowed to do what it is doing?", "Hur stoppar ni en identitet som har behörighet att göra det den gör?", ["cloudLead"]),
            q("Who can disable the pipeline's identity right now, and with what account?", "Vem kan stänga av byggkedjans identitet just nu, och med vilket konto?", ["cloudLead", "devLead"]),
            q("What evidence do you lose if more resources disappear?", "Vilka bevis förlorar ni om fler resurser försvinner?", ["socLead"])
          ],
          executive: [
            q("Who has the authority to stop all deployments, on a weekend?", "Vem har befogenhet att stoppa all driftsättning, en helg?", ["incidentCommander"]),
            q("What do customers see, and what do you tell them in the next hour?", "Vad ser kunderna, och vad säger ni till dem den närmaste timmen?", ["comms", "serviceOwner"]),
            q("Is this an outage or an attack, and does the answer change your first step?", "Är det här ett avbrott eller ett angrepp, och ändrar svaret ert första steg?", ["ceo"])
          ]
        },
        challenges: [ch("The cloud engineer on call can only reach the console through the same single sign-on the pipeline uses.", "Molnteknikern i beredskap kommer bara åt konsolen via samma inloggning som byggkedjan använder.")],
        decision: dec("d1", "cloudLead", ["What do you do in the next ten minutes?", "Vad gör ni de närmaste tio minuterna?"], [
          ["Disable the pipeline identity and revoke its tokens, then use the break-glass account.", "Stäng av byggkedjans identitet och återkalla dess token, använd sedan nödkontot."],
          ["Roll back the last release.", "Rulla tillbaka den senaste releasen."],
          ["Open a priority case with the cloud provider and wait.", "Öppna ett prioriterat ärende hos molnleverantören och vänta."]
        ], {
          knowns: [["Deletions are being made by the pipeline's identity.", "Raderingarna görs av byggkedjans identitet."], ["Customers are affected.", "Kunderna påverkas."]],
          uncertainties: [["Whether anything other than production is being touched.", "Om något annat än produktionen berörs."]],
          tradeoffs: {
            operational: ["Disabling the pipeline stops all deployments, including fixes.", "Att stänga av byggkedjan stoppar all driftsättning, även rättningar."],
            security: ["Every minute the identity is active, more is deleted.", "Varje minut identiteten är aktiv raderas mer."],
            legal: ["Evidence of who did what lives in the activity log.", "Bevisen för vem som gjorde vad finns i aktivitetsloggen."],
            reputational: ["The status page is still green.", "Statussidan är fortfarande grön."]
          },
          evaluation: [["Stops the identity before investigating the cause", "Stoppar identiteten innan orsaken utreds"]],
          pushback: {
            A: [
              pb(["The break-glass account fails", "Nödkontot fungerar inte"], ["The break-glass account asks for a second factor tied to the phone of an engineer who left last year. Nobody else can sign in with owner rights. Do you wait for the provider to reset it, or re-enable single sign-on to finish the job?", "Nödkontot kräver en andra faktor kopplad till telefonen hos en tekniker som slutade förra året. Ingen annan kan logga in med ägarrättigheter. Väntar ni på att leverantören återställer det, eller slår ni på den gemensamma inloggningen igen för att slutföra jobbet?"]),
              pb(["“It might be my script”", "”Det kan vara mitt skript”"], ["A developer messages: they started a weekend clean-up of old test environments through the pipeline. Disabling the identity mid-run could leave everything half deleted and impossible to tell apart. Do you hold the switch for five minutes to ask, or cut it now?", "En utvecklare skriver: hen startade en helgstädning av gamla testmiljöer via byggkedjan. Att stänga av identiteten mitt i körningen kan lämna allt halvraderat och omöjligt att reda ut. Väntar ni fem minuter för att fråga, eller kapar ni nu?"]),
              pb(["Tokens outlive the switch", "Token överlever avstängningen"], ["The identity is disabled, but deletions keep coming: tokens already issued stay valid until they expire, up to an hour. Disabling was not the stop you thought. What else do you cut while the clock runs out?", "Identiteten är avstängd, men raderingarna fortsätter: token som redan utfärdats gäller tills de löper ut, upp till en timme. Avstängningen var inte det stopp ni trodde. Vad mer kapar ni medan tiden går?"])
            ],
            B: [
              pb(["The rollback succeeded", "Återrullningen lyckades"], ["The rollback reports success. In the minutes it ran, two more databases disappeared from the console. Do you try an older release, or admit the release was never the cause?", "Återrullningen rapporterar att den lyckades. Under minuterna den körde försvann ytterligare två databaser ur konsolen. Provar ni en äldre release, eller erkänner ni att releasen aldrig var orsaken?"]),
              pb(["A week-old release", "En vecka gammal release"], ["The last release went out on Wednesday and ran cleanly for days. Nothing was deployed today. Why would it start deleting production on a quiet weekend, and what are you actually rolling back?", "Den senaste releasen gick ut i onsdags och har fungerat i flera dagar. Inget driftsattes i dag. Varför skulle den börja radera produktionen en lugn helg, och vad är det egentligen ni rullar tillbaka?"]),
              pb(["The engineer refuses", "Teknikern vägrar"], ["The on-call engineer will not press the button: “The pipeline is what is deleting our servers. You want me to run the pipeline again?” Do you overrule the person closest to the problem, or change your plan?", "Jourhavande tekniker vägrar trycka på knappen: ”Det är byggkedjan som raderar våra servrar. Vill ni att jag kör byggkedjan igen?” Kör ni över den som står närmast problemet, eller ändrar ni planen?"])
            ],
            C: [
              pb(["“This is normal activity”", "”Det här är normal aktivitet”"], ["The provider answers fast: the calls use your own identity with valid credentials, so to them this is your company deleting its own resources. They will not block your identity for you. Who in the room is now waiting for whom?", "Leverantören svarar snabbt: anropen görs med er egen identitet och giltiga uppgifter, så för dem är det ert företag som raderar sina egna resurser. De tänker inte spärra er identitet åt er. Vem i rummet väntar nu på vem?"]),
              pb(["Counting while waiting", "Räkna medan ni väntar"], ["While the case sits in the queue, the resource count keeps falling on the screen. The on-call engineer says they could disable the identity in two minutes, but were told to wait. How many more resources is waiting worth?", "Medan ärendet ligger i kön fortsätter antalet resurser att sjunka på skärmen. Jourhavande tekniker säger att hen kunde stänga av identiteten på två minuter, men fick besked att vänta. Hur många fler resurser är det värt att vänta?"]),
              pb(["Prove you own it", "Visa att ni äger den"], ["To act on a priority case, the provider needs the request confirmed by an owner of the subscription. One of your owners is the very identity doing the deleting. Who confirms, and with which account, before there is nothing left?", "För att agera på ett prioriterat ärende vill leverantören att en ägare av prenumerationen bekräftar begäran. En av era ägare är just den identitet som raderar. Vem bekräftar, och med vilket konto, innan det inte finns något kvar?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the switch-off", "Efter avstängningen"], [
              io(["The count stops", "Siffran stannar"], ["Within minutes of the switch-off, the resource count on the screen stops falling. The on-call engineer exhales; someone in the room says the worst is over.", "Inom några minuter efter avstängningen slutar antalet resurser på skärmen att sjunka. Jourhavande tekniker andas ut; någon i rummet säger att det värsta är över."], ["Deletions stopped minutes after the identity was disabled.", "Raderingarna upphörde några minuter efter att identiteten stängdes av."]),
              io(["The status page is stuck", "Statussidan sitter fast"], ["The status page is published through the same pipeline. With the identity off, nobody can change it, and it still tells customers that all systems are operational.", "Statussidan publiceras genom samma byggkedja. Med identiteten avstängd kan ingen ändra den, och den säger fortfarande till kunderna att alla system är i drift."], ["The status page could not be updated during the first hour.", "Statussidan gick inte att uppdatera under den första timmen."], { meters: { trust: -1 } }),
              io(["The same second", "Samma sekund"], ["The last deletion in the log carries the same timestamp as your switch-off. Nobody can say whether you stopped it, or whoever was deleting had simply finished.", "Den sista raderingen i loggen har samma tidsstämpel som er avstängning. Ingen kan säga om ni stoppade den, eller om den som raderade helt enkelt var klar."], ["The last deletion coincided with the switch-off; nobody knows who stopped first.", "Den sista raderingen sammanföll med avstängningen; ingen vet vem som slutade först."])
            ]),
            ir("i2", { notChosen: "A" }, ["The identity stays live", "Identiteten är kvar"], [
              io(["Another database gone", "Ännu en databas borta"], ["While you work your plan, the main customer database disappears from the console. The pipeline identity is still deleting, and nothing you decided has touched it.", "Medan ni genomför er plan försvinner den viktigaste kunddatabasen ur konsolen. Byggkedjans identitet raderar fortfarande, och inget av det ni beslutade har rört den."], ["The main customer database was deleted while the identity was still active.", "Den viktigaste kunddatabasen raderades medan identiteten fortfarande var aktiv."], { reopen: true, meters: { trust: -1 } }),
              io(["The engineer acts alone", "Teknikern agerar på egen hand"], ["The on-call engineer stops waiting and disables the pipeline identity on their own initiative. The deletions slow down. Nobody in the room decided it, and nobody is sure they were allowed to.", "Jourhavande tekniker slutar vänta och stänger av byggkedjans identitet på eget initiativ. Raderingarna saktar in. Ingen i rummet beslutade det, och ingen är säker på att hen fick göra det."], ["The pipeline identity was disabled by the on-call engineer, not by a decision.", "Byggkedjans identitet stängdes av av jourhavande tekniker, inte genom ett beslut."]),
              io(["It pauses by itself", "Det stannar av sig självt"], ["The deletions stop for ten minutes without anyone doing anything. Some say the broken script has finished; others say someone is only taking a break.", "Raderingarna upphör i tio minuter utan att någon har gjort något. Vissa säger att det trasiga skriptet är klart; andra säger att någon bara tar en paus."], ["The deletions paused on their own; nobody knows why.", "Raderingarna gjorde uppehåll av sig själva; ingen vet varför."])
            ])
          ]
        }),
        facilitator: fac(
          ["The trap is treating it as a broken deployment. The identity doing the damage has every right to do it.", "Fällan är att behandla det som en trasig driftsättning. Identiteten som gör skadan har full rätt att göra det."],
          ["Disable the identity, revoke tokens, use a break-glass account that does not depend on the same sign-in.", "Stäng av identiteten, återkalla token, använd ett nödkonto som inte är beroende av samma inloggning."],
          [["Ask: what would you need to do this if single sign-on were the problem?", "Fråga: vad skulle ni behöva för att göra det här om inloggningen var problemet?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Our own keys", "Våra egna nycklar"]),
        twist: L(["The deletions were not a bug. The pipeline's token was used from an address outside the company, and it was first tested two days ago.", "Raderingarna var inget fel. Byggkedjans token användes från en adress utanför företaget, och den provades första gången för två dagar sedan."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the pipeline identity was disabled, the release that fixes a customer's bug can no longer be deployed by any means.", sv: "Eftersom pipelinens identitet stängdes av kan releasen som rättar en kunds fel inte längre driftsättas på något sätt." } }
        ],
        assumptionChallenged: L(["A broken deployment script deleted the servers.", "Ett trasigt driftsättningsskript raderade servrarna."]),
        reveals: ["hf-token"],
        narrative: L([
          "{{time.T+60|clock}}. The pipeline identity has been disabled and the deletions have stopped. What is gone is gone, but nothing more is disappearing.\n\n{{person.socLead.name}} pulls the cloud activity log to understand why the company's own deployment pipeline started destroying production. Everyone hopes for a broken script.",
          "Klockan {{time.T+60|clock}}. Byggkedjans identitet har inaktiverats och raderingarna har upphört. Det som är borta är borta, men inget mer försvinner.\n\n{{person.socLead.name}} hämtar molnets aktivitetslogg för att förstå varför företagets egen byggkedja började förstöra produktionen. Alla hoppas på ett trasigt skript."
        ]),
        injects: [
          inj("i2-1", 60, "authLog", "siem", "critical", "confirmed", [
            "Pipeline identity: token use from {{asset.attackerIp}} (outside the company) two days ago, and again from {{time.T-180|clock}} today. No deployments ran from that address.",
            "Byggkedjans identitet: token använd från {{asset.attackerIp}} (utanför företaget) för två dagar sedan, och igen från klockan {{time.T-180|clock}} i dag. Inga driftsättningar kördes från den adressen."
          ], { tests: ["lo1"] }),
          inj("i2-2", 90, "forensicFinding", "forensics", "high", "confirmed", [
            "A developer laptop shows an information-stealing program installed with a fake command-line tool last week. Its browser and tool caches held cloud tokens.",
            "En utvecklardator har ett program som stjäl uppgifter, installerat med ett falskt kommandoradsverktyg förra veckan. Dess webbläsare och verktygscache innehöll molntoken."
          ], { reveals: ["hf-token"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Which other tokens were on that laptop, and what do they open?", "Vilka andra token fanns på den datorn, och vad öppnar de?", ["devLead", "socLead"]),
            q("Why did the pipeline identity have owner rights everywhere?", "Varför hade byggkedjans identitet ägarrättigheter överallt?", ["cloudLead"]),
            q("Was disabling the identity first the right call?", "Var det rätt att stänga av identiteten först?", ["cloudLead"], "d1")
          ],
          executive: [
            q("Do you call this a cyberattack publicly now?", "Kallar ni det här ett cyberangrepp offentligt nu?", ["comms", "ceo"]),
            q("Who needs to know: insurer, police, customers?", "Vilka behöver veta: försäkringsbolag, polis, kunder?", ["legal", "incidentCommander"]),
            q("Looking back at the first hour, what would you have done faster?", "Om ni ser tillbaka på den första timmen, vad hade ni gjort snabbare?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The developer whose laptop was infected is on holiday abroad and does not answer.", "Utvecklaren vars dator infekterades är på semester utomlands och svarar inte.")],
        decision: dec("d2", "ciso", ["How wide do you go with credentials?", "Hur brett går ni med inloggningsuppgifter?"], [
          ["Rotate every cloud credential and token the pipeline and developers use.", "Byt alla molnuppgifter och token som byggkedjan och utvecklarna använder."],
          ["Rotate the pipeline token only.", "Byt bara byggkedjans token."],
          ["Wait for the forensic report before rotating anything else.", "Vänta på den forensiska rapporten innan något annat byts."]
        ], {
          knowns: [["The pipeline token was used from outside.", "Byggkedjans token användes utifrån."]],
          uncertainties: [["What else the stolen cache contained.", "Vad mer den stulna cachen innehöll."]],
          tradeoffs: {
            operational: ["Rotating everything stops all automated work for a day.", "Att byta allt stoppar allt automatiserat arbete i ett dygn."],
            security: ["Any missed token is a way back in.", "Varje missad token är en väg tillbaka in."],
            legal: ["Your insurer will ask what you rotated and when.", "Försäkringsbolaget kommer att fråga vad ni bytte och när."],
            reputational: ["A second wipe would be unforgivable.", "En andra radering vore oförlåtlig."]
          },
          evaluation: [["Rotates every credential that could have been on the laptop", "Byter varje inloggningsuppgift som kan ha funnits på datorn"]],
          pushback: {
            A: [
              pb(["What still worked stops", "Det som fungerade slutar fungera"], ["Rotating everything also cuts the keys used by the parts of the service that survived, like payments and partner feeds. The few customers still served lose them too. Do you exempt them, and accept a known gap?", "Att byta allt kapar också nycklarna för de delar av tjänsten som överlevde, som betalningar och partnerflöden. De få kunder som fortfarande får service förlorar dem också. Undantar ni dem, och accepterar en känd lucka?"]),
              pb(["The team you need", "Teamet ni behöver"], ["The development lead objects: every developer now needs new access before they can do anything, and the people who must rebuild the service are locked out for most of a day. Which comes first, being sure or being back?", "Utvecklingschefen protesterar: varje utvecklare behöver ny åtkomst innan de kan göra något, och de som ska bygga upp tjänsten igen är utelåsta större delen av ett dygn. Vad går först, att vara säker eller att vara i drift?"]),
              pb(["No list of “every”", "Ingen lista över ”alla”"], ["Nobody has an inventory of cloud credentials. Some live in old scripts, some in personal accounts, some in tools nobody owns. “Every” is a promise you cannot check. How will you know when you are done?", "Ingen har en förteckning över molnuppgifterna. Vissa finns i gamla skript, vissa i personliga konton, vissa i verktyg som ingen äger. ”Alla” är ett löfte ni inte kan kontrollera. Hur vet ni när ni är klara?"])
            ],
            B: [
              pb(["Caches, plural", "Cacher, i plural"], ["The forensic note says the laptop's browser and tool caches held cloud tokens, not one token. You have rotated the one you saw used. What do you say if one of the others turns up in the log next week?", "Den forensiska anteckningen säger att datorns webbläsare och verktygscache innehöll molntoken, inte en enda token. Ni har bytt den ni såg användas. Vad säger ni om någon av de andra dyker upp i loggen nästa vecka?"]),
              pb(["The same hiding place", "Samma gömställe"], ["The new pipeline token goes into the same configuration that developers' laptops can read, the path the old one was taken from. Nothing about how it is stored has changed. Are you rotating the key, or just replacing what the thief takes next?", "Den nya token för byggkedjan läggs i samma konfiguration som utvecklarnas datorer kan läsa, vägen som den gamla togs. Inget i hur den lagras har ändrats. Byter ni nyckeln, eller ersätter ni bara det som tjuven tar härnäst?"]),
              pb(["The insurer's checklist", "Försäkringsbolagets checklista"], ["The insurer's incident adviser asks for the list of credentials you rotated after a confirmed infostealer infection. Your list has one line. Can you defend that in writing, or do you widen it before you answer?", "Försäkringsbolagets incidentrådgivare ber om listan över inloggningsuppgifter ni bytt efter en bekräftad infektion med skadlig kod som stjäl uppgifter. Er lista har en rad. Kan ni försvara det skriftligt, eller utvidgar ni den innan ni svarar?"])
            ],
            C: [
              pb(["The laptop is abroad", "Datorn är utomlands"], ["The forensic team cannot image the laptop: it is with its owner on holiday abroad. Their report is days away at best. What exactly are you waiting for, and what do you do in the meantime?", "Forensikteamet kan inte göra en avbildning av datorn: den är med sin ägare på semester utomlands. Rapporten dröjer i bästa fall flera dagar. Vad är det exakt ni väntar på, och vad gör ni under tiden?"]),
              pb(["An unexpected prompt", "En oväntad förfrågan"], ["A developer reports a sign-in approval request on their phone that they did not start. It may be nothing. It may be someone trying a key you have not rotated. Do you keep waiting for the report?", "En utvecklare rapporterar en begäran om att godkänna en inloggning i telefonen som hen inte startade. Det kan vara ingenting. Det kan vara någon som provar en nyckel ni inte har bytt. Fortsätter ni att vänta på rapporten?"]),
              pb(["Who signs the wait?", "Vem skriver under väntan?"], ["The CISO's own advice is to rotate, and legal notes that the insurance terms ask for containment without undue delay. Someone has to own the decision to wait. Whose name goes on it?", "CISO:ns egen rekommendation är att byta, och juristen påpekar att försäkringsvillkoren kräver begränsning utan onödigt dröjsmål. Någon måste äga beslutet att vänta. Vems namn står på det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the big rotation", "Efter det stora bytet"], [
              io(["A key is refused", "En nyckel nekas"], ["An hour after the rotation, the log shows a revoked developer token being tried from {{asset.attackerIp}}. It is refused. The rotation closed a door someone was still trying.", "En timme efter bytet visar loggen att en återkallad utvecklartoken provas från {{asset.attackerIp}}. Den nekas. Bytet stängde en dörr som någon fortfarande försökte öppna."], ["A revoked developer token was tried from outside and refused.", "En återkallad utvecklartoken provades utifrån och nekades."]),
              io(["The builders are locked out", "Byggarna är utelåsta"], ["Most developers now have no working cloud access, including the ones you need for the rebuild. Re-issuing access one by one will take the rest of the day.", "De flesta utvecklare saknar nu fungerande åtkomst till molnet, även de ni behöver för återuppbyggnaden. Att dela ut åtkomst igen en och en tar resten av dagen."], ["Most developers had no cloud access for hours after the rotation.", "De flesta utvecklare saknade molnåtkomst i flera timmar efter bytet."]),
              io(["A key nobody can find", "En nyckel ingen hittar"], ["One old automation key cannot be rotated: nobody knows what still uses it, and the person who created it has left. It stays valid while you search.", "En gammal automationsnyckel går inte att byta: ingen vet vad som fortfarande använder den, och den som skapade den har slutat. Den är giltig medan ni letar."], ["One old automation key is still valid; nobody knows what uses it.", "En gammal automationsnyckel är fortfarande giltig; ingen vet vad som använder den."], { reopen: true })
            ]),
            ir("i2", { notChosen: "A" }, ["Keys left in place", "Nycklar som blev kvar"], [
              io(["A sign-in from outside", "En inloggning utifrån"], ["A developer's personal cloud token, not rotated, signs in from {{asset.attackerIp}} and lists every subscription. Then nothing more. Someone is checking what is left.", "En utvecklares personliga molntoken, som inte bytts, loggar in från {{asset.attackerIp}} och listar alla prenumerationer. Sedan inget mer. Någon kontrollerar vad som finns kvar."], ["An unrotated developer token was used from outside after the incident began.", "En utvecklartoken som inte bytts användes utifrån efter att incidenten börjat."], { reopen: true }),
              io(["Nothing in the first pass", "Inget i första genomgången"], ["The first pass through the logs shows no use of any other token. The room takes it as proof that one token was enough to rotate.", "Den första genomgången av loggarna visar ingen användning av någon annan token. Rummet tar det som bevis på att det räckte att byta en token."], ["The first log pass found no use of other tokens.", "Den första genomgången av loggarna fann ingen användning av andra token."]),
              io(["The insurer asks in writing", "Försäkringsbolaget frågar skriftligt"], ["The insurer's adviser asks, in writing, for the full list of credentials rotated after the infection. Legal notes that whatever you answer will be on record.", "Försäkringsbolagets rådgivare ber skriftligt om hela listan över inloggningsuppgifter som bytts efter infektionen. Juristen påpekar att vad ni än svarar kommer att finnas dokumenterat."], ["The insurer has asked in writing which credentials were rotated.", "Försäkringsbolaget har skriftligt frågat vilka inloggningsuppgifter som bytts."])
            ])
          ]
        }),
        facilitator: fac(
          ["The attacker didn't break in; they logged in as your automation. Look for every other key they could have.", "Angriparen bröt sig inte in; de loggade in som er automatisering. Leta efter alla andra nycklar de kan ha."],
          ["Broad rotation, review of pipeline rights, and the laptop isolated for forensics.", "Brett byte av uppgifter, granskning av byggkedjans rättigheter och datorn isolerad för forensisk undersökning."],
          [["Ask: who reviews what your automation is allowed to do?", "Fråga: vem granskar vad er automatisering får göra?"]]
        )
      },
      {
        id: "p3",
        clock: 180,
        priority: 1,
        title: L(["The backups", "Säkerhetskopiorna"]),
        twist: L(["The backup vault is gone too. Every recovery point was deleted twenty minutes before the servers.", "Säkerhetskopieringsvalvet är också borta. Alla återställningspunkter raderades tjugo minuter före servrarna."]),
        twistKind: "impact",
        reconsider: { decision: "d2", pressure: { en: "The backup vault is gone too. If you rotated every credential, developers lost a day you needed for the rebuild. If you rotated only the pipeline token, can you be sure it was the only key?", sv: "Säkerhetskopieringsvalvet är också borta. Om ni bytte alla inloggningsuppgifter förlorade utvecklarna en dag som ni behövde till återuppbyggnaden. Om ni bara bytte pipelinens token, kan ni vara säkra på att det var den enda nyckeln?" } },
        assumptionChallenged: L(["We can restore from last night's backup.", "Vi kan återställa från nattens säkerhetskopia."]),
        reveals: ["hf-vault"],
        narrative: L([
          "{{time.T+180|clock}}. The plan is straightforward: rebuild the servers and restore the data from the nightly cloud backups. {{person.cloudLead.name}} opens the backup service to start the restore.\n\nThe screen takes a long time to load. When it does, the room goes quiet.",
          "Klockan {{time.T+180|clock}}. Planen är enkel: bygg upp servrarna igen och återställ datan från de nattliga säkerhetskopiorna i molnet. {{person.cloudLead.name}} öppnar backuptjänsten för att börja återställa.\n\nSkärmen tar lång tid att ladda. När den gör det blir det tyst i rummet."
        ]),
        injects: [
          inj("i3-1", 180, "backupReport", "backupSystem", "critical", "confirmed", [
            "Backup vault: not found. Recovery points: 0. Last change: vault deleted by the pipeline identity at {{time.T-20|clock}}.",
            "Säkerhetskopieringsvalv: hittades inte. Återställningspunkter: 0. Senaste ändring: valvet raderat av byggkedjans identitet klockan {{time.T-20|clock}}."
          ], { tests: ["lo2"] }),
          inj("i3-2", 210, "email", "itOps", "medium", "confirmed", [
            "From the change log, five months ago: “Disable soft delete and immutability on backup vault to reduce storage cost. Approved.”",
            "Ur ändringsloggen, för fem månader sedan: ”Stäng av mjuk radering och oföränderlighet på säkerhetskopieringsvalvet för att minska lagringskostnaden. Godkänt.”"
          ], { headline: ["Change record CHG-4471", "Ändringsärende CHG-4471"], reveals: ["hf-vault"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What can you rebuild from code alone, and what is data that only lived in production?", "Vad kan ni bygga upp enbart från kod, och vad är data som bara fanns i produktion?", ["cloudLead", "devLead"]),
            q("Does the cloud provider keep anything after deletion?", "Behåller molnleverantören något efter radering?", ["supplierManager", "cloudLead"]),
            q("Would rotating more widely earlier have changed this?", "Hade ett bredare byte tidigare ändrat det här?", ["ciso"], "d2")
          ],
          executive: [
            q("How long can the business be without {{org.service.customer|lcfirst}}?", "Hur länge klarar verksamheten sig utan {{org.service.customer|lcfirst}}?", ["serviceOwner", "ceo"]),
            q("Who approved switching off backup protection to save money, and how was that risk assessed?", "Vem godkände att skyddet för säkerhetskopiorna stängdes av för att spara pengar, och hur bedömdes den risken?", ["cfo", "cio"]),
            q("Given the backups are gone, would you still prioritise as you did?", "Med säkerhetskopiorna borta, skulle ni fortfarande prioritera som ni gjorde?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Finance asks whether the cyber insurance covers a loss caused by a deliberate cost-saving change.", "Ekonomi frågar om cyberförsäkringen täcker en förlust som orsakats av en medveten kostnadsbesparing.")],
        decision: dec("d3", "incidentCommander", ["What is your recovery strategy?", "Vilken är er återställningsstrategi?"], [
          ["Rebuild infrastructure from code in a new, clean subscription and recover data from every other source.", "Bygg upp infrastrukturen från kod i en ny, ren prenumeration och återskapa data från alla andra källor."],
          ["Ask the provider to recover deleted resources first, whatever it takes.", "Be leverantören återskapa raderade resurser först, vad det än kräver."],
          ["Rebuild in the same subscription to save time.", "Bygg upp i samma prenumeration för att spara tid."]
        ], {
          knowns: [["Infrastructure is defined in code.", "Infrastrukturen finns definierad i kod."]],
          uncertainties: [["How much data can be recovered elsewhere.", "Hur mycket data som kan återskapas från annat håll."]],
          tradeoffs: {
            operational: ["A new subscription takes longer to set up.", "En ny prenumeration tar längre tid att sätta upp."],
            security: ["The old subscription may still hold the attacker's footholds.", "Den gamla prenumerationen kan fortfarande innehålla angriparens fästen."],
            legal: ["Deleted resources may be needed as evidence.", "Raderade resurser kan behövas som bevis."],
            reputational: ["Every hour is visible to customers.", "Varje timme syns för kunderna."]
          },
          evaluation: [["Rebuilds somewhere the attacker has never been", "Bygger upp någonstans där angriparen aldrig har varit"]],
          pushback: {
            A: [
              pb(["Quota on a weekend", "Kvoter en helg"], ["A new subscription starts with default limits that fit a fraction of the servers you need. Raising them needs the provider, and their weekend team is slow. Do you rebuild part of the service first, and which part?", "En ny prenumeration startar med standardgränser som räcker till en bråkdel av de servrar ni behöver. Att höja dem kräver leverantören, och deras helgteam är långsamt. Bygger ni upp en del av tjänsten först, och i så fall vilken?"]),
              pb(["The code is not all of it", "Koden är inte allt"], ["The infrastructure code was last applied in full months ago. Since then, people have changed settings by hand in the console, and nobody knows which. Is a clean rebuild from code still clean if it is also wrong?", "Infrastrukturkoden kördes i sin helhet senast för flera månader sedan. Sedan dess har folk ändrat inställningar för hand i konsolen, och ingen vet vilka. Är en ren återuppbyggnad från kod fortfarande ren om den också är fel?"]),
              pb(["The biggest customer's deadline", "Största kundens tidsgräns"], ["Your largest customer says they will move elsewhere if the service is not back on Monday morning. The new-subscription plan has no date yet. Do you keep the clean plan, or take a faster shortcut for them?", "Er största kund säger att de byter leverantör om tjänsten inte är tillbaka på måndag morgon. Planen med en ny prenumeration har inget datum än. Behåller ni den rena planen, eller tar ni en snabbare genväg för deras skull?"])
            ],
            B: [
              pb(["No promise before Monday", "Inget löfte före måndag"], ["The provider will look into recovering the deleted vault but promises nothing, and the specialist team works weekdays. Until then your engineers sit idle by choice. How long do you wait before you start building anyway?", "Leverantören ska undersöka om det raderade valvet kan återskapas men lovar ingenting, och specialistteamet arbetar vardagar. Till dess sitter era tekniker sysslolösa genom ert eget val. Hur länge väntar ni innan ni ändå börjar bygga?"]),
              pb(["“Whatever it takes”", "”Vad det än kräver”"], ["The provider offers an emergency recovery engagement at a price the CFO must approve tonight, with no guarantee of results. The CFO asks who decided that cost was acceptable. Do you sign for an uncertain recovery?", "Leverantören erbjuder ett akut återställningsuppdrag till ett pris som ekonomichefen måste godkänna i kväll, utan garanti för resultat. Ekonomichefen frågar vem som bestämde att kostnaden var acceptabel. Skriver ni under för en osäker återställning?"]),
              pb(["Back into the same place", "Tillbaka till samma ställe"], ["Anything the provider recovers comes back into the same subscription, where the pipeline identity held owner rights over everything. You would be restoring into the room that was just emptied. Is that a recovery you trust?", "Allt som leverantören återskapar hamnar i samma prenumeration, där byggkedjans identitet hade ägarrättigheter över allt. Ni skulle återställa till rummet som just tömdes. Är det en återställning ni litar på?"])
            ],
            C: [
              pb(["Through the same pipeline", "Genom samma byggkedja"], ["Your infrastructure code deploys through the pipeline you disabled a few hours ago. Rebuilding here means switching that identity back on with the same reach it had. Do you trust it again, or rebuild by hand under pressure?", "Er infrastrukturkod driftsätts genom byggkedjan ni stängde av för några timmar sedan. Att bygga upp här innebär att slå på den identiteten igen med samma räckvidd som förut. Litar ni på den igen, eller bygger ni för hand under press?"]),
              pb(["Rebuilding over evidence", "Bygga över bevisen"], ["The insurer's forensic firm asks you not to touch the subscription until they have copied what is left. Rebuilding there overwrites names, settings and traces. Do you delay the rebuild, or tell them no?", "Försäkringsbolagets forensiska firma ber er att inte röra prenumerationen förrän de har kopierat det som finns kvar. Att bygga upp där skriver över namn, inställningar och spår. Skjuter ni upp återuppbyggnaden, eller säger ni nej till dem?"]),
              pb(["Who else holds the keys?", "Vem mer har nycklarna?"], ["Nobody has yet reviewed which identities still hold owner rights in this subscription. The review will take hours, and you want to build in minutes. Do you build first and check later, knowing what owner rights have just done?", "Ingen har ännu granskat vilka identiteter som fortfarande har ägarrättigheter i den här prenumerationen. Granskningen tar timmar, och ni vill bygga på minuter. Bygger ni först och kontrollerar sedan, med vetskap om vad ägarrättigheter just har ställt till med?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The clean subscription", "Den rena prenumerationen"], [
              io(["First pages back", "De första sidorna är tillbaka"], ["The login page and the product catalogue are running in the new subscription after a few hours. Customers notice, and the room starts to believe in the plan.", "Inloggningssidan och produktkatalogen körs i den nya prenumerationen efter några timmar. Kunderna märker det, och rummet börjar tro på planen."], ["The first parts of the service run in the new subscription.", "De första delarna av tjänsten körs i den nya prenumerationen."]),
              io(["Payments fail", "Betalningarna fallerar"], ["The rebuilt checkout rejects every payment. A setting someone once changed by hand in the old console was never in the code, and nobody remembers what it was.", "Den återuppbyggda kassan avvisar varje betalning. En inställning som någon en gång ändrade för hand i den gamla konsolen fanns aldrig i koden, och ingen minns vad den var."], ["Payments failed at first in the rebuild: a hand-made setting was missing.", "Betalningarna fallerade först i återuppbyggnaden: en handgjord inställning saknades."], { meters: { trust: -1 } }),
              io(["An old export turns up", "En gammal export dyker upp"], ["A developer finds a database export from a test environment, a few weeks old. It would help the rebuild, but it looks like it holds real customer records, which should never have been in test.", "En utvecklare hittar en databasexport från en testmiljö, några veckor gammal. Den skulle hjälpa återuppbyggnaden, men den ser ut att innehålla verkliga kunduppgifter, som aldrig borde ha funnits i test."], ["A weeks-old test export with what looks like real customer data was found.", "En några veckor gammal testexport med vad som ser ut som verkliga kunduppgifter har hittats."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not starting clean", "Ingen ren start"], [
              io(["An owner nobody knows", "En ägare ingen känner"], ["A first review of the old subscription finds an identity with owner rights that nobody recognises. It was created months ago. It may be harmless; nobody can say yet.", "En första granskning av den gamla prenumerationen hittar en identitet med ägarrättigheter som ingen känner igen. Den skapades för flera månader sedan. Den kan vara ofarlig; ingen kan säga det än."], ["An unrecognised identity holds owner rights in the old subscription.", "En okänd identitet har ägarrättigheter i den gamla prenumerationen."], { reopen: true }),
              io(["Forensics objects", "Forensikerna invänder"], ["The insurer's forensic firm sends a formal objection: any work in the old subscription overwrites traces they still need. They ask who will answer for what is lost.", "Försäkringsbolagets forensiska firma skickar en formell invändning: allt arbete i den gamla prenumerationen skriver över spår som de fortfarande behöver. De frågar vem som ansvarar för det som går förlorat."], ["The forensic firm has formally objected to work in the old subscription.", "Den forensiska firman har formellt invänt mot arbete i den gamla prenumerationen."]),
              io(["Maybe, on a weekday", "Kanske, en vardag"], ["The provider says some deleted resources might still be recoverable, but only its specialist team can tell, and they work weekdays. It is a hope, not a plan.", "Leverantören säger att vissa raderade resurser kanske fortfarande går att återskapa, men bara deras specialistteam kan avgöra det, och de arbetar vardagar. Det är ett hopp, inte en plan."], ["Some resources may be recoverable; no answer before a weekday.", "Vissa resurser kan gå att återskapa; inget besked före en vardag."])
            ])
          ]
        }),
        facilitator: fac(
          ["Point at the change record: the protection was traded away. Let the room find that themselves.", "Peka på ändringsärendet: skyddet byttes bort. Låt rummet komma fram till det själva."],
          ["A clean rebuild from code, data recovered from replicas, exports and partners.", "En ren återuppbyggnad från kod, data återskapad från repliker, exporter och partner."],
          [["Ask: where else does your data live, even partly?", "Fråga: var annars finns era data, även delvis?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["They took a copy", "De tog en kopia"]),
        twist: L(["Before deleting anything, the attacker exported the customer database to storage outside your company. This is a data breach as well as an outage.", "Innan något raderades exporterade angriparen kunddatabasen till lagring utanför företaget. Det här är en personuppgiftsincident lika mycket som ett avbrott."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because you rebuilt in a new subscription, every customer integration needs new addresses, and partners are being asked to change their firewalls.", sv: "Eftersom ni byggde om i en ny prenumeration behöver varje kundintegration nya adresser, och partnerna ombeds ändra sina brandväggar." } }
        ],
        assumptionChallenged: L(["It is only destruction: nothing was taken.", "Det är bara förstörelse: ingenting togs."]),
        reveals: ["hf-copy"],
        narrative: L([
          "{{time.T+300|clock}}. The team is piecing together the service from source code, old exports and anything else it can find.\n\nMeanwhile, the analysts keep reading the activity log backwards, looking for the attacker's first move. There is one more entry, earlier than all the deletions, and it changes what kind of incident this is.",
          "Klockan {{time.T+300|clock}}. Teamet pusslar ihop tjänsten från källkod, gamla exporter och allt annat de kan hitta.\n\nSamtidigt fortsätter analytikerna att läsa aktivitetsloggen baklänges, på jakt efter angriparens första drag. Det finns ytterligare en post, tidigare än alla raderingar, och den ändrar vilken sorts incident det här är."
        ]),
        injects: [
          inj("i4-1", 300, "logExcerpt", "siem", "critical", "confirmed", [
            "{{time.T-180|clock}}: snapshot of customer database exported · destination: storage account in an unknown tenant · size: 214 GB.",
            "Klockan {{time.T-180|clock}}: ögonblicksbild av kunddatabasen exporterad · mål: lagringskonto i en okänd organisation · storlek: 214 GB."
          ], { reveals: ["hf-copy"], tests: ["lo3"] }),
          inj("i4-2", 330, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“That database holds names, addresses and order histories for {{num.customers|number}} customers. The 72-hour clock started when we became aware, which may be now.”",
            "”Den databasen innehåller namn, adresser och orderhistorik för {{num.customers|number}} kunder. 72-timmarsklockan startade när vi fick kännedom, vilket kan vara nu.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["The incident so far", "Incidenten hittills"]),
          data: kpi([
            { id: "res", label: ["Resources deleted", "Raderade resurser"], value: (v) => v.resourcesDeleted, tone: "danger" },
            { id: "cust", label: ["Customers in the copied database", "Kunder i den kopierade databasen"], value: (v) => v.customers, tone: "danger" },
            { id: "hours", label: ["Hours to rebuild (estimate)", "Timmar för återuppbyggnad (uppskattning)"], value: (v) => v.rebuildHours, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("Can you prove what was in the snapshot and what wasn't?", "Kan ni visa vad som fanns i ögonblicksbilden och vad som inte fanns?", ["devLead", "socLead"]),
            q("Is the outside storage account still reachable, and who should ask the provider about it?", "Går det externa lagringskontot fortfarande att nå, och vem bör fråga leverantören om det?", ["cloudLead", "legal"]),
            q("Does the rebuild plan change now that this is a breach too?", "Ändras återuppbyggnadsplanen nu när det också är en personuppgiftsincident?", ["cloudLead"], "d3")
          ],
          executive: [
            q("Do you notify {{reg.dpaShort}} now or when you know more?", "Anmäler ni till {{reg.dpaShort}} nu eller när ni vet mer?", ["dpo", "legal"]),
            q("What do you tell customers: outage, breach, or both?", "Vad säger ni till kunderna: avbrott, intrång, eller båda?", ["comms", "ceo"]),
            q("Was the recovery strategy you chose still right, given the theft?", "Var den återställningsstrategi ni valde fortfarande rätt, med tanke på stölden?", ["incidentCommander"], "d3")
          ]
        },
        challenges: [ch("A customer posts a screenshot of their own order history, asking if it is the leak.", "En kund lägger ut en skärmdump av sin egen orderhistorik och frågar om det är läckan.")],
        decision: dec("d4", "dpo", ["How do you handle notification?", "Hur hanterar ni anmälan?"], [
          ["Notify the regulator now and plan customer communication within 72 hours.", "Anmäl till tillsynsmyndigheten nu och planera kundkommunikationen inom 72 timmar."],
          ["Notify once the service is back.", "Anmäl när tjänsten är tillbaka."],
          ["Treat it as an outage for now: notifying before you know what was exported may alarm customers for nothing.", "Behandla det som ett avbrott tills vidare: att anmäla innan ni vet vad som exporterades kan skrämma kunderna i onödan."]
        ], {
          knowns: [["Customer data was exported to an outside account.", "Kunduppgifter exporterades till ett externt konto."]],
          uncertainties: [["Whether the attacker will publish or sell it.", "Om angriparen kommer att publicera eller sälja dem."]],
          tradeoffs: {
            operational: ["Notification work competes with the rebuild for people.", "Arbetet med anmälan konkurrerar med återuppbyggnaden om personal."],
            security: ["Customers can protect themselves only if they know.", "Kunderna kan bara skydda sig om de vet."],
            legal: ["The deadline runs from awareness, not from recovery.", "Tidsfristen löper från kännedom, inte från återställning."],
            reputational: ["Saying “breach” on top of “outage” hurts twice.", "Att säga ”intrång” utöver ”avbrott” gör ont två gånger."]
          },
          evaluation: [["Notifies within the deadline regardless of the outage", "Anmäler inom tidsfristen oavsett avbrottet"]],
          pushback: {
            A: [
              pb(["A form you cannot fill", "Ett formulär ni inte kan fylla i"], ["The notification form asks how many people and which categories of data are affected. You can only estimate, and the snapshot may hold more or less than you think. Do you file a guess now, knowing every later correction will be read as confusion?", "Anmälningsformuläret frågar hur många personer och vilka kategorier av uppgifter som berörs. Ni kan bara uppskatta, och ögonblicksbilden kan innehålla mer eller mindre än ni tror. Lämnar ni en gissning nu, väl medvetna om att varje senare rättelse läses som förvirring?"]),
              pb(["Customers hear it second", "Kunderna får höra det i andra hand"], ["Comms warns that once the regulator has the notification, it may become public before you have written a word to customers. They would learn about the theft from someone else. Do you hold the notification until the customer message is ready?", "Kommunikationsavdelningen varnar för att anmälan kan bli offentlig innan ni har skrivit ett ord till kunderna, när tillsynsmyndigheten väl har den. De skulle få veta om stölden från någon annan. Håller ni inne anmälan tills kundbudskapet är klart?"]),
              pb(["The same two people", "Samma två personer"], ["Only two engineers know the database well enough to say what the snapshot contained, and both are deep in the rebuild. Taking them off slows the service; leaving them means a vague notification. Which do you sacrifice?", "Bara två tekniker känner databasen tillräckligt väl för att säga vad ögonblicksbilden innehöll, och båda är djupt inne i återuppbyggnaden. Att ta bort dem bromsar tjänsten; att låta dem vara ger en vag anmälan. Vad offrar ni?"])
            ],
            B: [
              pb(["The rebuild slips", "Återuppbyggnaden drar ut"], ["The rebuild estimate has just grown again, and the service may not be back before the 72 hours are up. Your notification is now tied to a date nobody controls. Do you still wait, or break the link?", "Uppskattningen för återuppbyggnaden har just ökat igen, och tjänsten kanske inte är tillbaka innan 72 timmar har gått. Er anmälan är nu knuten till ett datum som ingen styr över. Väntar ni ändå, eller bryter ni kopplingen?"]),
              pb(["It is already written down", "Det står redan nedskrivet"], ["Legal points out that the incident log already records the moment you saw the export. Waiting for recovery means a written trail showing you knew and chose to wait. Who will explain that choice to the regulator?", "Juristen påpekar att incidentloggen redan visar ögonblicket då ni såg exporten. Att vänta på återställningen innebär ett skriftligt spår som visar att ni visste och valde att vänta. Vem ska förklara det valet för tillsynsmyndigheten?"]),
              pb(["A partner will not wait", "En partner tänker inte vänta"], ["A business partner whose customers are in your database asks whether they must notify their own regulator. They will not hold off until your service is back. Do you let a partner notify before you do?", "En affärspartner vars kunder finns i er databas frågar om de måste anmäla till sin egen tillsynsmyndighet. De tänker inte vänta tills er tjänst är tillbaka. Låter ni en partner anmäla innan ni gör det?"])
            ],
            C: [
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["The data protection officer refuses to put their name to “outage”: the log shows 214 GB exported to an unknown tenant. Overruling them will itself be on record. Do you override your own DPO?", "Dataskyddsombudet vägrar sätta sitt namn på ”avbrott”: loggen visar 214 GB exporterade till en okänd organisation. Att köra över hen hamnar i sig i dokumentationen. Kör ni över ert eget dataskyddsombud?"]),
              pb(["The first word sticks", "Det första ordet fastnar"], ["Your status page now says “outage”. If the theft becomes known later, that first message will read as a cover-up rather than caution. Can you change the word later without it looking like you hid it?", "Er statussida säger nu ”avbrott”. Om stölden blir känd senare kommer det första budskapet att läsas som ett försök att dölja, inte som försiktighet. Kan ni byta ord senare utan att det ser ut som att ni dolde det?"]),
              pb(["Emails in your name", "Mejl i ert namn"], ["Customers forward emails claiming to come from you, offering a “refund for the outage” if they confirm their details. You cannot tell whether the stolen data is behind them. How do customers protect themselves if you have not told them what to protect?", "Kunder vidarebefordrar mejl som påstås komma från er och erbjuder ”ersättning för avbrottet” om de bekräftar sina uppgifter. Ni kan inte avgöra om de stulna uppgifterna ligger bakom. Hur ska kunderna skydda sig om ni inte har sagt vad de ska skydda?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Notified early", "Tidigt anmält"], [
              io(["Acknowledged", "Mottaget"], ["{{reg.dpaShort}} acknowledges the notification within hours, notes that it came early and asks for a follow-up when you know more.", "{{reg.dpaShort}} bekräftar anmälan inom några timmar, noterar att den kom tidigt och ber om en komplettering när ni vet mer."], ["{{reg.dpaShort}} has acknowledged the notification and expects a follow-up.", "{{reg.dpaShort}} har bekräftat anmälan och väntar på en komplettering."]),
              io(["A journalist calls first", "En journalist ringer först"], ["A journalist calls about “the data breach you reported” before a single customer has been told. Comms has nothing ready to say.", "En journalist ringer om ”personuppgiftsincidenten ni har anmält” innan en enda kund har fått veta något. Kommunikationsavdelningen har inget färdigt att säga."], ["A journalist knew about the notification before customers were told.", "En journalist kände till anmälan innan kunderna hade fått veta."], { meters: { media: 1, trust: -1 } }),
              io(["The number moves", "Siffran rör sig"], ["The engineers now think the snapshot may be older than assumed. The number of customers in your notification could be too high or too low, and you will not know for days.", "Teknikerna tror nu att ögonblicksbilden kan vara äldre än man antagit. Antalet kunder i er anmälan kan vara för högt eller för lågt, och det får ni inte veta på flera dagar."], ["The customer count in the notification may be wrong either way.", "Antalet kunder i anmälan kan vara fel åt båda hållen."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not notified yet", "Ännu inte anmält"], [
              io(["A partner reports you", "En partner anmäler er"], ["A business partner whose customers are in your database files its own notification with its regulator, naming your company as the source. The regulator now knows from someone else.", "En affärspartner vars kunder finns i er databas lämnar en egen anmälan till sin tillsynsmyndighet och pekar ut ert företag som källan. Tillsynsmyndigheten vet nu genom någon annan."], ["A partner has reported your incident to its own regulator.", "En partner har anmält er incident till sin egen tillsynsmyndighet."], { reopen: true, meters: { regulator: 1 } }),
              io(["Nobody asks", "Ingen frågar"], ["A full day passes and nobody outside the company asks about the data. The word “outage” seems to hold, and the room feels the decision was sound.", "Ett helt dygn går och ingen utanför företaget frågar om uppgifterna. Ordet ”avbrott” verkar hålla, och rummet känner att beslutet var klokt."], ["No one outside has asked about the data so far.", "Ingen utanför har hittills frågat om uppgifterna."]),
              io(["The DPO writes it down", "Dataskyddsombudet skriver ner det"], ["The data protection officer sends a short memo to the incident log: they advised notifying now and disagree with the decision. It is polite, and it is permanent.", "Dataskyddsombudet skickar en kort promemoria till incidentloggen: hen rådde er att anmäla nu och håller inte med om beslutet. Den är artig, och den är bestående."], ["The DPO has recorded a written disagreement with the decision.", "Dataskyddsombudet har skriftligt dokumenterat att hen inte håller med om beslutet."])
            ])
          ]
        }),
        facilitator: fac(
          ["Destruction makes noise; the quiet export is the bigger risk.", "Förstörelsen låter mycket; den tysta exporten är den större risken."],
          ["Notification within 72 hours, customer guidance, and evidence of the export preserved.", "Anmälan inom 72 timmar, vägledning till kunderna och bevisen för exporten bevarade."],
          [["Ask: what is the difference between losing data and losing control of it?", "Fråga: vad är skillnaden mellan att förlora data och att förlora kontrollen över dem?"]]
        )
      },
      {
        id: "p5",
        clock: 720,
        priority: 2,
        title: L(["The offer", "Erbjudandet"]),
        twist: L(["An email offers to return the database and keep quiet in exchange for {{num.demand|currency}}. It mentions the backup vault by name.", "Ett mejl erbjuder att lämna tillbaka databasen och hålla tyst mot {{num.demand|currency}}. Det nämner säkerhetskopieringsvalvet vid namn."]),
        twistKind: "authority",
        reconsider: { decision: "d3", pressure: { en: "The demand names your backup vault. Now that you know the attacker planned this, does your recovery strategy still hold?", sv: "Kravet nämner ert säkerhetskopieringsvalv vid namn. Nu när ni vet att angriparen planerade detta, håller er återställningsstrategi fortfarande?" } },
        assumptionChallenged: L(["This was vandalism with no demand.", "Det här var skadegörelse utan krav."]),
        narrative: L([
          "{{time.T+720|clock}}. The rebuild is about half done, and the first parts of the service are running again in a new environment.\n\nThen {{person.ceo.name}} forwards an email that arrived at the company's general address. Whoever wrote it knows exactly what happened, including details that have never been made public.",
          "Klockan {{time.T+720|clock}}. Ombyggnaden är ungefär halvvägs, och de första delarna av tjänsten körs igen i en ny miljö.\n\nSedan vidarebefordrar {{person.ceo.name}} ett mejl som kom till företagets allmänna adress. Den som skrev det vet exakt vad som hände, även detaljer som aldrig har offentliggjorts."
        ]),
        injects: [
          inj("i5-1", 720, "ransomNote", "attacker", "critical", "confirmed", [
            "Your servers can be rebuilt. Your customers' data cannot be un-copied. {{num.demand|currency}} and it is deleted. We know your vault was empty of protection.",
            "Era servrar går att bygga upp igen. Era kunders data går inte att avkopiera. {{num.demand|currency}} så raderas det. Vi vet att ert valv saknade skydd."
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What could the attacker still reach after the rotations?", "Vad skulle angriparen fortfarande kunna nå efter bytena?", ["socLead", "cloudLead"]),
            q("How do you check the claim that they hold the full database?", "Hur kontrollerar ni påståendet att de har hela databasen?", ["devLead"]),
            q("Did the notification plan account for an extortion stage?", "Tog planen för anmälan höjd för ett utpressningsskede?", ["dpo"], "d4")
          ],
          executive: [
            q("Who decides on paying, and what does paying buy you here?", "Vem beslutar om betalning, och vad köper en betalning er här?", ["ceo", "legal"]),
            q("What does the insurer require before any contact with the attacker?", "Vad kräver försäkringsbolaget innan någon kontakt med angriparen?", ["cfo"]),
            q("Would you notify differently now that there is a demand?", "Skulle ni anmäla annorlunda nu när det finns ett krav?", ["dpo", "legal"], "d4")
          ]
        },
        challenges: [ch("A board member argues that paying is cheaper than the rebuild.", "En styrelseledamot hävdar att det är billigare att betala än att bygga upp igen.")],
        decision: dec("d5", "ceo", ["How do you respond to the demand?", "Hur svarar ni på kravet?"], [
          ["Do not pay; inform the police and the insurer; continue the rebuild.", "Betala inte; informera polisen och försäkringsbolaget; fortsätt återuppbyggnaden."],
          ["Open negotiations through the insurer's adviser to buy time.", "Inled förhandlingar via försäkringsbolagets rådgivare för att vinna tid."],
          ["Pay to keep the data private.", "Betala för att hålla uppgifterna hemliga."]
        ], {
          knowns: [["The infrastructure can be rebuilt without the attacker.", "Infrastrukturen kan byggas upp utan angriparen."]],
          uncertainties: [["Whether payment would stop publication.", "Om en betalning skulle stoppa en publicering."]],
          tradeoffs: {
            operational: ["Negotiating takes attention from recovery.", "Förhandlingar tar uppmärksamhet från återställningen."],
            security: ["Payment funds the next attack.", "En betalning finansierar nästa angrepp."],
            legal: ["Sanctions and insurance rules apply to any payment.", "Sanktions- och försäkringsregler gäller för varje betalning."],
            reputational: ["A secret payment rarely stays secret.", "En hemlig betalning förblir sällan hemlig."]
          },
          evaluation: [["Separates recovery (no payment needed) from the data question", "Skiljer återställningen (ingen betalning behövs) från frågan om uppgifterna"]],
          pushback: {
            A: [
              pb(["The police want the channel", "Polisen vill ha kanalen"], ["The police ask you to keep replying to the attacker so they can follow the trail. Refusing to pay is one thing; going silent ends their best lead. Do you keep talking to criminals you have decided not to pay?", "Polisen ber er fortsätta svara angriparen så att de kan följa spåret. Att vägra betala är en sak; att tystna stänger deras bästa spår. Fortsätter ni prata med brottslingar som ni har bestämt att inte betala?"]),
              pb(["Your customers' customers", "Era kunders kunder"], ["The attacker writes again: if you will not pay, they will contact your largest customers directly with samples. A key account manager asks whether the company is choosing a principle over its customers. What do you tell them?", "Angriparen skriver igen: om ni inte betalar kontaktar de era största kunder direkt med utdrag. En kundansvarig frågar om företaget väljer en princip framför sina kunder. Vad svarar ni?"]),
              pb(["The policy would pay", "Försäkringen skulle betala"], ["Finance notes that the policy may cover an extortion payment, and the CFO calls refusing “turning down money we already paid for”. The data stays out there either way. Is your refusal a decision or a reflex?", "Ekonomi påpekar att försäkringen kan täcka en utpressningsbetalning, och ekonomichefen kallar vägran att ”tacka nej till pengar vi redan har betalat för”. Uppgifterna finns kvar där ute oavsett. Är er vägran ett beslut eller en reflex?"])
            ],
            B: [
              pb(["Proof of life", "Bevis på innehav"], ["To negotiate, the adviser asks for proof. The attacker sends a file of real customer records, and your team has now handled stolen personal data. The DPO asks whether the notification must change. Did buying time just make things bigger?", "För att förhandla ber rådgivaren om bevis. Angriparen skickar en fil med verkliga kunduppgifter, och ert team har nu hanterat stulna personuppgifter. Dataskyddsombudet frågar om anmälan måste ändras. Blev det just större av att vinna tid?"]),
              pb(["“Are we paying them?”", "”Betalar vi dem?”"], ["Word of the talks reaches the rebuild team. Engineers working through the night ask whether the company is negotiating with the people who deleted their work. How do you keep the team, and the secret, together?", "Ryktet om samtalen når återuppbyggnadsteamet. Tekniker som arbetar hela natten frågar om företaget förhandlar med dem som raderade deras arbete. Hur håller ni ihop teamet, och hemligheten?"]),
              pb(["Time has a price", "Tid har ett pris"], ["The attacker agrees to talk, but wants a “good faith” payment within hours before discussing the rest. Buying time now costs money. Do you pay a little to keep talking, or walk away from the table you chose?", "Angriparen går med på att prata, men vill ha en betalning i ”god tro” inom några timmar innan resten diskuteras. Att vinna tid kostar nu pengar. Betalar ni lite för att fortsätta prata, eller lämnar ni bordet ni själva valde?"])
            ],
            C: [
              pb(["Who gets the money?", "Vem får pengarna?"], ["The bank will not release the transfer without knowing the recipient, and legal cannot rule out a sanctioned group. Nobody can tell you who is on the other side. Who signs a payment to an unknown party?", "Banken släpper inte överföringen utan att veta vem som tar emot den, och juristen kan inte utesluta en sanktionerad grupp. Ingen kan säga vem som finns på andra sidan. Vem skriver under en betalning till en okänd mottagare?"]),
              pb(["A video of deleting", "En video på radering"], ["The attacker offers a screen recording of the files being deleted as proof. Anyone can delete one copy on camera and keep another. What exactly have you bought, and how would you ever know?", "Angriparen erbjuder en skärminspelning där filerna raderas som bevis. Vem som helst kan radera en kopia framför kameran och behålla en annan. Vad har ni egentligen köpt, och hur skulle ni någonsin veta det?"]),
              pb(["Paying does not un-notify", "Betalning tar inte bort anmälan"], ["The DPO reminds you that paying changes none of your duties: the theft still has to be reported and customers still have to be told. The insurer adds that payment without its prior consent is not covered. What does the money still buy?", "Dataskyddsombudet påminner om att en betalning inte ändrar någon av era skyldigheter: stölden ska fortfarande anmälas och kunderna fortfarande informeras. Försäkringsbolaget tillägger att betalning utan deras förhandsgodkännande inte täcks. Vad köper pengarna då?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the refusal", "Efter vägran"], [
              io(["The police see a pattern", "Polisen ser ett mönster"], ["The police thank you for the email and the logs: they believe the same group is behind similar attacks on other companies, and your material helps them.", "Polisen tackar för mejlet och loggarna: de tror att samma grupp ligger bakom liknande angrepp mot andra företag, och ert material hjälper dem."], ["The police are linking the case to similar attacks elsewhere.", "Polisen kopplar ärendet till liknande angrepp på andra håll."]),
              io(["Customers get emails", "Kunderna får mejl"], ["Several of your largest customers receive emails from the attacker with a handful of their own records attached. Their account managers call, angry that they heard it this way.", "Flera av era största kunder får mejl från angriparen med en handfull av sina egna uppgifter bifogade. Deras kundansvariga ringer, arga över att de fick höra det på det här sättet."], ["The attacker has contacted some of your largest customers directly.", "Angriparen har kontaktat några av era största kunder direkt."], { meters: { trust: -1 } }),
              io(["Silence", "Tystnad"], ["The attacker does not reply. No new demand, no deadline, nothing. Some in the room call it a bluff that failed; others say silence is when they act.", "Angriparen svarar inte. Inget nytt krav, ingen tidsfrist, ingenting. Vissa i rummet kallar det en bluff som misslyckades; andra säger att det är i tystnaden de agerar."], ["The attacker went silent after the refusal, for now.", "Angriparen tystnade efter vägran, åtminstone tills vidare."])
            ]),
            ir("i2", { notChosen: "A" }, ["Talking to the attacker", "Samtal med angriparen"], [
              io(["They agree to wait", "De går med på att vänta"], ["The attacker agrees to hold off for 48 hours while “your side gets organised”. The room feels it has bought time, and control.", "Angriparen går med på att vänta 48 timmar medan ”er sida organiserar sig”. Rummet känner att det har köpt tid, och kontroll."], ["The attacker has agreed to wait 48 hours.", "Angriparen har gått med på att vänta 48 timmar."]),
              io(["It reaches the press", "Det når pressen"], ["A reporter asks whether it is true that the company is negotiating with the people who deleted its service. Somebody close to the talks has spoken.", "En reporter frågar om det stämmer att företaget förhandlar med dem som raderade tjänsten. Någon nära samtalen har pratat."], ["Word that you are dealing with the attacker has reached the press.", "Uppgiften att ni har kontakt med angriparen har nått pressen."], { reopen: true, meters: { media: 1 } }),
              io(["A second claimant", "Ytterligare en avsändare"], ["A second email arrives from a different address, also claiming to hold the database and asking for money. Nobody can tell whether it is the same group, a partner or an opportunist.", "Ett andra mejl kommer från en annan adress, som också påstår sig ha databasen och kräver pengar. Ingen kan avgöra om det är samma grupp, en kumpan eller en opportunist."], ["A second, unverified sender claims to hold the data.", "En andra, okontrollerad avsändare påstår sig ha uppgifterna."])
            ])
          ]
        }),
        facilitator: fac(
          ["Payment cannot restore anything here; the only thing on sale is a promise.", "En betalning kan inte återställa något här; det enda som är till salu är ett löfte."],
          ["No payment, police and insurer informed, rebuild continues.", "Ingen betalning, polis och försäkringsbolag informerade, återuppbyggnaden fortsätter."],
          [["Ask: what exactly would you be buying?", "Fråga: vad exakt skulle ni köpa?"]]
        )
      },
      {
        id: "p6",
        clock: 2880,
        priority: 3,
        title: L(["Back, and different", "Tillbaka, och annorlunda"]),
        twist: L(["The rebuilt service is running in a new subscription. Three customers have cancelled, and the regulator asks how backups were protected.", "Den återuppbyggda tjänsten körs i en ny prenumeration. Tre kunder har sagt upp avtalet, och tillsynsmyndigheten frågar hur säkerhetskopiorna skyddades."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "Three customers have cancelled, and the regulator asks how backups were protected. Was your choice on notification the right one?", sv: "Tre kunder har sagt upp sina avtal, och tillsynsmyndigheten frågar hur säkerhetskopiorna skyddades. Var ert val om anmälan det rätta?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because you refused to pay, samples of the customer database have appeared on a leak site.", sv: "Eftersom ni vägrade betala har utdrag ur kunddatabasen dykt upp på en läcksajt." } }
        ],
        assumptionChallenged: L(["When the service is back, the incident is over.", "När tjänsten är tillbaka är incidenten över."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. {{org.service.customer}} is back online after {{num.rebuildHours}} hours, rebuilt almost from scratch.\n\nThe team is exhausted and proud. But being back online is not the same as being back to normal: customers, the regulator and your own board all have questions about what happened before the outage, not only during it.",
          "{{time.T+2880|weekday|cap}}. {{org.service.customer}} är i drift igen efter {{num.rebuildHours}} timmar, ombyggd nästan från grunden.\n\nTeamet är utmattat och stolt. Men att vara i drift igen är inte detsamma som att vara tillbaka till det normala: kunderna, tillsynsmyndigheten och er egen styrelse har alla frågor om det som hände före avbrottet, inte bara under det."
        ]),
        injects: [
          inj("i6-1", 2880, "regulatorLetter", "regulator", "high", "confirmed", [
            "We request a description of how backups of personal data were protected against deletion, and of the change that removed that protection.",
            "Vi begär en beskrivning av hur säkerhetskopior av personuppgifter skyddades mot radering, och av den ändring som tog bort det skyddet."
          ], { pressure: "regulator", substitute: { type: "executiveMessage", source: "person.ceo", content: ["“The board wants a written account of how our backups were protected, and why that changed.”", "”Styrelsen vill ha en skriftlig redogörelse för hur våra säkerhetskopior skyddades, och varför det ändrades.”"] }, tests: ["lo2"] }),
          inj("i6-2", 2900, "customerComplaint", "customer", "medium", "confirmed", [
            "“We understand outages. We do not understand why our customers' data was taken and nobody told us for two days.”",
            "”Avbrott förstår vi. Vi förstår inte varför våra kunders uppgifter togs och ingen sa något på två dagar.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Where do backups live now, and which identity could delete them?", "Var finns säkerhetskopiorna nu, och vilken identitet skulle kunna radera dem?", ["cloudLead"]),
            q("How do you keep pipeline tokens off developer laptops?", "Hur håller ni byggkedjans token borta från utvecklardatorer?", ["devLead", "ciso"]),
            q("Was refusing to pay the right call, looking back?", "Var det rätt att vägra betala, i efterhand?", ["incidentCommander"], "d5")
          ],
          executive: [
            q("Who signs off cost savings that remove a security control?", "Vem godkänner kostnadsbesparingar som tar bort en säkerhetskontroll?", ["cfo", "ceo"]),
            q("What do you offer the customers who stayed?", "Vad erbjuder ni de kunder som stannade?", ["serviceOwner", "comms"]),
            q("Which of your decisions would you defend in front of the regulator?", "Vilka av era beslut skulle ni försvara inför tillsynsmyndigheten?", ["legal"], "d4")
          ]
        },
        challenges: [ch("The cost saving that switched off backup protection saved less per year than one day of this outage.", "Kostnadsbesparingen som stängde av skyddet för säkerhetskopiorna sparade mindre per år än en dag av det här avbrottet.")],
        decision: dec("d6", "ciso", ["What do you change first?", "Vad ändrar ni först?"], [
          ["Backups in a separate tenant with immutability; no production identity can delete them.", "Säkerhetskopior i en separat organisation med oföränderlighet; ingen produktionsidentitet kan radera dem."],
          ["Restore soft delete on the existing vault.", "Slå på mjuk radering igen på det befintliga valvet."],
          ["Buy more monitoring.", "Köp mer övervakning."]
        ], {
          knowns: [["The pipeline identity could delete everything.", "Byggkedjans identitet kunde radera allt."]],
          uncertainties: [["Which other identities have the same reach.", "Vilka andra identiteter som har samma räckvidd."]],
          tradeoffs: {
            operational: ["A separate tenant adds cost and process.", "En separat organisation ger mer kostnad och process."],
            security: ["Separation is the only control the attacker cannot log in through.", "Separation är den enda kontroll angriparen inte kan logga in genom."],
            legal: ["The regulator asked exactly this question.", "Tillsynsmyndigheten ställde exakt den frågan."],
            reputational: ["Customers want proof, not promises.", "Kunderna vill ha bevis, inte löften."]
          },
          evaluation: [["Puts backups out of reach of every production identity", "Placerar säkerhetskopiorna utom räckhåll för varje produktionsidentitet"]],
          pushback: {
            A: [
              pb(["The same hands", "Samma händer"], ["The new backup tenant will be run by the same cloud team, signing in from the same laptops. If one of them is compromised again, the separation exists only on paper. Who is allowed into the new tenant, and from where?", "Den nya backuporganisationen ska skötas av samma molnteam, som loggar in från samma datorer. Om någon av dem komprometteras igen finns separationen bara på papperet. Vem får komma in i den nya organisationen, och varifrån?"]),
              pb(["Next year's budget", "Nästa års budget"], ["Finance notes that separate, immutable storage costs more, and that the last saving came from exactly this line. When budgets are cut next year, nothing stops it happening again. Who owns this control when the money gets tight?", "Ekonomi påpekar att separat, oföränderlig lagring kostar mer, och att den förra besparingen kom från exakt den raden. När budgeten skärs ned nästa år hindrar ingenting att det händer igen. Vem äger den här kontrollen när pengarna tryter?"]),
              pb(["A restore nobody has tried", "En återställning ingen har provat"], ["Nobody has ever restored production from another tenant. The first test suggests it takes days, not hours. Is a backup you cannot restore quickly the protection you promised the regulator?", "Ingen har någonsin återställt produktionen från en annan organisation. Det första testet tyder på att det tar dagar, inte timmar. Är en säkerhetskopia ni inte kan återställa snabbt det skydd ni lovade tillsynsmyndigheten?"])
            ],
            B: [
              pb(["One switch away", "En knapp bort"], ["Soft delete was switched off once by a normal change, and any identity with owner rights can switch it off again. An attacker with those rights would do it first. What have you actually protected against?", "Mjuk radering stängdes av en gång genom en vanlig ändring, och vilken identitet som helst med ägarrättigheter kan stänga av den igen. En angripare med de rättigheterna skulle göra det först. Vad har ni egentligen skyddat er mot?"]),
              pb(["The regulator's exact question", "Tillsynsmyndighetens exakta fråga"], ["The regulator asked how backups are protected against deletion. Your honest answer is that a production identity can still delete them, just more slowly. Will you put that sentence in your reply?", "Tillsynsmyndigheten frågade hur säkerhetskopiorna skyddas mot radering. Ert ärliga svar är att en produktionsidentitet fortfarande kan radera dem, bara långsammare. Skriver ni den meningen i ert svar?"]),
              pb(["The insurer's renewal", "Försäkringsbolagets förnyelse"], ["The insurer's renewal questionnaire asks whether backups are immutable and held apart from production. Soft delete on the same vault ticks neither box. Do you accept worse terms, or reopen the decision?", "Försäkringsbolagets frågeformulär inför förnyelsen frågar om säkerhetskopiorna är oföränderliga och hålls åtskilda från produktionen. Mjuk radering på samma valv uppfyller inget av kraven. Accepterar ni sämre villkor, eller öppnar ni beslutet igen?"])
            ],
            C: [
              pb(["The alarm already rang", "Larmet gick redan"], ["Monitoring raised a critical alert within minutes of the first deletion. Seeing it did not stop it. What would more monitoring have changed, when the identity was allowed to do everything it did?", "Övervakningen gav ett kritiskt larm inom några minuter efter den första raderingen. Att se det stoppade det inte. Vad hade mer övervakning ändrat, när identiteten hade rätt att göra allt den gjorde?"]),
              pb(["Who reads the alerts?", "Vem läser larmen?"], ["The SOC lead says nobody watches alerts at night or on weekends, which is when this happened. More tools mean more alerts for the same empty chair. Are you buying protection or more noise?", "SOC-chefen säger att ingen bevakar larmen på nätter och helger, vilket är när det här hände. Fler verktyg ger fler larm till samma tomma stol. Köper ni skydd eller mer brus?"]),
              pb(["A customer's questionnaire", "En kunds frågeformulär"], ["A customer that stayed sends a security questionnaire before renewing: are backups separate and immutable? “We monitor them more closely” is not an option on the form. What do you answer?", "En kund som stannade skickar ett säkerhetsformulär inför förnyelsen: är säkerhetskopiorna separata och oföränderliga? ”Vi övervakar dem noggrannare” finns inte som svarsalternativ. Vad svarar ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The separate tenant", "Den separata organisationen"], [
              io(["The insurer accepts", "Försäkringsbolaget godtar"], ["The insurer reviews the plan for a separate, immutable backup tenant and confirms the renewal on normal terms. The board calls it a turning point.", "Försäkringsbolaget granskar planen för en separat, oföränderlig backuporganisation och bekräftar förnyelsen på normala villkor. Styrelsen kallar det en vändpunkt."], ["The insurer accepted the separate backup tenant for renewal.", "Försäkringsbolaget godtog den separata backuporganisationen vid förnyelsen."]),
              io(["Only half this year", "Bara hälften i år"], ["Finance approves the new tenant, but only within this year's budget. Half of production will be covered now, the rest next year, if the money is still there.", "Ekonomi godkänner den nya organisationen, men bara inom årets budget. Halva produktionen täcks nu, resten nästa år, om pengarna finns kvar då."], ["Only part of production is covered by the new backup tenant this year.", "Bara en del av produktionen täcks av den nya backuporganisationen i år."], { reopen: true }),
              io(["Who holds the keys?", "Vem har nycklarna?"], ["The regulator replies with one question: who can sign in to the new backup tenant, and from which devices? The honest answer is the same cloud team, from the same laptops.", "Tillsynsmyndigheten svarar med en fråga: vem kan logga in i den nya backuporganisationen, och från vilka enheter? Det ärliga svaret är samma molnteam, från samma datorer."], ["The regulator wants to know who can access the new backup tenant.", "Tillsynsmyndigheten vill veta vem som har åtkomst till den nya backuporganisationen."])
            ]),
            ir("i2", { notChosen: "A" }, ["Backups still within reach", "Säkerhetskopiorna är fortfarande inom räckhåll"], [
              io(["The regulator is not satisfied", "Tillsynsmyndigheten är inte nöjd"], ["The regulator replies that your measures do not stop a production identity from deleting backups, which was its question. It asks for a plan with dates.", "Tillsynsmyndigheten svarar att era åtgärder inte hindrar en produktionsidentitet från att radera säkerhetskopiorna, vilket var deras fråga. De begär en plan med datum."], ["The regulator found the backup measures insufficient and wants a dated plan.", "Tillsynsmyndigheten bedömde åtgärderna för säkerhetskopiorna som otillräckliga och vill ha en daterad plan."], { reopen: true, meters: { regulator: 1 } }),
              io(["The test is caught", "Testet fångas"], ["A planned test deletion is spotted and dealt with within minutes. The team calls the problem solved. Nobody tested a deletion made with owner rights.", "En planerad testradering upptäcks och hanteras inom några minuter. Teamet säger att problemet är löst. Ingen testade en radering gjord med ägarrättigheter."], ["A test deletion was caught; no test used owner rights.", "En testradering fångades; inget test gjordes med ägarrättigheter."]),
              io(["A renewal on hold", "En förnyelse pausas"], ["A large customer's questionnaire asks whether backups are separate and immutable. You answer no, and they put the renewal on hold until you can say yes.", "En stor kunds frågeformulär frågar om säkerhetskopiorna är separata och oföränderliga. Ni svarar nej, och de pausar förnyelsen tills ni kan svara ja."], ["A large customer has paused renewal over the backup answer.", "En stor kund har pausat förnyelsen på grund av svaret om säkerhetskopiorna."], { meters: { trust: -1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["End on governance: a security control was traded for a small saving without anyone owning the risk.", "Avsluta med styrning: en säkerhetskontroll byttes mot en liten besparing utan att någon ägde risken."],
          ["Isolated, immutable backups and least privilege for automation.", "Isolerade, oföränderliga säkerhetskopior och minsta möjliga behörighet för automatisering."],
          [["Ask: which other controls were removed to save money?", "Fråga: vilka andra kontroller har tagits bort för att spara pengar?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The service is rebuilt from code in a clean subscription, but the copied customer data stays out of reach and some customers leave.",
        "Tjänsten byggs upp från kod i en ren prenumeration, men de kopierade kunduppgifterna förblir utom räckhåll och en del kunder lämnar."
      ])
    },

    debrief: {
      keyLessons: [
        L(["An attacker with your automation's identity needs no exploit: limit what automation can do.", "En angripare med er automatiserings identitet behöver ingen sårbarhet: begränsa vad automatiseringen får göra."]),
        L(["Backups the production identity can delete are not backups.", "Säkerhetskopior som produktionsidentiteten kan radera är inga säkerhetskopior."]),
        L(["Loud destruction can hide a quiet export: look for both.", "Högljudd förstörelse kan dölja en tyst export: leta efter båda."]),
        L(["Infrastructure as code turns a wipe into a rebuild.", "Infrastruktur som kod gör en radering till en återuppbyggnad."])
      ],
      assumptionsVsReality: [
        avr(["A broken deployment.", "En trasig driftsättning."], ["A stolen pipeline token.", "En stulen token för byggkedjan."], "p2"),
        avr(["We can restore from backup.", "Vi kan återställa från säkerhetskopia."], ["The backups were deleted first.", "Säkerhetskopiorna raderades först."], "p3"),
        avr(["Nothing was taken.", "Ingenting togs."], ["The customer database was copied.", "Kunddatabasen kopierades."], "p4")
      ],
      strengthsToLookFor: [
        L(["Disabling the identity before investigating", "Att stänga av identiteten innan utredningen"]),
        L(["Rebuilding in a clean subscription", "Att bygga upp i en ren prenumeration"]),
        L(["Treating the export as a breach on time", "Att behandla exporten som en incident i tid"])
      ],
      commonGaps: [
        L(["Rolling back through the compromised pipeline", "Att rulla tillbaka via den komprometterade byggkedjan"]),
        L(["Rotating only the one token that was seen", "Att bara byta den token som syntes"]),
        L(["Forgetting the data while restoring the servers", "Att glömma uppgifterna medan servrarna återställs"])
      ],
      suggestedActions: [
        act(["Move backups to a separate tenant with immutability and no production identity access.", "Flytta säkerhetskopiorna till en separat organisation med oföränderlighet och utan åtkomst för produktionsidentiteter."], "cloudLead", "high"),
        act(["Replace long-lived pipeline tokens with short-lived, workload-bound credentials.", "Ersätt långlivade token i byggkedjan med kortlivade uppgifter knutna till arbetslasten."], "devLead", "high"),
        act(["Require security sign-off for cost savings that change controls.", "Kräv säkerhetsgodkännande för kostnadsbesparingar som ändrar kontroller."], "cfo", "medium"),
        act(["Keep a tested break-glass account outside single sign-on.", "Ha ett testat nödkonto utanför den gemensamma inloggningen."], "ciso", "medium")
      ]
    }
  });
})();
