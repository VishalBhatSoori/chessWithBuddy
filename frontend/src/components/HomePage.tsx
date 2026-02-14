import { useNavigate } from 'react-router-dom';
import chessImage from '../assets/myChessGameImage.jpg';
import { Button } from "./Button";

export const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-b from-slate-900 to-black px-4 py-8">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 items-center">
          <div className="flex justify-center">
            <img 
              src={chessImage} 
              className="max-w-96 w-full rounded-lg shadow-lg shadow-emerald-950/50" 
              alt="Chessboard"
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Play chess here with your Buddy!
            </h1>
            <div className="mt-8">
              <Button onClick={() => {
                navigate("/game")
              }} >
                Play Here
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

