import locationData from '../data/estados-cidades.json';

export interface State {
  id: number;
  sigla: string;
  nome: string;
  cidades: City[];
}

export interface City {
  id: number;
  nome: string;
}

/**
 * Retorna todos os estados ordenados alfabeticamente por nome.
 */
export function getEstados() {
  return [...locationData.estados].sort((a, b) => a.nome.localeCompare(b.nome));
}

/**
 * Retorna as cidades de um estado específico através da sua sigla (UF).
 * @param sigla A sigla do estado (ex: 'SP', 'RJ')
 */
export function getCidadesByEstado(sigla: string) {
  if (!sigla) return [];
  const estado = locationData.estados.find(e => e.sigla === sigla);
  if (!estado) return [];
  return [...estado.cidades].sort((a, b) => a.nome.localeCompare(b.nome));
}
