import { companiiRuCompanyShell } from './company/shell';
import { companiiRuCompanyCrm } from './company/crm';
import { companiiRuCompanyEstimates } from './company/estimates';
import { companiiRuCompanyFsm } from './company/fsm';
import { companiiRuCompanyTeam } from './company/team';
import { companiiRuCompanyOperations } from './company/operations';
import { companiiRuCompanyAnalytics } from './company/analytics';

export const companiiRuCompany = {
  company: {
    ...companiiRuCompanyShell,
    ...companiiRuCompanyCrm,
    ...companiiRuCompanyEstimates,
    ...companiiRuCompanyFsm,
    ...companiiRuCompanyTeam,
    ...companiiRuCompanyOperations,
    ...companiiRuCompanyAnalytics,
  },
};
