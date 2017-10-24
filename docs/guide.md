---
layout: page
title:  Guide
shortTitle: Guide
permalink: /guide/
order: 0
inBook: true
---

### Getting Started

Bindery is intended for web designers and developers of every skill level—you don't
need any prior javascript experience. Just include the script tag in the same HTML
file as your content, and you're ready to go.

<div>
  <a href="https://raw.githubusercontent.com/evnbr/bindery/master/dist/bindery.min.js" class="btn" download>
    ↓ Download bindery.min.js · 73k
  </a>
</div>

```html
<div id="content">
  <!-- The contents of your book -->
</div>

<script src="js/bindery.min.js"></script>
<script>
  Bindery.makeBook({ content: '#content' });
</script>
```

Use your usual web CSS if you've got it—96 CSS pixels equals 1 CSS inch. That should be around 1 inch while printed, although some browsers might adjust the scale a little.

Avoid using `@media print`, since bindery won't be able to consider those styles during pagination, and you won't be able to see them in the preview.

If you add book-specific styles, note that that CSS supports traditional print measurements
like points (`pt`), pica (`pc`), inches (`in`), and millimeters (`mm`).
You'll want to steer clear of viewport-specific units like `vh` or `vw`.

### Fetching Content

Your book content is probably pretty long, so you may want to keep it in a separate
file. You can fetch it by passing in the URL, like this.

```html
<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({
    content: {
      selector: '#content'
      url: '/content.html',
    },
  });
</script>
```

Keep in mind, your browser won't fetch content from a different web server
(since that wouldn't be secure). Make sure you're loading both your current file and your content file from a web server. (Tip: If the URL says `file://`, you aren't using a server).

### Preparing Content

You don't need to do anything special with your HTML content, as long
as it all ends up in a single file. For example, you could use the Wikipedia
API to [make a book from an article](/bindery/examples/6_wikipedia/) without changing the markup.

However, if your book is long, you probably want to use your CMS or templating language
to generate a file with all that content. For example, if you're using [Jekyll](https://jekyllrb.com/),
it might look something like this.

```html
{% raw %}<section id="content">
  {% for post in site.posts %}
      <h2>{{ post.title | escape }}</h2>
      <div class="post-content">
        {{ post.content }}
      </div>
  {% endfor %}
</section>{% endraw %}
```


### Using Rules

You've now got content flowing across your pages. Next, you'll probably want
to add page breaks, running headers, and the other elements of a usable book.

You can create rules for selectors, like you might with CSS,
to apply special book properties to your markup.


```js
Bindery.makeBook({
  content: {
    selector: '#content'
    url: '/content.html',
  },
  rules: [
    Bindery.PageBreak({ selector: 'h2', position: 'before' }),
    Bindery.FullBleedSpread({ selector: '.big-figure' }),
  ]
});
```

### Rules and Options

Rules have options that customize their behavior. Sometimes the options
are simple, like `position: 'before'` in `PageBreak` above.

For rules that create new elements on the page, you'll want to be more specific. (This part requires knowing a little bit of javascript). You do so
by passing in your own function. You can use whatever tools you like as long as you return
an HTML element, or the text to display.


```js
let linksAsFootnotes = Bindery.Footnote({
  selector: 'p > a',
  render: (element, number) => {
    return `${number}: Link to ${element.href}`;
  }
});

let runningHeaders = Bindery.RunningHeader({
  render: (page) => {
    if (page.isLeft) {
      return `${page.number} · Jan Tschichold`;
    } else {
      return `The Form of the Book · ${page.number}`;
    }
  },
});

Bindery.makeBook({
  content: {
    selector: '#content'
    url: '/content.html',
  },
  rules: [ linksAsFootnotes, runningHeaders ]
});
```

In the example above, we return a string. For complete control, we can create an
element ourselves in javascript.

```js
// String
render: (element, number) => {
  return number + ': Link to ' + element.href;
}

// document.createElement
render: (element, number) => {
  let myFootnoteEl = document.createElement('div');
  myFootnoteEl.classList.add('my-footnote')
  myFootnoteEl.textContent = number + ': Link to ' + element.href;
  return myFootnoteEl;
}

// jQuery
render: (element, number) =>  {
  return  $('<div class="my-footnote">' + number + ': Link to ' + element.href + '</div>');
}

// hyperscript
render: (element, number) => {
  return h('.my-footnote', number + ': Link to ' + element.href);
}
```


### Printing

Print early and often.


### Next Steps

To learn more about available rules and options, check out the [documentation](/bindery/docs)
or [view some examples](/bindery/examples).

<div class="home-btns">
  <a class="btn" href="/bindery/docs" class="btn">View Docs →</a>
  <a class="btn" href="/bindery/examples" class="btn">View Examples →</a>
</div>
