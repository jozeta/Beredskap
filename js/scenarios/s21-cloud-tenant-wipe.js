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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
          evaluation: [["Stops the identity before investigating the cause", "Stoppar identiteten innan orsaken utreds"]]
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
          evaluation: [["Rotates every credential that could have been on the laptop", "Byter varje inloggningsuppgift som kan ha funnits på datorn"]]
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
          evaluation: [["Rebuilds somewhere the attacker has never been", "Bygger upp någonstans där angriparen aldrig har varit"]]
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
          ["Treat it as an outage only until the attacker uses the data.", "Behandla det som enbart ett avbrott tills angriparen använder uppgifterna."]
        ], {
          knowns: [["Customer data was exported to an outside account.", "Kunduppgifter exporterades till ett externt konto."]],
          uncertainties: [["Whether the attacker will publish or sell it.", "Om angriparen kommer att publicera eller sälja dem."]],
          tradeoffs: {
            operational: ["Notification work competes with the rebuild for people.", "Arbetet med anmälan konkurrerar med återuppbyggnaden om personal."],
            security: ["Customers can protect themselves only if they know.", "Kunderna kan bara skydda sig om de vet."],
            legal: ["The deadline runs from awareness, not from recovery.", "Tidsfristen löper från kännedom, inte från återställning."],
            reputational: ["Saying “breach” on top of “outage” hurts twice.", "Att säga ”intrång” utöver ”avbrott” gör ont två gånger."]
          },
          evaluation: [["Notifies within the deadline regardless of the outage", "Anmäler inom tidsfristen oavsett avbrottet"]]
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
          evaluation: [["Separates recovery (no payment needed) from the data question", "Skiljer återställningen (ingen betalning behövs) från frågan om uppgifterna"]]
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
          evaluation: [["Puts backups out of reach of every production identity", "Placerar säkerhetskopiorna utom räckhåll för varje produktionsidentitet"]]
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
