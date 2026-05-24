<?php

declare(strict_types=1);

class ApiException extends Exception {
    public function __construct(string $message, int $code = 400) {
        parent::__construct($message, $code);
    }
}