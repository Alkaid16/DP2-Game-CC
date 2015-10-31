// Los IDs de las trampas son: Huecos:1, Pizarra:2, Malla:3, Lonchera:4

function executeTrap(tile){
    var trapLayer = gameplayMap.getLayer("Traps");
    var idTrap = tile.trap;

    switch(idTrap){
        case '1':
            //HoleController.activateHole();
            break;
        case '2':
            BoardController.activateBoard();
            break;
        case '3':
            MeshController.activateMesh();
            break;
        case '4':
            lunchBoxController.activateLunchBox();
            break;
    }

    if(idTrap!=1){
        delete tile.trap;
        tile.rect.width=0;
        tile.rect.height=0;
        trapLayer.setTileGID(0,tile.x,tile.y);
        trapLayer.removeTileAt(cc.p(tile.x,tile.y));
    }
}

function loseWillPoint(){
    gameplayMap.willPoints -= 1;
    var points = [];
    var count = gameplayMap.willPoints;
    points[0] = currentGameplayScene.hudLayer.getChildByName("pnlWillPoint").getChildByName("wp1");
    points[1] = currentGameplayScene.hudLayer.getChildByName("pnlWillPoint").getChildByName("wp2");

    for(var i=0; i<points.length; i++){
        if(count>0){
            points[i].setVisible(true);
            count--;
        }else{
            points[i].setVisible(false);
        }
    }
}

