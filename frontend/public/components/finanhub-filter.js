/**
 * FINANHUB ADVANCED FILTER - WEB COMPONENT (SHADOW DOM)
 * Totalmente isolado, paridade visual 1:1, zero dependência externa.
 */

class FinanhubFilter extends HTMLElement {
  constructor() {
    super();
    // Mapeamento de Subcategorias (Consistente com o Banco)
    this.subcategoryGroups = {
      "buying-selling": [
        { value: "compra-empresas", label: "Compra de Empresas" },
        { value: "venda-empresas", label: "Venda de Empresas" },
        { value: "sociedades", label: "Sociedades" },
        { value: "arrendamento", label: "Arrendamento" }
      ],
      "investments": [
        { value: "empresas-existentes", label: "Empresas Existentes" },
        { value: "projetos-investimento", label: "Projetos" },
        { value: "startups-investimento", label: "Startups" }
      ],
      "franchise": [
        { value: "comprar-franquias", label: "Comprar Franquias" },
        { value: "vender-franquias", label: "Vender Franquias" },
        { value: "licenciamento-produtos", label: "Licenciamento de Produtos" },
        { value: "licenciamento-marcas", label: "Licenciamento de Marcas" }
      ],
      "startups": [
        { value: "investir-projetos", label: "Investir em Projetos" },
        { value: "investidores-anjo", label: "Investidores Anjo" },
        { value: "parceria-desenvolvimento", label: "Parceria Desenvolvimento" }
      ],
      "services": [
        { value: "servicos-financeiros", label: "Serviços Financeiros" },
        { value: "servicos-juridicos", label: "Serviços Jurídicos" },
        { value: "servicos-contabeis", label: "Serviços Contábeis" },
        { value: "logistica", label: "Logística" },
        { value: "importacao-exportacao", label: "Importação e Exportação" }
      ],
      "real-estate": [
        { value: "imoveis-residenciais", label: "Imóveis Residenciais" },
        { value: "imoveis-industriais", label: "Imóveis Industriais" },
        { value: "galpoes-comerciais", label: "Galpões" },
        { value: "terrenos-comerciais", label: "Terrenos" }
      ],
      "premium": [
        { value: "barcos-premium", label: "Barcos" },
        { value: "carros-premium", label: "Carros" },
        { value: "motos-premium", label: "Motos" },
        { value: "fazendas-premium", label: "Fazendas" },
        { value: "titulos-premium", label: "Títulos" }
      ]
    };

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
    // Sincronizar estado inicial com os atributos data-initial-* se presentes
    const initialSearch = this.getAttribute('data-initial-search');
    const initialCategory = this.getAttribute('data-initial-category');
    const initialSubcategory = this.getAttribute('data-initial-subcategory');
    
    if (initialSearch) this.state.busca = initialSearch;
    if (initialCategory) this.state.categoria = initialCategory;
    if (initialSubcategory) this.state.subcategoria = initialSubcategory;

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
    if (!e.target) return;
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    this.state[name] = val;
    
    if (name === 'rangeValue') {
       this.state.precoMax = val;
    }

    if (name === 'estado') {
      this.state.cidade = "";
    }

    // Reset de subcategoria ao trocar categoria
    if (name === 'categoria') {
      this.state.subcategoria = "";
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
        background: #111111;
        border: 1px solid rgba(18, 179, 175, 0.1);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
      }

      /* HEADER */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        margin-bottom: 24px;
      }

      .header h3 {
        color: #12b3af;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 2px;
        font-weight: 900;
        text-shadow: 0 0 20px rgba(18, 179, 175, 0.3);
      }

      .header p {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 6px;
        text-transform: uppercase;
        font-weight: 600;
      }

      .btn-reset {
        all: unset;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 800;
      }

      .btn-reset:hover { 
        color: white;
        background: rgba(255, 255, 255, 0.1);
      }

