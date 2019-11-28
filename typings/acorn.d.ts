// Document acorn's internal types.

declare module acorn {
  export interface Node {
    object;
    property;
    computed: boolean;
    optional: boolean;
    callee;
    arguments: any[];
  }

  export interface Parser {
    input: string;
    pos: number;
    start: number;
    type: TokenType;
    options: {
      ecmaVersion: number;
    };
    next();
    expect(token: TokenType);
    eat(token: TokenType);
    parseIdent(s: boolean);
    parseExpression();
    parseSubscript(
      base,
      startPos: number,
      startLoc: number,
      noCalls: boolean,
      maybeAsyncArrow
    );
    finishOp(token: TokenType, index: number);
    finishToken(token: TokenType);
    finishNode(node: Node, type: string);
    getTokenFromCode(code: number);
    startNodeAt(pos: number, loc: number): Node;
    parseExprList(
      close: TokenType,
      allowTrailingComma: boolean,
      allowEmpty: boolean,
      refDestructuringErrors?
    ): any[];
  }
}
