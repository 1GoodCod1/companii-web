import { companiiRoCompanyShell } from './company/shell';
import { companiiRoCompanyCrm } from './company/crm';
import { companiiRoCompanyEstimates } from './company/estimates';
import { companiiRoCompanyFsm } from './company/fsm';
import { companiiRoCompanyTeam } from './company/team';
import { companiiRoCompanyOperations } from './company/operations';
import { companiiRoCompanyAnalytics } from './company/analytics';

export const companiiRoCompany = {
  company: {
    ...companiiRoCompanyShell,
    ...companiiRoCompanyCrm,
    ...companiiRoCompanyEstimates,
    ...companiiRoCompanyFsm,
    ...companiiRoCompanyTeam,
    ...companiiRoCompanyOperations,
    ...companiiRoCompanyAnalytics,
  },
};
