import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 40; // Larger cells for better visibility
const INITIAL_SNAKE = [[10, 10], [10, 11], [10, 12]];
const INITIAL_DIRECTION = 'UP';

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState([5, 5]);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(150);
  
  // Use a ref for direction to prevent "double-turn" logic bugs
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

        head[0] = (head[0] + GRID_SIZE) % GRID_SIZE; // left/right wrap
head[1] = (head[1] + GRID_SIZE) % GRID_SIZE; // up/down wrap

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
  };

  return (
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
        {/* Render Snake */}
        {snake.map((segment, i) => (
          <div key={i} style={{
            ...styles.snakeSegment,
            left: `${segment[0] * CELL_SIZE}px`,
            top: `${segment[1] * CELL_SIZE}px`,
            backgroundColor: i === 0 ? 'rgb(114, 221, 137)' : '#92b300',
            boxShadow: i === 0 ? '0 0 15px #00FFC2' : 'none',
            zIndex: i === 0 ? 3 : 2,
            transition: `all ${difficulty}ms linear`, 
            borderRadius: i === 0 ? '6px' : '4px',
          }} />
        ))}
        
                        {/* Render Food */}
        <img
          src="/src/assets/apple.png"
          alt="food"
          style={{
            position: 'absolute',
            width: `${CELL_SIZE * 1}px`,   // 2x ang laki ng isang cell (60px) para malaki ang food
            height: `${CELL_SIZE * 1}px`,  // pareho sa width para square ang imahe
            left: `${food[0] * CELL_SIZE - CELL_SIZE / 25}px`, // offset ng -CELL_SIZE/2 para naka-center sa grid position
            top: `${food[1] * CELL_SIZE - CELL_SIZE / 25}px`,  // pareho sa left, para vertical center din
            objectFit: 'fill',      // pinupuno ng imahe ang buong width/height nang walang letterbox
            animation: 'pulse 1s infinite', // nagpu-pulse para kapansin-pansin ang food
            zIndex: 1,              // nasa ibabaw ng board background pero sa ilalim ng snake head
            pointerEvents: 'none',  // hindi nag-iinterfere ang imahe sa keyboard/mouse events ng game
          }}
        />
      </div>


      {isGameOver && (
        <div style={styles.overlay}>
          <h2 style={styles.gameOverText}>CRASHED!</h2>
          <p style={{color: '#fff', marginBottom: '20px'}}>Final Score: {score}</p>
          <button onClick={resetGame} style={styles.button}>REBOOT</button>
        </div>
      )}
    </div>
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
    fontSize: '3rem',
    margin: '0',
    color: 'red',
    textShadow: '0 0 10px yellow',
    letterSpacing: '5px',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1a1a1a',
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
    border: '2px solid #333',
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
    backgroundColor: '#00FFC2',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  }
};

export default SnakeGame;