var BoardController = (function(){
    //Variables de pizarra
    var words = new Array("RESPETO", "CONFIANZA", "SOLIDARIDAD", "AMOR", "TOLERANCIA", "HONESTIDAD");
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
        label = new cc.LabelTTF(selWord, 'Arial', 18, cc.size(110,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        labelTyped = new cc.LabelTTF("", 'Arial', 18, cc.size(110,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
        labelTyped.setColor(new cc.Color(255,0,0));

        label.setPosition(gameplayMap.sprite.getPositionX(), gameplayMap.sprite.getPositionY() + 40);
        labelTyped.setPosition(gameplayMap.sprite.getPositionX(), gameplayMap.sprite.getPositionY() + 40);
        currentGameplayScene.gameplayLayer.addChild(label,20);
        currentGameplayScene.gameplayLayer.addChild(labelTyped,21);
        started = true;

        setTimeout(function(){
            if(pub.isActivated()) loseWillPoint();
            boardCleanup();
        }, 6000);
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

/*var HoleController = (function(){

    var pub = {};
    var sizeFactor = 1.20;
    var keycode = this.storedDecision;
    var scX = jump.getScaleX();
    var scY = jump.getScaleY();

    var resetSprite = function(){
        var jump = gameplayMap.sprite;
        jump.scaleX = scX;
        jump.scaleY = scY;
    }

    pub.activateHole = function(){
        var jump = gameplayMap.sprite;
        if (keycode == cc.KEY.space){
            jump.scaleX *= sizeFactor;
            jump.scaleY *= sizeFactor;
        }
        setTimeout(resetSprite,1000);
    }
    return pub;


})();*/

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
            //Definición de la posicúŒn de cada uno de los Sprites
            if(i<parseInt(numArrows/2))
            {
                posX= gameplayMap.sprite.getPositionX() - 50*(parseInt(numArrows/2)-i-1)-25;
            }else
                posX= gameplayMap.sprite.getPositionX() + 50*(i-parseInt(numArrows/2)+1)-25;

            arrowsImg[i].setPosition(posX, gameplayMap.sprite.getPositionY()+50);
            currentGameplayScene.gameplayLayer.addChild(arrowsImg[i],20+i);
        }

        started = true;
        setTimeout(function(){
            if(pub.isActivated()) loseWillPoint();
            boardCleanup();
        }, 5500);
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

    var numBoxBoard;//Cantidad de espacios en los que se ha dividido la pantalla
    var boxBoardCtrol = {};//Esta variable indica si la posición ha sido usada| -1 = no usada, otro valor es el índice de spritesLunchBox
    var flagChargeBox = false;
    var numBoxBoardUsed;//Esta variable indica la cantidad de Box usados

    var numElmentNutri;//Numero de elementos nutritivos
    var numRemElmentNutri;//Numero de elementos nutritivos restantes

    var boxXinf = {};
    var boxYinf = {};

    var spritesLunchBox = {};
    var flagNutritious = {};//Indica si el alimento es nutritivo| 0 = No nutritivo, 1 = Nutritivo
    var spritesLunchBoxCtrl = {};//Usado para indicar que Sprites se encuentran o no activos

    var flagChargeSprites = false;

    //cantidad de filas y columnas en la que se ha divido la pantalla

    var rows;
    var colu;

    //aprox de HxW de los sprites
    var aproxWH;
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

        numElmentNutri = 4;
        numRemElmentNutri = 4;
        flagChargeSprites = true;
    }

    //función que tiene como objetivo dividir la pantalla en segmentos para luego insertar los objetos
    //Pizarra de 600*600
    var prepareBoard = function(){
        var W = 640;
        var H = 640;
        //Aproximado de wxh = 100x100
        aproxWH = 100;
        //Num de Espacios
        rows = parseInt(H/aproxWH);
        colu = parseInt(W/aproxWH);
        numBoxBoard = rows*colu;

        var currentRow = 0;
        var currentColumn = 0;

        var X00 = gameplayMap.sprite.getPositionX() - parseInt(W/2);
        var Y00 = gameplayMap.sprite.getPositionY() - parseInt(H/2);

        console.log(gameplayMap.sprite.getPositionX()+" - "+gameplayMap.sprite.getPositionY());
        console.log(X00+" - "+Y00);

        for(var i=0; i<numBoxBoard; i++)
        {
            boxBoardCtrol[i]=-1;

            boxXinf[i] = X00 + currentColumn   *   aproxWH;
            boxYinf[i] = Y00 + currentRow*   aproxWH;

            currentColumn++;

            if(currentColumn==colu)
            {
                currentRow++;
                currentColumn = 0;
            }
            console.log(boxXinf[i]+" - "+boxYinf[i])
        }

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
            //Esto en base a la cantidad de espacios en los que se ha divido la pizarra
            //menos la cantidad de posiciones usadas, luego se escoge la posición ignorando las posiciones que fueron usadas
            var rand= parseInt(Math.random()*(numBoxBoard-numBoxBoardUsed));
            var posBox=0;

            for(var j=0;j<numBoxBoard;j++)
            {
                console.log(boxBoardCtrol[j]);
                if(boxBoardCtrol[j]==-1)
                    posBox++;

                if(posBox==rand)
                {
                    //En esta variable se guarda el índice del Sprite usado en la pizarra
                    boxBoardCtrol[j]=i;
                    numBoxBoardUsed++;
                    posBox=j;
                    break;
                }

            }
            console.log(posBox);
            spritesLunchBox[i].setPosition(boxXinf[posBox]+aproxWH/2, boxYinf[posBox]+aproxWH/2);
            currentGameplayScene.gameplayLayer.addChild(spritesLunchBox[i],30+i);
        }

        started = true;
        setTimeout(function(){
            if(pub.isActivated())loseWillPoint();
            boardCleanup();
        }, 8000);
    }

    pub.onClickMouse = function(xCord, yCord){


        //Obtengo el box en el que se ha realizado el click

        var boxSelected=-1;

        for(var i=0;i<numBoxBoard;i++)
        {
            if(boxXinf[i]<xCord && (boxXinf[i]+aproxWH)>=xCord)
                if(boxYinf[i]<yCord && (boxYinf[i]+aproxWH)>=yCord)
                {
                    boxSelected = i;
                    break;
                }
        }

        var elementSelected=-1;

        if(boxBoardCtrol[boxSelected]!=-1)
            elementSelected=boxBoardCtrol[boxSelected];

        //Verifico que sea un alimento saludable
        if(elementSelected!=-1)
            if(flagNutritious[elementSelected]==1){
                //En este caso el elemtno es retirado de pantalla
                currentGameplayScene.gameplayLayer.removeChild(spritesLunchBox[elementSelected]);
                numRemElmentNutri--;

                //Caso en que sea el ultimo elemento
                //Caso Win
                if(numRemElmentNutri==0)
                {
                    boardCleanup();
                    started = false;
                    console.log("ganaste");
                }

            }else//Caso en que un elemento no sea saludable
            {
                console.log("Este no es un elemento nutritivo");
            }
    }

    pub.isActivated = function(){
        return started;
    }

    return pub;
})();