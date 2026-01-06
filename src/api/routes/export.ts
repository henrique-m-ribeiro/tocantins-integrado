/**
 * Rotas de Exportação - API Tocantins Integrado
 * Exportação de análises em PDF e Texto
 */

import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { getServiceClient } from '../../database/client';
import { getOrchestrator } from '../../agents';

const router = Router();
const supabase = getServiceClient();

/**
 * POST /api/export/analysis
 * Gera análise de um município e exporta
 */
router.post('/analysis', async (req: Request, res: Response) => {
  try {
    const { municipality_id, dimensions, format = 'text' } = req.body;

    if (!municipality_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Campo "municipality_id" é obrigatório'
      });
    }

    // Buscar informações do município
    const { data: municipality, error: munError } = await supabase
      .from('v_municipalities_full')
      .select('*')
      .eq('id', municipality_id)
      .single();

    if (munError || !municipality) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Município não encontrado'
      });
    }

    // Gerar análise com o Orchestrator
    const orchestrator = getOrchestrator();
    const dimensionList = dimensions || ['ECON', 'SOCIAL', 'TERRA', 'AMBIENT'];

    const query = `Faça uma análise completa e detalhada do município de ${municipality.name}, cobrindo as dimensões: ${dimensionList.join(', ')}. Inclua os principais indicadores, pontos fortes, desafios e recomendações.`;

    const analysis = await orchestrator.query(query, 'dashboard');

    // Formatar resposta baseado no formato solicitado
    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(municipality, analysis);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${municipality.name.replace(/\s+/g, '_')}_analise.pdf"`);
      res.send(pdfBuffer);

    } else {
      // Formato texto
      const textContent = formatAsText(municipality, analysis);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${municipality.name.replace(/\s+/g, '_')}_analise.txt"`);
      res.send(textContent);
    }

  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao exportar análise'
    });
  }
});

/**
 * POST /api/export/comparison
 * Exporta comparação entre municípios
 */
router.post('/comparison', async (req: Request, res: Response) => {
  try {
    const { municipality_ids, format = 'text' } = req.body;

    if (!municipality_ids || !Array.isArray(municipality_ids) || municipality_ids.length < 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Forneça ao menos 2 IDs de municípios em "municipality_ids"'
      });
    }

    // Buscar informações dos municípios
    const { data: municipalities, error } = await supabase
      .from('v_municipalities_full')
      .select('*')
      .in('id', municipality_ids);

    if (error || !municipalities || municipalities.length < 2) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Municípios não encontrados'
      });
    }

    // Gerar análise comparativa
    const orchestrator = getOrchestrator();
    const names = municipalities.map(m => m.name).join(' e ');

    const query = `Compare os municípios ${names} em todas as dimensões (econômica, social, territorial e ambiental). Destaque as principais diferenças, pontos fortes de cada um e oportunidades de cooperação.`;

    const comparison = await orchestrator.query(query, 'dashboard');

    // Formatar resposta
    if (format === 'pdf') {
      const pdfBuffer = await generateComparisonPDF(municipalities, comparison);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="comparacao_municipios.pdf"');
      res.send(pdfBuffer);

    } else {
      const textContent = formatComparisonAsText(municipalities, comparison);

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="comparacao_municipios.txt"');
      res.send(textContent);
    }

  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao exportar comparação'
    });
  }
});

/**
 * GET /api/export/session/:sessionId
 * Exporta histórico de uma sessão de chat
 */
router.get('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { format = 'text' } = req.query;

    // Buscar mensagens da sessão
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sessão não encontrada ou sem mensagens'
      });
    }

    // Formatar como texto
    const textContent = messages.map(msg => {
      const role = msg.role === 'user' ? 'Você' : 'Assistente';
      const time = new Date(msg.created_at).toLocaleString('pt-BR');
      return `[${time}] ${role}:\n${msg.content}\n`;
    }).join('\n---\n\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sessao_${sessionId}.txt"`);
    res.send(textContent);

  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao exportar sessão'
    });
  }
});

