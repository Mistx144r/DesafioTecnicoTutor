<?php

declare(strict_types=1);

require_once __DIR__ . "/../validators/AuthValidador.php";
require_once __DIR__ . "/../models/User.php";
require_once __DIR__ . "/../middlewares/AuthMiddleware.php";

class AuthController {
    private User $user;
    private AuthValidador $validador;

    public function __construct() {
        $this->validador = new AuthValidador();
        $this->user      = new User();
    }

    private function iniciar_sessao(): void {
        if (session_status() === PHP_SESSION_NONE) {
            AuthMiddleware::configurar_sessao();
            session_start();
        }

        if (isset($_SESSION['ultimo_acesso']) && time() - $_SESSION['ultimo_acesso'] > AuthMiddleware::getIdleLimit()) {
            session_destroy();
            throw new ApiException('Sessão expirada', 401);
        }

        $_SESSION['ultimo_acesso'] = time();
    }

    public function me(): void {
        $this->iniciar_sessao();

        if (empty($_SESSION['user_id'])) {
            throw new ApiException('Não autorizado', 401);
        }

        echo json_encode(['ok' => true, 'dados' => [
            'id'   => $_SESSION['user_id'],
            'nome' => $_SESSION['user_nome'],
        ]]);
    }

    public function login($body): void {
        $this->validador->validar_login($body);
        $user = $this->user->verificarCredenciais($body['email'], $body['senha']);

        $this->iniciar_sessao();

        session_regenerate_id(true);

        $_SESSION['user_id']       = $user['id'];
        $_SESSION['user_nome']     = $user['nome'];
        $_SESSION['ultimo_acesso'] = time();

        echo json_encode(['ok' => true, 'dados' => [
            'id'   => $user['id'],
            'nome' => $user['nome'],
        ]]);
    }

    public function logout(): void {
        $this->iniciar_sessao();
        session_destroy();

        echo json_encode(['ok' => true]);
    }
}