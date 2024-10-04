import { useState } from 'react'
import FloatingShape from "./components/FloatingShape";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br 
    from-gray-900 via-green-900 to-emrald-900 flex items-center justify-center relative overflow-hidden">
      <FloatingShape color="bg-green-500" size="w-64 h-64" top="-7%" left="11%" delay={0}/>
      <FloatingShape color="bg-emrald-500" size="w-64 h-64" top="-7%" left="11%" delay={5}/>
      <FloatingShape color="bg-lime-500" size="w-64 h-64" top="-7%" left="11%" delay={2}/>
    </div>
  )
}

export default App
