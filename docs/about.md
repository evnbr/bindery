---
layout: page
title: About
permalink: /about/
order: 4
inBook: true
---

### Approach

Bindery is intended for anyone new to web design. The documentation doesn't assume you know javascript, and you don't need a module bundler or build step to get started. If you need help, or something seems unclear in the documentation, feel free to [open an issue](https://github.com/evnbr/bindery/issues/new/choose) on Github or ask [@bindery_js](https://twitter.com/bindery_js) on twitter.

Bindery relies on your browser's PDF generation. If you want to adjust a PDF setting, your browser must support it— different browsers and platforms may have different options.

Bindery is open source—report bugs, make suggestions, or lend a hand [on Github](https://github.com/evnbr/bindery).

### History

Bindery.js 1.0 was developed in Spring 2014 for [for/with/in](http://htmloutput.risd.gd),
a publication from participants in the graphic design course _HTML Output_ at [RISD](http://risd.edu). Fellow course members [Catherine Leigh Schmidt](http://cath.land) and [Lukas WinklerPrins](http://ltwp.net) produced a Jekyll theme called [Baby Bindery](https://github.com/thedesignoffice/babybindery) for the [Design Office](http://thedesignoffice.org/) based on this initial version.

Bindery.js 2.0 has been developed since February 2017 by [Evan Brooks](https://evanbrooks.info). It has been rewritten from scratch to be smaller, faster, more flexible, and more robust. With thanks to [John Caserta](http://johncaserta.com/) and [Teddy Bradford](https://teddybradford.com/) for contributions and feedback.

Web browsers may eventually support some of Bindery's features natively— see [CSS Paged Media Level 3](https://drafts.csswg.org/css-page-3/) and [CSS Generated Content](https://www.w3.org/TR/css-gcpm-3/). Note that CSS drafts and standards aren't guaranteed to be adopted. The initial version of Bindery was based on the [CSS Regions](https://drafts.csswg.org/css-regions/) draft, which was [criticized](https://alistapart.com/blog/post/css-regions-considered-harmful) and [later abandoned by Chrome](https://arstechnica.com/information-technology/2014/01/google-plans-to-dump-adobe-css-tech-to-make-blink-fast-not-rich). Cross-element layout in Bindery is currently handled by [regionize.js](https://github.com/evnbr/regionize).

### Colophon

<div class="colophon-wrap" markdown="1">

Text is set in [Tiempos Headline](https://klim.co.nz/retail-fonts/tiempos-headline) by [Klim Type](https://klim.co.nz), and
code samples are set in [Input Mono](http://input.fontbureau.com) by [David Jonathan Ross](https://djr.com).

This page was rendered at <span id='now'>[Time and Date]</span> with <span id='browser'>[Browser]</span>.
<span id='displayInfo'></span>

This site was last updated at {{ site.time  | date: "%l:%M %p on %A, %B %d, %Y" }}. It is built with [Jekyll](https://jekyllrb.com) and
hosted on [Github Pages](https://pages.github.com). Its source code is available [here](https://github.com/evnbr/bindery/tree/master/docs).

</div>

<script type='text/javascript' src='/js/moment.min.js'></script>
<script type='text/javascript' src='/js/platform.js'></script>
<script type='text/javascript' src='/js/colophon.js'></script>
