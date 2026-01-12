  let correntPage = 1;
  let searchValue = ''
  let activeValue=''
       function showEditModal(){
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