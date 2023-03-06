import {database} from './firebase';
import Session from './session';
import './style.css';

const id = "dkdkdk";
const remoteSession = new Session(id, database);
await remoteSession.setupConnection();

