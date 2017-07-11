export default class Action {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        for (let index in arguments) {
            if (arguments.hasOwnProperty(index)){
                if (index > 1) {
                    this[`value${index}`] = arguments[index];
                }
            }
        }
        console.log(this);
    }
}