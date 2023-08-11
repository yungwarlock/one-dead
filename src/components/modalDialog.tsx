import React, {Fragment} from "react";
import {Dialog, Transition} from "@headlessui/react";

declare global {
  interface Window {
    PayPal: any;
  }
}


interface ModalDialogProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;

  onClickReset?: () => void;
  onClickPause?: () => void;
  onClickDonate?: () => void;
  onClickInstructions?: () => void;
}

const ModalDialog = ({show, setShow, onClickPause, onClickReset, onClickDonate, onClickInstructions}: ModalDialogProps): JSX.Element => {
  const donateButtonRef = React.useRef(null);

  function closeModal() {
    setShow(false);
  }

  interface ButtonProps {
    label: string;
    icon: JSX.Element;
    onClick?: () => void;
  }

  const Button = ({icon, label, onClick}: ButtonProps): JSX.Element => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col gap-1 justify-center items-center rounded-md px-3 py-1 h-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
      >
        {icon}

        {label}
      </button>
    );
  };

  React.useEffect(() => {
    window.PayPal.Donation.Button({
      env: "production",
      hosted_button_id: "8KSUPPUATWZ46",
      image: {
        src: "https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif",
        alt: "Donate with PayPal button",
        title: "PayPal - The safer, easier way to pay online!",
      }
    }).render("#donate-button");
  }, []);

  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

                  <div className="flex flex-col gap-3 justify-center items-center">

                    <div className="mt-2 w-full grid gap-4 grid-cols-2">

                      <Button label="Instructions" onClick={onClickInstructions} icon={(
                        <div style={{width: "65px", height: "65px"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{width: "100%", height: "100%"}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                          </svg>
                        </div>
                      )} />

                      <Button label="Reset" onClick={onClickReset} icon={(
                        <div style={{width: "65px", height: "65px"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{width: "100%", height: "100%"}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                        </div>
                      )} />

                      <Button label="Pause" onClick={onClickPause} icon={(
                        <div style={{width: "65px", height: "65px"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" style={{width: "100%", height: "100%"}}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )} />


                    </div>
                    <div id="donate-button-container">
                      <div id="donate-button"></div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};


export default ModalDialog;
