import React from "react";
import CodeInputField from "../components/CodeInputField";


const Started = (): JSX.Element => {
  const [currentCode, setCurrentCode] = React.useState<string>("");

  React.useEffect(() => {
    console.log(currentCode);
  }, [currentCode]);


  return (
    <div id="main-game" className="component">

      <div id="result" className="heading-text">
        1 dead 1 Injured
      </div>

      <div>
        <CodeInputField onChange={(val) => setCurrentCode(val)} />
      </div>

      <button className="large">Play Trial</button>

      <div className="heading-text">
        Your turn
      </div>
    </div>
  );
}


export default Started;
