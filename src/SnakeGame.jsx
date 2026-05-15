  import React, { useState, useEffect, useCallback, useRef } from 'react';
  
  const GRID_SIZE = 20;
  const CELL_SIZE = 40;
  const INITIAL_SNAKE = [[10, 10], [10, 11], [10, 12]];
  const INITIAL_DIRECTION = 'UP';
  
  const SnakeGame = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState([5, 5]);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [difficulty, setDifficulty] = useState(150);
    const [isWrapped, setIsWrapped] = useState(false);
    const [ghostOpacity, setGhostOpacity] = useState(1);
  
    const nextDirection = useRef(INITIAL_DIRECTION);
  
    const generateFood = useCallback(() => {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      return [x, y];
    }, []);
  
    useEffect(() => {
      const handleKeyPress = (e) => {
        const key = e.key.toLowerCase();
        if ((key === 'arrowup' || key === 'w') && direction !== 'DOWN') nextDirection.current = 'UP';
        if ((key === 'arrowdown' || key === 's') && direction !== 'UP') nextDirection.current = 'DOWN';
        if ((key === 'arrowleft' || key === 'a') && direction !== 'RIGHT') nextDirection.current = 'LEFT';
        if ((key === 'arrowright' || key === 'd') && direction !== 'LEFT') nextDirection.current = 'RIGHT';
      };
  
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction]);
  
    useEffect(() => {
      if (isGameOver) return;
  
      const moveSnake = setInterval(() => {
        setDirection(nextDirection.current);
        setSnake((prev) => {
          const head = [...prev[0]];
          const currentDir = nextDirection.current;
  
          if (currentDir === 'UP') head[1] -= 1;
          if (currentDir === 'DOWN') head[1] += 1;
          if (currentDir === 'LEFT') head[0] -= 1;
          if (currentDir === 'RIGHT') head[0] += 1;
  
          const rawX = head[0];
          const rawY = head[1];
          head[0] = (rawX + GRID_SIZE) % GRID_SIZE;
          head[1] = (rawY + GRID_SIZE) % GRID_SIZE;
  
          const didWrap = rawX !== head[0] || rawY !== head[1];
  
          if (didWrap) {
            setIsWrapped(true);
            setGhostOpacity(0.15);
            setTimeout(() => {
              setGhostOpacity(1);
              setTimeout(() => setIsWrapped(false), difficulty * 0.4);
            }, difficulty * 0.35);
          }
  
          if (prev.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
            setIsGameOver(true);
            return prev;
          }
  
          const newSnake = [head, ...prev];
          if (head[0] === food[0] && head[1] === food[1]) {
            setScore(s => s + 10);
            setFood(generateFood());
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }, difficulty);
  
      return () => clearInterval(moveSnake);
    }, [food, isGameOver, difficulty, generateFood]);
  
    const resetGame = () => {
      setSnake(INITIAL_SNAKE);
      nextDirection.current = INITIAL_DIRECTION;
      setDirection(INITIAL_DIRECTION);
      setIsGameOver(false);
      setScore(0);
      setIsWrapped(false);
      setGhostOpacity(1);
    };
  
    return (
      <>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
  
        <div style={styles.container} tabIndex="0">
          <div style={styles.header}>
            <h1 style={styles.title}>CLASSIC SNAKE GAME</h1>
            <div style={styles.stats}>
              <div style={styles.statBox}>
                <span style={styles.label}>SCORE</span>
                <span style={styles.value}>{score}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.label}>SPEED</span>
                <select
                  style={styles.select}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  value={difficulty}
                >
                  <option value={200}>Chill</option>
                  <option value={120}>Normal</option>
                  <option value={70}>Psycho</option>
                </select>
              </div>
            </div>
          </div>
  
          <div style={styles.board}>
            {snake.map((segment, i) => {
              const isHead = i === 0;
  
              return (
                <div
                  key={i}
                  style={{
                    ...styles.snakeSegment,
                    left: `${segment[0] * CELL_SIZE}px`,
                    top: `${segment[1] * CELL_SIZE}px`,
                    backgroundColor: isHead ? 'rgb(114, 221, 137)' : '#92b300',
                    boxShadow: isHead ? '0 0 15px #00FFC2' : 'none',
                    borderRadius: isHead ? '6px' : '4px',
                    zIndex: isHead ? 3 : 2,
                    opacity: ghostOpacity,
  
                    // HEAD only gets position transition
                    // BODY is instant (no transition) — prevents the flying blocks effect
                    // On wrap: opacity fade for ghost effect, no position slide
                    transition: isHead
                      ? isWrapped
                        ? `opacity ${difficulty * 0.35}ms ease`
                        : `left ${difficulty}ms linear, top ${difficulty}ms linear, opacity ${difficulty * 0.35}ms ease`
                      : isWrapped
                        ? `opacity ${difficulty * 0.35}ms ease`
                        : 'none',
                  }}
                />
              );
            })}
  
            {/* Render Food */}
            <img
              src="/src/assets/apple.png"
              alt="food"
              style={{
                position: 'absolute',
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                left: `${food[0] * CELL_SIZE - CELL_SIZE / 25}px`,
                top: `${food[1] * CELL_SIZE - CELL_SIZE / 25}px`,
                objectFit: 'fill',
                animation: 'pulse 1s infinite',
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
          </div>
  
          {isGameOver && (
            <div style={styles.overlay}>
              <h2 style={styles.gameOverText}>CRASHED!</h2>
              <p style={{ color: '#fff', marginBottom: '20px' }}>Final Score: {score}</p>
              <button onClick={resetGame} style={styles.button}>REBOOT</button>
            </div>
          )}
        </div>
      </>
    );
  };
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '"Courier New", Courier, monospace',
      outline: 'none',
    },
    header: {
      marginBottom: '20px',
      textAlign: 'center',
    },
   title: {
  fontFamily: '"VT323", GAME', // retro arcade font
  fontSize: '3.5rem',               // adjust size as needed
  margin: '0',
  color: '#ffffff',                 // neon cyan
  textShadow: '0 0 12px #ff0000',   // glowing pink shadow
  padding: '20px',
},
    stats: {
      display: 'flex',
      gap: '20px',
      marginTop: '10px',
    },
    statBox: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1d1c1c',
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #333',
    },
    label: { fontSize: '0.7rem', color: '#888' },
    value: { fontSize: '1.2rem', fontWeight: 'bold' },
    select: {
      backgroundColor: 'transparent',
      color: '#00FFC2',
      border: 'none',
      fontSize: '1rem',
      cursor: 'pointer',
      outline: 'none',
    },
    board: {
      position: 'relative',
      width: `${GRID_SIZE * CELL_SIZE}px`,
      height: `${GRID_SIZE * CELL_SIZE}px`,
      backgroundColor: '#111',
      border: '2px solid #02010165',
      boxShadow: '0 0 40px rgba(0, 255, 194, 0.1)',
      backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
      backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
    },
    snakeSegment: {
      position: 'absolute',
      width: `${CELL_SIZE - 2}px`,
      height: `${CELL_SIZE - 2}px`,
    },
    overlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(0,0,0,0.9)',
      padding: '40px',
      borderRadius: '15px',
      textAlign: 'center',
      border: '2px solid #FF0055',
      zIndex: 10,
    },
    gameOverText: { fontSize: '2.5rem', color: '#FF0055', margin: '0 0 10px 0' },
    button: {
      padding: '12px 30px',
      fontSize: '1rem',
      backgroundColor: '#01ffc4',
      color: '#000',
      border: 'none',
      borderRadius: '5px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }
  };
  
  export default SnakeGame;
