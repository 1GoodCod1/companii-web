export interface ApiClientConfig {
  getAuthContext?: () => { accessToken: string | null; companyId: string | null };
  onUnauthorized?: () => Promise<boolean>;
}

export const apiClientConfig: ApiClientConfig = {};

export function configureApiClient(options: ApiClientConfig) {
  Object.assign(apiClientConfig, options);
}
