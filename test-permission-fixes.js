/* eslint-disable no-undef */
/**
 * Quick test script to verify the permission fixes are working correctly
 * This tests the three main bug fixes we implemented
 */

import { can, Permission } from './src/config/permissions.js';
import { Role, OnboardingStatus } from './src/types/index.js';

// Test users for different scenarios
const chapterOrganizer = {
  id: 'chapter-org-1',
  name: 'Chapter Organizer',
  email: 'chapter@example.com',
  role: Role.CHAPTER_ORGANISER,
  chapters: ['London'],
  organiserOf: ['London'],
  onboardingStatus: OnboardingStatus.CONFIRMED,
};

const memberUser = {
  id: 'member-1',
  name: 'Member User',
  email: 'member@example.com',
  role: Role.ACTIVIST,
  chapters: ['London'],
  onboardingStatus: OnboardingStatus.CONFIRMED,
};

const chapters = [
  { name: 'London', country: 'UK' },
  { name: 'Manchester', country: 'UK' },
];

console.log('=== Testing Permission Fixes ===\n');

// Test Bug 2 Fix: ADD_ORGANIZER_NOTE and VIEW_ORGANIZER_NOTES permissions
console.log('Bug 2 Fix - Organizer Notes Permissions:');
console.log(
  '- Chapter Organizer can view organizer notes:',
  can(chapterOrganizer, Permission.VIEW_ORGANIZER_NOTES, {
    targetUser: memberUser,
    allChapters: chapters,
  })
);
console.log(
  '- Chapter Organizer can add organizer notes:',
  can(chapterOrganizer, Permission.ADD_ORGANIZER_NOTE, {
    targetUser: memberUser,
    allChapters: chapters,
  })
);
console.log(
  '- Regular member CANNOT view organizer notes:',
  can(memberUser, Permission.VIEW_ORGANIZER_NOTES, {
    targetUser: chapterOrganizer,
    allChapters: chapters,
  })
);

console.log('\nBug 3 Fix - UI Permission Checks:');
console.log(
  '- Chapter Organizer can edit their own chapter:',
  can(chapterOrganizer, Permission.EDIT_CHAPTER, {
    chapterName: 'London',
    allChapters: chapters,
  })
);
console.log(
  '- Chapter Organizer CANNOT delete chapters (prevented in UI):',
  can(chapterOrganizer, Permission.DELETE_CHAPTER, {
    chapterName: 'London',
    allChapters: chapters,
  })
);
console.log(
  '- Regular member CANNOT edit chapters:',
  can(memberUser, Permission.EDIT_CHAPTER, {
    chapterName: 'London',
    allChapters: chapters,
  })
);

console.log('\n=== All permission tests completed ===');
