import './conf';
import Transaction from './core/transaction';
import Action from './core/action';

async function test(count) {
    let i = 0;
    while(i < count) {
        await new Transaction([
            Action.createAction('navigate', 'https://ahribori.com'),
        ])
        .run('chrome')
        .then(() => { console.log(`TEST${i+1} DONE.`);});
        i++;
    }
}

// test(1);

