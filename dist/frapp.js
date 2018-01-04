(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.frapp = {})));
}(this, (function (exports) { 'use strict';

function h(type, props) {
  var node;
  var stack = [];
  var children = [];

  for (var i = arguments.length; i-- > 2; ) {
    stack.push(arguments[i]);
  }

  while (stack.length) {
    if (Array.isArray((node = stack.pop()))) {
      for (i = node.length; i--; ) {
        stack.push(node[i]);
      }
    } else if (null == node || true === node || false === node) {
    } else {
      children.push(typeof node === "number" ? node + "" : node);
    }
  }

  return typeof type === "string"
    ? {
        type: type,
        props: props || {},
        children: children
      }
    : type(props || {}, children)
}

var callbacks = [];

function patch(parent, oldNode, newNode) {
  var element = patchElement(parent, parent.children[0], oldNode, newNode);

  for (var cb; (cb = callbacks.pop()); cb()) {}

  return element
}

function copy(target, source) {
  var obj = {};

  for (var i in target) obj[i] = target[i];
  for (var i in source) obj[i] = source[i];

  return obj
}

function getKey(node) {
  return node && node.props ? node.props.key : null
}

function setElementProp(element, name, value, oldValue) {
  if (name === "key") {
  } else if (name === "style") {
    for (var i in copy(oldValue, (value = value || {}))) {
      element[name][i] = value[i] != null ? value[i] : "";
    }
  } else {
    var empty = null == value || false === value;

    if (name in element) {
      try {
        element[name] = null == value ? "" : value;
      } catch (_) {}
    } else if (!empty && typeof value !== "function") {
      element.setAttribute(name, value === true ? "" : value);
    }

    if (empty) {
      element.removeAttribute(name);
    }
  }
}

function createElement(node, isSVG) {
  if (typeof node === "string") {
    var element = document.createTextNode(node);
  } else {
    var element = (isSVG = isSVG || "svg" === node.type)
      ? document.createElementNS("http://www.w3.org/2000/svg", node.type)
      : document.createElement(node.type);

    if (node.props.oncreate) {
      callbacks.push(function() {
        node.props.oncreate(element);
      });
    }

    for (var i = 0; i < node.children.length; i++) {
      element.appendChild(createElement(node.children[i], isSVG));
    }

    for (var i in node.props) {
      setElementProp(element, i, node.props[i]);
    }
  }
  return element
}

function updateElement(element, oldProps, props) {
  for (var i in copy(oldProps, props)) {
    var oldValue = "value" === i || "checked" === i ? element[i] : oldProps[i];

    if (props[i] !== oldValue) {
      setElementProp(element, i, props[i], oldValue);
    }
  }

  if (props.onupdate) {
    callbacks.push(function() {
      props.onupdate(element, oldProps);
    });
  }
}

function removeChildren(element, node, props) {
  if ((props = node.props)) {
    for (var i = 0; i < node.children.length; i++) {
      removeChildren(element.childNodes[i], node.children[i]);
    }

    if (props.ondestroy) {
      props.ondestroy(element);
    }
  }
  return element
}

function removeElement(parent, element, node) {
  function done() {
    parent.removeChild(removeChildren(element, node));
  }

  if (node.props && node.props.onremove) {
    node.props.onremove(element, done);
  } else {
    done();
  }
}

function patchElement(parent, element, oldNode, node, isSVG, nextSibling) {
  if (oldNode == null) {
    element = parent.insertBefore(createElement(node, isSVG), element);
  } else if (node.type != null && node.type === oldNode.type) {
    updateElement(element, oldNode.props, node.props);

    isSVG = isSVG || node.type === "svg";

    var len = node.children.length;
    var oldLen = oldNode.children.length;
    var oldKeyed = {};
    var oldElements = [];
    var keyed = {};

    for (var i = 0; i < oldLen; i++) {
      var oldElement = (oldElements[i] = element.childNodes[i]);
      var oldChild = oldNode.children[i];
      var oldKey = getKey(oldChild);

      if (null != oldKey) {
        oldKeyed[oldKey] = [oldElement, oldChild];
      }
    }

    var i = 0;
    var j = 0;

    while (j < len) {
      var oldElement = oldElements[i];
      var oldChild = oldNode.children[i];
      var newChild = node.children[j];

      var oldKey = getKey(oldChild);
      if (keyed[oldKey]) {
        i++;
        continue
      }

      var newKey = getKey(newChild);

      var keyedNode = oldKeyed[newKey] || [];

      if (null == newKey) {
        if (null == oldKey) {
          patchElement(element, oldElement, oldChild, newChild, isSVG);
          j++;
        }
        i++;
      } else {
        if (oldKey === newKey) {
          patchElement(element, keyedNode[0], keyedNode[1], newChild, isSVG);
          i++;
        } else if (keyedNode[0]) {
          element.insertBefore(keyedNode[0], oldElement);
          patchElement(element, keyedNode[0], keyedNode[1], newChild, isSVG);
        } else {
          patchElement(element, oldElement, null, newChild, isSVG);
        }

        j++;
        keyed[newKey] = newChild;
      }
    }

    while (i < oldLen) {
      var oldChild = oldNode.children[i];
      var oldKey = getKey(oldChild);
      if (null == oldKey) {
        removeElement(element, oldElements[i], oldChild);
      }
      i++;
    }

    for (var i in oldKeyed) {
      var keyedNode = oldKeyed[i];
      var reusableNode = keyedNode[1];
      if (!keyed[reusableNode.props.key]) {
        removeElement(element, keyedNode[0], reusableNode);
      }
    }
  } else if (element && node !== element.nodeValue) {
    if (typeof node === "string" && typeof oldNode === "string") {
      element.nodeValue = node;
    } else {
      element = parent.insertBefore(
        createElement(node, isSVG),
        (nextSibling = element)
      );
      removeElement(parent, nextSibling, oldNode);
    }
  }
  return element
}

/**
 * Checks if the given parameter is a VNode.
 */
var isVNode = function (obj) {
    return (obj &&
        typeof obj.type === "string" &&
        typeof obj.props === "object" &&
        Array.isArray(obj.children));
};

/**
 * Get the value at the given path in the given target, or undefined if path doesn't exists.
 */
function get(target, path) {
    path = typeof path === "string" ? path.split(".") : path;
    var result = target;
    for (var i = 0; i < path.length; i++) {
        result = result ? result[path[i]] : result;
    }
    return result;
}
/**
 * Immutable set: set the value at the given path in the given target and returns a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
function set(target, path, value) {
    path = typeof path === "string" ? path.split(".") : path;
    if (path.length === 0) {
        return value;
    }
    return assign(Array.isArray(target) ? [] : {}, target, (_a = {},
        _a[path[0]] = path.length > 1 ? set(target[path[0]] || {}, path.slice(1), value) : value,
        _a));
    var _a;
}
/**
 * Immutable merge: merges the given value and the existing value (if any) at the path in the target using Object.assign() and return a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
function merge(target, path, value) {
    return set(target, path, assign(Array.isArray(value) ? [] : {}, get(target, path), value));
}
function assign(target, obj, obj2) {
    for (var i in obj) {
        target[i] = obj[i];
    }
    for (var i in obj2) {
        target[i] = obj2[i];
    }
    return target;
}

/**
 * Partially applies (wires) the given app's implementation and returns the app's API.
 */
function frapp(app, container) {
    var root = container || document.body;
    var node = vnode(root.children[0], [].map);
    var patchLock = false;
    var callbacks = [];
    var global = wire(app, []);
    repaint();
    return {
        app: function () {
            return global;
        }
    };
    function wire(app, path) {
        var result = {};
        var current = get(global, path);
        Object.keys(app).forEach(function (key) {
            if (typeof app[key] === "function") {
                var fn_1 = app[key].__UNWIRED ? app[key].__UNWIRED : app[key];
                // partially apply function
                result[key] = function () {
                    var value = fn_1(get(global, path), update);
                    if (typeof value === "function") {
                        value = value.apply(null, arguments);
                    }
                    return value;
                };
                result[key].__UNWIRED = fn_1;
                if (current && isAppImpl(current[key])) {
                    unwire(current[key]);
                }
            }
            else if (isAppImpl(app[key])) {
                // recursive call
                result[key] = wire(app[key], path.concat(key));
            }
            else {
                // just set
                result[key] = app[key];
                // if app replaced by primitive type
                if (current && isAppImpl(current[key])) {
                    unwire(current[key]);
                }
            }
        });
        if (!current && typeof result.onWire === "function") {
            callbacks.push(result.onWire);
        }
        return result;
        function update(slice) {
            if (slice) {
                slice = wire(slice, path);
                global = merge(global, path, slice);
                repaint();
            }
            return slice;
        }
    }
    function unwire(app) {
        if (app.onRemove) {
            callbacks.push(app.onRemove);
        }
        Object.keys(app).forEach(function (key) {
            if (isAppImpl(app[key])) {
                unwire(app[key]);
            }
        });
    }
    function vnode(element, map) {
        return (element &&
            h(element.tagName.toLowerCase(), {}, map.call(element.childNodes, function (element) {
                return element.nodeType === 3
                    ? element.nodeValue
                    : vnode(element, map);
            })));
    }
    function repaint() {
        // trigger the lifecycle events, if any
        var c;
        while ((c = callbacks.shift())) {
            c();
        }
        // if repaint is called multiple times between 2 renders (or during), only trigger one re-render
        if (!patchLock) {
            patchLock = !patchLock;
            // call render() as soon as we're done with the current action(s)
            setTimeout(render);
        }
    }
    function render() {
        patchLock = !patchLock;
        // patchLock is now false, allowing actions to be called inside the view and retrigger a repaint()
        // call the view
        var result = global.View ? global.View() : null;
        // only patch if repaint NOT triggered in the view.
        if (result && !patchLock) {
            patch(root, node, result);
            node = result;
        }
    }
}
/**
 * Check if the given value is an object, but not an array.
 */
function isAppImpl(value) {
    return value && typeof value === "object" && !Array.isArray(value);
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

// # Router Module
var UPDATE_LOCATIONS = [];
var router = function () {
    var listener = null;
    return {
        /** State */
        location: window.location.pathname,
        /** Methods */
        updateLocation: function (app, u) {
            var location = window.location.pathname;
            if (app.location !== location) {
                u({ location: location });
            }
        },
        onWire: function (app, u) {
            listener = function (e) {
                app.updateLocation();
            };
            addEventListener("popstate", listener);
            UPDATE_LOCATIONS.push(app.updateLocation);
        },
        onRemove: function (app, u) {
            removeEventListener("popstate", listener);
            var index = UPDATE_LOCATIONS.indexOf(app.updateLocation);
            UPDATE_LOCATIONS.splice(index, 1);
        }
    };
};
// # Match Function
var clearSlashes = function (path) {
    return path.substring(path.startsWith("/") ? 1 : 0, path.length - (path.endsWith("/") ? 1 : 0));
};
var match = function (location, path, exact) {
    var params = {};
    if (location === path) {
        return { location: location, path: path, params: params };
    }
    var locations = clearSlashes(location).split("/");
    var paths = clearSlashes(path).split("/");
    if (paths.length > locations.length ||
        (exact && paths.length < locations.length)) {
        return null;
    }
    for (var i = 0; i < paths.length; i++) {
        var segment = paths[i];
        var loc = locations[i];
        if (segment.startsWith(":")) {
            params[segment.substring(1)] = loc;
        }
        else if (segment !== "*" && segment !== loc) {
            return null;
        }
    }
    return { location: location, path: path, params: params };
};
var Route = function (props) {
    var _a = props, path = _a.path, exact = _a.exact, View = _a.View, rest = __rest(_a, ["path", "exact", "View"]);
    var childProps = match(location.pathname, path, exact);
    return childProps ? View(__assign({}, rest, childProps)) : null;
};
var Routes = function (props) {
    var _a = props, routes = _a.routes, rest = __rest(_a, ["routes"]);
    return routes.reduce(function (prev, next) {
        if (prev) {
            return prev;
        }
        var childProps = match(location.pathname, next.path, next.exact);
        return childProps ? next.View(__assign({}, rest, childProps)) : null;
    }, null);
};
// # Utility Functions
/**
 * Redirect to the given url by replacing the history's state.
 */
var replaceState = function (to) {
    if (history && history.replaceState) {
        history.replaceState(null, null, to);
        UPDATE_LOCATIONS.forEach(function (u) { return u(); });
    }
};
/**
 * Navigate to the given url by pushing it to the history.
 */
var pushState = function (to) {
    if (history && history.pushState) {
        history.pushState(null, null, to);
        UPDATE_LOCATIONS.forEach(function (u) { return u(); });
    }
};
/**
 * Go back one page.
 */
var back = function () {
    if (history && history.back) {
        history.back();
    }
};
var Link = function (props, children) {
    var newProps = props;
    newProps.onclick = function (e) {
        e.preventDefault();
        pushState(props.href);
    };
    return h("a", props, children);
};

exports.frapp = frapp;
exports.isVNode = isVNode;
exports.h = h;
exports.get = get;
exports.set = set;
exports.merge = merge;
exports.router = router;
exports.Route = Route;
exports.Routes = Routes;
exports.replaceState = replaceState;
exports.pushState = pushState;
exports.back = back;
exports.Link = Link;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=frapp.js.map
