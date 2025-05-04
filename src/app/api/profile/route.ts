/**
 * Profile API Endpoint
 * 
 * Handles create, read, update operations for student profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  saveProfile, 
  getProfile, 
  saveDraft,
  listProfiles,
  archiveProfile, 
  StoredProfile 
} from '@/services/profile';
import { StudentProfile } from '@/components/StudentQuestionnaire';

// GET /api/profile - Get profile by ID or list profiles
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const counselorId = searchParams.get('counselorId');
    const status = searchParams.get('status') as 'active' | 'archived' | 'draft' | null;
    
    // Get specific profile
    if (id || userId) {
      const profile = await getProfile({ 
        id: id || undefined, 
        userId: userId || undefined 
      });
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(profile);
    }
    
    // List profiles with optional filtering
    const profiles = await listProfiles({
      counselorId: counselorId || undefined,
      status: status || undefined
    });
    
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, userId, counselorId, status, currentStep } = body;
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }
    
    // Create/update the profile
    const savedProfile = await saveProfile(profile, {
      userId,
      counselorId,
      status,
      currentStep
    });
    
    return NextResponse.json(savedProfile);
  } catch (error) {
    console.error('Error in profile POST:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// PUT /api/profile/draft - Save partial profile as draft
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { partialProfile, currentStep, userId } = body;
    
    if (!partialProfile || currentStep === undefined) {
      return NextResponse.json(
        { error: 'Partial profile and current step are required' },
        { status: 400 }
      );
    }
    
    // Save as draft
    const savedDraft = await saveDraft(partialProfile, currentStep, userId);
    
    return NextResponse.json(savedDraft);
  } catch (error) {
    console.error('Error in profile PUT:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/:id - Archive profile
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }
    
    const archivedProfile = await archiveProfile(id);
    
    if (!archivedProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, profile: archivedProfile });
  } catch (error) {
    console.error('Error in profile DELETE:', error);
    return NextResponse.json(
      { error: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 