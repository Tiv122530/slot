import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍒', '⭐', '💎', '🔔'];
const WINNING_COMBINATIONS = [
  ['🍒', '🍒', '🍒'], // チェリー3つ
  ['🍋', '🍋', '🍋'], // レモン3つ
  ['🍊', '🍊', '🍊'], // オレンジ3つ
  ['🍇', '🍇', '🍇'], // ぶどう3つ
  ['🍎', '🍎', '🍎'], // りんご3つ
  ['⭐', '⭐', '⭐'], // 星3つ
  ['💎', '💎', '💎'], // ダイヤ3つ
  ['🔔', '🔔', '🔔'], // ベル3つ
];

const PAYOUTS = {
  '🍒🍒🍒': 2,
  '🍋🍋🍋': 2,
  '🍊🍊🍊': 2,
  '🍇🍇🍇': 2,
  '🍎🍎🍎': 3,
  '⭐⭐⭐': 3,
  '💎💎💎': 3,
  '🔔🔔🔔': 3,
};

const API_BASE = 'http://localhost:3001/api';

function SlotMachine() {
  const [user, setUser] = useState(null);
  const [chips, setChips] = useState(100); // ゲストの初期チップ
  const [currentBet, setCurrentBet] = useState(1);
  const [reels, setReels] = useState(['🍎', '🍊', '🍋']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const [studentId, setStudentId] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [showStats, setShowStats] = useState(false);
  
  // 管理者設定
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [winProbability, setWinProbability] = useState(25); // デフォルト25%の勝率

  // ページ読み込み時にランキングを取得
  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch(`${API_BASE}/ranking`);
      const data = await response.json();
      setRanking(data);
    } catch (error) {
      console.error('ランキング取得エラー:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: studentId.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setChips(data.user.chips);
        setUserStats(data.user);
        setStudentId('');
        setResult(data.user.isNew ? '🎉 新規ユーザー登録完了！' : '👋 おかえりなさい！');
        
        // ランキングを更新
        fetchRanking();
      } else {
        setResult('❌ ログインに失敗しました');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setResult('❌ サーバーエラーが発生しました');
    }
  };

  const updateChips = async (newChips, isWin) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/update-chips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.studentId,
          chips: newChips,
          isWin: isWin
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 統計を更新
        if (userStats) {
          setUserStats(prev => ({
            ...prev,
            chips: newChips,
            totalWins: prev.totalWins + (isWin ? 1 : 0),
            totalLosses: prev.totalLosses + (isWin ? 0 : 1)
          }));
        }
        
        // ランキングを更新
        fetchRanking();
      }
    } catch (error) {
      console.error('チップ更新エラー:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setChips(100); // ゲストの初期チップにリセット
    setResult('');
    setUserStats(null);
    setShowStats(false);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // 管理者パスワード（実際の運用では安全な認証を使用してください）
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminPanel(true);
      setAdminPassword('');
      setResult('🔧 管理者モードでログインしました');
    } else {
      setResult('❌ 管理者パスワードが間違っています');
      setAdminPassword('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
    setResult('管理者モードを終了しました');
  };

  const spin = async () => {
    if (chips < currentBet) {
      setResult('チップが不足しています！');
      return;
    }

    setIsSpinning(true);
    setResult('');
    const newChips = chips - currentBet;
    setChips(newChips);

    // スピンアニメーション
    const spinDuration = 2000; // 2秒
    const spinInterval = 100; // 0.1秒ごとに変更
    
    const spinTimer = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, spinInterval);

    setTimeout(async () => {
      clearInterval(spinTimer);
      
      // 確率に基づいて勝利を決定
      const randomValue = Math.random() * 100;
      const shouldWin = randomValue < winProbability;
      
      console.log(`確率判定: ${randomValue.toFixed(2)}% < ${winProbability}% = ${shouldWin ? '勝利' : '敗北'}`);
      
      let finalReels;
      if (shouldWin) {
        // 勝利の場合、当たりの組み合わせを選択
        const winningCombinations = [
          ['🍒', '🍒', '🍒'],
          ['🍋', '🍋', '🍋'],
          ['🍊', '🍊', '🍊'],
          ['🍇', '🍇', '🍇'],
          ['🍎', '🍎', '🍎'],
          ['⭐', '⭐', '⭐'],
          ['💎', '💎', '💎'],
          ['🔔', '🔔', '🔔']
        ];
        const randomWin = winningCombinations[Math.floor(Math.random() * winningCombinations.length)];
        finalReels = randomWin;
        console.log('勝利組み合わせ:', finalReels);
      } else {
        // 敗北の場合、外れの組み合わせを生成
        let attempts = 0;
        do {
          finalReels = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          ];
          attempts++;
          if (attempts > 50) break; // 無限ループ防止
        } while (PAYOUTS[finalReels.join('')] !== undefined);
        console.log('敗北組み合わせ:', finalReels, '試行回数:', attempts);
      }
      
      setReels(finalReels);
      setIsSpinning(false);
      
      // 勝利判定
      const combination = finalReels.join('');
      const payout = PAYOUTS[combination];
      
      if (payout) {
        const winAmount = currentBet * payout;
        const finalChips = newChips + winAmount;
        setChips(finalChips);
        setResult(`🎉 勝利！ ${winAmount}チップ獲得！`);
        
        // ログインユーザーの場合、データベースを更新
        if (user) {
          await updateChips(finalChips, true);
        }
      } else {
        setResult('😔 残念... もう一度挑戦！');
        
        // ログインユーザーの場合、データベースを更新
        if (user) {
          await updateChips(newChips, false);
        }
      }
    }, spinDuration);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo" data-text="🎰 文化祭スロット">🎰 文化祭スロット</div>
          <div className="header-right">
            <div className="balance">
              💰 {chips} チップ
            </div>
            {!user ? (
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="学籍番号"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="login-input"
                />
                <button type="submit" className="btn">ログイン</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>👨‍🎓 {user.studentId}</span>
                <button 
                  onClick={() => setShowStats(!showStats)} 
                  className="btn"
                  style={{ background: 'linear-gradient(45deg, #00d4ff, #5200ff)' }}
                >
                  統計
                </button>
                <button onClick={handleLogout} className="btn btn-logout">ログアウト</button>
              </div>
            )}
            
            {/* 管理者ログインボタン */}
            {!isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)} 
                className="btn"
                style={{ 
                  background: 'linear-gradient(45deg, #ff4500, #ff8c00)', 
                  fontSize: '0.8rem',
                  marginLeft: '1rem'
                }}
              >
                🔧 管理者
              </button>
            )}
            
            {/* 管理者ログアウトボタン */}
            {isAdmin && (
              <button 
                onClick={handleAdminLogout} 
                className="btn"
                style={{ 
                  background: 'linear-gradient(45deg, #dc3545, #c82333)', 
                  fontSize: '0.8rem',
                  marginLeft: '1rem'
                }}
              >
                管理者終了
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="slot-container">
          <h1 className="slot-title">🎰 STAKE STYLE SLOT 🎰</h1>
          
          {/* 管理者ログインフォーム */}
          {showAdminPanel && !isAdmin && (
            <div style={{ 
              background: 'rgba(255, 69, 0, 0.1)', 
              border: '1px solid rgba(255, 69, 0, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ff4500', marginBottom: '1rem' }}>🔧 管理者ログイン</h3>
              <form onSubmit={handleAdminLogin} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
                <input
                  type="password"
                  placeholder="管理者パスワード"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 69, 0, 0.5)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white'
                  }}
                />
                <button type="submit" className="btn" style={{ background: 'linear-gradient(45deg, #ff4500, #ff8c00)' }}>
                  ログイン
                </button>
              </form>
            </div>
          )}
          
          {/* 管理者設定パネル */}
          {isAdmin && (
            <div style={{ 
              background: 'rgba(0, 123, 255, 0.1)', 
              border: '1px solid rgba(0, 123, 255, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#007bff', marginBottom: '1rem', textAlign: 'center' }}>🔧 管理者設定</h3>
              <div style={{ 
                background: 'rgba(40, 167, 69, 0.2)', 
                border: '1px solid rgba(40, 167, 69, 0.4)',
                borderRadius: '6px',
                padding: '0.5rem',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: '#28a745'
              }}>
                ✅ 管理者モード有効 | 勝率制御: ON | デバッグログ: ON
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'center' }}>
                <label style={{ color: 'white', fontWeight: 'bold' }}>勝率設定:</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={winProbability}
                    onChange={(e) => setWinProbability(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#00d4ff', minWidth: '60px', fontWeight: 'bold' }}>
                    {winProbability}%
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                現在の勝率: {winProbability}% (推奨: 15-30%)
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  onClick={() => {
                    const testResults = [];
                    for (let i = 0; i < 100; i++) {
                      const random = Math.random() * 100;
                      testResults.push(random < winProbability);
                    }
                    const winCount = testResults.filter(win => win).length;
                    setResult(`📊 テスト結果: 100回中${winCount}回勝利 (${winCount}%)`);
                  }}
                  className="btn"
                  style={{ background: 'linear-gradient(45deg, #28a745, #20c997)', fontSize: '0.9rem' }}
                >
                  🎲 確率テスト (100回)
                </button>
              </div>
            </div>
          )}
          
          {/* 統計表示 */}
          {showStats && userStats && (
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.6)', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>📊 あなたの統計</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                <div>🏆 勝利: {userStats.totalWins}</div>
                <div>😔 敗北: {userStats.totalLosses}</div>
                <div>📈 勝率: {userStats.totalWins + userStats.totalLosses > 0 ? 
                  ((userStats.totalWins / (userStats.totalWins + userStats.totalLosses)) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>
          )}

          {/* ランキング表示 */}
          {ranking.length > 0 && (
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.6)', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#00d4ff', textAlign: 'center', marginBottom: '0.5rem' }}>🏆 チップランキング TOP 5</h3>
              <div style={{ fontSize: '0.9rem' }}>
                {ranking.slice(0, 5).map((player, index) => (
                  <div key={player.student_id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '0.25rem 0',
                    borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    color: user && user.studentId === player.student_id ? '#00d4ff' : 'white'
                  }}>
                    <span>{index + 1}. {player.student_id}</span>
                    <span>{player.chips}💰 ({player.win_rate}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="slot-machine">
            <div className="reels">
              {reels.map((symbol, index) => (
                <div key={index} className={`reel ${isSpinning ? 'spinning' : ''}`}>
                  {symbol}
                </div>
              ))}
            </div>
            
            <div className="controls">
              <div className="bet-controls">
                <span className="bet-label">ベット額:</span>
                <div className="bet-buttons">
                  {[1, 2, 3].map(bet => (
                    <button
                      key={bet}
                      className={`bet-btn ${currentBet === bet ? 'active' : ''}`}
                      onClick={() => setCurrentBet(bet)}
                      disabled={isSpinning}
                    >
                      {bet}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                className="spin-btn"
                onClick={spin}
                disabled={isSpinning || chips < currentBet}
              >
                {isSpinning ? 'スピン中...' : 'SPIN!'}
              </button>
              
              {result && (
                <div className={`result ${result.includes('勝利') || result.includes('🎉') ? 'win' : 'lose'}`}>
                  {result}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            <h3>🎯 配当表</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
              <div>🍒🍒🍒 → x2</div>
              <div>🍋🍋🍋 → x2</div>
              <div>🍊🍊🍊 → x2</div>
              <div>🍇🍇🍇 → x2</div>
              <div>🍎🍎🍎 → x3</div>
              <div>⭐⭐⭐ → x3</div>
              <div>💎💎💎 → x3</div>
              <div>🔔🔔🔔 → x3</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<SlotMachine />);