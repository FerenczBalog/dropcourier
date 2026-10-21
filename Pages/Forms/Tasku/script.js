// ==========================================
// KONFIGURÁCIÓK ÉS GLOBÁLIS VÁLTOZÓK
// ==========================================
const TARGET_EMAIL = "balogferencz.artist@gmail.com";
const CC_EMAIL = "cristian@eastride.ro";

// FormSubmit teszt e-mail végpont
const FORMSUBMIT_URL = `https://formsubmit.co/${TARGET_EMAIL}`;

// JSONbin konfiguráció a szerződésszámok nyomon követéséhez
const JSONBIN_BIN_ID = "6a7acfebf5f4af5e2905fcc3"; 
const JSONBIN_API_KEY = "$2a$10$h4.WeaBJidVm/e.h54rtZ.5Jb4dFiRcOn5ZUMCKXN0YUL.0M571xe"; 

let form = null;
let statusBox = null;
let btnSend = null;
let btnPreview = null;
let pfaFields = null;
let cimFields = null;
let cardPfa = null;
let cardCim = null;
let normaSelect = null;
let declaratieCard = null;

let generatedContractBlob = null;
let generatedDeclaratieBlob = null;

let canvas = null;
let ctx = null;
let isDrawing = false;
let hasSigned = false;

let mode = null; // 'pfa' | 'cim'
let currentContractNumber = null;

