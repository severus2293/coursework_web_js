var canvas = document.getElementById("canvasId");
var ctx = canvas.getContext("2d");


var gameManager = {
    factory: {},
    entities: [],
    fireNum: 0,
    player: null,
    points: 0,
    laterKill: [],
    levels_path: ["maps/first.json","maps/second.json"],
    level: 0,

    initPlayer: function (obj) {
        this.player = obj;
    },
    kill: function (obj) {
        this.laterKill.push(obj)
    },
    update: function () {
        if(this.player === null)
            return;
        this.player.move_x=0;
        this.player.move_y=0;
        if(eventsManager.action["up"]) this.player.move_y = -1;
        if(eventsManager.action["down"]) this.player.move_y = 1;
        if(eventsManager.action["left"]) this.player.move_x = -1;
        if(eventsManager.action["right"]) this.player.move_x = 1;
        if(eventsManager.action["fire"]) this.player.fire();
        this.entities.forEach(function (e) {
            try{
                e.update()
            }catch (ex) {
                console.log(e.name+" "+ex );
            }
        });
        for(var i=0;i<this.laterKill.length;i++){
            var idx = this.entities.indexOf(this.laterKill[i])
            if(idx > -1)
                this.entities.splice(idx,1)
        }
        if(this.laterKill.length > 0)
            this.laterKill.length = 0


        mapManager.draw(ctx);
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw(ctx);
    },
    draw: function (ctx) {
        for(var e = 0; e < this.entities.length; e ++)
            this.entities[e].draw(ctx)
    },
    loadAll: function () {
        this.points = 0
        document.getElementById('points').innerHTML = "Очки: " + gameManager.points
        mapManager.loadMap(this.levels_path[this.level]);
        spriteManager.loadAtlas("sprites/game_atlas.json","sprites/game_pack.png");
        gameManager.factory['Player']= Player;
        gameManager.factory['Enemy'] = Enemy;
        gameManager.factory['Bonus'] = Bonus;
        gameManager.factory['Fireball'] = Fireball;
        gameManager.factory['Gold'] = Gold;
        gameManager.factory['Exit'] = Exit;
        gameManager.factory['Fireball_Enemy'] = Fireball_Enemy;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup(canvas);


    },
    go_next_level: function(){

        clearInterval(this.interval);
        this.level++;
        if(this.level > 1){
            this.end_game()
            return
        }
        this.entities = [];
        mapManager.reset()
        mapManager.loadMap(this.levels_path[this.level]);
        mapManager.parseEntities();
        ctx.clearRect(0,0,mapManager.view.w,mapManager.view.h);
        mapManager.draw(ctx);
        gameManager.play();

    },
    reset_level(){
        document.getElementById('hp').innerHTML = "Здоровье: 100"
        this.level--;
        this.go_next_level();
    },
    play: function () {

        this.interval = setInterval(updateWorld, 200);
    },
    end_game: function () {
        soundsManager.stopAll()
        clearInterval(this.interval);
        mapManager.reset();
        gameManager.entities =[]
        ctx.clearRect(0,0,mapManager.view.w,mapManager.view.h);
        text = "Вы прошли игру";
        ctx.font= "22px Verdana";
        ctx.fillText(text, mapManager.view.w / 4 ,mapManager.view.h / 2)
        update_records();
    }

};

function updateWorld() {
    gameManager.update()
}
function update_records() {
    let arr;
    if (localStorage.hasOwnProperty('higthscores')) {
        arr = JSON.parse(localStorage.getItem('higthscores'));
        arr.push({name: name, score: gameManager.points});
        arr.sort(function (a, b) {
            return a.score - b.score;
        });

        while (arr.length > 10) {
            arr.pop();
        }
        localStorage.setItem('higthscores', JSON.stringify(arr));
    } else {
        arr = [];
        arr.push({name: name, score: gameManager.points});
        localStorage.setItem('higthscores', JSON.stringify(arr));
    }
    write_record()
}
function write_record() {
    let arr = JSON.parse(localStorage.getItem('higthscores'));
    arr = arr.reverse()
    var table = '<table class="simple-little-table">';
    for( var i = 0; i < arr.length; i++ ){
        table += '<tr>';
        table += '<td>' + (Number(i)+1) +'</td>';
        table += '<td>' + arr[i].name +'</td>';
        table += '<td>' + arr[i].score +'</td>';
        table += '</tr>';
    }
    table += '</table>';
    document.getElementById('table').innerHTML = table;
}

soundsManager.init();
soundsManager.loadArray(['music/authorization_2.mp3','music/death.mp3','music/fire.mp3','music/heal.mp3','music/money.mp3'])
soundsManager.play('music/authorization_2.mp3',{looping: true,volume: 0.1})
var name = localStorage.getItem("gamer_name");
gameManager.loadAll();
gameManager.play();
