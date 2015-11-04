var playerInfo;
var LevelGraphC = (function(){
    var levelGraph;
    var pub = {};

    pub.load = function(playerId){
        var ajax = WSHandler.getLevelGraph(playerId);
        $.when(ajax).done( function(){
            levelGraph = ajax.responseJSON.levels;
        });
    }

    pub.getLevelInfo = function(lvlNum){
        for(var i=0; i<levelGraph.length; i++){
            if(levelGraph[i].idLevel == lvlNum) return levelGraph[i];
        }
        return null;
    };

    return pub;
})();
