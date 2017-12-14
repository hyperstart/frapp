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
  replaceState("/")
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

test("Route component matches for non-exact path", done => {
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

test("Route component matches path with '*'", done => {
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1/test2/test3")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1/*/test3" View={View} />
    }
  }).app()

  app.router.init()

  // should not create the view
  setTimeout(() => {
    pushState("/test1")
  }, 50)
  // should not create the view
  setTimeout(() => {
    pushState("/test1/test2")
  }, 100)
  // should not create the view
  setTimeout(() => {
    pushState("/test1/test2/test2")
  }, 150)

  // should create the view
  setTimeout(() => {
    pushState("/test1/test2/test3")
  }, 200)
})

test("Route component matches any location with path='*'", done => {
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="*" View={View} />
    }
  }).app()

  app.router.init()
})

test("Route component matches path with ':id'", done => {
  const app = frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1/test2/test3")
        expect(document.body.innerHTML).toBe("<div>test2</div>")
        done()
      }

      const View = ({ params }) => <div oncreate={oncreate}>{params.id}</div>

      return <Route path="/test1/:id/test3" View={View} />
    }
  }).app()

  app.router.init()

  // should not create the view
  setTimeout(() => {
    pushState("/test1")
  }, 50)
  // should not create the view
  setTimeout(() => {
    pushState("/test1/test2")
  }, 100)
  // should not create the view
  setTimeout(() => {
    pushState("/test1/test2/test2")
  }, 150)
  // should create the view
  setTimeout(() => {
    pushState("/test1/test2/test3")
  }, 200)
})

// test("Routes component works", done => {
//   done()
// })
