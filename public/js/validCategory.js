function validateFormCat() {
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
  
  
    let description = document.forms["myForm"]["description"].value;
    if(description=="" || description.length <5){
      toastr["error"]("Description must be filled out and have at least 5 characters", "Validation error")
      return false;
    }
  

    let categoryName = document.forms["myForm"]["name"].value;
    console.log(categoryName)
    if(categoryName=="" || categoryName.length <3){
        toastr["error"]("Category name  must be filled out and have at least 3 characters", "Validation error")
        return false;
      }

  }
  