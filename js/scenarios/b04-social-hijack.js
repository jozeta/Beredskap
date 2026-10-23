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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Most of the office has gone home. Your brand account, with {{num.followers|number}} followers, suddenly posts: “We're giving back! Send any amount, get double back. Tonight only.”\n\nBelow it is a crypto wallet address. Nobody on your team wrote it. Followers are already replying, some asking whether it is real, some saying they have sent money.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. De flesta på kontoret har gått hem. Ert varumärkeskonto, med {{num.followers|number}} följare, publicerar plötsligt: ”Vi ger tillbaka! Skicka valfritt belopp, få dubbelt tillbaka. Bara i kväll.”\n\nUnder inlägget står en adress till en kryptoplånbok. Ingen i ert team har skrivit det. Följarna svarar redan, en del frågar om det är på riktigt, en del skriver att de har skickat pengar."
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
        "Nobody can get in. The password has been changed, and so has the recovery email address.\n\nWorse, the two-step verification codes go to a mobile number that belonged to someone at the agency you stopped working with last year. The person who could have helped you no longer exists in your organisation.",
        "Ingen kommer in. Lösenordet har ändrats, och det har även e-postadressen för återställning.\n\nÄnnu värre: koderna för tvåstegsverifiering går till ett mobilnummer som tillhörde någon på byrån ni slutade samarbeta med förra året. Den person som hade kunnat hjälpa er finns inte längre i er organisation."
      ], {
        discuss: [q("Who has ever had access to this account?", "Vilka har någonsin haft åtkomst till det här kontot?", ["comms", "ciso"])],
        choice: ask(["How do you try to get back in?", "Hur försöker ni ta er in igen?"], ["Uses the platform's official recovery route and starts an access inventory.", "Använder plattformens officiella återställningsväg och börjar inventera åtkomsten."], [
          opt(["The platform's business recovery process", "Plattformens återställningsprocess för företag"], "l1", ["Official and slow. Proves ownership properly.", "Officiellt och långsamt. Bevisar ägarskapet ordentligt."]),
          opt(["Ask the old agency to reset it", "Be den gamla byrån återställa det"], "l1", ["They may help, or they may be how it happened.", "De kanske hjälper, eller så är det de som är orsaken."]),
          opt(["Open a new account and announce the hijack", "Öppna ett nytt konto och berätta om kapningen"], "c3b", ["Fast. Looks exactly like what impostors do.", "Snabbt. Ser ut precis som det bedragare gör."])
        ])
      }),

      pg("l1", ["Who has the keys?", "Vem har nycklarna?"], [
        "Someone makes a list of who actually had access, and it is uncomfortable reading. One shared login, used by {{num.sharedUsers}} people. Two agencies, the current one and the old one.\n\nAnd a scheduling tool, connected to the account with full posting rights. The attacker may not need the password at all if they control the tool.",
        "Någon gör en lista över vem som faktiskt hade åtkomst, och den är obekväm läsning. En delad inloggning, använd av {{num.sharedUsers}} personer. Två byråer, den nuvarande och den gamla.\n\nOch ett schemaläggningsverktyg, kopplat till kontot med full rätt att publicera. Angriparen kanske inte ens behöver lösenordet om de styr verktyget."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What about the connected tools?", "Vad gör ni med de anslutna verktygen?"], ["Cuts every connected app; the attacker may be posting through one.", "Kapar varje ansluten app; angriparen kanske publicerar genom en av dem."], [
          opt(["Revoke the scheduling tool's access from its side", "Återkalla schemaläggningsverktygets åtkomst från dess sida"], "c3", ["Stops posts scheduled through it, if that's the way in.", "Stoppar inlägg som schemaläggs där, om det är vägen in."], { set: "toolsRevoked" }),
          opt(["Leave it; focus on the password", "Låt det vara; fokusera på lösenordet"], "c3", ["Keeps attention narrow.", "Håller fokus snävt."])
        ])
      }),

      pg("c3", ["Followers are paying", "Följarna betalar"], [
        "The wallet in the post is public, so anyone can watch it fill. In one hour it has received payments from {{num.victims}} people.\n\nSome of them are your own customers, who trusted the account because it is yours. Others are tagging you angrily, asking why the brand is running a scam. Every hour of silence brings more victims.",
        "Plånboken i inlägget är offentlig, så vem som helst kan se den fyllas. På en timme har den tagit emot betalningar från {{num.victims}} personer.\n\nEn del av dem är era egna kunder, som litade på kontot för att det är ert. Andra taggar er argt och frågar varför varumärket kör ett bedrägeri. Varje timme av tystnad ger fler offer."
      ], {
        choice: ask(["How do you warn people?", "Hur varnar ni folk?"], ["Warns immediately on every channel you still control.", "Varnar direkt i varje kanal ni fortfarande kontrollerar."], [
          opt(["Warn on the website, newsletter and other accounts now", "Varna på webbplatsen, i nyhetsbrevet och på andra konton nu"], "c4", ["Reaches some people quickly, and from a source they can check.", "Når en del snabbt, och från en källa de kan kontrollera."], { set: "warned" }),
          opt(["Stay silent until the account is back", "Var tyst tills kontot är tillbaka"], "c4", ["Every silent hour is more victims.", "Varje tyst timme ger fler offer."]),
          opt(["Ask partners and staff to share a warning", "Be partner och personal sprida en varning"], "c4", ["Spreads fast; the message can get garbled.", "Sprids snabbt; budskapet kan förvanskas."], { set: "warned" })
        ])
      }),

      pg("c3b", ["The second account", "Det andra kontot"], [
        "Your new account goes up within minutes, with a message that the main account has been hijacked.\n\nBut the platform's systems flag it as a possible impostor: it is brand new, has no history and uses your logo. Some followers report it as the scam, which is exactly what a scammer's account would look like.",
        "Ert nya konto är uppe inom några minuter, med ett meddelande om att huvudkontot har kapats.\n\nMen plattformens system flaggar det som en möjlig bluff: det är helt nytt, saknar historik och använder er logotyp. En del följare anmäler det som bedrägeriet, vilket är precis så ett bedragarkonto skulle se ut."
      ], {
        choice: ask(["How do you make the new account credible?", "Hur gör ni det nya kontot trovärdigt?"], ["Anchors it to a source people already trust, such as the website.", "Förankrar det i en källa folk redan litar på, till exempel webbplatsen."], [
          opt(["Link it from the website and a press release", "Länka till det från webbplatsen och ett pressmeddelande"], "c4", ["Gives people a way to check.", "Ger folk ett sätt att kontrollera."], { set: "warned" }),
          opt(["Delete it again and wait", "Ta bort det igen och vänta"], "c4", ["Back to silence.", "Tillbaka till tystnaden."])
        ])
      }),

      pg("c4", ["Support says three to five days", "Supporten säger tre till fem dagar"], [
        "The platform's support form sends back an automatic reply: account recovery cases take three to five working days.\n\nIt is Friday night. At that pace the scam can run under your name all weekend, and nobody at the platform will look at your case before Monday.",
        "Plattformens supportformulär skickar ett automatiskt svar: ärenden om återställning av konton tar tre till fem arbetsdagar.\n\nDet är fredag kväll. I den takten kan bedrägeriet pågå i ert namn hela helgen, och ingen på plattformen tittar på ert ärende före måndag."
      ], {
        variants: [vr("reported", [
          "Because the compromise was reported within the first minutes, the platform has already flagged your case as urgent. The estimate is 24 hours instead of the usual three to five days.\n\nThat is still a whole day of the scam running under your name. The question is whether you can make it shorter.",
          "Eftersom kapningen anmäldes inom de första minuterna har plattformen redan flaggat ert ärende som brådskande. Uppskattningen är 24 timmar i stället för de vanliga tre till fem dagarna.\n\nDet är ändå ett helt dygn med bedrägeriet i ert namn. Frågan är om ni kan korta det."
        ], ["Because you reported at once, the queue is shorter.", "Eftersom ni anmälde direkt är kön kortare."])],
        choice: ask(["How do you speed it up?", "Hur får ni fart på det?"], ["Uses legitimate escalation routes rather than public pressure.", "Använder legitima eskaleringsvägar i stället för offentligt tryck."], [
          opt(["Escalate through your advertising account manager", "Eskalera via er kontaktperson för annonsering"], "l2", ["Business relationships open doors that forms don't.", "Affärsrelationer öppnar dörrar som formulär inte gör."], { set: "escalated" }),
          opt(["Wait in the queue", "Vänta i kön"], "l2", ["Patient and slow.", "Tålmodigt och långsamt."]),
          opt(["Get a journalist to write about it", "Få en journalist att skriva om det"], "l2", ["Attention works. It also makes the story bigger.", "Uppmärksamhet fungerar. Den gör också historien större."], { set: "pressCalled" })
        ])
      }),

      pg("l2", ["The inbox", "Inkorgen"], [
        "Someone realises what else the attacker can see. The account's private messages hold two years of customer complaints and questions.\n\nMany contain order numbers, phone numbers and home addresses that customers sent you in confidence. Whoever has the account can read them all, and copy them.",
        "Någon inser vad mer angriparen kan se. Kontots privata meddelanden innehåller två års kundklagomål och frågor.\n\nMånga innehåller ordernummer, telefonnummer och hemadresser som kunder skickade till er i förtroende. Den som har kontot kan läsa allt och kopiera det."
      ], {
        long: true,
        skipTo: "c5",
        variants: [vr("pressCalled", [
          "The journalist delivers: the story is on the evening news, which reaches the platform, but also millions of viewers who had not heard about the scam.\n\nThen someone realises what else the attacker can see: the account's private messages hold two years of customer complaints, many with order numbers and home addresses.",
          "Journalisten levererar: historien finns i kvällsnyheterna, vilket når plattformen men också miljontals tittare som inte hade hört om bedrägeriet.\n\nSedan inser någon vad mer angriparen kan se: kontots privata meddelanden innehåller två års kundklagomål, många med ordernummer och hemadresser."
        ], ["Because you called a journalist, everyone is watching.", "Eftersom ni ringde en journalist tittar alla."])],
        choice: ask(["Is this a personal-data breach?", "Är det här en personuppgiftsincident?"], ["Recognises private messages as personal data the organisation is responsible for.", "Inser att privata meddelanden är personuppgifter som organisationen ansvarar för."], [
          opt(["Yes: bring in the DPO and assess notification", "Ja: ta in dataskyddsombudet och bedöm anmälan"], "c5", ["Correct; the messages are your customers' data.", "Rätt; meddelandena är era kunders uppgifter."]),
          opt(["No: the messages are the platform's problem", "Nej: meddelandena är plattformens problem"], "c5", ["You chose to run customer service there.", "Ni valde att sköta kundtjänst där."])
        ])
      }),

      pg("c5", ["The CEO's video", "Vd:s video"], [
        "The attacker raises the stakes. A new post: a video of {{person.ceo.name}} in front of a familiar office wall, urging followers to join the giveaway “before it closes tonight”.\n\nIt is generated, and it is convincing. The voice is right, the gestures are right, and the video is being shared far beyond your followers.",
        "Angriparen höjer insatserna. Ett nytt inlägg: en video med {{person.ceo.name}} framför en välbekant kontorsvägg, som uppmanar följarna att vara med i utdelningen ”innan den stänger i kväll”.\n\nDen är genererad, och den är övertygande. Rösten stämmer, gesterna stämmer, och videon delas långt utanför era följare."
      ], {
        variants: [vr("toolsRevoked", [
          "Cutting off the scheduling tool worked: the automatic scam posts have stopped. But the attacker still has the account and posts one more thing by hand.\n\nIt is a generated video of {{person.ceo.name}} urging followers to join the giveaway “before it closes tonight”. It is convincing, and it is being shared far beyond your followers.",
          "Att stänga av schemaläggningsverktyget fungerade: de automatiska bedrägeriinläggen har upphört. Men angriparen har fortfarande kontot och publicerar en sak till för hand.\n\nDet är en genererad video där {{person.ceo.name}} uppmanar följarna att vara med i utdelningen ”innan den stänger i kväll”. Den är övertygande och delas långt utanför era följare."
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
        "Followers who sent money are writing to customer service, the press office and the CEO's personal accounts. They want you to pay them back.\n\nTheir argument is simple: “It was your account.” Some have lost a few hundred, one says they sent their savings. Legal warns that any promise you make now will be held against you.",
        "Följare som skickade pengar skriver till kundtjänst, pressavdelningen och vd:s privata konton. De vill att ni betalar tillbaka.\n\nArgumentet är enkelt: ”Det var ert konto.” En del har förlorat några hundralappar, en skriver att hen skickade sina sparpengar. Juristen varnar för att varje löfte ni ger nu kommer att användas mot er."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you offer the victims?", "Vad erbjuder ni de drabbade?"], ["Helps victims report and recover without promising what you can't deliver.", "Hjälper de drabbade att anmäla och få upprättelse utan att lova det ni inte kan hålla."], [
          opt(["No refunds, but practical help to report to the police", "Ingen ersättning, men praktisk hjälp att polisanmäla"], "c6", ["Clear and decent. Some will still be angry.", "Tydligt och anständigt. En del blir ändå arga."]),
          opt(["Promise to “look into compensation”", "Lova att ”se över ersättning”"], "c6", ["Creates an expectation you may not meet.", "Skapar en förväntan ni kanske inte kan uppfylla."])
        ])
      }),

      pg("c6", ["Back in", "Inne igen"], [
        "{{time.T+1440|weekday|cap}}. The platform finally restores the account to you.\n\nThe scam posts and the fake video are still up, and the attacker's sessions may still be active. Everyone wants to post an apology immediately. The first hour decides whether you keep the account this time.",
        "{{time.T+1440|weekday|cap}}. Plattformen återställer till slut kontot till er.\n\nBedrägeriinläggen och den falska videon ligger fortfarande uppe, och angriparens sessioner kan fortfarande vara aktiva. Alla vill publicera en ursäkt direkt. Den första timmen avgör om ni får behålla kontot den här gången."
      ], {
        variants: [vr("escalated", [
          "Your advertising account manager made the difference: after twenty hours the platform restores the account to you.\n\nThe scam posts and the fake video are still up, and the attacker's sessions may still be active. Everyone wants to post an apology immediately. The first hour decides whether you keep the account this time.",
          "Er kontaktperson för annonseringen gjorde skillnaden: efter tjugo timmar återställer plattformen kontot till er.\n\nBedrägeriinläggen och den falska videon ligger fortfarande uppe, och angriparens sessioner kan fortfarande vara aktiva. Alla vill publicera en ursäkt direkt. Den första timmen avgör om ni får behålla kontot den här gången."
        ], ["Because you escalated through a business contact, you got back in a day early.", "Eftersom ni eskalerade via en affärskontakt kom ni in igen en dag tidigare."])],
        choice: ask(["What do you do in the first hour?", "Vad gör ni under den första timmen?"], ["Secures the account properly before posting anything.", "Säkrar kontot ordentligt innan något publiceras."], [
          opt(["Hardware keys, named owners, remove every session and connected app", "Hårdvarunycklar, namngivna ägare, ta bort alla sessioner och anslutna appar"], "c7", ["The account is safe before anyone speaks through it.", "Kontot är säkert innan någon talar genom det."], { set: "secured" }),
          opt(["Change the password and post an apology", "Byt lösenord och publicera en ursäkt"], "c7", ["Fast. The same weaknesses remain.", "Snabbt. Samma svagheter finns kvar."]),
          opt(["Give it back to the agency to manage", "Lämna tillbaka det till byrån att sköta"], "c7b", ["Back to normal, including whatever went wrong.", "Tillbaka till det normala, inklusive det som gick fel."]),
          opt(["Publicly threaten the platform with legal action", "Hota plattformen offentligt med rättsliga åtgärder"], "x1", ["Satisfying. Platforms have long memories.", "Tillfredsställande. Plattformar har långt minne."])
        ])
      }),

      pg("c7b", ["The agency", "Byrån"], [
        "Before you hand it back, the agency's account manager admits something. A laptop at the agency was infected with malware last week.\n\nTheir shared password manager was on it, including your login. They had not mentioned it because they did not think it was connected.",
        "Innan ni lämnar tillbaka det erkänner byråns kontaktperson något. En dator på byrån infekterades med skadlig kod förra veckan.\n\nDeras gemensamma lösenordshanterare fanns på den, inklusive er inloggning. De hade inte nämnt det eftersom de inte trodde att det hängde ihop."
      ], {
        choice: ask(["What do you require from the agency?", "Vad kräver ni av byrån?"], ["Requires evidence of remediation and controls before restoring access.", "Kräver belägg för åtgärder och kontroller innan åtkomsten återställs."], [
          opt(["Proof of clean-up and their own hardware keys first", "Bevis på sanering och egna hårdvarunycklar först"], "c7", ["Third-party access on your terms.", "Tredje parts åtkomst på era villkor."], { set: "secured" }),
          opt(["Trust them; it was bad luck", "Lita på dem; det var otur"], "c7", ["Luck is not a control.", "Tur är ingen kontroll."])
        ])
      }),

      pg("c7", ["The apology", "Ursäkten"], [
        "The account is yours again and the attacker is out. Followers, journalists and the scam's victims are all waiting for the first post.\n\nIt will be screenshotted, quoted and judged. Whatever you write, people will read it as a sign of how seriously you take what happened.",
        "Kontot är ert igen och angriparen är ute. Följare, journalister och bedrägeriets offer väntar alla på det första inlägget.\n\nDet kommer att skärmdumpas, citeras och bedömas. Vad ni än skriver kommer folk att läsa det som ett tecken på hur allvarligt ni tar det som hänt."
      ], {
        choice: ask(["What is the first post?", "Vad blir det första inlägget?"], ["Plain words: what happened, what you did, what victims can do.", "Enkla ord: vad som hände, vad ni gjorde, vad de drabbade kan göra."], [
          opt(["A plain apology, what happened, and how to report losses", "En enkel ursäkt, vad som hände och hur man anmäler förluster"], "l4", ["Boring and right.", "Tråkigt och rätt."]),
          opt(["A humorous post to move on", "Ett humoristiskt inlägg för att gå vidare"], "l4", ["People who lost money will not laugh.", "De som förlorat pengar kommer inte att skratta."]),
          opt(["Delete the scam posts quietly and say nothing", "Ta bort bluffinläggen i tysthet och säg ingenting"], "l4", ["Screenshots last forever.", "Skärmdumpar finns för alltid."])
        ])
      }),

      pg("l4", ["The other accounts", "De andra kontona"], [
        "During the review, someone checks the password manager history. The same password was used on two other brand accounts and on the video channel.\n\nNone of them shows signs of misuse yet. But the attacker had the password, and they have already shown that they are patient.",
        "Under genomgången kontrollerar någon historiken i lösenordshanteraren. Samma lösenord användes på två andra varumärkeskonton och på videokanalen.\n\nInget av dem visar tecken på missbruk ännu. Men angriparen hade lösenordet, och de har redan visat att de är tålmodiga."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What about the other accounts?", "Vad gör ni med de andra kontona?"], ["Secures every account that shares the weakness, today.", "Säkrar varje konto med samma svaghet, i dag."], [
          opt(["Secure all of them now", "Säkra alla nu"], "c8", ["An evening's work that closes the next incident.", "En kvälls arbete som stänger nästa incident."]),
          opt(["Check them next week", "Kontrollera dem nästa vecka"], "c8", ["The attacker has the same password.", "Angriparen har samma lösenord."])
        ])
      }),

      pg("c8", ["A second try", "Ett andra försök"], [
        "Two weeks later, the communications team receives emails that look exactly like a security notice from the platform: “Verify your account within 24 hours to keep your verified badge.”\n\nThe link leads to a convincing login page. It is the same trick that probably started all this, and it arrives while everyone is still tired.",
        "Två veckor senare får kommunikationsteamet mejl som ser exakt ut som ett säkerhetsmeddelande från plattformen: ”Verifiera ditt konto inom 24 timmar för att behålla din verifieringsmärkning.”\n\nLänken leder till en övertygande inloggningssida. Det är samma knep som troligen startade allt, och det kommer medan alla fortfarande är trötta."
      ], {
        variants: [vr("secured", [
          "Two weeks later, a fake security notice from the platform reaches the communications team. One person clicks and types the password on the fake page.\n\nThe login fails: without the hardware key, the password alone is useless. The attempt is reported within minutes. The question is whether everyone who can publish is equally protected.",
          "Två veckor senare når ett falskt säkerhetsmeddelande från plattformen kommunikationsteamet. En person klickar och skriver in lösenordet på den falska sidan.\n\nInloggningen misslyckas: utan hårdvarunyckeln är lösenordet ensamt värdelöst. Försöket rapporteras inom några minuter. Frågan är om alla som kan publicera är lika väl skyddade."
        ], ["Because the account needs a hardware key, the second attempt failed.", "Eftersom kontot kräver en hårdvarunyckel misslyckades det andra försöket."])],
        choice: ask(["What do you change for everyone who can publish?", "Vad ändrar ni för alla som kan publicera?"], ["Removes the phishable step rather than asking people to be more careful.", "Tar bort steget som går att nätfiska i stället för att be folk vara mer försiktiga."], [
          opt(["Phishing-resistant sign-in for everyone with publishing rights", "Nätfiskeresistent inloggning för alla med publiceringsrätt"], "c9", ["Solves the class of problem.", "Löser hela problemtypen."]),
          opt(["An awareness email", "Ett informationsmejl"], "c9", ["Read once, forgotten by Friday.", "Läses en gång, glöms till fredag."])
        ])
      }),

      pg("c9", ["The numbers", "Siffrorna"], [
        "Marketing presents the damage: eight percent of followers have left, and engagement on every post is down.\n\nThey want a campaign to win the followers back, and they have a draft ready. Others in the room wonder whether follower numbers are the right thing to measure after a breach of trust.",
        "Marknadsavdelningen redovisar skadan: åtta procent av följarna har lämnat och engagemanget på varje inlägg har minskat.\n\nDe vill ha en kampanj för att vinna tillbaka följarna, och de har ett utkast klart. Andra i rummet undrar om antalet följare är rätt sak att mäta efter ett förtroendebrott."
      ], {
        choice: ask(["What do you measure?", "Vad mäter ni?"], ["Measures trust and victims helped, not follower counts.", "Mäter förtroende och hjälpta drabbade, inte antal följare."], [
          opt(["Ask customers whether they trust the account", "Fråga kunderna om de litar på kontot"], "c10", ["The number that matters.", "Siffran som spelar roll."]),
          opt(["Run a giveaway to win followers back", "Kör en giveaway för att vinna tillbaka följare"], "c10", ["A giveaway. Really?", "En giveaway. Verkligen?"])
        ])
      }),

      pg("c10", ["Who owns it?", "Vem äger det?"], [
        "The last item in the review. Over the weekend it became clear that nobody really owned the brand's social accounts: communications posted, the agencies managed, IT knew nothing and security had never been asked.\n\nSomeone has to own them, in writing, from Monday.",
        "Den sista punkten i genomgången. Under helgen blev det tydligt att ingen egentligen ägde varumärkets sociala konton: kommunikation publicerade, byråerna förvaltade, IT visste ingenting och säkerhet hade aldrig blivit tillfrågad.\n\nNågon måste äga dem, skriftligt, från måndag."
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

      pg("e1", ["A month later", "En månad senare"], ["It was a bad night, but it was handled. You warned people within the hour, answered the fake video with a real one, and locked the account down before speaking through it again.\n\nMost followers stayed, and several commented that they appreciated the honest apology. The account now has named owners and hardware keys.", "Det var en dålig kväll, men den hanterades. Ni varnade folk inom en timme, besvarade den falska videon med en äkta och låste ner kontot innan ni talade genom det igen.\n\nDe flesta följare stannade, och flera kommenterade att de uppskattade den ärliga ursäkten. Kontot har nu namngivna ägare och hårdvarunycklar."], {
        ending: end(1, ["A bad night, handled", "En dålig natt, hanterad"], [
          "You warned people within the hour, answered the fake video with a real one and locked the account down before speaking through it again. Most followers stayed.",
          "Ni varnade folk inom en timme, bemötte den falska videon med en riktig och låste kontot innan ni talade genom det igen. De flesta följarna stannade kvar."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["People were warned in time and the account is now well protected.\n\nBut the fake video of the CEO never got a convincing answer. It still circulates in clips and screenshots, and every few days someone asks whether the giveaway was real.", "Folk varnades i tid och kontot är nu väl skyddat.\n\nMen den falska videon med vd fick aldrig något övertygande svar. Den cirkulerar fortfarande i klipp och skärmdumpar, och med några dagars mellanrum frågar någon om utdelningen var på riktigt."], {
        ending: end(2, ["Secure, but the video lingered", "Säkert, men videon hängde kvar"], [
          "People were warned and the account is now well protected, but the fake CEO video kept circulating without a convincing answer.",
          "Folk varnades och kontot är nu väl skyddat, men den falska vd-videon fortsatte att spridas utan ett övertygande svar."
        ])
      }),
      pg("e3", ["Six weeks later", "Sex veckor senare"], ["Followers were warned, but once the account was back it returned to the old way of working: shared logins and the agency's password manager.\n\nSix weeks later it is hijacked again, this time with a fake product recall. The second apology is much harder to write than the first.", "Följarna varnades, men när kontot väl var tillbaka återgick det till det gamla arbetssättet: delade inloggningar och byråns lösenordshanterare.\n\nSex veckor senare kapas det igen, den här gången med en falsk produktåterkallelse. Den andra ursäkten är mycket svårare att skriva än den första."], {
        ending: end(3, ["Warned, still exposed", "Varnade, fortfarande sårbara"], [
          "Followers were warned, but the account went back to the old way of working. Six weeks later it is hijacked again.",
          "Följarna varnades, men kontot gick tillbaka till det gamla arbetssättet. Sex veckor senare kapas det igen."
        ])
      }),
      pg("e4", ["Two weeks later", "Två veckor senare"], ["Without a warning from you, the scam ran for a whole day under your name and reached far more people than it should have.\n\nVictims, journalists and the consumer authority all ask the same question: why did a company with so many channels say nothing?", "Utan en varning från er pågick bedrägeriet ett helt dygn i ert namn och nådde många fler än det borde ha gjort.\n\nOffren, journalisterna och konsumentmyndigheten ställer alla samma fråga: varför sa ett företag med så många kanaler ingenting?"], {
        ending: end(4, ["Silence cost the most", "Tystnaden kostade mest"], [
          "Without a warning, the scam ran for a day under your name. Victims, journalists and a consumer authority all ask why you said nothing.",
          "Utan någon varning pågick bedrägeriet i ett dygn i ert namn. Drabbade, journalister och en konsumentmyndighet frågar alla varför ni inte sa något."
        ])
      }),

      // Break-away: the public threat.
      pg("x1", ["Public threat", "Offentligt hot"], [
        "Your public post threatening the platform with legal action goes viral, and journalists ask the platform for comment.\n\nThe platform's trust team responds by freezing the account completely, “pending review of ownership”. Now nobody can post on it, not even the attacker, and not you either.",
        "Ert offentliga inlägg där ni hotar plattformen med rättsliga åtgärder sprids viralt, och journalister ber plattformen om en kommentar.\n\nPlattformens förtroendeteam svarar med att frysa kontot helt, ”i avvaktan på granskning av ägarskapet”. Nu kan ingen publicera på det, inte angriparen, men inte heller ni."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Returns to cooperation and lets the official process work.", "Går tillbaka till samarbete och låter den officiella processen arbeta."], [
          opt(["Apologise to the platform and cooperate", "Be plattformen om ursäkt och samarbeta"], "x2", ["Humbling and necessary.", "Förödmjukande och nödvändigt."]),
          opt(["Escalate the legal threat", "Trappa upp det rättsliga hotet"], "x2", ["The freeze gets longer.", "Frysningen blir längre."])
        ])
      }),
      pg("x2", ["Copycats", "Efterapare"], [
        "With your real account frozen and silent, a dozen look-alike accounts appear over the weekend. Each uses your logo and runs its own version of the giveaway.\n\nTo your followers, there is no way to tell which account is real, because the real one says nothing.",
        "Med ert riktiga konto fryst och tyst dyker ett dussin efterliknade konton upp under helgen. Alla använder er logotyp och kör sin egen variant av utdelningen.\n\nFör era följare finns inget sätt att avgöra vilket konto som är äkta, eftersom det äkta inte säger något."
      ], {
        choice: ask(["How do you fight the copies?", "Hur bekämpar ni kopiorna?"], ["Reports them systematically and points people to a verified source.", "Anmäler dem systematiskt och hänvisar folk till en verifierad källa."], [
          opt(["Report each one and warn on the website", "Anmäl vart och ett och varna på webbplatsen"], "x3", ["Slow work that helps.", "Långsamt arbete som hjälper."]),
          opt(["Ignore them until the account is back", "Ignorera dem tills kontot är tillbaka"], "x3", ["They multiply.", "De förökar sig."])
        ])
      }),
      pg("x3", ["Victims organise", "De drabbade organiserar sig"], [
        "Victims of the scam find each other online and form a group. They contact a consumer organisation and a newspaper together.\n\nTheir message is short and spreads fast: the brand did nothing while we were robbed in its name.",
        "Offren för bedrägeriet hittar varandra på nätet och bildar en grupp. Tillsammans kontaktar de en konsumentorganisation och en tidning.\n\nDeras budskap är kort och sprids snabbt: varumärket gjorde ingenting medan vi blev bestulna i dess namn."
      ], {
        choice: ask(["How do you respond to the group?", "Hur bemöter ni gruppen?"], ["Engages directly and offers practical help.", "Tar direkt kontakt och erbjuder praktisk hjälp."], [
          opt(["Meet them and offer help with police reports", "Träffa dem och erbjud hjälp med polisanmälningar"], "x4", ["Late but sincere.", "Sent men uppriktigt."]),
          opt(["Let legal answer", "Låt juristerna svara"], "x4", ["Confirms their message.", "Bekräftar deras budskap."])
        ])
      }),
      pg("x4", ["Launch week", "Lanseringsveckan"], [
        "Your biggest product launch of the year is planned for next week. The campaign, the influencers and the press events are all built around the main social channel.\n\nThe channel is still frozen, and the platform will not say when the review will finish.",
        "Årets största produktlansering är planerad till nästa vecka. Kampanjen, influerarna och pressaktiviteterna är alla uppbyggda kring den stora sociala kanalen.\n\nKanalen är fortfarande fryst, och plattformen säger inte när granskningen blir klar."
      ], {
        choice: ask(["What happens to the launch?", "Vad händer med lanseringen?"], ["Postpones rather than launching into the scandal.", "Skjuter upp i stället för att lansera mitt i skandalen."], [
          opt(["Postpone the launch", "Skjut upp lanseringen"], "e5", ["Costly and sensible.", "Dyrt och förnuftigt."]),
          opt(["Launch on other channels", "Lansera i andra kanaler"], "e5", ["The launch becomes part of the story.", "Lanseringen blir en del av historien."])
        ])
      }),
      pg("e5", ["Five weeks later", "Fem veckor senare"], ["The public fight with the platform froze your own main channel for weeks, while copycat accounts ran the scam in your name.\n\nThe product launch was lost, the victims' group is still in the news, and the account, when it finally returned, had lost a third of its followers.", "Det offentliga bråket med plattformen frös er egen huvudkanal i veckor, medan efterliknade konton körde bedrägeriet i ert namn.\n\nProduktlanseringen gick förlorad, offrens grupp finns fortfarande i nyheterna och kontot hade, när det till slut kom tillbaka, tappat en tredjedel av följarna."], {
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
