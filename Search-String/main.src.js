var $ = document.getElementById.bind(document);

initOptions();

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

