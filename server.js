const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

// Configuración de MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Conectar a MongoDB
let db;
client.connect()
  .then(() => {
    console.log('✓ Conectado a MongoDB');
    db = client.db();
  })
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Ruta principal - HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB CRUD Simple</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid #e0e0e0;
            flex-wrap: wrap;
        }
        .tab {
            padding: 12px 24px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #666;
            border-bottom: 3px solid transparent;
            transition: all 0.3s;
        }
        .tab:hover {
            color: #667eea;
        }
        .tab.active {
            color: #667eea;
            border-bottom-color: #667eea;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
            font-family: inherit;
        }
        textarea {
            min-height: 80px;
            resize: vertical;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            flex: 1;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #e0e0e0;
            color: #333;
        }
        .btn-secondary:hover {
            background: #d0d0d0;
        }
        .btn-danger {
            background: #ef5350;
            color: white;
            flex: 1;
        }
        .btn-danger:hover {
            background: #e53935;
            transform: translateY(-2px);
        }
        .btn-success {
            background: #66bb6a;
            color: white;
            flex: 1;
        }
        .btn-success:hover {
            background: #4caf50;
        }
        #results {
            margin-top: 30px;
        }
        .result-header {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            border-left: 4px solid #667eea;
        }
        .result-content {
            background: #fafafa;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            max-height: 500px;
            overflow-y: auto;
        }
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.5;
        }
        .loading {
            text-align: center;
            color: #667eea;
            font-weight: 600;
            padding: 20px;
        }
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #c62828;
        }
        .success {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
        }
        .info-box {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
            margin-bottom: 20px;
        }
        .warning-box {
            background: #fff3e0;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
            margin-bottom: 20px;
        }
        .field-row {
            display: grid;
            grid-template-columns: 1fr 2fr auto;
            gap: 10px;
            margin-bottom: 10px;
            align-items: end;
        }
        .btn-small {
            padding: 8px 16px;
            font-size: 14px;
        }
        .schema-box {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
        }
        .schema-box h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .schema-field {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            margin-bottom: 8px;
            border: 1px solid #e0e0e0;
        }
        .schema-field-name {
            font-weight: 600;
            color: #333;
            min-width: 150px;
        }
        .schema-field-type {
            color: #666;
            font-size: 13px;
            font-style: italic;
        }
        .required-badge {
            background: #ff9800;
            color: white;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 10px;
            font-weight: 600;
        }
        .optional-badge {
            background: #9e9e9e;
            color: white;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            margin-left: 10px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍃 MongoDB CRUD - Interfaz Simple</h1>
        <p class="subtitle">Sin JSON, solo escribe y listo</p>
        
        <div class="grid-2">
            <div class="form-group">
                <label>Base de Datos:</label>
                <input type="text" id="dbName" placeholder="test" value="NuevaBD">
            </div>
            
            <div class="form-group">
                <label>Colección:</label>
                <input type="text" id="collection" placeholder="usuarios" value="usuarios">
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="switchTab('read')">🔍 Buscar</button>
            <button class="tab" onclick="switchTab('create')">➕ Crear</button>
            <button class="tab" onclick="switchTab('update')">✏️ Actualizar</button>
            <button class="tab" onclick="switchTab('delete')">🗑️ Eliminar</button>
        </div>
        
        <!-- TAB: READ -->
        <div id="tab-read" class="tab-content active">
            <div class="info-box">
                💡 Deja los campos vacíos para traer todos los documentos
            </div>
            
            <div class="grid-3">
                <div class="form-group">
                    <label>Campo:</label>
                    <input type="text" id="searchField" placeholder="nombre">
                </div>
                
                <div class="form-group">
                    <label>Operador:</label>
                    <select id="searchOperator">
                        <option value="equals">Igual a</option>
                        <option value="gt">Mayor que</option>
                        <option value="lt">Menor que</option>
                        <option value="gte">Mayor o igual</option>
                        <option value="lte">Menor o igual</option>
                        <option value="ne">Diferente de</option>
                        <option value="contains">Contiene texto</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Valor:</label>
                    <input type="text" id="searchValue" placeholder="Juan">
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn-primary" onclick="buscarSimple()">🔍 Buscar</button>
                <button class="btn-primary" onclick="listarTodo()">📋 Listar Todo</button>
                <button class="btn-secondary" onclick="listarColecciones()">📁 Ver Colecciones</button>
            </div>
        </div>
        
        <!-- TAB: CREATE -->
        <div id="tab-create" class="tab-content">
            <div class="schema-box">
                <h3>📋 Campos de la Colección "usuarios"</h3>
                <div class="schema-field">
                    <span class="schema-field-name">nombre:</span>
                    <span class="schema-field-type">(texto)</span>
                    <span class="required-badge">OBLIGATORIO</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">edad:</span>
                    <span class="schema-field-type">(número)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">email:</span>
                    <span class="schema-field-type">(texto)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">activo:</span>
                    <span class="schema-field-type">(true/false)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">membresia:</span>
                    <span class="schema-field-type">(texto: premium, básico, etc.)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">anio_nacimiento:</span>
                    <span class="schema-field-type">(número)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
                <div class="schema-field">
                    <span class="schema-field-name">rfc:</span>
                    <span class="schema-field-type">(texto)</span>
                    <span class="optional-badge">OPCIONAL</span>
                </div>
            </div>
            
            <div class="info-box">
                ➕ Llena los campos necesarios. Los números se detectan automáticamente.
            </div>
            
            <div id="createFields">
                <div class="field-row">
                    <input type="text" placeholder="Campo (ej: nombre)" class="field-name" value="nombre">
                    <input type="text" placeholder="Valor (ej: Juan)" class="field-value">
                    <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
                </div>
                <div class="field-row">
                    <input type="text" placeholder="Campo (ej: edad)" class="field-name" value="edad">
                    <input type="text" placeholder="Valor (ej: 25)" class="field-value">
                    <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
                </div>
                <div class="field-row">
                    <input type="text" placeholder="Campo (ej: email)" class="field-name" value="email">
                    <input type="text" placeholder="Valor (ej: usuario@email.com)" class="field-value">
                    <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
                </div>
            </div>
            
            <button class="btn-secondary" onclick="agregarCampoCrear()" style="margin-bottom: 20px;">+ Agregar Campo</button>
            
            <div class="btn-group">
                <button class="btn-success" onclick="crearDocumento()">➕ Crear Documento</button>
            </div>
        </div>
        
        <!-- TAB: UPDATE -->
        <div id="tab-update" class="tab-content">
            <div class="info-box">
                ✏️ Primero busca el documento que quieres actualizar, luego indica qué campos modificar
            </div>
            
            <h3 style="margin-bottom: 15px; color: #667eea;">1️⃣ Buscar documento por:</h3>
            <div class="grid-2">
                <div class="form-group">
                    <label>Campo:</label>
                    <input type="text" id="updateSearchField" placeholder="nombre">
                </div>
                
                <div class="form-group">
                    <label>Valor:</label>
                    <input type="text" id="updateSearchValue" placeholder="Juan">
                </div>
            </div>
            
            <h3 style="margin: 20px 0 15px; color: #667eea;">2️⃣ Actualizar estos campos:</h3>
            <div id="updateFields">
                <div class="field-row">
                    <input type="text" placeholder="Campo (ej: edad)" class="field-name">
                    <input type="text" placeholder="Nuevo valor (ej: 26)" class="field-value">
                    <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
                </div>
            </div>
            
            <button class="btn-secondary" onclick="agregarCampoActualizar()" style="margin-bottom: 20px;">+ Agregar Campo</button>
            
            <div class="btn-group">
                <button class="btn-primary" onclick="actualizarDocumento()">✏️ Actualizar</button>
            </div>
        </div>
        
        <!-- TAB: DELETE -->
        <div id="tab-delete" class="tab-content">
            <div class="warning-box">
                ⚠️ <strong>Cuidado:</strong> Esta operación no se puede deshacer
            </div>
            
            <div class="grid-2">
                <div class="form-group">
                    <label>Buscar por campo:</label>
                    <input type="text" id="deleteField" placeholder="nombre">
                </div>
                
                <div class="form-group">
                    <label>Con valor:</label>
                    <input type="text" id="deleteValue" placeholder="Juan">
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn-danger" onclick="eliminarDocumento()">🗑️ Eliminar</button>
            </div>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
        function switchTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
            limpiar();
        }
        
        function agregarCampoCrear() {
            const container = document.getElementById('createFields');
            const newRow = document.createElement('div');
            newRow.className = 'field-row';
            newRow.innerHTML = \`
                <input type="text" placeholder="Campo" class="field-name">
                <input type="text" placeholder="Valor" class="field-value">
                <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
            \`;
            container.appendChild(newRow);
        }
        
        function agregarCampoActualizar() {
            const container = document.getElementById('updateFields');
            const newRow = document.createElement('div');
            newRow.className = 'field-row';
            newRow.innerHTML = \`
                <input type="text" placeholder="Campo" class="field-name">
                <input type="text" placeholder="Nuevo valor" class="field-value">
                <button class="btn-danger btn-small" onclick="this.parentElement.remove()">✕</button>
            \`;
            container.appendChild(newRow);
        }
        
        function convertirValor(valor) {
            if (valor === '') return '';
            if (valor === 'true') return true;
            if (valor === 'false') return false;
            if (!isNaN(valor) && valor.trim() !== '') return Number(valor);
            return valor;
        }
        
        // ========== READ ==========
        async function buscarSimple() {
            const dbName = document.getElementById('dbName').value;
            const collection = document.getElementById('collection').value;
            const field = document.getElementById('searchField').value.trim();
            const operator = document.getElementById('searchOperator').value;
            const value = document.getElementById('searchValue').value.trim();
            
            if (!collection) {
                mostrarError('Por favor, ingresa el nombre de la colección');
                return;
            }
            
            let filter = {};
            
            if (field && value) {
                const convertedValue = convertirValor(value);
                
                switch(operator) {
                    case 'equals':
                        filter[field] = convertedValue;
                        break;
                    case 'gt':
                        filter[field] = { $gt: convertedValue };
                        break;
                    case 'lt':
                        filter[field] = { $lt: convertedValue };
                        break;
                    case 'gte':
                        filter[field] = { $gte: convertedValue };
                        break;
                    case 'lte':
                        filter[field] = { $lte: convertedValue };
                        break;
                    case 'ne':
                        filter[field] = { $ne: convertedValue };
                        break;
                    case 'contains':
                        filter[field] = { $regex: value, $options: 'i' };
                        break;
                }
            }
            
            mostrarCargando();
            
            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbName, collection, filter })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarResultados(data.documents, data.count);
                }
            } catch (error) {
                mostrarError('Error: ' + error.message);
            }
        }
        
        async function listarTodo() {
            document.getElementById('searchField').value = '';
            document.getElementById('searchValue').value = '';
            buscarSimple();
        }
        
        async function listarColecciones() {
            const dbName = document.getElementById('dbName').value;
            mostrarCargando();
            
            try {
                const response = await fetch('/api/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbName })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarColecciones(data.collections);
                }
            } catch (error) {
                mostrarError('Error: ' + error.message);
            }
        }
        
        // ========== CREATE ==========
        async function crearDocumento() {
            const dbName = document.getElementById('dbName').value;
            const collection = document.getElementById('collection').value;
            
            if (!collection) {
                mostrarError('Por favor, ingresa el nombre de la colección');
                return;
            }
            
            const rows = document.querySelectorAll('#createFields .field-row');
            const nuevoDocumento = {};
            
            rows.forEach(row => {
                const fieldName = row.querySelector('.field-name').value.trim();
                const fieldValue = row.querySelector('.field-value').value.trim();
                
                if (fieldName) {
                    nuevoDocumento[fieldName] = convertirValor(fieldValue);
                }
            });
            
            if (Object.keys(nuevoDocumento).length === 0) {
                mostrarError('Por favor, agrega al menos un campo');
                return;
            }
            
            mostrarCargando();
            
            try {
                const response = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbName, collection, document: nuevoDocumento })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarExito(\`✅ Documento creado exitosamente. ID: \${data.insertedId}\`);
                    document.querySelectorAll('#createFields .field-value').forEach(input => input.value = '');
                }
            } catch (error) {
                mostrarError('Error: ' + error.message);
            }
        }
        
        // ========== UPDATE ==========
        async function actualizarDocumento() {
            const dbName = document.getElementById('dbName').value;
            const collection = document.getElementById('collection').value;
            const searchField = document.getElementById('updateSearchField').value.trim();
            const searchValue = document.getElementById('updateSearchValue').value.trim();
            
            if (!collection || !searchField || !searchValue) {
                mostrarError('Por favor, completa los campos de búsqueda');
                return;
            }
            
            const rows = document.querySelectorAll('#updateFields .field-row');
            const updateDoc = {};
            
            rows.forEach(row => {
                const fieldName = row.querySelector('.field-name').value.trim();
                const fieldValue = row.querySelector('.field-value').value.trim();
                
                if (fieldName) {
                    updateDoc[fieldName] = convertirValor(fieldValue);
                }
            });
            
            if (Object.keys(updateDoc).length === 0) {
                mostrarError('Por favor, indica qué campos actualizar');
                return;
            }
            
            const filter = { [searchField]: convertirValor(searchValue) };
            const update = { $set: updateDoc };
            
            mostrarCargando();
            
            try {
                const response = await fetch('/api/update-many', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbName, collection, filter, update })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarExito(\`✅ Documentos encontrados: \${data.matchedCount}, Actualizados: \${data.modifiedCount}\`);
                }
            } catch (error) {
                mostrarError('Error: ' + error.message);
            }
        }
        
        // ========== DELETE ==========
        async function eliminarDocumento() {
            const dbName = document.getElementById('dbName').value;
            const collection = document.getElementById('collection').value;
            const field = document.getElementById('deleteField').value.trim();
            const value = document.getElementById('deleteValue').value.trim();
            
            if (!collection || !field || !value) {
                mostrarError('Por favor, completa todos los campos');
                return;
            }
            
            if (!confirm(\`¿Estás seguro de eliminar documentos donde \${field} = \${value}?\`)) {
                return;
            }
            
            const filter = { [field]: convertirValor(value) };
            
            mostrarCargando();
            
            try {
                const response = await fetch('/api/delete-many', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dbName, collection, filter })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarExito(\`✅ Documentos eliminados: \${data.deletedCount}\`);
                    document.getElementById('deleteField').value = '';
                    document.getElementById('deleteValue').value = '';
                }
            } catch (error) {
                mostrarError('Error: ' + error.message);
            }
        }
        
        // ========== UI HELPERS ==========
        function mostrarResultados(docs, count) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div class="result-header">
                    <strong>Resultados encontrados: \${count}</strong>
                </div>
                <div class="result-content">
                    <pre>\${JSON.stringify(docs, null, 2)}</pre>
                </div>
            \`;
        }
        
        function mostrarColecciones(collections) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div class="result-header">
                    <strong>Colecciones disponibles: \${collections.length}</strong>
                </div>
                <div class="result-content">
                    <pre>\${JSON.stringify(collections, null, 2)}</pre>
                </div>
            \`;
        }
        
        function mostrarCargando() {
            document.getElementById('results').innerHTML = '<div class="loading">⏳ Cargando...</div>';
        }
        
        function mostrarError(mensaje) {
            document.getElementById('results').innerHTML = \`<div class="error">❌ \${mensaje}</div>\`;
        }
        
        function mostrarExito(mensaje) {
            document.getElementById('results').innerHTML = \`<div class="success">\${mensaje}</div>\`;
        }
        
        function limpiar() {
            document.getElementById('results').innerHTML = '';
        }
    </script>
</body>
</html>
  `);
});

