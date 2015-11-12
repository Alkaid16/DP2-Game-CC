var gameplayMap;
var currentGameplayScene;


//Objeto manejador de detecciones de intersecciones y variables asociadas
var interHandler = {
    choiceAvailable : false,
    choiceExecuted : false,
    currentChoices: [],
    storedDecision: -1,
    intersectTile: null,
    sameTileDetected : false,
    collisionDelay : 0,

    //Función que hace un scan de [offset] tiles en adelante, buscando si se aproxima una interseccion
    detectIntersection: function(tilePosX, tilePosY, direction, tileMatrix){
        var targetPoint = [];
        var factor = 1;
        var offset = 3;
        var mapSizeX = gameplayMap.getMapSize().width;
        var mapSizeY = gameplayMap.getMapSize().height;

        //Dependiendo de la dirección del niño se scanea hacia arriba, abajo, izquierda o derecha.
        switch(direction) {
            case 0 :
                targetPoint = [tilePosX, tilePosY -offset];
                break;
            case 1 :
                targetPoint = [tilePosX, tilePosY +offset];
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

        //El factor es 1 o -1. Es para saber si se sumara en el eje x/y, o se restara.
        factor = ((targetPoint[0] - tilePosX) + (targetPoint[1] - tilePosY))/offset;

        //Variable que indica si el scan se hace horizontal o vertical
        var horizontal = tilePosX == targetPoint[0] ? 0 : 1;
        var initValueY = tilePosY + factor*((horizontal+1)%2);
        var initValueX = tilePosX + factor*horizontal;
        var initValueY2 = tilePosY + 2*factor*((horizontal+1)%2);
        var initValueX2 = tilePosX + 2*factor*horizontal;

        //Metodo para controlar cuando puede saltar los huecos
        if(typeof tileMatrix[initValueX2] != 'undefined' && typeof tileMatrix[initValueX2][initValueY2] != 'undefined'
        && tileMatrix[initValueX2][initValueY2] == 3){
            if(!HoleController.jumped && !HoleController.canJump) {
                HoleController.canJump = true;
                gameplayMap.sprite.addChild(HoleController.exMark,50);
                HoleController.exMark.setPosition(cc.p(15, 55));
            }
        }

        //El scan propiamente implementado
        for(var i=initValueY; i!=targetPoint[1] + factor; i+= factor){
            for(var j=initValueX; j!=targetPoint[0] + factor; j+= factor){
                //Validación de los limites del mapa
                if(j<0 || j>mapSizeX-1 || i<0 || i>mapSizeY-1) continue;

                //Si se encontro una intersección aproximandose, se activa el flag choiceAvailable y sameTileDetected
                //Estas indican que el usuario puede realizar una decision y que el tile encontrado es el mismo
                if(tileMatrix[j][i] == 2 && !this.sameTileDetected && !this.choiceAvailable) {
                    this.choiceAvailable = true;
                    this.sameTileDetected = true;
                    this.currentChoices = gameplayMap.getPossibleChoices(j,i, direction, true);
                    ChildSM.showArrows(this.currentChoices);
                    return;
                }

                //Si el scan se encuentra con una pared, se detiene.
                if(tileMatrix[j][i] == 1){
                    return;
                }
            }
        }

    },

    //Metodo indicando que se salio del tile de intersección, y la variable sameTileDetected se libera
    intersectionExited : function(){
        this.intersectTile = null;
        this.sameTileDetected = false;
        this.choiceExecuted = false;
        if(childMoveAction.getShield() == false) {
            gameplayMap.sprite.setColor(new cc.Color(255, 255, 255, 0));
        }
    },

    //Método que ejecuta la función seleccionada por el usuario con el teclado
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
        this.choiceExecuted = true;
    },

    //Método que guarda la selección hecha por el usuario. Se considera que en el momento que decide ya no puede
    //cambiar su elección
    recordChoice: function(keyCode){
        if(this.validChoice(keyCode)){
            this.storedDecision = keyCode;
            this.choiceAvailable = false;
        }
    },

    excessInIntersection: function(dir, sprRect, rect){
        var dif;
        switch(dir){
            case 0:{
                dif =   sprRect.y + sprRect.height - rect.y;
                break;
            }
            case 1:{
                dif =  rect.y + rect.height - sprRect.y;
                break;
            }
            case 2:{
                dif = rect.x + rect.width - sprRect.x;
                break;
            }
            case 3:{
                dif =  sprRect.x + sprRect.width - rect.x;
                break;
            }
        }
        return dif
    },

    validChoice : function(keyCode){
        var choice;
        switch(keyCode){
            case cc.KEY.up : choice=0;
                break;
            case cc.KEY.down : choice=1;
                break;
            case cc.KEY.left : choice=2;
                break;
            case cc.KEY.right : choice=3;
                break;
        }

        for(var i=0;i<this.currentChoices.length; i++)
            if(this.currentChoices[i] == choice) return true;

        return false;
    }
};

