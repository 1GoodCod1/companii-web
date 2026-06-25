import { companiiRuNav } from './nav';
import { companiiRuAuth } from './auth';
import { companiiRuCabinet } from './cabinet';
import { companiiRuPortal } from './portal';
import { companiiRuAdmin } from './admin';
import { companiiRuSettings } from './settings';
import { companiiRuMisc } from './misc';
import { companiiRuCompany } from './company';
import { companiiRuNotifications } from './notifications';

export const companiiRu = {
  ...companiiRuNav,
  ...companiiRuAuth,
  ...companiiRuCabinet,
  ...companiiRuPortal,
  ...companiiRuAdmin,
  ...companiiRuSettings,
  ...companiiRuMisc,
  ...companiiRuCompany,
  ...companiiRuNotifications,
};
