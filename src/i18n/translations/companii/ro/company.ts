import { companiiRoCompanyShell } from './company/shell';
import { companiiRoCompanyCrm } from './company/crm';
import { companiiRoCompanyEstimates } from './company/estimates';
import { companiiRoCompanyFsm } from './company/fsm';
import { companiiRoCompanyTeam } from './company/team';
import { companiiRoCompanyOperations } from './company/operations';

export const companiiRoCompany = {
  company: {
    ...companiiRoCompanyShell,
    ...companiiRoCompanyCrm,
    ...companiiRoCompanyEstimates,
    ...companiiRoCompanyFsm,
    ...companiiRoCompanyTeam,
    ...companiiRoCompanyOperations,
  },
};
