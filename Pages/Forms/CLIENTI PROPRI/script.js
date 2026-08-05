(function(){

  const TARGET_EMAIL = "balogferencz.artist@gmail.com";
  const CC_EMAIL = "cristian@eastride.ro";

  const form = document.getElementById('contractForm');
  const statusBox = document.getElementById('statusBox');
  const btnSend = document.getElementById('btnSend');
  const btnPreview = document.getElementById('btnPreview');
  const pfaFields = document.getElementById('pfaFields');
  const cimFields = document.getElementById('cimFields');
  const cardPfa = document.getElementById('card-pfa');
  const cardCim = document.getElementById('card-cim');

  // Város elemek
  const citySelect = document.getElementById('citySelect');
  const dispCityName = document.getElementById('dispCityName');
  const dispGlovoWoltComisions = document.getElementById('dispGlovoWoltComisions');
  const dispWhatsapp = document.getElementById('dispWhatsapp');

  let mode = null; // 'pfa' | 'cim'

  // ---------- VÁROS VÁLASZTÓ ÉS DINAMIKUS MEZŐK ----------
  function updateCityDetails() {
    if (!citySelect || typeof CITY_DATA === 'undefined') return;
    
    const selectedCityKey = citySelect.value;
    const cityData = CITY_DATA[selectedCityKey];

    if (cityData) {
      // Városnév frissítése a Detalii financiare kártyán
      if (dispCityName) dispCityName.textContent = cityData.name;

      // Glovo/Wolt sávos jutalékok kilistázása
      if (dispGlovoWoltComisions && cityData.glovoWoltRates) {
        dispGlovoWoltComisions.innerHTML = `<ul style="padding-left: 18px; margin: 0; list-style-type: disc;">` + 
          cityData.glovoWoltRates.map(rate => `<li style="margin-bottom: 2px;">${rate}</li>`).join('') + 
          `</ul>`;
      }
      
      // WhatsApp gomb, név és telefonszám frissítése
      if (dispWhatsapp) {
        dispWhatsapp.href = cityData.whatsapp || '#';
        const nameText = cityData.contactName || cityData.name || '';
        const phoneText = cityData.phone || '';
        dispWhatsapp.innerHTML = `WhatsApp: <span id="contactName">${nameText}</span> - <span id="dispPhone">${phoneText}</span>`;
      }
    }
  }

  if (citySelect) {
    citySelect.addEventListener('change', () => {
      updateCityDetails();
      refreshMarkers();
    });
  }

  // ---------- Szerződésszám generáló ----------
  function getNextContractNumber() {
    let currentNum = parseInt(localStorage.getItem('last_contract_number'), 10);
    if (isNaN(currentNum) || currentNum < 427) {
      currentNum = 427;
      localStorage.setItem('last_contract_number', currentNum);
    }
    return currentNum;
  }

  function incrementContractNumber() {
    const currentNum = getNextContractNumber();
    localStorage.setItem('last_contract_number', currentNum + 1);
  }

  // ---------- Dátumok ----------
  function fmt(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yy = d.getFullYear();
    return `${dd}.${mm}.${yy}`;
  }
  const today = new Date();
  const startDate = new Date(today.getTime() + 3*24*60*60*1000);
  const dataSemnare = fmt(today);
  const dataInceperii = fmt(startDate);

  if(document.getElementById('dispSemnare')) document.getElementById('dispSemnare').textContent = dataSemnare;
  if(document.getElementById('dispInceperii')) document.getElementById('dispInceperii').textContent = dataInceperii;

  // ---------- Opció választás (PFA / CIM) ----------
  function selectMode(newMode){
    mode = newMode;
    if(cardPfa) cardPfa.classList.toggle('active', mode==='pfa');
    if(cardCim) cardCim.classList.toggle('active', mode==='cim');
    if(pfaFields) pfaFields.classList.toggle('hidden', mode!=='pfa');
    if(cimFields) cimFields.classList.toggle('hidden', mode!=='cim');

    document.querySelectorAll('[data-group="pfa"]').forEach(el=>{
      el.required = (mode==='pfa'); el.disabled = (mode!=='pfa');
    });
    document.querySelectorAll('[data-group="cim"]').forEach(el=>{
      el.required = (mode==='cim'); el.disabled = (mode!=='cim');
    });

    updateCityDetails();
    refreshMarkers();
  }

  if(cardPfa) cardPfa.addEventListener('click', ()=>selectMode('pfa'));
  if(cardCim) cardCim.addEventListener('click', ()=>selectMode('cim'));

  // ---------- Upload previews ----------
  function wireDropzone(id){
    const dz = document.getElementById(id);
    if(!dz) return;
    const input = dz.querySelector('input');
    if(!input) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if(!file) return;
      dz.classList.add('has-file');

      dz.querySelectorAll('.lbl,.sub,.fname,img').forEach(el=>el.remove());

      if(file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          const img = document.createElement('img');
          img.src = e.target.result;
          const fname = document.createElement('div');
          fname.className='fname';
          fname.textContent = file.name;
          dz.appendChild(img);
          dz.appendChild(fname);
        };
        reader.readAsDataURL(file);
      } else {
        const fname = document.createElement('div');
        fname.className='fname';
        fname.style.fontSize = '13px';
        fname.style.fontWeight = 'bold';
        fname.textContent = '📄 ' + file.name;
        dz.appendChild(fname);
      }

      refreshMarkers();
    });
  }

  wireDropzone('dz-front');
  wireDropzone('dz-back');
  wireDropzone('dz-address');
  wireDropzone('dz-cui');

  // ---------- Lépések ellenőrzése ----------
  function groupFilled(selector){
    const elements = Array.from(document.querySelectorAll(selector));
    
    const radios = elements.filter(el => el.type === 'radio');
    if (radios.length > 0) {
      const radioNames = [...new Set(radios.map(r => r.name))];
      const allRadiosChecked = radioNames.every(name => {
        return document.querySelector(`input[name="${name}"]:checked`) !== null;
      });
      if (!allRadiosChecked) return false;
    }

    return elements.every(el=>{
      if(el.disabled || el.type === 'radio') return true;
      if(el.type==='file') return el.files && el.files.length>0;
      return el.value.trim().length>0;
    });
  }

  function refreshMarkers(){
    if(!form) return;
    const step1ok = !!mode && groupFilled(mode==='pfa' ? '[data-group="pfa"]' : '[data-group="cim"]');
    const step2ok = true; 
    const step3ok = form.id_front && form.id_front.files ? form.id_front.files.length>0 : false;
    const step5ok = true; 
    const step6ok = step1ok && step2ok && step3ok;

    const m1 = document.querySelector('.stop-marker[data-marker="1"]');
    const m2 = document.querySelector('.stop-marker[data-marker="2"]');
    const m3 = document.querySelector('.stop-marker[data-marker="3"]');
    const m5 = document.querySelector('.stop-marker[data-marker="5"]');
    const m6 = document.querySelector('.stop-marker[data-marker="6"]');

    if(m1) m1.classList.toggle('done', step1ok);
    if(m2) m2.classList.toggle('done', step2ok);
    if(m3) m3.classList.toggle('done', step3ok);
    if(m5) m5.classList.toggle('done', step5ok);
    if(m6) m6.classList.toggle('done', step6ok);

    updateReview();
  }

  function updateReview(){
    if(!form) return;
    let rows = [];
    const numOnly = getNextContractNumber();
    const formattedNrString = `înregistrat sub nr. ${numOnly} din data de ${dataSemnare}`;
    const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
    const selectedCityKey = citySelect ? citySelect.value : 'bucuresti';
    const cityName = (typeof CITY_DATA !== 'undefined' && CITY_DATA[selectedCityKey]) ? CITY_DATA[selectedCityKey].name : 'București';

    const selectedPlatforme = Array.from(document.querySelectorAll('input[name="platforme"]:checked'))
      .map(cb => cb.value)
      .join(', ');

    rows.push(['Oraș activitate', cityName]);
    rows.push(['Platforme selectate', selectedPlatforme || '— Selectează cel puțin una!']);

    if(mode==='pfa'){
      rows.push(
        ['Tip colaborare', 'PFA / SRL'],
        ['Denumire firmă', form.denumire_prestator.value || '—'],
        ['Sediu', form.sediu_prestator.value || '—'],
        ['CUI', form.cui_prestator.value || '—'],
        ['IBAN', form.iban_prestator.value || '—'],
        ['Reprezentant legal', form.reprezentant_prestator.value || '—'],
        ['Certificat CUI', (form.certificat_cui && form.certificat_cui.files.length) ? '✓ încărcat' : '— lipsește']
      );
    } else if(mode==='cim'){
      rows.push(
        ['Tip colaborare', 'Contract individual de muncă'],
        ['Nume și prenume', form.nume_salariat.value || '—'],
        ['Normă C.I.M.', form.norma_cim ? form.norma_cim.value : '—'],
        ['Domiciliu', form.domiciliu_salariat.value || '—'],
        ['CNP', form.cnp_salariat.value || '—'],
        ['IBAN', form.iban_salariat.value || '—'],
        ['CI', (form.serie_ci.value||'—') + ' ' + (form.numar_ci.value||'')],
        ['Declarație OG 4/2017', selectedRadio ? '✓ Opțiune selectată' : '— Selectează o opțiune!']
      );
    } else {
      rows.push(['Tip colaborare', 'Alege o opțiune mai sus ↑']);
    }

    rows.push(
      ['Nr. contract', formattedNrString],
      ['Data semnării', dataSemnare],
      ['Data începerii', dataInceperii],
      ['Carte de identitate — față', (form.id_front && form.id_front.files.length) ? '✓ încărcată' : '— lipsește'],
      ['Carte de identitate — verso', (form.id_back && form.id_back.files.length) ? '✓ încărcată' : '— opțional'],
      ['Dovadă de reședință', (form.AddressProof && form.AddressProof.files.length) ? '✓ încărcată' : '— opțional']
    );

    const reviewList = document.getElementById('reviewList');
    if(reviewList){
      reviewList.innerHTML = rows.map(([k,v])=>
        `<div class="review-row"><div class="k">${k}</div><div class="v">${v}</div></div>`
      ).join('');
    }
  }

  if(form) {
    form.addEventListener('input', refreshMarkers);
    form.addEventListener('change', refreshMarkers);
  }

  document.querySelectorAll('#contractForm input[type="text"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });
  });

  // ---------- Segédfüggvények ----------
  function b64ToArrayBuffer(b64){
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for(let i=0;i<len;i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function processFile(file, maxDim=1600, quality=0.82){
    return new Promise((resolve, reject)=>{
      if(!file.type.startsWith('image/')) {
        resolve(file); 
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let {width,height} = img;
        if(width>maxDim || height>maxDim){
          if(width>height){ height = Math.round(height*(maxDim/width)); width = maxDim; }
          else { width = Math.round(width*(maxDim/height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width=width; canvas.height=height;
        canvas.getContext('2d').drawImage(img,0,0,width,height);
        canvas.toBlob(blob=>{
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function setStatus(kind, html){
    if(!statusBox) return;
    statusBox.className = 'status show ' + kind;
    statusBox.innerHTML = html;
  }

  function submitViaHiddenForm(actionUrl, fields, files){
    return new Promise((resolve)=>{
      const iframeName = 'fs_target_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const f = document.createElement('form');
      f.method = 'POST';
      f.action = actionUrl;
      f.enctype = 'multipart/form-data';
      f.target = iframeName;
      f.style.display = 'none';

      Object.keys(fields).forEach(name=>{
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = name;
        inp.value = fields[name];
        f.appendChild(inp);
      });

      files.forEach(({field, blob, filename})=>{
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.name = field;
        inp.style.display = 'none';
        const dt = new DataTransfer();
        dt.items.add(new File([blob], filename, { type: blob.type || 'application/octet-stream' }));
        inp.files = dt.files;
        f.appendChild(inp);
      });

      document.body.appendChild(f);

      let done = false;
      const finish = ()=>{
        if(done) return;
        done = true;
        resolve();
        setTimeout(()=>{ f.remove(); iframe.remove(); }, 1500);
      };
      iframe.addEventListener('load', finish);
      setTimeout(finish, 9000);

      f.submit();
    });
  }

  function collectData(){
    const currentNum = getNextContractNumber();
    const nrFormatted = `${currentNum}`;
    const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
    const selectedCityKey = citySelect ? citySelect.value : 'bucuresti';
    const cityName = (typeof CITY_DATA !== 'undefined' && CITY_DATA[selectedCityKey]) ? CITY_DATA[selectedCityKey].name : 'București';

    const selectedPlatforme = Array.from(document.querySelectorAll('input[name="platforme"]:checked'))
      .map(cb => cb.value)
      .join(', ');

    if(mode==='pfa'){
      return {
        oras_activitate: cityName,
        platforme_selectate: selectedPlatforme,
        nr_contract: nrFormatted,
        data_semnare: dataSemnare,
        denumire_prestator: form.denumire_prestator.value.trim(),
        sediu_prestator: form.sediu_prestator.value.trim(),
        nr_reg_com: form.nr_reg_com.value.trim(),
        cui_prestator: form.cui_prestator.value.trim(),
        iban_prestator: form.iban_prestator.value.trim(),
        banca_prestator: form.banca_prestator.value.trim(),
        reprezentant_prestator: form.reprezentant_prestator.value.trim(),
        data_inceperii: dataInceperii
      };
    } else {
      return {
        oras_activitate: cityName,
        platforme_selectate: selectedPlatforme,
        nr_contract_cim: nrFormatted,
        data_semnare_cim: dataSemnare,
        nume_salariat: form.nume_salariat.value.trim(),
        norma_cim: form.norma_cim ? form.norma_cim.value : '4 ore/zi',
        domiciliu_salariat: form.domiciliu_salariat.value.trim(),
        serie_ci: form.serie_ci.value.trim(),
        numar_ci: form.numar_ci.value.trim(),
        eliberat_de: form.eliberat_de.value.trim(),
        data_eliberare_ci: form.data_eliberare_ci.value.trim(),
        cnp_salariat: form.cnp_salariat.value.trim(),
        iban_salariat: form.iban_salariat.value.trim(),
        data_inceperii_cim: dataInceperii,
        situatie_bifata: selectedRadio ? selectedRadio.value : ''
      };
    }
  }

  function validate(){
    if(!mode){
      setStatus('bad','Alege mai întâi tipul de colaborare (PFA/SRL sau CIM).');
      return false;
    }

    const checkedPlatforme = document.querySelectorAll('input[name="platforme"]:checked');
    if (checkedPlatforme.length === 0) {
      setStatus('bad', 'Te rugăm să bifezi cel puțin o platformă (Glovo, Wolt sau Bolt).');
      return false;
    }
    
    let ok = true;
    const allRequired = document.querySelectorAll('#contractForm [required]:not(:disabled)');
    allRequired.forEach(el=>{
      const filled = el.type==='file' ? el.files.length>0 : el.value.trim().length>0;
      el.classList.toggle('err', !filled);
      if(!filled) ok = false;
    });

    if (mode === 'cim') {
      const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
      if (!selectedRadio) {
        ok = false;
        setStatus('bad', 'Te rugăm să bifezi opțiunea corespunzătoare din Declarația OG 4/2017.');
      }
    }

    return ok;
  }

  function generateDocx(data, overrideB64){
    const b64 = overrideB64 || (mode==='cim' ? TEMPLATE_B64_CIM : TEMPLATE_B64_PFA);
    const zip = new PizZip(b64ToArrayBuffer(b64));
    const doc = new window.docxtemplater(zip, { paragraphLoop:true, linebreaks:true });
    doc.render(data);
    return doc.getZip().generate({
      type:'blob',
      mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  // ---------- DECLARAȚIE DOCX GENERÁLÁS ----------
  function generateDeclaratieDocx(data) {
    const declaratieData = {
      nume_salariat: data.nume_salariat || '',
      domiciliu_salariat: data.domiciliu_salariat || '',
      serie_ci: data.serie_ci || '',
      numar_ci: data.numar_ci || '',
      cnp_salariat: data.cnp_salariat || '',
      nr_contract_cim: data.nr_contract_cim || '',
      data_semnare_cim: data.data_semnare_cim || '',
      situatie_bifata: data.situatie_bifata || ''
    };

    const zip = new PizZip(b64ToArrayBuffer(TEMPLATE_DECLARATIE));
    const doc = new window.docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

    doc.render(declaratieData);

    return doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  }

  function removeAccents(str) {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function safeName(data){
    const base = mode==='cim' ? (data.nume_salariat||'salariat') : (data.denumire_prestator||'prestator');
    const cleanBase = removeAccents(base);
    return cleanBase.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
  }

  // ---------- Previzualizare (Doar descărcare) ----------
  if(btnPreview) {
    btnPreview.addEventListener('click', ()=>{
      if(!mode){
        setStatus('bad','Alege mai întâi tipul de colaborare (PFA/SRL sau CIM).');
        return;
      }
      try{
        const data = collectData();
        const contractBlob = generateDocx(data);
        const sName = safeName(data);

        const a = document.createElement('a');
        a.href = URL.createObjectURL(contractBlob);
        a.download = `${mode==='cim' ? 'CIM' : 'Contract'}_${sName}.docx`;
        document.body.appendChild(a); a.click(); a.remove();

        if (mode === 'cim' && typeof TEMPLATE_DECLARATIE !== 'undefined') {
          setTimeout(() => {
            const declaratieDocxBlob = generateDeclaratieDocx(data);
            const a2 = document.createElement('a');
            a2.href = URL.createObjectURL(declaratieDocxBlob);
            a2.download = `Declaratie_OG4_${sName}.docx`;
            document.body.appendChild(a2); a2.click(); a2.remove();
          }, 500);
        }
      }catch(err){
        console.error(err);
        setStatus('bad', `Nu s-a putut genera documentul: ${err.message}`);
      }
    });
  }

  // ---------- Submit ----------
  if(form) {
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(!validate()){
        return;
      }
      if(btnSend) btnSend.disabled = true; 
      if(btnPreview) btnPreview.disabled = true;
      setStatus('info', '<div class="spinner"></div><div>Se generează contractul…</div>');

      try{
        const data = collectData();
        const contractBlob = generateDocx(data);

        setStatus('info', '<div class="spinner"></div><div>Se pregătesc fișierele…</div>');
        
        const frontBlob = await processFile(form.id_front.files[0]);
        
        let backBlob = null;
        if (form.id_back && form.id_back.files.length > 0) {
          backBlob = await processFile(form.id_back.files[0]);
        }

        const displayName = mode==='cim' ? data.nume_salariat : data.denumire_prestator;
        const sName = safeName(data);

        const fields = {};
        fields['_subject'] = `Contract nou (${mode==='cim' ? 'CIM' : 'PFA/SRL'}) — ${displayName} (${data.oras_activitate}) [${data.platforme_selectate}]`;
        fields['_template'] = 'table';
        fields['_captcha'] = 'false';
        fields['_cc'] = CC_EMAIL; 

        if(form.contact_email && form.contact_email.value.trim()){
          fields['_replyto'] = form.contact_email.value.trim();
        }

        fields['Oraș activitate'] = data.oras_activitate;
        fields['Platforme dorite'] = data.platforme_selectate;
        fields['Tip colaborare'] = mode==='cim' ? 'Contract individual de muncă' : 'PFA / SRL';
        fields['Nr. Contract'] = mode==='cim' ? data.nr_contract_cim : data.nr_contract;

        if(mode==='pfa'){
          fields['Denumire firmă'] = data.denumire_prestator;
          fields['Sediu'] = data.sediu_prestator;
          fields['Nr. Registrul Comerțului'] = data.nr_reg_com;
          fields['CUI'] = data.cui_prestator;
          fields['IBAN'] = data.iban_prestator;
          fields['Banca'] = data.banca_prestator;
          fields['Reprezentant legal'] = data.reprezentant_prestator;
          fields['Data semnării'] = data.data_semnare;
          fields['Data începerii'] = data.data_inceperii;
        } else {
          fields['Nume și prenume'] = data.nume_salariat;
          fields['Normă de lucru'] = data.norma_cim;
          fields['Domiciliu'] = data.domiciliu_salariat;
          fields['CNP'] = data.cnp_salariat;
          fields['IBAN'] = data.iban_salariat;
          fields['Serie CI'] = data.serie_ci;
          fields['Număr CI'] = data.numar_ci;
          fields['Eliberată de'] = data.eliberat_de;
          fields['Data eliberării CI'] = data.data_eliberare_ci;
          fields['Data semnării'] = data.data_semnare_cim;
          fields['Data începerii'] = data.data_inceperii_cim;
          fields['Opțiune Declarație OG 4/2017'] = data.situatie_bifata;
        }
        fields['E-mail de contact'] = (form.contact_email && form.contact_email.value.trim()) || '—';
        fields['Număr de telefon'] = (form.contact_phone && form.contact_phone.value.trim()) || '—';

        const files = [
          { field:'contract', blob: contractBlob, filename: `${mode==='cim' ? 'CIM' : 'Contract'}_${sName}.docx` },
          { field:'carte_identitate_fata', blob: frontBlob, filename: `CI_fata_${sName}.${frontBlob.type==='application/pdf'?'pdf':'jpg'}` }
        ];

        if (backBlob) {
          files.push({
            field:'carte_identitate_verso',
            blob: backBlob,
            filename: `CI_verso_${sName}.${backBlob.type==='application/pdf'?'pdf':'jpg'}`
          });
        }

        if (mode === 'cim' && typeof TEMPLATE_DECLARATIE !== 'undefined') {
          const declaratieDocxBlob = generateDeclaratieDocx(data);
          files.push({
            field: 'declaratie_og4',
            blob: declaratieDocxBlob,
            filename: `Declaratie_OG4_${sName}.docx`
          });
        }

        if(form.AddressProof && form.AddressProof.files.length > 0) {
          const addrFile = form.AddressProof.files[0];
          const addrBlob = await processFile(addrFile);
          files.push({
            field: 'dovada_resedinta',
            blob: addrBlob,
            filename: `Dovada_resedinta_${sName}.${addrBlob.type==='application/pdf'?'pdf':'jpg'}`
          });
        }

        if(mode === 'pfa' && form.certificat_cui && form.certificat_cui.files.length > 0) {
          const cuiFile = form.certificat_cui.files[0];
          const cuiBlob = await processFile(cuiFile);
          files.push({
            field: 'certificat_inregistrare_cui',
            blob: cuiBlob,
            filename: `Certificat_CUI_${sName}.${cuiBlob.type==='application/pdf'?'pdf':'jpg'}`
          });
        }

        setStatus('info', '<div class="spinner"></div><div>Se trimite (cu atașamente)…</div>');

        await submitViaHiddenForm(`https://formsubmit.co/${TARGET_EMAIL}`, fields, files);

        incrementContractNumber();

        setStatus('ok', `<div>✓ Cererea a fost trimisă cu succes!</div>`);
      }catch(err){
        console.error(err);
        setStatus('bad', `A apărut o eroare la trimitere: ${err.message}. Încearcă din nou sau folosește butonul „Doar descărcare” și trimite manual.`);
      }finally{
        if(btnSend) btnSend.disabled = false; 
        if(btnPreview) btnPreview.disabled = false;
      }
    });
  }

  // Az oldal betöltésekor azonnal frissíti a város adatait és a jelölőket
  updateCityDetails();
  refreshMarkers();
})();