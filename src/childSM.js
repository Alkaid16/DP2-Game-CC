var ChildSM = (function(){
    var pub = {};
    var child;
    var dir = 0;
    //0:Stopped, 1:Running
    var state = 0;
    //Arreglo con las 4 animaciones para correr
    var runAnims;

    /*var animFrames = [];
    //Se crean los frames de la animaci?n
    for(var i=1;i<5;i++){
        var str = "res/Bola"+i+".png";
        var animFrame = new cc.AnimationFrame(new cc.SpriteFrame(str,cc.rect(0,0,30,30)), 1,null);
        animFrames.push(animFrame);
    }

    var animation = new cc.Animation(animFrames, 0.08, 100);
    var animate   = cc.animate(animation);*/

    pub.setDirection = function(direction){
        dir = direction;
    }

    pub.stop = function(){
        state = 0;
    }

    pub.startRunning = function(){
        state = 1;
    }

    pub.setChild = function(childObj){
        child = childObj
    }



    return pub;
})();
