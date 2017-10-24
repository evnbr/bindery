/* 📖 Bindery v2.0.0-alpha.10 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Bindery = factory());
}(this, (function () { 'use strict';

var BINDERY_VERSION = 'v2.0.0-alpha.10'

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
var browserSplit = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

var indexOf = [].indexOf;

var indexof = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

// contains, add, remove, toggle


var classList = ClassList;

function ClassList(elem) {
    var cl = elem.classList;

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    };

    return classList

    function add(token) {
        var list = getTokens();
        if (indexof(list, token) > -1) {
            return
        }
        list.push(token);
        setTokens(list);
    }

    function remove(token) {
        var list = getTokens()
            , index = indexof(list, token);

        if (index === -1) {
            return
        }

        list.splice(index, 1);
        setTokens(list);
    }

    function contains(token) {
        return indexof(getTokens(), token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token);
            return false
        } else {
            add(token);
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens();
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className;

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length;

        elem.className = list.join(" ");
        classList.length = length;

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i];
        }

        delete list[length];
    }
}

function filter (arr, fn) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i]);
    }
    return ret
}

function isTruthy(value) {
    return !!value
}

/**
 * Utils for HTML attributes
 * @module html-attributes
 */

// property to attribute names
var PROPS_TO_ATTRS = {
  'className': 'class',
  'htmlFor': 'for',
};

// map of attributes to the elements they affect
// see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
var HTML_ATTRIBUTES = {
  'accept': new Set([
    'form',
    'input',
  ]),

  'accept-charset': new Set([
    'form',
  ]),

  'accesskey': 'GLOBAL',

  'action': new Set([
    'form',
  ]),

  'align': new Set([
    'applet',
    'caption',
    'col',
    'colgroup',
    'hr',
    'iframe',
    'img',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
  ]),

  'alt': new Set([
    'applet',
    'area',
    'img',
    'input',
  ]),

  'async': new Set([
    'script',
  ]),

  'autocomplete': new Set([
    'form',
    'input',
  ]),

  'autofocus': new Set([
    'button',
    'input',
    'keygen',
    'select',
    'textarea',
  ]),

  'autoplay': new Set([
    'audio',
    'video',
  ]),

  'autosave': new Set([
    'input',
  ]),

  'bgcolor': new Set([
    'body',
    'col',
    'colgroup',
    'marquee',
    'table',
    'tbody',
    'tfoot',
    'td',
    'th',
    'tr',
  ]),

  'border': new Set([
    'img',
    'object',
    'table',
  ]),

  'buffered': new Set([
    'audio',
    'video',
  ]),

  'challenge': new Set([
    'keygen',
  ]),

  'charset': new Set([
    'meta',
    'script',
  ]),

  'checked': new Set([
    'command',
    'input',
  ]),

  'cite': new Set([
    'blockquote',
    'del',
    'ins',
    'q',
  ]),

  'class': 'GLOBAL',

  'code': new Set([
    'applet',
  ]),

  'codebase': new Set([
    'applet',
  ]),

  'color': new Set([
    'basefont',
    'font',
    'hr',
  ]),

  'cols': new Set([
    'textarea',
  ]),

  'colspan': new Set([
    'td',
    'th',
  ]),

  'content': new Set([
    'meta',
  ]),

  'contenteditable': 'GLOBAL',

  'contextmenu': 'GLOBAL',

  'controls': new Set([
    'audio',
    'video',
  ]),

  'coords': new Set([
    'area',
  ]),

  'data': new Set([
    'object',
  ]),

  'datetime': new Set([
    'del',
    'ins',
    'time',
  ]),

  'default': new Set([
    'track',
  ]),

  'defer': new Set([
    'script',
  ]),

  'dir': 'GLOBAL',

  'dirname': new Set([
    'input',
    'textarea',
  ]),

  'disabled': new Set([
    'button',
    'command',
    'fieldset',
    'input',
    'keygen',
    'optgroup',
    'option',
    'select',
    'textarea',
  ]),

  'download': new Set([
    'a',
    'area',
  ]),

  'draggable': 'GLOBAL',

  'dropzone': 'GLOBAL',

  'enctype': new Set([
    'form',
  ]),

  'for': new Set([
    'label',
    'output',
  ]),

  'form': new Set([
    'button',
    'fieldset',
    'input',
    'keygen',
    'label',
    'meter',
    'object',
    'output',
    'progress',
    'select',
    'textarea',
  ]),

  'formaction': new Set([
    'input',
    'button',
  ]),

  'headers': new Set([
    'td',
    'th',
  ]),

  'height': new Set([
    'canvas',
    'embed',
    'iframe',
    'img',
    'input',
    'object',
    'video',
  ]),

  'hidden': 'GLOBAL',

  'high': new Set([
    'meter',
  ]),

  'href': new Set([
    'a',
    'area',
    'base',
    'link',
  ]),

  'hreflang': new Set([
    'a',
    'area',
    'link',
  ]),

  'http-equiv': new Set([
    'meta',
  ]),

  'icon': new Set([
    'command',
  ]),

  'id': 'GLOBAL',

  'ismap': new Set([
    'img',
  ]),

  'itemprop': 'GLOBAL',

  'keytype': new Set([
    'keygen',
  ]),

  'kind': new Set([
    'track',
  ]),

  'label': new Set([
    'track',
  ]),

  'lang': 'GLOBAL',

  'language': new Set([
    'script',
  ]),

  'list': new Set([
    'input',
  ]),

  'loop': new Set([
    'audio',
    'bgsound',
    'marquee',
    'video',
  ]),

  'low': new Set([
    'meter',
  ]),

  'manifest': new Set([
    'html',
  ]),

  'max': new Set([
    'input',
    'meter',
    'progress',
  ]),

  'maxlength': new Set([
    'input',
    'textarea',
  ]),

  'media': new Set([
    'a',
    'area',
    'link',
    'source',
    'style',
  ]),

  'method': new Set([
    'form',
  ]),

  'min': new Set([
    'input',
    'meter',
  ]),

  'multiple': new Set([
    'input',
    'select',
  ]),

  'muted': new Set([
    'video',
  ]),

  'name': new Set([
    'button',
    'form',
    'fieldset',
    'iframe',
    'input',
    'keygen',
    'object',
    'output',
    'select',
    'textarea',
    'map',
    'meta',
    'param',
  ]),

  'novalidate': new Set([
    'form',
  ]),

  'open': new Set([
    'details',
  ]),

  'optimum': new Set([
    'meter',
  ]),

  'pattern': new Set([
    'input',
  ]),

  'ping': new Set([
    'a',
    'area',
  ]),

  'placeholder': new Set([
    'input',
    'textarea',
  ]),

  'poster': new Set([
    'video',
  ]),

  'preload': new Set([
    'audio',
    'video',
  ]),

  'radiogroup': new Set([
    'command',
  ]),

  'readonly': new Set([
    'input',
    'textarea',
  ]),

  'rel': new Set([
    'a',
    'area',
    'link',
  ]),

  'required': new Set([
    'input',
    'select',
    'textarea',
  ]),

  'reversed': new Set([
    'ol',
  ]),

  'rows': new Set([
    'textarea',
  ]),

  'rowspan': new Set([
    'td',
    'th',
  ]),

  'sandbox': new Set([
    'iframe',
  ]),

  'scope': new Set([
    'th',
  ]),

  'scoped': new Set([
    'style',
  ]),

  'seamless': new Set([
    'iframe',
  ]),

  'selected': new Set([
    'option',
  ]),

  'shape': new Set([
    'a',
    'area',
  ]),

  'size': new Set([
    'input',
    'select',
  ]),

  'sizes': new Set([
    'img',
    'link',
    'source',
  ]),

  'span': new Set([
    'col',
    'colgroup',
  ]),

  'spellcheck': 'GLOBAL',

  'src': new Set([
    'audio',
    'embed',
    'iframe',
    'img',
    'input',
    'script',
    'source',
    'track',
    'video',
  ]),

  'srcdoc': new Set([
    'iframe',
  ]),

  'srclang': new Set([
    'track',
  ]),

  'srcset': new Set([
    'img',
  ]),

  'start': new Set([
    'ol',
  ]),

  'step': new Set([
    'input',
  ]),

  'style': 'GLOBAL',

  'summary': new Set([
    'table',
  ]),

  'tabindex': 'GLOBAL',

  'target': new Set([
    'a',
    'area',
    'base',
    'form',
  ]),

  'title': 'GLOBAL',

  'type': new Set([
    'button',
    'input',
    'command',
    'embed',
    'object',
    'script',
    'source',
    'style',
    'menu',
  ]),

  'usemap': new Set([
    'img',
    'input',
    'object',
  ]),

  'value': new Set([
    'button',
    'option',
    'input',
    'li',
    'meter',
    'progress',
    'param',
  ]),

  'width': new Set([
    'canvas',
    'embed',
    'iframe',
    'img',
    'input',
    'object',
    'video',
  ]),

  'wrap': new Set([
    'textarea',
  ]),
};

function isStandardAttribute(attrName, tagName) {
  tagName = tagName.toLowerCase();
  var attr = HTML_ATTRIBUTES[attrName.toLowerCase()];
  return !!attr && (
    attr === 'GLOBAL' ||
    attr.has(tagName)
  );
}

function propToAttr(prop) {
  return PROPS_TO_ATTRS[prop] || prop;
}

var htmlAttributes = {
  isStandardAttribute: isStandardAttribute,
  propToAttr: propToAttr,
};

function Document() {}

Document.prototype.createTextNode = function(v) {
    var n = new Text();
    n.textContent = v;
    n.nodeName = '#text';
    n.nodeType = 3;
    return n;
};

Document.prototype.createElement = function(nodeName) {
    var el = new Element();
    el.nodeName = el.tagName = nodeName;
    return el;
};

Document.prototype.createComment = function(data) {
    var el = new Comment();
    el.data = data;
    return el;
};


function Node$1 () {}

Text.prototype = new Node$1();

Element.prototype = new Node$1();

Comment.prototype = new Node$1();


function Style (el) {
  this.el = el;
  this.styles = [];
}

Style.prototype.setProperty = function (n,v) {
    this.el._setProperty(this.styles, {name: n, value:v});
};

Style.prototype.getProperty = function(n) {
    return this.el._getProperty(this.styles, n);
};

Style.prototype.__defineGetter__('cssText', function () {
    var stylified = '';
    this.styles.forEach(function(s){
      stylified+=s.name+':'+s.value+';';
    });
    return stylified;
});

Style.prototype.__defineSetter__('cssText', function (v) {
    this.styles.length = 0;

    // parse cssText and set style attributes
    v.split(';').forEach(function(part){
      var splitPoint = part.indexOf(':');
      if (splitPoint){
        var key = part.slice(0, splitPoint).trim();
        var value = part.slice(splitPoint+1).trim();
        this.setProperty(key, value);
      }
    }, this);
});

function Attribute(name, value){
  if (name) {
    this.name = name;
    this.value = value ? value : '';
  }
}


function Element() {
    var self = this;

    this.style = new Style(this);
    this.classList = classList(this);
    this.childNodes = [];
    this.attributes = [];
    this.dataset = {};
    this.className = '';

    this._setProperty = function(arr, obj, key, val) {
      var p = self._getProperty(arr, key);
      if (p) {
        p.value = String(val);
        return;
      }
      arr.push('function' === typeof obj ? new obj(key.toLowerCase(),String(val)) : obj);
    };

    this._getProperty = function (arr, key) {
      if (!key) return;
      key = key.toLowerCase();
      for (var i=0;i<arr.length;i++) {
        if (key == arr[i].name) return arr[i];
      }
    };
}

Element.prototype.nodeType = 1;

Element.prototype.appendChild = function (child) {
    child.parentElement = this;
    this.childNodes.push(child);
    return child;
};

Element.prototype.setAttribute = function (n, v) {
  if (n == 'style'){
    this.style.cssText = v;
  } else {
    this._setProperty(this.attributes, Attribute, n, v);
  }
};

Element.prototype.getAttribute = function (n) {
  if (n == 'style'){
    return this.style.cssText
  } else {
    var result = this._getProperty(this.attributes, n);
    return typeof result !== 'undefined' ? result.value : null;
  }
};

Element.prototype.removeAttribute = function (n) {
  if (n === 'class') {
    delete this.className;
  } else {
    for (var i = 0, len = this.attributes.length; i < len; i++) {
      if (this.attributes[i].name === n) {
        this.attributes.splice(i, 1);
        break;
      }
    }
  }
};

Element.prototype.replaceChild = function(newChild, oldChild) {
    var self = this;
    var replaced = false;
    this.childNodes.forEach(function(child, index){
        if (child === oldChild) {
            self.childNodes[index] = newChild;
            newChild.parentElement = this;
            replaced = true;
        }
    });
    if (replaced) return oldChild;
};

Element.prototype.removeChild = function(rChild) {
    var self = this;
    var removed = true;
    this.childNodes.forEach(function(child, index){
        if (child === rChild) {
          // use splice to keep a clean childNode array
          self.childNodes.splice(index, 1);
          rChild.parentElement = null;
          removed = true;
        }
    });
    if (removed) return rChild;
};

Element.prototype.insertBefore = function (newChild, existingChild) {
  var childNodes = this.childNodes;

  if (existingChild === null) {
    childNodes.push(newChild);
  } else {
    for (var i = 0, len = childNodes.length; i < len; i++) {
      var child = childNodes[i];
      if (child === existingChild) {
        i === 0 ? childNodes.unshift(newChild) : childNodes.splice(i, 0, newChild);
        break;
      }
    }
  }
  newChild.parentElement = this;

  return newChild;
};

Element.prototype.addEventListener = function(type, listener, useCapture, wantsUntrusted) {
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.addEventListener
  // There is an implementation there but probably not worth it.
};

Element.prototype.removeEventListener = function(type, listener, useCapture) {
  // https://developer.mozilla.org/en/docs/Web/API/EventTarget.removeEventListener
  // There is an implementation there but probably not worth it.
};

Element.prototype.insertAdjacentHTML = function(position, text) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element.insertAdjacentHTML
  // Not too much work to implement similar to innerHTML below.
};

Element.prototype.__defineGetter__('innerHTML', function () {
    // regurgitate set innerHTML
    var s = this.childNodes.html || '';
    this.childNodes.forEach(function (e) {
      s += (e.outerHTML || e.textContent);
    });
    return s
});

Element.prototype.__defineSetter__('innerHTML', function (v) {
    //only handle this simple case that doesn't need parsing
    //this case is useful... parsing is hard and will need added deps!
    this.childNodes.length = 0;

    // hack to preserve set innerHTML - no parsing just regurgitation
    this.childNodes.html = v;
});


