import { GraphQLIntrospectionService, GraphQLField } from '../services/graphqlIntrospection';

export interface TableQueryOptions {
  includePagination?: boolean;
  includeFilters?: boolean;
  includeOrdering?: boolean;
  maxDepth?: number; //para controlar quantos níveis de campos aninhados incluir
  selectedFields?: string[]; //campos específicos para incluir (se não quiser todos)
}

export class GenericQueryGenerator {
  private introspectionService = new GraphQLIntrospectionService();

  //getter público para acessar o serviço de introspection
  get introspection(): GraphQLIntrospectionService {
    return this.introspectionService;
  }

  //gera uma query de tabela genérica para qualquer tipo
  async generateTableQuery(
    queryName: string, 
    options: TableQueryOptions = {}
  ): Promise<string> {
    const {
      includePagination = true,
      includeFilters = true,
      includeOrdering = true,
      maxDepth = 2,
      selectedFields
    } = options;

    //carrega o schema se necessário
    const fields = await this.introspectionService.getFieldsForQuery(queryName);
    
    //gera os campos da query
    const fieldString = this.generateFieldsString(fields, maxDepth, selectedFields);

    //gera os parâmetros da query
    const parameters = this.generateParameters(includePagination, includeFilters, includeOrdering);

    //gera os argumentos da query
    const args = this.generateArguments(includePagination, includeFilters, includeOrdering);

    //nome da query baseado no queryName
    const operationName = `table_${queryName}`;

    return `query ${operationName}(${parameters}) {
  table: ${queryName}(${args}) {
    data {
${fieldString}
    }${includePagination ? `
    totalCount
    totalPages
    currentPage
    pageSize` : ''}
  }
}`;
  }

  //gera uma string dos campos, respeitando a profundidade máxima
  private generateFieldsString(
    fields: GraphQLField[], 
    maxDepth: number, 
    selectedFields?: string[],
    currentDepth: number = 0,
    indent: string = '      '
  ): string {
    if (currentDepth >= maxDepth) return '';

    return fields
      .filter(field => {
        //se há campos selecionados, só inclui os que estão na lista
        if (selectedFields && selectedFields.length > 0) {
          return selectedFields.includes(field.name);
        }
        return true;
      })
      .map(field => {
        if(field.fields && field.fields.length > 0 && currentDepth < maxDepth - 1){
          //campo com subcampos (objeto aninhado)
          const subFields = this.generateFieldsString(
            field.fields, 
            maxDepth, 
            undefined, //não filtra subcampos por selectedFields
            currentDepth + 1, 
            indent + '  '
          );
          
          if(subFields.trim()){
            return `${indent}${field.name} {\n${subFields}\n${indent}}`;
          }else{
            //se não há subcampos válidos, comenta o campo
            return `${indent}# ${field.name} { ... }`;
          }
        }else{
          //campo simples (escalar)
          return `${indent}${field.name}`;
        }
      })
      .join('\n');
  }

  //gera os parâmetros da query (variáveis)
  private generateParameters(
    includePagination: boolean, 
    includeFilters: boolean, 
    includeOrdering: boolean
  ): string {
    const params: string[] = [];

    if(includePagination){
      params.push('$page: Int! = 1');
      params.push('$pageSize: Int! = 10');
    }

    if(includeFilters){
      params.push('$filters: [FlopFilters]!');
    }

    if(includeOrdering){
      params.push('$orderBy: [String]!');
      params.push('$orderDirections: [String]!');
    }

    return params.join('\n\t');
  }

  //gera os argumentos para a query
  private generateArguments(
    includePagination: boolean, 
    includeFilters: boolean, 
    includeOrdering: boolean
  ): string {
    const args: string[] = [];

    if(includePagination || includeFilters || includeOrdering){
      const paramsList: string[] = [];
      if(includePagination){
        paramsList.push('page: $page');
        paramsList.push('pageSize: $pageSize');
      }
      if(includeFilters){
        paramsList.push('filters: $filters');
      }
      if(includeOrdering){
        paramsList.push('orderBy: $orderBy');
        paramsList.push('orderDirections: $orderDirections');
      }

      const paramsString = paramsList.join('\n      ');
      args.push(`params: {\n      ${paramsString}\n    }`);
    }

    return args.join(', ');
  }

  //lista todas as queries "list" disponíveis na API
  async getAvailableQueries(): Promise<string[]> {
    return await this.introspectionService.getAvailableListQueries();
  }

  //gera query com campos específicos (útil para debugging ou customização)
  async generateCustomQuery(
    queryName: string,
    selectedFields: string[],
    options: Omit<TableQueryOptions, 'selectedFields'> = {}
  ): Promise<string> {
    return this.generateTableQuery(queryName, {
      ...options,
      selectedFields
    });
  }

  //gera query simples sem paginação/filtros (útil para dados de referência)
  async generateSimpleQuery(queryName: string, maxDepth: number = 1): Promise<string> {
    return this.generateTableQuery(queryName, {
      includePagination: false,
      includeFilters: false,
      includeOrdering: false,
      maxDepth
    });
  }
}