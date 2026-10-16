const ARCHIVE = window.NEWSLETTER_ARCHIVE;
const fallbackImages = {
  9: 'assets/img_21.png',
  10: 'assets/img_23.png',
  11: 'assets/img_26.png',
  12: 'assets/img_30.png'
};
const fallbackAlt = {
  9: 'Literary-themed illustration',
  10: 'Literary-themed image',
  11: 'Literary-themed image',
  12: 'Literary-themed image'
};
const ui = {
  en:{language:'Language',edition:'Newsletter edition'}, fr:{language:'Langue',edition:'Édition de la newsletter'},
  es:{language:'Idioma',edition:'Edición del boletín'}, ar:{language:'اللغة',edition:'إصدار النشرة'},
  ur:{language:'زبان',edition:'نیوز لیٹر ایڈیشن'}, vi:{language:'Ngôn ngữ',edition:'Số bản tin'},
  gcr:{language:'Language',edition:'Newsletter edition'}, sq:{language:'Gjuha',edition:'Edicioni i buletinit'},
  bn:{language:'ভাষা',edition:'নিউজলেটার সংস্করণ'}
};
const languageSelector = document.getElementById('language');
const editionSelector = document.getElementById('edition');

function currentEditionData(){ return ARCHIVE.editions[editionSelector.value] || ARCHIVE.editions[ARCHIVE.current]; }
function populateLanguages(){
  const edition=currentEditionData();
  const saved=localStorage.getItem('newsletterLanguage');
  languageSelector.innerHTML='';
  Object.entries(edition).forEach(([code,lang])=>{
    const option=document.createElement('option'); option.value=code; option.textContent=lang.name; languageSelector.appendChild(option);
  });
  languageSelector.value=(saved && edition[saved]) ? saved : 'en';
}
function populateEditions(code){
  const selected=editionSelector.value || ARCHIVE.current;
  editionSelector.innerHTML='';
  Object.keys(ARCHIVE.editions).sort().reverse().forEach(key=>{
    const edition=ARCHIVE.editions[key];
    const lang=edition[code] || edition.en;
    const option=document.createElement('option'); option.value=key; option.textContent=lang.week; editionSelector.appendChild(option);
  });
  editionSelector.value=ARCHIVE.editions[selected] ? selected : ARCHIVE.current;
}
function render(){
  const code=languageSelector.value || 'en';
  const edition=currentEditionData();
  const lang=edition[code] || edition.en;
  const english=edition.en;
  document.documentElement.lang = code === 'gcr' ? 'en' : code;
  document.documentElement.dir = lang.dir;
  document.getElementById('language-label').textContent=(ui[code]||ui.en).language;
  document.getElementById('edition-label').textContent=(ui[code]||ui.en).edition;
  document.getElementById('page-title').textContent=lang.title;
  document.getElementById('subtitle').textContent=lang.subtitle;
  document.getElementById('tagline').textContent=lang.tagline;
  document.getElementById('week').textContent=lang.week;
  document.title=`${lang.title} | Bronxdale`;
  const grid=document.getElementById('newsletter-grid'); grid.innerHTML='';
  ['9','10','11','12'].forEach(grade=>{
    const g=lang.grades[grade];
    const enGrade=english.grades[grade] || {};
    const image=enGrade.image || fallbackImages[grade];
    const alt=enGrade.imageAlt || fallbackAlt[grade];
    const card=document.createElement('article'); card.className='grade-card';
    card.innerHTML=`<img src="${image}" alt="${alt}"><div class="grade-content"><h2>${g.title}</h2><p>${g.body}</p><div class="links"></div></div>`;
    const links=card.querySelector('.links');
    g.links.forEach(([label,url])=>{const a=document.createElement('a');a.className='resource-link';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label;links.appendChild(a);});
    grid.appendChild(card);
  });
  localStorage.setItem('newsletterLanguage',code);
  localStorage.setItem('newsletterEdition',editionSelector.value);
}

editionSelector.value=localStorage.getItem('newsletterEdition') || ARCHIVE.current;
populateLanguages();
populateEditions(languageSelector.value);
render();
languageSelector.addEventListener('change',()=>{const current=editionSelector.value;populateEditions(languageSelector.value);editionSelector.value=current;render();});
editionSelector.addEventListener('change',()=>{const code=languageSelector.value;populateLanguages();if(currentEditionData()[code]) languageSelector.value=code;render();});
