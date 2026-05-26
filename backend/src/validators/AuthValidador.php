<?php

declare(strict_types=1);

require_once __DIR__ . '/../exceptions/ApiException.php';

class AuthValidador {
    public function validar_login(array $body): array {
        $allowed = ['email', 'senha'];
        $body = array_intersect_key($body, array_flip($allowed));

        if (empty($body['email']) || empty($body['senha'])) {
            throw new ApiException('E-mail ou senha não informado', 400);
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            throw new ApiException('E-mail inválido', 400);
        }

        if (strlen($body['senha']) < 6) {
            throw new ApiException('Senha inválida', 400);
        }

        return $body;
    }
}