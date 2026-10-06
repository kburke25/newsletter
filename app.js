
const DATA = window.NEWSLETTER_DATA;
const images = {
  9: 'assets/img_21.png',
  10: 'assets/img_23.png',
  11: 'assets/img_26.png',
  12: 'assets/img_30.png'
};
const imageAlt = {
  9: 'Two people speaking to each other',
  10: 'Portrait of writer Jesus Colón',
  11: 'Painting of a café interior',
  12: 'Barack Obama speaking at a microphone'
};
const selector = document.getElementById('language');
Object.entries(DATA).forEach(([code, lang]) => {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = lang.name;
  selector.appendChild(option);
});

function render(code){
  const lang = DATA[code] || DATA.en;
  document.documentElement.lang = code === 'gcr' ? 'en' : code;
  document.documentElement.dir = lang.dir;
  document.getElementById('page-title').textContent = lang.title;
  document.getElementById('subtitle').textContent = lang.subtitle;
  document.getElementById('tagline').textContent = lang.tagline;
  document.getElementById('week').textContent = lang.week;
  document.title = `${lang.title} | Bronxdale`;

  const grid = document.getElementById('newsletter-grid');
  grid.innerHTML = '';
  ['9','10','11','12'].forEach(grade => {
    const g = lang.grades[grade];
    const card = document.createElement('article');
    card.className = 'grade-card';
    card.innerHTML = `
      <img src="${images[grade]}" alt="${imageAlt[grade]}">
      <div class="grade-content">
        <h2>${g.title}</h2>
        <p>${g.body}</p>
        <div class="links"></div>
      </div>`;
    const links = card.querySelector('.links');
    g.links.forEach(([label,url]) => {
      const a = document.createElement('a');
      a.className = 'resource-link';
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = label;
      links.appendChild(a);
    });
    grid.appendChild(card);
  });
  localStorage.setItem('newsletterLanguage', code);
}

const saved = localStorage.getItem('newsletterLanguage');
if(saved && DATA[saved]) selector.value = saved;
else selector.value = 'en';
selector.addEventListener('change', e => render(e.target.value));
render(selector.value);
