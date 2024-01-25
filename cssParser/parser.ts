/// CSS Parser Structure
interface SimpleSelector {
  tag_name: string;
  id: string;
  class_arr: string[];
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

type Unit = "px" | "em" | "rem";
type Keyword = string;
type Length = [number, Unit];
type ColorValue = Color;

type Value = Keyword | Length | ColorValue;

interface Declaration {
  name: string;
  value: Value;
}

interface Rule {
  selectors: SimpleSelector[];
  declarations: Declaration[];
}

interface Stylesheet {
  rules: Rule[];
}

type Specificity = [number, number, number];

class Selector implements SimpleSelector {
  tag_name: string;
  id: string;
  class_arr: string[];

  constructor({ tag_name, id, class_arr }: SimpleSelector) {
    this.tag_name = tag_name;
    this.id = id;
    this.class_arr = class_arr;
  }

  specificity(): Specificity {
    const simple = new Selector({ tag_name: "", id: "", class_arr: [] });
    const a = simple.id ? 0 : 100;
    const b = simple.class_arr.length * 10;
    const c = simple.tag_name ? 0 : 1;
    return [a, b, c];
  }
}

/// continue with htmlParser

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

/// Parser section
interface Parser {
  pos: number;
  input: string;
}

class Parser {
  constructor({ pos, input }: Parser) {
    this.pos = pos;
    this.input = input;
  }

  next_char(): string {
    return this.input[this.pos];
  }
  start_with(str: string): boolean {
    let cur = this.pos;
    return [...str].every((chr) => this.input[cur++] === chr);
  }

  eof(): boolean {
    return this.pos >= this.input.length;
  }

  consume_char(): string {
    const cur_char = this.input[this.pos];
    this.pos++;
    return cur_char;
  }

  consume_while(test: (char: string) => boolean): string {
    let result = "";
    while (!this.eof() && test(this.next_char())) {
      result += this.consume_char();
    }
    return result;
  }

  consume_whitespace() {
    this.consume_while((char) => char === " ");
  }

  parse_tag_name(): string {
    const regExp = /[a-zA-Z0-9]/;
    return this.consume_while((char) => regExp.test(char));
  }

  parse_text(): DomNode {
    return DomNode.text(this.consume_while((char) => char !== "<"));
  }

  parse_element(): DomNode {
    console.log(this.consume_char() === "<");
    const tag_name = this.parse_tag_name();
    const attrs = this.parse_attributes();
    console.log(this.consume_char() === ">");

    const children = this.parse_nodes();

    console.log(this.consume_char() === "<");
    console.log(this.consume_char() === "/");
    console.log(this.parse_tag_name() === tag_name);
    console.log(this.consume_char() === ">");

    return DomNode.elem(tag_name, attrs, children);
  }

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

  parse_node(): DomNode {
    return this.next_char() === "<" ? this.parse_element() : this.parse_text();
  }
  parse_nodes(): DomNode[] {
    const nodes: DomNode[] = [];
    while (true) {
      this.consume_whitespace();
      if (this.eof() || this.start_with("</")) break;
      nodes.push(this.parse_node());
    }
    return nodes;
  }

  /// CSS

  parse_identifier() {
    const regExp = /[a-zA-Z0-9]/;
    return this.consume_while((char) => regExp.test(char));
  }

  valid_identifier_char(c: string) {
    const regExp = /[a-zA-Z0-9]/;
    return regExp.test(c);
  }

  // Parse one simple selector
  parse_simple_selector(): Selector {
    const selector = new Selector({ tag_name: "", id: "", class_arr: [] });
    while (!this.eof()) {
      const char = this.next_char();
      switch (char) {
        case "#":
          this.consume_char();
          selector.id = this.parse_identifier();
          break;
        case ".":
          this.consume_char();
          selector.class_arr.push(this.parse_identifier());
          break;
        case "*":
          this.consume_char();
          break;
        default:
          if (this.valid_identifier_char(char)) {
            selector.tag_name = this.parse_identifier();
          }
          this.consume_whitespace();
          break;
      }
    }

    return selector;
  }

  parse_selectors(): Selector[] {
    const selectors: Selector[] = [];
    while (true) {
      const selector = this.parse_simple_selector();
      selectors.push(selector);
      this.consume_whitespace();

      const char = this.next_char();
      if (char === ",") {
        this.consume_char();
        this.consume_whitespace();
      } else if ("{") {
        break;
      } else {
        console.log(`Unexpected character ${char} in selector list`);
      }
    }
    selectors.sort((a, b) => {
      const sumA = a.specificity().reduce((acc, cur) => acc + cur, 0);
      const sumB = b.specificity().reduce((acc, cur) => acc + cur, 0);
      return sumA - sumB;
    });
    return selectors;
  }

  parse_declarations(): Declaration[] {
    return [];
  }

  parse_rule(): Rule {
    return { selectors: this.parse_selectors(), declarations: this.parse_declarations() };
  }
}

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
