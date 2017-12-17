# Frapp
[![npm](https://img.shields.io/npm/v/frapp.svg)](http://npm.im/frapp)
[![Travis CI](https://img.shields.io/travis/hyperstart/frapp/master.svg)](https://travis-ci.org/hyperstart/frapp)
[![Codecov](https://img.shields.io/codecov/c/github/hyperstart/frapp/master.svg)](https://codecov.io/gh/hyperstart/frapp)
[![gzip size](http://img.badgesize.io/https://unpkg.com/frapp/dist/frapp.min.js?compression=gzip)](https://unpkg.com/frapp/dist/frapp.min.js)


Frapp is a tiny front-end framework that allows to write web applications a as set of indepented modules that get composed in interesting ways.

Design goals & principles:
 - fully featured: VDOM, state management, routing, immutability helpers
 - Opinioniated architecture, half way between functional programming and OOP
 - Simple, no magic
 - Easy & fast to learn
 - Tiny size

Each module manages its own state and exposes an public interface for other modules to call.

Modules are simple javascript objects containing:
 - state: primitive types or arrays
 - functions that operate on this state, referred as methods
 - other modules

Basic example:
```javascript
import { frapp, h } from "frapp"

frapp({

  /** State */
  name: "World",

  /** Methods */

  /**
   * frapp() inject (app, update) for you, so that this method becomes (event) => { ... } when accessed by other methods.
   * This process is refered as "wiring" in other parts of the documentation.
   * 
   * app always contains the latest state as well as all the wired methods.
   * update() takes an updated value and applies it to the current module (it may update state, methods or even modules!).
   * 
   * In this case, the name is updated with the value of the input.
   */
  setName: (app, update) => event => update({ name: event.target.value })
  
  /**
   * This is just another method, frapp() expects the root module to have a View() method that
   * returns the content of the view.
   * Note the callback: onchange={app.setName} refers to the "injected" 
   */
  View: (app) => {
    return (
      <h1>Hello {app.name}!</h1>
      Name: <input type="text" value={app.name} onchange={app.setName}>
    )
  }
})
```

# License

Frapp is licensed as MIT. See [LICENSE](./LICENSE) 