Element.prototype.__defineGetter__('outerHTML', function () {
  var a = [],  self = this;
  var VOID_ELEMENTS = {
    AREA: true,
    BASE: true,
    BR: true,
    COL: true,
    EMBED: true,
    HR: true,
    IMG: true,
    INPUT: true,
    KEYGEN: true,
    LINK: true,
    META: true,
    PARAM: true,
    SOURCE: true,
    TRACK: true,
    WBR: true
  };

  function _stringify(arr) {
    var attr = [], value;
    arr.forEach(function(a){
      value = ('style' != a.name) ? a.value : self.style.cssText;
      attr.push(a.name+'='+'\"'+escapeAttribute(value)+'\"');
    });
    return attr.length ? ' '+attr.join(" ") : '';
  }

  function _dataify(data) {
    var attr = [], value;
    Object.keys(data).forEach(function(name){
      attr.push('data-'+name+'='+'\"'+escapeAttribute(data[name])+'\"');
    });
    return attr.length ? ' '+attr.join(" ") : '';
  }

  function _propertify() {
    var props = [];
    for (var key in self) {
      var attrName = htmlAttributes.propToAttr(key);
      if (
        self.hasOwnProperty(key) &&
        ['string', 'boolean', 'number'].indexOf(typeof self[key]) !== -1 &&
        htmlAttributes.isStandardAttribute(attrName, self.nodeName) &&
        _shouldOutputProp(key, attrName)
      ) {
        props.push({name: attrName, value: self[key]});
      }
    }
    return props ? _stringify(props) : '';
  }

  function _shouldOutputProp(prop, attr) {
    if (self.getAttribute(attr)) {
      // let explicitly-set attributes override props
      return false;
    } else {
      if (prop === 'className' && !self[prop]) {
        return false;
      }
    }
    return true;
  }

  var attrs = this.style.cssText ? this.attributes.concat([{name: 'style'}]) : this.attributes;

  a.push('<'+this.nodeName + _propertify() + _stringify(attrs) + _dataify(this.dataset) +'>');

  if (!VOID_ELEMENTS[this.nodeName.toUpperCase()]){
    a.push(this.innerHTML);
    a.push('</'+this.nodeName+'>');
  }

  return a.join('')
});

Element.prototype.__defineGetter__('textContent', function () {
  var s = '';
  this.childNodes.forEach(function (e) {
    s += e.textContent;
  });
  return s
});

Element.prototype.__defineSetter__('textContent', function (v) {
  var textNode = new Text();
  textNode.textContent = v;
  this.childNodes = [textNode];
  return v
});

Element.prototype.addEventListener = function(t, l) {};

function escapeHTML(s) {
  return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}

