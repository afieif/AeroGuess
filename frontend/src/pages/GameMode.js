import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { update } from '../features/user/userSlice'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useNavigate } from "react-router-dom";
import { Label } from '@radix-ui/react-label'
import { setHost, updateGame } from '../features/game/gameSlice'
import { useSocket } from '../contexts/SocketContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { updateUsers } from '../features/game/gameSlice'
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

export default function GameMode() {
    const navigate = useNavigate();
    const { name, id } = useSelector(state => state.user)
    const game = useSelector(state => state.game)
    const dispatch = useDispatch()
    const socket = useSocket();
    const [isFull, setFull] = useState("");

    const createRoom = () => {
        setFull(false)
        socket.emit('createRoom', { name, id, gameMode: "multi" });
    };

    const createSolo = () => {
        setFull(false)
        socket.emit('createRoom', { name, id, gameMode: "solo" });
    };

    const joinRoom = () => {
        setFull(false)
        console.log('join')
        socket.emit('joinRoom', { user: { name, id }, room: game.host });
    }

    useEffect(() => {
        if (sessionStorage.getItem('user')) {
            dispatch(update(sessionStorage.getItem('user')));
        }
        socket?.on('roomCreated', (game) => {
            console.log(game)
            dispatch(updateGame(game))
            if (game.gameMode == 'solo') {
                navigate('/solo')
            }
            else
            {
                navigate('/game')
            }
        });
        socket?.on('roomFull', () => {
            setFull(true)
        })
        socket?.on('userJoined', ({ users }) => {
            console.log(users)
            dispatch(updateUsers(users))
            navigate('/game')
        })
        return () => {
            socket?.off('roomFull');
            socket?.off('roomCreated');
            socket?.off('userJoined');
        }
        // eslint-disable-next-line
    }, [socket])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-6">
            <Tabs defaultValue="solo" className="w-full max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
                <TabsList className="grid grid-cols-2 bg-gray-800 text-white">
                    <TabsTrigger value="solo" className="py-2 text-center">Single Player</TabsTrigger>
                    <TabsTrigger value="multiplayer" className="py-2 text-center">Multiplayer</TabsTrigger>
                </TabsList>
                <TabsContent value="solo" className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Play Solo</CardTitle>
                            <CardDescription className="mt-2 text-lg">Test your geography skills with a quick game!</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg" onClick={createSolo}>Start Game</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="multiplayer" className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Play with a Friend</CardTitle>
                            <CardDescription className="mt-2 text-lg">Create a new game or join an existing one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">Name</Label>
                                <Input id="name" type="text" value={name} onChange={(e) => dispatch(update(e.target.value))} className="w-full border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-gray-700">Game Code</Label>
                                <Input id="code" type="text" value={game.host} onChange={(e) => dispatch(setHost(e.target.value))} className="w-full border-gray-300 rounded-lg" />
                            </div>
                        </CardContent>
                        <CardFooter className="space-x-2">
                            <Button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg" onClick={createRoom}>Create</Button>
                            <Button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg" onClick={joinRoom}>Join</Button>
                        </CardFooter>
                    </Card>
                    {
                        isFull &&
                        <Alert className="mt-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            <AlertTitle><strong>Uh oh!</strong></AlertTitle>
                            <AlertDescription>
                                Looks like the room is already full 😔, we currently only support two players at a time.
                            </AlertDescription>
                        </Alert>
                    }
                </TabsContent>
            </Tabs>
        </div>
    )
}
