import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore, getTodayDateString } from '../store/useAppStore';
import { AttributeCategory, Difficulty } from '../types';
import { requestNotificationPermissions } from '../services/notificationService';
import { BASE_XP } from '../domain/gamificationEngine';
import {
  calculateDurationFixedXp,
  calculateMilestoneXp,
  deriveHabitDifficulty,
  getInclusiveCalendarDays,
  getScheduledDatesInRange,
  isValidDateString,
  QUEST_MIN_COMPLETION_RATE,
  SHORT_QUEST_MAX_SCHEDULED_DAYS,
} from '../domain/questProgressService';
import { MiniCalendarPicker } from '../components/MiniCalendarPicker';

const DAYS_OF_WEEK = [
  { day: 0, label: 'Dom' },
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
];

export default function HabitFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const habits = useAppStore((state) => state.habits);
  const addHabit = useAppStore((state) => state.addHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const deleteHabit = useAppStore((state) => state.deleteHabit);

  const existingHabit = id ? habits.find((h) => h.id === id) : null;

  const today = getTodayDateString();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AttributeCategory>('intelecto');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Periodo no calendario (sempre aberto)
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');

  // Horario e avisos de despertador (sempre visiveis)
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [earlyReminderEnabled, setEarlyReminderEnabled] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dificuldade calculada dinamicamente com base nas datas e frequencia de dias
  const calculatedDifficulty: Difficulty = deriveHabitDifficulty({
    startDate: startDate.trim() ? startDate.trim() : today,
    endDate: endDate.trim() ? endDate.trim() : null,
    daysOfWeek: selectedDays,
  });

  useEffect(() => {
    if (existingHabit) {
      setTitle(existingHabit.title);
      setCategory(existingHabit.category);
      setSelectedDays(existingHabit.daysOfWeek);
      setStartDate(existingHabit.startDate || today);
      setEndDate(existingHabit.endDate || '');
      setReminderEnabled(existingHabit.reminderEnabled);
      setReminderTime(existingHabit.reminderTime || '08:00');
      setEarlyReminderEnabled(!!existingHabit.earlyReminderEnabled);
    }
  }, [existingHabit]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) {
        Alert.alert('Aviso', 'A meta precisa estar programada para pelo menos um dia da semana.');
        return;
      }
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleToggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'Para receber despertadores locais, habilite as notificações nas configurações do aparelho.'
        );
      }
    }
    setReminderEnabled(value);
  };

  const handleApplyQuickRange = (daysCount: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + Math.max(0, daysCount - 1));

    setStartDate(getTodayDateString(start));
    setEndDate(getTodayDateString(end));
    if (errorMessage) setErrorMessage(null);
  };

  const renderXpPreviewCard = () => {
    const dailyXp = BASE_XP[calculatedDifficulty];
    const hasCompleteBoundedRange =
      isValidDateString(startDate) &&
      isValidDateString(endDate) &&
      startDate <= endDate;

    if (hasCompleteBoundedRange) {
      const calendarDays = getInclusiveCalendarDays(startDate, endDate);
      const scheduledDates = getScheduledDatesInRange(
        { daysOfWeek: selectedDays },
        startDate,
        endDate
      );
      const scheduledCount = scheduledDates.length;
      const xpCalc = calculateDurationFixedXp(calendarDays, calculatedDifficulty, scheduledCount);
      const minPercent =
        scheduledCount <= SHORT_QUEST_MAX_SCHEDULED_DAYS
          ? 100
          : Math.round(QUEST_MIN_COMPLETION_RATE * 100);

      return (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>PRÉVIA DE RECOMPENSA DA QUEST</Text>
          <Text style={styles.previewLine}>
            Check-in diário: +{dailyXp} XP (+20% após 3 dias de ofensiva)
          </Text>
          <Text style={styles.previewLine}>
            Faixa: {xpCalc.label} • {calendarDays} dias ({scheduledCount} programados)
          </Text>
          {scheduledCount === 0 ? (
            <Text style={styles.previewWarn}>
              Nenhum dia da semana selecionado cai neste período.
            </Text>
          ) : (
            <>
              <Text style={styles.previewHighlight}>
                Bônus fixo ao concluir ({minPercent}%+): +{xpCalc.fixedXp} XP
              </Text>
              {xpCalc.supportsPerfectBonus && (
                <Text style={styles.previewPerfect}>
                  Quest Perfeita (100%): +{xpCalc.perfectXp} XP (+20%)
                </Text>
              )}
            </>
          )}
        </View>
      );
    }

    return (
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>PRÉVIA DE RECOMPENSA DA QUEST</Text>
        <Text style={styles.previewLine}>
          Check-in diário: +{dailyXp} XP (+20% após 3 dias de ofensiva)
        </Text>
        <Text style={styles.previewLine}>
          Modo Contínuo: bônus acumulados por marcos de consistência:
        </Text>
        <Text style={styles.previewHighlight}>
          7 dias (+{calculateMilestoneXp(7, calculatedDifficulty)} XP) • 30 dias (+
          {calculateMilestoneXp(30, calculatedDifficulty)} XP) • 90 dias (+
          {calculateMilestoneXp(90, calculatedDifficulty)} XP)
        </Text>
      </View>
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage('O título da meta é obrigatório.');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setErrorMessage('A data inicial não pode ser posterior à data final.');
      return;
    }

    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      category,
      difficulty: calculatedDifficulty,
      daysOfWeek: selectedDays,
      startDate: startDate.trim() ? startDate.trim() : today,
      endDate: endDate.trim() ? endDate.trim() : null,
      reminderEnabled,
      reminderTime: reminderEnabled && reminderTime.trim() ? reminderTime.trim() : null,
      earlyReminderEnabled: reminderEnabled ? earlyReminderEnabled : false,
    };

    if (existingHabit) {
      await updateHabit(existingHabit.id, payload);
    } else {
      await addHabit(payload);
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingHabit) return;

    Alert.alert(
      'Excluir Meta',
      `Deseja realmente remover '${existingHabit.title}'? O histórico de XP acumulado será preservado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(existingHabit.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Titulo */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>O que você vai realizar? *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Treinar Peito, Estudar React Native..."
            placeholderTextColor="#6b7280"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errorMessage) setErrorMessage(null);
            }}
          />
        </View>

        {/* Categoria / Atributo */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Atributo Evoluído</Text>
          <View style={styles.optionsRow}>
            {(['intelecto', 'forca', 'disciplina'] as AttributeCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.optionCard, category === cat && styles.optionCardSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[styles.optionText, category === cat && styles.optionTextSelected]}
                >
                  {cat === 'intelecto' ? 'Intelecto' : cat === 'forca' ? 'Força' : 'Disciplina'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dificuldade Automatica (Calculada pelo sistema) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Dificuldade Automática (Recompensa de XP)</Text>
          <View
            style={[
              styles.calculatedCard,
              calculatedDifficulty === 'facil'
                ? styles.calculatedCardFacil
                : calculatedDifficulty === 'medio'
                ? styles.calculatedCardMedio
                : styles.calculatedCardDificil,
            ]}
          >
            <View style={styles.calculatedHeaderRow}>
              <View
                style={[
                  styles.difficultyBadge,
                  calculatedDifficulty === 'facil'
                    ? styles.difficultyBadgeFacil
                    : calculatedDifficulty === 'medio'
                    ? styles.difficultyBadgeMedio
                    : styles.difficultyBadgeDificil,
                ]}
              >
                <Text style={styles.difficultyBadgeText}>
                  {calculatedDifficulty === 'facil'
                    ? 'FÁCIL (+15 XP/dia)'
                    : calculatedDifficulty === 'medio'
                    ? 'MÉDIO (+30 XP/dia)'
                    : 'DIFÍCIL (+50 XP/dia)'}
                </Text>
              </View>
              <Text style={styles.calculatedNote}>Calculada pela vigência e dias</Text>
            </View>
            <Text style={styles.calculatedDesc}>
              {calculatedDifficulty === 'facil'
                ? 'Meta curta (até 6 dias corridos ou poucos check-ins): recompensa inicial para hábitos pontuais.'
                : calculatedDifficulty === 'medio'
                ? 'Meta intermediária (1 a 4 semanas): recompensa equilibrada por consistência.'
                : 'Meta longa (28+ dias ou contínua regular): maior recompensa de XP para jornadas épicas.'}
            </Text>
          </View>
        </View>

        {/* Periodo de Vigencia no Calendario (Sempre Aberto) */}
        <View style={styles.fieldGroup}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.fieldLabel}>Período de Vigência no Calendário</Text>
            <Text style={styles.fieldSubLabel}>
              Selecione o início e o término no mini calendário
            </Text>
          </View>

          <View style={styles.calendarContainer}>
            {/* Atalhos rapidos de periodo */}
            <View style={styles.quickRangeRow}>
              <Text style={styles.quickRangeLabel}>Atalhos:</Text>
              {[
                { days: 7, label: '7 dias' },
                { days: 14, label: '14 dias' },
                { days: 30, label: '30 dias' },
                { days: 90, label: '90 dias' },
              ].map(({ days, label }) => (
                <TouchableOpacity
                  key={days}
                  style={styles.quickRangeButton}
                  onPress={() => handleApplyQuickRange(days)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickRangeText}>{label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickRangeButton, !endDate && styles.quickRangeButtonActive]}
                onPress={() => setEndDate('')}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickRangeText, !endDate && styles.quickRangeTextActive]}>
                  Contínua
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mini Calendario Interativo */}
            <MiniCalendarPicker
              startDate={startDate}
              endDate={endDate ? endDate : null}
              onSelectRange={({ startDate: newStart, endDate: newEnd }) => {
                setStartDate(newStart);
                setEndDate(newEnd || '');
                if (errorMessage) setErrorMessage(null);
              }}
            />

            {/* Campos de texto para conferencia ou ajuste manual */}
            <View style={styles.dateInputsRow}>
              <View style={styles.dateInputCol}>
                <Text style={styles.dateInputLabel}>Data de Início:</Text>
                <TextInput
                  style={styles.dateTextInput}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#6b7280"
                  maxLength={10}
                />
              </View>

              <View style={styles.dateInputCol}>
                <Text style={styles.dateInputLabel}>Data de Término (opcional):</Text>
                <TextInput
                  style={styles.dateTextInput}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="AAAA-MM-DD (ou vazio)"
                  placeholderTextColor="#6b7280"
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Dias da Semana Programados */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Dias da Semana</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map(({ day, label }) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Despertador / Horario e Aviso Previo (Sempre Visivel) */}
        <View style={styles.fieldGroup}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>Despertador / Horário (Opcional)</Text>
              <Text style={styles.fieldSubLabel}>
                {reminderEnabled
                  ? 'Alarme motivacional ATIVADO'
                  : 'Alarme motivacional DESATIVADO (toque para ativar)'}
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: '#262638', true: '#6366f1' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Configuracoes sempre visiveis na tela */}
          <View style={[styles.reminderDetailsBox, !reminderEnabled && styles.reminderBoxMuted]}>
            <View style={styles.timeRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.timeLabel}>Horário do Alarme (HH:mm):</Text>
                <Text style={styles.timeSubLabel}>
                  {reminderEnabled
                    ? 'Horário do toque motivacional'
                    : 'Horário pré-configurado (ative o switch para receber o alarme)'}
                </Text>
              </View>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="08:00"
                placeholderTextColor="#6b7280"
                maxLength={5}
              />
            </View>

            {/* Opcao de Aviso 10 Minutos Antes */}
            <View style={[styles.switchRow, { marginTop: 12 }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.fieldLabel}>Aviso Diário 10 Min Antes</Text>
                <Text style={styles.fieldSubLabel}>
                  Notificação preparatória 10 min antes do alarme principal
                </Text>
              </View>
              <Switch
                value={earlyReminderEnabled}
                onValueChange={(val) => {
                  if (val && !reminderEnabled) {
                    setReminderEnabled(true);
                  }
                  setEarlyReminderEnabled(val);
                }}
                trackColor={{ false: '#262638', true: '#6366f1' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Pre-visualizacao dinamica de XP por duracao */}
        {renderXpPreviewCard()}

        {/* Botoes de Acao */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {existingHabit ? 'Salvar Alterações' : 'Criar Meta'}
            </Text>
          </TouchableOpacity>

          {existingHabit && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={styles.deleteButtonText}>Excluir Meta</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0c0c12',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 140,
  },
  errorBox: {
    backgroundColor: '#ef444422',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldSubLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#1a1a27',
    borderWidth: 1,
    borderColor: '#2e2e42',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  calculatedCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  calculatedCardFacil: {
    borderColor: '#34d39966',
  },
  calculatedCardMedio: {
    borderColor: '#fbbf2466',
  },
  calculatedCardDificil: {
    borderColor: '#f8717166',
  },
  calculatedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyBadgeFacil: {
    backgroundColor: '#34d39922',
    borderWidth: 1,
    borderColor: '#34d399',
  },
  difficultyBadgeMedio: {
    backgroundColor: '#fbbf2422',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  difficultyBadgeDificil: {
    backgroundColor: '#f8717122',
    borderWidth: 1,
    borderColor: '#f87171',
  },
  difficultyBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  calculatedNote: {
    color: '#9ca3af',
    fontSize: 11,
  },
  calculatedDesc: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitleRow: {
    marginBottom: 8,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#1a1a27',
    borderWidth: 1,
    borderColor: '#2e2e42',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#6366f122',
    borderColor: '#6366f1',
  },
  optionText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayButton: {
    flex: 1,
    backgroundColor: '#1a1a27',
    borderWidth: 1,
    borderColor: '#2e2e42',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  dayText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarContainer: {
    marginTop: 12,
    backgroundColor: '#161622',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262638',
  },
  quickRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickRangeLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  quickRangeButton: {
    backgroundColor: '#262638',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickRangeButtonActive: {
    backgroundColor: '#6366f122',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  quickRangeText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '600',
  },
  quickRangeTextActive: {
    color: '#ffffff',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
  },
  dateTextInput: {
    backgroundColor: '#1e1e2d',
    borderWidth: 1,
    borderColor: '#2e2e42',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  reminderDetailsBox: {
    backgroundColor: '#161622',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#262638',
  },
  reminderBoxMuted: {
    opacity: 0.6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
  },
  timeLabel: {
    color: '#d1d5db',
    fontSize: 13,
  },
  timeSubLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
  },
  timeInput: {
    backgroundColor: '#262638',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#7f1d1d22',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#1a1a27',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  previewCard: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: '#4f46e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  previewTitle: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  previewLine: {
    color: '#d1d5db',
    fontSize: 12,
  },
  previewHighlight: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  previewPerfect: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  previewWarn: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