function escapeAttribute(s) {
  return escapeHTML(s).replace(/"/g, '&quot;')
}

Element.prototype.nodeValue = null;

function Text(){}

Text.prototype.nodeType = 3;

Text.prototype.nodeName = '#text';

Text.prototype.__defineGetter__('textContent', function() {
  return escapeHTML(this.value || '');
});

Text.prototype.__defineSetter__('textContent', function(v) {
  this.value = v;
});

Text.prototype.__defineGetter__('nodeValue', function() {
  return escapeHTML(this.value || '');
});

Text.prototype.__defineSetter__('nodeValue', function(v) {
  this.value = v;
});

Text.prototype.__defineGetter__('length', function() {
  return (this.value || '').length;
});

Text.prototype.replaceData = function(offset, length, str) {
  this.value = this.value.slice(0, offset) + str + this.value.slice(offset + length);
};

function Comment(){}

Comment.prototype.nodeType = 8;

Comment.prototype.nodeName = '#comment';

Comment.prototype.__defineGetter__('data', function() {
  return this.value
});

Comment.prototype.__defineSetter__('data', function(v) {
  this.value = v;
});

Comment.prototype.__defineGetter__('outerHTML', function() {
  return '<!--' + escapeHTML(this.value || '') + '-->'
});

Comment.prototype.__defineGetter__('nodeValue', function() {
  return escapeHTML(this.value || '');
});

Comment.prototype.__defineSetter__('nodeValue', function(v) {
  this.value = v;
});

function defineParentNode (obj) {
  obj.__defineGetter__('parentNode', function () { return this.parentElement });
}

defineParentNode(Element.prototype);
defineParentNode(Comment.prototype);
defineParentNode(Text.prototype);
defineParentNode(Node$1.prototype);

var htmlElement = {
  Document: Document,
  Node: Node$1,
  Element: Element,
  Comment: Comment,
  Text: Text,
  document: new Document(),
};

var hyperscript = createCommonjsModule(function (module) {
var w = typeof window === 'undefined' ? htmlElement : window;
var document = w.document;
var Text = w.Text;

function context () {

  var cleanupFuncs = [];

  function h() {
    var args = [].slice.call(arguments), e = null;
    function item (l) {
      var r;
      function parseClass (string) {
        // Our minimal parser doesn’t understand escaping CSS special
        // characters like `#`. Don’t use them. More reading:
        // https://mathiasbynens.be/notes/css-escapes .

        var m = browserSplit(string, /([\.#]?[^\s#.]+)/);
        if(/^\.|#/.test(m[1]))
          e = document.createElement('div');
        forEach(m, function (v) {
          var s = v.substring(1,v.length);
          if(!v) return
          if(!e)
            e = document.createElement(v);
          else if (v[0] === '.')
            classList(e).add(s);
          else if (v[0] === '#')
            e.setAttribute('id', s);
        });
      }

      if(l == null)
        ;
      else if('string' === typeof l) {
        if(!e)
          parseClass(l);
        else
          e.appendChild(r = document.createTextNode(l));
      }
      else if('number' === typeof l
        || 'boolean' === typeof l
        || l instanceof Date
        || l instanceof RegExp ) {
          e.appendChild(r = document.createTextNode(l.toString()));
      }
      //there might be a better way to handle this...
      else if (isArray(l))
        forEach(l, item);
      else if(isNode(l))
        e.appendChild(r = l);
      else if(l instanceof Text)
        e.appendChild(r = l);
      else if ('object' === typeof l) {
        for (var k in l) {
          if('function' === typeof l[k]) {
            if(/^on\w+/.test(k)) {
              (function (k, l) { // capture k, l in the closure
                if (e.addEventListener){
                  e.addEventListener(k.substring(2), l[k], false);
                  cleanupFuncs.push(function(){
                    e.removeEventListener(k.substring(2), l[k], false);
                  });
                }else{
                  e.attachEvent(k, l[k]);
                  cleanupFuncs.push(function(){
                    e.detachEvent(k, l[k]);
                  });
                }
              })(k, l);
            } else {
              // observable
              e[k] = l[k]();
              cleanupFuncs.push(l[k](function (v) {
                e[k] = v;
              }));
            }
          }
          else if(k === 'style') {
            if('string' === typeof l[k]) {
              e.style.cssText = l[k];
            }else{
              for (var s in l[k]) (function(s, v) {
                if('function' === typeof v) {
                  // observable
                  e.style.setProperty(s, v());
                  cleanupFuncs.push(v(function (val) {
                    e.style.setProperty(s, val);
                  }));
                } else
                  var match = l[k][s].match(/(.*)\W+!important\W*$/);
                  if (match) {
                    e.style.setProperty(s, match[1], 'important');
                  } else {
                    e.style.setProperty(s, l[k][s]);
                  }
              })(s, l[k][s]);
            }
          } else if(k === 'attrs') {
            for (var v in l[k]) {
              e.setAttribute(v, l[k][v]);
            }
          }
          else if (k.substr(0, 5) === "data-") {
            e.setAttribute(k, l[k]);
          } else {
            e[k] = l[k];
          }
        }
      } else if ('function' === typeof l) {
        //assume it's an observable!
        var v = l();
        e.appendChild(r = isNode(v) ? v : document.createTextNode(v));

        cleanupFuncs.push(l(function (v) {
          if(isNode(v) && r.parentElement)
            r.parentElement.replaceChild(v, r), r = v;
          else
            r.textContent = v;
        }));
      }

      return r
    }
    while(args.length)
      item(args.shift());

    return e
  }

  h.cleanup = function () {
    for (var i = 0; i < cleanupFuncs.length; i++){
      cleanupFuncs[i]();
    }
    cleanupFuncs.length = 0;
  };

  return h
}

var h = module.exports = context();
h.context = context;

function isNode (el) {
  return el && el.nodeName && el.nodeType
}

function forEach (arr, fn) {
  if (arr.forEach) return arr.forEach(fn)
  for (var i = 0; i < arr.length; i++) fn(arr[i], i);
}

function isArray (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var elementToString = function elementToString(node) {
  var tag = node.tagName.toLowerCase();
  var id = node.id ? '#' + node.id : '';

  var classes = '';
  if (node.classList.length > 0) {
    classes = '.' + [].concat(toConsumableArray(node.classList)).join('.');
  }

  var text = '';
  if (id.length < 1 && classes.length < 2) {
    text = '("' + node.textContent.substr(0, 30).replace(/\s+/g, ' ') + '...")';
  }
  return tag + id + classes + text;
};

// const p = 'bindery-';
var p = '📖-';

var prefix = function prefix(str) {
  return '' + p + str;
};
var prefixClass = function prefixClass(str) {
  return '.' + prefix(str);
};

var c = function c(str) {
  if (str[0] === '.') {
    return prefixClass(str.substr(1));
  }
  return prefix(str);
};

var last = function last(arr) {
  return arr[arr.length - 1];
};

var makeRanges = function makeRanges(arr) {
  var str = '';
  var prevNum = arr[0];
  var isInARange = false;
  arr.forEach(function (num, i) {
    var isLast = i === arr.length - 1;
    var isAdjacent = num === prevNum + 1;

    if (i === 0) {
      str += '' + num;
    } else if (isLast) {
      if (isAdjacent) {
        str += '\u2013' + num;
      } else if (isInARange) {
        str += '\u2013' + prevNum + ', ' + num;
      } else {
        str += ', ' + num;
      }
    } else if (isAdjacent) {
      isInARange = true;
    } else if (isInARange && !isAdjacent) {
      isInARange = false;
      str += '\u2013' + prevNum + ', ' + num;
    } else {
      str += ', ' + num;
    }
    prevNum = num;
  });
  // return `${str} - [${arr}]`;
  return str;
};

// Convert units, via pixels, while making assumptions

// Inch assumptions
var cssNumberRegEx = /^([+-]?[0-9]+(.?[0-9]+)?)(px|in|cm|mm|pt|pc)$/;
var isValidLength = function isValidLength(str) {
  return cssNumberRegEx.test(str);
};
var isValidSize = function isValidSize(size) {
  Object.keys(size).forEach(function (k) {
    if (!isValidLength(size[k])) {
      if (typeof size[k] === 'number') {
        throw Error('Size is missing units { ' + k + ': ' + size[k] + ' }');
      } else {
        throw Error('Invalid size { ' + k + ': ' + size[k] + ' }');
      }
    }
  });
};

var parseVal = function parseVal(str) {
  var matches = str.match(cssNumberRegEx);
  return {
    val: Number(matches[1]),
    unit: matches[3]
  };
};

var validate = function validate(opts, validOpts) {
  Object.keys(opts).forEach(function (k) {
    if (!validOpts[k]) {
      console.error('Bindery: \'' + validOpts.name + '\' doesn\'t have property \'' + k + '\'');
    } else {
      var val = opts[k];
      var checker = validOpts[k];
      if (!checker(val)) {
        console.error('Bindery: For property \'' + validOpts.name + '.' + k + '\', ' + JSON.stringify(val) + ' is not a valid value of type ' + checker.name);
      }
    }
  });
  return true;
};

var isObj = function isObj(val) {
  return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};

var OptionType = {
  enum: function _enum() {
    for (var _len = arguments.length, enumCases = Array(_len), _key = 0; _key < _len; _key++) {
      enumCases[_key] = arguments[_key];
    }

    var enumCheck = function enumCheck(str) {
      return enumCases.includes(str);
    };
    Object.defineProperty(enumCheck, 'name', { writable: true });
    enumCheck.name = 'enum ( \'' + enumCases.join('\' | \'') + '\' )';
    return enumCheck;
  },
  any: function any() {
    return true;
  },
  string: function string(val) {
    return typeof val === 'string';
  },
  length: function length(val) {
    return isValidLength(val);
  },
  bool: function bool(val) {
    return typeof val === 'boolean';
  },
  func: function func(val) {
    return typeof val === 'function';
  },

  obj: isObj,
  array: function array(val) {
    return Array.isArray(val);
  },
  shape: function shape(validShape) {
    return function (userShape) {
      return isObj(userShape) && validate(userShape, validShape);
    };
  },

  validate: validate
};

// via https://css-tricks.com/snippets/javascript/get-url-variables/
var urlQuery = (function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i += 1) {
    var pair = vars[i].split('=');
    if (pair[0] === variable) {
      return pair[1];
    }
  }
  return false;
});

var Book = function () {
  function Book() {
    classCallCheck(this, Book);

    this.pages = [];
    this.queued = [];
    this.isComplete = false;
  }

  createClass(Book, [{
    key: "pagesForSelector",


    // arguments: selector : String
    // return: pages : [ Int ]
    // if no matches: []
    value: function pagesForSelector(sel) {
      return this.pagesForTest(function (page) {
        return page.element.querySelector(sel);
      });
    }
    // arguments: testFunc : (element) => bool
    // return: pages : [ Int ]
    // if no matches: []

  }, {
    key: "pagesForTest",
    value: function pagesForTest(testFunc) {
      return this.pages.filter(function (pg) {
        return testFunc(pg.element);
      }).map(function (pg) {
        return pg.number;
      });
    }
  }, {
    key: "onComplete",
    value: function onComplete(func) {
      if (!this.isComplete) this.queued.push(func);else func();
    }
  }, {
    key: "setCompleted",
    value: function setCompleted() {
      this.isComplete = true;
      this.queued.forEach(function (func) {
        func();
      });
      this.queued = [];
    }
  }, {
    key: "pageCount",
    get: function get$$1() {
      return this.pages.length;
    }
  }]);
  return Book;
}();

var Page = function () {
  function Page() {
    classCallCheck(this, Page);

    this.flowContent = hyperscript(c('.content'));
    this.flowBox = hyperscript(c('.flowbox'), this.flowContent);
    this.footer = hyperscript(c('.footer'));
    this.background = hyperscript(c('.background'));
    this.element = hyperscript(c('.page') + c('.page-size'), this.background, this.flowBox, this.footer);
  }

  createClass(Page, [{
    key: 'overflowAmount',
    value: function overflowAmount() {
      var contentH = this.flowContent.offsetHeight;
      var boxH = this.flowBox.offsetHeight;

      if (boxH === 0) {
        throw Error('Bindery: Trying to flow into a box of zero height.');
      }

      return contentH - boxH;
    }
  }, {
    key: 'hasOverflowed',
    value: function hasOverflowed() {
      return this.overflowAmount() > -5;
    }
  }, {
    key: 'setLeftRight',
    value: function setLeftRight(dir) {
      if (dir === 'left') {
        this.side = dir;
        this.element.classList.remove(c('right'));
        this.element.classList.add(c('left'));
      } else if (dir === 'right') {
        this.side = dir;
        this.element.classList.remove(c('left'));
        this.element.classList.add(c('right'));
      } else {
        throw Error('Bindery: Setting page to invalid direction' + dir);
      }
    }
  }, {
    key: 'setPreference',
    value: function setPreference(dir) {
      if (dir === 'left') this.alwaysLeft = true;
      if (dir === 'right') this.alwaysRight = true;
    }
  }, {
    key: 'suppressErrors',
    get: function get$$1() {
      return this.suppress || false;
    },
    set: function set$$1(newVal) {
      this.suppress = newVal;
      if (newVal) {
        this.element.classList.add(c('is-overflowing'));
      } else {
        this.element.classList.remove(c('is-overflowing'));
      }
    }
  }, {
    key: 'isEmpty',
    get: function get$$1() {
      return !this.hasOutOfFlowContent && this.flowContent.textContent.trim() === '' && this.flowContent.offsetHeight < 1;
    }
  }, {
    key: 'isLeft',
    get: function get$$1() {
      return this.side === 'left';
    }
  }, {
    key: 'isRight',
    get: function get$$1() {
      return this.side === 'right';
    }
  }], [{
    key: 'isSizeValid',
    value: function isSizeValid() {
      document.body.classList.remove(c('viewing'));

      var testPage = new Page();
      var measureArea = document.querySelector(c('.measure-area'));
      if (!measureArea) measureArea = document.body.appendChild(hyperscript(c('.measure-area')));

      measureArea.innerHTML = '';
      measureArea.appendChild(testPage.element);
      var box = testPage.flowBox.getBoundingClientRect();

      measureArea.parentNode.removeChild(measureArea);

      return box.height > 100 && box.width > 100; // TODO: Number is arbitrary
    }
  }]);
  return Page;
}();

// Even when there is no debugDelay,
// the throttler will occassionally use rAF
// to prevent the call stack from getting too big.
//
// There might be a better way to do this.
var MAX_CALLS = 1000;

var Scheduler = function () {
  function Scheduler(debuggable) {
    classCallCheck(this, Scheduler);

    this.numberOfCalls = 0;
    this.resumeLimit = Infinity;
    this.callsSinceResume = 0;
    this.queuedFunc = null;
    this.isPaused = false;
    this.useDelay = debuggable;
    this.delayTime = 100;

    if (debuggable) {
      // Only expose these
      window.binderyDebug = {
        pause: this.pause.bind(this),
        resume: this.resume.bind(this),
        resumeFor: this.resumeFor.bind(this),
        step: this.step.bind(this),
        finish: this.finish.bind(this)
      };
      console.log('Bindery: Debug layout with the following: \nbinderyDebug.pause() \nbinderyDebug.resume()\n binderyDebug.resumeFor(n) // pauses after n steps, \nbinderyDebug.step()');
    }
  }

  createClass(Scheduler, [{
    key: 'throttle',
    value: function throttle(func) {
      this.callsSinceResume += 1;

      if (this.callsSinceResume > this.resumeLimit) {
        this.endResume();
      }

      if (this.isPaused) {
        this.queuedFunc = func;
      } else if (this.useDelay) {
        setTimeout(func, this.delayTime);
      } else if (this.numberOfCalls < MAX_CALLS) {
        this.numberOfCalls += 1;
        func();
      } else {
        this.numberOfCalls = 0;
        if (document.hidden) {
          // Tab in background
          setTimeout(func, 1);
        } else {
          requestAnimationFrame(func);
        }
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this.isPaused) return 'Already paused';
      this.isPaused = true;
      return 'Paused';
    }
  }, {
    key: 'resumeDelay',
    value: function resumeDelay() {
      this.useDelay = true;
      this.resume();
    }
  }, {
    key: 'finish',
    value: function finish() {
      this.useDelay = false;
      this.resume();
    }
  }, {
    key: 'resume',
    value: function resume() {
      if (this.isPaused) {
        this.isPaused = false;
        if (this.queuedFunc) {
          this.queuedFunc();
          this.queuedFunc = null;
        } else {
          return 'Layout complete';
        }
        return 'Resuming';
      }
      return 'Already running';
    }
  }, {
    key: 'step',
    value: function step() {
      if (!this.isPaused) {
        return this.pause();
      }
      if (this.queuedFunc) {
        var queued = this.queuedFunc;
        var n = queued.name;
        this.queuedFunc = null;
        queued();
        return n;
      }
      return 'Layout complete';
    }
  }, {
    key: 'resumeFor',
    value: function resumeFor(n) {
      this.callsSinceResume = 0;
      this.resumeLimit = n;
      return this.resume();
    }
  }, {
    key: 'endResume',
    value: function endResume() {
      console.log('Paused after ' + this.resumeLimit);
      this.resumeLimit = Infinity;
      this.callsSinceResume = 0;
      this.pause();
    }
  }]);
  return Scheduler;
}();

var Rule = function Rule(options) {
  var _this = this;

  classCallCheck(this, Rule);

  this.name = options.name ? options.name : 'Unnamed Bindery Rule';
  this.selector = '';

  Object.keys(options).forEach(function (key) {
    _this[key] = options[key];
  });
};

var OutOfFlow = function (_Rule) {
  inherits(OutOfFlow, _Rule);

  function OutOfFlow(options) {
    classCallCheck(this, OutOfFlow);

    var _this = possibleConstructorReturn(this, (OutOfFlow.__proto__ || Object.getPrototypeOf(OutOfFlow)).call(this, options));

    _this.name = 'Out of Flow';
    return _this;
  }

  createClass(OutOfFlow, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt) {
      // Avoid breaking inside this element. Once it's completely added,
      // it will moved onto the background layer.

      elmt.setAttribute('data-ignore-overflow', true);
      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, book, continueOnNewPage, makeNewPage) {
      this.createOutOfFlowPages(elmt, book, makeNewPage);

      // Catches cases when we didn't need to create a new page. but unclear
      if (this.continue !== 'same' || book.pageInProgress.hasOutOfFlowContent) {
        continueOnNewPage(true);
        if (this.continue === 'left' || this.continue === 'right') {
          book.pageInProgress.setPreference(this.continue);
        }
      }

      return elmt;
    }
  }]);
  return OutOfFlow;
}(Rule);

// Options:
// selector: String

var FullBleedPage = function (_OutOfFlow) {
  inherits(FullBleedPage, _OutOfFlow);

  function FullBleedPage(options) {
    classCallCheck(this, FullBleedPage);

    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';

    var _this = possibleConstructorReturn(this, (FullBleedPage.__proto__ || Object.getPrototypeOf(FullBleedPage)).call(this, options));

    OptionType.validate(options, {
      name: 'FullBleedPage',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'inward', 'outward', 'clockwise', 'counterclockwise')
    });
    return _this;
  }

  createClass(FullBleedPage, [{
    key: 'createOutOfFlowPages',
    value: function createOutOfFlowPages(elmt, book, makeNewPage) {
      elmt.parentNode.removeChild(elmt);

      var newPage = void 0;
      if (book.pageInProgress.isEmpty) {
        newPage = book.pageInProgress;
      } else {
        newPage = makeNewPage();
        book.pages.push(newPage);
      }
      if (this.rotate !== 'none') {
        var rotateContainer = hyperscript(c('.rotate-container'));
        rotateContainer.classList.add(c('page-size-rotated'));
        rotateContainer.classList.add(c('rotate-' + this.rotate));
        rotateContainer.appendChild(newPage.background);
        newPage.element.appendChild(rotateContainer);
      }
      newPage.background.appendChild(elmt);
      newPage.hasOutOfFlowContent = true;
    }
  }]);
  return FullBleedPage;
}(OutOfFlow);

// Options:
// selector: String

var FullBleedSpread = function (_OutOfFlow) {
  inherits(FullBleedSpread, _OutOfFlow);

  function FullBleedSpread(options) {
    classCallCheck(this, FullBleedSpread);

    options.continue = options.continue || 'same';
    options.rotate = options.rotate || 'none';

    var _this = possibleConstructorReturn(this, (FullBleedSpread.__proto__ || Object.getPrototypeOf(FullBleedSpread)).call(this, options));

    OptionType.validate(options, {
      name: 'FullBleedSpread',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'same', 'left', 'right'),
      rotate: OptionType.enum('none', 'clockwise', 'counterclockwise')
    });
    return _this;
  }

  createClass(FullBleedSpread, [{
    key: 'createOutOfFlowPages',
    value: function createOutOfFlowPages(elmt, book, makeNewPage) {
      var _this2 = this;

      elmt.parentNode.removeChild(elmt);

      var leftPage = void 0;
      if (book.pageInProgress.isEmpty) {
        leftPage = book.pageInProgress;
      } else {
        leftPage = makeNewPage();
        book.pages.push(leftPage);
      }

      var rightPage = makeNewPage();
      book.pages.push(rightPage);

      if (this.rotate !== 'none') {
        [leftPage, rightPage].forEach(function (page) {
          var rotateContainer = hyperscript(c('.rotate-container'));
          rotateContainer.classList.add(c('spread-size-rotated'));
          rotateContainer.classList.add(c('rotate-spread-' + _this2.rotate));
          rotateContainer.appendChild(page.background);
          page.element.appendChild(rotateContainer);
        });
      }

      leftPage.background.appendChild(elmt);
      leftPage.element.classList.add(c('spread'));
      leftPage.setPreference('left');
      leftPage.isOutOfFlow = this.continue === 'same';
      leftPage.hasOutOfFlowContent = true;

      rightPage.background.appendChild(elmt.cloneNode(true));
      rightPage.element.classList.add(c('spread'));
      rightPage.setPreference('right');
      rightPage.isOutOfFlow = this.continue === 'same';
      rightPage.hasOutOfFlowContent = true;
    }
  }]);
  return FullBleedSpread;
}(OutOfFlow);

var PageBreak = function (_Rule) {
  inherits(PageBreak, _Rule);

  function PageBreak(options) {
    classCallCheck(this, PageBreak);

    options.position = options.position || 'before';
    options.continue = options.continue || 'next';

    var _this = possibleConstructorReturn(this, (PageBreak.__proto__ || Object.getPrototypeOf(PageBreak)).call(this, options));

    OptionType.validate(options, {
      name: 'PageBreak',
      selector: OptionType.string,
      continue: OptionType.enum('next', 'left', 'right'),
      position: OptionType.enum('before', 'after', 'both', 'avoid')
    });
    return _this;
  }

  createClass(PageBreak, [{
    key: 'beforeAdd',
    value: function beforeAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'before' || this.position === 'both') {
        if (!book.pageInProgress.isEmpty) {
          continueOnNewPage();
        }
        if (this.continue !== 'next') {
          book.pageInProgress.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }, {
    key: 'afterAdd',
    value: function afterAdd(elmt, book, continueOnNewPage) {
      if (this.position === 'after' || this.position === 'both') {
        var newPage = continueOnNewPage(true);
        if (this.continue !== 'next') {
          newPage.setPreference(this.continue);
        }
      }
      return elmt;
    }
  }, {
    key: 'avoidSplit',
    get: function get$$1() {
      return this.position === 'avoid';
    }
  }]);
  return PageBreak;
}(Rule);

var isFullPageRule = function isFullPageRule(rule) {
  return rule instanceof FullBleedSpread || rule instanceof FullBleedPage || rule instanceof PageBreak;
};

var dedupe = function dedupe(inputRules) {
  var conflictRules = inputRules.filter(isFullPageRule);
  var uniqueRules = inputRules.filter(function (rule) {
    return !conflictRules.includes(rule);
  });

  var firstSpreadRule = conflictRules.find(function (rule) {
    return rule instanceof FullBleedSpread;
  });
  var firstPageRule = conflictRules.find(function (rule) {
    return rule instanceof FullBleedPage;
  });

  // Only apply one fullpage or fullspread
  if (firstSpreadRule) uniqueRules.push(firstSpreadRule);else if (firstPageRule) uniqueRules.push(firstPageRule);else uniqueRules.push.apply(uniqueRules, toConsumableArray(conflictRules)); // multiple pagebreaks are ok

  return uniqueRules;
};

var RuleSet = function () {
  function RuleSet(rules) {
    classCallCheck(this, RuleSet);

    this.rules = rules;
    this.pageRules = rules.filter(function (r) {
      return r.eachPage;
    });
    this.beforeAddRules = rules.filter(function (r) {
      return r.selector && r.beforeAdd;
    });
    this.afterAddRules = rules.filter(function (r) {
      return r.selector && r.afterAdd;
    });
    this.selectorsNotToSplit = rules.filter(function (rule) {
      return rule.avoidSplit;
    }).map(function (rule) {
      return rule.selector;
    });
  }

  createClass(RuleSet, [{
    key: 'setup',
    value: function setup() {
      this.rules.forEach(function (rule) {
        if (rule.setup) rule.setup();
      });
    }
  }, {
    key: 'startPage',
    value: function startPage(pg, book) {
      this.rules.forEach(function (rule) {
        if (rule.afterPageCreated) rule.afterPageCreated(pg, book);
      });
    }
  }, {
    key: 'finishEveryPage',
    value: function finishEveryPage(book) {
      this.pageRules.forEach(function (rule) {
        book.pages.forEach(function (page) {
          rule.eachPage(page, book);
        });
      });
    }
  }, {
    key: 'finishPage',
    value: function finishPage(page, book) {
      this.pageRules.forEach(function (rule) {
        rule.eachPage(page, book);
      });
    }
  }, {
    key: 'beforeAddElement',
    value: function beforeAddElement(element, book, continueOnNewPage, makeNewPage) {
      var addedElement = element;

      var matchingRules = this.beforeAddRules.filter(function (rule) {
        return addedElement.matches(rule.selector);
      });
      // const uniqueRules = dedupeRules(matchingRules);

      matchingRules.forEach(function (rule) {
        addedElement = rule.beforeAdd(addedElement, book, continueOnNewPage, makeNewPage);
      });
      return addedElement;
    }
  }, {
    key: 'afterAddElement',
    value: function afterAddElement(originalElement, book, continueOnNewPage, makeNewPage, currentFlowElement) {
      var addedElement = originalElement;

      var matchingRules = this.afterAddRules.filter(function (rule) {
        return addedElement.matches(rule.selector);
      });
      var uniqueRules = dedupe(matchingRules);

      uniqueRules.forEach(function (rule) {
        addedElement = rule.afterAdd(addedElement, book, continueOnNewPage, makeNewPage, function overflowCallback(problemElement) {
          // TODO:
          // While this does catch overflows, it introduces a few new bugs.
          // It is pretty aggressive to move the entire node to the next page.
          // - 1. there is no guarentee it will fit on the new page
          // - 2. if it has childNodes, those side effects will not be undone,
          // which means footnotes will get left on previous page.
          // - 3. if it is a large paragraph, it will leave a large gap. the
          // ideal approach would be to only need to invalidate
          // the last line of text.
          problemElement.parentNode.removeChild(problemElement);
          continueOnNewPage();
          currentFlowElement().appendChild(problemElement);
          return rule.afterAdd(problemElement, book, continueOnNewPage, makeNewPage, function () {
            console.log('Couldn\'t apply ' + rule.name + ' to ' + elementToString(problemElement) + '. Caused overflows twice.');
          });
        });
      });
      return addedElement;
    }
  }]);
  return RuleSet;
}();

var indexOfNextInFlowPage = function indexOfNextInFlowPage(pages, startIndex) {
  for (var i = startIndex; i < pages.length; i += 1) {
    if (!pages[i].isOutOfFlow) {
      return i;
    }
  }
  return startIndex;
};

// Given an array of pages with alwaysLeft, alwaysRight, and isOutOfFlow
// properties.
//
// Orders them so that alwaysLeft and alwaysRight are true.

// If the page is 'in flow', order must be respected, so extra blank pages
// are inserted.
//
// If the page is 'out of flow', we'd prefer not to add a blank page.
// Instead it floats backwards in the book, pulling the next
// in-flow page forward. If several 'out of flow' pages
// are next to each other, they will remain in order, all being pushed
// backward together.


var orderPages = function orderPages(pages, makeNewPage) {
  var orderedPages = pages.slice();

  for (var i = 0; i < orderedPages.length; i += 1) {
    var page = orderedPages[i];
    var isLeft = i % 2 !== 0;

    if (isLeft && page.alwaysRight || !isLeft && page.alwaysLeft) {
      if (page.isOutOfFlow) {
        var indexToSwap = indexOfNextInFlowPage(orderedPages, i + 1);
        var pageToMoveUp = orderedPages[indexToSwap];
        orderedPages.splice(indexToSwap, 1);
        orderedPages.splice(i, 0, pageToMoveUp);
      } else {
        orderedPages.splice(i, 0, makeNewPage());
      }
    }
  }
  return orderedPages;
};

var annotatePages = function annotatePages(pages) {
  // ———
  // NUMBERING

  // TODO: Pass in facingpages options
  var facingPages = true;
  if (facingPages) {
    pages.forEach(function (page, i) {
      page.number = i + 1;
      page.setLeftRight(i % 2 === 0 ? 'right' : 'left');
    });
  } else {
    pages.forEach(function (page) {
      page.setLeftRight('right');
    });
  }

  // ———
  // RUNNING HEADERS

  // Sections to annotate with.
  // This should be a hierarchical list of selectors.
  // Every time one is selected, it annotates all following pages
  // and clears any subselectors.
  // TODO: Make this configurable
  var running = { h1: '', h2: '', h3: '', h4: '', h5: '', h6: '' };

  pages.forEach(function (page) {
    page.heading = {};
    Object.keys(running).forEach(function (tagName, i) {
      var element = page.element.querySelector(tagName);
      if (element) {
        running[tagName] = element.textContent;
        // clear remainder
        Object.keys(running).forEach(function (tag, j) {
          if (j > i) running[tag] = '';
        });
      }
      if (running[tagName] !== '') {
        page.heading[tagName] = running[tagName];
      }
    });
  });
};

// @param rules: array of Bindery.Rules
// @return: A new function that clones the given
// breadcrumb according to those rules. (original : Array) => clone : Array
//
// The breadcrumb is an array of nested elments,
// for example .content > article > p > a).
//
// It's shallowly cloned every time we move to the next page,
// to create the illusion that nodes are continuing from page
// to page.
//
// The transition can be customized by setting a Split rule,
// which lets you add classes to the original and cloned element
// to customize styling.

var breadcrumbCloner = function breadcrumbCloner(rules) {
  // METHODS
  var markAsContinues = function markAsContinues(node) {
    node.classList.add(c('continues'));
    rules.filter(function (rule) {
      return rule.customContinuesClass;
    }).forEach(function (rule) {
      return node.classList.add(rule.customContinuesClass);
    });
  };

  var markAsContinuation = function markAsContinuation(node) {
    node.classList.add(c('continuation'));
    rules.filter(function (rule) {
      return rule.customContinuationClass;
    }).forEach(function (rule) {
      return node.classList.add(rule.customContinuationClass);
    });
  };

  return function (origBreadcrumb) {
    var newBreadcrumb = [];

    for (var i = origBreadcrumb.length - 1; i >= 0; i -= 1) {
      var original = origBreadcrumb[i];
      var clone = original.cloneNode(false); // shallow
      clone.innerHTML = '';

      markAsContinues(original);
      markAsContinuation(clone);

      // Special case for ordered lists
      if (clone.tagName === 'OL') {
        // restart numbering
        var prevStart = 1;
        if (original.hasAttribute('start')) {
          // the OL is also a continuation
          prevStart = parseInt(original.getAttribute('start'), 10);
        }
        if (i < origBreadcrumb.length - 1 && origBreadcrumb[i + 1].tagName === 'LI') {
          // the first list item is a continuation
          prevStart -= 1;
        }
        var prevCount = original.children.length;
        var newStart = prevStart + prevCount;
        clone.setAttribute('start', newStart);
      }

      if (i < origBreadcrumb.length - 1) clone.appendChild(newBreadcrumb[i + 1]);
      newBreadcrumb[i] = clone;
    }

    return newBreadcrumb;
  };
};

var waitForImage = function waitForImage(image, done) {
  var fileName = image.src.substring(image.src.lastIndexOf('/') + 1);
  // console.log(`Bindery: Waiting for image '${fileName}' size to load`);

  var pollForSize = setInterval(function () {
    if (image.naturalWidth) {
      clearInterval(pollForSize);
      done();
    }
  }, 10);

  image.addEventListener('error', function () {
    clearInterval(pollForSize);
    console.error('Bindery: Image \'' + fileName + '\' failed to load.');
    done();
  });
  image.src = image.src;
};

// import specificity from 'specificity'; TODO

// Utils
// Bindery
// paginate
var MAXIMUM_PAGE_LIMIT = 9999;

// Walk up the tree to see if we are within
// an overflow-ignoring node
var shouldIgnoreOverflow = function shouldIgnoreOverflow(node) {
  if (node.hasAttribute('data-ignore-overflow')) return true;
  if (node.parentElement) return shouldIgnoreOverflow(node.parentElement);
  return false;
};

var paginate = function paginate(_ref) {
  var content = _ref.content,
      rules = _ref.rules,
      success = _ref.success,
      progress = _ref.progress,
      error = _ref.error,
      isDebugging = _ref.isDebugging;

  // SETUP
  var startLayoutTime = window.performance.now();
  var layoutWaitingTime = 0;

  var scheduler = new Scheduler(isDebugging);
  var ruleSet = new RuleSet(rules);
  var continueBreadcrumb = breadcrumbCloner(rules);
  var measureArea = document.body.appendChild(hyperscript(c('.measure-area')));

  var breadcrumb = []; // Keep track of position in original tree
  var book = new Book();

  var updatePaginationProgress = void 0;
  var finishPagination = void 0;

  var currentFlowElement = function currentFlowElement() {
    return breadcrumb[0] ? last(breadcrumb) : book.pageInProgress.flowContent;
  };

  var canSplit = function canSplit() {
    return !shouldIgnoreOverflow(currentFlowElement());
  };

  var makeNewPage = function makeNewPage() {
    var newPage = new Page();
    measureArea.appendChild(newPage.element);

    ruleSet.startPage(newPage, book);
    return newPage;
  };

  var finishPage = function finishPage(page, ignoreOverflow) {
    if (page && page.hasOverflowed()) {
      console.warn('Bindery: Page overflowing', book.pageInProgress.element);
      if (!page.suppressErrors && !ignoreOverflow) {
        error('Moved to new page when last one is still overflowing');
        throw Error('Bindery: Moved to new page when last one is still overflowing');
      }
    }

    // finished with this page, can display
    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);
    if (page) ruleSet.finishPage(page, book);
  };

  // Creates clones for ever level of tag
  // we were in when we overflowed the last page
  var continueOnNewPage = function continueOnNewPage() {
    var ignoreOverflow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (book.pages.length === 500) {
      console.warn('Bindery: More than 500 pages, performance may be slow.');
    } else if (book.pages.length === 1000) {
      console.warn('Bindery: More than 1000 pages, performance may be slow.');
    } else if (book.pages.length > MAXIMUM_PAGE_LIMIT) {
      error('Maximum page count exceeded');
      throw Error('Bindery: Maximum page count exceeded. Suspected runaway layout.');
    }

    finishPage(book.pageInProgress, ignoreOverflow);

    breadcrumb = continueBreadcrumb(breadcrumb);
    var newPage = makeNewPage();

    book.pageInProgress = newPage;
    updatePaginationProgress(); // finished with this page, can display

    book.pages.push(newPage);

    if (breadcrumb[0]) {
      newPage.flowContent.appendChild(breadcrumb[0]);
    }

    // make sure the cloned page is valid.
    if (newPage.hasOverflowed()) {
      var suspect = currentFlowElement();
      if (suspect) {
        console.warn('Bindery: Content overflows, probably due to a style set on ' + elementToString(suspect) + '.');
        suspect.parentNode.removeChild(suspect);
      } else {
        console.warn('Bindery: Content overflows.');
      }
    }

    return newPage;
  };

  // TODO: Merge isSplittable and shouldIgnoreOverflow

  // Walk up the tree to see if we can safely
  // insert a split into this node.
  var isSplittable = function isSplittable(node) {
    if (ruleSet.selectorsNotToSplit.some(function (sel) {
      return node.matches(sel);
    })) {
      if (node.hasAttribute('data-bindery-did-move') || node.classList.contains(c('continuation'))) {
        return true; // don't split it again.
      }
      return false;
    }
    if (node.parentElement) {
      return isSplittable(node.parentElement);
    }
    return true;
  };

  var moveElementToNextPage = function moveElementToNextPage(nodeToMove) {
    // So this node won't get cloned. TODO: this is unclear
    breadcrumb.pop();

    if (breadcrumb.length < 1) {
      throw Error('Bindery: Attempting to move the top-level element is not allowed');
    }

    // find the nearest splittable parent
    var willMove = nodeToMove;
    var pathToRestore = [];
    while (breadcrumb.length > 1 && !isSplittable(currentFlowElement())) {
      // console.log('Not OK to split:', currentFlowElement());
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
    }

    // Once a node is moved to a new page, it should no longer trigger another
    // move. otherwise tall elements will endlessly get shifted to the next page
    willMove.setAttribute('data-bindery-did-move', true);

    var parent = willMove.parentNode;
    parent.removeChild(willMove);

    if (breadcrumb.length > 1 && currentFlowElement().textContent.trim() === '') {
      parent.appendChild(willMove);
      willMove = breadcrumb.pop();
      pathToRestore.unshift(willMove);
      willMove.parentNode.removeChild(willMove);
    }

    if (book.pageInProgress.isEmpty) {
      // If the page is empty when this node is removed,
      // then it won't help to move it to the next page.
      // Instead continue here until the node is done.
      // nodeToMove.setAttribute('data-ignore-overflow', true);
    } else {
      if (book.pageInProgress.hasOverflowed()) {
        book.pageInProgress.suppressErrors = true;
      }
      continueOnNewPage();
    }

    // append node as first in new page
    currentFlowElement().appendChild(willMove);

    // restore subpath
    pathToRestore.forEach(function (restore) {
      breadcrumb.push(restore);
    });

    // TODO: Confusing. If we didn't pop this node above, we don't
    // need to push it back again.
    breadcrumb.push(nodeToMove);
  };

  var addTextNode = function addTextNode(textNode, doneCallback, failure) {
    currentFlowElement().appendChild(textNode);

    if (book.pageInProgress.hasOverflowed()) {
      textNode.parentNode.removeChild(textNode);
      failure();
    } else {
      scheduler.throttle(doneCallback);
    }
  };

  // Adds an text node by incrementally adding words
  // until it just barely doesnt overflow
  var addTextNodeIncremental = function addTextNodeIncremental(textNode, doneCallback, failure) {
    var originalText = textNode.nodeValue;
    currentFlowElement().appendChild(textNode);

    if (!book.pageInProgress.hasOverflowed() || !canSplit()) {
      scheduler.throttle(doneCallback);
      return;
    }

    var pos = 0;

    var splitTextStep = function splitTextStep() {
      textNode.nodeValue = originalText.substr(0, pos);

      if (book.pageInProgress.hasOverflowed()) {
        // Back out to word boundary
        if (originalText.charAt(pos) === ' ') pos -= 1; // TODO: redundant
        while (originalText.charAt(pos) !== ' ' && pos > 0) {
          pos -= 1;
        }if (pos < 1) {
          textNode.nodeValue = originalText;
          textNode.parentNode.removeChild(textNode);
          failure();
          return;
        }

        // console.log(`Text breaks at ${pos}: ${originalText.substr(0, pos)}`);

        var fittingText = originalText.substr(0, pos);
        var overflowingText = originalText.substr(pos);
        textNode.nodeValue = fittingText;

        // Start on new page
        continueOnNewPage();
        var remainingTextNode = document.createTextNode(overflowingText);
        addTextNodeIncremental(remainingTextNode, doneCallback, failure);
        return;
      }
      if (pos > originalText.length - 1) {
        scheduler.throttle(doneCallback);
        return;
      }

      pos += 1;
      while (originalText.charAt(pos) !== ' ' && pos < originalText.length) {
        pos += 1;
      }scheduler.throttle(splitTextStep);
    };

    splitTextStep();
  };

  var addTextChild = function addTextChild(parent, child, next) {
    var forceAddTextNode = function forceAddTextNode() {
      currentFlowElement().appendChild(child);
      if (canSplit()) {
        book.pageInProgress.suppressErrors = true;
        continueOnNewPage();
      }
      scheduler.throttle(next);
    };

    if (isSplittable(parent) && !shouldIgnoreOverflow(parent)) {
      var failure = function failure() {
        if (breadcrumb.length > 1) {
          moveElementToNextPage(parent);
          scheduler.throttle(function () {
            return addTextNodeIncremental(child, next, forceAddTextNode);
          });
        } else {
          forceAddTextNode();
        }
      };
      addTextNodeIncremental(child, next, failure);
    } else {
      var _failure = function _failure() {
        if (canSplit()) {
          moveElementToNextPage(parent);
        }
        scheduler.throttle(function () {
          return addTextNode(child, next, forceAddTextNode);
        });
      };
      addTextNode(child, next, _failure);
    }
  };

  // Adds an element node by clearing its childNodes, then inserting them
  // one by one recursively until thet overflow the page
  var addElementNode = function addElementNode(elementToAdd, doneCallback) {
    if (book.pageInProgress.hasOverflowed() && canSplit()) {
      book.pageInProgress.suppressErrors = true;
      continueOnNewPage();
    }
    var element = ruleSet.beforeAddElement(elementToAdd, book, continueOnNewPage, makeNewPage);
    currentFlowElement().appendChild(element);
    breadcrumb.push(element);

    var childNodes = [].concat(toConsumableArray(element.childNodes));
    element.innerHTML = '';

    // Overflows when empty
    if (book.pageInProgress.hasOverflowed()) {
      if (canSplit()) {
        moveElementToNextPage(element);
      }
    }

    var index = 0;
    var addNext = function addNext() {
      if (!(index < childNodes.length)) {
        // We're now done with this element and its children,
        // so we pop up a level
        var addedChild = breadcrumb.pop();
        ruleSet.afterAddElement(addedChild, book, continueOnNewPage, makeNewPage, currentFlowElement);

        // if (book.pageInProgress.hasOverflowed()) {
        // console.log('Bindery: Added element despite overflowing');
        // }

        doneCallback();
        return;
      }
      var child = childNodes[index];
      index += 1;

      if (child.nodeType === Node.TEXT_NODE) {
        addTextChild(element, child, addNext);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'SCRIPT') {
        if (child.tagName === 'IMG' && !child.naturalWidth) {
          var waitForImageStart = performance.now();
          waitForImage(child, function () {
            var waitForImageTime = performance.now() - waitForImageStart;
            layoutWaitingTime += waitForImageTime;
            addElementNode(child, addNext);
          });
        } else {
          scheduler.throttle(function () {
            return addElementNode(child, addNext);
          });
        }
      } else {
        addNext(); // Skip comments and unknown nodes
      }
    };
    // kick it off
    addNext();
  };

  var startPagination = function startPagination() {
    ruleSet.setup();
    content.style.margin = 0;
    content.style.padding = 0;
    continueOnNewPage();
    requestAnimationFrame(function () {
      addElementNode(content, finishPagination);
    });
  };
  updatePaginationProgress = function updatePaginationProgress() {
    progress(book);
  };
  finishPagination = function finishPagination() {
    document.body.removeChild(measureArea);

    book.pages = orderPages(book.pages, makeNewPage);
    annotatePages(book.pages);

    book.setCompleted();
    ruleSet.finishEveryPage(book);

    if (!isDebugging) {
      var endLayoutTime = window.performance.now();
      var totalTime = endLayoutTime - startLayoutTime;
      var layoutTime = totalTime - layoutWaitingTime;
      console.log('\uD83D\uDCD6 Book ready in ' + (totalTime / 1000).toFixed(2) + 's (Layout: ' + (layoutTime / 1000).toFixed(2) + 's, Waiting for images: ' + (layoutWaitingTime / 1000).toFixed(2) + 's)');
    }

    success(book);
  };
  startPagination();
};

var letter = { width: '8.5in', height: '11in' };
var a4 = { width: '210mm', height: '297mm' };
var defaultPageSetup = {
  bleed: '12pt',
  size: { width: '4in', height: '6in' },
  margin: {
    inner: '24pt',
    outer: '24pt',
    bottom: '40pt',
    top: '48pt'
  }
};

var supportsCustomPageSize = !!window.chrome && !!window.chrome.webstore;

var PageSetup = function () {
  function PageSetup() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, PageSetup);

    this.setSize(opts.size || defaultPageSetup.size);
    this.setMargin(opts.margin || defaultPageSetup.margin);
    this.setBleed(opts.bleed || defaultPageSetup.bleed);

    this.printTwoUp = false;
    this.sheetSizeMode = supportsCustomPageSize ? 'size_page' : 'size_page_marks';
  }

  createClass(PageSetup, [{
    key: 'setSize',
    value: function setSize(size) {
      isValidSize(size);
      this.size = size;
    }
  }, {
    key: 'setMargin',
    value: function setMargin(margin) {
      isValidSize(margin);
      this.margin = margin;
    }
  }, {
    key: 'setBleed',
    value: function setBleed(newBleed) {
      this.bleed = newBleed;
    }
  }, {
    key: 'setSheetSizeMode',
    value: function setSheetSizeMode(mode) {
      this.sheetSizeMode = mode;
    }
  }, {
    key: 'setPrintTwoUp',
    value: function setPrintTwoUp(newVal) {
      this.printTwoUp = newVal;
    }
  }, {
    key: 'isSizeValid',
    value: function isSizeValid() {
      this.updateStylesheet();
      return Page.isSizeValid();
    }
  }, {
    key: 'spreadSizeStyle',
    value: function spreadSizeStyle() {
      var w = parseVal(this.size.width);
      return {
        height: this.size.height,
        width: '' + w.val * 2 + w.unit
      };
    }
  }, {
    key: 'updateStylesheet',
    value: function updateStylesheet() {
      var sheet = void 0;
      var existing = document.querySelector('#binderyPageSetup');
      if (existing) {
        sheet = existing;
      } else {
        sheet = document.createElement('style');
        sheet.id = 'binderyPageSetup';
      }
      var w = parseVal(this.size.width);

      sheet.innerHTML = '\n@page { size: ' + this.sheetSize.width + ' ' + this.sheetSize.height + '; }\n' + c('.print-page') + ' { width: ' + this.sheetSize.width + '; height: ' + this.sheetSize.height + ';}\n\n' + c('.show-crop') + ' ' + c('.print-page') + ' ' + c('.spread-wrapper') + ',\n' + c('.show-bleed-marks') + ' ' + c('.print-page') + ' ' + c('.spread-wrapper') + ' {\n  margin: calc(' + this.bleed + ' + 12pt) auto;\n}\n' + c('.page-size') + ' {\n  height: ' + this.size.height + ';\n  width: ' + this.size.width + ';\n}\n' + c('.page-size-rotated') + ' {\n  height: ' + this.size.width + ';\n  width: ' + this.size.height + ';\n}\n' + c('.spread-size') + ' {\n  height: ' + this.size.height + ';\n  width: ' + w.val * 2 + w.unit + ';\n}\n' + c('.spread-size-rotated') + ' {\n  height: ' + w.val * 2 + w.unit + ';\n  width: ' + this.size.height + ';\n}\n' + c('.flowbox') + ',\n' + c('.footer') + ' {\n  margin-left: ' + this.margin.inner + ';\n  margin-right: ' + this.margin.outer + ';\n}\n' + c('.left') + ' ' + c('.flowbox') + ',\n' + c('.left') + ' ' + c('.footer') + ' {\n  margin-left: ' + this.margin.outer + ';\n  margin-right: ' + this.margin.inner + ';\n}\n\n' + c('.left') + ' ' + c('.running-header') + ' {\n  left: ' + this.margin.outer + ';\n}\n' + c('.right') + ' ' + c('.running-header') + ' {\n  right: ' + this.margin.outer + ';\n}\n\n' + c('.flowbox') + ' { margin-top: ' + this.margin.top + '; }\n' + c('.footer') + '{ margin-bottom: ' + this.margin.bottom + '; }\n\n' + c('.bleed-left') + ',\n' + c('.bleed-right') + ',\n' + c('.crop-left') + ',\n' + c('.crop-right') + ',\n' + c('.crop-fold') + ' {\n  top: calc( -12pt - ' + this.bleed + ' );\n  bottom: calc( -12pt - ' + this.bleed + ' );\n}\n\n' + c('.bleed-top') + ',\n' + c('.bleed-bottom') + ',\n' + c('.crop-top') + ',\n' + c('.crop-bottom') + ' {\n  left: calc( -12pt - ' + this.bleed + ' );\n  right: calc( -12pt - ' + this.bleed + ' );\n}\n' + c('.bleed-left') + '   { left: -' + this.bleed + '; }\n' + c('.bleed-right') + '  { right: -' + this.bleed + '; }\n' + c('.bleed-top') + '    { top: -' + this.bleed + '; }\n' + c('.bleed-bottom') + ' { bottom: -' + this.bleed + '; }\n\n' + c('.background') + ' {\n  top: -' + this.bleed + ';\n  bottom: -' + this.bleed + ';\n  left: -' + this.bleed + ';\n  right: -' + this.bleed + ';\n}\n\n' + c('.spread') + c('.right') + ' > ' + c('.background') + ' {\n  left: calc(-100% - ' + this.bleed + ');\n}\n' + c('.spread') + c('.left') + ' > ' + c('.background') + ' {\n  right: calc(-100% - ' + this.bleed + ');\n}\n    ';
      document.head.appendChild(sheet);
    }
  }, {
    key: 'displaySize',
    get: function get$$1() {
      var width = this.printTwoUp ? this.spreadSizeStyle().width : this.size.width;
      var height = this.size.height;
      var bleed = this.bleed;

      return {
        width: width,
        height: height,
        bleed: bleed
      };
    }
  }, {
    key: 'sheetSize',
    get: function get$$1() {
      var width = this.printTwoUp ? this.spreadSizeStyle().width : this.size.width;
      var height = this.size.height;
      var b = this.bleed;

      switch (this.sheetSizeMode) {
        case 'size_page':
          return { width: width, height: height };
        case 'size_page_bleed':
          return {
            width: 'calc(' + width + ' + ' + b + ' + ' + b + ')',
            height: 'calc(' + height + ' + ' + b + ' + ' + b + ')'
          };
        case 'size_page_marks':
          // TODO: 24pt marks is hardcoded
          return {
            width: 'calc(' + width + ' + ' + b + ' + ' + b + ' + 24pt)',
            height: 'calc(' + height + ' + ' + b + ' + ' + b + ' + 24pt)'
          };
        case 'size_letter_l':
          return { width: letter.height, height: letter.width };
        case 'size_letter_p':
          return letter;
        case 'size_a4_p':
          return a4;
        case 'size_a4_l':
          return { width: a4.height, height: a4.width };
        default:
      }
      return { width: width, height: height };
    }
  }]);
  return PageSetup;
}();

