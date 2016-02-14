Ajax = require "../main"

describe "Ajax", ->
  it "should getJSON", (done) ->
    ajax = Ajax()

    ajax.getJSON("https://api.github.com/users")
    .then (data) ->
      assert data[0].id is 1
      assert data[0].login is "mojombo"

      done()

  it "should have complete handlers", (done) ->
    ajax = Ajax()

    ajax.complete (e, xhr, options) ->
      done()

    ajax.getJSON("https://api.github.com/users")

  it "should work with options only", (done) ->
    ajax = Ajax()

    ajax.getJSON(path: "https://api.github.com/users")
    .then (data) ->
      assert data[0].id is 1
      assert data[0].login is "mojombo"

      done()
