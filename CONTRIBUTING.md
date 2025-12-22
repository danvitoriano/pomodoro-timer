# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o Pomodoro Timer! 🎉

## 📋 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e acolhedor.

## 🚀 Como Contribuir

### Reportando Bugs 🐛

Antes de criar um bug report, por favor verifique se o problema já não foi reportado. Se você encontrar um bug:

1. Use o template de issue fornecido
2. Inclua passos detalhados para reproduzir
3. Descreva o comportamento esperado vs atual
4. Inclua screenshots se possível
5. Mencione o ambiente (OS, navegador, versão)

### Sugerindo Melhorias ✨

Adoramos receber sugestões de novas funcionalidades! Para sugerir uma melhoria:

1. Verifique se já não existe uma issue similar
2. Descreva claramente a funcionalidade desejada
3. Explique por que seria útil para o projeto
4. Se possível, sugira uma implementação

### Pull Requests 🔄

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Desenvolva** sua feature
5. **Teste** suas mudanças em diferentes navegadores
6. **Commit** usando Conventional Commits:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
7. **Push** para sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
8. **Abra** um Pull Request

## 💻 Configuração do Ambiente de Desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/danvitoriano/pomodoro-timer.git
cd pomodoro-timer

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Execute os testes (se houver)
npm test
```

## 📝 Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para manter um histórico de commits limpo e legível:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, ponto e vírgula, etc (sem mudança de código)
- `refactor:` - Refatoração de código
- `perf:` - Melhorias de performance
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção, build, etc

**Exemplos:**
```bash
feat: adiciona suporte a temas customizados
fix: corrige bug no timer ao mudar de aba
docs: atualiza README com novas instruções
style: formata código com prettier
refactor: simplifica lógica do timer
perf: otimiza renderização do componente
test: adiciona testes para o timer
chore: atualiza dependências
```

## 🎨 Padrões de Código

- Use **TypeScript** para type safety
- Siga o **ESLint** configurado no projeto
- Use **Tailwind CSS** para estilos
- Componentes devem ser **funcionais** (React Hooks)
- Mantenha funções **pequenas e focadas**
- Adicione **comentários** em lógica complexa
- Use **nomes descritivos** para variáveis e funções

## 🧪 Testes

Antes de submeter seu PR:

- [ ] Teste em **Chrome**
- [ ] Teste em **Firefox**
- [ ] Teste em **Safari**
- [ ] Teste em **Mobile** (iOS e Android)
- [ ] Verifique se não há **console errors**
- [ ] Teste o **PWA** (instalação, offline, etc)
- [ ] Teste as **notificações**
- [ ] Teste o **Wake Lock**

## 📚 Estrutura do Projeto

```
pomodoro-timer/
├── .github/          # Templates e workflows
├── docs/             # Documentação adicional
├── public/           # Assets estáticos
├── src/
│   ├── App.tsx      # Componente principal
│   ├── App.css      # Estilos customizados
│   └── main.tsx     # Entry point
├── vite.config.ts   # Config Vite + PWA
└── package.json     # Dependências
```

## ❓ Dúvidas?

Se você tiver dúvidas sobre como contribuir, sinta-se à vontade para:

- Abrir uma issue com a tag `question`
- Entrar em contato via email: vitoriano08@gmail.com

## 🙏 Agradecimentos

Muito obrigado por contribuir! Sua ajuda torna este projeto melhor para todos. 🎉

---

<div align="center">
  <p>Feito com ❤️ pela comunidade</p>
</div>

