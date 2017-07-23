---
layout: post
title:  "Getting Started"
date:   2017-07-22 16:29:06 -0700
---

## Getting started

{% highlight html %}

<html>
  <div class="content">
    <!-- The whole content of your book -->
  </div>

  <script src="./bindery.js"></script>
  <script>
    let binder = new Bindery({
      source: ".content",
      rules: [
        Bindery.BreakBefore({ selector: "h2" }),
        Bindery.RunningHeader({ selector: "h2" }),
        Bindery.PageNumber(),
      ],
    });

    binder.makeBook();
  </script>
</html>

{% endhighlight %}
