export function getLineExplanation(
  description: string,
  measurements: Record<string, number>,
  diagnostic: Record<string, unknown>,
): string | null {
  const facadeArea = measurements.facadeArea ?? 0;
  if (!facadeArea) return null;

  const desc = description.toLowerCase();

  // 1. Plasă fibră de sticlă
  if (desc.includes('plasă fibră') || desc.includes('plasa fibra')) {
    const baseMesh = round2(facadeArea * 1.1);
    return `Calcul: ${facadeArea} m² × 1.10 armare × 1.08 pierderi = ${round2(baseMesh * 1.08)} m²`;
  }

  // 2. Închiriere schelă
  if (desc.includes('închiriere schelă') || desc.includes('inchiriere schela')) {
    const scaffoldingArea = measurements.scaffoldingArea || facadeArea;
    const duration = Number(diagnostic.scaffoldingRentalDuration ?? 1);
    const period = String(diagnostic.scaffoldingRentalPeriod ?? 'months').toLowerCase();
    
    let durationInMonths = duration;
    let label = 'luni';
    if (period === 'days') {
      durationInMonths = duration / 30;
      label = `zile (${round2(durationInMonths)} luni)`;
    } else if (period === 'weeks') {
      durationInMonths = (duration * 7) / 30;
      label = `săpt. (${round2(durationInMonths)} luni)`;
    } else {
      label = duration === 1 ? 'lună' : 'luni';
    }

    const formattedDuration = duration === 1 && period === 'months' ? '1 lună' : `${duration} ${label}`;
    return `Calcul: ${scaffoldingArea} m² × ${formattedDuration}`;
  }

  // 3. Montaj schelă metalică
  if (desc.includes('montaj schelă') || desc.includes('montaj schela')) {
    const scaffoldingArea = measurements.scaffoldingArea || facadeArea;
    return `Calcul: ${scaffoldingArea} m² (suprafață montaj)`;
  }

  // 4. Demontaj schelă metalică
  if (desc.includes('demontaj schelă') || desc.includes('demontaj schela')) {
    const scaffoldingArea = measurements.scaffoldingArea || facadeArea;
    return `Calcul: ${scaffoldingArea} m² (suprafață demontaj)`;
  }

  // 5. Izolație termică (material)
  if (desc.includes('izolație termică') || desc.includes('izolatie termica')) {
    if (desc.includes('material')) {
      const thickness = measurements.insulationThicknessCm ?? 10;
      const baseVol = round2(facadeArea * (thickness / 100));
      return `Calcul: ${facadeArea} m² × ${thickness} cm = ${baseVol} m³ × 1.05 pierderi`;
    }
  }

  // 6. Dibluri mecanice
  if (desc.includes('dibluri')) {
    const wallMaterial = String(diagnostic.wallMaterial ?? 'brick').toLowerCase();
    const dowelDensity =
      wallMaterial === 'bca' ? 8 :
      wallMaterial === 'panel' ? 5 :
      (wallMaterial === 'wood_frame' || wallMaterial === 'wood') ? 3 :
      6;
    return `Calcul: ${facadeArea} m² × ${dowelDensity} dibluri/m²`;
  }

  // 7. Tencuială decorativă (material)
  if (desc.includes('tencuială decorativă') || desc.includes('tencuiala decorativa')) {
    if (desc.includes('material')) {
      const decorativeArea = measurements.decorativePlasterArea || facadeArea;
      return `Calcul: ${decorativeArea} m² × 1.10 pierderi`;
    }
  }

  // 8. Vopsea fațadă (material)
  if (desc.includes('vopsea fațadă') || desc.includes('vopsea fatada')) {
    if (desc.includes('material')) {
      const paintingArea = measurements.paintingArea || facadeArea;
      return `Calcul: ${paintingArea} m² × 1.08 pierderi`;
    }
  }

  // 9. Evacuare moloz
  if (desc.includes('evacuare moloz')) {
    const oldPlasterArea = measurements.oldPlasterArea ?? 0;
    return `Calcul: ${oldPlasterArea} m² (tencuială veche de evacuat)`;
  }

  // 10. Demontare tencuială veche
  if (desc.includes('demontare tencuială') || desc.includes('demontare tenciala')) {
    const oldPlasterArea = measurements.oldPlasterArea ?? 0;
    return `Calcul: ${oldPlasterArea} m²`;
  }

  // 11. Reparatii locale
  if (desc.includes('reparații locale') || desc.includes('reparatii locale')) {
    const repairArea = measurements.repairArea ?? 0;
    if (desc.includes('material')) {
      return `Calcul: ${repairArea} m² × 1.08 pierderi`;
    }
    return `Calcul: ${repairArea} m²`;
  }

  // 12. Glafuri exterioare (material)
  if (desc.includes('glaf exterior') && desc.includes('material')) {
    const sill = measurements.exteriorSillLengthM ?? 0;
    return `Calcul: ${sill} m × 1.05 pierderi`;
  }

  // 13. Picurător (material)
  if (desc.includes('picurător') && desc.includes('material')) {
    const drip = measurements.facadeDripEdgeLengthM ?? 0;
    return `Calcul: ${drip} m × 1.05 pierderi`;
  }

  // Labor lines with height / condition multipliers
  if (
    desc.includes('lucrări montaj izolație') || desc.includes('lucrari montaj izolatie') ||
    desc.includes('lucrări armare') || desc.includes('lucrari armare') ||
    desc.includes('lucrări tencuială') || desc.includes('lucrari tencuiala') ||
    desc.includes('lucrări vopsire') || desc.includes('lucrari vopsire') ||
    desc.includes('lucrări soclu') || desc.includes('lucrari soclu') ||
    desc.includes('grund & pregătire') || desc.includes('grund & pregatire')
  ) {
    const baseAreaKey =
      desc.includes('decorativă') || desc.includes('decorativa') ? 'decorativePlasterArea' :
      desc.includes('soclu') ? 'basePlinthArea' :
      desc.includes('vopsire') ? 'paintingArea' :
      'facadeArea';

    const baseArea = measurements[baseAreaKey] || facadeArea;
    const heightMult = measurements.heightMultiplier ?? 1.0;
    const condition = String(diagnostic.facadeCondition ?? 'good').toLowerCase();
    const condMult =
      condition === 'old' ? 1.15 :
      condition === 'damaged' ? 1.30 :
      1.00;

    let formula = `Calcul: ${baseArea} m²`;
    if (heightMult > 1) formula += ` × ${heightMult} (h > 9m)`;
    if (condMult > 1) {
      const condLabel = condition === 'old' ? 'veche' : 'deteriorată';
      formula += ` × ${condMult} (stare ${condLabel})`;
    }
    return formula;
  }

  return null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
