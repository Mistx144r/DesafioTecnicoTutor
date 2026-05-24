<?php
class AuthMiddleware {
    public static function verificar(): void {
        session_start();

        if (empty($_SESSION['user_id'])) {
            throw new ApiException('Não autorizado', 401);
        }
    }
}