<?php

declare(strict_types=1);

require_once __DIR__ . '/../exceptions/ApiException.php';

class SolicitacaoValidator {
    public static function validar_lista(array $body): array {
        $allowed = ['pagina', 'busca', 'status'];
        $body = array_intersect_key($body, array_flip($allowed));

        if (isset($body['pagina']) && !is_numeric($body['pagina'])) {
            throw new ApiException('Página inválida', 400);
        }

        if (isset($body['status']) && !in_array($body['status'], ['pendente', 'aprovada', 'rejeitada'])) {
            throw new ApiException('Status inválido', 400);
        }

        // valores padrão
        $body['pagina'] = isset($body['pagina']) ? (int) $body['pagina'] : 1;
        $body['busca']  = $body['busca'] ?? '';
        $body['status'] = $body['status'] ?? '';

        return $body;
    }

    public static function validar_criar(array $body): void {
        $allowed = ['titulo', 'setor', 'prioridade', 'criado_por', 'itens']; // Modificar aqui caso queria aceitar novos campos
        $body = array_intersect_key($body, array_flip($allowed));
        $itens = json_decode($body['itens'], true);

        if (empty($body['titulo'])) {
            throw new ApiException('Título é obrigatório', 400);
        }

        if (strlen($body['titulo']) > 120) {
            throw new ApiException('Título deve ter no máximo 120 caracteres', 400);
        }

        if (empty($body['setor'])) {
            throw new ApiException('Setor é obrigatório', 400);
        }

        if (!in_array($body['prioridade'], ['baixa', 'media', 'alta'])) {
            throw new ApiException('Prioridade inválida', 400);
        }

        if (empty($body['criado_por'])) {
            throw new ApiException('ID do criador é obrigatório', 400);
        }

        if (!is_numeric($body['criado_por'])) {
            throw new ApiException('ID do criador inválido', 400);
        }

        if (empty($body['itens'])) {
            throw new ApiException('Pelo menos 1 item é obrigatório', 400);
        }

        if (!is_array($itens) || count($itens) === 0) {
            throw new ApiException('Pelo menos 1 item é obrigatório', 400);
        }

        foreach ($itens as $index => $item) {
            if (empty($item['descricao'])) {
                throw new ApiException("Descrição do item $index é obrigatória", 400);
            }

            if (empty($item['quantidade']) || $item['quantidade'] <= 0) {
                throw new ApiException("Quantidade do item $index deve ser maior que zero", 400);
            }

            if (!isset($item['preco_estimado']) || $item['preco_estimado'] < 0) {
                throw new ApiException("Preço do item $index deve ser maior ou igual a zero", 400);
            }
        }
    }

    public static function validar_decidir(array $body): void {
        $allowed = ['id', 'acao', 'justificativa_decisao']; // Modificar aqui caso queria aceitar novos campos
        $body = array_intersect_key($body, array_flip($allowed));

        if (empty($body['id'])) {
            throw new ApiException('ID é obrigatório', 400);
        }

        if (!is_numeric($body['id'])) {
            throw new ApiException('ID inválido', 400);
        }

        if (empty($body['acao'])) {
            throw new ApiException('Ação é obrigatória', 400);
        }

        if (!in_array($body['acao'], ['aprovar', 'rejeitar'])) {
            throw new ApiException('Ação inválida', 400);
        }

        if ($body['acao'] === 'rejeitar' && empty($body['justificativa_decisao'])) {
            throw new ApiException('Justificativa é obrigatória para rejeição', 400);
        }

        if (isset($body['justificativa_decisao']) && strlen($body['justificativa_decisao']) > 255) {
            throw new ApiException('Justificativa deve ter no máximo 255 caracteres', 400);
        }
    }

    public static function validar_obter(array $body): void {
        if (empty($body['id'])) {
            throw new ApiException('ID é obrigatório', 400);
        }

        if (!is_numeric($body['id'])) {
            throw new ApiException('ID inválido', 400);
        }
    }
}