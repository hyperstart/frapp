import { patch } from "picodom"

import { h, VNode } from "./h"
import { get, merge } from "./immutable"

/**
 * The update function: takes a Partial of the app, and merges it into the current app's slice.
 * This function partially apply any function in the value, and returns the partially applied object.
 */
export interface Update<A = any> {
  (value: Partial<AppImpl<A>>): Partial<A>
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

export interface App<A extends WiredApp> {
  app(): A
}

/**
 * The interface for the frapp() function.
 */
export interface Frapp<A extends WiredApp> {
  (app: AppImpl<A>, container?: HTMLElement): App<A>
}

/**
 * Partially applies (wires) the given app's implementation and returns the app's API.
 */
export function frapp<A extends WiredApp = any>(
  app: AppImpl<A>,
  container?: HTMLElement
): App<A> {
  const root = container || document.body
  let node = vnode(root.children[0], [].map)
  let patchLock = false
  let global = wire<A>(app, [])

  repaint()

  return {
    app() {
      return global
    }
  }

  function wire<A2>(app: AppImpl<A2>, path: string[]): A2 {
    const result: any = {}
    Object.keys(app).forEach(key => {
      if (typeof app[key] === "function") {
        const fn = app[key].__UNWIRED ? app[key].__UNWIRED : app[key]
        // partially apply function
        result[key] = function() {
          let value = fn(get(global, path), update)

          if (typeof value === "function") {
            value = value.apply(null, arguments)
          }

          return value
        }
        result[key].__UNWIRED = fn
      } else if (
        app[key] &&
        typeof app[key] === "object" &&
        !Array.isArray(app[key])
      ) {
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
      // call render() as soon as we're done with the current action(s)
      setTimeout(render)
    }
  }

  function render() {
    patchLock = !patchLock
    // patchLock is now false, allowing actions to be called inside the view and retrigger a repaint()
    const result = global.View ? global.View() : null
    // only patch if repaint NOT triggered in the view.
    if (result && !patchLock) {
      patch(node, result, root as HTMLElement)
      node = result
    }
  }
}