(function () {
  var MAX_EVENTS = 15;
  var MAX_BYTES = 32768;
  var FLUSH_MS = 2500;

  function findScript() {
    var current = document.currentScript;
    if (current && current.src && current.src.indexOf("/tracker.js") !== -1) {
      return current;
    }
    var scripts = document.getElementsByTagName("script");
    for (var index = scripts.length - 1; index >= 0; index -= 1) {
      var src = scripts[index].src || "";
      if (src.indexOf("/tracker.js") !== -1) return scripts[index];
    }
    return current;
  }

  var current = findScript();
  if (!current || !current.src) return;

  var parsed;
  try {
    parsed = new URL(current.src);
  } catch (error) {
    return;
  }

  var key = current.getAttribute("data-key") || parsed.searchParams.get("key");
  var endpoint = current.getAttribute("data-endpoint");
  if (!endpoint) endpoint = new URL("/v1/collect", parsed.origin).toString();
  if (!key || !endpoint) return;

  var storageKey = "lotus_params_" + key;
  var queue = [];
  var flushTimer = null;
  var flushing = false;

  var campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];
  var blocked = {
    password: 1,
    passwd: 1,
    secret: 1,
    token: 1,
    access_token: 1,
    refresh_token: 1,
    authorization: 1,
    code: 1,
    state: 1,
  };

  function eventId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return (
      "lt_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function readParams() {
    var currentParams = {};
    var search = new URLSearchParams(location.search);
    search.forEach(function (value, name) {
      if (blocked[name.toLowerCase()]) return;
      currentParams[name] = String(value).slice(0, 200);
    });

    var hasCampaign = campaignKeys.some(function (name) {
      return currentParams[name];
    });

    try {
      if (hasCampaign) {
        sessionStorage.setItem(storageKey, JSON.stringify(currentParams));
        return currentParams;
      }
      var stored = sessionStorage.getItem(storageKey);
      if (!stored) return currentParams;
      var parsedParams = JSON.parse(stored);
      var merged = {};
      if (parsedParams && typeof parsedParams === "object") {
        Object.keys(parsedParams).forEach(function (name) {
          if (typeof parsedParams[name] === "string")
            merged[name] = parsedParams[name];
        });
      }
      Object.keys(currentParams).forEach(function (name) {
        merged[name] = currentParams[name];
      });
      return merged;
    } catch (error) {
      return currentParams;
    }
  }

  function buildPayload(events) {
    return JSON.stringify({
      key: key,
      events: events,
    });
  }

  function postBody(body) {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("collect " + response.status);
      }
    });
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flush(false);
    }, FLUSH_MS);
  }

  function flush(force) {
    if (flushing || queue.length === 0) return;
    if (!force && queue.length < MAX_EVENTS) {
      var preview = buildPayload(queue);
      if (preview.length < MAX_BYTES) return;
    }

    flushing = true;
    var batch = queue.splice(0, MAX_EVENTS);
    var body = buildPayload(batch);

    postBody(body)
      .catch(function () {
        queue = batch.concat(queue);
      })
      .finally(function () {
        flushing = false;
        if (queue.length > 0) scheduleFlush();
      });
  }

  function enqueue(kind, name, properties) {
    queue.push({
      id: eventId(),
      kind: kind,
      name: String(name).slice(0, 80),
      url: location.href.slice(0, 2000),
      referrer: (document.referrer || "").slice(0, 2000),
      params: readParams(),
      properties:
        properties && typeof properties === "object" ? properties : {},
    });

    if (queue.length >= MAX_EVENTS) {
      flush(true);
      return;
    }

    var size = buildPayload(queue).length;
    if (size > MAX_BYTES) {
      var last = queue.pop();
      flush(true);
      if (last) queue.push(last);
    }

    scheduleFlush();
  }

  window.lotus = {
    track: function (name, properties) {
      if (!name) return;
      enqueue("event", name, properties);
      flush(true);
    },
  };

  enqueue("pageview", "page_view", {});

  window.addEventListener("pagehide", function () {
    flush(true);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush(true);
  });
})();
