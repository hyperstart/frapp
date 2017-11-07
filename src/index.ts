import { h, patch, VNode } from "picodom"
export { h }

export interface Update<A> {
  (value: Partial<A>): Partial<A>
}

export type primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | Array<any>

export interface App {
  [key: string]: App | primitive | Function
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

export type AppImpl<A extends App> = {
  [K in keyof A]:
    | StateImpl<A[K] & primitive>
    | AppImpl<A[K] & A>
    | FuncImpl<A, A[K] & Func>
    | Func0Impl<A[K] & Func0>
}

export function frapp<A extends App>(
  app: AppImpl<A>,
  container?: HTMLElement
): A {
  let root = (container || document.body).children[0]
  let node = vnode(root, [].map)
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
    if (global.View && !patchLock) {
      patchLock = !patchLock
      setTimeout(render)
    }
  }

  function render() {
    patchLock = !patchLock
    const result = global.View()
    if (result && !patchLock) {
      root = patch(node, result, root as HTMLElement)
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
  return assign(assign(Array.isArray(target) ? [] : {}, target), {
    [path[0]]:
      path.length > 1 ? set(target[path[0]], path.slice(1), value) : value
  })
}

export function merge<T = any, V = any, R = any>(
  target: T,
  path: Path,
  value: V
): R {
  return set(target, path, assign(assign({}, get(target, path)), value))
}

function assign(to: any, from: any): any {
  for (let i in from) {
    to[i] = from[i]
  }
  return to
}
