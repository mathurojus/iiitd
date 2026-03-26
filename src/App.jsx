import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gamepad2, Wallet, Zap, Trophy, Flame, Box, TrendingUp,
  Clock, Server, Swords, User, Bot, Skull, BrainCircuit, Shield, Coins, Users, AlertTriangle, Crosshair, ShieldHalf, Pickaxe, Wand
} from 'lucide-react';
import './index.css';

// --- HIGH QUALITY DYNAMIC CARDS & DATA ---
const QUIZ_QUESTIONS = [
  { question: "What is the new independent validator client building on Solana?", options: ["Jito Labs", "Firedancer", "Agave", "Blinks"], answer: 1 },
  { question: "Which standard supports non-transferable (soulbound) tokens natively?", options: ["SPL Core", "Metaplex Neo", "Token-2022", "Anchor V3"], answer: 2 },
  { question: "Name of Solana Mobile's Web3 phone successor?", options: ["Saga", "Seeker", "Chapter 2 Elite", "Genesis"], answer: 1 },
  { question: "Mechanism used alongside PoS to order transactions on Solana?", options: ["PoW", "PoL", "Proof of History", "Proof of Space"], answer: 2 },
  { question: "What natively executes local browser actions on Twitter linking to Solana?", options: ["Phantom Hooks", "Backpack Core", "Blinks & Actions", "Wired Transfers"], answer: 2 }
];

const CARDS = [
  { id: 'warrior', name: 'Warrior', cost: 2, hp: 120, maxHp: 120, dmg: 10, speed: 2.5, attackSpeed: 1000, range: 6, color: '#14F195', component: <Swords size={28} color="#14F195" /> },
  { id: 'tank', name: 'Whale Tank', cost: 4, hp: 350, maxHp: 350, dmg: 25, speed: 1.0, attackSpeed: 1500, range: 6, color: '#3b82f6', component: <ShieldHalf size={28} color="#3b82f6" /> },
  { id: 'mage', name: 'Firedancer', cost: 3, hp: 80, maxHp: 80, dmg: 35, speed: 1.8, attackSpeed: 1200, range: 20, color: '#FFA500', component: <Wand size={28} color="#FFA500" /> },
  { id: 'spell', name: 'Rug Pull', cost: 3, type: 'spell', instantDmg: 150, color: '#9945FF', component: <Zap size={28} color="#9945FF" /> }
];

