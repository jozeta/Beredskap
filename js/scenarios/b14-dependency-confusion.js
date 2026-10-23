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
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
          opt(["Freeze all builds and deployments now", "Frys alla byggen och driftsättningar nu"], "c2", ["Stops the spread; developers will complain.", "Stoppar spridningen; utvecklarna kommer att klaga."], { set: "buildsFrozen" }),
          opt(["Pin the internal version in the lockfiles and carry on", "Lås den interna versionen i låsfilerna och fortsätt"], "c2", ["Fixes the next build, ignores the last three days.", "Rättar nästa bygge, ignorerar de senaste tre dagarna."]),
          opt(["Ask the public registry to take the package down", "Be det öppna registret ta bort paketet"], "c2", ["Worth doing; it does nothing about where it already ran.", "Värt att göra; det gör inget åt var det redan har körts."])
        ])
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
          opt(["Find every machine that installed it", "Hitta varje maskin som installerade det"], "l1", ["Scope first; intent later.", "Omfattning först; avsikt senare."]),
          opt(["Treat it as harmless research and fix the config", "Behandla det som ofarlig forskning och rätta konfigurationen"], "l1", ["Probably true, and the scope is still unknown.", "Troligen sant, och omfattningen är fortfarande okänd."]),
          opt(["Contact the publisher “dc-research”", "Kontakta utgivaren ”dc-research”"], "c3b", ["You might learn a lot. So might they.", "Ni kan få veta mycket. Det kan de också."])
        ])
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
          opt(["Rotate every secret on those machines", "Byt varje hemlighet på de maskinerna"], "c3", ["Costs a day. Assumes the next version will be less polite.", "Kostar en dag. Förutsätter att nästa version blir mindre artig."], { set: "secretsRotated" }),
          opt(["Rotate nothing; only names were sent", "Byt ingenting; bara namn skickades"], "c3", ["True today.", "Sant i dag."])
        ])
      }),

      pg("c3", ["The configuration", "Konfigurationen"], [
        "{{person.devLead.name}} finds the root cause in one line of the build configuration. The build tool checks both the internal registry and the public one, and takes the highest version it finds, wherever it comes from.\n\nIt has worked that way for years. Anyone who learned the name of one of your internal packages could have done this at any time.",
        "{{person.devLead.name}} hittar grundorsaken på en rad i byggkonfigurationen. Byggverktyget kontrollerar både det interna registret och det öppna, och tar den högsta version det hittar, var den än kommer ifrån.\n\nDet har fungerat så i flera år. Vem som helst som fått veta namnet på ett av era interna paket kunde ha gjort det här när som helst."
      ], {
        choice: ask(["How do you fix it?", "Hur rättar ni det?"], ["Makes internal names resolve only from the internal registry.", "Ser till att interna namn bara hämtas från det interna registret."], [
          opt(["Internal names may only come from the internal registry", "Interna namn får bara hämtas från det interna registret"], "c4", ["The real fix. Needs every project checked.", "Den verkliga rättningen. Kräver att varje projekt kontrolleras."], { set: "scopedRegistry" }),
          opt(["Pin exact versions everywhere", "Lås exakta versioner överallt"], "c4", ["Helps until someone updates a pin.", "Hjälper tills någon uppdaterar en låsning."]),
          opt(["Block the public registry entirely", "Blockera det öppna registret helt"], "c4", ["Safe and stops most development.", "Säkert och stoppar det mesta av utvecklingen."])
        ])
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
          opt(["Thank them, verify their claims, and agree a disclosure date", "Tacka, kontrollera påståendena och kom överens om ett publiceringsdatum"], "c4", ["Turns a risk into a partner.", "Gör en risk till en partner."], { set: "researcherEngaged" }),
          opt(["Tell them their actions were unlawful and demand silence", "Säg att agerandet var olagligt och kräv tystnad"], "c4", ["They will publish anyway, and mention this email.", "Hen kommer att publicera ändå, och nämna det här mejlet."], { set: "threatened" })
        ])
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
          opt(["Hunt for the beacon and report the package to the registry and {{reg.csirt}}", "Leta efter anroparen och rapportera paketet till registret och {{reg.csirt}}"], "l2", ["Protects you and others.", "Skyddar er och andra."]),
          opt(["Report the package and assume your fix kept it out", "Rapportera paketet och anta att er rättning höll det ute"], "l2", ["Maybe it did.", "Kanske gjorde den det."])
        ])
      }),

      pg("l2", ["Other names", "Andra namn"], [
        "{{person.devLead.name}} lists every internal package name and checks the public registry for each. {{num.names}} of them are free for anyone to register today.\n\nSeveral appear in public job adverts, conference talks and error messages visible in the customer agent. Your internal names are not secret, and never were.",
        "{{person.devLead.name}} listar varje internt paketnamn och kontrollerar det öppna registret för vart och ett. {{num.names}} av dem är lediga för vem som helst att registrera i dag.\n\nFlera förekommer i öppna platsannonser, konferensföredrag och felmeddelanden som syns i kundagenten. Era interna namn är inte hemliga, och har aldrig varit det."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about the other names?", "Vad gör ni med de andra namnen?"], ["Reserves the names publicly as placeholders and moves internal packages under a protected scope.", "Reserverar namnen publikt som platshållare och flyttar interna paket under ett skyddat namnområde."], [
          opt(["Reserve them publicly as empty placeholders", "Reservera dem publikt som tomma platshållare"], "c5", ["Cheap and effective.", "Billigt och effektivt."], { set: "namesClaimed" }),
          opt(["Rely on the configuration fix alone", "Lita enbart på rättningen av konfigurationen"], "c5", ["Fine, if every project got the fix.", "Bra, om varje projekt fick rättningen."])
        ])
      }),

      pg("c5", ["The agent you shipped", "Agenten ni levererade"], [
        "The release build from two nights ago went out to customers as an automatic update of the desktop agent. It includes the researcher's harmless package, which ran once during the build, not on customers' machines.\n\nNothing malicious reached customers. But {{num.customers|number}} organisations are running a build that pulled code from a stranger, and some of them have strict supplier rules.",
        "Releasebygget från för två nätter sedan gick ut till kunderna som en automatisk uppdatering av skrivbordsagenten. Det innehåller forskarens ofarliga paket, som kördes en gång under bygget, inte på kundernas maskiner.\n\nInget skadligt nådde kunderna. Men {{num.customers|number}} organisationer kör ett bygge som hämtade kod från en främling, och en del av dem har strikta leverantörskrav."
      ], {
        discuss: [q("Is a build that pulled harmless foreign code a problem for customers, or only for you?", "Är ett bygge som hämtade ofarlig främmande kod ett problem för kunderna, eller bara för er?", ["serviceOwner", "legal"])],
        choice: ask(["What do you do about the shipped agent?", "Vad gör ni med den levererade agenten?"], ["Rebuilds cleanly, ships an update, and tells customers plainly what happened.", "Bygger om rent, levererar en uppdatering och berättar tydligt för kunderna vad som hände."], [
          opt(["Rebuild, ship a clean update, and tell customers what happened", "Bygg om, leverera en ren uppdatering och berätta för kunderna vad som hände"], "l3", ["Honest and reassuring.", "Ärligt och lugnande."], { set: "disclosed" }),
          opt(["Rebuild and ship quietly as a routine update", "Bygg om och leverera i tysthet som en vanlig uppdatering"], "l3", ["Clean, and customers may learn from the write-up.", "Rent, och kunderna kan få veta det från forskarens text."])
        ])
      }),

      pg("l3", ["The write-up", "Texten"], [
        "The researcher sends a draft of their write-up. It describes the technique, lists the kinds of companies affected, and includes a timeline of how each one responded.\n\n{{org.name}} is not named, but the timeline makes it easy to guess for anyone who knows the industry. The researcher asks whether you want to add a statement.",
        "Forskaren skickar ett utkast till sin text. Den beskriver tekniken, räknar upp vilka slags företag som drabbats och innehåller en tidslinje över hur vart och ett svarade.\n\n{{org.name}} namnges inte, men tidslinjen gör det lätt att gissa för den som känner branschen. Forskaren frågar om ni vill lägga till ett uttalande."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you add a statement?", "Lägger ni till ett uttalande?"], ["Adds a short, factual statement about what you fixed.", "Lägger till ett kort, sakligt uttalande om vad ni har rättat."], [
          opt(["Yes, a short factual statement", "Ja, ett kort sakligt uttalande"], "c6", ["Shows you as a company that fixes things.", "Visar er som ett företag som rättar saker."]),
          opt(["No comment", "Ingen kommentar"], "c6", ["The timeline speaks for you.", "Tidslinjen talar för er."])
        ])
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
          opt(["Pay a modest reward and set up a disclosure policy", "Betala en måttlig belöning och inför en policy för sårbarhetsrapporter"], "c7", ["Encourages the next researcher to come to you first.", "Uppmuntrar nästa forskare att komma till er först."], { set: "researcherEngaged" }),
          opt(["Thank them, but decline a reward", "Tacka, men avböj en belöning"], "c7", ["Defensible, and a little cold.", "Försvarbart, och lite kallt."]),
          opt(["Report the researcher to the police and demand the write-up be stopped", "Polisanmäl forskaren och kräv att texten stoppas"], "x1", ["Turns the story around: you become the story.", "Vänder på berättelsen: ni blir berättelsen."], { set: "threatened" })
        ])
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
          opt(["Rotate everything remaining and review all key activity", "Byt allt som återstår och granska all nyckelaktivitet"], "l4", ["Closes the last doors.", "Stänger de sista dörrarna."], { set: "secretsRotated" }),
          opt(["Rotate that one key", "Byt den enda nyckeln"], "l4", ["The others were on the list too.", "De andra fanns också på listan."])
        ])
      }),

      pg("l4", ["Build hygiene", "Byggrutiner"], [
        "{{person.devLead.name}} reviews how builds work. Release builds run on the same runners as every pull request, with the same broad secrets. Install scripts run for every package. Nobody reviews new dependencies.\n\nNone of this is unusual. It is how most teams work until something like this week happens.",
        "{{person.devLead.name}} går igenom hur byggena fungerar. Releasebyggen körs på samma maskiner som varje ändringsförslag, med samma breda hemligheter. Installationsskript körs för varje paket. Ingen granskar nya beroenden.\n\nInget av detta är ovanligt. Det är så de flesta team arbetar tills något som den här veckan händer."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change in builds?", "Vad ändrar ni i byggena?"], ["Separates release builds and limits what install scripts can reach.", "Separerar releasebyggen och begränsar vad installationsskript kan nå."], [
          opt(["Isolated release builds with only the secrets they need", "Isolerade releasebyggen med bara de hemligheter de behöver"], "c8", ["Limits the damage of the next surprise.", "Begränsar skadan av nästa överraskning."]),
          opt(["No change; the config fix is enough", "Ingen ändring; rättningen av konfigurationen räcker"], "c8", ["For this technique.", "För den här tekniken."])
        ])
      }),

      pg("c8", ["The product report", "Produktrapporten"], [
        "{{person.legal.name}} raises the product security rules. A build of a product you supply pulled code from an unknown source, and a hostile version of the same trick was live for hours.\n\nIt is not clear whether this counts as a severe incident affecting the product's security. If it does, an early warning was due within 24 hours of becoming aware.",
        "{{person.legal.name}} tar upp reglerna om produktsäkerhet. Ett bygge av en produkt ni levererar hämtade kod från en okänd källa, och en fientlig version av samma trick var aktiv i flera timmar.\n\nDet är oklart om det räknas som en allvarlig incident som påverkar produktens säkerhet. Om det gör det skulle en tidig varning ha lämnats inom 24 timmar från kännedom."
      ], {
        choice: ask(["Do you report?", "Rapporterar ni?"], ["Reports with a clear account, erring on the side of transparency.", "Rapporterar med en tydlig redogörelse, och väljer hellre öppenhet."], [
          opt(["Report with a clear account of what reached the product", "Rapportera med en tydlig redogörelse för vad som nådde produkten"], "c9", ["Transparent, and shows control.", "Öppet, och visar kontroll."]),
          opt(["Document the decision not to report", "Dokumentera beslutet att inte rapportera"], "c9", ["Defensible if the reasoning is sound.", "Försvarbart om resonemanget håller."])
        ])
      }),

      pg("c9", ["The developers", "Utvecklarna"], [
        "The developers are tired. Builds have been frozen, secrets rotated, and every project's configuration changed. Some say security made their week miserable; others say they were the ones who found it.\n\nThe developer who first noticed version 99 in the log asks, quietly, whether anyone will mention that it was them.",
        "Utvecklarna är trötta. Byggen har frysts, hemligheter bytts och varje projekts konfiguration ändrats. En del säger att säkerhet gjorde veckan eländig; andra säger att det var de som hittade det.\n\nUtvecklaren som först lade märke till version 99 i loggen frågar, tyst, om någon kommer att nämna att det var hen."
      ], {
        choice: ask(["How do you close the week with the developers?", "Hur avslutar ni veckan med utvecklarna?"], ["Recognises the developer who noticed and explains the changes plainly.", "Uppmärksammar utvecklaren som såg det och förklarar ändringarna enkelt."], [
          opt(["Thank the developer publicly and explain the changes", "Tacka utvecklaren offentligt och förklara ändringarna"], "c10", ["Makes noticing things worth it.", "Gör det värt att lägga märke till saker."]),
          opt(["Move on quickly", "Gå vidare snabbt"], "c10", ["Efficient. Missed chance.", "Effektivt. En missad chans."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Two weeks later. The public package is gone, the write-up is out or about to be, and builds are running again.\n\nThe crisis team meets one last time. The question is no longer this package but every name you use inside, and every source your builds trust without asking.",
        "Två veckor senare. Det öppna paketet är borta, texten är publicerad eller på väg och byggena körs igen.\n\nKrisledningen träffas en sista gång. Frågan är inte längre det här paketet utan varje namn ni använder internt, och varje källa era byggen litar på utan att fråga."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Locks internal names to the internal registry for good and reserves them publicly.", "Låser interna namn till det interna registret för gott och reserverar dem publikt."], [
          opt(["Scoped internal packages, reserved public names, isolated releases", "Interna paket i eget namnområde, reserverade publika namn, isolerade releaser"], "r-end", ["Closes the technique for good.", "Stänger tekniken för gott."]),
          opt(["A dependency review board", "En granskningsgrupp för beroenden"], "r-end", ["Useful, and slow.", "Användbart, och långsamt."]),
          opt(["Remove internal names from job adverts", "Ta bort interna namn från platsannonser"], "r-end", ["They are already out there.", "De finns redan där ute."])
        ])
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
          opt(["Withdraw the report and apologise", "Dra tillbaka anmälan och be om ursäkt"], "x2", ["Late, and it helps.", "Sent, och det hjälper."]),
          opt(["Defend the report as protecting the company", "Försvara anmälan som ett skydd av företaget"], "x2", ["More headlines.", "Fler rubriker."])
        ])
      }),
      pg("x2", ["The customers ask", "Kunderna frågar"], [
        "Customers have read the coverage. Several security teams ask whether the desktop agent they run was built with code from the researcher's package, and why they had to learn it from the news.\n\nTwo large customers pause automatic updates until you answer.",
        "Kunderna har läst bevakningen. Flera säkerhetsteam frågar om skrivbordsagenten de kör byggdes med kod från forskarens paket, och varför de var tvungna att få veta det från nyheterna.\n\nTvå stora kunder pausar de automatiska uppdateringarna tills ni svarar."
      ], {
        choice: ask(["What do you tell customers?", "Vad säger ni till kunderna?"], ["Gives a full technical account and a clean rebuild.", "Ger en fullständig teknisk redogörelse och ett rent ombygge."], [
          opt(["A full technical account and a clean rebuild", "En fullständig teknisk redogörelse och ett rent ombygge"], "x3", ["What they needed a week ago.", "Det de behövde för en vecka sedan."]),
          opt(["A short statement that customers were never at risk", "Ett kort uttalande om att kunderna aldrig var i fara"], "x3", ["True, and not what they asked.", "Sant, och inte det de frågade."])
        ])
      }),
      pg("x3", ["The copycat", "Efterapningen"], [
        "While attention was on the researcher, the hostile version's beacon kept calling home from two laptops that nobody checked.\n\n{{person.socLead.name}} finds it now, a week late. The laptops belong to developers with access to the release pipeline.",
        "Medan uppmärksamheten låg på forskaren fortsatte den fientliga versionens anropare att höra av sig från två datorer som ingen kontrollerade.\n\n{{person.socLead.name}} hittar den nu, en vecka för sent. Datorerna tillhör utvecklare med åtkomst till releasekedjan."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Treats the release pipeline as compromised and rebuilds it.", "Behandlar releasekedjan som komprometterad och bygger om den."], [
          opt(["Rebuild the release pipeline and rotate everything", "Bygg om releasekedjan och byt allt"], "x4", ["A week of work you could have avoided.", "En veckas arbete som gick att undvika."]),
          opt(["Clean the two laptops", "Rensa de två datorerna"], "x4", ["And the week they were connected?", "Och veckan de var anslutna?"])
        ])
      }),
      pg("x4", ["The supervisor", "Tillsynsmyndigheten"], [
        "{{reg.csirt}} has seen the coverage and asks about the hostile package, the shipped agent and the beacon on developer machines.\n\nThe researcher is cooperating with them. You are explaining, at the same time, why you reported the researcher to the police.",
        "{{reg.csirt}} har sett bevakningen och frågar om det fientliga paketet, den levererade agenten och anroparen på utvecklarnas datorer.\n\nForskaren samarbetar med dem. Ni förklarar, samtidigt, varför ni polisanmälde forskaren."
      ], {
        choice: ask(["How do you engage?", "Hur deltar ni?"], ["Cooperates fully and transparently.", "Samarbetar fullt ut och öppet."], [
          opt(["Full cooperation", "Fullt samarbete"], "e5", ["The way back starts here.", "Vägen tillbaka börjar här."]),
          opt(["Answer only what is asked", "Svara bara på det som frågas"], "e5", ["Slow and suspicious.", "Långsamt och misstänkt."])
        ])
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
