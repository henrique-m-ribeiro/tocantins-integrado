/**
 * Configuração dos Municípios do Tocantins
 * 139 municípios com códigos IBGE
 *
 * Fonte: IBGE - Instituto Brasileiro de Geografia e Estatística
 * https://www.ibge.gov.br/cidades-e-estados/to.html
 */

export interface Municipality {
  ibge_code: string;
  name: string;
  microregion: string;
}

// Códigos IBGE dos 139 municípios do Tocantins
export const TOCANTINS_MUNICIPALITIES: Municipality[] = [
  // Microrregião de Araguaína
  { ibge_code: '1702109', name: 'Araguaína', microregion: 'Araguaína' },
  { ibge_code: '1702158', name: 'Aragominas', microregion: 'Araguaína' },
  { ibge_code: '1702307', name: 'Araguanã', microregion: 'Araguaína' },
  { ibge_code: '1703305', name: 'Babaçulândia', microregion: 'Araguaína' },
  { ibge_code: '1704105', name: 'Bandeirantes do Tocantins', microregion: 'Araguaína' },
  { ibge_code: '1705102', name: 'Carmolândia', microregion: 'Araguaína' },
  { ibge_code: '1706506', name: 'Colinas do Tocantins', microregion: 'Araguaína' },
  { ibge_code: '1707702', name: 'Filadélfia', microregion: 'Araguaína' },
  { ibge_code: '1714203', name: 'Muricilândia', microregion: 'Araguaína' },
  { ibge_code: '1715705', name: 'Nova Olinda', microregion: 'Araguaína' },
  { ibge_code: '1716109', name: 'Palmeirante', microregion: 'Araguaína' },
  { ibge_code: '1717206', name: 'Pau D\'Arco', microregion: 'Araguaína' },
  { ibge_code: '1718204', name: 'Piraquê', microregion: 'Araguaína' },
  { ibge_code: '1720101', name: 'Santa Fé do Araguaia', microregion: 'Araguaína' },
  { ibge_code: '1722081', name: 'Wanderlândia', microregion: 'Araguaína' },
  { ibge_code: '1722107', name: 'Xambioá', microregion: 'Araguaína' },

  // Microrregião de Palmas
  { ibge_code: '1721000', name: 'Palmas', microregion: 'Palmas' },
  { ibge_code: '1701903', name: 'Aparecida do Rio Negro', microregion: 'Palmas' },
  { ibge_code: '1704600', name: 'Brejinho de Nazaré', microregion: 'Palmas' },
  { ibge_code: '1707009', name: 'Crixás do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1707306', name: 'Fátima', microregion: 'Palmas' },
  { ibge_code: '1709500', name: 'Ipueiras', microregion: 'Palmas' },
  { ibge_code: '1710508', name: 'Lajeado', microregion: 'Palmas' },
  { ibge_code: '1712504', name: 'Miracema do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1713601', name: 'Monte do Carmo', microregion: 'Palmas' },
  { ibge_code: '1715607', name: 'Novo Acordo', microregion: 'Palmas' },
  { ibge_code: '1716505', name: 'Paraíso do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1717503', name: 'Pedro Afonso', microregion: 'Palmas' },
  { ibge_code: '1718006', name: 'Pium', microregion: 'Palmas' },
  { ibge_code: '1718840', name: 'Ponte Alta do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1718865', name: 'Porto Nacional', microregion: 'Palmas' },
  { ibge_code: '1720002', name: 'Santa Maria do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1720499', name: 'Santa Rosa do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1720804', name: 'São Félix do Tocantins', microregion: 'Palmas' },
  { ibge_code: '1720978', name: 'Silvanópolis', microregion: 'Palmas' },
  { ibge_code: '1721109', name: 'Tocantínia', microregion: 'Palmas' },

  // Microrregião de Gurupi
  { ibge_code: '1709005', name: 'Gurupi', microregion: 'Gurupi' },
  { ibge_code: '1700350', name: 'Aliança do Tocantins', microregion: 'Gurupi' },
  { ibge_code: '1700707', name: 'Alvorada', microregion: 'Gurupi' },
  { ibge_code: '1705508', name: 'Cariri do Tocantins', microregion: 'Gurupi' },
  { ibge_code: '1706100', name: 'Crixás do Tocantins', microregion: 'Gurupi' },
  { ibge_code: '1707405', name: 'Figueirópolis', microregion: 'Gurupi' },
  { ibge_code: '1708205', name: 'Formoso do Araguaia', microregion: 'Gurupi' },
  { ibge_code: '1709302', name: 'Jaú do Tocantins', microregion: 'Gurupi' },
  { ibge_code: '1717800', name: 'Peixe', microregion: 'Gurupi' },
  { ibge_code: '1720903', name: 'São Salvador do Tocantins', microregion: 'Gurupi' },
  { ibge_code: '1720937', name: 'São Valério', microregion: 'Gurupi' },
  { ibge_code: '1721208', name: 'Sucupira', microregion: 'Gurupi' },
  { ibge_code: '1721257', name: 'Talismã', microregion: 'Gurupi' },

  // Microrregião do Bico do Papagaio
  { ibge_code: '1700251', name: 'Aguiarnópolis', microregion: 'Bico do Papagaio' },
  { ibge_code: '1700400', name: 'Ananás', microregion: 'Bico do Papagaio' },
  { ibge_code: '1700509', name: 'Angico', microregion: 'Bico do Papagaio' },
  { ibge_code: '1702000', name: 'Araguatins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1702208', name: 'Augustinópolis', microregion: 'Bico do Papagaio' },
  { ibge_code: '1702406', name: 'Axixá do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1703008', name: 'Buriti do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1703057', name: 'Cachoeirinha', microregion: 'Bico do Papagaio' },
  { ibge_code: '1705557', name: 'Carrasco Bonito', microregion: 'Bico do Papagaio' },
  { ibge_code: '1707108', name: 'Darcinópolis', microregion: 'Bico do Papagaio' },
  { ibge_code: '1707553', name: 'Esperantina', microregion: 'Bico do Papagaio' },
  { ibge_code: '1709807', name: 'Itaguatins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1710706', name: 'Luzinópolis', microregion: 'Bico do Papagaio' },
  { ibge_code: '1711506', name: 'Maurilândia do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1714302', name: 'Nazaré', microregion: 'Bico do Papagaio' },
  { ibge_code: '1718451', name: 'Praia Norte', microregion: 'Bico do Papagaio' },
  { ibge_code: '1718899', name: 'Riachinho', microregion: 'Bico do Papagaio' },
  { ibge_code: '1719004', name: 'Sampaio', microregion: 'Bico do Papagaio' },
  { ibge_code: '1720259', name: 'Santa Terezinha do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1720655', name: 'São Bento do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1720853', name: 'São Miguel do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1720879', name: 'São Sebastião do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1721307', name: 'Sítio Novo do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1721505', name: 'Tocantinópolis', microregion: 'Bico do Papagaio' },

  // Microrregião de Dianópolis
  { ibge_code: '1707207', name: 'Dianópolis', microregion: 'Dianópolis' },
  { ibge_code: '1700301', name: 'Almas', microregion: 'Dianópolis' },
  { ibge_code: '1702554', name: 'Aurora do Tocantins', microregion: 'Dianópolis' },
  { ibge_code: '1706001', name: 'Combinado', microregion: 'Dianópolis' },
  { ibge_code: '1706258', name: 'Conceição do Tocantins', microregion: 'Dianópolis' },
  { ibge_code: '1710953', name: 'Lavandeira', microregion: 'Dianópolis' },
  { ibge_code: '1714880', name: 'Novo Alegre', microregion: 'Dianópolis' },
  { ibge_code: '1714909', name: 'Novo Jardim', microregion: 'Dianópolis' },
  { ibge_code: '1718501', name: 'Ponte Alta do Bom Jesus', microregion: 'Dianópolis' },
  { ibge_code: '1718550', name: 'Porto Alegre do Tocantins', microregion: 'Dianópolis' },
  { ibge_code: '1718659', name: 'Rio da Conceição', microregion: 'Dianópolis' },
  { ibge_code: '1721406', name: 'Taguatinga', microregion: 'Dianópolis' },

  // Microrregião do Jalapão
  { ibge_code: '1710904', name: 'Lizarda', microregion: 'Jalapão' },
  { ibge_code: '1711100', name: 'Mateiros', microregion: 'Jalapão' },
  { ibge_code: '1718709', name: 'Ponte Alta do Tocantins', microregion: 'Jalapão' },
  { ibge_code: '1718758', name: 'Rio Sono', microregion: 'Jalapão' },
  { ibge_code: '1720200', name: 'Santa Tereza do Tocantins', microregion: 'Jalapão' },

  // Microrregião de Miracema
  { ibge_code: '1701051', name: 'Abreulândia', microregion: 'Miracema' },
  { ibge_code: '1704809', name: 'Bernardo Sayão', microregion: 'Miracema' },
  { ibge_code: '1706605', name: 'Colméia', microregion: 'Miracema' },
  { ibge_code: '1706803', name: 'Couto Magalhães', microregion: 'Miracema' },
  { ibge_code: '1707652', name: 'Fortaleza do Tabocão', microregion: 'Miracema' },
  { ibge_code: '1708254', name: 'Goianorte', microregion: 'Miracema' },
  { ibge_code: '1709807', name: 'Guaraí', microregion: 'Miracema' },
  { ibge_code: '1710052', name: 'Itacajá', microregion: 'Miracema' },
  { ibge_code: '1710102', name: 'Itaporã do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1710300', name: 'Juarina', microregion: 'Miracema' },
  { ibge_code: '1712157', name: 'Miranorte', microregion: 'Miracema' },
  { ibge_code: '1714006', name: 'Pequizeiro', microregion: 'Miracema' },
  { ibge_code: '1717909', name: 'Presidente Kennedy', microregion: 'Miracema' },
  { ibge_code: '1718808', name: 'Rio dos Bois', microregion: 'Miracema' },
  { ibge_code: '1721604', name: 'Tupirama', microregion: 'Miracema' },
  { ibge_code: '1721703', name: 'Tupiratins', microregion: 'Miracema' },

  // Microrregião de Porto Nacional
  { ibge_code: '1703107', name: 'Centenário', microregion: 'Porto Nacional' },
  { ibge_code: '1703602', name: 'Chapada da Natividade', microregion: 'Porto Nacional' },
  { ibge_code: '1714107', name: 'Natividade', microregion: 'Porto Nacional' },
  { ibge_code: '1716604', name: 'Pindorama do Tocantins', microregion: 'Porto Nacional' },
  { ibge_code: '1719103', name: 'Santa Rosa do Tocantins', microregion: 'Porto Nacional' },

  // Outros municípios
  { ibge_code: '1700206', name: 'Abreulândia', microregion: 'Miracema' },
  { ibge_code: '1700903', name: 'Arapoema', microregion: 'Araguaína' },
  { ibge_code: '1702703', name: 'Barrolândia', microregion: 'Miracema' },
  { ibge_code: '1703107', name: 'Bom Jesus do Tocantins', microregion: 'Araguaína' },
  { ibge_code: '1703701', name: 'Brasilândia do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1703800', name: 'Brejinho de Nazaré', microregion: 'Palmas' },
  { ibge_code: '1703826', name: 'Buriti do Tocantins', microregion: 'Bico do Papagaio' },
  { ibge_code: '1703842', name: 'Chapada de Areia', microregion: 'Miracema' },
  { ibge_code: '1703867', name: 'Caseara', microregion: 'Miracema' },
  { ibge_code: '1703883', name: 'Cristalândia', microregion: 'Gurupi' },
  { ibge_code: '1703891', name: 'Divinópolis do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1703909', name: 'Dois Irmãos do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1704000', name: 'Dueré', microregion: 'Gurupi' },
  { ibge_code: '1707500', name: 'Goiatins', microregion: 'Jalapão' },
  { ibge_code: '1708304', name: 'Guaraí', microregion: 'Miracema' },
  { ibge_code: '1709609', name: 'Itapiratins', microregion: 'Miracema' },
  { ibge_code: '1710200', name: 'Lagoa da Confusão', microregion: 'Gurupi' },
  { ibge_code: '1710805', name: 'Marianópolis do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1712702', name: 'Monte Santo do Tocantins', microregion: 'Miracema' },
  { ibge_code: '1713205', name: 'Araguaçu', microregion: 'Gurupi' },
  { ibge_code: '1713809', name: 'Palmeiras do Tocantins', microregion: 'Araguaína' },
  { ibge_code: '1716703', name: 'Paranã', microregion: 'Dianópolis' },
  { ibge_code: '1717008', name: 'Pugmil', microregion: 'Miracema' },
  { ibge_code: '1718303', name: 'Recursolândia', microregion: 'Miracema' },
  { ibge_code: '1720309', name: 'Sandolândia', microregion: 'Gurupi' },
  { ibge_code: '1720952', name: 'Tabocão', microregion: 'Miracema' },
  { ibge_code: '1721000', name: 'Taipas do Tocantins', microregion: 'Dianópolis' },
];

// Código do estado do Tocantins
export const TOCANTINS_STATE_CODE = '17';

// Anos disponíveis para coleta
export const AVAILABLE_YEARS = [2020, 2021, 2022, 2023, 2024];

// Mapeamento de códigos IBGE para IDs internos (será preenchido na execução)
export const ibgeToInternalId: Map<string, string> = new Map();
