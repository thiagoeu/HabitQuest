import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CharacterClass, CharacterClassId, UserProfile } from '../../types';
import {
  getAllClasses,
  checkClassRequirements,
} from '../../domain/classProgressionService';
import { ClassIcon } from './ClassIcon';

interface ClassProgressionModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectClass: (classId: CharacterClassId) => void;
}

export const ClassProgressionModal: React.FC<ClassProgressionModalProps> = ({
  visible,
  onClose,
  profile,
  onSelectClass,
}) => {
  const classes = getAllClasses();
  const [selectedClassId, setSelectedClassId] = useState<CharacterClassId>(profile.currentClass);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isCurrentActive = profile.currentClass === selectedClassId;
  const isAlreadyUnlocked = profile.unlockedClasses?.includes(selectedClassId);
  const requirementCheck = checkClassRequirements(selectedClassId, profile);

  const handleAction = () => {
    if (isCurrentActive) {
      onClose();
      return;
    }

    if (!isAlreadyUnlocked && !requirementCheck.eligible) {
      Alert.alert(
        'Requisitos Pendentes',
        requirementCheck.reasons.join('\n') || 'Cumpra mais habitos para desbloquear esta classe.'
      );
      return;
    }

    onSelectClass(selectedClassId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>PROGRESSAO DE CLASSES RPG</Text>
              <Text style={styles.headerSubtitle}>
                Evolua seu personagem atraves da consistencia em seus habitos
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Lista Horizontal de Classes */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesScrollList}
          >
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              const isActive = profile.currentClass === cls.id;
              const isUnlocked = profile.unlockedClasses?.includes(cls.id);

              return (
                <TouchableOpacity
                  key={cls.id}
                  onPress={() => setSelectedClassId(cls.id)}
                  style={[
                    styles.classTabCard,
                    isSelected && { borderColor: cls.themeColor, backgroundColor: '#26263B' },
                    isActive && styles.activeClassTabCard,
                  ]}
                >
                  <ClassIcon
                    classId={cls.id}
                    size={44}
                    isLocked={!isUnlocked && !checkClassRequirements(cls.id, profile).eligible}
                  />
                  <Text style={[styles.classTabName, isSelected && { color: cls.themeColor }]}>
                    {cls.name}
                  </Text>
                  {isActive && <Text style={styles.activeTag}>ATIVA</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Detalhes da Classe Selecionada */}
          <ScrollView style={styles.detailsScroll}>
            <View style={styles.classHeroCard}>
              <View style={styles.classHeroHeader}>
                <ClassIcon
                  classId={selectedClass.id}
                  size={58}
                  isLocked={!isAlreadyUnlocked && !requirementCheck.eligible}
                  showBadge={true}
                />
                <View style={styles.classHeroInfo}>
                  <Text style={[styles.className, { color: selectedClass.themeColor }]}>
                    {selectedClass.name}
                  </Text>
                  <Text style={styles.classTitle}>{selectedClass.title}</Text>
                  <Text style={styles.classLore}>{selectedClass.lore}</Text>
                </View>
              </View>

              {/* Bonus Passivos */}
              <View style={styles.perkBox}>
                <Text style={styles.perkLabel}>HABILIDADE PASSIVA:</Text>
                <Text style={styles.perkDescription}>{selectedClass.perk.description}</Text>
              </View>

              {/* Requisitos */}
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>Requisitos de Evolucao:</Text>
                <Text
                  style={[
                    styles.requirementItem,
                    profile.level >= selectedClass.requiredLevel
                      ? styles.reqMet
                      : styles.reqUnmet,
                  ]}
                >
                  - Nivel da Conta: {profile.level} / {selectedClass.requiredLevel}
                </Text>

                {Object.entries(selectedClass.requiredAttributes).map(([attr, minVal]) => {
                  const currentVal =
                    profile.attributes[attr as keyof typeof profile.attributes]?.points || 0;
                  const met = currentVal >= (minVal || 0);
                  return (
                    <Text
                      key={attr}
                      style={[styles.requirementItem, met ? styles.reqMet : styles.reqUnmet]}
                    >
                      - Pontos de {attr.toUpperCase()}: {currentVal} / {minVal}
                    </Text>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Botao de Acao */}
          <View style={styles.footer}>
            {isCurrentActive ? (
              <View style={[styles.actionButton, styles.buttonCurrent]}>
                <Text style={styles.actionButtonText}>CLASSE ATUAL EM USO</Text>
              </View>
            ) : isAlreadyUnlocked ? (
              <TouchableOpacity
                onPress={handleAction}
                style={[styles.actionButton, { backgroundColor: selectedClass.themeColor }]}
              >
                <Text style={styles.actionButtonText}>ATIVAR CLASSE {selectedClass.name.toUpperCase()}</Text>
              </TouchableOpacity>
            ) : requirementCheck.eligible ? (
              <TouchableOpacity
                onPress={handleAction}
                style={[styles.actionButton, styles.buttonEvolve]}
              >
                <Text style={styles.actionButtonText}>
                  EVOLUIR PARA {selectedClass.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionButton, styles.buttonLocked]}>
                <Text style={styles.actionButtonText}>REQUISITOS PENDENTES</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#161622',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#262638',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#262638',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#D1D5DB',
    fontWeight: '700',
    fontSize: 14,
  },
  classesScrollList: {
    paddingVertical: 4,
    gap: 8,
  },
  classTabCard: {
    backgroundColor: '#1E1E2D',
    borderWidth: 1,
    borderColor: '#2E2E42',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 84,
  },
  activeClassTabCard: {
    borderColor: '#6366F1',
  },
  classTabName: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  activeTag: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  detailsScroll: {
    marginTop: 12,
    maxHeight: 320,
  },
  classHeroCard: {
    backgroundColor: '#1E1E2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E2E42',
  },
  classHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classHeroInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '800',
  },
  classTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  classLore: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  perkBox: {
    backgroundColor: '#28283D',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  perkLabel: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  perkDescription: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  requirementsBox: {
    marginTop: 14,
    backgroundColor: '#181824',
    padding: 12,
    borderRadius: 10,
  },
  requirementsTitle: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  requirementItem: {
    fontSize: 11,
    marginVertical: 2,
    fontWeight: '600',
  },
  reqMet: {
    color: '#34D399',
  },
  reqUnmet: {
    color: '#EF4444',
  },
  footer: {
    marginTop: 14,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  buttonCurrent: {
    backgroundColor: '#334155',
  },
  buttonEvolve: {
    backgroundColor: '#10B981',
  },
  buttonLocked: {
    backgroundColor: '#374151',
  },
});
