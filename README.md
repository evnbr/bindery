# Bindery.js

[![npm](https://img.shields.io/npm/v/bindery.svg)](https://www.npmjs.com/package/bindery)
[![Build Status](https://travis-ci.com/evnbr/bindery.svg?branch=master)](https://travis-ci.com/evnbr/bindery)
[![codecov](https://codecov.io/gh/evnbr/bindery/branch/master/graph/badge.svg)](https://codecov.io/gh/evnbr/bindery)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/bindery.svg)](https://www.npmjs.com/package/bindery)

[Intro](https://bindery.info/) ·
[Learn](https://bindery.info/learn) ·
[Docs](https://bindery.info/docs) ·
[Examples](https://bindery.info/examples) ·
[About](https://bindery.info/about)

_Bindery.js_ is a library for designing printable books with HTML and CSS.

At its simplest, Bindery flows content over multiple pages. From there, the designer can create elements that depend on that flow, like running headers, footnotes, tables of contents, and indexes. Bindery also provides print options like bleed, crop marks, and booklet ordering.

If you're designing a website, think about books as an extension of the responsive web. If you're designing a book, express your layouts programmatically, with no need for InDesign.

### Getting Started

```html
<div id="content">
  <!-- The contents of your book -->
</div>

<script src="https://unpkg.com/bindery"></script>
<script>
  Bindery.makeBook({ content: '#content' });
</script>
```

You can also install bindery from [npm](https://www.npmjs.com/package/bindery), or <a href="https://unpkg.com/bindery/dist/bindery.min.js" class="btn" download>download directly</a>.

```
npm install --save bindery
```

### Using Rules

```js
const { makeBook, PageBreak, Footnote } = Bindery;

makeBook({
  content: '#content',
  rules: [
    PageBreak({ selector: 'h2', position: 'before', continue: 'right' }),
    Footnote({
      selector: 'p > a',
      render: (el, num) => `${num}: Link to ${el.getAttribute('href')}`;
    }),
  ],
});
```

For more, see [Learn](https://bindery.info/learn) and the [Docs](https://bindery.info/docs).

### Developing

When contributing, keep in mind that bindery.js is intended to provide an approachable jumping-off point for HTML-to-Print exploration. Because of this, it is intended to work out of the box as a script tag (without needing to run a dev server, set up a development environment, use preprocessors, or know javascript at all).

- `npm run build` - Updates dist/
- `npm run test` - Runs Jest

#### To Do

- [ ] Support for signatures and advanced ordering
- [ ] Support for RTL languages
- [ ] Examples for use with blogging platforms
- [ ] Examples for use with React
- [ ] Approachable API for writing custom rules

#### Background

bindery.js was originally written in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in "HTML Output" at RISD. For more, [see here](https://bindery.info/about).
