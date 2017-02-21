# Bindery.js

## Intro

bindery.js is a questionably useful library for producing book layouts in the
browser. The core library flows text content over several pages. It included modules for common layout tasks, including numbering, running headers, out-of-flow spreads, and more.

## Background

bindery.js was originally written for [for/with/in](http://htmloutput.risd.gd/),
a publication from the members of "HTML Output" at RISD in Spring 2014. It consisted mostly of a series of hacks written in jQuery on top of a CSS
Regions polyfill.

In 2016, Catherine and Lukas adapted the code into an easy-to-use [Jekyll](https://jekyllrb.com/) theme for
the Design Office, under the name [Baby Bindery](https://github.com/thedesignoffice/babybindery).

As of February 2017, it is being rewritten as a usable, modular library (and without
a dependency on jQuery or a polyfill for the [much-maligned CSS Regions spec](https://alistapart.com/blog/post/css-regions-considered-harmful)).

## Getting started

Bindery takes HTML content and applies a series of rules to map web conventions
(like links) into print conventions (like footnotes).

```
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

## Future

- Page Number references (Tables of Contents, Indexes)
- More control over spreads
- Customizable page sizing
- Examples for use with blogging platforms and virtual-DOM libraries.
- Documentation
