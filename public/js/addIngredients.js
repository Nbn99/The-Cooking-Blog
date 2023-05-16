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
  newButton.className = "btn btn-outline-danger mb-2";
  newButton.type = "button";
  newButton.id = `remove_${index}`;
  newButton.textContent = "Remove";
  ingredientList.appendChild(newIngredients);
  ingredientList.appendChild(newButton);
});

// let removeIngredientsBtn = document.querySelectorAll("#ingredientList button");
// console.log(removeIngredientsBtn);

// removeIngredientsBtn.addEventListener("click", function () {
//   let removeElement = document.getElementsByTagName("input");
//   if (removeElement.id == removeIngredientsBtn.id) {
//     removeElement.remove();
//   }
//   console.log(removeIngredientsBtn.id);
// });
