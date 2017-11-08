import { h, patch, VNode } from "picodom"
export { h }

/**
 * The update function: takes a Partial of the app, and merges it into the current app's slice.
 * This function partially apply any function in the value, and returns the partially applied object.
 */
export interface Update<A> {
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
 * The App's interface.
 */
export interface App {
  /**
   * Each property of an app should be:
   *  - another app (hence, fractal!)
   *  - a function that has been partially applied
   *  - a piece of state, i.e. a primitive type or an array of primitive types
   */
  [key: string]: App | primitive | Function
  /** 
   * If exists, this function is re-triggered after every update (debounced).
   * 
   * @returns the VNode tree to be merged in the DOM or falsy if no update wanted
   */
  View?: () => VNode<any>
}

export type StateImpl<S extends primitive> = S

export interface Func0<R = any> {
  (): R
}

export type Func0Impl<F extends Func0> = F | any

export interface Func {
  (...args): any
}

export type FuncImpl<A, F extends Func> = (app: A, update: Update<A>) => F

/**
 * Type of an app's implementation for the given app's API (i.e. the interface of the App, AFTER all functions have been partially applied).
 */
export type AppImpl<A extends App> = {
  [K in keyof A]:
    | StateImpl<A[K] & primitive>
    | AppImpl<A[K] & A>
    | FuncImpl<A, A[K] & Func>
    | Func0Impl<A[K] & Func0>
}

/**
 * Partially applies the given app's implementation and returns the app's API.
 */
export function frapp<A extends App>(
  app: AppImpl<A>,
  container?: HTMLElement
): A {
  const root = container || document.body
  let node = vnode(root.children[0], [].map)
  let patchLock = false
  let global = partiallyApply<A>(app, [])

  repaint()

  return global

  function partiallyApply<A2 extends App>(
    app: AppImpl<A2>,
    path: string[]
  ): A2 {
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
        result[key] = partiallyApply(app[key], path.concat(key))
      } else {
        // just set
        result[key] = app[key]
      }
    })
    return result

    function update(slice) {
      if (slice) {
        slice = partiallyApply(slice, path)
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
    const result = global.View ? global.View() : null
    if (result && !patchLock) {
      patch(node, result, root as HTMLElement)
      node = result
    }
  }
}

export type Path = Array<string | number>

export function get<T = any, R = any>(target: T, path: Path): R {
  let result: any = target
  for (var i = 0; i < path.length; i++) {
    result = result ? result[path[i]] : result
  }
  return result as R
}

export function set<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  if (path.length === 0) {
    return (value as any) as R
  }
  return assign(Array.isArray(target) ? [] : {}, target, {
    [path[0]]:
      path.length > 1 ? set(target[path[0]], path.slice(1), value) : value
  })
}

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
