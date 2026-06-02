import type { InvitableCompanyRole } from '@/entities/company/model/roles.types';
import { COMPANY_ROLE } from '@/entities/company/model/roles.constants';

export type InviteMode = 'link' | 'direct';

export interface InviteState {
  showInvite: boolean;
  inviteMode: InviteMode;
  role: InvitableCompanyRole;
  restrictEmail: string;
  contact: string;
  generatedLink: {
    url: string;
    expiresAt: string;
  } | null;
  directAddHint: string | null;
}

export const initialInviteState: InviteState = {
  showInvite: false,
  inviteMode: 'link',
  role: COMPANY_ROLE.MEMBER,
  restrictEmail: '',
  contact: '',
  generatedLink: null,
  directAddHint: null,
};

export type InviteAction =
  | { type: 'OPEN_INVITE' }
  | { type: 'CLOSE_INVITE' }
  | { type: 'SET_MODE'; payload: InviteMode }
  | { type: 'SET_ROLE'; payload: InvitableCompanyRole }
  | { type: 'SET_RESTRICT_EMAIL'; payload: string }
  | { type: 'SET_CONTACT'; payload: string }
  | { type: 'SET_GENERATED_LINK'; payload: { url: string; expiresAt: string } | null }
  | { type: 'SET_DIRECT_ADD_HINT'; payload: string | null }
  | { type: 'SWITCH_TO_LINK_INVITE'; payload?: string }
  | { type: 'RESET' };

export function inviteReducer(state: InviteState, action: InviteAction): InviteState {
  switch (action.type) {
    case 'OPEN_INVITE':
      return { ...state, showInvite: true };
    case 'CLOSE_INVITE':
      return { ...initialInviteState };
    case 'SET_MODE':
      return { ...state, inviteMode: action.payload, directAddHint: null, generatedLink: null };
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_RESTRICT_EMAIL':
      return { ...state, restrictEmail: action.payload };
    case 'SET_CONTACT':
      return { ...state, contact: action.payload, directAddHint: null };
    case 'SET_GENERATED_LINK':
      return { ...state, generatedLink: action.payload };
    case 'SET_DIRECT_ADD_HINT':
      return { ...state, directAddHint: action.payload };
    case 'SWITCH_TO_LINK_INVITE':
      return {
        ...state,
        inviteMode: 'link',
        restrictEmail: action.payload?.includes('@') ? action.payload.trim() : state.restrictEmail,
        directAddHint: null,
        generatedLink: null,
      };
    case 'RESET':
      return { ...initialInviteState };
    default:
      return state;
  }
}