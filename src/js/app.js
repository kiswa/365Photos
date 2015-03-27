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
