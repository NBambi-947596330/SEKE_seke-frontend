import Image from 'next/image';
import { User, Heart, Briefcase } from 'lucide-react';
import { lightTheme } from '@/style/light';

interface ItemPostProfissonalProps {
  nome?: string;
  data?: string;
  descricao?: string;
  titulo?: string;
  imagemPerfil?: string;
  imagemPost?: string;
  curtidas?: number;
}

export default function ItemPostProfissonal({ 
  nome = "Profissional",
  data = "25 Nov at 12:24 PM",
  descricao = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  titulo = "TÍTULO DO POST",
  imagemPerfil = "/imageprofissional.png",
  imagemPost = "/imageprofissional.png",
  curtidas = 42
}: ItemPostProfissonalProps) {
  return (
    <div className=" bg-white rounded-md border border-gray-100 overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden shrink-0">
            {imagemPerfil ? (
              <Image
                src={imagemPerfil}
                alt={nome}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <User size={20} />
              </div>
            )}
          </div>
          
          {/* Nome e data */}
          <div>
            <h3 className="font-medium text-gray-900 text-sm">{nome}</h3>
            <p className="text-xs text-gray-400">{data}</p>
          </div>
        </div>

        {/* Ícone de profissional com texto */}
        <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
          <Briefcase size={14} className="text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Profissional</span>
        </div>
      </div>
      
      {/* Imagem do Post */}
      {imagemPost && (
        <div className="relative w-full h-64 bg-gray-100">
          <Image
            src={imagemPost}
            alt="Post image"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {titulo}
        </h2>
        
        {/* Descrição com "ver mais" */}
        <div>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {descricao}
          </p>
          <button className="text-xs font-medium text-gray-400 hover:text-gray-600 mt-1 transition-colors">
            ver mais
          </button>
        </div>
      </div>
      
      {/* Footer com ações */}
      <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
        {/* Curtir - Esquerda */}
        <button className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-red-50 flex items-center justify-center transition-colors">
            <Heart 
              size={16} 
              className="text-gray-400 group-hover:text-red-500 transition-colors" 
            />
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-700">
            {curtidas}
          </span>
        </button>

        {/* Conectar - Direita */}
        <button 
        style={{  backgroundColor: lightTheme.colors.primary}}
        className="px-4 py-1.5   text-white text-xs font-medium rounded-md transition-colors cursor-pointer">
          Contactar
        </button>
      </div>
    </div>
  );
}