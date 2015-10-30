// Los IDs de las trampas son: Huecos:0, Pizarra:1, Malla:2, Lonchera:3

function executeTrap(tile){
    var trapLayer = gameplayMap.getLayer("Traps");
    var idTrap = tile.trap;

    delete tile.trap;
    tile.rect.width=0;
    tile.rect.height=0;

    switch(idTrap){
        case '0':
            //TODO
            break;
        case '1':
            BoardController.activateBoard();
            break;
        case '2':
            MeshController.activateMesh();
            break;
        case '3':
            lunchBoxController.activateLunchBox();
            break;
    }

    trapLayer.setTileGID(0,tile.x,tile.y);
    trapLayer.removeTileAt(cc.p(tile.x,tile.y));
}

var BoardController = (function(){
    //Variables de pizarra
    var words = new Array("RESPETO", "CONFIANZA", "SOLIDARIDAD", "AMOR", "TOLERANCIA");
    var labelTyped;
    var started = false;
    var label;
    var selWord;
    var charPos;

    var pub = {};

    var boardCleanup = function(){
        label.removeFromParent();
        labelTyped.removeFromParent();
        ChildSM.startRunning();
        started = false;
    }

    //Funcion de activacion de antorcha
    pub.activateBoard = function(){
        ChildSM.stop();
        charPos = 0;
        var rand = parseInt(Math.random()*words.length);
        selWord = words[rand];
        label = new cc.LabelTTF(selWord, 'Arial', 18, cc.size(120,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        labelTyped = new cc.LabelTTF("", 'Arial', 18, cc.size(120,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        labelTyped.setColor(new cc.Color(255,0,0));

        label.setPosition(gameplayMap.sprite.getPositionX(), gameplayMap.sprite.getPositionY() + 40);
        labelTyped.setPosition(gameplayMap.sprite.getPositionX(), gameplayMap.sprite.getPositionY() + 40);
        currentGameplayScene.gameplayLayer.addChild(label,20);
        currentGameplayScene.gameplayLayer.addChild(labelTyped,21);
        started = true;

        setTimeout(boardCleanup, 8000);
    }

    pub.keyboardInput = function(letter){
        if(letter[0] == selWord[charPos]){
            labelTyped.setString(labelTyped.getString() + selWord[charPos]);
            charPos++;
            if(charPos==selWord.length){
                boardCleanup();
                return;
            }
        }else{
            labelTyped.setString("");
            charPos=0;
        }
    }

    pub.isActivated = function(){
        return started;
    }

    return pub;
})();

var MeshController = (function(){
    //Variables de malla
    var numArrows=10;
    var arrowsCombination = {};
    var started = false;

    var arrowsImg = {};
    var arrowsImgPress = {};
    var arrowsImgCtrl = {};
    var arrowsImgPressCtrl = {};

    var pub = {};
    var currentArrow;

    var boardCleanup = function(){

        //Remueve todos los sprites restantes
        for(var i=0; i<numArrows; i++)
        {
            if(arrowsImgCtrl[i]==1)
                currentGameplayScene.gameplayLayer.removeChild(arrowsImg[i]);

            if(arrowsImgPressCtrl[i]==1)
                currentGameplayScene.gameplayLayer.removeChild(arrowsImgPress[i]);
        }
        ChildSM.startRunning();
        started = false;
    }

    var createArrayArrow = function()
    {
        for(var i=0;i<numArrows;i++)
            arrowsCombination[i]= parseInt(Math.random()*4);
    }

    //Funcion de activacion de malla
    pub.activateMesh = function(){

        ChildSM.stop();
        createArrayArrow();
        currentArrow=0;

        //Inserta en pantalla las flechas

        for(var i=0; i<numArrows; i++)
        {
            //Variables de Control
            //1 = usado, 0 = sin usar
            arrowsImgCtrl[i] = 1;
            arrowsImgPressCtrl[i] = 0;

            //Carga de imágenes según la flecha aleatoria cargada anteriormente
            switch(arrowsCombination[i])
            {
                case 0:
                    arrowsImg[i] = new cc.Sprite("res/up.png");
                    arrowsImgPress[i] = new cc.Sprite("res/upPress.png");
                    break;
                case 1:
                    arrowsImg[i] = new cc.Sprite("res/down.png");
                    arrowsImgPress[i] = new cc.Sprite("res/downPress.png");
                    break;
                case 2:
                    arrowsImg[i] = new cc.Sprite("res/left.png");
                    arrowsImgPress[i] = new cc.Sprite("res/leftPress.png");
                    break;
                case 3:
                    arrowsImg[i] = new cc.Sprite("res/right.png");
                    arrowsImgPress[i] = new cc.Sprite("res/rightPress.png");
                    break;
            }
            arrowsImg[i].setScale(0.4);
            var posX;
            //Definición de la posicíon de cada uno de los Sprites
            if(i<parseInt(numArrows/2))
            {
                posX= gameplayMap.sprite.getPositionX() - 50*(parseInt(numArrows/2)-i-1)-25;
            }else
                posX= gameplayMap.sprite.getPositionX() + 50*(i-parseInt(numArrows/2)+1)-25;

            arrowsImg[i].setPosition(posX, gameplayMap.sprite.getPositionY()+50);
            currentGameplayScene.gameplayLayer.addChild(arrowsImg[i],20+i);
        }

        started = true;
        setTimeout(boardCleanup, 8000);
    }

    pub.keyboardInput = function(keyPress){

        //up    0
        //down  1
        //left  2
        //right 3

        var arrowPress;

        switch(keyPress)
        {
            case 38:
                arrowPress=0;
                break;
            case 40:
                arrowPress=1;
                break;
            case 37:
                arrowPress=2;
                break;
            case 39:
                arrowPress=3;
                break;
        }

        if(arrowPress==arrowsCombination[currentArrow])
        {
            //Remuevo el sprite en la posición vigente
            arrowsImgCtrl[currentArrow] = 0;
            arrowsImgPressCtrl[currentArrow] = 1;
            currentGameplayScene.gameplayLayer.removeChild(arrowsImg[currentArrow]);

            //Preparo el sprite de reemplazo
            arrowsImgPress[currentArrow].setScale(0.4);
            var posX;
            if(i<parseInt(numArrows/2))
            {
                posX= gameplayMap.sprite.getPositionX() - 50*(parseInt(numArrows/2)-currentArrow-1)-25;
            }else
                posX= gameplayMap.sprite.getPositionX() + 50*(currentArrow-parseInt(numArrows/2)+1)-25;

            arrowsImgPress[currentArrow].setPosition(posX, gameplayMap.sprite.getPositionY()+50);
            currentGameplayScene.gameplayLayer.addChild(arrowsImgPress[currentArrow],20+currentArrow);

            currentArrow++;
        }

        if(currentArrow==numArrows)
        {
            boardCleanup();
            started = false;
        }

    }

    pub.isActivated = function(){
        return started;
    }

    return pub;
})();

var lunchBoxController = (function(){

    //Variables de lonchera
    var started = false;

    var numSprites=6;

    var numBoxBoard;
    var boxBoardCtrol = {};
    var flagChargeBox = false;
    var numBoxBoardUsed;//Esta variable indica la cantidad de Box usados

    var spritesLunchBox = {};
    var flagNutritious = {};//Indica si el alimento es nutritivo| 0 = No nutritivo, 1 = Nutritivo
    var spritesLunchBoxCtrl = {};//Usado para indicar que Sprites se encuentran o no activos
    var posXLunchBox = {};
    var posYLunchBox = {};
    var flagChargeSprites = false;

    var pub = {};

    //Esta función unicamente carga los spritres
    var chargeSprites = function(){

        spritesLunchBox[0] = new cc.Sprite("res/apple.png");
        flagNutritious[0]=1;
        spritesLunchBox[1] = new cc.Sprite("res/banana.png");
        flagNutritious[1]=1;
        spritesLunchBox[2] = new cc.Sprite("res/jugo.png");
        flagNutritious[2]=1;
        spritesLunchBox[3] = new cc.Sprite("res/chocolate.png");
        flagNutritious[3]=0;
        spritesLunchBox[4] = new cc.Sprite("res/candy.png");
        flagNutritious[4]=0;
        spritesLunchBox[5] = new cc.Sprite("res/sandwich.png");
        flagNutritious[5]=1;

        flagChargeSprites = true;
    }

    //función que tiene como objetivo dividir la pantalla en segmentos para luego insertar los objetos
    //Pizarra de 640*640
    var prepareBoard = function()
    {
        var W = 640;
        var H = 640;
        //Aproximado de wxh = 100x100
        var aproxWH=100;
        //Num de Espacios
        numBoxBoard = parseInt(W/aproxWH)*parseInt(H/aproxWH);

        for(var i=0; i<numBoxBoard; i++)
            boxBoardCtrol=0;


        numBoxBoardUsed=0;

        flagChargeBox = true;
    }

    var boardCleanup = function(){

        for(var i=0;i<numSprites;i++) {
            if(spritesLunchBoxCtrl[i]==1)
                currentGameplayScene.gameplayLayer.removeChild(spritesLunchBox[i]);
        }

        ChildSM.startRunning();
        started = false;
    }

    //Funcion de activacion de lonchera
    pub.activateLunchBox = function(){

        ChildSM.stop();
        //Carga de los Sprites
        if(!flagChargeSprites)
            chargeSprites();
        if(!flagChargeBox)
            prepareBoard();

        //Generación aleatoria de las posiciones
        for(var i=0;i<numSprites;i++)
        {
            spritesLunchBoxCtrl[i]=1;
            spritesLunchBox[i].setScale(0.4);

            //Se escoge una posición vacía de forma aleatoria
            var rand= parseInt(Math.random()*(numBoxBoard.length-numBoxBoardUsed));
            var posBox=0;

            for(var i=0;i<numBoxBoard.length;i++)
            {
                if(numBoxBoard[i]==1)
                    posBox++;

                if(posBox==rand)
                    break;
            }

            var PosX = gameplayMap.sprite.getPositionX()+(randXLeft==1?1:-1)*randX;
            var PosY = gameplayMap.sprite.getPositionY()+(randYRight==1?1:-1)*randY;

            posXLunchBox[i] = PosX;
            posYLunchBox[i] = PosY;

            spritesLunchBox[i].setPosition(PosX, PosY);
            currentGameplayScene.gameplayLayer.addChild(spritesLunchBox[i],30+i);
        }

        started = true;
        setTimeout(boardCleanup, 8000);
    }

    pub.keyboardInput = function(keyPress){



            boardCleanup();
            started = false;

    }

    pub.isActivated = function(){
        return started;
    }

    return pub;
})();