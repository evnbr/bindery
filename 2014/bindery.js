/*jshint laxcomma:true, multistr: true */

//
// B I N D E R Y . J S
//
// version 0.2
// Evan Brooks 2014
//
// Depends on a custom version of https://github.com/FremyCompany/css-regions-polyfill
//
// Developed through the course HTML Output,
// taught by John Caserta at RISD in Spring 2014.
//
// ----------------------------------------------



(function() {
  var Bindery = function() {

    this.isBound = false;

    // Allows user to add various passes
    // without worrying about all the outher stuff.
    var preBindFuncs = [];
    var postBindFuncs = [];

    // A beforeBind function receives as an argument
    // the DOM Node for the content flow and makes
    // whatever changes it wants
    this.beforeBind = function(preProc) {
      preBindFuncs.push(preProc);
    }

    // An afterBind function receives as an argument
    // both the DOM Node for each page in turn,
    // and a state object to keep track of what.
    // has been processed so far.
    //
    // afterBind functions change sizes/etc at
    // their own risk because the pages will not
    // reflow a second time.
    //
    this.afterBind = function(initialState, postProc) {
      postBindFuncs.push({
        func: postProc,
        state: initialState
      });
    }

    // 
    this.startBind = function() {

      stat.innerText = "Pre-processing";

      // First remove the stuff we don't want to print
      $("[data-remove-before-print]").remove();

      // Then preprocess various stuff
      for (var i = 0; i < preBindFuncs.length; i++) {
        preBindFuncs[i]();
      }

      // Remove global class
      document.documentElement.classList.remove("_notsplityet");

      // Hide button and mess with controls
      regionizer.style.display = "none";

      // Begin regionizing
      cssRegions.enablePolyfill();

    }

    this.bindComplete = function() {

      this.isBound = true;

      document.documentElement.classList.add("_bleed-enabled");
      document.body.classList.add("_regions-loaded");
      stat.innerHTML = "Book is ready";

      // Feed each page through all postBind functions...

      var pages = document.querySelectorAll(".page-inner");

      for (var i = 0; i < pages.length; i++) {
        for (var j = 0; j < postBindFuncs.length; j++) {
          postBindFuncs[j].func(pages[i], postBindFuncs[j].state);
        }
      }

      $(".toc [type=checkbox]").replaceWith("&#10005;"); // replaces checkboxes with X

      // Trim unused pages from the end
      trimRegions('content-flow');
    }

  }

  // Export Bindery object
  window.Bindery = new Bindery();
})();




// -------------------------

// TRIM
// --
// Trim extra pages that have no content

// From:
// http://docs.webplatform.org/wiki/apis/css-regions/NamedFlow/firstEmptyRegionIndex
// deletes any empty regions from the end of a flow:
function trimRegions(flowName) {
    var flow = document.getNamedFlows().namedItem(flowName);
    var index = flow.firstEmptyRegionIndex;
    var regions = flow.getRegions();
    console.info("Trimmed all pages after page " + index);

    if (index == -1) {
      console.error("Can't trim extra pages— No empty regions found. Maybe wait until page splitting is finished?");
      return(false); // no empty regions?
    }

    // remove first empty region and all thereafter:
    for (var i = index; i < regions.length; i++) {
        regions[i].parentNode.parentNode.removeChild(regions[i].parentNode);
    }
    // alert("Trimmed to " + index + " pages");
    return(true);
}
