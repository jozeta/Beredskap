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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Contain an attack that arrives through a trusted provider", "Begränsa ett angrepp som kommer via en betrodd leverantör"]) },
      { id: "lo2", text: L(["Regain independent administrative control", "Återta egen administrativ kontroll"]) },
      { id: "lo3", text: L(["Act when contracts and providers fail you", "Agera när avtal och leverantörer sviker"]) },
      { id: "lo4", text: L(["Coordinate with other victims and national bodies", "Samordna med andra drabbade och nationella myndigheter"]) }
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
          "{{time.T+0|day}}, {{time.T+0|clock}}. Most staff have left for the holiday. The {{env.edr}} console lights up: the remote-management agent from {{supplier.msp}} is running a script called “maintenance” on {{num.hosts}} machines.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. De flesta har gått hem inför helgen. {{env.edr}}-konsolen lyser upp: fjärrförvaltningsagenten från {{supplier.msp}} kör ett skript som heter ”maintenance” på {{num.hosts}} datorer."
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
          evaluation: [["Cuts the hostile channel without waiting for the provider", "Stänger den fientliga kanalen utan att vänta på leverantören"]]
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
        assumptionChallenged: L(["This is an attack on our organisation.", "Det här är ett angrepp mot vår organisation."]),
        reveals: ["hf-msp"],
        narrative: L([
          "{{time.T+60|clock}}. The provider's support line goes to voicemail, its status page is down, and the account manager's mobile is off.",
          "Klockan {{time.T+60|clock}}. Leverantörens supportnummer går till röstbrevlådan, statussidan ligger nere och kundansvarigs mobil är avstängd."
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
          evaluation: [["Brings in independent help quickly", "Tar snabbt in oberoende hjälp"]]
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
        assumptionChallenged: L(["Blocking the agent removed the attackers' access.", "Att blockera agenten tog bort angriparnas åtkomst."]),
        reveals: ["hf-admins"],
        narrative: L([
          "{{time.T+180|clock}}. The incident response firm is connected remotely and looks at your directory.",
          "Klockan {{time.T+180|clock}}. Incidentresponsföretaget är uppkopplat på distans och tittar på er katalogtjänst."
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
          evaluation: [["Removes all provider trust paths at once", "Tar bort alla förtroendevägar via leverantören på en gång"]]
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
        assumptionChallenged: L(["Our provider is obliged to help us in an incident.", "Vår leverantör är skyldig att hjälpa oss vid en incident."]),
        narrative: L([
          "{{time.T+300|clock}}. The provider finally answers — through its lawyers.",
          "Klockan {{time.T+300|clock}}. Leverantören svarar till slut – via sina advokater."
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
          evaluation: [["Finds information through other channels", "Hittar information via andra kanaler"]]
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
          "{{time.T+600|clock}}. The incident response team asks for a domain administrator account to start the clean-up.",
          "Klockan {{time.T+600|clock}}. Incidentresponsteamet ber om ett domänadministratörskonto för att börja saneringen."
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
          evaluation: [["Re-establishes independent administrative control", "Återupprättar egen administrativ kontroll"]]
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
        assumptionChallenged: L(["EDR blocked the script everywhere that matters.", "EDR blockerade skriptet överallt där det spelar roll."]),
        reveals: ["hf-timed"],
        narrative: L([
          "The holiday itself, {{time.T+1440|clock}}. The response team has inventoried machines the EDR does not cover.",
          "Själva helgdagen, klockan {{time.T+1440|clock}}. Incidentresponsteamet har inventerat de datorer som EDR inte täcker."
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
          ["Try to delete the scheduled tasks remotely and hope it works everywhere.", "Försök radera de schemalagda aktiviteterna på distans och hoppas att det fungerar överallt."],
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
          evaluation: [["Uses certainty (power off) over hope", "Väljer visshet (avstängning) framför hopp"]]
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
        assumptionChallenged: L(["We manage our incident on our own.", "Vi hanterar vår incident på egen hand."]),
        narrative: L([
          "Two days later. A coordination call brings together dozens of the provider's customers.",
          "Två dagar senare. Ett samordningsmöte samlar dussintals av leverantörens kunder."
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
          ["Stay out; your response is done.", "Stå utanför; er hantering är klar."]
        ], {
          knowns: [["Many organisations face the same attacker.", "Många organisationer möter samma angripare."]],
          uncertainties: [["Whether the provider will survive the incident.", "Om leverantören klarar sig genom incidenten."]],
          tradeoffs: {
            operational: ["Coordination costs time.", "Samordning tar tid."],
            security: ["Shared indicators protect everyone, including you.", "Delade indikatorer skyddar alla, även er."],
            legal: ["Joint claims carry more weight.", "Gemensamma krav väger tyngre."],
            reputational: ["A united message avoids blame games.", "Ett gemensamt budskap undviker skuldbeläggning."]
          },
          evaluation: [["Contributes to the collective defence", "Bidrar till det gemensamma försvaret"]]
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
        assumptionChallenged: L(["We can switch providers quickly.", "Vi kan snabbt byta leverantör."]),
        narrative: L([
          "Five days later. The immediate crisis is over. The board asks what happens now.",
          "Fem dagar senare. Den akuta krisen är över. Styrelsen frågar vad som händer nu."
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
          ["Stay with the discount.", "Stanna för rabatten."]
        ], {
          knowns: [["The provider is the only realistic short-term option.", "Leverantören är det enda realistiska alternativet på kort sikt."]],
          uncertainties: [["Whether the provider has truly fixed its security.", "Om leverantören verkligen har åtgärdat sin säkerhet."]],
          tradeoffs: {
            operational: ["Leaving overnight is not feasible for a small team.", "Att lämna över en natt är inte möjligt för ett litet team."],
            security: ["Keeping keys in-house limits any future provider failure.", "Att behålla nycklarna internt begränsar varje framtida leverantörsfel."],
            legal: ["New terms are only possible while you still have leverage.", "Nya villkor är bara möjliga medan ni fortfarande har förhandlingsläge."],
            reputational: ["Staying for a discount looks careless.", "Att stanna för en rabatt ser vårdslöst ut."]
          },
          evaluation: [["Keeps administrative control in-house whatever the provider", "Behåller den administrativa kontrollen internt oavsett leverantör"]]
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
