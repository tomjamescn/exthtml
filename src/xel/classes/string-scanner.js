
// @copyright
//   © 2016-2017 Jarosław Foksa

"use strict";

{
  class StringScanner {
    // @type
    //   (string) => void
    constructor(text) {
      this.text = text;

      this.cursor = 0;
      this.line = 1;
      this.column = 1;

      this._storedPosition = {cursor: 0, line: 1, column: 1};
    }

    // @info
    //   Read given number of chars.
    // @type
    //   (number) => string?
    read(i = 1) {
      let string = "";
      let initialCursor = this.cursor;

      for (let j = 0; j < i; j += 1) {
        let c = this.text[initialCursor + j];

        if (c === undefined) {
          break;
        }
        else {
          string += c;
          this.cursor += 1;

          if (c === "\n"){
            this.line += 1;
            this.column = 1;
          }
          else {
            this.column += 1;
          }
        }
      }

      return (string === "" ? null : string);
    }

    // @info
    //   Read given number of chars without advancing the cursor.
    // @type
    //   (number) => string?
    peek(i = 1) {
      let string = "";

      for (let j = 0; j < i; j += 1) {
        let c = this.text[this.cursor + j];

        if (c === undefined) {
          break;
        }
        else {
          string += c;
        }
      }

      return (string === "" ? null : string);
    }

    // @type
    //   () => void
    storePosition() {
      let {cursor, line, column} = this;
      this._storedPosition = {cursor, line, column};
    }

    // @type
    //   () => void
    restorePosition() {
      let {cursor, line, column} = this._storedPosition;

      this.cursor = cursor;
      this.line = line;
      this.column = column;
    }
  };

  Xel.classes.StringScanner = StringScanner;
}
