import { merge } from "../src"

test("Merge always creates a new instance", done => {
  const toMerge = { value: 42 }
  expect(merge({}, [], toMerge)).not.toBe(toMerge)
  done()
})

test("Merge objects with empty path", done => {
  expect(merge({ value: 1 }, [], { value: 42 })).toEqual({ value: 42 })
  expect(merge({ value2: "1" }, [], { value: 42 })).toEqual({
    value: 42,
    value2: "1"
  })
  done()
})

test("Merge objects with path", done => {
  expect(merge({ value: 1 }, ["1", 2], { value: 42 })).toEqual({
    value: 1,
    "1": { [2]: { value: 42 } }
  })
  done()
})

test("Merge arrays with empty path", done => {
  expect(merge([], [], [5])).toEqual([5])
  expect(merge([1], [], [5])).toEqual([5])
  expect(merge([1], [], [5, 10])).toEqual([5, 10])
  expect(merge([1, 2, 3, 4], [], [5, 10])).toEqual([5, 10, 3, 4])

  done()
})

test("Merge arrays with path", done => {
  expect(merge([1, 2], [1], { value: 42 })).toEqual([1, { value: 42 }])
  done()
})
