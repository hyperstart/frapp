import { h, patch, VNode } from "picodom"
export { h }

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
 * The Wired App's interface, i.e. with all its functions pre-wired to (app, update).
 */
export interface WiredApp {
  /**
   * Each property of a wired app should be:
   *  - another wired app (hence, fractal!)
   *  - a wired function (i.e. partially applied to (app, update))
   *  - a piece of state, i.e. a primitive type or an array of primitive types
   */
  [key: string]: WiredApp | primitive | Function
  /** 
   * If exists, this function is re-triggered after every update (debounced).
   * 
   * @returns the VNode tree to be merged in the DOM or falsy if no update wanted
   */
  View?: () => VNode<any>
}

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
export type Fn0<F extends WiredFn0> = F | any

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
 * Type of an app for the given wired app (i.e. the interface of the App, AFTER all functions have been partially applied).
 */
export type App<A extends WiredApp> = {
  [K in keyof A]:
    | State<A[K] & primitive>
    | App<A[K] & A>
    | Fn<A, A[K] & WiredFn>
    | Fn0<A[K] & WiredFn0>
}

export interface WireContext<A extends WiredApp> {
  root: A
  path: Path
}

export interface WireEnhancer<A extends WiredApp> {
  (next: WireEnhancer<A>): (context: WireContext<A>, app: any) => any
}

export interface UpdateContext<A extends WiredApp> {
  root: A
  path: Path
  fnName: string
  fnArgs: any[]
}

export interface UpdateEnhancer<A extends WiredApp> {
  (next: UpdateEnhancer<A>): (context: UpdateContext<A>, update: any) => any
}

export interface FnCallContext<A extends WiredApp> {
  root: A
  path: Path
  fn: string
}

export interface FnCallEnhancer<A extends WiredApp> {
  (next: FnCallEnhancer<A>): (context: FnCallContext<A>, args: any[]) => any
}

export interface AppEnhancer<A extends WiredApp> {
  wire?: WireEnhancer<A>
  update?: UpdateEnhancer<A>
  fnCall?: FnCallEnhancer<A>
}

export interface Frapp<A extends WiredApp> {
  <A extends WiredApp>(app: App<A>, container?: HTMLElement): A
}

/**
 * Partially applies the given app's implementation and returns the app's API.
 */
export function frapp<A extends WiredApp>(
  app: App<A>,
  container?: HTMLElement
): A
/**
 * Applies the given enhancers and returns the frapp() function.
 */
export function frapp<A extends WiredApp>(enhancers: AppEnhancer<A>): Frapp<A>
export function frapp<A extends WiredApp>(
  app: any,
  container?: HTMLElement
): any {
  const rootElement = container || document.body
  let rootNode = vnode(rootElement.children[0], [].map)
  let patchLock = false

  if (Array.isArray(app)) {
    // enhancers
    return null
  } else {
    // app

    let rootApp = partiallyApply<A>(app, [])

    repaint()

    return rootApp
  }

  function partiallyApply<A2 extends WiredApp>(
    app: App<A2>,
    path: string[]
  ): A2 {
    const result: any = {}
    Object.keys(app).forEach(key => {
      if (typeof app[key] === "function") {
        // partially apply function
        result[key] = function() {
          let value = app[key](get(rootApp, path), update)

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
        rootApp = merge(rootApp, path, slice)
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
    const result = rootApp.View ? rootApp.View() : null
    if (result && !patchLock) {
      patch(rootNode, result, rootElement as HTMLElement)
      rootNode = result
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
