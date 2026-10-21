/*
 * names.js — Curated name and value pools, plus generators for fictional
 * organisations, suppliers, threat actors, domains, hostnames and IPs.
 *
 * Rules (spec 5.4):
 *  - People: a Swedish pool reflecting modern Sweden and an international English
 *    pool; mixed genders; no real public figures. No gender is stored.
 *  - Threat actors are pattern-generated and avoid real APT, ransomware and
 *    hacktivist names (and the naming schemes of major vendors: animals like
 *    Bear/Panda/Kitten/Spider, weather like Typhoon/Blizzard/Sleet, etc.).
 *  - Domains only under the reserved .example TLD; IPs only from RFC 5737.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const people = {
    sv: {
      first: [
        "Anna", "Maria", "Elin", "Sara", "Emma", "Johanna", "Linnea", "Ida", "Karin", "Sofia",
        "Hanna", "Amanda", "Malin", "Frida", "Ebba", "Matilda", "Lina", "Moa", "Klara", "Maja",
        "Alva", "Astrid", "Ingrid", "Helena", "Cecilia", "Annika", "Jenny", "Camilla", "Petra", "Leila",
        "Amira", "Yasmin", "Nour", "Sanna", "Aino", "Elif", "Zeynep", "Jelena", "Mariam", "Hodan",
        "Erik", "Lars", "Anders", "Johan", "Karl", "Per", "Mikael", "Fredrik", "Magnus", "Jonas",
        "Henrik", "Oskar", "Viktor", "Gustav", "Axel", "Emil", "Filip", "Ludvig", "Hugo", "Elias",
        "Anton", "Nils", "Olof", "Björn", "Mattias", "Daniel", "Ali", "Omar", "Ahmed", "Hassan",
        "Yusuf", "Kerem", "Emre", "Arvid", "Milan", "Nikola", "Samir", "Tariq", "Robin", "Kim"
      ],
      last: [
        "Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson",
        "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Lindberg",
        "Lindqvist", "Lindström", "Berg", "Bergström", "Sandberg", "Forsberg", "Sjöberg", "Lundgren",
        "Lundqvist", "Holm", "Engström", "Ekström", "Hedlund", "Wallin", "Björk", "Nyström",
        "Åberg", "Öberg", "Strand", "Fransson", "Sundberg", "Hellström", "Lindgren", "Axelsson",
        "Mattsson", "Danielsson", "Isaksson", "Falk", "Söderberg", "Nordin", "Hosseini", "Mohammadi",
        "Yilmaz", "Kaya", "Demir", "Ibrahim", "Hassan", "Nguyen", "Petrović", "Jovanović",
        "Korhonen", "Virtanen", "Haddad", "Abdi", "Rahimi", "Al-Sayed", "Novak", "Kowalczyk"
      ]
    },
    en: {
      first: [
        "Olivia", "Amelia", "Isla", "Grace", "Charlotte", "Emily", "Hannah", "Chloe", "Sophie", "Lucy",
        "Ella", "Freya", "Megan", "Rachel", "Laura", "Claire", "Aisha", "Priya", "Mei", "Ana",
        "Ines", "Leah", "Nadia", "Zara", "Fiona", "Siobhan", "Katarzyna", "Elena", "Marta", "Yuki",
        "James", "Oliver", "Thomas", "William", "George", "Daniel", "Samuel", "Benjamin", "Henry", "Jack",
        "Liam", "Noah", "Ethan", "Lucas", "Matteo", "Arjun", "Ravi", "Kenji", "Diego", "Mateo",
        "Tomasz", "Piotr", "Stefan", "Andreas", "Pieter", "Kwame", "Tunde", "Omar", "Hamza", "Callum",
        "Rory", "Owen", "Alex", "Sam", "Jordan", "Taylor"
      ],
      last: [
        "Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Davies", "Evans", "Thomas", "Johnson",
        "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall",
        "Wood", "Harris", "Clarke", "Patel", "Khan", "Singh", "Shah", "Chen", "Wang", "Kim",
        "Nakamura", "Okafor", "Mensah", "Adeyemi", "García", "Fernández", "Rossi", "Bianchi", "Müller", "Schmidt",
        "Novak", "Kowalski", "Nowak", "Jansen", "de Vries", "Murphy", "O'Brien", "Kelly", "MacLeod", "Campbell",
        "Murray", "Byrne", "Costa", "Silva", "Dubois", "Moreau", "Andersen", "Nielsen", "Hansen", "Lindqvist"
      ]
    }
  };

  // Organisation name cores: invented, place-like, no known brands.
  const orgCores = {
    sv: [
      "Norrsken", "Fjällvik", "Älvbacka", "Granholm", "Björkdal", "Sjövik", "Kustvind", "Lövhaga",
      "Strömsvik", "Bergslund", "Tallmo", "Myrberga", "Ekholmen", "Vinterhamn", "Snöbacka", "Havsljus",
      "Ljungmark", "Forsnäs", "Klippvik", "Ängsö", "Isvik", "Rimfrost", "Stjärnö", "Västanå"
    ],
    en: [
      "Polaris", "Northgate", "Harbourline", "Brightwater", "Aldermoor", "Westbrook", "Kestrel", "Meridian",
      "Stonebridge", "Silverfjord", "Ridgeway", "Fairhaven", "Larchfield", "Bluecrest", "Greywater", "Highmoor",
      "Ashgrove", "Seabright", "Thornbury", "Coldharbour", "Eastmere", "Wrenfield", "Halcyon", "Norland"
    ]
  };

  /*
   * Per-sector name patterns. {core} is replaced with an organisation core.
   * Swedish names end in AB (companies) or follow public-sector conventions;
   * English names use Ltd / Group.
   */
  const orgPatterns = {
    logistics: { sv: ["{core} Logistik AB", "{core} Frakt AB", "{core} Transport & Lager AB"], en: ["{core} Logistics Ltd", "{core} Freight Group", "{core} Distribution Ltd"] },
    retail: { sv: ["{core} Handel AB", "{core} Varuhus AB", "{core} Livs AB"], en: ["{core} Retail Group", "{core} Stores Ltd", "{core} Markets Ltd"] },
    manufacturing: { sv: ["{core} Industri AB", "{core} Verkstäder AB", "{core} Komponent AB"], en: ["{core} Industries Ltd", "{core} Manufacturing Group", "{core} Components Ltd"] },
    energy: { sv: ["{core} Energi AB", "{core} Kraft AB", "{core} Elnät AB"], en: ["{core} Energy Ltd", "{core} Power Group", "{core} Grid Ltd"] },
    healthcare: { sv: ["{core} Vård AB", "{core} Hälsa AB", "{core} Vårdgrupp AB"], en: ["{core} Health Group", "{core} Care Ltd", "{core} Medical Group"] },
    finance: { sv: ["{core} Finans AB", "{core} Sparbank AB", "{core} Kapital AB"], en: ["{core} Financial Group", "{core} Bank Ltd", "{core} Capital Ltd"] },
    public: { sv: ["{core}s kommun", "Region {core}", "{core} Kommunalförbund"], en: ["{core} Borough Council", "{core} Regional Authority", "{core} City Council"] },
    telecom: { sv: ["{core} Telekom AB", "{core} Fibernät AB", "{core} Kommunikation AB"], en: ["{core} Telecom Ltd", "{core} Networks Group", "{core} Fibre Ltd"] },
    education: { sv: ["{core} Utbildning AB", "{core} Friskolor AB", "{core} Yrkeshögskola AB"], en: ["{core} Education Trust", "{core} Learning Group", "{core} College Ltd"] },
    transport: { sv: ["{core} Trafik AB", "{core} Buss & Tåg AB", "{core} Färjelinjer AB"], en: ["{core} Transit Ltd", "{core} Rail Group", "{core} Ferries Ltd"] },
    technology: { sv: ["{core} Systems AB", "{core} Digital AB", "{core} IT-tjänster AB"], en: ["{core} Systems Ltd", "{core} Digital Group", "{core} Software Ltd"] },
    utilities: { sv: ["{core} Vatten AB", "{core} Miljö & Vatten AB", "{core} Fjärrvärme AB"], en: ["{core} Water Ltd", "{core} Utilities Group", "{core} Heat & Water Ltd"] }
  };

  const cities = {
    sv: ["Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Umeå", "Luleå", "Sundsvall", "Jönköping", "Karlstad", "Gävle", "Norrköping", "Växjö", "Östersund", "Halmstad"],
    en: ["Leeds", "Rotterdam", "Aarhus", "Tampere", "Bergen", "Gdańsk", "Ghent", "Porto", "Cork", "Graz", "Lyon", "Bristol", "Utrecht", "Turku", "Stavanger", "Glasgow"]
  };

  // ---- Suppliers ------------------------------------------------------------------------

  const supplierCores = ["Nordvik", "Arcwell", "Fjordline", "Granite", "Bluepine", "Skyward", "Larkspur", "Ironbirch", "Coastal", "Vantage", "Northlight", "Harrow", "Saltmarsh", "Clearpath", "Ember", "Holmen"];

  // kind -> [suffix patterns] ({core} replaced). Language-neutral brand-style names.
  const supplierPatterns = {
    msp: ["{core} IT Partner", "{core} Managed Services", "{core} Drift & Support"],
    cloud: ["{core} Cloud", "{core} Hosting", "{core} Datacenter"],
    vendor: ["{core} Software", "{core} Solutions", "{core} Systems"],
    isp: ["{core} Net", "{core} Fiber", "{core} Connect"],
    irRetainer: ["{core} Incident Response", "{core} Forensics", "{core} Cyber Defence"],
    insurer: ["{core} Insurance", "{core} Assurance", "{core} Mutual"],
    bank: ["{core} Bank", "{core} Merchant Bank", "{core} Corporate Bank"],
    registrar: ["{core} Domains", "{core} Registry Services", "{core} DNS"],
    payments: ["{core} Pay", "{core} Payments", "{core} Checkout"],
    facilities: ["{core} Fastighetsdrift", "{core} Facility Services", "{core} Property Services"]
  };

  // ---- Threat actors -----------------------------------------------------------------------

  // Folklore-and-landscape vocabulary; deliberately avoids vendor naming schemes.
  const actorAdjectives = ["Pale", "Hollow", "Quiet", "Ashen", "Rimed", "Glass", "Ember", "Brittle", "Tarnished", "Drowned", "Salt", "Lantern", "Grey", "Thawing", "Midnight", "Copper"];
  const actorNouns = ["Draugr", "Huldra", "Myling", "Vittra", "Lindworm", "Fossegrim", "Mara", "Nix", "Skerry", "Cairn", "Fjeld", "Moraine", "Esker", "Tarn", "Sedge", "Heron"];
  const brandPrefixes = ["VAL", "SKAR", "TUND", "KALD", "FJEL", "GRIM", "HEL", "ISK", "MYR", "RUN"];
  const brandSuffixes = ["KRYPT", "NOX", "VAULT", "CIPHER", "SEAL", "BIND", "SHADE", "KEEP"];
  const hacktivistWords = ["Fjällvind", "GlacierLine", "Nordvakt", "ColdHarbour", "Rimhallen", "Tundraljus", "StormBirch", "Midvinter"];

  /** Fictional actor name for a type. Returns { name, slug }. */
  function actorName(rng, type) {
    let name;
    if (type === "criminal") {
      name = rng.pick(brandPrefixes) + rng.pick(brandSuffixes);
    } else if (type === "hacktivist") {
      name = "#Op" + rng.pick(hacktivistWords);
    } else if (type === "insider") {
      name = rng.pick(actorAdjectives) + " " + rng.pick(actorNouns);
    } else {
      // state-linked / unknown: two-word cluster name
      name = rng.pick(actorAdjectives) + " " + rng.pick(actorNouns);
    }
    return { name, slug: slugify(name.replace(/^#Op/, "op-")) };
  }

  // ---- Helpers --------------------------------------------------------------------------------

  /** ASCII slug for domains: "Älvbacka Logistik" -> "alvbacka-logistik". */
  function slugify(str) {
    return String(str)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ø/gi, "o")
      .replace(/æ/gi, "ae")
      .replace(/ß/g, "ss")
      .toLowerCase()
      .replace(/&/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /** Domain under the reserved .example TLD. */
  function domain(...parts) {
    return parts.map(slugify).filter(Boolean).join("-") + ".example";
  }

  // RFC 5737 documentation ranges only.
  const TEST_NETS = ["192.0.2", "198.51.100", "203.0.113"];
  function ip(rng, net) {
    const prefix = net != null ? TEST_NETS[net] : rng.pick(TEST_NETS);
    return prefix + "." + rng.int(2, 254);
  }

  function initials(name) {
    return name
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }

  BK.data.names = {
    people,
    orgCores,
    orgPatterns,
    cities,
    supplierCores,
    supplierPatterns,
    actorName,
    slugify,
    domain,
    ip,
    initials,
    TEST_NETS
  };
})();
