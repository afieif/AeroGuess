import React, {useState, useEffect} from 'react'
import { ChooseAnswer } from './ChooseAnswer'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { updateGame, updateUsers, updateRound } from '../features/game/gameSlice'
import { useSocket } from '../contexts/SocketContext'
import { defaultSrc } from '../assets/cdn';
import { loadingSrc } from '../assets/cdn';




export default function GameControlsSolo({ src, setSrc, answer, setAnswer }) {
    const game = useSelector(state => state.game)
    const user = useSelector(state => state.user)
    const dispatch = useDispatch();
    const socket = useSocket();
    const [isGuessed, setGuessed] = useState(false)


    const startGame = () => {
        setSrc(loadingSrc);
        dispatch(updateUsers(game.users.map((u) => { return { ...u, score: 0 } })))
        socket.emit('startRound', game.host);
    }

    const submitAnswer = () => {
        setGuessed(true)
        socket.emit('checkAnswer', { room: game.host, user, answer })
        setAnswer("")
    }

    useEffect(() => {
        if (!socket) return;

        socket.on('roundStarted', (data) => {
            console.log('image received')
            setGuessed(false)
            setSrc(`data:image/jpeg;base64,${data.image}`)
            dispatch(updateRound(data.round + 1))
        })

        socket.on('roundEnded', (round) => {
            setGuessed(false)
            setSrc(loadingSrc);
        })

        return () => {
            socket.off('roundStarted');
            socket.off('roundEnded');
        }
    }, [socket])

    return (
        <div className='flex justify-center'>
            {
                game.users.length == 1 && game.round == 0 && src == defaultSrc &&
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Button onClick={startGame} className="px-8 py-6 bg-blue-600 text-white rounded-lg shadow-lg">
                        Start New Game
                    </Button>
                </div>

            }
            {
                game.users.length == 1 && game.round >= 5 && src == defaultSrc &&
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Button onClick={startGame} className="px-8 py-6 bg-blue-600 text-white rounded-lg shadow-lg" disabled={game.host != user.id}>
                        {game.host == user.id ? "Start New Game" : "Waiting for host to start game"}
                    </Button>
                </div>
            }
            {
                !isGuessed && game.round != 0 && game.round <= 5 &&
                <div className='fixed bottom-0 left-0 w-full z-50 flex items-center justify-center p-4 space-x-4 bg-black'>
                    <ChooseAnswer setValue={setAnswer} value={answer} />
                    <Button disabled={!answer} onClick={submitAnswer}>Submit Guess</Button>
                </div>

            }
        </div>
    )
}
