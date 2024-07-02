import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Card } from './ui/card'
import { useSelector } from 'react-redux'




export default function SoloDialog({dialog}) {
    const game = useSelector(state => state.game)
    return (
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
    )
}
