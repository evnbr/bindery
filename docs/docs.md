---
layout: docs
title:  Docs
permalink: /docs/
order: 2
---

### Setup

##### `Bindery.makeBook(options)`
The only method you'll need. On page load, create a book and display it. Takes an
object of options as listed below.

{% highlight javascript %}
Bindery.makeBook({
  source: '#content',
});
{% endhighlight %}

The above is a shortcut for the following, which you may want to use if you're
integrating Bindery with your own UI.

{% highlight javascript %}
let bindery = new Bindery({
  source: '#content',
});

...

// Later, in your own event handler
bindery.makeBook();
{% endhighlight %}


### Options

##### `source`
Content to flow across pages. If the content is on the same page, use a CSS selector or a reference to the node. If the content must be fetched from a remote page, pass an object in the form of `{ url, selector }`.

{% highlight javascript %}
// CSS selector
Bindery.makeBook({
  source: '#content',
});

// Node reference
let node = document.getElementByID('content');
Bindery.makeBook({
  source: node,
});

// Fetch from a URL
Bindery.makeBook({
  source: {
    selector: '#content',
    url: '/posts.html',
  }
});
{% endhighlight %}


##### `pageSize`
Size of page, with absolute CSS units

{% highlight js %}
Bindery.makeBook({
  source: '#content',
  pageSize: { width: '4in', height: '6in' },
});
{% endhighlight %}

##### `pageMargin`
Size of margins, with absolute CSS units

{% highlight js %}
Bindery.makeBook({
  source: '#content',
  pageMargin: {
    top: '0.25in',
    inner: '0.25in',
    outer: '0.25in',
    bottom: '0.25in',
  },
});
{% endhighlight %}



##### `rules`
An array of Rules. See below for details

{% highlight js %}
Bindery.makeBook({
  source: '#content',
  rules: [
    Bindery.PageBreak({ selector: 'h2', position: 'before' }),
    Bindery.FullBleedSpread({ selector: '.big-figure' }),
  ],
});
{% endhighlight %}


### Rules

##### `Bindery.Continuation`
If you want to customize the design when an element splits across two pages.
- `selector` Which elements the rule should be applied to.
- `hasContinuationClass` <br> Applied to elements that continue onto the next page. `Optional`
- `isContinuationClass` <br> Applied to elements that start on a previous page. `Optional`

{% highlight js %}
Bindery.makeBook({
  source: '#content',
  rules: [
    Bindery.Continuation({
      selector: 'p',
      hasContinuationClass: 'my-continues',
      isContinuationClass: 'my-from',
    }),
  ],
});
{% endhighlight %}

##### `Bindery.PageBreak`
Adds or avoids page breaks for the selected element.
- `selector` Which elements the rule should be applied to.
- `position` `'before', 'after', 'both', 'avoid'`— Where to insert the break.
- `continue` `'left', 'right', 'any'` — Whether to continue flowing contents after the break on a
specific page. `Optional`

{% highlight js %}
// Make sure chapter titles always start on a righthand page.
Bindery.PageBreak({
  selector: 'h2',
  position: 'before',
  continue: 'right'
})
{% endhighlight %}


##### `Bindery.FullBleedPage`
Removes the selected element from the ordinary flow of the book and places it on its own
page. Good for displaying figures and imagery.
- `selector` Which elements the rule should be applied to.
- `continue` `'same', 'left', 'right', 'next'` — Where to resume the book flow after adding the
full bleed element. Left, right, and next continue after the element. `same` will
continue the flow where it left off, so there's not a blank gap before the image.

{% highlight js %}
Bindery.FullBleedPage({
  selector: '.fullpage',
  continue: 'same'
}),
{% endhighlight %}

##### `Bindery.FullBleedSpread`
The same as `Bindery.FullBleedPage`, but places the element across two pages.

##### `Bindery.RunningHeader`
If you want to customize the design when an element splits across two pages.
- `render` A function that takes a `Page` and returns a string of HTML. You'll
probably want to use the `number`, `isLeft`, `isEmpty`, and `heading` property
of the `Page`. `Optional`

