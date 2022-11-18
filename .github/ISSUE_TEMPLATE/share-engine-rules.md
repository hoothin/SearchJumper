---
name: Share Engine rules
about: Share your rules for search engines
title: ''
labels: ''
assignees: ''

---

<pre>
Paste rules here as:
[
  {
    "type": "Image",
    "icon": "image",
    "sites": [
      {
        "name": "Google image",
        "url": "https://www.google.com/search?q=%s&tbm=isch",
        "match": "www\\.google\\..*tbm=isch"
      }
    ]
  }
]
</pre>
