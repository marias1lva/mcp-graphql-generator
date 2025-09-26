// Interfaces compartilhadas para autenticação
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

export interface GraphQLCredentials {
  url: string;
  headers: Record<string, string>;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}