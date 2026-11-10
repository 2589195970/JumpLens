import { createRequire } from "node:module"; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/vscode-jsonrpc/lib/common/is.js
var require_is = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/is.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stringArray = exports.array = exports.func = exports.error = exports.number = exports.string = exports.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports.stringArray = stringArray;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messages.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
    var is = require_is();
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2.ParseError = -32700;
      ErrorCodes2.InvalidRequest = -32600;
      ErrorCodes2.MethodNotFound = -32601;
      ErrorCodes2.InvalidParams = -32602;
      ErrorCodes2.InternalError = -32603;
      ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes2.serverErrorStart = -32099;
      ErrorCodes2.MessageWriteError = -32099;
      ErrorCodes2.MessageReadError = -32098;
      ErrorCodes2.PendingResponseRejected = -32097;
      ErrorCodes2.ConnectionInactive = -32096;
      ErrorCodes2.ServerNotInitialized = -32002;
      ErrorCodes2.UnknownErrorCode = -32001;
      ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes2.serverErrorEnd = -32e3;
    })(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
    var ResponseError = class _ResponseError extends Error {
      constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, _ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports.ResponseError = ResponseError;
    var ParameterStructures = class _ParameterStructures {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === _ParameterStructures.auto || value === _ParameterStructures.byName || value === _ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports.NotificationType9 = NotificationType9;
    var Message;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(Message || (exports.Message = Message = {}));
  }
});

// node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LRUCache = exports.LinkedMap = exports.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch || (exports.Touch = Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports.LRUCache = LRUCache;
  }
});

// node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Disposable = void 0;
    var Disposable;
    (function(Disposable2) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable2.create = create;
    })(Disposable || (exports.Disposable = Disposable = {}));
  }
});

// node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/ral.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports.default = RAL;
  }
});

// node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/events.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Emitter = exports.Event = void 0;
    var ral_1 = require_ral();
    var Event;
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(Event || (exports.Event = Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class _Emitter {
      constructor(_options) {
        this._options = _options;
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = _Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});

// node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CancellationTokenSource = exports.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken || (exports.CancellationToken = CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource3 = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports.CancellationTokenSource = CancellationTokenSource3;
  }
});

// node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = void 0;
    var cancellation_1 = require_cancellation();
    var CancellationState;
    (function(CancellationState2) {
      CancellationState2.Continue = 0;
      CancellationState2.Cancelled = 1;
    })(CancellationState || (CancellationState = {}));
    var SharedArraySenderStrategy = class {
      constructor() {
        this.buffers = /* @__PURE__ */ new Map();
      }
      enableCancellation(request) {
        if (request.id === null) {
          return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
      }
      async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === void 0) {
          return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
      }
      cleanup(id) {
        this.buffers.delete(id);
      }
      dispose() {
        this.buffers.clear();
      }
    };
    exports.SharedArraySenderStrategy = SharedArraySenderStrategy;
    var SharedArrayBufferCancellationToken = class {
      constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
      }
      get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
      }
      get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
      }
    };
    var SharedArrayBufferCancellationTokenSource = class {
      constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
      }
      cancel() {
      }
      dispose() {
      }
    };
    var SharedArrayReceiverStrategy = class {
      constructor() {
        this.kind = "request";
      }
      createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === void 0) {
          return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
      }
    };
    exports.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  }
});

// node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports.Semaphore = Semaphore;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var events_1 = require_events();
    var semaphore_1 = require_semaphore();
    var MessageReader;
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(MessageReader || (exports.MessageReader = MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options ?? "utf-8";
        } else {
          charset = options.charset ?? "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        try {
          this.buffer.append(data);
          while (true) {
            if (this.nextMessageLength === -1) {
              const headers = this.buffer.tryReadHeaders(true);
              if (!headers) {
                return;
              }
              const contentLength = headers.get("content-length");
              if (!contentLength) {
                this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
                return;
              }
              const length = parseInt(contentLength);
              if (isNaN(length)) {
                this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                return;
              }
              this.nextMessageLength = length;
            }
            const body = this.buffer.tryReadBody(this.nextMessageLength);
            if (body === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer();
            this.nextMessageLength = -1;
            this.readSemaphore.lock(async () => {
              const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
              const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
              this.callback(message);
            }).catch((error) => {
              this.fireError(error);
            });
          }
        } catch (error) {
          this.fireError(error);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    var MessageWriter;
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(MessageWriter || (exports.MessageWriter = MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        if (options === void 0 || typeof options === "string") {
          return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row: while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          column: while (offset < chunk.length) {
            const value = chunk[offset];
            switch (value) {
              case CR:
                switch (state) {
                  case 0:
                    state = 1;
                    break;
                  case 2:
                    state = 3;
                    break;
                  default:
                    state = 0;
                }
                break;
              case LF:
                switch (state) {
                  case 1:
                    state = 2;
                    break;
                  case 3:
                    state = 4;
                    offset++;
                    break row;
                  default:
                    state = 0;
                }
                break;
              default:
                state = 0;
            }
            offset++;
          }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error(`Message header must separate key and value using ':'
${header}`);
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});

// node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/connection.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.ConnectionOptions = exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.RequestCancellationReceiverStrategy = exports.IdCancellationReceiverStrategy = exports.ConnectionStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = exports.NullLogger = exports.ProgressType = exports.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken || (exports.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports.ConnectionErrors = ConnectionErrors = {}));
    var ConnectionError = class _ConnectionError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, _ConnectionError.prototype);
      }
    };
    exports.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy || (exports.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is;
    })(IdCancellationReceiverStrategy || (exports.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is;
    })(RequestCancellationReceiverStrategy || (exports.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy || (exports.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy || (exports.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy || (exports.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is;
    })(MessageStrategy || (exports.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is;
    })(ConnectionOptions || (exports.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection3(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch((error) => {
            logger.error(`Sending notification failed.`);
            throw error;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              responsePromises.set(id, responsePromise);
              await messageWriter.write(requestMessage);
            } catch (error) {
              responsePromises.delete(id);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
              logger.error(`Sending request failed.`);
              throw error;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection;
    }
    exports.createMessageConnection = createMessageConnection3;
  }
});

// node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/api.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgressType = exports.ProgressToken = exports.createMessageConnection = exports.NullLogger = exports.ConnectionOptions = exports.ConnectionStrategy = exports.AbstractMessageBuffer = exports.WriteableStreamMessageWriter = exports.AbstractMessageWriter = exports.MessageWriter = exports.ReadableStreamMessageReader = exports.AbstractMessageReader = exports.MessageReader = exports.SharedArrayReceiverStrategy = exports.SharedArraySenderStrategy = exports.CancellationToken = exports.CancellationTokenSource = exports.Emitter = exports.Event = exports.Disposable = exports.LRUCache = exports.Touch = exports.LinkedMap = exports.ParameterStructures = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.ErrorCodes = exports.ResponseError = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType0 = exports.RequestType = exports.Message = exports.RAL = void 0;
    exports.MessageStrategy = exports.CancellationStrategy = exports.CancellationSenderStrategy = exports.CancellationReceiverStrategy = exports.ConnectionError = exports.ConnectionErrors = exports.LogTraceNotification = exports.SetTraceNotification = exports.TraceFormat = exports.TraceValues = exports.Trace = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var sharedArrayCancellation_1 = require_sharedArrayCancellation();
    Object.defineProperty(exports, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var messageBuffer_1 = require_messageBuffer();
    Object.defineProperty(exports, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    var ral_1 = require_ral();
    exports.RAL = ral_1.default;
  }
});

// node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS({
  "node_modules/vscode-jsonrpc/lib/node/ril.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = __require("util");
    var api_1 = require_api();
    var MessageBuffer = class _MessageBuffer extends api_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
      }
      emptyBuffer() {
        return _MessageBuffer.emptyBuffer;
      }
      fromString(value, encoding) {
        return Buffer.from(value, encoding);
      }
      toString(value, encoding) {
        if (value instanceof Buffer) {
          return value.toString(encoding);
        } else {
          return new util_1.TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        } else {
          return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
      }
      allocNative(length) {
        return Buffer.allocUnsafe(length);
      }
    };
    MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
    var ReadableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      onData(listener) {
        this.stream.on("data", listener);
        return api_1.Disposable.create(() => this.stream.off("data", listener));
      }
    };
    var WritableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      write(data, encoding) {
        return new Promise((resolve, reject) => {
          const callback = (error) => {
            if (error === void 0 || error === null) {
              resolve();
            } else {
              reject(error);
            }
          };
          if (typeof data === "string") {
            this.stream.write(data, encoding, callback);
          } else {
            this.stream.write(data, callback);
          }
        });
      }
      end() {
        this.stream.end();
      }
    };
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
            } catch (err) {
              return Promise.reject(err);
            }
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            try {
              if (buffer instanceof Buffer) {
                return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
              } else {
                return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
              }
            } catch (err) {
              return Promise.reject(err);
            }
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        api_1.RAL.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports.default = RIL;
  }
});

