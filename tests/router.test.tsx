import {
  back,
  frapp,
  h,
  pushState,
  replaceState,
  router,
  Route,
  Router
} from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("Router module listens to location changes", done => {
  let expected = "/"
  let count = 0
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/")
      }

      const onupdate = () => {
        expect(app.router.location).toBe(expected)
        if (++count === 3) {
          done()
        }
      }

      return <div oncreate={oncreate} onupdate={onupdate} />
    }
  }).app()

  app.router.init()

  setTimeout(() => {
    pushState("/test1")
    expected = "/test1"
  }, 50)
  setTimeout(() => {
    replaceState("/test2")
    expected = "/test2"
  }, 100)
  setTimeout(() => {
    back()
    expected = "/"
  }, 150)
})

test("Route component matches for exact path", done => {
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1" exact={true} View={View} />
    }
  }).app()

  app.router.init()

  // should not create the view
  setTimeout(() => {
    pushState("/test2")
  }, 50)
  // should not create the view
  setTimeout(() => {
    pushState("/test1/extra")
  }, 100)
  // should create the view
  setTimeout(() => {
    pushState("/test1")
  }, 150)
})

test("Route component matches for exact path", done => {
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1/extra")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1" View={View} />
    }
  }).app()

  app.router.init()

  // should not create the view
  setTimeout(() => {
    pushState("/test2")
  }, 50)
  // should create the view
  setTimeout(() => {
    pushState("/test1/extra")
  }, 100)
})

test("Routes component works", done => {
  done()
})