var title = function title() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return hyperscript.apply(undefined, [c('.title')].concat(arg));
};

var row = function row() {
  for (var _len3 = arguments.length, arg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    arg[_key3] = arguments[_key3];
  }

  return hyperscript.apply(undefined, [c('.row')].concat(arg));
};

// Button
var btn = function btn() {
  for (var _len4 = arguments.length, arg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    arg[_key4] = arguments[_key4];
  }

  return hyperscript.apply(undefined, ['button.' + c('btn')].concat(arg));
};

var btnMain = function btnMain() {
  for (var _len6 = arguments.length, arg = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    arg[_key6] = arguments[_key6];
  }

  return hyperscript.apply(undefined, ['button.' + c('btn') + '.' + c('btn-main')].concat(arg));
};

var select = function select() {
  var selectVal = hyperscript(c('.select-val'), 'Value');

  for (var _len7 = arguments.length, arg = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    arg[_key7] = arguments[_key7];
  }

  var selectEl = hyperscript.apply(undefined, ['select.' + c('select')].concat(arg));
  var updateVal = function updateVal() {
    selectVal.textContent = selectEl.options[selectEl.selectedIndex].text;
  };
  selectEl.addEventListener('change', updateVal);
  updateVal();
  return hyperscript(c('.select-wrap'), selectVal, selectEl);
};

