var intersectionHandler = {
    //Test de GIT
    detectIntersection: function(tilePosX, tilePosY, direction, tileMatrix){
        var targetPoint = [];
        var factor = 1;
        var offset = 3;

        switch(direction) {
            case 0 :
                targetPoint = [tilePosX, tilePosY +offset];
                break;
            case 1 :
                targetPoint = [tilePosX, tilePosY -offset];
                break;
            case 2 :
                targetPoint = [tilePosX-offset, tilePosY];
                break;
            case 3 :
                targetPoint = [tilePosX+offset, tilePosY];
                break;
            default:
                return;
        }

        factor = ((targetPoint[0] - tilePosX) + (targetPoint[1] - tilePosY))/offset;
        var horizontal = tilePosX == targetPoint[0] ? 0 : 1;

        for(var i=tilePosY + factor*((horizontal+1)%2); i!=targetPoint[1] + factor; i+= factor){
            for(var j=tilePosX + factor*horizontal; j!=targetPoint[0] + factor; j+= factor){
                if(tileMatrix[j][i] == 2 && this.intersectTile==null && !this.choiceAvailable) {
                    this.choiceAvailable = true;
                    return;
                }
                if(tileMatrix[j][i] == 1){
                    return;
                }
            }
        }

    },

    executeChoice: function(){
        var keyCode = this.storedDecision;

        if(keyCode == cc.KEY.down){
            childMoveAction.keyState[1] = 1;
            childMoveAction.keyState[0]=0;
            childMoveAction.keyState[2]=0;
            childMoveAction.keyState[3]=0;
        }
        if(keyCode == cc.KEY.up){
            childMoveAction.keyState[0] = 1;
            childMoveAction.keyState[1]=0;
            childMoveAction.keyState[2]=0;
            childMoveAction.keyState[3]=0;
        }
        if(keyCode == cc.KEY.left){
            childMoveAction.keyState[2] = 1;
            childMoveAction.keyState[0]=0;
            childMoveAction.keyState[1]=0;
            childMoveAction.keyState[3]=0;
        }
        if(keyCode == cc.KEY.right){
            childMoveAction.keyState[3] = 1;
            childMoveAction.keyState[0]=0;
            childMoveAction.keyState[2]=0;
            childMoveAction.keyState[1]=0;
        }

        this.storedDecision = -1;
    },

    recordChoice: function(keyCode){
        this.storedDecision = keyCode;
        this.choiceAvailable = false;
    },

    choiceAvailable : false,
    storedDecision: -1,
    intersectTile: null
};

