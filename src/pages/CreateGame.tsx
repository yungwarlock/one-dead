import '../style.css'

import {Link} from 'react-router-dom'

const CreateGame = () => {
  return (
    <div>
      <h1>Enjoy the thrill of one dead(&#128128;) one injured(🤕)</h1>
      <div className="main">
        <button><Link to="#">Create Game</Link></button>
        <button><Link to="#">Join Game</Link></button>
      </div>
  </div>
  )
}

export default CreateGame