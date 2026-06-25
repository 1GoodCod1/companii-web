import { companiiRoNav } from './nav';
import { companiiRoAuth } from './auth';
import { companiiRoCabinet } from './cabinet';
import { companiiRoPortal } from './portal';
import { companiiRoAdmin } from './admin';
import { companiiRoSettings } from './settings';
import { companiiRoMisc } from './misc';
import { companiiRoCompany } from './company';
import { companiiRoNotifications } from './notifications';

export const companiiRo = {
  ...companiiRoNav,
  ...companiiRoAuth,
  ...companiiRoCabinet,
  ...companiiRoPortal,
  ...companiiRoAdmin,
  ...companiiRoSettings,
  ...companiiRoMisc,
  ...companiiRoCompany,
  ...companiiRoNotifications,
};
