import React, { useEffect, useState, useRef } from 'react'
import { Toaster } from "../components/ui/toaster"
import { useToast } from "../components/ui/use-toast"
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from '../contexts/SocketContext';
import { updateGame, updateUsers, updateRound } from '../features/game/gameSlice'
import data from "../countries.json"
import ScoreTally from '../components/ScoreTally'
import GameControlsSolo from '../components/GameControlsSolo';
import { defaultSrc } from '../assets/cdn';
import SoloDialog from '../components/SoloDialog';
const countries = data;

function Map({src}) {
    return (
        <div className='h-[90vh]'>
            <img src={src} className='h-full w-full object-cover' alt="Map" />
        </div>
    )
}

export default function SoloGame() {

    const user = useSelector(state => state.user)
    const dispatch = useDispatch();
    const { toast } = useToast()
    const socket = useSocket();
    const [src, setSrc] = useState(defaultSrc)
    const [answer, setAnswer] = useState("")
    const dialogRef = useRef();

    useEffect(() => {
        if (!socket) return;

        socket.on('roomCreated', (game) => {
            console.log(game)
            dispatch(updateGame(game))
        });

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
            dialogRef.current.click()
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

    return (
        <div>
            <ScoreTally />
            <Map src={src}/>
            <GameControlsSolo
                src={src}
                setSrc={setSrc}
                answer={answer}
                setAnswer={setAnswer} />
            <SoloDialog dialog={dialogRef} />
            <Toaster />
        </div>
    )
}


