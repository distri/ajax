{extend, defaults} = require "./util"

ajax = (path, options={}) ->
  {headers, method, responseType} = options
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
        try
          resolve this.response
        catch error
          reject error
      else
        reject e

    xhr.onerror = reject
    xhr.send()

configure = (optionDefaults) ->
  (path, options={}) ->
    defaults options, optionDefaults

    ajax(path, options)

extend ajax,
  ajax: ajax
  getJSON: configure
    responseType: "json"

  getBlob: configure
    responseType: "blob"

module.exports = ajax