// ==========================================
// DOM BETÖLTÉSE ÉS INICIALIZÁLÁS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  form = document.getElementById('contractForm');
  statusBox = document.getElementById('statusBox');
  btnSend = document.getElementById('btnSend');
  btnPreview = document.getElementById('btnPreview');
  pfaFields = document.getElementById('pfaFields');
  cimFields = document.getElementById('cimFields');
  cardPfa = document.getElementById('card-pfa');
  cardCim = document.getElementById('card-cim');
  normaSelect = document.getElementById('normaMuncaSelect');
  declaratieCard = document.getElementById('declaratieCard');

  // Hamburger menü kezelése mobilon
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburgerBtn.classList.toggle('open');
    });
  }

  // Vászon (Canvas) inicializálása
  initCanvas();

  // Aláírás törlése gomb
  const clearBtn = document.getElementById('clearSignatureBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearSignature);
  }

  if (normaSelect) {
    normaSelect.addEventListener('change', () => {
      toggleDeclaratie();
      refreshMarkers();
    });
  }

  if (cardPfa) cardPfa.addEventListener('click', () => selectMode('pfa'));
  if (cardCim) cardCim.addEventListener('click', () => selectMode('cim'));

  wireDropzone('dz-front');
  wireDropzone('dz-back');
  wireDropzone('dz-address');
  wireDropzone('dz-cui');

  if (form) {
    form.addEventListener('input', refreshMarkers);
    form.addEventListener('change', refreshMarkers);
  }

  document.querySelectorAll('#contractForm input[type="text"]').forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase();
    });
  });

  // "Doar descărcare" gomb kezelése
  if (btnPreview) {
    btnPreview.addEventListener('click', async () => {
      if (!validate()) return;
      try {
        const data = collectData();
        let templatePath = typeof TEMPLATE_B64_PFA !== 'undefined' ? TEMPLATE_B64_PFA : 'templates/contract_template.docx';
        if (mode === 'cim') {
          templatePath = data.is_full_time ? TEMPALATE_B64_CIM_FULL : TEMPLATE_B64_CIM;
        }

        const contractBlob = await buildDocxBlob(templatePath, false);
        const sName = safeName(data);

        const a = document.createElement('a');
        a.href = URL.createObjectURL(contractBlob);
        a.download = `${mode === 'cim' ? 'CIM' : 'Contract'}_${sName}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        if (checkIfDeclaratieNeeded() && typeof TEMPLATE_DECLARATIE !== 'undefined') {
          setTimeout(async () => {
            const declBlob = await buildDocxBlob(TEMPLATE_DECLARATIE, false);
            const a2 = document.createElement('a');
            a2.href = URL.createObjectURL(declBlob);
            a2.download = `Declaratie_OG4_${sName}.docx`;
            document.body.appendChild(a2);
            a2.click();
            a2.remove();
          }, 500);
        }
      } catch (err) {
        console.error(err);
        alert(`Nu s-a putut genera documentul: ${err.message}`);
      }
    });
  }

  fetchNextContractNumber();
  refreshMarkers();
});


// ==========================================
// FINOMÍTOTT CANVAS RAJZOLÓ LOGIKA (BÉZIER SMOOTHING)
// ==========================================
let lastPoint = null;

function initCanvas() {
  canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  canvas.width = 400;
  canvas.height = 200;

  clearSignature();

  ctx.strokeStyle = '#1CA8EB'; // Írás színe
  ctx.lineWidth = 0.5;         // Vonalszélesség
  ctx.lineCap = 'round';       // Lekerekített vonalvégek
  ctx.lineJoin = 'round';      // Lekerekített csatlakozások

  // Egér eseménykezelők
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  // Érintőképernyős (Touch) eseménykezelők
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

function clearSignature() {
  if (ctx && canvas) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasSigned = false;
    lastPoint = null;
  }
}

function startDrawing(e) {
  isDrawing = true;
  hasSigned = true;
  lastPoint = getPos(e);
  if (e.cancelable) e.preventDefault();
}

function draw(e) {
  if (!isDrawing) return;
  
  const currentPoint = getPos(e);
  
  if (lastPoint) {
    // Köztes pont kiszámítása a simább görbéhez
    const midPoint = {
      x: lastPoint.x + (currentPoint.x - lastPoint.x) / 2,
      y: lastPoint.y + (currentPoint.y - lastPoint.y) / 2
    };

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    // Bézier-görbe rajzolása a köztes pont felé
    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
    ctx.stroke();

    lastPoint = currentPoint;
  }

  if (e.cancelable) e.preventDefault();
}

function stopDrawing() {
  isDrawing = false;
  lastPoint = null;
}

function clearSignature() {
  if (ctx && canvas) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hasSigned = false;
  }
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  // Pontos koordináta kiszámítása a skálázott kijelzőméretezéshez
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function startDrawing(e) {
  isDrawing = true;
  hasSigned = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  if (e.cancelable) e.preventDefault();
}

function draw(e) {
  if (!isDrawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  if (e.cancelable) e.preventDefault();
}

function stopDrawing() {
  isDrawing = false;
}

// ==========================================
// SEGÉDFÜGGVÉNYEK ÉS KÉPTÖMÖRÍTÉS
// ==========================================
function getFormData() {
  const numeVal = (document.getElementById('nume')?.value || form.nume_salariat?.value || form.denumire_prestator?.value || '').trim();
  const emailVal = (document.getElementById('email')?.value || form.contact_email?.value || '').trim();
  const cnpVal = (document.getElementById('cnp')?.value || form.cnp_salariat?.value || form.cui_prestator?.value || '').trim();

  return {
    nume: numeVal,
    Nume: numeVal,
    nume_candidat: numeVal,
    salariat: numeVal,
    email: emailVal,
    cnp: cnpVal,
    data_completare: new Date().toLocaleDateString('ro-RO')
  };
}

function checkIfDeclaratieNeeded() {
  const isFullTime = normaSelect && (normaSelect.value === 'full_time');
  return mode === 'cim' && !isFullTime;
}

function compressBase64Image(base64Str, maxWidth = 400, maxHeight = 250) {
  return new Promise((resolve) => {
    if (!base64Str) return resolve("");
    const formattedSrc = base64Str.startsWith('data:') ? base64Str : 'data:image/png;base64,' + base64Str;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      
      const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);

      c.width = w;
      c.height = h;
      const cCtx = c.getContext('2d');
      cCtx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(formattedSrc);
    img.src = formattedSrc;
  });
}

// ==========================================
// DOCX GENERÁLÓ LOGIKA
// ==========================================
async function buildDocxBlob(templateSource, includeCompanySignature = false) {
  let arrayBuffer;

  if (templateSource.startsWith('http') || templateSource.startsWith('/') || templateSource.startsWith('templates/')) {
    const response = await fetch(templateSource);
    if (!response.ok) {
      throw new Error(`Lipsa fișier template (${response.status}: ${response.statusText})`);
    }
    arrayBuffer = await response.arrayBuffer();
  } else {
    const binaryString = window.atob(templateSource);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    arrayBuffer = bytes.buffer;
  }

  const zip = new PizZip(arrayBuffer);

  const opts = {
    centered: false,
    getImage: function (tagValue) {
      if (!tagValue) return new ArrayBuffer(0);
      const base64Data = tagValue.split(',')[1] || tagValue;
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    },
    getSize: function () {
      return [180, 110];
    }
  };

  const ImageModuleRef = window.ImageModule || ImageModule;
  const imageModule = new ImageModuleRef(opts);

  const doc = new window.docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true
  });

  const formData = Object.assign({}, collectData(), getFormData());

  if (hasSigned && canvas) {
    const sigImg = canvas.toDataURL('image/png');
    formData.applicant_signature = sigImg;
    formData.semnatura = sigImg;
  }

  const rawCompanySig = (typeof TEMPLATE_company_sign_n_stamp !== 'undefined' && TEMPLATE_company_sign_n_stamp)
    ? TEMPLATE_company_sign_n_stamp
    : ((typeof company_sign_n_stamp !== 'undefined' && company_sign_n_stamp)
      ? company_sign_n_stamp
      : ((typeof TEMPLATE_compSignature !== 'undefined' && TEMPLATE_compSignature) ? TEMPLATE_compSignature : null));

  if (includeCompanySignature && rawCompanySig) {
    const compressedSig = await compressBase64Image(rawCompanySig);
    formData.company_signature = compressedSig;
    formData.semnatura_angajator = compressedSig;
    formData.company_signature_and_stamp = compressedSig;
    formData.company_sign_n_stamp = compressedSig;
  } else {
    formData.company_signature = "";
    formData.semnatura_angajator = "";
    formData.company_signature_and_stamp = "";
    formData.company_sign_n_stamp = "";
  }

  doc.render(formData);

  return doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
}

// ==========================================
// ELŐNÉZET ÉS MODAL
// ==========================================
async function generateAndPreview() {
  if (!validate()) return;

  if (!hasSigned) {
    alert("Vă rugăm să semnați contractul înainte de previzualizare!");
    return;
  }

  try {
    const data = collectData();
    let templatePath = typeof TEMPLATE_B64_PFA !== 'undefined' ? TEMPLATE_B64_PFA : 'templates/contract_template.docx';
    if (mode === 'cim') {
      templatePath = data.is_full_time ? TEMPALATE_B64_CIM_FULL : TEMPLATE_B64_CIM;
    }

    generatedContractBlob = await buildDocxBlob(templatePath, false);

    const contractContainer = document.getElementById('contractPreviewContainer');
    if (contractContainer) {
      contractContainer.innerHTML = '';
      await docx.renderAsync(generatedContractBlob, contractContainer);
    }

    const requiresDeclaratie = checkIfDeclaratieNeeded();
    const declaratieTabBtn = document.getElementById('declaratieTabBtn');

    if (requiresDeclaratie && typeof TEMPLATE_DECLARATIE !== 'undefined') {
      generatedDeclaratieBlob = await buildDocxBlob(TEMPLATE_DECLARATIE, false);
      
      const declaratieContainer = document.getElementById('declaratiePreviewContainer');
      if (declaratieContainer) {
        declaratieContainer.innerHTML = '';
        await docx.renderAsync(generatedDeclaratieBlob, declaratieContainer);
      }

      if (declaratieTabBtn) declaratieTabBtn.style.display = 'inline-block';
    } else {
      if (declaratieTabBtn) declaratieTabBtn.style.display = 'none';
      generatedDeclaratieBlob = null;
    }

    switchDocTab('contract');
    
    const modal = document.getElementById('documentPreviewModal');
    if (modal) modal.style.display = 'block';

  } catch (error) {
    console.error("Hiba a dokumentum generálásakor:", error);
    alert("Eroare la generarea documentului: " + error.message);
  }
}

function switchDocTab(tabName) {
  const contractContainer = document.getElementById('contractPreviewContainer');
  const declaratieContainer = document.getElementById('declaratiePreviewContainer');
  const tabs = document.querySelectorAll('.tab-btn');

  if (tabName === 'contract') {
    if (contractContainer) contractContainer.style.display = 'block';
    if (declaratieContainer) declaratieContainer.style.display = 'none';
    if (tabs[0]) tabs[0].classList.add('active');
    if (tabs[1]) tabs[1].classList.remove('active');
  } else {
    if (contractContainer) contractContainer.style.display = 'none';
    if (declaratieContainer) declaratieContainer.style.display = 'block';
    if (tabs[0]) tabs[0].classList.remove('active');
    if (tabs[1]) tabs[1].classList.add('active');
  }
}

function closeDocPreview() {
  const modal = document.getElementById('documentPreviewModal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// BEKÜLDÉSI MECHANIZMUSOK
// ==========================================
async function submitViaNetlify(targetEmail, fields, files) {
  const formData = new FormData();

  Object.keys(fields).forEach(key => {
    formData.append(key, fields[key]);
  });

  files.forEach(({ field, blob, filename }) => {
    if (blob) {
      formData.append(field, blob, filename);
    }
  });

  const response = await fetch(`/api/send-contract?target=${encodeURIComponent(targetEmail)}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Netlify API ERROR (${response.status})`);
  }

  return await response.json();
}

async function submitFinalDocs(useFormSubmitTest = false) {
  const confirmBtn = document.querySelector('.btn-confirm');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Se trimite...";
  }

  try {
    const data = collectData();
    let templatePath = typeof TEMPLATE_B64_PFA !== 'undefined' ? TEMPLATE_B64_PFA : 'templates/contract_template.docx';
    if (mode === 'cim') {
      templatePath = data.is_full_time ? TEMPALATE_B64_CIM_FULL : TEMPLATE_B64_CIM;
    }

    const finalContractBlob = await buildDocxBlob(templatePath, true);

    const frontBlob = await processFile(form.id_front ? form.id_front.files[0] : null);
    let backBlob = null;
    if (form.id_back && form.id_back.files.length > 0) {
      backBlob = await processFile(form.id_back.files[0]);
    }

    const displayName = mode === 'cim' ? data.nume_salariat : data.denumire_prestator;
    const sName = safeName(data);

    // TESZT MÓD: FormSubmit használatával
    if (useFormSubmitTest) {
      form.action = FORMSUBMIT_URL;
      form.method = "POST";
      form.enctype = "multipart/form-data";
      
      const dataTransfer = new DataTransfer();
      const fileName = `${mode==='cim' ? 'CIM' : 'Contract'}_${sName}.docx`;
      const contractFile = new File([finalContractBlob], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });
      dataTransfer.items.add(contractFile);

      let fileInput = form.querySelector('input[type="file"][name="attachment"]');
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'attachment';
        fileInput.style.display = 'none';
        form.appendChild(fileInput);
      }
      fileInput.files = dataTransfer.files;

      await incrementContractNumber();
      closeDocPreview();
      form.submit();
      return;
    }

    // NORMÁL MÓD: Netlify Function
    const fields = {};
    fields['_subject'] = `Contract nou (${mode==='cim' ? 'CIM' : 'PFA/SRL'}) — ${displayName} (${data.oras_activitate})`;
    fields['_cc'] = CC_EMAIL; 

    if (form.contact_email && form.contact_email.value.trim()) {
      fields['_replyto'] = form.contact_email.value.trim();
    }

    fields['Oraș activitate'] = data.oras_activitate;
    fields['Tip colaborare'] = mode==='cim' ? 'Contract individual de muncă' : 'PFA / SRL';
    fields['Nr. Contract'] = mode==='cim' ? data.nr_contract_cim : data.nr_contract;

    if (mode === 'pfa') {
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
      fields['Normă de muncă'] = data.norma_munca;
      fields['Nume și prenume'] = data.nume_salariat;
      fields['Domiciliu'] = data.domiciliu_salariat;
      fields['CNP'] = data.cnp_salariat;
      fields['IBAN'] = data.iban_salariat;
      fields['Serie CI'] = data.serie_ci;
      fields['Număr CI'] = data.numar_ci;
      fields['Eliberată de'] = data.eliberat_de;
      fields['Data eliberării CI'] = data.data_eliberare_ci;
      fields['Data semnării'] = data.data_semnare_cim;
      fields['Data începerii'] = data.data_inceperii_cim;
      if (!data.is_full_time) {
        fields['Opțiune Declarație OG 4/2017'] = data.situatie_bifata;
      }
    }

    fields['E-mail de contact'] = (form.contact_email && form.contact_email.value.trim()) || '—';
    fields['Număr de telefon'] = (form.contact_phone && form.contact_phone.value.trim()) || '—';

    const files = [
      { field: 'contract', blob: finalContractBlob, filename: `${mode==='cim' ? 'CIM' : 'Contract'}_${sName}.docx` }
    ];

    if (frontBlob) {
      files.push({ field: 'carte_identitate_fata', blob: frontBlob, filename: `CI_fata_${sName}.${frontBlob.type==='application/pdf'?'pdf':'jpg'}` });
    }

    if (backBlob) {
      files.push({ field: 'carte_identitate_verso', blob: backBlob, filename: `CI_verso_${sName}.${backBlob.type==='application/pdf'?'pdf':'jpg'}` });
    }

    if (checkIfDeclaratieNeeded() && typeof TEMPLATE_DECLARATIE !== 'undefined') {
      const finalDeclaratieBlob = await buildDocxBlob(TEMPLATE_DECLARATIE, true);
      files.push({
        field: 'declaratie_og4',
        blob: finalDeclaratieBlob,
        filename: `Declaratie_OG4_${sName}.docx`
      });
    }

    if (form.AddressProof && form.AddressProof.files.length > 0) {
      const addrFile = form.AddressProof.files[0];
      const addrBlob = await processFile(addrFile);
      files.push({
        field: 'dovada_resedinta',
        blob: addrBlob,
        filename: `Dovada_resedinta_${sName}.${addrBlob.type==='application/pdf'?'pdf':'jpg'}`
      });
    }

    if (mode === 'pfa' && form.certificat_cui && form.certificat_cui.files.length > 0) {
      const cuiFile = form.certificat_cui.files[0];
      const cuiBlob = await processFile(cuiFile);
      files.push({
        field: 'certificat_inregistrare_cui',
        blob: cuiBlob,
        filename: `Certificat_CUI_${sName}.${cuiBlob.type==='application/pdf'?'pdf':'jpg'}`
      });
    }

    await submitViaNetlify(TARGET_EMAIL, fields, files);
    await incrementContractNumber();

    closeDocPreview();
    alert(`Cererea a fost trimisă cu succes! (Nr. contract: ${data.nr_contract || data.nr_contract_cim})`);

  } catch (err) {
    console.error("Eroare la trimiterea cererii:", err);
    alert("Eroare in timpul trimiterii: " + err.message);
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Trimitere finală";
    }
  }
}

// ==========================================
// JSONBIN SORSZÁMOZÁS
// ==========================================
async function fetchNextContractNumber() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const data = await response.json();
    if (data && data.record && typeof data.record.last_number !== 'undefined') {
      currentContractNumber = parseInt(data.record.last_number, 10) + 1;
    } else {
      currentContractNumber = "_______";
    }
  } catch (err) {
    console.error("Nem sikerült lekérni a szerződésszámot:", err);
    currentContractNumber = "_______";
  }
  updateReview();
}

async function incrementContractNumber() {
  if (!currentContractNumber || typeof currentContractNumber !== 'number') return;
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify({ last_number: currentContractNumber })
    });
    currentContractNumber++;
  } catch (err) {
    console.error("Nem sikerült frissíteni a szerződésszámot:", err);
  }
}

// ==========================================
// DÁTUMOK ÉS ŰRLAP INTERAKCIÓK
// ==========================================
function fmt(d) {
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

const today = new Date();
const startDate = new Date(today.getTime() + 3*24*60*60*1000);
const dataSemnare = fmt(today);
const dataInceperii = fmt(startDate);

if (document.getElementById('dispSemnare')) document.getElementById('dispSemnare').textContent = dataSemnare;
if (document.getElementById('dispInceperii')) document.getElementById('dispInceperii').textContent = dataInceperii;

function toggleDeclaratie() {
  if (!declaratieCard) return;
  const isFullTime = normaSelect && (normaSelect.value === 'full_time');
  const shouldHide = (mode !== 'cim') || isFullTime;
  declaratieCard.classList.toggle('hidden', shouldHide);

  document.querySelectorAll('input[name="situatie_og"]').forEach(r => {
    r.disabled = shouldHide;
    if (shouldHide) r.checked = false;
  });
}

function selectMode(newMode) {
  mode = newMode;
  if (cardPfa) cardPfa.classList.toggle('active', mode==='pfa');
  if (cardCim) cardCim.classList.toggle('active', mode==='cim');
  if (pfaFields) pfaFields.classList.toggle('hidden', mode!=='pfa');
  if (cimFields) cimFields.classList.toggle('hidden', mode!=='cim');

  document.querySelectorAll('[data-group="pfa"]').forEach(el => {
    el.required = (mode==='pfa'); el.disabled = (mode!=='pfa');
  });
  document.querySelectorAll('[data-group="cim"]').forEach(el => {
    el.required = (mode==='cim'); el.disabled = (mode!=='cim');
  });

  toggleDeclaratie();
  refreshMarkers();

  // Láthatóvá váláskor a vászon újrarajzolása
  setTimeout(() => {
    if (canvas && ctx) {
      clearSignature();
    }
  }, 100);
}

function wireDropzone(id) {
  const dz = document.getElementById(id);
  if (!dz) return;
  const input = dz.querySelector('input');
  if (!input) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    dz.classList.add('has-file');

    dz.querySelectorAll('.lbl,.sub,.fname,img').forEach(el => el.remove());

    if (file.type && file.type.startsWith('image/')) {
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

function groupFilled(selector) {
  const elements = Array.from(document.querySelectorAll(selector));
  const radios = elements.filter(el => el.type === 'radio' && !el.disabled);
  if (radios.length > 0) {
    const radioNames = [...new Set(radios.map(r => r.name))];
    const allRadiosChecked = radioNames.every(name => {
      return document.querySelector(`input[name="${name}"]:checked`) !== null;
    });
    if (!allRadiosChecked) return false;
  }

  return elements.every(el => {
    if (el.disabled || el.type === 'radio') return true;
    if (el.type==='file') return el.files && el.files.length>0;
    return el.value.trim().length>0;
  });
}

function refreshMarkers() {
  if (!form) return;
  const step1ok = !!mode && (form.oras_activitate ? form.oras_activitate.value !== '' : true) && groupFilled(mode==='pfa' ? '[data-group="pfa"]' : '[data-group="cim"]');
  const step2ok = true; 
  const step3ok = form.id_front && form.id_front.files ? form.id_front.files.length>0 : false;
  const step5ok = true; 
  const step6ok = step1ok && step2ok && step3ok;

  const m1 = document.querySelector('.stop-marker[data-marker="1"]');
  const m2 = document.querySelector('.stop-marker[data-marker="2"]');
  const m3 = document.querySelector('.stop-marker[data-marker="3"]');
  const m5 = document.querySelector('.stop-marker[data-marker="5"]');
  const m6 = document.querySelector('.stop-marker[data-marker="6"]');

  if (m1) m1.classList.toggle('done', step1ok);
  if (m2) m2.classList.toggle('done', step2ok);
  if (m3) m3.classList.toggle('done', step3ok);
  if (m5) m5.classList.toggle('done', step5ok);
  if (m6) m6.classList.toggle('done', step6ok);

  updateReview();
}

function updateReview() {
  if (!form) return;
  let rows = [];

  const displayNum = currentContractNumber ? currentContractNumber : 'se încarcă...';
  const formattedNrString = `înregistrat sub nr. ${displayNum} din data de ${dataSemnare}`;
  const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
  const oras = form.oras_activitate ? form.oras_activitate.value : '—';
  const isFullTime = normaSelect && normaSelect.value === 'full_time';

  if (mode === 'pfa') {
    rows = [
      ['Oraș activitate', oras || '—'],
      ['Tip colaborare', 'PFA / SRL'],
      ['Denumire firmă', (form.denumire_prestator && form.denumire_prestator.value) || '—'],
      ['Sediu', (form.sediu_prestator && form.sediu_prestator.value) || '—'],
      ['CUI', (form.cui_prestator && form.cui_prestator.value) || '—'],
      ['IBAN', (form.iban_prestator && form.iban_prestator.value) || '—'],
      ['Reprezentant legal', (form.reprezentant_prestator && form.reprezentant_prestator.value) || '—'],
      ['Certificat CUI', (form.certificat_cui && form.certificat_cui.files.length) ? '✓ încărcat' : '— lipsește']
    ];
  } else if (mode === 'cim') {
    rows = [
      ['Oraș activitate', oras || '—'],
      ['Tip colaborare', 'Contract individual de muncă'],
      ['Normă de muncă', isFullTime ? 'Normă întreagă (8h/zi)' : 'Part-time'],
      ['Nume și prenume', (form.nume_salariat && form.nume_salariat.value) || '—'],
      ['Domiciliu', (form.domiciliu_salariat && form.domiciliu_salariat.value) || '—'],
      ['CNP', (form.cnp_salariat && form.cnp_salariat.value) || '—'],
      ['IBAN', (form.iban_salariat && form.iban_salariat.value) || '—'],
      ['CI', ((form.serie_ci && form.serie_ci.value) || '—') + ' ' + ((form.numar_ci && form.numar_ci.value) || '')]
    ];

    if (!isFullTime) {
      rows.push(['Declarație OG 4/2017', selectedRadio ? '✓ Opțiune selectată' : '— Selectează o opțiune!']);
    }
  } else {
    rows = [['Tip colaborare', 'Alege o opțiune mai sus ↑']];
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
  if (reviewList) {
    reviewList.innerHTML = rows.map(([k,v])=>
      `<div class="review-row"><div class="k">${k}</div><div class="v">${v}</div></div>`
    ).join('');
  }
}

function processFile(file, maxDim=1600, quality=0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file); 
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let {width,height} = img;
      if (width>maxDim || height>maxDim) {
        if (width>height) { height = Math.round(height*(maxDim/width)); width = maxDim; }
        else { width = Math.round(width*(maxDim/height)); height = maxDim; }
      }
      const c = document.createElement('canvas');
      c.width=width; c.height=height;
      c.getContext('2d').drawImage(img,0,0,width,height);
      c.toBlob(blob => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function collectData() {
  const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
  const validNum = currentContractNumber || 439;
  const oras = form.oras_activitate ? form.oras_activitate.value : '';
  const isFullTime = normaSelect && normaSelect.value === 'full_time';

  if (mode === 'pfa') {
    return {
      oras_activitate: oras,
      nr_contract: `${validNum}`,
      data_semnare: dataSemnare,
      denumire_prestator: form.denumire_prestator ? form.denumire_prestator.value.trim() : '',
      sediu_prestator: form.sediu_prestator ? form.sediu_prestator.value.trim() : '',
      nr_reg_com: form.nr_reg_com ? form.nr_reg_com.value.trim() : '',
      cui_prestator: form.cui_prestator ? form.cui_prestator.value.trim() : '',
      iban_prestator: form.iban_prestator ? form.iban_prestator.value.trim() : '',
      banca_prestator: form.banca_prestator ? form.banca_prestator.value.trim() : '',
      reprezentant_prestator: form.reprezentant_prestator ? form.reprezentant_prestator.value.trim() : '',
      data_inceperii: dataInceperii
    };
  } else {
    return {
      oras_activitate: oras,
      norma_munca: isFullTime ? 'Normă întreagă (8h/zi)' : 'Part-time',
      is_full_time: isFullTime,
      nr_contract_cim: `${validNum}`,
      data_semnare_cim: dataSemnare,
      nume_salariat: form.nume_salariat ? form.nume_salariat.value.trim() : '',
      domiciliu_salariat: form.domiciliu_salariat ? form.domiciliu_salariat.value.trim() : '',
      serie_ci: form.serie_ci ? form.serie_ci.value.trim() : '',
      numar_ci: form.numar_ci ? form.numar_ci.value.trim() : '',
      eliberat_de: form.eliberat_de ? form.eliberat_de.value.trim() : '',
      data_eliberare_ci: form.data_eliberare_ci ? form.data_eliberare_ci.value.trim() : '',
      cnp_salariat: form.cnp_salariat ? form.cnp_salariat.value.trim() : '',
      iban_salariat: form.iban_salariat ? form.iban_salariat.value.trim() : '',
      data_inceperii_cim: dataInceperii,
      situatie_bifata: (selectedRadio && !isFullTime) ? selectedRadio.value : ''
    };
  }
}

function validate() {
  if (!mode) {
    alert('Alege mai întâi tipul de colaborare (PFA/SRL sau CIM).');
    return false;
  }
  if (form.oras_activitate && !form.oras_activitate.value) {
    alert('Te rugăm să selectezi orașul în care vei activa.');
    return false;
  }

  let ok = true;
  
  const allRequired = document.querySelectorAll('#contractForm [required]:not(:disabled)');
  allRequired.forEach(el => {
    const filled = el.type === 'checkbox' ? el.checked : (el.type === 'file' ? el.files.length > 0 : el.value.trim().length > 0);
    el.classList.toggle('err', !filled);
    if (!filled) ok = false;
  });

  if (!ok) {
    alert('Te rugăm să completezi toate câmpurile obligatorii și să bifezi acordul GDPR și Termeni!');
    return false;
  }

  const isFullTime = normaSelect && normaSelect.value === 'full_time';
  if (mode === 'cim' && !isFullTime) {
    const selectedRadio = document.querySelector('input[name="situatie_og"]:checked');
    if (!selectedRadio) {
      alert('Te rugăm să bifezi opțiunea corespunzătoare din Declarația OG 4/2017.');
      return false;
    }
  }

  return true;
}

function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function safeName(data) {
  const base = mode === 'cim' ? (data.nume_salariat || 'salariat') : (data.denumire_prestator || 'prestator');
  const cleanBase = removeAccents(base);
  return cleanBase.replace(/[^a-z0-9]+/gi, '_').toUpperCase();
}