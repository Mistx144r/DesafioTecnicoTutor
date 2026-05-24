<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../exceptions/ApiException.php';

class User {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare('SELECT * FROM usuario WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function verificarCredenciais(string $email, string $senha): array {
        $user = $this->findByEmail($email);

        if (!$user || !password_verify($senha, $user['senha_hash'])) {
            throw new ApiException('E-mail ou senha inválidos', 401);
        }

        return $user;
    }
}