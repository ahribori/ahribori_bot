import Manager from '../core/manager';
const manager = new Manager();
import { Action, Transaction } from '../core'

const TEST_CASE_01 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.navigate('http://daum.net'),
    Action.navigate('https://google.co.kr'),
]);

const TEST_CASE_02 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.screenshot(),
    Action.navigate('http://daum.net'),
    Action.screenshot(),
    Action.navigate('https://google.co.kr'),
    Action.screenshot(),
]);

const TEST_CASE_03 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.setValue('#query', 'ahribori'),
    Action.click('#search_btn'),
    Action.wait(3000)
]);

// manager.addTransaction(TEST_CASE_01);
// manager.addTransaction(TEST_CASE_02);
// manager.addTransaction(TEST_CASE_03);