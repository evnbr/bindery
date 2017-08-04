const getJSONP = (url, success) => {
  const ud = `_${+new Date()}`;
  const script = document.createElement('script');
  window[ud] = (data) => {
    document.head.removeChild(script);
    success(data);
  };
  script.src = url.replace('callback=?', `callback=${ud}`);
  document.head.appendChild(script);
};

const getArticleWithTitle = (title, success) => {
  let url = '//en.wikipedia.org/w/api.php?';
  url += 'action=parse';
  url += '&format=json';
  url += '&prop=text';
  url += `&page=${title}`;
  url += '&disableeditsection=true';
  url += '&callback=?';

  getJSONP(url, (data) => {
    const content = data.parse.text['*'];
    const wrap = document.createElement('div');
    wrap.innerHTML = `<h1>${title}</h1>${content}`;
    success(wrap);
  });
};
