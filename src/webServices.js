var WSHandler = (function(){
    var pub = {};

    //Funcion que obtiene el objeto Player, con toda la informacion del jugador. Si la llamada falla, se retorna -1.
    pub.getPlayerInfo= function(fbID){
        $.ajax({
            url: "http://jsonplaceholder.typicode.com/posts/1",
            dataType: "json",
            success: function (data){
                var player = data;
                return player;
            },
            error: function(xhr){
                return -1;
            }

        });
    };

    //Funcion para registrar un nuevo jugador en la base de datos
    pub.registerPlayer = function(player){
        $.ajax({
            url: "alguna_url",
            type: "POST",
            data: JSON.stringify(player),
            contentType: "application/json",
            complete: function(){
                return 1;
            }
        });

        return -1;
    }

    return pub;
})();
