---
layout: page
title:  Demos
shortTitle: Demos
permalink: /demos/
order: 3
inBook: false
---

<!-- ## Examples -->

### Simple

<ul>
{% for ex in site.data.examples.simple %}
  <li>
      <a href="/bindery/examples/{{ ex.id }}">{{ ex.title | escape }}</a>
      <div>{{ ex.desc | escape }}</div>
  </li>
{% endfor %}
</ul>

### Advanced

<ul>
{% for ex in site.data.examples.advanced %}
  <li>
    <a href="/bindery/examples/{{ ex.id }}">{{ ex.title | escape }}</a>
    <div>{{ ex.desc | escape }}</div>
  </li>
{% endfor %}
</ul>

### Gallery
<ul>
{% for ex in site.data.examples.gallery %}
  <li>
    <a href="{{ ex.url }}">{{ ex.title | escape }}</a>
    <div>{{ ex.desc | escape }}</div>
  </li>
{% endfor %}
</ul>


<!-- #### Simple

- [Load remote content](#) ([Source](#))
- [Set page size](#) ([Source](#))
- [Customize running headers](#) ([Source](#))
- [Use spreads and bleed](#)
- [Turn `<a>` tags into <span class="sc">url</span>s as footnotes](https://github.com/evnbr/bindery/tree/master/example)
- [Turn your `<nav>` into a table of contents](#)

#### Advanced

- [Dynamic background color](https://github.com/evnbr/bindery/tree/master/example)
- [Type that starts out big and gets smaller](https://github.com/evnbr/bindery/tree/master/example) (à la [Irma Boom](http://www.nytimes.com/2007/03/18/style/18iht-DESIGN19.4945906.html))
- [Fore-edge printing](https://github.com/evnbr/bindery/tree/master/example)
- [Convert a video into a flipbook](https://github.com/evnbr/bindery/tree/master/example) -->
