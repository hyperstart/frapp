import { AppImpl, Lifecycle } from "./frapp";
import { Component, VNode } from "./h";
export interface Router extends Lifecycle {
    /** State */
    location: string;
    /** Methods */
    updateLocation(): void;
}
export declare const router: () => AppImpl<Router>;
export interface Params {
    [name: string]: string;
}
export interface ViewProps {
    location: string;
    path: string;
    params: Params;
}
export interface RouteProps<Props> {
    path: string;
    exact?: boolean;
    View: Component<Props & ViewProps>;
}
export declare const Route: <Props = any>(props: RouteProps<Props>) => VNode<any>;
export interface RoutesProps<Props = any> {
    routes: RouteProps<Props>[];
}
export declare const Routes: <Props = any>(props: RoutesProps<Props> & Props) => VNode<any>;
/**
 * Redirect to the given url by replacing the history's state.
 */
export declare const replaceState: (to: string) => void;
/**
 * Navigate to the given url by pushing it to the history.
 */
export declare const pushState: (to: string) => void;
/**
 * Go back one page.
 */
export declare const back: () => void;
export interface LinkProps {
    href: string;
    [key: string]: any;
}
export declare const Link: (props: LinkProps, children: any) => VNode<any>;
