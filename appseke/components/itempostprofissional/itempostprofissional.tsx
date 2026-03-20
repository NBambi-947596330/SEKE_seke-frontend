import Image from 'next/image';
import Link from 'next/link';
import { User, Heart, Briefcase } from 'lucide-react';

export interface ItemPostProfissonalProps {
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
    <div className="bg-card text-card-foreground rounded-md border  border-gray-100 overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-muted rounded-full overflow-hidden shrink-0">
            {imagemPerfil ? (
              <Image
                src={imagemPerfil}
                alt={nome}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <User size={20} />
              </div>
            )}
          </div>
          
          {/* Nome (clicável) e data */}
          <div className="space-y-0.5">
            <Link href="/detalhesuser">
              <h3 className="font-semibold text-sm hover:underline cursor-pointer">
                {nome}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground">{data}</p>
          </div>
        </div>

        {/* Ícone de profissional com texto */}
        <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
          <Briefcase size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Profissional</span>
        </div>
      </div>
      
      {/* Imagem do Post */}
      {imagemPost && (
        <div className="relative w-full h-64 bg-muted">
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
        <h2 className="text-lg md:text-xl font-semibold tracking-tight">
          {titulo}
        </h2>
        
        {/* Descrição com "ver mais" */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {descricao}
          </p>
          <button className="text-xs font-medium text-muted-foreground hover:text-foreground mt-1 transition-colors">
            ver mais
          </button>
        </div>
      </div>
      
      {/* Footer com ações */}
      <div className="px-4 pb-4 flex items-center justify-between border-t border-border/60 pt-3 bg-background/60">
        {/* Curtir - Esquerda */}
        <button className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-red-50 flex items-center justify-center transition-colors">
            <Heart 
              size={16} 
              className="text-muted-foreground group-hover:text-red-500 transition-colors" 
            />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground">
            {curtidas}
          </span>
        </button>

        {/* Conectar - Direita */}
        <button 
        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md transition-colors cursor-pointer hover:bg-primary/90">
          Contactar
        </button>
      </div>
    </div>
  );
}