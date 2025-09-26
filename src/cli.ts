#!/usr/bin/env node

import { GenericQueryGenerator } from './generators/genericQueryGenerator';
import { GraphQLField } from './services/graphqlIntrospection';

const program = require('commander');

//interfaces para opções dos comandos
interface AnalyzeOptions {
  depth?: string;
  scalarsOnly?: boolean;
  format?: string;
}

interface GenerateOptions {
  simple?: boolean;
  depth?: string;
  fields?: string;
  pagination?: boolean;
  filters?: boolean;
  ordering?: boolean;
  output?: string;
}

program
  .version('2.0.0')
  .description('MCP GraphQL Query Generator CLI - Gerador genérico de queries GraphQL');

//comando para listar todas as queries disponíveis
program
  .command('list')
  .description('Lista todas as queries "list*" disponíveis na API GraphQL')
  .action(async () => {
    try{
      const generator = new GenericQueryGenerator();
      console.log('🔍 Descobrindo queries disponíveis...\n');
      
      const queries = await generator.getAvailableQueries();
      
      if(queries.length === 0){
        console.log('❌ Nenhuma query "list*" encontrada na API.');
        return;
      }

      console.log('✅ Queries disponíveis:\n');
      queries.forEach((query, index) => {
        console.log(`  ${index + 1}. ${query}`);
      });
      
      console.log(`\n📊 Total: ${queries.length} queries encontradas`);
      console.log('\n💡 Use: npx ts-node src/cli.ts generate <queryName> para gerar uma query');
    }catch (error){
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao listar queries:', errorMessage);
      process.exit(1);
    }
  });

//comando para analisar tipos de campos de uma query
program
  .command('analyze <queryName>')
  .description('Analisa e mostra os tipos de todos os campos de uma query específica')
  .option('-d, --depth <number>', 'Profundidade máxima para campos aninhados (padrão: 3)', '3')
  .option('-s, --scalars-only', 'Mostra apenas campos escalares (String, Int, etc.)')
  .option('-f, --format <format>', 'Formato de saída: table, json, csv (padrão: table)', 'table')
  .action(async (queryName: string, options: AnalyzeOptions) => {
    try{
      const generator = new GenericQueryGenerator();
      console.log(`🔍 Analisando tipos de campos para: ${queryName}\n`);
      
      const introspection = generator.introspection;
      const fields = await introspection.getFieldsForQuery(queryName);
      
      if(fields.length === 0){
        console.log('❌ Nenhum campo encontrado para esta query.');
        return;
      }

      if(options.format === 'json'){
        console.log(JSON.stringify(fields, null, 2));
        return;
      }

      console.log('📋 Tipos de campos identificados:\n');
      
      function printField(field: GraphQLField, indent = '', currentDepth = 0){
        if(currentDepth >= parseInt(options.depth || '3')) return;
        
        let typeInfo = `${field.type}`;
        if(field.isArray) typeInfo = `[${typeInfo}]`;
        if(field.isRequired) typeInfo = `${typeInfo}!`;
        
        //verifica se é escalar
        const isScalar = ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'].includes(field.type);
        
        //pula se só quer escalares e não é escalar
        if(options.scalarsOnly && !isScalar) return;
      
        console.log(`${indent}${field.name}: ${typeInfo}`);
        
        //mostra subcampos se existirem e não for só escalares
        if(field.fields && field.fields.length > 0 && !options.scalarsOnly){
          console.log(`${indent}  ├─ Subcampos (${field.fields.length}):`);
          field.fields.forEach((subField: GraphQLField, index: number) => {
            const isLast = index === field.fields!.length - 1;
            const newIndent = indent + (isLast ? '  └─ ' : '  ├─ ');
            printField(subField, newIndent, currentDepth + 1);
          });
        }
      }
      
      fields.forEach((field: GraphQLField) => printField(field));
      
      const scalarCount = countScalars(fields);
      const objectCount = fields.length - scalarCount;
      
      console.log(`\n📊 Resumo:`);
      console.log(`   • Total de campos: ${fields.length}`);
      console.log(`   • Campos escalares: ${scalarCount}`);
      console.log(`   • Objetos complexos: ${objectCount}`);
      
      if(options.format === 'csv'){
        console.log(`\n📄 Formato CSV:`);
        console.log('nome,tipo,obrigatorio,array,escalar');
        fields.forEach((field: GraphQLField) => {
          const isScalar = ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'].includes(field.type);
          console.log(`${field.name},${field.type},${field.isRequired},${field.isArray},${isScalar}`);
        });
      }
      
    }catch (error){
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao analisar query:', errorMessage);
      process.exit(1);
    }
  });

