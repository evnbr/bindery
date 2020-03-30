---
layout: page
title: About
permalink: /about/
order: 4
inBook: true
---

- Github: Report bugs, make suggestions, or lend a hand
  <a href="https://github.com/evnbr/bindery">on Github</a>.
- Twitter: Follow <a href="https://twitter.com">@bindery_js</a> on twitter for updates.

### History

Bindery.js 1.0 was developed in Spring 2014 for [for/with/in](http://htmloutput.risd.gd),
a publication from participants in the graphic design course _HTML Output_ at [RISD](http://risd.edu). It was based on the [much-maligned](https://alistapart.com/blog/post/css-regions-considered-harmful), [now abandoned](https://arstechnica.com/information-technology/2014/01/google-plans-to-dump-adobe-css-tech-to-make-blink-fast-not-rich) CSS Regions spec, using [a polyfill](https://github.com/FremyCompany/css-regions-polyfill). [Catherine Leigh Schmidt](http://cath.land) and [Lukas WinklerPrins](http://ltwp.net) produced a Jekyll theme called [Baby Bindery](https://github.com/thedesignoffice/babybindery) for the [Design Office](http://thedesignoffice.org/) based on this initial version.

Bindery.js 2.0 has been developed since February 2017 by [Evan Brooks](https://evanbrooks.info). It has been rewritten from scratch to be smaller, faster, more flexible, and more robust. With thanks to [John Caserta](http://johncaserta.com/) and [Teddy Bradford](https://teddybradford.com/) for contributions and feedback.

### Principles

1. _Programmatic over precise_: Bindery is intended for people who are interested in creating layouts
   with systems and rules. It's not a direct-manipulation tool like InDesign.
2. _Built for today_: Bindery's makes it easy to get started with HTML and CSS, but further customization requires javascript. That could change if browser makers adopt new standards like [CSS Paged Media Level 3](https://drafts.csswg.org/css-page-3/) and [CSS Generated Content ](https://www.w3.org/TR/css-gcpm-3/).
3. _Don't reinvent the wheel_: Bindery relies on your browser's PDF generation. If you want to adjust a PDF setting, your browser must support it— different browsers and platforms may have different options.

<div class="colophon-wrap" markdown="1">

### Colophon

Text is set in [Tiempos Headline](https://klim.co.nz/retail-fonts/tiempos-headline) by [Klim Type](https://klim.co.nz), and
code samples are set in [Input Mono](http://input.fontbureau.com) by [David Jonathan Ross](https://djr.com).

This page was rendered at <span id='now'>[Time and Date]</span> with <span id='browser'>[Browser]</span>.
<span id='displayInfo'></span>

This site was last updated at {{ site.time  | date: "%l:%M %p on %A, %B %d, %Y" }}. It is built with [Jekyll](https://jekyllrb.com) and
hosted on [Github Pages](https://pages.github.com). Its source code is available [here](https://github.com/evnbr/bindery/tree/master/docs).

</div>

<script type='text/javascript' src='/bindery/js/moment.min.js'></script>
<script type='text/javascript' src='/bindery/js/platform.js'></script>
<script type='text/javascript' src='/bindery/js/colophon.js'></script>
