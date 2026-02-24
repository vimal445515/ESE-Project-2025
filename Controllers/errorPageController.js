const errorPage = (req, res) => {
  if (req.originalUrl.startsWith("/admin")) {
    res.status(404).render("Admin/404Page");
  } else {
    res.status(404).redirect("/404Page");
  }
};

export default {
  errorPage,
};
