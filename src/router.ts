import { AppImpl } from "./frapp"
import { h, Component, isVNode, VNode } from "./h"

// # Router Module

const UPDATE_LOCATIONS = []

export interface Router {
  /** State */
  location: string
  /** Methods */
  updateLocation(): void
  init(): void
  destroy(): void
}

export const router = (): AppImpl<Router> => {
  let listener = null

  return {
    /** State */
    location: window.location.pathname,
    /** Methods */
    updateLocation: (app, u) => {
      const location = window.location.pathname
      if (app.location !== location) {
        u({ location })
      }
    },
    init: (app, u): void => {
      listener = (e: PopStateEvent) => {
        app.updateLocation()
      }

      addEventListener("popstate", listener)
      UPDATE_LOCATIONS.push(app.updateLocation)
    },
    destroy: (app, u): void => {
      removeEventListener("popstate", listener)
      const index = UPDATE_LOCATIONS.indexOf(app.updateLocation)
      if (index >= 0) {
        UPDATE_LOCATIONS.splice(index, 1)
      }
    }
  }
}

// # Match Function

const clearSlashes = (path: string): string => {
  return path.substring(
    path.startsWith("/") ? 1 : 0,
    path.length - (path.endsWith("/") ? 1 : 0)
  )
}

const match = (
  location: string,
  path: string,
  exact: boolean
): ViewProps | null => {
  const params = {}
  if (location === path) {
    return { location, path, params }
  }

  const locations = clearSlashes(location).split("/")
  const paths = clearSlashes(path).split("/")

  if (
    paths.length > locations.length ||
    (exact && paths.length < locations.length)
  ) {
    return null
  }

  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i]
    const loc = locations[i]
    if (segment.startsWith(":")) {
      params[segment.substring(1)] = loc
    } else if (segment !== "*" && segment !== loc) {
      return null
    }
  }

  return { location, path, params }
}

// # Route

export interface Params {
  [name: string]: string
}

export interface ViewProps {
  location: string
  path: string
  params: Params
}

export interface RouteProps<Props> {
  path: string
  exact?: boolean
  View: Component<Props & ViewProps>
}

export const Route = <Props = any>(props: RouteProps<Props> & Props): VNode => {
  const { path, exact, View, ...rest } = <any>props
  const childProps = match(location.pathname, path, exact)

  return childProps ? View({ ...rest, childProps }) : null
}

// # Routes

export interface RoutesProps<Props extends ViewProps = any> {
  routes: RouteProps<Props>[]
}

export const Routes = <Props extends ViewProps = any>(
  props: RoutesProps<Props> & Props
): VNode => {
  const { routes, ...rest } = <any>props
  return routes.reduce((prev, next) => {
    return prev ? prev : next({ ...next, ...rest })
  }, null)
}

// # Utility Functions

/**
 * Redirect to the given url by replacing the history's state.
 */
export const replaceState = (to: string): void => {
  if (history && history.replaceState) {
    history.replaceState(null, null, to)
    UPDATE_LOCATIONS.forEach(u => u())
  }
}

/**
 * Navigate to the given url by pushing it to the history.
 */
export const pushState = (to: string): void => {
  if (history && history.pushState) {
    history.pushState(null, null, to)
    UPDATE_LOCATIONS.forEach(u => u())
  }
}

/**
 * Go back one page.
 */
export const back = (): void => {
  if (history && history.back) {
    history.back()
  }
}

// # Link

export interface LinkProps {
  href: string
}

export const Link = (props: LinkProps, children): VNode => {
  const newProps = props as any
  newProps.onclick = (e: Event) => {
    e.preventDefault()
    pushState(props.href)
  }
  return h("a", props, children)
}
