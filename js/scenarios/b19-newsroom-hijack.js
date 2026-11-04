/*
 * b19-newsroom-hijack.js — "Published at 05:58" (branching, news media).
 *
 * A fabricated political scoop appears on the front page under a respected reporter's
 * byline and is pushed to every app user. The attacker used a session stolen from
 * the reporter's home laptop. Spine: first move → how it happened → what you publish
 * → the reporter → a second attempt → the journalist → the platforms → the full
 * account → the night desk → what changes. Break-away at § "The journalist": blaming
 * the reporter for an editorial error.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b19-newsroom-hijack",
    version: 1,
    format: "branching",
    category: "newsroom-hijack",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "newsroom-hijack",
    title: L(["Published at 05:58", "Publicerad 05.58"]),
    summary: L([
      "At two minutes to six, your front page published a scandal that never happened, under the name of a reporter who never wrote it, and pushed it to every phone with your app. Every choice decides whether your readers believe the correction.",
      "Två minuter i sex publicerade er förstasida en skandal som aldrig har inträffat, under namnet på en reporter som aldrig skrivit den, och skickade den till varje telefon med er app. Varje val avgör om läsarna tror på rättelsen."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Stop a hijacked publication fast and close the way in", "Snabbt stoppa en kapad publicering och stänga vägen in"]), teaser: L(["Two minutes to six", "Två minuter i sex"]) },
      { id: "lo2", text: L(["Correct a fake that carries your own name", "Rätta en förfalskning som bär ert eget namn"]), teaser: L(["Your logo, their words", "Er logotyp, deras ord"]) },
      { id: "lo3", text: L(["Protect the person whose name was used", "Skydda den person vars namn användes"]), teaser: L(["The byline", "Bylinen"]) },
      { id: "lo4", text: L(["Be transparent about your own failures", "Vara öppna med era egna misslyckanden"]), teaser: L(["How it was possible", "Hur det var möjligt"]) }
    ],
    mitre: ["T1539", "T1078", "T1491.002", "T1565", "T1583"],
    frameworks: {
      nistCsf: ["GV.RR", "PR.AA", "DE.CM", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.15", "A.5.17", "A.5.24", "A.5.26", "A.8.1", "A.8.5"]
    },
    constraints: { startWindow: "monday-morning", startTime: "05:58", sectors: ["media"] },
    actor: { types: ["state"], motivation: L(["Influence: damage trust in a party and in the press with one convincing fake", "Påverkan: skada förtroendet för ett parti och för pressen med en enda övertygande förfalskning"]), capability: "high" },
    variables: {
      appUsers: { min: 50000, max: 900000, scaleBy: "size", step: 1000 },
      shares: { min: 5000, max: 200000, scaleBy: "size", step: 1000 },
      minutesLive: { min: 9, max: 34 }
    },
    roles: ["incidentCommander", "ceo", "ciso", "itOps", "serviceOwner", "comms", "legal", "hr", "securityOfficer"],

    flags: {
      unpublished: L(["Fake story taken down at once", "Den falska artikeln togs ner direkt"]),
      verifiedFirst: L(["Checked before taking it down", "Kontrollerade innan den togs ner"]),
      siteDown: L(["Whole site taken offline", "Hela sajten togs ner"]),
      siteRestoredEarly: L(["Site brought back before checks were done", "Sajten tillbaka innan kontrollerna var klara"]),
      sessionsRevoked: L(["Every publishing session revoked", "Varje publiceringssession återkallad"]),
      correctionPushed: L(["Correction pushed to app users", "Rättelse skickad till appens användare"]),
      statementHacked: L(["Said plainly that the site was hijacked", "Sa rakt ut att sajten kapats"]),
      vague: L(["Called it a publishing error", "Kallade det ett publiceringsfel"]),
      attributionHeld: L(["Kept attribution out of public statements", "Höll attribuering utanför offentliga uttalanden"]),
      attributed: L(["Named a suspected state network publicly", "Pekade ut ett misstänkt statligt nätverk offentligt"]),
      reporterBacked: L(["Stood by the reporter publicly", "Ställde sig offentligt bakom reportern"]),
      reporterSuspended: L(["Suspended the reporter", "Stängde av reportern"]),
      fourEyes: L(["Two-person approval for publishing", "Godkännande av två personer för publicering"]),
      labelled: L(["Platforms labelled the fake", "Plattformarna märkte förfalskningen"]),
      fullAccount: L(["Published a full account", "Publicerade en fullständig redogörelse"]),
      nightEditor: L(["Night editor restored", "Nattredaktör återinförd"])
    },

    start: "c1",
    pages: [
      pg("c1", ["05:58", "05.58"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The night editor's phone buzzes with the paper's own push notification. A breaking story on the front page claims that the governing party took secret donations from a foreign government, under the byline of the paper's best-known political reporter.\n\nNobody on the night desk wrote it, edited it or approved it. The push went to {{num.appUsers|number}} phones. The reporter, woken by a call, says she has never seen the text before.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Nattredaktörens telefon surrar av tidningens egen pushnotis. En nyhet på förstasidan påstår att regeringspartiet tagit emot hemliga donationer från en främmande regering, under bylinen för tidningens mest kända politiska reporter.\n\nIngen på nattdesken har skrivit, redigerat eller godkänt den. Pushen gick till {{num.appUsers|number}} telefoner. Reportern, som väcks av ett samtal, säger att hon aldrig sett texten förut."
      ], {
        injects: [
          inj("b19-1", 0, "newsHeadline", "media", "critical", "misleading", [
            "BREAKING: “Governing party took secret donations from foreign government, documents show.” By the paper's chief political reporter. Pushed to all app users at 05:58.",
            "SENASTE: ”Regeringspartiet tog emot hemliga donationer från främmande regering, visar dokument.” Av tidningens politiska chefreporter. Skickad som push till alla appanvändare klockan 05.58."
          ], { headline: ["On your own front page", "På er egen förstasida"], facilitatorNote: ["Entirely fabricated. Every minute it stays up, it is screenshotted.", "Helt påhittad. Varje minut den ligger uppe skärmdumpas den."], tests: ["lo1"] })
        ],
        discuss: [q("What is the cost of every minute this stays on your front page?", "Vad kostar varje minut som det här ligger kvar på förstasidan?", ["serviceOwner", "comms"])],
        facilitator: { notes: L(["Speed beats certainty here, but watch whether the room also thinks about the way in.", "Snabbhet vinner över säkerhet här, men se om rummet också tänker på vägen in."]) },
        choice: ask(["What is your first move?", "Vad är ert första drag?"], ["Takes the fake down at once and says so, before checking who wrote it.", "Tar ner förfalskningen direkt och säger det, innan den kontrollerar vem som skrev den."], [
          opt(["Unpublish it now and post “this article was not published by our editors”", "Avpublicera den nu och skriv ”den här artikeln publicerades inte av våra redaktörer”"], "c2", ["Fast and clear. Some screenshots already exist.", "Snabbt och tydligt. En del skärmdumpar finns redan."], { set: "unpublished" }),
          opt(["Leave it up for ten minutes while the night editor checks whether a colleague wrote it", "Låt den ligga kvar i tio minuter medan nattredaktören kontrollerar om en kollega skrev den"], "c2", ["Careful, and ten minutes is a long time for a fake scoop.", "Noggrant, och tio minuter är lång tid för ett falskt scoop."], { set: "verifiedFirst", effects: { media: 1 } }),
          opt(["Take the whole site offline until you know what happened", "Ta ner hela sajten tills ni vet vad som hänt"], "c2", ["Stops everything, and a dark news site on a big-news morning is its own story.", "Stoppar allt, och en släckt nyhetssajt en stor nyhetsmorgon är en nyhet i sig."], { set: "siteDown" })
        ])
      }),

      pg("c2", ["Her account, not her", "Hennes konto, inte hon"], [
        "{{person.itOps.name}} pulls the publishing system's logs. The story was created and published from the reporter's own account at 05:51, from an address abroad, using a valid session; no password was entered.\n\nThe reporter confirms that her home laptop has been slow for a week. The likeliest explanation is malware that steals browser sessions, and with them, everything she was signed into.",
        "{{person.itOps.name}} tar fram publiceringssystemets loggar. Artikeln skapades och publicerades från reporterns eget konto klockan 05.51, från en adress utomlands, med en giltig session; inget lösenord angavs.\n\nReportern bekräftar att hennes dator hemma har varit långsam i en vecka. Den troligaste förklaringen är skadlig kod som stjäl webbläsarsessioner, och med dem allt hon var inloggad i."
      ], {
        variants: [vr("unpublished", [
          "The fake was off the front page within {{num.minutesLive}} minutes of the push. {{person.itOps.name}} pulls the logs: it was created and published from the reporter's own account at 05:51, from an address abroad, using a valid session, without a password.\n\nThe reporter's home laptop has been slow for a week. Malware that steals browser sessions is the likeliest explanation.",
          "Förfalskningen var borta från förstasidan inom {{num.minutesLive}} minuter efter pushen. {{person.itOps.name}} tar fram loggarna: den skapades och publicerades från reporterns eget konto klockan 05.51, från en adress utomlands, med en giltig session, utan lösenord.\n\nReporterns dator hemma har varit långsam i en vecka. Skadlig kod som stjäl webbläsarsessioner är den troligaste förklaringen."
        ], ["Because you took it down at once, the fake was live for minutes, not hours.", "Eftersom ni tog ner den direkt låg förfalskningen ute i minuter, inte timmar."])],
        chart: { id: "b19-kpi", type: "kpi", title: L(["The first hour", "Den första timmen"]), data: kpi([
          { id: "k1", label: ["Phones that received the push", "Telefoner som fick pushen"], value: (v) => v.appUsers, tone: "danger" },
          { id: "k2", label: ["Shares of screenshots", "Delningar av skärmdumpar"], value: (v) => v.shares, tone: "warn" }
        ]) },
        injects: [
          inj("b19-2", 20, "logExcerpt", "person.itOps", "high", "confirmed", [
            "Publishing system: 05:51 session for user political.reporter resumed from a foreign address (no login event). 05:54 article created. 05:58 published to front page with push. Session token issued 6 days ago on her home laptop.",
            "Publiceringssystem: 05.51 session för användaren political.reporter återupptagen från utländsk adress (ingen inloggningshändelse). 05.54 artikel skapad. 05.58 publicerad på förstasidan med push. Sessionstoken utfärdad för 6 dagar sedan på hennes dator hemma."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("Whose sessions could have been stolen the same way?", "Vems sessioner kan ha stulits på samma sätt?", ["ciso"])],
        choice: ask(["Where do you put your effort now?", "Var lägger ni kraften nu?"], ["Closes every possible way back in, not only the reporter's.", "Stänger varje möjlig väg tillbaka in, inte bara reporterns."], [
          opt(["Revoke every publishing session and require security keys for everyone to sign back in", "Återkalla varje publiceringssession och kräv säkerhetsnycklar för att alla ska kunna logga in igen"], "l1", ["Locks the newsroom out for an hour, and locks the attacker out too.", "Låser ute redaktionen en timme, och låser ute angriparen också."], { set: "sessionsRevoked" }),
          opt(["Lock the reporter's account only", "Lås bara reporterns konto"], "l1", ["Quick, and only if hers was the only stolen session.", "Snabbt, och bara om hennes var den enda stulna sessionen."]),
          opt(["Find out who wrote the text and why", "Ta reda på vem som skrev texten och varför"], "c3b", ["Interesting, and the way in stays open while you read.", "Intressant, och vägen in står öppen medan ni läser."])
        ])
      }),

      pg("l1", ["The push", "Pushen"], [
        "The app vendor can send a correction push to every phone that received the fake, within minutes. {{person.comms.name}} hesitates: a second notification about the same scandal, even a correction, will put the claim in front of {{num.appUsers|number}} people one more time.\n\nSome of them only saw the headline. Some of them have already forwarded it.",
        "Appleverantören kan skicka en rättelse som push till varje telefon som fick förfalskningen, inom några minuter. {{person.comms.name}} tvekar: en andra notis om samma skandal, även en rättelse, sätter påståendet framför {{num.appUsers|number}} personer en gång till.\n\nEn del av dem såg bara rubriken. En del har redan vidarebefordrat den."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["Do you push a correction?", "Skickar ni en rättelse som push?"], ["Corrects in the same channel the fake used, so those who saw it learn it was false.", "Rättar i samma kanal som förfalskningen använde, så att de som såg den får veta att den var falsk."], [
          opt(["Push a correction now to everyone who got the fake", "Skicka en rättelse som push nu till alla som fick förfalskningen"], "c3", ["Reaches the people who saw it, and repeats the claim once.", "Når dem som såg den, och upprepar påståendet en gång."], { set: "correctionPushed", effects: { trust: 1 } }),
          opt(["Correct on the site and social channels only", "Rätta bara på sajten och i sociala kanaler"], "c3", ["Avoids repetition, and many who saw the push never see the correction.", "Undviker upprepning, och många som såg pushen ser aldrig rättelsen."])
        ])
      }),

      pg("c3", ["What you publish", "Vad ni publicerar"], [
        "By eight o'clock, screenshots of the fake are everywhere. A foreign state broadcaster is quoting it: “even the country's leading newspaper reports…”. A government minister calls the editor-in-chief, {{person.ceo.name}}, and demands a public retraction and an apology to the party.\n\nThe newsroom must now say something in its own name, and the words will be quoted around the world.",
        "Vid åtta finns skärmdumpar av förfalskningen överallt. En utländsk statlig kanal citerar den: ”till och med landets ledande tidning rapporterar …”. En minister ringer chefredaktören {{person.ceo.name}} och kräver en offentlig rättelse och en ursäkt till partiet.\n\nRedaktionen måste nu säga något i eget namn, och orden kommer att citeras över hela världen."
      ], {
        injects: [
          inj("b19-3", 120, "socialPost", "socialMedia", "high", "misleading", [
            "State broadcaster: “Even the country's leading newspaper reports that the governing party took foreign money. The paper has since removed the story under pressure.”",
            "Statlig kanal: ”Till och med landets ledande tidning rapporterar att regeringspartiet tagit emot utländska pengar. Tidningen har sedan tagit bort artikeln under press.”"
          ], { headline: ["Shared {{num.shares|number}} times", "Delad {{num.shares|number}} gånger"], facilitatorNote: ["The removal itself is being spun as censorship. Only a clear explanation answers that.", "Själva borttagningen vrids till censur. Bara en tydlig förklaring bemöter det."], tests: ["lo2"] })
        ],
        choice: ask(["What do you publish?", "Vad publicerar ni?"], ["Says plainly that the site was hijacked and the story was fake, and that the party is owed an apology.", "Säger rakt ut att sajten kapades och att artikeln var falsk, och att partiet har rätt till en ursäkt."], [
          opt(["A clear statement: the story was fake, published by an attacker using a reporter's account", "Ett tydligt uttalande: artikeln var falsk, publicerad av en angripare via en reporters konto"], "c4", ["Admits you were hacked, and kills the censorship story.", "Medger att ni hackades, och tar död på berättelsen om censur."], { set: "statementHacked", effects: { media: -1 } }),
          opt(["A short note: the article was published in error and has been removed", "En kort notis: artikeln publicerades av misstag och har tagits bort"], "c4", ["Avoids saying “hacked”, and “error” sounds like the reporter's fault.", "Undviker att säga ”hackad”, och ”misstag” låter som reporterns fel."], { set: "vague", effects: { media: 1 } }),
          opt(["Say nothing until the investigation is complete", "Säg ingenting förrän utredningen är klar"], "c4", ["The state broadcaster fills the silence.", "Den statliga kanalen fyller tystnaden."], { effects: { media: 2 } })
        ])
      }),

      pg("c3b", ["Who wrote it", "Vem som skrev den"], [
        "{{person.ciso.name}} has asked a language analyst to read the text. The style is close to the reporter's, but not quite: small errors that a native writer would not make, and phrasing seen before in campaigns attributed to a foreign state's influence network.\n\nIt would be easy, and satisfying, to say so publicly. The security service, informed by phone, asks you not to.",
        "{{person.ciso.name}} har bett en språkanalytiker läsa texten. Stilen ligger nära reporterns, men inte helt: små fel som en infödd skribent inte skulle göra, och formuleringar som setts tidigare i kampanjer som tillskrivits en främmande stats påverkansnätverk.\n\nDet vore lätt, och tillfredsställande, att säga det offentligt. Säkerhetstjänsten, som informerats per telefon, ber er att låta bli."
      ], {
        choice: ask(["Do you name who is behind it?", "Pekar ni ut vem som ligger bakom?"], ["Keeps attribution for the authorities and speaks only to what it knows.", "Lämnar attribueringen åt myndigheterna och talar bara om det den vet."], [
          opt(["Keep attribution out of public statements; hand it to the security service", "Håll attribueringen utanför offentliga uttalanden; lämna den till säkerhetstjänsten"], "c4", ["Less satisfying, and nothing you will have to take back.", "Mindre tillfredsställande, och inget ni behöver ta tillbaka."], { set: "attributionHeld" }),
          opt(["Name the suspected state network publicly", "Peka ut det misstänkta statliga nätverket offentligt"], "c4", ["A strong headline, on evidence you cannot show.", "En stark rubrik, på belägg ni inte kan visa."], { set: "attributed", effects: { media: 1 } })
        ])
      }),

      pg("c4", ["The byline", "Bylinen"], [
        "The reporter's name is on the fake, and her phone has not stopped. Party supporters accuse her of writing it and then lying; anonymous accounts post her home address. The party's press secretary demands that the paper fire her.\n\n{{person.hr.name}} reports that she is at home with her children and has asked for help. Several colleagues ask what the paper will say about her.",
        "Reporterns namn står på förfalskningen, och hennes telefon har inte slutat ringa. Partiets anhängare anklagar henne för att ha skrivit den och sedan ljugit; anonyma konton lägger ut hennes hemadress. Partiets pressekreterare kräver att tidningen sparkar henne.\n\n{{person.hr.name}} rapporterar att hon är hemma med sina barn och har bett om hjälp. Flera kollegor frågar vad tidningen kommer att säga om henne."
      ], {
        variants: [vr("vague", [
          "The reporter's name is on the fake, and your own note calls it “an error”. Party supporters read that as an admission that she wrote it. Her home address is being posted, and the party's press secretary demands that she be fired.\n\nShe is at home with her children and has asked {{person.hr.name}} why the paper did not say she was hacked.",
          "Reporterns namn står på förfalskningen, och er egen notis kallar det ”ett misstag”. Partiets anhängare läser det som ett medgivande att hon skrev den. Hennes hemadress läggs ut, och partiets pressekreterare kräver att hon sparkas.\n\nHon är hemma med sina barn och har frågat {{person.hr.name}} varför tidningen inte sa att hon blivit hackad."
        ], ["Because you called it an error, people blame the reporter.", "Eftersom ni kallade det ett misstag skyller folk på reportern."])],
        discuss: [q("What does the reporter need from you in the next hour?", "Vad behöver reportern från er den närmaste timmen?", ["hr", "securityOfficer"])],
        choice: ask(["How do you treat the reporter?", "Hur behandlar ni reportern?"], ["Says publicly that she did not write it, and protects her.", "Säger offentligt att hon inte skrev den, och skyddar henne."], [
          opt(["Stand by her publicly, say she did not write it, and arrange security for her family", "Ställ er offentligt bakom henne, säg att hon inte skrev den, och ordna skydd för hennes familj"], "l2", ["Right, and it ties the paper's name to hers.", "Rätt, och det knyter tidningens namn till hennes."], { set: "reporterBacked", effects: { trust: 1 } }),
          opt(["Suspend her pending the investigation, to show you take it seriously", "Stäng av henne under utredningen, för att visa att ni tar det på allvar"], "l2", ["Looks rigorous, and tells the trolls they were right.", "Ser noggrant ut, och säger till trollen att de hade rätt."], { set: "reporterSuspended", effects: { trust: -1 } }),
          opt(["Say nothing about her until the investigation is done", "Säg ingenting om henne förrän utredningen är klar"], "l2", ["Neutral on paper. She is alone in practice.", "Neutralt på papperet. I praktiken är hon ensam."]),
          opt(["Bring the whole site back up now, before you know whether other accounts are compromised", "Ta tillbaka hela sajten nu, innan ni vet om andra konton är komprometterade"], "l2", ["Reverses your shutdown under pressure from readers and staff.", "Upphäver er nedstängning under tryck från läsare och personal."], { requires: "siteDown", set: "siteRestoredEarly", effects: { media: -1 } })
        ])
      }),

      pg("l2", ["Her laptop", "Hennes dator"], [
        "The forensic check of the reporter's home laptop confirms an information stealer, picked up from a fake software update. It took the publishing session, and also her personal email, her cloud storage and the notes app where she keeps contact details for sources.\n\nThe fake story was the visible part. What else the attacker took is invisible.",
        "Den forensiska kontrollen av reporterns dator hemma bekräftar ett program som stjäl information, som kom med en falsk programuppdatering. Det tog publiceringssessionen, men också hennes privata e-post, hennes molnlagring och anteckningsappen där hon sparar kontaktuppgifter till källor.\n\nDen falska artikeln var den synliga delen. Vad mer angriparen tog syns inte."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about what else was taken?", "Vad gör ni med det andra som togs?"], ["Treats the source contacts as exposed and warns them.", "Behandlar källkontakterna som röjda och varnar dem."], [
          opt(["Treat it as a source exposure: review her sources and warn them", "Behandla det som en röjning av källor: gå igenom hennes källor och varna dem"], "c5", ["Hard work, and some sources may stop talking.", "Hårt arbete, och en del källor kan sluta prata."]),
          opt(["Clean the laptop and focus on the fake", "Rensa datorn och fokusera på förfalskningen"], "c5", ["Faster, and the sources never know.", "Snabbare, och källorna får aldrig veta."])
        ])
      }),

      pg("c5", ["A second attempt", "Ett andra försök"], [
        "{{time.T+320|clock}}. The publishing system raises an alert. Another reporter's account, a sports journalist this time, has started a new article: a second fabricated story, this one about vote counting.\n\nIt was caught in draft, but only because a sharp-eyed sub-editor noticed an unfamiliar headline in the queue.",
        "Klockan {{time.T+320|clock}}. Publiceringssystemet larmar. En annan reporters konto, en sportjournalist den här gången, har börjat på en ny artikel: en andra påhittad nyhet, den här gången om rösträkningen.\n\nDen fångades som utkast, men bara för att en vaksam redigerare lade märke till en okänd rubrik i kön."
      ], {
        variants: [vr("sessionsRevoked", [
          "{{time.T+320|clock}}. The publishing system logs a failed attempt: someone tried to resume an old session on a sports journalist's account, from abroad, and was refused because every session was revoked this morning and security keys are now required.\n\nThe attacker had a second way in ready. It no longer works.",
          "Klockan {{time.T+320|clock}}. Publiceringssystemet loggar ett misslyckat försök: någon försökte återuppta en gammal session på en sportjournalists konto, från utlandet, och nekades eftersom varje session återkallades i morse och säkerhetsnycklar nu krävs.\n\nAngriparen hade en andra väg in förberedd. Den fungerar inte längre."
        ], ["Because every session was revoked, the second attempt failed.", "Eftersom varje session återkallades misslyckades det andra försöket."])],
        choice: ask(["Who may publish now?", "Vem får publicera nu?"], ["Requires a second person to approve anything published until the way in is fully closed.", "Kräver att en andra person godkänner allt som publiceras tills vägen in är helt stängd."], [
          opt(["Two-person approval for everything published, until further notice", "Godkännande av två personer för allt som publiceras, tills vidare"], "l3", ["Slows breaking news, and makes a second fake much harder.", "Bromsar senaste nytt, och gör en andra förfalskning mycket svårare."], { set: "fourEyes" }),
          opt(["Limit publishing to a small group of senior editors", "Begränsa publicering till en liten grupp seniora redaktörer"], "l3", ["Fewer accounts to steal; each one is worth more.", "Färre konton att stjäla; vart och ett är värt mer."]),
          opt(["Keep normal publishing and watch the queue closely", "Behåll normal publicering och bevaka kön noga"], "l3", ["Business as usual, relying on sharp eyes.", "Som vanligt, med vaksamma ögon som skydd."])
        ])
      }),

      pg("l3", ["The advertisers", "Annonsörerna"], [
        "Two large advertisers pause their campaigns for the week: they do not want their brands next to “fake news”. The sales director wants a statement for clients by lunch.\n\nThe statement will need to explain what happened without making it sound worse than it is, or better.",
        "Två stora annonsörer pausar sina kampanjer veckan ut: de vill inte ha sina varumärken bredvid ”falska nyheter”. Försäljningschefen vill ha ett uttalande till kunderna till lunch.\n\nUttalandet behöver förklara vad som hänt utan att låta värre än det är, eller bättre."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you tell advertisers?", "Vad säger ni till annonsörerna?"], ["Gives them the same facts as readers, and what has been fixed.", "Ger dem samma fakta som läsarna, och vad som har åtgärdats."], [
          opt(["Brief them with the same facts you gave readers", "Informera dem med samma fakta som läsarna fick"], "c6", ["Consistent, and some will stay paused.", "Konsekvent, och en del förblir pausade."]),
          opt(["Offer them a discount to come back this week", "Erbjud dem rabatt för att komma tillbaka den här veckan"], "c6", ["Quick money, and it sounds like you are buying silence.", "Snabba pengar, och det låter som att ni köper tystnad."])
        ])
      }),

      pg("c6", ["The journalist", "Journalisten"], [
        "{{time.T+1440|weekday|cap}}. A media reporter from a rival outlet calls. They want to know whether the paper was hacked, how long the fake was online, and whether the paper knew it was fake before it was removed.\n\nThey also ask a pointed question: was the reporter really not involved? Their article runs this evening.",
        "{{time.T+1440|weekday|cap}}. En mediereporter från ett konkurrerande medium ringer. Hen vill veta om tidningen hackades, hur länge förfalskningen låg ute och om tidningen visste att den var falsk innan den togs bort.\n\nHen ställer också en skarp fråga: var reportern verkligen inte inblandad? Artikeln publiceras i kväll."
      ], {
        injects: [
          inj("b19-4", 1440, "mediaEnquiry", "media", "high", "confirmed", [
            "“Can you confirm your site was hijacked? How long was the story live, and was your political reporter in any way involved? We publish this evening.”",
            "”Kan ni bekräfta att er sajt kapades? Hur länge låg artikeln ute, och var er politiska reporter på något sätt inblandad? Vi publicerar i kväll.”"
          ], { headline: ["Media desk enquiry", "Fråga från medieredaktionen"], tests: ["lo4"] })
        ],
        choice: ask(["What do you tell the journalist?", "Vad säger ni till journalisten?"], ["Confirms the hijack and the timeline plainly, and clears the reporter.", "Bekräftar kapningen och tidslinjen rakt, och friar reportern."], [
          opt(["Confirm everything plainly, including the timeline, and clear the reporter", "Bekräfta allt rakt, inklusive tidslinjen, och fria reportern"], "c7", ["A hard story told straight.", "En svår nyhet berättad rakt."], { effects: { media: -1 } }),
          opt(["Confirm, and offer the editor-in-chief for an interview", "Bekräfta, och erbjud chefredaktören för en intervju"], "c7", ["Open and human. The editor will be asked about the night desk.", "Öppet och mänskligt. Chefredaktören kommer att få frågor om nattdesken."]),
          opt(["Say it was an editorial error by the reporter, and that the matter is internal", "Säg att det var ett redaktionellt misstag av reportern, och att ärendet är internt"], "x1", ["Protects the paper's systems from scrutiny, and sacrifices a colleague.", "Skyddar tidningens system från granskning, och offrar en kollega."], { effects: { media: 2, trust: -1 } })
        ])
      }),

      pg("c7", ["The screenshots", "Skärmdumparna"], [
        "The fake lives on as screenshots, shared without your correction. One platform offers to attach a label linking to your statement on posts that show the screenshot. Another says it does not label news content.\n\nThe state broadcaster is still running the story, now with a new angle: “paper silenced after revealing the truth”.",
        "Förfalskningen lever vidare som skärmdumpar, delade utan er rättelse. En plattform erbjuder sig att lägga en etikett med länk till ert uttalande på inlägg som visar skärmdumpen. En annan säger att den inte märker nyhetsinnehåll.\n\nDen statliga kanalen kör fortfarande nyheten, nu med en ny vinkel: ”tidning tystad efter att ha avslöjat sanningen”."
      ], {
        choice: ask(["What do you do about the screenshots?", "Vad gör ni med skärmdumparna?"], ["Works with the platforms to label the fake with your correction.", "Arbetar med plattformarna för att märka förfalskningen med er rättelse."], [
          opt(["Ask platforms to label posts with your statement", "Be plattformarna märka inläggen med ert uttalande"], "l4", ["Reaches people where the fake is.", "Når folk där förfalskningen finns."], { set: "labelled" }),
          opt(["Leave it; the story will burn out", "Låt det vara; nyheten brinner ut"], "l4", ["It may, slowly, and not abroad.", "Kanske, långsamt, och inte utomlands."])
        ])
      }),

      pg("l4", ["The sister papers", "Systertidningarna"], [
        "The newspaper belongs to a group with six regional titles, all on the same publishing system. Group IT would prefer to handle any wider risk internally, without alarming the other editors.\n\n{{person.ciso.name}} points out that reporters at the other titles use the same kind of home laptops, the same sessions, and the same lack of security keys.",
        "Tidningen ingår i en koncern med sex regionala titlar, alla på samma publiceringssystem. Koncernens IT vill helst hantera eventuella bredare risker internt, utan att oroa de andra redaktörerna.\n\n{{person.ciso.name}} påpekar att reportrarna på de andra titlarna använder samma sorts datorer hemma, samma sessioner och samma brist på säkerhetsnycklar."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["Do you warn the sister papers?", "Varnar ni systertidningarna?"], ["Warns every title today and shares exactly what happened.", "Varnar varje titel i dag och delar exakt vad som hänt."], [
          opt(["Warn every editor in the group today", "Varna varje redaktör i koncernen i dag"], "c8", ["Protects them, and spreads the embarrassment.", "Skyddar dem, och sprider pinsamheten."]),
          opt(["Let group IT decide how to handle it", "Låt koncernens IT bestämma hur det ska hanteras"], "c8", ["Tidy, and slower than the attacker.", "Prydligt, och långsammare än angriparen."])
        ])
      }),

      pg("c8", ["How it was possible", "Hur det var möjligt"], [
        "A readers' panel the paper runs every quarter meets early. Trust in the paper has dropped in the weekly survey, and the panel's message is simple: tell us exactly how this was possible, and what you have changed.\n\n{{person.ceo.name}} knows that a full account will include things the paper would rather not say.",
        "En läsarpanel som tidningen samlar varje kvartal träffas i förtid. Förtroendet för tidningen har sjunkit i veckans mätning, och panelens budskap är enkelt: berätta exakt hur det här var möjligt, och vad ni har ändrat.\n\n{{person.ceo.name}} vet att en fullständig redogörelse kommer att innehålla saker som tidningen helst inte vill säga."
      ], {
        variants: [vr("reporterSuspended", [
          "The readers' panel meets early, and its first question is about the reporter. Why was she suspended, if she was hacked? Trust in the paper has dropped in the weekly survey.\n\nThe panel's message is simple: tell us exactly how this was possible, what you changed, and why a victim was punished.",
          "Läsarpanelen träffas i förtid, och dess första fråga gäller reportern. Varför stängdes hon av, om hon blev hackad? Förtroendet för tidningen har sjunkit i veckans mätning.\n\nPanelens budskap är enkelt: berätta exakt hur det här var möjligt, vad ni ändrade och varför ett offer straffades."
        ], ["Because you suspended the reporter, readers ask why a victim was punished.", "Eftersom ni stängde av reportern frågar läsarna varför ett offer straffades."])],
        choice: ask(["What do you publish about how it happened?", "Vad publicerar ni om hur det gick till?"], ["Publishes a full account, including its own weaknesses.", "Publicerar en fullständig redogörelse, inklusive sina egna svagheter."], [
          opt(["A full, transparent account: the stolen session, the missing night check, what changed", "En fullständig, öppen redogörelse: den stulna sessionen, den saknade nattkontrollen, vad som ändrats"], "c9", ["Embarrassing, and the most credible thing you can publish.", "Pinsamt, och det mest trovärdiga ni kan publicera."], { set: "fullAccount", effects: { trust: 1 } }),
          opt(["A short note on the measures taken", "En kort notis om de åtgärder som vidtagits"], "c9", ["Safe, and readers will fill in the rest themselves.", "Säkert, och läsarna fyller i resten själva."])
        ])
      }),

      pg("c9", ["The night desk", "Nattdesken"], [
        "The investigation reaches an uncomfortable finding. Two years ago, to save money, the paper stopped staffing a night editor between 04:00 and 06:30. In that window, any reporter's account could publish to the front page and send a push, with no second person involved.\n\nThe decision was made by management, and it saved the cost of one salary.",
        "Utredningen kommer fram till en obekväm slutsats. För två år sedan slutade tidningen, för att spara pengar, att bemanna en nattredaktör mellan 04 och 06.30. Under det fönstret kunde vilken reporters konto som helst publicera på förstasidan och skicka en push, utan att någon annan var inblandad.\n\nBeslutet fattades av ledningen, och det sparade kostnaden för en tjänst."
      ], {
        choice: ask(["What do you do about the night desk?", "Vad gör ni med nattdesken?"], ["Restores human oversight of the front page at night, not only technical controls.", "Återinför mänsklig tillsyn över förstasidan på natten, inte bara tekniska kontroller."], [
          opt(["Restore the night editor and require a second person for front-page pushes", "Återinför nattredaktören och kräv en andra person för pushar från förstasidan"], "c10", ["Costs a salary, and closes the window they used.", "Kostar en tjänst, och stänger fönstret de använde."], { set: "nightEditor" }),
          opt(["Rely on technical controls instead of a person", "Förlita er på tekniska kontroller i stället för en person"], "c10", ["Cheaper, if the controls catch what a person would.", "Billigare, om kontrollerna fångar det en person skulle fånga."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Two weeks later. The fake has faded from most feeds, the reporter is back at work, and the security service has told you, privately, that the same network targeted two other newsrooms that week.\n\nThe crisis team meets one last time. There is budget for one real change this quarter.",
        "Två veckor senare. Förfalskningen har bleknat i de flesta flöden, reportern är tillbaka i tjänst, och säkerhetstjänsten har berättat, i förtroende, att samma nätverk riktade in sig på två andra redaktioner samma vecka.\n\nKrisledningen träffas en sista gång. Det finns budget för en verklig förändring det här kvartalet."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Makes stolen sessions useless and puts a second person on every push.", "Gör stulna sessioner värdelösa och sätter en andra person på varje push."], [
          opt(["Security keys for every publishing account, a second person for pushes, and checks on reporters' home devices", "Säkerhetsnycklar för varje publiceringskonto, en andra person för pushar och kontroller av reportrarnas enheter hemma"], "r-end", ["Closes the way in and the window it used.", "Stänger vägen in och fönstret den använde."]),
          opt(["Shorter sessions and regular password changes", "Kortare sessioner och regelbundna lösenordsbyten"], "r-end", ["Helps a little. Stolen sessions need no password.", "Hjälper lite. Stulna sessioner kräver inget lösenord."]),
          opt(["Training on fake software updates", "Utbildning om falska programuppdateringar"], "r-end", ["Worth doing, and the next trick will be different.", "Värt att göra, och nästa knep blir ett annat."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["unpublished", "statementHacked", "reporterBacked"], "e1"],
          ["statementHacked", "e2"],
          ["vague", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The fake was off the front page in minutes, the paper said plainly that it had been hijacked, and it stood by its reporter while she was threatened.\n\nTrust dipped and recovered. The press-freedom organisation now uses your statement as a model, and other newsrooms have called to ask how you did it.", "Förfalskningen var borta från förstasidan på några minuter, tidningen sa rakt ut att den kapats, och den stod bakom sin reporter medan hon hotades.\n\nFörtroendet sjönk och återhämtade sig. Pressfrihetsorganisationen använder nu ert uttalande som förebild, och andra redaktioner har ringt för att fråga hur ni gjorde."], {
        ending: end(1, ["Fast, plain and loyal", "Snabbt, rakt och lojalt"], [
          "You took the fake down at once, told the truth about the hijack and protected your reporter. The fake did damage; your answer limited it.",
          "Ni tog ner förfalskningen direkt, berättade sanningen om kapningen och skyddade er reporter. Förfalskningen gjorde skada; ert svar begränsade den."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["You told readers plainly that the site was hijacked, but the fake stayed up too long, or the reporter was left on her own while the trolls worked.\n\nThe correction is believed. The way you handled the first hour, or the reporter, is still being discussed.", "Ni berättade rakt för läsarna att sajten kapats, men förfalskningen låg ute för länge, eller så lämnades reportern ensam medan trollen arbetade.\n\nRättelsen tros på. Sättet ni hanterade den första timmen, eller reportern, diskuteras fortfarande."], {
        ending: end(2, ["Honest, but not complete", "Ärligt, men inte fullt ut"], [
          "You were honest about the hijack, but slow at the start or silent about your reporter. Trust is damaged, not lost.",
          "Ni var ärliga om kapningen, men långsamma i början eller tysta om er reporter. Förtroendet är skadat, inte förlorat."
        ])
      }),
      pg("e3", ["Two months later", "Två månader senare"], ["You called it “an error”. Many readers concluded that the reporter wrote the story and the paper covered for her, and the state broadcaster still quotes it as an admission.\n\nWhen the full facts emerged, the question was why the paper had not said so on the first day.", "Ni kallade det ”ett misstag”. Många läsare drog slutsatsen att reportern skrev artikeln och att tidningen skyddade henne, och den statliga kanalen citerar det fortfarande som ett medgivande.\n\nNär alla fakta kom fram blev frågan varför tidningen inte sa det redan första dagen."], {
        ending: end(3, ["“An error” became their proof", "”Ett misstag” blev deras bevis"], [
          "Avoiding the word “hacked” made the fake look like your reporter's work, and gave the influence campaign its best line.",
          "Att undvika ordet ”hackad” fick förfalskningen att se ut som er reporters verk, och gav påverkanskampanjen dess bästa replik."
        ])
      }),
      pg("e4", ["Three months later", "Tre månader senare"], ["You stayed silent while others told the story. By the time the paper explained, the fake had been quoted in two parliaments, and your silence was part of it: “even the newspaper won't deny it”.\n\nThe reporter has left the paper.", "Ni teg medan andra berättade historien. När tidningen förklarade sig hade förfalskningen citerats i två parlament, och er tystnad var en del av den: ”inte ens tidningen förnekar det”.\n\nReportern har lämnat tidningen."], {
        ending: end(4, ["Silence filled by others", "Tystnad som andra fyllde"], [
          "Saying nothing let the influence campaign write your story for you. The fake outlived your correction.",
          "Att inte säga något lät påverkanskampanjen skriva er historia åt er. Förfalskningen överlevde er rättelse."
        ])
      }),

      // Break-away: blaming the reporter for an "editorial error".
      pg("x1", ["The scapegoat", "Syndabocken"], [
        "The rival article runs in the evening. It quotes your statement that it was an editorial error by the reporter, and in the next paragraph it quotes the reporter herself: she was hacked, she can prove it, and the paper knows.\n\nBy morning, the story is no longer the fake. It is a newspaper that blamed its own reporter.",
        "Den konkurrerande artikeln publiceras på kvällen. Den citerar ert uttalande om att det var ett redaktionellt misstag av reportern, och i nästa stycke citerar den reportern själv: hon blev hackad, hon kan bevisa det, och tidningen vet om det.\n\nPå morgonen handlar nyheten inte längre om förfalskningen. Den handlar om en tidning som skyllde på sin egen reporter."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Withdraws the statement, apologises to the reporter and tells the full story.", "Drar tillbaka uttalandet, ber reportern om ursäkt och berättar hela historien."], [
          opt(["Withdraw the statement and apologise to her publicly", "Dra tillbaka uttalandet och be henne om ursäkt offentligt"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."]),
          opt(["Say the investigation is ongoing and decline to comment", "Säg att utredningen pågår och avböj att kommentera"], "x2", ["Reads as standing by it.", "Uppfattas som att ni står fast vid det."])
        ])
      }),
      pg("x2", ["The newsroom", "Redaktionen"], [
        "The newsroom's union holds an emergency meeting. Thirty reporters sign a public letter in support of their colleague. Two senior writers announce that they will not publish until the paper retracts its statement.\n\nThe state broadcaster runs the letter as proof that the paper is in chaos.",
        "Redaktionens fackklubb håller ett krismöte. Trettio reportrar skriver under ett öppet brev till stöd för sin kollega. Två seniora skribenter meddelar att de inte publicerar något förrän tidningen tar tillbaka sitt uttalande.\n\nDen statliga kanalen visar brevet som bevis för att tidningen är i kaos."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Retracts fully and publishes the full account.", "Tar tillbaka fullt ut och publicerar hela redogörelsen."], [
          opt(["Retract, and publish the full account today", "Ta tillbaka, och publicera hela redogörelsen i dag"], "x3", ["The only way left to start repairing it.", "Det enda sätt som återstår för att börja reparera det."]),
          opt(["Wait for the board to decide", "Vänta på att styrelsen beslutar"], "x3", ["The newsroom will not wait.", "Redaktionen kommer inte att vänta."])
        ])
      }),
      pg("x3", ["The board", "Styrelsen"], [
        "The publisher's board meets. It learned of the hijack from the paper and of the statement about the reporter from the rival. It wants to know who approved the statement, and why.",
        "Utgivarens styrelse sammanträder. Den fick veta om kapningen från tidningen och om uttalandet om reportern från konkurrenten. Den vill veta vem som godkände uttalandet, och varför."
      ], {
        choice: ask(["How do you face the board?", "Hur möter ni styrelsen?"], ["Gives the board the full timeline, including who approved the statement.", "Ger styrelsen hela tidslinjen, inklusive vem som godkände uttalandet."], [
          opt(["The full timeline, including who approved the statement", "Hela tidslinjen, inklusive vem som godkände uttalandet"], "x4", ["Painful and necessary.", "Smärtsamt och nödvändigt."]),
          opt(["A summary focused on the security fixes", "En sammanfattning med fokus på säkerhetsåtgärderna"], "x4", ["The board has read the rival's article.", "Styrelsen har läst konkurrentens artikel."])
        ])
      }),
      pg("x4", ["The press council", "Pressetiska nämnden"], [
        "The press ethics body opens a case on its own initiative. Its questions are not about the stolen session. They are about a newspaper that published a false explanation, about its own reporter, to another newspaper.",
        "Det pressetiska organet inleder ett ärende på eget initiativ. Frågorna handlar inte om den stulna sessionen. De handlar om en tidning som lämnade en falsk förklaring, om sin egen reporter, till en annan tidning."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts responsibility.", "Svarar fullständigt och tar ansvar."], [
          opt(["Answer fully and accept responsibility", "Svara fullständigt och ta ansvar"], "e5", ["It does not undo the week, but it helps.", "Det gör inte veckan ogjord, men det hjälper."]),
          opt(["Let lawyers answer in writing", "Låt jurister svara skriftligt"], "e5", ["Reads as if there is more to hide.", "Uppfattas som att det finns mer att dölja."])
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["A fake story became a scandal about the paper itself. The reporter left, two senior writers followed, and the press ethics ruling is quoted every time the paper corrects anything.\n\nThe influence network's fake has been forgotten. Your statement about your reporter has not.", "En falsk artikel blev en skandal om tidningen själv. Reportern slutade, två seniora skribenter följde efter, och det pressetiska beslutet citeras varje gång tidningen rättar något.\n\nPåverkansnätverkets förfalskning är glömd. Ert uttalande om er reporter är det inte."], {
        ending: end(5, ["You blamed your own", "Ni skyllde på er egen"], [
          "Blaming the reporter for the attacker's work turned a hijack into a lasting scandal about the paper's own honesty.",
          "Att skylla på reportern för angriparens verk gjorde en kapning till en bestående skandal om tidningens egen ärlighet."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Take a hijacked publication down at once, then close every way back in.", "Ta ner en kapad publicering direkt, och stäng sedan varje väg tillbaka in."]),
        L(["Say “we were hijacked” plainly; “an error” blames whoever is named.", "Säg ”vi kapades” rakt ut; ”ett misstag” skyller på den som namnges."]),
        L(["Protect the person whose name was used; they are the first victim.", "Skydda den person vars namn användes; hen är det första offret."]),
        L(["Stolen sessions need no password: use security keys and a second person for what matters most.", "Stulna sessioner kräver inget lösenord: använd säkerhetsnycklar och en andra person för det viktigaste."])
      ],
      strengthsToLookFor: [
        L(["Unpublishing within minutes", "Att avpublicera inom några minuter"]),
        L(["Revoking every session, not only the reporter's", "Att återkalla varje session, inte bara reporterns"]),
        L(["Standing by the reporter publicly", "Att offentligt ställa sig bakom reportern"])
      ],
      commonGaps: [
        L(["Calling it a publishing error", "Att kalla det ett publiceringsfel"]),
        L(["Naming a state network on evidence you cannot show", "Att peka ut ett statligt nätverk på belägg ni inte kan visa"]),
        L(["Forgetting what else the stolen session reached", "Att glömma vad mer den stulna sessionen nådde"])
      ],
      suggestedActions: [
        act(["Require security keys for every publishing account.", "Kräv säkerhetsnycklar för varje publiceringskonto."], "ciso", "high"),
        act(["Require a second person for front-page changes and pushes, at every hour.", "Kräv en andra person för ändringar på förstasidan och pushar, alla tider på dygnet."], "serviceOwner", "high"),
        act(["Check and protect reporters' home devices used for work.", "Kontrollera och skydda reportrarnas enheter hemma som används i arbetet."], "itOps", "medium"),
        act(["Prepare a statement and a support plan for a hijacked byline before you need them.", "Ta fram ett uttalande och en stödplan för en kapad byline innan ni behöver dem."], "comms", "medium")
      ]
    }
  });
})();
