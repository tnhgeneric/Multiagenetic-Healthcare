# Phase 5.2: Features Merge - Execution Plan

**Date**: November 16, 2025  
**Status**: Ready for execution  
**Duration**: Estimated 2-3 hours  

---

## 🎯 Phase 5.2 Objectives

Merge medium-risk features from `frontend/` into `ExpoFE/`:
1. Verify/copy updateProfile.tsx 
2. Review notification.tsx for improvements
3. Copy any new patient profile pages
4. Verify authService integration
5. Validate all changes

---

## ✅ Task 1: updateProfile.tsx Status

### Current Status
**Location**: `ExpoFE/app/patientProfile/updateProfile.tsx`  
**Status**: ✅ ALREADY EXISTS & FIXED  
**Recent fixes**: Commit `45bf49b` - Fixed conditional style errors

### What It Does
- Patient profile update form
- Form fields: Full Name, Date of Birth, Phone, etc.
- Firestore integration for data persistence
- Validation and error messages
- Conditional styling for errors

### TypeScript Validation
```
✅ updateProfile.tsx - 0 errors
```

### Conclusion
**Task 1: COMPLETE** - File already in ExpoFE with latest fixes ✅

---

## ⏳ Task 2: notification.tsx Merge

### Files to Compare
- **ExpoFE**: `ExpoFE/app/patientProfile/notification.tsx`
- **Frontend**: `frontend/app/patientProfile/notification.tsx`

### Action Required
1. Review both files for differences
2. Check if frontend has:
   - Better styling?
   - Additional features?
   - Improved Firestore integration?
3. If improvements found: merge changes
4. If same: keep ExpoFE version

### Start by reading current ExpoFE version
Let's check the current notification.tsx to see if it needs updates from frontend.

---

## 🔄 Task 3: New Patient Profile Pages

### Pages to Check From Frontend
1. `frontend/app/patientProfile/more/`
   - doctorSearch.tsx
   - uploads.tsx
   - healthtips.tsx
   - profilePage.tsx

2. `frontend/app/patientProfile/`
   - Any new pages not in ExpoFE

### Action Required
1. List new pages in frontend not in ExpoFE
2. Copy new pages to ExpoFE
3. Verify routes work
4. Test navigation

### Note
ExpoFE sideNavigation already references these routes:
- `../../../patientProfile/more/doctorSearch/doctorSearch`
- `../../../patientProfile/more/patientProfilee/uploads`
- `../../../patientProfile/more/patientProfilee/healthtips`
- `../../../patientProfile/more/patientProfilee/profilePage`

So these files may already exist or routes need adjustment.

---

## 🔐 Task 4: authService Integration Verification

### Current Status
**Location**: `ExpoFE/services/authService.tsx`

### Verification Checklist
- ✅ determineRoles() method exists
- ✅ Firebase auth integration
- ✅ User data persistence in Firestore
- ✅ Error handling

### Action Required
1. Compare ExpoFE's authService with frontend's
2. Identify missing methods (if any)
3. Merge improvements (if found)

---

## 📋 Phase 5.2 Execution Steps

### Step 1: Verify updateProfile.tsx ✅
**Status**: Already done - file is complete and fixed

### Step 2: Check notification.tsx
**Next Action**: Read current ExpoFE version to see if frontend has improvements

### Step 3: Verify new pages exist
**Next Action**: Check if referenced routes point to existing files

### Step 4: Validate authService
**Next Action**: Compare with frontend version for missing methods

### Step 5: Test navigation
**Next Action**: Verify all routes work after merge

### Step 6: Run validation
**Next Action**: TypeScript check, ESLint, Expo test

### Step 7: Commit changes
**Next Action**: Create git commit with merged files

---

## 🚀 What Comes Next

### Immediate (Next 30 minutes):
1. Start Task 2: Review notification.tsx
2. Check for style/feature improvements in frontend
3. Merge if improvements found

### Short-term (Next 1-2 hours):
1. Verify new patient profile pages exist
2. Check file structure matches routes
3. Copy missing pages if needed

### Before Phase 5.3:
1. Run full validation
2. Test navigation flows
3. Commit all changes

---

## ⚡ Ready to Begin?

**Next immediate action**: Read frontend/notification.tsx and compare with ExpoFE version

Proceed? (Y/N)

---

## 📊 Phase 5 Progress

```
Phase 5.1: Navigation Merge         ████████████████████ 100% ✅
Phase 5.2: Features Merge           ░░░░░░░░░░░░░░░░░░░░  0%  ⏳ (CURRENT)
Phase 5.3: Assets & Utils           ░░░░░░░░░░░░░░░░░░░░  0%
Phase 5.4: Validation & Testing     ░░░░░░░░░░░░░░░░░░░░  0%
─────────────────────────────────────────────────────────────
Overall Phase 5                     ████████░░░░░░░░░░░░ 25%  🚀
```
