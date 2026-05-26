<?php

declare(strict_types=1);

class AuthMiddleware {
    private const int LIFETIME   = 60 * 60 * 2;
    private const int IDLE_LIMIT = 60 * 30;

    public static function configurar_sessao(): void {
        session_set_cookie_params([
            'lifetime' => self::LIFETIME,
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Strict',
        ]);
    }

    public static function verificar(): void {
        if (session_status() === PHP_SESSION_NONE) {
            self::configurar_sessao();
            session_start();
        }

        if (empty($_SESSION['user_id'])) {
            throw new ApiException('Não autorizado', 401);
        }
    }

    public static function getIdleLimit(): int {
        return self::IDLE_LIMIT;
    }
}