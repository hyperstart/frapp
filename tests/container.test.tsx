import { h, frapp } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("container", done => {
  document.body.innerHTML = "<main><section></section><div></div></main>"
  frapp(
    {
      View: () => (
        <div
          oncreate={() => {
            expect(document.body.innerHTML).toBe(
              "<main><section></section><div><div>content</div></div></main>"
            )
            done()
          }}
        >
          content
        </div>
      )
    },
    document.body.firstChild.lastChild as HTMLElement
  )
})
