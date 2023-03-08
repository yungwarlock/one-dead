import React from "react";


interface CodeInputFieldProps {
  onChange: (value: string) => void;
}

const CodeInputField = ({onChange}: CodeInputFieldProps): JSX.Element => {
  const digits = 4;


  const states = Array.from({length: digits}).map((item, index) => {
    return React.useState<string>("")
  });

  const values = states.map(item => item[0]);
  const setValues = states.map(item => item[1]);

  React.useEffect(() => {
    onChange(values.join(""));
  }, values);

  const inputRefs = Array.from({length: digits}).map((item, index) => {
    return React.createRef<HTMLInputElement>();
  });

  React.useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const [state, setState] = states[index];
    const isBackspace = state.length > e.target.value.length;

    if (e.target.value !== "") {
      e.target.value = e.target.value.at(-1) as string;
    }

    setState(e.target.value);

    if (!isBackspace && !(digits === (index + 1))) {
      inputRefs[index + 1].current?.focus();
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const [state, setState] = states[index];
      const isAlreadyEmpty = state.length == 0;
      if (isAlreadyEmpty && !((index - 1) < 0)) {
        inputRefs[index - 1].current?.focus();
      }
    }
  }

  return (
    <div id="code-input">
      {Array.from({length: digits}).map((item, index) => (
        <input key={index} onKeyDown={(e) => onKeyDown(e, index)} value={states[index][0]} data-pos={index} ref={inputRefs[index]} type="number" onChange={(e) => onInput(e, index)} min={1} max={9} />
      ))}
    </div>
  );
}


export default CodeInputField;
