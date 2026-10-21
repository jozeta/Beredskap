/*
 * sectors.js — Sector catalogue: business model, critical services (with
 * dependencies and RTO/RPO in hours) and crown jewels per sector.
 *
 * Services are addressed in templates by slot: {{org.service.primary}},
 * {{org.service.secondary}}, {{org.service.support}}, {{org.service.customer}}.
 * `deps` name shared platform components (see PLATFORM) and drive the
 * service-dependency diagram and RTO/RPO chart.
 */
(function () {
  "use strict";

  const BK = window.BK;

  // Shared platform components that services depend on.
  const PLATFORM = {
    identity: { en: "Identity and access", sv: "Identitet och behörighet" },
    network: { en: "Network and VPN", sv: "Nätverk och VPN" },
    fileServers: { en: "File servers", sv: "Filservrar" },
    erp: { en: "ERP system", sv: "Affärssystem (ERP)" },
    email: { en: "Email and collaboration", sv: "E-post och samarbete" },
    database: { en: "Core databases", sv: "Centrala databaser" },
    backup: { en: "Backup platform", sv: "Backupplattform" },
    web: { en: "Public website", sv: "Publik webbplats" },
    payments: { en: "Payment integration", sv: "Betalintegration" },
    ot: { en: "Production control systems", sv: "Produktionsstyrsystem" },
    cloud: { en: "Cloud platform", sv: "Molnplattform" },
    telephony: { en: "Telephony", sv: "Telefoni" }
  };

  function svc(name, rto, rpo, deps) {
    return { name, rto, rpo, deps };
  }

  const sectors = {
    logistics: {
      model: { en: "third-party logistics and warehousing for retail and industry", sv: "tredjepartslogistik och lagerhållning åt handel och industri" },
      services: {
        primary: svc({ en: "Warehouse management system", sv: "Lagerstyrningssystemet (WMS)" }, 8, 1, ["identity", "network", "database", "erp"]),
        secondary: svc({ en: "Transport booking and dispatch", sv: "Transportbokning och trafikledning" }, 12, 4, ["identity", "network", "erp"]),
        support: svc({ en: "Invoicing and finance", sv: "Fakturering och ekonomi" }, 72, 24, ["identity", "erp", "fileServers"]),
        customer: svc({ en: "Customer tracking portal", sv: "Kundportal för spårning" }, 24, 4, ["web", "database", "cloud"])
      },
      crownJewels: { en: "customer order data and the warehouse management system", sv: "kundernas orderdata och lagerstyrningssystemet" }
    },
    retail: {
      model: { en: "a chain of stores with a growing online shop", sv: "en butikskedja med en växande e-handel" },
      services: {
        primary: svc({ en: "Online shop and checkout", sv: "E-handel och kassaflöde" }, 4, 1, ["web", "payments", "database", "cloud"]),
        secondary: svc({ en: "Store point-of-sale systems", sv: "Butikernas kassasystem" }, 8, 4, ["network", "payments", "erp"]),
        support: svc({ en: "Supply chain and replenishment", sv: "Varuförsörjning och påfyllnad" }, 24, 12, ["erp", "identity", "fileServers"]),
        customer: svc({ en: "Loyalty programme and customer accounts", sv: "Kundklubb och kundkonton" }, 24, 4, ["web", "database", "identity"])
      },
      crownJewels: { en: "customer accounts, payment flows and the loyalty database", sv: "kundkonton, betalflöden och kundklubbsdatabasen" }
    },
    manufacturing: {
      model: { en: "contract manufacturing of components for the automotive and energy industries", sv: "kontraktstillverkning av komponenter åt fordons- och energiindustrin" },
      services: {
        primary: svc({ en: "Production lines and MES", sv: "Produktionslinjer och MES" }, 12, 4, ["ot", "network", "database"]),
        secondary: svc({ en: "Order intake and planning", sv: "Orderhantering och planering" }, 24, 8, ["erp", "identity", "email"]),
        support: svc({ en: "Engineering drawings and PLM", sv: "Konstruktionsunderlag och PLM" }, 48, 24, ["fileServers", "identity", "backup"]),
        customer: svc({ en: "Supplier and customer EDI", sv: "EDI mot kunder och leverantörer" }, 24, 4, ["erp", "network", "cloud"])
      },
      crownJewels: { en: "product designs, customer drawings and production recipes", sv: "produktkonstruktioner, kundritningar och produktionsrecept" }
    },
    energy: {
      model: { en: "regional electricity distribution and district heating", sv: "regional eldistribution och fjärrvärme" },
      services: {
        primary: svc({ en: "Grid operations and SCADA", sv: "Nätdrift och SCADA" }, 2, 0.5, ["ot", "network", "identity"]),
        secondary: svc({ en: "Metering and billing", sv: "Mätvärdesinsamling och fakturering" }, 48, 24, ["database", "erp", "cloud"]),
        support: svc({ en: "Field service dispatch", sv: "Utryckning och fältservice" }, 8, 4, ["telephony", "identity", "network"]),
        customer: svc({ en: "Outage information and customer service", sv: "Avbrottsinformation och kundtjänst" }, 4, 1, ["web", "telephony", "cloud"])
      },
      crownJewels: { en: "grid control systems and customer metering data", sv: "nätets styrsystem och kundernas mätdata" }
    },
    healthcare: {
      model: { en: "hospital and primary care services for the region", sv: "sjukhusvård och primärvård för regionen" },
      services: {
        primary: svc({ en: "Electronic health records", sv: "Journalsystemet" }, 2, 0.25, ["identity", "database", "network"]),
        secondary: svc({ en: "Laboratory and imaging systems", sv: "Labb- och röntgensystem" }, 4, 1, ["network", "database", "fileServers"]),
        support: svc({ en: "Staff scheduling and payroll", sv: "Bemanning och lön" }, 48, 24, ["erp", "identity"]),
        customer: svc({ en: "Patient portal and appointment booking", sv: "Patientportal och tidbokning" }, 24, 4, ["web", "identity", "cloud"])
      },
      crownJewels: { en: "patient records and medical device networks", sv: "patientjournaler och nätverk för medicinteknisk utrustning" }
    },
    finance: {
      model: { en: "retail banking and lending for households and small businesses", sv: "bankverksamhet och utlåning till hushåll och småföretag" },
      services: {
        primary: svc({ en: "Online and mobile banking", sv: "Internet- och mobilbanken" }, 2, 0.1, ["web", "identity", "database", "cloud"]),
        secondary: svc({ en: "Payments and clearing", sv: "Betalningar och clearing" }, 2, 0, ["payments", "database", "network"]),
        support: svc({ en: "Credit decisioning", sv: "Kreditbeslut" }, 24, 4, ["database", "identity", "erp"]),
        customer: svc({ en: "Customer service and branches", sv: "Kundtjänst och kontor" }, 8, 4, ["telephony", "identity", "email"])
      },
      crownJewels: { en: "customer accounts, transaction data and payment keys", sv: "kundkonton, transaktionsdata och betalnycklar" }
    },
    public: {
      model: { en: "municipal services for residents and businesses", sv: "kommunal service till invånare och företag" },
      services: {
        primary: svc({ en: "Social services case management", sv: "Ärendesystem för socialtjänsten" }, 8, 4, ["identity", "database", "network"]),
        secondary: svc({ en: "Schools and education platforms", sv: "Skolornas lärplattformar" }, 24, 8, ["identity", "cloud", "email"]),
        support: svc({ en: "Payroll and finance", sv: "Lön och ekonomi" }, 72, 24, ["erp", "identity", "fileServers"]),
        customer: svc({ en: "E-services and contact centre", sv: "E-tjänster och kontaktcenter" }, 24, 4, ["web", "telephony", "identity"])
      },
      crownJewels: { en: "personal data in social services and the e-service platform", sv: "personuppgifter i socialtjänsten och e-tjänsteplattformen" }
    },
    telecom: {
      model: { en: "fibre broadband and business connectivity", sv: "fiberbredband och företagsuppkoppling" },
      services: {
        primary: svc({ en: "Core network and DNS", sv: "Kärnnät och DNS" }, 1, 0, ["network", "identity"]),
        secondary: svc({ en: "Provisioning and activation", sv: "Leverans och aktivering" }, 24, 4, ["database", "erp", "identity"]),
        support: svc({ en: "Billing", sv: "Fakturering" }, 72, 24, ["erp", "database"]),
        customer: svc({ en: "Customer portal and support", sv: "Kundportal och support" }, 8, 4, ["web", "telephony", "cloud"])
      },
      crownJewels: { en: "network management systems and subscriber data", sv: "nätövervakningssystemen och abonnentdata" }
    },
    education: {
      model: { en: "upper-secondary and vocational education across several campuses", sv: "gymnasie- och yrkesutbildning på flera orter" },
      services: {
        primary: svc({ en: "Learning management platform", sv: "Lärplattformen" }, 24, 8, ["cloud", "identity", "web"]),
        secondary: svc({ en: "Student records and grades", sv: "Elevregister och betyg" }, 48, 24, ["database", "identity"]),
        support: svc({ en: "Staff email and file storage", sv: "Personalens e-post och fillagring" }, 24, 8, ["email", "fileServers", "identity"]),
        customer: svc({ en: "Admissions and guardian portal", sv: "Antagning och vårdnadshavarportal" }, 48, 8, ["web", "identity", "cloud"])
      },
      crownJewels: { en: "student records, including protected personal data", sv: "elevregister, inklusive skyddade personuppgifter" }
    },
    transport: {
      model: { en: "regional bus, rail and ferry services", sv: "regional buss-, tåg- och färjetrafik" },
      services: {
        primary: svc({ en: "Traffic control and vehicle positioning", sv: "Trafikledning och fordonspositionering" }, 2, 0.5, ["network", "ot", "identity"]),
        secondary: svc({ en: "Ticketing and travel cards", sv: "Biljettsystem och reskort" }, 8, 1, ["payments", "database", "cloud"]),
        support: svc({ en: "Crew and vehicle scheduling", sv: "Personal- och fordonsplanering" }, 12, 4, ["erp", "identity"]),
        customer: svc({ en: "Passenger information and app", sv: "Trafikinformation och app" }, 4, 1, ["web", "cloud", "database"])
      },
      crownJewels: { en: "traffic control systems and ticketing data", sv: "trafikledningssystemen och biljettdata" }
    },
    technology: {
      model: { en: "a SaaS platform used by several hundred business customers", sv: "en SaaS-plattform som används av flera hundra företagskunder" },
      services: {
        primary: svc({ en: "Customer-facing SaaS platform", sv: "Kundernas SaaS-plattform" }, 4, 1, ["cloud", "database", "identity"]),
        secondary: svc({ en: "Build and release pipeline", sv: "Bygg- och releasekedjan" }, 24, 8, ["cloud", "identity"]),
        support: svc({ en: "Customer support and ticketing", sv: "Kundsupport och ärendehantering" }, 12, 4, ["cloud", "email"]),
        customer: svc({ en: "Public API", sv: "Publikt API" }, 4, 1, ["cloud", "web", "identity"])
      },
      crownJewels: { en: "source code, signing keys and customer tenant data", sv: "källkod, signeringsnycklar och kunddata i plattformen" }
    },
    utilities: {
      model: { en: "drinking water, wastewater and district heating for the municipality", sv: "dricksvatten, avlopp och fjärrvärme för kommunen" },
      services: {
        primary: svc({ en: "Water treatment control", sv: "Styrning av vattenverken" }, 2, 0.5, ["ot", "network"]),
        secondary: svc({ en: "District heating operations", sv: "Fjärrvärmedrift" }, 4, 1, ["ot", "network", "identity"]),
        support: svc({ en: "Billing and customer records", sv: "Fakturering och kundregister" }, 72, 24, ["erp", "database"]),
        customer: svc({ en: "Customer service and outage alerts", sv: "Kundtjänst och driftinformation" }, 8, 4, ["web", "telephony"])
      },
      crownJewels: { en: "process control systems for water and heat", sv: "processtyrningen för vatten och värme" }
    }
  };

  // Organisation size presets (spec: size scales numbers, number of sites, headcount).
  const sizes = {
    small: { headcount: [80, 250], sites: [1, 2], factor: 0.4 },
    medium: { headcount: [400, 1500], sites: [3, 6], factor: 1 },
    large: { headcount: [2500, 12000], sites: [8, 20], factor: 2.5 }
  };

  BK.data.sectors = { PLATFORM, catalogue: sectors, sizes, ids: Object.keys(sectors) };
})();
