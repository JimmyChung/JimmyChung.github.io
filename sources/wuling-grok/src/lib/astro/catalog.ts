export type Star = {
  id: string;
  zh: string;
  en: string;
  ra: number;
  dec: number;
  mag: number;
  con: string;
  /** Show the Chinese name even when fainter than the auto cutoff. */
  tag?: boolean;
  blurb?: string;
};

export type Constellation = {
  id: string;
  name: string;
  short: string;
  about: string;
  lines: [string, string][];
};

export type DeepSky = {
  id: string;
  name: string;
  en: string;
  ra: number;
  dec: number;
  blurb: string;
};

function S(
  id: string,
  zh: string,
  en: string,
  ra: number,
  dec: number,
  mag: number,
  con: string,
  extra?: Partial<Pick<Star, "tag" | "blurb">>,
): Star {
  return { id, zh, en, ra, dec, mag, con, ...extra };
}

export const STARS: Star[] = [
  S("polaris", "北極星", "Polaris", 2.53, 89.264, 1.98, "umi", {
    tag: true,
    blurb: "幾乎不動。在武陵它離地平大約 24°，約手臂伸直、兩拳再高一點。面向它就是正北。",
  }),
  S("kochab", "帝", "Kochab", 14.845, 74.155, 2.08, "umi", { tag: true }),
  S("pherkad", "太子", "Pherkad", 15.345, 71.834, 3.05, "umi", { tag: true }),
  S("yildun", "", "Yildun", 17.536, 86.586, 4.36, "umi"),
  S("umiEps", "", "ε UMi", 16.766, 82.037, 4.21, "umi"),
  S("umiZeta", "", "ζ UMi", 15.734, 77.794, 4.29, "umi"),
  S("umiEta", "", "η UMi", 16.292, 75.755, 4.95, "umi"),

  S("dubhe", "天樞", "Dubhe", 11.062, 61.751, 1.79, "uma", { tag: true }),
  S("merak", "天璇", "Merak", 11.031, 56.382, 2.37, "uma", { tag: true }),
  S("phecda", "天璣", "Phecda", 11.897, 53.695, 2.44, "uma", { tag: true }),
  S("megrez", "天權", "Megrez", 12.257, 57.033, 3.31, "uma", { tag: true }),
  S("alioth", "玉衡", "Alioth", 12.9, 55.96, 1.77, "uma", { tag: true }),
  S("mizar", "開陽", "Mizar", 13.399, 54.925, 2.23, "uma", { tag: true }),
  S("alkaid", "搖光", "Alkaid", 13.792, 49.313, 1.86, "uma", {
    tag: true,
    blurb: "北斗勺把最末的那顆。順著勺口兩星向外延伸約五倍，就是北極星。",
  }),

  S("schedar", "王良四", "Schedar", 0.675, 56.537, 2.24, "cas", { tag: true }),
  S("caph", "王良一", "Caph", 0.153, 59.15, 2.27, "cas", { tag: true }),
  S("cassGamma", "策", "γ Cas", 0.945, 60.717, 2.15, "cas", { tag: true }),
  S("ruchbah", "閣道三", "Ruchbah", 1.43, 60.235, 2.68, "cas"),
  S("segin", "閣道二", "Segin", 1.906, 63.67, 3.37, "cas"),

  S("alderamin", "天鈎五", "Alderamin", 21.31, 62.585, 2.44, "cep"),
  S("alfirk", "", "Alfirk", 21.478, 70.56, 3.23, "cep"),
  S("errai", "", "Errai", 23.655, 77.632, 3.21, "cep"),
  S("cepIota", "", "ι Cep", 22.828, 66.2, 3.52, "cep"),
  S("cepZeta", "", "ζ Cep", 22.181, 58.201, 3.35, "cep"),

  S("eltanin", "天棓四", "Eltanin", 17.943, 51.489, 2.23, "dra"),
  S("rastaban", "天棓三", "Rastaban", 17.507, 52.301, 2.79, "dra"),
  S("grumium", "", "Grumium", 17.897, 56.872, 3.75, "dra"),
  S("draEta", "", "η Dra", 16.4, 61.514, 2.74, "dra"),
  S("draZeta", "", "ζ Dra", 17.146, 65.714, 3.17, "dra"),
  S("altais", "", "Altais", 19.209, 67.661, 3.07, "dra"),
  S("thuban", "右樞", "Thuban", 14.073, 64.376, 3.67, "dra", {
    blurb: "四千多年前的北極星。現在它只是天龍身子裡較亮的一顆。",
  }),
  S("draIota", "", "ι Dra", 15.415, 58.966, 3.29, "dra"),

  S("vega", "織女", "Vega", 18.616, 38.784, 0.03, "lyr", {
    tag: true,
    blurb: "夏季大三角裡最亮、偏藍白的那顆。七夕故事裡隔著銀河看牛郎。",
  }),
  S("sheliak", "", "Sheliak", 18.835, 33.363, 3.45, "lyr"),
  S("sulafat", "", "Sulafat", 18.982, 32.69, 3.25, "lyr"),
  S("lyrDelta", "", "δ Lyr", 18.908, 36.9, 4.3, "lyr"),
  S("lyrZeta", "", "ζ Lyr", 18.746, 37.605, 4.34, "lyr"),

  S("deneb", "天津四", "Deneb", 20.69, 45.28, 1.25, "cyg", {
    tag: true,
    blurb: "天鵝的尾巴，嵌在銀河裡。它其實非常遠，所以雖亮卻不像織女那麼刺眼。",
  }),
  S("sadr", "天津一", "Sadr", 20.37, 40.257, 2.23, "cyg", { tag: true }),
  S("albireo", "輦道增七", "Albireo", 19.512, 27.96, 3.05, "cyg", {
    blurb: "天鵝的頭。小望遠鏡裡是金藍雙星，肉眼看就是十字下方那顆。",
  }),
  S("fawaris", "天津二", "Fawaris", 19.749, 45.131, 2.87, "cyg"),
  S("aljanah", "天津九", "Aljanah", 20.77, 33.97, 2.48, "cyg"),

  S("altair", "牛郎", "Altair", 19.846, 8.868, 0.76, "aql", {
    tag: true,
    blurb: "牛郎星。兩旁各有一顆較暗的星，像一根扁擔。和織女、天津四組成夏季大三角。",
  }),
  S("alshain", "河鼓一", "Alshain", 19.921, 6.407, 3.71, "aql", { tag: true }),
  S("tarazed", "河鼓三", "Tarazed", 19.771, 10.613, 2.72, "aql", { tag: true }),
  S("aqlDelta", "", "δ Aql", 19.425, 3.115, 3.36, "aql"),
  S("aqlTheta", "", "θ Aql", 20.188, -0.822, 3.24, "aql"),

  S("antares", "心宿二", "Antares", 16.49, -26.432, 1.06, "sco", {
    tag: true,
    blurb: "天蠍的紅心。夏天往南看，那條彎鉤很醒目，紅星就是心臟。",
  }),
  S("acrab", "房宿四", "Acrab", 16.09, -19.805, 2.56, "sco", { tag: true }),
  S("dschubba", "房宿三", "Dschubba", 16.006, -22.622, 2.32, "sco", { tag: true }),
  S("scoPi", "房宿一", "π Sco", 15.981, -26.114, 2.89, "sco"),
  S("alniyat", "心宿一", "Alniyat", 16.353, -25.593, 2.88, "sco"),
  S("scoTau", "心宿三", "τ Sco", 16.598, -28.216, 2.82, "sco"),
  S("scoEps", "尾宿二", "ε Sco", 16.836, -34.293, 2.29, "sco"),
  S("scoMu", "", "μ Sco", 16.865, -38.048, 3.08, "sco"),
  S("scoZeta", "", "ζ Sco", 16.91, -42.362, 3.62, "sco"),
  S("scoEta", "", "η Sco", 17.202, -43.239, 3.33, "sco"),
  S("sargas", "尾宿五", "Sargas", 17.622, -42.998, 1.86, "sco", { tag: true }),
  S("scoIota", "", "ι Sco", 17.794, -40.127, 3.03, "sco"),
  S("scoKappa", "", "κ Sco", 17.708, -39.03, 2.39, "sco"),
  S("shaula", "尾宿八", "Shaula", 17.56, -37.104, 1.62, "sco", {
    tag: true,
    blurb: "蠍尾的螫針，和旁邊的尾宿九靠得很近。",
  }),
  S("lesath", "尾宿九", "Lesath", 17.513, -37.295, 2.7, "sco", { tag: true }),

  S("kausAus", "箕宿三", "Kaus Australis", 18.403, -34.385, 1.85, "sgr", { tag: true }),
  S("kausMed", "箕宿二", "Kaus Media", 18.35, -29.828, 2.7, "sgr"),
  S("kausBor", "箕宿一", "Kaus Borealis", 18.466, -25.422, 2.81, "sgr"),
  S("alnasl", "箕宿四", "Alnasl", 18.096, -30.424, 2.98, "sgr"),
  S("nunki", "斗宿四", "Nunki", 18.921, -26.297, 2.05, "sgr", { tag: true }),
  S("ascella", "斗宿一", "Ascella", 19.044, -29.88, 2.6, "sgr"),
  S("sgrPhi", "", "φ Sgr", 18.761, -26.991, 3.17, "sgr"),
  S("sgrTau", "", "τ Sgr", 19.116, -27.67, 3.32, "sgr"),

  S("zubenEl", "氐宿一", "Zubenelgenubi", 14.848, -16.042, 2.75, "lib"),
  S("zubenEs", "氐宿四", "Zubeneschamali", 15.283, -9.383, 2.61, "lib"),
  S("libGamma", "", "γ Lib", 15.592, -14.789, 3.91, "lib"),
  S("libSigma", "", "σ Lib", 15.068, -25.282, 3.29, "lib"),

  S("spica", "角宿一", "Spica", 13.42, -11.161, 0.97, "vir", {
    tag: true,
    blurb: "室女座最亮的藍白星。春天夜空裡，從北斗勺把的弧線可以甩到大角，再甩到角宿一。",
  }),
  S("vindemiatrix", "太微左垣", "Vindemiatrix", 13.037, 10.959, 2.83, "vir"),
  S("porrima", "東上相", "Porrima", 12.695, -1.449, 2.74, "vir"),
  S("zavijava", "", "Zavijava", 11.845, 1.765, 3.6, "vir"),
  S("virDelta", "", "δ Vir", 12.927, 3.398, 3.38, "vir"),

  S("regulus", "軒轅十四", "Regulus", 10.139, 11.967, 1.35, "leo", {
    tag: true,
    blurb: "獅子的心。春天夜空裡，鐮刀彎鉤底端那顆白星就是它。",
  }),
  S("denebola", "五帝座一", "Denebola", 11.818, 14.572, 2.14, "leo", { tag: true }),
  S("algieba", "軒轅十二", "Algieba", 10.333, 19.842, 2.08, "leo", { tag: true }),
  S("zosma", "西上相", "Zosma", 11.235, 20.524, 2.56, "leo"),
  S("chertan", "", "Chertan", 11.237, 15.43, 3.34, "leo"),
  S("rasElased", "軒轅十六", "Ras Elased", 9.764, 23.774, 2.98, "leo"),
  S("rasalas", "", "Rasalas", 9.879, 26.007, 3.88, "leo"),
  S("adhafera", "", "Adhafera", 10.278, 23.417, 3.44, "leo"),
  S("leoEta", "", "η Leo", 10.122, 16.763, 3.49, "leo"),

  S("arcturus", "大角", "Arcturus", 14.261, 19.182, -0.05, "boo", {
    tag: true,
    blurb: "橙黃色，全天第四亮。順著北斗勺把的弧線甩出去，第一顆亮星就是大角。",
  }),
  S("nekkar", "", "Nekkar", 15.032, 40.39, 3.49, "boo"),
  S("seginus", "", "Seginus", 14.535, 38.308, 3.03, "boo"),
  S("booDelta", "", "δ Boo", 15.258, 33.315, 3.46, "boo"),
  S("izar", "", "Izar", 14.749, 27.074, 2.37, "boo"),
  S("booRho", "", "ρ Boo", 14.531, 30.371, 3.58, "boo"),

  S("alphecca", "貫索四", "Alphecca", 15.578, 26.715, 2.23, "crb", { tag: true }),
  S("crbBeta", "", "β CrB", 15.464, 29.106, 3.66, "crb"),
  S("crbGamma", "", "γ CrB", 15.712, 26.295, 3.81, "crb"),
  S("crbEps", "", "ε CrB", 15.96, 26.878, 4.13, "crb"),
  S("crbTheta", "", "θ CrB", 15.543, 31.359, 4.14, "crb"),

  S("herZeta", "", "ζ Her", 16.688, 31.603, 2.81, "her"),
  S("herEta", "", "η Her", 16.715, 38.922, 3.48, "her"),
  S("herPi", "", "π Her", 17.25, 36.809, 3.16, "her"),
  S("herEps", "", "ε Her", 17.005, 30.926, 3.92, "her"),
  S("kornephoros", "", "Kornephoros", 16.503, 21.49, 2.78, "her"),
  S("herDelta", "", "δ Her", 17.25, 24.839, 3.14, "her"),
  S("rasalgethi", "帝座", "Rasalgethi", 17.244, 14.39, 3.1, "her"),

  S("rasalhague", "侯", "Rasalhague", 17.582, 12.56, 2.07, "oph", { tag: true }),
  S("cebalrai", "", "Cebalrai", 17.724, 4.567, 2.76, "oph"),
  S("sabik", "", "Sabik", 17.173, -15.725, 2.43, "oph"),
  S("ophZeta", "", "ζ Oph", 16.62, -10.567, 2.54, "oph"),
  S("yedPrior", "", "Yed Prior", 16.239, -3.694, 2.74, "oph"),
  S("yedPost", "", "Yed Posterior", 16.305, -4.693, 3.24, "oph"),

  S("betelgeuse", "參宿四", "Betelgeuse", 5.9195, 7.407, 0.5, "ori", {
    tag: true,
    blurb: "獵戶的左肩，橘紅色。和藍白的參宿七剛好對角。",
  }),
  S("rigel", "參宿七", "Rigel", 5.2423, -8.202, 0.13, "ori", {
    tag: true,
    blurb: "獵戶的右腳，藍白色，比參宿四更亮。",
  }),
  S("bellatrix", "參宿五", "Bellatrix", 5.4189, 6.35, 1.64, "ori", { tag: true }),
  S("mintaka", "參宿三", "Mintaka", 5.5334, -0.299, 2.23, "ori", { tag: true }),
  S("alnilam", "參宿二", "Alnilam", 5.6036, -1.202, 1.69, "ori", { tag: true }),
  S("alnitak", "參宿一", "Alnitak", 5.6793, -1.943, 1.74, "ori", { tag: true }),
  S("saiph", "參宿六", "Saiph", 5.7959, -9.67, 2.09, "ori", { tag: true }),
  S("meissa", "觜宿一", "Meissa", 5.585, 9.934, 3.39, "ori", { tag: true }),
  S("hatysa", "伐三", "Hatysa", 5.59, -5.91, 2.77, "ori"),

  S("sirius", "天狼", "Sirius", 6.752, -16.716, -1.46, "cma", {
    tag: true,
    blurb: "全天最亮的恆星。沿著獵戶腰帶三星往東南延伸，就會撞上它。",
  }),
  S("mirzam", "軍市一", "Mirzam", 6.378, -17.956, 1.98, "cma"),
  S("wezen", "弧矢一", "Wezen", 7.14, -26.393, 1.84, "cma"),
  S("adhara", "弧矢七", "Adhara", 6.977, -28.972, 1.5, "cma", { tag: true }),
  S("aludra", "弧矢二", "Aludra", 7.401, -29.303, 2.45, "cma"),
  S("muliphein", "", "Muliphein", 7.063, -15.633, 4.11, "cma"),

  S("procyon", "南河三", "Procyon", 7.655, 5.225, 0.34, "cmi", {
    tag: true,
    blurb: "小犬座的亮星。和天狼、參宿四組成冬季大三角。",
  }),
  S("gomeisa", "南河二", "Gomeisa", 7.452, 8.289, 2.89, "cmi"),

  S("castor", "北河二", "Castor", 7.576, 31.888, 1.58, "gem", { tag: true }),
  S("pollux", "北河三", "Pollux", 7.755, 28.026, 1.14, "gem", {
    tag: true,
    blurb: "雙子裡較亮、偏黃的那顆，在北河二的南邊。",
  }),
  S("alhena", "井宿三", "Alhena", 6.628, 16.399, 1.93, "gem", { tag: true }),
  S("tejat", "井宿一", "Tejat", 6.383, 22.514, 2.87, "gem"),
  S("mebsuta", "井宿五", "Mebsuta", 6.732, 25.131, 3.06, "gem"),
  S("wasat", "", "Wasat", 7.335, 21.982, 3.53, "gem"),

  S("aldebaran", "畢宿五", "Aldebaran", 4.598, 16.509, 0.85, "tau", {
    tag: true,
    blurb: "金牛的紅眼，躺在畢宿星團的 V 字尖端。往西不遠處就是昴宿星團。",
  }),
  S("elnath", "五車五", "Elnath", 5.438, 28.608, 1.65, "tau", { tag: true }),
  S("tauGamma", "", "γ Tau", 4.33, 15.628, 3.65, "tau"),
  S("tauDelta", "", "δ Tau", 4.382, 17.543, 3.77, "tau"),
  S("ain", "", "Ain", 4.477, 19.181, 3.53, "tau"),
  S("tauZeta", "天關", "ζ Tau", 5.627, 21.143, 2.97, "tau"),
  S("alcyone", "昴宿六", "Alcyone", 3.791, 24.105, 2.87, "tau", { tag: true }),
  S("atlas", "", "Atlas", 3.819, 24.053, 3.63, "tau"),
  S("electra", "", "Electra", 3.748, 24.113, 3.7, "tau"),
  S("maia", "", "Maia", 3.763, 24.368, 3.87, "tau"),
  S("merope", "", "Merope", 3.772, 23.948, 4.18, "tau"),

  S("capella", "五車二", "Capella", 5.278, 45.998, 0.08, "aur", {
    tag: true,
    blurb: "御夫座的黃白亮星，冬天高掛北方。和五車五等星圍成一個五邊形。",
  }),
  S("menkalinan", "五車三", "Menkalinan", 5.992, 44.947, 1.9, "aur", { tag: true }),
  S("aurTheta", "五車四", "θ Aur", 5.995, 37.213, 2.62, "aur"),
  S("hassaleh", "五車一", "Hassaleh", 4.95, 33.166, 2.69, "aur"),
  S("almaaz", "", "Almaaz", 5.033, 43.823, 3.0, "aur"),

  S("mirfak", "天船三", "Mirfak", 3.405, 49.861, 1.79, "per", { tag: true }),
  S("algol", "大陵五", "Algol", 3.136, 40.956, 2.12, "per", {
    tag: true,
    blurb: "會變暗的星。大約三天暗一次，肉眼就能看出它變得沒那麼亮。",
  }),
  S("perGamma", "", "γ Per", 3.08, 53.507, 2.93, "per"),
  S("perDelta", "", "δ Per", 3.715, 47.788, 3.01, "per"),
  S("perEps", "", "ε Per", 3.965, 40.011, 2.89, "per"),
  S("perZeta", "", "ζ Per", 3.902, 31.883, 2.85, "per"),

  S("alpheratz", "壁宿二", "Alpheratz", 0.14, 29.091, 2.06, "and", { tag: true }),
  S("mirach", "奎宿九", "Mirach", 1.162, 35.621, 2.05, "and", {
    tag: true,
    blurb: "仙女座的腰。從它再往上一點，暗空裡可以找到仙女座星系那小片霧光。",
  }),
  S("almach", "天大將軍一", "Almach", 2.065, 42.33, 2.1, "and", { tag: true }),
  S("andDelta", "", "δ And", 0.655, 30.861, 3.27, "and"),

  S("markab", "室宿一", "Markab", 23.079, 15.205, 2.49, "peg", { tag: true }),
  S("scheat", "室宿二", "Scheat", 23.063, 28.082, 2.42, "peg", { tag: true }),
  S("algenib", "壁宿一", "Algenib", 0.22, 15.184, 2.83, "peg", { tag: true }),
  S("enif", "危宿", "Enif", 21.736, 9.875, 2.38, "peg"),

  S("hamal", "婁宿三", "Hamal", 2.119, 23.462, 2.0, "ari", { tag: true }),
  S("sheratan", "婁宿一", "Sheratan", 1.911, 20.808, 2.64, "ari"),
  S("mesarthim", "", "Mesarthim", 1.891, 19.294, 3.9, "ari"),

  S("diphda", "土司空", "Diphda", 0.726, -17.987, 2.04, "cet", { tag: true }),
  S("menkar", "天囷一", "Menkar", 3.038, 4.09, 2.53, "cet"),
  S("cetGamma", "", "γ Cet", 2.722, 3.236, 3.47, "cet"),

  S("sadalmelik", "危宿一", "Sadalmelik", 22.096, -0.32, 2.94, "aqr"),
  S("sadalsuud", "虛宿一", "Sadalsuud", 21.526, -5.571, 2.87, "aqr"),
  S("skat", "", "Skat", 22.877, -15.821, 3.27, "aqr"),

  S("denebAlgedi", "壘壁陣四", "Deneb Algedi", 21.784, -16.127, 2.85, "cap"),
  S("dabih", "牛宿一", "Dabih", 20.35, -14.781, 3.05, "cap"),
  S("algiedi", "牛宿二", "Algedi", 20.3, -12.509, 3.57, "cap"),

  S("gienah", "", "Gienah", 12.263, -17.542, 2.59, "crv"),
  S("kraz", "", "Kraz", 12.573, -23.397, 2.65, "crv"),
  S("algorab", "", "Algorab", 12.497, -16.515, 2.94, "crv"),
  S("minkar", "", "Minkar", 12.168, -22.62, 3.02, "crv"),

  S("acrux", "十字架二", "Acrux", 12.443, -63.099, 0.77, "cru", { tag: true }),
  S("mimosa", "十字架三", "Mimosa", 12.795, -59.689, 1.25, "cru", { tag: true }),
  S("gacrux", "十字架一", "Gacrux", 12.519, -57.113, 1.63, "cru", { tag: true }),
  S("cruDelta", "十字架四", "δ Cru", 12.252, -58.749, 2.79, "cru"),

  S("rigil", "南門二", "Rigil Kentaurus", 14.66, -60.834, -0.01, "cen", { tag: true }),
  S("hadar", "馬腹一", "Hadar", 14.064, -60.373, 0.61, "cen", { tag: true }),
  S("menkent", "庫樓三", "Menkent", 14.111, -36.37, 2.06, "cen"),

  S("arneb", "廁一", "Arneb", 5.545, -17.822, 2.58, "lep"),
  S("nihal", "廁二", "Nihal", 5.469, -20.759, 2.84, "lep"),

  S("canopus", "老人", "Canopus", 6.399, -52.696, -0.74, "car", {
    tag: true,
    blurb: "全天第二亮。在武陵只會貼著南方地平，冬天晴夜才容易看到。",
  }),
  S("achernar", "水委一", "Achernar", 1.628, -57.237, 0.46, "eri", {
    tag: true,
    blurb: "很南的亮星。武陵能看到時，它幾乎貼著南邊地平線。",
  }),
  S("suhail", "天記", "Suhail", 9.133, -43.432, 2.21, "vel"),
  S("regor", "", "Regor", 8.159, -47.337, 1.83, "vel"),
  S("naos", "", "Naos", 8.06, -40.003, 2.21, "pup"),
  S("fomalhaut", "北落師門", "Fomalhaut", 22.961, -29.622, 1.16, "psa", {
    tag: true,
    blurb: "秋天南方孤獨的亮星。周圍沒什麼亮星陪它，所以很好認。",
  }),
  S("alphard", "星宿一", "Alphard", 9.46, -8.658, 1.99, "hya", {
    tag: true,
    blurb: "長蛇的心，春天南方孤零零的一顆紅星，附近沒有別的亮星。",
  }),
];

