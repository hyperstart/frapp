import { isVNode } from "../src"

test("isVNode handles all corner cases", done => {
  expect(isVNode(1)).toBe(false)
  expect(isVNode(0)).toBeFalsy()
  expect(isVNode(true)).toBe(false)
  expect(isVNode(false)).toBe(false)
  expect(isVNode(null)).toBeFalsy()
  expect(isVNode(undefined)).toBeFalsy()
  expect(isVNode("")).toBeFalsy()
  expect(isVNode("Hey")).toBe(false)
  expect(isVNode([])).toBeFalsy()
  expect(isVNode([1])).toBe(false)
  expect(isVNode({})).toBeFalsy()
  expect(isVNode({ type: "test" })).toBe(false)
  expect(isVNode({ type: true })).toBe(false)
  expect(isVNode({ type: "test", props: {} })).toBe(false)
  expect(isVNode({ type: "test", children: [] })).toBe(false)
  expect(isVNode({ props: {} })).toBe(false)
  expect(isVNode({ children: [] })).toBe(false)
  expect(isVNode({ props: {}, children: [] })).toBe(false)
  expect(isVNode({ type: "test", props: {}, children: [] })).toBe(true)
  done()
})