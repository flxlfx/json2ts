#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

class JsonToTypeScript {
  constructor(options = {}) {
    this.options = {
      rootName: options.rootName || "RootObject",
      useInterfaces: options.useInterfaces !== false,
      exportTypes: options.exportTypes !== false,
      optionalFields: options.optionalFields || false,
      ...options,
    };
  }

  // Função principal para converter JSON para TypeScript
  convert(jsonInput) {
    let jsonData;

    // Parse do JSON se for string
    try {
      jsonData =
        typeof jsonInput === "string" ? JSON.parse(jsonInput) : jsonInput;
    } catch (error) {
      throw new Error(`JSON inválido: ${error.message}`);
    }

    const interfaces = new Map();
    const rootType = this.generateType(
      jsonData,
      this.options.rootName,
      interfaces
    );

    // Gera o código TypeScript
    let result = "";

    // Adiciona todas as interfaces geradas
    for (const [name, definition] of interfaces) {
      const exportKeyword = this.options.exportTypes ? "export " : "";
      const typeKeyword = this.options.useInterfaces ? "interface" : "type";

      if (this.options.useInterfaces) {
        result += `${exportKeyword}${typeKeyword} ${name} ${definition}\n\n`;
      } else {
        result += `${exportKeyword}${typeKeyword} ${name} = ${definition};\n\n`;
      }
    }

    return result.trim();
  }

  // Gera o tipo TypeScript baseado no valor
  generateType(value, typeName, interfaces) {
    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "any[]";
      }

      const itemType = this.generateType(
        value[0],
        `${typeName}Item`,
        interfaces
      );
      return `${itemType}[]`;
    }

    if (typeof value === "object") {
      const properties = [];

      for (const [key, val] of Object.entries(value)) {
        const propertyType = this.generateType(
          val,
          this.capitalize(key),
          interfaces
        );
        const optional = this.options.optionalFields ? "?" : "";
        const safeKey = this.isValidIdentifier(key) ? key : `"${key}"`;
        properties.push(`  ${safeKey}${optional}: ${propertyType};`);
      }

      const interfaceDefinition = `{\n${properties.join("\n")}\n}`;
      interfaces.set(typeName, interfaceDefinition);

      return typeName;
    }

    // Tipos primitivos
    return this.getPrimitiveType(value);
  }

  // Retorna o tipo primitivo TypeScript
  getPrimitiveType(value) {
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    return "any";
  }

  // Capitaliza a primeira letra
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Verifica se é um identificador válido
  isValidIdentifier(str) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
  }
}

// Função para uso em linha de comando
function cli() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Uso: node json-to-ts.js [opções] <arquivo-json | json-string>

Opções:
  --root-name <nome>     Nome da interface/tipo raiz (padrão: "RootObject")
  --use-types           Usar type ao invés de interface
  --no-export           Não adicionar export nas definições
  --optional            Tornar todos os campos opcionais
  --output <arquivo>    Salvar resultado em arquivo
  
Exemplos:
  node json-to-ts.js data.json
  node json-to-ts.js '{"name": "João", "age": 30}'
  node json-to-ts.js --root-name User --output types.ts user.json
    `);
    return;
  }

  const options = {};
  let inputFile = null;
  let outputFile = null;
  let jsonString = null;

  // Parse dos argumentos
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--root-name":
        options.rootName = args[++i];
        break;
      case "--use-types":
        options.useInterfaces = false;
        break;
      case "--no-export":
        options.exportTypes = false;
        break;
      case "--optional":
        options.optionalFields = true;
        break;
      case "--output":
        outputFile = args[++i];
        break;
      default:
        if (!arg.startsWith("--")) {
          if (fs.existsSync(arg)) {
            inputFile = arg;
          } else {
            jsonString = arg;
          }
        }
    }
  }

  try {
    const converter = new JsonToTypeScript(options);
    let jsonData;

    // Lê o input
    if (inputFile) {
      const content = fs.readFileSync(inputFile, "utf8");
      jsonData = content;
    } else if (jsonString) {
      jsonData = jsonString;
    } else {
      throw new Error("Nenhum input fornecido");
    }

    // Converte
    const result = converter.convert(jsonData);

    // Output
    if (outputFile) {
      fs.writeFileSync(outputFile, result);
      console.log(`✅ Tipos TypeScript gerados em: ${outputFile}`);
    } else {
      console.log(result);
    }
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

// Função para uso programático em React/Node
function convertJsonToTs(json, options = {}) {
  const converter = new JsonToTypeScript(options);
  return converter.convert(json);
}

// Se executado diretamente
if (require.main === module) {
  cli();
}

// Exporta para uso como módulo
module.exports = {
  JsonToTypeScript,
  convertJsonToTs,
  cli,
};

// Exemplo de uso programático:
/*
const { convertJsonToTs } = require('./json-to-ts');

const json = {
  name: "João",
  age: 30,
  hobbies: ["leitura", "programação"],
  address: {
    street: "Rua A",
    number: 123
  }
};

const types = convertJsonToTs(json, {
  rootName: 'User',
  exportTypes: true
});

console.log(types);
*/
