/*
 * s10-msp-compromise.js — "The Keys Were With Someone Else" (archetype D).
 *
 * The managed service provider's remote-management tool runs an unknown script
 * → the MSP is unreachable because the MSP itself is breached → MSP admin
 * accounts are used across all its customers → the contract has no incident
 * clauses → nobody in-house holds admin access → timed ransomware sits on
 * machines your EDR does not cover → the national CSIRT coordinates all MSP
 * customers → building independence takes months.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s10-msp-compromise",
    version: 1,
    category: "third-party",
    archetype: "third-party-origin",
    emblem: "msp",
    title: L(["The Keys Were With Someone Else", "Nycklarna låg hos någon annan"]),
    summary: L([
      "On a holiday eve, your IT provider's remote-management tool starts running a script nobody ordered. The provider does not answer. Then you discover who actually holds the keys to your network.",
      "En helgdagsafton börjar er IT-leverantörs verktyg för fjärrförvaltning köra ett skript som ingen har beställt. Leverantören svarar inte. Sedan upptäcker ni vem som egentligen har nycklarna till ert nätverk."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain an attack that arrives through a trusted provider", "Begränsa ett angrepp som kommer via en betrodd leverantör"]), teaser: L(["When help becomes a risk", "När hjälp blir en risk"]) },
      { id: "lo2", text: L(["Regain independent administrative control", "Återta egen administrativ kontroll"]), teaser: L(["Standing on your own feet", "Att stå på egna ben"]) },
      { id: "lo3", text: L(["Act when contracts and providers fail you", "Agera när avtal och leverantörer sviker"]), teaser: L(["When agreements meet reality", "När avtal möter verkligheten"]) },
      { id: "lo4", text: L(["Coordinate with other victims and national bodies", "Samordna med andra drabbade och nationella myndigheter"]), teaser: L(["You are not the only one", "Ni är inte ensamma"]) }
    ],
    mitre: ["T1199", "T1072", "T1219", "T1078", "T1059", "T1486"],
    frameworks: {
      nistCsf: ["GV.SC", "GV.RR", "ID.AM", "PR.AA", "DE.CM", "RS.MA", "RS.MI", "RS.CO", "RC.RP"],
      iso27001: ["A.5.19", "A.5.20", "A.5.21", "A.5.22", "A.5.24", "A.5.26", "A.5.30", "A.8.2", "A.8.7"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "holiday-eve", sectors: ["retail", "logistics", "manufacturing", "education", "public", "healthcare"] },
    actor: { types: ["criminal"], motivation: L(["Mass ransomware deployment through a service provider", "Massutrullning av ransomware via en tjänsteleverantör"]), capability: "high" },
    variables: {
      hosts: { min: 40, max: 2000, step: 10, scaleBy: "size" },
      blockedPct: { min: 45, max: 85 },
      mspCustomers: { min: 25, max: 120 },
      unprotected: { min: 5, max: 300, scaleBy: "size" },
      newMspMonths: { min: 3, max: 9 },
      unprotectedPct: { derive: (v) => Math.max(1, Math.round((100 * v.unprotected) / v.hosts)) }
    },
    roles: ["incidentCommander", "ciso", "cio", "itOps", "socLead", "supplierManager", "serviceOwner", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "The attackers compromised {{supplier.msp}} through an internet-exposed administration console for its remote-management server. From there they used the MSP's own administrator accounts — present in the networks of all {{num.mspCustomers}} customers — to push a script that disabled protection and staged ransomware timed for the holiday night. Your organisation held no independent administrative access; all privileged credentials were stored at the MSP.",
        "Angriparna komprometterade {{supplier.msp}} via en internetexponerad administrationskonsol för leverantörens server för fjärrförvaltning. Därifrån använde de leverantörens egna administratörskonton – som fanns i nätverken hos alla {{num.mspCustomers}} kunder – för att skicka ut ett skript som stängde av skyddet och placerade ut ransomware som var inställd att utlösas under helgnatten. Er organisation hade ingen egen administrativ åtkomst; alla privilegierade inloggningsuppgifter förvarades hos leverantören."
      ]),
      attackerTimeline: [
        { at: -10080, text: L(["MSP's remote-management admin console compromised.", "Leverantörens administrationskonsol för fjärrförvaltning komprometteras."]) },
        { at: -4320, text: L(["Customer networks mapped using MSP admin accounts.", "Kundnätverken kartläggs med leverantörens administratörskonton."]) },
        { at: -10, text: L(["Script pushed to all customers through the remote-management tool.", "Skript skickas ut till alla kunder via verktyget för fjärrförvaltning."]) },
        { at: 0, text: L(["Script runs: disables protection, stages ransomware.", "Skriptet körs: stänger av skyddet och placerar ut ransomware."]) },
        { at: 1980, text: L(["Ransomware set to trigger on unprotected machines.", "Ransomware inställd att utlösas på oskyddade datorer."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-msp", revealStage: "p2", text: L(["The MSP itself was breached through an exposed admin console; its tool is being used against all its customers.", "Leverantören själv har drabbats av ett intrång via en exponerad administrationskonsol; dess verktyg används mot alla dess kunder."]) },
      { id: "hf-admins", revealStage: "p3", text: L(["The MSP's administrator accounts exist in your network with full rights and are used by the attackers.", "Leverantörens administratörskonton finns i ert nätverk med fullständiga rättigheter och används av angriparna."]) },
      { id: "hf-noaccess", revealStage: "p5", text: L(["Nobody in-house holds privileged credentials; all of them are stored at the MSP.", "Ingen internt har privilegierade inloggningsuppgifter; alla förvaras hos leverantören."]) },
      { id: "hf-timed", revealStage: "p6", text: L(["Ransomware is staged on {{num.unprotected}} machines your EDR does not cover, timed to trigger at night.", "Ransomware finns utplacerad på {{num.unprotected}} datorer som ert EDR inte täcker, inställd att utlösas nattetid."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A script nobody ordered", "Ett skript som ingen har beställt"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. Most staff have already left for the holiday. Your IT is run by {{supplier.msp}}, an outside provider; your own IT team is two people.\n\nThe {{env.edr}} console lights up: the provider's remote-management agent is running a script called “maintenance” on {{num.hosts}} machines. Nobody ordered any maintenance, and the script is trying to switch off your security tools.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. De flesta har redan gått för helgen. Er IT drivs av {{supplier.msp}}, en extern leverantör; ert eget IT-team består av två personer.\n\n{{env.edr}}-konsolen lyser upp: leverantörens fjärrhanteringsagent kör ett skript som heter ”maintenance” på {{num.hosts}} datorer. Ingen har beställt något underhåll, och skriptet försöker stänga av era säkerhetsverktyg."
        ]),
        injects: [
          inj("i1-1", 0, "edrAlert", "edr", "critical", "confirmed", [
            "The remote-management agent started a script that tries to disable endpoint protection and delete shadow copies. Blocked on {{num.blockedPct}} % of machines so far.",
            "Fjärrförvaltningsagenten startade ett skript som försöker stänga av klientskyddet och radera skuggkopior. Blockerat på {{num.blockedPct}} % av datorerna hittills."
          ], { headline: ["{{env.edrAlert|cap}}: provider tool running hostile script", "{{env.edrAlert|cap}}: leverantörens verktyg kör fientligt skript"], tests: ["lo1"] }),
          inj("i1-2", 20, "chat", "person.itOps", "high", "confirmed", [
            "“That's the MSP's agent — it runs on everything. If we block it we can't get support from them at all.”",
            "”Det är leverantörens agent – den finns på allt. Om vi blockerar den kan vi inte få någon support alls från dem.”"
          ], { tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-script", type: "line", markers: "injects",
          title: L(["Script executions per minute", "Skriptkörningar per minut"]), unit: L(["executions", "körningar"]),
          data: line(["Executions", "Körningar"], -20, 40, 2, (x, ctx) => (x < -10 ? 0 : (ctx.vars.hosts / 12) * Math.exp(-Math.max(0, x) / 15) + ctx.rng.int(0, 4)))
        }],
        questions: {
          technical: [
            q("Can you block the provider's agent without losing control of your own network?", "Kan ni blockera leverantörens agent utan att förlora kontrollen över ert eget nätverk?", ["itOps", "socLead"]),
            q("What did the script do on the machines where it was not blocked?", "Vad gjorde skriptet på de datorer där det inte blockerades?", ["socLead"]),
            q("Which other accounts and tools does the provider use in your environment?", "Vilka andra konton och verktyg använder leverantören i er miljö?", ["itOps", "ciso"])
          ],
          executive: [
            q("Who can decide to cut off your IT provider on a holiday eve?", "Vem kan besluta att stänga ute er IT-leverantör en helgdagsafton?", ["cio", "ceo"]),
            q("Who do you call at the provider, and what if nobody answers?", "Vem ringer ni hos leverantören, och vad händer om ingen svarar?", ["supplierManager", "cio"]),
            q("Who is available over the holiday?", "Vem finns tillgänglig under helgen?", ["incidentCommander"])
          ]
        },
        challenges: [ch("Your own IT team is two people; everything else is the provider.", "Ert eget IT-team består av två personer; allt annat är leverantören.")],
        decision: dec("d1", "cio", ["What do you do about the provider's agent?", "Vad gör ni med leverantörens agent?"], [
          ["Block the agent and the provider's remote access at the firewall now.", "Blockera agenten och leverantörens fjärråtkomst i brandväggen nu."],
          ["Call the provider first and act on their advice.", "Ring leverantören först och agera enligt deras råd."],
          ["Let EDR handle it and monitor.", "Låt EDR hantera det och bevaka."]
        ], {
          knowns: [["The provider's tool is running a hostile script.", "Leverantörens verktyg kör ett fientligt skript."]],
          uncertainties: [["Whether the provider knows.", "Om leverantören vet om det."]],
          tradeoffs: {
            operational: ["Blocking removes all provider support.", "Att blockera tar bort allt stöd från leverantören."],
            security: ["The agent is the attacker's channel right now.", "Agenten är angriparens kanal just nu."],
            legal: ["The contract may not foresee you blocking the provider.", "Avtalet förutser kanske inte att ni blockerar leverantören."],
            reputational: ["Being slow on a holiday eve is understandable but costly.", "Att vara långsam en helgdagsafton är förståeligt men dyrt."]
          },
          evaluation: [["Cuts the hostile channel without waiting for the provider", "Stänger den fientliga kanalen utan att vänta på leverantören"]],
          pushback: {
            A: [
              pb(["It already ran", "Det har redan körts"], ["Blocking the agent stops the next command, not the last one. On the machines where EDR did not block it, the script has already run. Do you now go through them one by one with a team of two, on a holiday eve?", "Att blockera agenten stoppar nästa kommando, inte det förra. På de datorer där EDR inte stoppade det har skriptet redan körts. Går ni nu igenom dem en och en med ett team på två personer, en helgdagsafton?"]),
              pb(["The contract does not allow it", "Avtalet tillåter det inte"], ["Your supplier manager warns that cutting the provider off without notice may let them reject responsibility for anything that happens from now on. On a holiday eve, that means you carry it all. Are you ready to own every consequence yourselves?", "Er leverantörsansvarige varnar för att leverantören kan avsäga sig ansvaret för allt som händer från och med nu om ni stänger ute dem utan förvarning. En helgdagsafton betyder det att ni bär allt själva. Är ni beredda att äga varje konsekvens själva?"]),
              pb(["Two people, every request", "Två personer, varje ärende"], ["With the agent blocked, everything the provider did through it now lands on your two IT staff. Holiday staff are already asking for password resets and access to shared folders. Who handles that, while also handling the attack?", "Med agenten blockerad hamnar allt som leverantören gjorde genom den på era två IT-medarbetare. Personal som jobbar över helgen ber redan om nya lösenord och åtkomst till delade mappar. Vem tar hand om det, samtidigt som angreppet hanteras?"])
            ],
            B: [
              pb(["Number six in the queue", "Nummer sex i kön"], ["The provider's support line puts you in a queue: you are number six, on a holiday eve. Meanwhile the script keeps running. How long do you hold before you act without them?", "Leverantörens supportlinje sätter er i kö: ni är nummer sex, en helgdagsafton. Under tiden fortsätter skriptet att köras. Hur länge väntar ni innan ni agerar utan dem?"]),
              pb(["Who is giving the advice?", "Vem ger rådet?"], ["The script is coming from the provider's own tool. Whoever answers may not know what their tool is doing, or may be the one doing it. How will you know their advice is safe to follow?", "Skriptet kommer från leverantörens eget verktyg. Den som svarar kanske inte vet vad verktyget gör, eller är kanske den som gör det. Hur vet ni att deras råd är säkert att följa?"]),
              pb(["The CISO objects", "CISO:n invänder"], ["Your CISO: “Their tool is the one attacking us, and we are asking them whether to stop it.” The CIO wants to follow the provider's lead. Who has the final word while the script is still running?", "Er CISO: ”Det är deras verktyg som angriper oss, och vi frågar dem om vi ska stoppa det.” CIO:n vill följa leverantörens linje. Vem har sista ordet medan skriptet fortfarande körs?"])
            ],
            C: [
              pb(["Not one hundred percent", "Inte hundra procent"], ["EDR has blocked the script on {{num.blockedPct}} % of machines. You are monitoring a number that is not one hundred. What exactly are you watching on the machines where it was not blocked?", "EDR har stoppat skriptet på {{num.blockedPct}} % av datorerna. Ni bevakar en siffra som inte är hundra. Vad är det egentligen ni bevakar på de datorer där det inte stoppades?"]),
              pb(["It targets the watcher", "Det siktar på vakten"], ["The script is trying to switch off your security tools, the same tools you are relying on to handle it. On any machine where it succeeds, your monitoring goes quiet. Are you watching the attack, or just not seeing it?", "Skriptet försöker stänga av era säkerhetsverktyg, samma verktyg som ni förlitar er på för att hantera det. På varje dator där det lyckas tystnar er bevakning. Bevakar ni angreppet, eller ser ni det bara inte?"]),
              pb(["Who watches tonight?", "Vem vakar i natt?"], ["Monitoring means someone awake all night. Your two IT staff are about to leave for the holiday, and nobody else can read the console. Who stays, for how long, and what will make them call you?", "Bevakning innebär att någon är vaken hela natten. Era två IT-medarbetare är på väg hem för helgen, och ingen annan kan läsa konsolen. Vem stannar, hur länge, och vad ska få dem att ringa er?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The agent is blocked", "Agenten är blockerad"], [
              io(["Executions stop", "Körningarna upphör"], ["Within minutes, script executions drop to zero on the console. Someone says “that's it, then” and starts packing up for the holiday.", "Inom några minuter sjunker antalet skriptkörningar till noll i konsolen. Någon säger ”då var det klart” och börjar packa ihop inför helgen."], ["Script executions stopped within minutes of the block.", "Skriptkörningarna upphörde inom några minuter efter blockeringen."]),
              io(["The backup fails", "Säkerhetskopieringen misslyckas"], ["Tonight's backup job, which runs through the provider's remote access, fails at once. Your IT staff ask whether to open a narrow gap just for the backups.", "Kvällens säkerhetskopiering, som går via leverantörens fjärråtkomst, misslyckas direkt. Era IT-medarbetare frågar om de ska öppna en smal lucka bara för säkerhetskopiorna."], ["Tonight's backup job failed after the block.", "Kvällens säkerhetskopiering misslyckades efter blockeringen."], { reopen: true }),
              io(["Agents keep calling home", "Agenterna ringer hem"], ["The blocked agents keep trying to reach the provider's server every minute, and the firewall log fills up. Is that just the software, or is something waiting for the door to open?", "De blockerade agenterna försöker nå leverantörens server varje minut, och brandväggsloggen fylls. Är det bara programvaran, eller väntar något på att dörren ska öppnas?"], ["Blocked agents keep trying to reach the provider every minute.", "De blockerade agenterna försöker nå leverantören varje minut."])
            ]),
            ir("i2", { notChosen: "A" }, ["The agent stays connected", "Agenten är kvar"], [
              io(["Machines go quiet", "Datorer tystnar"], ["Several machines that were reporting to the EDR console a moment ago have gone silent. The script may have succeeded in switching off their protection.", "Flera datorer som nyss rapporterade till EDR-konsolen har tystnat. Skriptet kan ha lyckats stänga av deras skydd."], ["Several machines stopped reporting to the EDR console tonight.", "Flera datorer slutade rapportera till EDR-konsolen i kväll."], { reopen: true }),
              io(["A quiet half hour", "En lugn halvtimme"], ["For the next half hour, no new script runs appear. It looks as if EDR has it under control, and the urge to go home grows.", "Under nästa halvtimme syns inga nya skriptkörningar. Det ser ut som att EDR har läget under kontroll, och lusten att gå hem växer."], ["No new script runs appeared in the following half hour.", "Inga nya skriptkörningar syntes under den följande halvtimmen."]),
              io(["“Scheduled maintenance”", "”Planerat underhåll”"], ["The provider's status page briefly shows “scheduled maintenance”, then stops loading. Was it planned after all, or is the page wrong?", "Leverantörens statussida visar en kort stund ”planerat underhåll” och slutar sedan att laddas. Var det planerat ändå, eller visar sidan fel?"], ["The provider's status page briefly showed “scheduled maintenance”.", "Leverantörens statussida visade en kort stund ”planerat underhåll”."])
            ])
          ]
        }),
        facilitator: fac(
          ["The tool you rely on is the weapon. Watch the dependency anxiety.", "Verktyget ni är beroende av är vapnet. Se hur beroendet skapar oro."],
          ["Provider access blocked at the network edge immediately, with an attempt to reach the provider in parallel.", "Leverantörens åtkomst blockerad i nätkanten omedelbart, med försök att nå leverantören parallellt."],
          [["Ask: what is the worst thing the agent could do in the next hour?", "Fråga: vad är det värsta agenten kan göra den närmaste timmen?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Nobody answers", "Ingen svarar"]),
        twist: L(["You are not the target — your provider is. The provider itself has been breached.", "Det är inte ni som är målet – det är er leverantör. Leverantören har själv drabbats av ett intrång."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the provider's remote access was blocked, the patching and backups that run through it stopped as well.", sv: "Eftersom leverantörens fjärråtkomst blockerades stoppades även de uppdateringar och säkerhetskopieringar som går via den." } }
        ],
        assumptionChallenged: L(["This is an attack on our organisation.", "Det här är ett angrepp mot vår organisation."]),
        reveals: ["hf-msp"],
        narrative: L([
          "{{time.T+60|clock}}. You try to reach the provider. Their support line goes to voicemail, their status page is down, and the account manager's mobile is switched off.\n\nThe company you pay to run your IT has gone silent, on the evening when you need it most. Meanwhile, messages from other companies start appearing in security forums, describing exactly what you are seeing.",
          "Klockan {{time.T+60|clock}}. Ni försöker nå leverantören. Deras supportlinje går till röstbrevlådan, statussidan ligger nere och kundansvariges mobil är avstängd.\n\nFöretaget ni betalar för att driva er IT har tystnat, den kväll ni behöver det som mest. Samtidigt börjar meddelanden från andra företag dyka upp i säkerhetsforum, med beskrivningar av exakt det ni ser."
        ]),
        injects: [
          inj("i2-1", 60, "threatIntel", "threatIntel", "critical", "confirmed", [
            "Multiple organisations report the same script from {{supplier.msp}}'s tool tonight. The provider's remote-management server appears to be compromised; it is being used against all its customers.",
            "Flera organisationer rapporterar samma skript från verktyget hos {{supplier.msp}} i kväll. Leverantörens server för fjärrförvaltning verkar vara komprometterad; den används mot alla dess kunder."
          ], { headline: ["Provider compromise", "Intrång hos leverantören"], reveals: ["hf-msp"], statedReliability: ["Multiple independent reports", "Flera oberoende rapporter"], tests: ["lo1", "lo4"] }),
          inj("i2-2", 90, "sms", "supplier", "medium", "unverified", [
            "From an unknown number claiming to be the provider's technician: “We are investigating. Please re-enable our access so we can help you.”",
            "Från ett okänt nummer som påstår sig vara leverantörens tekniker: ”Vi utreder. Var snälla och öppna vår åtkomst igen så att vi kan hjälpa er.”"
          ], { optional: true, facilitatorNote: ["Possibly the attacker. Watch whether the group verifies identity before restoring access.", "Möjligen angriparen. Se om gruppen verifierar identiteten innan åtkomst återställs."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c2-kpi", type: "kpi",
          title: L(["Provider compromise", "Intrånget hos leverantören"]),
          data: kpi([
            { id: "customers", label: ["Provider customers at risk", "Leverantörens kunder i riskzonen"], value: (v) => v.mspCustomers, tone: "danger" },
            { id: "hosts", label: ["Your machines with the agent", "Era datorer med agenten"], value: (v) => v.hosts, tone: "warn" },
            { id: "blocked", label: ["Script blocked (%)", "Skriptet blockerat (%)"], value: (v) => v.blockedPct, tone: "ok" }
          ])
        }],
        questions: {
          technical: [
            q("How do you verify anyone claiming to be from the provider?", "Hur verifierar ni den som påstår sig komma från leverantören?", ["itOps", "ciso"]),
            q("What does the provider's tool have access to that you have not yet blocked?", "Vad har leverantörens verktyg åtkomst till som ni ännu inte har blockerat?", ["itOps", "socLead"]),
            q("Did your first decision close the provider's channel completely?", "Stängde ert första beslut leverantörens kanal helt?", ["itOps"], "d1")
          ],
          executive: [
            q("Who else needs to know — {{reg.csirt}}, other customers, the police?", "Vilka mer behöver veta – {{reg.csirt}}, andra kunder, polisen?", ["ciso", "ceo"]),
            q("How do you get help on a holiday without your provider?", "Hur får ni hjälp under en helg utan er leverantör?", ["cio", "ceo"]),
            q("Would you have decided differently if you had known this an hour ago?", "Hade ni beslutat annorlunda om ni vetat det här för en timme sedan?", ["cio"], "d1")
          ]
        },
        challenges: [ch("Someone claiming to be the provider asks you to open the door again.", "Någon som påstår sig vara leverantören ber er öppna dörren igen.")],
        decision: dec("d2", "cio", ["Where do you get help?", "Var får ni hjälp?"], [
          ["Activate an independent incident response firm and report to {{reg.csirt}}.", "Aktivera ett oberoende incidentresponsföretag och rapportera till {{reg.csirt}}."],
          ["Wait for the provider to recover and help you.", "Vänta på att leverantören återhämtar sig och hjälper er."],
          ["Restore the provider's access after a phone check.", "Återställ leverantörens åtkomst efter en kontroll per telefon."]
        ], {
          knowns: [["The provider is compromised and unreachable.", "Leverantören är komprometterad och går inte att nå."]],
          uncertainties: [["When the provider will be able to help.", "När leverantören kommer att kunna hjälpa till."]],
          tradeoffs: {
            operational: ["An outside firm needs time to learn your network.", "Ett externt företag behöver tid för att lära sig ert nätverk."],
            security: ["Restoring provider access may restore the attacker.", "Att återställa leverantörens åtkomst kan återställa angriparens."],
            legal: ["Your contract may not let you charge the provider.", "Ert avtal kanske inte låter er kräva ersättning av leverantören."],
            reputational: ["Many customers are in the same situation.", "Många kunder befinner sig i samma situation."]
          },
          evaluation: [["Brings in independent help quickly", "Tar snabbt in oberoende hjälp"]],
          pushback: {
            A: [
              pb(["A holiday rate", "Helgtaxa"], ["The response firm can start in the morning, or tonight at holiday rates against a signed order from someone with budget authority. Nobody with that authority is answering. Who signs, and is tonight worth it?", "Incidentfirman kan börja i morgon bitti, eller i kväll till helgtaxa mot en underskriven beställning från någon med budgetbefogenhet. Ingen med den befogenheten svarar. Vem skriver under, och är i kväll värt det?"]),
              pb(["They do not know your network", "De känner inte ert nätverk"], ["The response firm asks for a network diagram and a list of critical systems. The only up-to-date documentation is in the provider's portal, which is down. How much of tonight will they spend learning what the provider already knew?", "Incidentfirman ber om en nätverksskiss och en lista över kritiska system. Den enda aktuella dokumentationen finns i leverantörens portal, som ligger nere. Hur mycket av kvällen går åt till att lära sig det leverantören redan visste?"]),
              pb(["Reported before the board knows", "Rapporterat innan styrelsen vet"], ["The CEO hesitates: reporting to {{reg.csirt}} tonight puts your name on a list of victims before your own board has been told. Who decides that the report goes first, and who calls the board chair?", "Vd:n tvekar: att rapportera till {{reg.csirt}} i kväll sätter ert namn på en lista över drabbade innan er egen styrelse har fått veta. Vem beslutar att rapporten går först, och vem ringer styrelseordföranden?"])
            ],
            B: [
              pb(["One of {{num.mspCustomers}}", "En av {{num.mspCustomers}}"], ["The provider has {{num.mspCustomers}} customers, and all of them are in the same state tonight. When the provider recovers, it will help someone first. Why would that be you?", "Leverantören har {{num.mspCustomers}} kunder, och alla är i samma läge i kväll. När leverantören har återhämtat sig kommer den att hjälpa någon först. Varför skulle det vara ni?"]),
              pb(["When is their help safe?", "När är deras hjälp säker?"], ["The provider could not protect its own systems. Even when someone does answer, you will not know whether their tools and accounts are clean. What will they have to show you before you let them back in?", "Leverantören kunde inte skydda sina egna system. Även när någon svarar vet ni inte om deras verktyg och konton är rena. Vad måste de visa er innan ni släpper in dem igen?"]),
              pb(["“Who is working on it?”", "”Vem jobbar med det?”"], ["The CEO asks who is working on the incident tonight. The honest answer is nobody: you are waiting. Do you say that, and what do you say when the CEO asks why?", "Vd:n frågar vem som arbetar med incidenten i kväll. Det ärliga svaret är ingen: ni väntar. Säger ni det, och vad svarar ni när vd:n frågar varför?"])
            ],
            C: [
              pb(["Which number did you call?", "Vilket nummer ringde ni?"], ["The phone check was made to the number in the text message, or to one listed on the provider's own systems. Both could be in the attackers' hands. How do you know who you actually spoke to?", "Kontrollen per telefon gjordes till numret i sms:et, eller till ett nummer från leverantörens egna system. Båda kan vara i angriparnas händer. Hur vet ni vem ni egentligen pratade med?"]),
              pb(["A real person, a breached tool", "En äkta person, ett hackat verktyg"], ["Even if the technician is genuine, the remote-management server is the one being used against every customer. Reopening access reopens it to whoever controls that server. Is a real technician on the phone enough?", "Även om teknikern är äkta är det servern för fjärrförvaltning som används mot alla kunder. Att öppna åtkomsten igen öppnar den för den som styr den servern. Räcker det med en äkta tekniker i telefon?"]),
              pb(["The CISO will not sign", "CISO:n skriver inte under"], ["Your CISO refuses to approve reopening the provider's access and wants the objection in writing. If you go ahead, the decision carries your name alone. Do you overrule them on a phone call?", "Er CISO vägrar godkänna att leverantörens åtkomst öppnas igen och vill ha invändningen skriftligt. Om ni går vidare står beslutet på ert namn ensamt. Kör ni över hen på grund av ett telefonsamtal?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Outside help called in", "Extern hjälp inkallad"], [
              io(["Indicators arrive", "Indikatorer kommer"], ["{{reg.csirt|cap}} replies quickly with the first indicators gathered from other affected customers. You are no longer guessing alone.", "{{reg.csirt|cap}} svarar snabbt med de första indikatorerna från andra drabbade kunder. Ni gissar inte längre ensamma."], ["{{reg.csirt|cap}} shared first indicators from other affected customers.", "{{reg.csirt|cap}} delade de första indikatorerna från andra drabbade kunder."]),
              io(["The firm cannot connect", "Firman kommer inte in"], ["The response firm's first attempt to connect fails: every remote path into your network ran through the provider. They ask how else they can get in tonight.", "Incidentfirmans första försök att koppla upp sig misslyckas: varje fjärrväg in i ert nätverk gick via leverantören. De frågar hur de annars kan komma in i kväll."], ["The response firm's first remote connection attempt failed.", "Incidentfirmans första försök till fjärranslutning misslyckades."], { reopen: true }),
              io(["May we name you?", "Får vi nämna er?"], ["{{reg.csirt|cap}} asks whether your organisation may be named to other victims so you can compare notes. Nobody in the room is sure who can say yes.", "{{reg.csirt|cap}} frågar om er organisation får nämnas för andra drabbade så att ni kan jämföra iakttagelser. Ingen i rummet vet säkert vem som kan säga ja."], ["{{reg.csirt|cap}} asked whether your name may be shared with other victims.", "{{reg.csirt|cap}} frågade om ert namn får delas med andra drabbade."])
            ]),
            ir("i2", { notChosen: "A" }, ["No independent help", "Ingen oberoende hjälp"], [
              io(["Others are further ahead", "Andra har kommit längre"], ["In the forums, other customers write that their own response firms have been working for an hour already. Your team has nobody outside to call.", "I forumen skriver andra kunder att deras egna incidentfirmor redan har arbetat i en timme. Ert team har ingen utomstående att ringa."], ["Other customers already had outside responders working tonight.", "Andra kunder hade redan externa incidentteam i arbete i kväll."], { reopen: true }),
              io(["A second message", "Ett andra meddelande"], ["The unknown number texts again, more urgently, with a link to “restore support access”. It may be the provider; it may not.", "Det okända numret skickar ett nytt sms, mer brådskande, med en länk för att ”återställa supportåtkomsten”. Det kan vara leverantören; det kan också vara någon annan."], ["A second message urging restored access arrived from the unknown number.", "Ett andra meddelande som uppmanade till återställd åtkomst kom från det okända numret."]),
              io(["A quiet hour", "En lugn timme"], ["The hour after the decision brings no new EDR alerts. It is tempting to think the worst is behind you.", "Timmen efter beslutet kommer inga nya EDR-larm. Det är frestande att tro att det värsta är över."], ["The hour after the decision brought no new EDR alerts.", "Timmen efter beslutet kom inga nya EDR-larm."])
            ])
          ]
        }),
        facilitator: fac(
          ["You are one of many. Independence becomes the theme.", "Ni är en av många. Oberoende blir temat."],
          ["Independent incident response activated, the national CSIRT informed and no provider access restored without verification.", "Oberoende incidentrespons aktiverad, den nationella CSIRT-enheten informerad och ingen leverantörsåtkomst återställd utan verifiering."],
          [["Ask: who could you call tonight who isn't the provider?", "Fråga: vem skulle ni kunna ringa i kväll som inte är leverantören?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 180,
        title: L(["Their accounts, your network", "Deras konton, ert nätverk"]),
        twist: L(["The provider's administrator accounts live in your network with full rights — and the attackers are using them.", "Leverantörens administratörskonton finns i ert nätverk med fullständiga rättigheter – och angriparna använder dem."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "The provider's accounts live in your network with full rights. If you blocked the agent, the attackers still had the accounts. If you called the provider first, nobody answered.", sv: "Leverantörens konton finns i ert nät med fulla rättigheter. Om ni blockerade agenten hade angriparna fortfarande kontona. Om ni ringde leverantören först svarade ingen." } },
        assumptionChallenged: L(["Blocking the agent removed the attackers' access.", "Att blockera agenten tog bort angriparnas åtkomst."]),
        reveals: ["hf-admins"],
        narrative: L([
          "{{time.T+180|clock}}. An incident response firm you called directly is now connected remotely, and has started looking at your directory.\n\nBlocking the provider's agent stopped the script. But the agent was only one of the ways the provider reaches into your network, and the response team wants to see all the others.",
          "Klockan {{time.T+180|clock}}. En incidentfirma som ni ringde direkt är nu uppkopplad på distans och har börjat titta på er katalogtjänst.\n\nAtt blockera leverantörens agent stoppade skriptet. Men agenten var bara ett av sätten som leverantören når in i ert nätverk, och incidentteamet vill se alla de andra."
        ]),
        injects: [
          inj("i3-1", 180, "authLog", "siem", "critical", "confirmed", [
            "Four provider accounts with domain administrator rights signed in through the VPN from {{asset.attackerIp}} in the last hour, after the agent was blocked.",
            "Fyra leverantörskonton med domänadministratörsrättigheter loggade in via VPN från {{asset.attackerIp}} under den senaste timmen, efter att agenten blockerades."
          ], { headline: ["Provider admin accounts in use", "Leverantörens administratörskonton används"], reveals: ["hf-admins"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c3-blast", type: "blast",
          title: L(["How the provider's access reaches you", "Hur leverantörens åtkomst når er"]),
          data: () => ({
            center: { label: "{{supplier.msp}}", status: "compromised" },
            rings: [
              { label: L(["Provider tools", "Leverantörens verktyg"]), nodes: [{ label: L(["Remote-management agent", "Fjärrförvaltningsagent"]), status: "compromised" }, { label: L(["Provider VPN", "Leverantörens VPN"]), status: "compromised" }] },
              { label: L(["Your identity", "Er identitet"]), nodes: [{ label: L(["Provider admin accounts", "Leverantörens administratörskonton"]), status: "compromised" }, { label: "{{asset.domainController}}", status: "unknown" }] },
              { label: L(["Your machines", "Era datorer"]), nodes: [{ label: L(["Protected by EDR", "Skyddade av EDR"]), status: "degraded" }, { label: L(["Without EDR", "Utan EDR"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("How do you disable the provider's accounts — and with which account?", "Hur spärrar ni leverantörens konton – och med vilket konto?", ["itOps", "socLead"]),
            q("What can a domain administrator do in an hour?", "Vad kan en domänadministratör göra på en timme?", ["ciso", "socLead"]),
            q("Did blocking only the agent leave this door open?", "Lämnade blockeringen av enbart agenten den här dörren öppen?", ["itOps"], "d1")
          ],
          executive: [
            q("Who authorises locking out your provider entirely?", "Vem godkänner att leverantören stängs ute helt?", ["cio", "ceo"]),
            q("Does the provider's VPN access have to go too?", "Måste även leverantörens VPN-åtkomst bort?", ["cio", "ciso"]),
            q("Does the independent help you chose have authority to act?", "Har den oberoende hjälp ni valde mandat att agera?", ["cio"], "d2")
          ]
        },
        challenges: [ch("Your own team may not have an account powerful enough to disable the provider's.", "Ert eget team har kanske inget konto som är tillräckligt kraftfullt för att spärra leverantörens.")],
        decision: dec("d3", "cio", ["How do you shut the provider out?", "Hur stänger ni ute leverantören?"], [
          ["Cut the provider's VPN at the firewall and disable all provider accounts.", "Stäng leverantörens VPN i brandväggen och spärra alla leverantörskonton."],
          ["Disable only the four accounts seen in use.", "Spärra bara de fyra konton som setts användas."],
          ["Change the provider accounts' passwords.", "Byt lösenord på leverantörens konton."]
        ], {
          knowns: [["Provider admin accounts are active from an attacker address.", "Leverantörens administratörskonton är aktiva från en angriparadress."]],
          uncertainties: [["Whether other provider paths exist.", "Om det finns andra vägar via leverantören."]],
          tradeoffs: {
            operational: ["Full lockout ends all provider-run services.", "En fullständig utestängning avslutar alla tjänster som leverantören driver."],
            security: ["Partial action leaves the provider's other accounts usable.", "En delvis åtgärd låter leverantörens andra konton gå att använda."],
            legal: ["Locking out a contracted provider needs a clear basis.", "Att stänga ute en avtalad leverantör kräver ett tydligt underlag."],
            reputational: ["Every hour the attackers stay is a risk.", "Varje timme angriparna stannar är en risk."]
          },
          evaluation: [["Removes all provider trust paths at once", "Tar bort alla förtroendevägar via leverantören på en gång"]],
          pushback: {
            A: [
              pb(["What runs under those accounts?", "Vad körs under de kontona?"], ["Some provider accounts are also used to run scheduled jobs and services, and nobody in-house knows which. Disabling all of them tonight may stop things you will only notice in the morning. Do you do it blind?", "En del av leverantörens konton används också för att köra schemalagda jobb och tjänster, och ingen internt vet vilka. Att spärra alla i kväll kan stoppa saker som ni märker först i morgon. Gör ni det i blindo?"]),
              pb(["Locking out with what?", "Stänga ute med vad?"], ["To disable domain administrators, you need a domain administrator. The response firm asks which account your team will use. Are you sure it is not one the attackers also hold?", "För att spärra domänadministratörer behöver ni en domänadministratör. Incidentfirman frågar vilket konto ert team ska använda. Är ni säkra på att det inte är ett som angriparna också har?"]),
              pb(["On what basis?", "På vilken grund?"], ["Legal asks for the basis on which you are locking a contracted provider out of everything, without notice. They want a written decision signed by someone with the authority to end the provider's services. Who signs it tonight?", "Juristerna frågar på vilken grund ni stänger ute en avtalad leverantör från allt, utan förvarning. De vill ha ett skriftligt beslut, undertecknat av någon med mandat att avsluta leverantörens tjänster. Vem skriver under i kväll?"])
            ],
            B: [
              pb(["A fifth account", "Ett femte konto"], ["Twenty minutes after you disable the four, a different provider account signs in from the same address. How many rounds of this are you prepared to play, one account at a time?", "Tjugo minuter efter att ni spärrat de fyra loggar ett annat leverantörskonto in från samma adress. Hur många varv av det här är ni beredda att köra, ett konto i taget?"]),
              pb(["The response firm objects", "Incidentfirman invänder"], ["The response firm warns that a partial lockout tells the attackers you have seen them, without stopping them. They recommend all or nothing. Do you overrule the experts you just brought in?", "Incidentfirman varnar för att en delvis utestängning visar angriparna att ni har sett dem, utan att stoppa dem. De rekommenderar allt eller inget. Kör ni över experterna ni just tog in?"]),
              pb(["The VPN is still open", "VPN:et är fortfarande öppet"], ["The provider's VPN still accepts connections, and the attackers came in through it. With four accounts disabled, they need only one other. Is closing the door you saw enough while the gate stays open?", "Leverantörens VPN tar fortfarande emot anslutningar, och angriparna kom in den vägen. Med fyra konton spärrade behöver de bara ett annat. Räcker det att stänga dörren ni såg när grinden står öppen?"])
            ],
            C: [
              pb(["They can change it back", "De kan byta tillbaka"], ["A domain administrator can reset any password, including their own. If the attackers still have a session open, the new password lasts only as long as they allow. Is this really locking them out?", "En domänadministratör kan återställa vilket lösenord som helst, även sitt eget. Om angriparna fortfarande har en session öppen gäller det nya lösenordet bara så länge de tillåter. Stänger ni verkligen ute dem?"]),
              pb(["Where do the new ones go?", "Var hamnar de nya?"], ["Until tonight, every provider password lived in the provider's own systems, and the provider is breached. Where will you keep the new ones, and who in-house can open that place?", "Fram till i kväll fanns varje leverantörslösenord i leverantörens egna system, och leverantören har drabbats av ett intrång. Var ska ni förvara de nya, och vem internt kan komma åt dem?"]),
              pb(["Advised against, in writing", "Avrått, skriftligt"], ["The response firm asks why you chose the option that leaves the provider's accounts enabled. They want it in writing that they advised against it. What will you write in reply?", "Incidentfirman frågar varför ni valde det alternativ som låter leverantörens konton vara aktiva. De vill ha skriftligt att de avrådde. Vad skriver ni i svaret?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The provider shut out", "Leverantören utestängd"], [
              io(["Sign-ins stop", "Inloggningarna upphör"], ["No provider account signs in during the hours after the lockout. The attacker address disappears from the logs, and the room breathes out.", "Inget leverantörskonto loggar in under timmarna efter utestängningen. Angriparadressen försvinner ur loggarna, och rummet andas ut."], ["No provider account signed in during the hours after the lockout.", "Inget leverantörskonto loggade in under timmarna efter utestängningen."]),
              io(["A job stops", "Ett jobb stannar"], ["A nightly export that sends orders to a partner stops: it ran under one of the disabled provider accounts. The partner is already asking where tonight's file is.", "En nattlig export som skickar order till en partner stannar: den kördes under ett av de spärrade leverantörskontona. Partnern frågar redan var kvällens fil är."], ["A nightly export job running under a provider account stopped.", "Ett nattligt exportjobb som kördes under ett leverantörskonto stannade."], { reopen: true }),
              io(["A private call", "Ett privat samtal"], ["A provider engineer calls one of your IT staff privately, asking why their access is blocked. They sound genuinely worried, but cannot say what is happening at their end.", "En tekniker hos leverantören ringer privat till en av era IT-medarbetare och frågar varför deras åtkomst är blockerad. Hen låter uppriktigt orolig, men kan inte säga vad som händer på deras sida."], ["A provider engineer called privately, asking why access was blocked.", "En tekniker hos leverantören ringde privat och frågade varför åtkomsten blockerats."])
            ]),
            ir("i2", { notChosen: "A" }, ["The VPN stays open", "VPN:et står öppet"], [
              io(["A new session", "En ny session"], ["The SIEM shows a new VPN session from the attacker's address, on a provider service account you had not touched. The door you left open is being used.", "SIEM visar en ny VPN-session från angriparens adress, på ett tjänstekonto hos leverantören som ni inte hade rört. Dörren ni lämnade öppen används."], ["A new provider VPN session appeared from the attacker's address.", "En ny VPN-session för leverantören dök upp från angriparens adress."], { reopen: true }),
              io(["Nothing breaks", "Inget går sönder"], ["Overnight, every provider-run service keeps working. Those who argued against a full lockout point out that nothing broke.", "Under natten fortsätter alla tjänster som leverantören driver att fungera. De som argumenterade mot en full utestängning påpekar att inget gick sönder."], ["No provider-run service broke after the partial measures.", "Ingen tjänst som leverantören driver gick sönder efter de delvisa åtgärderna."]),
              io(["A password changes again", "Ett lösenord byts igen"], ["The log shows that one provider account's password was reset again, by a session nobody can place. Your team, the response firm, or someone else?", "Loggen visar att lösenordet för ett leverantörskonto återställdes igen, av en session som ingen kan placera. Ert team, incidentfirman eller någon annan?"], ["One provider account's password was reset again by an unidentified session.", "Lösenordet för ett leverantörskonto återställdes igen av en oidentifierad session."])
            ])
          ]
        }),
        facilitator: fac(
          ["The scale of delegated trust becomes visible.", "Omfattningen av det delegerade förtroendet blir synlig."],
          ["Provider VPN and all provider accounts disabled.", "Leverantörens VPN och alla leverantörskonton spärrade."],
          [["Ask: which account will you use to disable theirs?", "Fråga: vilket konto ska ni använda för att spärra deras?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["What the contract says", "Vad avtalet säger"]),
        twist: L(["Your contract has no incident clauses — and the provider's lawyers forbid its staff from sharing anything.", "Ert avtal saknar incidentklausuler – och leverantörens advokater förbjuder personalen att dela någonting."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because every provider account was disabled, the backup jobs that ran under them failed overnight.", sv: "Eftersom varje leverantörskonto stängdes av misslyckades de säkerhetskopieringsjobb som kördes med dem under natten." } }
        ],
        assumptionChallenged: L(["Our provider is obliged to help us in an incident.", "Vår leverantör är skyldig att hjälpa oss vid en incident."]),
        narrative: L([
          "{{time.T+300|clock}}. The provider finally answers, but not the technicians you know by name. The reply comes from its lawyers.\n\nYour team needs answers quickly: what did the attackers do, what do they have, what should you look for? Someone pulls out the contract with the provider to see what you can demand.",
          "Klockan {{time.T+300|clock}}. Leverantören svarar till slut, men inte de tekniker ni känner vid namn. Svaret kommer från deras jurister.\n\nErt team behöver svar snabbt: vad gjorde angriparna, vad har de, vad ska ni leta efter? Någon tar fram avtalet med leverantören för att se vad ni kan kräva."
        ]),
        injects: [
          inj("i4-1", 300, "email", "supplier", "high", "confirmed", [
            "The provider's counsel: “Our client is investigating a security event. Staff are instructed not to share details with customers. Please direct all questions to this office.”",
            "Leverantörens ombud: ”Vår klient utreder en säkerhetshändelse. Personalen har instruerats att inte dela detaljer med kunder. Rikta alla frågor till den här byrån.”"
          ], { tests: ["lo3"] }),
          inj("i4-2", 320, "executiveMessage", "person.legal", "medium", "confirmed", [
            "“The contract covers availability and price, nothing about security incidents, notification or cooperation. We can't force them to tell us anything quickly.”",
            "”Avtalet täcker tillgänglighet och pris, ingenting om säkerhetsincidenter, underrättelse eller samarbete. Vi kan inte tvinga dem att berätta något snabbt.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What can you learn without the provider's cooperation?", "Vad kan ni ta reda på utan leverantörens medverkan?", ["socLead"]),
            q("Which indicators can you get from other customers or {{reg.csirt}}?", "Vilka indikatorer kan ni få från andra kunder eller {{reg.csirt}}?", ["socLead", "ciso"]),
            q("Is the provider fully locked out now?", "Är leverantören helt utestängd nu?", ["itOps"], "d3")
          ],
          executive: [
            q("How do you pressure the provider without a contract lever?", "Hur sätter ni press på leverantören utan avtal att luta er mot?", ["ceo", "legal"]),
            q("Do you go public about the provider's silence?", "Går ni ut offentligt med att leverantören tiger?", ["comms", "ceo"]),
            q("Has your outside help got what it needs to act?", "Har er externa hjälp det den behöver för att agera?", ["cio"], "d2")
          ]
        },
        challenges: [ch("The people who know your network best have been told not to talk to you.", "De som känner ert nätverk bäst har fått order att inte prata med er.")],
        decision: dec("d4", "ceo", ["How do you deal with the provider's silence?", "Hur hanterar ni leverantörens tystnad?"], [
          ["Work with {{reg.csirt}} and other customers to share information, and escalate formally to the provider's board.", "Samarbeta med {{reg.csirt}} och andra kunder för att dela information och eskalera formellt till leverantörens styrelse."],
          ["Threaten legal action unless they cooperate.", "Hota med rättsliga åtgärder om de inte samarbetar."],
          ["Accept it and rely on your own response.", "Acceptera det och lita på er egen hantering."]
        ], {
          knowns: [["The contract has no incident clauses.", "Avtalet saknar incidentklausuler."]],
          uncertainties: [["What the provider knows.", "Vad leverantören vet."]],
          tradeoffs: {
            operational: ["Shared information speeds your response.", "Delad information påskyndar er hantering."],
            security: ["Indicators from other victims fill your gaps.", "Indikatorer från andra drabbade fyller era luckor."],
            legal: ["Threats without contract rights are weak.", "Hot utan avtalsmässiga rättigheter är svaga."],
            reputational: ["Public pressure can backfire on everyone.", "Offentlig press kan slå tillbaka mot alla."]
          },
          evaluation: [["Finds information through other channels", "Hittar information via andra kanaler"]],
          pushback: {
            A: [
              pb(["Sharing your weak spots", "Att dela sina svagheter"], ["Sharing with other customers means sharing your own indicators and gaps, with organisations that may later be on the other side of a claim. What do you hold back, and does holding back make you a bad partner?", "Att dela med andra kunder innebär att dela era egna indikatorer och brister, med organisationer som senare kan stå på andra sidan i en tvist. Vad håller ni inne med, och gör det er till en sämre partner?"]),
              pb(["The board answers via lawyers", "Styrelsen svarar via jurister"], ["Your formal escalation to the provider's board is answered by the same law firm, in the same words. Do you keep escalating, or stop spending hours on a door that will not open?", "Er formella eskalering till leverantörens styrelse besvaras av samma advokatbyrå, med samma ord. Fortsätter ni eskalera, eller slutar ni lägga timmar på en dörr som inte går upp?"]),
              pb(["“You are breaching confidentiality”", "”Ni bryter sekretessen”"], ["The provider's counsel writes that sharing details of their incident with other customers may breach confidentiality, and that they reserve their rights. Do you keep sharing, and what exactly?", "Leverantörens ombud skriver att det kan bryta mot sekretessen att dela detaljer om deras incident med andra kunder, och att de förbehåller sig sina rättigheter. Fortsätter ni dela, och i så fall vad?"])
            ],
            B: [
              pb(["A threat with nothing behind it", "Ett hot utan något bakom"], ["Your own lawyer reminds you that the contract covers availability and price, nothing more. The provider's counsel has read the same contract. What happens to your credibility when they call the bluff?", "Er egen jurist påminner om att avtalet täcker tillgänglighet och pris, inget mer. Leverantörens ombud har läst samma avtal. Vad händer med er trovärdighet när de syner bluffen?"]),
              pb(["The last channel closes", "Den sista kanalen stängs"], ["After your threat, the one technician who had been quietly answering your team's messages stops replying. Was the threat worth losing the only informal source you had?", "Efter ert hot slutar den enda tekniker som i tysthet svarat på ert teams meddelanden att svara. Var hotet värt att förlora den enda informella källa ni hade?"]),
              pb(["Other customers ask you to wait", "Andra kunder ber er vänta"], ["Other affected customers ask you not to go legal yet: it makes the provider defensive towards everyone, just when they need its information. Do you hold back for the group, or press on alone?", "Andra drabbade kunder ber er att inte gå rättsvägen än: det gör leverantören defensiv mot alla, precis när alla behöver dess information. Avvaktar ni för gruppens skull, eller fortsätter ni ensamma?"])
            ],
            C: [
              pb(["Investigating half the picture", "Utreda halva bilden"], ["The response firm says it cannot scope the attack without knowing what happened at the provider. Without that, every conclusion it draws is a guess. Is accepting the silence the same as accepting a guess?", "Incidentfirman säger att den inte kan avgränsa angreppet utan att veta vad som hände hos leverantören. Utan det är varje slutsats en gissning. Är det att acceptera tystnaden detsamma som att acceptera en gissning?"]),
              pb(["“We just accept it?”", "”Vi bara accepterar det?”"], ["A board member asks why you accept silence from a provider you pay to run your entire IT. “The contract has no lever” is your answer. Will the board accept that answer as easily as you did?", "En styrelseledamot frågar varför ni accepterar tystnad från en leverantör ni betalar för att driva hela er IT. ”Avtalet ger oss inget att luta oss mot” är ert svar. Kommer styrelsen att acceptera det svaret lika lätt som ni gjorde?"]),
              pb(["Others are already talking", "Andra pratar redan"], ["In the security forums, other customers are already swapping what they have found. You are not part of it, because you chose to rely on your own response. If they find something that matters to you, how will you hear?", "I säkerhetsforumen utbyter andra kunder redan det de har hittat. Ni är inte med, eftersom ni valde att lita på er egen hantering. Om de hittar något som rör er, hur får ni veta det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Sharing with others", "Att dela med andra"], [
              io(["The indicators match", "Indikatorerna stämmer"], ["Indicators shared by other customers match the attacker address in your own logs. For the first time, you can see the outline of the whole attack.", "Indikatorer som andra kunder delat stämmer med angriparadressen i era egna loggar. För första gången ser ni konturerna av hela angreppet."], ["Other customers' indicators matched the attacker address you saw.", "Andra kunders indikatorer stämde med angriparadressen ni såg."]),
              io(["A formal reservation", "Ett formellt förbehåll"], ["The provider's counsel sends a formal letter: by sharing details of their incident you may be breaching confidentiality, and they reserve their rights. Legal wants you to stop until they have read it.", "Leverantörens ombud skickar ett formellt brev: genom att dela detaljer om deras incident kan ni bryta mot sekretessen, och de förbehåller sig sina rättigheter. Juristerna vill att ni slutar tills de har läst det."], ["The provider's counsel formally reserved its rights over your sharing.", "Leverantörens ombud förbehöll sig formellt sina rättigheter angående er delning."], { reopen: true }),
              io(["A board member calls", "En styrelseledamot ringer"], ["A member of the provider's board calls your CEO informally. They are sympathetic and say they are pushing internally, but promise nothing.", "En ledamot i leverantörens styrelse ringer er vd informellt. Hen är förstående och säger sig driva frågan internt, men lovar ingenting."], ["A provider board member called informally but promised nothing.", "En styrelseledamot hos leverantören ringde informellt men lovade ingenting."])
            ]),
            ir("i2", { notChosen: "A" }, ["Going it alone", "På egen hand"], [
              io(["A group without you", "En grupp utan er"], ["Other affected customers have formed a sharing group with {{reg.csirt}}. You hear about it second-hand, and it has been meeting since morning.", "Andra drabbade kunder har bildat en grupp för informationsdelning med {{reg.csirt}}. Ni hör talas om den i andra hand, och den har träffats sedan i morse."], ["Other customers formed a sharing group you are not part of.", "Andra kunder bildade en delningsgrupp som ni inte är med i."], { reopen: true }),
              io(["“In due course”", "”I sinom tid”"], ["The provider's counsel replies with one paragraph: an update will follow “in due course”. It is an answer, of sorts.", "Leverantörens ombud svarar med ett enda stycke: en uppdatering kommer ”i sinom tid”. Det är ett svar, på sitt sätt."], ["The provider promised an update “in due course”.", "Leverantören utlovade en uppdatering ”i sinom tid”."]),
              io(["Your own mapping works", "Er egen kartläggning fungerar"], ["Your response firm maps the attacker's sign-ins across your network without any outside help. Some in the room say you do not need anyone else.", "Er incidentfirma kartlägger angriparens inloggningar i ert nätverk utan någon hjälp utifrån. Några i rummet säger att ni inte behöver någon annan."], ["Your response firm mapped the attacker's sign-ins without outside help.", "Er incidentfirma kartlade angriparens inloggningar utan hjälp utifrån."])
            ])
          ]
        }),
        facilitator: fac(
          ["Contracts written for good days fail on bad ones.", "Avtal som skrivs för goda dagar fungerar inte på dåliga."],
          ["Information sharing through the national CSIRT and peers, and formal escalation.", "Informationsdelning via den nationella CSIRT-enheten och andra drabbade, och formell eskalering."],
          [["Ask: what would you put in the next contract?", "Fråga: vad skulle ni skriva in i nästa avtal?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 600,
        title: L(["No keys at home", "Inga nycklar hemma"]),
        twist: L(["Nobody in-house has privileged access. Every administrator password lives at the provider.", "Ingen internt har privilegierad åtkomst. Alla administratörslösenord finns hos leverantören."]),
        twistKind: "impact",
        assumptionChallenged: L(["We can always take control of our own systems.", "Vi kan alltid ta kontroll över våra egna system."]),
        reveals: ["hf-noaccess"],
        narrative: L([
          "{{time.T+600|clock}}. The incident response team is ready to start the clean-up: removing the provider's accounts, resetting passwords and checking the firewall.\n\nThey ask for a domain administrator account to work with. The two people on your own IT team look at each other.",
          "Klockan {{time.T+600|clock}}. Incidentteamet är redo att börja städa: ta bort leverantörens konton, byta lösenord och kontrollera brandväggen.\n\nDe ber om ett domänadministratörskonto att arbeta med. De två personerna i ert eget IT-team tittar på varandra."
        ]),
        injects: [
          inj("i5-1", 600, "chat", "person.itOps", "critical", "confirmed", [
            "“We don't have one. Every admin password, the firewall login and the backup console are in the provider's password vault. We have normal user accounts.”",
            "”Vi har inget. Alla administratörslösenord, brandväggsinloggningen och backupkonsolen finns i leverantörens lösenordsvalv. Vi har vanliga användarkonton.”"
          ], { reveals: ["hf-noaccess"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you regain administrative control without the provider?", "Hur återtar ni den administrativa kontrollen utan leverantören?", ["itOps", "socLead"]),
            q("Can you trust any account the provider ever touched?", "Kan ni lita på något konto som leverantören någonsin har rört?", ["ciso"]),
            q("Did disabling provider accounts lock you out too?", "Stängde ni även ute er själva när ni spärrade leverantörens konton?", ["itOps"], "d3")
          ],
          executive: [
            q("Who owns your network, in practice?", "Vem äger i praktiken ert nätverk?", ["ceo", "cio"]),
            q("Do you authorise a forced recovery of admin access?", "Godkänner ni en forcerad återställning av administratörsåtkomsten?", ["cio", "ceo"]),
            q("Did relying on your own response leave you able to act?", "Gjorde beslutet att lita på er egen hantering att ni kunde agera?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Recovering admin access may itself break systems the provider configured.", "Att återställa administratörsåtkomsten kan i sig slå ut system som leverantören har konfigurerat.")],
        decision: dec("d5", "cio", ["How do you regain control?", "Hur återtar ni kontrollen?"], [
          ["Recover administrative access through documented break-glass procedures with the response firm, and create new in-house admin accounts.", "Återställ den administrativa åtkomsten via dokumenterade nödrutiner tillsammans med incidentresponsföretaget, och skapa nya interna administratörskonton."],
          ["Ask the provider's lawyers for the passwords.", "Be leverantörens advokater om lösenorden."],
          ["Rebuild the directory from scratch.", "Bygg upp katalogtjänsten från grunden."]
        ], {
          knowns: [["You hold no privileged credentials.", "Ni har inga privilegierade inloggningsuppgifter."]],
          uncertainties: [["Whether recovery breaks provider-built configurations.", "Om återställningen slår ut konfigurationer som leverantören har byggt."]],
          tradeoffs: {
            operational: ["Recovery takes skilled hands on a holiday.", "Återställningen kräver kunnig personal under en helg."],
            security: ["Passwords from the provider's vault may be in attacker hands.", "Lösenord från leverantörens valv kan finnas hos angriparen."],
            legal: ["Forced recovery may breach the provider's support terms.", "En forcerad återställning kan bryta mot leverantörens supportvillkor."],
            reputational: ["Owning your own keys is basic governance.", "Att äga sina egna nycklar är grundläggande styrning."]
          },
          evaluation: [["Re-establishes independent administrative control", "Återupprättar egen administrativ kontroll"]],
          pushback: {
            A: [
              pb(["The key to the server room", "Nyckeln till serverrummet"], ["The recovery procedure needs someone at the domain controller's console in person. The server room key and alarm code are held by the provider's technicians. On a holiday, who gets you through that door?", "Återställningsrutinen kräver att någon står vid domänkontrollantens konsol på plats. Nyckeln till serverrummet och larmkoden finns hos leverantörens tekniker. Vem tar er genom den dörren under en helgdag?"]),
              pb(["The firewall resets to zero", "Brandväggen nollställs"], ["Recovering the firewall without its password means a factory reset. The provider configured it, and nobody in-house knows what its rules were. Do you reset it and rebuild from guesswork, or leave it under the provider's password?", "Att återta brandväggen utan lösenordet innebär en fabriksåterställning. Leverantören konfigurerade den, och ingen internt vet vilka regler den hade. Nollställer ni och bygger om på gissningar, eller låter ni den vara kvar under leverantörens lösenord?"]),
              pb(["Two people hold everything", "Två personer håller allt"], ["The new admin accounts will belong to your two IT staff, and one of them is on leave next week. Do you give domain administrator rights to the response firm meanwhile, an outsider holding your keys again?", "De nya administratörskontona kommer att tillhöra era två IT-medarbetare, och en av dem är ledig nästa vecka. Ger ni domänadministratörsrättigheter till incidentfirman under tiden, och låter en utomstående hålla era nycklar igen?"])
            ],
            B: [
              pb(["Passwords from a breached vault", "Lösenord ur ett hackat valv"], ["Even if the lawyers hand them over, the passwords come from a vault at a provider that has been breached. The attackers may have the same list. Would you dare to use them?", "Även om juristerna lämnar ut dem kommer lösenorden från ett valv hos en leverantör som har drabbats av ett intrång. Angriparna kan ha samma lista. Skulle ni våga använda dem?"]),
              pb(["“In the coming days”", "”Under de kommande dagarna”"], ["The provider's counsel replies that they will consider your request once their own investigation allows, “in the coming days”. You are waiting for permission to enter your own house. How long do you wait?", "Leverantörens ombud svarar att de kommer att överväga er begäran när deras egen utredning tillåter, ”under de kommande dagarna”. Ni väntar på tillstånd att gå in i ert eget hus. Hur länge väntar ni?"]),
              pb(["Sign for everything", "Skriv under på allt"], ["The counsel agrees to release the passwords if you sign that you accept responsibility for anything done with them, from any date. Do you sign for what the attackers may already have done?", "Ombudet går med på att lämna ut lösenorden om ni skriver under på att ni tar ansvar för allt som görs med dem, oavsett datum. Skriver ni under på det angriparna redan kan ha gjort?"])
            ],
            C: [
              pb(["Every user, every machine", "Varje användare, varje dator"], ["A new directory means rejoining {{num.hosts}} machines and recreating every account, group and permission. Your team is two people and a response firm on holiday rates. How many weeks is “from scratch”, and what runs meanwhile?", "En ny katalogtjänst innebär att {{num.hosts}} datorer ska anslutas på nytt och att varje konto, grupp och behörighet ska skapas igen. Ert team är två personer och en incidentfirma på helgtaxa. Hur många veckor är ”från grunden”, och vad fungerar under tiden?"]),
              pb(["The day after the holiday", "Dagen efter helgen"], ["The service owner asks what staff will find when they come back after the holiday: a network where nothing logs in? Which services can you promise for the first working day?", "Tjänsteägaren frågar vad personalen möter när de kommer tillbaka efter helgen: ett nätverk där ingenting går att logga in i? Vilka tjänster kan ni lova till den första arbetsdagen?"]),
              pb(["You still need the old keys", "Ni behöver ändå de gamla nycklarna"], ["To move file shares, mailboxes and permissions across to the new directory, you need administrator rights in the old one. A rebuild does not avoid the problem, it postpones it. So how do you get those rights?", "För att flytta filytor, brevlådor och behörigheter till den nya katalogtjänsten behöver ni administratörsrättigheter i den gamla. En ombyggnad undviker inte problemet, den skjuter upp det. Hur får ni då de rättigheterna?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Taking the keys back", "Att ta tillbaka nycklarna"], [
              io(["Admin access restored", "Administratörsåtkomst återställd"], ["Within hours, the response firm and your team recover domain administrator access and create two new in-house admin accounts. The clean-up can finally start.", "Inom några timmar återtar incidentfirman och ert team domänadministratörsåtkomsten och skapar två nya interna administratörskonton. Saneringen kan äntligen börja."], ["Two new in-house domain administrator accounts now exist.", "Två nya interna domänadministratörskonton finns nu."]),
              io(["The procedure is out of reach", "Rutinen går inte att nå"], ["The break-glass procedure turns out to be documented only in the provider's portal, which is down. The response firm can try without it, but warns it may break things.", "Nödrutinen visar sig bara vara dokumenterad i leverantörens portal, som ligger nere. Incidentfirman kan försöka utan den, men varnar för att något kan gå sönder."], ["The documented recovery procedure was stored in the provider's portal.", "Den dokumenterade återställningsrutinen fanns i leverantörens portal."], { reopen: true }),
              io(["An account nobody knows", "Ett konto som ingen känner"], ["During recovery the response firm finds an administrator account nobody recognises. It may be an old provider account, or something else. They disable it and keep going.", "Under återställningen hittar incidentfirman ett administratörskonto som ingen känner igen. Det kan vara ett gammalt leverantörskonto, eller något annat. De spärrar det och fortsätter."], ["An unrecognised administrator account was found and disabled.", "Ett okänt administratörskonto hittades och spärrades."])
            ]),
            ir("i2", { notChosen: "A" }, ["Still without keys", "Fortfarande utan nycklar"], [
              io(["Evening, still no access", "Kväll, fortfarande ingen åtkomst"], ["By evening nobody in-house has administrator access yet. The response firm is waiting, at holiday rates, with nothing it can do.", "På kvällen har fortfarande ingen internt administratörsåtkomst. Incidentfirman väntar, till helgtaxa, utan att kunna göra något."], ["Hours later, nobody in-house yet had administrator access.", "Flera timmar senare hade ännu ingen internt administratörsåtkomst."], { reopen: true }),
              io(["An encrypted file", "En krypterad fil"], ["The provider's counsel sends an encrypted file said to contain the passwords, but not the key to open it. They will send that “once internal approval is given”.", "Leverantörens ombud skickar en krypterad fil som sägs innehålla lösenorden, men inte nyckeln för att öppna den. Den ska komma ”när det interna godkännandet är klart”."], ["The provider's counsel sent an encrypted password file without its key.", "Leverantörens ombud skickade en krypterad lösenordsfil utan nyckel."]),
              io(["The firm backs you", "Firman stöttar er"], ["The response firm says your approach is defensible: anything from a breached vault would have needed replacing anyway. The room takes it as a sign it was right.", "Incidentfirman säger att ert sätt går att försvara: allt från ett hackat valv hade ändå behövt bytas. Rummet tar det som ett tecken på att det var rätt."], ["The response firm called your approach defensible given the breached vault.", "Incidentfirman kallade ert sätt försvarbart med tanke på det hackade valvet."])
            ])
          ]
        }),
        facilitator: fac(
          ["Many organisations discover this exact gap. Let it land.", "Många organisationer upptäcker precis den här bristen. Låt den sjunka in."],
          ["Independent admin access re-established without relying on the provider's vault.", "Egen administratörsåtkomst återupprättad utan att förlita sig på leverantörens valv."],
          [["Ask: where are your break-glass credentials today?", "Fråga: var finns era nödinloggningar i dag?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 1440,
        title: L(["The machines EDR could not see", "Datorerna som EDR inte såg"]),
        twist: L(["On {{num.unprotected}} machines without your EDR, ransomware is staged and timed for tonight.", "På {{num.unprotected}} datorer utan ert EDR finns ransomware utplacerad, inställd att utlösas i natt."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "Ransomware is staged on machines your EDR could not see. Was shutting the provider out complete enough to stop tonight's timer?", sv: "Utpressningsprogram är utplacerat på datorer som ert EDR inte kunde se. Var utestängningen av leverantören tillräckligt fullständig för att stoppa nattens timer?" } },
        assumptionChallenged: L(["EDR blocked the script everywhere that matters.", "EDR blockerade skriptet överallt där det spelar roll."]),
        reveals: ["hf-timed"],
        narrative: L([
          "The holiday itself, {{time.T+1440|clock}}. The provider is locked out and the visible machines look clean. Some in the room want to go home.\n\nThe response team keeps going. They have inventoried machines your EDR does not cover: old servers, kiosks and lab systems nobody thinks about. What they find there has a deadline.",
          "Själva helgdagen, klockan {{time.T+1440|clock}}. Leverantören är utelåst och de synliga datorerna ser rena ut. En del i rummet vill gå hem.\n\nIncidentteamet fortsätter. De har inventerat datorer som ert EDR inte täcker: gamla servrar, kiosker och labbsystem som ingen tänker på. Det de hittar där har en tidsgräns."
        ]),
        injects: [
          inj("i6-1", 1440, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "{{num.unprotected}} machines — older servers, a few kiosks and lab systems — never had your EDR. On them, the script staged ransomware as a scheduled task set to run at 02:00 tonight.",
            "{{num.unprotected}} datorer – äldre servrar, några kiosker och labbsystem – har aldrig haft ert EDR. På dem placerade skriptet ut ransomware som en schemalagd aktivitet som ska köras klockan 02 i natt."
          ], { reveals: ["hf-timed"], tests: ["lo1"] })
        ],
        charts: [{
          id: "c6-coverage", type: "donut",
          title: L(["EDR coverage of machines with the provider's agent", "EDR-täckning för datorer med leverantörens agent"]),
          data: (ctx) => ({ segments: [
            { id: "covered", label: L(["Covered by EDR", "Täckta av EDR"]), value: ctx.vars.hosts - ctx.vars.unprotected },
            { id: "uncovered", label: L(["Not covered", "Inte täckta"]), value: ctx.vars.unprotected }
          ] })
        }],
        questions: {
          technical: [
            q("Can you remove the scheduled tasks before 02:00 on machines you barely manage?", "Kan ni ta bort de schemalagda aktiviteterna före klockan 02 på datorer ni knappt förvaltar?", ["itOps"]),
            q("Should those machines simply be switched off tonight?", "Ska de datorerna helt enkelt stängas av i natt?", ["itOps", "serviceOwner"]),
            q("Did your regained admin access arrive in time to act?", "Kom er återtagna administratörsåtkomst i tid för att kunna agera?", ["itOps"], "d5")
          ],
          executive: [
            q("Which of these machines does the business need tomorrow?", "Vilka av de här datorerna behöver verksamheten i morgon?", ["serviceOwner", "ceo"]),
            q("Who decides to power off systems nobody fully owns?", "Vem beslutar att stänga av system som ingen fullt ut äger?", ["cio"]),
            q("Did your provider lockout cut the attackers off before they staged this?", "Stängde utestängningen av leverantören ute angriparna innan de placerade ut det här?", ["cio"], "d3")
          ]
        },
        challenges: [ch("Some of these machines run lab and kiosk systems nobody has documented.", "En del av de här datorerna kör labb- och kiosksystem som ingen har dokumenterat.")],
        decision: dec("d6", "cio", ["How do you defuse the timed ransomware?", "Hur desarmerar ni den tidsinställda ransomwaren?"], [
          ["Power off all uncovered machines before 02:00, then clean them one by one.", "Stäng av alla datorer utan skydd före klockan 02 och rensa dem sedan en och en."],
          ["Delete the scheduled tasks remotely tonight; powering off {{num.unprotected}} machines would stop the night shift.", "Radera de schemalagda aktiviteterna på distans i natt; att stänga av {{num.unprotected}} datorer skulle stoppa nattskiftet."],
          ["Isolate them from the network and let them run.", "Isolera dem från nätverket och låt dem gå."]
        ], {
          knowns: [["Ransomware triggers at 02:00 on uncovered machines.", "Ransomware utlöses klockan 02 på datorer utan skydd."]],
          uncertainties: [["Which systems the business needs tomorrow.", "Vilka system verksamheten behöver i morgon."]],
          tradeoffs: {
            operational: ["Powering off stops lab and kiosk services.", "Att stänga av stoppar labb- och kiosktjänster."],
            security: ["Remote deletion may miss some.", "Radering på distans kan missa några."],
            legal: ["Unknown systems may hold data you must protect.", "Okända system kan innehålla data som ni måste skydda."],
            reputational: ["A second wave tonight would undo the weekend's work.", "En andra våg i natt skulle göra helgens arbete om intet."]
          },
          evaluation: [["Uses certainty (power off) over hope", "Väljer visshet (avstängning) framför hopp"]],
          pushback: {
            A: [
              pb(["The night shift needs them", "Nattskiftet behöver dem"], ["The service owner refuses: some of these machines run tonight's night shift, and powering them off stops work that customers are waiting for. Who overrules them, and who tells the shift?", "Tjänsteägaren vägrar: en del av de här datorerna kör nattens skift, och att stänga av dem stoppar arbete som kunderna väntar på. Vem kör över hen, och vem talar om det för skiftet?"]),
              pb(["Machines nobody can reach", "Datorer ingen kommer åt"], ["Some of the {{num.unprotected}} machines are in locked labs and at other sites, and powering them off means someone going there in person. You do not have that many people before the deadline. Which ones do you leave on?", "En del av de {{num.unprotected}} datorerna står i låsta labb och på andra platser, och att stänga av dem kräver att någon åker dit. Ni har inte så många personer före tidsgränsen. Vilka låter ni stå på?"]),
              pb(["Off is not clean", "Avstängd är inte ren"], ["The response firm points out that the scheduled task stays on the disk and may run as soon as a machine is switched back on. Anyone who powers one up tomorrow could start it. How do you stop people turning them on?", "Incidentfirman påpekar att den schemalagda aktiviteten ligger kvar på disken och kan köras så fort en dator startas igen. Den som slår på en av dem i morgon kan sätta i gång den. Hur hindrar ni folk från att starta dem?"])
            ],
            B: [
              pb(["A second name", "Ett andra namn"], ["On a few machines, the response firm finds the task under a different name from the one you are deleting. A remote clean-up built on one name will miss those. How sure must you be before you leave them running through the night?", "På några datorer hittar incidentfirman aktiviteten under ett annat namn än det ni raderar. En rensning på distans byggd på ett namn missar dem. Hur säkra måste ni vara innan ni låter dem gå hela natten?"]),
              pb(["Machines that do not answer", "Datorer som inte svarar"], ["Several machines do not respond to remote commands tonight: asleep, offline or simply unknown. They will come back at some point, with the task still in place. Do you power those off after all, or trust they stay down?", "Flera datorer svarar inte på fjärrkommandon i kväll: i viloläge, frånkopplade eller helt enkelt okända. De kommer tillbaka någon gång, med aktiviteten kvar. Stänger ni av dem ändå, eller litar ni på att de förblir nere?"]),
              pb(["No guarantee", "Ingen garanti"], ["The response firm will not guarantee the remote clean-up. If one machine is missed, the night shift stops anyway, with encryption on top. Is avoiding a planned stop worth risking an unplanned one?", "Incidentfirman vill inte garantera rensningen på distans. Missas en enda dator stannar nattskiftet ändå, och dessutom med kryptering. Är det värt att undvika ett planerat stopp om priset är risken för ett oplanerat?"])
            ],
            C: [
              pb(["Isolated still encrypts", "Isolerad krypterar ändå"], ["Isolation stops the spread, but at the trigger every machine still encrypts itself, including lab and kiosk data that may have no backup. Are you prepared to lose what is on them?", "Isoleringen stoppar spridningen, men när den löser ut krypterar varje dator ändå sig själv, även labb- och kioskdata som kanske saknar säkerhetskopia. Är ni beredda att förlora det som finns på dem?"]),
              pb(["Is the isolation complete?", "Är isoleringen fullständig?"], ["Some of these machines have wireless cards or their own mobile connections, and nobody is sure which. The network team cannot confirm every one is cut off. How do you verify it before the deadline?", "En del av de här datorerna har trådlösa kort eller egna mobilanslutningar, och ingen vet säkert vilka. Nätverksteamet kan inte bekräfta att varenda en är avskuren. Hur kontrollerar ni det före tidsgränsen?"]),
              pb(["Neither working nor safe", "Varken i drift eller säkra"], ["The kiosks and lab systems need the network to do their jobs, so isolated they are useless anyway. You have stopped the service and kept the ransomware. Who explains that choice to the business tomorrow?", "Kioskerna och labbsystemen behöver nätverket för att göra sitt jobb, så isolerade är de oanvändbara ändå. Ni har stoppat tjänsten och behållit ransomwaren. Vem förklarar det valet för verksamheten i morgon?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Machines powered off", "Datorerna avstängda"], [
              io(["Two o'clock passes", "Klockan två passerar"], ["The deadline passes with every uncovered machine on the list switched off. The console is silent, and the room starts talking about going home.", "Tidsgränsen passerar med alla oskyddade datorer på listan avstängda. Konsolen är tyst, och rummet börjar prata om att gå hem."], ["The deadline passed with the listed uncovered machines powered off.", "Tidsgränsen passerade med de listade oskyddade datorerna avstängda."]),
              io(["The night shift stops", "Nattskiftet stannar"], ["The night shift stops as the machines go dark, and the shift lead calls: customer orders will be late. The service owner asks to bring a few machines back on.", "Nattskiftet stannar när datorerna släcks, och skiftledaren ringer: kundorder kommer att bli försenade. Tjänsteägaren ber att få starta några datorer igen."], ["The night shift stopped when the uncovered machines went dark.", "Nattskiftet stannade när de oskyddade datorerna släcktes."], { reopen: true, meters: { trust: -1 } }),
              io(["One machine missing", "En dator saknas"], ["The count comes up one short: a machine on the list cannot be found. It may have been scrapped years ago, or be sitting somewhere, switched on.", "Räkningen går inte ihop: en dator på listan går inte att hitta. Den kan ha skrotats för flera år sedan, eller stå någonstans, påslagen."], ["One uncovered machine on the list could not be located.", "En oskyddad dator på listan gick inte att hitta."])
            ]),
            ir("i2", { notChosen: "A" }, ["Machines left on", "Datorerna är kvar på"], [
              io(["A task still scheduled", "En aktivitet ligger kvar"], ["Shortly before the deadline, the response firm finds a machine where the task is still scheduled. If there is one, there may be more.", "Strax före tidsgränsen hittar incidentfirman en dator där aktiviteten fortfarande är schemalagd. Finns det en kan det finnas fler."], ["A machine with the task still scheduled was found close to the deadline.", "En dator med aktiviteten fortfarande schemalagd hittades nära tidsgränsen."], { reopen: true }),
              io(["Clean-up reports success", "Rensningen lyckas"], ["The remote clean-up reports success on every machine that answered. The night shift keeps working, and the plan looks vindicated.", "Rensningen på distans rapporterar att den lyckats på varje dator som svarade. Nattskiftet fortsätter arbeta, och planen ser ut att ha varit rätt."], ["Remote clean-up reported success on every machine that answered.", "Rensningen på distans rapporterade framgång på varje dator som svarade."]),
              io(["A kiosk reboots", "En kiosk startar om"], ["A kiosk restarts itself for an update shortly before the deadline. Nobody can tell whether it came back with the task removed or still in place.", "En kiosk startar om sig själv för en uppdatering strax före tidsgränsen. Ingen kan säga om den kom tillbaka med aktiviteten borttagen eller kvar."], ["A kiosk rebooted itself shortly before the deadline.", "En kiosk startade om sig själv strax före tidsgränsen."])
            ])
          ]
        }),
        facilitator: fac(
          ["The asset-inventory lesson.", "Lärdomen om förteckning över tillgångar."],
          ["Uncovered machines powered off before the trigger and cleaned individually.", "Datorer utan skydd avstängda före utlösningen och rensade en och en."],
          [["Ask: how did these machines fall outside your EDR?", "Fråga: hur hamnade de här datorerna utanför ert EDR?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 2880,
        title: L(["One of {{num.mspCustomers}}", "En av {{num.mspCustomers}}"]),
        twist: L(["{{reg.csirt|cap}} now coordinates all {{num.mspCustomers}} affected customers — your response is part of a larger one.", "{{reg.csirt|cap}} samordnar nu alla {{num.mspCustomers}} drabbade kunder – er hantering är en del av en större."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d6", option: "A" }, narrativeAppend: { en: "Because {{num.unprotected}} machines were powered off before 02:00, the warehouse label printers and two production PCs stayed down all morning.", sv: "Eftersom {{num.unprotected}} datorer stängdes av före 02.00 var lagrets etikettskrivare och två produktionsdatorer nere hela förmiddagen." } }
        ],
        assumptionChallenged: L(["We manage our incident on our own.", "Vi hanterar vår incident på egen hand."]),
        narrative: L([
          "Two days later. {{reg.csirt|cap}} hosts a coordination call that brings together dozens of the provider's customers, from small offices to large companies.\n\nEveryone is dealing with the same attack, at different stages and with different levels of help. What you do now affects the others, and what they do affects you.",
          "Två dagar senare. {{reg.csirt|cap}} håller ett samordningsmöte som samlar dussintals av leverantörens kunder, från små kontor till stora företag.\n\nAlla hanterar samma angrepp, i olika skeden och med olika mycket hjälp. Det ni gör nu påverkar de andra, och det de gör påverkar er."
        ]),
        injects: [
          inj("i7-1", 2880, "advisory", "csirt", "high", "confirmed", [
            "{{reg.csirt|cap}} asks all customers of {{supplier.msp}} to share indicators, avoid restoring provider access until a joint assessment is complete, and coordinate public statements.",
            "{{reg.csirt|cap}} ber alla kunder hos {{supplier.msp}} att dela indikatorer, avstå från att återställa leverantörens åtkomst tills en gemensam bedömning är klar och samordna offentliga uttalanden."
          ], { tests: ["lo4"] }),
          inj("i7-2", 2910, "mediaEnquiry", "media", "medium", "confirmed", [
            "A trade journalist: “Several of the provider's customers have been hit. Is your organisation one of them?”",
            "En journalist på en branschtidning: ”Flera av leverantörens kunder har drabbats. Är er organisation en av dem?”"
          ], { optional: true, pressure: "media", tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What will you share with other customers, and what not?", "Vad delar ni med andra kunder, och vad inte?", ["socLead", "ciso"]),
            q("What can you learn from others who are further ahead?", "Vad kan ni lära er av andra som har kommit längre?", ["socLead"]),
            q("Did your lockout of the provider match what others did?", "Stämde er utestängning av leverantören med vad andra gjorde?", ["itOps"], "d3")
          ],
          executive: [
            q("Do you coordinate your public statement with the group?", "Samordnar ni ert offentliga uttalande med gruppen?", ["comms", "ceo"]),
            q("Do you pursue claims against the provider together with others?", "Driver ni krav mot leverantören tillsammans med andra?", ["legal", "ceo"]),
            q("Did your approach to the provider's silence put you in a good position now?", "Gav ert sätt att hantera leverantörens tystnad er en bra position nu?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Coordinated statements are slower than your board wants.", "Samordnade uttalanden går långsammare än er styrelse vill.")],
        decision: dec("d7", "ceo", ["How do you take part in the joint response?", "Hur deltar ni i den gemensamma hanteringen?"], [
          ["Share indicators openly, coordinate statements and pursue joint claims.", "Dela indikatorer öppet, samordna uttalanden och driv gemensamma krav."],
          ["Share selectively and handle claims alone.", "Dela selektivt och hantera kraven på egen hand."],
          ["Stay out of the joint response and keep your two-person team on your own recovery.", "Stå utanför den gemensamma hanteringen och låt ert tvåpersonsteam fokusera på er egen återställning."]
        ], {
          knowns: [["Many organisations face the same attacker.", "Många organisationer möter samma angripare."]],
          uncertainties: [["Whether the provider will survive the incident.", "Om leverantören klarar sig genom incidenten."]],
          tradeoffs: {
            operational: ["Coordination costs time.", "Samordning tar tid."],
            security: ["Shared indicators protect everyone, including you.", "Delade indikatorer skyddar alla, även er."],
            legal: ["Joint claims carry more weight.", "Gemensamma krav väger tyngre."],
            reputational: ["A united message avoids blame games.", "Ett gemensamt budskap undviker skuldbeläggning."]
          },
          evaluation: [["Contributes to the collective defence", "Bidrar till det gemensamma försvaret"]],
          pushback: {
            A: [
              pb(["The journalist will not wait", "Journalisten väntar inte"], ["The joint statement will not be agreed until next week. The trade journalist publishes tomorrow, with or without you. Do you keep to the group's pace and say nothing, or break ranks?", "Det gemensamma uttalandet blir inte klart förrän nästa vecka. Branschjournalisten publicerar i morgon, med eller utan er. Håller ni gruppens takt och säger ingenting, eller bryter ni leden?"]),
              pb(["Your gaps on the table", "Era brister på bordet"], ["Sharing indicators openly also shows the machines your EDR never covered and how long you lacked admin access. Your lawyer warns the same material could be used in claims against you. Do you share it unedited?", "Att dela indikatorer öppet visar också vilka datorer ert EDR aldrig täckte och hur länge ni saknade administratörsåtkomst. Er jurist varnar för att samma material kan användas i krav mot er. Delar ni det oredigerat?"]),
              pb(["Bound to the group's pace", "Bundna till gruppens takt"], ["A joint claim moves at the speed of the slowest member and its lawyers. Your insurer wants your own claim filed within its deadline. Which comes first, and what if they conflict?", "Ett gemensamt krav går i samma takt som den långsammaste medlemmen och dess jurister. Ert försäkringsbolag vill att ert eget anspråk lämnas in inom dess tidsfrist. Vad går först, och vad händer om de krockar?"])
            ],
            B: [
              pb(["Taking more than you give", "Ta mer än man ger"], ["Other customers notice that you take more indicators than you share. {{reg.csirt|cap}} asks why yours arrived late and incomplete. How long will the group keep sharing with you?", "Andra kunder märker att ni tar emot fler indikatorer än ni delar. {{reg.csirt|cap}} frågar varför era kom sent och ofullständiga. Hur länge fortsätter gruppen att dela med er?"]),
              pb(["A small claim alone", "Ett litet krav ensamt"], ["Your lawyer points out that alone you are one small customer among {{num.mspCustomers}}. The provider will settle with the group first, and on its terms. Is handling the claim alone worth being last in line?", "Er jurist påpekar att ni ensamma är en liten kund bland {{num.mspCustomers}}. Leverantören kommer att göra upp med gruppen först, och på sina villkor. Är det värt att stå sist i kön för att hantera kravet själva?"]),
              pb(["In or out?", "Med eller inte?"], ["The trade journalist asks whether you are part of the joint response. A selective answer sounds like a selective partner. What do you say, and does it match what you told the group?", "Branschjournalisten frågar om ni är med i den gemensamma hanteringen. Ett selektivt svar låter som en selektiv partner. Vad säger ni, och stämmer det med vad ni sa till gruppen?"])
            ],
            C: [
              pb(["A list you are not on", "En lista ni inte står på"], ["The group's shared list of indicators grows every day, and you are not on the distribution. If someone finds something that matters to your network, how will you hear about it?", "Gruppens gemensamma lista över indikatorer växer varje dag, och ni står inte på sändlistan. Om någon hittar något som rör ert nätverk, hur får ni veta det?"]),
              pb(["{{reg.csirt|cap}} calls", "{{reg.csirt|cap}} ringer"], ["{{reg.csirt|cap}} calls to ask why you are not taking part. They are coordinating {{num.mspCustomers}} customers, and those who stay away stand out. What do you tell them?", "{{reg.csirt|cap}} ringer och frågar varför ni inte deltar. De samordnar {{num.mspCustomers}} kunder, och de som håller sig utanför sticker ut. Vad säger ni till dem?"]),
              pb(["“No comment” stands out", "”Inga kommentarer” sticker ut"], ["Several customers have confirmed to the journalist, together, that they were affected. Your “no comment” is now the line that stands out in the article. Is staying out still the quiet option?", "Flera kunder har tillsammans bekräftat för journalisten att de drabbades. Ert ”inga kommentarer” är nu raden som sticker ut i artikeln. Är det fortfarande det tysta alternativet att stå utanför?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Inside the joint response", "Med i den gemensamma hanteringen"], [
              io(["Your indicators help", "Era indikatorer hjälper"], ["Another customer uses your shared indicators to find staged ransomware on machines they had missed. {{reg.csirt|cap}} thanks you on the next call.", "En annan kund använder era delade indikatorer för att hitta utplacerad ransomware på datorer de hade missat. {{reg.csirt|cap}} tackar er på nästa möte."], ["Another customer found staged ransomware using your shared indicators.", "En annan kund hittade utplacerad ransomware med hjälp av era delade indikatorer."]),
              io(["The article runs first", "Artikeln kommer först"], ["The trade article is published before the joint statement is agreed. Your organisation is named as affected, with no comment from you. The board asks whether to break ranks.", "Branschartikeln publiceras innan det gemensamma uttalandet är klart. Er organisation nämns som drabbad, utan någon kommentar från er. Styrelsen frågar om ni ska bryta leden."], ["A trade article ran before the joint statement was ready.", "En branschartikel publicerades innan det gemensamma uttalandet var klart."], { reopen: true, meters: { media: 1 } }),
              io(["An offer to the group", "Ett erbjudande till gruppen"], ["The provider offers the group a settlement, on the condition that nobody speaks publicly about the incident. Some members want to accept at once.", "Leverantören erbjuder gruppen en uppgörelse, på villkor att ingen uttalar sig offentligt om incidenten. Några medlemmar vill tacka ja direkt."], ["The provider offered the group a settlement in exchange for silence.", "Leverantören erbjöd gruppen en uppgörelse i utbyte mot tystnad."])
            ]),
            ir("i2", { notChosen: "A" }, ["At arm's length", "På armlängds avstånd"], [
              io(["The group settles first", "Gruppen gör upp först"], ["The other customers agree preliminary terms with the provider without you. Your lawyer says you can still join, but on the terms already set.", "De andra kunderna kommer överens om preliminära villkor med leverantören utan er. Er jurist säger att ni fortfarande kan ansluta, men på redan satta villkor."], ["The group agreed preliminary terms with the provider without you.", "Gruppen kom överens om preliminära villkor med leverantören utan er."], { reopen: true }),
              io(["{{reg.csirt|cap}} takes note", "{{reg.csirt|cap}} noterar"], ["{{reg.csirt|cap}} notes in its summary that your organisation took only a limited part in the joint response. The summary goes to every participant.", "{{reg.csirt|cap}} noterar i sin sammanfattning att er organisation bara deltog i begränsad omfattning i den gemensamma hanteringen. Sammanfattningen går till alla deltagare."], ["{{reg.csirt|cap}} noted your organisation's limited participation.", "{{reg.csirt|cap}} noterade er organisations begränsade deltagande."], { meters: { regulator: 1 } }),
              io(["Your recovery is ahead", "Er återställning ligger före"], ["Freed from group meetings, your two-person team finishes its own recovery faster than most in the group. Some take it as proof that going alone was right.", "Utan gruppmöten blir ert tvåpersonsteam klart med sin egen återställning snabbare än de flesta i gruppen. En del ser det som ett bevis på att det var rätt att gå sin egen väg."], ["Your own recovery moved faster than most in the group.", "Er egen återställning gick snabbare än för de flesta i gruppen."])
            ])
          ]
        }),
        facilitator: fac(
          ["Collective defence. Authority is shared with a coordinating body.", "Gemensamt försvar. Mandatet delas med en samordnande myndighet."],
          ["Open indicator sharing, coordinated communication and joint follow-up.", "Öppen delning av indikatorer, samordnad kommunikation och gemensam uppföljning."],
          [["Ask: what did you learn from another customer that helped you?", "Fråga: vad lärde ni er av en annan kund som hjälpte er?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 7200,
        title: L(["Independence takes time", "Oberoende tar tid"]),
        twist: L(["A new provider takes {{num.newMspMonths}} months to procure — and your two-person IT team cannot run everything meanwhile.", "En ny leverantör tar {{num.newMspMonths}} månader att upphandla – och ert IT-team på två personer kan inte driva allt under tiden."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "{{reg.csirt|cap}} now coordinates {{num.mspCustomers}} customers. How you dealt with the provider's silence decides whether you are a partner in this, or a plaintiff.", sv: "{{reg.csirt|cap}} samordnar nu {{num.mspCustomers}} kunder. Hur ni hanterade leverantörens tystnad avgör om ni är en partner i det här, eller en motpart." } },
        assumptionChallenged: L(["We can switch providers quickly.", "Vi kan snabbt byta leverantör."]),
        narrative: L([
          "Five days later. The immediate crisis is over: the timed ransomware never ran, and the provider is locked out.\n\nThe board asks the question nobody has had time for: what happens now? You depended on one provider for everything, and it is not obvious that you can do without one.",
          "Fem dagar senare. Den akuta krisen är över: den tidsinställda ransomwaren kördes aldrig, och leverantören är utelåst.\n\nStyrelsen ställer frågan som ingen har hunnit med: vad händer nu? Ni var beroende av en enda leverantör för allt, och det är inte självklart att ni klarar er utan en."
        ]),
        injects: [
          inj("i8-1", 7200, "email", "person.supplierManager", "medium", "confirmed", [
            "“A tender for a new provider takes {{num.newMspMonths}} months. Meanwhile we either return to the old provider under new terms, or hire temporary staff we cannot easily find.”",
            "”En upphandling av en ny leverantör tar {{num.newMspMonths}} månader. Under tiden går vi antingen tillbaka till den gamla leverantören på nya villkor, eller anlitar tillfällig personal som är svår att hitta.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What must always stay in-house: break-glass accounts, firewall, backups?", "Vad måste alltid stanna internt: nödkonton, brandvägg, säkerhetskopior?", ["cio", "ciso"]),
            q("How should any provider's access be limited in the future?", "Hur ska en leverantörs åtkomst begränsas i framtiden?", ["ciso", "itOps"]),
            q("What would you have needed in place to regain control in an hour?", "Vad hade ni behövt ha på plats för att återta kontrollen på en timme?", ["itOps"], "d5")
          ],
          executive: [
            q("Do you return to the provider under new terms, or leave?", "Går ni tillbaka till leverantören på nya villkor, eller lämnar ni?", ["ceo", "supplierManager"]),
            q("Which clauses must every future IT contract contain?", "Vilka klausuler måste varje framtida IT-avtal innehålla?", ["legal", "supplierManager"]),
            q("Do your joint claims with other customers affect this choice?", "Påverkar era gemensamma krav med andra kunder det här valet?", ["legal"], "d7")
          ]
        },
        challenges: [ch("The provider offers a discount to stay; leaving has no quick alternative.", "Leverantören erbjuder rabatt för att ni ska stanna; att lämna har inget snabbt alternativ.")],
        decision: dec("d8", "ceo", ["What is your provider strategy?", "Vilken är er leverantörsstrategi?"], [
          ["Stay temporarily under new security and incident terms, keep keys in-house and plan a managed exit.", "Stanna tillfälligt på nya villkor för säkerhet och incidenter, behåll nycklarna internt och planera en ordnad avveckling."],
          ["Leave immediately and cope with interim staff.", "Lämna omedelbart och klara er med tillfällig personal."],
          ["Stay with the provider and take the discount they offer, while your two-person team rebuilds its own skills.", "Stanna hos leverantören och ta rabatten de erbjuder, medan ert tvåpersonsteam bygger upp sin egen kompetens."]
        ], {
          knowns: [["The provider is the only realistic short-term option.", "Leverantören är det enda realistiska alternativet på kort sikt."]],
          uncertainties: [["Whether the provider has truly fixed its security.", "Om leverantören verkligen har åtgärdat sin säkerhet."]],
          tradeoffs: {
            operational: ["Leaving overnight is not feasible for a small team.", "Att lämna över en natt är inte möjligt för ett litet team."],
            security: ["Keeping keys in-house limits any future provider failure.", "Att behålla nycklarna internt begränsar varje framtida leverantörsfel."],
            legal: ["New terms are only possible while you still have leverage.", "Nya villkor är bara möjliga medan ni fortfarande har förhandlingsläge."],
            reputational: ["Staying for a discount looks careless.", "Att stanna för en rabatt ser vårdslöst ut."]
          },
          evaluation: [["Keeps administrative control in-house whatever the provider", "Behåller den administrativa kontrollen internt oavsett leverantör"]],
          pushback: {
            A: [
              pb(["“Not our standard terms”", "”Inte våra standardvillkor”"], ["The provider agrees you can stay, but rejects your incident and notification clauses as “not standard”. Without them, staying temporarily looks like staying as before. Do you stay anyway?", "Leverantören går med på att ni stannar, men avvisar era klausuler om incidenter och underrättelse som ”inte standard”. Utan dem ser en tillfällig fortsättning ut som en fortsättning som förut. Stannar ni ändå?"]),
              pb(["Keys need keepers", "Nycklar behöver väktare"], ["Keeping the keys in-house means your two IT staff are on call for every admin task, every night and every holiday. The holiday is exactly when this started. Who covers the next one?", "Att behålla nycklarna internt innebär att era två IT-medarbetare har jour för varje administratörsuppgift, varje natt och varje helg. Det var precis en helg som det här började. Vem täcker nästa?"]),
              pb(["A provider you are leaving", "En leverantör ni lämnar"], ["The provider learns of your exit plan. Their best technicians are moved to customers who are staying. How good will the service be from a provider that knows you are on your way out?", "Leverantören får veta om er avvecklingsplan. Deras bästa tekniker flyttas till kunder som stannar. Hur bra blir servicen från en leverantör som vet att ni är på väg ut?"])
            ],
            B: [
              pb(["Interim staff are not there", "Tillfällig personal finns inte"], ["Your supplier manager reports that the first available interim administrators can start in several weeks. Until then your two people run everything the provider did. What do you stop doing in the meantime?", "Er leverantörsansvarige meddelar att de första tillgängliga tillfälliga administratörerna kan börja om flera veckor. Fram till dess driver era två personer allt som leverantören gjorde. Vad slutar ni göra under tiden?"]),
              pb(["A thin handover", "En tunn överlämning"], ["Leaving immediately, you get only what the contract requires the provider to hand over, which is very little. Documentation, configurations and some licences are in the provider's name. What will you be missing on day one?", "Lämnar ni omedelbart får ni bara det som avtalet kräver att leverantören lämnar över, och det är mycket lite. Dokumentation, konfigurationer och en del licenser står på leverantören. Vad kommer ni att sakna dag ett?"]),
              pb(["Fees for leaving", "Avgifter för att lämna"], ["The provider's counsel points to the early termination fees in the contract. Your lawyer cannot find a clause that lets you leave because of a security failure. Do you pay to leave, or fight it while running on interim staff?", "Leverantörens ombud hänvisar till avgifterna för förtida uppsägning i avtalet. Er jurist hittar ingen klausul som låter er lämna på grund av ett säkerhetsfel. Betalar ni för att lämna, eller tar ni striden medan ni drivs av tillfällig personal?"])
            ],
            C: [
              pb(["Renewed for a discount", "Förnyat för en rabatt"], ["An auditor reads it back to you: after an incident where the provider held every key, you stayed for a discount. How do you present that decision to the board without it sounding careless?", "En revisor läser upp det för er: efter en incident där leverantören höll alla nycklar stannade ni för en rabatt. Hur lägger ni fram det beslutet för styrelsen utan att det låter vårdslöst?"]),
              pb(["Same contract, lower price", "Samma avtal, lägre pris"], ["The discount comes with the same contract: no incident clauses, and the provider still holding the admin passwords. Apart from the price, what exactly has changed since the holiday?", "Rabatten kommer med samma avtal: inga incidentklausuler, och leverantören har fortfarande administratörslösenorden. Vad har egentligen ändrats sedan helgen, bortsett från priset?"]),
              pb(["What did they fix?", "Vad har de åtgärdat?"], ["You ask the provider what they changed to stop this happening again. Their report is “confidential”, and you get a two-line summary. Are you staying with a provider whose fix you cannot see?", "Ni frågar leverantören vad de har ändrat för att det inte ska hända igen. Deras rapport är ”konfidentiell”, och ni får en sammanfattning på två rader. Stannar ni hos en leverantör vars åtgärd ni inte kan se?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A managed exit", "En ordnad avveckling"], [
              io(["The clauses are signed", "Klausulerna skrivs under"], ["Under pressure from the customer group, the provider accepts your incident and notification clauses for the interim period. It looks like a clean win.", "Under tryck från kundgruppen godtar leverantören era klausuler om incidenter och underrättelse för övergångsperioden. Det ser ut som en klar seger."], ["The provider accepted incident and notification clauses for the interim.", "Leverantören godtog klausuler om incidenter och underrättelse för övergångsperioden."]),
              io(["The clauses are rejected", "Klausulerna avvisas"], ["The provider rejects your incident clauses as “not our standard terms”. Without them, staying looks much like staying as before.", "Leverantören avvisar era incidentklausuler som ”inte våra standardvillkor”. Utan dem ser en fortsättning ut ungefär som en fortsättning som förut."], ["The provider rejected your incident clauses in the first round.", "Leverantören avvisade era incidentklausuler i första omgången."], { reopen: true }),
              io(["Familiar faces leave", "Kända ansikten slutar"], ["Two provider technicians who knew your network well resign. The provider says it is unrelated; your team wonders who will answer next time.", "Två tekniker hos leverantören som kände ert nätverk väl säger upp sig. Leverantören säger att det inte har med saken att göra; ert team undrar vem som svarar nästa gång."], ["Two provider technicians who knew your network have resigned.", "Två tekniker hos leverantören som kände ert nätverk har sagt upp sig."])
            ]),
            ir("i2", { notChosen: "A" }, ["Who holds the keys?", "Vem har nycklarna?"], [
              io(["The chair objects", "Ordföranden invänder"], ["The board chair asks for a plan that keeps administrative keys in-house, whatever the provider. Your strategy does not say that clearly enough.", "Styrelseordföranden begär en plan där de administrativa nycklarna stannar internt, oavsett leverantör. Er strategi säger inte det tillräckligt tydligt."], ["The board chair asked for keys to stay in-house, whatever the provider.", "Styrelseordföranden begärde att nycklarna stannar internt, oavsett leverantör."], { reopen: true }),
              io(["A smooth first week", "En lugn första vecka"], ["The first week under the new arrangement passes without incident. Those who backed it say the worry was overdone.", "Den första veckan med det nya upplägget går utan incidenter. De som stödde det säger att oron var överdriven."], ["The first week under the new arrangement passed without incident.", "Den första veckan med det nya upplägget gick utan incidenter."]),
              io(["The auditor asks", "Revisorn frågar"], ["Your auditor asks a simple question for the annual report: who holds your administrative keys today, and where are they kept?", "Er revisor ställer en enkel fråga inför årsredovisningen: vem har era administrativa nycklar i dag, och var förvaras de?"], ["Your auditor has asked who holds administrative keys today.", "Er revisor har frågat vem som har de administrativa nycklarna i dag."], { meters: { regulator: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Close on governance and ownership of your own keys.", "Avsluta med styrning och ägarskap över de egna nycklarna."],
          ["In-house control of privileged access, incident clauses and a managed exit plan.", "Intern kontroll över privilegierad åtkomst, incidentklausuler och en ordnad avvecklingsplan."],
          [["Ask: if this provider vanished tomorrow, what would you lose?", "Fråga: om den här leverantören försvann i morgon, vad skulle ni förlora?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The timed ransomware is defused and the network cleaned. Administrative control is back in-house, the provider remains under new terms for now, and joint claims with other customers continue.",
        "Den tidsinställda ransomwaren är desarmerad och nätverket sanerat. Den administrativa kontrollen är tillbaka internt, leverantören är kvar tills vidare på nya villkor och de gemensamma kraven med andra kunder fortsätter."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Your provider's tools and accounts are your attack surface.", "Er leverantörs verktyg och konton är er angreppsyta."]),
        L(["Always keep independent, break-glass administrative access in-house.", "Behåll alltid egen administrativ nödåtkomst internt."]),
        L(["Contracts need incident, notification and cooperation clauses.", "Avtal behöver klausuler om incidenter, underrättelse och samarbete."]),
        L(["Coverage gaps — machines without EDR — decide the outcome.", "Luckor i täckningen – datorer utan EDR – avgör utfallet."])
      ],
      assumptionsVsReality: [
        avr(["An attack on us.", "Ett angrepp mot oss."], ["An attack through our provider.", "Ett angrepp via vår leverantör."], "p2"),
        avr(["Blocking the agent is enough.", "Det räcker att blockera agenten."], ["Provider admin accounts were used.", "Leverantörens administratörskonton användes."], "p3"),
        avr(["We can always take control.", "Vi kan alltid ta kontroll."], ["Nobody in-house held admin access.", "Ingen internt hade administratörsåtkomst."], "p5"),
        avr(["EDR blocked it everywhere.", "EDR blockerade det överallt."], ["Uncovered machines held timed ransomware.", "Datorer utan skydd bar på tidsinställd ransomware."], "p6")
      ],
      strengthsToLookFor: [
        L(["Cutting the provider's channel fast", "Att snabbt stänga leverantörens kanal"]),
        L(["Bringing in independent help", "Att ta in oberoende hjälp"]),
        L(["Contributing to the collective response", "Att bidra till den gemensamma hanteringen"])
      ],
      commonGaps: [
        L(["Waiting for the provider", "Att vänta på leverantören"]),
        L(["No break-glass access", "Ingen nödåtkomst"]),
        L(["Unknown machines outside EDR", "Okända datorer utanför EDR"])
      ],
      suggestedActions: [
        act(["Create and test in-house break-glass admin accounts stored offline.", "Skapa och testa interna nödkonton för administration som förvaras frånkopplat."], "cio", "high"),
        act(["Limit provider access to named, time-bound, monitored accounts.", "Begränsa leverantörens åtkomst till namngivna, tidsbegränsade och bevakade konton."], "ciso", "high"),
        act(["Add incident, notification and cooperation clauses to IT contracts.", "Lägg till klausuler om incidenter, underrättelse och samarbete i IT-avtalen."], "supplierManager", "high"),
        act(["Close EDR coverage gaps and keep a complete asset inventory.", "Täpp till luckorna i EDR-täckningen och för en fullständig förteckning över tillgångar."], "itOps", "medium"),
        act(["Agree holiday on-call arrangements for security incidents.", "Kom överens om jourberedskap för säkerhetsincidenter under helger."], "incidentCommander", "medium")
      ]
    }
  });
})();
