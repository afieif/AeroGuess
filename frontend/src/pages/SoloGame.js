import React, { useEffect, useState, useRef } from 'react'
import { Toaster } from "../components/ui/toaster"
import { useToast } from "../components/ui/use-toast"
import { Button } from '../components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../contexts/SocketContext';
import { updateGame, updateUsers, updateRound } from '../features/game/gameSlice'
import { Card } from '../components/ui/card'
import { ChooseAnswer } from '../components/ChooseAnswer'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import data from "../countries.json"

const countries = data;


export default function SoloGame() {
    const defaultSrc = "https://ucarecdn.com/bf2fcba2-4684-480b-b406-a29efcae348a/SAMPLE_API_IMAGE.jpg"
    const loadingSrc = "https://ucarecdn.com/f1de16cc-688f-4bf8-b38e-ea5bef7bada3/LOADING_IMAGE.png"
    const game = useSelector(state => state.game)
    const user = useSelector(state => state.user)
    const dispatch = useDispatch();
    const { toast } = useToast()
    const socket = useSocket();
    const [src, setSrc] = useState(defaultSrc)
    const [answer, setAnswer] = useState("")
    const [isGuessed, setGuessed] = useState(false)
    const dialog = useRef();

    useEffect(() => {
        if (!socket) return;

        socket.on('roomCreated', (game) => {
            console.log(game)
            dispatch(updateGame(game))
        });

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

        socket.on('correctAnswer', (user) => {
            console.log(user)
            toast({
                title: `You Guessed correct`, duration: 2000
            })
        })

        socket.on('wrongAnswer', (data) => {
            console.log(user)
            toast({
                variant: "destructive",
                title: `You guessed wrong${data.user.id === user.id ? `, the answer is ${countries.find(c => c.value.toLowerCase() === data.answer).label}` : ''}`, duration: 3000
            })
        })

        socket.on('updateScores', ({ users }) => {
            console.log(users);
            dispatch(updateUsers(users))
        })

        socket.on('gameEnded', () => {
            dialog.current.click()
            setSrc(defaultSrc)
        })

        return () => {
            socket.off('roomCreated');
            socket.off('roundStarted');
            socket.off('roundEnded');
            socket.off('correctAnswer');
            socket.off('wrongAnswer');
            socket.off('updateScores');
            socket.off('gameEnded');
        }
    }, [socket])


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


    return (
        <div>
            <div className='flex items-center justify-center'>
                {game.users.filter((u) => u.id == user.id).map((u) =>
                    <Card className="w-fit p-1 m-1 flex bg-zinc-800 border-black text-zinc-50">
                        <div className='m-2 overflow-hidden'>
                            <div>Score : {u.score}</div>
                        </div>
                    </Card>
                )}
                {game.users.filter((u) => u.id == user.id).map((u) =>
                    <Card className="w-fit p-1 m-1 flex bg-zinc-800 border-black text-zinc-50">
                        <div className='m-2 overflow-hidden'>
                            <div>Round : {game.round}</div>
                        </div>
                    </Card>
                )}

            </div>
            <div className='h-[90vh]'>
                <img src={src} className='h-full w-full object-cover' alt="Map" />
            </div>

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
            <Dialog>
                <DialogTrigger ref={dialog}>Open</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="mb-2">Game Ended</DialogTitle>
                        <DialogDescription className="flex justify-center">
                            {game.users.map((u) =>
                                <Card className="w-fit p-1 px-2 m-1 flex justify-between bg-zinc-800 border-black text-zinc-50">
                                    <div className='m-2 overflow-hidden'>
                                        <div>Your Score : {u.score} / 5</div>
                                    </div>
                                </Card>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    )
}


