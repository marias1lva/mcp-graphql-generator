//configuração de variáveis de ambiente
//o dotenv é carregado automaticamente pelo bun ou ts-node
import { GraphQLCredentials, KeycloakConfig } from '../types/auth';

export const getKeycloakConfig = (): KeycloakConfig => {
  return{
    url: process.env.KEYCLOAK_URL || '',
    realm: process.env.KEYCLOAK_REALM || '',
    clientId: process.env.KEYCLOAK_CLIENT_ID || '',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || ''
  };
};

export const getGraphQLCredentials = async (): Promise<GraphQLCredentials> => {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_API || process.env.GRAPHQL_API_URL || '';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  //se tem organização, adiciona no header
  if(process.env.ORGANIZATION_ID_PLACEHOLDER || process.env.ORGANIZATION_ID){
    headers['X-Organization-Id'] = process.env.ORGANIZATION_ID_PLACEHOLDER || process.env.ORGANIZATION_ID || '';
  }

  //método 1: Token Bearer direto (se fornecido)
  if(process.env.API_TOKEN){
    headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
    return{ 
      url: graphqlUrl, headers 
    };
  }

  //método 2: API Key simples
  if(process.env.API_KEY){
    headers['X-API-Key'] = process.env.API_KEY;
    if(process.env.API_SECRET){
      headers['X-API-Secret'] = process.env.API_SECRET;
    }
    return{
      url: graphqlUrl, headers 
    };
  }

  //método 3: Keycloak (precisa obter token)
  const keycloakConfig = getKeycloakConfig();
  if(keycloakConfig.clientId && keycloakConfig.clientSecret){
    try{
      //importação dinâmica para evitar dependência circular
      const { getKeycloakToken } = await import('../services/keycloakAuth');
      const token = await getKeycloakToken(keycloakConfig);
      headers['Authorization'] = `Bearer ${token}`;
    }catch(error){
      console.warn('Failed to get Keycloak token, proceeding without auth:', error);
    }
  }

  return{
    url: graphqlUrl, headers
  };
};