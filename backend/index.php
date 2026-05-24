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

session_start();
header('Content-Type: application/json'); // Por padrão PHP retorna HTML, então para esse desafio precisei mudar o retorno para JSON.
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

require_once 'src/controllers/SolicitacaoController.php';

$solicitacaoController = new SolicitacaoController();

$routes = [
    'POST:/solicitacao/criar'    => fn() => $solicitacaoController->criar($_POST),
    'POST:/solicitacao/resumo'   => fn() => $solicitacaoController->resumo(),
    'POST:/solicitacao/listar'   => fn() => $solicitacaoController->listar(),
    'POST:/solicitacao/obter'    => fn() => $solicitacaoController->obter($_POST),
    'POST:/solicitacao/decidir'  => fn() => $solicitacaoController->decidir($_POST)
];

$key = "$method:$uri";

if (isset($routes[$key])) {
    $routes[$key]();
} else {
    http_response_code(404);
    echo json_encode(['ok' => false, 'erro' => "Rota não encontrada"]);
}