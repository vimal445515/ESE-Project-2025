  let correntPage = '<%= page%>';
  let searchValue = "<%= search%>";
    
       function showEditModal(){
         const editCouponModal = document.getElementById('editCouponModal');
        const modal = new bootstrap.Modal(editCouponModal);
        modal.show()
       }

      
         function search(page){
          correntPage = page
          window.location.href = `/coupon?page=${correntPage}`
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
          searchValue =   document.getElementById("searchInput").value
          search(1)
        }