// node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS({
  "node_modules/vscode-jsonrpc/lib/node/main.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMessageConnection = exports.createServerSocketTransport = exports.createClientSocketTransport = exports.createServerPipeTransport = exports.createClientPipeTransport = exports.generateRandomPipeName = exports.StreamMessageWriter = exports.StreamMessageReader = exports.SocketMessageWriter = exports.SocketMessageReader = exports.PortMessageWriter = exports.PortMessageReader = exports.IPCMessageWriter = exports.IPCMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var path7 = __require("path");
    var os = __require("os");
    var crypto_1 = __require("crypto");
    var net_1 = __require("net");
    var api_1 = require_api();
    __exportStar(require_api(), exports);
    var IPCMessageReader = class extends api_1.AbstractMessageReader {
      constructor(process2) {
        super();
        this.process = process2;
        let eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose());
      }
      listen(callback) {
        this.process.on("message", callback);
        return api_1.Disposable.create(() => this.process.off("message", callback));
      }
    };
    exports.IPCMessageReader = IPCMessageReader;
    var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(process2) {
        super();
        this.process = process2;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose);
      }
      write(msg) {
        try {
          if (typeof this.process.send === "function") {
            this.process.send(msg, void 0, void 0, (error) => {
              if (error) {
                this.errorCount++;
                this.handleError(error, msg);
              } else {
                this.errorCount = 0;
              }
            });
          }
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports.IPCMessageWriter = IPCMessageWriter;
    var PortMessageReader = class extends api_1.AbstractMessageReader {
      constructor(port) {
        super();
        this.onData = new api_1.Emitter();
        port.on("close", () => this.fireClose);
        port.on("error", (error) => this.fireError(error));
        port.on("message", (message) => {
          this.onData.fire(message);
        });
      }
      listen(callback) {
        return this.onData.event(callback);
      }
    };
    exports.PortMessageReader = PortMessageReader;
    var PortMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on("close", () => this.fireClose());
        port.on("error", (error) => this.fireError(error));
      }
      write(msg) {
        try {
          this.port.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports.PortMessageWriter = PortMessageWriter;
    var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(socket, encoding = "utf-8") {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
      }
    };
    exports.SocketMessageReader = SocketMessageReader;
    var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
      }
      dispose() {
        super.dispose();
        this.socket.destroy();
      }
    };
    exports.SocketMessageWriter = SocketMessageWriter;
    var StreamMessageReader3 = class extends api_1.ReadableStreamMessageReader {
      constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
      }
    };
    exports.StreamMessageReader = StreamMessageReader3;
    var StreamMessageWriter3 = class extends api_1.WriteableStreamMessageWriter {
      constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
      }
    };
    exports.StreamMessageWriter = StreamMessageWriter3;
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = /* @__PURE__ */ new Map([
      ["linux", 107],
      ["darwin", 103]
    ]);
    function generateRandomPipeName() {
      const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
      }
      let result;
      if (XDG_RUNTIME_DIR) {
        result = path7.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
      } else {
        result = path7.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
      }
      const limit = safeIpcPathLengths.get(process.platform);
      if (limit !== void 0 && result.length > limit) {
        (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
      }
      return result;
    }
    exports.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        let server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(pipeName, () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(pipeName);
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports.createServerPipeTransport = createServerPipeTransport;
    function createClientSocketTransport(port, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(port, "127.0.0.1");
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports.createServerSocketTransport = createServerSocketTransport;
    function isReadableStream(value) {
      const candidate = value;
      return candidate.read !== void 0 && candidate.addListener !== void 0;
    }
    function isWritableStream(value) {
      const candidate = value;
      return candidate.write !== void 0 && candidate.addListener !== void 0;
    }
    function createMessageConnection3(input, output, logger, options) {
      if (!logger) {
        logger = api_1.NullLogger;
      }
      const reader = isReadableStream(input) ? new StreamMessageReader3(input) : input;
      const writer = isWritableStream(output) ? new StreamMessageWriter3(output) : output;
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports.createMessageConnection = createMessageConnection3;
  }
});

// node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS({
  "node_modules/vscode-jsonrpc/node.js"(exports, module) {
    "use strict";
    module.exports = require_main();
  }
});

// src/worker.ts
import { readFile as readFile3, realpath as realpath2 } from "node:fs/promises";
import path6 from "node:path";
import { fileURLToPath as fileURLToPath3, pathToFileURL as pathToFileURL4 } from "node:url";

// src/project.ts
import { existsSync } from "node:fs";
import { readFile as readFile2, realpath } from "node:fs/promises";
import path2 from "node:path";
import { pathToFileURL } from "node:url";

