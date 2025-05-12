import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [feedback, setFeedback] = useState("");
  const stockfishRef = useRef(null);

  // Initialize Stockfish Web Worker
  useEffect(() => {
    // Load Stockfish
    stockfishRef.current = new Worker("stockfish.js");

    // Listen for messages from Stockfish
    stockfishRef.current.onmessage = (event) => {
      // Debug log to check if Stockfish responds
      console.log("Stockfish response:", event.data);

      // Check if the message contains the best move
      if (event.data.includes("bestmove")) {
        const bestMove = event.data.split("bestmove ")[1].split(" ")[0];
        setFeedback(`Suggested move: ${bestMove}`);
        console.log("bestMove: ", bestMove);
      }
    };

    // Clean up the worker when the component unmounts
    return () => {
      stockfishRef.current.terminate();
    };
  }, []);

  // Handle move input
  const onMove = (from, to) => {
    const move = game.move({ from, to });
    if (!move) return false; // Illegal move

    setGame(new Chess(game.fen())); // Update game state
    analyzePosition(game.fen());
    return true;
  };

  // Analyze the current board position using Stockfish
  const analyzePosition = (fen) => {
    if (stockfishRef.current) {
      console.log("Sending position to Stockfish:", fen); // Debug log to check the FEN being sent
      stockfishRef.current.postMessage(`position fen ${fen}`);
      stockfishRef.current.postMessage("go depth 15");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <h1>Chess Assistant</h1>
      <div style={{ maxWidth: "400px", margin: "auto" }}>
        {/* <div style={boardStyle}> */}
        <Chessboard
          position={game.fen()}
          onPieceDrop={onMove}
          width={120}
          boardStyle={boardStyle}
        />
      </div>
      <p style={{ marginTop: "10px", fontSize: "18px", color: "blue" }}>
        {feedback}
      </p>
    </div>
  );
};

export default App;

const boardsContainer = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};

const boardStyle = {
  borderRadius: "5px",
  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
};
