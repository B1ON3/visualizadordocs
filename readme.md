# Visualizador de Docs

> Aplicação web desenvolvida em React para importação, processamento e formatação de relatórios em CSV do VEM (Vale Eletrônico Metropolitano), gerando um documento limpo, detalhado e pronto para conferência, impressão ou exportação em PDF.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como Executar o Projeto](#como-executar-o-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Autor](#autor)

---

## Sobre o Projeto

O **Visualizador de Docs** automatiza e facilita a leitura das planilhas de recarga de cartões corporativos. Em vez de analisar arquivos CSV brutos, o usuário faz o upload do documento e o sistema consolida automaticamente os dados da empresa, do pedido (datas, números, autorizador) e totaliza as recargas e taxas cobradas. O layout é responsivo e conta com formatação específica (`@media print`) para garantir uma versão física legível e profissional.

---

## Funcionalidades

- **Upload e Leitura Local:** Seleção de arquivos `.csv` direto do computador, com processamento rápido no navegador sem enviar dados sensíveis para servidores externos.
- **Extração de Metadados:** Identificação automática da empresa responsável (ex: Perpart, Pernambuco Investimentos) baseada no conteúdo do arquivo.
- **Cálculo de Totais:** Soma automatizada do Valor de Recarga, Taxa Administrativa, Taxa de Boleto e Valor Pago Geral.
- **Higienização e Formatação:** 
  - Máscaras automáticas para CPFs e CNPJs.
  - Normalização de nomes e formatação de valores monetários para BRL.
- **Tabela Ordenada:** Lista de funcionários e cartões estruturada em ordem alfabética.
- **Exportação Otimizada:** Botão de impressão nativo que esconde elementos de controle (UI) e ajusta as margens para uma geração de PDF perfeita.

---

## Tecnologias Utilizadas

- **[React (v18)](https://react.dev/):** Biblioteca para a construção da interface de usuário.
- **[Vite](https://vitejs.dev/):** Ferramenta de build extremamente rápida para o ecossistema frontend.
- **[Tailwind CSS (v3.4)](https://tailwindcss.com/):** Framework de CSS utilitário para a estilização rápida e responsiva.
- **[PapaParse (v5.4)](https://www.papaparse.com/):** Biblioteca veloz e robusta para conversão e leitura dos arquivos CSV.
- **[Lucide React](https://lucide.dev/):** Pacote de ícones SVG.
- **[Vercel](https://vercel.com/):** Configuração nativa de hospedagem (`vercel.json`).

---

## Estrutura do Projeto

```text
visualizadordocs/
├── src/                       # Código-fonte principal da aplicação React
│   ├── App.jsx                # Componente principal com a lógica de importação e UI
│   ├── main.jsx               # Ponto de entrada do React (configurado no index.html)
│   └── index.css              # Estilos globais e diretivas do Tailwind e impressão
├── index.html                 # Template HTML raiz da aplicação
├── package.json               # Dependências, metadados e scripts (dev, build, preview)
├── tailwind.config.js         # Configurações do Tailwind CSS
├── postcss.config.js          # Configuração do PostCSS (Autoprefixer, Tailwind)
├── vite.config.js             # Configuração do bundler Vite
├── vercel.json                # Configuração de deploy otimizada para a Vercel
└── README.md                  # Documentação do projeto
```

---

## Pré-requisitos

Para rodar o projeto localmente, certifique-se de ter instalado em sua máquina:
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/) (versão recomendada: 18+ ou 20+)

---

## Como Executar o Projeto

**1. Clone este repositório**
```bash
git clone https://github.com/B1ON3/visualizadordocs.git
cd visualizadordocs
```

**2. Instale as dependências**
```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

**4. Acesse a aplicação**
Abra o navegador e acesse a URL local informada pelo Vite (normalmente `http://localhost:5173`).

---

## Scripts Disponíveis

No diretório do projeto, você pode rodar os seguintes comandos configurados no `package.json`:

- `npm run dev`: Executa a aplicação em modo de desenvolvimento.
- `npm run build`: Gera a versão otimizada de produção na pasta `dist/`.
- `npm run preview`: Inicia um servidor local para visualizar a build de produção antes do deploy.

---

## Autor

Feito por **Mateus Bione Alves de Lucena**.

- [GitHub](https://github.com/B1ON3)