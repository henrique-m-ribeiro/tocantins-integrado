/**
 * Seed: Dados das regiões do Tocantins
 * Mesorregiões, Microrregiões e Municípios
 */

// Mesorregiões do Tocantins
export const MESOREGIONS = [
  { ibge_code: '1701', name: 'Ocidental do Tocantins' },
  { ibge_code: '1702', name: 'Oriental do Tocantins' }
];

// Microrregiões do Tocantins (8 microrregiões)
export const MICROREGIONS = [
  // Mesorregião Ocidental
  { ibge_code: '17001', name: 'Bico do Papagaio', mesoregion: 'Ocidental do Tocantins' },
  { ibge_code: '17002', name: 'Araguaína', mesoregion: 'Ocidental do Tocantins' },
  { ibge_code: '17003', name: 'Miracema do Tocantins', mesoregion: 'Ocidental do Tocantins' },
  { ibge_code: '17004', name: 'Rio Formoso', mesoregion: 'Ocidental do Tocantins' },
  { ibge_code: '17005', name: 'Gurupi', mesoregion: 'Ocidental do Tocantins' },
  // Mesorregião Oriental
  { ibge_code: '17006', name: 'Porto Nacional', mesoregion: 'Oriental do Tocantins' },
  { ibge_code: '17007', name: 'Jalapão', mesoregion: 'Oriental do Tocantins' },
  { ibge_code: '17008', name: 'Dianópolis', mesoregion: 'Oriental do Tocantins' }
];

