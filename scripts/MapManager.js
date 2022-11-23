var mapManager = {
    mapData: null,
    tLayer: null,
    bLayer: null,
    xCount: 0,
    yCount: 0,
    tSize: {x: 64,y: 64},
    mapSize: {x: 64,y: 64},
    tilesets: [],
    imgLoadCount: 0,
    imgLoaded: false,
    jsonLoaded: false,
    view: {x:0, y:0, w: 800, h: 600},
    moving_map: false,


    loadMap(path) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200){
                mapManager.parseMap(request.responseText)
            }
        };
        request.open("GET",path,true);
        request.send()

    },

    parseMap(tilesJSON) {
        this.mapData = JSON.parse(tilesJSON);
        this.xCount = this.mapData.width;
        this.yCount = this.mapData.height;
        this.tSize.x = this.mapData.tilewidth ;
        this.tSize.y = this.mapData.tileheight;
        this.mapSize.x = this.xCount * this.tSize.x ;
        this.mapSize.y = this.yCount * this.tSize.y ;

        if (this.mapSize.x > this.view.w || this.mapSize.y > this.view.h) this.moving_map = true;

        for (let i =0; i < this.mapData.tilesets.length; i++){
            var img = new Image();
            img.onload = function () {
                mapManager.imgLoadCount++;
                if( mapManager.imgLoadCount === mapManager.mapData.tilesets.length){
                    mapManager.imgLoaded = true;
                }
            };
            img.src = this.mapData.tilesets[i].image;
            var t = this.mapData.tilesets[i];
            var ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth/ mapManager.tSize.x),
                yCount: Math.floor(t.imageheight/ mapManager.tSize.y),
            };
            this.tilesets.push(ts)
        }
        this.jsonLoaded = true;


    },
    reset(){
        this.mapData = null;
        this.tLayer = null;
        this.bLayer= null;
        this.xCount= 0;
        this.yCount= 0;
        this.tSize= {x: 64,y: 64};
        this.mapSize= {x: 64,y: 64};
        this.tilesets= [];
        this.imgLoadCount= 0;
        this.imgLoaded= false;
        this.jsonLoaded= false;
        this.view = {x:0, y:0, w: 800, h: 576};
        this.moving_map = false;
    },
    draw(ctx){
        ctx.rect(this.view.x, this.view.y, this.view.w, this.view.h);
        ctx.fillStyle = "rgba(0,0,0,0.63)";
        ctx.fill();
        if(!mapManager.imgLoaded || !mapManager.jsonLoaded){
            setTimeout(function () {
                mapManager.draw(ctx);
            }, 100)
        }else {
            if (this.tLayer === null || this.bLayer === null)
                for (let id = 0; id < this.mapData.layers.length; id ++){
                    var layer = this.mapData.layers[id];
                    if(layer.type === "tilelayer" ){
                        if(layer.name === 'ground'){
                            this.tLayer = layer;
                            continue;
                        }
                        if(layer.name === "wall") {
                            this.bLayer = layer;
                        }

                    }

                }


            for (let i=0; i < this.tLayer.data.length; i++){
                if(this.tLayer.data[i] !== 0){
                    let tile = this.getTile(this.tLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x ;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y ;
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;
                    pX -= this.view.x;
                    pY -= this.view.y;
                    ctx.drawImage(tile.img, tile.px , tile.py,this.tSize.x,this.tSize.y,pX,pY,this.tSize.x ,this.tSize.y );
                }

            }
            for (let i=0; i < this.bLayer.data.length; i++) {
                if (this.bLayer.data[i] !== 0) {
                    let tile = this.getTile(this.bLayer.data[i]);
                    let pX = (i % this.xCount) * this.tSize.x;
                    let pY = Math.floor(i / this.xCount) * this.tSize.y;
                    if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y))
                        continue;
                    pX -= this.view.x;
                    pY -= this.view.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x, this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }
        }
    },

    getTile(tileIndex){
        var tile= {
            img: null,
            px: 0,
            py: 0
        };
        var tileset = this.getTileset(tileIndex);
        tile.img = tileset.image;
        var id = tileIndex - tileset.firstgid;
        var x = id % tileset.xCount;
        var y = Math.floor(id / tileset.xCount);
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile;
    },
    centerAt(x,y){
        if (!this.moving_map) return;
        if (x < this.view.w / 2)
            this.view.x = 0;
        else
        if(x > this.mapSize.x - this.view.w / 2)
            this.view.x = this.mapSize.x - this.view.w;
        else
            this.view.x = x - (this.view.w / 2)
        if (y < this.view.h / 2)
            this.view.y = 0;
        else
        if(y > this.mapSize.y - this.view.h / 2)
            this.view.y = this.mapSize.y - this.view.h;
        else
            this.view.y = y - (this.view.h / 2)
    },
    getTileset(tileIndex){
        for (var i = mapManager.tilesets.length - 1; i >=0; i--)
            if(mapManager.tilesets[i].firstgid <= tileIndex){
                return mapManager.tilesets[i];
            }
        return null;
    },
    getTilesetIdx(x,y){
        var wX = x;
        var wY = y;
        var idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x);
        return this.tLayer.data[idx]
    },
    isVisible(x,y,width,height){
        if (x + width < this.view.x || y + height  < this.view.y || x > this.view.x + this.view.w || y > this.view.y + this.view.h)
            return false;
        return true;
    },

    parseEntities(){
        if(!mapManager.imgLoaded ||!mapManager.jsonLoaded){
            setTimeout(function () {
                mapManager.parseEntities();
            },100)
        }else
            for (var j = 0; j< this.mapData.layers.length; j++)
                if(this.mapData.layers[j].type === 'objectgroup'){
                    var entities = this.mapData.layers[j];
                    for(var i = 0; i < entities.objects.length; i++){
                        var e = entities.objects[i];

                        try{
                            var obj = Object.create(gameManager.factory[e.class]);
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;

                            gameManager.entities.push(obj);
                            if (obj.name === "Player")
                                gameManager.initPlayer(obj);
                        }catch (ex) {
                            console.log("Ошибка создания: ["+e.gid +"]" +e.type+","+ex)
                        }
                    }
                }
    },


};

