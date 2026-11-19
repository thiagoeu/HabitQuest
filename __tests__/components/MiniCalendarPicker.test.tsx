import {
  getMonthDaysGrid,
  getNextRangeOnDayPress,
  MONTH_NAMES,
} from '../../src/components/MiniCalendarPicker';

describe('MiniCalendarPicker - Logica e Comportamento', () => {
  test('possui os 12 meses do ano definidos em portugues', () => {
    expect(MONTH_NAMES).toHaveLength(12);
    expect(MONTH_NAMES[0]).toBe('Janeiro');
    expect(MONTH_NAMES[10]).toBe('Novembro');
    expect(MONTH_NAMES[11]).toBe('Dezembro');
  });

  test('calcula corretamente o grid de dias de novembro de 2026 (comeca no domingo = 0 lacunas)', () => {
    // 01/11/2026 caiu em um domingo (getDay() === 0), 30 dias no mes
    const gridNov2026 = getMonthDaysGrid(2026, 10);
    expect(gridNov2026[0]).toBe(1);
    expect(gridNov2026).toHaveLength(30);
    expect(gridNov2026[29]).toBe(30);
  });

  test('calcula corretamente o grid de dezembro de 2026 (comeca na terca = 2 lacunas)', () => {
    // 01/12/2026 caiu em uma terca-feira (getDay() === 2), 31 dias no mes
    const gridDec2026 = getMonthDaysGrid(2026, 11);
    expect(gridDec2026[0]).toBeNull();
    expect(gridDec2026[1]).toBeNull();
    expect(gridDec2026[2]).toBe(1);
    expect(gridDec2026).toHaveLength(33); // 2 nulos + 31 dias
    expect(gridDec2026[32]).toBe(31);
  });

  test('trata corretamente ano bissexto para fevereiro (ex: 2028 com 29 dias)', () => {
    const gridFeb2028 = getMonthDaysGrid(2028, 1);
    const dayNumbers = gridFeb2028.filter((d) => d !== null);
    expect(dayNumbers).toHaveLength(29);
    expect(dayNumbers[28]).toBe(29);
  });

  describe('getNextRangeOnDayPress (maquina de estados de selecao de datas)', () => {
    test('inicia uma nova selecao quando nao ha data inicial', () => {
      const result = getNextRangeOnDayPress({ startDate: null, endDate: null }, '2026-11-20');
      expect(result).toEqual({ startDate: '2026-11-20', endDate: null });
    });

    test('define a data final ao selecionar um dia posterior a data inicial', () => {
      const result = getNextRangeOnDayPress(
        { startDate: '2026-11-20', endDate: null },
        '2026-11-27'
      );
      expect(result).toEqual({ startDate: '2026-11-20', endDate: '2026-11-27' });
    });

    test('permite selecionar o mesmo dia como data final (meta de 1 dia pontual)', () => {
      const result = getNextRangeOnDayPress(
        { startDate: '2026-11-20', endDate: null },
        '2026-11-20'
      );
      expect(result).toEqual({ startDate: '2026-11-20', endDate: '2026-11-20' });
    });

    test('reinicia a data inicial ao selecionar um dia anterior a data inicial', () => {
      const result = getNextRangeOnDayPress(
        { startDate: '2026-11-20', endDate: null },
        '2026-11-15'
      );
      expect(result).toEqual({ startDate: '2026-11-15', endDate: null });
    });

    test('ao tocar em um novo dia quando ja havia um intervalo completo, reinicia nova selecao a partir dele', () => {
      const result = getNextRangeOnDayPress(
        { startDate: '2026-11-20', endDate: '2026-11-27' },
        '2026-12-01'
      );
      expect(result).toEqual({ startDate: '2026-12-01', endDate: null });
    });
  });
});
