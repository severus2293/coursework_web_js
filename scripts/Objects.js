var Entity = {
    pos_x: 0,
    pos_y: 0,
    size_x: 0,
    size_y: 0,
    extend: function (extendProto) {
        var object = Object.create(this);
        for (var property in extendProto){
            if(this.hasOwnProperty(property) || typeof object[property] === 'undefined'){
                object[property] = extendProto[property];
            }
        }
        return object;
    }
}

var Player = Entity.extend({
    move_x: 0,
    move_y: 0,
    speed: 30,
    lifetime: 100,
    points: 0,
    direction: 2,
    draw: function(ctx) {
        let sprite_name;
        switch (this.direction) {
            case -1:sprite_name="player_left"; break;
            case 1:sprite_name="player_right"; break;
            case -2:sprite_name = "player_right"; break;
            case 2:sprite_name="player_right"; break;
        }

        spriteManager.drawSprite(ctx,sprite_name,this.pos_x,this.pos_y );
    },
    update: function () {
        if (this.move_x === -1 ){
            this.direction = -1;
        }
        if (this.move_x === 1 ){
            this.direction = 1;
        }
        if (this.move_y === -1 ){
            this.direction = -2;
        }
        if (this.move_y === 1 ){
            this.direction = 2;
        }
        physicManager.update(this);

    },
    onTouchEntity: function (obj) {
        if(obj.name.match(/Bonus/)){
            if(this.lifetime <= 50){
                this.lifetime += 50
            }
             else{
                this.lifetime = 100
            }
            soundsManager.play('music/heal.mp3',{looping: false,volume: 1})
            document.getElementById('hp').innerHTML = "Здоровье: " + this.lifetime
            obj.kill()

        }
        else if (obj.name.match(/Gold/)){
            this.points += 50
            gameManager.points += 50
            soundsManager.play('music/money.mp3',{looping: false,volume: 1})
            document.getElementById('points').innerHTML = "Очки: " + gameManager.points
            obj.kill()
        }
        else if(obj.name.match(/Exit/)){
            gameManager.go_next_level()
        }
    },
    kill: function () {
             this.lifetime -= 20
        document.getElementById('hp').innerHTML = "Здоровье: " + this.lifetime
        if(this.lifetime <= 0){
            gameManager.kill(this)
            gameManager.points = 0
            document.getElementById('points').innerHTML = "Очки: " + gameManager.points
            gameManager.reset_level();
        }
    },
    fire: function () {
        var r = Object.create(Fireball)
        soundsManager.play('music/fire.mp3',{looping: false,volume: 1})
        r.size_x = 32
        r.size_y = 32
        r.name = 'fireball' + (++gameManager.fireNum)
        r.move_x = this.move_x
        r.move_y = this.move_y
        switch (this.move_x + 2*this.move_y) {
            case -1:
                r.pos_x = this.pos_x - r.size_x
                r.pos_y = this.pos_y
                break
            case 1:
                r.pos_x = this.pos_x + this.size_x
                r.pos_y = this.pos_y
                break
            case -2:
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y - r.size_y
                break;
            case 2:
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y + this.size_y
                break;
            default:
                return

        }
        gameManager.entities.push(r)
    },
   /* move(obj){
        physicManager.update(obj)
    },*/

});

var Enemy = Entity.extend({
    lifetime: 50,
    move_x: 0,
    move_y: -1,
    speed: 10, //1
    direction: 2,
    interval: 0,
    draw: function(ctx) {
        let sprite_name;
        switch (this.direction) {
            case -1:sprite_name="enemy_left"; break;
            case 1:sprite_name="enemy_right"; break;
            case -2:sprite_name = "enemy_right"; break;
            case 2:sprite_name="enemy_right"; break;
        }

        spriteManager.drawSprite(ctx,sprite_name,this.pos_x,this.pos_y );
    },
    update: function(){
        physicManager.update(this);
    },
    onTouchEntity: function(obj){
          if(!obj.name.match(/fireball[\d]/) && !obj.name.match(/fireball_enemy[\d]/)){
              this.onTouchMap()
          }
    },
    onTouchMap: function () {
        if(this.move_x === 0 && this.move_y === -1){
            this.move_x = 1
            this.move_y = 0
        }
        else if(this.move_x === 1 && this.move_y === 0){
            this.move_x = 0
            this.move_y = 1
        }
        else if(this.move_x === 0 && this.move_y === 1){
            this.move_x = -1
            this.move_y = 0
        }
        else if(this.move_x === -1 && this.move_y === 0){
            this.move_x = 0
            this.move_y = -1
        }
    },
    kill: function(){
        this.lifetime -= 25
        if(this.lifetime <= 0){
            soundsManager.play('music/death.mp3',{looping: false,volume: 1})
            gameManager.kill(this)
            gameManager.player.points += 30
            gameManager.points += 30
            document.getElementById('points').innerHTML = "Очки: " + gameManager.points
        }

    },
    fire: function () {
        this.interval++
        if(this.interval === 10) {
            var r = Object.create(Fireball_Enemy)
            r.size_x = 32
            r.size_y = 32
            r.name = 'fireball_enemy' + (++gameManager.fireNum)
            r.move_x = this.move_x
            r.move_y = this.move_y
            switch (this.move_x + 2 * this.move_y) {
                case -1:
                    r.pos_x = this.pos_x - r.size_x
                    r.pos_y = this.pos_y
                    break
                case 1:
                    r.pos_x = this.pos_x + this.size_x
                    r.pos_y = this.pos_y
                    break
                case -2:
                    r.pos_x = this.pos_x
                    r.pos_y = this.pos_y - r.size_y
                    break;
                case 2:
                    r.pos_x = this.pos_x
                    r.pos_y = this.pos_y + this.size_y
                    break;
                default:
                    return

            }
            gameManager.entities.push(r)
            this.interval = 0
        }
    },

    })
var Fireball = Entity.extend({
    move_x:0,move_y:0,
    speed:10,
    draw: function(ctx){
        spriteManager.drawSprite(ctx,"fireball",this.pos_x,this.pos_y)
    },
    update: function () {
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
       if(obj.name.match(/Enemy/)  || obj.name.match(/fireball[\d]/) || obj.name.match(/fireball_enemy[\d]/)){
           obj.kill();
       }
       this.kill()
    },
    onTouchMap: function (idx) {
        this.kill()
    },
    kill: function () {
             gameManager.kill(this)
    }

})
var Fireball_Enemy = Entity.extend({
    move_x:0,move_y:0,
    speed:12,
    draw: function(ctx){
        spriteManager.drawSprite(ctx,"fireball_enemy",this.pos_x,this.pos_y)
    },
    update: function () {
        physicManager.update(this);
    },
    onTouchEntity: function (obj) {
        if(obj.name.match(/Player/) || obj.name.match(/fireball[\d]/) || obj.name.match(/fireball_enemy[\d]/)){
            obj.kill();
        }
        this.kill()
    },
    onTouchMap: function (idx) {
        this.kill()
    },
    kill: function () {
        gameManager.kill(this)
    }

})

var Bonus = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx,"heal",this.pos_x,this.pos_y)
    },
    update: function () {
    },
    kill: function () {
        gameManager.kill(this)
    },
})
var Gold = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx,"gold",this.pos_x,this.pos_y)
    },
    update: function () {
    },
    kill: function () {
        gameManager.kill(this)
    },
})
var Exit = Entity.extend({
    draw: function (ctx) {
        spriteManager.drawSprite(ctx,"exit",this.pos_x,this.pos_y)
    },
    update: function () {
    },
    kill: function () {
    },
})

