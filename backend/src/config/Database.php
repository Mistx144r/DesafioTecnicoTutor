<?php

declare(strict_types=1);

class Database {
    private static ?PDO $connection = null;

    public static function getConnection(): PDO {
        if (self::$connection === null) {
            self::loadEnv();

            $host    = $_ENV['DB_HOST'];
            $db      = $_ENV['DB_NAME'];
            $user    = $_ENV['DB_USER'];
            $pass    = $_ENV['DB_PASS'];
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$connection = new PDO($dsn, $user, $pass, $options);
            } catch (\PDOException $e) {
                throw new \RuntimeException('Falha ao conectar ao banco de dados.');
            }
        }

        return self::$connection;
    }

    private static function loadEnv(): void {
        $path = __DIR__ . '/../../.env';

        if (!file_exists($path)) {
            throw new RuntimeException('.env não encontrado');
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) continue;

            [$key, $value]  = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}