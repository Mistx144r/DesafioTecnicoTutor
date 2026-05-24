<?php

declare(strict_types=1);

require_once __DIR__ . "/../validators/AuthValidador.php";
require_once __DIR__ . "/../models/User.php";

class AuthController {
    private User $user;
    private AuthValidador $validador;

    public function __construct() {
        $this->validador = new AuthValidador();
        $this->user = new User();
    }

    public function me(): void
    {
        session_start();

        if (empty($_SESSION['user_id'])) {
            throw new ApiException('Não autorizado', 401);
        }

        echo json_encode(['ok' => true, 'dados' => [
            'id'   => $_SESSION['user_id'],
            'nome' => $_SESSION['user_nome'],
        ]]);
    }

    public function login($body): void
    {
        $this->validador->validar_login($body);
        $user = $this->user->verificarCredenciais($body['email'], $body['senha']);

        // Configurando as opções dos cookies pare mitigar ataques CSRF e leitura indevida por scripts js.
        session_set_cookie_params([
            'lifetime' => 0, // Encerra a sessão assim que o user fechar o navegador/site.
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Strict'
        ]);

        session_start();

        $_SESSION['user_id']   = $user['id'];
        $_SESSION['user_nome'] = $user['nome'];

        echo json_encode(['ok' => true, 'dados' => [
            'id'   => $user['id'],
            'nome' => $user['nome'],
        ]]);
    }

    public function logout(): void
    {
        session_start();
        session_destroy();
    }
}