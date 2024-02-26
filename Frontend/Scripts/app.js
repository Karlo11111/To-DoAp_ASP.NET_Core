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

        // Create a container for text, checkbox and buttons to apply flexbox
        const container = document.createElement("div");
        container.classList.add("todo-item-container");

        // Create and append the checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.isComplete;
        checkbox.classList.add("todo-checkbox");
        checkbox.addEventListener("change", (event) => {
          editTodo(todo.id, {
            name: todo.name,
            isComplete: event.target.checked,
          });
        });
        container.appendChild(checkbox);

        const textSpan = document.createElement("span");
        textSpan.textContent = todo.name;
        if (todo.isComplete) {
          textSpan.classList.add("completed");
        }
        container.appendChild(textSpan);
        textSpan.textContent = todo.name;
        container.appendChild(textSpan);

        // Create a separate container for the buttons
        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("buttons-container");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-button"); // Correct the class here to 'edit-button'
        editButton.onclick = function () {
          showTodoInInput(todo);
        };
        buttonsContainer.appendChild(editButton); // Append to buttons container

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = function () {
          deleteTodoItem(todo.id);
        };
        buttonsContainer.appendChild(deleteButton); // Append to buttons container

        // Append the buttons container to the todo item container
        container.appendChild(buttonsContainer);

        item.appendChild(container);
        list.appendChild(item);
      });
    });
}

function showTodoInInput(todo) {
  const input = document.getElementById("todoInput");
  input.value = todo.name;
  const addButton = document.getElementById("addTodoButton");
  addButton.textContent = "Save Changes"; // Change button text to indicate saving changes
  addButton.onclick = function () {
    editTodo(todo.id, { name: input.value, isComplete: todo.isComplete });
    input.value = "";
  };
}

function resetAddButton() {
  const addButton = document.getElementById("addTodoButton");
  addButton.textContent = "Add To-Do task"; // Reset button text to default
  addButton.onclick = addTodo; // Reset onclick event to default
}
function editTodo(id, updatedData) {
  fetch(`http://localhost:5050/todoitems/${id}`, {
    method: "PUT",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then((response) => {
      if (response.ok) {
        if (response.status === 204) {
          // No content to parse, so we can directly proceed
          return {};
        } else {
          // If the response does have content, parse it as JSON
          return response.json();
        }
      }
      throw new Error("Network response was not ok");
    })
    .then((data) => {
      console.log(data);
      resetAddButton();
      loadTodos(); // Reload the list of todo items to reflect the update
    })
    .catch((error) => {
      console.error(error);
    });
}


function addTodo() {
    const input = document.getElementById("todoInput");
    const inputValue = document.getElementById("todoInput").value;
    const todo = { name: input.value, isComplete: false }; 
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
                input.value = ""; 
                loadTodos(); 
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

