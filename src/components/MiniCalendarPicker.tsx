import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { isValidDateString, parseLocalDate } from '../domain/questProgressService';

export interface MiniCalendarPickerProps {
  startDate?: string | null;
  endDate?: string | null;
  onSelectRange: (range: { startDate: string; endDate: string | null }) => void;
  minDate?: string;
}

export interface CalendarRange {
  startDate: string | null;
  endDate: string | null;
}

/**
 * Logica pura de selecao de intervalo ao tocar em um dia do calendario
 */
export function getNextRangeOnDayPress(
  current: CalendarRange,
  selectedDay: string
): { startDate: string; endDate: string | null } {
  const { startDate, endDate } = current;

  if (!startDate || (startDate && endDate)) {
    return { startDate: selectedDay, endDate: null };
  }

  if (selectedDay === startDate) {
    return { startDate, endDate: selectedDay };
  }

  if (selectedDay > startDate) {
    return { startDate, endDate: selectedDay };
  }

  return { startDate: selectedDay, endDate: null };
}

/**
 * Retorna a grade com preenchimento nulo para dias vazios e numeros dos dias do mes
 */
export function getMonthDaysGrid(year: number, month: number): (number | null)[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysGrid.push(d);
  }
  return daysGrid;
}

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateToYMD(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr || !isValidDateString(dateStr)) return '--/--/----';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export const MiniCalendarPicker: React.FC<MiniCalendarPickerProps> = ({
  startDate,
  endDate,
  onSelectRange,
}) => {
  const today = new Date();
  const todayStr = formatDateToYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const initialDate = startDate && isValidDateString(startDate) ? parseLocalDate(startDate) : today;
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Sincroniza visualizacao se startDate mudar externamente
  useEffect(() => {
    if (startDate && isValidDateString(startDate)) {
      const d = parseLocalDate(startDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [startDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleGoToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleDayPress = (dayNumber: number) => {
    const selected = formatDateToYMD(viewYear, viewMonth, dayNumber);
    const nextRange = getNextRangeOnDayPress(
      { startDate: startDate || null, endDate: endDate || null },
      selected
    );
    onSelectRange(nextRange);
  };

  const handleClearEndDate = () => {
    if (startDate) {
      onSelectRange({ startDate, endDate: null });
    }
  };

  // Calculo de dias do mes atual
  const daysGrid = getMonthDaysGrid(viewYear, viewMonth);

  return (
    <View style={styles.container} testID="mini-calendar">
      {/* Navegacao de Meses */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrevMonth}
          testID="prev-month-button"
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoToday} activeOpacity={0.8}>
          <Text style={styles.monthTitle} testID="month-year-label">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextMonth}
          testID="next-month-button"
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Dias da Semana */}
      <View style={styles.weekdaysRow}>
        {WEEKDAY_NAMES.map((w, idx) => (
          <Text key={idx} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      {/* Grade de Dias */}
      <View style={styles.daysGrid}>
        {daysGrid.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.emptyDayCell} />;
          }

          const currentYMD = formatDateToYMD(viewYear, viewMonth, day);
          const isStart = startDate === currentYMD;
          const isEnd = endDate === currentYMD;
          const isInRange =
            !!startDate &&
            !!endDate &&
            currentYMD > startDate &&
            currentYMD < endDate;
          const isToday = currentYMD === todayStr;

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayCell,
                isInRange && styles.dayCellInRange,
                isStart && styles.dayCellStart,
                isEnd && styles.dayCellEnd,
                isToday && !isStart && !isEnd && styles.dayCellToday,
              ]}
              onPress={() => handleDayPress(day)}
              testID={`calendar-day-${currentYMD}`}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  (isStart || isEnd) && styles.dayTextEndpoint,
                  isInRange && styles.dayTextInRange,
                  isToday && !isStart && !isEnd && styles.dayTextToday,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Barra de resumo do intervalo selecionado */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryInfoCol}>
          <Text style={styles.summaryLabel}>Início:</Text>
          <Text style={styles.summaryValue}>{formatDisplayDate(startDate)}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryInfoCol}>
          <Text style={styles.summaryLabel}>Término:</Text>
          <Text style={styles.summaryValue}>
            {endDate ? formatDisplayDate(endDate) : 'Contínuo'}
          </Text>
        </View>

        {endDate && (
          <TouchableOpacity
            style={styles.clearEndButton}
            onPress={handleClearEndDate}
            testID="clear-end-date-button"
            activeOpacity={0.7}
          >
            <Text style={styles.clearEndButtonText}>Tornar Contínuo</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#262638',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  monthTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1f1f30',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2e2e46',
  },
  navButtonText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
    paddingBottom: 6,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 36,
  },
  dayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  dayCellStart: {
    backgroundColor: '#6366f1',
  },
  dayCellEnd: {
    backgroundColor: '#6366f1',
  },
  dayCellInRange: {
    backgroundColor: '#3730a355',
    borderRadius: 4,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#818cf8',
  },
  dayText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '500',
  },
  dayTextEndpoint: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextInRange: {
    color: '#c7d2fe',
    fontWeight: '600',
  },
  dayTextToday: {
    color: '#818cf8',
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f30',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  summaryInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 11,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#37374e',
  },
  clearEndButton: {
    backgroundColor: '#2e2e46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearEndButtonText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '600',
  },
});
