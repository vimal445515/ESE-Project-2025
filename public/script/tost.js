
  function showToast(message, type = "success") {

    const toastEl = document.getElementById("appToast");
    const toastMsg = document.getElementById("toastMessage");

    toastEl.className = "toast align-items-center  text-white border-0";


    if (type === "success") toastEl.classList.add("bg-success");
    if (type === "error") toastEl.classList.add("bg-danger");
    if (type === "warning") toastEl.classList.add("bg-warning", "text-dark");
    if (type === "info") toastEl.classList.add("bg-primary");

    toastMsg.innerText = message;

    const toast = new bootstrap.Toast(toastEl, {
      delay: 3000
    });

    toast.show();
  }

