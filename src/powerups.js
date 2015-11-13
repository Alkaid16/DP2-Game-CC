//Los IDs de los powerups son: Zapato:4, Reloj:3, Antorcha:1, Escudo:2
//Collectables: Manzana:1, Libro:2, Cepillo:3, Botella:4, Pelota:5

function executePowerup(tile){
    var powerupLayer = gameplayMap.getLayer("Powerups");
    var idPowerup = tile.powerup;

    delete tile.powerup;
    tile.rect.width=0;
    tile.rect.height=0;

    switch(idPowerup){
        case '1':
            TorchController.activateTorch();
            break;
        case '2':
            ShieldController.activateShield();
            break;
        case '3':
            clockController.activateClock();
            break;
        case '4':
            ShoesController.activeShoes();
            break;
    }

    powerupLayer.setTileGID(0,tile.x,tile.y);
    powerupLayer.removeTileAt(cc.p(tile.x,tile.y));
}


function pickCollectable(tile){
    var collectableLayer = gameplayMap.getLayer("Collectables");
    var idCollectable = tile.collectable;
    var collVal = 10;
    console.log("id de objeto: " + idCollectable);
    var coinsLabel = new cc.LabelTTF(gameplayMap.coins,'Arial', 18, cc.size(110,40) ,cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER);


    delete tile.collectable;
    tile.rect.width=0;
    tile.rect.height=0;

    gameplayMap.collectables[idCollectable-1] += 1;

    collectableLayer.setTileGID(0,tile.x,tile.y);
    collectableLayer.removeTileAt(cc.p(tile.x,tile.y));
    gameplayMap.coins += LevelGraphC.getCurrencyWeight(idCollectable)*collVal;

    coinsLabel.setPosition(gameplayMap.sprite.getPositionX(), gameplayMap.sprite.getPositionY() + 40);
    currentGameplayScene.gameplayLayer.addChild(coinsLabel,20);
    var currentFontSize = coinsLabel.getFontSize();

    for(var i = 1;i<=currentFontSize;i++){
        (function (x) {
            setTimeout(function () {
                coinsLabel.setFontSize(currentFontSize - x);
            },i*100);
        })(i);
    }
}

function showScore(){
    var colectables = gameplayMap.collectables;
    var total = 0;
    for(var num in colectables){
        total = total + colectables[num]*100;
    }
    return total;
}


//objetivo: relantizar el objeto monstruo un tiempo n en milisengundos
var clockController = {

    activateClock: function(){
        this.flag_avtivatePowerUp=true;
    },

    getSpeed: function(){

        if(this.flag_avtivatePowerUp)
        {
            this.currentSpeed = this.monster_speed*(1-this.porcentajeDis/100);
            this.currentTime--;
            if(this.currentTime==0)
            {
                this.currentTime= this.timeMiliseg;
                this.flag_avtivatePowerUp=false;
                this.currentSpeed = this.monster_speed;
            }
        }

        return this.currentSpeed;
    },

    flag_avtivatePowerUp:false,
    timeMiliseg:200,
    currentTime:200,
    porcentajeDis:30,//Porcentaje de la velocidad que se disminuir? del monstruo
    monster_speed:0.75,
    currentSpeed:0.75
}


var TorchController = (function(){
    //Variables de antorcha
    var duration = 4;
    var scaleFactor = 1.40;
    var transitionTime = 1.2;
    var oScaleX = -1;
    var oScaleY =-1;

    var pub = {};

    //Funcion de activacion de antorcha
    pub.activateTorch = function(){
        var fog = currentGameplayScene.fog;
        if(oScaleX == -1){
            oScaleX = fog.getScaleX();
            oScaleY = fog.getScaleY();
        }

        var scaleAction = cc.scaleTo(transitionTime,oScaleX*scaleFactor, oScaleY*scaleFactor);
        var scaleBackAction = cc.scaleTo(transitionTime,oScaleX, oScaleY);
        var delay = cc.delayTime(duration + transitionTime);
        var sequence = cc.sequence(new Array(scaleAction, delay, scaleBackAction));
        fog.stopAllActions();
        fog.runAction(sequence);
    }


    return pub;
})();

var ShoesController = (function(){
    //se definen las variables
    var shoesFactor = 1.50;
    var delay = 5;
    var prevAction = null;
    var aux = -1;

    var pub = {};

    pub.resetPrevAction = function(){
        prevAction=null;
    }

    pub.activeShoes = function(){
        if(aux==-1) aux = childMoveAction.getSpeedSprite();
        childMoveAction.updateSpeed(aux*shoesFactor);
        var seqArr = new Array(cc.delayTime(delay),cc.callFunc(resetSpeed));
        var seq = cc.sequence(seqArr);
        if(prevAction!=null) gameplayMap.stopAction(prevAction);
        gameplayMap.runAction(seq);
        prevAction = seq;
    }

    var resetSpeed = function(){
        childMoveAction.updateSpeed(aux);
        ShoesController.resetPrevAction();
    }

    return pub;

}) ();

var ShieldController = (function(){
    var aux;
    var delay = 5;
    var prevAction = null;
    var shieldActivated = false;
    var pub = {};

    pub.isActivated = function(){
        return shieldActivated;
    }

    pub.setShieldState = function(state){
        shieldActivated = state;
    }

    pub.activateShield = function(){
        aux = gameplayMap.sprite;
        aux.setColor(new cc.Color(46, 138, 138, 1));
        shieldActivated = true;
        var seqArr = new Array(cc.delayTime(delay),cc.callFunc(resetShield));
        var seq = cc.sequence(seqArr);
        if(prevAction!=null) gameplayMap.stopAction(prevAction);
        gameplayMap.runAction(seq);
        prevAction = seq;
    }

    function resetShield(){
        aux.setColor(new cc.Color(255,255,255,0));
        shieldActivated = false;
    }

    return pub;


})();