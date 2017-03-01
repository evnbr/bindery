export default {
  beforeAdd: (elmt, state) => {
    if (state.currentPage.flowContent.innerText !== "") {
      state.currentPage = state.getNewPage();
      state.currentPage.setPreference("right");
    }
  },
}
