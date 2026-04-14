/**
 * FINANHUB ADVANCED FILTER - WEB COMPONENT (SHADOW DOM)
 * Totalmente isolado, paridade visual 1:1, zero dependência externa.
 */

class FinanhubFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // Estado inicial
    this.state = {
      busca: "",
      categoria: "",
      subcategoria: "",
      precoMin: "0",
      precoMax: "1000000000",
      rangeValue: "0",
      estado: "",
      cidade: "",
      modeloNegocio: "",
      tipoOportunidade: "",
      verificado: false,
      dueDiligence: false,
      iaScore: "",
      ordenarPor: "recentes"
    };

    this.locationData = null;
    this.isLoadingLocations = false;
  }

  connectedCallback() {
    this.render();
  }

  // Carregamento Preguiçoso de Locais
  async loadLocations() {
    if (this.locationData || this.isLoadingLocations) return;
    
    this.isLoadingLocations = true;
    try {
      const response = await fetch('/data/locations.json');
      this.locationData = await response.json();
      this.render(); // Re-render para preencher os estados
    } catch (err) {
      console.error("Erro ao carregar localizações:", err);
    } finally {
      this.isLoadingLocations = false;
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }

  handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    this.state[name] = val;
    
    if (name === 'rangeValue') {
       this.state.precoMax = val;
    }

    if (name === 'estado') {
      this.state.cidade = "";
    }

    // Ao interagir com Estado, carregar dados se necessário
    if (name === 'estado' && !this.locationData) {
      this.loadLocations();
    }

    this.render();
  }

  applyFilters() {
    this.dispatchEvent(new CustomEvent('filter-change', {
      detail: { ...this.state },
      bubbles: true,
      composed: true
    }));
  }

  resetFilters() {
    this.state = {
      busca: "",
      categoria: "",
      subcategoria: "",
      precoMin: "0",
      precoMax: "1000000000",
      rangeValue: "0",
      estado: "",
      cidade: "",
      modeloNegocio: "",
      tipoOportunidade: "",
      verificado: false,
      dueDiligence: false,
      iaScore: "",
      ordenarPor: "recentes"
    };
    this.render();
    this.applyFilters();
  }

  getStyles() {
    return `
      :host {
        display: block;
        width: 320px;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: white;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .container {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }

      /* HEADER */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        margin-bottom: 24px;
      }

      .header h3 {
        color: #12b3af;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 2px;
        font-weight: 900;
      }

      .header p {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.3);
        margin-top: 4px;
        text-transform: uppercase;
      }

      .btn-reset {
        all: unset;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.3);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: color 0.2s;
        font-weight: bold;
      }

      .btn-reset:hover { color: #12b3af; }

      /* BLOCKS */
      .section {
        margin-bottom: 24px;
      }

      .section-title {
        color: #12b3af;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 2px;
        font-weight: 900;
        margin-bottom: 16px;
        display: block;
      }

      /* INPUTS */
      input[type="text"],
      select {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 10px 12px;
        color: white;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        appearance: none;
      }

      select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
        padding-right: 40px;
      }

      input[type="text"]:focus, select:focus {
        border-color: rgba(18, 179, 175, 0.5);
      }

      /* SEARCH ICON OVERLAY */
      .search-wrapper {
        position: relative;
        margin-bottom: 24px;
      }
      
      .search-wrapper input {
        padding-left: 36px !important;
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.2;
        pointer-events: none;
      }

      /* PRICE RANGE */
      .price-header {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: rgba(255, 255, 255, 0.2);
        font-weight: bold;
        margin-bottom: 8px;
        text-transform: uppercase;
      }

      input[type="range"] {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        appearance: none;
        cursor: pointer;
        accent-color: #12b3af;
        margin-bottom: 12px;
      }

      .price-current {
        text-align: center;
        margin-bottom: 16px;
      }

      .price-current span {
        background: rgba(255,255,255,0.05);
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        color: #12b3af;
        font-weight: bold;
        border: 1px solid rgba(255,255,255,0.05);
      }

      .price-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .input-with-label {
        position: relative;
      }

      .input-with-label span {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 10px;
        color: rgba(255,255,255,0.2);
        font-weight: 900;
        pointer-events: none;
        text-transform: uppercase;
      }

      .input-with-label input {
        padding-left: 40px !important;
        font-size: 12px !important;
      }

      /* CHECKBOXES */
      .checkbox-container {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 16px;
      }

      .checkbox-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 12px;
      }

      .checkbox-item:last-child { margin-bottom: 0; }

      .checkbox-item input {
        accent-color: #12b3af;
        width: 16px;
        height: 16px;
      }

      /* GRID FOR SCORE/SORT */
      .bottom-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.05);
        margin-top: 12px;
      }

      .bottom-label {
        font-size: 9px;
        color: #12b3af;
        font-weight: 900;
        text-transform: uppercase;
        margin-bottom: 8px;
        display: block;
        letter-spacing: 1px;
      }

      /* APPLY BUTTON */
      .btn-apply {
        width: 100%;
        background: #12b3af;
        color: #000;
        border: none;
        border-radius: 12px;
        padding: 18px;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2px;
        cursor: pointer;
        margin-top: 24px;
        transition: all 0.2s;
        box-shadow: 0 10px 30px rgba(18, 179, 175, 0.2);
      }

      .btn-apply:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .btn-apply:active {
        transform: translateY(0);
      }
    `;
  }

  render() {
    const states = this.locationData ? this.locationData.estados : [];
    const selectedStateObj = states.find(s => s.sigla === this.state.estado);
    const cities = selectedStateObj ? selectedStateObj.cidades : [];

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="container">
        <div class="header">
          <div>
            <h3>Busca Avançada</h3>
            <p>Refine sua procura</p>
          </div>
          <button class="btn-reset" onclick="this.getRootNode().host.resetFilters()">Limpar</button>
        </div>

        <div class="search-wrapper">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" name="busca" placeholder="O que você procura?" value="${this.state.busca}" oninput="this.getRootNode().host.handleInputChange(event)">
        </div>

        <div class="section">
          <span class="section-title">Categoria Principal</span>
          <select name="categoria" onchange="this.getRootNode().host.handleInputChange(event)">
            <option value="">Todas as Categorias</option>
            <option value="empresas" ${this.state.categoria === 'empresas' ? 'selected' : ''}>Compra e Venda de Empresas</option>
            <option value="investimentos" ${this.state.categoria === 'investimentos' ? 'selected' : ''}>Investimentos</option>
            <option value="franquias" ${this.state.categoria === 'franquias' ? 'selected' : ''}>Franquias</option>
            <option value="startups" ${this.state.categoria === 'startups' ? 'selected' : ''}>Startups</option>
          </select>
        </div>

        <div class="section">
          <div class="price-header">
            <span>R$ 0</span>
            <span style="color: #12b3af">Faixa de Preço</span>
            <span>R$ 1B+</span>
          </div>
          <input type="range" name="rangeValue" min="0" max="1000000000" step="1000000" value="${this.state.rangeValue}" oninput="this.getRootNode().host.handleInputChange(event)">
          <div class="price-current">
            <span>${this.formatCurrency(this.state.rangeValue)}</span>
          </div>
          <div class="price-inputs">
            <div class="input-with-label">
              <span>Min</span>
              <input type="text" name="precoMin" value="${this.state.precoMin}" oninput="this.getRootNode().host.handleInputChange(event)">
            </div>
            <div class="input-with-label">
              <span>Max</span>
              <input type="text" name="precoMax" value="${this.state.precoMax}" oninput="this.getRootNode().host.handleInputChange(event)">
            </div>
          </div>
        </div>

        <div class="section">
          <span class="section-title">Localização</span>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <select name="estado" onchange="this.getRootNode().host.handleInputChange(event)" onmousedown="this.getRootNode().host.loadLocations()">
              <option value="">Selecione o Estado</option>
              ${states.map(s => `<option value="${s.sigla}" ${this.state.estado === s.sigla ? 'selected' : ''}>${s.nome}</option>`).join('')}
              ${this.isLoadingLocations ? '<option disabled>Carregando...</option>' : ''}
            </select>
            <select name="cidade" ${!this.state.estado ? 'disabled style="opacity:0.4"' : ''} onchange="this.getRootNode().host.handleInputChange(event)">
              <option value="">Selecione a Cidade</option>
              ${cities.map(c => `<option value="${c.nome}" ${this.state.cidade === c.nome ? 'selected' : ''}>${c.nome}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="section">
          <span class="section-title">Modelo de Negócio</span>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <select name="modeloNegocio" onchange="this.getRootNode().host.handleInputChange(event)">
              <option value="">Todos os Modelos</option>
              <option value="B2B" ${this.state.modeloNegocio === 'B2B' ? 'selected' : ''}>B2B</option>
              <option value="B2C" ${this.state.modeloNegocio === 'B2C' ? 'selected' : ''}>B2C</option>
              <option value="SaaS" ${this.state.modeloNegocio === 'SaaS' ? 'selected' : ''}>SaaS</option>
            </select>
            <select name="tipoOportunidade" onchange="this.getRootNode().host.handleInputChange(event)">
              <option value="">Tipo de Oportunidade</option>
              <option value="venda" ${this.state.tipoOportunidade === 'venda' ? 'selected' : ''}>Venda Total</option>
              <option value="equity" ${this.state.tipoOportunidade === 'equity' ? 'selected' : ''}>Venda Parcial (Equity)</option>
            </select>
          </div>
        </div>

        <div class="section">
          <span class="section-title">Qualidade do Ativo</span>
          <div class="checkbox-container">
            <label class="checkbox-item">
              <span>Verificado</span>
              <input type="checkbox" name="verificado" ${this.state.verificado ? 'checked' : ''} onchange="this.getRootNode().host.handleInputChange(event)">
            </label>
            <label class="checkbox-item">
              <span>Due Diligence</span>
              <input type="checkbox" name="dueDiligence" ${this.state.dueDiligence ? 'checked' : ''} onchange="this.getRootNode().host.handleInputChange(event)">
            </label>
          </div>
        </div>

        <div class="bottom-grid">
          <div>
            <span class="bottom-label">Score IA</span>
            <select name="iaScore" style="font-size: 11px;" onchange="this.getRootNode().host.handleInputChange(event)">
              <option value="">Qualquer</option>
              <option value="80" ${this.state.iaScore === '80' ? 'selected' : ''}>80+</option>
              <option value="60" ${this.state.iaScore === '60' ? 'selected' : ''}>60+</option>
            </select>
          </div>
          <div>
            <span class="bottom-label">Ordenar</span>
            <select name="ordenarPor" style="font-size: 11px;" onchange="this.getRootNode().host.handleInputChange(event)">
              <option value="recentes" ${this.state.ordenarPor === 'recentes' ? 'selected' : ''}>Recentes</option>
              <option value="preco_menor" ${this.state.ordenarPor === 'preco_menor' ? 'selected' : ''}>Menor Preço</option>
              <option value="preco_maior" ${this.state.ordenarPor === 'preco_maior' ? 'selected' : ''}>Maior Preço</option>
            </select>
          </div>
        </div>

        <button class="btn-apply" onclick="this.getRootNode().host.applyFilters()">Aplicar Filtros</button>
      </div>
    `;
  }
}

customElements.define('finanhub-filter', FinanhubFilter);
