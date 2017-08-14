---
layout: page
title:  Getting Started
permalink: /getting-started/
order: 0
---

## Getting Started


If you have web design experience, bindery.js lets you think of print as an extension of responsive design. If you have print design experience, it enables you to express layouts programmatically, without giving up capabilities you know from InDesign.


### Setup

Just include the script in the same file as your content, and you're ready to go.

{% highlight html %}
<body>
  <div class="content">
    <!-- The contents of your book -->
  </div>

  <script src="./bindery.min.js"></script>
  <script>
    Bindery.makeBook({ source: '.content' });
  </script>
</body>

{% endhighlight %}

### Fetching Content

Your book is probably pretty long, so you may want to keep it in a separate
file. You can fetch it by passing in the URL, like this.

{% highlight html %}
<body>
  <script src="./bindery.min.js"></script>
  <script>
    Bindery.makeBook({
      source: {
        selector: '.content'
        url: '/content.html',
      },
    });
  </script>
</body>

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
to add components and rules to make your content usable as a book.

You can use rules to give special book properties to selectors,
like you might with CSS.

{% highlight javascript %}
Bindery.makeBook({
  source: {
    selector: '.content'
    url: '/content.html',
  },
  rules: [
    Bindery.PageBreak({ selector: 'h2', position: 'before' }),
    Bindery.FullBleedSpread({ selector: '.big-figure' }),
    Bindery.RunningHeader(),
  ]
});

{% endhighlight %}

### Rules and Options

Rules have options that customize their behavior. Sometimes the options
are simple, like passing the string 'before' to PageBreak.

For rules that create new elements on the page, you can pass in your own function
to create the element. You can use whatever tools you like as long as you
return an HTML element.


{% highlight javascript %}
Bindery.makeBook({
  source: {
    selector: '.content'
    url: '/content.html',
  },
  rules: [
    // Show a footnote for links inside paragraphs
    Bindery.Footnote({
      selector: 'p > a',
      render: function(element, number) {
        return '<i>' + number + '</i>: Link to ' + element.href;
      }
    }),
    // Show a running header next to the page number
    Bindery.RunningHeader({
      render: (page) => {
        if (page.isLeft) {
          //  23 · Book Title,
          return page.number + '·' + page.heading.h1;
        } else {
          // Chapter Title · 24
          return page.heading.h2 + '·' + page.number;
        }
      },
    }),
  ]
});

{% endhighlight %}


### Next Steps

To learn more about available rules and options, check out the [Docs](/bindery/docs)
or the [Examples](/bindery/examples)
