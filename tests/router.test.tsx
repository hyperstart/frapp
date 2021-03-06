import {
  back,
  frapp,
  h,
  Link,
  pushState,
  replaceState,
  router,
  Route,
  Routes
} from "../src"

beforeEach(() => {
  document.body.innerHTML = ""
  replaceState("/")
})

test("Router module listens to location changes", done => {
  let expected = "/"
  let count = 0
  frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/")
        pushState("/test1")
        count++
      }

      const onupdate = () => {
        switch (count) {
          case 1:
            expect(app.router.location).toBe("/test1")
            replaceState("/test2")
            break
          case 2:
            expect(app.router.location).toBe("/test2")
            back()
            break
          case 3:
            expect(app.router.location).toBe("/")
            app.router.onRemove()
            done()
            break
        }
        count++
      }

      return <div oncreate={oncreate} onupdate={onupdate} />
    }
  })
})

test("Route component matches for exact path", done => {
  frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1" exact={true} View={View} />
    }
  })

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
  frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1/extra")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1" View={View} />
    }
  })

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
  frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/test1/test2/test3")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="/test1/*/test3" View={View} />
    }
  })

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
  frapp({
    router: router(),
    View: app => {
      const oncreate = () => {
        expect(app.router.location).toBe("/")
        done()
      }

      const View = () => <div oncreate={oncreate} />

      return <Route path="*" View={View} />
    }
  })
})

test("Route component matches path with ':id'", done => {
  frapp({
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
  })

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

test("Routes component only renders one route", done => {
  frapp({
    router: router(),
    View: app => {
      const View1 = () => (
        <div oncreate={() => fail("View1 should never be created")} />
      )
      // must not be a div here...
      const View2 = () => <span oncreate={() => done()} />
      const View3 = () => (
        <div oncreate={() => fail("View3 should never be created")} />
      )
      const View4 = () => <div oncreate={() => pushState("/test1/blah")} />

      return (
        <Routes
          routes={[
            {
              path: "/test1/test2",
              View: View1
            },
            {
              path: "/test1/:id",
              View: View2
            },
            {
              path: "/test1",
              View: View3
            },
            {
              path: "/",
              View: View4
            }
          ]}
        />
      )
    }
  })
})

test("Link changes location", done => {
  frapp({
    View: () => {
      return (
        <Link
          href="/test"
          oncreate={e => {
            e.click()
            expect(location.pathname).toBe("/test")
            done()
          }}
        />
      )
    }
  })
})

test("Router functions handle corner cases", done => {
  const _pushState = history.pushState
  history.pushState = null
  const _replaceState = history.replaceState
  history.replaceState = null
  const _back = history.back
  history.back = null

  try {
    pushState("/anything")
    expect(window.location.pathname).toBe("/")
    replaceState("/somethingElse")
    expect(window.location.pathname).toBe("/")
    back()
    expect(window.location.pathname).toBe("/")
    done()
  } finally {
    history.pushState = _pushState
    history.replaceState = _replaceState
    history.back = _back
  }
})
