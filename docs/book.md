---
layout: book
title:  Book
shortTitle: About
permalink: /book/
---

{% assign pages_list = (site.pages | sort: 'order') %}
{% for p in pages_list %}
  {% if p.order %}
    <h2>{{ p.title | escape }}</h2>
    <article>
      {{ p.content }}
    </article>
  {% endif %}
{% endfor %}
