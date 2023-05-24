let addIngredientsBtn = document.getElementById("addIngredientsBtn");
let ingredientList = document.querySelector(".ingredientList");
let ingredientDiv = document.querySelector(".ingredientDiv");
let index = 1;

addIngredientsBtn.addEventListener("click", function () {
  index++;
  let newIngredients = document.createElement("input");
  let newButton = document.createElement("button");
  newIngredients.className = "form-control mb-1";
  newIngredients.id = `ingredient_${index}`;
  newIngredients.type = "text";
  newIngredients.name = "ingredients";
  newButton.className = "btn btn-outline-danger mb-2";
  newButton.name = "ingredientsButton";
  newButton.type = "button";
  newButton.id = `remove_${index}`;
  newButton.textContent = "Remove";
  ingredientList.appendChild(newIngredients);
  ingredientList.appendChild(newButton);
});

const elements = document.getElementsByName("ingredients");

const buttonElements = document.getElementsByName("ingredientsButton");

for (let element of elements) {
  buttonElement.addEventListener("click", (event) => {
  event.target.remove();
  });
}

