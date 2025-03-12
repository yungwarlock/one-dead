import React from "react";


const Button = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }): JSX.Element => {
  return (
    <div onClick={onClick} className="bg-gray-300 select-none active:bg-gray-400 ease-in transition rounded-md flex justify-center items-center text-3xl font-extrabold">
      {children}
    </div>
  );
};


export default Button;