'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/features/auth/AuthProvider';
import { 
  DashboardService, 
  DashboardMetrics, 
  RecentLead, 
  AnalyticsSummary 
} from '@/features/dashboard/dashboard.service';
import styles from '@/styles/Dashboard.module.css';
import { TopMatchesCard } from '@/components/dashboard/TopMatchesCard';
import { RecommendedListingsCard } from '@/components/dashboard/RecommendedListingsCard';
import { RecommendedActionsCard } from '@/components/dashboard/RecommendedActionsCard';
import { ListingsService } from '@/services/ListingsService';

export default function DashboardPage() {
  useAuthGuard();
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<RecentLead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, l] = await Promise.all([
          DashboardService.getMetrics(),
          DashboardService.getRecentLeads(),
        ]);
        setMetrics(m);
        setLeads(l);
      } catch (err) {
        console.error('Dashboard metrics error:', err);
      }

      try {
        const a = await DashboardService.getAnalytics();
        setAnalytics(a);
      } catch {
        // Analytics requer role OWNER/ADMIN — falha silenciosa para USER
      }

      try {
        const listingsData = await ListingsService.getListings({ page: 1, limit: 10 });
        setUserListings(listingsData.data.filter((l: any) => l.ownerId === user?.id));
      } catch (err) {
        console.error('Error fetching user listings:', err);
      }

      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <p style={{ color: '#90a3bf', fontSize: '14px' }}>Carregando dados estratégicos...</p>
      </div>
    );
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <span className={styles.pill}>Central de Operações • FINANHUB</span>
          <h2>Olá, {user?.fullName?.split(' ')[0] || 'Vitor'}.<br />Seu ecossistema de oportunidades está ativo.</h2>
          <p>
            Acompanhe anúncios, leads, conversas, favoritos, solicitações e sinais de performance em uma visão executiva pensada para operações de alto valor.
          </p>

          <div className={styles.btnRow}>
            <Link href="/dashboard/listings/new/edit" className={`${styles.btn} ${styles.btnBrand}`}>
              Publicar oportunidade
            </Link>
            <Link href="/dashboard/deals" className={`${styles.btn} ${styles.btnGhost}`}>
              Ver marketplace
            </Link>
          </div>

          <div className={styles.heroKpis}>
            <div className={styles.miniKpi}>
              <div className={styles.label}>Conta</div>
              <div className={styles.value}>92%</div>
              <div className={styles.delta}>Perfil estratégico completo</div>
            </div>
            <div className={styles.miniKpi}>
              <div className={styles.label}>Plano</div>
              <div className={styles.value}>Elite</div>
              <div className={styles.delta}>Data Room liberado</div>
            </div>
            <div className={styles.miniKpi}>
              <div className={styles.label}>Status</div>
              <div className={styles.value}>Ativo</div>
              <div className={styles.delta}>Todos os módulos online</div>
            </div>
            <div className={styles.miniKpi}>
              <div className={styles.label}>Matching</div>
              <div className={styles.value}>12</div>
              <div className={styles.delta}>Investidores com fit</div>
            </div>
          </div>
        </div>

        <div className={styles.heroSide}>
          <div className={styles.heroSideHeading}>
            <h3>Insights HAYIA</h3>
            <span className={styles.pill}>Preview IA</span>
          </div>
          <div className={styles.scoreWrap}>
            <div className={styles.ring}><strong>76</strong></div>
            <div className={styles.scoreList}>
              <div>
                <div className={styles.scoreItem}><span>Score de atratividade</span><strong>76/100</strong></div>
                <div className={styles.bar}><span style={{ width: '76%' }}></span></div>
              </div>
              <div>
                <div className={styles.scoreItem}><span>Completude do anúncio</span><strong>88%</strong></div>
                <div className={styles.bar}><span style={{ width: '88%' }}></span></div>
              </div>
              <div>
                <div className={styles.scoreItem}><span>Potencial de resposta</span><strong>63%</strong></div>
                <div className={styles.bar}><span style={{ width: '63%' }}></span></div>
              </div>
            </div>
          </div>
          <div className={styles.btnRow}>
            <Link href="/dashboard/matching" className={`${styles.btn} ${styles.btnBrand}`}>
              Ativar matching
            </Link>
            <Link href="/dashboard/stats" className={`${styles.btn} ${styles.btnGhost}`}>
              Revisar estratégia
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.kpiGrid} style={{ gap: '18px' }}>
        <div className={`${styles.card} ${styles.kpi}`}>
          <div className={styles.top}>
            <div className={styles.tag}>▣</div>
            <span className={`${styles.badge} ${styles.bGreen}`}>+3 esta semana</span>
          </div>
          <div className={styles.label}>Anúncios ativos</div>
          <div className={styles.value}>{metrics?.listings.active ? String(metrics.listings.active).padStart(2, '0') : '08'}</div>
          <div className={styles.sub}>
            {metrics?.listings.active || 6} publicados • {metrics?.listings.pending || 2} em revisão
          </div>
          <div className={`${styles.trend} ${styles.up}`}>▲ +18% em visualizações</div>
        </div>

        <div className={`${styles.card} ${styles.kpi}`}>
          <div className={styles.top}>
            <div className={styles.tag}>✦</div>
            <span className={`${styles.badge} ${styles.bBlue}`}>quentes 09</span>
          </div>
          <div className={styles.label}>Leads recebidos</div>
          <div className={styles.value}>{metrics?.leads.total ? String(metrics.leads.total).padStart(2, '0') : '27'}</div>
          <div className={styles.sub}>12 qualificados pela IA</div>
          <div className={`${styles.trend} ${styles.up}`}>▲ +24% na semana</div>
        </div>

        <div className={`${styles.card} ${styles.kpi}`}>
          <div className={styles.top}>
            <div className={styles.tag}>⌁</div>
            <span className={`${styles.badge} ${styles.bOrange}`}>atenção</span>
          </div>
          <div className={styles.label}>Mensagens não lidas</div>
          <div className={styles.value}>14</div>
          <div className={styles.sub}>4 exigem resposta hoje</div>
          <div className={`${styles.trend} ${styles.warn}`}>● prioridade operacional</div>
        </div>

        <div className={`${styles.card} ${styles.kpi}`}>
          <div className={styles.top}>
            <div className={styles.tag}>◎</div>
            <span className={`${styles.badge} ${styles.bRed}`}>2 alertas</span>
          </div>
          <div className={styles.label}>Visitas 30 dias</div>
          <div className={styles.value}>
            {analytics?.kpis.monthlyViews ? new Intl.NumberFormat('pt-BR').format(analytics.kpis.monthlyViews) : '4.281'}
          </div>
          <div className={styles.sub}>Conversão média de {analytics?.kpis.conversionRate || '2,8%'}</div>
          <div className={`${styles.trend} ${styles.info}`}>▲ +9% em relação ao período anterior</div>
        </div>
      </section>

      {/* HAYIA Commercial Automation: Recommended Actions */}
      <section className="mb-8">
        <RecommendedActionsCard />
      </section>

      {/* HAYIA Intelligence Matching Layer */}
      <section className="mb-8">
        {userListings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecommendedListingsCard />
            </div>
            <div className="lg:col-span-1">
              <TopMatchesCard listingId={userListings[0].id} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <RecommendedListingsCard />
          </div>
        )}
      </section>

      <section className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3>Performance da conta</h3>
              <p className={styles.headSub}>Visualizações, leads e intenção de contato nos últimos 7 dias</p>
            </div>
            <div className={styles.legend}>
              <span><i className={`${styles.dot} ${styles.teal}`}></i> Leads</span>
              <span><i className={`${styles.dot} ${styles.blue}`}></i> Visitas</span>
            </div>
          </div>
          <div className={styles.chart}>
            <div className={styles.gridline}></div>
            <div className={styles.gridline}></div>
            <div className={styles.gridline}></div>
            <div className={styles.gridline}></div>
            <svg viewBox="0 0 1000 310" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="fillBlue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(77,124,255,.30)"/>
                  <stop offset="100%" stopColor="rgba(77,124,255,0)"/>
                </linearGradient>
                <linearGradient id="fillTeal" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,184,178,.26)"/>
                  <stop offset="100%" stopColor="rgba(0,184,178,0)"/>
                </linearGradient>
              </defs>

              <path d="M40,250 C120,220 160,210 220,188 C280,165 340,170 400,136 C470,98 520,122 580,112 C640,103 690,64 760,82 C820,98 900,66 960,48 L960,310 L40,310 Z"
                    fill="url(#fillBlue)"/>
              <path d="M40,272 C110,262 165,230 220,218 C285,205 340,232 400,182 C465,126 518,160 580,144 C650,126 705,112 760,118 C820,126 894,78 960,96 L960,310 L40,310 Z"
                    fill="url(#fillTeal)"/>

              <path d="M40,250 C120,220 160,210 220,188 C280,165 340,170 400,136 C470,98 520,122 580,112 C640,103 690,64 760,82 C820,98 900,66 960,48"
                    fill="none" stroke="#4d7cff" strokeWidth="4" strokeLinecap="round"/>
              <path d="M40,272 C110,262 165,230 220,218 C285,205 340,232 400,182 C465,126 518,160 580,144 C650,126 705,112 760,118 C820,126 894,78 960,96"
                    fill="none" stroke="#00b8b2" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <div className={styles.axis}>
              <span>Sex.</span><span>Sáb.</span><span>Dom.</span><span>Seg.</span><span>Ter.</span><span>Qua.</span><span>Qui.</span>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ gap: '18px' }}>
          <div className={styles.cardHead}>
            <div>
              <h3>Ações rápidas</h3>
              <p className={styles.headSub}>Atalhos para o que mais importa na operação</p>
            </div>
          </div>
          <div className={styles.quickActions} style={{ gap: '18px' }}>
            <Link className={styles.qa} href="/dashboard/listings"><strong>Gerenciar anúncios</strong><span>Editar, duplicar, pausar e publicar novas oportunidades.</span></Link>
            <Link className={styles.qa} href="/dashboard/messages"><strong>Caixa de mensagens</strong><span>Responder leads, centralizar conversas e acompanhar histórico.</span></Link>
            <Link className={styles.qa} href="/dashboard/deals"><strong>Ver marketplace</strong><span>Visualizar a vitrine pública como investidor e validar posicionamento.</span></Link>
            <Link className={styles.qa} href="/dashboard/plans"><strong>Plano & upgrades</strong><span>Comparar recursos, desbloquear Data Room e elevar visibilidade.</span></Link>
            <Link className={styles.qa} href="/dashboard/leads"><strong>Leads qualificados</strong><span>Priorizar investidores com maior aderência e intenção real.</span></Link>
            <Link className={styles.qa} href="/dashboard/stats"><strong>Analytics completo</strong><span>Explorar performance por anúncio, categoria e período.</span></Link>
          </div>
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3>Meus anúncios</h3>
              <p className={styles.headSub}>Visão rápida da base ativa e dos itens em revisão</p>
            </div>
            <Link className={`${styles.btn} ${styles.btnGhost}`} href="/dashboard/listings">Ver todos</Link>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Anúncio</th>
                  <th>Status</th>
                  <th>Visualizações</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Compra e Venda de Empresas — Operação Industrial</td>
                  <td><span className={`${styles.badge} ${styles.bGreen}`}>Ativo</span></td>
                  <td>1.284</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>Investimentos — Rodada Growth</td>
                  <td><span className={`${styles.badge} ${styles.bBlue}`}>Destaque</span></td>
                  <td>932</td>
                  <td>7</td>
                </tr>
                <tr>
                  <td>Serviços e Consultoria — Advisory B2B</td>
                  <td><span className={`${styles.badge} ${styles.bOrange}`}>Em revisão</span></td>
                  <td>411</td>
                  <td>3</td>
                </tr>
                <tr>
                  <td>Imóveis para Negócios — Ativo Logístico</td>
                  <td><span className={`${styles.badge} ${styles.bRed}`}>Ajuste pendente</span></td>
                  <td>267</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h3>Inteligência & alertas</h3>
              <p className={styles.headSub}>Sinais da HAYIA e notificações operacionais</p>
            </div>
          </div>

          <div className={styles.insight}>
            <div>
              <h4>12 investidores com fit para seu anúncio premium</h4>
              <p>Seu anúncio de investimentos atingiu um grupo com alta aderência. Ative o matching e libere resposta prioritária.</p>
            </div>
            <div className={styles.spark}>
              <svg width="96" height="32" viewBox="0 0 96 32" aria-hidden="true">
                <path d="M2 26 C14 26, 14 20, 24 20 S36 10, 48 10 S64 16, 72 14 S84 8, 94 4" fill="none" stroke="#00b8b2" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className={styles.feed}>
            <div className={styles.feedItem}>
              <div className={styles.feedIcon}>✦</div>
              <div>
                <strong>Novo lead qualificado no anúncio “Operação Industrial”</strong>
                <span>Investidor com faixa-alvo aderente, objetivo de aquisição estratégica e aceite de intermediação.</span>
              </div>
              <div className={styles.time}>agora</div>
            </div>

            <div className={styles.feedItem}>
              <div className={styles.feedIcon}>⌁</div>
              <div>
                <strong>4 mensagens aguardam resposta</strong>
                <span>A rapidez de resposta impacta sua taxa de conversão e aumenta a confiança do investidor.</span>
              </div>
              <div className={styles.time}>12 min</div>
            </div>

            <div className={styles.feedItem}>
              <div className={styles.feedIcon}>⚑</div>
              <div>
                <strong>Seu perfil está 92% completo</strong>
                <span>Adicione documentos e dados da empresa para elevar a credibilidade institucional.</span>
              </div>
              <div className={styles.time}>1 h</div>
            </div>

            <div className={styles.feedItem}>
              <div className={styles.feedIcon}>◎</div>
              <div>
                <strong>Visitas em alta na categoria Investimentos</strong>
                <span>O interesse subiu nos últimos 7 dias. Considerar destacar o anúncio pode ampliar captação.</span>
              </div>
              <div className={styles.time}>hoje</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
