// fake the update function
const update = (global, path, slice) => slice

test("Middleware", done => {
  let order = 0

  const middleware1 = next => (global, path, slice) => {
    expect(order++).toBe(0)
    const result = next(global, path, slice)
    expect(order++).toBe(3)
    return { m1: result }
  }

  const middleware2 = next => (global, path, slice) => {
    expect(order++).toBe(1)
    const result = next(global, path, slice)
    expect(order++).toBe(2)
    return { m2: result }
  }

  const wrapped = [middleware1, middleware2].reduceRight((prev, current) => {
    return current(prev)
  }, update)

  expect(order).toBe(0)
  expect(wrapped(null, null, { value: 42 })).toEqual({
    m1: { m2: { value: 42 } }
  })
  expect(order).toBe(4)

  done()
})

test("Middleware 2", done => {
  // try out returning a modified version of frapp() if pass in an array...
  function app(prop: object | any[]) {
    const rawUpdate = () => {}
    const update = applyUpdate()
    if (typeof prop === "object") {
      return internalApp()
    } else {
      return internalApp
    }

    function internalApp() {}
  }
})
