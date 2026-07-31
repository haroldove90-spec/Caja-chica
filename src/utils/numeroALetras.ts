export function numeroALetras(monto: number): string {
  if (isNaN(monto) || monto <= 0) return 'CERO PESOS 00/100 M.N.';

  const enteros = Math.floor(monto);
  const centavos = Math.round((monto - enteros) * 100);
  const centavosTexto = centavos < 10 ? `0${centavos}` : `${centavos}`;

  const Unidades = (num: number): string => {
    switch (num) {
      case 1: return 'UN';
      case 2: return 'DOS';
      case 3: return 'TRES';
      case 4: return 'CUATRO';
      case 5: return 'CINCO';
      case 6: return 'SEIS';
      case 7: return 'SIETE';
      case 8: return 'OCHO';
      case 9: return 'NUEVE';
      default: return '';
    }
  };

  const Decenas = (num: number): string => {
    const decena = Math.floor(num / 10);
    const unidad = num - (decena * 10);

    switch (decena) {
      case 1:
        switch (unidad) {
          case 0: return 'DIEZ';
          case 1: return 'ONCE';
          case 2: return 'DOCE';
          case 3: return 'TRECE';
          case 4: return 'CATORCE';
          case 5: return 'QUINCE';
          default: return 'DIECI' + Unidades(unidad);
        }
      case 2:
        if (unidad === 0) return 'VEINTE';
        return 'VEINTI' + Unidades(unidad);
      case 3: return 'TREINTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 4: return 'CUARENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 5: return 'CINCUENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 6: return 'SESENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 7: return 'SETENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 8: return 'OCHENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      case 9: return 'NOVENTA' + (unidad > 0 ? ' Y ' + Unidades(unidad) : '');
      default: return Unidades(unidad);
    }
  };

  const Centenas = (num: number): string => {
    const centena = Math.floor(num / 100);
    const decenas = num - (centena * 100);

    switch (centena) {
      case 1:
        if (decenas > 0) return 'CIENTO ' + Decenas(decenas);
        return 'CIEN';
      case 2: return 'DOSCIENTOS ' + Decenas(decenas);
      case 3: return 'TRESCIENTOS ' + Decenas(decenas);
      case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
      case 5: return 'QUINIENTOS ' + Decenas(decenas);
      case 6: return 'SEISCIENTOS ' + Decenas(decenas);
      case 7: return 'SETECIENTOS ' + Decenas(decenas);
      case 8: return 'OCHO CIENTOS ' + Decenas(decenas);
      case 9: return 'NOVECIENTOS ' + Decenas(decenas);
      default: return Decenas(decenas);
    }
  };

  const Secciones = (num: number, divisor: number, strSingular: string, strPlural: string): string => {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    let letras = '';
    if (cientos > 0) {
      if (cientos > 1) {
        letras = Centenas(cientos) + ' ' + strPlural;
      } else {
        letras = strSingular;
      }
    }

    if (resto > 0) {
      letras += ' ';
    }

    return letras;
  };

  const Miles = (num: number): string => {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    const strMiles = Secciones(num, divisor, 'UN MIL', 'MIL');
    const strCentenas = Centenas(resto);

    if (strMiles === '') return strCentenas;
    return strMiles + ' ' + strCentenas;
  };

  const Millones = (num: number): string => {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    const strMillones = Secciones(num, divisor, 'UN MILLON', 'MILLONES');
    const strMiles = Miles(resto);

    if (strMillones === '') return strMiles;
    return strMillones + ' ' + strMiles;
  };

  const texto = Millones(enteros).trim();
  return `${texto || 'CERO'} PESOS ${centavosTexto}/100 M.N.`;
}
