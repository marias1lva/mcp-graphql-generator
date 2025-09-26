// Tipos globais para o projeto
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // GraphQL API
      NEXT_PUBLIC_GRAPHQL_API?: string;
      GRAPHQL_API_URL?: string;
      
      // Autenticação
      API_TOKEN?: string;
      API_KEY?: string;
      API_SECRET?: string;
      
      // Keycloak
      KEYCLOAK_URL?: string;
      KEYCLOAK_REALM?: string;
      KEYCLOAK_CLIENT_ID?: string;
      KEYCLOAK_CLIENT_SECRET?: string;
      
      // Outros
      ORGANIZATION_ID_PLACEHOLDER?: string;
      ORGANIZATION_ID?: string;
      PORT?: string;
      
      // NextAuth (do seu projeto original)
      NEXTAUTH_URL?: string;
      NEXTAUTH_SECRET?: string;
      
      // Google APIs
      NEXT_PUBLIC_GOOGLE_JS_API_KEY?: string;
      GOOGLE_API_KEY?: string;
      GOOGLE_API_STATIC_SECRET_KEY?: string;
      
      // Worker
      WORKER_API_URL?: string;
    }
  }
}

export {};