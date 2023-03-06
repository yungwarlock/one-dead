import { BrowserRouter, Routes, Route } from "react-router-dom"

import CreateGame from "./pages/CreateGame"

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<CreateGame />} />
    </Routes>
    </BrowserRouter>
  )
}

export default App