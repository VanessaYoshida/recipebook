let database = firebase.database();
let USER_ID = window.location.search.match(/\?id=(.*)/)[1];

$(document).ready(function() {
    database.ref("users/"+USER_ID).once("value")
    .then(function(snapshot){
        let userInfo = snapshot.val();
        
            $("#welcome-name").text(userInfo.name);
    }).catch((error) => {
        $("#welcome-name").html("descubra novas receitas e compartilhe");
        }); 

    let getPostsBD = () => {
        database.ref('/posts/'+ USER_ID).once('value')
        .then((snapshot)  => {
            snapshot.forEach((childSnapshot)  => {
                
                let childKey = childSnapshot.key;
                let childtitle = childSnapshot.val().title;
                let childIngredients = childSnapshot.val().ingredients;
                let childText = childSnapshot.val().text;
                let childDate = childSnapshot.val().date;
                let childMethod = childSnapshot.val().postMessage;
                let childLike = childSnapshot.val().likes;
                
                createListPost(childtitle, childIngredients, childText, childDate, childMethod, childLike, childKey);
            })
        })
    }    
    getPostsBD()
    
    $('#post-text').on('keyup', () => {
        $('#send-button').prop('disabled', $('#post-text').val().length < 1);
    });
    $("#send-button").click(addPostsClick);
});

let date = () => {
    let dNow = new Date();
    let localdate = dNow.getDate() + '/' + (dNow.getMonth() + 1) + '/' + dNow.getFullYear() + ' ' + dNow.getHours() + ':' + dNow.getMinutes();
    return localdate;
}

let addPostsClick = (event) => {
    event.preventDefault();
    $('#send-button').attr('disabled', true);
    let titlePost = $("#title-recipe").val();
    let ingredientsPost = $("#ingredients").val();
    let newPost = $("#post-text").val();
    let newDate = date();
    let methodPost = $("[name=method-post]:checked").val();
    let like = 0;
    $("#title-recipe").val("");
    $("#ingredients").val("");
    $("#post-text").val("");
    let postBD = addPostsBD(titlePost, ingredientsPost, newPost, newDate, methodPost, like);
    let postKey = postBD.getKey();
    
    createListPost(titlePost, ingredientsPost, newPost, newDate, methodPost, like, postKey)
}

let addPostsBD = (titlePost, ingredientsPost, text, newDate, methodPost, like) => {
    return database.ref("posts/" + USER_ID).push({
        title: titlePost,
        ingredients: ingredientsPost,
        text: text,
        date: newDate,
        postMessage: methodPost,
        likes: like
    });
}

let createListPost = (titlePost, ingredientsPost, text, date, methodPost, likes, key) => {
    $("#post-list").prepend(`
    <li class="card my-4" data-new-post=${key}>
        <h5 class="card-header"> ${titlePost} </h5>
        <p class="card-body" data-ingredients-id=${key}> ${ingredientsPost} </p>
        
        <div class="container mb-4">
            <button type="button"
                class="btn btn-block btn-primary color-primary"
                data-toggle="modal"
                data-target="#modal-recipe-show">
                Ver a Receita Completa
            </button>

            <button
                data-like-id=${key}
                data-like-counter=${likes || 0}
                class="btn btn-block btn-primary">
                ${likes} Like
            </button>
            
            <button class="btn btn-block btn-primary" data-edit-id=${key}>
                Editar
            </button>
        
            <button
                type="button"
                class="btn btn-block btn-primary" 
                data-toggle="modal" 
                data-target="#modal + ${key}">
                Excluir
            </button>
            <div class="modal fade" id="modal + ${key}" tabindex="-1" role="dialog" aria-labelledby="modal-delete" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="modal-delete">Excluir Publicação</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
            Deseja mesmo excluir esta publicação? Depois de excluido não é possível recuperar as informações novamente.
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" btn-ok  data-delete-id=${key}>Apagar Publicação</button>
            </div>
            </div>
            </div>
            </div> 
            </div>

        <footer class="card-footer">
            <span date=${key}> Postado em ${date} </span>
            <span>- Modo ${methodPost}</span>
        </footer class="card-footer">

        <div id="modal-show-recipe">
            <div
                class="modal fade"
                id="modal-recipe-show"
                tabindex="-1"
                role="dialog"
                aria-labelledby="modal-recipe-showTitle"
                aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modal-recipe-showTitle"> ${titlePost} </h5>
    
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
    
                            </div>
    
                            <div class="modal-body"> 
                                <p>${ingredientsPost}</p>
                                <p>${text}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>
                            </div>
                    </div>
                </div>
            </div>
        </div>        
    </li>`);

    $(`button[data-delete-id="${key}"]`).click(() => {
        database.ref("posts/" + USER_ID + "/" + key).remove();
        let deletePost = $(`button[data-delete-id="${key}"]`);
        $(deletePost).parent().remove();
        window.location.reload();   
    });
    
    $(`button[data-like-id="${key}"]`).click(() => {
        let thisButton = $(`button[data-like-id="${key}"]`);
        let counter = thisButton.data('like-counter');
        counter++;
        database.ref("posts/" + USER_ID + "/" + key).update({
            likes: counter
        });
        thisButton.html(counter + " likes");
        thisButton.data('like-counter', counter);
    });
    
    $(`button[data-edit-id="${key}"]`).click(() => {
        let newText = prompt(`Altere o seu texto aqui: ${text}`);
        if (newText === ""){
            alert("Texto não pode ficar vazio")
        } if (newText.length > 0){
            $(`span[data-text-id=${key}]`).text(newText);
            database.ref("posts/" + USER_ID + "/" + key).
            update({
                text: newText
            }) 
            window.location.reload(); 
        }
    });
}

$('#filter-posts').change((event) => {
    database.ref('/posts/'+ USER_ID).once('value')
    .then((snapshot) => {
        $("#post-list").html("");
        snapshot.forEach((childSnapshot) => {
            let childKey = childSnapshot.key;
            let childtitlePost = childSnapshot.val().title;
            let childIngredientsPost = childSnapshot.val().ingredients;
            let childData = childSnapshot.val().text;
            let childDate = childSnapshot.val().date;
            let childMethod = childSnapshot.val().postMessage;
            let childLike = childSnapshot.val().likes;
            
            if (event.target.value === childMethod){
                createListPost(childtitlePost, childIngredientsPost, childData, childDate, childMethod, childLike, childKey);
            } else if(event.target.value === "todos") {
                createListPost(childtitlePost, childIngredientsPost, childData, childDate, childMethod, childLike, childKey);
            }
        })
        
    });
    
})

$("#exit").click((event) => {
    event.preventDefault();
    
    firebase.auth().signOut().then(() => {
        window.location = "index.html";
    }).catch((error) => {
        alert("Erro: " + error);
    });
});
