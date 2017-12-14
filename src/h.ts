import { h } from "picodom"

/**
 * The VNode returned by components
 */
export interface VNode<Props = any> {
  type: string
  props?: Props
  children: Array<VNode<any> | string>
}

/**
 * VNodes accepted by the `h()` function
 */
export type VNodeChildren = Array<VNode | string> | VNode | string

/**
 * Re-export picodom's h() function.
 */
export { h }
