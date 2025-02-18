// Seleccionamos los elementos del DOM
const jsonFileInput = document.getElementById('jsonFile');
const selectAllBtn = document.getElementById('selectAllBtn');
const entitiesContainer = document.getElementById('entitiesContainer');
const processBtn = document.getElementById('processBtn');

const evmOutput = document.getElementById('evmOutput');
const solanaOutput = document.getElementById('solanaOutput');
const allOutput = document.getElementById('allOutput');

const copyEvmBtn = document.getElementById('copyEvmBtn');
const copySolanaBtn = document.getElementById('copySolanaBtn');
const copyAllBtn = document.getElementById('copyAllBtn');

// Variable global para guardar el contenido parseado del JSON
let parsedData = [];

// Evento 'change' en el input de archivo
jsonFileInput.addEventListener('change', handleFileSelection);

function handleFileSelection(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      parsedData = JSON.parse(e.target.result);
      displayEntities(parsedData);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      alert('El archivo no es un JSON válido.');
    }
  };
  reader.readAsText(file);
}

// Mostrar la lista de entidades con checkboxes
function displayEntities(data) {
  // Limpiamos el contenedor y la salida
  entitiesContainer.innerHTML = '';
  evmOutput.innerText = '';
  solanaOutput.innerText = '';
  allOutput.innerText = '';

  if (!data || !data.length) {
    processBtn.disabled = true;
    selectAllBtn.disabled = true;
    return;
  }

  // Ordenamos alfabéticamente por el nombre sin espacios
  const sortedData = data.sort((a, b) => 
    a.name.replace(/\s+/g, '').localeCompare(b.name.replace(/\s+/g, ''))
  );

  sortedData.forEach((entity, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'entity-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `entity-${index}`;
    checkbox.value = index;
    checkbox.checked = false;

    const label = document.createElement('label');
    label.htmlFor = `entity-${index}`;
    label.innerText = entity.name; // Mantenemos emojis aquí, si tuviera

    itemDiv.appendChild(checkbox);
    itemDiv.appendChild(label);
    entitiesContainer.appendChild(itemDiv);
  });

  // Habilitamos los botones
  processBtn.disabled = false;
  selectAllBtn.disabled = false;
  selectAllBtn.textContent = 'Seleccionar todo';
}

// Botón "Procesar"
processBtn.addEventListener('click', processSelectedEntities);

function processSelectedEntities() {
  const checkboxes = entitiesContainer.querySelectorAll('input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('Selecciona al menos una entidad.');
    return;
  }

  const evmResults = [];
  const solanaResults = [];
  const allResults = [];

  checkboxes.forEach(checkbox => {
    const index = parseInt(checkbox.value, 10);
    const entity = parsedData[index];

    // Eliminamos espacios y emojis SOLO para la salida
    const nameClean = entity.name
      .replace(/\s+/g, '')                       // Eliminar espacios
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ''); // Eliminar emojis

    // Addresses
    const evmAddresses = entity?.addresses?.evm || [];
    const solanaAddresses = entity?.addresses?.solana || [];

    // EVM => nombreEntidad:0xdir1,0xdir2,etc
    if (evmAddresses.length > 0) {
      evmResults.push(`${nameClean}:${evmAddresses.join(',')}`);
    }

    // Solana => nombreEntidad:dir1,dir2,etc
    if (solanaAddresses.length > 0) {
      solanaResults.push(`${nameClean}:${solanaAddresses.join(',')}`);
    }

    // Todas => EVM + Solana
    const allAddresses = [...evmAddresses, ...solanaAddresses];
    if (allAddresses.length > 0) {
      allResults.push(`${nameClean}:${allAddresses.join(',')}`);
    }
  });

  // Unimos cada array con '|' entre entidades
  evmOutput.innerText = evmResults.join('|');
  solanaOutput.innerText = solanaResults.join('|');
  allOutput.innerText = allResults.join('|');
}

// Botones para copiar al portapapeles
copyEvmBtn.addEventListener('click', () => {
  copyToClipboard(evmOutput.innerText);
});

copySolanaBtn.addEventListener('click', () => {
  copyToClipboard(solanaOutput.innerText);
});

copyAllBtn.addEventListener('click', () => {
  copyToClipboard(allOutput.innerText);
});

// Función genérica para copiar texto
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('Copiado al portapapeles');
    })
    .catch(err => {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar el texto.');
    });
}

// Botón "Seleccionar todo"
selectAllBtn.addEventListener('click', toggleSelectAll);

function toggleSelectAll() {
  const checkboxes = entitiesContainer.querySelectorAll('input[type="checkbox"]');
  const allSelected = [...checkboxes].every(checkbox => checkbox.checked);

  checkboxes.forEach(checkbox => {
    checkbox.checked = !allSelected;
  });

  // Actualizamos el texto del botón
  selectAllBtn.textContent = allSelected ? 'Seleccionar todo' : 'Deseleccionar todo';
}
