import Transaction from './transaction';
import Action from './action';

async function test(count) {
    let i = 0;
    while(i < count) {
        await new Transaction([
            new Action('navigate', 'http://192.168.233.66/ko/cygnus/dashboards'),
            new Action('getPerformance'),
            new Action('setValue', '#userId', 'admin'),
            new Action('setValue', '#password', 'admin'),
            new Action('submit', 'button'),
            new Action('getPerformance'),
            // new Action('wait', 3000),
        ]).run('chrome').then(() => { console.log(`TEST${i+1} DONE.`); });
        i++;
    }
}

test(100);
