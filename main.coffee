{extend, defaults} = require "./util"

module.exports = ->
  ajax = (options={}) ->
    {headers, method, path, responseType} = options
    method ?= "GET"
    responseType ?= ""

    new Promise (resolve, reject) ->
      xhr = new XMLHttpRequest()
      xhr.open(method, path, true)
      xhr.responseType = responseType

      if headers
        Object.keys(headers).forEach (header) ->
          value = headers[header]
          xhr.setRequestHeader header, value

      xhr.onload = (e) ->
        if (200 <= this.status < 300) or this.status is 304
          resolve this.response
          complete e, xhr, options
        else
          reject e
          complete e, xhr, options

      xhr.onerror = (e) -> 
        reject e
        complete e, xhr, options

      xhr.send()

  complete = (args...) ->
    completeHandlers.forEach (handler) ->
      handler args...

  configure = (optionDefaults) ->
    (path, options={}) ->
      if typeof path is "object"
        options = path
      else
        options.path = path

      defaults options, optionDefaults

      ajax(options)

  completeHandlers = []

  extend ajax,
    ajax: configure {}
    complete: (handler) ->
      completeHandlers.push handler

    getJSON: configure
      responseType: "json"

    getBlob: configure
      responseType: "blob"
