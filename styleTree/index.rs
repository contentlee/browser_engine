type PropertyMap = HashMap<String, Value>;

struct StyledNode<'a> {
  node: &'a Node,
  specified_values: PropertyMap,
  children: Vec<StyledNode<'a>>,
}

fn matches (elem: &ElementData, selector: &Selector) -> bool {
  match *selector {
    Simple(ref simple_selector) => matches_simple_selector(elem, simple_selector)
  }
}

impl ElementData {
  pub fn id(&self) -> Option<&String> {
    self.attributes.get("id")
  }

  pub fn classes(&self) -> HashSet<&str> {
    match self.attributes.get("class") {
      Some(classlist) => classlist.split(" ").collect(),
      None => HashSet::new()
    }
  }
}

fn matches_simple_selector(elem: &ElementData, selector: &SimpleSelector) -> bool {

  if selector.tag_name.iter().any(|name| elem.tag_name != *name) {
    return false;
  }

  if selector.id.iter().any(|id| elem.id() != Some(id)) {
    return false
  }

  let elem_classes = elem.classes();
  if selector.class.iter().any(|class| !elem_classes.contains(&**class)) {
    return false
  }

  return true

}