/*
 * environments.js — Technology-environment vocabularies.
 *
 * Templates write generic terms through placeholders (e.g. {{env.edrAlert}});
 * the selected environment swaps in the matching wording. Text references only;
 * no vendor logos or UI imitations.
 *
 * Phase 1 registers the environment ids; the vocabularies are filled in phase 2.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const ids = ["generic", "m365", "google", "aws", "onprem", "hybrid", "otics"];

  BK.data.environments = {
    ids,
    vocab: {} // { [envId]: { [term]: { en, sv } } } — populated in phase 2
  };
})();
