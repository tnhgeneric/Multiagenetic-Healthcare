# Frontend Merge Strategy: `frontend/` → `ExpoFE/`

## Overview
This document provides a detailed file-by-file comparison and merge strategy for consolidating features from the new `frontend/` codebase into the active `ExpoFE/` frontend application.

---

## 1. Navigation Components (High Priority - Reconcile First)

### 1.1 `app/common/BottomNavigation.tsx`
**Status:** CONFLICTING - Different navigation frameworks  
**Priority:** HIGH (affects all screen routing)

#### Key Differences:
| Aspect | ExpoFE | frontend |
|--------|--------|----------|
| Navigation library | `useNavigation` + RN Stack | `useRouter` (expo-router) |
| Routes | `navigate('Home')` | `router.push('/path')` |
| Tabs | Home, Statistics, Notification, More | Home, Notification, Chat, More |
| Role detection | None in BottomNav | Has `isDoctor` role check |
| Doctor routing | None | Has `/doctorProfile/*` routes |

#### Proposed Merge:
- **Keep:** ExpoFE's base implementation using `useRouter` (expo-router is already in use)
- **Add from frontend:**
  1. Role-aware navigation (`isDoctor` check using `AuthService.determineRoles()`)
  2. Doctor profile routes (`/doctorProfile/doctorHome`, `/doctorProfile/docnotification`, etc.)
  3. Better route constants (define route paths centrally)
  4. Event listener pattern for USER_CHANGED event
- **Action:** Create unified BottomNavigation with:
  - Patient routes (current + some new ones from frontend)
  - Doctor routes (new from frontend)
  - Role-based conditional rendering

#### Implementation Notes:
```tsx
// Pseudo-code structure
export default function BottomNavigation({ activeTab, onTabPress }: Props) {
  const router = useRouter();
  const [isDoctor, setIsDoctor] = useState(false);
  
  useEffect(() => {
    checkRole(); // Use AuthService.determineRoles() - see NOTE below
    subscribeToUserChanges(); // Listen for USER_CHANGED event
  }, []);
  
  const handleTabPress = (tabName: string) => {
    if (isDoctor) {
      routeToDoctorScreen(tabName);
    } else {
      routeToPatientScreen(tabName);
    }
  };
  // ... rest of implementation
}
```

**NOTE:** The `determineRoles()` method is referenced in `frontend/BottomNavigation.tsx` but is **not implemented** in `frontend/authService.tsx`. **ACTION REQUIRED:** Implement this method in `authService.ts` before merging. See section 7 for implementation details.

---

### 1.2 `app/common/sideNavigation.tsx`
**Status:** CONFLICTING - Different navigation structures  
**Priority:** HIGH (secondary navigation)

#### Key Differences:
| Aspect | ExpoFE | frontend |
|--------|--------|----------|
| Navigation items | 8 items (FAQs, About, Settings) | 8 items (Find Doctor, Wellness Hub, Profile) |
| Role detection | None | Has `isDoctor` with separate menu |
| Routes format | Relative (`./patientHome`) | Absolute paths for root, relative for others |
| Auth integration | Basic | Uses `AuthService.determineRoles()` |
| Event handling | None | Listens to USER_CHANGED event |

#### Proposed Merge:
- **Keep:** ExpoFE's current patient menu items
- **Add from frontend:**
  1. `isDoctor` role detection and separate doctor menu
  2. All frontend patient menu items (Find Doctor, Wellness Hub, Profile)
  3. Event listener pattern for role updates
  4. Better icon library handling
- **Remove:** FAQs, About, Settings (not in frontend, likely deprecated)
- **Action:** Merge both menus with role-based conditional rendering

#### Combined Menu Structure:
```
Patient Menu:
  - Home
  - Find a Doctor ✨ (from frontend)
  - Uploads
  - Wellness Hub ✨ (from frontend)
  - Profile ✨ (from frontend)
  - Logout

Doctor Menu:
  - Home ✨ (from frontend)
  - Profile ✨ (from frontend)
  - Logout
```

---

## 2. Chat/Agent Component

### 2.1 `app/common/AgentChat.tsx` vs `app/common/AgentView.ts`
**Status:** PARTIALLY COMPATIBLE - Different purposes  
**Priority:** MEDIUM (secondary feature)

#### Analysis:
- **ExpoFE's AgentChat.tsx:** Full chat UI component with orchestration integration
- **frontend's AgentView.ts:** Style constants only (not a component)

