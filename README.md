## Bindery.js - [Docs](http://evanbrooks.info/bindery/)

### About

bindery.js is a library for producing book layouts in the browser. The core library allows your HTML to flow over multiple pages, and provides an interface to preview and configure the resulting book. Bindery includes plugins that can express numbering, running headers, spreads, footnotes, tables of contents, and more. With just a couple lines of code, you can [convert URLs to footnotes](https://github.com/evnbr/bindery/tree/master/example), [generate fore-edge printing](https://github.com/evnbr/bindery/tree/master/example), [dynamic font sizes](https://github.com/evnbr/bindery/tree/master/example), [convert a video into a flipbook](https://github.com/evnbr/bindery/tree/master/example), and more.

### Getting Started

```html
<html>
  <div class="content">
    <!-- The whole content of your book -->
  </div>

  <script src="./bindery.min.js"></script>
  <script>
    Bindery.makeBook({ source: ".content" });
  </script>
</html>
```

### Using Rules

```html
<html>
  <div class="content">
    <!-- The whole content of your book -->
  </div>

  <script src="./bindery.min.js"></script>
  <script>
    Bindery.makeBook({
      source: ".content",
      rules: [
        Bindery.PageBreak({ selector: 'h2', position: 'before', continue: 'right' }),
        Bindery.RunningHeader({ beginSection: 'h2' }),
        Bindery.Footnote({
          selector: 'p > a',
          render: function(element, number) {
            let href = element.getAttribute('href');
            return `<sup>${number}</sup> Link to ${href}`;
          },
        }),
      ],
    });
  </script>
</html>

```


### Developing

Written in ES6, transpiled with babel, bundled with webpack. The only dependency is [Hyperscript](https://github.com/hyperhype/hyperscript), for templating the UI, which is included in the bundle by default.

When contributing, keep the following in mind: The goal of bindery.js is to provide an approachable jumping-off point for HTML-to-Print exploration. Because of this, it is intended to work out of the box as a script tag (without needing to run a dev server, set up a development environment, use preprocessors, or really know javascript at all).

- `npm run-script build` - Webpack —> build/bindery.js
- `npm run-script minify` - Webpack —> build/bindery.min.js
- `npm run-script lint` - ESLints, using the [Airbnb style guide](https://github.com/airbnb/javascript)

#### To Do

- [ ] Test Coverage
- [ ] Page Number references (Tables of Contents, Indexes)
- [ ] More control over spreads, ordering, booklet printing
- [ ] Examples for use with blogging platforms
- [ ] Examples for use with React
- [ ] Approachable API for writing custom rules
- [ ] Tutorials and Documentation

#### Background

bindery.js was originally written in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in "HTML Output" at RISD. It was based on the [now-abandoned](https://alistapart.com/blog/post/css-regions-considered-harmful) CSS Regions spec, [polyfill by Remy Francois](https://github.com/FremyCompany/css-regions-polyfill). With thanks to the contributions and feedback from [Catherine Leigh Schmidt](http://cath.land), [Lukas WinklerPrins](http://ltwp.net), and [John Caserta](http://johncaserta.com/).
