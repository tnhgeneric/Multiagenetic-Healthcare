import { StyleSheet } from 'react-native';

// Colors
const COLORS = {
  primary: '#2196F3',
  primaryLight: '#E3F2FD',
  secondary: '#FF9800',
  secondaryLight: '#FFE0B2',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  dark: '#212121',
  darkSecondary: '#757575',
  lightGray: '#F5F5F5',
  border: '#E0E0E0',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Fonts
const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
};

const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Spacing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

// Border radius
const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

// ============ DASHBOARD STYLES ============

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  headerTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },

  headerSubtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    opacity: 0.9,
  },

  content: {
    flex: 1,
    padding: SPACING.md,
  },

  scrollContent: {
    paddingBottom: SPACING.lg,
  },

  // Summary Cards
  summaryContainer: {
    marginBottom: SPACING.lg,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },

  summaryCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  summaryCardLarge: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  summaryNumber: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginVertical: SPACING.sm,
  },

  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkSecondary,
    textAlign: 'center',
  },

  // Tab Navigation
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: COLORS.primary,
  },

  tabLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.darkSecondary,
  },

  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Loading & Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.darkSecondary,
  },

  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.darkSecondary,
    marginBottom: SPACING.md,
  },

  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkSecondary,
    opacity: 0.7,
  },

  // Error Message
  errorContainer: {
    backgroundColor: COLORS.danger,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },

  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

// ============ APPOINTMENTS LIST STYLES ============

export const appointmentsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },

  filterContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },

  filterLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },

  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },

  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.dark,
    fontWeight: FONT_WEIGHTS.medium,
  },

  filterButtonTextActive: {
    color: COLORS.white,
  },

  appointmentCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  appointmentCardContent: {
    flex: 1,
  },

  appointmentTime: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },

  appointmentPatient: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.dark,
    marginVertical: SPACING.xs,
  },

  appointmentReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkSecondary,
    marginVertical: SPACING.xs,
  },

  appointmentStatusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },

  appointmentStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },

  statusScheduled: {
    backgroundColor: COLORS.primary,
  },

  statusCompleted: {
    backgroundColor: COLORS.success,
  },

  statusCancelled: {
    backgroundColor: COLORS.danger,
  },

  statusInProgress: {
    backgroundColor: COLORS.warning,
  },

  appointmentAction: {
    justifyContent: 'center',
    gap: SPACING.sm,
  },

  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});

// ============ PATIENTS LIST STYLES ============

export const patientsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },

  searchContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  searchInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.base,
    color: COLORS.dark,
  },

  patientCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  patientAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },

  patientInfo: {
    flex: 1,
  },

  patientName: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.dark,
  },

  patientEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkSecondary,
    marginVertical: SPACING.xs,
  },

  patientLastVisit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.darkSecondary,
  },

  patientActionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  patientActionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.white,
  },
});

// ============ PROFILE STYLES ============

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },

  headerSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.white,
  },

  profileImageText: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },

  profileName: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },

  profileSpecialization: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    opacity: 0.9,
  },

  profileContent: {
    padding: SPACING.lg,
  },

  section: {
    marginBottom: SPACING.lg,
  },

  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },

  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },

  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.dark,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },

  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },

  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

// ============ MODAL STYLES ============

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.dark,
  },

  closeButton: {
    padding: SPACING.sm,
  },

  modalContent: {
    gap: SPACING.md,
  },

  modalButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },

  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },

  modalButtonSecondary: {
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modalButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },

  modalButtonTextSecondary: {
    color: COLORS.dark,
  },
});

// Export color palette for use in components
export const colors = COLORS;
export const fontSizes = FONT_SIZES;
export const fontWeights = FONT_WEIGHTS;
export const spacing = SPACING;
export const borderRadius = BORDER_RADIUS;