#### Decision:
- **Keep:** ExpoFE's AgentChat.tsx implementation (it's more complete)
- **Review:** frontend's AgentView.ts styles and integrate any visual improvements into AgentChat.tsx styles
- **No merge required** - ExpoFE version is superior

---

## 3. Authentication & User Profile

### 3.1 `app/auth/login.tsx`
**Status:** LIKELY COMPATIBLE - Similar structure  
**Priority:** MEDIUM

#### Action Items:
1. Verify both files have same Firebase integration
2. Check for password validation differences
3. Ensure error messaging is consistent
4. **Recommendation:** Compare side-by-side, keep ExpoFE version (seems to be production)

### 3.2 `app/auth/patientAuth/` (ExpoFE) vs `app/auth/Auth/` (frontend)
**Status:** DIFFERENT STRUCTURES  
**Priority:** LOW

- Frontend has more modular auth flow
- ExpoFE has working auth in login.tsx
- **Action:** Review if frontend's modularity improves code organization; if so, refactor later as non-urgent improvement

### 3.3 Patient Profile Pages
**Status:** MIXED - frontend has additional features  
**Priority:** MEDIUM-LOW

#### Key Differences:
| Page | ExpoFE | frontend |
|------|--------|----------|
| activemedications.tsx | ✅ Exists | ✅ Exists |
| labresults.tsx | ✅ Exists | ❌ (in labReports/) |
| viewhistory.tsx | ✅ Exists | ❌ (in viewHistory/) |
| updateProfile.tsx | ❌ Missing | ✅ Exists ✨ |
| notification.tsx | ✅ Exists | ✅ Exists (with styles) |
| patientHome.tsx | ✅ Exists | ✅ Exists |
| statistics.tsx | ✅ Exists | ✅ Exists |

#### Action Plan:
1. Copy `frontend/app/patientProfile/updateProfile.tsx` to ExpoFE ✨
2. Compare labresults and viewhistory; merge if frontend has improvements
3. Review notification.tsx style differences
4. Check patientHome and statistics for new features

---

## 4. Services Layer

### 4.1 Services Status
**ExpoFE/services/:**
- ✅ `authService.tsx` - exists
- ✅ `chatService.ts` - created in earlier merge (from frontend)
- ✅ `predictionService.ts` - created in earlier merge (from frontend)
- ✅ `backendApi.ts` - exists (orchestration calls)

**frontend/services/:**
- ✅ `chatService.ts` - source of our earlier copy
- ✅ `predictionService.ts` - source of our earlier copy
- ✅ `authService.ts` - compare with ExpoFE

#### Status: MOSTLY MERGED ✅
- **Action:** Compare `authService` implementations; ensure both have `determineRoles()` method

---

## 5. Assets & Constants

### 5.1 Assets
**Status:** To be determined  
**Action:** 
1. Check ExpoFE/assets/ for missing resources from frontend/assets/
2. Copy any new icons/images
3. Priority: LOW

### 5.2 Constants
**Status:** To be determined  
**Action:**
1. Check ExpoFE/constants/ vs frontend/constants/
2. Merge or create unified constants file
3. Priority: MEDIUM

---

## 6. Hooks & Utils

**Status:** To be determined  
**Action:**
1. List files in both ExpoFE/hooks/ and frontend/hooks/
2. List files in both ExpoFE/utils/ and frontend/utils/
3. Identify new/improved utilities
4. Copy non-overlapping files
5. Merge improvements to overlapping files

---

## 7. Config Files

### 7.1 app.json, package.json, tsconfig.json
**Status:** CRITICAL - Must preserve ExpoFE working state  
**Action:**
1. ✅ Keep ExpoFE versions (already verified working)
2. ❌ Do NOT overwrite with frontend versions
3. Review frontend versions for new dependencies (if any)
4. **Priority:** HIGHEST - preserve working build config

---

## Merge Execution Plan

### Phase 1: High-Risk Navigation Merge (TODAY)
1. **BottomNavigation.tsx** → Merge role detection + doctor routes
2. **sideNavigation.tsx** → Merge patient/doctor menu items + role detection
3. **Test:** Verify tab switching and menu navigation work

### Phase 2: Medium-Risk Features (THIS WEEK)
1. **Copy** updateProfile.tsx from frontend → ExpoFE
2. **Merge** notification.tsx (if frontend has style improvements)
3. **Copy** remaining new patient profile pages
4. **Merge** authService.ts (check for determineRoles() method)

