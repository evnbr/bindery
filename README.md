# 📖 Bindery.js

## Intro

bindery.js is a questionably useful library for producing book layouts in the
browser. The core library flows text content over multiple pages. It also includes modules for common book elements, including numbering, running headers, out-of-flow spreads, and more. The modules can be applied in order to map web conventions to print conventions,
like displaying hyperlink destinations as footnotes.

## Background

bindery.js was originally written in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in "HTML Output" at RISD. It consisted mostly of a series of hacks written in jQuery on top of [Remy Francois's CSS
Regions polyfill](https://github.com/FremyCompany/css-regions-polyfill), but it was enough
to publish a book without touching inDesign.

In 2016, [Catherine Leigh Schmidt](http://cath.land) and [Lukas WinklerPrins](http://ltwp.net) adapted the code into an easy-to-use [Jekyll](https://jekyllrb.com/) theme for
the Design Office, under the name [Baby Bindery](https://github.com/thedesignoffice/babybindery).

As of February 2017, it is in the process of being rewritten as a usable, modular library (and without a dependency on jQuery or a polyfill for the [much-maligned CSS Regions spec](https://alistapart.com/blog/post/css-regions-considered-harmful)).

## Getting started

```html
<html>
  <div class="content">
    <!-- The whole content of your book -->
  </div>

  <script src="./bindery.js"></script>
  <script>
    let binder = new Bindery({
      source: ".content",
      rules: {
        "h1": Bindery.BreakBefore,
        "h2": Bindery.RunningHeader,
        "a": Bindery.Footnote((el) => `Link to <a href='#'>${el.href}</a>`),
        ".figure": Bindery.Spread,
        ".content": Bindery.PageNumber,
      },
    });

    binder.bind();
  </script>
</html>

```

## Docs

TK

## Future Plans

- [ ] Page Number references (Tables of Contents, Indexes)
- [ ] More control over spreads and ordering
- [ ] Customizable page sizing
- [ ] Examples for use with blogging platforms
- [ ] Wrappers for React/virtualDOM libraries.
- [ ] More Documentation
