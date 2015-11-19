var playerInfo;

var fbAgent;
var fbToken;

var LevelGraphC = (function(){
    var levelGraph;
    var pub = {};
    var currLevel = null;

    pub.load = function(playerId){
        var ajax = WSHandler.getLevelGraph(playerId);
        $.when(ajax).done( function(){
            levelGraph = ajax.responseJSON.levels;
        });
    }

    pub.setLevelGraph = function(graph){
        levelGraph = graph;
    }

    pub.getLevelInfo = function(lvlNum){
        for(var i=0; i<levelGraph.length; i++){
            if(levelGraph[i].idLevel == lvlNum) {
                currLevel = levelGraph[i];
                return levelGraph[i];
            }
        }
        return null;
    };

    function getLevelInfo(lvlNum){
        for(var i=0; i<levelGraph.length; i++){
            if(levelGraph[i].idLevel == lvlNum) {
                currLevel = levelGraph[i];
                return levelGraph[i];
            }
        }
        return null;
    };

    pub.getCurrentLevel = function(){
        return currLevel;
    }

    pub.getCurrencyWeight = function(idCurrency){
        if(currLevel==null) return 1;
        var weights = currLevel.currencyWeight;
        for(var i=0; i<weights.length; i++){
            if(weights[i].idCurrency == idCurrency) return parseInt(weights[i].weight);
        }
        return 1;
    }

    pub.clearLevel = function(){
        var childLvls = pub.getCurrentLevel().childLevel;
        for(var i=0; i<childLvls.length; i++){
            getLevelInfo(childLvls[i].idLevel).unlocked = 1;
        }
    }

    return pub;
})();