### Phase 3: Low-Risk Assets & Utils (NEXT WEEK)
1. **Copy** new assets from frontend/assets
2. **Copy** new constants from frontend/constants
3. **Merge** hooks and utils (non-breaking additions)
4. **Review** doctor profile pages (new feature)

### Phase 4: Validation & Testing
1. Run TypeScript type check: `npx expo start -c`
2. Run ESLint: `npm run lint`
3. Manual smoke tests on emulator/device
4. Test all navigation flows
5. Test patient journey feature end-to-end

---

## 7. Missing Implementation: `determineRoles()` Method

### Issue
The `frontend/app/common/BottomNavigation.tsx` calls `AuthService.determineRoles(uid)` but this method is **not implemented** in the authService.

### Required Implementation
Add this method to `ExpoFE/services/authService.tsx`:

```typescript
/**
 * Determine user roles based on Firestore collection.
 * Checks if user has a document in the 'Doctor' collection (=> isDoctor=true)
 * or only in the 'Patient' collection (=> isDoctor=false).
 * 
 * @param uid User UID from Firebase Auth
 * @returns Promise with roles object { isDoctor: boolean }
 */
async determineRoles(uid: string): Promise<{ isDoctor: boolean; isPatient?: boolean }> {
  try {
    if (!uid) {
      console.warn('determineRoles: No UID provided');
      return { isDoctor: false, isPatient: false };
    }

    // Check if user exists in Doctor collection
    const doctorDoc = await db.collection('Doctor').doc(uid).get();
    if (doctorDoc.exists) {
      return { isDoctor: true, isPatient: false };
    }

    // Check if user exists in Patient collection
    const patientDoc = await db.collection('Patient').doc(uid).get();
    if (patientDoc.exists) {
      return { isDoctor: false, isPatient: true };
    }

    // User not found in either collection
    console.warn(`determineRoles: User ${uid} not found in Doctor or Patient collections`);
    return { isDoctor: false, isPatient: false };
  } catch (error: any) {
    console.error('determineRoles: Error determining user roles:', error);
    return { isDoctor: false, isPatient: false };
  }
}
```

### Integration Steps
1. Add this method to `ExpoFE/services/authService.tsx`
2. Export it as part of the AuthService class
3. After adding, BottomNavigation and sideNavigation role checks will work

### Firestore Structure Assumption
This implementation assumes:
- Users who are doctors have a document in `/Doctor/{uid}`
- Users who are patients have a document in `/Patient/{uid}`
- A user cannot be both simultaneously (first checks Doctor, then Patient)

---

## Risk Mitigation

### Backup Strategy
- ✅ Current ExpoFE state is working (baseline)
- 📋 Create git branch before major merges
- 📋 Commit after each phase
- 📋 Test immediately after each change

### Rollback Plan
- If BottomNavigation breaks: revert to ExpoFE version, merge more conservatively
- If TypeScript fails: check imports and type definitions
- If Expo won't start: verify firebase config and metro bundler

### Testing Checklist
- [ ] Expo starts without errors
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes
- [ ] Bottom navigation tabs work
- [ ] Side navigation menu opens
- [ ] Patient journey chat works
- [ ] Doctor routes work (if accessed)
- [ ] User can logout

---

## Success Criteria

✅ All features from frontend/ integrated into ExpoFE/  
✅ No TypeScript errors  
✅ No runtime crashes on startup  
✅ All navigation flows functional  
✅ Patient journey feature works  
✅ Chat/orchestration integration intact  
✅ No git conflicts in production code  

---

## Files to Create/Merge Summary

| Action | File Path | Status |
|--------|-----------|--------|
| Merge | app/common/BottomNavigation.tsx | 🟡 HIGH PRIORITY |
| Merge | app/common/sideNavigation.tsx | 🟡 HIGH PRIORITY |
| Copy | app/patientProfile/updateProfile.tsx | 🟢 NEW |
| Review | app/patientProfile/notification.tsx | 🟡 COMPARE |
| Copy | assets/* (new files) | 🟢 NEW |
| Merge | services/authService.tsx | 🟡 CHECK METHODS |
| Copy | constants/* (new files) | 🟢 NEW |
| Copy | hooks/* (new files) | 🟢 NEW |
| Copy | utils/* (new files) | 🟢 NEW |

---

## Next Steps

1. **Approve** this merge strategy
2. **Review** the specific file diffs I'll provide in follow-up
3. **Execute** Phase 1 merges (BottomNavigation + sideNavigation)
4. **Test** Expo startup and navigation
5. **Proceed** to Phase 2-4 if Phase 1 successful

