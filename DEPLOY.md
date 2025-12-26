# Vercelデプロイ手順（簡易版）

## クイックスタート

### 1. GitHubリポジトリを作成・プッシュ

```bash
# Gitリポジトリの初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリを作成後、以下を実行
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

### 2. Vercelでプロジェクトを作成

1. https://vercel.com にアクセス
2. 「Add New...」→「Project」
3. GitHubリポジトリをインポート
4. 「Deploy」をクリック

### 3. 環境変数を設定

Vercelダッシュボード → Settings → Environment Variables で以下を追加:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Google Cloud Consoleの設定更新

OAuth 2.0クライアントIDの設定に以下を追加:

- **承認済みのJavaScript生成元**: `https://your-project.vercel.app`
- **承認済みのリダイレクト URI**: `https://your-project.vercel.app`

### 5. Supabaseの設定更新

Authentication → URL Configuration で以下を設定:

- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

### 6. 再デプロイ

環境変数を設定した後、Vercelダッシュボードで「Redeploy」をクリック

## 注意事項

- 環境変数を変更した場合は、再デプロイが必要です
- Google OAuthとSupabaseの設定も本番環境用に更新してください
- カスタムドメインを使用する場合も、同様に設定を更新してください

