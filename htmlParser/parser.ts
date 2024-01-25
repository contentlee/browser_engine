// data structure for the DOM

// HTML has its own unique parsing algorithm.
// does not reject invalid input => display every web page, even ones that don't conform to the syntax rules.

type AttrMap = Map<string, string>;
interface ElementData {
  tag_name: string;
  attributes: AttrMap;
}

type NodeType = string | ElementData;
interface DomNode {
  children?: DomNode[];
  node_type: NodeType;
}

class DomNode {
  constructor({ children, node_type }: DomNode) {
    this.children = children;
    this.node_type = node_type;
  }
  static text(data: string): DomNode {
    return new DomNode({ node_type: data } as DomNode);
  }

  static elem(name: string, attrs: AttrMap, children: DomNode[]): DomNode {
    return new DomNode({
      children,
      node_type: {
        tag_name: name,
        attributes: attrs,
      },
    } as DomNode);
  }
}

interface Parser {
  pos: number;
  input: string;
}

class Parser {
  constructor({ pos, input }: Parser) {
    this.pos = pos;
    this.input = input;
  }

  // Read the current character without consuming it.
  next_char(): string {
    return this.input[this.pos];
  }
  // Do the next characters start with the given string?
  start_with(str: string): boolean {
    let cur = this.pos;
    return [...str].every((chr) => this.input[cur++] === chr);
  }

  // Return true if all input is consumed.
  eof(): boolean {
    return this.pos >= this.input.length;
  }

  // Return the current character, and advance self.pos to the next character.
  consume_char(): string {
    const cur_char = this.input[this.pos];
    this.pos++;
    return cur_char;
  }

  // Consume characters until `test` returns false.
  consume_while(test: (char: string) => boolean): string {
    let result = "";
    while (!this.eof() && test(this.next_char())) {
      result += this.consume_char();
    }
    return result;
  }

  // Consume and discard zero or more whitespace characters.
  consume_whitespace() {
    this.consume_while((char) => char === " ");
  }

  // Parse a tag or attribute name.
  parse_tag_name(): string {
    const regExp = /[a-zA-Z0-9]/;
    return this.consume_while((char) => regExp.test(char));
  }

  // Parse a text node.
  parse_text(): DomNode {
    return DomNode.text(this.consume_while((char) => char !== "<"));
  }

  // Parse a single element, including its open tag, contents, and closing tag.
  parse_element(): DomNode {
    // Opening tag
    console.log(this.consume_char() === "<");
    const tag_name = this.parse_tag_name();
    const attrs = this.parse_attributes();
    console.log(this.consume_char() === ">");

    // Contents
    const children = this.parse_nodes();

    // Closing tag
    console.log(this.consume_char() === "<");
    console.log(this.consume_char() === "/");
    console.log(this.parse_tag_name() === tag_name);
    console.log(this.consume_char() === ">");

    return DomNode.elem(tag_name, attrs, children);
  }

  // Parse a single name="value" pair.
  parse_attr(): [string, string] {
    const name = this.parse_tag_name();
    console.log(this.consume_char() === "=");
    const value = this.parse_attr_value();
    return [name, value];
  }

  parse_attr_value(): string {
    const open_quote = this.consume_char();
    console.log(open_quote === '"' || open_quote === "'");
    const value = this.consume_while((char) => char !== open_quote);
    console.log(this.consume_char() === open_quote);
    return value;
  }

  // Parse a list of name="value" pairs, separated by whitespace.
  parse_attributes(): AttrMap {
    const attributes = new Map();
    while (true) {
      this.consume_whitespace();
      if (this.next_char() === ">") break;
      const [name, value] = this.parse_attr();
      attributes.set(name, value);
    }
    return attributes;
  }

  // Parse a single node.
  parse_node(): DomNode {
    return this.next_char() === "<" ? this.parse_element() : this.parse_text();
  }
  // Parse a sequence of sibling nodes.
  parse_nodes(): DomNode[] {
    const nodes: DomNode[] = [];
    while (true) {
      this.consume_whitespace();
      if (this.eof() || this.start_with("</")) break;
      nodes.push(this.parse_node());
    }
    return nodes;
  }
}

// Parse an HTML document and return the root element.
const parse = (source: string): DomNode => {
  const parser = new Parser({ pos: 0, input: source } as Parser);
  const nodes = parser.parse_nodes();

  if (nodes.length === 1) {
    return nodes[0];
  } else {
    return DomNode.elem("html", new Map(), nodes);
  }
};

