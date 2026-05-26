<?php

declare(strict_types=1); // Ativando tipagem.

// Centralizando a normalização de erros
set_exception_handler(function (Throwable $e) {
    $code = (int) $e->getCode() ?: 500;
    http_response_code($code);
    echo json_encode([
        'ok'   => false,
        'erro' => $e->getMessage()
    ]);
});

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR])) {
        http_response_code(500);
        echo json_encode([
            'ok'   => false,
            'erro' => 'Erro interno do servidor'
        ]);
    }
});

date_default_timezone_set('America/Sao_Paulo');

$allowedOrigin = $_ENV['ALLOWED_ORIGIN'] ?? '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
}

header('Content-Type: application/json'); // Por padrão PHP retorna HTML, então para esse desafio precisei mudar o retorno para JSON.

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

require_once 'src/controllers/SolicitacaoController.php';
require_once 'src/controllers/AuthController.php';
require_once 'src/middlewares/AuthMiddleware.php';

$solicitacaoController = new SolicitacaoController();
$authController        = new AuthController();

$authMiddleware        = new AuthMiddleware();

// Aqui criei um dicionário com todas as possíveis rotas e seus respectivos métodos, para que uma mesma rota possa usufruir de vários métodos.
// Adicionei também uma boolean "protected" para verificar se a rota precisa ou não utilizar o middleware de verificação de sessão.
// Essa foi minha a approach para o roteamento já que não podia usar frameworks do PHP.

$routes = [
    'POST:/solicitacao/criar'    => ['handler' => fn() => $solicitacaoController->criar($_POST),   'protected' => true],
    'POST:/solicitacao/listar'   => ['handler' => fn() => $solicitacaoController->listar($_POST),  'protected' => true],
    'POST:/solicitacao/obter'    => ['handler' => fn() => $solicitacaoController->obter($_POST),   'protected' => true],
    'POST:/solicitacao/decidir'  => ['handler' => fn() => $solicitacaoController->decidir($_POST), 'protected' => true],
    'POST:/solicitacao/resumo'   => ['handler' => fn() => $solicitacaoController->resumo(),        'protected' => true],

    'POST:/auth/login'           => ['handler' => fn() => $authController->login($_POST),          'protected' => false],
    'POST:/auth/logout'          => ['handler' => fn() => $authController->logout(),               'protected' => false],
    'POST:/auth/me'              => ['handler' => fn() => $authController->me(),                   'protected' => false],
];

$key = "$method:$uri";

if (isset($routes[$key])) {
    if ($routes[$key]['protected']) {
        $authMiddleware::verificar();
    }
    $routes[$key]['handler']();
} else {
    http_response_code(404);
    echo json_encode(['ok' => false, 'erro' => 'Rota não encontrada']);
}