export const STAR_BY_ID: Record<string, Star> = Object.fromEntries(STARS.map((s) => [s.id, s]));

export const CONSTELLATIONS: Constellation[] = [
  {
    id: "umi",
    name: "小熊座",
    short: "小熊",
    about: "斗勺裡最亮的是帝星，把柄盡頭就是北極星。",
    lines: [
      ["polaris", "yildun"],
      ["yildun", "umiEps"],
      ["umiEps", "umiZeta"],
      ["umiZeta", "kochab"],
      ["kochab", "pherkad"],
      ["pherkad", "umiEta"],
      ["umiEta", "umiZeta"],
    ],
  },
  {
    id: "uma",
    name: "大熊座",
    short: "北斗",
    about: "北斗七星。勺口兩星連出去，大約五倍遠就是北極星。",
    lines: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
  },
  {
    id: "cas",
    name: "仙后座",
    short: "仙后",
    about: "一個 W 或 M，和北斗隔著北極星對望。",
    lines: [
      ["caph", "schedar"],
      ["schedar", "cassGamma"],
      ["cassGamma", "ruchbah"],
      ["ruchbah", "segin"],
    ],
  },
  {
    id: "cep",
    name: "仙王座",
    short: "仙王",
    about: "仙后旁邊的房子形，靠近北極，台灣一整年都看得到。",
    lines: [
      ["alderamin", "alfirk"],
      ["alfirk", "errai"],
      ["errai", "cepIota"],
      ["cepIota", "cepZeta"],
      ["cepZeta", "alderamin"],
    ],
  },
  {
    id: "dra",
    name: "天龍座",
    short: "天龍",
    about: "繞著小熊的一長串。龍頭在織女附近，是一個小四邊形缺一邊。",
    lines: [
      ["rastaban", "eltanin"],
      ["eltanin", "grumium"],
      ["grumium", "rastaban"],
      ["eltanin", "draEta"],
      ["draEta", "draZeta"],
      ["draZeta", "altais"],
      ["draEta", "draIota"],
      ["draIota", "thuban"],
    ],
  },
  {
    id: "lyr",
    name: "天琴座",
    short: "天琴",
    about: "織女和身旁一個小平行四邊形。夏天天頂附近最好認。",
    lines: [
      ["vega", "lyrZeta"],
      ["lyrZeta", "sheliak"],
      ["sheliak", "sulafat"],
      ["sulafat", "lyrDelta"],
      ["lyrDelta", "lyrZeta"],
    ],
  },
  {
    id: "cyg",
    name: "天鵝座",
    short: "天鵝",
    about: "北十字。天津四在頂端，沿著銀河。十字中心是天津一。",
    lines: [
      ["deneb", "sadr"],
      ["sadr", "albireo"],
      ["fawaris", "sadr"],
      ["sadr", "aljanah"],
    ],
  },
  {
    id: "aql",
    name: "天鷹座",
    short: "天鷹",
    about: "牛郎星和左右兩顆組成一根扁擔，很好認。",
    lines: [
      ["tarazed", "altair"],
      ["altair", "alshain"],
      ["aqlDelta", "altair"],
      ["altair", "aqlTheta"],
    ],
  },
  {
    id: "sco",
    name: "天蠍座",
    short: "天蠍",
    about: "夏天南方的大彎鉤。紅星心宿二是心臟，尾巴勾向地平。",
    lines: [
      ["acrab", "dschubba"],
      ["dschubba", "scoPi"],
      ["scoPi", "alniyat"],
      ["alniyat", "antares"],
      ["antares", "scoTau"],
      ["scoTau", "scoEps"],
      ["scoEps", "scoMu"],
      ["scoMu", "scoZeta"],
      ["scoZeta", "scoEta"],
      ["scoEta", "sargas"],
      ["sargas", "scoIota"],
      ["scoIota", "scoKappa"],
      ["scoKappa", "shaula"],
      ["shaula", "lesath"],
    ],
  },
  {
    id: "sgr",
    name: "人馬座",
    short: "茶壺",
    about: "夏天南方的茶壺。銀河最濃的一段，就像從壺嘴冒出來的熱氣。",
    lines: [
      ["alnasl", "kausAus"],
      ["alnasl", "kausMed"],
      ["kausMed", "kausAus"],
      ["kausMed", "kausBor"],
      ["kausBor", "sgrPhi"],
      ["sgrPhi", "kausMed"],
      ["sgrPhi", "nunki"],
      ["nunki", "sgrTau"],
      ["sgrTau", "ascella"],
      ["ascella", "kausAus"],
    ],
  },
  {
    id: "lib",
    name: "天秤座",
    short: "天秤",
    about: "天蠍西邊的秤。氐宿四略帶綠色，是少數肉眼能感到顏色的星。",
    lines: [
      ["zubenEl", "zubenEs"],
      ["zubenEl", "libGamma"],
      ["zubenEl", "libSigma"],
    ],
  },
  {
    id: "vir",
    name: "室女座",
    short: "室女",
    about: "角宿一很亮，往上拉開一個 Y 字。春天的南天主角之一。",
    lines: [
      ["spica", "porrima"],
      ["porrima", "virDelta"],
      ["virDelta", "vindemiatrix"],
      ["porrima", "zavijava"],
    ],
  },
  {
    id: "leo",
    name: "獅子座",
    short: "獅子",
    about: "問號形的鐮刀加上屁股的三角形。軒轅十四是獅子的心臟。",
    lines: [
      ["rasElased", "rasalas"],
      ["rasalas", "adhafera"],
      ["adhafera", "algieba"],
      ["algieba", "leoEta"],
      ["leoEta", "regulus"],
      ["algieba", "zosma"],
      ["zosma", "denebola"],
      ["denebola", "chertan"],
      ["chertan", "zosma"],
    ],
  },
  {
    id: "boo",
    name: "牧夫座",
    short: "牧夫",
    about: "大角底下的風箏。橙色的大角是最好的入口。",
    lines: [
      ["arcturus", "izar"],
      ["izar", "booDelta"],
      ["booDelta", "nekkar"],
      ["nekkar", "seginus"],
      ["seginus", "booRho"],
      ["booRho", "izar"],
    ],
  },
  {
    id: "crb",
    name: "北冕座",
    short: "北冕",
    about: "大角和武仙之間的一小圈皇冠，貫索四是冠上的寶石。",
    lines: [
      ["crbTheta", "crbBeta"],
      ["crbBeta", "alphecca"],
      ["alphecca", "crbGamma"],
      ["crbGamma", "crbEps"],
    ],
  },
  {
    id: "her",
    name: "武仙座",
    short: "武仙",
    about: "夏天織女西邊的四方石。本身不亮，先找到夏季大三角再往西找。",
    lines: [
      ["herZeta", "herEta"],
      ["herEta", "herPi"],
      ["herPi", "herEps"],
      ["herEps", "herZeta"],
      ["herZeta", "kornephoros"],
      ["herEps", "herDelta"],
      ["herDelta", "rasalgethi"],
    ],
  },
  {
    id: "oph",
    name: "蛇夫座",
    short: "蛇夫",
    about: "天蠍北邊、武仙南邊的一片。侯星在頭頂，是這座裡最亮的。",
    lines: [
      ["yedPrior", "yedPost"],
      ["yedPrior", "rasalhague"],
      ["rasalhague", "cebalrai"],
      ["rasalhague", "ophZeta"],
      ["ophZeta", "sabik"],
    ],
  },
  {
    id: "ori",
    name: "獵戶座",
    short: "獵戶",
    about: "冬天的主角。先找腰帶三顆排成一直線的星，肩膀和腳就出來了。",
    lines: [
      ["bellatrix", "meissa"],
      ["meissa", "betelgeuse"],
      ["bellatrix", "mintaka"],
      ["mintaka", "alnilam"],
      ["alnilam", "alnitak"],
      ["alnitak", "betelgeuse"],
      ["mintaka", "rigel"],
      ["alnitak", "saiph"],
      ["alnilam", "hatysa"],
    ],
  },
  {
    id: "cma",
    name: "大犬座",
    short: "大犬",
    about: "天狼星所在。腰帶往東南一指就是它，再往下是弧矢諸星。",
    lines: [
      ["mirzam", "sirius"],
      ["sirius", "muliphein"],
      ["muliphein", "wezen"],
      ["wezen", "adhara"],
      ["adhara", "aludra"],
      ["aludra", "wezen"],
    ],
  },
  {
    id: "cmi",
    name: "小犬座",
    short: "小犬",
    about: "幾乎就是南河三和旁邊較暗的南河二，兩顆星一條線。",
    lines: [["procyon", "gomeisa"]],
  },
  {
    id: "gem",
    name: "雙子座",
    short: "雙子",
    about: "北河二、北河三是兩顆頭，身子拉向獵戶北邊。",
    lines: [
      ["castor", "pollux"],
      ["castor", "mebsuta"],
      ["mebsuta", "tejat"],
      ["pollux", "wasat"],
      ["wasat", "alhena"],
    ],
  },
  {
    id: "tau",
    name: "金牛座",
    short: "金牛",
    about: "畢宿五的 V 字，西邊一小團是昴宿。牛角伸向五車五。",
    lines: [
      ["tauGamma", "aldebaran"],
      ["tauDelta", "aldebaran"],
      ["aldebaran", "ain"],
      ["ain", "elnath"],
      ["aldebaran", "tauZeta"],
    ],
  },
  {
    id: "aur",
    name: "御夫座",
    short: "御夫",
    about: "五車二領頭的五邊形，冬天高掛在獵戶的北邊。",
    lines: [
      ["capella", "menkalinan"],
      ["menkalinan", "aurTheta"],
      ["aurTheta", "elnath"],
      ["elnath", "hassaleh"],
      ["hassaleh", "almaaz"],
      ["almaaz", "capella"],
    ],
  },
  {
    id: "per",
    name: "英仙座",
    short: "英仙",
    about: "仙后和御夫之間的一串。大陵五會週期性變暗。",
    lines: [
      ["perGamma", "mirfak"],
      ["mirfak", "perDelta"],
      ["perDelta", "perEps"],
      ["perEps", "perZeta"],
      ["mirfak", "algol"],
    ],
  },
  {
    id: "and",
    name: "仙女座",
    short: "仙女",
    about: "從飛馬大方塊的一角拉出一條線。奎宿九附近有仙女座星系。",
    lines: [
      ["alpheratz", "andDelta"],
      ["andDelta", "mirach"],
      ["mirach", "almach"],
    ],
  },
  {
    id: "peg",
    name: "飛馬座",
    short: "飛馬",
    about: "秋天的大方塊。四顆差不多亮的星，很好用來認附近的星座。",
    lines: [
      ["markab", "scheat"],
      ["scheat", "alpheratz"],
      ["alpheratz", "algenib"],
      ["algenib", "markab"],
      ["markab", "enif"],
    ],
  },
  {
    id: "ari",
    name: "白羊座",
    short: "白羊",
    about: "飛馬東邊一小拐，婁宿三最亮。",
    lines: [
      ["hamal", "sheratan"],
      ["sheratan", "mesarthim"],
    ],
  },
  {
    id: "cet",
    name: "鯨魚座",
    short: "鯨魚",
    about: "秋天南方一大片。土司空在尾巴，天囷一在頭。",
    lines: [["menkar", "cetGamma"]],
  },
  {
    id: "aqr",
    name: "寶瓶座",
    short: "寶瓶",
    about: "秋天南天，星都不太亮。北落師門在它南邊，亮很多。",
    lines: [
      ["sadalsuud", "sadalmelik"],
      ["sadalmelik", "skat"],
    ],
  },
  {
    id: "cap",
    name: "摩羯座",
    short: "摩羯",
    about: "夏天末、秋天初的南天，像一張淺淺的笑臉。",
    lines: [
      ["algiedi", "dabih"],
      ["dabih", "denebAlgedi"],
    ],
  },
  {
    id: "crv",
    name: "烏鴉座",
    short: "烏鴉",
    about: "春天角宿一東南邊的小四邊形，像一面帆。",
    lines: [
      ["algorab", "gienah"],
      ["gienah", "minkar"],
      ["minkar", "kraz"],
      ["kraz", "algorab"],
    ],
  },
  {
    id: "cru",
    name: "南十字",
    short: "南十字",
    about: "在武陵只會貼著南方地平線露一小段，春季晴夜才有機會。",
    lines: [
      ["acrux", "gacrux"],
      ["mimosa", "cruDelta"],
    ],
  },
  {
    id: "cen",
    name: "半人馬座",
    short: "半人馬",
    about: "南門二是離太陽最近的恆星系統，在武陵幾乎貼地。",
    lines: [["rigil", "hadar"]],
  },
  {
    id: "lep",
    name: "天兔座",
    short: "天兔",
    about: "蹲在獵戶腳下的小兔子，兩顆較亮的星。",
    lines: [["arneb", "nihal"]],
  },
  {
    id: "car",
    name: "船底座",
    short: "船底",
    about: "老人星在南邊很低的地方，是全天第二亮。",
    lines: [],
  },
  {
    id: "eri",
    name: "波江座",
    short: "波江",
    about: "從獵戶腳邊彎向南方的長河，盡頭的水委一很亮但很低。",
    lines: [],
  },
  {
    id: "vel",
    name: "船帆座",
    short: "船帆",
    about: "冬天南方地平上的幾顆亮星，古船阿爾戈號的帆。",
    lines: [],
  },
  {
    id: "pup",
    name: "船尾座",
    short: "船尾",
    about: "大犬座東南方，天狼往地平去的路上。",
    lines: [],
  },
  {
    id: "psa",
    name: "南魚座",
    short: "南魚",
    about: "幾乎就是北落師門這一顆，秋天南方很好認。",
    lines: [],
  },
  {
    id: "hya",
    name: "長蛇座",
    short: "長蛇",
    about: "星宿一孤零零地待在春天的南天。",
    lines: [],
  },
];

