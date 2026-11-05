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
  const { L, q, ch, inj, dec, fac, act, avr, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s41-public-warning-spoof",
    version: 1,
    category: "public-warning-spoof",
    archetype: "third-party-origin",
    emblem: "public-warning-spoof",
    title: L(["The Fake Evacuation", "Den falska evakueringen"]),
    summary: L([
      "Your agency's own text sender has just told tens of thousands of people that their water is poisoned and that they must leave their homes. Your website is down. The only fast way to tell them it is false is the channel that lied to them.",
      "Er myndighets egen sms-avsändare har just sagt till tiotusentals personer att deras vatten är förgiftat och att de måste lämna sina hem. Er webbplats ligger nere. Det enda snabba sättet att säga att det är falskt är kanalen som ljög för dem."
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
          evaluation: [["Reaches the affected people within minutes through a channel they will believe", "Når de berörda inom några minuter via en kanal de kommer att tro på"]],
          pushback: {
            A: [
              pb(["Two texts, one sender", "Två sms, en avsändare"], ["Minutes after your correction, residents post screenshots of both texts side by side and ask which one is the fake. Some say the correction must be the scam, since it came from the same sender. Do you send a third text to explain, or stop using the channel?", "Några minuter efter er rättelse lägger invånare ut skärmbilder av båda sms:en bredvid varandra och frågar vilket som är falskt. Vissa menar att rättelsen måste vara bluffen, eftersom den kom från samma avsändare. Skickar ni ett tredje sms för att förklara, eller slutar ni använda kanalen?"]),
              pb(["Nobody vouches for the channel", "Ingen går i god för kanalen"], ["The provider's weekend support cannot yet say whether anyone else is still able to send from your sender name. If a new fake arrives after your correction, it will look like your reply. Do you keep sending on a channel nobody can vouch for?", "Leverantörens helgsupport kan ännu inte säga om någon annan fortfarande kan skicka med ert avsändarnamn. Om en ny förfalskning kommer efter er rättelse kommer den att se ut som ert svar. Fortsätter ni skicka i en kanal som ingen kan gå i god för?"]),
              pb(["The water utility objects", "Vattenbolaget protesterar"], ["The regional water utility calls: your correction implies the water is safe, but nobody asked them and their own checks are not finished. They do not want your agency vouching for their water. Do you change the wording, or send it as it is?", "Regionens vattenbolag ringer: er rättelse antyder att vattnet är säkert, men ingen har frågat dem och deras egna kontroller är inte klara. De vill inte att er myndighet går i god för deras vatten. Ändrar ni formuleringen, eller skickar ni den som den är?"])
            ],
            B: [
              pb(["Waiting for the bulletin", "I väntan på nyhetssändningen"], ["The national radio newsroom can read your correction in the next bulletin, but wants written confirmation from your director general first. It is early on a weekend morning, and few in the region have the radio on. How many more families leave before it airs?", "Riksradions nyhetsredaktion kan läsa upp er rättelse i nästa sändning, men vill först ha en skriftlig bekräftelse från er generaldirektör. Det är tidig helgmorgon och få i regionen har radion på. Hur många fler familjer hinner ge sig av innan den sänds?"]),
              pb(["The police want proof", "Polisen vill ha bevis"], ["The police duty officer will not announce that a text from your verified sender is false without proof, and your website, the obvious proof, is down. They ask how they can know the call is really from you. What do you give them, and who signs it?", "Polisens vakthavande vill inte gå ut med att ett sms från er verifierade avsändare är falskt utan bevis, och er webbplats, det självklara beviset, ligger nere. De frågar hur de kan veta att samtalet verkligen kommer från er. Vad ger ni dem, och vem skriver under?"]),
              pb(["They are reading their phones", "De tittar på sina telefoner"], ["The people who got the text are looking at their phones, not listening to the radio. Silence on the channel that warned them reads as confirmation, and the queue to the emergency number keeps growing. Do you still keep the text channel closed?", "De som fick sms:et tittar på sina telefoner, inte på radion. Tystnad i kanalen som varnade dem tolkas som en bekräftelse, och kön till nödnumret växer. Håller ni fortfarande sms-kanalen stängd?"])
            ],
            C: [
              pb(["Not before Monday", "Inte före måndag"], ["The provider's weekend support says a full security check of your account needs their specialists, who are back on Monday. Until then nobody can tell you the channel is safe. Do you wait for an answer that may take days?", "Leverantörens helgsupport säger att en fullständig säkerhetskontroll av ert konto kräver deras specialister, som är tillbaka på måndag. Till dess kan ingen säga att kanalen är säker. Väntar ni på ett svar som kan dröja flera dagar?"]),
              pb(["The care home is moving out", "Boendet flyttar ut"], ["A municipality calls: a care home has started moving its residents out because of your text. The manager asks one thing: is it true? If you can tell them on the phone now, why not tell everyone?", "En kommun ringer: ett äldreboende har börjat flytta ut de boende på grund av ert sms. Föreståndaren frågar bara en sak: stämmer det? Om ni kan säga det i telefon nu, varför inte säga det till alla?"]),
              pb(["Silence as confirmation", "Tystnad som bekräftelse"], ["Comments under the most shared post say: “If it were fake, they would have said so by now.” Every minute you check, the fake gains credibility it did not have at first. How long can you stay silent while you make sure?", "Kommentarerna under det mest delade inlägget säger: ”Om det vore falskt hade de sagt det vid det här laget.” Varje minut ni kontrollerar får förfalskningen en trovärdighet den inte hade från början. Hur länge kan ni tiga medan ni försäkrar er?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the correction", "Efter rättelsen"], [
              io(["Families turn back", "Familjerna vänder"], ["Within minutes, residents post that they are unpacking the car. The duty officer reports the emergency number queue starting to shrink.", "Inom några minuter skriver invånare att de packar ur bilen. Vakthavande rapporterar att kön till nödnumret börjar krympa."], ["The correction from your sender reached most recipients within minutes.", "Rättelsen från er avsändare nådde de flesta mottagare inom några minuter."], { meters: { trust: 1 } }),
              io(["The correction looks fake", "Rättelsen ser falsk ut"], ["Residents forward your correction to the police as “the second scam”. The emergency number queue doubles, and a local news site writes that nobody knows which text to believe.", "Invånare skickar vidare er rättelse till polisen som ”det andra bedrägeriet”. Kön till nödnumret fördubblas, och en lokal nyhetssajt skriver att ingen vet vilket sms man ska tro på."], ["Many residents took the correction itself for a second scam.", "Många invånare tog själva rättelsen för ett andra bedrägeri."], { reopen: true, meters: { trust: -1 } }),
              io(["Delivered, but read?", "Levererat, men läst?"], ["The provider confirms that every correction was delivered. Whether anyone has read it, nobody can say, and the posts about packed cars keep coming.", "Leverantören bekräftar att varje rättelse har levererats. Om någon har läst den kan ingen säga, och inläggen om packade bilar fortsätter."], ["Delivery of the correction is confirmed; whether people believed it is not.", "Att rättelsen levererades är bekräftat; om folk trodde på den är det inte."])
            ]),
            ir("i2", { notChosen: "A" }, ["Silence on the sender", "Tyst från avsändaren"], [
              io(["A municipality steps in", "En kommun kliver in"], ["A municipality in the region posts that the text is false, citing a call with your duty officer. The post spreads fast, but it carries the municipality's name, not yours.", "En kommun i regionen skriver att sms:et är falskt, med hänvisning till ett samtal med er vakthavande. Inlägget sprids snabbt, men det bär kommunens namn, inte ert."], ["A municipality's post, not yours, became the most shared correction.", "En kommuns inlägg, inte ert, blev den mest delade rättelsen."]),
              io(["The emergency line buckles", "Nödnumret går i knä"], ["The regional emergency number reports waits of more than half an hour. A genuine medical call was answered late because the line was full of questions about the text.", "Regionens nödnummer rapporterar väntetider på över en halvtimme. Ett äkta sjukvårdssamtal besvarades sent eftersom linjen var full av frågor om sms:et."], ["The emergency number was overloaded during the first hour.", "Nödnumret var överbelastat under den första timmen."], { reopen: true, meters: { media: 1 } }),
              io(["Quiet, but unexplained", "Lugnt, men oförklarat"], ["Social media goes quieter, and many seem to have ignored the text. Nobody can tell whether the families who left are coming back or still on the road.", "Det blir lugnare i sociala medier, och många verkar ha struntat i sms:et. Ingen kan säga om familjerna som gav sig av är på väg tillbaka eller fortfarande ute på vägarna."], ["Nobody knows how many people left their homes in the first hour.", "Ingen vet hur många som lämnade sina hem under den första timmen."])
            ])
          ]
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
          evaluation: [["Makes sure no one else can send in the agency's name, even at the cost of a short outage", "Ser till att ingen annan kan skicka i myndighetens namn, även till priset av ett kort avbrott"]],
          pushback: {
            A: [
              pb(["No codes, no answers", "Inga koder, inga svar"], ["Minutes after the revocation, residents trying to read about this morning in the e-services get no sign-in code. Some post that the agency has been taken over completely. What do you tell them, and through which channel, now that text is gone too?", "Några minuter efter återkallelsen får invånare som försöker läsa om morgonens händelser i e-tjänsterna ingen inloggningskod. Några skriver att myndigheten har tagits över helt. Vad säger ni till dem, och i vilken kanal, nu när sms också är borta?"]),
              pb(["The same developer", "Samma utvecklare"], ["The contractor says installing a new key properly takes until Monday, and the only person who knows the setup is the developer who published the old one. Do you let that person handle the new key, or stay without notifications for longer?", "Konsulten säger att det tar till måndag att installera en ny nyckel ordentligt, och den enda som kan uppsättningen är utvecklaren som publicerade den gamla. Låter ni den personen hantera den nya nyckeln, eller står ni utan aviseringar längre?"]),
              pb(["You silenced yourselves", "Ni tystade er själva"], ["Revoking also takes away your own way to reach the {{num.recipients|number}} people who got the fake. If more false information spreads today, you cannot answer it by text at all. Are you sure you want to silence yourselves before you know what comes next?", "Återkallelsen tar också bort ert eget sätt att nå de {{num.recipients|number}} personer som fick förfalskningen. Om mer falsk information sprids i dag kan ni inte bemöta den via sms alls. Är ni säkra på att ni vill tysta er själva innan ni vet vad som kommer härnäst?"])
            ],
            B: [
              pb(["Whose addresses?", "Vems adresser?"], ["The provider asks for the addresses to allow. Your notification service runs on the contractor's hosting, the same organisation the key leaked from. Does restricting the key to “your own addresses” actually shut out anyone you should worry about?", "Leverantören frågar vilka adresser som ska tillåtas. Er aviseringstjänst körs i konsultens driftmiljö, samma organisation som nyckeln läckte från. Stänger en begränsning till ”era egna adresser” verkligen ute någon ni borde oroa er för?"]),
              pb(["A week with a known key", "En vecka med en känd nyckel"], ["Internal audit asks why a key that has been public for eight months stays valid for another week. Anyone may have a copy, and you cannot see who. If anything else goes out in your name before then, what will you say you were waiting for?", "Internrevisionen frågar varför en nyckel som legat publikt i åtta månader ska gälla en vecka till. Vem som helst kan ha en kopia, och ni kan inte se vem. Om något mer skickas i ert namn innan dess, vad säger ni att ni väntade på?"]),
              pb(["The account is not yours", "Kontot är inte ert"], ["The provider says an address restriction needs a change request signed by the account holder, and the account holder is the contractor, not you. The contractor's contact person is not answering on a weekend morning. Who can actually authorise this today?", "Leverantören säger att en adressbegränsning kräver en ändringsbegäran undertecknad av kontoinnehavaren, och kontoinnehavaren är konsulten, inte ni. Konsultens kontaktperson svarar inte en helgmorgon. Vem kan faktiskt godkänna det här i dag?"])
            ],
            C: [
              pb(["The key does more than send", "Nyckeln gör mer än att skicka"], ["The size cap only applies to sending. The key still works from anywhere for everything else the gateway's interface allows, and the provider cannot list from memory what that includes. Do you leave a public key working when you do not know its full reach?", "Storleksgränsen gäller bara utskick. Nyckeln fungerar fortfarande varifrån som helst för allt annat som sms-tjänstens gränssnitt tillåter, och leverantören kan inte på rak arm räkna upp vad det omfattar. Låter ni en publik nyckel fungera när ni inte vet hur långt den når?"]),
              pb(["Your own sends are blocked", "Era egna utskick stoppas"], ["Monday's payment reminders go out in batches of thousands. With a cap of a hundred, your genuine sends are stopped too, unless someone at the provider lifts the cap by hand each time. Who decides which sends are real, and how do they know?", "Måndagens betalningspåminnelser går ut i omgångar om tusentals. Med en gräns på hundra stoppas även era äkta utskick, om inte någon hos leverantören lyfter gränsen för hand varje gång. Vem avgör vilka utskick som är äkta, och hur vet hen det?"]),
              pb(["The provider wants it in writing", "Leverantören vill ha det skriftligt"], ["The provider says a size cap is a favour, not a security control, and will not take responsibility for anything sent with a key you chose to keep. They want your decision in writing, signed. Who in this room signs it?", "Leverantören säger att en storleksgräns är en tjänst, inte en säkerhetsåtgärd, och tar inget ansvar för något som skickas med en nyckel ni valde att behålla. De vill ha ert beslut skriftligt och undertecknat. Vem i det här rummet skriver under?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the revocation", "Efter återkallelsen"], [
              io(["The door is shut", "Dörren är stängd"], ["Minutes after the revocation, the provider sees calls with the old key from abroad, all rejected. Someone was still trying.", "Några minuter efter återkallelsen ser leverantören anrop med den gamla nyckeln från utlandet, alla avvisade. Någon försökte fortfarande."], ["Attempts to use the old key were rejected after the revocation.", "Försök att använda den gamla nyckeln avvisades efter återkallelsen."]),
              io(["Sign-in stops everywhere", "Inloggningen stannar överallt"], ["Residents across the country get no sign-in codes. Phone support is overwhelmed, and people asking about this morning cannot reach their own cases.", "Invånare i hela landet får inga inloggningskoder. Telefonsupporten är överbelastad, och de som undrar över morgonen kommer inte åt sina egna ärenden."], ["Text sign-in codes were down for every resident while a new key was prepared.", "Sms-koderna för inloggning låg nere för alla invånare medan en ny nyckel förbereddes."], { meters: { trust: -1 } }),
              io(["A service nobody listed", "En tjänst ingen räknat med"], ["An appointment-reminder service that nobody at the agency knew about shared the same account, and it stops too. Its owner calls to ask why nobody warned them.", "En tjänst för påminnelser om besökstider, som ingen på myndigheten kände till, delade samma konto, och den stannar också. Dess ägare ringer och frågar varför ingen varnade dem."], ["An unlisted service on the same gateway account also stopped.", "En okänd tjänst på samma sms-konto stannade också."])
            ]),
            ir("i2", { notChosen: "A" }, ["The old key lives on", "Den gamla nyckeln lever kvar"], [
              io(["No new large sends", "Inga nya stora utskick"], ["In the first hour after your decision, the provider sees no new large send from your sender. The room may feel the worst is over.", "Under den första timmen efter ert beslut ser leverantören inget nytt stort utskick från er avsändare. Rummet kan få känslan av att det värsta är över."], ["The provider saw no new large send in the first hour after your decision.", "Leverantören såg inget nytt stort utskick under den första timmen efter ert beslut."]),
              io(["A second address tries", "En andra adress försöker"], ["The provider reports calls with the old key from a second address abroad, different from the first. Whoever has the key, it is not only one party.", "Leverantören rapporterar anrop med den gamla nyckeln från en andra adress utomlands, en annan än den första. Vem som än har nyckeln är det inte bara en aktör."], ["A second address abroad has tried the old key since your decision.", "En andra adress utomlands har provat den gamla nyckeln sedan ert beslut."], { reopen: true }),
              io(["The key on a forum", "Nyckeln på ett forum"], ["A screenshot of the repository, key visible, is posted on a public forum with the caption “the state's text password”. Reporters start asking whether it still works.", "En skärmbild av kodförrådet, med nyckeln synlig, läggs ut på ett publikt forum med texten ”statens sms-lösenord”. Reportrar börjar fråga om den fortfarande fungerar."], ["The leaked key has been shared well beyond the original repository.", "Den läckta nyckeln har spridits långt utanför det ursprungliga kodförrådet."], { meters: { media: 1 } })
            ])
          ]
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
          evaluation: [["Takes ownership of a message sent in the agency's name and gives people clear actions now", "Tar ansvar för ett meddelande som skickats i myndighetens namn och ger folk tydliga åtgärder nu"]],
          pushback: {
            A: [
              pb(["Live, after ten minutes", "Direkt, efter tio minuter"], ["The director general has had ten minutes of briefing. The first question on air will be why the agency's key was public for eight months. Is the director general ready to answer that live, and what happens if a fact comes out wrong?", "Generaldirektören har fått tio minuters genomgång. Den första frågan i sändning blir varför myndighetens nyckel låg publikt i åtta månader. Är generaldirektören redo att svara på det direkt, och vad händer om ett sakfel slinker ut?"]),
              pb(["The banks want other words", "Bankerna vill ha andra ord"], ["The banks ask the director general not to say “call your bank”: their lines are already full, and they want people to lock their accounts in the app instead. Your message and theirs now point in different directions. Which instruction do residents get?", "Bankerna ber generaldirektören att inte säga ”ring din bank”: deras linjer är redan fulla, och de vill att folk spärrar kontona i appen i stället. Ert budskap och deras pekar nu åt olika håll. Vilken instruktion får invånarna?"]),
              pb(["Saying “our sender”", "Att säga ”vår avsändare”"], ["Your legal adviser warns that saying on national television that it was your sender may be read as admitting liability for what residents lost on the page. Do you still say it plainly, or soften it, knowing a softened version will sound like evasion?", "Er jurist varnar för att det kan tolkas som att ni erkänner skadeståndsansvar för det invånarna förlorat på sidan, om ni säger i riks-tv att det var er avsändare. Säger ni det ändå rakt ut, eller mildrar ni det, med vetskap om att en mildrad version låter som undanflykter?"])
            ],
            B: [
              pb(["No agreed text yet", "Ännu ingen gemensam text"], ["Every partner has its lawyers on the wording. The banks will not write “the agency's sender”; the police will not write “fraud” before an investigation. An hour later there is still no text, and the page is still up. How long do you wait for agreement?", "Varje part har sina jurister på formuleringen. Bankerna vill inte skriva ”myndighetens avsändare”; polisen vill inte skriva ”bedrägeri” före en utredning. En timme senare finns fortfarande ingen text, och sidan ligger kvar. Hur länge väntar ni på enighet?"]),
              pb(["The water utility steps out", "Vattenbolaget kliver av"], ["The water utility does not want its name next to a fraud warning. It has already said the water is fine and wants nothing to do with stolen bank logins. Do you go ahead without it, and who then says the water is safe?", "Vattenbolaget vill inte ha sitt namn bredvid en bedrägerivarning. Det har redan sagt att vattnet är säkert och vill inte förknippas med stulna bankinloggningar. Går ni vidare utan det, och vem säger då att vattnet är säkert?"]),
              pb(["Four names, no owner", "Fyra namn, ingen ägare"], ["A reporter asks the radio host's question again: who sent the text? A statement signed by four bodies answers that nobody did. Does sharing the voice look like sharing out the blame for a message sent in your name?", "En reporter ställer radioprogramledarens fråga igen: vem skickade sms:et? Ett uttalande undertecknat av fyra organisationer svarar att ingen gjorde det. Ser det gemensamma uttalandet ut som att ni sprider ut skulden för ett meddelande som skickades i ert namn?"])
            ],
            C: [
              pb(["The banks name you", "Bankerna nämner er"], ["The banks' statement says customers were tricked by “a text from {{org.name}}”. Now the agency is named in every report, but not speaking. Do you stay silent while others describe your failure for you?", "Bankernas uttalande säger att kunderna lurades av ”ett sms från {{org.name}}”. Nu nämns myndigheten i varje inslag, men den säger ingenting. Fortsätter ni tiga medan andra beskriver ert misslyckande åt er?"]),
              pb(["Nobody says “go home”", "Ingen säger ”åk hem”"], ["The water utility talks about water and the banks talk about logins. Nobody tells the families who left that they can go home, because that was your message to take back. Who tells them, if not you?", "Vattenbolaget talar om vatten och bankerna om inloggningar. Ingen säger till familjerna som gav sig av att de kan åka hem, eftersom det var ert meddelande att ta tillbaka. Vem säger det till dem, om inte ni?"]),
              pb(["No date for the website", "Inget datum för webbplatsen"], ["IT reports that the website stays down as long as the traffic flood lasts, and nobody can say when it ends. Your low profile was meant to last until the website is back, and now it has no end date. How long are you prepared to stay quiet?", "It-avdelningen meddelar att webbplatsen ligger nere så länge trafikfloden pågår, och ingen kan säga när den slutar. Er låga profil skulle vara tills webbplatsen var tillbaka, och nu har den inget slutdatum. Hur länge är ni beredda att tiga?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The director general on air", "Generaldirektören i sändning"], [
              io(["Clear and calm", "Tydligt och lugnt"], ["The interview is replayed all afternoon. The banks report that more customers are locking their accounts, and the radio host says it was “the first straight answer today”.", "Intervjun repriseras hela eftermiddagen. Bankerna rapporterar att fler kunder spärrar sina konton, och radioprogramledaren säger att det var ”dagens första raka svar”."], ["The director general's interview became the clearest message of the day.", "Generaldirektörens intervju blev dagens tydligaste budskap."], { meters: { trust: 1 } }),
              io(["A wrong fact, live", "Ett sakfel i direktsändning"], ["The director general says the website “was hacked”. IT says it was only overloaded, and reporters now ask which version is true and what else was wrong.", "Generaldirektören säger att webbplatsen ”hackades”. It-avdelningen säger att den bara var överbelastad, och reportrar frågar nu vilken version som stämmer och vad mer som var fel."], ["The director general wrongly said live that the website had been hacked.", "Generaldirektören sa felaktigt i direktsändning att webbplatsen hade hackats."], { reopen: true, meters: { media: 1 } }),
              io(["“We are still finding out”", "”Vi håller på att ta reda på det”"], ["Asked why the key was public, the director general says the agency is still finding out. Some praise the honesty; a clip titled “they don't know” is shared widely.", "På frågan varför nyckeln var publik säger generaldirektören att myndigheten fortfarande håller på att ta reda på det. Vissa berömmer ärligheten; ett klipp med rubriken ”de vet inte” sprids brett."], ["A clip of the director general saying “we are still finding out” is widely shared.", "Ett klipp där generaldirektören säger ”vi håller på att ta reda på det” sprids brett."])
            ]),
            ir("i2", { notChosen: "A" }, ["No face for the agency", "Inget ansikte för myndigheten"], [
              io(["Partners carry it", "Partnerna bär det"], ["The banks' and the police's instructions are repeated on every channel, and the banks report fewer new logins on the fake page by the evening.", "Bankernas och polisens instruktioner upprepas i varje kanal, och bankerna rapporterar färre nya inloggningar på den falska sidan fram mot kvällen."], ["Partners' instructions to residents were widely followed in the afternoon.", "Partnernas instruktioner till invånarna följdes brett under eftermiddagen."]),
              io(["An empty chair", "En tom stol"], ["The local radio host invites the agency's head to the studio, gets no answer, and airs a segment beside an empty chair. Listeners call in to ask who is actually responsible.", "Den lokala radioprogramledaren bjuder in myndighetens chef till studion, får inget svar och sänder ett inslag bredvid en tom stol. Lyssnare ringer in och frågar vem som egentligen bär ansvaret."], ["Local radio aired an empty chair where the agency was invited to speak.", "Lokalradion sände en tom stol där myndigheten var inbjuden att tala."], { reopen: true, meters: { media: 1 } }),
              io(["An unnamed source", "En anonym källa"], ["A newspaper quotes an unnamed agency official saying the contractor is to blame. It is not your line, but it is now the agency's voice in the story.", "En tidning citerar en anonym tjänsteman på myndigheten som säger att konsulten bär skulden. Det är inte ert budskap, men det är nu myndighetens röst i nyheten."], ["An unnamed agency source was quoted blaming the contractor.", "En anonym källa på myndigheten citerades med att konsulten bär skulden."])
            ])
          ]
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
          evaluation: [["Protects the most exposed people first and reports promptly, without waiting for perfect information", "Skyddar de mest utsatta först och anmäler skyndsamt, utan att vänta på fullständig information"]],
          pushback: {
            A: [
              pb(["Who are they?", "Vilka är de?"], ["The list does not say who has a protected identity; that register is held by another authority, whose staff are off until Monday. Without it you cannot tell whom to call first. Do you wait, or start calling without knowing who is most at risk?", "Listan säger inte vem som har skyddade personuppgifter; det registret förs av en annan myndighet, vars personal är ledig till måndag. Utan det vet ni inte vem ni ska ringa först. Väntar ni, eller börjar ni ringa utan att veta vem som är mest utsatt?"]),
              pb(["A call from an unknown number", "Ett samtal från okänt nummer"], ["Your staff will phone people in hiding from unknown numbers, on the day the agency's name was used for fraud. Some hang up; one asks how the caller got the number at all. How do you prove the call is really from you without making things worse?", "Er personal ska ringa personer som lever gömda från okända nummer, samma dag som myndighetens namn användes för bedrägeri. Några lägger på; en frågar hur den som ringer över huvud taget fick numret. Hur bevisar ni att samtalet verkligen kommer från er utan att göra saken värre?"]),
              pb(["Letters take weeks", "Brev tar veckor"], ["Printing and posting {{num.contacts|number}} letters takes weeks. Until then, everyone else on the list hears nothing from you while their data is in criminal hands. Is a letter fast enough, and what do you say if someone learns of it elsewhere first?", "Att trycka och posta {{num.contacts|number}} brev tar veckor. Till dess hör alla andra på listan ingenting från er, medan deras uppgifter finns i kriminella händer. Är ett brev snabbt nog, och vad säger ni om någon får veta det någon annanstans först?"])
            ],
            B: [
              pb(["Learning it from the news", "Att få veta det via nyheterna"], ["People with protected identities will hear on the news that their phone numbers and identity numbers leaked, before anyone has called them. A support organisation for people in hiding calls that unforgivable. Do you hold the announcement until they are warned?", "Personer med skyddade personuppgifter kommer att höra på nyheterna att deras telefonnummer och personnummer läckt, innan någon har ringt dem. En stödorganisation för personer som lever gömda kallar det oförlåtligt. Väntar ni med beskedet tills de är varnade?"]),
              pb(["A script for scammers", "Ett manus för bedragare"], ["Your announcement is a ready-made script: “your data was in the agency's leak, confirm your details here.” The banks expect a new wave of fraud calls using your name by tonight. Do you announce anyway, and what exactly do you tell people to watch for?", "Ert besked är ett färdigt manus: ”dina uppgifter fanns i myndighetens läcka, bekräfta dina uppgifter här.” Bankerna räknar med en ny våg av bedrägerisamtal i ert namn redan i kväll. Går ni ut ändå, och exakt vad säger ni åt folk att se upp med?"]),
              pb(["Which number do you give?", "Vilken siffra anger ni?"], ["The contractor asks you not to publish a number of affected people until it has checked the export itself. If you announce {{num.contacts|number}} and have to correct it, that is the agency's second false public message in two days. Do you give a number or not?", "Konsulten ber er att inte publicera något antal drabbade innan de själva har kontrollerat exporten. Om ni går ut med {{num.contacts|number}} och måste rätta det blir det myndighetens andra felaktiga meddelande till allmänheten på två dagar. Anger ni en siffra eller inte?"])
            ],
            C: [
              pb(["The clock is already running", "Klockan går redan"], ["Your legal adviser reminds you that the deadline runs from when you became aware, which was this afternoon, not from the contractor's confirmation. The contractor says confirmation may take a week. Are you prepared to report late, and to explain why?", "Er jurist påminner om att fristen löper från när ni fick kännedom, alltså i eftermiddags, inte från konsultens bekräftelse. Konsulten säger att bekräftelsen kan ta en vecka. Är ni beredda att anmäla för sent, och att förklara varför?"]),
              pb(["The people in hiding wait", "De som lever gömda får vänta"], ["While you wait for confirmation, people with protected identities carry on unaware that their numbers may be known. If one of them is found in that time, what will you say you were waiting for?", "Medan ni väntar på bekräftelsen lever personer med skyddade personuppgifter vidare utan att veta att deras nummer kan vara kända. Om någon av dem blir hittad under tiden, vad säger ni då att ni väntade på?"]),
              pb(["Marking its own homework", "Rättar sin egen läxa"], ["You are waiting for the contractor whose developer leaked the key to tell you how bad the leak is. Its account manager is already talking about “limited exposure”. Why would you trust that confirmation more than the provider's log?", "Ni väntar på att konsulten, vars utvecklare läckte nyckeln, ska tala om hur allvarlig läckan är. Deras kundansvarige talar redan om ”begränsad exponering”. Varför skulle ni lita mer på den bekräftelsen än på leverantörens logg?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Calling the protected first", "Ringa de skyddade först"], [
              io(["Warned in time", "Varnade i tid"], ["The first people reached had no idea their numbers could be known. Several arrange new numbers that same evening and thank the caller.", "De första som nås hade ingen aning om att deras nummer kunde vara kända. Flera ordnar nya nummer samma kväll och tackar den som ringde."], ["The first people with protected identities were warned directly the same day.", "De första personerna med skyddade personuppgifter varnades direkt samma dag."]),
              io(["The wrong person answers", "Fel person svarar"], ["One number on the list now belongs to someone else, who learns from the call that the previous owner lived under a protected identity. The caller cannot take it back.", "Ett nummer på listan tillhör nu någon annan, som genom samtalet får veta att den förra innehavaren levde med skyddade personuppgifter. Det går inte att ta tillbaka."], ["At least one warning call reached the wrong person.", "Minst ett varningssamtal nådde fel person."], { reopen: true, meters: { regulator: 1 } }),
              io(["Word gets out", "Det läcker ut"], ["A support organisation posts that the agency is calling people in hiding. Reporters ask what is going on before any letter has gone out.", "En stödorganisation skriver att myndigheten ringer personer som lever gömda. Reportrar frågar vad som pågår innan något brev har skickats."], ["News of the calls reached reporters before any public statement.", "Nyheten om samtalen nådde reportrar före något offentligt besked."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody called them", "Ingen ringde dem"], [
              io(["No reports so far", "Inga anmälningar hittills"], ["The police say they have no reports of anyone on the list being contacted by strangers. For now, the quiet looks like proof that the slower route was fine.", "Polisen säger att de inte har några anmälningar om att någon på listan kontaktats av okända. Än så länge ser tystnaden ut som ett bevis på att den långsammare vägen räckte."], ["Police had no reports of misuse of the list in the first days.", "Polisen hade inga anmälningar om missbruk av listan de första dagarna."]),
              io(["A stranger knew the number", "En okänd kände till numret"], ["A support organisation calls: a person in hiding was rung by a stranger who knew their new number. Nobody can say whether it is linked to the list.", "En stödorganisation ringer: en person som lever gömd blev uppringd av en okänd som kände till hens nya nummer. Ingen kan säga om det har med listan att göra."], ["A person in hiding was called by a stranger who knew their number.", "En person som lever gömd blev uppringd av en okänd som kände till numret."], { reopen: true, meters: { trust: -1 } }),
              io(["The register holder asks", "Registerhållaren frågar"], ["The authority that keeps the protected identity register heard about the leak from a reporter. It asks why it was not told first, and offers to help.", "Myndigheten som för registret över skyddade personuppgifter fick höra om läckan från en reporter. Den frågar varför den inte fick veta först, och erbjuder sig att hjälpa till."], ["The protected identity register's authority learned of the leak indirectly.", "Myndigheten med registret över skyddade personuppgifter fick veta om läckan indirekt."])
            ])
          ]
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
          evaluation: [["Coordinates with government on the message while keeping essential services running safely for residents", "Samordnar budskapet med regeringen men håller samtidigt viktiga tjänster igång på ett säkert sätt för invånarna"]],
          pushback: {
            A: [
              pb(["Considered next week", "Behandlas nästa vecka"], ["The government offices acknowledge your letter and say it will be considered next week. Until then the order stands, and sign-in codes stop tomorrow. Do you switch them off while you wait, or keep them running on the strength of your own argument?", "Regeringskansliet bekräftar ert brev och säger att det behandlas nästa vecka. Till dess gäller beslutet, och inloggningskoderna stoppas i morgon. Stänger ni av dem medan ni väntar, eller låter ni dem gå vidare med stöd av ert eget resonemang?"]),
              pb(["Can you vouch for the new key?", "Kan ni gå i god för nya nyckeln?"], ["Your letter has to say that the new, restricted key is safe. The contractor installed it, and nobody outside the contractor has checked how it is stored. Will you put your signature on that claim to the government?", "Ert brev måste säga att den nya, begränsade nyckeln är säker. Konsulten installerade den, och ingen utanför konsulten har kontrollerat hur den förvaras. Sätter ni er underskrift på det påståendet till regeringen?"]),
              pb(["Half a yes", "Ett halvt ja"], ["An official in the government offices calls: following half an order and lobbying against the other half on the same day looks like the agency is bargaining in the middle of a crisis. Do you drop the request for the sign-in codes, or keep pushing?", "En tjänsteman i regeringskansliet ringer: att följa halva beslutet och samma dag lobba mot andra halvan ser ut som att myndigheten förhandlar mitt i en kris. Släpper ni begäran om inloggningskoderna, eller fortsätter ni driva den?"])
            ],
            B: [
              pb(["Queues at the offices", "Köer på lokalkontoren"], ["About a fifth of residents cannot sign in without text codes. The local offices are staffed for normal visits, not thousands of people, and some residents live hours from the nearest one. Who is served first, and who is turned away?", "Ungefär en femtedel av invånarna kan inte logga in utan sms-koder. Lokalkontoren är bemannade för vanliga besök, inte för tusentals personer, och en del invånare bor flera timmar från närmaste kontor. Vem får hjälp först, och vem blir hemskickad?"]),
              pb(["An impostor at the counter", "En bedragare vid disken"], ["Anyone holding a name and identity number from the stolen list could try to sign in at an office as someone else. Counter staff have no routine for checking that. How do they tell the real resident from an impostor?", "Den som har ett namn och ett personnummer från den stulna listan kan försöka logga in på ett kontor som någon annan. Personalen vid disken har ingen rutin för att kontrollera det. Hur skiljer de den riktiga invånaren från en bedragare?"]),
              pb(["A duty handed away", "Ett ansvar som lämnas bort"], ["Your legal adviser says that by law the agency, not the government, is responsible for its own services, and that complying in full hands that responsibility away without anyone formally deciding it. Have you given up a duty you are not allowed to give up?", "Er jurist säger att det enligt lag är myndigheten, inte regeringen, som ansvarar för sina egna tjänster, och att ett fullständigt åtlydande lämnar bort det ansvaret utan att någon formellt har beslutat det. Har ni gett upp en skyldighet ni inte får ge upp?"])
            ],
            C: [
              pb(["Is the code real?", "Är koden äkta?"], ["Every sign-in code still comes from the sender that lied yesterday. Residents call to ask whether the codes are genuine, and fake pages are already copying the code message. If the next fake arrives as a “sign-in code”, who defends the decision to keep sending?", "Varje inloggningskod kommer fortfarande från avsändaren som ljög i går. Invånare ringer och frågar om koderna är äkta, och falska sidor kopierar redan kodmeddelandet. Om nästa förfalskning kommer som en ”inloggningskod”, vem försvarar då beslutet att fortsätta skicka?"]),
              pb(["Open conflict with government", "Öppen konflikt med regeringen"], ["The coordination group's chair says on the news that the agency “refused to cooperate”, and the minister's office asks for your director general. Is keeping the codes worth an open fight with the government in the middle of a national crisis?", "Ordföranden i samordningsgruppen säger i nyheterna att myndigheten ”vägrade samarbeta”, och ministerns kansli söker er generaldirektör. Är koderna värda en öppen strid med regeringen mitt i en nationell kris?"]),
              pb(["Is the law on your side?", "Har ni lagen på er sida?"], ["Your legal adviser says the agency's independence covers how it applies the law in individual cases, not how it runs a text service, which the government can steer through decisions and funding. Are you sure enough of your legal ground to defy the order?", "Er jurist säger att myndighetens självständighet gäller myndighetsutövning i enskilda ärenden, inte hur den driver en sms-tjänst, som regeringen kan styra genom beslut och anslag. Är ni tillräckligt säkra på er rättsliga grund för att gå emot beslutet?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "C" }, ["The codes keep running", "Koderna fortsätter"], [
              io(["Sign-ins hold", "Inloggningarna fungerar"], ["Sign-ins through text codes run normally through the first week, and nobody reports a fake code from your sender.", "Inloggningar med sms-koder fungerar som vanligt hela första veckan, och ingen rapporterar en falsk kod från er avsändare."], ["Text sign-in codes worked normally in the first week.", "Sms-koderna för inloggning fungerade normalt under den första veckan."]),
              io(["Fake code messages", "Falska kodmeddelanden"], ["Texts copying your sign-in code message start arriving from ordinary phone numbers, with a link. Residents cannot tell them apart from the codes you still send.", "Sms som kopierar ert kodmeddelande börjar komma från vanliga telefonnummer, med en länk. Invånarna kan inte skilja dem från koderna ni fortfarande skickar."], ["Fake sign-in code texts from ordinary numbers are circulating.", "Falska sms med inloggningskoder från vanliga nummer är i omlopp."], { reopen: true, meters: { trust: -1 } }),
              io(["A demand in writing", "Ett krav på skrift"], ["The government offices ask for the agency's legal basis in writing by tomorrow. Nobody says whether they will accept it, or what happens if they do not.", "Regeringskansliet begär myndighetens rättsliga grund skriftligt till i morgon. Ingen säger om de kommer att godta den, eller vad som händer om de inte gör det."], ["The government offices demanded the agency's legal basis in writing.", "Regeringskansliet krävde myndighetens rättsliga grund skriftligt."])
            ]),
            ir("i2", { notChosen: "C" }, ["Following the order", "Att följa beslutet"], [
              io(["Faster than feared", "Snabbare än befarat"], ["The government offices clear your first statement within hours, not a day. The coordination group thanks the agency for its cooperation.", "Regeringskansliet stämmer av ert första uttalande inom några timmar, inte ett dygn. Samordningsgruppen tackar myndigheten för samarbetet."], ["The first statement was cleared by the government offices within hours.", "Det första uttalandet stämdes av med regeringskansliet inom några timmar."]),
              io(["Locked out on the news", "Utestängd i nyheterna"], ["The evening news follows a pensioner who cannot sign in to apply for support because no code arrives. The reporter asks who decided that.", "Kvällsnyheterna följer en pensionär som inte kan logga in för att söka stöd eftersom ingen kod kommer. Reportern frågar vem som har bestämt det."], ["Residents unable to sign in without text codes are in the news.", "Invånare som inte kan logga in utan sms-koder syns i nyheterna."], { reopen: true, meters: { media: 1 } }),
              io(["An unwritten hint", "En outtalad signal"], ["An official hints on the phone that the order may be narrowed after the weekend. Nothing is put in writing, and the order still stands.", "En tjänsteman antyder i telefon att beslutet kan snävas in efter helgen. Ingenting sätts på pränt, och beslutet gäller fortfarande."], ["There is an unwritten hint that the order may be narrowed.", "Det finns en outtalad signal om att beslutet kan snävas in."])
            ])
          ]
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
          evaluation: [["Makes public messages harder to fake and easier to verify, without shutting people out", "Gör offentliga meddelanden svårare att förfalska och lättare att kontrollera, utan att stänga ute någon"]],
          pushback: {
            A: [
              pb(["That system was ignored too", "Det systemet ignorerades också"], ["The real warning about the chemical fire went out through the national alert system, and people still ignored it. Moving every warning there does not bring trust back by itself. What makes that system more believable than your sender was?", "Den riktiga varningen om kemikaliebranden gick ut via det nationella varningssystemet, och folk ignorerade den ändå. Att flytta alla varningar dit återställer inte förtroendet av sig självt. Vad gör det systemet mer trovärdigt än er avsändare var?"]),
              pb(["Notices without links", "Aviseringar utan länkar"], ["Your service owner says most routine notices exist to send people to the e-services. A payment reminder without a link means a phone call to the agency instead, and call volumes would rise sharply. Is a text without a link still worth keeping the sender alive?", "Er tjänsteägare säger att de flesta rutinaviseringar finns för att skicka folk till e-tjänsterna. En betalningspåminnelse utan länk blir i stället ett samtal till myndigheten, och samtalen skulle öka kraftigt. Är ett sms utan länk värt att hålla avsändaren vid liv?"]),
              pb(["The system's owner objects", "Systemets ägare protesterar"], ["The authority that runs the national alert system says it is built for threats to life, not for agencies that no longer trust their own channels. It does not want your warnings in its system. Where do they go if it says no?", "Myndigheten som driver det nationella varningssystemet säger att det är byggt för hot mot liv, inte för myndigheter som inte längre litar på sina egna kanaler. Den vill inte ha era varningar i sitt system. Vart tar de vägen om den säger nej?"])
            ],
            B: [
              pb(["An inbox they cannot open", "En inkorg de inte kan öppna"], ["About a fifth of residents relied on text codes to sign in at all. A notice in an inbox they cannot open reaches nobody, and agencies must be reachable for everyone. Who are you leaving out, and can you defend that to the inquiry?", "Ungefär en femtedel av invånarna var beroende av sms-koder för att kunna logga in över huvud taget. En avisering i en inkorg de inte kan öppna når ingen, och myndigheter måste vara nåbara för alla. Vilka stänger ni ute, och kan ni försvara det inför utredningen?"]),
              pb(["The fraud just moves", "Bedrägeriet flyttar bara"], ["The banks point out that fraudsters will switch to fake emails: “you have a new message in your inbox, sign in here”. Have you removed the risk, or moved it to a channel you control even less?", "Bankerna påpekar att bedragarna bara byter till falska mejl: ”du har ett nytt meddelande i din inkorg, logga in här”. Har ni tagit bort risken, eller flyttat den till en kanal ni styr ännu mindre?"]),
              pb(["A rule for everyone", "En regel för alla"], ["Other agencies and municipalities use text gateways the same way. If you recommend stopping entirely, the inquiry may propose the same for all of them, and the next real crisis has one channel fewer. Is your recommendation meant for you, or for everyone?", "Andra myndigheter och kommuner använder sms-tjänster på samma sätt. Om ni rekommenderar att sluta helt kan utredningen föreslå samma sak för alla, och nästa verkliga kris har en kanal mindre. Gäller er rekommendation er, eller alla?"])
            ],
            C: [
              pb(["One in eight has blocked you", "Var åttonde har blockerat er"], ["About one in eight in the region has blocked your sender. Keeping text as it was means a known share of the public will never see your notices again. How does an awareness campaign reach people who have already stopped listening?", "Ungefär var åttonde i regionen har blockerat er avsändare. Att behålla sms som förut innebär att en känd andel av allmänheten aldrig mer ser era aviseringar. Hur når en informationskampanj människor som redan har slutat lyssna?"]),
              pb(["The links stay", "Länkarna blir kvar"], ["Keeping text “as it is” means messages still carry links, exactly the shape of the fake that emptied accounts. The banks ask you to drop them. Why should residents learn to check links, rather than you removing them?", "Att behålla sms ”som det är” innebär att meddelandena fortfarande har länkar, precis som förfalskningen som tömde konton. Bankerna ber er att ta bort dem. Varför ska invånarna lära sig kontrollera länkar, i stället för att ni tar bort dem?"]),
              pb(["The same contractor", "Samma konsult"], ["The contractor considers the matter closed now that the developer has been let go. With text unchanged, your security still rests on that contractor's word. Apart from one person's job, what will the inquiry see that is actually different?", "Konsulten anser saken utagerad nu när utvecklaren har fått gå. Med sms oförändrat vilar er säkerhet fortfarande på den konsultens ord. Vad ser utredningen som faktiskt är annorlunda, förutom en persons anställning?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "B" }, ["Ending text messages", "Slut på sms"], [
              io(["The inquiry agrees", "Utredningen håller med"], ["The inquiry's first draft quotes your recommendation as a model for other public bodies. It reads like vindication.", "Utredningens första utkast citerar er rekommendation som en förebild för andra offentliga organ. Det läses som en upprättelse."], ["The inquiry's draft quotes your recommendation approvingly.", "Utredningens utkast citerar er rekommendation gillande."]),
              io(["Who is left out", "Vilka som stängs ute"], ["A disability organisation submits a formal objection: people without e-ID or a smartphone would lose their only practical way to hear from the agency.", "En funktionsrättsorganisation lämnar in en formell invändning: personer utan e-legitimation eller smarttelefon skulle förlora sitt enda praktiska sätt att få besked från myndigheten."], ["A disability organisation formally objected to ending text messages.", "En funktionsrättsorganisation invände formellt mot att sms upphör."], { reopen: true }),
              io(["Others follow early", "Andra hänger på i förtid"], ["Two municipalities announce they will stop texts too, before the inquiry has reported. One of them used texts for water outage notices.", "Två kommuner meddelar att de också slutar med sms, innan utredningen har lämnat sitt betänkande. En av dem använde sms för besked om vattenavbrott."], ["Two municipalities announced they will stop text messages too.", "Två kommuner har meddelat att de också slutar med sms."])
            ]),
            ir("i2", { notChosen: "B" }, ["Text stays on", "Sms finns kvar"], [
              io(["A quiet month", "En lugn månad"], ["Since the key was replaced, no fake has used the agency's sender. Monitoring shows only genuine sends, and the room may feel the channel is safe again.", "Sedan nyckeln byttes har ingen förfalskning använt myndighetens avsändare. Övervakningen visar bara äkta utskick, och rummet kan få känslan av att kanalen är säker igen."], ["No fake has used the agency's sender since the key was replaced.", "Ingen förfalskning har använt myndighetens avsändare sedan nyckeln byttes."]),
              io(["Another sender misused", "En annan avsändare missbrukas"], ["In another region, a fake text goes out from a different authority's verified sender, again through a leaked key. The inquiry asks why your recommendation keeps the same model.", "I en annan region går ett falskt sms ut från en annan myndighets verifierade avsändare, återigen via en läckt nyckel. Utredningen frågar varför er rekommendation behåller samma modell."], ["Another authority's sender was misused in a similar way.", "En annan myndighets avsändare missbrukades på liknande sätt."], { reopen: true, meters: { trust: -1 } }),
              io(["Blocked stays blocked", "Blockerad förblir blockerad"], ["The provider explains that residents who blocked your sender will not receive anything until they unblock it themselves, and there is no way to ask them by text.", "Leverantören förklarar att invånare som blockerat er avsändare inte får något förrän de själva häver blockeringen, och det finns inget sätt att be dem om det via sms."], ["Residents who blocked the sender must unblock it themselves.", "Invånare som blockerat avsändaren måste själva häva blockeringen."])
            ])
          ]
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
