# Bindery.js

## About

bindery.js is a questionably useful library for producing book layouts in the
browser. The core library flows text content over multiple pages. It also includes modules for common book elements, including numbering, running headers, out-of-flow spreads, and more. The modules can be applied in order to map web conventions to print conventions,
like displaying hyperlink destinations as footnotes.

The resulting book is viewable in-browser, and can open the system ⌘P dialog to send to a printer or to PDF

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
        "a": Bindery.Footnote((el) => `Link to ${el.href}`),
        ".figure": Bindery.Spread,
      },
    });

    binder.makeBook();
  </script>
</html>

```

## Who is this for?

The goal of bindery.js is to provide an approachable jumping-off point for HTML-to-Print
exploration, Because of this library works out of the box without needing to run a dev server,
run a development environment, or use preprocessors or module bundlers.

If you are interested in integrating it into a larger project, please feel free to reach out.

## Docs

TK

## To Do

- [ X ] Page Number references (Tables of Contents, Indexes)
- [ ] More control over spreads, ordering, booklet printing
- [ X ] Customizable page sizing
- [ ] Examples for use with blogging platforms
- [ ] Wrapper for use with React.
- [ ] Approachable API for writing custom rules
- [ ] Documentation!
- [ ] Make usable
