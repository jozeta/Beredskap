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
  const { L, q, ch, inj, dec, fac, act, avr, pb } = BK.scenarios.h;

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
          evaluation: [["Weighs fraud losses against harm to genuine customers, and decides before the 12:00 run", "Väger bedrägeriförluster mot skada för verkliga kunder, och beslutar före körningen klockan 12"]],
          pushback: {
            A: [
              pb(["Calls until the weekend", "Samtal till helgen"], ["Customer service has done the sums: phoning every policyholder paid through the broker portal takes until the weekend, with the same staff who are answering the storm queue. Every one of those families was promised payment within 48 hours. Do you narrow the freeze, or find callers you do not have?", "Kundtjänst har räknat: att ringa varje försäkringstagare som får betalt via mäklarportalen tar till helgen, med samma personal som svarar i stormkön. Var och en av de familjerna har lovats utbetalning inom 48 timmar. Snävar ni in stoppet, eller hittar ni personal som ni inte har?"]),
              pb(["The brokers are calling", "Mäklarna ringer"], ["Brokers whose customers' payouts are frozen are calling {{person.supplierManager.name}}: their customers are honest, and they will tell them the insurer is sitting on their storm money. Do you explain that you suspect fraud through the portal, to every broker, before you understand it?", "Mäklare vars kunders utbetalningar är frysta ringer {{person.supplierManager.name}}: deras kunder är ärliga, och de tänker berätta att försäkringsbolaget sitter på deras stormpengar. Förklarar ni för varje mäklare att ni misstänker bedrägeri via portalen, innan ni förstår det?"]),
              pb(["Which number do you call?", "Vilket nummer ringer ni?"], ["The fraud analyst points out a gap: the phone numbers on the claims could have been changed through the same portal as the bank details. Calling them may simply reach whoever changed the account, and confirm it. What do you verify against, if not the claim file?", "Bedrägerianalytikern pekar på en lucka: telefonnumren i skadeärendena kan ha ändrats via samma portal som bankuppgifterna. Att ringa dem kan bara nå den som ändrade kontot, och bekräfta det. Vad verifierar ni mot, om inte skadeakten?"])
            ],
            B: [
              pb(["Changes after the filter", "Ändringar efter filtret"], ["Your filter catches changes made up to now. Nothing stops someone changing the bank account on a claim in the next run after the filter has been applied. Do you also stop bank-detail changes in the portal, and accept what that does to genuine customers?", "Ert filter fångar ändringar som gjorts hittills. Inget hindrar att någon ändrar bankkontot på en skada i nästa körning efter att filtret har körts. Stoppar ni också ändringar av bankuppgifter i portalen, och accepterar vad det innebär för verkliga kunder?"]),
              pb(["An honest change, frozen", "En ärlig ändring, frusen"], ["A policyholder calls, furious: they changed their account because their bank card was lost in the storm, and now their payout is frozen with the fraud. There will be more like them. How fast can you release the genuine ones, and who decides which they are?", "En försäkringstagare ringer, rasande: hen bytte konto för att bankkortet försvann i stormen, och nu är utbetalningen frusen tillsammans med bedrägeriet. Det kommer fler som hen. Hur snabbt kan ni släppa de äkta, och vem avgör vilka de är?"]),
              pb(["Why a week?", "Varför en vecka?"], ["The analyst asks where the one-week window came from. Nobody yet knows how the changes were made, or whether the same route changed anything else on the claims you are letting through. Are you freezing what is dangerous, or only what you have already seen?", "Analytikern frågar var gränsen på en vecka kom ifrån. Ingen vet ännu hur ändringarna gjordes, eller om samma väg har ändrat något annat i de skador ni släpper igenom. Fryser ni det som är farligt, eller bara det ni redan har sett?"])
            ],
            C: [
              pb(["Gone within hours", "Borta inom några timmar"], ["The bank's fraud desk warns that money paid to new accounts like these is usually moved on within hours. By the time your callers reach the policyholders this afternoon, there may be nothing left to recall. Do you still send the run?", "Bankens bedrägeriavdelning varnar för att pengar som betalas till nya konton som dessa brukar flyttas vidare inom några timmar. När era handläggare når försäkringstagarna i eftermiddag finns det kanske inget kvar att återkalla. Skickar ni ändå körningen?"]),
              pb(["Who signs the run?", "Vem skriver under körningen?"], ["Someone has to approve the payout run, knowing that dozens of payments go to accounts the fraud team has flagged. {{person.legal.name}} asks whether that is negligence. Who signs it, by name, and what do you write down as the reason?", "Någon måste godkänna utbetalningskörningen, med vetskap om att dussintals betalningar går till konton som bedrägerigruppen har flaggat. {{person.legal.name}} frågar om det är vårdslöshet. Vem skriver under, med namn, och vad skriver ni som skäl?"]),
              pb(["The extra staff don't exist", "Extrapersonalen finns inte"], ["The “extra staff” for the call-backs are the same claims handlers keeping the storm queue at two hours. Pulling them doubles the wait for everyone else. Who answers the storm callers this afternoon, and what do they hear?", "”Extrapersonalen” för återringningarna är samma skadehandläggare som håller stormkön på två timmar. Att flytta dem fördubblar väntetiden för alla andra. Vem svarar stormdrabbade som ringer i eftermiddag, och vad får de höra?"])
            ]
          }
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
          evaluation: [["Removes every way back in, including tokens, without abandoning the broker's customers", "Tar bort varje väg tillbaka in, även token, utan att överge mäklarens kunder"]],
          pushback: {
            A: [
              pb(["Thousands onto the phones", "Tusentals till telefonerna"], ["The broker's {{num.brokerCustomers|number}} policyholders, many with storm damage, now have to claim by phone, on a line that already has a two-hour wait. Which callers get through first, and what do you say to a broker customer who cannot reach anyone?", "Mäklarens {{num.brokerCustomers|number}} försäkringstagare, många med stormskador, måste nu anmäla per telefon, på en linje som redan har två timmars väntetid. Vilka kommer fram först, och vad säger ni till en mäklarkund som inte når någon?"]),
              pb(["The book walks", "Beståndet försvinner"], ["The broker's managing director confirms a meeting with a competitor tomorrow. {{person.supplierManager.name}} reminds you the firm is one of your larger sales channels, and the firm is a victim too. Is full suspension worth losing the broker, when one account was hijacked?", "Mäklarens vd bekräftar ett möte med en konkurrent i morgon. {{person.supplierManager.name}} påminner om att firman är en av era större försäljningskanaler, och att firman också är ett offer. Är en total avstängning värd att förlora mäklaren, när ett konto kapades?"]),
              pb(["“Are we next?”", "”Är vi näst på tur?”"], ["Other brokers have heard and are asking: if one of our staff clicks a bad link, do you cut us all off too? Some of them may have received the same email. Do you apply the same rule to every broker, or explain why this one is different?", "Andra mäklare har hört det och frågar: om någon hos oss klickar på en dålig länk, stänger ni av oss allihop också? Några av dem kan ha fått samma mejl. Tillämpar ni samma regel på varje mäklare, eller förklarar ni varför just den här är annorlunda?"])
            ],
            B: [
              pb(["The rest of the office", "Resten av kontoret"], ["The broker firm's IT is one part-time person. The phishing email went to the whole office, and nobody can say who else typed in a code. You have kept those accounts open. Do you trust accounts at a firm that cannot tell you which ones are clean?", "Mäklarfirmans IT är en person på deltid. Nätfiskemejlet gick till hela kontoret, och ingen kan säga vem mer som skrev in en kod. Ni har låtit de kontona vara öppna. Litar ni på konton hos en firma som inte kan tala om vilka som är rena?"]),
              pb(["The call-back queue", "Kön för återringningar"], ["Bank-detail changes now wait for a call-back, and at storm volumes they pile up within the hour. Approved claims stall behind them, including families waiting for the money. Who staffs the call-backs, and from which queue do you take them?", "Ändrade bankuppgifter väntar nu på en återringning, och vid stormvolymer staplas de på varandra inom en timme. Godkända skador fastnar bakom dem, även familjer som väntar på pengarna. Vem bemannar återringningarna, och från vilken kö tar ni dem?"]),
              pb(["Shared liability", "Delat ansvar"], ["{{person.legal.name}} warns that keeping a compromised firm connected, knowing it was phished, may make the next loss through that firm yours under the broker agreement. Are you willing to carry that risk to keep the broker happy?", "{{person.legal.name}} varnar för att om ni låter en komprometterad firma vara ansluten, med vetskap om att den nätfiskats, kan nästa förlust via firman bli er enligt mäklaravtalet. Är ni beredda att bära den risken för att hålla mäklaren nöjd?"])
            ],
            C: [
              pb(["Genuine changes stuck", "Äkta ändringar fastnar"], ["Storm victims who lost their bank cards, closed damaged accounts or moved in with relatives need to change where the money goes. For 48 hours they cannot, through any broker. How do you explain a 48-hour pause to people promised payment within 48 hours?", "Stormdrabbade som förlorat sina bankkort, stängt skadade konton eller flyttat in hos släktingar behöver ändra vart pengarna ska. I 48 timmar kan de inte göra det via någon mäklare. Hur förklarar ni en paus på 48 timmar för människor som lovats utbetalning inom 48 timmar?"]),
              pb(["The account still works", "Kontot fungerar fortfarande"], ["The pause stops bank changes, but the hijacked account and the token created on Sunday can still sign in and read claim files. {{person.socLead.name}} asks what else they can do while you wait. Is a pause on one function containment?", "Pausen stoppar bankändringar, men det kapade kontot och token som skapades i söndags kan fortfarande logga in och läsa skadeakter. {{person.socLead.name}} frågar vad mer de kan göra medan ni väntar. Är en paus i en funktion verkligen inneslutning?"]),
              pb(["Punishing every broker", "Alla mäklare straffas"], ["The brokers' trade group calls: every broker is now penalised for one firm's mistake, and the market reads it as an insurer that cannot control its own portal. Do you defend the blanket pause, or start making exceptions?", "Mäklarnas branschorganisation ringer: alla mäklare straffas nu för en firmas misstag, och marknaden tolkar det som att försäkringsbolaget inte har kontroll över sin egen portal. Försvarar ni den generella pausen, eller börjar ni göra undantag?"])
            ]
          }
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
          evaluation: [["Puts the genuine policyholder first while guarding against paying an accomplice", "Sätter den verkliga försäkringstagaren först och skyddar samtidigt mot att betala en medhjälpare"]],
          pushback: {
            A: [
              pb(["The same surname", "Samma efternamn"], ["Two of the new accounts belong to people who share the policyholder's surname. If you pay everyone again today, those two get paid with no further questions. Do you hold them back and break “every one of them today”, or pay and hope?", "Två av de nya kontona tillhör personer med samma efternamn som försäkringstagaren. Om ni betalar alla igen i dag får de två betalt utan fler frågor. Håller ni inne dem och bryter ”var och en i dag”, eller betalar ni och hoppas?"]),
              pb(["“Why them first?”", "”Varför de först?”"], ["Customers still waiting in the storm queue hear that fraud victims are being paid twice in one day while they wait. A neighbour of one of the victims calls the radio station. How do you justify the fastest lane going to claims that were already paid once?", "Kunder som fortfarande väntar i stormkön hör att bedrägeridrabbade får betalt två gånger på en dag medan de själva väntar. En granne till en av de drabbade ringer radiostationen. Hur motiverar ni att det snabbaste spåret går till skador som redan betalats en gång?"]),
              pb(["Verified by tonight?", "Verifierat i kväll?"], ["Paying {{num.victims}} people today means reaching each of them and confirming a new account in a few hours. Many do not answer: they are clearing roofs or sleeping in borrowed rooms. Do you pay the ones you cannot reach to an unverified account, or miss your own deadline?", "Att betala {{num.victims}} personer i dag betyder att nå var och en och bekräfta ett nytt konto på några timmar. Många svarar inte: de röjer tak eller sover i lånade rum. Betalar ni dem ni inte når till ett overifierat konto, eller missar ni er egen tidsfrist?"])
            ],
            B: [
              pb(["The hotel runs out", "Hotellet tar slut"], ["The family in the hotel room calls back: the municipality stops paying for the room on Friday, before the bank's answer is due. Five working days is your timetable, not theirs. What do you tell them, and who tells them?", "Familjen i hotellrummet ringer tillbaka: kommunen slutar betala för rummet på fredag, innan bankens besked ska komma. Fem arbetsdagar är er tidsplan, inte deras. Vad säger ni till dem, och vem säger det?"]),
              pb(["Your loss, their problem", "Er förlust, deras problem"], ["{{person.legal.name}} reminds you that the policy obliges you to pay the policyholder, who did nothing wrong. Waiting for your own bank recall turns your loss into their problem. Can you defend that in writing to the supervisor?", "{{person.legal.name}} påminner om att försäkringen förpliktar er att betala försäkringstagaren, som inte har gjort något fel. Att vänta på er egen återkallelse gör er förlust till deras problem. Kan ni försvara det skriftligt inför tillsynen?"]),
              pb(["The radio has the story", "Radion har historien"], ["{{person.comms.name}} hears that the radio station will run the hotel family's story tonight under the angle “insurer waits for its own money first”. They want a comment within the hour. What is your line, and does it survive being read out?", "{{person.comms.name}} får höra att radiostationen kör hotellfamiljens historia i kväll med vinkeln ”försäkringsbolaget väntar på sina egna pengar först”. De vill ha en kommentar inom en timme. Vad är er linje, och håller den när den läses upp?"])
            ],
            C: [
              pb(["Who counts as hardship?", "Vem räknas som svårt drabbad?"], ["There is no definition, so handlers are deciding on the phone. A caller with no roof but a sofa at a friend's says that is hardship too. Who draws the line, on what evidence, and what happens to the handler who gets it wrong?", "Det finns ingen definition, så handläggarna avgör det i telefon. Någon som saknar tak men sover på en väns soffa säger att det också är svårt. Vem drar gränsen, utifrån vilka underlag, och vad händer med handläggaren som gör fel?"]),
              pb(["Hardship is easy to claim", "Lätt att säga att det är svårt"], ["Both claims with a surname match on the new account have now said they are in emergency housing. Hardship is exactly what someone involved would claim to get paid first. Do you check every hardship claim, and lose the speed that was the point?", "Båda skadorna där det nya kontot har samma efternamn uppger nu att de bor i nödboende. Att det är svårt är precis vad någon inblandad skulle säga för att få betalt först. Kontrollerar ni varje sådant fall, och förlorar snabbheten som var hela poängen?"]),
              pb(["Two classes of victim", "Två klasser av drabbade"], ["Victims are comparing notes: the neighbour in a hotel was paid today, the family living in their damaged house waits a week. Both were robbed the same way. How do you explain to the second family that their loss counts for less?", "De drabbade jämför: grannen på hotellet fick betalt i dag, familjen som bor kvar i sitt skadade hus väntar en vecka. Båda blev bestulna på samma sätt. Hur förklarar ni för den andra familjen att deras förlust väger mindre?"])
            ]
          }
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
          evaluation: [["Meets the deadline and treats health data with the care it requires, without wrecking the police case", "Håller tidsfristen och behandlar hälsodata med den omsorg som krävs, utan att förstöra polisens utredning"]],
          pushback: {
            A: [
              pb(["The police object", "Polisen invänder"], ["The police investigator calls: letters to thousands of customers this week will tell the group exactly what you know, and they may move the data and the money before anyone is arrested. Do you send the letters over the police's objection?", "Polisens utredare ringer: brev till tusentals kunder den här veckan berättar för gruppen exakt vad ni vet, och de kan flytta både data och pengar innan någon grips. Skickar ni breven trots polisens invändning?"]),
              pb(["Frightening the wrong people", "Skrämmer fel personer"], ["Forensics can say whose files were reachable, not yet whose were actually opened. Writing to all {{num.records|number}} customers means telling many people their health notes may be in criminal hands when, for most, they may not be. Is certainty for a few worth fear for thousands?", "Forensikerna kan säga vems filer som gick att nå, men ännu inte vems som faktiskt öppnades. Att skriva till alla {{num.records|number}} kunder betyder att många får veta att deras hälsouppgifter kanske finns hos kriminella, när det för de flesta kanske inte stämmer. Är visshet för några värd oro för tusentals?"]),
              pb(["Support from whom?", "Stöd från vem?"], ["The letters promise support for those whose health data was taken. The only people trained to talk to frightened customers are the claims handlers already working the storm queue. Which queue wins this week: storm victims or breach victims?", "Breven lovar stöd till dem vars hälsodata togs. De enda som är vana att prata med oroliga kunder är skadehandläggarna som redan jobbar med stormkön. Vilken kö går först den här veckan: stormdrabbade eller de som drabbats av läckan?"])
            ],
            B: [
              pb(["Forensics may never know", "Forensikerna kanske aldrig vet"], ["The forensic team says the logs show bundles downloaded, not which documents inside them were opened. The precise answer you are waiting for may never come. How long do you wait for something that might not exist?", "Forensikerna säger att loggarna visar vilka paket som laddades ner, inte vilka dokument i dem som öppnades. Det exakta svaret ni väntar på kanske aldrig kommer. Hur länge väntar ni på något som kanske inte finns?"]),
              pb(["A customer already knows", "En kund vet redan"], ["A customer calls: someone phoned yesterday quoting details from their injury claim and asking them to “confirm” their bank account. They want to know how a stranger had their file. Do you tell this one customer now, and if so, why not the others?", "En kund ringer: någon ringde i går och citerade uppgifter ur hens personskadeärende och bad hen ”bekräfta” sitt bankkonto. Hen vill veta hur en främling hade akten. Berättar ni nu för just den här kunden, och i så fall, varför inte för de andra?"]),
              pb(["Without undue delay", "Utan onödigt dröjsmål"], ["{{person.dpo.name}} pushes back: with health data, “without undue delay” means telling people soon, and waiting for forensics serves the company, not the customers. {{reg.dpaShort}} will ask why you waited. Who signs the decision to hold back, and how will it read?", "{{person.dpo.name}} säger emot: med hälsodata betyder ”utan onödigt dröjsmål” att de berörda ska få veta snart, och att vänta på forensikerna gynnar bolaget, inte kunderna. {{reg.dpaShort}} kommer att fråga varför ni väntade. Vem skriver under beslutet att vänta, och hur kommer det att se ut?"])
            ],
            C: [
              pb(["Only a phone call", "Bara ett telefonsamtal"], ["{{person.legal.name}} asks for the police request in writing, since delaying notice to people whose health data was taken needs a documented reason. The investigator will not put it in writing yet. Do you hold the letters for a week on the strength of a phone call?", "{{person.legal.name}} vill ha polisens begäran skriftligt, eftersom ett dröjsmål med att informera personer vars hälsodata togs kräver ett dokumenterat skäl. Utredaren vill inte skriva något än. Väntar ni en vecka med breven på grund av ett telefonsamtal?"]),
              pb(["The press asks first", "Pressen frågar först"], ["A journalist has heard about the broker hijack and asks a direct question: was any customer data taken as well? You have decided customers will not hear for a week. What do you answer, and how will it look when the letters arrive?", "En journalist har hört om kapningen hos mäklaren och ställer en rak fråga: togs några kunduppgifter också? Ni har beslutat att kunderna inte ska få veta på en vecka. Vad svarar ni, och hur kommer det att se ut när breven kommer?"]),
              pb(["A week unprotected", "En vecka utan skydd"], ["While you wait, the criminals can use what they took: calls and emails that quote a customer's own injury claim to sound genuine. Customers who have not been warned cannot recognise them. Who carries that harm during the week, and are you comfortable it is them?", "Medan ni väntar kan de kriminella använda det de tog: samtal och mejl som citerar kundens eget personskadeärende för att låta äkta. Kunder som inte har varnats kan inte känna igen dem. Vem bär den skadan under veckan, och är ni bekväma med att det är de?"])
            ]
          }
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
          evaluation: [["Chooses an honest promise it can keep, and protects those in hardship", "Väljer ett ärligt löfte som går att hålla, och skyddar dem som har det svårast"]],
          pushback: {
            A: [
              pb(["The CEO's own word", "Vd:s eget ord"], ["{{person.ceo.name}} says withdrawing means going back on air to break a personal promise, and admitting fraud in public before the supervisor has even had your report. Who in the room tells the CEO, and who goes on air to say it?", "{{person.ceo.name}} säger att ett tillbakadragande betyder att gå ut i radio igen och bryta ett personligt löfte, och erkänna bedrägeri offentligt innan tillsynen ens har fått er rapport. Vem i rummet säger det till vd, och vem går ut i radio och säger det?"]),
              pb(["Explaining invites copycats", "Förklaringen lockar efterföljare"], ["Explaining the fraud tells every criminal that storm payouts are a soft target. Within hours of a public explanation, copycat emails using your name could reach policyholders. How much of the fraud do you explain, and how much do you leave out?", "Att förklara bedrägeriet talar om för varje kriminell att stormutbetalningar är ett lätt mål. Inom några timmar efter en offentlig förklaring kan efterapade mejl i ert namn nå försäkringstagarna. Hur mycket av bedrägeriet förklarar ni, och hur mycket utelämnar ni?"]),
              pb(["The second broken promise", "Det andra brutna löftet"], ["The realistic date depends on staff and call-backs you have not yet secured. If you miss the new date as well, you have broken two promises in one week. How sure are you of the date, and who is willing to stand behind it?", "Det realistiska datumet hänger på personal och återringningar som ni ännu inte har säkrat. Om ni missar det nya datumet också har ni brutit två löften på en vecka. Hur säkra är ni på datumet, och vem är beredd att stå för det?"])
            ],
            B: [
              pb(["Half the volunteers", "Bara hälften ställer upp"], ["The call for overtime brings half the people needed, and temporary staff cannot be trusted to verify bank details. Keeping the promise now means either unchecked payouts or a missed deadline. Which do you quietly accept?", "Uppropet om övertid ger hälften av de personer som behövs, och tillfällig personal kan inte anförtros att verifiera bankuppgifter. Att hålla löftet betyder nu antingen okontrollerade utbetalningar eller en missad tidsfrist. Vilket av dem accepterar ni i tysthet?"]),
              pb(["“Under control?”", "”Under kontroll?”"], ["The supervisor asked whether payouts are under control. Your public answer is a deadline that puts speed first, the same speed that let the fraud through. How do you write the report so both statements can be true?", "Tillsynen frågade om utbetalningarna är under kontroll. Ert offentliga svar är en tidsfrist som sätter snabbhet först, samma snabbhet som släppte igenom bedrägeriet. Hur skriver ni rapporten så att båda påståendena kan vara sanna?"]),
              pb(["The reinsurer reads the checks", "Återförsäkraren granskar kontrollerna"], ["The reinsurer wants to know what controls applied before payment. Checks rushed through on overtime, by tired people, are exactly what their review will look at. Do you want those checks in the claims file they read?", "Återförsäkraren vill veta vilka kontroller som gällde före utbetalning. Kontroller som har hastats igenom på övertid, av trötta människor, är precis vad deras granskning kommer att titta på. Vill ni ha de kontrollerna i skadeakten de läser?"])
            ],
            C: [
              pb(["A threshold is a target", "En gräns är en måltavla"], ["Announcing a threshold tells fraudsters exactly what size of claim is paid fastest with the fewest questions. Claims just below it will start to appear. Do you publish the threshold, and if not, how do customers know which promise they have?", "Att offentliggöra en gräns berättar för bedragare exakt vilken storlek på skada som betalas snabbast med minst frågor. Skador strax under gränsen kommer att börja dyka upp. Offentliggör ni gränsen, och om inte, hur vet kunderna vilket löfte de har?"]),
              pb(["The worst-hit wait longest", "De värst drabbade väntar längst"], ["The largest claims belong to families whose houses were destroyed, the ones most likely to be in temporary housing. Under your threshold they get a new date and a phone call; a broken fence gets paid in 48 hours. Is that the promise you want to keep?", "De största skadorna tillhör familjer vars hus förstördes, de som mest sannolikt bor tillfälligt någon annanstans. Med er gräns får de ett nytt datum och ett samtal; ett trasigt staket betalas inom 48 timmar. Är det löftet ni vill hålla?"]),
              pb(["Yes or no?", "Ja eller nej?"], ["The journalist wants a yes or no for the evening news: is the 48-hour promise still valid? “Partly, below a threshold” will be reported as a broken promise. What is your one sentence?", "Journalisten vill ha ett ja eller nej till kvällsnyheterna: gäller 48-timmarslöftet fortfarande? ”Delvis, under en gräns” kommer att rapporteras som ett brutet löfte. Vilken är er enda mening?"])
            ]
          }
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
          evaluation: [["Removes the weakness at its root without pushing the cost onto storm victims", "Tar bort svagheten vid roten utan att lägga kostnaden på de stormdrabbade"]],
          pushback: {
            A: [
              pb(["Small brokers can't keep up", "Små mäklare hänger inte med"], ["Several small broker firms say they cannot manage phishing-resistant sign-in before the next storm season, and two hint they will stop selling your policies. Do you cut off the brokers who are not ready, or let them in with weaker sign-in?", "Flera små mäklarfirmor säger att de inte klarar nätfiskeresistent inloggning före nästa stormsäsong, och två antyder att de slutar sälja era försäkringar. Stänger ni ute de mäklare som inte är redo, eller släpper ni in dem med svagare inloggning?"]),
              pb(["The channel the storm took", "Kanalen som stormen tog"], ["Verifying through the policyholder's own channel assumes they still have it. After a storm, many have lost phones, moved out, or cannot reach their email. How does a family without their registered phone change where their money goes?", "Att verifiera via försäkringstagarens egen kanal förutsätter att hen fortfarande har den. Efter en storm har många förlorat telefoner, flyttat ut eller kommer inte åt sin e-post. Hur ändrar en familj utan sin registrerade telefon vart pengarna ska?"]),
              pb(["Storms look like fraud", "Stormar ser ut som bedrägeri"], ["A test of fraud scoring on last week's claims flags one in five, because a storm is itself an unusual event: sudden volume, new addresses, changed accounts. Who reviews those flags in the next storm, and how many days does that add?", "Ett test av bedrägeribedömning på förra veckans skador flaggar var femte, eftersom en storm i sig är en ovanlig händelse: plötslig volym, nya adresser, ändrade konton. Vem granskar flaggorna i nästa storm, och hur många dagar lägger det till?"])
            ],
            B: [
              pb(["Four days, next time too", "Fyra dagar, nästa gång också"], ["Keeping the call-backs means the next storm also starts with a four-day delay on every changed account. The newspaper headline is still on the wall. How do you defend repeating it, to the families who will wait next time?", "Att behålla återringningarna betyder att nästa storm också börjar med fyra dagars fördröjning för varje ändrat konto. Tidningsrubriken sitter fortfarande på väggen. Hur försvarar ni att det upprepas, inför familjerna som får vänta nästa gång?"]),
              pb(["Stronger can still be relayed", "Starkare kan också vidarebefordras"], ["The police briefing was clear: the one-time codes were relayed by a phishing page. A “stronger” sign-in that still uses a code the user types in can be relayed the same way. What exactly makes your stronger sign-in different?", "Polisens genomgång var tydlig: engångskoderna vidarebefordrades av en nätfiskesida. En ”starkare” inloggning som fortfarande bygger på en kod som användaren skriver in kan vidarebefordras på samma sätt. Vad gör er starkare inloggning egentligen annorlunda?"]),
              pb(["The call-back team is tired", "Återringningsteamet är trött"], ["The handlers making call-backs have done nothing else for a week, and two have asked to move back to claims. Keeping call-backs as a permanent control needs a permanent team. Who staffs it, and who pays for it after the storm is forgotten?", "Handläggarna som ringer tillbaka har inte gjort något annat på en vecka, och två har bett att få gå tillbaka till skadehandläggningen. Att behålla återringningar som en permanent kontroll kräver ett permanent team. Vem bemannar det, och vem betalar när stormen är glömd?"])
            ],
            C: [
              pb(["Brokers say it is their job", "Mäklarna säger att det är deras jobb"], ["Brokers say helping customers with bank changes after a storm is part of what they are paid for, especially for elderly customers, and the agreements say so. Removing it means renegotiating with every broker. Can that be done before the next storm?", "Mäklarna säger att det ingår i det de får betalt för att hjälpa kunder med bankändringar efter en storm, särskilt äldre kunder, och att avtalen säger det. Att ta bort det betyder att omförhandla med varje mäklare. Hinner ni det före nästa storm?"]),
              pb(["The attack moves", "Angreppet flyttar"], ["If only policyholders can change bank details, the next phishing email goes to policyholders instead, through the same kind of one-time code. You have moved the target from a few hundred brokers to thousands of storm victims. Is that safer?", "Om bara försäkringstagaren kan ändra bankuppgifter går nästa nätfiskemejl till försäkringstagarna i stället, via samma slags engångskod. Ni har flyttat måltavlan från några hundra mäklare till tusentals stormdrabbade. Är det säkrare?"]),
              pb(["The search is still open", "Sökningen är fortfarande öppen"], ["Removing bank changes stops the money route, but a hijacked broker account could still search claims across the whole company. That is how the health data was taken. Does your change fix the incident that hurt most?", "Att ta bort bankändringar stänger penningvägen, men ett kapat mäklarkonto kan fortfarande söka bland skador i hela bolaget. Det var så hälsodata togs. Åtgärdar er förändring den incident som skadade mest?"])
            ]
          }
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
