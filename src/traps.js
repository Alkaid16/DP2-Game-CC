// Los IDs de las trampas son: Huecos:1, Pizarra:2, Malla:3, Lonchera:4

function executeTrap(tile){
    var trapLayer = gameplayMap.getLayer("Traps");
    var idTrap = tile.trap;

    switch(idTrap){
        case '1':
            //TODO
            break;
        case '2':
            BoardController.activateBoard();
            break;
        case '3':
            //TODO
            break;
        case '4':
            //TODO
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
            boardCleanup();
            loseWillPoint();
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