var option = function option() {
  for (var _len8 = arguments.length, arg = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    arg[_key8] = arguments[_key8];
  }

  return hyperscript.apply(undefined, ['option'].concat(arg));
};

// View Swithcer
var viewMode = function viewMode(id, action) {
  var sel = '.' + c('viewmode') + '.' + c(id);
  return hyperscript(sel, { onclick: action }, hyperscript(c('.icon'))
  // text
  );
};

// import { convertStrToPx } from '../utils/convertUnits';
var supportsCustomPageSize$1 = !!window.chrome && !!window.chrome.webstore;

var Controls = function Controls(opts) {
  var _this = this;

  classCallCheck(this, Controls);

  this.binder = opts.binder;
  var viewer = opts.viewer;

  var print = function print() {
    viewer.setPrint();
    setTimeout(window.print, 10);
  };

  var printBtn = btnMain({ onclick: print }, 'Print');

  var sheetSizes = supportsCustomPageSize$1 ? [option({ value: 'size_page', selected: true }, 'Auto'), option({ value: 'size_page_bleed' }, 'Auto + Bleed'), option({ value: 'size_page_marks' }, 'Auto + Marks'), option({ value: 'size_letter_p' }, 'Letter Portrait'), option({ value: 'size_letter_l' }, 'Letter Landscape'), option({ value: 'size_a4_p' }, 'A4 Portrait'), option({ value: 'size_a4_l' }, 'A4 Landscape')] : [option({ value: 'size_letter_p', selected: true }, 'Default Page Size *'), option({ disabled: true }, 'Only Chrome supports custom page sizes. Set in your browser\'s print dialog instead.')];

  var updateSheetSizeNames = function updateSheetSizeNames() {
    // const layout = viewer.printArrange === 'arrange_one' ? 'Page' : 'Spread';
    if (!supportsCustomPageSize$1) return;
    var size = _this.binder.pageSetup.displaySize;
    var sizeName = size.width + ' \xD7 ' + size.height;
    sheetSizes[0].textContent = '' + sizeName;
    sheetSizes[1].textContent = sizeName + ' + Bleed';
    sheetSizes[2].textContent = sizeName + ' + Marks';
  };
  updateSheetSizeNames();

  var updateSheetSize = function updateSheetSize(e) {
    var newVal = e.target.value;
    viewer.setSheetSize(newVal);
    if (newVal === 'size_page' || newVal === 'size_page_bleed') {
      marksSelect.classList.add(c('hidden-select'));
    } else {
      marksSelect.classList.remove(c('hidden-select'));
    }

    _this.binder.pageSetup.updateStylesheet();
  };

  var sheetSizeSelect = select.apply(undefined, [{ onchange: updateSheetSize }].concat(sheetSizes));

  var arrangeSelect = select({ onchange: function onchange(e) {
      viewer.setPrintArrange(e.target.value);
      updateSheetSizeNames();
    } }, option({ value: 'arrange_one', selected: true }, '1 Page / Sheet'), option({ value: 'arrange_two' }, '1 Spread / Sheet'), option({ value: 'arrange_booklet' }, 'Booklet Sheets'));
  var arrangement = row(arrangeSelect);

  var updateMarks = function updateMarks(e) {
    switch (e.target.value) {
      case 'marks_none':
        viewer.isShowingCropMarks = false;
        viewer.isShowingBleedMarks = false;
        break;
      case 'marks_crop':
        viewer.isShowingCropMarks = true;
        viewer.isShowingBleedMarks = false;
        break;
      case 'marks_bleed':
        viewer.isShowingCropMarks = false;
        viewer.isShowingBleedMarks = true;
        break;
      case 'marks_both':
        viewer.isShowingCropMarks = true;
        viewer.isShowingBleedMarks = true;
        break;
      default:
    }
  };

  var marksSelect = select({ onchange: updateMarks }, option({ value: 'marks_none' }, 'No Marks'), option({ value: 'marks_crop', selected: true }, 'Crop Marks'), option({ value: 'marks_bleed' }, 'Bleed Marks'), option({ value: 'marks_both' }, 'Crop and Bleed'));
  if (supportsCustomPageSize$1) {
    marksSelect.classList.add(c('hidden-select'));
  }
  var marks = row(marksSelect);
  var sheetSize = row(sheetSizeSelect);

  var startPaginating = function startPaginating() {
    _this.binder.makeBook(function () {});
  };

  var viewModes = [viewMode('grid', viewer.setGrid, 'Grid'),
  // viewMode('outline', viewer.setOutline, 'Outline'),
  viewMode('flip', viewer.setFlip, 'Flip'), viewMode('print', viewer.setPrint, 'Sheet')];

  var viewSwitcher = hyperscript.apply(undefined, [c('.viewswitcher')].concat(viewModes));

  var headerContent = hyperscript('span', 'Loading');

  var playSlow = void 0;
  var step = btn('→', {
    style: { display: 'none' },
    onclick: function onclick() {
      return window.binderyDebug.step();
    }
  });
  var pause = btn('❙❙', {
    onclick: function onclick() {
      window.binderyDebug.pause();
      spinner.classList.add(c('paused'));
      pause.style.display = 'none';
      playSlow.style.display = '';
      step.style.display = '';
    }
  });
  playSlow = btn('▶️', {
    style: { display: 'none' },
    onclick: function onclick() {
      window.binderyDebug.resume();
      spinner.classList.remove(c('paused'));
      playSlow.style.display = 'none';
      pause.style.display = '';
      step.style.display = 'none';
    }
  });
  var debugDone = btn('Finish', {
    onclick: function onclick() {
      spinner.classList.remove(c('paused'));
      window.binderyDebug.finish();
    }
  });

  var debugControls = hyperscript(c('.debug-controls'), pause, playSlow, step, debugDone);

  var refreshPaginationBtn = hyperscript('a', { onclick: function onclick() {
      _this.binder.debug = false;
      startPaginating();
    } }, 'Refresh');
  refreshPaginationBtn.classList.add(c('refresh'));
  var refreshPaginationBtnDebug = hyperscript('a', '🐞', {
    onclick: function onclick() {
      playSlow.style.display = 'none';
      step.style.display = 'none';
      pause.style.display = '';
      _this.binder.debug = true;
      startPaginating();
    }
  });
  var spinner = hyperscript(c('.spinner'));
  var header = title(spinner, headerContent, hyperscript(c('.refresh-btns'), refreshPaginationBtn, refreshPaginationBtnDebug));

  this.setInProgress = function () {
    headerContent.textContent = 'Paginating';
  };

  this.updateProgress = function (count) {
    headerContent.textContent = count + ' Pages';
  };

  this.setDone = function () {
    headerContent.textContent = viewer.book.pages.length + ' Pages';
  };

  this.setInvalid = function () {};

  printBtn.classList.add(c('btn-print'));
  var options = row(arrangement, sheetSize, marks);
  options.classList.add(c('print-options'));

  this.element = hyperscript(c('.controls'), viewSwitcher, options, header, debugControls, printBtn);
};

var errorView = function (title, text) {
  return hyperscript(c('.error'), hyperscript(c('.error-title'), title), hyperscript(c('.error-text'), text), hyperscript(c('.error-footer'), 'Bindery ' + '[AIV]{version}[/AIV]'));
};

var orderPagesBooklet = function orderPagesBooklet(pages) {
  while (pages.length % 4 !== 0) {
    var spacerPage = new Page();
    spacerPage.element.style.visibility = 'hidden';
    pages.push(spacerPage);
  }
  var bookletOrder = [];
  var len = pages.length;

  for (var i = 0; i < len / 2; i += 2) {
    bookletOrder.push(pages[len - 1 - i]);
    bookletOrder.push(pages[i]);
    bookletOrder.push(pages[i + 1]);
    bookletOrder.push(pages[len - 2 - i]);
  }

  return bookletOrder;
};

