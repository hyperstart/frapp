import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Update returns its argument.", done => {
  const app: any = frapp({
    count: 0,
    add: (app, u) => data => u({ count: app.count + data }),
    down: (app, u) => app.add(-1),
    up: (app, u) => app.add(1)
  })

  expect(app.add(5)).toEqual({ count: 5 })
  expect(app.up()).toEqual({ count: 6 })
  expect(app.down()).toEqual({ count: 5 })

  done()
})

test("Update returns partially applied apps.", done => {
  const counter = {
    count: 0,
    add: (app, u) => data => u({ count: app.count + data }),
    up: (app, u) => app.add(1)
  }

  const myApp: any = frapp({
    addCounter: (app, u) => u({ counter }).counter
  })

  const applied = myApp.addCounter()
  console.log("applied: ", applied)
  expect(applied.add(5)).toEqual({ count: 5 })
  expect(applied.add(3)).toEqual({ count: 8 })
  expect(applied.up()).toEqual({ count: 9 })
  expect(applied.up()).toEqual({ count: 10 })

  done()
})
