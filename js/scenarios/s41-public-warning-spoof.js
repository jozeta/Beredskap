/*
 * s41-public-warning-spoof.js — "The Fake Evacuation" (archetype D, government agency).
 *
 * Early on a weekend morning, residents receive a text from the agency's own verified
 * sender: the water is contaminated, leave your homes, register for an emergency
 * payment. The website is down under a flood of traffic → the way in was the text
 * gateway provider's API key, published by a contractor's developer → people give
 * their bank logins to the "emergency payment" page while the real water utility says
 * nothing is wrong → the attackers also exported the gateway's contact list, linked to
 * personal identity numbers → the government's crisis coordination wants to take over
 * → weeks later, a real warning is ignored.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s41-public-warning-spoof",
    version: 1,
    category: "public-warning-spoof",
    archetype: "third-party-origin",
    emblem: "public-warning-spoof",
    title: L(["The Fake Evacuation", "Den falska evakueringen"]),
    summary: L([
      "Your agency's own text sender has just told {{num.recipients|number}} people that their water is poisoned and that they must leave their homes. Your website is down. The only fast way to tell them it is false is the channel that lied to them.",
      "Er myndighets egen sms-avsändare har just sagt till {{num.recipients|number}} personer att deras vatten är förgiftat och att de måste lämna sina hem. Er webbplats ligger nere. Det enda snabba sättet att säga att det är falskt är kanalen som ljög för dem."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Correct a false public warning fast, through channels people still trust", "Snabbt rätta en falsk varning till allmänheten, via kanaler som folk fortfarande litar på"]), teaser: L(["The text from your own sender", "Sms:et från er egen avsändare"]) },
      { id: "lo2", text: L(["Contain a compromise at a supplier without silencing yourself", "Begränsa ett intrång hos en leverantör utan att tysta er själva"]), teaser: L(["One key, every message", "En nyckel, varje meddelande"]) },
      { id: "lo3", text: L(["Recognise when a hoax is also a data breach", "Känna igen när en bluff också är en personuppgiftsincident"]), teaser: L(["What else they took", "Vad mer de tog"]) },
      { id: "lo4", text: L(["Coordinate with other authorities without losing your own responsibility", "Samordna med andra myndigheter utan att tappa ert eget ansvar"]), teaser: L(["Who speaks for the state", "Vem som talar för staten"]) }
    ],
    mitre: ["T1078", "T1566", "T1498", "T1583"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.AA", "DE.AE", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.19", "A.5.21", "A.5.24", "A.5.26", "A.5.28", "A.5.34", "A.8.24"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "weekend", startTime: "06:40", sectors: ["government"] },
    actor: { types: ["unknown"], motivation: L(["Unclear: fraud on the surface, but the timing and the traffic flood suggest a test of how far the public trusts the state", "Oklar: bedrägeri på ytan, men tajmingen och trafikfloden tyder på ett test av hur mycket allmänheten litar på staten"]), capability: "medium" },
    variables: {
      recipients: { min: 20000, max: 400000, scaleBy: "size", step: 1000 },
      calls: { min: 3000, max: 60000, scaleBy: "size", step: 500 },
      logins: { min: 150, max: 4000, scaleBy: "size", step: 10 },
      contacts: { min: 300000, max: 6000000, scaleBy: "size", step: 10000 },
      stolen: { min: 2000000, max: 30000000, scaleBy: "size", step: 100000, currency: true }
    },
    roles: ["incidentCommander", "ceo", "cio", "ciso", "serviceOwner", "comms", "legal", "dpo", "supplierManager", "dutyOfficer"],

    groundTruth: {
      rootCause: L([
        "A developer at the contractor that built {{org.name}}'s notification service pushed a configuration file to a public code repository eight months ago. It contained the text gateway provider's API key for the agency's verified sender name. The key had no address restriction and no expiry. That morning, the attackers used it to send a fake contamination warning to every number registered in one region, linking to a look-alike page that asked for bank logins for an “emergency payment”. At the same time they flooded the agency's website so that nobody could check. Before sending, they had downloaded the gateway's full contact list, which stores each phone number with its personal identity number.",
        "En utvecklare hos konsulten som byggde {{org.name}}s aviseringstjänst laddade för åtta månader sedan upp en konfigurationsfil till ett publikt kodförråd. Den innehöll sms-leverantörens API-nyckel för myndighetens verifierade avsändarnamn. Nyckeln hade varken adressbegränsning eller utgångsdatum. Den morgonen använde angriparna den för att skicka en falsk varning om förorenat vatten till varje registrerat nummer i en region, med en länk till en förväxlingsbar sida som bad om bankinloggning för en ”nödutbetalning”. Samtidigt överbelastade de myndighetens webbplats så att ingen kunde kontrollera. Innan de skickade hade de laddat ner sms-tjänstens hela kontaktlista, där varje telefonnummer lagras tillsammans med personnumret."
      ]),
      attackerTimeline: [
        { at: -345600, text: L(["API key published in a public code repository.", "API-nyckeln publiceras i ett publikt kodförråd."]) },
        { at: -2880, text: L(["Look-alike payment page registered.", "Förväxlingsbar utbetalningssida registreras."]) },
        { at: -45, text: L(["Full contact list exported through the gateway's API.", "Hela kontaktlistan exporteras via sms-tjänstens API."]) },
        { at: -2, text: L(["Fake warning sent; traffic flood starts against the website.", "Den falska varningen skickas; trafikfloden mot webbplatsen startar."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-key", revealStage: "p2", text: L(["The text gateway's API key had been public in a contractor's code repository for eight months.", "Sms-tjänstens API-nyckel hade legat publikt i en konsults kodförråd i åtta månader."]) },
      { id: "hf-list", revealStage: "p4", text: L(["The attackers exported the gateway's contact list, with personal identity numbers, before sending.", "Angriparna exporterade sms-tjänstens kontaktlista, med personnummer, innan de skickade."]) },
      { id: "hf-ignored", revealStage: "p6", text: L(["A real warning weeks later reached fewer people because many had blocked the agency's sender.", "En äkta varning några veckor senare nådde färre eftersom många hade blockerat myndighetens avsändare."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Leave your homes", "Lämna era hem"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.dutyOfficer.name}} calls {{person.ceo.name}}. Two minutes ago, {{num.recipients|number}} people in one region received a text from the agency's verified sender: the tap water is contaminated, residents must leave their homes, and an emergency payment is available at a link.\n\nThe agency sent no such message. Its website is not loading. The regional emergency number has a queue, and people are posting pictures of families packing cars.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.dutyOfficer.name}} ringer {{person.ceo.name}}. För två minuter sedan fick {{num.recipients|number}} personer i en region ett sms från myndighetens verifierade avsändare: kranvattnet är förorenat, invånarna måste lämna sina hem, och en nödutbetalning finns via en länk.\n\nMyndigheten har inte skickat något sådant meddelande. Webbplatsen laddar inte. Regionens nödnummer har kö, och folk lägger ut bilder på familjer som packar bilar."
        ]),
        injects: [
          inj("i1-1", 0, "sms", "attacker", "critical", "misleading", [
            "“{{org.name}}: URGENT. Tap water in your area is contaminated. Leave your home now. Emergency support payment: register at the link today.”",
            "”{{org.name}}: BRÅDSKANDE. Kranvattnet i ditt område är förorenat. Lämna ditt hem nu. Nödutbetalning: registrera dig via länken i dag.”"
          ], { headline: ["From your own sender", "Från er egen avsändare"], facilitatorNote: ["Every word is false. It arrived exactly where your real messages arrive.", "Varje ord är falskt. Det kom fram precis där era äkta meddelanden kommer fram."], tests: ["lo1"] }),
          inj("i1-2", 8, "statusPage", "itOps", "high", "confirmed", [
            "Public website: unavailable. Inbound traffic 400× normal from many sources. E-services and contact forms down.",
            "Den publika webbplatsen: otillgänglig. Inkommande trafik 400 gånger det normala från många källor. E-tjänster och kontaktformulär nere."
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can you still send messages from your own sender, and would they be trusted?", "Kan ni fortfarande skicka meddelanden från er egen avsändare, och skulle de bli trodda?", ["serviceOwner"]),
            q("Is the attacker still able to send?", "Kan angriparen fortfarande skicka?", ["ciso", "supplierManager"]),
            q("What other channels reach these people within fifteen minutes?", "Vilka andra kanaler når de här personerna inom en kvart?", ["comms"])
          ],
          executive: [
            q("Who else must hear about this in the next ten minutes?", "Vem mer måste få veta det här inom tio minuter?", ["ceo", "dutyOfficer"]),
            q("What is the cost of people leaving their homes for nothing, against the cost of a confused correction?", "Vad kostar det att folk lämnar sina hem i onödan, jämfört med en förvirrad rättelse?", ["ceo"]),
            q("Who is allowed to say the water is safe?", "Vem får säga att vattnet är säkert?", ["legal", "comms"])
          ]
        },
        challenges: [ch("If the attacker can still send, they can answer your correction with a “correction” of their own.", "Om angriparen fortfarande kan skicka kan de besvara er rättelse med en egen ”rättelse”.")],
        decision: dec("d1", "ceo", ["How do you reach the people who got the text?", "Hur når ni dem som fick sms:et?"], [
          ["Send a correction from the same sender now: the message was false, stay at home, do not click.", "Skicka en rättelse från samma avsändare nu: meddelandet var falskt, stanna hemma, klicka inte."],
          ["Leave the text channel alone; ask national radio, the police and the regional authorities to broadcast the correction.", "Rör inte sms-kanalen; be riksradion, polisen och regionens myndigheter sända rättelsen."],
          ["Wait until you know whether the text channel is secure, then correct on it.", "Vänta tills ni vet om sms-kanalen är säker, och rätta sedan i den."]
        ], {
          knowns: [["A false evacuation text went out from your verified sender; your website is down.", "Ett falskt evakueringsmeddelande gick ut från er verifierade avsändare; er webbplats ligger nere."]],
          uncertainties: [["Whether the attacker still controls the sender, and whether people will believe it a second time.", "Om angriparen fortfarande styr avsändaren, och om folk tror på den en andra gång."]],
          tradeoffs: {
            operational: ["The text channel is the fastest; it is also the one that lied.", "Sms-kanalen är snabbast; den är också den som ljög."],
            security: ["A correction on a compromised channel can be answered by the attacker.", "En rättelse i en komprometterad kanal kan besvaras av angriparen."],
            legal: ["You are responsible for messages sent in your name.", "Ni ansvarar för meddelanden som skickas i ert namn."],
            reputational: ["Every minute of silence, more people leave their homes.", "Varje minut av tystnad lämnar fler sina hem."]
          },
          evaluation: [["Reaches the affected people within minutes through a channel they will believe", "Når de berörda inom några minuter via en kanal de kommer att tro på"]]
        }),
        facilitator: fac(
          ["Every option has a real flaw. Watch whether the room uses more than one channel.", "Varje alternativ har en verklig brist. Se om rummet använder mer än en kanal."],
          ["Correct on every trusted channel at once, and on the text channel only when you know you control it.", "Rätta i varje betrodd kanal samtidigt, och i sms-kanalen först när ni vet att ni styr den."],
          [["Ask: if you received two texts from the same sender saying opposite things, which would you believe?", "Fråga: om du fick två sms från samma avsändare som sa motsatta saker, vilket skulle du tro på?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 40,
        title: L(["One key, every message", "En nyckel, varje meddelande"]),
        twist: L(["The text was sent with the agency's own API key. It has been public in a contractor's code repository for eight months, and it still works.", "Sms:et skickades med myndighetens egen API-nyckel. Den har legat publikt i en konsults kodförråd i åtta månader, och den fungerar fortfarande."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "C" }, narrativeAppend: { en: "Because you waited, the regional authorities issued their own statement first, and it says only that they “cannot confirm” the agency's message.", sv: "Eftersom ni väntade gick regionens myndigheter ut med ett eget uttalande först, och det säger bara att de ”inte kan bekräfta” myndighetens meddelande." } }
        ],
        assumptionChallenged: L(["Someone broke into our systems.", "Någon har brutit sig in i våra system."]),
        reveals: ["hf-key"],
        narrative: L([
          "{{time.T+40|clock}}. {{person.supplierManager.name}} has the text gateway provider on the line. The message was sent through their interface with the agency's own API key, from an address abroad. Nothing at the agency was broken into.\n\nA quick search finds the key in a public code repository belonging to a developer at the contractor that built the notification service. The provider can revoke it at once, but then every notification the agency sends stops, including Monday's payment reminders and the text codes residents use to sign in to e-services.",
          "Klockan {{time.T+40|clock}}. {{person.supplierManager.name}} har sms-leverantören i telefon. Meddelandet skickades via deras gränssnitt med myndighetens egen API-nyckel, från en adress utomlands. Ingenting hos myndigheten har brutits upp.\n\nEn snabb sökning hittar nyckeln i ett publikt kodförråd som tillhör en utvecklare hos konsulten som byggde aviseringstjänsten. Leverantören kan återkalla den direkt, men då slutar varje avisering myndigheten skickar att fungera, även måndagens betalningspåminnelser och de sms-koder invånarna använder för att logga in i e-tjänsterna."
        ]),
        injects: [
          inj("i2-1", 40, "logExcerpt", "supplier", "high", "confirmed", [
            "Gateway: send job (one batch), sender ID = agency verified name, API key ending …7Q2, source IP abroad. Same key: contact-list export 45 min earlier. Key created 3 years ago, no IP restriction, no expiry.",
            "Sms-tjänsten: utskick i en batch, avsändar-id = myndighetens verifierade namn, API-nyckel som slutar på …7Q2, käll-ip utomlands. Samma nyckel: export av kontaktlistan 45 minuter tidigare. Nyckeln skapad för 3 år sedan, ingen ip-begränsning, inget utgångsdatum."
          ], { reveals: ["hf-key"], facilitatorNote: ["The export 45 minutes earlier is easy to miss. It becomes the scope twist later.", "Exporten 45 minuter tidigare är lätt att missa. Den blir omfattningsvändningen senare."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can the key be replaced without stopping every notification?", "Kan nyckeln bytas ut utan att varje avisering stoppas?", ["ciso", "serviceOwner"]),
            q("What else could someone do with that key?", "Vad mer kan någon göra med den nyckeln?", ["ciso"]),
            q("Did the channel you chose for the correction reach people?", "Nådde den kanal ni valde för rättelsen fram till folk?", ["comms"], "d1")
          ],
          executive: [
            q("What do you require of the contractor, today?", "Vad kräver ni av konsulten, i dag?", ["supplierManager", "legal"]),
            q("Can residents manage without text sign-in codes for a few days?", "Klarar sig invånarna utan sms-koder för inloggning i några dagar?", ["serviceOwner"]),
            q("Would you correct the same way again, now that you know the key still works?", "Skulle ni rätta på samma sätt igen, nu när ni vet att nyckeln fortfarande fungerar?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("The provider can issue a new key in ten minutes, but the contractor must deploy it, and its on-call developer is the one who published the old one.", "Leverantören kan utfärda en ny nyckel på tio minuter, men konsulten måste driftsätta den, och deras jourutvecklare är den som publicerade den gamla.")],
        decision: dec("d2", "ciso", ["What do you do with the key?", "Vad gör ni med nyckeln?"], [
          ["Revoke it now and accept that every notification stops until a new key is in place.", "Återkalla den nu och acceptera att varje avisering stoppas tills en ny nyckel är på plats."],
          ["Have the provider restrict the key to your own addresses at once, and replace it in an orderly way next week.", "Låt leverantören begränsa nyckeln till era egna adresser direkt, och byt ut den på ett ordnat sätt nästa vecka."],
          ["Leave the key and ask the provider to block any send larger than a hundred messages.", "Behåll nyckeln och be leverantören stoppa varje utskick större än hundra meddelanden."]
        ], {
          knowns: [["The fake was sent with your own key, public for eight months; the key still works.", "Förfalskningen skickades med er egen nyckel, publik i åtta månader; nyckeln fungerar fortfarande."]],
          uncertainties: [["Who else has copied the key, and what else it was used for.", "Vem mer som har kopierat nyckeln, och vad mer den använts till."]],
          tradeoffs: {
            operational: ["Revoking stops sign-in codes and payment reminders for every resident.", "En återkallelse stoppar inloggningskoder och betalningspåminnelser för alla invånare."],
            security: ["Any key that still works can send the next fake.", "Varje nyckel som fortfarande fungerar kan skicka nästa förfalskning."],
            legal: ["The contract says nothing about who must act on a leaked key.", "Avtalet säger ingenting om vem som måste agera på en läckt nyckel."],
            reputational: ["A second fake from your sender would end trust in it.", "En andra förfalskning från er avsändare skulle göra slut på förtroendet för den."]
          },
          evaluation: [["Makes sure no one else can send in the agency's name, even at the cost of a short outage", "Ser till att ingen annan kan skicka i myndighetens namn, även till priset av ett kort avbrott"]]
        }),
        facilitator: fac(
          ["The cause is mundane, which is the point. Watch whether the room is tempted by the half-measures.", "Orsaken är vardaglig, och det är poängen. Se om rummet lockas av halvmesyrerna."],
          ["Revoke the key now, issue a restricted one, and accept the short outage.", "Återkalla nyckeln nu, utfärda en begränsad nyckel och acceptera det korta avbrottet."],
          [["Ask: if the attacker reads your correction, what is the next text they send?", "Fråga: om angriparen läser er rättelse, vilket är nästa sms de skickar?"]]
        )
      },
      {
        id: "p3",
        clock: 120,
        title: L(["The emergency payment", "Nödutbetalningen"]),
        twist: L(["The link was not a joke. {{num.logins|number}} people have entered their bank logins on the “emergency payment” page, and the first accounts are being emptied.", "Länken var inget skämt. {{num.logins|number}} personer har angett sina bankinloggningar på sidan för ”nödutbetalning”, och de första kontona töms."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "People are losing money on the page your fake text linked to. However you chose to correct the message, it has not reached everyone in time. Would you choose the same channel now?", sv: "Folk förlorar pengar på sidan som det falska sms:et länkade till. Hur ni än valde att rätta meddelandet har det inte nått alla i tid. Skulle ni välja samma kanal nu?" } },
        branches: [
          { when: { decision: "d2", option: "C" }, narrativeAppend: { en: "Because the key was left active with a size limit, the gateway logs show the attackers sending small batches of ninety-nine messages each, all with the same link.", sv: "Eftersom nyckeln fick vara aktiv med en storleksgräns visar sms-tjänstens loggar att angriparna skickar små omgångar på nittionio meddelanden vardera, alla med samma länk." } }
        ],
        assumptionChallenged: L(["The hoax was the attack.", "Bluffen var angreppet."]),
        narrative: L([
          "{{time.T+120|clock}}. Two banks call. Customers in the region have given away their bank logins on a page that looks like the agency's e-services, and money is moving out of accounts in small amounts. The banks want the agency to tell people to call their bank, now.\n\nMeanwhile the regional water utility has said publicly that the water is fine, and a local radio host is asking on air why anyone should believe the government about anything today.",
          "Klockan {{time.T+120|clock}}. Två banker ringer. Kunder i regionen har lämnat ut sina bankinloggningar på en sida som ser ut som myndighetens e-tjänster, och pengar flyttas ut från kontona i små belopp. Bankerna vill att myndigheten säger åt folk att ringa sin bank, nu.\n\nSamtidigt har regionens vattenbolag gått ut med att vattnet är säkert, och en lokal radioprogramledare frågar i sändning varför någon ska tro på staten om någonting i dag."
        ]),
        injects: [
          inj("i3-1", 120, "phoneTranscript", "bank", "high", "confirmed", [
            "“We see dozens of new logins from abroad on customers in your region, all after your text. Tell people to call us and change their logins, today.”",
            "”Vi ser dussintals nya inloggningar från utlandet på kunder i er region, alla efter ert sms. Säg åt folk att ringa oss och byta sina inloggningar, i dag.”"
          ], { tests: ["lo1"] }),
          inj("i3-2", 130, "socialPost", "socialMedia", "medium", "misleading", [
            "“First they say leave your homes, then they say stay. If the government can't control its own texts, why believe the water is fine?”",
            "”Först säger de lämna era hem, sedan säger de stanna. Om staten inte kan styra sina egna sms, varför tro att vattnet är säkert?”"
          ], { facilitatorNote: ["Distrust now cuts both ways: people doubt the correction too.", "Misstron slår nu åt båda hållen: folk tvivlar på rättelsen också."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you get the fake payment page taken down?", "Hur får ni den falska utbetalningssidan nedtagen?", ["ciso"]),
            q("Can you tell which residents clicked?", "Kan ni se vilka invånare som klickade?", ["serviceOwner"]),
            q("Is the key truly dead now, or only limited?", "Är nyckeln verkligen död nu, eller bara begränsad?", ["ciso"], "d2")
          ],
          executive: [
            q("Who should the public hear from now: you, the water utility, the banks?", "Vem bör allmänheten höra nu: er, vattenbolaget, bankerna?", ["comms"]),
            q("Does the agency owe anything to people who lost money?", "Är myndigheten skyldig något till dem som förlorade pengar?", ["legal", "ceo"]),
            q("Would you handle the key the same way, now that people are losing money?", "Skulle ni hantera nyckeln på samma sätt, nu när folk förlorar pengar?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("Your website is still down, so anyone who searches for the agency finds the fake page first.", "Er webbplats ligger fortfarande nere, så den som söker efter myndigheten hittar den falska sidan först.")],
        decision: dec("d3", "comms", ["Who speaks, and what do they say?", "Vem talar, och vad säger de?"], [
          ["The director general goes on national radio and television: what happened, that it was your sender, and what to do.", "Generaldirektören går ut i riksradio och tv: vad som hänt, att det var er avsändare, och vad folk ska göra."],
          ["A joint statement with the water utility, the banks and the police, so no single voice carries it.", "Ett gemensamt uttalande med vattenbolaget, bankerna och polisen, så att ingen enskild röst bär det."],
          ["Let the water utility and the banks speak; the agency keeps a low profile until the website is back.", "Låt vattenbolaget och bankerna tala; myndigheten håller en låg profil tills webbplatsen är tillbaka."]
        ], {
          knowns: [["The fake text led to a phishing page; people are losing money; the water is safe.", "Det falska sms:et ledde till en nätfiskesida; folk förlorar pengar; vattnet är säkert."]],
          uncertainties: [["Whether people trust the agency enough to listen to it now.", "Om folk litar tillräckligt på myndigheten för att lyssna på den nu."]],
          tradeoffs: {
            operational: ["A joint statement takes time to agree; a single voice is fast.", "Ett gemensamt uttalande tar tid att enas om; en enskild röst är snabb."],
            security: ["Every hour the page is up, more logins are stolen.", "Varje timme sidan ligger uppe stjäls fler inloggningar."],
            legal: ["The message was sent in your name; you cannot hand that responsibility over.", "Meddelandet skickades i ert namn; det ansvaret kan ni inte lämna över."],
            reputational: ["Stepping forward admits the failure; staying quiet looks like hiding.", "Att kliva fram medger misslyckandet; att tiga ser ut som att gömma sig."]
          },
          evaluation: [["Takes ownership of a message sent in the agency's name and gives people clear actions now", "Tar ansvar för ett meddelande som skickats i myndighetens namn och ger folk tydliga åtgärder nu"]]
        }),
        facilitator: fac(
          ["The hoax was cover for fraud. The room may still be thinking about evacuation; move them on.", "Bluffen var täckmantel för bedrägeri. Rummet kanske fortfarande tänker på evakueringen; flytta dem vidare."],
          ["Own it publicly, with partners beside you, and give three clear actions: stay home, do not click, call your bank.", "Ta ansvar offentligt, med partnerna bredvid er, och ge tre tydliga åtgärder: stanna hemma, klicka inte, ring din bank."],
          [["Ask: what three words do you want every resident to remember tonight?", "Fråga: vilka tre ord vill ni att varje invånare ska minnas i kväll?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 360,
        title: L(["What else they took", "Vad mer de tog"]),
        twist: L(["Forty-five minutes before the text, the same key exported the gateway's entire contact list: {{num.contacts|number}} phone numbers, each stored with a personal identity number.", "Fyrtiofem minuter före sms:et exporterade samma nyckel sms-tjänstens hela kontaktlista: {{num.contacts|number}} telefonnummer, vart och ett lagrat med ett personnummer."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "C" }, narrativeAppend: { en: "Because the agency kept a low profile, the national evening news describes it as “the agency that hid behind the banks”.", sv: "Eftersom myndigheten höll en låg profil beskriver kvällsnyheterna den som ”myndigheten som gömde sig bakom bankerna”." } }
        ],
        assumptionChallenged: L(["Only one region was affected.", "Bara en region drabbades."]),
        reveals: ["hf-list"],
        narrative: L([
          "{{time.T+360|clock}}. The provider's full log arrives. Forty-five minutes before the text went out, the same key exported the agency's entire contact list: {{num.contacts|number}} residents across the whole country, each phone number stored next to a personal identity number, because the contractor used it as the lookup key.\n\n{{person.dpo.name}} points out that the list includes people with protected identities, whose phone numbers are meant to be known to almost no one.",
          "Klockan {{time.T+360|clock}}. Leverantörens fullständiga logg kommer. Fyrtiofem minuter innan sms:et gick ut exporterade samma nyckel myndighetens hela kontaktlista: {{num.contacts|number}} invånare i hela landet, där varje telefonnummer lagras bredvid ett personnummer, eftersom konsulten använde det som söknyckel.\n\n{{person.dpo.name}} påpekar att listan innehåller personer med skyddade personuppgifter, vars telefonnummer bara ska vara kända för nästan ingen."
        ]),
        injects: [
          inj("i4-1", 360, "forensicFinding", "supplier", "critical", "confirmed", [
            "Contact-list export via API, {{num.contacts|number}} rows (phone number, personal identity number, preferred language). Export completed 45 minutes before the send job. Downloaded once.",
            "Export av kontaktlistan via API, {{num.contacts|number}} rader (telefonnummer, personnummer, föredraget språk). Exporten klar 45 minuter före utskicket. Nedladdad en gång."
          ], { reveals: ["hf-list"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Why did the text gateway hold personal identity numbers at all?", "Varför hade sms-tjänsten över huvud taget personnummer?", ["ciso", "dpo"]),
            q("Which of the residents on the list have protected identities?", "Vilka av invånarna på listan har skyddade personuppgifter?", ["serviceOwner"]),
            q("Did your public statement reach people before the list could be used against them?", "Nådde ert offentliga uttalande ut innan listan kunde användas mot dem?", ["comms"], "d3")
          ],
          executive: [
            q("Who must you notify, and how quickly?", "Vem måste ni anmäla till, och hur snabbt?", ["dpo", "legal"]),
            q("What do you tell the people with protected identities, and how do you reach them safely?", "Vad säger ni till personerna med skyddade personuppgifter, och hur når ni dem säkert?", ["ceo"]),
            q("Would you choose the same voice again, knowing this is now a national breach?", "Skulle ni välja samma röst igen, med vetskap om att det här nu är en nationell incident?", ["comms"], "d3")
          ]
        },
        challenges: [ch("Telling {{num.contacts|number}} people by text that their data leaked, from the sender that lied this morning, may look like the next scam.", "Att berätta för {{num.contacts|number}} personer via sms att deras uppgifter läckt, från avsändaren som ljög i morse, kan se ut som nästa bedrägeri.")],
        decision: dec("d4", "dpo", ["How do you handle the breach?", "Hur hanterar ni personuppgiftsincidenten?"], [
          ["Report to {{reg.dpaShort}} today, contact people with protected identities personally first, then inform everyone else by letter.", "Anmäl till {{reg.dpaShort}} i dag, kontakta personer med skyddade personuppgifter personligen först, och informera sedan alla andra per brev."],
          ["Report to {{reg.dpaShort}} today and announce it publicly; individual letters later.", "Anmäl till {{reg.dpaShort}} i dag och gå ut med det offentligt; personliga brev senare."],
          ["Report to {{reg.dpaShort}} within the deadline, after the contractor confirms exactly what was exported.", "Anmäl till {{reg.dpaShort}} inom tidsfristen, efter att konsulten bekräftat exakt vad som exporterades."]
        ], {
          knowns: [["The full contact list, with personal identity numbers, was exported before the attack.", "Hela kontaktlistan, med personnummer, exporterades före angreppet."]],
          uncertainties: [["What the attackers will do with the list, and whether they will sell it.", "Vad angriparna gör med listan, och om de säljer den."]],
          tradeoffs: {
            operational: ["Personal contact with protected people takes days; a public notice takes minutes.", "Personlig kontakt med skyddade personer tar dagar; ett offentligt meddelande tar minuter."],
            security: ["A public announcement tells every criminal the list exists.", "Ett offentligt meddelande talar om för varje kriminell att listan finns."],
            legal: ["The reporting deadline runs from now, not from the contractor's confirmation.", "Tidsfristen för anmälan löper från nu, inte från konsultens bekräftelse."],
            reputational: ["The agency lied this morning, by no fault of its own; it cannot afford to be slow now.", "Myndigheten ljög i morse, utan egen förskyllan; den har inte råd att vara långsam nu."]
          },
          evaluation: [["Protects the most exposed people first and reports promptly, without waiting for perfect information", "Skyddar de mest utsatta först och anmäler skyndsamt, utan att vänta på fullständig information"]]
        }),
        facilitator: fac(
          ["The hoax was the visible part; the list is the lasting harm. Protected identities make it personal.", "Bluffen var den synliga delen; listan är den bestående skadan. Skyddade personuppgifter gör det personligt."],
          ["Report today, reach people with protected identities first through a safe channel, and inform everyone else without using the text channel.", "Anmäl i dag, nå personer med skyddade personuppgifter först via en säker kanal, och informera alla andra utan att använda sms-kanalen."],
          [["Ask: how do you warn someone in hiding without revealing them in the process?", "Fråga: hur varnar ni någon som håller sig gömd utan att avslöja hen på vägen?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        title: L(["Who speaks for the state", "Vem som talar för staten"]),
        twist: L(["The government's crisis coordination group orders the agency to stop all text messages for a month, and to route every public statement through the government offices.", "Regeringens samordningsgrupp för kriser beordrar myndigheten att stoppa alla sms i en månad och att låta varje offentligt uttalande gå via regeringskansliet."]),
        twistKind: "authority",
        reconsider: { decision: "d2", pressure: { en: "The government now wants your text channel silent for a month. Whatever you did with the key on the first morning decides whether that is necessary, or an overreaction you could argue against. Would you do the same?", sv: "Regeringen vill nu att er sms-kanal tystnar i en månad. Vad ni än gjorde med nyckeln den första morgonen avgör om det är nödvändigt, eller en överreaktion ni kan argumentera emot. Skulle ni göra likadant?" } },
        branches: [
          { when: { decision: "d4", option: "B" }, narrativeAppend: { en: "Because the breach was announced publicly first, a criminal forum is already advertising “the agency list, with ID numbers” for sale.", sv: "Eftersom incidenten först meddelades offentligt annonserar ett kriminellt forum redan ut ”myndighetens lista, med personnummer” till försäljning." } }
        ],
        assumptionChallenged: L(["We are in charge of our own crisis.", "Vi leder vår egen kris."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The government's crisis coordination group meets. A hostile foreign broadcaster is already running the story as “a state that cannot protect its own citizens”, and the group wants one voice.\n\nIts decision: the agency stops every text message for a month, including sign-in codes and payment reminders, and every public statement goes through the government offices first. {{person.serviceOwner.name}} says that without text codes, about a fifth of residents cannot sign in to e-services at all.",
          "{{time.T+1440|weekday|cap}}. Regeringens samordningsgrupp för kriser sammanträder. En fientlig utländsk kanal kör redan nyheten som ”en stat som inte kan skydda sina egna medborgare”, och gruppen vill ha en enda röst.\n\nDess beslut: myndigheten stoppar alla sms i en månad, även inloggningskoder och betalningspåminnelser, och varje offentligt uttalande går först via regeringskansliet. {{person.serviceOwner.name}} säger att utan sms-koder kan ungefär en femtedel av invånarna inte logga in i e-tjänsterna alls."
        ]),
        injects: [
          inj("i5-1", 1440, "executiveMessage", "management", "high", "confirmed", [
            "Government crisis coordination: “All text-message communication from the agency to cease for 30 days. All public statements on the incident to be cleared with the government offices before release.”",
            "Regeringens krissamordning: ”All sms-kommunikation från myndigheten upphör i 30 dagar. Alla offentliga uttalanden om incidenten ska stämmas av med regeringskansliet före publicering.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What is the safe minimum text service you could keep running?", "Vilken är den säkra minsta sms-tjänst ni skulle kunna behålla?", ["serviceOwner", "ciso"]),
            q("How do people sign in without text codes?", "Hur loggar folk in utan sms-koder?", ["cio"]),
            q("Is the channel now secure enough to argue for keeping it?", "Är kanalen nu tillräckligt säker för att argumentera för att behålla den?", ["ciso"], "d2")
          ],
          executive: [
            q("Can the government order an agency to stop a service like this?", "Kan regeringen beordra en myndighet att stoppa en tjänst på det här sättet?", ["legal"]),
            q("Who answers to residents who cannot sign in for a month?", "Vem svarar invånarna som inte kan logga in på en månad?", ["ceo"]),
            q("Would you handle the key the same way, knowing it led here?", "Skulle ni hantera nyckeln på samma sätt, med vetskap om att det ledde hit?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("The government offices take a day to clear each statement; the next phishing wave will not wait a day.", "Regeringskansliet behöver en dag för att stämma av varje uttalande; nästa våg av nätfiske väntar inte en dag.")],
        decision: dec("d5", "ceo", ["How do you respond to the order?", "Hur svarar ni på beslutet?"], [
          ["Comply with the review of statements, but argue in writing to keep sign-in codes running on a new, restricted key.", "Följ avstämningen av uttalanden, men argumentera skriftligt för att behålla inloggningskoderna med en ny, begränsad nyckel."],
          ["Comply in full and set up alternative sign-in at local offices for people who need it.", "Följ beslutet fullt ut och ordna alternativ inloggning på lokalkontoren för dem som behöver det."],
          ["Point out that the agency is responsible for its own services under law, and keep text codes running.", "Påpeka att myndigheten enligt lag ansvarar för sina egna tjänster, och behåll sms-koderna."]
        ], {
          knowns: [["The government wants one voice and a month of silence on text; a fifth of residents rely on text codes.", "Regeringen vill ha en röst och en månads tystnad i sms; en femtedel av invånarna är beroende av sms-koder."]],
          uncertainties: [["Whether the new key is truly safe, and how long the political pressure will last.", "Om den nya nyckeln verkligen är säker, och hur länge det politiska trycket varar."]],
          tradeoffs: {
            operational: ["A month without text codes locks many people out of services they depend on.", "En månad utan sms-koder stänger ute många från tjänster de är beroende av."],
            security: ["Any text from your sender is now a phishing template.", "Varje sms från er avsändare är nu en mall för nätfiske."],
            legal: ["Agencies are independent in applying law; the government steers through decisions and funding.", "Myndigheter är självständiga i myndighetsutövning; regeringen styr genom beslut och anslag."],
            reputational: ["Resisting the government looks defiant; complying looks like losing control.", "Att stå emot regeringen ser trotsigt ut; att foga sig ser ut som att tappa kontrollen."]
          },
          evaluation: [["Coordinates with government on the message while keeping essential services running safely for residents", "Samordnar budskapet med regeringen men håller samtidigt viktiga tjänster igång på ett säkert sätt för invånarna"]]
        }),
        facilitator: fac(
          ["The authority question is real; the right answer depends on the room's legal framework. Push on who carries the consequences.", "Frågan om befogenheter är verklig; rätt svar beror på rummets rättsliga ramar. Tryck på vem som bär konsekvenserna."],
          ["Coordinate the message, argue in writing for a safe minimum service, and make sure nobody is left unable to reach the agency.", "Samordna budskapet, argumentera skriftligt för en säker minimitjänst och se till att ingen står utan möjlighet att nå myndigheten."],
          [["Ask: who in this room would sign the letter to the government?", "Fråga: vem i det här rummet skulle skriva under brevet till regeringen?"]]
        )
      },
      {
        id: "p6",
        clock: 40320,
        title: L(["The real warning", "Den riktiga varningen"]),
        twist: L(["Four weeks later, a real warning goes out about a chemical fire. In the same region, far fewer people act on it. Many blocked the agency's sender after the fake.", "Fyra veckor senare går en riktig varning ut om en kemikaliebrand. I samma region agerar betydligt färre. Många blockerade myndighetens avsändare efter förfalskningen."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "The real warning was ignored. How the agency spoke on the first morning, and who stood next to it, decided whether people trust it now. Would you choose the same voice?", sv: "Den riktiga varningen ignorerades. Hur myndigheten talade den första morgonen, och vem som stod bredvid den, avgjorde om folk litar på den nu. Skulle ni välja samma röst?" } },
        branches: [
          { when: { decision: "d5", option: "C" }, narrativeAppend: { en: "Because the agency kept its text codes running against the government's order, the review now also asks whether the agency acted outside its mandate.", sv: "Eftersom myndigheten behöll sms-koderna mot regeringens beslut frågar granskningen nu också om myndigheten agerade utanför sitt mandat." } }
        ],
        assumptionChallenged: L(["Once corrected, trust comes back.", "När det väl är rättat kommer förtroendet tillbaka."]),
        reveals: ["hf-ignored"],
        narrative: L([
          "Four weeks later. A fire at a chemical plant sends a smoke plume over the same region. The regional rescue service sends a warning through the national alert system: close windows, stay inside. Follow-up surveys show far fewer people acted on it than in earlier warnings, and the most common reason given is: “after the fake one, I didn't know what to believe.”\n\nThe government's inquiry wants the agency's view on the future of text messages from public bodies.",
          "Fyra veckor senare. En brand i en kemikaliefabrik sprider en rökplym över samma region. Regionens räddningstjänst skickar en varning via det nationella varningssystemet: stäng fönster, stanna inne. Uppföljande enkäter visar att betydligt färre agerade än vid tidigare varningar, och det vanligaste skälet är: ”efter den falska visste jag inte vad jag skulle tro.”\n\nRegeringens utredning vill ha myndighetens syn på framtiden för sms från offentliga organ."
        ]),
        injects: [
          inj("i6-1", 40320, "impactReport", "management", "high", "confirmed", [
            "Survey after the chemical fire warning: share who acted on it well below earlier warnings. Most common reason: “after the fake one, I didn't know what to believe.” About one in eight in the region had blocked the agency's sender.",
            "Enkät efter varningen om kemikaliebranden: andelen som agerade klart lägre än vid tidigare varningar. Vanligaste skälet: ”efter den falska visste jag inte vad jag skulle tro.” Ungefär var åttonde i regionen hade blockerat myndighetens avsändare."
          ], { reveals: ["hf-ignored"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How could residents verify that a public message is genuine?", "Hur skulle invånarna kunna kontrollera att ett offentligt meddelande är äkta?", ["ciso"]),
            q("What did the contractor change, and how do you know?", "Vad har konsulten ändrat, och hur vet ni det?", ["supplierManager"]),
            q("Did the voice you chose on the first morning help or hurt the real warning?", "Hjälpte eller stjälpte den röst ni valde den första morgonen den riktiga varningen?", ["comms"], "d3")
          ],
          executive: [
            q("Should agencies send text messages to the public at all?", "Bör myndigheter över huvud taget skicka sms till allmänheten?", ["ceo"]),
            q("What is the agency's share of the responsibility for the ignored warning?", "Vad är myndighetens del av ansvaret för den ignorerade varningen?", ["ceo", "legal"]),
            q("Would you speak the same way on the first morning again?", "Skulle ni tala på samma sätt den första morgonen igen?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("The contractor says the developer who published the key has been let go, and considers the matter closed.", "Konsulten säger att utvecklaren som publicerade nyckeln har fått gå, och anser att saken är utagerad.")],
        decision: dec("d6", "ceo", ["What do you recommend to the inquiry?", "Vad rekommenderar ni utredningen?"], [
          ["Keep text for routine notices only, never with links, and leave public warnings to the national alert system alone.", "Behåll sms bara för rutinmeddelanden, aldrig med länkar, och lämna varningar till allmänheten helt åt det nationella varningssystemet."],
          ["Stop sending text messages altogether and move notices into the e-services inbox.", "Sluta skicka sms helt och flytta aviseringar till e-tjänsternas inkorg."],
          ["Keep text as it is, with the security fixes, and invest in public awareness of how to verify messages.", "Behåll sms som det är, med säkerhetsåtgärderna, och satsa på att informera allmänheten om hur meddelanden kontrolleras."]
        ], {
          knowns: [["The fake damaged trust in real warnings; the key leak was a basic control failure.", "Förfalskningen skadade förtroendet för riktiga varningar; nyckelläckan var ett grundläggande kontrollfel."]],
          uncertainties: [["How long it takes for trust in public messages to recover.", "Hur lång tid det tar för förtroendet för offentliga meddelanden att återhämta sig."]],
          tradeoffs: {
            operational: ["Removing text excludes people who rely on it; keeping it keeps the risk.", "Att ta bort sms stänger ute dem som är beroende av det; att behålla det behåller risken."],
            security: ["A message with a link is always a phishing template.", "Ett meddelande med en länk är alltid en mall för nätfiske."],
            legal: ["Agencies must be reachable for everyone, including people without e-ID.", "Myndigheter måste vara nåbara för alla, även personer utan e-legitimation."],
            reputational: ["The inquiry will judge the agency on what it learned, not only on what went wrong.", "Utredningen kommer att bedöma myndigheten efter vad den lärde sig, inte bara efter vad som gick fel."]
          },
          evaluation: [["Makes public messages harder to fake and easier to verify, without shutting people out", "Gör offentliga meddelanden svårare att förfalska och lättare att kontrollera, utan att stänga ute någon"]]
        }),
        facilitator: fac(
          ["The real harm arrived a month later, in a different crisis. Make the room feel that connection.", "Den verkliga skadan kom en månad senare, i en annan kris. Låt rummet känna den kopplingen."],
          ["Separate warnings from notices, remove links from public texts, and treat supplier keys as crown jewels.", "Skilj varningar från aviseringar, ta bort länkar ur sms till allmänheten och behandla leverantörers nycklar som kronjuveler."],
          [["Ask: what would make you believe the next warning you receive?", "Fråga: vad skulle få dig att tro på nästa varning du får?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The fake was corrected within hours and the key was closed, but {{num.stolen|currency}} was stolen from residents, a national contact list with identity numbers is in criminal hands, and a real warning weeks later reached fewer people than it should have.",
        "Förfalskningen rättades inom några timmar och nyckeln stängdes, men {{num.stolen|currency}} stals från invånare, en rikstäckande kontaktlista med personnummer finns i kriminella händer, och en riktig varning några veckor senare nådde färre än den borde ha gjort."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Correct a false warning on every trusted channel at once, not only on the one that lied.", "Rätta en falsk varning i varje betrodd kanal samtidigt, inte bara i den som ljög."]),
        L(["A supplier's API key can speak in your name; treat it like a crown jewel.", "En leverantörs API-nyckel kan tala i ert namn; behandla den som en kronjuvel."]),
        L(["A hoax can hide a data theft; look at everything the key could do.", "En bluff kan dölja en datastöld; titta på allt nyckeln kunde göra."]),
        L(["Trust in public warnings is shared; damage to one sender hurts every authority.", "Förtroendet för varningar till allmänheten är gemensamt; skada på en avsändare drabbar alla myndigheter."])
      ],
      assumptionsVsReality: [
        avr(["Someone broke into our systems.", "Någon har brutit sig in i våra system."], ["A contractor published the key that sends in our name.", "En konsult publicerade nyckeln som skickar i vårt namn."], "p2"),
        avr(["Only one region was affected.", "Bara en region drabbades."], ["The whole national contact list was exported.", "Hela den rikstäckande kontaktlistan exporterades."], "p4"),
        avr(["Once corrected, trust comes back.", "När det väl är rättat kommer förtroendet tillbaka."], ["A real warning weeks later was ignored.", "En riktig varning några veckor senare ignorerades."], "p6")
      ],
      strengthsToLookFor: [
        L(["Using several trusted channels for the correction", "Att använda flera betrodda kanaler för rättelsen"]),
        L(["Revoking the key despite the outage", "Att återkalla nyckeln trots avbrottet"]),
        L(["Reaching people with protected identities first", "Att nå personer med skyddade personuppgifter först"])
      ],
      commonGaps: [
        L(["Correcting only on the compromised channel", "Att bara rätta i den komprometterade kanalen"]),
        L(["Missing the contact-list export", "Att missa exporten av kontaktlistan"]),
        L(["Letting partners speak for a message sent in your name", "Att låta partner tala för ett meddelande som skickats i ert namn"])
      ],
      suggestedActions: [
        act(["Restrict every supplier API key by address and expiry, and scan public code repositories for your keys.", "Begränsa varje leverantörsnyckel efter adress och giltighetstid, och sök i publika kodförråd efter era nycklar."], "ciso", "high"),
        act(["Never store personal identity numbers in a messaging service.", "Lagra aldrig personnummer i en meddelandetjänst."], "dpo", "high"),
        act(["Agree in advance with partners and broadcasters how to correct a false public message.", "Kom överens i förväg med partner och programföretag om hur ett falskt meddelande till allmänheten rättas."], "comms", "high"),
        act(["Remove links from public text messages, and tell residents you never send them.", "Ta bort länkar ur sms till allmänheten, och berätta för invånarna att ni aldrig skickar sådana."], "serviceOwner", "medium")
      ]
    }
  });
})();
