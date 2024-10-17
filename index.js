const baseURL = "http://localhost:3000/animals";
document.addEventListener("DOMContentLoaded", () => {
    fetchAnimals();
    let addForm = document.getElementById("add-form");
    addForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let formData = new FormData(e.target);
        let animalObj = {
            name: formData.get("name"),
            image: formData.get("image"),
            facts: formData.get("facts"),
            likes: 0, 
            comments: []
        };
        fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(animalObj),
        })
        .then(res => res.json())
        .then(data => {
            displayAnimal(data);
            alert(`${data.name} created successfully`);
        })
        .catch(err => console.log(err));
        
        e.target.reset();
    });
});
function fetchAnimals() {
    fetch(baseURL)
        .then(res => res.json())
        .then(data => {
            data.forEach(animal => displayAnimal(animal));
        })
        .catch(err => console.log(err));
}
function displayAnimal(animal) {
    let animalsDiv = document.getElementById("animals-div");
    let animalDiv = document.createElement("div");
    animalDiv.classList.add("animal_div");
    
    animalDiv.innerHTML = `
        <img id="image" src="${animal.image}" />
        <p>Name: ${animal.name}</p>
        <p>Facts: ${animal.facts}</p>
        <p id="likes-${animal.id}">Likes: ${animal.likes}</p>
        <button id="like-btn-${animal.id}">Like</button>
        <form id="comment-form-${animal.id}" class="comment-form">
            <input type="text" placeholder="Add a comment" />
            <button type="submit">Submit</button>
        </form>
        <div id="comments-${animal.id}" class="comments-section"></div>
        <button class="delete-btn">Delete</button>
    `;
    
    animalsDiv.appendChild(animalDiv);

    let likeBtn = document.getElementById(`like-btn-${animal.id}`);
    likeBtn.addEventListener("click", () => {
        updateLikes(animal);
    });

    let commentForm = document.getElementById(`comment-form-${animal.id}`);
    commentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addComment(e, animal);
    });

    let deleteBtn = animalDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener("click", () => {
        deleteAnimal(animal.id);  
    });

    animal.comments.forEach(comment => {
        renderComment(animal.id, comment);
    });
}
function updateLikes(animal) {
    animal.likes += 1;
    fetch(`${baseURL}/${animal.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ likes: animal.likes })
    })
    .then(res => res.json())
    .then(updatedAnimal => {
        document.getElementById(`likes-${updatedAnimal.id}`).textContent = `Likes: ${updatedAnimal.likes}`;
    })
    .catch(err => console.log(err));
}
function addComment(event, animal) {
    let commentInput = event.target.querySelector("input").value;
    if (commentInput.trim() !== "") {
        const newComment = { text: commentInput, likes: 0, dislikes: 0 };
        animal.comments.push(newComment);
        
        fetch(`${baseURL}/${animal.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comments: animal.comments })
        })
        .then(res => res.json())
        .then(updatedAnimal => {
            renderComment(animal.id, newComment); 
        })
        .catch(err => console.log(err));
    }
    event.target.reset();
}
function renderComment(animalId, comment) {
    let commentsDiv = document.getElementById(`comments-${animalId}`);
    let commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-item");
    commentDiv.innerHTML = `
        <p>${comment.text} <span class="comment-likes">Likes: ${comment.likes}</span> <span class="comment-dislikes">Dislikes: ${comment.dislikes}</span></p>
        <div class="comment-action-buttons">
            <button class="like-comment-btn">Like</button>
            <button class="dislike-comment-btn">Dislike</button>
            <button class="delete-comment-btn">Delete</button>
        </div>
    `;
    commentsDiv.appendChild(commentDiv);
    const likeBtn = commentDiv.querySelector(".like-comment-btn");
    likeBtn.addEventListener("click", () => {
        comment.likes += 1;
        updateComment(animalId, comment);
        commentDiv.querySelector(".comment-likes").textContent = `Likes: ${comment.likes}`;
    });

    const dislikeBtn = commentDiv.querySelector(".dislike-comment-btn");
    dislikeBtn.addEventListener("click", () => {
        comment.dislikes += 1;
        updateComment(animalId, comment);
        commentDiv.querySelector(".comment-dislikes").textContent = `Dislikes: ${comment.dislikes}`;
    });

    const deleteBtn = commentDiv.querySelector(".delete-comment-btn");
    deleteBtn.addEventListener("click", () => {
        deleteComment(animalId, comment, commentDiv);
    });
}
function updateComment(animalId, comment) {
    fetch(`${baseURL}/${animalId}`)
        .then(res => res.json())
        .then(animal => {
            const commentIndex = animal.comments.findIndex(c => c.text === comment.text);
            if (commentIndex !== -1) {
                animal.comments[commentIndex] = comment;
            }
            return fetch(`${baseURL}/${animalId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ comments: animal.comments })
            });
        })
        .catch(err => console.log(err));
}
function deleteComment(animalId, comment, commentDiv) {
    fetch(`${baseURL}/${animalId}`)
        .then(res => res.json())
        .then(animal => {
            animal.comments = animal.comments.filter(c => c.text !== comment.text);
            return fetch(`${baseURL}/${animalId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ comments: animal.comments })
            });
        })
        .then(() => {
            commentDiv.remove();
        })
        .catch(err => console.log(err));
}
function deleteAnimal(id) {
    fetch(`${baseURL}/${id}`, {
        method: "DELETE",
    })
    .then(() => {
        alert("Animal Deleted Successfully");
        const animalDiv = document.querySelector(`div.animal_div`);
        if (animalDiv) {
            animalDiv.remove();
        }
    })
    .catch(err => console.log(err));
}
