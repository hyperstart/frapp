import { h, frapp } from "../src"

// test copy pasted from Hyperapp, see https://github.com/hyperapp/hyperapp/blob/master/test/hydration.test.js

beforeEach(() => {
  document.body.innerHTML = ""
})

testHydration(
  "hydrate without container",
  `<main><p>foo</p></main>`,
  [h("p", {}, "foo")],
  null
)

testHydration(
  "hydrate with container",
  `<div id="app"><main><p>foo</p></main></div>`,
  [h("p", {}, "foo")],
  "app"
)

function testHydration(name, ssrBody, children, container) {
  test(name, done => {
    document.body.innerHTML = ssrBody
    frapp(
      {
        View: () =>
          h(
            "main",
            {
              onupdate() {
                expect(document.body.innerHTML).toBe(ssrBody)
                done()
              }
            },
            children
          )
      },
      container && document.getElementById(container)
    )
  })
}
