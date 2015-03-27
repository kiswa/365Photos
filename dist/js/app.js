var photoApp = angular.module('PhotoApp', ['ngRoute']);

photoApp.config(['$routeProvider', '$locationProvider', '$httpProvider',
function($routeProvider, $locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.when('/', {
        controller: 'DisplayController',
        templateUrl: 'partials/photos.html'
    }).when('/about', {
        templateUrl: 'partials/about.html'
    }).when('/admin', {
        controller: 'AdminController',
        templateUrl: 'partials/login.html'
    }).when('/admin/new', {
        controller: 'AdminController',
        templateUrl: 'partials/new.html',
        authRequired: true
    }).when('/admin/pword', {
        controller: 'AdminController',
        templateUrl: 'partials/password.html',
        authRequired: true
    })
    .otherwise({
        redirectTo: '/'
    });

    // Inject auth token with each API call
    $httpProvider.interceptors.push('TokenInterceptor');
}]);

photoApp.run(['$rootScope', '$location', '$window', 'AdminService',
function($rootScope, $location, $window, AdminService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        if (nextRoute !== null && nextRoute.authRequired !== null &&
            nextRoute.authRequired && $window.localStorage.photosToken === undefined) {
            $location.path('/admin');
        }
        if ($window.localStorage.photosToken !== undefined) {
            AdminService.authenticate();
        }
    });
}]);

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

photoApp.controller('DisplayController',
['$scope', '$timeout', 'PhotoService',
function ($scope, $timeout, PhotoService) {
    $scope.photos = {};
    $scope.noPhotos = true;
    $scope.photoCount = -1;
    $scope.loading = true;

    PhotoService.getCount()
    .success(function(response) {
        $scope.photoCount = response.data[0];
        loadThumbnails();
    });

    function loadThumbnails() {
        // This must start at 1 because photo numbers start at 1
        for (var i = 1; i <= $scope.photoCount; ++i) {
            PhotoService.getThumb(i)
            .success(addPhoto);
        }

        $scope.loading = false;
    }

    function addPhoto(response) {
        var index = response.data[0].number;
        $scope.photos[index] = response.data[0];

        $scope.noPhotos = false;
    }

    $scope.modal = {
        description: '',
        imageSource: '',
        visible: false,
        fade: 'fade-in',
        photoId: 0,
        isPrevVisible: false,
        isNextVisible: false,
        loading: true,

        loadPhoto: function(photoNumber) {
            var photo = $scope.photos[photoNumber];

            this.description = photo.description;
            this.imageSource = photo.image;
            this.photoId = photo.number;

            this.isPrevVisible = photo.number > 1;
            var nextAsString = '' + (parseInt(photo.number) + 1);
            this.isNextVisible = $scope.photos.hasOwnProperty(nextAsString);

            this.loading = false;
        },

        show: function(photoNumber) {
            photoNumber = '' + photoNumber; // Make sure this is a string!

            var that = this,
                photoFound = false,
                photo,
                photosIndex = -1;

            this.loading = true;
            this.imageSource = '';
            this.description = '';

            for (var index in $scope.photos) {
                if ($scope.photos.hasOwnProperty(index)) {
                    photo = $scope.photos[index];
                    if (photo.number === photoNumber) {
                        if (photo.image !== undefined) {
                            photoFound = true;
                        }
                        photosIndex = index;
                    }
                }
            }

            if (photoFound) {
                this.loadPhoto(photosIndex);
            } else {
                PhotoService.getImage(photoNumber)
                .success(function(response) {
                    photo = response.data[0];
                    $scope.photos[photosIndex].image = photo.image;
                    $scope.photos[photosIndex].description = photo.description;
                    that.loadPhoto(photosIndex);
                }, this);
            }

            this.fade = 'fade-in';
            this.visible = true;

            $timeout(function() {
                var modal = document.getElementById('modal');
                if (modal) {
                    modal.focus();
                }
            });
        },

        hide: function() {
            this.fade = 'fade-out';

            var that = this;
            window.setTimeout(function() {
                that.visible = false;
                $scope.$apply();
            }, 200);
        },

        showPrev: function() {
            this.show(parseInt(this.photoId) - 1);
        },

        showNext: function() {
            this.show(parseInt(this.photoId) + 1);
        },

        keyPress: function(event) {
            switch(event.keyCode) {
                case 27: // Escape
                    this.hide();
                    break;
                case 37: // Left
                    if (this.isPrevVisible) {
                        this.showPrev();
                    }
                    break;
                case 39: // Right
                    if (this.isNextVisible) {
                        this.showNext();
                    }
                    break;
            }
        }
    };
}]);

photoApp.directive('fileDropzone', function() {
    return {
        require: '^?form',
        restrict: 'A',
        scope: {
            file: '=',
            fileName: '=',
            dropzoneHoverClass: '@'
        },

        link: function(scope, element, attrs, form) {
            var checkSize, getDataTransfer, isTypeValid, processDragOverOrEnter, validMimeTypes;

            getDataTransfer = function(event) {
                var dataTransfer = event.dataTransfer || event.originalEvent.dataTransfer;
                return dataTransfer;
            };

            processDragOverOrEnter = function(event) {
                if (event) {
                    element.addClass(scope.dropzoneHoverClass);
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    if (event.stopPropagation) {
                        return false;
                    }
                }
                getDataTransfer(event).effectAllowed = 'copy';
                return false;
            };

            validMimeTypes = attrs.fileDropzone;

            checkSize = function(size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') ||
                       (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };

            isTypeValid = function(type) {
                if ((validMimeTypes === (void 0) || validMimeTypes === '') ||
                        validMimeTypes.indexOf(type) > -1) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " +
                            validMimeTypes);
                    return false;
                }
            };

            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);
            element.bind('dragleave', function() {
                return element.removeClass(scope.dropzoneHoverClass);
            });

            return element.bind('drop', function(event) {
                var file, name, reader, size, type;
                if (event !== null) {
                    event.preventDefault();
                }

                element.removeClass(scope.dropzoneHoverClass);

                reader = new FileReader();
                reader.onload = function(evt) {
                    if (checkSize(size) && isTypeValid(type)) {
                        scope.$apply(function() {
                            scope.file = evt.target.result;
                            if (angular.isString(scope.fileName)) {
                                scope.fileName = name;
                                return scope.fileName;
                            }
                        });
                        if (form) {
                            form.$setDirty();
                        }
                        return scope.$emit('file-dropzone-drop-event', {
                            file: scope.file,
                            type: type,
                            name: name,
                            size: size
                        });
                    }
                };

                file = getDataTransfer(event).files[0];
                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsDataURL(file);
                return false;
            });
        }
    };
});

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