// src/runtime.ts
import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { createWriteStream } from "node:fs";
import { access, mkdir, readdir, readFile, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
var run = promisify(execFile);
var CACHE = path.join(homedir(), ".cache", "orca-java-navigation");
var JDT_VERSION = "1.63.0";
var JDT_ARCHIVE = "jdt-language-server-1.63.0-202610191322.tar.gz";
var JDT_URL = `https://download.eclipse.org/jdtls/milestones/${JDT_VERSION}/${JDT_ARCHIVE}`;
async function exists(file) {
  return access(file).then(() => true, () => false);
}
async function download(url, destination, sha256, progress) {
  const response = await fetch(url, { signal: AbortSignal.timeout(6e5) });
  if (!response.ok || !response.body) throw new Error(`\u4E0B\u8F7D\u5931\u8D25\uFF08HTTP ${response.status}\uFF09\uFF1A${url}`);
  const size = Number(response.headers.get("content-length"));
  const hash = createHash("sha256");
  let received = 0;
  let lastUpdate = 0;
  const meter = new Transform({ transform(chunk, _encoding, callback) {
    received += chunk.length;
    if (received > 600 * 1024 * 1024) return callback(new Error("\u4E0B\u8F7D\u6587\u4EF6\u8D85\u51FA\u5927\u5C0F\u9650\u5236"));
    hash.update(chunk);
    if (Date.now() - lastUpdate > 1e3) {
      lastUpdate = Date.now();
      progress(`\u6B63\u5728\u4E0B\u8F7D\u8FD0\u884C\u7EC4\u4EF6\uFF1A${Math.round(received / 1024 / 1024)} MB${size ? ` / ${Math.round(size / 1024 / 1024)} MB` : ""}`);
    }
    callback(null, chunk);
  } });
  await pipeline(Readable.fromWeb(response.body), meter, createWriteStream(destination, { flags: "wx" }));
  if (hash.digest("hex") !== sha256.toLowerCase()) throw new Error("\u4E0B\u8F7D\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
}
async function extract(url, checksum, destination, progress) {
  await mkdir(CACHE, { recursive: true });
  const staging = `${destination}.partial-${randomUUID()}`;
  const archive = `${staging}.tar.gz`;
  await mkdir(staging, { recursive: true });
  try {
    await download(url, archive, checksum, progress);
    progress("\u6821\u9A8C\u901A\u8FC7\uFF0C\u6B63\u5728\u89E3\u538B\u8FD0\u884C\u7EC4\u4EF6\u2026");
    await run("tar", ["-xzf", archive, "-C", staging], { timeout: 12e4 });
    try {
      await rename(staging, destination);
    } catch (error) {
      if (!await exists(destination)) throw error;
    }
  } finally {
    await rm(archive, { force: true });
    await rm(staging, { force: true, recursive: true });
  }
}
async function findJava(directory) {
  for (const suffix of ["bin/java", "Contents/Home/bin/java"]) {
    const file = path.join(directory, suffix);
    if (await exists(file)) return file;
  }
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isDirectory()) continue;
    for (const suffix of ["bin/java", "Contents/Home/bin/java"]) {
      const file = path.join(directory, entry.name, suffix);
      if (await exists(file)) return file;
    }
  }
  return null;
}
async function validJava(file) {
  try {
    const { stderr, stdout } = await run(file, ["-version"], { timeout: 1e4 });
    return Number(`${stderr}${stdout}`.match(/version "(\d+)/)?.[1] ?? 0) >= 25;
  } catch {
    return false;
  }
}
async function ensureJava(settings, progress) {
  if (settings.javaHome) {
    const java2 = await findJava(settings.javaHome);
    if (!java2 || !await validJava(java2)) throw new Error("\u8BED\u8A00\u670D\u52A1\u5668 JDK \u9700\u8981 Java 25 \u6216\u66F4\u9AD8\u7248\u672C\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E");
    return java2;
  }
  const cached = path.join(CACHE, "jdk-25");
  if (await exists(cached)) {
    const java2 = await findJava(cached);
    if (java2 && await validJava(java2)) return java2;
  }
  const candidates = [process.env.JAVA_HOME && path.join(process.env.JAVA_HOME, "bin/java"), "java"];
  if (process.platform === "darwin") {
    try {
      const { stdout } = await run("/usr/libexec/java_home", ["-v", "25"], { timeout: 8e3 });
      candidates.unshift(path.join(stdout.trim(), "bin/java"));
    } catch {
    }
  }
  for (const java2 of candidates) if (java2 && await validJava(java2)) return java2;
  const os = process.platform === "darwin" ? "mac" : process.platform === "linux" ? "linux" : null;
  const architecture = process.arch === "arm64" ? "aarch64" : process.arch === "x64" ? "x64" : null;
  if (!os || !architecture) throw new Error("\u8BF7\u5728\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u6307\u5B9A Java 25 \u7684\u5B89\u88C5\u76EE\u5F55");
  progress("\u9996\u6B21\u4F7F\u7528\uFF1A\u51C6\u5907 Java \u8BED\u8A00\u670D\u52A1\u8FD0\u884C\u73AF\u5883\u2026");
  const response = await fetch(`https://api.adoptium.net/v3/assets/latest/25/hotspot?architecture=${architecture}&image_type=jdk&os=${os}&vendor=eclipse`, { signal: AbortSignal.timeout(3e4) });
  if (!response.ok) throw new Error(`\u65E0\u6CD5\u8BFB\u53D6 Java \u8FD0\u884C\u73AF\u5883\u4FE1\u606F\uFF08HTTP ${response.status}\uFF09`);
  const assets = await response.json();
  const pkg = assets[0]?.binary.package;
  if (!pkg || !pkg.link.startsWith("https://github.com/adoptium/") || !/^[a-f\d]{64}$/i.test(pkg.checksum)) throw new Error("Java \u8FD0\u884C\u73AF\u5883\u4E0B\u8F7D\u4FE1\u606F\u65E0\u6548");
  await extract(pkg.link, pkg.checksum, cached, progress);
  const java = await findJava(cached);
  if (!java || !await validJava(java)) throw new Error("Java \u8FD0\u884C\u73AF\u5883\u5B89\u88C5\u5931\u8D25");
  return java;
}
async function ensureRuntime(settings = {}, progress = () => {
}) {
  const java = await ensureJava(settings, progress);
  const server = settings.languageServerHome || path.join(CACHE, `jdtls-${JDT_VERSION}`);
  if (!await exists(path.join(server, "plugins"))) {
    if (settings.languageServerHome) throw new Error("JDT LS \u76EE\u5F55\u4E2D\u7F3A\u5C11 plugins\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E");
    progress("\u9996\u6B21\u4F7F\u7528\uFF1A\u51C6\u5907 Java \u8BED\u8A00\u670D\u52A1\u5668\u2026");
    const response = await fetch(`${JDT_URL}.sha256`, { signal: AbortSignal.timeout(3e4) });
    if (!response.ok) throw new Error("\u65E0\u6CD5\u8BFB\u53D6 JDT LS \u6821\u9A8C\u4FE1\u606F");
    const checksum = (await response.text()).match(/\b[a-f\d]{64}\b/i)?.[0];
    if (!checksum) throw new Error("JDT LS \u6821\u9A8C\u4FE1\u606F\u65E0\u6548");
    await extract(JDT_URL, checksum, server, progress);
  }
  let projectJavaHome = settings.projectJavaHome;
  if (!projectJavaHome && process.platform === "darwin") {
    try {
      projectJavaHome = (await run("/usr/libexec/java_home", ["-v", "1.8"], { timeout: 8e3 })).stdout.trim();
    } catch {
    }
  }
  let projectJavaName;
  if (projectJavaHome) {
    const release = await readFile(path.join(projectJavaHome, "release"), "utf8").catch(() => "");
    let major = release.match(/JAVA_VERSION="(1\.8|\d+)/)?.[1];
    if (!major) {
      const version = await run(path.join(projectJavaHome, "bin/java"), ["-version"], { timeout: 1e4 });
      major = `${version.stderr}${version.stdout}`.match(/version "(1\.8|\d+)/)?.[1];
    }
    if (!major) throw new Error("\u65E0\u6CD5\u8BC6\u522B\u9879\u76EE JDK \u7248\u672C\uFF0C\u8BF7\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E\u4E2D\u7684\u9879\u76EE JDK \u76EE\u5F55");
    projectJavaName = `JavaSE-${major}`;
  }
  const lombok = path.join(CACHE, "lombok-1.18.42.jar");
  if (!await exists(lombok)) {
    progress("\u6B63\u5728\u51C6\u5907 Lombok \u5206\u6790\u652F\u6301\u2026");
    const temporary = `${lombok}.${randomUUID()}.part`;
    try {
      await download("https://repo.maven.apache.org/maven2/org/projectlombok/lombok/1.18.42/lombok-1.18.42.jar", temporary, "3488a4e9994c26596baaceebee58cad36a50e3bdaec5be72b5834d3c3b560306", progress);
      await rename(temporary, lombok);
    } finally {
      await rm(temporary, { force: true });
    }
  }
  progress("Java \u8FD0\u884C\u73AF\u5883\u5DF2\u5C31\u7EEA");
  return { java, server, projectJavaHome, projectJavaName, lombok };
}

// src/languages.ts
var sourceExtensions = ["java", "vue", "ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"];
function languageForPath(file) {
  const extension = file.split("?")[0].split(".").pop()?.toLowerCase();
  if (extension === "vue" || extension === "java" || extension === "tsx" || extension === "jsx" || extension === "json" || extension === "html" || extension === "css" || extension === "scss" || extension === "sass") return extension;
  if (extension === "js" || extension === "mjs" || extension === "cjs") return "javascript";
  if (extension === "ts" || extension === "mts" || extension === "cts") return "typescript";
  return "java";
}
function lspLanguage(file) {
  const language = languageForPath(file);
  return language === "tsx" ? "typescriptreact" : language === "jsx" ? "javascriptreact" : language;
}

// src/project.ts
function bundled(...parts) {
  const marker = ".app/Contents/";
  const at = process.execPath.indexOf(marker);
  if (at < 0) return;
  const file = path2.join(process.execPath.slice(0, at + marker.length), "Resources", ...parts);
  return existsSync(file) ? file : void 0;
}
var CLI = bundled("bin", "orca") ?? "orca";
var RG = bundled("ripgrep", `${process.platform}-${process.arch}`, "rg") ?? "rg";
async function activeWorkspace() {
  const { stdout } = await run(CLI, ["worktree", "ps", "--limit", "10000", "--json"], { timeout: 12e3, maxBuffer: 16 * 1024 * 1024 });
  const response = JSON.parse(stdout);
  if (!response.ok) throw new Error(response.error?.message ?? "\u65E0\u6CD5\u8BFB\u53D6 Orca \u5DE5\u4F5C\u533A");
  const active = response.result.worktrees.filter((row2) => row2.isActive);
  if (active.length !== 1) throw new Error("\u8BF7\u5148\u5728 Orca \u4E2D\u9009\u62E9\u5F53\u524D\u5DE5\u7A0B\u7684\u5DE5\u4F5C\u533A");
  const row = active[0];
  if (row.hostId && row.hostId !== "local" || row.address?.environment !== "local") throw new Error("\u4EE3\u7801\u5BFC\u822A\u76EE\u524D\u652F\u6301\u672C\u673A\u5DE5\u4F5C\u533A");
  if (!row.address?.worktree) throw new Error("\u5F53\u524D\u5DE5\u4F5C\u533A\u5730\u5740\u4E0D\u53EF\u7528");
  return { root: await realpath(row.path), selector: row.address.worktree };
}
function inside(root, file) {
  const relative = path2.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path2.sep}`) && !path2.isAbsolute(relative);
}
function sourceIdentity(text) {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\r\n]*/g, "");
  const packageName = clean.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1] ?? "";
  const names = [...clean.matchAll(/^\s*(?:(?:public|abstract|final|sealed|non-sealed|static|strictfp)\s+)*(?:class|interface|enum|record|@interface)\s+([\w$]+)/gm)].map((match) => match[1]);
  return { packageName, names };
}
async function sourceFiles(root, extensions = sourceExtensions) {
  const { stdout } = await run(RG, ["--files", "--hidden", ...extensions.flatMap((extension) => ["-g", `*.${extension}`]), "-g", "!**/{.git,node_modules,.gradle,.idea,target,build,dist,.nuxt,.next,coverage}/**", root], { timeout: 15e3, maxBuffer: 16 * 1024 * 1024 }).catch((error) => {
    if (error.code === 1) return { stdout: "" };
    throw error;
  });
  return stdout.split(/\r?\n/).filter(Boolean);
}
async function matchDocument(root, text) {
  const identity = sourceIdentity(text);
  const java = /^\s*(?:package\s+[\w.]+\s*;|import\s+(?:static\s+)?[\w.*]+\s*;|public\s+(?:(?:abstract|final|sealed)\s+)*(?:class|interface|enum|record)\s)/m.test(text);
  const files = await sourceFiles(root);
  if (files.length > 5e4) throw new Error("\u5DE5\u4F5C\u533A\u6E90\u7801\u6587\u4EF6\u8FC7\u591A\uFF0C\u8BF7\u6253\u5F00\u5177\u4F53\u5DE5\u7A0B\u540E\u91CD\u8BD5");
  const named = java && identity.names.length ? files.filter((file) => file.endsWith(".java") && identity.names.includes(path2.basename(file, ".java"))) : files;
  const candidates = named.length ? named : files;
  const exact = [];
  const semantic = [];
  const similar = [];
  const lines = new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  for (const file of candidates) {
    const canonical = await realpath(file).catch(() => null);
    if (!canonical || !inside(root, canonical)) continue;
    const source2 = await readFile2(canonical, "utf8").catch(() => null);
    if (source2 === null) continue;
    if (source2.replace(/\r\n/g, "\n") === text.replace(/\r\n/g, "\n")) exact.push(canonical);
    else if (java && identity.names.length && canonical.endsWith(".java")) {
      const other = sourceIdentity(source2);
      if (other.packageName === identity.packageName && other.names.some((name) => identity.names.includes(name))) semantic.push(canonical);
    } else if (text.length > 80) {
      const otherLines = new Set(source2.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
      const common = [...lines].filter((line) => otherLines.has(line)).length;
      const score = common / Math.max(lines.size, otherLines.size, 1);
      if (score >= 0.8 && Math.min(text.length, source2.length) / Math.max(text.length, source2.length) > 0.7) similar.push({ path: canonical, score });
    }
  }
  const best = Math.max(...similar.map((item) => item.score));
  return [...new Set(exact.length ? exact : semantic.length ? semantic : similar.filter((item) => item.score >= best - 0.02).map((item) => item.path))].sort();
}
async function projectRoot(file, workspaceRoot) {
  let current = path2.dirname(file);
  let result;
  while (inside(workspaceRoot, current)) {
    if (languageForPath(file) !== "java" && ["tsconfig.json", "jsconfig.json", "package.json"].some((name) => existsSync(path2.join(current, name)))) return current;
    const buildFile = ["pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"].find((name) => existsSync(path2.join(current, name)));
    if (buildFile) result = current;
    if (current === workspaceRoot) break;
    const parent = path2.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return result ?? workspaceRoot;
}
async function documentContext(file, workspace) {
  const canonical = await realpath(file);
  if (!inside(workspace.root, canonical) || !sourceExtensions.includes(path2.extname(canonical).slice(1))) throw new Error("\u8BF7\u9009\u62E9\u5F53\u524D\u5DE5\u4F5C\u533A\u5185\u7684 Java\u3001Vue \u6216 JS/TS \u6587\u4EF6");
  return { uri: pathToFileURL(canonical).href, path: canonical, root: await projectRoot(canonical, workspace.root), workspace };
}

// src/language-server.ts
var import_node = __toESM(require_node(), 1);
import { spawn } from "node:child_process";
import { createHash as createHash2 } from "node:crypto";
import { cp, mkdir as mkdir2, readdir as readdir2, stat } from "node:fs/promises";
import path3 from "node:path";
import { pathToFileURL as pathToFileURL2 } from "node:url";

// src/types.ts
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function normalizeLocations(value) {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  const unique = /* @__PURE__ */ new Map();
  for (const item of items) {
    const uri = item.targetUri ?? item.uri;
    const range = item.targetSelectionRange ?? item.range ?? item.targetRange;
    if (typeof uri !== "string" || !range?.start || !range?.end) continue;
    const key = `${uri}:${range.start.line}:${range.start.character}:${range.end.line}:${range.end.character}`;
    unique.set(key, { uri, range, label: decodeURIComponent(uri.split("/").pop()?.split("?")[0] ?? uri) });
  }
  return [...unique.values()];
}

// src/language-server.ts
var LanguageServer = class {
  constructor(root, runtime, progress, log = () => {
  }) {
    this.root = root;
    this.runtime = runtime;
    this.progress = progress;
    this.log = log;
  }
  connection;
  child;
  ready;
  documents = /* @__PURE__ */ new Map();
  queue = Promise.resolve();
  initialization;
  resolveInitialized;
  stderr = "";
  stopped = false;
  start() {
    if (this.stopped) return Promise.reject(new Error("Java \u8BED\u8A00\u670D\u52A1\u5DF2\u505C\u6B62\uFF0C\u8BF7\u91CD\u8BD5"));
    return this.ready ??= this.launch();
  }
  async launch() {
    const workspace = path3.join(CACHE, "workspaces", createHash2("sha256").update(this.root).digest("hex").slice(0, 24));
    await mkdir2(workspace, { recursive: true });
    const plugins = await readdir2(path3.join(this.runtime.server, "plugins"));
    const launcher = plugins.find((file) => /^org\.eclipse\.equinox\.launcher_[^/]+\.jar$/.test(file));
    if (!launcher) throw new Error("JDT LS \u7F3A\u5C11\u542F\u52A8\u7EC4\u4EF6");
    const platform = process.platform === "darwin" ? "mac" : process.platform === "win32" ? "win" : "linux";
    const configNames = process.arch === "arm64" ? [`config_${platform}_arm`, `config_${platform}`] : [`config_${platform}`];
    let template;
    for (const name of configNames) {
      const location = path3.join(this.runtime.server, name);
      if (await stat(location).then((s) => s.isDirectory(), () => false)) {
        template = location;
        break;
      }
    }
    if (!template) throw new Error("JDT LS \u7F3A\u5C11\u5F53\u524D\u5E73\u53F0\u914D\u7F6E");
    const config = path3.join(workspace, "configuration");
    await cp(template, config, { recursive: true, force: false });
    const args = ["-Declipse.application=org.eclipse.jdt.ls.core.id1", "-Dosgi.bundles.defaultStartLevel=4", "-Declipse.product=org.eclipse.jdt.ls.core.product", "-Djava.import.generatesMetadataFilesAtProjectRoot=false", "-Dlog.level=WARNING", "-Dfile.encoding=UTF-8", "-Xmx1G", "--add-modules=ALL-SYSTEM", "--add-opens", "java.base/java.util=ALL-UNNAMED", "--add-opens", "java.base/java.lang=ALL-UNNAMED"];
    const lombok = plugins.find((name) => /lombok.*\.jar$/i.test(name));
    if (this.runtime.lombok) args.push(`-javaagent:${this.runtime.lombok}`);
    else if (lombok) args.push(`-javaagent:${path3.join(this.runtime.server, "plugins", lombok)}`);
    args.push("-jar", path3.join(this.runtime.server, "plugins", launcher), "-configuration", config, "-data", path3.join(workspace, "data"));
    this.progress("\u6B63\u5728\u542F\u52A8 Java \u5206\u6790\u670D\u52A1\u2026");
    const env = { ...process.env };
    delete env.CLIENT_PORT;
    delete env.CLIENT_HOST;
    const child = spawn(this.runtime.java, args, { cwd: this.root, env, stdio: "pipe" });
    this.child = child;
    child.stderr.on("data", (chunk) => {
      this.stderr = (this.stderr + String(chunk)).slice(-6e3);
    });
    const connection = (0, import_node.createMessageConnection)(new import_node.StreamMessageReader(child.stdout), new import_node.StreamMessageWriter(child.stdin));
    this.connection = connection;
    child.on("error", (error) => {
      this.log(error.message);
      connection.dispose();
      this.stopped = true;
      this.resolveInitialized?.();
    });
    child.on("exit", (code) => {
      this.log(`JDT LS \u9000\u51FA\uFF1A${code ?? "signal"} ${this.stderr}`);
      this.stopped = true;
      connection.dispose();
      this.resolveInitialized?.();
    });
    connection.onError((error) => this.log(String(error)));
    connection.onRequest("workspace/configuration", (params) => params.items.map((item) => item.section === "java" ? this.javaSettings() : null));
    connection.onRequest("client/registerCapability", () => null);
    connection.onRequest("client/unregisterCapability", () => null);
    connection.onRequest("window/workDoneProgress/create", () => null);
    connection.onRequest("window/showMessageRequest", () => null);
    connection.onNotification("window/logMessage", (params) => this.log(params.message));
    connection.onNotification("window/showMessage", (params) => this.progress(params.message));
    this.initialization = new Promise((resolve) => {
      this.resolveInitialized = resolve;
    });
    connection.onNotification("language/status", (status) => {
      if (status.type === "ServiceReady") {
        this.resolveInitialized?.();
        this.progress("Java \u5206\u6790\u5DF2\u5C31\u7EEA");
      } else this.progress(status.message || "\u6B63\u5728\u5206\u6790 Java \u5DE5\u7A0B\u2026");
    });
    connection.onNotification("$/progress", (params) => {
      const message = params.value?.message ?? params.value?.title;
      if (message) this.progress(message);
    });
    connection.onNotification("language/progressReport", (params) => {
      if (params.subTask || params.task) this.progress(params.subTask || params.task);
    });
    connection.listen();
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 12e4);
    try {
      await this.request("initialize", {
        processId: process.pid,
        clientInfo: { name: "JumpLens", version: "0.3.2" },
        rootUri: pathToFileURL2(this.root).href,
        workspaceFolders: [{ uri: pathToFileURL2(this.root).href, name: path3.basename(this.root) }],
        capabilities: {
          workspace: { configuration: true, workspaceFolders: true },
          textDocument: { synchronization: { didSave: true }, definition: { linkSupport: true }, implementation: { linkSupport: true }, references: {} },
          window: { workDoneProgress: true },
          general: { positionEncodings: ["utf-16"] }
        },
        initializationOptions: { settings: { java: this.javaSettings() }, extendedClientCapabilities: { classFileContentsSupport: true, progressReportProvider: true } }
      }, timeout.signal);
      await connection.sendNotification("initialized", {});
      await connection.sendNotification("workspace/didChangeConfiguration", { settings: { java: this.javaSettings() } });
    } catch (error) {
      this.dispose();
      throw new Error(`Java \u5206\u6790\u670D\u52A1\u542F\u52A8\u5931\u8D25\uFF1A${error instanceof Error ? error.message : error}`);
    } finally {
      clearTimeout(timer);
    }
  }
  javaSettings() {
    return {
      home: this.runtime.projectJavaHome,
      configuration: { updateBuildConfiguration: "automatic", ...this.runtime.projectJavaHome ? { runtimes: [{ name: this.runtime.projectJavaName ?? "JavaSE-1.8", path: this.runtime.projectJavaHome, default: true }] } : {} },
      import: { maven: { enabled: true }, gradle: { enabled: true }, generatesMetadataFilesAtProjectRoot: false, exclusions: ["**/node_modules/**", "**/.git/**"] },
      maven: { downloadSources: true },
      referencesCodeLens: { enabled: false },
      implementationCodeLens: { enabled: false }
    };
  }
  async request(method, params, signal) {
    if (!this.connection || this.stopped) throw new Error(`Java \u5206\u6790\u670D\u52A1\u4E0D\u53EF\u7528${this.stderr ? `\uFF1A${this.stderr.slice(-500)}` : ""}`);
    const cancellation = new import_node.CancellationTokenSource();
    const abort = () => cancellation.cancel();
    if (signal?.aborted) throw new Error("\u8BF7\u6C42\u5DF2\u53D6\u6D88");
    signal?.addEventListener("abort", abort, { once: true });
    try {
      return await this.connection.sendRequest(method, params, cancellation.token);
    } finally {
      signal?.removeEventListener("abort", abort);
      cancellation.dispose();
    }
  }
  async sync(uri, text) {
    await this.start();
    const action = this.queue.then(async () => {
      const old = this.documents.get(uri);
      if (old?.text === text) return;
      const version = (old?.version ?? 0) + 1;
      if (!old) await this.connection.sendNotification("textDocument/didOpen", { textDocument: { uri, languageId: "java", version, text } });
      else await this.connection.sendNotification("textDocument/didChange", { textDocument: { uri, version }, contentChanges: [{ text }] });
      this.documents.set(uri, { text, version });
    });
    this.queue = action.catch(() => {
    });
    return action;
  }
  async navigate(uri, text, position, kind, signal) {
    await this.sync(uri, text);
    const params = { textDocument: { uri }, position, ...kind === "references" ? { context: { includeDeclaration: false } } : {} };
    let targets = normalizeLocations(await this.request(`textDocument/${kind}`, params, signal));
    if (!targets.length && this.initialization) {
      this.progress("\u6B63\u5728\u5B8C\u6210\u5DE5\u7A0B\u5206\u6790\uFF0C\u8BF7\u7A0D\u5019\u2026");
      const imported = this.initialization;
      this.initialization = void 0;
      const timeout = new Promise((resolve) => {
        const timer = setTimeout(resolve, 3e4);
        timer.unref();
      });
      await Promise.race([imported, timeout]);
      if (signal?.aborted) throw new Error("\u8BF7\u6C42\u5DF2\u53D6\u6D88");
      targets = normalizeLocations(await this.request(`textDocument/${kind}`, params, signal));
    }
    return targets;
  }
  async virtualText(uri, signal) {
    await this.start();
    try {
      const result = await this.request("workspace/textDocumentContent", { uri }, signal);
      return result.text;
    } catch (error) {
      if (signal?.aborted) throw error;
      return this.request("java/classFileContents", { uri }, signal);
    }
  }
  async close(uri) {
    if (!this.documents.delete(uri) || this.stopped) return;
    await this.connection?.sendNotification("textDocument/didClose", { textDocument: { uri } });
  }
  get healthy() {
    return !this.stopped;
  }
  dispose() {
    this.stopped = true;
    this.resolveInitialized?.();
    this.connection?.dispose();
    this.child?.kill();
    const child = this.child;
    const kill = setTimeout(() => {
      if (child && child.exitCode === null) child.kill("SIGKILL");
    }, 3e3);
    kill.unref();
    this.documents.clear();
  }
};

// src/web-language-server.ts
var import_node2 = __toESM(require_node(), 1);
import { spawn as spawn2 } from "node:child_process";
import { existsSync as existsSync2, watch } from "node:fs";
import path4 from "node:path";
import { fileURLToPath, pathToFileURL as pathToFileURL3 } from "node:url";
import { createRequire as createRuntimeRequire } from "node:module";

// src/candidates.ts
function targetKey(target) {
  return `${target.uri}:${target.range.start.line}:${target.range.start.character}:${target.range.end.line}:${target.range.end.character}`;
}
function uniqueTargets(targets) {
  return [...new Map(targets.map((target) => [targetKey(target), target])).values()];
}
function matchScore(text, query) {
  const haystack = text.normalize("NFKC").toLowerCase();
  const parts = query.normalize("NFKC").toLowerCase().trim().split(/\s+/).filter(Boolean);
  let score = 0;
  for (const part of parts) {
    const direct = haystack.indexOf(part);
    if (direct >= 0) {
      score += direct;
      continue;
    }
    let at = 0;
    for (const character of part) {
      const found = haystack.indexOf(character, at);
      if (found < 0) return Infinity;
      score += 25 + found - at;
      at = found + 1;
    }
  }
  return score;
}
function searchTargets(targets, query) {
  return targets.map((target, index) => ({ target, index, score: matchScore([target.label, target.symbol, target.packageName, target.module, target.signature].filter(Boolean).join(" "), query) })).filter((item) => Number.isFinite(item.score)).sort((a, b) => a.score - b.score || a.index - b.index).map((item) => item.target);
}
function sourcePreview(text, range, file) {
  const lines = text.split(/\r?\n/);
  const firstLine = Math.max(0, Math.min(lines.length - 1, range.start.line) - 12);
  const lastLine = Math.min(lines.length, Math.max(range.end.line + 13, firstLine + 30));
  const snippet = lines.slice(firstLine, lastLine).join("\n").slice(0, 15e4);
  return { text: snippet, firstLine, path: file, range: { start: { ...range.start, line: range.start.line - firstLine }, end: { ...range.end, line: range.end.line - firstLine } } };
}

// src/vue-options.ts
function vueOptionsNavigation(ts, parse, uri, text, position, kind) {
  if (kind !== "definition" && kind !== "references") return [];
  try {
    const ast = parse(text, { parseMode: "sfc" });
    const script = ast.children.find((node) => node.type === 1 && node.tag === "script" && !node.props.some((prop) => prop.type === 6 && prop.name === "setup"));
    const template = ast.children.find((node) => node.type === 1 && node.tag === "template");
    if (!script || script.type !== 1 || !template || template.type !== 1) return [];
    const scriptText = script.children.find((node) => node.type === 2);
    if (!scriptText || scriptText.type !== 2) return [];
    const source2 = ts.createSourceFile("component.ts", scriptText.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const exported = source2.statements.find(ts.isExportAssignment);
    if (!exported) return [];
    let options = exported.expression;
    if (ts.isCallExpression(options) && options.arguments[0]) options = options.arguments[0];
    if (!ts.isObjectLiteralExpression(options)) return [];
    const members = /* @__PURE__ */ new Map();
    const nameOf = (name2) => name2 && (ts.isIdentifier(name2) || ts.isStringLiteral(name2)) ? name2.text : void 0;
    const add = (name2) => {
      const key = nameOf(name2);
      if (key && name2) members.set(key, [...members.get(key) ?? [], name2]);
    };
    for (const property of options.properties) {
      const key = nameOf(property.name);
      if (ts.isPropertyAssignment(property) && ["methods", "computed", "props"].includes(key ?? "") && ts.isObjectLiteralExpression(property.initializer)) {
        for (const member of property.initializer.properties) add(member.name);
      } else if (key === "data" || key === "setup") {
        const fn = ts.isMethodDeclaration(property) ? property : ts.isPropertyAssignment(property) && (ts.isFunctionExpression(property.initializer) || ts.isArrowFunction(property.initializer)) ? property.initializer : void 0;
        if (!fn?.body) continue;
        if (ts.isBlock(fn.body)) {
          for (const statement of fn.body.statements) if (ts.isReturnStatement(statement) && statement.expression && ts.isObjectLiteralExpression(statement.expression)) for (const member of statement.expression.properties) add(member.name);
        }
      }
    }
    const uses = [];
    const expression = (content, base) => {
      const expressionSource = ts.createSourceFile("expression.ts", content, ts.ScriptTarget.Latest, true);
      const locals = /* @__PURE__ */ new Set();
      const bindings = (node) => {
        if ((ts.isParameter(node) || ts.isVariableDeclaration(node)) && ts.isIdentifier(node.name)) locals.add(node.name.text);
        ts.forEachChild(node, bindings);
      };
      bindings(expressionSource);
      const identifiers = (node) => {
        if (ts.isIdentifier(node) && members.has(node.text) && !locals.has(node.text)) {
          const parent = node.parent;
          const propertyName = ts.isPropertyAccessExpression(parent) && parent.name === node;
          const objectKey = ts.isPropertyAssignment(parent) && parent.name === node;
          if ((!propertyName || parent.expression.kind === ts.SyntaxKind.ThisKeyword) && !objectKey) uses.push({ name: node.text, start: base + node.getStart(expressionSource), end: base + node.end });
        }
        ts.forEachChild(node, identifiers);
      };
      identifiers(expressionSource);
    };
    const visit = (node, scoped = false) => {
      if (node.type === 1) {
        scoped ||= node.props.some((prop) => prop.type === 7 && (prop.name === "for" || prop.name === "slot"));
        if (!scoped) {
          for (const prop of node.props) if (prop.type === 7 && prop.exp?.type === 4) expression(prop.exp.content, prop.exp.loc.start.offset);
        }
        for (const child of node.children) visit(child, scoped);
      } else if (node.type === 5 && node.content.type === 4 && !scoped) expression(node.content.content, node.content.loc.start.offset);
    };
    for (const node of template.children) visit(node);
    const lines = text.split("\n");
    const offset = lines.slice(0, position.line).reduce((sum, line) => sum + line.length + 1, 0) + position.character;
    const name = uses.find((use) => offset >= use.start && offset < use.end)?.name ?? [...members].find(([, nodes]) => nodes.some((node) => offset >= scriptText.loc.start.offset + node.getStart(source2) && offset < scriptText.loc.start.offset + node.end))?.[0];
    if (!name || members.get(name)?.length !== 1) return [];
    const point = (offset2) => {
      const prefix = text.slice(0, offset2).split("\n");
      return { line: prefix.length - 1, character: prefix.at(-1).length };
    };
    const result = (start, end) => ({ uri, label: uri.split("/").pop() ?? uri, symbol: name, range: { start: point(start), end: point(end) } });
    if (kind === "references") return uses.filter((use) => use.name === name).map((use) => result(use.start, use.end));
    const declaration = members.get(name)[0];
    return [result(scriptText.loc.start.offset + declaration.getStart(source2), scriptText.loc.start.offset + declaration.end)];
  } catch {
    return [];
  }
}

// src/web-language-server.ts
var WebLanguageServer = class {
  constructor(root, progress, log = () => {
  }) {
    this.root = root;
    this.progress = progress;
    this.log = log;
  }
  connection;
  child;
  ready;
  stopped = false;
  documents = /* @__PURE__ */ new Map();
  queue = Promise.resolve();
  watcher;
  stderr = "";
  runtimeModules = "";
  async launch() {
    const moduleDir = path4.dirname(fileURLToPath(import.meta.url));
    const dist = existsSync2(path4.join(moduleDir, "web-runtime")) ? moduleDir : path4.resolve(moduleDir, "../dist");
    const modules = path4.join(dist, "web-runtime/node_modules");
    this.runtimeModules = modules;
    this.progress("\u6B63\u5728\u542F\u52A8 Vue / TypeScript \u5206\u6790\u670D\u52A1\u2026");
    const child = spawn2(process.execPath, [path4.join(modules, "@vue/language-server/bin/vue-language-server.js"), "--stdio"], { cwd: this.root, stdio: "pipe" });
    this.child = child;
    child.stderr.on("data", (chunk) => {
      this.stderr = (this.stderr + String(chunk)).slice(-4e3);
    });
    const connection = (0, import_node2.createMessageConnection)(new import_node2.StreamMessageReader(child.stdout), new import_node2.StreamMessageWriter(child.stdin));
    this.connection = connection;
    child.on("error", (error) => {
      this.log(error.message);
      this.stopped = true;
      connection.dispose();
    });
    child.on("exit", (code) => {
      this.log(`Vue / TS \u670D\u52A1\u9000\u51FA\uFF1A${code ?? "signal"} ${this.stderr}`);
      this.stopped = true;
      connection.dispose();
    });
    connection.onError((error) => this.log(String(error)));
    connection.onRequest("workspace/configuration", (params) => params.items.map(({ section }) => {
      if (section === "typescript" || section === "javascript") return { preferences: {}, implicitProjectConfig: { checkJs: true, allowJs: true } };
      return null;
    }));
    connection.onRequest("client/registerCapability", () => null);
    connection.onRequest("client/unregisterCapability", () => null);
    connection.onRequest("window/workDoneProgress/create", () => null);
    connection.onNotification("window/logMessage", (data) => this.log(data.message));
    connection.onNotification("window/showMessage", (data) => this.progress(data.message));
    connection.listen();
    const timeout = AbortSignal.timeout(6e4);
    try {
      await this.request("initialize", {
        processId: process.pid,
        clientInfo: { name: "JumpLens", version: "0.3.2" },
        rootUri: pathToFileURL3(this.root).href,
        workspaceFolders: [{ uri: pathToFileURL3(this.root).href, name: path4.basename(this.root) }],
        capabilities: {
          workspace: { configuration: true, workspaceFolders: true },
          textDocument: { synchronization: {}, definition: { linkSupport: true }, typeDefinition: { linkSupport: true }, implementation: { linkSupport: true }, references: {} },
          general: { positionEncodings: ["utf-16"] }
        },
        initializationOptions: { typescript: { tsdk: path4.join(modules, "typescript/lib") }, vue: { hybridMode: false } }
      }, timeout);
      await connection.sendNotification("initialized", {});
      try {
        this.watcher = watch(this.root, { recursive: true }, (_event, filename) => {
          if (!filename || /(^|[/\\])(node_modules|\.git|dist|build|coverage)([/\\]|$)/.test(filename)) return;
          const file = path4.resolve(this.root, filename);
          void connection.sendNotification("workspace/didChangeWatchedFiles", { changes: [{ uri: pathToFileURL3(file).href, type: existsSync2(file) ? 2 : 3 }] }).catch(() => {
          });
        });
        this.watcher.on("error", (error) => this.log(error.message));
      } catch (error) {
        this.log(`\u6587\u4EF6\u76D1\u542C\u4E0D\u53EF\u7528\uFF1A${error}`);
      }
      this.progress("Vue / TypeScript \xB7 \u5206\u6790\u5DF2\u5C31\u7EEA");
    } catch (error) {
      this.dispose();
      throw new Error(`Vue / TS \u5206\u6790\u670D\u52A1\u542F\u52A8\u5931\u8D25\uFF1A${error}`);
    }
  }
  async request(method, params, signal) {
    if (!this.connection || this.stopped) throw new Error(`Vue / TS \u5206\u6790\u670D\u52A1\u4E0D\u53EF\u7528\uFF1A${this.stderr.slice(-500)}`);
    const token = new import_node2.CancellationTokenSource();
    const abort = () => token.cancel();
    if (signal?.aborted) throw new Error("\u8BF7\u6C42\u5DF2\u53D6\u6D88");
    signal?.addEventListener("abort", abort, { once: true });
    try {
      return await this.connection.sendRequest(method, params, token.token);
    } finally {
      signal?.removeEventListener("abort", abort);
      token.dispose();
    }
  }
  async sync(uri, text) {
    if (this.stopped) throw new Error("Vue / TS \u5206\u6790\u670D\u52A1\u5DF2\u505C\u6B62\uFF0C\u8BF7\u91CD\u65B0\u8FDE\u63A5");
    await (this.ready ??= this.launch());
    const action = this.queue.then(async () => {
      const previous = this.documents.get(uri);
      if (previous?.text === text) return;
      const version = (previous?.version ?? 0) + 1;
      if (!previous) await this.connection.sendNotification("textDocument/didOpen", { textDocument: { uri, languageId: lspLanguage(uri), version, text } });
      else await this.connection.sendNotification("textDocument/didChange", { textDocument: { uri, version }, contentChanges: [{ text }] });
      this.documents.set(uri, { text, version });
    });
    this.queue = action.catch(() => {
    });
    await action;
  }
  async navigate(uri, text, position, kind, signal) {
    await this.sync(uri, text);
    const targets = normalizeLocations(await this.request(`textDocument/${kind}`, { textDocument: { uri }, position, ...kind === "references" ? { context: { includeDeclaration: false } } : {} }, signal));
    if (uri.endsWith(".vue") && (!targets.length || kind === "references")) {
      const require2 = createRuntimeRequire(import.meta.url);
      const ts = require2(path4.join(this.runtimeModules, "typescript"));
      const { parse } = require2(path4.join(this.runtimeModules, "@vue/compiler-dom"));
      return uniqueTargets([...targets, ...vueOptionsNavigation(ts, parse, uri, text, position, kind)]);
    }
    return targets;
  }
  async virtualText() {
    throw new Error("\u6B64\u8BED\u8A00\u670D\u52A1\u4EC5\u63D0\u4F9B\u78C1\u76D8\u6E90\u7801\u9884\u89C8");
  }
  async close(uri) {
    if (this.documents.delete(uri) && !this.stopped) await this.connection?.sendNotification("textDocument/didClose", { textDocument: { uri } });
  }
  get healthy() {
    return !this.stopped;
  }
  dispose() {
    this.stopped = true;
    this.watcher?.close();
    this.connection?.dispose();
    this.child?.kill();
    this.documents.clear();
  }
};

// src/history.ts
var NavigationHistory = class {
  back = [];
  forward = [];
  record(origin) {
    this.back.push(origin);
    if (this.back.length > 100) this.back.shift();
    this.forward = [];
  }
  peek(direction) {
    return (direction === "back" ? this.back : this.forward).at(-1);
  }
  move(direction, origin) {
    const from = direction === "back" ? this.back : this.forward;
    const into = direction === "back" ? this.forward : this.back;
    const target = from.pop();
    if (target) into.push(origin);
    return target;
  }
  get state() {
    return { back: !!this.back.length, forward: !!this.forward.length };
  }
};

// src/target-source.ts
import path5 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
function describeTarget(target, text, workspaceRoot) {
  const lines = text.split(/\r?\n/);
  const line = lines[target.range.start.line] ?? "";
  const symbol = target.range.start.line === target.range.end.line ? line.slice(target.range.start.character, target.range.end.character) : void 0;
  const packageName = text.match(/^\s*package\s+([\w.]+)\s*;/m)?.[1];
  const file = target.uri.startsWith("file:") ? fileURLToPath2(target.uri) : void 0;
  const relative = file ? path5.relative(workspaceRoot, file) : target.label;
  const projectSource = !!file && relative !== ".." && !relative.startsWith(`..${path5.sep}`) && !path5.isAbsolute(relative);
  const segments = relative.split(path5.sep);
  const sourceIndex = segments.indexOf("src");
  const module = projectSource ? sourceIndex > 0 ? segments.slice(0, sourceIndex).join("/") : path5.basename(workspaceRoot) : "\u4F9D\u8D56\u5E93";
  const symbolName = symbol?.trim() || target.symbol;
  return { ...target, label: projectSource ? relative : target.label, ...symbolName ? { symbol: symbolName } : {}, ...packageName ? { packageName } : {}, module, source: projectSource ? "project" : "library", signature: line.trim(), preview: line.trim() };
}
function describeVirtualTarget(target) {
  try {
    const segments = new URL(target.uri).pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const name = segments.at(-1) ?? target.label;
    return { ...target, symbol: name.replace(/\.class$/, ""), packageName: segments.slice(1, -1).join("."), module: segments[0] ?? "\u4F9D\u8D56\u5E93", source: "library" };
  } catch {
    return { ...target, source: "library", module: "\u4F9D\u8D56\u5E93" };
  }
}

// src/worker.ts
var cleanup;
function object(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("\u8BF7\u6C42\u53C2\u6570\u65E0\u6548");
  return input;
}
function source(input) {
  if (typeof input !== "string" || input.length > 2 * 1024 * 1024) throw new Error("\u6587\u4EF6\u8FC7\u5927\u6216\u5185\u5BB9\u65E0\u6548");
  return input;
}
function activate(orca) {
  const sessions = /* @__PURE__ */ new Map();
  const servers = /* @__PURE__ */ new Map();
  const pending = /* @__PURE__ */ new Map();
  let navigationId = 0;
  const permitted = /* @__PURE__ */ new Map();
  const histories = /* @__PURE__ */ new Map();
  const attachVersions = /* @__PURE__ */ new Map();
  const sourceChoices = /* @__PURE__ */ new Map();
  let runtime;
  const serverKey = (context) => `${languageForPath(context.path) === "java" ? "java" : "web"}:${context.root}`;
  async function serverFor(session) {
    const root = session.context.root;
    const key = serverKey(session.context);
    const serverProgress = (message) => {
      for (const [panel, current2] of sessions) if (serverKey(current2.context) === key) orca.panels.post("progress", { message }, { panel });
    };
    const old = servers.get(key);
    if (old?.server.healthy) {
      old.lastUsed = Date.now();
      return old.server;
    }
    const java = languageForPath(session.context.path) === "java";
    let resolved;
    if (java) {
      if (!runtime) runtime = orca.settings.get().then((settings) => ensureRuntime(settings, serverProgress)).catch((error) => {
        runtime = void 0;
        throw error;
      });
      resolved = await runtime;
    }
    const current = servers.get(key);
    if (current?.server.healthy) {
      current.lastUsed = Date.now();
      return current.server;
    }
    if (servers.size >= 3) {
      const oldest = [...servers].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
      if (oldest) {
        oldest[1].server.dispose();
        servers.delete(oldest[0]);
      }
    }
    const server = java ? new LanguageServer(root, resolved, serverProgress, (message) => orca.log(message)) : new WebLanguageServer(root, serverProgress, (message) => orca.log(message));
    servers.set(key, { server, lastUsed: Date.now() });
    return server;
  }
  function sessionFor(context) {
    const session = sessions.get(context.panel.id);
    if (!session) throw new Error("\u8BF7\u5148\u8BC6\u522B\u5F53\u524D\u6587\u4EF6\uFF0C\u6216\u70B9\u51FB\u91CD\u65B0\u8FDE\u63A5");
    session.lastUsed = Date.now();
    return session;
  }
  function historyFor(session) {
    const key = session.context.workspace.selector;
    if (!histories.has(key)) histories.set(key, new NavigationHistory());
    return histories.get(key);
  }
  function originOf(session, range, viewport) {
    const value = object(range);
    for (const side of ["start", "end"]) {
      const point = object(value[side]);
      if (!Number.isInteger(point.line) || !Number.isInteger(point.character) || Number(point.line) < 0 || Number(point.character) < 0) throw new Error("\u5BFC\u822A\u4F4D\u7F6E\u65E0\u6548");
    }
    let scroll;
    if (viewport && typeof viewport === "object") {
      const point = viewport;
      if (typeof point.top === "number" && typeof point.left === "number" && Number.isFinite(point.top) && Number.isFinite(point.left)) scroll = { top: Math.max(0, point.top), left: Math.max(0, point.left) };
    }
    return { uri: session.context.uri, range: value, label: path6.basename(session.context.path), ...scroll ? { viewport: scroll } : {} };
  }
  async function openFile(session, target) {
    const file = await realpath2(fileURLToPath3(target.uri));
    if (!inside(session.context.workspace.root, file)) throw new Error("\u76EE\u6807\u6587\u4EF6\u4E0D\u5728\u5F53\u524D\u5DE5\u4F5C\u533A");
    const destination = { ...target, navigationId: ++navigationId };
    pending.set(target.uri, destination);
    while (pending.size > 100) pending.delete(pending.keys().next().value);
    await run(CLI, ["file", "open", file, "--line", String(target.range.start.line + 1), "--column", String(target.range.start.character + 1), "--worktree", session.context.workspace.selector, "--focus", "--json"], { timeout: 12e3 });
    for (const [panel, other] of sessions) {
      if (other.context.uri === target.uri) orca.panels.post("reveal", { uri: target.uri, range: target.range, navigationId: destination.navigationId, ...target.viewport ? { viewport: target.viewport } : {} }, { panel });
    }
  }
  orca.panels.handle("attach", async (input, caller) => {
    const data = object(input);
    const text = source(data.text);
    const attachVersion = (attachVersions.get(caller.panel.id) ?? 0) + 1;
    attachVersions.set(caller.panel.id, attachVersion);
    orca.panels.post("progress", { message: "\u6B63\u5728\u8BC6\u522B\u5F53\u524D\u6587\u4EF6\u2026" }, { panel: caller.panel.id });
    const workspace = await activeWorkspace();
    const candidates = await matchDocument(workspace.root, text);
    if (attachVersions.get(caller.panel.id) !== attachVersion) throw new Error("\u6587\u4EF6\u5DF2\u5207\u6362\uFF0C\u5DF2\u53D6\u6D88\u8FC7\u671F\u7684\u6587\u4EF6\u8BC6\u522B");
    sourceChoices.set(caller.panel.id, { workspace, candidates });
    const chosen = typeof data.path === "string" ? data.path : candidates.length === 1 ? candidates[0] : void 0;
    if (!chosen) {
      if (!candidates.length) throw new Error("\u5F53\u524D\u5DE5\u4F5C\u533A\u672A\u627E\u5230\u5BF9\u5E94\u6E90\u7801\u6587\u4EF6\uFF0C\u8BF7\u4FDD\u5B58\u6587\u4EF6\u540E\u91CD\u65B0\u8FDE\u63A5");
      return { candidates: candidates.map((file) => ({ path: file, label: path6.relative(workspace.root, file) })) };
    }
    if (!candidates.includes(chosen)) throw new Error("\u6587\u4EF6\u5339\u914D\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
    const context = await documentContext(chosen, workspace);
    if (attachVersions.get(caller.panel.id) !== attachVersion) throw new Error("\u6587\u4EF6\u5DF2\u5207\u6362\uFF0C\u5DF2\u53D6\u6D88\u8FC7\u671F\u7684\u6587\u4EF6\u8BC6\u522B");
    const previous = sessions.get(caller.panel.id);
    const session = { context, text, lastUsed: Date.now() };
    sessions.set(caller.panel.id, session);
    orca.log(`Java \u6587\u4EF6\u7ED1\u5B9A\uFF1A${context.path}`);
    if (previous && previous.context.uri !== context.uri && ![...sessions.values()].some((other) => other.context.uri === previous.context.uri)) {
      void servers.get(serverKey(previous.context))?.server.close(previous.context.uri).catch((error) => orca.log(errorMessage(error)));
    }
    permitted.set(caller.panel.id, /* @__PURE__ */ new Set([context.uri]));
    const location = pending.get(context.uri);
    const selection = location?.range ?? null;
    if (location) orca.log(`Java \u76EE\u6807\u4F4D\u7F6E\uFF1A${context.path}:${location.range.start.line + 1}${location.viewport ? "\uFF08\u6062\u590D\u6EDA\u52A8\u4F4D\u7F6E\uFF09" : ""}`);
    void serverFor(session).then((server) => server.sync(context.uri, text)).catch((error) => {
      if (sessions.get(caller.panel.id) === session) orca.panels.post("progress", { message: errorMessage(error) }, { panel: caller.panel.id });
    });
    return { uri: context.uri, path: context.path, root: context.root, selection, viewport: location?.viewport ?? null, navigationId: location?.navigationId ?? null };
  });
  orca.panels.handle("reveal-done", (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const destination = pending.get(session.context.uri);
    if (data.uri === session.context.uri && destination && destination.navigationId === data.navigationId) {
      pending.delete(session.context.uri);
      orca.log(`Java \u5DF2\u5B9A\u4F4D\uFF1A${session.context.path}:${destination.range.start.line + 1}`);
    }
    return { ok: true };
  });
  async function targetText(session, target, signal) {
    const buffer = [...sessions.values()].find((other) => other.context.uri === target.uri);
    if (buffer) return buffer.text;
    if (target.uri.startsWith("file:")) return readFile3(fileURLToPath3(target.uri), "utf8");
    if (target.uri.startsWith("jdt:")) return (await serverFor(session)).virtualText(target.uri, signal);
    throw new Error("\u76EE\u6807\u6587\u6863\u7C7B\u578B\u4E0D\u53D7\u652F\u6301");
  }
  orca.panels.handle("preview-source", async (input, caller) => {
    const selected = object(input).path;
    const choices = sourceChoices.get(caller.panel.id);
    if (typeof selected !== "string" || !choices?.candidates.includes(selected)) throw new Error("\u5F53\u524D\u6587\u4EF6\u5019\u9009\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9");
    return sourcePreview(await readFile3(selected, "utf8"), { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }, path6.relative(choices.workspace.root, selected));
  });
  orca.panels.handle("preview", async (input, caller) => {
    const target = object(input);
    const session = sessionFor(caller);
    if (!permitted.get(caller.panel.id)?.has(target.uri)) throw new Error("\u9884\u89C8\u76EE\u6807\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u67E5\u8BE2");
    return sourcePreview(await targetText(session, target, caller.signal), target.range, target.label);
  });
  orca.panels.handle("files", async (input, caller) => {
    const session = sessionFor(caller);
    const query = object(input).query;
    if (typeof query !== "string" || query.length > 300) throw new Error("\u6587\u4EF6\u641C\u7D22\u6761\u4EF6\u65E0\u6548");
    const files = await sourceFiles(session.context.workspace.root);
    const range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
    const targets = searchTargets(files.map((file) => ({ uri: pathToFileURL4(file).href, label: path6.relative(session.context.workspace.root, file), symbol: path6.basename(file), range })), query);
    const shown = targets.slice(0, 100);
    const allowed = permitted.get(caller.panel.id);
    for (const target of shown) allowed.add(target.uri);
    return { targets: shown, total: targets.length };
  });
  orca.panels.handle("sync", async (input, caller) => {
    const session = sessionFor(caller);
    session.text = source(object(input).text);
    await (await serverFor(session)).sync(session.context.uri, session.text);
    return { ok: true };
  });
  orca.panels.handle("navigate", async (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const text = source(data.text);
    const position = object(data.position);
    const kind = data.kind;
    if (!["definition", "implementation", "references", "typeDefinition"].includes(kind) || !Number.isInteger(position.line) || !Number.isInteger(position.character) || Number(position.line) < 0 || Number(position.character) < 0) throw new Error("\u8DF3\u8F6C\u4F4D\u7F6E\u65E0\u6548");
    session.text = text;
    const server = await serverFor(session);
    const point = { line: Number(position.line), character: Number(position.character) };
    let effectiveKind = kind;
    let targets = uniqueTargets(await server.navigate(session.context.uri, text, point, kind, caller.signal));
    const only = targets.length === 1 ? targets[0] : void 0;
    if (kind === "definition" && only?.uri === session.context.uri && (point.line > only.range.start.line || point.line === only.range.start.line && point.character >= only.range.start.character) && (point.line < only.range.end.line || point.line === only.range.end.line && point.character < only.range.end.character)) {
      effectiveKind = "references";
      targets = uniqueTargets(await server.navigate(session.context.uri, text, point, "references", caller.signal));
    }
    if (sessions.get(caller.panel.id) !== session) throw new Error("\u6587\u4EF6\u5DF2\u5207\u6362\uFF0C\u5DF2\u53D6\u6D88\u8FC7\u671F\u7684\u5BFC\u822A\u67E5\u8BE2");
    orca.log(`Java ${kind}\uFF1A${session.context.path}:${Number(position.line) + 1}:${Number(position.character) + 1} -> ${targets.length} \u4E2A\u7ED3\u679C`);
    const allowed = permitted.get(caller.panel.id);
    const texts = /* @__PURE__ */ new Map();
    for (let index = 0; index < targets.length; index++) {
      const target = targets[index];
      allowed.add(target.uri);
      if (target.uri.startsWith("file:")) {
        if (!texts.has(target.uri)) texts.set(target.uri, await targetText(session, target, caller.signal).catch(() => ""));
        targets[index] = describeTarget(target, texts.get(target.uri), session.context.workspace.root);
      } else targets[index] = describeVirtualTarget(target);
    }
    return { targets, kind: effectiveKind };
  });
  orca.panels.handle("open", async (input, caller) => {
    const data = object(input);
    const session = sessionFor(caller);
    const target = data;
    if (typeof target.uri !== "string" || !permitted.get(caller.panel.id)?.has(target.uri)) throw new Error("\u76EE\u6807\u4E0D\u5C5E\u4E8E\u672C\u6B21\u5BFC\u822A\u67E5\u8BE2\u7ED3\u679C");
    const range = object(target.range);
    const start = object(range.start);
    if (!Number.isInteger(start.line) || !Number.isInteger(start.character) || Number(start.line) < 0 || Number(start.character) < 0) throw new Error("\u76EE\u6807\u4F4D\u7F6E\u65E0\u6548");
    if (target.uri.startsWith("jdt:")) {
      const text = await (await serverFor(session)).virtualText(target.uri, caller.signal);
      return { virtual: true, text, uri: target.uri, range: target.range, label: target.label };
    }
    if (!target.uri.startsWith("file:")) throw new Error("\u5F53\u524D\u76EE\u6807\u6587\u6863\u7C7B\u578B\u4E0D\u53D7\u652F\u6301");
    const file = await realpath2(fileURLToPath3(target.uri));
    if (!inside(session.context.workspace.root, file)) {
      return { virtual: true, text: await readFile3(file, "utf8"), uri: target.uri, range: target.range, label: target.label };
    }
    const origin = originOf(session, data.origin, data.originViewport);
    await openFile(session, target);
    orca.log(`Java \u5DF2\u6253\u5F00\uFF1A${file}:${target.range.start.line + 1}`);
    historyFor(session).record(origin);
    for (const [panel, other] of sessions) {
      if (other.context.workspace.selector === session.context.workspace.selector) orca.panels.post("history", historyFor(session).state, { panel });
    }
    return { opened: true };
  });
  orca.panels.handle("history-state", (_input, caller) => historyFor(sessionFor(caller)).state);
  orca.panels.handle("history", async (input, caller) => {
    const data = object(input);
    if (data.direction !== "back" && data.direction !== "forward") throw new Error("\u5BFC\u822A\u65B9\u5411\u65E0\u6548");
    const session = sessionFor(caller);
    const history = historyFor(session);
    const destination = history.peek(data.direction);
    if (destination) await openFile(session, destination);
    const target = destination ? history.move(data.direction, originOf(session, data.origin, data.viewport)) : void 0;
    for (const [panel, other] of sessions) {
      if (other.context.workspace.selector === session.context.workspace.selector) orca.panels.post("history", history.state, { panel });
    }
    if (target) orca.log(`Java ${data.direction}\uFF1A${target.uri}:${target.range.start.line + 1}`);
    return { target: target ?? null };
  });
  orca.panels.handle("restart", async (_input, caller) => {
    const session = sessionFor(caller);
    servers.get(serverKey(session.context))?.server.dispose();
    servers.delete(serverKey(session.context));
    runtime = void 0;
    await (await serverFor(session)).sync(session.context.uri, session.text);
    return { ok: true };
  });
  orca.panels.handle("detach", async (_input, caller) => {
    const session = sessions.get(caller.panel.id);
    sessions.delete(caller.panel.id);
    permitted.delete(caller.panel.id);
    attachVersions.delete(caller.panel.id);
    sourceChoices.delete(caller.panel.id);
    if (session && ![...sessions.values()].some((other) => other.context.uri === session.context.uri)) await servers.get(serverKey(session.context))?.server.close(session.context.uri);
    return { ok: true };
  });
  const timer = setInterval(() => {
    const cutoff = Date.now() - 20 * 6e4;
    for (const [root, entry] of servers) if (entry.lastUsed < cutoff) {
      entry.server.dispose();
      servers.delete(root);
    }
  }, 6e4);
  timer.unref();
  cleanup = () => {
    clearInterval(timer);
    for (const { server } of servers.values()) server.dispose();
    servers.clear();
    sessions.clear();
  };
}
function deactivate() {
  cleanup?.();
  cleanup = void 0;
}
export {
  deactivate,
  activate as default
};
