

function removeInput(){
  this.parentElement.remove()
}

 function addInput() {

  let ingredientList = document.getElementById("ingredientList");

  let newIngredients = document.createElement("input");
 
  newIngredients.name = "ingredients";
  newIngredients.className = "form-control new_article_input";
  newIngredients.type = "text";

  let newButton = document.createElement("button");
  newButton.className = "btn_delete_ingredient";
  newButton.name = "ingredientsButton";
  newButton.type = "button";
  newButton.textContent = "Remove";
  newButton.addEventListener("click", removeInput)

  let newDiv = document.createElement("div")
  newDiv.className = "newInputDiv"
  
  ingredientList.appendChild(newDiv);
  newDiv.appendChild(newIngredients);
  newDiv.appendChild(newButton);
};

