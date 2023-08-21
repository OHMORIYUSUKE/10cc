import * as fs from "fs";

// トークンの種類を定義
enum TokenKind {
  TK_RESERVED, // 記号
  TK_NUM, // 整数トークン
  TK_EOF, // 入力の終わりを表すトークン
}

class Token {
  kind: TokenKind; // トークンの種類
  next: Token | null; // 次の入力トークン
  val: number; // TK_NUMの場合の値
  str: string; // トークン文字列

  constructor(kind: TokenKind, str: string) {
    this.kind = kind;
    this.next = null;
    this.val = 0;
    this.str = str;
  }
}

// 現在着目しているトークン
let token: Token | null = null;

// エラーを報告する関数
function error(fmt: string, ...args: any[]): never {
  console.error(fmt, ...args);
  process.exit(1);
}

// 次のトークンが期待している記号なら消費し、trueを返す
function consume(op: string): boolean {
  if (token?.kind !== TokenKind.TK_RESERVED || token.str[0] !== op) {
    return false;
  }
  token = token.next;
  return true;
}

// 次のトークンが期待している記号でなければエラー
function expect(op: string): void {
  if (token?.kind !== TokenKind.TK_RESERVED || token.str[0] !== op) {
    error(`'${op}'ではありません`);
  }
  token = token.next;
}

// 次のトークンが数値なら消費してその値を返す
function expect_number(): number {
  if (token?.kind !== TokenKind.TK_NUM) {
    error("数ではありません");
  }
  const val = token.val;
  token = token.next;
  return val;
}

// 現在のトークンが入力の終わりかどうかを確認
function at_eof(): boolean {
  return token?.kind === TokenKind.TK_EOF;
}

// 空白文字を判定する関数
function isWhitespace(c: string): boolean {
  return c === " " || c === "\t" || c === "\n" || c === "\r";
}

// 数字を判定する関数
function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

// 新しいトークンを作成し、現在のトークンに繋げる
function new_token(kind: TokenKind, cur: Token, str: string): Token {
  const tok = new Token(kind, str);
  cur.next = tok;
  return tok;
}

// 入力文字列をトークナイズし、最初のトークンを返す
function tokenize(input: string): Token | null {
  const head = new Token(TokenKind.TK_RESERVED, "");
  let cur = head;
  let p = 0;

  while (p < input.length) {
    // 空白文字をスキップ
    if (isWhitespace(input[p])) {
      p++;
      continue;
    }

    if (input[p] === "+" || input[p] === "-") {
      cur = new_token(TokenKind.TK_RESERVED, cur, input[p++]);
      continue;
    }

    if (isDigit(input[p])) {
      const start = p;
      while (isDigit(input[p])) {
        p++;
      }
      cur = new_token(TokenKind.TK_NUM, cur, input.slice(start, p));
      cur.val = parseInt(cur.str, 10);
      continue;
    }

    error("トークナイズできません");
  }

  new_token(TokenKind.TK_EOF, cur, "");
  return head.next;
}

// メイン関数
function main() {
  if (process.argv.length !== 3) {
    error("引数の個数が正しくありません");
  }

  // 入力をトークナイズ
  token = tokenize(process.argv[2]);

  const outputLines: string[] = [];

  outputLines.push(".intel_syntax noprefix");
  outputLines.push(".globl main");
  outputLines.push("main:");

  // 最初のトークンは数である必要があるので、mov命令を出力
  outputLines.push(`  mov rax, ${expect_number()}`);
  // `+ <数>` または `- <数>` というトークンの並びを消費し、アセンブリを出力
  while (!at_eof()) {
    if (consume("+")) {
      outputLines.push(`  add rax, ${expect_number()}`);
      continue;
    }
    expect("-");
    outputLines.push(`  sub rax, ${expect_number()}`);
  }
  outputLines.push("  ret\n");

  // ファイルへの書き出し
  const outputFilePath = "tmp.s";
  fs.writeFileSync(outputFilePath, outputLines.join("\n"), "utf-8");
  console.log(`アセンブリコードが ${outputFilePath} に書き出されました。`);
}

main();
