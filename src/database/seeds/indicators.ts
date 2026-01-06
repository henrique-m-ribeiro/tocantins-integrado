/**
 * Seed: Definições de Indicadores por Dimensão
 * Categorias e Indicadores Socioeconômicos do Tocantins
 */

import type { Dimension } from '../../shared/types';

export interface CategorySeed {
  dimension: Dimension;
  name: string;
  description: string;
  order: number;
}

export interface IndicatorSeed {
  category_name: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  source: string;
  source_url?: string;
  periodicity: 'annual' | 'monthly' | 'quarterly' | 'census';
  higher_is_better: boolean;
}

// Categorias de Indicadores
export const INDICATOR_CATEGORIES: CategorySeed[] = [
  // Dimensão Econômica (ECON)
  { dimension: 'ECON', name: 'PIB e Valor Adicionado', description: 'Indicadores de produção e riqueza municipal', order: 1 },
  { dimension: 'ECON', name: 'Emprego e Renda', description: 'Indicadores de mercado de trabalho e renda', order: 2 },
  { dimension: 'ECON', name: 'Atividades Econômicas', description: 'Composição setorial da economia local', order: 3 },
  { dimension: 'ECON', name: 'Finanças Públicas', description: 'Receitas, despesas e investimentos municipais', order: 4 },
  { dimension: 'ECON', name: 'Agropecuária', description: 'Produção agrícola e pecuária', order: 5 },

  // Dimensão Social (SOCIAL)
  { dimension: 'SOCIAL', name: 'Educação Básica', description: 'Indicadores de ensino fundamental e médio', order: 1 },
  { dimension: 'SOCIAL', name: 'Educação Superior', description: 'Acesso e qualidade do ensino superior', order: 2 },
  { dimension: 'SOCIAL', name: 'Saúde', description: 'Indicadores de saúde e atendimento', order: 3 },
  { dimension: 'SOCIAL', name: 'Assistência Social', description: 'Programas sociais e vulnerabilidade', order: 4 },
  { dimension: 'SOCIAL', name: 'Segurança Pública', description: 'Indicadores de criminalidade e segurança', order: 5 },
  { dimension: 'SOCIAL', name: 'Demografia', description: 'Estrutura e dinâmica populacional', order: 6 },

  // Dimensão Territorial (TERRA)
  { dimension: 'TERRA', name: 'Infraestrutura Urbana', description: 'Qualidade da infraestrutura municipal', order: 1 },
  { dimension: 'TERRA', name: 'Saneamento Básico', description: 'Água, esgoto e resíduos sólidos', order: 2 },
  { dimension: 'TERRA', name: 'Transporte', description: 'Mobilidade e logística', order: 3 },
  { dimension: 'TERRA', name: 'Habitação', description: 'Condições de moradia', order: 4 },
  { dimension: 'TERRA', name: 'Energia e Comunicações', description: 'Acesso a energia e telecomunicações', order: 5 },

  // Dimensão Ambiental (AMBIENT)
  { dimension: 'AMBIENT', name: 'Cobertura Vegetal', description: 'Vegetação nativa e desmatamento', order: 1 },
  { dimension: 'AMBIENT', name: 'Recursos Hídricos', description: 'Disponibilidade e qualidade da água', order: 2 },
  { dimension: 'AMBIENT', name: 'Áreas Protegidas', description: 'Unidades de conservação e terras indígenas', order: 3 },
  { dimension: 'AMBIENT', name: 'Gestão Ambiental', description: 'Políticas e ações ambientais municipais', order: 4 }
];

