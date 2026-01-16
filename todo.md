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
- [ ] Adicionar ícones e melhorar UX

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
