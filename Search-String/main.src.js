var cpm = [0.094, 0.16639787, 0.21573247, 0.25572005, 0.29024988, 0.3210876, 0.34921268, 0.3752356, 0.39956728, 0.4225, 0.44310755, 0.4627984, 0.48168495, 0.49985844, 0.51739395, 0.5343543, 0.5507927, 0.5667545, 0.5822789, 0.5974, 0.6121573, 0.6265671, 0.64065295, 0.65443563, 0.667934, 0.6811649, 0.69414365, 0.7068842, 0.7193991, 0.7317, 0.7377695, 0.74378943, 0.74976104, 0.7556855, 0.76156384, 0.76739717, 0.7731865, 0.77893275, 0.784637, 0.7903]; //corrected (full levels only)

Promise.all(
  ['pm-name.json', 'pm-data-with-ads.json']
    .map( j => fetch(j).then( d => d.json() ) )
).then(data => {
  window.pm = {
    names: data[0],
    data: data[1].map(i => {
      i.uid = i.dex + ( i.isotope ? `-${i.isotope}` : '');
      return i;
    }),
  };
  initOptions();
});

function initOptions () {
  if (!window.pm) { return; }
  var [lang, cpstr, hpstr] = $('lang').value.split(',');
  $('pokemon').innerHTML = pm.data.map(i => {
    let pokedex = `00${i.dex}`.slice(-3);
    let n = pm.names[pokedex][lang] || pm.names[pokedex].en;
    if (i.isotope) {
      n = `${n} (${i.isotope})`;
    }
    return `<option value="${n}" data-uid="${i.uid}">#${i.dex} ${n}</option>`
  }).join('');
};

var $ = document.getElementById.bind(document);

function checkpm() {
  let option = [...pokemon.options].find(option => option.value === pmname.value);
  if (!option) { return [0, 0, 0, 0]; }

  let target = pm.data.find(d => d.uid === option.dataset.uid);

  return [target.dex, ...target.ads];
}

function langChange() {
  calculate();
  initOptions();
}

function calculate() {
  var [id, baseatk, basedef, basesta] = checkpm();

  if( id === 0 ) {
    $('output').value = 'GG';
    return;
  }

  var [lang, cpstr, hpstr] = $('lang').value.split(',');
  var miniv = +$('miniv').value;
  var minatk = +$('minatk').value;
  var mindef = +$('mindef').value;
  var minsta = +$('minsta').value;
  var minlvl = +$('minlvl').value;
  var maxlvl = +$('maxlvl').value;
  var trash = $('trash').checked;
  var output = $('output');

  var cps = new Set(), hps = new Set();

  for( var atk = minatk; atk <= 15; atk++ ) {
    for( var def = mindef; def <= 15; def++ ) {
      for( var sta = minsta; sta <= 15; sta++ ) {
        if( atk + def + sta < miniv ) continue;

        for( var level = minlvl; level <= maxlvl; level++ ) {
          var cp = Math.floor((baseatk + atk) * Math.sqrt(basedef + def) * Math.sqrt(basesta + sta) * cpm[level] * cpm[level] / 10);
          if( cp < 10 ) cp = 10;
          cps.add(cp);

          var hp = Math.floor((basesta + sta) * cpm[level]);
          if( hp < 10 ) hp = 10;
          hps.add(hp);
        }
      }
    }
  }

  if( trash ) {
    var max = 0;
    for( var i = 10; i <= 9999; i++ ) {
      if( cps.has(i) ) {
        max = i;
      }
    }
    for( var i = 10; i <= max; i++ ) {
      if( cps.has(i) ) {
        cps.delete(i);
      } else {
        cps.add(i);
      }
    }
  }

  cps = Array.from(cps);
  cps.sort((a, b) => a - b);

  output.value = id + '&' + get_matching_string(cps, cpstr);

  if( !trash ) {
    hps = Array.from(hps);
    hps.sort((a, b) => a - b);

    output.value += '&' + get_matching_string(hps, hpstr);
  }
}

function get_matching_string(a, t) {
  var list = '', last = -1;
  for( var i = 0; i < a.length; i++ ) {
    if( a[i] == last + 1 ) {
      list += '-';
      last = a[i];
      while( ++i < a.length ) {
        if( a[i] != last + 1 ) break;
        last = a[i];
      }
      if( a[--i] < 9999 ) {
        list += a[i];
      }
    } else {
      list += ',' + t + a[i];
      last = a[i];
    }
  }

  return list.substr(1);
}

function copy() {
  $('output').select();
  document.execCommand('copy');
}

// auto-select lang
{
  let lang = navigator.language.split('-')[0]
  let option = [...$('lang').options].find(o => {
    return o.value.split(',')[0] === lang;
  });
  if (option) {
    $('lang').value = option.value;
    langChange();
  }
}

