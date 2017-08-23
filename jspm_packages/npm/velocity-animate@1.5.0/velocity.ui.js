/* */ 
"format cjs";
(function(process) {
  (function(factory) {
    "use strict";
    if (typeof require === "function" && typeof exports === "object") {
      module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
      define(["velocity"], factory);
    } else {
      factory();
    }
  }(function() {
    "use strict";
    return function(global, window, document, undefined) {
      var Velocity = global.Velocity;
      if (!Velocity || !Velocity.Utilities) {
        if (window.console) {
          console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        }
        return;
      }
      var $ = Velocity.Utilities;
      var velocityVersion = Velocity.version,
          requiredVersion = {
            major: 1,
            minor: 1,
            patch: 0
          };
      function greaterSemver(primary, secondary) {
        var versionInts = [];
        if (!primary || !secondary) {
          return false;
        }
        $.each([primary, secondary], function(i, versionObject) {
          var versionIntsComponents = [];
          $.each(versionObject, function(component, value) {
            while (value.toString().length < 5) {
              value = "0" + value;
            }
            versionIntsComponents.push(value);
          });
          versionInts.push(versionIntsComponents.join(""));
        });
        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
      }
      if (greaterSemver(requiredVersion, velocityVersion)) {
        var abortError = "Velocity UI Pack: You need to update Velocity (velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
      }
      Velocity.RegisterEffect = Velocity.RegisterUI = function(effectName, properties) {
        function animateParentHeight(elements, direction, totalDuration, stagger) {
          var totalHeightDelta = 0,
              parentNode;
          $.each(elements.nodeType ? [elements] : elements, function(i, element) {
            if (stagger) {
              totalDuration += i * stagger;
            }
            parentNode = element.parentNode;
            var propertiesToSum = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"];
            if (Velocity.CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() === "border-box") {
              propertiesToSum = ["height"];
            }
            $.each(propertiesToSum, function(i, property) {
              totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
            });
          });
          Velocity.animate(parentNode, {height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta}, {
            queue: false,
            easing: "ease-in-out",
            duration: totalDuration * (direction === "In" ? 0.6 : 1)
          });
        }
        Velocity.Redirects[effectName] = function(element, redirectOptions, elementsIndex, elementsSize, elements, promiseData, loop) {
          var finalElement = (elementsIndex === elementsSize - 1),
              totalDuration = 0;
          loop = loop || properties.loop;
          if (typeof properties.defaultDuration === "function") {
            properties.defaultDuration = properties.defaultDuration.call(elements, elements);
          } else {
            properties.defaultDuration = parseFloat(properties.defaultDuration);
          }
          for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
            durationPercentage = properties.calls[callIndex][1];
            if (typeof durationPercentage === "number") {
              totalDuration += durationPercentage;
            }
          }
          var shareDuration = totalDuration >= 1 ? 0 : properties.calls.length ? (1 - totalDuration) / properties.calls.length : 1;
          for (callIndex = 0; callIndex < properties.calls.length; callIndex++) {
            var call = properties.calls[callIndex],
                propertyMap = call[0],
                redirectDuration = 1000,
                durationPercentage = call[1],
                callOptions = call[2] || {},
                opts = {};
            if (redirectOptions.duration !== undefined) {
              redirectDuration = redirectOptions.duration;
            } else if (properties.defaultDuration !== undefined) {
              redirectDuration = properties.defaultDuration;
            }
            opts.duration = redirectDuration * (typeof durationPercentage === "number" ? durationPercentage : shareDuration);
            opts.queue = redirectOptions.queue || "";
            opts.easing = callOptions.easing || "ease";
            opts.delay = parseFloat(callOptions.delay) || 0;
            opts.loop = !properties.loop && callOptions.loop;
            opts._cacheValues = callOptions._cacheValues || true;
            if (callIndex === 0) {
              opts.delay += (parseFloat(redirectOptions.delay) || 0);
              if (elementsIndex === 0) {
                opts.begin = function() {
                  if (redirectOptions.begin) {
                    redirectOptions.begin.call(elements, elements);
                  }
                  var direction = effectName.match(/(In|Out)$/);
                  if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                    $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                      Velocity.CSS.setPropertyValue(element, "opacity", 0);
                    });
                  }
                  if (redirectOptions.animateParentHeight && direction) {
                    animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                  }
                };
              }
              if (redirectOptions.display !== null) {
                if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                  opts.display = redirectOptions.display;
                } else if (/In$/.test(effectName)) {
                  var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                  opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                }
              }
              if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                opts.visibility = redirectOptions.visibility;
              }
            }
            if (callIndex === properties.calls.length - 1) {
              var injectFinalCallbacks = function() {
                if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                  $.each(elements.nodeType ? [elements] : elements, function(i, element) {
                    Velocity.CSS.setPropertyValue(element, "display", "none");
                  });
                }
                if (redirectOptions.complete) {
                  redirectOptions.complete.call(elements, elements);
                }
                if (promiseData) {
                  promiseData.resolver(elements || element);
                }
              };
              opts.complete = function() {
                if (loop) {
                  Velocity.Redirects[effectName](element, redirectOptions, elementsIndex, elementsSize, elements, promiseData, loop === true ? true : Math.max(0, loop - 1));
                }
                if (properties.reset) {
                  for (var resetProperty in properties.reset) {
                    if (!properties.reset.hasOwnProperty(resetProperty)) {
                      continue;
                    }
                    var resetValue = properties.reset[resetProperty];
                    if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                      properties.reset[resetProperty] = [properties.reset[resetProperty], properties.reset[resetProperty]];
                    }
                  }
                  var resetOptions = {
                    duration: 0,
                    queue: false
                  };
                  if (finalElement) {
                    resetOptions.complete = injectFinalCallbacks;
                  }
                  Velocity.animate(element, properties.reset, resetOptions);
                } else if (finalElement) {
                  injectFinalCallbacks();
                }
              };
              if (redirectOptions.visibility === "hidden") {
                opts.visibility = redirectOptions.visibility;
              }
            }
            Velocity.animate(element, propertyMap, opts);
          }
        };
        return Velocity;
      };
      Velocity.RegisterEffect.packagedEffects = {
        "callout.bounce": {
          defaultDuration: 550,
          calls: [[{translateY: -30}, 0.25], [{translateY: 0}, 0.125], [{translateY: -15}, 0.125], [{translateY: 0}, 0.25]]
        },
        "callout.shake": {
          defaultDuration: 800,
          calls: [[{translateX: -11}], [{translateX: 11}], [{translateX: -11}], [{translateX: 11}], [{translateX: -11}], [{translateX: 11}], [{translateX: -11}], [{translateX: 0}]]
        },
        "callout.flash": {
          defaultDuration: 1100,
          calls: [[{opacity: [0, "easeInOutQuad", 1]}], [{opacity: [1, "easeInOutQuad"]}], [{opacity: [0, "easeInOutQuad"]}], [{opacity: [1, "easeInOutQuad"]}]]
        },
        "callout.pulse": {
          defaultDuration: 825,
          calls: [[{
            scaleX: 1.1,
            scaleY: 1.1
          }, 0.50, {easing: "easeInExpo"}], [{
            scaleX: 1,
            scaleY: 1
          }, 0.50]]
        },
        "callout.swing": {
          defaultDuration: 950,
          calls: [[{rotateZ: 15}], [{rotateZ: -10}], [{rotateZ: 5}], [{rotateZ: -5}], [{rotateZ: 0}]]
        },
        "callout.tada": {
          defaultDuration: 1000,
          calls: [[{
            scaleX: 0.9,
            scaleY: 0.9,
            rotateZ: -3
          }, 0.10], [{
            scaleX: 1.1,
            scaleY: 1.1,
            rotateZ: 3
          }, 0.10], [{
            scaleX: 1.1,
            scaleY: 1.1,
            rotateZ: -3
          }, 0.10], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], [{
            scaleX: 1,
            scaleY: 1,
            rotateZ: 0
          }, 0.20]]
        },
        "transition.fadeIn": {
          defaultDuration: 500,
          calls: [[{opacity: [1, 0]}]]
        },
        "transition.fadeOut": {
          defaultDuration: 500,
          calls: [[{opacity: [0, 1]}]]
        },
        "transition.flipXIn": {
          defaultDuration: 700,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            rotateY: [0, -55]
          }]],
          reset: {transformPerspective: 0}
        },
        "transition.flipXOut": {
          defaultDuration: 700,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            rotateY: 55
          }]],
          reset: {
            transformPerspective: 0,
            rotateY: 0
          }
        },
        "transition.flipYIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            rotateX: [0, -45]
          }]],
          reset: {transformPerspective: 0}
        },
        "transition.flipYOut": {
          defaultDuration: 800,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            rotateX: 25
          }]],
          reset: {
            transformPerspective: 0,
            rotateX: 0
          }
        },
        "transition.flipBounceXIn": {
          defaultDuration: 900,
          calls: [[{
            opacity: [0.725, 0],
            transformPerspective: [400, 400],
            rotateY: [-10, 90]
          }, 0.50], [{
            opacity: 0.80,
            rotateY: 10
          }, 0.25], [{
            opacity: 1,
            rotateY: 0
          }, 0.25]],
          reset: {transformPerspective: 0}
        },
        "transition.flipBounceXOut": {
          defaultDuration: 800,
          calls: [[{
            opacity: [0.9, 1],
            transformPerspective: [400, 400],
            rotateY: -10
          }], [{
            opacity: 0,
            rotateY: 90
          }]],
          reset: {
            transformPerspective: 0,
            rotateY: 0
          }
        },
        "transition.flipBounceYIn": {
          defaultDuration: 850,
          calls: [[{
            opacity: [0.725, 0],
            transformPerspective: [400, 400],
            rotateX: [-10, 90]
          }, 0.50], [{
            opacity: 0.80,
            rotateX: 10
          }, 0.25], [{
            opacity: 1,
            rotateX: 0
          }, 0.25]],
          reset: {transformPerspective: 0}
        },
        "transition.flipBounceYOut": {
          defaultDuration: 800,
          calls: [[{
            opacity: [0.9, 1],
            transformPerspective: [400, 400],
            rotateX: -15
          }], [{
            opacity: 0,
            rotateX: 90
          }]],
          reset: {
            transformPerspective: 0,
            rotateX: 0
          }
        },
        "transition.swoopIn": {
          defaultDuration: 850,
          calls: [[{
            opacity: [1, 0],
            transformOriginX: ["100%", "50%"],
            transformOriginY: ["100%", "100%"],
            scaleX: [1, 0],
            scaleY: [1, 0],
            translateX: [0, -700],
            translateZ: 0
          }]],
          reset: {
            transformOriginX: "50%",
            transformOriginY: "50%"
          }
        },
        "transition.swoopOut": {
          defaultDuration: 850,
          calls: [[{
            opacity: [0, 1],
            transformOriginX: ["50%", "100%"],
            transformOriginY: ["100%", "100%"],
            scaleX: 0,
            scaleY: 0,
            translateX: -700,
            translateZ: 0
          }]],
          reset: {
            transformOriginX: "50%",
            transformOriginY: "50%",
            scaleX: 1,
            scaleY: 1,
            translateX: 0
          }
        },
        "transition.whirlIn": {
          defaultDuration: 850,
          calls: [[{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 0],
            scaleY: [1, 0],
            rotateY: [0, 160]
          }, 1, {easing: "easeInOutSine"}]]
        },
        "transition.whirlOut": {
          defaultDuration: 750,
          calls: [[{
            opacity: [0, "easeInOutQuint", 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 0,
            scaleY: 0,
            rotateY: 160
          }, 1, {easing: "swing"}]],
          reset: {
            scaleX: 1,
            scaleY: 1,
            rotateY: 0
          }
        },
        "transition.shrinkIn": {
          defaultDuration: 750,
          calls: [[{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 1.5],
            scaleY: [1, 1.5],
            translateZ: 0
          }]]
        },
        "transition.shrinkOut": {
          defaultDuration: 600,
          calls: [[{
            opacity: [0, 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 1.3,
            scaleY: 1.3,
            translateZ: 0
          }]],
          reset: {
            scaleX: 1,
            scaleY: 1
          }
        },
        "transition.expandIn": {
          defaultDuration: 700,
          calls: [[{
            opacity: [1, 0],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: [1, 0.625],
            scaleY: [1, 0.625],
            translateZ: 0
          }]]
        },
        "transition.expandOut": {
          defaultDuration: 700,
          calls: [[{
            opacity: [0, 1],
            transformOriginX: ["50%", "50%"],
            transformOriginY: ["50%", "50%"],
            scaleX: 0.5,
            scaleY: 0.5,
            translateZ: 0
          }]],
          reset: {
            scaleX: 1,
            scaleY: 1
          }
        },
        "transition.bounceIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            scaleX: [1.05, 0.3],
            scaleY: [1.05, 0.3]
          }, 0.35], [{
            scaleX: 0.9,
            scaleY: 0.9,
            translateZ: 0
          }, 0.20], [{
            scaleX: 1,
            scaleY: 1
          }, 0.45]]
        },
        "transition.bounceOut": {
          defaultDuration: 800,
          calls: [[{
            scaleX: 0.95,
            scaleY: 0.95
          }, 0.35], [{
            scaleX: 1.1,
            scaleY: 1.1,
            translateZ: 0
          }, 0.35], [{
            opacity: [0, 1],
            scaleX: 0.3,
            scaleY: 0.3
          }, 0.30]],
          reset: {
            scaleX: 1,
            scaleY: 1
          }
        },
        "transition.bounceUpIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            translateY: [-30, 1000]
          }, 0.60, {easing: "easeOutCirc"}], [{translateY: 10}, 0.20], [{translateY: 0}, 0.20]]
        },
        "transition.bounceUpOut": {
          defaultDuration: 1000,
          calls: [[{translateY: 20}, 0.20], [{
            opacity: [0, "easeInCirc", 1],
            translateY: -1000
          }, 0.80]],
          reset: {translateY: 0}
        },
        "transition.bounceDownIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            translateY: [30, -1000]
          }, 0.60, {easing: "easeOutCirc"}], [{translateY: -10}, 0.20], [{translateY: 0}, 0.20]]
        },
        "transition.bounceDownOut": {
          defaultDuration: 1000,
          calls: [[{translateY: -20}, 0.20], [{
            opacity: [0, "easeInCirc", 1],
            translateY: 1000
          }, 0.80]],
          reset: {translateY: 0}
        },
        "transition.bounceLeftIn": {
          defaultDuration: 750,
          calls: [[{
            opacity: [1, 0],
            translateX: [30, -1250]
          }, 0.60, {easing: "easeOutCirc"}], [{translateX: -10}, 0.20], [{translateX: 0}, 0.20]]
        },
        "transition.bounceLeftOut": {
          defaultDuration: 750,
          calls: [[{translateX: 30}, 0.20], [{
            opacity: [0, "easeInCirc", 1],
            translateX: -1250
          }, 0.80]],
          reset: {translateX: 0}
        },
        "transition.bounceRightIn": {
          defaultDuration: 750,
          calls: [[{
            opacity: [1, 0],
            translateX: [-30, 1250]
          }, 0.60, {easing: "easeOutCirc"}], [{translateX: 10}, 0.20], [{translateX: 0}, 0.20]]
        },
        "transition.bounceRightOut": {
          defaultDuration: 750,
          calls: [[{translateX: -30}, 0.20], [{
            opacity: [0, "easeInCirc", 1],
            translateX: 1250
          }, 0.80]],
          reset: {translateX: 0}
        },
        "transition.slideUpIn": {
          defaultDuration: 900,
          calls: [[{
            opacity: [1, 0],
            translateY: [0, 20],
            translateZ: 0
          }]]
        },
        "transition.slideUpOut": {
          defaultDuration: 900,
          calls: [[{
            opacity: [0, 1],
            translateY: -20,
            translateZ: 0
          }]],
          reset: {translateY: 0}
        },
        "transition.slideDownIn": {
          defaultDuration: 900,
          calls: [[{
            opacity: [1, 0],
            translateY: [0, -20],
            translateZ: 0
          }]]
        },
        "transition.slideDownOut": {
          defaultDuration: 900,
          calls: [[{
            opacity: [0, 1],
            translateY: 20,
            translateZ: 0
          }]],
          reset: {translateY: 0}
        },
        "transition.slideLeftIn": {
          defaultDuration: 1000,
          calls: [[{
            opacity: [1, 0],
            translateX: [0, -20],
            translateZ: 0
          }]]
        },
        "transition.slideLeftOut": {
          defaultDuration: 1050,
          calls: [[{
            opacity: [0, 1],
            translateX: -20,
            translateZ: 0
          }]],
          reset: {translateX: 0}
        },
        "transition.slideRightIn": {
          defaultDuration: 1000,
          calls: [[{
            opacity: [1, 0],
            translateX: [0, 20],
            translateZ: 0
          }]]
        },
        "transition.slideRightOut": {
          defaultDuration: 1050,
          calls: [[{
            opacity: [0, 1],
            translateX: 20,
            translateZ: 0
          }]],
          reset: {translateX: 0}
        },
        "transition.slideUpBigIn": {
          defaultDuration: 850,
          calls: [[{
            opacity: [1, 0],
            translateY: [0, 75],
            translateZ: 0
          }]]
        },
        "transition.slideUpBigOut": {
          defaultDuration: 800,
          calls: [[{
            opacity: [0, 1],
            translateY: -75,
            translateZ: 0
          }]],
          reset: {translateY: 0}
        },
        "transition.slideDownBigIn": {
          defaultDuration: 850,
          calls: [[{
            opacity: [1, 0],
            translateY: [0, -75],
            translateZ: 0
          }]]
        },
        "transition.slideDownBigOut": {
          defaultDuration: 800,
          calls: [[{
            opacity: [0, 1],
            translateY: 75,
            translateZ: 0
          }]],
          reset: {translateY: 0}
        },
        "transition.slideLeftBigIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            translateX: [0, -75],
            translateZ: 0
          }]]
        },
        "transition.slideLeftBigOut": {
          defaultDuration: 750,
          calls: [[{
            opacity: [0, 1],
            translateX: -75,
            translateZ: 0
          }]],
          reset: {translateX: 0}
        },
        "transition.slideRightBigIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            translateX: [0, 75],
            translateZ: 0
          }]]
        },
        "transition.slideRightBigOut": {
          defaultDuration: 750,
          calls: [[{
            opacity: [0, 1],
            translateX: 75,
            translateZ: 0
          }]],
          reset: {translateX: 0}
        },
        "transition.perspectiveUpIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: ["100%", "100%"],
            rotateX: [0, -180]
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%"
          }
        },
        "transition.perspectiveUpOut": {
          defaultDuration: 850,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: ["100%", "100%"],
            rotateX: -180
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%",
            rotateX: 0
          }
        },
        "transition.perspectiveDownIn": {
          defaultDuration: 800,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateX: [0, 180]
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%"
          }
        },
        "transition.perspectiveDownOut": {
          defaultDuration: 850,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [800, 800],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateX: 180
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%",
            rotateX: 0
          }
        },
        "transition.perspectiveLeftIn": {
          defaultDuration: 950,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [2000, 2000],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateY: [0, -180]
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%"
          }
        },
        "transition.perspectiveLeftOut": {
          defaultDuration: 950,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [2000, 2000],
            transformOriginX: [0, 0],
            transformOriginY: [0, 0],
            rotateY: -180
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%",
            rotateY: 0
          }
        },
        "transition.perspectiveRightIn": {
          defaultDuration: 950,
          calls: [[{
            opacity: [1, 0],
            transformPerspective: [2000, 2000],
            transformOriginX: ["100%", "100%"],
            transformOriginY: [0, 0],
            rotateY: [0, 180]
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%"
          }
        },
        "transition.perspectiveRightOut": {
          defaultDuration: 950,
          calls: [[{
            opacity: [0, 1],
            transformPerspective: [2000, 2000],
            transformOriginX: ["100%", "100%"],
            transformOriginY: [0, 0],
            rotateY: 180
          }]],
          reset: {
            transformPerspective: 0,
            transformOriginX: "50%",
            transformOriginY: "50%",
            rotateY: 0
          }
        }
      };
      for (var effectName in Velocity.RegisterEffect.packagedEffects) {
        if (Velocity.RegisterEffect.packagedEffects.hasOwnProperty(effectName)) {
          Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
        }
      }
      Velocity.RunSequence = function(originalSequence) {
        var sequence = $.extend(true, [], originalSequence);
        if (sequence.length > 1) {
          $.each(sequence.reverse(), function(i, currentCall) {
            var nextCall = sequence[i + 1];
            if (nextCall) {
              var currentCallOptions = currentCall.o || currentCall.options,
                  nextCallOptions = nextCall.o || nextCall.options;
              var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
                  callbackOriginal = nextCallOptions && nextCallOptions[timing],
                  options = {};
              options[timing] = function() {
                var nextCallElements = nextCall.e || nextCall.elements;
                var elements = nextCallElements.nodeType ? [nextCallElements] : nextCallElements;
                if (callbackOriginal) {
                  callbackOriginal.call(elements, elements);
                }
                Velocity(currentCall);
              };
              if (nextCall.o) {
                nextCall.o = $.extend({}, nextCallOptions, options);
              } else {
                nextCall.options = $.extend({}, nextCallOptions, options);
              }
            }
          });
          sequence.reverse();
        }
        Velocity(sequence[0]);
      };
    }((window.jQuery || window.Zepto || window), window, (window ? window.document : undefined));
  }));
})(require('process'));
