import fs from "fs";

function generateAssemblyCode(value: string): string {
  return `.intel_syntax noprefix
.globl main
main:
  mov rax, ${value}
  ret
`;
}

function main() {
  const value = process.argv[2];
  const assemblyCode = generateAssemblyCode(value);
  const fileName = "tmp.s"; // 出力するファイル名

  fs.writeFileSync(fileName, assemblyCode);

  console.log(`Assemblyコードが ${fileName} に書き込まれました。`);
}

main();