var padPages = function padPages(pages) {
  if (pages.length % 2 !== 0) {
    var pg = new Page();
    pages.push(pg);
  }
  var spacerPage = new Page();
  var spacerPage2 = new Page();
  spacerPage.element.style.visibility = 'hidden';
  spacerPage2.element.style.visibility = 'hidden';
  pages.unshift(spacerPage);
  pages.push(spacerPage2);

  return pages;
};

var twoPageSpread = function twoPageSpread() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return hyperscript.apply(undefined, [c('.spread-wrapper') + c('.spread-size')].concat(arg));
};
var onePageSpread = function onePageSpread() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return hyperscript.apply(undefined, [c('.spread-wrapper') + c('.page-size')].concat(arg));
};

var renderGridLayout = function renderGridLayout(pages, isTwoUp) {
  var gridLayout = document.createDocumentFragment();
  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var wrap = twoPageSpread(pages[i].element, pages[i + 1].element);
      gridLayout.appendChild(wrap);
    }
  } else {
    pages.forEach(function (pg) {
      var wrap = onePageSpread(pg.element);
      gridLayout.appendChild(wrap);
    });
  }

  return gridLayout;
};

var bleedMarks = function bleedMarks() {
  return [hyperscript(c('.bleed-top')), hyperscript(c('.bleed-bottom')), hyperscript(c('.bleed-left')), hyperscript(c('.bleed-right'))];
};
var cropMarks = function cropMarks() {
  return [hyperscript(c('.crop-top')), hyperscript(c('.crop-bottom')), hyperscript(c('.crop-left')), hyperscript(c('.crop-right'))];
};
var printMarksSingle = function printMarksSingle() {
  return hyperscript.apply(undefined, [c('.print-mark-wrap')].concat(toConsumableArray(cropMarks()), toConsumableArray(bleedMarks())));
};
var printMarksSpread = function printMarksSpread() {
  return hyperscript.apply(undefined, [c('.print-mark-wrap'), hyperscript(c('.crop-fold'))].concat(toConsumableArray(cropMarks()), toConsumableArray(bleedMarks())));
};

var bookletMeta = function bookletMeta(i, len) {
  var isFront = i % 4 === 0;
  var sheetIndex = parseInt((i + 1) / 4, 10) + 1;
  return hyperscript(c('.print-meta'), 'Sheet ' + sheetIndex + ' of ' + len / 4 + ': ' + (isFront ? 'Outside' : 'Inside'));
};

var twoPageSpread$1 = function twoPageSpread() {
  for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
    arg[_key] = arguments[_key];
  }

  return hyperscript.apply(undefined, [c('.spread-wrapper') + c('.spread-size')].concat(arg));
};
var onePageSpread$1 = function onePageSpread() {
  for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    arg[_key2] = arguments[_key2];
  }

  return hyperscript.apply(undefined, [c('.spread-wrapper') + c('.page-size')].concat(arg));
};

var renderPrintLayout = function renderPrintLayout(pages, isTwoUp, orient, isBooklet) {
  var printLayout = document.createDocumentFragment();

  var marks = isTwoUp ? printMarksSpread : printMarksSingle;
  var spread = isTwoUp ? twoPageSpread$1 : onePageSpread$1;

  var printSheet = function printSheet() {
    return hyperscript(c('.print-page'), spread.apply(undefined, arguments));
  };

  if (isTwoUp) {
    for (var i = 0; i < pages.length; i += 2) {
      var spreadMarks = marks();
      if (isBooklet) {
        var meta = bookletMeta(i, pages.length);
        spreadMarks.appendChild(meta);
      }
      var sheet = printSheet(pages[i].element, pages[i + 1].element, spreadMarks);
      printLayout.appendChild(sheet);
    }
  } else {
    pages.forEach(function (pg) {
      var sheet = printSheet(pg.element, marks());
      printLayout.appendChild(sheet);
    });
  }

  return printLayout;
};

var renderFlipLayout = function renderFlipLayout(pages, doubleSided) {
  var flipLayout = document.createDocumentFragment();
  var sizer = hyperscript(c('.spread-size') + c('.flip-sizer'));
  var flapHolder = hyperscript(c('.spread-size') + c('.flap-holder'));
  sizer.appendChild(flapHolder);
  flipLayout.appendChild(sizer);
  var flaps = [];
  var currentLeaf = -1;

  var leftOffset = 4;
  if (pages.length * leftOffset > 60) {
    leftOffset = 60 / pages.length;
  }
  flapHolder.style.width = pages.length * leftOffset + 'px';

  var setLeaf = function setLeaf(n) {
    var newLeaf = n;
    if (newLeaf === currentLeaf) newLeaf += 1;
    currentLeaf = newLeaf;

    var zScale = 4;
    if (flaps.length * zScale > 200) zScale = 200 / flaps.length;

    flaps.forEach(function (flap, i, arr) {
      // + 0.5 so left and right are even
      var z = (arr.length - Math.abs(i - newLeaf + 0.5)) * zScale;
      flap.style.transform = 'translate3d(' + (i < newLeaf ? 4 : 0) + 'px,0,' + z + 'px) rotateY(' + (i < newLeaf ? -180 : 0) + 'deg)';
    });
  };

  var leafIndex = 0;

  var _loop = function _loop(i) {
    leafIndex += 1;
    var li = leafIndex;
    var flap = hyperscript(c('.page3d') + c('.page-size'), {
      onclick: function onclick() {
        var newLeaf = li - 1;
        setLeaf(newLeaf);
      }
    });

    var rightPage = pages[i].element;
    var leftPage = void 0;
    rightPage.classList.add(c('page3d-front'));
    flap.appendChild(rightPage);
    if (doubleSided) {
      flap.classList.add(c('doubleSided'));
      leftPage = pages[i + 1].element;
      leftPage.classList.add(c('page3d-back'));
      flap.appendChild(leftPage);
    } else {
      leftPage = hyperscript(c('.page') + c('.page3d-back'));
      flap.appendChild(leftPage);
    }
    // TODO: Dynamically add/remove pages.
    // Putting 1000s of elements onscreen
    // locks up the browser.

    flap.style.left = i * leftOffset + 'px';

    flaps.push(flap);
    flapHolder.appendChild(flap);
  };

  for (var i = 1; i < pages.length - 1; i += doubleSided ? 2 : 1) {
    _loop(i);
  }

  setLeaf(0);
  return flipLayout;
};

var MODE_FLIP = 'interactive';
var MODE_PREVIEW = 'grid';
var MODE_SHEET = 'print';
var MODE_OUTLINE = 'outline';

var ARRANGE_ONE = 'arrange_one';
var ARRANGE_SPREAD = 'arrange_two';
var ARRANGE_BOOKLET = 'arrange_booklet';

