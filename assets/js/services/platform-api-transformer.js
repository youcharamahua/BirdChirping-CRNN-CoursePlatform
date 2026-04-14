(function () {
  function parseResponse(response) {
    return response.text().then(function (text) {
      var payload = text ? JSON.parse(text) : {};
      if (!response.ok) {
        throw new Error(payload.detail || payload.message || '请求失败');
      }
      return payload;
    });
  }

  function request(path, options) {
    return fetch('/api/transformer' + path, options || {}).then(parseResponse);
  }

  function buildAnalyzeUrl(options) {
    var params = new URLSearchParams();
    params.set('threshold', String(options && options.threshold != null ? options.threshold : 0.35));
    params.set('top_k', String(options && options.top_k != null ? options.top_k : 5));
    return '/api/transformer/analyze?' + params.toString();
  }

  window.PlatformApi = {
    getHealth: function () {
      return request('/health');
    },
    getDatasetOverview: function () {
      return request('/dataset/overview');
    },
    getModelBlueprint: function () {
      return request('/model/blueprint');
    },
    getTrainStatus: function () {
      return request('/train/status');
    },
    startTraining: function (payload) {
      return request('/train/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    stopTraining: function () {
      return request('/train/stop', { method: 'POST' });
    },
    analyzeUpload: function (file, options) {
      var formData = new FormData();
      formData.append('file', file);
      return fetch(buildAnalyzeUrl(options), {
        method: 'POST',
        body: formData
      }).then(parseResponse);
    }
  };
})();
