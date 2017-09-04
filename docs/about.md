---
layout: page
title:  About
shortTitle: About
permalink: /notes/
order: 4
inBook: true
---

<!-- ## Notes -->

<!-- ### Print to Web to Print

Computer printers predate computer screens. Here is where a short history would go. -->

### Background

Bindery.js 1.0 was developed in Spring 2014 for [for/with/in](http://htmloutput.risd.gd/),
a publication from participants in the graphic design course *HTML Output* at [RISD](http://risd.edu). It was based on the [much-maligned](https://alistapart.com/blog/post/css-regions-considered-harmful), [now abandoned](https://arstechnica.com/information-technology/2014/01/google-plans-to-dump-adobe-css-tech-to-make-blink-fast-not-rich/) CSS Regions spec, using [a polyfill ](https://github.com/FremyCompany/css-regions-polyfill). [Catherine Leigh Schmidt](http://cath.land) and [Lukas WinklerPrins](http://ltwp.net) produced a Jekyll theme called [Baby Bindery](https://github.com/thedesignoffice/babybindery) for the [Design Office](http://thedesignoffice.org/) based on this initial version.

Bindery.js 2.0 has been redeveloped since February 2017 by [Evan Brooks](http://evanbrooks.info). It has been rewritten from scratch to be smaller, faster, more flexible, and more robust.  With thanks to [John Caserta](http://johncaserta.com/) and [Teddy Bradford](#) for contributions and feedback.

Report bugs, make suggestions, or lend a hand
  <a href="https://github.com/evnbr/bindery">on Github</a>.

### What bindery is not

1. *InDesign*— Bindery is for people who are interested in creating layouts
programmatically. It's not a graphical user interface (though you could build one around it).
2. *A PDF generator*— Bindery assumes you're printing straight from
  the browser. If you want to adjust a PDF setting, your browser must support it—for
  example, you must use a page size provided by your browser's print dialog.
3. *[LaTeX](https://www.latex-project.org/)*— LaTeX is a markup language and typesetting system popular in the scientific community. Bindery is intended for everyone who knows web standards (or is learning). It takes advantage of all the existing tools and documentation—browsers, text editors, web inspectors, etc.
4. *[CSS Regions](https://www.w3.org/TR/css-regions-1/)*— CSS Regions was an ill-fated Adobe-led effort to support magazine-like layouts on the web. A polyfill is available [here](https://github.com/FremyCompany/css-regions-polyfill). Bindery's pagination code is much more limited— it doesn't interpret your CSS rules, assumes there's only one flow per page, and assumes you're going to print it.

### Colophon
This page was rendered at 7:05 PM on August 30, 2017 with Google Chrome 45.1 on Mac OSX 10.9.
<script>document.write(window.navigator.userAgent)</script>
It is displayed at <script>document.write(window.innerWidth + ' by ' + window.innerHeight)</script> pixels on a screen of <script>document.write(screen.width + ' by ' + screen.height)</script> pixels, with a device pixel ratio of <script>document.write(window.devicePixelRatio)</script>.

Text is set in [Tiempos Headline](https://klim.co.nz/retail-fonts/tiempos-headline/) by [Kris Sowersby](https://klim.co.nz/), and
code samples are set in [Input Mono Narrow](http://input.fontbureau.com/) by [David Jonathan Ross](https://djr.com/).

This site was last updated at {{ site.time  | date: "%l:%M %p on %A, %B %d, %Y" }}. It is built with [Jekyll](https://jekyllrb.com/) and
hosted on [Github Pages](https://pages.github.com/). Its source code is available [here](https://github.com/evnbr/bindery/).

Made with 🌫 in San Francisco.
