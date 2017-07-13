import Manager from '../core/manager';
const manager = new Manager();
import { Action, Transaction } from '../core'

manager.addTransaction(
    new Transaction([
        Action.createAction('navigate', 'http://naver.com'),
        Action.createAction('navigate', 'http://daum.net'),
        Action.createAction('navigate', 'https://www.google.co.kr/'),
        Action.createAction('wait', 1000)
    ])
);
manager.addTransaction(
    new Transaction([
        Action.createAction('navigate', 'https://www.google.co.kr/'),
        Action.createAction('navigate', 'http://naver.com'),
        Action.createAction('navigate', 'http://daum.net'),
        Action.createAction('wait', 3000)
    ])
);
manager.addTransaction(
    new Transaction([
        Action.createAction('wait', 5000),
        Action.createAction('navigate', 'http://daum.net'),
        Action.createAction('navigate', 'http://naver.com'),
        Action.createAction('navigate', 'https://www.google.co.kr/'),
    ])
);