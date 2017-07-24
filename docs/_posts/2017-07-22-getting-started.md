---
layout: post
title:  "Getting Started"
date:   2017-07-22 16:29:06 -0700
---

## Getting started

If you have web design experience, bindery.js lets you think of print as an extension of responsive design. If you have print design experience, it enables you to express layouts programmatically, without giving up capabilities you know from InDesign.

Just include the script on the same page as your content, and you're ready to go.
<!-- <a class="btn" href="#" class="btn">Download (69kb)</a> -->


{% highlight html %}

<div class="content">
  <!-- The contents of your book -->
</div>

<script src="./bindery.min.js"></script>
<script>
  Bindery.makeBook({
    source: ".content",
    rules: [
      Bindery.BreakBefore({ selector: "h2" }),
      Bindery.RunningHeader({ selector: "h2" }),
      Bindery.PageNumber(),
    ],
  });
</script>

{% endhighlight %}
