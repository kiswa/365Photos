photoApp.factory('PhotoService',
['$http',
function($http) {
    var photos = 'api/photos/';

    return {
        getCount: function() {
            return $http.get(photos + 'count');
        },

        getThumb: function(number) {
            return $http.get(photos + number + '/thumb');
        },

        getImage: function(number) {
            return $http.get(photos + number + '/image');
        }
    };
}]);
