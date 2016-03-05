# Extend promises with `finally`
# From: https://github.com/domenic/promises-unwrapping/issues/18
Promise.prototype.finally ?= (callback) ->
  # We don’t invoke the callback in here,
  # because we want then() to handle its exceptions
  this.then(
    # Callback fulfills: pass on predecessor settlement
    # Callback rejects: pass on rejection (=omit 2nd arg.)
    (value) ->
      Promise.resolve(callback())
      .then -> return value
    (reason) ->
      Promise.resolve(callback())
      .then -> throw reason
  )

# HACK: I really would prefer not to modify the native Promise prototype, but I
# know no other way...

Promise.prototype._notify ?= (event) ->
  @_progressHandlers.forEach (handler) ->
    try
      handler(event)

Promise.prototype.progress ?= (handler) ->
  @_progressHandlers ?= []
  @_progressHandlers.push handler

  return this

global.ProgressPromise = (fn) ->
  p = new Promise (resolve, reject) ->
    notify = ->
      p._progressHandlers?.forEach (handler) ->
        try
          handler(event)

    fn(resolve, reject, notify)

  p.then = (onFulfilled, onRejected) ->
    result = Promise.prototype.then.call(p, onFulfilled, onRejected)
    # Pass progress through
    p.progress result._notify.bind(result)

    return result

  return p
