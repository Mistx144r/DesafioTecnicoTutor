# Desafio Tecnico PHP
# Indice

- [Tecnologia & Dependências](#Tecnologias-&-Dependências)
- [Configuração Backend](#Configuração-Backend)
- [Configuração Frontend](#Configuração-Frontend)
- [Autenticação](#Autenticação)
- [Decisões Técnicas](#Decisões-Técnicas)
- [Contato](#Contato)
# Tecnologias & Dependências

[![My Skills](https://skillicons.dev/icons?i=php,mysql,react,typescript,vite,tailwind&perline=6)](https://skillicons.dev)

### Backend
- **PHP 8.x** — Arquitetura MVC nativa sem frameworks
- **MySQL 8.0** — Banco de dados relacional
- **PDO** — Acesso ao banco com prepared statements

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** — Estilização e componentes
- **React Router v7** — Roteamento
- **React Hook Form** + **Zod** — Formulários e validação
- **TanStack Query** — Gerenciamento de estado assíncrono e cache
- **Sonner** — Notificações toast
- **Lucide React** — Ícones
# Clonando o Repositório

```bash
git clone https://github.com/Mistx144r/DesafioTecnicoTutor.git
cd DesafioTecnicoTutor
```

# Configuração Backend

Antes de iniciar o servidor, importe ou rode o schema do banco de dados. O arquivo `migrations/001_schema.sql` contém a criação das tabelas e o usuário seed para testes.

### Configurar as variáveis de ambiente .env
```env
DB_HOST=127.0.0.1
DB_NAME=nome_banco_de_dados
DB_USER=root
DB_PASS=senha_segura_123
ALLOWED_ORIGIN=https://seudominio.com
```

### Ativar as extensions no php.ini
```ini
;mysqli -> mysqli
;pdo_mysql -> pdo_mysql
```

### Rodando
```bash
// Tem que estar na pasta /backend
php -S localhost:8000 index.php
```

### Senha de acesso
O usuário de teste é **admin@tutorfiscal.com** com a senha **password**.
# Configuração Frontend

Certifique-se de ter o **Node.js 18+** e o **npm** instalados.

```bash
cd frontend

npm install

npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.
# Autenticação
Implementei a autenticação com a **Sessão Nativa do PHP**, decisão justificada por conta da restrição explícita do projeto ao uso de libs externas. A sessão oferecia nativamente as ferramentas necessárias: Criação e destruição de sessão, regeneração de ID no login, Cookie configurado com **HttpOnly** impedindo acesso via JavaScript, etc.

### Ciclo de Vida da Sessão
O ciclo de vida da sessão é controlado por dois limites independentes: 2 horas de duração total e 30 minutos de inatividade. A verificação acontece a cada requisição autenticada, caso o tempo limite tenha sido excedido, o servidor rejeita a sessão e retorna 401, forçando o redirecionamento para o login (Por conta da ProtectedRoute). A sessão nativa do PHP foi escolhida por atender aos requisitos do projeto sem depender de libs externas, cujo uso era explicitamente restrito pelo escopo do desafio.

### Arquitetura de Validação
A validação no backend segue uma arquitetura de duas camadas: o frontend valida via Zod antes do envio, e o PHP revalida os dados crus através de uma classe Validador que aplica uma allowlist para descartar campos não autorizados, seguida de verificações específicas por campo, garantindo que nenhum dado não sanitizado passe.

### Mecânica de Proteção no Front-end
A proteção de rotas no React foi implementada com um ProtectedRoute que intercepta toda navegação entre as rotas protegidas e dispara um request ao /me para validar a sessão ativa no servidor. Tentativas de acesso não autenticado redirecionam o usuário para /login, e usuários já autenticados são bloqueados de acessar a tela de login.

### Possíveis mudanças em um ambiente de Produção.
Em produção acredito que a sessão nativa seria substituída por JWTs com access token de curta duração e refresh token armazenado no Redis com TTL controlado. Essa approach elimina a quantidade excessiva de requests para o servidor (que está sendo a cada mudança de página), também reduz carga na camada de sessão e escala horizontalmente sem necessidade de compartilhar a sessão entre os servidores.
# Decisões Técnicas

### TanStack Query

O TanStack Query foi adicionado para eliminar o boilerplate repetitivo de gerenciamento de estado assíncrono — sem ele, cada requisição exigiria controle manual de `isLoading`, `isError` e `data` via `useState` e `useEffect`. Além disso, a biblioteca oferece uma camada de cache automático parametrizado por `queryKey`, o que reduz requisições desnecessárias à API quando os dados ainda são válidos, diminuindo a carga no servidor.

### Trade-offs

**Arquitetura monolítica (monorepo)**
Optei por manter backend e frontend no mesmo repositório para agilizar o desenvolvimento dentro do prazo de 5 dias, eliminando a necessidade de alternar entre repositórios e mantendo o histórico de commits unificado com evolução granular.

**POST em todos os endpoints**
Todos os endpoints utilizam POST conforme especificado explicitamente no documento do desafio. Em um projeto sem essa restrição, seguiria o padrão REST convencional: GET para leitura, POST para criação, PUT/PATCH para atualização e DELETE para remoção.
## Contato
**Lucas Mendonça (Mistx144)**
- GitHub: [@Mistx144r](https://github.com/Mistx144r)
- LinkedIn: [@lucasmendoncadev](https://www.linkedin.com/in/lucasmendoncadev/)  