console.log(parse("<html><body>Hello, world!</body></html>"));

export default Parser;
// class Node {
//   children = null;
//   nodeType;

//   constructor({ children, nodeDetail }) {
//     this.children = children;
//     this.nodeDatail = detail;
//   }
// }

// class Element {
//   tagName;
//   attributes = {};

//   constructor({ tagName, attributes }) {
//     this.tagName = tagName;
//     this.attributes = attributes;
//   }
// }

// function createText(data) {
//   return new Node({ children: [], nodeDatail: data });
// }

// function createElement(name, attrs, children) {
//   return new Node({ children, nodeDetail: new Element({ tagName: name, attributes: attrs }) });
// }

// class HTMLParese {
//   constructor(input, position) {
//     this.input = input;
//     this.position = position;
//   }

//   getCharacter() {
//     return this.input[this.position];
//   }

//   isStartWith(str) {
//     const characterArray = Array.from(str);
//     let cur = this.position;
//     return characterArray.every((c) => this.input[cur++] === c);
//   }

//   isEndOfInput() {
//     return this.position >= this.input.length;
//   }

//   makeInputIterator = function* (input, start = 0) {
//     for (let i = start; i < input.length; i++) {
//       yield [i, input[i]];
//     }
//   };

//   consumeCharacter() {
//     const inputIterator = this.makeInputIterator(this.input, this.position);
//     const [_, currentCharacter] = inputIterator.next().value;
//     this.position++;
//     return currentCharacter;
//   }

//   consumeWhile(fn) {
//     let result = "";
//     while (!this.isEndOfInput() && fn(this.getCharacter())) {
//       result += this.consumeCharacter();
//     }
//     return result;
//   }

//   consumeWhitespace() {
//     this.consumeWhile(function (character) {
//       return character === " " ? true : false;
//     });
//   }

//   parse() {
//     const nodes = this.parseNodes();
//     return nodes.length === 1 ? nodes.pop() : createElement("html", {}, nodes);
//   }

//   parseNodes() {
//     let nodes = [];

//     while (true) {
//       this.consumeWhitespace();
//       if (this.isEndOfInput() || this.isStartWith("</")) break;
//       nodes.push(this.parseNodes());
//     }

//     return nodes;
//   }

//   parseNode() {
//     if (this.getCharacter() === "<") return this.parseElement();
//     return this.parseText();
//   }

//   parseElement() {
//     assert(this.consumeCharacter() === "<", "character is not <");
//     const tagName = this.parseName();
//     const attributes = this.parseAttributes();

//     assert(this.consumeCharacter() === ">", "character is not >");

//     const children = this.parseNodes();

//     assert(this.consumeCharacter() === "<", "character is not <");
//     assert(this.consumeCharacter() === "/", "character is not /");
//     assert(this.parseName() === tagName, "There is no tag name in closing tag");
//     assert(this.consumeCharacter() === ">", "character is not >");

//     return createElement(tagName, attributes, children);
//   }

//   parseName() {
//     return this.consumeWhile(function (chr) {
//       if (
//         numberCharacters.indexOf(chr) !== -1 ||
//         lowerAlphabet.indexOf(chr) === -1 ||
//         upperAlphabet.indexOf(chr) === -1
//       )
//         return true;
//       return false;
//     });
//   }

//   parseAttributes() {
//     let attributes = {};
//     while (true) {
//       this.consumeWhitespace();
//       if (this.getCharacter() === ">") break;
//       const { name, value } = this.parseAttr();
//       attributes[name] = value;
//     }
//     return attributes;
//   }

//   parseAttr() {
//     const name = this.parseName();
//     assert(this.consumeCharacter() === "=", "there is no '='");

//     const value = this.parseAttrValue();

//     return { name, value };
//   }

//   parseAttrValue() {
//     const quote = this.consumeCharacter();
//     assert(quote === '""', "open quote error");

//     const value = this.consumeWhile(function (chr) {
//       return chr !== quote ? true : false;
//     });
//     assert(this.consumeCharacter() === quote, "close quote error");
//     return value;
//   }

//   parseText() {
//     return createText(
//       this.consumeWhile(function (chr) {
//         return character !== "<" ? true : false;
//       })
//     );
//   }
// }
