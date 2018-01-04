import { VNode } from "./h";
/**
 * The update function: takes a Partial of the app, and merges it into the current app's slice.
 * This function partially apply any function in the value, and returns the partially applied object.
 */
export interface Update<A = any> {
    (value: Partial<AppImpl<A>>): Partial<A>;
}
/**
 * Primitive types allowed in the app object
 */
export declare type primitive = null | undefined | boolean | number | string | Array<any>;
/**
 * The type for a (wired) piece of state
 */
export declare type State<S extends primitive> = S;
/**
 * The interface for a wired function with 0 arguments.
 */
export interface WiredFn0<R = any> {
    (): R;
}
/**
 * The type for a function (non-wired) with 0 arguments.
 */
export declare type Fn0<A, F extends WiredFn0> = (app: A, update: Update<A>) => F | any;
/**
 * The interface for a wired function with any number of parameters.
 */
export interface WiredFn {
    (...args: any[]): any;
}
/**
 * The type for a function (non-wired) with any number of parameters.
 */
export declare type Fn<A, F extends WiredFn> = (app: A, update: Update<A>) => F;
/**
 * The interface for the object received by `frapp()`.
 */
export interface WiredApp {
    /**
     * If exists, this function is re-triggered after every update (debounced).
     *
     * @returns the VNode tree to be merged in the DOM or falsy if no update wanted
     */
    View?: () => VNode<any>;
}
/**
 * The interface for modules implementing lifecyle events.
 * This interface shows all supported lifecycle methods on modules.
 * This interface is mainly for documentation purpose.
 * It is not needed to extend it when implementing modules.
 * Just create the desired methods in the corresponding module.
 */
export interface Lifecycle {
    /**
     * Called by frapp() when a module is attached to the main app tree.
     * This method is always called before the view.
     * This method is also called on the main application itself, before the first render.
     */
    onWire?(): void;
    /**
     * Called by frapp() when a module is removed from the main app tree.
     * This method is always called before the view.
     * This method is *NOT* called on the main application itself, since it cannot be "removed" from itself.
     */
    onRemove?(): void;
}
/**
 * Type of an app for the given wired app.
 * @param A The type of the wired app.
 */
export declare type AppImpl<A> = {
    [K in keyof A]: State<A[K] & primitive> | AppImpl<A[K]> | Fn<A, A[K] & WiredFn> | Fn0<A, A[K] & WiredFn0>;
};
export interface App<A extends WiredApp> {
    app(): A;
}
/**
 * The interface for the frapp() function.
 */
export interface Frapp<A extends WiredApp> {
    (app: AppImpl<A>, container?: HTMLElement): App<A>;
}
/**
 * Partially applies (wires) the given app's implementation and returns the app's API.
 */
export declare function frapp<A extends WiredApp = any>(app: AppImpl<A>, container?: HTMLElement): App<A>;