export const CON_BY_ID: Record<string, Constellation> = Object.fromEntries(
  CONSTELLATIONS.map((c) => [c.id, c]),
);

export const ASTERISMS: { id: string; name: string; ids: string[] }[] = [
  { id: "summer", name: "夏季大三角", ids: ["vega", "altair", "deneb", "vega"] },
  { id: "winter3", name: "冬季大三角", ids: ["betelgeuse", "sirius", "procyon", "betelgeuse"] },
  {
    id: "winter6",
    name: "冬季六邊形",
    ids: ["rigel", "aldebaran", "capella", "pollux", "procyon", "sirius", "rigel"],
  },
];

export const DEEP_SKY: DeepSky[] = [
  {
    id: "m45",
    name: "昴宿星團",
    en: "Pleiades",
    ra: 3.79,
    dec: 24.12,
    blurb: "七姊妹。肉眼看是一小團霧光，武陵的暗空裡可以數出六七顆。",
  },
  {
    id: "m42",
    name: "獵戶星雲",
    en: "Orion Nebula",
    ra: 5.588,
    dec: -5.39,
    blurb: "腰帶中星正下方的淡光。冬天用眼睛就能感覺到那裡不太一樣。",
  },
  {
    id: "m31",
    name: "仙女座星系",
    en: "Andromeda",
    ra: 0.712,
    dec: 41.27,
    blurb: "從奎宿九往北一點。暗空裡是一小片橢圓的霧，那是另一個星系。",
  },
  {
    id: "m44",
    name: "鬼宿星團",
    en: "Beehive",
    ra: 8.668,
    dec: 19.67,
    blurb: "巨蟹座中間的蜂巢。春天夜空，用眼睛餘光看會比盯著看更清楚。",
  },
];

export const WARM = new Set(["betelgeuse", "antares", "aldebaran", "arcturus", "pollux", "alphard"]);
export const HOT = new Set([
  "sirius",
  "vega",
  "rigel",
  "spica",
  "regulus",
  "canopus",
  "achernar",
]);
