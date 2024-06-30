import React, { useEffect, useState, useRef } from 'react'
import { Toaster } from "../components/ui/toaster"
import { useToast } from "../components/ui/use-toast"
import { Button } from '../components/ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../contexts/SocketContext';
import { updateUsers, updateRound } from '../features/game/gameSlice'
import { Card } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
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


export default function Game() {
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


    // const src = "https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/47.602297,-122.405844/14?mapSize=2000,1000&pp=47.602297,-122.405844;128&key=AgX7jvw-KWCwx-yRTg7Hz6pRWbBxm_GwOOIe7Gedvc5svzZmV8u6sZ_GjJgKbpes"
    // const src2 = "https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/47.602297,-122.405844/14?mapSize=2000,1000&pp=47.602297,-122.405844;128&key=AgX7jvw-KWCwx-yRTg7Hz6pRWbBxm_GwOOIe7Gedvc5svzZmV8u6sZ_GjJgKbpes"

    useEffect(() => {
        if (!socket) return;

        socket?.on('userJoined', ({ users }) => {
            console.log(users)
            dispatch(updateUsers(users))
        })

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
                title: `${user.name} Guessed correct`, duration: 2000
            })
        })

        socket.on('wrongAnswer', (data) => {
            console.log(user)
            toast({
                variant: "destructive",
                title: `${data.user.name} guessed wrong${data.user.id === user.id ? `, the answer is ${countries.find(c => c.value.toLowerCase() === data.answer).label}` : ''}`, duration: 3000
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
            socket.off('userJoined');
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
        <div className='space-y-2'>
            <div className='flex items-center justify-between'>
                {game.users.filter((u) => u.id == user.id).map((u) =>
                    <Card className="w-fit py-1 px-2 m-1 space-x-5 flex justify-between bg-zinc-800 border-black text-zinc-50">
                        <div className='flex flex-col items-center justify-center'>
                            <Avatar>
                                <AvatarImage src={`https://api.multiavatar.com/${u.id}.png?apikey=env.AVATAR_API_KEY`} />
                                <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>{u.name}</div>
                        </div>
                        <div className='m-auto overflow-hidden text-xl'>
                            <div>{u.score}</div>
                        </div>
                    </Card>
                )}

                {
                    game.round != 0 && <div className='text-white'>Round {game.round}</div>
                }

                {game.users.filter((u) => u.id != user.id).map((u) =>
                    <Card className="w-fit py-1 px-2 space-x-5 m-1 flex justify-between bg-zinc-800 border-black text-zinc-50">
                        <div className='flex flex-col items-center justify-center'>
                            <Avatar>
                                <AvatarImage src={`https://api.multiavatar.com/${u.id}.png?apikey=Yz6WhrRJisckL7`} />
                                <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>{u.name}</div>
                        </div>
                        <div className='m-auto overflow-hidden text-xl'>
                            <div>{u.score}</div>
                        </div>
                    </Card>
                )}
            </div>
            <div className='h-[80vh]'>
                <img src={src} className='h-full w-full object-cover' alt="Map" />
            </div>

            <div className='flex justify-center'>

                {
                    game.users.length < 2 &&
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <Button
                            className="px-8 py-6 bg-blue-600 text-white rounded-lg shadow-lg"
                            onClick={() => {
                                navigator.clipboard.writeText(game.host)
                                toast({
                                    title: "Invite code copied to clipboard", duration: 1000
                                })
                            }}
                        >
                            Invite a Friend
                        </Button>
                    </div>
                }

                {
                    game.users.length == 2 && game.round == 0 && src == defaultSrc &&
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <Button onClick={startGame} className="px-8 py-6 bg-blue-600 text-white rounded-lg shadow-lg" disabled={game.host != user.id}>
                            {game.host == user.id ? "Start New Game" : "Waiting for host to start game"}
                        </Button>
                    </div>

                }
                {
                    game.users.length == 2 && game.round >= 5 && src == defaultSrc &&
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
            <Toaster />
            <Dialog>
                <DialogTrigger ref={dialog}>Open</DialogTrigger>
                <DialogContent className="max-w-[90%] min-w-[200px] w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="mb-2 text-center">Game Ended</DialogTitle>
                        <DialogDescription className="flex flex-col justify-center items-center">
                            {game.users.map((u) =>
                                <Card className="w-[200px] p-1 px-2 m-1 flex justify-between bg-zinc-800 border-black text-zinc-50">
                                    <div className='flex flex-col items-center justify-center'>
                                        <Avatar>
                                            <AvatarImage src={`https://api.multiavatar.com/${u.id}.png?apikey=Yz6WhrRJisckL7`} />
                                            <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className='m-2 overflow-hidden'>
                                        <div>{u.name}</div>
                                        <div>Score : {u.score}</div>
                                    </div>
                                </Card>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}


