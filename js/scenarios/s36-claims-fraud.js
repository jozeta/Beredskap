/*
 * s36-claims-fraud.js — "The Storm and the Broker Portal" (archetype A, insurance).
 *
 * Two days after a severe storm, thousands of claims wait for payment → payouts on
 * genuine claims are being redirected through a broker firm's hijacked portal account
 * → genuine policyholders, some in temporary housing, received nothing → the same
 * attacker read injury claims with health data across every broker → the supervisor,
 * the reinsurer and the CEO's public 48-hour promise pull in different directions →
 * three other insurers using the same broker software are hit.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s36-claims-fraud",
    version: 1,
    category: "claims-fraud",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "claims-fraud",
    title: L(["The Storm and the Broker Portal", "Stormen och mäklarportalen"]),
    summary: L([
      "Two days after the worst storm in years, thousands of families are waiting for their insurance money. Then the fraud team notices that some of it is going somewhere else. Every hour you stop payments, real people wait; every hour you don't, the attacker is paid.",
      "Två dagar efter årets värsta storm väntar tusentals familjer på sina försäkringspengar. Då upptäcker bedrägerigruppen att en del av pengarna hamnar någon annanstans. Varje timme ni stoppar utbetalningarna får verkliga människor vänta; varje timme ni låter bli får angriparen betalt."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Balance fraud containment against harm to genuine customers", "Väga stopp av bedrägeri mot skada för verkliga kunder"]), teaser: L(["Who pays for caution", "Vem som betalar för försiktigheten"]) },
      { id: "lo2", text: L(["Contain a compromised partner without cutting off its customers", "Stänga ute en komprometterad partner utan att stänga ute dess kunder"]), teaser: L(["The door someone else holds", "Dörren som någon annan håller i"]) },
      { id: "lo3", text: L(["Recognise and notify a data breach hidden inside a fraud case", "Känna igen och anmäla en dataläcka som döljer sig i ett bedrägeriärende"]), teaser: L(["More than money", "Mer än pengar"]) },
      { id: "lo4", text: L(["Manage public promises, the supervisor and the reinsurer at once", "Hantera offentliga löften, tillsynen och återförsäkraren samtidigt"]), teaser: L(["Promises made in calmer times", "Löften som gavs i lugnare tider"]) }
    ],
    mitre: ["T1566", "T1078", "T1657", "T1213", "T1565"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.AA", "DE.AE", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.19", "A.5.21", "A.5.24", "A.5.26", "A.5.34", "A.8.5", "A.8.16"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "monday-morning", startTime: "08:10", sectors: ["insurance"] },
    actor: { types: ["criminal"], motivation: L(["Financial: redirect payouts while claims staff are overwhelmed", "Ekonomisk: avleda utbetalningar medan skadehandläggarna är överbelastade"]), capability: "medium" },
    variables: {
      claims: { min: 1500, max: 14000, scaleBy: "size", step: 100 },
      diverted: { min: 600000, max: 18000000, scaleBy: "size", step: 10000, currency: true },
      victims: { min: 40, max: 260, scaleBy: "size" },
      records: { min: 2500, max: 30000, scaleBy: "size", step: 100 },
      brokerCustomers: { min: 900, max: 6000, scaleBy: "size", step: 100 }
    },
    roles: ["incidentCommander", "ciso", "cio", "ceo", "cfo", "socLead", "itOps", "serviceOwner", "legal", "dpo", "comms", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "An administrator at a broker firm that sells {{org.name}}'s policies fell for a phishing page during the storm and gave away their portal password and one-time code. The broker portal lets brokers update a policyholder's bank details on an open claim. The attacker changed the payout account on {{num.victims}} genuine storm claims, approved for payment, to mule accounts, and used the same session to search and download injury claims, including medical certificates, for {{num.records|number}} customers across every broker. Payouts above a threshold were checked; changed bank details were not.",
        "En administratör hos en mäklarfirma som säljer {{org.name}}s försäkringar gick på en nätfiskesida under stormen och lämnade ut sitt portallösenord och sin engångskod. Mäklarportalen låter mäklare ändra en försäkringstagares bankuppgifter i ett öppet skadeärende. Angriparen bytte utbetalningskonto på {{num.victims}} äkta stormskador som var godkända för utbetalning till målvaktskonton, och använde samma session för att söka och ladda ner personskadeärenden, inklusive läkarintyg, för {{num.records|number}} kunder hos samtliga mäklare. Utbetalningar över en gräns kontrollerades; ändrade bankuppgifter gjorde det inte."
      ]),
      attackerTimeline: [
        { at: -2880, text: L(["The storm: claims volume rises tenfold.", "Stormen: antalet skadeanmälningar tiodubblas."]) },
        { at: -1500, text: L(["Broker administrator phished; portal session taken.", "Mäklarens administratör nätfiskas; portalsessionen tas över."]) },
        { at: -1200, text: L(["Bank details changed on approved storm claims.", "Bankuppgifter ändras på godkända stormskador."]) },
        { at: -900, text: L(["Injury claims searched and downloaded across brokers.", "Personskadeärenden söks och laddas ner hos alla mäklare."]) },
        { at: 0, text: L(["Fraud analyst spots the pattern.", "Bedrägerianalytikern upptäcker mönstret."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-broker", revealStage: "p2", text: L(["The portal was not breached; one broker administrator's session was taken over by phishing.", "Portalen bröts inte; en mäklaradministratörs session togs över genom nätfiske."]) },
      { id: "hf-health", revealStage: "p4", text: L(["The same session downloaded injury claims with medical certificates for customers of every broker.", "Samma session laddade ner personskadeärenden med läkarintyg för kunder hos alla mäklare."]) },
      { id: "hf-others", revealStage: "p6", text: L(["The broker firm's software supplier serves three other insurers, all hit the same way.", "Mäklarfirmans programvaruleverantör betjänar tre andra försäkringsbolag, som drabbats på samma sätt."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Money going somewhere else", "Pengar som hamnar fel"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The storm hit on Saturday. {{org.name}} has {{num.claims|number}} storm claims in the queue, the claims line has a two-hour wait, and the CEO promised on the radio yesterday that every approved claim would be paid within 48 hours.\n\n{{person.serviceOwner.name}}'s fraud analyst has found something in the payout run: dozens of approved storm claims whose bank account changed in the last day, all changed through the broker portal, all now pointing at accounts opened in the past month.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Stormen drog in i lördags. {{org.name}} har {{num.claims|number}} stormskador i kön, skadelinjen har två timmars väntetid, och vd lovade i radio i går att varje godkänd skada ska betalas ut inom 48 timmar.\n\n{{person.serviceOwner.name}}s bedrägerianalytiker har hittat något i utbetalningskörningen: dussintals godkända stormskador vars bankkonto har ändrats det senaste dygnet, alla ändrade via mäklarportalen, och alla pekar nu på konton som öppnats den senaste månaden."
        ]),
        injects: [
          inj("i1-1", 0, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Payout run 08:00: 1,140 storm claims approved. 63 with bank details changed via the broker portal in the last 24 hours; 58 of the new accounts are less than 30 days old. Next payout run: 12:00.",
            "Utbetalningskörning 08.00: 1 140 stormskador godkända. 63 med bankuppgifter ändrade via mäklarportalen det senaste dygnet; 58 av de nya kontona är yngre än 30 dagar. Nästa utbetalningskörning: 12.00."
          ], { tests: ["lo1"] }),
          inj("i1-2", 10, "chat", "person.comms", "medium", "confirmed", [
            "“Local radio is running listener calls about late storm payouts. If we stop payments today, I need something to say by eleven.”",
            "”Lokalradion tar emot lyssnarsamtal om sena stormutbetalningar. Om vi stoppar utbetalningarna i dag behöver jag något att säga till klockan elva.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which payouts can you trust, and how fast can you tell?", "Vilka utbetalningar kan ni lita på, och hur snabbt kan ni avgöra det?", ["serviceOwner", "socLead"]),
            q("Who can change a policyholder's bank details, and through which channels?", "Vem kan ändra en försäkringstagares bankuppgifter, och via vilka kanaler?", ["itOps", "serviceOwner"]),
            q("What can the bank still stop, and until when?", "Vad kan banken fortfarande stoppa, och fram till när?", ["cfo"])
          ],
          executive: [
            q("Who decides to pause storm payouts, and who has to be told first?", "Vem beslutar att pausa stormutbetalningarna, och vem måste få veta först?", ["ceo", "incidentCommander"]),
            q("What does a family in temporary housing hear if you stop today?", "Vad får en familj i tillfälligt boende höra om ni stoppar i dag?", ["comms"]),
            q("What is the 48-hour promise worth now?", "Vad är 48-timmarslöftet värt nu?", ["ceo"])
          ]
        },
        challenges: [ch("The next payout run starts at 12:00 and includes 400 more storm claims.", "Nästa utbetalningskörning startar klockan 12 och innehåller 400 fler stormskador.")],
        decision: dec("d1", "cfo", ["What do you do with the payouts?", "Vad gör ni med utbetalningarna?"], [
          ["Freeze every payout made through the broker portal until each bank account is verified by phone.", "Frys varje utbetalning som gått via mäklarportalen tills varje bankkonto är verifierat per telefon."],
          ["Freeze only payouts whose bank details changed in the last week, and let the rest of the storm money flow.", "Frys bara utbetalningar vars bankuppgifter ändrats den senaste veckan, och låt resten av stormpengarna gå ut."],
          ["Keep the 12:00 run going, and call back every changed account from this afternoon with extra staff.", "Låt körningen 12.00 gå, och ring tillbaka varje ändrat konto från i eftermiddag med extra personal."]
        ], {
          knowns: [["Dozens of approved payouts point at new accounts changed through the broker portal.", "Dussintals godkända utbetalningar pekar på nya konton som ändrats via mäklarportalen."]],
          uncertainties: [["Whether the changes are fraud, broker mistakes or both.", "Om ändringarna är bedrägeri, mäklarmisstag eller både och."]],
          tradeoffs: {
            operational: ["Phone verification of every broker payout takes days at storm volumes.", "Telefonverifiering av varje mäklarutbetalning tar dagar vid stormvolymer."],
            security: ["Every unfrozen payout to a mule account is gone within hours.", "Varje ofrusen utbetalning till ett målvaktskonto är borta inom några timmar."],
            legal: ["Delaying approved claims has its own legal and supervisory cost.", "Att fördröja godkända skador har sin egen juridiska kostnad och tillsynskostnad."],
            reputational: ["The CEO promised payment within 48 hours, on air.", "Vd lovade utbetalning inom 48 timmar, i radio."]
          },
          evaluation: [["Weighs fraud losses against harm to genuine customers, and decides before the 12:00 run", "Väger bedrägeriförluster mot skada för verkliga kunder, och beslutar före körningen klockan 12"]]
        }),
        facilitator: fac(
          ["There is no costless answer: caution stops honest payouts, speed pays the attacker. Watch whether the room decides before 12:00 or drifts.", "Det finns inget svar utan kostnad: försiktighet stoppar ärliga utbetalningar, snabbhet betalar angriparen. Se om rummet beslutar före klockan 12 eller glider."],
          ["A targeted freeze on changed bank details, a decision before the next run, and a named owner for customer contact.", "Ett riktat stopp för ändrade bankuppgifter, ett beslut före nästa körning och en utsedd ansvarig för kundkontakten."],
          [["Ask: which one fact would let you release most of the money safely?", "Fråga: vilket enda faktum skulle låta er släppa de flesta pengarna säkert?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 90,
        title: L(["One broker's keys", "En mäklares nycklar"]),
        twist: L(["The portal was not broken into. Every change came from one broker firm's administrator account, signed in from abroad since Saturday night with a valid one-time code.", "Portalen har inte brutits. Varje ändring kom från en mäklarfirmas administratörskonto, inloggat från utlandet sedan lördagskvällen med en giltig engångskod."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because every portal payout was frozen, 1,400 households waiting for storm money got nothing this morning, and the local radio station is now reading out their messages.", sv: "Eftersom varje portalutbetalning frystes fick 1 400 hushåll som väntar på stormpengar ingenting i morse, och lokalradion läser nu upp deras meddelanden." } }
        ],
        assumptionChallenged: L(["Our portal has been hacked.", "Vår portal har blivit hackad."]),
        reveals: ["hf-broker"],
        narrative: L([
          "{{time.T+90|clock}}. {{person.socLead.name}} has the portal logs. The changes did not come from a flaw in the portal: they came from one administrator account at a mid-sized broker firm, which handles about {{num.brokerCustomers|number}} of your policyholders.\n\nThe broker's administrator admits clicking a link on Saturday night, in an email that looked like your own storm-claims notice. The broker's managing director is on the phone, asking you not to cut them off: their customers are storm victims too.",
          "Klockan {{time.T+90|clock}}. {{person.socLead.name}} har portalloggarna. Ändringarna kom inte från ett fel i portalen: de kom från ett administratörskonto hos en medelstor mäklarfirma, som hanterar omkring {{num.brokerCustomers|number}} av era försäkringstagare.\n\nMäklarens administratör medger att hen klickade på en länk i lördags kväll, i ett mejl som såg ut som ert eget meddelande om stormskador. Mäklarfirmans vd är i telefon och ber er att inte stänga ute dem: deras kunder är också stormdrabbade."
        ]),
        injects: [
          inj("i2-1", 90, "authLog", "soc", "high", "confirmed", [
            "Broker portal: account admin@broker-firm.example. Sign-ins since Saturday 22:40 from three foreign addresses, one-time code accepted. 63 bank-detail changes, 412 claim file downloads, 1 new API token created Sunday 03:12.",
            "Mäklarportalen: kontot admin@broker-firm.example. Inloggningar sedan lördag 22.40 från tre utländska adresser, engångskod godkänd. 63 ändringar av bankuppgifter, 412 nedladdningar av skadeakter, 1 ny API-token skapad söndag 03.12."
          ], { reveals: ["hf-broker"], tests: ["lo2"] }),
          inj("i2-2", 100, "phoneTranscript", "person.supplierManager", "medium", "disputed", [
            "Broker MD: “We'll reset the password ourselves, right now. Please don't block us: we have three thousand customers with roofs off. It was one account, and it's handled.”",
            "Mäklarens vd: ”Vi byter lösenordet själva, nu direkt. Snälla, blockera oss inte: vi har tre tusen kunder utan tak. Det var ett konto, och det är hanterat.”"
          ], { facilitatorNote: ["Resetting the password does not remove the API token created on Sunday.", "Ett lösenordsbyte tar inte bort API-token som skapades i söndags."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What does a password reset at the broker not remove?", "Vad tar ett lösenordsbyte hos mäklaren inte bort?", ["socLead", "itOps"]),
            q("Which other broker accounts could the same phishing email have reached?", "Vilka andra mäklarkonton kan samma nätfiskemejl ha nått?", ["socLead"]),
            q("Does the payout decision you made this morning still match what you know now?", "Stämmer utbetalningsbeslutet ni fattade i morse fortfarande med det ni vet nu?", ["serviceOwner"], "d1")
          ],
          executive: [
            q("Whose risk is it when a partner's account is hijacked: theirs or yours?", "Vems risk är det när en partners konto kapas: deras eller er?", ["legal", "supplierManager"]),
            q("What do you owe the broker's customers if you cut the broker off?", "Vad är ni skyldiga mäklarens kunder om ni stänger ute mäklaren?", ["ceo"]),
            q("Was this morning's call on the payouts too cautious, or not cautious enough?", "Var morgonens beslut om utbetalningarna för försiktigt, eller inte försiktigt nog?", ["cfo"], "d1")
          ]
        },
        challenges: [ch("The broker's managing director says they will move their whole book to a competitor if you block them.", "Mäklarens vd säger att de flyttar hela sitt bestånd till en konkurrent om ni blockerar dem.")],
        decision: dec("d2", "incidentCommander", ["What do you do with the broker's access?", "Vad gör ni med mäklarens åtkomst?"], [
          ["Suspend the broker firm's portal access entirely until its accounts are rebuilt; its customers claim by phone meanwhile.", "Stäng av mäklarfirmans portalåtkomst helt tills deras konton är återuppbyggda; deras kunder anmäler per telefon under tiden."],
          ["Disable the hijacked account and its token, keep the firm's other accounts open, and require a call-back for every bank change.", "Stäng av det kapade kontot och dess token, låt firmans övriga konton vara öppna och kräv återringning för varje bankändring."],
          ["Pause bank-detail changes for every broker for 48 hours, and leave claim filing open for all.", "Pausa ändringar av bankuppgifter för alla mäklare i 48 timmar, och låt skadeanmälan vara öppen för alla."]
        ], {
          knowns: [["One broker administrator account was hijacked through phishing and used for two days.", "Ett administratörskonto hos en mäklare kapades genom nätfiske och användes i två dygn."]],
          uncertainties: [["Whether other broker accounts received the same phishing email.", "Om andra mäklarkonton fick samma nätfiskemejl."]],
          tradeoffs: {
            operational: ["Cutting the broker off pushes thousands of storm claims onto your phone lines.", "Att stänga ute mäklaren trycker över tusentals stormskador på era telefonlinjer."],
            security: ["Partial measures may miss tokens or accounts you have not found yet.", "Halva åtgärder kan missa token eller konton ni inte har hittat än."],
            legal: ["The broker agreement decides who carries the loss.", "Mäklaravtalet avgör vem som bär förlusten."],
            reputational: ["Brokers talk to each other; how you treat this one, the others will hear.", "Mäklare pratar med varandra; hur ni behandlar den här kommer de andra att höra."]
          },
          evaluation: [["Removes every way back in, including tokens, without abandoning the broker's customers", "Tar bort varje väg tillbaka in, även token, utan att överge mäklarens kunder"]]
        }),
        facilitator: fac(
          ["The broker is a victim and a risk at once. Listen for whether anyone remembers the API token.", "Mäklaren är offer och risk på samma gång. Lyssna efter om någon kommer ihåg API-token."],
          ["Revoke the account and token, check other brokers for the same email, and protect the broker's customers.", "Återkalla kontot och token, kontrollera andra mäklare efter samma mejl och skydda mäklarens kunder."],
          [["Ask: if the attacker still had a way in tonight, where would it be?", "Fråga: om angriparen fortfarande hade en väg in i kväll, var skulle den finnas?"]]
        )
      },
      {
        id: "p3",
        clock: 240,
        title: L(["The families who got nothing", "Familjerna som inte fick något"]),
        twist: L(["{{num.diverted|currency}} has already left for mule accounts, and the bank can recall only part of it. {{num.victims}} genuine policyholders have not received their storm money; some of them are in temporary housing.", "{{num.diverted|currency}} har redan gått till målvaktskonton, och banken kan bara återkalla en del. {{num.victims}} verkliga försäkringstagare har inte fått sina stormpengar; några av dem bor i tillfälliga boenden."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "{{num.victims}} families are waiting for money they were promised. If you froze broadly, honest claims are stuck with the fraud. If you kept the money flowing, part of it went to the attacker while you checked.", sv: "{{num.victims}} familjer väntar på pengar de har blivit lovade. Om ni frös brett sitter ärliga skador fast tillsammans med bedrägeriet. Om ni lät pengarna gå gick en del till angriparen medan ni kontrollerade." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the broker firm was cut off, its customers cannot file claims online, the claims line wait has passed four hours, and the broker has written to say it is reviewing its agreement.", sv: "Eftersom mäklarfirman stängdes ute kan deras kunder inte anmäla skador på nätet, väntetiden på skadelinjen har passerat fyra timmar, och mäklaren har skrivit att de ser över sitt avtal." } }
        ],
        assumptionChallenged: L(["The fraud is only our loss.", "Bedrägeriet är bara vår förlust."]),
        narrative: L([
          "{{time.T+240|clock}}. Finance has the numbers from the bank. The money that went to the new accounts was moved on within hours; a recall might recover a third, and the bank needs five working days to say how much.\n\nCustomer service has started calling the policyholders whose payouts were diverted. One of them is a family of five in a hotel room paid by the municipality, who cannot sign a rental contract until the insurance money arrives.",
          "Klockan {{time.T+240|clock}}. Ekonomi har siffrorna från banken. Pengarna som gick till de nya kontona flyttades vidare inom några timmar; en återkallelse kan kanske få tillbaka en tredjedel, och banken behöver fem arbetsdagar för att säga hur mycket.\n\nKundtjänst har börjat ringa de försäkringstagare vars utbetalningar avleddes. En av dem är en familj på fem i ett hotellrum som kommunen betalar, och som inte kan skriva på ett hyreskontrakt förrän försäkringspengarna kommer."
        ]),
        injects: [
          inj("i3-1", 240, "email", "bank", "high", "confirmed", [
            "Fraud desk: recall requests lodged for all 63 payments. Funds were transferred onward within 2–6 hours of receipt. Expected recovery is partial; confirmation within five working days.",
            "Bedrägeriavdelningen: begäran om återkallelse inlämnad för alla 63 betalningar. Medlen fördes vidare inom 2–6 timmar efter att de kom in. Förväntad återvinning är delvis; besked inom fem arbetsdagar."
          ], { tests: ["lo1"] }),
          inj("i3-2", 255, "customerComplaint", "customer", "medium", "confirmed", [
            "“You told me on Friday it was paid. My bank says nothing came. We are five people in one hotel room and the landlord won't wait. Who has my money?”",
            "”Ni sa i fredags att det var utbetalt. Min bank säger att ingenting har kommit. Vi är fem personer i ett hotellrum och hyresvärden väntar inte. Vem har mina pengar?”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you confirm the right bank account for each victim without trusting the portal?", "Hur bekräftar ni rätt bankkonto för varje drabbad utan att lita på portalen?", ["serviceOwner"]),
            q("What evidence does the bank and the police need from you, and who collects it?", "Vilka bevis behöver banken och polisen från er, och vem samlar in dem?", ["legal", "socLead"]),
            q("Did the way you handled the broker's access stop new changes?", "Stoppade ert sätt att hantera mäklarens åtkomst nya ändringar?", ["socLead"], "d2")
          ],
          executive: [
            q("Do you pay the victims again before you know what the bank can recover?", "Betalar ni de drabbade igen innan ni vet vad banken kan få tillbaka?", ["cfo", "ceo"]),
            q("Who calls the families, and what are they allowed to promise?", "Vem ringer familjerna, och vad får de lova?", ["comms", "serviceOwner"]),
            q("Looking at the broker now, was your access decision fair to their customers?", "Med mäklaren framför er nu, var ert beslut om åtkomsten rättvist mot deras kunder?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Two of the victims' new bank accounts belong to people with the same surname as the policyholder.", "Två av de drabbades nya bankkonton tillhör personer med samma efternamn som försäkringstagaren.")],
        decision: dec("d3", "cfo", ["What do you do for the policyholders who were not paid?", "Vad gör ni för försäkringstagarna som inte fick betalt?"], [
          ["Pay every one of them again today to a verified account, and absorb the loss until the recall settles.", "Betala var och en av dem igen i dag till ett verifierat konto, och bär förlusten tills återkallelsen är avgjord."],
          ["Pay again after the bank's five-day recall answer, so you do not pay twice for the same claim.", "Betala igen efter bankens besked om återkallelsen om fem dagar, så att ni inte betalar två gånger för samma skada."],
          ["Pay again today only those in emergency housing or hardship; the rest after the recall answer.", "Betala igen i dag bara dem som bor i nödboende eller har det svårt; övriga efter beskedet om återkallelsen."]
        ], {
          knowns: [["Most of the diverted money is gone; a recall will recover only part.", "De flesta avledda pengarna är borta; en återkallelse ger bara tillbaka en del."]],
          uncertainties: [["Whether every victim is genuinely a victim.", "Om varje drabbad verkligen är ett offer."]],
          tradeoffs: {
            operational: ["Verifying accounts by phone for every victim takes staff from the storm queue.", "Att verifiera konton per telefon för varje drabbad tar personal från stormkön."],
            security: ["Paying again quickly can reward an insider or an accomplice.", "Att snabbt betala igen kan belöna en insider eller en medhjälpare."],
            legal: ["The policy obliges you to pay the policyholder, not the account you were given.", "Försäkringen förpliktar er att betala försäkringstagaren, inte kontot ni fick."],
            reputational: ["The family in the hotel room is the story the radio will tell.", "Familjen i hotellrummet är historien som radion kommer att berätta."]
          },
          evaluation: [["Puts the genuine policyholder first while guarding against paying an accomplice", "Sätter den verkliga försäkringstagaren först och skyddar samtidigt mot att betala en medhjälpare"]]
        }),
        facilitator: fac(
          ["This is where the incident becomes human. The challenge about surnames tests whether speed and care can coexist.", "Här blir incidenten mänsklig. Utmaningen om efternamn prövar om snabbhet och omsorg kan gå hand i hand."],
          ["Pay the genuine victims fast through verified accounts, with a light check for accomplices.", "Betala de verkliga offren snabbt via verifierade konton, med en lätt kontroll mot medhjälpare."],
          [["Ask: what would you want if it were your roof?", "Fråga: vad skulle ni vilja om det var ert tak?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 360,
        title: L(["Medical certificates", "Läkarintyg"]),
        twist: L(["It was never only about money. The same session searched injury claims across every broker and downloaded medical certificates and treatment notes for {{num.records|number}} customers.", "Det handlade aldrig bara om pengar. Samma session sökte bland personskador hos alla mäklare och laddade ner läkarintyg och behandlingsanteckningar för {{num.records|number}} kunder."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because every victim was paid again at once, two of them turn out to have been in on the fraud: their claims were paid twice, once to the mule account and once to them.", sv: "Eftersom varje drabbad fick betalt igen på en gång visar det sig att två av dem var inblandade i bedrägeriet: deras skador har betalats två gånger, en gång till målvaktskontot och en gång till dem själva." } }
        ],
        assumptionChallenged: L(["This is a fraud case, not a data breach.", "Det här är ett bedrägeriärende, inte en personuppgiftsincident."]),
        reveals: ["hf-health"],
        narrative: L([
          "{{time.T+360|clock}}. The download log is longer than anyone expected. The broker portal lets a broker search claims across the whole company to avoid duplicates, and the attacker used that search: injury claims, sorted by size, with every attachment.\n\nThe files include medical certificates, treatment notes and, for some customers, statements about mental health after accidents. Most of the customers have nothing to do with the hijacked broker.",
          "Klockan {{time.T+360|clock}}. Nedladdningsloggen är längre än någon räknat med. Mäklarportalen låter en mäklare söka bland skador i hela bolaget för att undvika dubbletter, och angriparen använde den sökningen: personskador, sorterade efter storlek, med varje bilaga.\n\nFilerna innehåller läkarintyg, behandlingsanteckningar och för en del kunder uppgifter om psykisk hälsa efter olyckor. De flesta kunderna har ingenting med den kapade mäklaren att göra."
        ]),
        injects: [
          inj("i4-1", 360, "forensicFinding", "forensics", "critical", "confirmed", [
            "Download analysis: 412 files from the session were claim bundles, each covering many claims. Personal data of {{num.records|number}} customers, including health data (medical certificates, treatment notes). 71% of affected customers are not with the hijacked broker.",
            "Analys av nedladdningarna: 412 filer från sessionen var ärendepaket med många skador i varje. Personuppgifter för {{num.records|number}} kunder, inklusive hälsodata (läkarintyg, behandlingsanteckningar). 71 % av de berörda kunderna har inte den kapade mäklaren."
          ], { reveals: ["hf-health"], tests: ["lo3"] }),
          inj("i4-2", 375, "chat", "person.dpo", "high", "confirmed", [
            "“Health data is a special category. The 72 hours started when we could reasonably have known, and that was probably this morning, not now.”",
            "”Hälsodata är en särskild kategori. 72 timmar började löpa när vi rimligen kunde ha vetat, och det var troligen i morse, inte nu.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Why could one broker search claims across the whole company?", "Varför kunde en mäklare söka bland skador i hela bolaget?", ["itOps", "serviceOwner"]),
            q("Can you tell exactly which customers' files were opened, or only which were reachable?", "Kan ni säga exakt vilka kunders filer som öppnades, eller bara vilka som gick att nå?", ["socLead"]),
            q("Did the way you paid the victims this afternoon make the fraud harder or easier to unpick?", "Gjorde ert sätt att betala de drabbade i eftermiddags bedrägeriet lättare eller svårare att reda ut?", ["cfo"], "d3")
          ],
          executive: [
            q("Is this now a fraud case with a data breach, or a data breach with fraud?", "Är det nu ett bedrägeriärende med en dataläcka, eller en dataläcka med bedrägeri?", ["legal", "dpo"]),
            q("What do you tell a customer whose mental-health notes are in a criminal's hands?", "Vad säger ni till en kund vars anteckningar om psykisk hälsa finns hos en kriminell?", ["comms", "dpo"]),
            q("Does your decision on repaying the victims still hold, now you know more?", "Håller ert beslut om att betala de drabbade igen, nu när ni vet mer?", ["cfo"], "d3")
          ]
        },
        challenges: [ch("The fraud team argues that a public breach notice will warn the criminals before the police act.", "Bedrägerigruppen menar att ett offentligt meddelande om läckan varnar de kriminella innan polisen hinner agera.")],
        decision: dec("d4", "dpo", ["How do you notify?", "Hur anmäler och informerar ni?"], [
          ["Notify {{reg.dpaShort}} now and write to all {{num.records|number}} customers this week, with support for those whose health data was taken.", "Anmäl till {{reg.dpaShort}} nu och skriv till alla {{num.records|number}} kunder den här veckan, med stöd för dem vars hälsodata togs."],
          ["Notify {{reg.dpaShort}} now, and tell customers once forensics knows exactly whose files were opened.", "Anmäl till {{reg.dpaShort}} nu, och informera kunderna när forensikerna vet exakt vems filer som öppnades."],
          ["Notify {{reg.dpaShort}} now, and hold customer letters for a week at the police's request, so the criminals are not warned.", "Anmäl till {{reg.dpaShort}} nu, och vänta en vecka med kundbreven på polisens begäran, så att de kriminella inte varnas."]
        ], {
          knowns: [["Health data for thousands of customers was downloaded by the attacker.", "Hälsodata för tusentals kunder laddades ner av angriparen."]],
          uncertainties: [["Exactly whose files were opened, rather than only reachable.", "Exakt vems filer som öppnades, och inte bara gick att nå."]],
          tradeoffs: {
            operational: ["Writing to thousands of customers floods the same phone lines as the storm.", "Att skriva till tusentals kunder överbelastar samma telefonlinjer som stormen."],
            security: ["A public notice may tip off the criminals.", "Ett offentligt meddelande kan varna de kriminella."],
            legal: ["Health data raises the bar for informing people without undue delay.", "Hälsodata höjer kraven på att informera de berörda utan onödigt dröjsmål."],
            reputational: ["Customers who learn it from the press will not forgive the delay.", "Kunder som får veta det via pressen förlåter inte dröjsmålet."]
          },
          evaluation: [["Meets the deadline and treats health data with the care it requires, without wrecking the police case", "Håller tidsfristen och behandlar hälsodata med den omsorg som krävs, utan att förstöra polisens utredning"]]
        }),
        facilitator: fac(
          ["The room must now hold two incidents in one head. Watch whether the fraud team's argument quietly wins by default.", "Rummet måste nu hålla två incidenter i huvudet samtidigt. Se om bedrägerigruppens argument tyst vinner av bara farten."],
          ["Notify the regulator within the deadline and tell affected customers promptly, coordinating timing with the police.", "Anmäl till tillsynsmyndigheten inom tidsfristen och informera berörda kunder snabbt, med tidpunkten samordnad med polisen."],
          [["Ask: who is harmed by waiting a week, and who is protected?", "Fråga: vem skadas av att vänta en vecka, och vem skyddas?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        title: L(["Three calls before lunch", "Tre samtal före lunch"]),
        twist: L(["{{reg.supervisor|cap}} wants an incident report within 24 hours and asks whether payouts are under control. The reinsurer asks whether your storm losses are inflated by fraud. And the CEO wants to keep the 48-hour promise, publicly, whatever it takes.", "{{reg.supervisor|cap}} vill ha en incidentrapport inom 24 timmar och frågar om utbetalningarna är under kontroll. Återförsäkraren frågar om era stormförluster är uppblåsta av bedrägeri. Och vd vill hålla 48-timmarslöftet, offentligt, vad det än kostar."]),
        twistKind: "authority",
        reconsider: { decision: "d2", pressure: { en: "The supervisor asks how a partner's account could change payouts at all. Whatever you did with the broker yesterday is the first thing they will read.", sv: "Tillsynen frågar hur en partners konto över huvud taget kunde ändra utbetalningar. Det ni gjorde med mäklaren i går är det första de kommer att läsa." } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because all customers were written to this week, the claims line now carries storm callers and frightened breach callers in the same queue, and the wait has passed five hours.", sv: "Eftersom alla kunder fick brev den här veckan har skadelinjen nu både stormsamtal och oroliga samtal om läckan i samma kö, och väntetiden har passerat fem timmar." } }
        ],
        assumptionChallenged: L(["We can manage the incident and the storm separately.", "Vi kan hantera incidenten och stormen var för sig."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}, {{time.T+1440|clock}}. Three calls arrive before lunch. The supervisor's letter is short and precise. The reinsurer's claims manager is friendly and very careful with words. And the CEO, standing in the doorway, says that the company's word matters most right now: the storm money goes out within 48 hours.\n\n{{person.cfo.name}} quietly points out that keeping the promise means paying claims faster than anyone can check bank details, the very thing that let the fraud through.",
          "{{time.T+1440|weekday|cap}}, klockan {{time.T+1440|clock}}. Tre samtal kommer före lunch. Tillsynens brev är kort och exakt. Återförsäkrarens skadechef är vänlig och mycket noga med orden. Och vd, som står i dörröppningen, säger att bolagets ord är det viktigaste just nu: stormpengarna går ut inom 48 timmar.\n\n{{person.cfo.name}} påpekar stillsamt att löftet betyder att skador betalas snabbare än någon hinner kontrollera bankuppgifter, precis det som släppte igenom bedrägeriet."
        ]),
        injects: [
          inj("i5-1", 1440, "regulatorLetter", "regulator", "high", "confirmed", [
            "The supervisor requests, within 24 hours: a description of the incident, the controls over changes to payment details, the number of affected policyholders and your assessment of operational resilience during the storm.",
            "Tillsynen begär inom 24 timmar: en beskrivning av incidenten, kontrollerna över ändringar av betalningsuppgifter, antalet berörda försäkringstagare och er bedömning av den operativa motståndskraften under stormen."
          ], { tests: ["lo4"] }),
          inj("i5-2", 1460, "email", "insurer", "medium", "unverified", [
            "Reinsurer: “Before we settle the storm event, we need to understand whether any of the claimed losses are fraudulent, and what controls applied. We may need to review the claims file before payment.”",
            "Återförsäkraren: ”Innan vi reglerar stormhändelsen behöver vi förstå om någon del av de anmälda förlusterna är bedräglig, och vilka kontroller som gällde. Vi kan behöva granska skadeakten före betalning.”"
          ], { facilitatorNote: ["A reinsurer review could delay recovery of the storm losses by months.", "En granskning från återförsäkraren kan fördröja ersättningen för stormförlusterna i månader."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What control on bank-detail changes can you switch on today without stopping payouts?", "Vilken kontroll av ändrade bankuppgifter kan ni slå på i dag utan att stoppa utbetalningarna?", ["itOps", "serviceOwner"]),
            q("Can you show the reinsurer which storm claims are clean?", "Kan ni visa återförsäkraren vilka stormskador som är rena?", ["serviceOwner"]),
            q("What did your notification decision do to the claims line?", "Vad gjorde ert beslut om anmälan med skadelinjen?", ["serviceOwner"], "d4")
          ],
          executive: [
            q("Is a public promise a reason to pay faster than you can check?", "Är ett offentligt löfte ett skäl att betala snabbare än ni hinner kontrollera?", ["ceo", "cfo"]),
            q("Who speaks to the supervisor, the reinsurer and the press, and do they say the same thing?", "Vem pratar med tillsynen, återförsäkraren och pressen, och säger de samma sak?", ["comms", "legal"]),
            q("Knowing the queue now, would you tell customers about the breach in the same way?", "Med kön framför er nu, skulle ni informera kunderna om läckan på samma sätt?", ["dpo"], "d4")
          ]
        },
        challenges: [ch("A journalist asks whether the 48-hour promise is still valid, and wants an answer for the evening news.", "En journalist frågar om 48-timmarslöftet fortfarande gäller, och vill ha ett svar till kvällsnyheterna.")],
        decision: dec("d5", "ceo", ["What happens to the 48-hour promise?", "Vad händer med 48-timmarslöftet?"], [
          ["Withdraw it publicly: explain the fraud, give a realistic date, and pay hardship cases first.", "Dra tillbaka det offentligt: förklara bedrägeriet, ge ett realistiskt datum och betala dem som har det svårast först."],
          ["Keep it: add staff and overtime so every payout is checked and still sent within 48 hours.", "Håll det: lägg till personal och övertid så att varje utbetalning kontrolleras och ändå skickas inom 48 timmar."],
          ["Keep it for claims below a threshold; larger claims get a new date with a personal call.", "Håll det för skador under en gräns; större skador får ett nytt datum och ett personligt samtal."]
        ], {
          knowns: [["The promise was made before anyone knew about the fraud.", "Löftet gavs innan någon kände till bedrägeriet."]],
          uncertainties: [["How many staff can really be found for overtime during the storm.", "Hur mycket personal som verkligen kan hittas för övertid under stormen."]],
          tradeoffs: {
            operational: ["Checking every payout at storm volumes needs people you may not have.", "Att kontrollera varje utbetalning vid stormvolymer kräver folk som ni kanske inte har."],
            security: ["Speed is what let the fraud through.", "Det var snabbheten som släppte igenom bedrägeriet."],
            legal: ["The supervisor will read whatever you say publicly.", "Tillsynen kommer att läsa vad ni än säger offentligt."],
            reputational: ["A broken promise hurts; a quiet one broken hurts more.", "Ett brutet löfte skadar; ett som tyst bryts skadar mer."]
          },
          evaluation: [["Chooses an honest promise it can keep, and protects those in hardship", "Väljer ett ärligt löfte som går att hålla, och skyddar dem som har det svårast"]]
        }),
        facilitator: fac(
          ["Three legitimate authorities, three directions. The CEO's promise is the real test: who dares to contradict it?", "Tre legitima auktoriteter, tre riktningar. Vd:s löfte är det verkliga provet: vem vågar säga emot?"],
          ["A single, consistent message; a realistic promise; hardship cases first; a clear answer to the supervisor.", "Ett enda, samstämmigt budskap; ett realistiskt löfte; de som har det svårast först; ett tydligt svar till tillsynen."],
          [["Ask: what will you say in a month if you keep the promise and the fraud happens again?", "Fråga: vad säger ni om en månad om ni håller löftet och bedrägeriet händer igen?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        title: L(["Not only us", "Inte bara vi"]),
        twist: L(["A week later the police tell you that three other insurers were hit the same way, through brokers using the same broker software. Meanwhile your new call-back checks have slowed storm payouts by four days, and the complaints have reached the press.", "En vecka senare berättar polisen att tre andra försäkringsbolag har drabbats på samma sätt, via mäklare som använder samma mäklarprogram. Samtidigt har era nya återringningskontroller fördröjt stormutbetalningarna med fyra dagar, och klagomålen har nått pressen."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The bank recovered less than a third. The policyholders you paid again have their money; the ones you made wait are in the newspaper. Looking back, was your choice for the victims the right one?", sv: "Banken fick tillbaka mindre än en tredjedel. Försäkringstagarna ni betalade igen har sina pengar; de ni lät vänta står i tidningen. I efterhand, var ert val för de drabbade det rätta?" } },
        branches: [
          { when: { decision: "d5", option: "B" }, narrativeAppend: { en: "Because the 48-hour promise was kept, the claims team worked through the weekend, and two senior handlers have now called in sick.", sv: "Eftersom 48-timmarslöftet hölls arbetade skadeavdelningen hela helgen, och två erfarna handläggare har nu sjukanmält sig." } }
        ],
        assumptionChallenged: L(["We were singled out.", "Vi var utvalda."]),
        reveals: ["hf-others"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. The police investigator calls with context: the same group sent the same phishing email to brokers across the market during the storm, and three other insurers lost money the same way. The industry association wants a joint warning.\n\nAt home, the picture is mixed. The fraud has stopped. But every changed bank account now waits for a phone call, the storm backlog is four days longer, and a regional paper runs the headline “Storm victims wait while insurer checks its own security”.",
          "{{time.T+10080|weekday|cap}}. Polisens utredare ringer med ett större sammanhang: samma grupp skickade samma nätfiskemejl till mäklare över hela marknaden under stormen, och tre andra försäkringsbolag förlorade pengar på samma sätt. Branschorganisationen vill gå ut med en gemensam varning.\n\nHemma är bilden blandad. Bedrägeriet har upphört. Men varje ändrat bankkonto väntar nu på ett telefonsamtal, stormkön är fyra dagar längre, och en regiontidning kör rubriken ”Stormdrabbade väntar medan försäkringsbolaget kontrollerar sin egen säkerhet”."
        ]),
        injects: [
          inj("i6-1", 10080, "threatIntel", "police", "high", "confirmed", [
            "Police briefing: one group, one phishing campaign against brokers during the storm, four insurers affected. The common factor is the broker software's portal login, which accepts one-time codes that can be relayed.",
            "Polisens genomgång: en grupp, en nätfiskekampanj mot mäklare under stormen, fyra försäkringsbolag drabbade. Den gemensamma faktorn är inloggningen i mäklarprogrammets portal, som godtar engångskoder som kan vidarebefordras."
          ], { reveals: ["hf-others"], tests: ["lo2"] }),
          inj("i6-2", 10100, "newsHeadline", "media", "medium", "confirmed", [
            "“Storm victims wait while insurer checks its own security.” Four families describe waiting more than a week; the insurer is quoted as saying checks are ‘necessary’.",
            "”Stormdrabbade väntar medan försäkringsbolaget kontrollerar sin egen säkerhet.” Fyra familjer berättar om över en veckas väntan; bolaget citeras med att kontrollerna är ”nödvändiga”."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which controls stop this without a phone call for every change?", "Vilka kontroller stoppar det här utan ett telefonsamtal för varje ändring?", ["itOps", "ciso"]),
            q("What should brokers be able to see and change, and what not?", "Vad ska mäklare kunna se och ändra, och vad inte?", ["serviceOwner", "ciso"]),
            q("Did your treatment of the victims hold up a week later?", "Höll ert sätt att behandla de drabbade en vecka senare?", ["serviceOwner"], "d3")
          ],
          executive: [
            q("Do you join the industry warning, knowing it names you as a victim?", "Ställer ni er bakom branschvarningen, med vetskap om att den pekar ut er som drabbade?", ["ceo", "comms"]),
            q("How much friction will customers accept for safety, after a storm?", "Hur mycket krångel accepterar kunderna för säkerhetens skull, efter en storm?", ["ceo", "serviceOwner"]),
            q("Would you make the same promise again before the next storm?", "Skulle ni ge samma löfte igen före nästa storm?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("The broker software supplier says the relayed codes are the insurers' problem, not theirs.", "Leverantören av mäklarprogrammet säger att de vidarebefordrade koderna är försäkringsbolagens problem, inte deras.")],
        decision: dec("d6", "ciso", ["What do you change before the next storm?", "Vad ändrar ni före nästa storm?"], [
          ["Phishing-resistant sign-in for all brokers, verification of bank changes through the policyholder's own channel, and fraud scoring on every payout.", "Nätfiskeresistent inloggning för alla mäklare, verifiering av bankändringar via försäkringstagarens egen kanal och bedrägeribedömning av varje utbetalning."],
          ["Stronger sign-in for brokers only, and keep the call-back checks for changed accounts.", "Starkare inloggning för mäklare enbart, och behåll återringningskontrollerna för ändrade konton."],
          ["Remove bank-detail changes from the broker portal entirely: only the policyholder can change them.", "Ta bort möjligheten att ändra bankuppgifter i mäklarportalen helt: bara försäkringstagaren kan ändra dem."]
        ], {
          knowns: [["The same campaign hit four insurers through relayed one-time codes.", "Samma kampanj drabbade fyra försäkringsbolag via vidarebefordrade engångskoder."]],
          uncertainties: [["How brokers will react to losing the ability to help customers with bank changes.", "Hur mäklarna kommer att reagera på att förlora möjligheten att hjälpa kunder med bankändringar."]],
          tradeoffs: {
            operational: ["Call-back checks cost four days at storm volumes.", "Återringningskontroller kostar fyra dagar vid stormvolymer."],
            security: ["One-time codes by text or app can be relayed by a phishing page.", "Engångskoder via sms eller app kan vidarebefordras av en nätfiskesida."],
            legal: ["Broker agreements will need to change.", "Mäklaravtalen behöver ändras."],
            reputational: ["The next storm will test whatever you choose.", "Nästa storm kommer att pröva vad ni än väljer."]
          },
          evaluation: [["Removes the weakness at its root without pushing the cost onto storm victims", "Tar bort svagheten vid roten utan att lägga kostnaden på de stormdrabbade"]]
        }),
        facilitator: fac(
          ["Close on the trade-off the whole exercise has been about: safety that costs customers time.", "Avsluta med den avvägning som hela övningen har handlat om: säkerhet som kostar kunderna tid."],
          ["Fix sign-in and verification at the root, so the next storm does not need manual checks.", "Åtgärda inloggning och verifiering vid roten, så att nästa storm inte kräver manuella kontroller."],
          [["Ask: what would make the next storm both fast and safe?", "Fråga: vad skulle göra nästa storm både snabb och säker?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The fraud has stopped and the broker portal is locked down, but part of the diverted money is gone for good, health data is in criminal hands, and the next storm will test whether the new checks are fast enough.",
        "Bedrägeriet har upphört och mäklarportalen är tätad, men en del av de avledda pengarna är borta för gott, hälsodata finns hos kriminella, och nästa storm kommer att pröva om de nya kontrollerna är tillräckligt snabba."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Fraud controls and customer harm must be weighed together, and decided before the next payout run.", "Bedrägerikontroller och skada för kunderna måste vägas samman, och avgöras före nästa utbetalningskörning."]),
        L(["A partner's hijacked account is your incident; remove every way back in, including tokens.", "En partners kapade konto är er incident; ta bort varje väg tillbaka in, även token."]),
        L(["A fraud case can hide a data breach with special-category data.", "Ett bedrägeriärende kan dölja en personuppgiftsincident med känsliga uppgifter."]),
        L(["Public promises made in calm times need an honest revision in a crisis.", "Offentliga löften som gavs i lugna tider behöver en ärlig översyn i en kris."])
      ],
      assumptionsVsReality: [
        avr(["Our portal has been hacked.", "Vår portal har blivit hackad."], ["One broker's administrator was phished.", "En mäklares administratör hade nätfiskats."], "p2"),
        avr(["The fraud is only our loss.", "Bedrägeriet är bara vår förlust."], ["Genuine families went without their storm money.", "Verkliga familjer blev utan sina stormpengar."], "p3"),
        avr(["This is fraud, not a breach.", "Det här är bedrägeri, inte en läcka."], ["Health data for thousands of customers was taken.", "Hälsodata för tusentals kunder togs."], "p4")
      ],
      strengthsToLookFor: [
        L(["Deciding on payouts before the next run", "Att besluta om utbetalningarna före nästa körning"]),
        L(["Remembering the API token, not only the password", "Att komma ihåg API-token, inte bara lösenordet"]),
        L(["Putting genuine victims first while guarding against accomplices", "Att sätta de verkliga offren först och samtidigt skydda mot medhjälpare"])
      ],
      commonGaps: [
        L(["Treating the incident as purely financial", "Att behandla incidenten som enbart ekonomisk"]),
        L(["Letting the CEO's public promise decide the security question", "Att låta vd:s offentliga löfte avgöra säkerhetsfrågan"]),
        L(["Forgetting the broker's customers when cutting off the broker", "Att glömma mäklarens kunder när mäklaren stängs ute"])
      ],
      suggestedActions: [
        act(["Require phishing-resistant sign-in for every broker and partner account.", "Kräv nätfiskeresistent inloggning för varje mäklar- och partnerkonto."], "ciso", "high"),
        act(["Verify bank-detail changes through the policyholder's own channel, not the requester's.", "Verifiera ändrade bankuppgifter via försäkringstagarens egen kanal, inte beställarens."], "serviceOwner", "high"),
        act(["Limit what brokers can search and download to their own customers.", "Begränsa vad mäklare kan söka och ladda ner till sina egna kunder."], "itOps", "high"),
        act(["Prepare a storm playbook that covers fraud, customer harm and public promises together.", "Ta fram en stormplan som täcker bedrägeri, skada för kunderna och offentliga löften tillsammans."], "incidentCommander", "medium")
      ]
    }
  });
})();
