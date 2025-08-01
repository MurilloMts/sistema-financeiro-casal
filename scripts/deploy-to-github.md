# 📤 Script para Enviar ao GitHub

## Passo 1: Verificar se o Git está inicializado
```bash
git status
```

Se der erro, execute:
```bash
git init
```

## Passo 2: Configurar usuário (se necessário)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## Passo 3: Adicionar arquivos
```bash
# Ver quais arquivos serão adicionados
git status

# Adicionar todos os arquivos
git add .

# Verificar o que foi adicionado
git status
```

## Passo 4: Fazer commit
```bash
git commit -m "Sistema financeiro completo - versão inicial

- Dashboard com estatísticas completas
- Gestão de transações (receitas/despesas)
- Controle de contas a pagar
- Sistema de cartões de crédito
- Categorias personalizadas
- Autenticação de casal
- Interface responsiva
- Todas as correções de data aplicadas"
```

## Passo 5: Conectar ao GitHub
```bash
# SUBSTITUA pela URL do SEU repositório
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git

# Verificar se foi adicionado
git remote -v
```

## Passo 6: Enviar para o GitHub
```bash
# Primeira vez (cria a branch main)
git push -u origin main

# Próximas vezes (apenas)
git push
```

## 🔧 Se der erro de autenticação:

### Opção 1: HTTPS com Token
1. Vá em GitHub → Settings → Developer settings → Personal access tokens
2. Gere um token com permissões de repositório
3. Use o token como senha quando solicitar

### Opção 2: SSH (mais seguro)
```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
```
Depois adicione a chave em GitHub → Settings → SSH and GPG keys

## 🎉 Sucesso!
Se tudo deu certo, seu código estará no GitHub e você verá:
- Todos os arquivos listados
- README.md sendo exibido
- Histórico de commits

## 📱 Próximo passo: Deploy
Agora você pode fazer deploy na Vercel conectando o repositório GitHub!
