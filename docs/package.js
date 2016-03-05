(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2016 \n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "# ajax\n\nA Promise returning wrapper for XMLHttpRequest\n\nThis aims to be a very small and very direct wrapper for XMLHttpRequest. We\nreturn a native promise and configure the requets via an options object.\n\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "{extend, defaults} = require \"./util\"\n\nrequire \"./shims\"\n\nmodule.exports = ->\n  ajax = (options={}) ->\n    {data, headers, method, overrideMimeType, password, url, responseType, timeout, user, withCredentials} = options\n    data ?= \"\"\n    method ?= \"GET\"\n    password ?= \"\"\n    responseType ?= \"\"\n    timeout ?= 0\n    user ?= \"\"\n    withCredentials ?= false\n\n    new ProgressPromise (resolve, reject, progress) ->\n      xhr = new XMLHttpRequest()\n      xhr.open(method, url, true, user, password)\n      xhr.responseType = responseType\n      xhr.timeout = timeout\n      xhr.withCredentialls = withCredentials\n\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      if overrideMimeType\n        xhr.overrideMimeType overrideMimeType\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          resolve this.response\n          complete e, xhr, options\n        else\n          reject xhr\n          complete e, xhr, options\n\n      xhr.onerror = (e) ->\n        reject xhr\n        complete e, xhr, options\n\n      xhr.onprogress = progress\n\n      xhr.send(data)\n\n  complete = (args...) ->\n    completeHandlers.forEach (handler) ->\n      handler args...\n\n  configure = (optionDefaults) ->\n    (url, options={}) ->\n      if typeof url is \"object\"\n        options = url\n      else\n        options.url = url\n\n      defaults options, optionDefaults\n\n      ajax(options)\n\n  completeHandlers = []\n\n  extend ajax,\n    ajax: configure {}\n    complete: (handler) ->\n      completeHandlers.push handler\n\n    getJSON: configure\n      responseType: \"json\"\n\n    getBlob: configure\n      responseType: \"blob\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.1.5-pre.0\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/test.coffee": {
      "path": "test/test.coffee",
      "content": "Ajax = require \"../main\"\n\ndescribe \"Ajax\", ->\n  it \"should provide progress\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .progress (e) ->\n      console.log e\n    .then (data) ->\n      assert data[0].id is 1\n      done()\n\n  it \"should getJSON\", (done) ->\n    ajax = Ajax()\n\n    ajax\n      url: \"https://api.github.com/users\"\n      responseType: \"json\"\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n\n  it \"should have complete handlers\", (done) ->\n    ajax = Ajax()\n\n    ajax.complete (e, xhr, options) ->\n      done()\n\n    ajax.getJSON(\"https://api.github.com/users\")\n\n\n  it \"should work with options only\", (done) ->\n    ajax = Ajax()\n\n    ajax.getJSON(url: \"https://api.github.com/users\")\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n",
      "mode": "100644",
      "type": "blob"
    },
    "util.coffee": {
      "path": "util.coffee",
      "content": "module.exports =\n  defaults: (target, objects...) ->\n    for object in objects\n      for name of object\n        unless target.hasOwnProperty(name)\n          target[name] = object[name]\n\n    return target\n\n  extend: (target, sources...) ->\n    for source in sources\n      for name of source\n        target[name] = source[name]\n\n    return target\n",
      "mode": "100644",
      "type": "blob"
    },
    "shims.coffee": {
      "path": "shims.coffee",
      "content": "# Extend promises with `finally`\n# From: https://github.com/domenic/promises-unwrapping/issues/18\nPromise.prototype.finally ?= (callback) ->\n  # We don’t invoke the callback in here,\n  # because we want then() to handle its exceptions\n  this.then(\n    # Callback fulfills: pass on predecessor settlement\n    # Callback rejects: pass on rejection (=omit 2nd arg.)\n    (value) ->\n      Promise.resolve(callback())\n      .then -> return value\n    (reason) ->\n      Promise.resolve(callback())\n      .then -> throw reason\n  )\n\n# HACK: I really would prefer not to modify the native Promise prototype, but I\n# know no other way...\n\nPromise.prototype._notify ?= (event) ->\n  @_progressHandlers.forEach (handler) ->\n    try\n      handler(event)\n\nPromise.prototype.progress ?= (handler) ->\n  @_progressHandlers ?= []\n  @_progressHandlers.push handler\n\n  return this\n\nglobal.ProgressPromise = (fn) ->\n  p = new Promise (resolve, reject) ->\n    notify = ->\n      p._progressHandlers?.forEach (handler) ->\n        try\n          handler(event)\n\n    fn(resolve, reject, notify)\n\n  p.then = (onFulfilled, onRejected) ->\n    result = Promise.prototype.then.call(p, onFulfilled, onRejected)\n    # Pass progress through\n    p.progress result._notify.bind(result)\n\n    return result\n\n  return p\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var defaults, extend, _ref,\n    __slice = [].slice;\n\n  _ref = require(\"./util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  require(\"./shims\");\n\n  module.exports = function() {\n    var ajax, complete, completeHandlers, configure;\n    ajax = function(options) {\n      var data, headers, method, overrideMimeType, password, responseType, timeout, url, user, withCredentials;\n      if (options == null) {\n        options = {};\n      }\n      data = options.data, headers = options.headers, method = options.method, overrideMimeType = options.overrideMimeType, password = options.password, url = options.url, responseType = options.responseType, timeout = options.timeout, user = options.user, withCredentials = options.withCredentials;\n      if (data == null) {\n        data = \"\";\n      }\n      if (method == null) {\n        method = \"GET\";\n      }\n      if (password == null) {\n        password = \"\";\n      }\n      if (responseType == null) {\n        responseType = \"\";\n      }\n      if (timeout == null) {\n        timeout = 0;\n      }\n      if (user == null) {\n        user = \"\";\n      }\n      if (withCredentials == null) {\n        withCredentials = false;\n      }\n      return new ProgressPromise(function(resolve, reject, progress) {\n        var xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open(method, url, true, user, password);\n        xhr.responseType = responseType;\n        xhr.timeout = timeout;\n        xhr.withCredentialls = withCredentials;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        if (overrideMimeType) {\n          xhr.overrideMimeType(overrideMimeType);\n        }\n        xhr.onload = function(e) {\n          var _ref1;\n          if (((200 <= (_ref1 = this.status) && _ref1 < 300)) || this.status === 304) {\n            resolve(this.response);\n            return complete(e, xhr, options);\n          } else {\n            reject(xhr);\n            return complete(e, xhr, options);\n          }\n        };\n        xhr.onerror = function(e) {\n          reject(xhr);\n          return complete(e, xhr, options);\n        };\n        xhr.onprogress = progress;\n        return xhr.send(data);\n      });\n    };\n    complete = function() {\n      var args;\n      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n      return completeHandlers.forEach(function(handler) {\n        return handler.apply(null, args);\n      });\n    };\n    configure = function(optionDefaults) {\n      return function(url, options) {\n        if (options == null) {\n          options = {};\n        }\n        if (typeof url === \"object\") {\n          options = url;\n        } else {\n          options.url = url;\n        }\n        defaults(options, optionDefaults);\n        return ajax(options);\n      };\n    };\n    completeHandlers = [];\n    return extend(ajax, {\n      ajax: configure({}),\n      complete: function(handler) {\n        return completeHandlers.push(handler);\n      },\n      getJSON: configure({\n        responseType: \"json\"\n      }),\n      getBlob: configure({\n        responseType: \"blob\"\n      })\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.5-pre.0\"};",
      "type": "blob"
    },
    "test/test": {
      "path": "test/test",
      "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"../main\");\n\n  describe(\"Ajax\", function() {\n    it(\"should provide progress\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).progress(function(e) {\n        return console.log(e);\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        return done();\n      });\n    });\n    it(\"should getJSON\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax({\n        url: \"https://api.github.com/users\",\n        responseType: \"json\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n    it(\"should have complete handlers\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      ajax.complete(function(e, xhr, options) {\n        return done();\n      });\n      return ajax.getJSON(\"https://api.github.com/users\");\n    });\n    return it(\"should work with options only\", function(done) {\n      var ajax;\n      ajax = Ajax();\n      return ajax.getJSON({\n        url: \"https://api.github.com/users\"\n      }).then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "util": {
      "path": "util",
      "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "shims": {
      "path": "shims",
      "content": "(function() {\n  var _base, _base1, _base2;\n\n  if ((_base = Promise.prototype)[\"finally\"] == null) {\n    _base[\"finally\"] = function(callback) {\n      return this.then(function(value) {\n        return Promise.resolve(callback()).then(function() {\n          return value;\n        });\n      }, function(reason) {\n        return Promise.resolve(callback()).then(function() {\n          throw reason;\n        });\n      });\n    };\n  }\n\n  if ((_base1 = Promise.prototype)._notify == null) {\n    _base1._notify = function(event) {\n      return this._progressHandlers.forEach(function(handler) {\n        try {\n          return handler(event);\n        } catch (_error) {}\n      });\n    };\n  }\n\n  if ((_base2 = Promise.prototype).progress == null) {\n    _base2.progress = function(handler) {\n      if (this._progressHandlers == null) {\n        this._progressHandlers = [];\n      }\n      this._progressHandlers.push(handler);\n      return this;\n    };\n  }\n\n  global.ProgressPromise = function(fn) {\n    var p;\n    p = new Promise(function(resolve, reject) {\n      var notify;\n      notify = function() {\n        var _ref;\n        return (_ref = p._progressHandlers) != null ? _ref.forEach(function(handler) {\n          try {\n            return handler(event);\n          } catch (_error) {}\n        }) : void 0;\n      };\n      return fn(resolve, reject, notify);\n    });\n    p.then = function(onFulfilled, onRejected) {\n      var result;\n      result = Promise.prototype.then.call(p, onFulfilled, onRejected);\n      p.progress(result._notify.bind(result));\n      return result;\n    };\n    return p;\n  };\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "version": "0.1.5-pre.0",
  "entryPoint": "main",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "distri/ajax",
    "homepage": null,
    "description": "Promise returning Ajax lib",
    "html_url": "https://github.com/distri/ajax",
    "url": "https://api.github.com/repos/distri/ajax",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});