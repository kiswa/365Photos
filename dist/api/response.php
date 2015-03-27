<?php
class JsonResponse {
    var $status;
    var $message;
    var $data;

    function JsonResponse() {
        $this->status = 'error';
        $this->message = '';
        $this->data = array();
    }

    function asJson() {
        return json_encode($this);
    }
}
