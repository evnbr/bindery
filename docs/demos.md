---
layout: grid
title:  Demos
shortTitle: Demos
permalink: /demos/
order: 3
inBook: false
---

<ul class="grid">
{% for ex in site.data.examples.simple %}
  <li>
    <a href="/bindery/examples/{{ ex.id }}">
      <figure
        style="background-image: url(/bindery/assets/thumbs/{{ ex.thumb }});">
      </figure>
      <h4>{{ ex.title | escape }}</h4>
      <div>{{ ex.desc | escape }}</div>
    </a>
  </li>
{% endfor %}
</ul>

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
