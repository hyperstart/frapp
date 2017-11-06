import { h, patch, VNode } from "picodom"
export { h }

export interface Update<M> {
  (value: Partial<M>): Partial<M>
}

export type primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | Array<any>

export interface Module {
  [key: string]: Module | primitive | Function
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

export type FuncImpl<M, F extends Func> = (module: M, update: Update<M>) => F

export type ModuleImpl<M extends Module> = {
  [K in keyof M]:
    | StateImpl<M[K] & primitive>
    | ModuleImpl<M[K] & Module>
    | FuncImpl<M, M[K] & Func>
    | Func0Impl<M[K] & Func0>
}

export function frapp<M extends Module>(
  module: ModuleImpl<M>,
  container?: HTMLElement
): M {
  let root = (container || document.body).children[0]
  let node = vnode(root, [].map)
  let patchLock = false
  let globalModule = partiallyApply<M>(module, [])

  repaint()

  return globalModule

  function partiallyApply<M2 extends Module>(
    module: ModuleImpl<M2>,
    path: string[]
  ): M2 {
    const result: any = {}
    Object.keys(module).forEach(key => {
      if (typeof module[key] === "function") {
        // partially apply function
        result[key] = function() {
          let value = module[key](get(globalModule, path), update)

          if (typeof value === "function") {
            value = value.apply(null, arguments)
          }

          return value
        }
      } else if (
        typeof module[key] === "object" &&
        !Array.isArray(module[key])
      ) {
        // recursive call
        result[key] = partiallyApply(module[key], path.concat(key))
      } else {
        // just set
        result[key] = module[key]
      }
    })
    return result

    function update(slice) {
      if (slice) {
        globalModule = set(
          globalModule,
          path,
          assign(
            assign({}, get(globalModule, path)),
            partiallyApply(slice, path)
          )
        )
        repaint()
      }
      return slice
    }
  }

  function assign(to, from) {
    for (let i in from) {
      to[i] = from[i]
    }
    return to
  }

  function set(target, path, value) {
    if (path.length === 0) {
      return value
    }
    return assign(assign({}, target), {
      [path[0]]:
        path.length > 1 ? set(target[path[0]], path.slice(1), value) : value
    })
  }

  function get(target, path) {
    for (var i = 0; i < path.length; i++) {
      target = target[path[i]]
    }
    return target
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
    if (globalModule.View && !patchLock) {
      patchLock = !patchLock
      setTimeout(render)
    }
  }

  function render() {
    patchLock = !patchLock
    const result = globalModule.View()
    if (result && !patchLock) {
      root = patch(node, result, root as HTMLElement)
    }
  }
}
