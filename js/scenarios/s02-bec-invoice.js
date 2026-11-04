/*
 * s02-bec-invoice.js — "The Invoice That Changed Bank Accounts" (archetype F).
 *
 * A money-and-relationships crisis first, a security incident second. A supplier
 * chases an unpaid invoice → the payment went to a fraudster's account → the
 * CFO's mailbox has been read for months through hidden forwarding rules →
 * customers receive fraudulent invoices from your real domain → the bank's
 * recall window is closing → the CFO wants to lead the investigation.
 *
 * Ground truth: an adversary-in-the-middle phishing page captured the CFO's
 * session months ago; inbox rules forward finance mail to an outside address and
 * hide replies; the bank-change email was sent from a look-alike domain inside a
 * real thread; stolen invoice templates are now used against customers.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s02-bec-invoice",
    version: 1,
    category: "fraud",
    archetype: "human-legal-reputational",
    emblem: "invoice",
    title: L(["The Invoice That Changed Bank Accounts", "Fakturan som bytte bankkonto"]),
    summary: L([
      "A long-standing supplier asks why they have not been paid. You paid — to a new account. What starts as an awkward call to finance becomes a months-long mailbox compromise, fraud against your own customers and a race against the bank's recall window.",
      "En långvarig leverantör undrar varför de inte har fått betalt. Ni har betalat – till ett nytt konto. Det som börjar som ett pinsamt samtal till ekonomi blir ett månader långt intrång i en e-postlåda, bedrägerier mot era egna kunder och en kapplöpning mot bankens återkallelsefrist."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Act on payment fraud within the bank's recall window", "Agera på betalningsbedrägeri inom bankens frist för återkallelse"]), teaser: L(["Racing the clock", "Att tävla mot klockan"]) },
      { id: "lo2", text: L(["Scope a mailbox compromise beyond the first visible fraud", "Avgränsa ett intrång i en e-postlåda bortom det första synliga bedrägeriet"]), teaser: L(["Looking past the first thing you see", "Att se bortom det första man ser"]) },
      { id: "lo3", text: L(["Protect customers and partners when your own domain is used against them", "Skydda kunder och partner när er egen domän används mot dem"]), teaser: L(["Duties to those who trust you", "Ansvaret mot dem som litar på er"]) },
      { id: "lo4", text: L(["Handle conflicts of interest and personal accountability in the response", "Hantera jäv och personligt ansvar i hanteringen"]), teaser: L(["When it gets personal", "När det blir personligt"]) }
    ],
    mitre: ["T1566", "T1557", "T1539", "T1078", "T1114", "T1564.008", "T1656", "T1534"],
    frameworks: {
      nistCsf: ["GV.RR", "GV.SC", "PR.AA", "PR.AT", "DE.AE", "RS.MA", "RS.AN", "RS.CO", "RC.CO"],
      iso27001: ["A.5.19", "A.5.24", "A.5.26", "A.5.31", "A.5.34", "A.6.3", "A.8.5", "A.8.15"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours", sectors: ["manufacturing", "logistics", "retail", "technology", "public"] },
    actor: { types: ["criminal"], motivation: L(["Financial gain through invoice and payment fraud", "Ekonomisk vinning genom faktura- och betalningsbedrägerier"]), capability: "medium" },
    variables: {
      amount: { min: 400000, max: 9000000, step: 5000, scaleBy: "size", currency: true },
      months: { min: 3, max: 9 },
      forwarded: { min: 900, max: 14000, step: 10, scaleBy: "size" },
      customersHit: { min: 6, max: 140, scaleBy: "size" },
      customerLoss: { min: 80000, max: 1500000, step: 5000, scaleBy: "size", currency: true },
      frozenPct: { min: 18, max: 46 },
      frozenAmount: { derive: (v) => Math.round((v.amount * v.frozenPct) / 100 / 1000) * 1000 }
    },
    roles: ["cfo", "ciso", "socLead", "itOps", "legal", "comms", "ceo", "dpo", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "{{num.months}} months ago the CFO entered their password on an adversary-in-the-middle phishing page; the stolen session gave mailbox access without triggering MFA. The attacker added hidden inbox rules, read every finance thread, sent a bank-change request from {{asset.lookalikeDomain}} inside a genuine supplier thread, and later used stolen invoice templates against your customers.",
        "För {{num.months}} månader sedan angav ekonomichefen sitt lösenord på en nätfiskesida av typen adversary-in-the-middle; den stulna sessionen gav åtkomst till e-postlådan utan att MFA aktiverades. Angriparen lade in dolda inkorgsregler, läste alla ekonomitrådar, skickade en begäran om nytt bankkonto från {{asset.lookalikeDomain}} i en äkta leverantörstråd och använde senare stulna fakturamallar mot era kunder."
      ]),
      attackerTimeline: [
        { at: -262800, text: L(["CFO signs in through a phishing page that proxies the real login; session token captured.", "Ekonomichefen loggar in via en nätfiskesida som förmedlar den riktiga inloggningen; sessionstoken fångas."]) },
        { at: -262000, text: L(["Two hidden inbox rules created: forward finance mail outside, move bank-related replies to RSS folder.", "Två dolda inkorgsregler skapas: vidarebefordra ekonomipost externt och flytta svar om bankuppgifter till RSS-mappen."]) },
        { at: -64800, text: L(["Look-alike domain {{asset.lookalikeDomain}} registered.", "Den förväxlingsbara domänen {{asset.lookalikeDomain}} registreras."]) },
        { at: -60480, text: L(["Bank-change request sent to accounts payable inside the real supplier thread.", "Begäran om nytt bankkonto skickas till leverantörsreskontran i den äkta leverantörstråden."]) },
        { at: -43200, text: L(["Invoice paid to the new account; most funds moved on within 36 hours.", "Fakturan betalas till det nya kontot; merparten av pengarna förs vidare inom 36 timmar."]) },
        { at: 700, text: L(["Fake invoices from your own domain sent to customers using stolen templates.", "Falska fakturor skickas från er egen domän till kunder med stulna mallar."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-cfo", revealStage: "p2", text: L(["The supplier was never compromised. The CFO's mailbox was, and the bank-change email came from {{asset.lookalikeDomain}} inside the real thread.", "Leverantören har aldrig haft något intrång. Det har ekonomichefens e-postlåda, och mejlet om nytt bankkonto kom från {{asset.lookalikeDomain}} i den äkta tråden."]) },
      { id: "hf-rules", revealStage: "p3", text: L(["Hidden inbox rules have forwarded {{num.forwarded}} finance emails outside the organisation for {{num.months}} months.", "Dolda inkorgsregler har vidarebefordrat {{num.forwarded}} ekonomimejl utanför organisationen i {{num.months}} månader."]) },
      { id: "hf-customers", revealStage: "p4", text: L(["The attacker holds invoice templates and the customer ledger and has invoiced {{num.customersHit}} customers.", "Angriparen har fakturamallar och kundreskontran och har fakturerat {{num.customersHit}} kunder."]) },
      { id: "hf-funds", revealStage: "p5", text: L(["Only {{num.frozenPct}} % of the stolen payment is still in the receiving account.", "Bara {{num.frozenPct}} % av den stulna betalningen finns kvar på mottagarkontot."]) }
    ],

    stages: [
      // ------------------------------------------------------------------------------------- p1
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Where is our money?", "Var är våra pengar?"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. {{person.supplierManager.firstName}} forwards an angry email from {{supplier.vendor}}, one of your oldest suppliers: their invoice of {{num.amount|currency}} is now 30 days overdue, and they threaten to stop deliveries.\n\nAccounts payable insists it was paid on time, to the new bank account the supplier asked them to use a few weeks ago. Either someone is mistaken, or the money went somewhere it should not have.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. {{person.supplierManager.firstName}} vidarebefordrar ett argt mejl från {{supplier.vendor}}, en av era äldsta leverantörer: deras faktura på {{num.amount|currency}} är nu 30 dagar försenad, och de hotar att stoppa leveranserna.\n\nLeverantörsreskontran står fast vid att den betalades i tid, till det nya bankkonto som leverantören bad dem använda för några veckor sedan. Antingen har någon fel, eller så har pengarna hamnat där de inte borde."
        ]),
        injects: [
          inj("i1-1", 0, "email", "supplier", "medium", "confirmed", [
            "“We have still not received payment for invoice 4471. Our bank details have not changed in eleven years. Please explain by end of day, or we will put further deliveries on hold.”",
            "”Vi har fortfarande inte fått betalt för faktura 4471. Våra bankuppgifter har inte ändrats på elva år. Förklara senast i dag, annars pausar vi kommande leveranser.”"
          ], { headline: ["Overdue: invoice 4471", "Förfallen: faktura 4471"], meta: { from: "accounts@{{supplier.vendor.domain}}", subject: L(["Overdue: invoice 4471", "Förfallen: faktura 4471"]) }, tests: ["lo1"], expectedResponse: ["Treat it as possible payment fraud at once; contact the bank before anything else.", "Behandla det direkt som ett möjligt betalningsbedrägeri; kontakta banken före allt annat."] }),
          inj("i1-2", 20, "employeeReport", "employee", "medium", "confirmed", [
            "Accounts payable: “The change request came in the same email thread we always use with them, with their logo and the right contact person. We even replied to confirm, and they confirmed back.”",
            "Leverantörsreskontran: ”Begäran om bytet kom i samma mejltråd som vi alltid använder med dem, med deras logga och rätt kontaktperson. Vi svarade till och med för att bekräfta, och de bekräftade tillbaka.”"
          ], { tests: ["lo2"], facilitatorNote: ["The “confirmation” went to the look-alike domain. Let the group notice that confirming by email proves nothing.", "”Bekräftelsen” gick till den förväxlingsbara domänen. Låt gruppen upptäcka att en bekräftelse via mejl inte bevisar något."] }),
          inj("i1-3", 35, "chat", "person.cfo", "low", "misleading", [
            "“Their side has obviously been hacked — this happens to suppliers all the time. Our controls worked; we followed procedure. Let's not make it bigger than it is.”",
            "”Det är uppenbarligen de som blivit hackade – det händer leverantörer hela tiden. Våra kontroller fungerade; vi följde rutinen. Låt oss inte göra det större än det är.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Misleading and self-protective. The CFO's mailbox is the real source; watch whether anyone challenges the assumption.", "Vilseledande och självskyddande. Det är ekonomichefens e-postlåda som är den verkliga källan; se om någon ifrågasätter antagandet."], tests: ["lo4"] }),
          inj("i1-4", 50, "phoneTranscript", "bank", "high", "confirmed", [
            "Your bank's fraud desk: “If you report it now we can ask the receiving bank to freeze what is left. Recalls work best within the first days — after that the money is usually gone.”",
            "Bankens bedrägeriavdelning: ”Om ni anmäler nu kan vi be mottagarbanken frysa det som finns kvar. Återkallelser fungerar bäst de första dagarna – sedan brukar pengarna vara borta.”"
          ], {
            optional: true,
            tests: ["lo1"],
            meta: {
              thread: [
                { side: "out", name: "{{person.cfo.name}}", text: L(["We paid a supplier invoice to a new bank account last week. We now think the account change was fraud.", "Vi betalade en leverantörsfaktura till ett nytt bankkonto förra veckan. Nu tror vi att kontobytet var ett bedrägeri."]) },
                { side: "in", name: L(["Fraud desk", "Bedrägeriavdelningen"]), text: L(["If you report it now we can ask the receiving bank to freeze what is left. Recalls work best within the first days — after that the money is usually gone.", "Om ni anmäler nu kan vi be mottagarbanken frysa det som finns kvar. Återkallelser fungerar bäst de första dagarna – sedan brukar pengarna vara borta."]) }
              ]
            }
          })
        ],
        questions: {
          technical: [
            q("How do you establish where the change request really came from, without tipping anyone off?", "Hur tar ni reda på varifrån begäran om bytet verkligen kom, utan att varna någon?", ["socLead", "itOps"]),
            q("Which logs and messages must be preserved now, before anyone starts deleting embarrassing emails?", "Vilka loggar och meddelanden måste säkras nu, innan någon börjar radera pinsamma mejl?", ["ciso", "itOps"]),
            q("Could any other payments have been redirected the same way?", "Kan andra betalningar ha styrts om på samma sätt?", ["socLead", "cfo"])
          ],
          executive: [
            q("Who calls the bank, and who calls the supplier — and in which order?", "Vem ringer banken och vem ringer leverantören – och i vilken ordning?", ["cfo", "ceo"]),
            q("Do you pay the supplier again now to protect deliveries, before you know what happened?", "Betalar ni leverantören igen nu för att skydda leveranserna, innan ni vet vad som hänt?", ["cfo", "supplierManager"]),
            q("Is this a finance error or a security incident — and does it matter who leads?", "Är det ett ekonomifel eller en säkerhetsincident – och spelar det någon roll vem som leder?", ["ceo", "ciso"])
          ]
        },
        challenges: [ch("The supplier will stop deliveries tomorrow unless they are paid today.", "Leverantören stoppar leveranserna i morgon om de inte får betalt i dag.")],
        decision: dec("d1", "cfo", ["What do you do in the next hour?", "Vad gör ni den närmaste timmen?"], [
          ["Report to the bank immediately, freeze all pending payments with changed bank details, and open an incident.", "Anmäl direkt till banken, frys alla väntande betalningar med ändrade bankuppgifter och öppna en incident."],
          ["Verify internally first — it may be a booking error on the supplier's side.", "Kontrollera internt först – det kan vara ett bokföringsfel hos leverantören."],
          ["Pay the supplier's real account now so deliveries continue, and chase the lost payment as a separate fraud case.", "Betala leverantörens riktiga konto nu så att leveranserna fortsätter, och driv den förlorade betalningen som ett separat bedrägeriärende."]
        ], {
          knowns: [["Payment went to a new account requested by email.", "Betalningen gick till ett nytt konto som begärdes via mejl."], ["The supplier says their details never changed.", "Leverantören säger att deras uppgifter aldrig ändrats."]],
          uncertainties: [["Whose email system was compromised.", "Vems e-postsystem som har komprometterats."], ["Whether other payments are affected.", "Om andra betalningar berörs."]],
          tradeoffs: {
            operational: ["Freezing payments delays legitimate suppliers.", "Att frysa betalningar försenar legitima leverantörer."],
            security: ["Waiting lets the attacker keep reading and redirecting.", "Att vänta låter angriparen fortsätta läsa och styra om."],
            legal: ["Recall chances fall sharply with every day.", "Möjligheten att återkalla minskar kraftigt för varje dag."],
            reputational: ["Paying twice signals weak controls; not paying strains a key partner.", "Att betala två gånger signalerar svaga kontroller; att inte betala sätter en viktig partner under press."]
          },
          evaluation: [["Contacts the bank before internal fact-finding", "Kontaktar banken före den interna utredningen"], ["Treats the event as a security incident, not only a finance error", "Behandlar händelsen som en säkerhetsincident, inte bara som ett ekonomifel"]],
          pushback: {
            A: [
              pb(["The bank wants proof", "Banken vill ha bevis"], ["The fraud desk asks for the original change request and evidence that it was fraudulent. All you have is the supplier's word that their details never changed. If they are mistaken, you have just reported a payment to a legitimate account as fraud. How sure are you, and on what?", "Bedrägeriavdelningen ber om den ursprungliga begäran om bytet och belägg för att den var bedräglig. Allt ni har är leverantörens ord om att uppgifterna aldrig ändrats. Om de har fel har ni just anmält en betalning till ett legitimt konto som bedrägeri. Hur säkra är ni, och på vilken grund?"]),
              pb(["Deliveries stop anyway", "Leveranserna stoppas ändå"], ["Reporting and freezing protected the money, but it did not pay the supplier. {{person.supplierManager.firstName}} relays their answer: no payment today, no deliveries tomorrow, and operations says stock runs out within days. Do you also pay twice, or let the shelves run empty?", "Anmälan och frysningen skyddade pengarna, men leverantören har fortfarande inte fått betalt. {{person.supplierManager.firstName}} framför deras svar: ingen betalning i dag, inga leveranser i morgon, och verksamheten säger att lagret tar slut inom några dagar. Betalar ni dessutom två gånger, eller låter ni hyllorna tömmas?"]),
              pb(["Two leads, two plans", "Två ledare, två planer"], ["Now that an incident is open, security wants to run it. Finance says it is a payment matter and that the CFO already has it in hand. Within the hour the bank has received calls from both. Who is actually in charge, and who tells the other side?", "Nu när en incident är öppnad vill säkerhetsfunktionen leda den. Ekonomi säger att det är en betalningsfråga som ekonomichefen redan har hand om. Inom en timme har banken fått samtal från båda. Vem leder egentligen, och vem säger det till den andra sidan?"])
            ],
            B: [
              pb(["The fraud desk closes", "Bedrägeriavdelningen stänger"], ["While accounts payable re-checks the bookings, the bank's fraud desk reminds you that recalls work best in the first days, and they close for the day in two hours. Every hour of internal checking is an hour the money can move. Is your check worth more than a phone call?", "Medan leverantörsreskontran går igenom bokningarna igen påminner bankens bedrägeriavdelning om att återkallelser fungerar bäst de första dagarna, och de stänger för dagen om två timmar. Varje timme av intern kontroll är en timme då pengarna kan flyttas. Är er kontroll värd mer än ett telefonsamtal?"]),
              pb(["Checking the fraud with the fraud", "Kontrollera bedrägeriet med bedrägeriet"], ["The internal check turns out to be accounts payable re-reading the same email thread in which the supplier “confirmed back”. You are verifying the change through the very channel it arrived by. What would an independent check look like, and who does it now?", "Den interna kontrollen visar sig vara att leverantörsreskontran läser om samma mejltråd där leverantören ”bekräftade tillbaka”. Ni kontrollerar bytet via just den kanal det kom genom. Hur skulle en oberoende kontroll se ut, och vem gör den nu?"]),
              pb(["“Our booking error?”", "”Vårt bokföringsfel?”"], ["The supplier's managing director calls your CEO: they have been told you suspect a booking error on their side, after eleven years of the same bank account. They put deliveries on hold today, not tomorrow. Who calls them back, and what do you say?", "Leverantörens vd ringer er vd: de har hört att ni misstänker ett bokföringsfel hos dem, efter elva år med samma bankkonto. De pausar leveranserna i dag, inte i morgon. Vem ringer tillbaka, och vad säger ni?"])
            ],
            C: [
              pb(["Is this account real?", "Är det här kontot äkta?"], ["To pay the “real” account, finance takes the bank details from the supplier records and the email thread. Nobody has called a number you already had. How do you know that this time the money goes to the right place?", "För att betala det ”riktiga” kontot hämtar ekonomi bankuppgifterna från leverantörsregistret och mejltråden. Ingen har ringt ett nummer ni redan hade. Hur vet ni att pengarna den här gången hamnar rätt?"]),
              pb(["Who signs the double payment?", "Vem skriver under dubbelbetalningen?"], ["Paying {{num.amount|currency}} a second time is above the approval limit and needs two signatures. The CEO asks why the company is paying twice before anyone knows what happened, and the auditor will see a double payment with no incident report. Who signs, and on what basis?", "Att betala {{num.amount|currency}} en andra gång ligger över attestgränsen och kräver två underskrifter. Vd frågar varför företaget betalar två gånger innan någon vet vad som hänt, och revisorn kommer att se en dubbelbetalning utan incidentrapport. Vem skriver under, och på vilken grund?"]),
              pb(["The separate case nobody owns", "Ärendet som ingen äger"], ["With the supplier satisfied, the “separate fraud case” has no owner. The bank calls back to ask for a written report, and nobody has started one. Has paying turned a security incident into an admin task, and who picks it up today?", "När leverantören är nöjd har ”det separata bedrägeriärendet” ingen ägare. Banken ringer tillbaka och ber om en skriftlig anmälan, och ingen har börjat på någon. Har betalningen gjort en säkerhetsincident till ett administrativt ärende, och vem tar tag i det i dag?"])
            ]
          },
          minutes: 8
        }),
        facilitator: fac(
          ["The room will want to blame the supplier. Let them — the twist in stage 2 lands harder if they do.", "Gruppen kommer att vilja skylla på leverantören. Låt dem göra det – vändningen i skede 2 slår hårdare då."],
          ["Bank contacted within the hour, payments with changed details frozen, the incident opened and evidence preserved.", "Banken kontaktad inom en timme, betalningar med ändrade uppgifter frysta, incidenten öppnad och spår säkrade."],
          [["Ask: how long does the bank say a recall stays realistic?", "Fråga: hur länge säger banken att en återkallelse är realistisk?"], ["Ask: who owns the decision to pay twice?", "Fråga: vem äger beslutet att betala två gånger?"]]
        )
      },

      // ------------------------------------------------------------------------------------- p2
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["It came from inside", "Det kom inifrån"]),
        twist: L(["The supplier was never hacked. Someone was reading your CFO's mailbox.", "Leverantören har aldrig blivit hackad. Någon har läst er ekonomichefs e-post."]),
        twistKind: "cause",
        assumptionChallenged: L(["The supplier's email was compromised.", "Det var leverantörens e-post som var komprometterad."]),
        reveals: ["hf-cfo"],
        narrative: L([
          "{{time.T+120|clock}}. The SOC has pulled the full email thread and read the message headers line by line.\n\nThe bank-change message did not come from {{supplier.vendor.domain}} at all. It came from {{asset.lookalikeDomain}}, a domain that differs by a single letter. And it quoted an internal reply that only ever existed in {{person.cfo.name}}'s mailbox.",
          "Klockan {{time.T+120|clock}}. SOC har tagit fram hela mejltråden och läst meddelandehuvudena rad för rad.\n\nMeddelandet om nytt bankkonto kom inte alls från {{supplier.vendor.domain}}. Det kom från {{asset.lookalikeDomain}}, en domän som skiljer sig med en enda bokstav. Och det citerade ett internt svar som bara någonsin fanns i {{person.cfo.name}}s e-postlåda."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "soc", "high", "confirmed", [
            "Header analysis: the change request came from {{asset.lookalikeDomain}}, registered six weeks ago. It quotes a message the CFO sent internally the day before — the attacker could read the CFO's mailbox.",
            "Analys av mejlhuvuden: begäran om bytet kom från {{asset.lookalikeDomain}}, registrerad för sex veckor sedan. Den citerar ett meddelande som ekonomichefen skickade internt dagen innan – angriparen kunde läsa ekonomichefens e-post."
          ], { headline: ["The change request came from a look-alike domain", "Begäran om bytet kom från en förväxlingsbar domän"], reveals: ["hf-cfo"], tests: ["lo2"] }),
          inj("i2-2", 140, "authLog", "siem", "high", "confirmed", [
            "{{env.idp|cap}}: the CFO's account has active sessions from {{asset.attackerIp}} and {{asset.attackerIp2}} — neither a company location. MFA was satisfied by a session token, not a new sign-in.",
            "{{env.idp|cap}}: ekonomichefens konto har aktiva sessioner från {{asset.attackerIp}} och {{asset.attackerIp2}} – ingen av dem är en av företagets platser. MFA uppfylldes av en sessionstoken, inte av en ny inloggning."
          ], { tests: ["lo2"], expectedResponse: ["Revoke all sessions, reset credentials, and register phishing-resistant MFA — in that order, quickly.", "Återkalla alla sessioner, byt inloggningsuppgifter och registrera nätfiskeresistent MFA – i den ordningen, snabbt."] }),
          inj("i2-3", 160, "executiveMessage", "person.cfo", "medium", "confirmed", [
            "“I want to see the evidence before anyone touches my mailbox. I'm in the middle of the quarterly close.”",
            "”Jag vill se bevisen innan någon rör min e-postlåda. Jag är mitt i kvartalsbokslutet.”"
          ], { tests: ["lo4"], facilitatorNote: ["A legitimate concern that also delays containment. Who has the authority to act on an executive's account?", "En legitim oro som samtidigt fördröjer begränsningen. Vem har mandat att agera på en chefs konto?"] })
        ],
        questions: {
          technical: [
            q("How do you lock the attacker out without destroying the evidence of what they read?", "Hur stänger ni ute angriparen utan att förstöra spåren av vad de har läst?", ["socLead", "itOps"]),
            q("What does a stolen session token mean for your MFA assumptions?", "Vad innebär en stulen sessionstoken för era antaganden om MFA?", ["ciso", "socLead"]),
            q("Given this, was your first-hour decision fast enough?", "Med det här i åtanke – var ert beslut under första timmen tillräckligt snabbt?", ["socLead", "cfo"], "d1")
          ],
          executive: [
            q("Who has the authority to act on the CFO's account if the CFO objects?", "Vem har mandat att agera på ekonomichefens konto om ekonomichefen protesterar?", ["ceo", "legal"]),
            q("What do you now owe the supplier — an apology, an explanation, the money?", "Vad är ni nu skyldiga leverantören – en ursäkt, en förklaring, pengarna?", ["cfo", "supplierManager"]),
            q("Does this change your answer about paying the supplier twice?", "Ändrar det här ert svar om att betala leverantören två gånger?", ["ceo", "cfo"], "d1")
          ]
        },
        challenges: [ch("The CFO is the person whose account must be locked — and one of the people in the room.", "Ekonomichefen är den person vars konto måste låsas – och en av dem i rummet.")],
        decision: dec("d2", "ceo", ["How do you contain the CFO's account?", "Hur begränsar ni ekonomichefens konto?"], [
          ["Revoke all sessions and reset credentials now, during the quarterly close.", "Återkalla alla sessioner och byt inloggningsuppgifter nu, mitt under kvartalsbokslutet."],
          ["Monitor the account quietly for a day to learn what the attacker is after.", "Övervaka kontot i tysthet ett dygn för att förstå vad angriparen är ute efter."],
          ["Wait until the CFO has finished the close, then act.", "Vänta tills ekonomichefen har slutfört bokslutet och agera sedan."]
        ], {
          knowns: [["The attacker can read the CFO's mailbox right now.", "Angriparen kan läsa ekonomichefens e-post just nu."]],
          uncertainties: [["What else the attacker has read or sent.", "Vad mer angriparen har läst eller skickat."]],
          tradeoffs: {
            operational: ["Locking the account disrupts the quarterly close.", "Att låsa kontot stör kvartalsbokslutet."],
            security: ["Watching gives intelligence but more time to the attacker.", "Att bevaka ger kunskap men mer tid åt angriparen."],
            legal: ["Monitoring an employee's mailbox has privacy limits.", "Att övervaka en anställds e-post har integritetsgränser."],
            reputational: ["A slow reaction becomes harder to defend later.", "En långsam reaktion blir svårare att försvara i efterhand."]
          },
          evaluation: [["Acts on the account regardless of seniority", "Agerar på kontot oavsett befattning"], ["Considers privacy limits before monitoring", "Tar hänsyn till integritetsgränser innan övervakning"]],
          pushback: {
            A: [
              pb(["The close stops", "Bokslutet stannar"], ["The moment the account is locked, the quarterly close stalls: approvals route through the CFO, and the figures are due to the bank tomorrow. The finance team asks for a temporary workaround. Do you give the CFO access some other way, and through what?", "Så fort kontot låses stannar kvartalsbokslutet: attesterna går via ekonomichefen, och siffrorna ska till banken i morgon. Ekonomiteamet ber om en tillfällig lösning. Ger ni ekonomichefen åtkomst på något annat sätt, och i så fall hur?"]),
              pb(["Now they know", "Nu vet de"], ["Revoking the sessions tells the attacker, instantly, that they have been found. Whatever they had planned next may now happen faster, and you gave up the chance to watch them. Do you have anything ready for their next move?", "När sessionerna återkallas vet angriparen direkt att de är upptäckta. Det de hade planerat härnäst kan nu ske snabbare, och ni avstod från chansen att se vad de gör. Har ni något redo för deras nästa drag?"]),
              pb(["The CFO's complaint", "Ekonomichefens klagomål"], ["The CFO writes to the CEO and the chair of the board: their account was locked during the close without anyone showing them the evidence. They ask who authorised it. Who answers, and how much of the evidence can you share without harming the investigation?", "Ekonomichefen skriver till vd och styrelseordföranden: kontot låstes mitt under bokslutet utan att någon visade bevisen. Hen frågar vem som gav klartecken. Vem svarar, och hur mycket av bevisen kan ni visa utan att skada utredningen?"])
            ],
            B: [
              pb(["Watching a colleague's mail", "Att bevaka en kollegas e-post"], ["Legal stops the plan: reading an executive's mailbox in real time needs a legal basis, and the CFO has not agreed to it. Privacy rules do not pause for an incident. Who authorises watching a colleague's email, and are you willing to put that in writing?", "Juristen stoppar planen: att läsa en chefs e-post i realtid kräver rättslig grund, och ekonomichefen har inte gått med på det. Integritetsreglerna pausar inte för en incident. Vem ger tillstånd att bevaka en kollegas e-post, och är ni beredda att skriva ner det?"]),
              pb(["The account can still send", "Kontot kan fortfarande skicka"], ["While you watch, the attacker can still send mail as the CFO. If something leaves that mailbox tonight, someone else may act on it before your analysts see it. Who is watching at night, and what are they allowed to stop?", "Medan ni bevakar kan angriparen fortfarande skicka mejl som ekonomichefen. Om något lämnar brevlådan i natt kan någon annan agera på det innan era analytiker ser det. Vem bevakar i natt, och vad får de stoppa?"]),
              pb(["The CFO knows", "Ekonomichefen vet"], ["The CFO is in the room and knows the account is being watched. They ask whether to keep using it for the close, and whether to act normally. Do you let a colleague keep working in a mailbox you know is compromised, and what do you tell them to do?", "Ekonomichefen sitter i rummet och vet att kontot bevakas. Hen frågar om hen ska fortsätta använda det för bokslutet, och om hen ska bete sig som vanligt. Låter ni en kollega fortsätta arbeta i en brevlåda ni vet är komprometterad, och vad säger ni åt hen att göra?"])
            ],
            C: [
              pb(["Every draft passes through", "Varje utkast passerar"], ["The close takes several more working days, and every draft of the quarterly figures will pass through a mailbox the attacker can read. What could someone do with your results before your own board and lenders see them?", "Bokslutet tar flera arbetsdagar till, och varje utkast av kvartalssiffrorna passerar en brevlåda som angriparen kan läsa. Vad kan någon göra med era siffror innan er egen styrelse och era långivare ser dem?"]),
              pb(["Would an intern wait?", "Skulle en praktikant få vänta?"], ["The SOC lead says it plainly: an intern's account in the same state would have been locked within minutes. Here, a senior colleague's convenience is setting the pace. How will that look in the review, and are you comfortable defending it?", "SOC-chefen säger det rakt ut: en praktikants konto i samma läge hade låsts inom några minuter. Här är det en chefs bekvämlighet som sätter takten. Hur kommer det att se ut i granskningen, och är ni bekväma med att försvara det?"]),
              pb(["The insurer asks", "Försäkringsbolaget frågar"], ["{{supplier.insurer}} asks whether the compromised account was contained as soon as it was found. “After the quarterly close” may not count as reasonable steps to limit the loss. Is a smooth close worth risking the claim?", "{{supplier.insurer}} frågar om det komprometterade kontot begränsades så snart det upptäcktes. ”Efter kvartalsbokslutet” räknas kanske inte som rimliga åtgärder för att begränsa förlusten. Är ett smidigt bokslut värt att riskera ersättningen?"])
            ]
          },
          minutes: 8
        }),
        facilitator: fac(
          ["The emotional centre of this scenario: a respected colleague is the entry point. Keep it professional, not personal.", "Scenariots känslomässiga kärna: en respekterad kollega är ingången. Håll det professionellt, inte personligt."],
          ["Sessions revoked and credentials reset quickly, with authority clearly assigned and evidence exported first.", "Sessioner återkallade och inloggningsuppgifter bytta snabbt, med tydligt mandat och spåren exporterade först."],
          [["Ask: would you treat an intern's account the same way?", "Fråga: skulle ni behandla en praktikants konto på samma sätt?"]]
        )
      },

      // ------------------------------------------------------------------------------------- p3
      {
        id: "p3",
        mandatory: true,
        clock: 300,
        title: L(["Months, not days", "Månader, inte dagar"]),
        twist: L(["The attacker has had a copy of every finance email for {{num.months}} months.", "Angriparen har haft en kopia av varje ekonomimejl i {{num.months}} månader."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The attacker has read every finance email for {{num.months}} months. If you cut the account off, you lost the chance to see what else they planned. If you watched, they had another day inside the CFO's mailbox.", sv: "Angriparen har läst varje ekonomimejl i {{num.months}} månader. Om ni stängde kontot förlorade ni chansen att se vad mer de planerade. Om ni övervakade fick de ännu ett dygn i ekonomichefens brevlåda." } },
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because every payment with changed bank details was frozen, three honest suppliers who really did change banks have not been paid, and one has stopped deliveries.", sv: "Eftersom varje betalning med ändrade bankuppgifter frystes har tre hederliga leverantörer som verkligen bytt bank inte fått betalt, och en har stoppat leveranserna." } }
        ],
        assumptionChallenged: L(["This is one fraudulent payment.", "Det här är en enskild bedräglig betalning."]),
        reveals: ["hf-rules"],
        narrative: L([
          "{{time.T+300|clock}}. The review of the CFO's mailbox is done, and it is worse than a single fraudulent email.\n\nTwo inbox rules that nobody recognises have been forwarding finance messages to an outside address, and hiding replies about bank details in a folder nobody opens. The question is no longer how one payment went wrong, but what else the attacker has read, and for how long.",
          "Klockan {{time.T+300|clock}}. Genomgången av ekonomichefens e-postlåda är klar, och det är värre än ett enda bedrägligt mejl.\n\nTvå inkorgsregler som ingen känner igen har vidarebefordrat ekonomimeddelanden till en extern adress och gömt svar om bankuppgifter i en mapp som ingen öppnar. Frågan är inte längre hur en betalning gick fel, utan vad mer angriparen har läst, och hur länge."
        ]),
        injects: [
          inj("i3-1", 300, "forensicFinding", "forensics", "critical", "confirmed", [
            "Rule 1 forwards any message containing “invoice”, “payment” or “bank” to an external address at {{asset.c2Domain}}. Rule 2 moves replies about account changes to the RSS feeds folder. Both were created {{num.months}} months ago. {{num.forwarded}} messages were forwarded.",
            "Regel 1 vidarebefordrar alla meddelanden som innehåller ”faktura”, ”betalning” eller ”bank” till en extern adress på {{asset.c2Domain}}. Regel 2 flyttar svar om kontobyten till mappen för RSS-flöden. Båda skapades för {{num.months}} månader sedan. {{num.forwarded}} meddelanden har vidarebefordrats."
          ], { headline: ["Hidden inbox rules found", "Dolda inkorgsregler hittade"], reveals: ["hf-rules"], tests: ["lo2"] }),
          inj("i3-2", 330, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“The forwarded mail includes salary questions, customer contracts and at least one sick-leave certificate. That is a personal data breach, and the clock started when we became aware of it.”",
            "”Den vidarebefordrade posten innehåller lönefrågor, kundavtal och minst ett sjukintyg. Det är en personuppgiftsincident, och fristen började löpa när vi fick kännedom om den.”"
          ], { fallbackRole: "legal", tests: ["lo2"] }),
          inj("i3-3", 350, "threatIntel", "threatIntel", "medium", "unverified", [
            "The forwarding domain appears in reports about a group that runs invoice fraud against Nordic mid-sized companies, often hitting the victim's own customers weeks later.",
            "Domänen för vidarebefordringen förekommer i rapporter om en grupp som bedriver fakturabedrägerier mot nordiska medelstora företag och ofta slår mot offrets egna kunder några veckor senare."
          ], { optional: true, statedReliability: ["Unconfirmed report", "Obekräftad uppgift"], tests: ["lo3"] })
        ],
        charts: [
          {
            id: "c3-kpi", type: "kpi",
            title: L(["What the inbox rules exposed", "Vad inkorgsreglerna exponerade"]),
            data: kpi([
              { id: "months", label: ["Months of access", "Månader med åtkomst"], value: (v) => v.months, tone: "danger" },
              { id: "mails", label: ["Finance emails forwarded", "Vidarebefordrade ekonomimejl"], value: (v) => v.forwarded, tone: "danger" },
              { id: "rules", label: ["Hidden inbox rules", "Dolda inkorgsregler"], value: 2, tone: "warn" }
            ])
          }
        ],
        questions: {
          technical: [
            q("How do you find every other mailbox with similar rules or sessions?", "Hur hittar ni alla andra e-postlådor med liknande regler eller sessioner?", ["socLead", "itOps"]),
            q("What did the attacker learn that they could use next?", "Vad har angriparen lärt sig som de kan använda härnäst?", ["ciso", "socLead"]),
            q("Was locking the account enough, given the rules forward mail regardless of sessions?", "Räckte det att låsa kontot, när reglerna vidarebefordrar post oavsett sessioner?", ["itOps", "ciso"], "d2")
          ],
          executive: [
            q("Is this now a personal data breach, and who decides on notifying {{reg.dpaShort}}?", "Är det nu en personuppgiftsincident, och vem beslutar om anmälan till {{reg.dpaShort}}?", ["dpo", "legal"]),
            q("Who else needs to know: the board, the auditor, the insurer?", "Vem mer behöver veta: styrelsen, revisorn, försäkringsbolaget?", ["ceo", "cfo"]),
            q("Looking back at your containment choice — did it buy or cost time?", "Om ni ser tillbaka på ert val för begränsning – vann eller förlorade ni tid?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The forwarded mail includes personal data about employees who do not know yet.", "Den vidarebefordrade posten innehåller personuppgifter om medarbetare som ännu inte vet om det.")],
        decision: dec("d3", "legal", ["How do you handle the personal data breach?", "Hur hanterar ni personuppgiftsincidenten?"], [
          ["Notify {{reg.dpaShort}} now and inform affected employees directly.", "Anmäl till {{reg.dpaShort}} nu och informera berörda medarbetare direkt."],
          ["Notify {{reg.dpaShort}} now, inform employees once the scope is clear.", "Anmäl till {{reg.dpaShort}} nu och informera medarbetarna när omfattningen är klar."],
          ["Report to the police and the bank now, and decide on {{reg.dpaShort}} within 72 hours, once you know whose data was in the mailbox.", "Anmäl till polisen och banken nu, och besluta om {{reg.dpaShort}} inom 72 timmar, när ni vet vems uppgifter som fanns i brevlådan."]
        ], {
          knowns: [["Forwarded mail contains salary, contract and health data.", "Den vidarebefordrade posten innehåller löne-, avtals- och hälsouppgifter."]],
          uncertainties: [["Exactly which people are affected.", "Exakt vilka personer som berörs."]],
          tradeoffs: {
            operational: ["Reviewing thousands of emails takes days.", "Att gå igenom tusentals mejl tar dagar."],
            security: ["Notification does not change the technical response.", "En anmälan ändrar inte den tekniska hanteringen."],
            legal: ["Health data raises the stakes; the deadline runs from awareness.", "Hälsouppgifter höjer insatserna; fristen räknas från kännedom."],
            reputational: ["Employees will resent hearing it from someone else.", "Medarbetarna tar illa upp om de får höra det från någon annan."]
          },
          evaluation: [["Recognises the personal data dimension of a fraud case", "Ser personuppgiftsdimensionen i ett bedrägeriärende"], ["Plans communication to affected employees", "Planerar kommunikationen till berörda medarbetare"]],
          pushback: {
            A: [
              pb(["Inform whom?", "Informera vem?"], ["To inform affected employees directly you need a list, and nobody has read more than a handful of the {{num.forwarded}} forwarded emails. Tonight it is either everyone in finance, everyone in the company, or a guess. Who goes on the list, and on what basis?", "För att informera berörda medarbetare direkt behöver ni en lista, och ingen har läst mer än en handfull av de {{num.forwarded}} vidarebefordrade mejlen. I kväll blir det antingen alla på ekonomi, alla i företaget eller en gissning. Vilka hamnar på listan, och på vilken grund?"]),
              pb(["The sick-leave certificate", "Sjukintyget"], ["One employee must be told that their sick-leave certificate was sent to criminals. Their own manager does not know about the illness. Who has that conversation, and how do you inform them without exposing their health data a second time?", "En medarbetare måste få veta att hens sjukintyg har skickats till kriminella. Hens egen chef känner inte till sjukdomen. Vem tar det samtalet, och hur informerar ni utan att exponera hälsouppgifterna en gång till?"]),
              pb(["Whose mailbox?", "Vems brevlåda?"], ["The CFO asks that the letter to employees not say whose mailbox was compromised. Staff will ask anyway, and the answer will spread. Can you inform people honestly without naming the source, and who decides how much to say?", "Ekonomichefen ber att brevet till medarbetarna inte ska säga vems brevlåda som var komprometterad. Personalen kommer att fråga ändå, och svaret kommer att spridas. Kan ni informera ärligt utan att nämna källan, och vem avgör hur mycket som sägs?"])
            ],
            B: [
              pb(["Scope takes weeks", "Omfattningen tar veckor"], ["IT operations estimates that reviewing {{num.forwarded}} emails properly will take weeks. Employees whose salary and health details were forwarded may not hear for a month. Is that “without undue delay”, and would you accept it if it were your data?", "IT-driften bedömer att en ordentlig genomgång av {{num.forwarded}} mejl tar flera veckor. Medarbetare vars löne- och hälsouppgifter vidarebefordrats får kanske inte veta något på en månad. Är det ”utan onödigt dröjsmål”, och skulle ni acceptera det om det gällde era egna uppgifter?"]),
              pb(["The corridor knows", "Korridoren vet redan"], ["People in finance saw IT export the CFO's mailbox, and the rumour is already that “everyone's salaries were stolen”. Employees are asking HR directly whether they are affected. What does HR say today, while you wait for the scope?", "Folk på ekonomi såg IT exportera ekonomichefens brevlåda, och ryktet säger redan att ”allas löner har stulits”. Medarbetare frågar HR direkt om de berörs. Vad säger HR i dag, medan ni väntar på omfattningen?"]),
              pb(["The regulator calls back", "Tillsynsmyndigheten ringer tillbaka"], ["The case officer at {{reg.dpaShort}} calls the next morning: given that health data is involved, have the people affected been told? “Once the scope is clear” is not a date. What date do you give them?", "Handläggaren på {{reg.dpaShort}} ringer nästa morgon: eftersom hälsouppgifter berörs, har de drabbade informerats? ”När omfattningen är klar” är inget datum. Vilket datum ger ni?"])
            ],
            C: [
              pb(["Which clock?", "Vilken klocka?"], ["The DPO points out that the 72 hours started when the rules were found, not when you finish deciding whose data was there. Your own timetable may already run past the deadline. Are you counting from the right moment, and who checked?", "Dataskyddsombudet påpekar att 72 timmar började löpa när reglerna hittades, inte när ni är klara med att avgöra vems uppgifter som fanns där. Er egen tidplan kan redan gå förbi fristen. Räknar ni från rätt tidpunkt, och vem har kontrollerat det?"]),
              pb(["Overruling the DPO", "Att köra över dataskyddsombudet"], ["Because the forwarded mail includes health data, the DPO formally advises notifying {{reg.dpaShort}} now, not later. Choosing to wait means overruling that advice on the record. Who signs that decision, and how will it read if the regulator asks?", "Eftersom den vidarebefordrade posten innehåller hälsouppgifter rekommenderar dataskyddsombudet formellt att anmäla till {{reg.dpaShort}} nu, inte senare. Att vänta innebär att köra över det rådet till protokollet. Vem skriver under beslutet, och hur ser det ut om tillsynsmyndigheten frågar?"]),
              pb(["Still unknown at hour 71", "Fortfarande okänt vid timme 71"], ["IT operations says that in 72 hours they can read perhaps a tenth of the forwarded messages. At hour 71 you will know almost as little as now. What will you be able to decide then that you cannot decide today?", "IT-driften säger att de på 72 timmar kan läsa kanske en tiondel av de vidarebefordrade meddelandena. Vid timme 71 vet ni nästan lika lite som nu. Vad kan ni besluta då som ni inte kan besluta i dag?"])
            ]
          },
          minutes: 8
        }),
        facilitator: fac(
          ["The incident grows from a payment to a breach. Watch whether finance and security start working as one team.", "Incidenten växer från en betalning till ett intrång. Se om ekonomi och säkerhet börjar arbeta som ett team."],
          ["Tenant-wide hunt for rules and sessions, a personal data breach assessment, and the insurer and auditor informed.", "Sökning efter regler och sessioner i hela miljön, en bedömning av personuppgiftsincidenten och försäkringsbolag och revisor informerade."],
          [["Ask: if the attacker read the quarterly close, what could they do with it?", "Fråga: om angriparen har läst kvartalsbokslutet, vad kan de göra med det?"]]
        )
      },

      // ------------------------------------------------------------------------------------- p4
      {
        id: "p4",
        priority: 1,
        clock: 1380,
        title: L(["Your customers are paying the attacker", "Era kunder betalar angriparen"]),
        twist: L(["Fake invoices are now going to your customers — from your real domain.", "Falska fakturor går nu till era kunder – från er riktiga domän."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d2", option: "B" }, narrativeAppend: { en: "Because the CFO's account stayed open while you watched, the attacker used it this morning to answer two customers' questions about the new invoices.", sv: "Eftersom ekonomichefens konto stod öppet medan ni övervakade använde angriparen det i morse för att svara två kunder som frågade om de nya fakturorna." } }
        ],
        assumptionChallenged: L(["Only our own payments were affected.", "Bara våra egna betalningar har påverkats."]),
        reveals: ["hf-customers"],
        narrative: L([
          "The next day, {{time.T+1380|clock}}. Customer service has taken a string of calls since opening time.\n\nCustomers have received invoices that look exactly like yours, with your logo, real order numbers and a polite note about a new bank account. Some have already paid. The fraud has moved from your money to your customers' money.",
          "Nästa dag, klockan {{time.T+1380|clock}}. Kundtjänst har tagit emot en rad samtal sedan öppningsdags.\n\nKunder har fått fakturor som ser exakt ut som era, med er logotyp, riktiga ordernummer och en artig notis om ett nytt bankkonto. En del har redan betalat. Bedrägeriet har flyttat från era pengar till era kunders pengar."
        ]),
        injects: [
          inj("i4-1", 1380, "customerComplaint", "customer", "high", "confirmed", [
            "“We paid your invoice to the new account yesterday as instructed. Now our bank says the account belongs to a private person abroad. What is going on?”",
            "”Vi betalade er faktura till det nya kontot i går enligt instruktionen. Nu säger vår bank att kontot tillhör en privatperson utomlands. Vad är det som händer?”"
          ], { tests: ["lo3"] }),
          inj("i4-2", 1400, "forensicFinding", "soc", "critical", "confirmed", [
            "The fake invoices were sent through a misconfigured mail relay that accepts your domain without checks, so they pass basic filters. They use your real templates and correct customer numbers. {{num.customersHit}} customers are in the send log.",
            "De falska fakturorna skickades via en felkonfigurerad e-postserver som tar emot er domän utan kontroll, så de passerar enkla filter. De använder era riktiga mallar och korrekta kundnummer. {{num.customersHit}} kunder finns i utskicksloggen."
          ], { reveals: ["hf-customers"], tests: ["lo3"] }),
          inj("i4-3", 1420, "mediaEnquiry", "media", "medium", "confirmed", [
            "A business reporter: “Several of your customers say they were tricked by invoices from {{org.shortName}}. Have you been hacked?”",
            "En ekonomireporter: ”Flera av era kunder säger att de lurats av fakturor från {{org.shortName}}. Har ni blivit hackade?”"
          ], { optional: true, pressure: "media", tests: ["lo3"] })
        ],
        charts: [
          {
            id: "c4-calls", type: "bar",
            title: L(["Customer calls about invoices, per hour", "Kundsamtal om fakturor per timme"]),
            unit: L(["calls", "samtal"]),
            data: (ctx) => {
              const hours = [7, 8, 9, 10, 11, 12];
              return {
                categories: hours,
                series: [{ id: "calls", label: L(["Calls", "Samtal"]), values: hours.map((h, i) => Math.round((ctx.vars.customersHit / 8) * (1 + i * 0.6)) + ctx.rng.int(0, 3)) }]
              };
            }
          }
        ],
        questions: {
          technical: [
            q("How do you stop mail from your domain being sent from outside — today?", "Hur stoppar ni att post från er domän skickas utifrån – i dag?", ["itOps", "socLead"]),
            q("How can customers tell your real invoices from fake ones from now on?", "Hur ska kunderna kunna skilja era riktiga fakturor från falska framöver?", ["ciso", "itOps"]),
            q("Does this change the scope of the personal data notification you decided on?", "Påverkar det här omfattningen av den anmälan om personuppgiftsincident som ni beslutade om?", ["ciso"], "d3")
          ],
          executive: [
            q("Do you warn every customer now, or only those in the send log?", "Varnar ni alla kunder nu eller bara dem som finns i utskicksloggen?", ["comms", "ceo"]),
            q("Who covers a customer's loss when the invoice came from your domain?", "Vem står för en kunds förlust när fakturan kom från er domän?", ["ceo", "legal"]),
            q("Would you still describe this to the board the way you planned yesterday?", "Skulle ni fortfarande beskriva det här för styrelsen så som ni planerade i går?", ["ceo", "cfo"], "d3")
          ]
        },
        challenges: [ch("Several customers have already paid; some will hold you responsible.", "Flera kunder har redan betalat; några kommer att hålla er ansvariga.")],
        decision: dec("d4", "ceo", ["How do you warn customers?", "Hur varnar ni kunderna?"], [
          ["Warn all customers today, with a verification phone number and your real bank details.", "Varna alla kunder i dag, med ett telefonnummer för verifiering och era riktiga bankuppgifter."],
          ["Warn only the customers in the send log, discreetly.", "Varna bara kunderna i utskicksloggen, diskret."],
          ["Publish a fraud warning on the website and in the customer newsletter today, and call the twenty largest customers personally.", "Publicera en bedrägerivarning på webbplatsen och i kundnyhetsbrevet i dag, och ring de tjugo största kunderna personligen."]
        ], {
          knowns: [["Fake invoices passed filters because your mail relay trusted them.", "De falska fakturorna passerade filter eftersom er e-postserver litade på dem."]],
          uncertainties: [["How many customers have already paid.", "Hur många kunder som redan har betalat."]],
          tradeoffs: {
            operational: ["A broad warning floods customer service.", "En bred varning översvämmar kundtjänst."],
            security: ["Without warnings, more customers will pay.", "Utan varningar kommer fler kunder att betala."],
            legal: ["Your misconfigured relay weakens the claim that it was not your fault.", "Er felkonfigurerade server försvagar argumentet att det inte var ert fel."],
            reputational: ["Silence now becomes the story later.", "Tystnad nu blir nyheten senare."]
          },
          evaluation: [["Gives customers a trusted way to verify", "Ger kunderna ett pålitligt sätt att verifiera"], ["Fixes the mail relay the same day", "Rättar e-postservern samma dag"]],
          pushback: {
            A: [
              pb(["Your warning looks fraudulent", "Er varning ser bedräglig ut"], ["Your warning is an email from your domain, about invoices, containing bank details: exactly what the fake invoices look like. Several customers forward it to you asking whether it is real. How do customers know this message is the genuine one?", "Er varning är ett mejl från er domän, om fakturor, med bankuppgifter: precis så ser de falska fakturorna ut. Flera kunder vidarebefordrar den till er och frågar om den är äkta. Hur ska kunderna veta att just det här meddelandet är det riktiga?"]),
              pb(["The verification line drowns", "Verifieringslinjen dränks"], ["The verification number gets more calls in an hour than customer service takes in a week. The queue passes an hour, and some customers give up and pay the invoice they were unsure about. Who staffs the line tonight, and with what answers?", "Verifieringsnumret får fler samtal på en timme än kundtjänst tar emot på en vecka. Kön passerar en timme, och en del kunder ger upp och betalar fakturan de var osäkra på. Vem bemannar linjen i kväll, och med vilka svar?"]),
              pb(["Read by lawyers", "Läst av jurister"], ["Legal warns that telling every customer your mail system was used against them will be quoted by every customer who has already paid. The wording may read as accepting liability. Do you soften it, and does softening make the warning weaker?", "Juristen varnar för att varje kund som redan har betalat kommer att citera att ert e-postsystem användes mot dem. Formuleringen kan läsas som att ni tar på er ansvaret. Mjukar ni upp den, och blir varningen då svagare?"])
            ],
            B: [
              pb(["The log is incomplete", "Loggen är ofullständig"], ["IT operations points out that the send log only covers the misconfigured relay. If anything went out another way, those customers are invisible to you. A customer who is not on the list has just called. Do you widen the warning now?", "IT-driften påpekar att utskicksloggen bara gäller den felkonfigurerade servern. Om något gick ut på annat sätt syns de kunderna inte för er. En kund som inte finns på listan har just ringt. Breddar ni varningen nu?"]),
              pb(["“Discreet” becomes the story", "”Diskret” blir nyheten"], ["A business reporter asks why some customers were warned and others were not. “Discreetly” reads as a cover-up in print. How do you explain your choice without sounding like you are hiding the size of the problem?", "En ekonomireporter frågar varför vissa kunder varnades och andra inte. ”Diskret” låter som mörkläggning i tryck. Hur förklarar ni ert val utan att det låter som att ni döljer problemets storlek?"]),
              pb(["“When did you know?”", "”När visste ni?”"], ["A customer on the list paid yesterday. They want to know when you first knew your mail was being misused, and why the warning came today. Their next call is to their lawyer. What is your honest answer?", "En kund på listan betalade i går. De vill veta när ni först visste att er e-post missbrukades, och varför varningen kom i dag. Nästa samtal går till deras jurist. Vad är ert ärliga svar?"])
            ],
            C: [
              pb(["The smallest are hit hardest", "De minsta drabbas hårdast"], ["Most customers in the send log are small firms, not among your twenty largest. For them the loss is proportionally the worst, and all they get is a newsletter. Who calls them, and why were they not first?", "De flesta kunderna i utskicksloggen är små företag, inte bland era tjugo största. För dem är förlusten relativt sett störst, och allt de får är ett nyhetsbrev. Vem ringer dem, och varför kom de inte först?"]),
              pb(["Public before staff", "Offentligt före personalen"], ["Within an hour the reporter quotes your website warning under a headline about customers being defrauded in your name. Your own customer service learned about it from the article. Who did you just tell first, and who should it have been?", "Inom en timme citerar reportern er varning från webbplatsen under en rubrik om kunder som lurats i ert namn. Er egen kundtjänst fick veta det genom artikeln. Vem berättade ni för först, och vem borde det ha varit?"]),
              pb(["The big customers freeze", "De stora kunderna fryser"], ["Two of the largest customers you called personally thank you, then put every payment to you on hold “until further notice”. Your warning just stopped your own cash flow. What do you tell them that lets them pay you again safely?", "Två av de största kunderna ni ringde personligen tackar, och pausar sedan alla betalningar till er ”tills vidare”. Er varning stoppade just ert eget kassaflöde. Vad säger ni som gör att de kan betala er igen på ett säkert sätt?"])
            ]
          },
          minutes: 8
        }),
        facilitator: fac(
          ["The harm has moved outside the organisation. Look for empathy towards customers, not only damage control.", "Skadan har flyttat utanför organisationen. Se efter empati mot kunderna, inte bara skadebegränsning."],
          ["Proactive warning with a verification channel, the relay fixed and domain-authentication records enforced.", "Proaktiv varning med en kanal för verifiering, servern rättad och domänautentisering skärpt."],
          [["Ask: if you were the customer, what would you want to hear today?", "Fråga: om ni var kunden, vad skulle ni vilja höra i dag?"]]
        )
      },

      // ------------------------------------------------------------------------------------- p5
      {
        id: "p5",
        priority: 2,
        clock: 1620,
        title: L(["The recall window", "Fristen för återkallelse"]),
        twist: L(["Most of the money is already gone; only part can still be frozen.", "Merparten av pengarna är redan borta; bara en del kan fortfarande frysas."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The bank says the recall window closed at midnight. Your first hour decided how much can still be frozen, and the supplier now threatens to stop deliveries over the blocked payments.", sv: "Banken säger att fönstret för återkallelse stängde vid midnatt. Er första timme avgjorde hur mycket som fortfarande kan frysas, och leverantören hotar nu att stoppa leveranserna på grund av de spärrade betalningarna." } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because employees were told directly, one forwarded the letter to a journalist. The story is now running ahead of your own statement.", sv: "Eftersom medarbetarna informerades direkt skickade en av dem brevet vidare till en journalist. Nyheten ligger nu före ert eget uttalande." } }
        ],
        assumptionChallenged: L(["The bank will get the money back.", "Banken kommer att få tillbaka pengarna."]),
        reveals: ["hf-funds"],
        narrative: L([
          "{{time.T+1620|clock}}. The receiving bank has finally answered your bank's recall request, and the answer decides how much of the loss is real.\n\nThe insurer wants a loss estimate by the end of the day, and it will ask exactly how the bank change was approved. What you write now will be compared with the facts later.",
          "Klockan {{time.T+1620|clock}}. Mottagarbanken har till slut svarat på er banks begäran om återkallelse, och svaret avgör hur stor förlusten faktiskt blir.\n\nFörsäkringsbolaget vill ha en uppskattning av förlusten före dagens slut, och det kommer att fråga exakt hur bytet av bankkonto godkändes. Det ni skriver nu kommer senare att jämföras med fakta."
        ]),
        injects: [
          inj("i5-1", 1620, "email", "bank", "high", "confirmed", [
            "“The receiving bank has frozen {{num.frozenAmount|currency}}, about {{num.frozenPct}} % of the payment. The rest left the account within 36 hours of arrival. A police report is required before any funds can be returned.”",
            "”Mottagarbanken har fryst {{num.frozenAmount|currency}}, ungefär {{num.frozenPct}} % av betalningen. Resten lämnade kontot inom 36 timmar efter ankomsten. En polisanmälan krävs innan några medel kan återbetalas.”"
          ], { headline: ["Recall result", "Resultat av återkallelsen"], reveals: ["hf-funds"], tests: ["lo1"] }),
          inj("i5-2", 1640, "email", "insurer", "medium", "confirmed", [
            "{{supplier.insurer}}: “Social-engineering losses are covered up to a sub-limit, provided payment changes were verified by phone with a known contact. Please confirm whether that was done.”",
            "{{supplier.insurer}}: ”Förluster genom social manipulation ersätts upp till ett delbelopp, förutsatt att ändrade betalningsuppgifter verifierades per telefon med en känd kontaktperson. Bekräfta om det gjordes.”"
          ], { tests: ["lo1", "lo4"] }),
          inj("i5-3", 1660, "phoneTranscript", "police", "medium", "confirmed", [
            "{{reg.police|cap}}: “File the report today and include the receiving account details and the email headers. These groups use many mule accounts; quick reports help us link cases.”",
            "{{reg.police|cap}}: ”Gör anmälan i dag och bifoga uppgifterna om mottagarkontot och mejlhuvudena. De här grupperna använder många penningmulekonton; snabba anmälningar hjälper oss att koppla ihop ärenden.”"
          ], { optional: true, pressure: "lawEnforcement", tests: ["lo1"] })
        ],
        charts: [
          {
            id: "c5-kpi", type: "kpi",
            title: L(["The money", "Pengarna"]),
            data: kpi([
              { id: "paid", label: ["Paid to the fraudster", "Betalat till bedragaren"], value: (v) => v.amount, format: "currency", tone: "danger" },
              { id: "frozen", label: ["Frozen by the receiving bank", "Fryst av mottagarbanken"], value: (v) => v.frozenAmount, format: "currency", tone: "ok" },
              { id: "customers", label: ["Customers invoiced by the attacker", "Kunder som angriparen fakturerat"], value: (v) => v.customersHit, tone: "warn" }
            ])
          }
        ],
        questions: {
          technical: [
            q("What evidence does the police report need, and who prepares it?", "Vilka spår behöver polisanmälan, och vem tar fram dem?", ["socLead", "itOps"]),
            q("Which payment controls failed, and which would have stopped this?", "Vilka betalningskontroller brast, och vilka hade stoppat det här?", ["ciso", "cfo"]),
            q("Did your first-hour decision affect how much could be frozen?", "Påverkade ert beslut under första timmen hur mycket som kunde frysas?", ["cfo"], "d1")
          ],
          executive: [
            q("The insurer asks whether you verified by phone. What is the honest answer, and who gives it?", "Försäkringsbolaget frågar om ni verifierade per telefon. Vad är det ärliga svaret, och vem lämnar det?", ["cfo", "legal"]),
            q("Who carries the loss that insurance will not cover?", "Vem bär den förlust som försäkringen inte täcker?", ["ceo", "cfo"]),
            q("Does what you told customers this morning still hold?", "Håller det ni sa till kunderna i morse fortfarande?", ["comms", "ceo"], "d4")
          ]
        },
        challenges: [ch("Your process required phone verification, but it was done by replying to the email.", "Er rutin krävde verifiering per telefon, men den gjordes genom att svara på mejlet.")],
        decision: dec("d5", "cfo", ["What do you report to the insurer?", "Vad rapporterar ni till försäkringsbolaget?"], [
          ["The full facts, including that verification was done by email, not phone.", "Alla fakta, inklusive att verifieringen gjordes via mejl, inte per telefon."],
          ["Report the loss now and the details later, after legal review.", "Anmäl förlusten nu och detaljerna senare, efter juridisk granskning."],
          ["Hold the claim for a week: the policy requires phone verification you did not do, and a rejected claim follows you into next year's premium.", "Vänta en vecka med anmälan: villkoren kräver telefonverifiering som ni inte gjorde, och en avslagen skada följer med in i nästa års premie."]
        ], {
          knowns: [["About {{num.frozenPct}} % is frozen.", "Ungefär {{num.frozenPct}} % är fryst."]],
          uncertainties: [["Whether the insurer will accept the claim.", "Om försäkringsbolaget godtar anspråket."]],
          tradeoffs: {
            operational: ["Claims work takes finance staff away from the close.", "Arbetet med anspråket tar ekonomipersonal från bokslutet."],
            security: ["Honest reporting improves controls; hiding it preserves them as they are.", "Ärlig rapportering förbättrar kontrollerna; att dölja det bevarar dem som de är."],
            legal: ["Misrepresenting facts to an insurer is a serious risk in itself.", "Att ge en felaktig bild till ett försäkringsbolag är en allvarlig risk i sig."],
            reputational: ["Auditors and the board will learn the facts either way.", "Revisorer och styrelse får veta fakta i vilket fall som helst."]
          },
          evaluation: [["Reports facts accurately even when unflattering", "Rapporterar fakta korrekt även när de är obekväma"], ["Files the police report promptly", "Gör polisanmälan skyndsamt"]],
          pushback: {
            A: [
              pb(["The claim wobbles", "Anspråket vacklar"], ["Within hours the claims handler replies that, on the facts you gave, cover for the payment loss is “under review” and may be reduced. Most of the {{num.amount|currency}} could now fall on the company. Who explains that to the board, and do you still stand by the full account?", "Inom några timmar svarar skadehandläggaren att ersättningen för betalningsförlusten, utifrån de fakta ni lämnat, är ”under prövning” och kan sättas ned. Det mesta av {{num.amount|currency}} kan nu hamna på företaget. Vem förklarar det för styrelsen, och står ni fortfarande för hela redogörelsen?"]),
              pb(["A name in the report", "Ett namn i rapporten"], ["The full facts include the name of the clerk who confirmed by replying to the email. The clerk is distraught and asks whether they will lose their job. The process allowed it, not one person. How do you report the facts without making one person the scapegoat?", "Alla fakta innefattar namnet på handläggaren som bekräftade genom att svara på mejlet. Hen är förtvivlad och frågar om hen kommer att förlora jobbet. Det var rutinen som tillät det, inte en enskild person. Hur rapporterar ni fakta utan att göra en person till syndabock?"]),
              pb(["Legal wants the pen", "Juristen vill hålla i pennan"], ["Legal asks that nothing goes to the insurer before they have reviewed the wording: facts written in a hurry can give away arguments you may need later. Waiting for legal delays the claim. Do you send today, or let legal shape it first?", "Juristen ber att inget skickas till försäkringsbolaget innan formuleringen granskats: fakta som skrivs i hast kan ge bort argument ni kan behöva senare. Att vänta på juristen fördröjer anspråket. Skickar ni i dag, eller låter ni juristen forma texten först?"])
            ],
            B: [
              pb(["The one question", "Den enda frågan"], ["The claims handler calls and asks just one thing: was the bank change verified by phone with a known contact? Legal review is not finished. What does the person on the phone say, right now?", "Skadehandläggaren ringer och frågar bara en sak: verifierades bytet av bankkonto per telefon med en känd kontaktperson? Den juridiska granskningen är inte klar. Vad säger personen i telefonen, just nu?"]),
              pb(["Two reports, one story", "Två anmälningar, en historia"], ["The police report you file today must include the email headers and how the change was approved. The insurer can ask for that report. The facts will be in one document before the other. Are your two reports going to tell the same story?", "Polisanmälan ni gör i dag måste innehålla mejlhuvudena och hur bytet godkändes. Försäkringsbolaget kan begära ut den anmälan. Fakta kommer att stå i det ena dokumentet före det andra. Kommer era två anmälningar att berätta samma historia?"]),
              pb(["How late is “later”?", "Hur sent är ”senare”?"], ["Nobody has said how long legal review will take, and the auditor will see a claim filed without the one fact that matters most. The longer the gap, the more it looks deliberate. Who decides when “later” is, and what is the date?", "Ingen har sagt hur lång tid den juridiska granskningen tar, och revisorn kommer att se ett anspråk utan det enda faktum som betyder mest. Ju längre glappet blir, desto mer ser det avsiktligt ut. Vem bestämmer när ”senare” är, och vilket datum gäller?"])
            ],
            C: [
              pb(["Late is its own problem", "Sent är ett problem i sig"], ["The policy also requires prompt notice of a loss. A week's delay could reduce cover on its own, regardless of the phone check. You may lose the claim for the very reason you waited. Is that a risk you have weighed?", "Försäkringen kräver också att en förlust anmäls skyndsamt. En veckas dröjsmål kan i sig sätta ned ersättningen, oavsett telefonkontrollen. Ni kan förlora anspråket just på grund av att ni väntade. Är det en risk ni har vägt in?"]),
              pb(["Legal will not sign", "Juristen skriver inte under"], ["Legal says that holding a claim to avoid a known condition could be seen as concealment, and refuses to put their name to the plan. The CFO owns this decision. Who carries it if legal walks away?", "Juristen säger att hålla inne ett anspråk för att undvika ett känt villkor kan ses som döljande, och vägrar sätta sitt namn på planen. Ekonomichefen äger beslutet. Vem bär det om juristen kliver av?"]),
              pb(["The clerk will not stay silent", "Handläggaren tänker inte tiga"], ["The accounts payable clerk who confirmed by email asks HR whether they should contact the insurer themselves. They do not want to be part of hiding anything. What do you tell an employee who refuses to keep quiet about your plan?", "Handläggaren på leverantörsreskontran som bekräftade via mejl frågar HR om hen själv borde kontakta försäkringsbolaget. Hen vill inte vara del av att dölja något. Vad säger ni till en medarbetare som vägrar tiga om er plan?"])
            ]
          },
          minutes: 8
        }),
        facilitator: fac(
          ["Integrity under pressure: the insurance question tempts the room to shade the truth.", "Integritet under press: försäkringsfrågan frestar gruppen att skönmåla sanningen."],
          ["Accurate reporting to the insurer, a same-day police report and an honest internal control review.", "Korrekt rapportering till försäkringsbolaget, polisanmälan samma dag och en ärlig granskning av de interna kontrollerna."],
          [["Ask: what would the auditor say if they read the claim next year?", "Fråga: vad skulle revisorn säga om hen läste anspråket nästa år?"]]
        )
      },

      // ------------------------------------------------------------------------------------- p6
      {
        id: "p6",
        priority: 3,
        clock: 4320,
        title: L(["Who investigates whom?", "Vem utreder vem?"]),
        twist: L(["The CFO asks to lead the internal review of what went wrong.", "Ekonomichefen ber om att få leda den interna utredningen av vad som gick fel."]),
        twistKind: "authority",
        reconsider: { decision: "d4", pressure: { en: "Two customers have paid the attacker since your warning went out; one says it never reached them. Another is furious that you told the whole market about a fraud that never touched them.", sv: "Två kunder har betalat angriparen sedan er varning gick ut; en säger att den aldrig nådde fram. En annan är rasande över att ni berättade för hela marknaden om ett bedrägeri som aldrig berörde dem." } },
        assumptionChallenged: L(["The senior person closest to the problem should lead the review.", "Den chef som står närmast problemet bör leda utredningen."]),
        narrative: L([
          "Three days later. The board meets tomorrow, and the audit committee wants a written account first.\n\n{{person.cfo.name}} proposes to lead the review of finance controls personally, and suggests that the mailbox findings need not be shared beyond the management team. The CFO knows the processes best. It was also the CFO's mailbox.",
          "Tre dagar senare. Styrelsen sammanträder i morgon, och revisionsutskottet vill ha en skriftlig redogörelse först.\n\n{{person.cfo.name}} föreslår att personligen leda granskningen av ekonomikontrollerna, och menar att fynden i e-postlådan inte behöver delas utanför ledningsgruppen. Ekonomichefen känner processerna bäst. Det var också ekonomichefens e-postlåda."
        ]),
        injects: [
          inj("i6-1", 4320, "executiveMessage", "person.cfo", "medium", "confirmed", [
            "“I know these processes better than anyone. I'll lead the review and present it to the board myself. There's no need to put my mailbox in the board papers.”",
            "”Jag känner de här processerna bättre än någon annan. Jag leder granskningen och presenterar den för styrelsen själv. Det finns ingen anledning att lägga min e-postlåda i styrelsehandlingarna.”"
          ], { tests: ["lo4"] }),
          inj("i6-2", 4340, "email", "management", "medium", "confirmed", [
            "The chair of the audit committee: “Please send a written account of the incident, the losses and the control failures before tomorrow's meeting, including who was responsible for which control.”",
            "Ordföranden i revisionsutskottet: ”Skicka en skriftlig redogörelse för incidenten, förlusterna och kontrollbristerna före morgondagens möte, inklusive vem som ansvarade för vilken kontroll.”"
          ], { tests: ["lo4"] }),
          inj("i6-3", 4360, "employeeReport", "employee", "low", "disputed", [
            "A colleague in accounts payable says they raised concerns about email-only bank changes six months ago and were told it would slow things down.",
            "En kollega på leverantörsreskontran säger att hen tog upp riskerna med bankbyten via enbart mejl för sex månader sedan och fick höra att det skulle sakta ner arbetet."
          ], { optional: true, facilitatorNote: ["Disputed: no written record exists. Watch whether the group protects the person raising it.", "Omstritt: det finns ingen skriftlig dokumentation. Se om gruppen skyddar personen som tar upp det."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which technical evidence must reach the board unedited?", "Vilka tekniska spår måste nå styrelsen oredigerade?", ["ciso", "socLead"]),
            q("What controls would prevent a repeat: authentication, mail rules, payment verification?", "Vilka kontroller skulle förhindra en upprepning: autentisering, e-postregler, betalningsverifiering?", ["ciso", "itOps"]),
            q("Looking back at how you contained the CFO's account, what would you change?", "Om ni ser tillbaka på hur ni begränsade ekonomichefens konto – vad skulle ni ändra?", ["ciso"], "d2")
          ],
          executive: [
            q("Who should lead the review, and how do you manage the conflict of interest?", "Vem bör leda granskningen, och hur hanterar ni jävet?", ["ceo", "legal"]),
            q("How do you protect the employee who raised concerns earlier?", "Hur skyddar ni medarbetaren som tog upp riskerna tidigare?", ["ceo", "legal"]),
            q("Do your decisions on customers and the insurer still read well in front of the board?", "Står sig era beslut om kunderna och försäkringsbolaget inför styrelsen?", ["ceo", "cfo"], "d5")
          ]
        },
        challenges: [ch("The CFO is respected, under strain, and in the room.", "Ekonomichefen är respekterad, pressad och sitter i rummet.")],
        decision: dec("d6", "ceo", ["Who leads the review?", "Vem leder granskningen?"], [
          ["An independent reviewer reporting to the audit committee; the CFO contributes as a witness.", "En oberoende granskare som rapporterar till revisionsutskottet; ekonomichefen bidrar som uppgiftslämnare."],
          ["The CISO leads, with the CFO responsible for finance controls.", "Informationssäkerhetschefen leder, med ekonomichefen ansvarig för ekonomikontrollerna."],
          ["The CFO leads the review of the finance process, with internal audit checking the conclusions.", "Ekonomichefen leder granskningen av ekonomiprocessen, och internrevisionen granskar slutsatserna."]
        ], {
          knowns: [["The CFO's account was the entry point.", "Ekonomichefens konto var ingången."]],
          uncertainties: [["Whether earlier warnings were ignored.", "Om tidigare varningar ignorerades."]],
          tradeoffs: {
            operational: ["An independent review takes longer.", "En oberoende granskning tar längre tid."],
            security: ["Self-review tends to miss the uncomfortable findings.", "Självgranskning brukar missa de obekväma fynden."],
            legal: ["Conflicts of interest weaken the review's credibility.", "Jäv försvagar granskningens trovärdighet."],
            reputational: ["The board will ask why the person involved led the review.", "Styrelsen kommer att fråga varför den inblandade ledde granskningen."]
          },
          evaluation: [["Separates the review from the people under review", "Skiljer granskningen från dem som granskas"], ["Treats individuals fairly — accountability without scapegoating", "Behandlar individer rättvist – ansvar utan syndabockar"]],
          pushback: {
            A: [
              pb(["“A vote of no confidence”", "”Ett misstroende”"], ["The CFO reads the decision as a vote of no confidence and asks, in front of the room, whether they should resign before the board meets. Nobody had planned that conversation for tonight. What do you say, and who says it?", "Ekonomichefen tolkar beslutet som ett misstroende och frågar, inför hela rummet, om hen borde avgå före styrelsemötet. Ingen hade planerat det samtalet i kväll. Vad säger ni, och vem säger det?"]),
              pb(["Not by tomorrow", "Inte till i morgon"], ["No independent reviewer can be appointed and briefed before tomorrow's board meeting, and the audit committee still wants a written account first. Someone has to write it tonight. If not the CFO, who, and how independent will that be?", "Ingen oberoende granskare hinner utses och sättas in före morgondagens styrelsemöte, och revisionsutskottet vill ändå ha en skriftlig redogörelse först. Någon måste skriva den i kväll. Om inte ekonomichefen, vem, och hur oberoende blir det?"]),
              pb(["The reviewer wants everything", "Granskaren vill ha allt"], ["The reviewer asks for full access to the CFO's mailbox and interviews with all of accounts payable. The CFO says the mailbox also holds private and unrelated mail. Where do you draw the line, and who decides it?", "Granskaren begär full åtkomst till ekonomichefens brevlåda och intervjuer med hela leverantörsreskontran. Ekonomichefen säger att brevlådan också innehåller privat och orelaterad post. Var drar ni gränsen, och vem bestämmer det?"])
            ],
            B: [
              pb(["The CISO's controls too", "Även informationssäkerhetschefens kontroller"], ["A stolen session got past MFA, and nobody noticed hidden inbox rules for {{num.months}} months. Those were security controls. The CISO would be reviewing their own gaps as well as the CFO's. Is that the independence the audit committee is asking for?", "En stulen session tog sig förbi MFA, och ingen märkte dolda inkorgsregler på {{num.months}} månader. Det var säkerhetskontroller. Informationssäkerhetschefen skulle granska sina egna brister lika mycket som ekonomichefens. Är det den oberoende granskning revisionsutskottet ber om?"]),
              pb(["Finance still reviews finance", "Ekonomi granskar fortfarande ekonomi"], ["With the CFO responsible for the finance controls, the payment step that failed is still examined by the person in charge of it. Staff in accounts payable will be interviewed by their own manager's manager. Will they speak freely?", "När ekonomichefen ansvarar för ekonomikontrollerna granskas betalningssteget som brast fortfarande av den som ansvarar för det. Personalen på leverantörsreskontran intervjuas av sin egen chefs chef. Kommer de att tala fritt?"]),
              pb(["The chair is not convinced", "Ordföranden är inte övertygad"], ["The chair of the audit committee replies within the hour: neither lead is independent of the failures, and they want to know why an outside reviewer was not chosen. They expect an answer before the meeting. What do you tell them?", "Ordföranden i revisionsutskottet svarar inom en timme: ingen av de ansvariga är oberoende av bristerna, och hen vill veta varför ni inte valde en extern granskare. Hen vill ha svar före mötet. Vad säger ni?"])
            ],
            C: [
              pb(["Who checks the checkers?", "Vem granskar granskarna?"], ["The head of internal audit mentions, quietly, that their budget and annual appraisal are set by the CFO. They will be checking conclusions written by the person who reviews them. How much weight will the board give that check?", "Internrevisionens chef nämner i förtroende att deras budget och årliga bedömning bestäms av ekonomichefen. De ska granska slutsatser skrivna av den som granskar dem. Hur stor vikt kommer styrelsen att lägga vid den kontrollen?"]),
              pb(["What the review won't hear", "Det granskningen inte får höra"], ["A colleague in accounts payable tells you privately that they will not share what they know with a review led by the CFO. If one person will not speak, others may not either. What else will this review never hear?", "En kollega på leverantörsreskontran säger i förtroende att hen inte tänker dela det hen vet med en granskning som leds av ekonomichefen. Om en person tiger kan fler göra det. Vad mer kommer granskningen aldrig att få höra?"]),
              pb(["The mailbox left out", "Brevlådan utelämnad"], ["The CFO's draft scope covers the payment process but leaves out the mailbox findings, as the CFO proposed. The board would read about a process failure without its entry point. Do you accept that scope, and who checks that nothing else was trimmed?", "Ekonomichefens utkast till avgränsning omfattar betalningsprocessen men utelämnar fynden i brevlådan, precis som ekonomichefen föreslog. Styrelsen skulle läsa om ett processfel utan att få veta var det började. Accepterar ni den avgränsningen, och vem kontrollerar att inget annat har strukits?"])
            ]
          },
          minutes: 10
        }),
        facilitator: fac(
          ["Close on governance and fairness. The aim is accountability, not blame; keep the CFO's dignity intact.", "Avsluta med styrning och rättvisa. Målet är ansvarstagande, inte skuldbeläggning; låt ekonomichefen behålla sin värdighet."],
          ["An independent review, full disclosure to the audit committee and protection for the employee who raised concerns.", "En oberoende granskning, full redovisning för revisionsutskottet och skydd för medarbetaren som tog upp riskerna."],
          [["Ask: how would this look if the CFO were not in the room?", "Fråga: hur skulle det här se ut om ekonomichefen inte satt i rummet?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Part of the money is recovered; the rest is a loss shared with the insurer. Payment changes now require a call-back to a known number, and finance mailboxes are protected with phishing-resistant MFA and rule monitoring.",
        "En del av pengarna återvinns; resten blir en förlust som delas med försäkringsbolaget. Ändrade betalningsuppgifter kräver nu återuppringning till ett känt nummer, och ekonomiavdelningens e-postlådor skyddas med nätfiskeresistent MFA och bevakning av regler."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Bank changes must be verified out of band, by calling a number you already had.", "Bankbyten måste verifieras via en annan kanal, genom att ringa ett nummer ni redan hade."]),
        L(["Time is the most valuable asset in payment fraud: call the bank first, investigate second.", "Tid är den viktigaste tillgången vid betalningsbedrägerier: ring banken först, utred sedan."]),
        L(["Session theft bypasses MFA; phishing-resistant methods and token revocation matter.", "Stulna sessioner kringgår MFA; nätfiskeresistenta metoder och återkallelse av token spelar roll."]),
        L(["Inbox rules are a classic, quiet persistence technique — monitor them.", "Inkorgsregler är en klassisk, tyst metod för att behålla åtkomst – bevaka dem."]),
        L(["Reviews must be independent of the people involved.", "Granskningar måste vara oberoende av de inblandade."])
      ],
      assumptionsVsReality: [
        avr(["The supplier was hacked.", "Leverantören var hackad."], ["The CFO's mailbox was compromised for months.", "Ekonomichefens e-postlåda hade varit komprometterad i månader."], "p2"),
        avr(["One bad payment.", "En felaktig betalning."], ["Every finance email forwarded for months.", "Varje ekonomimejl vidarebefordrat i månader."], "p3"),
        avr(["Only we were affected.", "Bara vi drabbades."], ["Customers were defrauded in our name.", "Kunder blev lurade i vårt namn."], "p4"),
        avr(["The bank will get it back.", "Banken får tillbaka pengarna."], ["Only part could be frozen.", "Bara en del kunde frysas."], "p5")
      ],
      strengthsToLookFor: [
        L(["Calling the bank within the first hour", "Att ringa banken inom den första timmen"]),
        L(["Acting on a senior account without hesitation", "Att agera på en chefs konto utan tvekan"]),
        L(["Honest reporting to the insurer and the board", "Ärlig rapportering till försäkringsbolag och styrelse"])
      ],
      commonGaps: [
        L(["Treating it as an accounting problem, not a security incident", "Att behandla det som ett redovisningsproblem, inte en säkerhetsincident"]),
        L(["Missing the personal data dimension", "Att missa personuppgiftsdimensionen"]),
        L(["Letting the involved executive steer the review", "Att låta den inblandade chefen styra granskningen"])
      ],
      suggestedActions: [
        act(["Require call-back verification to a known number for every change of bank details.", "Kräv återuppringning till ett känt nummer vid varje ändring av bankuppgifter."], "cfo", "high"),
        act(["Roll out phishing-resistant MFA for finance and executive accounts.", "Inför nätfiskeresistent MFA för ekonomi- och chefskonton."], "ciso", "high"),
        act(["Alert on new inbox forwarding and hiding rules.", "Larma på nya inkorgsregler som vidarebefordrar eller gömmer post."], "socLead", "high"),
        act(["Enforce domain authentication and fix open mail relays.", "Skärp domänautentiseringen och rätta öppna e-postservrar."], "itOps", "medium"),
        act(["Give staff a protected way to raise control concerns.", "Ge personalen ett skyddat sätt att ta upp brister i kontroller."], "legal", "medium")
      ]
    }
  });
})();
