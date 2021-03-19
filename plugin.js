export default class RestartButtonMod {
    constructor() {
        this.listeners = [];

        window.restartButton = {
            restart: this.restart.bind(this),
            addListener: this.addListener.bind(this)
        };
    }

    prestart() {
        sc.OPTIONS_DEFINITION['keys-restart'] = {
            type: 'CONTROLS',
            init: { key1: ig.KEY.L },
            cat: sc.OPTION_CATEGORY.CONTROLS,
            hasDivider: true,
            header: 'restart'
        };
    }

    poststart() {
        ig.game.addons.preUpdate.push(this);
    }

    onPreUpdate() {
        if(ig.input.pressed('restart')) {
            this.restart();
        }
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    restart(skipListeners = false) {
        if(!skipListeners) {
            for(const listener of this.listeners) {
                listener();
            }
        }

        chrome.runtime.reload();
    }
}
