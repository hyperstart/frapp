import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("View gets called after each action", done => {
  let expectedCount = 0

  const app = frapp<any>({
    count: 0,
    up: (app, u) => u({ count: app.count + 1 }),
    View: app => (
      <div
        oncreate={() => {
          expect(document.body.innerHTML).toBe("<div>0</div>")
        }}
        onupdate={() => {
          expect(document.body.innerHTML).toBe(
            "<div>" + expectedCount + "</div>"
          )
          if (expectedCount === 5) {
            done()
          }
        }}
      >
        {app.count}
      </div>
    )
  }).app()

  const up = () => {
    expectedCount++
    app.up()
  }

  setTimeout(up, 5)
  setTimeout(up, 10)
  setTimeout(up, 15)
  setTimeout(up, 20)
  setTimeout(up, 25)
})
