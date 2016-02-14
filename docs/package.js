(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

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
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
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
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
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
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
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

}).call(this);

//# sourceURL=main.coffee
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
      "content": "# ajax\nPromise returning Ajax lib\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "{extend, defaults} = require \"./util\"\n\najax = (path, options={}) ->\n  {headers, method, responseType} = options\n  method ?= \"GET\"\n  responseType ?= \"\"\n\n  new Promise (resolve, reject) ->\n    xhr = new XMLHttpRequest()\n    xhr.open(method, path, true)\n    xhr.responseType = responseType\n\n    if headers\n      Object.keys(headers).forEach (header) ->\n        value = headers[header]\n        xhr.setRequestHeader header, value\n\n    xhr.onload = (e) ->\n      if (200 <= this.status < 300) or this.status is 304\n        try\n          resolve this.response\n        catch error\n          reject error\n      else\n        reject e\n\n    xhr.onerror = reject\n    xhr.send()\n\nconfigure = (optionDefaults) ->\n  (path, options={}) ->\n    defaults options, optionDefaults\n\n    ajax(path, options)\n\nextend ajax,\n  ajax: ajax\n  getJSON: configure\n    responseType: \"json\"\n\n  getBlob: configure\n    responseType: \"blob\"\n\nmodule.exports = ajax\n",
      "mode": "100644"
    },
    "util.coffee": {
      "path": "util.coffee",
      "content": "module.exports =\n  defaults: (target, objects...) ->\n    for object in objects\n      for name of object\n        unless target.hasOwnProperty(name)\n          target[name] = object[name]\n\n    return target\n\n  extend: (target, sources...) ->\n    for source in sources\n      for name of source\n        target[name] = source[name]\n\n    return target\n",
      "mode": "100644"
    },
    "test/test.coffee": {
      "path": "test/test.coffee",
      "content": "Ajax = require \"../main\"\n\ndescribe \"Ajax\", ->\n  it \"should getJSON\", (done) ->\n    Ajax.getJSON(\"https://api.github.com/users\")\n    .then (data) ->\n      assert data[0].id is 1\n      assert data[0].login is \"mojombo\"\n\n      done()\n",
      "mode": "100644"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.1.0\"\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var ajax, configure, defaults, extend, _ref;\n\n  _ref = require(\"./util\"), extend = _ref.extend, defaults = _ref.defaults;\n\n  ajax = function(path, options) {\n    var headers, method, responseType;\n    if (options == null) {\n      options = {};\n    }\n    headers = options.headers, method = options.method, responseType = options.responseType;\n    if (method == null) {\n      method = \"GET\";\n    }\n    if (responseType == null) {\n      responseType = \"\";\n    }\n    return new Promise(function(resolve, reject) {\n      var xhr;\n      xhr = new XMLHttpRequest();\n      xhr.open(method, path, true);\n      xhr.responseType = responseType;\n      if (headers) {\n        Object.keys(headers).forEach(function(header) {\n          var value;\n          value = headers[header];\n          return xhr.setRequestHeader(header, value);\n        });\n      }\n      xhr.onload = function(e) {\n        var error, _ref1;\n        if (((200 <= (_ref1 = this.status) && _ref1 < 300)) || this.status === 304) {\n          try {\n            return resolve(this.response);\n          } catch (_error) {\n            error = _error;\n            return reject(error);\n          }\n        } else {\n          return reject(e);\n        }\n      };\n      xhr.onerror = reject;\n      return xhr.send();\n    });\n  };\n\n  configure = function(optionDefaults) {\n    return function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      defaults(options, optionDefaults);\n      return ajax(path, options);\n    };\n  };\n\n  extend(ajax, {\n    ajax: ajax,\n    getJSON: configure({\n      responseType: \"json\"\n    }),\n    getBlob: configure({\n      responseType: \"blob\"\n    })\n  });\n\n  module.exports = ajax;\n\n}).call(this);\n",
      "type": "blob"
    },
    "util": {
      "path": "util",
      "content": "(function() {\n  var __slice = [].slice;\n\n  module.exports = {\n    defaults: function() {\n      var name, object, objects, target, _i, _len;\n      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = objects.length; _i < _len; _i++) {\n        object = objects[_i];\n        for (name in object) {\n          if (!target.hasOwnProperty(name)) {\n            target[name] = object[name];\n          }\n        }\n      }\n      return target;\n    },\n    extend: function() {\n      var name, source, sources, target, _i, _len;\n      target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      for (_i = 0, _len = sources.length; _i < _len; _i++) {\n        source = sources[_i];\n        for (name in source) {\n          target[name] = source[name];\n        }\n      }\n      return target;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "test/test": {
      "path": "test/test",
      "content": "(function() {\n  var Ajax;\n\n  Ajax = require(\"../main\");\n\n  describe(\"Ajax\", function() {\n    return it(\"should getJSON\", function(done) {\n      return Ajax.getJSON(\"https://api.github.com/users\").then(function(data) {\n        assert(data[0].id === 1);\n        assert(data[0].login === \"mojombo\");\n        return done();\n      });\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.1.0\"};",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "version": "0.1.0",
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