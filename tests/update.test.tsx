import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Update returns its argument.", done => {
  const app: any = frapp<any>({
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

test("Update partially applies app and returns it.", done => {
  const counter = {
    count: 0,
    add: (app, u) => data => u({ count: app.count + data }),
    up: (app, u) => app.add(1)
  }

  const myApp: any = frapp<any>({
    addCounter: (app, u) => u({ counter }).counter
  })

  const applied = myApp.addCounter()
  expect(applied.add(5)).toEqual({ count: 5 })
  expect(applied.add(3)).toEqual({ count: 8 })
  expect(applied.up()).toEqual({ count: 9 })
  expect(applied.up()).toEqual({ count: 10 })

  done()
})

test("Dynamically added apps should be properly wired", done => {
  let callCount = 0
  const counter = {
    // state
    value: 0,
    // actions
    add: (app, update) => value => {
      callCount++
      expect(app).toHaveProperty("value")
      expect(app).toHaveProperty("add")
      expect(app).toHaveProperty("up")
      expect(app).toHaveProperty("View")
      update({ value: app.value + value })
    },
    up: app => {
      callCount++
      expect(app).toHaveProperty("value")
      expect(app).toHaveProperty("add")
      expect(app).toHaveProperty("up")
      expect(app).toHaveProperty("View")
      app.add(1)
    },
    // view
    View: app => {
      if (app.value === 0) {
        app.up()
      }
      expect(app).toHaveProperty("value")
      expect(app).toHaveProperty("add")
      expect(app).toHaveProperty("up")
      expect(app).toHaveProperty("View")
      return (
        <div
          oncreate={() => {
            expect(app.value).toBe(1)
            expect(callCount).toBe(2)
            done()
          }}
        />
      )
    }
  }

  frapp<any>({
    addCounter: (app, update) => {
      return update({ counter })
    },
    View: app => <app.counter.View />
  }).addCounter()
})

test("Update should accept wired functions", done => {
  const app = frapp<any>({
    getApp: app => value => app,
    getValue: app => value => value,
    reWire: (app, u) => u(app)
  })

  const reWired = app.reWire()
  expect(app.getApp()).toEqual(reWired.getApp())
  expect(app.getValue(42)).toBe(reWired.getValue(42))

  done()
})
