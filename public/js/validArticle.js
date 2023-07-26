function validateForm() {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": false,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
  
    let articleTitle = document.forms["myForm"]["title"].value;
    if(articleTitle =="" || title.length <3){
      toastr["error"]("Title must be unique, filled out and have at least 3 characters", "Validation error")
      return false;
    }
  
    let category = document.querySelector('.category').checked
    if(!category){
      toastr["error"]("Category must be filled out ", "Validation error")
      return false;
    }
  
    let description = document.forms["myForm"]["description"].value;
    if(description=="" || description.length <5){
      toastr["error"]("Description must be filled out and have at least 5 characters", "Validation error")
      return false;
    }
  
  
    let ingredient = document.querySelector('.ingredients').value;
    if (ingredient == "" ) {
      toastr["error"]("Ingredients must be filled out", "Validation error")
      return false;
    }

    let categoryName = document.forms["myForm"]["name"].value;
    console.log(categoryName)
    if(categoryName=="" || categoryName.length <3){
        toastr["error"]("Category name  must be filled out and have at least 3 characters", "Validation error")
        return false;
      }

  }
  