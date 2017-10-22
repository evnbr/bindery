## [Bindery.js](https://evanbrooks.info/bindery/)

[Intro](https://evanbrooks.info/bindery/) ·
[Guide](https://evanbrooks.info/bindery/guide) ·
[Docs](https://evanbrooks.info/bindery/docs) ·
[Demos](https://evanbrooks.info/bindery/demos) ·
[About](https://evanbrooks.info/bindery/about)

*Bindery.js* is a library for designing printable books with HTML and CSS.

At its simplest, Bindery flows content over multiple pages. From there, the designer can create elements that depend on that flow, like running headers, footnotes, tables of contents, and indexes. Bindery also provides print options like bleed, crop marks, and booklet ordering.

If you're designing a website, think about books as an extension of the responsive web. If you're designing a book, express your layous programmatically, with no need for InDesign.

### Getting Started

```html
<div id="content">
  <!-- The whole content of your book -->
</div>

<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({ content: '#content' });
</script>
```

### Using Rules

```html
<div id="content">
  <!-- The whole content of your book -->
</div>

<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({
    content: '#content',
    rules: [
      Bindery.PageBreak({ selector: 'h2', position: 'before', continue: 'right' }),
      Bindery.Footnote({
        selector: 'p > a',
        render: (element, number) -> {
          let href = element.getAttribute('href');
          return `<sup>${number}</sup> Link to ${href}`;
        },
      }),
    ],
  });
</script>
```

For more, see the [Guide](https://evanbrooks.info/bindery/guide) and [Docs](https://evanbrooks.info/bindery/docs).

### Developing

ES6 / babel, bundled with rollup. The only runtime dependency
is [Hyperscript](https://github.com/hyperhype/hyperscript), for templating the UI, which is included in the bundle by default.

When contributing, keep the following in mind: The goal of bindery.js is to provide an approachable jumping-off point for HTML-to-Print exploration. Because of this, it is intended to work out of the box as a script tag (without needing to run a dev server, set up a development environment, use preprocessors, or really know javascript at all).

- `npm run-script build` - Updates all builds
- `npm run-script test` - Runs Jest

Note that the pagination code in Bindery is inherently fairly slow. Each step of pagination involves
making a change, letting the browser recompute layout, measuring the
new layout, and then making another change.
This is the very definition of ['layout thrashing'](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing),
which normally would be avoided. However, it's the only option that allows Bindery
to work without reinventing the wheel — it lets you use any CSS your browser supports.

Ideally, much of what bindery does would be handled natively with CSS,
and the [W3C is working on it](https://drafts.csswg.org/css-page-3/). However, [bindery is not a CSS Polyfill](https://evanbrooks.info/bindery/about#what-bindery-is-not).


#### To Do

- [ ] Support for signatures and advanced ordering
- [ ] Support for RTL languages
- [ ] Examples for use with blogging platforms
- [ ] Examples for use with React
- [ ] Approachable API for writing custom rules
- [ ] Tutorials and Documentation
- [ ] Test Coverage

#### Background

bindery.js was originally written in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in "HTML Output" at RISD. For more, [see here](http://evanbrooks.info/bindery/about).
