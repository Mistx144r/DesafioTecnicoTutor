<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../exceptions/ApiException.php';

class Solicitacao {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getConnection();
    }

    public function listar(array $body): array {
        $porPagina = 10;
        $offset    = ($body['pagina'] - 1) * $porPagina;
        $params    = [];

        $sql = 'SELECT * FROM solicitacao WHERE 1=1';

        if (!empty($body['busca'])) {
            $sql     .= ' AND titulo LIKE ?';
            $params[] = '%' . $body['busca'] . '%';
        }

        if (!empty($body['status'])) {
            $sql     .= ' AND status = ?';
            $params[] = $body['status'];
        }

        $stmtTotal = $this->pdo->prepare(str_replace('SELECT *', 'SELECT COUNT(*) as total', $sql));
        $stmtTotal->execute($params);
        $total = (int) $stmtTotal->fetch()['total'];

        $sql     .= ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
        $params[] = $porPagina;
        $params[] = $offset;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $solicitacoes = $stmt->fetchAll();

        return [
            'solicitacoes'       => $solicitacoes,
            'total'              => $total,
            'pagina'             => $body['pagina'],
            'por_pagina'         => $porPagina,
            'tem_pagina_anterior' => $body['pagina'] > 1,
            'tem_proxima_pagina'  => ($body['pagina'] * $porPagina) < $total,
        ];
    }

    public function obter(int $id): array {
        $stmt = $this->pdo->prepare('SELECT * FROM solicitacao WHERE id = ?');
        $stmt->execute([$id]);
        $solicitacao = $stmt->fetch();

        if (!$solicitacao) {
            throw new ApiException('Solicitação não encontrada', 404);
        }

        $stmtItens = $this->pdo->prepare('SELECT * FROM solicitacao_item WHERE solicitacao_id = ?');
        $stmtItens->execute([$id]);
        $solicitacao['itens'] = $stmtItens->fetchAll();

        return $solicitacao;
    }

    public function resumo(): array {
        $stmt = $this->pdo->prepare('SELECT status, COUNT(*) as total FROM solicitacao GROUP BY status');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function criar(array $body): int {
        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare('INSERT INTO solicitacao (titulo, setor, prioridade, criado_por) VALUES (?, ?, ?, ?)');
            $stmt->execute([$body['titulo'], $body['setor'], $body['prioridade'], $body['criado_por']]);

            $solicitacaoId = (int) $this->pdo->lastInsertId();

            $stmtItem = $this->pdo->prepare('INSERT INTO solicitacao_item (solicitacao_id, descricao, quantidade, preco_estimado) VALUES (?, ?, ?, ?)');

            $itens = json_decode($body['itens'], true);

            foreach ($itens as $item) {
                $stmtItem->execute([$solicitacaoId, $item['descricao'], $item['quantidade'], $item['preco_estimado']]);
            }

            $this->pdo->commit();
            return $solicitacaoId;

        } catch (\PDOException $e) {
            $this->pdo->rollBack();

            if ($e->getCode() === '23000') {
                throw new ApiException('Usuário não encontrado', 404);
            }
            throw new ApiException('Erro ao criar solicitação', 500);
        }
    }

    public function decidir(array $body): void {
        $stmt = $this->pdo->prepare('SELECT status FROM solicitacao WHERE id = ?');
        $stmt->execute([$body['id']]);
        $solicitacao = $stmt->fetch();

        if (!$solicitacao) {
            throw new ApiException('Solicitação não encontrada', 404);
        }

        if ($solicitacao['status'] !== 'pendente') {
            throw new ApiException('Solicitação já foi decidida', 422);
        }

        $novoStatus = $body['acao'] === 'aprovar' ? 'aprovada' : 'rejeitada';
        $justificativa = $body['justificativa_decisao'] ?? null;

        $stmt = $this->pdo->prepare('UPDATE solicitacao SET status = ?, justificativa_decisao = ? WHERE id = ?');
        $stmt->execute([$novoStatus, $justificativa, $body['id']]);
    }
}