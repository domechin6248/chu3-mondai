(function () {
  'use strict';
  const { rand, nz, pick, make, fromList, dec, round } = Q;
  // ずらした値が 0 以下ならダミーに使わない
  const pos = (x, fmt) => (round(x) > 0 ? fmt(round(x)) : null);

  function genOhm() {
    const R = rand(1, 100);
    const I = rand(1, 50) / 10;
    const V = round(R * I);
    const mode = rand(0, 2);
    const expl = 'オームの法則：電圧 V = 抵抗 R × 電流 I';
    if (mode === 0) {
      return make({
        category: '電流と電圧',
        question: `${R}Ω の抵抗器に ${I}A の電流が流れているとき、抵抗器に加わる電圧は何Vか。`,
        answer: `${dec(V)} V`,
        distractors: [`${dec(R / I)} V`, `${dec(I / R)} V`, `${dec(V * 10)} V`, `${dec(R + I)} V`],
        fallback: () => pos(V + nz(-5, 5), (x) => `${dec(x)} V`),
        explanation: `${expl}\n${R} × ${I} = ${dec(V)} V`,
      });
    }
    if (mode === 1) {
      const useMA = I < 1 && Math.random() < 0.5;
      const ans = useMA ? `${dec(I * 1000)} mA` : `${dec(I)} A`;
      const unit = useMA ? (x) => `${dec(x * 1000)} mA` : (x) => `${dec(x)} A`;
      return make({
        category: '電流と電圧',
        question: `${R}Ω の抵抗器に ${dec(V)}V の電圧を加えたとき、流れる電流は何${useMA ? 'mA' : 'A'}か。`,
        answer: ans,
        distractors: [unit(V * R), unit(R / V), unit(I * 10), unit(I / 10)],
        fallback: () => pos(I + nz(-9, 9) / 10, unit),
        explanation: `${expl} より I = V ÷ R\n${dec(V)} ÷ ${R} = ${dec(I)} A${useMA ? `（= ${dec(I * 1000)} mA）` : ''}`,
      });
    }
    return make({
      category: '電流と電圧',
      question: `ある抵抗器に ${dec(V)}V の電圧を加えると ${I}A の電流が流れた。この抵抗器の抵抗は何Ωか。`,
      answer: `${R} Ω`,
      distractors: [`${dec(V * I)} Ω`, `${dec(I / V)} Ω`, `${R * 2} Ω`, `${dec(R / 2)} Ω`],
      fallback: () => pos(R + nz(-5, 5), (x) => `${x} Ω`),
      explanation: `${expl} より R = V ÷ I\n${dec(V)} ÷ ${I} = ${R} Ω`,
    });
  }

  function genSeries() {
    const R1 = rand(1, 80);
    let R2 = rand(1, 80);
    while (R2 === R1) R2 = rand(1, 80);
    const I = rand(1, 30) / 10;
    const V = round(I * (R1 + R2));
    const mode = rand(0, 2);
    const head = `${R1}Ω の抵抗器Aと ${R2}Ω の抵抗器Bを直列につなぎ、電源の電圧を ${dec(V)}V にした。`;
    if (mode === 0) {
      return make({
        category: '直列回路',
        question: `${head}回路に流れる電流は何Aか。`,
        answer: `${dec(I)} A`,
        distractors: [`${dec(V / R1)} A`, `${dec(V / R2)} A`, `${dec(V / R1 + V / R2)} A`, `${dec(I * 2)} A`],
        fallback: () => pos(I + nz(-5, 5) / 10, (x) => `${dec(x)} A`),
        explanation: `直列回路の全体の抵抗 = ${R1} + ${R2} = ${R1 + R2}Ω\n電流 = ${dec(V)} ÷ ${R1 + R2} = ${dec(I)} A`,
      });
    }
    const [name, R, other] = mode === 1 ? ['A', R1, R2] : ['B', R2, R1];
    return make({
      category: '直列回路',
      question: `${head}抵抗器${name}に加わる電圧は何Vか。`,
      answer: `${dec(I * R)} V`,
      distractors: [`${dec(I * other)} V`, `${dec(V)} V`, `${dec(V / 2)} V`, `${dec(I * R + 1)} V`],
      fallback: () => pos(I * R + nz(-9, 9), (x) => `${dec(x)} V`),
      explanation: `直列回路では電流はどこも同じ。電流 = ${dec(V)} ÷ (${R1} + ${R2}) = ${dec(I)} A\n抵抗器${name}の電圧 = ${dec(I)} × ${R} = ${dec(I * R)} V`,
    });
  }

  function genParallel() {
    const list = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 25, 30, 40, 50, 60];
    let R1, R2, V;
    do {
      R1 = pick(list); R2 = pick(list); V = rand(1, 60);
    } while (R1 === R2 || !Number.isInteger((V * 100) / R1) || !Number.isInteger((V * 100) / R2));
    const I1 = V / R1;
    const I2 = V / R2;
    const head = `${R1}Ω の抵抗器Aと ${R2}Ω の抵抗器Bを並列につなぎ、電源の電圧を ${V}V にした。`;
    if (Math.random() < 0.5) {
      return make({
        category: '並列回路',
        question: `${head}回路全体に流れる電流は何Aか。`,
        answer: `${dec(I1 + I2)} A`,
        distractors: [`${dec(V / (R1 + R2))} A`, `${dec(I1)} A`, `${dec(I2)} A`, `${dec((I1 + I2) * 2)} A`],
        fallback: () => pos(I1 + I2 + nz(-9, 9) / 10, (x) => `${dec(x)} A`),
        explanation: `並列回路では、それぞれの抵抗器に電源と同じ ${V}V が加わる。\nAに ${V}÷${R1} = ${dec(I1)} A、Bに ${V}÷${R2} = ${dec(I2)} A\n全体 = ${dec(I1)} + ${dec(I2)} = ${dec(I1 + I2)} A`,
      });
    }
    return make({
      category: '並列回路',
      question: `${head}抵抗器Aに流れる電流は何Aか。`,
      answer: `${dec(I1)} A`,
      distractors: [`${dec(I2)} A`, `${dec(I1 + I2)} A`, `${dec(V / (R1 + R2))} A`, `${dec(I1 * 2)} A`],
      fallback: () => pos(I1 + nz(-9, 9) / 10, (x) => `${dec(x)} A`),
      explanation: `並列回路では、抵抗器Aにも電源と同じ ${V}V が加わる。\n${V} ÷ ${R1} = ${dec(I1)} A`,
    });
  }

  function genBuoyancy() {
    const W = rand(5, 100) / 10;
    const w = rand(1, Math.round(W * 10) - 1) / 10;
    const F = round(W - w, 1);
    return make({
      category: '浮力',
      question: `ばねばかりにつるした物体の重さは、空気中で ${dec(W)}N、水中に全体を沈めると ${dec(w)}N だった。この物体にはたらく浮力は何Nか。`,
      answer: `${dec(F)} N`,
      distractors: [`${dec(W + w)} N`, `${dec(w)} N`, `${dec(W)} N`, `${dec(F + 0.5)} N`],
      fallback: () => pos(F + nz(-9, 9) / 10, (x) => `${dec(x)} N`),
      explanation: `浮力 = 空気中での重さ − 水中での重さ\n${dec(W)} − ${dec(w)} = ${dec(F)} N`,
    });
  }

  function genPulley() {
    const kg = rand(1, 60);
    const h = rand(1, 20) / 2;
    const F = kg * 10;
    if (Math.random() < 0.5) {
      return make({
        category: '仕事と道具',
        question: `質量 ${kg}kg の物体を動滑車を使って ${dec(h)}m 持ち上げる。ひもを引く力は何Nか。\n（100g の物体にはたらく重力を 1N とし、動滑車とひもの質量は考えない）`,
        answer: `${dec(F / 2)} N`,
        distractors: [`${F} N`, `${F * 2} N`, `${dec(F / 4)} N`, `${kg} N`],
        explanation: `物体にはたらく重力は ${F}N。動滑車を使うと、ひもを引く力は半分になる。\n${F} ÷ 2 = ${dec(F / 2)} N`,
      });
    }
    return make({
      category: '仕事と道具',
      question: `質量 ${kg}kg の物体を動滑車を使って ${dec(h)}m 持ち上げる。ひもを引く距離は何mか。\n（動滑車とひもの質量は考えない）`,
      answer: `${dec(h * 2)} m`,
      distractors: [`${dec(h)} m`, `${dec(h / 2)} m`, `${dec(h * 4)} m`, `${dec(h + 1)} m`],
      explanation: `動滑車を使うと力は半分になるが、ひもを引く距離は2倍になる（仕事の原理）。\n${dec(h)} × 2 = ${dec(h * 2)} m`,
    });
  }

  function genHeat() {
    const m = rand(5, 50) * 10;
    const t = rand(1, 50);
    const Qj = round(4.2 * m * t, 1);
    return make({
      category: '熱量',
      question: `水 ${m}g の温度を ${t}℃ 上げるのに必要な熱量は何Jか。\n（水1gの温度を1℃上げるのに必要な熱量を 4.2J とする）`,
      answer: `${dec(Qj)} J`,
      distractors: [`${m * t} J`, `${dec(4.2 * m)} J`, `${dec(Qj * 10)} J`, `${dec((m * t) / 4.2, 1)} J`],
      explanation: `熱量 = 4.2 × 水の質量 × 上昇温度\n4.2 × ${m} × ${t} = ${dec(Qj)} J`,
    });
  }

  function genNeutral() {
    const A = rand(2, 20);
    let B = rand(2, 20);
    while (B === A) B = rand(2, 20);
    const g = Q.gcd(A, B);
    const k = rand(2, 12);
    const X = (A / g) * k;
    const Y = (B / g) * k;
    return make({
      category: '中和',
      question: `うすい塩酸 ${A}cm³ に、うすい水酸化ナトリウム水溶液を ${B}cm³ 加えると、ちょうど中性になった。同じ塩酸 ${X}cm³ をちょうど中性にするには、同じ水酸化ナトリウム水溶液が何cm³ 必要か。`,
      answer: `${Y} cm³`,
      distractors: [`${dec((X * A) / B, 1)} cm³`, `${X} cm³`, `${Y + B} cm³`, `${Y * 2} cm³`],
      fallback: () => pos(Y + nz(-6, 6), (x) => `${x} cm³`),
      explanation: `塩酸 : 水酸化ナトリウム水溶液 = ${A} : ${B} で中和する。\n${A} : ${B} = ${X} : x より x = ${Y} cm³`,
    });
  }

  function genSpeed() {
    if (Math.random() < 0.5) {
      const t = pick([0.1, 0.2, 0.4, 0.5, 1, 2, 4, 5]);
      const v = rand(1, 300) / 2;
      const d = round(v * t, 2);
      return make({
        category: '運動',
        question: `台車が ${dec(t)}秒間に ${dec(d)}cm 移動した。この間の平均の速さは何cm/sか。`,
        answer: `${dec(v)} cm/s`,
        distractors: [`${dec(d * t)} cm/s`, `${dec(t / d, 3)} cm/s`, `${dec(v * 2)} cm/s`, `${dec(v / 10)} cm/s`],
        fallback: () => pos(v + nz(-9, 9), (x) => `${dec(x)} cm/s`),
        explanation: `平均の速さ = 移動距離 ÷ かかった時間\n${dec(d)} ÷ ${dec(t)} = ${dec(v)} cm/s`,
      });
    }
    const x = rand(5, 200) / 10;
    return make({
      category: '運動',
      question: `1秒間に60回打点する記録タイマーで台車の運動を記録した。6打点ごとに切ったテープの長さが ${dec(x)}cm のとき、この区間の平均の速さは何cm/sか。`,
      answer: `${dec(x * 10)} cm/s`,
      distractors: [`${dec(x * 6)} cm/s`, `${dec(x * 60)} cm/s`, `${dec(x)} cm/s`, `${dec(x / 6, 2)} cm/s`],
      explanation: `6打点にかかる時間は 6 ÷ 60 = 0.1秒。\n${dec(x)} ÷ 0.1 = ${dec(x * 10)} cm/s`,
    });
  }

  function genThunder() {
    const t = rand(2, 60) / 2;
    const d = round(340 * t);
    return make({
      category: '音',
      question: `雷が光ってから ${dec(t)}秒後に音が聞こえた。雷までの距離は約何mか。（音の速さを秒速340mとする）`,
      answer: `約 ${d} m`,
      distractors: [`約 ${dec(340 / t, 1)} m`, `約 ${d * 2} m`, `約 ${dec(d / 2)} m`, `約 ${d + 340} m`],
      fallback: () => pos(d + 170 * nz(-3, 3), (x) => `約 ${x} m`),
      explanation: `距離 = 音の速さ × 時間\n340 × ${dec(t)} = ${d} m`,
    });
  }

  function genPower() {
    const P = pick([20, 40, 60, 100, 500, 600, 800, 1000, 1200]);
    if (Math.random() < 0.5) {
      return make({
        category: '電力・電力量',
        question: `100V の電源につなぐと ${P}W の電力を消費する電気器具がある。流れる電流は何Aか。`,
        answer: `${dec(P / 100)} A`,
        distractors: [`${dec(P * 100)} A`, `${dec(100 / P)} A`, `${dec(P / 10)} A`, `${P} A`],
        explanation: `電力 P = 電圧 V × 電流 I より I = P ÷ V\n${P} ÷ 100 = ${dec(P / 100)} A`,
      });
    }
    const t = pick([1, 2, 3, 5, 10]);
    const J = P * t * 60;
    return make({
      category: '電力・電力量',
      question: `${P}W の電気器具を ${t}分間使用したときの電力量は何Jか。`,
      answer: `${J} J`,
      distractors: [`${P * t} J`, `${P * t * 3600} J`, `${dec(P / t)} J`, `${J / 10} J`],
      explanation: `電力量 [J] = 電力 [W] × 時間 [秒]\n${P} × ${t * 60} = ${J} J`,
    });
  }

  function genDensity() {
    const d = pick([0.8, 0.9, 1.0, 1.3, 2.7, 7.9, 8.9, 10.5, 11.3, 19.3]);
    const V = rand(2, 100);
    const m = round(d * V, 1);
    return make({
      category: '密度',
      question: `質量 ${dec(m)}g、体積 ${V}cm³ の物質の密度は何 g/cm³ か。`,
      answer: `${dec(d)} g/cm³`,
      distractors: [`${dec(V / m, 2)} g/cm³`, `${dec(m * V)} g/cm³`, `${dec(d * 10)} g/cm³`, `${dec(m + V)} g/cm³`],
      fallback: () => `${dec(pick([0.5, 0.8, 0.9, 1.0, 1.3, 2.0, 2.7, 7.9, 8.9, 11.3]))} g/cm³`,
      explanation: `密度 = 質量 ÷ 体積\n${dec(m)} ÷ ${V} = ${dec(d)} g/cm³`,
    });
  }

  function genPressure() {
    let mass, w, h, P;
    do {
      mass = pick([0.5, 1, 1.2, 2, 2.4, 3, 4, 6]);
      w = pick([5, 10, 20, 25, 40, 50]);
      h = pick([5, 10, 20, 25, 40, 50]);
      P = (mass * 10) / ((w * h) / 10000);
    } while (!Number.isInteger(round(P, 6)));
    P = round(P, 6);
    const F = round(mass * 10);
    return make({
      category: '圧力',
      question: `質量 ${dec(mass * 1000)}g の直方体を、${w}cm × ${h}cm の面を下にして水平な床に置いた。床が受ける圧力は何Paか。\n（100g の物体にはたらく重力の大きさを 1N とする）`,
      answer: `${P} Pa`,
      distractors: [`${dec(F / (w * h), 4)} Pa`, `${P * 10} Pa`, `${dec(P / 10)} Pa`, `${dec(P / 100)} Pa`],
      explanation: `力 = ${dec(mass * 1000)} ÷ 100 = ${dec(F)} N、面積 = ${w * h}cm² = ${dec((w * h) / 10000, 4)}m²\n圧力 = 力 ÷ 面積 = ${dec(F)} ÷ ${dec((w * h) / 10000, 4)} = ${P} Pa`,
    });
  }

  function genWork() {
    if (Math.random() < 0.5) {
      const F = pick([2, 5, 10, 20, 30, 40, 50]);
      const s = pick([0.5, 1, 1.5, 2, 3, 4]);
      const W = round(F * s);
      return make({
        category: '仕事と仕事率',
        question: `${F}N の力で物体を力の向きに ${s}m 動かしたときの仕事は何Jか。`,
        answer: `${dec(W)} J`,
        distractors: [`${dec(F / s)} J`, `${dec(F + s)} J`, `${dec(W * 10)} J`, `${dec(W / 2)} J`],
        explanation: `仕事 [J] = 力 [N] × 力の向きに動いた距離 [m]\n${F} × ${s} = ${dec(W)} J`,
      });
    }
    const kg = pick([1, 2, 3, 4, 5, 6]);
    const s = pick([1, 2, 3, 4, 5]);
    const t = pick([2, 4, 5, 10]);
    const W = kg * 10 * s;
    return make({
      category: '仕事と仕事率',
      question: `質量 ${kg}kg の物体を ${s}m の高さまで ${t}秒かけて持ち上げた。このときの仕事率は何Wか。\n（100g の物体にはたらく重力の大きさを 1N とする）`,
      answer: `${dec(W / t)} W`,
      distractors: [`${W} W`, `${W * t} W`, `${dec((kg * s) / t)} W`, `${dec(W / t + 5)} W`],
      explanation: `仕事 = ${kg * 10}N × ${s}m = ${W} J\n仕事率 = 仕事 ÷ 時間 = ${W} ÷ ${t} = ${dec(W / t)} W`,
    });
  }

  function genQuake() {
    const [vp, vs, unit] = pick([[6, 3, 6], [8, 4, 8], [6, 4, 12]]);
    const d = unit * rand(3, 15);
    const dur = d / vs - d / vp;
    return make({
      category: '地震',
      question: `P波の速さを秒速 ${vp}km、S波の速さを秒速 ${vs}km とする。震源からの距離が ${d}km の地点での初期微動継続時間は何秒か。`,
      answer: `${dur} 秒`,
      distractors: [`${d / vs} 秒`, `${d / vp} 秒`, `${d / vs + d / vp} 秒`, `${dur * 2} 秒`],
      fallback: () => {
        const v = dur + nz(-4, 4);
        return v > 0 ? `${v} 秒` : null;
      },
      explanation: `S波の到着 ${d}÷${vs} = ${d / vs}秒後、P波の到着 ${d}÷${vp} = ${d / vp}秒後\n初期微動継続時間 = ${d / vs} − ${d / vp} = ${dur}秒`,
    });
  }

  const satTable = { 5: 6.8, 10: 9.4, 15: 12.8, 20: 17.3, 25: 23.1, 30: 30.4 };
  function genHumidity() {
    const temps = Object.keys(satTable).map(Number);
    const T = pick(temps.slice(1));
    const Td = pick(temps.filter((t) => t < T));
    const sT = satTable[T];
    const sTd = satTable[Td];
    const h = Math.round((sTd / sT) * 100);
    return make({
      category: '天気（湿度）',
      question: `気温 ${T}℃ の空気の露点が ${Td}℃ であった。この空気の湿度は約何％か。\n（${T}℃ の飽和水蒸気量は ${sT}g/m³、${Td}℃ の飽和水蒸気量は ${sTd}g/m³。小数第1位を四捨五入）`,
      answer: `約 ${h} %`,
      distractors: [`約 ${Math.round((sT / sTd) * 100)} %`, `約 ${Math.round(((sT - sTd) / sT) * 100)} %`, `約 ${h + 10} %`, `約 ${h - 10} %`],
      explanation: `露点の飽和水蒸気量 = 空気中の水蒸気量 ${sTd}g/m³\n湿度 = ${sTd} ÷ ${sT} × 100 ≒ ${h}%`,
    });
  }

  function genChemMass() {
    if (Math.random() < 0.5) {
      const cu = round(0.4 * rand(1, 10), 1);
      const askOxide = Math.random() < 0.6;
      const ans = askOxide ? round((cu * 5) / 4, 2) : round(cu / 4, 2);
      return make({
        category: '化学変化と質量',
        question: `銅の粉末 ${dec(cu)}g を完全に酸化させた。${askOxide ? 'できた酸化銅は何gか' : '銅と結びついた酸素は何gか'}。\n（銅と酸素は 4:1 の質量の比で結びつく）`,
        answer: `${dec(ans)} g`,
        distractors: askOxide
          ? [`${dec(cu / 4)} g`, `${dec((cu * 4) / 5)} g`, `${dec(cu * 1.5)} g`, `${dec(cu + 1)} g`]
          : [`${dec((cu * 5) / 4)} g`, `${dec(cu * 4)} g`, `${dec(cu / 5)} g`, `${dec(cu / 2)} g`],
        explanation: `銅 : 酸素 : 酸化銅 = 4 : 1 : 5\n${askOxide ? `酸化銅 = ${dec(cu)} × 5/4 = ${dec(ans)} g` : `酸素 = ${dec(cu)} × 1/4 = ${dec(ans)} g`}`,
      });
    }
    const mg = round(0.3 * rand(1, 10), 1);
    const askOxide = Math.random() < 0.6;
    const ans = askOxide ? round((mg * 5) / 3, 2) : round((mg * 2) / 3, 2);
    return make({
      category: '化学変化と質量',
      question: `マグネシウム ${dec(mg)}g を完全に酸化させた。${askOxide ? 'できた酸化マグネシウムは何gか' : 'マグネシウムと結びついた酸素は何gか'}。\n（マグネシウムと酸素は 3:2 の質量の比で結びつく）`,
      answer: `${dec(ans)} g`,
      distractors: askOxide
        ? [`${dec((mg * 2) / 3)} g`, `${dec((mg * 3) / 5)} g`, `${dec(mg * 2)} g`, `${dec(mg + 1)} g`]
        : [`${dec((mg * 5) / 3)} g`, `${dec((mg * 3) / 2)} g`, `${dec(mg / 3)} g`, `${dec(mg / 2)} g`],
      explanation: `マグネシウム : 酸素 : 酸化マグネシウム = 3 : 2 : 5\n${askOxide ? `酸化マグネシウム = ${dec(mg)} × 5/3 = ${dec(ans)} g` : `酸素 = ${dec(mg)} × 2/3 = ${dec(ans)} g`}`,
    });
  }

  function genConcentration() {
    let total, p, solute;
    do {
      total = pick([50, 80, 100, 120, 150, 200, 250, 300]);
      p = pick([4, 5, 8, 10, 12, 15, 20, 25]);
      solute = (total * p) / 100;
    } while (!Number.isInteger(solute));
    const water = total - solute;
    return make({
      category: '水溶液の濃度',
      question: `水 ${water}g に食塩 ${solute}g を溶かした。この食塩水の質量パーセント濃度は何％か。`,
      answer: `${p} %`,
      distractors: [`${dec((solute / water) * 100, 1)} %`, `${p * 2} %`, `${dec(p / 2, 1)} %`, `${p + 5} %`],
      explanation: `質量パーセント濃度 = 溶質の質量 ÷ 溶液の質量 × 100\n${solute} ÷ (${water} + ${solute}) × 100 = ${p}%`,
    });
  }

  const formulas = [
    ['水', 'H₂O'], ['二酸化炭素', 'CO₂'], ['酸素', 'O₂'], ['水素', 'H₂'], ['窒素', 'N₂'],
    ['アンモニア', 'NH₃'], ['塩化ナトリウム', 'NaCl'], ['酸化銅', 'CuO'], ['酸化マグネシウム', 'MgO'],
    ['塩化水素', 'HCl'], ['水酸化ナトリウム', 'NaOH'], ['硫化鉄', 'FeS'],
    ['炭酸水素ナトリウム', 'NaHCO₃'], ['炭酸ナトリウム', 'Na₂CO₃'], ['酸化銀', 'Ag₂O'],
    ['塩化銅', 'CuCl₂'], ['硫酸', 'H₂SO₄'], ['水酸化バリウム', 'Ba(OH)₂'], ['硫酸バリウム', 'BaSO₄'],
  ];
  const elements = [
    ['ナトリウム', 'Na'], ['カリウム', 'K'], ['カルシウム', 'Ca'], ['マグネシウム', 'Mg'],
    ['鉄', 'Fe'], ['銅', 'Cu'], ['銀', 'Ag'], ['亜鉛', 'Zn'], ['塩素', 'Cl'], ['硫黄', 'S'],
    ['炭素', 'C'], ['窒素', 'N'], ['アルミニウム', 'Al'], ['金', 'Au'], ['水素', 'H'], ['酸素', 'O'],
  ];
  const ions = [
    ['水素イオン', 'H⁺'], ['水酸化物イオン', 'OH⁻'], ['ナトリウムイオン', 'Na⁺'], ['塩化物イオン', 'Cl⁻'],
    ['銅イオン', 'Cu²⁺'], ['亜鉛イオン', 'Zn²⁺'], ['硫酸イオン', 'SO₄²⁻'], ['炭酸イオン', 'CO₃²⁻'],
    ['アンモニウムイオン', 'NH₄⁺'], ['マグネシウムイオン', 'Mg²⁺'],
  ];
  const reactions = [
    ['水の電気分解', '2H₂O → 2H₂ + O₂', ['H₂O → H₂ + O₂', '2H₂O → H₂ + 2O₂', 'H₂O → 2H + O']],
    ['銅の酸化', '2Cu + O₂ → 2CuO', ['Cu + O₂ → CuO₂', 'Cu + O → CuO', '2Cu + O₂ → Cu₂O']],
    ['マグネシウムの燃焼', '2Mg + O₂ → 2MgO', ['Mg + O₂ → MgO₂', 'Mg + O → MgO', '2Mg + O₂ → Mg₂O']],
    ['炭酸水素ナトリウムの熱分解', '2NaHCO₃ → Na₂CO₃ + H₂O + CO₂', ['NaHCO₃ → NaCO₃ + H₂O + CO₂', '2NaHCO₃ → Na₂CO₃ + H₂ + CO₂', 'NaHCO₃ → Na + HCO₃']],
    ['酸化銀の熱分解', '2Ag₂O → 4Ag + O₂', ['Ag₂O → 2Ag + O', 'Ag₂O → Ag₂ + O₂', '2Ag₂O → 2Ag + O₂']],
    ['塩酸と水酸化ナトリウム水溶液の中和', 'HCl + NaOH → NaCl + H₂O', ['HCl + NaOH → NaH + ClOH', 'HCl + NaOH → NaCl + H₂', '2HCl + NaOH → NaCl₂ + H₂O']],
    ['鉄と硫黄の反応', 'Fe + S → FeS', ['Fe + S₂ → FeS₂', '2Fe + S → Fe₂S', 'Fe + 2S → FeS₂']],
    ['酸化銅の炭素による還元', '2CuO + C → 2Cu + CO₂', ['CuO + C → Cu + CO₂', 'CuO + C → CuC + O', '2CuO + C → Cu₂ + CO₂']],
    ['水素の燃焼', '2H₂ + O₂ → 2H₂O', ['H₂ + O₂ → H₂O', 'H₂ + O → H₂O₂', '2H + O → H₂O']],
    ['塩化銅水溶液の電気分解', 'CuCl₂ → Cu + Cl₂', ['CuCl₂ → Cu + 2Cl', 'CuCl → Cu + Cl', 'CuCl₂ → Cu₂ + Cl']],
  ];

  // [分野, 説明, 用語]
  const terms = [
    ['生物', '植物の細胞にある、光合成が行われる緑色の粒', '葉緑体'],
    ['生物', '根から吸収した水や養分が通る管', '道管'],
    ['生物', '葉でつくられた養分が通る管', '師管'],
    ['生物', '植物の体から水が水蒸気となって出ていく現象', '蒸散'],
    ['生物', '遺伝子の本体である物質', 'DNA（デオキシリボ核酸）'],
    ['生物', '生殖細胞がつくられるときに行われ、染色体の数が半分になる細胞分裂', '減数分裂'],
    ['生物', '対立形質をもつ純系どうしをかけ合わせたとき、子に現れる形質', '顕性形質'],
    ['生物', '対立形質をもつ純系どうしをかけ合わせたとき、子に現れない形質', '潜性形質'],
    ['生物', '受精を行わず、親の体の一部から新しい個体ができる生殖', '無性生殖'],
    ['生物', '生物が長い年月をかけて世代を重ねる間に変化すること', '進化'],
    ['生物', '形やはたらきは違うが、もとは同じ器官であったと考えられるもの', '相同器官'],
    ['生物', 'だ液に含まれ、デンプンを分解する消化酵素', 'アミラーゼ'],
    ['生物', '胃液に含まれ、タンパク質を分解する消化酵素', 'ペプシン'],
    ['生物', '小腸の内側の壁にある無数の小さな突起', '柔毛'],
    ['生物', '血液の固形成分のうち、酸素を運ぶもの', '赤血球'],
    ['生物', '肺の中にある、気体の交換を行う小さな袋', '肺胞'],
    ['生物', '有害なアンモニアを尿素に変える器官', '肝臓'],
    ['生物', '血液中の不要物をこし出して尿をつくる器官', 'じん臓'],
    ['生物', '刺激に対して意識とは無関係に起こる反応', '反射'],
    ['生物', '「食べる・食べられる」の関係による生物のつながり', '食物連鎖'],
    ['生物', '生物の死がいや排出物などの有機物を無機物に分解する生物', '分解者'],
    ['生物', '胚珠が子房の中にある植物', '被子植物'],
    ['生物', '子房がなく、胚珠がむき出しになっている植物', '裸子植物'],
    ['生物', '体とあしに節があり、外骨格をもつ無セキツイ動物', '節足動物'],
    ['地学', 'マグマが地表や地表付近で急に冷え固まってできた岩石', '火山岩'],
    ['地学', 'マグマが地下深くでゆっくり冷え固まってできた岩石', '深成岩'],
    ['地学', '火山岩に見られる、細かい粒やガラス質の部分', '石基'],
    ['地学', '地震の規模（エネルギーの大きさ）を表す値', 'マグニチュード'],
    ['地学', 'ある地点での地震によるゆれの大きさを表すもの', '震度'],
    ['地学', '地震のゆれのうち、はじめに起こる小さなゆれ', '初期微動'],
    ['地学', '地層が堆積した当時の環境を知る手がかりとなる化石', '示相化石'],
    ['地学', '地層が堆積した時代を知る手がかりとなる化石', '示準化石'],
    ['地学', '空気中の水蒸気が冷えて水滴に変わり始める温度', '露点'],
    ['地学', '寒気が暖気の下にもぐりこみ、暖気を押し上げながら進む前線', '寒冷前線'],
    ['地学', '暖気が寒気の上にはい上がりながら進む前線', '温暖前線'],
    ['地学', '日本の冬に多く見られる、西に高気圧・東に低気圧がある気圧配置', '西高東低'],
    ['地学', '太陽の表面に見られる、周囲より温度が低く黒く見える部分', '黒点'],
    ['地学', '自ら光を出してかがやく天体', '恒星'],
    ['地学', '天球上の太陽の通り道', '黄道'],
    ['地学', '太陽・月・地球の順に一直線に並び、月が地球の影に入る現象', '月食'],
    ['地学', '太陽・月・地球の順に一直線に並び、月が太陽をかくす現象', '日食'],
    ['地学', '太陽系で最も大きい惑星', '木星'],
    ['物理', '光が異なる物質の境界で折れ曲がって進む現象', '屈折'],
    ['物理', '光が水中から空気中へ進むとき、境界ですべて反射する現象', '全反射'],
    ['物理', '凸レンズの軸に平行な光が、レンズを通過後に集まる点', '焦点'],
    ['物理', '物体が外から力を受けないとき、静止または等速直線運動を続ける性質', '慣性'],
    ['物理', '道具を使っても、仕事の大きさは変わらないこと', '仕事の原理'],
    ['物理', '位置エネルギーと運動エネルギーの和', '力学的エネルギー'],
    ['物理', 'コイルの中の磁界が変化すると、コイルに電流が流れる現象', '電磁誘導'],
    ['物理', '向きと大きさが周期的に変わる電流', '交流'],
    ['物理', '水中の物体にはたらく上向きの力', '浮力'],
    ['物理', '物体に力を加えると、同時に同じ大きさで逆向きの力を受けること', '作用・反作用の法則'],
    ['化学', '物質が酸素と結びつく化学変化', '酸化'],
    ['化学', '熱や光を出しながら激しく酸化すること', '燃焼'],
    ['化学', '酸化物から酸素が取り除かれる化学変化', '還元'],
    ['化学', '水に溶かしたとき、その水溶液に電流が流れる物質', '電解質'],
    ['化学', '酸とアルカリが互いの性質を打ち消し合う反応', '中和'],
    ['化学', '中和のとき、酸の陰イオンとアルカリの陽イオンが結びついてできる物質', '塩'],
    ['化学', '化学変化の前後で、物質全体の質量は変わらないという法則', '質量保存の法則'],
    ['化学', '液体を加熱して沸騰させ、出てくる気体を冷やして再び液体として取り出す方法', '蒸留'],
    ['化学', '固体を水に溶かし、冷却などによって再び結晶として取り出す操作', '再結晶'],
    ['化学', '原子の中心にあり、陽子と中性子からなるもの', '原子核'],
    ['化学', '化学変化を利用して、物質のもつ化学エネルギーを電気エネルギーに変える装置', '化学電池'],
  ];

  const facts = [
    ['BTB溶液を酸性の水溶液に加えると何色になる？', '黄色', ['青色', '緑色', '赤色']],
    ['BTB溶液をアルカリ性の水溶液に加えると何色になる？', '青色', ['黄色', '緑色', '無色']],
    ['フェノールフタレイン溶液をアルカリ性の水溶液に加えると何色になる？', '赤色', ['青色', '黄色', '無色']],
    ['水の電気分解で、陰極から発生する気体は？', '水素', ['酸素', '塩素', '二酸化炭素']],
    ['水の電気分解で、陽極から発生する気体は？', '酸素', ['水素', '塩素', '窒素']],
    ['塩化銅水溶液の電気分解で、陽極から発生する気体は？', '塩素', ['酸素', '水素', '銅']],
    ['石灰水を白くにごらせる気体は？', '二酸化炭素', ['酸素', '水素', 'アンモニア']],
    ['水に非常によく溶け、刺激臭があり、水溶液がアルカリ性を示す気体は？', 'アンモニア', ['塩化水素', '二酸化炭素', '窒素']],
    ['星の日周運動で、星は1時間に約何度動いて見える？', '約15度', ['約1度', '約30度', '約60度']],
    ['同じ時刻に見える星座は、1か月で約何度移動して見える？', '約30度', ['約1度', '約15度', '約90度']],
    ['日本で夕方、西の空に見える金星を何という？', 'よいの明星', ['明けの明星', '北極星', 'すばる']],
    ['ヒトの体細胞の染色体の数は？', '46本', ['23本', '44本', '92本']],
    ['音の振動数（1秒間に振動する回数）の単位は？', 'ヘルツ（Hz）', ['デシベル（dB）', 'ワット（W）', 'ニュートン（N）']],
    ['空気中を伝わる音の速さは秒速約何m？', '約340m', ['約30m', '約3400m', '約30万km']],
  ];

  const termGen = (field) => fromList(`${field}（用語）`, terms.filter((t) => t[0] === field), {
    q: (it) => `次の説明にあてはまる語句は？\n${it[1]}`,
    a: (it) => it[2],
    e: (it) => `${it[2]}：${it[1]}。`,
  });

  Q.register({
    id: 'sci',
    name: '理科',
    mark: '理',
    topics: '電流・力と仕事・化学変化・イオン・生物・天気・天体',
    generators: [
      { w: 3, gen: genOhm },
      { w: 3, gen: genSeries },
      { w: 2, gen: genParallel },
      { w: 1, gen: genBuoyancy },
      { w: 1, gen: genPulley },
      { w: 1, gen: genHeat },
      { w: 1, gen: genNeutral },
      { w: 1, gen: genSpeed },
      { w: 1, gen: genThunder },
      { w: 1, gen: genPower },
      { w: 2, gen: genDensity },
      { w: 2, gen: genPressure },
      { w: 2, gen: genWork },
      { w: 2, gen: genQuake },
      { w: 2, gen: genHumidity },
      { w: 2, gen: genChemMass },
      { w: 2, gen: genConcentration },
      { w: 2, gen: fromList('化学式', formulas, {
        q: (it) => `「${it[0]}」の化学式は？`, a: (it) => it[1],
        e: (it) => `${it[0]}：${it[1]}`,
      }) },
      { w: 1, gen: fromList('化学式', formulas, {
        q: (it) => `化学式「${it[1]}」で表される物質は？`, a: (it) => it[0],
        e: (it) => `${it[1]}：${it[0]}`,
      }) },
      { w: 1, gen: fromList('元素記号', elements, {
        q: (it) => `「${it[0]}」の元素記号は？`, a: (it) => it[1],
        e: (it) => `${it[0]}：${it[1]}`,
      }) },
      { w: 2, gen: fromList('イオン', ions, {
        q: (it) => `「${it[0]}」を表す化学式は？`, a: (it) => it[1],
        e: (it) => `${it[0]}：${it[1]}（右上の数字と符号は、帯びている電気の種類と量を表す）`,
      }) },
      { w: 2, gen: fromList('化学反応式', reactions, {
        q: (it) => `「${it[0]}」を表す化学反応式は？`, a: (it) => it[1], d: (it) => it[2],
        e: (it) => `${it[0]}：${it[1]}\n矢印の左右で原子の種類と数が等しくなるように係数を決める。`,
      }) },
      { w: 3, gen: termGen('生物') },
      { w: 3, gen: termGen('地学') },
      { w: 2, gen: termGen('物理') },
      { w: 2, gen: termGen('化学') },
      { w: 2, gen: fromList('重要知識', facts, {
        q: (it) => it[0], a: (it) => it[1], d: (it) => it[2],
        e: (it) => `答え：${it[1]}`,
      }) },
    ],
  });
})();
