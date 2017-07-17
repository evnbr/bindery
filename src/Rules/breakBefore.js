import BinderyRule from "./BinderyRule";

class BreakBefore extends BinderyRule {
  constructor(options) {
    options.name = "Break Before";
    super(options)
  }
  beforeAdd(elmt, state) {
    if (state.currentPage.flowContent.innerText !== "") {
      state.currentPage = state.getNewPage();
      state.currentPage.setPreference("right");
    }
  }
}

export default function(userOptions) {
  return new BreakBefore(userOptions);
}
