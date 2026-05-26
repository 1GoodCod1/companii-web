/** Minimal shape for resolving a person's display name across the app. */
export type PersonNameInput = {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
};
