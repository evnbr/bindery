# Regionize

[![npm](https://img.shields.io/npm/v/regionize.svg)](https://www.npmjs.com/package/regionize)
[![Build Status](https://travis-ci.org/evnbr/regionize.svg?branch=master)](https://travis-ci.org/evnbr/regionize)
[![codecov](https://codecov.io/gh/evnbr/regionize/branch/master/graph/badge.svg)](https://codecov.io/gh/evnbr/regionize)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/regionize.svg)

A bare-bones, asynchronous javascript library to flow HTML content across a
series of separate elements. It makes no attempt to handle the styling of
elements that break across regions.

Note that Regionize does **not** attempt to polyfill the API of [CSS Regions](http://alistapart.com/blog/post/css-regions-considered-harmful).
The user is responsible for providing the next element when content
overflows through a javascript callback. The caller must ensure provided
elements are empty, already in the document, and have an intrinsic size.

Regionize powers [bindery.js](https://evanbrooks.info/bindery/).

## Usage

```
npm install --save regionize
```

### Create a Region

```js
import { Region } from 'regionize';

...

const box = new Region(
  element // HTML Element
);
```

### Flow content into Regions

```js
import { flowIntoRegions } from 'regionize';

...

await flowIntoRegions({
  // required
  content,
  createRegion,

  // optional
  canSplit,
  applySplit,
  shouldTraverse,
  beforeAdd,
  afterAdd,
});
```

### Flow options

#### content
`HTMLElement`

#### createRegion
`() => Region`

Called every time the previous region overflows. This method must always
return a new Region created from an element. The region
must have an intrinsic size when empty, and must already
be added to the DOM.

#### canSplit
`(elmt: HTMLElement) => Bool`

By default, canSplit returns true, so a single element may be split between
regions. Return false if the element should not be split between two regions,
for example if it is an image or figure. This
means the element will be shifted to the next page instead.

#### applySplit
`(elmt: HTMLElement, clone: HTMLElement) => null`

Elements are cloned when they split between pages. Use this method
to apply extra styling after splitting. For example, you may need to
specify that only the first half of a split paragraph should be indented. See
[here](https://evanbrooks.info/bindery/examples/7_custom_split/) for
an example how to apply additional styling.

By default, regionize will attempt to continue ordered list
(`<ol>`) numbering across regions, and attempt to preserve the number of table
cells (`<td>`) within a table row (`<tr>`).

#### shouldTraverse
`(elmt: HTMLElement) => Bool`

By default, shouldTraverse returns false, so nodes are added in chunks when
possible. Return true if to force this element to appear in beforeAdd and afterAdd.
For example, bindery.js will true if the region contains a footnote,
since a footnote will shrink the available content area. 

#### beforeAdd
`(elmt: HTMLElement, next: Function) => null`

Called before an element is added to a region. For example,
bindery.js uses this opportunity to call next() if the element
should start in a new region. You must return
true from shouldTraverse to guarantee this is called for your
element.

#### afterAdd
`(elmt: HTMLElement, next: Function) => null`

Called after element is added to a region. You must return
true from shouldTraverse to guarantee this is called for your
element.


## Example
```js
import { Region, flowIntoRegions } from 'regionize';

// You should instantiate new Regions from HTML Elements
const createRegion = () => {
  const el = document.createElement('div');
  el.style.height = '200px'; // Region must have size
  el.style.width = '200px';
  document.body.appendChild(el); // Region must be in DOM
  return new Region(el);
}

// Unset text indent when splitting 
const applySplit = (el, clone) => clone.style.textIndent = '0';

// Prevent figures from breaking across pages
const canSplit = el => !el.matches('figure');

// flowIntoRegions is an async function
const render = async () => {
  const content = document.querySelector('#content');
  await flowIntoRegions({ content, createRegion, canSplit, applySplit });
}
render();
```
