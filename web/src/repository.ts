import Dexie, {Table} from "dexie";

import {IHistory} from "@one-dead/game/types";


class SessionRepository extends Dexie {
  sessions: Table<IHistory, number>;

  constructor() {
    super("sessions");
    this.version(1).stores({
      sessions: "name, mainCode, startTime",
    });
    this.sessions = this.table("sessions");
  }
}

export const sessionRepository = new SessionRepository();
