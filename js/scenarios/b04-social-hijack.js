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
  const { L, q, inj, act, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Regain control of a hijacked brand account", "Återta kontrollen över ett kapat varumärkeskonto"]), teaser: L(["Getting your own voice back", "Att få tillbaka sin egen röst"]) },
      { id: "lo2", text: L(["Warn customers through channels you still control", "Varna kunder via kanaler ni fortfarande kontrollerar"]), teaser: L(["Reaching people when your usual channels are gone", "Att nå ut när de vanliga kanalerna är borta"]) },
      { id: "lo3", text: L(["Treat social accounts as critical identities", "Behandla konton i sociala medier som kritiska identiteter"]), teaser: L(["What you treat as important, and what you should", "Vad ni behandlar som viktigt – och vad ni borde"]) },
      { id: "lo4", text: L(["Respond to synthetic media of your own executives", "Bemöta syntetisk media med era egna chefer"]), teaser: L(["When seeing is no longer believing", "När man inte längre kan tro sina ögon"]) }
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
      reportWithdrawn: L(["Platform report withdrawn", "Anmälan till plattformen tillbakadragen"]),
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
          opt(["Try to log in and delete the post", "Försök logga in och ta bort inlägget"], "c2", ["The obvious move. It will fail if the attacker changed the password.", "Det självklara draget. Det misslyckas om angriparen har bytt lösenordet."], {
            pushback: [
              pb(["Nobody has the login", "Ingen har inloggningen"], ["The only person in the office tonight is an intern, and the password is not in any of your systems. Ten minutes go by while people search old chats for it. Do you keep hunting for the password, or switch to something else?", "Den enda som är kvar på kontoret i kväll är en praktikant, och lösenordet finns inte i något av era system. Tio minuter går medan folk letar i gamla chattar. Fortsätter ni jaga lösenordet, eller byter ni spår?"]),
              pb(["Deleting removes the evidence", "Att radera tar bort bevisen"], ["Legal points out that if you do get in and delete the post, the wallet address, the time stamps and the replies from victims go with it. The police and the platform may want them. Do you delete first and screenshot later, or document before you touch anything?", "Juristen påpekar att om ni kommer in och raderar inlägget försvinner plånboksadressen, tidsstämplarna och offrens svar med det. Polisen och plattformen kan vilja ha dem. Raderar ni först och skärmdumpar sen, eller dokumenterar ni innan ni rör något?"]),
              pb(["A second post appears", "Ett andra inlägg dyker upp"], ["While you are trying to log in, the account posts again: the same giveaway, now pinned to the top of the profile. Whoever is in there is active right now. Is deleting one post at a time really a plan?", "Medan ni försöker logga in publicerar kontot igen: samma giveaway, nu fäst högst upp i profilen. Den som är där inne är aktiv just nu. Är det verkligen en plan att radera ett inlägg i taget?"])
            ]
          }),
          opt(["Call the social media manager who has the password", "Ring den sociala medier-ansvariga som har lösenordet"], "c2", ["It's Friday night. They may be anywhere.", "Det är fredagskväll. Hen kan vara var som helst."], {
            pushback: [
              pb(["Voicemail", "Röstbrevlådan"], ["The social media manager's phone goes straight to voicemail. A colleague thinks they are on a flight this evening. Do you keep calling and wait, or start something else while you wait?", "Den sociala medier-ansvarigas telefon går direkt till röstbrevlådan. En kollega tror att hen sitter på ett flyg i kväll. Fortsätter ni ringa och vänta, eller sätter ni igång något annat under tiden?"]),
              pb(["“I'm not the only one”", "”Jag är inte den enda”"], ["When you finally reach them, they say several people know the password, including people who have left. They cannot say who else might have logged in recently. If one person is your plan, what do you do when that person cannot vouch for the account?", "När ni till slut når hen säger hen att flera känner till lösenordet, även folk som har slutat. Hen kan inte säga vem mer som kan ha loggat in nyligen. Om en person är er plan, vad gör ni när den personen inte kan gå i god för kontot?"]),
              pb(["Are they a suspect?", "Är hen misstänkt?"], ["The security lead asks quietly whether you should be sharing details with the one person whose login is in play. Nobody is accusing anyone, but nobody has checked either. Do you trust them fully tonight, and how would you know if you shouldn't?", "Säkerhetsansvarig frågar lågt om ni ska dela detaljer med den enda person vars inloggning är inblandad. Ingen anklagar någon, men ingen har heller kontrollerat. Litar ni fullt på hen i kväll, och hur skulle ni veta om ni inte borde?"])
            ]
          }),
          opt(["Report the account as compromised to the platform", "Anmäl kontot som kapat till plattformen"], "c2", ["Starts the clock on recovery now.", "Startar klockan för återställningen nu."], {
            set: "reported",
            pushback: [
              pb(["An automatic reply", "Ett automatiskt svar"], ["The report form gives you a case number and nothing else. The post is still up, and the replies keep coming. Do you sit and wait for the platform, or does someone also have to act on your side right now?", "Anmälningsformuläret ger er ett ärendenummer och ingenting annat. Inlägget ligger kvar och svaren fortsätter komma. Sitter ni och väntar på plattformen, eller måste någon också agera på er sida just nu?"]),
              pb(["Who is the owner?", "Vem är ägaren?"], ["The form asks for the account owner's name, contact email and proof of identity. Nobody in the room is sure which email address the account was registered to, or whose name is on it. Can you prove the account is yours tonight?", "Formuläret frågar efter kontoägarens namn, e-post och identitetsbevis. Ingen i rummet vet säkert vilken e-postadress kontot registrerades med, eller vems namn som står på det. Kan ni bevisa att kontot är ert i kväll?"]),
              pb(["The account might be locked", "Kontot kan låsas"], ["Communications worries that a hijack report could freeze the account for days, including for you, right before a busy weekend. They would rather try to get in first. Do you stand by the report, or hold it back until you know you can't log in yourselves?", "Kommunikation oroar sig för att en anmälan om kapning kan frysa kontot i dagar, även för er, precis före en intensiv helg. De vill hellre försöka komma in först. Står ni fast vid anmälan, eller håller ni inne den tills ni vet att ni inte kan logga in själva?"])
            ]
          })
        ])
      }),

      pg("c2", ["Locked out", "Utelåsta"], [
        "Nobody can get in. The password has been changed, and so has the recovery email address.\n\nWorse, the two-step verification codes go to a mobile number that belonged to someone at the agency you stopped working with last year. The person who could have helped you no longer exists in your organisation.",
        "Ingen kommer in. Lösenordet har ändrats, och det har även e-postadressen för återställning.\n\nÄnnu värre: koderna för tvåstegsverifiering går till ett mobilnummer som tillhörde någon på byrån ni slutade samarbeta med förra året. Den person som hade kunnat hjälpa er finns inte längre i er organisation."
      ], {
        discuss: [q("Who has ever had access to this account?", "Vilka har någonsin haft åtkomst till det här kontot?", ["comms", "ciso"])],
        choice: ask(["How do you try to get back in?", "Hur försöker ni ta er in igen?"], ["Uses the platform's official recovery route and starts an access inventory.", "Använder plattformens officiella återställningsväg och börjar inventera åtkomsten."], [
          opt(["The platform's business recovery process", "Plattformens återställningsprocess för företag"], "l1", ["Official and slow. Proves ownership properly.", "Officiellt och långsamt. Bevisar ägarskapet ordentligt."], {
            pushback: [
              pb(["Documents nobody has", "Dokument som ingen har"], ["The recovery form asks for the original registration email, invoices for advertising and a signed letter from a company officer. The invoices sit in a finance system nobody can open on a Friday night. Do you wait until Monday for the paperwork, or look for a faster way in?", "Återställningsformuläret kräver den ursprungliga registreringsadressen, fakturor för annonsering och ett undertecknat brev från en firmatecknare. Fakturorna ligger i ett ekonomisystem som ingen kan öppna en fredagskväll. Väntar ni till måndag på papperen, eller letar ni efter en snabbare väg in?"]),
              pb(["The scam keeps running", "Bedrägeriet fortsätter"], ["The official route will not stop a single post tonight. Every reply under the giveaway is another follower who might send money while you fill in forms. Is a correct process worth it if the damage happens before it starts?", "Den officiella vägen stoppar inte ett enda inlägg i kväll. Varje svar under giveawayen är en följare till som kan skicka pengar medan ni fyller i formulär. Är en korrekt process värd det om skadan sker innan den ens har börjat?"]),
              pb(["The codes go elsewhere", "Koderna går till fel ställe"], ["The process will send a verification code to the account's phone number, which is the old agency contact's mobile. Someone outside your organisation will receive it. Do you go ahead anyway, or first find out who holds that number now?", "Processen skickar en verifieringskod till kontots telefonnummer, alltså den gamla byråkontaktens mobil. Någon utanför er organisation kommer att få den. Kör ni ändå, eller tar ni först reda på vem som har numret i dag?"])
            ]
          }),
          opt(["Ask the old agency to reset it", "Be den gamla byrån återställa det"], "l1", ["They may help, or they may be how it happened.", "De kanske hjälper, eller så är det de som är orsaken."], {
            pushback: [
              pb(["The contract ended", "Avtalet har upphört"], ["The old agency answers politely: the contract ended last year, and they cannot work for you without a new order signed by someone with authority. It is Friday night. Who in your organisation can sign that now, and do you want to?", "Den gamla byrån svarar artigt: avtalet upphörde förra året och de kan inte arbeta för er utan en ny beställning undertecknad av någon behörig. Det är fredagskväll. Vem hos er kan skriva under nu, och vill ni det?"]),
              pb(["Giving them the keys again", "Att ge dem nycklarna igen"], ["The security lead objects: you do not yet know how the attacker got in, and the agency is one of very few outsiders who ever had access. Asking them to reset it gives them control of the account again. Are you sure you are asking the right people for help?", "Säkerhetsansvarig invänder: ni vet ännu inte hur angriparen kom in, och byrån är en av mycket få utomstående som någonsin har haft åtkomst. Ber ni dem återställa kontot får de kontroll över det igen. Är ni säkra på att ni ber rätt personer om hjälp?"]),
              pb(["The number is gone", "Numret finns inte kvar"], ["The agency contact whose mobile receives the codes left the agency months ago. The agency does not know whether the number still exists or who has it. What exactly do you expect the agency to be able to reset?", "Byråkontakten vars mobil får koderna slutade på byrån för flera månader sedan. Byrån vet inte om numret finns kvar eller vem som har det. Vad exakt räknar ni med att byrån ska kunna återställa?"])
            ]
          }),
          opt(["Open a new account and announce the hijack", "Öppna ett nytt konto och berätta om kapningen"], "c3b", ["Fast. Looks exactly like what impostors do.", "Snabbt. Ser ut precis som det bedragare gör."], {
            pushback: [
              pb(["Two accounts, one logo", "Två konton, en logotyp"], ["Your followers will now see two accounts with the same logo, each saying the other is fake. The hijacked one has years of history and a verified badge. Why would anyone believe the new one?", "Era följare ser nu två konton med samma logotyp, där vart och ett säger att det andra är falskt. Det kapade har flera års historik och verifieringsmärke. Varför skulle någon tro på det nya?"]),
              pb(["Who runs this one?", "Vem sköter det här?"], ["Someone has to create the new account tonight, with some email, some phone number and some password. The last account was run the same way and you are locked out of it. Who owns this one, and how is it any safer?", "Någon måste skapa det nya kontot i kväll, med någon e-post, något telefonnummer och något lösenord. Det förra kontot sköttes likadant och ni är utelåsta från det. Vem äger det här, och på vilket sätt är det säkrare?"]),
              pb(["Recovery is not started", "Återställningen har inte börjat"], ["Opening a new account does nothing to get the real one back, and the giveaway is still posted from it. Legal asks whether anyone has formally told the platform the main account is not yours right now. If not, who does that, and when?", "Ett nytt konto gör ingenting för att få tillbaka det riktiga, och giveawayen publiceras fortfarande därifrån. Juristen frågar om någon formellt har meddelat plattformen att huvudkontot inte är i er kontroll just nu. Om inte, vem gör det, och när?"])
            ]
          })
        ])
      }),

      pg("l1", ["Who has the keys?", "Vem har nycklarna?"], [
        "Someone makes a list of who actually had access, and it is uncomfortable reading. One shared login, used by {{num.sharedUsers}} people. Two agencies, the current one and the old one.\n\nAnd a scheduling tool, connected to the account with full posting rights. The attacker may not need the password at all if they control the tool.",
        "Någon gör en lista över vem som faktiskt hade åtkomst, och den är obekväm läsning. En delad inloggning, använd av {{num.sharedUsers}} personer. Två byråer, den nuvarande och den gamla.\n\nOch ett schemaläggningsverktyg, kopplat till kontot med full rätt att publicera. Angriparen kanske inte ens behöver lösenordet om de styr verktyget."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What about the connected tools?", "Vad gör ni med de anslutna verktygen?"], ["Cuts every connected app; the attacker may be posting through one.", "Kapar varje ansluten app; angriparen kanske publicerar genom en av dem."], [
          opt(["Revoke the scheduling tool's access from its side", "Återkalla schemaläggningsverktygets åtkomst från dess sida"], "c3", ["Stops posts scheduled through it, if that's the way in.", "Stoppar inlägg som schemaläggs där, om det är vägen in."], {
            set: "toolsRevoked",
            pushback: [
              pb(["The weekend campaign", "Helgens kampanj"], ["Marketing points out that the whole weekend campaign, across several channels, is queued in the same scheduling tool. Revoking access deletes the queue for this account and pauses the rest. Do you sacrifice a planned campaign on a hunch that the tool is the way in?", "Marknad påpekar att hela helgens kampanj, i flera kanaler, ligger i kö i samma schemaläggningsverktyg. Att återkalla åtkomsten raderar kön för det här kontot och pausar resten. Offrar ni en planerad kampanj på en aning om att verktyget är vägen in?"]),
              pb(["Who has the tool login?", "Vem har inloggningen till verktyget?"], ["The scheduling tool is administered by the current agency, not by you. To revoke it from its side you need them, on a Friday night, and they want to know why. Do you tell them the account is hijacked before you know whether they are involved?", "Schemaläggningsverktyget administreras av den nuvarande byrån, inte av er. För att återkalla åtkomsten från dess sida behöver ni dem, en fredagskväll, och de vill veta varför. Berättar ni att kontot är kapat innan ni vet om de är inblandade?"]),
              pb(["The posts look manual", "Inläggen ser manuella ut"], ["Someone notices the scam replies are answered within seconds, in a chatty tone, which does not look like scheduled posting. Cutting the tool may do nothing against a person logged in directly. Is this the right lever, or just the one you can reach?", "Någon märker att svaren under bluffen besvaras inom några sekunder, i pratig ton, vilket inte ser ut som schemalagda inlägg. Att kapa verktyget kanske inte gör något mot en person som är inloggad direkt. Är det här rätt spak, eller bara den ni når?"])
            ]
          }),
          opt(["Leave it; focus on the password", "Låt det vara; fokusera på lösenordet"], "c3", ["Keeps attention narrow.", "Håller fokus snävt."], {
            pushback: [
              pb(["A post you didn't expect", "Ett inlägg ni inte väntade er"], ["Another giveaway post appears, and the timestamp shows it went out at exactly the full hour, the way scheduled posts do. Changing the password would not have stopped it. Are you still sure the tool can wait?", "Ännu ett giveaway-inlägg dyker upp, och tidsstämpeln visar att det gick ut exakt på hel timme, som schemalagda inlägg brukar. Ett nytt lösenord hade inte stoppat det. Är ni fortfarande säkra på att verktyget kan vänta?"]),
              pb(["Security disagrees", "Säkerhet håller inte med"], ["The security lead says a password you cannot even reset is the wrong focus, while a connected tool with full posting rights is something you can switch off tonight. They want it written down that they advised otherwise. Do you overrule them?", "Säkerhetsansvarig säger att ett lösenord ni inte ens kan återställa är fel fokus, medan ett anslutet verktyg med full publiceringsrätt går att stänga av i kväll. Hen vill att det skrivs ned att hen rådde annorlunda. Kör ni över hen?"]),
              pb(["What else is connected?", "Vad mer är anslutet?"], ["Nobody has checked whether the scheduling tool is the only app connected to the account. There could be analytics tools, old agency apps, anything. If you are not even looking, how will you know when you finally have the account back?", "Ingen har kontrollerat om schemaläggningsverktyget är den enda appen kopplad till kontot. Det kan finnas analysverktyg, gamla byråappar, vad som helst. Om ni inte ens tittar, hur ska ni veta när ni väl har fått tillbaka kontot?"])
            ]
          })
        ])
      }),

      pg("c3", ["Followers are paying", "Följarna betalar"], [
        "The wallet in the post is public, so anyone can watch it fill. In one hour it has received payments from {{num.victims}} people.\n\nSome of them are your own customers, who trusted the account because it is yours. Others are tagging you angrily, asking why the brand is running a scam. Every hour of silence brings more victims.",
        "Plånboken i inlägget är offentlig, så vem som helst kan se den fyllas. På en timme har den tagit emot betalningar från {{num.victims}} personer.\n\nEn del av dem är era egna kunder, som litade på kontot för att det är ert. Andra taggar er argt och frågar varför varumärket kör ett bedrägeri. Varje timme av tystnad ger fler offer."
      ], {
        choice: ask(["How do you warn people?", "Hur varnar ni folk?"], ["Warns immediately on every channel you still control.", "Varnar direkt i varje kanal ni fortfarande kontrollerar."], [
          opt(["Warn on the website, newsletter and other accounts now", "Varna på webbplatsen, i nyhetsbrevet och på andra konton nu"], "c4", ["Reaches some people quickly, and from a source they can check.", "Når en del snabbt, och från en källa de kan kontrollera."], {
            set: "warned",
            pushback: [
              pb(["The newsletter is a link", "Nyhetsbrevet är en länk"], ["The newsletter template is built to drive people to your social account, and every email carries a big button to it. A warning sent tonight puts every reader one click away from the scam. Do you rebuild the template first, or send it as it is?", "Mallen för nyhetsbrevet är byggd för att skicka folk till ert sociala konto, och varje mejl har en stor knapp dit. Skickar ni en varning i kväll hamnar mottagarna ett klick från bedrägeriet. Bygger ni om mallen först, eller skickar ni den som den är?"]),
              pb(["Legal wants to approve", "Juristen vill godkänna"], ["Legal asks to read every word before it goes out: a warning that says “we have been hacked” could be read as admitting responsibility for the victims' losses. Approval could take an hour. Do you wait for legal, or publish and accept the risk?", "Juristen vill läsa varje ord innan något går ut: en varning som säger ”vi har blivit hackade” kan tolkas som att ni tar ansvar för offrens förluster. Ett godkännande kan ta en timme. Väntar ni på juristen, eller publicerar ni och tar risken?"]),
              pb(["Who reads the website?", "Vem läser webbplatsen?"], ["The web team checks: on a Friday night only a few hundred people visit the website, while the scam post is being shared thousands of times. Your warning reaches the people least at risk. What would actually reach the people who are about to send money?", "Webbteamet kollar: en fredagskväll besöker bara några hundra personer webbplatsen, medan bluffinlägget delas tusentals gånger. Er varning når dem som löper minst risk. Vad skulle faktiskt nå dem som är på väg att skicka pengar?"])
            ]
          }),
          opt(["Stay silent until the account is back", "Var tyst tills kontot är tillbaka"], "c4", ["Every silent hour is more victims.", "Varje tyst timme ger fler offer."], {
            pushback: [
              pb(["“Is it real?”", "”Är det på riktigt?”"], ["Customer service has a queue of people asking whether the giveaway is real. Staff have been told to say nothing, and some are now answering “we can't comment”, which sounds like yes. What exactly should they say to the next caller?", "Kundtjänst har en kö av folk som frågar om giveawayen är på riktigt. Personalen har fått veta att inte säga något, och en del svarar nu ”vi kan inte kommentera”, vilket låter som ett ja. Vad exakt ska de säga till nästa som ringer?"]),
              pb(["Silence is a statement", "Tystnad är också ett besked"], ["A reporter writes that the brand has been “silent for over an hour while its account runs a scam” and asks for comment within thirty minutes. Saying nothing will be printed as saying nothing. Can you defend that silence in a headline?", "En reporter skriver att varumärket har varit ”tyst i över en timme medan dess konto kör ett bedrägeri” och vill ha en kommentar inom trettio minuter. Att inte säga något kommer att publiceras som just det. Kan ni försvara tystnaden i en rubrik?"]),
              pb(["The wallet keeps filling", "Plånboken fortsätter fyllas"], ["Someone keeps the public wallet open on a screen. While you discussed staying quiet, several more payments arrived. Some of them may be your own customers. How many more are you willing to watch before you say something?", "Någon har den offentliga plånboken uppe på en skärm. Medan ni diskuterade att vara tysta kom flera betalningar till. Några av dem kan vara era egna kunder. Hur många fler är ni beredda att se innan ni säger något?"])
            ]
          }),
          opt(["Ask partners and staff to share a warning", "Be partner och personal sprida en varning"], "c4", ["Spreads fast; the message can get garbled.", "Sprids snabbt; budskapet kan förvanskas."], {
            set: "warned",
            pushback: [
              pb(["Ten versions of the warning", "Tio versioner av varningen"], ["Within an hour there are many versions in circulation: one says “we were hacked”, another “a former employee did it”, a third gives the wrong wallet. You are now being quoted on things you never said. How do you take back control of the message?", "Inom en timme cirkulerar många versioner: en säger ”vi blev hackade”, en annan ”en före detta anställd gjorde det”, en tredje anger fel plånbok. Nu citeras ni på saker ni aldrig har sagt. Hur tar ni tillbaka kontrollen över budskapet?"]),
              pb(["Staff as targets", "Personalen som måltavlor"], ["Staff who shared the warning on their personal accounts are getting angry messages from victims, some of them abusive. One employee asks whether they were ordered to put their own name on this. Who protects them, and should you have asked them at all?", "Anställda som delade varningen på sina privata konton får arga meddelanden från offer, en del kränkande. En anställd frågar om hen blev beordrad att sätta sitt eget namn på det här. Vem skyddar dem, och borde ni ens ha frågat dem?"]),
              pb(["A partner says no", "En partner säger nej"], ["Your largest partner refuses to share anything until they see an official statement from you. They do not want to repeat something that turns out to be wrong. Where is that official statement, and why does it not exist yet?", "Er största partner vägrar dela något förrän de har sett ett officiellt uttalande från er. De vill inte upprepa något som visar sig vara fel. Var finns det officiella uttalandet, och varför finns det inte än?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The second account", "Det andra kontot"], [
        "Your new account goes up within minutes, with a message that the main account has been hijacked.\n\nBut the platform's systems flag it as a possible impostor: it is brand new, has no history and uses your logo. Some followers report it as the scam, which is exactly what a scammer's account would look like.",
        "Ert nya konto är uppe inom några minuter, med ett meddelande om att huvudkontot har kapats.\n\nMen plattformens system flaggar det som en möjlig bluff: det är helt nytt, saknar historik och använder er logotyp. En del följare anmäler det som bedrägeriet, vilket är precis så ett bedragarkonto skulle se ut."
      ], {
        choice: ask(["How do you make the new account credible?", "Hur gör ni det nya kontot trovärdigt?"], ["Anchors it to a source people already trust, such as the website.", "Förankrar det i en källa folk redan litar på, till exempel webbplatsen."], [
          opt(["Link it from the website and a press release", "Länka till det från webbplatsen och ett pressmeddelande"], "c4", ["Gives people a way to check.", "Ger folk ett sätt att kontrollera."], {
            set: "warned",
            pushback: [
              pb(["The press release lands", "Pressmeddelandet landar"], ["Your press release goes out on a quiet Friday night and becomes the only story in town. Several outlets now report the hijack to audiences who had never seen the scam. Did you just turn a problem among your followers into national news?", "Ert pressmeddelande går ut en lugn fredagskväll och blir den enda nyheten. Flera redaktioner rapporterar nu om kapningen till en publik som aldrig hade sett bedrägeriet. Har ni just gjort ett problem bland era följare till en riksnyhet?"]),
              pb(["The platform suspends it", "Plattformen stänger av det"], ["While the press release is still being written, the platform suspends the new account for impersonation, citing the reports from your own followers. Your website now links to a dead page. Do you appeal, open yet another account, or drop the idea?", "Medan pressmeddelandet fortfarande skrivs stänger plattformen av det nya kontot för identitetsintrång, med hänvisning till anmälningar från era egna följare. Er webbplats länkar nu till en död sida. Överklagar ni, öppnar ännu ett konto eller släpper ni idén?"]),
              pb(["The scammers copy it", "Bedragarna kopierar det"], ["Within the hour, an account with almost the same name as your new one appears, copying your warning word for word but adding a “safe” wallet for refunds. Your announcement became their template. How do people tell your new account from the copy?", "Inom en timme dyker ett konto upp med nästan samma namn som ert nya, som kopierar er varning ord för ord men lägger till en ”säker” plånbok för återbetalningar. Ert besked blev deras mall. Hur skiljer folk ert nya konto från kopian?"])
            ]
          }),
          opt(["Delete it again and wait", "Ta bort det igen och vänta"], "c4", ["Back to silence.", "Tillbaka till tystnaden."], {
            pushback: [
              pb(["“They deleted the warning”", "”De raderade varningen”"], ["Followers screenshotted the new account before you removed it. Now people are posting that the brand published a warning and then deleted it, which looks like the warning was the scam. How do you explain that without making it worse?", "Följare skärmdumpade det nya kontot innan ni tog bort det. Nu skriver folk att varumärket publicerade en varning och sedan raderade den, vilket får det att se ut som om varningen var bluffen. Hur förklarar ni det utan att göra det värre?"]),
              pb(["Customer service has nothing", "Kundtjänst har ingenting"], ["The customer service team had started pointing callers to the new account. Now it is gone and they have nothing to refer to. Do you give them something to say tonight, or leave them to improvise?", "Kundtjänst hade börjat hänvisa dem som ringde till det nya kontot. Nu är det borta och de har inget att hänvisa till. Ger ni dem något att säga i kväll, eller låter ni dem improvisera?"]),
              pb(["Waiting for what?", "Vänta på vad?"], ["Nobody has formally asked the platform for the main account back yet, so waiting is not waiting for anything in particular. The scam is still the only thing your brand is saying publicly. What, exactly, are you waiting for?", "Ingen har ännu formellt bett plattformen om huvudkontot tillbaka, så att vänta är inte att vänta på något särskilt. Bedrägeriet är fortfarande det enda ert varumärke säger offentligt. Vad, exakt, väntar ni på?"])
            ]
          })
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
          opt(["Escalate through your advertising account manager", "Eskalera via er kontaktperson för annonsering"], "l2", ["Business relationships open doors that forms don't.", "Affärsrelationer öppnar dörrar som formulär inte gör."], {
            set: "escalated",
            pushback: [
              pb(["Out of office", "Frånvaromeddelande"], ["The account manager's email replies that they are away until Tuesday. Their phone number is not in the contract, only a general sales line that is closed. Who else in your organisation has a contact at the platform, and is anyone looking?", "Kontaktpersonens mejl svarar att hen är borta till tisdag. Telefonnumret finns inte i avtalet, bara en allmän säljlinje som är stängd. Vem mer hos er har en kontakt på plattformen, och letar någon?"]),
              pb(["“Increase your spend”", "”Öka er annonsbudget”"], ["A sales contact at the platform answers quickly and offers to “prioritise” your case if you commit to a larger advertising budget this quarter. Finance has not approved anything. Do you pay for faster help, and how would that look if it became known?", "En säljkontakt på plattformen svarar snabbt och erbjuder sig att ”prioritera” ert ärende om ni binder er för en större annonsbudget det här kvartalet. Ekonomi har inte godkänt något. Betalar ni för snabbare hjälp, och hur skulle det se ut om det blev känt?"]),
              pb(["Paying customers only?", "Bara för betalande kunder?"], ["Comms raises a question the press may ask: if a brand with a large ad budget gets its account back in a day, what about ordinary users whose hijacked accounts wait a week? Are you comfortable with how this route will look in the apology?", "Kommunikation lyfter en fråga som pressen kan ställa: om ett varumärke med stor annonsbudget får tillbaka sitt konto på ett dygn, vad gäller då för vanliga användare som väntar en vecka? Är ni bekväma med hur den här vägen kommer att se ut i ursäkten?"])
            ]
          }),
          opt(["Wait in the queue", "Vänta i kön"], "l2", ["Patient and slow.", "Tålmodigt och långsamt."], {
            pushback: [
              pb(["The CEO wants action", "Vd vill se handling"], ["The CEO calls from a dinner: friends are showing them the scam post and asking what the company is doing. “Waiting in a queue” is not an answer they will accept. What do you tell the CEO you are doing, besides waiting?", "Vd ringer från en middag: vänner visar inlägget och frågar vad företaget gör. ”Väntar i en kö” är inget svar vd tänker godta. Vad säger ni till vd att ni gör, utöver att vänta?"]),
              pb(["The queue has no number", "Kön har inget nummer"], ["The support page offers no way to check your place or add information to the case. You do not know whether anyone has even opened it. How do you know you are actually in the queue, and not just in a mailbox?", "Supportsidan ger inget sätt att se er plats eller lägga till information i ärendet. Ni vet inte ens om någon har öppnat det. Hur vet ni att ni faktiskt står i kön, och inte bara ligger i en brevlåda?"]),
              pb(["A weekend of the scam", "En helg med bedrägeriet"], ["The marketing lead does the maths: if the platform starts on Monday, the scam will have run under your name for around sixty hours. Each of those hours has new victims. Is patience still a choice, or is it now a decision you will have to justify?", "Marknadschefen räknar: om plattformen börjar på måndag har bedrägeriet pågått i ert namn i ungefär sextio timmar. Varje timme ger nya offer. Är tålamod fortfarande ett val, eller ett beslut ni kommer att behöva försvara?"])
            ]
          }),
          opt(["Get a journalist to write about it", "Få en journalist att skriva om det"], "l2", ["Attention works. It also makes the story bigger.", "Uppmärksamhet fungerar. Den gör också historien större."], {
            set: "pressCalled",
            pushback: [
              pb(["The journalist has questions", "Journalisten har frågor"], ["The journalist is interested, but asks first: who had the password, did you have two-step verification, and why was the recovery phone a former contractor's number? You will be the story, not the platform. Are you ready to answer those on the record?", "Journalisten är intresserad men frågar först: vem hade lösenordet, hade ni tvåstegsverifiering, och varför var återställningsnumret en tidigare leverantörs nummer? Ni blir historien, inte plattformen. Är ni redo att svara på det offentligt?"]),
              pb(["The platform is not amused", "Plattformen är inte road"], ["A platform contact you know privately warns that cases which arrive via the press tend to go to the legal team, not to support. That can be slower, not faster. Do you still call the journalist, or try the quiet route first?", "En kontakt på plattformen som ni känner privat varnar för att ärenden som kommer via pressen brukar gå till juristerna, inte till supporten. Det kan bli långsammare, inte snabbare. Ringer ni ändå journalisten, eller provar ni den tysta vägen först?"]),
              pb(["Who approved this?", "Vem godkände det här?"], ["Legal hears about the journalist call afterwards and is furious: anything said to the press now can be used by victims claiming compensation. They ask who decided to go to the media, and on whose authority. Who did?", "Juristen får höra om samtalet till journalisten i efterhand och är rasande: allt som sägs till pressen nu kan användas av offer som kräver ersättning. Hen frågar vem som beslutade att gå till media, och med vilket mandat. Vem gjorde det?"])
            ]
          })
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
          opt(["Yes: bring in the DPO and assess notification", "Ja: ta in dataskyddsombudet och bedöm anmälan"], "c5", ["Correct; the messages are your customers' data.", "Rätt; meddelandena är era kunders uppgifter."], {
            pushback: [
              pb(["The clock starts now", "Klockan börjar ticka nu"], ["The DPO says that once you are aware of a likely breach, the deadline to notify the supervisory authority starts running, weekend or not. Nobody can yet say whether the attacker has actually opened the messages. Do you notify on a suspicion, or wait for facts you may never get?", "Dataskyddsombudet säger att när ni känner till en trolig incident börjar fristen för anmälan till tillsynsmyndigheten löpa, helg eller inte. Ingen kan ännu säga om angriparen faktiskt har öppnat meddelandena. Anmäler ni på en misstanke, eller väntar ni på fakta ni kanske aldrig får?"]),
              pb(["Telling the customers", "Att berätta för kunderna"], ["If the breach is serious, the customers who wrote to you may need to be told. But you cannot see the inbox, so you do not know who they are. How do you inform people you cannot identify, through an account you do not control?", "Om incidenten är allvarlig kan kunderna som skrev till er behöva informeras. Men ni kan inte se inkorgen, så ni vet inte vilka de är. Hur informerar ni människor ni inte kan identifiera, via ett konto ni inte styr över?"]),
              pb(["Not tonight, says comms", "Inte i kväll, säger kommunikation"], ["Communications pushes back: the team is already stretched warning people about the scam, and a data breach notice tonight would double the story. They want the assessment moved to Monday. Can it wait, and who decides?", "Kommunikation protesterar: teamet är redan pressat av att varna folk för bedrägeriet, och ett besked om en personuppgiftsincident i kväll skulle fördubbla historien. De vill flytta bedömningen till måndag. Kan den vänta, och vem bestämmer?"])
            ]
          }),
          opt(["No: the messages are the platform's problem", "Nej: meddelandena är plattformens problem"], "c5", ["You chose to run customer service there.", "Ni valde att sköta kundtjänst där."], {
            pushback: [
              pb(["The DPO disagrees", "Dataskyddsombudet håller inte med"], ["The DPO asks to have it minuted that they were not consulted, and that in their view you decided what to collect through that inbox. If that is right, the responsibility is yours. Are you willing to overrule the person whose job this is?", "Dataskyddsombudet vill ha det protokollfört att hen inte tillfrågades, och att ni enligt hen bestämde vad som samlades in i den inkorgen. Stämmer det är ansvaret ert. Är ni beredda att köra över den person vars jobb det här är?"]),
              pb(["A customer asks directly", "En kund frågar direkt"], ["A customer emails: they sent you their address and a photo of an ID document through private messages last month, and they want to know if a scammer can now see it. “It's the platform's problem” is the honest version of your position. Will you write that to them?", "En kund mejlar: hen skickade sin adress och en bild på en id-handling via privata meddelanden förra månaden och vill veta om en bedragare nu kan se det. ”Det är plattformens problem” är den ärliga versionen av er hållning. Skriver ni det till hen?"]),
              pb(["Would the platform agree?", "Håller plattformen med?"], ["Legal reads the platform's business terms: they state that the account holder is responsible for the content they collect and handle through the service. Your premise may not hold. If it doesn't, how long can you afford to have been wrong?", "Juristen läser plattformens villkor för företag: där står att kontoinnehavaren ansvarar för det innehåll den samlar in och hanterar via tjänsten. Er premiss kanske inte håller. Om den inte gör det, hur länge har ni råd att ha haft fel?"])
            ]
          })
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
          opt(["The CEO records a short real video for the website and other channels", "Vd spelar in en kort riktig video till webbplatsen och övriga kanaler"], "l3", ["Fast, human, verifiable through your own site.", "Snabbt, mänskligt, verifierbart via er egen webbplats."], {
            set: "ceoVideo",
            pushback: [
              pb(["Two videos, same face", "Två videor, samma ansikte"], ["Commenters put the real video next to the fake one and ask which is generated. Some are sure the new one is the fake, because it looks less polished. How does anyone outside the company tell which video is real?", "Kommentatorer lägger den riktiga videon bredvid den falska och frågar vilken som är genererad. En del är säkra på att den nya är falsk, eftersom den ser mindre proffsig ut. Hur ska någon utanför företaget avgöra vilken video som är äkta?"]),
              pb(["The CEO is not ready", "Vd är inte redo"], ["The CEO is at a family event, tired and upset, and the first take sounds defensive. Comms wants a script; the CEO wants to speak freely. Do you publish an imperfect video now, or spend another hour getting it right?", "Vd är på en familjetillställning, trött och upprörd, och första tagningen låter defensiv. Kommunikation vill ha ett manus; vd vill prata fritt. Publicerar ni en ofullkomlig video nu, eller lägger ni en timme till på att få den rätt?"]),
              pb(["More raw material", "Mer råmaterial"], ["The security lead points out that a fresh, close-up recording of the CEO's face and voice is exactly what the people behind the fake would like more of. You are about to publish it. Is fighting a video with a video worth that risk?", "Säkerhetsansvarig påpekar att en ny närbild av vd:s ansikte och röst är precis vad de som ligger bakom förfalskningen skulle vilja ha mer av. Ni är på väg att publicera just det. Är det värt risken att bemöta en video med en video?"])
            ]
          }),
          opt(["A written statement only", "Bara ett skriftligt uttalande"], "l3", ["Safe, and much less effective against a video.", "Säkert, och mycket mindre effektivt mot en video."], {
            pushback: [
              pb(["Nobody shares text", "Ingen delar text"], ["An hour after your statement, the fake video has been shared many times more than your text. Several news sites embed the video and mention your statement in a single line. Is a statement that nobody sees still an answer?", "En timme efter ert uttalande har den falska videon delats många gånger fler än er text. Flera nyhetssajter bäddar in videon och nämner ert uttalande på en enda rad. Är ett uttalande som ingen ser fortfarande ett svar?"]),
              pb(["“Why won't the CEO speak?”", "”Varför pratar inte vd?”"], ["Followers notice that the CEO, who is happy to appear on video in good times, is suddenly only text. Some read it as the CEO hiding. How do you explain the choice without sounding like you have something to conceal?", "Följare märker att vd, som gärna syns på video när det går bra, plötsligt bara hörs i text. En del tolkar det som att vd gömmer sig. Hur förklarar ni valet utan att låta som om ni har något att dölja?"]),
              pb(["Text is easy to fake", "Text är lätt att förfalska"], ["Within minutes, a look-alike account posts a copy of your written statement with one sentence changed: the giveaway is “real but paused”. Your text is as easy to fake as anything else. What makes your statement verifiably yours?", "Inom några minuter publicerar ett liknande konto en kopia av ert skriftliga uttalande med en mening ändrad: giveawayen är ”äkta men pausad”. Er text är lika lätt att förfalska som allt annat. Vad gör ert uttalande verifierbart ert?"])
            ]
          }),
          opt(["Withdraw the platform report and try to win the account back yourselves", "Dra tillbaka anmälan till plattformen och försök ta tillbaka kontot själva"], "l3", ["Reverses the report: maybe faster, but you lose the platform's case.", "Upphäver anmälan: kanske snabbare, men ni förlorar plattformens ärende."], {
            requires: "reported",
            set: "reportWithdrawn",
            effects: { media: 1 },
            pushback: [
              pb(["Back of the queue", "Längst bak i kön"], ["The platform confirms the withdrawal and closes your urgent case. If you need them again, you start over with a new report. How sure are you that your own route will work, now that the safety net is gone?", "Plattformen bekräftar återkallelsen och stänger ert brådskande ärende. Behöver ni dem igen börjar ni om med en ny anmälan. Hur säkra är ni på att er egen väg fungerar, nu när skyddsnätet är borta?"]),
              pb(["With what, exactly?", "Med vad, exakt?"], ["The security lead asks what “win it back ourselves” means in practice: you have no password, no recovery email and no access to the phone number. Nobody has a concrete answer. What is the first step, and who takes it tonight?", "Säkerhetsansvarig frågar vad ”ta tillbaka det själva” betyder i praktiken: ni har inget lösenord, ingen återställningsadress och ingen åtkomst till telefonnumret. Ingen har ett konkret svar. Vad är första steget, och vem tar det i kväll?"]),
              pb(["It looks like a cover-up", "Det ser ut som en mörkläggning"], ["A journalist following the story notices that you have withdrawn your hijack report while a fake CEO video is spreading. Their question: why would a company stop the platform from investigating its own account? What do you answer?", "En journalist som följer historien ser att ni har dragit tillbaka er anmälan om kapning medan en falsk vd-video sprids. Frågan: varför skulle ett företag hindra plattformen från att utreda dess eget konto? Vad svarar ni?"])
            ]
          })
        ])
      }),

      pg("l3", ["Refunds?", "Ersättning?"], [
        "Followers who sent money are writing to customer service, the press office and the CEO's personal accounts. They want you to pay them back.\n\nTheir argument is simple: “It was your account.” Some have lost a few hundred, one says they sent their savings. Legal warns that any promise you make now will be held against you.",
        "Följare som skickade pengar skriver till kundtjänst, pressavdelningen och vd:s privata konton. De vill att ni betalar tillbaka.\n\nArgumentet är enkelt: ”Det var ert konto.” En del har förlorat några hundralappar, en skriver att hen skickade sina sparpengar. Juristen varnar för att varje löfte ni ger nu kommer att användas mot er."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you offer the victims?", "Vad erbjuder ni de drabbade?"], ["Helps victims report and recover without promising what you can't deliver.", "Hjälper de drabbade att anmäla och få upprättelse utan att lova det ni inte kan hålla."], [
          opt(["No refunds, but practical help to report to the police", "Ingen ersättning, men praktisk hjälp att polisanmäla"], "c6", ["Clear and decent. Some will still be angry.", "Tydligt och anständigt. En del blir ändå arga."], {
            pushback: [
              pb(["The savings", "Sparpengarna"], ["The follower who sent their savings replies publicly: “So it was your account, your security, and my money. And you are offering me a form?” The post is spreading fast. Is “no refunds” still the line for this person?", "Följaren som skickade sina sparpengar svarar offentligt: ”Så det var ert konto, er säkerhet och mina pengar. Och ni erbjuder mig ett formulär?” Inlägget sprids snabbt. Är ”ingen ersättning” fortfarande linjen för den här personen?"]),
              pb(["Who helps with the reports?", "Vem hjälper till med anmälningarna?"], ["Practical help means people, and it is the weekend. Customer service has two people on shift and a queue of angry callers. Who actually sits with victims and helps them file police reports, and from when?", "Praktisk hjälp kräver folk, och det är helg. Kundtjänst har två personer i tjänst och en kö av arga samtal. Vem sitter faktiskt med de drabbade och hjälper dem att polisanmäla, och från när?"]),
              pb(["A competitor pays", "En konkurrent betalar"], ["A trade publication recalls that another company, hit by a similar scam, compensated victims in full and was praised for it. Your board chair forwards the article without comment. Is your “no” still defensible when someone else said yes?", "En branschtidning påminner om att ett annat företag, drabbat av ett liknande bedrägeri, ersatte offren fullt ut och fick beröm för det. Er styrelseordförande vidarebefordrar artikeln utan kommentar. Går ert ”nej” fortfarande att försvara när någon annan sa ja?"])
            ]
          }),
          opt(["Promise to “look into compensation”", "Lova att ”se över ersättning”"], "c6", ["Creates an expectation you may not meet.", "Skapar en förväntan ni kanske inte kan uppfylla."], {
            pushback: [
              pb(["New “victims” appear", "Nya ”drabbade” dyker upp"], ["Within hours of your promise, the number of people claiming they sent money doubles. Some have no transaction you can see in the public wallet. How do you decide who is a victim, and who is trying their luck?", "Inom några timmar efter ert löfte fördubblas antalet som säger att de skickade pengar. En del har ingen transaktion som syns i den offentliga plånboken. Hur avgör ni vem som är drabbad och vem som chansar?"]),
              pb(["Legal's warning", "Juristens varning"], ["Legal reminds you that they warned against promises. “Look into” is already being quoted as “will compensate”, and a consumer group asks for your timeline. Do you stand by the wording, or walk it back now and take the anger?", "Juristen påminner om att hen varnade för löften. ”Se över” citeras redan som ”kommer att ersätta”, och en konsumentgrupp frågar efter er tidsplan. Står ni fast vid formuleringen, eller backar ni nu och tar ilskan?"]),
              pb(["Who pays?", "Vem betalar?"], ["Finance asks which budget this would come from, and whether insurance covers losses caused by fraud through a hijacked account. Nobody knows. If the answer turns out to be “no budget, no insurance”, what did you just promise?", "Ekonomi frågar vilken budget det här skulle tas från, och om försäkringen täcker förluster från bedrägeri via ett kapat konto. Ingen vet. Om svaret visar sig vara ”ingen budget, ingen försäkring”, vad har ni då just lovat?"])
            ]
          })
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
          opt(["Hardware keys, named owners, remove every session and connected app", "Hårdvarunycklar, namngivna ägare, ta bort alla sessioner och anslutna appar"], "c7", ["The account is safe before anyone speaks through it.", "Kontot är säkert innan någon talar genom det."], {
            set: "secured",
            pushback: [
              pb(["No keys in the building", "Inga nycklar i huset"], ["Nobody has hardware keys at hand on a weekend, and the nearest store that sells them opens tomorrow. Meanwhile the scam posts and the fake video stay up, because nobody posts until it is secured. How long are you willing to stay silent on your own account to do this properly?", "Ingen har hårdvarunycklar till hands en helg, och närmaste butik som säljer dem öppnar i morgon. Under tiden ligger bluffinläggen och den falska videon kvar, eftersom ingen publicerar förrän kontot är säkrat. Hur länge är ni beredda att vara tysta på ert eget konto för att göra det här ordentligt?"]),
              pb(["Named owners say no", "Namngivna ägare säger nej"], ["The two people proposed as named owners hesitate: being personally responsible for an account that was just used for fraud is not what they signed up for. One asks what happens to them if it is hijacked again. What do you offer them besides the title?", "De två som föreslås som namngivna ägare tvekar: att personligen ansvara för ett konto som just användes för bedrägeri är inte vad de gick med på. En frågar vad som händer med hen om det kapas igen. Vad erbjuder ni dem utöver titeln?"]),
              pb(["The team is locked out too", "Teamet är också utelåst"], ["Removing every session and connected app also logs out the people who answer customers on the account. On a weekend full of complaints, nobody can reply. Who answers the hundreds of messages now waiting, and how?", "Att ta bort alla sessioner och anslutna appar loggar också ut dem som svarar kunder på kontot. En helg full av klagomål kan ingen svara. Vem besvarar de hundratals meddelanden som nu väntar, och hur?"])
            ]
          }),
          opt(["Change the password and post an apology", "Byt lösenord och publicera en ursäkt"], "c7", ["Fast. The same weaknesses remain.", "Snabbt. Samma svagheter finns kvar."], {
            pushback: [
              pb(["The scam post is still there", "Bluffinlägget finns kvar"], ["Your apology appears directly above the giveaway post and the fake video, which nobody has removed yet. Screenshots show the apology and the scam side by side. Which do you deal with first, and did you post too soon?", "Er ursäkt hamnar direkt ovanför giveaway-inlägget och den falska videon, som ingen har tagit bort än. Skärmdumpar visar ursäkten och bedrägeriet sida vid sida. Vad tar ni hand om först, och publicerade ni för tidigt?"]),
              pb(["Same phone number", "Samma telefonnummer"], ["The new password is set, but the two-step codes still go to the old agency contact's mobile, and the recovery email is still the attacker's. Anyone with either can reset your new password in minutes. What did changing it actually change?", "Det nya lösenordet är satt, men tvåstegskoderna går fortfarande till den gamla byråkontaktens mobil, och återställningsadressen är fortfarande angriparens. Den som har någon av dem kan återställa ert nya lösenord på några minuter. Vad ändrade bytet egentligen?"]),
              pb(["Security won't sign off", "Säkerhet skriver inte under"], ["The security lead refuses to call the incident closed while active sessions and connected apps have not been checked. Comms says the apology cannot wait any longer. Who decides when the account is safe enough to speak through?", "Säkerhetsansvarig vägrar förklara incidenten avslutad så länge aktiva sessioner och anslutna appar inte har kontrollerats. Kommunikation säger att ursäkten inte kan vänta längre. Vem avgör när kontot är tillräckligt säkert att tala genom?"])
            ]
          }),
          opt(["Give it back to the agency to manage", "Lämna tillbaka det till byrån att sköta"], "c7b", ["Back to normal, including whatever went wrong.", "Tillbaka till det normala, inklusive det som gick fel."], {
            pushback: [
              pb(["You still don't know how", "Ni vet fortfarande inte hur"], ["Nobody has yet explained how the attacker got in. Handing the account back to the people who managed it before means trusting a setup that failed. What would you need to know before you hand over the keys?", "Ingen har ännu förklarat hur angriparen tog sig in. Att lämna tillbaka kontot till dem som skötte det tidigare innebär att lita på ett upplägg som har fallerat. Vad skulle ni behöva veta innan ni lämnar över nycklarna?"]),
              pb(["The board asks one thing", "Styrelsen frågar en sak"], ["The board chair, following the story, asks a simple question: after a weekend like this, is the company's voice really going back to an outside supplier on Monday as if nothing happened? Can you defend that in one sentence?", "Styrelseordföranden, som följer historien, ställer en enkel fråga: efter en sådan helg, ska företagets röst verkligen gå tillbaka till en extern leverantör på måndag som om ingenting hänt? Kan ni försvara det i en mening?"]),
              pb(["The apology goes where?", "Var hamnar ursäkten?"], ["The agency will be the one writing and posting your apology, in your name, about an incident nobody has fully explained yet. Comms is uneasy about who has the final word. Who signs off on the first post after this weekend?", "Det blir byrån som skriver och publicerar er ursäkt, i ert namn, om en incident som ingen ännu har förklarat fullt ut. Kommunikation är obekväm med vem som har sista ordet. Vem godkänner det första inlägget efter den här helgen?"])
            ]
          }),
          opt(["Publicly threaten the platform with legal action", "Hota plattformen offentligt med rättsliga åtgärder"], "x1", ["Satisfying. Platforms have long memories.", "Tillfredsställande. Plattformar har långt minne."], {
            pushback: [
              pb(["The platform just helped", "Plattformen hjälpte just till"], ["The platform has just given you the account back. Your threat lands in the inbox of the same support team that restored it. What do you expect them to do the next time you need them?", "Plattformen har just gett er kontot tillbaka. Ert hot landar hos samma supportteam som återställde det. Vad räknar ni med att de gör nästa gång ni behöver dem?"]),
              pb(["On what grounds?", "På vilka grunder?"], ["Your own lawyer says there is no clear legal claim: the platform's terms put responsibility for passwords and verification on the account holder. Threatening a case you cannot bring will be quoted for years. Do you still post it?", "Er egen jurist säger att det inte finns något tydligt rättsligt anspråk: plattformens villkor lägger ansvaret för lösenord och verifiering på kontoinnehavaren. Att hota med en process ni inte kan driva kommer att citeras i åratal. Publicerar ni ändå?"]),
              pb(["The first post is a fight", "Första inlägget är ett bråk"], ["The scam victims are waiting for your first words since the hijack. If those words are an attack on someone else, what do the victims hear about your own responsibility?", "De drabbade väntar på era första ord sedan kapningen. Om de orden är ett angrepp på någon annan, vad hör de drabbade om ert eget ansvar?"])
            ]
          })
        ])
      }),

      pg("c7b", ["The agency", "Byrån"], [
        "Before you hand it back, the agency's account manager admits something. A laptop at the agency was infected with malware last week.\n\nTheir shared password manager was on it, including your login. They had not mentioned it because they did not think it was connected.",
        "Innan ni lämnar tillbaka det erkänner byråns kontaktperson något. En dator på byrån infekterades med skadlig kod förra veckan.\n\nDeras gemensamma lösenordshanterare fanns på den, inklusive er inloggning. De hade inte nämnt det eftersom de inte trodde att det hängde ihop."
      ], {
        choice: ask(["What do you require from the agency?", "Vad kräver ni av byrån?"], ["Requires evidence of remediation and controls before restoring access.", "Kräver belägg för åtgärder och kontroller innan åtkomsten återställs."], [
          opt(["Proof of clean-up and their own hardware keys first", "Bevis på sanering och egna hårdvarunycklar först"], "c7", ["Third-party access on your terms.", "Tredje parts åtkomst på era villkor."], {
            set: "secured",
            pushback: [
              pb(["“That will take weeks”", "”Det tar veckor”"], ["The agency says a proper clean-up and new keys for all their staff will take two to three weeks, and they will invoice for it. Until then they cannot post for you. Who runs your channels in the meantime, and who pays for the agency's mistake?", "Byrån säger att en ordentlig sanering och nya nycklar till all personal tar två till tre veckor, och att de kommer att fakturera för det. Till dess kan de inte publicera åt er. Vem sköter era kanaler under tiden, och vem betalar för byråns misstag?"]),
              pb(["What counts as proof?", "Vad räknas som bevis?"], ["The agency sends a one-page letter from their own IT person saying the laptop has been “cleaned”. Your security lead says that proves nothing. Do you accept it, demand an independent review, or decide you cannot judge it at all?", "Byrån skickar ett ensidigt brev från sin egen IT-person om att datorn har ”rensats”. Er säkerhetsansvarige säger att det inte bevisar något. Godtar ni det, kräver ni en oberoende granskning, eller inser ni att ni inte alls kan bedöma det?"]),
              pb(["Their other clients", "Deras andra kunder"], ["The password manager on that laptop held logins for other clients too. The agency asks you to keep the infection confidential while they decide what to tell them. Do you agree to stay quiet about something that may be putting other companies at risk?", "Lösenordshanteraren på datorn innehöll inloggningar till andra kunder också. Byrån ber er hålla infektionen hemlig medan de bestämmer vad de ska säga till dem. Går ni med på att tiga om något som kan utsätta andra företag för risk?"])
            ]
          }),
          opt(["Trust them; it was bad luck", "Lita på dem; det var otur"], "c7", ["Luck is not a control.", "Tur är ingen kontroll."], {
            pushback: [
              pb(["They didn't tell you", "De berättade inte"], ["The agency knew about the infected laptop last week and said nothing until you were about to hand the account back. Security asks what else they have not mentioned. Why is that “bad luck” rather than a breach of trust?", "Byrån kände till den infekterade datorn förra veckan och sa ingenting förrän ni skulle lämna tillbaka kontot. Säkerhet frågar vad mer de inte har nämnt. Varför är det ”otur” och inte ett förtroendebrott?"]),
              pb(["The same password manager", "Samma lösenordshanterare"], ["Nothing about the agency's setup has changed: the same shared password manager, the same people, perhaps the same laptops. Your new login goes straight into it. What stops this from happening again next month?", "Ingenting i byråns upplägg har ändrats: samma delade lösenordshanterare, samma personer, kanske samma datorer. Er nya inloggning hamnar direkt där. Vad hindrar att det här händer igen nästa månad?"]),
              pb(["Explaining it to the CEO", "Att förklara det för vd"], ["The CEO, whose face was faked for a scam, asks how the attacker got the password. When you explain the agency's laptop and your decision to carry on as before, there is a long silence. How do you justify the choice to the person who paid for it most publicly?", "Vd, vars ansikte förfalskades för ett bedrägeri, frågar hur angriparen fick lösenordet. När ni förklarar byråns dator och ert beslut att fortsätta som förut blir det tyst länge. Hur motiverar ni valet för den som betalade mest offentligt för det?"])
            ]
          })
        ])
      }),

      pg("c7", ["The apology", "Ursäkten"], [
        "The account is yours again and the attacker is out. Followers, journalists and the scam's victims are all waiting for the first post.\n\nIt will be screenshotted, quoted and judged. Whatever you write, people will read it as a sign of how seriously you take what happened.",
        "Kontot är ert igen och angriparen är ute. Följare, journalister och bedrägeriets offer väntar alla på det första inlägget.\n\nDet kommer att skärmdumpas, citeras och bedömas. Vad ni än skriver kommer folk att läsa det som ett tecken på hur allvarligt ni tar det som hänt."
      ], {
        choice: ask(["What is the first post?", "Vad blir det första inlägget?"], ["Plain words: what happened, what you did, what victims can do.", "Enkla ord: vad som hände, vad ni gjorde, vad de drabbade kan göra."], [
          opt(["A plain apology, what happened, and how to report losses", "En enkel ursäkt, vad som hände och hur man anmäler förluster"], "l4", ["Boring and right.", "Tråkigt och rätt."], {
            pushback: [
              pb(["How much do you say?", "Hur mycket säger ni?"], ["“What happened” means saying how the attacker got in. Legal wants it vague; security wants it honest, because vague apologies invite follow-up questions. How much of the uncomfortable truth goes in the first post?", "”Vad som hände” innebär att säga hur angriparen tog sig in. Juristen vill vara vag; säkerhet vill vara ärlig, eftersom vaga ursäkter lockar fram följdfrågor. Hur mycket av den obekväma sanningen hamnar i det första inlägget?"]),
              pb(["“Report losses” to whom?", "”Anmäl förluster” till vem?"], ["Telling victims how to report losses implies you know where they should go and what happens next. Customer service asks what they should answer when people call and ask if reporting will get their money back. What is the honest answer?", "Att berätta för de drabbade hur de anmäler förluster förutsätter att ni vet vart de ska vända sig och vad som händer sedan. Kundtjänst frågar vad de ska svara när folk ringer och undrar om en anmälan ger dem pengarna tillbaka. Vad är det ärliga svaret?"]),
              pb(["Apology means admission", "En ursäkt är ett erkännande"], ["Legal warns that the word “sorry” on the account that ran the scam will be read by victims' lawyers as admitting fault. They suggest “we regret” instead. Does a softened apology still do the job, or does it look exactly like what it is?", "Juristen varnar för att ordet ”förlåt” på kontot som körde bedrägeriet kommer att läsas av offrens jurister som ett erkännande av skuld. Hen föreslår ”vi beklagar” i stället. Gör en uttunnad ursäkt fortfarande jobbet, eller ser den ut precis som vad den är?"])
            ]
          }),
          opt(["A humorous post to move on", "Ett humoristiskt inlägg för att gå vidare"], "l4", ["People who lost money will not laugh.", "De som förlorat pengar kommer inte att skratta."], {
            pushback: [
              pb(["The victim replies", "Ett offer svarar"], ["The first reply under your joke is from someone who sent their savings to the scam wallet: “Glad you find it funny.” It gets more likes than your post. Do you delete the joke, answer the reply, or leave both up?", "Det första svaret under ert skämt kommer från någon som skickade sina sparpengar till bluffplånboken: ”Kul att ni tycker det är roligt.” Det får fler gillamarkeringar än ert inlägg. Raderar ni skämtet, svarar ni, eller låter ni båda ligga kvar?"]),
              pb(["The CEO was not consulted", "Vd tillfrågades inte"], ["The CEO, whose face was used in the fake video, sees the joke at the same time as the public and is not amused. They want to know who approved making light of it. Who did, and do you defend the tone?", "Vd, vars ansikte användes i den falska videon, ser skämtet samtidigt som allmänheten och är inte road. Vd vill veta vem som godkände att det skämtades om saken. Vem gjorde det, och försvarar ni tonen?"]),
              pb(["Moving on from what?", "Gå vidare från vad?"], ["Journalists note that the post jokes about the hijack but says nothing about the victims, the fake video or what you have fixed. “Moving on” reads as “nothing to see here”. Is that the message you meant to send?", "Journalister noterar att inlägget skämtar om kapningen men inte säger något om de drabbade, den falska videon eller vad ni har åtgärdat. ”Gå vidare” läses som ”här finns inget att se”. Är det budskapet ni ville skicka?"])
            ]
          }),
          opt(["Delete the scam posts quietly and say nothing", "Ta bort bluffinläggen i tysthet och säg ingenting"], "l4", ["Screenshots last forever.", "Skärmdumpar finns för alltid."], {
            pushback: [
              pb(["The evidence is gone", "Bevisen är borta"], ["A victim's lawyer asks for the original posts and the fake video for a police report. You deleted them quietly and did not save copies. Are you now the reason a victim cannot prove what happened?", "En jurist som företräder ett offer ber om originalinläggen och den falska videon till en polisanmälan. Ni raderade dem i tysthet utan att spara kopior. Är det nu ni som gör att ett offer inte kan bevisa vad som hände?"]),
              pb(["“They're hiding it”", "”De döljer det”"], ["Followers notice the posts have vanished and start asking whether the brand is pretending nothing happened. Screenshots of the giveaway are being reposted with the caption “they deleted it”. Is silence still safer than saying something?", "Följare märker att inläggen har försvunnit och börjar fråga om varumärket låtsas att ingenting har hänt. Skärmdumpar av giveawayen läggs upp igen med texten ”de raderade det”. Är tystnad fortfarande tryggare än att säga något?"]),
              pb(["The next post", "Nästa inlägg"], ["Marketing has a product post scheduled for Monday. It will be the first thing you say since the scam, and it will say nothing about it. Do you let it go out, and what will people read into it?", "Marknad har ett produktinlägg schemalagt till måndag. Det blir det första ni säger sedan bedrägeriet, och det säger ingenting om det. Låter ni det gå ut, och vad kommer folk att läsa in i det?"])
            ]
          })
        ])
      }),

      pg("l4", ["The other accounts", "De andra kontona"], [
        "During the review, someone checks the password manager history. The same password was used on two other brand accounts and on the video channel.\n\nNone of them shows signs of misuse yet. But the attacker had the password, and they have already shown that they are patient.",
        "Under genomgången kontrollerar någon historiken i lösenordshanteraren. Samma lösenord användes på två andra varumärkeskonton och på videokanalen.\n\nInget av dem visar tecken på missbruk ännu. Men angriparen hade lösenordet, och de har redan visat att de är tålmodiga."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What about the other accounts?", "Vad gör ni med de andra kontona?"], ["Secures every account that shares the weakness, today.", "Säkrar varje konto med samma svaghet, i dag."], [
          opt(["Secure all of them now", "Säkra alla nu"], "c8", ["An evening's work that closes the next incident.", "En kvälls arbete som stänger nästa incident."], {
            pushback: [
              pb(["One account nobody can open", "Ett konto ingen kan öppna"], ["One of the brand accounts was set up years ago by someone who has left, and nobody can log in to it to secure it. Starting a recovery means proving ownership all over again. Do you start another weekend of recovery work, or accept one account you cannot protect?", "Ett av varumärkeskontona skapades för flera år sedan av någon som har slutat, och ingen kan logga in för att säkra det. En återställning innebär att bevisa ägarskapet från början igen. Drar ni igång ännu en helg av återställningsarbete, eller accepterar ni ett konto ni inte kan skydda?"]),
              pb(["The team is exhausted", "Teamet är slutkört"], ["The people who would do this have been working since Friday evening. One of them makes a mistake on the first account and nearly locks it out. Is “now” worth the risk of tired people making errors, and who decides when they stop?", "De som skulle göra det här har arbetat sedan fredag kväll. En av dem gör ett misstag på första kontot och låser det nästan. Är ”nu” värt risken att trötta människor gör fel, och vem bestämmer när de ska sluta?"]),
              pb(["The video channel's partner", "Videokanalens partner"], ["The video channel is run together with an outside production company, which has its own logins and does not answer on weekends. You can change your password, but not theirs. Is the channel secured if you only lock half the doors?", "Videokanalen drivs tillsammans med ett externt produktionsbolag som har egna inloggningar och inte svarar på helger. Ni kan byta ert lösenord, men inte deras. Är kanalen säkrad om ni bara låser halva dörrarna?"])
            ]
          }),
          opt(["Check them next week", "Kontrollera dem nästa vecka"], "c8", ["The attacker has the same password.", "Angriparen har samma lösenord."], {
            pushback: [
              pb(["A login from abroad", "En inloggning från utlandet"], ["An hour after you decide to wait, the video channel sends an automatic notice: a sign-in attempt from an unfamiliar country. It failed, this time. Is next week still soon enough?", "En timme efter att ni beslutat att vänta skickar videokanalen ett automatiskt meddelande: ett inloggningsförsök från ett okänt land. Det misslyckades, den här gången. Är nästa vecka fortfarande tillräckligt snart?"]),
              pb(["Security puts it in writing", "Säkerhet skriver ned det"], ["The security lead sends an email to the whole incident group: a known password for three live brand accounts is in an attacker's hands, and the decision to wait is yours. If one of them is hijacked this weekend, whose name is on that decision?", "Säkerhetsansvarig mejlar hela incidentgruppen: ett känt lösenord till tre aktiva varumärkeskonton finns hos en angripare, och beslutet att vänta är ert. Om ett av dem kapas i helgen, vems namn står på beslutet?"]),
              pb(["The customer chat account", "Kundchattens konto"], ["One of the two other accounts is where your customer-service chat runs, used by thousands of customers every week. If it is taken over, the scam reaches them directly in private messages, from a name they already trust. Is next week a risk you could explain to those customers afterwards?", "Ett av de två andra kontona är där er kundtjänstchatt finns, som tusentals kunder använder varje vecka. Om det tas över når bedrägeriet dem direkt i privata meddelanden, från ett namn de redan litar på. Är nästa vecka en risk ni skulle kunna förklara för de kunderna i efterhand?"])
            ]
          })
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
          opt(["Phishing-resistant sign-in for everyone with publishing rights", "Nätfiskeresistent inloggning för alla med publiceringsrätt"], "c9", ["Solves the class of problem.", "Löser hela problemtypen."], {
            pushback: [
              pb(["Not every tool supports it", "Alla verktyg stödjer det inte"], ["IT checks: two of the tools your team publishes through only support passwords and text-message codes. Requiring phishing-resistant sign-in for everyone means dropping those tools or living with an exception. Which do you choose, and who owns the exception?", "IT kontrollerar: två av verktygen som teamet publicerar genom stödjer bara lösenord och sms-koder. Att kräva nätfiskeresistent inloggning för alla innebär att slopa verktygen eller leva med ett undantag. Vad väljer ni, och vem äger undantaget?"]),
              pb(["Freelancers and agencies", "Frilansare och byråer"], ["Publishing rights include freelancers, an agency and two influencers who post on your behalf during campaigns. They are not your employees, and you cannot hand them keys and require their use. Does “everyone” really mean everyone, or just the people who are easy to reach?", "Publiceringsrätten omfattar frilansare, en byrå och två influerare som publicerar åt er under kampanjer. De är inte anställda, och ni kan inte bara dela ut nycklar och kräva att de används. Betyder ”alla” verkligen alla, eller bara de som är lätta att nå?"]),
              pb(["The key is at home", "Nyckeln ligger hemma"], ["The first time a crisis post is needed outside office hours, the person on call has left their key at the office. Nobody can publish for two hours. How do you make strong sign-in work at night without creating a back door?", "Första gången ett krisinlägg behövs utanför kontorstid har den som har jour lämnat sin nyckel på kontoret. Ingen kan publicera på två timmar. Hur får ni stark inloggning att fungera nattetid utan att skapa en bakdörr?"])
            ]
          }),
          opt(["An awareness email", "Ett informationsmejl"], "c9", ["Read once, forgotten by Friday.", "Läses en gång, glöms till fredag."], {
            pushback: [
              pb(["Someone clicks anyway", "Någon klickar ändå"], ["The day after your email, a new member of the team, hired after the incident, clicks a similar link and types the password. They say they never received the email. Was the awareness email ever going to protect this person?", "Dagen efter ert mejl klickar en ny medarbetare, anställd efter incidenten, på en liknande länk och skriver in lösenordet. Hen säger att hen aldrig fick mejlet. Skulle informationsmejlet någonsin ha skyddat den här personen?"]),
              pb(["Security calls it theatre", "Säkerhet kallar det teater"], ["The security lead says an email is what organisations send when they want to look as though they acted. They have a proposal for hardware keys ready and ask why it was not chosen. What is your answer, given what this account has already cost?", "Säkerhetsansvarig säger att ett mejl är vad organisationer skickar när de vill se ut som att de har agerat. Hen har ett förslag om hårdvarunycklar klart och frågar varför det inte valdes. Vad svarar ni, med tanke på vad kontot redan har kostat?"]),
              pb(["The lure looks perfect", "Lockbetet ser perfekt ut"], ["Someone puts the fake notice next to a real one from the platform. Nobody in the room can tell them apart without checking the link address carefully. If the experts can't spot it, what exactly is the email asking staff to do?", "Någon lägger det falska meddelandet bredvid ett äkta från plattformen. Ingen i rummet kan skilja dem åt utan att noga granska länkadressen. Om experterna inte ser skillnad, vad exakt ber mejlet personalen göra?"])
            ]
          })
        ])
      }),

      pg("c9", ["The numbers", "Siffrorna"], [
        "Marketing presents the damage: eight percent of followers have left, and engagement on every post is down.\n\nThey want a campaign to win the followers back, and they have a draft ready. Others in the room wonder whether follower numbers are the right thing to measure after a breach of trust.",
        "Marknadsavdelningen redovisar skadan: åtta procent av följarna har lämnat och engagemanget på varje inlägg har minskat.\n\nDe vill ha en kampanj för att vinna tillbaka följarna, och de har ett utkast klart. Andra i rummet undrar om antalet följare är rätt sak att mäta efter ett förtroendebrott."
      ], {
        choice: ask(["What do you measure?", "Vad mäter ni?"], ["Measures trust and victims helped, not follower counts.", "Mäter förtroende och hjälpta drabbade, inte antal följare."], [
          opt(["Ask customers whether they trust the account", "Fråga kunderna om de litar på kontot"], "c10", ["The number that matters.", "Siffran som spelar roll."], {
            pushback: [
              pb(["The answer is no", "Svaret är nej"], ["The first survey results come in: most customers say they no longer trust messages from the account, and many say they will ignore it. You now have a number that is worse than the follower count. What do you do with it?", "De första svaren från enkäten kommer in: de flesta kunder säger att de inte längre litar på meddelanden från kontot, och många säger att de kommer att strunta i det. Nu har ni en siffra som är sämre än antalet följare. Vad gör ni med den?"]),
              pb(["A survey link?", "En enkätlänk?"], ["Comms points out that you are about to ask burned customers to click a link in a message from your brand, weeks after a scam did exactly that. Several people reply asking whether the survey is another fraud. How do you ask without looking like the attacker?", "Kommunikation påpekar att ni är på väg att be brända kunder klicka på en länk i ett meddelande från ert varumärke, några veckor efter att ett bedrägeri gjorde exakt det. Flera svarar och frågar om enkäten är ännu ett bedrägeri. Hur frågar ni utan att se ut som angriparen?"]),
              pb(["Marketing needs targets", "Marknad behöver mål"], ["The marketing lead objects: their bonus and their quarterly plan are measured on followers and engagement, not on trust surveys. Changing the metric without changing those targets means nobody acts on it. Are you prepared to change how marketing is measured?", "Marknadschefen invänder: bonusen och kvartalsplanen mäts på följare och engagemang, inte på förtroendeenkäter. Att byta mått utan att ändra målen innebär att ingen agerar på det. Är ni beredda att ändra hur marknad mäts?"])
            ]
          }),
          opt(["Run a giveaway to win followers back", "Kör en giveaway för att vinna tillbaka följare"], "c10", ["A giveaway. Really?", "En giveaway. Verkligen?"], {
            pushback: [
              pb(["Reported as a scam", "Anmält som bedrägeri"], ["Within an hour of the launch, followers report your giveaway to the platform as a scam, and it is hidden pending review. The people you wanted back are the ones flagging it. Do you pull it, or try to explain that this one is real?", "Inom en timme efter starten anmäler följare er giveaway till plattformen som bedrägeri, och den döljs i väntan på granskning. De ni ville vinna tillbaka är de som flaggar den. Drar ni tillbaka den, eller försöker ni förklara att den här är äkta?"]),
              pb(["The victims see it", "De drabbade ser den"], ["A victim who lost money posts: “So now you give things away. Where was this when we were robbed in your name?” It becomes the top reply. Can you defend spending on prizes for new followers while refusing the people who already lost money?", "Ett offer som förlorade pengar skriver: ”Så nu delar ni ut saker. Var var det här när vi blev bestulna i ert namn?” Det blir det översta svaret. Kan ni försvara att lägga pengar på priser för nya följare medan ni säger nej till dem som redan har förlorat pengar?"]),
              pb(["Copycats are ready", "Efterapare står redo"], ["Security warns that any giveaway from your brand will be copied by fake accounts within hours, with a wallet or a phishing link added. You would be teaching followers to trust exactly the kind of post that hurt them. Is the follower count worth that?", "Säkerhet varnar för att varje giveaway från ert varumärke kommer att kopieras av falska konton inom några timmar, med en plånbok eller nätfiskelänk tillagd. Ni skulle lära följarna att lita på precis den sortens inlägg som skadade dem. Är antalet följare värt det?"])
            ]
          })
        ])
      }),

      pg("c10", ["Who owns it?", "Vem äger det?"], [
        "The last item in the review. Over the weekend it became clear that nobody really owned the brand's social accounts: communications posted, the agencies managed, IT knew nothing and security had never been asked.\n\nSomeone has to own them, in writing, from Monday.",
        "Den sista punkten i genomgången. Under helgen blev det tydligt att ingen egentligen ägde varumärkets sociala konton: kommunikation publicerade, byråerna förvaltade, IT visste ingenting och säkerhet hade aldrig blivit tillfrågad.\n\nNågon måste äga dem, skriftligt, från måndag."
      ], {
        choice: ask(["Who owns the accounts?", "Vem äger kontona?"], ["Gives the accounts an internal owner with security controls, like any critical system.", "Ger kontona en intern ägare med säkerhetskontroller, som vilket kritiskt system som helst."], [
          opt(["Communications owns them, with security's controls, written down", "Kommunikation äger dem, med säkerhetsfunktionens kontroller, nedskrivet"], "r-end", ["Clear and accountable.", "Tydligt och med ansvar."], {
            pushback: [
              pb(["Comms has no budget", "Kommunikation har ingen budget"], ["The head of communications agrees to own the accounts, then asks for the budget and headcount to do it: keys, reviews, on-call cover, access audits. None of that exists in their plan. Is ownership without resources ownership at all?", "Kommunikationschefen går med på att äga kontona, men ber sedan om budget och personal för det: nycklar, granskningar, jour, åtkomstkontroller. Inget av det finns i planen. Är ägarskap utan resurser ens ägarskap?"]),
              pb(["Who says no?", "Vem säger nej?"], ["Comms owns the accounts but security sets the controls. When marketing wants an influencer to have posting rights for a campaign next week, comms says yes and security says no. Who wins, and is that written down too?", "Kommunikation äger kontona men säkerhet sätter kontrollerna. När marknad vill ge en influerare publiceringsrätt för en kampanj nästa vecka säger kommunikation ja och säkerhet nej. Vem vinner, och står det också nedskrivet?"]),
              pb(["The agency contract", "Byråavtalet"], ["The current agency's contract says they manage your social channels, with access as they see fit. Your new ownership rules conflict with it on almost every point. Do you renegotiate, end the contract, or let the paper and the reality disagree?", "Den nuvarande byråns avtal säger att de förvaltar era sociala kanaler, med den åtkomst de anser lämplig. Era nya ägarregler krockar med det på nästan varje punkt. Omförhandlar ni, säger ni upp avtalet, eller låter ni papperet och verkligheten säga olika saker?"])
            ]
          }),
          opt(["The agency, as before", "Byrån, som tidigare"], "r-end", ["Ownership outsourced, risk kept.", "Ägarskapet utlagt, risken kvar."], {
            pushback: [
              pb(["The fine lands on you", "Böterna landar hos er"], ["The DPO reminds you that if customer messages leak again, the authority will ask who controlled the account, and the answer will be you, not the agency. You keep the risk but give away the control. Does that make sense to anyone in the room?", "Dataskyddsombudet påminner om att om kundmeddelanden läcker igen kommer myndigheten att fråga vem som kontrollerade kontot, och svaret blir ni, inte byrån. Ni behåller risken men lämnar bort kontrollen. Är det rimligt för någon i rummet?"]),
              pb(["“As before” failed", "”Som tidigare” misslyckades"], ["This weekend happened under exactly this arrangement. The review lists shared logins, unknown phone numbers and nobody who could act on Friday night. What, specifically, is different now that would justify trusting it again?", "Den här helgen inträffade med exakt det här upplägget. Genomgången listar delade inloggningar, okända telefonnummer och ingen som kunde agera en fredagskväll. Vad, konkret, är annorlunda nu som skulle motivera att lita på det igen?"]),
              pb(["The agency says no", "Byrån säger nej"], ["The agency responds that they are happy to manage the accounts, but will not accept liability for security incidents and want that written into the contract. So nobody is accountable. Do you sign that?", "Byrån svarar att de gärna förvaltar kontona men inte tänker ta ansvar för säkerhetsincidenter, och vill ha det inskrivet i avtalet. Då är ingen ansvarig. Skriver ni under på det?"])
            ]
          })
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
          opt(["Apologise to the platform and cooperate", "Be plattformen om ursäkt och samarbeta"], "x2", ["Humbling and necessary.", "Förödmjukande och nödvändigt."], {
            pushback: [
              pb(["The CEO won't back down", "Vd vill inte backa"], ["The CEO approved the threat and does not want to be seen retreating a day later. “We were right, they were slow.” Comms says an apology will be read as weakness, and the CEO agrees. Who tells the CEO that cooperating is the only way back?", "Vd godkände hotet och vill inte synas backa ett dygn senare. ”Vi hade rätt, de var långsamma.” Kommunikation säger att en ursäkt kommer att läsas som svaghet, och vd håller med. Vem säger till vd att samarbete är enda vägen tillbaka?"]),
              pb(["Public or private?", "Offentligt eller privat?"], ["The threat was public, so a private apology to the platform changes nothing for the journalists who covered it. A public apology hands the story a second headline. Which do you choose, and what does each cost?", "Hotet var offentligt, så en privat ursäkt till plattformen ändrar ingenting för journalisterna som skrev om det. En offentlig ursäkt ger historien en andra rubrik. Vilken väljer ni, och vad kostar var och en?"]),
              pb(["Still no date", "Fortfarande inget datum"], ["The platform thanks you for the apology and says the ownership review will take “as long as it takes”. Nothing has changed except that you have backed down. How long do you wait before deciding that cooperating is not working either?", "Plattformen tackar för ursäkten och säger att granskningen av ägarskapet tar ”den tid den tar”. Ingenting har förändrats utom att ni har backat. Hur länge väntar ni innan ni avgör att samarbete inte heller fungerar?"])
            ]
          }),
          opt(["Escalate the legal threat", "Trappa upp det rättsliga hotet"], "x2", ["The freeze gets longer.", "Frysningen blir längre."], {
            pushback: [
              pb(["The lawyers want a budget", "Advokaterna vill ha en budget"], ["The outside law firm estimates that a case against a global platform would take years and cost far more than the account is worth. They need a decision on a retainer by Monday. Are you really going to sue, or just say you will?", "Den externa advokatbyrån bedömer att en process mot en global plattform skulle ta flera år och kosta långt mer än kontot är värt. De behöver ett beslut om förskott till måndag. Tänker ni verkligen stämma, eller bara säga att ni ska göra det?"]),
              pb(["All channels go quiet", "Alla kanaler tystnar"], ["The platform's response is formal: all communication with you now goes through their legal department. Your advertising contact stops answering, and the ownership review is paused. Who is now harmed most by the escalation?", "Plattformens svar är formellt: all kommunikation med er går nu via deras juridiska avdelning. Er annonskontakt slutar svara och granskningen av ägarskapet pausas. Vem skadas nu mest av upptrappningen?"]),
              pb(["The victims are forgotten", "De drabbade glöms bort"], ["The news coverage is now about your fight with the platform, not about the people who lost money. A victim posts: “They care more about their account than about us.” Is that the story you want to be in?", "Nyhetsbevakningen handlar nu om ert bråk med plattformen, inte om dem som förlorade pengar. Ett offer skriver: ”De bryr sig mer om sitt konto än om oss.” Är det den historien ni vill vara med i?"])
            ]
          })
        ])
      }),
      pg("x2", ["Copycats", "Efterapare"], [
        "With your real account frozen and silent, a dozen look-alike accounts appear over the weekend. Each uses your logo and runs its own version of the giveaway.\n\nTo your followers, there is no way to tell which account is real, because the real one says nothing.",
        "Med ert riktiga konto fryst och tyst dyker ett dussin efterliknade konton upp under helgen. Alla använder er logotyp och kör sin egen variant av utdelningen.\n\nFör era följare finns inget sätt att avgöra vilket konto som är äkta, eftersom det äkta inte säger något."
      ], {
        choice: ask(["How do you fight the copies?", "Hur bekämpar ni kopiorna?"], ["Reports them systematically and points people to a verified source.", "Anmäler dem systematiskt och hänvisar folk till en verifierad källa."], [
          opt(["Report each one and warn on the website", "Anmäl vart och ett och varna på webbplatsen"], "x3", ["Slow work that helps.", "Långsamt arbete som hjälper."], {
            pushback: [
              pb(["Reports from a frozen account", "Anmälningar från ett fryst konto"], ["The platform's impersonation form asks you to report from the genuine account. Yours is frozen. Each report goes into the general queue, and three new copies appear for every one that is taken down. How long can two people keep this up?", "Plattformens formulär för identitetsintrång vill att ni anmäler från det äkta kontot. Ert är fryst. Varje anmälan hamnar i den allmänna kön, och för varje kopia som tas bort dyker tre nya upp. Hur länge orkar två personer hålla på?"]),
              pb(["The website warning backfires", "Varningen på webbplatsen slår bakut"], ["To warn people, your website lists the fake account names. Within hours, those names are being searched far more than before, and some people find the copies through your own list. Do you keep naming them, or stop?", "För att varna listar er webbplats namnen på de falska kontona. Inom några timmar söks namnen betydligt mer än förut, och en del hittar kopiorna via er egen lista. Fortsätter ni namnge dem, eller slutar ni?"]),
              pb(["Who picks the work?", "Vem ska göra jobbet?"], ["The weekend team was meant to be planning the launch. Reporting copycats one by one takes every free hand. Marketing asks which matters more this week. What is your answer?", "Helgteamet skulle egentligen planera lanseringen. Att anmäla efterapare ett och ett tar varenda ledig hand. Marknad frågar vad som är viktigast den här veckan. Vad svarar ni?"])
            ]
          }),
          opt(["Ignore them until the account is back", "Ignorera dem tills kontot är tillbaka"], "x3", ["They multiply.", "De förökar sig."], {
            pushback: [
              pb(["A copy answers customers", "En kopia svarar kunder"], ["One of the copies has started answering customers' complaints, offering “refunds” if they send a small fee first. Customers think it is you. How many more need to pay before ignoring stops being an option?", "En av kopiorna har börjat svara på kunders klagomål och erbjuder ”återbetalning” om de först skickar en liten avgift. Kunderna tror att det är ni. Hur många fler måste betala innan det inte längre går att ignorera?"]),
              pb(["No end date", "Inget slutdatum"], ["The platform has not said when the review will finish. “Until the account is back” could mean days or weeks. Is ignoring the copies a plan, or a hope?", "Plattformen har inte sagt när granskningen blir klar. ”Tills kontot är tillbaka” kan betyda dagar eller veckor. Är det en plan att ignorera kopiorna, eller en förhoppning?"]),
              pb(["Customer service asks", "Kundtjänst frågar"], ["Customer service gets calls from people who are confused by a dozen look-alike accounts. They have no list of which are fake and no instructions. What are they supposed to tell callers this weekend?", "Kundtjänst får samtal från folk som är förvirrade av ett dussin kopierade konton. De har ingen lista över vilka som är falska och inga instruktioner. Vad ska de säga till dem som ringer i helgen?"])
            ]
          })
        ])
      }),
      pg("x3", ["Victims organise", "De drabbade organiserar sig"], [
        "Victims of the scam find each other online and form a group. They contact a consumer organisation and a newspaper together.\n\nTheir message is short and spreads fast: the brand did nothing while we were robbed in its name.",
        "Offren för bedrägeriet hittar varandra på nätet och bildar en grupp. Tillsammans kontaktar de en konsumentorganisation och en tidning.\n\nDeras budskap är kort och sprids snabbt: varumärket gjorde ingenting medan vi blev bestulna i dess namn."
      ], {
        choice: ask(["How do you respond to the group?", "Hur bemöter ni gruppen?"], ["Engages directly and offers practical help.", "Tar direkt kontakt och erbjuder praktisk hjälp."], [
          opt(["Meet them and offer help with police reports", "Träffa dem och erbjud hjälp med polisanmälningar"], "x4", ["Late but sincere.", "Sent men uppriktigt."], {
            pushback: [
              pb(["They bring a reporter", "De tar med en reporter"], ["The group agrees to meet, but says a newspaper reporter will be in the room. Everything you say will be in print. Do you still go, change the format, or cancel and look as if you are hiding?", "Gruppen går med på ett möte, men säger att en tidningsreporter kommer att vara med. Allt ni säger hamnar i tryck. Går ni ändå, ändrar ni formen, eller ställer ni in och ser ut att gömma er?"]),
              pb(["Help isn't what they want", "Hjälp är inte vad de vill ha"], ["At the meeting, the group's spokesperson says police reports are not why they came: they want their money back, and they want to hear you admit fault. Legal sits beside you, silent. What do you say?", "Vid mötet säger gruppens talesperson att de inte kom för polisanmälningar: de vill ha pengarna tillbaka och höra er erkänna skuld. Juristen sitter tyst bredvid er. Vad säger ni?"]),
              pb(["Who goes?", "Vem går dit?"], ["The group wants the CEO, whose face was in the fake video. The CEO's adviser says that puts the CEO next to the scam in every photo from the meeting. Who do you send, and will the group accept anyone else?", "Gruppen vill träffa vd, vars ansikte fanns i den falska videon. Vd:s rådgivare säger att det placerar vd bredvid bedrägeriet på varje bild från mötet. Vem skickar ni, och godtar gruppen någon annan?"])
            ]
          }),
          opt(["Let legal answer", "Låt juristerna svara"], "x4", ["Confirms their message.", "Bekräftar deras budskap."], {
            pushback: [
              pb(["The letter is published", "Brevet publiceras"], ["Legal's careful letter is posted by the group in full, under the headline “This is how they answer victims”. Every cautious phrase reads as cold. Do you stand by the letter, or follow it with something human?", "Juristernas försiktiga brev publiceras i sin helhet av gruppen, under rubriken ”Så här svarar de offren”. Varje försiktig formulering läses som kall. Står ni för brevet, eller följer ni upp med något mänskligt?"]),
              pb(["The consumer organisation", "Konsumentorganisationen"], ["The consumer organisation the group contacted asks to meet your management, not your lawyers. They say a legal reply suggests you are preparing for a dispute rather than trying to help. Who do you send?", "Konsumentorganisationen som gruppen kontaktade vill träffa er ledning, inte era jurister. De säger att ett juridiskt svar tyder på att ni förbereder en tvist snarare än försöker hjälpa. Vem skickar ni?"]),
              pb(["Staff are embarrassed", "Personalen skäms"], ["Employees share the group's posts internally, and several say they are ashamed of how the company is treating customers. One asks in the all-staff chat whether anyone in management has spoken to a single victim. Has anyone?", "Anställda delar gruppens inlägg internt, och flera säger att de skäms över hur företaget behandlar kunderna. En frågar i personalchatten om någon i ledningen har pratat med ett enda offer. Har någon det?"])
            ]
          })
        ])
      }),
      pg("x4", ["Launch week", "Lanseringsveckan"], [
        "Your biggest product launch of the year is planned for next week. The campaign, the influencers and the press events are all built around the main social channel.\n\nThe channel is still frozen, and the platform will not say when the review will finish.",
        "Årets största produktlansering är planerad till nästa vecka. Kampanjen, influerarna och pressaktiviteterna är alla uppbyggda kring den stora sociala kanalen.\n\nKanalen är fortfarande fryst, och plattformen säger inte när granskningen blir klar."
      ], {
        choice: ask(["What happens to the launch?", "Vad händer med lanseringen?"], ["Postpones rather than launching into the scandal.", "Skjuter upp i stället för att lansera mitt i skandalen."], [
          opt(["Postpone the launch", "Skjut upp lanseringen"], "e5", ["Costly and sensible.", "Dyrt och förnuftigt."], {
            pushback: [
              pb(["Contracts already signed", "Avtal redan påskrivna"], ["The influencers and event venues are booked and paid, and most contracts have no cancellation clause. Finance says postponing means paying twice. Is the delay still sensible when you see the bill?", "Influerarna och lokalerna för pressaktiviteterna är bokade och betalda, och de flesta avtal saknar avbokningsklausul. Ekonomi säger att ett uppskov innebär att betala två gånger. Är förseningen fortfarande förnuftig när ni ser notan?"]),
              pb(["Partners are waiting", "Partnerna väntar"], ["Your sales partners have prepared stock and planned promotions for launch day. They were not consulted and say a delay will cost them too. Do you hold the date for them, or let them carry part of your crisis?", "Era säljpartner har förberett lager och planerat kampanjer till lanseringsdagen. De tillfrågades inte och säger att ett uppskov kostar även dem. Håller ni datumet för deras skull, eller låter ni dem bära en del av er kris?"]),
              pb(["Postponed until when?", "Uppskjutet till när?"], ["The platform still gives no date for the review. You can postpone, but you cannot say to when. A launch with no date looks like a cancelled launch. What do you tell the market?", "Plattformen ger fortfarande inget datum för granskningen. Ni kan skjuta upp, men inte säga till när. En lansering utan datum ser ut som en inställd lansering. Vad säger ni till marknaden?"])
            ]
          }),
          opt(["Launch on other channels", "Lansera i andra kanaler"], "e5", ["The launch becomes part of the story.", "Lanseringen blir en del av historien."], {
            pushback: [
              pb(["Every comment is the scam", "Varje kommentar handlar om bedrägeriet"], ["The launch posts on your other channels fill with comments about the scam, the victims and the frozen account. The product is barely mentioned. Do you moderate the comments, turn them off, or let them stand next to your launch?", "Lanseringsinläggen i era andra kanaler fylls av kommentarer om bedrägeriet, de drabbade och det frysta kontot. Produkten nämns knappt. Modererar ni kommentarerna, stänger ni av dem, eller låter ni dem stå bredvid lanseringen?"]),
              pb(["The copycats launch too", "Efterapare lanserar också"], ["Within an hour, look-alike accounts post your launch images with fake pre-order links. Customers cannot check against the main account because it is frozen. Are you launching a product, or a new scam?", "Inom en timme publicerar kopierade konton era lanseringsbilder med falska förbeställningslänkar. Kunderna kan inte kontrollera mot huvudkontot, eftersom det är fryst. Lanserar ni en produkt, eller ett nytt bedrägeri?"]),
              pb(["Influencers pull out", "Influerare hoppar av"], ["Two of the influencers say they do not want their names next to a brand currently in the news for a scam. Their followers have already asked. Do you hold them to the contract, or let the launch shrink further?", "Två av influerarna säger att de inte vill ha sina namn bredvid ett varumärke som just nu syns i nyheterna för ett bedrägeri. Deras följare har redan frågat. Håller ni dem till avtalet, eller låter ni lanseringen krympa ytterligare?"])
            ]
          })
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
