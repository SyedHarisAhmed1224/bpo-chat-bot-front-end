import React, { useState, useRef, useEffect } from "react"

type Message = {
    role: "user" | "bot"
    text: string
}

const ChatBot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    // Auto scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const sendMessage = async (): Promise<void> => {
        if (!input.trim()) return

        const userMessage: Message = { role: "user", text: input }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage.text }),
            })

            const data: { reply: string } = await res.json()

            const botMessage: Message = {
                role: "bot",
                text: data.reply,
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error(error)

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    text: "⚠️ Something went wrong. Please try again.",
                },
            ])
        }

        setLoading(false)
    }

    // Send on Enter key
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            sendMessage()
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Chat Support</h2>

            <div style={styles.chatBox}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            ...styles.message,
                            ...(msg.role === "user"
                                ? styles.userMessage
                                : styles.botMessage),
                        }}
                    >
                        {msg.text}
                    </div>
                ))}

                {loading && (
                    <div style={{ ...styles.message, ...styles.botMessage }}>
                        Typing...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInput(e.target.value)
                    }
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    style={styles.input}
                />

                <button onClick={sendMessage} style={styles.button}>
                    Send
                </button>
            </div>
        </div>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: "400px",
        margin: "50px auto",
        border: "1px solid #ddd",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
    },
    header: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
        textAlign: "center",
    },
    chatBox: {
        height: "400px",
        overflowY: "auto",
        padding: "10px",
        backgroundColor: "#f9f9f9",
    },
    message: {
        padding: "10px",
        margin: "5px 0",
        borderRadius: "10px",
        maxWidth: "70%",
    },
    userMessage: {
        backgroundColor: "#007bff",
        color: "white",
        marginLeft: "auto",
    },
    botMessage: {
        backgroundColor: "#e5e5ea",
        color: "black",
        marginRight: "auto",
    },
    inputContainer: {
        display: "flex",
        borderTop: "1px solid #ddd",
    },
    input: {
        flex: 1,
        padding: "10px",
        border: "none",
        outline: "none",
    },
    button: {
        padding: "10px 15px",
        border: "none",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer",
    },
}

export default ChatBot