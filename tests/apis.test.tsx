import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Api calls works before patch in view", done => {
  frapp({
    count: 0,
    up: (app, u) => u({ count: app.count + 1 }),
    View: app => {
      if (app.count < 1) {
        app.up()
      }
      // not 0
      expect(app.count).toEqual(1)

      return (
        <div
          oncreate={() => {
            // not 0
            expect(document.body.innerHTML).toBe("<div>1</div>")
            done()
          }}
        >
          {app.count}
        </div>
      )
    }
  })
})

test("Api call gets debounced", done => {
  frapp<any>({
    count: 0,
    up: (app, u) => u({ count: app.count + 1 }),
    fire: app => {
      app.up()
      app.up()
      app.up()
      app.up()
      app.up()
    },
    View: app => (
      <div
        oncreate={() => {
          expect(document.body.innerHTML).toBe("<div>5</div>")
          done()
        }}
      >
        {app.count}
      </div>
    )
  }).fire()
})