var monsterMoveAction = function(){

}

//Módulo de movimiento del niño
var childMoveAction = (function(){
    var tileWidth = 0;
    var speed = 2.5;
    var isJumping = false;
    var collisionDelay = 0;
    var haveShield = false;
    var mainLayer = {};
    var pub = {};
    var xNew;
    var yNew;
    pub.childPosX = 0;
    pub.childPosY = 0;
    pub.lastDirection = 0;


    pub.keyState = new Array(1,0,0,0);

    pub.setMainLayer = function(layer) {
        mainLayer = layer;
    };

    pub.getSpeedSprite = function(){
        return speed;
    }

    pub.getIsJumping = function(){
        return isJumping;
    }

    pub.updateIsJumping = function(val){
        isJumping = val;
    }

    pub.updateSpeed = function(spd){
        speed = spd;
    }

    pub.updateShield = function(val){
        haveShield = val;
    }

    pub.getShield = function(){
        return haveShield;
    }

    pub.init = function(oTileWidth){
        pub.keyState = new Array(1,0,0,0);
        tileWidth = oTileWidth;
        isJumping = false;
        collisionDelay = 0;
        haveShield = false;
        pub.childPosX = 0;
        pub.childPosY = 0;
        pub.lastDirection = 0;
    }

    //Método para detener el movimiento del niño
    var stopMovement= function(){
        pub.keyState[0]=0;
        pub.keyState[1]=0;
        pub.keyState[2]=0;
        pub.keyState[3]=0;
    }

    //Método que halla la nueva posición del niño y la devuelve en un array con la posición x, y.
    var updatePosition = function(){
        var x = pub.childPosX;
        var y = pub.childPosY;

        y += speed*pub.keyState[0];
        y -= speed*pub.keyState[1];
        x -= speed*pub.keyState[2];
        x += speed*pub.keyState[3];
        ChildSM.updateAnimation(gameplayMap.sprite,getCurrentDirection());

        return new Array(x,y);
    }

    //Consigue la dirección actual en la que se mueve el niño
    var getCurrentDirection = function(){
        var direction = -1;
        for(var i=0; i<4 ; i++){
            if(pub.keyState[i]==1) {
                direction = i;
                break;
            }
        }
        if(direction!=-1)
            pub.lastDirection = direction;
        return direction;
    }

    //Consigue el movimiento del niño pero en un vector x y.
    var getMovementVector = function(){
        var dir = getCurrentDirection();
        switch(dir) {
            case 0:
                return new Array(0,speed);
            case 1:
                return new Array(0,-speed);
            case 2:
                return new Array(-speed,0);
            case 3:
                return new Array(speed,0);
        }
    }

    //Verifica que el choque con un tile se realiza de forma perfecta: entre los extremos de los 2 rectangulos
    //que se estan chocando debe haber un espacio de 1 pixel.
    var isTrueCollision = function(sprRect, rect){
        var vector = getMovementVector();
        var dir = getCurrentDirection();
        //El sprRect es un rect con la posición futura del sprite. A este se le resta el vector de dirección para
        //conseguir el rectangulo actual.
        var newSprRect = cc.rect(sprRect);
        newSprRect.x = newSprRect.x - vector[0];
        newSprRect.y = newSprRect.y - vector[1];

        //Dependiendo de la dirección, se evalua que solo halla una diferencia de 1 pixel entre los extremos en contacto
        switch(dir){
            case 0:{
                var dif = rect.y - newSprRect.y - newSprRect.height;
                if(dif>1){
                    pub.childPosY += dif-1;
                    mainLayer.sprite.setPositionY(pub.childPosY);
                    return false;
                }
                break;
            }
            case 1:{
                var dif = newSprRect.y - rect.y - rect.height;
                if(dif>1){
                    pub.childPosY -= dif-1;
                    mainLayer.sprite.setPositionY(pub.childPosY);
                    return false;
                }
                break;
            }
            case 2:{
                var dif = newSprRect.x - rect.x - rect.width;
                if(dif>1){
                    pub.childPosX -= dif-1;
                    mainLayer.sprite.setPositionX(pub.childPosX);
                    return false;
                }
                break;
            }
            case 3:{
                var dif = rect.x - newSprRect.x - newSprRect.width;
                if(dif>1){
                    pub.childPosX += dif-1;
                    mainLayer.sprite.setPositionX(pub.childPosX);
                    return false;
                }
                break;
            }
        }
        return true;
    }

    var interCollision = function(direction, sprRect, tile, posX, posY){
        //Si es el primer contacto con el tile de intersección, se registra el mismo y se inicializa
        //el delay para ejecutar la decisión del usuario
        if(interHandler.intersectTile==null){
            interHandler.intersectTile = tile;
            ChildSM.hideArrows();
            collisionDelay = tileWidth-1;
            collisionDelay -= interHandler.excessInIntersection(direction, sprRect, tile.rect);

            //En caso no se haya seleccionado una dirección por el usuario, Se procede a elegir una al azar
            if(interHandler.choiceAvailable){
                randomDirection(posX, posY);
            }
            if(haveShield == false) {
                mainLayer.sprite.setColor(new cc.Color(255, 255, 255, 0));
            }

            //Si ya está dentro del tile, se disminuye el valor el contador collisionDelay
        }else{
            if(interHandler.choiceExecuted) return 1;

            //Si se acabo el delay se ejecuta la acción y se cambia de direccion
            if(collisionDelay==0){
                interHandler.executeChoice();
                var array = updatePosition();
                xNew = array[0];
                yNew = array[1];
            }
            //Si el delay es negativo, se debe retroceder la cantidad excedida en la direccion contraria
            else if(collisionDelay - speed<0){
                var excess = speed - collisionDelay;
                collisionDelay = 0;
                switch(direction){
                    case 0:
                        yNew -= excess;
                        break;
                    case 1:
                        yNew += excess;
                        break;
                    case 2:
                        xNew += excess;
                        break;
                    case 3:
                        xNew -=excess;
                        break;
                }
            }
            else{
                //Delay para activar la decision tomada por el jugador
                collisionDelay =collisionDelay - speed ;
            }
        }
        return 0;
    }

    var randomDirection = function(posX, posY) {
        var ScannerSize = 1;
        var direction = getCurrentDirection();

        switch(direction) {
            case 0 :
                posY-=ScannerSize;
                break;
            case 1 :
                posY+=ScannerSize;
                break;
            case 2 :
                posX-=ScannerSize;
                break;
            case 3 :
                posX+=ScannerSize;
                break;
        }

        var possibleMovements = gameplayMap.getPossibleChoices(posX,posY,direction, false)
        var random = Math.random();
        var realRandom = parseInt(random*possibleMovements.length);
        var lastMov = possibleMovements[realRandom];

        var keyCode = -1;
        switch(lastMov) {
            case 1:
                keyCode = cc.KEY.down;
                break;
            case 0:
                keyCode = cc.KEY.up;
                break;
            case 2:
                keyCode = cc.KEY.left;
                break;
            case 3:
                keyCode = cc.KEY.right;
                break;
        }
        interHandler.recordChoice(keyCode);
    }

    //Metodo principal de movimiento
    pub.update = function(){
        if(!gameplayMap.gameStarted){
            if(zoomGame.autoZoomIn()) return;
            else{
                gameplayMap.gameStarted = true;
                ChildSM.startRunning();
                currentGameplayScene.startMaze();
            }
        }

        if(ChildSM.isStopped()) return;

        var sprite = mainLayer.sprite;
        var monstruo = mainLayer.monster;
        pub.childPosX = sprite.getPositionX();
        pub.childPosY = sprite.getPositionY();

        var monstX = monstruo.getPositionX();
        var monstY = monstruo.getPositionY();
        var lastMov = -1;

        //Se halla la nueva posición del niño
        var array =updatePosition();
        xNew = array[0];
        yNew = array[1];

        var spriteWidth = sprite.width;
        var rect1 = cc.rect(xNew-spriteWidth/2,yNew - spriteWidth/2,spriteWidth,spriteWidth);

        var posX = mainLayer.getMatrixPosX(pub.childPosX, tileWidth);
        var posY = mainLayer.getMatrixPosY(pub.childPosY, tileWidth);

        //Condicion de victoria
        if(posX == mainLayer.finishPoint[0] && posY == mainLayer.finishPoint[1]){
            alert("YOU WIN! Your get " + gameplayMap.coins);
            close();
        }

        var direction = getCurrentDirection();

        //Se ejecuta el método de scan de intersecciones.
        interHandler.detectIntersection(posX,posY,direction, mainLayer.tileMatrix);

        //Si la elección ya se ejecuto, se debe esperar a salir completamente del tile de interseccion
        if(interHandler.choiceExecuted==true){
            var collBox = cc.rect(pub.childPosX-sprite.width/2,pub.childPosY - sprite.height/2,30,30);
            if(!cc.rectIntersectsRect(collBox,interHandler.intersectTile.rect)){
                interHandler.intersectionExited();
            }
        }

        //Verificacion de colisión
        for(var i=1; i < mainLayer.obstacles.length ; i++ ){
            var tile = mainLayer.obstacles[i];
            var rectM = gameplayMap.monster.getBoundingBox();
            rectM.height = rectM.height*0.9;

            if(cc.rectIntersectsRect(rect1,tile.rect)){
                //Si choca contra un powerup
                if('powerup' in tile){
                    executePowerup(tile);
                    continue;
                }

                //Si choca contra una trampa
                if('trap' in tile){
                    if(haveShield == false) {
                        executeTrap(tile);
                        if(tile.trap == 1) return;
                    }

                    break
                }

                //Si choca contra un collectable
                if('collectable' in tile){
                    pickCollectable(tile);
                    continue;
                }

                //Si choca con una interseccion
                if(tile.typeTerr == 2){
                    var result = interCollision(direction, rect1, tile, posX, posY);
                    if(result==0)break;
                    else continue;
                }

                if(!isTrueCollision(rect1, tile.rect)) return;

                //Frenar
                stopMovement();

                var possibleMovements = gameplayMap.getPossibleChoices(posX,posY, direction,false);

                var random = Math.random();
                var realRandom = parseInt(random*possibleMovements.length);

                pub.keyState[possibleMovements[realRandom]]= 1;
                lastMov = possibleMovements[realRandom];
                return;
            }

            if(cc.rectIntersectsRect(rectM,rect1)){
                gameplayMap.gameOver(true);
                return;
            }
        }
        monstY+=clockController.getSpeed();
        mainLayer.sprite.setPosition(xNew,yNew);
        monstruo.setPosition(monstX,monstY);
    }

    return pub;

})();