function countScalars(fields: GraphQLField[]): number {
  return fields.filter(field => 
    ['String', 'Int', 'Float', 'Boolean', 'ID', 'DateTime', 'Date'].includes(field.type)
  ).length;
}

//comando principal para gerar queries de tabela
program
  .command('generate <queryName>')
  .description('Gera uma query de tabela completa para o tipo especificado')
  .option('-s, --simple', 'Gera query simples sem paginação/filtros')
  .option('-d, --depth <number>', 'Profundidade máxima para campos aninhados (padrão: 2)', '2')
  .option('-f, --fields <fields>', 'Lista de campos específicos (separados por vírgula)')
  .option('--no-pagination', 'Remove paginação da query')
  .option('--no-filters', 'Remove filtros da query')
  .option('--no-ordering', 'Remove ordenação da query')
  .action(async (queryName: string, options: GenerateOptions) => {
    try{
      const generator = new GenericQueryGenerator();
      
      console.log(`🔧 Gerando query para: ${queryName}\n`);

      let query: string;
      
      if(options.simple){
        query = await generator.generateSimpleQuery(queryName, parseInt(options.depth || '2'));
        console.log('📋 Query simples gerada:\n');
      }else if(options.fields){
        const selectedFields = options.fields.split(',').map((f: string) => f.trim());
        query = await generator.generateCustomQuery(queryName, selectedFields, {
          includePagination: options.pagination !== false,
          includeFilters: options.filters !== false,
          includeOrdering: options.ordering !== false,
          maxDepth: parseInt(options.depth || '2')
        });
        console.log(`📋 Query customizada gerada (campos: ${selectedFields.join(', ')}):\n`);
      }else{
        query = await generator.generateTableQuery(queryName, {
          includePagination: options.pagination !== false,
          includeFilters: options.filters !== false,
          includeOrdering: options.ordering !== false,
          maxDepth: parseInt(options.depth || '2')
        });
        console.log('📋 Query de tabela completa gerada:\n');
      }

      //exibe a query com syntax highlighting básico
      console.log('```graphql');
      console.log(query);
      console.log('```\n');

      console.log('✅ Query gerada com sucesso!');
      console.log('📋 Copie e cole no seu cliente GraphQL (Insomnia, Postman, etc.)');
      
    }catch (error){
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erro ao gerar query para "${queryName}":`, errorMessage);
      
      if(errorMessage.includes('not found')){
        console.log('\n💡 Dica: Use "npx ts-node src/cli.ts list" para ver queries disponíveis');
      }
      
      process.exit(1);
    }
  });

//comando para testar conexão com a API
program
  .command('test')
  .description('Testa a conexão com a API GraphQL')
  .action(async () => {
    try{
      const generator = new GenericQueryGenerator();
      console.log('🔗 Testando conexão com a API GraphQL...\n');
      
      const queries = await generator.getAvailableQueries();
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log(`📊 Encontradas ${queries.length} queries "list*" disponíveis`);
      
    }catch (error){
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Falha na conexão:', errorMessage);
      console.log('\n🔧 Verifique:');
      console.log('  1. Se as variáveis de ambiente estão configuradas (.env)');
      console.log('  2. Se a URL da API está correta');
      console.log('  3. Se as credenciais são válidas');
      console.log('  4. Se a API está online e acessível');
      process.exit(1);
    }
  });

//comando de ajuda interativo
program
  .command('help-examples')
  .description('Mostra exemplos de uso do CLI')
  .action(() => {
    console.log('📚 MCP GraphQL Query Generator - Exemplos de Uso\n');
    
    console.log('🔍 Listar queries disponíveis:');
    console.log('  npx ts-node src/cli.ts list\n');
    
    console.log('📋 Gerar query de tabela completa:');
    console.log('  npx ts-node src/cli.ts generate listInvoices\n');
    
    console.log('🎯 Gerar query com campos específicos:');
    console.log('  npx ts-node src/cli.ts generate listInvoices --fields "id,status,number,issueDate"\n');
    
    console.log('🚀 Gerar query simples (sem paginação):');
    console.log('  npx ts-node src/cli.ts generate listInvoices --simple\n');
    
    console.log('⚙️ Gerar query sem filtros:');
    console.log('  npx ts-node src/cli.ts generate listInvoices --no-filters\n');
    
    console.log('🔧 Controlar profundidade de campos aninhados:');
    console.log('  npx ts-node src/cli.ts generate listInvoices --depth 1\n');
    
    console.log('🔗 Testar conexão:');
    console.log('  npx ts-node src/cli.ts test\n');
  });

//se nenhum comando for fornecido, mostra ajuda
if(process.argv.length <= 2){
  program.outputHelp();
}

program.parse(process.argv);