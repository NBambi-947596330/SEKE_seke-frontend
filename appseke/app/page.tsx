'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "@/components/itemheaderpost/itemheaderpost";
import ItemPostProfissonal from "@/components/itempostprofissional/itempostprofissional";

import { Users, Briefcase } from 'lucide-react';
import SolicitacaoCliente from '@/components/itempostclients/itempostclient';
import { lightTheme } from '@/style/light';

interface FeedItem {
  tipo: 'solicitacao' | 'profissional';
  data: any;
  id: string;
}

export default function Home() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'todos' | 'solicitacoes' | 'profissionais'>('todos');

  // Dados de exemplo para solicitações de clientes
  const solicitacoes = [
    {
      id: 'sol1',
      nome: "António Fernandes",
      tempoSolicitacao: "há 5 min",
      distancia: "1.2 km",
      servico: "Electricista",
      descricao: "Instalação de ar condicionado no apartamento",
      localizacao: "Luanda",
      bairro: "Kilamba",
      prioridade: "alta" as const,
      telefone: "+244 923 456 789"
    },
    {
      id: 'sol2',
      nome: "Maria Santos",
      tempoSolicitacao: "há 15 min",
      distancia: "3.5 km",
      servico: "Canalizador",
      descricao: "Torneira com vazamento na cozinha",
      localizacao: "Luanda",
      bairro: "Talatona",
      prioridade: "media" as const,
      telefone: "+244 933 456 123"
    },
    {
      id: 'sol3',
      nome: "João Paulo",
      tempoSolicitacao: "há 30 min",
      distancia: "5.0 km",
      servico: "Pintor",
      descricao: "Pintura de sala e quartos",
      localizacao: "Luanda",
      bairro: "Ingombotas",
      prioridade: "baixa" as const,
      telefone: "+244 913 456 789"
    }
  ];

  // Dados de exemplo para posts de profissionais
  const profissionais = [
    {
      id: 'prof1',
      nome: "Carlos Ferreira",
      data: "Hoje às 10:30",
      descricao: "Disponível para serviços de electricidade residencial e comercial. Mais de 10 anos de experiência.",
      titulo: "ELECTRICISTA CERTIFICADO",
      imagemPerfil: "/imageprofissional.png",
      imagemPost: "/imageprofissional.png",
      curtidas: 28
    },
    {
      id: 'prof2',
      nome: "Ana Paula",
      data: "Ontem às 14:20",
      descricao: "Especialista em canalização e instalações hidráulicas. Atendimento rápido e garantia.",
      titulo: "CANALIZADORA PROFISSIONAL",
      imagemPerfil: "/imageprofissional.png",
      imagemPost: "/imageprofissional.png",
      curtidas: 42
    },
    {
      id: 'prof3',
      nome: "Pedro Mendes",
      data: "25 Nov às 09:15",
      descricao: "Pintor com experiência em interiores e exteriores. Acabamento perfeito.",
      titulo: "PINTOR ESPECIALISTA",
      imagemPerfil: "/imageprofissional.png",
      imagemPost: "/imageprofissional.png",
      curtidas: 15
    }
  ];

  // Função para embaralhar array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Criar arrays separados para cada tipo
  const solicitacoesItems: FeedItem[] = solicitacoes.map(s => ({
    tipo: 'solicitacao',
    data: s,
    id: s.id
  }));

  const profissionaisItems: FeedItem[] = profissionais.map(p => ({
    tipo: 'profissional',
    data: p,
    id: p.id
  }));

  // Para "todos", misturamos aleatoriamente
  const todosItems = useMemo(() => {
    return shuffleArray([...solicitacoesItems, ...profissionaisItems]);
  }, [solicitacoesItems, profissionaisItems]);

  // Determinar quais itens mostrar baseado no filtro
  const itemsParaMostrar = useMemo(() => {
    switch (filtro) {
      case 'solicitacoes':
        return solicitacoesItems;
      case 'profissionais':
        return profissionaisItems;
      case 'todos':
      default:
        return todosItems;
    }
  }, [filtro, todosItems, solicitacoesItems, profissionaisItems]);

  const contarSolicitacoes = solicitacoes.length;
  const contarProfissionais = profissionais.length;

  return (
    <div className="container mx-auto  lg:px-8 mt-4 py-20 justify-center items-center">
      <div className="flex gap-6">
        {/* Sidebar Esquerda - 342px */}
        <aside
          className="hidden lg:block space-y-6"
          style={{ width: '342px' }}
        >
          {/* Perfil */}
          <div className="bg-white p-6 rounded-md border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
           
              <div>
                <h3 className="font-semibold">Preciso de um Profissional</h3>
                <p className="text-sm text-gray-500">Encontra especialista agora</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/categoria-profissional')}
              style={{ backgroundColor: lightTheme.colors.primary }}
              className="w-full text-white py-2 rounded-lg text-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              ver por categoria
            </button>
          </div>

          {/* Menu lateral */}
        
        </aside>

        {/* Conteúdo Principal - 646px */}
        <main className="flex-1">
          <div className="bg-white ">
            {/* Header */}
            <div >
              <HeroSection />
            </div>

            {/* Filtros */}
            <div>
              <div className="flex items-center justify-between mb-3 mt-2">
                <h2 className="font-semibold text-gray-900">Filtro</h2>
                
              </div>

              {/* Filtros rápidos */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFiltro('todos')}
                  className={`flex-1 py-2  rounded-md text-sm font-medium cursor-pointer transition-colors ${filtro === 'todos'
                      ? 'bg-[#18B481] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Todos ({todosItems.length})
                </button>
                <button
                  onClick={() => setFiltro('solicitacoes')}
                  className={`flex-1 flex items-center justify-center cursor-pointer space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filtro === 'solicitacoes'
                      ? 'bg-[#18B481] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Users size={16} />
                  <span>Clientes ({contarSolicitacoes})</span>
                </button>
                <button
                  onClick={() => setFiltro('profissionais')}
                  className={`flex-1 flex items-center justify-center cursor-pointer space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${filtro === 'profissionais'
                      ? 'bg-[#18B481] text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Briefcase size={16} />
                  <span>Profissionais ({contarProfissionais})</span>
                </button>
              </div>
            </div>

            {/* Feed de posts */}
            <div className="">
              {itemsParaMostrar.length > 0 ? (
                itemsParaMostrar.map((item) => (
                  <div key={item.id} className="py-4">
                    {item.tipo === 'solicitacao' ? (
                      <SolicitacaoCliente {...item.data} />
                    ) : (
                      <ItemPostProfissonal {...item.data} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum item encontrado</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar Direita - 342px */}
        <aside
          className="hidden lg:block space-y-6"
          style={{ width: '342px' }}
        >
         
         
          {/* Profissionais recomendados */}
          <div className="bg-white rounded-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Profissionais recomendados</h3>
            </div>
            <div className="p-4 space-y-4">
              {profissionais.slice(0, 3).map((prof) => (
                <div key={prof.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <p className="font-medium text-sm">{prof.nome}</p>
                      <p className="text-xs text-gray-500">{prof.titulo}</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#18B481] font-medium hover:text-[#18B481]/80 transition-colors cursor-pointer">
                    Contactar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Solicitações recentes */}
          <div className="bg-white rounded-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold">Solicitações recentes</h3>
            </div>
            <div className="p-4 space-y-3">
              {solicitacoes.slice(0, 3).map((sol) => (
                <div key={sol.id} className="text-sm">
                  <p className="font-medium">{sol.nome}</p>
                  <p className="text-xs text-gray-500">{sol.servico} • {sol.bairro}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${sol.prioridade === 'alta' ? 'bg-red-50 text-red-600' :
                      sol.prioridade === 'media' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                    }`}>
                    {sol.prioridade === 'alta' ? 'Urgente' :
                      sol.prioridade === 'media' ? 'Normal' : 'Baixa prioridade'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}