import { publicRoShared } from './shared';
import { publicRoLanding } from './landing';
import { publicRoCompanies } from './companies';
import { publicRoMarketing } from './marketing';
import { publicRoSubscriptions } from './subscriptions';

export const publicRo = {
  ...publicRoShared,
  ...publicRoLanding,
  ...publicRoCompanies,
  ...publicRoMarketing,
  ...publicRoSubscriptions,
};