// Definições de Indicadores
export const INDICATOR_DEFINITIONS: IndicatorSeed[] = [
  // =====================================
  // DIMENSÃO ECONÔMICA (ECON)
  // =====================================

  // PIB e Valor Adicionado
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_PIB_TOTAL', name: 'PIB Municipal', description: 'Produto Interno Bruto total do município', unit: 'R$ mil', source: 'IBGE', source_url: 'https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9088-produto-interno-bruto-dos-municipios.html', periodicity: 'annual', higher_is_better: true },
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_PIB_PERCAPITA', name: 'PIB per Capita', description: 'PIB dividido pela população do município', unit: 'R$', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_VA_AGRO', name: 'Valor Adicionado Agropecuária', description: 'VA do setor agropecuário', unit: 'R$ mil', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_VA_INDUSTRIA', name: 'Valor Adicionado Indústria', description: 'VA do setor industrial', unit: 'R$ mil', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_VA_SERVICOS', name: 'Valor Adicionado Serviços', description: 'VA do setor de serviços', unit: 'R$ mil', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'PIB e Valor Adicionado', code: 'ECON_VA_ADM_PUB', name: 'Valor Adicionado Administração Pública', description: 'VA da administração pública', unit: 'R$ mil', source: 'IBGE', periodicity: 'annual', higher_is_better: true },

  // Emprego e Renda
  { category_name: 'Emprego e Renda', code: 'ECON_EMPREGOS_FORMAIS', name: 'Empregos Formais', description: 'Total de vínculos empregatícios formais', unit: 'empregos', source: 'RAIS/MTE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Emprego e Renda', code: 'ECON_SALARIO_MEDIO', name: 'Salário Médio Mensal', description: 'Remuneração média dos empregados formais', unit: 'salários mínimos', source: 'RAIS/MTE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Emprego e Renda', code: 'ECON_RENDA_MEDIA', name: 'Renda Média Domiciliar', description: 'Renda média mensal por domicílio', unit: 'R$', source: 'IBGE/Censo', periodicity: 'census', higher_is_better: true },
  { category_name: 'Emprego e Renda', code: 'ECON_TX_DESOCUPACAO', name: 'Taxa de Desocupação', description: 'Percentual de desocupados na força de trabalho', unit: '%', source: 'IBGE/PNAD', periodicity: 'quarterly', higher_is_better: false },
  { category_name: 'Emprego e Renda', code: 'ECON_GINI', name: 'Índice de Gini', description: 'Medida de concentração de renda (0-1)', unit: 'índice', source: 'IBGE', periodicity: 'census', higher_is_better: false },

  // Atividades Econômicas
  { category_name: 'Atividades Econômicas', code: 'ECON_EMPRESAS_ATIVAS', name: 'Empresas Ativas', description: 'Número de empresas em funcionamento', unit: 'empresas', source: 'IBGE/CEMPRE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Atividades Econômicas', code: 'ECON_MEI', name: 'Microempreendedores Individuais', description: 'Número de MEIs registrados', unit: 'MEIs', source: 'Portal Empreendedor', periodicity: 'annual', higher_is_better: true },

  // Finanças Públicas
  { category_name: 'Finanças Públicas', code: 'ECON_RECEITA_TOTAL', name: 'Receita Total', description: 'Receita orçamentária total do município', unit: 'R$ mil', source: 'Tesouro Nacional/FINBRA', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Finanças Públicas', code: 'ECON_RECEITA_PROPRIA', name: 'Receita Própria', description: 'Receita tributária própria do município', unit: 'R$ mil', source: 'Tesouro Nacional/FINBRA', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Finanças Públicas', code: 'ECON_DEPENDENCIA_TRANSF', name: 'Dependência de Transferências', description: 'Percentual da receita vinda de transferências', unit: '%', source: 'Tesouro Nacional/FINBRA', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Finanças Públicas', code: 'ECON_INVESTIMENTO_PC', name: 'Investimento per Capita', description: 'Despesa de capital dividida pela população', unit: 'R$', source: 'Tesouro Nacional/FINBRA', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Finanças Públicas', code: 'ECON_FPM', name: 'FPM Recebido', description: 'Fundo de Participação dos Municípios', unit: 'R$ mil', source: 'Tesouro Nacional', periodicity: 'annual', higher_is_better: true },

  // Agropecuária
  { category_name: 'Agropecuária', code: 'ECON_REBANHO_BOVINO', name: 'Rebanho Bovino', description: 'Número de cabeças de gado bovino', unit: 'cabeças', source: 'IBGE/PPM', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Agropecuária', code: 'ECON_PRODUCAO_SOJA', name: 'Produção de Soja', description: 'Produção agrícola de soja', unit: 'toneladas', source: 'IBGE/PAM', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Agropecuária', code: 'ECON_PRODUCAO_MILHO', name: 'Produção de Milho', description: 'Produção agrícola de milho', unit: 'toneladas', source: 'IBGE/PAM', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Agropecuária', code: 'ECON_AREA_PLANTADA', name: 'Área Plantada Total', description: 'Área total destinada ao plantio', unit: 'hectares', source: 'IBGE/PAM', periodicity: 'annual', higher_is_better: true },

  // =====================================
  // DIMENSÃO SOCIAL (SOCIAL)
  // =====================================

  // Educação Básica
  { category_name: 'Educação Básica', code: 'SOCIAL_IDEB_AI', name: 'IDEB Anos Iniciais', description: 'Índice de Desenvolvimento da Educação Básica - Anos Iniciais', unit: 'índice', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_IDEB_AF', name: 'IDEB Anos Finais', description: 'Índice de Desenvolvimento da Educação Básica - Anos Finais', unit: 'índice', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_TX_ABANDONO', name: 'Taxa de Abandono Escolar', description: 'Percentual de alunos que abandonaram a escola', unit: '%', source: 'INEP', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Educação Básica', code: 'SOCIAL_TX_APROVACAO', name: 'Taxa de Aprovação', description: 'Percentual de alunos aprovados', unit: '%', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_MATRICULAS_EF', name: 'Matrículas Ensino Fundamental', description: 'Total de matrículas no ensino fundamental', unit: 'matrículas', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_MATRICULAS_EM', name: 'Matrículas Ensino Médio', description: 'Total de matrículas no ensino médio', unit: 'matrículas', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_DOCENTES', name: 'Número de Docentes', description: 'Total de professores na educação básica', unit: 'docentes', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_ESCOLAS', name: 'Número de Escolas', description: 'Total de estabelecimentos de ensino', unit: 'escolas', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Básica', code: 'SOCIAL_TX_ANALFABETISMO', name: 'Taxa de Analfabetismo', description: 'Percentual de analfabetos na população 15+', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: false },

  // Educação Superior
  { category_name: 'Educação Superior', code: 'SOCIAL_MATRICULAS_SUP', name: 'Matrículas Ensino Superior', description: 'Total de matrículas no ensino superior', unit: 'matrículas', source: 'INEP', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Educação Superior', code: 'SOCIAL_IES', name: 'Instituições de Ensino Superior', description: 'Número de IES no município', unit: 'instituições', source: 'INEP', periodicity: 'annual', higher_is_better: true },

  // Saúde
  { category_name: 'Saúde', code: 'SOCIAL_TX_MORTALIDADE_INF', name: 'Taxa de Mortalidade Infantil', description: 'Óbitos de menores de 1 ano por 1000 nascidos vivos', unit: 'por 1000 NV', source: 'DATASUS', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Saúde', code: 'SOCIAL_ESPERANCA_VIDA', name: 'Esperança de Vida ao Nascer', description: 'Expectativa de vida da população', unit: 'anos', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Saúde', code: 'SOCIAL_LEITOS_SUS', name: 'Leitos SUS', description: 'Número de leitos hospitalares SUS', unit: 'leitos', source: 'DATASUS/CNES', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Saúde', code: 'SOCIAL_UBS', name: 'Unidades Básicas de Saúde', description: 'Número de UBS no município', unit: 'unidades', source: 'DATASUS/CNES', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Saúde', code: 'SOCIAL_MEDICOS_PC', name: 'Médicos por 1000 habitantes', description: 'Razão de médicos pela população', unit: 'médicos/1000 hab', source: 'DATASUS/CNES', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Saúde', code: 'SOCIAL_COBERTURA_ESF', name: 'Cobertura ESF', description: 'Cobertura da Estratégia Saúde da Família', unit: '%', source: 'DATASUS', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Saúde', code: 'SOCIAL_INTERNACOES_CSAP', name: 'Internações CSAP', description: 'Internações por condições sensíveis à APS', unit: 'internações', source: 'DATASUS', periodicity: 'annual', higher_is_better: false },

  // Assistência Social
  { category_name: 'Assistência Social', code: 'SOCIAL_FAMILIAS_BF', name: 'Famílias Bolsa Família', description: 'Famílias beneficiárias do Bolsa Família', unit: 'famílias', source: 'MDS', periodicity: 'monthly', higher_is_better: false },
  { category_name: 'Assistência Social', code: 'SOCIAL_BPC_IDOSO', name: 'Beneficiários BPC Idoso', description: 'Beneficiários do BPC idoso', unit: 'beneficiários', source: 'MDS', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Assistência Social', code: 'SOCIAL_BPC_PCD', name: 'Beneficiários BPC PcD', description: 'Beneficiários do BPC pessoa com deficiência', unit: 'beneficiários', source: 'MDS', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Assistência Social', code: 'SOCIAL_CRAS', name: 'CRAS', description: 'Número de CRAS no município', unit: 'unidades', source: 'MDS', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Assistência Social', code: 'SOCIAL_CADUNICO', name: 'Famílias CadÚnico', description: 'Famílias inscritas no Cadastro Único', unit: 'famílias', source: 'MDS', periodicity: 'monthly', higher_is_better: false },

  // Segurança Pública
  { category_name: 'Segurança Pública', code: 'SOCIAL_HOMICIDIOS', name: 'Homicídios', description: 'Número de homicídios dolosos', unit: 'ocorrências', source: 'SSP-TO', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Segurança Pública', code: 'SOCIAL_TX_HOMICIDIOS', name: 'Taxa de Homicídios', description: 'Homicídios por 100 mil habitantes', unit: 'por 100 mil hab', source: 'SSP-TO', periodicity: 'annual', higher_is_better: false },

  // Demografia
  { category_name: 'Demografia', code: 'SOCIAL_POPULACAO', name: 'População Total', description: 'População estimada do município', unit: 'habitantes', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Demografia', code: 'SOCIAL_TX_URBANIZACAO', name: 'Taxa de Urbanização', description: 'Percentual da população em área urbana', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Demografia', code: 'SOCIAL_DENSIDADE', name: 'Densidade Demográfica', description: 'Habitantes por km²', unit: 'hab/km²', source: 'IBGE', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Demografia', code: 'SOCIAL_RAZAO_DEPENDENCIA', name: 'Razão de Dependência', description: 'Razão entre dependentes e população ativa', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: false },
  { category_name: 'Demografia', code: 'SOCIAL_IDHM', name: 'IDHM', description: 'Índice de Desenvolvimento Humano Municipal', unit: 'índice', source: 'PNUD', periodicity: 'census', higher_is_better: true },

  // =====================================
  // DIMENSÃO TERRITORIAL (TERRA)
  // =====================================

  // Infraestrutura Urbana
  { category_name: 'Infraestrutura Urbana', code: 'TERRA_DOMICILIOS', name: 'Domicílios', description: 'Número total de domicílios', unit: 'domicílios', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Infraestrutura Urbana', code: 'TERRA_PAVIMENTACAO', name: 'Vias Pavimentadas', description: 'Percentual de vias urbanas pavimentadas', unit: '%', source: 'IBGE/MUNIC', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Infraestrutura Urbana', code: 'TERRA_ILUMINACAO', name: 'Iluminação Pública', description: 'Percentual de vias com iluminação pública', unit: '%', source: 'IBGE/MUNIC', periodicity: 'annual', higher_is_better: true },

  // Saneamento Básico
  { category_name: 'Saneamento Básico', code: 'TERRA_AGUA_ENCANADA', name: 'Acesso à Água Encanada', description: 'Domicílios com água encanada', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Saneamento Básico', code: 'TERRA_ESGOTO', name: 'Coleta de Esgoto', description: 'Domicílios com esgotamento sanitário adequado', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Saneamento Básico', code: 'TERRA_COLETA_LIXO', name: 'Coleta de Lixo', description: 'Domicílios com coleta de lixo regular', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Saneamento Básico', code: 'TERRA_ATERRO', name: 'Destinação Adequada Resíduos', description: 'Município possui aterro sanitário', unit: 'sim/não', source: 'SNIS', periodicity: 'annual', higher_is_better: true },

  // Transporte
  { category_name: 'Transporte', code: 'TERRA_FROTA_VEICULOS', name: 'Frota de Veículos', description: 'Total de veículos registrados', unit: 'veículos', source: 'DENATRAN', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Transporte', code: 'TERRA_VEICULOS_PC', name: 'Veículos por Habitante', description: 'Razão veículos por população', unit: 'veículos/hab', source: 'DENATRAN', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Transporte', code: 'TERRA_DISTANCIA_CAPITAL', name: 'Distância da Capital', description: 'Distância rodoviária até Palmas', unit: 'km', source: 'DER-TO', periodicity: 'annual', higher_is_better: false },

  // Habitação
  { category_name: 'Habitação', code: 'TERRA_DEFICIT_HAB', name: 'Déficit Habitacional', description: 'Número de domicílios em déficit', unit: 'domicílios', source: 'FJP', periodicity: 'census', higher_is_better: false },
  { category_name: 'Habitação', code: 'TERRA_DOM_PROPRIO', name: 'Domicílios Próprios', description: 'Percentual de domicílios próprios', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },

  // Energia e Comunicações
  { category_name: 'Energia e Comunicações', code: 'TERRA_ENERGIA', name: 'Acesso à Energia Elétrica', description: 'Domicílios com energia elétrica', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Energia e Comunicações', code: 'TERRA_INTERNET', name: 'Acesso à Internet', description: 'Domicílios com acesso à internet', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },
  { category_name: 'Energia e Comunicações', code: 'TERRA_TELEFONE', name: 'Acesso a Telefone', description: 'Domicílios com telefone (fixo ou móvel)', unit: '%', source: 'IBGE', periodicity: 'census', higher_is_better: true },

  // =====================================
  // DIMENSÃO AMBIENTAL (AMBIENT)
  // =====================================

  // Cobertura Vegetal
  { category_name: 'Cobertura Vegetal', code: 'AMBIENT_COBERTURA_NATIVA', name: 'Cobertura Vegetal Nativa', description: 'Percentual do território com vegetação nativa', unit: '%', source: 'MapBiomas', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Cobertura Vegetal', code: 'AMBIENT_DESMATAMENTO', name: 'Área Desmatada', description: 'Área desmatada no período', unit: 'km²', source: 'PRODES/INPE', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Cobertura Vegetal', code: 'AMBIENT_TX_DESMATAMENTO', name: 'Taxa de Desmatamento', description: 'Percentual do território desmatado no ano', unit: '%', source: 'PRODES/INPE', periodicity: 'annual', higher_is_better: false },
  { category_name: 'Cobertura Vegetal', code: 'AMBIENT_BIOMA', name: 'Bioma Predominante', description: 'Bioma predominante no município', unit: 'categoria', source: 'IBGE', periodicity: 'annual', higher_is_better: true },

  // Recursos Hídricos
  { category_name: 'Recursos Hídricos', code: 'AMBIENT_BACIAS', name: 'Bacias Hidrográficas', description: 'Número de bacias hidrográficas no município', unit: 'bacias', source: 'ANA', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Recursos Hídricos', code: 'AMBIENT_QUALIDADE_AGUA', name: 'Qualidade da Água', description: 'Índice de qualidade da água dos mananciais', unit: 'índice', source: 'ANA', periodicity: 'annual', higher_is_better: true },

  // Áreas Protegidas
  { category_name: 'Áreas Protegidas', code: 'AMBIENT_UC_AREA', name: 'Área em Unidades de Conservação', description: 'Área do município em UCs', unit: 'km²', source: 'ICMBio', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Áreas Protegidas', code: 'AMBIENT_UC_PERCENT', name: 'Percentual em UCs', description: 'Percentual do território em UCs', unit: '%', source: 'ICMBio', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Áreas Protegidas', code: 'AMBIENT_TI_AREA', name: 'Área em Terras Indígenas', description: 'Área do município em TIs', unit: 'km²', source: 'FUNAI', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Áreas Protegidas', code: 'AMBIENT_APP', name: 'Áreas de Preservação Permanente', description: 'Área em APPs', unit: 'km²', source: 'CAR', periodicity: 'annual', higher_is_better: true },

  // Gestão Ambiental
  { category_name: 'Gestão Ambiental', code: 'AMBIENT_ORGAO_AMBIENTAL', name: 'Órgão Ambiental Municipal', description: 'Município possui órgão ambiental', unit: 'sim/não', source: 'IBGE/MUNIC', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Gestão Ambiental', code: 'AMBIENT_CONSELHO', name: 'Conselho de Meio Ambiente', description: 'Município possui conselho ambiental ativo', unit: 'sim/não', source: 'IBGE/MUNIC', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Gestão Ambiental', code: 'AMBIENT_FUNDO', name: 'Fundo Municipal de Meio Ambiente', description: 'Município possui fundo ambiental', unit: 'sim/não', source: 'IBGE/MUNIC', periodicity: 'annual', higher_is_better: true },
  { category_name: 'Gestão Ambiental', code: 'AMBIENT_QUEIMADAS', name: 'Focos de Queimadas', description: 'Número de focos de calor detectados', unit: 'focos', source: 'INPE', periodicity: 'annual', higher_is_better: false }
];
