/* */ 
"format cjs";
(function(process) {
  (function(window) {
    "use strict";
    if (window.jQuery) {
      return;
    }
    var $ = function(selector, context) {
      return new $.fn.init(selector, context);
    };
    $.isWindow = function(obj) {
      return obj && obj === obj.window;
    };
    $.type = function(obj) {
      if (!obj) {
        return obj + "";
      }
      return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
    };
    $.isArray = Array.isArray || function(obj) {
      return $.type(obj) === "array";
    };
    function isArraylike(obj) {
      var length = obj.length,
          type = $.type(obj);
      if (type === "function" || $.isWindow(obj)) {
        return false;
      }
      if (obj.nodeType === 1 && length) {
        return true;
      }
      return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }
    $.isPlainObject = function(obj) {
      var key;
      if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
        return false;
      }
      try {
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
      } catch (e) {
        return false;
      }
      for (key in obj) {}
      return key === undefined || hasOwn.call(obj, key);
    };
    $.each = function(obj, callback, args) {
      var value,
          i = 0,
          length = obj.length,
          isArray = isArraylike(obj);
      if (args) {
        if (isArray) {
          for (; i < length; i++) {
            value = callback.apply(obj[i], args);
            if (value === false) {
              break;
            }
          }
        } else {
          for (i in obj) {
            if (!obj.hasOwnProperty(i)) {
              continue;
            }
            value = callback.apply(obj[i], args);
            if (value === false) {
              break;
            }
          }
        }
      } else {
        if (isArray) {
          for (; i < length; i++) {
            value = callback.call(obj[i], i, obj[i]);
            if (value === false) {
              break;
            }
          }
        } else {
          for (i in obj) {
            if (!obj.hasOwnProperty(i)) {
              continue;
            }
            value = callback.call(obj[i], i, obj[i]);
            if (value === false) {
              break;
            }
          }
        }
      }
      return obj;
    };
    $.data = function(node, key, value) {
      if (value === undefined) {
        var getId = node[$.expando],
            store = getId && cache[getId];
        if (key === undefined) {
          return store;
        } else if (store) {
          if (key in store) {
            return store[key];
          }
        }
      } else if (key !== undefined) {
        var setId = node[$.expando] || (node[$.expando] = ++$.uuid);
        cache[setId] = cache[setId] || {};
        cache[setId][key] = value;
        return value;
      }
    };
    $.removeData = function(node, keys) {
      var id = node[$.expando],
          store = id && cache[id];
      if (store) {
        if (!keys) {
          delete cache[id];
        } else {
          $.each(keys, function(_, key) {
            delete store[key];
          });
        }
      }
    };
    $.extend = function() {
      var src,
          copyIsArray,
          copy,
          name,
          options,
          clone,
          target = arguments[0] || {},
          i = 1,
          length = arguments.length,
          deep = false;
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[i] || {};
        i++;
      }
      if (typeof target !== "object" && $.type(target) !== "function") {
        target = {};
      }
      if (i === length) {
        target = this;
        i--;
      }
      for (; i < length; i++) {
        if ((options = arguments[i])) {
          for (name in options) {
            if (!options.hasOwnProperty(name)) {
              continue;
            }
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue;
            }
            if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && $.isArray(src) ? src : [];
              } else {
                clone = src && $.isPlainObject(src) ? src : {};
              }
              target[name] = $.extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    };
    $.queue = function(elem, type, data) {
      function $makeArray(arr, results) {
        var ret = results || [];
        if (arr) {
          if (isArraylike(Object(arr))) {
            (function(first, second) {
              var len = +second.length,
                  j = 0,
                  i = first.length;
              while (j < len) {
                first[i++] = second[j++];
              }
              if (len !== len) {
                while (second[j] !== undefined) {
                  first[i++] = second[j++];
                }
              }
              first.length = i;
              return first;
            })(ret, typeof arr === "string" ? [arr] : arr);
          } else {
            [].push.call(ret, arr);
          }
        }
        return ret;
      }
      if (!elem) {
        return;
      }
      type = (type || "fx") + "queue";
      var q = $.data(elem, type);
      if (!data) {
        return q || [];
      }
      if (!q || $.isArray(data)) {
        q = $.data(elem, type, $makeArray(data));
      } else {
        q.push(data);
      }
      return q;
    };
    $.dequeue = function(elems, type) {
      $.each(elems.nodeType ? [elems] : elems, function(i, elem) {
        type = type || "fx";
        var queue = $.queue(elem, type),
            fn = queue.shift();
        if (fn === "inprogress") {
          fn = queue.shift();
        }
        if (fn) {
          if (type === "fx") {
            queue.unshift("inprogress");
          }
          fn.call(elem, function() {
            $.dequeue(elem, type);
          });
        }
      });
    };
    $.fn = $.prototype = {
      init: function(selector) {
        if (selector.nodeType) {
          this[0] = selector;
          return this;
        } else {
          throw new Error("Not a DOM node.");
        }
      },
      offset: function() {
        var box = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {
          top: 0,
          left: 0
        };
        return {
          top: box.top + (window.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
          left: box.left + (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
        };
      },
      position: function() {
        function offsetParentFn(elem) {
          var offsetParent = elem.offsetParent;
          while (offsetParent && offsetParent.nodeName.toLowerCase() !== "html" && offsetParent.style && offsetParent.style.position === "static") {
            offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || document;
        }
        var elem = this[0],
            offsetParent = offsetParentFn(elem),
            offset = this.offset(),
            parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? {
              top: 0,
              left: 0
            } : $(offsetParent).offset();
        offset.top -= parseFloat(elem.style.marginTop) || 0;
        offset.left -= parseFloat(elem.style.marginLeft) || 0;
        if (offsetParent.style) {
          parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0;
          parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0;
        }
        return {
          top: offset.top - parentOffset.top,
          left: offset.left - parentOffset.left
        };
      }
    };
    var cache = {};
    $.expando = "velocity" + (new Date().getTime());
    $.uuid = 0;
    var class2type = {},
        hasOwn = class2type.hasOwnProperty,
        toString = class2type.toString;
    var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0; i < types.length; i++) {
      class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
    }
    $.fn.init.prototype = $.fn;
    window.Velocity = {Utilities: $};
  })(window);
  (function(factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {
      module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
      define(factory);
    } else {
      factory();
    }
  }(function() {
    "use strict";
    return function(global, window, document, undefined) {
      var IE = (function() {
        if (document.documentMode) {
          return document.documentMode;
        } else {
          for (var i = 7; i > 4; i--) {
            var div = document.createElement("div");
            div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";
            if (div.getElementsByTagName("span").length) {
              div = null;
              return i;
            }
          }
        }
        return undefined;
      })();
      var rAFShim = (function() {
        var timeLast = 0;
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
          var timeCurrent = (new Date()).getTime(),
              timeDelta;
          timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
          timeLast = timeCurrent + timeDelta;
          return setTimeout(function() {
            callback(timeCurrent + timeDelta);
          }, timeDelta);
        };
      })();
      var performance = (function() {
        var perf = window.performance || {};
        if (typeof perf.now !== "function") {
          var nowOffset = perf.timing && perf.timing.navigationStart ? perf.timing.navigationStart : (new Date()).getTime();
          perf.now = function() {
            return (new Date()).getTime() - nowOffset;
          };
        }
        return perf;
      })();
      function compactSparseArray(array) {
        var index = -1,
            length = array ? array.length : 0,
            result = [];
        while (++index < length) {
          var value = array[index];
          if (value) {
            result.push(value);
          }
        }
        return result;
      }
      var _slice = (function() {
        var slice = Array.prototype.slice;
        try {
          slice.call(document.documentElement);
          return slice;
        } catch (e) {
          return function(begin, end) {
            var len = this.length;
            if (typeof begin !== "number") {
              begin = 0;
            }
            if (typeof end !== "number") {
              end = len;
            }
            if (this.slice) {
              return slice.call(this, begin, end);
            }
            var i,
                cloned = [],
                start = (begin >= 0) ? begin : Math.max(0, len + begin),
                upTo = end < 0 ? len + end : Math.min(end, len),
                size = upTo - start;
            if (size > 0) {
              cloned = new Array(size);
              if (this.charAt) {
                for (i = 0; i < size; i++) {
                  cloned[i] = this.charAt(start + i);
                }
              } else {
                for (i = 0; i < size; i++) {
                  cloned[i] = this[start + i];
                }
              }
            }
            return cloned;
          };
        }
      })();
      var _inArray = (function() {
        if (Array.prototype.includes) {
          return function(arr, val) {
            return arr.includes(val);
          };
        }
        if (Array.prototype.indexOf) {
          return function(arr, val) {
            return arr.indexOf(val) >= 0;
          };
        }
        return function(arr, val) {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
              return true;
            }
          }
          return false;
        };
      });
      function sanitizeElements(elements) {
        if (Type.isWrapped(elements)) {
          elements = _slice.call(elements);
        } else if (Type.isNode(elements)) {
          elements = [elements];
        }
        return elements;
      }
      var Type = {
        isNumber: function(variable) {
          return (typeof variable === "number");
        },
        isString: function(variable) {
          return (typeof variable === "string");
        },
        isArray: Array.isArray || function(variable) {
          return Object.prototype.toString.call(variable) === "[object Array]";
        },
        isFunction: function(variable) {
          return Object.prototype.toString.call(variable) === "[object Function]";
        },
        isNode: function(variable) {
          return variable && variable.nodeType;
        },
        isWrapped: function(variable) {
          return variable && variable !== window && Type.isNumber(variable.length) && !Type.isString(variable) && !Type.isFunction(variable) && !Type.isNode(variable) && (variable.length === 0 || Type.isNode(variable[0]));
        },
        isSVG: function(variable) {
          return window.SVGElement && (variable instanceof window.SVGElement);
        },
        isEmptyObject: function(variable) {
          for (var name in variable) {
            if (variable.hasOwnProperty(name)) {
              return false;
            }
          }
          return true;
        }
      };
      var $,
          isJQuery = false;
      if (global.fn && global.fn.jquery) {
        $ = global;
        isJQuery = true;
      } else {
        $ = window.Velocity.Utilities;
      }
      if (IE <= 8 && !isJQuery) {
        throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
      } else if (IE <= 7) {
        jQuery.fn.velocity = jQuery.fn.animate;
        return;
      }
      var DURATION_DEFAULT = 400,
          EASING_DEFAULT = "swing";
      var Velocity = {
        State: {
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
          isAndroid: /Android/i.test(navigator.userAgent),
          isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
          isChrome: window.chrome,
          isFirefox: /Firefox/i.test(navigator.userAgent),
          prefixElement: document.createElement("div"),
          prefixMatches: {},
          scrollAnchor: null,
          scrollPropertyLeft: null,
          scrollPropertyTop: null,
          isTicking: false,
          calls: [],
          delayedElements: {count: 0}
        },
        CSS: {},
        Utilities: $,
        Redirects: {},
        Easings: {},
        Promise: window.Promise,
        defaults: {
          queue: "",
          duration: DURATION_DEFAULT,
          easing: EASING_DEFAULT,
          begin: undefined,
          complete: undefined,
          progress: undefined,
          display: undefined,
          visibility: undefined,
          loop: false,
          delay: false,
          mobileHA: true,
          _cacheValues: true,
          promiseRejectEmpty: true
        },
        init: function(element) {
          $.data(element, "velocity", {
            isSVG: Type.isSVG(element),
            isAnimating: false,
            computedStyle: null,
            tweensContainer: null,
            rootPropertyValueCache: {},
            transformCache: {}
          });
        },
        hook: null,
        mock: false,
        version: {
          major: 1,
          minor: 5,
          patch: 0
        },
        debug: false,
        timestamp: true,
        pauseAll: function(queueName) {
          var currentTime = (new Date()).getTime();
          $.each(Velocity.State.calls, function(i, activeCall) {
            if (activeCall) {
              if (queueName !== undefined && ((activeCall[2].queue !== queueName) || (activeCall[2].queue === false))) {
                return true;
              }
              activeCall[5] = {resume: false};
            }
          });
          $.each(Velocity.State.delayedElements, function(k, element) {
            if (!element) {
              return;
            }
            pauseDelayOnElement(element, currentTime);
          });
        },
        resumeAll: function(queueName) {
          var currentTime = (new Date()).getTime();
          $.each(Velocity.State.calls, function(i, activeCall) {
            if (activeCall) {
              if (queueName !== undefined && ((activeCall[2].queue !== queueName) || (activeCall[2].queue === false))) {
                return true;
              }
              if (activeCall[5]) {
                activeCall[5].resume = true;
              }
            }
          });
          $.each(Velocity.State.delayedElements, function(k, element) {
            if (!element) {
              return;
            }
            resumeDelayOnElement(element, currentTime);
          });
        }
      };
      if (window.pageYOffset !== undefined) {
        Velocity.State.scrollAnchor = window;
        Velocity.State.scrollPropertyLeft = "pageXOffset";
        Velocity.State.scrollPropertyTop = "pageYOffset";
      } else {
        Velocity.State.scrollAnchor = document.documentElement || document.body.parentNode || document.body;
        Velocity.State.scrollPropertyLeft = "scrollLeft";
        Velocity.State.scrollPropertyTop = "scrollTop";
      }
      function Data(element) {
        var response = $.data(element, "velocity");
        return response === null ? undefined : response;
      }
      function pauseDelayOnElement(element, currentTime) {
        var data = Data(element);
        if (data && data.delayTimer && !data.delayPaused) {
          data.delayRemaining = data.delay - currentTime + data.delayBegin;
          data.delayPaused = true;
          clearTimeout(data.delayTimer.setTimeout);
        }
      }
      function resumeDelayOnElement(element, currentTime) {
        var data = Data(element);
        if (data && data.delayTimer && data.delayPaused) {
          data.delayPaused = false;
          data.delayTimer.setTimeout = setTimeout(data.delayTimer.next, data.delayRemaining);
        }
      }
      function generateStep(steps) {
        return function(p) {
          return Math.round(p * steps) * (1 / steps);
        };
      }
      function generateBezier(mX1, mY1, mX2, mY2) {
        var NEWTON_ITERATIONS = 4,
            NEWTON_MIN_SLOPE = 0.001,
            SUBDIVISION_PRECISION = 0.0000001,
            SUBDIVISION_MAX_ITERATIONS = 10,
            kSplineTableSize = 11,
            kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
            float32ArraySupported = "Float32Array" in window;
        if (arguments.length !== 4) {
          return false;
        }
        for (var i = 0; i < 4; ++i) {
          if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
            return false;
          }
        }
        mX1 = Math.min(mX1, 1);
        mX2 = Math.min(mX2, 1);
        mX1 = Math.max(mX1, 0);
        mX2 = Math.max(mX2, 0);
        var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
        function A(aA1, aA2) {
          return 1.0 - 3.0 * aA2 + 3.0 * aA1;
        }
        function B(aA1, aA2) {
          return 3.0 * aA2 - 6.0 * aA1;
        }
        function C(aA1) {
          return 3.0 * aA1;
        }
        function calcBezier(aT, aA1, aA2) {
          return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
        }
        function getSlope(aT, aA1, aA2) {
          return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }
        function newtonRaphsonIterate(aX, aGuessT) {
          for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
            var currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
              return aGuessT;
            }
            var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
          }
          return aGuessT;
        }
        function calcSampleValues() {
          for (var i = 0; i < kSplineTableSize; ++i) {
            mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
          }
        }
        function binarySubdivide(aX, aA, aB) {
          var currentX,
              currentT,
              i = 0;
          do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
              aB = currentT;
            } else {
              aA = currentT;
            }
          } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
          return currentT;
        }
        function getTForX(aX) {
          var intervalStart = 0.0,
              currentSample = 1,
              lastSample = kSplineTableSize - 1;
          for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += kSampleStepSize;
          }
          --currentSample;
          var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]),
              guessForT = intervalStart + dist * kSampleStepSize,
              initialSlope = getSlope(guessForT, mX1, mX2);
          if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT);
          } else if (initialSlope === 0.0) {
            return guessForT;
          } else {
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
          }
        }
        var _precomputed = false;
        function precompute() {
          _precomputed = true;
          if (mX1 !== mY1 || mX2 !== mY2) {
            calcSampleValues();
          }
        }
        var f = function(aX) {
          if (!_precomputed) {
            precompute();
          }
          if (mX1 === mY1 && mX2 === mY2) {
            return aX;
          }
          if (aX === 0) {
            return 0;
          }
          if (aX === 1) {
            return 1;
          }
          return calcBezier(getTForX(aX), mY1, mY2);
        };
        f.getControlPoints = function() {
          return [{
            x: mX1,
            y: mY1
          }, {
            x: mX2,
            y: mY2
          }];
        };
        var str = "generateBezier(" + [mX1, mY1, mX2, mY2] + ")";
        f.toString = function() {
          return str;
        };
        return f;
      }
      var generateSpringRK4 = (function() {
        function springAccelerationForState(state) {
          return (-state.tension * state.x) - (state.friction * state.v);
        }
        function springEvaluateStateWithDerivative(initialState, dt, derivative) {
          var state = {
            x: initialState.x + derivative.dx * dt,
            v: initialState.v + derivative.dv * dt,
            tension: initialState.tension,
            friction: initialState.friction
          };
          return {
            dx: state.v,
            dv: springAccelerationForState(state)
          };
        }
        function springIntegrateState(state, dt) {
          var a = {
            dx: state.v,
            dv: springAccelerationForState(state)
          },
              b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
              c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
              d = springEvaluateStateWithDerivative(state, dt, c),
              dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
              dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);
          state.x = state.x + dxdt * dt;
          state.v = state.v + dvdt * dt;
          return state;
        }
        return function springRK4Factory(tension, friction, duration) {
          var initState = {
            x: -1,
            v: 0,
            tension: null,
            friction: null
          },
              path = [0],
              time_lapsed = 0,
              tolerance = 1 / 10000,
              DT = 16 / 1000,
              have_duration,
              dt,
              last_state;
          tension = parseFloat(tension) || 500;
          friction = parseFloat(friction) || 20;
          duration = duration || null;
          initState.tension = tension;
          initState.friction = friction;
          have_duration = duration !== null;
          if (have_duration) {
            time_lapsed = springRK4Factory(tension, friction);
            dt = time_lapsed / duration * DT;
          } else {
            dt = DT;
          }
          while (true) {
            last_state = springIntegrateState(last_state || initState, dt);
            path.push(1 + last_state.x);
            time_lapsed += 16;
            if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
              break;
            }
          }
          return !have_duration ? time_lapsed : function(percentComplete) {
            return path[(percentComplete * (path.length - 1)) | 0];
          };
        };
      }());
      Velocity.Easings = {
        linear: function(p) {
          return p;
        },
        swing: function(p) {
          return 0.5 - Math.cos(p * Math.PI) / 2;
        },
        spring: function(p) {
          return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
        }
      };
      $.each([["ease", [0.25, 0.1, 0.25, 1.0]], ["ease-in", [0.42, 0.0, 1.00, 1.0]], ["ease-out", [0.00, 0.0, 0.58, 1.0]], ["ease-in-out", [0.42, 0.0, 0.58, 1.0]], ["easeInSine", [0.47, 0, 0.745, 0.715]], ["easeOutSine", [0.39, 0.575, 0.565, 1]], ["easeInOutSine", [0.445, 0.05, 0.55, 0.95]], ["easeInQuad", [0.55, 0.085, 0.68, 0.53]], ["easeOutQuad", [0.25, 0.46, 0.45, 0.94]], ["easeInOutQuad", [0.455, 0.03, 0.515, 0.955]], ["easeInCubic", [0.55, 0.055, 0.675, 0.19]], ["easeOutCubic", [0.215, 0.61, 0.355, 1]], ["easeInOutCubic", [0.645, 0.045, 0.355, 1]], ["easeInQuart", [0.895, 0.03, 0.685, 0.22]], ["easeOutQuart", [0.165, 0.84, 0.44, 1]], ["easeInOutQuart", [0.77, 0, 0.175, 1]], ["easeInQuint", [0.755, 0.05, 0.855, 0.06]], ["easeOutQuint", [0.23, 1, 0.32, 1]], ["easeInOutQuint", [0.86, 0, 0.07, 1]], ["easeInExpo", [0.95, 0.05, 0.795, 0.035]], ["easeOutExpo", [0.19, 1, 0.22, 1]], ["easeInOutExpo", [1, 0, 0, 1]], ["easeInCirc", [0.6, 0.04, 0.98, 0.335]], ["easeOutCirc", [0.075, 0.82, 0.165, 1]], ["easeInOutCirc", [0.785, 0.135, 0.15, 0.86]]], function(i, easingArray) {
        Velocity.Easings[easingArray[0]] = generateBezier.apply(null, easingArray[1]);
      });
      function getEasing(value, duration) {
        var easing = value;
        if (Type.isString(value)) {
          if (!Velocity.Easings[value]) {
            easing = false;
          }
        } else if (Type.isArray(value) && value.length === 1) {
          easing = generateStep.apply(null, value);
        } else if (Type.isArray(value) && value.length === 2) {
          easing = generateSpringRK4.apply(null, value.concat([duration]));
        } else if (Type.isArray(value) && value.length === 4) {
          easing = generateBezier.apply(null, value);
        } else {
          easing = false;
        }
        if (easing === false) {
          if (Velocity.Easings[Velocity.defaults.easing]) {
            easing = Velocity.defaults.easing;
          } else {
            easing = EASING_DEFAULT;
          }
        }
        return easing;
      }
      var CSS = Velocity.CSS = {
        RegEx: {
          isHex: /^#([A-f\d]{3}){1,2}$/i,
          valueUnwrap: /^[A-z]+\((.*)\)$/i,
          wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
          valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
        },
        Lists: {
          colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
          transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
          transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"],
          units: ["%", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "cm", "mm", "Q", "in", "pc", "pt", "px", "deg", "grad", "rad", "turn", "s", "ms"],
          colorNames: {
            "aliceblue": "240,248,255",
            "antiquewhite": "250,235,215",
            "aquamarine": "127,255,212",
            "aqua": "0,255,255",
            "azure": "240,255,255",
            "beige": "245,245,220",
            "bisque": "255,228,196",
            "black": "0,0,0",
            "blanchedalmond": "255,235,205",
            "blueviolet": "138,43,226",
            "blue": "0,0,255",
            "brown": "165,42,42",
            "burlywood": "222,184,135",
            "cadetblue": "95,158,160",
            "chartreuse": "127,255,0",
            "chocolate": "210,105,30",
            "coral": "255,127,80",
            "cornflowerblue": "100,149,237",
            "cornsilk": "255,248,220",
            "crimson": "220,20,60",
            "cyan": "0,255,255",
            "darkblue": "0,0,139",
            "darkcyan": "0,139,139",
            "darkgoldenrod": "184,134,11",
            "darkgray": "169,169,169",
            "darkgrey": "169,169,169",
            "darkgreen": "0,100,0",
            "darkkhaki": "189,183,107",
            "darkmagenta": "139,0,139",
            "darkolivegreen": "85,107,47",
            "darkorange": "255,140,0",
            "darkorchid": "153,50,204",
            "darkred": "139,0,0",
            "darksalmon": "233,150,122",
            "darkseagreen": "143,188,143",
            "darkslateblue": "72,61,139",
            "darkslategray": "47,79,79",
            "darkturquoise": "0,206,209",
            "darkviolet": "148,0,211",
            "deeppink": "255,20,147",
            "deepskyblue": "0,191,255",
            "dimgray": "105,105,105",
            "dimgrey": "105,105,105",
            "dodgerblue": "30,144,255",
            "firebrick": "178,34,34",
            "floralwhite": "255,250,240",
            "forestgreen": "34,139,34",
            "fuchsia": "255,0,255",
            "gainsboro": "220,220,220",
            "ghostwhite": "248,248,255",
            "gold": "255,215,0",
            "goldenrod": "218,165,32",
            "gray": "128,128,128",
            "grey": "128,128,128",
            "greenyellow": "173,255,47",
            "green": "0,128,0",
            "honeydew": "240,255,240",
            "hotpink": "255,105,180",
            "indianred": "205,92,92",
            "indigo": "75,0,130",
            "ivory": "255,255,240",
            "khaki": "240,230,140",
            "lavenderblush": "255,240,245",
            "lavender": "230,230,250",
            "lawngreen": "124,252,0",
            "lemonchiffon": "255,250,205",
            "lightblue": "173,216,230",
            "lightcoral": "240,128,128",
            "lightcyan": "224,255,255",
            "lightgoldenrodyellow": "250,250,210",
            "lightgray": "211,211,211",
            "lightgrey": "211,211,211",
            "lightgreen": "144,238,144",
            "lightpink": "255,182,193",
            "lightsalmon": "255,160,122",
            "lightseagreen": "32,178,170",
            "lightskyblue": "135,206,250",
            "lightslategray": "119,136,153",
            "lightsteelblue": "176,196,222",
            "lightyellow": "255,255,224",
            "limegreen": "50,205,50",
            "lime": "0,255,0",
            "linen": "250,240,230",
            "magenta": "255,0,255",
            "maroon": "128,0,0",
            "mediumaquamarine": "102,205,170",
            "mediumblue": "0,0,205",
            "mediumorchid": "186,85,211",
            "mediumpurple": "147,112,219",
            "mediumseagreen": "60,179,113",
            "mediumslateblue": "123,104,238",
            "mediumspringgreen": "0,250,154",
            "mediumturquoise": "72,209,204",
            "mediumvioletred": "199,21,133",
            "midnightblue": "25,25,112",
            "mintcream": "245,255,250",
            "mistyrose": "255,228,225",
            "moccasin": "255,228,181",
            "navajowhite": "255,222,173",
            "navy": "0,0,128",
            "oldlace": "253,245,230",
            "olivedrab": "107,142,35",
            "olive": "128,128,0",
            "orangered": "255,69,0",
            "orange": "255,165,0",
            "orchid": "218,112,214",
            "palegoldenrod": "238,232,170",
            "palegreen": "152,251,152",
            "paleturquoise": "175,238,238",
            "palevioletred": "219,112,147",
            "papayawhip": "255,239,213",
            "peachpuff": "255,218,185",
            "peru": "205,133,63",
            "pink": "255,192,203",
            "plum": "221,160,221",
            "powderblue": "176,224,230",
            "purple": "128,0,128",
            "red": "255,0,0",
            "rosybrown": "188,143,143",
            "royalblue": "65,105,225",
            "saddlebrown": "139,69,19",
            "salmon": "250,128,114",
            "sandybrown": "244,164,96",
            "seagreen": "46,139,87",
            "seashell": "255,245,238",
            "sienna": "160,82,45",
            "silver": "192,192,192",
            "skyblue": "135,206,235",
            "slateblue": "106,90,205",
            "slategray": "112,128,144",
            "snow": "255,250,250",
            "springgreen": "0,255,127",
            "steelblue": "70,130,180",
            "tan": "210,180,140",
            "teal": "0,128,128",
            "thistle": "216,191,216",
            "tomato": "255,99,71",
            "turquoise": "64,224,208",
            "violet": "238,130,238",
            "wheat": "245,222,179",
            "whitesmoke": "245,245,245",
            "white": "255,255,255",
            "yellowgreen": "154,205,50",
            "yellow": "255,255,0"
          }
        },
        Hooks: {
          templates: {
            "textShadow": ["Color X Y Blur", "black 0px 0px 0px"],
            "boxShadow": ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
            "clip": ["Top Right Bottom Left", "0px 0px 0px 0px"],
            "backgroundPosition": ["X Y", "0% 0%"],
            "transformOrigin": ["X Y Z", "50% 50% 0px"],
            "perspectiveOrigin": ["X Y", "50% 50%"]
          },
          registered: {},
          register: function() {
            for (var i = 0; i < CSS.Lists.colors.length; i++) {
              var rgbComponents = (CSS.Lists.colors[i] === "color") ? "0 0 0 1" : "255 255 255 1";
              CSS.Hooks.templates[CSS.Lists.colors[i]] = ["Red Green Blue Alpha", rgbComponents];
            }
            var rootProperty,
                hookTemplate,
                hookNames;
            if (IE) {
              for (rootProperty in CSS.Hooks.templates) {
                if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
                  continue;
                }
                hookTemplate = CSS.Hooks.templates[rootProperty];
                hookNames = hookTemplate[0].split(" ");
                var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);
                if (hookNames[0] === "Color") {
                  hookNames.push(hookNames.shift());
                  defaultValues.push(defaultValues.shift());
                  CSS.Hooks.templates[rootProperty] = [hookNames.join(" "), defaultValues.join(" ")];
                }
              }
            }
            for (rootProperty in CSS.Hooks.templates) {
              if (!CSS.Hooks.templates.hasOwnProperty(rootProperty)) {
                continue;
              }
              hookTemplate = CSS.Hooks.templates[rootProperty];
              hookNames = hookTemplate[0].split(" ");
              for (var j in hookNames) {
                if (!hookNames.hasOwnProperty(j)) {
                  continue;
                }
                var fullHookName = rootProperty + hookNames[j],
                    hookPosition = j;
                CSS.Hooks.registered[fullHookName] = [rootProperty, hookPosition];
              }
            }
          },
          getRoot: function(property) {
            var hookData = CSS.Hooks.registered[property];
            if (hookData) {
              return hookData[0];
            } else {
              return property;
            }
          },
          getUnit: function(str, start) {
            var unit = (str.substr(start || 0, 5).match(/^[a-z%]+/) || [])[0] || "";
            if (unit && _inArray(CSS.Lists.units, unit)) {
              return unit;
            }
            return "";
          },
          fixColors: function(str) {
            return str.replace(/(rgba?\(\s*)?(\b[a-z]+\b)/g, function($0, $1, $2) {
              if (CSS.Lists.colorNames.hasOwnProperty($2)) {
                return ($1 ? $1 : "rgba(") + CSS.Lists.colorNames[$2] + ($1 ? "" : ",1)");
              }
              return $1 + $2;
            });
          },
          cleanRootPropertyValue: function(rootProperty, rootPropertyValue) {
            if (CSS.RegEx.valueUnwrap.test(rootPropertyValue)) {
              rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];
            }
            if (CSS.Values.isCSSNullValue(rootPropertyValue)) {
              rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
            }
            return rootPropertyValue;
          },
          extractValue: function(fullHookName, rootPropertyValue) {
            var hookData = CSS.Hooks.registered[fullHookName];
            if (hookData) {
              var hookRoot = hookData[0],
                  hookPosition = hookData[1];
              rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);
              return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
            } else {
              return rootPropertyValue;
            }
          },
          injectValue: function(fullHookName, hookValue, rootPropertyValue) {
            var hookData = CSS.Hooks.registered[fullHookName];
            if (hookData) {
              var hookRoot = hookData[0],
                  hookPosition = hookData[1],
                  rootPropertyValueParts,
                  rootPropertyValueUpdated;
              rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);
              rootPropertyValueParts = rootPropertyValue.toString().match(CSS.RegEx.valueSplit);
              rootPropertyValueParts[hookPosition] = hookValue;
              rootPropertyValueUpdated = rootPropertyValueParts.join(" ");
              return rootPropertyValueUpdated;
            } else {
              return rootPropertyValue;
            }
          }
        },
        Normalizations: {
          registered: {
            clip: function(type, element, propertyValue) {
              switch (type) {
                case "name":
                  return "clip";
                case "extract":
                  var extracted;
                  if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                    extracted = propertyValue;
                  } else {
                    extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);
                    extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
                  }
                  return extracted;
                case "inject":
                  return "rect(" + propertyValue + ")";
              }
            },
            blur: function(type, element, propertyValue) {
              switch (type) {
                case "name":
                  return Velocity.State.isFirefox ? "filter" : "-webkit-filter";
                case "extract":
                  var extracted = parseFloat(propertyValue);
                  if (!(extracted || extracted === 0)) {
                    var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                    if (blurComponent) {
                      extracted = blurComponent[1];
                    } else {
                      extracted = 0;
                    }
                  }
                  return extracted;
                case "inject":
                  if (!parseFloat(propertyValue)) {
                    return "none";
                  } else {
                    return "blur(" + propertyValue + ")";
                  }
              }
            },
            opacity: function(type, element, propertyValue) {
              if (IE <= 8) {
                switch (type) {
                  case "name":
                    return "filter";
                  case "extract":
                    var extracted = propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);
                    if (extracted) {
                      propertyValue = extracted[1] / 100;
                    } else {
                      propertyValue = 1;
                    }
                    return propertyValue;
                  case "inject":
                    element.style.zoom = 1;
                    if (parseFloat(propertyValue) >= 1) {
                      return "";
                    } else {
                      return "alpha(opacity=" + parseInt(parseFloat(propertyValue) * 100, 10) + ")";
                    }
                }
              } else {
                switch (type) {
                  case "name":
                    return "opacity";
                  case "extract":
                    return propertyValue;
                  case "inject":
                    return propertyValue;
                }
              }
            }
          },
          register: function() {
            if ((!IE || IE > 9) && !Velocity.State.isGingerbread) {
              CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);
            }
            for (var i = 0; i < CSS.Lists.transformsBase.length; i++) {
              (function() {
                var transformName = CSS.Lists.transformsBase[i];
                CSS.Normalizations.registered[transformName] = function(type, element, propertyValue) {
                  switch (type) {
                    case "name":
                      return "transform";
                    case "extract":
                      if (Data(element) === undefined || Data(element).transformCache[transformName] === undefined) {
                        return /^scale/i.test(transformName) ? 1 : 0;
                      }
                      return Data(element).transformCache[transformName].replace(/[()]/g, "");
                    case "inject":
                      var invalid = false;
                      switch (transformName.substr(0, transformName.length - 1)) {
                        case "translate":
                          invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
                          break;
                        case "scal":
                        case "scale":
                          if (Velocity.State.isAndroid && Data(element).transformCache[transformName] === undefined && propertyValue < 1) {
                            propertyValue = 1;
                          }
                          invalid = !/(\d)$/i.test(propertyValue);
                          break;
                        case "skew":
                          invalid = !/(deg|\d)$/i.test(propertyValue);
                          break;
                        case "rotate":
                          invalid = !/(deg|\d)$/i.test(propertyValue);
                          break;
                      }
                      if (!invalid) {
                        Data(element).transformCache[transformName] = "(" + propertyValue + ")";
                      }
                      return Data(element).transformCache[transformName];
                  }
                };
              })();
            }
            for (var j = 0; j < CSS.Lists.colors.length; j++) {
              (function() {
                var colorName = CSS.Lists.colors[j];
                CSS.Normalizations.registered[colorName] = function(type, element, propertyValue) {
                  switch (type) {
                    case "name":
                      return colorName;
                    case "extract":
                      var extracted;
                      if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                        extracted = propertyValue;
                      } else {
                        var converted,
                            colorNames = {
                              black: "rgb(0, 0, 0)",
                              blue: "rgb(0, 0, 255)",
                              gray: "rgb(128, 128, 128)",
                              green: "rgb(0, 128, 0)",
                              red: "rgb(255, 0, 0)",
                              white: "rgb(255, 255, 255)"
                            };
                        if (/^[A-z]+$/i.test(propertyValue)) {
                          if (colorNames[propertyValue] !== undefined) {
                            converted = colorNames[propertyValue];
                          } else {
                            converted = colorNames.black;
                          }
                        } else if (CSS.RegEx.isHex.test(propertyValue)) {
                          converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";
                        } else if (!(/^rgba?\(/i.test(propertyValue))) {
                          converted = colorNames.black;
                        }
                        extracted = (converted || propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                      }
                      if ((!IE || IE > 8) && extracted.split(" ").length === 3) {
                        extracted += " 1";
                      }
                      return extracted;
                    case "inject":
                      if (/^rgb/.test(propertyValue)) {
                        return propertyValue;
                      }
                      if (IE <= 8) {
                        if (propertyValue.split(" ").length === 4) {
                          propertyValue = propertyValue.split(/\s+/).slice(0, 3).join(" ");
                        }
                      } else if (propertyValue.split(" ").length === 3) {
                        propertyValue += " 1";
                      }
                      return (IE <= 8 ? "rgb" : "rgba") + "(" + propertyValue.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
                  }
                };
              })();
            }
            function augmentDimension(name, element, wantInner) {
              var isBorderBox = CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() === "border-box";
              if (isBorderBox === (wantInner || false)) {
                var i,
                    value,
                    augment = 0,
                    sides = name === "width" ? ["Left", "Right"] : ["Top", "Bottom"],
                    fields = ["padding" + sides[0], "padding" + sides[1], "border" + sides[0] + "Width", "border" + sides[1] + "Width"];
                for (i = 0; i < fields.length; i++) {
                  value = parseFloat(CSS.getPropertyValue(element, fields[i]));
                  if (!isNaN(value)) {
                    augment += value;
                  }
                }
                return wantInner ? -augment : augment;
              }
              return 0;
            }
            function getDimension(name, wantInner) {
              return function(type, element, propertyValue) {
                switch (type) {
                  case "name":
                    return name;
                  case "extract":
                    return parseFloat(propertyValue) + augmentDimension(name, element, wantInner);
                  case "inject":
                    return (parseFloat(propertyValue) - augmentDimension(name, element, wantInner)) + "px";
                }
              };
            }
            CSS.Normalizations.registered.innerWidth = getDimension("width", true);
            CSS.Normalizations.registered.innerHeight = getDimension("height", true);
            CSS.Normalizations.registered.outerWidth = getDimension("width");
            CSS.Normalizations.registered.outerHeight = getDimension("height");
          }
        },
        Names: {
          camelCase: function(property) {
            return property.replace(/-(\w)/g, function(match, subMatch) {
              return subMatch.toUpperCase();
            });
          },
          SVGAttribute: function(property) {
            var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
            if (IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) {
              SVGAttributes += "|transform";
            }
            return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
          },
          prefixCheck: function(property) {
            if (Velocity.State.prefixMatches[property]) {
              return [Velocity.State.prefixMatches[property], true];
            } else {
              var vendors = ["", "Webkit", "Moz", "ms", "O"];
              for (var i = 0,
                  vendorsLength = vendors.length; i < vendorsLength; i++) {
                var propertyPrefixed;
                if (i === 0) {
                  propertyPrefixed = property;
                } else {
                  propertyPrefixed = vendors[i] + property.replace(/^\w/, function(match) {
                    return match.toUpperCase();
                  });
                }
                if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
                  Velocity.State.prefixMatches[property] = propertyPrefixed;
                  return [propertyPrefixed, true];
                }
              }
              return [property, false];
            }
          }
        },
        Values: {
          hexToRgb: function(hex) {
            var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
                rgbParts;
            hex = hex.replace(shortformRegex, function(m, r, g, b) {
              return r + r + g + g + b + b;
            });
            rgbParts = longformRegex.exec(hex);
            return rgbParts ? [parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16)] : [0, 0, 0];
          },
          isCSSNullValue: function(value) {
            return (!value || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value));
          },
          getUnitType: function(property) {
            if (/^(rotate|skew)/i.test(property)) {
              return "deg";
            } else if (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)) {
              return "";
            } else {
              return "px";
            }
          },
          getDisplayType: function(element) {
            var tagName = element && element.tagName.toString().toLowerCase();
            if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
              return "inline";
            } else if (/^(li)$/i.test(tagName)) {
              return "list-item";
            } else if (/^(tr)$/i.test(tagName)) {
              return "table-row";
            } else if (/^(table)$/i.test(tagName)) {
              return "table";
            } else if (/^(tbody)$/i.test(tagName)) {
              return "table-row-group";
            } else {
              return "block";
            }
          },
          addClass: function(element, className) {
            if (element) {
              if (element.classList) {
                element.classList.add(className);
              } else if (Type.isString(element.className)) {
                element.className += (element.className.length ? " " : "") + className;
              } else {
                var currentClass = element.getAttribute(IE <= 7 ? "className" : "class") || "";
                element.setAttribute("class", currentClass + (currentClass ? " " : "") + className);
              }
            }
          },
          removeClass: function(element, className) {
            if (element) {
              if (element.classList) {
                element.classList.remove(className);
              } else if (Type.isString(element.className)) {
                element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
              } else {
                var currentClass = element.getAttribute(IE <= 7 ? "className" : "class") || "";
                element.setAttribute("class", currentClass.replace(new RegExp("(^|\s)" + className.split(" ").join("|") + "(\s|$)", "gi"), " "));
              }
            }
          }
        },
        getPropertyValue: function(element, property, rootPropertyValue, forceStyleLookup) {
          function computePropertyValue(element, property) {
            var computedValue = 0;
            if (IE <= 8) {
              computedValue = $.css(element, property);
            } else {
              var toggleDisplay = false;
              if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
                toggleDisplay = true;
                CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
              }
              var revertDisplay = function() {
                if (toggleDisplay) {
                  CSS.setPropertyValue(element, "display", "none");
                }
              };
              if (!forceStyleLookup) {
                if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                  var contentBoxHeight = element.offsetHeight - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);
                  revertDisplay();
                  return contentBoxHeight;
                } else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                  var contentBoxWidth = element.offsetWidth - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);
                  revertDisplay();
                  return contentBoxWidth;
                }
              }
              var computedStyle;
              if (Data(element) === undefined) {
                computedStyle = window.getComputedStyle(element, null);
              } else if (!Data(element).computedStyle) {
                computedStyle = Data(element).computedStyle = window.getComputedStyle(element, null);
              } else {
                computedStyle = Data(element).computedStyle;
              }
              if (property === "borderColor") {
                property = "borderTopColor";
              }
              if (IE === 9 && property === "filter") {
                computedValue = computedStyle.getPropertyValue(property);
              } else {
                computedValue = computedStyle[property];
              }
              if (computedValue === "" || computedValue === null) {
                computedValue = element.style[property];
              }
              revertDisplay();
            }
            if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
              var position = computePropertyValue(element, "position");
              if (position === "fixed" || (position === "absolute" && /top|left/i.test(property))) {
                computedValue = $(element).position()[property] + "px";
              }
            }
            return computedValue;
          }
          var propertyValue;
          if (CSS.Hooks.registered[property]) {
            var hook = property,
                hookRoot = CSS.Hooks.getRoot(hook);
            if (rootPropertyValue === undefined) {
              rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]);
            }
            if (CSS.Normalizations.registered[hookRoot]) {
              rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);
            }
            propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);
          } else if (CSS.Normalizations.registered[property]) {
            var normalizedPropertyName,
                normalizedPropertyValue;
            normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);
            if (normalizedPropertyName !== "transform") {
              normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]);
              if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property]) {
                normalizedPropertyValue = CSS.Hooks.templates[property][1];
              }
            }
            propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
          }
          if (!/^[\d-]/.test(propertyValue)) {
            var data = Data(element);
            if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
              if (/^(height|width)$/i.test(property)) {
                try {
                  propertyValue = element.getBBox()[property];
                } catch (error) {
                  propertyValue = 0;
                }
              } else {
                propertyValue = element.getAttribute(property);
              }
            } else {
              propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]);
            }
          }
          if (CSS.Values.isCSSNullValue(propertyValue)) {
            propertyValue = 0;
          }
          if (Velocity.debug >= 2) {
            console.log("Get " + property + ": " + propertyValue);
          }
          return propertyValue;
        },
        setPropertyValue: function(element, property, propertyValue, rootPropertyValue, scrollData) {
          var propertyName = property;
          if (property === "scroll") {
            if (scrollData.container) {
              scrollData.container["scroll" + scrollData.direction] = propertyValue;
            } else {
              if (scrollData.direction === "Left") {
                window.scrollTo(propertyValue, scrollData.alternateValue);
              } else {
                window.scrollTo(scrollData.alternateValue, propertyValue);
              }
            }
          } else {
            if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
              CSS.Normalizations.registered[property]("inject", element, propertyValue);
              propertyName = "transform";
              propertyValue = Data(element).transformCache[property];
            } else {
              if (CSS.Hooks.registered[property]) {
                var hookName = property,
                    hookRoot = CSS.Hooks.getRoot(property);
                rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot);
                propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
                property = hookRoot;
              }
              if (CSS.Normalizations.registered[property]) {
                propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
                property = CSS.Normalizations.registered[property]("name", element);
              }
              propertyName = CSS.Names.prefixCheck(property)[0];
              if (IE <= 8) {
                try {
                  element.style[propertyName] = propertyValue;
                } catch (error) {
                  if (Velocity.debug) {
                    console.log("Browser does not support [" + propertyValue + "] for [" + propertyName + "]");
                  }
                }
              } else {
                var data = Data(element);
                if (data && data.isSVG && CSS.Names.SVGAttribute(property)) {
                  element.setAttribute(property, propertyValue);
                } else {
                  element.style[propertyName] = propertyValue;
                }
              }
              if (Velocity.debug >= 2) {
                console.log("Set " + property + " (" + propertyName + "): " + propertyValue);
              }
            }
          }
          return [propertyName, propertyValue];
        },
        flushTransformCache: function(element) {
          var transformString = "",
              data = Data(element);
          if ((IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) && data && data.isSVG) {
            var getTransformFloat = function(transformProperty) {
              return parseFloat(CSS.getPropertyValue(element, transformProperty));
            };
            var SVGTransforms = {
              translate: [getTransformFloat("translateX"), getTransformFloat("translateY")],
              skewX: [getTransformFloat("skewX")],
              skewY: [getTransformFloat("skewY")],
              scale: getTransformFloat("scale") !== 1 ? [getTransformFloat("scale"), getTransformFloat("scale")] : [getTransformFloat("scaleX"), getTransformFloat("scaleY")],
              rotate: [getTransformFloat("rotateZ"), 0, 0]
            };
            $.each(Data(element).transformCache, function(transformName) {
              if (/^translate/i.test(transformName)) {
                transformName = "translate";
              } else if (/^scale/i.test(transformName)) {
                transformName = "scale";
              } else if (/^rotate/i.test(transformName)) {
                transformName = "rotate";
              }
              if (SVGTransforms[transformName]) {
                transformString += transformName + "(" + SVGTransforms[transformName].join(" ") + ")" + " ";
                delete SVGTransforms[transformName];
              }
            });
          } else {
            var transformValue,
                perspective;
            $.each(Data(element).transformCache, function(transformName) {
              transformValue = Data(element).transformCache[transformName];
              if (transformName === "transformPerspective") {
                perspective = transformValue;
                return true;
              }
              if (IE === 9 && transformName === "rotateZ") {
                transformName = "rotate";
              }
              transformString += transformName + transformValue + " ";
            });
            if (perspective) {
              transformString = "perspective" + perspective + " " + transformString;
            }
          }
          CSS.setPropertyValue(element, "transform", transformString);
        }
      };
      CSS.Hooks.register();
      CSS.Normalizations.register();
      Velocity.hook = function(elements, arg2, arg3) {
        var value;
        elements = sanitizeElements(elements);
        $.each(elements, function(i, element) {
          if (Data(element) === undefined) {
            Velocity.init(element);
          }
          if (arg3 === undefined) {
            if (value === undefined) {
              value = CSS.getPropertyValue(element, arg2);
            }
          } else {
            var adjustedSet = CSS.setPropertyValue(element, arg2, arg3);
            if (adjustedSet[0] === "transform") {
              Velocity.CSS.flushTransformCache(element);
            }
            value = adjustedSet;
          }
        });
        return value;
      };
      var animate = function() {
        var opts;
        function getChain() {
          if (isUtility) {
            return promiseData.promise || null;
          } else {
            return elementsWrapped;
          }
        }
        var syntacticSugar = (arguments[0] && (arguments[0].p || (($.isPlainObject(arguments[0].properties) && !arguments[0].properties.names) || Type.isString(arguments[0].properties)))),
            isUtility,
            elementsWrapped,
            argumentIndex;
        var elements,
            propertiesMap,
            options;
        if (Type.isWrapped(this)) {
          isUtility = false;
          argumentIndex = 0;
          elements = this;
          elementsWrapped = this;
        } else {
          isUtility = true;
          argumentIndex = 1;
          elements = syntacticSugar ? (arguments[0].elements || arguments[0].e) : arguments[0];
        }
        var promiseData = {
          promise: null,
          resolver: null,
          rejecter: null
        };
        if (isUtility && Velocity.Promise) {
          promiseData.promise = new Velocity.Promise(function(resolve, reject) {
            promiseData.resolver = resolve;
            promiseData.rejecter = reject;
          });
        }
        if (syntacticSugar) {
          propertiesMap = arguments[0].properties || arguments[0].p;
          options = arguments[0].options || arguments[0].o;
        } else {
          propertiesMap = arguments[argumentIndex];
          options = arguments[argumentIndex + 1];
        }
        elements = sanitizeElements(elements);
        if (!elements) {
          if (promiseData.promise) {
            if (!propertiesMap || !options || options.promiseRejectEmpty !== false) {
              promiseData.rejecter();
            } else {
              promiseData.resolver();
            }
          }
          return;
        }
        var elementsLength = elements.length,
            elementsIndex = 0;
        if (!/^(stop|finish|finishAll|pause|resume)$/i.test(propertiesMap) && !$.isPlainObject(options)) {
          var startingArgumentPosition = argumentIndex + 1;
          options = {};
          for (var i = startingArgumentPosition; i < arguments.length; i++) {
            if (!Type.isArray(arguments[i]) && (/^(fast|normal|slow)$/i.test(arguments[i]) || /^\d/.test(arguments[i]))) {
              options.duration = arguments[i];
            } else if (Type.isString(arguments[i]) || Type.isArray(arguments[i])) {
              options.easing = arguments[i];
            } else if (Type.isFunction(arguments[i])) {
              options.complete = arguments[i];
            }
          }
        }
        var action;
        switch (propertiesMap) {
          case "scroll":
            action = "scroll";
            break;
          case "reverse":
            action = "reverse";
            break;
          case "pause":
            var currentTime = (new Date()).getTime();
            $.each(elements, function(i, element) {
              pauseDelayOnElement(element, currentTime);
            });
            $.each(Velocity.State.calls, function(i, activeCall) {
              var found = false;
              if (activeCall) {
                $.each(activeCall[1], function(k, activeElement) {
                  var queueName = (options === undefined) ? "" : options;
                  if (queueName !== true && (activeCall[2].queue !== queueName) && !(options === undefined && activeCall[2].queue === false)) {
                    return true;
                  }
                  $.each(elements, function(l, element) {
                    if (element === activeElement) {
                      activeCall[5] = {resume: false};
                      found = true;
                      return false;
                    }
                  });
                  if (found) {
                    return false;
                  }
                });
              }
            });
            return getChain();
          case "resume":
            $.each(elements, function(i, element) {
              resumeDelayOnElement(element, currentTime);
            });
            $.each(Velocity.State.calls, function(i, activeCall) {
              var found = false;
              if (activeCall) {
                $.each(activeCall[1], function(k, activeElement) {
                  var queueName = (options === undefined) ? "" : options;
                  if (queueName !== true && (activeCall[2].queue !== queueName) && !(options === undefined && activeCall[2].queue === false)) {
                    return true;
                  }
                  if (!activeCall[5]) {
                    return true;
                  }
                  $.each(elements, function(l, element) {
                    if (element === activeElement) {
                      activeCall[5].resume = true;
                      found = true;
                      return false;
                    }
                  });
                  if (found) {
                    return false;
                  }
                });
              }
            });
            return getChain();
          case "finish":
          case "finishAll":
          case "stop":
            $.each(elements, function(i, element) {
              if (Data(element) && Data(element).delayTimer) {
                clearTimeout(Data(element).delayTimer.setTimeout);
                if (Data(element).delayTimer.next) {
                  Data(element).delayTimer.next();
                }
                delete Data(element).delayTimer;
              }
              if (propertiesMap === "finishAll" && (options === true || Type.isString(options))) {
                $.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
                  if (Type.isFunction(item)) {
                    item();
                  }
                });
                $.queue(element, Type.isString(options) ? options : "", []);
              }
            });
            var callsToStop = [];
            $.each(Velocity.State.calls, function(i, activeCall) {
              if (activeCall) {
                $.each(activeCall[1], function(k, activeElement) {
                  var queueName = (options === undefined) ? "" : options;
                  if (queueName !== true && (activeCall[2].queue !== queueName) && !(options === undefined && activeCall[2].queue === false)) {
                    return true;
                  }
                  $.each(elements, function(l, element) {
                    if (element === activeElement) {
                      if (options === true || Type.isString(options)) {
                        $.each($.queue(element, Type.isString(options) ? options : ""), function(_, item) {
                          if (Type.isFunction(item)) {
                            item(null, true);
                          }
                        });
                        $.queue(element, Type.isString(options) ? options : "", []);
                      }
                      if (propertiesMap === "stop") {
                        var data = Data(element);
                        if (data && data.tweensContainer && queueName !== false) {
                          $.each(data.tweensContainer, function(m, activeTween) {
                            activeTween.endValue = activeTween.currentValue;
                          });
                        }
                        callsToStop.push(i);
                      } else if (propertiesMap === "finish" || propertiesMap === "finishAll") {
                        activeCall[2].duration = 1;
                      }
                    }
                  });
                });
              }
            });
            if (propertiesMap === "stop") {
              $.each(callsToStop, function(i, j) {
                completeCall(j, true);
              });
              if (promiseData.promise) {
                promiseData.resolver(elements);
              }
            }
            return getChain();
          default:
            if ($.isPlainObject(propertiesMap) && !Type.isEmptyObject(propertiesMap)) {
              action = "start";
            } else if (Type.isString(propertiesMap) && Velocity.Redirects[propertiesMap]) {
              opts = $.extend({}, options);
              var durationOriginal = opts.duration,
                  delayOriginal = opts.delay || 0;
              if (opts.backwards === true) {
                elements = $.extend(true, [], elements).reverse();
              }
              $.each(elements, function(elementIndex, element) {
                if (parseFloat(opts.stagger)) {
                  opts.delay = delayOriginal + (parseFloat(opts.stagger) * elementIndex);
                } else if (Type.isFunction(opts.stagger)) {
                  opts.delay = delayOriginal + opts.stagger.call(element, elementIndex, elementsLength);
                }
                if (opts.drag) {
                  opts.duration = parseFloat(durationOriginal) || (/^(callout|transition)/.test(propertiesMap) ? 1000 : DURATION_DEFAULT);
                  opts.duration = Math.max(opts.duration * (opts.backwards ? 1 - elementIndex / elementsLength : (elementIndex + 1) / elementsLength), opts.duration * 0.75, 200);
                }
                Velocity.Redirects[propertiesMap].call(element, element, opts || {}, elementIndex, elementsLength, elements, promiseData.promise ? promiseData : undefined);
              });
              return getChain();
            } else {
              var abortError = "Velocity: First argument (" + propertiesMap + ") was not a property map, a known action, or a registered redirect. Aborting.";
              if (promiseData.promise) {
                promiseData.rejecter(new Error(abortError));
              } else if (window.console) {
                console.log(abortError);
              }
              return getChain();
            }
        }
        var callUnitConversionData = {
          lastParent: null,
          lastPosition: null,
          lastFontSize: null,
          lastPercentToPxWidth: null,
          lastPercentToPxHeight: null,
          lastEmToPx: null,
          remToPx: null,
          vwToPx: null,
          vhToPx: null
        };
        var call = [];
        function processElement(element, elementArrayIndex) {
          var opts = $.extend({}, Velocity.defaults, options),
              tweensContainer = {},
              elementUnitConversionData;
          if (Data(element) === undefined) {
            Velocity.init(element);
          }
          if (parseFloat(opts.delay) && opts.queue !== false) {
            $.queue(element, opts.queue, function(next) {
              Velocity.velocityQueueEntryFlag = true;
              var callIndex = Velocity.State.delayedElements.count++;
              Velocity.State.delayedElements[callIndex] = element;
              var delayComplete = (function(index) {
                return function() {
                  Velocity.State.delayedElements[index] = false;
                  next();
                };
              })(callIndex);
              Data(element).delayBegin = (new Date()).getTime();
              Data(element).delay = parseFloat(opts.delay);
              Data(element).delayTimer = {
                setTimeout: setTimeout(next, parseFloat(opts.delay)),
                next: delayComplete
              };
            });
          }
          switch (opts.duration.toString().toLowerCase()) {
            case "fast":
              opts.duration = 200;
              break;
            case "normal":
              opts.duration = DURATION_DEFAULT;
              break;
            case "slow":
              opts.duration = 600;
              break;
            default:
              opts.duration = parseFloat(opts.duration) || 1;
          }
          if (Velocity.mock !== false) {
            if (Velocity.mock === true) {
              opts.duration = opts.delay = 1;
            } else {
              opts.duration *= parseFloat(Velocity.mock) || 1;
              opts.delay *= parseFloat(Velocity.mock) || 1;
            }
          }
          opts.easing = getEasing(opts.easing, opts.duration);
          if (opts.begin && !Type.isFunction(opts.begin)) {
            opts.begin = null;
          }
          if (opts.progress && !Type.isFunction(opts.progress)) {
            opts.progress = null;
          }
          if (opts.complete && !Type.isFunction(opts.complete)) {
            opts.complete = null;
          }
          if (opts.display !== undefined && opts.display !== null) {
            opts.display = opts.display.toString().toLowerCase();
            if (opts.display === "auto") {
              opts.display = Velocity.CSS.Values.getDisplayType(element);
            }
          }
          if (opts.visibility !== undefined && opts.visibility !== null) {
            opts.visibility = opts.visibility.toString().toLowerCase();
          }
          opts.mobileHA = (opts.mobileHA && Velocity.State.isMobile && !Velocity.State.isGingerbread);
          function buildQueue(next) {
            var data,
                lastTweensContainer;
            if (opts.begin && elementsIndex === 0) {
              try {
                opts.begin.call(elements, elements);
              } catch (error) {
                setTimeout(function() {
                  throw error;
                }, 1);
              }
            }
            if (action === "scroll") {
              var scrollDirection = (/^x$/i.test(opts.axis) ? "Left" : "Top"),
                  scrollOffset = parseFloat(opts.offset) || 0,
                  scrollPositionCurrent,
                  scrollPositionCurrentAlternate,
                  scrollPositionEnd;
              if (opts.container) {
                if (Type.isWrapped(opts.container) || Type.isNode(opts.container)) {
                  opts.container = opts.container[0] || opts.container;
                  scrollPositionCurrent = opts.container["scroll" + scrollDirection];
                  scrollPositionEnd = (scrollPositionCurrent + $(element).position()[scrollDirection.toLowerCase()]) + scrollOffset;
                } else {
                  opts.container = null;
                }
              } else {
                scrollPositionCurrent = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + scrollDirection]];
                scrollPositionCurrentAlternate = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + (scrollDirection === "Left" ? "Top" : "Left")]];
                scrollPositionEnd = $(element).offset()[scrollDirection.toLowerCase()] + scrollOffset;
              }
              tweensContainer = {
                scroll: {
                  rootPropertyValue: false,
                  startValue: scrollPositionCurrent,
                  currentValue: scrollPositionCurrent,
                  endValue: scrollPositionEnd,
                  unitType: "",
                  easing: opts.easing,
                  scrollData: {
                    container: opts.container,
                    direction: scrollDirection,
                    alternateValue: scrollPositionCurrentAlternate
                  }
                },
                element: element
              };
              if (Velocity.debug) {
                console.log("tweensContainer (scroll): ", tweensContainer.scroll, element);
              }
            } else if (action === "reverse") {
              data = Data(element);
              if (!data) {
                return;
              }
              if (!data.tweensContainer) {
                $.dequeue(element, opts.queue);
                return;
              } else {
                if (data.opts.display === "none") {
                  data.opts.display = "auto";
                }
                if (data.opts.visibility === "hidden") {
                  data.opts.visibility = "visible";
                }
                data.opts.loop = false;
                data.opts.begin = null;
                data.opts.complete = null;
                if (!options.easing) {
                  delete opts.easing;
                }
                if (!options.duration) {
                  delete opts.duration;
                }
                opts = $.extend({}, data.opts, opts);
                lastTweensContainer = $.extend(true, {}, data ? data.tweensContainer : null);
                for (var lastTween in lastTweensContainer) {
                  if (lastTweensContainer.hasOwnProperty(lastTween) && lastTween !== "element") {
                    var lastStartValue = lastTweensContainer[lastTween].startValue;
                    lastTweensContainer[lastTween].startValue = lastTweensContainer[lastTween].currentValue = lastTweensContainer[lastTween].endValue;
                    lastTweensContainer[lastTween].endValue = lastStartValue;
                    if (!Type.isEmptyObject(options)) {
                      lastTweensContainer[lastTween].easing = opts.easing;
                    }
                    if (Velocity.debug) {
                      console.log("reverse tweensContainer (" + lastTween + "): " + JSON.stringify(lastTweensContainer[lastTween]), element);
                    }
                  }
                }
                tweensContainer = lastTweensContainer;
              }
            } else if (action === "start") {
              data = Data(element);
              if (data && data.tweensContainer && data.isAnimating === true) {
                lastTweensContainer = data.tweensContainer;
              }
              var parsePropertyValue = function(valueData, skipResolvingEasing) {
                var endValue,
                    easing,
                    startValue;
                if (Type.isFunction(valueData)) {
                  valueData = valueData.call(element, elementArrayIndex, elementsLength);
                }
                if (Type.isArray(valueData)) {
                  endValue = valueData[0];
                  if ((!Type.isArray(valueData[1]) && /^[\d-]/.test(valueData[1])) || Type.isFunction(valueData[1]) || CSS.RegEx.isHex.test(valueData[1])) {
                    startValue = valueData[1];
                  } else if ((Type.isString(valueData[1]) && !CSS.RegEx.isHex.test(valueData[1]) && Velocity.Easings[valueData[1]]) || Type.isArray(valueData[1])) {
                    easing = skipResolvingEasing ? valueData[1] : getEasing(valueData[1], opts.duration);
                    startValue = valueData[2];
                  } else {
                    startValue = valueData[1] || valueData[2];
                  }
                } else {
                  endValue = valueData;
                }
                if (!skipResolvingEasing) {
                  easing = easing || opts.easing;
                }
                if (Type.isFunction(endValue)) {
                  endValue = endValue.call(element, elementArrayIndex, elementsLength);
                }
                if (Type.isFunction(startValue)) {
                  startValue = startValue.call(element, elementArrayIndex, elementsLength);
                }
                return [endValue || 0, easing, startValue];
              };
              var fixPropertyValue = function(property, valueData) {
                var rootProperty = CSS.Hooks.getRoot(property),
                    rootPropertyValue = false,
                    endValue = valueData[0],
                    easing = valueData[1],
                    startValue = valueData[2],
                    pattern;
                if ((!data || !data.isSVG) && rootProperty !== "tween" && CSS.Names.prefixCheck(rootProperty)[1] === false && CSS.Normalizations.registered[rootProperty] === undefined) {
                  if (Velocity.debug) {
                    console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");
                  }
                  return;
                }
                if (((opts.display !== undefined && opts.display !== null && opts.display !== "none") || (opts.visibility !== undefined && opts.visibility !== "hidden")) && /opacity|filter/.test(property) && !startValue && endValue !== 0) {
                  startValue = 0;
                }
                if (opts._cacheValues && lastTweensContainer && lastTweensContainer[property]) {
                  if (startValue === undefined) {
                    startValue = lastTweensContainer[property].endValue + lastTweensContainer[property].unitType;
                  }
                  rootPropertyValue = data.rootPropertyValueCache[rootProperty];
                } else {
                  if (CSS.Hooks.registered[property]) {
                    if (startValue === undefined) {
                      rootPropertyValue = CSS.getPropertyValue(element, rootProperty);
                      startValue = CSS.getPropertyValue(element, property, rootPropertyValue);
                    } else {
                      rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                    }
                  } else if (startValue === undefined) {
                    startValue = CSS.getPropertyValue(element, property);
                  }
                }
                var separatedValue,
                    endValueUnitType,
                    startValueUnitType,
                    operator = false;
                var separateValue = function(property, value) {
                  var unitType,
                      numericValue;
                  numericValue = (value || "0").toString().toLowerCase().replace(/[%A-z]+$/, function(match) {
                    unitType = match;
                    return "";
                  });
                  if (!unitType) {
                    unitType = CSS.Values.getUnitType(property);
                  }
                  return [numericValue, unitType];
                };
                if (startValue !== endValue && Type.isString(startValue) && Type.isString(endValue)) {
                  pattern = "";
                  var iStart = 0,
                      iEnd = 0,
                      aStart = [],
                      aEnd = [],
                      inCalc = 0,
                      inRGB = 0,
                      inRGBA = 0;
                  startValue = CSS.Hooks.fixColors(startValue);
                  endValue = CSS.Hooks.fixColors(endValue);
                  while (iStart < startValue.length && iEnd < endValue.length) {
                    var cStart = startValue[iStart],
                        cEnd = endValue[iEnd];
                    if (/[\d\.-]/.test(cStart) && /[\d\.-]/.test(cEnd)) {
                      var tStart = cStart,
                          tEnd = cEnd,
                          dotStart = ".",
                          dotEnd = ".";
                      while (++iStart < startValue.length) {
                        cStart = startValue[iStart];
                        if (cStart === dotStart) {
                          dotStart = "..";
                        } else if (!/\d/.test(cStart)) {
                          break;
                        }
                        tStart += cStart;
                      }
                      while (++iEnd < endValue.length) {
                        cEnd = endValue[iEnd];
                        if (cEnd === dotEnd) {
                          dotEnd = "..";
                        } else if (!/\d/.test(cEnd)) {
                          break;
                        }
                        tEnd += cEnd;
                      }
                      var uStart = CSS.Hooks.getUnit(startValue, iStart),
                          uEnd = CSS.Hooks.getUnit(endValue, iEnd);
                      iStart += uStart.length;
                      iEnd += uEnd.length;
                      if (uStart === uEnd) {
                        if (tStart === tEnd) {
                          pattern += tStart + uStart;
                        } else {
                          pattern += "{" + aStart.length + (inRGB ? "!" : "") + "}" + uStart;
                          aStart.push(parseFloat(tStart));
                          aEnd.push(parseFloat(tEnd));
                        }
                      } else {
                        var nStart = parseFloat(tStart),
                            nEnd = parseFloat(tEnd);
                        pattern += (inCalc < 5 ? "calc" : "") + "(" + (nStart ? "{" + aStart.length + (inRGB ? "!" : "") + "}" : "0") + uStart + " + " + (nEnd ? "{" + (aStart.length + (nStart ? 1 : 0)) + (inRGB ? "!" : "") + "}" : "0") + uEnd + ")";
                        if (nStart) {
                          aStart.push(nStart);
                          aEnd.push(0);
                        }
                        if (nEnd) {
                          aStart.push(0);
                          aEnd.push(nEnd);
                        }
                      }
                    } else if (cStart === cEnd) {
                      pattern += cStart;
                      iStart++;
                      iEnd++;
                      if (inCalc === 0 && cStart === "c" || inCalc === 1 && cStart === "a" || inCalc === 2 && cStart === "l" || inCalc === 3 && cStart === "c" || inCalc >= 4 && cStart === "(") {
                        inCalc++;
                      } else if ((inCalc && inCalc < 5) || inCalc >= 4 && cStart === ")" && --inCalc < 5) {
                        inCalc = 0;
                      }
                      if (inRGB === 0 && cStart === "r" || inRGB === 1 && cStart === "g" || inRGB === 2 && cStart === "b" || inRGB === 3 && cStart === "a" || inRGB >= 3 && cStart === "(") {
                        if (inRGB === 3 && cStart === "a") {
                          inRGBA = 1;
                        }
                        inRGB++;
                      } else if (inRGBA && cStart === ",") {
                        if (++inRGBA > 3) {
                          inRGB = inRGBA = 0;
                        }
                      } else if ((inRGBA && inRGB < (inRGBA ? 5 : 4)) || inRGB >= (inRGBA ? 4 : 3) && cStart === ")" && --inRGB < (inRGBA ? 5 : 4)) {
                        inRGB = inRGBA = 0;
                      }
                    } else {
                      inCalc = 0;
                      break;
                    }
                  }
                  if (iStart !== startValue.length || iEnd !== endValue.length) {
                    if (Velocity.debug) {
                      console.error("Trying to pattern match mis-matched strings [\"" + endValue + "\", \"" + startValue + "\"]");
                    }
                    pattern = undefined;
                  }
                  if (pattern) {
                    if (aStart.length) {
                      if (Velocity.debug) {
                        console.log("Pattern found \"" + pattern + "\" -> ", aStart, aEnd, "[" + startValue + "," + endValue + "]");
                      }
                      startValue = aStart;
                      endValue = aEnd;
                      endValueUnitType = startValueUnitType = "";
                    } else {
                      pattern = undefined;
                    }
                  }
                }
                if (!pattern) {
                  separatedValue = separateValue(property, startValue);
                  startValue = separatedValue[0];
                  startValueUnitType = separatedValue[1];
                  separatedValue = separateValue(property, endValue);
                  endValue = separatedValue[0].replace(/^([+-\/*])=/, function(match, subMatch) {
                    operator = subMatch;
                    return "";
                  });
                  endValueUnitType = separatedValue[1];
                  startValue = parseFloat(startValue) || 0;
                  endValue = parseFloat(endValue) || 0;
                  if (endValueUnitType === "%") {
                    if (/^(fontSize|lineHeight)$/.test(property)) {
                      endValue = endValue / 100;
                      endValueUnitType = "em";
                    } else if (/^scale/.test(property)) {
                      endValue = endValue / 100;
                      endValueUnitType = "";
                    } else if (/(Red|Green|Blue)$/i.test(property)) {
                      endValue = (endValue / 100) * 255;
                      endValueUnitType = "";
                    }
                  }
                }
                var calculateUnitRatios = function() {
                  var sameRatioIndicators = {
                    myParent: element.parentNode || document.body,
                    position: CSS.getPropertyValue(element, "position"),
                    fontSize: CSS.getPropertyValue(element, "fontSize")
                  },
                      samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.lastPosition) && (sameRatioIndicators.myParent === callUnitConversionData.lastParent)),
                      sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.lastFontSize);
                  callUnitConversionData.lastParent = sameRatioIndicators.myParent;
                  callUnitConversionData.lastPosition = sameRatioIndicators.position;
                  callUnitConversionData.lastFontSize = sameRatioIndicators.fontSize;
                  var measurement = 100,
                      unitRatios = {};
                  if (!sameEmRatio || !samePercentRatio) {
                    var dummy = data && data.isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "rect") : document.createElement("div");
                    Velocity.init(dummy);
                    sameRatioIndicators.myParent.appendChild(dummy);
                    $.each(["overflow", "overflowX", "overflowY"], function(i, property) {
                      Velocity.CSS.setPropertyValue(dummy, property, "hidden");
                    });
                    Velocity.CSS.setPropertyValue(dummy, "position", sameRatioIndicators.position);
                    Velocity.CSS.setPropertyValue(dummy, "fontSize", sameRatioIndicators.fontSize);
                    Velocity.CSS.setPropertyValue(dummy, "boxSizing", "content-box");
                    $.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function(i, property) {
                      Velocity.CSS.setPropertyValue(dummy, property, measurement + "%");
                    });
                    Velocity.CSS.setPropertyValue(dummy, "paddingLeft", measurement + "em");
                    unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth = (parseFloat(CSS.getPropertyValue(dummy, "width", null, true)) || 1) / measurement;
                    unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight = (parseFloat(CSS.getPropertyValue(dummy, "height", null, true)) || 1) / measurement;
                    unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(CSS.getPropertyValue(dummy, "paddingLeft")) || 1) / measurement;
                    sameRatioIndicators.myParent.removeChild(dummy);
                  } else {
                    unitRatios.emToPx = callUnitConversionData.lastEmToPx;
                    unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth;
                    unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight;
                  }
                  if (callUnitConversionData.remToPx === null) {
                    callUnitConversionData.remToPx = parseFloat(CSS.getPropertyValue(document.body, "fontSize")) || 16;
                  }
                  if (callUnitConversionData.vwToPx === null) {
                    callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100;
                    callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100;
                  }
                  unitRatios.remToPx = callUnitConversionData.remToPx;
                  unitRatios.vwToPx = callUnitConversionData.vwToPx;
                  unitRatios.vhToPx = callUnitConversionData.vhToPx;
                  if (Velocity.debug >= 1) {
                    console.log("Unit ratios: " + JSON.stringify(unitRatios), element);
                  }
                  return unitRatios;
                };
                if (/[\/*]/.test(operator)) {
                  endValueUnitType = startValueUnitType;
                } else if ((startValueUnitType !== endValueUnitType) && startValue !== 0) {
                  if (endValue === 0) {
                    endValueUnitType = startValueUnitType;
                  } else {
                    elementUnitConversionData = elementUnitConversionData || calculateUnitRatios();
                    var axis = (/margin|padding|left|right|width|text|word|letter/i.test(property) || /X$/.test(property) || property === "x") ? "x" : "y";
                    switch (startValueUnitType) {
                      case "%":
                        startValue *= (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                        break;
                      case "px":
                        break;
                      default:
                        startValue *= elementUnitConversionData[startValueUnitType + "ToPx"];
                    }
                    switch (endValueUnitType) {
                      case "%":
                        startValue *= 1 / (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                        break;
                      case "px":
                        break;
                      default:
                        startValue *= 1 / elementUnitConversionData[endValueUnitType + "ToPx"];
                    }
                  }
                }
                switch (operator) {
                  case "+":
                    endValue = startValue + endValue;
                    break;
                  case "-":
                    endValue = startValue - endValue;
                    break;
                  case "*":
                    endValue = startValue * endValue;
                    break;
                  case "/":
                    endValue = startValue / endValue;
                    break;
                }
                tweensContainer[property] = {
                  rootPropertyValue: rootPropertyValue,
                  startValue: startValue,
                  currentValue: startValue,
                  endValue: endValue,
                  unitType: endValueUnitType,
                  easing: easing
                };
                if (pattern) {
                  tweensContainer[property].pattern = pattern;
                }
                if (Velocity.debug) {
                  console.log("tweensContainer (" + property + "): " + JSON.stringify(tweensContainer[property]), element);
                }
              };
              for (var property in propertiesMap) {
                if (!propertiesMap.hasOwnProperty(property)) {
                  continue;
                }
                var propertyName = CSS.Names.camelCase(property),
                    valueData = parsePropertyValue(propertiesMap[property]);
                if (_inArray(CSS.Lists.colors, propertyName)) {
                  var endValue = valueData[0],
                      easing = valueData[1],
                      startValue = valueData[2];
                  if (CSS.RegEx.isHex.test(endValue)) {
                    var colorComponents = ["Red", "Green", "Blue"],
                        endValueRGB = CSS.Values.hexToRgb(endValue),
                        startValueRGB = startValue ? CSS.Values.hexToRgb(startValue) : undefined;
                    for (var i = 0; i < colorComponents.length; i++) {
                      var dataArray = [endValueRGB[i]];
                      if (easing) {
                        dataArray.push(easing);
                      }
                      if (startValueRGB !== undefined) {
                        dataArray.push(startValueRGB[i]);
                      }
                      fixPropertyValue(propertyName + colorComponents[i], dataArray);
                    }
                    continue;
                  }
                }
                fixPropertyValue(propertyName, valueData);
              }
              tweensContainer.element = element;
            }
            if (tweensContainer.element) {
              CSS.Values.addClass(element, "velocity-animating");
              call.push(tweensContainer);
              data = Data(element);
              if (data) {
                if (opts.queue === "") {
                  data.tweensContainer = tweensContainer;
                  data.opts = opts;
                }
                data.isAnimating = true;
              }
              if (elementsIndex === elementsLength - 1) {
                Velocity.State.calls.push([call, elements, opts, null, promiseData.resolver, null, 0]);
                if (Velocity.State.isTicking === false) {
                  Velocity.State.isTicking = true;
                  tick();
                }
              } else {
                elementsIndex++;
              }
            }
          }
          if (opts.queue === false) {
            if (opts.delay) {
              var callIndex = Velocity.State.delayedElements.count++;
              Velocity.State.delayedElements[callIndex] = element;
              var delayComplete = (function(index) {
                return function() {
                  Velocity.State.delayedElements[index] = false;
                  buildQueue();
                };
              })(callIndex);
              Data(element).delayBegin = (new Date()).getTime();
              Data(element).delay = parseFloat(opts.delay);
              Data(element).delayTimer = {
                setTimeout: setTimeout(buildQueue, parseFloat(opts.delay)),
                next: delayComplete
              };
            } else {
              buildQueue();
            }
          } else {
            $.queue(element, opts.queue, function(next, clearQueue) {
              if (clearQueue === true) {
                if (promiseData.promise) {
                  promiseData.resolver(elements);
                }
                return true;
              }
              Velocity.velocityQueueEntryFlag = true;
              buildQueue(next);
            });
          }
          if ((opts.queue === "" || opts.queue === "fx") && $.queue(element)[0] !== "inprogress") {
            $.dequeue(element);
          }
        }
        $.each(elements, function(i, element) {
          if (Type.isNode(element)) {
            processElement(element, i);
          }
        });
        opts = $.extend({}, Velocity.defaults, options);
        opts.loop = parseInt(opts.loop, 10);
        var reverseCallsCount = (opts.loop * 2) - 1;
        if (opts.loop) {
          for (var x = 0; x < reverseCallsCount; x++) {
            var reverseOptions = {
              delay: opts.delay,
              progress: opts.progress
            };
            if (x === reverseCallsCount - 1) {
              reverseOptions.display = opts.display;
              reverseOptions.visibility = opts.visibility;
              reverseOptions.complete = opts.complete;
            }
            animate(elements, "reverse", reverseOptions);
          }
        }
        return getChain();
      };
      Velocity = $.extend(animate, Velocity);
      Velocity.animate = animate;
      var ticker = window.requestAnimationFrame || rAFShim;
      if (!Velocity.State.isMobile && document.hidden !== undefined) {
        var updateTicker = function() {
          if (document.hidden) {
            ticker = function(callback) {
              return setTimeout(function() {
                callback(true);
              }, 16);
            };
            tick();
          } else {
            ticker = window.requestAnimationFrame || rAFShim;
          }
        };
        updateTicker();
        document.addEventListener("visibilitychange", updateTicker);
      }
      function tick(timestamp) {
        if (timestamp) {
          var timeCurrent = Velocity.timestamp && timestamp !== true ? timestamp : performance.now();
          var callsLength = Velocity.State.calls.length;
          if (callsLength > 10000) {
            Velocity.State.calls = compactSparseArray(Velocity.State.calls);
            callsLength = Velocity.State.calls.length;
          }
          for (var i = 0; i < callsLength; i++) {
            if (!Velocity.State.calls[i]) {
              continue;
            }
            var callContainer = Velocity.State.calls[i],
                call = callContainer[0],
                opts = callContainer[2],
                timeStart = callContainer[3],
                firstTick = !!timeStart,
                tweenDummyValue = null,
                pauseObject = callContainer[5],
                millisecondsEllapsed = callContainer[6];
            if (!timeStart) {
              timeStart = Velocity.State.calls[i][3] = timeCurrent - 16;
            }
            if (pauseObject) {
              if (pauseObject.resume === true) {
                timeStart = callContainer[3] = Math.round(timeCurrent - millisecondsEllapsed - 16);
                callContainer[5] = null;
              } else {
                continue;
              }
            }
            millisecondsEllapsed = callContainer[6] = timeCurrent - timeStart;
            var percentComplete = Math.min((millisecondsEllapsed) / opts.duration, 1);
            for (var j = 0,
                callLength = call.length; j < callLength; j++) {
              var tweensContainer = call[j],
                  element = tweensContainer.element;
              if (!Data(element)) {
                continue;
              }
              var transformPropertyExists = false;
              if (opts.display !== undefined && opts.display !== null && opts.display !== "none") {
                if (opts.display === "flex") {
                  var flexValues = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];
                  $.each(flexValues, function(i, flexValue) {
                    CSS.setPropertyValue(element, "display", flexValue);
                  });
                }
                CSS.setPropertyValue(element, "display", opts.display);
              }
              if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                CSS.setPropertyValue(element, "visibility", opts.visibility);
              }
              for (var property in tweensContainer) {
                if (tweensContainer.hasOwnProperty(property) && property !== "element") {
                  var tween = tweensContainer[property],
                      currentValue,
                      easing = Type.isString(tween.easing) ? Velocity.Easings[tween.easing] : tween.easing;
                  if (Type.isString(tween.pattern)) {
                    var patternReplace = percentComplete === 1 ? function($0, index, round) {
                      var result = tween.endValue[index];
                      return round ? Math.round(result) : result;
                    } : function($0, index, round) {
                      var startValue = tween.startValue[index],
                          tweenDelta = tween.endValue[index] - startValue,
                          result = startValue + (tweenDelta * easing(percentComplete, opts, tweenDelta));
                      return round ? Math.round(result) : result;
                    };
                    currentValue = tween.pattern.replace(/{(\d+)(!)?}/g, patternReplace);
                  } else if (percentComplete === 1) {
                    currentValue = tween.endValue;
                  } else {
                    var tweenDelta = tween.endValue - tween.startValue;
                    currentValue = tween.startValue + (tweenDelta * easing(percentComplete, opts, tweenDelta));
                  }
                  if (!firstTick && (currentValue === tween.currentValue)) {
                    continue;
                  }
                  tween.currentValue = currentValue;
                  if (property === "tween") {
                    tweenDummyValue = currentValue;
                  } else {
                    var hookRoot;
                    if (CSS.Hooks.registered[property]) {
                      hookRoot = CSS.Hooks.getRoot(property);
                      var rootPropertyValueCache = Data(element).rootPropertyValueCache[hookRoot];
                      if (rootPropertyValueCache) {
                        tween.rootPropertyValue = rootPropertyValueCache;
                      }
                    }
                    var adjustedSetData = CSS.setPropertyValue(element, property, tween.currentValue + (IE < 9 && parseFloat(currentValue) === 0 ? "" : tween.unitType), tween.rootPropertyValue, tween.scrollData);
                    if (CSS.Hooks.registered[property]) {
                      if (CSS.Normalizations.registered[hookRoot]) {
                        Data(element).rootPropertyValueCache[hookRoot] = CSS.Normalizations.registered[hookRoot]("extract", null, adjustedSetData[1]);
                      } else {
                        Data(element).rootPropertyValueCache[hookRoot] = adjustedSetData[1];
                      }
                    }
                    if (adjustedSetData[0] === "transform") {
                      transformPropertyExists = true;
                    }
                  }
                }
              }
              if (opts.mobileHA) {
                if (Data(element).transformCache.translate3d === undefined) {
                  Data(element).transformCache.translate3d = "(0px, 0px, 0px)";
                  transformPropertyExists = true;
                }
              }
              if (transformPropertyExists) {
                CSS.flushTransformCache(element);
              }
            }
            if (opts.display !== undefined && opts.display !== "none") {
              Velocity.State.calls[i][2].display = false;
            }
            if (opts.visibility !== undefined && opts.visibility !== "hidden") {
              Velocity.State.calls[i][2].visibility = false;
            }
            if (opts.progress) {
              opts.progress.call(callContainer[1], callContainer[1], percentComplete, Math.max(0, (timeStart + opts.duration) - timeCurrent), timeStart, tweenDummyValue);
            }
            if (percentComplete === 1) {
              completeCall(i);
            }
          }
        }
        if (Velocity.State.isTicking) {
          ticker(tick);
        }
      }
      function completeCall(callIndex, isStopped) {
        if (!Velocity.State.calls[callIndex]) {
          return false;
        }
        var call = Velocity.State.calls[callIndex][0],
            elements = Velocity.State.calls[callIndex][1],
            opts = Velocity.State.calls[callIndex][2],
            resolver = Velocity.State.calls[callIndex][4];
        var remainingCallsExist = false;
        for (var i = 0,
            callLength = call.length; i < callLength; i++) {
          var element = call[i].element;
          if (!isStopped && !opts.loop) {
            if (opts.display === "none") {
              CSS.setPropertyValue(element, "display", opts.display);
            }
            if (opts.visibility === "hidden") {
              CSS.setPropertyValue(element, "visibility", opts.visibility);
            }
          }
          var data = Data(element);
          if (opts.loop !== true && ($.queue(element)[1] === undefined || !/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))) {
            if (data) {
              data.isAnimating = false;
              data.rootPropertyValueCache = {};
              var transformHAPropertyExists = false;
              $.each(CSS.Lists.transforms3D, function(i, transformName) {
                var defaultValue = /^scale/.test(transformName) ? 1 : 0,
                    currentValue = data.transformCache[transformName];
                if (data.transformCache[transformName] !== undefined && new RegExp("^\\(" + defaultValue + "[^.]").test(currentValue)) {
                  transformHAPropertyExists = true;
                  delete data.transformCache[transformName];
                }
              });
              if (opts.mobileHA) {
                transformHAPropertyExists = true;
                delete data.transformCache.translate3d;
              }
              if (transformHAPropertyExists) {
                CSS.flushTransformCache(element);
              }
              CSS.Values.removeClass(element, "velocity-animating");
            }
          }
          if (!isStopped && opts.complete && !opts.loop && (i === callLength - 1)) {
            try {
              opts.complete.call(elements, elements);
            } catch (error) {
              setTimeout(function() {
                throw error;
              }, 1);
            }
          }
          if (resolver && opts.loop !== true) {
            resolver(elements);
          }
          if (data && opts.loop === true && !isStopped) {
            $.each(data.tweensContainer, function(propertyName, tweenContainer) {
              if (/^rotate/.test(propertyName) && ((parseFloat(tweenContainer.startValue) - parseFloat(tweenContainer.endValue)) % 360 === 0)) {
                var oldStartValue = tweenContainer.startValue;
                tweenContainer.startValue = tweenContainer.endValue;
                tweenContainer.endValue = oldStartValue;
              }
              if (/^backgroundPosition/.test(propertyName) && parseFloat(tweenContainer.endValue) === 100 && tweenContainer.unitType === "%") {
                tweenContainer.endValue = 0;
                tweenContainer.startValue = 100;
              }
            });
            Velocity(element, "reverse", {
              loop: true,
              delay: opts.delay
            });
          }
          if (opts.queue !== false) {
            $.dequeue(element, opts.queue);
          }
        }
        Velocity.State.calls[callIndex] = false;
        for (var j = 0,
            callsLength = Velocity.State.calls.length; j < callsLength; j++) {
          if (Velocity.State.calls[j] !== false) {
            remainingCallsExist = true;
            break;
          }
        }
        if (remainingCallsExist === false) {
          Velocity.State.isTicking = false;
          delete Velocity.State.calls;
          Velocity.State.calls = [];
        }
      }
      global.Velocity = Velocity;
      if (global !== window) {
        global.fn.velocity = animate;
        global.fn.velocity.defaults = Velocity.defaults;
      }
      $.each(["Down", "Up"], function(i, direction) {
        Velocity.Redirects["slide" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
          var opts = $.extend({}, options),
              begin = opts.begin,
              complete = opts.complete,
              inlineValues = {},
              computedValues = {
                height: "",
                marginTop: "",
                marginBottom: "",
                paddingTop: "",
                paddingBottom: ""
              };
          if (opts.display === undefined) {
            opts.display = (direction === "Down" ? (Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" : "block") : "none");
          }
          opts.begin = function() {
            if (elementsIndex === 0 && begin) {
              begin.call(elements, elements);
            }
            for (var property in computedValues) {
              if (!computedValues.hasOwnProperty(property)) {
                continue;
              }
              inlineValues[property] = element.style[property];
              var propertyValue = CSS.getPropertyValue(element, property);
              computedValues[property] = (direction === "Down") ? [propertyValue, 0] : [0, propertyValue];
            }
            inlineValues.overflow = element.style.overflow;
            element.style.overflow = "hidden";
          };
          opts.complete = function() {
            for (var property in inlineValues) {
              if (inlineValues.hasOwnProperty(property)) {
                element.style[property] = inlineValues[property];
              }
            }
            if (elementsIndex === elementsSize - 1) {
              if (complete) {
                complete.call(elements, elements);
              }
              if (promiseData) {
                promiseData.resolver(elements);
              }
            }
          };
          Velocity(element, computedValues, opts);
        };
      });
      $.each(["In", "Out"], function(i, direction) {
        Velocity.Redirects["fade" + direction] = function(element, options, elementsIndex, elementsSize, elements, promiseData) {
          var opts = $.extend({}, options),
              complete = opts.complete,
              propertiesMap = {opacity: (direction === "In") ? 1 : 0};
          if (elementsIndex !== 0) {
            opts.begin = null;
          }
          if (elementsIndex !== elementsSize - 1) {
            opts.complete = null;
          } else {
            opts.complete = function() {
              if (complete) {
                complete.call(elements, elements);
              }
              if (promiseData) {
                promiseData.resolver(elements);
              }
            };
          }
          if (opts.display === undefined) {
            opts.display = (direction === "In" ? "auto" : "none");
          }
          Velocity(this, propertiesMap, opts);
        };
      });
      return Velocity;
    }((window.jQuery || window.Zepto || window), window, (window ? window.document : undefined));
  }));
})(require('process'));
