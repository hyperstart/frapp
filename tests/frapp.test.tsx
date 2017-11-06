import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Actions in view", done => {
  const module = frapp({
    count: 0,
    up: (m, u) => u({ count: m.count + 1 }),
    View: m => {
      if (m.count < 1) {
        m.up()
      }
      expect(m.count).toEqual(1)

      return (
        <div
          oncreate={() => {
            expect(m.count).toEqual(1)
            done()
          }}
        >
          {m.count}
        </div>
      )
    }
  })
})
