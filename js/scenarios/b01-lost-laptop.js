/*
 * b01-lost-laptop.js — "The Laptop on the Night Train" (branching, data loss).
 *
 * The CFO's laptop disappears on a night train; disk encryption was suspended
 * for an update. Spine: first move on identity → what was on it → police →
 * a sign-in from elsewhere → the acquisition model → the laptop for sale →
 * did they get in → the 72-hour question → the board → what changes.
 * Break-away at § "For sale": a public appeal that turns into extortion.
 * Endings by flags: revoked + rotated + notified (contained) … denied (severe).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b01-lost-laptop",
    version: 1,
    format: "branching",
    category: "data-loss",
    archetype: "human-legal-reputational",
    emblem: "laptop",
    title: L(["The Laptop on the Night Train", "Datorn på nattåget"]),
    summary: L([
      "The CFO's laptop is gone after a night train. The disk may not have been encrypted. Every choice decides how much of this becomes an incident.",
      "Ekonomichefens dator är borta efter en resa med nattåget. Disken var kanske inte krypterad. Varje val avgör hur mycket av det här som blir en incident."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Treat a lost device as an identity incident first", "Behandla en förlorad enhet som en identitetsincident i första hand"]), teaser: L(["What really goes missing when a thing goes missing", "Vad som egentligen försvinner när en sak försvinner"]) },
      { id: "lo2", text: L(["Establish what was on a device without guessing", "Fastställa vad som fanns på en enhet utan att gissa"]), teaser: L(["Knowing versus remembering", "Att veta kontra att minnas"]) },
      { id: "lo3", text: L(["Decide on personal-data notification under uncertainty", "Fatta beslut om anmälan av personuppgiftsincident under osäkerhet"]), teaser: L(["Deciding before all the facts are in", "Att besluta innan alla fakta finns"]) },
      { id: "lo4", text: L(["Handle inside information and the board", "Hantera insiderinformation och styrelsen"]), teaser: L(["Who needs to know, and when", "Vem som behöver veta, och när"]) }
    ],
    mitre: ["T1078", "T1550", "T1114", "T1005", "T1657"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.DS", "DE.CM", "RS.MA", "RS.CO"],
      iso27001: ["A.5.10", "A.5.24", "A.5.26", "A.6.7", "A.8.1", "A.8.24"]
    },
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["criminal"], motivation: L(["Opportunistic: a stolen laptop sold on, or ransomed back", "Opportunistisk: en stulen dator som säljs vidare eller lösas ut"]), capability: "low" },
    variables: {
      customersInExport: { min: 300, max: 12000, scaleBy: "size", step: 10 },
      askingPrice: { min: 4000, max: 9000, step: 500, currency: true },
      dealValue: { min: 80, max: 900, scaleBy: "size", step: 10 }
    },
    roles: ["incidentCommander", "ciso", "cfo", "ceo", "itOps", "socLead", "legal", "dpo", "comms", "securityOfficer"],

    flags: {
      sessionsRevoked: L(["Sessions revoked early", "Sessioner återkallade tidigt"]),
      wipeSent: L(["Remote wipe sent", "Fjärrradering skickad"]),
      policeReport: L(["Police report filed", "Polisanmälan gjord"]),
      notifyClock: L(["DPO started the 72-hour clock", "Dataskyddsombudet startade 72-timmarsklockan"]),
      keptQuiet: L(["Kept from the CEO and board", "Hölls från vd och styrelse"]),
      dealIgnored: L(["Deal risk ignored", "Risken för affären ignorerad"]),
      recovered: L(["Laptop recovered", "Datorn återfunnen"]),
      rotated: L(["Credentials on the device rotated", "Inloggningsuppgifter på enheten bytta"]),
      notified: L(["Notified the DPA in time", "Anmält till dataskyddsmyndigheten i tid"]),
      notifyLate: L(["Notification delayed", "Anmälan försenad"]),
      denied: L(["Decided not to notify", "Beslutat att inte anmäla"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Gone", "Borta"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.cfo.name}} calls from the platform, out of breath. The night train arrived twenty minutes ago and the laptop bag is not in the luggage rack above their seat. The conductor has already searched the carriage.\n\nThe laptop is a company machine, signed in to email, the finance systems and the board portal. Nobody yet knows whether it was stolen or simply picked up by mistake.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.cfo.name}} ringer andfådd från perrongen. Nattåget kom in för tjugo minuter sedan och datorväskan ligger inte på bagagehyllan ovanför platsen. Konduktören har redan letat igenom vagnen.\n\nDatorn är en tjänstedator, inloggad i e-post, ekonomisystemen och styrelseportalen. Ingen vet ännu om den har stulits eller bara tagits av misstag."
      ], {
        injects: [
          inj("b1-1", 0, "phoneTranscript", "person.cfo", "medium", "confirmed", [
            "“It had everything on it. Board papers, the model for the deal, my email. I was asleep most of the way. Can you just block it?”",
            "”Allt låg på den. Styrelsepappren, kalkylen för affären, min e-post. Jag sov större delen av resan. Kan ni inte bara spärra den?”"
          ], { tests: ["lo1"] })
        ],
        discuss: [q("Who needs to be on the call in the next fifteen minutes?", "Vilka behöver vara med i samtalet inom en kvart?", ["incidentCommander"]), q("What is the first thing an attacker could do with the laptop?", "Vad är det första en angripare kan göra med datorn?", ["socLead"])],
        facilitator: { notes: L(["Set the pace: this format moves fast. Push for a decision within two minutes.", "Sätt tempot: det här formatet går fort. Driv fram ett beslut inom två minuter."]) },
        choice: ask(["What is your first move?", "Vad gör ni först?"], ["Treats the device as a key to accounts, not just hardware: identity first, then the device.", "Behandlar enheten som en nyckel till konton, inte bara hårdvara: identitet först, sedan enheten."], [
          opt(["Revoke the CFO's sessions and tokens now", "Återkalla ekonomichefens sessioner och token nu"], "c2", ["Cuts off email and files even if the disk is readable. The CFO is locked out for an hour.", "Stänger e-post och filer även om disken går att läsa. Ekonomichefen blir utelåst en timme."], { set: "sessionsRevoked" }),
          opt(["Ask the train company's lost property first", "Fråga tågbolagets hittegods först"], "c2", ["Most lost laptops are just lost. But every hour of waiting is an hour of open sessions.", "De flesta borttappade datorer är bara borttappade. Men varje timme av väntan är en timme med öppna sessioner."]),
          opt(["Send a remote wipe command immediately", "Skicka ett kommando om fjärrradering direkt"], "c2", ["Only works if the device comes online, and destroys any chance to examine it.", "Fungerar bara om enheten kopplar upp sig, och förstör möjligheten att undersöka den."], { set: "wipeSent" })
        ])
      }),

      pg("c2", ["What was on it?", "Vad fanns på den?"], [
        "The device record shows something nobody wanted to hear: disk encryption was suspended for last night's update and never switched back on.\n\nThe CFO tries to remember what was on the laptop: board papers, the model for the acquisition, and “a customer export I was cleaning up”. They are not sure about anything else. The room has to decide how much to trust a tired person's memory.",
        "Enhetsregistret visar något ingen ville höra: diskkrypteringen pausades för nattens uppdatering och slogs aldrig på igen.\n\nEkonomichefen försöker minnas vad som fanns på datorn: styrelsepapper, kalkylen för förvärvet och ”en kundexport jag höll på att städa”. Om resten är hen osäker. Rummet måste avgöra hur mycket man kan lita på en trött människas minne."
      ], {
        variants: [vr("sessionsRevoked", [
          "Sessions are revoked. The CFO is annoyed but working again from a spare phone, and nobody can use the laptop's saved logins any more.\n\nThen the device record shows the bad news: disk encryption was suspended for last night's update and never switched back on. The CFO lists board papers, the acquisition model and “a customer export I was cleaning up”, but is not sure about anything else.",
          "Sessionerna är återkallade. Ekonomichefen är irriterad men arbetar igen från en reservtelefon, och ingen kan längre använda datorns sparade inloggningar.\n\nSedan visar enhetsregistret det dåliga beskedet: diskkrypteringen pausades för nattens uppdatering och slogs aldrig på igen. Ekonomichefen räknar upp styrelsepapper, förvärvskalkylen och ”en kundexport jag höll på att städa”, men är osäker på resten."
        ])],
        discuss: [q("Which sources tell you what was on the laptop, other than the CFO's memory?", "Vilka källor visar vad som fanns på datorn, utöver ekonomichefens minne?", ["itOps"])],
        choice: ask(["How do you establish what was on it?", "Hur tar ni reda på vad som fanns på den?"], ["Uses sync logs and backups rather than memory, and involves the DPO before the facts are complete.", "Använder synkloggar och säkerhetskopior i stället för minnet, och tar in dataskyddsombudet innan fakta är kompletta."], [
          opt(["Pull file-sync and backup history for the device", "Ta fram synk- och backuphistorik för enheten"], "l1", ["Gives a real list in an hour. Slower than asking, far more reliable.", "Ger en riktig lista inom en timme. Långsammare än att fråga, betydligt mer tillförlitligt."]),
          opt(["Take the CFO's list and move on", "Utgå från ekonomichefens lista och gå vidare"], "l1", ["Fast, but people forget exports and downloads.", "Snabbt, men folk glömmer exporter och nedladdningar."]),
          opt(["Bring in legal and the DPO now: treat it as a breach", "Ta in juristen och dataskyddsombudet nu: behandla det som en incident"], "c3b", ["Starts the legal track early. Some will say it is premature.", "Startar det juridiska spåret tidigt. En del tycker att det är för tidigt."])
        ])
      }),

      pg("l1", ["The encryption question", "Frågan om krypteringen"], [
        "The logs confirm it: encryption was suspended at 23:10 and the laptop never restarted, so it never resumed. Anyone who removes the disk can read it like a USB stick.\n\n{{person.ceo.name}} joins the call with one question: “Can they read it?” What you answer now sets the tone for every decision that follows, and the CEO will repeat it to the board.",
        "Loggarna bekräftar det: krypteringen pausades 23.10 och datorn startades aldrig om, så den återupptogs aldrig. Den som tar ut disken kan läsa den som ett usb-minne.\n\n{{person.ceo.name}} kopplar in sig i samtalet med en enda fråga: ”Kan de läsa den?” Det ni svarar nu sätter tonen för alla beslut som följer, och vd kommer att upprepa det för styrelsen."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you tell the CEO?", "Vad säger ni till vd?"], ["Gives a straight answer about uncertainty instead of reassurance.", "Ger ett rakt besked om osäkerheten i stället för lugnande ord."], [
          opt(["“Assume yes. We plan as if it is readable.”", "”Utgå från ja. Vi planerar som om den går att läsa.”"], "c3", ["Honest and drives the right actions. The CEO will not like it.", "Ärligt och driver fram rätt åtgärder. Vd kommer inte att gilla det."]),
          opt(["“Probably not. Suspension is usually brief.”", "”Troligen inte. En paus brukar vara kort.”"], "c3", ["Reassuring and wrong according to the logs.", "Lugnande och fel enligt loggarna."])
        ])
      }),

      pg("c3", ["Lost property says no", "Hittegods säger nej"], [
        "Lost property has nothing. Nothing was handed in overnight and the cleaning crew found no bag.\n\nOne detail worries {{person.securityOfficer.name}}: a conductor remembers a passenger asking which carriage “the black bag in the rack” belonged to, shortly before the last stop. That sounds less like a mistake and more like someone who wanted it.",
        "Hittegodset har ingenting. Inget lämnades in under natten och städpersonalen hittade ingen väska.\n\nEn detalj oroar {{person.securityOfficer.name}}: en konduktör minns att en passagerare frågade vilken vagn ”den svarta väskan på hyllan” hörde till, strax före sista stationen. Det låter mindre som ett misstag och mer som någon som ville ha den."
      ], {
        choice: ask(["Do you report it to the police?", "Polisanmäler ni?"], ["Files early: insurers, recovery and later evidence all depend on it.", "Anmäler tidigt: försäkringsbolag, återfinnande och senare bevisning hänger på det."], [
          opt(["File a police report now", "Polisanmäl nu"], "c4", ["Gives a reference number for the insurer and a route if the laptop turns up.", "Ger ett diarienummer till försäkringsbolaget och en väg om datorn dyker upp."], { set: "policeReport" }),
          opt(["Not yet: it is probably just misplaced", "Inte än: den är troligen bara borttappad"], "c4", ["Saves an hour of paperwork and loses options later.", "Sparar en timme pappersarbete och kostar möjligheter senare."]),
          opt(["Ask {{person.securityOfficer.name}} to get the train company's CCTV first", "Be {{person.securityOfficer.name}} ta fram tågbolagets kameror först"], "c4", ["Useful, but train companies release footage to the police, not to you.", "Användbart, men tågbolag lämnar ut bilder till polisen, inte till er."])
        ])
      }),

      pg("c3b", ["The DPO's clock", "Dataskyddsombudets klocka"], [
        "{{person.dpo.name}} joins early and is clear. If personal data was on the laptop, the 72-hour deadline for notifying {{reg.dpaShort}} started when you became aware of the loss, not when you are sure what was on it.\n\nLegal agrees that it is better to know the deadline than to discover it later. The question is when you write down that the clock started.",
        "{{person.dpo.name}} kopplas in tidigt och är tydlig. Om det fanns personuppgifter på datorn började 72-timmarsfristen för anmälan till {{reg.dpaShort}} när ni fick kännedom om förlusten, inte när ni är säkra på vad som fanns på den.\n\nJuristen håller med om att det är bättre att känna till fristen än att upptäcka den i efterhand. Frågan är när ni skriver ner att klockan började gå."
      ], {
        choice: ask(["When does your clock start?", "När startar er klocka?"], ["Writes down the time of awareness and plans backwards from the deadline.", "Skriver ned tidpunkten för kännedom och planerar bakåt från tidsgränsen."], [
          opt(["Now. Log the time and plan backwards", "Nu. Logga tiden och planera bakåt"], "c4", ["Keeps every option open, including deciding not to notify.", "Håller alla möjligheter öppna, även att avstå från anmälan."], { set: "notifyClock" }),
          opt(["When we confirm personal data was on it", "När vi bekräftat att det fanns personuppgifter på den"], "c4", ["A common reading, and not the regulator's.", "En vanlig tolkning, men inte tillsynsmyndighetens."])
        ])
      }),

      pg("c4", ["A sign-in from somewhere else", "En inloggning från någon annanstans"], [
        "{{time.T+250|clock}}. An alert from the identity platform: the CFO's mailbox was opened from an unknown device using a saved sign-in token, so no password and no MFA prompt were needed.\n\nSomeone read mail for twenty minutes, mostly in the board and deal folders, then logged off. Whoever has the laptop now knows exactly whose it is.",
        "Klockan {{time.T+250|clock}}. Ett larm från identitetsplattformen: ekonomichefens brevlåda öppnades från en okänd enhet med en sparad inloggningstoken, så varken lösenord eller MFA behövdes.\n\nNågon läste e-post i tjugo minuter, mest i mapparna för styrelsen och affären, och loggade sedan ut. Den som har datorn vet nu exakt vems den är."
      ], {
        variants: [vr("sessionsRevoked", [
          "{{time.T+250|clock}}. An alert from the identity platform: someone tried to open the CFO's mailbox from an unknown device using an old saved token. Because the sessions were revoked this morning, the attempt was refused.\n\nThe early decision paid off, but the message is clear: someone has the laptop, knows whose it is, and is trying to get in.",
          "Klockan {{time.T+250|clock}}. Ett larm från identitetsplattformen: någon försökte öppna ekonomichefens brevlåda från en okänd enhet med en gammal sparad token. Eftersom sessionerna återkallades i morse nekades försöket.\n\nDet tidiga beslutet lönade sig, men budskapet är tydligt: någon har datorn, vet vems den är och försöker ta sig in."
        ], ["Because you revoked the sessions this morning, the attempt failed.", "Eftersom ni återkallade sessionerna i morse misslyckades försöket."])],
        injects: [
          inj("b1-2", 250, "authLog", "siem", "high", "confirmed", [
            "Sign-in: {{person.cfo.email}} · device: unknown · location: city of arrival · method: refresh token · result: see status.",
            "Inloggning: {{person.cfo.email}} · enhet: okänd · plats: ankomststaden · metod: förnyelsetoken · resultat: se status."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("What can someone do with twenty minutes in the CFO's mailbox?", "Vad kan någon göra med tjugo minuter i ekonomichefens brevlåda?", ["socLead", "cfo"])],
        choice: ask(["What now?", "Vad gör ni nu?"], ["Closes the door, then looks for what was done while it was open: rules, forwards, sent items.", "Stänger dörren och letar sedan efter vad som gjordes medan den var öppen: regler, vidarebefordringar, skickat."], [
          opt(["Revoke everything, reset, and check mailbox rules", "Återkalla allt, återställ och kontrollera regler i brevlådan"], "l2", ["Standard and right. Rules and forwards are where attackers hide.", "Standard och rätt. Regler och vidarebefordringar är där angripare gömmer sig."], { set: "sessionsRevoked" }),
          opt(["Watch quietly to learn what they are after", "Bevaka i tysthet för att se vad de är ute efter"], "l2", ["Intelligence at the cost of more exposure. Who decides how long?", "Underrättelser till priset av mer exponering. Vem bestämmer hur länge?"]),
          opt(["Disable the account for 24 hours", "Stäng av kontot i ett dygn"], "l2", ["Blunt and effective. The CFO has a board meeting tomorrow.", "Trubbigt och effektivt. Ekonomichefen har styrelsemöte i morgon."], { set: "sessionsRevoked" })
        ])
      }),

      pg("l2", ["The board meeting", "Styrelsemötet"], [
        "The board meets tomorrow at nine. The CFO would rather not mention the laptop: “Let's see what we're dealing with first. There is no point in worrying them over a bag on a train.”\n\nSome in the room agree; others point out that the board papers on the laptop are the board's own. Whoever hears about this late will ask why.",
        "Styrelsen möts i morgon klockan nio. Ekonomichefen vill helst inte nämna datorn: ”Vi ser vad vi har att göra med först. Det finns ingen anledning att oroa dem för en väska på ett tåg.”\n\nEn del i rummet håller med; andra påpekar att styrelsepappren på datorn är styrelsens egna. Den som får höra om det här sent kommer att fråga varför."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Who do you tell, and when?", "Vem berättar ni för, och när?"], ["Informs the CEO and chair early, with what is known and not known.", "Informerar vd och ordförande tidigt, med vad som är känt och inte känt."], [
          opt(["The CEO and the chair, today", "Vd och ordföranden, i dag"], "c5", ["Uncomfortable now, much less uncomfortable later.", "Obekvämt nu, mycket mindre obekvämt senare."]),
          opt(["Keep it within IT and security for now", "Håll det inom IT och säkerhet tills vidare"], "c5", ["Buys quiet, risks the board hearing it from someone else.", "Ger lugn, men styrelsen riskerar att höra det från någon annan."], { set: "keptQuiet" })
        ])
      }),

      pg("c5", ["The deal", "Affären"], [
        "{{person.legal.name}} has read the deal folder and goes quiet. The acquisition model is a {{num.dealValue}} million offer for a listed company that has not been announced.\n\nIf it leaks, it is inside information: someone could trade on it, and the company's handling of the loss could become part of a market-abuse inquiry. The deal team does not know yet that the laptop is missing.",
        "{{person.legal.name}} har gått igenom affärsmappen och blir tyst. Förvärvskalkylen är ett bud på {{num.dealValue}} miljoner på ett börsnoterat bolag, och budet är inte offentliggjort.\n\nOm den läcker är det insiderinformation: någon kan handla på den, och hur bolaget hanterar förlusten kan bli en del av en utredning om marknadsmissbruk. Affärsteamet vet ännu inte att datorn är borta."
      ], {
        discuss: [q("Who outside IT needs to know that the deal model may be exposed?", "Vem utanför IT behöver veta att kalkylen kan vara exponerad?", ["legal", "ceo"])],
        choice: ask(["What do you do about the deal?", "Vad gör ni med affären?"], ["Recognises market-abuse obligations and brings the deal team and legal in without delay.", "Inser skyldigheterna kring marknadsmissbruk och tar in affärsteamet och juristen utan dröjsmål."], [
          opt(["Tell the deal team and legal; review disclosure duties", "Informera affärsteamet och juristen; se över informationsplikten"], "l3", ["Right, and it widens the circle of people who know.", "Rätt, och det vidgar kretsen av personer som vet."]),
          opt(["Leave the deal out of it: it is a theft, not a leak", "Låt affären vara: det är en stöld, inte en läcka"], "l3", ["Keeps things simple until someone trades on the information.", "Håller det enkelt tills någon handlar på informationen."], { effects: { regulator: 1 }, set: "dealIgnored" }),
          opt(["Pause the deal talks until you know more", "Pausa förhandlingarna tills ni vet mer"], "l3", ["Safe for the market, costly for the deal, and hard to explain to the other side.", "Säkert för marknaden, dyrt för affären och svårt att förklara för motparten."])
        ])
      }),

      pg("l3", ["The insurer's terms", "Försäkringsbolagets villkor"], [
        "The cyber insurance policy is pulled out. It requires notice within 48 hours, and only the insurer's own forensics firm may investigate if you want the costs covered.\n\nThe notice form also asks for a police report number. Nobody wants to lose the cover over paperwork.",
        "Cyberförsäkringen tas fram. Den kräver anmälan inom 48 timmar, och bara försäkringsbolagets egen forensikfirma får utreda om kostnaderna ska ersättas.\n\nAnmälningsblanketten frågar också efter ett polisärendenummer. Ingen vill förlora skyddet på grund av pappersarbete."
      ], {
        long: true,
        skipTo: "c6",
        variants: [vr("!policeReport", [
          "The cyber insurance policy is pulled out. It requires notice within 48 hours, and only the insurer's own forensics firm may investigate if you want the costs covered.\n\nThe notice form asks for a police report number, and you do not have one: nobody has reported the laptop stolen. Nobody wants to lose the cover over paperwork.",
          "Cyberförsäkringen tas fram. Den kräver anmälan inom 48 timmar, och bara försäkringsbolagets egen forensikfirma får utreda om kostnaderna ska ersättas.\n\nAnmälningsblanketten frågar efter ett polisärendenummer, och ett sådant har ni inte: ingen har anmält datorn stulen. Ingen vill förlora skyddet på grund av pappersarbete."
        ])],
        choice: ask(["How do you handle the insurer?", "Hur hanterar ni försäkringsbolaget?"], ["Reads the policy terms early and meets them.", "Läser försäkringsvillkoren tidigt och uppfyller dem."], [
          opt(["Notify now and accept their forensics firm", "Anmäl nu och godta deras forensikfirma"], "c6", ["Protects the cover. Their firm works for the insurer, too.", "Skyddar försäkringen. Deras firma arbetar också för försäkringsbolaget."], { set: "policeReport" }),
          opt(["Wait until you know whether there is a loss", "Vänta tills ni vet om det blir någon skada"], "c6", ["Late notice is a common reason claims are refused.", "Sen anmälan är ett vanligt skäl till att ersättning nekas."])
        ])
      }),

      pg("c6", ["For sale", "Till salu"], [
        "{{time.T+480|clock}}. Someone in the service desk finds a listing on a resale site: “Laptop, found on train, works, {{num.askingPrice|currency}}”.\n\nThe photo shows your asset sticker and, on the screen, the CFO's sign-in page. The seller answers messages quickly. Whatever you do next, the laptop may be gone within hours.",
        "Klockan {{time.T+480|clock}}. Någon på servicedesken hittar en annons på en köp- och säljsajt: ”Dator, hittad på tåg, fungerar, {{num.askingPrice|currency}}”.\n\nBilden visar er inventariemärkning och, på skärmen, ekonomichefens inloggningssida. Säljaren svarar snabbt på meddelanden. Vad ni än gör nu kan datorn vara borta inom några timmar."
      ], {
        injects: [
          inj("b1-3", 480, "socialPost", "socialMedia", "medium", "unverified", [
            "Laptop found on the night train. Works fine, charger included. Quick sale. No questions please.",
            "Dator hittad på nattåget. Fungerar fint, laddare ingår. Snabb affär. Inga frågor tack."
          ], { headline: ["Listing: “Laptop, found on train”", "Annons: ”Dator, hittad på tåg”"], tests: ["lo2"] })
        ],
        choice: ask(["How do you try to get it back?", "Hur försöker ni få tillbaka den?"], ["Works through the police and avoids steps that tip off the seller or reach the press.", "Går via polisen och undviker steg som varnar säljaren eller når pressen."], [
          opt(["Give the listing to the police and let them act", "Lämna annonsen till polisen och låt dem agera"], "c7", ["Slower, but lawful and it preserves evidence.", "Långsammare, men lagligt och bevarar bevisen."], { requires: "policeReport", set: "recovered" }),
          opt(["Have someone pose as a buyer", "Låt någon låtsas vara köpare"], "c7b", ["Might work. Might also put a colleague in a car park with a thief.", "Kan fungera. Kan också ställa en kollega på en parkering med en tjuv."]),
          opt(["Send the remote wipe now, before they sell it", "Skicka fjärrraderingen nu, innan de säljer den"], "c7", ["Protects the data if it connects. Destroys the evidence of what was read.", "Skyddar data om den kopplar upp sig. Förstör bevisen för vad som lästes."], { hides: "wipeSent", set: "wipeSent" }),
          opt(["Post a public appeal with a finder's reward", "Gör ett offentligt upprop med hittelön"], "x1", ["Fast reach, no control over who reads it, including journalists.", "Snabb spridning, ingen kontroll över vem som läser, inte heller journalister."], { effects: { media: 2 } })
        ])
      }),

      pg("c7b", ["The café", "Kaféet"], [
        "The fake buyer gets a reply within minutes. The seller agrees to meet at a café near the station at six. They want cash, they want it quick, and they will not say where they got the laptop.\n\n{{person.securityOfficer.name}} points out that you are now planning a meeting with someone who may be a thief.",
        "Den låtsade köparen får svar inom några minuter. Säljaren går med på att träffas på ett kafé nära stationen klockan sex. Hen vill ha kontanter, vill att det går fort och säger inte var datorn kommer ifrån.\n\n{{person.securityOfficer.name}} påpekar att ni nu planerar ett möte med någon som kan vara en tjuv."
      ], {
        choice: ask(["Who goes to the café?", "Vem går till kaféet?"], ["Puts staff safety first and brings in the police for anything resembling a sting.", "Sätter personalens säkerhet först och tar in polisen för allt som liknar en fälla."], [
          opt(["Call the police and let them take the meeting", "Ring polisen och låt dem ta mötet"], "c7", ["The sensible version of the plan.", "Den förnuftiga versionen av planen."], { set: ["recovered", "policeReport"] }),
          opt(["Send {{person.securityOfficer.name}} with the cash", "Skicka {{person.securityOfficer.name}} med pengarna"], "c7", ["You probably get the laptop. You also paid a thief and took a risk with a colleague.", "Ni får troligen datorn. Ni har också betalat en tjuv och tagit en risk med en kollega."], { set: "recovered" })
        ])
      }),

      pg("c7", ["Did they get in?", "Kom de in?"], [
        "Nobody can yet say whether the disk was copied, and you may never know for certain.\n\nThat means every password, key and saved login on that laptop has to be treated as possibly known to someone else: the VPN certificate, the finance system, the board portal and whatever the CFO had saved in the browser. Changing them all takes time and will annoy people.",
        "Ingen kan ännu säga om disken kopierades, och det kanske ni aldrig får veta säkert.\n\nDet betyder att varje lösenord, nyckel och sparad inloggning på datorn måste behandlas som möjligen känd av någon annan: vpn-certifikatet, ekonomisystemet, styrelseportalen och allt ekonomichefen hade sparat i webbläsaren. Att byta allt tar tid och kommer att irritera folk."
      ], {
        variants: [
          vr("recovered", [
            "The laptop is back on the table in a sealed bag, the battery flat. The power log shows it was switched on at least twice since the train.\n\nNobody can yet say whether the disk was copied. Getting the hardware back feels like the end of the story, but every password, key and saved login on it still has to be treated as possibly known.",
            "Datorn ligger tillbaka på bordet i en förseglad påse, batteriet tomt. Strömloggen visar att den har startats minst två gånger sedan tåget.\n\nIngen kan ännu säga om disken kopierades. Att få tillbaka hårdvaran känns som slutet på historien, men varje lösenord, nyckel och sparad inloggning på den måste fortfarande behandlas som möjligen känd."
          ], ["Because the laptop came back, you can examine it.", "Eftersom datorn kom tillbaka kan ni undersöka den."]),
          vr("wipeSent", [
            "The wipe command is still waiting in the queue: the laptop has not been online since the station, so nothing has been erased.\n\nA wipe only works if the thief connects the machine to the internet, and a careful thief will not. Until then, every password, key and saved login on it has to be treated as possibly known.",
            "Raderingskommandot ligger fortfarande i kö: datorn har inte varit uppkopplad sedan stationen, så ingenting har raderats.\n\nEn radering fungerar bara om tjuven kopplar upp datorn mot internet, och en försiktig tjuv gör inte det. Till dess måste varje lösenord, nyckel och sparad inloggning på den behandlas som möjligen känd."
          ], ["Because you sent a wipe, the device may erase itself, and the evidence with it.", "Eftersom ni skickade en radering kan enheten radera sig själv, och bevisen med den."])
        ],
        choice: ask(["How do you treat the credentials on the laptop?", "Hur behandlar ni inloggningsuppgifterna på datorn?"], ["Assumes compromise and rotates everything stored on the device, not only the user's own password.", "Utgår från intrång och byter allt som fanns lagrat på enheten, inte bara användarens eget lösenord."], [
          opt(["Rotate every credential, key and certificate that was on it", "Byt alla inloggningsuppgifter, nycklar och certifikat som fanns på den"], "l4", ["Days of work for IT. The only option that does not depend on luck.", "Flera dagars arbete för IT. Det enda alternativet som inte hänger på tur."], { set: "rotated" }),
          opt(["Wait for the forensic result before rotating", "Vänta på det forensiska resultatet innan ni byter"], "l4", ["Saves work if the disk was untouched. Forensics takes a week.", "Sparar arbete om disken var orörd. Forensiken tar en vecka."]),
          opt(["Change only the CFO's own passwords", "Byt bara ekonomichefens egna lösenord"], "l4", ["Forgets the service accounts and VPN certificate on the device.", "Glömmer tjänstekontona och VPN-certifikatet på enheten."])
        ])
      }),

      pg("l4", ["The customer export", "Kundexporten"], [
        "The file-sync history finally answers one question. The customer export is real: {{num.customersInExport|number}} customer contacts with names, direct phone numbers, email addresses and payment terms.\n\nSales says it is “just business contacts”. The DPO says named people are named people. How you classify it decides whether there is anything to notify.",
        "Synkhistoriken besvarar till slut en fråga. Kundexporten finns: {{num.customersInExport|number}} kundkontakter med namn, direktnummer, e-postadresser och betalningsvillkor.\n\nSäljavdelningen säger att det ”bara är affärskontakter”. Dataskyddsombudet säger att namngivna personer är namngivna personer. Hur ni klassar den avgör om det finns något att anmäla."
      ], {
        long: true,
        skipTo: "c8",
        chart: { id: "b1-export", type: "kpi", title: L(["What was in the export", "Vad som fanns i exporten"]), data: kpi([
          { id: "k1", label: ["Customer contacts", "Kundkontakter"], value: (v) => v.customersInExport, tone: "danger" },
          { id: "k2", label: ["Hours since awareness", "Timmar sedan kännedom"], value: 9, tone: "warn" }
        ]) },
        choice: ask(["Is the export personal data?", "Är exporten personuppgifter?"], ["Recognises named business contacts as personal data.", "Inser att namngivna kontaktpersoner hos företag är personuppgifter."], [
          opt(["Yes: named contacts are personal data", "Ja: namngivna kontaktpersoner är personuppgifter"], "c8", ["Correct under data protection law.", "Rätt enligt dataskyddsreglerna."]),
          opt(["No: it is business-to-business data", "Nej: det är data mellan företag"], "c8", ["A common and costly misunderstanding.", "Ett vanligt och dyrt missförstånd."])
        ])
      }),

      pg("c8", ["The 72-hour question", "72-timmarsfrågan"], [
        "{{person.dpo.name}} needs a decision about notifying {{reg.dpaShort}}. You still do not know whether anyone actually read the files.\n\nNotifying now means telling a regulator about something that may turn out to be nothing. Waiting means betting that the forensic result arrives in time, and that it says what you hope.",
        "{{person.dpo.name}} behöver ett beslut om anmälan till {{reg.dpaShort}}. Ni vet fortfarande inte om någon faktiskt har läst filerna.\n\nAtt anmäla nu innebär att berätta för en myndighet om något som kanske visar sig vara ingenting. Att vänta innebär att satsa på att forensikresultatet kommer i tid och att det säger det ni hoppas."
      ], {
        variants: [vr("notifyClock", [
          "{{person.dpo.name}} has been counting since this morning: 61 hours left to notify {{reg.dpaShort}}. You still do not know whether anyone actually read the files.\n\nNotifying now means telling a regulator about something that may turn out to be nothing. Waiting means betting that the forensic result arrives inside the deadline the DPO has written on the whiteboard.",
          "{{person.dpo.name}} har räknat sedan i morse: 61 timmar kvar att anmäla till {{reg.dpaShort}}. Ni vet fortfarande inte om någon faktiskt har läst filerna.\n\nAtt anmäla nu innebär att berätta för en myndighet om något som kanske visar sig vara ingenting. Att vänta innebär att satsa på att forensikresultatet kommer inom den frist som dataskyddsombudet har skrivit på tavlan."
        ], ["Because the clock was started early, you have a deadline you can plan to.", "Eftersom klockan startades tidigt har ni en tidsgräns att planera mot."])],
        discuss: [q("What would you put in a notification today, and what would you add later?", "Vad skulle ni skriva i en anmälan i dag, och vad skulle ni komplettera med senare?", ["dpo", "legal"])],
        choice: ask(["Do you notify?", "Anmäler ni?"], ["Notifies on time with what is known and supplements later, rather than waiting for certainty.", "Anmäler i tid med det som är känt och kompletterar senare, i stället för att vänta på visshet."], [
          opt(["Notify now and follow up as facts arrive", "Anmäl nu och komplettera när fakta kommer"], "l5", ["Meets the deadline. The regulator expects updates.", "Håller tidsgränsen. Tillsynsmyndigheten förväntar sig kompletteringar."], { effects: { regulator: -1 }, set: "notified" }),
          opt(["Wait for the forensic result", "Vänta på det forensiska resultatet"], "l5", ["Likely to miss 72 hours. You must then explain why.", "Missar troligen 72 timmar. Då måste ni förklara varför."], { effects: { regulator: 1 }, set: "notifyLate" }),
          opt(["Decide it is not notifiable", "Besluta att det inte är anmälningspliktigt"], "l5", ["Defensible only if you are sure no one could read it. You are not.", "Försvarbart bara om ni är säkra på att ingen kunde läsa den. Det är ni inte."], { effects: { regulator: 2 }, hides: "notifyClock", set: "denied" })
        ])
      }),

      pg("l5", ["The customers", "Kunderna"], [
        "The account managers have heard rumours and want a script. What should they say if a customer calls and asks whether their details were on the missing laptop?\n\nSome of the contacts in the export are at your three largest accounts. A warning protects them from fraud attempts, but it also tells them you lost their data.",
        "Kundansvariga har hört rykten och vill ha ett manus. Vad ska de säga om en kund ringer och frågar om deras uppgifter fanns på den försvunna datorn?\n\nEn del av kontakterna i exporten finns hos era tre största kunder. En varning skyddar dem mot bedrägeriförsök, men den berättar också att ni har tappat bort deras uppgifter."
      ], {
        long: true,
        skipTo: "c9",
        choice: ask(["Do you tell the affected customers?", "Berättar ni för de berörda kunderna?"], ["Tells customers early, with practical advice about suspicious contact.", "Berättar för kunderna tidigt, med praktiska råd om misstänkta kontakter."], [
          opt(["Yes, with advice on spotting fraud attempts", "Ja, med råd om hur de känner igen bedrägeriförsök"], "c9", ["Builds trust; their contact details may be used for invoice fraud.", "Bygger förtroende; deras kontaktuppgifter kan användas för fakturabedrägerier."], { effects: { trust: 1 } }),
          opt(["Only if they ask", "Bara om de frågar"], "c9", ["Quiet now, awkward if fraud follows.", "Tyst nu, pinsamt om bedrägerier följer."], { effects: { trust: -1 } })
        ])
      }),

      pg("c9", ["The board asks", "Styrelsen frågar"], [
        "The chair of the board wants a written summary before tomorrow's meeting: what happened, what you did, and what it might cost.\n\nThe CFO offers to draft it. Others in the room think someone else should hold the pen, since the summary will describe the CFO's own laptop and decisions.",
        "Styrelseordföranden vill ha en skriftlig sammanfattning före morgondagens möte: vad som hände, vad ni gjorde och vad det kan kosta.\n\nEkonomichefen erbjuder sig att skriva den. Andra i rummet tycker att någon annan borde hålla i pennan, eftersom sammanfattningen kommer att handla om ekonomichefens egen dator och egna beslut."
      ], {
        variants: [
          vr("keptQuiet", [
            "The chair heard about the laptop from an account manager in the corridor, not from you, and is not pleased.\n\nThey want a written summary tonight: what happened, what you did, what it might cost, and why the board was not told. The next conversation will be about trust as much as about the laptop.",
            "Ordföranden hörde om datorn från en kundansvarig i korridoren, inte från er, och är inte nöjd.\n\nHen vill ha en skriftlig sammanfattning i kväll: vad som hände, vad ni gjorde, vad det kan kosta och varför styrelsen inte informerades. Nästa samtal kommer att handla lika mycket om förtroende som om datorn."
          ], ["Because you kept it within IT, the board heard it from someone else.", "Eftersom ni höll det inom IT fick styrelsen höra det från någon annan."]),
          vr("dealIgnored", [
            "A letter arrives from the financial supervisor: they have noticed unusual trading in the target company's shares and ask whether anyone outside the deal team could have known about the offer.\n\nThe chair wants a written summary before tomorrow. The theft you decided was “not a leak” now has to be explained to a regulator.",
            "Ett brev kommer från tillsynsmyndigheten för finansmarknaden: de har noterat ovanlig handel i målbolagets aktier och frågar om någon utanför affärsteamet kan ha känt till budet.\n\nOrdföranden vill ha en skriftlig sammanfattning före i morgon. Stölden som ni bedömde ”inte var en läcka” måste nu förklaras för en myndighet."
          ], ["Because the deal was left out, the supervisor got there first.", "Eftersom affären lämnades utanför hann tillsynsmyndigheten först."])
        ],
        choice: ask(["What goes in the summary?", "Vad står i sammanfattningen?"], ["Writes down gaps and open questions as clearly as the actions taken.", "Skriver ned luckor och öppna frågor lika tydligt som de åtgärder som vidtagits."], [
          opt(["Everything, including what you got wrong", "Allt, även det ni gjorde fel"], "c10", ["Hard to write. The board can only govern what it is told.", "Svårt att skriva. Styrelsen kan bara styra det den får veta."]),
          opt(["A reassuring summary of actions taken", "En lugnande sammanfattning av vidtagna åtgärder"], "c10", ["Reads well until the gaps come out.", "Läses bra tills luckorna kommer fram."])
        ])
      }),

      pg("c10", ["What changes on Monday", "Vad som ändras på måndag"], [
        "A week later. The laptop story has settled, one way or another, and the crisis team meets one last time.\n\nThe question is no longer this laptop but the next one: executives travel every week, encryption updates happen every month, and the same gap is open on other machines today. You have budget for one change this quarter.",
        "En vecka senare. Historien om datorn har landat, på ett eller annat sätt, och krisledningen träffas en sista gång.\n\nFrågan är inte längre den här datorn utan nästa: chefer reser varje vecka, krypteringsuppdateringar sker varje månad, och samma lucka finns öppen på andra datorer i dag. Ni har budget för en förändring det här kvartalet."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Fixes the control that failed (encryption compliance) rather than adding rules for people.", "Rättar den kontroll som brast (krypteringsefterlevnad) i stället för att lägga till regler för människor."], [
          opt(["Block access from devices whose encryption is off", "Stäng ute enheter där krypteringen är avslagen"], "r-end", ["Fixes the actual failure. Takes some testing to avoid locking people out.", "Rättar det som faktiskt brast. Kräver tester för att inte låsa ute folk."]),
          opt(["Ban laptops on business travel", "Förbjud datorer på tjänsteresor"], "r-end", ["Easy to announce, hard to follow, and people will work around it.", "Lätt att införa, svårt att följa, och folk kommer att gå runt det."]),
          opt(["Security training for executives", "Säkerhetsutbildning för ledningen"], "r-end", ["Worth doing; would not have stopped this.", "Värt att göra; hade inte stoppat det här."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["sessionsRevoked", "rotated", "notified"], "e1"],
          ["notified", "e2"],
          ["notifyLate", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Six weeks later", "Sex veckor senare"], ["The laptop never turned up, and it no longer matters much. The sign-in attempts failed, every credential that was on it has been replaced, and the regulator received your notification well inside the deadline.\n\nThe supervisor's follow-up letter is short and closes the case. At the next board meeting, the CFO presents the story as a lesson.", "Datorn dök aldrig upp, och det spelar inte så stor roll längre. Inloggningsförsöken misslyckades, varje inloggningsuppgift som fanns på den har bytts ut och tillsynsmyndigheten fick er anmälan med god marginal.\n\nMyndighetens uppföljningsbrev är kort och avslutar ärendet. På nästa styrelsemöte presenterar ekonomichefen historien som en lärdom."], {
        ending: end(1, ["A lost laptop, nothing more", "En borttappad dator, inget mer"], [
          "Sessions were cut before anyone used them, every stored credential was replaced, and the regulator heard it from you on time. The follow-up letter closes the case.",
          "Sessionerna kapades innan någon använde dem, varje lagrad inloggningsuppgift byttes ut och tillsynsmyndigheten fick veta det av er i tid. Kompletteringen avslutar ärendet."
        ])
      }),
      pg("e2", ["Six weeks later", "Sex veckor senare"], ["The notification reached the regulator in time, and nothing has been published. But the review found gaps: some credentials on the laptop were changed days late, and the mailbox was readable for hours.\n\nThe regulator's follow-up questions are pointed and take weeks to answer. The case stays open longer than anyone expected.", "Anmälan nådde tillsynsmyndigheten i tid och ingenting har publicerats. Men genomgången hittade luckor: en del inloggningsuppgifter på datorn byttes flera dagar för sent och brevlådan gick att läsa i timmar.\n\nMyndighetens följdfrågor är skarpa och tar veckor att besvara. Ärendet blir öppet längre än någon trodde."], {
        ending: end(2, ["Notified, but with holes", "Anmält, men med luckor"], [
          "You notified in time, but some credentials on the laptop were left unchanged or the mailbox was open for hours. The regulator asks pointed follow-up questions.",
          "Ni anmälde i tid, men en del inloggningsuppgifter på datorn byttes aldrig eller så stod brevlådan öppen i timmar. Tillsynsmyndigheten ställer skarpa följdfrågor."
        ])
      }),
      pg("e3", ["Six weeks later", "Sex veckor senare"], ["The notification arrived after the 72 hours had passed, with an explanation that did not hold up when the regulator asked for the timeline.\n\nMeanwhile, two customers reported invoice fraud attempts from people who knew their names, direct numbers and payment terms: the contents of the export.", "Anmälan kom efter att de 72 timmarna hade gått, med en förklaring som inte höll när tillsynsmyndigheten bad om tidslinjen.\n\nUnder tiden har två kunder rapporterat försök till fakturabedrägerier från personer som kände till deras namn, direktnummer och betalningsvillkor: innehållet i exporten."], {
        ending: end(3, ["Late and on the back foot", "Sent och på efterkälken"], [
          "The notification arrived after 72 hours with an explanation that does not hold up. Two customers report invoice fraud attempts using contact details from the export.",
          "Anmälan kom efter 72 timmar med en förklaring som inte håller. Två kunder rapporterar försök till fakturabedrägerier med kontaktuppgifter från exporten."
        ])
      }),
      pg("e4", ["Five months later", "Fem månader senare"], ["For months, nothing happened. Then a customer complained to the regulator after a fraud attempt that used details only your export contained.\n\nThe regulator has opened an investigation. The question is no longer the laptop, but why {{org.name}} decided to stay silent and who took that decision.", "I flera månader hände ingenting. Sedan klagade en kund hos tillsynsmyndigheten efter ett bedrägeriförsök med uppgifter som bara fanns i er export.\n\nMyndigheten har inlett en utredning. Frågan är inte längre datorn, utan varför {{org.name}} valde att tiga och vem som fattade det beslutet."], {
        ending: end(4, ["The regulator finds out first", "Tillsynsmyndigheten får veta först"], [
          "You decided it was not notifiable. Months later the regulator learns of it from a customer's complaint and opens an investigation into why you stayed silent.",
          "Ni beslutade att det inte var anmälningspliktigt. Månader senare får tillsynsmyndigheten veta det genom en kunds klagomål och inleder en utredning om varför ni teg."
        ])
      }),

      // Break-away: the public appeal.
      pg("x1", ["Going public", "Offentligt"], [
        "The appeal works too well. It is shared thousands of times within the hour, with the asset sticker visible in the photo.\n\nA business reporter calls the press office: why does a CFO's laptop matter so much to {{org.name}} that you offer a reward? The question is reasonable, and the honest answer touches the unannounced deal.",
        "Uppropet fungerar för bra. Det delas tusentals gånger inom en timme, med inventariemärkningen synlig på bilden.\n\nEn ekonomireporter ringer pressavdelningen: varför är en ekonomichefs dator så viktig för {{org.name}} att ni utlovar en belöning? Frågan är rimlig, och det ärliga svaret berör den hemliga affären."
      ], {
        injects: [
          inj("b1-4", 540, "mediaEnquiry", "media", "high", "confirmed", [
            "“We understand a laptop belonging to your CFO is missing during sensitive negotiations. Is any confidential or customer data at risk? We publish within the hour.”",
            "”Vi förstår att en dator som tillhör er ekonomichef saknas under känsliga förhandlingar. Är konfidentiella uppgifter eller kunddata i fara? Vi publicerar inom en timme.”"
          ], { headline: ["Business desk enquiry", "Fråga från ekonomiredaktionen"], tests: ["lo4"] })
        ],
        choice: ask(["What do you tell the reporter?", "Vad säger ni till reportern?"], ["Holds a single, accurate line and avoids confirming details that move markets.", "Håller en enda korrekt linje och undviker att bekräfta detaljer som påverkar marknaden."], [
          opt(["Confirm the loss and say you are assessing the data", "Bekräfta förlusten och säg att ni bedömer vilka data som berörs"], "x2", ["Honest and limited. The word “negotiations” is already in their question.", "Ärligt och begränsat. Ordet ”förhandlingar” finns redan i deras fråga."]),
          opt(["Decline to comment", "Avböj att kommentera"], "x2", ["They publish anyway, with speculation instead of facts.", "De publicerar ändå, med spekulationer i stället för fakta."], { effects: { media: 1 } })
        ])
      }),
      pg("x2", ["A different offer", "Ett annat erbjudande"], [
        "The resale listing disappears. An hour later a message arrives through the appeal's contact form.\n\nThe sender says they have looked at the files. They will cost ten times the asking price, paid within two days, or they go online. Attached is a screenshot of a board paper's first page.",
        "Annonsen på köp- och säljsajten försvinner. En timme senare kommer ett meddelande via uppropets kontaktformulär.\n\nAvsändaren säger att hen har tittat på filerna. De kostar tio gånger utropspriset, betalt inom två dagar, annars hamnar de på nätet. Bifogat finns en skärmbild av första sidan i ett styrelsepapper."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Refuses to pay, involves the police and prepares for publication.", "Vägrar betala, tar in polisen och förbereder sig på en publicering."], [
          opt(["Refuse, report it and prepare for a leak", "Vägra, polisanmäl och förbered er på en läcka"], "x3", ["The right line. It does not stop the leak.", "Rätt linje. Det stoppar inte läckan."]),
          opt(["Pay to make it go away", "Betala för att få bort det"], "x3", ["Nothing guarantees the files are deleted, and you have shown you pay.", "Inget garanterar att filerna raderas, och ni har visat att ni betalar."]),
          opt(["Negotiate for time", "Förhandla för att vinna tid"], "x3", ["Time for what? Decide that before you start talking.", "Tid för vad? Bestäm det innan ni börjar prata."])
        ])
      }),
      pg("x3", ["Files online", "Filer på nätet"], [
        "Two days later, samples appear on a forum: two board papers and a page of the customer export, with names and phone numbers clearly visible.\n\nThe post links to the appeal and names {{org.name}}. Customers start calling the account managers, and the reporter from yesterday has seen it too.",
        "Två dagar senare dyker utdrag upp på ett forum: två styrelsepapper och en sida ur kundexporten, med namn och telefonnummer fullt läsbara.\n\nInlägget länkar till uppropet och namnger {{org.name}}. Kunder börjar ringa kundansvariga, och reportern från i går har också sett det."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Notifies regulators and customers immediately once data is confirmed public.", "Anmäler till tillsynsmyndigheter och kunder omedelbart när data bekräftats vara offentliga."], [
          opt(["Notify the regulator and the customers today", "Anmäl till tillsynsmyndigheten och kunderna i dag"], "x4", ["Late, but now unavoidable.", "Sent, men nu oundvikligt."]),
          opt(["Confirm the samples are genuine first", "Bekräfta först att utdragen är äkta"], "x4", ["Reasonable for a day. Not for a week.", "Rimligt i ett dygn. Inte i en vecka."])
        ])
      }),
      pg("x4", ["The market opens", "Börsen öppnar"], [
        "The next morning, the target company's shares jump eleven percent before any announcement. Someone has read the board papers.\n\nThe financial supervisor asks you to explain, in writing and by the end of the week, who knew what and when, from the moment the laptop went missing.",
        "Nästa morgon stiger målbolagets aktie elva procent innan något har offentliggjorts. Någon har läst styrelsepappren.\n\nTillsynsmyndigheten för finansmarknaden ber er redogöra, skriftligt och före veckans slut, för vem som visste vad och när, från det att datorn försvann."
      ], {
        choice: ask(["How do you face the supervisor?", "Hur möter ni tillsynsmyndigheten?"], ["Cooperates fully with a documented timeline.", "Samarbetar fullt ut med ett dokumenterat händelseförlopp."], [
          opt(["Full cooperation with a written timeline", "Fullt samarbete med ett skriftligt händelseförlopp"], "e5", ["The only option left, and it helps.", "Det enda alternativet som återstår, och det hjälper."]),
          opt(["Say little and let lawyers answer", "Säg lite och låt juristerna svara"], "e5", ["Looks like there is more to hide.", "Ser ut som att det finns mer att dölja."])
        ])
      }),
      pg("e5", ["A month later", "En månad senare"], ["The appeal for a lost laptop became a news story, then an extortion attempt, then a leak on a forum and an inquiry into insider trading.\n\nThe target company has withdrawn from the deal. The supervisor's investigation will take most of the year, and the reporter has a follow-up story ready.", "Uppropet om en borttappad dator blev en nyhet, sedan ett utpressningsförsök, sedan en läcka på ett forum och en utredning om insiderhandel.\n\nMålbolaget har dragit sig ur affären. Myndighetens utredning kommer att ta större delen av året, och reportern har en uppföljning klar."], {
        ending: end(5, ["The story ran you", "Berättelsen tog över"], [
          "A public appeal turned a lost laptop into a news story, an extortion attempt and a market-abuse inquiry. The deal is off.",
          "Ett offentligt upprop gjorde en borttappad dator till en nyhet, ett utpressningsförsök och en utredning om marknadsmissbruk. Affären är avblåst."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["A lost laptop is an identity incident first: revoke sessions before you look for the device.", "En förlorad dator är i första hand en identitetsincident: återkalla sessioner innan ni letar efter enheten."]),
        L(["Logs, not memory, tell you what was on a device.", "Loggar, inte minnet, visar vad som fanns på en enhet."]),
        L(["The notification clock starts at awareness. Notify with what you know and supplement.", "Klockan för anmälan startar vid kännedom. Anmäl med det ni vet och komplettera."]),
        L(["Some data (deal documents) brings its own legal duties.", "En del data (affärsdokument) för med sig egna rättsliga skyldigheter."])
      ],
      strengthsToLookFor: [
        L(["Revoking sessions within minutes", "Att återkalla sessioner inom några minuter"]),
        L(["Rotating everything stored on the device", "Att byta allt som var lagrat på enheten"]),
        L(["Involving legal and the DPO early", "Att tidigt ta in juristen och dataskyddsombudet"])
      ],
      commonGaps: [
        L(["Waiting for lost property before acting", "Att vänta på hittegods innan man agerar"]),
        L(["Treating business contacts as non-personal data", "Att behandla kontaktpersoner hos företag som om de inte vore personuppgifter"]),
        L(["Wiping the device and with it the evidence", "Att radera enheten och därmed bevisen"])
      ],
      suggestedActions: [
        act(["Block access from devices whose disk encryption is off or suspended.", "Stäng ute enheter där diskkrypteringen är avslagen eller pausad."], "itOps", "high"),
        act(["Write a lost-device runbook that starts with revoking sessions.", "Skriv en rutin för förlorade enheter som börjar med att återkalla sessioner."], "ciso", "high"),
        act(["Agree with legal when deal documents trigger disclosure duties.", "Kom överens med juristen om när affärsdokument utlöser informationsplikt."], "legal", "medium")
      ]
    }
  });
})();
