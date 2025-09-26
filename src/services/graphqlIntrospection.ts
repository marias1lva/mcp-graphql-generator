import axios from 'axios';
import { getGraphQLCredentials } from '../config/credentials';

//interfaces para o schema GraphQL (resultado da introspection)
interface GraphQLTypeRef {
  name?: string;
  kind: string;
  ofType?: GraphQLTypeRef;
}

interface GraphQLArgument {
  name: string;
  type: GraphQLTypeRef;
}

interface GraphQLSchemaField {
  name: string;
  type: GraphQLTypeRef;
  args: GraphQLArgument[];
}

interface GraphQLSchemaType {
  name: string;
  kind: string;
  fields?: GraphQLSchemaField[];
}

interface GraphQLQueryType {
  name: string;
  fields: GraphQLSchemaField[];
}

interface GraphQLSchema {
  queryType: GraphQLQueryType;
  types: GraphQLSchemaType[];
}

interface GraphQLCredentials {
  url: string;
  headers: Record<string, string>;
}

//interface para representar um campo GraphQL processado
export interface GraphQLField {
  name: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  fields?: GraphQLField[]; //para campos aninhados (objetos)
}

//interface para representar um tipo GraphQL processado
export interface GraphQLType {
  name: string;
  fields: GraphQLField[];
  queryName?: string; 
}

//query de introspection para descobrir todos os tipos e campos da API
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
          args {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
      types {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }
`;

export class GraphQLIntrospectionService {
  private credentials: GraphQLCredentials | null = null;
  private schema: GraphQLSchema | null = null;

  //executa introspection da API GraphQL
  async loadSchema(): Promise<void> {
    try {
      //obtém credenciais de acesso
      this.credentials = await getGraphQLCredentials();
      
      console.log(`🔍 Fazendo introspection da API: ${this.credentials.url}`);
      
      const response = await axios.post(
        this.credentials.url,
        { query: INTROSPECTION_QUERY },
        { headers: this.credentials.headers }
      );

      if(response.data.errors){
        throw new Error(`GraphQL introspection failed: ${JSON.stringify(response.data.errors)}`);
      }

      this.schema = response.data.data.__schema;
    }catch (error){
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to GraphQL API: ${errorMessage}`);
    }
  }

  //descobre todos os tipos "list" disponíveis
  async getAvailableListQueries(): Promise<string[]> {
    if(!this.schema){
      await this.loadSchema();
    }

    const queryFields = this.schema?.queryType.fields || [];
    return queryFields
      .filter((field) => field.name.startsWith('list'))
      .map((field) => field.name);
  }

  //extrai os campos de um tipo específico
  private extractFields(typeName: string, visited = new Set<string>()): GraphQLField[] {
    if(!this.schema || visited.has(typeName)) return [];
    visited.add(typeName);

    const type = this.schema.types.find((t) => t.name === typeName);
    if(!type || !type.fields) return [];

    return type.fields
      .filter((field) => {
        //filtra campos que não são internos do GraphQL
        return !field.name.startsWith('__');
      })
      .map((field) => {
        const fieldType = this.getFieldType(field.type);
        const result: GraphQLField = {
          name: field.name,
          type: fieldType.name,
          isRequired: fieldType.isRequired,
          isArray: fieldType.isArray
        };

        //se for um tipo de objeto customizado, extrai seus campos aninhados
        if(fieldType.name && 
            !this.isScalarType(fieldType.name) && 
            !visited.has(fieldType.name)) {
          result.fields = this.extractFields(fieldType.name, new Set(visited));
        }

        return result;
      });
  }

  //processa o tipo de um campo (lidando com arrays, non-null, etc.)
  private getFieldType(type: GraphQLTypeRef): { name: string; isRequired: boolean; isArray: boolean } {
    let isRequired = false;
    let isArray = false;
    let typeName = '';
    let currentType = type;

    if(currentType.kind === 'NON_NULL'){
      isRequired = true;
      currentType = currentType.ofType!;
    }

    if(currentType.kind === 'LIST'){
      isArray = true;
      currentType = currentType.ofType!;
      if(currentType.kind === 'NON_NULL'){
        currentType = currentType.ofType!;
      }
    }

    typeName = currentType.name || currentType.kind;

    return { name: typeName, isRequired, isArray };
  }

  //verifica se é um tipo escalar (String, Int, Boolean, etc.)
  private isScalarType(typeName: string): boolean {
    const scalarTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'];
    return scalarTypes.includes(typeName);
  }

  //obtém os campos para uma query específica (ex: listInvoices)
  async getFieldsForQuery(queryName: string): Promise<GraphQLField[]> {
    if(!this.schema){
      await this.loadSchema();
    }

    const queryField = this.schema!.queryType.fields.find((f) => f.name === queryName);
    if(!queryField){
      throw new Error(`Query '${queryName}' not found in GraphQL schema`);
    }

    //extrai o tipo de retorno da query
    let returnType = queryField.type;
    if(returnType.kind === 'NON_NULL'){
      returnType = returnType.ofType!;
    }

    //procura pelo campo 'data' dentro do tipo de retorno (padrão para paginação)
    const typeDefinition = this.schema!.types.find((t) => t.name === returnType.name);
    if(typeDefinition && typeDefinition.fields){
      const dataField = typeDefinition.fields.find((f) => f.name === 'data');
      if(dataField){
        let dataType = dataField.type;
        if(dataType.kind === 'LIST'){
          dataType = dataType.ofType!;
          if(dataType.kind === 'NON_NULL'){
            dataType = dataType.ofType!;
          }
        }
        if(dataType.name){
          return this.extractFields(dataType.name);
        }
      }
    }

    if(returnType.name){
      return this.extractFields(returnType.name);
    }

    return [];
  }
}