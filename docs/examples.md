---
layout: grid
title:  Examples
shortTitle: Examples
permalink: /examples/
order: 3
inBook: true
---

### Gallery

<ul class="grid responsive-grid">
{% for ex in site.data.examples.gallery %}
  <li>
    <a href="{{ ex.url }}">
      <figure
        style="background-image: url(/bindery/assets/thumbs/{{ ex.thumb }});">
      </figure>
      <div class="grid-label">
        <h4>{{ ex.title | escape }}</h4>
        <p>{{ ex.desc | escape }}</p>
        <div>{{ ex.credit | escape }}</div>
      </div>
    </a>
  </li>
{% endfor %}
</ul>

### Examples

<ul class="grid responsive-grid">
{% for ex in site.data.examples.simple %}
  <li>
    <a href="/bindery/examples/{{ ex.id }}">
      <figure
        style="background-image: url(/bindery/assets/thumbs/{{ ex.thumb }});">
      </figure>
      <div class="grid-label">
        <h4>{{ ex.title | escape }}</h4>
        <p>{{ ex.desc | escape }}</p>
        <div>{{ ex.credit | escape }}</div>
      </div>
    </a>
  </li>
{% endfor %}
</ul>