// ========== API ENDPOINTS ==========

// READ: Consultar documentos
app.post('/api/query', async (req, res) => {
  try {
    const { dbName, collection, filter = {} } = req.body;
    const database = client.db(dbName);
    const coll = database.collection(collection);
    const documents = await coll.find(filter).limit(100).toArray();
    res.json({ count: documents.length, documents });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// READ: Listar colecciones
app.post('/api/collections', async (req, res) => {
  try {
    const { dbName } = req.body;
    const database = client.db(dbName);
    const collections = await database.listCollections().toArray();
    res.json({ collections: collections.map(c => c.name) });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// CREATE: Insertar un documento
app.post('/api/create', async (req, res) => {
  try {
    const { dbName, collection, document } = req.body;
    const database = client.db(dbName);
    const coll = database.collection(collection);
    const result = await coll.insertOne(document);
    res.json({ insertedId: result.insertedId });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// UPDATE: Actualizar múltiples documentos
app.post('/api/update-many', async (req, res) => {
  try {
    const { dbName, collection, filter, update } = req.body;
    const database = client.db(dbName);
    const coll = database.collection(collection);
    const result = await coll.updateMany(filter, update);
    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// DELETE: Eliminar múltiples documentos
app.post('/api/delete-many', async (req, res) => {
  try {
    const { dbName, collection, filter } = req.body;
    const database = client.db(dbName);
    const coll = database.collection(collection);
    const result = await coll.deleteMany(filter);
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Abre tu navegador y ve a: http://localhost:${PORT}\n`);
});

// Manejo de cierre
process.on('SIGINT', async () => {
  await client.close();
  console.log('\n✓ Conexión a MongoDB cerrada');
  process.exit(0);
});