// --- CYBERCORE ANIMATED BACKGROUND ---
const CybercoreBackground = ({ beamCount = 60 }) => {
  const [beams, setBeams] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: beamCount }).map((_, i) => {
      const riseDur = Math.random() * 8 + 6;
      const fadeDur = riseDur;
      const type = Math.random() < 0.2 ? 'secondary' : 'primary';
      return {
        id: i,
        type,
        style: {
          left: `${Math.random() * 100}%`,
          width: `${Math.floor(Math.random() * 3) + 1}px`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${riseDur}s, ${fadeDur}s`,
        },
      };
    });
    setBeams(generated);
  }, [beamCount]);

  return (
    <div className="cybercore-scene" aria-hidden="true">
      <div className="cybercore-floor" />
      <div className="cybercore-main-column" />
      <div className="cybercore-light-stream-container">
        {beams.map((beam) => (
          <div key={beam.id} className={`cybercore-light-beam ${beam.type}`} style={beam.style} />
        ))}
      </div>
    </div>
  );
};




// --- WALLET MODAL ---
function WalletModal({ isOpen, onClose, onConnect }) {
  const [connectingTo, setConnectingTo] = useState(null);
  if (!isOpen) { if (connectingTo) setConnectingTo(null); return null; }
  const handleProviderClick = (name, address) => {
    setConnectingTo(name);
    setTimeout(() => { onConnect(name, address); setConnectingTo(null); }, 1800);
  };
  return (
    <div className="modal-overlay flex-center fade-in">
      <div className="glass-panel modal-content fade-in-up text-center">
        {connectingTo ? (
          <div className="flex-center fade-in" style={{ flexDirection: 'column', padding: '40px 0' }}>
            <div className="spin-slow mb-6" style={{ width: '64px', height: '64px', border: '4px dashed var(--primary)', borderRadius: '50%' }}></div>
            <h3 className="mb-2 text-xl">Connecting to {connectingTo}...</h3>
            <p className="text-muted text-sm line-height-relaxed">Please open your wallet extension to approve.</p>
          </div>
        ) : (
          <div className="fade-in">
            <h2 className="mb-6 text-gradient text-3xl">Connect Wallet</h2>
            <div className="wallet-options">
              <button className="btn btn-wallet" onClick={() => handleProviderClick("Phantom", "0xPhan...tom89A")}><img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Solana_logo.png/120px-Solana_logo.png" alt="Phantom" className="wallet-icon" style={{ filter: "grayscale(1) brightness(2)" }} />Phantom Mode</button>
              <button className="btn btn-wallet" onClick={() => handleProviderClick("Solflare", "0xSolf...lare2B")}><img src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Solana_logo.png/120px-Solana_logo.png" alt="Solflare" className="wallet-icon" style={{ filter: "grayscale(1) brightness(2)" }} />Solflare Mode</button>
            </div>
            <button className="btn-secondary mt-6 w-100 py-4" onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- CLASH ARENA ENGINE ---
function ClashArena({ onMatchEnd, wallet, totalSkr, requestConnect }) {
  const [gameState, setGameState] = useState('idle');
  const [matchType, setMatchType] = useState('normal');
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const [mana, setMana] = useState(5);
  const [oppMana, setOppMana] = useState(5);
  const [playerBaseHp, setPlayerBaseHp] = useState(1500);
  const [oppBaseHp, setOppBaseHp] = useState(1500);
  const [units, setUnits] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const intervalRef = useRef(null);

  const initiateSelection = () => { if (!wallet) requestConnect(); else setGameState('selecting'); };

  const startMatch = (type) => {
    if (type === 'premium' && totalSkr < 10) { alert("Not enough SKR tokens!"); return; }
    setMatchType(type);
    setPlayerBaseHp(1500); setOppBaseHp(1500); setMana(5); setOppMana(5); setUnits([]); setTimeLeft(60); setWinner(null); setSelectedCardId(null);
    setGameState('playing');
  };

  const spawnUnit = (owner, cardId, lane) => {
    const card = CARDS.find(c => c.id === cardId);
    if (!card) return;
    setUnits(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9), owner, cardId: card.id, lane,
      y: owner === 'player' ? 95 : 5, hp: card.hp, maxHp: card.maxHp, speed: card.speed, dmg: card.dmg, range: card.range, attackSpeed: card.attackSpeed,
      color: card.color, component: card.component, lastAttacked: 0, hitPulse: false
    }]);
  };

  const castSpell = (owner, spellCard, lane) => {
    setUnits(prev => prev.map(u => {
      if (u.lane === lane && u.owner !== owner) return { ...u, hp: u.hp - spellCard.instantDmg, hitPulse: true };
      return u;
    }));
  };

  const handleCardClick = (card) => { if (mana >= card.cost) setSelectedCardId(selectedCardId === card.id ? null : card.id); };

  const handleLaneClick = (laneOption) => {
    if (!selectedCardId) return;
    const card = CARDS.find(c => c.id === selectedCardId);
    if (mana < card.cost) return;
    setMana(prev => prev - card.cost);
    if (card.type === 'spell') castSpell('player', card, laneOption); else spawnUnit('player', card.id, laneOption);
    setSelectedCardId(null);
  };

  const handleEnd = useCallback((winState, finalGameState) => {
    if (finalGameState !== 'playing') return;
    setGameState('settling'); setWinner(winState);
    setTimeout(() => {
      setGameState('finished');
      const isWin = winState === 'player';
      let xpReward = isWin ? 200 : (winState === 'draw' ? 50 : 10);
      let skrReward = isWin ? 5 : (winState === 'draw' ? 2 : 0); // Given standard rewards unconditionally
      if (matchType === 'premium') {
        xpReward *= 3;
        skrReward = isWin ? 30 : (winState === 'draw' ? 10 : 0); // 30 yield covers the 10 cost for a net 20
      }
      onMatchEnd(xpReward, skrReward, matchType, isWin, 'arena');
    }, 2500);
  }, [onMatchEnd, matchType]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setPlayerBaseHp(p => { if (p <= 0) { handleEnd('opp', 'playing'); return 0; } return p; });
      setOppBaseHp(o => { if (o <= 0) { handleEnd('player', 'playing'); return 0; } return o; });
      setTimeLeft(tl => {
        if (tl <= 0) {
          setPlayerBaseHp(p => { setOppBaseHp(opp => { if (p > opp) handleEnd('player', 'playing'); else if (opp > p) handleEnd('opp', 'playing'); else handleEnd('draw', 'playing'); return opp; }); return p; });
          return 0;
        }
        return tl;
      });

      setUnits(currentUnits => {
        let activeUnits = currentUnits.filter(u => u.hp > 0).map(u => ({ ...u, hitPulse: false }));
        let pendingPlayerBaseDmg = 0; let pendingOppBaseDmg = 0;

        activeUnits = activeUnits.map(unit => {
          let target = null; let minDistance = Infinity;
          activeUnits.forEach(pt => {
            if (pt.owner !== unit.owner && pt.lane === unit.lane) {
              const dist = Math.abs(pt.y - unit.y);
              if (dist < minDistance) { minDistance = dist; target = pt; }
            }
          });
          let distToBase = unit.owner === 'player' ? unit.y : (100 - unit.y);

          if (target && minDistance <= unit.range) {
            if (now - unit.lastAttacked >= unit.attackSpeed) { target.hp -= unit.dmg; target.hitPulse = true; return { ...unit, lastAttacked: now }; } return unit;
          } else if (distToBase <= unit.range) {
            if (now - unit.lastAttacked >= unit.attackSpeed) {
              if (unit.owner === 'player') pendingOppBaseDmg += unit.dmg; else pendingPlayerBaseDmg += unit.dmg; return { ...unit, lastAttacked: now };
            } return unit;
          } else {
            const newY = Math.max(0, Math.min(100, unit.y + (unit.owner === 'player' ? -unit.speed : unit.speed))); return { ...unit, y: newY };
          }
        });
        if (pendingPlayerBaseDmg > 0) setPlayerBaseHp(prev => Math.max(0, prev - pendingPlayerBaseDmg));
        if (pendingOppBaseDmg > 0) setOppBaseHp(prev => Math.max(0, prev - pendingOppBaseDmg));
        return activeUnits.filter(u => u.hp > 0);
      });
    }, 200);

    const resourceLoop = setInterval(() => {
      setMana(prev => Math.min(10, prev + 1)); setOppMana(prev => Math.min(10, prev + 1)); setTimeLeft(prev => prev - 1);
      setOppMana(currOppMana => {
        if (currOppMana >= 2 && Math.random() > 0.5) {
          const affordable = CARDS.filter(c => c.cost <= currOppMana);
          if (affordable.length > 0) {
            const picked = affordable[Math.floor(Math.random() * affordable.length)];
            const lane = Math.random() > 0.5 ? 'left' : 'right';
            if (picked.type === 'spell') castSpell('opp', picked, lane); else spawnUnit('opp', picked.id, lane);
            return currOppMana - picked.cost;
          }
        }
        return currOppMana;
      });
    }, 1000);
    return () => { clearInterval(intervalRef.current); clearInterval(resourceLoop); };
  }, [gameState, handleEnd]);

  if (gameState === 'idle' || gameState === 'selecting' || gameState === 'settling' || gameState === 'finished') {
    return <StandaloneUIRedirects module="arena" gameState={gameState} matchType={matchType} setGameState={setGameState} startMatch={startMatch} initiateSelection={initiateSelection} winner={winner} />;
  }

  return (
    <div className="container flex-center fade-in" style={{ flexDirection: 'column', height: '100%', padding: '20px' }}>
      <div className="flex-between w-100 max-w-lg mb-6 bg-dark px-6 py-4 rounded border" style={{ boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
        <div className="font-mono text-xl" style={{ color: 'var(--opp-red)', fontWeight: '900', textShadow: '0 0 10px rgba(239,68,68,0.6)' }}>OPP: {oppBaseHp}</div>
        <div className="font-mono text-2xl font-bold" style={{ color: timeLeft <= 10 ? '#ef4444' : 'white' }}>{timeLeft}s</div>
        <div className="font-mono text-xl" style={{ color: 'var(--primary)', fontWeight: '900', textShadow: '0 0 10px rgba(20,241,149,0.6)' }}>YOU: {playerBaseHp}</div>
      </div>
      <div className="arena-board max-w-lg">
        <div className="base-tower opp-base">{oppBaseHp}</div>
        <div className="base-tower player-base">{playerBaseHp}</div>
        <div className={`arena-lane lane-left ${selectedCardId ? 'lane-active' : ''}`} onClick={() => handleLaneClick('left')}><div className="deploy-text">DEPLOY</div></div>
        <div className={`arena-lane lane-right ${selectedCardId ? 'lane-active' : ''}`} onClick={() => handleLaneClick('right')}><div className="deploy-text">DEPLOY</div></div>
        {units.map(u => (
          <div key={u.id} className={`battle-unit ${u.lane === 'left' ? 'lane-left' : 'lane-right'} ${u.hitPulse ? 'hit-anim' : ''}`}
            style={{ top: `${u.y}%`, border: `2px solid ${u.owner === 'player' ? u.color : 'var(--opp-red)'}`, background: u.owner === 'player' ? u.color + '33' : 'rgba(239, 68, 68, 0.2)' }}>
            <div className="unit-hp-bar"><div className="unit-hp-fill" style={{ width: `${(u.hp / u.maxHp) * 100}%`, background: u.owner === 'player' ? '#14f195' : '#ef4444' }}></div></div>
            {u.owner === 'opp' ? <Pickaxe size={24} color="#ef4444" /> : u.component}
          </div>
        ))}
      </div>
      <div className="w-100 max-w-lg mt-6">
        <div className="mana-bar-bg"><div className="mana-bar-fill" style={{ width: `${(mana / 10) * 100}%` }}></div></div>
        <div className="text-right text-sm font-mono mt-2 font-bold" style={{ color: '#c084fc' }}>{mana} / 10 Mana</div>
        <div className="card-deck">
          {CARDS.map(card => (
            <div key={card.id} className={`combat-card ${selectedCardId === card.id ? 'selected' : ''} ${mana < card.cost ? 'disabled' : ''}`} onClick={() => handleCardClick(card)}>
              <div className="card-cost">{card.cost}</div>
              <div className="card-graphic" style={{ borderColor: `${card.color}66`, boxShadow: `inset 0 0 10px ${card.color}33` }}>{card.component}</div>
              <div className="card-name">{card.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- QUIZ GAME ENGINE ---
function QuizGame({ onMatchEnd, wallet, requestConnect, totalSkr }) {
  const [gameState, setGameState] = useState('idle');
  const [matchType, setMatchType] = useState('normal');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // Array of { qIndex, selectedIdx, correct }

  const initiateSelection = () => { if (!wallet) requestConnect(); else setGameState('selecting'); };

  const startMatch = (type) => {
    if (type === 'premium' && totalSkr < 10) { alert("Not enough SKR tokens to join Premium Trivia!"); return; }
    setMatchType(type);
    setCurrentQuestionIndex(0); setScore(0); setTimeLeft(60); setGameState('playing'); setSelectedOption(null); setUserAnswers([]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) { handleGameEnd('playing'); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleGameEnd = (currentState) => {
    if (currentState !== 'playing') return;
    setGameState('settling');
    setTimeout(() => {
      setGameState('finished');
    }, 2500);
  };

  useEffect(() => {
    if (gameState === 'finished') {
      let xpReward = score;
      let isWin = score >= 150;
      let skrReward = isWin ? (score >= 250 ? 10 : 5) : 0; // base standard normal yields

      if (matchType === 'premium') {
        xpReward *= 3;
        if (score >= 250) skrReward = 30; else if (score >= 150) skrReward = 15; else skrReward = 0;
      }
      onMatchEnd(xpReward, skrReward, matchType, isWin, 'quiz');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleAnswer = (idx) => {
    if (selectedOption !== null || gameState !== 'playing') return;
    const correct = idx === QUIZ_QUESTIONS[currentQuestionIndex].answer;
    setSelectedOption(idx);

    if (correct) setScore(prev => prev + 50);

    setUserAnswers(prev => [...prev, { qIndex: currentQuestionIndex, selectedIdx: idx, isCorrect: correct }]);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) { setCurrentQuestionIndex(prev => prev + 1); }
      else { handleGameEnd('playing'); }
    }, 1200);
  };

  if (gameState === 'idle' || gameState === 'selecting' || gameState === 'settling') {
    return <StandaloneUIRedirects module="quiz" gameState={gameState} matchType={matchType} setGameState={setGameState} startMatch={startMatch} initiateSelection={initiateSelection} winner={null} score={score} />;
  }

  if (gameState === 'finished') {
    let xpReward = score;
    let isWin = score >= 150;
    let skrYield = isWin ? (score >= 250 ? 10 : 5) : 0;

    if (matchType === 'premium') { xpReward *= 3; if (score >= 250) skrYield = 30; else if (score >= 150) skrYield = 15; else skrYield = 0; }

    const displaySkr = matchType === 'premium' && !isWin ? '-10' : `+${skrYield}`;

    return (
      <div className="container section flex-center fade-in-up" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="glass-panel p-6" style={{ maxWidth: '600px', width: '100%' }}>
          <Trophy size={64} color="var(--primary)" className="animate-float mb-4 mx-auto" />
          <h2 className="text-4xl mb-6 text-center text-gradient">Quiz Complete!</h2>

          <div className="mb-8 p-4 rounded bg-dark border" style={{ maxHeight: '30vh', overflowY: 'auto' }}>
            <h3 className="mb-4 text-xl font-bold tracking-wider uppercase text-muted">Answer Summary</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {userAnswers.map((ans, i) => {
                const q = QUIZ_QUESTIONS[ans.qIndex];
                return (
                  <li key={i} className="mb-4 bg-dark p-4 rounded border" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="font-bold text-sm mb-2">{q.question}</p>
                    <p className="text-sm">
                      Your Answer: <span style={{ color: ans.isCorrect ? 'var(--primary)' : 'var(--opp-red)', fontWeight: 'bold' }}>{q.options[ans.selectedIdx]}</span>
                      {ans.isCorrect ? ' ✅' : ' ❌'}
                    </p>
                    {!ans.isCorrect && (<p className="text-sm text-primary mt-1">Correct Answer: {q.options[q.answer]}</p>)}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="grid-2 gap-4 mb-8">
            <div className="bg-dark p-6 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
              <h3 className="text-muted text-sm uppercase mb-2">Total XP Earned</h3>
              <p className="text-4xl text-gradient font-bold">+{xpReward}</p>
            </div>
            <div className="bg-dark p-6 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
              <h3 className="text-muted text-sm uppercase mb-2">SKR Tokens</h3>
              <p className="text-4xl font-bold" style={{ color: '#FFA500' }}>{displaySkr}</p>
            </div>
          </div>
          <button className="btn btn-large w-100" onClick={() => setGameState('idle')} style={{ padding: '20px' }}>Return to Navigation</button>
        </div>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[currentQuestionIndex];
  return (
    <div className="container section flex-center fade-in" style={{ paddingTop: '40px', alignItems: 'flex-start' }}>
      <div className="glass-panel p-6 w-100 max-w-lg mx-auto">
        <div className="flex-between mb-8 border bg-dark" style={{ padding: '16px 24px', borderRadius: '16px', borderColor: 'var(--glass-border)', boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
          <div className="flex-center gap-2"><Clock color={timeLeft <= 10 ? '#ef4444' : 'var(--primary)'} /><span className="font-mono text-2xl font-bold" style={{ color: timeLeft <= 10 ? '#ef4444' : 'white' }}>00:{timeLeft.toString().padStart(2, '0')}</span></div>
          <div className="flex-center gap-2 font-mono text-primary font-bold text-2xl"><Trophy size={20} /> {score} XP</div>
        </div>
        <div className="mb-8 bg-dark" style={{ padding: '30px', borderRadius: '16px' }}>
          <span className="text-primary text-sm font-bold uppercase tracking-wider">Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}</span>
          <h3 className="text-2xl mt-4 line-height-relaxed font-bold">{q.question}</h3>
        </div>
        <div>
          {q.options.map((opt, idx) => {
            let stateClass = "btn-quiz";
            if (selectedOption !== null) {
              if (idx === q.answer) stateClass += " correct";
              else if (idx === selectedOption) stateClass += " wrong";
              else stateClass += " disabled";
            }
            return (<button key={idx} className={stateClass} onClick={() => handleAnswer(idx)}>{opt}</button>);
          })}
        </div>
      </div>
    </div>
  );
}


// Sub-component wrapper for UI screens
function StandaloneUIRedirects({ module, gameState, matchType, setGameState, startMatch, initiateSelection, winner }) {
  if (gameState === 'idle') return (
    <div className="container section text-center fade-in-up">
      {module === 'quiz' ? (
        <>
          <h1 style={{ fontSize: '4.5rem', marginBottom: '24px', textTransform: 'uppercase' }}>Web3 <span className="text-gradient">Trivia</span></h1>
          <p className="mb-6 text-muted max-w-lg mx-auto" style={{ fontSize: '1.25rem' }}>Are you a Solana maximalist? Prove it. You have 60 seconds.</p>
          <button className="btn btn-large" onClick={initiateSelection}><BrainCircuit size={28} className="mr-2" style={{ marginRight: '8px' }} /> Start Quiz Challenge</button>
        </>
      ) : (
        <>
          <h1 style={{ fontSize: '4.5rem', marginBottom: '24px', textTransform: 'uppercase' }}>Clash <span className="text-gradient">Arena</span></h1>
          <p className="mb-6 text-muted max-w-lg mx-auto" style={{ fontSize: '1.25rem' }}>Deploy structural Web3 units onto the grid. Destroy the Opponent's base in 60 seconds.</p>
          <button className="btn btn-large" onClick={initiateSelection}><Swords size={28} className="mr-2" style={{ marginRight: '8px' }} /> Enter The Match</button>
        </>
      )}
    </div>
  );
  if (gameState === 'selecting') return (
    <div className="container section flex-center fade-in-up" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel p-6 max-w-lg w-100 text-center">
        <h2 className="text-3xl mb-6">Select Match Level</h2>
        <div className="grid-2 gap-4">
          <button className="btn btn-secondary flex-center" style={{ flexDirection: 'column', height: '100%', padding: '30px 20px' }} onClick={() => startMatch('normal')}>
            <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>Normal</h3>
            <p className="text-muted text-sm mb-4 line-height-relaxed">Free Entry. Casual layout. Smaller rewards.</p>
            <div className="text-primary font-bold px-6 py-2 rounded" style={{ background: 'rgba(20, 241, 149, 0.1)' }}>Free Entry</div>
          </button>
          <button className="btn flex-center" style={{ flexDirection: 'column', height: '100%', padding: '30px 20px' }} onClick={() => startMatch('premium')}>
            <Shield size={32} className="mb-2" color="black" />
            <h3 className="mb-2" style={{ fontSize: '1.5rem' }}>Premium</h3>
            <p className="text-sm mb-4 line-height-relaxed" style={{ color: 'rgba(0,0,0,0.7)' }}>High stakes. Requires SKR. Massive XP & Token multipliers.</p>
            <div className="font-bold bg-dark px-6 py-2 rounded" style={{ color: '#FFA500' }}>Drop 10 SKR</div>
          </button>
        </div>

        <div style={{ marginTop: '36px' }}>
          <button className="btn w-100 py-4"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: 'none',
              fontSize: '1.2rem',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
            onClick={() => setGameState('idle')}>
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
  if (gameState === 'settling') return (
    <div className="container section flex-center fade-in" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel p-6 text-center" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="animate-pulse-glow mx-auto mb-6" style={{ width: '80px', height: '80px', border: '4px dashed var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Server color="var(--primary)" size={32} /></div>
        <h2 className="mb-2 text-gradient" style={{ fontSize: '2rem' }}>Settling Match On-Chain...</h2>
      </div>
    </div>
  );
  if (gameState === 'finished') {
    const isWin = winner === 'player';
    let xpCommand = isWin ? 200 : (winner === 'draw' ? 50 : 10);
    let skrCommand = isWin ? 5 : (winner === 'draw' ? 2 : 0);
    if (matchType === 'premium') {
      xpCommand *= 3;
      skrCommand = isWin ? 30 : (winner === 'draw' ? 10 : 0);
    }

    // Explicit format string to correctly showcase Loss mechanics for Premium mode
    const displaySkr = matchType === 'premium' && !isWin && winner !== 'draw' ? '-10' : `+${skrCommand}`;

    return (
      <div className="container section flex-center fade-in-up" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="glass-panel p-6 w-100 max-w-lg text-center">
          {isWin ? <Trophy size={80} color="var(--primary)" className="animate-float mx-auto mb-6" /> : <Skull size={80} color="#ef4444" className="mx-auto mb-6" />}
          <h2 className="text-4xl mb-6" style={{ color: isWin ? 'var(--primary)' : '#ef4444' }}>{isWin ? "VICTORY!" : winner === 'draw' ? "DRAW!" : "DEFEAT!"}</h2>

          <div className="grid-2 gap-4 mb-8">
            <div className="bg-dark p-6 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
              <h3 className="text-muted text-sm uppercase mb-2 tracking-wider">Base XP Earned</h3>
              <p className="text-4xl font-bold text-gradient">+{xpCommand}</p>
            </div>
            <div className="bg-dark p-6 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
              <h3 className="text-muted text-sm uppercase mb-2 tracking-wider">SKR Tokens</h3>
              <p className="text-4xl font-bold" style={{ color: '#FFA500' }}>{displaySkr}</p>
            </div>
          </div>

          <button className="btn btn-large w-100" onClick={() => setGameState('idle')} style={{ padding: '20px' }}>Return to Navigation</button>
        </div>
      </div>
    );
  }
}

// --- CLANS (Social System) ---
function ClansTab({ wallet, winStreak, hasJoinedClan, onJoin }) {
  if (wallet && !hasJoinedClan) return (
    <div className="container section fade-in-up">
      <h1 className="text-4xl mb-4 text-center text-gradient uppercase font-bold tracking-wider">Join a Faction</h1>
      <p className="text-center text-muted mb-8 max-w-lg mx-auto" style={{ lineHeight: '1.6' }}>Clan Wars operate on weekly EPOCH cycles. Join a faction to pool your PvP Win Streaks and earn massive SKR distributions.</p>

      <div className="grid-2 max-w-lg mx-auto" style={{ gap: '24px' }}>
        <div className="clan-board p-8 text-center" style={{ border: '2px solid rgba(20,241,149,0.3)', boxShadow: '0 10px 40px rgba(20,241,149,0.1)' }}>
          <Shield size={64} color="var(--primary)" className="mx-auto mb-4" />
          <h2 className="text-2xl mb-2 font-bold">Solana Degens</h2>
          <p className="text-muted text-sm mb-6">Rank: #4 • Members: 42/50</p>
          <button className="btn btn-large w-100 py-3" style={{ fontSize: '1rem', padding: '16px' }} onClick={onJoin}>
            Join Faction
          </button>
        </div>
        <div className="clan-board p-8 text-center" style={{ opacity: 0.5, filter: 'grayscale(1)' }}>
          <Server size={64} color="var(--text-muted)" className="mx-auto mb-4" />
          <h2 className="text-2xl mb-2 font-bold">ETH Maxis</h2>
          <p className="text-muted text-sm mb-6">Rank: #1 • Members: 50/50</p>
          <button className="btn w-100 py-3 disabled" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Clan Full
          </button>
        </div>
      </div>
    </div>
  );
  if (!wallet) return (
    <div className="container section text-center fade-in" style={{ paddingTop: '100px' }}><Users size={80} className="mx-auto mb-6 text-muted" /><h2 className="text-4xl mb-4">Connect to join a Clan.</h2><p className="text-muted text-xl mb-6">Link your Solana wallet to view the Social Wars.</p></div>
  );

  const addressString = wallet?.address || "";

  return (
    <div className="container section fade-in-up">
      <h1 className="text-4xl mb-8 text-center text-gradient uppercase font-bold tracking-wider">Clan Wars</h1>

      <div className="grid-2 align-items-stretch">
        <div className="clan-board">
          <div className="clan-header">
            <Shield size={48} color="var(--secondary)" className="mx-auto mb-4" />
            <h2 className="text-3xl mb-2 font-bold">Solana Degens</h2>
            <div className="text-primary font-mono text-sm uppercase tracking-wider bg-dark inline-block px-6 py-2 rounded">Current War Score: 18</div>
          </div>

          <div className="p-6" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <h3 className="mb-4 text-sm uppercase text-muted tracking-wider font-bold"><span style={{ color: '#FFA500' }}>👑</span> MVP ROSTER (CARRYING)</h3>
            <ul className="clan-list font-mono text-sm">
              <li className="clan-item"><span>0xWhale...99Z</span> <span className="text-primary font-bold">🔥 8 Streak</span></li>
              <li className="clan-item"><span>0xAlpha...44X</span> <span className="text-primary font-bold">🔥 5 Streak</span></li>
            </ul>
          </div>

          <div className="p-6">
            <h3 className="mb-4 text-sm uppercase text-muted tracking-wider font-bold"><AlertTriangle size={16} style={{ verticalAlign: 'middle', color: '#ef4444', marginRight: '6px' }} /> NEEDS HELP (WALL OF SHAME)</h3>
            <ul className="clan-list font-mono text-sm">
              <li className="clan-item"><span>0xDegen...12A</span> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>0 Streak</span></li>
              <li className="clan-item" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="font-bold tracking-wider text-primary">{addressString.substring(0, 8)} (YOU)</span>
                {winStreak === 0 ? <span style={{ color: '#ef4444', fontWeight: 'bold' }}>0 Streak</span> : <span className="text-primary fire-streak font-bold">🔥 {winStreak} Streak</span>}
              </li>
            </ul>
          </div>
        </div>

        <div className="clan-board p-8 text-center flex-center" style={{ flexDirection: 'column', justifyContent: 'center' }}>
          {winStreak === 0 ? (
            <div className="social-pressure-banner fade-in-up">
              <h3 className="mb-3 text-xl" style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ You are dragging the Clan down!</h3>
              <p className="text-sm line-height-relaxed text-muted">You currently have a zero Win Streak. Your clan "Solana Degens" needs you to win PvP Arena or Trivia matches sequentially to actively boost the overall weekly War Score!</p>
            </div>
          ) : (
            <div className="social-pressure-banner fade-in-up" style={{ background: 'rgba(20,241,149,0.1)', borderLeftColor: '#14F195' }}>
              <h3 className="mb-3 text-xl" style={{ color: '#14F195', fontWeight: 'bold' }}>🔥 You are carrying!</h3>
              <p className="text-sm line-height-relaxed text-muted">Incredible work keeping that {winStreak} Win Streak alive limitlessly. The entire clan salutes you.</p>
            </div>
          )}

          <h3 className="text-xl mt-6 mb-4 uppercase tracking-wider font-bold">Weekly Output vs "Eth Maxis"</h3>
          <div className="w-100 bg-dark rounded overflow-hidden border" style={{ height: '36px', display: 'flex' }}>
            <div style={{ width: '45%', background: 'linear-gradient(90deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: '0.9rem', fontWeight: 'bold' }}>US (45%)</div>
            <div style={{ width: '55%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', fontSize: '0.9rem', fontWeight: 'bold' }}>THEM (55%)</div>
          </div>
          <p className="text-muted text-sm mt-6 font-mono">War ends in 2d 14h. Top Clan shares 10,000 SKR.</p>
        </div>
      </div>
    </div>
  );
}

// --- MARKET PREDICTION TAB (LSTM) ---
const SOL_PRICE_DATA = [
  128.7, 126.8, 129.4, 128.4, 127.3, 127.1, 126.7, 118.7, 122.4, 124.1, 
  124.0, 127.1, 128.1, 125.2, 122.6, 117.7, 117.0, 117.5, 115.9, 105.4,
  104.9, 100.7, 102.7, 104.4, 102.9, 97.8, 96.0, 92.0, 89.9, 78.2, 
  81.2, 87.4, 84.8, 87.5, 88.1, 86.9, 83.4, 86.7, 83.7, 82.9, 
  81.2, 79.2, 81.8, 78.3, 80.2, 84.2, 87.2, 88.0, 89.1, 86.0, 
  85.4, 86.3, 85.0, 85.0, 82.8, 81.5, 81.2, 82.4, 83.5, 84.6,
  85.3, 85.1, 85.2, 82.7, 79.9, 77.8, 76.7, 78.9, 83.3, 88.0, 
  86.7, 85.8, 83.5, 81.8, 78.7, 84.2
];

function MarketPredictionTab() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const runModel = () => {
    setIsPredicting(true);
    setTimeout(() => {
      // Simulate LSTM momentum calculation
      const lastPrice = SOL_PRICE_DATA[SOL_PRICE_DATA.length - 1];
      const momentum = (lastPrice - SOL_PRICE_DATA[SOL_PRICE_DATA.length - 5]) / 5;
      const forecast = Array.from({ length: 10 }).map((_, i) => lastPrice + (momentum * (i + 1)) + (Math.random() * 2 - 1));
      setPredictionResult(forecast);
      setIsPredicting(false);
    }, 2500);
  };

  const minPrice = Math.min(...SOL_PRICE_DATA) - 5;
  const maxPrice = Math.max(...SOL_PRICE_DATA) + 20;
  const range = maxPrice - minPrice;
  const width = 800;
  const height = 300;

  const getX = (i) => (i / (SOL_PRICE_DATA.length + 10)) * width;
  const getY = (val) => height - ((val - minPrice) / range) * height;

  const points = SOL_PRICE_DATA.map((p, i) => `${getX(i)},${getY(p)}`).join(' ');

  return (
    <div className="container section fade-in-up">
      <h1 className="text-4xl mb-4 text-center text-gradient uppercase font-bold tracking-wider">Market Intelligence</h1>
      <p className="text-center text-muted mb-8 max-w-lg mx-auto">Neural Network (LSTM) momentum analysis on SOL/USDT historical throughput.</p>

      <div className="glass-panel p-8 mb-8 overflow-hidden" style={{ position: 'relative' }}>
         <div className="flex-between mb-6">
            <div>
               <h2 className="text-2xl font-bold flex-center"><TrendingUp size={24} className="mr-2 text-primary" style={{marginRight:'8px'}}/> SOL Predicted Momentum</h2>
               <p className="text-muted text-sm uppercase tracking-widest font-mono">Model: sol_lstm.keras • Confidence: 84.2%</p>
            </div>
            <button className={`btn ${isPredicting ? 'disabled' : ''}`} onClick={runModel} style={{ padding: '12px 24px' }}>
               {isPredicting ? 'Analyzing Latency...' : 'Run Prediction'}
            </button>
         </div>

         <div className="bg-dark rounded border p-4" style={{ height: '350px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
               <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                     <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
               </defs>
               
               {/* Grid Lines */}
               {[0, 0.25, 0.5, 0.75, 1].map(p => (
                  <line key={p} x1="0" y1={p * height} x2={width} y2={p * height} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
               ))}

               {/* Historical Area */}
               <polyline points={`${points} ${getX(SOL_PRICE_DATA.length-1)},${height} 0,${height}`} fill="url(#lineGrad)" style={{ transition: 'all 0.5s' }} />

               {/* Historical Line */}
               <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }} />

               {/* Prediction Line */}
               {predictionResult && (
                  <polyline 
                     points={predictionResult.map((p, i) => `${getX(SOL_PRICE_DATA.length + i)},${getY(p)}`).join(' ')} 
                     fill="none" 
                     stroke="var(--secondary)" 
                     strokeWidth="3" 
                     strokeDasharray="8,4"
                     className="fade-in"
                     style={{ filter: 'drop-shadow(0 0 10px var(--secondary))' }}
                  />
               )}

               {/* Current Price Marker */}
               <circle cx={getX(SOL_PRICE_DATA.length - 1)} cy={getY(SOL_PRICE_DATA[SOL_PRICE_DATA.length - 1])} r="5" fill="var(--primary)">
                  <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
               </circle>
            </svg>

            {isPredicting && (
               <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(4px)' }}>
                  <div className="text-center">
                     <Box size={48} className="animate-spin text-primary mb-4 mx-auto" />
                     <p className="text-xl font-mono text-gradient">Crunching Tensors...</p>
                  </div>
               </div>
            )}
         </div>

         <div className="grid-3 mt-8 gap-4">
            <div className="bg-dark p-4 rounded border text-center">
               <p className="text-xs text-muted uppercase font-bold mb-1">Volatility</p>
               <p className="text-xl font-bold">14.2%</p>
            </div>
            <div className="bg-dark p-4 rounded border text-center">
               <p className="text-xs text-muted uppercase font-bold mb-1">RSI (14)</p>
               <p className="text-xl font-bold" style={{color: 'var(--primary)'}}>58.4</p>
            </div>
            <div className="bg-dark p-4 rounded border text-center">
               <p className="text-xs text-muted uppercase font-bold mb-1">Momentum</p>
               <p className="text-xl font-bold" style={{color: 'var(--secondary)'}}>{predictionResult ? (predictionResult[9] > predictionResult[0] ? 'BULLISH' : 'BEARISH') : 'NEUTRAL'}</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- GLOBAL LEADERBOARD ---

const MOCK_LEADERBOARD = [
  { rank: 1, address: '0xSolKing...8X', xp: 14500, clan: 'Solana Degens' },
  { rank: 2, address: '0xWhale...99Z', xp: 12200, clan: 'Solana Degens' },
  { rank: 3, address: '0xAlpha...44X', xp: 8900, clan: 'Solana Degens' },
  { rank: 4, address: '0xEthMaxi...1A', xp: 8100, clan: 'ETH Maxis' },
  { rank: 5, address: '0xDegen...12A', xp: 7500, clan: 'Solana Degens' },
  { rank: 6, address: '0xTrader...7B', xp: 6200, clan: 'Independent' },
  { rank: 7, address: '0xSniper...9C', xp: 5400, clan: 'Independent' },
  { rank: 8, address: '0xNoob...2D', xp: 4800, clan: 'ETH Maxis' },
  { rank: 9, address: '0xBot...3E', xp: 3500, clan: 'Independent' },
];

function LeaderboardTab({ wallet, totalXp }) {
  const addressString = wallet?.address || "";
  const playerEntry = {
    isPlayer: true,
    address: wallet ? `${addressString.substring(0, 8)}... (YOU)` : 'Guest Player (YOU)',
    xp: totalXp,
    clan: 'Solana Degens'
  };

  const fullBoard = [...MOCK_LEADERBOARD, playerEntry].sort((a, b) => b.xp - a.xp);
  fullBoard.forEach((entry, idx) => entry.rank = idx + 1);

  return (
    <div className="container section fade-in-up">
      <h1 className="text-4xl mb-8 text-center text-gradient uppercase font-bold tracking-wider">Global Rankings</h1>
      <div className="glass-panel w-100 max-w-lg mx-auto overflow-hidden">
        <div className="flex-between p-4 text-muted text-sm font-bold uppercase tracking-wider" style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ flex: 1 }}>Rank</div>
          <div style={{ flex: 3 }}>Player</div>
          <div style={{ flex: 2, textAlign: 'right' }}>Total XP</div>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {fullBoard.slice(0, 10).map((p, idx) => (
            <li key={idx} className="flex-between p-4" style={{
              background: p.isPlayer ? 'linear-gradient(90deg, rgba(20,241,149,0.1) 0%, transparent 100%)' : 'transparent',
              borderLeft: p.isPlayer ? '4px solid var(--primary)' : '4px solid transparent',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              transition: 'background 0.2s'
            }}>
              <div style={{ flex: 1, color: idx < 3 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                {idx === 0 ? '🏆 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${p.rank}`}
              </div>
              <div style={{ flex: 3, fontFamily: 'monospace', color: p.isPlayer ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {p.address}
              </div>
              <div style={{ flex: 2, textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                {p.xp.toLocaleString()} XP
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// --- PLAYER PROFILE TAB ---
function ProfileTab({ wallet, winStreak, totalSkr, totalXp, quizWins, battleWins }) {
  if (!wallet) return (
    <div className="container section text-center fade-in" style={{ paddingTop: '100px' }}><User size={80} className="mx-auto mb-6 text-muted" /><h2 className="text-4xl mb-4">Connect Wallet</h2><p className="text-muted text-xl mb-6">Link your Solana wallet to view your player statistics.</p></div>
  );

  const addressString = wallet?.address || "";

  return (
    <div className="container section fade-in-up">
      <h1 className="text-4xl mb-8 text-center text-gradient uppercase font-bold tracking-wider">Player Profile</h1>
      <div className="glass-panel p-8 max-w-lg mx-auto w-100">
        <div className="flex-center mb-8" style={{ flexDirection: 'column' }}>
          <div className="animate-pulse-glow mb-4" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} color="#020617" />
          </div>
          <h2 className="text-2xl font-mono text-primary" style={{ wordBreak: 'break-all' }}>{addressString}</h2>
          <p className="text-muted text-sm mt-2">Active Solana Player</p>
        </div>

        <div className="grid-2 gap-4 mb-6">
          <div className="bg-dark p-4 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
            <Flame size={24} color="var(--warning)" className="mx-auto mb-2" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Win Streak</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'white' }}>{winStreak}</p>
          </div>
          <div className="bg-dark p-4 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
            <Coins size={24} color="#14F195" className="mx-auto mb-2" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">SKR Balance</p>
            <p className="text-2xl font-bold font-mono" style={{ color: '#14F195' }}>{totalSkr}</p>
          </div>
        </div>

        <div className="grid-2 gap-4">
          <div className="bg-dark p-4 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
            <Swords size={24} color="var(--secondary)" className="mx-auto mb-2" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Arena Wins</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'white' }}>{battleWins}</p>
          </div>
          <div className="bg-dark p-4 rounded text-center border" style={{ borderColor: 'var(--glass-border)' }}>
            <BrainCircuit size={24} color="var(--primary)" className="mx-auto mb-2" />
            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Trivia Wins</p>
            <p className="text-2xl font-bold font-mono" style={{ color: 'white' }}>{quizWins}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-muted text-sm mb-2">Total Accumulated Lifetime Output</p>
          <h3 className="text-xl text-gradient font-bold">{totalXp.toLocaleString()} XP</h3>
        </div>
      </div>
    </div>
  );
}

// --- MAIN APP DRIVER ---
function App() {
  const [wallet, setWallet] = useState(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('battle');
  const [totalXp, setTotalXp] = useState(150);
  const [totalSkr, setTotalSkr] = useState(100);
  const [winStreak, setWinStreak] = useState(0);
  const [hasJoinedClan, setHasJoinedClan] = useState(false);
  const [quizWins, setQuizWins] = useState(0);
  const [battleWins, setBattleWins] = useState(0);

  const handleConnect = (name, address) => { setWallet({ name, address }); setWalletModalOpen(false); };

  const handleMatchEnd = (xpReward, skrYield, matchType, isWin, moduleName) => {
    if (isWin) {
      setWinStreak(prev => prev + 1);
      if (moduleName === 'arena') setBattleWins(prev => prev + 1);
      if (moduleName === 'quiz') setQuizWins(prev => prev + 1);
      if (winStreak >= 2) { xpReward = Math.floor(xpReward * 1.5); skrYield = Math.floor(skrYield * 1.5); }
    } else { setWinStreak(0); }

    setTotalXp(prev => prev + xpReward);
    // Explicit token deduction handled seamlessly.
    // If premium, we subtract 10 right away, and add the yield.
    // Yields are 30 (win), 10 (draw), 0 (loss). So Net is +20, 0, or -10.
    if (matchType === 'premium') {
      setTotalSkr(prev => (prev - 10) + skrYield);
    } else {
      // normal mode adds direct SKR yields! (+5)
      setTotalSkr(prev => prev + skrYield);
    }
  };

  return (
    <div>
      <CybercoreBackground beamCount={50} />

      <nav className="container flex-between" style={{ padding: '24px 20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(11, 14, 20, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="flex-center cursor-pointer" style={{ gap: '16px' }}>
          <Gamepad2 size={32} color="var(--primary)" className="animate-pulse-glow" style={{ borderRadius: '50%' }} />
          <span className="font-bold tracking-wider hide-mobile text-xl">CLASH<span className="text-gradient">GO</span></span>
        </div>

        <div className="flex-center bg-dark rounded border p-1" style={{ boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
          <button className={`btn ${activeTab === 'battle' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'battle' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('battle')}>
            <Swords size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Arena</span>
          </button>
          <button className={`btn ${activeTab === 'quiz' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'quiz' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('quiz')}>
            <BrainCircuit size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Quiz</span>
          </button>
          <button className={`btn ${activeTab === 'market' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'market' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('market')}>
            <TrendingUp size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Market</span>
          </button>

          <button className={`btn ${activeTab === 'clans' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'clans' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('clans')}>
            <Users size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Clans</span>
          </button>
          <button className={`btn ${activeTab === 'leaderboard' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'leaderboard' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('leaderboard')}>
            <Trophy size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Rank</span>
          </button>
          <button className={`btn ${activeTab === 'profile' ? '' : 'btn-secondary'}`} style={{ padding: '10px 24px', border: 'none', background: activeTab === 'profile' ? '' : 'transparent', boxShadow: 'none' }} onClick={() => setActiveTab('profile')}>
            <User size={20} /> <span className="hide-mobile font-bold" style={{ marginLeft: '8px' }}>Profile</span>
          </button>
        </div>

        <div className="flex-center gap-6">
          {wallet && (
            <div className="font-mono flex-center hide-mobile text-lg" style={{ gap: '16px' }}>
              <span className={winStreak >= 3 ? 'fire-streak font-bold text-xl' : 'text-muted font-bold'}>🔥 {winStreak}</span>
              <span className="font-bold" style={{ color: '#14F195', background: 'rgba(20,241,149,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(20,241,149,0.3)' }}>{totalSkr} SKR</span>
            </div>
          )}
          <button className="btn btn-secondary hide-mobile" style={{ padding: '12px 24px' }} onClick={() => wallet ? setWallet(null) : setWalletModalOpen(true)}>
            <Wallet size={18} /> {wallet ? <span className="text-primary font-bold font-mono">{wallet.address.substring(0, 4)}..</span> : 'Connect'}
          </button>
        </div>
      </nav>

      <style>{`@media (max-width: 768px) { .hide-mobile { display: none !important; } }`}</style>

      <div style={{ minHeight: 'calc(100vh - 90px)', position: 'relative', zIndex: 10 }}>
        {activeTab === 'battle' && <ClashArena onMatchEnd={handleMatchEnd} wallet={wallet} totalSkr={totalSkr} requestConnect={() => setWalletModalOpen(true)} />}
        {activeTab === 'quiz' && <QuizGame onMatchEnd={handleMatchEnd} wallet={wallet} totalSkr={totalSkr} requestConnect={() => setWalletModalOpen(true)} />}
        {activeTab === 'market' && <MarketPredictionTab />}
        {activeTab === 'clans' && <ClansTab wallet={wallet} winStreak={winStreak} hasJoinedClan={hasJoinedClan} onJoin={() => setHasJoinedClan(true)} />}
        {activeTab === 'leaderboard' && <LeaderboardTab wallet={wallet} totalXp={totalXp} />}
        {activeTab === 'profile' && <ProfileTab wallet={wallet} winStreak={winStreak} totalSkr={totalSkr} totalXp={totalXp} quizWins={quizWins} battleWins={battleWins} />}
      </div>

      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} onConnect={handleConnect} />
    </div>
  );
}

export default App;
