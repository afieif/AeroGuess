import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from '../components/ui/button';
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../components/ui/dialog";

export default function Landing() {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDialogOpen = () => setIsDialogOpen(true);
    const handleDialogClose = () => setIsDialogOpen(false);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r to-green-400 from-blue-500 p-6">
            <Card className="w-full max-w-md bg-black text-white shadow-lg rounded-lg overflow-hidden">
                <CardHeader className="text-center py-6 border-b border-gray-700">
                    <CardTitle className="text-3xl font-bold">Welcome to Maptitude 🗺️</CardTitle>
                    <span className='text-xs font-thin'>Powered by <a href='https://www.openstreetmap.org/copyright' className='underline'>OpenStreetMap</a></span>
                    <CardDescription className="mt-2 text-lg">Ready to test your geography skills?</CardDescription>
                </CardHeader>
                <CardFooter className="px-6 py-4 border-t border-gray-700">
                    <Button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg" onClick={() => navigate('/start')}>
                        Proceed
                    </Button>
                </CardFooter>
            </Card>
            <div onClick={handleDialogOpen} className='underline text-center mt-2'>
                        Game Rules
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <div />
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Game Rules</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                <p className="mt-2 text-gray-700">
                                    1. You will be shown an aerial view of a location.
                                </p>
                                <p className="mt-2 text-gray-700">
                                    2. Your task is to guess the country where the marker is located based on the landmarks and terrain visible in the map.
                                </p>
                                <p className="mt-2 text-gray-700">
                                    3. You get awarded a point for every right guess.
                                </p>
                            </DialogDescription>
                        </DialogContent>
                    </Dialog>
        </div>
    );
}
