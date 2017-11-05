import { h, patch, VNode } from "picodom"

export type State = number | string | boolean | Array<any>

export interface Update<M extends Module<InternalModule>> {
  (value: Partial<M>): Partial<M>
}

export type ActionResult = {}

export interface InternalAction<M extends Module<InternalModule>> {
  (module: M, update: Update<M>): ActionResult
}

export interface InternalModule {
  [key: string]: InternalModule | State | InternalAction<Module<any>>
}

export interface View {
  (): VNode<any>
}

export type Module<M extends InternalModule> = {
  view?: () => VNode<any>
}

export function app<M extends InternalModule>(
  module: M,
  container?: HTMLElement
): Module<M> {
  let root = (container || document.body).children[0]
  let node = vnode(root, [].map)
  let patchLock = false
  let globalModule = partiallyApply(module, [])

  repaint()

  return globalModule

  function partiallyApply(module: any, path: string[]): Module<M> {
    const result = {}
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
        set(globalModule, path, partiallyApply(slice, path))
        render()
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
    if (globalModule.view && !patchLock) {
      patchLock = !patchLock
      setTimeout(render, patchLock)
    }
  }

  function render() {
    patchLock = !patchLock
    if (!patchLock) {
      const result = globalModule.view()
      root = patch(node, result, root as HTMLElement)
    }
  }
}
