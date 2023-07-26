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
  
    let email = document.forms["myForm"]["email"].value; 
    
    if(email =="" ){
      toastr["error"]("Email has to be filled out and have email format", "Validation error")
      return false;
    }
  
  
    let password = document.forms["myForm"]["password"].value;
    if(password=="" || password.length <5){
      toastr["error"]("Password must be filled out and have at least 5 characters", "Validation error")
      return false;
    }
  
  }
  