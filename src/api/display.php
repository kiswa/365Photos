<?php
class Display {
    protected $app;
    protected $response;

    public function __construct() {
        $this->app = Slim\Slim::getInstance();
        $this->response = new JsonResponse();
    }

    function imageCount() {
        $this->response->status = 'success';
        $this->response->data[] = R::count('image');

        $this->app->response->setBody($this->response->asJson());
    }

    function imageThumb($number) {
        $image = R::load('image', $number);

        if ($image->id) {
            $photo = new stdclass();

            $photo->number = $image->id;
            $photo->thumb = $image->thumb;
            $photo->displayText = $image->title;

            $this->response->status = 'success';
            $this->response->data[] = $photo;
        }

        $this->app->response->setBody($this->response->asJson());
    }

    function imageFull($number) {
        $image = R::load('image', $number);

        if ($image->id) {
            $photo = new stdclass();

            $photo->number = $image->id;
            $photo->image = $image->image;
            $photo->description = $image->description;

            $this->response->status = 'success';
            $this->response->data[] = $photo;
        }

        $this->app->response->setBody($this->response->asJson());
    }
}
