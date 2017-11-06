import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Update returns arguments", done => {
  const module: any = frapp({
    count: 0,
    add: (module, u) => data => u({ count: module.count + data }),
    down: (module, u) => module.add(-1),
    up: (module, u) => module.add(1)
  })

  expect(module.add(5)).toEqual({ count: 5 })
  expect(module.up()).toEqual({ count: 6 })
  expect(module.down()).toEqual({ count: 5 })

  done()
})
