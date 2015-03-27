<?php
class Admin {
    protected $app;
    protected $response;
    protected $user;

    public function __construct() {
        $this->app = Slim\Slim::getInstance();
        $this->response = new JsonResponse();
        $this->user = $this->getUser();

        $this->createInitialAdmin();
    }

    function authenticate() {
        $this->validateToken();
        $this->app->response->setBody($this->response->asJson());
    }

    function logIn() {
        $data = json_decode($this->app->environment['slim.input']);

        $this->response->message = 'Invalid username or password.';
        $expires = (1.5 * 60 * 60); // 1.5 hours

        $lookup = R::findOne('user', ' username = ? ', [$data->username]);
        if (null != $lookup) {
            $hash = password_hash($data->password, PASSWORD_BCRYPT,
                array('salt' => $lookup->salt));
            if ($lookup->password == $hash) {
                $lookup->logins = $lookup->logins + 1;
                $lookup->lastLogin = time();
                $lookup->token = $this->getToken($lookup->id, $expires);
                R::store($lookup);

                $this->response->status = 'success';
                $this->response->message = 'Login successful.';
                $this->response->data[] = $lookup->token;
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    function logOut() {
        if ($this->validateToken()) {
            if ($this->user != null) {
                $this->user->token = null;
                R::store($this->user);
            }
            $this->response->status = 'success';
            $this->response->message = 'Logout complete.';
        }

        $this->app->response->setBody($this->response->asJson());
    }

    function changePass() {
        if ($this->validateToken()) {
            $data = json_decode($this->app->environment['slim.input']);

            $user = $this->getUser();
            if (null != $user) {
                $hash = password_hash($data->oldPass,
                    PASSWORD_BCRYPT, array('salt' => $user->salt));

                if ($user->password == $hash) {
                    $user->password = password_hash($data->newPass,
                        PASSWORD_BCRYPT, array('salt' => $user->salt));
                    R::store($user);

                    $this->response->status = 'success';
                    $this->response->message = 'Password updated.';
                } else {
                    $this->response->message = 'Invalid original password.';
                }
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    function addImage() {
        $this->response->message = 'Error uploading image.';

        if ($this->validateToken()) {
            $data = json_decode($this->app->environment['slim.input']);

            $image = R::dispense('image');
            $image->title = $data->title;
            $image->description = $data->description;
            $image->image = $this->generateMaxSizeImage($data->image);
            $image->thumb = $this->generateThumbnail($data->image);

            R::store($image);
            if ($image->id) {
                $this->response->status = 'success';
                $this->response->message = 'Image ' . $image->id . ' added.';
            }
        }

        $this->app->response->setBody($this->response->asJson());
    }

    function generateMaxSizeImage($imageData) {
        try {
            $img = new SimpleImage();
            $img->load_base64($imageData);
            $width = $img->get_width();
            $height = $img->get_height();

            if ($img->get_orientation() == 'landscape') {
                if ($width <= 1920 && $height <= 1080) {
                    return $imageData;
                }

                return $this->generateThumbnail($imageData, 1920, 1080);
            } else {
                if ($width <= 1080 && $height <= 1920) {
                    return $imageData;
                }

                return $this->generateThumbnail($imageData, 1080, 1920);
            }
        } catch (Exception $e) {}

        return $imageData;
    }

    function generateThumbnail($imageData, $width = 200, $height = 200) {
        $img = new SimpleImage();
        try {
            $img->load_base64($imageData);
            $img->thumbnail($width, $height);

            return $img->output_base64('png');
        } catch (Exception $e) {}

        return $imageData;
    }

    function getuser() {
        $user = null;

        if (isset(getallheaders()['Authorization'])) {
            $hash = getallheaders()['Authorization'];
            try {
                $payload = JWT::decode($hash, $this->getJwtKey());
                $user = R::load('user', $payload->uid);
                if (0 == $user->id) {
                    $user = null;
                }
            } catch (Exception $e) {}
        }

        return $user;
    }

    function getJwtKey() {
        $key = R::load('jwt', 1);
        if (!$key->id) {
            $key->token = password_hash(strval(time()), PASSWORD_BCRYPT);
            R::store($key);
        }

        return $key->token;
    }

    function getToken($id, $expires) {
        return JWT::encode(array(
            'exp' => time() + $expires,
            'uid' => $id
        ), $this->getJwtKey());
    }

    function validateToken() {
        $hash = getallheaders()['Authorization'];
        $payload = null;
        $retVal = false;

        if ($this->checkDbToken()) {
            // The decode will throw if there's a problem and payload will be null.
            // This verifies the token has not expired, even if the checkDbToken call was good.
            try {
                $payload = JWT::decode($hash, $this->getJwtKey());
            } catch (Exception $e) {
                $this->response->message = $e->getMessage();
            }

            if ($payload != null) {
                $retVal = true;
            }
        } else {
            $this->app->response->setStatus(401);
            $this->response->status = 'error';
            $this->response->message = 'Invalid token.';
            if ($this->user != null) {
                $this->user->token = null;
                R::store($this->user);
            }
        }

        return $retVal;
    }

    function checkDbToken() {
        if (null != $this->user) {
            if (isset(getallheaders()['Authorization'])) {
                $hash = getallheaders()['Authorization'];
                return $hash == $this->user->token;
            }
        }

        return false;
    }

    function createInitialAdmin() {
        if (!R::count('user')) {
            $admin = R::dispense('user');
            $admin->username = 'admin';
            $admin->logins = 0;
            $admin->lastLogin = time(); //date('Y-m-d H:i:s');
            $admin->salt = password_hash($admin->username . time(), PASSWORD_BCRYPT);
            $admin->password = password_hash('admin', PASSWORD_BCRYPT,
                array('salt' => $admin->salt));
            R::store($admin);
        }
    }
}
