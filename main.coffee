require "./shims"

module.exports = ->
  ajax = (options={}) ->
    {data, headers, method, overrideMimeType, password, url, responseType, timeout, user, withCredentials} = options
    data ?= ""
    method ?= "GET"
    password ?= ""
    responseType ?= ""
    timeout ?= 0
    user ?= ""
    withCredentials ?= false

    new ProgressPromise (resolve, reject, progress) ->
      xhr = new XMLHttpRequest()
      xhr.open(method, url, true, user, password)
      xhr.responseType = responseType
      xhr.timeout = timeout
      xhr.withCredentialls = withCredentials

      if headers
        Object.keys(headers).forEach (header) ->
          value = headers[header]
          xhr.setRequestHeader header, value

      if overrideMimeType
        xhr.overrideMimeType overrideMimeType

      xhr.onload = (e) ->
        if (200 <= this.status < 300) or this.status is 304
          resolve this.response
          complete e, xhr, options
        else
          reject xhr
          complete e, xhr, options

      xhr.onerror = (e) ->
        reject xhr
        complete e, xhr, options

      xhr.onprogress = progress

      xhr.send(data)

  complete = (args...) ->
    completeHandlers.forEach (handler) ->
      handler args...

  configure = (optionDefaults) ->
    (url, options={}) ->
      if typeof url is "object"
        options = url
      else
        options.url = url

      defaults options, optionDefaults

      ajax(options)

  completeHandlers = []

  Object.assign ajax,
    ajax: configure {}
    complete: (handler) ->
      completeHandlers.push handler

    getJSON: configure
      responseType: "json"

    getBlob: configure
      responseType: "blob"

defaults = (target, objects...) ->
  for object in objects
    for name of object
      unless target.hasOwnProperty(name)
        target[name] = object[name]

  return target
