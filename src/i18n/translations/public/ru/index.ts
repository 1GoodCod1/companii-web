import { publicRuShared } from './shared';
import { publicRuLanding } from './landing';
import { publicRuCompanies } from './companies';
import { publicRuMarketing } from './marketing';
import { publicRuSubscriptions } from './subscriptions';

export const publicRu = {
  ...publicRuShared,
  ...publicRuLanding,
  ...publicRuCompanies,
  ...publicRuMarketing,
  ...publicRuSubscriptions,
};
