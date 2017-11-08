# Frapp
[![npm](https://img.shields.io/npm/v/frapp.svg)](http://npm.im/frapp)
[![Travis CI](https://img.shields.io/travis/hyperstart/frapp/master.svg)](https://travis-ci.org/hyperstart/frapp)
[![Codecov](https://img.shields.io/codecov/c/github/hyperstart/frapp/master.svg)](https://codecov.io/gh/hyperstart/frapp)
[![gzip size](http://img.badgesize.io/https://unpkg.com/frapp/dist/index.js?compression=gzip)](https://unpkg.com/frapp/dist/index.js)

Tiny fractal app framework strongly inspired by [Hyperapp](https://github.com/hyperapp/hyperapp) written in typescript.

Features:
 - tiny size
 - functional reactive architecture (state -> view -> actions -> new state -> ...)
 - immutable state allows for powerful debug tools
 - fractal design: make apps composed of apps (it's apps all the way down!)
 - dynamically add sub-apps to main app

# Examples & How to

## 1. Hello World
This simple example shows basic features:
```javascript
import { frapp, h } from "frapp"

frapp({
  // state 
  name: "World",
  // actions (update the state and triggers a re-render)
  setName: (app, update) => event => update({ name: event.target.value })
  // view (pure function of state/actions)
  View: (app) => (
    <h1>Hello {app.name}!</h1>
    Name: <input type="text" value={app.name} onchange={app.setName}>
  )
})
```

## 2. Todo List
/!\ EXAMPLE NOT FINISHED /!\
This more advanced example shows how to compose sub-apps together and dynamically add them to the main app.
```javascript
import { frapp, h } from "frapp"

const createTodo = (title) => ({
  // TODO
})

app({
  // TODO
})
```

# License

Frapp is licensed as MIT. See [LICENSE](./LICENSE) 