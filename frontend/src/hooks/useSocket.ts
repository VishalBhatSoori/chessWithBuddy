import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL;

export const useSocket = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!WS_URL) {
            console.error("VITE_WS_URL is not set in .env.local");
            return;
        }
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            setSocket(ws);
        }

        ws.onclose = () => {
            setSocket(null);
        }

        return () => {
            ws.close();
        }
    }, [])

    return socket;
}