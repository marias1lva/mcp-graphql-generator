import axios from 'axios';
import { KeycloakConfig, KeycloakTokenResponse } from '../types/auth';

//cache do token para evitar muitas requisições
let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

//margem de segurança para renovar o token antes de expirar (5 minutos)
const TOKEN_RENEWAL_MARGIN = 5 * 60 * 1000; // 5 minutos em ms

//obtém um token de acesso do Keycloak usando Client Credentials Grant
export async function getKeycloakToken(config: KeycloakConfig): Promise<string> {
  //verifica se já tem um token válido no cache
  if(tokenCache && Date.now() < tokenCache.expiresAt - TOKEN_RENEWAL_MARGIN){
    return tokenCache.token;
  }

  try{
    const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret
    });

    console.log(`🔐 Obtendo token do Keycloak: ${config.realm}@${config.url}`);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokenData: KeycloakTokenResponse = response.data;
    
    if(!tokenData.access_token){
      throw new Error('Token não recebido do Keycloak');
    }

    //calcula quando o token expira
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    
    //armazena no cache
    tokenCache = {
      token: tokenData.access_token,
      expiresAt
    };

    console.log(`✅ Token obtido com sucesso (expira em ${tokenData.expires_in}s)`);
    
    return tokenData.access_token;

  }catch (error){
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro ao obter token do Keycloak:', errorMessage);
    
    if(axios.isAxiosError(error) && error.response){
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
      
      //erros específicos do Keycloak
      if(error.response.status === 401){
        throw new Error('Credenciais inválidas do Keycloak (client_id/client_secret)');
      }else if (error.response.status === 400){
        const errorData = error.response.data;
        if(errorData.error === 'invalid_client'){
          throw new Error('Client ID inválido no Keycloak');
        }else if (errorData.error === 'unauthorized_client'){
          throw new Error('Client não autorizado para Client Credentials Grant');
        }
      }
    }
    
    throw new Error(`Falha na autenticação Keycloak: ${errorMessage}`);
  }
}

//valida se as configurações do Keycloak estão completas
export function validateKeycloakConfig(config: KeycloakConfig): boolean {
  const required = ['url', 'realm', 'clientId', 'clientSecret'];
  const missing = required.filter(field => !config[field as keyof KeycloakConfig]);
  
  if(missing.length > 0){
    console.warn(`⚠️  Configurações Keycloak faltando: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

//limpa o cache do token (útil para forçar renovação)
export function clearTokenCache(): void {
  tokenCache = null;
}

//verifica se o token está próximo de expirar
export function isTokenExpiringSoon(): boolean {
  if(!tokenCache) return true;
  return Date.now() >= tokenCache.expiresAt - TOKEN_RENEWAL_MARGIN;
}

//obtém informações sobre o token atual (para debug)
export function getTokenInfo(): { hasToken: boolean; expiresAt?: Date; expiresIn?: number } {
  if(!tokenCache){
    return { hasToken: false };
  }
  
  return{
    hasToken: true,
    expiresAt: new Date(tokenCache.expiresAt),
    expiresIn: Math.max(0, Math.floor((tokenCache.expiresAt - Date.now()) / 1000))
  };
}