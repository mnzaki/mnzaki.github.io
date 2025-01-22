const canvas = document.querySelector('canvas'),
  ctx = canvas.getContext('2d');

let img = ctx.createImageData(600, 1500),
  curVals = new Int16Array(img.width*img.height),
  data = {
    x: 0,
    y: 0,
    pow: 2,
    mul: randomMul(),
    mulpow: 0.0002,
    transition: 0,
    noRandom: false,
    noTransition: false,
    rate: 0.00000000001,
    period: 500,
    transitionSteps: 50
  };

const normalRate = data.rate, normalPeriod = data.period;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const onlyOnce = { once: true };
const onMouseDown = evt => {
  const
    oldData = data,
    newData = {},
    newVals = {
      period: 50,
      rate: evt.clientY/100 * normalRate,
      mul: evt.clientX/99 + 10.1,
      noTransition: true,
      noRandom: true
    };

  Object.keys(data).forEach(k => {
    newData[k] = typeof newVals[k] == 'undefined' ? data[k] : newVals[k];
  });

  data = newData;
  renderEveryPeriod();

  document.addEventListener('mousedown', () => {
    data = oldData;
    document.addEventListener('mousedown', onMouseDown, onlyOnce);
  }, onlyOnce);
}

document.addEventListener('mousedown', onMouseDown, onlyOnce)

refitCanvas();

window.addEventListener('resize', refitCanvas);

renderCanvas();

let curTimeout = setTimeout(renderEveryPeriod, data.period);

function renderEveryPeriod() {
  if (curTimeout) clearTimeout(curTimeout);
  renderCanvas();
  curTimeout = setTimeout(renderEveryPeriod, data.period);
}

function refitCanvas() {
  data.transition = data.transitionSteps;
  const rect = document.body.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  if (canvas.width > img.width || canvas.height > img.height) {
    img = ctx.createImageData(Math.max(canvas.width, img.width), Math.max(canvas.height, img.height));
    curVals = new Int16Array(img.width*img.height);
  }

  const w = canvas.width, h = canvas.height;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const index = (i + j * img.width) * 4;
      const val = getValue(data.x+i, data.y+j, data.mul, data.pow) * 255;
      img.data[index] = val;
      img.data[index+1] = val;
      img.data[index+2] = val;
      img.data[index+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

function renderCanvas() {
  requestAnimationFrame(() => doRenderCanvas());
}

const smoothAlpha = 255/data.transitionSteps;
function doRenderCanvas() {
  const makeNew = data.noTransition || data.transition >= data.transitionSteps;
  if (makeNew) {
    const ratePerPeriod = data.rate/data.period*1000;
    data.transition = 0;
    data.x+=ratePerPeriod;
    data.y+=ratePerPeriod;
    if (!data.noRandom) {
      data.mul = randomMul();
      //data.pow += (Math.random() - 0.5) * 2;
    }
    if (data.x > 1e15) data.x = 0;
    if (data.y > 1e15) data.y = 0;
    //if (data.pow < 0.02) data.pow = 0.02;
    //if (data.pow > 0.2) data.pow = 0.2;
  } else {
    data.transition++;
  }

  const w = canvas.width, h = canvas.height;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const index = (i + j * img.width) * 4;
      let delta;
      if (makeNew) {
        const val = getValue(data.x+i, data.y+j, data.mul, data.pow) * 255;
        delta = val - img.data[index];
        if (!data.noTransition) delta = delta/data.transitionSteps;
        curVals[index/4] = delta;
      } else {
        delta = curVals[index/4];
      }
      img.data[index] += delta;
      img.data[index+1] += delta;
      img.data[index+2] += delta;
      img.data[index+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

function getValue(i, j, mul, pow) {
  let a;
  i *= mul;
  j *= mul;
  a = mul*mul*(i * i + j * j);
  a -= Math.floor(a);
  a = Math.max(a, 1.0 - a);
  return Math.pow(a, pow);
}

function randomMul() {
  return 124*Math.random()+10.1;
}
