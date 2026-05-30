export type AuthTokensResponse = {
  accessToken?: string;
  user?: unknown;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string | string[];
};
