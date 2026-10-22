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
      { id: "lo1", text: L(["Treat a lost device as an identity incident first", "Behandla en förlorad enhet som en identitetsincident i första hand"]) },
      { id: "lo2", text: L(["Establish what was on a device without guessing", "Fastställa vad som fanns på en enhet utan att gissa"]) },
      { id: "lo3", text: L(["Decide on personal-data notification under uncertainty", "Fatta beslut om anmälan av personuppgiftsincident under osäkerhet"]) },
      { id: "lo4", text: L(["Handle inside information and the board", "Hantera insiderinformation och styrelsen"]) }
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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.cfo.name}} calls from the station: the laptop bag was not in the luggage rack when the night train arrived.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.cfo.name}} ringer från stationen: datorväskan låg inte på bagagehyllan när nattåget kom fram."
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
        "The device record shows disk encryption was suspended for last night's update and never resumed. The CFO lists board papers, the acquisition model and “a customer export I was cleaning up”.",
        "Enhetsregistret visar att diskkrypteringen pausades för nattens uppdatering och aldrig återupptogs. Ekonomichefen räknar upp styrelsepapper, kalkylen för förvärvet och ”en kundexport jag höll på att städa”."
      ], {
        variants: [vr("sessionsRevoked", [
          "Sessions are revoked; the CFO is annoyed but working from a spare phone. The device record shows disk encryption was suspended for last night's update and never resumed.",
          "Sessionerna är återkallade; ekonomichefen är irriterad men arbetar från en reservtelefon. Enhetsregistret visar att diskkrypteringen pausades för nattens uppdatering och aldrig återupptogs."
        ])],
        discuss: [q("Which sources tell you what was on the laptop, other than the CFO's memory?", "Vilka källor visar vad som fanns på datorn, utöver ekonomichefens minne?", ["itOps"])],
        choice: ask(["How do you establish what was on it?", "Hur tar ni reda på vad som fanns på den?"], ["Uses sync logs and backups rather than memory, and involves the DPO before the facts are complete.", "Använder synkloggar och säkerhetskopior i stället för minnet, och tar in dataskyddsombudet innan fakta är kompletta."], [
          opt(["Pull file-sync and backup history for the device", "Ta fram synk- och backuphistorik för enheten"], "l1", ["Gives a real list in an hour. Slower than asking, far more reliable.", "Ger en riktig lista inom en timme. Långsammare än att fråga, betydligt mer tillförlitligt."]),
          opt(["Take the CFO's list and move on", "Utgå från ekonomichefens lista och gå vidare"], "l1", ["Fast, but people forget exports and downloads.", "Snabbt, men folk glömmer exporter och nedladdningar."]),
          opt(["Bring in legal and the DPO now: treat it as a breach", "Ta in juristen och dataskyddsombudet nu: behandla det som en incident"], "c3b", ["Starts the legal track early. Some will say it is premature.", "Startar det juridiska spåret tidigt. En del tycker att det är för tidigt."])
        ])
      }),

      pg("l1", ["The encryption question", "Frågan om krypteringen"], [
        "The logs confirm it: encryption was suspended at 23:10 and the laptop never rebooted to resume it. The CEO asks one question: “Can they read it?”",
        "Loggarna bekräftar det: krypteringen pausades 23.10 och datorn startades aldrig om för att återuppta den. Vd ställer en fråga: ”Kan de läsa den?”"
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you tell the CEO?", "Vad säger ni till vd?"], ["Gives a straight answer about uncertainty instead of reassurance.", "Ger ett rakt besked om osäkerheten i stället för lugnande ord."], [
          opt(["“Assume yes. We plan as if it is readable.”", "”Utgå från ja. Vi planerar som om den går att läsa.”"], "c3", ["Honest and drives the right actions. The CEO will not like it.", "Ärligt och driver fram rätt åtgärder. Vd kommer inte att gilla det."]),
          opt(["“Probably not. Suspension is usually brief.”", "”Troligen inte. En paus brukar vara kort.”"], "c3", ["Reassuring and wrong according to the logs.", "Lugnande och fel enligt loggarna."])
        ])
      }),

      pg("c3", ["Lost property says no", "Hittegods säger nej"], [
        "Nothing has been handed in. A conductor remembers a passenger asking which carriage the bag in the rack belonged to.",
        "Ingenting har lämnats in. En konduktör minns att en passagerare frågade vilken vagn väskan på hyllan hörde till."
      ], {
        choice: ask(["Do you report it to the police?", "Polisanmäler ni?"], ["Files early: insurers, recovery and later evidence all depend on it.", "Anmäler tidigt: försäkringsbolag, återfinnande och senare bevisning hänger på det."], [
          opt(["File a police report now", "Polisanmäl nu"], "c4", ["Gives a reference number for the insurer and a route if the laptop turns up.", "Ger ett diarienummer till försäkringsbolaget och en väg om datorn dyker upp."], { set: "policeReport" }),
          opt(["Not yet: it is probably just misplaced", "Inte än: den är troligen bara borttappad"], "c4", ["Saves an hour of paperwork and loses options later.", "Sparar en timme pappersarbete och kostar möjligheter senare."]),
          opt(["Ask {{person.securityOfficer.name}} to get the train company's CCTV first", "Be {{person.securityOfficer.name}} ta fram tågbolagets kameror först"], "c4", ["Useful, but train companies release footage to the police, not to you.", "Användbart, men tågbolag lämnar ut bilder till polisen, inte till er."])
        ])
      }),

      pg("c3b", ["The DPO's clock", "Dataskyddsombudets klocka"], [
        "{{person.dpo.name}} is clear: if personal data was on the laptop, the 72-hour clock to {{reg.dpaShort}} started when you became aware, not when you are sure.",
        "{{person.dpo.name}} är tydlig: om det fanns personuppgifter på datorn startade 72-timmarsklockan mot {{reg.dpaShort}} när ni fick kännedom, inte när ni är säkra."
      ], {
        choice: ask(["When does your clock start?", "När startar er klocka?"], ["Writes down the time of awareness and plans backwards from the deadline.", "Skriver ned tidpunkten för kännedom och planerar bakåt från tidsgränsen."], [
          opt(["Now. Log the time and plan backwards", "Nu. Logga tiden och planera bakåt"], "c4", ["Keeps every option open, including deciding not to notify.", "Håller alla möjligheter öppna, även att avstå från anmälan."], { set: "notifyClock" }),
          opt(["When we confirm personal data was on it", "När vi bekräftat att det fanns personuppgifter på den"], "c4", ["A common reading, and not the regulator's.", "En vanlig tolkning, men inte tillsynsmyndighetens."])
        ])
      }),

      pg("c4", ["A sign-in from somewhere else", "En inloggning från någon annanstans"], [
        "{{time.T+250|clock}}. The CFO's mailbox was opened from an unknown device using a saved token. Someone read mail for twenty minutes.",
        "Klockan {{time.T+250|clock}}. Ekonomichefens brevlåda öppnades från en okänd enhet med en sparad token. Någon läste e-post i tjugo minuter."
      ], {
        variants: [vr("sessionsRevoked", [
          "{{time.T+250|clock}}. A sign-in to the CFO's mailbox with an old token was refused. Someone has the laptop and tried.",
          "Klockan {{time.T+250|clock}}. En inloggning i ekonomichefens brevlåda med en gammal token nekades. Någon har datorn och försökte."
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
        "The CFO would rather not mention the laptop at tomorrow's board meeting. “Let's see what we're dealing with first.”",
        "Ekonomichefen vill helst inte nämna datorn på morgondagens styrelsemöte. ”Vi ser vad vi har att göra med först.”"
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Who do you tell, and when?", "Vem berättar ni för, och när?"], ["Informs the CEO and chair early, with what is known and not known.", "Informerar vd och ordförande tidigt, med vad som är känt och inte känt."], [
          opt(["The CEO and the chair, today", "Vd och ordföranden, i dag"], "c5", ["Uncomfortable now, much less uncomfortable later.", "Obekvämt nu, mycket mindre obekvämt senare."]),
          opt(["Keep it within IT and security for now", "Håll det inom IT och säkerhet tills vidare"], "c5", ["Buys quiet, risks the board hearing it from someone else.", "Ger lugn, men styrelsen riskerar att höra det från någon annan."], { set: "keptQuiet" })
        ])
      }),

      pg("c5", ["The deal", "Affären"], [
        "{{person.legal.name}} points out the acquisition model: a {{num.dealValue}} million offer for a listed company. If it leaks, it is inside information.",
        "{{person.legal.name}} pekar på förvärvskalkylen: ett bud på {{num.dealValue}} miljoner på ett börsnoterat bolag. Om den läcker är det insiderinformation."
      ], {
        discuss: [q("Who outside IT needs to know that the deal model may be exposed?", "Vem utanför IT behöver veta att kalkylen kan vara exponerad?", ["legal", "ceo"])],
        choice: ask(["What do you do about the deal?", "Vad gör ni med affären?"], ["Recognises market-abuse obligations and brings the deal team and legal in without delay.", "Inser skyldigheterna kring marknadsmissbruk och tar in affärsteamet och juristen utan dröjsmål."], [
          opt(["Tell the deal team and legal; review disclosure duties", "Informera affärsteamet och juristen; se över informationsplikten"], "l3", ["Right, and it widens the circle of people who know.", "Rätt, och det vidgar kretsen av personer som vet."]),
          opt(["Leave the deal out of it: it is a theft, not a leak", "Låt affären vara: det är en stöld, inte en läcka"], "l3", ["Keeps things simple until someone trades on the information.", "Håller det enkelt tills någon handlar på informationen."], { set: "dealIgnored" }),
          opt(["Pause the deal talks until you know more", "Pausa förhandlingarna tills ni vet mer"], "l3", ["Safe for the market, costly for the deal, and hard to explain to the other side.", "Säkert för marknaden, dyrt för affären och svårt att förklara för motparten."])
        ])
      }),

      pg("l3", ["The insurer's terms", "Försäkringsbolagets villkor"], [
        "The cyber policy requires notice within 48 hours and the insurer's own forensics firm. Notice needs a police reference.",
        "Cyberförsäkringen kräver anmälan inom 48 timmar och försäkringsbolagets egen forensikfirma. Anmälan kräver ett polisärendenummer."
      ], {
        long: true,
        skipTo: "c6",
        variants: [vr("!policeReport", [
          "The cyber policy requires notice within 48 hours and the insurer's own forensics firm. Notice needs a police reference, and you do not have one.",
          "Cyberförsäkringen kräver anmälan inom 48 timmar och försäkringsbolagets egen forensikfirma. Anmälan kräver ett polisärendenummer, och ett sådant har ni inte."
        ])],
        choice: ask(["How do you handle the insurer?", "Hur hanterar ni försäkringsbolaget?"], ["Reads the policy terms early and meets them.", "Läser försäkringsvillkoren tidigt och uppfyller dem."], [
          opt(["Notify now and accept their forensics firm", "Anmäl nu och godta deras forensikfirma"], "c6", ["Protects the cover. Their firm works for the insurer, too.", "Skyddar försäkringen. Deras firma arbetar också för försäkringsbolaget."], { set: "policeReport" }),
          opt(["Wait until you know whether there is a loss", "Vänta tills ni vet om det blir någon skada"], "c6", ["Late notice is a common reason claims are refused.", "Sen anmälan är ett vanligt skäl till att ersättning nekas."])
        ])
      }),

      pg("c6", ["For sale", "Till salu"], [
        "{{time.T+480|clock}}. A listing on a resale site: “Laptop, found on train, works, {{num.askingPrice|currency}}”. The photo shows your asset sticker.",
        "Klockan {{time.T+480|clock}}. En annons på en köp- och säljsajt: ”Dator, hittad på tåg, fungerar, {{num.askingPrice|currency}}”. Bilden visar er inventariemärkning."
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
          opt(["Post a public appeal with a finder's reward", "Gör ett offentligt upprop med hittelön"], "x1", ["Fast reach, no control over who reads it, including journalists.", "Snabb spridning, ingen kontroll över vem som läser, inte heller journalister."])
        ])
      }),

      pg("c7b", ["The café", "Kaféet"], [
        "The seller agrees to meet at a café near the station at six. They want cash and they want it quick.",
        "Säljaren går med på att träffas på ett kafé nära stationen klockan sex. De vill ha kontanter och de vill ha det snabbt."
      ], {
        choice: ask(["Who goes to the café?", "Vem går till kaféet?"], ["Puts staff safety first and brings in the police for anything resembling a sting.", "Sätter personalens säkerhet först och tar in polisen för allt som liknar en fälla."], [
          opt(["Call the police and let them take the meeting", "Ring polisen och låt dem ta mötet"], "c7", ["The sensible version of the plan.", "Den förnuftiga versionen av planen."], { set: ["recovered", "policeReport"] }),
          opt(["Send {{person.securityOfficer.name}} with the cash", "Skicka {{person.securityOfficer.name}} med pengarna"], "c7", ["You probably get the laptop. You also paid a thief and took a risk with a colleague.", "Ni får troligen datorn. Ni har också betalat en tjuv och tagit en risk med en kollega."], { set: "recovered" })
        ])
      }),

      pg("c7", ["Did they get in?", "Kom de in?"], [
        "Nobody can yet say whether the disk was copied. Every password, key and saved login on that laptop has to be treated as possibly known.",
        "Ingen kan ännu säga om disken kopierades. Varje lösenord, nyckel och sparad inloggning på datorn måste behandlas som möjligen känd."
      ], {
        variants: [
          vr("recovered", [
            "The laptop is back, the battery flat. It was switched on at least twice since the train. Nobody can yet say whether the disk was copied.",
            "Datorn är tillbaka, batteriet tomt. Den har startats minst två gånger sedan tåget. Ingen kan ännu säga om disken kopierades."
          ], ["Because the laptop came back, you can examine it.", "Eftersom datorn kom tillbaka kan ni undersöka den."]),
          vr("wipeSent", [
            "The wipe command is still queued: the laptop has not been online since the station. Every saved login on it has to be treated as possibly known.",
            "Raderingskommandot ligger fortfarande i kö: datorn har inte varit uppkopplad sedan stationen. Varje sparad inloggning på den måste behandlas som möjligen känd."
          ], ["Because you sent a wipe, the device may erase itself, and the evidence with it.", "Eftersom ni skickade en radering kan enheten radera sig själv, och bevisen med den."])
        ],
        choice: ask(["How do you treat the credentials on the laptop?", "Hur behandlar ni inloggningsuppgifterna på datorn?"], ["Assumes compromise and rotates everything stored on the device, not only the user's own password.", "Utgår från intrång och byter allt som fanns lagrat på enheten, inte bara användarens eget lösenord."], [
          opt(["Rotate every credential, key and certificate that was on it", "Byt alla inloggningsuppgifter, nycklar och certifikat som fanns på den"], "l4", ["Days of work for IT. The only option that does not depend on luck.", "Flera dagars arbete för IT. Det enda alternativet som inte hänger på tur."], { set: "rotated" }),
          opt(["Wait for the forensic result before rotating", "Vänta på det forensiska resultatet innan ni byter"], "l4", ["Saves work if the disk was untouched. Forensics takes a week.", "Sparar arbete om disken var orörd. Forensiken tar en vecka."]),
          opt(["Change only the CFO's own passwords", "Byt bara ekonomichefens egna lösenord"], "l4", ["Forgets the service accounts and VPN certificate on the device.", "Glömmer tjänstekontona och VPN-certifikatet på enheten."])
        ])
      }),

      pg("l4", ["The customer export", "Kundexporten"], [
        "The sync history finds the export: {{num.customersInExport|number}} customer contacts with names, direct numbers and payment terms.",
        "Synkhistoriken hittar exporten: {{num.customersInExport|number}} kundkontakter med namn, direktnummer och betalningsvillkor."
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
        "{{person.dpo.name}} needs a decision on notifying {{reg.dpaShort}}. You still do not know whether anything was read.",
        "{{person.dpo.name}} behöver ett beslut om anmälan till {{reg.dpaShort}}. Ni vet fortfarande inte om något har lästs."
      ], {
        variants: [vr("notifyClock", [
          "{{person.dpo.name}} has been counting since this morning: 61 hours left to notify {{reg.dpaShort}}. You still do not know whether anything was read.",
          "{{person.dpo.name}} har räknat sedan i morse: 61 timmar kvar att anmäla till {{reg.dpaShort}}. Ni vet fortfarande inte om något har lästs."
        ], ["Because the clock was started early, you have a deadline you can plan to.", "Eftersom klockan startades tidigt har ni en tidsgräns att planera mot."])],
        discuss: [q("What would you put in a notification today, and what would you add later?", "Vad skulle ni skriva i en anmälan i dag, och vad skulle ni komplettera med senare?", ["dpo", "legal"])],
        choice: ask(["Do you notify?", "Anmäler ni?"], ["Notifies on time with what is known and supplements later, rather than waiting for certainty.", "Anmäler i tid med det som är känt och kompletterar senare, i stället för att vänta på visshet."], [
          opt(["Notify now and follow up as facts arrive", "Anmäl nu och komplettera när fakta kommer"], "l5", ["Meets the deadline. The regulator expects updates.", "Håller tidsgränsen. Tillsynsmyndigheten förväntar sig kompletteringar."], { set: "notified" }),
          opt(["Wait for the forensic result", "Vänta på det forensiska resultatet"], "l5", ["Likely to miss 72 hours. You must then explain why.", "Missar troligen 72 timmar. Då måste ni förklara varför."], { set: "notifyLate" }),
          opt(["Decide it is not notifiable", "Besluta att det inte är anmälningspliktigt"], "l5", ["Defensible only if you are sure no one could read it. You are not.", "Försvarbart bara om ni är säkra på att ingen kunde läsa den. Det är ni inte."], { hides: "notifyClock", set: "denied" })
        ])
      }),

      pg("l5", ["The customers", "Kunderna"], [
        "Account managers ask what to say if customers call. Some of the contacts in the export are at your largest accounts.",
        "Kundansvariga frågar vad de ska säga om kunder ringer. En del av kontakterna i exporten finns hos era största kunder."
      ], {
        long: true,
        skipTo: "c9",
        choice: ask(["Do you tell the affected customers?", "Berättar ni för de berörda kunderna?"], ["Tells customers early, with practical advice about suspicious contact.", "Berättar för kunderna tidigt, med praktiska råd om misstänkta kontakter."], [
          opt(["Yes, with advice on spotting fraud attempts", "Ja, med råd om hur de känner igen bedrägeriförsök"], "c9", ["Builds trust; their contact details may be used for invoice fraud.", "Bygger förtroende; deras kontaktuppgifter kan användas för fakturabedrägerier."]),
          opt(["Only if they ask", "Bara om de frågar"], "c9", ["Quiet now, awkward if fraud follows.", "Tyst nu, pinsamt om bedrägerier följer."])
        ])
      }),

      pg("c9", ["The board asks", "Styrelsen frågar"], [
        "The chair wants a written summary before tomorrow: what happened, what you did, and what it might cost.",
        "Ordföranden vill ha en skriftlig sammanfattning före i morgon: vad som hände, vad ni gjorde och vad det kan kosta."
      ], {
        variants: [
          vr("keptQuiet", [
            "The chair heard about the laptop from an account manager and is not pleased. They want a written summary tonight.",
            "Ordföranden hörde om datorn från en kundansvarig och är inte nöjd. Hen vill ha en skriftlig sammanfattning i kväll."
          ], ["Because you kept it within IT, the board heard it from someone else.", "Eftersom ni höll det inom IT fick styrelsen höra det från någon annan."]),
          vr("dealIgnored", [
            "A letter from the financial supervisor asks about unusual trading in the target's shares. The chair wants a written summary before tomorrow.",
            "Ett brev från tillsynsmyndigheten för finansmarknaden frågar om ovanlig handel i målbolagets aktier. Ordföranden vill ha en skriftlig sammanfattning före i morgon."
          ], ["Because the deal was left out, the supervisor got there first.", "Eftersom affären lämnades utanför hann tillsynsmyndigheten först."])
        ],
        choice: ask(["What goes in the summary?", "Vad står i sammanfattningen?"], ["Writes down gaps and open questions as clearly as the actions taken.", "Skriver ned luckor och öppna frågor lika tydligt som de åtgärder som vidtagits."], [
          opt(["Everything, including what you got wrong", "Allt, även det ni gjorde fel"], "c10", ["Hard to write. The board can only govern what it is told.", "Svårt att skriva. Styrelsen kan bara styra det den får veta."]),
          opt(["A reassuring summary of actions taken", "En lugnande sammanfattning av vidtagna åtgärder"], "c10", ["Reads well until the gaps come out.", "Läses bra tills luckorna kommer fram."])
        ])
      }),

      pg("c10", ["What changes on Monday", "Vad som ändras på måndag"], [
        "A week later. The question is no longer the laptop but the next one.",
        "En vecka senare. Frågan är inte längre datorn utan nästa."
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

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["A lost laptop, nothing more", "En borttappad dator, inget mer"], [
          "Sessions were cut before anyone used them, every stored credential was replaced, and the regulator heard it from you on time. The follow-up letter closes the case.",
          "Sessionerna kapades innan någon använde dem, varje lagrad inloggningsuppgift byttes ut och tillsynsmyndigheten fick veta det av er i tid. Kompletteringen avslutar ärendet."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Notified, but with holes", "Anmält, men med luckor"], [
          "You notified in time, but some credentials on the laptop were left unchanged or the mailbox was open for hours. The regulator asks pointed follow-up questions.",
          "Ni anmälde i tid, men en del inloggningsuppgifter på datorn byttes aldrig eller så stod brevlådan öppen i timmar. Tillsynsmyndigheten ställer skarpa följdfrågor."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Late and on the back foot", "Sent och på efterkälken"], [
          "The notification arrived after 72 hours with an explanation that does not hold up. Two customers report invoice fraud attempts using contact details from the export.",
          "Anmälan kom efter 72 timmar med en förklaring som inte håller. Två kunder rapporterar försök till fakturabedrägerier med kontaktuppgifter från exporten."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["The regulator finds out first", "Tillsynsmyndigheten får veta först"], [
          "You decided it was not notifiable. Months later the regulator learns of it from a customer's complaint and opens an investigation into why you stayed silent.",
          "Ni beslutade att det inte var anmälningspliktigt. Månader senare får tillsynsmyndigheten veta det genom en kunds klagomål och inleder en utredning om varför ni teg."
        ])
      }),

      // Break-away: the public appeal.
      pg("x1", ["Going public", "Offentligt"], [
        "The appeal is shared thousands of times. A business reporter asks why a CFO's laptop matters so much to {{org.name}}.",
        "Uppropet delas tusentals gånger. En ekonomireporter frågar varför en ekonomichefs dator är så viktig för {{org.name}}."
      ], {
        injects: [
          inj("b1-4", 540, "mediaEnquiry", "media", "high", "confirmed", [
            "“We understand a laptop belonging to your CFO is missing during sensitive negotiations. Is any confidential or customer data at risk? We publish within the hour.”",
            "”Vi förstår att en dator som tillhör er ekonomichef saknas under känsliga förhandlingar. Är konfidentiella uppgifter eller kunddata i fara? Vi publicerar inom en timme.”"
          ], { headline: ["Business desk enquiry", "Fråga från ekonomiredaktionen"], tests: ["lo4"] })
        ],
        choice: ask(["What do you tell the reporter?", "Vad säger ni till reportern?"], ["Holds a single, accurate line and avoids confirming details that move markets.", "Håller en enda korrekt linje och undviker att bekräfta detaljer som påverkar marknaden."], [
          opt(["Confirm the loss and say you are assessing the data", "Bekräfta förlusten och säg att ni bedömer vilka data som berörs"], "x2", ["Honest and limited. The word “negotiations” is already in their question.", "Ärligt och begränsat. Ordet ”förhandlingar” finns redan i deras fråga."]),
          opt(["Decline to comment", "Avböj att kommentera"], "x2", ["They publish anyway, with speculation instead of facts.", "De publicerar ändå, med spekulationer i stället för fakta."])
        ])
      }),
      pg("x2", ["A different offer", "Ett annat erbjudande"], [
        "The listing disappears. A message arrives: the files on the laptop will cost ten times the asking price, or they go online.",
        "Annonsen försvinner. Ett meddelande kommer: filerna på datorn kostar tio gånger utropspriset, annars hamnar de på nätet."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Refuses to pay, involves the police and prepares for publication.", "Vägrar betala, tar in polisen och förbereder sig på en publicering."], [
          opt(["Refuse, report it and prepare for a leak", "Vägra, polisanmäl och förbered er på en läcka"], "x3", ["The right line. It does not stop the leak.", "Rätt linje. Det stoppar inte läckan."]),
          opt(["Pay to make it go away", "Betala för att få bort det"], "x3", ["Nothing guarantees the files are deleted, and you have shown you pay.", "Inget garanterar att filerna raderas, och ni har visat att ni betalar."]),
          opt(["Negotiate for time", "Förhandla för att vinna tid"], "x3", ["Time for what? Decide that before you start talking.", "Tid för vad? Bestäm det innan ni börjar prata."])
        ])
      }),
      pg("x3", ["Files online", "Filer på nätet"], [
        "Samples appear on a forum: two board papers and a page of the customer export.",
        "Utdrag dyker upp på ett forum: två styrelsepapper och en sida av kundexporten."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Notifies regulators and customers immediately once data is confirmed public.", "Anmäler till tillsynsmyndigheter och kunder omedelbart när data bekräftats vara offentliga."], [
          opt(["Notify the regulator and the customers today", "Anmäl till tillsynsmyndigheten och kunderna i dag"], "x4", ["Late, but now unavoidable.", "Sent, men nu oundvikligt."]),
          opt(["Confirm the samples are genuine first", "Bekräfta först att utdragen är äkta"], "x4", ["Reasonable for a day. Not for a week.", "Rimligt i ett dygn. Inte i en vecka."])
        ])
      }),
      pg("x4", ["The market opens", "Börsen öppnar"], [
        "The target company's shares jump before any announcement. The financial supervisor asks you to explain the timeline.",
        "Målbolagets aktie stiger kraftigt före något besked. Tillsynsmyndigheten för finansmarknaden ber er redogöra för händelseförloppet."
      ], {
        choice: ask(["How do you face the supervisor?", "Hur möter ni tillsynsmyndigheten?"], ["Cooperates fully with a documented timeline.", "Samarbetar fullt ut med ett dokumenterat händelseförlopp."], [
          opt(["Full cooperation with a written timeline", "Fullt samarbete med ett skriftligt händelseförlopp"], "e5", ["The only option left, and it helps.", "Det enda alternativet som återstår, och det hjälper."]),
          opt(["Say little and let lawyers answer", "Säg lite och låt juristerna svara"], "e5", ["Looks like there is more to hide.", "Ser ut som att det finns mer att dölja."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
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
