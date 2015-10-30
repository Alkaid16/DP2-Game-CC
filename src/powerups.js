//Los IDs de los powerups son: Zapato:0, Reloj:1, Antorcha:2, Escudo:3

function executePowerup(tile){
    var powerupLayer = gameplayMap.getLayer("Powerups");
    var idPowerup = tile.powerup;

    delete tile.powerup;
    tile.rect.width=0;
    tile.rect.height=0;

    switch(idPowerup){
        case '0':
            //TODO
            break;
        case '1':
            clockController.activateClock();
            break;
        case '2':
            TorchController.activateTorch();
            break;
        case '3':
            //TODO
            break;
    }

    powerupLayer.setTileGID(0,tile.x,tile.y);
    powerupLayer.removeTileAt(cc.p(tile.x,tile.y));
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
    porcentajeDis:30,//Porcentaje de la velocidad que se disminuirá del monstruo
    monster_speed:0.75,
    currentSpeed:0.75,
};

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