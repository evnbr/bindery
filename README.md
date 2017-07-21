# Bindery.js

## About

bindery.js is a library for producing book layouts in the browser. The core library allows your HTML to flow over multiple pages, and provides an interface to preview and configure the resulting book. Bindery includes plugins that can express numbering, running headers, spreads, footnotes, tables of contents, and more. With just a couple lines of code, you can [convert URLs to footnotes](https://github.com/evnbr/bindery/tree/master/example), [generate fore-edge printing](https://github.com/evnbr/bindery/tree/master/example), [dynamic font sizes](https://github.com/evnbr/bindery/tree/master/example), [convert a video into a flipbook](https://github.com/evnbr/bindery/tree/master/example), and more.

## Getting started

```html
<html>
  <div class="content">
    <!-- The whole content of your book -->
  </div>

  <script src="./bindery.js"></script>
  <script>
    let binder = new Bindery({
      source: ".content",
      rules: [
        Bindery.BreakBefore({ selector: "h2" }),
        Bindery.RunningHeader({ selector: "h2" }),
        Bindery.PageNumber(),
      ],
    });

    binder.makeBook();
  </script>
</html>

```

## Docs

#### Setup Options
- **`source:`**
  - Which content to flow across pages.
  - If the content is on the same page, use a CSS selector. You can also use a reference to the node.
  - If the content must be fetched from a remote page, pass an object in the form of { url, selector}.
```js
// CSS selector
let binder = new Bindery({
  source: '#content',
});

// Node reference
let binder = new Bindery({
  source: document.getElementByID('content'),
});

// Fetch from a URL
let binder = new Bindery({
  source: {
    selector: '#content',
    url: '/posts.html',
  }
});
```

  
- **`pageUnit: `**
  - String representing units. Should be one of the following: `'px'`, `'pt'`, `'pc'`, `'in'`, `'cm'`, `'mm'`
  - Default: `'in'`
  
- **`pageSize:`**
  - Size of page, in pageUnits { width: Number, height: Number }
  - Default: `{ width: 4, height: 6 }`
  
- **`pageMargin:`**
  - Size of margins, in pageUnits { top: Number, inner: Number, outer: Number, bottom: Number }
  - Default:  `{  top: 0.25, inner: 0.25, outer: 0.25, bottom: 0.25, }`
  
 ```js
let binder = new Bindery({
  source: '#content',
  pageUnit: 'pt',
  pageSize: { height: 500, width: 350 },
  pageMargin: { top: 20, bottom: 40, inner: 20, outer: 30 },
});
```
 
  
- **`standalone:`**
  - Boolean. When this is set to true, bindery will run automatically and not show a Done button. This is useful if you want to locate the book at its own url, ie "example.com/book.html".
  - Default: false

- **`startingViewMode: `**
  - Should be one of the following:
    - `'grid'` - Default
    - `'interactive'` - Interactive 3D Book
    - `'print'` - Print preview, showing sheet with crop marks and bleed

- **`rules:`**
  - An array of Rules. Use Rules to set up a page based on what content ends up on it. 
  - Default: `[]` (No rules applied)

#### Rules

- BreakBefore
- Footnote
- FullPage
- Spread
- PageReference
- RunningHeader

#### Creating Custom Rules

TK

## Developing

Written in ES6, built with babel, bundled with webpack. The only dependency is [Hyperscript](https://github.com/hyperhype/hyperscript), for templating the UI, which is included in the bundle by default.

The goal of bindery.js is to provide an approachable jumping-off point for HTML-to-Print exploration. Because of this, it is intended to work out of the box as a script tag (without needing to run a dev server, set up a development environment, use preprocessors, or really know javascript at all).

- `npm run-script build` - Update build/bindery.js
- `npm run-script buildProd` - Update build/bindery.min.js
- `npm run-script lint:js` - Run ESLint, using the [Airbnb style guide](https://github.com/airbnb/javascript)

#### To Do

- [x] Page Number references (Tables of Contents, Indexes)
- [ ] More control over spreads, ordering, booklet printing
- [x] Customizable page sizing
- [ ] Examples for use with blogging platforms
- [ ] Wrapper for use with React.
- [ ] Approachable API for writing custom rules
- [ ] Documentation!

#### Background

bindery.js was originally written in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in "HTML Output" at RISD. It was based on the [now-abandoned](https://alistapart.com/blog/post/css-regions-considered-harmful) CSS Regions spec, [polyfill by Remy Francois](https://github.com/FremyCompany/css-regions-polyfill). With thanks to the contributions and feedback from [Catherine Leigh Schmidt](http://cath.land), [Lukas WinklerPrins](http://ltwp.net), and [John Caserta](http://johncaserta.com/).


