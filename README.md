# frapp

Tiny fractal app framework based on [Hyperapp](https://github.com/hyperapp/hyperapp) written in typescript.

TODO

# Usage

TODO

# Example 1: counter app

```javascript
app({
  // state 
  count: 0,
  // actions
  down: (module, u) => u({ count: module.count - 1 })
  up: (module, u) => value => u({ count: module.count + value })
  // view
  view: (module) => (
    <button onclick={() => module.down()}>-</button>
    {module.count}
    <button onclick={() => module.up(2)}>++</button>
  )
})
```

# Example 2: counter app 2

```javascript
app({
  // state
  count: 0,
  // possible to call other functions
  down: (module, u) => module.up(-1),
  up: (module, u) => value => u({ count: module.count + value })
  // "pre-wired" component
  Counter: (module) => (
    <button onclick={() => module.down()}>-</button>
    {module.count}
    <button onclick={() => module.up(2)}>++</button>
  )
  // use the wired component
  view: (module) => <module.Counter />
})
```

# Example 3: counter app with modules

```javascript
const counter = {
  // state
  count: 0,
  // actions
  down: (module, u) => module.up(-1),
  up: (module, u) => value => u({ count: module.count + value })
  // "pre-wired" component
  Counter: (module) => (
    <button onclick={() => module.down()}>-</button>
    {module.count}
    <button onclick={() => module.up(2)}>++</button>
  )
}
app({
  // module
  counter,
  // use the wired component
  view: (module) => <module.counter.Counter />
})
```

# Example 4: dynamic modules
This part of the proposal is optional, as it may add extra complexity to the code, but it allows to deal with dynamic imports while following the same philosophy as the rest of the proposal.
```javascript
const counter = {
  index: 0,
  count: 0,
  // call other action
  down: (module, u) => module.up(-1),
  up: (module, u) => value => u({ count: module.count + value })
  // "pre-wired" component
  Counter: (module) => (
    <h1>Counter {module.index}</h1>
    <button onclick={() => module.down()}>-</button>
    {module.count}
    <button onclick={() => module.up(2)}>++</button>
  )
}

app({
  // the number of counters currently registered
  counters: 0,
  // action to register a counter
  addCounter: (module, u) => {
    const name = "counter" + module.counters
    // compute the new update object
    const updates = { counters: module.counters + 1 }
    // get the new counter
    updates[name] = Object.assign({}, counter, { index: module.counters })
    // do the update
    u(updates)
  },
  // view
  view: (module) => {
    // get all the counters' components
    const counters = []
    for(let i = 0; i < module.counters; i++) {
      const counter = module["counter" + i]
      counters.push(<counter.Counter />)
    }

    // render them
    return (
      <div>
        {counters}
        <button onclick={module.addCounter}>Add new counter</button>
      </div>
    )
  }
})
```


# Complete API

```javascript
// a module
const counter = {

  // the state is directly written in the module, no more state: { counter: 0 }
  counter: 0,

  // all functions below are wired, all treated the exact same way, no more views, actions, getters, etc...

  // here is the simplest thing: a getter, once wired, it is called as follow: module.isNegative()
  isNegative: (module) => module.counter < 0
  // a getter with a parameter, called module.isBiggerThan(4)
  isBiggerThan: (module) => n => module.counter > n,

  // a setter, the u parameter is for update, it merges what is passed into it to the current state slice
  add: (module, u) => (value) => u({ counter: module.counter + value }),
  // a setter with no parameters
  add1: (module, u) => u({ counter: module.counter + value }),
  // of course, we can use other getters/setters, here is a second way to write add1:
  add1_otherOption: (module) => module.add(1),

  // now a wired component, compatible with JSX, hyperscript, etc... Called: <module.Counter label="value: " />
  Counter: (module) => (props, children) => <div>{props.label || "Counter value: "}{module.counter}</div>

  // a sub-module
  subModule : {
    // this object contains the same things as above.
    otherValue: 0,
    // of course, module is sliced
    add: (module, u) => value => u({ otherValue: module.otherValue + value })
  },

  // EXPERIMENTAL: if we follow the logic above, the u function should be able to take in new functions or modules and wire them dynamically!
  dynamiclyWireNewAction: (module, u) => u({
    add2: (module2, u2) => u2({ counter: module.counter + 2 })
  })
}

// now an app using the module, the object taken by the app is the exact same signature as above, just a module:
app({
  // use module
  counter,
  // view
  view: (module) => <counter.Counter label="Value: " />
})
```
