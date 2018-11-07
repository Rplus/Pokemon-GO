let checkPosition = () => {
  console.log('checkPosition');
  navigator.geolocation.getCurrentPosition((e) => {
    setPosition(e.coords);
    img.checker = setTimeout(() => {
      checkPosition();
    }, (e.coords.accuracy < 100 ) ? 500 : 30000 );
  });
};

let p1 = [25.055554, 121.569250];
let p2 = [25.050949, 121.574685];
let imgW = 550;
let box = document.querySelector('.box');
let img = document.querySelector('.img');

let setPosition = (coords) => {
  console.log('accuracy', coords.accuracy);
  let yp = (coords.latitude - p1[0]) / (p2[0] - p1[0]);
  let xp = (coords.longitude - p1[1]) / (p2[1] - p1[1]);
  console.log({xp, yp});
  img.style.setProperty('--xp', `${xp * 100}%`);
  img.style.setProperty('--yp', `${yp * 100}%`);
  img.style.setProperty('--size', `${(coords.accuracy / imgW)}em`);
  box.dataset.update = new Date().toLocaleTimeString();
};

img.addEventListener('click', () => {
  if (!img.dataset.checking) {
    img.dataset.checking = true;
    checkPosition();
  } else {
    delete img.dataset.checking;
    clearTimeout(img.checker);
  }
});

document.addEventListener(visibilityChange, () => {
  img.click();
}, false);
