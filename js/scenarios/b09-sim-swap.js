/*
 * b09-sim-swap.js — "The CFO's Phone Went Quiet" (branching, SIM swap).
 *
 * The CFO's phone loses service mid-meeting; minutes later the bank reports a
 * new device on the corporate banking account. Attackers moved the number to
 * their SIM and now receive every SMS code. Spine: no signal → the codes → the
 * payment → others → police and bank → approvals → the money → a second
 * attempt → the carrier contract → the board. Alternative: new numbers for
 * every executive. Break-away at approvals: a "recovery agent".
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b09-sim-swap",
    version: 1,
    format: "branching",
    category: "sim-swap",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "sim-swap",
    title: L(["The CFO's Phone Went Quiet", "Ekonomichefens telefon tystnade"]),
    summary: L([
      "In the middle of a meeting the CFO's phone loses service. Ten minutes later the bank asks why a new device was added to the company's account.",
      "Mitt under ett möte tappar ekonomichefens telefon täckningen. Tio minuter senare frågar banken varför en ny enhet har lagts till på företagets konto."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise a SIM swap and act within minutes", "Känna igen en SIM-kapning och agera inom några minuter"]) },
      { id: "lo2", text: L(["Stop and recall a fraudulent payment", "Stoppa och återkalla en bedräglig betalning"]) },
      { id: "lo3", text: L(["Remove SMS from critical authentication and approvals", "Ta bort sms från kritisk inloggning och attestering"]) },
      { id: "lo4", text: L(["Work with a telecom carrier under pressure", "Samarbeta med en teleoperatör under tidspress"]) }
    ],
    mitre: ["T1451", "T1111", "T1078", "T1098", "T1657"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.AA", "PR.AT", "DE.AE", "RS.MA", "RS.MI"],
      iso27001: ["A.5.16", "A.5.17", "A.5.19", "A.5.24", "A.5.26", "A.8.5"]
    },
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: payment fraud through intercepted SMS codes", "Ekonomisk: betalningsbedrägeri via uppfångade sms-koder"]), capability: "medium" },
    variables: {
      transfer: { min: 150000, max: 6000000, scaleBy: "size", step: 10000, currency: true },
      recoveredPct: { min: 40, max: 85 },
      execs: { min: 2, max: 5 }
    },
    roles: ["incidentCommander", "cfo", "ceo", "ciso", "socLead", "itOps", "legal", "comms", "supplierManager", "hr"],

    flags: {
      assumedFault: L(["Assumed a network fault", "Antog ett nätfel"]),
      paymentsFrozen: L(["Corporate payments frozen at once", "Företagets betalningar frysta direkt"]),
      smsRemoved: L(["SMS codes removed as a sign-in method", "Sms-koder borttagna som inloggningsmetod"]),
      portLock: L(["Executive numbers locked at the carrier", "Chefernas nummer låsta hos operatören"]),
      recallStarted: L(["Payment recall started within hours", "Återkallelse av betalningen startad inom några timmar"]),
      reported: L(["Reported to the police and the bank", "Anmält till polisen och banken"])
    },

    start: "c1",
    pages: [
      pg("c1", ["No signal", "Ingen täckning"], [
        "{{time.T+0|clock}}. {{person.cfo.name}}'s phone shows “No SIM” during the budget meeting. At {{time.T+10|clock}} an email from {{supplier.bank}}: “A new device was registered for your corporate online banking.”",
        "Klockan {{time.T+0|clock}}. {{person.cfo.name}}s telefon visar ”Inget SIM” under budgetmötet. Klockan {{time.T+10|clock}} kommer ett mejl från {{supplier.bank}}: ”En ny enhet har registrerats för er företagsbank.”"
      ], {
        injects: [
          inj("b9-1", 10, "email", "bank", "high", "confirmed", [
            "A new device was registered for corporate online banking user {{person.cfo.firstName}}. If this was not you, contact us immediately.",
            "En ny enhet har registrerats för företagsbankens användare {{person.cfo.firstName}}. Om det inte var du, kontakta oss omedelbart."
          ], { headline: ["Security notice from the bank", "Säkerhetsmeddelande från banken"], meta: { from: "security@{{supplier.bank.domain}}", subject: L(["New device registered", "Ny enhet registrerad"]) }, tests: ["lo1"] })
        ],
        discuss: [q("What else does the CFO's phone number unlock?", "Vad mer låser ekonomichefens telefonnummer upp?", ["ciso", "cfo"])],
        facilitator: { notes: L(["Lost signal plus a new bank device equals SIM swap until proven otherwise. Minutes matter.", "Tappad täckning plus en ny bankenhet betyder SIM-kapning tills motsatsen är bevisad. Minuterna räknas."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Treats it as a SIM swap and freezes payments before anything else.", "Behandlar det som en SIM-kapning och fryser betalningarna före allt annat."], [
          opt(["Call the bank's fraud line and freeze payments", "Ring bankens bedrägerilinje och frys betalningarna"], "c2", ["Stops the money first.", "Stoppar pengarna först."], { set: "paymentsFrozen" }),
          opt(["Restart the phone; probably a network fault", "Starta om telefonen; troligen ett nätfel"], "c2", ["Ten more minutes for the attacker.", "Tio minuter till för angriparen."], { set: "assumedFault" }),
          opt(["Call the carrier to get the number back", "Ring operatören för att få tillbaka numret"], "c2", ["Necessary, and slower than the bank.", "Nödvändigt, och långsammare än banken."])
        ])
      }),

      pg("c2", ["The codes", "Koderna"], [
        "{{person.socLead.name}} sees it in the logs: SMS codes for the CFO's email and the bank are being used from an unknown device.",
        "{{person.socLead.name}} ser det i loggarna: sms-koder för ekonomichefens e-post och banken används från en okänd enhet."
      ], {
        variants: [vr("assumedFault", [
          "While the phone was being restarted, someone reset the CFO's email password with an SMS code. {{person.socLead.name}} sees mail rules being created.",
          "Medan telefonen startades om återställde någon ekonomichefens e-postlösenord med en sms-kod. {{person.socLead.name}} ser att e-postregler skapas."
        ], ["Because it was taken for a network fault, the attacker got into the mailbox.", "Eftersom det togs för ett nätfel kom angriparen in i brevlådan."])],
        injects: [
          inj("b9-2", 25, "authLog", "siem", "critical", "confirmed", [
            "{{person.cfo.email}} · password reset via SMS code · sign-in from new device · inbox rule created: forward messages containing 'payment'.",
            "{{person.cfo.email}} · lösenord återställt via sms-kod · inloggning från ny enhet · inkorgsregel skapad: vidarebefordra meddelanden som innehåller 'betalning'."
          ], { tests: ["lo3"] })
        ],
        choice: ask(["How do you cut the attacker off?", "Hur stänger ni ute angriparen?"], ["Removes SMS as a factor and revokes sessions, so the stolen number stops working.", "Tar bort sms som faktor och återkallar sessioner, så att det stulna numret slutar fungera."], [
          opt(["Revoke sessions and replace SMS with an app or key", "Återkalla sessioner och ersätt sms med app eller nyckel"], "l1", ["Makes the stolen number useless for sign-in.", "Gör det stulna numret oanvändbart för inloggning."], { set: "smsRemoved" }),
          opt(["Reset the CFO's password", "Återställ ekonomichefens lösenord"], "l1", ["The attacker resets it again with the next SMS code.", "Angriparen återställer det igen med nästa sms-kod."]),
          opt(["Lock the CFO's account completely", "Lås ekonomichefens konto helt"], "l1", ["Effective. The CFO is offline during the budget week.", "Effektivt. Ekonomichefen är utan konto under budgetveckan."])
        ])
      }),

      pg("l1", ["The carrier", "Operatören"], [
        "{{person.supplierManager.name}} reaches the carrier: the number was moved after a call from “the CFO”, who knew the personal identity number and the last invoice amount.",
        "{{person.supplierManager.name}} når operatören: numret flyttades efter ett samtal från ”ekonomichefen”, som kunde personnumret och senaste fakturabeloppet."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you ask the carrier for?", "Vad begär ni av operatören?"], ["Gets every executive number locked against porting now.", "Får varje chefsnummer låst mot flytt nu."], [
          opt(["A port-out lock and PIN on every executive number today", "Spärr mot flytt och PIN-kod på varje chefsnummer i dag"], "c3", ["Closes the method for the rest of the team.", "Stänger metoden för resten av ledningen."], { set: "portLock" }),
          opt(["A formal complaint after the incident", "Ett formellt klagomål efter incidenten"], "c3", ["Fair, and too late to help today.", "Rimligt, och för sent för att hjälpa i dag."])
        ])
      }),

      pg("c3", ["The payment", "Betalningen"], [
        "Treasury finds it: an urgent payment of {{num.transfer|currency}} was approved by SMS from the CFO's number forty minutes ago.",
        "Finansavdelningen hittar den: en brådskande betalning på {{num.transfer|currency}} attesterades via sms från ekonomichefens nummer för fyrtio minuter sedan."
      ], {
        variants: [vr("paymentsFrozen", [
          "Treasury finds an urgent payment of {{num.transfer|currency}}, approved by SMS from the CFO's number. Because payments were frozen, the bank is holding it.",
          "Finansavdelningen hittar en brådskande betalning på {{num.transfer|currency}}, attesterad via sms från ekonomichefens nummer. Eftersom betalningarna frystes håller banken inne den."
        ], ["Because you froze payments first, the money hasn't left yet.", "Eftersom ni frös betalningarna först har pengarna inte lämnat banken ännu."])],
        chart: { id: "b9-money", type: "kpi", title: L(["The payment", "Betalningen"]), data: kpi([
          { id: "k1", label: ["Amount", "Belopp"], value: (v) => v.transfer, format: "currency", tone: "danger" },
          { id: "k2", label: ["Minutes since approval", "Minuter sedan attest"], value: 40, tone: "warn" }
        ]) },
        discuss: [q("Who at the bank can recall a payment, and how fast?", "Vem på banken kan återkalla en betalning, och hur snabbt?", ["cfo"])],
        choice: ask(["What do you do about the payment?", "Vad gör ni med betalningen?"], ["Starts a recall immediately; hours decide whether money comes back.", "Startar en återkallelse omedelbart; timmar avgör om pengarna kommer tillbaka."], [
          opt(["Ask the bank to recall it now", "Be banken återkalla den nu"], "c4", ["The best chance of getting it back.", "Den bästa chansen att få tillbaka pengarna."], { set: "recallStarted" }),
          opt(["Investigate internally first", "Utred internt först"], "c4", ["The money moves on while you investigate.", "Pengarna flyttas vidare medan ni utreder."]),
          opt(["Call the receiving bank yourselves", "Ring den mottagande banken själva"], "c4", ["They will only act on a request from your bank.", "De agerar bara på begäran från er bank."])
        ])
      }),

      pg("c4", ["Others", "Fler"], [
        "{{num.execs}} more executives report “No SIM” within the hour.",
        "{{num.execs}} chefer till rapporterar ”Inget SIM” inom en timme."
      ], {
        choice: ask(["How do you treat it?", "Hur hanterar ni det?"], ["Recognises a campaign and protects every target at once.", "Känner igen en kampanj och skyddar alla måltavlor på en gång."], [
          opt(["A campaign: carrier fraud team for all, remove their SMS sign-in", "En kampanj: operatörens bedrägeriteam för alla, ta bort deras sms-inloggning"], "l2", ["Matches the attacker's scale.", "Motsvarar angriparens omfattning."], { set: "smsRemoved" }),
          opt(["Handle each executive as they report it", "Hantera varje chef när de hör av sig"], "l2", ["Always one step behind.", "Alltid ett steg efter."]),
          opt(["Give every executive a new number today", "Ge varje chef ett nytt nummer i dag"], "c4b", ["Clean break, messy logistics.", "Ett rent snitt, rörig logistik."])
        ])
      }),

      pg("c4b", ["New numbers", "Nya nummer"], [
        "New numbers solve the SIM problem and create another: banks, suppliers and the board can't reach anyone to verify anything.",
        "Nya nummer löser SIM-problemet och skapar ett annat: banker, leverantörer och styrelsen når ingen för att verifiera något."
      ], {
        choice: ask(["How do you tell people?", "Hur berättar ni det?"], ["Registers new numbers through verified channels, not by email.", "Registrerar de nya numren via verifierade kanaler, inte via e-post."], [
          opt(["Register new numbers with banks through verified channels", "Registrera de nya numren hos bankerna via verifierade kanaler"], "l2", ["Slow and safe.", "Långsamt och säkert."], { set: "smsRemoved" }),
          opt(["Email everyone the new numbers", "Mejla alla de nya numren"], "l2", ["The attacker reads the CFO's email.", "Angriparen läser ekonomichefens e-post."])
        ])
      }),

      pg("l2", ["How they knew", "Hur de visste"], [
        "The executives' identity numbers, home addresses and phone contracts appear in a data broker's database and an old breach from another company.",
        "Chefernas personnummer, hemadresser och telefonabonnemang finns i en dataförmedlares databas och i ett gammalt intrång hos ett annat företag."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about exposure?", "Vad gör ni åt exponeringen?"], ["Reduces what attackers can learn and assumes the rest is known.", "Minskar vad angripare kan få veta och utgår från att resten redan är känt."], [
          opt(["Brief executives and reduce public information", "Informera cheferna och minska den offentliga informationen"], "c5", ["Helps a little; the rest must be designed around.", "Hjälper lite; resten måste hanteras med teknik."]),
          opt(["Nothing to be done about public data", "Inget att göra åt offentliga uppgifter"], "c5", ["True, and a reason to stop trusting knowledge as proof of identity.", "Sant, och ett skäl att sluta lita på kunskap som bevis på identitet."])
        ])
      }),

      pg("c5", ["Police and bank", "Polis och bank"], [
        "{{person.legal.name}} asks whether to file reports with {{reg.police}} and the bank's fraud team.",
        "{{person.legal.name}} frågar om ni ska anmäla till {{reg.police}} och bankens bedrägeriavdelning."
      ], {
        choice: ask(["Do you report?", "Anmäler ni?"], ["Reports promptly; recalls and insurance depend on it.", "Anmäler snabbt; återkallelser och försäkring hänger på det."], [
          opt(["Report to both today", "Anmäl till båda i dag"], "l3", ["Required for recall and insurance.", "Krävs för återkallelse och försäkring."], { set: "reported" }),
          opt(["Avoid publicity; handle it internally", "Undvik publicitet; hantera det internt"], "l3", ["Recalls and claims will stall.", "Återkallelser och anspråk kommer att stanna av."])
        ])
      }),

      pg("l3", ["A journalist calls", "En journalist ringer"], [
        "A financial reporter has heard that executives at {{org.name}} were targeted. Is the company's money safe?",
        "En ekonomireporter har hört att chefer på {{org.name}} har utsatts. Är företagets pengar säkra?"
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you say?", "Vad säger ni?"], ["Gives a short, factual statement without operational detail.", "Ger ett kort, sakligt uttalande utan operativa detaljer."], [
          opt(["A short factual statement", "Ett kort sakligt uttalande"], "c6", ["Ends the speculation.", "Avslutar spekulationerna."]),
          opt(["No comment", "Ingen kommentar"], "c6", ["Invites speculation.", "Bjuder in till spekulationer."])
        ])
      }),

      pg("c6", ["The approvals", "Attesterna"], [
        "Every payment approval in the company relies on an SMS code to the approver's phone.",
        "Varje betalningsattest i företaget bygger på en sms-kod till attestantens telefon."
      ], {
        discuss: [q("What would a safe payment approval look like here?", "Hur skulle en säker betalningsattest se ut här?", ["cfo", "ciso"])],
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Removes SMS from approvals and adds a call-back to a known number for unusual payments.", "Tar bort sms från attester och lägger till återuppringning till ett känt nummer för ovanliga betalningar."], [
          opt(["App or hardware approvals, plus call-back for unusual payments", "Attest med app eller hårdvara, plus återuppringning för ovanliga betalningar"], "c7", ["Fixes the method, not just this case.", "Rättar metoden, inte bara det här fallet."]),
          opt(["Add a second SMS approver", "Lägg till en andra sms-attestant"], "c7", ["Two phones to swap instead of one.", "Två telefoner att kapa i stället för en."]),
          opt(["Keep it as it is", "Behåll det som det är"], "c7", ["Same door, same attackers.", "Samma dörr, samma angripare."]),
          opt(["Hire a “recovery agent” who promises to get the money back", "Anlita en ”återvinningsagent” som lovar att få tillbaka pengarna"], "x1", ["Who found whom?", "Vem hittade vem?"])
        ])
      }),

      pg("c7", ["The money", "Pengarna"], [
        "The recipient account emptied within an hour. The bank traces the money through three further accounts.",
        "Mottagarkontot tömdes inom en timme. Banken spårar pengarna genom ytterligare tre konton."
      ], {
        variants: [vr("recallStarted", [
          "Because the recall started within the hour, the bank froze funds in the second account: {{num.recoveredPct}} percent comes back.",
          "Eftersom återkallelsen startade inom en timme kunde banken frysa medel på det andra kontot: {{num.recoveredPct}} procent kommer tillbaka."
        ])],
        choice: ask(["What about the loss?", "Vad gör ni med förlusten?"], ["Claims under insurance with full documentation.", "Begär ersättning från försäkringen med fullständig dokumentation."], [
          opt(["Insurance claim with the bank's documentation", "Försäkringsanspråk med bankens dokumentation"], "l4", ["The orderly route.", "Den ordnade vägen."]),
          opt(["Pursue the carrier for damages", "Kräv operatören på skadestånd"], "l4", ["Possible, and slow.", "Möjligt, och långsamt."])
        ])
      }),

      pg("l4", ["Everyone else", "Alla andra"], [
        "Most staff also sign in with SMS codes. The attackers know the method works here.",
        "De flesta anställda loggar också in med sms-koder. Angriparna vet att metoden fungerar här."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How far do you go?", "Hur långt går ni?"], ["Moves everyone to phishing-resistant sign-in over time, starting with high-risk roles.", "Flyttar alla till nätfiskeresistent inloggning över tid, med början i högriskroller."], [
          opt(["Everyone, starting with finance and IT", "Alla, med början i ekonomi och IT"], "c8", ["A programme, not a patch.", "Ett program, inte en lapp."]),
          opt(["Executives only", "Bara ledningen"], "c8", ["Attackers will go for their assistants.", "Angriparna kommer att gå på deras assistenter."])
        ])
      }),

      pg("c8", ["A month later", "En månad senare"], [
        "The attackers try again: a call to the carrier, claiming to be the CEO.",
        "Angriparna försöker igen: ett samtal till operatören där någon utger sig för att vara vd."
      ], {
        variants: [
          vr("smsRemoved", [
            "The attackers try again and move the CEO's number. It achieves nothing: no sign-in or approval accepts SMS codes any more.",
            "Angriparna försöker igen och flyttar vd:s nummer. Det ger ingenting: ingen inloggning eller attest godtar längre sms-koder."
          ], ["Because SMS was removed from sign-in, a stolen number is worthless.", "Eftersom sms togs bort från inloggningen är ett stulet nummer värdelöst."]),
          vr("portLock", [
            "The attackers call the carrier claiming to be the CEO. Because of the port lock, the carrier asks for the PIN and refuses.",
            "Angriparna ringer operatören och utger sig för att vara vd. På grund av flyttspärren ber operatören om PIN-koden och nekar."
          ])
        ],
        choice: ask(["How do you watch for the next one?", "Hur bevakar ni nästa försök?"], ["Gets alerts on porting and SIM changes from the carrier.", "Får larm om flytt och SIM-byten från operatören."], [
          opt(["Carrier alerts on any SIM change or port request", "Larm från operatören vid varje SIM-byte eller flyttbegäran"], "c9", ["Early warning for the next attempt.", "Tidig varning för nästa försök."]),
          opt(["Nothing more", "Inget mer"], "c9", ["Hope the lock holds.", "Hoppas att spärren håller."])
        ])
      }),

      pg("c9", ["The carrier contract", "Operatörsavtalet"], [
        "The phone contracts are up for renewal.",
        "Telefonavtalen ska förnyas."
      ], {
        choice: ask(["What do you require?", "Vad kräver ni?"], ["Requires port locks, named authorised contacts and alerts in the contract.", "Kräver flyttspärrar, namngivna behöriga kontaktpersoner och larm i avtalet."], [
          opt(["Port locks, named contacts and alerts, in writing", "Flyttspärrar, namngivna kontakter och larm, skriftligt"], "c10", ["Turns lessons into terms.", "Gör lärdomar till villkor."]),
          opt(["Switch to a different carrier", "Byt till en annan operatör"], "c10", ["The new one needs the same terms.", "Den nya behöver samma villkor."])
        ])
      }),

      pg("c10", ["The board", "Styrelsen"], [
        "The board asks what this incident says about the company's security.",
        "Styrelsen frågar vad incidenten säger om företagets säkerhet."
      ], {
        choice: ask(["What is your answer?", "Vad är ert svar?"], ["Names executive identities and payment approvals as critical assets with owners.", "Pekar ut chefernas identiteter och betalningsattester som kritiska tillgångar med ägare."], [
          opt(["Executive identities and approvals are critical assets, reviewed yearly", "Chefernas identiteter och attester är kritiska tillgångar, granskade årligen"], "r-end", ["A durable answer.", "Ett hållbart svar."]),
          opt(["More security training", "Mer säkerhetsutbildning"], "r-end", ["The CFO did nothing wrong.", "Ekonomichefen gjorde inget fel."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["recallStarted", "smsRemoved", "reported"], "e1"],
          [["recallStarted", "reported"], "e2"],
          ["reported", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["A number, not a key", "Ett nummer, inte en nyckel"], [
          "Most of the money came back, SMS no longer unlocks anything, and the reports were filed on day one. The next swap a month later achieved nothing.",
          "Det mesta av pengarna kom tillbaka, sms låser inte längre upp något och anmälningarna gjordes första dagen. Nästa kapning en månad senare gav ingenting."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Money back, method open", "Pengarna tillbaka, metoden öppen"], [
          "The recall worked and the reports were filed, but SMS still unlocks sign-in and approvals. The attackers know it.",
          "Återkallelsen fungerade och anmälningarna gjordes, men sms låser fortfarande upp inloggning och attester. Angriparna vet det."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Reported, not recovered", "Anmält, inte återvunnet"], [
          "The reports were filed, but the recall came too late. The full amount is lost and insurance covers part of it after months.",
          "Anmälningarna gjordes, men återkallelsen kom för sent. Hela beloppet är förlorat och försäkringen täcker en del efter flera månader."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["Handled in silence", "Hanterat i tysthet"], [
          "Without reports, the bank could not recall the funds and the insurer refuses the claim. The loss lands on the year's result.",
          "Utan anmälningar kunde banken inte återkalla medlen och försäkringsbolaget avslår anspråket. Förlusten belastar årets resultat."
        ])
      }),

      // Break-away: the recovery agent.
      pg("x1", ["The recovery agent", "Återvinningsagenten"], [
        "The agent contacted the CFO on a business network the day after the theft. For an upfront fee, they promise to trace and return the money.",
        "Agenten kontaktade ekonomichefen via ett affärsnätverk dagen efter stölden. Mot en avgift i förskott lovar de att spåra och återbetala pengarna."
      ], {
        choice: ask(["Do you pay the fee?", "Betalar ni avgiften?"], ["Recognises recovery scams that target fraud victims.", "Känner igen återvinningsbedrägerier som riktar sig mot bedrägeriets offer."], [
          opt(["Pay the fee", "Betala avgiften"], "x2", ["Recovery scams target exactly this moment.", "Återvinningsbedrägerier riktar in sig på exakt det här ögonblicket."]),
          opt(["Pay half now", "Betala hälften nu"], "x2", ["Half a scam is still a scam.", "Ett halvt bedrägeri är fortfarande ett bedrägeri."])
        ])
      }),
      pg("x2", ["One more fee", "En avgift till"], [
        "The agent reports progress and needs a “release fee” for the bank.",
        "Agenten rapporterar framsteg och behöver en ”frisläppningsavgift” till banken."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops and checks with your own bank.", "Stannar upp och kontrollerar med er egen bank."], [
          opt(["Check with your own bank first", "Kontrollera med er egen bank först"], "x3", ["They have never heard of the agent.", "De har aldrig hört talas om agenten."]),
          opt(["Pay the release fee", "Betala frisläppningsavgiften"], "x3", ["More money gone.", "Mer pengar borta."])
        ])
      }),
      pg("x3", ["Gone", "Borta"], [
        "The agent's website disappears. The account on the business network is deleted.",
        "Agentens webbplats försvinner. Kontot på affärsnätverket raderas."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Reports both frauds and documents everything.", "Anmäler båda bedrägerierna och dokumenterar allt."], [
          opt(["Report both frauds to the police", "Anmäl båda bedrägerierna till polisen"], "x4", ["Late, and necessary.", "Sent, och nödvändigt."]),
          opt(["Write it off quietly", "Skriv av det i tysthet"], "x4", ["The auditors will ask.", "Revisorerna kommer att fråga."])
        ])
      }),
      pg("x4", ["The auditors", "Revisorerna"], [
        "The auditors ask about two unexplained payments and the original fraud.",
        "Revisorerna frågar om två oförklarade betalningar och det ursprungliga bedrägeriet."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Discloses everything.", "Redovisar allt."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only answer auditors accept.", "Det enda svar revisorer godtar."]),
          opt(["Call it consultancy", "Kalla det konsulttjänster"], "e5", ["Now it is an accounting problem too.", "Nu är det också ett redovisningsproblem."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
        ending: end(5, ["Scammed twice", "Lurade två gånger"], [
          "After the SIM swap came a recovery scam. Two losses, an auditors' remark and a board asking how it happened twice.",
          "Efter SIM-kapningen kom ett återvinningsbedrägeri. Två förluster, en anmärkning från revisorerna och en styrelse som frågar hur det kunde hända två gånger."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Lost signal plus a new device on a bank account means SIM swap: act in minutes.", "Tappad täckning plus en ny enhet på ett bankkonto betyder SIM-kapning: agera inom några minuter."]),
        L(["A phone number is not proof of identity; remove SMS from sign-in and approvals.", "Ett telefonnummer är inget bevis på identitet; ta bort sms från inloggning och attester."]),
        L(["Payment recalls succeed in hours, not days.", "Återkallelser av betalningar lyckas inom timmar, inte dagar."]),
        L(["Fraud victims are targeted again by recovery scams.", "Bedrägerioffer utsätts igen av återvinningsbedrägerier."])
      ],
      strengthsToLookFor: [
        L(["Freezing payments first", "Att frysa betalningarna först"]),
        L(["Removing SMS as an authentication factor", "Att ta bort sms som autentiseringsfaktor"]),
        L(["Locking executive numbers at the carrier", "Att låsa chefernas nummer hos operatören"])
      ],
      commonGaps: [
        L(["Assuming a network fault", "Att anta ett nätfel"]),
        L(["Resetting a password that SMS can reset again", "Att återställa ett lösenord som sms kan återställa igen"]),
        L(["Trusting a recovery agent", "Att lita på en återvinningsagent"])
      ],
      suggestedActions: [
        act(["Replace SMS codes with app or hardware authentication for all approvers.", "Ersätt sms-koder med app eller hårdvara för alla attestanter."], "ciso", "high"),
        act(["Port-lock all executive and finance numbers.", "Flyttspärra alla nummer för ledning och ekonomi."], "supplierManager", "high"),
        act(["Agree a payment-recall procedure with the bank.", "Kom överens med banken om en rutin för återkallelse av betalningar."], "cfo", "medium")
      ]
    }
  });
})();
