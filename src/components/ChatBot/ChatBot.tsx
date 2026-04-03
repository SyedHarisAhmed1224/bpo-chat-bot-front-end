import React, { useState, useRef, useEffect } from "react"
import "./ChatBot.css"

type Message = {
    role: "user" | "bot"
    text: string
}

const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const sessionIdRef = useRef<string>(localStorage.getItem("session_id") || crypto.randomUUID())

    useEffect(() => {
        localStorage.setItem("session_id", sessionIdRef.current)
    }, [])

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, loading])

    const sendMessage = async (): Promise<void> => {
        if (!input.trim() || loading) return

        const userMessage: Message = { role: "user", text: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ session_id: sessionIdRef.current, message: userMessage.text }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(`HTTP ${res.status}: ${errorText}`)
            }

            const data: { reply: string } = await res.json()

            const botMessage: Message = {
                role: "bot",
                text: data.reply,
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error("Error -> " + error)

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: "⚠️ Something went wrong. Please try again.",
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage()
        }
    }

    return (
        <div className="chatbot">
            <div className="chatbot__card">
                <div className="chatbot__header">
                    <div>
                        <h2 className="chatbot__title">Chat Support</h2>
                        <p className="chatbot__subtitle">We usually reply instantly</p>
                    </div>
                    <div className="chatbot__status">
                        <span className="chatbot__status-dot"></span>
                        Online
                    </div>
                </div>

                <div className="chatbot__messages">
                    {messages.length === 0 && (
                        <div className="chatbot__empty">
                            Start the conversation by typing a message below.
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`chatbot__message-row ${msg.role === "user"
                                ? "chatbot__message-row--user"
                                : "chatbot__message-row--bot"
                                }`}
                        >
                            <div
                                className={`chatbot__message ${msg.role === "user"
                                    ? "chatbot__message--user"
                                    : "chatbot__message--bot"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="chatbot__message-row chatbot__message-row--bot">
                            <div className="chatbot__message chatbot__message--bot chatbot__typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="chatbot__input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInput(e.target.value)
                        }
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="chatbot__input"
                    />

                    <button
                        onClick={sendMessage}
                        className="chatbot__button"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatBot