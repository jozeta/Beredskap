/*
 * s30-npm-package.js — "The Trusted Package" (archetype D, compromised dependency).
 *
 * The package registry warns that a popular formatting library shipped
 * malicious versions after its maintainer was phished → your dependency bot
 * merged it overnight: the install script stole CI and laptop tokens and the
 * customer portal shipped code that swaps bank details → two customers paid
 * the wrong account → your stolen publish token was used to release a
 * poisoned version of your own SDK: you are now someone else's supplier
 * incident → product security reporting → a dependency tree nobody governs.
 * Fictional package names throughout.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s30-npm-package",
    version: 1,
    category: "dependency-compromise",
    archetype: "third-party-origin",
    emblem: "npm-package",
    title: L(["The Trusted Package", "Det betrodda paketet"]),
    summary: L([
      "A tiny formatting library used by half the internet has been poisoned. You do not remember ever choosing it. By the end of the day, other companies are asking whether you poisoned them.",
      "Ett litet formateringsbibliotek som halva internet använder har förgiftats. Ni minns inte att ni någonsin valde det. Innan dagen är slut frågar andra företag om ni har förgiftat dem."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Find out fast whether a compromised dependency reached your builds", "Snabbt ta reda på om ett komprometterat beroende nått era byggen"]), teaser: L(["What you are made of", "Vad ni är gjorda av"]) },
      { id: "lo2", text: L(["Treat build machines and developer laptops as compromised hosts", "Behandla byggmaskiner och utvecklardatorer som komprometterade"]), teaser: L(["The workshop, not only the product", "Verkstaden, inte bara produkten"]) },
      { id: "lo3", text: L(["Act as a responsible supplier when your own product is affected", "Agera som en ansvarsfull leverantör när er egen produkt är drabbad"]), teaser: L(["When you are the third party", "När ni är tredje part"]) },
      { id: "lo4", text: L(["Govern which code enters your software automatically", "Styra vilken kod som automatiskt kommer in i er programvara"]), teaser: L(["Who decides what comes in", "Vem som bestämmer vad som kommer in"]) }
    ],
    mitre: ["T1195.001", "T1059.007", "T1552", "T1528", "T1659", "T1565"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.PS", "DE.CM", "RS.MA", "RS.CO", "RS.MI"],
      iso27001: ["A.5.19", "A.5.21", "A.5.22", "A.5.24", "A.5.26", "A.8.8", "A.8.25", "A.8.28", "A.8.30", "A.8.32"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours", startTime: "08:30" },
    actor: { types: ["criminal"], motivation: L(["Financial: payment diversion and stolen tokens for further attacks", "Ekonomisk: omdirigerade betalningar och stulna token för fler angrepp"]), capability: "high" },
    variables: {
      laptops: { min: 4, max: 60, scaleBy: "size" },
      sdkDownloads: { min: 300, max: 40000, scaleBy: "size", step: 10 },
      diverted: { min: 4000, max: 90000, scaleBy: "size", step: 500, currency: true },
      deps: { min: 600, max: 3200, step: 10 }
    },
    roles: ["incidentCommander", "devLead", "ciso", "socLead", "itOps", "cloudLead", "serviceOwner", "comms", "legal", "dpo", "ceo"],

    groundTruth: {
      rootCause: L([
        "The maintainer of “tinyfmt”, a small formatting library with millions of weekly downloads, was phished through a fake registry security notice. The attacker published three versions with an install script that stole environment variables and tokens, and browser code that replaced bank details on payment pages. {{org.name}}'s dependency bot updated the lockfile overnight and auto-merged it. The portal build deployed at 07:00 carried the browser code; CI runners and {{num.laptops}} developer laptops ran the install script. The stolen registry token from CI was then used to publish a poisoned version of the company's own customer SDK.",
        "Den som underhåller ”tinyfmt”, ett litet formateringsbibliotek med miljontals nedladdningar i veckan, lurades via ett falskt säkerhetsmeddelande från paketregistret. Angriparen publicerade tre versioner med ett installationsskript som stal miljövariabler och token, och webbläsarkod som bytte ut bankuppgifter på betalsidor. {{org.name}}s beroenderobot uppdaterade låsfilen under natten och slog ihop ändringen automatiskt. Portalbygget som driftsattes 07.00 innehöll webbläsarkoden; CI-maskiner och {{num.laptops}} utvecklardatorer körde installationsskriptet. Den stulna registertoken från CI användes sedan för att publicera en förgiftad version av företagets egen kund-SDK."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Look-alike registry domain registered.", "En efterliknande domän för registret registreras."]) },
        { at: -660, text: L(["Maintainer phished; malicious versions published.", "Underhållaren lurad; skadliga versioner publiceras."]) },
        { at: -300, text: L(["Dependency bot merges the update; CI runs the install script.", "Beroenderoboten slår ihop uppdateringen; CI kör installationsskriptet."]) },
        { at: -90, text: L(["Customer portal deployed with the payment-swapping code.", "Kundportalen driftsätts med koden som byter betalningsuppgifter."]) },
        { at: 300, text: L(["Stolen registry token publishes a poisoned SDK version.", "Den stulna registertoken publicerar en förgiftad SDK-version."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-bot", revealStage: "p2", text: L(["The bot's overnight lockfile update was merged automatically and ran on every CI runner.", "Robotens nattliga uppdatering av låsfilen slogs ihop automatiskt och kördes på varje CI-maskin."]) },
      { id: "hf-sdk", revealStage: "p4", text: L(["The CI registry token was taken and used to push version 3.8.1 of your SDK.", "Registertoken från CI togs och användes för att publicera version 3.8.1 av er SDK."]) },
      { id: "hf-tree", revealStage: "p6", text: L(["Hundreds of indirect packages run install scripts, and nobody reviews what the bot merges.", "Hundratals indirekta paket kör installationsskript, och ingen granskar vad roboten slår ihop."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["An advisory before coffee", "En varning före kaffet"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Developer chat channels around the world are lighting up. The package registry has pulled three versions of “tinyfmt”, a tiny library for formatting text, after its maintainer's account was taken over during the night.\n\nNobody at {{org.name}} has heard of tinyfmt. {{person.devLead.name}} is fairly sure you do not use it. Then someone points out that libraries are rarely chosen; they arrive with other libraries.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Utvecklarkanaler över hela världen lyser upp. Paketregistret har dragit tillbaka tre versioner av ”tinyfmt”, ett litet bibliotek för att formatera text, efter att underhållarens konto kapats under natten.\n\nIngen på {{org.name}} har hört talas om tinyfmt. {{person.devLead.name}} är ganska säker på att ni inte använder det. Sedan påpekar någon att bibliotek sällan väljs; de följer med andra bibliotek."
        ]),
        injects: [
          inj("i1-1", 0, "advisory", "csirt", "critical", "confirmed", [
            "Malicious versions of “tinyfmt” (4.2.1–4.2.3) published 23:10–02:40. Install script exfiltrates environment variables and tokens; browser bundle alters payment details on web pages. Treat any system that installed them as compromised.",
            "Skadliga versioner av ”tinyfmt” (4.2.1–4.2.3) publicerade 23.10–02.40. Installationsskriptet för ut miljövariabler och token; webbläsarkoden ändrar betalningsuppgifter på webbsidor. Behandla varje system som installerat dem som komprometterat."
          ], { headline: ["Compromised package: tinyfmt", "Komprometterat paket: tinyfmt"], tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "person.devLead", "medium", "misleading", [
            "“We pin our versions, so even if something pulls tinyfmt in, we'd be on an old one. I think we're fine.”",
            "”Vi låser våra versioner, så även om något drar in tinyfmt skulle vi ligga på en gammal. Jag tror att vi klarar oss.”"
          ], { facilitatorNote: ["Pinning only helps if nothing updates the pins. Something did.", "Låsta versioner hjälper bara om inget uppdaterar låsningen. Något gjorde det."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find every place tinyfmt is used, including indirect dependencies?", "Hur hittar ni varje ställe där tinyfmt används, även indirekta beroenden?", ["devLead"]),
            q("Did anything install or build new packages overnight?", "Installerade eller byggde något nya paket under natten?", ["devLead", "cloudLead"]),
            q("Which machines would have run an install script?", "Vilka maskiner skulle ha kört ett installationsskript?", ["itOps", "devLead"])
          ],
          executive: [
            q("Is this your incident before you know you are affected?", "Är det här er incident innan ni vet att ni är drabbade?", ["incidentCommander", "ciso"]),
            q("What would it mean for customers if the portal shows wrong bank details?", "Vad skulle det innebära för kunderna om portalen visar fel bankuppgifter?", ["serviceOwner"]),
            q("Who decides to stop deployments?", "Vem bestämmer att driftsättningar ska stoppas?", ["incidentCommander", "devLead"])
          ]
        },
        challenges: [ch("A major release to the customer portal is scheduled for 10:00.", "En stor release av kundportalen är planerad till 10.00.")],
        decision: dec("d1", "incidentCommander", ["What do you do now?", "Vad gör ni nu?"], [
          ["Freeze deployments and builds, and search every lockfile and build log for tinyfmt now.", "Frys driftsättningar och byggen, och sök i varje låsfil och bygglogg efter tinyfmt nu."],
          ["Ask teams to check whether they use tinyfmt directly and report back by lunch.", "Be teamen kontrollera om de använder tinyfmt direkt och rapportera till lunch."],
          ["Go ahead with the 10:00 release, which carries a fix promised to a key customer, while a small team checks the lockfiles in parallel.", "Genomför releasen 10.00, som innehåller en rättning ni lovat en viktig kund, medan ett litet team kontrollerar låsfilerna parallellt."]
        ], {
          knowns: [["A widely used package was poisoned overnight.", "Ett allmänt använt paket förgiftades under natten."]],
          uncertainties: [["Whether it is anywhere in your software.", "Om det finns någonstans i er programvara."]],
          tradeoffs: {
            operational: ["A freeze delays the release the business is waiting for.", "En frysning försenar releasen som verksamheten väntar på."],
            security: ["Checking only direct dependencies misses most of the risk.", "Att bara kontrollera direkta beroenden missar det mesta av risken."],
            legal: ["Shipping known-bad code to customers is hard to defend.", "Att leverera känd skadlig kod till kunder är svårt att försvara."],
            reputational: ["Developers worldwide are watching who reacts well.", "Utvecklare över hela världen ser vem som reagerar bra."]
          },
          evaluation: [["Checks the full dependency tree and build history before trusting assumptions", "Kontrollerar hela beroendeträdet och byggnadshistoriken innan antaganden tas för givna"]],
          pushback: {
            A: [
              pb(["The promised fix", "Den utlovade rättningen"], ["The morning release carries a fix promised to your biggest customer, and their account manager is already asking for a time. Your search may well show you were never affected. How long will you hold the release on a maybe?", "Morgonens release innehåller en rättning som utlovats till er största kund, och deras kundansvarige frågar redan efter en tid. Sökningen kan mycket väl visa att ni aldrig var drabbade. Hur länge håller ni inne releasen på ett kanske?"]),
              pb(["An unrelated hotfix", "En orelaterad snabbrättning"], ["Another team needs to ship a hotfix for an unrelated bug that is hurting customers right now. Your freeze blocks it too. Do you make an exception, who decides, and what stops every team asking for one?", "Ett annat team behöver skicka ut en snabbrättning för ett orelaterat fel som drabbar kunder just nu. Er frysning stoppar den också. Gör ni ett undantag, vem bestämmer, och vad hindrar alla andra team från att be om ett?"]),
              pb(["A search that takes all day", "En sökning som tar hela dagen"], ["{{person.devLead.name}} warns that there are dozens of repositories, some with no active owner, and build logs are kept only briefly. A full search could take all day. Is a freeze that long proportionate for a package nobody has heard of?", "{{person.devLead.name}} varnar för att det finns dussintals kodförråd, en del utan aktiv ägare, och att byggloggar bara sparas en kort tid. En fullständig sökning kan ta hela dagen. Är en så lång frysning rimlig för ett paket som ingen har hört talas om?"])
            ],
            B: [
              pb(["Nobody chose it", "Ingen valde det"], ["Someone has already pointed out that libraries arrive with other libraries. Teams checking for direct use will almost all answer “no”. What will a “no” from them actually tell you?", "Någon har redan påpekat att bibliotek följer med andra bibliotek. Team som letar efter direkt användning kommer nästan alla att svara ”nej”. Vad säger ett ”nej” från dem er egentligen?"]),
              pb(["Until lunch", "Fram till lunch"], ["The advisory says any system that installed the bad versions is compromised. If one did, builds and deployments keep running on it until lunch. What could happen in those hours that you cannot undo?", "Varningen säger att varje system som installerat de skadliga versionerna är komprometterat. Om något gjorde det fortsätter byggen och driftsättningar att köras på det fram till lunch. Vad kan hända under de timmarna som ni inte kan göra ogjort?"]),
              pb(["“Is this mandatory?”", "”Är det här obligatoriskt?”"], ["Two team leads reply that they are mid-sprint and will look after the release, and one asks whether this is mandatory. A request is easy to defer. Do you make it an order, and on whose authority?", "Två teamledare svarar att de är mitt i en sprint och tittar på det efter releasen, och en frågar om det är obligatoriskt. En förfrågan är lätt att skjuta upp. Gör ni det till en order, och med vems mandat?"])
            ],
            C: [
              pb(["Shipping against an advisory", "Leverera trots varningen"], ["{{person.legal.name}} asks: if tinyfmt turns out to be in the release, you will have shipped code that an official advisory told you to treat as compromised, knowingly. Is one customer's fix worth defending that?", "{{person.legal.name}} frågar: om tinyfmt visar sig finnas i releasen har ni medvetet levererat kod som en officiell varning sa att ni skulle behandla som komprometterad. Är en kunds rättning värd att försvara det?"]),
              pb(["A match, half an answer", "En träff, ett halvt svar"], ["Shortly before the release, the small team finds tinyfmt in a lockfile, but cannot yet say which version or which product it ends up in. Do you stop the release at the last minute on half an answer?", "Strax före releasen hittar det lilla teamet tinyfmt i en låsfil, men kan ännu inte säga vilken version eller i vilken produkt det hamnar. Stoppar ni releasen i sista minuten på ett halvt svar?"]),
              pb(["The build installs too", "Bygget installerar också"], ["{{person.devLead.name}} notes that the release build itself installs packages fresh on the build machines. If any of them is a bad version, its install script runs during the very build you approved. Do you still press the button?", "{{person.devLead.name}} påpekar att releasebygget självt installerar paket på nytt på byggmaskinerna. Om något av dem är en skadlig version körs dess installationsskript under just det bygge ni godkände. Trycker ni ändå på knappen?"])
            ]
          }
        }),
        facilitator: fac(
          ["The comfortable assumption (“we pin”) is the trap. Push for evidence from lockfiles and build logs.", "Det bekväma antagandet (”vi låser”) är fällan. Driv på för belägg från låsfiler och byggloggar."],
          ["Freeze, search lockfiles and build logs for the bad versions across all repositories.", "Frys, sök i låsfiler och byggloggar efter de skadliga versionerna i alla kodförråd."],
          [["Ask: who or what changed your lockfiles this week?", "Fråga: vem eller vad har ändrat era låsfiler den här veckan?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["The bot merged it", "Roboten slog ihop det"]),
        twist: L(["Your dependency bot updated a lockfile at 02:15 and auto-merged it. tinyfmt 4.2.2 arrived through a logging library. The install script ran on every CI runner and on {{num.laptops}} developer laptops, and the 07:00 portal build carried the browser code.", "Er beroenderobot uppdaterade en låsfil 02.15 och slog ihop den automatiskt. tinyfmt 4.2.2 följde med ett loggbibliotek. Installationsskriptet kördes på varje CI-maskin och på {{num.laptops}} utvecklardatorer, och portalbygget 07.00 innehöll webbläsarkoden."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because deployments were frozen, the fix promised to your biggest customer did not ship at 10:00, and their account manager has called twice.", sv: "Eftersom driftsättningarna frystes skickades inte rättningen som utlovats till er största kund ut klockan 10, och deras kundansvarige har ringt två gånger." } }
        ],
        assumptionChallenged: L(["We pin versions, so we are not affected.", "Vi låser versioner, så vi är inte drabbade."]),
        reveals: ["hf-bot"],
        narrative: L([
          "{{time.T+60|clock}}. {{person.devLead.name}} searches every lockfile in the company for tinyfmt. It appears in fourteen places, never as something anyone chose, always as a dependency of a dependency.\n\nThe version numbers are the problem. Most are old and safe, but one lockfile changed overnight. The change was not made by a person, and nobody reviewed it.",
          "Klockan {{time.T+60|clock}}. {{person.devLead.name}} söker igenom varje låsfil i företaget efter tinyfmt. Det förekommer på fjorton ställen, aldrig som något någon har valt, alltid som ett beroende till ett beroende.\n\nVersionsnumren är problemet. De flesta är gamla och säkra, men en låsfil ändrades under natten. Ändringen gjordes inte av en människa, och ingen granskade den."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "person.devLead", "critical", "confirmed", [
            "portal-web: lockfile updated by dependency bot 02:15 (“chore: bump log-pretty 2.9 → 2.10”), auto-merged 02:16. Pulls tinyfmt 4.2.2. CI install step: postinstall ran on runners 1–6. Build 07:00 deployed to production.",
            "portal-web: låsfilen uppdaterad av beroenderoboten 02.15 (”chore: bump log-pretty 2.9 → 2.10”), automatiskt sammanslagen 02.16. Drar in tinyfmt 4.2.2. CI-installationssteget: postinstall kördes på maskin 1–6. Bygget 07.00 driftsatt i produktion."
          ], { reveals: ["hf-bot"], tests: ["lo1", "lo2"] }),
          inj("i2-2", 90, "edrAlert", "edr", "high", "confirmed", [
            "Node process spawned outbound connections to {{asset.c2Domain}} during package install on {{num.laptops}} developer laptops between 08:05 and 08:40.",
            "Node-processer öppnade utgående anslutningar till {{asset.c2Domain}} under paketinstallation på {{num.laptops}} utvecklardatorer mellan 08.05 och 08.40."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What secrets were in the environment on the CI runners and laptops?", "Vilka hemligheter fanns i miljön på CI-maskinerna och datorerna?", ["devLead", "cloudLead"]),
            q("Do you roll back the portal, or patch forward?", "Rullar ni tillbaka portalen, eller rättar ni framåt?", ["devLead", "serviceOwner"]),
            q("Did freezing deployments stop anything that would have made it worse?", "Stoppade frysningen av driftsättningar något som skulle ha gjort det värre?", ["devLead"], "d1")
          ],
          executive: [
            q("Is the customer portal safe to keep running right now?", "Är kundportalen säker att låta vara igång just nu?", ["serviceOwner", "ciso"]),
            q("What do you tell the developers whose laptops are affected?", "Vad säger ni till utvecklarna vars datorer är drabbade?", ["ciso"]),
            q("If the 10:00 release had gone ahead, what would it have carried?", "Om releasen 10.00 hade genomförts, vad hade den innehållit?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The CI runners hold the token that publishes your customer SDK to the registry.", "CI-maskinerna har den token som publicerar er kund-SDK till registret.")],
        decision: dec("d2", "ciso", ["How do you respond?", "Hur svarar ni?"], [
          ["Roll the portal back, take the portal offline if needed, revoke every secret CI and the laptops held, and rebuild the runners.", "Rulla tillbaka portalen, ta ner den vid behov, återkalla varje hemlighet som CI och datorerna hade och bygg om CI-maskinerna."],
          ["Patch the portal to remove tinyfmt and keep everything else running.", "Rätta portalen så att tinyfmt försvinner och låt allt annat vara igång."],
          ["Reimage the laptops and leave the CI tokens until you know what was taken.", "Installera om datorerna och låt CI-token vara tills ni vet vad som togs."]
        ], {
          knowns: [["The malicious code ran in CI, on laptops, and is live in the portal.", "Den skadliga koden kördes i CI, på datorer och är live i portalen."]],
          uncertainties: [["Which tokens were taken and whether they have been used.", "Vilka token som togs och om de har använts."]],
          tradeoffs: {
            operational: ["Revoking every CI secret stops all builds for a day.", "Att återkalla varje CI-hemlighet stoppar alla byggen i ett dygn."],
            security: ["A token left active is a door for the attacker's next step.", "En token som lämnas aktiv är en dörr för angriparens nästa steg."],
            legal: ["Customers using the portal now may be paying the wrong account.", "Kunder som använder portalen nu kan betala till fel konto."],
            reputational: ["Taking the portal down is visible; leaving it up is worse.", "Att ta ner portalen syns; att låta den vara uppe är värre."]
          },
          evaluation: [["Treats the build system as compromised, not only the product", "Behandlar byggsystemet som komprometterat, inte bara produkten"]],
          pushback: {
            A: [
              pb(["Nobody can pay", "Ingen kan betala"], ["With the portal offline, customers cannot log in or pay invoices in the middle of a business morning. {{person.serviceOwner.name}} asks whether a rollback alone would do. Can you justify going offline before you know anyone was harmed?", "Med portalen nere kan kunderna varken logga in eller betala fakturor mitt under en arbetsförmiddag. {{person.serviceOwner.name}} frågar om det inte räcker med en tillbakarullning. Kan ni motivera att ta ner den innan ni vet att någon har skadats?"]),
              pb(["A build system with no keys", "Ett byggsystem utan nycklar"], ["Revoking every CI secret also stops the clean portal build you need, until each secret is reissued and the runners rebuilt. {{person.devLead.name}} asks which ones come back first. How do you rebuild with a pipeline that has no keys?", "Att återkalla varje CI-hemlighet stoppar också det rena portalbygge ni behöver, tills varje hemlighet har utfärdats på nytt och CI-maskinerna byggts om. {{person.devLead.name}} frågar vilka som ska tillbaka först. Hur bygger ni om med en kedja som saknar nycklar?"]),
              pb(["Locking out your helpers", "Låser ute era hjälpare"], ["The {{num.laptops}} developers whose laptops ran the script are the people who know the build system best. Revoking their tokens locks them out of chat, mail and code in the middle of the incident. Do you cut off the people you need most?", "De {{num.laptops}} utvecklarna vars datorer körde skriptet är de som kan byggsystemet bäst. Att återkalla deras token stänger ute dem från chatt, mejl och kod mitt under incidenten. Kapar ni de människor ni behöver mest?"])
            ],
            B: [
              pb(["The tokens are still live", "Token är fortfarande giltiga"], ["The patch removes tinyfmt from the portal, but every token the install script read on the CI runners is still valid, including the one that publishes your customer SDK. What stops someone using them?", "Rättningen tar bort tinyfmt ur portalen, men varje token som installationsskriptet läste på CI-maskinerna är fortfarande giltig, även den som publicerar er kund-SDK. Vad hindrar någon från att använda dem?"]),
              pb(["Built on dirty machines", "Byggd på smutsiga maskiner"], ["Patching forward means a new build, on the same CI runners that ran the malicious install script this morning. Can you trust a fix that was built on machines you consider compromised?", "Att rätta framåt kräver ett nytt bygge, på samma CI-maskiner som körde det skadliga installationsskriptet i morse. Kan ni lita på en rättning som byggts på maskiner ni betraktar som komprometterade?"]),
              pb(["Live while you patch", "Uppe medan ni rättar"], ["The patch needs an hour to build and test. During that hour the portal keeps serving code that the advisory says alters payment details. {{person.serviceOwner.name}} asks whether customers are paying right now. What do you answer?", "Rättningen behöver en timme för att byggas och testas. Under den timmen fortsätter portalen att leverera kod som enligt varningen ändrar betalningsuppgifter. {{person.serviceOwner.name}} frågar om kunder betalar just nu. Vad svarar ni?"])
            ],
            C: [
              pb(["What about the portal?", "Och portalen då?"], ["This plan does nothing about the portal, which is live with the code that alters payment details. {{person.serviceOwner.name}} asks who decided it can stay up as it is. Who did, and on what grounds?", "Den här planen gör ingenting åt portalen, som är uppe med koden som ändrar betalningsuppgifter. {{person.serviceOwner.name}} frågar vem som bestämde att den kan vara uppe som den är. Vem gjorde det, och på vilka grunder?"]),
              pb(["“Until you know” never comes", "”Tills ni vet” kommer aldrig"], ["{{person.devLead.name}} says there is no log of what an install script reads; you will never know exactly what was taken from CI. If certainty never arrives, when do you revoke the tokens?", "{{person.devLead.name}} säger att det inte finns någon logg över vad ett installationsskript läser; ni kommer aldrig att veta exakt vad som togs från CI. Om vissheten aldrig kommer, när återkallar ni då token?"]),
              pb(["A day without laptops", "En dag utan datorer"], ["Reimaging {{num.laptops}} laptops will take {{person.itOps.name}}'s team the rest of the day, and those developers know the build system best. Who works on the incident while their machines are being wiped?", "Att installera om {{num.laptops}} datorer tar {{person.itOps.name}}s team resten av dagen, och de utvecklarna kan byggsystemet bäst. Vem arbetar med incidenten medan deras maskiner rensas?"])
            ]
          }
        }),
        facilitator: fac(
          ["The build pipeline is the crown jewel here. Watch whether the room revokes CI tokens.", "Byggkedjan är kronjuvelen här. Se om rummet återkallar CI-token."],
          ["Rollback, full secret revocation for CI and laptops, rebuilt runners.", "Tillbakarullning, fullständig återkallelse av hemligheter för CI och datorer, ombyggda CI-maskiner."],
          [["Ask: what can someone do with your CI's environment variables?", "Fråga: vad kan någon göra med miljövariablerna i er CI?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        priority: 1,
        title: L(["The wrong account", "Fel konto"]),
        twist: L(["For three hours this morning, the portal's payment page showed customers a different bank account. Two customers have already paid {{num.diverted|currency}} to it.", "I tre timmar i morse visade portalens betalsida kunderna ett annat bankkonto. Två kunder har redan betalat {{num.diverted|currency}} till det."]),
        twistKind: "impact",
        reconsider: { decision: "d2", pressure: { en: "The payment page showed the wrong bank account for three hours. Every minute the portal stays up, you cannot fully trust it. Every minute it is down, no customer can pay you at all.", sv: "Betalsidan visade fel bankkonto i tre timmar. Varje minut portalen är uppe kan ni inte helt lita på den. Varje minut den är nere kan ingen kund betala er alls." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the portal was rolled back and taken offline, no customer has been able to pay all morning, and finance asks who approved it.", sv: "Eftersom portalen rullades tillbaka och togs ner har ingen kund kunnat betala på hela förmiddagen, och ekonomi frågar vem som godkände det." } }
        ],
        assumptionChallenged: L(["The browser code was there, but nobody was harmed.", "Webbläsarkoden fanns där, men ingen skadades."]),
        narrative: L([
          "{{time.T+300|clock}}. The portal has been rolled back and the old bank details are showing again. {{person.serviceOwner.name}} asks finance to check this morning's incoming payments, just to be sure.\n\nFinance finds a gap where payments should be. Two customers who paid their invoices this morning confirm that they followed the instructions on the portal, exactly as they always do.",
          "Klockan {{time.T+300|clock}}. Portalen är tillbakarullad och de gamla bankuppgifterna syns igen. {{person.serviceOwner.name}} ber ekonomiavdelningen kontrollera morgonens inbetalningar, för säkerhets skull.\n\nEkonomi hittar ett hål där betalningar borde finnas. Två kunder som betalade sina fakturor i morse bekräftar att de följde instruktionerna i portalen, precis som de alltid gör."
        ]),
        injects: [
          inj("i3-1", 300, "customerComplaint", "customer", "high", "confirmed", [
            "“We paid this morning using the bank details in your portal, like always. Your reminder says you haven't received it. The screenshot is attached.”",
            "”Vi betalade i morse med bankuppgifterna i er portal, som vanligt. Er påminnelse säger att ni inte har fått något. Skärmbilden är bifogad.”"
          ], { tests: ["lo2"] }),
          inj("i3-2", 330, "phoneTranscript", "bank", "high", "confirmed", [
            "Your bank's fraud desk: “If the customers report it to their banks today, a recall is possible. Tomorrow is much harder.”",
            "Bankens bedrägeriavdelning: ”Om kunderna anmäler det till sina banker i dag är en återkallelse möjlig. I morgon är det mycket svårare.”"
          ], { optional: true, tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you find every customer who saw the page in those three hours?", "Hur hittar ni varje kund som såg sidan under de tre timmarna?", ["devLead", "serviceOwner"]),
            q("Can you prove what the page showed, and to whom?", "Kan ni bevisa vad sidan visade, och för vem?", ["devLead", "socLead"]),
            q("Did rolling back first, rather than patching, shorten the window?", "Kortade det fönstret att rulla tillbaka först, i stället för att rätta?", ["devLead"], "d2")
          ],
          executive: [
            q("Do you contact every customer who visited, or only those who paid?", "Kontaktar ni varje kund som besökte sidan, eller bara dem som betalade?", ["serviceOwner", "comms"]),
            q("Who bears the loss of the diverted payments?", "Vem bär förlusten av de omdirigerade betalningarna?", ["legal", "ceo"]),
            q("What would leaving the portal up with a patch have cost?", "Vad hade det kostat att låta portalen vara uppe med en rättning?", ["serviceOwner"], "d2")
          ]
        },
        challenges: [ch("The portal's logs record sessions but not what the browser displayed.", "Portalens loggar registrerar sessioner men inte vad webbläsaren visade.")],
        decision: dec("d3", "serviceOwner", ["How do you handle the customers?", "Hur hanterar ni kunderna?"], [
          ["Contact every customer who visited the portal this morning, help the two with bank recalls, and do not ask them to bear the loss.", "Kontakta varje kund som besökte portalen i morse, hjälp de två med återkallelser och be dem inte bära förlusten."],
          ["Contact the two who paid today, and the other visitors once you can tell them exactly what they saw and when.", "Kontakta de två som betalade i dag, och övriga besökare när ni kan berätta exakt vad de såg och när."],
          ["Post a general notice on the portal.", "Lägg upp ett allmänt meddelande i portalen."]
        ], {
          knowns: [["Customers were shown false bank details for three hours.", "Kunder visades falska bankuppgifter i tre timmar."]],
          uncertainties: [["How many more customers paid elsewhere and have not noticed.", "Hur många fler kunder som betalat någon annanstans och inte märkt det."]],
          tradeoffs: {
            operational: ["Contacting every visitor is a lot of calls today.", "Att kontakta varje besökare är många samtal i dag."],
            security: ["Waiting lets the window for recalls close.", "Att vänta låter fönstret för återkallelser stängas."],
            legal: ["Your portal gave the instruction; liability is likely yours.", "Er portal gav instruktionen; ansvaret är troligen ert."],
            reputational: ["Customers judge you by how fast you warn them.", "Kunderna bedömer er efter hur snabbt ni varnar dem."]
          },
          evaluation: [["Warns everyone exposed while recalls are still possible", "Varnar alla som exponerats medan återkallelser fortfarande är möjliga"]],
          pushback: {
            A: [
              pb(["Hundreds of calls", "Hundratals samtal"], ["The morning's sessions list hundreds of customers, and the logs cannot show who actually reached the payment page. You will be calling many who were never at risk. Do you narrow the list, and who decides who is left out?", "Morgonens sessioner listar hundratals kunder, och loggarna kan inte visa vilka som faktiskt kom till betalsidan. Ni kommer att ringa många som aldrig var i fara. Smalnar ni av listan, och vem bestämmer vilka som lämnas utanför?"]),
              pb(["A promise before the total", "Ett löfte före slutsumman"], ["{{person.legal.name}} warns that promising customers they will not bear the loss accepts liability before anyone knows how many paid the wrong account. Do you make the promise today, before you know the final sum?", "{{person.legal.name}} varnar för att ett löfte om att kunderna inte ska bära förlusten är att ta på sig ansvaret innan någon vet hur många som betalat till fel konto. Ger ni löftet i dag, innan ni vet slutsumman?"]),
              pb(["Sounds like a scam", "Låter som bedrägeri"], ["Calling customers about changed bank details is exactly what fraudsters do, and two customers have already hung up on your staff. How do they know the call is really from you?", "Att ringa kunder om ändrade bankuppgifter är precis vad bedragare gör, och två kunder har redan lagt på luren för er personal. Hur ska de veta att samtalet verkligen kommer från er?"])
            ],
            B: [
              pb(["Exactly may never come", "Exakt kommer kanske aldrig"], ["The portal's logs record sessions, not what the browser showed. You may never be able to tell the other visitors exactly what they saw. How long do they wait for a precision you cannot get?", "Portalens loggar registrerar sessioner, inte vad webbläsaren visade. Ni kanske aldrig kan berätta exakt för övriga besökare vad de såg. Hur länge ska de vänta på en precision ni inte kan få?"]),
              pb(["The recall window", "Fönstret för återkallelse"], ["The bank's fraud desk said a recall is possible today and much harder tomorrow. A visitor you have not called may have paid this morning without noticing. If they miss the window, who carries that loss?", "Bankens bedrägeriavdelning sa att en återkallelse är möjlig i dag och mycket svårare i morgon. En besökare ni inte ringt kan ha betalat i morse utan att märka något. Om de missar fönstret, vem bär den förlusten?"]),
              pb(["They heard it elsewhere", "De hörde det någon annanstans"], ["A customer who used the portal this morning hears about the problem from another customer and calls in, angry that you knew and said nothing. Do you still hold the others back until you have details?", "En kund som använde portalen i morse får höra om problemet från en annan kund och ringer in, arg över att ni visste och inte sa något. Håller ni ändå övriga inne tills ni har detaljerna?"])
            ],
            C: [
              pb(["Who reads a banner?", "Vem läser en banner?"], ["The exposed customers paid this morning and have no reason to log in again until next month. A notice on the portal reaches the people least at risk. How will the others hear before the recall window closes?", "De exponerade kunderna betalade i morse och har ingen anledning att logga in igen förrän nästa månad. Ett meddelande i portalen når dem som är minst utsatta. Hur ska de andra få veta innan fönstret för återkallelse stängs?"]),
              pb(["Two customers waiting", "Två kunder som väntar"], ["The two customers who paid the wrong account are waiting for a call, not a banner. One says they will go to the press if nobody contacts them today. Who calls them, and what do you offer?", "De två kunderna som betalade till fel konto väntar på ett samtal, inte en banner. En av dem säger att de går till pressen om ingen hör av sig i dag. Vem ringer dem, och vad erbjuder ni?"]),
              pb(["Vague or alarming", "Vagt eller larmande"], ["{{person.comms.name}} cannot write a notice that is vague enough to avoid alarm and clear enough to make anyone check their payments. Which matters more to you, and can you defend that choice later?", "{{person.comms.name}} kan inte skriva ett meddelande som är vagt nog för att inte skapa oro och tydligt nog för att få någon att kontrollera sina betalningar. Vilket väger tyngst för er, och kan ni försvara valet i efterhand?"])
            ]
          }
        }),
        facilitator: fac(
          ["Supply-chain incidents feel abstract until someone pays the wrong account. Speed matters for recalls.", "Leverantörskedjeincidenter känns abstrakta tills någon betalar till fel konto. Snabbhet avgör återkallelser."],
          ["Contact all visitors today, support recalls, absorb the loss.", "Kontakta alla besökare i dag, stöd återkallelser, ta förlusten."],
          [["Ask: if you were the customer, when would you want to know?", "Fråga: om ni var kunden, när skulle ni vilja veta?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 420,
        title: L(["Version 3.8.1", "Version 3.8.1"]),
        twist: L(["A security researcher emails: version 3.8.1 of your own customer SDK, published to the registry an hour ago, contains the same malicious code. Your SDK has {{num.sdkDownloads|number}} weekly downloads.", "En säkerhetsforskare mejlar: version 3.8.1 av er egen kund-SDK, publicerad i registret för en timme sedan, innehåller samma skadliga kod. Er SDK har {{num.sdkDownloads|number}} nedladdningar i veckan."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "Your own SDK shipped the same code an hour ago. If you froze builds, your freeze now blocks the clean release. If you kept building, you may have published more than one bad version.", sv: "Er egen SDK skickade ut samma kod för en timme sedan. Om ni frös byggena blockerar frysningen nu den rena releasen. Om ni fortsatte bygga kan ni ha publicerat fler än en dålig version." } },
        assumptionChallenged: L(["We are a victim of a supply-chain attack.", "Vi är offer för en leverantörskedjeattack."]),
        reveals: ["hf-sdk"],
        narrative: L([
          "{{time.T+420|clock}}. The customer calls are under way and the portal is stable. Then an email arrives at the security address from a researcher who tracks poisoned packages.\n\nIt is not about tinyfmt any more. It names a package with your company's name on it, one that your customers install in their own systems to connect to yours.",
          "Klockan {{time.T+420|clock}}. Samtalen med kunderna pågår och portalen är stabil. Sedan kommer ett mejl till säkerhetsadressen från en forskare som bevakar förgiftade paket.\n\nDet handlar inte längre om tinyfmt. Det namnger ett paket med ert företagsnamn på, ett som era kunder installerar i sina egna system för att koppla upp sig mot era."
        ]),
        injects: [
          inj("i4-1", 420, "email", "threatIntel", "critical", "confirmed", [
            "“Your SDK 3.8.1, published 13:42, ships the tinyfmt payload in its install script. It was published with your organisation's registry token, not by your usual release process. Please confirm.”",
            "”Er SDK 3.8.1, publicerad 13.42, innehåller tinyfmt-koden i sitt installationsskript. Den publicerades med er organisations registertoken, inte via er vanliga releaseprocess. Var vänlig bekräfta.”"
          ], { headline: ["Your SDK 3.8.1 appears compromised", "Er SDK 3.8.1 verkar komprometterad"], reveals: ["hf-sdk"], tests: ["lo3"] }),
          inj("i4-2", 450, "authLog", "person.devLead", "critical", "confirmed", [
            "Registry audit: package publish “{{org.shortName|lower}}-sdk@3.8.1” at 13:42 with token ci-publish-01 from {{asset.attackerIp}}. Token last rotated: never.",
            "Registrets granskningslogg: paketpublicering ”{{org.shortName|lower}}-sdk@3.8.1” 13.42 med token ci-publish-01 från {{asset.attackerIp}}. Token senast bytt: aldrig."
          ], { tests: ["lo2", "lo3"] })
        ],
        charts: [{
          id: "c4-dl", type: "line",
          title: L(["Downloads of SDK 3.8.1", "Nedladdningar av SDK 3.8.1"]), unit: L(["downloads per 10 min", "nedladdningar per 10 min"]),
          caption: L(["Minutes since it was published.", "Minuter sedan den publicerades."]),
          data: line(["Downloads", "Nedladdningar"], 0, 60, 10, (x, ctx) => Math.round((ctx.vars.sdkDownloads / 600) * (1 + x / 10)))
        }],
        questions: {
          technical: [
            q("How do you get 3.8.1 removed from the registry, and what replaces it?", "Hur får ni 3.8.1 borttagen ur registret, och vad ersätter den?", ["devLead"]),
            q("Why was the publish token still valid after this morning?", "Varför var publiceringstoken fortfarande giltig efter i morse?", ["devLead", "ciso"]),
            q("Did the decision on CI secrets this morning include this token?", "Omfattade morgonens beslut om CI-hemligheter den här token?", ["ciso"], "d2")
          ],
          executive: [
            q("What do you owe the customers who installed 3.8.1?", "Vad är ni skyldiga de kunder som installerade 3.8.1?", ["ceo", "legal"]),
            q("Who speaks publicly, and how fast?", "Vem talar offentligt, och hur snabbt?", ["comms", "ceo"]),
            q("If every CI token had been revoked at 09:30, would this have happened?", "Om varje CI-token hade återkallats 09.30, hade det här hänt?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Several customers run automated updates and will have installed it already.", "Flera kunder kör automatiska uppdateringar och har redan installerat den.")],
        decision: dec("d4", "ceo", ["What do you do as a supplier?", "Vad gör ni som leverantör?"], [
          ["Unpublish 3.8.1, release a clean 3.8.2, publish an advisory with indicators, and contact known customers directly.", "Avpublicera 3.8.1, släpp en ren 3.8.2, publicera en säkerhetsvarning med indikatorer och kontakta kända kunder direkt."],
          ["Unpublish 3.8.1 and release 3.8.2 now, and publish the advisory tomorrow once the indicators are verified.", "Avpublicera 3.8.1 och släpp 3.8.2 nu, och publicera säkerhetsvarningen i morgon när indikatorerna är verifierade."],
          ["Wait until you have confirmed the full impact before saying anything.", "Vänta tills ni har bekräftat hela påverkan innan ni säger något."]
        ], {
          knowns: [["Your own package was used to spread the attack.", "Ert eget paket användes för att sprida angreppet."]],
          uncertainties: [["How many customers installed it and what it took from them.", "Hur många kunder som installerade det och vad det tog från dem."]],
          tradeoffs: {
            operational: ["An advisory brings a flood of questions.", "En säkerhetsvarning ger en flod av frågor."],
            security: ["A silent fix leaves customers' stolen tokens active.", "En tyst rättning lämnar kundernas stulna token aktiva."],
            legal: ["Product security rules may require prompt reporting of a severe incident.", "Regler om produktsäkerhet kan kräva snabb rapportering av en allvarlig incident."],
            reputational: ["The developer community rewards openness and punishes silence.", "Utvecklarvärlden belönar öppenhet och straffar tystnad."]
          },
          evaluation: [["Acts as the supplier you would want: fast, open, with indicators", "Agerar som den leverantör ni själva skulle vilja ha: snabbt, öppet, med indikatorer"]],
          pushback: {
            A: [
              pb(["The headline writes itself", "Rubriken skriver sig själv"], ["{{person.comms.name}} warns that an advisory naming your SDK will be read by journalists as well as customers, and “supplier ships malware to customers” writes itself. Do you still publish it under your own name today?", "{{person.comms.name}} varnar för att en säkerhetsvarning som namnger er SDK läses av journalister lika väl som av kunder, och ”leverantör skickar skadlig kod till kunder” skriver sig själv. Publicerar ni den ändå under eget namn i dag?"]),
              pb(["Clean, really?", "Ren, verkligen?"], ["3.8.2 has to be built and published, but the publish token was stolen and your build pipeline is still being cleaned. {{person.devLead.name}} cannot yet vouch that the new release comes from a clean pipeline. Do you ship a fix you cannot fully vouch for?", "3.8.2 måste byggas och publiceras, men publiceringstoken stals och byggkedjan håller fortfarande på att rensas. {{person.devLead.name}} kan ännu inte gå i god för att den nya releasen kommer från en ren kedja. Skickar ni ut en rättning ni inte helt kan gå i god för?"]),
              pb(["Customers you cannot see", "Kunder ni inte ser"], ["The registry does not tell you who downloaded 3.8.1; you can only contact customers you have a contract with. Developers who installed it straight from the registry are invisible to you. Does your direct contact list give you false comfort?", "Registret berättar inte vem som laddade ner 3.8.1; ni kan bara kontakta kunder ni har avtal med. Utvecklare som installerade direkt från registret är osynliga för er. Ger listan över direktkontakter er en falsk trygghet?"])
            ],
            B: [
              pb(["Already installed", "Redan installerad"], ["Several customers run automated updates and already have 3.8.1. Unpublishing it does not remove it from their systems, and without indicators they have no reason to look. What are they supposed to do tonight?", "Flera kunder kör automatiska uppdateringar och har redan 3.8.1. Att avpublicera den tar inte bort den från deras system, och utan indikatorer har de ingen anledning att leta. Vad ska de göra i natt?"]),
              pb(["A version vanishes", "En version försvinner"], ["Developers notice that 3.8.1 has vanished and 3.8.2 appeared with no explanation, and start asking in public forums whether you are hiding something. What do you answer them today, without the advisory?", "Utvecklare märker att 3.8.1 har försvunnit och 3.8.2 dykt upp utan förklaring, och börjar fråga i öppna forum om ni döljer något. Vad svarar ni dem i dag, utan säkerhetsvarningen?"]),
              pb(["One customer asks directly", "En kund frågar rakt ut"], ["A customer's security team has spotted 3.8.2 and asks you directly why 3.8.1 disappeared. If you tell them now, ahead of the advisory, why not everyone else? What do you say?", "En kunds säkerhetsteam har sett 3.8.2 och frågar er rakt ut varför 3.8.1 försvann. Om ni berättar för dem nu, före säkerhetsvarningen, varför inte för alla andra? Vad säger ni?"])
            ],
            C: [
              pb(["Still downloading", "Laddas fortfarande ner"], ["The download chart is still climbing every ten minutes, and 3.8.1 is still on the registry. Every install while you wait is another customer whose tokens are being stolen. What does waiting buy you that is worth that?", "Nedladdningskurvan stiger fortfarande var tionde minut, och 3.8.1 ligger kvar i registret. Varje installation medan ni väntar är ännu en kund vars token stjäls. Vad köper väntan er som är värt det?"]),
              pb(["The researcher won't wait", "Forskaren väntar inte"], ["The researcher replies that the finding will be shared with the registry and other researchers within hours, with or without your confirmation. Do you want the first public word about your SDK to be someone else's?", "Forskaren svarar att fyndet delas med registret och andra forskare inom några timmar, med eller utan er bekräftelse. Vill ni att det första offentliga beskedet om er SDK ska komma från någon annan?"]),
              pb(["Silence on the record", "Tystnad som syns"], ["{{person.legal.name}} points out that you now know your product is shipping malicious code. Every hour of silence from here is something you will have to explain to customers and perhaps to authorities. Who will sign that explanation?", "{{person.legal.name}} påpekar att ni nu vet att er produkt sprider skadlig kod. Varje timme av tystnad härifrån är något ni måste förklara för kunder och kanske för myndigheter. Vem skriver under den förklaringen?"])
            ]
          }
        }),
        facilitator: fac(
          ["The victim becomes the vector. The tone of the room usually changes here.", "Offret blir smittbäraren. Stämningen i rummet brukar ändras här."],
          ["Unpublish, clean release, public advisory with indicators, direct customer contact.", "Avpublicera, ren release, offentlig säkerhetsvarning med indikatorer, direktkontakt med kunder."],
          [["Ask: what would you want from tinyfmt's maintainer this morning?", "Fråga: vad hade ni velat ha från tinyfmts underhållare i morse?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["Twenty-four hours", "Tjugofyra timmar"]),
        twist: L(["{{reg.csirt}} reminds you that as a manufacturer of a software product, a severe incident affecting its security must be reported within 24 hours of becoming aware, with an update within 72.", "{{reg.csirt}} påminner om att ni som tillverkare av en programvaruprodukt måste rapportera en allvarlig incident som påverkar dess säkerhet inom 24 timmar från kännedom, med en uppdatering inom 72."]),
        twistKind: "authority",
        assumptionChallenged: L(["Reporting is only about personal data.", "Rapportering handlar bara om personuppgifter."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. A long night is over. The SDK has been cleaned and re-released, and the advisory is out. {{person.legal.name}} has been reading rules that most of the room has only heard mentioned at conferences.\n\nThe data protection question is familiar. The new question is about the product itself, and the clock for it may have started the moment the researcher's email arrived.",
          "{{time.T+1440|weekday|cap}}. En lång natt är över. SDK:n är rensad och släppt på nytt, och säkerhetsvarningen är publicerad. {{person.legal.name}} har läst regler som de flesta i rummet bara hört nämnas på konferenser.\n\nDataskyddsfrågan är bekant. Den nya frågan gäller själva produkten, och klockan för den kan ha börjat gå i samma stund som forskarens mejl kom."
        ]),
        injects: [
          inj("i5-1", 1440, "regulatorLetter", "csirt", "high", "confirmed", [
            "{{reg.csirt}}: “We have seen your advisory. Manufacturers must give early warning of severe incidents affecting product security within 24 hours, a notification within 72 hours and a final report later. Please confirm your submission.”",
            "{{reg.csirt}}: ”Vi har sett er säkerhetsvarning. Tillverkare ska ge en tidig varning om allvarliga incidenter som påverkar produktsäkerheten inom 24 timmar, en anmälan inom 72 timmar och en slutrapport senare. Bekräfta er inlämning.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What indicators and timeline can you give in the report today?", "Vilka indikatorer och vilken tidslinje kan ni ge i rapporten i dag?", ["socLead", "devLead"]),
            q("Can you tell which customers installed 3.8.1?", "Kan ni se vilka kunder som installerade 3.8.1?", ["devLead"]),
            q("Did the public advisory make this report easier to write?", "Gjorde den offentliga säkerhetsvarningen den här rapporten lättare att skriva?", ["comms"], "d4")
          ],
          executive: [
            q("Who signs product security reports for the company?", "Vem undertecknar rapporter om produktsäkerhet för företaget?", ["legal", "ceo"]),
            q("Do you also notify {{reg.dpaShort}} about the portal?", "Anmäler ni också portalen till {{reg.dpaShort}}?", ["dpo"]),
            q("Would a quiet fix have left you explaining a missed deadline?", "Hade en tyst rättning lämnat er att förklara en missad tidsfrist?", ["legal"], "d4")
          ]
        },
        challenges: [ch("Nobody in the company has submitted a product security report before.", "Ingen på företaget har lämnat in en rapport om produktsäkerhet tidigare.")],
        noDecision: L(["No vote: the duty is set. Let the room agree who files, what goes in, and how the 72-hour update is prepared.", "Ingen omröstning: skyldigheten är given. Låt rummet komma överens om vem som lämnar in, vad som ska med och hur 72-timmarsuppdateringen förbereds."]),
        facilitator: fac(
          ["Product security reporting is new to most organisations. Treat it like the data protection clock.", "Rapportering om produktsäkerhet är nytt för de flesta organisationer. Behandla det som dataskyddsklockan."],
          ["A named owner files today, with an update plan for 72 hours.", "En namngiven ansvarig lämnar in i dag, med en plan för uppdateringen inom 72 timmar."],
          [["Ask: when exactly did you become aware?", "Fråga: när exakt fick ni kännedom?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["{{num.deps|number}} packages", "{{num.deps|number}} paket"]),
        twist: L(["An audit of the dependency tree finds {{num.deps|number}} third-party packages in the portal alone, hundreds running install scripts, and a bot that has auto-merged over 2,000 updates this year without review.", "En granskning av beroendeträdet hittar {{num.deps|number}} tredjepartspaket bara i portalen, hundratals som kör installationsskript och en robot som har slagit ihop över 2 000 uppdateringar i år utan granskning."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "Customers who heard it from you first are grateful. Two who read it first in a researcher's blog post have paused their contracts, and ask why you waited.", sv: "Kunder som hörde det från er först är tacksamma. Två som läste det först i en forskares blogginlägg har pausat sina avtal och frågar varför ni väntade." } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because your advisory named the version and the indicators, a trade journal is running the story as: supplier ships malware to its own customers.", sv: "Eftersom er säkerhetsvarning namngav versionen och indikatorerna kör en branschtidning nyheten som: leverantör skickar skadlig kod till sina egna kunder." } }
        ],
        assumptionChallenged: L(["This was one bad package.", "Det här var ett dåligt paket."]),
        reveals: ["hf-tree"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. The diverted payments are being recovered and the advisory has been widely praised. {{person.devLead.name}} presents an inventory of what your software is actually made of.\n\nNobody chose most of it. It arrived through dependencies of dependencies, kept up to date by a helpful bot that never sleeps and never asks.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. De omdirigerade betalningarna håller på att återvinnas och säkerhetsvarningen har fått mycket beröm. {{person.devLead.name}} presenterar en förteckning över vad er programvara faktiskt består av.\n\nIngen har valt det mesta av det. Det kom via beroenden till beroenden, hållet uppdaterat av en hjälpsam robot som aldrig sover och aldrig frågar."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.devLead", "medium", "confirmed", [
            "Portal dependencies: {{num.deps|number}} (direct 64). Packages with install scripts: 211. Bot updates auto-merged this year: 2,140; human review: none. Software bill of materials: not produced.",
            "Portalens beroenden: {{num.deps|number}} (direkta 64). Paket med installationsskript: 211. Robotuppdateringar automatiskt sammanslagna i år: 2 140; mänsklig granskning: ingen. Förteckning över programvarukomponenter: tas inte fram."
          ], { reveals: ["hf-tree"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Should install scripts run at all in CI and on laptops?", "Bör installationsskript köras över huvud taget i CI och på datorer?", ["devLead"]),
            q("Would a waiting period before new versions are accepted have saved you?", "Hade en väntetid innan nya versioner accepteras räddat er?", ["devLead"]),
            q("Looking back, which morning decision limited the damage most?", "När ni ser tillbaka, vilket beslut under morgonen begränsade skadan mest?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Who owns the decision of what code enters your products?", "Vem äger beslutet om vilken kod som kommer in i era produkter?", ["ciso", "devLead"]),
            q("What will customers ask you to prove about your software from now on?", "Vad kommer kunderna att be er bevisa om er programvara från och med nu?", ["serviceOwner", "legal"]),
            q("Did revoking tokens early enough become the deciding factor?", "Blev det avgörande om token återkallades tillräckligt tidigt?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("Developers say turning off auto-merge will leave them hopelessly behind on security patches.", "Utvecklarna säger att avstängd automatisk sammanslagning gör att de hamnar hopplöst efter med säkerhetsrättningar.")],
        decision: dec("d5", "devLead", ["What do you change?", "Vad ändrar ni?"], [
          ["A cooling-off period for new versions, install scripts off by default, short-lived publish tokens and a software bill of materials.", "En karenstid för nya versioner, installationsskript avstängda som standard, kortlivade publiceringstoken och en förteckning över programvarukomponenter."],
          ["Turn off the bot and update manually.", "Stäng av roboten och uppdatera manuellt."],
          ["Keep the bot, but require a human review for any update that adds install scripts or a new maintainer.", "Behåll roboten, men kräv mänsklig granskning av varje uppdatering som lägger till installationsskript eller en ny ansvarig."]
        ], {
          knowns: [["Unreviewed third-party code enters builds every day.", "Ogranskad tredjepartskod kommer in i byggen varje dag."]],
          uncertainties: [["Which of today's packages is next.", "Vilket av dagens paket som blir nästa."]],
          tradeoffs: {
            operational: ["Cooling-off periods delay real security fixes by days.", "Karenstider försenar verkliga säkerhetsrättningar med dagar."],
            security: ["Manual updates fall behind and leave known holes open.", "Manuella uppdateringar halkar efter och lämnar kända hål öppna."],
            legal: ["Customers and regulators increasingly expect a bill of materials.", "Kunder och tillsynsmyndigheter förväntar sig allt oftare en komponentförteckning."],
            reputational: ["Being the vector once is forgiven; twice is not.", "Att vara smittbärare en gång förlåts; två gånger gör det inte."]
          },
          evaluation: [["Governs incoming code without stopping updates", "Styr inkommande kod utan att stoppa uppdateringar"]],
          pushback: {
            A: [
              pb(["A critical fix waits", "En kritisk rättning väntar"], ["A critical vulnerability is announced in a library the portal uses, and the fix sits in the cooling-off queue for days while exploits circulate. Who can override the waiting period, and how do you stop that override becoming the next way in?", "En kritisk sårbarhet offentliggörs i ett bibliotek som portalen använder, och rättningen ligger i karenstiden i flera dagar medan attackkod sprids. Vem kan häva väntetiden, och hur hindrar ni att det undantaget blir nästa väg in?"]),
              pb(["Builds start failing", "Byggen börjar fallera"], ["{{person.devLead.name}} tried it: with install scripts off, dozens of packages fail to build, including the one the payment page uses. Each needs an exception. How many exceptions before the rule means nothing?", "{{person.devLead.name}} har provat: med installationsskript avstängda går dussintals paket inte att bygga, även det som betalsidan använder. Varje paket kräver ett undantag. Hur många undantag innan regeln inte betyder något?"]),
              pb(["A list nobody reads", "En lista som ingen läser"], ["A bill of materials listing {{num.deps|number}} packages is easy to produce and hard to use. {{person.ciso.name}} asks who will read it, and what they will do differently at the next advisory. Do you have an answer?", "En komponentförteckning med {{num.deps|number}} paket är lätt att ta fram och svår att använda. {{person.ciso.name}} frågar vem som ska läsa den, och vad de ska göra annorlunda vid nästa varning. Har ni ett svar?"])
            ],
            B: [
              pb(["Hopelessly behind", "Hopplöst efter"], ["The bot merged over 2,000 updates this year. By hand, the team will manage a fraction of that, and known holes will stay open for months. Which security fixes do you choose to skip first?", "Roboten slog ihop över 2 000 uppdateringar i år. För hand klarar teamet en bråkdel av det, och kända hål kommer att stå öppna i månader. Vilka säkerhetsrättningar väljer ni att hoppa över först?"]),
              pb(["The same install command", "Samma installationskommando"], ["A developer updating by hand runs the same install command and pulls in the same dependencies of dependencies, install scripts included. A logging library update would have brought tinyfmt either way. What does removing the bot actually change?", "En utvecklare som uppdaterar för hand kör samma installationskommando och drar in samma beroenden till beroenden, installationsskript inräknade. En uppdatering av ett loggbibliotek hade fört med sig tinyfmt ändå. Vad ändrar det egentligen att ta bort roboten?"]),
              pb(["The bot comes back", "Roboten kommer tillbaka"], ["Two senior developers say they will not spend their weeks clicking through version bumps, and one team quietly turns the bot back on in its own repository. How do you enforce a rule your best people think is wrong?", "Två seniora utvecklare säger att de inte tänker lägga sina veckor på att klicka igenom versionshöjningar, och ett team slår i tysthet på roboten igen i sitt eget kodförråd. Hur upprätthåller ni en regel som era bästa medarbetare tycker är fel?"])
            ],
            C: [
              pb(["Would it have caught tinyfmt?", "Hade den fångat tinyfmt?"], ["The update that brought tinyfmt in was a routine bump of a logging library, by its usual maintainer. The danger sat two levels down. Will your reviewer ever see that, or only the bump?", "Uppdateringen som förde in tinyfmt var en rutinmässig höjning av ett loggbibliotek, av dess vanliga ansvarige. Faran låg två nivåer ner. Kommer er granskare någonsin att se det, eller bara höjningen?"]),
              pb(["211 already inside", "211 redan inne"], ["211 packages in the portal already run install scripts. Your rule only reviews updates that add new ones. Are you comfortable with the ones that are already inside, unreviewed?", "211 paket i portalen kör redan installationsskript. Er regel granskar bara uppdateringar som lägger till nya. Är ni bekväma med dem som redan finns inne, ogranskade?"]),
              pb(["Who actually reviews?", "Vem granskar egentligen?"], ["The reviews land on developers who have never been asked to judge a dependency before. Clicking “approve” on lockfile changes nobody can read is not a review. Who is trained to do it, and how much time do they get?", "Granskningarna hamnar hos utvecklare som aldrig tidigare ombetts bedöma ett beroende. Att klicka ”godkänn” på låsfilsändringar som ingen kan läsa är ingen granskning. Vem är utbildad för det, och hur mycket tid får de?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on governance: automated trust is a design decision nobody made consciously.", "Avsluta med styrning: automatiskt förtroende är ett designbeslut som ingen fattade medvetet."],
          ["Cooling-off, no install scripts by default, short-lived tokens, SBOM.", "Karenstid, inga installationsskript som standard, kortlivade token, komponentförteckning."],
          [["Ask: who approved the bot's right to change your product at 02:15?", "Fråga: vem godkände robotens rätt att ändra er produkt 02.15?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The portal is clean, most diverted payments are recovered and your advisory helps others, but your SDK spread the attack to customers for an hour.",
        "Portalen är ren, de flesta omdirigerade betalningar återvinns och er säkerhetsvarning hjälper andra, men er SDK spred angreppet till kunder under en timme."
      ])
    },

    debrief: {
      keyLessons: [
        L(["You rarely choose your riskiest code; it arrives as dependencies of dependencies.", "Ni väljer sällan er mest riskfyllda kod; den kommer som beroenden till beroenden."]),
        L(["A poisoned build means every secret the build machines held is gone.", "Ett förgiftat bygge innebär att varje hemlighet som byggmaskinerna hade är borta."]),
        L(["When your product spreads an attack, act like the supplier you would want: fast and open.", "När er produkt sprider ett angrepp, agera som den leverantör ni själva skulle vilja ha: snabbt och öppet."]),
        L(["Product security incidents can carry their own reporting duties.", "Incidenter som rör produktsäkerhet kan ha egna rapporteringsskyldigheter."])
      ],
      assumptionsVsReality: [
        avr(["We pin versions, so we are safe.", "Vi låser versioner, så vi är säkra."], ["A bot updated the pin overnight.", "En robot uppdaterade låsningen under natten."], "p2"),
        avr(["We are a victim.", "Vi är ett offer."], ["Our SDK became a vector for others.", "Vår SDK blev en smittbärare för andra."], "p4"),
        avr(["One bad package.", "Ett dåligt paket."], ["Thousands of unreviewed packages and updates.", "Tusentals ogranskade paket och uppdateringar."], "p6")
      ],
      strengthsToLookFor: [
        L(["Freezing deployments while checking lockfiles", "Att frysa driftsättningar medan låsfilerna kontrolleras"]),
        L(["Revoking every CI secret, including publish tokens", "Att återkalla varje CI-hemlighet, även publiceringstoken"]),
        L(["A public advisory with indicators", "En offentlig säkerhetsvarning med indikatorer"])
      ],
      commonGaps: [
        L(["Checking only direct dependencies", "Att bara kontrollera direkta beroenden"]),
        L(["Rotating laptop credentials but not CI tokens", "Att byta inloggningar på datorer men inte CI-token"]),
        L(["Missing product security reporting duties", "Att missa skyldigheter att rapportera om produktsäkerhet"])
      ],
      suggestedActions: [
        act(["Disable install scripts by default in CI and on developer machines.", "Stäng av installationsskript som standard i CI och på utvecklardatorer."], "devLead", "high"),
        act(["Use short-lived, scoped tokens for publishing packages.", "Använd kortlivade, avgränsade token för att publicera paket."], "devLead", "high"),
        act(["Introduce a cooling-off period and review for dependency bot updates.", "Inför en karenstid och granskning för beroenderobotens uppdateringar."], "ciso", "medium"),
        act(["Prepare a product security incident reporting procedure.", "Ta fram en rutin för rapportering av produktsäkerhetsincidenter."], "legal", "medium")
      ]
    }
  });
})();
