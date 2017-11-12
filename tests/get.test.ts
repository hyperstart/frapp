import { get } from "../src"

test("get with empty path", done => {
  const obj = { value: "foo" }
  expect(get(obj, [])).toBe(obj)
  done()
})

test("get existing key", done => {
  const obj = { value: "foo" }
  expect(get({ val: { [5]: [1, 5, { obj }] } }, ["val", 5, 2, "obj"])).toBe(obj)
  done()
})

test("get on array", done => {
  const obj = { value: "foo" }
  expect(get([1, 2, [3, [obj], 6]], [2, 1, 0])).toBe(obj)
  done()
})

test("get with non existing key", done => {
  expect(get({ foo: {} }, ["notExist"])).toBe(undefined)
  done()
})

test("get with non existing key on array", done => {
  expect(get([1, 2], [9])).toBe(undefined)
  done()
})

test("get with string path", done => {
  expect(get({ a: { b: false } }, "a.b")).toBe(false)
  expect(get({ a: { b: false } }, "a.c")).toBe(undefined)
  done()
})
