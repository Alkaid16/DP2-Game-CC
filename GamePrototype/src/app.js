
var HelloWorldLayer = cc.TMXTiledMap.extend({
    sprite:null,
    tileMatrix:null,
    intersections:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;
        var keyState = new Array(0,0,0,0);
        this.obstacles = [];
        intersections = [];
        var estAnt = 0;
        var lastMov=-1;
        var count =0;
        var movByInt=0;
        tileMatrix = new Array(20);
        for (var i=0;i<20;i++){
            tileMatrix[i] = new Array(20);
        }
        for(var i=0;i<20;i++){
            for(var j=0;j<20;j++){
                tileMatrix[i][j]=0;
            }
        }
        this.initWithTMXFile("res/mapa.tmx");
        this.initObstacles();

        var sprite= new cc.Sprite("res/Bola.png");


        var monstruo = new cc.Sprite("res/monster.jpg");
        monstruo.setPosition(size.width/2,0);

        //Se crea la funci�n que actualiza la posici�n del sprite cada loop del juego
        sprite.moveAction = function (){

            var speed = 1;
            var widthTile = 32;
            var heightTile = 32;
            var x = sprite.getPositionX();
            var y = sprite.getPositionY();
            var xAnt = x;
            var yAnt = y;
            var stopByDecistion=0;


            var monstX = monstruo.getPositionX();
            var monstY = monstruo.getPositionY();

            monstY += speed;
            if(monstY >= size.height){
                monstY = 0;
            }
            //la idea es que se mueva random, luego entra al bucle para ver si se mueve o no verificando colisiones


            y += speed*keyState[0];
            y -= speed*keyState[1];
            x -= speed*keyState[2];
            x += speed*keyState[3];

            //Por cada bloque en el mapa se revisa si hay una colision. Esta no es la unica forma de hacerlo

            cc.log("KeyState: "+keyState);

            //Se pasa la posiciòn como un rectàngulo
            var rect1 = cc.rect(x-sprite.width/2,y - sprite.height/2,30,30);

            if(movByInt==0){
                for(var i=1; i < intersections.length ; i++ ){
                    var block = intersections[i];
                    if(cc.rectIntersectsRect(rect1,block))
                    {
                        cc.log("Intersection");
                        //Encuentra la interseccion
                        //Avanza en la misma direccion en la que estaba una cantidad igual de puntos al ancho o alto del title
                        movByInt = widthTile;
                    }
                }
            }

            if(movByInt)
            {
                movByInt--;

                if(movByInt==0)
                {
                    keyState[0]=0;
                    keyState[1]=0;
                    keyState[2]=0;
                    keyState[3]=0;
                }

            }

            //Verificacion de colisión
            for(var i=1; i < this.obstacles.length ; i++ ){
                var block = this.obstacles[i];
                var rectM = cc.rect(monstX - monstruo.width/2, monstY - monstruo.height/2,550,550);

                if(cc.rectIntersectsRect(rect1,block)){
                    count++;
                    //debe hacer un movimiento random que no permita avanzar por donde estuvo
                    var PosX = 0;
                    var PosY = 0;
                    var modX = xAnt%32;
                    var modY = yAnt%32;

                    //Obtener posicion en matriz
                    if(x!=0) {
                        if (modX == 0)
                            PosX = parseInt(xAnt / 32) - 1;
                        else
                            PosX = parseInt(xAnt / 32);
                    }
                    if(y!=0) {
                        if (modY == 0)
                            PosY = 19-parseInt(yAnt / 32) - 1;
                        else
                            PosY = 19-parseInt(yAnt / 32);
                    }

                    //Frenar
                    keyState[0]=0;
                    keyState[1]=0;
                    keyState[2]=0;
                    keyState[3]=0;

                    //Hallar direccion inversa antes del choque
                    var lastMovInv=0;
                    switch(lastMov)
                    {
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

                    cc.log("X: "+PosX+","+"Y: "+PosY);
                    cc.log(tileMatrix[PosX-1][PosY-1]+"|"+tileMatrix[PosX][PosY-1]+"|"+tileMatrix[PosX+1][PosY-1]);
                    cc.log(tileMatrix[PosX-1][PosY]+"|"+tileMatrix[PosX][PosY]+"|"+tileMatrix[PosX+1][PosY]);
                    cc.log(tileMatrix[PosX-1][PosY+1]+"|"+tileMatrix[PosX][PosY+1]+"|"+tileMatrix[PosX+1][PosY+1]);

                    if(tileMatrix[PosX+1][PosY]!=1)
                        movements[3]=1; //derecha
                    if(tileMatrix[PosX-1][PosY]!=1){
                        movements[2]=1; //izquierda
                    }
                    if(tileMatrix[PosX][PosY-1]!=1)
                        movements[0]=1; //arriba
                    if(tileMatrix[PosX][PosY+1]!=1)
                        movements[1]=1; //abajo

                    var possibleMovements = [];

                    cc.log("Array-Movements: "+movements);
                    cc.log("valor anterior: "+lastMov);

                    for(var i=0;i<4;i++) {
                        if (movements[i] == 1 && i!=lastMovInv) {
                            possibleMovements.push(i);
                        }
                    }

                    if(possibleMovements.length==0)
                        possibleMovements.push(lastMovInv);

                    var random = Math.random();
                    var realRandom = parseInt(random*possibleMovements.length);
                    cc.log("Random seleccionado: "+possibleMovements[realRandom]);

                    keyState[possibleMovements[realRandom]]= 1;
                    lastMov = possibleMovements[realRandom];
                    return;
                }

                if(cc.rectIntersectsRect(rectM,rect1)){
                    alert("You Lose");
                    return;

                }

            }


            sprite.setPosition(x,y);
            monstruo.setPosition(monstX,monstY);
        }

        sprite.setVisible(true);
        sprite.setPosition(525,570);

        //Se agenda la funci�n para que se ejecute cada loop del juego
        this.schedule(sprite.moveAction);

        //Se crea el listener para el teclado, se podria usar tambien un CASE en vez de IFs
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                if(keyCode == cc.KEY.down){
                    keyState[1] = 1;
                    keyState[0]=0;
                    keyState[2]=0;
                    keyState[3]=0;
                }
                if(keyCode == cc.KEY.up){
                    keyState[0] = 1;
                    keyState[1]=0;
                    keyState[2]=0;
                    keyState[3]=0;
                }
                if(keyCode == cc.KEY.left){
                    keyState[2] = 1;
                    keyState[0]=0;
                    keyState[1]=0;
                    keyState[3]=0;
                }
                if(keyCode == cc.KEY.right){
                    keyState[3] = 1;
                    keyState[0]=0;
                    keyState[2]=0;
                    keyState[1]=0;
                }
            }

            /*onKeyReleased: function(keyCode, event){
                if(keyCode == cc.KEY.down){
                    keyState[1] = 0;
                }
                if(keyCode == cc.KEY.up){
                    keyState[0] = 0;
                }
                if(keyCode == cc.KEY.left){
                    keyState[2] = 0;
                }
                if(keyCode == cc.KEY.right){
                    keyState[3] = 0;
                }
            }*/
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


        this.addChild(sprite);
        this.addChild(monstruo);
        sprite.runAction(infiniteAction);
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
                    var react = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);
                    this.obstacles.push(react);
                    var matrixPosX = 0;
                    var matrixPosY = 0;
                    matrixPosX = parseInt(tileXPosition / 32);
                    matrixPosY = parseInt(tileYPosition / 32);
                    tileMatrix[matrixPosX][19-matrixPosY]=1;
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
                    var react = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);
                    intersections.push(react);
                    var matrixPosX = 0;
                    var matrixPosY = 0;
                    matrixPosX = parseInt(tileXPosition / 32);
                    matrixPosY = parseInt(tileYPosition / 32);
                    tileMatrix[matrixPosX][19-matrixPosY]=2;
                }
            }
        }

    }


});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