var Viewer = function () {
  function Viewer(_ref) {
    var bindery = _ref.bindery;
    classCallCheck(this, Viewer);

    this.book = null;
    this.pageSetup = bindery.pageSetup;

    this.zoomBox = hyperscript(c('.zoom-wrap'));
    this.element = hyperscript(c('.root'), this.zoomBox);

    this.doubleSided = true;
    this.printArrange = ARRANGE_ONE;
    this.isShowingCropMarks = true;
    this.isShowingBleedMarks = false;

    this.mode = MODE_PREVIEW;
    this.element.setAttribute('bindery-view-mode', this.mode);
    this.currentLeaf = 0;

    this.listenForPrint();
    this.listenForResize();

    this.setGrid = this.setGrid.bind(this);
    this.setOutline = this.setOutline.bind(this);
    this.setPrint = this.setPrint.bind(this);
    this.setFlip = this.setFlip.bind(this);

    this.controls = new Controls({ binder: bindery, viewer: this });

    this.element.classList.add(c('in-progress'));

    this.element.appendChild(this.controls.element);
    document.body.appendChild(this.element);
  }

  // Automatically switch into print mode


  createClass(Viewer, [{
    key: 'listenForPrint',
    value: function listenForPrint() {
      var _this = this;

      if (window.matchMedia) {
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
          if (mql.matches) {
            _this.setPrint();
          } else {
            // after print
          }
        });
      }
    }
  }, {
    key: 'listenForResize',
    value: function listenForResize() {
      var _this2 = this;

      window.addEventListener('resize', function () {
        if (!_this2.throttleResize) {
          _this2.updateZoom();
          _this2.throttleResize = setTimeout(function () {
            _this2.throttleResize = null;
          }, 20);
        }
      });
    }
  }, {
    key: 'setSheetSize',
    value: function setSheetSize(newVal) {
      var _this3 = this;

      this.pageSetup.setSheetSizeMode(newVal);
      this.pageSetup.updateStylesheet();

      if (this.mode !== MODE_SHEET) {
        this.setPrint();
      }
      this.updateZoom();
      setTimeout(function () {
        _this3.updateZoom();
      }, 300);
    }
  }, {
    key: 'setPrintArrange',
    value: function setPrintArrange(newVal) {
      if (newVal === this.printArrange) return;
      this.printArrange = newVal;

      this.pageSetup.setPrintTwoUp(this.isTwoUp);
      this.pageSetup.updateStylesheet();

      if (this.mode === MODE_SHEET) {
        this.render();
      } else {
        this.setPrint();
      }
    }
  }, {
    key: 'displayError',
    value: function displayError(title, text) {
      if (!this.element.parentNode) {
        document.body.appendChild(this.element);
      }
      if (!this.error) {
        this.error = errorView(title, text);
        this.element.appendChild(this.error);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.book = null;
      this.lastSpreadInProgress = null; // TODO: Make this clearer, after first render
      this.zoomBox.innerHTML = '';
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      // TODO this doesn't work if the target is an existing node
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }, {
    key: 'toggleGuides',
    value: function toggleGuides() {
      this.element.classList.toggle(c('show-guides'));
    }
  }, {
    key: 'toggleBleed',
    value: function toggleBleed() {
      this.element.classList.add(c('show-bleed'));
    }
  }, {
    key: 'toggleDouble',
    value: function toggleDouble() {
      this.doubleSided = !this.doubleSided;
      this.render();
    }
  }, {
    key: 'setMode',
    value: function setMode(newMode) {
      switch (newMode) {
        case 'grid':
        case 'default':
          this.mode = MODE_PREVIEW;
          break;
        case 'interactive':
        case 'flip':
          this.mode = MODE_FLIP;
          break;
        case 'print':
        case 'sheet':
          this.mode = MODE_SHEET;
          break;
        case 'outline':
        case 'outlines':
          this.mode = MODE_OUTLINE;
          break;
        default:
          console.error('Bindery: Unknown view mode "' + newMode + '"');
          break;
      }
    }
  }, {
    key: 'setGrid',
    value: function setGrid() {
      if (this.mode === MODE_PREVIEW) return;
      if (this.mode === MODE_OUTLINE) {
        this.mode = MODE_PREVIEW;
        this.updateGuides();
      } else {
        this.mode = MODE_PREVIEW;
        this.render();
      }
    }
  }, {
    key: 'setOutline',
    value: function setOutline() {
      if (this.mode === MODE_OUTLINE) return;
      if (this.mode === MODE_PREVIEW) {
        this.mode = MODE_OUTLINE;
        this.updateGuides();
      } else {
        this.mode = MODE_OUTLINE;
        this.render();
      }
    }
  }, {
    key: 'setPrint',
    value: function setPrint() {
      if (this.mode === MODE_SHEET) return;
      this.mode = MODE_SHEET;
      this.render();
    }
  }, {
    key: 'setFlip',
    value: function setFlip() {
      this.mode = MODE_FLIP;
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.book) return;
      var _document = document,
          body = _document.body;


      if (!this.element.parentNode) {
        body.appendChild(this.element);
      }

      this.flaps = [];
      body.classList.add(c('viewing'));
      this.element.setAttribute('bindery-view-mode', this.mode);

      var scrollMax = body.scrollHeight - body.offsetHeight;
      var scrollPct = body.scrollTop / scrollMax;

      if (this.mode === MODE_PREVIEW) {
        this.renderGrid();
      } else if (this.mode === MODE_OUTLINE) {
        this.renderGrid();
      } else if (this.mode === MODE_FLIP) {
        this.renderInteractive();
      } else if (this.mode === MODE_SHEET) {
        this.renderPrint();
      } else {
        this.renderGrid();
      }

      body.scrollTop = scrollMax * scrollPct;
      this.updateZoom();
    }
  }, {
    key: 'renderProgress',
    value: function renderProgress() {
      var _this4 = this;

      var twoPageSpread = function twoPageSpread() {
        for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        return hyperscript.apply(undefined, [c('.spread-wrapper') + c('.spread-size')].concat(arg));
      };

      this.book.pages.forEach(function (page, i) {
        // If hasn't been added, or not in spread yet
        if (!_this4.zoomBox.contains(page.element) || page.element.parentNode === _this4.zoomBox) {
          if (_this4.lastSpreadInProgress && _this4.lastSpreadInProgress.children.length < 2) {
            _this4.lastSpreadInProgress.appendChild(page.element);
          } else {
            if (i === 0) {
              var spacer = new Page();
              spacer.element.style.visibility = 'hidden';
              _this4.lastSpreadInProgress = twoPageSpread(spacer.element, page.element);
            } else {
              _this4.lastSpreadInProgress = twoPageSpread(page.element);
            }
            _this4.zoomBox.appendChild(_this4.lastSpreadInProgress);
          }
        }
      });

      if (this.book.pageInProgress) {
        this.zoomBox.appendChild(this.book.pageInProgress.element);
      }

      this.updateZoom();
    }
  }, {
    key: 'updateZoom',
    value: function updateZoom() {
      if (this.zoomBox.firstElementChild) {
        var scrollPct = document.body.scrollTop / document.body.scrollHeight;
        var viewerRect = this.zoomBox.getBoundingClientRect();
        var contentW = this.zoomBox.firstElementChild.getBoundingClientRect().width;
        var scale = Math.min(1, viewerRect.width / contentW);

        this.zoomBox.style.transform = 'scale(' + scale + ')';
        document.body.scrollTop = document.body.scrollHeight * scrollPct;
      }
    }
  }, {
    key: 'updateGuides',
    value: function updateGuides() {
      this.element.setAttribute('bindery-view-mode', this.mode);
      if (this.mode === MODE_OUTLINE) {
        this.element.classList.add(c('show-bleed'));
        this.element.classList.add(c('show-guides'));
      } else {
        this.element.classList.remove(c('show-bleed'));
        this.element.classList.remove(c('show-guides'));
      }
    }
  }, {
    key: 'renderPrint',
    value: function renderPrint() {
      this.element.classList.add(c('show-bleed'));
      this.element.classList.remove(c('show-guides'));

      this.zoomBox.innerHTML = '';

      var isBooklet = this.printArrange === ARRANGE_BOOKLET;
      var orient = this.orientation;

      var pages = this.book.pages.slice();
      if (this.printArrange === ARRANGE_SPREAD) {
        pages = padPages(pages);
      } else if (isBooklet) {
        pages = orderPagesBooklet(pages);
      }

      var fragment = renderPrintLayout(pages, this.isTwoUp, orient, isBooklet);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderGrid',
    value: function renderGrid() {
      this.updateGuides();
      this.zoomBox.innerHTML = '';

      var pages = this.book.pages.slice();

      if (this.doubleSided) pages = padPages(pages);

      var fragment = renderGridLayout(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'renderInteractive',
    value: function renderInteractive() {
      this.zoomBox.innerHTML = '';
      this.flaps = [];

      this.element.classList.remove(c('show-bleed'));
      this.element.classList.remove(c('show-guides'));

      var pages = padPages(this.book.pages.slice());

      var fragment = renderFlipLayout(pages, this.doubleSided);
      this.zoomBox.appendChild(fragment);
    }
  }, {
    key: 'isTwoUp',
    get: function get$$1() {
      return this.printArrange !== ARRANGE_ONE;
    }
  }, {
    key: 'isShowingCropMarks',
    get: function get$$1() {
      return this.element.classList.contains(c('show-crop'));
    },
    set: function set$$1(newVal) {
      if (newVal) {
        this.element.classList.add(c('show-crop'));
        this.setPrint();
      } else {
        this.element.classList.remove(c('show-crop'));
      }
    }
  }, {
    key: 'isShowingBleedMarks',
    get: function get$$1() {
      return this.element.classList.contains(c('show-bleed-marks'));
    },
    set: function set$$1(newVal) {
      if (newVal) {
        this.element.classList.add(c('show-bleed-marks'));
        this.setPrint();
      } else {
        this.element.classList.remove(c('show-bleed-marks'));
      }
    }
  }]);
  return Viewer;
}();

var Split = function (_Rule) {
  inherits(Split, _Rule);

  function Split(options) {
    classCallCheck(this, Split);

    options.toNext = options.toNext || 'split-to-next';
    options.fromPrevious = options.fromPrevious || 'split-from-previous';

    var _this = possibleConstructorReturn(this, (Split.__proto__ || Object.getPrototypeOf(Split)).call(this, options));

    OptionType.validate(options, {
      name: 'Split',
      selector: OptionType.string,
      toNext: OptionType.string,
      fromPrevious: OptionType.string
    });
    return _this;
  }

  createClass(Split, [{
    key: 'customContinuesClass',
    get: function get$$1() {
      return this.toNext;
    }
  }, {
    key: 'customContinuationClass',
    get: function get$$1() {
      return this.fromPrevious;
    }
  }]);
  return Split;
}(Rule);

var Counter = function (_Rule) {
  inherits(Counter, _Rule);

  function Counter(options) {
    classCallCheck(this, Counter);

    var _this = possibleConstructorReturn(this, (Counter.__proto__ || Object.getPrototypeOf(Counter)).call(this, options));

    _this.selector = '*';
    _this.counterValue = 0;
    OptionType.validate(options, {
      name: 'Counter',
      replaceEl: OptionType.string,
      resetEl: OptionType.string,
      incrementEl: OptionType.string,
      replace: OptionType.func
    });
    return _this;
  }

  createClass(Counter, [{
    key: 'setup',
    value: function setup() {
      this.counterValue = 0;
    }
  }, {
    key: 'beforeAdd',
    value: function beforeAdd(el) {
      if (el.matches(this.incrementEl)) {
        this.counterValue += 1;
      }
      if (el.matches(this.resetEl)) {
        this.counterValue = 0;
      }
      if (el.matches(this.replaceEl)) {
        return this.createReplacement(el);
      }
      return el;
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(element) {
      return this.replace(element, this.counterValue);
    }
  }, {
    key: 'replace',
    value: function replace(element, counterValue) {
      element.textContent = counterValue;
      return element;
    }
  }]);
  return Counter;
}(Rule);

// Options:
// selector: String
// replace: function (HTMLElement) => HTMLElement

var Replace = function (_Rule) {
  inherits(Replace, _Rule);

  function Replace(options) {
    classCallCheck(this, Replace);

    var _this = possibleConstructorReturn(this, (Replace.__proto__ || Object.getPrototypeOf(Replace)).call(this, options));

    _this.name = 'Replace';
    return _this;
  }

  createClass(Replace, [{
    key: 'afterAdd',
    value: function afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      var parent = element.parentNode;
      if (!parent) {
        throw Error('Bindery: Rule assumes element has been added but it has no parent.', element);
      }
      var defensiveClone = element.cloneNode(true);
      var replacement = this.createReplacement(book, defensiveClone);
      parent.replaceChild(replacement, element);

      if (book.pageInProgress.hasOverflowed()) {
        parent.replaceChild(element, replacement);

        return overflowCallback(element);
      }

      return replacement;
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(book, element) {
      return this.replace(element);
    }
  }, {
    key: 'replace',
    value: function replace(element) {
      element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">Default Replacement</sup>');
      return element;
    }
  }]);
  return Replace;
}(Rule);

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement
// render: function (Page) => HTMLElement

var Footnote = function (_Replace) {
  inherits(Footnote, _Replace);

  function Footnote(options) {
    classCallCheck(this, Footnote);

    var _this = possibleConstructorReturn(this, (Footnote.__proto__ || Object.getPrototypeOf(Footnote)).call(this, options));

    OptionType.validate(options, {
      name: 'Footnote',
      selector: OptionType.string,
      replace: OptionType.func,
      render: OptionType.func
    });
    return _this;
  }

  createClass(Footnote, [{
    key: 'afterAdd',
    value: function afterAdd(element, book, continueOnNewPage, makeNewPage, overflowCallback) {
      var number = book.pageInProgress.footer.children.length + 1;

      var footnote = hyperscript('.footnote');
      var contents = this.render(element, number);
      if (contents instanceof HTMLElement) footnote.appendChild(contents);else footnote.innerHTML = contents;

      book.pageInProgress.footer.appendChild(footnote);

      return get(Footnote.prototype.__proto__ || Object.getPrototypeOf(Footnote.prototype), 'afterAdd', this).call(this, element, book, continueOnNewPage, makeNewPage, function (overflowEl) {
        book.pageInProgress.footer.removeChild(footnote);
        return overflowCallback(overflowEl);
      });
    }
  }, {
    key: 'createReplacement',
    value: function createReplacement(book, element) {
      var number = book.pageInProgress.footer.children.length;
      return this.replace(element, number);
    }
  }, {
    key: 'replace',
    value: function replace(element, number) {
      element.insertAdjacentHTML('beforeEnd', '<sup class="bindery-sup">' + number + '</sup>');
      return element;
    }
  }, {
    key: 'render',
    value: function render(element, number) {
      return '<sup>' + number + '</sup> Default footnote (<a href=\'/bindery/docs/#footnote\'>Learn how to change it</a>)';
    }
  }]);
  return Footnote;
}(Replace);

// Options:
// selector: String
// replace: function (HTMLElement, number) => HTMLElement

var PageReference = function (_Replace) {
  inherits(PageReference, _Replace);

  function PageReference(options) {
    classCallCheck(this, PageReference);

    var _this = possibleConstructorReturn(this, (PageReference.__proto__ || Object.getPrototypeOf(PageReference)).call(this, options));

    OptionType.validate(options, {
      name: 'PageReference',
      selector: OptionType.string,
      replace: OptionType.func,
      createTest: OptionType.func
    });
    return _this;
  }

  createClass(PageReference, [{
    key: 'afterAdd',
    value: function afterAdd(elmt, book) {
      var _this2 = this;

      var test = this.createTest(elmt);
      if (test) {
        // Temporary, to make sure it'll fit
        var parent = elmt.parentNode;
        var tempClone = elmt.cloneNode(true);
        var tempNumbers = book.pagesForTest(test);
        var tempRanges = makeRanges(tempNumbers);
        var temp = this.replace(tempClone, tempRanges || '###');
        temp.classList.add(c('placeholder-pulse'));
        parent.replaceChild(temp, elmt);

        book.onComplete(function () {
          var tempParent = temp.parentNode;
          var finalClone = elmt.cloneNode(true);
          var pageNumbers = book.pagesForTest(test);
          var pageRanges = makeRanges(pageNumbers);
          var newEl = _this2.replace(finalClone, pageRanges);
          tempParent.replaceChild(newEl, temp);
        });

        return temp;
      }
      return elmt;
    }
  }, {
    key: 'createTest',
    value: function createTest(element) {
      var selector = element.getAttribute('href');
      if (selector) {
        selector = selector.replace('#', '');
        // extra resilient in case it starts with a number ie wikipedia
        selector = '[id="' + selector + '"]';
        return function (el) {
          return el.querySelector(selector);
        };
      }
      return null;
    }
  }, {
    key: 'replace',
    value: function replace(original, number) {
      original.insertAdjacentHTML('beforeend', ', <span>' + number + '</span>');
      return original;
    }
  }]);
  return PageReference;
}(Replace);

// Options:
// selector: String
// render: function (Page) => HTMLElement
// TODO selectorHierarchy: [ String ], ie [ 'h1', 'h2', 'h3.chapter' ]

var RunningHeader = function (_Rule) {
  inherits(RunningHeader, _Rule);

  function RunningHeader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, RunningHeader);

    var _this = possibleConstructorReturn(this, (RunningHeader.__proto__ || Object.getPrototypeOf(RunningHeader)).call(this, options));

    OptionType.validate(options, {
      name: 'RunningHeader',
      render: OptionType.func
    });
    return _this;
  }

  createClass(RunningHeader, [{
    key: 'eachPage',
    value: function eachPage(page) {
      if (!page.runningHeader) {
        var el = hyperscript(c('.running-header'));
        page.element.appendChild(el);
        page.runningHeader = el;
      }
      page.runningHeader.innerHTML = this.render(page);
    }
  }, {
    key: 'render',
    value: function render(page) {
      return page.number;
    }
  }]);
  return RunningHeader;
}(Rule);

var Rules = {
  Rule: Rule,
  Split: function Split$$1(options) {
    return new Split(options);
  },
  Counter: function Counter$$1(options) {
    return new Counter(options);
  },
  FullBleedPage: function FullBleedPage$$1(options) {
    return new FullBleedPage(options);
  },
  Footnote: function Footnote$$1(options) {
    return new Footnote(options);
  },
  RunningHeader: function RunningHeader$$1(options) {
    return new RunningHeader(options);
  },
  Replace: function Replace$$1(options) {
    return new Replace(options);
  },
  FullBleedSpread: function FullBleedSpread$$1(options) {
    return new FullBleedSpread(options);
  },
  PageBreak: function PageBreak$$1(options) {
    return new PageBreak(options);
  },
  PageReference: function PageReference$$1(options) {
    return new PageReference(options);
  },
  createRule: function createRule(options) {
    return new Rule(options);
  }
};

___$insertStyle("@charset \"UTF-8\";@media screen{.📖-page{background:#fff;outline:1px solid rgba(0,0,0,.1);box-shadow:0 2px 4px -1px rgba(0,0,0,.2);overflow:hidden}.📖-show-bleed .📖-page{box-shadow:none;outline:none;overflow:visible}.📖-page:after{content:\"\";position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:3}}li.📖-continuation,p.📖-continuation{text-indent:unset!important}li.📖-continuation{list-style:none!important}.📖-out-of-flow{display:none}.📖-page{width:200px;height:300px;position:relative;display:flex;flex-direction:column;flex-wrap:nowrap;margin:auto}.📖-flowbox{position:relative;margin:60px 40px;margin-bottom:0;flex:1 1 auto;min-height:0}.📖-content{padding:.1px;position:relative}.📖-footer{margin:60px 40px;margin-top:8pt;flex:0 1 auto;z-index:1}.📖-background{position:absolute;z-index:0;overflow:hidden}.📖-left>.📖-background{right:0}.📖-right>.📖-background{left:0}.📖-sup{font-size:.667em}.📖-footer,.📖-running-header{font-size:10pt}.📖-running-header{position:absolute;text-align:center;top:.25in}.📖-left .📖-running-header{left:18pt;text-align:left}.📖-right .📖-running-header{right:18pt;text-align:right}.📖-left .📖-rotate-container.📖-rotate-outward,.📖-left .📖-rotate-container.📖-rotate-spread-clockwise,.📖-right .📖-rotate-container.📖-rotate-inward,.📖-rotate-container.📖-rotate-clockwise{transform:rotate(90deg) translate3d(0,-100%,0);transform-origin:top left}.📖-left .📖-rotate-container.📖-rotate-inward,.📖-left .📖-rotate-container.📖-rotate-spread-counterclockwise,.📖-right .📖-rotate-container.📖-rotate-outward,.📖-rotate-container.📖-rotate-counterclockwise{transform:rotate(-90deg) translate3d(-100%,0,0);transform-origin:top left}.📖-rotate-container{position:absolute}.📖-left .📖-rotate-container.📖-rotate-clockwise .📖-background{bottom:0}.📖-left .📖-rotate-container.📖-rotate-counterclockwise .📖-background,.📖-right .📖-rotate-container.📖-rotate-clockwise .📖-background{top:0}.📖-right .📖-rotate-container.📖-rotate-counterclockwise .📖-background,.📖-rotate-container.📖-rotate-inward .📖-background{bottom:0}.📖-rotate-container.📖-rotate-outward .📖-background{top:0}.📖-right .📖-rotate-container.📖-rotate-spread-clockwise{transform:rotate(90deg) translate3d(0,-50%,0);transform-origin:top left}.📖-right .📖-rotate-container.📖-rotate-spread-counterclockwise{transform:rotate(-90deg) translate3d(-100%,-50%,0);transform-origin:top left}.📖-print-mark-wrap{display:none;position:absolute;pointer-events:none;top:0;bottom:0;left:0;right:0;z-index:3}.📖-show-bleed-marks .📖-print-mark-wrap,.📖-show-bleed-marks .📖-print-mark-wrap>[class*=bleed],.📖-show-crop .📖-print-mark-wrap,.📖-show-crop .📖-print-mark-wrap>[class*=crop]{display:block}.📖-print-mark-wrap>div{display:none;position:absolute;overflow:hidden}.📖-print-mark-wrap>div:after,.📖-print-mark-wrap>div:before{content:\"\";display:block;position:absolute}.📖-print-mark-wrap>div:before{top:0;left:0}.📖-print-mark-wrap>div:after{bottom:0;right:0}.📖-bleed-left,.📖-bleed-right,.📖-crop-fold,.📖-crop-left,.📖-crop-right{width:1px;margin:auto}.📖-bleed-left:after,.📖-bleed-left:before,.📖-bleed-right:after,.📖-bleed-right:before,.📖-crop-fold:after,.📖-crop-fold:before,.📖-crop-left:after,.📖-crop-left:before,.📖-crop-right:after,.📖-crop-right:before{width:1px;height:12pt;background-image:linear-gradient(90deg,#000 0,#000 51%,transparent 0);background-size:1px 100%}.📖-bleed-bottom,.📖-bleed-top,.📖-crop-bottom,.📖-crop-top{height:1px}.📖-bleed-bottom:after,.📖-bleed-bottom:before,.📖-bleed-top:after,.📖-bleed-top:before,.📖-crop-bottom:after,.📖-crop-bottom:before,.📖-crop-top:after,.📖-crop-top:before{width:12pt;height:1px;background-image:linear-gradient(180deg,#000 0,#000 51%,transparent 0);background-size:100% 1px}.📖-crop-fold{right:0;left:0}.📖-crop-left{left:0}.📖-crop-right{right:0}.📖-crop-top{top:0}.📖-crop-bottom{bottom:0}.📖-print-meta{padding:12pt;text-align:center;font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif;font-size:8pt;display:block!important;position:absolute;bottom:-60pt;left:0;right:0}@media screen{.📖-viewing{background:#f4f4f4!important}.📖-root{transition:opacity .2s;opacity:1;padding:10px;position:relative;padding-top:80px;min-height:90vh}.📖-measure-area,.📖-root{background:#f4f4f4;z-index:2}.📖-measure-area{position:fixed;padding:50px 20px;visibility:hidden;left:0;right:0;bottom:0}.📖-measure-area .📖-page{margin:0 auto 50px}.📖-is-overflowing{border-bottom:1px solid #f0f}.📖-print-page{margin:0 auto}.📖-error{font:16px/1.4 -apple-system,BlinkMacSystemFont,Roboto,sans-serif;padding:15vh 15vw;z-index:3;position:fixed;top:0;left:0;right:0;bottom:0;background:hsla(0,0%,96%,.7)}.📖-error-title{font-size:1.5em;margin-bottom:16px}.📖-error-text{margin-bottom:16px;white-space:pre-line}.📖-error-footer{opacity:.5;font-size:.66em;text-transform:uppercase;letter-spacing:.02em}.📖-show-bleed .📖-print-page{background:#fff;outline:1px solid rgba(0,0,0,.1);box-shadow:0 1px 3px rgba(0,0,0,.2);margin:20px auto}.📖-placeholder-pulse{animation:a 1s infinite}}@keyframes a{0%{opacity:.2}50%{opacity:.5}to{opacity:.2}}@page{margin:0}@media print{.📖-root *{-webkit-print-color-adjust:exact;color-adjust:exact}.📖-controls,.📖-viewing>:not(.📖-root){display:none!important}.📖-print-page{padding:1px;margin:0 auto}.📖-zoom-wrap[style]{transform:none!important}}body.📖-viewing{margin:0}.📖-zoom-wrap{transform-origin:top left;transform-style:preserve-3d;height:calc(100vh - 120px)}[bindery-view-mode=interactive] .📖-zoom-wrap{transform-origin:center left}.📖-viewing>:not(.📖-root):not(.📖-measure-area){display:none!important}.📖-print-page{page-break-after:always;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;transition:all .2s}.📖-spread-wrapper{position:relative;display:flex;width:800px;margin:0 auto 50px}.📖-print-page .📖-spread-wrapper{margin:0 auto}.📖-flap-holder{perspective:5000px;position:absolute;top:0;right:0;left:0;bottom:0;margin:auto;transform-style:preserve-3d}.📖-flip-sizer{position:relative;margin:auto;padding:0 20px;box-sizing:content-box}.📖-page3d{margin:auto;width:400px;height:600px;transform:rotateY(0);transform-style:preserve-3d;transform-origin:left;transition:transform .5s,box-shadow .1s;position:absolute;left:0;right:0;top:0;bottom:0}.📖-page3d:hover{box-shadow:2px 0 4px rgba(0,0,0,.2)}.📖-page3d.flipped{transform:rotateY(-180deg)}.📖-page3d .📖-page{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:none}.📖-page3d .📖-page3d-front{transform:rotateY(0)}.📖-page3d .📖-page3d-back{transform:rotateY(-180deg)}@media screen{.📖-viewing .📖-controls{display:flex!important}}.📖-controls{font:14px/1.4 -apple-system,BlinkMacSystemFont,Roboto,sans-serif;display:none;flex-direction:row;align-items:start;position:fixed;top:0;left:0;right:0;z-index:3;margin:auto;color:#000;padding:10px;overflow:visible;-webkit-font-smoothing:antialiased}.📖-controls *{font:inherit;color:inherit;margin:0;padding:0;box-sizing:border-box}.📖-controls a{color:blue;text-decoration:none}.📖-row{position:relative;display:flex;flex-wrap:wrap;align-items:start;cursor:default;user-select:none;margin-left:8px;margin-bottom:8px}.📖-title{position:relative;display:flex;padding:8px 16px;transition:opacity .2s;display:none;white-space:nowrap;overflow:hidden;margin-right:auto;opacity:0}.📖-in-progress .📖-title{opacity:1;display:flex}.📖-print-options{opacity:1;display:none}[bindery-view-mode=print] .📖-print-options{display:flex}.📖-in-progress .📖-print-options{opacity:0;display:none}.📖-spinner{border:1px solid transparent;border-left-color:#000;width:20px;height:20px;border-radius:50%;vertical-align:middle;opacity:0;pointer-events:none;transition:all .2s;margin-right:16px}.📖-in-progress .📖-spinner{opacity:1;animation:b .6s linear infinite}.📖-debug .📖-spinner{animation:b 2s linear infinite}.📖-spinner.📖-paused{animation:none}@keyframes b{0%{transform:rotate(0)}to{transform:rotate(1turn)}}.📖-controls .📖-btn{-webkit-appearance:none;color:#000;padding:8px 16px;background:#ddd;border:0;cursor:pointer;display:inline-block;border-radius:2px;margin-right:8px;text-decoration:none}.📖-controls .📖-btn:hover{background:#eee}.📖-controls .📖-btn:active{background:#ddd}.📖-controls .📖-btn:last-child{margin-right:0}.📖-controls .📖-btn-light{background:none;border:none}.📖-controls .📖-btn-main{background:blue;border-color:blue;color:#fff}.📖-controls .📖-btn-main:hover{background:blue;opacity:.7}.📖-controls .📖-btn-main:active{background:#000;opacity:1}.📖-btn-print{margin-left:auto;transition:all .8s}.📖-in-progress .📖-btn-print{background:gray;pointer-events:none}.📖-debug .📖-btn-print{display:none}.📖-viewswitcher{opacity:1;user-select:none;overflow:hidden;display:flex;flex-direction:row;border-radius:2px}.📖-in-progress .📖-viewswitcher{pointer-events:none}.📖-viewmode{color:#444;cursor:pointer;padding:0 8px;border-radius:2px}.📖-viewmode:hover{background:#eee}.📖-viewmode:active{background:#ddd}.📖-icon{height:36px;width:32px;background:currentColor;margin:0 auto}.📖-in-progress .📖-icon{color:gray!important}.📖-grid .📖-icon{-webkit-mask:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 8.5h11v15h-11zm11 0h11v15h-11z' stroke='%23000' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E\") no-repeat 50% 50%}[bindery-view-mode=grid] .📖-grid .📖-icon{-webkit-mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 8h11v16H5zm12 0h11v16H17z' fill-rule='evenodd'/%3E%3C/svg%3E\")}.📖-flip .📖-icon{-webkit-mask:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23000' fill='none' fill-rule='evenodd'%3E%3Cpath d='M5.5 8.5h11v15h-11z'/%3E%3Cpath d='M27.5 23.5v-15' stroke-linecap='square'/%3E%3Cpath d='M16.5 8.5v15h.41l7.59-2.847V5.722l-7.324 2.746L17 8.5h-.5z'/%3E%3Cpath d='M27.5 23.5h-11m8-15h3' stroke-linecap='square'/%3E%3C/g%3E%3C/svg%3E\") no-repeat 50% 50%}[bindery-view-mode=interactive] .📖-flip .📖-icon{-webkit-mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 8h2v16h-8.152L26 21.693V8zM5 8h11v16H5V8zm12 0l8-3v16l-8 3V8z' fill-rule='evenodd'/%3E%3C/svg%3E\")}.📖-print .📖-icon{-webkit-mask:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath stroke='%23000' d='M9.5 5.5h13v6h-13zm13 17H26a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 13v8A1.5 1.5 0 0 0 6 22.5h3.5v-5h13v5z'/%3E%3Ccircle fill='%23000' cx='25' cy='14' r='1'/%3E%3Cpath stroke='%23000' d='M9.5 17.5h13v8h-13z'/%3E%3C/g%3E%3C/svg%3E\") no-repeat 50% 50%}[bindery-view-mode=print] .📖-print .📖-icon{-webkit-mask-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cpath d='M9 5h14v5H9zm15 18v-5H8v5H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2zm1-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'/%3E%3Cpath d='M9 19h14v8H9z'/%3E%3C/g%3E%3C/svg%3E\")}[bindery-view-mode=grid] .📖-grid,[bindery-view-mode=interactive] .📖-flip,[bindery-view-mode=print] .📖-print{color:blue}.📖-select-wrap{padding:8px 16px;padding-right:28px;background:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 14l5 5 5-5' stroke='%23000' fill='none'/%3E%3C/svg%3E\") no-repeat 50% 50%;background-color:#f4f4f4;background-position:100%;border-radius:2px;transition:all .2s;white-space:nowrap;width:100%}.📖-select-wrap:active,.📖-select-wrap:hover{background-color:#eee}.📖-select-wrap.📖-hidden-select{max-width:0;padding-left:0;padding-right:0;border-left-width:0;border-right-width:0;color:transparent}.📖-select{position:absolute;top:0;left:0;opacity:0;-webkit-appearance:none;-moz-appearance:none;padding:8px 16px;color:#000;border:transparent;width:100%}.📖-debug-controls{display:none}.📖-debug .📖-in-progress .📖-debug-controls{display:block}.📖-refresh-btns{opacity:0;position:absolute;top:0;left:0;padding:8px 0;transition:all .2s}.📖-in-progress .📖-refresh-btns{display:none}.📖-refresh-btns a{margin-left:1em;cursor:pointer}.📖-refresh-btns a:hover{color:#000}@media screen and (max-width:720px){[bindery-view-mode=print].📖-root{padding-top:120px}.📖-controls,.📖-print-options{background:#f4f4f4}.📖-print-options{top:56px;left:0;right:0;position:fixed;margin:0 8px 0 0}.📖-print-options.📖-options-hidden{display:none}}@media screen and (max-width:500px){[bindery-view-mode=print].📖-root{padding-top:190px}.📖-print-options{flex-direction:column;align-items:stretch}.📖-hidden-select{max-width:none;max-height:0}}");

var Bindery = function () {
  function Bindery() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Bindery);

    console.log('\uD83D\uDCD6 Bindery ' + BINDERY_VERSION);

    this.autorun = opts.autorun || true;
    this.autoupdate = opts.autoupdate || false;
    this.debug = opts.debug || urlQuery('debug') || false;

    OptionType.validate(opts, {
      name: 'makeBook',
      autorun: OptionType.bool,
      content: OptionType.any,
      pageSetup: OptionType.shape({
        name: 'pageSetup',
        bleed: OptionType.length,
        margin: OptionType.shape({
          name: 'margin',
          top: OptionType.length,
          inner: OptionType.length,
          outer: OptionType.length,
          bottom: OptionType.length
        }),
        size: OptionType.shape({
          name: 'size',
          width: OptionType.length,
          height: OptionType.length
        })
      }),
      rules: OptionType.array
    });

    this.pageSetup = new PageSetup(opts.pageSetup);

    this.viewer = new Viewer({ bindery: this });
    this.controls = this.viewer.controls;

    if (opts.startingView) {
      this.viewer.setMode(opts.startingView);
    }

    this.rules = [];
    if (opts.rules) this.addRules(opts.rules);

    if (!opts.content) {
      this.viewer.displayError('Content not specified', 'You must include a source element, selector, or url');
      console.error('Bindery: You must include a source element or selector');
    } else if (typeof opts.content === 'string') {
      this.source = document.querySelector(opts.content);
      if (!(this.source instanceof HTMLElement)) {
        this.viewer.displayError('Content not specified', 'Could not find element that matches selector "' + opts.content + '"');
        console.error('Bindery: Could not find element that matches selector "' + opts.content + '"');
        return;
      }
      if (this.autorun) {
        this.makeBook();
      }
    } else if (_typeof(opts.content) === 'object' && opts.content.url) {
      var url = opts.content.url;
      var selector = opts.content.selector;
      this.fetchSource(url, selector);
    } else if (opts.content instanceof HTMLElement) {
      this.source = opts.content;
      if (this.autorun) {
        this.makeBook();
      }
    } else {
      console.error('Bindery: Source must be an element or selector');
    }
  }

  // Convenience constructor


  createClass(Bindery, [{
    key: 'fetchSource',
    value: function fetchSource(url, selector) {
      var _this = this;

      fetch(url).then(function (response) {
        if (response.status === 404) {
          _this.viewer.displayError('404', 'Could not find file at "' + url + '"');
        } else if (response.status === 200) {
          return response.text();
        }
        return '';
      }).then(function (fetchedContent) {
        var wrapper = hyperscript('div');
        wrapper.innerHTML = fetchedContent;
        _this.source = wrapper.querySelector(selector);
        if (!(_this.source instanceof HTMLElement)) {
          _this.viewer.displayError('Source not specified', 'Could not find element that matches selector "' + selector + '"');
          console.error('Bindery: Could not find element that matches selector "' + selector + '"');
          return;
        }
        if (_this.autorun) {
          _this.makeBook();
        }
      }).catch(function (error) {
        console.error(error);
        var scheme = window.location.href.split('://')[0];
        if (scheme === 'file') {
          _this.viewer.displayError('Can\'t fetch content from "' + url + '"', 'Web pages can\'t fetch content unless they are on a server.');
        }
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.viewer.cancel();
      document.body.classList.remove(c('viewing'));
      this.source.style.display = '';
    }
  }, {
    key: 'addRules',
    value: function addRules(newRules) {
      var _this2 = this;

      newRules.forEach(function (rule) {
        if (rule instanceof Rules.Rule) {
          _this2.rules.push(rule);
        } else {
          throw Error('Bindery: The following is not an instance of Bindery.Rule and will be ignored: ' + rule);
        }
      });
    }
  }, {
    key: 'updateBookSilent',
    value: function updateBookSilent() {
      var _this3 = this;

      this.layoutComplete = false;

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      document.body.classList.add(c('viewing'));

      this.pageSetup.updateStylesheet();

      paginate({
        content: content,
        rules: this.rules,
        success: function success(book) {
          _this3.viewer.book = book;
          _this3.viewer.render();
          _this3.controls.setDone();
          _this3.layoutComplete = true;
        },
        progress: function progress() {},
        error: function error(_error) {
          _this3.layoutComplete = true;
          _this3.viewer.displayError('Layout failed', _error);
        },
        isDebugging: this.debug
      });
    }
  }, {
    key: 'makeBook',
    value: function makeBook(doneBinding) {
      var _this4 = this;

      if (!this.source) {
        document.body.classList.add(c('viewing'));
        return;
      }

      this.layoutComplete = false;

      if (!this.pageSetup.isSizeValid()) {
        this.viewer.displayError('Page is too small', 'Size: ' + JSON.stringify(this.pageSize) + ' \n Margin: ' + JSON.stringify(this.pageMargin) + ' \n Try adjusting the sizes or units.');
        console.error('Bindery: Cancelled pagination. Page is too small.');
        return;
      }

      this.source.style.display = '';
      var content = this.source.cloneNode(true);
      this.source.style.display = 'none';

      // In case we're updating an existing layout
      this.viewer.clear();

      document.body.classList.add(c('viewing'));
      this.viewer.element.classList.add(c('in-progress'));
      if (this.debug) document.body.classList.add(c('debug'));

      this.pageSetup.updateStylesheet();

      this.controls.setInProgress();

      paginate({
        content: content,
        rules: this.rules,
        success: function success(book) {
          _this4.viewer.book = book;
          _this4.viewer.render();

          _this4.layoutComplete = true;
          _this4.controls.setDone();
          if (doneBinding) doneBinding();
          _this4.viewer.element.classList.remove(c('in-progress'));
          document.body.classList.remove(c('debug'));
        },
        progress: function progress(book) {
          _this4.viewer.book = book;
          _this4.controls.updateProgress(book.pages.length);
          _this4.viewer.renderProgress();
        },
        error: function error(_error2) {
          _this4.layoutComplete = true;
          _this4.viewer.element.classList.remove(c('in-progress'));
          _this4.viewer.displayError('Layout couldn\'t complete', _error2);
        },
        isDebugging: this.debug
      });
    }
  }], [{
    key: 'makeBook',
    value: function makeBook() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      opts.autorun = opts.autorun ? opts.autorun : true;
      return new Bindery(opts);
    }
  }]);
  return Bindery;
}();

var BinderyWithRules = Object.assign(Bindery, Rules);

return BinderyWithRules;

})));
//# sourceMappingURL=bindery.umd.js.map
