---
layout: page
title:  Intro
permalink: /intro/
order: 0
---

<!-- ## Intro -->

Welcome.

If you're a web designer, bindery.js lets you think about books as an extension of responsive design. If you're a print designer, it enables you to express book layout programmatically, without giving up capabilities you know from InDesign.


### Setup

Just include the script in the same file as your content, and you're ready to go.

{% highlight html %}
<div class="content">
  <!-- The contents of your book -->
</div>

<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({ source: '.content' });
</script>
{% endhighlight %}

Use your usual web CSS however you choose. When printing, `96px = 1in`.
If you add book-specific styles, note that CSS supports print measurements
like points (`pt`), pica (`pc`), inches (`in`), and millimeters (`mm`).
You'll want to steer clear of viewport-specific units like `vh` or `vw`.

### Fetching Content

Your book content is probably pretty long, so you may want to keep it in a separate
file. You can fetch it by passing in the URL, like this.

{% highlight html %}
<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({
    source: {
      selector: '.content'
      url: '/content.html',
    },
  });
</script>
{% endhighlight %}

Keep in mind, your browser won't fetch content from a different URL,
because that wouldn't be secure. So make sure your page is on server if
this doesn't work. (Not sure? If the URL says
`file://`, you aren't using a server).

### Preparing Content

You don't need to do anything special with your HTML content, as long
as it all ends up in a single file. For example, you could use the Wikipedia
API to make a book from [an article](#) without changing the markup.

However, if your book is long, you probably want to use your CMS or templating language
to generate a file with all that content. For example, if you're using [Jekyll](#),
it might look something like this.

{% highlight html %}
{% raw %}
<section class="content">
  {% for post in site.posts %}
      <h2>{{ post.title | escape }}</h2>
      <div class="post-content">
        {{ post.content }}
      </div>
  {% endfor %}
</section>
{% endraw %}
{% endhighlight %}


### Using Rules

You've now got content flowing across your pages. Next, you'll probably want
to add page breaks, running headers, and the other elements of a usable book.

You can create rules for selectors, like you might with CSS,
to apply special book properties to your markup.


{% highlight javascript %}
Bindery.makeBook({
  source: {
    selector: '.content'
    url: '/content.html',
  },
  rules: [
    Bindery.PageBreak({ selector: 'h2', position: 'before' }),
    Bindery.FullBleedSpread({ selector: '.big-figure' }),
  ]
});

{% endhighlight %}

### Rules and Options

Rules have options that customize their behavior. Sometimes the options
are simple, like passing the string `'before'` to `PageBreak`.

For rules that create new elements on the page, you can pass in your own function.
You can use whatever tools you like as long as you return an HTML element, or
the text to display.


{% highlight javascript %}

let linksAsFootnotes = Bindery.Footnote({
  selector: 'p > a',
  render: function(element, number) {
    return number + ': Link to ' + element.href;
  }
});

let runningHeaders = Bindery.RunningHeader({
  render: function(page) {
    if (page.isLeft) { return page.number + ' · Roland Barthes'; }
    else { return 'Mythologies · ' + page.number; }
  },
});

Bindery.makeBook({
  source: {
    selector: '.content'
    url: '/content.html',
  },
  rules: [ linksAsFootnotes, runningHeaders ]
});

{% endhighlight %}


### Next Steps

To learn more about available rules and options, check out the [Docs](/bindery/docs)
or the [Examples](/bindery/examples)