var childMoveAction = (function(){
    var tileWidth = 0;
    var speed = 1;
    var choiceExecuted = false;
    var collisionDelay = 0;
    var mainLayer = {};
    var pub = {};

    pub.keyState = new Array(1,0,0,0);

    pub.setMainLayer = function(layer) {
        mainLayer = layer;
    };

    //monstY += speed; ESTO SE DEBE SACAR Y PONER EN OTRO MODULO
    //if(monstY >= size.height){
    //    monstY = 0;
    //}

    pub.setTileWidth = function(val){
        tileWidth = val;
    }

    var stopMovement= function(){
        pub.keyState[0]=0;
        pub.keyState[1]=0;
        pub.keyState[2]=0;
        pub.keyState[3]=0;
    }

    //Metodo principal
    pub.update = function(){
        var sprite = mainLayer.sprite;
        var monstruo = mainLayer.monstruo;

        var x = sprite.getPositionX();
        var y = sprite.getPositionY();
        var xAnt = x;
        var yAnt = y;
        var monstX = monstruo.getPositionX();
        var monstY = monstruo.getPositionY();
        var lastMov = -1;

        y += speed*pub.keyState[0];
        y -= speed*pub.keyState[1];
        x -= speed*pub.keyState[2];
        x += speed*pub.keyState[3];

        var rect1 = cc.rect(x-sprite.width/2,y - sprite.height/2,30,30);

        var posX = 0;
        var posY = 0;
        posX = mainLayer.getMatrixPosX(xAnt, tileWidth);
        posY = mainLayer.getMatrixPosY(yAnt, tileWidth);

        var direction = -1;
        for(var i=0; i<4 ; i++){
            if(pub.keyState[i]==1) {
                direction = i;
                break;
            }
        }

        intersectionHandler.detectIntersection(posX,posY,direction, mainLayer.tileMatrix);

        //Si la acción ya se ejecuto, se debe esperar a salir completamente del tile de interseccion
        if(choiceExecuted==true){
            var collBox = cc.rect(xAnt-sprite.width/2,yAnt - sprite.height/2,30,30);
            if(!cc.rectIntersectsRect(collBox,intersectionHandler.intersectTile.rect)){
                intersectionHandler.intersectTile = null;
                choiceExecuted = false;
            }
        }

        //Verificacion de colisión
        for(var i=1; i < mainLayer.obstacles.length ; i++ ){
            var tile = mainLayer.obstacles[i];
            var rectM = cc.rect(monstX - monstruo.width/2, monstY - monstruo.height/2,550,550);

            if(cc.rectIntersectsRect(rect1,tile.rect)){

                //Si choca con una interseccion
                if(tile.typeTerr == 2){
                    if(intersectionHandler.intersectTile==null){
                        intersectionHandler.intersectTile = tile;
                        collisionDelay = tileWidth;
                        intersectionHandler.choiceAvailable=false;
                    }else{
                        //Delay para activar la decision tomada por el jugador
                        collisionDelay = collisionDelay>0? collisionDelay - speed : 0;

                        //Si se acabo el delay se ejecuta la acción y se cambia de direccion
                        if(collisionDelay==0 && !choiceExecuted) {
                            intersectionHandler.executeChoice();
                            choiceExecuted = true;

                            x = xAnt;
                            y = yAnt;

                            y += speed*pub.keyState[0];
                            y -= speed*pub.keyState[1];
                            x -= speed*pub.keyState[2];
                            x += speed*pub.keyState[3];
                        }
                    }
                    break;
                }

                //Frenar
                stopMovement();

                //Hallar direccion inversa antes del choque
                var lastMovInv=0;
                switch(lastMov) {
                    case 0 :
                        lastMovInv = 1;
                        break;
                    case 1 :
                        lastMovInv = 0;
                        break;
                    case 2 :
                        lastMovInv = 3;
                        break;
                    case 3 :
                        lastMovInv = 2;
                        break;
                }

                var movements = new Array(0,0,0,0);

                if(mainLayer.tileMatrix[posX+1][posY]!=1) movements[3]=1; //derecha
                if(mainLayer.tileMatrix[posX-1][posY]!=1) movements[2]=1; //izquierda
                if(mainLayer.tileMatrix[posX][posY-1]!=1) movements[0]=1; //arriba
                if(mainLayer.tileMatrix[posX][posY+1]!=1) movements[1]=1; //abajo

                var possibleMovements = [];

                for(var i=0;i<4;i++) {
                    if (movements[i] == 1 && i!=lastMovInv) {
                        possibleMovements.push(i);
                    }
                }

                if(possibleMovements.length==0)
                    possibleMovements.push(lastMovInv);

                var random = Math.random();
                var realRandom = parseInt(random*possibleMovements.length);

                pub.keyState[possibleMovements[realRandom]]= 1;
                lastMov = possibleMovements[realRandom];
                return;
            }

            if(cc.rectIntersectsRect(rectM,rect1)){
                alert("You Lose");
                return;

            }

        }

        mainLayer.sprite.setPosition(x,y);
        monstruo.setPosition(monstX,monstY);
    }

    return pub;

})();


