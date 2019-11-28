import { TokenType, tokTypes } from 'acorn';

const tt = tokTypes;

const questionDot = new TokenType("?.");

// Inspired by https://github.com/babel/babel/blob/master/packages/babel-parser/src/parser/expression.js#L592

// Fill the charCodes usage from 'charcodes' for Babel code
const charCodes = {
  dot: 46,
  digit0: 48,
  digit9: 57,
  equalsTo: 61,
  questionMark: 63
};

/**
 * @param {typeof acorn.Parser} BaseParser
 */
function optionalChaining(BaseParser) {
  const Parser = class extends BaseParser {
    // from babel-parser: src/tokenizer/index.js
    readToken_question() {
      console.log('reading question mark...');
      // '?'
      // this.state -> this
      const next = this.input.charCodeAt(this.pos + 1);
      const next2 = this.input.charCodeAt(this.pos + 2);
      if (next === charCodes.questionMark) { // remove: && !this.inType
        //if (next2 === charCodes.equalsTo) {
        // '??='
        this.finishOp(tt.assign, 3);
        // }
        // TODO: Support nullish coalescing
        // else {
        //   // '??'
        //   this.finishOp(tt.nullishCoalescing, 2);
        // }
      } else if (
        next === charCodes.dot &&
        !(next2 >= charCodes.digit0 && next2 <= charCodes.digit9)
      ) {
        // '.' not followed by a number
        this.pos += 2;
        this.finishToken(this.questionDotToken);
      } else {
        ++this.pos;
        this.finishToken(tt.question);
      }
    }

    getTokenFromCode(code) {
      // 63: '?'
      if (code === charCodes.questionMark) {
        return this.readToken_question();
      }

      return super.getTokenFromCode(code);
    }

    parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow) {
      if (this.type == this.questionDotToken) {
        // TODO From Babel
        // state.optionalChainMember = true;

        if (noCalls && this.eat(tt.parenL)) {
          // TODO From Babel
          // state.stop = true;
          return base;
        }

        this.next();

        const node = this.startNodeAt(startPos, startLoc);

        if (this.eat(tt.bracketL)) {
          node.object = base;
          node.property = this.parseExpression();
          node.computed = true;
          node.optional = true;
          this.expect(tt.bracketR);
          return this.finishNode(node, "OptionalMemberExpression");
        } else if (this.eat(tt.parenL)) {
          node.callee = base;
          node.arguments = this.parseExprList(tt.parenR, this.options.ecmaVersion >= 8, false);
          node.optional = true;
          return this.finishNode(node, "OptionalCallExpression"); // finishCallExpression
        } else {
          node.object = base;
          node.property = this.parseIdent(true);
          node.computed = false;
          node.optional = true;

          // Fail on tail position template strings...
          if (this.eat(tt.backQuote)) {
            const errorPos = this.start;
            // @ts-ignore
            this.raise(errorPos, "Template strings cannot be the tail of optional chaining.");
            return base;
          }

          return this.finishNode(node, "OptionalMemberExpression");
        }
      } else {
        return super.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow)
      }
    }
  };
  // @ts-ignore
  Parser.prototype.questionDotToken = questionDot;
  return Parser;
}

export default optionalChaining;
