import { frapp, h, VNode, AppImpl, WiredApp } from "../src"

test("Types compile properly", done => {
  interface Counter {
    count: number
    set(value: number)
    add1()
  }

  const counter: AppImpl<Counter> = {
    count: 0,
    set: (app, u) => count => u({ count }),
    add1: (app, u) => app.set(app.count + 1)
  }

  interface Counters {
    counter1: Counter
    counter2: Counter
  }

  const counters: AppImpl<Counters> = {
    counter1: counter,
    counter2: counter
  }

  interface App extends WiredApp {
    counters: Counters
    counter: Counter
    name: string
    setName(name: string)
    View(): VNode
  }

  const app: AppImpl<App> = {
    counters,
    counter,
    name: "frapp",
    setName: (app, u) => name => u({ name }),
    View: app => <div />
  }

  done()
})
