//
// CSS REGIONS POLYFILL
//
// NOTICE: This is a lightly modified version of Remy Francois's 
// https://github.com/FremyCompany/css-regions-polyfill,
// which is licensed under http://www.apache.org/licenses/LICENSE-2.0
//
// It provides the backbone to bindery.js ... everything
// may work better without all the overhead from this polyfill,
// but using the official web standards for this is nice
// (at least in theory).
//
// 
// Evan Brooks 2014
//
// ------------

"use strict";

//
// start by polyfilling caretRangeFromPoint
//

if(!document.caretRangeFromPoint) {
    if (document.caretPositionFromPoint) {
        document.caretRangeFromPoint = function caretRangeFromPoint(x,y) {
            var r = document.createRange();
            var p = document.caretPositionFromPoint(x,y);
            if(p.offsetNode) {
                r.setStart(p.offsetNode, p.offset);
                r.setEnd(p.offsetNode, p.offset);
            }
            return r;
        }
    } else if((document.body||document.createElement('body')).createTextRange) {

        //
        // we may want to convert TextRange to Range
        //

        var TextRangeUtils = {
            convertToDOMRange: function (textRange, document) {
                var adoptBoundary = function(domRange, textRangeInner, bStart) {
                    // iterate backwards through parent element to find anchor location
                    var cursorNode = document.createElement('a'), cursor = textRangeInner.duplicate();
                    cursor.collapse(bStart);
                    var parent = cursor.parentElement();
                    do {
                            parent.insertBefore(cursorNode, cursorNode.previousSibling);
                            cursor.moveToElementText(cursorNode);
                    } while (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRangeInner) > 0 && cursorNode.previousSibling);

                    // when we exceed or meet the cursor, we've found the node
                    if (cursor.compareEndPoints(bStart ? 'StartToStart' : 'StartToEnd', textRangeInner) == -1 && cursorNode.nextSibling) {
                            // data node
                            cursor.setEndPoint(bStart ? 'EndToStart' : 'EndToEnd', textRangeInner);
                            domRange[bStart ? 'setStart' : 'setEnd'](cursorNode.nextSibling, cursor.text.length);
                    } else {
                            // element
                            domRange[bStart ? 'setStartBefore' : 'setEndBefore'](cursorNode);
                    }
                    cursorNode.parentNode.removeChild(cursorNode);
                }

                // validate argumentsrelayout
                if(!document) { document=window.document; }

                // return a DOM range
                var domRange = document.createRange();
                adoptBoundary(domRange, textRange, true);
                adoptBoundary(domRange, textRange, false);
                return domRange;
            },

            convertFromDOMRange: function (domRange) {
                var adoptEndPoint = function(textRange, domRangeInner, bStart) {
                    // find anchor node and offset
                    var container = domRangeInner[bStart ? 'startContainer' : 'endContainer'];
                    var offset = domRangeInner[bStart ? 'startOffset' : 'endOffset'], textOffset = 0;
                    var anchorNode = DOMUtils.isDataNode(container) ? container : container.childNodes[offset];
                    var anchorParent = DOMUtils.isDataNode(container) ? container.parentNode : container;
                    // visible data nodes need a text offset
                    if (container.nodeType == 3 || container.nodeType == 4)
                        textOffset = offset;

                    // create a cursor element node to position range (since we can't select text nodes)
                    var cursorNode = domRangeInner._document.createElement('a');
                    anchorParent.insertBefore(cursorNode, anchorNode);
                    var cursor = domRangeInner._document.body.createTextRange();
                    cursor.moveToElementText(cursorNode);
                    cursorNode.parentNode.removeChild(cursorNode);
                    // move range
                    textRange.setEndPoint(bStart ? 'StartToStart' : 'EndToStart', cursor);
                    textRange[bStart ? 'moveStart' : 'moveEnd']('character', textOffset);
                }

                // return an IE text range
                var textRange = domRange._document.body.createTextRange();
                adoptEndPoint(textRange, domRange, true);
                adoptEndPoint(textRange, domRange, false);
                return textRange;
            }
        };


        document.caretRangeFromPoint = function caretRangeFromPoint(x,y) {

            // the accepted number of vertical backtracking, in CSS pixels
            var IYDepth = 40;

            // try to create a text range at the specified location
            var r = document.body.createTextRange();
            for(var iy=IYDepth; iy; iy=iy-4) {
                var ix = x; if(true) {
                    try {
                        r.moveToPoint(ix,iy+y-IYDepth);
                        return TextRangeUtils.convertToDOMRange(r);
                    } catch(ex) {}
                }
            }

            // if that fails, return the location just after the element located there
            try {

                var elem = document.elementFromPoint(x-1,y-1);
                var r = document.createRange();
                r.setStartAfter(elem);
                return r;

            } catch(ex) {

                return null;

            }
        }
    }
}


///
/// helper function for moving ranges char by char
///

Range.prototype.myMoveOneCharLeft = function() {
    var r = this;

    // move to the previous cursor location
    if(r.endOffset > 0) {

        // if we can enter into the previous sibling
        var previousSibling = r.endContainer.childNodes[r.endOffset-1];
        if(previousSibling && previousSibling.lastChild) {

            // enter the previous sibling from its end
            r.setEndAfter(previousSibling.lastChild);

        } else if(previousSibling && previousSibling.nodeType==previousSibling.TEXT_NODE) { // todo: lookup value

            // enter the previous text node from its end
            r.setEnd(previousSibling, previousSibling.nodeValue.length);

        } else {

            // else move before that element
            r.setEnd(r.endContainer, r.endOffset-1);

        }

    } else {
        r.setEndBefore(r.endContainer);
    }

}

Range.prototype.myMoveOneCharRight = function() {
    var r = this;

    // move to the previous cursor location
    var max = (r.startContainer.nodeType==r.startContainer.TEXT_NODE ? r.startContainer.nodeValue.length : r.startContainer.childNodes.length)
    if(r.startOffset < max) {

        // if we can enter into the next sibling
        var nextSibling = r.endContainer.childNodes[r.endOffset];
        if(nextSibling && nextSibling.firstChild) {

            // enter the next sibling from its start
            r.setStartBefore(nextSibling.firstChild);

        } else if(nextSibling && nextSibling.nodeType==nextSibling.TEXT_NODE && nextSibling.nodeValue!='') { // todo: lookup value

            // enter the next text node from its start
            r.setStart(nextSibling, 0);

        } else {

            // else move before that element
            r.setStart(r.startContainer, r.startOffset+1);

        }

    } else {
        r.setStartAfter(r.endContainer);
    }

    // shouldn't be needed but who knows...
    r.setEnd(r.startContainer, r.startOffset);

}


///
/// This functions is optimized to not yield inside a word in a text node
///
Range.prototype.myMoveTowardRight = function() {
    var r = this;

    // move to the previous cursor location
    var isTextNode = r.startContainer.nodeType==r.startContainer.TEXT_NODE;
    var max = (isTextNode ? r.startContainer.nodeValue.length : r.startContainer.childNodes.length)
    if(r.startOffset < max) {

        // if we can enter into the next sibling
        var nextSibling = r.endContainer.childNodes[r.endOffset];
        if(nextSibling && nextSibling.firstChild) {

            // enter the next sibling from its start
            r.setStartBefore(nextSibling.firstChild);

        } else if(nextSibling && nextSibling.nodeType==nextSibling.TEXT_NODE && nextSibling.nodeValue!='') { // todo: lookup value

            // enter the next text node from its start
            r.setStart(nextSibling, 0);

        } else if(isTextNode) {

            // move to the next non a-zA-Z symbol
            var currentText = r.startContainer.nodeValue;
            var currentOffset = r.startOffset;
            var currentLetter = currentText[currentOffset++];
            while(currentOffset < max && /^\w$/.test(currentLetter)) {
                currentLetter = currentText[currentOffset++];
            }
            r.setStart(r.startContainer, currentOffset);

        } else {

            // else move before that element
            r.setStart(r.startContainer, r.startOffset+1);

        }

    } else {
        r.setStartAfter(r.endContainer);
    }

    // shouldn't be needed but who knows...
    r.setEnd(r.startContainer, r.startOffset);

}


Range.prototype.myMoveEndOneCharLeft = function() {
    var r = this;

    // move to the previous cursor location
    if(r.endOffset > 0) {

        // if we can enter into the previous sibling
        var previousSibling = r.endContainer.childNodes[r.endOffset-1];
        if(previousSibling && previousSibling.lastChild) {

            // enter the previous sibling from its end
            r.setEndAfter(previousSibling.lastChild);

        } else if(previousSibling && previousSibling.nodeType==previousSibling.TEXT_NODE) { // todo: lookup value

            // enter the previous text node from its end
            r.setEnd(previousSibling, previousSibling.nodeValue.length);

        } else {

            // else move before that element
            r.setEnd(r.endContainer, r.endOffset-1);

        }

    } else {
        r.setEndBefore(r.endContainer);
    }

}

Range.prototype.myMoveEndOneCharRight = function() {
    var r = this;

    // move to the previous cursor location
    var max = (r.endContainer.nodeType==r.endContainer.TEXT_NODE ? r.endContainer.nodeValue.length : r.endContainer.childNodes.length)
    if(r.endOffset < max) {

        // if we can enter into the next sibling
        var nextSibling = r.endContainer.childNodes[r.endOffset];
        if(nextSibling && nextSibling.firstChild) {

            // enter the next sibling from its start
            r.setEndBefore(nextSibling.firstChild);

        } else if(nextSibling && nextSibling.nodeType==nextSibling.TEXT_NODE) { // todo: lookup value

            // enter the next text node from its start
            r.setEnd(nextSibling, 0);

        } else {

            // else move before that element
            r.setEnd(r.endContainer, r.endOffset+1);

        }

    } else {
        r.setEndAfter(r.endContainer);
    }

}

//
// Get the *real* bounding client rect of the range
// { therefore we need to fix some browser bugs... }
//
Range.prototype.myGetSelectionRect = function() {

    // get the browser's claimed rect
    var rect = this.getBoundingClientRect();

	// HACK FOR ANDROID BROWSER AND OLD WEBKIT
	if(!rect) {
		rect={top:0,right:0,bottom:0,left:0,width:0,height:0};
	}

    // if the value seems wrong... (some browsers don't like collapsed selections)
    if(this.collapsed && rect.top===0 && rect.bottom===0) {

        // select one char and infer location
        var clone = this.cloneRange(); var collapseToLeft=false; clone.collapse(false);

        // the case where no char before is tricky...
        if(clone.startOffset==0) {

            // let's move on char to the right
            clone.myMoveTowardRight();
            collapseToLeft=true;

            // note: some browsers don't like selections
            // that spans multiple containers, so we will
            // iterate this process until we have one true
            // char selected
            clone.setStart(clone.endContainer, 0);

        } else {

            // else, just select the char before
            clone.setStart(this.startContainer, this.startOffset-1);
            collapseToLeft=false;

        }

        // get some real rect
        var rect = clone.myGetSelectionRect();

        // compute final value
        if(collapseToLeft) {
            return {

                left: rect.left,
                right: rect.left,
                width: 0,

                top: rect.top,
                bottom: rect.bottom,
                height: rect.height

            }
        } else {
            return {

                left: rect.right,
                right: rect.right,
                width: 0,

                top: rect.top,
                bottom: rect.bottom,
                height: rect.height

            }
        }

    } else {
        return rect;
    }

}

// not sure it's needed but still
if(!window.Element) window.Element=window.HTMLElement;
if(!window.Node) window.Node = {};

// make getBCR working on text nodes & stuff
Node.getBoundingClientRect = function getBoundingClientRect(element) {
    if (element.getBoundingClientRect) {

        var rect = element.getBoundingClientRect();

    } else {

        var range = document.createRange();
        range.selectNode(element);

        var rect = range.getBoundingClientRect();

    }

	// HACK FOR ANDROID BROWSER AND OLD WEBKIT
	if(!rect) {
		rect={top:0,right:0,bottom:0,left:0,width:0,height:0};
	}

	return rect;
};


// make getCR working on text nodes & stuff
Node.getClientRects = function getClientRects(firstChild) {
    if (firstChild.getBoundingClientRect) {

        return firstChild.getClientRects();

    } else {

        var range = document.createRange();
        range.selectNode(firstChild);

        return range.getClientRects();

    }
};

// fix for IE (contains fails for text nodes...)
Node.contains = function contains(parentNode,node) {
    if(node.nodeType != 1) {
        if(!node.parentNode) return false;
        return node.parentNode==parentNode || parentNode.contains(node.parentNode);
    } else {
        return parentNode.contains(node);
    }
}

//
// get the bounding rect of the selection, including the bottom padding/marging of the previous element if required
// { this is a special version for breaking algorithms that do not want to miss the previous element real size }
//
Range.prototype.myGetExtensionRect = function() {

    // this function returns the selection rect
    // but does take care of taking in account
    // the bottom-{padding/border} of the previous
    // sibling element, to detect overflow points
    // more accurately

    var rect = this.myGetSelectionRect();
    var previousSibling = this.endContainer.childNodes[this.endOffset-1];
    if(previousSibling) {

        // correct with the new take
        var prevSibRect = Node.getBoundingClientRect(previousSibling);
        var adjustedBottom = Math.max(rect.bottom,prevSibRect.bottom);
        if(adjustedBottom == rect.bottom) return rect;
        return {

            left: rect.left,
            right: rect.right,
            width: rect.width,

            top: rect.top,
            bottom: adjustedBottom,
            height: adjustedBottom - rect.top

        };

    } else if(this.bottom==0 && this.endContainer.nodeType === 3) {

        // note that if we are in a text node,
        // we may want to cover all the previous
        // text in the node to avoid whitespace
        // related bugs

        var onlyWhiteSpaceBefore = /^(\s|\n)*$/.test(this.endContainer.nodeValue.substr(0,this.endOffset));
        if(onlyWhiteSpaceBefore) {

            // if we are in the fucking whitespace land, return first line
            var prevSibRect = Node.getClientRects(this.endContainer)[0];
            return prevSibRect;

        } else {

            // otherwhise, let's rely on previous chars
            var auxiliaryRange = this.cloneRange();
            auxiliaryRange.setStart(this.endContainer,0);

            // correct with the new take
            var prevSibRect = auxiliaryRange.getBoundingClientRect();
            var adjustedBottom = Math.max(rect.bottom,prevSibRect.bottom);
            return {

                left: rect.left,
                right: rect.right,
                width: rect.width,

                top: rect.top,
                bottom: adjustedBottom,
                height: adjustedBottom - rect.top

            };

        }

    } else {

        return rect;

    }
}
"use strict";

//
// some code for console polyfilling
//
if(!window.console) {

	window.console = {
		backlog: '',

	    log: function(x) { this.backlog+=x+'\n'; if(window.debug) alert(x); },

	    dir: function(x) { try {

			var elm = function(e) {
				if(e.innerHTML) {
					return {
						tagName: e.tagName,
						className: e.className,
						id: e.id,
						innerHTML: e.innerHTML.substr(0,100)
					}
				} else {
					return {
						nodeName: e.nodeName,
						nodeValue: e.nodeValue
					}
				}
			};

			var jsonify = function(o) {
			    var seen=[];
			    var jso=JSON.stringify(o, function(k,v){
			        if (typeof v =='object') {
			            if ( !seen.indexOf(v) ) { return '__cycle__'; }
						if ( v instanceof window.Node) { return elm(v); }
			            seen.push(v);
			        } return v;
			    });
			    return jso;
			};

			this.log(jsonify(x));

		} catch(ex) { this.log(x) } },

		warn: function(x) { this.log(x) }

	};

	window.onerror = function() {
	    console.log([].slice.call(arguments,0).join("\n"))
	};

}

window.cssConsole = {
	enabled: (!!window.debug), warnEnabled: (true),
	log: function(x) { if(this.enabled) console.log(x) },
	dir: function(x) { if(this.enabled) console.dir(x) },
	warn: function(x) { if(this.warnEnabled) console.warn(x) },
}


//
// some other basic om code
//
var basicObjectModel = {

    //
    // the following functions are about event cloning
    //
    cloneMouseEvent: function cloneMouseEvent(e) {
        var evt = document.createEvent("MouseEvent");
        evt.initMouseEvent(
            e.type,
            e.canBubble||e.bubbles,
            e.cancelable,
            e.view,
            e.detail,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            e.ctrlKey,
            e.altKey,
            e.shiftKey,
            e.metaKey,
            e.button,
            e.relatedTarget
        );
        return evt;
    },

    cloneKeyboardEvent: function cloneKeyboardEvent(e) {
        // TODO: this doesn't work cross-browswer...
        // see https://gist.github.com/termi/4654819/ for the huge code
        return basicObjectModel.cloneCustomEvent(e);
    },

    cloneCustomEvent: function cloneCustomEvent(e) {
        var ne = document.createEvent("CustomEvent");
        ne.initCustomEvent(e.type, e.canBubble||e.bubbles, e.cancelable, "detail" in e ? e.detail : e);
        for(var prop in e) {
            try {
                if(e[prop] != ne[prop] && e[prop] != e.target) {
                    try { ne[prop] = e[prop]; }
                    catch (ex) { Object.defineProperty(ne,prop,{get:function() { return e[prop]} }) }
                }
            } catch(ex) {}
        }
        return ne;
    },

    cloneEvent: function cloneEvent(e) {

        if(e instanceof MouseEvent) {
            return basicObjectModel.cloneMouseEvent(e);
        } else if(e instanceof KeyboardEvent) {
            return basicObjectModel.cloneKeyboardEvent(e);
        } else {
            return basicObjectModel.cloneCustomEvent(e);
        }

    },

    //
    // allows you to drop event support to any class easily
    //
    EventTarget: {
        implementsIn: function(eventClass, static_class) {

            if(!static_class && typeof(eventClass)=="function") eventClass=eventClass.prototype;

            eventClass.dispatchEvent = basicObjectModel.EventTarget.prototype.dispatchEvent;
            eventClass.addEventListener = basicObjectModel.EventTarget.prototype.addEventListener;
            eventClass.removeEventListener = basicObjectModel.EventTarget.prototype.removeEventListener;

        },
        prototype: {}
    }

};

basicObjectModel.EventTarget.prototype.addEventListener = function(eventType,f) {
    if(!this.eventListeners) this.eventListeners=[];

    var ls = (this.eventListeners[eventType] || (this.eventListeners[eventType]=[]));
    if(ls.indexOf(f)==-1) {
        ls.push(f);
    }

}

basicObjectModel.EventTarget.prototype.removeEventListener = function(eventType,f) {
    if(!this.eventListeners) this.eventListeners=[];

    var ls = (this.eventListeners[eventType] || (this.eventListeners[eventType]=[])), i;
    if((i=ls.indexOf(f))!==-1) {
        ls.splice(i,1);
    }

}

basicObjectModel.EventTarget.prototype.dispatchEvent = function(event_or_type) {
    if(!this.eventListeners) this.eventListeners=[];

    // abort quickly when no listener has been set up
    if(typeof(event_or_type) == "string") {
        if(!this.eventListeners[event_or_type] || this.eventListeners[event_or_type].length==0) {
            return;
        }
    } else {
        if(!this.eventListeners[event_or_type.type] || this.eventListeners[event_or_type.type].length==0) {
            return;
        }
    }

    // convert the event
    var event = event_or_type;
    function setUpPropertyForwarding(e,ee,key) {
        Object.defineProperty(ee,key,{
            get:function() {
                var v = e[key];
                if(typeof(v)=="function") {
                    return v.bind(e);
                } else {
                    return v;
                }
            },
            set:function(v) {
                e[key] = v;
            }
        });
    }
    function setUpTarget(e,v) {
        try { Object.defineProperty(e,"target",{get:function() {return v}}); }
        catch(ex) {}
        finally {

            if(e.target !== v) {

                var ee = Object.create(Object.getPrototypeOf(e));
                ee = setUpTarget(ee,v);
                for(key in e) {
                    if(key != "target") setUpPropertyForwarding(e,ee,key);
                }
                return ee;

            } else {

                return e;

            }

        }
    }

    // try to set the target
    if(typeof(event)=="object") {
        try { event=setUpTarget(event,this); } catch(ex) {}

    } else if(typeof(event)=="string") {
        event = document.createEvent("CustomEvent");
        event.initCustomEvent(event_or_type, /*canBubble:*/ true, /*cancelable:*/ false, /*detail:*/this);
        try { event=setUpTarget(event,this); } catch(ex) {}

    } else {
        throw new Error("dispatchEvent expect an Event object or a string containing the event type");
    }

    // call all listeners
    var ls = (this.eventListeners[event.type] || (this.eventListeners[event.type]=[]));
    for(var i=ls.length; i--;) {
        try {
            ls[i](event);
        } catch(ex) {
            setImmediate(function() { throw ex; });
        }
    }

    return event.isDefaultPrevented;
}
"use strict";

(function() {


    //
    // polyfill setImmediate
    //
    window.setImmediate = window.setImmediate || function(f) {
        setTimeout(f, 0);
    };
    window.clearImmediate = window.clearImmediate || window.clearTimeout;


    //
    // polyfill requestAnimationFrame
    //
    window.requestAnimationFrame = window.requestAnimationFrame || function(f) {
        return setTimeout(function() {
            f(+new Date());
        }, 16);
    };
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;


    //
    // polyfill performance.now()
    //
    if(window.performance && window.performance.now) {
        var now = function() { return performance.now(); }
    } else if(Date.now) {
        var now = function() { return Date.now(); }
    } else {
        var now = function() { return +new Date(); }
    }


    //
    // Encapsulate a task
    //
    function Task(action) {
        this.call = action;
    }

    //
    // Encapsulate task priority logic
    //
    function TaskScheduler(parent) {

        this.isRunning = false;
        this.isScheduledNow = false;

        this.taskQueue = [];
        this.delayedTasks = 0;
        this.childSchedulers = [];
        this.parentScheduler = parent;
        if(parent) { parent.childSchedulers.push(this); }

        var This = this;
        This.tryRun = function() {
            if(This.parentScheduler) {
                This.parentScheduler.tryRun();
            } else {
                This.run();
            }
        }
        This.run = function() {

            This.isRunning = true;

            // calling code should not face scheduler errors
            try {

                //
                // walk through all tasks
                //
                if(This.taskQueue.length !== 0) {

                    var task; while(task=This.taskQueue.shift()) {

                        // run the task
                        // (the loop should not break if a task fails)
                        try { task.call(); }
                        catch(ex) { setImmediate(function() { throw ex; }) }

                    }

                }

                //
                // let child schedulers execute if no task is pending
                //
                if(This.delayedTasks === 0) {

                    for(var i=0; i<This.childSchedulers.length; i++) {

                        // run the scheduler
                        // (the loop should not break if a scheduler fails)
                        try { This.childSchedulers[i].run(); }
                        catch(ex) { setImmediate(function() { throw ex; }) }

                    }

                }

                //
                // execute new immediates, if any
                //
                if(This.taskQueue.length !== 0) {

                    This.run();

                }


            } catch(ex) { setImmediate(function() { throw ex; }) }

            This.isRunning = false;

        }

    }

    TaskScheduler.prototype.pushTask = function(f) {

        // push the task
        this.taskQueue.push(f);

        // ensure the scheduler will run soon
        this.scheduleNow();

    };

    TaskScheduler.prototype.pushDelayedTask = function(f, scheduler) {

        // ask for a delayed execution
        var This = this;
        var result = scheduler(function() {

            // push the task
            This.pushTask(f);
            This.delayedTasks--;

            // empty the queue
            This.scheduleNow();

        });

        // record the future task
        this.delayedTasks++;

        // return scheduler-relative info
        return result;

    }

    // aliases for common web functions
    TaskScheduler.prototype.setImmediate = TaskScheduler.prototype.pushTask;
    TaskScheduler.prototype.setTimeout = function(f,d) {
        this.pushDelayedTask(f, function(f) { setTimeout(f,d) })
    }
    TaskScheduler.prototype.requestAnimationFrame = function(f,d) {
        this.pushDelayedTask(f, requestAnimationFrame);
    }

    TaskScheduler.prototype.scheduleNow = function() {

        // avoid creating multiple running
        // version of the scheduler
        if(this.isRunning) return;
        if(this.isScheduledNow) return;

        // schedule a new run
        setImmediate(this.tryRun);

    }

    window.JSTaskScheduler = TaskScheduler;

}());
//
// note: this file is based on Tab Atkins's CSS Parser
// please include him (@tabatkins) if you open any issue for this file
//
"use strict";

