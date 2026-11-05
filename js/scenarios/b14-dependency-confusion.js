/*
 * b14-dependency-confusion.js — "The Internal Name" (branching, dependency confusion).
 *
 * A public package appears with the same name as one of your internal
 * packages, at version 99.0.0, and your build servers prefer it. Spine: first
 * move → what it did → the fix to the build configuration → a second, hostile
 * version → the product you shipped → bounty or court → the secrets → the
 * product security report → the developers → what changes. Break-away at
 * § "Bounty or court": suing the researcher.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, ir, io, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b14-dependency-confusion",
    version: 1,
    format: "branching",
    category: "dependency-confusion",
    archetype: "ambiguous-start",
    emblem: "dependency-confusion",
    title: L(["The Internal Name", "Det interna namnet"]),
    summary: L([
      "Someone has published a public package with exactly the same name as one of your private ones. Your build servers trusted the stranger. Was it a researcher proving a point, or the first step of an attack? Possibly both.",
      "Någon har publicerat ett öppet paket med exakt samma namn som ett av era privata. Era byggservrar litade på främlingen. Var det en forskare som ville bevisa något, eller första steget i ett angrepp? Kanske båda."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain code that entered builds by name confusion", "Stoppa kod som kommit in i byggen genom namnförväxling"]), teaser: L(["A stranger with a familiar name", "En främling med ett bekant namn"]) },
      { id: "lo2", text: L(["Fix the build configuration that trusted the wrong source", "Rätta byggkonfigurationen som litade på fel källa"]), teaser: L(["Where your code comes from", "Var er kod kommer ifrån"]) },
      { id: "lo3", text: L(["Respond to a researcher in good faith while staying safe", "Bemöta en forskare i god tro och samtidigt vara försiktig"]), teaser: L(["Friend or foe", "Vän eller fiende"]) },
      { id: "lo4", text: L(["Meet duties to customers when a shipped product is affected", "Uppfylla skyldigheter mot kunder när en levererad produkt är drabbad"]), teaser: L(["What you already shipped", "Vad ni redan har levererat"]) }
    ],
    mitre: ["T1195.001", "T1608", "T1552", "T1059.007"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "PR.PS", "DE.CM", "RS.MA", "RS.CO", "RS.MI"],
      iso27001: ["A.5.7", "A.5.19", "A.5.21", "A.8.8", "A.8.25", "A.8.28", "A.8.30", "A.8.32"]
    },
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal", "unknown"], motivation: L(["Unclear: a researcher's proof of concept, copied by someone less friendly", "Oklar: en forskares konceptbevis, kopierat av någon mindre vänligt inställd"]), capability: "medium" },
    variables: {
      runners: { min: 3, max: 30 },
      laptops: { min: 4, max: 60, scaleBy: "size" },
      customers: { min: 40, max: 4000, scaleBy: "size", step: 10 },
      names: { min: 12, max: 90 }
    },
    roles: ["incidentCommander", "devLead", "ciso", "socLead", "itOps", "cloudLead", "legal", "comms", "serviceOwner", "ceo"],

    flags: {
      buildsUnfrozen: L(["Build freeze lifted early", "Byggstoppet hävt i förtid"]),
      buildsFrozen: L(["Builds frozen early", "Byggen frysta tidigt"]),
      secretsRotated: L(["Secrets on affected machines rotated", "Hemligheter på drabbade maskiner bytta"]),
      scopedRegistry: L(["Build config fixed to trust only the internal registry for internal names", "Byggkonfigurationen rättad så att interna namn bara hämtas från det interna registret"]),
      researcherEngaged: L(["Researcher engaged in good faith", "Forskaren bemött i god tro"]),
      threatened: L(["Researcher threatened", "Forskaren hotad"]),
      disclosed: L(["Customers told and product rebuilt", "Kunderna informerade och produkten ombyggd"]),
      namesClaimed: L(["Internal names reserved publicly", "Interna namn reserverade publikt"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Version 99", "Version 99"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A developer notices something odd in a build log. The internal package “{{org.shortName|lower}}-auth-utils”, which has only ever existed on your private registry, was downloaded this morning at version 99.0.0.\n\nYour internal version is 2.4. On the public package registry, someone published version 99.0.0 three days ago, and it has been downloaded {{num.runners}} times, all from addresses that look like yours.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En utvecklare lägger märke till något konstigt i en bygglogg. Det interna paketet ”{{org.shortName|lower}}-auth-utils”, som bara någonsin har funnits i ert privata register, laddades ner i morse i version 99.0.0.\n\nEr interna version är 2.4. I det öppna paketregistret publicerade någon version 99.0.0 för tre dagar sedan, och den har laddats ner {{num.runners}} gånger, alla från adresser som ser ut att vara era."
      ], {
        injects: [
          inj("b14-1", 0, "logExcerpt", "person.devLead", "high", "confirmed", [
            "CI build #8812: resolved {{org.shortName|lower}}-auth-utils@99.0.0 from the public registry (internal registry offers 2.4.1). Install script executed. Build succeeded.",
            "CI-bygge #8812: hämtade {{org.shortName|lower}}-auth-utils@99.0.0 från det öppna registret (det interna registret erbjuder 2.4.1). Installationsskriptet kördes. Bygget lyckades."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("Why would a build tool prefer version 99 from a stranger over 2.4 from you?", "Varför skulle ett byggverktyg föredra version 99 från en främling framför 2.4 från er?", ["devLead"])],
        facilitator: { notes: L(["Explain dependency confusion if needed: same name, higher version, public source wins.", "Förklara beroendeförväxling vid behov: samma namn, högre version, den öppna källan vinner."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Stops builds and deployments before investigating further.", "Stoppar byggen och driftsättningar innan vidare utredning."], [
          opt(["Freeze all builds and deployments now", "Frys alla byggen och driftsättningar nu"], "c2", ["Stops the spread; developers will complain.", "Stoppar spridningen; utvecklarna kommer att klaga."], {
            set: "buildsFrozen",
            pushback: [
              pb(["A customer fix is due", "En kundrättning ska ut"], ["The service owner reminds you that a fix was promised to a customer today, and the freeze stops it. Developers are already asking in chat how long this will last. Do you hold the freeze with no end in sight, or name an end now?", "Tjänsteägaren påminner om att en rättning var utlovad till en kund i dag, och stoppet hindrar den. Utvecklarna frågar redan i chatten hur länge det ska hålla på. Behåller ni stoppet utan slut i sikte, eller sätter ni ett slutdatum nu?"]),
              pb(["The laptops keep building", "Datorerna fortsätter bygga"], ["The freeze stops the CI servers, but developers also build on their own laptops, against the same configuration. Nobody can say whether the freeze covers them. Does your freeze reach the laptops, and how would you enforce it?", "Stoppet gäller CI-servrarna, men utvecklarna bygger också på sina egna datorer, mot samma konfiguration. Ingen kan säga om stoppet omfattar dem. Når ert stopp ut till datorerna, och hur skulle ni i så fall genomdriva det?"]),
              pb(["The installs already happened", "Installationerna har redan skett"], ["The package has been downloaded {{num.runners}} times over three days, and its install script ran each time. The freeze stops the next build but tells you nothing about those. Is stopping everything the right first move when whatever happened is already behind you?", "Paketet har laddats ner {{num.runners}} gånger under tre dagar, och installationsskriptet kördes varje gång. Stoppet hindrar nästa bygge men säger ingenting om dem. Är det rätt att börja med att stoppa allt, när det som hänt redan har hänt?"])
            ]
          }),
          opt(["Pin the internal version in the lockfiles and carry on", "Lås den interna versionen i låsfilerna och fortsätt"], "c2", ["Fixes the next build, ignores the last three days.", "Rättar nästa bygge, ignorerar de senaste tre dagarna."], {
            pushback: [
              pb(["Not every project has a lockfile", "Alla projekt har inte låsfiler"], ["The dev lead checks: several older projects have no lockfile at all, and others regenerate theirs on every build. Pinning protects only the projects that behave. Do you carry on building while you find out which ones don't?", "Utvecklingsansvarig kontrollerar: flera äldre projekt saknar låsfil helt, och andra skapar om sin vid varje bygge. Låsningen skyddar bara de projekt som sköter sig. Fortsätter ni bygga medan ni tar reda på vilka som inte gör det?"]),
              pb(["The CISO is not comfortable", "Säkerhetschefen är inte bekväm"], ["The CISO asks why builds are still running when nobody yet knows what version 99 does. “Carry on” sounds like business as usual on a day that isn't. Can you defend continuing if the package turns out to be hostile?", "Säkerhetschefen frågar varför byggena fortfarande körs när ingen ännu vet vad version 99 gör. ”Fortsätt” låter som en vanlig dag, och det är det inte. Kan ni försvara att ni fortsatte om paketet visar sig vara fientligt?"]),
              pb(["Three days nobody checked", "Tre dagar som ingen kollat"], ["Pinning fixes the next build. The log shows version 99 arrived three days ago, and every build since has run its install script. Who is looking at those builds while everyone carries on?", "Låsningen rättar nästa bygge. Loggen visar att version 99 kom in för tre dagar sedan, och varje bygge sedan dess har kört dess installationsskript. Vem tittar på de byggena medan alla andra fortsätter som vanligt?"])
            ]
          }),
          opt(["Ask the public registry to take the package down", "Be det öppna registret ta bort paketet"], "c2", ["Worth doing; it does nothing about where it already ran.", "Värt att göra; det gör inget åt var det redan har körts."], {
            pushback: [
              pb(["The registry is slow", "Registret är långsamt"], ["The registry's abuse form promises a reply within a few working days. Until then the package stays up, and your build servers will keep fetching it. What do you do on your own side while you wait?", "Registrets anmälningsformulär utlovar svar inom några arbetsdagar. Fram till dess ligger paketet kvar, och era byggservrar fortsätter att hämta det. Vad gör ni på er egen sida medan ni väntar?"]),
              pb(["Taking down the evidence", "Bevisen försvinner"], ["The SOC lead points out that if the package disappears, so does your best copy of what it actually does. Nobody has saved it for analysis yet. Do you secure a copy before asking for the takedown, even if that delays it?", "SOC-ansvarig påpekar att om paketet försvinner, försvinner också ert bästa underlag för vad det faktiskt gör. Ingen har sparat det för analys ännu. Säkrar ni en kopia innan ni begär borttagning, även om det fördröjer den?"]),
              pb(["Whose name is it?", "Vems namn är det?"], ["The registry asks you to show that the name belongs to you. On the public registry it never did: the name was free, and the stranger registered it first. On what grounds are you asking them to remove someone else's package?", "Registret ber er visa att namnet tillhör er. I det öppna registret har det aldrig gjort det: namnet var ledigt, och främlingen registrerade det först. Med vilken rätt ber ni dem ta bort någon annans paket?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The freeze holds", "Stoppet håller"], [
            io(["Quiet in the logs", "Tyst i loggarna"], ["Since the freeze, no machine has downloaded version 99. The CI queue fills up with waiting builds, and some in the room say the danger is already behind you.", "Sedan stoppet har ingen maskin laddat ner version 99. Kön i CI fylls av väntande byggen, och några i rummet säger att faran redan är över."], ["No downloads of version 99 since the freeze.", "Inga nedladdningar av version 99 sedan stoppet."]),
            io(["The CEO wants the fix out", "Vd vill få ut rättningen"], ["The customer who was promised a fix today has called {{person.ceo.name}} directly. The CEO asks the room to let that one release through, today, and wants to know who decided to stop everything.", "Kunden som utlovats en rättning i dag har ringt {{person.ceo.name}} direkt. Vd ber rummet släppa igenom just den releasen, i dag, och vill veta vem som beslutade att stoppa allt."], ["The CEO has asked for the customer fix to ship today.", "Vd har bett att kundrättningen levereras i dag."], { reopen: true }),
            io(["The developers grumble", "Utvecklarna muttrar"], ["The developer chat fills with complaints. Nobody has been told why builds stopped, and rumours range from an outage to an audit.", "Utvecklarnas chatt fylls av klagomål. Ingen har fått veta varför byggena stoppades, och ryktena spänner från driftstörning till revision."], ["Developers have not been told why builds were frozen.", "Utvecklarna har inte fått veta varför byggena frystes."])
          ]),
          ir("i2", { notChosen: "A" }, ["Builds keep running", "Byggena fortsätter"], [
            io(["A local rebuild", "Ett lokalt bygge"], ["A developer working from home mentions in chat that they rebuilt locally this morning and saw version 99 in their own output. Nobody had told them to stop.", "En utvecklare som jobbar hemifrån nämner i chatten att hen byggde lokalt i morse och såg version 99 i sin egen utskrift. Ingen hade sagt åt hen att sluta."], ["A developer laptop pulled version 99 during a local rebuild today.", "En utvecklardator hämtade version 99 vid ett lokalt bygge i dag."]),
            io(["The CISO wants a stop", "Säkerhetschefen vill stoppa"], ["{{person.ciso.name}} writes to the room: until someone knows what version 99 does, builds should not run. The CISO wants that decision made now, not after lunch.", "{{person.ciso.name}} skriver till rummet: tills någon vet vad version 99 gör ska inga byggen köras. Säkerhetschefen vill att det beslutet fattas nu, inte efter lunch."], ["The CISO has asked in writing for builds to stop.", "Säkerhetschefen har skriftligen begärt att byggena stoppas."], { reopen: true }),
            io(["A slow hour", "En lugn timme"], ["The next hour is quiet: hardly anyone pushes code, and no new build fetches the package. It looks as if carrying on was fine, but nobody has checked why.", "Nästa timme är lugn: nästan ingen skickar in kod, och inget nytt bygge hämtar paketet. Det ser ut som att det gick bra att fortsätta, men ingen har kontrollerat varför."], ["No new build fetched the package in the first hour.", "Inget nytt bygge hämtade paketet under den första timmen."])
          ])
        ]
      }),

      pg("c2", ["What it did", "Vad det gjorde"], [
        "{{person.socLead.name}} opens the public package. It is small. Its install script collects the machine's name, the user name, the working directory and the names of all environment variables, then sends them to a web address.\n\nIt does not send the values of the variables. It does not install anything else. Whoever wrote it wanted to know where it ran, not what it could take. At least, this version.",
        "{{person.socLead.name}} öppnar det öppna paketet. Det är litet. Dess installationsskript samlar in maskinens namn, användarnamnet, arbetskatalogen och namnen på alla miljövariabler, och skickar dem sedan till en webbadress.\n\nDet skickar inte variablernas värden. Det installerar inget annat. Den som skrev det ville veta var det kördes, inte vad det kunde ta. Åtminstone den här versionen."
      ], {
        injects: [
          inj("b14-2", 30, "forensicFinding", "forensics", "medium", "confirmed", [
            "Install script: collects hostname, username, cwd and environment variable NAMES; POST to a request-capture service. No persistence, no second stage. Package metadata: author “dc-research”, README: “security research, contact for details”.",
            "Installationsskript: samlar värdnamn, användarnamn, arbetskatalog och NAMNEN på miljövariabler; POST till en tjänst som fångar anrop. Inget fotfäste, inget andra steg. Paketets metadata: upphovsperson ”dc-research”, README: ”säkerhetsforskning, kontakta för detaljer”."
          ], { tests: ["lo1", "lo3"] })
        ],
        choice: ask(["What do you focus on now?", "Vad fokuserar ni på nu?"], ["Finds every machine that installed it, regardless of how harmless it looks.", "Hittar varje maskin som installerade det, oavsett hur ofarligt det ser ut."], [
          opt(["Find every machine that installed it", "Hitta varje maskin som installerade det"], "l1", ["Scope first; intent later.", "Omfattning först; avsikt senare."], {
            pushback: [
              pb(["Laptops leave no trace", "Datorer lämnar inga spår"], ["CI logs show which runners installed the package. Developer laptops leave no central trace, and several developers are working from home today. How far do you go into personal workspaces, and who explains to the developers why?", "CI-loggarna visar vilka maskiner som installerade paketet. Utvecklardatorerna lämnar inga centrala spår, och flera utvecklare jobbar hemifrån i dag. Hur långt in i personliga arbetsmiljöer går ni, och vem förklarar för utvecklarna varför?"]),
              pb(["“It only sends names”", "”Det skickar bara namn”"], ["The dev lead asks why the whole team is being pulled into a hunt for a package that only sends names. To the developers, half a day of searching looks out of proportion. How do you justify the effort to them?", "Utvecklingsansvarig frågar varför hela teamet dras in i jakten på ett paket som bara skickar namn. För utvecklarna ser en halv dags letande överdrivet ut. Hur motiverar ni insatsen för dem?"]),
              pb(["The list will have gaps", "Listan kommer att ha luckor"], ["Some runners are recreated after every build and keep no logs at all. You may never get a complete list of where the package ran. If you cannot find every machine, what will you treat as found?", "En del byggmaskiner skapas om efter varje bygge och sparar inga loggar alls. Ni kanske aldrig får en fullständig lista över var paketet kördes. Om ni inte kan hitta varje maskin, vad räknar ni då som hittat?"])
            ]
          }),
          opt(["Treat it as harmless research and fix the config", "Behandla det som ofarlig forskning och rätta konfigurationen"], "l1", ["Probably true, and the scope is still unknown.", "Troligen sant, och omfattningen är fortfarande okänd."], {
            pushback: [
              pb(["Harmless, says who?", "Ofarligt enligt vem?"], ["The only evidence that this is research is the package's own README. Anyone can write “security research” in a README. Would you accept that label from any other stranger whose code ran on your servers?", "Det enda beviset för att det är forskning är paketets egen README. Vem som helst kan skriva ”säkerhetsforskning” i en README. Skulle ni godta den etiketten från vilken annan främling som helst vars kod kört på era servrar?"]),
              pb(["Names are a map", "Namn är en karta"], ["The SOC lead points out that a list of variable names tells the sender which machines hold keys and tokens, and what they are called. Nothing was taken, but someone now knows where to look. Is “only names” really harmless?", "SOC-ansvarig påpekar att en lista med variabelnamn berättar för avsändaren vilka maskiner som har nycklar och token, och vad de heter. Inget togs, men någon vet nu var man ska leta. Är ”bara namn” verkligen ofarligt?"]),
              pb(["The fix takes days", "Rättningen tar dagar"], ["Fixing the configuration means touching every project, and that takes days. Meanwhile builds keep running on the old configuration, against a package you have chosen to trust. Who signs off on that risk while the fix rolls out?", "Att rätta konfigurationen innebär att röra varje projekt, och det tar dagar. Under tiden fortsätter byggena på den gamla konfigurationen, mot ett paket ni valt att lita på. Vem tar på sig den risken medan rättningen rullas ut?"])
            ]
          }),
          opt(["Contact the publisher “dc-research”", "Kontakta utgivaren ”dc-research”"], "c3b", ["You might learn a lot. So might they.", "Ni kan få veta mycket. Det kan de också."], {
            pushback: [
              pb(["You tell them who you are", "Ni avslöjar vilka ni är"], ["Writing to the publisher tells them which company owns the machines that answered. Right now they may only have addresses and machine names. Are you prepared to give a stranger your name before you know who they are?", "Ett mejl till utgivaren berättar vilket företag som äger maskinerna som svarade. Just nu kanske de bara har adresser och maskinnamn. Är ni beredda att ge en främling ert namn innan ni vet vem hen är?"]),
              pb(["Legal wants to read it first", "Juristen vill läsa först"], ["Legal asks that nothing is sent until they have read it: anything you write could later be read as an admission, or as permission. That costs an hour or more. Is the conversation worth the delay?", "Juristen vill att inget skickas innan hen har läst det: allt ni skriver kan senare läsas som ett medgivande, eller som ett tillstånd. Det kostar en timme eller mer. Är kontakten värd fördröjningen?"]),
              pb(["Nobody is counting machines", "Ingen räknar maskiner"], ["While you draft a careful email, nobody is working out which machines installed the package. Whatever the publisher answers, it will not tell you where their code ran. Who is doing that work while you wait for a reply?", "Medan ni formulerar ett försiktigt mejl är det ingen som tar reda på vilka maskiner som installerade paketet. Vad utgivaren än svarar kommer det inte att berätta var koden kördes. Vem gör det arbetet medan ni väntar på svar?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The hunt begins", "Jakten börjar"], [
            io(["A fast list", "En snabb lista"], ["Within the hour, the CI logs give a clean list of the runners that installed the package. It feels like real progress, though the laptops are not on it.", "Inom en timme ger CI-loggarna en tydlig lista över maskinerna som installerade paketet. Det känns som ett verkligt framsteg, fast datorerna inte finns med."], ["The CI runners are listed; the laptops are not.", "CI-maskinerna är listade; datorerna är det inte."]),
            io(["Developers object", "Utvecklarna protesterar"], ["Developers are asked to hand over their laptops for checking, with no explanation. Several refuse, the dev lead backs them, and the hunt stalls while everyone argues about it.", "Utvecklarna ombeds lämna in sina datorer för kontroll, utan förklaring. Flera vägrar, utvecklingsansvarig stöttar dem, och jakten står still medan alla bråkar om saken."], ["Developers objected to laptop checks made without an explanation.", "Utvecklarna protesterade mot datorkontroller som gjordes utan förklaring."], { reopen: true }),
            io(["Nobody remembers", "Ingen minns"], ["Asked whether they rebuilt locally this week, some developers say yes, some say no, and many simply do not remember. The laptop list will rest on memory.", "På frågan om de byggt lokalt den här veckan svarar en del ja, en del nej, och många minns helt enkelt inte. Listan över datorer kommer att bygga på minnet."], ["Several developers cannot say whether they rebuilt locally this week.", "Flera utvecklare kan inte säga om de byggt lokalt den här veckan."])
          ]),
          ir("i2", { notChosen: "A" }, ["Nobody is counting", "Ingen räknar"], [
            io(["“Is my laptop affected?”", "”Är min dator drabbad?”"], ["A developer asks in chat whether their laptop is affected, since they rebuilt last night. Nobody in the room can answer, and others start asking the same.", "En utvecklare frågar i chatten om hens dator är drabbad, eftersom hen byggde i går kväll. Ingen i rummet kan svara, och fler börjar fråga samma sak."], ["Developers are asking whether their laptops are affected; nobody can answer.", "Utvecklarna frågar om deras datorer är drabbade; ingen kan svara."]),
            io(["Asked for a number", "Ombedda om en siffra"], ["{{person.ciso.name}} asks how many machines ran the package. The room has no number, not even a rough one, and the CISO says that has to change before anything else.", "{{person.ciso.name}} frågar hur många maskiner som körde paketet. Rummet har ingen siffra, inte ens ungefär, och säkerhetschefen säger att det måste ändras innan något annat."], ["The CISO asked for a count of affected machines and got none.", "Säkerhetschefen bad om antalet drabbade maskiner och fick inget."], { reopen: true }),
            io(["No alarms", "Inga larm"], ["Hours pass and no alert fires on any machine. For some in the room, that settles it: the package must be as harmless as it says.", "Timmar går och inget larm går på någon maskin. För några i rummet avgör det saken: paketet måste vara så ofarligt som det påstår."], ["No alert fired on any machine in the first hours.", "Inget larm gick på någon maskin under de första timmarna."])
          ])
        ]
      }),

      pg("l1", ["Where it ran", "Var det kördes"], [
        "The search takes the morning. The package ran on {{num.runners}} CI runners, on {{num.laptops}} developer laptops whose owners rebuilt locally, and on one release build: last night's build of the desktop agent that customers install.\n\nThe environment variable names it sent include several that are obviously secrets: cloud keys, the registry publish token, a database password.",
        "Sökningen tar förmiddagen. Paketet kördes på {{num.runners}} CI-maskiner, på {{num.laptops}} utvecklardatorer vars ägare byggt lokalt, och i ett releasebygge: gårdagens bygge av den skrivbordsagent som kunderna installerar.\n\nBland namnen på miljövariablerna som skickades finns flera som uppenbart är hemligheter: molnnycklar, registrets publiceringstoken, ett databaslösenord."
      ], {
        long: true,
        skipTo: "c3",
        chart: { id: "b14-kpi", type: "kpi", title: L(["Where it ran", "Var det kördes"]), data: kpi([
          { id: "k1", label: ["CI runners", "CI-maskiner"], value: (v) => v.runners, tone: "warn" },
          { id: "k2", label: ["Developer laptops", "Utvecklardatorer"], value: (v) => v.laptops, tone: "warn" },
          { id: "k3", label: ["Release builds", "Releasebyggen"], value: 1, tone: "danger" }
        ]) },
        choice: ask(["How do you treat those machines?", "Hur hanterar ni de maskinerna?"], ["Rotates every secret those machines held, even though this version only sent names.", "Byter varje hemlighet de maskinerna hade, trots att den här versionen bara skickade namn."], [
          opt(["Rotate every secret on those machines", "Byt varje hemlighet på de maskinerna"], "c3", ["Costs a day. Assumes the next version will be less polite.", "Kostar en dag. Förutsätter att nästa version blir mindre artig."], {
            set: "secretsRotated",
            pushback: [
              pb(["Things will break", "Saker kommer att gå sönder"], ["Cloud keys, the registry token and the database password are used by services nobody has fully mapped. The cloud lead warns that rotating them all at once will break something in production, and nobody knows what. Do you rotate everything today, or stage it and accept the gap?", "Molnnycklarna, registrets token och databaslösenordet används av tjänster som ingen har kartlagt helt. Molnansvarig varnar för att något i produktion går sönder om allt byts på en gång, och ingen vet vad. Byter ni allt i dag, eller i etapper och accepterar glappet?"]),
              pb(["Developers lose the week", "Utvecklarna förlorar veckan"], ["Everyone on the {{num.laptops}} laptops has to sign in again and reconfigure their tools. The dev lead says the team will lose the rest of the week. Is that a proportionate cost for a package that sent only names?", "Alla på de {{num.laptops}} datorerna måste logga in på nytt och ställa om sina verktyg. Utvecklingsansvarig säger att teamet förlorar resten av veckan. Är det en rimlig kostnad för ett paket som bara skickade namn?"]),
              pb(["When are you done?", "När är ni klara?"], ["To rotate every secret on those machines, someone first has to list them. Some live in configuration files, some in environment variables, some on laptops nobody manages centrally. How will you know when you are finished?", "För att byta varje hemlighet på maskinerna måste någon först lista dem. En del finns i konfigurationsfiler, en del i miljövariabler, en del på datorer som ingen förvaltar centralt. Hur vet ni när ni är klara?"])
            ]
          }),
          opt(["Rotate nothing; only names were sent", "Byt ingenting; bara namn skickades"], "c3", ["True today.", "Sant i dag."], {
            pushback: [
              pb(["The release build had them", "Releasebygget hade dem"], ["One of those machines built last night's release of the desktop agent, and its environment held the registry publish token. Anyone who ever gets that token can publish in your name. Is “only names” a strong enough reason to leave it as it is?", "En av maskinerna byggde gårdagens release av skrivbordsagenten, och i dess miljö fanns registrets publiceringstoken. Den som någon gång får tag i den kan publicera i ert namn. Är ”bara namn” ett tillräckligt skäl att låta den vara?"]),
              pb(["Whose name is on it?", "Vems namn står på beslutet?"], ["The CISO wants the decision not to rotate written down with a name on it, because if any of these secrets is ever misused, that will be the first question. Who in the room signs it?", "Säkerhetschefen vill att beslutet att inte byta något skrivs ner med ett namn på, eftersom det blir första frågan om någon av hemligheterna någonsin missbrukas. Vem i rummet skriver under?"]),
              pb(["You read one script", "Ni läste ett skript"], ["You know what the package sent because you read its install script. On the developer laptops, nobody has checked what else was cached or run alongside it. How sure are you that only names left those machines?", "Ni vet vad paketet skickade eftersom ni läste installationsskriptet. På utvecklardatorerna har ingen kontrollerat vad mer som cachats eller körts samtidigt. Hur säkra är ni på att bara namn lämnade de maskinerna?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The rotation", "Bytet"], [
            io(["It goes cleanly", "Det går smidigt"], ["By evening most of the secrets have new values and nothing in production has broken. The cloud lead is surprised, and the room feels it has closed the exposure.", "Till kvällen har de flesta hemligheterna nya värden och inget i produktion har gått sönder. Molnansvarig är förvånad, och rummet känner att exponeringen är stängd."], ["Most secrets were rotated by evening without outages.", "De flesta hemligheter byttes till kvällen utan avbrott."]),
            io(["Production breaks", "Produktionen går sönder"], ["Changing the database password takes a customer-facing service down for most of an hour. Support is flooded, and the cloud lead asks whether the rest should wait.", "Bytet av databaslösenordet tar ner en kundnära tjänst i nästan en timme. Supporten översvämmas, och molnansvarig frågar om resten ska vänta."], ["Rotating the database password caused a customer-facing outage.", "Bytet av databaslösenordet orsakade ett avbrott för kunderna."], { reopen: true, meters: { trust: -1 } }),
            io(["Laptops lag behind", "Datorerna halkar efter"], ["The CI secrets are done, but developers on laptops are still re-signing in and fixing their tools. Nobody can say for certain which old values still sit in local files.", "CI-hemligheterna är klara, men utvecklarna på datorerna loggar fortfarande in på nytt och lagar sina verktyg. Ingen kan säga säkert vilka gamla värden som ligger kvar i lokala filer."], ["Developer laptops are still being reconfigured after the rotation.", "Utvecklardatorerna håller fortfarande på att ställas om efter bytet."])
          ]),
          ir("i2", { notChosen: "A" }, ["The secrets stay", "Hemligheterna ligger kvar"], [
            io(["On the record", "Till protokollet"], ["{{person.ciso.name}} writes the decision down: nothing rotated, because only names were sent. The note is filed with the incident log, with the room's names on it.", "{{person.ciso.name}} skriver ner beslutet: inget byts, eftersom bara namn skickades. Anteckningen läggs i incidentloggen, med rummets namn på."], ["The decision not to rotate is on record with names on it.", "Beslutet att inte byta något är dokumenterat med namn på."]),
            io(["The publish token", "Publiceringstoken"], ["The release manager points out that the registry publish token from the release build can publish packages in your name, and customers update automatically. They will not sign off on leaving it.", "Releaseansvarig påpekar att registrets publiceringstoken från releasebygget kan publicera paket i ert namn, och kunderna uppdaterar automatiskt. Hen vägrar godkänna att den lämnas kvar."], ["The registry publish token was left valid after the first review.", "Registrets publiceringstoken lämnades giltig efter den första genomgången."], { reopen: true }),
            io(["Nothing touches the keys", "Ingen rör nycklarna"], ["The cloud logs show no use of any listed key from outside your network over the first day. It looks as if “only names” was the right call.", "Molnloggarna visar ingen användning av någon listad nyckel utifrån under det första dygnet. Det ser ut som att ”bara namn” var rätt bedömning."], ["No listed key was used from outside in the first day.", "Ingen listad nyckel användes utifrån under det första dygnet."])
          ])
        ]
      }),

      pg("c3", ["The configuration", "Konfigurationen"], [
        "{{person.devLead.name}} finds the root cause in one line of the build configuration. The build tool checks both the internal registry and the public one, and takes the highest version it finds, wherever it comes from.\n\nIt has worked that way for years. Anyone who learned the name of one of your internal packages could have done this at any time.",
        "{{person.devLead.name}} hittar grundorsaken på en rad i byggkonfigurationen. Byggverktyget kontrollerar både det interna registret och det öppna, och tar den högsta version det hittar, var den än kommer ifrån.\n\nDet har fungerat så i flera år. Vem som helst som fått veta namnet på ett av era interna paket kunde ha gjort det här när som helst."
      ], {
        choice: ask(["How do you fix it?", "Hur rättar ni det?"], ["Makes internal names resolve only from the internal registry.", "Ser till att interna namn bara hämtas från det interna registret."], [
          opt(["Internal names may only come from the internal registry", "Interna namn får bara hämtas från det interna registret"], "c4", ["The real fix. Needs every project checked.", "Den verkliga rättningen. Kräver att varje projekt kontrolleras."], {
            set: "scopedRegistry",
            pushback: [
              pb(["Projects nobody owns", "Projekt som ingen äger"], ["The dev lead counts dozens of repositories, each with its own configuration, some owned by teams that no longer exist. Until each one is changed, the old rule still applies there. Who fixes the ones nobody owns, and how long will you wait?", "Utvecklingsansvarig räknar till dussintals kodförråd, vart och ett med egen konfiguration, en del ägda av team som inte längre finns. Tills vart och ett är ändrat gäller den gamla regeln där. Vem rättar dem som ingen äger, och hur länge väntar ni?"]),
              pb(["Builds start failing", "Byggen börjar fallera"], ["The first projects switched over stop building: some internal packages turn out to be named in ways the new rule did not expect. Developers are asking for exceptions. Do you grant them, and does an exception undo the fix?", "De första projekten som ställs om slutar bygga: en del interna paket visar sig vara namngivna på sätt som den nya regeln inte räknade med. Utvecklarna ber om undantag. Beviljar ni dem, och gör ett undantag rättningen meningslös?"]),
              pb(["Laptops have their own settings", "Datorerna har egna inställningar"], ["The change lives in the build servers' configuration. Developer laptops read their own settings files, and nobody can push a change to them centrally. Is the fix done while every laptop can still fetch the stranger's version?", "Ändringen finns i byggservrarnas konfiguration. Utvecklardatorerna läser sina egna inställningsfiler, och ingen kan skicka ut en ändring till dem centralt. Är rättningen klar så länge varje dator fortfarande kan hämta främlingens version?"])
            ]
          }),
          opt(["Pin exact versions everywhere", "Lås exakta versioner överallt"], "c4", ["Helps until someone updates a pin.", "Hjälper tills någon uppdaterar en låsning."], {
            pushback: [
              pb(["The tools suggest 99", "Verktygen föreslår 99"], ["The tooling that keeps pins up to date sees version 99 as the newest and suggests it. A developer has already opened a change that does exactly that, without noticing. How do you stop the fix from undoing itself?", "Verktyget som håller låsningarna uppdaterade ser version 99 som den senaste och föreslår den. En utvecklare har redan öppnat en ändring som gör just det, utan att märka det. Hur hindrar ni rättningen från att upphäva sig själv?"]),
              pb(["The root cause stays", "Grundorsaken finns kvar"], ["The dev lead points out that pinning leaves the line that caused this untouched: the build tool still checks both registries and prefers the higher version. Can you close this incident with the root cause still in place?", "Utvecklingsansvarig påpekar att låsningen lämnar raden som orsakade allt orörd: byggverktyget kollar fortfarande båda registren och föredrar den högre versionen. Kan ni stänga incidenten med grundorsaken kvar?"]),
              pb(["Patches fall behind", "Säkerhetsrättningar halkar efter"], ["Pinning every dependency means thousands of entries to maintain, and every security fix in a public package now needs a manual update. Developers warn that patches will fall behind. Have you traded one risk for another?", "Att låsa varje beroende innebär tusentals poster att underhålla, och varje säkerhetsrättning i ett öppet paket kräver nu en manuell uppdatering. Utvecklarna varnar för att rättningarna kommer att halka efter. Har ni bytt en risk mot en annan?"])
            ]
          }),
          opt(["Block the public registry entirely", "Blockera det öppna registret helt"], "c4", ["Safe and stops most development.", "Säkert och stoppar det mesta av utvecklingen."], {
            pushback: [
              pb(["Nothing builds", "Ingenting bygger"], ["Most of your software depends on public packages. Within an hour every new build fails, and the release team says no customer fix can ship until the block is lifted. How long can you run like this, and who decides when it ends?", "Det mesta av er programvara bygger på öppna paket. Inom en timme fallerar varje nytt bygge, och releaseteamet säger att ingen kundrättning kan levereras förrän blockeringen hävs. Hur länge klarar ni det, och vem bestämmer när det tar slut?"]),
              pb(["Packages by hand", "Paket för hand"], ["The dev lead hears that some developers are downloading packages at home and copying them in by hand to keep working. The block has created a route with no checks at all. Do you tolerate it, or tighten further?", "Utvecklingsansvarig får höra att en del utvecklare laddar ner paket hemma och kopierar in dem för hand för att kunna jobba. Blockeringen har skapat en väg helt utan kontroller. Tolererar ni det, eller stramar ni åt ännu mer?"]),
              pb(["When the block lifts", "När blockeringen hävs"], ["The day the block is lifted, the build tool still takes the highest version from anywhere. Nothing in the configuration has changed. Is this a fix, or a pause before the same problem comes back?", "Den dag blockeringen hävs tar byggverktyget fortfarande den högsta versionen varifrån som helst. Ingenting i konfigurationen har ändrats. Är det här en rättning, eller en paus innan samma problem kommer tillbaka?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The scoped rollout", "Utrullningen"], [
            io(["Builds go green", "Byggena blir gröna"], ["The first projects switch over and build cleanly, taking the internal package from the internal registry. The dev lead says the rest should follow within days.", "De första projekten ställs om och bygger utan problem, med det interna paketet från det interna registret. Utvecklingsansvarig säger att resten bör följa inom några dagar."], ["The first projects build cleanly with the scoped configuration.", "De första projekten bygger utan problem med den nya konfigurationen."]),
            io(["Old projects, own copies", "Gamla projekt, egna kopior"], ["The rollout finds old projects that carry their own copy of the build configuration. The fix does not reach them, and nobody owns several of them any more.", "Utrullningen hittar gamla projekt som har en egen kopia av byggkonfigurationen. Rättningen når inte dem, och flera av dem har ingen ägare längre."], ["Some old projects carry their own config the fix does not reach.", "En del gamla projekt har en egen konfiguration som rättningen inte når."]),
            io(["A name that is both", "Ett namn som är båda"], ["One internal name turns out to be a real, popular public package too, used by one team. Scoping it breaks their build, and they ask which one they were meant to get.", "Ett internt namn visar sig också vara ett riktigt, populärt öppet paket som ett team använder. När namnet låses går deras bygge sönder, och de frågar vilket paket de egentligen skulle ha."], ["One internal name clashes with a real public package some teams use.", "Ett internt namn krockar med ett riktigt öppet paket som en del team använder."])
          ]),
          ir("i2", { notChosen: "A" }, ["The source stays open", "Källan står öppen"], [
            io(["The gap remains", "Luckan finns kvar"], ["The dev lead points out that for any new dependency, the tool still takes the highest version from any source. Today's change protects what you have, not what comes next.", "Utvecklingsansvarig påpekar att verktyget, för varje nytt beroende, fortfarande tar den högsta versionen från vilken källa som helst. Dagens ändring skyddar det ni har, inte det som kommer."], ["The build configuration still accepts the highest version from any source.", "Byggkonfigurationen tar fortfarande den högsta versionen från vilken källa som helst."]),
            io(["The CISO's question", "Säkerhetschefens fråga"], ["{{person.ciso.name}} asks what stops the next internal name being taken tomorrow, in a project created next month. Nobody has an answer that covers it.", "{{person.ciso.name}} frågar vad som hindrar att nästa interna namn kapas i morgon, i ett projekt som skapas nästa månad. Ingen har ett svar som täcker det."], ["Nobody can say what protects projects created after today.", "Ingen kan säga vad som skyddar projekt som skapas efter i dag."], { reopen: true }),
            io(["It seems to work", "Det verkar fungera"], ["In the first hours after the change, no CI build pulls an internal name from the public registry. The room starts to treat the problem as fixed.", "Under de första timmarna efter ändringen hämtar inget CI-bygge något internt namn från det öppna registret. Rummet börjar behandla problemet som löst."], ["No CI build pulled an internal name publicly in the first hours.", "Inget CI-bygge hämtade ett internt namn öppet under de första timmarna."])
          ])
        ]
      }),

      pg("c3b", ["The publisher", "Utgivaren"], [
        "The reply comes within an hour, polite and quick. The publisher is a security researcher who tests companies for this exact weakness. They say the package was harmless by design, that they will delete it, and that they found your internal name in a public job advert.\n\nThey ask whether you run a bug bounty, and mention that they plan to publish a write-up about the technique next month.",
        "Svaret kommer inom en timme, artigt och snabbt. Utgivaren är en säkerhetsforskare som testar företag för just den här svagheten. Hen säger att paketet var ofarligt med flit, att hen kommer att radera det och att hen hittade ert interna namn i en öppen platsannons.\n\nHen frågar om ni har ett belöningsprogram för sårbarheter, och nämner att hen planerar att publicera en genomgång av tekniken nästa månad."
      ], {
        injects: [
          inj("b14-3", 120, "email", "employee", "medium", "unverified", [
            "“I'm an independent researcher. The package only collected names to prove the issue, and I'll remove it today. I found your package name in a job advert. Do you have a bug bounty? I'm writing this up next month.”",
            "”Jag är en oberoende forskare. Paketet samlade bara in namn för att bevisa problemet, och jag tar bort det i dag. Jag hittade ert paketnamn i en platsannons. Har ni ett belöningsprogram för sårbarheter? Jag skriver om det här nästa månad.”"
          ], { headline: ["From: dc-research", "Från: dc-research"], tests: ["lo3"] })
        ],
        choice: ask(["How do you respond to the researcher?", "Hur bemöter ni forskaren?"], ["Engages in good faith while verifying, and agrees a disclosure timeline.", "Bemöter i god tro men kontrollerar, och kommer överens om en tidsplan för publicering."], [
          opt(["Thank them, verify their claims, and agree a disclosure date", "Tacka, kontrollera påståendena och kom överens om ett publiceringsdatum"], "c4", ["Turns a risk into a partner.", "Gör en risk till en partner."], {
            set: "researcherEngaged",
            pushback: [
              pb(["Verify what, exactly?", "Kontrollera vad, exakt?"], ["The researcher is an account name and an email address, nothing more. You cannot confirm who they are, or that this is the only package they published. What exactly will you verify, and what do you do if you can't?", "Forskaren är ett kontonamn och en e-postadress, inget mer. Ni kan inte bekräfta vem hen är, eller att det här är det enda paket hen har publicerat. Vad exakt ska ni kontrollera, och vad gör ni om ni inte kan?"]),
              pb(["Thanks in writing", "Ett tack i skrift"], ["Legal warns that thanking the researcher and agreeing a date could look like approving what they did on your servers, and weaken any claim later. Do you still want to thank them in writing?", "Juristen varnar för att ett tack och ett överenskommet datum kan se ut som att ni godkänner det hen gjorde på era servrar, och försvaga ett eventuellt krav senare. Vill ni ändå tacka hen skriftligt?"]),
              pb(["Their date, your readiness", "Deras datum, er beredskap"], ["The researcher wants to publish next month as planned. The dev lead doubts every project's configuration can be fixed by then. Do you accept their timeline, or ask for more time and risk the goodwill?", "Forskaren vill publicera nästa månad som planerat. Utvecklingsansvarig tvivlar på att varje projekts konfiguration hinner rättas till dess. Godtar ni deras tidsplan, eller ber ni om mer tid och riskerar den goda viljan?"])
            ]
          }),
          opt(["Tell them their actions were unlawful and demand silence", "Säg att agerandet var olagligt och kräv tystnad"], "c4", ["They will publish anyway, and mention this email.", "Hen kommer att publicera ändå, och nämna det här mejlet."], {
            effects: { media: 1 }, set: "threatened",
            pushback: [
              pb(["A sentence in print", "En mening i tryck"], ["The researcher is writing this up next month, and your email will now be part of it, quoted word for word. Read your demand aloud as a quote in someone else's article. Is it a sentence you are willing to see in public?", "Forskaren skriver om det här nästa månad, och ert mejl blir nu en del av texten, ordagrant citerat. Läs ert krav högt som ett citat i någon annans artikel. Är det en mening ni är beredda att se offentligt?"]),
              pb(["The only source you had", "Den enda källa ni hade"], ["The CISO says the researcher is the only person who has told you anything useful today, and the threat ends that. You still don't know everything their package touched. Who do you ask now?", "Säkerhetschefen säger att forskaren är den enda som har berättat något användbart i dag, och hotet sätter stopp för det. Ni vet fortfarande inte allt som paketet berörde. Vem frågar ni nu?"]),
              pb(["Your servers fetched it", "Era servrar hämtade det"], ["Legal can say it may have been unlawful, not that it was: your build servers went out and fetched the package themselves, as configured. Are you ready to argue that in public, against someone who will point that out?", "Juristen kan säga att det kan ha varit olagligt, inte att det var det: era byggservrar gick ut och hämtade paketet själva, enligt er konfiguration. Är ni beredda att driva det offentligt, mot någon som kommer att påpeka just det?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Good faith, in writing", "God tro, skriftligt"], [
            io(["The claims check out", "Påståendena stämmer"], ["The researcher sends the list of machine names that called back. It matches your CI logs line by line, and the room starts to trust them.", "Forskaren skickar listan över maskinnamnen som hörde av sig. Den stämmer rad för rad med era CI-loggar, och rummet börjar lita på hen."], ["The researcher's machine list matches your CI logs.", "Forskarens lista över maskiner stämmer med era CI-loggar."]),
            io(["Legal objects", "Juristen invänder"], ["{{person.legal.name}} reads the reply after it was sent and objects: an agreed disclosure date in writing could be read as consent to the test. Legal wants the agreement reworded.", "{{person.legal.name}} läser svaret efter att det skickats och invänder: ett skriftligt överenskommet publiceringsdatum kan läsas som ett samtycke till testet. Juristen vill att överenskommelsen formuleras om."], ["Legal has objected to the written disclosure agreement.", "Juristen har invänt mot den skriftliga överenskommelsen om publicering."], { reopen: true }),
            io(["Asking for more", "Hen vill ha mer"], ["The researcher accepts the date but asks about a reward before confirming it. Some in the room hear a fair question; others hear pressure.", "Forskaren godtar datumet men frågar om en belöning innan hen bekräftar det. En del i rummet hör en rimlig fråga; andra hör påtryckning."], ["The researcher raised a reward before confirming the date.", "Forskaren tog upp en belöning innan datumet bekräftades."])
          ]),
          ir("i2", { notChosen: "A" }, ["The legal email", "Det juridiska mejlet"], [
            io(["Silence", "Tystnad"], ["No reply comes that day. Nobody can tell whether the researcher is talking to a lawyer, writing faster, or simply ignoring you.", "Inget svar kommer den dagen. Ingen kan avgöra om forskaren pratar med en advokat, skriver snabbare eller bara struntar i er."], ["The researcher did not reply on the first day.", "Forskaren svarade inte under den första dagen."]),
            io(["Word gets around", "Det sprids"], ["Another security researcher writes to your general address asking whether you really threatened dc-research. Someone has already told them.", "En annan säkerhetsforskare skriver till er allmänna adress och frågar om ni verkligen hotade dc-research. Någon har redan berättat det."], ["Other researchers have heard about your legal email.", "Andra forskare har hört talas om ert juridiska mejl."], { reopen: true, meters: { media: 1 } }),
            io(["The package disappears", "Paketet försvinner"], ["Version 99.0.0 vanishes from the public registry, with no reply. It may be compliance, or someone covering their tracks.", "Version 99.0.0 försvinner från det öppna registret, utan något svar. Det kan vara att hen rättar sig, eller att någon sopar igen spåren."], ["Version 99.0.0 has been removed from the public registry.", "Version 99.0.0 har tagits bort från det öppna registret."])
          ])
        ]
      }),

      pg("c4", ["Version 99.0.1", "Version 99.0.1"], [
        "{{time.T+1440|weekday|cap}}. A new version appears on the public registry: 99.0.1, published from a different account. This one is not polite. Its install script sends the values of environment variables, not just their names, and leaves a small program behind that calls home every hour.\n\nSomeone has read the same job advert, or the researcher's package, and copied the idea.",
        "{{time.T+1440|weekday|cap}}. En ny version dyker upp i det öppna registret: 99.0.1, publicerad från ett annat konto. Den här är inte artig. Dess installationsskript skickar miljövariablernas värden, inte bara namnen, och lämnar kvar ett litet program som hör av sig varje timme.\n\nNågon har läst samma platsannons, eller forskarens paket, och kopierat idén."
      ], {
        variants: [vr("buildsFrozen", [
          "{{time.T+1440|weekday|cap}}. A new version appears on the public registry: 99.0.1, from a different account. Its install script sends the values of environment variables and leaves a program behind that calls home every hour.\n\nBecause builds were frozen yesterday, none of your machines has pulled it. Someone has copied the idea, and the only reason you are not their victim is that nothing has built since.",
          "{{time.T+1440|weekday|cap}}. En ny version dyker upp i det öppna registret: 99.0.1, från ett annat konto. Dess installationsskript skickar miljövariablernas värden och lämnar kvar ett program som hör av sig varje timme.\n\nEftersom byggena frystes i går har ingen av era maskiner hämtat den. Någon har kopierat idén, och den enda anledningen till att ni inte är offer är att inget har byggts sedan dess."
        ], ["Because builds were frozen, the hostile version never reached you.", "Eftersom byggena frystes nådde den fientliga versionen aldrig er."])],
        injects: [
          inj("b14-4", 1440, "threatIntel", "threatIntel", "high", "confirmed", [
            "{{org.shortName|lower}}-auth-utils@99.0.1 (new publisher): exfiltrates environment variable values, installs an hourly beacon to {{asset.c2Domain}}. Removed by the registry after 5 hours.",
            "{{org.shortName|lower}}-auth-utils@99.0.1 (ny utgivare): för ut miljövariablernas värden, installerar en anropare som hör av sig varje timme till {{asset.c2Domain}}. Borttagen av registret efter 5 timmar."
          ], { tests: ["lo1"] })
        ],
        choice: ask(["What do you do about the hostile version?", "Vad gör ni åt den fientliga versionen?"], ["Hunts for the beacon on every machine that built in the last day and reports the package.", "Letar efter anroparen på varje maskin som byggt det senaste dygnet och rapporterar paketet."], [
          opt(["Hunt for the beacon and report the package to the registry and {{reg.csirt}}", "Leta efter anroparen och rapportera paketet till registret och {{reg.csirt}}"], "l2", ["Protects you and others.", "Skyddar er och andra."], {
            pushback: [
              pb(["Machines that no longer exist", "Maskiner som inte finns längre"], ["The hostile version was live for hours. To find the beacon you must check every machine that built in that window, including laptops at home and runners already recreated. What do you do about machines you can no longer examine?", "Den fientliga versionen var aktiv i flera timmar. För att hitta anroparen måste ni kontrollera varje maskin som byggde under den tiden, även datorer hemma och byggmaskiner som redan skapats om. Vad gör ni med maskiner ni inte längre kan undersöka?"]),
              pb(["Reporting brings questions", "En rapport väcker frågor"], ["Reporting to {{reg.csirt}} means they will ask what reached you, what you shipped and when you knew. You do not have those answers yet. Do you report now with gaps, or wait until you can answer?", "En rapport till {{reg.csirt}} innebär att de frågar vad som nådde er, vad ni levererat och när ni visste. De svaren har ni inte ännu. Rapporterar ni nu med luckor, eller väntar ni tills ni kan svara?"]),
              pb(["Hold the machines", "Behåll maskinerna"], ["A proper hunt means keeping machines exactly as they are for analysis. Developers want their runners and laptops back, and the release team wants to ship. How long do you hold everything for a beacon you may never find?", "En ordentlig jakt kräver att maskinerna behålls precis som de är för analys. Utvecklarna vill ha tillbaka sina byggmaskiner och datorer, och releaseteamet vill leverera. Hur länge håller ni kvar allt för en anropare ni kanske aldrig hittar?"])
            ]
          }),
          opt(["Report the package and assume your fix kept it out", "Rapportera paketet och anta att er rättning höll det ute"], "l2", ["Maybe it did.", "Kanske gjorde den det."], {
            pushback: [
              pb(["Evidence, not assumption", "Bevis, inte antagande"], ["Your fix was made on the build servers. Nobody has checked every developer laptop or every old project that might still use the old settings. What evidence can you name that 99.0.1 never ran anywhere of yours?", "Er rättning gjordes på byggservrarna. Ingen har kontrollerat varje utvecklardator eller varje gammalt projekt som kan ha kvar de gamla inställningarna. Vilket bevis kan ni peka på för att 99.0.1 aldrig kördes någonstans hos er?"]),
              pb(["The SOC lead objects", "SOC-ansvarig invänder"], ["The SOC lead says an hourly beacon is exactly what you only find by looking, and that “assume” is not a finding. They ask for a day to check. Do you overrule them?", "SOC-ansvarig säger att en anropare som hör av sig varje timme är precis sådant man bara hittar genom att leta, och att ”anta” inte är ett resultat. Hen ber om en dag för att kontrollera. Kör ni över hen?"]),
              pb(["“We assume not”", "”Vi antar att inte”"], ["If a customer asks whether the hostile version touched your builds, “we assume not” is the only answer you will have. Would you accept that answer from one of your own suppliers?", "Om en kund frågar om den fientliga versionen nådde era byggen är ”vi antar att inte” det enda svar ni har. Skulle ni godta det svaret från en av era egna leverantörer?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The beacon hunt", "Jakten på anroparen"], [
            io(["CI is clean", "CI är rent"], ["The hunt across the CI runners finds no trace of the beacon. The room breathes out, and someone suggests calling it done.", "Genomsökningen av CI-maskinerna hittar inga spår av anroparen. Rummet andas ut, och någon föreslår att ni ska kalla det klart."], ["The beacon hunt found nothing on the CI runners.", "Jakten hittade ingen anropare på CI-maskinerna."]),
            io(["Laptops out of reach", "Datorer utom räckhåll"], ["Several developer laptops are offline, at home or travelling, and cannot be checked today. The hunt stops at the edge of the office network.", "Flera utvecklardatorer är avstängda, hemma eller på resa, och kan inte kontrolleras i dag. Jakten tar slut vid kanten av kontorsnätet."], ["Several developer laptops could not be checked on the first day.", "Flera utvecklardatorer kunde inte kontrolleras under den första dagen."]),
            io(["One lookup", "En uppslagning"], ["The DNS logs show one lookup of {{asset.c2Domain}} from the office network, with no clear source. The SOC lead suspects a colleague looking the domain up, but cannot prove it.", "DNS-loggarna visar en uppslagning av {{asset.c2Domain}} från kontorsnätet, utan tydlig källa. SOC-ansvarig misstänker att en kollega slog upp domänen, men kan inte bevisa det."], ["One lookup of the beacon's domain came from the office; source unknown.", "En uppslagning av anroparens domän kom från kontoret; källan är okänd."])
          ]),
          ir("i2", { notChosen: "A" }, ["Nobody looked", "Ingen letade"], [
            io(["The CSIRT asks", "CSIRT frågar"], ["{{reg.csirt}} thanks you for the report and asks one question back: have you checked your own machines for the beacon? You cannot say yes.", "{{reg.csirt}} tackar för rapporten och ställer en motfråga: har ni kontrollerat era egna maskiner efter anroparen? Ni kan inte svara ja."], ["{{reg.csirt}} asked whether your machines were checked; you could not say.", "{{reg.csirt}} frågade om era maskiner kontrollerats; ni kunde inte svara."], { reopen: true, meters: { regulator: 1 } }),
            io(["The logs look clean", "Loggarna ser rena ut"], ["The CI logs show no build resolved version 99.0.1. It seems to prove the fix held, and the room moves on.", "CI-loggarna visar att inget bygge hämtade version 99.0.1. Det verkar bevisa att rättningen höll, och rummet går vidare."], ["CI logs show no build resolved version 99.0.1.", "CI-loggarna visar att inget bygge hämtade version 99.0.1."]),
            io(["Five hours", "Fem timmar"], ["The registry removes the hostile version, but it was public for five hours. Nobody on your side knows who installed it in that time.", "Registret tar bort den fientliga versionen, men den låg ute i fem timmar. Ingen hos er vet vem som installerade den under den tiden."], ["The hostile version was public for hours; who installed it is unknown.", "Den fientliga versionen låg ute i timmar; vem som installerade den är okänt."])
          ])
        ]
      }),

      pg("l2", ["Other names", "Andra namn"], [
        "{{person.devLead.name}} lists every internal package name and checks the public registry for each. {{num.names}} of them are free for anyone to register today.\n\nSeveral appear in public job adverts, conference talks and error messages visible in the customer agent. Your internal names are not secret, and never were.",
        "{{person.devLead.name}} listar varje internt paketnamn och kontrollerar det öppna registret för vart och ett. {{num.names}} av dem är lediga för vem som helst att registrera i dag.\n\nFlera förekommer i öppna platsannonser, konferensföredrag och felmeddelanden som syns i kundagenten. Era interna namn är inte hemliga, och har aldrig varit det."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about the other names?", "Vad gör ni med de andra namnen?"], ["Reserves the names publicly as placeholders and moves internal packages under a protected scope.", "Reserverar namnen publikt som platshållare och flyttar interna paket under ett skyddat namnområde."], [
          opt(["Reserve them publicly as empty placeholders", "Reservera dem publikt som tomma platshållare"], "c5", ["Cheap and effective.", "Billigt och effektivt."], {
            set: "namesClaimed",
            pushback: [
              pb(["Who maintains the placeholders?", "Vem förvaltar platshållarna?"], ["There are {{num.names}} free names, and the same trick works on more than one public registry. Someone has to register them all, under a company account, and keep them up to date as new internal packages appear. Who owns that from tomorrow?", "Det finns {{num.names}} lediga namn, och samma trick fungerar i mer än ett öppet register. Någon måste registrera alla, under ett företagskonto, och hålla dem aktuella när nya interna paket tillkommer. Vem äger det från och med i morgon?"]),
              pb(["Your list, in public", "Er lista, offentligt"], ["Registering placeholders under your company's account shows anyone every internal package name you use, all in one place. The dev lead calls it a shopping list for the next attacker. Do you go ahead?", "Att registrera platshållare under företagets konto visar vem som helst alla interna paketnamn ni använder, samlade på ett ställe. Utvecklingsansvarig kallar det en inköpslista åt nästa angripare. Kör ni ändå?"]),
              pb(["The registry may remove them", "Registret kan ta bort dem"], ["The public registry's rules discourage empty placeholder packages, and it may remove them without warning. Then the names are free again, and nobody on your side will notice. Do you rely on a protection someone else can take away?", "Det öppna registrets regler avråder från tomma platshållarpaket, och de kan tas bort utan förvarning. Då är namnen lediga igen, och ingen hos er märker det. Förlitar ni er på ett skydd som någon annan kan ta bort?"])
            ]
          }),
          opt(["Rely on the configuration fix alone", "Lita enbart på rättningen av konfigurationen"], "c5", ["Fine, if every project got the fix.", "Bra, om varje projekt fick rättningen."], {
            pushback: [
              pb(["“Almost every project”", "”Nästan varje projekt”"], ["The configuration fix protects only projects that have it. The dev lead cannot yet say that every repository, laptop and old branch has been changed. With {{num.names}} names free today, is “almost every” good enough?", "Rättningen av konfigurationen skyddar bara de projekt som har fått den. Utvecklingsansvarig kan ännu inte säga att varje kodförråd, dator och gammal gren är ändrad. Med {{num.names}} lediga namn i dag, räcker ”nästan varje”?"]),
              pb(["The next new project", "Nästa nya projekt"], ["Every new project starts from the default configuration. Next month someone will create one that trusts any source, and the names will still be free for anyone to take. Who catches that?", "Varje nytt projekt utgår från standardkonfigurationen. Nästa månad skapar någon ett som litar på vilken källa som helst, och namnen är fortfarande lediga för vem som helst. Vem fångar upp det?"]),
              pb(["One line again", "En rad igen"], ["The CISO points out that a single line of configuration nobody looked at for years is how you got here. Now one line is supposed to be the whole defence. Why should a single line be enough this time?", "Säkerhetschefen påpekar att en enda konfigurationsrad som ingen tittat på på flera år är anledningen till att ni är här. Nu ska en rad vara hela skyddet. Varför skulle en enda rad räcka den här gången?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The placeholders", "Platshållarna"], [
            io(["Names secured", "Namnen säkrade"], ["By the afternoon every free internal name has an empty placeholder on the public registry. It cost almost nothing, and the room feels the door is shut.", "Till eftermiddagen har varje ledigt internt namn en tom platshållare i det öppna registret. Det kostade nästan ingenting, och rummet känner att dörren är stängd."], ["The free internal names are now reserved publicly.", "De lediga interna namnen är nu reserverade publikt."]),
            io(["Flagged as squatting", "Flaggade som namnockupation"], ["The public registry's automated checks flag your empty packages as name-squatting and suspend a batch of them. The names are free again until someone reviews your appeal.", "Det öppna registrets automatiska kontroller flaggar era tomma paket som namnockupation och stänger av en del av dem. Namnen är lediga igen tills någon granskar ert överklagande."], ["The registry suspended some placeholders as name-squatting.", "Registret stängde av en del platshållare som namnockupation."], { reopen: true }),
            io(["Someone was faster", "Någon var snabbare"], ["One of the names was registered by an unknown account an hour before you got to it. The package is empty, for now.", "Ett av namnen registrerades av ett okänt konto en timme innan ni hann dit. Paketet är tomt, än så länge."], ["One internal name was registered by an unknown account just before you.", "Ett internt namn registrerades av ett okänt konto strax före er."])
          ]),
          ir("i2", { notChosen: "A" }, ["The names stay free", "Namnen förblir lediga"], [
            io(["A name is taken", "Ett namn tas"], ["An unknown account registers one of your free internal names, with an empty package. Nothing is in it yet, and nobody knows who is behind it.", "Ett okänt konto registrerar ett av era lediga interna namn, med ett tomt paket. Det finns inget i det än, och ingen vet vem som ligger bakom."], ["An unknown account registered one of your free internal names.", "Ett okänt konto registrerade ett av era lediga interna namn."], { reopen: true }),
            io(["The fix holds", "Rättningen håller"], ["The dev lead runs a test: a project with a deliberately clashing public name still gets the internal package. The configuration fix seems to be enough.", "Utvecklingsansvarig kör ett test: ett projekt med ett avsiktligt krockande öppet namn får ändå det interna paketet. Rättningen av konfigurationen verkar räcka."], ["A test showed the build picks the internal package over a public one.", "Ett test visade att bygget väljer det interna paketet framför ett öppet."]),
            io(["An archived project", "Ett arkiverat projekt"], ["An archived project turns up that still uses the old build configuration. Nobody knows whether anyone still builds it.", "Ett arkiverat projekt dyker upp som fortfarande använder den gamla byggkonfigurationen. Ingen vet om någon fortfarande bygger det."], ["An archived project still uses the old build configuration.", "Ett arkiverat projekt använder fortfarande den gamla byggkonfigurationen."])
          ])
        ]
      }),

      pg("c5", ["The agent you shipped", "Agenten ni levererade"], [
        "The release build from two nights ago went out to customers as an automatic update of the desktop agent. It includes the researcher's harmless package, which ran once during the build, not on customers' machines.\n\nNothing malicious reached customers. But {{num.customers|number}} organisations are running a build that pulled code from a stranger, and some of them have strict supplier rules.",
        "Releasebygget från för två nätter sedan gick ut till kunderna som en automatisk uppdatering av skrivbordsagenten. Det innehåller forskarens ofarliga paket, som kördes en gång under bygget, inte på kundernas maskiner.\n\nInget skadligt nådde kunderna. Men {{num.customers|number}} organisationer kör ett bygge som hämtade kod från en främling, och en del av dem har strikta leverantörskrav."
      ], {
        discuss: [q("Is a build that pulled harmless foreign code a problem for customers, or only for you?", "Är ett bygge som hämtade ofarlig främmande kod ett problem för kunderna, eller bara för er?", ["serviceOwner", "legal"])],
        choice: ask(["What do you do about the shipped agent?", "Vad gör ni med den levererade agenten?"], ["Rebuilds cleanly, ships an update, and tells customers plainly what happened.", "Bygger om rent, levererar en uppdatering och berättar tydligt för kunderna vad som hände."], [
          opt(["Rebuild, ship a clean update, and tell customers what happened", "Bygg om, leverera en ren uppdatering och berätta för kunderna vad som hände"], "l3", ["Honest and reassuring.", "Ärligt och lugnande."], {
            effects: { trust: 1 }, set: "disclosed",
            pushback: [
              pb(["Customers pause updates", "Kunderna pausar uppdateringar"], ["Once told the agent was built with a stranger's code, some customers pause automatic updates, including the clean one. They stay on the very build you want to replace. How do you get them to install a fix from a build process you just told them to doubt?", "När kunderna får veta att agenten byggdes med en främlings kod pausar en del de automatiska uppdateringarna, även den rena. De stannar på just det bygge ni vill ersätta. Hur får ni dem att installera en rättning från en byggprocess ni just bett dem tvivla på?"]),
              pb(["Renewals are coming", "Avtal ska förnyas"], ["The service owner says several large contracts are up for renewal, and a message about foreign code in the agent will land with procurement, not security teams. They ask for softer wording. How far do you soften it before it stops being plain?", "Tjänsteägaren säger att flera stora avtal ska förnyas, och ett besked om främmande kod i agenten hamnar hos inköp, inte hos säkerhetsteamen. Hen vill ha mjukare formuleringar. Hur mycket mjukar ni upp innan det slutar vara tydligt?"]),
              pb(["Clean, on what?", "Rent, på vad?"], ["A clean rebuild needs a build chain you trust. Not every project has the configuration fix yet, and nobody is sure which runner the rebuild will land on. Can you honestly promise customers a clean build today?", "Ett rent ombygge kräver en byggkedja ni litar på. Alla projekt har inte fått rättningen ännu, och ingen vet säkert vilken byggmaskin ombygget hamnar på. Kan ni ärligt lova kunderna ett rent bygge i dag?"])
            ]
          }),
          opt(["Rebuild and ship quietly as a routine update", "Bygg om och leverera i tysthet som en vanlig uppdatering"], "l3", ["Clean, and customers may learn from the write-up.", "Rent, och kunderna kan få veta det från forskarens text."], {
            effects: { trust: -1 },
            pushback: [
              pb(["“Routine”, in print", "”Rutin”, i tryck"], ["Customers who later learn what happened will compare dates with your release notes. Next to the build that pulled a stranger's code, they will find the word “routine”. What will you say when they ask why?", "Kunder som senare får veta vad som hände kommer att jämföra datum med era releaseanteckningar. Bredvid bygget som hämtade en främlings kod hittar de ordet ”rutin”. Vad säger ni när de frågar varför?"]),
              pb(["Supplier rules", "Leverantörskrav"], ["Some customers' contracts require you to tell them about security events affecting the product. Legal is not sure this qualifies, but is sure that silence will be read as a choice. Who decides it doesn't qualify, and on what basis?", "En del kunders avtal kräver att ni berättar om säkerhetshändelser som berör produkten. Juristen är osäker på om det här räknas, men säker på att tystnad kommer att tolkas som ett val. Vem avgör att det inte räknas, och på vilka grunder?"]),
              pb(["Too many people know", "För många vet"], ["Dozens of developers spent the week in these build logs. A release note saying “routine maintenance” will be read by people who know it isn't. Can a quiet update really stay quiet?", "Dussintals utvecklare har tillbringat veckan i de här byggloggarna. En releaseanteckning om ”rutinunderhåll” kommer att läsas av folk som vet att det inte stämmer. Kan en tyst uppdatering verkligen förbli tyst?"])
            ]
          }),
          opt(["Unfreeze builds now to ship the customer release; the hunt continues in parallel", "Häv byggstoppet nu för att leverera kundreleasen; jakten fortsätter parallellt"], "l3", ["Reverses your freeze before you know the build chain is clean.", "Upphäver ert stopp innan ni vet att byggkedjan är ren."], {
            requires: "buildsFrozen", set: "buildsUnfrozen", effects: { trust: -1 },
            pushback: [
              pb(["Which runner builds it?", "Vilken maskin bygger den?"], ["The hunt for the hostile version is not finished. Lifting the freeze means the release may be built on a runner nobody has cleared yet. Which runner builds it, and who is willing to vouch for it?", "Jakten på den fientliga versionen är inte klar. Att häva stoppet innebär att releasen kan byggas på en maskin som ingen har friat ännu. Vilken maskin bygger den, och vem är beredd att gå i god för den?"]),
              pb(["Everyone wants an exception", "Alla vill ha undantag"], ["The moment the freeze lifts for the customer release, every other team asks for the same. The dev lead says one exception means no freeze. Do you reopen everything, or hold the line for all but one release?", "I samma stund som stoppet hävs för kundreleasen ber varje annat team om detsamma. Utvecklingsansvarig säger att ett undantag betyder inget stopp. Öppnar ni för allt, eller håller ni emot för allt utom en release?"]),
              pb(["If this one is wrong", "Om den här blir fel"], ["You would ship a release built while the build chain is still under investigation, to customers already running a build that pulled a stranger's code. If something is wrong with this one too, what do you tell them?", "Ni skulle leverera en release byggd medan byggkedjan fortfarande utreds, till kunder som redan kör ett bygge som hämtat en främlings kod. Om även den här visar sig vara fel, vad säger ni då till dem?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Telling the customers", "Kunderna får veta"], [
            io(["Customers say thank you", "Kunderna tackar"], ["Several customer security teams reply within hours, thanking you for telling them directly. One says it is the clearest supplier notice they have had this year.", "Flera av kundernas säkerhetsteam svarar inom några timmar och tackar för att ni berättade direkt. Ett av dem säger att det är det tydligaste leverantörsbesked de fått i år."], ["Several customers thanked you for telling them directly.", "Flera kunder tackade för att ni berättade direkt."]),
            io(["Updates paused", "Uppdateringarna pausas"], ["A large customer with strict supplier rules pauses all agent updates and demands a formal incident report under the contract before it resumes.", "En stor kund med strikta leverantörskrav pausar alla uppdateringar av agenten och kräver en formell incidentrapport enligt avtalet innan de fortsätter."], ["A large customer paused updates pending a formal incident report.", "En stor kund har pausat uppdateringarna i väntan på en formell incidentrapport."], { meters: { trust: -1 } }),
            io(["The list you don't have", "Listan ni saknar"], ["Customers ask for the full list of components in the agent. You do not have one ready, and producing it will take days.", "Kunderna ber om en fullständig lista över komponenterna i agenten. Ni har ingen färdig, och att ta fram den kommer att ta dagar."], ["Customers asked for a full component list you do not yet have.", "Kunderna har bett om en komponentlista som ni ännu inte har."])
          ]),
          ir("i2", { notChosen: "A" }, ["Without a word", "Utan ett ord"], [
            io(["A customer notices", "En kund märker det"], ["A customer's security team spots the unscheduled update and asks what it fixed. Whatever you answer now will be compared with what the write-up says later.", "En kunds säkerhetsteam lägger märke till den oplanerade uppdateringen och frågar vad den rättade. Vad ni än svarar nu kommer att jämföras med vad texten säger senare."], ["A customer has asked what the unscheduled update fixed.", "En kund har frågat vad den oplanerade uppdateringen rättade."], { reopen: true }),
            io(["Nobody asks", "Ingen frågar"], ["The release goes out and not one customer asks about it. Some in the room take that as proof that saying nothing was right.", "Releasen går ut och inte en enda kund frågar om den. Några i rummet tar det som bevis för att det var rätt att inte säga något."], ["The release went out and no customer has asked about it yet.", "Releasen gick ut och ingen kund har frågat om den än."]),
            io(["Sales has no line", "Säljarna har inget svar"], ["An account manager asks what to tell a customer's procurement team, which has heard rumours of a supply chain issue. Nobody has agreed what to say.", "En kundansvarig frågar vad hen ska säga till en kunds inköpsavdelning, som hört rykten om ett problem i leverantörskedjan. Ingen har bestämt vad som ska sägas."], ["Account managers have no agreed line on the shipped build.", "Kundansvariga har inget överenskommet svar om det levererade bygget."])
          ])
        ]
      }),

      pg("l3", ["The write-up", "Texten"], [
        "The researcher sends a draft of their write-up. It describes the technique, lists the kinds of companies affected, and includes a timeline of how each one responded.\n\n{{org.name}} is not named, but the timeline makes it easy to guess for anyone who knows the industry. The researcher asks whether you want to add a statement.",
        "Forskaren skickar ett utkast till sin text. Den beskriver tekniken, räknar upp vilka slags företag som drabbats och innehåller en tidslinje över hur vart och ett svarade.\n\n{{org.name}} namnges inte, men tidslinjen gör det lätt att gissa för den som känner branschen. Forskaren frågar om ni vill lägga till ett uttalande."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you add a statement?", "Lägger ni till ett uttalande?"], ["Adds a short, factual statement about what you fixed.", "Lägger till ett kort, sakligt uttalande om vad ni har rättat."], [
          opt(["Yes, a short factual statement", "Ja, ett kort sakligt uttalande"], "c6", ["Shows you as a company that fixes things.", "Visar er som ett företag som rättar saker."], {
            pushback: [
              pb(["Choose every word", "Välj varje ord"], ["The statement has to match what you know today, and parts of the work are still open. If you write “fixed” and something turns out not to be, the write-up will quote you for years. How carefully can you word it, and how fast?", "Uttalandet måste stämma med det ni vet i dag, och delar av arbetet pågår fortfarande. Skriver ni ”rättat” och något visar sig inte vara det, citeras ni i flera år. Hur noga kan ni formulera det, och hur snabbt?"]),
              pb(["Whose clock wins?", "Vems klocka gäller?"], ["Legal wants the statement reviewed properly, which will take longer than the researcher's deadline. Comms wants it sent today. Do you miss the deadline or send it unreviewed?", "Juristen vill granska uttalandet ordentligt, vilket tar längre tid än forskarens tidsgräns. Kommunikation vill skicka det i dag. Missar ni tidsgränsen eller skickar ni det ogranskat?"]),
              pb(["You confirm it is you", "Ni bekräftar att det är ni"], ["{{org.name}} is not named in the draft. A statement next to the timeline confirms to every reader that the company they guessed is you. Is a good statement worth removing the doubt?", "{{org.name}} namnges inte i utkastet. Ett uttalande bredvid tidslinjen bekräftar för varje läsare att företaget de gissade på är ni. Är ett bra uttalande värt att ta bort tvivlet?"])
            ]
          }),
          opt(["No comment", "Ingen kommentar"], "c6", ["The timeline speaks for you.", "Tidslinjen talar för er."], {
            pushback: [
              pb(["“Declined to comment”", "”Avböjde att kommentera”"], ["The timeline shows how each company responded. Next to yours it will now say “declined to comment”, beside companies that explained what they fixed. Is that how you want to be compared?", "Tidslinjen visar hur varje företag svarade. Bredvid er kommer det nu att stå ”avböjde att kommentera”, intill företag som förklarade vad de rättat. Är det så ni vill bli jämförda?"]),
              pb(["Customers recognise you", "Kunderna känner igen er"], ["The service owner points out that customers who know your product will recognise themselves in the timeline. With no statement, the researcher's version is the only one they have. Who answers when they call?", "Tjänsteägaren påpekar att kunder som känner er produkt kommer att känna igen sig i tidslinjen. Utan uttalande är forskarens version den enda de har. Vem svarar när de ringer?"]),
              pb(["Giving up your say", "Att avstå från att påverka"], ["The researcher offered you a part in the text. Declining may also end any say over the final version, including which details about your builds stay in. Is “no comment” worth giving that up?", "Forskaren erbjöd er en plats i texten. Att tacka nej kan också betyda att ni inte får något att säga till om i slutversionen, inte heller om vilka detaljer om era byggen som står kvar. Är ”ingen kommentar” värt det?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Your statement", "Ert uttalande"], [
            io(["Accepted as written", "Godtaget som det är"], ["The researcher includes your statement unchanged, right after the timeline. It reads as a company that found the problem and fixed it.", "Forskaren tar med ert uttalande oförändrat, direkt efter tidslinjen. Det läses som ett företag som hittade problemet och rättade det."], ["Your statement will appear unchanged in the write-up.", "Ert uttalande kommer att stå oförändrat i texten."]),
            io(["Legal cuts it down", "Juristen kortar ner det"], ["{{person.legal.name}} trims the statement until it admits nothing. {{person.comms.name}} says it now reads as evasive, worse than saying nothing at all.", "{{person.legal.name}} kortar uttalandet tills det inte medger något. {{person.comms.name}} säger att det nu låter undanglidande, sämre än att inte säga något alls."], ["Legal has cut the statement to two cautious sentences.", "Juristen har kortat uttalandet till två försiktiga meningar."], { reopen: true }),
            io(["It names you", "Det pekar ut er"], ["With your statement attached, anyone reading can tell which company in the timeline is yours. The anonymity the draft gave you is gone.", "Med ert uttalande bifogat kan alla som läser se vilket företag i tidslinjen som är ert. Den anonymitet utkastet gav er är borta."], ["With the statement, readers can tell which company in the timeline is you.", "Med uttalandet kan läsarna se vilket företag i tidslinjen som är ert."], { meters: { media: 1 } })
          ]),
          ir("i2", { notChosen: "A" }, ["No comment", "Ingen kommentar"], [
            io(["A journalist asks", "En journalist frågar"], ["A trade journalist who has seen the draft under embargo asks whether the unnamed company is you. “No comment” is now an answer to a direct question.", "En branschjournalist som sett utkastet under embargo frågar om det namnlösa företaget är ert. ”Ingen kommentar” är nu svaret på en direkt fråga."], ["A trade journalist has asked whether you are the unnamed company.", "En branschjournalist har frågat om ni är det namnlösa företaget."], { meters: { media: 1 } }),
            io(["“No response”", "”Inget svar”"], ["The researcher writes that without a statement, the timeline will simply record “no response” next to your entry. They give you until tomorrow.", "Forskaren skriver att tidslinjen, utan ett uttalande, helt enkelt kommer att ange ”inget svar” vid er rad. Hen ger er till i morgon."], ["Without a statement, the timeline will say “no response”.", "Utan ett uttalande kommer tidslinjen att ange ”inget svar”."], { reopen: true }),
            io(["Nobody connects it", "Ingen kopplar ihop det"], ["The draft circulates in a small group and nobody links it to you. For now, staying quiet looks like the safe choice.", "Utkastet cirkulerar i en liten krets och ingen kopplar det till er. Än så länge ser tystnad ut som det säkra valet."], ["Nobody outside has yet linked the draft to you.", "Ingen utomstående har ännu kopplat utkastet till er."])
          ])
        ]
      }),

      pg("c6", ["Bounty or court", "Belöning eller domstol"], [
        "The researcher asks again about a reward. {{person.legal.name}} points out that installing code on someone else's build servers without permission could be unlawful, however good the intentions.\n\n{{person.ciso.name}} points out that the researcher found the weakness before the hostile copycat did, and told you. The room is split.",
        "Forskaren frågar igen om en belöning. {{person.legal.name}} påpekar att det kan vara olagligt att installera kod på någon annans byggservrar utan tillstånd, hur goda avsikterna än är.\n\n{{person.ciso.name}} påpekar att forskaren hittade svagheten innan den fientliga efterapningen gjorde det, och berättade för er. Rummet är splittrat."
      ], {
        variants: [vr("threatened", [
          "The researcher has replied to your legal threat with a short note: they will publish next week with the full timeline, including your email. They no longer ask about a reward.\n\n{{person.ciso.name}} points out that the researcher found the weakness before the hostile copycat did. {{person.legal.name}} still thinks it may have been unlawful. The room is split.",
          "Forskaren har svarat på ert juridiska hot med en kort kommentar: hen publicerar nästa vecka med hela tidslinjen, inklusive ert mejl. Hen frågar inte längre om någon belöning.\n\n{{person.ciso.name}} påpekar att forskaren hittade svagheten innan den fientliga efterapningen gjorde det. {{person.legal.name}} tycker fortfarande att det kan ha varit olagligt. Rummet är splittrat."
        ], ["Because you threatened the researcher, the write-up will include your email.", "Eftersom ni hotade forskaren kommer texten att innehålla ert mejl."])],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Rewards responsible disclosure and sets up a proper channel for the future.", "Belönar ansvarsfullt avslöjande och inrättar en ordentlig kanal för framtiden."], [
          opt(["Pay a modest reward and set up a disclosure policy", "Betala en måttlig belöning och inför en policy för sårbarhetsrapporter"], "c7", ["Encourages the next researcher to come to you first.", "Uppmuntrar nästa forskare att komma till er först."], {
            set: "researcherEngaged",
            pushback: [
              pb(["Rewarding the method", "Att belöna metoden"], ["Legal points out that paying someone who put code on your build servers without permission may invite others to do the same, with less care. What will your new policy say to the next person who tries it?", "Juristen påpekar att om ni betalar någon som fick in kod på era byggservrar utan tillstånd kan det locka andra att göra samma sak, med mindre omsorg. Vad säger er nya policy till nästa person som försöker?"]),
              pb(["How much is modest?", "Hur mycket är måttligt?"], ["There is no budget and no precedent. Pay too little and the write-up may say so; pay too much and it looks like buying goodwill, or silence. Who sets the amount, and on what basis?", "Det finns ingen budget och inget prejudikat. Betalar ni för lite kan det stå i texten; betalar ni för mycket ser det ut som att ni köper välvilja, eller tystnad. Vem bestämmer beloppet, och utifrån vad?"]),
              pb(["Who answers the next report?", "Vem svarar på nästa rapport?"], ["A disclosure policy needs a contact address, wording on what researchers may and may not do, and people who actually answer. Nobody owns any of that today. Who answers the next report, and how quickly?", "En policy för sårbarhetsrapporter kräver en kontaktadress, text om vad forskare får och inte får göra, och personer som faktiskt svarar. Ingen äger något av det i dag. Vem svarar på nästa rapport, och hur snabbt?"])
            ]
          }),
          opt(["Thank them, but decline a reward", "Tacka, men avböj en belöning"], "c7", ["Defensible, and a little cold.", "Försvarbart, och lite kallt."], {
            pushback: [
              pb(["The next researcher", "Nästa forskare"], ["The researcher's timeline records how each company responded. “Thanked, declined a reward” will sit next to companies that paid. Will the next person who finds something in your systems come to you first, or publish first?", "Forskarens tidslinje visar hur varje företag svarade. ”Tackade, avböjde belöning” hamnar bredvid företag som betalade. Kommer nästa person som hittar något i era system att komma till er först, eller publicera först?"]),
              pb(["The CISO is unhappy", "Säkerhetschefen är missnöjd"], ["The CISO says the researcher found the weakness before the hostile copycat did, and a thank-you note is what you send for a forwarded newsletter. Is that the message you want your own security team to hear?", "Säkerhetschefen säger att forskaren hittade svagheten innan den fientliga efterapningen gjorde det, och att ett tackmejl är vad man skickar för ett vidarebefordrat nyhetsbrev. Är det budskapet ni vill att ert eget säkerhetsteam ska höra?"]),
              pb(["Lawful or not?", "Lagligt eller inte?"], ["Declining a reward without a policy leaves it unclear whether you think the research was lawful. Legal wants that settled one way or the other. Can you thank someone for something you may still call unlawful?", "Att avböja en belöning utan en policy lämnar det oklart om ni anser att forskningen var laglig. Juristen vill ha det avgjort åt ena eller andra hållet. Kan ni tacka någon för något ni kanske fortfarande kallar olagligt?"])
            ]
          }),
          opt(["Report the researcher to the police and demand the write-up be stopped", "Polisanmäl forskaren och kräv att texten stoppas"], "x1", ["Turns the story around: you become the story.", "Vänder på berättelsen: ni blir berättelsen."], {
            effects: { media: 2, trust: -1 }, set: "threatened",
            pushback: [
              pb(["The real threat is elsewhere", "Det verkliga hotet finns någon annanstans"], ["While the team prepares a police report, the hostile copycat is still the real danger, and the person you are reporting is the one who could help most against it. Is this the best use of your next week?", "Medan teamet förbereder en polisanmälan är den fientliga efterapningen fortfarande den verkliga faran, och personen ni anmäler är den som bäst kan hjälpa er mot den. Är det här den bästa användningen av er nästa vecka?"]),
              pb(["The CISO will not sign", "Säkerhetschefen skriver inte under"], ["The CISO says they will not put their name to a report against someone who warned you, and asks for that to be minuted. The crisis team is now openly split. Who signs it?", "Säkerhetschefen säger att hen inte sätter sitt namn på en anmälan mot någon som varnade er, och vill att det förs till protokollet. Krisledningen är nu öppet splittrad. Vem skriver under?"]),
              pb(["Your configuration as evidence", "Er konfiguration som bevis"], ["A police report has to describe how the package got in: your build servers fetched it themselves, as configured. That document may become public. Are you ready for your own configuration to be the evidence?", "En polisanmälan måste beskriva hur paketet kom in: era byggservrar hämtade det själva, enligt er konfiguration. Det dokumentet kan bli offentligt. Är ni beredda på att er egen konfiguration blir beviset?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The reward", "Belöningen"], [
            io(["The researcher accepts", "Forskaren tackar ja"], ["The researcher accepts the reward and says future findings will go through your new disclosure policy first. The CISO calls it the cheapest security improvement of the year.", "Forskaren tar emot belöningen och säger att framtida fynd först går via er nya policy. Säkerhetschefen kallar det årets billigaste säkerhetsförbättring."], ["The researcher accepted and will use your new disclosure channel.", "Forskaren tackade ja och kommer att använda er nya rapporteringskanal."]),
            io(["The CEO wants reasons", "Vd vill ha skäl"], ["{{person.ceo.name}} hears that you plan to pay someone who ran code on your servers without permission, and asks to see the reasoning before any money moves.", "{{person.ceo.name}} får höra att ni tänker betala någon som körde kod på era servrar utan tillstånd, och vill se resonemanget innan några pengar betalas ut."], ["The CEO has asked to see the reasoning before any payment.", "Vd har bett att få se resonemanget innan något betalas ut."], { reopen: true }),
            io(["Strings attached?", "Med villkor?"], ["The researcher asks whether the reward comes with conditions on the write-up. Nobody had thought about it, and the question makes it sound like hush money.", "Forskaren frågar om belöningen är kopplad till villkor för texten. Ingen hade tänkt på det, och frågan får det att låta som tystnadspengar."], ["The researcher asked whether the reward is tied to the write-up.", "Forskaren frågade om belöningen är kopplad till texten."])
          ]),
          ir("i2", { notChosen: "A" }, ["No reward", "Ingen belöning"], [
            io(["Noted in the write-up", "Noterat i texten"], ["The researcher says the write-up will mention that no reward was offered, as it does for every company in the timeline.", "Forskaren säger att texten kommer att nämna att ingen belöning erbjöds, precis som för varje företag i tidslinjen."], ["The write-up will note that no reward was offered.", "Texten kommer att nämna att ingen belöning erbjöds."]),
            io(["The CISO dissents", "Säkerhetschefen reserverar sig"], ["{{person.ciso.name}} formally records disagreement: the researcher found the weakness before the copycat and told you. The CISO asks the room to decide again.", "{{person.ciso.name}} reserverar sig formellt: forskaren hittade svagheten före efterapningen och berättade det för er. Säkerhetschefen ber rummet besluta på nytt."], ["The CISO has formally disagreed with the decision.", "Säkerhetschefen har formellt reserverat sig mot beslutet."], { reopen: true }),
            io(["The next researcher", "Nästa forskare"], ["A second researcher reports an unrelated weakness to your general support inbox. There is no channel for it, and support has filed it as spam.", "En annan forskare rapporterar en annan svaghet till er allmänna supportinkorg. Det finns ingen kanal för det, och supporten har sorterat det som skräppost."], ["A second researcher's report sits in the support inbox, marked as spam.", "En annan forskares rapport ligger i supportinkorgen, markerad som skräppost."])
          ])
        ]
      }),

      pg("c7", ["The secrets", "Hemligheterna"], [
        "A week later, a cloud audit log shows a failed attempt to use an access key from outside your network. The key's name was in the list the researcher's package sent.\n\nThe researcher denies using it, and probably did not. But the list of names travelled through a public request-capture service, and anyone watching it could have seen which secrets your machines held.",
        "En vecka senare visar en granskningslogg i molnet ett misslyckat försök att använda en åtkomstnyckel utifrån. Nyckelns namn fanns i listan som forskarens paket skickade.\n\nForskaren förnekar att hen använt den, och har troligen inte gjort det. Men listan med namn passerade en öppen tjänst för att fånga anrop, och den som bevakade den kunde ha sett vilka hemligheter era maskiner hade."
      ], {
        variants: [vr("secretsRotated", [
          "A week later, a cloud audit log shows a failed attempt to use an access key from outside your network. The key's name was in the list the researcher's package sent.\n\nIt failed because the key had already been rotated the day the package was found. Someone was watching the public capture service, and the early rotation is the only reason this was a failed attempt.",
          "En vecka senare visar en granskningslogg i molnet ett misslyckat försök att använda en åtkomstnyckel utifrån. Nyckelns namn fanns i listan som forskarens paket skickade.\n\nFörsöket misslyckades eftersom nyckeln redan hade bytts samma dag som paketet hittades. Någon bevakade den öppna tjänsten, och det tidiga bytet är den enda anledningen till att det stannade vid ett försök."
        ], ["Because secrets were rotated early, the attempt failed.", "Eftersom hemligheterna byttes tidigt misslyckades försöket."])],
        choice: ask(["What now?", "Vad gör ni nu?"], ["Rotates anything still unrotated and reviews the key's activity.", "Byter allt som ännu inte bytts och granskar nyckelns aktivitet."], [
          opt(["Rotate everything remaining and review all key activity", "Byt allt som återstår och granska all nyckelaktivitet"], "l4", ["Closes the last doors.", "Stänger de sista dörrarna."], {
            set: "secretsRotated",
            pushback: [
              pb(["How far back?", "Hur långt tillbaka?"], ["Reviewing all key activity means reading audit logs back to when each key was created, across several services. The cloud lead estimates weeks of work. How far back do you look, and what do you do about what you never get to?", "Att granska all nyckelaktivitet innebär att läsa granskningsloggar ända tillbaka till när varje nyckel skapades, i flera tjänster. Molnansvarig uppskattar veckors arbete. Hur långt tillbaka tittar ni, och vad gör ni med det ni aldrig hinner till?"]),
              pb(["Production may break", "Produktionen kan gå sönder"], ["Some of the remaining secrets sit in old services nobody fully understands. Rotating them may stop something in production, perhaps something a customer depends on. Who accepts that outage?", "En del av de kvarvarande hemligheterna sitter i gamla tjänster som ingen riktigt förstår. Att byta dem kan stoppa något i produktion, kanske något en kund är beroende av. Vem tar på sig det avbrottet?"]),
              pb(["How did they know?", "Hur visste de?"], ["Someone tried a key whose name was on the list. Rotating everything closes the door, but you still don't know how they learned what to try, or whether they have other ways in. Is rotating enough without that answer?", "Någon försökte med en nyckel vars namn fanns på listan. Att byta allt stänger dörren, men ni vet fortfarande inte hur de visste vad de skulle prova, eller om de har andra vägar in. Räcker det att byta utan det svaret?"])
            ]
          }),
          opt(["Rotate that one key", "Byt den enda nyckeln"], "l4", ["The others were on the list too.", "De andra fanns också på listan."], {
            pushback: [
              pb(["Why stop at one?", "Varför stanna vid en?"], ["The same list held the registry publish token and a database password. Whoever tried this key knows those names as well. Why would they stop at one?", "Samma lista innehöll registrets publiceringstoken och ett databaslösenord. Den som provade nyckeln känner till de namnen också. Varför skulle de nöja sig med en?"]),
              pb(["A reason in writing", "Ett skäl i skrift"], ["The CISO asks for a written reason why the other secrets on the list are safe to keep. Nobody can offer one beyond “no attempt seen yet”. Is that a reason?", "Säkerhetschefen vill ha ett skriftligt skäl till varför de andra hemligheterna på listan kan behållas. Ingen kan ge något annat än ”inget försök har setts ännu”. Är det ett skäl?"]),
              pb(["You saw it because it failed", "Ni såg det för att det misslyckades"], ["This attempt was visible because it failed and was logged. A successful use of another key might look like ordinary traffic. How would you know if one of the others had already been used?", "Försöket syntes eftersom det misslyckades och loggades. En lyckad användning av en annan nyckel kan se ut som vanlig trafik. Hur skulle ni veta om någon av de andra redan har använts?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Every door closed", "Alla dörrar stängs"], [
            io(["The review is clean", "Granskningen är ren"], ["The first pass over every key's activity finds no other outside use. The room is confident the attempt was a one-off.", "Den första genomgången av alla nycklars aktivitet hittar ingen annan användning utifrån. Rummet är övertygat om att försöket var en enskild händelse."], ["The key review found no other outside use in the first pass.", "Genomgången av nycklarna hittade ingen annan användning utifrån i första omgången."]),
            io(["A job breaks", "Ett jobb går sönder"], ["Rotating the last keys breaks a nightly report that customers rely on. They notice before you do.", "Bytet av de sista nycklarna får en nattlig rapport som kunderna är beroende av att gå sönder. De märker det innan ni gör det."], ["Rotating the remaining keys broke a customer-facing report job.", "Bytet av de återstående nycklarna fick ett kundnära rapportjobb att gå sönder."], { meters: { trust: -1 } }),
            io(["Too little history", "För lite historik"], ["Several services keep only a short log history. The review cannot look back as far as the day the package first ran.", "Flera tjänster sparar bara en kort logghistorik. Granskningen kan inte se tillbaka ända till dagen då paketet först kördes."], ["Some services keep too little log history to review fully.", "En del tjänster sparar för lite logghistorik för en fullständig granskning."])
          ]),
          ir("i2", { notChosen: "A" }, ["One key changed", "En nyckel byts"], [
            io(["A second attempt", "Ett andra försök"], ["Two days later the audit log shows another failed attempt from outside, on a different key name from the same list.", "Två dagar senare visar granskningsloggen ännu ett misslyckat försök utifrån, med ett annat nyckelnamn från samma lista."], ["A second key from the list was tried from outside.", "En andra nyckel från listan prövades utifrån."], { reopen: true }),
            io(["Quiet days", "Lugna dagar"], ["No further attempts are seen in the days that follow. It looks as if changing one key was enough.", "Inga fler försök syns under de följande dagarna. Det ser ut som att det räckte att byta en nyckel."], ["No further attempts were seen in the days that followed.", "Inga fler försök syntes under de följande dagarna."]),
            io(["Who was watching?", "Vem tittade?"], ["The SOC confirms the captured list sat on a public page anyone could view. There is no way to know how many people saw it.", "SOC bekräftar att den fångade listan låg på en öppen sida som vem som helst kunde se. Det går inte att veta hur många som såg den."], ["Nobody can tell how many people viewed the captured list.", "Ingen kan säga hur många som såg den fångade listan."])
          ])
        ]
      }),

      pg("l4", ["Build hygiene", "Byggrutiner"], [
        "{{person.devLead.name}} reviews how builds work. Release builds run on the same runners as every pull request, with the same broad secrets. Install scripts run for every package. Nobody reviews new dependencies.\n\nNone of this is unusual. It is how most teams work until something like this week happens.",
        "{{person.devLead.name}} går igenom hur byggena fungerar. Releasebyggen körs på samma maskiner som varje ändringsförslag, med samma breda hemligheter. Installationsskript körs för varje paket. Ingen granskar nya beroenden.\n\nInget av detta är ovanligt. Det är så de flesta team arbetar tills något som den här veckan händer."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change in builds?", "Vad ändrar ni i byggena?"], ["Separates release builds and limits what install scripts can reach.", "Separerar releasebyggen och begränsar vad installationsskript kan nå."], [
          opt(["Isolated release builds with only the secrets they need", "Isolerade releasebyggen med bara de hemligheter de behöver"], "c8", ["Limits the damage of the next surprise.", "Begränsar skadan av nästa överraskning."], {
            pushback: [
              pb(["Who builds it?", "Vem bygger det?"], ["Separate release builds mean a second set of runners, secrets and pipelines to look after. The dev lead has nobody free for it this quarter. Do you take people off product work, or accept a half-finished setup?", "Separata releasebyggen innebär ännu en uppsättning maskiner, hemligheter och byggkedjor att sköta. Utvecklingsansvarig har ingen ledig för det här kvartalet. Tar ni folk från produktarbetet, eller accepterar ni en halvfärdig lösning?"]),
              pb(["Slower urgent fixes", "Långsammare akuta rättningar"], ["Isolated builds with fewer secrets add steps and approvals to every release. The service owner worries that an urgent customer fix will now take a day longer. Is that a price you will defend to the customer waiting for it?", "Isolerade byggen med färre hemligheter lägger till steg och godkännanden i varje release. Tjänsteägaren oroar sig för att en akut kundrättning nu tar en dag längre. Är det ett pris ni kan försvara inför kunden som väntar?"]),
              pb(["Every pull request still runs", "Varje ändringsförslag körs fortfarande"], ["This protects releases. Every pull request still runs every package's install script, on shared runners, with broad secrets. Is the release the only thing worth protecting?", "Det här skyddar releaserna. Varje ändringsförslag kör fortfarande varje pakets installationsskript, på delade maskiner, med breda hemligheter. Är releasen det enda som är värt att skydda?"])
            ]
          }),
          opt(["No change; the config fix is enough", "Ingen ändring; rättningen av konfigurationen räcker"], "c8", ["For this technique.", "För den här tekniken."], {
            pushback: [
              pb(["A real package goes bad", "Ett riktigt paket blir dåligt"], ["The configuration fix stops name confusion. If a public package you genuinely use is compromised, its install script runs on the same runners, with the same secrets, as this week. What stops that one?", "Rättningen av konfigurationen stoppar namnförväxling. Om ett öppet paket ni faktiskt använder blir komprometterat körs dess installationsskript på samma maskiner, med samma hemligheter, som den här veckan. Vad stoppar det?"]),
              pb(["The CISO won't sign off", "Säkerhetschefen godkänner inte"], ["The CISO says closing the incident while release builds still share every secret with every pull request is something they will not sign off. Do you overrule the CISO, or reopen the question?", "Säkerhetschefen säger att hen inte godkänner att incidenten stängs medan releasebyggen fortfarande delar varje hemlighet med varje ändringsförslag. Kör ni över säkerhetschefen, eller öppnar ni frågan igen?"]),
              pb(["What changed for customers?", "Vad ändrades för kunderna?"], ["Customers with strict supplier rules ask what has changed in how you build their product. The honest answer is “one line of configuration”. Will that satisfy them?", "Kunder med strikta leverantörskrav frågar vad som har ändrats i hur ni bygger deras produkt. Det ärliga svaret är ”en rad i konfigurationen”. Kommer det att räcka för dem?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Isolated releases", "Isolerade releaser"], [
            io(["The first clean release", "Den första rena releasen"], ["The first release builds on an isolated runner with only the secrets it needs. It works first time, and the team is pleased.", "Den första releasen byggs på en isolerad maskin med bara de hemligheter den behöver. Det fungerar direkt, och teamet är nöjt."], ["The first release built on an isolated runner with minimal secrets.", "Den första releasen byggdes på en isolerad maskin med minimala hemligheter."]),
            io(["The release slips", "Releasen försenas"], ["Setting up the isolation pushes the next customer release back by a week. The service owner has to explain the delay to customers.", "Arbetet med isoleringen skjuter nästa kundrelease en vecka framåt. Tjänsteägaren måste förklara förseningen för kunderna."], ["The next customer release is delayed while isolation is set up.", "Nästa kundrelease är försenad medan isoleringen sätts upp."]),
            io(["A secret nobody knew", "En okänd hemlighet"], ["An isolated release fails because it depended on a secret nobody knew it used. Finding out what else is hidden like that will take time.", "En isolerad release misslyckas eftersom den var beroende av en hemlighet som ingen visste att den använde. Att ta reda på vad mer som döljer sig så kommer att ta tid."], ["Release builds relied on a secret nobody knew about.", "Releasebyggena var beroende av en hemlighet som ingen kände till."])
          ]),
          ir("i2", { notChosen: "A" }, ["Builds as before", "Byggen som förut"], [
            io(["A customer audit", "En kundrevision"], ["A customer's supplier questionnaire arrives with a direct question: are release builds isolated from other builds? The honest answer is no.", "En kunds leverantörsenkät kommer med en direkt fråga: är releasebyggen isolerade från andra byggen? Det ärliga svaret är nej."], ["A customer's supplier audit asks whether release builds are isolated.", "En kunds leverantörsrevision frågar om releasebyggen är isolerade."], { reopen: true }),
            io(["Back to speed", "Tillbaka i tempo"], ["Developers are relieved, and builds are back to their normal speed. Nobody misses the extra steps that were never introduced.", "Utvecklarna är lättade, och byggena går i normal takt igen. Ingen saknar de extra steg som aldrig infördes."], ["Developers welcomed the decision; builds are back to normal speed.", "Utvecklarna välkomnade beslutet; byggena går i normal takt igen."]),
            io(["Another install script", "Ännu ett installationsskript"], ["A routine dependency update runs an install script nobody reviewed, on the same runner as a release. It looks harmless, and so did the last one.", "En vanlig uppdatering av ett beroende kör ett installationsskript som ingen granskat, på samma maskin som en release. Det ser ofarligt ut, och det gjorde det förra också."], ["An unreviewed install script ran on a release runner this week.", "Ett ogranskat installationsskript kördes på en releasemaskin den här veckan."])
          ])
        ]
      }),

      pg("c8", ["The product report", "Produktrapporten"], [
        "{{person.legal.name}} raises the product security rules. A build of a product you supply pulled code from an unknown source, and a hostile version of the same trick was live for hours.\n\nIt is not clear whether this counts as a severe incident affecting the product's security. If it does, an early warning was due within 24 hours of becoming aware.",
        "{{person.legal.name}} tar upp reglerna om produktsäkerhet. Ett bygge av en produkt ni levererar hämtade kod från en okänd källa, och en fientlig version av samma trick var aktiv i flera timmar.\n\nDet är oklart om det räknas som en allvarlig incident som påverkar produktens säkerhet. Om det gör det skulle en tidig varning ha lämnats inom 24 timmar från kännedom."
      ], {
        choice: ask(["Do you report?", "Rapporterar ni?"], ["Reports with a clear account, erring on the side of transparency.", "Rapporterar med en tydlig redogörelse, och väljer hellre öppenhet."], [
          opt(["Report with a clear account of what reached the product", "Rapportera med en tydlig redogörelse för vad som nådde produkten"], "c9", ["Transparent, and shows control.", "Öppet, och visar kontroll."], {
            effects: { regulator: -1 },
            pushback: [
              pb(["A report that shows you were late", "En rapport som visar att ni var sena"], ["If this counts, the early warning was due within 24 hours of becoming aware, and that has passed. A report now puts a date on paper that shows you were late. Do you report anyway, and how do you explain the delay?", "Om det här räknas skulle en tidig varning ha lämnats inom 24 timmar från kännedom, och den tiden har gått. En rapport nu sätter ett datum på papper som visar att ni var sena. Rapporterar ni ändå, och hur förklarar ni dröjsmålet?"]),
              pb(["Not more than is true", "Inte mer än det som är sant"], ["The service owner worries that a formal report will be read as admitting the product was unsafe, though nothing malicious reached customers. How do you report clearly without saying more than you know?", "Tjänsteägaren oroar sig för att en formell rapport läses som ett erkännande av att produkten var osäker, trots att inget skadligt nådde kunderna. Hur rapporterar ni tydligt utan att säga mer än ni vet?"]),
              pb(["Gaps in the account", "Luckor i redogörelsen"], ["A clear account needs facts you may not have yet: exactly which builds pulled which version, and how close the hostile one came to a release. Do you report with gaps, or wait to fill them and be later still?", "En tydlig redogörelse kräver fakta ni kanske inte har ännu: exakt vilka byggen som hämtade vilken version, och hur nära en release den fientliga kom. Rapporterar ni med luckor, eller väntar ni tills de är fyllda och blir ännu senare?"])
            ]
          }),
          opt(["Document the decision not to report", "Dokumentera beslutet att inte rapportera"], "c9", ["Defensible if the reasoning is sound.", "Försvarbart om resonemanget håller."], {
            pushback: [
              pb(["If the facts change", "Om fakta ändras"], ["Your reasoning rests on what you believe reached the product. If anything later shows otherwise, this document becomes proof that you looked at the question and chose not to report. Who signs it?", "Ert resonemang vilar på vad ni tror nådde produkten. Om något senare visar annat blir dokumentet ett bevis på att ni prövade frågan och valde att inte rapportera. Vem skriver under?"]),
              pb(["The authority reads the write-up", "Myndigheten läser texten"], ["The researcher's write-up will describe a product build that pulled a stranger's code. An authority reading it may ask why you never reported. Will your documented reasoning look sound with that article beside it?", "Forskarens text kommer att beskriva ett produktbygge som hämtade en främlings kod. En myndighet som läser den kan fråga varför ni aldrig rapporterade. Håller ert dokumenterade resonemang med den texten bredvid?"]),
              pb(["The reading that suits you", "Den tolkning som passar er"], ["Legal said it is unclear whether this counts, not that it doesn't. Documenting a decision not to report means writing down the reading that happens to suit you. Is that what you want the record to show?", "Juristen sa att det är oklart om det räknas, inte att det inte gör det. Att dokumentera ett beslut att inte rapportera innebär att skriva ner den tolkning som råkar passa er. Är det vad ni vill att handlingarna ska visa?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The report is in", "Rapporten är inlämnad"], [
            io(["Acknowledged", "Bekräftad"], ["{{reg.csirt}} acknowledges the report and thanks you for a clear account. No further questions come, for now.", "{{reg.csirt}} bekräftar rapporten och tackar för en tydlig redogörelse. Inga fler frågor kommer, än så länge."], ["{{reg.csirt}} acknowledged the report without further questions so far.", "{{reg.csirt}} bekräftade rapporten utan fler frågor än så länge."]),
            io(["Late, they note", "Sent, noterar de"], ["The reply notes that the early warning arrived well after 24 hours from when you became aware, and asks why.", "Svaret noterar att den tidiga varningen kom långt efter 24 timmar från att ni fick kännedom, och frågar varför."], ["{{reg.csirt}} noted that your early warning came late.", "{{reg.csirt}} noterade att er tidiga varning kom sent."], { meters: { regulator: 1 } }),
            io(["Follow-up questions", "Följdfrågor"], ["{{reg.csirt}} asks for the list of affected customers and a timeline of the build. Nobody can tell whether that is routine or the start of something bigger.", "{{reg.csirt}} ber om listan över drabbade kunder och en tidslinje för bygget. Ingen kan avgöra om det är rutin eller början på något större."], ["{{reg.csirt}} asked for the affected customer list and a build timeline.", "{{reg.csirt}} har bett om listan över drabbade kunder och en tidslinje för bygget."])
          ]),
          ir("i2", { notChosen: "A" }, ["Not reported", "Inte rapporterat"], [
            io(["Asked why not", "Frågan varför inte"], ["A customer mentions the shipped build to {{reg.csirt}}, which contacts you to ask why it was not informed.", "En kund nämner det levererade bygget för {{reg.csirt}}, som kontaktar er och frågar varför de inte informerades."], ["{{reg.csirt}} has asked you why it was not informed.", "{{reg.csirt}} har frågat er varför de inte informerades."], { reopen: true, meters: { regulator: 1 } }),
            io(["Counsel agrees", "Rådgivaren håller med"], ["External counsel reviews the reasoning and agrees that the threshold was not met. The room feels covered.", "En extern rådgivare går igenom resonemanget och håller med om att tröskeln inte nåddes. Rummet känner sig skyddat."], ["External counsel agreed with the decision not to report.", "En extern rådgivare höll med om beslutet att inte rapportera."]),
            io(["The timeline will show it", "Tidslinjen visar det"], ["Someone points out that the researcher's write-up will show when you first knew. Anyone can compare that with your decision.", "Någon påpekar att forskarens text kommer att visa när ni först fick veta. Vem som helst kan jämföra det med ert beslut."], ["The write-up will show when you first knew.", "Texten kommer att visa när ni först fick veta."])
          ])
        ]
      }),

      pg("c9", ["The developers", "Utvecklarna"], [
        "The developers are tired. Builds have been frozen, secrets rotated, and every project's configuration changed. Some say security made their week miserable; others say they were the ones who found it.\n\nThe developer who first noticed version 99 in the log asks, quietly, whether anyone will mention that it was them.",
        "Utvecklarna är trötta. Byggen har frysts, hemligheter bytts och varje projekts konfiguration ändrats. En del säger att säkerhet gjorde veckan eländig; andra säger att det var de som hittade det.\n\nUtvecklaren som först lade märke till version 99 i loggen frågar, tyst, om någon kommer att nämna att det var hen."
      ], {
        choice: ask(["How do you close the week with the developers?", "Hur avslutar ni veckan med utvecklarna?"], ["Recognises the developer who noticed and explains the changes plainly.", "Uppmärksammar utvecklaren som såg det och förklarar ändringarna enkelt."], [
          opt(["Thank the developer publicly and explain the changes", "Tacka utvecklaren offentligt och förklara ändringarna"], "c10", ["Makes noticing things worth it.", "Gör det värt att lägga märke till saker."], {
            pushback: [
              pb(["Everyone else worked too", "Alla andra jobbade också"], ["Developers who spent late nights rotating secrets and changing configurations feel overlooked when one name is singled out. Do you thank one person or everyone, and does thanking everyone dilute it?", "Utvecklare som suttit sena kvällar och bytt hemligheter och ändrat konfigurationer känner sig förbisedda när ett namn lyfts fram. Tackar ni en person eller alla, och späds tacket ut om alla får det?"]),
              pb(["Plain means admitting", "Tydligt betyder att erkänna"], ["Explaining the changes plainly means telling the whole company that builds trusted any source for years. Some managers would rather keep it within the development team. How plain is plain?", "Att förklara ändringarna enkelt innebär att berätta för hela företaget att byggena litat på vilken källa som helst i flera år. En del chefer vill hellre hålla det inom utvecklingsteamet. Hur tydligt är tydligt?"]),
              pb(["Named, and worried", "Namngiven, och orolig"], ["The developer who noticed is pleased but uneasy: their build log is the one that shows version 99 being installed. They ask whether being named will make them look responsible. How do you thank them without exposing them?", "Utvecklaren som såg det är glad men orolig: det är hens bygglogg som visar att version 99 installerades. Hen undrar om ett namn i ett tack får hen att se ansvarig ut. Hur tackar ni utan att hen hängs ut?"])
            ]
          }),
          opt(["Move on quickly", "Gå vidare snabbt"], "c10", ["Efficient. Missed chance.", "Effektivt. En missad chans."], {
            pushback: [
              pb(["A question left unanswered", "En fråga utan svar"], ["The developer who found it asked a direct question and got no answer. Next time they see something odd in a log, will they say so, or assume someone else already has?", "Utvecklaren som hittade det ställde en direkt fråga och fick inget svar. Nästa gång hen ser något konstigt i en logg, kommer hen att säga till, eller anta att någon annan redan har gjort det?"]),
              pb(["Rules nobody explained", "Regler som ingen förklarat"], ["Developers who were not in the room see new rules, blocked sources and rotated secrets with no explanation. Some are already looking for ways around the new configuration. How do you stop that without talking to them?", "Utvecklare som inte var med ser nya regler, blockerade källor och bytta hemligheter utan förklaring. En del letar redan efter sätt att gå runt den nya konfigurationen. Hur stoppar ni det utan att prata med dem?"]),
              pb(["The lesson gets lost", "Lärdomen försvinner"], ["The CISO says the most important lesson of the week, that one developer reading a log line saved you, will be lost if you just move on. Is the time saved worth losing it?", "Säkerhetschefen säger att veckans viktigaste lärdom, att en utvecklare som läste en loggrad räddade er, går förlorad om ni bara går vidare. Är den sparade tiden värd att förlora den?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Thanked by name", "Tackad med namn"], [
            io(["Others speak up", "Fler hör av sig"], ["After the thank-you, two other developers report odd things they had noticed in builds but kept to themselves.", "Efter tacket rapporterar två andra utvecklare konstigheter de lagt märke till i byggen men behållit för sig själva."], ["Two developers have reported oddities they had kept to themselves.", "Två utvecklare har rapporterat konstigheter de hållit för sig själva."]),
            io(["Someone feels blamed", "Någon känner sig utpekad"], ["The team that owned the build configuration hears the thanks as an accusation: someone noticed, so someone else must have missed it.", "Teamet som ägde byggkonfigurationen hör tacket som en anklagelse: någon märkte det, så någon annan måste ha missat det."], ["The team that owned the build configuration feels blamed.", "Teamet som ägde byggkonfigurationen känner sig utpekat."]),
            io(["Not outside, please", "Inte utåt, tack"], ["The developer is pleased, but asks not to be named outside the company. They do not want to be the person in the write-up.", "Utvecklaren är glad, men ber att inte bli namngiven utanför företaget. Hen vill inte vara personen i texten."], ["The developer asked not to be named outside the company.", "Utvecklaren bad att inte bli namngiven utanför företaget."])
          ]),
          ir("i2", { notChosen: "A" }, ["Moving on", "Vidare"], [
            io(["The finder goes quiet", "Upptäckaren tystnar"], ["The developer who found version 99 stops posting in the team chat. A colleague says they feel overlooked.", "Utvecklaren som hittade version 99 slutar skriva i teamets chatt. En kollega säger att hen känner sig förbisedd."], ["The developer who found it feels overlooked.", "Utvecklaren som hittade det känner sig förbisedd."]),
            io(["“Why bother?”", "”Varför bry sig?”"], ["In the retrospective a developer says that, after this week, they would not flag something odd in a log. Several nod.", "På uppföljningsmötet säger en utvecklare att hen, efter den här veckan, inte skulle flagga något konstigt i en logg. Flera nickar."], ["Developers say they doubt reporting oddities is worth it.", "Utvecklarna tvivlar på att det lönar sig att rapportera konstigheter."], { reopen: true }),
            io(["Nobody minds", "Ingen bryr sig"], ["Most developers are simply glad the week is over and want to get back to work. Nobody asks for more.", "De flesta utvecklare är bara glada att veckan är slut och vill tillbaka till arbetet. Ingen ber om mer."], ["Most developers were relieved to move on quickly.", "De flesta utvecklare var lättade över att gå vidare snabbt."])
          ])
        ]
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Two weeks later. The public package is gone, the write-up is out or about to be, and builds are running again.\n\nThe crisis team meets one last time. The question is no longer this package but every name you use inside, and every source your builds trust without asking.",
        "Två veckor senare. Det öppna paketet är borta, texten är publicerad eller på väg och byggena körs igen.\n\nKrisledningen träffas en sista gång. Frågan är inte längre det här paketet utan varje namn ni använder internt, och varje källa era byggen litar på utan att fråga."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Locks internal names to the internal registry for good and reserves them publicly.", "Låser interna namn till det interna registret för gott och reserverar dem publikt."], [
          opt(["Scoped internal packages, reserved public names, isolated releases", "Interna paket i eget namnområde, reserverade publika namn, isolerade releaser"], "r-end", ["Closes the technique for good.", "Stänger tekniken för gott."], {
            pushback: [
              pb(["All three at once", "Alla tre på en gång"], ["Three changes, each touching every project. The dev lead says doing all three this quarter means pausing new features. Which comes first, and which do you let slip?", "Tre ändringar som var och en berör varje projekt. Utvecklingsansvarig säger att alla tre det här kvartalet innebär att nya funktioner får vänta. Vilken kommer först, och vilken låter ni glida?"]),
              pb(["New names break things", "Nya namn går sönder"], ["Moving internal packages into their own namespace renames them, and every project that uses them must change. Some customer integrations refer to the old names too. Who pays for that migration, and who tells the customers?", "Att flytta interna paket till ett eget namnområde döper om dem, och varje projekt som använder dem måste ändras. En del kundintegrationer hänvisar också till de gamla namnen. Vem betalar för flytten, och vem berättar för kunderna?"]),
              pb(["One door, for good", "En dörr, för gott"], ["These changes close this technique. They do nothing if a public package you genuinely depend on turns hostile. Is the room calling this closed when only one door is shut?", "De här ändringarna stänger den här tekniken. De gör ingenting om ett öppet paket ni faktiskt är beroende av blir fientligt. Kallar rummet det här avslutat när bara en dörr är stängd?"])
            ]
          }),
          opt(["A dependency review board", "En granskningsgrupp för beroenden"], "r-end", ["Useful, and slow.", "Användbart, och långsamt."], {
            pushback: [
              pb(["The queue", "Kön"], ["Every new dependency now waits for a board that meets once a week. Developers are already joking about the queue. What happens to the first urgent security fix that needs a new package?", "Varje nytt beroende väntar nu på en grupp som träffas en gång i veckan. Utvecklarna skämtar redan om kön. Vad händer med den första akuta säkerhetsrättningen som behöver ett nytt paket?"]),
              pb(["Nobody asked for version 99", "Ingen bad om version 99"], ["A board reviews what developers ask for. This week's package was never requested by anyone; the build tool fetched it by itself. Would the board have caught it?", "En granskningsgrupp granskar det utvecklarna ber om. Veckans paket var det ingen som bad om; byggverktyget hämtade det själv. Hade gruppen fångat det?"]),
              pb(["The same tired people", "Samma trötta personer"], ["The board needs people who understand both code and risk, and those are the same developers who just lost a week to this. Whose work stops so they can sit on it?", "Gruppen behöver personer som förstår både kod och risk, och det är samma utvecklare som just förlorat en vecka på det här. Vems arbete får stå still för att de ska sitta i den?"])
            ]
          }),
          opt(["Remove internal names from job adverts", "Ta bort interna namn från platsannonser"], "r-end", ["They are already out there.", "De finns redan där ute."], {
            pushback: [
              pb(["Already archived", "Redan arkiverat"], ["The names are in old adverts, conference talks and error messages in the agent customers run. Removing them from today's adverts hides nothing that is already out there. What does this change actually protect?", "Namnen finns i gamla annonser, konferensföredrag och felmeddelanden i agenten som kunderna kör. Att ta bort dem ur dagens annonser döljer inget av det som redan finns ute. Vad skyddar ändringen egentligen?"]),
              pb(["Recruiting objects", "Rekryteringen invänder"], ["Recruiting says specific technical details attract the right candidates, and asks for evidence that vaguer adverts make you safer. What do you tell them?", "Rekryteringen säger att konkreta tekniska detaljer lockar rätt kandidater, och vill se belägg för att vagare annonser gör er säkrare. Vad svarar ni?"]),
              pb(["Where does secrecy end?", "Var slutar hemlighållandet?"], ["This treats internal names as secrets, and this week showed they never were. A developer asks whether names must now also be kept out of every error message, talk and public repository. Where does it end, and is it the first thing to change?", "Det här behandlar interna namn som hemligheter, och veckan visade att de aldrig var det. En utvecklare frågar om namnen nu också ska hållas borta från varje felmeddelande, föredrag och öppet kodförråd. Var slutar det, och är det rätt sak att ändra först?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The full package", "Hela paketet"], [
            io(["Approved", "Godkänt"], ["{{person.ceo.name}} approves the budget for all three changes and names an owner for each. It looks like the technique is finished for you.", "{{person.ceo.name}} godkänner budgeten för alla tre ändringarna och utser en ansvarig för var och en. Det ser ut som att tekniken är slut för er del."], ["The changes have budget and named owners.", "Ändringarna har budget och utsedda ansvariga."]),
            io(["Too much at once", "För mycket på en gång"], ["The dev lead warns that doing all three this quarter will halt product work. The service owner asks which customer promises should slip.", "Utvecklingsansvarig varnar för att alla tre detta kvartal stoppar produktarbetet. Tjänsteägaren frågar vilka kundlöften som ska skjutas upp."], ["The dev lead warned that all three at once halts product work.", "Utvecklingsansvarig har varnat för att alla tre på en gång stoppar produktarbetet."]),
            io(["A team opts out", "Ett team hoppar av"], ["One team on a legacy build system says it cannot move to scoped packages at all. Nobody has decided whether that is an exception or a problem.", "Ett team med ett äldre byggsystem säger att det inte alls kan flytta till ett eget namnområde. Ingen har bestämt om det är ett undantag eller ett problem."], ["One legacy team says it cannot move to scoped packages.", "Ett team med äldre system säger att det inte kan flytta till eget namnområde."])
          ]),
          ir("i2", { notChosen: "A" }, ["Something less", "Något mindre"], [
            io(["The CISO is not convinced", "Säkerhetschefen är inte övertygad"], ["{{person.ciso.name}} says the chosen change does not close the technique: the build tool would still take a stranger's package by name.", "{{person.ciso.name}} säger att den valda ändringen inte stänger tekniken: byggverktyget skulle fortfarande ta en främlings paket via namnet."], ["The CISO says the chosen change does not close the technique.", "Säkerhetschefen säger att den valda ändringen inte stänger tekniken."], { reopen: true }),
            io(["It seems enough", "Det verkar räcka"], ["No internal name has appeared on the public registry in the two weeks since. The room takes that as a sign the work is done.", "Inget internt namn har dykt upp i det öppna registret under de två veckor som gått. Rummet tar det som ett tecken på att arbetet är klart."], ["No internal name has appeared publicly in the last two weeks.", "Inget internt namn har dykt upp publikt de senaste två veckorna."]),
            io(["Old adverts", "Gamla annonser"], ["Archived copies of old job adverts on job sites still show your internal names. You cannot take those down.", "Arkiverade kopior av gamla platsannonser på jobbsajter visar fortfarande era interna namn. Dem kan ni inte ta bort."], ["Archived copies of old job adverts still show internal names.", "Arkiverade kopior av gamla platsannonser visar fortfarande interna namn."])
          ])
        ]
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["secretsRotated", "scopedRegistry", "disclosed"], "e1"],
          ["scopedRegistry", "e2"],
          ["secretsRotated", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The write-up was published, with a short statement from you about what you fixed. Customers who read it already knew, because you told them.\n\nThe stolen-key attempt failed against a rotated key. Builds now take internal names only from the internal registry, and no public package can pretend to be yours.", "Texten publicerades, med ett kort uttalande från er om vad ni rättat. Kunderna som läste den visste redan, eftersom ni hade berättat.\n\nFörsöket med den stulna nyckeln misslyckades mot en bytt nyckel. Byggena hämtar nu interna namn bara från det interna registret, och inget öppet paket kan låtsas vara ert."], {
        ending: end(1, ["Closed for good", "Stängt för gott"], [
          "Secrets rotated, the build configuration fixed and customers told. The technique no longer works against you.",
          "Hemligheter bytta, byggkonfigurationen rättad och kunderna informerade. Tekniken fungerar inte längre mot er."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["The configuration is fixed, so no public package can pretend to be yours again. But not every secret was rotated, or customers learned of the shipped build from the write-up.\n\nOne exposed key was used to read a test bucket before anyone noticed. It was a small loss, and an avoidable one.", "Konfigurationen är rättad, så inget öppet paket kan låtsas vara ert igen. Men inte varje hemlighet byttes, eller så fick kunderna veta om det levererade bygget från texten.\n\nEn exponerad nyckel användes för att läsa en testbucket innan någon märkte det. En liten förlust, och en som gick att undvika."], {
        ending: end(2, ["Fixed, with loose ends", "Rättat, med lösa trådar"], [
          "The configuration is fixed, but some secrets stayed in use or customers heard about it from elsewhere.",
          "Konfigurationen är rättad, men en del hemligheter fortsatte att användas eller så fick kunderna höra om det från annat håll."
        ])
      }),
      pg("e3", ["Two months later", "Två månader senare"], ["Every secret was rotated, so the stolen-key attempt failed. But the build configuration still takes the highest version from anywhere.\n\nTwo months later, another of your internal names appears on the public registry at version 99, from someone who read the write-up. This time it installs a beacon.", "Varje hemlighet byttes, så försöket med den stulna nyckeln misslyckades. Men byggkonfigurationen tar fortfarande den högsta versionen varifrån som helst.\n\nTvå månader senare dyker ett annat av era interna namn upp i det öppna registret i version 99, från någon som läst texten. Den här gången installerar det en anropare."], {
        ending: end(3, ["The same trick again", "Samma trick igen"], [
          "Secrets were rotated but the build configuration was never fixed. Another internal name is hijacked within weeks.",
          "Hemligheterna byttes men byggkonfigurationen rättades aldrig. Ett annat internt namn kapas inom några veckor."
        ])
      }),
      pg("e4", ["Two months later", "Två månader senare"], ["Nothing was rotated and the configuration still trusts any source. The hostile version's stolen values were used to reach a cloud database.\n\nThe researcher's write-up describes a company that was warned and did little. Customers are asking whether their agents can be trusted.", "Inget byttes och konfigurationen litar fortfarande på vilken källa som helst. De stulna värdena från den fientliga versionen användes för att nå en molndatabas.\n\nForskarens text beskriver ett företag som varnades och gjorde lite. Kunderna frågar om deras agenter går att lita på."], {
        ending: end(4, ["Warned, and still caught", "Varnade, och ändå drabbade"], [
          "Without rotating secrets or fixing the build configuration, the copycat's version reaches real data.",
          "Utan att hemligheter byttes eller byggkonfigurationen rättades når efterapningens version verklig data."
        ])
      }),

      // Break-away: going after the researcher.
      pg("x1", ["The police report", "Polisanmälan"], [
        "The police acknowledge the report and say it will be assessed. The researcher, informed by their lawyer, publishes the write-up early, with your demand attached.\n\nWithin a day the security community has picked it up. The headline is not about dependency confusion; it is about a company that went after the person who warned it.",
        "Polisen bekräftar anmälan och säger att den kommer att bedömas. Forskaren, informerad av sin advokat, publicerar texten i förtid, med ert krav bifogat.\n\nInom ett dygn har säkerhetsvärlden plockat upp det. Rubriken handlar inte om beroendeförväxling; den handlar om ett företag som gick på den som varnade det."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Withdraws and apologises, and focuses on the fix.", "Drar tillbaka och ber om ursäkt, och fokuserar på rättningen."], [
          opt(["Withdraw the report and apologise", "Dra tillbaka anmälan och be om ursäkt"], "x2", ["Late, and it helps.", "Sent, och det hjälper."], {
            pushback: [
              pb(["Legal objects", "Juristen invänder"], ["Legal warns that withdrawing this quickly looks like admitting the report had no basis, and may weaken any later claim. Do you withdraw anyway?", "Juristen varnar för att en så snabb återkallelse ser ut som ett erkännande av att anmälan saknade grund, och kan försvaga ett senare krav. Drar ni tillbaka ändå?"]),
              pb(["The apology is news too", "Ursäkten blir också en nyhet"], ["A public apology keeps the story running another day, with your name in the headline again. Do you apologise publicly, or only to the researcher in private?", "En offentlig ursäkt håller liv i historien ett dygn till, med ert namn i rubriken igen. Ber ni om ursäkt offentligt, eller bara till forskaren i enrum?"]),
              pb(["Believable?", "Trovärdigt?"], ["The security community has already read your demand. An apology a day later may look like a reaction to bad press, not a change of mind. What would make it believable?", "Säkerhetsvärlden har redan läst ert krav. En ursäkt ett dygn senare kan se ut som en reaktion på dålig press, inte som att ni ändrat er. Vad skulle göra den trovärdig?"])
            ]
          }),
          opt(["Defend the report as protecting the company", "Försvara anmälan som ett skydd av företaget"], "x2", ["More headlines.", "Fler rubriker."], {
            pushback: [
              pb(["Quoted side by side", "Citerade sida vid sida"], ["Every statement defending the report is quoted next to the researcher's calm explanation. Your customers' security teams are reading both. How long can you keep defending this?", "Varje uttalande som försvarar anmälan citeras bredvid forskarens lugna förklaring. Era kunders säkerhetsteam läser båda. Hur länge kan ni fortsätta försvara det?"]),
              pb(["Your own staff disagree", "Er egen personal håller inte med"], ["Peers are asking your developers and security staff why their company went after a researcher, and some are saying online that they disagree. Do you ask them to stop, and how would that look in the next headline?", "Kollegor i branschen frågar era utvecklare och säkerhetsfolk varför företaget gick på en forskare, och en del säger öppet på nätet att de inte håller med. Ber ni dem sluta, och hur ser det ut i nästa rubrik?"]),
              pb(["Protecting what, exactly?", "Skyddar vad, exakt?"], ["The police have not said whether they will act at all. Meanwhile the fix, the hunt for the hostile version and the customers wait for attention. What exactly is the report protecting that is worth this?", "Polisen har inte sagt om de alls kommer att göra något. Under tiden väntar rättningen, jakten på den fientliga versionen och kunderna på uppmärksamhet. Vad exakt skyddar anmälan som är värt det här?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The apology", "Ursäkten"], [
            io(["The story softens", "Tonen mildras"], ["Follow-up coverage quotes your apology, and some commentators say it took courage. The headline shifts, slightly.", "Uppföljande bevakning citerar er ursäkt, och några kommentatorer säger att det krävdes mod. Rubriken förskjuts, lite grann."], ["Your apology is quoted in follow-up coverage.", "Er ursäkt citeras i den uppföljande bevakningen."], { meters: { media: -1 } }),
            io(["The police continue", "Polisen fortsätter"], ["The police say a withdrawn report will still be assessed. The researcher's lawyer asks why, if you meant the apology.", "Polisen säger att anmälan bedöms även om den dras tillbaka. Forskarens advokat frågar varför, om ni menade ursäkten."], ["The police will assess the report despite the withdrawal.", "Polisen kommer att bedöma anmälan trots att den dragits tillbaka."]),
            io(["The researcher's terms", "Forskarens villkor"], ["The researcher accepts the apology privately, but asks for it to be made public too. Legal is uneasy about putting it in writing.", "Forskaren tar emot ursäkten privat, men vill att den också görs offentlig. Juristen är obekväm med att sätta den på pränt."], ["The researcher asked for your apology to be made public.", "Forskaren har bett att er ursäkt görs offentlig."])
          ]),
          ir("i2", { notChosen: "A" }, ["Standing firm", "Ni står på er"], [
            io(["More headlines", "Fler rubriker"], ["A second wave of coverage quotes your defence of the police report next to the researcher's warning email.", "En andra våg av bevakning citerar ert försvar av polisanmälan bredvid forskarens varningsmejl."], ["A second wave of coverage quotes your defence of the report.", "En andra våg av bevakning citerar ert försvar av anmälan."], { meters: { media: 1 } }),
            io(["Your own staff", "Er egen personal"], ["Members of your own security team publicly distance themselves from the report. Recruiters start getting questions.", "Medlemmar i ert eget säkerhetsteam tar offentligt avstånd från anmälan. Rekryterarna börjar få frågor."], ["Members of your security team have publicly distanced themselves.", "Medlemmar i ert säkerhetsteam har offentligt tagit avstånd."], { reopen: true }),
            io(["Some agree", "Några håller med"], ["A few industry voices back you: testing on someone else's servers without permission is not research. The debate splits, and nobody wins it.", "Några röster i branschen stöttar er: att testa på någon annans servrar utan tillstånd är inte forskning. Debatten delar sig, och ingen vinner den."], ["A few industry voices have backed your stand.", "Några röster i branschen har stött er hållning."])
          ])
        ]
      }),
      pg("x2", ["The customers ask", "Kunderna frågar"], [
        "Customers have read the coverage. Several security teams ask whether the desktop agent they run was built with code from the researcher's package, and why they had to learn it from the news.\n\nTwo large customers pause automatic updates until you answer.",
        "Kunderna har läst bevakningen. Flera säkerhetsteam frågar om skrivbordsagenten de kör byggdes med kod från forskarens paket, och varför de var tvungna att få veta det från nyheterna.\n\nTvå stora kunder pausar de automatiska uppdateringarna tills ni svarar."
      ], {
        choice: ask(["What do you tell customers?", "Vad säger ni till kunderna?"], ["Gives a full technical account and a clean rebuild.", "Ger en fullständig teknisk redogörelse och ett rent ombygge."], [
          opt(["A full technical account and a clean rebuild", "En fullständig teknisk redogörelse och ett rent ombygge"], "x3", ["What they needed a week ago.", "Det de behövde för en vecka sedan."], {
            pushback: [
              pb(["Clean, really?", "Verkligen rent?"], ["A clean rebuild needs a build chain you trust, and with everyone's attention on the researcher, nobody has finished checking where the hostile version ran. Can you promise customers a clean build today?", "Ett rent ombygge kräver en byggkedja ni litar på, och med all uppmärksamhet på forskaren har ingen kontrollerat färdigt var den fientliga versionen kördes. Kan ni lova kunderna ett rent bygge i dag?"]),
              pb(["The police report in the account", "Polisanmälan i redogörelsen"], ["A full account will be read alongside the coverage, and customers will ask why you went after the person who found the problem. Do you address that in the account, or leave it out and let them wonder?", "En fullständig redogörelse läses bredvid bevakningen, och kunderna kommer att fråga varför ni gick på den som hittade problemet. Tar ni upp det i redogörelsen, eller lämnar ni det därhän och låter dem undra?"]),
              pb(["Grounds for a claim", "Grund för krav"], ["Legal warns that a full technical account may give customers grounds to claim you broke supplier terms. Two large customers have already paused updates. How full is full?", "Juristen varnar för att en fullständig teknisk redogörelse kan ge kunderna grund att hävda att ni brutit mot leverantörsvillkoren. Två stora kunder har redan pausat uppdateringarna. Hur fullständigt är fullständigt?"])
            ]
          }),
          opt(["A short statement that customers were never at risk", "Ett kort uttalande om att kunderna aldrig var i fara"], "x3", ["True, and not what they asked.", "Sant, och inte det de frågade."], {
            pushback: [
              pb(["Not what they asked", "Inte det de frågade"], ["Customers asked whether the agent was built with the researcher's code, and why they learned it from the news. “Never at risk” answers neither. What do you say when they ask again?", "Kunderna frågade om agenten byggdes med forskarens kod, och varför de fick veta det från nyheterna. ”Aldrig i fara” svarar på ingen av frågorna. Vad säger ni när de frågar igen?"]),
              pb(["“Never” in writing", "”Aldrig” i skrift"], ["You know what the researcher's package did. You have not finished checking where the hostile version ran. Are you sure enough to put the word “never” in writing to every customer?", "Ni vet vad forskarens paket gjorde. Ni har inte kontrollerat färdigt var den fientliga versionen kördes. Är ni tillräckligt säkra för att skriva ordet ”aldrig” till varje kund?"]),
              pb(["Updates stay paused", "Uppdateringarna förblir pausade"], ["The two customers who paused updates say a short statement is not enough to resume. Without updates they fall behind on fixes, including security fixes. How long can you leave them there?", "De två kunderna som pausat uppdateringarna säger att ett kort uttalande inte räcker för att starta igen. Utan uppdateringar halkar de efter med rättningar, även säkerhetsrättningar. Hur länge kan ni låta dem stå där?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The full account", "Hela redogörelsen"], [
            io(["Updates resume", "Uppdateringarna återupptas"], ["One of the two large customers reads the account and turns automatic updates back on. The other is still reading.", "En av de två stora kunderna läser redogörelsen och slår på de automatiska uppdateringarna igen. Den andra läser fortfarande."], ["One of the two large customers has resumed automatic updates.", "En av de två stora kunderna har återupptagit de automatiska uppdateringarna."]),
            io(["More questions", "Fler frågor"], ["The account raises a new question: did the hostile version ever reach your builds? Customers want a yes or no, and you cannot give one yet.", "Redogörelsen väcker en ny fråga: nådde den fientliga versionen någonsin era byggen? Kunderna vill ha ett ja eller nej, och ni kan inte ge något än."], ["Customers asked whether the hostile version reached your builds.", "Kunderna har frågat om den fientliga versionen nådde era byggen."]),
            io(["The rebuild takes time", "Ombygget tar tid"], ["The clean rebuild will take several days to verify. Customers have the account, but not yet the build.", "Det rena ombygget tar flera dagar att verifiera. Kunderna har redogörelsen, men inte bygget än."], ["The clean rebuild will take several days.", "Det rena ombygget kommer att ta flera dagar."])
          ]),
          ir("i2", { notChosen: "A" }, ["The short statement", "Det korta uttalandet"], [
            io(["Not good enough", "Inte tillräckligt"], ["The two large customers reply that the statement does not answer what they asked. Their updates stay paused.", "De två stora kunderna svarar att uttalandet inte besvarar det de frågade. Deras uppdateringar förblir pausade."], ["Two large customers rejected the short statement.", "Två stora kunder har avvisat det korta uttalandet."], { reopen: true, meters: { trust: -1 } }),
            io(["Accepted, for now", "Godtaget, tills vidare"], ["Most smaller customers accept the statement and move on. It looks as if a short answer was enough.", "De flesta mindre kunder godtar uttalandet och går vidare. Det ser ut som att ett kort svar räckte."], ["Most customers accepted the statement for now.", "De flesta kunder godtog uttalandet tills vidare."]),
            io(["Quoted back", "Citerat tillbaka"], ["Coverage sets your statement side by side with the researcher's write-up. The two do not tell the same story.", "Bevakningen ställer ert uttalande bredvid forskarens text. De två berättar inte samma historia."], ["Coverage contrasts your statement with the write-up.", "Bevakningen ställer ert uttalande mot texten."], { meters: { media: 1 } })
          ])
        ]
      }),
      pg("x3", ["The copycat", "Efterapningen"], [
        "While attention was on the researcher, the hostile version's beacon kept calling home from two laptops that nobody checked.\n\n{{person.socLead.name}} finds it now, a week late. The laptops belong to developers with access to the release pipeline.",
        "Medan uppmärksamheten låg på forskaren fortsatte den fientliga versionens anropare att höra av sig från två datorer som ingen kontrollerade.\n\n{{person.socLead.name}} hittar den nu, en vecka för sent. Datorerna tillhör utvecklare med åtkomst till releasekedjan."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Treats the release pipeline as compromised and rebuilds it.", "Behandlar releasekedjan som komprometterad och bygger om den."], [
          opt(["Rebuild the release pipeline and rotate everything", "Bygg om releasekedjan och byt allt"], "x4", ["A week of work you could have avoided.", "En veckas arbete som gick att undvika."], {
            pushback: [
              pb(["A week without releases", "En vecka utan releaser"], ["Rebuilding the release pipeline means no releases for at least a week, while customers have paused updates and want answers. The service owner asks what to tell them. What do you?", "Att bygga om releasekedjan innebär inga releaser på minst en vecka, medan kunderna har pausat uppdateringarna och vill ha svar. Tjänsteägaren frågar vad hen ska säga till dem. Vad säger ni?"]),
              pb(["The two developers", "De två utvecklarna"], ["The two developers whose laptops carried the beacon fear they will be blamed. Their machines must be taken and their access cut while the rebuild runs. How do you handle them, and what do you tell the rest of the team?", "De två utvecklarna vars datorer bar på anroparen är rädda för att få skulden. Deras datorer måste tas in och deras åtkomst stängas av under ombygget. Hur hanterar ni dem, och vad säger ni till resten av teamet?"]),
              pb(["Rebuild or investigate first?", "Bygga om eller utreda först?"], ["A week of hourly calls home from machines with release access. Rebuilding stops it, but you still don't know what was taken or changed, and a rebuild may wipe the traces. Do you rebuild before the forensics are done?", "En vecka av anrop varje timme från datorer med åtkomst till releasekedjan. Ett ombygge stoppar det, men ni vet fortfarande inte vad som togs eller ändrades, och ombygget kan sudda ut spåren. Bygger ni om innan den tekniska utredningen är klar?"])
            ]
          }),
          opt(["Clean the two laptops", "Rensa de två datorerna"], "x4", ["And the week they were connected?", "Och veckan de var anslutna?"], {
            pushback: [
              pb(["And the week?", "Och veckan?"], ["For a week the beacon ran on machines with access to the release pipeline. Cleaning the laptops ends the beacon, not anything it may have done in that time. Can you ship your next release without knowing?", "I en vecka kördes anroparen på datorer med åtkomst till releasekedjan. Att rensa datorerna stoppar anroparen, inte det den kan ha gjort under tiden. Kan ni leverera nästa release utan att veta?"]),
              pb(["Cleaning wipes the evidence", "Rensning raderar bevisen"], ["{{person.socLead.name}} wants full copies of both laptops before anything is cleaned. Cleaning now removes the only record of what the beacon did. Do you wait for the copies, and keep the beacon running while you do?", "{{person.socLead.name}} vill ha fullständiga kopior av båda datorerna innan något rensas. En rensning nu tar bort det enda underlaget för vad anroparen gjorde. Väntar ni på kopiorna, och låter anroparen fortsätta under tiden?"]),
              pb(["Only two?", "Bara två?"], ["These two were found a week late because nobody looked. Nobody has checked the other developer machines with the same care. Why would you trust that there are only two?", "De här två hittades en vecka för sent eftersom ingen letade. Ingen har kontrollerat de andra utvecklardatorerna lika noga. Varför skulle ni lita på att det bara är två?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["The pipeline rebuild", "Ombygget av kedjan"], [
            io(["No tampering found", "Ingen manipulation"], ["The first review of the release pipeline finds no sign of tampering. The room starts to believe the laptops never got further.", "Den första granskningen av releasekedjan hittar inga tecken på manipulation. Rummet börjar tro att datorerna aldrig tog sig längre."], ["The first review found no tampering in the release pipeline.", "Den första granskningen hittade ingen manipulation i releasekedjan."]),
            io(["Releases stop", "Releaserna stoppas"], ["All customer releases halt while the pipeline is rebuilt. Customers who paused updates now have nothing to resume to.", "Alla kundreleaser stoppas medan kedjan byggs om. Kunderna som pausat uppdateringarna har nu inget att återuppta."], ["Customer releases are halted while the pipeline is rebuilt.", "Kundreleaserna är stoppade medan kedjan byggs om."], { meters: { trust: -1 } }),
            io(["A token was used", "En token användes"], ["Logs show that a token from one of the two laptops was used on the pipeline this week. It may have been the developer, working as usual.", "Loggarna visar att en token från en av de två datorerna användes mot kedjan den här veckan. Det kan ha varit utvecklaren, som arbetade som vanligt."], ["A token from one laptop was used on the pipeline; by whom is unclear.", "En token från en av datorerna användes mot kedjan; av vem är oklart."])
          ]),
          ir("i2", { notChosen: "A" }, ["Two laptops cleaned", "Två datorer rensade"], [
            io(["A third machine", "En tredje maskin"], ["A day after the clean-up, a third machine is found calling {{asset.c2Domain}}. The two laptops were not the whole story.", "Ett dygn efter rensningen hittas en tredje maskin som anropar {{asset.c2Domain}}. De två datorerna var inte hela historien."], ["A third machine was found calling the beacon's domain.", "En tredje maskin hittades som anropade anroparens domän."], { reopen: true }),
            io(["Laptops wiped", "Datorerna rensade"], ["Both laptops are wiped and reinstalled, and the beacon goes silent. To most of the room, that is the end of it.", "Båda datorerna raderas och installeras om, och anroparen tystnar. För de flesta i rummet är saken därmed avslutad."], ["The two laptops have been wiped and reinstalled.", "De två datorerna har raderats och installerats om."]),
            io(["The access question", "Frågan om åtkomsten"], ["Nobody can yet say whether the laptops' access to the release pipeline was used during the week the beacon ran.", "Ingen kan ännu säga om datorernas åtkomst till releasekedjan användes under veckan anroparen var aktiv."], ["Nobody can yet say whether the laptops' pipeline access was used.", "Ingen kan ännu säga om datorernas åtkomst till kedjan användes."])
          ])
        ]
      }),
      pg("x4", ["The supervisor", "Tillsynsmyndigheten"], [
        "{{reg.csirt}} has seen the coverage and asks about the hostile package, the shipped agent and the beacon on developer machines.\n\nThe researcher is cooperating with them. You are explaining, at the same time, why you reported the researcher to the police.",
        "{{reg.csirt}} har sett bevakningen och frågar om det fientliga paketet, den levererade agenten och anroparen på utvecklarnas datorer.\n\nForskaren samarbetar med dem. Ni förklarar, samtidigt, varför ni polisanmälde forskaren."
      ], {
        choice: ask(["How do you engage?", "Hur deltar ni?"], ["Cooperates fully and transparently.", "Samarbetar fullt ut och öppet."], [
          opt(["Full cooperation", "Fullt samarbete"], "e5", ["The way back starts here.", "Vägen tillbaka börjar här."], {
            pushback: [
              pb(["Explaining the police report", "Att förklara polisanmälan"], ["Full cooperation means explaining the police report to an authority that is working with the researcher. Legal warns that whatever you say may reach them. Do you say what you really think of the report?", "Fullt samarbete innebär att förklara polisanmälan för en myndighet som samarbetar med forskaren. Juristen varnar för att det ni säger kan nå hen. Säger ni vad ni egentligen tycker om anmälan?"]),
              pb(["Your worst week, on record", "Er sämsta vecka, dokumenterad"], ["Full cooperation means handing over the week the beacon ran unnoticed and the release access those laptops had. That account will be on record for good. Are you ready for it to shape how you are seen?", "Fullt samarbete innebär att lämna över veckan då anroparen kördes obemärkt och den releaseåtkomst datorerna hade. Den redogörelsen blir kvar i handlingarna för gott. Är ni beredda på att den formar hur ni uppfattas?"]),
              pb(["The same people", "Samma personer"], ["The authority asks for timelines, logs and named contacts within days, and the people who can provide them are the ones rebuilding the pipeline. Whose work stops so you can answer?", "Myndigheten vill ha tidslinjer, loggar och namngivna kontaktpersoner inom några dagar, och de som kan ta fram dem är samma personer som bygger om releasekedjan. Vems arbete får stå still för att ni ska kunna svara?"])
            ]
          }),
          opt(["Answer only what is asked", "Svara bara på det som frågas"], "e5", ["Slow and suspicious.", "Långsamt och misstänkt."], {
            pushback: [
              pb(["They already know", "De vet redan"], ["The researcher is cooperating with them and has shared their own timeline. Any gap between your answers and theirs will be noticed. Can you afford to look as if you are holding back?", "Forskaren samarbetar med dem och har delat sin egen tidslinje. Varje skillnad mellan era svar och hens kommer att märkas. Har ni råd att se ut som om ni håller inne med något?"]),
              pb(["The room splits again", "Rummet splittras igen"], ["Legal prefers narrow answers; the CISO says that posture is exactly what turned this into a story. The room is split again. Who decides, and who explains the choice afterwards?", "Juristen föredrar snäva svar; säkerhetschefen säger att just den hållningen är vad som gjorde det här till en nyhet. Rummet är splittrat igen. Vem bestämmer, och vem förklarar valet efteråt?"]),
              pb(["A slow drip", "Droppvis"], ["Each narrow answer brings another question, and the exchange drags on for weeks with your name attached. Is a slow drip really less exposure than one full account?", "Varje snävt svar leder till en ny fråga, och utbytet drar ut i veckor med ert namn kopplat till det. Är det droppvisa verkligen mindre utsatt än en fullständig redogörelse?"])
            ]
          })
        ]),
        interrupts: [
          ir("i1", { chosen: "A" }, ["Full cooperation", "Fullt samarbete"], [
            io(["Credit for openness", "Beröm för öppenheten"], ["{{reg.csirt}} notes your openness in its first reply and says it will focus on the technical fix, not the police report.", "{{reg.csirt}} noterar er öppenhet i sitt första svar och säger att de fokuserar på den tekniska rättningen, inte på polisanmälan."], ["{{reg.csirt}} noted your openness in its first reply.", "{{reg.csirt}} noterade er öppenhet i sitt första svar."], { meters: { regulator: -1 } }),
            io(["Every answer, a question", "Varje svar, en fråga"], ["Your full account prompts a request for internal emails about the decision to go to the police. Legal is alarmed.", "Er fullständiga redogörelse leder till en begäran om interna mejl om beslutet att gå till polisen. Juristen är oroad."], ["{{reg.csirt}} has asked for internal emails about the police report.", "{{reg.csirt}} har bett om interna mejl om polisanmälan."]),
            io(["Two versions", "Två versioner"], ["{{reg.csirt}} compares your timeline with the researcher's. They differ on two dates, and nobody is sure which side is right.", "{{reg.csirt}} jämför er tidslinje med forskarens. De skiljer sig åt på två datum, och ingen är säker på vem som har rätt."], ["Your timeline and the researcher's differ on two dates.", "Er tidslinje och forskarens skiljer sig åt på två datum."])
          ]),
          ir("i2", { notChosen: "A" }, ["Only what is asked", "Bara det som frågas"], [
            io(["The researcher fills the gaps", "Forskaren fyller i luckorna"], ["{{reg.csirt}} learns from the researcher what you left out, including the beacon on the developer laptops. Its next letter is much less friendly.", "{{reg.csirt}} får veta av forskaren det ni utelämnade, bland annat anroparen på utvecklarnas datorer. Nästa brev är betydligt mindre vänligt."], ["{{reg.csirt}} learned details from the researcher that you left out.", "{{reg.csirt}} fick veta detaljer av forskaren som ni utelämnade."], { reopen: true, meters: { regulator: 1 } }),
            io(["No follow-up yet", "Ingen uppföljning än"], ["Your short answers are received without comment. For a few days, it looks as if they were enough.", "Era korta svar tas emot utan kommentar. Under några dagar ser det ut som att de räckte."], ["{{reg.csirt}} has not followed up on your answers yet.", "{{reg.csirt}} har inte följt upp era svar än."]),
            io(["A journalist asks", "En journalist frågar"], ["A journalist asks whether you are cooperating fully with {{reg.csirt}}. Any answer will be checked against what the researcher says.", "En journalist frågar om ni samarbetar fullt ut med {{reg.csirt}}. Vilket svar ni än ger kommer att stämmas av mot vad forskaren säger."], ["A journalist has asked whether you are cooperating fully.", "En journalist har frågat om ni samarbetar fullt ut."], { meters: { media: 1 } })
          ])
        ]
      }),
      pg("e5", ["Three months later", "Tre månader senare"], ["A researcher's warning became a public fight, a missed backdoor on developer laptops and a rebuilt release pipeline.\n\nThe technique was fixed eventually. The security community remembers the police report.", "En forskares varning blev en offentlig strid, en missad bakdörr på utvecklarnas datorer och en ombyggd releasekedja.\n\nTekniken rättades till slut. Säkerhetsvärlden minns polisanmälan."], {
        ending: end(5, ["Shooting the messenger", "Att skjuta budbäraren"], [
          "Going after the researcher made you the story, while the copycat's backdoor went unnoticed for a week.",
          "Att gå på forskaren gjorde er till nyheten, medan efterapningens bakdörr gick obemärkt förbi i en vecka."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Build tools that take the highest version from any source can be hijacked by name.", "Byggverktyg som tar den högsta versionen från vilken källa som helst kan kapas via namn."]),
        L(["Rotate secrets on any machine that ran unknown code, however harmless it looks.", "Byt hemligheter på varje maskin som kört okänd kod, hur ofarlig den än ser ut."]),
        L(["Researchers who warn you are allies; going after them makes you the story.", "Forskare som varnar er är allierade; att gå på dem gör er till nyheten."]),
        L(["Tell customers when your product's build was affected, before they read it elsewhere.", "Berätta för kunderna när er produkts bygge drabbats, innan de läser om det någon annanstans."])
      ],
      strengthsToLookFor: [
        L(["Freezing builds immediately", "Att frysa byggen omedelbart"]),
        L(["Fixing internal names to the internal registry", "Att låsa interna namn till det interna registret"]),
        L(["Engaging the researcher in good faith", "Att bemöta forskaren i god tro"])
      ],
      commonGaps: [
        L(["Treating “only names were sent” as no exposure", "Att behandla ”bara namn skickades” som att inget exponerats"]),
        L(["Pinning versions instead of fixing the source", "Att låsa versioner i stället för att rätta källan"]),
        L(["Threatening the researcher", "Att hota forskaren"])
      ],
      suggestedActions: [
        act(["Resolve internal package names only from the internal registry.", "Hämta interna paketnamn bara från det interna registret."], "devLead", "high"),
        act(["Reserve internal names on public registries.", "Reservera interna namn i öppna register."], "devLead", "medium"),
        act(["Isolate release builds with minimal secrets.", "Isolera releasebyggen med minimala hemligheter."], "ciso", "high"),
        act(["Publish a vulnerability disclosure policy.", "Publicera en policy för sårbarhetsrapporter."], "legal", "medium")
      ]
    }
  });
})();