var GameplayMap = cc.TMXTiledMap.extend({
    scoreLabel:0,
    sprite:null,
    gameStarted:false,
    monster:null,
    finishPoint: null,
    tileMatrix:null,
    collectables: null,
    willPoints:0,
    coins:0,
    intersections: [],
    currentTime:null,
    
    ctor:function (levelName) {
        this._super();
        this.initWithTMXFile("res/" + levelName);

        var mapHeight = this.getMapSize().height;
        var mapWidth = this.getMapSize().width;
        var tileWidth= this.getTileSize().height;
        childMoveAction.init(tileWidth);
        var size = cc.winSize;

        this.obstacles = [];
        this.collectables=new Array(0,0,0,0,0);
        this.willPoints = 2;
        this.initTileMatrix();
        this.initObstacles();

        this.sprite= new cc.Sprite("#ninoPost1.png");
        this.sprite.setVisible(false);

        this.monster = new cc.Sprite("#monstruo1.png");
        this.monster.setOpacity(0);
        var cSize = this.monster.getContentSize();
        var monsterScale = mapWidth*32/cSize.width;
        this.monster.setScale(monsterScale);
        this.monster.setContentSize(cSize.width*monsterScale, cSize.height*monsterScale);
        this.monster.setPosition(cc.p(mapWidth*32/2, - cSize.height*monsterScale/2 - 50));
        ChildSM.runMonsterAnimation(this.monster);

        this.scoreLabel = new cc.LabelTTF(this.coins,'Arial', 18, cc.size(110,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        this.scoreLabel.setPosition(this.sprite.getPositionX(), this.sprite.getPositionY() + 40);
        this.currentTime = new Date();

        ChildSM.setChild(this.sprite);

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
        this.initStartnFinish();

        //Se crea el listener para el teclado, se podria usar tambien un CASE en vez de IFs
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed:  function(keyCode, event){
                //Si presiona la barra espaciadora, se registra el salto
                if(keyCode == 32 && HoleController.canJump && !HoleController.jumped){
                    HoleController.jumped = true;
                }else if(keyCode == 13){
                    //se mostrará el modal de Pausa, además se quitará el gameplay fueran del schedule
                    PauseModalC.show();


                }

                if(!interHandler.choiceAvailable) return;
                interHandler.recordChoice(keyCode);
            },

            onKeyReleased: function(keyCode, event){

                if(BoardController.isActivated() && keyCode>=65 && keyCode<=90){
                    var letter = String.fromCharCode(keyCode);
                    BoardController.keyboardInput(letter);
                }

                if(MeshController.isActivated())
                    MeshController.keyboardInput(keyCode);

            }

        }, this);
        return true;
    },

    initObstacles : function() {
        var mapWidth = this.getMapSize().width;
        var mapHeight = this.getMapSize().height;
        var tileWidth = this.getTileSize().width;
        var tileHeight = this.getTileSize().height;
        var tileProps = this._tileProperties;

        var collidableLayer = this.getLayer("Collision");
        var intersectionLayer = this.getLayer("Intersection");
        var collectableLayer = this.getLayer("Collectables");
        var powerupLayer = this.getLayer("Powerups");
        var trapLayer = this.getLayer("Traps");

        var i, j;

        for (i = 0; i < mapWidth; i++) {
            for (j = 0; j < mapHeight; j++) {
                var tileCoord = new cc.Point(i, j);
                var tileXPosition = i * tileWidth;
                var tileYPosition = (mapHeight * tileHeight)
                    - ((j + 1) * tileHeight);

                //Paredes
                var gid = collidableLayer.getTileGIDAt(tileCoord);
                if (gid) {
                    var cTile = {};
                    cTile.typeTerr = 1;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                    this.tileMatrix[i][j]=1;
                }

                //Intersecciones
                gid = intersectionLayer.getTileGIDAt(tileCoord);
                if (gid) {
                    cTile = {};
                    cTile.typeTerr = 2;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                    this.intersections.push(cTile);
                    this.tileMatrix[i][j]=2;
                }

                //Powerups
                gid = powerupLayer.getTileGIDAt(tileCoord);
                if (gid) {
                    if(!(gid in tileProps)) continue;
                    var tilePropEntry = tileProps[""+gid];
                    if(!('powerupId' in tilePropEntry)) continue;

                    var idPowerup = tilePropEntry['powerupId'];

                    cTile = {};
                    cTile.powerup = idPowerup;
                    cTile.x = i;
                    cTile.y = j;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                }

                //Traps
                gid = trapLayer.getTileGIDAt(tileCoord);
                if (gid) {
                    if(!(gid in tileProps)) continue;
                    var tilePropEntry = tileProps[""+gid];
                    if(!('trapId' in tilePropEntry)) continue;

                    var idTrap = tilePropEntry['trapId'];

                    cTile = {};
                    cTile.trap = idTrap;
                    cTile.x = i;
                    cTile.y = j;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    if(idTrap == 1) this.tileMatrix[i][j] = 3;

                    this.obstacles.push(cTile);
                }

                //Collectables
                gid = collectableLayer.getTileGIDAt(tileCoord);
                if (gid) {
                    if(!(gid in tileProps)) continue;
                    var tilePropEntry = tileProps[""+gid];
                    if(!('collectableId' in tilePropEntry)) continue;

                    var idCollectable = tilePropEntry['collectableId'];

                    cTile = {};
                    cTile.collectable = idCollectable;
                    cTile.x = i;
                    cTile.y = j;
                    cTile.rect = cc.rect(tileXPosition, tileYPosition,
                        tileWidth, tileHeight);

                    this.obstacles.push(cTile);
                }

            }
        }

    },

    //Método de inicialización de los puntos de inicio y fin
    initStartnFinish : function (){
        var startFinishLayer = this.getLayer("StartFinish");
        var tileWidth = this.getTileSize().width;
        var start = startFinishLayer.properties.start.split(",");
        this.sprite.setPosition(start[0]*tileWidth + tileWidth/2 , (this.getMapSize().height - start[1] -1)*tileWidth + tileWidth/2 );
        this.finishPoint = startFinishLayer.properties.finish.split(",");
    },

    //Inicialización de la matriz de tiles
    initTileMatrix : function(){
        var mapWidth = this.getMapSize().width;
        var mapHeight = this.getMapSize().height;
        var tileWidth = this.getTileSize().width;
        this.tileMatrix = new Array(mapWidth);

        for (var i=0;i<mapWidth;i++){
            this.tileMatrix[i] = new Array(mapHeight);
        }

        for(var i=0;i<mapWidth;i++){
            for(var j=0;j<mapHeight;j++){
                this.tileMatrix[i][j]=0;
            }
        }
    },

    getPossibleChoices: function(posX, posY, dir, incInverse){
        var movements = new Array(0,0,0,0);
        var lastMovInv=-1;
        switch(dir) {
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

        //Evalua posibles movimientos en caso de choque con pared
        if(posX<this.getMapSize().width-1 && this.tileMatrix[posX+1][posY]!=1) movements[3]=1; //derecha
        if(posX>0 && this.tileMatrix[posX-1][posY]!=1) movements[2]=1; //izquierda
        if(posY>0 && this.tileMatrix[posX][posY-1]!=1) movements[0]=1; //arriba
        if(posY<this.getMapSize().height-1 && this.tileMatrix[posX][posY+1]!=1) movements[1]=1; //abajo

        var possibleMovements = [];

        for(var i=0;i<4;i++) {
            if (movements[i] == 1 && (i!=lastMovInv || incInverse)) {
                possibleMovements.push(i);
            }
        }

        if(possibleMovements.length==0)
            possibleMovements.push(lastMovInv);

        return possibleMovements;
    },

    gameOver: function(byMonster){
        gameplayMap.unscheduleAllCallbacks();
        DefeatModalC.executeDefeat(byMonster);
    }

});

//Funcion para inicializar la osucridad que rodea al niño
function initFog(map){

    //Se carga el sprite que representa la oscuridad
    var fog = new cc.Sprite("res/GameFog.png");
    fog.setScale(1.25, 1.25);

    //El sprite que representa la oscuridad siempre esta encima del niño
    fog.setPosition(map.sprite.getPositionX(), map.sprite.getPositionY());
    fog.schedule(function (){
        this.setPositionX(gameplayMap.sprite.getPositionX());
        this.setPositionY(gameplayMap.sprite.getPositionY());
    });

    return fog;
};

var zoomGame = {

    //Funcion para generar el efecto de zoom sobre el mapa
    //typeZoom:     0 = in, 1 = out
    //zoom_Range:   indica el incremento del zoom
    //initZoom:     indica el zoom inicial del mapa
    //time_Zoom:    indica el tiempo de zoom
    ctor: function(type_Zoom, zoom_Range, time_Zoom, init_Zoom)
    {
        gameplayMap.setScale(init_Zoom);
        this.typeZoom = type_Zoom;
        this.zoomRange= zoom_Range;
        this.timeZoom = time_Zoom;
        this.scaleInit = init_Zoom;
        this.timeLeft = this.timeZoom;
        this.currentScale = init_Zoom;
        if(time_Zoom==0)
            this.zoomActivate = false;
    },

    autoZoomIn:function()
    {
        if(this.zoomActivate)
        {
            var date = new Date();
            var curDate = null;

            do { curDate = new Date(); }
            while(curDate-date < this.timeZoom);
            this.zoomActivate=false;
        }

        if(this.currentScale<1)
        {
            this.currentScale+=this.zoomRange;
            gameplayMap.setScale(this.currentScale);
            return true;
        }else
            return false;

    },

    zoomRange:0.01,
    typeZoom:1,
    scaleInit:1,
    currentScale:0.1,
    timeZoom:38000,
    timeLeft:38000,
    zoomActivate:true
}

var GameplayScene = cc.Scene.extend({
    gameplayLayer : null,
    hudLayer: null,
    fog : null,

    ctor: function(levelNum, cont){
        if(cont === undefined) cont = false;

        this._super();
        ChildSM.initSM();
        this.gameplayLayer = new cc.Layer();
        var root = ccs.load(res.gameHUD_json);
        this.hudLayer = root.node;

        var map = new GameplayMap("levels/Level" + levelNum + ".tmx");
        HoleController.exMark = new cc.Sprite(res.exMark_png);
        this.fog = initFog(map);
        this.fog.setVisible(false);

        gameplayMap = map;
        if(cont) this.configContinue(levelNum);
        this.gameplayLayer.addChild(map,0);
        this.gameplayLayer.addChild(map.sprite, 5);
        this.gameplayLayer.addChild(map.monster, 10);
        this.gameplayLayer.addChild(this.fog, 20);
        this.gameplayLayer.addChild(map.scoreLabel,20);

        //inicializo el zoom
        zoomGame.ctor(0,0.01,1600,0.280);

        //Se inicializa el modulo de movimiento del niño
        childMoveAction.setMainLayer(map);

        //Por ultimo, se añade el layer de gameplay a la scene, en el orden Z mas bajo.
        this.addChild(this.gameplayLayer, 0);
        this.addChild(this.hudLayer, 1);
        PauseModalC.load(this,gameplayMap);

    },

    onEnter:function () {
        this._super();
        currentGameplayScene = this;

        //Eventos Touch
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            // When "swallow touches" is true, then returning 'true' from the onTouchBegan method will "swallow" the touch event, preventing other listeners from using it.
            swallowTouches: true,
            //onTouchBegan event callback function
            onTouchBegan: function (touch, event) {

                if(lunchBoxController.isActivated())
                {
                    //Obtengo la posición X e Y respecto del mapa
                    // event.getCurrentTarget() returns the *listener's* sceneGraphPriority node.
                    var target = event.getCurrentTarget();

                    //Get the position of the current point relative to the button
                    var locationInNode = target.convertToNodeSpace(touch.getLocation());
                    var s = target.getContentSize();
                    var rect = cc.rect(0, 0, s.width, s.height);
                    //Check the click area
                    lunchBoxController.onClickMouse(locationInNode.x,locationInNode.y);
                }
            }

        },this.gameplayLayer);

        DefeatModalC.setParentScene(this);
        gameplayMap.schedule(childMoveAction.update);
    },

    startMaze: function(){
        gameplayMap.sprite.setVisible(true);
        gameplayMap.monster.runAction(cc.fadeIn(0.5));
        this.fog.setOpacity(0);
        this.fog.setVisible(true);
        this.fog.runAction(cc.fadeIn(1.5));
        this.gameplayLayer.runAction(cc.follow(gameplayMap.sprite));
        ChildSM.updateAnimation(gameplayMap.sprite,0);
    },

    configContinue: function(lvl){
        var lvlInfo = LevelGraphC.getLevelInfo(lvl);
        var monster = gameplayMap.monster;
        var child = gameplayMap.sprite;
        var tileWidth = gameplayMap.getTileSize().width;
        child.setPosition(lvlInfo.defeatPosX*tileWidth + tileWidth/2 ,
            (gameplayMap.getMapSize().height - lvlInfo.defeatPosY -1)*tileWidth + tileWidth/2 );
        monster.setPositionY(child.getPositionY() - monster.getContentSize().height/2 * 1.5);
    },

    customCleanup: function(){
        this.gameplayLayer.removeAllChildren();
        this.hudLayer.removeAllChildren();
        DefeatModalC.cleanup();
        this.removeAllChildren();
    }
});

