/*
 * b03-api-scraping.js — "The Open Door in the App" (branching, API abuse).
 *
 * A forum seller offers customer records scraped through the mobile app's API:
 * any logged-in user could read any customer by changing an id. Spine: is the
 * sample real → the pattern in the logs → how many records → notification →
 * customers → the seller → the app stores → the regulator's question → what
 * changes. Alternative early path: switching the API off. Break-away at the
 * seller page: a press conference blaming "sophisticated criminals".
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b03-api-scraping",
    version: 1,
    format: "branching",
    category: "api-abuse",
    archetype: "ambiguous-start",
    emblem: "api-scrape",
    title: L(["The Open Door in the App", "Den öppna dörren i appen"]),
    summary: L([
      "A forum seller offers your customers' records. Nobody broke in: the app's API simply handed out any customer's data to anyone who asked.",
      "En säljare på ett forum erbjuder era kunders uppgifter. Ingen har brutit sig in: appens API lämnade helt enkelt ut vilken kunds uppgifter som helst till den som frågade."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Verify a data-sale claim quickly and calmly", "Verifiera ett påstående om försäljning av data snabbt och lugnt"]) },
      { id: "lo2", text: L(["Fix an authorisation flaw without breaking the service", "Rätta ett behörighetsfel utan att slå ut tjänsten"]) },
      { id: "lo3", text: L(["Notify when the 'breach' is a design flaw", "Anmäla när ”intrånget” är ett konstruktionsfel"]) },
      { id: "lo4", text: L(["Handle a security researcher's earlier warning honestly", "Hantera en säkerhetsforskares tidigare varning ärligt"]) }
    ],
    mitre: ["T1190", "T1119", "T1020", "T1589", "T1566"],
    frameworks: {
      nistCsf: ["ID.RA", "PR.AA", "PR.PS", "DE.CM", "RS.AN", "RS.CO", "RS.MI"],
      iso27001: ["A.5.24", "A.5.26", "A.8.3", "A.8.26", "A.8.28", "A.8.29", "A.8.16"]
    },
    constraints: { startWindow: "business-hours", sectors: ["retail", "technology", "transport"] },
    actor: { types: ["criminal"], motivation: L(["Financial: scraping and reselling customer data", "Ekonomisk: skrapa och sälja vidare kunddata"]), capability: "low" },
    variables: {
      records: { min: 40000, max: 1800000, scaleBy: "size", step: 1000 },
      requestsMillions: { min: 2, max: 60, scaleBy: "size" },
      oldVersionShare: { min: 8, max: 30 }
    },
    roles: ["incidentCommander", "ciso", "devLead", "socLead", "serviceOwner", "legal", "dpo", "comms", "ceo", "cio"],

    flags: {
      dismissed: L(["Dismissed the sale at first", "Avfärdade försäljningen först"]),
      patched: L(["Authorisation flaw fixed quickly", "Behörighetsfelet rättat snabbt"]),
      reviewAll: L(["Every endpoint reviewed", "Alla ändpunkter granskade"]),
      notified: L(["Notified the DPA in time", "Anmält till dataskyddsmyndigheten i tid"]),
      notifyLate: L(["Notification delayed", "Anmälan försenad"]),
      denied: L(["Argued it was not a breach", "Hävdade att det inte var en incident"]),
      researcherSilenced: L(["Asked the researcher to stay quiet", "Bad forskaren att tiga"]),
      customersTold: L(["Customers warned directly", "Kunderna varnade direkt"]),
      paid: L(["Paid the seller", "Betalade säljaren"])
    },

    start: "c1",
    pages: [
      pg("c1", ["For sale", "Till salu"], [
        "{{time.T+0|clock}}. {{person.socLead.name}} forwards a forum post: “{{num.records|number}} customer records from the {{org.shortName}} app, fresh, with addresses and phone numbers.” A sample of fifty rows is attached.",
        "Klockan {{time.T+0|clock}}. {{person.socLead.name}} vidarebefordrar ett foruminlägg: ”{{num.records|number}} kunduppgifter från {{org.shortName}}-appen, färska, med adresser och telefonnummer.” Ett utdrag på femtio rader är bifogat."
      ], {
        injects: [
          inj("b3-1", 0, "threatIntel", "threatIntel", "high", "unverified", [
            "Seller with a short history offers app customer records. Sample fields: customer id, name, email, phone, address, loyalty points. Price on request.",
            "En säljare med kort historik erbjuder kunduppgifter från appen. Fält i utdraget: kund-id, namn, e-post, telefon, adress, bonuspoäng. Pris på förfrågan."
          ], { headline: ["Forum listing: app customer records", "Foruminlägg: kunduppgifter från appen"], statedReliability: ["Single source, unverified", "En källa, inte verifierad"], tests: ["lo1"] })
        ],
        discuss: [q("How would you check the sample without spreading it further?", "Hur kontrollerar ni utdraget utan att sprida det vidare?", ["socLead", "dpo"])],
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Verifies the sample against your own data quietly before deciding anything else.", "Verifierar utdraget mot era egna uppgifter i tysthet innan något annat beslutas."], [
          opt(["Check the sample against the customer database", "Kontrollera utdraget mot kunddatabasen"], "c2", ["An hour of work tells you whether this is real.", "En timmes arbete visar om det här är på riktigt."]),
          opt(["Dismiss it: probably recycled from an old breach elsewhere", "Avfärda det: troligen återvunnet från ett gammalt intrång någon annanstans"], "c2", ["Often true. Costly when it isn't.", "Ofta sant. Dyrt när det inte stämmer."], { set: "dismissed" }),
          opt(["Switch off the app's API now, just in case", "Stäng av appens API nu, för säkerhets skull"], "c2b", ["Stops any ongoing leak and every customer's app with it.", "Stoppar ett pågående läckage, och varje kunds app samtidigt."])
        ])
      }),

      pg("c2", ["The pattern", "Mönstret"], [
        "{{person.devLead.name}} finds it in the API logs: {{num.requestsMillions}} million requests to /customers/{id}, counting upwards, from rotating addresses. Any logged-in user could read any customer.",
        "{{person.devLead.name}} hittar det i API-loggarna: {{num.requestsMillions}} miljoner anrop till /customers/{id}, uppräknande, från roterande adresser. Vilken inloggad användare som helst kunde läsa vilken kund som helst."
      ], {
        variants: [vr("dismissed", [
          "The seller posts a bigger sample. {{person.devLead.name}} checks the API logs: {{num.requestsMillions}} million requests to /customers/{id}, counting upwards. Any logged-in user could read any customer.",
          "Säljaren lägger ut ett större utdrag. {{person.devLead.name}} kontrollerar API-loggarna: {{num.requestsMillions}} miljoner anrop till /customers/{id}, uppräknande. Vilken inloggad användare som helst kunde läsa vilken kund som helst."
        ], ["Because you dismissed it this morning, the seller has had another day to advertise.", "Eftersom ni avfärdade det i morse har säljaren fått ännu en dag att marknadsföra sig."])],
        injects: [
          inj("b3-2", 90, "logExcerpt", "siem", "high", "confirmed", [
            "GET /api/v2/customers/100231 200 · GET /api/v2/customers/100232 200 · GET /api/v2/customers/100233 200 … token belongs to customer 88410 in every request.",
            "GET /api/v2/customers/100231 200 · GET /api/v2/customers/100232 200 · GET /api/v2/customers/100233 200 … token tillhör kund 88410 i varje anrop."
          ], { headline: ["API gateway log, last three weeks", "API-gatewayens logg, senaste tre veckorna"], tests: ["lo2"] })
        ],
        discuss: [q("What does the fix need to do, and how quickly can you test it?", "Vad behöver rättningen göra, och hur snabbt kan ni testa den?", ["devLead"])],
        choice: ask(["How do you close the door?", "Hur stänger ni dörren?"], ["Fixes the authorisation check itself; blocking addresses only slows a scraper down.", "Rättar själva behörighetskontrollen; att blockera adresser bromsar bara en skrapare."], [
          opt(["Emergency fix: check that the record belongs to the caller", "Akut rättning: kontrollera att posten tillhör den som frågar"], "l1", ["The real fix. Needs a careful test, but it is a small change.", "Den verkliga rättningen. Kräver noggrant test, men ändringen är liten."], { set: "patched" }),
          opt(["Rate-limit and block the addresses", "Begränsa anropstakten och blockera adresserna"], "l1", ["Buys time. The scraper moves to new addresses.", "Ger tid. Skraparen flyttar till nya adresser."]),
          opt(["Take the endpoint offline until fixed", "Ta ändpunkten ur drift tills den är rättad"], "l1", ["Safe. Customers lose their profile page for a day.", "Säkert. Kunderna förlorar sin profilsida i ett dygn."])
        ])
      }),

      pg("c2b", ["The app goes dark", "Appen slocknar"], [
        "With the API off, the app shows errors for every customer. Store ratings drop by the hour and support is flooded.",
        "Med API:et avstängt visar appen fel för varje kund. Betygen i appbutikerna sjunker för varje timme och supporten översvämmas."
      ], {
        choice: ask(["How long does it stay off?", "Hur länge får det vara avstängt?"], ["Uses the outage to fix the cause, and tells customers what is happening.", "Använder avbrottet till att rätta orsaken, och berättar för kunderna vad som händer."], [
          opt(["Off until the authorisation flaw is fixed and tested", "Avstängt tills behörighetsfelet är rättat och testat"], "c3", ["Painful for a day, then done properly.", "Smärtsamt i ett dygn, sedan gjort ordentligt."], { set: "patched" }),
          opt(["Back on within the hour, with rate limiting", "Tillbaka inom en timme, med begränsad anropstakt"], "c3", ["The door is open again, just narrower.", "Dörren är öppen igen, bara smalare."])
        ])
      }),

      pg("l1", ["Who built it?", "Vem byggde den?"], [
        "The endpoint was added eighteen months ago by a contractor team, to speed up the loyalty feature. It was never reviewed.",
        "Ändpunkten lades till för arton månader sedan av ett konsultteam, för att snabba upp bonusfunktionen. Den granskades aldrig."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do about the rest of the API?", "Vad gör ni med resten av API:et?"], ["Assumes the same mistake exists elsewhere and looks for it.", "Utgår från att samma misstag finns på fler ställen och letar efter det."], [
          opt(["Review every endpoint for the same flaw now", "Granska varje ändpunkt efter samma fel nu"], "c3", ["A week of developer time, and it will find more.", "En veckas utvecklartid, och den kommer att hitta mer."], { set: "reviewAll" }),
          opt(["Fix this one and move on", "Rätta den här och gå vidare"], "c3", ["Fast. Bets that this was the only one.", "Snabbt. Satsar på att det här var det enda."])
        ])
      }),

      pg("c3", ["How many?", "Hur många?"], [
        "Log analysis so far: the scraper read about {{num.records|number}} customer records over three weeks. The forum sample matches your data exactly.",
        "Logganalysen hittills: skraparen läste ungefär {{num.records|number}} kundposter under tre veckor. Utdraget på forumet stämmer exakt med era uppgifter."
      ], {
        chart: { id: "b3-scrape", type: "kpi", title: L(["What the logs show", "Vad loggarna visar"]), data: kpi([
          { id: "k1", label: ["Records read", "Lästa poster"], value: (v) => v.records, tone: "danger" },
          { id: "k2", label: ["Requests (millions)", "Anrop (miljoner)"], value: (v) => v.requestsMillions, tone: "warn" }
        ]) },
        choice: ask(["What scope do you work from?", "Vilken omfattning utgår ni från?"], ["Treats everything the scraper could read as exposed.", "Behandlar allt skraparen kunde läsa som exponerat."], [
          opt(["Everything the scraper read is exposed", "Allt skraparen läste är exponerat"], "c4", ["Honest and big.", "Ärligt och stort."]),
          opt(["Only what appears in the forum sample", "Bara det som syns i forumets utdrag"], "c4", ["Small and wrong.", "Litet och fel."]),
          opt(["Wait for the full analysis in two weeks", "Vänta på den fullständiga analysen om två veckor"], "c4", ["Precise, and far beyond 72 hours.", "Exakt, och långt efter 72 timmar."])
        ])
      }),

      pg("c4", ["The 72 hours", "De 72 timmarna"], [
        "{{person.legal.name}} asks whether this even counts: nobody broke in, the app just answered questions. {{person.dpo.name}} disagrees.",
        "{{person.legal.name}} frågar om det här ens räknas: ingen bröt sig in, appen svarade bara på frågor. {{person.dpo.name}} håller inte med."
      ], {
        discuss: [q("Does it matter for the notification that the attacker used the app as designed?", "Spelar det någon roll för anmälan att angriparen använde appen som den var byggd?", ["legal", "dpo"])],
        choice: ask(["Do you notify {{reg.dpaShort}}?", "Anmäler ni till {{reg.dpaShort}}?"], ["Recognises unauthorised disclosure as a breach regardless of how it happened.", "Inser att obehörigt röjande är en incident oavsett hur det gick till."], [
          opt(["Notify now with what you know", "Anmäl nu med det ni vet"], "l2", ["Meets the deadline; the scope will grow later.", "Håller tidsgränsen; omfattningen kommer att växa senare."], { set: "notified" }),
          opt(["Wait for the full analysis", "Vänta på den fullständiga analysen"], "l2", ["Late, but with better numbers.", "Sent, men med bättre siffror."], { set: "notifyLate" }),
          opt(["Not a breach: the data was available through the app", "Ingen incident: uppgifterna var tillgängliga via appen"], "l2", ["A legal argument that rarely survives contact with the regulator.", "Ett juridiskt argument som sällan överlever mötet med tillsynsmyndigheten."], { set: "denied" })
        ])
      }),

      pg("l2", ["She told you", "Hon sa det"], [
        "A security researcher emails: she reported this exact endpoint four months ago. Your vulnerability inbox closed it as a duplicate.",
        "En säkerhetsforskare mejlar: hon rapporterade exakt den här ändpunkten för fyra månader sedan. Er sårbarhetsbrevlåda stängde ärendet som en dubblett."
      ], {
        long: true,
        skipTo: "c5",
        injects: [
          inj("b3-3", 600, "email", "employee", "medium", "confirmed", [
            "I reported the customer endpoint on the 3rd, with a proof of concept. You replied that it was a known issue. I assume it is now being exploited?",
            "Jag rapporterade kundändpunkten den 3:e, med ett konceptbevis. Ni svarade att det var ett känt problem. Jag antar att det nu utnyttjas?"
          ], { headline: ["From an external researcher", "Från en extern forskare"], tests: ["lo4"] })
        ],
        choice: ask(["How do you respond to her?", "Hur svarar ni henne?"], ["Owns the mistake, thanks the researcher and keeps the report on record.", "Tar på sig misstaget, tackar forskaren och behåller rapporten i dokumentationen."], [
          opt(["Acknowledge it, thank her and pay the bounty", "Bekräfta, tacka henne och betala ut belöningen"], "c5", ["Honest and builds a relationship you need.", "Ärligt och bygger en relation ni behöver."]),
          opt(["Ask her to keep quiet while you investigate", "Be henne tiga medan ni utreder"], "c5", ["Understandable. It will read badly later.", "Begripligt. Det kommer att se illa ut senare."], { set: "researcherSilenced" })
        ])
      }),

      pg("c5", ["The customers", "Kunderna"], [
        "{{num.records|number}} customers' names, addresses and phone numbers are on sale. What do you tell them?",
        "{{num.records|number}} kunders namn, adresser och telefonnummer är till salu. Vad säger ni till dem?"
      ], {
        choice: ask(["How do you inform customers?", "Hur informerar ni kunderna?"], ["Tells customers directly, with concrete advice about the scams that will follow.", "Berättar direkt för kunderna, med konkreta råd om bedrägerierna som kommer att följa."], [
          opt(["Message every affected customer with fraud advice", "Meddela varje berörd kund med råd om bedrägerier"], "l3", ["Big, and the right size.", "Stort, och lagom stort."], { set: "customersTold" }),
          opt(["A notice on the website", "Ett meddelande på webbplatsen"], "l3", ["Most affected customers will never see it.", "De flesta berörda kunder kommer aldrig att se det."]),
          opt(["Nothing unless they ask", "Ingenting om de inte frågar"], "l3", ["They will ask, after the scams start.", "De kommer att fråga, när bedrägerierna har börjat."])
        ])
      }),

      pg("l3", ["Points for sale", "Poäng till salu"], [
        "Text messages reach customers: “Your {{org.shortName}} points expire tonight. Log in to keep them.” The link goes to a copy of your login page.",
        "Sms når kunderna: ”Dina {{org.shortName}}-poäng går ut i natt. Logga in för att behålla dem.” Länken går till en kopia av er inloggningssida."
      ], {
        long: true,
        skipTo: "c6",
        variants: [vr("customersTold", [
          "Text messages reach customers about expiring points, linking to a copy of your login page. Because you warned them, many forward the message to support instead of clicking.",
          "Sms om poäng som går ut når kunderna, med länk till en kopia av er inloggningssida. Eftersom ni varnade dem skickar många meddelandet till supporten i stället för att klicka."
        ], ["Because customers were warned, the scam works less well.", "Eftersom kunderna varnades fungerar bedrägeriet sämre."])],
        choice: ask(["How do you fight the scam?", "Hur bekämpar ni bedrägeriet?"], ["Acts against the scam infrastructure and warns customers where they actually look.", "Agerar mot bedragarnas infrastruktur och varnar kunderna där de faktiskt tittar."], [
          opt(["Report the sender and the site, and warn inside the app", "Anmäl avsändaren och sidan, och varna i appen"], "c6", ["Fast and visible to the right people.", "Snabbt och synligt för rätt personer."]),
          opt(["A general reminder to be careful", "En allmän påminnelse om att vara försiktig"], "c6", ["Nobody reads general reminders.", "Ingen läser allmänna påminnelser."])
        ])
      }),

      pg("c6", ["The seller writes", "Säljaren hör av sig"], [
        "The forum seller contacts {{person.ciso.name}} directly: pay, and the data will be “deleted and never sold again”.",
        "Säljaren på forumet kontaktar {{person.ciso.name}} direkt: betala, så blir uppgifterna ”raderade och aldrig sålda igen”."
      ], {
        choice: ask(["How do you respond to the seller?", "Hur svarar ni säljaren?"], ["Refuses to buy a promise from a criminal, preserves the contact for the police.", "Vägrar köpa ett löfte från en kriminell, och sparar kontakten åt polisen."], [
          opt(["Refuse, preserve the messages, report to the police", "Vägra, spara meddelandena, anmäl till polisen"], "c7", ["The data is already sold. Do not fund the next scrape.", "Uppgifterna är redan sålda. Finansiera inte nästa skrapning."]),
          opt(["Let a specialist negotiator talk to them", "Låt en specialiserad förhandlare prata med dem"], "c7b", ["You may learn who else bought it.", "Ni kan få veta vem mer som har köpt dem."]),
          opt(["Pay for deletion", "Betala för radering"], "c7", ["You are paying for a promise from a thief.", "Ni betalar för ett löfte från en tjuv."], { set: "paid" }),
          opt(["Call a press conference about the criminal attack", "Kalla till presskonferens om det kriminella angreppet"], "x1", ["Takes the initiative. Also takes the spotlight.", "Tar initiativet. Tar också strålkastarljuset."])
        ])
      }),

      pg("c7b", ["The negotiator", "Förhandlaren"], [
        "The negotiator learns that the seller is a scraping crew that has already sold copies to at least three buyers. Deletion is not on offer, whatever they say.",
        "Förhandlaren får veta att säljaren är en grupp som skrapar data och redan har sålt kopior till minst tre köpare. Radering är inte möjligt, vad de än säger."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Uses the intelligence and ends the contact.", "Använder underrättelserna och avslutar kontakten."], [
          opt(["End the talks and hand everything to the police", "Avsluta samtalen och lämna allt till polisen"], "c7", ["Done with what you learned.", "Klart, med det ni har lärt er."]),
          opt(["Keep talking to learn more", "Fortsätt prata för att få veta mer"], "c7", ["Diminishing returns, rising risk.", "Avtagande nytta, ökande risk."])
        ])
      }),

      pg("c7", ["The app stores", "Appbutikerna"], [
        "Both app stores ask about the incident and whether your privacy disclosures are still accurate.",
        "Båda appbutikerna frågar om incidenten och om era integritetsuppgifter fortfarande stämmer."
      ], {
        variants: [vr("paid", [
          "The seller took your money and posted a new listing the next day, “now with phone numbers verified”. Both app stores ask about the incident.",
          "Säljaren tog era pengar och lade ut en ny annons dagen efter, ”nu med verifierade telefonnummer”. Båda appbutikerna frågar om incidenten."
        ], ["Because you paid, the seller knows you pay.", "Eftersom ni betalade vet säljaren att ni betalar."])],
        choice: ask(["How do you answer the stores?", "Hur svarar ni appbutikerna?"], ["Answers accurately and pushes a fixed app version.", "Svarar korrekt och skickar ut en rättad appversion."], [
          opt(["Update the disclosures and push a required app update", "Uppdatera uppgifterna och skicka ut en obligatorisk appuppdatering"], "l4", ["Clean and visible to customers.", "Rent och synligt för kunderna."]),
          opt(["Answer briefly and wait", "Svara kort och vänta"], "l4", ["Stores can pull an app if answers are thin.", "Butikerna kan ta bort en app om svaren är tunna."])
        ])
      }),

      pg("l4", ["The old app versions", "De gamla appversionerna"], [
        "{{num.oldVersionShare}} percent of customers still run old app versions that use API v1, and v1 has the same flaw.",
        "{{num.oldVersionShare}} procent av kunderna kör fortfarande gamla appversioner som använder API v1, och v1 har samma fel."
      ], {
        long: true,
        skipTo: "c8",
        variants: [vr("reviewAll", [
          "The endpoint review already flagged it: API v1 has the same flaw, and {{num.oldVersionShare}} percent of customers still use old app versions that call it.",
          "Granskningen av ändpunkterna har redan flaggat det: API v1 har samma fel, och {{num.oldVersionShare}} procent av kunderna använder fortfarande gamla appversioner som anropar det."
        ], ["Because every endpoint was reviewed, you found this before the scrapers did.", "Eftersom varje ändpunkt granskades hittade ni det här före skraparna."])],
        choice: ask(["What happens to API v1?", "Vad händer med API v1?"], ["Closes the old door even at the cost of forcing upgrades.", "Stänger den gamla dörren även om det tvingar fram uppgraderingar."], [
          opt(["Shut v1 now and force the upgrade", "Stäng v1 nu och tvinga fram uppgraderingen"], "c8", ["Some customers lose the app for a day.", "En del kunder förlorar appen i ett dygn."]),
          opt(["Keep v1 running for a month", "Låt v1 vara kvar en månad"], "c8", ["A month of the same open door.", "En månad till med samma öppna dörr."])
        ])
      }),

      pg("c8", ["When did you know?", "När visste ni?"], [
        "{{reg.dpaShort}} sends questions. The first one: when did you first become aware of the flaw?",
        "{{reg.dpaShort}} skickar frågor. Den första: när fick ni först kännedom om felet?"
      ], {
        variants: [vr("researcherSilenced", [
          "{{reg.dpaShort}} sends questions, and attaches a copy of the researcher's report from four months ago. The first question: when did you first become aware of the flaw?",
          "{{reg.dpaShort}} skickar frågor och bifogar en kopia av forskarens rapport från för fyra månader sedan. Den första frågan: när fick ni först kännedom om felet?"
        ], ["Because you asked the researcher to stay quiet, she went to the regulator instead.", "Eftersom ni bad forskaren tiga vände hon sig till tillsynsmyndigheten i stället."])],
        choice: ask(["What do you answer?", "Vad svarar ni?"], ["Discloses the earlier report openly; the regulator will find it anyway.", "Redovisar den tidigare rapporten öppet; myndigheten hittar den ändå."], [
          opt(["Four months ago, with the closed report attached", "För fyra månader sedan, med den stängda rapporten bifogad"], "c9", ["Uncomfortable and credible.", "Obekvämt och trovärdigt."]),
          opt(["This week, when the sale was found", "Den här veckan, när försäljningen upptäcktes"], "c9", ["Technically defensible, and it will not look that way.", "Tekniskt försvarbart, och det kommer inte att se ut så."])
        ])
      }),

      pg("c9", ["What changes", "Vad som ändras"], [
        "A month later. The fix is in and the scrapers have moved on. What do you change so the next endpoint is not the same?",
        "En månad senare. Rättningen är på plats och skraparna har gått vidare. Vad ändrar ni så att nästa ändpunkt inte blir likadan?"
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Builds authorisation tests into delivery so the flaw cannot ship again.", "Bygger in behörighetstester i leveransen så att felet inte kan skeppas igen."], [
          opt(["Automatic authorisation tests in the build pipeline", "Automatiska behörighetstester i byggkedjan"], "c10", ["Catches the whole class of bug, every release.", "Fångar hela klassen av fel, i varje release."]),
          opt(["An annual penetration test", "Ett årligt penetrationstest"], "c10", ["Useful once a year. Releases happen weekly.", "Nyttigt en gång om året. Releaser sker varje vecka."]),
          opt(["A web application firewall", "En brandvägg för webbapplikationer"], "c10", ["Does not understand who owns which record.", "Förstår inte vem som äger vilken post."])
        ])
      }),

      pg("c10", ["Is it safe now?", "Är det säkert nu?"], [
        "The board asks {{person.cio.name}} a simple question: is the app safe now?",
        "Styrelsen ställer en enkel fråga till {{person.cio.name}}: är appen säker nu?"
      ], {
        choice: ask(["What do you answer?", "Vad svarar ni?"], ["Gives evidence and remaining risk rather than a yes.", "Ger belägg och kvarvarande risk i stället för ett ja."], [
          opt(["“Safer. Here is the evidence, and here is what is left.”", "”Säkrare. Här är beläggen, och här är det som återstår.”"], "r-end", ["The board can govern with that.", "Med det kan styrelsen styra."]),
          opt(["“Yes, it's fixed.”", "”Ja, det är åtgärdat.”"], "r-end", ["Until the next finding.", "Fram till nästa fynd."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["notified", "patched", "customersTold"], "e1"],
          ["notified", "e2"],
          [["patched", "!denied"], "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["A flaw, fixed and owned", "Ett fel, rättat och erkänt"], [
          "The door was closed within a day, customers were warned before the scams peaked and the regulator heard it from you. The case closes with recommendations.",
          "Dörren stängdes inom ett dygn, kunderna varnades innan bedrägerierna nådde sin topp och tillsynsmyndigheten fick veta det av er. Ärendet avslutas med rekommendationer."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Notified, slowly fixed", "Anmält, långsamt rättat"], [
          "You notified in time, but the flaw stayed open longer than it should or customers learned of it late. The regulator asks for a remediation plan.",
          "Ni anmälde i tid, men felet stod öppet längre än det borde eller så fick kunderna veta det sent. Tillsynsmyndigheten begär en åtgärdsplan."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Fixed, but late on paper", "Rättat, men sent på papperet"], [
          "The flaw was fixed quickly, but the notification came after 72 hours. The regulator criticises the delay and the earlier closed report.",
          "Felet rättades snabbt, men anmälan kom efter 72 timmar. Tillsynsmyndigheten kritiserar dröjsmålet och den tidigare stängda rapporten."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["“Not a breach”", "”Ingen incident”"], [
          "You argued it was not a breach, or left the door open. The regulator disagrees, opens an investigation and asks why a reported flaw stayed open for four months.",
          "Ni hävdade att det inte var en incident, eller lät dörren stå öppen. Tillsynsmyndigheten håller inte med, inleder en utredning och frågar varför ett rapporterat fel stod öppet i fyra månader."
        ])
      }),

      // Break-away: the press conference.
      pg("x1", ["The press conference", "Presskonferensen"], [
        "Cameras, microphones and one question from a technology reporter: “Was this really an attack, or did your app just give the data away?”",
        "Kameror, mikrofoner och en fråga från en teknikreporter: ”Var det här verkligen ett angrepp, eller gav er app bara bort uppgifterna?”"
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers the factual question honestly, even on camera.", "Besvarar sakfrågan ärligt, även framför kameran."], [
          opt(["“Sophisticated criminals attacked our systems.”", "”Sofistikerade kriminella angrep våra system.”"], "x2", ["A line that can be disproved within a day.", "En formulering som kan motbevisas inom ett dygn."]),
          opt(["“Our app had a flaw, and criminals used it.”", "”Vår app hade ett fel, och kriminella utnyttjade det.”"], "x2", ["Honest, and late to say it at a press conference you called.", "Ärligt, och sent att säga det på en presskonferens ni själva kallat till."])
        ])
      }),
      pg("x2", ["The researcher's blog", "Forskarens blogg"], [
        "The researcher publishes her four-month-old report, with your reply closing it as a duplicate.",
        "Forskaren publicerar sin fyra månader gamla rapport, tillsammans med ert svar som stängde den som dubblett."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Apologises and corrects the record without attacking the messenger.", "Ber om ursäkt och rättar uppgifterna utan att angripa budbäraren."], [
          opt(["Apologise publicly and thank her", "Be om ursäkt offentligt och tacka henne"], "x3", ["The only response that ages well.", "Det enda svaret som håller över tid."]),
          opt(["Question her motives", "Ifrågasätt hennes motiv"], "x3", ["Turns a bad story into a worse one.", "Gör en dålig historia ännu sämre."])
        ])
      }),
      pg("x3", ["An investigation", "En utredning"], [
        "{{reg.dpaShort}} opens an investigation on its own initiative, citing the press conference and the researcher's report.",
        "{{reg.dpaShort}} inleder en utredning på eget initiativ, med hänvisning till presskonferensen och forskarens rapport."
      ], {
        choice: ask(["How do you engage?", "Hur bemöter ni utredningen?"], ["Cooperates fully and documents everything.", "Samarbetar fullt ut och dokumenterar allt."], [
          opt(["Full cooperation and a complete timeline", "Fullt samarbete och ett komplett händelseförlopp"], "x4", ["Reduces the damage that remains.", "Minskar den skada som återstår."]),
          opt(["Minimal answers through lawyers", "Minimala svar genom jurister"], "x4", ["Regulators notice.", "Tillsynsmyndigheter märker det."])
        ])
      }),
      pg("x4", ["The class action", "Grupptalan"], [
        "A consumer organisation announces a group claim on behalf of affected customers.",
        "En konsumentorganisation meddelar en grupptalan för de drabbade kundernas räkning."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Considers remedy for customers rather than only legal defence.", "Överväger gottgörelse för kunderna i stället för bara rättsligt försvar."], [
          opt(["Offer a settlement and practical remedies", "Erbjud förlikning och praktisk gottgörelse"], "e5", ["Expensive, and it ends the story sooner.", "Dyrt, och det avslutar historien tidigare."]),
          opt(["Defend in court", "Försvara er i domstol"], "e5", ["Years of headlines.", "År av rubriker."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
        ending: end(5, ["The cover story cracked", "Täckhistorien sprack"], [
          "Calling a design flaw an attack, in public, made the researcher's report the headline. An investigation and a class action follow.",
          "Att offentligt kalla ett konstruktionsfel för ett angrepp gjorde forskarens rapport till förstasidesnyhet. En utredning och en grupptalan följer."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Broken authorisation in an API is a breach even when nobody “broke in”.", "Bristande behörighetskontroll i ett API är en incident även när ingen ”bröt sig in”."]),
        L(["Fix the authorisation check; blocking addresses only slows scrapers.", "Rätta behörighetskontrollen; att blockera adresser bromsar bara skrapare."]),
        L(["A closed researcher report is part of your history. Own it.", "En stängd rapport från en forskare är en del av er historia. Ta ansvar för den."]),
        L(["Scraped contact data fuels scams within days. Warn customers directly.", "Skrapade kontaktuppgifter driver bedrägerier inom några dagar. Varna kunderna direkt."])
      ],
      strengthsToLookFor: [
        L(["Verifying the sample quietly and quickly", "Att verifiera utdraget tyst och snabbt"]),
        L(["Fixing the ownership check rather than rate-limiting", "Att rätta ägarkontrollen i stället för att begränsa anropstakten"]),
        L(["Being open about the researcher's earlier report", "Att vara öppen om forskarens tidigare rapport"])
      ],
      commonGaps: [
        L(["Arguing that scraped data is not a breach", "Att hävda att skrapade uppgifter inte är en incident"]),
        L(["Forgetting old API versions", "Att glömma gamla API-versioner"]),
        L(["Paying the seller for deletion", "Att betala säljaren för radering"])
      ],
      suggestedActions: [
        act(["Add object-level authorisation tests to the build pipeline.", "Lägg till behörighetstester på objektnivå i byggkedjan."], "devLead", "high"),
        act(["Review how the vulnerability inbox triages external reports.", "Se över hur sårbarhetsbrevlådan hanterar externa rapporter."], "ciso", "high"),
        act(["Retire old API versions on a fixed schedule.", "Avveckla gamla API-versioner enligt en fast plan."], "cio", "medium")
      ]
    }
  });
})();
