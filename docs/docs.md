---
layout: docs
title:  Documentation
shortTitle: Docs
permalink: /docs/
order: 2
inBook: true
---

## Setup

Use `Bindery.makeBook({ options })` to create a book and display it
immediately on page load. It takes an object of options as described below.

```js
// With required options
Bindery.makeBook({
  content: '#content',
});
```

### content

If the content is on the same page, use a CSS selector or a reference to the node. If the content must be fetched from a remote page, pass an object in the form of `{ url: String, selector: String }`.

```js
// CSS selector
Bindery.makeBook({
  content: '#content',
});

// Element
const el = document.getElementByID('content');
Bindery.makeBook({
  content: el,
});

// Fetch from a URL
Bindery.makeBook({
  content: {
    selector: '#content',
    url: '/posts.html',
  }
});
```

### pageSetup

- `size:` Book size, in the form of `{ width: String, height: String }`. Values must include absolute CSS units.
- `margin:` Book margin, in the form of `{ top: String, outer: String, bottom: String, inner: String }`. Values must include absolute CSS units.

```js
Bindery.makeBook({
  content: '#content',
  pageSetup: {
    size: { width: '4in', height: '6in' },
    margin: { top: '12pt', inner: '12pt', outer: '16pt', bottom: '20pt' },
  },
});
```

### printSetup

