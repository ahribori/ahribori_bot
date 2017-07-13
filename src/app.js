import './conf';
import logger from 'winston';
import Transaction from './core/transaction';
import Action from './core/action';

async function test(count) {
    let i = 0;
    while(i < count) {

        const actions = [
            Action.createAction('navigate', 'https://ahribori.com'),
            Action.createAction('wait', 3000),
        ];

        await new Transaction(actions)
        .run('chrome')
            .then(() => {
                logger.info({ actions });
            });
        i++;
    }
}

test(1);

