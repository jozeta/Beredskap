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
      { id: "lo1", text: L(["Recognise a SIM swap and act within minutes", "Känna igen en SIM-kapning och agera inom några minuter"]), teaser: L(["Minutes that matter", "Minuter som spelar roll"]) },
      { id: "lo2", text: L(["Stop and recall a fraudulent payment", "Stoppa och återkalla en bedräglig betalning"]), teaser: L(["Getting money back", "Att få tillbaka pengar"]) },
      { id: "lo3", text: L(["Remove SMS from critical authentication and approvals", "Ta bort sms från kritisk inloggning och attestering"]), teaser: L(["How you prove who someone is", "Hur ni bevisar vem någon är"]) },
      { id: "lo4", text: L(["Work with a telecom carrier under pressure", "Samarbeta med en teleoperatör under tidspress"]), teaser: L(["Depending on someone else's help", "Att vara beroende av någon annans hjälp"]) }
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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. In the middle of the budget meeting, {{person.cfo.name}} glances at their phone. It shows “No SIM”, with no signal and no calls.\n\nTen minutes later, at {{time.T+10|clock}}, an email arrives from {{supplier.bank}}: “A new device was registered for your corporate online banking.” Nobody in the meeting registered anything. Someone else now receives the CFO's text messages.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Mitt under budgetmötet tittar {{person.cfo.name}} på sin telefon. Den visar ”Inget SIM”, utan täckning och utan samtal.\n\nTio minuter senare, klockan {{time.T+10|clock}}, kommer ett mejl från {{supplier.bank}}: ”En ny enhet har registrerats för er företagsbank.” Ingen på mötet har registrerat något. Någon annan tar nu emot ekonomichefens sms."
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
        "{{person.socLead.name}} sees it in the logs. The one-time codes sent by text message to the CFO's number, for email sign-in and for the bank, are being used from an unknown device.\n\nWhoever has the number can reset passwords and approve logins as if they were the CFO. The phone in the CFO's hand is now just a camera.",
        "{{person.socLead.name}} ser det i loggarna. Engångskoderna som skickas med sms till ekonomichefens nummer, för inloggning i e-posten och i banken, används från en okänd enhet.\n\nDen som har numret kan återställa lösenord och godkänna inloggningar som om de vore ekonomichefen. Telefonen i ekonomichefens hand är nu bara en kamera."
      ], {
        variants: [vr("assumedFault", [
          "While the phone was being restarted, someone reset the CFO's email password using a code sent by text message.\n\n{{person.socLead.name}} watches new mail rules being created in the CFO's inbox: anything mentioning “payment” is forwarded to an outside address. Restarting the phone did nothing. The number is somewhere else.",
          "Medan telefonen startades om återställde någon ekonomichefens e-postlösenord med en kod som skickades via sms.\n\n{{person.socLead.name}} ser nya regler skapas i ekonomichefens inkorg: allt som nämner ”betalning” vidarebefordras till en extern adress. Att starta om telefonen hjälpte inte. Numret finns någon annanstans."
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
        "{{person.supplierManager.name}} gets through to the mobile carrier's fraud desk. The CFO's number was moved to a new SIM card after a phone call from someone claiming to be the CFO.\n\nThe caller knew the CFO's personal identity number and the amount on the last phone bill. That was enough for the carrier. Any of your executives' numbers could be moved the same way.",
        "{{person.supplierManager.name}} når mobiloperatörens bedrägeriavdelning. Ekonomichefens nummer flyttades till ett nytt SIM-kort efter ett samtal från någon som påstod sig vara ekonomichefen.\n\nDen som ringde kunde ekonomichefens personnummer och beloppet på den senaste telefonräkningen. Det räckte för operatören. Vilken som helst av era chefers nummer kan flyttas på samma sätt."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you ask the carrier for?", "Vad begär ni av operatören?"], ["Gets every executive number locked against porting now.", "Får varje chefsnummer låst mot flytt nu."], [
          opt(["A port-out lock and PIN on every executive number today", "Spärr mot flytt och PIN-kod på varje chefsnummer i dag"], "c3", ["Closes the method for the rest of the team.", "Stänger metoden för resten av ledningen."], { set: "portLock" }),
          opt(["A formal complaint after the incident", "Ett formellt klagomål efter incidenten"], "c3", ["Fair, and too late to help today.", "Rimligt, och för sent för att hjälpa i dag."])
        ])
      }),

      pg("c3", ["The payment", "Betalningen"], [
        "Treasury checks the bank account and finds it: an urgent payment of {{num.transfer|currency}} to an account abroad, approved forty minutes ago with a code sent to the CFO's number.\n\nThe payment has already left. The bank's ability to recall money shrinks with every hour, because criminals move it on quickly.",
        "Finansavdelningen kontrollerar bankkontot och hittar den: en brådskande betalning på {{num.transfer|currency}} till ett konto utomlands, godkänd för fyrtio minuter sedan med en kod som skickades till ekonomichefens nummer.\n\nBetalningen har redan gått iväg. Bankens möjlighet att återkalla pengar minskar för varje timme, eftersom kriminella flyttar dem vidare snabbt."
      ], {
        variants: [vr("paymentsFrozen", [
          "Treasury finds an urgent payment of {{num.transfer|currency}} to an account abroad, approved with a code sent to the CFO's number.\n\nBecause you froze payments with the bank in the first minutes, it never left: the bank is holding it and wants to know what to do. The attacker does not know yet that it failed.",
          "Finansavdelningen hittar en brådskande betalning på {{num.transfer|currency}} till ett konto utomlands, godkänd med en kod som skickades till ekonomichefens nummer.\n\nEftersom ni frös betalningarna hos banken under de första minuterna gick den aldrig iväg: banken håller den och vill veta vad den ska göra. Angriparen vet ännu inte att det misslyckades."
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
        "Within the hour, {{num.execs}} more executives report the same thing: their phones suddenly show “No SIM”.\n\nThis is not one unlucky person. Someone is working through your management team, one number at a time, and each of those numbers unlocks email, banking or approvals.",
        "Inom en timme rapporterar ytterligare {{num.execs}} chefer samma sak: deras telefoner visar plötsligt ”Inget SIM”.\n\nDet här är inte en person som haft otur. Någon arbetar sig igenom er ledningsgrupp, ett nummer i taget, och vart och ett av numren låser upp e-post, bank eller attester."
      ], {
        choice: ask(["How do you treat it?", "Hur hanterar ni det?"], ["Recognises a campaign and protects every target at once.", "Känner igen en kampanj och skyddar alla måltavlor på en gång."], [
          opt(["A campaign: carrier fraud team for all, remove their SMS sign-in", "En kampanj: operatörens bedrägeriteam för alla, ta bort deras sms-inloggning"], "l2", ["Matches the attacker's scale.", "Motsvarar angriparens omfattning."], { set: "smsRemoved" }),
          opt(["Handle each executive as they report it", "Hantera varje chef när de hör av sig"], "l2", ["Always one step behind.", "Alltid ett steg efter."]),
          opt(["Give every executive a new number today", "Ge varje chef ett nytt nummer i dag"], "c4b", ["Clean break, messy logistics.", "Ett rent snitt, rörig logistik."])
        ])
      }),

      pg("c4b", ["New numbers", "Nya nummer"], [
        "Every executive gets a new number by the afternoon. The SIM problem is solved, and a new one appears.\n\nBanks, suppliers and the board have the old numbers. When the bank wants to verify a payment by calling back, it reaches the attacker. When the chair calls the CEO, nobody answers.",
        "Alla chefer får nya nummer under eftermiddagen. SIM-problemet är löst, och ett nytt dyker upp.\n\nBanker, leverantörer och styrelsen har de gamla numren. När banken vill verifiera en betalning genom att ringa tillbaka når den angriparen. När ordföranden ringer vd svarar ingen."
      ], {
        choice: ask(["How do you tell people?", "Hur berättar ni det?"], ["Registers new numbers through verified channels, not by email.", "Registrerar de nya numren via verifierade kanaler, inte via e-post."], [
          opt(["Register new numbers with banks through verified channels", "Registrera de nya numren hos bankerna via verifierade kanaler"], "l2", ["Slow and safe.", "Långsamt och säkert."], { set: "smsRemoved" }),
          opt(["Email everyone the new numbers", "Mejla alla de nya numren"], "l2", ["The attacker reads the CFO's email.", "Angriparen läser ekonomichefens e-post."])
        ])
      }),

      pg("l2", ["How they knew", "Hur de visste"], [
        "How did the attackers know so much? {{person.socLead.name}} finds the answer online.\n\nThe executives' personal identity numbers, home addresses and phone contracts appear in a data broker's database, and in an old breach from another company. Anyone willing to pay or search could have built the same list.",
        "Hur kunde angriparna veta så mycket? {{person.socLead.name}} hittar svaret på nätet.\n\nChefernas personnummer, hemadresser och telefonabonnemang finns i en uppgiftsmäklares databas och i ett gammalt dataintrång hos ett annat företag. Vem som helst som var villig att betala eller leta kunde ha byggt samma lista."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about exposure?", "Vad gör ni åt exponeringen?"], ["Reduces what attackers can learn and assumes the rest is known.", "Minskar vad angripare kan få veta och utgår från att resten redan är känt."], [
          opt(["Brief executives and reduce public information", "Informera cheferna och minska den offentliga informationen"], "c5", ["Helps a little; the rest must be designed around.", "Hjälper lite; resten måste hanteras med teknik."]),
          opt(["Nothing to be done about public data", "Inget att göra åt offentliga uppgifter"], "c5", ["True, and a reason to stop trusting knowledge as proof of identity.", "Sant, och ett skäl att sluta lita på kunskap som bevis på identitet."])
        ])
      }),

      pg("c5", ["Police and bank", "Polis och bank"], [
        "{{person.legal.name}} raises reporting. A police report and a formal fraud report to the bank are usually needed for any attempt to recover the money, and for the insurance claim.\n\nSome in management worry that a police report will make the incident public, and that the company will look careless.",
        "{{person.legal.name}} tar upp frågan om anmälan. En polisanmälan och en formell bedrägerianmälan till banken krävs oftast för varje försök att få tillbaka pengarna, och för försäkringsanspråket.\n\nEn del i ledningen oroar sig för att en polisanmälan gör incidenten offentlig, och att företaget kommer att framstå som slarvigt."
      ], {
        choice: ask(["Do you report?", "Anmäler ni?"], ["Reports promptly; recalls and insurance depend on it.", "Anmäler snabbt; återkallelser och försäkring hänger på det."], [
          opt(["Report to both today", "Anmäl till båda i dag"], "l3", ["Required for recall and insurance.", "Krävs för återkallelse och försäkring."], { set: "reported" }),
          opt(["Avoid publicity; handle it internally", "Undvik publicitet; hantera det internt"], "l3", ["Recalls and claims will stall.", "Återkallelser och anspråk kommer att stanna av."])
        ])
      }),

      pg("l3", ["A journalist calls", "En journalist ringer"], [
        "A financial reporter calls the press office. They have heard from a source at the carrier that executives at {{org.name}} were targeted.\n\nTheir question is simple and will be printed either way: is the company's money safe?",
        "En ekonomireporter ringer pressavdelningen. Hen har hört från en källa hos operatören att chefer på {{org.name}} har varit måltavlor.\n\nFrågan är enkel och kommer att tryckas oavsett: är företagets pengar säkra?"
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you say?", "Vad säger ni?"], ["Gives a short, factual statement without operational detail.", "Ger ett kort, sakligt uttalande utan operativa detaljer."], [
          opt(["A short factual statement", "Ett kort sakligt uttalande"], "c6", ["Ends the speculation.", "Avslutar spekulationerna."]),
          opt(["No comment", "Ingen kommentar"], "c6", ["Invites speculation.", "Bjuder in till spekulationer."])
        ])
      }),

      pg("c6", ["The approvals", "Attesterna"], [
        "The review finds the root problem. Every payment approval in the company relies on a text-message code sent to the approver's phone.\n\nWhoever controls an approver's number controls the company's money. The attackers have just shown how easily a number can be controlled.",
        "Genomgången hittar grundproblemet. Varje betalningsattest i företaget bygger på en sms-kod som skickas till attestantens telefon.\n\nDen som kontrollerar en attestants nummer kontrollerar företagets pengar. Angriparna har just visat hur lätt ett nummer kan kontrolleras."
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
        "The bank reports back. The receiving account was emptied within an hour of the payment arriving.\n\nThe bank's fraud team has traced the money through three further accounts in two countries. Getting any of it back now depends on how fast other banks act, and on the paperwork you have filed.",
        "Banken återkommer. Mottagarkontot tömdes inom en timme efter att betalningen kom in.\n\nBankens bedrägeriteam har spårat pengarna genom tre konton till i två länder. Om något kan återfås beror nu på hur snabbt andra banker agerar, och på de anmälningar ni har gjort."
      ], {
        variants: [vr("recallStarted", [
          "The bank reports back. Because the recall started within the hour, it reached the money while it was still moving.\n\nFunds were frozen in the second account in the chain: {{num.recoveredPct}} percent of the payment comes back. The rest went further than the bank could follow.",
          "Banken återkommer. Eftersom återkallelsen startade inom en timme nådde den pengarna medan de fortfarande var i rörelse.\n\nMedel frystes på det andra kontot i kedjan: {{num.recoveredPct}} procent av betalningen kommer tillbaka. Resten gick längre än banken kunde följa."
        ])],
        choice: ask(["What about the loss?", "Vad gör ni med förlusten?"], ["Claims under insurance with full documentation.", "Begär ersättning från försäkringen med fullständig dokumentation."], [
          opt(["Insurance claim with the bank's documentation", "Försäkringsanspråk med bankens dokumentation"], "l4", ["The orderly route.", "Den ordnade vägen."]),
          opt(["Pursue the carrier for damages", "Kräv operatören på skadestånd"], "l4", ["Possible, and slow.", "Möjligt, och långsamt."])
        ])
      }),

      pg("l4", ["Everyone else", "Alla andra"], [
        "The review widens. Most staff, not only executives, also sign in with text-message codes, including the people in finance and IT who have the most access.\n\nThe attackers now know the method works at {{org.name}}, and they know your phone numbers are easy to find.",
        "Genomgången vidgas. De flesta anställda, inte bara cheferna, loggar också in med sms-koder, även personerna inom ekonomi och IT som har mest åtkomst.\n\nAngriparna vet nu att metoden fungerar på {{org.name}}, och de vet att era telefonnummer är lätta att hitta."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How far do you go?", "Hur långt går ni?"], ["Moves everyone to phishing-resistant sign-in over time, starting with high-risk roles.", "Flyttar alla till nätfiskeresistent inloggning över tid, med början i högriskroller."], [
          opt(["Everyone, starting with finance and IT", "Alla, med början i ekonomi och IT"], "c8", ["A programme, not a patch.", "Ett program, inte en lapp."]),
          opt(["Executives only", "Bara ledningen"], "c8", ["Attackers will go for their assistants.", "Angriparna kommer att gå på deras assistenter."])
        ])
      }),

      pg("c8", ["A month later", "En månad senare"], [
        "A month later, the attackers try again. Someone calls the carrier claiming to be the CEO, and asks for the number to be moved to a new SIM card.\n\nThey have done their homework, as before: they know the personal identity number and the latest bill.",
        "En månad senare försöker angriparna igen. Någon ringer operatören och påstår sig vara vd, och ber att numret ska flyttas till ett nytt SIM-kort.\n\nDe har gjort sin läxa, precis som förra gången: de kan personnumret och den senaste räkningen."
      ], {
        variants: [
          vr("smsRemoved", [
            "A month later, the attackers try again. They manage to move the CEO's number to a new SIM card, just as before.\n\nThis time it achieves nothing. No sign-in and no payment approval accepts text-message codes any more, so the stolen number unlocks nothing at all.",
            "En månad senare försöker angriparna igen. De lyckas flytta vd:s nummer till ett nytt SIM-kort, precis som förra gången.\n\nDen här gången ger det ingenting. Ingen inloggning och ingen betalningsattest godtar längre sms-koder, så det stulna numret låser inte upp något alls."
          ], ["Because SMS was removed from sign-in, a stolen number is worthless.", "Eftersom sms togs bort från inloggningen är ett stulet nummer värdelöst."]),
          vr("portLock", [
            "A month later, the attackers try again. Someone calls the carrier claiming to be the CEO and asks for the number to be moved.\n\nBecause of the port lock, the carrier asks for the PIN code that only the real CEO knows. The caller cannot give it, and the carrier refuses and alerts you.",
            "En månad senare försöker angriparna igen. Någon ringer operatören, påstår sig vara vd och ber att numret ska flyttas.\n\nTack vare flyttspärren ber operatören om den pinkod som bara den riktiga vd:n känner till. Den som ringer kan inte uppge den, och operatören vägrar och larmar er."
          ])
        ],
        choice: ask(["How do you watch for the next one?", "Hur bevakar ni nästa försök?"], ["Gets alerts on porting and SIM changes from the carrier.", "Får larm om flytt och SIM-byten från operatören."], [
          opt(["Carrier alerts on any SIM change or port request", "Larm från operatören vid varje SIM-byte eller flyttbegäran"], "c9", ["Early warning for the next attempt.", "Tidig varning för nästa försök."]),
          opt(["Nothing more", "Inget mer"], "c9", ["Hope the lock holds.", "Hoppas att spärren håller."])
        ])
      }),

      pg("c9", ["The carrier contract", "Operatörsavtalet"], [
        "The company's phone contracts are up for renewal, and the carrier's account manager would like to keep the business.\n\nThis is the moment when you can ask for things the carrier normally does not offer.",
        "Företagets telefoniavtal ska förnyas, och operatörens kundansvarige vill gärna behålla affären.\n\nDet här är tillfället då ni kan begära saker som operatören normalt inte erbjuder."
      ], {
        choice: ask(["What do you require?", "Vad kräver ni?"], ["Requires port locks, named authorised contacts and alerts in the contract.", "Kräver flyttspärrar, namngivna behöriga kontaktpersoner och larm i avtalet."], [
          opt(["Port locks, named contacts and alerts, in writing", "Flyttspärrar, namngivna kontakter och larm, skriftligt"], "c10", ["Turns lessons into terms.", "Gör lärdomar till villkor."]),
          opt(["Switch to a different carrier", "Byt till en annan operatör"], "c10", ["The new one needs the same terms.", "Den nya behöver samma villkor."])
        ])
      }),

      pg("c10", ["The board", "Styrelsen"], [
        "The board asks for a final word: what does this incident say about the company's security as a whole?\n\nA phone number, something nobody had thought of as a security asset, turned out to be the key to the company's money.",
        "Styrelsen ber om ett avslutande ord: vad säger den här incidenten om företagets säkerhet som helhet?\n\nEtt telefonnummer, något som ingen hade tänkt på som en säkerhetstillgång, visade sig vara nyckeln till företagets pengar."
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

      pg("e1", ["Two months later", "Två månader senare"], ["Most of the money came back, text-message codes no longer unlock anything important, and the reports were filed on the first day.\n\nWhen the attackers swapped another number a month later, it achieved nothing. A phone number is now just a phone number, not a key.", "Det mesta av pengarna kom tillbaka, sms-koder låser inte längre upp något viktigt och anmälningarna gjordes första dagen.\n\nNär angriparna bytte ett annat nummer en månad senare gav det ingenting. Ett telefonnummer är nu bara ett telefonnummer, inte en nyckel."], {
        ending: end(1, ["A number, not a key", "Ett nummer, inte en nyckel"], [
          "Most of the money came back, SMS no longer unlocks anything, and the reports were filed on day one. The next swap a month later achieved nothing.",
          "Det mesta av pengarna kom tillbaka, sms låser inte längre upp något och anmälningarna gjordes första dagen. Nästa kapning en månad senare gav ingenting."
        ])
      }),
      pg("e2", ["Two months later", "Två månader senare"], ["The recall worked and the reports were filed properly.\n\nBut text-message codes still unlock sign-in and payment approvals for most people, and the attackers know it works here. The incident is closed; the method is still open.", "Återkallelsen fungerade och anmälningarna gjordes korrekt.\n\nMen sms-koder låser fortfarande upp inloggning och betalningsattester för de flesta, och angriparna vet att det fungerar här. Incidenten är avslutad; metoden står fortfarande öppen."], {
        ending: end(2, ["Money back, method open", "Pengarna tillbaka, metoden öppen"], [
          "The recall worked and the reports were filed, but SMS still unlocks sign-in and approvals. The attackers know it.",
          "Återkallelsen fungerade och anmälningarna gjordes, men sms låser fortfarande upp inloggning och attester. Angriparna vet det."
        ])
      }),
      pg("e3", ["Five months later", "Fem månader senare"], ["The reports were filed, but the recall came too late to catch the money.\n\nThe full amount was lost. After months of paperwork, insurance covers part of it, and the rest lands on the year's result.", "Anmälningarna gjordes, men återkallelsen kom för sent för att hinna ifatt pengarna.\n\nHela beloppet gick förlorat. Efter månader av pappersarbete täcker försäkringen en del, och resten belastar årets resultat."], {
        ending: end(3, ["Reported, not recovered", "Anmält, inte återvunnet"], [
          "The reports were filed, but the recall came too late. The full amount is lost and insurance covers part of it after months.",
          "Anmälningarna gjordes, men återkallelsen kom för sent. Hela beloppet är förlorat och försäkringen täcker en del efter flera månader."
        ])
      }),
      pg("e4", ["Five months later", "Fem månader senare"], ["Without police or bank reports, the bank could not recall the funds in time.\n\nThe insurer refuses the claim because the conditions were not met, and the full loss lands on the year's result. The board asks who decided not to report, and why.", "Utan polisanmälan eller anmälan till banken kunde banken inte återkalla medlen i tid.\n\nFörsäkringsbolaget avslår anspråket eftersom villkoren inte uppfylldes, och hela förlusten belastar årets resultat. Styrelsen frågar vem som beslutade att inte anmäla, och varför."], {
        ending: end(4, ["Handled in silence", "Hanterat i tysthet"], [
          "Without reports, the bank could not recall the funds and the insurer refuses the claim. The loss lands on the year's result.",
          "Utan anmälningar kunde banken inte återkalla medlen och försäkringsbolaget avslår anspråket. Förlusten belastar årets resultat."
        ])
      }),

      // Break-away: the recovery agent.
      pg("x1", ["The recovery agent", "Återvinningsagenten"], [
        "The day after the theft, a “recovery agent” contacted the CFO on a business networking site. They claim to specialise in tracing stolen funds through the banking system.\n\nFor an upfront fee, they promise to trace the money and return it within weeks. They have glowing testimonials and a professional website.",
        "Dagen efter stölden kontaktade en ”återvinningsagent” ekonomichefen på ett professionellt nätverk. Hen påstår sig vara specialiserad på att spåra stulna pengar genom banksystemet.\n\nMot ett förskott lovar hen att spåra pengarna och lämna tillbaka dem inom några veckor. Hen har lysande omdömen och en professionell webbplats."
      ], {
        choice: ask(["Do you pay the fee?", "Betalar ni avgiften?"], ["Recognises recovery scams that target fraud victims.", "Känner igen återvinningsbedrägerier som riktar sig mot bedrägeriets offer."], [
          opt(["Pay the fee", "Betala avgiften"], "x2", ["Recovery scams target exactly this moment.", "Återvinningsbedrägerier riktar in sig på exakt det här ögonblicket."]),
          opt(["Pay half now", "Betala hälften nu"], "x2", ["Half a scam is still a scam.", "Ett halvt bedrägeri är fortfarande ett bedrägeri."])
        ])
      }),
      pg("x2", ["One more fee", "En avgift till"], [
        "Two weeks later the agent reports good progress: the money has been located and frozen at a foreign bank.\n\nTo release it, the bank needs a “release fee”, payable to the agent's account within 48 hours.",
        "Två veckor senare rapporterar agenten goda framsteg: pengarna har hittats och frysts hos en utländsk bank.\n\nFör att frigöra dem behöver banken en ”frigörandeavgift”, som ska betalas till agentens konto inom 48 timmar."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops and checks with your own bank.", "Stannar upp och kontrollerar med er egen bank."], [
          opt(["Check with your own bank first", "Kontrollera med er egen bank först"], "x3", ["They have never heard of the agent.", "De har aldrig hört talas om agenten."]),
          opt(["Pay the release fee", "Betala frisläppningsavgiften"], "x3", ["More money gone.", "Mer pengar borta."])
        ])
      }),
      pg("x3", ["Gone", "Borta"], [
        "The agent's website disappears overnight. The profile on the business network is deleted, and the phone number no longer works.\n\nThe “recovery agent” was part of the same scheme, or another one just like it.",
        "Agentens webbplats försvinner under natten. Profilen på nätverket är raderad och telefonnumret fungerar inte längre.\n\n”Återvinningsagenten” var en del av samma upplägg, eller ett annat precis likadant."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Reports both frauds and documents everything.", "Anmäler båda bedrägerierna och dokumenterar allt."], [
          opt(["Report both frauds to the police", "Anmäl båda bedrägerierna till polisen"], "x4", ["Late, and necessary.", "Sent, och nödvändigt."]),
          opt(["Write it off quietly", "Skriv av det i tysthet"], "x4", ["The auditors will ask.", "Revisorerna kommer att fråga."])
        ])
      }),
      pg("x4", ["The auditors", "Revisorerna"], [
        "The annual audit begins. The auditors ask about two unexplained payments to a consultancy that no longer exists, and about the original fraud.\n\nThey want documentation, police reports and the board's approval for each payment.",
        "Den årliga revisionen börjar. Revisorerna frågar om två oförklarade betalningar till en konsultfirma som inte längre finns, och om det ursprungliga bedrägeriet.\n\nDe vill ha dokumentation, polisanmälningar och styrelsens godkännande för varje betalning."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Discloses everything.", "Redovisar allt."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only answer auditors accept.", "Det enda svar revisorer godtar."]),
          opt(["Call it consultancy", "Kalla det konsulttjänster"], "e5", ["Now it is an accounting problem too.", "Nu är det också ett redovisningsproblem."])
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["After the SIM swap came a recovery scam: two losses instead of one.\n\nThe auditors have added a remark to the annual report, and the board wants to understand how the company was defrauded twice in a month, the second time by people who promised to help.", "Efter SIM-bytet kom ett återvinningsbedrägeri: två förluster i stället för en.\n\nRevisorerna har lagt till en anmärkning i årsredovisningen, och styrelsen vill förstå hur företaget kunde bli lurat två gånger på en månad, andra gången av personer som lovade att hjälpa till."], {
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
