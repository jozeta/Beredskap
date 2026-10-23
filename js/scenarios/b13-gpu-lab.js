/*
 * b13-gpu-lab.js — "After Hours" (branching, resource misuse).
 *
 * The lab's power draw doubles at night: a data scientist is mining
 * cryptocurrency on the GPU cluster, behind a proxy that opened a tunnel to
 * the internet. Spine: first move → jobs nobody booked → the cost → a second
 * account → the tunnel → the rumour → paying it back → the customer → the
 * team → what changes. Break-away at § "The rumour": a dismissal used as an
 * example.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b13-gpu-lab",
    version: 1,
    format: "branching",
    category: "resource-misuse",
    archetype: "ambiguous-start",
    emblem: "gpu-lab",
    title: L(["After Hours", "Efter arbetstid"]),
    summary: L([
      "The research lab's GPU cluster works hardest when nobody is in the building. A colleague has been mining cryptocurrency on it. Is it theft, a policy breach, or a security hole? It may be all three.",
      "Forskningslabbets GPU-kluster arbetar hårdast när ingen är i byggnaden. En kollega har brutit kryptovaluta på det. Är det stöld, ett policybrott eller ett säkerhetshål? Det kan vara alla tre."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Investigate misuse by a colleague fairly and with evidence", "Utreda missbruk av en kollega rättvist och med belägg"]), teaser: L(["Fair and firm", "Rättvist och bestämt"]) },
      { id: "lo2", text: L(["Find the security exposure behind a policy breach", "Hitta säkerhetsexponeringen bakom ett policybrott"]), teaser: L(["What came in with it", "Vad som följde med"]) },
      { id: "lo3", text: L(["Respond proportionately when rules were unclear", "Agera proportionerligt när reglerna var otydliga"]), teaser: L(["Rules nobody wrote down", "Regler som ingen skrev ner"]) },
      { id: "lo4", text: L(["Set clear, transparent rules for shared resources", "Sätta tydliga och öppna regler för delade resurser"]), teaser: L(["Shared things", "Delade saker"]) }
    ],
    mitre: ["T1496", "T1078", "T1572", "T1133"],
    frameworks: {
      nistCsf: ["GV.PO", "ID.AM", "PR.AA", "PR.PS", "DE.CM", "RS.AN", "RS.MI"],
      iso27001: ["A.5.10", "A.5.15", "A.5.28", "A.6.4", "A.8.6", "A.8.16", "A.8.19", "A.8.20"]
    },
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["insider"], motivation: L(["Personal gain: free computing power at night", "Personlig vinning: gratis datorkraft på nätterna"]), capability: "medium" },
    variables: {
      gpus: { min: 8, max: 128, scaleBy: "size", step: 4 },
      nights: { min: 30, max: 120 },
      cost: { min: 2000, max: 90000, scaleBy: "size", step: 500, currency: true }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "hr", "legal", "facilities", "serviceOwner", "cio"],

    flags: {
      evidenceKept: L(["Logs preserved before action", "Loggar säkrade före åtgärd"]),
      tunnelFound: L(["Tunnel found and closed", "Tunneln hittad och stängd"]),
      costDocumented: L(["Cost documented", "Kostnaden dokumenterad"]),
      lenient: L(["Settled informally", "Löst informellt"]),
      hrInvolved: L(["Formal HR process", "Formell HR-process"]),
      proportionate: L(["Both users treated proportionately", "Båda användarna behandlade proportionerligt"]),
      forensics: L(["Cluster checked forensically", "Klustret undersökt forensiskt"]),
      costRecovered: L(["Cost repaid", "Kostnaden återbetald"]),
      reported: L(["Reported to the police", "Polisanmält"]),
      monitoringAdded: L(["Transparent usage monitoring", "Öppen bevakning av användningen"])
    },

    start: "c1",
    pages: [
      pg("c1", ["The power bill", "Elräkningen"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.facilities.name}} brings a graph to the Monday meeting. The research lab's power draw has almost doubled at night over the last few months, and the cooling system has raised two overheating alarms at four in the morning.\n\nThe lab's {{num.gpus}} GPU servers are meant to be idle at night unless a long training job is booked. The booking calendar for nights is empty.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.facilities.name}} tar med ett diagram till måndagsmötet. Forskningslabbets elförbrukning har nästan fördubblats nattetid de senaste månaderna, och kylsystemet har larmat för överhettning två gånger klockan fyra på morgonen.\n\nLabbets {{num.gpus}} GPU-servrar ska stå stilla på nätterna om inte ett långt träningsjobb är bokat. Bokningskalendern för nätterna är tom."
      ], {
        injects: [
          inj("b13-1", 0, "impactReport", "facilities", "medium", "confirmed", [
            "Lab power, 22:00–07:00: average up 94 percent over three months. Cooling alarms: two, both at 04:10. Booked night jobs in the same period: none.",
            "Labbets el, 22.00–07.00: i genomsnitt upp 94 procent på tre månader. Kyllarm: två, båda 04.10. Bokade nattjobb under samma period: inga."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("What innocent explanations are there for this graph?", "Vilka oskyldiga förklaringar finns det till det här diagrammet?", ["itOps"])],
        facilitator: { notes: L(["Start low-key. It looks like an energy question; let the room decide how seriously to take it.", "Börja lågmält. Det ser ut som en energifråga; låt rummet avgöra hur allvarligt det ska tas."]) },
        choice: ask(["How do you start?", "Hur börjar ni?"], ["Looks at the cluster's own records quietly before asking anyone.", "Tittar i klustrets egna register i tysthet innan någon tillfrågas."], [
          opt(["Pull the cluster's job and login logs quietly", "Ta fram klustrets jobb- och inloggningsloggar i tysthet"], "c2", ["Facts before conversations.", "Fakta före samtal."], { set: "evidenceKept" }),
          opt(["Ask the data science team in their channel", "Fråga analysteamet i deras kanal"], "c2", ["Friendly, and whoever is doing it now knows.", "Vänligt, och den som gör det vet nu."]),
          opt(["Switch the cluster off at night from now on", "Stäng av klustret nattetid från och med nu"], "c2", ["Stops the bill. Stops legitimate long jobs too.", "Stoppar räkningen. Stoppar också legitima långa jobb."])
        ])
      }),

      pg("c2", ["Jobs nobody booked", "Jobb som ingen bokade"], [
        "The job logs tell a clear story. Every night for {{num.nights}} nights, jobs start at 01:00 under one data scientist's account and stop at 06:00. They are named “training_run”, but the program they start is a cryptocurrency miner.\n\nThe data scientist is respected, has been with the company for four years, and booked nothing at night.",
        "Jobbloggarna berättar en tydlig historia. Varje natt under {{num.nights}} nätter startar jobb klockan 01.00 under en dataanalytikers konto och stoppas 06.00. De heter ”training_run”, men programmet de startar är ett program för kryptobrytning.\n\nDataanalytikern är respekterad, har varit på företaget i fyra år och har inte bokat något nattetid."
      ], {
        variants: [vr("evidenceKept", [
          "Because the logs were pulled quietly, nobody has been tipped off. They tell a clear story: every night for {{num.nights}} nights, jobs start at 01:00 under one data scientist's account and stop at 06:00. They are named “training_run”, but the program is a cryptocurrency miner.\n\nThe data scientist is respected and has been with the company for four years.",
          "Eftersom loggarna togs fram i tysthet har ingen blivit varnad. De berättar en tydlig historia: varje natt under {{num.nights}} nätter startar jobb klockan 01.00 under en dataanalytikers konto och stoppas 06.00. De heter ”training_run”, men programmet är ett program för kryptobrytning.\n\nDataanalytikern är respekterad och har varit på företaget i fyra år."
        ], ["Because you looked quietly, the logs are intact and nobody is warned.", "Eftersom ni tittade i tysthet är loggarna intakta och ingen är varnad."])],
        injects: [
          inj("b13-2", 60, "logExcerpt", "itOps", "high", "confirmed", [
            "Scheduler: job “training_run”, 01:00–06:00 nightly, user {{person.serviceOwner.firstName|lower}}.ds, all {{num.gpus}} GPUs. Executable: /opt/tools/xmr-worker (mining software). Outbound: proxy on port 3333.",
            "Schemaläggaren: jobbet ”training_run”, 01.00–06.00 varje natt, användare {{person.serviceOwner.firstName|lower}}.ds, alla {{num.gpus}} GPU:er. Program: /opt/tools/xmr-worker (programvara för kryptobrytning). Utgående: proxy på port 3333."
          ], { tests: ["lo1", "lo2"] })
        ],
        choice: ask(["What do you do with this?", "Vad gör ni med det här?"], ["Involves HR and legal and looks at how the miner reaches the internet.", "Tar in HR och juridik och undersöker hur brytningsprogrammet når internet."], [
          opt(["Bring in HR and legal, and trace the proxy", "Ta in HR och juridik, och spåra proxyn"], "l1", ["A proper process, and a look at the security side.", "En ordentlig process, och en titt på säkerhetssidan."], { set: "hrInvolved" }),
          opt(["Kill the jobs and block the miner tonight", "Döda jobben och blockera brytningsprogrammet i natt"], "l1", ["Stops it, and leaves everything else as it was.", "Stoppar det, och lämnar allt annat som det var."]),
          opt(["Talk to the data scientist first thing tomorrow", "Prata med dataanalytikern först i morgon bitti"], "c3b", ["Human, and early.", "Mänskligt, och tidigt."])
        ])
      }),

      pg("l1", ["The pool", "Poolen"], [
        "{{person.socLead.name}} follows the miner's network traffic. It reaches a mining pool through a small proxy program installed on one of the cluster nodes, which keeps a permanent outbound tunnel open to a server abroad.\n\nThe tunnel works in both directions. Anyone who controls the far end could, in principle, reach the cluster from the internet.",
        "{{person.socLead.name}} följer brytningsprogrammets nätverkstrafik. Den når en brytningspool via ett litet proxyprogram som installerats på en av klustrets noder, och som håller en permanent utgående tunnel öppen till en server utomlands.\n\nTunneln fungerar i båda riktningarna. Den som kontrollerar andra änden skulle i princip kunna nå klustret från internet."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do about the tunnel?", "Vad gör ni med tunneln?"], ["Closes it and checks what else has used it.", "Stänger den och kontrollerar vad mer som har använt den."], [
          opt(["Close the tunnel and check everything that crossed it", "Stäng tunneln och kontrollera allt som passerat den"], "c3", ["The security half of this story.", "Säkerhetshalvan av den här historien."], { set: "tunnelFound" }),
          opt(["Block the mining pool's address only", "Blockera bara brytningspoolens adress"], "c3", ["Stops the mining. The tunnel stays.", "Stoppar brytningen. Tunneln finns kvar."])
        ])
      }),

      pg("c3", ["How much?", "Hur mycket?"], [
        "Finance and facilities put numbers on it. Electricity, extra cooling, wear on the GPUs, and three research jobs that ran slowly because the cluster was hot in the mornings.\n\nThe total is around {{num.cost|currency}}. The miner has probably earned the data scientist a small fraction of that, which is often how this kind of misuse works out.",
        "Ekonomi och fastighet sätter siffror på det. El, extra kylning, slitage på GPU:erna och tre forskningsjobb som gick långsamt eftersom klustret var varmt på morgnarna.\n\nSumman är omkring {{num.cost|currency}}. Brytningen har troligen gett dataanalytikern en liten bråkdel av det, vilket ofta är hur den här sortens missbruk slutar."
      ], {
        chart: { id: "b13-kpi", type: "kpi", title: L(["What it cost", "Vad det kostade"]), data: kpi([
          { id: "k1", label: ["Nights of mining", "Nätter av kryptobrytning"], value: (v) => v.nights, tone: "warn" },
          { id: "k2", label: ["GPUs used", "Använda GPU:er"], value: (v) => v.gpus, tone: "warn" },
          { id: "k3", label: ["Estimated cost", "Uppskattad kostnad"], value: (v) => v.cost, format: "currency", tone: "danger" }
        ]) },
        choice: ask(["How do you treat the cost?", "Hur hanterar ni kostnaden?"], ["Documents it carefully, so any later decision rests on facts.", "Dokumenterar den noggrant, så att varje senare beslut vilar på fakta."], [
          opt(["Document the cost with sources", "Dokumentera kostnaden med källor"], "c4", ["Useful for HR, for legal and for fairness.", "Användbart för HR, för juridiken och för rättvisan."], { set: "costDocumented" }),
          opt(["Use a rough estimate", "Använd en grov uppskattning"], "c4", ["Fast, and easy to dispute.", "Snabbt, och lätt att ifrågasätta."])
        ])
      }),

      pg("c3b", ["The conversation", "Samtalet"], [
        "The data scientist comes into the meeting room and understands immediately. They do not deny it. They call it “spare capacity that was going to waste”, say they meant to stop months ago, and offer to pay for the electricity.\n\nThey are embarrassed and clearly worried about their job. They also mention, without being asked, that a colleague “borrowed the script”.",
        "Dataanalytikern kommer in i mötesrummet och förstår direkt. Hen förnekar ingenting. Hen kallar det ”ledig kapacitet som annars gick till spillo”, säger att hen tänkt sluta för flera månader sedan och erbjuder sig att betala för elen.\n\nHen skäms och är tydligt orolig för sitt jobb. Hen nämner också, utan att bli tillfrågad, att en kollega ”lånade skriptet”."
      ], {
        choice: ask(["How do you respond in the room?", "Hur svarar ni i rummet?"], ["Thanks them for honesty, explains a formal process will follow, and asks about the colleague.", "Tackar för ärligheten, förklarar att en formell process följer och frågar om kollegan."], [
          opt(["Explain that a formal process will follow, fairly", "Förklara att en formell process följer, rättvist"], "c4", ["Clear, respectful and consistent.", "Tydligt, respektfullt och konsekvent."], { set: "hrInvolved" }),
          opt(["Accept the apology and the payment, and close it", "Godta ursäkten och betalningen, och avsluta det"], "c4", ["Kind, and the tunnel is still open.", "Vänligt, och tunneln är fortfarande öppen."], { set: "lenient" })
        ])
      }),

      pg("c4", ["A second account", "Ett andra konto"], [
        "The logs show a second account running the same script on weekends: an intern on a six-month placement. The data scientist shared the script with them “as a fun experiment”.\n\nThe intern is twenty-two and on their first job. The data scientist is senior. Several people in the room have opinions about who deserves what.",
        "Loggarna visar ett andra konto som kört samma skript på helgerna: en praktikant på en sexmånaders placering. Dataanalytikern delade skriptet med hen ”som ett roligt experiment”.\n\nPraktikanten är tjugotvå och på sitt första jobb. Dataanalytikern är senior. Flera i rummet har åsikter om vem som förtjänar vad."
      ], {
        discuss: [q("Does seniority change what is fair here?", "Ändrar senioritet vad som är rättvist här?", ["hr"])],
        choice: ask(["How do you treat the two?", "Hur behandlar ni de två?"], ["Treats both under the same rules, taking role and influence into account.", "Behandlar båda enligt samma regler, med hänsyn till roll och inflytande."], [
          opt(["Same rules for both, weighing who led and who followed", "Samma regler för båda, med hänsyn till vem som ledde och vem som följde"], "l2", ["Fair, and defensible to both.", "Rättvist, och försvarbart inför båda."], { set: "proportionate" }),
          opt(["End the intern's placement; keep the senior's case internal", "Avsluta praktikantens placering; håll seniorens ärende internt"], "l2", ["Easy to do, and everyone will notice.", "Lätt att göra, och alla kommer att märka det."]),
          opt(["Leave the intern out of it", "Lämna praktikanten utanför"], "l2", ["Kind, and inconsistent.", "Vänligt, och inkonsekvent."])
        ])
      }),

      pg("l2", ["The policy", "Riktlinjerna"], [
        "{{person.legal.name}} reads the acceptable-use policy. It forbids “unlawful use” of company equipment and “excessive personal use” of the internet. It says nothing about computing power, the lab, or mining.\n\nThe lab's own wiki says, in a page from three years ago, that researchers may “experiment freely” outside booked hours.",
        "{{person.legal.name}} läser riktlinjerna för tillåten användning. De förbjuder ”olaglig användning” av företagets utrustning och ”överdriven privat användning” av internet. De säger ingenting om datorkraft, labbet eller kryptobrytning.\n\nLabbets egen wiki säger, på en sida från för tre år sedan, att forskare får ”experimentera fritt” utanför bokade tider."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["How does the policy gap affect your response?", "Hur påverkar luckan i riktlinjerna ert agerande?"], ["Takes the gap into account and fixes it, rather than pretending it is not there.", "Tar hänsyn till luckan och rättar den, i stället för att låtsas att den inte finns."], [
          opt(["Weigh the gap in any sanction, and fix the policy", "Väg in luckan i en eventuell påföljd, och rätta riktlinjerna"], "c5", ["Honest and harder to challenge.", "Ärligt och svårare att ifrågasätta."]),
          opt(["Treat it as obviously wrong regardless of wording", "Behandla det som uppenbart fel oavsett formuleringen"], "c5", ["Many would agree; an employment tribunal might not.", "Många skulle hålla med; en arbetsdomstol kanske inte."])
        ])
      }),

      pg("c5", ["The tunnel", "Tunneln"], [
        "{{person.ciso.name}} has looked at the proxy program installed on the cluster node. It is an old version with a known flaw that lets anyone connect through it, and internet scanners have been trying the port for weeks.\n\nThe cluster holds customer research data for two projects. Nobody yet knows whether anyone other than the mining pool used the tunnel.",
        "{{person.ciso.name}} har tittat på proxyprogrammet som installerats på klusternoden. Det är en gammal version med en känd brist som låter vem som helst ansluta genom den, och skannrar på internet har provat porten i veckor.\n\nKlustret innehåller kunders forskningsdata för två projekt. Ingen vet ännu om någon annan än brytningspoolen har använt tunneln."
      ], {
        variants: [vr("tunnelFound", [
          "The tunnel was closed earlier. {{person.ciso.name}} has now looked at the proxy program itself: an old version with a known flaw that lets anyone connect through it. Internet scanners had been trying the port for weeks.\n\nThe cluster holds customer research data for two projects. The question is whether anyone used the tunnel before you closed it.",
          "Tunneln stängdes tidigare. {{person.ciso.name}} har nu tittat på själva proxyprogrammet: en gammal version med en känd brist som låter vem som helst ansluta genom den. Skannrar på internet hade provat porten i veckor.\n\nKlustret innehåller kunders forskningsdata för två projekt. Frågan är om någon använde tunneln innan ni stängde den."
        ], ["Because you closed the tunnel, the question is only about the past.", "Eftersom ni stängde tunneln gäller frågan bara det som redan hänt."])],
        choice: ask(["How do you treat the security question?", "Hur hanterar ni säkerhetsfrågan?"], ["Closes the tunnel if still open and checks the cluster for any other access.", "Stänger tunneln om den fortfarande är öppen och undersöker klustret efter annan åtkomst."], [
          opt(["Close it if open, and check the cluster forensically", "Stäng den om den är öppen, och undersök klustret forensiskt"], "l3", ["The only way to know about the customer data.", "Det enda sättet att få veta om kunddatan."], { set: ["tunnelFound", "forensics"] }),
          opt(["Remove the proxy and assume nothing happened", "Ta bort proxyn och anta att inget hände"], "l3", ["Probably true. You will not know.", "Troligen sant. Ni kommer inte att veta."])
        ])
      }),

      pg("l3", ["The research deadline", "Forskningsdeadline"], [
        "A customer project has missed a milestone. Its training jobs ran slowly in the mornings for weeks because the cluster was still hot and throttling after a night of mining.\n\nThe project lead had complained about “flaky performance” twice. Nobody connected it to the power graph until now.",
        "Ett kundprojekt har missat en delleverans. Dess träningsjobb gick långsamt på morgnarna i veckor eftersom klustret fortfarande var varmt och strypte prestandan efter en natt av kryptobrytning.\n\nProjektledaren hade klagat på ”ojämn prestanda” två gånger. Ingen kopplade det till eldiagrammet förrän nu."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you connect the delay to the misuse internally?", "Kopplar ni förseningen till missbruket internt?"], ["Records the business impact honestly.", "Dokumenterar påverkan på verksamheten ärligt."], [
          opt(["Record it as part of the impact", "Dokumentera det som en del av påverkan"], "c6", ["Complete picture.", "En fullständig bild."]),
          opt(["Keep it separate to avoid inflating the case", "Håll det separat för att inte blåsa upp ärendet"], "c6", ["Cautious, and incomplete.", "Försiktigt, och ofullständigt."])
        ])
      }),

      pg("c6", ["The rumour", "Ryktet"], [
        "{{time.T+2880|weekday|cap}}. The story has leaked inside the company: “someone in the lab has been mining crypto on the servers”. People are guessing names in the coffee room, and some guesses are wrong.\n\n{{person.cio.name}} wants a clear signal that this is unacceptable. {{person.hr.name}} wants a fair process that will survive scrutiny. They both want it quickly.",
        "{{time.T+2880|weekday|cap}}. Historien har läckt inom företaget: ”någon i labbet har brutit krypto på servrarna”. Folk gissar namn i fikarummet, och en del gissningar är fel.\n\n{{person.cio.name}} vill ha en tydlig signal om att det här är oacceptabelt. {{person.hr.name}} vill ha en rättvis process som håller för granskning. Båda vill att det går fort."
      ], {
        choice: ask(["What signal do you send?", "Vilken signal sänder ni?"], ["Says the matter is being handled under a fair process, without naming anyone, and corrects wrong rumours.", "Säger att ärendet hanteras i en rättvis process, utan att namnge någon, och rättar felaktiga rykten."], [
          opt(["A short internal message: it is being handled fairly, no names", "Ett kort internt meddelande: det hanteras rättvist, inga namn"], "c7", ["Calms the guessing.", "Lugnar gissningarna."]),
          opt(["Say nothing until the process is finished", "Säg ingenting förrän processen är klar"], "c7", ["The wrong guesses keep circulating.", "De felaktiga gissningarna fortsätter att cirkulera."]),
          opt(["Dismiss the data scientist today and announce it to all staff as an example", "Säg upp dataanalytikern i dag och meddela all personal det som ett exempel"], "x1", ["A strong signal. Also a legal risk.", "En stark signal. Också en juridisk risk."])
        ])
      }),

      pg("c7", ["Paying it back", "Att betala tillbaka"], [
        "The data scientist, through their union representative, offers to repay the documented cost in full and accept a written warning. They ask that it not go further.\n\n{{person.legal.name}} notes that unauthorised use of computer resources can be a crime, but also that a police case would take a year and recover nothing extra.",
        "Dataanalytikern erbjuder, via sitt fackliga ombud, att betala tillbaka hela den dokumenterade kostnaden och godta en skriftlig varning. Hen ber om att det inte går längre än så.\n\n{{person.legal.name}} påpekar att obehörig användning av datorresurser kan vara ett brott, men också att ett polisärende skulle ta ett år och inte ge något mer tillbaka."
      ], {
        choice: ask(["How do you settle it?", "Hur löser ni det?"], ["Accepts repayment and a warning if the facts support it; keeps police as an option for aggravating findings.", "Godtar återbetalning och en varning om fakta stöder det; behåller polisen som alternativ vid försvårande fynd."], [
          opt(["Accept repayment and a written warning", "Godta återbetalning och en skriftlig varning"], "l4", ["Proportionate, if the security side is clean.", "Proportionerligt, om säkerhetssidan är ren."], { set: "costRecovered" }),
          opt(["Report to the police", "Polisanmäl"], "l4", ["Principled, slow, and the relationship ends.", "Principfast, långsamt, och relationen tar slut."], { set: "reported" }),
          opt(["Dismiss them after all", "Säg upp hen ändå"], "l4", ["Possible, if the process supports it.", "Möjligt, om processen stöder det."])
        ])
      }),

      pg("l4", ["Who uses the cluster?", "Vem använder klustret?"], [
        "{{person.itOps.name}} admits that nobody watches GPU usage. The scheduler records jobs, but no alert fires when the whole cluster runs at full load at three in the morning, and nobody compares usage with bookings.\n\nThe researchers like it that way. Freedom to experiment is part of why they work here.",
        "{{person.itOps.name}} medger att ingen bevakar GPU-användningen. Schemaläggaren registrerar jobb, men inget larm går när hela klustret körs för fullt klockan tre på natten, och ingen jämför användningen med bokningarna.\n\nForskarna gillar det så. Friheten att experimentera är en del av varför de arbetar här."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How do you balance freedom and oversight?", "Hur balanserar ni frihet och tillsyn?"], ["Adds open, simple rules and alerts that researchers understand.", "Inför öppna, enkla regler och larm som forskarna förstår."], [
          opt(["Alert on unbooked heavy use, and publish the rule", "Larma vid obokad tung användning, och publicera regeln"], "c8", ["Light-touch and transparent.", "Lätt och öppet."]),
          opt(["Leave it as it is", "Låt det vara som det är"], "c8", ["Until the next graph.", "Fram till nästa diagram."])
        ])
      }),

      pg("c8", ["The customer", "Kunden"], [
        "The customer whose project slipped asks for an explanation of the missed milestone. Their contract says the research environment is dedicated to approved project work.\n\nThe project lead wants to say “technical problems”. {{person.serviceOwner.name}} is not sure that is honest enough, especially if the tunnel turns out to have touched their data.",
        "Kunden vars projekt försenades ber om en förklaring till den missade delleveransen. Deras avtal säger att forskningsmiljön är avsatt för godkänt projektarbete.\n\nProjektledaren vill säga ”tekniska problem”. {{person.serviceOwner.name}} är inte säker på att det är ärligt nog, särskilt om det visar sig att tunneln har kommit åt deras data."
      ], {
        choice: ask(["What do you tell the customer?", "Vad säger ni till kunden?"], ["Explains honestly that the environment was misused, what was checked, and what changed.", "Förklarar ärligt att miljön missbrukades, vad som kontrollerades och vad som ändrades."], [
          opt(["Explain honestly what happened and what you checked", "Förklara ärligt vad som hände och vad ni kontrollerade"], "c9", ["Builds trust; requires you to know about the tunnel.", "Bygger förtroende; kräver att ni vet hur det är med tunneln."]),
          opt(["Say “technical problems” and offer a discount", "Säg ”tekniska problem” och erbjud en rabatt"], "c9", ["Smooth, until they learn more.", "Smidigt, tills de får veta mer."])
        ])
      }),

      pg("c9", ["The team", "Teamet"], [
        "The data science team is unsettled. Some feel the whole team is now under suspicion; others are quietly relieved that someone acted.\n\n{{person.ciso.name}} wants usage monitoring. The team's manager asks that any monitoring be visible to the team itself, so that researchers can see what is recorded about them.",
        "Analysteamet är oroligt. En del känner att hela teamet nu är misstänkt; andra är i tysthet lättade över att någon agerade.\n\n{{person.ciso.name}} vill ha bevakning av användningen. Teamets chef ber att all bevakning ska vara synlig för teamet självt, så att forskarna kan se vad som registreras om dem."
      ], {
        choice: ask(["How do you monitor?", "Hur bevakar ni?"], ["Introduces monitoring the team can see and understand.", "Inför bevakning som teamet kan se och förstå."], [
          opt(["Transparent monitoring the team can see", "Öppen bevakning som teamet kan se"], "c10", ["Accepted, and effective.", "Accepterad, och effektiv."], { set: "monitoringAdded" }),
          opt(["Monitoring only security can see", "Bevakning som bara säkerhet kan se"], "c10", ["Effective, and resented.", "Effektiv, och illa omtyckt."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. The cluster runs normally at night, idle unless booked. The case is closed one way or another, and the power graph is flat again.\n\nThe crisis team meets one last time. Everyone agrees the lab should stay a place where people experiment. The question is what rules make that safe.",
        "En månad senare. Klustret går normalt på nätterna, stilla om inget är bokat. Ärendet är avslutat på ett eller annat sätt, och eldiagrammet är platt igen.\n\nKrisledningen träffas en sista gång. Alla är överens om att labbet ska förbli en plats där folk experimenterar. Frågan är vilka regler som gör det säkert."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Writes clear rules for shared computing and blocks unapproved network tunnels.", "Skriver tydliga regler för delad datorkraft och blockerar ej godkända nätverkstunnlar."], [
          opt(["Clear rules for compute, egress filtering, and alerts on unbooked use", "Tydliga regler för datorkraft, filtrering av utgående trafik och larm vid obokad användning"], "r-end", ["Fixes the policy and the hole.", "Rättar riktlinjerna och hålet."]),
          opt(["Lock the cluster down to booked jobs only", "Lås klustret till enbart bokade jobb"], "r-end", ["Safe, and the researchers lose their freedom.", "Säkert, och forskarna förlorar sin frihet."]),
          opt(["A reminder email about acceptable use", "Ett påminnelsemejl om tillåten användning"], "r-end", ["Changes little.", "Ändrar lite."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["evidenceKept", "tunnelFound", "proportionate"], "e1"],
          ["tunnelFound", "e2"],
          ["evidenceKept", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Two months later", "Två månader senare"], ["The forensic check found no one but the mining pool used the tunnel. Both colleagues were treated under the same rules, and the case held up when the union reviewed it.\n\nThe lab has new, short rules for shared computing. The researchers wrote half of them.", "Den forensiska undersökningen visade att ingen annan än brytningspoolen använde tunneln. Båda kollegorna behandlades enligt samma regler, och ärendet höll när facket granskade det.\n\nLabbet har nya, korta regler för delad datorkraft. Forskarna skrev hälften av dem."], {
        ending: end(1, ["Fair, and closed", "Rättvist, och avslutat"], [
          "Evidence was kept, the tunnel was found and closed, and both users were treated proportionately. The case holds and the lab learns.",
          "Bevisen bevarades, tunneln hittades och stängdes och båda användarna behandlades proportionerligt. Ärendet håller och labbet lär sig."
        ])
      }),
      pg("e2", ["Two months later", "Två månader senare"], ["The tunnel was closed and the cluster is safe. But the process with the two colleagues was uneven: the intern left, the senior stayed, and the union has questions.\n\nThe security side is fixed. The people side will be remembered.", "Tunneln stängdes och klustret är säkert. Men processen med de två kollegorna var ojämn: praktikanten slutade, seniorn stannade och facket har frågor.\n\nSäkerhetssidan är åtgärdad. Personalsidan kommer att minnas."], {
        ending: end(2, ["Secure, but uneven", "Säkert, men ojämnt"], [
          "You closed the tunnel, but the people involved were not treated consistently or the evidence was thin. Trust in the process suffers.",
          "Ni stängde tunneln, men de inblandade behandlades inte konsekvent eller så var bevisen tunna. Förtroendet för processen tar skada."
        ])
      }),
      pg("e3", ["Three months later", "Tre månader senare"], ["The misuse was handled fairly, with good evidence. But the tunnel was never closed, only the mining pool was blocked.\n\nThree months later, an internet scanner uses the proxy's known flaw to reach the cluster. The customer research data has to be treated as exposed.", "Missbruket hanterades rättvist, med goda belägg. Men tunneln stängdes aldrig, bara brytningspoolen blockerades.\n\nTre månader senare använder en skanner på internet proxyns kända brist för att nå klustret. Kundernas forskningsdata måste behandlas som exponerad."], {
        ending: end(3, ["The tunnel stayed open", "Tunneln stod kvar öppen"], [
          "A fair process, but the tunnel the miner opened was never closed. Months later someone else uses it to reach customer data.",
          "En rättvis process, men tunneln som brytningsprogrammet öppnade stängdes aldrig. Månader senare använder någon annan den för att nå kunddata."
        ])
      }),
      pg("e4", ["Three months later", "Tre månader senare"], ["There was no solid evidence, no consistent process and no look at the tunnel. The data scientist challenged the outcome, and the company settled.\n\nThen a scanner found the proxy. The customer whose project slipped learned from the regulator, not from you, that its research data may have been exposed.", "Det fanns inga säkra belägg, ingen konsekvent process och ingen granskning av tunneln. Dataanalytikern överklagade utfallet, och företaget förliktes.\n\nSedan hittade en skanner proxyn. Kunden vars projekt försenades fick veta av tillsynsmyndigheten, inte av er, att dess forskningsdata kan ha exponerats."], {
        ending: end(4, ["Neither fair nor safe", "Varken rättvist eller säkert"], [
          "Without evidence, a fair process or a look at the security side, the case collapses and the open tunnel exposes customer data.",
          "Utan belägg, en rättvis process eller en granskning av säkerhetssidan faller ärendet och den öppna tunneln exponerar kunddata."
        ])
      }),

      // Break-away: the dismissal as an example.
      pg("x1", ["The example", "Exemplet"], [
        "The all-staff email goes out at four: a named data scientist has been dismissed for misusing company equipment, “as an example to everyone”.\n\nBy six, the union has called it unlawful. The dismissal skipped the process the employment agreement requires, and the policy never mentioned computing power.",
        "Mejlet till all personal går ut klockan fyra: en namngiven dataanalytiker har sagts upp för att ha missbrukat företagets utrustning, ”som ett exempel för alla”.\n\nKlockan sex har facket kallat det olagligt. Uppsägningen hoppade över den process som kollektivavtalet kräver, och riktlinjerna nämnde aldrig datorkraft."
      ], {
        choice: ask(["How do you respond to the union?", "Hur bemöter ni facket?"], ["Withdraws the public naming and restarts a proper process.", "Drar tillbaka det offentliga utpekandet och startar om en ordentlig process."], [
          opt(["Withdraw and restart properly", "Dra tillbaka och börja om ordentligt"], "x2", ["Humbling, and right.", "Ödmjukande, och rätt."]),
          opt(["Stand by the dismissal", "Stå fast vid uppsägningen"], "x2", ["Heads for the labour court.", "På väg mot arbetsdomstolen."])
        ])
      }),
      pg("x2", ["The labour lawyer", "Arbetsrättsjuristen"], [
        "The union's lawyer writes formally. The dismissal lacked grounds under the policy, skipped consultation, and the public naming harmed the employee's reputation.\n\nThey propose reinstatement or damages. Meanwhile the data scientist's colleagues have signed a letter supporting them, not because they approve of the mining, but because of how it was done.",
        "Fackets jurist skriver formellt. Uppsägningen saknade grund i riktlinjerna, hoppade över förhandlingen och det offentliga utpekandet skadade den anställdes anseende.\n\nJuristen föreslår återanställning eller skadestånd. Under tiden har dataanalytikerns kollegor skrivit under ett brev till stöd för hen, inte för att de godkänner kryptobrytningen, utan på grund av hur det gick till."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Negotiates a fair settlement and corrects the public statement.", "Förhandlar fram en rimlig förlikning och rättar det offentliga uttalandet."], [
          opt(["Negotiate and correct the statement", "Förhandla och rätta uttalandet"], "x3", ["Ends it sooner.", "Avslutar det tidigare."]),
          opt(["Fight it in court", "Driv det i domstol"], "x3", ["Months of headlines inside the company.", "Månader av rubriker inom företaget."])
        ])
      }),
      pg("x3", ["Meanwhile, the tunnel", "Under tiden, tunneln"], [
        "With everyone focused on the dismissal, nobody followed up on the proxy program. It is still running on the cluster node, and the mining pool block did nothing to the tunnel itself.\n\n{{person.socLead.name}} notices new connections through it from an address that is not a mining pool.",
        "Med alla fokuserade på uppsägningen följde ingen upp proxyprogrammet. Det körs fortfarande på klusternoden, och blockeringen av brytningspoolen gjorde ingenting med själva tunneln.\n\n{{person.socLead.name}} ser nya anslutningar genom den från en adress som inte är en brytningspool."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Closes the tunnel immediately and investigates the access.", "Stänger tunneln omedelbart och utreder åtkomsten."], [
          opt(["Close it and investigate", "Stäng den och utred"], "x4", ["Late, and necessary.", "Sent, och nödvändigt."]),
          opt(["Close it quietly; the company has enough bad news", "Stäng den i tysthet; företaget har nog med dåliga nyheter"], "x4", ["The customer data question remains.", "Frågan om kunddatan kvarstår."])
        ])
      }),
      pg("x4", ["The customer", "Kunden"], [
        "The investigation finds that someone used the tunnel to browse the cluster's storage for two days, including one customer's research data.\n\nThe customer must be told, and so must the regulator. The dismissal case is still running, and the union points out that the person blamed for everything warned nobody about the proxy because nobody asked.",
        "Utredningen visar att någon använde tunneln för att bläddra i klustrets lagring i två dagar, bland annat i en kunds forskningsdata.\n\nKunden måste få veta, och det måste tillsynsmyndigheten också. Uppsägningsärendet pågår fortfarande, och facket påpekar att den som fick skulden för allt aldrig varnade någon om proxyn eftersom ingen frågade."
      ], {
        choice: ask(["How do you tell the customer?", "Hur berättar ni för kunden?"], ["Tells the customer and regulator promptly and fully.", "Berättar för kunden och tillsynsmyndigheten snabbt och fullständigt."], [
          opt(["Promptly and fully", "Snabbt och fullständigt"], "e5", ["The only option that helps.", "Det enda alternativet som hjälper."]),
          opt(["Minimally, through lawyers", "Minimalt, via jurister"], "e5", ["They will hear the rest elsewhere.", "De kommer att höra resten någon annanstans."])
        ])
      }),
      pg("e5", ["Half a year later", "Ett halvår senare"], ["A misuse case became an unlawful dismissal, a labour dispute, and a customer data exposure through a tunnel nobody closed while everyone was busy making an example.\n\nThe company settled with the data scientist. The customer did not renew.", "Ett missbruksärende blev en olaglig uppsägning, en arbetstvist och en exponering av kunddata via en tunnel som ingen stängde medan alla var upptagna med att statuera exempel.\n\nFöretaget förliktes med dataanalytikern. Kunden förnyade inte avtalet."], {
        ending: end(5, ["The example backfired", "Exemplet slog tillbaka"], [
          "A public dismissal without process turned a misuse case into a labour dispute, while the open tunnel exposed customer data.",
          "En offentlig uppsägning utan process gjorde ett missbruksärende till en arbetstvist, medan den öppna tunneln exponerade kunddata."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Investigate misuse quietly and with evidence before confronting anyone.", "Utred missbruk i tysthet och med belägg innan någon konfronteras."]),
        L(["Cryptomining often brings a security hole with it: look for the tunnel.", "Kryptobrytning för ofta med sig ett säkerhetshål: leta efter tunneln."]),
        L(["Unclear rules call for proportionate responses and better rules.", "Otydliga regler kräver proportionerliga åtgärder och bättre regler."]),
        L(["Making an example without due process usually backfires.", "Att statuera exempel utan korrekt process slår oftast tillbaka."])
      ],
      strengthsToLookFor: [
        L(["Pulling logs quietly first", "Att först ta fram loggar i tysthet"]),
        L(["Closing the tunnel and checking the cluster", "Att stänga tunneln och undersöka klustret"]),
        L(["Treating both users under the same rules", "Att behandla båda användarna enligt samma regler"])
      ],
      commonGaps: [
        L(["Treating it purely as an HR matter", "Att behandla det enbart som en personalfråga"]),
        L(["Blocking the pool but not the tunnel", "Att blockera poolen men inte tunneln"]),
        L(["Harshness towards the junior, leniency towards the senior", "Hårdhet mot den juniora, mildhet mot den seniora"])
      ],
      suggestedActions: [
        act(["Write clear rules for personal use of shared computing.", "Skriv tydliga regler för privat användning av delad datorkraft."], "cio", "high"),
        act(["Filter outbound traffic from research clusters.", "Filtrera utgående trafik från forskningskluster."], "itOps", "high"),
        act(["Alert on heavy unbooked use, visible to the team.", "Larma vid tung obokad användning, synligt för teamet."], "socLead", "medium"),
        act(["Agree an investigation procedure for misuse with HR and the union.", "Kom överens med HR och facket om en utredningsrutin för missbruk."], "hr", "medium")
      ]
    }
  });
})();
