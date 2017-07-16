import _ from 'lodash';

/**
 * n개의 액션을 순차적으로 수행하는 클래스
 * @class Transaction
 */
export default class Transaction {

    /**
     * Action.createAction()을 통해 생성된 액션의 배열을 인자로 받는다.
     * @param _actions
     */
    constructor(_actions) {
        this.actions = [];

        if (_.isArray(_actions)) {
            this.actions = _actions;
        }

    }

}