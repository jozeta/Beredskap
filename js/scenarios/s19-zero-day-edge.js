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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Act on a zero-day before certainty", "Agera på en nolldagssårbarhet innan det finns visshet"]) },
      { id: "lo2", text: L(["Hunt for compromise that predates disclosure", "Leta efter intrång som skedde före offentliggörandet"]) },
      { id: "lo3", text: L(["Decide to take a critical system offline and own the impact", "Besluta att koppla bort ett kritiskt system och ta ansvar för följderna"]) },
      { id: "lo4", text: L(["Treat a patched device as possibly still compromised", "Behandla en rättad enhet som möjligen fortfarande komprometterad"]) }
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
          "{{time.T+0|day}}, {{time.T+0|clock}}. A security advisory lands in the inbox of the network team at {{org.name}}.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Ett säkerhetsmeddelande landar i inkorgen hos nätverksteamet på {{org.name}}."
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
          evaluation: [["Reduces exposure before the fix arrives", "Minskar exponeringen innan rättningen kommer"], ["Starts hunting, not only patching", "Börjar leta, inte bara rätta"]]
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
        assumptionChallenged: L(["The mitigation is a quick, painless fix.", "Den tillfälliga åtgärden är en snabb och smärtfri lösning."]),
        narrative: L([
          "{{time.T+240|clock}}. The mitigation file arrives with release notes.",
          "Klockan {{time.T+240|clock}}. Filen med den tillfälliga åtgärden kommer med versionsanteckningar."
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
          evaluation: [["Accepts operational pain to close exposure", "Accepterar störningar i verksamheten för att stänga exponeringen"]]
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
        assumptionChallenged: L(["We're racing to patch before the attackers get to us.", "Vi tävlar om att rätta innan angriparna når oss."]),
        reveals: ["hf-predate"],
        narrative: L([
          "{{time.T+480|clock}}. The SOC runs the vendor's integrity checker and the published indicators.",
          "Klockan {{time.T+480|clock}}. SOC kör leverantörens integritetskontroll och de publicerade indikatorerna."
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
          minutes: 10
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
        assumptionChallenged: L(["The mitigation closed the hole.", "Den tillfälliga åtgärden stängde hålet."]),
        reveals: ["hf-bypass"],
        narrative: L([
          "{{time.T+900|clock}}. The SOC sees fresh activity on the device.",
          "Klockan {{time.T+900|clock}}. SOC ser ny aktivitet på enheten."
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
          evaluation: [["Recommends disconnection and plans for the impact", "Rekommenderar bortkoppling och planerar för följderna"]]
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
          "{{time.T+1080|clock}}. The recommendation reaches executive management.",
          "Klockan {{time.T+1080|clock}}. Rekommendationen når företagsledningen."
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
          ["Keep it online and say nothing more.", "Behåll den uppkopplad och säg inget mer."]
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
          minutes: 10
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
        assumptionChallenged: L(["The compromise was limited to the appliance.", "Intrånget var begränsat till enheten."]),
        reveals: ["hf-ldap"],
        narrative: L([
          "The next day. The responders review directory logs.",
          "Nästa dag. Incidenthanterarna granskar katalogtjänstens loggar."
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
          evaluation: [["Scopes the response to the identity layer", "Avgränsar hanteringen till identitetslagret"]]
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
          "Five days after the advisory.",
          "Fem dagar efter säkerhetsmeddelandet."
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
          evaluation: [["Rebuilds rather than only patching", "Bygger om i stället för att bara rätta"]]
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
        assumptionChallenged: L(["This was a one-off.", "Det här var en engångshändelse."]),
        narrative: L([
          "Two weeks later. The post-incident review.",
          "Två veckor senare. Utvärderingen efter incidenten."
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
          evaluation: [["Designs for failure rather than only patching faster", "Utformar för fel i stället för att bara rätta snabbare"]]
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
