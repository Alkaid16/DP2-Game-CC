var WSHandler = (function(){
    var pub = {};

    //Funcion que obtiene el objeto Player, con toda la informacion del jugador. Si la llamada falla, se retorna -1.
    pub.getPlayerInfo= function(fbID){
        var func = $.ajax({
            url: "http://200.16.7.111/afiperularavel/public/game/player?idFacebook=" + fbID + "",
            dataType: "json",
            crossDomain: true,
            success: function (data){
                var player = data;
                func.player = player;
            },
            error: function(xhr){
                return -1;
            }

        });
        return func;
    };

    //Funcion para registrar un nuevo jugador en la base de datos
    pub.registerPlayer = function(player){
        $.ajax({
            url: "http://200.16.7.111/afiperularavel/public/game/player",
            type: "POST",
            crossDomain: true,
            data: JSON.stringify(player),
            contentType: "application/json",
            complete: function(){
                return 1;
            }
        });

        return -1;
    };

    pub.getLevelGraph= function(idPlayer){
        var func = $.ajax({
            url: "http://200.16.7.111/afiperularavel/public/game/level/graph?idPlayer=" + idPlayer + "",
            dataType: "json",
            crossDomain: true,
            success: function (data){
                levelGraph = data;
            },
            error: function(xhr){
                return -1;
            }
        });
        return func;
    };

    return pub;
})();
