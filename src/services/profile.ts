import { StudentProfile } from '@/components/StudentQuestionnaire';

// Extended version of StudentProfile with additional metadata
export interface StoredProfile extends Omit<StudentProfile, 'progress'> {
  id: string;
  userId?: string;  // For multi-user support
  counselorId?: string; // For counselor assignment
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft';
  completedAt?: string;
  profileVersion: number;
  progress?: {
    currentStep: number;
    lastInteraction: string;
  };
}

// This will be replaced with an actual database implementation
// For now we'll use a mock implementation
let profilesDB: StoredProfile[] = [];

/**
 * Save a student profile to the database
 * In a production environment, this would connect to a real database
 */
export async function saveProfile(
  profile: StudentProfile, 
  options: { 
    userId?: string, 
    counselorId?: string,
    status?: 'active' | 'archived' | 'draft',
    currentStep?: number
  } = {}
): Promise<StoredProfile> {
  // Check if this is an update to an existing profile
  const existingProfile = options.userId ? 
    profilesDB.find(p => p.userId === options.userId) : 
    undefined;

  const timestamp = new Date().toISOString();
  
  const storedProfile: StoredProfile = {
    ...profile,
    id: existingProfile?.id || `profile_${Date.now()}`,
    userId: options.userId || existingProfile?.userId,
    counselorId: options.counselorId || existingProfile?.counselorId,
    createdAt: existingProfile?.createdAt || timestamp,
    updatedAt: timestamp,
    status: options.status || existingProfile?.status || 'active',
    profileVersion: (existingProfile?.profileVersion || 0) + 1,
    progress: options.currentStep !== undefined ? {
      currentStep: options.currentStep,
      lastInteraction: timestamp
    } : existingProfile?.progress
  };

  if (options.status === 'active' && !existingProfile?.completedAt) {
    storedProfile.completedAt = timestamp;
  }

  // If updating, replace the existing profile
  if (existingProfile) {
    profilesDB = profilesDB.map(p => 
      p.id === existingProfile.id ? storedProfile : p
    );
  } else {
    // Otherwise add as new profile
    profilesDB.push(storedProfile);
  }

  console.log(`Profile ${existingProfile ? 'updated' : 'created'}:`, storedProfile.id);
  return storedProfile;
}

/**
 * Get a profile by ID or user ID
 */
export async function getProfile(
  identifier: { id?: string, userId?: string }
): Promise<StoredProfile | null> {
  if (!identifier.id && !identifier.userId) {
    throw new Error('Either id or userId must be provided');
  }

  const profile = profilesDB.find(p => 
    (identifier.id && p.id === identifier.id) || 
    (identifier.userId && p.userId === identifier.userId)
  );

  return profile || null;
}

/**
 * List profiles with optional filtering
 */
export async function listProfiles(
  filters: {
    counselorId?: string;
    status?: 'active' | 'archived' | 'draft';
  } = {}
): Promise<StoredProfile[]> {
  let filtered = [...profilesDB];
  
  if (filters.counselorId) {
    filtered = filtered.filter(p => p.counselorId === filters.counselorId);
  }
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  return filtered;
}

/**
 * Save a partial profile as a draft
 */
export async function saveDraft(
  partialProfile: Partial<StudentProfile>,
  currentStep: number,
  userId?: string
): Promise<StoredProfile> {
  // Create a complete profile with empty strings for missing fields
  const emptyProfile: StudentProfile = {
    name: '',
    gradeLevel: '',
    intendedMajor: '',
    currentActivities: '',
    interestedActivities: '',
    satScore: '',
    additionalInfo: ''
  };
  
  const completeProfile = {
    ...emptyProfile,
    ...partialProfile
  } as StudentProfile;
  
  return saveProfile(completeProfile, {
    userId,
    status: 'draft',
    currentStep
  });
}

/**
 * Archive a profile
 */
export async function archiveProfile(profileId: string): Promise<StoredProfile | null> {
  const existingProfile = profilesDB.find(p => p.id === profileId);
  
  if (!existingProfile) {
    return null;
  }
  
  // Convert to StudentProfile for saveProfile
  const studentProfile: StudentProfile = {
    name: existingProfile.name,
    gradeLevel: existingProfile.gradeLevel,
    intendedMajor: existingProfile.intendedMajor,
    currentActivities: existingProfile.currentActivities,
    interestedActivities: existingProfile.interestedActivities,
    satScore: existingProfile.satScore,
    additionalInfo: existingProfile.additionalInfo
  };
  
  return saveProfile(studentProfile, { 
    userId: existingProfile.userId,
    counselorId: existingProfile.counselorId,
    status: 'archived' 
  });
} 