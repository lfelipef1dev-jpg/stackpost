const fs = require('fs');
const token = fs.readFileSync('C:\\\\Users\\\\lfeli\\\\Desktop\\\\StackPost\\\\.devin\\\\secrets\\\\supabase-master-global-token.txt', 'utf8').trim();
fetch('https://api.supabase.com/v1/organizations', { headers: { 'Authorization': 'Bearer ' + token }})
  .then(r => r.json())
  .then(d => {
    if (Array.isArray(d)) {
      console.log('ORGANIZACOES: ' + d.length);
      d.forEach(o => console.log(' - ' + o.name + ' (' + o.id + ')'));
    } else {
      console.log(JSON.stringify(d).substring(0, 300));
    }
  })
  .catch(e => console.log('Erro:', e.message));
