/*
 * environments.js — Technology-environment vocabularies.
 *
 * Templates write generic terms through placeholders ({{env.edrAlert}}); the
 * selected environment swaps in the matching wording. Any term an environment
 * does not define falls back to the generic wording, so templates never break.
 * Text references only; no vendor logos or UI imitations.
 *
 * Swedish forms are written to drop into running text in definite form where
 * that reads naturally ("identitetstjänsten", "backupsystemet").
 */
(function () {
  "use strict";

  const BK = window.BK;

  const ids = ["generic", "m365", "google", "aws", "onprem", "hybrid", "otics"];

  const generic = {
    edr: { en: "EDR", sv: "EDR" },
    edrAlert: { en: "EDR alert", sv: "EDR-larm" },
    siem: { en: "SIEM", sv: "SIEM" },
    idp: { en: "the identity provider", sv: "identitetstjänsten" },
    directory: { en: "the directory service", sv: "katalogtjänsten" },
    mail: { en: "the email platform", sv: "e-postplattformen" },
    storage: { en: "storage bucket", sv: "lagringsbucket" },
    cloud: { en: "the cloud platform", sv: "molnplattformen" },
    cloudAudit: { en: "cloud audit logs", sv: "molnplattformens granskningsloggar" },
    mfa: { en: "the MFA app", sv: "MFA-appen" },
    fileShare: { en: "the file shares", sv: "filresurserna" },
    endpointMgmt: { en: "the endpoint management tool", sv: "verktyget för klienthantering" },
    backup: { en: "the backup system", sv: "backupsystemet" },
    vpn: { en: "the VPN gateway", sv: "VPN-gatewayen" },
    firewall: { en: "the firewall", sv: "brandväggen" },
    adminAccount: { en: "administrator account", sv: "administratörskonto" },
    otNetwork: { en: "the OT network", sv: "OT-nätet" }
  };

  const overrides = {
    generic: {},
    m365: {
      edr: { en: "Defender for Endpoint", sv: "Defender for Endpoint" },
      edrAlert: { en: "Defender for Endpoint alert", sv: "larm från Defender for Endpoint" },
      siem: { en: "Microsoft Sentinel", sv: "Microsoft Sentinel" },
      idp: { en: "Entra ID", sv: "Entra ID" },
      directory: { en: "Entra ID", sv: "Entra ID" },
      mail: { en: "Exchange Online", sv: "Exchange Online" },
      storage: { en: "storage account container", sv: "container i ett lagringskonto" },
      cloud: { en: "Azure", sv: "Azure" },
      cloudAudit: { en: "Entra and Azure activity logs", sv: "aktivitetsloggarna i Entra och Azure" },
      mfa: { en: "Microsoft Authenticator", sv: "Microsoft Authenticator" },
      fileShare: { en: "SharePoint and the file servers", sv: "SharePoint och filservrarna" },
      endpointMgmt: { en: "Intune", sv: "Intune" },
      backup: { en: "Azure Backup", sv: "Azure Backup" },
      adminAccount: { en: "Global Administrator account", sv: "globalt administratörskonto" }
    },
    google: {
      siem: { en: "Google Security Operations", sv: "Google Security Operations" },
      idp: { en: "Google Cloud Identity", sv: "Google Cloud Identity" },
      directory: { en: "Google Cloud Identity", sv: "Google Cloud Identity" },
      mail: { en: "Gmail", sv: "Gmail" },
      storage: { en: "Cloud Storage bucket", sv: "Cloud Storage-bucket" },
      cloud: { en: "Google Cloud", sv: "Google Cloud" },
      cloudAudit: { en: "Cloud Audit Logs", sv: "Cloud Audit Logs" },
      mfa: { en: "Google sign-in prompts", sv: "Googles inloggningsuppmaningar" },
      fileShare: { en: "the shared drives", sv: "de delade enheterna" },
      endpointMgmt: { en: "Google endpoint management", sv: "Googles klienthantering" },
      backup: { en: "Backup and DR", sv: "Backup and DR" },
      adminAccount: { en: "super administrator account", sv: "superadministratörskonto" }
    },
    aws: {
      siem: { en: "Security Hub", sv: "Security Hub" },
      idp: { en: "IAM Identity Center", sv: "IAM Identity Center" },
      storage: { en: "S3 bucket", sv: "S3-bucket" },
      cloud: { en: "AWS", sv: "AWS" },
      cloudAudit: { en: "CloudTrail", sv: "CloudTrail" },
      backup: { en: "AWS Backup", sv: "AWS Backup" },
      adminAccount: { en: "root or administrator role", sv: "root- eller administratörsroll" }
    },
    onprem: {
      idp: { en: "Active Directory", sv: "Active Directory" },
      directory: { en: "Active Directory", sv: "Active Directory" },
      mail: { en: "Exchange Server", sv: "Exchange Server" },
      storage: { en: "file share", sv: "filresurs" },
      cloud: { en: "the data centre", sv: "datacentret" },
      cloudAudit: { en: "server event logs", sv: "serverloggarna" },
      fileShare: { en: "the Windows file servers", sv: "Windows-filservrarna" },
      endpointMgmt: { en: "Configuration Manager", sv: "Configuration Manager" },
      backup: { en: "the backup server", sv: "backupservern" },
      adminAccount: { en: "Domain Admin account", sv: "domänadministratörskonto" }
    },
    hybrid: {
      edr: { en: "Defender for Endpoint", sv: "Defender for Endpoint" },
      edrAlert: { en: "Defender for Endpoint alert", sv: "larm från Defender for Endpoint" },
      idp: { en: "Entra ID and on-premises Active Directory", sv: "Entra ID och lokala Active Directory" },
      directory: { en: "Active Directory", sv: "Active Directory" },
      mail: { en: "Exchange Online", sv: "Exchange Online" },
      storage: { en: "storage account container", sv: "container i ett lagringskonto" },
      cloud: { en: "Azure and the data centre", sv: "Azure och datacentret" },
      fileShare: { en: "the file servers and SharePoint", sv: "filservrarna och SharePoint" },
      backup: { en: "the backup server", sv: "backupservern" },
      adminAccount: { en: "Domain Admin account", sv: "domänadministratörskonto" }
    },
    otics: {
      idp: { en: "Active Directory", sv: "Active Directory" },
      directory: { en: "Active Directory", sv: "Active Directory" },
      cloud: { en: "the data centre", sv: "datacentret" },
      backup: { en: "the backup server", sv: "backupservern" },
      otNetwork: { en: "the control network", sv: "styrnätet" },
      adminAccount: { en: "Domain Admin account", sv: "domänadministratörskonto" }
    }
  };

  /** Look up a term ({ en, sv }) for an environment, falling back to generic. */
  function term(envId, key) {
    const env = overrides[envId] || {};
    return env[key] || generic[key] || null;
  }

  BK.data.environments = { ids, generic, overrides, term, terms: Object.keys(generic) };
})();
