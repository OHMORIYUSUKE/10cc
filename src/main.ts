import fs from "fs";

function generateAssemblyCode(expression: string): string {
  const terms: string[] = [];
  const operators: string[] = [];
  let currentTerm = "";

  for (let i = 0; i < expression.length; i++) {
    if (expression[i] === "+" || expression[i] === "-") {
      terms.push(currentTerm);
      operators.push(expression[i]);
      currentTerm = "";
    } else {
      currentTerm += expression[i];
    }
  }
  terms.push(currentTerm);

  let assemblyCode = `.intel_syntax noprefix
.globl main
main:
  mov rax, ${parseInt(terms[0])}\n`;

  for (let i = 0; i < operators.length; i++) {
    const termValue = parseInt(terms[i + 1]);
    const operator = operators[i];

    if (operator === "+") {
      assemblyCode += `  add rax, ${termValue}\n`;
    } else if (operator === "-") {
      assemblyCode += `  sub rax, ${termValue}\n`;
    }
  }

  assemblyCode += `  ret
`;

  return assemblyCode;
}

function main() {
  const expression = process.argv[2];

  if (!expression) {
    console.error("式を引数として指定してください");
    return;
  }

  const assemblyCode = generateAssemblyCode(expression);
  const fileName = "tmp.s";

  fs.writeFileSync(fileName, assemblyCode);

  console.log(`Assemblyコードが ${fileName} に書き込まれました。`);
}

main();
