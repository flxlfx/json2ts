# JSON to TypeScript Converter

Conversor de JSON para TypeScript que gera interfaces ou types a partir de dados JSON.

## Instalação

```bash
npm install
```

## Uso

### CLI

```bash
# Converter arquivo JSON
node json-to-ts.js data.json

# Converter string JSON
node json-to-ts.js '{"name": "João", "age": 30}'

# Com opções
node json-to-ts.js --root-name User --output types.ts user.json
```

### Opções CLI

- `--root-name <nome>`: Nome da interface/tipo raiz (padrão: "RootObject")
- `--use-types`: Usar type ao invés de interface
- `--no-export`: Não adicionar export nas definições
- `--optional`: Tornar todos os campos opcionais
- `--output <arquivo>`: Salvar resultado em arquivo

### Uso Programático

```javascript
const { convertJsonToTs } = require("./json-to-ts");

const json = {
  name: "João",
  age: 30,
  hobbies: ["leitura", "programação"],
};

const types = convertJsonToTs(json, {
  rootName: "User",
  exportTypes: true,
});

console.log(types);
```

## Funcionalidades

- Conversão de JSON para interfaces TypeScript
- Suporte a tipos e interfaces
- Campos opcionais
- Exportação automática
- Uso via CLI ou módulo
- Validação de identificadores