var HelloWorldLayer = cc.TMXTiledMap.extend({
    sprite:null,
    monstruo:null,
    keyState: new Array(1,0,0,0),
    tileMatrix:null,
    intersections: [],

    ctor:function () {
        this._super();
        this.initWithTMXFile("res/mapa.tmx");

        var mapHeight = this.getMapSize().height;
        var mapWidth = this.getMapSize().width;
        var tileWidth= this.getTileSize().height;
        childMoveAction.setTileWidth(tileWidth);
        var size = cc.winSize;

        this.obstacles = [];
        this.tileMatrix = new Array(20);

        for (var i=0;i<20;i++){
            this.tileMatrix[i] = new Array(20);
        }

        for(var i=0;i<20;i++){
            for(var j=0;j<20;j++){
                this.tileMatrix[i][j]=0;
            }
        }

        this.initObstacles();

        this.sprite= new cc.Sprite("res/Bola.png");
        this.monstruo = new cc.Sprite("res/monster.jpg");
        this.monstruo.setPosition(size.width/2,-100);

        this.getMatrixPosX = function(pixelX, tileWidth){
            var modX = pixelX % tileWidth;
            if (modX == 0)
                return parseInt(pixelX / tileWidth) - 1;
            else
                return parseInt(pixelX / tileWidth);
        }

        this.getMatrixPosY = function(pixelY, tileWidth){
            var modY = pixelY % tileWidth;
            if(pixelY!=0) {
                if (modY == 0)
                    return this.getMapSize().height -1 -parseInt(pixelY / tileWidth) - 1;
                else
                    return this.getMapSize().height -1 -parseInt(pixelY / tileWidth);
            }
        }

        this.sprite.setVisible(true);
        this.sprite.setPosition(525,570);

        //Se agenda la funci�n para que se ejecute cada loop del juego
        //this.schedule(childMoveAction.update());

        //Se crea el listener para el teclado, se podria usar tambien un CASE en vez de IFs
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if(!intersectionHandler.choiceAvailable) return;
                intersectionHandler.recordChoice(keyCode);
            }

        }, this);

        //Setup de la animaci�n que se va a reproducir en el sprite. Esto funciona mejor con un
        //spritesheet y un archivo .plist
        var animFrames = [];
        //Se crean los frames de la animaci�n
        for(var i=1;i<5;i++){
            var str = "res/bola"+i+".png";
            var animFrame = new cc.AnimationFrame(new cc.SpriteFrame(str,cc.rect(0,0,32,32)), 1,null);
            animFrames.push(animFrame);
        }
        //Se crea la animaci�n que reproduce en secuencia los frames agregados al array animFrames.
        var animation = new cc.Animation(animFrames, 0.08, 100);
        var animate   = cc.animate(animation);

        //En este caso, se crea una acci�n infinita para que la animacion se reproduzca siempre
        var infiniteAction = new cc.RepeatForever(animate);

        this.addChild(this.sprite);
        this.addChild(this.monstruo);
        this.sprite.runAction(infiniteAction);
        return true;
    },

    initObstacles : function() {
        var mapWidth = this.getMapSize().width;
        var mapHeight = this.getMapSize().height;
        var tileWidth = this.getTileSize().width;
        var tileHeight = this.getTileSize().height;
        var collidableLayer = this.getLayer("Collidable Walls");
        var intersectionLayer = this.getLayer("Intersection");
        var i, j;

        for (i = 0; i < mapWidth; i++) {
            for (j = 0; j < mapHeight; j++) {
                var tileCoord = new cc.Point(i, j);

                var gid = collidableLayer.getTileGIDAt(tileCoord);

                if (gid) {
                    var tileXPosition = i * tileWidth;
                    var tileYPosition = (mapHeight * tileHeight)
                        - ((j + 1) * tileHeight);

                    var cTile = {};
                    cTile.typeTerr = 1;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                    this.tileMatrix[i][j]=1;
                }
            }
        }

        for (i = 0; i < mapWidth; i++) {
            for (j = 0; j < mapHeight; j++) {
                var tileCoord = new cc.Point(i, j);

                var gid = intersectionLayer.getTileGIDAt(tileCoord);

                if (gid) {
                    var tileXPosition = i * tileWidth;
                    var tileYPosition = (mapHeight * tileHeight)
                        - ((j + 1) * tileHeight);

                    var cTile = {};
                    cTile.typeTerr = 2;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                    this.intersections.push(cTile);
                    this.tileMatrix[i][j]=2;
                }
            }
        }

    }


});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        childMoveAction.setMainLayer(layer);
        layer.schedule(childMoveAction.update);
        this.addChild(layer);
    }
});

