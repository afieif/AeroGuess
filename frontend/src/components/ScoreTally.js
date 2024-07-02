import React from 'react'
import { Card } from './ui/card'
import { useSelector} from 'react-redux'



export default function ScoreTally() {
    const game = useSelector(state => state.game)
    const user = useSelector(state => state.user)
    return (
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
    )
}
