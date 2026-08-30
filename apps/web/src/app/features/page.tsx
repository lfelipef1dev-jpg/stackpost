import type { Metadata } from 'next';
import FeaturesClient from './FeaturesClient';

export const metadata: Metadata = {
  title: 'Recursos — 15 plataformas, legendas com IA, MCP server e mais | StackPost',
  description:
    'Recursos completos do StackPost: publicação paralela em 15 redes sociais, upload resumível (tus), analytics histórico, legendas com IA, A/B testing, MCP server, webhooks com replay e multi-usuário com RBAC.',
  alternates: { canonical: '/features' },
};

export default function Page() {
  return <FeaturesClient />;
}
