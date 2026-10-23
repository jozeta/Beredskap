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
  const { L, q, ch, inj, dec, fac, act, avr, kpi } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Act on payment fraud within the bank's recall window", "Agera på betalningsbedrägeri inom bankens frist för återkallelse"]) },
      { id: "lo2", text: L(["Scope a mailbox compromise beyond the first visible fraud", "Avgränsa ett intrång i en e-postlåda bortom det första synliga bedrägeriet"]) },
      { id: "lo3", text: L(["Protect customers and partners when your own domain is used against them", "Skydda kunder och partner när er egen domän används mot dem"]) },
      { id: "lo4", text: L(["Handle conflicts of interest and personal accountability in the response", "Hantera jäv och personligt ansvar i hanteringen"]) }
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
          ], { optional: true, tests: ["lo1"] })
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
          ["Pay the supplier again to protect the relationship, then investigate quietly.", "Betala leverantören igen för att skydda relationen och utred sedan i tysthet."]
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
          ["Treat it as financial fraud only; personal data was incidental.", "Behandla det enbart som ekonomiskt bedrägeri; personuppgifterna var en bisak."]
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
          ["Publish a general fraud warning on the website and wait for questions.", "Publicera en allmän bedrägerivarning på webbplatsen och invänta frågor."]
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
          ["Do not claim; absorb the loss to avoid scrutiny.", "Gör ingen anmälan; ta förlusten själva för att slippa granskning."]
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
          ["The CFO leads, as proposed.", "Ekonomichefen leder, enligt förslaget."]
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
