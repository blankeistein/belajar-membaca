import { useState, useEffect, useCallback } from 'react';

// --- Word list for the game ---
const WORDS = ['BUKU', 'KATA', 'BACA', 'HURUF', 'CERITA', 'SEKOLAH', 'PINTAR'];
const MAX_WRONG_GUESSES = 6;

// --- On-screen keyboard for mobile ---
const KEYBOARD_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// --- The Minigame Component ---
function ReadingMinigame() {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);

  const isWinner = word.split('').every(letter => guessedLetters.includes(letter));
  const isLoser = wrongLetters.length >= MAX_WRONG_GUESSES;

  const handleGuess = useCallback((letter) => {
    const upperLetter = letter.toUpperCase();
    if (isWinner || isLoser || guessedLetters.includes(upperLetter) || wrongLetters.includes(upperLetter)) {
      return;
    }

    if (word.includes(upperLetter)) {
      setGuessedLetters(prev => [...prev, upperLetter]);
    } else {
      setWrongLetters(prev => [...prev, upperLetter]);
    }
  }, [word, guessedLetters, wrongLetters, isWinner, isLoser]);

  const resetGame = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessedLetters([]);
    setWrongLetters([]);
  };

  // Keyboard handler for PC
  useEffect(() => {
    const handler = (e) => {
      if (e.keyCode >= 65 && e.keyCode <= 90) { // A-Z keys
        handleGuess(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGuess]);

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 md:p-8 shadow-xl text-center w-11/12 max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Tebak Kata!</h2>
        
        {/* Word Display */}
        <div className="flex justify-center gap-2 md:gap-4 mb-6">
          {word.split('').map((letter, index) => (
            <span key={index} className="border-b-4 border-gray-400 text-3xl md:text-5xl font-bold w-10 h-12 md:w-16 md:h-20 flex items-center justify-center">
              {guessedLetters.includes(letter) ? letter : ''}
            </span>
          ))}
        </div>

        {/* Game Status */}
        {isWinner && <p className="text-green-500 font-bold text-xl mb-4">Selamat, Anda Menang!</p>}
        {isLoser && <p className="text-red-500 font-bold text-xl mb-4">Anda Kalah! Kata yang benar: {word}</p>}

        {/* Wrong letters and guesses left */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">Tebakan salah: {wrongLetters.join(', ')}</p>
          <p className="text-sm font-medium">Kesempatan tersisa: {MAX_WRONG_GUESSES - wrongLetters.length}</p>
        </div>

        {/* On-screen Keyboard */}
        {!isWinner && !isLoser && (
          <div className="flex flex-wrap justify-center gap-1 md:gap-2 max-w-lg mx-auto">
            {KEYBOARD_LETTERS.map(letter => (
              <button 
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || wrongLetters.includes(letter)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 md:py-3 md:px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={resetGame} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Mulai Lagi
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  return (
    <ReadingMinigame />
  );
}

export default App;