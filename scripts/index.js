function store() {
    var input = document.getElementById("input");
    var name = input.value;
    if(name.trim().length > 0){
        localStorage.setItem("gamer_name",name);
        window.location.href = ("game.html");
    }else{
        window.alert("Введите имя");
    }

}