var cssSyntax = {
    tokenize: function(string) {},
    parse: function(tokens) {},
    parseCSSValue: function(bestValue, stringOnly) {
        if(stringOnly) {
            var result = /*bestValue ? cssSyntax.parse("*{a:"+bestValue+"}").value[0].value[0].value : */new cssSyntax.TokenList();
            result.asCSSString = bestValue; // optimize conversion
            return result;
        } else {
            var result = bestValue ? cssSyntax.parse("*{a:"+bestValue+"}").value[0].value[0].value : new cssSyntax.TokenList();
            result.asCSSString = bestValue; // optimize conversion
            return result;
        }
    }
};

//
// css tokenizer
//
(function() {

    var between = function (num, first, last) { return num >= first && num <= last; }
    function digit(code) { return between(code, 0x30,0x39); }
    function hexdigit(code) { return digit(code) || between(code, 0x41,0x46) || between(code, 0x61,0x66); }
    function uppercaseletter(code) { return between(code, 0x41,0x5a); }
    function lowercaseletter(code) { return between(code, 0x61,0x7a); }
    function letter(code) { return uppercaseletter(code) || lowercaseletter(code); }
    function nonascii(code) { return code >= 0xa0; }
    function namestartchar(code) { return letter(code) || nonascii(code) || code == 0x5f; }
    function namechar(code) { return namestartchar(code) || digit(code) || code == 0x2d; }
    function nonprintable(code) { return between(code, 0,8) || between(code, 0xe,0x1f) || between(code, 0x7f,0x9f); }
    function newline(code) { return code == 0xa || code == 0xc; }
    function whitespace(code) { return newline(code) || code == 9 || code == 0x20; }
    function badescape(code) { return newline(code) || isNaN(code); }

    // Note: I'm not yet acting smart enough to actually handle astral characters.
    var maximumallowedcodepoint = 0x10ffff;

    // Add support for token lists (superclass of array)
    var TokenList = cssSyntax.TokenList = function TokenList() {
        var array = [];
        array.toCSSString=cssSyntax.TokenListToCSSString;
        return array;
    }
    var TokenListToCSSString = cssSyntax.TokenListToCSSString = function TokenListToCSSString(sep) {
        if(sep) {
            return this.map(function(o) { return o.toCSSString(); }).join(sep);
        } else {
            return this.asCSSString || (this.asCSSString = (
                this.map(function(o) { return o.toCSSString(); }).join("/**/")
                    .replace(/( +\/\*\*\/ *| * | *\/\*\*\/ +)/g," ")
                    .replace(/( +\/\*\*\/ *| * | *\/\*\*\/ +)/g," ")
                    .replace(/(\!|\:|\;|\@|\.|\,|\*|\=|\&|\\|\/|\<|\>|\[|\{|\(|\]|\}|\)|\|)\/\*\*\//g,"$1")
                    .replace(/\/\*\*\/(\!|\:|\;|\@|\.|\,|\*|\=|\&|\\|\/|\<|\>|\[|\{|\(|\]|\}|\)|\|)/g,"$1")
            ));
        }
    }

    function tokenize(str, options) {
        if(options == undefined) options = {transformFunctionWhitespace:false, scientificNotation:false};
        var i = -1;
        var tokens = new TokenList();
        var state = "data";
        var code;
        var currtoken;

        // Line number information.
        var line = 0;
        var column = 0;
        // The only use of lastLineLength is in reconsume().
        var lastLineLength = 0;
        var incrLineno = function() {
            line += 1;
            lastLineLength = column;
            column = 0;
        };
        var locStart = {line:line, column:column};

        var next = function(num) { if(num === undefined) num = 1; return str.charCodeAt(i+num); };
        var consume = function(num) {
            if(num === undefined)
                num = 1;
            i += num;
            code = str.charCodeAt(i);
            if (newline(code)) incrLineno();
            else column += num;
            //console.log('Consume '+i+' '+String.fromCharCode(code) + ' 0x' + code.toString(16));
            return true;
        };
        var reconsume = function() {
            i -= 1;
            if (newline(code)) {
                line -= 1;
                column = lastLineLength;
            } else {
                column -= 1;
            }
            locStart.line = line;
            locStart.column = column;
            return true;
        };
        var eof = function() { return i >= str.length; };
        var donothing = function() {};
        var emit = function(token) {
            if(token) {
                token.finish();
            } else {
                token = currtoken.finish();
            }
            if (options.loc === true) {
                token.loc = {};
                token.loc.start = {line:locStart.line, column:locStart.column};
                locStart = {line: line, column: column};
                token.loc.end = locStart;
            }
            tokens.push(token);
            //console.log('Emitting ' + token);
            currtoken = undefined;
            return true;
        };
        var create = function(token) { currtoken = token; return true; };
        var parseerror = function() { console.log("Parse error at index " + i + ", processing codepoint 0x" + code.toString(16) + " in state " + state + ".");return true; };
        var catchfire = function(msg) { console.log("MAJOR SPEC ERROR: " + msg); return true;}
        var switchto = function(newstate) {
            state = newstate;
            //console.log('Switching to ' + state);
            return true;
        };
        var consumeEscape = function() {
            // Assume the the current character is the \
            consume();
            if(hexdigit(code)) {
                // Consume 1-6 hex digits
                var digits = [];
                for(var total = 0; total < 6; total++) {
                    if(hexdigit(code)) {
                        digits.push(code);
                        consume();
                    } else { break; }
                }
                var value = parseInt(digits.map(String.fromCharCode).join(''), 16);
                if( value > maximumallowedcodepoint ) value = 0xfffd;
                // If the current char is whitespace, cool, we'll just eat it.
                // Otherwise, put it back.
                if(!whitespace(code)) reconsume();
                return value;
            } else {
                return code;
            }
        };

        for(;;) {
            if(i > str.length*2) return "I'm infinite-looping!";
            consume();
            switch(state) {
            case "data":
                if(whitespace(code)) {
                    emit(new WhitespaceToken);
                    while(whitespace(next())) consume();
                }
                else if(code == 0x22) switchto("double-quote-string");
                else if(code == 0x23) switchto("hash");
                else if(code == 0x27) switchto("single-quote-string");
                else if(code == 0x28) emit(new OpenParenToken);
                else if(code == 0x29) emit(new CloseParenToken);
                else if(code == 0x2b) {
                    if(digit(next()) || (next() == 0x2e && digit(next(2)))) switchto("number") && reconsume();
                    else emit(new DelimToken(code));
                }
                else if(code == 0x2d) {
                    if(next(1) == 0x2d && next(2) == 0x3e) consume(2) && emit(new CDCToken);
                    else if(digit(next()) || (next(1) == 0x2e && digit(next(2)))) switchto("number") && reconsume();
                    else switchto('ident') && reconsume();
                }
                else if(code == 0x2e) {
                    if(digit(next())) switchto("number") && reconsume();
                    else emit(new DelimToken(code));
                }
                else if(code == 0x2f) {
                    if(next() == 0x2a) consume() && switchto("comment");
                    else emit(new DelimToken(code));
                }
                else if(code == 0x3a) emit(new ColonToken);
                else if(code == 0x3b) emit(new SemicolonToken);
                else if(code == 0x3c) {
                    if(next(1) == 0x21 && next(2) == 0x2d && next(3) == 0x2d) consume(3) && emit(new CDOToken);
                    else emit(new DelimToken(code));
                }
                else if(code == 0x40) switchto("at-keyword");
                else if(code == 0x5b) emit(new OpenSquareToken);
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit(new DelimToken(code));
                    else switchto('ident') && reconsume();
                }
                else if(code == 0x5d) emit(new CloseSquareToken);
                else if(code == 0x7b) emit(new OpenCurlyToken);
                else if(code == 0x7d) emit(new CloseCurlyToken);
                else if(digit(code)) switchto("number") && reconsume();
                else if(code == 0x55 || code == 0x75) {
                    if(next(1) == 0x2b && hexdigit(next(2))) consume() && switchto("unicode-range");
                    else switchto('ident') && reconsume();
                }
                else if(namestartchar(code)) switchto('ident') && reconsume();
                else if(eof()) { emit(new EOFToken); return tokens; }
                else emit(new DelimToken(code));
                break;

            case "double-quote-string":
                if(currtoken == undefined) create(new StringToken);

                if(code == 0x22) emit() && switchto("data");
                else if(eof()) parseerror() && emit() && switchto("data") && reconsume();
                else if(newline(code)) parseerror() && emit(new BadStringToken) && switchto("data") && reconsume();
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit(new BadStringToken) && switchto("data");
                    else if(newline(next())) consume();
                    else currtoken.append(consumeEscape());
                }
                else currtoken.append(code);
                break;

            case "single-quote-string":
                if(currtoken == undefined) create(new StringToken);

                if(code == 0x27) emit() && switchto("data");
                else if(eof()) parseerror() && emit() && switchto("data");
                else if(newline(code)) parseerror() && emit(new BadStringToken) && switchto("data") && reconsume();
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit(new BadStringToken) && switchto("data");
                    else if(newline(next())) consume();
                    else currtoken.append(consumeEscape());
                }
                else currtoken.append(code);
                break;

            case "hash":
                if(namechar(code)) create(new HashToken(code)) && switchto("hash-rest");
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit(new DelimToken(0x23)) && switchto("data") && reconsume();
                    else create(new HashToken(consumeEscape())) && switchto('hash-rest');
                }
                else emit(new DelimToken(0x23)) && switchto('data') && reconsume();
                break;

            case "hash-rest":
                if(namechar(code)) currtoken.append(code);
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit() && switchto("data") && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else emit() && switchto('data') && reconsume();
                break;

            case "comment":
                if(code == 0x2a) {
                    if(next() == 0x2f) consume() && switchto('data');
                    else donothing();
                }
                else if(eof()) parseerror() && switchto('data') && reconsume();
                else donothing();
                break;

            case "at-keyword":
                if(code == 0x2d) {
                    if(namestartchar(next())) create(new AtKeywordToken(0x2d)) && switchto('at-keyword-rest');
                    else if(next(1) == 0x5c && !badescape(next(2))) create(new AtKeywordtoken(0x2d)) && switchto('at-keyword-rest');
                    else parseerror() && emit(new DelimToken(0x40)) && switchto('data') && reconsume();
                }
                else if(namestartchar(code)) create(new AtKeywordToken(code)) && switchto('at-keyword-rest');
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit(new DelimToken(0x23)) && switchto("data") && reconsume();
                    else create(new AtKeywordToken(consumeEscape())) && switchto('at-keyword-rest');
                }
                else emit(new DelimToken(0x40)) && switchto('data') && reconsume();
                break;

            case "at-keyword-rest":
                if(namechar(code)) currtoken.append(code);
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit() && switchto("data") && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else emit() && switchto('data') && reconsume();
                break;

            case "ident":
                if(code == 0x2d) {
                    if(namestartchar(next())) create(new IdentifierToken(code)) && switchto('ident-rest');
                    else if(next(1) == 0x5c && !badescape(next(2))) create(new IdentifierToken(code)) && switchto('ident-rest');
                    else emit(new DelimToken(0x2d)) && switchto('data');
                }
                else if(namestartchar(code)) create(new IdentifierToken(code)) && switchto('ident-rest');
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && switchto("data") && reconsume();
                    else create(new IdentifierToken(consumeEscape())) && switchto('ident-rest');
                }
                else catchfire("Hit the generic 'else' clause in ident state.") && switchto('data') && reconsume();
                break;

            case "ident-rest":
                if(namechar(code)) currtoken.append(code);
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit() && switchto("data") && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else if(code == 0x28) {
                    if(currtoken.ASCIImatch('url')) switchto('url');
                    else emit(new FunctionToken(currtoken)) && switchto('data');
                }
                else if(whitespace(code) && options.transformFunctionWhitespace) switchto('transform-function-whitespace') && reconsume();
                else emit() && switchto('data') && reconsume();
                break;

            case "transform-function-whitespace":
                if(whitespace(next())) donothing();
                else if(code == 0x28) emit(new FunctionToken(currtoken)) && switchto('data');
                else emit() && switchto('data') && reconsume();
                break;

            case "number":
                create(new NumberToken());

                if(code == 0x2d) {
                    if(digit(next())) consume() && currtoken.append([0x2d,code]) && switchto('number-rest');
                    else if(next(1) == 0x2e && digit(next(2))) consume(2) && currtoken.append([0x2d,0x2e,code]) && switchto('number-fraction');
                    else switchto('data') && reconsume();
                }
                else if(code == 0x2b) {
                    if(digit(next())) consume() && currtoken.append([0x2b,code]) && switchto('number-rest');
                    else if(next(1) == 0x2e && digit(next(2))) consume(2) && currtoken.append([0x2b,0x2e,code]) && switchto('number-fraction');
                    else switchto('data') && reconsume();
                }
                else if(digit(code)) currtoken.append(code) && switchto('number-rest');
                else if(code == 0x2e) {
                    if(digit(next())) consume() && currtoken.append([0x2e,code]) && switchto('number-fraction');
                    else switchto('data') && reconsume();
                }
                else switchto('data') && reconsume();
                break;

            case "number-rest":
                if(digit(code)) currtoken.append(code);
                else if(code == 0x2e) {
                    if(digit(next())) consume() && currtoken.append([0x2e,code]) && switchto('number-fraction');
                    else emit() && switchto('data') && reconsume();
                }
                else if(code == 0x25) emit(new PercentageToken(currtoken)) && switchto('data');
                else if(code == 0x45 || code == 0x65) {
                    if(digit(next())) consume() && currtoken.append([0x25,code]) && switchto('sci-notation');
                    else if((next(1) == 0x2b || next(1) == 0x2d) && digit(next(2))) currtoken.append([0x25,next(1),next(2)]) && consume(2) && switchto('sci-notation');
                    else create(new DimensionToken(currtoken,code)) && switchto('dimension');
                }
                else if(code == 0x2d) {
                    if(namestartchar(next())) consume() && create(new DimensionToken(currtoken,[0x2d,code])) && switchto('dimension');
                    else if(next(1) == 0x5c && badescape(next(2))) parseerror() && emit() && switchto('data') && reconsume();
                    else if(next(1) == 0x5c) consume() && create(new DimensionToken(currtoken, [0x2d,consumeEscape()])) && switchto('dimension');
                    else emit() && switchto('data') && reconsume();
                }
                else if(namestartchar(code)) create(new DimensionToken(currtoken, code)) && switchto('dimension');
                else if(code == 0x5c) {
                    if(badescape(next)) parseerror() && emit() && switchto('data') && reconsume();
                    else create(new DimensionToken(currtoken,consumeEscape)) && switchto('dimension');
                }
                else emit() && switchto('data') && reconsume();
                break;

            case "number-fraction":
                currtoken.type = "number";

                if(digit(code)) currtoken.append(code);
                else if(code == 0x25) emit(new PercentageToken(currtoken)) && switchto('data');
                else if(code == 0x45 || code == 0x65) {
                    if(digit(next())) consume() && currtoken.append([0x65,code]) && switchto('sci-notation');
                    else if((next(1) == 0x2b || next(1) == 0x2d) && digit(next(2))) currtoken.append([0x65,next(1),next(2)]) && consume(2) && switchto('sci-notation');
                    else create(new DimensionToken(currtoken,code)) && switchto('dimension');
                }
                else if(code == 0x2d) {
                    if(namestartchar(next())) consume() && create(new DimensionToken(currtoken,[0x2d,code])) && switchto('dimension');
                    else if(next(1) == 0x5c && badescape(next(2))) parseerror() && emit() && switchto('data') && reconsume();
                    else if(next(1) == 0x5c) consume() && create(new DimensionToken(currtoken, [0x2d,consumeEscape()])) && switchto('dimension');
                    else emit() && switchto('data') && reconsume();
                }
                else if(namestartchar(code)) create(new DimensionToken(currtoken, code)) && switchto('dimension');
                else if(code == 0x5c) {
                    if(badescape(next)) parseerror() && emit() && switchto('data') && reconsume();
                    else create(new DimensionToken(currtoken,consumeEscape())) && switchto('dimension');
                }
                else emit() && switchto('data') && reconsume();
                break;

            case "dimension":
                if(namechar(code)) currtoken.append(code);
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && emit() && switchto('data') && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else emit() && switchto('data') && reconsume();
                break;

            case "sci-notation":
                currtoken.type = "number";

                if(digit(code)) currtoken.append(code);
                else emit() && switchto('data') && reconsume();
                break;

            case "url":
                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(code == 0x22) switchto('url-double-quote');
                else if(code == 0x27) switchto('url-single-quote');
                else if(code == 0x29) emit(new URLToken) && switchto('data');
                else if(whitespace(code)) donothing();
                else switchto('url-unquoted') && reconsume();
                break;

            case "url-double-quote":
                if(! (currtoken instanceof URLToken)) create(new URLToken);

                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(code == 0x22) switchto('url-end');
                else if(newline(code)) parseerror() && switchto('bad-url');
                else if(code == 0x5c) {
                    if(newline(next())) consume();
                    else if(badescape(next())) parseerror() && emit(new BadURLToken) && switchto('data') && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else currtoken.append(code);
                break;

            case "url-single-quote":
                if(! (currtoken instanceof URLToken)) create(new URLToken);

                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(code == 0x27) switchto('url-end');
                else if(newline(code)) parseerror() && switchto('bad-url');
                else if(code == 0x5c) {
                    if(newline(next())) consume();
                    else if(badescape(next())) parseerror() && emit(new BadURLToken) && switchto('data') && reconsume();
                    else currtoken.append(consumeEscape());
                }
                else currtoken.append(code);
                break;

            case "url-end":
                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(whitespace(code)) donothing();
                else if(code == 0x29) emit() && switchto('data');
                else parseerror() && switchto('bad-url') && reconsume();
                break;

            case "url-unquoted":
                if(! (currtoken instanceof URLToken)) create(new URLToken);

                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(whitespace(code)) switchto('url-end');
                else if(code == 0x29) emit() && switchto('data');
                else if(code == 0x22 || code == 0x27 || code == 0x28 || nonprintable(code)) parseerror() && switchto('bad-url');
                else if(code == 0x5c) {
                    if(badescape(next())) parseerror() && switchto('bad-url');
                    else currtoken.append(consumeEscape());
                }
                else currtoken.append(code);
                break;

            case "bad-url":
                if(eof()) parseerror() && emit(new BadURLToken) && switchto('data');
                else if(code == 0x29) emit(new BadURLToken) && switchto('data');
                else if(code == 0x5c) {
                    if(badescape(next())) donothing();
                    else consumeEscape();
                }
                else donothing();
                break;

            case "unicode-range":
                // We already know that the current code is a hexdigit.

                var start = [code], end = [code];

                for(var total = 1; total < 6; total++) {
                    if(hexdigit(next())) {
                        consume();
                        start.push(code);
                        end.push(code);
                    }
                    else break;
                }

                if(next() == 0x3f) {
                    for(;total < 6; total++) {
                        if(next() == 0x3f) {
                            consume();
                            start.push("0".charCodeAt(0));
                            end.push("f".charCodeAt(0));
                        }
                        else break;
                    }
                    emit(new UnicodeRangeToken(start,end)) && switchto('data');
                }
                else if(next(1) == 0x2d && hexdigit(next(2))) {
                    consume();
                    consume();
                    end = [code];
                    for(var total = 1; total < 6; total++) {
                        if(hexdigit(next())) {
                            consume();
                            end.push(code);
                        }
                        else break;
                    }
                    emit(new UnicodeRangeToken(start,end)) && switchto('data');
                }
                else emit(new UnicodeRangeToken(start)) && switchto('data');
                break;

            default:
                catchfire("Unknown state '" + state + "'");
            }
        }
    }

    function stringFromCodeArray(arr) {
        return String.fromCharCode.apply(null,arr.filter(function(e){return e;}));
    }

    var CSSParserToken = cssSyntax.CSSParserToken = function CSSParserToken(options) { return this; }
    CSSParserToken.prototype.finish = function() { return this; }
    CSSParserToken.prototype.toString = function() { return this.tokenType; }
    CSSParserToken.prototype.toJSON = function() { return this.toString(); }
    CSSParserToken.prototype.toCSSString = function() { return this.toString(); }

    var BadStringToken = cssSyntax.BadStringToken = function BadStringToken() { return this; }
    BadStringToken.prototype = new CSSParserToken;
    BadStringToken.prototype.tokenType = "BADSTRING";
    BadStringToken.prototype.toCSSString = function() { return "'"; }

    var BadURLToken = cssSyntax.BadURLToken = function BadURLToken() { return this; }
    BadURLToken.prototype = new CSSParserToken;
    BadURLToken.prototype.tokenType = "BADURL";
    BadURLToken.prototype.toCSSString = function() { return "url("; }

    var WhitespaceToken = cssSyntax.WhitespaceToken = function WhitespaceToken() { return this; }
    WhitespaceToken.prototype = new CSSParserToken;
    WhitespaceToken.prototype.tokenType = "WHITESPACE";
    WhitespaceToken.prototype.toString = function() { return "WS"; }
    WhitespaceToken.prototype.toCSSString = function() { return " "; }

    var CDOToken = cssSyntax.CDOToken = function CDOToken() { return this; }
    CDOToken.prototype = new CSSParserToken;
    CDOToken.prototype.tokenType = "CDO";
    CDOToken.prototype.toCSSString = function() { return "<!--"; }

    var CDCToken = cssSyntax.CDCToken = function CDCToken() { return this; }
    CDCToken.prototype = new CSSParserToken;
    CDCToken.prototype.tokenType = "CDC";
    CDOToken.prototype.toCSSString = function() { return "-->"; }

    var ColonToken = cssSyntax.ColonToken = function ColonToken() { return this; }
    ColonToken.prototype = new CSSParserToken;
    ColonToken.prototype.tokenType = ":";

    var SemicolonToken = cssSyntax.SemicolonToken = function SemicolonToken() { return this; }
    SemicolonToken.prototype = new CSSParserToken;
    SemicolonToken.prototype.tokenType = ";";

    var OpenCurlyToken = cssSyntax.OpenCurlyToken = function OpenCurlyToken() { return this; }
    OpenCurlyToken.prototype = new CSSParserToken;
    OpenCurlyToken.prototype.tokenType = "{";

    var CloseCurlyToken = cssSyntax.CloseCurlyToken = function CloseCurlyToken() { return this; }
    CloseCurlyToken.prototype = new CSSParserToken;
    CloseCurlyToken.prototype.tokenType = "}";

    var OpenSquareToken = cssSyntax.OpenSquareToken = function OpenSquareToken() { return this; }
    OpenSquareToken.prototype = new CSSParserToken;
    OpenSquareToken.prototype.tokenType = "[";

    var CloseSquareToken = cssSyntax.CloseSquareToken = function CloseSquareToken() { return this; }
    CloseSquareToken.prototype = new CSSParserToken;
    CloseSquareToken.prototype.tokenType = "]";

    var OpenParenToken = cssSyntax.OpenParenToken = function OpenParenToken() { return this; }
    OpenParenToken.prototype = new CSSParserToken;
    OpenParenToken.prototype.tokenType = "(";

    var CloseParenToken = cssSyntax.CloseParenToken = function CloseParenToken() { return this; }
    CloseParenToken.prototype = new CSSParserToken;
    CloseParenToken.prototype.tokenType = ")";

    var EOFToken = cssSyntax.EOFToken = function EOFToken() { return this; }
    EOFToken.prototype = new CSSParserToken;
    EOFToken.prototype.tokenType = "EOF";
    EOFToken.prototype.toCSSString = function() { return ""; }

    var DelimToken = cssSyntax.DelimToken = function DelimToken(code) {
        this.value = String.fromCharCode(code);
        return this;
    }
    DelimToken.prototype = new CSSParserToken;
    DelimToken.prototype.tokenType = "DELIM";
    DelimToken.prototype.toString = function() { return "DELIM("+this.value+")"; }
    DelimToken.prototype.toCSSString = function() { return this.value; }

    var StringValuedToken = cssSyntax.StringValuedToken = function StringValuedToken() { return this; }
    StringValuedToken.prototype = new CSSParserToken;
    StringValuedToken.prototype.append = function(val) {
        if(val instanceof Array) {
            for(var i = 0; i < val.length; i++) {
                this.value.push(val[i]);
            }
        } else {
            this.value.push(val);
        }
        return true;
    }
    StringValuedToken.prototype.finish = function() {
        this.value = this.valueAsString();
        return this;
    }
    StringValuedToken.prototype.ASCIImatch = function(str) {
        return this.valueAsString().toLowerCase() == str.toLowerCase();
    }
    StringValuedToken.prototype.valueAsString = function() {
        if(typeof this.value == 'string') return this.value;
        return stringFromCodeArray(this.value);
    }
    StringValuedToken.prototype.valueAsCodes = function() {
        if(typeof this.value == 'string') {
            var ret = [];
            for(var i = 0; i < this.value.length; i++)
                ret.push(this.value.charCodeAt(i));
            return ret;
        }
        return this.value.filter(function(e){return e;});
    }

    var IdentifierToken = cssSyntax.IdentifierToken = function IdentifierToken(val) {
        this.value = new TokenList();
        this.append(val);
    }
    IdentifierToken.prototype = new StringValuedToken;
    IdentifierToken.prototype.tokenType = "IDENT";
    IdentifierToken.prototype.toString = function() { return "IDENT("+this.value+")"; }
    IdentifierToken.prototype.toCSSString = function() { return this.value; }

    var FunctionToken = cssSyntax.FunctionToken = function FunctionToken(val) {
        // These are always constructed by passing an IdentifierToken
        this.value = val.finish().value;
    }
    FunctionToken.prototype = new StringValuedToken;
    FunctionToken.prototype.tokenType = "FUNCTION";
    FunctionToken.prototype.toString = function() { return "FUNCTION("+this.value+")"; }
    FunctionToken.prototype.toCSSString = function() { return this.value+"("; }

    var AtKeywordToken = cssSyntax.AtKeywordToken = function AtKeywordToken(val) {
        this.value = new TokenList();
        this.append(val);
    }
    AtKeywordToken.prototype = new StringValuedToken;
    AtKeywordToken.prototype.tokenType = "AT-KEYWORD";
    AtKeywordToken.prototype.toString = function() { return "AT("+this.value+")"; }
    AtKeywordToken.prototype.toCSSString = function() { return "@"+this.value; }

    var HashToken = cssSyntax.HashToken = function HashToken(val) {
        this.value = new TokenList();
        this.append(val);
    }
    HashToken.prototype = new StringValuedToken;
    HashToken.prototype.tokenType = "HASH";
    HashToken.prototype.toString = function() { return "HASH("+this.value+")"; }
    HashToken.prototype.toCSSString = function() { return "#"+this.value; }

    var StringToken = cssSyntax.StringToken = function StringToken(val) {
        this.value = new TokenList();
        this.append(val);
    }
    StringToken.prototype = new StringValuedToken;
    StringToken.prototype.tokenType = "STRING";
    StringToken.prototype.toString = function() { return '"'+this.value+'"'; }
    StringToken.prototype.toCSSString = function() { return '"'+this.value.replace(/"/g,'\\"')+'"'; } // TODO: improve string serialization?

    var URLToken = cssSyntax.URLToken = function URLToken(val) {
        this.value = new TokenList();
        this.append(val);
    }
    URLToken.prototype = new StringValuedToken;
    URLToken.prototype.tokenType = "URL";
    URLToken.prototype.toString = function() { return "URL("+this.value+")"; }
    URLToken.prototype.toCSSString = function() { return 'url("'+this.value.replace(/"/g,'\\"')+'")'; } // TODO: improve string serialization?; }

    var NumberToken = cssSyntax.NumberToken = function NumberToken(val) {
        this.value = new TokenList();
        this.append(val);
        this.type = "integer";
    }
    NumberToken.prototype = new StringValuedToken;
    NumberToken.prototype.tokenType = "NUMBER";
    NumberToken.prototype.toString = function() {
        if(this.type == "integer")
            return "INT("+this.value+")";
        return "NUMBER("+this.value+")";
    }
    NumberToken.prototype.finish = function() {
        this.repr = this.valueAsString();
        this.value = this.repr * 1;
        if(Math.abs(this.value) % 1 != 0) this.type = "number";
        return this;
    }
    NumberToken.prototype.toCSSString = function() { return ""+this.value; }


    var PercentageToken = cssSyntax.PercentageToken = function PercentageToken(val) {
        // These are always created by passing a NumberToken as val
        val.finish();
        this.value = val.value;
        this.repr = val.repr;
    }
    PercentageToken.prototype = new CSSParserToken;
    PercentageToken.prototype.tokenType = "PERCENTAGE";
    PercentageToken.prototype.toString = function() { return "PERCENTAGE("+this.value+")"; }
    PercentageToken.prototype.toCSSString = function() { return this.value+"%"; }

    var DimensionToken = cssSyntax.DimensionToken = function DimensionToken(val,unit) {
        // These are always created by passing a NumberToken as the val
        val.finish();
        this.num = val.value;
        this.unit = [];
        this.repr = val.repr;
        this.append(unit);
    }
    DimensionToken.prototype = new CSSParserToken;
    DimensionToken.prototype.tokenType = "DIMENSION";
    DimensionToken.prototype.toString = function() { return "DIM("+this.num+","+this.unit+")"; }
    DimensionToken.prototype.toCSSString = function() { return this.num+this.unit; }
    DimensionToken.prototype.append = function(val) {
        if(val instanceof Array) {
            for(var i = 0; i < val.length; i++) {
                this.unit.push(val[i]);
            }
        } else {
            this.unit.push(val);
        }
        return true;
    }
    DimensionToken.prototype.finish = function() {
        this.unit = stringFromCodeArray(this.unit);
        this.repr += this.unit;
        return this;
    }

    var UnicodeRangeToken = cssSyntax.UnicodeRangeToken = function UnicodeRangeToken(start,end) {
        // start and end are array of char codes, completely finished
        start = parseInt(stringFromCodeArray(start),16);
        if(end === undefined) end = start + 1;
        else end = parseInt(stringFromCodeArray(end),16);

        if(start > maximumallowedcodepoint) end = start;
        if(end < start) end = start;
        if(end > maximumallowedcodepoint) end = maximumallowedcodepoint;

        this.start = start;
        this.end = end;
        return this;
    }
    UnicodeRangeToken.prototype = new CSSParserToken;
    UnicodeRangeToken.prototype.tokenType = "UNICODE-RANGE";
    UnicodeRangeToken.prototype.toCSSString = function() { return "¿"; }
    UnicodeRangeToken.prototype.toString = function() {
        if(this.start+1 == this.end)
            return "UNICODE-RANGE("+this.start.toString(16).toUpperCase()+")";
        if(this.start < this.end)
            return "UNICODE-RANGE("+this.start.toString(16).toUpperCase()+"-"+this.end.toString(16).toUpperCase()+")";
        return "UNICODE-RANGE()";
    }
    UnicodeRangeToken.prototype.contains = function(code) {
        return code >= this.start && code < this.end;
    }


    // Exportation.
    cssSyntax.tokenize = tokenize;

}());

//
// css parser
//
(function() {

    var TokenList = cssSyntax.TokenList;
    function parse(tokens) {
        // FREMY's ADDITION:
        // You can give a string to parse, it will tokenize it for you
        // { this break module boundaries, but who cares? }
        if(typeof(tokens)=="string") {
            tokens = cssSyntax.tokenize(tokens);
        }

        var mode = 'top-level';
        var i = -1;
        var token;

        var stylesheet = new Stylesheet;
        var stack = [stylesheet];
        var rule = stack[0];

        var consume = function(advance) {
            if(advance === undefined) advance = 1;
            i += advance;
            if(i < tokens.length)
                token = tokens[i];
            else
                token = new EOFToken;
            return true;
        };
        var reprocess = function() {
            i--;
            return true;
        }
        var next = function() {
            return tokens[i+1];
        };
        var switchto = function(newmode) {
            if(newmode === undefined) {
                if(rule.fillType !== '')
                    mode = rule.fillType;
                else if(rule.type == 'STYLESHEET')
                    mode = 'top-level'
                else { console.log("Unknown rule-type while switching to current rule's content mode: ",rule); mode = ''; }
            } else {
                mode = newmode;
            }
            return true;
        }
        var push = function(newRule) {
            rule = newRule;
            stack.push(rule);
            return true;
        }
        var parseerror = function(msg) {
            console.log("Parse error at token " + i + ": " + token + ".\n" + msg);
            console.log("prev token is: " + tokens[i-2] + "  |  next token is: " + tokens[i+1]);
            return true;
        }
        var pop = function() {
            var oldrule = stack.pop();
            rule = stack[stack.length - 1];
            rule.append(oldrule);
            return true;
        }
        var discard = function() {
            stack.pop();
            rule = stack[stack.length - 1];
            return true;
        }
        var finish = function() {
            while(stack.length > 1) {
                pop();
            }
        }

        for(;;) {
            consume();

            switch(mode) {
            case "top-level":
                switch(token.tokenType) {
                case "CDO":
                case "CDC":
                case "WHITESPACE": break;
                case "AT-KEYWORD": push(new AtRule(token.value)) && switchto('at-rule'); break;
                case "{": parseerror("Attempt to open a curly-block at top-level.") && consumeAPrimitive(); break;
                case "EOF": finish(); return stylesheet;
                default: push(new StyleRule) && switchto('selector') && reprocess();
                }
                break;

            case "at-rule":
                switch(token.tokenType) {
                case ";": pop() && switchto(); break;
                case "{":
                    if(rule.fillType !== '') switchto(rule.fillType);
                    else parseerror("Attempt to open a curly-block in a statement-type at-rule.") && discard() && switchto('next-block') && reprocess();
                    break;
                case "EOF": finish(); return stylesheet;
                default: rule.appendPrelude(consumeAPrimitive());
                }
                break;

            case "rule":
                switch(token.tokenType) {
                case "WHITESPACE": break;
                case "}": pop() && switchto(); break;
                case "AT-KEYWORD": push(new AtRule(token.value)) && switchto('at-rule'); break;
                case "EOF": finish(); return stylesheet;
                default: push(new StyleRule) && switchto('selector') && reprocess();
                }
                break;

            case "selector":
                switch(token.tokenType) {
                case "{": switchto('declaration'); break;
                case "EOF": discard() && finish(); return stylesheet;
                default: rule.appendSelector(consumeAPrimitive());
                }
                break;

            case "declaration":
                switch(token.tokenType) {
                case "WHITESPACE":
                case ";": break;
                case "}": pop() && switchto(); break;
                case "AT-RULE": push(new AtRule(token.value)) && switchto('at-rule'); break;
                case "IDENT": push(new Declaration(token.value)) && switchto('after-declaration-name'); break;
                case "EOF": finish(); return stylesheet;
                default: parseerror() && discard() && switchto('next-declaration');
                }
                break;

            case "after-declaration-name":
                switch(token.tokenType) {
                case "WHITESPACE": break;
                case ":": switchto('declaration-value'); break;
                case ";": parseerror("Incomplete declaration - semicolon after property name.") && discard() && switchto(); break;
                case "EOF": discard() && finish(); return stylesheet;
                default: parseerror("Invalid declaration - additional token after property name") && discard() && switchto('next-declaration');
                }
                break;

            case "declaration-value":
                switch(token.tokenType) {
                case "DELIM":
                    if(token.value == "!" && next().tokenType == 'IDENT' && next().value.toLowerCase() == "important") {
                        consume();
                        rule.important = true;
                        switchto('declaration-end');
                    } else {
                        rule.append(token);
                    }
                    break;
                case ";": pop() && switchto(); break;
                case "}": pop() && pop() && switchto(); break;
                case "EOF": finish(); return stylesheet;
                default: rule.append(consumeAPrimitive());
                }
                break;

            case "declaration-end":
                switch(token.tokenType) {
                case "WHITESPACE": break;
                case ";": pop() && switchto(); break;
                case "}": pop() && pop() && switchto(); break;
                case "EOF": finish(); return stylesheet;
                default: parseerror("Invalid declaration - additional token after !important.") && discard() && switchto('next-declaration');
                }
                break;

            case "next-block":
                switch(token.tokenType) {
                case "{": consumeAPrimitive() && switchto(); break;
                case "EOF": finish(); return stylesheet;
                default: consumeAPrimitive(); break;
                }
                break;

            case "next-declaration":
                switch(token.tokenType) {
                case ";": switchto('declaration'); break;
                case "}": switchto('declaration') && reprocess(); break;
                case "EOF": finish(); return stylesheet;
                default: consumeAPrimitive(); break;
                }
                break;

            default:
                // If you hit this, it's because one of the switchto() calls is typo'd.
                console.log('Unknown parsing mode: ' + mode);
                return;
            }
        }

        function consumeAPrimitive() {
            switch(token.tokenType) {
            case "(":
            case "[":
            case "{": return consumeASimpleBlock();
            case "FUNCTION": return consumeAFunc();
            default: return token;
            }
        }

        function consumeASimpleBlock() {
            var endingTokenType = {"(":")", "[":"]", "{":"}"}[token.tokenType];
            var block = new SimpleBlock(token.tokenType);

            for(;;) {
                consume();
                switch(token.tokenType) {
                case "EOF":
                case endingTokenType: return block;
                default: block.append(consumeAPrimitive());
                }
            }
        }

        function consumeAFunc() {
            var func = new Func(token.value);
            var arg = new FuncArg();

            for(;;) {
                consume();
                switch(token.tokenType) {
                case "EOF":
                case ")": func.append(arg); return func;
                case "DELIM":
                    if(token.value == ",") {
                        func.append(arg);
                        arg = new FuncArg();
                    } else {
                        arg.append(token);
                    }
                    break;
                default: arg.append(consumeAPrimitive());
                }
            }
        }
    }

    var CSSParserRule = cssSyntax.CSSParserRule = function CSSParserRule() { return this; }
    CSSParserRule.prototype.fillType = '';
    CSSParserRule.prototype.toString = function(indent) {
        return JSON.stringify(this.toJSON(),null,indent);
    }
    CSSParserRule.prototype.append = function(val) {
        this.value.push(val);
        return this;
    }

    var Stylesheet = cssSyntax.Stylesheet = function Stylesheet() {
        this.value = new TokenList();
        return this;
    }
    Stylesheet.prototype = new CSSParserRule;
    Stylesheet.prototype.type = "STYLESHEET";
    Stylesheet.prototype.toJSON = function() {
        return {type:'stylesheet', value: this.value.map(function(e){return e.toJSON();})};
    }
    Stylesheet.prototype.toCSSString = function() { return this.value.toCSSString("\n"); }

    var AtRule = cssSyntax.AtRule = function AtRule(name) {
        this.name = name;
        this.prelude = new TokenList();
        this.value = new TokenList();
        if(name in AtRule.registry)
            this.fillType = AtRule.registry[name];
        return this;
    }
    AtRule.prototype = new CSSParserRule;
    AtRule.prototype.type = "AT-RULE";
    AtRule.prototype.appendPrelude = function(val) {
        this.prelude.push(val);
        return this;
    }
    AtRule.prototype.toJSON = function() {
        return {type:'at', name:this.name, prelude:this.prelude.map(function(e){return e.toJSON();}), value:this.value.map(function(e){return e.toJSON();})};
    }
    AtRule.prototype.toCSSString = function() {
        if(this.fillType != '') {
            return "@" + this.name + " " + this.prelude.toCSSString() + '{' + this.value.toCSSString() + '} ';
        } else {
            return "@" + this.name + " " + this.prelude.toCSSString() + '; ';
        }
    }
    AtRule.registry = {
        'import': '',
        'media': 'rule',
        'font-face': 'declaration',
        'page': 'declaration',
        'keyframes': 'rule',
        'namespace': '',
        'counter-style': 'declaration',
        'supports': 'rule',
        'document': 'rule',
        'font-feature-values': 'declaration',
        'viewport': '',
        'region-style': 'rule'
    };

    var StyleRule = cssSyntax.StyleRule = function StyleRule() {
        this.selector = new TokenList();
        this.value = new TokenList();
        return this;
    }
    StyleRule.prototype = new CSSParserRule;
    StyleRule.prototype.type = "STYLE-RULE";
    StyleRule.prototype.fillType = 'declaration';
    StyleRule.prototype.appendSelector = function(val) {
        this.selector.push(val);
        return this;
    }
    StyleRule.prototype.toJSON = function() {
        return {type:'selector', selector:this.selector.map(function(e){return e.toJSON();}), value:this.value.map(function(e){return e.toJSON();})};
    }
    StyleRule.prototype.toCSSString = function() { return this.selector.toCSSString() + '{' + this.value.toCSSString() + '} '; }


    var Declaration = cssSyntax.Declaration = function Declaration(name) {
        this.name = name;
        this.value = new TokenList();
        return this;
    }
    Declaration.prototype = new CSSParserRule;
    Declaration.prototype.type = "DECLARATION";
    Declaration.prototype.toJSON = function() {
        return {type:'declaration', name:this.name, value:this.value.map(function(e){return e.toJSON();})};
    }
    Declaration.prototype.toCSSString = function() { return this.name + ':' + this.value.toCSSString() + '; '; }

    var SimpleBlock = cssSyntax.SimpleBlock = function SimpleBlock(type) {
        this.name = type;
        this.value = new TokenList();
        return this;
    }
    SimpleBlock.prototype = new CSSParserRule;
    SimpleBlock.prototype.type = "BLOCK";
    SimpleBlock.prototype.toJSON = function() {
        return {type:'block', name:this.name, value:this.value.map(function(e){return e.toJSON();})};
    }
    SimpleBlock.prototype.toCSSString = function() {
        switch(this.name) {
            case "(":
                return "(" + this.value.toCSSString() + ")";

            case "[":
                return "[" + this.value.toCSSString() + "]";

            case "{":
                return "{" + this.value.toCSSString() + "}";

            default: //best guess
                return this.name + this.value.toCSSString() + this.name;
        }
    }

    var Func = cssSyntax.Func = function Func(name) {
        this.name = name;
        this.value = new TokenList();
        return this;
    }
    Func.prototype = new CSSParserRule;
    Func.prototype.type = "FUNCTION";
    Func.prototype.toJSON = function() {
        return {type:'func', name:this.name, value:this.value.map(function(e){return e.toJSON();})};
    }
    Func.prototype.toCSSString = function() {
        return this.name+'('+this.value.toCSSString().slice(0,-2)+')';
    }

    var FuncArg = cssSyntax.FuncArg = function FuncArg() {
        this.value = new TokenList();
        return this;
    }
    FuncArg.prototype = new CSSParserRule;
    FuncArg.prototype.type = "FUNCTION-ARG";
    FuncArg.prototype.toJSON = function() {
        return this.value.map(function(e){return e.toJSON();});
    }
    FuncArg.prototype.toCSSString = function() {
        return this.value.toCSSString()+', ';
    }

    // Exportation.
    cssSyntax.parse = parse;

}())

//
// note: depends on cssSyntax and cssSelectors
//

var cssCascade = {

    //
    // returns the priority of a unique selector (NO COMMA!)
    // { the return value is an integer, with the same formula as webkit }
    //
    computeSelectorPriorityOf: function computeSelectorPriorityOf(selector) {
        if(typeof selector == "string") selector = cssSyntax.parse(selector+"{}").value[0].selector;

        var numberOfIDs = 0;
        var numberOfClasses = 0;
        var numberOfTags = 0;

        // TODO: improve this parser, or find one on the web
        for(var i = 0; i < selector.length; i++) {

            if(selector[i] instanceof cssSyntax.IdentifierToken) {
                numberOfTags++;

            } else if(selector[i] instanceof cssSyntax.DelimToken) {
                if(selector[i].value==".") {
                    numberOfClasses++; i++;
                }

            } else if(selector[i] instanceof cssSyntax.ColonToken) {
                if(selector[++i] instanceof cssSyntax.ColonToken) {
                    numberOfTags++; i++;

                } else if((selector[i] instanceof cssSyntax.Func) && (/^(not|matches)$/i).test(selector[i].name)) {
                    var nestedPriority = this.computeSelectorPriorityOf(selector[i].value[0].value);
                    numberOfTags += nestedPriority % 256; nestedPriority /= 256;
                    numberOfClasses += nestedPriority % 256; nestedPriority /= 256;
                    numberOfIDs += nestedPriority;

                } else {
                    numberOfClasses++;

                }

            } else if(selector[i] instanceof cssSyntax.SimpleBlock) {
                if(selector[i].name=="[") {
                    numberOfClasses++;
                }

            } else if(selector[i] instanceof cssSyntax.HashToken) {
                numberOfIDs++;

            } else {
                // TODO: stop ignoring unknown symbols?

            }

        }

        if(numberOfIDs>255) numberOfIds=255;
        if(numberOfClasses>255) numberOfClasses=255;
        if(numberOfTags>255) numberOfTags=255;

        return ((numberOfIDs*256)+numberOfClasses)*256+numberOfTags;

    },

    //
    // returns an array of the css rules matching an element
    //
    findAllMatchingRules: function findAllMatchingRules(element) {

        // let's look for new results if needed...
        var results = [];

        // walk the whole stylesheet...
        var visit = function(rules) {
            for(var r = rules.length; r--; ) {
                var rule = rules[r];

                // media queries hook
                if(rule.disabled) continue;

                if(rule instanceof cssSyntax.StyleRule) {

                    // consider each selector independtly
                    var subrules = rule.subRules || cssCascade.splitRule(rule);
                    for(var sr = subrules.length; sr--; ) {

                        var isMatching = false;
                        var selector = subrules[sr].selector.toCSSString();
                        try {
							if(element.matches) isMatching=element.matches(selector)
                            else if(element.matchesSelector) isMatching=element.matchesSelector(selector)
                            else if(element.oMatchesSelector) isMatching=element.oMatchesSelector(selector)
                            else if(element.msMatchesSelector) isMatching=element.msMatchesSelector(selector)
                            else if(element.mozMatchesSelector) isMatching=element.mozMatchesSelector(selector)
                            else if(element.webkitMatchesSelector) isMatching=element.webkitMatchesSelector(selector)
                            else { throw new Error("wft u no element.matchesSelector?") }
                        } catch(ex) { cssConsole.warn("Invalid selector " + selector); }

                        if(isMatching) { results.push(subrules[sr]); }

                    }

                } else if(rule instanceof cssSyntax.AtRule && rule.name=="media") {

                    visit(rule.value);

                }

            }
        }

        for(var s=cssCascade.stylesheets.length; s--; ) {
            var rules = cssCascade.stylesheets[s];
            visit(rules);
        }

        return results;
    },

    //
    // returns an array of the css rules matching a pseudo-element
    //
    findAllMatchingRulesWithPseudo: function findAllMatchingRules(element,pseudo) {

        // let's look for new results if needed...
        var results = [];

        // walk the whole stylesheet...
        var visit = function(rules) {
            for(var r = rules.length; r--; ) {
                var rule = rules[r];

                // media queries hook
                if(rule.disabled) continue;

                if(rule instanceof cssSyntax.StyleRule) {

                    // consider each selector independtly
                    var subrules = rule.subRules || cssCascade.splitRule(rule);
                    for(var sr = subrules.length; sr--; ) {

                        // WE ONLY ACCEPT SELECTORS ENDING WITH THE PSEUDO
                        var selector = subrules[sr].selector.toCSSString().trim().replace(/\/\*\*\//,'');
                        var newLength = selector.length-pseudo.length-1;
                        if(newLength<=0) continue;

                        if(selector.lastIndexOf('::'+pseudo)==newLength-1) {
                            selector = selector.substr(0,newLength-1);
                        } else if(selector.lastIndexOf(':'+pseudo)==newLength) {
                            selector = selector.substr(0,newLength);
                        } else {
                            continue;
                        }

                        // look if the selector matches
                        var isMatching = false;
                        try {
							if(element.matches) isMatching=element.matches(selector)
                            else if(element.matchesSelector) isMatching=element.matchesSelector(selector)
                            else if(element.oMatchesSelector) isMatching=element.oMatchesSelector(selector)
                            else if(element.msMatchesSelector) isMatching=element.msMatchesSelector(selector)
                            else if(element.mozMatchesSelector) isMatching=element.mozMatchesSelector(selector)
                            else if(element.webkitMatchesSelector) isMatching=element.webkitMatchesSelector(selector)
                            else { throw new Error("wft u no element.matchesSelector?") }
                        } catch(ex) { debugger; setImmediate(function() { throw ex; }) }

                        if(isMatching) { results.push(subrules[sr]); }

                    }

                } else if(rule instanceof cssSyntax.AtRule && rule.name=="media") {

                    visit(rule.value);

                }

            }
        }

        for(var s=cssCascade.stylesheets.length; s--; ) {
            var rules = cssCascade.stylesheets[s];
            visit(rules);
        }

        return results;
    },

    //
    // a list of all properties supported by the current browser
    //
    allCSSProperties: null,
    getAllCSSProperties: function getAllCSSProperties() {

        if(this.allCSSProperties) return this.allCSSProperties;

        // get all claimed properties
        var s = getComputedStyle(document.documentElement); var ps = new Array(s.length);
        for(var i=s.length; i--; ) {
            ps[i] = s[i];
        }

        // FIX A BUG WHERE WEBKIT DOESN'T REPORT ALL PROPERTIES
        if(ps.indexOf('content')==-1) {ps.push('content');}
        if(ps.indexOf('counter-reset')==-1) {

            ps.push('counter-reset');
            ps.push('counter-increment');

            // FIX A BUG WHERE WEBKIT RETURNS SHIT FOR THE COMPUTED VALUE OF COUNTER-RESET
            cssCascade.computationUnsafeProperties['counter-reset']=true;

        }

        // save in a cache for faster access the next times
        return this.allCSSProperties = ps;

    },

    //
    // those properties are not safe for computation->specified round-tripping
    //
    computationUnsafeProperties: {
        "bottom": false,
        "direction": false,
        "display": false,
        "font-size": false,
        "height":false,
        "left": false,
        "line-height": false,
        "max-height": false,
        "max-width": false,
        "min-height": false,
        "min-width": false,
        "right": false,
        "text-align": false,
        "text-align-last": false,
        "top": false,
        "width": false,
    },

    //
    // a list of property we should inherit...
    //
    inheritingProperties: {
        "border-collapse": false,
        "border-spacing": false,
        "caption-side": false,
        "color": false,
        "cursor": false,
        "direction": false,
        "empty-cells": false,
        "font-family": false,
        "font-size": false,
        "font-style": false,
        "font-variant": false,
        "font-weight": false,
        "font": false,
        "letter-spacing": false,
        "line-height": false,
        "list-style-image": false,
        "list-style-position": false,
        "list-style-type": false,
        "list-style": false,
        "orphans": false,
        "quotes": false,
        "text-align": false,
        "text-indent": false,
        "text-transform": false,
        "visibility": false,
        "white-space": false,
        "widows": false,
        "word-break": false,
        "word-spacing": false,
        "word-wrap": false,
    },

    //
    // returns the default style for a tag
    //
    defaultStylesForTag: Object.create ? Object.create(null) : {},
    getDefaultStyleForTag: function getDefaultStyleForTag(tagName) {

        // get result from cache
        var result = cssRegionsHelpers[tagName];
        if(result) return result;

        // create dummy virtual element
        var element = document.createElement(tagName);
        var style = cssRegionsHelpers[tagName] = getComputedStyle(element);
        if(style.display) return style;

        // webkit fix: insert the dummy element anywhere (head -> display:none)
        document.head.insertBefore(element, document.head.firstChild);
        return style;
    },

    //
    // returns the specified style of an element.
    // REMARK: may or may not unwrap "inherit" and "initial" depending on implementation
    // REMARK: giving "matchedRules" as a parameter allow you to mutualize the "findAllMatching" rules calls
    // REMARK: giving "stringOnly" as a "true" parameter allows to return a fake token list which returns the good string value
    //
    getSpecifiedStyle: function getSpecifiedStyle(element, cssPropertyName, matchedRules, stringOnly) {

        // hook for css regions
        var fragmentSource;
        if(fragmentSource=element.getAttribute('data-css-regions-fragment-of')) {
            fragmentSource = document.querySelector('[data-css-regions-fragment-source="'+fragmentSource+'"]');
            if(fragmentSource) return cssCascade.getSpecifiedStyle(fragmentSource, cssPropertyName);
        }

        // give IE a thumbs up for this!
        if(element.currentStyle && !window.opera) {

            // ask IE to manage the style himself...
            var bestValue = element.myStyle[cssPropertyName] || element.currentStyle[cssPropertyName];

            // return a parsed representation of the value
            return cssSyntax.parseCSSValue(bestValue, stringOnly);

        } else {

            // TODO: support the "initial" and "inherit" things?

            // first, let's try inline style as it's fast and generally accurate
            // TODO: what if important rules override that?
            try {
                if(bestValue = element.style.getPropertyValue(cssPropertyName) || element.myStyle[cssPropertyName]) {
                    return cssSyntax.parseCSSValue(bestValue, stringOnly);
                }
            } catch(ex) {}

            // find all relevant style rules
            var isBestImportant=false; var bestPriority = 0; var bestValue = new cssSyntax.TokenList();
            var rules = matchedRules || (
                cssPropertyName in cssCascade.monitoredProperties
                ? element.myMatchedRules || []
                : cssCascade.findAllMatchingRules(element)
            );

            var visit = function(rules) {

                for(var i=rules.length; i--; ) {

                    // media queries hook
                    if(rules[i].disabled) continue;

                    // find a relevant declaration
                    if(rules[i] instanceof cssSyntax.StyleRule) {
                        var decls = rules[i].value;
                        for(var j=decls.length-1; j>=0; j--) {
                            if(decls[j].type=="DECLARATION") {
                                if(decls[j].name==cssPropertyName) {
                                    // only works if selectors containing a "," are deduplicated
                                    var currentPriority = cssCascade.computeSelectorPriorityOf(rules[i].selector);

                                    if(isBestImportant) {
                                        // only an important declaration can beat another important declaration
                                        if(decls[j].important) {
                                            if(currentPriority >= bestPriority) {
                                                bestPriority = currentPriority;
                                                bestValue = decls[j].value;
                                            }
                                        }
                                    } else {
                                        // an important declaration beat any non-important declaration
                                        if(decls[j].important) {
                                            isBestImportant = true;
                                            bestPriority = currentPriority;
                                            bestValue = decls[j].value;
                                        } else {
                                            // the selector priority has to be higher otherwise
                                            if(currentPriority >= bestPriority) {
                                                bestPriority = currentPriority;
                                                bestValue = decls[j].value;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if((rules[i] instanceof cssSyntax.AtRule) && (rules[i].name=="media")) {

                        visit(rules[i].value);

                    }

                }

            }
            visit(rules);

            // return our best guess...
            return bestValue;

        }

    },


    //
    // start monitoring a new stylesheet
    // (should usually not be used because stylesheets load automatically)
    //
    stylesheets: [],
    loadStyleSheet: function loadStyleSheet(cssText,i) {

        // load in order

        // parse the stylesheet content
        var rules = cssSyntax.parse(cssText).value;

        // add the stylesheet into the object model
        if(typeof(i)!=="undefined") { cssCascade.stylesheets[i]=rules; }
        else { i=cssCascade.stylesheets.push(rules);}

        // make sure to monitor the required rules
        cssCascade.startMonitoringStylesheet(rules)

    },

    //
    // start monitoring a new stylesheet
    // (should usually not be used because stylesheets load automatically)
    //
    loadStyleSheetTag: function loadStyleSheetTag(stylesheet,i) {

        if(stylesheet.hasAttribute('data-css-polyfilled')) {
            return;
        }

        if(stylesheet.tagName=='LINK') {

            // oh, no, we have to download it...
            try {

                // dummy value in-between
                cssCascade.stylesheets[i] = new cssSyntax.TokenList();

                //
                var xhr = new XMLHttpRequest(); xhr.href = stylesheet.href;
                xhr.open('GET',stylesheet.href,true); xhr.ruleIndex = i;
                xhr.onreadystatechange = function() {
                    if(this.readyState==4) {

                        // status 0 is a webkit bug for local files
                        if(this.status==200||this.status==0) {
                            cssCascade.loadStyleSheet(this.responseText,this.ruleIndex)
                        } else {
                            cssConsole.log("css-cascade polyfill failled to load: " + this.href);
                        }
                    }
                };
                xhr.send();

            } catch(ex) {
                cssConsole.log("css-cascade polyfill failled to load: " + stylesheet.href);
            }

        } else {

            // oh, cool, we just have to parse the content!
            cssCascade.loadStyleSheet(stylesheet.textContent,i);

        }

        // mark the stylesheet as ok
        stylesheet.setAttribute('data-css-polyfilled',true);

    },

    //
    // calling this function will load all currently existing stylesheets in the document
    // (should usually not be used because stylesheets load automatically)
    //
    selectorForStylesheets: "style:not([data-no-css-polyfill]):not([data-css-polyfilled]), link[rel=stylesheet]:not([data-no-css-polyfill]):not([data-css-polyfilled])",
    loadAllStyleSheets: function loadAllStyleSheets() {

        // for all stylesheets in the <head> tag...
        var head = document.head || document.documentElement;
        var stylesheets = head.querySelectorAll(cssCascade.selectorForStylesheets);

        var intialLength = this.stylesheets.length;
        this.stylesheets.length += stylesheets.length

        // for all of them...
        for(var i = stylesheets.length; i--;) {

            //
            // load the stylesheet
            //
            var stylesheet = stylesheets[i];
            cssCascade.loadStyleSheetTag(stylesheet,intialLength+i)

        }
    },

    //
    // this is where se store event handlers for monitored properties
    //
    monitoredProperties: Object.create ? Object.create(null) : {},
    monitoredPropertiesHandler: {
        onupdate: function(element, rule) {

            // we need to find all regexps that matches
            var mps = cssCascade.monitoredProperties;
            var decls = rule.value;
            for(var j=decls.length-1; j>=0; j--) {
                if(decls[j].type=="DECLARATION") {
                    if(decls[j].name in mps) {

                        // call all handlers waiting for this
                        var hs = mps[decls[j].name];
                        for(var hi=hs.length; hi--;) {
                            hs[hi].onupdate(element,rule);
                        };

                        // don't call twice
                        break;

                    }
                }
            }

        }
    },

    //
    // add an handler to some properties (aka fire when their value *MAY* be affected)
    // REMARK: because this event does not promise the value changed, you may want to figure it out before relayouting
    //
    startMonitoringProperties: function startMonitoringProperties(properties, handler) {

        for(var i=properties.length; i--; ) {
            var property = properties[i];
            var handlers = (
                cssCascade.monitoredProperties[property]
                || (cssCascade.monitoredProperties[property] = [])
            );
            handlers.push(handler)
        }

        for(var s=0; s<cssCascade.stylesheets.length; s++) {
            var currentStylesheet = cssCascade.stylesheets[s];
            cssCascade.startMonitoringStylesheet(currentStylesheet);
        }

    },

    //
    // calling this function will detect monitored rules in the stylesheet
    // (should usually not be used because stylesheets load automatically)
    //
    startMonitoringStylesheet: function startMonitoringStylesheet(rules) {
        for(var i=0; i<rules.length; i++) {

            // only consider style rules
            if(rules[i] instanceof cssSyntax.StyleRule) {

                // try to see if the current rule is worth monitoring
                if(rules[i].isMonitored) continue;

                // for that, let's see if we can find a declaration we should watch
                var decls = rules[i].value;
                for(var j=decls.length-1; j>=0; j--) {
                    if(decls[j].type=="DECLARATION") {
                        if(decls[j].name in cssCascade.monitoredProperties) {

                            // if we found some, start monitoring
                            cssCascade.startMonitoringRule(rules[i]);
                            break;

                        }
                    }
                }

            } else if(rules[i] instanceof cssSyntax.AtRule) {

                // handle @media
                if(rules[i].name == "media" && window.matchMedia) {

                    cssCascade.startMonitoringMedia(rules[i]);

                }

            }

        }
    },

    //
    // calling this function will detect media query updates and fire events accordingly
    // (should usually not be used because stylesheets load automatically)
    //
    startMonitoringMedia: function startMonitoringMedia(atrule) {
        try {

            var media = window.matchMedia(atrule.prelude.toCSSString());

            // update all the rules when needed
            cssCascade.updateMedia(atrule.value, !media.matches, false);
            media.addListener(
                function(newMedia) { cssCascade.updateMedia(atrule.value, !newMedia.matches, true); }
            );

            // it seems I like taking risks...
            cssCascade.startMonitoringStylesheet(atrule.value);

        } catch(ex) {
            setImmediate(function() { throw ex; })
        }
    },

    //
    // define what happens when a media query status changes
    //
    updateMedia: function(rules,disabled,update) {
        for(var i=rules.length; i--; ) {
            rules[i].disabled = disabled;
            // TODO: should probably get handled by a setter on the rule...
            var sr = rules[i].subRules;
            if(sr) {
                for(var j=sr.length; j--; ) {
                    sr[j].disabled = disabled;
                }
            }
        }

        // in case of update, all elements matching the selector went potentially updated...
        if(update) {
            for(var i=rules.length; i--; ) {
                var els = document.querySelectorAll(rules[i].selector.toCSSString());
                for(var j=els.length; j--; ) {
                    cssCascade.monitoredPropertiesHandler.onupdate(els[j],rules[i]);
                }
            }
        }
    },

    //
    // splits a rule if it has multiple selectors
    //
    splitRule: function splitRule(rule) {

        // create an array for all the subrules
        var rules = [];

        // fill the array
        var currentRule = new cssSyntax.StyleRule(); currentRule.disabled=rule.disabled;
        for(var i=0; i<rule.selector.length; i++) {
            if(rule.selector[i] instanceof cssSyntax.DelimToken && rule.selector[i].value==",") {
                currentRule.value = rule.value; rules.push(currentRule);
                currentRule = new cssSyntax.StyleRule(); currentRule.disabled=rule.disabled;
            } else {
                currentRule.selector.push(rule.selector[i])
            }
        }
        currentRule.value = rule.value; rules.push(currentRule);

        // save the result of the split as subrules
        return rule.subRules = rules;

    },

    //
    // ask the css-selector implementation to notify changes for the rules
    //
    startMonitoringRule: function startMonitoringRule(rule) {

        // avoid monitoring rules twice
        if(!rule.isMonitored) { rule.isMonitored=true } else { return; }

        // split the rule if it has multiple selectors
        var rules = rule.subRules || cssCascade.splitRule(rule);

        // monitor the rules
        for(var i=0; i<rules.length; i++) {
            rule = rules[i];
            myQuerySelectorLive(rule.selector.toCSSString(), {
                onadded: function(e) {

                    // add the rule to the matching list of this element
                    (e.myMatchedRules = e.myMatchedRules || []).push(rule); // TODO: does not respect priority order

                    // generate an update event
                    cssCascade.monitoredPropertiesHandler.onupdate(e, rule);

                },
                onremoved: function(e) {

                    // remove the rule from the matching list of this element
                    if(e.myMatchedRules) e.myMatchedRules.splice(e.myMatchedRules.indexOf(rule), 1);

                    // generate an update event
                    cssCascade.monitoredPropertiesHandler.onupdate(e, rule);

                }
            });
        }

    },

    //
    // converts a css property name to a javascript name
    //
    toCamelCase: function toCamelCase(variable) {
        return variable.replace(
            /-([a-z])/g,
            function(str,letter) {
                return letter.toUpperCase();
            }
        );
    },

    //
    // add some magic code to support properties on the style interface
    //
    polyfillStyleInterface: function(cssPropertyName) {

        var prop = {

            get: function() {

                try { if(!this.parentElement) throw new Error("Please use the anHTMLElement.myStyle property to get polyfilled properties") }
                catch(ex) { setImmediate(function() { throw ex; }); return ''; }

                return this.parentElement.getAttribute('data-style-'+cssPropertyName);

            },

            set: function(v) {

                try { if(!this.parentElement) throw new Error("Please use the anHTMLElement.myStyle property to set polyfilled properties") }
                catch(ex) { setImmediate(function() { throw ex; }); return; }

                if(this.parentElement.getAttribute('data-style-'+cssPropertyName) != v) {
                    this.parentElement.setAttribute('data-style-'+cssPropertyName,v);
                }

            }

        };

        var styleProto = Object.getPrototypeOf(document.documentElement.style) || CSSStyleDeclaration;
        Object.defineProperty(styleProto,cssPropertyName,prop);
        Object.defineProperty(styleProto,cssCascade.toCamelCase(cssPropertyName),prop);
        cssCascade.startMonitoringRule(cssSyntax.parse('[data-style-'+cssPropertyName+']{'+cssPropertyName+':attr(style)}').value[0]);

        // add to the list of polyfilled properties...
        cssCascade.getAllCSSProperties().push(cssPropertyName);
        cssCascade.computationUnsafeProperties[cssPropertyName] = true;

    }

};

//
// polyfill for browsers not support CSSStyleDeclaration.parentElement (all of them right now)
//
basicObjectModel.EventTarget.implementsIn(cssCascade);
Object.defineProperty(Element.prototype,'myStyle',{
    get: function() {
        var style = this.style;
        if(!style.parentElement) style.parentElement = this;
        return style;
    }
});

//
// load all stylesheets at the time the script is loaded
// then do it again when all stylesheets are downloaded
// and again if some style tag is added to the DOM
//
cssCascade.loadAllStyleSheets();
document.addEventListener("DOMContentLoaded", function() {
    cssCascade.loadAllStyleSheets();
    if(window.myQuerySelectorLive) {
        window.myQuerySelectorLive(
            cssCascade.selectorForStylesheets,
            {
                onadded: function(e) {
                    // TODO: respect DOM order?
                    cssCascade.loadStyleSheetTag(e);
                    cssCascade.dispatchEvent('stylesheetadded');
                }
            }
        )
    }
})
/////////////////////////////////////////////////////////////////
////                                                         ////
////                 prerequirements of qSL                  ////
////                                                         ////
/////////////////////////////////////////////////////////////////
////                                                         ////
////   Please note that I require querySelectorAll to work   ////
////                                                         ////
////   See http://github.com/termi/CSS_selector_engine/      ////
////   for a polyfill for older browsers                     ////
////                                                         ////
/////////////////////////////////////////////////////////////////

// global todos:
// - wrap this into a module
// - look for a few optimizations ideas in gecko/webkit
// - use arrays in myCompositeEventStream to avoid nested debouncings
"use strict";

///
/// event stream implementation
/// please note this is required to 'live update' the qSA requests
///
function myEventStream(connect, disconnect, reconnect) {
    var self=this;

    // validate arguments
    if(!disconnect) disconnect=function(){};
    if(!reconnect) reconnect=connect;

    // high-level states
    var isConnected=false;
    var isDisconnected=false;
    var shouldDisconnect=false;

    // global variables
    var callback=null;
    var yieldEvent = function() {

        // call the callback function, and pend disposal
        shouldDisconnect=true;
        try { callback && callback(self); } catch(ex) { setImmediate(function() { throw ex; }); }

        // if no action was taken, dispose
        if(shouldDisconnect) { dispose(); }

    }

    // export the interface
    var schedule = this.schedule = function(newCallback) {

        // do not allow to schedule on disconnected event streams
        if(isDisconnected) { throw new Error("Cannot schedule on a disconnected event stream"); }

        // do not allow to schedule on already scheduled event streams
        if(isConnected && !shouldDisconnect) { throw new Error("Cannot schedule on an already-scheduled event stream"); }

        // schedule the new callback
        callback=newCallback; shouldDisconnect=false;

        // reconnect to the stream
        if(isConnected) {
            reconnect(yieldEvent);
        } else {
            connect(yieldEvent);
            isConnected=true;
        }
    }

    var dispose = this.dispose = function() {

        // do not allow to dispose non-connected streams
        if(isConnected) {

            // disconnect & save resources
            disconnect();
            self=null; yieldEvent=null; callback=null;
            isConnected=false; isDisconnected=true; shouldDisconnect=false;

        }
    }
}

///
/// call a function every frame
///
function myAnimationFrameEventStream(options) {

    // flag that says whether the observer is still needed or not
    var rid = 0;

    // start the event stream
    myEventStream.call(
        this,
        function connect(yieldEvent) { rid = requestAnimationFrame(yieldEvent); },
        function disconnect() { cancelAnimationFrame(rid); }
    );

}

///
/// call a function every timeout
///
function myTimeoutEventStream(options) {

    // flag that says whether the observer is still needed or not
    var rid = 0; var timeout=(typeof(options)=="number") ? (+options) : ("timeout" in options ? +options.timeout : 333);

    // start the event stream
    myEventStream.call(
        this,
        function connect(yieldEvent) { rid = setTimeout(yieldEvent, timeout); },
        function disconnect() { clearTimeout(rid); }
    );

}

///
/// call a function every time the mouse moves
///
function myMouseEventStream() {
    var self=this; var pointermove = (("PointerEvent" in window) ? "pointermove" : (("MSPointerEvent" in window) ? "MSPointerMove" : "mousemove"));

    // flag that says whether the event is still observered or not
    var scheduled = false; var interval=0;

    // handle the synchronous nature of mutation events
    var yieldEvent=null;
    var yieldEventDelayed = function() {
        if(scheduled) return;
        window.removeEventListener(pointermove, yieldEventDelayed, true);
        scheduled = requestAnimationFrame(yieldEvent);
    }

    // start the event stream
    myEventStream.call(
        this,
        function connect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            window.addEventListener(pointermove, yieldEventDelayed, true);
        },
        function disconnect() {
            window.removeEventListener(pointermove, yieldEventDelayed, true);
            cancelAnimationFrame(scheduled); yieldEventDelayed=null; yieldEvent=null; scheduled=false;
        },
        function reconnect(newYieldEvent) {
            yieldEvent=newYieldEvent; scheduled=false;
            window.addEventListener(pointermove, yieldEventDelayed, true);
        }
    );

}

///
/// call a function every time the mouse is clicked/unclicked
///
function myMouseButtonEventStream() {
    var self=this;
    var pointerup = (("PointerEvent" in window) ? "pointerup" : (("MSPointerEvent" in window) ? "MSPointerUp" : "mouseup"));
    var pointerdown = (("PointerEvent" in window) ? "pointerdown" : (("MSPointerEvent" in window) ? "MSPointerDown" : "mousedown"));

    // flag that says whether the event is still observered or not
    var scheduled = false; var interval=0;

    // handle the synchronous nature of mutation events
    var yieldEvent=null;
    var yieldEventDelayed = function() {
        if(scheduled) return;
        window.removeEventListener(pointerup, yieldEventDelayed, true);
        window.removeEventListener(pointerdown, yieldEventDelayed, true);
        scheduled = requestAnimationFrame(yieldEvent);
    }

    // start the event stream
    myEventStream.call(
        this,
        function connect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            window.addEventListener(pointerup, yieldEventDelayed, true);
            window.addEventListener(pointerdown, yieldEventDelayed, true);
        },
        function disconnect() {
            window.removeEventListener(pointerup, yieldEventDelayed, true);
            window.removeEventListener(pointerdown, yieldEventDelayed, true);
            cancelAnimationFrame(scheduled); yieldEventDelayed=null; yieldEvent=null; scheduled=false;
        },
        function reconnect(newYieldEvent) {
            yieldEvent=newYieldEvent; scheduled=false;
            window.addEventListener(pointerup, yieldEventDelayed, true);
            window.addEventListener(pointerdown, yieldEventDelayed, true);
        }
    );

}

///
/// call a function whenever the DOM is modified
///
var myDOMUpdateEventStream;
if("MutationObserver" in window) {
    myDOMUpdateEventStream = function myDOMUpdateEventStream(options) {

        // configuration of the observer
        if(options) {
            var target = "target" in options ? options.target : document.documentElement;
            var config = {
                subtree: "subtree" in options ? !!options.subtree : true,
                attributes: "attributes" in options ? !!options.attributes : true,
                childList: "childList" in options ? !!options.childList : true,
                characterData: "characterData" in options ? !!options.characterData : false
            };
        } else {
            var target = document.documentElement;
            var config = {
                subtree: true,
                attributes: true,
                childList: true,
                characterData: false
            };
        }

        // start the event stream
        var observer = null;
        myEventStream.call(
            this,
            function connect(yieldEvent) { if(config) { observer=new MutationObserver(yieldEvent); observer.observe(target,config); target=null; config=null; } },
            function disconnect() { observer && observer.disconnect(); observer=null; },
            function reconnect() { observer.takeRecords(); }
        );

    }
} else if("MutationEvent" in window) {
    myDOMUpdateEventStream = function myDOMUpdateEventStream(options) {
        var self=this;

        // flag that says whether the event is still observered or not
        var scheduled = false;

        // configuration of the observer
        if(options) {
            var target = "target" in options ? options.target : document.documentElement;
        } else {
            var target = document.documentElement;
        }

        // handle the synchronous nature of mutation events
        var yieldEvent=null;
        var yieldEventDelayed = function() {
            if(scheduled || !yieldEventDelayed) return;
            document.removeEventListener("DOMContentLoaded", yieldEventDelayed, false);
            document.removeEventListener("DOMContentLoaded", yieldEventDelayed, false);
            target.removeEventListener("DOMSubtreeModified", yieldEventDelayed, false);
            scheduled = requestAnimationFrame(yieldEvent);
        }

        // start the event stream
        myEventStream.call(
            this,
            function connect(newYieldEvent) {
                yieldEvent=newYieldEvent;
                document.addEventListener("DOMContentLoaded", yieldEventDelayed, false);
                target.addEventListener("DOMSubtreeModified", yieldEventDelayed, false);
            },
            function disconnect() {
                document.removeEventListener("DOMContentLoaded", yieldEventDelayed, false);
                target.removeEventListener("DOMSubtreeModified", yieldEventDelayed, false);
                cancelAnimationFrame(scheduled); yieldEventDelayed=null; yieldEvent=null; scheduled=false;
            },
            function reconnect(newYieldEvent) {
                yieldEvent=newYieldEvent; scheduled=false;
                target.addEventListener("DOMSubtreeModified", yieldEventDelayed, false);
            }
        );

    }
} else {
    myDOMUpdateEventStream = myAnimationFrameEventStream;
}

///
/// call a function every time the focus shifts
///
function myFocusEventStream() {
    var self=this;

    // handle the filtering nature of focus events
    var yieldEvent=null; var previousActiveElement=null; var previousHasFocus=false; var rid=0;
    var yieldEventDelayed = function() {

        // if the focus didn't change
        if(previousActiveElement==document.activeElement && previousHasFocus==document.hasFocus()) {

            // then do not generate an event
            setTimeout(yieldEventDelayed, 333); // focus that didn't move is expected to stay

        } else {

            // else, generate one & save config
            previousActiveElement=document.activeElement;
            previousHasFocus=document.hasFocus();
            yieldEvent();

        }
    }

    // start the event stream
    myEventStream.call(
        this,
        function connect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            rid=setTimeout(yieldEventDelayed, 500); // let the document load
        },
        function disconnect() {
            clearTimeout(rid); yieldEventDelayed=null; yieldEvent=null; rid=0;
        },
        function reconnect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            rid=setTimeout(yieldEventDelayed, 100); // focus by tab navigation moves fast
        }
    );

}

///
/// composite event stream
/// because sometimes you need more than one event source
///
function myCompositeEventStream(stream1, stream2) {
    var self=this;

    // fields
    var yieldEvent=null; var s1=false, s2=false;
    var yieldEventWrapper=function(s) {
        if(s==stream1) s1=true;
        if(s==stream2) s2=true;
        if(s1&&s2) return;
        yieldEvent(self);
    }

    // start the event stream
    myEventStream.call(
        this,
        function connect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            stream1.schedule(yieldEventWrapper);
            stream2.schedule(yieldEventWrapper);
        },
        function disconnect() {
            stream1.dispose();
            stream2.dispose();
        },
        function reconnect(newYieldEvent) {
            yieldEvent=newYieldEvent;
            s1 && stream1.schedule(yieldEventWrapper);
            s2 && stream2.schedule(yieldEventWrapper);
            s1 = s2 = false;
        }
    );
}


/////////////////////////////////////////////////////////////////
////                                                         ////
////                  implementation of qSL                  ////
////                                                         ////
/////////////////////////////////////////////////////////////////

///
/// the live querySelectorAll implementation
///
window.myQuerySelectorLive = function(selector, handler, root) {

    // restrict the selector coverage to some part of the DOM only
    var root = root || document;

    // TODO: make use of "mutatedAncestorElement" to update only elements inside the mutated zone

    var currentElms = [];
    var loop = function loop(eventStream) {

        // schedule next run
        eventStream.schedule(loop);

        // update elements matching the selector
        var newElms = [];
        var oldElms = currentElms.slice(0);
        var temps = root.querySelectorAll(selector);
        for(var i=newElms.length=temps.length; i;) { newElms.push(temps[--i]); }
        currentElms = newElms.slice(0); temps=null;

        // first let's clear all elements that have been removed from the document
        oldElms = oldElms.filter(function(e) {

            // check whether the current element is still there
            var isStillInDocument = (
                e===document.documentElement
                || document.documentElement.contains(e)
            );

            if(isStillInDocument) {

                // NEED_COMPARE: we will compare this element to the new list
                return true;

            } else {

                // DELETE: raise onremoved, pop old elements
                try { handler.onremoved && handler.onremoved(e); } catch(ex) { setImmediate(function() {throw ex})}
                return false;

            }

        });

        // now pop and match until both lists are exhausted
        // (we use the fact the returned elements are in document order)
        var el1 = oldElms.pop();
        var el2 = newElms.pop();
        while(el1 || el2) {
            if(el1===el2) {

                // MATCH: pop both elements
                el1 = oldElms.pop();
                el2 = newElms.pop();

            } else if (el2 && /*el1 is after el2*/(!el1||(el2.compareDocumentPosition(el1) & (1|2|8|32))===0)) {

                // INSERT: raise onadded, pop new elements
                try { handler.onadded && handler.onadded(el2); } catch(ex) { setImmediate(function() {throw ex})}
                el2 = newElms.pop();

            } else {

                // DELETE: raise onremoved, pop old elements
                try { handler.onremoved && handler.onremoved(el1); } catch(ex) { setImmediate(function() {throw ex})}
                el1 = oldElms.pop();

            }
        }

    };

    // use the event stream that best matches our needs
    var simpleSelector = selector.replace(/:(dir|lang|root|empty|blank|nth-child|nth-last-child|first-child|last-child|only-child|nth-of-type|nth-last-of-child|fist-of-type|last-of-type|only-of-type|not|matches|default)\b/gi,'')
    var eventStream; if(simpleSelector.indexOf(':') == -1) {

        // static stuff only
        eventStream = new myDOMUpdateEventStream(root);

    } else {

        // dynamic stuff too
        eventStream = new myDOMUpdateEventStream(root);
        if(myDOMUpdateEventStream != myAnimationFrameEventStream) {

            // detect the presence of focus-related pseudo-classes
            var reg = /:(focus|active)\b/gi;
            if(reg.test(simpleSelector)) {

                // mouse events should be listened
                eventStream = new myCompositeEventStream(
                    new myFocusEventStream(),
                    eventStream
                );

                // simplify simpleSelector
                var reg = /:(focus)\b/gi;
                simpleSelector = simpleSelector.replace(reg, ''); // :active has other hooks

            }

            // detect the presence of mouse-button-related pseudo-classes
            var reg = /:(active)\b/gi;
            if(reg.test(simpleSelector)) {

                // mouse events should be listened
                eventStream = new myCompositeEventStream(
                    new myMouseButtonEventStream(),
                    eventStream
                );

                // simplify simpleSelector
                simpleSelector = simpleSelector.replace(reg, '');

            }

            // detect the presence of user input pseudo-classes
            var reg = /:(target|checked|indeterminate|valid|invalid|in-range|out-of-range|user-error)\b/gi;
            if(reg.test(simpleSelector)) {

                // slowly dynamic stuff do happen
                eventStream = new myCompositeEventStream(
                    new myTimeoutEventStream(250),
                    eventStream
                );

                // simplify simpleSelector
                simpleSelector = simpleSelector.replace(reg, '');

                var reg = /:(any-link|link|visited|local-link|enabled|disabled|read-only|read-write|required|optional)\b/gi;
                // simplify simpleSelector
                simpleSelector = simpleSelector.replace(reg, '');

            }

            // detect the presence of nearly-static pseudo-classes
            var reg = /:(any-link|link|visited|local-link|enabled|disabled|read-only|read-write|required|optional)\b/gi;
            if(reg.test(simpleSelector)) {

                // nearly static stuff do happen
                eventStream = new myCompositeEventStream(
                    new myTimeoutEventStream(333),
                    eventStream
                );

                // simplify simpleSelector
                simpleSelector = simpleSelector.replace(reg, '');

            }

            // detect the presence of mouse-related pseudo-classes
            var reg = /:(hover)\b/gi;
            if(reg.test(simpleSelector)) {

                // mouse events should be listened
                eventStream = new myCompositeEventStream(
                    new myMouseEventStream(),
                    eventStream
                );

                // simplify simpleSelector
                simpleSelector = simpleSelector.replace(reg, '');

            }

            // detect the presence of unknown pseudo-classes
            if(simpleSelector.indexOf(':') !== -1) {

                // other stuff do happen, too (let's give up on events)
                eventStream = new myAnimationFrameEventStream();

            }

        }

    }

    // start handling changes
    loop(eventStream);

}

/////////////////////////////////////////////////////////////////
////                                                         ////
////        here's some other stuff I may user later         ////
////                                                         ////
/////////////////////////////////////////////////////////////////

///
/// get the common ancestor from a list of nodes
///
function getCommonAncestor(nodes) {

    // validate arguments
    if (!nodes || !nodes.length) { return null; }
    if (nodes.length < 2) { return nodes[0]; }

    // start bubbling from the first node
    var currentNode = nodes[0];

    // while we still have a candidate ancestor
    bubbling: while(currentNode && currentNode.nodeType!=9) {

        // walk all other intial nodes
        var i = nodes.length;
        while (--i) {

            // if the curent node doesn't contain any of those nodes
            if (!currentNode.contains(nodes[i])) {

                // consider the parent node instead
                currentNode = currentNode.parentNode;
                continue bubbling;

            }

        }

        // if all were contained in the current node:
        // we found the solution
        return currentNode;
    }

    return null;
}
"use strict";

var cssBreak = {

    //
    // returns true if an element is replaced
    // (can't be broken because considered as an image in css layout)
    //
    isReplacedElement: function isReplacedElement(element) {
        if(!(element instanceof Element)) return false;
        var replacedElementTags = /^(SVG|MATH|IMG|VIDEO|OBJECT|EMBED|IFRAME|TEXTAREA|BUTTON|INPUT)$/; // TODO: more
        return replacedElementTags.test(element.tagName);
    },

    //
    // returns true if an element has a scrollbar or act on overflowing content
    //
    isScrollable: function isScrollable(element, elementOverflow) {
        if(!(element instanceof Element)) return false;
        if(typeof(elementOverflow)=="undefined") elementOverflow = getComputedStyle(element).overflow;

        return (
            elementOverflow !== "visible"
            && elementOverflow !== "hidden"
        );

    },

    //
    // returns true if the element is part of an inline flow
    // TextNodes definitely qualify, but also inline-block elements
    //
    isSingleLineOfTextComponent: function(element, elementStyle, elementDisplay, elementPosition, isReplaced) {
        if(!(element instanceof Element)) return true;
        if(typeof(elementStyle)=="undefined") elementStyle = getComputedStyle(element);
        if(typeof(elementDisplay)=="undefined") elementDisplay = elementStyle.display;
        if(typeof(elementPosition)=="undefined") elementPosition = elementStyle.position;
        if(typeof(isReplaced)=="undefined") isReplaced = this.isReplacedElement(element);

        return (
            elementDisplay === "inline-block"
            || elementDisplay === "inline-table"
            || elementDisplay === "inline-flex"
            || elementDisplay === "inline-grid"
            // TODO: more
        ) && (
            elementPosition === "static"
            || elementPosition === "relative"
        );

    },

    //
    // returns true if the element is part of an inline flow
    // TextNodes definitely qualify, but also inline-block elements
    //
    hasAnyInlineFlow: function(element) {

        function countAsInline(element) {
            if(!(element instanceof Element)) return !(/^\s*$/.test(element.nodeValue));
            return !cssBreak.isOutOfFlowElement(element) && cssBreak.isSingleLineOfTextComponent(element);
        }

        // try to find any inline element
        var current = element.firstChild;
        while(current) {
            if(countAsInline(current)) return true;
            current = current.nextSibling;
        }

        // no inline element
        return false;

    },

    //
    // returns true if the element breaks the inline flow
    // (the case of block elements, mostly)
    //
    isLineBreakingElement: function(element, elementStyle, elementDisplay, elementPosition) {

        if(!(element instanceof Element)) return false;
        if(typeof(elementStyle)=="undefined") elementStyle = getComputedStyle(element);
        if(typeof(elementDisplay)=="undefined") elementDisplay = elementStyle.display;
        if(typeof(elementPosition)=="undefined") elementPosition = elementStyle.position;

        return (
            (
                // in-flow bock elements
                (elementDisplay === "block")
                && !this.isOutOfFlowElement(element, elementStyle, elementDisplay, elementPosition)

            ) || (

                // displayed <br> elements
                element.tagName==="BR" && elementDisplay!=="none"

            )
        );
    },

    //
    // returns true if the element breaks the inline flow before him
    // (the case of block elements, mostly)
    //
    isLinePreBreakingElement: function(element, elementStyle, elementDisplay, elementPosition) {
        if(!(element instanceof Element)) return false;

        var breakBefore = cssCascade.getSpecifiedStyle(element,'break-before').toCSSString();
        return (
            (breakBefore=="region"||breakBefore=="all")
            || cssBreak.isLineBreakingElement(element, elementStyle, elementDisplay, elementPosition)
        );

    },

    //
    // returns true if the element breaks the inline flow after him
    // (the case of block elements, mostly)
    //
    isLinePostBreakingElement: function(element, elementStyle, elementDisplay, elementPosition) {
        if(!(element instanceof Element)) return false;

        var breakAfter = cssCascade.getSpecifiedStyle(element,'break-after').toCSSString();
        return (
            (breakAfter=="region"||breakAfter=="all")
            || cssBreak.isLineBreakingElement(element, elementStyle, elementDisplay, elementPosition)
        );

    },

    //
    // returns true if the element is outside any block/inline flow
    // (this the case of absolutely positioned elements, and floats)
    //
    isOutOfFlowElement: function(element, elementStyle, elementDisplay, elementPosition, elementFloat) {
        if(!(element instanceof Element)) return false;
        if(typeof(elementStyle)=="undefined") elementStyle = getComputedStyle(element);
        if(typeof(elementDisplay)=="undefined") elementDisplay = elementStyle.display;
        if(typeof(elementPosition)=="undefined") elementPosition = elementStyle.position;
        if(typeof(elementFloat)=="undefined") elementFloat = elementStyle.float || elementStyle.styleFloat || elementStyle.cssFloat;

        return (

            // positioned elements are out of the flow
            (elementPosition==="absolute"||elementPosition==="fixed")

            // floated elements as well
            || (elementFloat!=="none")

            // not sure but let's say hidden elements as well
            || (elementDisplay==="none")

        );

    },

    //
    // returns true if two sibling elements are in the same text line
    // (this function is not perfect, work with it with care)
    //
    areInSameSingleLine: function areInSameSingleLine(element1, element2) {

        //
        // look for obvious reasons why it wouldn't be the case
        //

        // if the element are not direct sibling, we must use their inner siblings as well
        if(element1.nextSibling != element2) {
            if(element2.nextSibling != element1) throw "I gave up!";
            var t = element1; element1=element2; element2=t;
        }

        // a block element is never on the same line as another element
        if(this.isLinePostBreakingElement(element1)) return false;
        if(this.isLinePreBreakingElement(element2)) return false;

        // if the previous element is out of flow, we may consider it as being part of the current line
        if(this.isOutOfFlowElement(element1)) return true;

        // if the current object is not a single line component, return false
        if(!this.isSingleLineOfTextComponent(element1)) return false;

        //
        // compute the in-flow bounding rect of the two elements
        //
        var element1box = Node.getBoundingClientRect(element1);
        var element2box = Node.getBoundingClientRect(element2);
        function shift(box,shiftX,shiftY) {
            return {
                top: box.top+shiftY,
                bottom: box.bottom+shiftY,
                left: box.left+shiftX,
                right: box.right+shiftX
            }
        }

        // we only need to shift elements
        if(element1 instanceof Element) {
            var element1Style = getComputedStyle(element1);
            element1box = shift(element1box, parseFloat(element1Style.marginLeft), parseFloat(element1Style.marginTop))
            if(element1Style.position=="relative") {
                element1box = shift(element1box, parseFloat(element1Style.left), parseFloat(element1Style.top))
            }
        }

        // we only need to shift elements
        if(element2 instanceof Element) {
            var element2Style = getComputedStyle(element2);
            element2box = shift(element2box, parseFloat(element2Style.marginLeft), parseFloat(element2Style.marginTop))
            if(element2Style.position=="relative") {
                element2box = shift(element2box, parseFloat(element2Style.left), parseFloat(element2Style.top))
            }
        }

        // order the nodes so that they are in left-to-right order
        // (this means invert their order in the case of right-to-left flow)
        var firstElement = getComputedStyle(element1.parentNode).direction=="rtl" ? element2box : element1box;
        var secondElement = getComputedStyle(element1.parentNode).direction=="rtl" ? element1box : element2box;

        // return true if both elements are have non-overlapping
        // margin- and position-corrected in-flow bounding rect
        // and if their relative position is the one of the current
        // flow (either rtl or ltr)
        return firstElement.right <= secondElement.left;

        // TODO: what about left-to-right + right-aligned text?
        // I should probably takes care of vertical position in this case to solve ambiguities

    },

    //
    // returns true if the element has "overflow: hidden" set on it, and actually overflows
    //
    isHiddenOverflowing: function isHiddenOverflowing(element, elementOverflow) {
        if(!(element instanceof Element)) return false;
        if(typeof(elementOverflow)=="undefined") elementOverflow = getComputedStyle(element).display;

        return (
            elementOverflow == "hidden"
            && element.offsetHeight != element.scrollHeight // trust me that works
        );

    },

    //
    // returns true if the element has a border-radius that impacts his layout
    //
    hasBigRadius: function(element, elementStyle) {
        if(!(element instanceof Element)) return false;
        if(typeof(elementStyle)=="undefined") elementStyle = getComputedStyle(element);

        // if the browser supports radiuses {f### prefixes}
        if("borderTopLeftRadius" in elementStyle) {

            var tlRadius = parseFloat(elementStyle.borderTopLeftRadius);
            var trRadius = parseFloat(elementStyle.borderTopRightRadius);
            var blRadius = parseFloat(elementStyle.borderBottomLeftRadius);
            var brRadius = parseFloat(elementStyle.borderBottomRightRadius);

            // tiny radiuses (<15px) are tolerated anyway
            if(tlRadius < 15 && trRadius < 15 && blRadius < 15 && brRadius < 15) {
                return false;
            }

            var tWidth = parseFloat(elementStyle.borderTopWidth);
            var bWidth = parseFloat(elementStyle.borderBottomWidth);
            var lWidth = parseFloat(elementStyle.borderLeftWidth);
            var rWidth = parseFloat(elementStyle.borderRightWidth);

            // make sure the radius itself is contained into the border

            if(tlRadius > tWidth) return true;
            if(tlRadius > lWidth) return true;

            if(trRadius > tWidth) return true;
            if(trRadius > rWidth) return true;

            if(blRadius > bWidth) return true;
            if(blRadius > lWidth) return true;

            if(brRadius > bWidth) return true;
            if(brRadius > rWidth) return true;

        }

        // all conditions were met
        return false;
    },

    //
    // returns true if the element is unbreakable according to the spec
    // (and some of the expected limitations of HTML/CSS)
    //
    isMonolithic: function isMonolithic(element) {
        if(!(element instanceof Element)) return false;

        var elementStyle = getComputedStyle(element);
        var elementOverflow = elementStyle.overflow;
        var elementDisplay = elementStyle.display;

        // Some content is not fragmentable, for example:
        // - many types of replaced elements (such as images or video)

        var isReplaced = this.isReplacedElement(element);

        // - scrollable elements

        var isScrollable = this.isScrollable(element, elementOverflow);

        // - a single line of text content.

        var isSingleLineOfText = this.isSingleLineOfTextComponent(element, elementStyle, elementDisplay, undefined, isReplaced);

        // Such content is considered monolithic: it contains no
        // possible break points.

        // In addition to any content which is not fragmentable,
        // UAs may consider as monolithic:
        // - any elements with ‘overflow’ set to ‘auto’ or ‘scroll’
        // - any elements with ‘overflow: hidden’ and a non-‘auto’ logical height (and no specified maximum logical height).

        var isHiddenOverflowing = this.isHiddenOverflowing(element, elementOverflow);

        // ADDITION TO THE SPEC:
        // I don't want to handle the case where
        // an element has a border-radius that is bigger
        // than the border-width to which it belongs
        var hasBigRadius = this.hasBigRadius(element, elementStyle);

        // all of them are monolithic
        return isReplaced || isScrollable || isSingleLineOfText || isHiddenOverflowing || hasBigRadius;

    },

    //
    // returns true if "r" is a collapsed range located at a possible break point for "region"
    // (this function does all the magic for you, but you may want to avoid using it too much)
    //
    isPossibleBreakPoint: function isPossibleBreakPoint(r, region) {

        // r has to be a range, and be collapsed
        if(!(r instanceof Range)) return false;
        if(!(r.collapsed)) return false;

        // no ancestor up to the region has to be monolithic
        var ancestor = r.startContainer;
        while(ancestor && ancestor !== region) {
            if(cssBreak.isMonolithic(ancestor)) {
                return false;
            }
            ancestor = ancestor.parentNode;
        }

        // we also have to check that we're not between two single-line-of-text elements
        // that are actually on the same line (in which case you can't break)
        var ancestor = r.startContainer;
        var lastAncestor = r.startContainer.childNodes[r.startOffset];
        while(ancestor && lastAncestor !== region) {
            if(lastAncestor && lastAncestor.previousSibling) {

                if(this.areInSameSingleLine(lastAncestor, lastAncestor.previousSibling)) {
                    return false;
                }

            }

            lastAncestor = ancestor;
            ancestor = ancestor.parentNode;
        }

        // there are some very specific conditions for breaking
        // at the edge of an element:

        if(r.startOffset==0) {

            // Class 3 breaking point:
            // ========================
            // Between the content edge of a block container box
            // and the outer edges of its child content (margin
            // edges of block-level children or line box edges
            // for inline-level children) if there is a (non-zero)
            // gap between them.

            var firstChild = r.startContainer.childNodes[0];
            if(firstChild) {

                var firstChildBox = (
                    Node.getBoundingClientRect(firstChild)
                );

                var parentBox = (
                    r.startContainer.getBoundingClientRect()
                );

                if(firstChildBox.top == parentBox.top) {
                    return false;
                }

            } else {
                return false;
            }

        }

        // all conditions are met!
        return true;

    }

}
"use strict";

var cssRegionsHelpers = {

    //
    // returns the previous sibling of the element
    // or the previous sibling of its nearest ancestor that has one
    //
    getAllLevelPreviousSibling: function(e, region) {
        if(!e || e==region) return null;

        // find the nearest ancestor that has a previous sibling
        while(!e.previousSibling) {

            // but bubble to the next avail ancestor
            e = e.parentNode;

            // dont get over the bar
            if(!e || e==region) return null;

        }

        // return that sibling
        return e.previousSibling;
    },

    //
    // prepares the element to become a css region
    //
    markNodesAsRegion: function(nodes,fast) {
        nodes.forEach(function(node) {
            node.regionOverset = 'empty';
            node.setAttribute('data-css-region',node.cssRegionsLastFlowFromName);
            cssRegionsHelpers.hideTextNodesFromFragmentSource([node]);
            node.cssRegionsWrapper = node.cssRegionsWrapper || node.appendChild(document.createElement("cssregion"));
        });
    },

    //
    // prepares the element to return to its normal css life
    //
    unmarkNodesAsRegion: function(nodes,fast) {
        nodes.forEach(function(node) {

            // restore regionOverset to its natural value
            node.regionOverset = 'fit';

            // remove the current <cssregion> tag
            try { node.cssRegionsWrapper && node.removeChild(node.cssRegionsWrapper); }
            catch(ex) { setImmediate(function() { throw ex })};
            node.cssRegionsWrapper = undefined;
            delete node.cssRegionsWrapper;

            // restore top-level texts that may have been hidden
            cssRegionsHelpers.unhideTextNodesFromFragmentSource([node]);

            // unmark as a region
            node.removeAttribute('data-css-region');
        });
    },

    //
    // prepares the element for cloning (mainly give them an ID)
    //
    fragmentSourceIndex: 0,
    markNodesAsFragmentSource: function(nodes,ignoreRoot) {

        function visit(node,k) {
            var child, next;
            switch (node.nodeType) {
                case 1: // Element node

                    if(typeof(k)=="undefined" || !ignoreRoot) {

                        // mark as fragment source
                        var id = node.getAttributeNode('data-css-regions-fragment-source');
                        if(!id) { node.setAttribute('data-css-regions-fragment-source', cssRegionsHelpers.fragmentSourceIndex++); }

                    }

                    node.setAttribute('data-css-regions-cloning', true);

                    // expand list values
                    if(node.tagName=='OL') cssRegionsHelpers.expandListValues(node);
                    if(typeof(k)!="undefined" && node.tagName=="LI") cssRegionsHelpers.expandListValues(node.parentNode);

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        nodes.forEach(visit);

    },

    //
    // computes the "value" attribute of every LI element out there
    //
    expandListValues: function(OL) {
        if(OL.getAttribute("data-css-li-value-expanded")) return;
        OL.setAttribute('data-css-li-value-expanded', true);

        if(OL.hasAttribute("reversed")) {

            var currentValue = OL.getAttribute("start") ? parseInt(OL.getAttribute("start")) : OL.childElementCount;
            var increment = -1;

        } else {

            var currentValue = OL.getAttribute("start") ? parseInt(OL.getAttribute("start")) : 1;
            var increment = +1;

        }

        var LI = OL.firstElementChild; var LIV = null;
        while(LI) {
            if(LI.tagName==="LI") {
                if(LIV=LI.getAttributeNode("value")) {
                    currentValue = parseInt(LIV.nodeValue);
                    LI.setAttribute('data-css-old-value', currentValue)
                } else {
                    LI.setAttribute("value", currentValue);
                }
                currentValue = currentValue + increment;
            }
            LI = LI.nextElementSibling;
        }


    },

    //
    // reverts to automatic computation of the value of LI elements
    //
    unexpandListValues: function(OL) {
        if(!OL.hasAttribute('data-css-li-value-expanded')) return;
        OL.removeAttribute('data-css-li-value-expanded')
        var LI = OL.firstElementChild; var LIV = null;
        while(LI) {
            if(LI.tagName==="LI") {
                if(LIV=LI.getAttributeNode("data-css-old-value")) {
                    LI.removeAttributeNode(LIV);
                } else {
                    LI.removeAttribute('value');
                }
            }
            LI = LI.nextElementSibling;
        }
    },

    //
    // makes empty text nodes which cannot get "display: none" applied to them
    //
    listOfTextNodesForIE: [],
    hideTextNodesFromFragmentSource: function(nodes) {

        function visit(node,k) {
            var child, next;
            switch (node.nodeType) {
                case 3: // Text node

                    if(!node.parentNode.getAttribute('data-css-regions-fragment-source')) {
                        // we have to remove their content the hard way...
                        node.cssRegionsSavedNodeValue = node.nodeValue;
                        node.nodeValue = "";

                        // HACK: OTHERWISE IE WILL GC THE TEXTNODE AND RETURNS YOU
                        // A FRESH TEXTNODE THE NEXT TIME WHERE YOUR EXPANDO
                        // IS NOWHERE TO BE SEEN!
                        if(navigator.userAgent.indexOf('MSIE')>0 || navigator.userAgent.indexOf("Trident")>0) {
                            if(cssRegionsHelpers.listOfTextNodesForIE.indexOf(node)==-1) {
                                cssRegionsHelpers.listOfTextNodesForIE.push(node);
                            }
                        }
                    }

                    break;

                case 1: // Element node
                    if(node.hasAttribute('data-css-regions-cloning')) {
                        node.removeAttribute('data-css-regions-cloning');
                        node.setAttribute('data-css-regions-cloned', true);
						if(node.currentStyle) node.currentStyle.display.toString(); // IEFIX FOR BAD STYLE RECALC
                    }
                    if(typeof(k)=="undefined") return;

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        nodes.forEach(visit);

    },

    //
    // makes emptied text nodes visible again
    //
    unhideTextNodesFromFragmentSource: function(nodes) {

        function visit(node) {
            var child, next;
            switch (node.nodeType) {
                case 3: // Text node

                    // we have to remove their content the hard way...
                    if("cssRegionsSavedNodeValue" in node) {
                        node.nodeValue = node.cssRegionsSavedNodeValue;
                        delete node.cssRegionsSavedNodeValue;
                    }

                    break;

                case 1: // Element node
                    if(typeof(k)=="undefined") return;

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        nodes.forEach(visit);

    },

    //
    // prepares the content elements to return to ther normal css life
    //
    unmarkNodesAsFragmentSource: function(nodes) {

        function visit(node,k) {
            var child, next;
            switch (node.nodeType) {
                case 3: // Text node

                    // we have to reinstall their content the hard way...
                    if("cssRegionsSavedNodeValue" in node) {
                        node.nodeValue = node.cssRegionsSavedNodeValue;
                        delete node.cssRegionsSavedNodeValue;
                    }

                    break;
                case 1: // Element node
                    node.removeAttribute('data-css-regions-cloned');
                    node.removeAttribute('data-css-regions-fragment-source');
					if(node.currentStyle) node.currentStyle.display.toString(); // IEFIX FOR BAD STYLE RECALC
                    if(node.tagName=="OL") cssRegionsHelpers.unexpandListValues(node);
                    if(typeof(k)!="undefined" && node.tagName=="LI") cssRegionsHelpers.unexpandListValues(node.parentNode);

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        nodes.forEach(visit);

    },

    //
    // marks cloned content as fragment instead of as fragment source (basically)
    //
    transformFragmentSourceToFragments: function(nodes) {

        function visit(node) {
            var child, next;
            switch (node.nodeType) {
                case 1: // Element node
                    var id = node.getAttribute('data-css-regions-fragment-source');
                    node.removeAttribute('data-css-regions-fragment-source');
                    node.removeAttribute('data-css-regions-cloning');
                    node.removeAttribute('data-css-regions-cloned');
                    node.setAttribute('data-css-regions-fragment-of', id);
                    if(node.id) node.id += "--fragment";

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        nodes.forEach(visit);

    },

    //
    // removes some invisible text nodes from the tree
    // (useful if you don't want to face browser bugs when dealing with them)
    //
    embedTrailingWhiteSpaceNodes: function(fragment) {

        var onlyWhiteSpace = /^\s*$/;
        function visit(node) {
            var child, next;
            switch (node.nodeType) {
                case 3: // Text node

                    // we only remove nodes at the edges
                    if (!node.previousSibling) {

                        // we only remove nodes if their parent doesn't preserve whitespace
                        if (getComputedStyle(node.parentNode).whiteSpace.substring(0,3)!=="pre") {

                            // only remove pure whitespace nodes
                            if (onlyWhiteSpace.test(node.nodeValue)) {
                                node.parentNode.setAttribute('data-whitespace-before',node.nodeValue);
                                node.parentNode.removeChild(node);
                            }

                        }

                        break;
                    }

                    // we only remove nodes at the edges
                    if (!node.nextSibling) {

                        // we only remove nodes if their parent doesn't preserve whitespace
                        if (getComputedStyle(node.parentNode).whiteSpace.substring(0,3)!=="pre") {

                            // only remove pure whitespace nodes
                            if (onlyWhiteSpace.test(node.nodeValue)) {
                                node.parentNode.setAttribute('data-whitespace-after',node.nodeValue);
                                node.parentNode.removeChild(node);
                            }

                        }

                        break;
                    }

                    break;
                case 1: // Element node
                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        visit(fragment);

    },

    //
    // recover the previously removed invisible text nodes
    //
    unembedTrailingWhiteSpaceNodes: function(fragment) {

        var onlyWhiteSpace = /^\s*$/;
        function visit(node) {
            var child, next;
            switch (node.nodeType) {
                case 1: // Element node
                    var txt = "";
                    if(txt = node.getAttribute('data-whitespace-before')) {
                        if(node.getAttribute('data-starting-fragment')=='' && node.getAttribute('data-special-starting-fragment','')) {
                            node.insertBefore(document.createTextNode(txt),node.firstChild);
                        }
                    }
                    node.removeAttribute('data-whitespace-before')
                    if(txt = node.getAttribute('data-whitespace-after')) {
                        if(node.getAttribute('data-continued-fragment')=='' && node.getAttribute('data-special-continued-fragment','')) {
                            node.insertAfter(document.createTextNode(txt),node.lastChild);
                        }
                    }
                    node.removeAttribute('data-whitespace-after')

                case 9: // Document node
                case 11: // Document fragment node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        visit(child);
                        child = next;
                    }
                    break;
            }
        }

        visit(fragment);

    },

    ///
    /// walk the two trees the same way, and copy all the styles
    /// BEWARE: if the DOMs are different, funny things will happen
    /// NOTE: this function will also remove elements put in another flow
    ///
    copyStyle: function(root1, root2) {

        function visit(node1, node2, isRoot) {
            var child1, next1, child2, next2;
            switch (node1.nodeType) {
                case 1: // Element node

                    // firstly, setup a cache of all css properties on the element
                    var matchedRules = (node1.currentStyle && !window.opera) ? undefined : cssCascade.findAllMatchingRules(node1)

                    // and compute the value of all css properties
                    var properties = cssCascade.allCSSProperties || cssCascade.getAllCSSProperties();
                    for(var p=properties.length; p--; ) {

                        // if the property is computation-safe, use the computed value
                        if(!(properties[p] in cssCascade.computationUnsafeProperties) && properties[p][0]!='-') {
                            var style = getComputedStyle(node1).getPropertyValue(properties[p]);
                            var defaultStyle = cssCascade.getDefaultStyleForTag(node1.tagName).getPropertyValue(properties[p]);
                            if(style != defaultStyle) node2.style.setProperty(properties[p], style) 
                            continue;
                        }

                        // otherwise, get the element's specified value
                        var cssValue = cssCascade.getSpecifiedStyle(node1, properties[p], matchedRules);
                        if(cssValue && cssValue.length) {

                            // if we have a specified value, let's use it
                            node2.style.setProperty(properties[p], cssValue.toCSSString()); 

                        } else if(isRoot && node1.parentNode && properties[p][0] != '-') {

                            // NOTE: the root will be detached from its parent
                            // Therefore, we have to inherit styles from it (oh no!)

                            // TODO: create a list of inherited properties
                            if(!(properties[p] in cssCascade.inheritingProperties)) continue;

                            // if the property is computation-safe, use the computed value
                            if((properties[p]=="font-size") || (!(properties[p] in cssCascade.computationUnsafeProperties) && properties[p][0]!='-')) {
                                var style = getComputedStyle(node1).getPropertyValue(properties[p]);
                                node2.style.setProperty(properties[p], style);
                                //var parentStyle = style; try { parentStyle = getComputedStyle(node1.parentNode).getPropertyValue(properties[p]) } catch(ex){}
                                //var defaultStyle = cssCascade.getDefaultStyleForTag(node1.tagName).getPropertyValue(properties[p]);

                                //if(style === parentStyle) {
                                //  node2.style.setProperty(properties[p], style)
                                //}
                                continue;
                            }

                            // otherwise, get the parent's specified value
                            var cssValue = cssCascade.getSpecifiedStyle(node1, properties[p], matchedRules);
                            if(cssValue && cssValue.length) {

                                // if we have a specified value, let's use it
                                node2.style.setProperty(properties[p], cssValue.toCSSString());

                            }

                        }

                    }

                    // now, let's work on ::after and ::before
                    var importPseudo = function(node1,node2,pseudo) {

                        //
                        // we'll need to use getSpecifiedStyle here as the pseudo thing is slow
                        //
                        var mayExist = !!cssCascade.findAllMatchingRulesWithPseudo(node1,pseudo.substr(1)).length;
                        if(!mayExist) return;

                        var pseudoStyle = getComputedStyle(node1,pseudo);
                        if(pseudoStyle.content!='none'){

                            // let's create a stylesheet for the element
                            var stylesheet = document.createElement('style');
                            stylesheet.setAttribute('data-no-css-polyfill',true);

                            // compute the value of all css properties
                            var node2style = "";
                            var properties = cssCascade.allCSSProperties || cssCascade.getAllCSSProperties();
                            for(var p=properties.length; p--; ) {

                                // we always use the computed value, because we don't have better
                                var style = pseudoStyle.getPropertyValue(properties[p]);
                                node2style += properties[p]+":"+style+";";

                            }

                            stylesheet.textContent = (
                                '[data-css-regions-fragment-of="' + node1.getAttribute('data-css-regions-fragment-source') + '"]'
                                +':not([data-css-regions-starting-fragment]):not([data-css-regions-special-starting-fragment])'
                                +':'+pseudo+'{'
                                +node2style
                                +"}"
                            );

                            // node2.parentNode.insertBefore(stylesheet, node2); // lets not insert this stylesheet - EB

                        }
                    }
                    importPseudo(node1,node2,":before");
                    importPseudo(node1,node2,":after");

                    // retarget events
                    cssRegionsHelpers.retargetEvents(node1,node2);


                case 9: // Document node
                case 11: // Document fragment node
                    child1 = node1.firstChild;
                    child2 = node2.firstChild;
                    while (child1) {
                        next1 = child1.nextSibling;
                        next2 = child2.nextSibling;

                        // decide between process style or hide
                        if(child1.cssRegionsLastFlowIntoName && child1.cssRegionsLastFlowIntoType==="element") {
                            node2.removeChild(child2);
                        } else {
                            visit(child1, child2);
                        }

                        child1 = next1;
                        child2 = next2;
                    }
                    break;
            }
        }

        visit(root1, root2, true);

    },

    //
    // make sure the most critical events still fire in the fragment source
    // even if the browser initially fire them on the fragments
    //
    retargetEvents: function retargetEvents(node1,node2) {

        var retargetEvent = "cssRegionsHelpers.retargetEvent(this,event)";
        // Not required here - EB
        // node2.setAttribute("onclick", retargetEvent);
        // node2.setAttribute("ondblclick", retargetEvent);
        // node2.setAttribute("onmousedown", retargetEvent);
        // node2.setAttribute("onmouseup", retargetEvent);
        // node2.setAttribute("onmousein", retargetEvent);
        // node2.setAttribute("onmouseout", retargetEvent);
        // node2.setAttribute("onmouseenter", retargetEvent);
        // node2.setAttribute("onmouseleave", retargetEvent);

    },

    //
    // single hub for event retargeting operations.
    //
    retargetEvent: function retargeEvent(node2,e) {

        // get the node we should fire the event on
        var node1 = (
            (node2.cssRegionsFragmentSource) ||
            (node2.cssRegionsFragmentSource=document.querySelector('[data-css-regions-fragment-source="' + node2.getAttribute('data-css-regions-fragment-of') + '"]'))
        );

        if(node1) {

            // dispatch the event on the real node
            var ne = basicObjectModel.cloneEvent(e);
            node1.dispatchEvent(ne);

            // prevent the event to fire on the region
            e.stopImmediatePropagation ? e.stopImmediatePropagation() : e.stopPropagation();

            // make sure to cancel the event if required
            if(ne.isDefaultPrevented || ne.defaultPrevented) { e.preventDefault(); return false; }

        }

    }
}
"use strict";

///
/// now create a module for region reflow
///

var cssRegions = {


    //
    // this function is at the heart of the region polyfill
    // it will iteratively fill a list of regions until no
    // content or no region is left
    //
    // the before-overflow size of a region is determined by
    // adding all content to it and comparing his offsetHeight
    // and his scrollHeight
    //
    // when this is done, we use dom ranges to detect the point
    // where the content exceed this box and we split the fragment
    // at that point.
    //
    // when splitting inside an element, the borders, paddings and
    // generated content must be tied to the right fragments which
    // require some code
    //
    // this functions returns whether some content was still remaining
    // when the flow when the last region was filled. please not this
    // can only happen if this last region has "region-fragment" set
    // to break, otherwhise all the content will automatically overflow
    // this last region.
    //
    layoutContent: function(regions, remainingContent, callback, startTime) {

        //
        // this function will iteratively fill all the regions
        // when we reach the last region, we return the overset status
        //

        // validate args
        if(!regions) return callback.ondone(!!remainingContent.hasChildNodes());
        if(!regions.length) return callback.ondone(!!remainingContent.hasChildNodes());
        if(!startTime) startTime = Date.now();

        // get the next region
        var region = regions.pop();

        // NOTE: while we don't monitor that, and it can therefore become inacurate
        // I'm going to follow the spec and refuse to mark as region inline/none elements]
        while(true) {
            var regionDisplay = getComputedStyle(region).display;
            if(regionDisplay == "none" || regionDisplay.indexOf("inline") !== -1) {
                if(region = regions.pop()) { continue } else { return callback.ondone(!!remainingContent.hasChildNodes()) };
            } else {
                break;
            }
        }

        // the polyfill actually use a <cssregion> wrapper
        // we need to link this wrapper and the actual region
        if(region.cssRegionsWrapper) {
            region.cssRegionsWrapper.cssRegionHost = region;
            region = region.cssRegionsWrapper;
        } else {
            region.cssRegionHost = region;
        }

        // empty the region
        region.innerHTML = '';

        // avoid doing the layout of empty regions
        if(!remainingContent.hasChildNodes()) {

            region.cssRegionHost.cssRegionsLastOffsetHeight = region.cssRegionHost.offsetHeight;
            region.cssRegionHost.cssRegionsLastOffsetWidth = region.cssRegionHost.offsetWidth;

            region.cssRegionHost.regionOverset = 'empty';

			var dummyCallback = { ondone:function(){}, onprogress:function(f){f()} };
            cssRegions.layoutContent(regions, remainingContent, dummyCallback, startTime);

            return callback.ondone(false);

        }

        // append the remaining content to the region
        region.appendChild(remainingContent);

        // check if we have more regions to process
        if(regions.length !== 0) {

            return this.layoutContentInNextRegionsWhenReady(region, regions, remainingContent, callback, startTime);

        } else {

            return this.layoutContentInLastRegionWhenReady(region, regions, remainingContent, callback, startTime);

        }

    },

	layoutContentInNextRegionsWhenReady: function(region, regions, remainingContent, callback, startTime) {

		// delays until all images are loaded
		var imgs = region.getElementsByTagName('img');
		for(var imgs_index=imgs.length; imgs_index--; ) {
			if(!imgs[imgs_index].complete && !imgs[imgs_index].hasAttribute('height')) {
				return setTimeout(
					function() {
		            	this.layoutContentInNextRegionsWhenReady(region, regions, remainingContent, callback, startTime+32);
					}.bind(this),
					16
				);
			}
		}

        // check if there was an overflow or some break-before/after instruction
		var regionDidOverflow = region.cssRegionHost.scrollHeight != region.cssRegionHost.offsetHeight;
		var shouldSegmentContent = regionDidOverflow;
		if(!shouldSegmentContent) {
			var first = region.firstElementChild;
			var last = region.lastElementChild;
			var current = first;
			while(current) {

				if(current != first) {
                    if(/(region|all|always)/i.test(cssCascade.getSpecifiedStyle(current,'break-before',undefined,true).toCSSString())) {
                        shouldSegmentContent = true; break;
                    }
                }

				if(current != last) {
                    if(/(region|all|always)/i.test(cssCascade.getSpecifiedStyle(current,'break-after',undefined,true).toCSSString())) {
                        current = current.nextElementSibling;
						shouldSegmentContent = true; break;
                    }
                }

				current = current.nextElementSibling;
			}
		}


        if(shouldSegmentContent) {

            // the remaining content is what was overflowing
            remainingContent = this.extractOverflowingContent(region);

        } else {

            // there's nothing more to insert
            remainingContent = document.createDocumentFragment();

        }

        // if any content didn't fit
        if(remainingContent.hasChildNodes()) {
            region.cssRegionHost.regionOverset = 'overset';
        } else {
            region.cssRegionHost.regionOverset = 'fit';
        }

        // update flags
        region.cssRegionHost.cssRegionsLastOffsetHeight = region.cssRegionHost.offsetHeight;
        region.cssRegionHost.cssRegionsLastOffsetWidth = region.cssRegionHost.offsetWidth;

        // layout the next regions
        // WE LET THE NEXT REGION DECIDE WHAT TO RETURN
        if(startTime+2 > Date.now()) {// -EB can we make this shorter? changed 200 to 2

            return cssRegions.layoutContent(regions, remainingContent, callback, startTime);

        } else {

            return callback.onprogress(function() {
                cssRegions.layoutContent(regions, remainingContent, callback);
            });

        }

	},

	layoutContentInLastRegionWhenReady: function(region, regions, remainingContent, callback, startTime) {

		// delays until all images are loaded
		var imgs = region.getElementsByTagName('img');
		for(var imgs_index=imgs.length; imgs_index--; ) {
			if(!imgs[imgs_index].complete && !imgs[imgs_index].hasAttribute('height')) {
				return setTimeout(
					function() {
		            	this.layoutContentInLastRegionWhenReady(region, regions, remainingContent, callback, startTime+32);
					}.bind(this),
					32
				);
			}
		}

        // support region-fragment: break
        if(cssCascade.getSpecifiedStyle(region.cssRegionHost,"region-fragment",undefined,true).toCSSString().trim().toLowerCase()=="break") {

            // WE RETURN TRUE IF WE DID OVERFLOW
            var didOverflow = (this.extractOverflowingContent(region).hasChildNodes());

            // update flags
            region.cssRegionHost.cssRegionsLastOffsetHeight = region.cssRegionHost.offsetHeight;
            region.cssRegionHost.cssRegionsLastOffsetWidth = region.cssRegionHost.offsetWidth;

            return callback.ondone(didOverflow);

        } else {

            // update flags
            region.cssRegionHost.cssRegionsLastOffsetHeight = region.cssRegionHost.offsetHeight;
            region.cssRegionHost.cssRegionsLastOffsetWidth = region.cssRegionHost.offsetWidth;

            // WE RETURN FALSE IF WE DIDN'T OVERFLOW
            return callback.ondone(region.cssRegionHost.offsetHeight != region.cssRegionHost.scrollHeight);

        }
	},


    //
    // this function returns a document fragment containing the content
    // that didn't fit in a particular <cssregion> element.
    //
    // in the simplest cases, we can just use hit-targeting to get very
    // close the the natural breaking point. for mostly textual flows,
    // this works perfectly, for the others, we may need some tweaks.
    //
    // there's a code detecting whether this hit-target optimization
    // did possibly fail, in which case we return to a setup where we
    // start from scratch.
    //
    extractOverflowingContent: function(region, dontOptimize) {

        // make sure empty nodes don't make our life more difficult
        cssRegionsHelpers.embedTrailingWhiteSpaceNodes(region);

        // get the region layout
        var sizingH = region.cssRegionHost.offsetHeight; // avail size (max-height)
        var sizingW = region.cssRegionHost.offsetWidth; // avail size (max-width)
        var pos = region.cssRegionHost.getBoundingClientRect(); // avail size?
        pos = {top: pos.top, bottom: pos.bottom, left: pos.left, right: pos.right};

        // substract from the bottom any border/padding of the region
        var lostHeight = parseInt(getComputedStyle(region.cssRegionHost).paddingBottom);
        lostHeight += parseInt(getComputedStyle(region.cssRegionHost).borderBottomWidth);
        pos.bottom -= lostHeight; sizingH -= lostHeight;

        //
        // note: let's use hit targeting to find a dom range
        // which is close to the location where we will need to
        // break the content into fragments
        //

        // get the caret range for the bottom-right of that location
        try {
            var r = dontOptimize ? document.createRange() : document.caretRangeFromPoint(
                pos.left + sizingW - 1,
                pos.top + sizingH - 1
            );
        } catch (ex) {
            try {
                cssConsole.error(ex.message);
                cssConsole.dir(ex);
            } catch (ex) {}
        }

        // helper for logging info
        /*cssConsole.log("extracting overflow")
        cssConsole.log(pos.bottom)*/
        var debug = function() {
            /*cssConsole.dir({
                startContainer: r.startContainer,
                startOffset: r.startOffset,
                browserBCR: r.getBoundingClientRect(),
                computedBCR: rect
            });*/
        }

        var fixNullRect = function() {
            if(rect.bottom==0 && rect.top==0 && rect.left==0 && rect.right==0) {

				var scrollTop = -(document.documentElement.scrollTop || document.body.scrollTop);
				var scrollLeft = -(document.documentElement.scrollLeft || document.body.scrollLeft);

                rect = {
                    width: 0,
                    heigth: 0,
                    top: scrollTop,
                    bottom: scrollTop,
                    left: scrollLeft,
                    right: scrollLeft
                }
            }
        }

        // if the caret is outside the region
        if(!r || (region !== r.endContainer && !Node.contains(region,r.endContainer))) {

            // if the caret is after the region wrapper but inside the host...
            if(r && r.endContainer === region.cssRegionHost && r.endOffset==r.endContainer.childNodes.length) {

                // move back at the end of the region, actually
                r.setEnd(region, region.childNodes.length);

            } else {

                // move back into the region
                r = r || document.createRange();
                r.setStart(region, 0);
                r.setEnd(region, 0);
                dontOptimize=true;

            }
        }

        // start finding the natural breaking point
        do {

            // store the current selection rect for fast access
            var rect = r.myGetExtensionRect(); fixNullRect();
            debug();

            //
            // note: maybe the text is right-to-left
            // in this case, we can go further than the caret
            //

            // move the end point char by char until it's completely in the region
            while(!(r.endContainer==region && r.endOffset==r.endContainer.childNodes.length) && rect.bottom<=pos.top+sizingH) {

                debug();

                // look if we can optimize by moving fast forward
                var nextSibling = r.endContainer.childNodes[r.endOffset];
                var nextSiblingRect = !nextSibling || Node.getBoundingClientRect(nextSibling);
                if(nextSibling && nextSiblingRect.bottom<=pos.top+sizingH) {

                    // if yes, move element by element
                    r.setStartAfter(nextSibling)
                    r.setEndAfter(nextSibling)
                    rect = nextSiblingRect
                    fixNullRect()

                } else {

                    // otherwise, go char-by-char
                    r.myMoveTowardRight(); rect = r.myGetExtensionRect(); fixNullRect();

                }
            }

            //
            // note: maybe the text is one line too big
            // in this case, we have to backtrack a little
            //

            // move the end point char by char until it's completely in the region
            while(!(r.endContainer==region && r.endOffset==0) && rect.bottom>pos.top+sizingH) {
                debug(); r.myMoveOneCharLeft(); rect = r.myGetExtensionRect(); fixNullRect();
            }

            debug()

            //
            // note: if we optimized via hit-testing, this may be wrong
            // if next condition does not hold, we're fine.
            // otherwhise we must restart without optimization...
            //

            // if the selected content is possibly off-target
            var optimizationFailled = false; if(!dontOptimize) {

                var current = r.endContainer;
                while(current = cssRegionsHelpers.getAllLevelPreviousSibling(current, region)) {
                    if(Node.getBoundingClientRect(current).bottom > pos.top + sizingH) {
                        r.setStart(region,0);
                        r.setEnd(region,0);
                        optimizationFailled=true;
                        dontOptimize=true;
                        break;
                    }
                }

            }

        } while(optimizationFailled)

        //
        // note: we should not break the content inside monolithic content
        // if we do, we need to change the selection to avoid that
        //

        // move the selection before the monolithic ancestors
        var current = r.endContainer;
        while(current !== region) {
            if(cssBreak.isMonolithic(current)) {
                r.setEndBefore(current);
            }
            current = current.parentNode;
        }

        // if the selection is not in the region anymore, add the whole region
        if(!r || (region !== r.endContainer && !Node.contains(region,r.endContainer))) {
            cssConsole.dir(r.cloneRange()); debugger;
            r.setStart(region,region.childNodes.length);
            r.setEnd(region,region.childNodes.length);
        }

        //
        // note: we don't want to break inside a line.
        // backtrack to end of previous line...
        //
        var first = r.startContainer.childNodes[r.startOffset], current = first;
        if(cssBreak.hasAnyInlineFlow(r.startContainer)) {
            while((current) && (current = current.previousSibling)) {

                if(cssBreak.areInSameSingleLine(current,first)) {

                    // optimization: first and current are on the same line
                    // so if next and current are not the same line, it will still be
                    // the same line the "first" element is in
                    first = current;

                    if(current instanceof Element) {

                        // we don't want to break inside text lines
                        r.setEndBefore(current);

                    } else {

                        // get last line via client rects
                        var lines = Node.getClientRects(current);

                        // if the text node did wrap into multiple lines
                        if(lines.length>1) {

                            // move back from the end until we get into previous line
                            var previousLineBottom = lines[lines.length-2].bottom;
                            r.setEnd(current, current.nodeValue.length);
                            while(rect.bottom>previousLineBottom) {
                                r.myMoveOneCharLeft(); rect = r.myGetExtensionRect(); fixNullRect();
                            }

                            // make sure we didn't exit the text node by mistake
                            if(r.endContainer!==current) {
                                // if we did, there's something wrong about the text node
                                // but we can consider the text node as an element instead
                                r.setEndBefore(current); // debugger;
                            }

                        } else {

                            // we can consider the text node as an element
                            r.setEndBefore(current);

                        }

                    }
                } else {

                    // if the two elements are not on the same line,
                    // then we just found a line break!
                    break;

                }

            }
        }

        // if the selection is not in the region anymore, add the whole region
        if(!r || (region !== r.endContainer && !Node.contains(region,r.endContainer))) {
            cssConsole.dir(r.cloneRange()); debugger;
            r.setStart(region,region.childNodes.length);
            r.setEnd(region,region.childNodes.length);
        }


        //
        // note: the css-break spec says that a region should not be emtpy
        //

        // if we end up with nothing being selected, add the first block anyway
        if(r.endContainer===region && r.endOffset===0 && r.endOffset!==region.childNodes.length) {

            // find the first allowed break point
            do {

                //cssConsole.dir(r.cloneRange());

                // move the position char-by-char
                r.myMoveTowardRight();

                // but skip long islands of monolithic elements
                // since we know we cannot break inside them anyway
                var current = r.endContainer;
                while(current && current !== region) {
                    if(cssBreak.isMonolithic(current)) {
                        r.setStartAfter(current);
                        r.setEndAfter(current);
                    }
                    current = current.parentNode;
                }

            }
            // do that until we reach a possible break point, or the end of the element
            while(!cssBreak.isPossibleBreakPoint(r,region) && !(r.endContainer===region && r.endOffset===region.childNodes.length))

        }

        // if the selection is not in the region anymore, add the whole region
        if(!r || region !== r.endContainer && !Node.contains(region,r.endContainer)) {
            cssConsole.dir(r.cloneRange()); debugger;
            r.setStart(region,region.childNodes.length);
            r.setEnd(region,region.childNodes.length);
        }

        // now, let's try to find a break-before/break-after element before the splitting point
        var current = r.endContainer;
        if (current.hasChildNodes()) {
            current = current.childNodes[r.endOffset-1];
            // if (n) current = n; // - EB maybe fixes error?
        };
        var first = r.endContainer.firstChild;
        do {
            if(current.style) {

                if(current != first) {
                    if(/(region|all|always)/i.test(cssCascade.getSpecifiedStyle(current,'break-before',undefined,true).toCSSString())) {
                        r.setStartBefore(current);
                        r.setEndBefore(current);
                        dontOptimize=true; // no algo involved in breaking, after all
                    }
                }

                if(current !== region) {
                    if(/(region|all|always)/i.test(cssCascade.getSpecifiedStyle(current,'break-after',undefined,true).toCSSString())) {
                        r.setStartAfter(current);
                        r.setEndAfter(current);
                        dontOptimize=true; // no algo involved in breaking, after all
                    }
                }

            }
        } while(current = cssRegionsHelpers.getAllLevelPreviousSibling(current, region));

        // we're almost done! now, let's collect the ancestors to make some splitting postprocessing
        var current = r.endContainer; var allAncestors=[];
        if(current.nodeType !== current.ELEMENT_NODE) current=current.parentNode;
        while(current !== region) {
            allAncestors.push(current);
            current = current.parentNode;
        }

        //
        // note: if we're about to split after the last child of
        // an element which has bottom-{padding/border/margin},
        // we need to figure how how much of that p/b/m we can
        // actually keep in the first fragment
        //
        // TODO: avoid top & bottom p/b/m cuttings to use the
        // same variables names, it's ugly
        //

        // split bottom-{margin/border/padding} correctly
        if(r.endOffset == r.endContainer.childNodes.length && r.endContainer !== region) {

            // compute how much of the bottom border can actually fit
            var box = r.endContainer.getBoundingClientRect();
            var excessHeight = box.bottom - (pos.top + sizingH);
            var endContainerStyle = getComputedStyle(r.endContainer);
            var availBorderHeight = parseFloat(endContainerStyle.borderBottomWidth);
            var availPaddingHeight = parseFloat(endContainerStyle.paddingBottom);

            // start by cutting into the border
            var borderCut = excessHeight;
            if(excessHeight > availBorderHeight) {
                borderCut = availBorderHeight;
                excessHeight -= borderCut;

                // continue by cutting into the padding
                var paddingCut = excessHeight;
                if(paddingCut > availPaddingHeight) {
                    paddingCut = availPaddingHeight;
                    excessHeight -= paddingCut;
                } else {
                    excessHeight = 0;
                }
            } else {
                excessHeight = 0;
            }


            // we don't cut borders with radiuses
            // TODO: accept to cut the content not affected by the radius
            if(typeof(borderCut)==="number" && borderCut!==0) {

                // check the presence of a radius:
                var hasBottomRadius = (
                    parseInt(endContainerStyle.borderBottomLeftRadius)>0
                    || parseInt(endContainerStyle.borderBottomRightRadius)>0
                );

                if(hasBottomRadius) {
                    // break before the whole border:
                    borderCut = availBorderHeight;
                }

            }

        }


        // split top-{margin/border/padding} correctly
        if(r.endOffset == 0 && r.endContainer !== region) {

            // note: the only possibility here is that we
            // did split after a padding or a border.
            //
            // it can only happen if the border/padding is
            // too big to fit the region but is actually
            // the first break we could find!

            // compute how much of the top border can actually fit
            var box = r.endContainer.getBoundingClientRect();
            var availHeight = (pos.top + sizingH) - pos.top;
            var endContainerStyle = getComputedStyle(r.endContainer);
            var availBorderHeight = parseFloat(endContainerStyle.borderTopWidth);
            var availPaddingHeight = parseFloat(endContainerStyle.paddingTop);
            var excessHeight = availBorderHeight + availPaddingHeight - availHeight;

            if(excessHeight > 0) {

                // start by cutting into the padding
                var topPaddingCut = excessHeight;
                if(excessHeight > availPaddingHeight) {
                    topPaddingCut = availPaddingHeight;
                    excessHeight -= topPaddingCut;

                    // continue by cutting into the border
                    var topBorderCut = excessHeight;
                    if(topBorderCut > availBorderHeight) {
                        topBorderCut = availBorderHeight;
                        excessHeight -= topBorderCut;
                    } else {
                        excessHeight = 0;
                    }
                } else {
                    excessHeight = 0;
                }

            }

        }

        // remove bottom-{pbm} from all ancestors involved in the cut
        for(var i=allAncestors.length-1; i>=0; i--) {
            allAncestors[i].setAttribute('data-css-continued-fragment',true);
			if(getComputedStyle(allAncestors[i]).display.indexOf('block')>=0) {
				allAncestors[i].setAttribute('data-css-continued-block-fragment',true);
			}
        }
        if(typeof(borderCut)==="number") {
            allAncestors[0].removeAttribute('data-css-continued-fragment');
            allAncestors[0].setAttribute('data-css-special-continued-fragment',true);
            allAncestors[0].style.borderBottomWidth = (availBorderHeight-borderCut)+'px';
        }
        if(typeof(paddingCut)==="number") {
            allAncestors[0].removeAttribute('data-css-continued-fragment');
            allAncestors[0].setAttribute('data-css-special-continued-fragment',true);
            allAncestors[0].style.paddingBottom = (availPaddingHeight-paddingCut)+'px';
        }
        if(typeof(topBorderCut)==="number") {
            allAncestors[0].removeAttribute('data-css-continued-fragment');
            allAncestors[0].setAttribute('data-css-continued-fragment',true);
            allAncestors[0].style.borderTopWidth = (availBorderHeight-topBorderCut)+'px';
        }
        if(typeof(topPaddingCut)==="number") {
            allAncestors[0].removeAttribute('data-css-continued-fragment');
            allAncestors[0].setAttribute('data-css-special-continued-fragment',true);
            allAncestors[0].style.paddingTop = (availPaddingHeight-topPaddingCut)+'px';
        }


        //
        // note: at this point we have a collapsed range
        // located at the split point
        //

        // select the overflowing content
        r.setEnd(region, region.childNodes.length);

        // extract it from the current region
        var overflowingContent = r.extractContents();


        //
        // note: now we have to cancel out the artifacts of
        // the fragments cloning algorithm...
        //

        // do not forget to remove any top p/b/m on cut elements
        var newFragments = overflowingContent.querySelectorAll("[data-css-continued-fragment]");
        for(var i=newFragments.length; i--;) { // TODO: optimize by using while loop and a simple matchesSelector.
            newFragments[i].removeAttribute('data-css-continued-fragment')
            newFragments[i].setAttribute('data-css-starting-fragment',true);
        }

        // deduct any already-used bottom p/b/m
        var specialNewFragment = overflowingContent.querySelector('[data-css-special-continued-fragment]');
        if(specialNewFragment) {
            specialNewFragment.removeAttribute('data-css-special-continued-fragment')
            specialNewFragment.setAttribute('data-css-starting-fragment',true);

            if(typeof(borderCut)==="number") {
                specialNewFragment.style.borderBottomWidth = (borderCut)+'px';
            }
            if(typeof(paddingCut)==="number") {
                specialNewFragment.style.paddingBottom = (paddingCut);
            } else {
                specialNewFragment.style.paddingBottom = '0px';
            }

            if(typeof(topBorderCut)==="number") {
                specialNewFragment.removeAttribute('data-css-starting-fragment')
                specialNewFragment.setAttribute('data-css-special-starting-fragment',true);
                specialNewFragment.style.borderTopWidth = (topBorderCut)+'px';
            }
            if(typeof(topPaddingCut)==="number") {
                specialNewFragment.removeAttribute('data-css-starting-fragment')
                specialNewFragment.setAttribute('data-css-special-starting-fragment',true);
                specialNewFragment.style.paddingTop = (topPaddingCut)+'px';
                specialNewFragment.style.paddingBottom = '0px';
                specialNewFragment.style.borderBottomWidth = '0px';
            }

        } else if(typeof(borderCut)==="number") {

            // hum... there's an element missing here... {never happens anymore}
            try { throw new Error() }
            catch(ex) { setImmediate(function() { throw ex; }) }

        } else if(typeof(topPaddingCut)==="number") {

            // hum... there's an element missing here... {never happens anymore}
            try { throw new Error() }
            catch(ex) { setImmediate(function() { throw ex; }) }

        }


        // make sure empty nodes are reintroduced
        cssRegionsHelpers.unembedTrailingWhiteSpaceNodes(region);
        cssRegionsHelpers.unembedTrailingWhiteSpaceNodes(overflowingContent);

        // we're ready to return our result!
        return overflowingContent;

    },

    enablePolyfill: function enablePolyfill() {

        //
        // [0] insert necessary css
        //
        var s = document.createElement('style');
        s.setAttribute("data-css-no-polyfill", true);
        s.textContent = "cssregion,[data-css-region]>*,[data-css-regions-fragment-source]:not([data-css-regions-cloning]),[data-css-regions-fragment-source][data-css-regions-cloned]{display:none !important}[data-css-region]>cssregion:last-of-type{display:inline !important}[data-css-region]{content:normal !important}[data-css-special-continued-fragment]{counter-reset:none !important;counter-increment:none !important;margin-bottom:0 !important;border-bottom-left-radius:0 !important;border-bottom-right-radius:0 !important}[data-css-continued-fragment]{counter-reset:none !important;counter-increment:none !important;margin-bottom:0 !important;padding-bottom:0 !important;border-bottom:none !important;border-bottom-left-radius:0 !important;border-bottom-right-radius:0 !important}[data-css-continued-fragment]::after{content:none !important;display:none !important}[data-css-special-starting-fragment]{text-indent:0 !important;margin-top:0 !important}[data-css-starting-fragment]{text-indent:0 !important;margin-top:0 !important;padding-top:0 !important;border-top:none !important;border-top-left-radius:0 !important;border-top-right-radius:0 !important}[data-css-starting-fragment]::before{content:none !important;display:none !important}[data-css-continued-block-fragment][data-css-continued-fragment]::after{content:'' !important;display:inline-block !important;width:100% !important;height:0px !important;}";
        var head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(s);

        //
        // [1] when any update happens:
        // construct new content and region flow pairs
        // restart the region layout algorithm for the modified pairs
        //
        cssCascade.startMonitoringProperties(
            ["flow-into","flow-from","region-fragment"],
            {
                onupdate: function onupdate(element, rule) {

                    // let's just ignore fragments
                    if(element.getAttributeNode('data-css-regions-fragment-of')) return;

                    // log some message in the console for debug
                    cssConsole.dir({message:"onupdate",element:element,selector:rule.selector.toCSSString(),rule:rule});
                    var temp = null;

                    //
                    // compute the value of region properties
                    //
                    var flowInto = (
                        cssCascade.getSpecifiedStyle(element, "flow-into")
                        .filter(function(t) { return t instanceof cssSyntax.IdentifierToken })
                    );

                    var flowIntoName = flowInto[0] ? flowInto[0].toCSSString().toLowerCase() : "";
                    if(flowIntoName=="none"||flowIntoName=="initial"||flowIntoName=="inherit"||flowIntoName=="default") {flowIntoName=""}
                    var flowIntoType = flowInto[1] ? flowInto[1].toCSSString().toLowerCase() : "";
                    if(flowIntoType!="content") {flowIntoType="element"}
                    var flowInto = flowIntoName ? flowIntoName + " " + flowIntoType : "";

                    var flowFrom = (
                        cssCascade.getSpecifiedStyle(element, "flow-from")
                        .filter(function(t) { return t instanceof cssSyntax.IdentifierToken })
                    );

                    var flowFromName = flowFrom[0] ? flowFrom[0].toCSSString().toLowerCase() : "";
                    if(flowFromName=="none"||flowFromName=="initial"||flowFromName=="inherit"||flowFromName=="default") {flowFromName=""}
                    var flowFrom = flowFromName;

                    //
                    // if the value of any property did change...
                    //
                    if(element.cssRegionsLastFlowInto != flowInto || element.cssRegionsLastFlowFrom != flowFrom) {

                        // remove the element from previous regions
                        var regionOverset = element.regionOverset;
                        var lastFlowFrom = (cssRegions.flows[element.cssRegionsLastFlowFromName]);
                        var lastFlowInto = (cssRegions.flows[element.cssRegionsLastFlowIntoName]);
                        lastFlowFrom && lastFlowFrom.removeFromRegions(element);
                        lastFlowInto && lastFlowInto.removeFromContent(element);

                        // relayout those regions
                        // (it's async so it will wait for us
                        // to add the element back if needed)
                        lastFlowFrom && regionOverset!='empty' && lastFlowFrom.relayout();
                        lastFlowInto && lastFlowInto.relayout();

                        // save some property values for later
                        element.cssRegionsLastFlowInto = flowInto;
                        element.cssRegionsLastFlowFrom = flowFrom;
                        element.cssRegionsLastFlowIntoName = flowIntoName;
                        element.cssRegionsLastFlowFromName = flowFromName;
                        element.cssRegionsLastFlowIntoType = flowIntoType;

                        // add the element to new regions
                        // and relayout those regions, if deemed necessary
                        if(flowFromName) {
                            var lastFlowFrom = (cssRegions.flows[flowFromName] = cssRegions.flows[flowFromName] || new cssRegions.Flow(flowFromName));
                            lastFlowFrom && lastFlowFrom.addToRegions(element);
                            lastFlowFrom && lastFlowFrom.relayout();
                        }
                        if(flowIntoName) {
                            var lastFlowInto = (cssRegions.flows[flowIntoName] = cssRegions.flows[flowIntoName] || new cssRegions.Flow(flowIntoName));
                            lastFlowInto && lastFlowInto.addToContent(element);
                            lastFlowInto && lastFlowInto.relayout();
                        }

                    }

                }
            }
        );
        cssCascade.startMonitoringProperties(
            ["break-before","break-after"],
            {onupdate:function(element){

                // avoid fragments triggering update loops
                if(element.getAttribute('data-css-regions-fragment-of')){return;}

                // update parent regions
                while(element) {
                    if(element.cssRegionsLastFlowIntoName) {
                        cssRegions.flows[element.cssRegionsLastFlowIntoName].relayout();
                        return;
                    }
                    element=element.parentNode;
                }

            }}
        );


        //
        // [2] perform the OM exports
        //
        cssRegions.enablePolyfillObjectModel();

        //
        // [3] make sure to update the region layout when all images loaded
        //
        window.addEventListener("load",
            function() {
                var flows = document.getNamedFlows();
                for(var i=0; i<flows.length; i++) {
                    flows[i].relayout();
                }
            }
        );

        //
        // [4] make sure we react to window resizes
        //
        //
        var lastWindowResize = 0;
        var relayoutModifiedFlows = function() {

            // specify the function did run
            relayoutModifiedFlows.timeout = 0;

            // rerun the layout
            var flows = document.getNamedFlows();
            for(var i=0; i<flows.length; i++) {
                if(flows[i].lastRelayout > lastWindowResize) continue;
                if(flows[i].relayoutInProgress) {
                    flows[i].relayout();
                } else {
                    flows[i].relayoutIfSizeChanged();
                }
            }

        }
        var hasOngoingLayouts = function() {

            var flows = document.getNamedFlows();
            for(var i=0; i<flows.length; i++) {
                if(flows[i].lastRelayout > lastWindowResize) continue;
                if(flows[i].relayoutInProgress) {
                    return true;
                }
            }

            return false;

        }
        var restartOngoingLayouts = function() {

            var flows = document.getNamedFlows();
            for(var i=0; i<flows.length; i++) {
                if(flows[i].lastRelayout > lastWindowResize) continue;
                if(flows[i].relayoutInProgress) {
                    flows[i].relayout();
                }
            }

        }
        window.addEventListener("resize",
            function() {

                // update the last layout flag
                lastWindowResize = +new Date();

                // if we aren't planning a resfresh already
                if(!relayoutModifiedFlows.timeout) {

                    // if we are already busy
                    if(hasOngoingLayouts()) {

                        // restart all layouts now
                        setTimeout(restartOngoingLayouts, 16);

                        // wait half a second before restarting them from now
                        relayoutModifiedFlows.timeout = setTimeout(relayoutModifiedFlows, 500);

                    } else {

                        // debounce by running the resize code every 200ms
                        relayoutModifiedFlows.timeout = setTimeout(relayoutModifiedFlows, 200);

                    }

                }

            }
        );

    },

    // this dictionnary is supposed to contains all the currently existing flows
    flows: Object.create ? Object.create(null) : {}

};
"use strict";

//
// this class contains flow-relative data field
//
cssRegions.Flow = function NamedFlow(name) {

    // TODO: force immediate relayout if someone ask the overset properties
    // and the layout has been deemed wrong (still isn't a proof of correctness but okay)

    // define the flow name
    this.name = name; Object.defineProperty(this, "name", {get: function() { return name; }});

    // define the overset status
    this.overset = false;

    // define the first empty region
    this.firstEmptyRegionIndex = -1;

    // elements poured into the flow
    this.content = []; this.lastContent = [];

    // elements that consume this flow
    this.regions = []; this.lastRegions = [];

    // event handlers
    this.eventListeners = {
        "regionfragmentchange": [],
        "regionoversetchange": [],
    };

    // this function is used to work with dom event streams
    var This=this; This.update = function(stream) {
        stream.schedule(This.update); This.relayout();
    };

    // register to style changes already
    This.lastStylesheetAdded = 0;
    cssCascade.addEventListener('stylesheetadded', function() {
        if(This.lastStylesheetAdded - Date() > 100) {
            This.lastStylesheetAdded = +Date();
            This.relayout();
        } else {
            cssConsole.warn("Please don't add stylesheets as a response to region events. Operation cancelled.")
        }
    });

    // a small counter to avoid enter retry loops
    This.failedLayoutCount = 0;

    // some other fields
    This.lastEventRAF = 0;
    This.restartLayout = false;
}

cssRegions.Flow.prototype.removeFromContent = function(element) {

    // clean up stuff
    this.removeEventListenersOf(element);

    // remove reference
    var index = this.content.indexOf(element);
    if(index>=0) { this.content.splice(index,1); }

};

cssRegions.Flow.prototype.removeFromRegions = function(element) {

    // clean up stuff
    this.removeEventListenersOf(element);

    // remove reference
    var index = this.regions.indexOf(element);
    if(index>=0) { this.regions.splice(index,1); }

};

cssRegions.Flow.prototype.addToContent = function(element) {

    // walk the tree to find an element inside the content chain
    var content = this.content;
    var treeWalker = document.createTreeWalker(
        document.documentElement,
        NodeFilter.SHOW_ELEMENT,
        function(node) {
            return content.indexOf(node) >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
        false
    );

    // which by the way has to be after the considered element
    treeWalker.currentNode = element;

    // if we find such node
    if(treeWalker.nextNode()) {

        // insert the element at his current location
        content.splice(content.indexOf(treeWalker.currentNode),0,element);

    } else {

        // add the new element to the end of the array
        content.push(element);

    }

};

cssRegions.Flow.prototype.addToRegions = function(element) {

    // walk the tree to find an element inside the region chain
    var regions = this.regions;
    var treeWalker = document.createTreeWalker(
        document.documentElement,
        NodeFilter.SHOW_ELEMENT,
        function(node) {
            return regions.indexOf(node) >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
        false
    );

    // which by the way has to be after the considered element
    treeWalker.currentNode = element;

    // if we find such node
    if(treeWalker.nextNode()) {

        // insert the element at his current location
        regions.splice(this.regions.indexOf(treeWalker.currentNode),0,element);

    } else {

        // add the new element to the end of the array
        regions.push(element);
    }

};

cssRegions.Flow.prototype.generateContentFragment = function() {
    var fragment = document.createDocumentFragment(); var This=this;

    // add copies of all due content
    for(var i=0; i<this.content.length; i++) {
        var element = this.content[i];

        //
        // STEP 1: IDENTIFY FRAGMENT SOURCES AS SUCH
        //
        cssRegionsHelpers.markNodesAsFragmentSource([element], element.cssRegionsLastFlowIntoType=="content");


        //
        // STEP 2: CLONE THE FRAGMENT SOURCES
        //

        // depending on the requested behavior
        if(element.cssRegionsLastFlowIntoType=="element") {

                // add the element
                var el = element;
                var elClone = el.cloneNode(true);
                var elToInsert = elClone; if(elToInsert.tagName=="LI") {
                    elToInsert = document.createElement(el.parentNode.tagName);
                    elToInsert.style.margin="0";
                    elToInsert.style.padding="0";
                    elToInsert.appendChild(elClone);
                }
                fragment.appendChild(elToInsert);

                // clone the style
                cssRegionsHelpers.copyStyle(el, elClone);

        } else {

            // add current children
            var el = element.firstChild; while(el) {

                // add the element
                var elClone = el.cloneNode(true);
                var elToInsert = elClone; if(elToInsert.tagName=="LI") {
                    elToInsert = document.createElement(el.parentNode.tagName);
                    elToInsert.style.margin="0";
                    elToInsert.style.padding="0";
                    elToInsert.appendChild(elClone);
                }
                fragment.appendChild(elToInsert);

                // clone the style
                cssRegionsHelpers.copyStyle(el, elClone);

                el = el.nextSibling;
            }

        }

    }

    //
    // STEP 3: HIDE TEXT NODES IN FRAGMENT SOURCES
    //
    cssRegionsHelpers.hideTextNodesFromFragmentSource(this.content);

    //
    // STEP 4: CONVERT CLONED FRAGMENT SOURCES INTO TRUE FRAGMENTS
    //
    cssRegionsHelpers.transformFragmentSourceToFragments(
        Array.prototype.slice.call(fragment.childNodes,0)
    )


    //
    // CLONED CONTENT IS READY!
    //
    return fragment;
}

cssRegions.Flow.prototype.relayout = function() {
    var This = this;

    // prevent previous relayouts from eventing
    cancelAnimationFrame(This.lastEventRAF);

    // batch relayout queries
    if(This.relayoutScheduled) { return; }
    if(This.relayoutInProgress) { This.restartLayout=true; return; }

    This.relayoutScheduled = true;
    requestAnimationFrame(function() { This._relayout() }); // This limits event loop to frame rate? - EB
}

cssRegions.Flow.prototype._relayout = function(data){
    var This=this;


    // Cancel immediately if this is running again
    // for some reason - EB
    if (Bindery.isBound) return;


    try {

        //
        // note: it is recommended to look at the beautiful
        // drawings I made before attempting to understand
        // this stuff. If you don't have them, ask me.
        //
        cssConsole.log("starting a new relayout for "+This.name);
        This.relayoutInProgress=true; This.relayoutScheduled=false;
        This.lastRelayout = +new Date();
        //debugger;

        // NOTE: we recover the scroll position in case the browser mess it up
        var docElmScrollTop = data && data.docElmScrollTop ? data.docElmScrollTop : document.documentElement.scrollTop;
        var docBdyScrollTop = data && data.docBdyScrollTop ? data.docBdyScrollTop : document.body.scrollTop;


        //
        // STEP 1: REMOVE PREVIOUS EVENT LISTENERS
        //

        // remove the listeners from everything
        This.removeEventListenersOf(This.lastRegions);
        This.removeEventListenersOf(This.lastContent);
        cancelAnimationFrame(This.lastEventRAF);


        //
        // STEP 2: RESTORE CONTENT/REGIONS TO A CLEAN STATE
        //

        // detect elements being removed of the document
        This.regions = This.regions.filter(function(e) { return document.documentElement.contains(e); })
        This.content = This.content.filter(function(e) { return document.documentElement.contains(e); })

        // cleanup previous layout
        cssRegionsHelpers.unmarkNodesAsRegion(This.lastRegions); This.lastRegions = This.regions.slice(0);
        cssRegionsHelpers.unmarkNodesAsFragmentSource(This.lastContent); This.lastContent = This.content.slice(0);



        //
        // STEP 3: EMPTY ALL REGIONS
        // ADD WRAPPER FOR FLOW CONTENT
        // PREPARE FOR CONTENT CLONING
        //

        // empty all the regions
        cssRegionsHelpers.markNodesAsRegion(This.regions);

        // create a fresh list of the regions
        var regionStack = This.regions.slice(0).reverse();



        //
        // STEP 4: CLONE THE CONTENT
        // ADD METADATA TO CLONED CONTENT
        // HIDE FLOW CONTENT AT INITIAL POSITION
        //

        // create a fresh list of the content
        // compute the style of all source elements
        // generate stylesheets for those rules
        var contentFragment = This.generateContentFragment();



        //
        // STEP 5: POUR CONTENT INTO THE REGIONS
        //

        // layout this stuff
        cssRegions.layoutContent(regionStack, contentFragment, {
			onprogress: function(continueLayout) {


                reportPagesLeft(regionStack.length);

	            // NOTE: we recover the scroll position in case the browser mess it up
	            document.documentElement.scrollTop = docElmScrollTop;
	            document.body.scrollTop = docBdyScrollTop;

				// NOTE: if the current layout goes nowhere, start a new one already
	            if(This.restartLayout) {

		            This.relayoutInProgress = false;
		            This.failedLayoutCount = 0;
	                This.restartLayout = false;
	                This._relayout({
	                	docElmScrollTop: docElmScrollTop,
						docBdyScrollTop: docBdyScrollTop
	                });

	            } else {

					setImmediate(continueLayout);

	            }

			},
            ondone: function onLayoutDone(overset) {

                This.overset = overset;
                This.firstEmptyRegionIndex = This.regions.length-1; while(This.regions[This.firstEmptyRegionIndex]) {

                    // tell whether the region is empty
                    var isEmpty = false;
                    isEmpty = isEmpty || !This.regions[This.firstEmptyRegionIndex].cssRegionsWrapper;
                    isEmpty = isEmpty || !This.regions[This.firstEmptyRegionIndex].cssRegionsWrapper.firstChild;

                    // if the region is not empty
                    if(!isEmpty) {

                        // the first empty region if the next one, if it exists
                        if((++This.firstEmptyRegionIndex)==This.regions.length) {
                            This.firstEmptyRegionIndex = -1;
                        }
                        break;

                    } else {

                        // else, let's try the previous region
                        This.firstEmptyRegionIndex--;

                    }
                }



                //
                // STEP 6: REGISTER TO UPDATE EVENTS
                //

                // make sure regions update are taken in consideration
                if(window.MutationObserver) {
                    This.addEventListenersTo(This.content);
                    This.addEventListenersTo(This.regions);
                } else {
                    // the other browsers don't get this as acurately
                    // but that shouldn't be that of an issue for 99% of the cases
                    setImmediate(function() {
                        This.addEventListenersTo(This.content);
                    });
                }



                //
                // STEP 7: FIRE SOME EVENTS
                //
                if(This.regions.length > 0 && !This.restartLayout) {

                    // before doing anything, let's check our stuff is consistent
                    var isBuggy = false;
                    isBuggy = isBuggy || This.regions.some(function(e) { return !document.documentElement.contains(e); })
                    isBuggy = isBuggy || This.content.some(function(e) { return !document.documentElement.contains(e); })

                    if(isBuggy) {

                        // if we found any bug, we will need to restart a layout
                        cssConsole.warn("Buggy css regions layout: the page changed; we need to restart.");
                        This.restartLayout = true;

                    } else {

                        // if it was okay, let's fire some event
                        This.lastEventRAF = requestAnimationFrame(function() {

                            // TODO: only fire when necessary but...
                            This.dispatchEvent('regionfragmentchange');
                            This.dispatchEvent('regionoversetchange');

                        });

                    }
                }


                // NOTE: we recover the scroll position in case the browser mess it up
                document.documentElement.scrollTop = docElmScrollTop;
                document.body.scrollTop = docBdyScrollTop;

                // mark layout has being done
                This.relayoutInProgress = false;
                This.failedLayoutCount = 0;

                Bindery.bindComplete();

                // restart a layout if a request was queued during the current one
                if(This.restartLayout) {
                    This.restartLayout = false;
                    This.relayout();
                }

            }
        });

    } catch(ex) {

        // sometimes IE fails for no valid reason
        // (other than the page is still loading)
        setImmediate(function() { throw ex; });

        // but we cannot accept to fail, so we need to try again
        // until we finish a complete layout pass...
        This.failedLayoutCount++;
        if(This.failedLayoutCount<7) {requestAnimationFrame(function() { This._relayout() });}
        else {This.failedLayoutCount=0; This.relayoutScheduled=false; This.relayoutInProgress=false; This.restartLayout=false; }

    }
}

cssRegions.Flow.prototype.relayoutIfSizeChanged = function() {

    // go through all regions
    // and see if any did change of size
    var rs = this.regions;
    for(var i=rs.length; i--; ) {
        if(
            rs[i].offsetHeight !== rs[i].cssRegionsLastOffsetHeight
            || rs[i].offsetWidth !== rs[i].cssRegionsLastOffsetWidth
        ) {
            this.relayout(); return;
        }
    }

}

cssRegions.Flow.prototype.addEventListenersTo = function(nodes) {
    var This=this; if(nodes instanceof Element) { nodes=[nodes] }

    nodes.forEach(function(element) {
        if(!element.cssRegionsEventStream) {
            element.cssRegionsEventStream = new myDOMUpdateEventStream({target: element});
            element.cssRegionsEventStream.schedule(This.update);
        }
    });

}

cssRegions.Flow.prototype.removeEventListenersOf = function(nodes) {
    var This=this; if(nodes instanceof Element) { nodes=[nodes] }

    nodes.forEach(function(element) {
        if(element.cssRegionsEventStream) {
            element.cssRegionsEventStream.dispose();
            delete element.cssRegionsEventStream;
        }
    });

}

// alias
cssRegions.NamedFlow = cssRegions.Flow;

// return a disconnected array of the content of a NamedFlow
cssRegions.NamedFlow.prototype.getContent = function getContent() {
    return this.content.slice(0)
}

// return a disconnected array of the regions of a NamedFlow
cssRegions.NamedFlow.prototype.getRegions = function getRegions() {
    return this.regions.slice(0)
}

cssRegions.NamedFlow.prototype.getRegionsByContent = function getRegionsByContent(node) {
    var regions = [];
    var fragments = document.querySelectorAll('[data-css-regions-fragment-of="'+node.getAttribute('data-css-regions-fragment-source')+'"]');
    for (var i=0; i<fragments.length; i++) {

        var current=fragments[i]; do {

            if(current.getAttribute('data-css-region')) {
                regions.push(current); break;
            }

        } while(current=current.parentNode);

    }

    return regions;
}

basicObjectModel.EventTarget.implementsIn(cssRegions.Flow);

//
// this class is a collection of named flows (not an array, sadly)
//
cssRegions.NamedFlowCollection = function NamedFlowCollection() {

    this.length = 0;

}

cssRegions.NamedFlowCollection.prototype.namedItem = function(k) {
    return cssRegions.flows[k] || (cssRegions.flows[k]=new cssRegions.Flow(k));
}


//
// this helper creates the required methods on top of the DOM {ie: public exports}
//
cssRegions.enablePolyfillObjectModel = function() {

    //
    // DOCUMENT INTERFACE
    //

    //
    // returns a static list of active named flows
    //
    document.getNamedFlows = function() {

        var c = new cssRegions.NamedFlowCollection(); var flows = cssRegions.flows;
        for(var flowName in cssRegions.flows) {

            if(Object.prototype.hasOwnProperty.call(flows, flowName)) {

                // only active flows can be included
                if(flows[flowName].content.length!=0 || flows[flowName].regions.length!=0) {
                    c[c.length++] = c[flowName] = flows[flowName];
                }

            }

        }
        return c;

    }

    //
    // returns a live object for any named flow
    //
    document.getNamedFlow = function(flowName) {

        var flows = cssRegions.flows;
        return (flows[flowName] || (flows[flowName]=new cssRegions.NamedFlow(flowName)));

    }

    //
    // ELEMENT INTERFACE
    //
    Object.defineProperties(
        Element.prototype,
        {
            "regionOverset": {
                get: function() {
                    return this._regionOverset || 'fit';
                },
                set: function(value) {
                    this._regionOverset = value;
                }
            },
            "getRegionFlowRanges": {
                value: function getRegionFlowRanges() {
                    return null; // TODO: can we implement that? I think we can't (properly).
                }
            },
            "getComputedRegionStyle": {
                value: function getComputedRegionStyle(element,pseudo) {
                    // TODO: only works while we don't relayout
                    // TODO: only works properly for elements actually in the region
                    var fragment = document.querySelector('[data-css-regions-fragment-of="'+element.getAttribute('data-css-regions-fragment-source')+'"]');
                    if(pseudo) {
                        return getComputedStyle(fragment||element, pseudo);
                    } else {
                        return getComputedStyle(fragment||element);
                    }
                }
            }
        }
    )


    //
    // CSSStyleDeclaration interface
    //
    cssCascade.polyfillStyleInterface('flow-into');
    cssCascade.polyfillStyleInterface('flow-from');
    cssCascade.polyfillStyleInterface('region-fragment');
    cssCascade.polyfillStyleInterface('break-before');
    cssCascade.polyfillStyleInterface('break-after');

}

// load the polyfill immediately if not especially told otherwise
// if(!("cssRegionsManualTrigger" in window)) { cssRegions.enablePolyfill(); }
