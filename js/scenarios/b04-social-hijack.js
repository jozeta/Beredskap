/*
 * b04-social-hijack.js — "Our Account Says What?" (branching, brand account hijack).
 *
 * Friday evening the brand's social account posts a crypto "giveaway". Spine:
 * first move → locked out → followers are paying → platform support → a fake
 * CEO video → account back → the apology → a second attempt → the metric
 * that matters → who owns the account. Alternative early path: a new account
 * that looks like an impostor. Break-away at "account back": threatening the
 * platform in public.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b04-social-hijack",
    version: 1,
    format: "branching",
    category: "brand-hijack",
    archetype: "human-legal-reputational",
    emblem: "social-hijack",
    title: L(["Our Account Says What?", "Vad skriver vårt konto?"]),
    summary: L([
      "Friday evening your brand account starts promoting a crypto giveaway. You cannot log in, followers are sending money, and support answers on Monday.",
      "En fredagskväll börjar ert varumärkeskonto marknadsföra en kryptogiveaway. Ni kan inte logga in, följare skickar pengar och supporten svarar på måndag."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Regain control of a hijacked brand account", "Återta kontrollen över ett kapat varumärkeskonto"]) },
      { id: "lo2", text: L(["Warn customers through channels you still control", "Varna kunder via kanaler ni fortfarande kontrollerar"]) },
      { id: "lo3", text: L(["Treat social accounts as critical identities", "Behandla konton i sociala medier som kritiska identiteter"]) },
      { id: "lo4", text: L(["Respond to synthetic media of your own executives", "Bemöta syntetisk media med era egna chefer"]) }
    ],
    mitre: ["T1586", "T1078", "T1111", "T1566", "T1656"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.AT", "RS.CO", "RS.MI", "RC.CO"],
      iso27001: ["A.5.15", "A.5.16", "A.5.17", "A.5.19", "A.5.24", "A.5.26", "A.6.3"]
    },
    constraints: { startWindow: "friday-evening", sectors: ["retail", "technology", "transport", "telecom"] },
    actor: { types: ["criminal"], motivation: L(["Financial: crypto scams through trusted brand accounts", "Ekonomisk: kryptobedrägerier via betrodda varumärkeskonton"]), capability: "medium" },
    variables: {
      followers: { min: 20000, max: 900000, scaleBy: "size", step: 1000 },
      victims: { min: 15, max: 400, scaleBy: "size" },
      sharedUsers: { min: 4, max: 11 }
    },
    roles: ["incidentCommander", "comms", "ciso", "socLead", "legal", "ceo", "serviceOwner", "itOps", "dpo"],

    flags: {
      reported: L(["Reported to the platform at once", "Anmält till plattformen direkt"]),
      toolsRevoked: L(["Connected apps removed", "Anslutna appar borttagna"]),
      warned: L(["Followers warned on other channels", "Följarna varnade i andra kanaler"]),
      escalated: L(["Escalated through a business contact", "Eskalerat via en affärskontakt"]),
      pressCalled: L(["Called a journalist for attention", "Ringde en journalist för att få uppmärksamhet"]),
      ceoVideo: L(["The CEO answered on video", "Vd svarade med video"]),
      secured: L(["Account secured with keys and named owners", "Kontot säkrat med nycklar och namngivna ägare"])
    },

    start: "c1",
    pages: [
      pg("c1", ["The giveaway", "Giveawayen"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Your brand account, {{num.followers|number}} followers, posts: “We're giving back! Send any amount, get double back. Tonight only.” Followers are replying.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ert varumärkeskonto, {{num.followers|number}} följare, publicerar: ”Vi ger tillbaka! Skicka valfritt belopp, få dubbelt tillbaka. Bara i kväll.” Följarna svarar."
      ], {
        injects: [
          inj("b4-1", 0, "socialPost", "socialMedia", "critical", "confirmed", [
            "🎉 To thank our community we're giving back! Send any amount to the wallet below and get DOUBLE back within an hour. Tonight only!",
            "🎉 Som tack till vår gemenskap ger vi tillbaka! Skicka valfritt belopp till plånboken nedan och få DUBBELT tillbaka inom en timme. Bara i kväll!"
          ], { headline: ["Posted by your brand account", "Publicerat av ert varumärkeskonto"], tests: ["lo1"] })
        ],
        discuss: [q("Who can log in to the account tonight, and how fast?", "Vem kan logga in på kontot i kväll, och hur snabbt?", ["comms"])],
        facilitator: { notes: L(["Push for speed: every minute the post stays up, someone sends money.", "Driv på tempot: varje minut inlägget ligger kvar skickar någon pengar."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Reports the compromise to the platform immediately while trying to regain access.", "Anmäler kapningen till plattformen direkt medan ni försöker återta åtkomsten."], [
          opt(["Try to log in and delete the post", "Försök logga in och ta bort inlägget"], "c2", ["The obvious move. It will fail if the attacker changed the password.", "Det självklara draget. Det misslyckas om angriparen har bytt lösenordet."]),
          opt(["Call the social media manager who has the password", "Ring den sociala medier-ansvariga som har lösenordet"], "c2", ["It's Friday night. They may be anywhere.", "Det är fredagskväll. Hen kan vara var som helst."]),
          opt(["Report the account as compromised to the platform", "Anmäl kontot som kapat till plattformen"], "c2", ["Starts the clock on recovery now.", "Startar klockan för återställningen nu."], { set: "reported" })
        ])
      }),

      pg("c2", ["Locked out", "Utelåsta"], [
        "The password and recovery email have been changed. Two-step verification codes go to a phone that belonged to someone at your old agency.",
        "Lösenordet och återställningsadressen har ändrats. Koderna för tvåstegsverifiering går till en telefon som tillhörde någon på er gamla byrå."
      ], {
        discuss: [q("Who has ever had access to this account?", "Vilka har någonsin haft åtkomst till det här kontot?", ["comms", "ciso"])],
        choice: ask(["How do you try to get back in?", "Hur försöker ni ta er in igen?"], ["Uses the platform's official recovery route and starts an access inventory.", "Använder plattformens officiella återställningsväg och börjar inventera åtkomsten."], [
          opt(["The platform's business recovery process", "Plattformens återställningsprocess för företag"], "l1", ["Official and slow. Proves ownership properly.", "Officiellt och långsamt. Bevisar ägarskapet ordentligt."]),
          opt(["Ask the old agency to reset it", "Be den gamla byrån återställa det"], "l1", ["They may help, or they may be how it happened.", "De kanske hjälper, eller så är det de som är orsaken."]),
          opt(["Open a new account and announce the hijack", "Öppna ett nytt konto och berätta om kapningen"], "c3b", ["Fast. Looks exactly like what impostors do.", "Snabbt. Ser ut precis som det bedragare gör."])
        ])
      }),

      pg("l1", ["Who has the keys?", "Vem har nycklarna?"], [
        "The inventory is uncomfortable: one shared login used by {{num.sharedUsers}} people, two agencies, and a scheduling tool connected to the account with full posting rights.",
        "Inventeringen är obekväm: en delad inloggning som används av {{num.sharedUsers}} personer, två byråer och ett schemaläggningsverktyg anslutet till kontot med fulla publiceringsrättigheter."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What about the connected tools?", "Vad gör ni med de anslutna verktygen?"], ["Cuts every connected app; the attacker may be posting through one.", "Kapar varje ansluten app; angriparen kanske publicerar genom en av dem."], [
          opt(["Revoke the scheduling tool's access from its side", "Återkalla schemaläggningsverktygets åtkomst från dess sida"], "c3", ["Stops posts scheduled through it, if that's the way in.", "Stoppar inlägg som schemaläggs där, om det är vägen in."], { set: "toolsRevoked" }),
          opt(["Leave it; focus on the password", "Låt det vara; fokusera på lösenordet"], "c3", ["Keeps attention narrow.", "Håller fokus snävt."])
        ])
      }),

      pg("c3", ["Followers are paying", "Följarna betalar"], [
        "The wallet in the post has received payments from {{num.victims}} people in an hour. Some are your customers; some are tagging you angrily.",
        "Plånboken i inlägget har tagit emot betalningar från {{num.victims}} personer på en timme. En del är era kunder; en del taggar er argt."
      ], {
        choice: ask(["How do you warn people?", "Hur varnar ni folk?"], ["Warns immediately on every channel you still control.", "Varnar direkt i varje kanal ni fortfarande kontrollerar."], [
          opt(["Warn on the website, newsletter and other accounts now", "Varna på webbplatsen, i nyhetsbrevet och på andra konton nu"], "c4", ["Reaches some people quickly, and from a source they can check.", "Når en del snabbt, och från en källa de kan kontrollera."], { set: "warned" }),
          opt(["Stay silent until the account is back", "Var tyst tills kontot är tillbaka"], "c4", ["Every silent hour is more victims.", "Varje tyst timme ger fler offer."]),
          opt(["Ask partners and staff to share a warning", "Be partner och personal sprida en varning"], "c4", ["Spreads fast; the message can get garbled.", "Sprids snabbt; budskapet kan förvanskas."], { set: "warned" })
        ])
      }),

      pg("c3b", ["The second account", "Det andra kontot"], [
        "Your new account is flagged by the platform as a possible impostor, and some followers report it as the scam.",
        "Ert nya konto flaggas av plattformen som en möjlig bedragare, och en del följare anmäler det som bedrägeriet."
      ], {
        choice: ask(["How do you make the new account credible?", "Hur gör ni det nya kontot trovärdigt?"], ["Anchors it to a source people already trust, such as the website.", "Förankrar det i en källa folk redan litar på, till exempel webbplatsen."], [
          opt(["Link it from the website and a press release", "Länka till det från webbplatsen och ett pressmeddelande"], "c4", ["Gives people a way to check.", "Ger folk ett sätt att kontrollera."], { set: "warned" }),
          opt(["Delete it again and wait", "Ta bort det igen och vänta"], "c4", ["Back to silence.", "Tillbaka till tystnaden."])
        ])
      }),

      pg("c4", ["Support says three to five days", "Supporten säger tre till fem dagar"], [
        "The platform's support form returns an automatic reply: recovery cases take three to five working days.",
        "Plattformens supportformulär ger ett automatiskt svar: återställningsärenden tar tre till fem arbetsdagar."
      ], {
        variants: [vr("reported", [
          "Because the compromise was reported in the first minutes, your case is already flagged as urgent: estimated 24 hours.",
          "Eftersom kapningen anmäldes under de första minuterna är ert ärende redan markerat som brådskande: uppskattningsvis ett dygn."
        ], ["Because you reported at once, the queue is shorter.", "Eftersom ni anmälde direkt är kön kortare."])],
        choice: ask(["How do you speed it up?", "Hur får ni fart på det?"], ["Uses legitimate escalation routes rather than public pressure.", "Använder legitima eskaleringsvägar i stället för offentligt tryck."], [
          opt(["Escalate through your advertising account manager", "Eskalera via er kontaktperson för annonsering"], "l2", ["Business relationships open doors that forms don't.", "Affärsrelationer öppnar dörrar som formulär inte gör."], { set: "escalated" }),
          opt(["Wait in the queue", "Vänta i kön"], "l2", ["Patient and slow.", "Tålmodigt och långsamt."]),
          opt(["Get a journalist to write about it", "Få en journalist att skriva om det"], "l2", ["Attention works. It also makes the story bigger.", "Uppmärksamhet fungerar. Den gör också historien större."], { set: "pressCalled" })
        ])
      }),

      pg("l2", ["The inbox", "Inkorgen"], [
        "The attacker can read the account's private messages: two years of customer complaints, many with order numbers and home addresses.",
        "Angriparen kan läsa kontots privata meddelanden: två års kundklagomål, många med ordernummer och hemadresser."
      ], {
        long: true,
        skipTo: "c5",
        variants: [vr("pressCalled", [
          "The story is on the evening news. Worse: the attacker can read the account's private messages, two years of customer complaints with order numbers and home addresses.",
          "Historien finns i kvällsnyheterna. Värre: angriparen kan läsa kontots privata meddelanden, två års kundklagomål med ordernummer och hemadresser."
        ], ["Because you called a journalist, everyone is watching.", "Eftersom ni ringde en journalist tittar alla."])],
        choice: ask(["Is this a personal-data breach?", "Är det här en personuppgiftsincident?"], ["Recognises private messages as personal data the organisation is responsible for.", "Inser att privata meddelanden är personuppgifter som organisationen ansvarar för."], [
          opt(["Yes: bring in the DPO and assess notification", "Ja: ta in dataskyddsombudet och bedöm anmälan"], "c5", ["Correct; the messages are your customers' data.", "Rätt; meddelandena är era kunders uppgifter."]),
          opt(["No: the messages are the platform's problem", "Nej: meddelandena är plattformens problem"], "c5", ["You chose to run customer service there.", "Ni valde att sköta kundtjänst där."])
        ])
      }),

      pg("c5", ["The CEO's video", "Vd:s video"], [
        "A new post: a video of {{person.ceo.name}} urging followers to join the giveaway. It is generated, and it is convincing.",
        "Ett nytt inlägg: en video där {{person.ceo.name}} uppmanar följarna att vara med i giveawayen. Den är genererad, och den är övertygande."
      ], {
        variants: [vr("toolsRevoked", [
          "The scheduled scam posts stopped when the tool was cut off, but the attacker posts one more thing by hand: a generated video of {{person.ceo.name}} urging followers to join.",
          "De schemalagda bluffinläggen upphörde när verktyget kopplades bort, men angriparen publicerar en sak till manuellt: en genererad video där {{person.ceo.name}} uppmanar följarna att vara med."
        ], ["Because you removed the connected tool, the flood of posts stopped.", "Eftersom ni tog bort det anslutna verktyget upphörde flödet av inlägg."])],
        injects: [
          inj("b4-2", 180, "socialPost", "socialMedia", "high", "misleading", [
            "Video, 0:42: the CEO, in front of a familiar office wall, says: “We wanted to do something special for you. Don't miss it — tonight only.”",
            "Video, 0:42: vd framför en välbekant kontorsvägg säger: ”Vi ville göra något speciellt för er. Missa det inte — bara i kväll.”"
          ], { facilitatorNote: ["Generated video using public conference footage and a cloned voice.", "Genererad video som bygger på offentligt konferensmaterial och en klonad röst."], tests: ["lo4"] })
        ],
        discuss: [q("How does a real CEO prove they are real?", "Hur bevisar en riktig vd att hen är på riktigt?", ["ceo", "comms"])],
        choice: ask(["How do you answer the fake video?", "Hur bemöter ni den falska videon?"], ["Answers quickly with a verifiable message from a channel the organisation controls.", "Svarar snabbt med ett verifierbart besked från en kanal organisationen kontrollerar."], [
          opt(["The CEO records a short real video for the website and other channels", "Vd spelar in en kort riktig video till webbplatsen och övriga kanaler"], "l3", ["Fast, human, verifiable through your own site.", "Snabbt, mänskligt, verifierbart via er egen webbplats."], { set: "ceoVideo" }),
          opt(["A written statement only", "Bara ett skriftligt uttalande"], "l3", ["Safe, and much less effective against a video.", "Säkert, och mycket mindre effektivt mot en video."])
        ])
      }),

      pg("l3", ["Refunds?", "Ersättning?"], [
        "Followers who sent money demand that you pay them back. “It was your account.”",
        "Följare som skickat pengar kräver att ni betalar tillbaka. ”Det var ert konto.”"
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you offer the victims?", "Vad erbjuder ni de drabbade?"], ["Helps victims report and recover without promising what you can't deliver.", "Hjälper de drabbade att anmäla och få upprättelse utan att lova det ni inte kan hålla."], [
          opt(["No refunds, but practical help to report to the police", "Ingen ersättning, men praktisk hjälp att polisanmäla"], "c6", ["Clear and decent. Some will still be angry.", "Tydligt och anständigt. En del blir ändå arga."]),
          opt(["Promise to “look into compensation”", "Lova att ”se över ersättning”"], "c6", ["Creates an expectation you may not meet.", "Skapar en förväntan ni kanske inte kan uppfylla."])
        ])
      }),

      pg("c6", ["Back in", "Inne igen"], [
        "{{time.T+1440|weekday|cap}}. The platform restores the account to you. The scam posts are still up.",
        "{{time.T+1440|weekday|cap}}. Plattformen återställer kontot till er. Bluffinläggen ligger fortfarande kvar."
      ], {
        variants: [vr("escalated", [
          "After twenty hours, thanks to your account manager, the platform restores the account. The scam posts are still up.",
          "Efter tjugo timmar, tack vare er kontaktperson, återställer plattformen kontot. Bluffinläggen ligger fortfarande kvar."
        ], ["Because you escalated through a business contact, you got back in a day early.", "Eftersom ni eskalerade via en affärskontakt kom ni in igen en dag tidigare."])],
        choice: ask(["What do you do in the first hour?", "Vad gör ni under den första timmen?"], ["Secures the account properly before posting anything.", "Säkrar kontot ordentligt innan något publiceras."], [
          opt(["Hardware keys, named owners, remove every session and connected app", "Hårdvarunycklar, namngivna ägare, ta bort alla sessioner och anslutna appar"], "c7", ["The account is safe before anyone speaks through it.", "Kontot är säkert innan någon talar genom det."], { set: "secured" }),
          opt(["Change the password and post an apology", "Byt lösenord och publicera en ursäkt"], "c7", ["Fast. The same weaknesses remain.", "Snabbt. Samma svagheter finns kvar."]),
          opt(["Give it back to the agency to manage", "Lämna tillbaka det till byrån att sköta"], "c7b", ["Back to normal, including whatever went wrong.", "Tillbaka till det normala, inklusive det som gick fel."]),
          opt(["Publicly threaten the platform with legal action", "Hota plattformen offentligt med rättsliga åtgärder"], "x1", ["Satisfying. Platforms have long memories.", "Tillfredsställande. Plattformar har långt minne."])
        ])
      }),

      pg("c7b", ["The agency", "Byrån"], [
        "The agency's account manager admits that a laptop at the agency was infected last week. Their password manager was on it.",
        "Byråns kontaktperson erkänner att en dator på byrån infekterades förra veckan. Deras lösenordshanterare fanns på den."
      ], {
        choice: ask(["What do you require from the agency?", "Vad kräver ni av byrån?"], ["Requires evidence of remediation and controls before restoring access.", "Kräver belägg för åtgärder och kontroller innan åtkomsten återställs."], [
          opt(["Proof of clean-up and their own hardware keys first", "Bevis på sanering och egna hårdvarunycklar först"], "c7", ["Third-party access on your terms.", "Tredje parts åtkomst på era villkor."], { set: "secured" }),
          opt(["Trust them; it was bad luck", "Lita på dem; det var otur"], "c7", ["Luck is not a control.", "Tur är ingen kontroll."])
        ])
      }),

      pg("c7", ["The apology", "Ursäkten"], [
        "The account is yours again. Everyone is waiting for the first post.",
        "Kontot är ert igen. Alla väntar på det första inlägget."
      ], {
        choice: ask(["What is the first post?", "Vad blir det första inlägget?"], ["Plain words: what happened, what you did, what victims can do.", "Enkla ord: vad som hände, vad ni gjorde, vad de drabbade kan göra."], [
          opt(["A plain apology, what happened, and how to report losses", "En enkel ursäkt, vad som hände och hur man anmäler förluster"], "l4", ["Boring and right.", "Tråkigt och rätt."]),
          opt(["A humorous post to move on", "Ett humoristiskt inlägg för att gå vidare"], "l4", ["People who lost money will not laugh.", "De som förlorat pengar kommer inte att skratta."]),
          opt(["Delete the scam posts quietly and say nothing", "Ta bort bluffinläggen i tysthet och säg ingenting"], "l4", ["Screenshots last forever.", "Skärmdumpar finns för alltid."])
        ])
      }),

      pg("l4", ["The other accounts", "De andra kontona"], [
        "The same password was used on two other brand accounts and the video channel.",
        "Samma lösenord användes på två andra varumärkeskonton och videokanalen."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What about the other accounts?", "Vad gör ni med de andra kontona?"], ["Secures every account that shares the weakness, today.", "Säkrar varje konto med samma svaghet, i dag."], [
          opt(["Secure all of them now", "Säkra alla nu"], "c8", ["An evening's work that closes the next incident.", "En kvälls arbete som stänger nästa incident."]),
          opt(["Check them next week", "Kontrollera dem nästa vecka"], "c8", ["The attacker has the same password.", "Angriparen har samma lösenord."])
        ])
      }),

      pg("c8", ["A second try", "Ett andra försök"], [
        "Two weeks later the communications team receives emails that look like a platform security notice: “Verify your account to keep your badge.”",
        "Två veckor senare får kommunikationsavdelningen mejl som ser ut som ett säkerhetsmeddelande från plattformen: ”Verifiera ert konto för att behålla er märkning.”"
      ], {
        variants: [vr("secured", [
          "Two weeks later a fake platform notice reaches the communications team. One person clicks and enters the password; the login fails without the hardware key.",
          "Två veckor senare når ett falskt plattformsmeddelande kommunikationsavdelningen. En person klickar och anger lösenordet; inloggningen misslyckas utan hårdvarunyckeln."
        ], ["Because the account needs a hardware key, the second attempt failed.", "Eftersom kontot kräver en hårdvarunyckel misslyckades det andra försöket."])],
        choice: ask(["What do you change for everyone who can publish?", "Vad ändrar ni för alla som kan publicera?"], ["Removes the phishable step rather than asking people to be more careful.", "Tar bort steget som går att nätfiska i stället för att be folk vara mer försiktiga."], [
          opt(["Phishing-resistant sign-in for everyone with publishing rights", "Nätfiskeresistent inloggning för alla med publiceringsrätt"], "c9", ["Solves the class of problem.", "Löser hela problemtypen."]),
          opt(["An awareness email", "Ett informationsmejl"], "c9", ["Read once, forgotten by Friday.", "Läses en gång, glöms till fredag."])
        ])
      }),

      pg("c9", ["The numbers", "Siffrorna"], [
        "Marketing reports: eight percent of followers lost. They want a campaign to win them back.",
        "Marknadsavdelningen rapporterar: åtta procent av följarna har försvunnit. De vill ha en kampanj för att vinna tillbaka dem."
      ], {
        choice: ask(["What do you measure?", "Vad mäter ni?"], ["Measures trust and victims helped, not follower counts.", "Mäter förtroende och hjälpta drabbade, inte antal följare."], [
          opt(["Ask customers whether they trust the account", "Fråga kunderna om de litar på kontot"], "c10", ["The number that matters.", "Siffran som spelar roll."]),
          opt(["Run a giveaway to win followers back", "Kör en giveaway för att vinna tillbaka följare"], "c10", ["A giveaway. Really?", "En giveaway. Verkligen?"])
        ])
      }),

      pg("c10", ["Who owns it?", "Vem äger det?"], [
        "The last question in the review: who owns the brand's social accounts?",
        "Den sista frågan i genomgången: vem äger varumärkets konton i sociala medier?"
      ], {
        choice: ask(["Who owns the accounts?", "Vem äger kontona?"], ["Gives the accounts an internal owner with security controls, like any critical system.", "Ger kontona en intern ägare med säkerhetskontroller, som vilket kritiskt system som helst."], [
          opt(["Communications owns them, with security's controls, written down", "Kommunikation äger dem, med säkerhetsfunktionens kontroller, nedskrivet"], "r-end", ["Clear and accountable.", "Tydligt och med ansvar."]),
          opt(["The agency, as before", "Byrån, som tidigare"], "r-end", ["Ownership outsourced, risk kept.", "Ägarskapet utlagt, risken kvar."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["warned", "secured", "ceoVideo"], "e1"],
          [["warned", "secured"], "e2"],
          ["warned", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["A bad night, handled", "En dålig natt, hanterad"], [
          "You warned people within the hour, answered the fake video with a real one and locked the account down before speaking through it again. Most followers stayed.",
          "Ni varnade folk inom en timme, bemötte den falska videon med en riktig och låste kontot innan ni talade genom det igen. De flesta följarna stannade kvar."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Secure, but the video lingered", "Säkert, men videon hängde kvar"], [
          "People were warned and the account is now well protected, but the fake CEO video kept circulating without a convincing answer.",
          "Folk varnades och kontot är nu väl skyddat, men den falska vd-videon fortsatte att spridas utan ett övertygande svar."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Warned, still exposed", "Varnade, fortfarande sårbara"], [
          "Followers were warned, but the account went back to the old way of working. Six weeks later it is hijacked again.",
          "Följarna varnades, men kontot gick tillbaka till det gamla arbetssättet. Sex veckor senare kapas det igen."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["Silence cost the most", "Tystnaden kostade mest"], [
          "Without a warning, the scam ran for a day under your name. Victims, journalists and a consumer authority all ask why you said nothing.",
          "Utan någon varning pågick bedrägeriet i ett dygn i ert namn. Drabbade, journalister och en konsumentmyndighet frågar alla varför ni inte sa något."
        ])
      }),

      // Break-away: the public threat.
      pg("x1", ["Public threat", "Offentligt hot"], [
        "Your post threatening the platform with legal action goes viral, and the platform's trust team freezes the account “pending review of ownership”.",
        "Ert inlägg där ni hotar plattformen med rättsliga åtgärder sprids snabbt, och plattformens säkerhetsteam fryser kontot ”i väntan på granskning av ägarskapet”."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Returns to cooperation and lets the official process work.", "Går tillbaka till samarbete och låter den officiella processen arbeta."], [
          opt(["Apologise to the platform and cooperate", "Be plattformen om ursäkt och samarbeta"], "x2", ["Humbling and necessary.", "Förödmjukande och nödvändigt."]),
          opt(["Escalate the legal threat", "Trappa upp det rättsliga hotet"], "x2", ["The freeze gets longer.", "Frysningen blir längre."])
        ])
      }),
      pg("x2", ["Copycats", "Efterapare"], [
        "With your account frozen, a dozen look-alike accounts appear, each running its own version of the giveaway.",
        "Med ert konto fryst dyker ett dussin efterliknande konton upp, vart och ett med sin egen version av giveawayen."
      ], {
        choice: ask(["How do you fight the copies?", "Hur bekämpar ni kopiorna?"], ["Reports them systematically and points people to a verified source.", "Anmäler dem systematiskt och hänvisar folk till en verifierad källa."], [
          opt(["Report each one and warn on the website", "Anmäl vart och ett och varna på webbplatsen"], "x3", ["Slow work that helps.", "Långsamt arbete som hjälper."]),
          opt(["Ignore them until the account is back", "Ignorera dem tills kontot är tillbaka"], "x3", ["They multiply.", "De förökar sig."])
        ])
      }),
      pg("x3", ["Victims organise", "De drabbade organiserar sig"], [
        "Victims form a group online and contact a consumer organisation. Their message: the brand did nothing.",
        "De drabbade bildar en grupp på nätet och kontaktar en konsumentorganisation. Deras budskap: varumärket gjorde ingenting."
      ], {
        choice: ask(["How do you respond to the group?", "Hur bemöter ni gruppen?"], ["Engages directly and offers practical help.", "Tar direkt kontakt och erbjuder praktisk hjälp."], [
          opt(["Meet them and offer help with police reports", "Träffa dem och erbjud hjälp med polisanmälningar"], "x4", ["Late but sincere.", "Sent men uppriktigt."]),
          opt(["Let legal answer", "Låt juristerna svara"], "x4", ["Confirms their message.", "Bekräftar deras budskap."])
        ])
      }),
      pg("x4", ["Launch week", "Lanseringsveckan"], [
        "Your biggest product launch of the year is next week. The main channel is still frozen.",
        "Årets största produktlansering är nästa vecka. Huvudkanalen är fortfarande fryst."
      ], {
        choice: ask(["What happens to the launch?", "Vad händer med lanseringen?"], ["Postpones rather than launching into the scandal.", "Skjuter upp i stället för att lansera mitt i skandalen."], [
          opt(["Postpone the launch", "Skjut upp lanseringen"], "e5", ["Costly and sensible.", "Dyrt och förnuftigt."]),
          opt(["Launch on other channels", "Lansera i andra kanaler"], "e5", ["The launch becomes part of the story.", "Lanseringen blir en del av historien."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
        ending: end(5, ["Frozen out", "Utfrusna"], [
          "A public fight with the platform froze your own channel for weeks while copycats ran the scam in your name. The launch is lost.",
          "Ett offentligt bråk med plattformen frös er egen kanal i veckor medan efterapare körde bedrägeriet i ert namn. Lanseringen är förlorad."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["A brand account is a critical identity: named owners, hardware keys, no shared logins.", "Ett varumärkeskonto är en kritisk identitet: namngivna ägare, hårdvarunycklar, inga delade inloggningar."]),
        L(["Warn people through every channel you still control, immediately.", "Varna folk i varje kanal ni fortfarande kontrollerar, omedelbart."]),
        L(["Report to the platform in the first minutes and use business escalation routes.", "Anmäl till plattformen under de första minuterna och använd affärsmässiga eskaleringsvägar."]),
        L(["Answer synthetic media with a verifiable real message, fast.", "Bemöt syntetisk media med ett verifierbart, riktigt budskap, snabbt."])
      ],
      strengthsToLookFor: [
        L(["Reporting the hijack at once", "Att anmäla kapningen direkt"]),
        L(["Securing the account before posting again", "Att säkra kontot innan något publiceras igen"]),
        L(["Cutting connected apps and agency access", "Att kapa anslutna appar och byråers åtkomst"])
      ],
      commonGaps: [
        L(["Nobody knows who has the password", "Ingen vet vem som har lösenordet"]),
        L(["Staying silent until access is back", "Att vara tysta tills åtkomsten är tillbaka"]),
        L(["Fighting the platform in public", "Att bråka med plattformen offentligt"])
      ],
      suggestedActions: [
        act(["Inventory every brand account, owner and connected app.", "Inventera varje varumärkeskonto, ägare och ansluten app."], "comms", "high"),
        act(["Require hardware keys for all publishing access.", "Kräv hårdvarunycklar för all publiceringsåtkomst."], "ciso", "high"),
        act(["Prepare a hijack runbook with pre-written warnings.", "Förbered en rutin för kapade konton med förskrivna varningar."], "comms", "medium")
      ]
    }
  });
})();
