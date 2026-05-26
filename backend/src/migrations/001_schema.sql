-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
-- Host: 127.0.0.1    Database: modulo_compras
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS modulo_compras;
USE modulo_compras;

-- ----------------------------
-- Tabela: usuario
-- ----------------------------

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
    `email` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
    `senha_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
    `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email_Unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Tabela: solicitacao
-- ----------------------------

DROP TABLE IF EXISTS `solicitacao`;
CREATE TABLE `solicitacao` (
    `id` int NOT NULL AUTO_INCREMENT,
    `titulo` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
    `setor` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
    `prioridade` enum('baixa','media','alta') COLLATE utf8mb4_general_ci NOT NULL,
    `status` enum('pendente','aprovada','rejeitada') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pendente',
    `justificativa_decisao` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
    `criado_por` int NOT NULL,
    `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `criado_por_usuario_id` (`criado_por`),
    CONSTRAINT `criado_por_usuario_id` FOREIGN KEY (`criado_por`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Tabela: solicitacao_item
-- ----------------------------

DROP TABLE IF EXISTS `solicitacao_item`;
CREATE TABLE `solicitacao_item` (
    `id` int NOT NULL AUTO_INCREMENT,
    `solicitacao_id` int NOT NULL,
    `descricao` varchar(120) NOT NULL,
    `quantidade` decimal(10,2) NOT NULL,
    `preco_estimado` decimal(10,2) unsigned NOT NULL,
     PRIMARY KEY (`id`),
    KEY `id_solicitacao_por_solicitacao` (`solicitacao_id`),
    CONSTRAINT `id_solicitacao_por_solicitacao` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `solicitacao_item_chk_1` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Seed: usuário de teste
-- ----------------------------

INSERT INTO `usuario` (`nome`, `email`, `senha_hash`) VALUES
    ('Administrador', 'admin@tutorfiscal.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;