      /* BLOCKS */
      .section {
        margin-bottom: 28px;
        animation: fadeIn 0.5s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .section-title {
        color: #12b3af;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 1.5px;
        font-weight: 800;
        margin-bottom: 16px;
        display: block;
        opacity: 0.8;
      }

      /* INPUTS */
      input[type="text"],
      select {
        width: 100%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px 14px;
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.3s;
        appearance: none;
      }

      select {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(18,179,175,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        background-size: 14px;
        padding-right: 44px;
        font-weight: 500;
      }

      input[type="text"]:focus, select:focus {
        border-color: #12b3af;
        background: rgba(255, 255, 255, 0.07);
        box-shadow: 0 0 0 4px rgba(18, 179, 175, 0.1);
      }

      /* SEARCH ICON OVERLAY */
      .search-wrapper {
        position: relative;
        margin-bottom: 28px;
      }
      
      .search-wrapper input {
        padding-left: 42px !important;
        font-weight: 600;
      }

      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #12b3af;
        opacity: 0.8;
        pointer-events: none;
      }

      /* PRICE RANGE */
      .price-header {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        font-weight: 700;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      input[type="range"] {
        width: 100%;
        height: 6px;
        background: rgba(255,255,255,0.08);
        border-radius: 10px;
        appearance: none;
        cursor: pointer;
        accent-color: #12b3af;
        margin-bottom: 16px;
      }

      .price-current {
        text-align: center;
        margin-bottom: 20px;
      }

      .price-current span {
        background: rgba(18, 179, 175, 0.1);
        padding: 8px 18px;
        border-radius: 30px;
        font-size: 14px;
        color: #12b3af;
        font-weight: 800;
        border: 1px solid rgba(18, 179, 175, 0.2);
        box-shadow: 0 10px 20px rgba(18, 179, 175, 0.1);
      }

      .price-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .input-with-label {
        position: relative;
      }

      .input-with-label span {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 9px;
        color: rgba(255,255,255,0.4);
        font-weight: 900;
        pointer-events: none;
        text-transform: uppercase;
      }

      .input-with-label input {
        padding-left: 44px !important;
        font-size: 13px !important;
        font-weight: 700;
      }

      /* CHECKBOXES */
      .checkbox-container {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 20px;
      }

      .checkbox-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 8px 0;
        transition: all 0.2s;
      }

      .checkbox-item:hover {
        opacity: 0.8;
      }

      .checkbox-item span {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 600;
      }

      .checkbox-item input {
        accent-color: #12b3af;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      /* APPLY BUTTON */
      .btn-apply {
        width: 100%;
        background: #12b3af;
        color: #000;
        border: none;
        border-radius: 16px;
        padding: 20px;
        font-size: 12px;
        font-weight: 950;
        text-transform: uppercase;
        letter-spacing: 3px;
        cursor: pointer;
        margin-top: 12px;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 15px 40px rgba(18, 179, 175, 0.3);
      }

      .btn-apply:hover {
        background: white;
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 20px 50px rgba(18, 179, 175, 0.4);
      }

      .btn-apply:active {
        transform: translateY(-2px);
      }
    `;
  }

  render() {
    const states = this.locationData ? this.locationData.estados : [];
    const selectedStateObj = states.find(s => s.sigla === this.state.estado);
    const cities = selectedStateObj ? selectedStateObj.cidades : [];
    
    // Pegar subcategorias do grupo selecionado
    const availableSubcategories = this.subcategoryGroups[this.state.categoria] || [];

    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="container">
        <div class="header">
          <div>
            <h3>Busca Avançada</h3>
            <p>Institutional Marketplace</p>
          </div>
          <button class="btn-reset" onclick="this.getRootNode().host.resetFilters()">Limpar</button>
        </div>

        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" name="busca" placeholder="Filtro rápido..." value="${this.state.busca}" oninput="this.getRootNode().host.handleInputChange(event)">
        </div>

        <div class="section">
          <span class="section-title">Categoria Principal</span>
          <select name="categoria" onchange="this.getRootNode().host.handleInputChange(event)">
            <option value="">Todas as Oportunidades</option>
            <option value="buying-selling" ${this.state.categoria === 'buying-selling' ? 'selected' : ''}>Compra e Venda de Empresas</option>
            <option value="investments" ${this.state.categoria === 'investments' ? 'selected' : ''}>Investimentos</option>
            <option value="franchise" ${this.state.categoria === 'franchise' ? 'selected' : ''}>Franquias e Licenciamento</option>
            <option value="startups" ${this.state.categoria === 'startups' ? 'selected' : ''}>Projetos e Startups</option>
            <option value="assets" ${this.state.categoria === 'assets' ? 'selected' : ''}>Ativos e Estruturas</option>
            <option value="services" ${this.state.categoria === 'services' ? 'selected' : ''}>Serviços e Consultoria</option>
            <option value="real-estate" ${this.state.categoria === 'real-estate' ? 'selected' : ''}>Imóveis para Negócios</option>
            <option value="premium" ${this.state.categoria === 'premium' ? 'selected' : ''}>Oportunidades Premium</option>
            <option value="partnership" ${this.state.categoria === 'partnership' ? 'selected' : ''}>Divulgação e Parcerias</option>
          </select>
        </div>

        ${availableSubcategories.length > 0 ? `
        <div class="section">
          <span class="section-title">Subcategoria</span>
          <select name="subcategoria" onchange="this.getRootNode().host.handleInputChange(event)">
            <option value="">Todas as Subcategorias</option>
            ${availableSubcategories.map(sub => `
              <option value="${sub.value}" ${this.state.subcategoria === sub.value ? 'selected' : ''}>${sub.label}</option>
            `).join('')}
          </select>
        </div>
        ` : ''}

        <div class="section">
          <div class="price-header">
            <span>R$ 0</span>
            <span style="color: #12b3af">Faixa de Investimento</span>
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
          <span class="section-title">Certificações</span>
          <div class="checkbox-container">
            <label class="checkbox-item">
              <span>Empresa Verificada</span>
              <input type="checkbox" name="verificado" ${this.state.verificado ? 'checked' : ''} onchange="this.getRootNode().host.handleInputChange(event)">
            </label>
            <label class="checkbox-item">
              <span>Auditado / Due Diligence</span>
              <input type="checkbox" name="dueDiligence" ${this.state.dueDiligence ? 'checked' : ''} onchange="this.getRootNode().host.handleInputChange(event)">
            </label>
          </div>
        </div>

        <button class="btn-apply" onclick="this.getRootNode().host.applyFilters()">Aplicar Filtros</button>
      </div>
    `;
  }
}

customElements.define('finanhub-filter', FinanhubFilter);
