/*
 * s19-zero-day-edge.js — "Patch Race at the Perimeter" (archetype B, vulnerability).
 *
 * Ambiguous start: a critical zero-day in your internet-facing appliance is being
 * mass-exploited, and nobody knows whether you are already hit → the vendor
 * offers only a mitigation that breaks remote work → indicators on your device
 * predate the advisory → the mitigation is bypassed → taking the appliance
 * offline becomes a business decision → stored credentials reached the
 * directory → the patch doesn't remove implants → choosing an edge strategy.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s19-zero-day-edge",
    version: 1,
    category: "vulnerability",
    archetype: "ambiguous-start",
    emblem: "zero-day",
    title: L(["Patch Race at the Perimeter", "Kapplöpning vid perimetern"]),
    summary: L([
      "A critical flaw in the appliance that connects your staff to the network is being exploited worldwide. There is no patch. Nobody knows whether you've already been hit.",
      "En kritisk brist i enheten som ansluter er personal till nätverket utnyttjas över hela världen. Det finns ingen rättning. Ingen vet om ni redan har drabbats."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Act on a zero-day before certainty", "Agera på en nolldagssårbarhet innan det finns visshet"]), teaser: L(["Acting before you are sure", "Att agera innan man är säker"]) },
      { id: "lo2", text: L(["Hunt for compromise that predates disclosure", "Leta efter intrång som skedde före offentliggörandet"]), teaser: L(["Looking backwards as well as forwards", "Att blicka bakåt och inte bara framåt"]) },
      { id: "lo3", text: L(["Decide to take a critical system offline and own the impact", "Besluta att koppla bort ett kritiskt system och ta ansvar för följderna"]), teaser: L(["Owning a hard call", "Att stå för ett svårt beslut"]) },
      { id: "lo4", text: L(["Treat a patched device as possibly still compromised", "Behandla en rättad enhet som möjligen fortfarande komprometterad"]), teaser: L(["When fixed might not mean safe", "När åtgärdat kanske inte betyder säkert"]) }
    ],
    mitre: ["T1190", "T1133", "T1552", "T1078", "T1070", "T1562"],
    frameworks: {
      nistCsf: ["ID.RA", "ID.AM", "PR.PS", "DE.CM", "DE.AE", "RS.MA", "RS.AN", "RS.MI", "RC.RP"],
      iso27001: ["A.5.7", "A.5.24", "A.5.25", "A.5.26", "A.8.8", "A.8.9", "A.8.16", "A.8.20"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "any" },
    actor: { types: ["state", "criminal", "unknown"], motivation: L(["Mass exploitation: first access, then selection of interesting targets", "Massutnyttjande: först åtkomst, därefter urval av intressanta mål"]), capability: "high" },
    variables: {
      remoteUsers: { min: 80, max: 9000, scaleBy: "size" },
      daysBefore: { min: 9, max: 35 },
      orgsHit: { min: 1200, max: 20000 },
      patchDays: { min: 4, max: 12 }
    },
    roles: ["ciso", "networkLead", "socLead", "itOps", "incidentCommander", "cio", "ceo", "supplierManager", "legal", "comms", "serviceOwner"],

    groundTruth: {
      rootCause: L([
        "An unknown actor exploited a flaw in the remote-access appliance {{asset.vpnGateway}} about {{num.daysBefore}} days before the vendor disclosed it, planted a small web shell and later copied the appliance's stored directory credentials. After the vendor's mitigation, a variant of the exploit got back in. The patch closed the flaw but did not remove what was already there.",
        "En okänd aktör utnyttjade en brist i enheten för fjärråtkomst {{asset.vpnGateway}} ungefär {{num.daysBefore}} dagar innan leverantören offentliggjorde den, placerade ett litet webbskal och kopierade senare enhetens lagrade inloggningsuppgifter till katalogtjänsten. Efter leverantörens tillfälliga åtgärd tog sig en variant av angreppet in igen. Rättningen stängde bristen men tog inte bort det som redan fanns där."
      ]),
      attackerTimeline: [
        { at: -50400, text: L(["Flaw exploited on the appliance; web shell planted.", "Bristen utnyttjas på enheten; ett webbskal placeras."]) },
        { at: -20160, text: L(["Stored directory credentials copied.", "Lagrade inloggningsuppgifter till katalogtjänsten kopieras."]) },
        { at: 0, text: L(["Vendor advisory published.", "Leverantörens säkerhetsmeddelande publiceras."]) },
        { at: 900, text: L(["Variant exploit bypasses the mitigation.", "En variant av angreppet tar sig förbi den tillfälliga åtgärden."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-predate", revealStage: "p3", text: L(["Your appliance was exploited weeks before the advisory.", "Er enhet utnyttjades flera veckor före säkerhetsmeddelandet."]) },
      { id: "hf-bypass", revealStage: "p4", text: L(["A variant of the exploit gets past the vendor's mitigation.", "En variant av angreppet tar sig förbi leverantörens tillfälliga åtgärd."]) },
      { id: "hf-ldap", revealStage: "p6", text: L(["The appliance's stored directory credentials were used inside the network.", "Enhetens lagrade inloggningsuppgifter till katalogtjänsten användes inne i nätverket."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The advisory", "Säkerhetsmeddelandet"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. A security advisory lands in the inbox of the network team at {{org.name}}. It concerns the remote-access appliance that connects staff and partners to the network from anywhere.\n\nAttackers around the world are already exploiting a critical flaw in it, and there is no patch. The appliance faces the internet by design. The first question is simple: have you already been hit?",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Ett säkerhetsmeddelande landar i nätverksteamets inkorg hos {{org.name}}. Det gäller enheten för fjärråtkomst som kopplar upp personal och partner mot nätverket var de än befinner sig.\n\nAngripare runt om i världen utnyttjar redan en kritisk brist i den, och det finns ingen rättning. Enheten är vänd mot internet av naturliga skäl. Den första frågan är enkel: har ni redan drabbats?"
        ]),
        injects: [
          inj("i1-1", 0, "advisory", "vendor", "critical", "confirmed", [
            "{{supplier.vendor}} advisory {{asset.vulnId}}: unauthenticated remote code execution in the remote-access appliance. “Exploitation observed.” No patch yet; a mitigation file will follow within hours.",
            "{{supplier.vendor}}, säkerhetsmeddelande {{asset.vulnId}}: fjärrkörning av kod utan inloggning i enheten för fjärråtkomst. ”Utnyttjande har observerats.” Ingen rättning ännu; en fil med tillfällig åtgärd kommer inom några timmar."
          ], { headline: ["Zero-day in your perimeter", "Nolldagssårbarhet i er perimeter"], tests: ["lo1"] }),
          inj("i1-2", 30, "advisory", "csirt", "high", "confirmed", [
            "{{reg.csirt|cap}}: mass exploitation of {{asset.vulnId}} is under way. Organisations should assume compromise if the device was exposed.",
            "{{reg.csirt|cap}}: massutnyttjande av {{asset.vulnId}} pågår. Organisationer bör utgå från intrång om enheten har varit exponerad."
          ], { tests: ["lo1", "lo2"] }),
          inj("i1-3", 45, "chat", "itOps", "low", "misleading", [
            "“Our device is behind the firewall's geo-blocking. We're probably fine.”",
            "”Vår enhet ligger bakom brandväggens geografiska blockering. Vi klarar oss nog.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Geo-blocking doesn't stop exploitation from in-country infrastructure. Watch for comfort-seeking.", "Geografisk blockering stoppar inte angrepp från infrastruktur inom landet. Se upp med att man söker trygghet."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-scan", type: "line", markers: "injects",
          title: L(["Exploit attempts against your appliance per hour", "Angreppsförsök mot er enhet per timme"]), unit: L(["attempts", "försök"]),
          data: line(["Attempts", "Försök"], -360, 60, 30, (x, ctx) => (x < -120 ? ctx.rng.int(0, 3) : 30 + ctx.rng.int(0, 40) + (x + 120) / 2))
        }],
        questions: {
          technical: [
            q("How quickly can you apply the mitigation when it comes?", "Hur snabbt kan ni införa den tillfälliga åtgärden när den kommer?", ["networkLead"]),
            q("How would you know if you were already compromised?", "Hur skulle ni veta om ni redan har drabbats av intrång?", ["socLead"]),
            q("Can remote staff work without the appliance?", "Kan personalen arbeta på distans utan enheten?", ["itOps"])
          ],
          executive: [
            q("Do you take the appliance offline now, before the mitigation?", "Kopplar ni bort enheten nu, före den tillfälliga åtgärden?", ["cio", "ciso"]),
            q("Who decides, and how fast?", "Vem beslutar, och hur snabbt?", ["incidentCommander"]),
            q("What does a day without remote access cost?", "Vad kostar en dag utan fjärråtkomst?", ["serviceOwner"])
          ]
        },
        challenges: [ch("{{num.remoteUsers}} staff depend on the appliance to work today.", "{{num.remoteUsers}} anställda är beroende av enheten för att kunna arbeta i dag.")],
        decision: dec("d1", "ciso", ["What do you do now?", "Vad gör ni nu?"], [
          ["Restrict access to known addresses now, start hunting for compromise and apply the mitigation the minute it arrives.", "Begränsa åtkomsten till kända adresser nu, börja leta efter intrång och inför den tillfälliga åtgärden i samma stund som den kommer."],
          ["Wait for the mitigation, then apply it.", "Vänta på den tillfälliga åtgärden och inför den sedan."],
          ["Take the appliance offline immediately.", "Koppla bort enheten omedelbart."]
        ], {
          knowns: [["The flaw is critical and actively exploited.", "Bristen är kritisk och utnyttjas aktivt."]],
          uncertainties: [["Whether you're already compromised.", "Om ni redan har drabbats av intrång."]],
          tradeoffs: {
            operational: ["Taking it offline stops remote work for everyone.", "Att koppla bort enheten stoppar distansarbetet för alla."],
            security: ["Waiting hours under mass exploitation is a gamble.", "Att vänta i timmar under massutnyttjande är ett vågspel."],
            legal: ["NIS-type rules may expect prompt action.", "Regler av NIS-typ kan förvänta sig snabba åtgärder."],
            reputational: ["Being hit by a known flaw is hard to explain.", "Att drabbas av en känd brist är svårt att förklara."]
          },
          evaluation: [["Reduces exposure before the fix arrives", "Minskar exponeringen innan rättningen kommer"], ["Starts hunting, not only patching", "Börjar leta, inte bara rätta"]],
          pushback: {
            A: [
              pb(["Field staff locked out", "Fältpersonalen utelåst"], ["Restricting access to known addresses has cut off everyone connecting from hotels, customer sites and mobile networks. The service desk has forty calls in twenty minutes. Do you open exceptions one by one, knowing each one widens the hole you just narrowed?", "Begränsningen till kända adresser har stängt ute alla som ansluter från hotell, kundplatser och mobilnät. Servicedesken har fått fyrtio samtal på tjugo minuter. Öppnar ni undantag ett i taget, trots att varje undantag vidgar hålet ni just har krympt?"]),
              pb(["A “known” address", "En ”känd” adress"], ["One partner's known address turns out to be a shared cloud range used by thousands of other customers. Your allow list lets all of them reach the appliance. Do you drop that partner from the list, or accept that “known” no longer means safe?", "En partners kända adress visar sig vara ett delat molnintervall som används av tusentals andra kunder. Er tillåtna lista släpper fram alla till enheten. Stryker ni den partnern från listan, eller accepterar ni att ”känd” inte längre betyder säker?"]),
              pb(["Hunt or allow list", "Leta eller sköta listan"], ["The SOC lead says the same three analysts cannot both hunt for compromise and handle the stream of address exceptions tonight. One of the two will be done badly. Which do you let slip?", "SOC-chefen säger att samma tre analytiker inte både kan leta efter intrång och hantera strömmen av adressundantag i kväll. Det ena kommer att göras dåligt. Vilket låter ni glida?"])
            ],
            B: [
              pb(["The curve keeps climbing", "Kurvan fortsätter uppåt"], ["Exploit attempts against your appliance have doubled in the last hour, and the vendor still says the mitigation will come “within hours”. Your device sits fully open to all of it. How many more hours are you prepared to wait?", "Angreppsförsöken mot er enhet har fördubblats den senaste timmen, och leverantören säger fortfarande att åtgärden kommer ”inom några timmar”. Er enhet står helt öppen för allt det. Hur många fler timmar är ni beredda att vänta?"]),
              pb(["Half the advice", "Halva rådet"], ["The CSIRT said to assume compromise if the device was exposed. Waiting for the mitigation answers only the future; nobody is checking whether you are already in trouble. Who starts looking, and why not now?", "CSIRT sa att man ska utgå från intrång om enheten har varit exponerad. Att vänta på åtgärden handlar bara om framtiden; ingen kontrollerar om ni redan är drabbade. Vem börjar leta, och varför inte nu?"]),
              pb(["What did you do meanwhile?", "Vad gjorde ni under tiden?"], ["Legal points out that NIS-type rules ask what appropriate measures you took once you knew. “We waited for the vendor” is the only answer you will have for these hours. Is that an answer you are willing to sign?", "Juristen påpekar att regler av NIS-typ frågar vilka lämpliga åtgärder ni vidtog när ni väl visste. ”Vi väntade på leverantören” blir det enda svaret för de här timmarna. Är det ett svar ni är beredda att skriva under på?"])
            ],
            C: [
              pb(["Nobody can work", "Ingen kan arbeta"], ["{{num.remoteUsers}} staff and every partner have lost access in one stroke. Field visits are being cancelled and the service owner wants to know who decided. Can you justify a full stop when nobody has yet seen a sign of compromise on your device?", "{{num.remoteUsers}} anställda och alla partner har förlorat åtkomsten i ett slag. Fältbesök ställs in och tjänsteägaren vill veta vem som beslutade. Kan ni försvara ett totalstopp när ingen ännu har sett något tecken på intrång i er enhet?"]),
              pb(["When does it come back?", "När kommer den tillbaka?"], ["The mitigation is due within hours, but nobody agreed what must be true before the appliance goes back online. The service owner is already asking for a time. Is the mitigation enough to reconnect, and who decides that?", "Den tillfälliga åtgärden väntas inom några timmar, men ingen har kommit överens om vad som måste gälla innan enheten kopplas upp igen. Tjänsteägaren frågar redan efter en tid. Räcker åtgärden för att ansluta igen, och vem avgör det?"]),
              pb(["The admins' route too", "Även administratörernas väg"], ["IT operations reports that the appliance was also how they reach the systems at your remote sites. With it offline, a failing server at one site cannot be fixed tonight. Do you open a hole just for the admins, or live with it?", "Driften rapporterar att enheten också var deras väg in till systemen på era fjärrplatser. När den är bortkopplad går en server som krånglar på en av platserna inte att åtgärda i kväll. Öppnar ni ett hål bara för administratörerna, eller lever ni med det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The first hunt", "Det första sökandet"], [
              io(["Nothing in the first pass", "Inget i första genomgången"], ["The SOC's first sweep of the appliance logs finds nothing that matches known exploit patterns. The network lead says it looks as if you were lucky this time.", "SOC:s första genomgång av enhetens loggar hittar inget som stämmer med kända angreppsmönster. Nätverksansvarig säger att det ser ut som om ni hade tur den här gången."], ["The first log sweep on the appliance found nothing.", "Den första genomgången av enhetens loggar hittade ingenting."]),
              io(["Through the allow list", "Genom den tillåtna listan"], ["Exploit attempts arrive from a partner address that is on your allow list. The restriction you just put in place lets them straight through to the appliance.", "Angreppsförsök kommer från en partneradress som finns på er tillåtna lista. Begränsningen ni just införde släpper rakt igenom dem till enheten."], ["Exploit attempts reached the appliance through an allowed partner address.", "Angreppsförsök nådde enheten via en tillåten partneradress."], { reopen: true }),
              io(["Buried in noise", "Begravt i brus"], ["The hunt returns thousands of scanning requests from the past day. The analysts cannot tell real attempts from background noise before the mitigation is due.", "Sökandet ger tusentals skanningsanrop från det senaste dygnet. Analytikerna kan inte skilja verkliga försök från bakgrundsbrus innan den tillfälliga åtgärden ska komma."], ["The hunt is buried in scanner noise; nothing is confirmed either way.", "Sökandet drunknar i skanningsbrus; inget är bekräftat åt något håll."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody is looking", "Ingen letar"], [
              io(["The CSIRT asks", "CSIRT frågar"], ["{{reg.csirt|cap}} calls and asks what you have done to check whether you are already compromised. The honest answer is: nothing yet.", "{{reg.csirt|cap}} ringer och frågar vad ni har gjort för att kontrollera om ni redan har drabbats. Det ärliga svaret är: ingenting ännu."], ["The CSIRT asked how you checked for compromise; you had no answer.", "CSIRT frågade hur ni sökte efter intrång; ni hade inget svar."], { meters: { regulator: 1 } }),
              io(["A peer finds a web shell", "En annan hittar ett webbskal"], ["On a sector call, a peer organisation says it has found a web shell on the same appliance model. Nobody in your team has looked at yours.", "Under ett branschsamtal berättar en annan organisation att den har hittat ett webbskal på samma enhetsmodell. Ingen i ert team har tittat på er."], ["A peer organisation found a web shell on the same appliance model.", "En annan organisation har hittat ett webbskal på samma enhetsmodell."], { reopen: true }),
              io(["Indicators, unread", "Olästa indikatorer"], ["The vendor publishes a list of indicators of compromise. It lands in a shared inbox, and nobody is assigned to check the appliance against it.", "Leverantören publicerar en lista med indikatorer på intrång. Den hamnar i en gemensam inkorg, och ingen har fått i uppdrag att kontrollera enheten mot den."], ["The vendor's published indicators have not been checked against your appliance.", "Leverantörens publicerade indikatorer har inte kontrollerats mot er enhet."])
            ])
          ]
        }),
        facilitator: fac(
          ["The question isn't only 'patch?' but 'are we already in?'", "Frågan är inte bara ”rätta?” utan ”är vi redan drabbade?”."],
          ["Exposure reduced, hunt started, mitigation ready.", "Exponeringen minskad, sökandet påbörjat och den tillfälliga åtgärden förberedd."],
          [["Ask: when was this appliance last checked for integrity?", "Fråga: när kontrollerades enhetens integritet senast?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 240,
        title: L(["A mitigation with a price", "En tillfällig åtgärd med ett pris"]),
        twist: L(["The vendor's mitigation disables the web portal that most remote staff use. Only the full client keeps working.", "Leverantörens tillfälliga åtgärd stänger av webbportalen som de flesta som arbetar på distans använder. Bara den fullständiga klienten fortsätter att fungera."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d1", option: "C" }, narrativeAppend: { en: "Because the appliance was taken offline at once, remote staff and partners have had no access all morning, and the CEO wants to know who decided.", sv: "Eftersom enheten togs ner direkt har distansarbetande personal och partner varit utan åtkomst hela förmiddagen, och vd vill veta vem som beslutade." } }
        ],
        assumptionChallenged: L(["The mitigation is a quick, painless fix.", "Den tillfälliga åtgärden är en snabb och smärtfri lösning."]),
        narrative: L([
          "{{time.T+240|clock}}. The vendor has published a temporary mitigation while it works on a patch, and the network team has the file ready to apply.\n\nThe release notes are short, and one line in them changes the conversation. The mitigation protects the appliance, but it also takes away something many people rely on every day.",
          "Klockan {{time.T+240|clock}}. Leverantören har publicerat en tillfällig åtgärd medan den arbetar på en rättning, och nätverksteamet har filen redo att installera.\n\nVersionsinformationen är kort, och en rad i den ändrar samtalet. Åtgärden skyddar enheten, men den tar också bort något som många är beroende av varje dag."
        ]),
        injects: [
          inj("i2-1", 240, "advisory", "vendor", "high", "confirmed", [
            "“Applying the mitigation disables the clientless web portal. A patch is expected in {{num.patchDays}} days.”",
            "”När den tillfälliga åtgärden införs stängs den klientlösa webbportalen av. En rättning väntas om {{num.patchDays}} dagar.”"
          ], { tests: ["lo1"] }),
          inj("i2-2", 270, "chat", "person.serviceOwner", "medium", "confirmed", [
            "“Most of the field staff and all partners use the portal. Without it they can't work.”",
            "”De flesta av fältpersonalen och alla partner använder portalen. Utan den kan de inte arbeta.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can you move key users to the full client quickly?", "Kan ni flytta nyckelanvändare till den fullständiga klienten snabbt?", ["itOps"]),
            q("Does the mitigation fix the flaw, or only hide it?", "Rättar den tillfälliga åtgärden bristen, eller döljer den den bara?", ["networkLead"]),
            q("Did restricting access to known addresses buy you time?", "Gav begränsningen till kända adresser er tid?", ["networkLead"], "d1")
          ],
          executive: [
            q("Is losing the portal for {{num.patchDays}} days acceptable?", "Är det acceptabelt att förlora portalen i {{num.patchDays}} dagar?", ["serviceOwner", "cio"]),
            q("What do you tell partners?", "Vad säger ni till partnerna?", ["comms", "supplierManager"]),
            q("Would you take the same first step again?", "Skulle ni ta samma första steg igen?", ["ciso"], "d1")
          ]
        },
        challenges: [ch("Partners threaten to escalate if they lose access.", "Partnerna hotar att eskalera om de förlorar åtkomsten.")],
        decision: dec("d2", "cio", ["Do you apply the mitigation?", "Inför ni den tillfälliga åtgärden?"], [
          ["Apply it now and move critical users to the full client.", "Inför den nu och flytta kritiska användare till den fullständiga klienten."],
          ["Apply it tonight, after working hours.", "Inför den i kväll, efter arbetstid."],
          ["Don't apply it; keep the address restriction.", "Inför den inte; behåll begränsningen av adresser."]
        ], {
          knowns: [["The mitigation breaks the portal.", "Den tillfälliga åtgärden slår ut portalen."]],
          uncertainties: [["Whether the mitigation is complete.", "Om den tillfälliga åtgärden är fullständig."]],
          tradeoffs: {
            operational: ["Field staff and partners lose access for days.", "Fältpersonal och partner förlorar åtkomsten i flera dagar."],
            security: ["Every hour unmitigated is exposure.", "Varje timme utan åtgärd innebär exponering."],
            legal: ["Partner contracts may promise access.", "Partneravtalen kan utlova åtkomst."],
            reputational: ["Delay to avoid inconvenience looks bad later.", "Att vänta för att slippa olägenheter ser illa ut i efterhand."]
          },
          evaluation: [["Accepts operational pain to close exposure", "Accepterar störningar i verksamheten för att stänga exponeringen"]],
          pushback: {
            A: [
              pb(["Not your laptops", "Inte era datorer"], ["Partners cannot install your full client on their own managed laptops. Their IT departments say approval takes a week. Moving “critical users” to the client works for staff, not for the partners who threatened to escalate. What do you tell them today?", "Partnerna kan inte installera er fullständiga klient på sina egna hanterade datorer. Deras IT-avdelningar säger att ett godkännande tar en vecka. Att flytta ”kritiska användare” till klienten fungerar för personalen, inte för partnerna som hotade att eskalera. Vad säger ni till dem i dag?"]),
              pb(["Everyone is critical", "Alla är kritiska"], ["You asked managers for their critical users. The lists add up to almost everyone who used the portal, and each manager says theirs cannot wait. Who decides which names are left out, and on what grounds?", "Ni bad cheferna om deras kritiska användare. Listorna omfattar nästan alla som använde portalen, och varje chef säger att just deras inte kan vänta. Vem avgör vilka namn som lämnas utanför, och på vilka grunder?"]),
              pb(["Not enough licences", "För få licenser"], ["IT operations finds you only have full-client licences for a fraction of the users who now need them. Getting more takes days. Do you keep the portal broken for the rest, or reconsider applying the mitigation until the client is ready?", "Driften upptäcker att ni bara har licenser för den fullständiga klienten för en bråkdel av dem som nu behöver den. Fler tar dagar att få fram. Låter ni portalen vara utslagen för resten, eller omprövar ni att införa åtgärden innan klienten är klar?"])
            ],
            B: [
              pb(["Exploited all afternoon", "Utnyttjad hela eftermiddagen"], ["The CSIRT repeats its advice: apply mitigations immediately. Attempts against your portal continue every minute while you wait for the evening. If this goes wrong, the record will show you chose convenience for eight hours. Can you defend that?", "CSIRT upprepar sitt råd: inför tillfälliga åtgärder omedelbart. Försöken mot er portal fortsätter varje minut medan ni väntar på kvällen. Om det här går fel kommer det att framgå att ni valde bekvämlighet i åtta timmar. Kan ni försvara det?"]),
              pb(["Whose working hours?", "Vems arbetstid?"], ["The field service team works evenings and nights. “After working hours” is the middle of their shift, and they rely on the portal. Do you take it from them instead, or move the change again?", "Fältserviceteamet arbetar kvällar och nätter. ”Efter arbetstid” är mitt i deras skift, och de är beroende av portalen. Tar ni den från dem i stället, eller flyttar ni ändringen igen?"]),
              pb(["Partners find out tomorrow", "Partnerna upptäcker det i morgon"], ["Unless you warn them, partners will discover tomorrow morning that the portal is gone. Warning them today tells them your device is exposed right now. Do you tell them, and what exactly do you say?", "Om ni inte varnar dem upptäcker partnerna i morgon bitti att portalen är borta. Att varna dem i dag talar om att er enhet är exponerad just nu. Säger ni något, och vad säger ni i så fall?"])
            ],
            C: [
              pb(["Attacks from an allowed address", "Angrepp från en tillåten adress"], ["The SOC sees exploit attempts coming from an address on your allow list: a partner's network. The restriction you are relying on lets those requests straight through. Is the restriction still a reason not to apply the mitigation?", "SOC ser angreppsförsök från en adress på er tillåtna lista: en partners nätverk. Begränsningen ni förlitar er på släpper rakt igenom de anropen. Är begränsningen fortfarande ett skäl att inte införa åtgärden?"]),
              pb(["You declined the fix", "Ni tackade nej till åtgärden"], ["Legal notes that you now hold the vendor's mitigation and have chosen not to apply it. If the device is exploited, that choice will be in every report and insurance claim. Who puts their name on that decision?", "Juristen påpekar att ni nu har leverantörens åtgärd och har valt att inte införa den. Om enheten utnyttjas kommer det valet att finnas med i varje rapport och försäkringsärende. Vem sätter sitt namn på det beslutet?"]),
              pb(["Exceptions pile up", "Undantagen hopar sig"], ["Since the morning, sixty requests to add new addresses have come in from staff and partners who cannot connect. Each one you approve weakens the only protection you kept. Do you keep saying yes, or stop and accept the complaints?", "Sedan i morse har det kommit sextio önskemål om nya adresser från personal och partner som inte kommer in. Varje undantag ni godkänner försvagar det enda skydd ni behöll. Fortsätter ni att säga ja, eller stoppar ni och tar klagomålen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The portal goes dark", "Portalen släcks"], [
              io(["A smooth switch", "Ett smidigt byte"], ["Most staff move to the full client faster than anyone feared. The service desk queue clears within the hour, and the CIO calls it a model change.", "De flesta anställda går över till den fullständiga klienten snabbare än någon befarade. Servicedeskens kö är borta inom en timme, och IT-chefen kallar det en mönsterändring."], ["Staff largely moved to the full client without trouble.", "Personalen gick till stor del över till den fullständiga klienten utan problem."]),
              io(["Partners stranded", "Partnerna strandsatta"], ["Partners cannot use the full client, and the largest of them escalates straight to your CEO: their teams are idle and they want the portal back today.", "Partnerna kan inte använda den fullständiga klienten, och den största av dem eskalerar direkt till er vd: deras team står stilla och de vill ha portalen tillbaka i dag."], ["The largest partner has escalated the lost portal to your CEO.", "Den största partnern har eskalerat den förlorade portalen till er vd."], { reopen: true, meters: { trust: -1 } }),
              io(["Attempts keep coming", "Försöken fortsätter"], ["Exploit attempts keep arriving after the mitigation. The vendor says that is expected and they should fail; the SOC has no way yet to confirm it.", "Angreppsförsöken fortsätter att komma efter den tillfälliga åtgärden. Leverantören säger att det är väntat och att de borde misslyckas; SOC har ännu inget sätt att bekräfta det."], ["Exploit attempts continue; nobody can yet confirm that they fail.", "Angreppsförsöken fortsätter; ingen kan ännu bekräfta att de misslyckas."])
            ]),
            ir("i2", { notChosen: "A" }, ["Hours left open", "Timmar med öppen dörr"], [
              io(["The CSIRT takes note", "CSIRT noterar"], ["{{reg.csirt|cap}} asks whether you have applied the mitigation. When told you have not, it records your answer and asks for a reason in writing.", "{{reg.csirt|cap}} frågar om ni har infört den tillfälliga åtgärden. När ni svarar nej noterar de svaret och ber om en skriftlig motivering."], ["The CSIRT has recorded that the mitigation was not applied when asked.", "CSIRT har noterat att åtgärden inte var införd när de frågade."], { meters: { regulator: 1 } }),
              io(["A burst of attempts", "En våg av försök"], ["A sharp burst of exploit attempts hits the unmitigated appliance. The network lead cannot tell whether any of them succeeded and asks to apply the mitigation now.", "En kraftig våg av angreppsförsök träffar enheten utan åtgärd. Nätverksansvarig kan inte avgöra om något av dem lyckades och vill införa åtgärden nu."], ["A burst of attempts hit the unmitigated appliance; the outcome is unknown.", "En våg av försök träffade enheten utan åtgärd; utfallet är okänt."], { reopen: true }),
              io(["A quiet afternoon", "En lugn eftermiddag"], ["The afternoon passes without visible trouble. The service owner says the delay was clearly right and wants the same approach the next time security asks for a quick change.", "Eftermiddagen går utan synliga problem. Tjänsteägaren säger att förseningen uppenbarligen var rätt och vill ha samma hållning nästa gång säkerhet ber om en snabb ändring."], ["The afternoon passed quietly; the business sees the delay as vindicated.", "Eftermiddagen var lugn; verksamheten ser förseningen som rätt."])
            ])
          ]
        }),
        facilitator: fac(
          ["Security costs something visible. Who decides to pay it?", "Säkerhet kostar något synligt. Vem beslutar att betala det?"],
          ["Mitigation applied now with a workaround for critical users.", "Den tillfälliga åtgärden införd nu med en lösning för kritiska användare."],
          [["Ask: who are the critical users, by name?", "Fråga: vilka är de kritiska användarna, med namn?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 480,
        title: L(["Earlier than anyone knew", "Tidigare än någon visste"]),
        twist: L(["Your appliance shows signs of exploitation {{num.daysBefore}} days before the advisory.", "Er enhet visar tecken på utnyttjande {{num.daysBefore}} dagar före säkerhetsmeddelandet."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The appliance was exploited before the advisory. If you applied the mitigation at once, you broke the portal for something that was already too late. If you waited until tonight, you gave them the afternoon.", sv: "Enheten utnyttjades före varningen. Om ni tillämpade åtgärden direkt slog ni ut portalen för något som redan var för sent. Om ni väntade till i kväll gav ni dem eftermiddagen." } },
        assumptionChallenged: L(["We're racing to patch before the attackers get to us.", "Vi tävlar om att rätta innan angriparna når oss."]),
        reveals: ["hf-predate"],
        narrative: L([
          "{{time.T+480|clock}}. The SOC runs the vendor's integrity checker on the appliance and searches for the published indicators of compromise.\n\nSo far, everyone has treated this as a race to protect the device before attackers reach it. The results show whether you were in that race at all.",
          "Klockan {{time.T+480|clock}}. SOC kör leverantörens integritetskontroll på enheten och söker efter de publicerade indikatorerna på intrång.\n\nHittills har alla behandlat det här som en kapplöpning för att skydda enheten innan angriparna når den. Resultatet visar om ni över huvud taget var med i den kapplöpningen."
        ]),
        injects: [
          inj("i3-1", 480, "forensicFinding", "soc", "critical", "confirmed", [
            "The integrity check flags a modified file on {{asset.vpnGateway}}, first seen {{num.daysBefore}} days ago. It matches a known web shell. Logs on the device only go back seven days.",
            "Integritetskontrollen flaggar en ändrad fil på {{asset.vpnGateway}}, först sedd för {{num.daysBefore}} dagar sedan. Den stämmer med ett känt webbskal. Loggarna på enheten sträcker sig bara sju dagar bakåt."
          ], { headline: ["Compromised before the advisory", "Komprometterad före säkerhetsmeddelandet"], reveals: ["hf-predate"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c3-timeline", type: "timeline",
          title: L(["What happened when", "Vad som hände när"]),
          data: (ctx) => ({ events: [
            { at: -ctx.vars.daysBefore * 1440, kind: "attacker", label: L(["Web shell planted", "Webbskal placerat"]) },
            { at: -10080, kind: "inject", label: L(["Oldest log on the device", "Äldsta loggen på enheten"]) },
            { at: 0, kind: "inject", label: L(["Vendor advisory", "Leverantörens säkerhetsmeddelande"]) },
            { at: 240, kind: "decision", label: L(["Mitigation applied", "Tillfällig åtgärd införd"]) }
          ] })
        }],
        questions: {
          technical: [
            q("What could the attacker reach from the appliance in {{num.daysBefore}} days?", "Vad kunde angriparen nå från enheten under {{num.daysBefore}} dagar?", ["socLead", "networkLead"]),
            q("Which logs outside the device can fill the gap?", "Vilka loggar utanför enheten kan fylla luckan?", ["socLead"]),
            q("Did the mitigation remove the web shell?", "Tog den tillfälliga åtgärden bort webbskalet?", ["networkLead"], "d2")
          ],
          executive: [
            q("Is this now an incident to report?", "Är det här nu en incident som ska rapporteras?", ["legal", "ciso"]),
            q("Do you bring in outside incident responders?", "Tar ni in externa incidenthanterare?", ["ciso", "cio"]),
            q("Did your speed on the mitigation matter, given this?", "Spelade er snabbhet med den tillfälliga åtgärden någon roll, med tanke på det här?", ["cio"], "d2")
          ]
        },
        challenges: [ch("The race was lost weeks ago.", "Kapplöpningen förlorades för flera veckor sedan.")],
        decision: dec("d3", "ciso", ["How do you respond?", "Hur agerar ni?"], [
          ["Treat it as a breach: bring in responders, image the device, hunt inside the network and reset its credentials.", "Behandla det som ett intrång: ta in incidenthanterare, avbilda enheten, leta inne i nätverket och byt dess inloggningsuppgifter."],
          ["Remove the web shell and keep watching.", "Ta bort webbskalet och fortsätt bevaka."],
          ["Reinstall the appliance and move on.", "Installera om enheten och gå vidare."]
        ], {
          knowns: [["The device was compromised for weeks.", "Enheten har varit komprometterad i flera veckor."]],
          uncertainties: [["What the attacker did inside.", "Vad angriparen gjorde på insidan."]],
          tradeoffs: {
            operational: ["A full response is costly and slow.", "En fullständig hantering är dyr och långsam."],
            security: ["Removing the shell doesn't undo what was taken.", "Att ta bort skalet ändrar inte det som redan har tagits."],
            legal: ["Reporting clocks may already be running.", "Rapporteringsfrister kan redan löpa."],
            reputational: ["An under-response discovered later is worse.", "En otillräcklig hantering som upptäcks senare är värre."]
          },
          evaluation: [["Shifts from patching to incident response", "Går från rättning till incidenthantering"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["Down all night", "Nere hela natten"], ["To image the device properly, the responders need it offline for most of the night. Remote access stops again, the day after the portal was already taken away. Do you accept another outage for evidence, or image it while it stays in service?", "För att avbilda enheten ordentligt behöver incidenthanterarna ha den bortkopplad större delen av natten. Fjärråtkomsten stoppas igen, dagen efter att portalen redan togs bort. Accepterar ni ännu ett avbrott för bevisningens skull, eller avbildar ni den medan den är i drift?"]),
              pb(["Is this overkill?", "Är det här överdrivet?"], ["The CIO looks at the responders' first estimate: several days of work, scope “the whole network”. “It is one file on one box,” the CIO says. How do you justify the size of this response with what you actually know?", "IT-chefen tittar på incidenthanterarnas första uppskattning: flera dagars arbete, omfattning ”hela nätverket”. ”Det är en fil på en enhet”, säger IT-chefen. Hur motiverar ni hanteringens storlek med det ni faktiskt vet?"]),
              pb(["The clock starts now", "Klockan börjar ticka nu"], ["Legal points out that once you formally call this a breach, reporting deadlines start running today, and you know very little yet. Calling it something softer buys time. Do you name it a breach now?", "Juristen påpekar att när ni formellt kallar det här ett intrång börjar rapporteringsfristerna löpa i dag, och ni vet fortfarande väldigt lite. Att kalla det något mildare köper tid. Kallar ni det ett intrång nu?"])
            ],
            B: [
              pb(["Seven days of sight", "Sju dagars insyn"], ["The device only keeps seven days of logs, but the web shell is far older. Watching from now on covers none of the weeks before. What did the shell do in that time, and how will watching ever tell you?", "Enheten sparar bara sju dagars loggar, men webbskalet är betydligt äldre. Att bevaka från och med nu täcker inget av veckorna innan. Vad gjorde skalet under den tiden, och hur ska bevakning någonsin kunna visa det?"]),
              pb(["Evidence in the bin", "Bevisning i papperskorgen"], ["Your response partner asks for the web shell file and its timestamps before anyone touches it. The network team deleted it twenty minutes ago. Do you stop the clean-up until evidence is secured, or carry on?", "Er incidentpartner vill ha webbskalets fil och dess tidsstämplar innan någon rör den. Nätverksteamet raderade den för tjugo minuter sedan. Stoppar ni städningen tills bevisningen är säkrad, eller fortsätter ni?"]),
              pb(["“So it's not an incident?”", "”Så det är inte en incident?”"], ["The CSIRT asks whether you consider yourselves compromised. Removing a file and watching sounds like you do not. Is a device that held an attacker's tool for weeks an incident or not, and what do you say?", "CSIRT frågar om ni anser er komprometterade. Att ta bort en fil och bevaka låter som att ni inte gör det. Är en enhet som har haft angriparens verktyg i flera veckor en incident eller inte, och vad svarar ni?"])
            ],
            C: [
              pb(["The box is clean, the rest?", "Enheten är ren, men resten?"], ["A reinstall wipes the appliance. But for weeks, it sat between the internet and your internal network, and nobody has looked at what it could reach. What gives you confidence there is nothing to move on from?", "En ominstallation rensar enheten. Men i flera veckor stod den mellan internet och ert interna nätverk, och ingen har tittat på vad den kunde nå. Vad ger er trygghet att det inte finns något kvar att hantera?"]),
              pb(["Evidence wiped", "Bevisningen raderad"], ["The insurer's terms require evidence to be preserved before remediation. A clean reinstall erases the only record of weeks of access. Do you reinstall anyway, and risk the cover, or image it first?", "Försäkringsvillkoren kräver att bevisning bevaras innan åtgärder vidtas. En ren ominstallation raderar det enda spåret av flera veckors åtkomst. Installerar ni om ändå och riskerar skyddet, eller avbildar ni först?"]),
              pb(["Another day without access", "Ännu en dag utan åtkomst"], ["The network lead says a reinstall and reconfiguration takes the rest of today and part of tomorrow. Remote staff lose access again, for a step that answers none of your questions. Is that the right use of the outage?", "Nätverksansvarig säger att en ominstallation och ny konfiguration tar resten av dagen och en del av morgondagen. Distansarbetande personal förlorar åtkomsten igen, för ett steg som inte besvarar någon av era frågor. Är det rätt sätt att använda avbrottet?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The responders arrive", "Incidenthanterarna kommer"], [
              io(["Evidence secured", "Bevisningen säkrad"], ["The responders image the appliance and lock the copy away. Their first sweep inside the network finds nothing alarming so far, and the CIO starts asking when they can stand down.", "Incidenthanterarna avbildar enheten och låser in kopian. Deras första genomgång inne i nätverket hittar inget oroande hittills, och IT-chefen börjar fråga när de kan avbryta."], ["The device image is secured; the first internal sweep found nothing yet.", "Avbildningen är säkrad; den första interna genomgången har inte hittat något ännu."]),
              io(["The insurer objects", "Försäkringsbolaget invänder"], ["{{supplier.insurer}} says the responders you called are not on its approved list. Unless you switch firms, the costs of this response may not be covered.", "{{supplier.insurer}} säger att incidenthanterarna ni anlitade inte finns på deras godkända lista. Om ni inte byter företag kanske kostnaderna för hanteringen inte täcks."], ["The insurer has questioned your choice of responders and its cover.", "Försäkringsbolaget har ifrågasatt ert val av incidenthanterare och sitt skydd."], { reopen: true }),
              io(["A second file", "En andra fil"], ["In the image, the responders notice another recently changed file that the integrity check did not flag. It may be a normal update, or it may not. They cannot say yet.", "I avbildningen ser incidenthanterarna ytterligare en nyligen ändrad fil som integritetskontrollen inte flaggade. Den kan vara en vanlig uppdatering, eller inte. De kan inte säga det ännu."], ["An unexplained second changed file sits in the device image.", "En oförklarad andra ändrad fil finns i avbildningen av enheten."])
            ]),
            ir("i2", { notChosen: "A" }, ["No outside eyes", "Inga ögon utifrån"], [
              io(["Declared clean", "Förklarad ren"], ["After the clean-up, the integrity checker comes back clean. The network team declares the appliance fixed, and the mood in the room lifts.", "Efter rensningen ger integritetskontrollen inga anmärkningar. Nätverksteamet förklarar enheten åtgärdad, och stämningen i rummet lättar."], ["The integrity checker reported the device clean after the clean-up.", "Integritetskontrollen rapporterade enheten som ren efter rensningen."]),
              io(["Nothing to hand over", "Inget att lämna över"], ["{{reg.csirt|cap}} asks for a copy of the web shell and the device's state to help other victims. Nothing was preserved before the clean-up.", "{{reg.csirt|cap}} ber om en kopia av webbskalet och enhetens tillstånd för att hjälpa andra drabbade. Inget säkrades före rensningen."], ["No image or copy of the web shell was kept before the clean-up.", "Ingen avbildning eller kopia av webbskalet sparades före rensningen."], { reopen: true, meters: { regulator: 1 } }),
              io(["What does it hold?", "Vad finns i den?"], ["Someone asks what the appliance stores and what it can reach. Nobody in the room can answer; it was set up years ago and the documentation is thin.", "Någon frågar vad enheten lagrar och vad den kan nå. Ingen i rummet kan svara; den sattes upp för flera år sedan och dokumentationen är tunn."], ["Nobody could say what the appliance stored when the clean-up was decided.", "Ingen kunde säga vad enheten lagrade när rensningen beslutades."])
            ])
          ]
        }),
        facilitator: fac(
          ["The ambiguity resolves: you were never ahead.", "Ovissheten skingras: ni låg aldrig före."],
          ["A full breach response with outside help and credential resets.", "En fullständig hantering av intrånget med extern hjälp och byte av inloggningsuppgifter."],
          [["Ask: what credentials does the appliance hold?", "Fråga: vilka inloggningsuppgifter finns lagrade i enheten?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 900,
        title: L(["Back through the gap", "Tillbaka genom luckan"]),
        twist: L(["A new variant of the exploit gets past the mitigation. Your device is being exploited again.", "En ny variant av angreppet tar sig förbi den tillfälliga åtgärden. Er enhet utnyttjas igen."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because responders imaged the device and hunted inside the network, remote access stayed down overnight, and sales missed a customer demonstration.", sv: "Eftersom incidentteamet avbildade enheten och letade inne i nätet var fjärråtkomsten nere hela natten, och säljavdelningen missade en kunddemonstration." } }
        ],
        assumptionChallenged: L(["The mitigation closed the hole.", "Den tillfälliga åtgärden stängde hålet."]),
        reveals: ["hf-bypass"],
        narrative: L([
          "{{time.T+900|clock}}. The device has been cleaned as far as possible and the mitigation is in place. The team expected a quiet evening.\n\nInstead, the SOC sees fresh activity on the device: new requests, and a new file. Researchers online are discussing a variant of the exploit that appeared today.",
          "Klockan {{time.T+900|clock}}. Enheten har rensats så långt det går och den tillfälliga åtgärden är på plats. Teamet räknade med en lugn kväll.\n\nI stället ser SOC ny aktivitet på enheten: nya anrop och en ny fil. Forskare på nätet diskuterar en variant av angreppet som dök upp i dag."
        ]),
        injects: [
          inj("i4-1", 900, "edrAlert", "soc", "critical", "confirmed", [
            "New requests to the appliance match a variant that researchers say bypasses the mitigation. A new file has appeared since this morning.",
            "Nya anrop till enheten stämmer med en variant som forskare säger tar sig förbi den tillfälliga åtgärden. En ny fil har dykt upp sedan i morse."
          ], { headline: ["Mitigation bypassed", "Den tillfälliga åtgärden förbigången"], reveals: ["hf-bypass"], tests: ["lo3"] }),
          inj("i4-2", 930, "advisory", "vendor", "high", "confirmed", [
            "The vendor updates its advisory: “A second mitigation is in development.” No date.",
            "Leverantören uppdaterar sitt säkerhetsmeddelande: ”En andra tillfällig åtgärd tas fram.” Inget datum."
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Is there any configuration that makes the device safe?", "Finns det någon konfiguration som gör enheten säker?", ["networkLead"]),
            q("What alternative remote access could you stand up?", "Vilken alternativ fjärråtkomst skulle ni kunna sätta upp?", ["itOps", "networkLead"]),
            q("Did your breach response cover re-entry?", "Täckte er hantering av intrånget ett nytt intrång?", ["socLead"], "d3")
          ],
          executive: [
            q("Do you keep trusting this device at all?", "Fortsätter ni över huvud taget att lita på den här enheten?", ["ciso", "cio"]),
            q("How long can the business run without remote access?", "Hur länge kan verksamheten klara sig utan fjärråtkomst?", ["serviceOwner", "ceo"]),
            q("Was applying the first mitigation still worth it?", "Var det fortfarande värt att införa den första tillfälliga åtgärden?", ["cio"], "d2")
          ]
        },
        challenges: [ch("There's no date for a working fix.", "Det finns inget datum för en fungerande rättning.")],
        decision: dec("d4", "ciso", ["What do you recommend?", "Vad rekommenderar ni?"], [
          ["Take the appliance offline until a patch exists, and stand up a temporary alternative for critical users.", "Koppla bort enheten tills det finns en rättning, och sätt upp ett tillfälligt alternativ för kritiska användare."],
          ["Keep it online with heavy monitoring.", "Behåll den uppkopplad med kraftig bevakning."],
          ["Wait for the second mitigation.", "Vänta på den andra tillfälliga åtgärden."]
        ], {
          knowns: [["The mitigation is bypassed.", "Den tillfälliga åtgärden är förbigången."]],
          uncertainties: [["When a patch arrives.", "När en rättning kommer."]],
          tradeoffs: {
            operational: ["Offline means no remote access for most staff.", "Bortkopplad innebär ingen fjärråtkomst för de flesta anställda."],
            security: ["Monitoring a known-bypassed device just watches the break-in.", "Att bevaka en enhet med känd förbigång är att se på inbrottet."],
            legal: ["Authorities are urging disconnection.", "Myndigheterna uppmanar till bortkoppling."],
            reputational: ["Staying online and being hit again is indefensible.", "Att vara uppkopplad och drabbas igen går inte att försvara."]
          },
          evaluation: [["Recommends disconnection and plans for the impact", "Rekommenderar bortkoppling och planerar för följderna"]],
          pushback: {
            A: [
              pb(["Two days to build", "Två dagar att bygga"], ["The network lead says a temporary alternative for even fifty critical users is two days of work, if nothing goes wrong. Until then, nobody has remote access at all. What do your critical users do in the meantime?", "Nätverksansvarig säger att ett tillfälligt alternativ för ens femtio kritiska användare tar två dagars arbete, om inget går fel. Fram till dess har ingen fjärråtkomst alls. Vad gör era kritiska användare under tiden?"]),
              pb(["Staff find their own way", "Personalen hittar egna vägar"], ["Within hours, staff start forwarding work mail to private accounts and installing remote-desktop tools to reach their office PCs. Disconnecting the appliance is creating new holes you cannot see. How do you stop it without blocking the work?", "Inom några timmar börjar personal vidarebefordra jobbmejl till privata konton och installera verktyg för fjärrskrivbord för att nå sina kontorsdatorer. Bortkopplingen skapar nya hål som ni inte ser. Hur stoppar ni det utan att stoppa arbetet?"]),
              pb(["“Until a patch exists”", "”Tills det finns en rättning”"], ["The vendor still promises a patch in {{num.patchDays}} days, but it has already published one mitigation that did not hold. Your decision has no end date. Do you set a limit on how long you stay offline, and what happens when it is reached?", "Leverantören utlovar fortfarande en rättning om {{num.patchDays}} dagar, men har redan publicerat en åtgärd som inte höll. Ert beslut saknar slutdatum. Sätter ni en gräns för hur länge enheten är bortkopplad, och vad händer när den nås?"])
            ],
            B: [
              pb(["An hour behind", "En timme efter"], ["Heavy monitoring did catch the new file, about an hour after it appeared. The attacker gets that hour every time. What can someone with code running on your edge device do in an hour, and is watching enough?", "Den kraftiga bevakningen upptäckte den nya filen, ungefär en timme efter att den dök upp. Angriparen får den timmen varje gång. Vad kan någon som kör kod på er perimeterenhet göra på en timme, och räcker det att titta?"]),
              pb(["Who watches all night?", "Vem bevakar hela natten?"], ["Heavy monitoring means eyes on one box around the clock. The SOC lead says the analysts are fifteen hours into their shift and there is nobody to relieve them. Who watches at three in the morning?", "Kraftig bevakning innebär ögon på en enda enhet dygnet runt. SOC-chefen säger att analytikerna har arbetat i femton timmar och att ingen kan avlösa dem. Vem bevakar klockan tre i natt?"]),
              pb(["Against the authorities' advice", "Mot myndigheternas råd"], ["The authorities are urging organisations to disconnect affected devices. You have chosen to stay online with a known bypass. Legal asks how you will explain that choice if you are asked tomorrow. What is the explanation?", "Myndigheterna uppmanar organisationer att koppla bort drabbade enheter. Ni har valt att vara uppkopplade trots en känd förbigång. Juristen frågar hur ni ska förklara det valet om ni får frågan i morgon. Vad är förklaringen?"])
            ],
            C: [
              pb(["No date", "Inget datum"], ["The vendor's update says only that a second mitigation is in development. Researchers report the variant is already spreading. Each night you wait, the device stays open to a known attack. How many nights are acceptable?", "Leverantörens uppdatering säger bara att en andra tillfällig åtgärd tas fram. Forskare rapporterar att varianten redan sprids. Varje natt ni väntar står enheten öppen för ett känt angrepp. Hur många nätter är acceptabelt?"]),
              pb(["Why trust the second one?", "Varför lita på den andra?"], ["The first mitigation cost you the portal and was bypassed the same day. The second comes from the same vendor, under the same pressure. What makes you willing to bet on it?", "Den första åtgärden kostade er portalen och förbigicks samma dag. Den andra kommer från samma leverantör, under samma press. Vad gör att ni är beredda att satsa på den?"]),
              pb(["The team won't sign", "Teamet skriver inte under"], ["The network lead refuses to put their name to keeping a bypassed device online while waiting. “We'd just be watching the break-in.” Do you overrule your own expert, or rethink the wait?", "Nätverksansvarig vägrar sätta sitt namn på att hålla en förbigången enhet uppkopplad i väntan. ”Vi skulle bara titta på inbrottet.” Kör ni över er egen expert, eller tänker ni om kring väntandet?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The recommendation lands", "Rekommendationen landar"], [
              io(["Peers do the same", "Andra gör likadant"], ["{{reg.csirt|cap}} reports that several organisations have taken the same appliance offline tonight. Your recommendation suddenly looks like the mainstream choice.", "{{reg.csirt|cap}} rapporterar att flera organisationer har kopplat bort samma enhet i kväll. Er rekommendation ser plötsligt ut som det självklara valet."], ["Several peer organisations have disconnected the same appliance.", "Flera andra organisationer har kopplat bort samma enhet."]),
              io(["No fallback exists", "Det finns ingen reserv"], ["IT operations discovers that the old backup remote-access route was decommissioned last year. There is nothing to switch on for critical users; any alternative must be built from scratch.", "Driften upptäcker att den gamla reservvägen för fjärråtkomst avvecklades förra året. Det finns inget att slå på för kritiska användare; varje alternativ måste byggas från grunden."], ["There is no ready alternative remote access; it must be built from scratch.", "Det finns ingen färdig alternativ fjärråtkomst; den måste byggas från grunden."], { reopen: true }),
              io(["An unofficial date", "Ett inofficiellt datum"], ["The vendor's account manager hints, off the record, that the patch may come sooner than {{num.patchDays}} days. Asked to put it in writing, they decline.", "Leverantörens kundansvarige antyder, inofficiellt, att rättningen kan komma tidigare än om {{num.patchDays}} dagar. Ombedd att skriva det avböjer hen."], ["The vendor hinted at an earlier patch, without any commitment.", "Leverantören antydde en tidigare rättning, utan något åtagande."])
            ]),
            ir("i2", { notChosen: "A" }, ["Still connected", "Fortfarande uppkopplad"], [
              io(["Three quiet hours", "Tre lugna timmar"], ["For three hours after the decision, the SOC sees no new activity on the appliance. The team takes it as a sign that the approach is working.", "Under tre timmar efter beslutet ser SOC ingen ny aktivitet på enheten. Teamet tar det som ett tecken på att hållningen fungerar."], ["The appliance was quiet for three hours after the decision.", "Enheten var tyst i tre timmar efter beslutet."]),
              io(["A public call to disconnect", "En offentlig uppmaning"], ["{{reg.csirt|cap}} publicly urges organisations to disconnect affected devices until a patch exists. Your recommendation now runs against the authorities' advice.", "{{reg.csirt|cap}} uppmanar offentligt organisationer att koppla bort drabbade enheter tills det finns en rättning. Er rekommendation går nu emot myndigheternas råd."], ["The CSIRT publicly urges disconnecting affected devices.", "CSIRT uppmanar offentligt till bortkoppling av drabbade enheter."], { reopen: true, meters: { regulator: 1 } }),
              io(["An outbound connection", "En utgående anslutning"], ["The SOC spots a short outbound connection from the appliance to an address nobody recognises. It lasted seconds. Nobody can tell what, if anything, left.", "SOC upptäcker en kort utgående anslutning från enheten till en adress som ingen känner igen. Den varade i några sekunder. Ingen kan säga vad, om något, som lämnade enheten."], ["An unexplained outbound connection left the appliance.", "En oförklarad utgående anslutning lämnade enheten."])
            ])
          ]
        }),
        facilitator: fac(
          ["Now the business must accept real pain. Who owns that?", "Nu måste verksamheten acceptera verklig smärta. Vem äger det?"],
          ["A recommendation to disconnect with an alternative for critical users.", "En rekommendation om bortkoppling med ett alternativ för kritiska användare."],
          [["Ask: what is the minimum remote access you truly need?", "Fråga: vilken är den minsta fjärråtkomst ni verkligen behöver?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1080,
        title: L(["The business says no", "Verksamheten säger nej"]),
        twist: L(["The CEO refuses to disconnect: a key customer deadline falls this week and the partners must have access.", "Vd vägrar koppla bort: en viktig tidsgräns hos en kund infaller den här veckan och partnerna måste ha åtkomst."]),
        twistKind: "authority",
        assumptionChallenged: L(["The CISO's recommendation will be followed.", "Säkerhetschefens rekommendation kommer att följas."]),
        narrative: L([
          "{{time.T+1080|clock}}. The security team's recommendation reaches executive management: take the appliance offline until a real patch exists.\n\nIt is a clean recommendation, and an expensive one. Without the appliance, field staff and partners cannot connect at all, in the week of the year when they are needed most.",
          "Klockan {{time.T+1080|clock}}. Säkerhetsteamets rekommendation når företagsledningen: koppla bort enheten tills det finns en riktig rättning.\n\nDet är en tydlig rekommendation, och en dyr. Utan enheten kan fältpersonal och partner inte ansluta alls, den vecka på året då de behövs mest."
        ]),
        injects: [
          inj("i5-1", 1080, "executiveMessage", "person.ceo", "high", "confirmed", [
            "“We have the largest delivery of the year on Friday. If partners can't connect, we miss it. Find another way.”",
            "”Vi har årets största leverans på fredag. Om partnerna inte kan ansluta missar vi den. Hitta ett annat sätt.”"
          ], { tests: ["lo3"] }),
          inj("i5-2", 1110, "advisory", "csirt", "high", "confirmed", [
            "{{reg.csirt|cap}} recommends disconnecting affected devices until patched and asks operators of essential services to confirm their actions.",
            "{{reg.csirt|cap}} rekommenderar att drabbade enheter kopplas bort tills de är rättade och ber verksamheter som tillhandahåller samhällsviktiga tjänster att bekräfta sina åtgärder."
          ], { pressure: "regulator", substitute: { source: "insurer", content: ["{{supplier.insurer}} notes that the policy excludes losses from known, unmitigated vulnerabilities.", "{{supplier.insurer}} påpekar att försäkringen undantar förluster från kända sårbarheter som inte har åtgärdats."] }, tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can partners be given a narrow, separate path for the delivery?", "Kan partnerna få en smal, separat väg för leveransen?", ["networkLead", "itOps"]),
            q("What would that path require, and how fast?", "Vad skulle den vägen kräva, och hur snabbt?", ["networkLead"]),
            q("Is the device being exploited right now?", "Utnyttjas enheten just nu?", ["socLead"], "d4")
          ],
          executive: [
            q("Who has the authority to accept this risk?", "Vem har mandat att acceptera den här risken?", ["ceo", "ciso"]),
            q("Is the risk acceptance written and signed?", "Är riskacceptansen skriftlig och undertecknad?", ["legal", "ceo"]),
            q("Does the CISO's earlier breach response still hold?", "Håller säkerhetschefens tidigare hantering av intrånget fortfarande?", ["ciso"], "d3")
          ]
        },
        challenges: [ch("The delivery is worth more than the IT budget.", "Leveransen är värd mer än IT-budgeten.")],
        decision: dec("d5", "ceo", ["What is the final call?", "Vilket är det slutliga beslutet?"], [
          ["Disconnect the appliance; give partners a narrow, temporary path for the delivery only.", "Koppla bort enheten; ge partnerna en smal, tillfällig väg enbart för leveransen."],
          ["Keep the appliance online until Friday with a signed risk acceptance.", "Behåll enheten uppkopplad till fredag med en undertecknad riskacceptans."],
          ["Keep it online and move the partners through first, so the delivery is done before you disconnect.", "Behåll den uppkopplad och låt partnerna gå igenom först, så att leveransen är klar innan ni kopplar ner."]
        ], {
          knowns: [["The device is being re-exploited.", "Enheten utnyttjas igen."], ["The delivery is critical.", "Leveransen är kritisk."]],
          uncertainties: [["Whether a narrow path can be ready in time.", "Om en smal väg kan vara klar i tid."]],
          tradeoffs: {
            operational: ["A temporary path takes effort and may fail.", "En tillfällig väg kräver arbete och kan misslyckas."],
            security: ["Keeping a compromised edge online invites deeper intrusion.", "Att behålla en komprometterad perimeterenhet uppkopplad bjuder in till djupare intrång."],
            legal: ["Ignoring the CSIRT's advice may have regulatory consequences.", "Att bortse från CSIRT:s råd kan få följder för tillsynen."],
            reputational: ["A missed delivery is recoverable; a deeper breach may not be.", "En missad leverans går att reparera; ett djupare intrång kanske inte."]
          },
          evaluation: [["Makes an explicit, owned risk decision", "Fattar ett uttalat och ägt riskbeslut"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["Ready by Thursday night", "Klar torsdag kväll"], ["The network lead says the narrow path can be ready late Thursday at best, with no time to test it before Friday. The whole delivery now rests on something nobody has tried. Are you comfortable with that?", "Nätverksansvarig säger att den smala vägen i bästa fall kan vara klar sent på torsdag, utan tid att testa den före fredag. Hela leveransen vilar nu på något som ingen har provat. Känner ni er trygga med det?"]),
              pb(["Not so narrow", "Inte så smal"], ["Within hours, three departments ask to be added to the delivery path because their work is “part of the delivery too”. Each addition makes the path wider and harder to watch. Where do you draw the line, and who enforces it?", "Inom några timmar ber tre avdelningar att få komma med på leveransvägen eftersom deras arbete ”också är en del av leveransen”. Varje tillägg gör vägen bredare och svårare att bevaka. Var drar ni gränsen, och vem upprätthåller den?"]),
              pb(["The partner says no", "Partnern säger nej"], ["The largest partner's IT team refuses to set up a new, unfamiliar connection two days before the delivery. “Use the system you've always used.” Do you push them, or give in to the CEO's original demand?", "Den största partnerns IT-team vägrar att sätta upp en ny, obekant anslutning två dagar före leveransen. ”Använd det system ni alltid har använt.” Pressar ni dem, eller ger ni efter för vd:ns ursprungliga krav?"])
            ],
            B: [
              pb(["Who signs?", "Vem skriver under?"], ["The CEO wants the CISO to co-sign the risk acceptance. The CISO refuses: they recommended disconnection. Without both names, the paper says the security function was overruled. Do you sign alone, or change the decision?", "Vd vill att säkerhetschefen skriver under riskacceptansen tillsammans med vd. Säkerhetschefen vägrar: hen rekommenderade bortkoppling. Utan båda namnen visar papperet att säkerhetsfunktionen kördes över. Skriver ni under ensam, eller ändrar ni beslutet?"]),
              pb(["Proof you knew", "Bevis på att ni visste"], ["Legal notes that a signed risk acceptance is also written proof that you knew the device was vulnerable and kept it online. Given what the insurer and authorities have already said, does the signature protect you or expose you?", "Juristen påpekar att en undertecknad riskacceptans också är ett skriftligt bevis på att ni visste att enheten var sårbar och ändå höll den uppkopplad. Med tanke på vad försäkringsbolaget och myndigheterna redan har sagt, skyddar underskriften er eller blottar den er?"]),
              pb(["Three more nights", "Tre nätter till"], ["The SOC sees new requests against the device again tonight. Friday is three nights away, and the acceptance names no point at which you would pull the plug early. What would make you disconnect before Friday?", "SOC ser nya anrop mot enheten igen i kväll. Det är tre nätter kvar till fredag, och riskacceptansen anger ingen punkt där ni skulle koppla ner i förtid. Vad skulle få er att koppla bort före fredag?"])
            ],
            C: [
              pb(["“First” keeps stretching", "”Först” blir längre och längre"], ["Partners say their part of the delivery will run into the weekend after all. The point at which you disconnect keeps moving. Is this a plan with an end, or a way of never deciding?", "Partnerna säger att deras del av leveransen ändå kommer att dra ut på helgen. Tidpunkten då ni kopplar ner flyttas hela tiden. Är det här en plan med ett slut, eller ett sätt att aldrig behöva besluta?"]),
              pb(["Through the attacker's box", "Genom angriparens enhet"], ["Every partner who signs in now passes their credentials through a device you know is being exploited. If anything is captured, it is their accounts too. Do you tell the partners that before they connect?", "Varje partner som loggar in nu skickar sina inloggningsuppgifter genom en enhet som ni vet utnyttjas. Om något fångas upp gäller det även deras konton. Berättar ni det för partnerna innan de ansluter?"]),
              pb(["Nothing written down", "Inget nedskrivet"], ["Legal points out that this option keeps the device online with no signed risk acceptance at all. If something goes wrong, nobody formally owned the decision. Who owns it, by name?", "Juristen påpekar att det här alternativet håller enheten uppkopplad helt utan undertecknad riskacceptans. Om något går fel har ingen formellt ägt beslutet. Vem äger det, med namn?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The narrow path", "Den smala vägen"], [
              io(["The path holds", "Vägen håller"], ["The narrow path comes up and the first partners connect cleanly. The SOC sees no attack traffic on it at all.", "Den smala vägen kommer upp och de första partnerna ansluter utan problem. SOC ser ingen angreppstrafik på den alls."], ["The narrow partner path works and shows no attack traffic.", "Den smala partnervägen fungerar och visar ingen angreppstrafik."]),
              io(["The customer reacts", "Kunden reagerar"], ["The customer behind Friday's delivery hears it may slip. They ask for a meeting with the CEO and say they are looking at other suppliers.", "Kunden bakom fredagens leverans får höra att den kan försenas. De begär ett möte med vd och säger att de ser sig om efter andra leverantörer."], ["The key customer is looking at other suppliers after the delay warning.", "Den viktiga kunden ser sig om efter andra leverantörer efter förseningsbeskedet."], { reopen: true, meters: { trust: -1 } }),
              io(["Quiet before the cut", "Tyst före bortkopplingen"], ["The responders note that the appliance was quiet for the last hour before you pulled it. Nobody can tell whether the attacker had finished or only paused.", "Incidenthanterarna noterar att enheten var tyst den sista timmen innan ni kopplade bort den. Ingen kan avgöra om angriparen var klar eller bara tog paus."], ["The appliance was quiet before disconnection; nobody knows why.", "Enheten var tyst före bortkopplingen; ingen vet varför."])
            ]),
            ir("i2", { notChosen: "A" }, ["Online for the delivery", "Uppkopplad för leveransen"], [
              io(["On schedule", "Enligt plan"], ["Partners work through the night and the delivery is on schedule. The CEO tells the room the call has been vindicated.", "Partnerna arbetar hela natten och leveransen går enligt plan. Vd säger till rummet att beslutet har visat sig vara rätt."], ["The delivery is on schedule; the CEO sees the call as vindicated.", "Leveransen går enligt plan; vd ser beslutet som rätt."]),
              io(["In writing", "Skriftligt"], ["{{reg.csirt|cap}} asks you to confirm in writing what you have done with the device. You will have to state that it stays online despite the known bypass.", "{{reg.csirt|cap}} ber er bekräfta skriftligt vad ni har gjort med enheten. Ni måste ange att den förblir uppkopplad trots den kända förbigången."], ["You must confirm in writing to the CSIRT that the device stays online.", "Ni måste skriftligt bekräfta för CSIRT att enheten förblir uppkopplad."], { reopen: true, meters: { regulator: 1 } }),
              io(["A partner's odd sign-in", "En märklig inloggning hos en partner"], ["One partner reports a failed sign-in to one of its own accounts from an unfamiliar address. It may be unrelated. They ask whether it has anything to do with you.", "En partner rapporterar ett misslyckat inloggningsförsök på ett av sina egna konton från en okänd adress. Det kan vara orelaterat. De frågar om det har med er att göra."], ["A partner saw an unexplained sign-in attempt on one of its accounts.", "En partner har sett ett oförklarat inloggningsförsök på ett av sina konton."])
            ])
          ]
        }),
        facilitator: fac(
          ["Security proposes, the business disposes. Make the ownership visible.", "Säkerhet föreslår, verksamheten beslutar. Gör ägarskapet synligt."],
          ["Disconnection with a narrow business workaround, or a signed risk acceptance.", "Bortkoppling med en smal lösning för verksamheten, eller en undertecknad riskacceptans."],
          [["Ask: who signs, and what exactly are they signing?", "Fråga: vem skriver under, och vad exakt skriver de under på?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 1800,
        title: L(["The keys inside the box", "Nycklarna i lådan"]),
        twist: L(["The directory credentials stored on the appliance were used inside the network, from a server, weeks ago.", "Inloggningsuppgifterna till katalogtjänsten som var lagrade i enheten användes inne i nätverket, från en server, för flera veckor sedan."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "Credentials stored on the appliance were used inside the network weeks ago. Does your recommendation on the appliance still look strong enough?", sv: "Inloggningsuppgifter som låg i enheten användes inne i nätet för flera veckor sedan. Ser er rekommendation om enheten fortfarande tillräckligt stark ut?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because the appliance was disconnected, the partners worked through a narrow temporary path, and the delivery slipped by two days.", sv: "Eftersom enheten kopplades ner arbetade partnerna via en smal tillfällig väg, och leveransen försenades två dagar." } }
        ],
        assumptionChallenged: L(["The compromise was limited to the appliance.", "Intrånget var begränsat till enheten."]),
        reveals: ["hf-ldap"],
        narrative: L([
          "The next day. The appliance question has been settled, one way or another. The responders now turn to the rest of the network and review the directory logs.\n\nThe appliance did not only connect users; it also checked their passwords against your directory, using an account of its own. Whoever controlled the box may have had that account too.",
          "Nästa dag. Frågan om enheten är avgjord, på ett eller annat sätt. De som hanterar incidenten vänder sig nu mot resten av nätverket och går igenom katalogtjänstens loggar.\n\nEnheten kopplade inte bara upp användare; den kontrollerade också deras lösenord mot er katalogtjänst, med ett eget konto. Den som kontrollerade enheten kan också ha haft det kontot."
        ]),
        injects: [
          inj("i6-1", 1800, "authLog", "irRetainer", "critical", "confirmed", [
            "The appliance's directory account {{asset.serviceAccount}} signed in to {{asset.domainController}} from an internal server three weeks ago and listed all users and groups. That account should only ever be used by the appliance.",
            "Enhetens konto för katalogtjänsten {{asset.serviceAccount}} loggade in på {{asset.domainController}} från en intern server för tre veckor sedan och listade alla användare och grupper. Kontot ska bara användas av enheten."
          ], { headline: ["Appliance credentials used internally", "Enhetens inloggningsuppgifter använda internt"], reveals: ["hf-ldap"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What else did the attacker do from that internal server?", "Vad mer gjorde angriparen från den interna servern?", ["socLead"]),
            q("Which credentials must now be reset?", "Vilka inloggningsuppgifter måste nu bytas?", ["itOps", "socLead"]),
            q("Did your credential resets cover this account?", "Omfattade era byten av inloggningsuppgifter det här kontot?", ["itOps"], "d3")
          ],
          executive: [
            q("Is this now a full network compromise?", "Är det här nu ett intrång i hela nätverket?", ["ciso", "cio"]),
            q("What do you report, and to whom?", "Vad rapporterar ni, och till vem?", ["legal"]),
            q("Does this change how you see the CEO's call on disconnection?", "Ändrar det här hur ni ser på vd:ns beslut om bortkoppling?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("The attacker had three weeks inside before anyone looked.", "Angriparen hade tre veckor på insidan innan någon tittade.")],
        decision: dec("d6", "ciso", ["How do you widen the response?", "Hur utvidgar ni hanteringen?"], [
          ["Treat the directory as compromised: hunt across the network, reset privileged credentials and plan a staged identity recovery.", "Behandla katalogtjänsten som komprometterad: leta i hela nätverket, byt privilegierade inloggningsuppgifter och planera en stegvis återställning av identiteterna."],
          ["Reset the appliance account and the internal server.", "Byt enhetens konto och återställ den interna servern."],
          ["Monitor the directory for more activity.", "Bevaka katalogtjänsten efter mer aktivitet."]
        ], {
          knowns: [["Appliance credentials were used inside.", "Enhetens inloggningsuppgifter användes på insidan."]],
          uncertainties: [["Whether privileged accounts were taken.", "Om privilegierade konton har tagits."]],
          tradeoffs: {
            operational: ["Identity recovery disrupts everyone.", "En återställning av identiteterna stör alla."],
            security: ["A directory listing is reconnaissance for something bigger.", "En listning av katalogtjänsten är spaning inför något större."],
            legal: ["The scope may now trigger wider reporting.", "Omfattningen kan nu utlösa bredare rapportering."],
            reputational: ["Under-scoping is the classic mistake.", "Att avgränsa för snävt är det klassiska misstaget."]
          },
          evaluation: [["Scopes the response to the identity layer", "Avgränsar hanteringen till identitetslagret"]],
          pushback: {
            A: [
              pb(["Everything stops at night", "Allt stannar i natt"], ["Resetting privileged credentials breaks the service accounts behind backups and scheduled jobs. IT operations warns that tonight's backups and batch runs will fail. Do you reset now and accept the gaps, or stagger it and leave the attacker more time?", "Att byta privilegierade inloggningsuppgifter slår ut tjänstekontona bakom säkerhetskopiering och schemalagda jobb. Driften varnar för att nattens säkerhetskopior och körningar kommer att misslyckas. Byter ni nu och accepterar luckorna, eller sprider ni ut det och ger angriparen mer tid?"]),
              pb(["“After the delivery”", "”Efter leveransen”"], ["The CEO asks you to hold the identity recovery until after this week's delivery: another disruption now could sink it. The responders say waiting is exactly what an attacker hopes for. Whose deadline wins?", "Vd ber er vänta med återställningen av identiteterna till efter veckans leverans: ytterligare en störning nu kan sänka den. Incidenthanterarna säger att det är precis väntan som en angripare hoppas på. Vems tidsgräns vinner?"]),
              pb(["When is it over?", "När är det klart?"], ["The responders estimate weeks to hunt across the whole network, and they cannot promise to find everything. Staff and management want to know when this ends. What will you accept as “clean enough”?", "Incidenthanterarna uppskattar att det tar veckor att leta i hela nätverket, och de kan inte lova att hitta allt. Personal och ledning vill veta när det här tar slut. Vad accepterar ni som ”tillräckligt rent”?"])
            ],
            B: [
              pb(["They have the full list", "De har hela listan"], ["The account listed every user and group in the directory. The attacker now knows exactly which accounts hold the most power. Resetting one account changes none of that. Is a narrow reset enough against someone holding your map?", "Kontot listade varje användare och grupp i katalogtjänsten. Angriparen vet nu exakt vilka konton som har mest makt. Att byta ett konto ändrar inget av det. Räcker ett snävt byte mot någon som har er karta?"]),
              pb(["A busy server", "En välbesökt server"], ["The internal server turns out to be one that several administrators sign in to every week. Their sessions passed through it during those three weeks. Do you still believe only two things need resetting?", "Den interna servern visar sig vara en som flera administratörer loggar in på varje vecka. Deras sessioner passerade den under de tre veckorna. Tror ni fortfarande att bara två saker behöver återställas?"]),
              pb(["The responders won't sign", "Incidenthanterarna skriver inte under"], ["Your response partner says they cannot sign off on a scope limited to one account and one server. Their report will say so. Do you widen the scope, or accept a report that records your choice as too narrow?", "Er incidentpartner säger att de inte kan godkänna en avgränsning till ett konto och en server. Det kommer att stå i deras rapport. Vidgar ni omfattningen, eller accepterar ni en rapport som beskriver ert val som för snävt?"])
            ],
            C: [
              pb(["Three weeks quiet", "Tre veckor av tystnad"], ["The account was used three weeks ago, and nobody noticed anything since. Monitoring for “more activity” assumes the next step will be loud. What exactly are you waiting to see?", "Kontot användes för tre veckor sedan, och ingen har märkt något sedan dess. Att bevaka efter ”mer aktivitet” förutsätter att nästa steg blir högljutt. Vad är det exakt ni väntar på att få se?"]),
              pb(["The password still works", "Lösenordet fungerar fortfarande"], ["Under this option, the appliance's directory account keeps the same password it had when someone used it from inside your network. Anyone holding it can still sign in. Why leave a key you know is out there in the lock?", "Med det här alternativet behåller enhetens konto för katalogtjänsten samma lösenord som när någon använde det inifrån ert nätverk. Den som har det kan fortfarande logga in. Varför låta en nyckel som ni vet är i omlopp sitta kvar i låset?"]),
              pb(["Not a reportable measure", "Ingen åtgärd att rapportera"], ["Legal says the directory finding may widen your reporting duties, and the report must describe what you did. “We are monitoring” is all it would say. Is that what you want an authority to read?", "Juristen säger att fyndet i katalogtjänsten kan vidga er rapporteringsskyldighet, och rapporten måste beskriva vad ni gjorde. ”Vi bevakar” är allt den skulle säga. Är det vad ni vill att en myndighet ska läsa?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Identity recovery begins", "Återställningen börjar"], [
              io(["No privileged misuse", "Inget missbruk av privilegier"], ["The first sweep of privileged accounts shows no sign that they were used by anyone but their owners. The CIO asks whether the full recovery is still needed.", "Den första genomgången av privilegierade konton visar inga tecken på att någon annan än ägarna har använt dem. IT-chefen frågar om den fullständiga återställningen fortfarande behövs."], ["The first sweep found no misuse of privileged accounts.", "Den första genomgången hittade inget missbruk av privilegierade konton."]),
              io(["The desk is swamped", "Servicedesken drunknar"], ["Forced password resets hit far more people than planned. Hundreds cannot sign in the next morning, and the service desk queue runs into the hundreds.", "De tvingade lösenordsbytena drabbar betydligt fler än planerat. Hundratals kan inte logga in nästa morgon, och servicedeskens kö når flera hundra ärenden."], ["Mass password resets have swamped the service desk.", "Massbytena av lösenord har dränkt servicedesken."], { reopen: true }),
              io(["Logs already gone", "Loggarna redan borta"], ["The team that owns the internal server says they saw nothing odd, and the server's logs from three weeks ago have already been rotated away.", "Teamet som äger den interna servern säger att de inte såg något konstigt, och serverns loggar från för tre veckor sedan har redan skrivits över."], ["The internal server's logs from that time have been rotated away.", "Den interna serverns loggar från den tiden har skrivits över."])
            ]),
            ir("i2", { notChosen: "A" }, ["A narrower view", "En snävare bild"], [
              io(["Nothing more", "Inget mer"], ["No further use of the appliance's directory account is seen. The CIO says the focused approach was the right one.", "Ingen ytterligare användning av enhetens konto i katalogtjänsten syns. IT-chefen säger att den avgränsade hållningen var rätt."], ["No further use of the appliance account has been seen.", "Ingen ytterligare användning av enhetens konto har setts."]),
              io(["On the record", "Till protokollet"], ["Your response partner formally records that it advised treating the directory as compromised and that the advice was not followed.", "Er incidentpartner noterar formellt att den rådde er att behandla katalogtjänsten som komprometterad och att rådet inte följdes."], ["The response partner has recorded that its advice was not followed.", "Incidentpartnern har noterat att dess råd inte följdes."], { reopen: true }),
              io(["A late-night admin", "En administratör sent på natten"], ["A domain administrator account signs in at night from a workstation it has never used. The admin says it was probably them working late, but cannot remember.", "Ett domänadministratörskonto loggar in på natten från en arbetsstation det aldrig har använt. Administratören säger att det nog var hen som jobbade sent, men minns inte."], ["An unexplained night-time admin sign-in remains unresolved.", "En oförklarad nattlig inloggning av en administratör är fortfarande olöst."])
            ])
          ]
        }),
        facilitator: fac(
          ["Edge devices are often a door to identity. Make the link explicit.", "Perimeterenheter är ofta en dörr till identiteterna. Gör kopplingen uttalad."],
          ["Directory treated as compromised with a planned identity recovery.", "Katalogtjänsten behandlad som komprometterad med en planerad återställning av identiteterna."],
          [["Ask: what other appliances store directory credentials?", "Fråga: vilka andra enheter lagrar inloggningsuppgifter till katalogtjänsten?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 1440 * 5,
        title: L(["Patched, but clean?", "Rättad, men ren?"]),
        twist: L(["The patch is out — but the vendor says it doesn't remove implants. Only a factory reset and rebuild does.", "Rättningen har kommit – men leverantören säger att den inte tar bort implantat. Bara en fabriksåterställning och ombyggnad gör det."]),
        twistKind: "impact",
        assumptionChallenged: L(["Patching ends the problem.", "En rättning avslutar problemet."]),
        narrative: L([
          "Five days after the advisory, the vendor finally releases a patch. Operations wants remote access back to normal as soon as possible.\n\nThe vendor's notes come with an important caveat about devices that were compromised before the patch, and yours was one of them.",
          "Fem dagar efter säkerhetsmeddelandet släpper leverantören till slut en rättning. Driften vill ha fjärråtkomsten tillbaka till det normala så snart som möjligt.\n\nLeverantörens anvisningar har en viktig reservation om enheter som komprometterades före rättningen, och er var en av dem."
        ]),
        injects: [
          inj("i7-1", 1440 * 5, "advisory", "vendor", "high", "confirmed", [
            "“The patch closes {{asset.vulnId}}. It does not remove files planted before patching. Compromised devices should be factory reset, rebuilt and their stored credentials rotated.”",
            "”Rättningen stänger {{asset.vulnId}}. Den tar inte bort filer som placerats före rättningen. Komprometterade enheter bör fabriksåterställas, byggas om och få sina lagrade inloggningsuppgifter utbytta.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you rebuild the appliance with a clean configuration?", "Hur bygger ni om enheten med en ren konfiguration?", ["networkLead"]),
            q("Which certificates and secrets on it must be replaced?", "Vilka certifikat och hemligheter på den måste bytas?", ["networkLead", "itOps"]),
            q("Is the identity recovery far enough along to reconnect?", "Har återställningen av identiteterna kommit tillräckligt långt för att ansluta igen?", ["itOps"], "d6")
          ],
          executive: [
            q("Do you bring it back now or replace the product?", "Tar ni tillbaka den nu eller byter ni produkt?", ["cio", "supplierManager"]),
            q("What do you tell staff about when remote access returns?", "Vad säger ni till personalen om när fjärråtkomsten kommer tillbaka?", ["comms"]),
            q("Did the delivery decision pay off?", "Lönade sig beslutet om leveransen?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("A rebuild means another day without remote access.", "En ombyggnad innebär ytterligare en dag utan fjärråtkomst.")],
        decision: dec("d7", "cio", ["How do you bring remote access back?", "Hur tar ni tillbaka fjärråtkomsten?"], [
          ["Factory reset, rebuild, patch, rotate every stored secret and verify before reconnecting.", "Fabriksåterställ, bygg om, rätta, byt varje lagrad hemlighet och kontrollera innan enheten ansluts igen."],
          ["Patch and reconnect, then rebuild later.", "Rätta och anslut igen, och bygg om senare."],
          ["Patch only; the web shell was removed.", "Rätta bara; webbskalet har tagits bort."]
        ], {
          knowns: [["The patch doesn't remove implants.", "Rättningen tar inte bort implantat."]],
          uncertainties: [["Whether other implants exist.", "Om det finns andra implantat."]],
          tradeoffs: {
            operational: ["A rebuild costs another day.", "En ombyggnad kostar ytterligare en dag."],
            security: ["Reconnecting a possibly implanted device reopens the door.", "Att ansluta en enhet som kan ha implantat öppnar dörren igen."],
            legal: ["Authorities expect devices to be rebuilt.", "Myndigheterna förväntar sig att enheterna byggs om."],
            reputational: ["A second breach through the same box would be damning.", "Ett andra intrång genom samma enhet vore förödande."]
          },
          evaluation: [["Rebuilds rather than only patching", "Bygger om i stället för att bara rätta"]],
          pushback: {
            A: [
              pb(["Which configuration?", "Vilken konfiguration?"], ["The only configuration backup was taken from the compromised device. Restoring it is fast but may bring old settings back; rebuilding by hand takes days. Which do you choose?", "Den enda säkerhetskopian av konfigurationen togs från den komprometterade enheten. Att återställa den går snabbt men kan ta tillbaka gamla inställningar; att bygga upp den för hand tar dagar. Vad väljer ni?"]),
              pb(["Staff have had enough", "Personalen har fått nog"], ["Remote staff have managed without the appliance for days. The service owner says another day is the point where customers notice and people stop trusting IT. Can you hold the rebuild against that pressure?", "Distansarbetande personal har klarat sig utan enheten i flera dagar. Tjänsteägaren säger att ytterligare en dag är gränsen där kunderna märker det och folk slutar lita på IT. Kan ni hålla fast vid ombyggnaden mot det trycket?"]),
              pb(["Every partner must reconnect", "Varje partner måste ansluta på nytt"], ["Rotating every stored secret includes the device's certificates. Every partner and remote user will need updated settings before they can connect again. Who handles hundreds of reconfiguration requests on the first morning?", "Att byta varje lagrad hemlighet omfattar enhetens certifikat. Varje partner och distansanvändare behöver nya inställningar innan de kan ansluta igen. Vem hanterar hundratals ärenden om ny konfiguration den första morgonen?"])
            ],
            B: [
              pb(["“Later” never comes", "”Senare” kommer aldrig"], ["Once remote access is back, there will be no good day to take it down again for a rebuild. Every week someone will have a reason to wait. When exactly is “later”, and who will hold you to it?", "När fjärråtkomsten väl är tillbaka kommer det inte att finnas någon bra dag att ta ner den igen för en ombyggnad. Varje vecka kommer någon att ha ett skäl att vänta. När exakt är ”senare”, och vem håller er till det?"]),
              pb(["Unable to verify", "Kan inte verifieras"], ["After patching, the integrity checker returns “unable to verify” on two system files. It may be harmless, or it may not. Do you still reconnect a device you cannot vouch for?", "Efter rättningen svarar integritetskontrollen ”kan inte verifieras” för två systemfiler. Det kan vara ofarligt, eller inte. Ansluter ni ändå en enhet som ni inte kan gå i god för?"]),
              pb(["Against the vendor's word", "Mot leverantörens ord"], ["The vendor and the authorities both say compromised devices should be rebuilt before use. Legal asks how you would explain reconnecting first if the device is used against you again. What would you say?", "Både leverantören och myndigheterna säger att komprometterade enheter ska byggas om innan de används. Juristen frågar hur ni skulle förklara att ni anslöt först om enheten används mot er igen. Vad skulle ni säga?"])
            ],
            C: [
              pb(["The one you found", "Det ni hittade"], ["The web shell you removed was the one the integrity check found. The vendor writes about implants, plural, and your logs only reach back seven days. What makes you sure there was only one?", "Webbskalet ni tog bort var det som integritetskontrollen hittade. Leverantören skriver om implantat i plural, och era loggar sträcker sig bara sju dagar bakåt. Vad gör er säkra på att det bara fanns ett?"]),
              pb(["The secrets stay the same", "Hemligheterna är desamma"], ["Patching changes nothing stored on the device: its certificates and saved credentials are the same ones it held while compromised. Anyone who copied them can still use them. Do you reconnect with secrets you cannot trust?", "Rättningen ändrar inget som är lagrat på enheten: dess certifikat och sparade inloggningsuppgifter är samma som när den var komprometterad. Den som kopierade dem kan fortfarande använda dem. Ansluter ni med hemligheter ni inte kan lita på?"]),
              pb(["“Not on my name”", "”Inte i mitt namn”"], ["The network lead refuses to state in writing that the device is clean, because the vendor says patching is not enough. Without that statement, nobody has vouched for it. Do you reconnect anyway?", "Nätverksansvarig vägrar intyga skriftligt att enheten är ren, eftersom leverantören säger att en rättning inte räcker. Utan det intyget har ingen gått i god för den. Ansluter ni ändå?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The rebuild", "Ombyggnaden"], [
              io(["Clean from scratch", "Ren från grunden"], ["The rebuild completes, verification passes and the first users reconnect without trouble. The network lead says this is the cleanest the device has ever been.", "Ombyggnaden blir klar, kontrollen går igenom och de första användarna ansluter utan problem. Nätverksansvarig säger att enheten aldrig har varit renare."], ["The rebuilt appliance passed verification and users are reconnecting.", "Den ombyggda enheten klarade kontrollen och användarna ansluter igen."]),
              io(["Waiting on the vendor", "I väntan på leverantören"], ["The vendor's clean installation image is held back while it is re-checked, and its support queue is days long. Remote access stays down until it arrives.", "Leverantörens rena installationsavbild hålls inne medan den kontrolleras på nytt, och supportkön är flera dagar lång. Fjärråtkomsten förblir nere tills den kommer."], ["The rebuild is delayed by days, waiting for the vendor's clean image.", "Ombyggnaden försenas flera dagar i väntan på leverantörens rena avbild."], { reopen: true }),
              io(["A step added later", "Ett steg som lades till"], ["Overnight, the vendor quietly updates its rebuild guidance with an extra step you did not take. It calls the change precautionary and will not say why.", "Under natten uppdaterar leverantören i tysthet sina anvisningar för ombyggnad med ett extra steg som ni inte tog. Den kallar ändringen förebyggande och vill inte säga varför."], ["The vendor added a rebuild step after yours; it calls it precautionary.", "Leverantören lade till ett steg efter er ombyggnad; den kallar det förebyggande."])
            ]),
            ir("i2", { notChosen: "A" }, ["Back without a rebuild", "Tillbaka utan ombyggnad"], [
              io(["Relief", "Lättnad"], ["Remote access is back the same morning. Staff are relieved, and the service owner thanks IT in front of the management team.", "Fjärråtkomsten är tillbaka samma morgon. Personalen är lättad, och tjänsteägaren tackar IT inför ledningsgruppen."], ["Remote access is back and the business is relieved.", "Fjärråtkomsten är tillbaka och verksamheten är lättad."]),
              io(["A file from before", "En fil från tidigare"], ["Within a day, the integrity checker flags a file it did not flag before. The vendor says it may have been planted before patching.", "Inom ett dygn flaggar integritetskontrollen en fil som den inte flaggade tidigare. Leverantören säger att den kan ha placerats före rättningen."], ["The checker flagged a file from before patching after reconnection.", "Kontrollen flaggade en fil från före rättningen efter återanslutningen."], { reopen: true }),
              io(["Not rebuilt yet", "Inte ombyggd än"], ["{{reg.csirt|cap}} asks operators to confirm that compromised devices have been rebuilt. Your answer has to be: not yet.", "{{reg.csirt|cap}} ber verksamheter bekräfta att komprometterade enheter har byggts om. Ert svar måste bli: inte ännu."], ["You told the CSIRT the device had not been rebuilt yet.", "Ni svarade CSIRT att enheten ännu inte var ombyggd."], { meters: { regulator: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Patched does not mean clean. That's the lesson.", "Rättad betyder inte ren. Det är lärdomen."],
          ["A full rebuild with rotated secrets before reconnecting.", "En fullständig ombyggnad med utbytta hemligheter innan enheten ansluts igen."],
          [["Ask: how would you prove the rebuilt device is clean?", "Fråga: hur skulle ni bevisa att den ombyggda enheten är ren?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 1440 * 14,
        title: L(["Rethinking the edge", "Att tänka om kring perimetern"]),
        twist: L(["It's the third critical flaw in this product line in a year.", "Det är den tredje kritiska bristen i den här produktlinjen på ett år."]),
        twistKind: "impact",
        reconsider: { decision: "d5", pressure: { en: "It is the third critical flaw in this product line in a year. Was the final call you made with the CEO the right one?", sv: "Det är den tredje kritiska sårbarheten i den här produktlinjen på ett år. Var det slutliga beslut ni fattade med vd det rätta?" } },
        assumptionChallenged: L(["This was a one-off.", "Det här var en engångshändelse."]),
        narrative: L([
          "Two weeks later. The post-incident review meets, with network, security, operations and procurement around the table.\n\nThe appliance is patched and rebuilt. The question now is whether this was bad luck, or a predictable result of how the organisation's edge was designed and bought.",
          "Två veckor senare. Genomgången efter incidenten samlas, med nätverk, säkerhet, drift och inköp runt bordet.\n\nEnheten är rättad och ombyggd. Frågan nu är om det här var otur, eller ett förutsägbart resultat av hur organisationens gränsskydd utformades och köptes in."
        ]),
        injects: [
          inj("i8-1", 1440 * 14, "impactReport", "irRetainer", "medium", "confirmed", [
            "The responders' report: three critical flaws in this product in twelve months, logs kept on the device for only seven days, and stored directory credentials with broad rights.",
            "Incidenthanterarnas rapport: tre kritiska brister i den här produkten på tolv månader, loggar som bara sparas på enheten i sju dagar och lagrade inloggningsuppgifter till katalogtjänsten med breda rättigheter."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you make internet-facing devices less dangerous when they fail?", "Hur gör ni enheter som är exponerade mot internet mindre farliga när de fallerar?", ["networkLead", "ciso"]),
            q("Where should their logs go?", "Vart bör deras loggar skickas?", ["socLead"]),
            q("Did the rebuild procedure work as planned?", "Fungerade ombyggnadsrutinen som planerat?", ["networkLead"], "d7")
          ],
          executive: [
            q("Do you replace the product?", "Byter ni produkt?", ["cio", "supplierManager"]),
            q("Who decides how much risk the edge may carry?", "Vem bestämmer hur mycket risk perimetern får bära?", ["ceo", "ciso"]),
            q("Which decision from the first day would you most like to have made differently?", "Vilket beslut från den första dagen skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Replacing the product is a year-long project.", "Att byta produkt är ett projekt som tar ett år.")],
        decision: dec("d8", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["Limit what edge devices can reach and store, send their logs off-box, and plan a replacement.", "Begränsa vad perimeterenheter kan nå och lagra, skicka deras loggar till en annan plats och planera ett byte."],
          ["Replace the product as soon as possible.", "Byt produkt så snart som möjligt."],
          ["Keep the product and patch faster.", "Behåll produkten och rätta snabbare."]
        ], {
          knowns: [["This product has a poor track record.", "Den här produkten har en dålig historik."]],
          uncertainties: [["Whether the replacement is better.", "Om ersättaren är bättre."]],
          tradeoffs: {
            operational: ["Limiting edge rights changes how remote access works.", "Att begränsa perimeterns rättigheter ändrar hur fjärråtkomsten fungerar."],
            security: ["Any edge device will fail eventually; limit the blast radius.", "Varje perimeterenhet kommer att fallera förr eller senare; begränsa spridningsområdet."],
            legal: ["Supply-chain rules expect informed vendor choices.", "Regler för leverantörskedjan förväntar sig välgrundade leverantörsval."],
            reputational: ["Showing a structural fix reassures customers.", "Att visa en strukturell åtgärd lugnar kunderna."]
          },
          evaluation: [["Designs for failure rather than only patching faster", "Utformar för fel i stället för att bara rätta snabbare"]],
          pushback: {
            A: [
              pb(["Things stop working", "Saker slutar fungera"], ["Limiting what the appliance can reach breaks several internal apps that remote staff opened directly through it. Owners of those apps want an exception each. How many exceptions before the limit means nothing?", "När ni begränsar vad enheten kan nå slutar flera interna appar fungera som distansarbetande personal öppnade direkt genom den. Ägarna till apparna vill ha ett undantag var. Hur många undantag innan begränsningen inte betyder något?"]),
              pb(["A year on the same box", "Ett år med samma enhet"], ["A replacement plan means at least a year on the current product. At its recent pace, another critical flaw is likely before you switch. Is “plan a replacement” urgent enough?", "En plan för byte innebär minst ett år till med den nuvarande produkten. I den takt det har gått kommer ytterligare en kritisk brist sannolikt innan ni har bytt. Är ”planera ett byte” tillräckligt brådskande?"]),
              pb(["The renewal is due", "Förnyelsen närmar sig"], ["The supplier manager reports the vendor contract renews next quarter, and the vendor offers better terms for a longer commitment. Planning a replacement while renewing for years sends a mixed message. Which do you sign?", "Leverantörsansvarig meddelar att avtalet med tillverkaren förnyas nästa kvartal, och tillverkaren erbjuder bättre villkor för ett längre åtagande. Att planera ett byte och samtidigt förnya för flera år skickar dubbla signaler. Vad skriver ni under?"])
            ],
            B: [
              pb(["Unknown track record", "Okänd historik"], ["The leading alternative has had fewer published flaws, but it is also used by far fewer organisations, so fewer people have looked. You may be swapping a known risk for an unknown one. How do you know the replacement is better?", "Det främsta alternativet har haft färre publicerade brister, men används också av betydligt färre organisationer, så färre har granskat det. Ni kanske byter en känd risk mot en okänd. Hur vet ni att ersättaren är bättre?"]),
              pb(["A rushed migration", "En forcerad migrering"], ["Moving every remote user and partner to a new product “as soon as possible” is a project the network team normally plans over a year. Rushed, it brings outages and misconfigurations of its own. Is speed worth those?", "Att flytta varje distansanvändare och partner till en ny produkt ”så snart som möjligt” är ett projekt som nätverksteamet normalt planerar under ett år. Forcerat medför det egna avbrott och felkonfigurationer. Är snabbheten värd det?"]),
              pb(["Nobody knows the new one", "Ingen kan den nya"], ["The network lead points out that nobody on the team has run the new product. The first months will be operated by people learning as they go, on your most exposed device. Who carries that risk?", "Nätverksansvarig påpekar att ingen i teamet har drivit den nya produkten. De första månaderna sköts av personer som lär sig under tiden, på er mest exponerade enhet. Vem bär den risken?"])
            ],
            C: [
              pb(["Faster wouldn't have helped", "Snabbare hade inte hjälpt"], ["Your device was exploited weeks before the advisory existed. No patching speed would have stopped that. What does “patch faster” actually change about this incident?", "Er enhet utnyttjades flera veckor innan säkerhetsmeddelandet fanns. Ingen rättningstakt hade stoppat det. Vad ändrar ”rätta snabbare” egentligen i den här incidenten?"]),
              pb(["Third time in a year", "Tredje gången på ett år"], ["Procurement reminds the room that “patch faster” was also the conclusion after the second flaw. The board will see the same answer for the third time. How do you present it as a change?", "Inköp påminner rummet om att ”rätta snabbare” var slutsatsen även efter den andra bristen. Styrelsen kommer att få samma svar för tredje gången. Hur presenterar ni det som en förändring?"]),
              pb(["Still blind next time", "Fortfarande blinda nästa gång"], ["This option keeps seven days of logs on the device and the same broad directory rights. The next time it fails, you will be just as blind. Is that acceptable?", "Det här alternativet behåller sju dagars loggar på enheten och samma breda rättigheter i katalogtjänsten. Nästa gång den fallerar är ni lika blinda. Är det acceptabelt?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Designing for failure", "Att utforma för fel"], [
              io(["The board backs it", "Styrelsen står bakom"], ["The board approves the plan and its budget. The chair calls it the most mature answer to an incident they have seen.", "Styrelsen godkänner planen och dess budget. Ordföranden kallar det det mest genomtänkta svaret på en incident som hen har sett."], ["The board approved the edge redesign and its budget.", "Styrelsen godkände omarbetningen av perimetern och dess budget."]),
              io(["A fourth flaw", "En fjärde brist"], ["Weeks into the plan, the vendor announces a fourth critical flaw in the product, long before any replacement is ready.", "Några veckor in i planen meddelar leverantören en fjärde kritisk brist i produkten, långt innan någon ersättare är klar."], ["A fourth critical flaw was announced before the replacement was ready.", "En fjärde kritisk brist meddelades innan ersättaren var klar."], { reopen: true }),
              io(["Logs nobody reads", "Loggar som ingen läser"], ["The appliance's logs now flow to central storage, a hundred thousand lines a day. Nobody has been given the job of reading them.", "Enhetens loggar går nu till central lagring, hundratusen rader om dagen. Ingen har fått i uppdrag att läsa dem."], ["Edge logs now leave the box, but nobody owns reviewing them.", "Perimeterns loggar lämnar nu enheten, men ingen äger granskningen av dem."])
            ]),
            ir("i2", { notChosen: "A" }, ["The edge stays as it was", "Perimetern förblir som den var"], [
              io(["A generous vendor", "En generös leverantör"], ["The vendor offers free extended support and a dedicated contact for faster patches. The CIO calls it a win.", "Leverantören erbjuder kostnadsfri utökad support och en egen kontaktperson för snabbare rättningar. IT-chefen kallar det en seger."], ["The vendor offered extended support and a dedicated contact.", "Leverantören erbjöd utökad support och en egen kontaktperson."]),
              io(["An audit finding", "En revisionsanmärkning"], ["Internal audit records a finding: edge devices still keep their logs on the box and still hold credentials with broad rights.", "Internrevisionen gör en anmärkning: perimeterenheterna sparar fortfarande loggarna lokalt och har fortfarande inloggningsuppgifter med breda rättigheter."], ["Internal audit has recorded the edge design as a finding.", "Internrevisionen har gjort en anmärkning om perimeterns utformning."], { reopen: true }),
              io(["Greener grass?", "Gräset är grönare?"], ["A peer that replaced the same product last year reports two critical flaws in its new one. Nobody is sure what to make of it.", "En annan organisation som bytte bort samma produkt förra året rapporterar två kritiska brister i den nya. Ingen vet riktigt hur det ska tolkas."], ["A peer that switched products reports flaws in the new one too.", "En organisation som bytte produkt rapporterar brister även i den nya."])
            ])
          ]
        }),
        facilitator: fac(
          ["End on architecture: assume the edge will fail.", "Avsluta med arkitektur: utgå från att perimetern kommer att fallera."],
          ["Limited edge rights, off-box logs and a replacement plan.", "Begränsade rättigheter för perimetern, loggar på annan plats och en plan för byte."],
          [["Ask: if the edge fails tomorrow, what can it reach?", "Fråga: om perimetern fallerar i morgon, vad kan den nå?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The appliance is rebuilt and the directory recovered, but the intrusion lasted weeks and remote work was disrupted for days. The organisation redesigns its edge on the assumption that it will fail.",
        "Enheten byggs om och katalogtjänsten återställs, men intrånget pågick i flera veckor och distansarbetet stördes i flera dagar. Organisationen gör om sin perimeter utifrån antagandet att den kommer att fallera."
      ])
    },

    debrief: {
      keyLessons: [
        L(["For a mass-exploited zero-day, assume compromise and hunt, not just patch.", "Vid en massutnyttjad nolldagssårbarhet: utgå från intrång och leta, rätta inte bara."]),
        L(["Mitigations can be bypassed; plan for disconnection.", "Tillfälliga åtgärder kan förbigås; planera för bortkoppling."]),
        L(["A patched device is not a clean device.", "En rättad enhet är inte en ren enhet."]),
        L(["Limit what edge devices can reach and store.", "Begränsa vad perimeterenheter kan nå och lagra."])
      ],
      assumptionsVsReality: [
        avr(["We're racing the attackers.", "Vi tävlar mot angriparna."], ["They were in weeks earlier.", "De var inne flera veckor tidigare."], "p3"),
        avr(["The mitigation closed it.", "Den tillfälliga åtgärden stängde det."], ["It was bypassed.", "Den förbigicks."], "p4"),
        avr(["Only the appliance.", "Bara enheten."], ["Its credentials reached the directory.", "Dess inloggningsuppgifter nådde katalogtjänsten."], "p6")
      ],
      strengthsToLookFor: [
        L(["Reducing exposure before the fix", "Att minska exponeringen före rättningen"]),
        L(["Hunting for prior compromise", "Att leta efter tidigare intrång"]),
        L(["An explicit, owned decision on disconnection", "Ett uttalat och ägt beslut om bortkoppling"])
      ],
      commonGaps: [
        L(["Waiting for the vendor", "Att vänta på leverantören"]),
        L(["Treating patching as the end", "Att behandla rättningen som slutet"]),
        L(["Forgetting stored credentials", "Att glömma lagrade inloggningsuppgifter"])
      ],
      suggestedActions: [
        act(["Send edge-device logs to central storage with long retention.", "Skicka loggar från perimeterenheter till central lagring med lång lagringstid."], "socLead", "high"),
        act(["Minimise credentials stored on edge devices and their rights.", "Minimera inloggningsuppgifter som lagras i perimeterenheter och deras rättigheter."], "networkLead", "high"),
        act(["Prepare an alternative remote-access path for critical users.", "Förbered en alternativ väg för fjärråtkomst för kritiska användare."], "itOps", "medium"),
        act(["Agree in advance who can order an edge device offline.", "Kom i förväg överens om vem som kan beordra bortkoppling av en perimeterenhet."], "cio", "medium")
      ]
    }
  });
})();
