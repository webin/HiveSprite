var _ = require('./underscore');

var on = function (target, type, listener) {
  if (_.isObject(type)) {
    return on.multiple(target, type);
  }

  if (typeof target.on === 'function' && typeof type !== 'function') {
    target.on(type, listener);
    return {
      remove: _(target.off).bind(target, type, listener)
    };
  }

  var uber = type.match(/(.+):(.+)/);

  if (uber) {
    return on.delegate.apply(on, uber.slice(-2))(target, listener);
  } else {
    target.addEventListener(type, listener, false);
    return {
      remove: function () {
        target.removeEventListener(type, listener, false);
      }
    };
  }
};

module.exports = _.extend(on, {
  multiple: function (target, pairs) {
    var handlers = _.reduce(pairs, function (ret, listener, type) {
      return _(ret).push(on(target, type, listener));
    }, []);

    handlers.remove = function () {
      _.each(handlers, _.partial(_.result, _, 'remove'));
    };

    return handlers;
  },

  delegate: function (uber, type) {
    return function (target, listener) {
      return on(target, type, function (event) {
        var eventTarget = event.target;
        if (event.target === target.findElement(uber)) {
          listener.call(eventTarget, event);
        }
      });
    };
  }
});
