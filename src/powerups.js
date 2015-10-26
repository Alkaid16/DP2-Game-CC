//Los IDs de los powerups son: Zapato:1, Reloj:2, Antorcha:3, Escudo:4

var TorchController = (function(){
    //Variables de antorcha
    var duration = 4;
    var scaleFactor = 1.75;
    var transitionTime = 1.2;

    var pub = {};

    //Funcion de activacion de antorcha
    pub.activateTorch = function(){
        var fog = currentGameplayScene.fog;
        var currScaleX = fog.getScaleX();
        var currScaleY = fog.getScaleY();

        var scaleAction = cc.scaleTo(transitionTime,currScaleX*scaleFactor, currScaleY*scaleFactor);
        var scaleBackAction = cc.scaleTo(transitionTime,currScaleX, currScaleY);
        var delay = cc.delayTime(duration + transitionTime);
        var sequence = cc.sequence(new Array(scaleAction, delay, scaleBackAction));

        fog.runAction(sequence);
    }


    return pub;
})();