async request => request.render('index', {
  lang: 'ru',
  title: 'Welex Framework',
  h1: 'This is Welex Framework Example',
  year: new Date().getFullYear(),
});
