var eventsManager = {
    bind: [],
    action: [],
    setup: function (canvas) {
        this.bind[87]="up";
        this.bind[65]="left";
        this.bind[83]="down";
        this.bind[68]="right";
        this.bind[32]="fire";
        document.body.addEventListener("mousedown",this.onMouseDown);
        document.body.addEventListener("mouseup",this.onMouseUp);
        document.body.addEventListener("keydown",this.onKeyDown);
        document.body.addEventListener("keyup",this.onKeyUp);

    },
    onKeyDown: function (event) {
        var action = eventsManager.bind[event.keyCode];
        if(action)
            eventsManager.action[action] = true;
    },
    onMouseDown: function (event) {
             eventsManager.action['fire'] = true
    },
    onMouseUp: function (event) {
        eventsManager.action['fire'] = false
    },
    onKeyUp: function (event) {
        var action = eventsManager.bind[event.keyCode];
        if(action)
            eventsManager.action[action] = false;
    },

}
