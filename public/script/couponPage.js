  let correntPage = 1;
  let searchValue = ''
  let activeValue=''
       function showEditModal(couponCode,discount,minimumOrder, maximumDiscount,expiryDate){
        document.getElementById('couponCode').value= couponCode;
        document.getElementById('discount').value= discount;
        document.getElementById('minimumOrder').value= minimumOrder;
        document.getElementById('maximumDiscount').value= maximumDiscount;
        document.getElementById('expiryDate').value= expiryDate;

        const editCouponModal = document.getElementById('editCouponModal');
        const modal = new bootstrap.Modal(editCouponModal);
        modal.show()

       }

      
         function search(page){
          let search = document.getElementById('searchInput').value.trim()
          correntPage = page
          window.location.href = `/coupon?page=${correntPage}&search=${searchValue}&filter=${activeValue}`
        }
         function nextPage(correntPgae){
           correntPgae++;
           search(correntPgae)  
        }

        function previousPage(page){
                page--;
                if(page>0){
                     search(page)
                }
             }
        function searchText(){
          searchValue =   document.getElementById("searchInput").value.trim()
          search(1)
        }

        function active(){
           activeValue='active';
           search(1) 
        }

        function expired(){
            activeValue = 'expired'
            search(1)
        }

        function activate(couponId){
          
            fetch('coupon/activate',{
                method:'PATCH',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({couponId:couponId})
            }).then(data=>{
                search(1)
            })
        }

        function deactive(couponId){
          
            fetch('coupon/deactive',{
                method:'PATCH',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({couponId:couponId})
            }).then(data=>{
                search(1)
            })
        }



      
  const createForm = document.querySelector('#createCouponModal form');
 
  createForm.addEventListener("submit", function (e) {
    e.preventDefault();
    vaildate(createForm,e)

    
  });
  const editForm = document.querySelector('#editCouponModal form')
   editForm.addEventListener("submit", function (e) {
    e.preventDefault();
    vaildate(editForm,e)

    
  });




  const vaildate= (form,e)=>{
    const discount = form.discount.value.trim();
    const minimumOrder = form.minimumOrder.value.trim();
    const maximumDiscount = form.maximumDiscount.value.trim();
    const expiryDate = form.expiryDate.value;


    const discountError = form.querySelector(".discountError");
    const minimumOrderError = form.querySelector(".minimumOrderError");
    const maximumDiscountError = form.querySelector(".maximumDiscountError");
    const dateError = form.querySelector(".dateError");


    discountError.textContent = "";
    minimumOrderError.textContent = "";
    maximumDiscountError.textContent = "";
    dateError.textContent = "";

    let isValid = true;

    if (!discount || discount <= 0 || discount > 100) {
      discountError.textContent = "Enter a valid discount";
      isValid = false;
    }

  
    if (!minimumOrder || minimumOrder <= 0) {
      minimumOrderError.textContent = "Enter a valid minimum order amount";
      isValid = false;
    }

 
    if (!maximumDiscount || maximumDiscount <= 0) {
      maximumDiscountError.textContent = "Enter a valid maximum discount";
      isValid = false;
    }


    if (
      minimumOrder &&
      maximumDiscount &&
      Number(maximumDiscount) > Number(minimumOrder)
    ) {
      maximumDiscountError.textContent =
        "Maximum discount cannot exceed minimum order amount";
      isValid = false;
    }


    if (!expiryDate) {
      dateError.textContent = "Select an expiry date";
      isValid = false;
    } else {
      const today = new Date().toISOString().split("T")[0];
      if (expiryDate < today) {
        dateError.textContent = "Expiry date must be in the future";
        isValid = false;
      }
    }


    if (isValid) {
      form.submit();
    }
  }

