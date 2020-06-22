const cp = require('child_process');
const fs = require('fs');

// file name to log spawned process output to, or null to disable logging
const LOG_FILE = null;

export default class RestartButtonMod {
    constructor(mod) {
        this.listeners = [];

        const scriptsDir = `${mod.baseDirectory}scripts/`;

        switch(process.platform) {
            case 'win32':
                // Theoretically doing something like this should work, but I could not get it to
                //     cp.spawn(file, [], {shell:true, detached:true, windowsHide:true})
                // github issue that may be relavent: https://github.com/nodejs/node/issues/21825
                // instead I am using `start /B` as a workaround to get a hidden detached process
                this.spawnInShell = true;
                this.spawnDetached = false;
                this.script = 'start';
                this.scriptArgs = ['/B', `${scriptsDir.replace(/\//g, '\\')}windows.bat`];
                break;
            case 'linux':
                this.spawnInShell = false;
                this.spawnDetached = true;
                this.script = `${scriptsDir}linux.sh`;
                this.scriptArgs = [];
                break
            case 'darwin':
                // I am still confused how this works without detaching,
                // but I will leave it as is until this does not work for someone
                this.spawnInShell = false;
                this.spawnDetached = false;
                this.script = `${scriptsDir}macos.sh`;
                this.scriptArgs = [];
                break;
            default:
                throw new Error(`Restarting the process is not supported for '${process.platform}' systems yet.`);
        }

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

        const options = {
            shell: this.spawnInShell,
            stdio: 'ignore',
            detached: this.spawnDetached
        };
        if(LOG_FILE) {
            const log = fs.openSync(LOG_FILE, 'w');
            options.stdio = ['ignore', log, log];
        }
        cp.spawn(this.script, this.scriptArgs, options).unref();
        nw.App.quit();
    }
}