// 139 Municípios do Tocantins
export const MUNICIPALITIES = [
  // Microrregião: Bico do Papagaio (25 municípios)
  { ibge_code: '1700251', name: 'Aguiarnópolis', microregion: 'Bico do Papagaio', population: 6029, area: 235.043, lat: -6.5553, lon: -47.4711 },
  { ibge_code: '1700301', name: 'Ananás', microregion: 'Bico do Papagaio', population: 9965, area: 1577.045, lat: -6.3644, lon: -48.0722 },
  { ibge_code: '1700350', name: 'Angico', microregion: 'Bico do Papagaio', population: 3598, area: 447.396, lat: -6.3919, lon: -47.8614 },
  { ibge_code: '1701002', name: 'Araguatins', microregion: 'Bico do Papagaio', population: 35761, area: 2625.286, lat: -5.6472, lon: -48.1242 },
  { ibge_code: '1701051', name: 'Augustinópolis', microregion: 'Bico do Papagaio', population: 18412, area: 398.666, lat: -5.4683, lon: -47.8867 },
  { ibge_code: '1701309', name: 'Axixá do Tocantins', microregion: 'Bico do Papagaio', population: 10708, area: 151.171, lat: -5.6142, lon: -47.7700 },
  { ibge_code: '1701903', name: 'Buriti do Tocantins', microregion: 'Bico do Papagaio', population: 10914, area: 249.249, lat: -5.3142, lon: -48.2283 },
  { ibge_code: '1702000', name: 'Cachoeirinha', microregion: 'Bico do Papagaio', population: 2082, area: 350.523, lat: -6.1153, lon: -47.9267 },
  { ibge_code: '1703602', name: 'Carrasco Bonito', microregion: 'Bico do Papagaio', population: 4110, area: 192.896, lat: -5.3142, lon: -48.0350 },
  { ibge_code: '1704600', name: 'Darcinópolis', microregion: 'Bico do Papagaio', population: 5765, area: 1642.613, lat: -6.7156, lon: -47.7583 },
  { ibge_code: '1705102', name: 'Esperantina', microregion: 'Bico do Papagaio', population: 11503, area: 505.041, lat: -5.3644, lon: -48.5358 },
  { ibge_code: '1707405', name: 'Itaguatins', microregion: 'Bico do Papagaio', population: 5896, area: 737.221, lat: -5.7728, lon: -47.4881 },
  { ibge_code: '1709005', name: 'Luzinópolis', microregion: 'Bico do Papagaio', population: 3038, area: 274.982, lat: -6.1764, lon: -47.8600 },
  { ibge_code: '1709807', name: 'Maurilândia do Tocantins', microregion: 'Bico do Papagaio', population: 3594, area: 724.564, lat: -5.9517, lon: -47.5128 },
  { ibge_code: '1710508', name: 'Nazaré', microregion: 'Bico do Papagaio', population: 5395, area: 393.246, lat: -6.3742, lon: -47.6639 },
  { ibge_code: '1712157', name: 'Palmeiras do Tocantins', microregion: 'Bico do Papagaio', population: 5980, area: 743.527, lat: -6.6150, lon: -47.5461 },
  { ibge_code: '1713809', name: 'Praia Norte', microregion: 'Bico do Papagaio', population: 8779, area: 290.269, lat: -5.3919, lon: -47.8111 },
  { ibge_code: '1715002', name: 'Riachinho', microregion: 'Bico do Papagaio', population: 4617, area: 560.640, lat: -6.4364, lon: -48.1347 },
  { ibge_code: '1716109', name: 'Sampaio', microregion: 'Bico do Papagaio', population: 3917, area: 199.524, lat: -5.3547, lon: -47.8789 },
  { ibge_code: '1716505', name: 'Santa Terezinha do Tocantins', microregion: 'Bico do Papagaio', population: 2601, area: 276.046, lat: -5.2969, lon: -47.6711 },
  { ibge_code: '1717008', name: 'São Bento do Tocantins', microregion: 'Bico do Papagaio', population: 5087, area: 1104.534, lat: -6.0256, lon: -47.9017 },
  { ibge_code: '1717800', name: 'São Miguel do Tocantins', microregion: 'Bico do Papagaio', population: 11044, area: 398.827, lat: -5.5611, lon: -47.5783 },
  { ibge_code: '1718006', name: 'São Sebastião do Tocantins', microregion: 'Bico do Papagaio', population: 4607, area: 280.192, lat: -5.2558, lon: -48.2017 },
  { ibge_code: '1718204', name: 'Sítio Novo do Tocantins', microregion: 'Bico do Papagaio', population: 10338, area: 324.506, lat: -5.6003, lon: -47.6372 },
  { ibge_code: '1720853', name: 'Tocantinópolis', microregion: 'Bico do Papagaio', population: 23119, area: 1077.073, lat: -6.3308, lon: -47.4172 },

  // Microrregião: Araguaína (17 municípios)
  { ibge_code: '1700707', name: 'Aragominas', microregion: 'Araguaína', population: 5882, area: 1168.629, lat: -7.1583, lon: -48.5267 },
  { ibge_code: '1701101', name: 'Araguaína', microregion: 'Araguaína', population: 183381, area: 4000.416, lat: -7.1911, lon: -48.2072 },
  { ibge_code: '1701200', name: 'Araguanã', microregion: 'Araguaína', population: 5011, area: 817.656, lat: -6.5808, lon: -48.6392 },
  { ibge_code: '1702208', name: 'Carmolândia', microregion: 'Araguaína', population: 2547, area: 278.276, lat: -7.0339, lon: -48.3953 },
  { ibge_code: '1704105', name: 'Colinas do Tocantins', microregion: 'Araguaína', population: 36909, area: 843.846, lat: -8.0583, lon: -48.4758 },
  { ibge_code: '1705201', name: 'Filadélfia', microregion: 'Araguaína', population: 9085, area: 1988.149, lat: -7.3353, lon: -47.4961 },
  { ibge_code: '1709302', name: 'Muricilândia', microregion: 'Araguaína', population: 3806, area: 1187.254, lat: -7.1494, lon: -48.6092 },
  { ibge_code: '1711100', name: 'Nova Olinda', microregion: 'Araguaína', population: 12263, area: 1567.746, lat: -7.6308, lon: -48.4256 },
  { ibge_code: '1712702', name: 'Pau d\'Arco', microregion: 'Araguaína', population: 5142, area: 1329.315, lat: -7.5378, lon: -49.3706 },
  { ibge_code: '1713205', name: 'Piraquê', microregion: 'Araguaína', population: 3093, area: 1334.665, lat: -6.7647, lon: -48.2972 },
  { ibge_code: '1716604', name: 'Santa Fé do Araguaia', microregion: 'Araguaína', population: 7672, area: 1670.153, lat: -7.1583, lon: -48.7125 },
  { ibge_code: '1720002', name: 'Wanderlândia', microregion: 'Araguaína', population: 11395, area: 1373.066, lat: -6.8489, lon: -47.9628 },
  { ibge_code: '1700400', name: 'Arapoema', microregion: 'Araguaína', population: 6942, area: 1554.983, lat: -7.6547, lon: -49.0636 },
  { ibge_code: '1701708', name: 'Babaçulândia', microregion: 'Araguaína', population: 10839, area: 1788.080, lat: -7.0908, lon: -47.7608 },
  { ibge_code: '1702307', name: 'Bandeirantes do Tocantins', microregion: 'Araguaína', population: 3414, area: 1541.028, lat: -7.7572, lon: -48.5847 },
  { ibge_code: '1711506', name: 'Palmeirante', microregion: 'Araguaína', population: 5310, area: 2598.403, lat: -7.8583, lon: -47.9269 },
  { ibge_code: '1720937', name: 'Xambioá', microregion: 'Araguaína', population: 11671, area: 1186.165, lat: -6.4139, lon: -48.5333 },

  // Microrregião: Miracema do Tocantins (24 municípios)
  { ibge_code: '1700608', name: 'Abreulândia', microregion: 'Miracema do Tocantins', population: 2544, area: 1895.214, lat: -9.6217, lon: -49.1536 },
  { ibge_code: '1702406', name: 'Barrolândia', microregion: 'Miracema do Tocantins', population: 6019, area: 713.035, lat: -9.8339, lon: -48.7256 },
  { ibge_code: '1703107', name: 'Bernardo Sayão', microregion: 'Miracema do Tocantins', population: 4587, area: 987.857, lat: -7.8739, lon: -48.8864 },
  { ibge_code: '1703305', name: 'Brasilândia do Tocantins', microregion: 'Miracema do Tocantins', population: 2375, area: 643.408, lat: -8.3892, lon: -48.4833 },
  { ibge_code: '1704303', name: 'Couto Magalhães', microregion: 'Miracema do Tocantins', population: 5588, area: 1582.967, lat: -8.2836, lon: -49.2497 },
  { ibge_code: '1705508', name: 'Fortaleza do Tabocão', microregion: 'Miracema do Tocantins', population: 3009, area: 242.098, lat: -9.0556, lon: -48.5203 },
  { ibge_code: '1706506', name: 'Goianorte', microregion: 'Miracema do Tocantins', population: 4967, area: 1800.419, lat: -8.7742, lon: -48.9275 },
  { ibge_code: '1707702', name: 'Itaporã do Tocantins', microregion: 'Miracema do Tocantins', population: 2491, area: 989.645, lat: -8.5717, lon: -48.6883 },
  { ibge_code: '1708304', name: 'Juarina', microregion: 'Miracema do Tocantins', population: 2433, area: 502.748, lat: -8.1197, lon: -49.0636 },
  { ibge_code: '1709500', name: 'Miracema do Tocantins', microregion: 'Miracema do Tocantins', population: 18831, area: 2656.090, lat: -9.5647, lon: -48.3939 },
  { ibge_code: '1709609', name: 'Miranorte', microregion: 'Miracema do Tocantins', population: 13316, area: 1032.754, lat: -9.5292, lon: -48.5903 },
  { ibge_code: '1711001', name: 'Pequizeiro', microregion: 'Miracema do Tocantins', population: 5262, area: 1179.067, lat: -8.5922, lon: -48.9314 },
  { ibge_code: '1713957', name: 'Presidente Kennedy', microregion: 'Miracema do Tocantins', population: 3614, area: 772.089, lat: -8.5392, lon: -48.5111 },
  { ibge_code: '1715705', name: 'Rio dos Bois', microregion: 'Miracema do Tocantins', population: 2741, area: 847.821, lat: -9.3422, lon: -48.5314 },
  { ibge_code: '1718303', name: 'Tupirama', microregion: 'Miracema do Tocantins', population: 1858, area: 715.818, lat: -8.9717, lon: -48.1878 },
  { ibge_code: '1718402', name: 'Tupiratins', microregion: 'Miracema do Tocantins', population: 1894, area: 899.548, lat: -8.3956, lon: -48.1300 },
  { ibge_code: '1702554', name: 'Caseara', microregion: 'Miracema do Tocantins', population: 5138, area: 1691.601, lat: -9.2783, lon: -49.9506 },
  { ibge_code: '1703701', name: 'Chapada de Areia', microregion: 'Miracema do Tocantins', population: 1249, area: 663.880, lat: -10.1419, lon: -49.1397 },
  { ibge_code: '1704402', name: 'Cristalândia', microregion: 'Miracema do Tocantins', population: 7498, area: 1850.814, lat: -10.6008, lon: -49.1956 },
  { ibge_code: '1705607', name: 'Dois Irmãos do Tocantins', microregion: 'Miracema do Tocantins', population: 5874, area: 3747.306, lat: -9.2583, lon: -49.0642 },
  { ibge_code: '1706258', name: 'Divinópolis do Tocantins', microregion: 'Miracema do Tocantins', population: 7053, area: 2304.037, lat: -9.8058, lon: -49.2183 },
  { ibge_code: '1709708', name: 'Monte do Carmo', microregion: 'Miracema do Tocantins', population: 7863, area: 3609.693, lat: -10.7633, lon: -48.1094 },
  { ibge_code: '1710904', name: 'Nova Rosalândia', microregion: 'Miracema do Tocantins', population: 3844, area: 517.424, lat: -10.5606, lon: -48.9100 },
  { ibge_code: '1712009', name: 'Paraíso do Tocantins', microregion: 'Miracema do Tocantins', population: 52231, area: 1268.060, lat: -10.1750, lon: -48.8825 },

  // Microrregião: Rio Formoso (13 municípios)
  { ibge_code: '1700707', name: 'Araguaçu', microregion: 'Rio Formoso', population: 8786, area: 5167.705, lat: -12.9292, lon: -49.8264 },
  { ibge_code: '1705557', name: 'Dueré', microregion: 'Rio Formoso', population: 4956, area: 2609.858, lat: -11.3456, lon: -49.2672 },
  { ibge_code: '1705706', name: 'Fátima', microregion: 'Rio Formoso', population: 4023, area: 381.771, lat: -10.7617, lon: -48.9053 },
  { ibge_code: '1705805', name: 'Figueirópolis', microregion: 'Rio Formoso', population: 5977, area: 1931.324, lat: -12.1306, lon: -49.1744 },
  { ibge_code: '1706001', name: 'Formoso do Araguaia', microregion: 'Rio Formoso', population: 18440, area: 13423.392, lat: -11.7975, lon: -49.5306 },
  { ibge_code: '1707553', name: 'Jaú do Tocantins', microregion: 'Rio Formoso', population: 3881, area: 2170.299, lat: -12.6508, lon: -48.5922 },
  { ibge_code: '1708205', name: 'Lagoa da Confusão', microregion: 'Rio Formoso', population: 14092, area: 10564.110, lat: -10.7900, lon: -49.6208 },
  { ibge_code: '1712454', name: 'Pium', microregion: 'Rio Formoso', population: 7454, area: 10013.802, lat: -10.4422, lon: -49.1847 },
  { ibge_code: '1716703', name: 'Sandolândia', microregion: 'Rio Formoso', population: 3325, area: 3545.213, lat: -12.5392, lon: -49.9264 },
  { ibge_code: '1716802', name: 'Santa Rita do Tocantins', microregion: 'Rio Formoso', population: 2128, area: 3274.899, lat: -10.8608, lon: -48.9144 },
  { ibge_code: '1718899', name: 'Cariri do Tocantins', microregion: 'Rio Formoso', population: 4067, area: 1128.570, lat: -11.8897, lon: -49.1572 },
  { ibge_code: '1718881', name: 'Sucupira', microregion: 'Rio Formoso', population: 1808, area: 1040.632, lat: -12.0997, lon: -48.9694 },
  { ibge_code: '1718840', name: 'Talismã', microregion: 'Rio Formoso', population: 2606, area: 614.980, lat: -12.7922, lon: -49.0908 },

  // Microrregião: Gurupi (14 municípios)
  { ibge_code: '1700203', name: 'Aliança do Tocantins', microregion: 'Gurupi', population: 6003, area: 1580.724, lat: -11.3058, lon: -48.9369 },
  { ibge_code: '1700806', name: 'Alvorada', microregion: 'Gurupi', population: 8595, area: 1212.201, lat: -12.4783, lon: -49.1239 },
  { ibge_code: '1702703', name: 'Brejinho de Nazaré', microregion: 'Gurupi', population: 5526, area: 1727.929, lat: -11.0072, lon: -48.5683 },
  { ibge_code: '1702901', name: 'Cariri do Tocantins', microregion: 'Gurupi', population: 4067, area: 1128.570, lat: -11.8897, lon: -49.1572 },
  { ibge_code: '1703008', name: 'Crixás do Tocantins', microregion: 'Gurupi', population: 1584, area: 1838.315, lat: -11.1011, lon: -48.9158 },
  { ibge_code: '1706100', name: 'Gurupi', microregion: 'Gurupi', population: 87545, area: 1836.091, lat: -11.7294, lon: -49.0683 },
  { ibge_code: '1711702', name: 'Palmeirópolis', microregion: 'Gurupi', population: 8061, area: 741.297, lat: -13.0442, lon: -48.4019 },
  { ibge_code: '1712504', name: 'Peixe', microregion: 'Gurupi', population: 12073, area: 5290.821, lat: -12.0258, lon: -48.5408 },
  { ibge_code: '1720101', name: 'São Salvador do Tocantins', microregion: 'Gurupi', population: 2961, area: 1422.030, lat: -12.7436, lon: -48.2347 },
  { ibge_code: '1720903', name: 'São Valério', microregion: 'Gurupi', population: 4700, area: 2656.633, lat: -11.9708, lon: -48.2308 },

  // Microrregião: Porto Nacional (20 municípios)
  { ibge_code: '1700105', name: 'Aparecida do Rio Negro', microregion: 'Porto Nacional', population: 4925, area: 1158.927, lat: -9.9422, lon: -47.9639 },
  { ibge_code: '1702158', name: 'Bom Jesus do Tocantins', microregion: 'Porto Nacional', population: 4285, area: 1331.358, lat: -8.9656, lon: -48.1669 },
  { ibge_code: '1703800', name: 'Centenário', microregion: 'Porto Nacional', population: 2574, area: 1953.654, lat: -8.9583, lon: -47.3372 },
  { ibge_code: '1707009', name: 'Goiatins', microregion: 'Porto Nacional', population: 13103, area: 6408.628, lat: -7.7114, lon: -47.3158 },
  { ibge_code: '1707108', name: 'Guaraí', microregion: 'Porto Nacional', population: 25679, area: 2101.308, lat: -8.8342, lon: -48.5108 },
  { ibge_code: '1707207', name: 'Ipueiras', microregion: 'Porto National', population: 1903, area: 814.605, lat: -11.2264, lon: -48.4614 },
  { ibge_code: '1707306', name: 'Itacajá', microregion: 'Porto Nacional', population: 7452, area: 3051.297, lat: -8.3933, lon: -47.7756 },
  { ibge_code: '1707500', name: 'Itapiratins', microregion: 'Porto Nacional', population: 3680, area: 1247.088, lat: -8.3742, lon: -48.1075 },
  { ibge_code: '1708254', name: 'Lajeado', microregion: 'Porto Nacional', population: 3316, area: 325.112, lat: -9.7500, lon: -48.3569 },
  { ibge_code: '1709807', name: 'Monte Santo do Tocantins', microregion: 'Porto Nacional', population: 2199, area: 1091.168, lat: -9.2578, lon: -48.3553 },
  { ibge_code: '1710706', name: 'Novo Acordo', microregion: 'Porto Nacional', population: 4138, area: 2679.579, lat: -9.9667, lon: -47.6722 },
  { ibge_code: '1711803', name: 'Palmas', microregion: 'Porto Nacional', population: 313349, area: 2218.943, lat: -10.2128, lon: -48.3603 },
  { ibge_code: '1712405', name: 'Pedro Afonso', microregion: 'Porto Nacional', population: 14306, area: 2010.884, lat: -8.9692, lon: -48.1739 },
  { ibge_code: '1713304', name: 'Porto Nacional', microregion: 'Porto Nacional', population: 53316, area: 4449.917, lat: -10.7081, lon: -48.4172 },
  { ibge_code: '1715507', name: 'Recursolândia', microregion: 'Porto Nacional', population: 3744, area: 2135.377, lat: -8.7347, lon: -47.2411 },
  { ibge_code: '1715754', name: 'Rio Sono', microregion: 'Porto Nacional', population: 6680, area: 6341.062, lat: -9.3508, lon: -47.8894 },
  { ibge_code: '1716208', name: 'Santa Maria do Tocantins', microregion: 'Porto Nacional', population: 3222, area: 1409.085, lat: -8.8033, lon: -47.7883 },
  { ibge_code: '1716307', name: 'Santa Tereza do Tocantins', microregion: 'Porto Nacional', population: 2854, area: 549.561, lat: -10.2733, lon: -47.8028 },
  { ibge_code: '1717503', name: 'Silvanópolis', microregion: 'Porto Nacional', population: 5464, area: 1256.900, lat: -11.1475, lon: -48.1753 },
  { ibge_code: '1720150', name: 'Tocantínia', microregion: 'Porto Nacional', population: 7608, area: 2602.839, lat: -9.5633, lon: -48.1094 },

  // Microrregião: Jalapão (15 municípios)
  { ibge_code: '1702109', name: 'Campos Lindos', microregion: 'Jalapão', population: 10250, area: 3240.190, lat: -7.9892, lon: -46.8647 },
  { ibge_code: '1707504', name: 'Itapiratins', microregion: 'Jalapão', population: 3680, area: 1247.088, lat: -8.3742, lon: -48.1075 },
  { ibge_code: '1708106', name: 'Lizarda', microregion: 'Jalapão', population: 3881, area: 5765.588, lat: -9.5914, lon: -46.6750 },
  { ibge_code: '1708601', name: 'Mateiros', microregion: 'Jalapão', population: 2765, area: 9681.382, lat: -10.5464, lon: -46.4172 },
  { ibge_code: '1711209', name: 'Novo Acordo', microregion: 'Jalapão', population: 4138, area: 2679.579, lat: -9.9667, lon: -47.6722 },
  { ibge_code: '1712308', name: 'Palmeirópolis', microregion: 'Jalapão', population: 8061, area: 741.297, lat: -13.0442, lon: -48.4019 },
  { ibge_code: '1712801', name: 'Ponte Alta do Bom Jesus', microregion: 'Jalapão', population: 4740, area: 1651.668, lat: -12.0858, lon: -46.4800 },
  { ibge_code: '1713601', name: 'Ponte Alta do Tocantins', microregion: 'Jalapão', population: 8232, area: 6494.893, lat: -10.7475, lon: -47.5328 },
  { ibge_code: '1715259', name: 'Rio da Conceição', microregion: 'Jalapão', population: 2119, area: 880.792, lat: -11.4094, lon: -46.8878 },
  { ibge_code: '1716950', name: 'São Félix do Tocantins', microregion: 'Jalapão', population: 1654, area: 1948.792, lat: -10.1633, lon: -46.6592 },
  { ibge_code: '1715903', name: 'Rio Sono', microregion: 'Jalapão', population: 6680, area: 6341.062, lat: -9.3508, lon: -47.8894 },
  { ibge_code: '1716406', name: 'Santa Tereza do Tocantins', microregion: 'Jalapão', population: 2854, area: 549.561, lat: -10.2733, lon: -47.8028 },
  { ibge_code: '1718550', name: 'Lagoa do Tocantins', microregion: 'Jalapão', population: 3810, area: 875.458, lat: -10.3719, lon: -47.5394 },

  // Microrregião: Dianópolis (11 municípios)
  { ibge_code: '1700709', name: 'Almas', microregion: 'Dianópolis', population: 7549, area: 4012.403, lat: -11.5708, lon: -47.1742 },
  { ibge_code: '1701405', name: 'Aurora do Tocantins', microregion: 'Dianópolis', population: 3465, area: 753.668, lat: -12.7108, lon: -46.4078 },
  { ibge_code: '1703206', name: 'Combinado', microregion: 'Dianópolis', population: 5064, area: 205.976, lat: -12.7917, lon: -46.5381 },
  { ibge_code: '1703503', name: 'Conceição do Tocantins', microregion: 'Dianópolis', population: 4181, area: 2500.917, lat: -12.2211, lon: -47.2964 },
  { ibge_code: '1704501', name: 'Dianópolis', microregion: 'Dianópolis', population: 22061, area: 3337.265, lat: -11.6244, lon: -46.8203 },
  { ibge_code: '1708502', name: 'Lavandeira', microregion: 'Dianópolis', population: 1938, area: 424.545, lat: -12.7858, lon: -46.5106 },
  { ibge_code: '1710300', name: 'Natividade', microregion: 'Dianópolis', population: 9581, area: 3239.921, lat: -11.7097, lon: -47.7228 },
  { ibge_code: '1710401', name: 'Novo Alegre', microregion: 'Dianópolis', population: 2369, area: 194.101, lat: -12.9208, lon: -46.5697 },
  { ibge_code: '1711902', name: 'Paranã', microregion: 'Dianópolis', population: 10637, area: 11260.206, lat: -12.6147, lon: -47.8858 },
  { ibge_code: '1718659', name: 'Porto Alegre do Tocantins', microregion: 'Dianópolis', population: 2916, area: 447.838, lat: -11.6172, lon: -47.0533 },
  { ibge_code: '1718709', name: 'Taipas do Tocantins', microregion: 'Dianópolis', population: 1949, area: 1084.766, lat: -12.1883, lon: -46.9808 },
  { ibge_code: '1718758', name: 'Taguatinga', microregion: 'Dianópolis', population: 16672, area: 2432.121, lat: -12.4042, lon: -46.4342 }
];

// Função para calcular densidade
export function calculateDensity(population: number, area: number): number {
  return Math.round((population / area) * 100) / 100;
}
