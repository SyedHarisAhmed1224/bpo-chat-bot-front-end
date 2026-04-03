import { useState } from 'react'
import './App.css'
import ChatBot from './components/ChatBot/ChatBot'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatBot />
    </>
  )
}

export default App
