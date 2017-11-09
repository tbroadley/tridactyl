/** Tridactyl shared state

    Any context with access to browser.storage can safely import this file and
    get a self-updating consistent copy of the shared program state.

    Any context may modify their copy of the state and that modification will
    be propagated to the rest of the program.

    This works by proxying the state object such that setting any property
    causes the entire state to be saved to storage and adding a listener that
    listens for storage events and updates the proxied object on each storage
    event.

    If this turns out to be expensive there are improvements available.
*/

export type ModeName = 'normal'|'insert'|'hint'
class State {
    mode: ModeName = 'normal'
    cmdHistory: string[] = []
    nmaps: keymaps = {
        "o": "fillcmdline open",
        "O": "current-url open",
        "w": "fillcmdline winopen",
        "W": "current-url winopen",
        "t": "tabopen",
        //["t": "fillcmdline tabopen", // for now, use mozilla completion
        "]]": "clicknext", 
        "[[": "clicknext prev", 
        "T": "current-url tab",
        "yy": "clipboard yank",
        "p": "clipboard open",
        "P": "clipboard tabopen",
        "j": "scrollline 10",
        "k": "scrollline -10",
        "h": "scrollpx -50",
        "l": "scrollpx 50",
        "G": "scrollto 100",
        "gg": "scrollto 0",
        "H": "back",
        "L": "forward",
        "d": "tabclose",
        "u": "undo",
        "r": "reload",
        "R": "reloadhard",
        "gt": "tabnext",
        "gT": "tabprev",
        "gr": "reader",
        ":": "fillcmdline",
        "s": "fillcmdline open google",
        "S": "fillcmdline tabopen google",
        "xx": "something",
        "i": "insertmode",
        "b": "openbuffer",
        "ZZ": "qall",
        "f": "hint",
        // Special keys must be prepended with 🄰
        // ["🄰Backspace", "something"],
    }
}

interface keymaps {
    [key:string]: string
}


// Don't change these from const or you risk breaking the Proxy below.
const defaults = Object.freeze(new State())

const overlay = {} as any
browser.storage.local.get('state').then(res=>{
    if ('state' in res) {
        console.log("Loaded initial state:", res.state)
        Object.assign(overlay, res.state)
    }
}).catch(console.error)

const state = new Proxy(overlay, {

    /** Give defaults if overlay doesn't have the key */
    get: function (target, property) {
        if (property in target) {
            return target[property]
        } else {
            return defaults[property]
        }
    },

    /** Persist sets to storage immediately */
    set: function(target, property, value) {
        console.log("State changed!", property, value)
        target[property] = value
        browser.storage.local.set({state: target})
        return true
    }

}) as any as State

browser.storage.onChanged.addListener(
    (changes, areaname) => {
        if (areaname === "local" && 'state' in changes) {
            Object.assign(overlay, changes.state.newValue)
        }
    }
)

export {state as default}
