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
 * The interface for a component.
 */
export interface Component<P = any> {
  (props: P, children: VNode[]): VNode
}

/**
 * Re-export picodom's h() function.
 */
export { h }
