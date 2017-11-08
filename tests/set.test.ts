import { set } from "../src"

test("Set objects with empty path", done => {
  const toSet = { value: 42 }
  expect(set({ value: 1 }, [], toSet)).toBe(toSet)
  expect(set({ value2: "1" }, [], toSet)).toEqual(toSet)
  done()
})

test("Set objects with path", done => {
  expect(set({ value: 1 }, ["1", 2], { value: 42 })).toEqual({
    value: 1,
    "1": { 2: { value: 42 } }
  })
  done()
})

test("Set arrays with empty path", done => {
  expect(set([], [], [5])).toEqual([5])
  expect(set([1], [], [5])).toEqual([5])
  expect(set([1], [], [5, 10])).toEqual([5, 10])
  expect(set([1, 2, 3, 4], [], [5, 10])).toEqual([5, 10])

  done()
})

test("Set arrays with path", done => {
  expect(set([1, 2], [1], { value: 42 })).toEqual([1, { value: 42 }])
  done()
})