Note that setting the paper size through bindery [only works in Chrome and Opera](https://caniuse.com/#feat=css-paged-media) as of 2017. Users with other browsers must set the size in the system print dialog.

- `layout:`
  - `PAGES` One page per sheet, in numerical order `default`
  - `SPREADS` Two pages per sheet, in numerical order
  - `BOOKLET` Two pages per sheet, in booklet order. For printing double
  sided and folding into a saddle stitched booklet.
- `paper:`
  - `AUTO` Sets paper to the size of the page or, if the layout is
   `spreads` or `booklet`, twice as wide as the page.
   Note that marks will not be visible. `default`
  - `AUTO_BLEED` The size of the page plus the size of the bleed.
  Note that marks will not be visible.
  - `AUTO_MARKS` The size of the page plus room for crop and bleed marks.
  - `LETTER_PORTRAIT`
  - `LETTER_LANDSCAPE`
  - `A4_PORTRAIT`
  - `A4_LANDSCAPE`
- `marks:`
  - `NONE`
  - `CROP` Note that crop marks are always outset by the bleed amount.`default`
  - `BLEED`
  - `BOTH`
- `bleed:` Amount of bleed. Values must include absolute CSS units. This affects the size of [full-bleed pages](#fullbleedpage)
and [spreads](#fullbleedspread), and sets the position of bleed and
crop marks.

```js
Bindery.makeBook({
  content: '#content',
  printSetup: {
    layout: Bindery.Layout.BOOKLET,
    paper: Bindery.Paper.AUTO_BLEED,
    marks: Bindery.Marks.CROP,
    bleed: '12pt',
  },
});
```

### Preview

- `view:`
  - `PREVIEW` shows the spreads of the book as they will appear when
  the book is trimmed and bound. If you choose this mode, Bindery will switch to `PRINT`
  before printing. `default`
  - `PRINT` shows the complete printed sheet, which may include multiple pages,
  marks, and bleed if those options are enabled.
  Note that when printing a booklet, pages will appear out of order.
  - `FLIPBOOK` shows a three-dimensional preview, making it easy
to visualize which pages will end up on the backs of others. If you choose this mode,
Bindery will switch to `PRINT` before printing.



```js
Bindery.makeBook({
  content: '#content',
  view: Bindery.View.FLIPBOOK,
})
```


## Flowing Content

Book content runs within the margins on the front and back of every
page. You can set a series of rules that change the book flow.
Rules are triggered by selectors, like CSS. For example, you might want to
start all `h2` elements on a new page, and make all `.big-figure` elements
into a full-bleed spread across two pages:

```js
Bindery.makeBook({
  content: '#content',
  rules: [
    Bindery.PageBreak({ selector: 'h2', position: 'before' }),
    Bindery.FullBleedSpread({ selector: '.big-figure' }),
  ],
});
```

You may prefer to create rules separately:

```js
let breakRule = Bindery.PageBreak({
  selector: 'h2',
  position: 'before',
});

let spreadRule = Bindery.FullBleedSpread({
  selector: '.big-figure',
});

Bindery.makeBook({
  content: '#content',
  rules: [ breakRule, spreadRule ],
});
```

### PageBreak
<!-- - `Bindery.PageBreak({})` -->
Adds or avoids page breaks for the selected element.

- `selector:` Which elements the rule should be applied to.
- `position:`
  - `'before'` insert a break before the element, so it starts on a new page
  - `'after'` insert a break after the element
  - `'both'` insert breaks before and after the element
  - `'avoid'` prevents the element from breaking in the middle, by pushing it to the next page.
- `continue:` will insert an extra break when appropriate so that the flow will resume
on a specific page. `Optional`
  - `'next'` `default`
  - `'left'`
  - `'right'`

```js
// Make sure chapter titles always start on a righthand page.
Bindery.PageBreak({
  selector: 'h2',
  position: 'before',
  continue: 'right'
})
```

### FullBleedPage
Removes the selected element from the ordinary flow of the book and places it on its own
page. Good for displaying figures and imagery. You can use CSS to do your own layout on this page— `width: 100%; height: 100%` will fill the whole bleed area.
- `selector:` Which elements the rule should be applied to.
- `continue:` Where to resume the book flow after adding the
full bleed page. `Optional`
  - `'same'` Continues on the previous page where the element would have been. This will fill the remainder of that page, avoiding a gap, though note that it results in a different order than your original markup. `default`
  - `'next'` Continues on a new page
  - `'left'` Continues on the next left page, inserting another page when appropriate
  - `'right'` Continues on the next right page, inserting another page when appropriate
- `rotate:` Add a rotation the full-bleed content. `Optional`
  - `'none'` `default`
  - `'clockwise'` The top will become the left edge
  - `'counterclockwise'` The top will become the right edge
  - `'inward'` The top will become the outside edge
  - `'outward'` The top will become the inside edge

```js
Bindery.FullBleedPage({
  selector: '.big-figure',
  continue: 'same'
}),
```

### FullBleedSpread
The same as [`FullBleedPage`](#fullbleedpage), but places the element across two pages.
- `selector:` Which elements the rule should be applied to.
- `continue:` Where to resume the book flow after adding the
full bleed element. `Optional`
  - `'same'` `default` Continue where the element was, so there's not a blank gap before the spread.
  - `'next'` Continues on a new page after the spread.
  - `'left'` Continues on the next left page after the spread
  - `'right'` Continues on the next right page after the spread
- `rotate:` Add a rotation the full-bleed content. `Optional`
  - `'none'` `default`
  - `'clockwise'` The top will become the left edge
  - `'counterclockwise'` The top will become the right edge

```js
Bindery.FullBleedSpread({
  selector: '.wide-figure',
  continue: 'next',
  rotate: 'clockwise',
}),
```

### Split
<!-- - `Bindery.Split({})` -->

Add a class when an element splits across two pages, to customize the styling.

Bindery makes as few assumptions as possible about your intended design— by default,
text-indent will be removed from `<p>`s that started on
the previous page, and the bullet will be hidden for
`<li>`s that started on the previous page. Everything else you should specify
yourself—for example, you may want to remove margin, padding, or borders
when your element splits.
[See example](/bindery/examples/7_custom_split).

- `selector:` Which elements the rule should be applied to.
- `toNext:` Class applied to elements that will continue onto the next page. `Optional`
- `fromPrevious:` Class applied to elements that started on a previous page. `Optional`

```js
Bindery.Split({
  selector: 'p',
  toNext: 'to-next',
  fromPrevious: 'from-previous',
}),
```

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<p>
  Some books are
  saddle stitched...
</p>
```
```html
<!-- Page 1 -->
<p class='to-next'>
  Some books are
</p>
<!-- Page 2 -->
<p class='from-previous'>
  saddle stitched...
</p>
```
</div>


### Counter
Increment a counter as the book flows. This is useful for numbering figures or sections.
Bindery's Counters can be used in place of
[CSS counters](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Lists_and_Counters/Using_CSS_counters),
which will not work as expected when the DOM is reordered to create a book.
- `incrementEl:` CSS Selector. Matching elements will increment the counter by 1.
- `resetEl:`  CSS Selector. Matching elements will  set the counter to 0. `Optional`
- `replaceEl:` CSS Selector. Matching elements will display the value of the counter.
- `replace:` A function that takes the selected element and the counter value, and returns
an new element. By default, Bindery will simply replace the contents with the value of the counter. `Optional`

Here's how you could number all `<figure>`s, by replacing the
existing `<span class='fig-num'>`s.

```js
Bindery.Counter({
  incrementEl: 'figure',
  replaceEl: '.fig-num',
})
```

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<figure>
  <img />
  <figcaption>
    <span class='fig-num'></span>
    Here's the caption
  </figcaption>
</figure>
```
```html
<!-- After -->
<figure>
  <img />
  <figcaption>
    <span class='fig-num'>1</span>
    Here's the caption
  </figcaption>
</figure>
```
</div>


Here's how you could number all `<p>`s, resetting each section,
by inserting new markup. [See example](/bindery/examples/10_counters).

```js
Bindery.Counter({
  incrementEl: 'p',
  replaceEl: 'p',
  resetEl: 'h2',
  replace: (el, counterValue) => {
    el.insertAdjacentHTML('afterbegin', `<i>P ${counterValue} </i>`);
    return el;
  }
}),
```

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<h2>Section 1</h2>
<p>Some books are
saddle stitched.</p>
<p>Other books are
perfect bound.</p>

<h2>Section 2</h2>
<p>eBooks are different
altogether.</p>
```
```html
<!-- After -->
<h2>Section 1</h2>
<p><i>P 1</i>
Some books are
saddle stitched.</p>
<p><i>P 2</i>
Other books are
perfect bound.</p>

<h2>Section 2</h2>
<p><i>P 1</i>
eBooks are different
altogether.</p>
```
</div>


## Page Elements

### RunningHeader
An element added to each page. By default it will add a page number
at the top right of each page, but you can use `render` to generate running
headers using your section titles.

Keep in mind you can also use multiple
`RunningHeaders` to create multiple elements— for example, to add both a page number
at the bottom and a chapter title at the top.

```js
Bindery.RunningHeader({
  render: (pageInfo) => pageInfo.isLeft
    ? `${pageInfo.number} · ${pageInfo.heading.h1}`
    : `${pageInfo.heading.h2} · ${pageInfo.number}`
})
```
- `render:` A function that takes a `PageInfo` and returns a string of HTML. You'll
probably want to use the `number`, `isLeft`, `isEmpty`, and `heading` properties — 
see [`PageInfo`](#pageinfo) for details. `Optional`

### Footnote
Add a footnote to the bottom of the flow area. Footnotes cut into the area for
text, so note that very large footnotes may bump the entire element to the
next page.

- `selector:` Which elements the rule should be applied to.
- `render:` A function that takes an element and number, and returns the
footnote for that element. This footnote will be inserted at the bottom of the flow
area.
- `replace:` A function that takes the selected element and number, and returns
an new element with a footnote indicator. By default, Bindery will simply insert
the number as a superscript after the original element. `Optional`

```js
Bindery.Footnote({
  selector: 'p > a',
  render: (element, number) => {
    return '<i>' + number + '</i>: Link to ' + element.href;
  }
}),
```


## Referencing Pages

If your web content has internal links or navigation, you can use a `PageReference`
to insert the page number the content will eventually end up on. You can use
them to create traditional book navigation elements, like a table of contents, index, endnotes,
without having to update them every time you change the page size or style.

### PageReference
- `selector:` Which elements the rule should be applied to.
- `replace:` A function that takes an element and a page range, and must return
a new element. By default, Bindery will insert the page range
after the original element. `Optional`
- `createTest:` A function that takes your reference element and returns a test function.
The test function receives a page element, and should return true if the
reference can be found. By default, the test function will look for
the anchor tag of the reference element's `href` property, which is useful for
a table of contents. Use a custom function to create an index. `Optional`

### Creating a Table of Contents
A table of contents is a [PageReference](#pagereference) that points to a specific page. By default, PageReference will look for anchor links. To create a table of
contents, do this:

```js
Bindery.PageReference({
  selector'.toc a',
  replace: (element, number) => {
    let row = document.createElement('div');
    row.classList.add('toc-row');
    row.innerHTML = element.textContent;
    row.innerHTML += `<span class='num'>${number}</span>`;
    return row;
  }
})
```

You can use any library that creates HTML elements,
for example [nanohtml](https://github.com/choojs/nanohtml):

```js
const html = import 'nanohtml';

Bindery.PageReference({
  selector'.toc a',
  replace: (element, number) => html`
    <div class="toc-row">
      <span>${element.textContent}</span>
      <span class="num">${number}</span>
    </div>
  `;
})
```


This will transform the HTML of your anchor links like this:

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<nav class='toc'>
  <a href='#chapter1'>
    Chapter 1
  </a>
</nav>
```
```html
<!-- After -->
<nav class='toc'>
  <div class='toc-row'>
    <span>Chapter 1</span>
    <span class='num'>5</span>
  </div>
</nav>
```
</div>


### Creating an Index
An index is a [PageReference](#pagereference) that points to content on a range of pages. There are many way you might create an index. In the following example, rather than
checking the `href`, Bindery will search the entire text of each page to see if contains the text of your reference element.

```js
Bindery.PageReference({
  selector: '.index-content li',
  createTest: (el) => {
    const searchTerm = el.textContent.toLowerCase().trim();
    return (page) => {
      const textOfPage = page.textContent.toLowerCase();
      return textOfPage.includes(searchTerm);
    }
  },
})
```

This will transform the list items as below:

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<p>
  Some books are
  saddle stitched...
</p>

<ul class='index-content'>
  <li>Saddle Stitch</li>
</ul>
```
```html
<!-- After -->
<p>
  Some books are
  saddle stitched...
</p>

<ul class='index-content'>
  <li>Saddle Stitch, 5</li>
</ul>
```
</div>

If you
didn't want to match on the exact string, you could use other selectors or attribute, or use a fuzzier method of searching. Just
create your own testing function from the index entry.

```js
Bindery.PageReference({
  selector: '[data-ref]',
  createTest: (el) => {
    let selector = el.getAttribute('data-ref');
    return (page) => page.querySelector(selector);
  },
})
```

<div class='code-compare' markdown='1'>
```html
<!-- Before -->
<p data-id='perfectBind'>
  Most books are perfect bound.
</p>

<ul>
  <li data-ref='perfectBind'>
    Binding, Perfect
  </li>
</ul>
```
```html
<!-- After -->
<p data-id='perfectBind'>
  Most books are perfect bound.
</p>

<ul>
  <li data-ref='perfectBind'>
    Binding, Perfect: 5
  </li>
</ul>
```
</div>

Note that we can't know what page something will end up on until the book layout
is complete, so make sure that your `replace` function doesn't
change the layout drastically.

## Advanced

### PageInfo
You may receive instances of this class when using custom rules,
but will not create them yourself.
- `number` the page number, with the first page being 1
- `heading` The current hierarchy of headings from previous pages, in the form of `{ h1: String, h2: String, ... h6: String }`
- `isEmpty` `Bool` Whether the page includes flow content
- `isRight` `Bool` The page is on the right (the front)
- `isLeft` `Bool` The page is on the left (the back)

### BookInfo
You may receive instances of this class when using custom rules,
but will not create them yourself.
- `pages` Array of [PageInfo](#pageinfo)