/**
 * Funções auxiliares para geração de documentos
 */

async function generatePDF(municipality: any, analysis: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Cabeçalho
    doc.fontSize(24).font('Helvetica-Bold').text('Tocantins Integrado', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text('Análise Municipal', { align: 'center' });
    doc.moveDown(2);

    // Informações do município
    doc.fontSize(18).font('Helvetica-Bold').text(municipality.name);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Microrregião: ${municipality.microregion_name}`);
    doc.text(`Mesorregião: ${municipality.mesoregion_name}`);
    doc.text(`População: ${municipality.population?.toLocaleString('pt-BR')} habitantes`);
    doc.text(`Área: ${municipality.area_km2?.toLocaleString('pt-BR')} km²`);
    doc.moveDown(2);

    // Análise
    doc.fontSize(14).font('Helvetica-Bold').text('Análise Multidimensional');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    // Quebrar texto em parágrafos
    const paragraphs = analysis.response.text.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        doc.text(paragraph.trim(), { align: 'justify' });
        doc.moveDown(0.5);
      }
    }

    // Rodapé
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray');
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.text('Tocantins Integrado - Plataforma de Superinteligência Territorial', { align: 'center' });

    doc.end();
  });
}

async function generateComparisonPDF(municipalities: any[], comparison: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Cabeçalho
    doc.fontSize(24).font('Helvetica-Bold').text('Tocantins Integrado', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica').text('Análise Comparativa', { align: 'center' });
    doc.moveDown(2);

    // Municípios comparados
    doc.fontSize(14).font('Helvetica-Bold').text('Municípios Analisados:');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');

    for (const mun of municipalities) {
      doc.text(`• ${mun.name} (${mun.microregion_name}) - ${mun.population?.toLocaleString('pt-BR')} hab.`);
    }
    doc.moveDown(2);

    // Análise comparativa
    doc.fontSize(14).font('Helvetica-Bold').text('Análise Comparativa');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');

    const paragraphs = comparison.response.text.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        doc.text(paragraph.trim(), { align: 'justify' });
        doc.moveDown(0.5);
      }
    }

    // Rodapé
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('gray');
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

    doc.end();
  });
}

function formatAsText(municipality: any, analysis: any): string {
  return `
================================================================================
                            TOCANTINS INTEGRADO
                            Análise Municipal
================================================================================

MUNICÍPIO: ${municipality.name}
Microrregião: ${municipality.microregion_name}
Mesorregião: ${municipality.mesoregion_name}
População: ${municipality.population?.toLocaleString('pt-BR')} habitantes
Área: ${municipality.area_km2?.toLocaleString('pt-BR')} km²
Densidade: ${municipality.density?.toLocaleString('pt-BR')} hab/km²

--------------------------------------------------------------------------------
                         ANÁLISE MULTIDIMENSIONAL
--------------------------------------------------------------------------------

${analysis.response.text}

--------------------------------------------------------------------------------
Gerado em ${new Date().toLocaleString('pt-BR')}
Tocantins Integrado - Plataforma de Superinteligência Territorial
================================================================================
`.trim();
}

function formatComparisonAsText(municipalities: any[], comparison: any): string {
  const munList = municipalities.map(m =>
    `• ${m.name} (${m.microregion_name}) - ${m.population?.toLocaleString('pt-BR')} hab.`
  ).join('\n');

  return `
================================================================================
                            TOCANTINS INTEGRADO
                            Análise Comparativa
================================================================================

MUNICÍPIOS ANALISADOS:
${munList}

--------------------------------------------------------------------------------
                         ANÁLISE COMPARATIVA
--------------------------------------------------------------------------------

${comparison.response.text}

--------------------------------------------------------------------------------
Gerado em ${new Date().toLocaleString('pt-BR')}
Tocantins Integrado - Plataforma de Superinteligência Territorial
================================================================================
`.trim();
}

export { router as exportRouter };
