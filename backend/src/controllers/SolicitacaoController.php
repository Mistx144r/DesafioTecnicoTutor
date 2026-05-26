<?php

declare(strict_types=1);

require_once __DIR__ . '/../models/Solicitacao.php';
require_once __DIR__ . '/../validators/SolicitacaoValidator.php';

class SolicitacaoController {
    private SolicitacaoSchema $solicitacao;
    private SolicitacaoValidator $validador;

    public function __construct() {
        $this->solicitacao = new SolicitacaoSchema();
        $this->validador = new SolicitacaoValidator();
    }

    public function listar($body): void
    {
        $body = $this->validador::validar_lista($body);
        $dados = $this->solicitacao->listar($body);
        echo json_encode(['ok' => true, 'dados' => $dados]);
    }

    public function obter($body): void
    {
        SolicitacaoValidator::validar_obter($body);
        $dados = $this->solicitacao->obter((int) $body['id']);
        echo json_encode(['ok' => true, 'dados' => $dados]);
    }

    public function resumo(): void
    {
        $dados = $this->solicitacao->resumo();
        echo json_encode(['ok' => true, 'dados' => $dados]);
    }
    public function criar($body): void
    {
        $this->validador::validar_criar($body);
        $id = $this->solicitacao->criar($body);
        echo json_encode(['ok' => true, 'dados' => ['id' => $id]]);
    }

    public function decidir($body): void
    {
        SolicitacaoValidator::validar_decidir($body);
        $this->solicitacao->decidir($body);
        echo json_encode(['ok' => true]);
    }
}