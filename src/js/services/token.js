photoApp.factory('TokenInterceptor',
['$q', '$window', '$location',
function($q, $window, $location) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.localStorage.photosToken) {
                config.headers.Authorization = $window.localStorage.photosToken;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        response: function(response) {
            if (response !== null && response.status === 200) {
                if (response.data.status && response.data.status === 'success') {
                    if (response.data.message === 'Login successful.') {
                        $window.localStorage.photosToken = response.data.data[0];
                    } else if (response.data.message === 'Logout complete.' ||
                            response.data.message === 'Invalid token.') {
                        delete $window.localStorage.photosToken;
                    }
                }
            }
            return response || $q.when(response);
        },

        responseError: function(rejection) {
            if (rejection !== null && rejection.status === 401) {
                if ($window.localStorage.photosToken) {
                    delete $window.localStorage.photosToken;
                }

                if ($location.path().indexOf('/admin') > -1) {
                    $location.path('/admin').replace();
                }
            }
            return $q.reject(rejection);
        }
    };
}]);
