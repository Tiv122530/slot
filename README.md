# 🎰 文化祭スロットゲーム

文化祭向けに開発された、React + Node.jsベースのスロットマシンゲームです。ユーザー管理、ランキング、統計機能、管理者設定機能を備えています。

## ✨ 特徴

- 🎮 **インタラクティブなスロットゲーム**: 8種類のフルーツシンボルを使用
- 👤 **ユーザー管理システム**: 学籍番号でのログイン
- 🏆 **リアルタイムランキング**: チップ保有量ランキング
- 📊 **統計機能**: 個人成績の確認
- 🔧 **管理者設定**: 勝率のリアルタイム調整（文化祭運営用）
- 📱 **レスポンシブデザイン**: モバイル対応

## 🎯 ゲームルール

### 配当表
- 🍒🍒🍒, 🍋🍋🍋, 🍊🍊🍊, 🍇🍇🍇 → **2倍**
- 🍎🍎🍎, ⭐⭐⭐, 💎💎💎, 🔔🔔🔔 → **3倍**

### ベット額
- 1枚、2枚、3枚から選択可能

### 初期設定
- 初期チップ: 100枚
- 勝率: 25%（管理者設定で調整可能）

## 🚀 起動方法

### 必要環境
- Node.js 16+
- npm

### クイックスタート（推奨）

```bash
# 自動起動スクリプトを使用
./start.sh
```

### 手動起動

#### インストール

```bash
npm install
```

#### サーバー起動

```bash
# バックエンドサーバー
node server.js

# フロントエンド開発サーバー（別ターミナル）
npm run dev
```

#### または同時に起動

```bash
npm start
```

### アクセス
- フロントエンド: [http://localhost:5173](http://localhost:5173)
- バックエンドAPI: [http://localhost:3001](http://localhost:3001)

## 🔧 管理者機能

### 管理者ログイン
- パスワード: `admin123`
- ヘッダーの「🔧 管理者」ボタンからアクセス

### 設定可能な項目
- **勝率設定**: 1%〜50%の範囲で調整
- **確率テスト**: 100回のシミュレーションで動作確認

## 📁 プロジェクト構造

```
文化祭スロット/
├── index.html          # HTMLテンプレート
├── main.jsx           # Reactメインコンポーネント
├── server.js          # Expressバックエンドサーバー
├── package.json       # 依存関係
├── vite.config.js     # Vite設定
├── styles.css         # メインスタイル
├── style.css          # 追加スタイル
├── postcss.config.js  # PostCSS設定
└── users.db           # SQLiteデータベース（自動生成）
```

## 🛠 技術スタック

### フロントエンド
- **React 18**: UIライブラリ
- **Vite**: ビルドツール
- **CSS**: スタイリング

### バックエンド
- **Node.js**: ランタイム
- **Express.js**: Webフレームワーク
- **SQLite**: データベース
- **CORS**: クロスオリジン対応

## 📊 API エンドポイント

- `POST /api/login` - ユーザー認証
- `POST /api/update-chips` - チップ更新
- `GET /api/stats/:studentId` - ユーザー統計取得
- `GET /api/ranking` - ランキング取得

## 🎨 カスタマイズ

### 勝率調整
管理者パネルからリアルタイムで勝率を変更可能（文化祭運営向け）

### 配当倍率変更
`main.jsx`の`PAYOUTS`オブジェクトを編集

### シンボル変更
`SYMBOLS`配列と`WINNING_COMBINATIONS`を編集

## 📝 ライセンス

このプロジェクトは教育目的で作成されました。

## 🤝 貢献

1. Fork
2. Feature branch作成 (`git checkout -b feature/AmazingFeature`)
3. コミット (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request

---

**注意**: このゲームは文化祭での娯楽目的で作成されています。実際の金銭取引には使用しないでください。