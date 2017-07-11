import Transaction from './transaction';
import Action from './action';

async function test(count) {
    let i = 0;
    while(i < count) {
        await new Transaction([
            new Action('navigate', 'http://naver.com'),
            new Action('getPerformance')
        ]).run('chrome').then(() => { console.log(`TEST${i+1} DONE.`); });
        i++;
    }
}

test(1);
