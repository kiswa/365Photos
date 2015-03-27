photoApp.factory('AdminService',
['$http',
function($http) {
    var admin = 'api/admin/';

    return {
        logIn: function(username, password) {
            return $http.post(admin + 'login', {
                username: username,
                password: password
            });
        },

        logOut: function() {
            return $http.post(admin + 'logout');
        },

        changePassword: function(oldPass, newPass) {
            return $http.post(admin + 'password', {
                oldPass: oldPass,
                newPass: newPass
            });
        },

        image: function(image, title, description) {
            return $http.post(admin + 'image', {
                image: image,
                title: title,
                description: description
            });
        },

        authenticate: function() {
            return $http.post(admin + 'auth');
        }
    };
}]);
