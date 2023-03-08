import React from "react";
import CodeInputField from "../components/CodeInputField";


const Started = (): JSX.Element => {
  const [currentCode, setCurrentCode] = React.useState<string>("");

  React.useEffect(() => {
    console.log(currentCode);
  }, [currentCode]);


  return (
    <div>
      <div id="result">1 dead 1 Injured</div>

      <div>
        <CodeInputField onChange={(val) => setCurrentCode(val)} />
      </div>

      <div>

      </div>
    </div>
  );
}


export default Started;
