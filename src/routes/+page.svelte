<script lang="ts">
    import { user } from '$lib/stores/user';
    import { profileRecord } from '$lib/stores/profileRecord';
    import { fetchTophhieSocialProfile, initialiseTophhieSocialProfile, updateTophhieSocialProfile } from '$lib/auth/oauth';
    import { type TophhieSocialProfile } from '$lib/stores/profile';
    import { onMount } from 'svelte';

    var marketingEmails: boolean = true;
    var accessibilityScoring: boolean = true;
    var showOnHomepage: boolean = true;

    var errorMessage: string = '';
    var saveSuccess: boolean = false;

    onMount(async () => {
        const [profile] = await Promise.all([fetchTophhieSocialProfile()]);
        if (!profile) {
            initialiseTophhieSocialProfile();
            return;
        }
        updateForm();
        console.log('Fetched profile in +page.svelte:', profile);
    });

    function updateForm() {
        if (!$profileRecord) {
            errorMessage = 'Profile record is not loaded.';
            return;
        }
        marketingEmails = $profileRecord.communicationPreferences?.marketing ?? true;
        accessibilityScoring = $profileRecord.pdsPreferences?.accessibilityScoring ?? true;
        showOnHomepage = $profileRecord.pdsPreferences?.showOnHomepage ?? true;
    }

    function buildProfileUpdate() {
        if (!$profileRecord) {
            errorMessage = 'Profile record is not loaded.';
            throw new Error(errorMessage);
        }
        const updatedProfile: TophhieSocialProfile = {
            $type: 'social.tophhie.profile',
            createdAt: $profileRecord.createdAt,
            updatedAt: new Date().toISOString(),
            pdsPreferences: {
                accessibilityScoring: accessibilityScoring,
                showOnHomepage: showOnHomepage
            },
            communicationPreferences: {
                marketing: marketingEmails
            }
        };
        return updatedProfile;
    }

    async function updateProfile() {
        const updatedProfile = buildProfileUpdate();
        console.log('Updating profile to:', updatedProfile);
        try {
            await updateTophhieSocialProfile(updatedProfile);
            saveSuccess = true;
            errorMessage = '';
            setTimeout(() => {
                saveSuccess = false;
            }, 3000);
        } catch (error) {
            errorMessage = 'Failed to update profile: ' + error;
            saveSuccess = false;
        }
    }
</script>

<div class="p-1 tracking-tight gap-5 flex flex-col">
    {#if saveSuccess}
    <div class="w-full rounded-lg bg-green-100 text-green-700 text-lg grid place-items-center p-4">
        <p class="font-medium">Profile updated successfully!</p>
    </div>
    {/if}
    {#if errorMessage}
    <div class="w-full rounded-lg bg-red-100 text-red-700 text-lg grid place-items-center p-4">
        <p class="font-medium">Error: {errorMessage}</p>
    </div>
    {/if}
    {#if $user}
    <div class="w-full rounded-lg bg-indigo-100 text-indigo-700 text-lg grid place-items-center p-4">
        <p class="font-medium">Welcome, {$user.repo?.handle ?? 'User'}!</p>
        <p>Below you'll find your profile information and settings, relating to your usage of Tophhie Social.</p>
    </div>
    <div class="w-full rounded-lg bg-gray-100 text-indigo-700 text-md grid p-4">
        <p><span class="font-medium">Account DID:</span> {$user.did}</p>
        <p><span class="font-medium">Account Handle:</span> {$user.repo?.handle}</p>
        <p><span class="font-medium">Number of Collections:</span> {$user.repo?.collections.length}</p>
    </div>
    <div class="w-full rounded-lg bg-gray-100 text-indigo-700 text-md grid p-4">
        <p><span class="font-medium ">PDS Preferences</span></p>
        <label>
            <input type="checkbox" class="mr-2" bind:checked={accessibilityScoring}/>
            Participate in Accessibility Scoring
        </label>
        <label>
            <input type="checkbox" class="mr-2" bind:checked={showOnHomepage}/>
            Show on Tophhie Social Homepage
        </label>
    </div>
    <div class="w-full rounded-lg bg-gray-100 text-indigo-700 text-md grid p-4">
        <p><span class="font-medium ">Communication Preferences</span></p>
        <label>
            <input type="checkbox" class="mr-2" bind:checked={marketingEmails}/>
            Subscribe to marketing notifications
        </label>
    </div>
    <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" style="cursor: pointer" onclick={updateProfile}>Update Profile</button>
    {:else}
    <p class="text-center text-xl">Enter your atproto username above and click login.</p>
    {/if}
</div>