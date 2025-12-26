# Anker Package Copy Generator

製品情報スライド（画像）から、Ankerパッケージ制作依頼書（CRF）に必要な日本語文言を自動生成するWebアプリケーションです。

## 機能

- **AI画像解析**: Google Gemini APIを使用して製品情報を自動抽出
- **クリエイティブ生成**: キャッチコピー、機能説明文をAIが自動生成（各3案）
- **ルールベース法的文言**: 商標・警告文は事前定義された固定文言から自動選択
- **生成履歴**: 過去の生成結果をSupabaseに保存・閲覧可能
- **認証機能**: Google OAuthによるセキュアなログイン
- **Googleドライブエクスポート**: CRF出力をGoogleドライブのマイドライブに直接エクスポート可能

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| AI | Google Gemini API (gemini-1.5-flash) |
| 認証 | Supabase Auth (Google OAuth) |
| データベース | Supabase PostgreSQL |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2-1. Google Drive API設定（オプション）

Googleドライブへのエクスポート機能を使用する場合:

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から「Google Drive API」を有効化
4. 「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類を「ウェブアプリケーション」に設定
6. 承認済みのJavaScript生成元に `http://localhost:3000`（開発環境）を追加
7. 承認済みのリダイレクト URIに `http://localhost:3000` を追加
8. 作成されたクライアントIDを `NEXT_PUBLIC_GOOGLE_CLIENT_ID` に設定

### 3. Supabase Google OAuth設定

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. プロジェクト → Authentication → Providers → Google を有効化
3. [Google Cloud Console](https://console.cloud.google.com/)でOAuth 2.0クライアントIDを取得
4. Supabaseの設定にClient IDとClient Secretを入力

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

## 使い方

1. Googleアカウントでログイン
2. 製品情報スライド（PNG/JPG）をドラッグ&ドロップ
3. 「AIで解析する」ボタンをクリック
4. 生成されたCRFフォームを確認・編集
5. 各セクションの「コピー」ボタンで文言をコピー
6. **Googleドライブにエクスポート**:
   - 「Googleでログイン」ボタンをクリックしてGoogle認証
   - 「Googleドライブにエクスポート」ボタンでExcelファイルをGoogleドライブに保存

## プロジェクト構成

```
src/
├── app/
│   ├── page.tsx              # メインUI
│   ├── login/page.tsx        # ログイン画面
│   └── api/
│       ├── analyze/route.ts  # Gemini API連携
│       └── history/route.ts  # 履歴CRUD
├── components/
│   ├── FileUpload.tsx        # ファイルアップロード
│   ├── CRFForm.tsx           # CRFフォーム
│   └── HistoryList.tsx       # 履歴一覧
├── constants/
│   └── legalTexts.ts         # 商標・警告文マスタ
├── lib/
│   ├── supabase/             # Supabaseクライアント
│   ├── gemini.ts             # Gemini API設定
│   └── ruleEngine.ts         # 法的文言選択ロジック
└── types/
    └── analysis.ts           # 型定義
```

## ハイブリッド生成の仕組み

1. **AIの役割**:
   - 画像からスペック情報を抽出
   - キャッチコピー・機能説明文を生成
   - フラグ判定（ケーブル同梱、Bluetooth有無など）

2. **ルールエンジンの役割**:
   - AIが判定したフラグに基づき固定の法的文言を選択
   - 商標・警告文はAIが書き換えない

## Vercelへのデプロイ

### 1. GitHubリポジトリの準備

1. GitHubで新しいリポジトリを作成
2. ローカルリポジトリをGitHubにプッシュ:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 2. Vercelプロジェクトの作成

1. [Vercel](https://vercel.com/)にアクセスしてログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート
4. プロジェクト設定:
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`（自動検出）
   - **Output Directory**: `.next`（自動検出）

### 3. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定:

1. **Settings** → **Environment Variables** を開く
2. 以下の環境変数を追加:

| 環境変数名 | 値 | 説明 |
|-----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Supabase匿名キー |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini APIキー |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your_google_client_id` | Google OAuth Client ID |

3. **Environment** で適用環境を選択:
   - Production（本番環境）
   - Preview（プレビュー環境）
   - Development（開発環境）

### 4. Google Cloud Consoleの設定更新

本番環境用にGoogle OAuth設定を更新:

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 作成したOAuth 2.0クライアントIDを編集
3. **承認済みのJavaScript生成元**に追加:
   - `https://your-project.vercel.app`（VercelのデプロイURL）
   - カスタムドメインを使用する場合: `https://your-domain.com`
4. **承認済みのリダイレクト URI**に追加:
   - `https://your-project.vercel.app`
   - カスタムドメインを使用する場合: `https://your-domain.com`

### 5. Supabaseの設定更新

本番環境用にSupabaseの認証設定を更新:

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. プロジェクト → **Authentication** → **URL Configuration**
3. **Site URL**をVercelのデプロイURLに設定:
   - `https://your-project.vercel.app`
4. **Redirect URLs**に追加:
   - `https://your-project.vercel.app/auth/callback`
   - カスタムドメインを使用する場合も同様に追加

### 6. デプロイ

1. Vercelダッシュボードで「Deploy」をクリック
2. デプロイが完了するまで待機（通常1-3分）
3. デプロイ完了後、提供されたURLでアプリにアクセス

### 7. 自動デプロイの設定

GitHubリポジトリにプッシュすると自動的にデプロイされます:

- **mainブランチ**: Production環境に自動デプロイ
- **その他のブランチ**: Preview環境に自動デプロイ

### トラブルシューティング

#### ビルドエラーが発生する場合

1. **ログを確認**: Vercelダッシュボードの「Deployments」→「Logs」でエラーを確認
2. **環境変数の確認**: すべての環境変数が正しく設定されているか確認
3. **Node.jsバージョン**: Vercelの設定でNode.jsバージョンを指定（推奨: 18.x以上）

#### Google認証が動作しない場合

1. **OAuth設定の確認**: Google Cloud ConsoleでリダイレクトURIが正しく設定されているか確認
2. **環境変数の確認**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`が正しく設定されているか確認
3. **ブラウザのコンソール**: エラーメッセージを確認

#### Supabase認証が動作しない場合

1. **URL設定の確認**: SupabaseダッシュボードでSite URLとRedirect URLsが正しく設定されているか確認
2. **環境変数の確認**: `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しく設定されているか確認

## ライセンス

Private - Internal Use Only



