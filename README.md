## Fly.io の Express サンプル

Fly.io で Express を動かすサンプル

## 必要な環境

### macOS 、 Linux の場合

以下のツールをインストールする

- [Git](https://git-scm.com/)
- [asdf](https://asdf-vm.com/)
- [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)
- [Docker](https://docs.docker.com/get-docker/)

### Windows の場合

WSL 上で開発する場合、 macOS 、 Linux と同じ環境を構築する

- [WSL2](https://docs.microsoft.com/ja-jp/windows/wsl/install)

WSL を使わずに Windows 上で開発する場合、以下のツールをインストールする

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/ja/) 20.5.0 以上
- [Docker Desktop](https://docs.docker.com/docker-for-windows/install/)
- [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)

## CI/CD

main ブランチにプッシュすると、 Fly.io にデプロイされる

詳細は [.github/workflows/fly-deploy.yml](.github/workflows/fly-deploy.yml) を参照

## セットアップ

### リポジトリのフォーク

GitHub でこのリポジトリをフォークする

### リポジトリのクローン

    $ git clone <フォークしたリポジトリー>

    $ cd <リポジトリー名>

### asdf を使う場合

asdf のプラグインをインストールする

    $ awk '{system("asdf plugin-add " $1)}' .tool-versions

asdf で Node.js をインストールする

    $ asdf install

### Node.js パッケージのインストール

    $ npm install

### ローカルでの実行

コンテナで PostgreSQL を起動

    $ docker-compose up --build --detach map_db

ローカルでビルド

    $ npm run build

ローカルで起動

    $ npm run start

ブラウザで `http://localhost:3000` にアクセス

### コンテナでの実行

コンテナでビルド、起動

    $ docker compose up --build

ブラウザで `http://localhost:3000` にアクセス

### Fly.io へのデプロイ

Fly.io にログイン

    $ fly auth login

Fly.io にアプリケーションを作成

    $ fly launch

Fly.io にデプロイ

    $ fly deploy

Fly.io にデプロイしたアプリケーションを開く

    $ fly open

## データベースへの接続

### ローカルでの接続

    $ psql -h localhost -U postgres -d postgres

### Fly.io での接続

    $ fly postgres connect -a <PostgreSQL のアプリケーション名>

## ゼロから作る手順

### リポジトリの作成

GitHub でリポジトリを作成

### 初期プロジェクトの作成

    $ npx --yes @flydotio/node-demo@latest

    $ npx node-demo --ems --express --postgresql --tailwindcss --prisma

### マイグレーションの作成

    $ npx prisma migrate dev --name init

### Dockerfile の作成

    $ npx --yes @flydotio/dockerfile@latest

docker-compose.yml を本リポジトリの内容で作成する

### Fly.io へのデプロイ

Fly.io にログイン

    $ fly auth login

Fly.io にアプリケーションを作成

    $ fly launch

データベースに PostgreSQL を設定する

メモリを 256 MB に設定する
