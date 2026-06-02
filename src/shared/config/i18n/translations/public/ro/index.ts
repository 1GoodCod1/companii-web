import { publicRoShared } from './shared';
import { publicRoLanding } from './landing';
import { publicRoCompanies } from './companies';
import { publicRoMarketing } from './marketing';
import { publicRoSubscriptions } from './subscriptions';
import { publicRoErrors } from './errors';

export const publicRo = {
  ...publicRoShared,
  ...publicRoLanding,
  ...publicRoCompanies,
  ...publicRoMarketing,
  ...publicRoSubscriptions,
  ...publicRoErrors,
};
