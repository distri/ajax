Ajax = require "../main"

describe "Ajax", ->
  it "should getJSON", (done) ->
    Ajax.getJSON("https://api.github.com/users")
    .then (data) ->
      assert data[0].id is 1
      assert data[0].login is "mojombo"

      done()
