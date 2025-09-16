import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// SQLiteデータベースの初期化
const db = new sqlite3.Database(join(__dirname, 'users.db'));

// テーブル作成
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    chips INTEGER DEFAULT 100,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ログインまたはユーザー作成
app.post('/api/login', (req, res) => {
  const { studentId } = req.body;
  
  if (!studentId || !studentId.trim()) {
    return res.status(400).json({ error: '学籍番号が必要です' });
  }

  // ユーザーが存在するかチェック
  db.get('SELECT * FROM users WHERE student_id = ?', [studentId], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'データベースエラー' });
    }

    if (user) {
      // 既存ユーザーのログイン時刻を更新
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE student_id = ?', [studentId], (updateErr) => {
        if (updateErr) {
          console.error(updateErr);
          return res.status(500).json({ error: 'ログイン時刻の更新に失敗しました' });
        }
        
        res.json({
          success: true,
          user: {
            studentId: user.student_id,
            chips: user.chips,
            totalWins: user.total_wins,
            totalLosses: user.total_losses,
            isNew: false
          }
        });
      });
    } else {
      // 新規ユーザー作成
      db.run('INSERT INTO users (student_id) VALUES (?)', [studentId], function(insertErr) {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({ error: 'ユーザー作成に失敗しました' });
        }

        res.json({
          success: true,
          user: {
            studentId: studentId,
            chips: 100,
            totalWins: 0,
            totalLosses: 0,
            isNew: true
          }
        });
      });
    }
  });
});

// チップ残高更新
app.post('/api/update-chips', (req, res) => {
  const { studentId, chips, isWin } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: '学籍番号が必要です' });
  }

  const updateField = isWin ? 'total_wins = total_wins + 1' : 'total_losses = total_losses + 1';
  const query = `UPDATE users SET chips = ?, ${updateField} WHERE student_id = ?`;

  db.run(query, [chips, studentId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'チップ更新に失敗しました' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({ success: true, chips: chips });
  });
});

// ユーザー統計取得
app.get('/api/stats/:studentId', (req, res) => {
  const { studentId } = req.params;

  db.get('SELECT * FROM users WHERE student_id = ?', [studentId], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'データベースエラー' });
    }

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({
      studentId: user.student_id,
      chips: user.chips,
      totalWins: user.total_wins,
      totalLosses: user.total_losses,
      winRate: user.total_wins + user.total_losses > 0 ? 
        (user.total_wins / (user.total_wins + user.total_losses) * 100).toFixed(1) : 0,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });
  });
});

// ランキング取得
app.get('/api/ranking', (req, res) => {
  db.all(`SELECT student_id, chips, total_wins, total_losses,
          CASE WHEN (total_wins + total_losses) > 0 
               THEN ROUND(total_wins * 100.0 / (total_wins + total_losses), 1) 
               ELSE 0 END as win_rate
          FROM users 
          ORDER BY chips DESC 
          LIMIT 10`, (err, users) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'ランキング取得に失敗しました' });
    }

    res.json(users);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
  console.log(`📊 データベース: ${join(__dirname, 'users.db')}`);
});

// プロセス終了時にデータベースを閉じる
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('データベース接続を閉じました。');
    process.exit(0);
  });
});
