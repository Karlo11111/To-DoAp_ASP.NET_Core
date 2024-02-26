// app.js

document.addEventListener("DOMContentLoaded", function () {
    
    loadTodos();
    
});

function loadTodos() {
  fetch("http://localhost:5050/todoitems")
    .then((response) => response.json())
    .then((todos) => {
      const list = document.getElementById("todoList");
      list.innerHTML = "";
      todos.forEach((todo) => {
        const item = document.createElement("li");

        // Create a container for text and button to apply flexbox
        const container = document.createElement("div");
        container.classList.add("todo-item-container");

        const textSpan = document.createElement("span");
        textSpan.textContent = todo.name;
        container.appendChild(textSpan);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = function () {
          deleteTodoItem(todo.id);
        };
        container.appendChild(deleteButton);

        item.appendChild(container);
        list.appendChild(item);
      });
    });
}



function addTodo() {
    const input = document.getElementById("todoInput");
    const inputValue = document.getElementById("todoInput").value;
    const todo = { name: input.value, issComplete: false }; 
    const warning = document.getElementById("inputWarning");
    
    if (inputValue.length >= 3) {
        fetch("http://localhost:5050/todoitems", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(todo),
        })
            .then((response) => response.json())
            .then(() => {
                input.value = ""; // Clear input
                loadTodos(); // Reload todos
            });
    } else {
        warning.style.display = "block"; 
    }
}

function deleteTodoItem(id) {
  fetch(`http://localhost:5050/todoitems/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      loadTodos(); // Reload the list of todo items to reflect the deletion
    })
    .catch((error) => console.error("Error:", error));
}

