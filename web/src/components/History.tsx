import React from "react";

import { formatResult } from "../utils";
import Manager from "@one-dead/game/manager";

interface HistoryProps {
  manager: Manager | null;
}

const History = ({ manager }: HistoryProps): JSX.Element => {
  return (
    <div id="history" className="flex flex-col grow gap-4 p-8">
      <table className="table-auto">

        <thead>
          <tr>
            <th>Time</th>
            <th>Code</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {manager?.getGameHistory().trials.map((item, index) => (
            <tr key={index} className="text-center">
              <td>{item.timestamp}</td>
              <td>{item.testCode}</td>
              <td>{formatResult(item.result)}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};


export default History;