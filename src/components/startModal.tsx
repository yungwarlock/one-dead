import React from "react";

import {Dialog, Transition} from "@headlessui/react";


interface ModalProps {
  show: boolean;
  onClickClose: () => void;
}

const StartModal = ({show, onClickClose}: ModalProps): JSX.Element => {

  const ref = React.useRef(null);

  return (
    <Transition.Root show={show} as={React.Fragment}>
      <Dialog as="div" ref={ref} initialFocus={ref} className="relative z-10" onClose={onClickClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel style={{width: "23rem"}} className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        About Game
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="text-sm text-gray-600">
                          <p>
                            One dead is a strategic guessing game. It&lsquo;s about guessing a four correctly a four
                            digit number made by computer with least amount of tries.
                          </p>

                          <br />

                          <p>
                            The game started when computer generates and stores a 4 digit random code. This number
                            will have no repeating digits. Then the player will try to guess that as trials.
                            For each try a player makes, they a given two clues: Dead count and Injured count.
                            The player wins when they get a "four dead" count.
                          </p>

                          <br />

                          <p>
                            The goal of the player is to minimize the amount of trials to make to achieve
                            "four dead".
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => onClickClose()}
                  >
                    Start
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};


export default StartModal;
