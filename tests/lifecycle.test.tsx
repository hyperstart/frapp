import { frapp, h } from "../src"

test("onWire and onRemove gets called in the right order.", done => {
  let path = ""

  const module = (name: string): any => ({
    onWire: () => (path = path + "+" + name),
    onRemove: () => (path = path + "-" + name)
  })

  const m1 = module("m1")
  m1.m2 = module("m2")
  m1.m2.m3 = module("m3")

  frapp<any>({
    m1,
    onWire: () => (path = path + "+app"),
    onRemove: () => {
      fail("onRemove should not get called on the root app.")
    },
    toggle: (app, u) => u({ m1: app.m1 ? null : m1 }),
    test: app => {
      expect(path).toBe("+m3+m2+m1+app")
      app.toggle()
      expect(path).toBe("+m3+m2+m1+app-m1-m2-m3")
      app.toggle()
      expect(path).toBe("+m3+m2+m1+app-m1-m2-m3+m3+m2+m1")
      done()
    }
  })
    .app()
    .test()
})

test("replacing an app with a primitive type calls onRemove", done => {
  let path = ""

  const module = (name: string): any => ({
    onWire: () => (path = path + "+" + name),
    onRemove: () => (path = path + "-" + name)
  })

  const m1 = module("m1")
  frapp<any>({
    m1,
    onWire: () => (path = path + "+app"),
    onRemove: () => {
      fail("onRemove should not get called on the root app.")
    },
    test: (app, u) => {
      expect(path).toBe("+m1+app")
      u({ m1: 5 })
      expect(path).toBe("+m1+app-m1")
      done()
    }
  })
    .app()
    .test()
})

test("replacing an app with a function calls onRemove", done => {
  let path = ""

  const module = (name: string): any => ({
    onWire: () => (path = path + "+" + name),
    onRemove: () => (path = path + "-" + name)
  })

  const m1 = module("m1")
  frapp<any>({
    m1,
    onWire: () => (path = path + "+app"),
    onRemove: () => {
      fail("onRemove should not get called on the root app.")
    },
    test: (app, u) => {
      expect(path).toBe("+m1+app")
      u({ m1: () => console.log("test") })
      expect(path).toBe("+m1+app-m1")
      done()
    }
  })
    .app()
    .test()
})

test("Modules without onRemove can be removed", done => {
  let path = ""

  const module = (name: string): any => ({
    onWire: () => (path = path + "+" + name)
  })

  const m1 = module("m1")
  m1.m2 = module("m2")
  frapp<any>({
    m1,
    onWire: () => (path = path + "+app"),
    onRemove: () => {
      fail("onRemove should not get called on the root app.")
    },
    test: (app, u) => {
      expect(path).toBe("+m2+m1+app")
      u({ m1: null })
      expect(path).toBe("+m2+m1+app")
      done()
    }
  })
    .app()
    .test()
})
