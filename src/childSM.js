var ChildSM = (function(){
    var pub = {};
    var child;
    var currDir = -1;
    //0:Stopped, 1:Running
    var state = 0;
    //Arreglo con las 4 animaciones para correr
    var runAnims = [];

    pub.initAnimations= function(){
        cc.spriteFrameCache.addSpriteFrames(res.spritesheetNino_plist);
        loadAnimation(1,8,"ninoFrente");
        loadAnimation(1,8,"ninoPost");
        loadAnimation(1,9,"ninoPerf");
    }

    function loadAnimation(ini, end, name){
        var animation;
        var animFrames = [];

        for(var i=ini;i<end+1;i++){
            var str = name+i+".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            frame.setOriginalSize(cc.size(30,30));
            animFrames.push(frame);
        }
        animation = new cc.Animation(animFrames, 0.05, 100);
        runAnims.push(cc.animate(animation));
    }

    pub.setDirection = function(direction){
        dir = direction;
    }

    pub.isStopped = function(){
        return state==0;
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

    pub.runAnimation= function(sprite, index){
        sprite.runAction(runAnims[index]);
    }

    pub.updateAnimation = function(sprite,dir){
        if(currDir==dir) return;
        currDir = dir;
        sprite.stopAllActions();
        switch(dir){
            case 0:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,1);
                break;
            case 1:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,0);
                break;
            case 2:
                sprite.setFlippedX(true);
                pub.runAnimation(sprite,2);
                break;
            case 3:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,2);
                break;
        }
        sprite.setScaleY(40/sprite.getTextureRect().height);
        sprite.setScaleX(0.9);
        var anchor = sprite.getAnchorPoint();
        anchor.y = 16/40;
        sprite.setAnchorPoint(anchor);
    }



    return pub;
})();
