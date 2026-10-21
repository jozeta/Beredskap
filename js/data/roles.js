/*
 * roles.js — Exercise roles (EN/SV).
 *
 * A role is a seat at the exercise table. Templates reference roles by id; the
 * generator later assigns exactly one fictional (or real, if mapped) person per
 * role. `title` is the person's job title inside the scenario organisation;
 * `group` drives default question targeting (technical vs executive).
 */
(function () {
  "use strict";

  const BK = window.BK;

  const roles = [
    { id: "incidentCommander", group: "lead",
      label: { en: "Incident commander", sv: "Incidentledare" },
      title: { en: "Head of IT Security Operations", sv: "Chef för säkerhetsdrift" } },
    { id: "ciso", group: "executive",
      label: { en: "CISO", sv: "Informationssäkerhetschef" },
      title: { en: "Chief Information Security Officer", sv: "Informationssäkerhetschef (CISO)" } },
    { id: "cio", group: "executive",
      label: { en: "CIO", sv: "IT-chef" },
      title: { en: "Chief Information Officer", sv: "IT-chef" } },
    { id: "ceo", group: "executive",
      label: { en: "CEO", sv: "Vd" },
      title: { en: "Chief Executive Officer", sv: "Verkställande direktör" } },
    { id: "cfo", group: "executive",
      label: { en: "CFO", sv: "Ekonomichef" },
      title: { en: "Chief Financial Officer", sv: "Ekonomi- och finanschef" } },
    { id: "socLead", group: "technical",
      label: { en: "SOC lead", sv: "SOC-ansvarig" },
      title: { en: "Security Operations Centre Lead", sv: "Ansvarig för säkerhetscentralen (SOC)" } },
    { id: "itOps", group: "technical",
      label: { en: "IT operations", sv: "IT-drift" },
      title: { en: "IT Operations Manager", sv: "Driftchef IT" } },
    { id: "networkLead", group: "technical",
      label: { en: "Network lead", sv: "Nätverksansvarig" },
      title: { en: "Network and Perimeter Lead", sv: "Ansvarig för nätverk och perimeterskydd" } },
    { id: "cloudLead", group: "technical",
      label: { en: "Cloud platform lead", sv: "Molnplattformsansvarig" },
      title: { en: "Cloud Platform Lead", sv: "Ansvarig för molnplattformen" } },
    { id: "devLead", group: "technical",
      label: { en: "Development lead", sv: "Utvecklingsansvarig" },
      title: { en: "Head of Software Development", sv: "Utvecklingschef" } },
    { id: "otEngineer", group: "technical",
      label: { en: "OT engineer", sv: "OT-ingenjör" },
      title: { en: "Lead Automation and OT Engineer", sv: "Ansvarig automations- och OT-ingenjör" } },
    { id: "serviceOwner", group: "business",
      label: { en: "Service owner", sv: "Tjänsteägare" },
      title: { en: "Business Service Owner", sv: "Verksamhetsansvarig tjänsteägare" } },
    { id: "clinicalLead", group: "business",
      label: { en: "Clinical lead", sv: "Chefläkare" },
      title: { en: "Chief Medical Officer", sv: "Chefläkare" } },
    { id: "legal", group: "support",
      label: { en: "Legal counsel", sv: "Jurist" },
      title: { en: "General Counsel", sv: "Chefsjurist" } },
    { id: "dpo", group: "support",
      label: { en: "Data protection officer", sv: "Dataskyddsombud" },
      title: { en: "Data Protection Officer", sv: "Dataskyddsombud" } },
    { id: "comms", group: "support",
      label: { en: "Communications", sv: "Kommunikation" },
      title: { en: "Head of Communications", sv: "Kommunikationschef" } },
    { id: "hr", group: "support",
      label: { en: "HR", sv: "HR" },
      title: { en: "HR Director", sv: "HR-chef" } },
    { id: "securityOfficer", group: "support",
      label: { en: "Security officer", sv: "Säkerhetschef" },
      title: { en: "Head of Corporate Security", sv: "Säkerhetschef" } },
    { id: "supplierManager", group: "business",
      label: { en: "Supplier manager", sv: "Leverantörsansvarig" },
      title: { en: "Head of Procurement and Supplier Management", sv: "Inköps- och leverantörschef" } },
    { id: "facilities", group: "business",
      label: { en: "Facilities", sv: "Fastighet" },
      title: { en: "Facilities Manager", sv: "Fastighetschef" } },
    { id: "dutyOfficer", group: "lead",
      label: { en: "Duty officer", sv: "Tjänsteman i beredskap" },
      title: { en: "Duty Officer", sv: "Tjänsteman i beredskap (TiB)" } }
  ];

  const byId = {};
  roles.forEach((r) => (byId[r.id] = r));

  BK.data.roles = { list: roles, byId, get: (id) => byId[id] || null };
})();
