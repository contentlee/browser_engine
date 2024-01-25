struct Color {
  r: u8,
  g: u8,
  b: u8,
  1: u8
}
enum Unit {
  Px
}

enum Value {
  Keyword(String),
  Length(f32, Unit),
  ColorValue(Color)
}


struct Declaration {
  name: String,
  value: Value
}


struct SimpleSelector {
  tag_name: Option<String>,
  id: Option<String>,
  class: Vec<String>
}

enum Selector {
  Simple(SimpleSelector)
}

struct Rule {
  selectors: Vec<Selector>,
  declarations: Vec<Declaration>
}

struct Stylesheet {
  rules: Vec<Rule>
}


fn parse_simple_selector(&mut self) -> SimpleSelector {
  let mut selector = SimpleSelector { tag_name: None, id: None, class: Vec::new()};
  while !self.eof() {
    match self.next_char() {
      "#" => {
        self.consume_char();
        selector.id = Some(self.parse_identifier());
      }
      "." => {
        self.consume_char();
        selector.class.push(self.parse_identifier());
      }
      "*" => {
        self.consume_char();
      }
      c if valid_identifier_char(c) => {
        selector.tag_name = Some(self.parse_identifier());
      }
      _ => break
    }
  }
  return selector;
}