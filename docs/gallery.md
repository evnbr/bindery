---
layout: grid
title: Gallery
permalink: /gallery/
redirect_from: /books/
order: 3
inBook: true
---

### Books & tools made with bindery

<ul class="grid responsive-grid">
{% for ex in site.data.examples.gallery %}
  <li>
    <a href="{{ ex.url }}" class="btn-img">
        <figure style="background-image: url(/assets/thumbs/{{ ex.thumb }});"></figure>
    </a>
    <div class="grid-label">
        <a href="{{ ex.url }}">{{ ex.title | escape }}</a>
        <p>{{ ex.desc | escape }}</p>
        <div class="credit">{{ ex.credit | escape }}</div>
    </div>
  </li>
{% endfor %}
</ul>

<a class="btn" href="https://github.com/evnbr/bindery/blob/master/docs/_data/examples.yml">Add yours?</a>

### Getting started

<ul class="grid responsive-grid">
{% for ex in site.data.examples.simple %}
  <li>
      <figure style="background-image: url(/assets/thumbs/{{ ex.thumb }});"></figure>
      <div class="grid-label">
        {% if ex.id %}
          <a href="/examples/{{ ex.id }}">{{ ex.title | escape }}</a>
        {% else %}
          <a href="{{ ex.url }}">{{ ex.title | escape }}</a>
        {% endif %}
        <p>{{ ex.desc | escape }}</p>
        <div class="credit">{{ ex.credit | escape }}</div>
      </div>
  </li>
{% endfor %}
</ul>
