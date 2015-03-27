photoApp.controller('AdminController',
['$scope', '$window', '$location', 'AdminService',
function($scope, $window, $location, AdminService) {
    $scope.loginForm = {
        username: '',
        password: '',
        errors: [],

        logIn: function() {
            $scope.loginForm.errors = [];

            AdminService.logIn(this.username, this.password)
            .success(function(data) {
                if (data.status === 'success') {
                    $window.localStorage.photosToken = data.data[0];
                    $location.path('/admin/new');
                } else {
                    $scope.loginForm.errors.push({ message: data.message });
                }
            });
        }
    };

    $scope.logOut = function() {
        AdminService.logOut()
        .success(function(data) {
            delete $window.localStorage.photosToken;
            $location.path('/admin');
        });
    };

    $scope.passwordForm = {
        oldPass: '',
        newPass: '',
        verifyPass: '',
        errors: [],
        messages: [],

        reset: function() {
            this.oldPass = '';
            this.newPass = '';
            this.verifyPass = '';
        },

        changePassword: function() {
            this.errors = [];
            this.messages = [];

            if (this.newPass !== this.verifyPass) {
                this.errors.push({ message: 'New passwords do not match' });
                return;
            }

            AdminService.changePassword(this.oldPass, this.newPass)
            .success(function(data) {
                if (data.status === 'success') {
                    $scope.passwordForm.messages.push({ message: data.message });
                } else {
                    $scope.passwordForm.errors.push({ message: data.message });
                }

                $scope.passwordForm.reset();
            });
        }
    };

    $scope.imageForm = {
        image: '',
        fileName: '',
        title: '',
        description: '',
        errors: [],
        messages: [],

        reset: function() {
            this.image = '';
            this.fileName = '';
            this.title = '';
            this.description = '';
        },

        submit: function() {
            this.errors = [];
            this.messages = [];

            AdminService.image(this.image, this.title, this.description)
            .success(function(data) {
                if (data.status === 'success') {
                    $scope.imageForm.messages.push({ message: data.message });
                    $scope.imageForm.reset();
                } else {
                    $scope.imageForm.errors.push({ message: data.message });
                }
            });
        }
    };
}]);
