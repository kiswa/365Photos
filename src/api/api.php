<?php
require_once('lib/Slim/Slim.php');
require_once('lib/rb.php');
require_once('lib/password.php');
require_once('lib/JWT.php');
require_once('lib/SimpleImage.php');

require_once('response.php');

// Slim setup
use Slim\Slim;
Slim::RegisterAutoloader();

$app = new Slim();
$app->response->headers->set('Content-Type', 'application/json');

$app->notFound(function() use ($app) {
    $app->response->setStatus(404);
    $app->response->setBody('{ message: "Matching API call not found." }');
});

// RedBeanPHP setup
R::setup('sqlite:photos.db');

// Routing objects
require_once('display.php');
require_once('admin.php');

// API Routes
$app->get('/photos/count', 'Display:imageCount');
$app->get('/photos/:number/thumb', 'Display:imageThumb')->conditions(['number' => '\d+']);
$app->get('/photos/:number/image', 'Display:imageFull')->conditions(['number' => '\d+']);

$app->post('/admin/login', 'Admin:logIn');
$app->post('/admin/logout', 'Admin:logOut');
$app->post('/admin/password', 'Admin:changePass');
$app->post('/admin/auth', 'Admin:authenticate');

$app->post('/admin/image', 'Admin:addImage');

// Run and clean up
$app->run();
R::close();