{% highlight js %}
Bindery.RunningHeader({
  render: (page) => {
    if (page.isEmpty) {
      return '';
    } else if (page.isLeft) {
      return page.number + '·' + page.heading.h1;
    } else {
      return page.heading.h2 + '·' + page.number;
    }
  },
})
{% endhighlight %}

##### `Bindery.Footnote`
Add a footnote to the bottom of the flow area. Footnotes cut into the area for
text, so note that very large footnotes may bump the entire element to the
next page.
- `selector` Which elements the rule should be applied to.
- `render` A function that takes an element and number, and returns the
footnote for that element. This footnote will be inserted at the bottom of the flow
area.
- `replace` A function that takes the selected element and number, and returns
an new element with a footnote indicator. By default, Bindery will simply insert
the number as a superscript after the original element. `Optional`

{% highlight js %}
Bindery.Footnote({
  selector: 'p > a',
  render: function(element, number) {
    return '<i>' + number + '</i>: Link to ' + element.href;
  }
}),
{% endhighlight %}


### Referencing Pages

##### `Bindery.PageReference`
Use PageReference to create a table of contents, index, endnotes, or anywhere
you might otherwise use anchor links or in-page navigation on the web.
- `selector` Which elements the rule should be applied to.
- `replace` A function that takes an element and a page range, and must return
a new element. By default, Bindery will simply insert the page range
after the original element. `Optional`
- `createTest` A function that takes your reference element and returns a test function.
The test function receives a page element, and should return true if the
reference can be found. By default, the test function will look for
the anchor tag of the reference element's `href` property. `Optional`

#### Creating a Table of Contents
A table of contents is a reference that points to a specific page. By default, PageReference will look for anchor links. To create a table of
contents, do this:

{% highlight js %}
Bindery.PageReference({
  selector'.table-of-contents a',
  replace: (element, num) => {
    let row = document.createElement('div');
    row.innerHTML = element.textContent;
    row.innerHTML += "<span class='page-num'>" + num + "</span>";
    return row;
  }
})
{% endhighlight %}

This will transform these anchor links as below:

{% highlight html %}
<!-- Before -->
<ul class='table-of-contents'>
  <li>
    <a href='#chapter1'>Chapter 1</a>
  </li>
</ul>

<!-- After -->
<ul class='table-of-contents'>
  <li>
    <div>Chapter 1 <span class='page-num'>5</span></div>
  </li>
</ul>

{% endhighlight %}


#### Creating an Index
An index is a reference that points to content on a range of pages. There are many way you might create an index. In the following example, rather than
checking the `href`, Bindery will search the entire text of each page to see if contains the text of your reference element.

{% highlight js %}
Bindery.PageReference({
  selector: '.index-content li',
  createTest: (el) => {
    let searchTerm = el.textContent.toLowerCase().trim();
    return (pageEl) => {
      let textToSearch = pageEl.textContent.toLowerCase();
      return textToSearch.includes(searchTerm);
    }
  },
})
{% endhighlight %}

This will transform the list items as below:

{% highlight html %}
<!-- Before -->
<ul class='index-content'>
  <li>Saddle Stitch</li>
</ul>

<!-- After -->
<ul class='index-content'>
  <li>Saddle Stitch, 3-5, 10, 24</li>
</ul>
{% endhighlight %}

If you
didn't want to match on the exact string, you could use other selectors or attribute, or use a fuzzier method of searching.

{% highlight js %}
Bindery.PageReference({
  selector: '[data-index-reference]',
  createTest: (el) => {
    let id = el.getAttribute('data-index-reference');
    let selector = '[data-index-id=' + id + ']'
    return (pageEl) => {
      return pageEl.querySelector(selector);
    }
  },
})
{% endhighlight %}

{% highlight html %}
<!-- In your book markup -->
<p data-index-id='perfectBind'>
  Most books are perfect bound.
</p>

<!-- In your index markup -->
<ul>
  <li data-index-reference='perfectBind'>Perfect Binding</li>
</ul>
{% endhighlight %}


Note that we can't know what page something will end up on until the book layout
is complete, so make sure that your `replace` function doesn't
change the layout drastically.
