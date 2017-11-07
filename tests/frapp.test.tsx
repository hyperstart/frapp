import { frapp, h } from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Apps are sliced", done => {
  const counter = value => ({
    count: value,
    up: (app, u) => u({ count: app.count + 1 }),
    View: app => {
      if (app.count == value) {
        app.up()
      }
      expect(app.count).toEqual(value + 1)

      return <div>{app.count}</div>
    }
  })

  frapp({
    counter1: counter(1),
    counter2: counter(2),
    counter3: counter(3),
    View: app => {
      return (
        <div
          oncreate={() => {
            expect(document.body.innerHTML).toEqual(
              "<div><div>2</div><div>3</div><div>4</div></div>"
            )
            done()
          }}
        >
          <app.counter1.View />
          <app.counter2.View />
          <app.counter3.View />
        </div>
      )
    }
  })
})
