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
