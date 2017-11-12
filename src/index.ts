import { h, patch, VNode as PicoNode } from "picodom"
export { h }

/**
 * The VNode returned by components
 */
export type VNode<Props = any> = PicoNode<Props>

/**
 * VNodes accepted by the `h()` function
 */
export type VNodeChildren = Array<VNode | string> | VNode | string

/**
 * The update function: takes a Partial of the app, and merges it into the current app's slice.
 * This function partially apply any function in the value, and returns the partially applied object.
 */
export interface Update<A = any> {
  (value: Partial<A>): Partial<A>
}

/**
 * Primitive types allowed in the app object
 */
export type primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | Array<any>

/**
 * The type for a (wired) piece of state
 */
export type State<S extends primitive> = S

/**
 * The interface for a wired function with 0 arguments.
 */
export interface WiredFn0<R = any> {
  (): R
}

/**
 * The type for a function (non-wired) with 0 arguments.
 */
export type Fn0<A, F extends WiredFn0> = (app: A, update: Update<A>) => F | any

/**
 * The interface for a wired function with any number of parameters.
 */
export interface WiredFn {
  (...args): any
}

/**
 * The type for a function (non-wired) with any number of parameters.
 */
export type Fn<A, F extends WiredFn> = (app: A, update: Update<A>) => F

/**
 * The interface for the object received by `frapp()`.
 */
export interface WiredApp {
  /**
   * If exists, this function is re-triggered after every update (debounced).
   *
   * @returns the VNode tree to be merged in the DOM or falsy if no update wanted
   */
  View?: () => VNode<any>
}

/**
 * Type of an app for the given wired app.
 * @param A The type of the wired app.
 */
export type AppImpl<A> = {
  [K in keyof A]:
    | State<A[K] & primitive>
    | AppImpl<A[K]>
    | Fn<A, A[K] & WiredFn>
    | Fn0<A, A[K] & WiredFn0>
}

/**
 * Partially applies (wires) the given app's implementation and returns the app's API.
 */
export function frapp<A extends WiredApp>(
  app: AppImpl<A>,
  container?: HTMLElement
): A {
  const root = container || document.body
  let node = vnode(root.children[0], [].map)
  let patchLock = false
  let global = wire<A>(app, [])

  repaint()

  return global

  function wire<A2>(app: AppImpl<A2>, path: string[]): A2 {
    const result: any = {}
    Object.keys(app).forEach(key => {
      if (typeof app[key] === "function") {
        // partially apply function
        result[key] = function() {
          let value = app[key](get(global, path), update)

          if (typeof value === "function") {
            value = value.apply(null, arguments)
          }

          return value
        }
      } else if (typeof app[key] === "object" && !Array.isArray(app[key])) {
        // recursive call
        result[key] = wire(app[key], path.concat(key))
      } else {
        // just set
        result[key] = app[key]
      }
    })
    return result

    function update(slice) {
      if (slice) {
        slice = wire(slice, path)
        global = merge(global, path, slice)
        repaint()
      }
      return slice
    }
  }

  function vnode(element, map) {
    return (
      element &&
      h(
        element.tagName.toLowerCase(),
        {},
        map.call(element.childNodes, function(element) {
          return element.nodeType === 3
            ? element.nodeValue
            : vnode(element, map)
        })
      )
    )
  }
  function repaint() {
    // if repaint is called multiple times between 2 renders (or during), only trigger one re-render
    if (!patchLock) {
      patchLock = !patchLock
      setTimeout(render)
    }
  }

  function render() {
    patchLock = !patchLock
    const result = global["View"] ? global["View"]() : null
    if (result && !patchLock) {
      patch(node, result, root as HTMLElement)
      node = result
    }
  }
}

/**
 * Path: Array<string | number>
 */
export type Path = Array<string | number> | string

/**
 * Get the value at the given path in the given target, or undefined if path doesn't exists.
 */
export function get<T = any, R = any>(target: T, path: Path): R {
  path = typeof path === "string" ? path.split(".") : path
  let result: any = target
  for (var i = 0; i < path.length; i++) {
    result = result ? result[path[i]] : result
  }
  return result as R
}

/**
 * Immutable set: set the value at the given path in the given target and returns a new target.
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export function set<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  path = typeof path === "string" ? path.split(".") : path
  if (path.length === 0) {
    return (value as any) as R
  }
  return assign(Array.isArray(target) ? [] : {}, target, {
    [path[0]]:
      path.length > 1 ? set(target[path[0]] || {}, path.slice(1), value) : value
  })
}

/**
 * Immutable merge: merges the given value and the existing value (if any) at the path in the target using Object.assign() and return a new target. 
 * Creates the necessary objects/arrays if the path doesn't exist.
 */
export function merge<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  return set(
    target,
    path,
    assign(Array.isArray(value) ? [] : {}, get(target, path), value)
  )
}

function assign(target: any, obj: any, obj2: any): any {
  for (let i in obj) {
    target[i] = obj[i]
  }
  for (let i in obj2) {
    target[i] = obj2[i]
  }
  return target
}

export default frapp
