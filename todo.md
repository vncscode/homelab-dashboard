# HomeLab Dashboard - TODO

## Configuração Base
- [x] Inicializar projeto web com banco de dados e autenticação
- [x] Configurar design system em roxo escuro (Tailwind + CSS variables)
- [x] Criar layout principal com sidebar navigation
- [x] Implementar autenticação e autorização

## Integração Jexactyl (Gerenciamento de Servidores)
- [x] Criar tabelas de banco de dados para armazenar credenciais do Jexactyl
- [x] Implementar endpoints para conectar à API do Jexactyl
- [ ] Desenvolver página de gerenciamento de servidores
- [ ] Implementar visualização de console em tempo real
- [ ] Implementar envio de comandos (start, stop, restart)
- [ ] Implementar gerenciamento de arquivos (upload, download, delete)
- [ ] Implementar editor de arquivos
- [ ] Criar testes para integração Jexactyl

## Integração qBittorrent (Gerenciamento de Torrents)
- [x] Criar tabelas de banco de dados para armazenar credenciais do qBittorrent
- [x] Implementar endpoints para conectar à API do qBittorrent
- [ ] Desenvolver página de gerenciamento de torrents
- [ ] Implementar funcionalidade de adicionar torrents
- [ ] Implementar funcionalidade de pausar/retomar torrents
- [ ] Implementar funcionalidade de deletar torrents
- [ ] Implementar visualização de progresso em tempo real
- [ ] Implementar filtros e busca de torrents
- [ ] Criar testes para integração qBittorrent

## Integração Glances (Monitoramento de Recursos)
- [x] Criar tabelas de banco de dados para armazenar credenciais do Glances
- [x] Implementar endpoints para conectar à API do Glances
- [ ] Desenvolver página de monitoramento de recursos em tempo real
- [ ] Implementar gráficos de CPU, memória, disco
- [ ] Implementar monitoramento de processos
- [ ] Implementar monitoramento de rede
- [ ] Implementar atualização em tempo real (WebSocket ou polling)
- [ ] Criar testes para integração Glances

## Interface de Usuário
- [x] Criar componentes reutilizáveis em roxo escuro
- [x] Implementar dashboard principal com widgets

## Sistema de Plugins
- [x] Criar schema de banco de dados para plugins
- [x] Implementar sistema de instalação e gerenciamento de plugins
- [x] Criar página de gerenciamento de plugins
- [x] Criar página de controle do Jexactyl com resumo
- [x] Criar página de controle do qBittorrent com resumo
- [x] Criar página de controle do Glances com resumo
- [x] Atualizar dashboard com resumo geral de todos os plugins
- [ ] Implementar página de configurações e credenciais
- [ ] Implementar página de logs e histórico
- [ ] Implementar notificações e alertas
- [ ] Implementar tema responsivo (mobile, tablet, desktop)

## Análise e Correção de Código
- [x] Analisar e corrigir código do servidor (routers, integrações, db)
- [x] Analisar e corrigir componentes React e páginas
- [x] Melhorar lógicas de autenticação e autorização
- [x] Otimizar queries de banco de dados
- [x] Melhorar tratamento de erros e validações
- [x] Adicionar tipos TypeScript mais precisos
- [x] Executar testes e validar todas as correções (76 testes passando)
- [x] Adicionar ícones e melhorar UX

## WebSocket e Tempo Real
- [x] Instalar e configurar Socket.io
- [x] Criar sistema de eventos no servidor
- [x] Implementar listeners no cliente
- [x] Criar hooks customizados
- [x] Integrar nas páginas (componentes criados)
- [x] Adicionar indicadores visuais (WebSocketStatus)
- [x] Testar comunicação em tempo real (17 testes passando)

## Gráficos e Histórico
- [x] Criar schema de banco de dados para histórico de métricas
- [x] Implementar routers tRPC para consultar histórico
- [x] Criar componentes de gráficos com Recharts
- [ ] Integrar coleta de histórico via WebSocket
- [x] Criar página de análise com filtros de período
- [x] Implementar limpeza automática de dados antigos
- [x] Testar gráficos e validar dados históricos (106 testes passando)

## Sistema de Alertas
- [x] Criar schema de banco de dados para alertas e limites
- [x] Implementar lógica de detecção de alertas
- [x] Criar routers tRPC para gerenciar alertas e limites
- [ ] Implementar emissão de alertas via WebSocket
- [x] Criar componentes de UI para alertas (AlertIndicator)
- [x] Criar página de configuração de limites (AlertsConfig)
- [x] Testar sistema de alertas e validar notificações (32 testes passando)

## Testes e Qualidade
- [ ] Escrever testes unitários para procedures do tRPC
- [ ] Escrever testes de integração para APIs externas
- [ ] Testar fluxos de autenticação
- [ ] Testar gerenciamento de erros
- [ ] Validar performance e carregamento

## Documentação e Deploy
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Documentar instruções de configuração
- [ ] Documentar como usar o painel
- [ ] Preparar para deploy
- [ ] Criar checkpoint final
