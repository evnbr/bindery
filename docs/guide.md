---
layout: page
title:  Guide
shortTitle: Guide
permalink: /guide/
order: 0
inBook: true
---

### Getting Started

Bindery is intended for web designers and developers of every skill level. Just
include the script tag with your content, and you're ready to go.

```html
<div id="content">
  <!-- The contents of your book -->
</div>

<script src="https://unpkg.com/bindery/"></script>
<script>
  Bindery.makeBook({ content: '#content' });
</script>
```

You can also install bindery from [npm](https://www.npmjs.com/package/bindery), or download directly.


```
npm install --save bindery
```

<div>
  <a href="https://unpkg.com/bindery/dist/bindery.min.js" class="btn" download>
    ↓ Download bindery.min.js
  </a>
</div>


### Styling

Use your existing web CSS if you've got it—96 CSS pixels equals 1 CSS inch. That should be around 1 inch while printed, although some browsers might adjust the scale a little. CSS also supports points (`pt`), pica (`pc`), inches (`in`), and millimeters (`mm`).

When using media queries or viewport-specific units like `vh` or `vw`, note that
these refer to the browser width, not width of a book page. Also, avoid
changing sizes or layout when using `@media print`. Bindery won't be able
to use that information when flowing content across pages, and you won't be able to see them in the preview.

### Preparing Content

Your book content is probably pretty long, so you may want to keep it in a separate
file. This also prevents any flash of unstyled content
you might have seen before bindery runs. You can fetch content by
passing in the URL and selector, like this:

```js
Bindery.makeBook({
  content: {
    selector: '#content'
    url: '/book-content.html',
  },
});
```

(Keep in mind—your browser won't fetch content from a different web server, since that wouldn't be secure. Make sure you're loading both your current file and your content from the same server. If your browser says `file://` in the URL bar, you aren't using a server.)

You don't need to do anything special with your HTML content, as long
as it all ends up in a single file. For example, you could use the Wikipedia
API to [make a book from an article](/bindery/examples/6_wikipedia/) without changing the markup.

You may want to use your CMS or templating language
to generate a file by looping over you site's posts or pages.
For example, if you're using [Jekyll](https://jekyllrb.com/),
it might look something like this.

```html
{% raw %}<section id="content">
  {% for post in site.posts %}
      <h2>{{ post.title | escape }}</h2>
      <div class="post-content">
        {{ post.content | markdownify }}
      </div>
  {% endfor %}
</section>{% endraw %}
```


### Rules

You've now got content flowing across your pages. Next, you'll probably want
to add page breaks, spreads, running headers, and the other elements of a usable book.
You can do that by creating rules
that apply to selectors, like you would with CSS.

```html
<div id="content">
  <h2>Chapter 1</h2>
  <p></p>
  <figure class="big-figure">
    <img src="figure1.png" />
  </figure>
</div>

<script>
  Bindery.makeBook({
    content: '#content',
    rules: [
      Bindery.PageBreak({ selector: 'h2', position: 'before' }),
      Bindery.FullBleedSpread({ selector: '.big-figure' }),
    ],
  });
</script>
```

### Book Components

For rules that create new elements on the page, you can
pass in your own function. You can use whatever other tools or
libraries you like, as long as you return
an HTML element or line of text.


```js
let linksAsFootnotes = Bindery.Footnote({
  selector: 'p > a',
  render: (element, number) => `${number}: Link to ${element.href}`;
});

let runningHeaders = Bindery.RunningHeader({
  render: (page) => page.isLeft
    ? `${page.number} · Jan Tschichold`
    : `The Form of the Book · ${page.number}`;
});

Bindery.makeBook({
  content: {
    selector: '#content'
    url: '/content.html',
  },
  rules: [ linksAsFootnotes, runningHeaders ]
});
```

In the example above, we return a string. We could also create an
element ourselves in javascript. In plain javascript, that would look like:

```js
let myCustomFootnote = Bindery.Footnote({
  selector: 'p > a',
  render: (element, number) => {
    let myFootnote = document.createElement('div');
    myFootnote.classList.add('note')
    myFootnote.textContent = `${number}: Link to ${element.href}`;
    return myFootnote;
  }
});
```

You can use any library that creates HTML elements,
for example [nanohtml](https://github.com/choojs/nanohtml):

```js
const html = import 'nanohtml';

let myCustomFootnote = Bindery.Footnote({
  selector: 'p > a',
  render: (element, number) => html`
    <div class="note">${number}: Link to ${element.href}</div>
  `;
});
```



### Next Steps

To learn more about available rules and options, check out the [documentation](/bindery/docs)
or [view some examples](/bindery/examples).

<div class="home-btns">
  <a class="btn" href="/bindery/docs" class="btn">View Docs →</a>
  <a class="btn" href="/bindery/examples" class="btn">View Examples →</a>
</div>
